// La grange : place limitée pour les produits, agrandissements avec des matériaux rares.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { view } from '../core/view.js';
import { emit, toast, sfx, buzz, burst } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { BARN_TYPES, BARN_CAPS, RARE } from '../data/commerce.js';
import { projectDone } from './story.js';
import { houseBarn } from './home.js';
import { tip } from './tips.js';
import { spend } from './player.js';

export const inBarn = id => BARN_TYPES.includes(ITEMS[id].type);
export const barnCapAt = l => (l < BARN_CAPS.length ? BARN_CAPS[l] : 550 + (l - BARN_CAPS.length + 1) * 100);
export const barnUpCost = l => ({ coins: Math.round((500 * Math.pow(1.6, l)) / 50) * 50, plank: 2 + l, nail: 2 + l, paint: 1 + l });

export function barnUsed() {
    let n = 0;
    for (const id in state.inventory) if (ITEMS[id] && inBarn(id)) n += state.inventory[id] || 0;
    return n;
}

export const barnCap = () => barnCapAt(state.barn.lvl) + (projectDone('pontoon') ? 60 : 0) + houseBarn();
export const barnSpace = () => barnCap() - barnUsed();
export const barnGoods = () =>
    Object.keys(ITEMS)
        .filter(id => inBarn(id) && state.inventory[id] > 0)
        .sort((a, b) => state.inventory[b] - state.inventory[a]);

// Appelée avant chaque geste qui range quelque chose : bloque si la grange est déjà pleine.
// Le dernier lot peut dépasser un peu : on ne perd jamais une récolte en cours.
let warnedAt = 0;
export function barnBlocked(quiet) {
    if (barnSpace() > 0) return false;
    if (!quiet && now() - warnedAt > 2500) {
        warnedAt = now();
        toast('La grange est pleine : vendez, livrez ou agrandissez-la', ['ui', 'barn']);
        sfx('error');
        emit('barnFull');
    }
    return true;
}

// Matériau rare trouvé par hasard (récolte, ramassage, atelier, livraison)
export function rollRare(chance, at) {
    if (Math.random() >= chance) return null;
    const id = RARE[Math.floor(Math.random() * RARE.length)];
    giveRare(id, 1, at);
    return id;
}

export function giveRare(id, n, at) {
    state.inventory[id] = (state.inventory[id] || 0) + n;
    state.stats.rares = (state.stats.rares || 0) + n;
    if (at) emit('rare', { at, id, n });
    if (view.started) tip('rare');
}

export const canUpgradeBarn = () => {
    const cost = barnUpCost(state.barn.lvl);
    return state.money >= cost.coins && RARE.every(id => state.inventory[id] >= cost[id]);
};

export function upgradeBarn(at) {
    const cost = barnUpCost(state.barn.lvl);
    if (!canUpgradeBarn()) return false;
    spend(cost.coins);
    RARE.forEach(id => (state.inventory[id] -= cost[id]));
    state.barn.lvl++;
    sfx('level');
    buzz(30);
    burst(at, 'sparkle', 16);
    toast(`Grange agrandie : ${barnCap()} places`, ['ui', 'barn']);
    return true;
}
