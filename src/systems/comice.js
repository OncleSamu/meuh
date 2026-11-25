// L'Élevage (1.45 → 1.179) : Comice agricole 2.0.
// - Grand Comice de la semaine (3 à 4 catégories, brossage, Parade du Jury, préparation tactique, gros prix & rubans)
// - Concours cantonal express quotidien (3 épreuves/jour, jugement immédiat, pièces, cocardes, réputation & plaque Primée)
// - Pouvoirs permanents des bêtes Primées (+25 % vitesse, qualité améliorée, Aura de championne au pré, lignée d'élite aux naissances)
// - Palmarès à 5 paliers permanents (conservés au Prestige) + Boutique des Cocardes du Comice.

import { state, scaleLvl, ecoLvl } from '../core/state.js';
import { now } from '../core/clock.js';
import { view } from '../core/view.js';
import { pickRand } from '../core/format.js';
import { emit, toast, sfx, changed } from '../core/bus.js';
import { BIRTHS, NAMES, ANIMALS } from '../data/animals.js';
import { RIVALS } from '../data/village.js';
import {
    COMICE,
    COMICE_CAT,
    COMICE_PRIZE_FX,
    COMICE_EXPRESS,
    COMICE_PREPS,
    COMICE_PALM_TIERS,
    COMICE_SHOP,
} from '../data/elevage.js';
import { RIVAL_STYLE } from './rivals.js';
import { isAway } from './port.js';
import { animalTrait, animalBase, looksOf, featureLooks, CORE_ANIMAL, salonOpen, wildAnimal } from './genetics.js';
import { earn, spend, addXp } from './player.js';
import { addElevRep } from './fair.js';
import { addPhoto } from './style.js';
import { tip } from './tips.js';
import { penKeyOf, pastureFree } from './pastures.js';
import { ensureTcg } from './tcg.js';

const isAdult = a => a && a.adult !== false;

export const comiceOpen = () => state.level >= COMICE.lvl;
// le grand hall (l'ancien chantier du Salon) : une catégorie de plus et des prix doublés
export const comiceHall = () => salonOpen();
// les semaines commencent le lundi
const MONDAY = Date.UTC(2026, 0, 5);
export const comiceWeek = (t = now()) => Math.floor((t - MONDAY) / COMICE.week);
export const comiceEnd = () => MONDAY + (comiceWeek() + 1) * COMICE.week;
const dayNo = () => Math.floor(now() / 86400000);

export function ensureComice() {
    if (!state.comice || typeof state.comice !== 'object') state.comice = {};
    const c = state.comice;
    c.wins = c.wins || {};
    c.cats = Array.isArray(c.cats) ? c.cats : [];
    if (!Number.isFinite(c.cocardes)) c.cocardes = 0;
    c.palmClaimed = c.palmClaimed || {};
    if (!Number.isFinite(c.goldHayUntil)) c.goldHayUntil = 0;
    if (!Number.isFinite(c.elixirs)) c.elixirs = 0;
    return c;
}

const showable = a => isAdult(a) && !a.sick && !isAway(a) && !a.box && !BIRTHS.skip.includes(a.type);
export const comiceTypes = () => ownedTypes();
const ownedTypes = () => [...new Set(state.animals.filter(showable).map(a => a.type))];

// ---------------- 1.179 : Pouvoirs permanents des bêtes Primées, du Palmarès & du Foin d'or ----------------
export const comiceWinSpeciesCount = () => {
    const w = state.comice && state.comice.wins;
    return w ? Object.keys(w).filter(k => w[k] > 0 && COMICE_CAT[k]).length : 0;
};

export function comicePalmTotals() {
    const n = comiceWinSpeciesCount();
    let speed = 0,
        qual = 0,
        rare = 0;
    for (const t of COMICE_PALM_TIERS) {
        if (n >= t.need) {
            speed += t.speed;
            qual += t.qual;
            rare += t.rare;
        }
    }
    return { speed, qual, rare };
}

export const comiceGoldHayLeftMs = () => Math.max(0, ((state.comice && state.comice.goldHayUntil) || 0) - now());
export const comiceGoldHayMult = () => (comiceGoldHayLeftMs() > 0 ? 1.35 : 1);

