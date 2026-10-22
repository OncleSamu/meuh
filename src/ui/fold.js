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
const DEFAULT = { board: () => state.level < 10 };
export const foldOpen = id => {
    const v = read()[id];
    return v === undefined ? (DEFAULT[id] ? DEFAULT[id]() : false) : !!v;
};
export function toggleFold(id) {
    const m = read();
    m[id] = !foldOpen(id);
    try {
        localStorage.setItem(KEY, JSON.stringify(m));
    } catch {
        /* tant pis : le choix n'est pas retenu */
    }
}
// summary : ce qu'on voit une fois replié ; ready : quelque chose est prêt (mis en valeur)
export function foldCard(id, icon, title, summary, body, ready = false) {
    const open = foldOpen(id);
    return `<div class="card agenda-card fold-card${open ? ' open' : ''}${ready ? ' ready' : ''}" data-fold="${id}"><button class="agenda-bar" data-act="foldToggle" data-id="${id}" aria-expanded="${open}" aria-label="${title} : ${open ? 'replier' : 'déplier'}">${ico(icon)}<b>${title}</b>${open ? '<span class="agenda-sum"></span>' : `<span class="agenda-sum">${summary}</span>`}<i class="agenda-chev${open ? ' up' : ''}" aria-hidden="true">▾</i></button>${open ? `<div class="fold-body">${body}</div>` : ''}</div>`;
}
