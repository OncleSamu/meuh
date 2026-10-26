// La génétique : génomes, croisements de plantes et d'animaux, variétés et races fixées, Salon et commandes de chef.
//
// Un génome : { t: { trait: [[v, d], [v, d]] }, l: { size|color|pattern: [[i, d], [i, d]] }, form, halo }
//   chaque gène a deux versions (allèles) : une valeur (0 à 5, ou un numéro d'apparence) et une dominance (1 ou 0).
//   Le caractère visible : la version dominante, ou la moyenne des deux si elles sont toutes deux dominantes ou récessives.
// Une variété (plantes) : { id, kind: 'plant', base, name, g, gen, fixed, analyzed, born }
//   ses graines (genetics.seeds[id]) se sèment ; ses produits (genetics.stock[id]) font partie du stock de l'espèce.
// Une bête porte son génome (a.g), sa génération (a.gen) et sa race fixée (a.race).
import { labPenBonus } from './buildings.js';
import { founderCoat, crossCoat, legacyCoat } from './coat.js';
import { studBorn } from './stud.js';
import { state, scaleLvl, lvOk } from '../core/state.js';
import { now } from '../core/clock.js';
import { fmt, pickRand, qtyName } from '../core/format.js';
import { emit, toast, sfx, buzz, burst, float, changed } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { ANIMALS } from '../data/animals.js';
import { RECIPES } from '../data/machines.js';
import {
    FLAVORS,
    PLANT_BASE,
    ANIMAL_BASE,
    PLANT_TRAITS,
    ANIMAL_TRAITS,
    LOOKS,
    GENETICS as GX,
    SALON_CRITERIA,
    SALON_PERIOD,
    FEATURES,
    featuresOf,
    extraBase,
    EXTRA_FX as FX,
    LOOK_WEIGHT,
    FINISH_CHANCE,
    FINISH_SEASON,
} from '../data/genetics.js';
import { RARE } from '../data/commerce.js';
import { RIVALS } from '../data/village.js';
import { spend, earn, addXp } from './player.js';
import { projectDone, storyOk } from './story.js';
import { isAdult, newAnimal } from './animals.js';
import { placeAnimal, herdFull } from './pastures.js';
import { unitPrice } from './market.js';
import { qual } from './farm.js';
import { QX } from '../data/farm.js';
import { tip } from './tips.js';
import { domStepSum } from './estate.js';
import { season } from './world.js';

export const FLAVOR_IDS = PLANT_TRAITS.filter(t => t.flavor).map(t => t.id);
export const PLANT_IDS = PLANT_TRAITS.map(t => t.id);
export const ANIMAL_IDS = ANIMAL_TRAITS.map(t => t.id);
// les caractères « de base » (hors discrets 1.22) servent aux scores, aux buts et à la valeur
export const CORE_PLANT = PLANT_TRAITS.filter(t => !t.extra).map(t => t.id);
export const CORE_ANIMAL = ANIMAL_TRAITS.filter(t => !t.extra).map(t => t.id);
const EXTRA_PLANT = PLANT_TRAITS.filter(t => t.extra).map(t => t.id);
const EXTRA_ANIMAL = ANIMAL_TRAITS.filter(t => t.extra).map(t => t.id);
// 1.23 : un caractère peut ne concerner qu'une espèce (la détente, propre au cheval)
const extraFor = type => ANIMAL_TRAITS.filter(t => t.extra && (!t.species || t.species.includes(type))).map(t => t.id);

// ---------------- ouverture ----------------
export const plantLabOpen = () => projectDone(GX.plantProject);
export const breedOpen = () => projectDone(GX.animalProject);
export const labOpen = () => projectDone(GX.labProject);
export const seedbankOpen = () => projectDone(GX.seedbankProject);
export const salonOpen = () => projectDone(GX.salonProject);
export const geneticsOpen = () => plantLabOpen() || breedOpen();
// 1.7 : deux pollinisations à la fois avec la ruche, une portée plus grande avec le laboratoire, plusieurs enclos
export const crossSlots = () => (projectDone(GX.hiveProject) ? GX.crossSlotsHive : 1);
export const litterSize = () => (labOpen() ? GX.litterLab : GX.litter);
export const breedSlots = () => GX.breedPens + (labOpen() ? 1 : 0) + (seedbankOpen() ? 1 : 0) + (labOpen() ? labPenBonus() : 0) + domStepSum('annex', 'breed');
export const isPlant = id => ITEMS[id] && (ITEMS[id].type === 'crop' || ITEMS[id].type === 'tree') && FLAVORS[id];