// Aura de championne dans un pré k : +10 % par bête primée présente dans ce pré (max +30 %)
export function comicePastureAura(k, excludeAnimal = null) {
    if (!Array.isArray(state.animals)) return 0;
    let champs = 0;
    for (const b of state.animals) {
        if (b && b !== excludeAnimal && !b.box && (b.p || 0) === k && isAdult(b) && !b.sick && (b.prize || 0) > 0) champs++;
    }
    return Math.min(COMICE_PRIZE_FX.auraMax, champs * COMICE_PRIZE_FX.auraPer);
}

// Multiplicateur global Comice sur la vitesse de production d'un animal a
export function comiceAnimalMult(a) {
    if (!a) return 1;
    const palm = comicePalmTotals();
    const selfPrize = (a.prize || 0) > 0 ? COMICE_PRIZE_FX.speed : 0;
    const aura = comicePastureAura(a.p || 0, a);
    return (1 + selfPrize + aura + palm.speed) * comiceGoldHayMult();
}

// Amélioration de qualité des produits collectés d'une bête (bête primée + Palmarès)
export function comiceQualityBoost(a, q) {
    const palm = comicePalmTotals();
    const chance = ((a && a.prize > 0 ? COMICE_PRIZE_FX.qualChance : 0) + palm.qual);
    if (chance <= 0 || q >= 4) return q;
    return Math.random() < chance ? Math.min(4, q + 1) : q;
}

// Élixir de lignée & bonus de naissance (parent primé + Palmarès + Élixir)
export const comiceElixirCount = () => (state.comice && state.comice.elixirs) || 0;

export function applyComiceBirthBonus(baby, a, b) {
    if (!baby || !baby.g) return false;
    const hasElixir = comiceElixirCount() > 0;
    const hasPrize = !!((a && a.prize > 0) || (b && b.prize > 0));
    const palm = comicePalmTotals();
    if (!hasElixir && !hasPrize && palm.rare <= 0) return false;

    if (hasElixir) state.comice.elixirs = Math.max(0, state.comice.elixirs - 1);

    // +1 point de trait garanti si parent primé ou Élixir actif
    if (hasPrize || hasElixir) {
        const traitKey = pickRand(CORE_ANIMAL);
        const pair = baby.g.t && baby.g.t[traitKey];
        if (pair && pair.length === 2) {
            pair[0] = [Math.min(8, pair[0][0] + 1), pair[0][1]];
            pair[1] = [Math.min(8, pair[1][0] + 1), pair[1][1]];
        }
    }

    // Chances de robe / finition rare (garantie avec Élixir, augmentée avec parent primé + Palmarès)
    const rareChance = (hasElixir ? 1 : 0) + (hasPrize ? COMICE_PRIZE_FX.birthRare : 0) + palm.rare;
    if (baby.g.l && Math.random() < rareChance) {
        // Couleur visible si absente
        if (baby.g.l.color && baby.g.l.color[0][0] === 0 && baby.g.l.color[1][0] === 0) {
            const col = 1 + Math.floor(Math.random() * 10);
            baby.g.l.color = [
                [col, 1],
                [col, 0],
            ];
        }
        // Finition rare (doré / nacré / argenté...) si absente
        if (!baby.g.l.finish || (baby.g.l.finish[0][0] === 0 && baby.g.l.finish[1][0] === 0)) {
            const fin = 1 + Math.floor(Math.random() * 3);
            baby.g.l.finish = [
                [fin, 1],
                [0, 0],
            ];
        }
    }
    if (hasElixir) {
        toast(`Élixir de lignée : ${baby.name} naît avec une lignée d’élite !`, ['ui', 'sparkle']);
    }
    return true;
}

