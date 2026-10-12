// Morceaux partagés par plusieurs vues : lignes de commande, récompenses, commande épinglée.
import { state } from '../../core/state.js';
import { fmt } from '../../core/format.js';
import { ITEMS } from '../../data/items.js';
import * as G from '../../systems/index.js';
import { ico, art } from '../icons.js';

// une ligne « produit demandé » : touchez-la pour aller le produire
export function itemLine(x, have = state.inventory[x.id]) {
    const ok = have >= x.qty;
    const cooking = ok ? 0 : G.inProduction(x.id);
    const hint = ok ? '' : `<small>${G.sourceOf(x.id)}${cooking ? ` · ${cooking} en préparation` : ''}</small>`;
    return `<${ok ? 'div' : 'button'} class="oline${ok ? ' ok' : ' go'}"${ok ? '' : ` data-act="produce" data-id="${x.id}"`}>${ico(['item', x.id])}<span class="oline-main"><span>${ITEMS[x.id].name}</span>${hint}</span><b>${Math.min(have, x.qty)} / ${x.qty}</b>${ok ? ico(['ui', 'check'], 'ico tick') : ico(['ui', 'arrow'], 'ico go-arrow')}</${ok ? 'div' : 'button'}>`;
}

export const rewardHtml = (gold, xp, mats) =>
    `<span class="rewards"><span class="reward">${fmt(gold)}${ico(['ui', 'coin'])}</span>${xp ? `<span class="reward">${fmt(xp)}${ico(['ui', 'xp'])}</span>` : ''}${(mats || []).map(m => `<span class="reward mat">${ico(['item', m])}</span>`).join('')}</span>`;

// la commande épinglée reste visible en haut des vues
export function pinBar() {
    const q = G.pinnedOrder();
    if (!q) return '';
    const ready = G.checkQuestReady(q);
    return `<button class="pin-bar${ready ? ' ready' : ''}" data-act="go" data-path="village/orders">${ico(['ui', 'pin'], 'ico pin')}<span class="pin-who">${art('villager', q.vid)}</span>${q.items
        .map(x => `<span class="${state.inventory[x.id] >= x.qty ? 'ok' : ''}">${ico(['item', x.id])}${Math.min(state.inventory[x.id], x.qty)}/${x.qty}</span>`)
        .join('')}<b>${ready ? 'Prête !' : `${fmt(q.gold)}${ico(['ui', 'coin'])}`}</b></button>`;
}
