// Heum — l'argent, l'expérience, le stock.
import { state } from '../core/state.js';
import { emit, toast, sfx } from '../core/bus.js';
import { CROPS, MUTANTS } from '../data/crops.js';
import { GOODS, xpFor, UNLOCKS } from '../data/world.js';

export const itemOf = id => CROPS[id] || MUTANTS[id] || GOODS[id] || null;
export const nameOf = id => (itemOf(id) ? itemOf(id).name : id);
export const baseSell = id => (itemOf(id) ? itemOf(id).sell || 0 : 0);
export const foodOf = id => (itemOf(id) ? itemOf(id).food || 0 : 0);
export const isMutant = id => !!MUTANTS[id];

export const have = id => state.inv[id] || 0;
export const hasAll = need => Object.entries(need).every(([id, n]) => have(id) >= n);
export function give(id, n = 1) {
    state.inv[id] = have(id) + n;
}
export function take(id, n = 1) {
    if (have(id) < n) return false;
    state.inv[id] -= n;
    if (!state.inv[id]) delete state.inv[id];
    return true;
}
export function takeAll(need) {
    if (!hasAll(need)) return false;
    for (const [id, n] of Object.entries(need)) take(id, n);
    return true;
}
export function earn(n) {
    state.money += Math.round(n);
}
export function spend(n) {
    if (state.money < n) return false;
    state.money -= n;
    return true;
}
export const xpNeed = () => xpFor(state.level);
export function addXp(n) {
    state.xp += Math.round(n);
    while (state.xp >= xpNeed()) {
        state.xp -= xpNeed();
        state.level++;
        const gift = 20 * state.level;
        earn(gift);
        sfx('level');
        emit('level', { level: state.level, unlock: UNLOCKS[state.level] || null, gift });
    }
}
export function lvlOk(lvl, what) {
    if (state.level >= lvl) return true;
    toast(`${what} s’ouvre au niveau ${lvl}`);
    sfx('error');
    return false;
}
