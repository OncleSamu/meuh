// Le carnet de Mamie Odette (1.2) : une anecdote par recette, débloquée à la maîtrise bronze (une étoile).
import { state } from '../core/state.js';
import { view } from '../core/view.js';
import { fmt } from '../core/format.js';
import { emit, toast, sfx } from '../core/bus.js';
import { MACHINES, RECIPES } from '../data/machines.js';
import { ITEMS } from '../data/items.js';
import { CARNET } from '../data/carnet.js';
import { masteryStars } from './mastery.js';
import { earn } from './player.js';
import { addPhoto } from './style.js';

export const ensureCarnet = () => (state.carnet = state.carnet || { claimed: {}, seen: {}, done: false });
export const carnetOpen = id => masteryStars(id) >= 1;
// les pages : une par machine, avec ses recettes
export const carnetPages = () =>
    Object.keys(MACHINES)
        .map(m => ({
            m,
            ids: Object.values(RECIPES)
                .filter(r => r.machine === m && CARNET[r.id])
                .map(r => r.id),
        }))
        .filter(p => p.ids.length);
export const carnetPageDone = p => p.ids.every(carnetOpen);
export const carnetFound = () => Object.keys(CARNET).filter(carnetOpen).length;
export const carnetTotal = () => Object.keys(CARNET).length;
export const carnetNew = () => Object.keys(CARNET).filter(id => carnetOpen(id) && !(state.carnet && state.carnet.seen[id])).length;
export const carnetPageReward = () => 2000 + state.level * 150;
export const carnetClaimable = () => carnetPages().filter(p => carnetPageDone(p) && !(state.carnet && state.carnet.claimed[p.m])).length;

export function markCarnetSeen(ids) {
    const C = ensureCarnet();
    ids.forEach(id => carnetOpen(id) && (C.seen[id] = true));
}

export function claimCarnetPage(m, at) {
    const C = ensureCarnet();
    const p = carnetPages().find(x => x.m === m);
    if (!p || !carnetPageDone(p) || C.claimed[m]) return false;
    C.claimed[m] = true;
    const coins = carnetPageReward();
    earn(coins, at);
    addPhoto('machine', m, `Le carnet : ${MACHINES[m].name}`, 'Une page de Mamie Odette');
    sfx('golden');
    // tout le carnet : 2 rubans et une photo avec Mamie Odette
    if (!C.done && carnetPages().every(x => C.claimed[x.m])) {
        C.done = true;
        state.prestige.rubans += 2;
        addPhoto('villager', 'odette', 'Le carnet de Mamie Odette', 'Toutes les pages remplies');
        if (view.started)
            emit('celebrate', {
                icon: ['villager', 'odette'],
                title: 'Le carnet est complet !',
                sub: 'Mamie Odette : « Tu connais toutes mes recettes, et toutes mes histoires. Il est à toi, maintenant. »',
                lines: [[['ui', 'ribbon'], '2 rubans de concours']],
            });
    } else if (view.started) toast(`Page « ${MACHINES[m].name} » complète : ${fmt(coins)} pièces et une photo pour l’album`, ['villager', 'odette']);
    return true;
}

// le texte d'une recette (ou son indice si elle n'est pas encore débloquée)
export const carnetText = id => (carnetOpen(id) ? CARNET[id] : `Faites ${ITEMS[id].name.toLowerCase()} assez souvent (maîtrise bronze) pour lire cette page.`);
