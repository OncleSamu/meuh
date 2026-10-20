// 1.20 : l'état du domaine, en lecture seule. Ce fichier n'importe presque rien : tous les systèmes peuvent le lire sans cycle.
import { state } from '../core/state.js';
import { DOMAINE, DOMAINE_LVL, DOMAINE_COINS } from '../data/domaine.js';

export const domaineOpen = () => state.level >= DOMAINE_LVL;
export const domMax = () => DOMAINE_COINS.length;
export const domLvl = b => (state.domaine && state.domaine[b]) || 0;

// somme des effets des paliers atteints d'une branche ; key : champ de l'effet s'il est un objet
export function domStepSum(b, key) {
    if (!domaineOpen()) return 0;
    let sum = 0;
    for (let k = 0; k < domLvl(b); k++) {
        const v = DOMAINE[b].steps[k][1];
        sum += typeof v === 'object' ? v[key] || 0 : v;
    }
    return sum;
}
// les visiteurs restent plus longtemps, sans jamais rester tout l'intervalle
export const stayMult = () => 1 + domStepSum('guests');
export const stayOf = (stay, every) => (every ? Math.min(stay * stayMult(), every - 3600000) : stay * stayMult());
