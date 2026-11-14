// 1.64 : les longues listes (260 bières, des dizaines de variétés…) : des filtres en puces, une recherche par nom
// et des pages numérotées (1.64.1, à la place de « Voir plus »). L'état vit dans ui.sel.pg, ui.sel.filt et ui.sel.q.
import { ui } from './app.js';
import { actions, esc } from './dom.js';

let ready = false;
// une nouvelle recherche ou un autre filtre : on repart de la première page (les clés de pages commencent par celle de la liste)
const firstPage = k => ui.sel.pg && Object.keys(ui.sel.pg).forEach(x => x.startsWith(k) && delete ui.sel.pg[x]);
function setup() {
    if (ready) return;
    ready = true;
    actions({
        pageList: el => {
            const d = el.dataset;
            (ui.sel.pg = ui.sel.pg || {})[d.k] = +d.p;
            if (el.closest('.pager.top')) return;
            setTimeout(() => {
                const top = document.querySelector(`.pager.top[data-pgtop="${d.k.replace(/"/g, '')}"]`);
                if (top) top.scrollIntoView({ block: 'start', behavior: 'smooth' });
            }, 0);
        },
        filtList: (el, d) => {
            (ui.sel.filt = ui.sel.filt || {})[d.k] = d.f;
            firstPage(d.k);
        },
        searchList: (el, d) => {
            (ui.sel.q = ui.sel.q || {})[d.k] = d.value;
            firstPage(d.k);
        },
        filtSel: (el, d) => {
            (ui.sel.filt = ui.sel.filt || {})[d.k] = d.value;
            firstPage(d.k);
        },
        sortSel: (el, d) => {
            (ui.sel.sort = ui.sel.sort || {})[d.k] = d.value;
            firstPage(d.k);
        },
        clearSearch: (el, d) => {
            if (ui.sel.q) ui.sel.q[d.k] = '';
            firstPage(d.k);
        },
    });
}

// sans accents ni majuscules, pour chercher « creme » et trouver « Crème »
export const norm = t =>
    String(t || '')
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .trim();
export const queryOf = key => norm(ui.sel.q && ui.sel.q[key]);
export const matchQ = (q, ...texts) => !q || texts.some(t => norm(t).includes(q));

// 1.136 : la même barre partout. Une loupe, le champ, la croix pour effacer ; et à côté, le tri, de la même taille.
const LOUPE = '<svg class="ls-ico" viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5" fill="none" stroke="currentColor" stroke-width="2.6"/><path d="M15.5 15.5 L21 21" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/></svg>';
const TRI = '<svg class="ls-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4 V20 M7 20 L3.5 16 M7 20 L10.5 16 M17 20 V4 M17 4 L13.5 8 M17 4 L20.5 8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
// un champ de recherche (à mettre dans son propre bloc, à part des résultats : il n'est pas redessiné pendant qu'on écrit)
export function searchBox(key, placeholder, { input = 'searchList', value } = {}) {
    setup();
    const v = value !== undefined ? value : (ui.sel.q && ui.sel.q[key]) || '';
    return `<div class="list-search">${LOUPE}<input type="search" placeholder="${esc(placeholder)}" value="${esc(v)}" data-input="${input}" data-k="${key}" autocomplete="off" enterkeyhint="search" aria-label="${esc(placeholder)}">${
        v && input === 'searchList' ? `<button class="ls-clear" data-act="clearSearch" data-k="${key}" aria-label="Effacer">×</button>` : ''
    }</div>`;
}
// le tri choisi pour cette liste (le premier par défaut) ; sorts : [[id, nom]]
export const sortOf = (key, sorts) => {
    const v = ui.sel.sort && ui.sel.sort[key];
    return sorts.some(o => o[0] === v) ? v : sorts[0][0];
};
export function sortSelect(key, sorts) {
    setup();
    const cur = sortOf(key, sorts);
    return `<label class="list-sort">${TRI}<select data-input="sortSel" data-k="${key}" aria-label="Trier par">${sorts.map(([id, name]) => `<option value="${esc(id)}"${cur === id ? ' selected' : ''}>${esc(name)}</option>`).join('')}</select></label>`;
}
// la barre d'une liste : la recherche, le tri, ou les deux côte à côte
export const listBar = (key, { search, sorts } = {}) => `<div class="list-bar">${search ? searchBox(key, search) : ''}${sorts ? sortSelect(key, sorts) : ''}</div>`;

