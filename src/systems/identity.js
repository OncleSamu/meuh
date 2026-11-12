// 1.113 : la carte de visite de la ferme. Un personnage composé comme les habitants de la vallée, et un nom de ferme.
// state.me = { look: 'h…', farm: 'Nom de la ferme' } ; absent tant que le joueur n'a pas rempli la page d'accueil.
import { state } from '../core/state.js';
import { isHabitant, randomId } from '../art/habitants.js';

export const FARM_NAME_MAX = 22;
export const DEFAULT_FARM = 'La ferme de Mamie';
export const identitySet = () => !!(state.me && isHabitant(state.me.look));
export const meLook = () => (identitySet() ? state.me.look : randomId(7, { female: true }));
export const farmName = () => (state.me && state.me.farm) || DEFAULT_FARM;
export const cleanFarmName = n =>
    String(n || '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, FARM_NAME_MAX);
export function setIdentity(look, farm) {
    if (!isHabitant(look)) return false;
    state.me = { look, farm: cleanFarmName(farm) || DEFAULT_FARM };
    return true;
}
