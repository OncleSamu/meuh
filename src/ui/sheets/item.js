// 1.136 : la fiche produit. Tout sur un produit au même endroit : le stock, d'où il vient, sa recette,
// à quoi il sert, qui le demande, et les boutons pour y aller, en faire en quantité ou le vendre.
import { state } from '../../core/state.js';
import { fmt, formatDuration } from '../../core/format.js';
import { ITEMS } from '../../data/items.js';
import { MACHINES, RECIPES } from '../../data/machines.js';
import * as G from '../../systems/index.js';
import { actions, byId } from '../dom.js';
import { ico, art, COIN } from '../icons.js';
import { btn } from '../kit.js';
import { go, ui } from '../app.js';
import { defineSheet, openSheet, sheetOpts, closeAll } from '../sheets.js';
import { longPress } from '../longpress.js';
import { itemSource, itemDemand } from './info.js';

const USES_MAX = 18;
// les recettes qui utilisent ce produit (celles déjà ouvertes d'abord)
const usesOf = id =>
    Object.values(RECIPES)
        .filter(r => r.ing[id] && ITEMS[r.id])
        .sort((a, b) => G.recipeUnlocked(b.id) - G.recipeUnlocked(a.id) || (a.lvl || 0) - (b.lvl || 0));

const link = (id, inner, cls) => `<button class="${cls}" data-act="itemGo" data-id="${id}">${inner}</button>`;

defineSheet('item', {
    title: o => `${ico(['item', o.id])}${ITEMS[o.id] ? ITEMS[o.id].name : ''}`,
    render(o) {
        const id = o.id,
            it = ITEMS[id];
        if (!it) return '';
        const have = state.inventory[id] || 0,
            keep = G.reservedQty(id),
            coming = G.coming(id);
        const r = RECIPES[id];
        const src = itemSource(id),
            demand = itemDemand(id);
        const stars = G.masteryCount(id) ? ` <small>${'★'.repeat(G.masteryStars(id))}</small>` : '';
        const head = `<div class="card item-head">${ico(['item', id], 'ico big')}<div class="card-main">
            <div class="card-title">En stock : ${fmt(have)}${stars}</div>
            <div class="card-sub">${[
                it.sell ? `vaut ${fmt(G.unitPrice(id, 0))}${COIN()} l’unité` : 'ne se vend pas',
                keep ? `${fmt(keep)} gardé${keep > 1 ? 's' : ''} pour vos commandes` : '',
                coming ? `${fmt(coming)} en préparation` : '',
            ]
                .filter(Boolean)
                .join(' · ')}</div>
            ${!r && src ? `<div class="card-sub">${src}</div>` : ''}</div></div>`;
        const want = demand.length ? `<div class="item-want">${ico(['ui', 'scroll'])}<span>Demandé par : ${demand.join(', ')}</span></div>` : '';
        let recipe = '';
        if (r) {
            const open = G.recipeUnlocked(id);
            const rows = Object.entries(r.ing)
                .map(([k, n]) => {
                    const h = state.inventory[k] || 0;
                    return link(
                        k,
                        `<span class="rneed-art">${art('item', k)}</span><span class="row-main"><b>${n} × ${ITEMS[k].name}</b><small>${fmt(h)} en stock${G.sourceOf(k) ? ` · ${G.sourceOf(k)}` : ''}</small></span><span class="chip ${h >= n ? 'ok' : 'no'}">${h >= n ? 'assez' : `manque ${fmt(n - h)}`}</span>`,
                        `rneed item-ing${h >= n ? ' ok' : ''}`,
                    );
                })
                .join('');
            recipe = `<h3 class="section-title"><span>Recette · ${MACHINES[r.machine].name}</span></h3>
                <p class="card-sub item-rinfo">${ico(['ui', 'clock'])}${formatDuration(G.recipeTime(id))}${r.outQty ? ` · donne ${r.outQty}` : ''}${open ? '' : ` · ${ico(['ui', 'lock'])}${G.recipeLockText(r)}`}</p>
                <div class="rneeds">${rows}</div>`;
        }
        const uses = usesOf(id);
        const more = o.more ? uses : uses.slice(0, USES_MAX);
        const usesHtml = uses.length
            ? `<h3 class="section-title"><span>Sert à · ${uses.length} recette${uses.length > 1 ? 's' : ''}</span></h3>
                <div class="item-uses">${more
                    .map(u => link(u.id, `${art('item', u.id)}<small>${ITEMS[u.id].name}</small>${G.recipeUnlocked(u.id) ? '' : `<i class="lk">${art('ui', 'lock')}</i>`}`, 'item-use'))
                    .join('')}</div>${uses.length > more.length ? btn(`Voir les ${uses.length} recettes`, { act: 'itemMore', size: 'sm', wide: true }) : ''}`
            : '';
        const canPlan = r && G.plannable(id) && Object.keys(r.ing).some(k => RECIPES[k]);
        const btns = `<div class="item-btns">
            ${btn(r ? 'Aller à la machine' : 'Y aller', { act: 'produce', data: { id }, kind: 'green' })}
            ${canPlan ? btn('En faire en quantité', { act: 'open', data: { sheet: 'plan', id }, kind: 'gold', icon: ['ui', 'loop'] }) : ''}
            ${have && it.sell ? btn('Vendre', { act: 'itemSell', data: { id }, icon: ['ui', 'coin'] }) : ''}
        </div>`;
        const back = o.trail && o.trail.length ? `<button class="item-back" data-act="itemBack">‹ ${ITEMS[o.trail[o.trail.length - 1]].name}</button>` : '';
        return [
            ['back', back],
            ['head', head],
            ['want', want],
            ['btns', btns],
            ['recipe', recipe],
            ['uses', usesHtml],
        ];
    },
});

const scrollTop = () => {
    const b = document.querySelector('#sheets .sheet-wrap:last-child .sheet-body');
    if (b) b.scrollTop = 0;
};
export const openItem = id => ITEMS[id] && openSheet('item', { id });

export function setupItem() {
    actions({
        itemGo: (el, d) => {
            const o = sheetOpts('item');
            if (!o) return openItem(d.id);
            (o.trail ||= []).push(o.id);
            o.id = d.id;
            o.more = false;
            scrollTop();
        },
        itemBack: () => {
            const o = sheetOpts('item');
            if (o.trail && o.trail.length) o.id = o.trail.pop();
            o.more = false;
            scrollTop();
        },
        itemMore: () => (sheetOpts('item').more = true),
        itemSell: (el, d) => {
            (ui.sel.q ||= {}).sell = ITEMS[d.id].name;
            ui.sel.sellF = 'all';
            closeAll();
            go('market/sell');
        },
    });
    // un appui long sur un produit ouvre sa fiche : grange, vente, ingrédients d'une recette
    const long = el => openItem(el.dataset.id || el.dataset.item);
    longPress(byId('sheets'), '.bgood[data-id], [data-item]', long);
    for (const v of ['view-market', 'view-aside']) if (byId(v)) longPress(byId(v), '.goods[data-item]', long);
}
