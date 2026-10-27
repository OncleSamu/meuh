// 1.56 : 64 niveaux. Les niveaux 58 à 60 portaient à eux seuls l'oasis et le Grand Nord : ils sont répartis sur 58 à 64.
// Tout ce qui existait avant garde son niveau. lv155 garde le niveau d'avant, pour qu'une ancienne partie garde ce qu'elle
// avait déjà ouvert (state.lvKeep, voir migrateLevels64).
import { RECIPES_150 } from './v150.js';
import { RECIPES_153 } from './v153.js';
import { NEW_DRINKS_154, NEW_DRINKS_155 } from './counter.js';

// les chantiers et leur chapitre (chapitres 21 à 24 : voir village.js) ; une machine ou un produit ne s'ouvre pas avant eux
export const GATE_LVL = {
    oasisWell: 59,
    oasisShadoof: 59,
    oasisPen: 61,
    northStove: 62,
    northWood: 62,
    northGreenhouse: 62,
    northStable: 63,
    northSled: 63,
    northIce: 63,
};
export const OASIS_RANGE = [59, 61];
export const NORD_RANGE = [62, 64];
export const CAP = 20; // recettes par niveau au plus
export const CAP_LATE = 22; // à partir du 59 (l'oasis et le Nord arrivent avec leurs bêtes, leurs plantes et leur machine)

export const LV64_ITEM = {
    // l'oasis : les cultures et les arbres de la palmeraie (le chantier de la palmeraie les demande, dans le même chapitre)
    cumin: 59,
    coriander: 59,
    sesame: 59,
    sorghum: 59,
    date: 59,
    jujube: 59,
    bitterOrange: 59,
    // le Grand Nord : les cultures, puis les arbres
    rye: 62,
    lingonberry: 62,
    cloudberry: 62,
    seaBuckthorn: 63,
    spruce: 63,
    rowan: 63,
    tamarind: 59,
    carob: 59,
    argan: 60,
    mulberry: 60,
    pricklyPear: 61,
    citron: 61,
    crabapple: 62,
    birdCherry: 62,
    cembro: 63,
    juniper: 63,
    elderberry: 64,
    aronia: 64,
};
export const LV64_ANIMAL = { dromedary: 61, zebu: 61, barbarySheep: 61, reindeer: 63, muskox: 63, ptarmigan: 63 };
export const LV64_MACH = { earthOven: 59, tajine: 60, orientalSweets: 61, tiledStove: 62, taigaPot: 63, berryKettle: 64 };

const OASIS_REC = new Set([...RECIPES_150.map(r => r[0]), ...NEW_DRINKS_154.map(r => r[0])]);
const NORD_REC = new Set([...RECIPES_153.map(r => r[0]), ...NEW_DRINKS_155.map(r => r[0])]);

