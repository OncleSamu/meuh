// 1.100 (étape 1) : la carte du camping de la vallée.
import { fmt, formatDuration } from '../../core/format.js';
import { now } from '../../core/clock.js';
import { CAMPING, PROFILES, CAMP_UPGRADES } from '../../data/camping.js';
import { ITEMS } from '../../data/items.js';
import * as G from '../../systems/index.js';
import { actions } from '../dom.js';
import { ico } from '../icons.js';
import { btn } from '../kit.js';

const COIN = () => ico(['ui', 'coin']);
const costHtml = c =>
    Object.entries(c)
        .map(([k, n]) => (k === 'coins' ? `${fmt(n)}${COIN()}` : `${ico(['item', k])}${n}`))
        .join(' ');
function guestCard(g, gi) {
    const left = formatDuration(Math.max(0, (g.leave - now()) / 1000));
    const wants = g.wants
        .map(
            (w, i) =>
                `<div class="od-line">${ico(['item', w.item])}<span><b>${ITEMS[w.item].name}</b><small>${w.done ? 'Vendu ✓' : `${fmt(G.priceOf(w.item))} pièces${G.canSell(g, i) ? '' : ' · pas en stock'}`}</small></span>${w.done ? '' : btn('Vendre', { act: 'campSell', data: { g: gi, i }, kind: G.canSell(g, i) ? 'green' : '', size: 'sm', disabled: !G.canSell(g, i) })}</div>`,
        )
        .join('');
    return `<div class="card camp-card"><div class="card-head">${ico(['villager', g.look], 'ico big')}<div class="card-main"><div class="card-title">${g.name} ${g.from}</div><div class="card-sub">${PROFILES[g.profile].name} · repart dans ${left}</div></div></div>${wants}</div>`;
}
export function campingCard() {
    if (!G.campOpen()) return null;
    if (!G.campBuilt()) {
        const ok = G.canBuildCamp();
        return `<div class="card camp-card"><div class="card-head">${ico(['ui', 'heart'], 'ico big')}<div class="card-main"><div class="card-title">Le camping de la vallée</div><div class="card-sub">${CAMPING.pitches} emplacements et un feu de camp : des campeurs de passage viennent planter leur tente et acheter vos produits.</div></div></div>
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
    return `<div class="camps"><div class="card camp-card"><div class="card-head">${ico(['ui', 'heart'], 'ico big')}<div class="card-main"><div class="card-title">Le camping · ${G.campPitches()} emplacements</div><div class="card-sub">${gs.length} campeur${gs.length > 1 ? 's' : ''} sur place · ${G.campFree()} libre${G.campFree() > 1 ? 's' : ''}</div></div></div>${shop}${pitch}</div>
        ${gs.length ? gs.map(guestCard).join('') : '<p class="card-sub">Un campeur arrive bientôt.</p>'}
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
    });
}
