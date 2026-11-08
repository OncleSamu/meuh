// Heum — l'onglet Ménagerie : des bêtes à rôle et leur Charge toxique.
import { state } from '../../core/state.js';
import * as H from '../../systems/index.js';
import { ANIMALS } from '../../data/world.js';
import { ico, btn, card, head, bar, timer } from '../kit.js';
import { floatAt } from '../fx.js';

const chargeCol = c => (c >= 100 ? '#d2412f' : c >= 50 ? '#c7d63a' : '#7fbf5a');
function animalCard(a, k) {
    const d = ANIMALS[a.type];
    const p = H.prodOf(a);
    return card(
        `<div class="beast">${ico(a.type, 'ico huge')}<div class="beast-txt">
            <h3>${a.name} <small>${d.name}</small></h3>
            <p class="role">${d.role}</p>
            <div class="lab">Charge toxique ${Math.round(a.charge)} %</div>${bar(a.charge / 100, chargeCol(a.charge))}
            <p class="hint">${H.chargeLabel(a)}</p>
            <div class="row">${a.stock.length ? `<span class="chips">${a.stock.map(id => `<span class="chip">${ico(id)}</span>`).join('')}</span>` : ''}${
                p && a.stock.length < 3
                    ? `<small class="next">${ico(p)} dans ${timer(H.animalLeft(a))}</small>`
                    : a.stock.length >= 3
                      ? '<small class="next">Panier plein</small>'
                      : ''
            }</div>
            ${btn('Ramasser', 'collectAnimal', { k }, { disabled: !a.stock.length, kind: 'go' })}
        </div></div>`,
    );
}
function shop() {
    const rows = Object.entries(ANIMALS)
        .map(([type, d]) => {
            const ok = state.level >= d.lvl;
            return `<div class="pick ${ok ? '' : 'off'}">${ico(type, 'ico big')}<div><b>${d.name}</b><small>${d.role}</small><small>${H.countOf(type)} / ${d.max} dans l’enclos</small></div>${
                ok
                    ? btn(`${d.price}`, 'buyAnimal', { type }, { icon: 'coin', disabled: !H.canBuy(type) || state.money < d.price })
                    : `<span class="lvl">${ico('lock')}niv. ${d.lvl}</span>`
            }</div>`;
        })
        .join('');
    return card(
        `${head('Accueillir une bête', '', 'Au-dessus de 30 % de Contamination, les bêtes se chargent en pâturant ; en dessous, elles se vident.')}${rows}`,
    );
}
export function render() {
    const list = state.animals.map(animalCard).join('');
    return `${list || card(`<p class="empty-msg">${ico('hen', 'ico huge')}La Ménagerie est vide. Une poule sentinelle, pour commencer ?</p>`)}${shop()}`;
}
export const actions = {
    collectAnimal(el, d) {
        const n = H.collectAnimal(+d.k);
        if (n) floatAt(el, `+${n}`);
    },
    buyAnimal(el, d) {
        H.buyAnimal(d.type);
    },
};
export const view = { id: 'animals', name: 'Ménagerie', icon: 'tabAnimals', render, actions };