export function ensureGenetics() {
    const G = (state.genetics = state.genetics || {});
    G.next = G.next || 1;
    G.vars = G.vars || {};
    G.seeds = G.seeds || {};
    G.stock = G.stock || {};
    G.races = G.races || {};
    if (G.bestFirst === undefined) G.bestFirst = true;
    // 1.7 : plusieurs croisements et élevages à la fois, des portées, un but, des variétés semées par défaut
    if (!G.crosses) G.crosses = G.cross ? [G.cross] : [];
    if (!G.breeds) G.breeds = G.breed ? [G.breed] : [];
    delete G.cross;
    delete G.breed;
    G.litters = G.litters || [];
    G.prefer = G.prefer || {};
    G.salonWon = G.salonWon || {};
    if (G.goal === undefined) G.goal = null;
    state.animals.forEach(a => {
        if (!a.uid) a.uid = 'a' + G.next++;
        if (!a.g) a.g = wildAnimal(a.type, true);
        addFeatures(a.g, a.type, true);
        a.gen = a.gen || 0;
    });
    Object.values(G.races).forEach(r => addFeatures(r.g, r.type, false));
    // 1.24.2 : un cheval d'avant reçoit des gènes de robe et de marques, une seule fois
    // 1.24.5 : ils restent bais, comme leur dessin d'avant (les gènes cachés varient)
    state.animals.forEach(a => a.type === 'horse' && a.g && !a.g.coat && (a.g.coat = legacyCoat()));
    Object.values(G.races).forEach(r => r.type === 'horse' && r.g && !r.g.coat && (r.g.coat = legacyCoat()));
    // 1.22 : caractères discrets et finitions pour les créations d'avant
    state.animals.forEach(a => addExtras(a.g, extraFor(a.type), a.type));
    Object.values(G.races).forEach(r => addExtras(r.g, extraFor(r.type), r.type));
    Object.values(G.vars).forEach(v => addExtras(v.g, EXTRA_PLANT, v.g.form));
    // 1.23 : un cheval d'avant a la docilité et la détente d'un cheval sauvage (gène 2) au lieu de 0, une seule fois
    if (!G.v123) {
        G.v123 = true;
        const fixHorse = g => {
            if (!g || !g.t) return;
            for (const k of ['docile', 'jump']) if (g.t[k] && !g.t[k][0][0] && !g.t[k][1][0]) g.t[k] = pair(2);
        };
        state.animals.forEach(a => a.type === 'horse' && fixHorse(a.g));
        Object.values(G.races).forEach(r => r.type === 'horse' && fixHorse(r.g));
    }
}
function addExtras(g, keys, id) {
    if (!g || !g.t) return;
    for (const k of keys) if (!g.t[k]) g.t[k] = pair(extraBase(k, id));
    if (g.l && !g.l.finish) g.l.finish = pair(0);
}

// ---------------- génomes ----------------
const pair = (v, d = 1) => [
    [v, d],
    [v, d],
];
const clamp5 = v => Math.max(0, Math.min(5, v));
const baseLooks = () => ({ size: pair(1), color: pair(0), pattern: pair(0), finish: pair(0) });

// le génome sauvage d'une plante : ses saveurs de base, sans surprise
export function wildPlant(id) {
    const f = FLAVORS[id] || [0, 0, 0, 0, 0];
    const t = {};
    FLAVOR_IDS.forEach((k, j) => (t[k] = pair(f[j])));
    Object.entries(PLANT_BASE).forEach(([k, v]) => (t[k] = pair(v)));
    EXTRA_PLANT.forEach(k => (t[k] = pair(extraBase(k, id))));
    return { t, l: baseLooks(), form: id, halo: false };
}

