// Confirmer un gros achat (1.2.13) : agrandir le champ, la serre, le verger, l'île, un pré, une étagère, une machine.
// askBuy() ouvre la fenêtre ; « Acheter » lance l'achat d'origine, sur l'élément touché au départ (pour les effets).
import { state } from '../../core/state.js';
import { fmt } from '../../core/format.js';
import { ITEMS } from '../../data/items.js';
import { actions } from '../dom.js';
import { ico, art } from '../icons.js';
import { btn } from '../kit.js';
import { defineSheet, openSheet, closeSheet } from '../sheets.js';

let pending = null;

// vrai si on demande confirmation (réglage « Confirmer les gros achats », actif par défaut)
export const confirmOn = () => state.settings.confirmBuy !== false;

// o : { title, icon: [sorte, id], text, cost, mats: { id: n }, run: at => … } ; at = l'élément touché
export function askBuy(o, at) {
    if (!confirmOn()) return o.run(at);
    pending = { run: o.run, at };
    openSheet('askBuy', { title: o.title, icon: o.icon, text: o.text, cost: o.cost, mats: o.mats || null });
    return false;
}

defineSheet('askBuy', {
    cls: 'askbuy-sheet',
    title: o => o.title || 'Confirmer l’achat',
    render(o) {
        const left = state.money - (o.cost || 0);
        const mats = o.mats
            ? Object.entries(o.mats)
                  .map(
                      ([id, n]) =>
                          `<span class="mat${(state.inventory[id] || 0) >= n ? '' : ' short'}">${art('item', id)}${n} ${ITEMS[id].name.toLowerCase()}</span>`,
                  )
                  .join('')
            : '';
        return `<div class="askbuy">
            <div class="askbuy-art">${art(o.icon[0], o.icon[1])}</div>
            <p>${o.text}</p>
            <div class="askbuy-price">${fmt(o.cost)}${ico(['ui', 'coin'])}${mats}</div>
            <p class="card-sub center">${left >= 0 ? `Il vous restera ${fmt(left)} pièces.` : `Il manque ${fmt(-left)} pièces.`}</p>
            <div class="askbuy-btns">${btn('Annuler', { act: 'askBuyNo' })}${btn('Acheter', { act: 'askBuyOk', kind: 'green', disabled: left < 0 })}</div>
            <p class="card-sub center">Cette question se coupe dans les Réglages.</p>
        </div>`;
    },
});

export function setupAskBuy() {
    actions({
        askBuyOk: () => {
            const p = pending;
            pending = null;
            closeSheet('askBuy');
            if (p) p.run(p.at && p.at.isConnected ? p.at : document.querySelector('#hud') || document.body);
        },
        askBuyNo: () => {
            pending = null;
            closeSheet('askBuy');
        },
    });
}
