// 1.101 : composer un paquet. Trois produits au choix parmi tous ceux de la ferme (une grosse grille qu'on filtre et qu'on cherche),
// une boîte dessinée qui va avec le contenu, une qualité, un nom donné par le joueur.
import { state } from '../../core/state.js';
import { fmt, formatDuration } from '../../core/format.js';
import { ITEMS } from '../../data/items.js';
import { QUALITY } from '../../data/farm.js';
import { PACKS, PACK, KIND_NAMES, KINDS } from '../../data/paquets.js';
import * as G from '../../systems/index.js';
import { actions, esc } from '../dom.js';
import { ico } from '../icons.js';
import { btn, section, hint } from '../kit.js';
import { defineSheet, closeSheet, sheetOpts } from '../sheets.js';
import { renameBtn } from './rename.js';
import { page, filterOf, filterChips, searchBox, queryOf, matchQ } from '../pager.js';
import { pkHtml } from '../paquets.js';

const left = (o, id) => (state.inventory[id] || 0) - o.slots.filter(x => x === id).length;
function view(o) {
    const items = o.slots.filter(Boolean);
    const full = items.length === 3;
    const best = full ? G.bestQ(items) : 0;
    const q = full ? (o.q != null && G.canHaveQ(items, o.q) ? o.q : best) : 0;
    const auto = G.autoPack(items);
    const pack = o.pack && G.packOpen(o.pack) && G.packFits(o.pack, items) && G.packCan(o.pack) ? o.pack : auto;
    return { items, full, best, q, pack, name: o.name || G.nameIdeas(items)[0] };
}
defineSheet('paquet', {
    title: 'Composer un paquet',
    open(o) {
        o.slots = o.slots || [];
        o.q = null;
        o.pack = null;
        o.name = o.name || '';
    },
    render(o) {
        const v = view(o);
        const all = G.stockable();
        const kinds = KINDS;
        const opts = [['all', 'Tout', all.length], ...kinds.map(k => [k, KIND_NAMES[k], all.filter(id => G.kindOf(id) === k).length])];
        const cur = filterOf('pk', opts);
        const q = queryOf('pk');
        const list = all.filter(id => (cur === 'all' || G.kindOf(id) === cur) && matchQ(q, ITEMS[id].name)).sort((a, b) => ITEMS[a].name.localeCompare(ITEMS[b].name, 'fr'));
        const pg = page('pk', list, 24);
        const cells = pg.items
            .map(id => `<button class="pick-cell${v.items.includes(id) ? ' on' : ''}" data-act="pkAdd" data-id="${id}"${left(o, id) < 1 || v.full ? ' disabled' : ''}>${ico(['item', id], 'ico big')}<b>${ITEMS[id].name}</b><small>×${left(o, id)}</small></button>`)
            .join('');
        const slots = [0, 1, 2]
            .map(i => `<button class="pk-slot${o.slots[i] ? ' on' : ''}" data-act="pkSlot" data-i="${i}" aria-label="${o.slots[i] ? 'Retirer ' + ITEMS[o.slots[i]].name : 'Emplacement vide'}">${o.slots[i] ? ico(['item', o.slots[i]], 'ico big') : '<i>+</i>'}</button>`)
            .join('');
        const qchips = QUALITY.map(
            (Q, i) => `<button class="pick-chip${v.q === i ? ' on' : ''}" data-act="pkQ" data-q="${i}"${!v.full || !G.canHaveQ(v.items, i) ? ' disabled' : ''}>${Q.name}</button>`,
        ).join('');
        const packs = PACKS.map(p => {
            const open = G.packOpen(p.id),
                fits = G.packFits(p.id, v.items),
                n = G.boxStock(p.id);
            const tag = !open ? 'palier ' + (p.tier + 1) : !fits ? 'ne va pas' : n === Infinity ? 'toujours là' : n ? `×${n}` : 'à fabriquer';
            return `<button class="pk-pick${v.pack === p.id ? ' on' : ''}${open ? '' : ' locked'}${fits && n ? '' : ' nofit'}" data-act="pkPack" data-id="${p.id}"${open && fits && n ? '' : ' disabled'}>${pkHtml({ pack: p.id, items: [], q: 0 }, 'sm')}<b>${p.name}</b><small>${tag}</small></button>`;
        }).join('');
        const P = PACK[v.pack];
        const val = v.full ? G.coffretValue(v.items, v.q, v.pack) : 0;
        return [
            ['pv', `<div class="card pk-card"><div class="pk-prev">${pkHtml({ pack: v.pack, items: v.items, q: v.q }, 'lg')}</div>
                <div class="card-main"><div class="card-title">${esc(v.name)} ${renameBtn('paquet', 0, 'Nommer le paquet')}</div>
                <div class="card-sub">${v.full ? `Vaut ${fmt(val)} pièces · ${QUALITY[v.q].name}` : 'Choisissez trois produits dans la grille.'}</div></div></div>`],
            ['slots', `<div class="pk-slots">${slots}</div>`],
            ['q', section('Qualité') + `<div class="chips-row wrap">${qchips}</div>${hint('Toutes les unités du paquet auront au moins ce rang.')}`],
            ['packs', section('La boîte') + `<div class="pk-picks">${packs}</div><p class="card-sub">${P.blurb}</p>${hint('Les boîtes se fabriquent par trois à l’emballerie (Atelier › Production). La boîte de carton est toujours là. Une belle boîte rapporte plus, et sa valeur compte dans celle du paquet.')}`],
            ['grid', section('Vos produits')],
            ['search', all.length > 24 ? searchBox('pk', 'Chercher un produit') : ''],
            ['chips', filterChips('pk', opts, cur)],
            ['top', pg.top],
            ['cells', list.length ? `<div class="pick-grid">${cells}</div>` : '<p class="empty">Aucun produit ne correspond.</p>'],
            ['more', pg.more],
        ];
    },
    foot: o => {
        const v = view(o);
        const ok = v.full && G.canMake(v.items, v.q, v.pack);
        return btn(`Assembler · ${formatDuration(G.workTime() / 1000)}`, { act: 'pkMake', kind: ok ? 'green' : '', wide: true, size: 'lg', disabled: !ok });
    },
});

export function setupPaquet() {
    const o = () => sheetOpts('paquet');
    actions({
        pkAdd: (el, d) => {
            const s = o();
            if (s.slots.filter(Boolean).length < 3 && left(s, d.id) > 0) {
                const i = [0, 1, 2].find(k => !s.slots[k]);
                s.slots[i] = d.id;
                s.q = null;
                s.pack = null;
            }
        },
        pkSlot: (el, d) => {
            const s = o();
            // 1.104.5 : une case vide mène à la grille des produits
            if (!s.slots[+d.i]) {
                const g = document.querySelector('.sheet .pk-grid, .sheet .pick-grid, .sheet .search');
                if (g) g.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return false;
            }
            s.slots[+d.i] = null;
            s.q = null;
            s.pack = null;
        },
        pkQ: (el, d) => (o().q = +d.q),
        pkPack: (el, d) => (o().pack = d.id),
        pkMake: el => {
            const s = o();
            const v = view(s);
            if (v.full && G.makeCoffret(v.items, v.q, el, { pack: v.pack, name: s.name || v.name })) closeSheet('paquet');
        },
    });
}
