// La génétique : génomes, croisements de plantes et d'animaux, variétés et races fixées, Salon et commandes de chef.
//
// Un génome : { t: { trait: [[v, d], [v, d]] }, l: { size|color|pattern: [[i, d], [i, d]] }, form, halo }
//   chaque gène a deux versions (allèles) : une valeur (0 à 5, ou un numéro d'apparence) et une dominance (1 ou 0).
//   Le caractère visible : la version dominante, ou la moyenne des deux si elles sont toutes deux dominantes ou récessives.
// Une variété (plantes) : { id, kind: 'plant', base, name, g, gen, fixed, analyzed, born }
//   ses graines (genetics.seeds[id]) se sèment ; ses produits (genetics.stock[id]) font partie du stock de l'espèce.
// Une bête porte son génome (a.g), sa génération (a.gen) et sa race fixée (a.race).
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { fmt, pickRand } from '../core/format.js';
import { emit, toast, sfx, buzz, burst, float, changed } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { ANIMALS } from '../data/animals.js';
import { RECIPES } from '../data/machines.js';
import { FLAVORS, PLANT_BASE, ANIMAL_BASE, PLANT_TRAITS, ANIMAL_TRAITS, LOOKS, GENETICS as GX, SALON_CRITERIA, SALON_PERIOD } from '../data/genetics.js';
import { RARE } from '../data/commerce.js';
import { spend, earn, addXp } from './player.js';
import { projectDone, storyOk } from './story.js';
import { isAdult, newAnimal } from './animals.js';
import { placeAnimal, herdFull } from './pastures.js';
import { unitPrice } from './market.js';
import { tip } from './tips.js';

export const FLAVOR_IDS = PLANT_TRAITS.filter(t => t.flavor).map(t => t.id);
export const PLANT_IDS = PLANT_TRAITS.map(t => t.id);
export const ANIMAL_IDS = ANIMAL_TRAITS.map(t => t.id);
const LOOK_IDS = Object.keys(LOOKS);

// ---------------- ouverture ----------------
export const plantLabOpen = () => projectDone(GX.plantProject);
export const breedOpen = () => projectDone(GX.animalProject);
export const labOpen = () => projectDone(GX.labProject);
export const seedbankOpen = () => projectDone(GX.seedbankProject);
export const salonOpen = () => projectDone(GX.salonProject);
export const geneticsOpen = () => plantLabOpen() || breedOpen();
export const isPlant = id => ITEMS[id] && (ITEMS[id].type === 'crop' || ITEMS[id].type === 'tree') && FLAVORS[id];

export function ensureGenetics() {
    const G = (state.genetics = state.genetics || {});
    G.next = G.next || 1;
    G.vars = G.vars || {};
    G.seeds = G.seeds || {};
    G.stock = G.stock || {};
    G.races = G.races || {};
    if (G.bestFirst === undefined) G.bestFirst = true;
    state.animals.forEach(a => {
        if (!a.uid) a.uid = 'a' + G.next++;
        if (!a.g) a.g = wildAnimal(a.type, true);
        a.gen = a.gen || 0;
    });
}

// ---------------- génomes ----------------
const pair = (v, d = 1) => [
    [v, d],
    [v, d],
];
const clamp5 = v => Math.max(0, Math.min(5, v));
const baseLooks = () => ({ size: pair(1), color: pair(0), pattern: pair(0) });

// le génome sauvage d'une plante : ses saveurs de base, sans surprise
export function wildPlant(id) {
    const f = FLAVORS[id] || [0, 0, 0, 0, 0];
    const t = {};
    FLAVOR_IDS.forEach((k, j) => (t[k] = pair(f[j])));
    Object.entries(PLANT_BASE).forEach(([k, v]) => (t[k] = pair(v)));
    return { t, l: baseLooks(), form: id, halo: false };
}

// le génome d'une bête : ses caractères de base, avec un peu de variété chez les bêtes déjà là
export function wildAnimal(type, vary) {
    const b = ANIMAL_BASE[type] || [2, 2, 2, 2, 2, 2, 2];
    const t = {};
    ANIMAL_IDS.forEach((k, j) => {
        const v = b[j];
        if (!vary) return (t[k] = pair(v));
        const alt = Math.random() < 0.35 ? clamp5(v + (Math.random() < 0.5 ? -1 : 1)) : v;
        t[k] = [
            [v, 1],
            [alt, Math.random() < 0.5 ? 1 : 0],
        ];
    });
    const l = baseLooks();
    if (vary && Math.random() < 0.25) l.color = [l.color[0], [1 + Math.floor(Math.random() * 6), 0]];
    if (vary && Math.random() < 0.2) l.pattern = [l.pattern[0], [1 + Math.floor(Math.random() * 4), 0]];
    return { t, l, halo: false };
}

