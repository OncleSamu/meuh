// Heum — l'argent, l'expérience, le stock.
import { state } from '../core/state.js';
import { emit, toast, sfx } from '../core/bus.js';
import { CROPS, MUTANTS } from '../data/crops.js';
import { GOODS, xpFor, UNLOCKS, NO_CHARGE, SILO } from '../data/world.js';

export const itemOf = id => CROPS[id] || MUTANTS[id] || GOODS[id] || null;
export const nameOf = id => (itemOf(id) ? itemOf(id).name : id);
export const baseSell = id => (itemOf(id) ? itemOf(id).sell || 0 : 0);
export const foodOf = id => (itemOf(id) ? itemOf(id).food || 0 : 0);
export const isMutant = id => !!MUTANTS[id];

export const have = id => state.inv[id] || 0;
export const hasAll = need => Object.entries(need).every(([id, n]) => have(id) >= n);
// 0.3 : chaque produit en stock a une charge toxique moyenne (0 à 100), mélangée à chaque nouvel arrivage
export const carries = id => !NO_CHARGE.includes(id);
export const chargeOf = id => (state.charge && state.charge[id]) || 0;
// 0.5 : le silo limite le stock de chaque produit (pas les matériaux)
export const siloCap = () => SILO.caps[state.silo || 0];
export const siloLevel = () => state.silo || 0;
export function give(id, n = 1, charge) {
    if (carries(id)) {
        n = Math.min(n, Math.max(0, siloCap() - have(id)));
        if (n <= 0) {
            toast('Le silo est plein : vendez ou livrez');
            return 0;
        }
    }
    if (charge !== undefined && carries(id)) {
        state.charge = state.charge || {};
        const q = have(id);
        state.charge[id] = Math.round((chargeOf(id) * q + Math.max(0, Math.min(100, charge)) * n) / (q + n));
    }
    state.inv[id] = have(id) + n;
    return n;
}
export function take(id, n = 1) {
    if (have(id) < n) return false;
    state.inv[id] -= n;
    if (!state.inv[id]) {
        delete state.inv[id];
        if (state.charge) delete state.charge[id];
    }
    return true;
}
// la charge moyenne d'un lot d'ingrédients (pour ce qu'on en fabrique)
export function mixCharge(need) {
    let q = 0,
        c = 0;
    for (const [id, n] of Object.entries(need)) {
        if (!carries(id)) continue;
        q += n;
        c += chargeOf(id) * n;
    }
    return q ? Math.round(c / q) : 0;
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
