// Le carnet de Mamie Odette (1.2) : une page par machine, une anecdote par recette.
import { state } from '../../core/state.js';
import { fmt } from '../../core/format.js';
import { ITEMS } from '../../data/items.js';
import { MACHINES } from '../../data/machines.js';
import * as G from '../../systems/index.js';
import { actions } from '../dom.js';
import { ico, art } from '../icons.js';
import { btn, bar } from '../kit.js';
import { defineSheet, sheetOpts } from '../sheets.js';

defineSheet('carnet', {
    cls: 'carnet-sheet',
    title: 'Le carnet de Mamie Odette',
    open(o) {
        const pages = G.carnetPages();
        if (!o.m) o.m = (pages.find(p => p.ids.some(id => G.carnetOpen(id) && !state.carnet.seen[id])) || pages[0]).m;
    },
    render(o) {
        const pages = G.carnetPages();
        const p = pages.find(x => x.m === o.m) || pages[0];
        G.markCarnetSeen(p.ids);
        const found = G.carnetFound(),
            total = G.carnetTotal();
        const tabs = `<div class="chips-row carnet-tabs">${pages
            .map(x => {
                const n = x.ids.filter(G.carnetOpen).length;
                const fresh = x.ids.some(id => G.carnetOpen(id) && !state.carnet.seen[id]);
                return `<button class="pick-chip${x.m === p.m ? ' on' : ''}" data-act="carnetPage" data-m="${x.m}">${ico(['machine', x.m])}${MACHINES[x.m].name}<small>${n}/${x.ids.length}</small>${fresh ? '<span class="dot">!</span>' : ''}</button>`;
            })
            .join('')}</div>`;
        const claimed = state.carnet.claimed[p.m];
        const foot = G.carnetPageDone(p)
            ? claimed
                ? '<p class="card-sub center">Page complète : la photo est dans votre album.</p>'
                : btn(`Page complète : ${fmt(G.carnetPageReward())} pièces et une photo`, { act: 'claimCarnet', data: { m: p.m }, kind: 'gold', wide: true })
            : `<p class="card-sub center">${p.ids.filter(G.carnetOpen).length} / ${p.ids.length} recettes. Page complète : des pièces et une photo pour l’album.</p>`;
        return `<div class="carnet-intro">${art('villager', 'odette')}<p>« Mon petit, voici mon carnet. Chaque recette que tu maîtrises t’ouvre une page… et une histoire. »</p></div>
            <div class="carnet-progress"><b>${found} / ${total} histoires</b>${bar(found / total)}<small>Tout le carnet : 2 rubans de concours.</small></div>
            ${tabs}
            <div class="carnet-page">${p.ids
                .map(id => {
                    const open = G.carnetOpen(id);
                    return `<div class="carnet-entry${open ? '' : ' locked'}">${ico(['item', id], 'ico big')}<div><b>${ITEMS[id].name}</b><p>${G.carnetText(id)}</p></div></div>`;
                })
                .join('')}</div>
            ${foot}`;
    },
});

export function setupCarnet() {
    actions({
        carnetPage: (el, d) => (sheetOpts('carnet').m = d.m),
        claimCarnet: (el, d) => G.claimCarnetPage(d.m, el),
    });
}