// le caractère visible d'un gène
export const express = p => (p[0][1] !== p[1][1] ? (p[0][1] ? p[0][0] : p[1][0]) : Math.round((p[0][0] + p[1][0]) / 2));
export const expressLook = p => (p[0][1] !== p[1][1] ? (p[0][1] ? p[0][0] : p[1][0]) : Math.max(p[0][0], p[1][0]));
export const traitOf = (g, k) => (g.t[k] ? express(g.t[k]) : 0);
export const looksOf = g => ({ size: expressLook(g.l.size), color: expressLook(g.l.color), pattern: expressLook(g.l.pattern), halo: !!g.halo });
export const homozygous = p => p[0][0] === p[1][0];
// part des gènes « fixés » (deux versions identiques)
export function stability(g) {
    const genes = Object.values(g.t);
    return genes.filter(homozygous).length / genes.length;
}

// gain de saveur d'une plante sur son espèce de forme (toutes saveurs, ou celles demandées)
export function flavorGain(g, keys = FLAVOR_IDS) {
    const base = FLAVORS[g.form] || [0, 0, 0, 0, 0];
    return keys.reduce((a, k) => a + Math.max(0, traitOf(g, k) - base[FLAVOR_IDS.indexOf(k)]), 0);
}

// ---------------- croisement ----------------
const pick = p => p[Math.random() < 0.5 ? 0 : 1].slice();

export function crossGenomes(A, B, rate = GX.mutation) {
    const t = {},
        l = {};
    for (const k of Object.keys(A.t)) t[k] = [pick(A.t[k]), pick(B.t[k] || A.t[k])];
    for (const k of LOOK_IDS) l[k] = [pick(A.l[k]), pick(B.l[k])];
    const child = {
        t,
        l,
        form: A.form === B.form ? A.form : Math.random() < 0.5 ? A.form : B.form,
        halo: (A.halo && Math.random() < 0.5) || (B.halo && Math.random() < 0.5),
    };
    let mutated = false;
    if (Math.random() < rate) {
        mutated = true;
        if (Math.random() < 0.2) child.halo = true;
        else if (Math.random() < 0.35) {
            const k = pickRand(LOOK_IDS);
            child.l[k][Math.random() < 0.5 ? 0 : 1] = [Math.floor(Math.random() * LOOKS[k].length), Math.random() < 0.5 ? 1 : 0];
        } else {
            const k = pickRand(Object.keys(t));
            const j = Math.random() < 0.5 ? 0 : 1;
            t[k][j] = [clamp5(t[k][j][0] + (Math.random() < 0.75 ? 1 + Math.floor(Math.random() * 2) : -1)), Math.random() < 0.5 ? 1 : 0];
        }
    }
    return { g: child, mutated };
}

const mutationRate = () => (projectDone(GX.hiveProject) ? GX.mutationHive : GX.mutation);
const sameSpecies = (A, B) => A.form === B.form;
export const sterileChance = (A, B) => (sameSpecies(A, B) ? GX.sterileSame : GX.sterileCross);

// les issues possibles d'un croisement, estimées par tirage : chances et fourchettes de chaque caractère
export function crossPreview(A, B, kind = 'plant', n = 300) {
    const keys = kind === 'plant' ? PLANT_IDS : ANIMAL_IDS;
    const range = Object.fromEntries(keys.map(k => [k, [9, -1]]));
    let mut = 0,
        back = 0,
        better = 0;
    const forms = {};
    const sig = g => keys.map(k => traitOf(g, k)).join('');
    const sa = sig(A),
        sb = sig(B);
    const goal = g => keys.filter(k => (kind === 'plant' ? FLAVOR_IDS.includes(k) : true)).reduce((x, k) => x + traitOf(g, k), 0);
    const best = Math.max(goal(A), goal(B));
    for (let j = 0; j < n; j++) {
        const { g, mutated } = crossGenomes(A, B, mutationRate());
        if (mutated) mut++;
        const s = sig(g);
        if (s === sa || s === sb) back++;
        if (goal(g) > best) better++;
        forms[g.form] = (forms[g.form] || 0) + 1;
        keys.forEach(k => {
            const v = traitOf(g, k);
            range[k][0] = Math.min(range[k][0], v);
            range[k][1] = Math.max(range[k][1], v);
        });
    }
    const sterile = kind === 'plant' ? sterileChance(A, B) : 0;
    return {
        sterile,
        mutation: mut / n,
        back: (back / n) * (1 - sterile),
        better: (better / n) * (1 - sterile),
        hybrid: (1 - back / n) * (1 - sterile),
        range,
        forms: Object.fromEntries(Object.entries(forms).map(([k, v]) => [k, v / n])),
    };
}