// ---------------- Notation sur 100 ----------------
// La note d'une bête, de 0 à 100, et son détail (compatible avec l'ancienne signature animalScore(a, brush, jury))
export function animalScore(a, brush = 0, jury = null, prepId = null, parade = 0) {
    const W = COMICE.w;
    const gain = CORE_ANIMAL.reduce((x, k) => x + Math.max(0, animalTrait(a, k) - animalBase(a, k)), 0);
    let beauty = 0;
    if (a.g) {
        const l = looksOf(a.g);
        beauty = (l.color ? 1 : 0) + (l.pattern ? 1 : 0) + (l.finish ? 2 : 0) + (l.halo ? 3 : 0) + featureLooks(a.g, a.type).filter(Boolean).length;
    }
    const parts = {
        genes: Math.round(Math.min(1, gain / COMICE.genesFull) * W.genes),
        beauty: Math.round(Math.min(1, beauty / COMICE.beautyFull) * W.beauty),
        hearts: Math.round(((a.love || 0) / 5) * W.hearts),
        show: Math.round(Math.max(0, Math.min(1, brush)) * W.show),
    };
    const prep = prepId && COMICE_PREPS[prepId];
    if (prep && parts[prep.stat] !== undefined) {
        parts[prep.stat] = Math.min(W[prep.stat] + prep.bonus, parts[prep.stat] + prep.bonus);
    }
    const paradePts = Math.round(Math.max(0, Math.min(1, parade || 0)) * COMICE.paradeMax);
    // le coup de cœur du jury : ce qu'il regarde surtout compte une fois et demie
    const bonus = jury && parts[jury] ? Math.round(parts[jury] * (COMICE.jury - 1)) : 0;
    return {
        score: Math.min(100, parts.genes + parts.beauty + parts.hearts + parts.show + bonus + paradePts),
        parts,
        bonus,
        paradePts,
    };
}

// la note des fermes voisines dans une catégorie : grandit avec le niveau, selon le style de chacune
function rivalScores(type, spreadBonus = 0) {
    const base = COMICE.rivalBase + ecoLvl() * COMICE.rivalPerLvl + spreadBonus;
    const mine = new Set(state.animals.map(a => a.name));
    const names = [...(NAMES[type] || ['Belle'])].filter(n => !mine.has(n)).sort(() => Math.random() - 0.5);
    return RIVALS.map((_, k) => ({
        k,
        score: Math.max(5, Math.min(96, Math.round(base * RIVAL_STYLE[k].f + (Math.random() - 0.5) * COMICE.rivalSpread))),
        name: names[k % names.length] || 'Belle',
        hue: Math.floor(Math.random() * 6),
    }));
}

export const JURY = {
    genes: 'les gènes',
    beauty: 'la beauté',
    hearts: 'l’affection',
    show: 'la présentation',
};

const newCat = type => ({
    id: type,
    entry: null,
    brush: 0,
    brushDay: 0,
    parade: 0,
    paradeDay: 0,
    prep: null,
    jury: pickRand(Object.keys(JURY)),
    rivals: rivalScores(type),
});

function newEdition() {
    const c = ensureComice();
    const n = COMICE.cats + (comiceHall() ? 1 : 0);
    const pool = [...ownedTypes()].sort(() => Math.random() - 0.5);
    c.cats = pool.slice(0, n).map(newCat);
    c.wk = comiceWeek();
    c.paid = false;
}

export const catName = cat => COMICE_CAT[cat.id] || cat.id;
export const catOf = id => ensureComice().cats.find(x => x.id === id);
const entryAnimal = cat => (cat.entry ? state.animals.find(a => a.uid === cat.entry) : null);

export function catScore(cat) {
    const a = entryAnimal(cat);
    return a && showable(a) ? animalScore(a, cat.brush, cat.jury, cat.prep, cat.parade || 0).score : 0;
}
export const catRank = cat => {
    const s = catScore(cat);
    return s ? 1 + cat.rivals.filter(r => r.score > s).length : 0;
};

export function comiceCandidates(id) {
    const cat = catOf(id);
    if (!cat) return [];
    return state.animals
        .filter(a => a.type === id && showable(a))
        .map(a => ({
            id: a.uid,
            name: a.name,
            a,
            ...animalScore(a, cat.entry === a.uid ? cat.brush : 0, cat.jury, cat.entry === a.uid ? cat.prep : null, cat.entry === a.uid ? cat.parade || 0 : 0),
        }))
        .sort((a, b) => b.score - a.score);
}

