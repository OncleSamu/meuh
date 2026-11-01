// 1.64 : les longues listes (260 bières, des dizaines de variétés…) s'affichent par paquets, avec « Voir plus »,
// et des filtres en puces. L'état (combien on en montre, quel filtre) vit dans ui.sel.more et ui.sel.filt.
import { ui } from './app.js';
import { actions, esc } from './dom.js';

let ready = false;
function setup() {
    if (ready) return;
    ready = true;
    actions({
        moreList: (el, d) => {
            const m = (ui.sel.more = ui.sel.more || {});
            m[d.k] = (m[d.k] || +d.step) + +d.step;
        },
        filtList: (el, d) => {
            (ui.sel.filt = ui.sel.filt || {})[d.k] = d.f;
            if (ui.sel.more) delete ui.sel.more[d.k];
        },
    });
}

// les step premiers éléments (plus ceux déjà dévoilés), et le bouton pour voir la suite
export function page(key, list, step = 12) {
    setup();
    const n = Math.max(step, (ui.sel.more && ui.sel.more[key]) || step);
    const rest = list.length - n;
    return {
        items: list.slice(0, n),
        more:
            rest > 0
                ? `<button class="btn wide more-list" data-act="moreList" data-k="${key}" data-step="${step}">Voir ${Math.min(step, rest)} de plus <small>(encore ${rest})</small></button>`
                : '',
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
export const filterChips = (key, opts, cur) =>
    `<div class="chips-row wrap list-filt">${opts
        .filter(o => o[2] > 0 || o[0] === cur)
        .map(
            ([id, name, n]) =>
                `<button class="pick-chip${cur === id ? ' on' : ''}" data-act="filtList" data-k="${key}" data-f="${esc(id)}">${esc(name)}<small>${n}</small></button>`,
        )
        .join('')}</div>`;