// ---------------- variétés de plantes ----------------
export const varieties = () => Object.values(state.genetics.vars);
export const variety = id => state.genetics.vars[id];
export const openVarieties = () => varieties().filter(v => !v.fixed);
export const fixedVarieties = () => varieties().filter(v => v.fixed);
export const varName = v => v.name || v.auto;

// un nom tout trouvé pour un hybride : le début d'une espèce et la fin de l'autre (Fraipiment)
function hybridName(a, b) {
    const na = ITEMS[a].name.split(' ')[0],
        nb = ITEMS[b].name.split(' ')[0].toLowerCase();
    if (a === b) return `${na} n°${state.genetics.next}`;
    const cut = s => s.slice(0, Math.max(3, Math.ceil(s.length / 2)));
    return cut(na) + nb.slice(Math.floor(nb.length / 2));
}

// un parent : une espèce sauvage (id d'objet) ou une variété (id de variété)
export function parentGenome(p) {
    if (state.genetics.vars[p]) return state.genetics.vars[p].g;
    return isPlant(p) ? wildPlant(p) : null;
}
export const parentBase = p => (state.genetics.vars[p] ? state.genetics.vars[p].g.form : p);
export const parentName = p => (state.genetics.vars[p] ? varName(state.genetics.vars[p]) : ITEMS[p] ? `${ITEMS[p].name} (sauvage)` : '?');
export const parentGen = p => (state.genetics.vars[p] ? state.genetics.vars[p].gen : 0);
export const plantParents = () => {
    const wild = Object.keys(FLAVORS).filter(id => ITEMS[id] && ITEMS[id].type === 'crop' && state.level >= ITEMS[id].reqLvl && storyOk(ITEMS[id]));
    return [...varieties().map(v => v.id), ...wild];
};
export const crossCost = () => GX.crossCost(state.level);
export const breedCost = () => GX.breedCost(state.level);
export const analyzeCost = () => GX.analyzeCost(state.level);

// lancer une pollinisation (au labo) : elle prend un peu de temps
export function startCross(a, b, at) {
    const G = state.genetics;
    if (!plantLabOpen() || G.cross) return false;
    const A = parentGenome(a),
        B = parentGenome(b);
    if (!A || !B) return false;
    if (openVarieties().length >= GX.maxVarieties) {
        toast(`Déjà ${GX.maxVarieties} variétés en cours : fixez-en ou jetez-en avant d’en créer d’autres`, ['ui', 'flowers']);
        sfx('error');
        return false;
    }
    const cost = crossCost();
    if (state.money < cost) {
        toast(`Il faut ${fmt(cost)} pièces pour ce croisement`, ['ui', 'coin']);
        sfx('error');
        return false;
    }
    spend(cost);
    G.cross = { a, b, until: now() + GX.crossTime * 1000 };
    sfx('plant');
    burst(at, 'sparkle', 10);
    float(at, [`-${fmt(cost)}`, ['ui', 'coin']], 'bad', -14);
    tip('genetics');
    changed('lab');
    return true;
}
export const crossReady = () => !!(state.genetics.cross && now() >= state.genetics.cross.until);