export function comiceEnter(id, who) {
    const cat = catOf(id);
    if (!cat || state.comice.paid || !comiceCandidates(id).some(x => x.id === who)) return false;
    if (cat.entry !== who) {
        cat.brush = 0;
        cat.parade = 0;
    }
    cat.entry = who;
    sfx('pop');
    tip('comice');
    changed('animals');
    return true;
}

// ---------------- Préparation tactique (Grand Comice) ----------------
export const prepCost = () => Math.round((COMICE_PREPS.groom.cost * (1 + scaleLvl() * 0.08)) / 50) * 50;

export function setComicePrep(catId, prepId) {
    const cat = catOf(catId);
    const p = COMICE_PREPS[prepId];
    if (!cat || !p || !cat.entry || state.comice.paid || cat.prep === prepId) return false;
    const cost = prepCost();
    if (state.money < cost) {
        toast('Pas assez de pièces pour cette préparation.', ['ui', 'coin']);
        sfx('error');
        return false;
    }
    spend(cost);
    cat.prep = prepId;
    sfx('pop');
    toast(`${p.name} appliquée !`, ['ui', 'ribbon']);
    changed('animals');
    return true;
}

// ---------------- Mini-jeu 1 : Brossage & Mini-jeu 2 : Parade du Jury ----------------
export const canBrush = cat => !!(cat && cat.entry && cat.brushDay !== dayNo() && !state.comice.paid);
export function comiceBrush(id, q) {
    const cat = catOf(id);
    if (!canBrush(cat)) return false;
    cat.brushDay = dayNo();
    cat.brush = Math.max(cat.brush || 0, Math.max(0, Math.min(1, q)));
    changed('animals');
    return true;
}

export const canParade = cat => !!(cat && cat.entry && cat.paradeDay !== dayNo() && !state.comice.paid);
export function comiceParade(id, q) {
    const cat = catOf(id);
    if (!canParade(cat)) return false;
    cat.paradeDay = dayNo();
    cat.parade = Math.max(cat.parade || 0, Math.max(0, Math.min(1, q)));
    changed('animals');
    return true;
}

// ---------------- 1.179 : Concours cantonal express quotidien (3/jour, résultat immédiat) ----------------
export function ensureExpress() {
    const c = ensureComice();
    const d = dayNo();
    if (c.expDay === d && Array.isArray(c.express) && c.express.length === COMICE_EXPRESS.perDay) return c.express;
    const pool = [...ownedTypes()].sort(() => Math.random() - 0.5);
    const themes = [...COMICE_EXPRESS.themes].sort(() => Math.random() - 0.5);
    c.expDay = d;
    c.express = Array.from({ length: COMICE_EXPRESS.perDay }, (_, i) => {
        const type = pool.length ? pool[i % pool.length] : null;
        const theme = themes[i % themes.length];
        return {
            idx: i,
            type,
            jury: theme.id,
            themeName: theme.name,
            themeDesc: theme.desc,
            rivals: type ? rivalScores(type, -3) : [],
            done: false,
            result: null,
        };
    });
    return c.express;
}

export function comiceExpressList() {
    if (!comiceOpen()) return [];
    const list = ensureExpress();
    // Si le joueur vient d'acquérir sa 1re espèce aujourd'hui, remplir les slots vides
    const pool = ownedTypes();
    if (pool.length) {
        list.forEach((ev, i) => {
            if (!ev.done && (!ev.type || !pool.includes(ev.type))) {
                ev.type = pool[i % pool.length];
                ev.rivals = rivalScores(ev.type, -3);
            }
        });
    }
    return list;
}

export const comiceExpressLeft = () => comiceExpressList().filter(ev => !ev.done && ev.type && state.animals.some(a => a.type === ev.type && showable(a))).length;

export function comiceExpressCandidates(idx) {
    const ev = comiceExpressList()[idx];
    if (!ev || !ev.type) return [];
    return state.animals
        .filter(a => a.type === ev.type && showable(a))
        .map(a => ({ id: a.uid, name: a.name, a, ...animalScore(a, 0.5, ev.jury) }))
        .sort((a, b) => b.score - a.score);
}

