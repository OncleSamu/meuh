// 1.100 (étape 1) : la carte du camping de la vallée.
import { fmt, formatDuration } from '../../core/format.js';
import { now } from '../../core/clock.js';
import { CAMPING, PROFILES, CAMP_UPGRADES } from '../../data/camping.js';
import { ITEMS } from '../../data/items.js';
import * as G from '../../systems/index.js';
import { actions } from '../dom.js';
import { ico } from '../icons.js';
import { btn } from '../kit.js';

const hearts = n => `<span class="fid">${[1, 2, 3, 4, 5].map(i => `<i class="${n >= i ? 'on' : ''}">♥</i>`).join('')}</span>`;
export function askCard(a, i) {
    const ok = G.resCanAccept();
    return `<div class="card camp-card"><div class="card-head">${ico(['villager', a.look], 'ico big')}<div class="card-main"><div class="card-title">${a.name} ${a.from}</div><div class="card-sub">${a.job.charAt(0).toUpperCase() + a.job.slice(1)} · voudrait s’installer dans une cabane</div></div></div>
        <div class="od-foot">${btn(`Accueillir · ${fmt(G.resCabinCost())}${ico(['ui', 'coin'])}`, { act: 'campAccept', data: { i }, kind: ok ? 'green' : '', size: 'sm', disabled: !ok })}${btn('Pas cette fois', { act: 'campDecline', data: { i }, size: 'sm' })}</div></div>`;
}
export function residentCard(r, i) {
    const h = G.resHearts(r);
    const o = r.order;
    const order = o
        ? `<div class="od-line">${ico(['item', o.item])}<span><b>${o.n} × ${ITEMS[o.item].name}</b><small>${fmt(G.resOrderValue(r))} pièces</small></span>${btn('Livrer', { act: 'campDeliver', data: { i }, kind: G.resCanDeliver(r) ? 'green' : '', size: 'sm', disabled: !G.resCanDeliver(r) })}</div>`
        : '<p class="card-sub">Sa prochaine commande arrive bientôt.</p>';
    const gifts = r.likes
        .concat(r.seen ? [r.loved] : [])
        .filter((id, k, a) => a.indexOf(id) === k)
        .map(id => btn(`${ico(['item', id])}${id === r.loved ? ' ♥' : ''}`, { act: 'campGift', data: { i, id }, kind: G.resCanGift(r, id) ? 'green' : '', size: 'sm', disabled: !G.resCanGift(r, id) }))
        .join('');
    const story = r.stories.length ? `<p class="camp-story">${r.stories[r.stories.length - 1]}</p>` : '';
    const sure = G.resConfirming(r);
    return `<div class="card camp-card"><div class="card-head">${ico(['villager', r.look], 'ico big')}<div class="card-main"><div class="card-title">${r.name} ${r.from}</div><div class="card-sub">${r.job.charAt(0).toUpperCase() + r.job.slice(1)} ${hearts(h)}</div></div></div>
        ${order}<div class="od-line"><span><b>Un petit cadeau</b><small>${G.resGiftReady(r) ? 'Ce qu’il aime : un cadeau toutes les 6 h' : 'Revenez plus tard'}${r.seen ? '' : ' · son préféré se révèle à 3 cœurs'}</small></span></div><div class="od-foot">${gifts}</div>
        ${story}<div class="od-foot">${btn(sure ? 'Sûr ? Appuyez encore' : 'Faire partir', { act: 'campLeave', data: { i }, size: 'sm' })}</div></div>`;
}
const COIN = () => ico(['ui', 'coin']);
const costHtml = c =>
    Object.entries(c)
        .map(([k, n]) => (k === 'coins' ? `${fmt(n)}${COIN()}` : `${ico(['item', k])}${n}`))
        .join(' ');
