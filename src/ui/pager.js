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
            // on revient en haut de la liste
            const b = el.closest('.block') || el.closest('.sheet-body');
            setTimeout(() => {
                const top = b && b.isConnected ? b : document.querySelector(`[data-pgtop="${d.k}"]`);
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

// un champ de recherche (à mettre dans son propre bloc : il n'est pas redessiné pendant qu'on écrit)
export function searchBox(key, placeholder) {
    setup();
    const v = (ui.sel.q && ui.sel.q[key]) || '';
    return `<div class="list-search"><input type="search" placeholder="${esc(placeholder)}" value="${esc(v)}" data-input="searchList" data-k="${key}" autocomplete="off" enterkeyhint="search">${
        v ? `<button class="ls-clear" data-act="clearSearch" data-k="${key}" aria-label="Effacer">×</button>` : ''
    }</div>`;
}

// une page de la liste (step éléments) et la barre des pages : ‹ 1 … 4 5 6 … 26 ›
export function page(key, list, step = 20) {
    setup();
    const pages = Math.max(1, Math.ceil(list.length / step));
    const cur = Math.max(0, Math.min(pages - 1, (ui.sel.pg && ui.sel.pg[key]) || 0));
    const items = list.slice(cur * step, cur * step + step);
    if (pages <= 1) return { items, more: '', cur, pages };
    const show = new Set([0, pages - 1, cur - 1, cur, cur + 1].filter(p => p >= 0 && p < pages));
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
    return {
        items,
        cur,
        pages,
        more: `<nav class="pager">${arrow(cur - 1, 'Précédente', cur === 0)}${nums.join('')}${arrow(cur + 1, 'Suivante', cur === pages - 1)}<small>${cur * step + 1} à ${Math.min(list.length, cur * step + step)} sur ${list.length}</small></nav>`,
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
