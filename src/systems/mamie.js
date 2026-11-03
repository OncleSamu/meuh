// 1.83 : le plat de la semaine de Mamie Odette.
// Chaque lundi, elle choisit quelque chose de cuisiné ou de brassé (plat, pain, pâtisserie, glace, fromage, conserve, jus, thé, café,
// alcool, vin, et une de tes bières), rapide à faire, parmi ce que la ferme sait déjà préparer.
// 1.83.4 : on ne la vend pas au marché, on la LIVRE à Mamie (Village › Commandes › À livrer) : elle paie tout de suite +50 %,
// sans que ça fasse baisser les prix du marché, jusqu'à MAMIE_CAP pièces par semaine. Les plats comptent aussi double pour leur maîtrise.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { toast, sfx, buzz, burst } from '../core/bus.js';
import { earn, addXp } from './player.js';
import { sellBatch } from './market.js';
import { sellBeer, ensureBrew, beerDealPrice } from './brewery.js';
import { RECIPES } from '../data/machines.js';
import { ITEMS } from '../data/items.js';
import { hasMachine, recipeUnlocked } from './workshop.js';
import { tip } from './tips.js';

const BEER = 'beer:';
export const MAMIE_PRICE = 1.5;
export const MAMIE_MASTERY = 2;
export const MAMIE_LVL = 10;
// ce qu'elle prend au plus chaque semaine
export const MAMIE_CAP = 50;
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

// combien de ce plat on lui a donné cette semaine
export const mamieMade = () => (mamieDish() && state.mamie.n) || 0;
export const isMamieDish = id => !!id && mamieDish() === id;
export const mamieMasteryMult = id => (isMamieDish(id) ? MAMIE_MASTERY : 1);
export const isMamieBeer = bid => mamieDish() === BEER + bid;
export const mamieRoom = () => (mamieDish() ? Math.max(0, MAMIE_CAP - (state.mamie.n || 0)) : 0);
// combien on a de son plat sous la main
export function mamieStock() {
    const id = mamieDish();
    if (!id) return 0;
    return isBeer(id) ? ensureBrew().stock[id.slice(BEER.length)] || 0 : state.inventory[id] || 0;
}
// ce qu'elle paierait pour n pièces (les meilleures d'abord), sans rien prendre
export function mamiePay(n) {
    const id = mamieDish();
    n = Math.min(n, mamieRoom(), mamieStock());
    if (!id || n <= 0) return 0;
    if (isBeer(id)) return dealBeer(id.slice(BEER.length), n, false);
    return sellBatch(id, n, false, { mult: MAMIE_PRICE }).gain;
}
// bière : même barème que sellBeer (les plus hauts rangs d'abord), sans rien prendre
function dealBeer(bid, n, apply, at) {
    if (apply) return sellBeer(bid, n, at, { mult: MAMIE_PRICE }) || 0;
    const B = ensureBrew(),
        q = B.q[bid] || {};
    // la valeur d'une bouteille de chaque rang : on prend les plus hauts d'abord
    let left = n,
        coins = 0;
    const per = r => beerDealPrice(bid, r, MAMIE_PRICE);
    for (const [r, f] of [
        [4, 'd'],
        [3, 'p'],
        [2, 'g'],
        [1, 's'],
    ]) {
        const t = Math.min(left, q[f] || 0);
        left -= t;
        coins += t * per(r);
    }
    return coins + left * per(0);
}
// donne n pièces de son plat à Mamie : elles partent, elle paie tout de suite
export function deliverMamie(at, n = Infinity) {
    const id = mamieDish();
    n = Math.min(n, mamieRoom(), mamieStock());
    if (!id || n <= 0) return false;
    let gold;
    if (isBeer(id)) gold = dealBeer(id.slice(BEER.length), n, true, at);
    else {
        const r = sellBatch(id, n, true, { mult: MAMIE_PRICE });
        gold = r.gain;
        n = r.sold;
        earn(gold, at);
    }
    state.mamie.n = (state.mamie.n || 0) + n;
    state.income.mamie = (state.income.mamie || 0) + gold;
    addXp(Math.round(gold / 10), at);
    sfx('coin');
    buzz(10);
    if (at) burst(at, 'crumbs', 8);
    if (state.mamie.n >= MAMIE_CAP) toast('Mamie en a assez pour la semaine : « À lundi, mon grand ! »', ['villager', 'odette']);
    return true;
}
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
