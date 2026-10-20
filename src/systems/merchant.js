// Zéphyr, le marchand ambulant.
import { state, scaleLvl, lvOk } from '../core/state.js';
import { now } from '../core/clock.js';
import { view } from '../core/view.js';
import { fmt, pickRand, round5 } from '../core/format.js';
import { toast, sfx, buzz, float, squish } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { DECOS } from '../data/farm.js';
import { RARE, MERCHANT_STAY, MERCHANT_AWAY } from '../data/commerce.js';
import { projectDone } from './story.js';
import { tip } from './tips.js';
import { isInSeason } from './world.js';
import { spend } from './player.js';
import { stayOf } from './home.js';

export const merchantOpen = () => projectDone('fountain');

export function merchantTick() {
    if (!merchantOpen()) return false;
    const m = state.merchant,
        t = now();
    if (m.status === 'away' && t >= m.arriveAt) {
        m.status = 'here';
        m.expiresAt = t + stayOf(MERCHANT_STAY);
        m.stock = merchantStock();
        if (view.started) {
            toast('Zéphyr, le marchand ambulant, est arrivé : il vous attend au Marché !', ['ui', 'merchant']);
            tip('merchant');
            sfx('horn');
        }
        return true;
    }
    if (m.status === 'here' && t >= m.expiresAt) {
        m.status = 'away';
        m.arriveAt = t + MERCHANT_AWAY;
        m.stock = [];
        return true;
    }
    return false;
}

export function merchantStock() {
    const rare = [...RARE].sort(() => Math.random() - 0.5).slice(0, 2);
    const stock = rare.map(id => {
        const qty = 2 + Math.floor(Math.random() * 2);
        return { kind: 'rare', id, qty, price: round5((200 + scaleLvl() * 35) * qty) };
    });
    const ex = pickRand(['saffron']);
    stock.push({ kind: 'seed', id: ex, qty: 5, price: round5(ITEMS[ex].cost * 5 * 1.4) });
    // graines de la saison, à prix doux
    const fresh = Object.values(ITEMS).filter(i => i.type === 'crop' && !i.exotic && lvOk(i) && isInSeason(i.id));
    if (fresh.length) {
        const f = pickRand(fresh);
        stock.push({ kind: 'seed', id: f.id, qty: 15, price: round5(f.cost * 15 * 0.5) });
    }
    const deco = pickRand(['statue', 'lantern', 'lantern']);
    stock.push({ kind: 'deco', id: deco, qty: 1, price: DECOS[deco].cost });
    stock.push(
        Math.random() < 0.5
            ? { kind: 'misc', id: 'fertilizer', qty: 10, price: round5(ITEMS.fertilizer.cost * 10 * 0.6) }
            : { kind: 'misc', id: 'feed', qty: 30, price: round5(ITEMS.feed.cost * 30 * 0.6) },
    );
    return stock;
}

export const offerIcon = o => (o.kind === 'deco' ? ['ui', o.id] : ['item', o.id]);
export const offerName = o => (o.kind === 'deco' ? DECOS[o.id].name : o.kind === 'seed' ? ITEMS[o.id].seedName : ITEMS[o.id].name);

export function buyMerchant(k, at) {
    const m = state.merchant,
        o = m.stock[k];
    if (m.status !== 'here' || !o || o.sold) return false;
    if (state.money < o.price) {
        toast('Pas assez d’argent', ['ui', 'coin']);
        sfx('error');
        return false;
    }
    spend(o.price);
    o.sold = true;
    if (o.kind === 'rare' || o.kind === 'misc') state.inventory[o.id] += o.qty;
    else if (o.kind === 'seed') state.seeds[o.id] += o.qty;
    else state.decorInv[o.id] = (state.decorInv[o.id] || 0) + 1;
    sfx('buy');
    buzz(12);
    squish(at);
    float(at, [`-${fmt(o.price)}`, ['ui', 'coin']], 'bad', -16);
    toast(o.kind === 'deco' ? `${DECOS[o.id].name} : posez-la dans le champ` : 'Merci, à la prochaine !', ['ui', 'merchant']);
    return true;
}
