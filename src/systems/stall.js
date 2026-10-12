// L'étal de la ferme, les produits verrouillés, la commande épinglée et les fermes voisines.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { view } from '../core/view.js';
import { pickRand, fmt, round5 } from '../core/format.js';
import { emit, toast, sfx, buzz, float, squish } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { DECOS } from '../data/farm.js';
import { HOT_MULT, STALL_MAX_QTY, RARE } from '../data/commerce.js';
import { RIVALS, NEIGHBOR_LVL, NEIGHBOR_HEARTS, NEIGHBOR_STAY } from '../data/village.js';
import { BALANCE } from '../data/progress.js';
import { extraStall } from './home.js';
import { masteryMult } from './mastery.js';
import { priceMult, earn, addXp } from './player.js';
import { eventSellMult, sellableQty, sellBatch, rememberSale } from './market.js';
import { inBarn, giveRare } from './barn.js';
import { clampQuality } from './farm.js';
import { eventProgress } from './events.js';
import { challengeOn } from './prestige.js';
import { isOpen, pickItems, qtyFor, hasAll, payItems } from './orders.js';
import { tip } from './tips.js';

// ---------------- l'étal ----------------
// On y met jusqu'à 10 exemplaires d'un produit au prix choisi. Plus c'est cher, plus
// le client met de temps à venir. Le grossiste (vente immédiate) paie beaucoup moins.
export const STALL_LEVELS = [8, 15, 22, 29];
export const stallSlots = () => 4 + STALL_LEVELS.filter(l => state.level >= l).length + extraStall();
export const stallBase = id => ITEMS[id].sell * masteryMult(id) * priceMult() * (state.market.hot === id ? HOT_MULT : 1) * eventSellMult();
// délai moyen avant qu'un client achète, en minutes, selon le prix (1 = valeur normale)
export const stallWait = ratio => 4 + 14 * Math.pow(ratio, 3);
export const stallUnit = (id, ratio) => Math.max(1, Math.round(stallBase(id) * ratio));
export const stallMood = ratio =>
    ratio <= 0.8 ? 'Bon marché : vendu vite' : ratio <= 1.1 ? 'Prix juste' : ratio <= 1.3 ? 'Un peu cher : patience' : 'Très cher : les clients hésitent';
export const stallMax = id => Math.min(STALL_MAX_QTY, sellableQty(id));

export function ensureStall() {
    if (!state.stall || !Array.isArray(state.stall.slots)) state.stall = { slots: [] };
    while (state.stall.slots.length < stallSlots()) state.stall.slots.push(null);
}

export function stallTick() {
    ensureStall();
    const t = now();
    let changed = false;
    state.stall.slots.forEach(sl => {
        if (sl && !sl.sold && t >= sl.sellAt) {
            sl.sold = true;
            changed = true;
            if (view.started && !view.hidden) {
                toast(`Un client a acheté ${sl.qty} ${ITEMS[sl.id].name.toLowerCase()} à l’étal !`, ['item', sl.id]);
                sfx('coin');
            }
        }
    });
    return changed;
}

export const stallSoldCount = () => state.stall.slots.filter(sl => sl && sl.sold).length;
export const stallFree = () => state.stall.slots.findIndex(sl => !sl);

export const stallChoices = () =>
    Object.keys(ITEMS)
        .filter(id => inBarn(id) && ITEMS[id].sell && sellableQty(id) > 0)
        .sort((a, b) => ITEMS[b].sell * sellableQty(b) - ITEMS[a].sell * sellableQty(a));

export function listStall(k, id, qty, ratio, at) {
    ensureStall();
    if (!id || state.stall.slots[k] || qty < 1 || sellableQty(id) < qty) return false;
    const price = stallUnit(id, ratio);
    state.inventory[id] -= qty;
    clampQuality(id);
    const wait = stallWait(ratio) * (0.7 + Math.random() * 0.6);
    state.stall.slots[k] = { id, qty, price, sellAt: now() + wait * 60000, sold: false };
    sfx('load');
    squish(at);
    return true;
}

export function collectStall(k, at, quiet) {
    const sl = state.stall.slots[k];
    if (!sl || !sl.sold) return 0;
    const gain = sl.qty * sl.price;
    state.stall.slots[k] = null;
    earn(gain, quiet ? null : at);
    state.income.stall = (state.income.stall || 0) + gain;
    state.sold[sl.id] = (state.sold[sl.id] || 0) + gain;
    state.stats.stallSales = (state.stats.stallSales || 0) + 1;
    eventProgress('sell', null, gain);
    if (!quiet) sfx('buy');
    return gain;
}

export function collectAllStall(at) {
    let total = 0;
    state.stall.slots.forEach((sl, k) => (total += collectStall(k, null, true)));
    if (!total) return 0;
    float(at, [`+${fmt(total)}`, ['ui', 'coin']], 'gold', -20);
    sfx('buy');
    return total;
}

export function cancelStall(k) {
    const sl = state.stall.slots[k];
    if (!sl || sl.sold) return false;
    state.inventory[sl.id] += sl.qty;
    state.stall.slots[k] = null;
    sfx('click');
    toast('Produits retirés de l’étal et rangés dans la grange', ['ui', 'barn']);
    return true;
}