// le génome d'une bête : ses caractères de base, avec un peu de variété chez les bêtes déjà là
export function wildAnimal(type, vary) {
    const b = ANIMAL_BASE[type] || [2, 2, 2, 2, 2, 2, 2];
    const t = {};
    extraFor(type).forEach(k => (t[k] = pair(extraBase(k, type))));
    CORE_ANIMAL.forEach((k, j) => {
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
    const g = addFeatures({ t, l, halo: false }, type, vary);
    if (type === 'horse') g.coat = founderCoat();
    return g;
}

// cornes, oreilles, toison (1.2) : ajoutés aux génomes des espèces concernées, parfois avec une version cachée
export function addFeatures(g, type, vary) {
    if (!g || !g.l) return g;
    for (const k of featuresOf(type)) {
        if (g.l[k]) continue;
        g.l[k] = pair(0);
        if (vary && Math.random() < 0.3) g.l[k][1] = [1 + Math.floor(Math.random() * (FEATURES[k].list.length - 1)), 0];
    }
    return g;
}
export const featureOf = (g, k) => (g && g.l && g.l[k] ? expressLook(g.l[k]) : 0);
export const featureLooks = (g, type) => featuresOf(type).map(k => featureOf(g, k));

// le caractère visible d'un gène
export const express = p => (p[0][1] !== p[1][1] ? (p[0][1] ? p[0][0] : p[1][0]) : Math.round((p[0][0] + p[1][0]) / 2));
export const expressLook = p => (p[0][1] !== p[1][1] ? (p[0][1] ? p[0][0] : p[1][0]) : Math.max(p[0][0], p[1][0]));
export const traitOf = (g, k) => (g.t[k] ? express(g.t[k]) : 0);
export const looksOf = g => ({
    size: expressLook(g.l.size),
    color: expressLook(g.l.color),
    pattern: expressLook(g.l.pattern),
    finish: g.l.finish ? expressLook(g.l.finish) : 0,
    halo: !!g.halo,
});
// tirage pondéré d'une apparence (les plus rares tombent moins) ; le gros fruit ne concerne que les plantes
const lookPick = (k, n, plant) => {
    const w = Array.from({ length: n }, (_, i) => (LOOK_WEIGHT[k] && LOOK_WEIGHT[k][i] !== undefined ? LOOK_WEIGHT[k][i] : 3));
    if (k === 'size' && !plant) w[6] = 0;
    let r = Math.random() * w.reduce((a, b) => a + b, 0);
    for (let i = 0; i < n; i++) if ((r -= w[i]) < 0) return i;
    return 0;
};
// une finition, avec un coup de pouce à celle de la saison
function finishPick() {
    const fav = FINISH_SEASON[season().id];
    const w = [0, 1, 1, 1, 1, 1].map((x, i) => (i === fav ? 3 : x));
    let r = Math.random() * w.reduce((a, b) => a + b, 0);
    for (let i = 0; i < w.length; i++) if ((r -= w[i]) < 0) return i;
    return 1;
}
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
    for (const k of new Set([...Object.keys(A.l), ...Object.keys(B.l)])) {
        const pa = A.l[k] || (k === 'finish' ? pair(0) : B.l[k]);
        l[k] = [pick(pa), pick(B.l[k] || pa)];
    }
    const child = {
        t,
        l,
        form: A.form === B.form ? A.form : Math.random() < 0.5 ? A.form : B.form,
        halo: (A.halo && Math.random() < 0.5) || (B.halo && Math.random() < 0.5),
    };
    if (A.coat || B.coat) child.coat = crossCoat(A.coat, B.coat);
    let mutated = false;
    if (Math.random() < rate) {
        mutated = true;
        if (Math.random() < 0.2) child.halo = true;
        else if (Math.random() < 0.35) {
            // les finitions sont rares ; sinon une apparence, tirée selon sa rareté
            const fin = Math.random() < FINISH_CHANCE;
            const k = fin ? 'finish' : pickRand(Object.keys(child.l).filter(x => x !== 'finish'));
            const n = (LOOKS[k] || FEATURES[k].list).length;
            const i = fin ? finishPick() : LOOKS[k] ? lookPick(k, n, !!A.form) : Math.floor(Math.random() * n);
            child.l[k][Math.random() < 0.5 ? 0 : 1] = [i, Math.random() < 0.5 ? 1 : 0];
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
    const goal = g => keys.filter(k => (kind === 'plant' ? FLAVOR_IDS.includes(k) : CORE_ANIMAL.includes(k))).reduce((x, k) => x + traitOf(g, k), 0);
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
    const wild = Object.keys(FLAVORS).filter(id => ITEMS[id] && (ITEMS[id].type === 'crop' || id === 'grape') && lvOk(ITEMS[id]) && storyOk(ITEMS[id]));
    return [...varieties().map(v => v.id), ...wild];
};
export const crossCost = () => Math.round(GX.crossCost(scaleLvl()) / 10) * 10;
export const breedCost = () => Math.round(GX.breedCost(scaleLvl()) / 10) * 10;
export const analyzeCost = () => Math.round(GX.analyzeCost(scaleLvl()) / 10) * 10;

// lancer une pollinisation (au labo) : elle prend un peu de temps
export const crossFree = () => plantLabOpen() && state.genetics.crosses.length < crossSlots();
export function startCross(a, b, at) {
    const G = state.genetics;
    if (!plantLabOpen() || !crossFree()) return false;
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
    G.crosses.push({ a, b, until: now() + GX.crossTime * 1000 });
    sfx('plant');
    burst(at, 'sparkle', 10);
    float(at, [`-${fmt(cost)}`, ['ui', 'coin']], 'bad', -14);
    tip('genetics');
    changed('lab');
    return true;
}
export const crossReady = () => !!(state.genetics && state.genetics.crosses.some(c => now() >= c.until));

// 1.7 : récolter un croisement terminé donne une portée de jeunes plants ; on en garde un.
// Renvoie la portée, ou null si toutes les graines sont stériles.
export function finishCross(at) {
    const G = state.genetics;
    const k = G.crosses.findIndex(c => now() >= c.until);
    if (k < 0) return null;
    const c = G.crosses.splice(k, 1)[0];
    const A = parentGenome(c.a),
        B = parentGenome(c.b);
    if (!A || !B) return null;
    const kids = [];
    for (let j = 0; j < litterSize(); j++) {
        if (Math.random() < sterileChance(A, B)) continue;
        const { g, mutated } = crossGenomes(A, B, mutationRate());
        kids.push({ g, mut: mutated });
    }
    state.stats.crosses = (state.stats.crosses || 0) + 1;
    if (!kids.length) {
        toast('Les graines sont stériles : rien n’a germé. Un autre essai ?', ['ui', 'rot']);
        sfx('error');
        changed('lab');
        return null;
    }
    const litter = {
        id: 'L' + G.next++,
        a: c.a,
        b: c.b,
        gen: Math.max(parentGen(c.a), parentGen(c.b)) + 1,
        auto: hybridName(parentBase(c.a), parentBase(c.b)),
        lin: [G.vars[c.a] ? lineSnap(G.vars[c.a], true) : wildSnap(c.a), G.vars[c.b] ? lineSnap(G.vars[c.b], true) : wildSnap(c.b)],
        kids,
    };
    G.litters.push(litter);
    sfx('level');
    buzz(20);
    burst(at, 'sparkle', 12);
    addXp(40 + scaleLvl() * 4, at);
    if (kids.some(x => x.mut)) toast('Mutation dans la portée : un jeune plant a quelque chose d’unique', ['ui', 'star']);
    changed('lab');
    return litter;
}

// garder un jeune plant de la portée : il devient une variété, avec ses graines ; les autres partent au compost
export function keepSeedling(lid, k, at) {
    const G = state.genetics;
    const li = G.litters.findIndex(l => l.id === lid);
    const L = G.litters[li];
    const kid = L && L.kids[k];
    if (!kid) return null;
    if (openVarieties().length >= GX.maxVarieties) {
        toast(`Déjà ${GX.maxVarieties} variétés en cours : fixez-en ou jetez-en d’abord`, ['ui', 'flowers']);
        sfx('error');
        return null;
    }
    G.litters.splice(li, 1);
    const id = 'v' + G.next++;
    const v = {
        id,
        kind: 'plant',
        base: kid.g.form,
        auto: L.auto,
        name: null,
        g: kid.g,
        gen: L.gen,
        fixed: false,
        analyzed: false,
        mut: kid.mut,
        born: now(),
        lin: L.lin,
    };
    G.vars[id] = v;
    G.seeds[id] = (G.seeds[id] || 0) + GX.seedsPerCross;
    state.inventory.fertilizer = (state.inventory.fertilizer || 0) + L.kids.length - 1;
    sfx('pop');
    burst(at, 'sparkle', 10);
    emit('newVariety', id);
    changed('lab');
    return v;
}
export function dropLitter(lid) {
    const G = state.genetics;
    const li = G.litters.findIndex(l => l.id === lid);
    if (li < 0) return false;
    state.inventory.fertilizer = (state.inventory.fertilizer || 0) + G.litters[li].kids.length;
    G.litters.splice(li, 1);
    changed('lab');
    return true;
}

// ---------------- 1.7 : viser un goût (commande du chef, Salon) ----------------
const FI = k => FLAVOR_IDS.indexOf(k);
export function setGoal(from) {
    const G = state.genetics;
    if (!from) G.goal = null;
    else if (from === 'chef') {
        const c = G.chef;
        if (!c || !c.base) return false;
        G.goal = { from, base: c.base, need: { ...c.need } };
    } else if (from === 'salon') {
        const crit = salonCrit();
        if (!crit || crit.kind !== 'plant' || !FLAVOR_IDS.includes(crit.trait)) return false;
        G.goal = { from, base: null, need: { [crit.trait]: 5 }, crit: crit.id };
    } else return false;
    changed('lab');
    return true;
}
// le but tient-il encore ? (la commande du chef a pu changer, le Salon aussi)
function checkGoal() {
    const G = state.genetics,
        o = G.goal;
    if (!o) return false;
    const gone = o.from === 'chef' ? !G.chef || G.chef.base !== o.base : !G.salon || G.salon.crit !== o.crit;
    if (gone) G.goal = null;
    return gone;
}
export const goalOf = () => (state.genetics && state.genetics.goal) || null;
// de 0 à 1 : à quel point un génome s'approche du but
export function goalScore(g, goal = goalOf()) {
    if (!goal || !g) return 0;
    const keys = Object.keys(goal.need);
    const tot = keys.reduce((a, k) => a + goal.need[k], 0);
    const s = keys.reduce((a, k) => a + Math.min(traitOf(g, k), goal.need[k]), 0) / tot;
    return goal.base && g.form !== goal.base ? s * 0.5 : s;
}
const carried = (g, k) => Math.max(g.t[k][0][0], g.t[k][1][0]);
// le meilleur point de départ et le prochain croisement conseillé
export function goalPlan(goal = goalOf()) {
    if (!goal) return null;
    const keys = Object.keys(goal.need);
    const mine = varieties()
        .filter(v => !goal.base || v.g.form === goal.base)
        .sort((x, y) => goalScore(y.g, goal) - goalScore(x.g, goal) || stability(y.g) - stability(x.g));
    const best = mine[0];
    if (best && goalScore(best.g, goal) >= 1) return { done: best.id };
    const wild = Object.keys(FLAVORS).filter(id => ITEMS[id] && ITEMS[id].type === 'crop' && lvOk(ITEMS[id]) && storyOk(ITEMS[id]) && !ITEMS[id].island);
    const byTrait = k => [...wild].sort((x, y) => FLAVORS[y][FI(k)] - FLAVORS[x][FI(k)]);
    const start = best && goalScore(best.g, goal) > goalScore(wildPlant(goal.base || byTrait(keys[0])[0]), goal) ? best.id : goal.base || byTrait(keys[0])[0];
    const g = parentGenome(start);
    const missing = keys.filter(k => carried(g, k) < goal.need[k]);
    // toutes les bonnes versions sont là : il faut les rassembler en recroisant la plante avec elle-même
    if (!missing.length) return { a: start, b: start, self: true };
    const k = missing[0];
    const donor = byTrait(k).find(id => id !== parentBase(start));
    return { a: start, b: donor, trait: k };
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
    addXp(200 + scaleLvl() * 10, at);
    toast(`« ${n} » entre dans Mes créations !`, ['ui', 'trophy']);
    changed('lab');
    return true;
}

// 1.7 : les variétés sans intérêt (rien gagné, rien en stock, pas visées), proposées au compost
export function junkVarieties() {
    const G = state.genetics;
    const plan = goalPlan();
    const keep = new Set([...(plan ? [plan.a, plan.b, plan.done] : []), ...Object.values(G.prefer || {})]);
    return openVarieties().filter(
        v =>
            !keep.has(v.id) &&
            !v.g.halo &&
            !(G.stock[v.id] > 0) &&
            flavorGain(v.g) === 0 &&
            extraGain(v.g) === 0 &&
            (!goalOf() || goalScore(v.g) < 0.6) &&
            now() - (v.born || 0) > 10 * 60 * 1000,
    );
}
export function compostJunk() {
    const list = junkVarieties();
    list.forEach(v => discardVariety(v.id));
    if (list.length) {
        state.inventory.fertilizer = (state.inventory.fertilizer || 0) + list.length;
        toast(`${list.length} variété${list.length > 1 ? 's' : ''} au compost`, ['ui', 'flowers']);
    }
    return list.length;
}

export function discardVariety(id) {
    const G = state.genetics;
    const v = G.vars[id];
    if (!v || v.fixed) return false;
    delete G.vars[id];
    delete G.seeds[id];
    delete G.stock[id];
    if (G.prefer && G.prefer[v.base] === id) delete G.prefer[v.base];
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
    return v ? (1 + (traitOf(v.g, 'speed') - 2) * GX.geneSpeed) / (1 + traitOf(v.g, 'late') * FX.lateTime) : 1;
};
export const varHardy = vid => {
    const v = state.genetics && state.genetics.vars[vid];
    return v ? 1 + Math.max(0, traitOf(v.g, 'hardy') - 2) * GX.geneHardy : 1;
};
export const varSelfWater = vid => {
    const v = state.genetics && state.genetics.vars[vid];
    return v ? Math.random() < Math.max(0, traitOf(v.g, 'drought') - 2) * GX.geneDrought : false;
};
export const varExtra = vid => {
    const v = state.genetics && state.genetics.vars[vid];
    if (!v) return 0;
    let n = Math.random() < Math.max(0, traitOf(v.g, 'yield') - 2) * GX.geneYield ? 1 : 0;
    if (Math.random() < traitOf(v.g, 'calibre') * FX.calibre) n++;
    return n;
};
// 1.22 : caractères discrets des plantes (un point = quelques pour cent)
const varTrait = (vid, k) => {
    const v = state.genetics && state.genetics.vars[vid];
    return v ? traitOf(v.g, k) : 0;
};
export const varRegrow = vid => Math.random() < varTrait(vid, 'regrow') * FX.regrow;
export const varPestGuard = vid => Math.random() < varTrait(vid, 'pest') * FX.pest;
// qualité : la maturation lente améliore les chances, le gros calibre les réduit un peu
export const varQuality = vid => varTrait(vid, 'late') * FX.lateQ - varTrait(vid, 'calibre') * FX.calibreQ;
export const animalPestGuard = a => Math.random() < animalTrait(a, 'health') * FX.health;
export const varLuck = vid => varTrait(vid, 'luck') * FX.luck;
// part du bonus de bon sol accordée à une variété sur un mauvais sol (0 à 0,75)
export const varSoilShare = vid => Math.min(1, varTrait(vid, 'soilfit') * FX.soilfit);
// bonus de vitesse de la docilité (par cœur) et de la sociabilité (selon les voisines de la même espèce, plafonné)
export const animalDocile = a => (a.love || 0) * animalTrait(a, 'docile') * FX.docile;
export const animalSocial = a => {
    const pts = animalTrait(a, 'social');
    if (!pts) return 0;
    const mates = state.animals.filter(b => b !== a && b.type === a.type && (b.p || 0) === (a.p || 0) && isAdult(b)).length;
    return Math.min(FX.socialCap, mates * pts * FX.social);
};
export const animalCurious = a => Math.random() < animalTrait(a, 'curious') * FX.curious;
export const animalFertile = (a, b) => ((animalTrait(a, 'fertile') + animalTrait(b, 'fertile')) / 2) * FX.fertile;
// une variété qui n'a rien de plus que son espèce (saveurs ou caractères discrets)
export const extraGain = g => EXTRA_PLANT.reduce((x, k) => x + Math.max(0, traitOf(g, k) - extraBase(k, g.form)), 0);

// prendre une graine de variété pour semer ; renvoie l'espèce à planter, ou null
export function takeVarSeed(vid) {
    const G = state.genetics;
    const v = G.vars[vid];
    if (!v || !(G.seeds[vid] > 0)) return null;
    G.seeds[vid]--;
    return v.base;
}

// 1.7 : semer sa variété par défaut. Quand on sème l'espèce, c'est la variété préférée qui pousse :
// avec ses graines s'il en reste, sinon (variété fixée et conservatoire) en payant la différence de prix.
export function setPrefer(vid) {
    const G = state.genetics,
        v = G.vars[vid];
    if (!v) return false;
    if (G.prefer[v.base] === vid) delete G.prefer[v.base];
    else G.prefer[v.base] = vid;
    return true;
}
export const preferOf = base => {
    const G = state.genetics;
    const vid = G && G.prefer && G.prefer[base];
    return vid && G.vars[vid] ? vid : null;
};
export function preferSeed(base) {
    const vid = preferOf(base);
    if (!vid) return null;
    const G = state.genetics,
        v = G.vars[vid];
    if (G.seeds[vid] > 0) {
        G.seeds[vid]--;
        return vid;
    }
    const extra = Math.max(0, seedPrice(v) - (ITEMS[base].cost || 0));
    if (v.fixed && seedbankOpen() && state.money >= extra) {
        spend(extra);
        return vid;
    }
    return null;
}

// une récolte de variété : ses produits gardent leur nom, et parfois une graine tombe
export function harvestVariety(vid, qty) {
    const G = state.genetics;
    const v = G.vars[vid];
    if (!v) return;
    G.stock[vid] = (G.stock[vid] || 0) + qty;
    if (Math.random() < GX.seedDrop + varTrait(vid, 'seedy') * FX.seedy) G.seeds[vid] = (G.seeds[vid] || 0) + 1;
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
export const varietyMult = v => Math.min(GX.varietySellCap, 1 + flavorGain(v.g) / GX.varietySellDiv + (v.g.halo ? 0.3 : 0));
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
                .map(vid => [vid, Math.min(QX.varCap, flavorGain(G.vars[vid].g, taste.length ? taste : FLAVOR_IDS))])
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
            const q = qual(k);
            for (const [pts, f] of TIER_ORDER) {
                const t = Math.min(left, q[f]);
                q[f] -= t;
                left -= t;
                points += t * pts;
            }
        }
        state.inventory[k] -= n;
    }
    return scoreTier(units ? points / units : 0);
}

// du plus haut rang au plus bas : [points d'un ingrédient, champ de state.quality]
const TIER_ORDER = [
    [4, 'd'],
    [3, 'p'],
    [2, 'g'],
    [1, 's'],
];
export const scoreTier = score => (score >= QX.diamScore ? 4 : score >= QX.platScore ? 3 : score >= GX.goldScore ? 2 : score >= GX.silverScore ? 1 : 0);

// ce que donnerait un lot lancé maintenant, sans rien prendre : { q, d, p, g, s } (rang du lot, unités d'ingrédients de chaque qualité utilisées)
export function previewBatch(rid) {
    const r = RECIPES[rid];
    const G = state.genetics;
    const out = { q: 0, d: 0, p: 0, g: 0, s: 0 };
    if (!r || !G || !G.bestFirst) return out;
    const taste = recipeTaste(rid);
    let points = 0,
        units = 0;
    for (const [k, n] of Object.entries(r.ing)) {
        units += n;
        let left = n;
        if (FLAVORS[k]) {
            const list = Object.keys(G.stock)
                .filter(vid => G.vars[vid] && G.vars[vid].base === k && G.stock[vid] > 0)
                .map(vid => [G.stock[vid], Math.min(QX.varCap, flavorGain(G.vars[vid].g, taste.length ? taste : FLAVOR_IDS))])
                .sort((x, y) => y[1] - x[1]);
            for (const [have, gain] of list) {
                const d = Math.min(left, have);
                left -= d;
                points += d * gain;
            }
        }
        const q = state.quality[k];
        if (left > 0 && q) {
            for (const [pts, f] of TIER_ORDER) {
                const t = Math.min(left, q[f] || 0);
                left -= t;
                points += t * pts;
                out[f] += t;
            }
        }
    }
    out.q = scoreTier(units ? points / units : 0);
    return out;
}

// ---------------- les bêtes ----------------
export const animalBase = (a, k) => (EXTRA_ANIMAL.includes(k) ? extraBase(k, a.type) : (ANIMAL_BASE[a.type] || [])[CORE_ANIMAL.indexOf(k)] || 2);
export const animalTrait = (a, k) => (a && a.g && a.g.t[k] ? traitOf(a.g, k) : animalBase(a, k));
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
export const animalGain = a => CORE_ANIMAL.reduce((x, k) => x + Math.max(0, animalTrait(a, k) - animalBase(a, k)), 0);

export const breedable = (a, b) => a && b && a !== b && a.type === b.type && isAdult(a) && isAdult(b) && !a.sick && !b.sick;
export const animalByUid = uid => state.animals.find(a => a.uid === uid);

export function startBreed(ua, ub, at) {
    const G = state.genetics;
    const a = animalByUid(ua),
        b = animalByUid(ub);
    if (!breedOpen() || G.breeds.length >= breedSlots() || !breedable(a, b) || breeding(ua) || breeding(ub)) return false;
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
    G.breeds.push({ a: ua, b: ub, type: a.type, until: now() + GX.breedTime * 1000 });
    sfx(a.type);
    burst(at, 'sparkle', 10);
    float(at, [`-${fmt(cost)}`, ['ui', 'coin']], 'bad', -14);
    tip('genetics');
    changed('lab');
    return true;
}

// la lignée (1.2) : parents et grands-parents, en petites fiches qui survivent à la vente des bêtes
const snapLooks = g =>
    g && g.l ? { l: JSON.parse(JSON.stringify(g.l)), halo: !!g.halo, coat: g.coat ? JSON.parse(JSON.stringify(g.coat)) : undefined } : null;
export function lineSnap(x, deep) {
    if (!x) return null;
    const isVar = !!x.kind;
    const s = isVar
        ? { n: varName(x), b: x.base, g: snapLooks(x.g), gen: x.gen || 0 }
        : x.t
          ? { n: x.name || x.n, t: x.t, g: x.g, gen: x.gen || 0 }
          : { n: x.name, t: x.type, g: snapLooks(x.g), gen: x.gen || 0, u: x.uid };
    if (deep && x.lin) s.lin = x.lin.map(y => y && { n: y.n, t: y.t, b: y.b, g: y.g, gen: y.gen });
    return s;
}
// une plante sauvage dans une lignée : son espèce, génération 0
const wildSnap = id => ({ n: ITEMS[id] ? ITEMS[id].name : id, b: id, g: null, gen: 0 });

// la naissance : un petit dont les gènes viennent des deux parents ; parfois des jumeaux (1.7)
export const breeding = uid => !!(state.genetics && state.genetics.breeds.some(b => b.a === uid || b.b === uid));
export const breedFree = () => breedOpen() && state.genetics.breeds.length < breedSlots();
export function breedTick() {
    const G = state.genetics;
    if (!G || !G.breeds || !G.breeds.length) return false;
    let ch = false;
    for (const c of [...G.breeds]) {
        if (now() < c.until || herdFull()) continue;
        G.breeds.splice(G.breeds.indexOf(c), 1);
        ch = true;
        const a = animalByUid(c.a),
            b = animalByUid(c.b);
        if (!a || !b) continue;
        const n = Math.random() < GX.twins + animalFertile(a, b) ? 2 : 1;
        const born = [];
        for (let j = 0; j < n && !herdFull(); j++) born.push(birth(a, b, c.type));
        if (!born.length) continue;
        const [baby] = born;
        const e = c.type === 'chicken' || c.type === 'cow' || c.type === 'goat' ? 'e' : '';
        toast(
            born.length > 1
                ? `Des jumeaux ! ${baby.name} et ${born[1].name} sont nés à l’étable de sélection`
                : `${baby.name} est né${e} à l’étable de sélection${baby.mut ? ' : une mutation !' : ''}`,
            ['animal', c.type],
        );
        sfx(c.type);
        addXp((60 + scaleLvl() * 5) * born.length);
    }
    return ch;
}
function birth(a, b, type) {
    const G = state.genetics;
    const { g, mutated } = crossGenomes(a.g, b.g, mutationRate());
    const baby = newAnimal(type);
    baby.uid = 'a' + G.next++;
    baby.g = g;
    baby.gen = Math.max(a.gen || 0, b.gen || 0) + 1;
    baby.parents = [a.name, b.name];
    baby.lin = [lineSnap(a, true), lineSnap(b, true)];
    if (type === 'horse') studBorn(baby, a, b);
    if (mutated) baby.mut = true;
    if (a.race && a.race === b.race) baby.race = a.race;
    placeAnimal(baby);
    state.animals.push(baby);
    state.stats.births = (state.stats.births || 0) + 1;
    return baby;
}

// 1.7 : ce que les gènes d'une bête lui apportent, en mots simples
export function geneEffects(a) {
    if (!a || !a.g) return [];
    const up = k => Math.max(0, animalTrait(a, k) - animalBase(a, k));
    const out = [];
    const q = up('rich') + up('soft') + up('aroma');
    if (q) out.push(`produits de meilleure qualité (+${q})`);
    if (animalTrait(a, 'yield') > 2) out.push(`+${Math.round(animalYieldGene(a) * 100)} % de produits`);
    if (animalTrait(a, 'speed') > 2) out.push(`produit ${Math.round((animalSpeedGene(a) - 1) * 100)} % plus vite`);
    if (animalTrait(a, 'appetite') > 2) out.push(`mange moins (${Math.round((animalTrait(a, 'appetite') - 2) * 7)} % de repas offerts)`);
    if (animalRobust(a)) out.push('presque jamais malade');
    return out;
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
    addXp(250 + scaleLvl() * 10, at);
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
    const pool = Object.keys(FLAVORS).filter(id => ITEMS[id].type === 'crop' && lvOk(ITEMS[id]) && !ITEMS[id].island && storyOk(ITEMS[id]));
    const base = pickRand(pool);
    const f = FLAVORS[base];
    const order = FLAVOR_IDS.map((k, j) => [k, f[j]]).sort((x, y) => y[1] - x[1]);
    const need = { [order[0][0]]: Math.min(5, order[0][1] + 1 + (Math.random() < 0.4 ? 1 : 0)) };
    if (Math.random() < 0.6) need[order[1][0]] = Math.min(5, order[1][1] + 1);
    G.chef = { base, need, qty: 5, gold: Math.round(ITEMS[base].sell * 5 * 9 + scaleLvl() * 200), until: t + GX.chefHours * 3600 * 1000 };
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
    addXp(150 + scaleLvl() * 8, at);
    G.chef = { wait: now() + 60 * 60 * 1000, done: true };
    if (G.goal && G.goal.from === 'chef') G.goal = null;
    sfx('level');
    burst(at, 'sparkle', 16);
    toast(`Le chef est ravi : ${fmt(c.gold)} pièces et ${qtyName(2, ITEMS[mat].name)}`, ['ui', 'star']);
    return true;
}

// ---------------- le Salon de l'agriculture ----------------
const salonSeed = t => Math.floor(t / SALON_PERIOD);
// 1.45.2 : l'ancien Salon devient le concours du potager (variétés seulement), ouvert avec le labo des plantes ;
// les bêtes, elles, vont au Comice agricole (comice.js)
const PLANT_CRITS = SALON_CRITERIA.filter(c => c.kind === 'plant');
export const potagerOpen = () => plantLabOpen();
export function ensureSalon() {
    if (!potagerOpen()) return false;
    const G = state.genetics;
    const t = now();
    const k = salonSeed(t);
    // 1.47.2 : un ancien Salon sur un critère de bête (cornes, robe, lait…) est remplacé tout de suite par un critère de plante
    const animalCrit = G.salon && !PLANT_CRITS.some(c => c.id === G.salon.crit);
    if (G.salon && G.salon.k === k && !animalCrit) return false;
    // l'ancien Salon se termine : on remet les prix
    if (G.salon && G.salon.entry && !G.salon.paid && !animalCrit) awardSalon(G.salon);
    const crit = PLANT_CRITS[k % PLANT_CRITS.length];
    const lvlBoost = Math.min(1.2, (state.level - GX.lvl) * 0.08);
    const rivals = RIVALS.slice(0, 3).map((r, j) => ({
        name: `${r.owner} · ${r.name}`,
        score: Math.round((2.8 + j * 0.6 + lvlBoost + Math.random() * 0.8) * 10) / 10,
    }));
    G.salon = { k, crit: crit.id, end: (k + 1) * SALON_PERIOD, rivals, entry: null, paid: false };
    return true;
}
export const salonCrit = () => SALON_CRITERIA.find(c => c.id === ((state.genetics && state.genetics.salon) || {}).crit);

// la note d'une création pour le critère du Salon
export function salonScore(crit, target) {
    if (!target) return 0;
    const g = target.g;
    if (crit.trait === 'looks') {
        const l = looksOf(g);
        // 1.22 : les apparences rares et les finitions comptent davantage
        const sz = l.size === 3 || (l.size === 6 && g.form) ? 2 : l.size === 2 || l.size === 5 ? 1 : 0;
        const s = sz + (l.color >= 9 ? 1.6 : l.color ? 1.2 : 0) + (l.pattern >= 8 ? 1.3 : l.pattern ? 1 : 0) + (l.finish ? 1.5 : 0) + (l.halo ? 1.5 : 0);
        return Math.round(s * 10) / 10;
    }
    // cornes et toison : plus le trait est marqué, mieux c'est, puis la robustesse ou la douceur départagent
    if (crit.trait === 'horns') return featureOf(g, 'horns') >= 2 ? featureOf(g, 'horns') + traitOf(g, 'robust') / 2 : 0;
    if (crit.trait === 'coat') return featureOf(g, 'coat') ? 2 + featureOf(g, 'coat') + traitOf(g, 'soft') / 2 : traitOf(g, 'soft') / 2;
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
                (crit.id !== 'richMilk' || ['cow', 'goat', 'buffalo', 'donkey', 'ewe', 'yak'].includes(a.type)) &&
                (crit.id !== 'softWool' || ['sheep', 'alpaca', 'rabbit', 'mohairGoat'].includes(a.type)) &&
                (crit.trait !== 'horns' || FEATURES.horns.species.includes(a.type)) &&
                (crit.trait !== 'coat' || FEATURES.coat.species.includes(a.type)),
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
    toast(`${c.name} est inscrite au concours du potager (note ${String(c.score).replace('.', ',')})`, ['ui', 'trophy']);
    return true;
}
export const salonRank = s => (s.entry ? 1 + s.rivals.filter(r => r.score > s.entry.score).length : 0);
function awardSalon(s) {
    s.paid = true;
    const r = salonRank(s);
    if (!r) return;
    const coins = Math.round(([0, 12000, 6000, 3000, 1000][r] * (1 + scaleLvl() * 0.05)) / 10) * 10;
    const G = state.genetics;
    const first = r === 1 && !G.salonWon[s.crit];
    const rub = r === 1 ? (first ? GX.salonFirstRuban : GX.salonRuban) : 0;
    if (r === 1) G.salonWon[s.crit] = (G.salonWon[s.crit] || 0) + 1;
    earn(Math.round(coins), null);
    state.prestige.rubans += rub;
    state.stats.salonWins = (state.stats.salonWins || 0) + (r === 1 ? 1 : 0);
    emit('salonResult', { rank: r, coins: Math.round(coins), rub });
}
export function salonTick() {
    const G = state.genetics;
    if (!G || !potagerOpen()) return false;
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
    for (const c of state.genetics.crosses || [])
        if (now() >= c.until && !c.told) {
            c.told = true;
            toast('Le croisement est prêt : découvrez la portée au labo', ['ui', 'flowers']);
            ch = true;
        }
    if (checkGoal()) ch = true;
    if (breedTick()) ch = true;
    if (ensureChef()) ch = true;
    if (salonTick()) ch = true;
    return ch;
}

// renommer une variété ou une race (1.2)
const cleanName = name =>
    String(name || '')
        .trim()
        .slice(0, 22);
export function renameVariety(id, name) {
    const v = state.genetics && state.genetics.vars[id],
        n = cleanName(name);
    if (!v || !n) return false;
    v.name = n;
    toast(`Variété renommée : ${n}`, ['ui', 'pencil']);
    return true;
}
export function renameRace(id, name) {
    const r = state.genetics && state.genetics.races[id],
        n = cleanName(name);
    if (!r || !n) return false;
    r.name = n;
    toast(`Race renommée : ${n}`, ['ui', 'pencil']);
    return true;
}