export function guestCard(g, gi) {
    const left = formatDuration(Math.max(0, (g.leave - now()) / 1000));
    const wants = g.wants
        .map(
            (w, i) =>
                `<div class="od-line">${ico(['item', w.item])}<span><b>${ITEMS[w.item].name}</b><small>${w.done ? 'Vendu ✓' : `${fmt(G.priceOf(w.item))} pièces${G.canSell(g, i) ? '' : ' · pas en stock'}`}</small></span>${w.done ? '' : btn('Vendre', { act: 'campSell', data: { g: gi, i }, kind: G.canSell(g, i) ? 'green' : '', size: 'sm', disabled: !G.canSell(g, i) })}</div>`,
        )
        .join('');
    return `<div class="card camp-card"><div class="card-head">${ico(['villager', g.look], 'ico big')}<div class="card-main"><div class="card-title">${g.name} ${g.from}</div><div class="card-sub">${PROFILES[g.profile].name} · repart dans ${left}</div></div></div>${wants}</div>`;
}
export function upsHtml() {
    const ups = Object.entries(CAMP_UPGRADES)
        .filter(([id]) => !G.campUp(id))
        .map(([id, u]) => `<div class="od-line"><span><b>${u.name}</b><small>${u.desc}</small></span>${btn(costHtml(u.cost), { act: 'campUp', data: { id }, kind: G.upCan(id) ? 'green' : '', size: 'sm' })}</div>`)
        .join('');
    return ups || '<p class="card-sub">Tous les aménagements sont faits : le camping est complet.</p>';
}
export function campingCard() {
    if (!G.campOpen()) return null;
    if (!G.campBuilt()) {
        const ok = G.canBuildCamp();
        return `<div class="card camp-card"><div class="card-head">${ico(['ui', 'tent'], 'ico big')}<div class="card-main"><div class="card-title">Le camping de la vallée</div><div class="card-sub">${CAMPING.pitches} emplacements et un feu de camp : des campeurs de passage viennent planter leur tente et acheter vos produits.</div></div></div>
            <div class="od-foot">${btn(`Aménager · ${costHtml(CAMPING.cost)}`, { act: 'buildCamp', kind: ok ? 'green' : '', size: 'sm', disabled: !ok })}</div></div>`;
    }
    const gs = G.campGuests();
    const till = G.tillAmount();
    const shop = till > 0 || G.campUp('shop') ? `<div class="od-line"><span><b>Caisse de l’épicerie</b><small>${fmt(till)} pièces</small></span>${btn('Encaisser', { act: 'campTill', kind: till > 0 ? 'green' : '', size: 'sm', disabled: till <= 0 })}</div>` : '';
    const pitch = G.pitchCost() ? `<div class="od-foot">${btn(`Un emplacement de plus · ${fmt(G.pitchCost())}${COIN()}`, { act: 'campPitch', kind: G.canAddPitch() ? 'green' : '', size: 'sm', disabled: !G.canAddPitch() })}</div>` : '';
    const ups = Object.entries(CAMP_UPGRADES)
        .filter(([id]) => !G.campUp(id))
        .map(([id, u]) => `<div class="od-line"><span><b>${u.name}</b><small>${u.desc}</small></span>${btn(costHtml(u.cost), { act: 'campUp', data: { id }, kind: G.upCan(id) ? 'green' : '', size: 'sm', disabled: !G.upCan(id) })}</div>`)
        .join('');
    return `<div class="camps"><div class="card camp-card"><div class="card-head">${ico(['ui', 'tent'], 'ico big')}<div class="card-main"><div class="card-title">Le camping · ${G.campPitches()} emplacements</div><div class="card-sub">${gs.length} campeur${gs.length > 1 ? 's' : ''} sur place · ${G.campFree()} libre${G.campFree() > 1 ? 's' : ''}</div></div></div>${shop}${pitch}</div>
        ${G.campAsks().map(askCard).join('')}
        ${gs.length ? gs.map(guestCard).join('') : '<p class="card-sub">Un campeur arrive bientôt.</p>'}
        ${G.campRes().length ? `<div class="card-title camp-h">Résidents (${G.campRes().length}/12)</div>${G.campRes().map(residentCard).join('')}` : ''}
        ${ups ? `<div class="card camp-card"><div class="card-title">Améliorations</div>${ups}</div>` : ''}
        <p class="card-sub">Vendez-leur ce qu’ils cherchent avant leur départ : tout vendu, ils sont ravis et laissent un pourboire. Rien n’est jamais perdu.</p></div>`;
}
export function setupCamping() {
    actions({
        buildCamp: el => G.buildCamp(el),
        campPitch: () => G.addPitch(),
        campUp: (_, d) => G.buyUp(d.id),
        campTill: el => G.collectTill(el),
        campSell: (el, d) => G.sellTo(+d.g, +d.i, el),
        campAccept: (el, d) => G.resAccept(+d.i, el),
        campDecline: (_, d) => G.resDecline(+d.i),
        campDeliver: (el, d) => G.resDeliver(+d.i, el),
        campGift: (el, d) => G.resGift(+d.i, d.id, el),
        campLeave: (_, d) => G.resLeave(+d.i),
    });
}
