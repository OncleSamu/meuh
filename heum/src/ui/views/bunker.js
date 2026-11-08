// Heum — l'onglet Bunker : la coupe de l'étage, les vivres et l'air pur.
import { state } from '../../core/state.js';
import * as H from '../../systems/index.js';
import { BUNKER } from '../../data/world.js';
import { CROPS, MUTANTS } from '../../data/crops.js';
import { GOODS } from '../../data/world.js';
import { ico, btn, card, head, bar, timer } from '../kit.js';
import { floatAt } from '../fx.js';
import { art } from '../../art/index.js';

const WHO = { Armand: 'armand', Lison: 'lison', Basile: 'basile' };
function coupe() {
    const fed = H.bunkerFed();
    const rooms = BUNKER.rooms
        .map(r => `<div class="room ${fed ? 'on' : 'off'}"><span class="who">${art(WHO[r.who])}</span><b>${r.name}</b><small>${r.who}</small></div>`)
        .join('');
    return `<div class="coupe">
        <div class="surface"><span>${ico('tabPlots')}</span><small>La ferme · ${Math.round(state.cont)} %</small></div>
        <div class="shaft"></div>
        <div class="floor"><span class="lvl-tag">−1</span>${rooms}</div>
        <div class="floor locked"><span class="lvl-tag">−2</span><p>${ico('lock')} Deuxième étage : à creuser dans une prochaine version</p></div>
    </div>`;
}
function statusCard() {
    const b = state.bunker,
        fed = H.bunkerFed();
    const air = H.airPure();
    return card(
        `${head('Le Bunker', 'tabBunker', fed ? 'Les habitants sont nourris : ils travaillent pour la ferme.' : state.cont >= 85 ? 'L’air est irrespirable : tout le monde se calfeutre.' : 'Plus de vivres : les habitants sont en veille. Rien n’est perdu.')}
        ${coupe()}
        <div class="lab">Vivres ${b.food} / ${BUNKER.foodMax}${b.food ? ` · un repas dans ${timer(BUNKER.eatEvery - (b.clock || 0))}` : ''}</div>${bar(b.food / BUNKER.foodMax, '#d7a640')}
        <div class="lab">Air pur ${air} %</div>${bar(air / 100, air > 40 ? '#5fa6c9' : '#d2412f')}
        <ul class="perks">${BUNKER.rooms.map(r => `<li class="${fed ? 'on' : ''}">${ico(WHO[r.who])}${r.text}</li>`).join('')}</ul>`,
    );
}
function deliverCard() {
    const ids = [...Object.keys(CROPS), ...Object.keys(MUTANTS), ...Object.keys(GOODS)].filter(id => H.foodOf(id) && H.have(id));
    const rows = ids
        .map(
            id =>
                `<div class="pick">${ico(id, 'ico big')}<div><b>${H.nameOf(id)}</b><small>${H.have(id)} en stock · ${H.foodOf(id)} vivre${H.foodOf(id) > 1 ? 's' : ''} chacun</small></div><span class="btns">${btn('1', 'deliver', { id, n: 1 }, { size: 'sm' })}${btn('Tout', 'deliver', { id, n: 999 }, { size: 'sm' })}</span></div>`,
        )
        .join('');
    return card(
        `${head('Livrer des vivres', '', 'Récoltes, œufs, lait et conserves nourrissent l’étage.')}${rows || '<p class="hint">Rien à livrer pour l’instant.</p>'}`,
    );
}
export const render = () => statusCard() + deliverCard();
export const actions = {
    deliver(el, d) {
        const k = H.deliver(d.id, +d.n);
        if (k) floatAt(el, `+${k * H.foodOf(d.id)} vivres`);
    },
};
export const view = { id: 'bunker', name: 'Bunker', icon: 'tabBunker', render, actions };