// range les recettes de l'oasis et du Nord sur leurs niveaux : chacune après ses ingrédients, sa machine et son chantier,
// à peu près autant par niveau, jamais plus de CAP au total
export function applyLevels64({ ITEMS, ANIMALS, MACHINES, RECIPES }) {
    const move = (o, id, l, key) => {
        if (!o[id]) return;
        o[id].lv155 = o[id][key];
        o[id][key] = l;
    };
    for (const [id, l] of Object.entries(LV64_ITEM)) move(ITEMS, id, l, 'reqLvl');
    for (const [id, l] of Object.entries(LV64_ANIMAL)) move(ANIMALS, id, l, 'reqLvl');
    for (const [id, l] of Object.entries(LV64_MACH)) move(MACHINES, id, l, 'reqLvl');
    const prodBy = {};
    for (const a of Object.values(ANIMALS)) for (const k of [a.prodId, a.extra]) if (k) prodBy[k] = a.id;
    const count = {};
    for (const r of Object.values(RECIPES)) if (!OASIS_REC.has(r.id) && !NORD_REC.has(r.id)) count[r.lvl] = (count[r.lvl] || 0) + 1;
    const lvOf = id => {
        if (RECIPES[id]) return RECIPES[id].lvl;
        const it = ITEMS[id];
        if (!it) return 0;
        return Math.max(it.reqLvl || 0, prodBy[id] ? ANIMALS[prodBy[id]].reqLvl : 0, it.needProject ? GATE_LVL[it.needProject] || 0 : 0);
    };
    // les autres recettes de 58 et plus, dont les ingrédients sont déjà ouverts plus tôt, passent aux niveaux 50 à 57
    // (les niveaux 58 à 64 ne peuvent pas tout porter) ; une partie en cours ne perd rien en ouvrant plus tôt
    for (const r of Object.values(RECIPES).filter(x => x.lvl >= 58 && !OASIS_REC.has(x.id) && !NORD_REC.has(x.id) && !x.fete && !x.holiday && !x.teacher)) {
        const lb = Math.max(RECIPES[r.id] && MACHINES[r.machine].reqLvl, ...Object.keys(r.ing).map(lvOf));
        const slot = [50, 51, 52, 53, 54, 55, 56, 57].filter(l => l >= lb && (count[l] || 0) < CAP).sort((a, b) => (count[a] || 0) - (count[b] || 0))[0];
        if (slot === undefined || MACHINES[r.machine].needProject) continue;
        count[r.lvl]--;
        count[slot] = (count[slot] || 0) + 1;
        r.lv155 = r.lvl;
        r.lvl = r.base = slot;
    }
    const done = new Set();
    const order = [];
    const visit = r => {
        if (done.has(r.id)) return;
        done.add(r.id);
        for (const k of Object.keys(r.ing)) if (RECIPES[k] && (OASIS_REC.has(k) || NORD_REC.has(k))) visit(RECIPES[k]);
        order.push(r);
    };
    for (const group of [OASIS_REC, NORD_REC])
        Object.values(RECIPES)
            .filter(r => group.has(r.id))
            .sort((a, b) => a.lvl - b.lvl)
            .forEach(visit);
    // le premier niveau possible d'une recette, sans tenir compte des autres recettes de son groupe déjà placées
    const first = (r, lo, memo = {}) => {
        if (memo[r.id] !== undefined) return memo[r.id];
        const m = MACHINES[r.machine];
        let l = Math.max(lo, m.reqLvl, m.needProject ? GATE_LVL[m.needProject] || 0 : 0);
        for (const k of Object.keys(r.ing)) l = Math.max(l, RECIPES[k] && (OASIS_REC.has(k) || NORD_REC.has(k)) ? first(RECIPES[k], lo, memo) : lvOf(k));
        return (memo[r.id] = l);
    };
    const cap = l => (l >= 59 ? CAP_LATE : CAP);
    const place = (r, [lo, hi], pending, memo) => {
        const min = Math.max(first(r, lo, memo), ...Object.keys(r.ing).map(lvOf));
        pending[first(r, lo, memo)]--;
        const load = l => (count[l] || 0) + (pending[l] || 0);
        // le niveau le moins chargé (en comptant ce que d'autres recettes ne pourront ouvrir qu'à ce niveau-là)
        let l = min;
        for (let k = min; k <= hi; k++) if (load(k) < cap(k) && (load(l) >= cap(l) || load(k) < load(l))) l = k;
        while (load(l) >= cap(l)) l++;
        count[l] = (count[l] || 0) + 1;
        r.lv155 = r.lvl;
        r.lvl = r.base = l;
    };
    for (const [group, range] of [
        [OASIS_REC, OASIS_RANGE],
        [NORD_REC, NORD_RANGE],
    ]) {
        const list = order.filter(r => group.has(r.id));
        const memo = {},
            pending = {};
        list.forEach(r => (pending[first(r, range[0], memo)] = (pending[first(r, range[0], memo)] || 0) + 1));
        list.forEach(r => place(r, range, pending, memo));
    }
}