export function runComiceExpress(idx, animalUid, paradeScore = 0.5) {
    if (!comiceOpen()) return null;
    const c = ensureComice();
    const list = comiceExpressList();
    const ev = list[idx];
    if (!ev || ev.done || !ev.type) return null;
    const a = state.animals.find(x => x.uid === animalUid && x.type === ev.type && showable(x));
    if (!a) return null;

    const pNorm = Math.max(0, Math.min(1, paradeScore));
    const evalRes = animalScore(a, 0.65, ev.jury, null, pNorm);
    const rank = 1 + ev.rivals.filter(r => r.score > evalRes.score).length;

    const mult = (1 + scaleLvl() * 0.14) * (comiceHall() ? 1.5 : 1);
    const coins = rank <= 3 ? Math.round((COMICE_EXPRESS.prizes[rank] * mult) / 10) * 10 : Math.round(600 * mult);
    const cocardes = rank <= 3 ? COMICE_EXPRESS.cocardes[rank] : 1; // 1 cocarde d'encouragement même hors podium
    const rep = rank <= 3 ? COMICE_EXPRESS.rep[rank] : 0;
    const xp = rank <= 3 ? COMICE_EXPRESS.xp[rank] : 25;

    state.income.comice = (state.income.comice || 0) + coins;
    earn(coins, null);
    addXp(xp);
    if (rep) addElevRep(rep);
    c.cocardes = (c.cocardes || 0) + cocardes;
    state.stats.comiceExpress = (state.stats.comiceExpress || 0) + 1;

    let gotPrize = false;
    if (rank === 1) {
        const firstSpecies = !c.wins[ev.type];
        c.wins[ev.type] = (c.wins[ev.type] || 0) + 1;
        state.stats.salonWins = (state.stats.salonWins || 0) + 1;
        if (evalRes.score >= COMICE_EXPRESS.prizeMinScore && !a.prize) {
            a.prize = 1;
            gotPrize = true;
        }
        if (firstSpecies) addPhoto('animal', ev.type, `${COMICE_CAT[ev.type]} : premier prix`, 'Comice agricole');
    }

    ev.done = true;
    ev.result = {
        animalName: a.name,
        score: evalRes.score,
        rank,
        coins,
        cocardes,
        rep,
        xp,
        gotPrize,
    };

    sfx(rank === 1 ? 'level' : 'coin');
    toast(
        rank === 1
            ? `1re place ! +${coins.toLocaleString('fr-FR')} pièces · +${cocardes} cocardes${gotPrize ? ' · Plaque « Primée » !' : ''}`
            : `${rank}e place · +${coins.toLocaleString('fr-FR')} pièces · +${cocardes} cocarde${cocardes > 1 ? 's' : ''}`,
        ['ui', 'ribbon'],
    );
    changed('animals');
    return ev.result;
}

// ---------------- 1.179 : Palmarès à paliers permanents ----------------
export function comicePalmClaimable() {
    const c = ensureComice();
    const n = comiceWinSpeciesCount();
    return COMICE_PALM_TIERS.filter((t, i) => n >= t.need && !c.palmClaimed[i]).length;
}

export function claimComicePalm(tierIdx) {
    const c = ensureComice();
    const t = COMICE_PALM_TIERS[tierIdx];
    if (!t || comiceWinSpeciesCount() < t.need || c.palmClaimed[tierIdx]) return false;
    c.palmClaimed[tierIdx] = true;
    state.income.comice = (state.income.comice || 0) + t.coins;
    earn(t.coins, null);
    if (t.rubans) state.prestige.rubans = (state.prestige.rubans || 0) + t.rubans;
    sfx('level');
    toast(`Palier « ${t.name} » réclamé !`, ['ui', 'ribbon']);
    changed('animals');
    return true;
}

// ---------------- 1.179 : Boutique des Cocardes du Comice ----------------
export const comiceCocardes = () => (state.comice && state.comice.cocardes) || 0;

