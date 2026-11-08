// 1.98 : les commerces du village : reprendre un métier, servir la commande de l'artisan.
import { state } from '../../core/state.js';
import { fmt } from '../../core/format.js';
import { COMMERCES, COMMERCE } from '../../data/commerces.js';
import { ITEMS } from '../../data/items.js';
import * as G from '../../systems/index.js';
import { actions } from '../dom.js';
import { ico } from '../icons.js';
import { btn } from '../kit.js';

const COIN = () => ico(['ui', 'coin']);
const matsHtml = m =>
    Object.entries(m)
        .map(([k, n]) => `${ico(['item', k])}${n}`)
        .join(' ');
const hearts = n => `<span class="fid">${[1, 2, 3, 4, 5].map(i => `<i class="${n >= i ? 'on' : ''}">♥</i>`).join('')}</span>`;

function ownedCard(id, c) {
    const d = COMMERCES[id];
    const fid = G.commerceFid(c);
    const o = c.order;
    const order = o
        ? `<div class="od-line">${ico(['item', o.item])}<span><b>${o.n} × ${ITEMS[o.item].name}</b><small>${fmt(G.commerceValue(c))}${COIN()} · payé ×${String(G.commercePay(c).toFixed(1)).replace('.', ',')}</small></span></div>
           <div class="od-foot">${btn('Livrer', { act: 'deliverCommerce', data: { id }, kind: G.commerceCanDeliver(c) ? 'green' : '', size: 'sm', disabled: !G.commerceCanDeliver(c) })}${btn('Une autre', { act: 'otherOrder', data: { id }, size: 'sm' })}</div>`
        : '<p class="card-sub">Sa prochaine commande arrive bientôt.</p>';
    return `<div class="card commerce-card"><div class="card-head">${ico(['villager', c.look], 'ico big')}<div class="card-main"><div class="card-title">${d.name}</div><div class="card-sub">${c.name}, ${d.job} · ${c.n} commande${c.n > 1 ? 's' : ''} ${hearts(fid)}</div></div></div>
        ${order}<div class="od-foot">${btn('Changer d’allure', { act: 'rerollLook', data: { id }, size: 'sm' })}</div></div>`;
}
function lockedCard(id) {
    const d = COMMERCES[id];
    const ok = G.canTakeOver(id);
    return `<div class="card commerce-card${state.level < d.lvl ? ' locked' : ''}"><div class="card-head">${ico(d.icon, 'ico big')}<div class="card-main"><div class="card-title">${d.name}</div><div class="card-sub">${state.level < d.lvl ? `Au niveau ${d.lvl}` : `Un ${d.job} cherche quelqu’un pour reprendre sa porte : il passera commande chez vous, tout le temps.`}</div></div></div>
        ${state.level < d.lvl ? '' : `<div class="od-foot">${btn(`Reprendre · ${fmt(d.cost)}${COIN()} ${matsHtml(d.mats)}`, { act: 'takeOver', data: { id }, kind: ok ? 'green' : '', size: 'sm', disabled: !ok })}</div>`}</div>`;
}
export function commercesCard() {
    if (!G.commercesOpen()) return null;
    const ids = G.commerceList();
    const mine = ids.filter(id => G.commerceOf(id));
    const next = ids.filter(id => !G.commerceOf(id)).slice(0, mine.length ? 2 : 1);
    return `<div class="commerces">${mine.map(id => ownedCard(id, G.commerceOf(id))).join('')}${next.map(lockedCard).join('')}
        <p class="card-sub">Une commande permanente par commerce, qui n'expire jamais : ${COMMERCE.pay.toString().replace('.', ',')} fois la valeur du produit, et de plus en plus avec sa confiance.</p></div>`;
}
export function setupCommerces() {
    actions({
        takeOver: (el, d) => G.takeOver(d.id, el),
        deliverCommerce: (el, d) => G.deliverCommerce(d.id, el),
        otherOrder: (_, d) => G.otherOrder(d.id),
        rerollLook: (_, d) => G.rerollLook(d.id),
    });
}
