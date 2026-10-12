// Personnalisation de la ferme (clôture, allées, toit, grange), album de souvenirs et rappels.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { view } from '../core/view.js';
import { toast, sfx, burst } from '../core/bus.js';
import { STYLES, STYLE_LVL, STYLE_CHARM } from '../data/farm.js';
import { ALBUM_MAX } from '../data/progress.js';
import { spend } from './player.js';
import { season } from './world.js';
import { tip } from './tips.js';
import { machineBusy, outCount } from './workshop.js';

// ---------------- personnalisation ----------------
export const styleCost = k => 1500 + k * 1500;
export const styleOf = k => (state.style && state.style[k]) || STYLES[k].list[0][0];
export const styleOwned = (k, v) => v === STYLES[k].list[0][0] || !!state.style.owned[k + ':' + v];
export const styleCharm = () => Object.keys(state.style.owned || {}).length * STYLE_CHARM;
export const roofColor = () => (styleOf('roof') === 'auto' ? null : styleOf('roof'));

export function pickStyle(k, v, at) {
    const list = STYLES[k].list,
        idx = list.findIndex(([id]) => id === v);
    if (idx < 0) return false;
    if (!styleOwned(k, v)) {
        if (state.level < STYLE_LVL) return false;
        const cost = styleCost(idx);
        if (state.money < cost) {
            toast('Pas assez d’argent', ['ui', 'coin']);
            sfx('error');
            return false;
        }
        spend(cost);
        state.style.owned[k + ':' + v] = true;
        burst(at, 'sparkle', 12);
        toast(`Nouveau style : ${list[idx][1].toLowerCase()} (+${STYLE_CHARM} de charme au concours)`, ['item', 'brush']);
        sfx('buy');
    } else sfx('click');
    state.style[k] = v;
    return true;
}

// ---------------- album de la ferme ----------------
export function addPhoto(kind, id, title, sub) {
    if (!state.album) state.album = [];
    state.album.unshift({ kind, id, title, sub: sub || '', day: state.day, season: season().id, at: now(), lvl: state.level });
    if (state.album.length > ALBUM_MAX) state.album.length = ALBUM_MAX;
    if (!view.started) return;
    toast(`Nouvelle photo dans l’album : ${title}`, ['ui', 'camera']);
    tip('album');
}

export const PHOTO_BG = { printemps: '#d8f0c0', ete: '#fff1b8', automne: '#f7d9b0', hiver: '#e4eff6' };
export const photoDate = ph => new Date(ph.at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

// ---------------- rappels quand le jeu est en arrière-plan ----------------
// [clé, texte] : chaque clé n'est rappelée qu'une fois par absence
export function reminders() {
    const out = [];
    const planted = state.grid.filter(p => p.isUnlocked && p.itemId);
    if (planted.length && planted.every(p => p.isReady)) out.push(['crops', 'Toutes vos cultures sont prêtes à récolter.']);
    if (state.truck.status === 'here') out.push(['train:' + state.truck.expiresAt, 'Le train de marchandises est en gare.']);
    if (state.balloon.status === 'here') out.push(['balloon:' + state.balloon.expiresAt, 'Une montgolfière attend dans le pré.']);
    if (state.machines.length && state.machines.every(m => !machineBusy(m)) && state.machines.some(m => outCount(m)))
        out.push(['machines', 'Vos machines ont fini : l’atelier attend.']);
    const sold = state.stall.slots.filter(sl => sl && sl.sold).length;
    if (sold && sold === state.stall.slots.filter(Boolean).length) out.push(['stall', 'Tout est vendu à l’étal : venez encaisser.']);
    if (state.merchant.status === 'here') out.push(['merchant:' + state.merchant.expiresAt, 'Zéphyr, le marchand ambulant, est au village.']);
    return out;
}
