// 1.26.3 : les demandes des fermes voisines sont des plats de leur spécialité (et non plus un produit au hasard).
// Hortense : légumes et fruits (soupes, conserves, jus, salades). Bastien : lait, œufs, laine, miel (fromages, glaces, vêtements).
// Yvette : poissons et viandes (plats de poisson, charcuterie). Firmin : farine, huile, sucre, tissu (pains, pâtes, gâteaux, bonbons, tissus).
import { state, scaleLvl } from '../core/state.js';
import { now } from '../core/clock.js';
import { pickRand, round5 } from '../core/format.js';
import { ITEMS } from '../data/items.js';
import { ANIMALS } from '../data/animals.js';
import { RECIPES } from '../data/machines.js';
import { QUALITY } from '../data/farm.js';
import { RARE, NREQ } from '../data/commerce.js';
import { NEIGHBOR_STAY } from '../data/village.js';
import { questPool, qtyFor } from './orders.js';
import { haveQ, takeQ } from './defis.js';

const FIRMIN = [
    'mill',
    'bakery',
    'pastry',
    'pastaworks',
    'crepery',
    'islandBakery',
    'sugarmill',
    'oilmill',
    'loom',
    'confectionery',
    'chocolatier',
    'malthouse',
];
const BASTIEN = ['dairy', 'alpineDairy', 'icecream', 'tailor', 'soapworks', 'dyeworks'];
const HORTENSE = ['kitchen', 'stove', 'deli', 'press', 'juiceBar', 'dryer', 'cannery', 'still', 'winery', 'brewery', 'rumDistillery', 'perfumery'];
const YVETTE = ['fishmonger', 'smokehouse', 'saloir'];
const MEATS = new Set(
    Object.values(ANIMALS)
        .map(a => a.extra)
        .filter(Boolean),
);

// ce que contient un plat tout en bas de sa chaîne de fabrication
function kinds(id, depth = 0) {
    const k = { veg: false, animal: false, meat: false };
    const r = RECIPES[id];
    if (r && depth < 6) {
        for (const g of Object.keys(r.ing)) {
            const s = kinds(g, depth + 1);
            k.veg ||= s.veg;
            k.animal ||= s.animal;
            k.meat ||= s.meat;
        }
        return k;
    }
    const it = ITEMS[id];
    if (!it) return k;
    if (it.type === 'fish' || it.sea || MEATS.has(id)) k.meat = true;
    else if (it.type === 'product') k.animal = true;
    else if (it.type === 'crop' || it.type === 'tree') k.veg = true;
    return k;
}

// le voisin (0 à 3) dont c'est le plat, ou -1 (plats de fête, outils, bijoux, selles…)
const memo = {};
export function dishOwner(id) {
    if (id in memo) return memo[id];
    const r = RECIPES[id];
    let o = -1;
    if (r && !r.fete && !r.holiday) {
        const m = r.machine;
        const food = [FIRMIN, BASTIEN, HORTENSE, YVETTE].some(l => l.includes(m));
        const kind = kinds(id);
        if (food && kind.meat) o = 2;
        else if (YVETTE.includes(m)) o = kind.animal ? 1 : 0;
        else if (FIRMIN.includes(m)) o = 3;
        else if (BASTIEN.includes(m)) o = 1;
        else if (HORTENSE.includes(m)) o = kind.animal ? 1 : 0;
    }
    return (memo[id] = o);
}
// un produit brut : sert de secours tant que le joueur ne sait faire aucun plat du voisin
const rawOwner = it => {
    if (it.type === 'crop' || it.type === 'tree') return 0;
    if (it.type === 'fish' || it.sea || MEATS.has(it.id)) return 2;
    return it.type === 'product' && it.id !== 'horsehair' ? 1 : -1;
};

