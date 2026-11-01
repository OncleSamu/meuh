// 1.62 : les vins de cépage. Au pressoir ou à la cuverie, on choisit sa variété de raisin (ou de pomme pour le cidre) :
// le vin garde son nom, son goût et son rang jusqu'en cave et au château.
// Les bouteilles ont leur propre stock (comme les bières), à part de la grange : les commandes ne les prennent jamais.
// state.cepage = { next, list: { cid: { id, item, vid, name, mult } }, sig: { 'item|vid': cid }, stock: { cid: [normal, argent, or, platine, diamant] } }
import { state } from '../core/state.js';
import { toast, sfx } from '../core/bus.js';
import { fmt } from '../core/format.js';
import { ITEMS } from '../data/items.js';
import { RECIPES } from '../data/machines.js';
import { CAVE_ITEMS } from '../data/cave.js';
import { QUALITY } from '../data/farm.js';
import { varRanks, varName, varietyMult } from './genetics.js';
import { sellPrice } from './market.js';
import { earn } from './player.js';

export const CEP_FRUITS = ['grape', 'apple'];
const FAMS = ['wine', 'cider', 'champagne'];

export function ensureCepage() {
    const c = (state.cepage = state.cepage || {});
    c.next = c.next || 1;
    c.list = c.list || {};
    c.sig = c.sig || {};
    c.stock = c.stock || {};
    return c;
}

// une recette de vin ou de cidre faite directement du fruit
export const cepFruit = rid => {
    const r = RECIPES[rid];
    return r && FAMS.includes(CAVE_ITEMS[rid]) ? CEP_FRUITS.find(f => r.ing[f]) || null : null;
};
export const isCepRecipe = rid => !!cepFruit(rid);
// les variétés dont on a assez de fruits pour cette recette
const varUnits = vid => varRanks(vid).reduce((a, b) => a + b, 0);
export const cepVarOk = (rid, vid) => {
    const f = cepFruit(rid),
        v = state.genetics && state.genetics.vars[vid];
    return !!(f && v && v.base === f && varUnits(vid) >= RECIPES[rid].ing[f]);
};
// les variétés de fruits à cépage qu'on a en stock (pour le choix à la machine)
export const cepVarieties = fruits =>
    state.genetics ? Object.values(state.genetics.vars).filter(v => fruits.includes(v.base) && varUnits(v.id) > 0 && (state.inventory[v.base] || 0) > 0) : [];
export const machineCepFruits = type => [
    ...new Set(
        Object.values(RECIPES)
            .filter(r => r.machine === type && cepFruit(r.id))
            .map(r => cepFruit(r.id)),
    ),
];

// une cuvée de cépage (un vin et une variété) : son nom et sa valeur sont gardés, même si la variété disparaît un jour
export function cepOf(item, vid) {
    const c = ensureCepage(),
        key = `${item}|${vid}`;
    if (c.sig[key] && c.list[c.sig[key]]) return c.list[c.sig[key]];
    const v = state.genetics.vars[vid];
    const cid = 'c' + c.next++;
    c.sig[key] = cid;
    c.list[cid] = { id: cid, item, vid, name: varName(v), mult: Math.round(varietyMult(v) * 100) / 100 };
    return c.list[cid];
}
export const cepName = e => `${ITEMS[e.item].name} « ${e.name} »`;
export const cepRanks = cid => {
    const s = ensureCepage().stock;
    return (s[cid] = s[cid] || [0, 0, 0, 0, 0]);
};
export const cepCount = cid => cepRanks(cid).reduce((a, b) => a + b, 0);
export const cepBottles = () =>
    Object.values(ensureCepage().list)
        .filter(e => cepCount(e.id) > 0)
        .sort((a, b) => cepValue(b.id) - cepValue(a.id));

export function addCepage(item, vid, qty, rank = 0) {
    if (!(qty > 0) || !state.genetics || !state.genetics.vars[vid]) return null;
    const e = cepOf(item, vid);
    cepRanks(e.id)[Math.max(0, Math.min(4, rank | 0))] += qty;
    return e;
}

// le prix d'une bouteille : celui du vin, le goût de la variété (comme ses fruits) et son rang
export const cepPrice = (cid, r = 0) => {
    const e = ensureCepage().list[cid];
    return e ? Math.max(1, Math.round(sellPrice(e.item) * e.mult * QUALITY[r].mult)) : 0;
};
export const cepValue = cid => cepRanks(cid).reduce((a, n, r) => a + n * cepPrice(cid, r), 0);

// retire n bouteilles (les plus hauts rangs d'abord si best) ; renvoie [normal, argent, or, platine, diamant] pris
export function takeCepage(cid, n, best = false) {
    const s = cepRanks(cid),
        got = [0, 0, 0, 0, 0];
    for (const r of best ? [4, 3, 2, 1, 0] : [0, 1, 2, 3, 4]) {
        const t = Math.min(n, s[r]);
        s[r] -= t;
        got[r] += t;
        n -= t;
    }
    return got;
}
// le plus haut rang dont le stock couvre tout un lot de n bouteilles
export function cepPutQuality(cid, n) {
    const s = cepRanks(cid);
    for (const r of [4, 3, 2, 1]) if (s[r] >= n) return r;
    return 0;
}

// vendre ses bouteilles : les plus basses d'abord, on garde les meilleures
export function sellCepage(cid, n, at) {
    const e = ensureCepage().list[cid];
    n = Math.min(n, cepCount(cid));
    if (!e || n <= 0) return 0;
    const got = takeCepage(cid, n, false);
    const gain = got.reduce((a, c, r) => a + c * cepPrice(cid, r), 0);
    state.income.cave = (state.income.cave || 0) + gain;
    earn(gain, at);
    sfx('coin');
    toast(`${n} ${cepName(e)} vendu${n > 1 ? 's' : ''} : ${fmt(gain)} pièces`, ['item', e.item]);
    return gain;
}