// ---------------- produits verrouillés, vente depuis la grange ----------------
export const isLocked = id => !!(state.locked && state.locked[id]);

export function toggleLock(id) {
    state.locked = state.locked || {};
    if (state.locked[id]) delete state.locked[id];
    else state.locked[id] = true;
    sfx('click');
    toast(isLocked(id) ? `${ITEMS[id].name} : jamais vendu, même avec « Tout vendre »` : `${ITEMS[id].name} : de nouveau vendable`, ['ui', 'lock']);
}

export function sellFromBarn(id, at) {
    const n = sellableQty(id);
    if (!n || isLocked(id) || challengeOn('noMarket')) return false;
    const f0 = state.market.f[id];
    const r = sellBatch(id, n, true);
    rememberSale([{ id, take: r.take, gain: r.gain, f0 }]);
    earn(r.gain, at);
    sfx('buy');
    return true;
}

// ---------------- la commande épinglée ----------------
export const pinnedOrder = () => state.quests.find(q => isOpen(q) && q.pinned);

export function togglePin(i) {
    const q = state.quests[i];
    if (!isOpen(q)) return false;
    const on = !q.pinned;
    state.quests.forEach(x => x && (x.pinned = false));
    q.pinned = on;
    sfx('click');
    if (on) toast('Commande épinglée : elle reste visible partout, et ses cultures brillent dans le champ', ['ui', 'pin']);
    return true;
}

export const pinnedCrops = () => {
    const q = pinnedOrder();
    return q ? new Set(q.items.filter(x => state.inventory[x.id] < x.qty).map(x => x.id)) : new Set();
};

// ---------------- les fermes voisines ----------------
export function ensureNeighbors() {
    state.neighbors = state.neighbors || {};
    RIVALS.forEach((r, k) => (state.neighbors[k] = { pts: 0, hearts: 0, req: null, next: 0, ...(state.neighbors[k] || {}) }));
}

export const neighborXp = req => Math.round(req.coins * BALANCE.orderXp * 0.6);

export function neighborTick() {
    if (state.level < NEIGHBOR_LVL) return false;
    ensureNeighbors();
    const t = now();
    let changed = false;
    RIVALS.forEach((r, k) => {
        const n = state.neighbors[k];
        if (n.req && t >= n.req.until) {
            n.req = null;
            n.next = t + (40 + Math.random() * 40) * 60000;
            changed = true;
        }
        if (!n.req && t >= n.next) {
            const its = pickItems(1);
            if (!its.length) return;
            const it = its[0];
            const qty = qtyFor(it, (40 + state.level * 25) * (0.7 + Math.random() * 0.6), 15);
            const value = it.sell * qty;
            n.req = {
                items: [{ id: it.id, qty }],
                until: t + NEIGHBOR_STAY,
                coins: round5(value * 1.6),
                mats: Math.random() < 0.5 ? [pickRand(RARE), pickRand(RARE)] : [pickRand(RARE)],
            };
            changed = true;
            if (view.started && !view.hidden) {
                toast(`${r.owner} (${r.name}) vous demande un coup de main`, ['villager', r.avatar]);
                tip('neighbors');
            }
        }
    });
    return changed;
}

export function helpNeighbor(k, at) {
    const n = state.neighbors[k],
        r = RIVALS[k];
    if (!n || !n.req || !hasAll(n.req.items)) return false;
    payItems(n.req.items);
    earn(n.req.coins, at);
    n.req.mats.forEach(m => giveRare(m, 1, at));
    addXp(neighborXp(n.req), at);
    n.pts++;
    n.req = null;
    n.next = now() + (40 + Math.random() * 40) * 60000;
    state.stats.neighborHelps = (state.stats.neighborHelps || 0) + 1;
    sfx('level');
    buzz(20);
    toast(`${r.owner} vous remercie chaleureusement !`, ['villager', r.avatar]);
    while (n.hearts < 5 && n.pts >= NEIGHBOR_HEARTS[n.hearts]) {
        n.hearts++;
        neighborGift(k, n.hearts);
    }
    return true;
}

// Cadeau à chaque cœur d'amitié : décoration, graines exotiques ou matériaux rares
function neighborGift(k, h) {
    const r = RIVALS[k];
    let txt;
    if (h % 2) {
        const deco = pickRand(Object.values(DECOS).filter(d => state.level >= d.reqLvl));
        state.decorInv[deco.id] = (state.decorInv[deco.id] || 0) + 1;
        txt = `${deco.name} offerte`;
    } else if (h === 2) {
        const ex = pickRand(['pineapple', 'saffron']);
        state.seeds[ex] += 4;
        txt = `4 ${ITEMS[ex].seedName.toLowerCase()}`;
    } else {
        RARE.forEach(id => (state.inventory[id] += 2));
        txt = '2 planches, 2 clous et 2 pots de peinture';
    }
    toast(`${r.owner} vous apprécie (${h} cœur${h > 1 ? 's' : ''}) : ${txt} !`, ['ui', 'heart']);
    emit('confetti');
}

export const neighborsReady = () =>
    state.level >= NEIGHBOR_LVL && state.neighbors
        ? RIVALS.filter((r, k) => state.neighbors[k] && state.neighbors[k].req && hasAll(state.neighbors[k].req.items)).length
        : 0;
