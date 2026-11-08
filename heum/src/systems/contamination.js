// Heum — la jauge de Contamination : le joueur la fait monter (engrais toxique) ou descendre (Épurateur, chèvres, le temps).
import { state } from '../core/state.js';
import { toast, sfx, emit } from '../core/bus.js';
import { TIERS, CONT, tierOf } from '../data/world.js';
import { take, have, lvlOk } from './player.js';

export const tier = () => tierOf(state.cont);
export const nextTier = () => TIERS.find(t => t.from > state.cont) || null;
export function addCont(n) {
    const before = tier().id;
    state.cont = Math.max(0, Math.min(100, state.cont + n));
    const after = tier();
    if (after.id !== before) emit('tier', after);
}
// le temps fait redescendre la jauge, en jeu comme hors ligne
export function contDecay(dt) {
    state.contClock = (state.contClock || 0) + dt;
    const steps = Math.floor(state.contClock / CONT.decayEvery);
    if (steps > 0) {
        state.contClock -= steps * CONT.decayEvery;
        addCont(-steps);
    }
}
export function spreadFertilizer() {
    if (!lvlOk(CONT.mutLvl, 'L’engrais toxique')) return false;
    if (!have('fertilizer')) {
        toast('Pas d’engrais toxique : le Fourneau-Réacteur en prépare');
        sfx('error');
        return false;
    }
    if (state.cont >= 100) return false;
    take('fertilizer');
    addCont(CONT.fertilizer);
    sfx('toxic');
    return true;
}
// la poule sentinelle : prévient quand on approche d'un palier (à 5 points ou moins)
export function sentinel() {
    if (!state.animals.some(a => a.type === 'hen')) return null;
    const n = nextTier();
    return n && n.from - state.cont <= 5 ? n : null;
}