// une page de la liste (step éléments) et la barre des pages, en haut et en bas de la liste.
// 1.64.2 : tous les numéros tant qu'il y en a 15 au plus (on saute directement à la page 6), sinon 1 … 4 5 6 7 8 … 26
export function page(key, list, step = 20) {
    setup();
    const pages = Math.max(1, Math.ceil(list.length / step));
    const cur = Math.max(0, Math.min(pages - 1, (ui.sel.pg && ui.sel.pg[key]) || 0));
    const items = list.slice(cur * step, cur * step + step);
    if (pages <= 1) return { items, more: '', top: '', cur, pages };
    const show = new Set(pages <= 7 ? [...Array(pages).keys()] : [0, pages - 1, cur - 2, cur - 1, cur, cur + 1, cur + 2].filter(p => p >= 0 && p < pages));
    const nums = [];
    let last = -1;
    for (const p of [...show].sort((a, b) => a - b)) {
        if (p - last > 1) nums.push('<span class="pg-gap">…</span>');
        nums.push(
            `<button class="pg-n${p === cur ? ' on' : ''}" data-act="pageList" data-k="${key}" data-p="${p}"${p === cur ? ' aria-current="page"' : ''}>${p + 1}</button>`,
        );
        last = p;
    }
    const arrow = (p, t, dis) =>
        `<button class="pg-n pg-arrow" data-act="pageList" data-k="${key}" data-p="${p}"${dis ? ' disabled' : ''} aria-label="${t}">${t === 'Précédente' ? '‹' : '›'}</button>`;
    // tous les numéros visibles : pas besoin de flèches (elles reviennent quand on en cache)
    const bar = pages <= 7 ? nums.join('') : `${arrow(cur - 1, 'Précédente', cur === 0)}${nums.join('')}${arrow(cur + 1, 'Suivante', cur === pages - 1)}`;
    const count = `<small>${cur * step + 1} à ${Math.min(list.length, cur * step + step)} sur ${list.length}</small>`;
    return {
        items,
        cur,
        pages,
        top: `<nav class="pager top" data-pgtop="${key}">${bar}${count}</nav>`,
        more: `<nav class="pager">${bar}</nav>`,
    };
}

// le filtre choisi pour cette liste (ou le premier qui a des éléments)
export function filterOf(key, opts) {
    setup();
    const f = ui.sel.filt && ui.sel.filt[key];
    if (f && opts.some(o => o[0] === f)) return f;
    const first = opts.find(o => o[2] > 0);
    return (first || opts[0])[0];
}
// opts : [[id, nom, nombre]] ; les filtres vides sont cachés
export const filterChips = (key, opts, cur) => {
    setup();
    return `<div class="chips-row wrap list-filt">${opts
        .filter(o => o[2] > 0 || o[0] === cur)
        .map(
            ([id, name, n]) =>
                `<button class="pick-chip${cur === id ? ' on' : ''}" data-act="filtList" data-k="${key}" data-f="${esc(id)}">${esc(name)}<small>${n}</small></button>`,
        )
        .join('')}</div>`;
};

// 1.64.3 : un tri en liste déroulante quand il y a trop de puces (une espèce par puce, ça faisait trois lignes)
export const filterSelect = (key, opts, cur, label) => {
    setup();
    return `<label class="list-sort filt"><span>${esc(label)}</span><select data-input="filtSel" data-k="${key}" aria-label="${esc(label)}">${opts
        .filter(o => o[2] > 0 || o[0] === cur)
        .map(([id, name, n]) => `<option value="${esc(id)}"${cur === id ? ' selected' : ''}>${esc(name)} (${n})</option>`)
        .join('')}</select></label>`;
};
