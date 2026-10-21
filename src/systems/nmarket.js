// Le marché des voisines (1.26) : les étals des quatre fermes voisines (selon l'amitié) et la demande d'achat,
// l'étal à l'envers (on fixe son prix, un voisin livre d'autant plus vite qu'on paie cher).
import { state, scaleLvl, lvOk } from '../core/state.js';
import { now } from '../core/clock.js';
import { round5 } from '../core/format.js';
import { emit, toast, sfx, buzz, float } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { ANIMALS } from '../data/animals.js';
import { RECIPES } from '../data/machines.js';
import { RIVALS, NEIGHBOR_HEARTS } from '../data/village.js';
import { NMARKET } from '../data/commerce.js';
import { storyOk } from './story.js';
import { fishOrderOk } from './fishing.js';
import { netOpen } from './port.js';
import { recipeUnlocked } from './workshop.js';
import { spend } from './player.js';
import { ensureNeighbors, neighborGift } from './stall.js';
import { addQuality } from './farm.js';
import { tip } from './tips.js';
import { barnSpace, inBarn } from './barn.js';

export const nmarketOpen = () => state.level >= NMARKET.lvl;
export const nHearts = k => (state.neighbors && state.neighbors[k] ? state.neighbors[k].hearts || 0 : 0);
const unit = id => ITEMS[id].sell || 0;

// ce que chaque voisin peut vendre (seulement ce que le joueur a débloqué)
export function specialtyOf(k) {
    const all = Object.values(ITEMS);
    if (k === 0) return all.filter(i => (i.type === 'crop' || i.type === 'tree') && !i.exotic && lvOk(i) && storyOk(i) && unit(i.id) > 0).map(i => i.id);
    if (k === 1)
        return Object.values(ANIMALS)
            .filter(a => lvOk(a) && a.prodId && ITEMS[a.prodId] && unit(a.prodId) > 0 && a.prodId !== 'horsehair')
            .map(a => a.prodId);
    if (k === 2) {
        const meats = Object.values(ANIMALS)
            .filter(a => lvOk(a) && a.extra && ITEMS[a.extra])
            .map(a => a.extra);
        const fish = all.filter(i => i.type === 'fish' && i.id !== 'goldfish' && fishOrderOk(i.id)).map(i => i.id);
        const sea = netOpen() ? all.filter(i => i.sea && i.id !== 'lobster').map(i => i.id) : [];
        return [...meats, ...fish, ...sea].filter(id => unit(id) > 0);
    }
    return NMARKET.firmin.filter(id => ITEMS[id] && RECIPES[id] && recipeUnlocked(id) && unit(id) > 0);
}
export const sellerOf = id => [0, 1, 2, 3].find(k => specialtyOf(k).includes(id));

// ---------------- les étals ----------------
export function ensureNMarket() {
    const m = (state.nmarket ||= { at: 0, stalls: [], asks: [], spent: [0, 0, 0, 0] });
    m.asks ||= [];
    m.spent ||= [0, 0, 0, 0];
    return m;
}
const priceMult = k => NMARKET.price[nHearts(k)];
function makeStall(k) {
    const h = nHearts(k);
    const pool = [...specialtyOf(k)];
    const offers = [];
    for (let n = 0; n < NMARKET.offers[h] && pool.length; n++) {
        const id = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
        const per = unit(id);
        const qty = Math.max(2, Math.min(80, Math.round((NMARKET.base(scaleLvl()) * NMARKET.qty[h] * (k === 3 ? NMARKET.smallFirmin : 1)) / per)));
        const gold = h >= 5 && n === 0; // le coup de cœur : en qualité or
        offers.push({ id, qty, price: round5(per * qty * priceMult(k)), gold, sold: false });
    }
    return { k, offers };
}
export function nmarketTick() {
    if (!nmarketOpen()) return false;
    ensureNeighbors();
    const m = ensureNMarket();
    let ch = false;
    if (now() >= m.at + NMARKET.every || m.stalls.length !== RIVALS.length) {
        m.at = now();
        m.stalls = RIVALS.map((r, k) => makeStall(k));
        ch = true;
    }
    // les livraisons des demandes d'achat
    m.asks.forEach(a => {
        if (!a.ready && now() >= a.until) {
            a.ready = true;
            ch = true;
            toast(`${RIVALS[a.k].owner} a livré votre demande : ${a.qty} × ${ITEMS[a.id].name.toLowerCase()}`, ['villager', RIVALS[a.k].avatar]);
        }
    });
    return ch;
}
export const nmarketRenewAt = () => ensureNMarket().at + NMARKET.every;
// la fidélité : acheter chez un voisin fait monter son amitié
function loyalty(k, coins) {
    ensureNeighbors();
    const m = ensureNMarket();
    const n = state.neighbors[k];
    m.spent[k] += coins;
    const step = NMARKET.loyalty(scaleLvl());
    let up = 0;
    while (m.spent[k] >= step) {
        m.spent[k] -= step;
        n.pts++;
        up++;
    }
    while (n.hearts < 5 && n.pts >= NEIGHBOR_HEARTS[n.hearts]) {
        n.hearts++;
        neighborGift(k, n.hearts);
    }
    return up;
}
export const loyaltyPct = k => Math.min(1, ensureNMarket().spent[k] / NMARKET.loyalty(scaleLvl()));
// la grange doit pouvoir accueillir la marchandise
const roomFor = (id, qty) => !inBarn(id) || barnSpace() >= qty || (toast('Grange trop pleine pour cette marchandise', ['ui', 'barn']), sfx('error'), false);
export function buyOffer(k, n, at) {
    const m = ensureNMarket();
    const s = m.stalls[k],
        o = s && s.offers[n];
    if (!o || o.sold) return false;
    if (state.money < o.price) return toast('Pas assez de pièces', ['ui', 'coin']), sfx('error'), false;
    if (!roomFor(o.id, o.qty)) return false;
    spend(o.price);
    o.sold = true;
    state.inventory[o.id] = (state.inventory[o.id] || 0) + o.qty;
    if (o.gold) addQuality(o.id, 2, o.qty);
    loyalty(k, o.price);
    state.stats.neighborBuys = (state.stats.neighborBuys || 0) + 1;
    sfx('coin');
    buzz(12);
    float(at, [`+${o.qty}`, ['item', o.id]], '', -30);
    tip('nmarket');
    emit('changed', 'nmarket');
    return true;
}