// récolter les graines d'un croisement terminé ; renvoie la nouvelle variété, ou null (stérile)
export function finishCross(at) {
    const G = state.genetics,
        c = G.cross;
    if (!c || now() < c.until) return null;
    G.cross = null;
    const A = parentGenome(c.a),
        B = parentGenome(c.b);
    if (!A || !B) return null;
    if (Math.random() < sterileChance(A, B)) {
        toast('Les graines sont stériles : rien n’a germé. Un autre essai ?', ['ui', 'rot']);
        sfx('error');
        changed('lab');
        return null;
    }
    const { g, mutated } = crossGenomes(A, B, mutationRate());
    const id = 'v' + G.next++;
    const v = {
        id,
        kind: 'plant',
        base: g.form,
        auto: hybridName(parentBase(c.a), parentBase(c.b)),
        name: null,
        g,
        gen: Math.max(parentGen(c.a), parentGen(c.b)) + 1,
        fixed: false,
        analyzed: false,
        mut: mutated,
        born: now(),
    };
    G.vars[id] = v;
    G.seeds[id] = (G.seeds[id] || 0) + GX.seedsPerCross;
    state.stats.crosses = (state.stats.crosses || 0) + 1;
    sfx('level');
    buzz(25);
    burst(at, 'sparkle', 16);
    addXp(40 + state.level * 4, at);
    emit('newVariety', id);
    if (mutated) toast(`Mutation ! ${varName(v)} a quelque chose d’unique`, ['ui', 'star']);
    changed('lab');
    return v;
}

// analyser : les versions cachées des gènes deviennent visibles
export function analyze(id, at) {
    const v = state.genetics.vars[id];
    const a = !v && state.animals.find(x => x.uid === id);
    const target = v || a;
    if (!labOpen() || !target || target.analyzed) return false;
    const cost = analyzeCost();
    if (state.money < cost) {
        toast(`Il faut ${fmt(cost)} pièces pour une analyse`, ['ui', 'coin']);
        sfx('error');
        return false;
    }
    spend(cost);
    target.analyzed = true;
    sfx('pop');
    burst(at, 'sparkle', 8);
    changed('lab');
    return true;
}

// une variété se fixe quand elle a assez de générations et que tous ses gènes sont identiques par paires
export const canFix = v => labOpen() && !v.fixed && v.gen >= GX.fixGen && stability(v.g) === 1;
export function fixVariety(id, name, at) {
    const v = state.genetics.vars[id];
    if (!v || !canFix(v)) return false;
    const n = String(name || '')
        .trim()
        .slice(0, 22);
    if (!n) {
        toast('Donnez-lui un nom !');
        return false;
    }
    v.fixed = true;
    v.name = n;
    v.fixedAt = now();
    state.stats.creations = (state.stats.creations || 0) + 1;
    sfx('level');
    buzz(40);
    burst(at, 'sparkle', 20);
    addXp(200 + state.level * 10, at);
    toast(`« ${n} » entre dans Mes créations !`, ['ui', 'trophy']);
    changed('lab');
    return true;
}


export function discardVariety(id) {
    const G = state.genetics;
    const v = G.vars[id];
    if (!v || v.fixed) return false;
    delete G.vars[id];
    delete G.seeds[id];
    delete G.stock[id];
    if (G.tool === id) G.tool = null;
    if (state.selectedTool === 'var' && !G.tool) state.selectedTool = 'hand';
    changed('lab');
    return true;
}

// racheter des graines d'une variété fixée (conservatoire)
export const seedPrice = v => Math.round(ITEMS[v.base].cost * GX.seedPriceMult) || 50;
export function buyVarietySeeds(id, n = 5, at) {
    const v = state.genetics.vars[id];
    if (!v || !v.fixed || !seedbankOpen()) return false;
    const cost = seedPrice(v) * n;
    if (state.money < cost) {
        toast('Pas assez d’argent', ['ui', 'coin']);
        sfx('error');
        return false;
    }
    spend(cost);
    state.genetics.seeds[id] = (state.genetics.seeds[id] || 0) + n;
    sfx('buy');
    float(at, [`-${fmt(cost)}`, ['ui', 'coin']], 'bad', -14);
    return true;
}

// ---------------- au champ : semer et récolter une variété ----------------
// les gènes de culture jouent sur la pousse, la soif, la saison et le rendement
export const varGrowth = vid => {
    const v = state.genetics && state.genetics.vars[vid];
    return v ? 1 + (traitOf(v.g, 'speed') - 2) * 0.06 : 1;
};
export const varHardy = vid => {
    const v = state.genetics && state.genetics.vars[vid];
    return v ? 1 + Math.max(0, traitOf(v.g, 'hardy') - 2) * 0.1 : 1;
};
export const varSelfWater = vid => {
    const v = state.genetics && state.genetics.vars[vid];
    return v ? Math.random() < Math.max(0, traitOf(v.g, 'drought') - 2) * 0.15 : false;
};
export const varExtra = vid => {
    const v = state.genetics && state.genetics.vars[vid];
    return v && Math.random() < Math.max(0, traitOf(v.g, 'yield') - 2) * 0.08 ? 1 : 0;
};

