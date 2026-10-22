// 1.27 : la commande spéciale de la semaine. Chaque semaine (lundi), un voisin tour à tour demande UN plat de sa spécialité
// que la ferme n'a encore jamais livré aux voisins (sinon le moins livré), parfois en argent ou en or (si la ferme a déjà su le faire),
// pour une très belle récompense : pièces ×2,5, trois matériaux rares et des points d'amitié.
import { state, scaleLvl } from '../core/state.js';
import { now } from '../core/clock.js';
import { pickRand, round5 } from '../core/format.js';
import { toast, sfx, buzz } from '../core/bus.js';
import { RIVALS } from '../data/village.js';
import { RARE, NREQ } from '../data/commerce.js';
import { questPool, qtyFor } from './orders.js';
import { dishOwner, madeQ, reqReady, reqPay, reqValue, noteServed, dishServed } from './neighbordish.js';
import { nmarketOpen, ensureNMarket } from './nmarket.js';
import { fishWeek } from './fishing.js';
import { weekKey, weekEndsIn } from './events.js';
import { neighborXp, addNeighborPts } from './stall.js';
import { earn, addXp } from './player.js';
import { giveRare } from './barn.js';

const RETRY = 5 * 60000;

function makeSpecial() {
    const S = NREQ.special;
    const pool = questPool();
    const order = [0, 1, 2, 3].map(i => (fishWeek() + i) % 4);
    const dishesOf = k => pool.filter(i => dishOwner(i.id) === k);
    let k = null,
        it = null;
    for (const kk of order) {
        const fresh = dishesOf(kk).filter(i => !dishServed(i.id));
        if (fresh.length) {
            k = kk;
            it = pickRand(fresh);
            break;
        }
    }
    if (!it)
        for (const kk of order) {
            const all = dishesOf(kk);
            if (!all.length) continue;
            const min = Math.min(...all.map(i => dishServed(i.id)));
            k = kk;
            it = pickRand(all.filter(i => dishServed(i.id) === min));
            break;
        }
    if (!it) return null;
    const x = { id: it.id, qty: qtyFor(it, (40 + scaleLvl() * 25) * 1.2, S.maxQty) };
    if (madeQ(it.id, 1) && Math.random() < S.qChance) {
        x.q = madeQ(it.id, 2) && Math.random() < S.goldChance ? 2 : 1;
        x.qty = Math.max(1, Math.min(x.qty, NREQ.qCap[x.q]));
    }
    return {
        week: weekKey(),
        k,
        items: [x],
        coins: round5(reqValue([x]) * S.coins),
        mats: Array.from({ length: S.mats }, () => pickRand(RARE)),
        pts: S.pts,
        until: now() + weekEndsIn() * 1000,
        done: false,
    };
}

// une commande par semaine ; sans aucun plat possible, on réessaie toutes les 5 minutes
export function specialTick() {
    if (!nmarketOpen()) return false;
    const m = ensureNMarket();
    const sp = m.special;
    if (sp && sp.week === weekKey() && (!sp.none || now() < sp.retry)) return false;
    m.special = makeSpecial() || { week: weekKey(), none: true, retry: now() + RETRY };
    return !m.special.none;
}
export const specialOf = () => {
    const sp = state.nmarket && state.nmarket.special;
    return sp && !sp.none && sp.week === weekKey() ? sp : null;
};
export const specialReady = () => {
    const sp = specialOf();
    return !!sp && !sp.done && reqReady(sp);
};
export function helpSpecial(at) {
    const sp = specialOf();
    if (!sp || sp.done || !reqReady(sp)) return false;
    reqPay(sp.items);
    noteServed(sp.items);
    earn(sp.coins, at);
    sp.mats.forEach(mm => giveRare(mm, 1, at));
    addXp(neighborXp(sp), at);
    sp.done = true;
    state.stats.neighborHelps = (state.stats.neighborHelps || 0) + 1;
    state.stats.neighborSpecials = (state.stats.neighborSpecials || 0) + 1;
    addNeighborPts(sp.k, sp.pts);
    sfx('level');
    buzz(30);
    toast(`${RIVALS[sp.k].owner} vous remercie : commande spéciale livrée !`, ['villager', RIVALS[sp.k].avatar]);
    return true;
}
