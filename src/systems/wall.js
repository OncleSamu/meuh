// 1.14 : le mur du salon — on y accroche le plus gros poisson pêché (+20 de charme au concours).
import { state } from '../core/state.js';
import { toast, sfx } from '../core/bus.js';
import { FISH } from '../data/meta.js';
import { bestOf, kgText } from './fishing.js';

export const WALL_CHARM = 20;
export const wallFishId = () => (state.house && state.house.wall) || null;
export const wallFish = () => {
    const id = wallFishId();
    return id && FISH[id] && bestOf(id) ? { id, w: bestOf(id), name: FISH[id].name } : null;
};
export const wallCharm = () => (wallFish() ? WALL_CHARM : 0);
// les prises dignes du mur : triées de la plus belle (part de l'écart de poids) à la plus petite
export const wallCandidates = () =>
    Object.keys(FISH)
        .filter(id => !FISH[id].junk && bestOf(id) > 0)
        .map(id => ({ id, name: FISH[id].name, w: bestOf(id), r: (bestOf(id) - FISH[id].w[0]) / (FISH[id].w[1] - FISH[id].w[0]) }))
        .sort((a, b) => b.r - a.r || b.w - a.w);
export function hangFish(id) {
    if (!bestOf(id)) return false;
    state.house.wall = id;
    sfx('level');
    toast(`${FISH[id].name} de ${kgText(bestOf(id))} accroché au mur du salon (+${WALL_CHARM} de charme)`, ['item', id]);
    return true;
}