// prendre une graine de variété pour semer ; renvoie l'espèce à planter, ou null
export function takeVarSeed(vid) {
    const G = state.genetics;
    const v = G.vars[vid];
    if (!v || !(G.seeds[vid] > 0)) return null;
    G.seeds[vid]--;
    return v.base;
}

// une récolte de variété : ses produits gardent leur nom, et parfois une graine tombe
export function harvestVariety(vid, qty) {
    const G = state.genetics;
    const v = G.vars[vid];
    if (!v) return;
    G.stock[vid] = (G.stock[vid] || 0) + qty;
    if (Math.random() < GX.seedDrop) G.seeds[vid] = (G.seeds[vid] || 0) + 1;
}

// les produits de variété font partie du stock de l'espèce : quand le stock baisse, ils partent en dernier
export function clampVarieties() {
    const G = state.genetics;
    if (!G) return;
    const by = {};
    for (const [vid, n] of Object.entries(G.stock)) {
        const v = G.vars[vid];
        if (!v || n <= 0) {
            delete G.stock[vid];
            continue;
        }
        (by[v.base] = by[v.base] || []).push(vid);
    }
    for (const [base, list] of Object.entries(by)) {
        let over = list.reduce((a, vid) => a + G.stock[vid], 0) - (state.inventory[base] || 0);
        // les moins bonnes d'abord
        list.sort((x, y) => flavorGain(G.vars[x].g) - flavorGain(G.vars[y].g));
        for (const vid of list) {
            if (over <= 0) break;
            const d = Math.min(over, G.stock[vid]);
            G.stock[vid] -= d;
            over -= d;
        }
    }
}

// revendre des produits de variété, à prix d'or selon leur goût
export const varietyMult = v => Math.min(GX.varietySellCap, 1 + flavorGain(v.g) / 6 + (v.g.halo ? 0.3 : 0));
export const varietyPrice = v => Math.round(unitPrice(v.base) * varietyMult(v));
export function sellVariety(id, n, at) {
    clampVarieties();
    const G = state.genetics,
        v = G.vars[id];
    n = Math.min(n, G.stock[id] || 0, state.inventory[v ? v.base : ''] || 0);
    if (!v || n <= 0) return 0;
    const gain = varietyPrice(v) * n;
    G.stock[id] -= n;
    state.inventory[v.base] -= n;
    state.income.market += gain;
    earn(gain, at);
    sfx('coin');
    toast(`${n} ${varName(v)} vendu${n > 1 ? 's' : ''} : ${fmt(gain)} pièces`, ['item', v.base]);
    return gain;
}

// ---------------- l'atelier : de meilleurs ingrédients font de meilleurs plats ----------------
// le goût qu'une recette recherche : les deux saveurs les plus fortes de ses plantes
export function recipeTaste(rid) {
    const r = RECIPES[rid];
    const sum = [0, 0, 0, 0, 0];
    let plants = 0;
    for (const k of Object.keys(r.ing))
        if (FLAVORS[k]) {
            plants++;
            FLAVORS[k].forEach((v, j) => (sum[j] += v));
        }
    if (!plants) return [];
    return FLAVOR_IDS.map((k, j) => [k, sum[j]])
        .filter(x => x[1] > 0)
        .sort((x, y) => y[1] - x[1])
        .slice(0, 2)
        .map(x => x[0]);
}

// prend les ingrédients d'une recette (les meilleurs d'abord, si le réglage est actif) ; renvoie la qualité du lot (0, 1, 2)
export function takeIngredients(rid) {
    const r = RECIPES[rid];
    const G = state.genetics;
    let points = 0,
        units = 0;
    const best = G && G.bestFirst;
    const taste = best ? recipeTaste(rid) : [];
    if (G) clampVarieties();
    for (const [k, n] of Object.entries(r.ing)) {
        units += n;
        let left = n;
        if (best && FLAVORS[k] && G) {
            // variétés : celles qui ont le plus du goût recherché
            const list = Object.keys(G.stock)
                .filter(vid => G.vars[vid] && G.vars[vid].base === k && G.stock[vid] > 0)
                .map(vid => [vid, Math.min(3, flavorGain(G.vars[vid].g, taste.length ? taste : FLAVOR_IDS))])
                .sort((x, y) => y[1] - x[1]);
            for (const [vid, gain] of list) {
                if (left <= 0) break;
                const d = Math.min(left, G.stock[vid]);
                G.stock[vid] -= d;
                left -= d;
                points += d * gain;
            }
        }
        if (best && left > 0 && state.quality[k]) {
            const q = state.quality[k];
            const g = Math.min(left, q.g);
            q.g -= g;
            left -= g;
            points += g * 2;
            const s2 = Math.min(left, q.s);
            q.s -= s2;
            left -= s2;
            points += s2;
        }
        state.inventory[k] -= n;
    }
    const score = units ? points / units : 0;
    return score >= GX.goldScore ? 2 : score >= GX.silverScore ? 1 : 0;
}

