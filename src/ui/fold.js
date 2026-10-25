// Les cartes repliables de Village | Commandes (comme l'Agenda) : une ligne fine, un toucher déplie.
// Le choix est retenu sur cet appareil ; sans choix, les commandes des villageois restent dépliées pour les débutants.
import { state } from '../core/state.js';
import { ico } from './icons.js';

const KEY = 'meuhFold';
const read = () => {
    try {
        return JSON.parse(localStorage.getItem(KEY) || '{}') || {};
    } catch {
        return {};
    }
};
const DEFAULT = { board: () => state.level < 10, villagers: () => state.level < 10 };
const write = m => {
    try {
        localStorage.setItem(KEY, JSON.stringify(m));
    } catch {
        /* tant pis : le choix n'est pas retenu */
    }
};
// 1.38 : une carte où quelque chose est prêt se déplie d'elle-même, sauf si on l'a repliée pendant qu'elle l'était.
// Sans rien de prêt, elle suit le choix du joueur (repliée par défaut).
export const foldOpen = (id, ready = false) => {
    const m = read();
    if (ready) return !m['!' + id];
    const v = m[id];
    return v === undefined ? (DEFAULT[id] ? DEFAULT[id]() : false) : !!v;
};
export function toggleFold(id, ready = false) {
    const m = read();
    if (ready) {
        if (foldOpen(id, true)) m['!' + id] = 1;
        else delete m['!' + id];
    } else m[id] = !foldOpen(id);
    write(m);
}
// summary : ce qu'on voit une fois replié ; ready : quelque chose est prêt (mis en valeur, déplié)
export function foldCard(id, icon, title, summary, body, ready = false, cls = '') {
    if (!ready) {
        const m = read();
        if (m['!' + id]) {
            delete m['!' + id];
            write(m);
        }
    }
    const open = foldOpen(id, ready);
    return `<div class="card agenda-card fold-card${cls ? ' ' + cls : ''}${open ? ' open' : ''}${ready ? ' ready' : ''}" data-fold="${id}"><button class="agenda-bar" data-act="foldToggle" data-id="${id}"${ready ? ' data-ready="1"' : ''} aria-expanded="${open}" aria-label="${title} : ${open ? 'replier' : 'déplier'}">${ico(icon)}<b>${title}</b>${open ? '<span class="agenda-sum"></span>' : `<span class="agenda-sum">${summary}</span>`}<i class="agenda-chev${open ? ' up' : ''}" aria-hidden="true">▾</i></button>${open ? `<div class="fold-body">${body}</div>` : ''}</div>`;
}
// une carte existante, repliée dans une ligne fine (son cadre disparaît dans la carte qui la contient)
export const foldWrap = (id, icon, title, summary, card, ready = false) => (card ? foldCard(id, icon, title, summary, card, ready, 'wrap1') : null);
