// 1.100 : la carte du gîte et de la table d'hôtes.
import { state } from '../../core/state.js';
import { fmt, formatDuration } from '../../core/format.js';
import { now } from '../../core/clock.js';
import { GITE, STARS } from '../../data/gite.js';
import { ITEMS } from '../../data/items.js';
import * as G from '../../systems/index.js';
import { actions } from '../dom.js';
import { ico } from '../icons.js';
import { btn } from '../kit.js';

const COIN = () => ico(['ui', 'coin']);
const stars = n => `<span class="fid">${[1, 2, 3, 4, 5].map(i => `<i class="${n >= i ? 'on' : ''}">★</i>`).join('')}</span>`;
const matsHtml = m =>
    Object.entries(m)
        .map(([k, n]) => `${ico(['item', k])}${n}`)
        .join(' ');
function guestCard(g, gi) {
    const left = formatDuration(Math.max(0, (g.leave - now()) / 1000));
    const meals = g.wants
        .map((w, i) => `<div class="od-line">${ico(['item', w.item])}<span><b>${ITEMS[w.item].name}</b><small>${w.done ? 'Servi ✓' : G.canServe(g, i) ? 'Prêt à servir' : 'Pas en stock'}</small></span>${w.done ? '' : btn('Servir', { act: 'serveGuest', data: { g: gi, i }, kind: G.canServe(g, i) ? 'green' : '', size: 'sm', disabled: !G.canServe(g, i) })}</div>`)
        .join('');
    return `<div class="card commerce-card">${`<div class="card-head">${ico(['villager', g.look], 'ico big')}<div class="card-main"><div class="card-title">${g.name}</div><div class="card-sub">Repart dans ${left} · ${fmt(G.guestPay(g))}${COIN()} pour l'instant</div></div></div>`}${meals}</div>`;
}
export function giteCard() {
    if (!G.giteOpen()) return null;
    if (!G.giteBuilt()) {
        const ok = G.canBuildGite();
        return `<div class="card commerce-card"><div class="card-head">${ico(['ui', 'heart'], 'ico big')}<div class="card-main"><div class="card-title">Le gîte de la ferme</div><div class="card-sub">${GITE.rooms} chambres et une table d'hôtes : des voyageurs viennent dormir, manger ce que vous cuisinez et laisser un avis.</div></div></div>
            <div class="od-foot">${btn(`Bâtir · ${fmt(GITE.cost)}${COIN()} ${matsHtml(GITE.mats)}`, { act: 'buildGite', kind: ok ? 'green' : '', size: 'sm', disabled: !ok })}</div></div>`;
    }
    const gs = G.giteGuests();
    const rep = G.giteRep();
    const rv = state.gite.reviews.slice(0, 3);
    const add = G.roomCost() ? `<div class="od-foot">${btn(`Une chambre de plus · ${fmt(G.roomCost())}${COIN()}`, { act: 'addRoom', kind: G.canAddRoom() ? 'green' : '', size: 'sm', disabled: !G.canAddRoom() })}</div>` : '';
    return `<div class="commerces"><div class="card commerce-card"><div class="card-head">${ico(['ui', 'heart'], 'ico big')}<div class="card-main"><div class="card-title">Le gîte · ${G.giteRooms()} chambres</div><div class="card-sub">${gs.length} client${gs.length > 1 ? 's' : ''} · réputation ${rep ? stars(Math.round(rep)) + ' ' + rep.toFixed(1).replace('.', ',') : 'pas encore d’avis'}</div></div></div>${add}</div>
        ${gs.length ? gs.map(guestCard).join('') : '<p class="card-sub">Un voyageur arrive bientôt.</p>'}
        ${rv.length ? `<div class="card commerce-card"><div class="card-title">Derniers avis</div>${rv.map(r => `<div class="od-line">${ico(['villager', r.look], 'ico')}<span><b>${r.name} ${stars(r.stars)}</b><small>${STARS[r.stars]} : « ${r.text} »</small></span></div>`).join('')}</div>` : ''}
        <p class="card-sub">Servez chaque plat avant le départ : tous servis, cinq étoiles et un pourboire ; sinon le client paie moins. Rien n'est jamais perdu.</p></div>`;
}
export function setupGite() {
    actions({
        buildGite: el => G.buildGite(el),
        addRoom: () => G.addRoom(),
        serveGuest: (el, d) => G.serve(+d.g, +d.i, el),
    });
}