// ---------------- les bêtes ----------------
export const animalTrait = (a, k) => (a && a.g ? traitOf(a.g, k) : (ANIMAL_BASE[a.type] || [])[ANIMAL_IDS.indexOf(k)] || 2);
const animalBase = (a, k) => (ANIMAL_BASE[a.type] || [])[ANIMAL_IDS.indexOf(k)] || 2;
export const animalSpeedGene = a => 1 + (animalTrait(a, 'speed') - 2) * 0.05;
export const animalYieldGene = a => Math.max(0, animalTrait(a, 'yield') - 2) * 0.05;
export const animalSaves = a => Math.random() < Math.max(0, animalTrait(a, 'appetite') - 2) * 0.07;
export const animalRobust = a => animalTrait(a, 'robust') >= 4;
// la qualité d'un produit dépend de la richesse, de la douceur et de l'arôme gagnés sur l'espèce
export function animalQuality(a) {
    const gain = ['rich', 'soft', 'aroma'].reduce((x, k) => x + Math.max(0, animalTrait(a, k) - animalBase(a, k)), 0);
    if (!gain) return 0;
    const r = Math.random();
    return r < gain * 0.08 ? 2 : r < gain * 0.2 ? 1 : 0;
}
export const animalGain = a => ANIMAL_IDS.reduce((x, k) => x + Math.max(0, animalTrait(a, k) - animalBase(a, k)), 0);

export const breedable = (a, b) => a && b && a !== b && a.type === b.type && isAdult(a) && isAdult(b) && !a.sick && !b.sick;
export const animalByUid = uid => state.animals.find(a => a.uid === uid);

export function startBreed(ua, ub, at) {
    const G = state.genetics;
    const a = animalByUid(ua),
        b = animalByUid(ub);
    if (!breedOpen() || G.breed || !breedable(a, b)) return false;
    if (herdFull()) {
        toast('Tous vos prés sont pleins : il faut une place pour le petit', ['ui', 'flowers']);
        sfx('error');
        return false;
    }
    const cost = breedCost();
    if (state.money < cost) {
        toast(`Il faut ${fmt(cost)} pièces`, ['ui', 'coin']);
        sfx('error');
        return false;
    }
    spend(cost);
    G.breed = { a: ua, b: ub, type: a.type, until: now() + GX.breedTime * 1000 };
    sfx(a.type);
    burst(at, 'sparkle', 10);
    float(at, [`-${fmt(cost)}`, ['ui', 'coin']], 'bad', -14);
    tip('genetics');
    changed('lab');
    return true;
}

// la naissance : un petit dont les gènes viennent des deux parents
export function breedTick() {
    const G = state.genetics;
    const c = G && G.breed;
    if (!c || now() < c.until || herdFull()) return false;
    const a = animalByUid(c.a),
        b = animalByUid(c.b);
    G.breed = null;
    if (!a || !b) return true;
    const { g, mutated } = crossGenomes(a.g, b.g, mutationRate());
    const baby = newAnimal(c.type);
    baby.uid = 'a' + G.next++;
    baby.g = g;
    baby.gen = Math.max(a.gen || 0, b.gen || 0) + 1;
    baby.parents = [a.name, b.name];
    if (a.race && a.race === b.race) baby.race = a.race;
    placeAnimal(baby);
    state.animals.push(baby);
    state.stats.births = (state.stats.births || 0) + 1;
    toast(
        `${baby.name} est né${c.type === 'chicken' || c.type === 'cow' || c.type === 'goat' ? 'e' : ''} à l’étable de sélection${mutated ? ' : une mutation !' : ''}`,
        ['animal', c.type],
    );
    sfx(c.type);
    addXp(60 + state.level * 5);
    return true;
}

