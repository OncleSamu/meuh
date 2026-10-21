// Renommer (1.2) : un pré, une variété ou une race. Une seule fenêtre, ouverte avec { kind, id }.
import { state } from '../../core/state.js';
import * as G from '../../systems/index.js';
import { actions, esc } from '../dom.js';
import { btn, empty } from '../kit.js';
import { defineSheet, closeSheet } from '../sheets.js';

const WHAT = {
    pasture: { title: 'Renommer le pré', get: id => state.pastures[+id], name: o => o.name, set: (id, n) => G.renamePasture(+id, n) },
    variety: {
        title: 'Renommer la variété',
        get: id => state.genetics && state.genetics.vars[id],
        name: o => G.varName(o),
        set: (id, n) => G.renameVariety(id, n),
    },
    lot: { title: 'Nommer la cuvée', get: id => G.findLot(id), name: o => o.name || '', set: (id, n) => G.renameLot(id, n) },
    beer: { title: 'Renommer la bière', get: id => G.beerOf(id), name: o => o.name, set: (id, n) => G.renameBeer(id, n) },
    stud: { title: 'Nom d’élevage', get: () => state.haras && state.haras.stud, name: o => o.name, set: (id, n) => G.setStudName(n) },
    race: { title: 'Renommer la race', get: id => state.genetics && state.genetics.races[id], name: o => o.name, set: (id, n) => G.renameRace(id, n) },
};

defineSheet('rename', {
    title: o => (WHAT[o.kind] || WHAT.pasture).title,
    render(o) {
        const W = WHAT[o.kind],
            x = W && W.get(o.id);
        if (!x) return empty('Introuvable.');
        return `<p class="card-sub">Un nouveau nom, 22 lettres au plus. Il apparaîtra partout dans la ferme.</p>
            <div class="rename big"><input type="text" maxlength="22" id="rename-any" value="${esc(W.name(x))}" aria-label="Nouveau nom">${btn('Renommer', { act: 'renameAny', data: { kind: o.kind, id: o.id }, kind: 'gold' })}</div>`;
    },
    focus: '#rename-any',
});

// un petit bouton crayon, à poser à côté d'un nom
export const renameBtn = (kind, id, label = 'Renommer') =>
    `<button class="rename-btn" data-act="open" data-sheet="rename" data-kind="${kind}" data-id="${id}" aria-label="${label}" title="${label}"><svg viewBox="0 0 24 24"><path d="M4 20 L5 15 L16 4 L20 8 L9 19Z" fill="#ffd23f" stroke="#3a2618" stroke-width="1.8" stroke-linejoin="round"/><path d="M14 6 L18 10" stroke="#3a2618" stroke-width="1.6"/><path d="M4 20 L5 15 L9 19Z" fill="#f5deb3" stroke="#3a2618" stroke-width="1.4" stroke-linejoin="round"/></svg></button>`;

export function setupRename() {
    actions({
        renameAny: (el, d) => {
            const input = document.getElementById('rename-any');
            const W = WHAT[d.kind];
            if (W && W.set(d.id, input ? input.value : '')) closeSheet('rename');
        },
    });
}
