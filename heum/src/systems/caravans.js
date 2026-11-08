// Heum — les Caravanes : un convoi par heure, annoncé d'avance par la radio. Il paie plus cher ce que sa région réclame.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { toast, sfx } from '../core/bus.js';
import { REGIONS, CARAVAN, TRADES, HOT, CHECK, ARMORED } from '../data/world.js';
import { pick } from '../core/rand.js';
import { have, take, give, earn, baseSell, takeAll, hasAll, lvlOk, addXp } from './player.js';
import { canMult } from './bunker.js';

const slot = () => Math.floor(now() / 1000 / CARAVAN.every);
export const regionAt = k => REGIONS[(k + state.caravan.seed) % REGIONS.length];
export const convoy = () => regionAt(slot());
export const convoyLeft = () => CARAVAN.every - ((now() / 1000) % CARAVAN.every);
export const upcoming = (n = 3) => Array.from({ length: n }, (_, k) => ({ region: regionAt(slot() + k + 1), in: convoyLeft() + k * CARAVAN.every }));
const CANS = ['canRuta', 'canGlow', 'soup', 'flour', 'shellOil', 'canBoom'];
// V2 : le contrôle sanitaire. Une région propre paie moitié prix les produits chauds ; une région « chaude » les paie 30 % de plus.
export const isHot = id => HOT.includes(id);
export const checkOn = () => state.level >= CHECK.lvl;
export function checkMult(id) {
    const c = convoy().check;
    if (!checkOn() || !c || !isHot(id)) return 1;
    return c === 'clean' ? CHECK.cleanMult : CHECK.hotMult;
}
export const wanted = id => convoy().wants.includes(id);
export function priceOf(id) {
    let p = baseSell(id);
    if (wanted(id)) p *= CARAVAN.bonus;
    if (CANS.includes(id)) p *= canMult();
    p *= checkMult(id);
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

// V2 : le convoi blindé, un gros contrat en six heures (manqué : un autre le remplace)
export const armoredOpen = () => state.level >= ARMORED.lvl;
function newContract() {
    const pool = ARMORED.pool.filter(([id]) => id !== 'canBoom' || state.level >= 13);
    const [id, n] = pick(pool);
    return { id, n, reward: Math.round(baseSell(id) * n * ARMORED.mult), until: now() + ARMORED.t * 1000 };
}
export function armored() {
    if (!armoredOpen()) return null;
    if (!state.armored || now() >= state.armored.until) state.armored = newContract();
    return state.armored;
}
export function deliverArmored() {
    const c = armored();
    if (!c) return 0;
    if (have(c.id) < c.n) {
        toast('Le convoi blindé veut le compte exact, pas un de moins');
        sfx('error');
        return 0;
    }
    take(c.id, c.n);
    earn(c.reward);
    addXp(40);
    state.stats.contracts = (state.stats.contracts || 0) + 1;
    const r = c.reward;
    state.armored = newContract();
    sfx('coin');
    return r;
}
