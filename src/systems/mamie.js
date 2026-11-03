// 1.83 : le plat de la semaine de Mamie Odette.
// Chaque lundi, elle choisit quelque chose de cuisiné ou de brassé (plat, pain, pâtisserie, glace, fromage, conserve, jus, thé, café,
// alcool, vin, et une de tes bières), rapide à faire, parmi ce que la ferme sait déjà préparer.
// Toute la semaine : +50 % sur son prix ; les plats comptent double pour leur maîtrise.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { RECIPES } from '../data/machines.js';
import { ITEMS } from '../data/items.js';
import { hasMachine, recipeUnlocked } from './workshop.js';
import { tip } from './tips.js';

const BEER = 'beer:';
export const MAMIE_PRICE = 1.5;
export const MAMIE_MASTERY = 2;
export const MAMIE_LVL = 10;
// 10 minutes au plus : on peut en faire beaucoup dans la semaine
export const MAMIE_MAX_TIME = 600;
// ce qui se mange et se boit (ni farine, ni huile, ni sucre, ni malt, ni planches, ni tissu, ni bijoux…) ; les bières ont leur propre système
const FOOD_MACHINES = [
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
    'confectionery',
    'icecream',
    'chocolatier',
    'dairy',
    'alpineDairy',
    'smokehouse',
    'cannery',
    'dryer',
    'saloir',
    'berryKettle',
    'press',
    'juiceBar',
    'still',
    'rumDistillery',
    'winery',
    'counter',
];

const localDay = t => Math.floor((t - new Date(t).getTimezoneOffset() * 60000) / 86400000);
// les semaines commencent le lundi (le 1er janvier 1970 était un jeudi)
export const isBeer = id => typeof id === 'string' && id.startsWith(BEER);
export const mamieWeek = (t = now()) => Math.floor((localDay(t) + 3) / 7);
// la fin de la semaine en cours : lundi 0 h, heure locale
export function mamieWeekEnd(t = now()) {
    const d = new Date(t);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + (d.getDay() === 0 ? 1 : 8 - d.getDay()));
    return d.getTime();
}
export const mamieLeftMs = (t = now()) => Math.max(0, mamieWeekEnd(t) - t);

// ce que cette ferme peut faire aujourd'hui : machine achetée, recette ouverte
export function mamieChoices() {
    const all = Object.values(RECIPES).filter(
        r =>
            FOOD_MACHINES.includes(r.machine) &&
            ITEMS[r.id] &&
            ITEMS[r.id].type === 'artisan' &&
            !r.fete &&
            !r.holiday &&
            hasMachine(r.machine) &&
            recipeUnlocked(r.id),
    );
    const quick = all.filter(r => r.time <= MAMIE_MAX_TIME);
    // 1.83.2 : une de tes bières (ou hydromels) déjà brassées
    const beers = Object.values((state.brew && state.brew.beers) || {})
        .filter(b => b.made > 0)
        .map(b => BEER + b.id);
    return [...(quick.length ? quick : all).map(r => r.id), ...beers];
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
    if (m.w === w && m.id && (RECIPES[m.id] || (isBeer(m.id) && state.brew && state.brew.beers[m.id.slice(BEER.length)]))) return m.id;
    let list = mamieChoices();
    if (!list.length) return null;
    // pas deux semaines de suite le même plat, s'il y a le choix
    if (list.length > 1) list = list.filter(id => id !== m.id);
    m.w = w;
    m.n = 0;
    m.id = list[hash(w) % list.length];
    tip('mamieDish');
    return m.id;
}

// combien de ce plat ont été faits cette semaine
export const mamieMade = () => (mamieDish() && state.mamie.n) || 0;
export const mamieAdd = (id, qty) => {
    if (isMamieDish(id)) state.mamie.n = (state.mamie.n || 0) + qty;
};
export const isMamieDish = id => !!id && mamieDish() === id;
export const mamiePriceMult = id => (isMamieDish(id) ? MAMIE_PRICE : 1);
export const mamieMasteryMult = id => (isMamieDish(id) ? MAMIE_MASTERY : 1);

// 1.83.2 : une bière du jeu comme plat de la semaine : +50 % sur la bouteille ; Mamie compte les bouteilles brassées
export const isMamieBeer = bid => mamieDish() === BEER + bid;
export const mamieBeerMult = bid => (isMamieBeer(bid) ? MAMIE_PRICE : 1);
export const mamieAddBeer = (bid, n) => {
    if (isMamieBeer(bid)) state.mamie.n = (state.mamie.n || 0) + n;
};
// ce qu'il faut pour afficher le plat de la semaine : nom, dessin, et où aller
export function mamieInfo() {
    const id = mamieDish();
    if (!id) return null;
    if (isBeer(id)) {
        const b = state.brew.beers[id.slice(BEER.length)];
        return { id, beer: true, name: b.name, icon: ['ui', 'beer'], machine: 'brewery' };
    }
    return { id, beer: false, name: ITEMS[id].name, icon: ['item', id], machine: RECIPES[id].machine };
}
