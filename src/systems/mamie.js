// 1.83 : le plat de la semaine de Mamie Odette.
// Chaque lundi, elle choisit un vrai plat cuisiné (pas un fruit, un légume ou une viande), rapide à faire,
// parmi ceux que la ferme sait déjà préparer. Toute la semaine : +50 % sur son prix, et il compte double pour sa maîtrise.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { RECIPES } from '../data/machines.js';
import { ITEMS } from '../data/items.js';
import { hasMachine, recipeUnlocked } from './workshop.js';
import { tip } from './tips.js';

export const MAMIE_PRICE = 1.5;
export const MAMIE_MASTERY = 2;
export const MAMIE_LVL = 10;
// 5 minutes au plus : on peut en faire beaucoup dans la semaine
export const MAMIE_MAX_TIME = 300;
// les ateliers où l'on prépare des plats (ni boissons, ni confitures, ni matières premières)
const DISH_MACHINES = [
    'kitchen',
    'marmite',
    'stove',
    'deli',
    'fishmonger',
    'pastaworks',
    'crepery',
    'pizzeria',
    'pastry',
    'bakery',
    'tajine',
    'earthOven',
    'orientalSweets',
    'tiledStove',
    'taigaPot',
    'islandBakery',
];

const localDay = t => Math.floor((t - new Date(t).getTimezoneOffset() * 60000) / 86400000);
// les semaines commencent le lundi (le 1er janvier 1970 était un jeudi)
export const mamieWeek = (t = now()) => Math.floor((localDay(t) + 3) / 7);
// la fin de la semaine en cours : lundi 0 h, heure locale
export function mamieWeekEnd(t = now()) {
    const d = new Date(t);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + (d.getDay() === 0 ? 1 : 8 - d.getDay()));
    return d.getTime();
}
export const mamieLeftMs = (t = now()) => Math.max(0, mamieWeekEnd(t) - t);

let ingredients = null;
const isIngredient = id => {
    if (!ingredients) ingredients = new Set(Object.values(RECIPES).flatMap(r => Object.keys(r.ing)));
    return ingredients.has(id);
};

// les plats que cette ferme peut faire aujourd'hui : machine achetée, recette ouverte, plat fini (pas un ingrédient)
export function mamieChoices() {
    const all = Object.values(RECIPES).filter(
        r =>
            DISH_MACHINES.includes(r.machine) &&
            ITEMS[r.id] &&
            ITEMS[r.id].type === 'artisan' &&
            !r.fete &&
            !r.holiday &&
            !isIngredient(r.id) &&
            hasMachine(r.machine) &&
            recipeUnlocked(r.id),
    );
    const quick = all.filter(r => r.time <= MAMIE_MAX_TIME);
    return (quick.length ? quick : all).map(r => r.id);
}

// un tirage qui ne change pas de la semaine (même graine pour tous les appels)
const hash = n => {
    let x = (n * 2654435761) >>> 0;
    x ^= x >>> 15;
    x = Math.imul(x, 2246822519) >>> 0;
    x ^= x >>> 13;
    return x >>> 0;
};

// le plat de la semaine : choisi une fois, puis gardé jusqu'au lundi suivant (même si la ferme s'agrandit entre-temps)
export function mamieDish(t = now()) {
    if (state.level < MAMIE_LVL) return null;
    const w = mamieWeek(t);
    const m = (state.mamie ||= { w: -1, id: null });
    if (m.w === w && m.id && RECIPES[m.id]) return m.id;
    let list = mamieChoices();
    if (!list.length) return null;
    // pas deux semaines de suite le même plat, s'il y a le choix
    if (list.length > 1) list = list.filter(id => id !== m.id);
    m.w = w;
    m.id = list[hash(w) % list.length];
    tip('mamieDish');
    return m.id;
}

export const isMamieDish = id => !!id && mamieDish() === id;
export const mamiePriceMult = id => (isMamieDish(id) ? MAMIE_PRICE : 1);
export const mamieMasteryMult = id => (isMamieDish(id) ? MAMIE_MASTERY : 1);