export const canFixRace = a => labOpen() && a && !a.race && (a.gen || 0) >= GX.fixGen && a.g && stability(a.g) === 1;
export function fixRace(uid, name, at) {
    const a = animalByUid(uid);
    if (!canFixRace(a)) return false;
    const n = String(name || '')
        .trim()
        .slice(0, 22);
    if (!n) return false;
    const G = state.genetics;
    const id = 'r' + G.next++;
    G.races[id] = { id, type: a.type, name: n, g: JSON.parse(JSON.stringify(a.g)), born: now() };
    a.race = id;
    state.stats.creations = (state.stats.creations || 0) + 1;
    sfx('level');
    buzz(40);
    burst(at, 'sparkle', 20);
    addXp(250 + state.level * 10, at);
    toast(`La race « ${n} » entre dans Mes créations !`, ['ui', 'trophy']);
    return true;
}
export const racePrice = r => Math.round(ANIMALS[r.type].cost * GX.babyPriceMult);
export function buyRaceBaby(rid, at) {
    const r = state.genetics.races[rid];
    if (!r || !seedbankOpen()) return false;
    if (herdFull()) {
        toast('Tous vos prés sont pleins', ['ui', 'flowers']);
        sfx('error');
        return false;
    }
    const cost = racePrice(r);
    if (state.money < cost) {
        toast('Pas assez d’argent', ['ui', 'coin']);
        sfx('error');
        return false;
    }
    spend(cost);
    const baby = newAnimal(r.type);
    baby.uid = 'a' + state.genetics.next++;
    baby.g = JSON.parse(JSON.stringify(r.g));
    baby.gen = GX.fixGen;
    baby.race = rid;
    placeAnimal(baby);
    state.animals.push(baby);
    sfx(r.type);
    float(at, [`-${fmt(cost)}`, ['ui', 'coin']], 'bad', -14);
    toast(`Un petit de la race « ${r.name} » arrive au pré`, ['animal', r.type]);
    return true;
}

// ---------------- commande de chef : un goût précis ----------------
// « un fruit sucré 4 et épicé 3 » : une variété de l'espèce, qui atteint ces saveurs
export function ensureChef() {
    const G = state.genetics;
    if (!plantLabOpen()) return false;
    const t = now();
    if (G.chef && t < G.chef.until) return false;
    if (G.chef && !G.chef.done && t >= G.chef.until) G.chef = { wait: t + 30 * 60 * 1000 };
    if (G.chef && G.chef.wait && t < G.chef.wait) return false;
    const pool = Object.keys(FLAVORS).filter(id => ITEMS[id].type === 'crop' && state.level >= ITEMS[id].reqLvl && !ITEMS[id].island && storyOk(ITEMS[id]));
    const base = pickRand(pool);
    const f = FLAVORS[base];
    const order = FLAVOR_IDS.map((k, j) => [k, f[j]]).sort((x, y) => y[1] - x[1]);
    const need = { [order[0][0]]: Math.min(5, order[0][1] + 1 + (Math.random() < 0.4 ? 1 : 0)) };
    if (Math.random() < 0.6) need[order[1][0]] = Math.min(5, order[1][1] + 1);
    G.chef = { base, need, qty: 5, gold: Math.round(ITEMS[base].sell * 5 * 9 + state.level * 200), until: t + 4 * 3600 * 1000 };
    return true;
}
export const chefMatches = v => {
    const c = state.genetics.chef;
    return !!(c && c.base && v.base === c.base && Object.entries(c.need).every(([k, n]) => traitOf(v.g, k) >= n));
};
export function deliverChef(vid, at) {
    const G = state.genetics,
        c = G.chef,
        v = G.vars[vid];
    clampVarieties();
    if (!c || !c.base || !v || !chefMatches(v) || (G.stock[vid] || 0) < c.qty) return false;
    G.stock[vid] -= c.qty;
    state.inventory[v.base] -= c.qty;
    earn(c.gold, at);
    state.income.orders += c.gold;
    const mat = pickRand(RARE);
    state.inventory[mat] = (state.inventory[mat] || 0) + 2;
    addXp(150 + state.level * 8, at);
    G.chef = { wait: now() + 60 * 60 * 1000, done: true };
    sfx('level');
    burst(at, 'sparkle', 16);
    toast(`Le chef est ravi : ${fmt(c.gold)} pièces et 2 ${ITEMS[mat].name.toLowerCase()}`, ['ui', 'star']);
    return true;
}