export function buyComiceShop(itemId, targetUid = null) {
    if (!comiceOpen()) return false;
    const c = ensureComice();
    const item = COMICE_SHOP.find(x => x.id === itemId);
    if (!item) return false;
    if (comiceCocardes() < item.cost) {
        toast('Pas assez de cocardes du Comice.', ['ui', 'ribbon']);
        sfx('error');
        return false;
    }

    if (itemId === 'goldHay') {
        c.cocardes -= item.cost;
        const base = Math.max(now(), c.goldHayUntil || 0);
        c.goldHayUntil = base + 4 * 3600 * 1000;
        sfx('level');
        toast('Foin d’or actif : +35 % vitesse sur tous vos prés pendant 4 h !', ['item', 'feed']);
        changed('animals');
        return true;
    }

    if (itemId === 'treat') {
        const a = state.animals.find(x => x.uid === targetUid && !x.box);
        if (!a || (a.love || 0) >= 5) {
            toast('Choisissez une bête avec moins de 5 cœurs.', ['ui', 'heart']);
            return false;
        }
        c.cocardes -= item.cost;
        a.love = Math.min(5, (a.love || 0) + 1);
        sfx('pop');
        toast(`${a.name} adore sa Friandise royale (+1 cœur) !`, ['ui', 'heart']);
        changed('animals');
        return true;
    }

    if (itemId === 'elixir') {
        c.cocardes -= item.cost;
        c.elixirs = (c.elixirs || 0) + 1;
        sfx('level');
        toast('Élixir de lignée ajouté : actif à la prochaine naissance au pré !', ['ui', 'sparkle']);
        changed('animals');
        return true;
    }

    if (itemId === 'booster') {
        c.cocardes -= item.cost;
        const T = ensureTcg();
        T.freePacks = (T.freePacks || 0) + 1;
        sfx('level');
        toast('Booster MeuhCG offert ! Ouvrez-le dans Menu › Cartes MeuhCG.', ['ui', 'star']);
        changed('animals');
        return true;
    }

    if (itemId === 'champ') {
        const pool = ownedTypes().filter(t => ANIMALS[t] && !penKeyOf(t));
        const type = pool.length ? pickRand(pool) : 'cow';
        const pen = state.pastures.findIndex((_, k) => pastureFree(k) > 0);
        if (pen < 0) {
            toast('Aucun pré libre pour accueillir la bête championne.', ['ui', 'barn']);
            sfx('error');
            return false;
        }
        c.cocardes -= item.cost;
        const G = state.genetics;
        const g = wildAnimal(type, true);
        // +4 points de gènes répartis sur les traits de base + robe et finition rares garanties
        for (let i = 0; i < 4; i++) {
            const k = pickRand(CORE_ANIMAL);
            if (g.t && g.t[k]) {
                g.t[k][0] = [Math.min(8, g.t[k][0][0] + 1), 1];
                g.t[k][1] = [Math.min(8, g.t[k][1][0] + 1), 0];
            }
        }
        if (g.l) {
            const col = 1 + Math.floor(Math.random() * 10);
            const pat = 1 + Math.floor(Math.random() * 7);
            const fin = 1 + Math.floor(Math.random() * 3);
            g.l.color = [
                [col, 1],
                [col, 0],
            ];
            g.l.pattern = [
                [pat, 1],
                [0, 0],
            ];
            g.l.finish = [
                [fin, 1],
                [0, 0],
            ];
        }
        const used = new Set(state.animals.map(a => a.name));
        const names = (NAMES[type] || ['Champion']).filter(n => !used.has(n));
        const name = names.length ? pickRand(names) : `${(NAMES[type] || ['Étoile'])[0]} d’Or`;
        const beast = {
            type,
            food: 2,
            prodProgress: 0,
            stack: 0,
            adult: true,
            age: 9999,
            name,
            love: 3,
            petDay: 0,
            produced: 0,
            prize: 1,
            uid: 'a' + (G ? G.next++ : Date.now()),
            g,
            gen: 1,
            p: pen,
        };
        state.animals.push(beast);
        sfx('level');
        toast(`${name} (${ANIMALS[type].name} primée d’élite) rejoint votre pré !`, ['animal', type]);
        changed('animals');
        return true;
    }

    return false;
}

