// 1.101.3 : la fiche d'un résident du camping, la même que celle d'un villageois : Amitié, Cadeau, Goûts, Histoire.
import { state } from '../../core/state.js';
import { fmt, formatDuration } from '../../core/format.js';
import { now } from '../../core/clock.js';
import { ITEMS } from '../../data/items.js';
import { RESIDENTS } from '../../data/campers.js';
import { PROFILES } from '../../data/camping.js';
import * as G from '../../systems/index.js';
import { jobHtml } from '../views/camping.js';
import { actions, esc } from '../dom.js';
import { ico, art } from '../icons.js';
import { btn, bar, hearts, segmented, hint } from '../kit.js';
import { defineSheet, sheetOpts } from '../sheets.js';

const res = i => G.campRes()[+i];
// les cœurs d'un résident : dix, pour une amitié qui va plus loin que celle des villageois
export const resHeartsHtml = r => hearts(G.resHearts(r), RESIDENTS.hearts.length);
const progress = r => {
    const h = G.resHearts(r),
        T = RESIDENTS.hearts;
    if (h >= T.length) return 1;
    const from = h ? T[h - 1] : 0;
    return (r.fr - from) / (T[h] - from);
};
function friendTab(r, i) {
    const h = G.resHearts(r);
    const next = RESIDENTS.hearts[h];
    const o = r.order;
    const order = o
        ? `<div class="vf-line">${ico(['item', o.item])}<div><b>Commande : ${o.n} × ${ITEMS[o.item].name}</b><small>${fmt(G.resOrderValue(r))} pièces. ${G.resCanDeliver(r) ? '' : 'Il vous manque des produits.'}</small></div>${btn('Livrer', { act: 'campDeliver', data: { i }, kind: G.resCanDeliver(r) ? 'green' : '', size: 'sm', disabled: !G.resCanDeliver(r) })}</div>`
        : '<div class="vf-line off">' + ico(['ui', 'clock']) + '<div><b>Prochaine commande bientôt</b><small>Il en passe une nouvelle toutes les quelques heures.</small></div></div>';
    const sure = G.resConfirming(r);
    return `<div class="vf-block">${resHeartsHtml(r)}${h < RESIDENTS.hearts.length ? bar(progress(r), 'pink') : ''}<p class="card-sub">${h < RESIDENTS.hearts.length ? `${next - r.fr} point${next - r.fr > 1 ? 's' : ''} pour le cœur suivant. Une commande livrée ou un cadeau en donne.` : 'Une amitié au sommet.'}</p></div>
        <div class="vf-line">${ico(['ui', 'heart'])}<div><b>Venu ${esc(r.from)}</b><small>${esc(r.job[0].toUpperCase() + r.job.slice(1))} · ${PROFILES[r.profile] ? PROFILES[r.profile].name.toLowerCase() : 'voyageur'} · ${r.done} commande${r.done > 1 ? 's' : ''} livrée${r.done > 1 ? 's' : ''}</small></div></div>
        ${order}
        ${jobHtml(r, i, true)}
        <div class="od-foot">${btn(sure ? 'Sûr ? Appuyez encore' : 'Faire partir', { act: 'campLeave', data: { i }, size: 'sm' })}</div>`;
}
function giftTab(r, i) {
    if (!G.resGiftReady(r)) {
        const left = (r.gift || 0) + RESIDENTS.gift.cool - now();
        return `<p class="card-sub center">Un cadeau a déjà été offert. Revenez dans ${formatDuration(Math.max(0, left) / 1000)}.</p>`;
    }
    const ids = r.likes.concat(r.seen ? [r.loved] : []).filter((id, k, a) => a.indexOf(id) === k && ITEMS[id]);
    const cell = id =>
        `<button class="pick-cell" data-act="campGift" data-i="${i}" data-id="${id}"${(state.inventory[id] || 0) < 1 ? ' disabled' : ''}><span class="pc-art">${art('item', id)}</span><b>${ITEMS[id].name}</b><small>×${fmt(state.inventory[id] || 0)} · ${id === r.loved ? 'adore' : 'aime'}</small></button>`;
    return `<h4 class="vf-h">Ce qu’il ou elle aime${r.seen ? ' (et adore)' : ''}</h4><div class="pick-grid">${ids.map(cell).join('')}</div>
        ${hint(`Un cadeau toutes les ${RESIDENTS.gift.cool / 3600000} h : +${RESIDENTS.gift.like} pour un produit aimé, +${RESIDENTS.gift.love} pour l’adoré.`)}`;
}
function tasteTab(r) {
    const loved = r.seen
        ? `<div class="vf-love">${art('item', r.loved)}<div><b>Adore : ${ITEMS[r.loved].name}</b><small>+${RESIDENTS.gift.love} points.</small></div></div>`
        : `<div class="vf-love off"><span class="vf-q">?</span><div><b>Adore : à découvrir</b><small>Il se révèle à ${RESIDENTS.seen} cœurs, ou en le lui offrant.</small></div></div>`;
    return `${loved}<h4 class="vf-h">Aime</h4><div class="vf-likes">${r.likes.filter(id => ITEMS[id]).map(id => `<i class="ico${(state.inventory[id] || 0) > 0 ? '' : ' dim'}" title="${ITEMS[id].name}">${art('item', id)}</i>`).join('')}</div><p class="card-sub">+${RESIDENTS.gift.like} points pour un produit aimé.</p>`;
}
function storyTab(r) {
    const h = G.resHearts(r);
    return RESIDENTS.stories
        .map((need, k) =>
            r.stories[k]
                ? `<div class="vstory done"><b>${ico(['ui', 'scroll'])}${esc(['Les débuts', 'Le chemin', 'Chez nous'][k])}</b><span class="card-sub">${esc(r.stories[k])}</span></div>`
                : `<div class="vstory off"><b>${ico(['ui', 'lock'])}${esc(['Les débuts', 'Le chemin', 'Chez nous'][k])}</b><span class="card-sub">S’ouvre à ${need} cœurs${h >= need ? '' : ` (encore ${need - h})`}.</span></div>`,
        )
        .join('');
}
defineSheet('resFiche', {
    title: o => {
        const r = res(o.i);
        return r ? `<span class="avatar xs">${art('villager', r.look)}</span>${esc(r.name)}` : 'Un résident';
    },
    render(o) {
        const r = res(o.i);
        if (!r) return '<p class="empty">Ce résident n’est plus là.</p>';
        const tabs = [
            ['friend', 'Amitié', null, G.resCanDeliver(r) || G.resBasketReady(r) ? 1 : 0],
            ['gift', 'Cadeau', null, G.resGiftReady(r) && r.likes.some(id => (state.inventory[id] || 0) > 0) ? 1 : 0],
            ['taste', 'Goûts', null],
            ['story', 'Histoire', null],
        ];
        const cur = tabs.some(t => t[0] === o.tab) ? o.tab : 'friend';
        const body = cur === 'gift' ? giftTab(r, o.i) : cur === 'taste' ? tasteTab(r) : cur === 'story' ? storyTab(r) : friendTab(r, o.i);
        return `<p class="card-sub center">${esc(r.job[0].toUpperCase() + r.job.slice(1))} · résident du camping</p>${segmented(tabs, cur, 'rfTab')}<div class="vf-body">${body}</div>`;
    },
});
export function setupResFiche() {
    actions({
        rfTab: (el, d) => {
            const s = sheetOpts('resFiche');
            if (s) s.tab = d.v;
        },
    });
}