// ---------------- le Salon de l'agriculture ----------------
const salonSeed = t => Math.floor(t / SALON_PERIOD);
export function ensureSalon() {
    if (!salonOpen()) return false;
    const G = state.genetics;
    const t = now();
    const k = salonSeed(t);
    if (G.salon && G.salon.k === k) return false;
    // l'ancien Salon se termine : on remet les prix
    if (G.salon && G.salon.entry && !G.salon.paid) awardSalon(G.salon);
    const crit = SALON_CRITERIA[k % SALON_CRITERIA.length];
    const lvlBoost = Math.min(1.2, (state.level - 33) * 0.1);
    const rivals = ['La ferme des Peupliers', 'Le domaine Bellerive', 'Les Jardins du Moulin'].map((name, j) => ({
        name,
        score: Math.round((2.8 + j * 0.6 + lvlBoost + Math.random() * 0.8) * 10) / 10,
    }));
    G.salon = { k, crit: crit.id, end: (k + 1) * SALON_PERIOD, rivals, entry: null, paid: false };
    return true;
}
export const salonCrit = () => SALON_CRITERIA.find(c => c.id === (state.genetics.salon || {}).crit);

// la note d'une création pour le critère du Salon
export function salonScore(crit, target) {
    if (!target) return 0;
    const g = target.g;
    if (crit.trait === 'looks') {
        const l = looksOf(g);
        const s = (l.size === 3 ? 2 : l.size === 2 ? 1 : 0) + (l.color ? 1.2 : 0) + (l.pattern ? 1 : 0) + (l.halo ? 1.5 : 0);
        return Math.round(s * 10) / 10;
    }
    return traitOf(g, crit.trait) + (g.halo ? 0.5 : 0);
}
export function salonCandidates() {
    const crit = salonCrit();
    if (!crit) return [];
    if (crit.kind === 'plant') return varieties().map(v => ({ id: v.id, name: varName(v), score: salonScore(crit, v) }));
    return state.animals
        .filter(
            a =>
                a.g &&
                (crit.id !== 'richMilk' || ['cow', 'goat', 'buffalo', 'donkey'].includes(a.type)) &&
                (crit.id !== 'softWool' || ['sheep', 'alpaca', 'rabbit'].includes(a.type)),
        )
        .map(a => ({ id: a.uid, name: a.name, score: salonScore(crit, a) }));
}
export function enterSalon(id) {
    const G = state.genetics;
    if (!G.salon || G.salon.paid) return false;
    const c = salonCandidates().find(x => x.id === id);
    if (!c) return false;
    G.salon.entry = c;
    sfx('pop');
    toast(`${c.name} est inscrit au Salon (note ${String(c.score).replace('.', ',')})`, ['ui', 'trophy']);
    return true;
}
export const salonRank = s => (s.entry ? 1 + s.rivals.filter(r => r.score > s.entry.score).length : 0);
function awardSalon(s) {
    s.paid = true;
    const r = salonRank(s);
    if (!r) return;
    const coins = [0, 12000, 6000, 3000, 1000][r] * (1 + state.level * 0.05);
    const rub = r === 1 ? 2 : r === 2 ? 1 : 0;
    earn(Math.round(coins), null);
    state.prestige.rubans += rub;
    state.stats.salonWins = (state.stats.salonWins || 0) + (r === 1 ? 1 : 0);
    emit('salonResult', { rank: r, coins: Math.round(coins), rub });
}
export function salonTick() {
    const G = state.genetics;
    if (!G || !salonOpen()) return false;
    if (G.salon && !G.salon.paid && now() >= G.salon.end) {
        if (G.salon.entry) awardSalon(G.salon);
        else G.salon.paid = true;
    }
    return ensureSalon();
}

// ---------------- la seconde de jeu ----------------
export function geneticsTick() {
    if (!state.genetics) return false;
    let ch = false;
    if (state.genetics.cross && crossReady() && !state.genetics.cross.told) {
        state.genetics.cross.told = true;
        toast('Le croisement est prêt : récoltez les graines au labo', ['ui', 'flowers']);
        ch = true;
    }
    if (breedTick()) ch = true;
    if (ensureChef()) ch = true;
    if (salonTick()) ch = true;
    return ch;
}