// ---------------- la demande d'achat ----------------
export const askSlots = () => NMARKET.ask.slots[Math.max(...[0, 1, 2, 3].map(nHearts))];
export const askMaxQty = k => NMARKET.ask.maxQty(nHearts(k));
// délai en minutes : de 3 h (prix 1,2 ×) à 15 min (2,5 ×), raccourci par les cœurs du voisin
export function askDelay(k, mult) {
    const A = NMARKET.ask;
    const t = Math.max(0, Math.min(1, (mult - A.min) / (A.max - A.min)));
    const min = A.slow * Math.pow(A.fast / A.slow, t);
    return Math.round(min * (1 - A.heartCut * nHearts(k)));
}
export const askPrice = (id, qty, mult) => round5(unit(id) * qty * mult);
export function placeAsk(id, qty, mult) {
    const m = ensureNMarket();
    const k = sellerOf(id);
    if (!nmarketOpen() || k == null) return toast('Aucun voisin ne vend ce produit', ['ui', 'merchant']), false;
    if (m.asks.length >= askSlots()) return toast(`${askSlots()} demandes au plus en même temps`, ['ui', 'merchant']), sfx('error'), false;
    qty = Math.max(1, Math.min(askMaxQty(k), Math.round(qty)));
    mult = Math.max(NMARKET.ask.min, Math.min(NMARKET.ask.max, mult));
    const price = askPrice(id, qty, mult);
    if (state.money < price) return toast('Pas assez de pièces pour cette demande', ['ui', 'coin']), sfx('error'), false;
    m.asks.push({ id, qty, mult, price, k, until: now() + askDelay(k, mult) * 60000, ready: false });
    sfx('pop');
    toast(`${RIVALS[k].owner} s’occupe de votre demande`, ['villager', RIVALS[k].avatar]);
    emit('changed', 'nmarket');
    return true;
}
export function cancelAsk(n) {
    const m = ensureNMarket();
    const a = m.asks[n];
    if (!a || a.ready) return false;
    m.asks.splice(n, 1);
    emit('changed', 'nmarket');
    return true;
}
// on paie à la livraison ; sans assez de pièces, la livraison attend
export function collectAsk(n, at) {
    const m = ensureNMarket();
    const a = m.asks[n];
    if (!a || !a.ready) return false;
    if (state.money < a.price) return toast('Pas assez de pièces pour payer la livraison', ['ui', 'coin']), sfx('error'), false;
    if (!roomFor(a.id, a.qty)) return false;
    spend(a.price);
    state.inventory[a.id] = (state.inventory[a.id] || 0) + a.qty;
    loyalty(a.k, a.price);
    m.asks.splice(n, 1);
    sfx('coin');
    buzz(12);
    float(at, [`+${a.qty}`, ['item', a.id]], '', -30);
    emit('changed', 'nmarket');
    return true;
}
export const asksReady = () => (state.nmarket ? state.nmarket.asks.filter(a => a.ready).length : 0);
export const askable = () => [0, 1, 2, 3].flatMap(k => specialtyOf(k));
