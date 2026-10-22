// 1.26.3 : les demandes des fermes voisines sont des plats de leur spécialité (et non plus un produit au hasard).
// Hortense : légumes et fruits (soupes, conserves, jus, salades). Bastien : lait, œufs, laine, miel (fromages, glaces, vêtements).
// Yvette : poissons et viandes (plats de poisson, charcuterie). Firmin : farine, huile, sucre, tissu (pains, pâtes, gâteaux, bonbons, tissus).
import { ITEMS } from '../data/items.js';
import { ANIMALS } from '../data/animals.js';
import { RECIPES } from '../data/machines.js';
import { questPool } from './orders.js';

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
