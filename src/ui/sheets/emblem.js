// 1.101.2 : choisir l'emblème de la marque parmi tous les dessins du jeu (produits, animaux, machines, habitants, décor).
import { state } from '../../core/state.js';
import { ITEMS } from '../../data/items.js';
import { ANIMALS } from '../../data/animals.js';
import { MACHINES } from '../../data/machines.js';
import { VILLAGERS } from '../../data/village.js';
import { items, animals, machines, people, ui as uiReg } from '../../art/kit.js';
import * as G from '../../systems/index.js';
import { actions, esc } from '../dom.js';
import { section } from '../kit.js';
import { defineSheet, closeSheet } from '../sheets.js';
import { page, filterOf, filterChips, searchBox, queryOf, matchQ } from '../pager.js';
import { emblemIco } from '../emblem.js';

const spaced = id => id.replace(/([A-Z])/g, ' $1').toLowerCase();
const GROUPS = [
    ['item', 'Produits', () => Object.keys(items).map(id => [id, (ITEMS[id] && ITEMS[id].name) || spaced(id)])],
    ['animal', 'Animaux', () => Object.keys(animals).map(id => [id, (ANIMALS[id] && ANIMALS[id].name) || spaced(id)])],
    ['machine', 'Machines', () => Object.keys(machines).map(id => [id, (MACHINES[id] && MACHINES[id].name) || spaced(id)])],
    ['villager', 'Habitants', () => Object.keys(people).map(id => [id, (VILLAGERS[id] && VILLAGERS[id].name) || spaced(id)])],
    ['ui', 'Décor', () => Object.keys(uiReg).map(id => [id, spaced(id)])],
];
const memo = {};
const listOf = k => memo[k] || (memo[k] = GROUPS.find(g => g[0] === k)[2]().sort((a, b) => a[1].localeCompare(b[1], 'fr')));
defineSheet('emblem', {
    title: 'Emblème de la marque',
    render() {
        const opts = GROUPS.map(([k, name]) => [k, name, listOf(k).length]);
        const cur = filterOf('emb', opts);
        const q = queryOf('emb');
        const list = listOf(cur).filter(([id, n]) => matchQ(q, n, id));
        const pg = page('emb', list, 48);
        const on = state.maison ? state.maison.emblem : '';
        const cells = pg.items
            .map(([id, n]) => {
                const e = `${cur}:${id}`;
                return `<button class="emb-cell${on === e || (cur === 'item' && on === id) ? ' on' : ''}" data-act="maisonEmblem" data-id="${e}" aria-label="${esc(n)}" title="${esc(n)}">${emblemIco(e)}</button>`;
            })
            .join('');
        return [
            ['cur', `<p class="card-sub center">Un dessin du jeu au choix : il ira sur l’étiquette de la Maison et sur chaque paquet.</p>`],
            ['search', searchBox('emb', 'Chercher un dessin')],
            ['chips', filterChips('emb', opts, cur)],
            ['top', pg.top],
            ['grid', list.length ? `<div class="emb-grid">${cells}</div>` : '<p class="empty">Aucun dessin ne correspond.</p>'],
            ['more', pg.more],
        ];
    },
});
export const setupEmblem = () => {};
