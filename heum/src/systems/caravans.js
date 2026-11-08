// Heum — les Caravanes : un convoi par heure, annoncé d'avance par la radio. Il paie plus cher ce que sa région réclame.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { toast, sfx } from '../core/bus.js';
import { REGIONS, CARAVAN, TRADES } from '../data/world.js';
import { have, take, give, earn, baseSell, takeAll, hasAll, lvlOk, addXp } from './player.js';
import { canMult } from './bunker.js';

const slot = () => Math.floor(now() / 1000 / CARAVAN.every);
export const regionAt = k => REGIONS[(k + state.caravan.seed) % REGIONS.length];
export const convoy = () => regionAt(slot());
export const convoyLeft = () => CARAVAN.every - ((now() / 1000) % CARAVAN.every);
export const upcoming = (n = 3) => Array.from({ length: n }, (_, k) => ({ region: regionAt(slot() + k + 1), in: convoyLeft() + k * CARAVAN.every }));
const CANS = ['canRuta', 'canGlow', 'soup', 'flour', 'shellOil'];
export const wanted = id => convoy().wants.includes(id);
export function priceOf(id) {
    let p = baseSell(id);
    if (wanted(id)) p *= CARAVAN.bonus;
    if (CANS.includes(id)) p *= canMult();
    return Math.max(0, Math.round(p));
}
export function sell(id, n = 1) {
    const k = Math.min(n, have(id));
    const p = priceOf(id);
    if (!k || !p) return 0;
    take(id, k);
    earn(p * k);
    state.stats.sold += k;
    addXp(Math.ceil(k / 2));
    sfx('coin');
    return p * k;
}
export function trade(tid) {
    const t = TRADES.find(x => x.id === tid);
    if (!t || !lvlOk(CARAVAN.troqLvl, 'Le troc')) return false;
    if (!hasAll(t.give)) {
        toast('Il vous manque de quoi troquer');
        sfx('error');
        return false;
    }
    takeAll(t.give);
    for (const [id, n] of Object.entries(t.get)) give(id, n);
    addXp(3);
    sfx('coin');
    return true;
}