// ce que le voisin k peut demander : ses plats que la ferme sait faire, sinon ses produits bruts, sinon n'importe quoi
export function neighborWant(k, last) {
    const pool = questPool();
    const dishes = pool.filter(i => dishOwner(i.id) === k);
    const raw = pool.filter(i => !RECIPES[i.id] && rawOwner(i) === k);
    const list = dishes.length ? dishes : raw.length ? raw : pool;
    const fresh = list.filter(i => i.id !== last);
    const from = fresh.length ? fresh : list;
    return from.length ? from[Math.floor(Math.random() * from.length)] : null;
}

// ---------------- 1.27 : la demande d'un voisin ----------------
// a-t-on déjà fabriqué ce plat en argent (q = 1, ou mieux) ou en or (q = 2) ?
export const madeQ = (id, q) => {
    const m = state.qmade && state.qmade[id];
    return !!m && (q === 2 ? m.g + (m.p || 0) + (m.d || 0) > 0 : m.s + m.g + (m.p || 0) + (m.d || 0) > 0);
};
// un plat dont on exige une qualité : pas trop d'exemplaires
const capQ = x => (x.qty = Math.max(1, Math.min(x.qty, NREQ.qCap[x.q])));
export const reqValue = items => items.reduce((a, x) => a + ITEMS[x.id].sell * x.qty * (x.q ? QUALITY[x.q].mult : 1), 0);
export const reqReady = req => !!req && req.items.every(x => haveQ(x.id, x.q || 0) >= x.qty);
export const reqPay = items => items.forEach(x => takeQ(x.id, x.qty, x.q || 0));
// le livre des plats livrés aux voisins : sert à la commande spéciale
export const dishServed = id => (state.stats.dishServed && state.stats.dishServed[id]) || 0;
export function noteServed(items) {
    const sv = (state.stats.dishServed = state.stats.dishServed || {});
    items.forEach(x => (sv[x.id] = (sv[x.id] || 0) + x.qty));
}

// 1 plat (0 à 2 cœurs), puis 2 ou 3 plats différents de sa spécialité ; l'argent ou l'or sur un seul plat, et seulement
// si la ferme a déjà su le faire dans cette qualité ; plus de plats, plus de pièces
export function makeNeighborReq(k, last) {
    const h = (state.neighbors[k] && state.neighbors[k].hearts) || 0;
    const dishes = questPool().filter(i => dishOwner(i.id) === k);
    let its = [];
    if (dishes.length) {
        const want = Math.min(dishes.length, h < 3 ? 1 : 2 + (Math.random() < NREQ.third[h] ? 1 : 0));
        const left = dishes.filter(i => i.id !== last);
        while (its.length < want) {
            const from = (left.length ? left : dishes).filter(i => !its.includes(i));
            if (!from.length) break;
            its.push(pickRand(from));
        }
    } else {
        const one = neighborWant(k, last);
        if (one) its = [one];
    }
    if (!its.length) return null;
    const share = ((40 + scaleLvl() * 25) * (0.7 + Math.random() * 0.6)) / its.length;
    const items = its.map(it => ({ id: it.id, qty: qtyFor(it, share, 15) }));
    if (h >= 3 && Math.random() < NREQ.qChance[h]) {
        const gold = Math.random() < NREQ.goldShare[h];
        let cand = items.filter(x => RECIPES[x.id] && madeQ(x.id, gold ? 2 : 1));
        let q = gold ? 2 : 1;
        if (!cand.length && gold) {
            cand = items.filter(x => RECIPES[x.id] && madeQ(x.id, 1));
            q = 1;
        }
        if (cand.length) {
            const x = pickRand(cand);
            x.q = q;
            capQ(x);
        }
    }
    const n = items.length;
    return {
        items,
        until: now() + NEIGHBOR_STAY,
        coins: round5(reqValue(items) * 1.6 * (1 + NREQ.extra * (n - 1))),
        mats: n > 1 || Math.random() < 0.5 ? [pickRand(RARE), pickRand(RARE)] : [pickRand(RARE)],
    };
}
