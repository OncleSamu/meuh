// 1.98 : les commerces du village (voir data/commerces.js) : reprendre un métier, servir sa commande permanente.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { view } from '../core/view.js';
import { toast, sfx, burst } from '../core/bus.js';
import { RECIPES } from '../data/machines.js';
import { ITEMS } from '../data/items.js';
import { COMMERCE, COMMERCES, COMMERCE_LVL, FIRST_NAMES } from '../data/commerces.js';
import { randomId, rng } from '../art/habitants.js';
import { hasMats, payMats } from './market.js';
import { earn, addXp } from './player.js';
import { canGet, haveQ, takeQ } from './defis.js';
import { spend } from './player.js';

export const commercesOpen = () => state.level >= COMMERCE_LVL;
export function ensureCommerces() {
    if (!state.commerces) state.commerces = {};
    return state.commerces;
}
export const commerceOf = id => (state.commerces && state.commerces[id]) || null;
export const commerceList = () => Object.keys(COMMERCES);
export const commerceFid = c => COMMERCE.fid.filter(n => c.n >= n).length;
export const commercePay = (c, fid = commerceFid(c)) => COMMERCE.pay + COMMERCE.payFid * fid;
export const commerceQty = (c, fid = commerceFid(c)) => COMMERCE.qty + COMMERCE.qtyFid * fid;

const poolOf = id =>
    Object.values(RECIPES)
        .filter(r => COMMERCES[id].machines.includes(r.machine) && ITEMS[r.id] && ITEMS[r.id].sell)
        .map(r => r.id);

export function canTakeOver(id) {
    const d = COMMERCES[id];
    return !!d && !commerceOf(id) && state.level >= d.lvl && state.money >= d.cost && hasMats(d.mats);
}
export function takeOver(id, at) {
    if (!canTakeOver(id)) return false;
    const d = COMMERCES[id];
    spend(d.cost);
    payMats(d.mats);
    const seed = (Date.now() ^ (id.length * 7919)) >>> 0;
    const r = rng(seed);
    const woman = r() < 0.5;
    const c = (ensureCommerces()[id] = {
        look: randomId(seed, woman ? { female: true } : { male: true }),
        name: FIRST_NAMES[Math.floor(r() * FIRST_NAMES.length)],
        n: 0,
        order: null,
        next: now(),
        since: now(),
    });
    newOrder(id);
    sfx('level');
    burst(at, 'sparkle', 14);
    toast(`${d.name} : ${c.name} ouvre la porte !`, d.icon);
    return true;
}
// un nouveau visage pour le même artisan (gratuit)
export function rerollLook(id) {
    const c = commerceOf(id);
    if (!c) return false;
    c.look = randomId((Date.now() ^ c.n) >>> 0, {});
    sfx('click');
    return true;
}

function newOrder(id, avoid = null) {
    const c = commerceOf(id);
    const all = poolOf(id);
    const ok = all.filter(canGet);
    const pool = (ok.length ? ok : all).filter(x => x !== avoid);
    if (!pool.length) return false;
    const item = pool[Math.floor(Math.random() * pool.length)];
    c.order = { item, n: commerceQty(c) };
    return true;
}
export const commerceValue = c => (c.order ? Math.round((ITEMS[c.order.item].sell * c.order.n * commercePay(c)) / 10) * 10 : 0);
export const commerceCanDeliver = c => !!c && !!c.order && haveQ(c.order.item, 0) >= c.order.n;

export function deliverCommerce(id, at) {
    const c = commerceOf(id);
    if (!commerceCanDeliver(c)) return false;
    const gold = commerceValue(c);
    const f0 = commerceFid(c);
    takeQ(c.order.item, c.order.n, 0);
    earn(gold, at);
    addXp(COMMERCE.xp, at);
    c.n++;
    c.order = null;
    c.next = now() + COMMERCE.wait;
    state.stats.commerceOrders = (state.stats.commerceOrders || 0) + 1;
    sfx('coin');
    if (view.started) {
        burst(at, 'coin', 8);
        const f1 = commerceFid(c);
        if (f1 > f0) toast(`${c.name} vous fait plus confiance (niveau ${f1}) : commandes plus grosses, mieux payées`, ['ui', 'heart']);
    }
    return true;
}
// une autre commande (gratuit, tant qu'on n'a rien livré dessus)
export function otherOrder(id) {
    const c = commerceOf(id);
    if (!c || !c.order) return false;
    return newOrder(id, c.order.item);
}

export function commerceTick() {
    if (!commercesOpen() || !state.commerces) return false;
    let changed = false;
    for (const id of Object.keys(state.commerces)) {
        const c = state.commerces[id];
        if (!COMMERCES[id]) continue;
        if (!c.order && now() >= c.next && newOrder(id)) changed = true;
    }
    return changed;
}
export const commercesReady = () => (commercesOpen() && state.commerces ? Object.values(state.commerces).filter(commerceCanDeliver).length : 0);