// ---------------- Résultats du Grand Comice de la semaine ----------------
function award() {
    const c = ensureComice();
    c.paid = true;
    const mult = (1 + scaleLvl() * 0.14) * (comiceHall() ? 2 : 1);
    const lines = [];
    let firsts = 0;
    for (const cat of c.cats) {
        const r = catRank(cat);
        if (!r || r > 3) continue;
        const coins = Math.round((COMICE.prizes[r] * mult) / 10) * 10;
        const coc = COMICE.cocardes[r] || 0;
        state.income.comice = (state.income.comice || 0) + coins;
        earn(coins, null);
        addElevRep(COMICE.rep[r]);
        c.cocardes = (c.cocardes || 0) + coc;
        if (r === 1) {
            firsts++;
            const first = !c.wins[cat.id];
            c.wins[cat.id] = (c.wins[cat.id] || 0) + 1;
            state.prestige.rubans += first ? 2 : 1;
            state.stats.salonWins = (state.stats.salonWins || 0) + 1;
            const a = entryAnimal(cat);
            if (a) a.prize = (a.prize || 0) + 1; // la plaque « Primée au Comice »
            if (first) addPhoto('animal', cat.id, `${COMICE_CAT[cat.id]} : premier prix`, 'Comice agricole');
        }
        lines.push([['ui', r === 1 ? 'ribbon' : 'star'], `${catName(cat)} : ${r}${r === 1 ? 're' : 'e'} place · ${coins.toLocaleString('fr-FR')} pièces · +${coc} cocardes`]);
    }
    c.last = { lines, firsts, at: now() };
    if (view.started && lines.length)
        emit('celebrate', {
            icon: ['ui', 'ribbon'],
            title: firsts ? `Comice : ${firsts} premier${firsts > 1 ? 's' : ''} prix !` : 'Les résultats du Comice',
            sub: firsts ? 'Vos bêtes primées gagnent leurs pouvoirs permanents au pré (+25 % vitesse, aura, qualité) !' : 'Vos bêtes se sont bien défendues.',
            lines,
        });
    else if (view.started && c.cats.some(x => x.entry)) toast('Comice : pas de place sur le podium cette semaine', ['ui', 'ribbon']);
}

function topUp(c) {
    let ch = false;
    if (c.cats.some(x => x.id === 'potager')) {
        c.cats = c.cats.filter(x => x.id !== 'potager');
        ch = true;
    }
    c.cats.forEach(cat => {
        if (!cat.jury) cat.jury = pickRand(Object.keys(JURY));
        if (cat.rivals.some(r => !r.name)) {
            const fresh = rivalScores(cat.id);
            cat.rivals.forEach((r, k) => Object.assign(r, { name: fresh[k].name, hue: fresh[k].hue }));
        }
    });
    const want = COMICE.cats + (comiceHall() ? 1 : 0);
    if (c.cats.length < want && !c.paid) {
        const free = ownedTypes().filter(t => !c.cats.some(x => x.id === t));
        if (free.length) {
            c.cats.push(newCat(pickRand(free)));
            ch = true;
        }
    }
    return ch;
}

export function comiceTick() {
    if (!comiceOpen()) return false;
    const c = ensureComice();
    const wk = comiceWeek();
    if (c.wk === wk) return topUp(c);
    if (c.wk !== undefined && c.wk !== wk && !c.paid && c.cats.some(x => x.entry)) award();
    newEdition();
    if (view.started) tip('comice');
    return true;
}

// ce qui attend : catégories du Grand Comice à préparer, épreuves express du jour ou palier Palmarès à réclamer
export function comiceTodo() {
    if (!comiceOpen() || !state.comice || state.comice.paid) return 0;
    const weekTodo = state.comice.cats.filter(cat => (!cat.entry && comiceCandidates(cat.id).length) || canBrush(cat)).length;
    return weekTodo + comiceExpressLeft() + comicePalmClaimable();
}
export const rivalName = k => `${RIVALS[k].owner} · ${RIVALS[k].name.replace(/^(La ferme|Le domaine|Domaine) (des |du |de )?/, '')}`;
