// Heum — le Bunker : un étage, trois habitants. Nourris, ils travaillent pour la ferme ; sans vivres, ils se mettent en veille.
import { state } from '../core/state.js';
import { toast, sfx } from '../core/bus.js';
import { BUNKER } from '../data/world.js';
import { take, have, foodOf, addXp } from './player.js';

// l'air pur dépend de la Contamination de surface
export const airPure = () => Math.max(0, Math.round(100 - state.cont * 0.8));
export const bunkerFed = () => state.bunker.food > 0 && state.cont < 85;
export const genMult = () => (bunkerFed() ? 1 + BUNKER.genBonus : 1);
export const canMult = () => (bunkerFed() ? 1 + BUNKER.canBonus : 1);

export function bunkerTick(dt) {
    const b = state.bunker;
    if (b.food <= 0) {
        b.clock = 0;
        return;
    }
    b.clock = (b.clock || 0) + dt;
    while (b.clock >= BUNKER.eatEvery && b.food > 0) {
        b.clock -= BUNKER.eatEvery;
        b.food--;
    }
}
export function deliver(id, n = 1) {
    const f = foodOf(id);
    const b = state.bunker;
    if (!f || have(id) < 1) return 0;
    const room = BUNKER.foodMax - b.food;
    const k = Math.min(n, have(id), Math.ceil(room / f));
    if (k <= 0) {
        toast('Le garde-manger est plein');
        return 0;
    }
    take(id, k);
    b.food = Math.min(BUNKER.foodMax, b.food + k * f);
    addXp(k);
    sfx('collect');
    return k;
}
