// Heum — l'onglet Parcelles : la jauge de Contamination et la grille de culture.
import { state } from '../../core/state.js';
import * as H from '../../systems/index.js';
import { CROPS, MUTANTS } from '../../data/crops.js';
import { TIERS, CONT } from '../../data/world.js';
import { ico, btn, card, head, timer, prog, money } from '../kit.js';
import { dur } from '../../core/format.js';
import { openSheet, closeSheet } from '../sheet.js';
import { floatItems, floatAt } from '../fx.js';

export function gaugeBar(big = false) {
    const c = state.cont;
    const segs = TIERS.map((t, k) => {
        const to = (TIERS[k + 1] || { from: 100 }).from;
        return `<i style="left:${t.from}%;width:${to - t.from}%;background:${t.col}"></i>`;
    }).join('');
    return `<div class="gauge ${big ? 'big' : ''}">${segs}<b class="mark" style="left:${c}%"></b></div>`;
}

function gaugeCard() {
    const t = H.tier(),
        warn = H.sentinel();
    const fert = state.level >= CONT.mutLvl;
    return card(
        `${head(`Contamination : <span class="tier" style="--tc:${t.col}">${t.name}</span>`, 'gauge', `${Math.round(state.cont)} % · ${t.text}`)}
        ${gaugeBar(true)}
        <div class="gauge-legend">${TIERS.map(x => `<span>${x.name}<small>${x.from} %</small></span>`).join('')}</div>
        ${warn ? `<p class="note warn">${ico('hen')} La poule s’agite : la jauge approche du palier <b>${warn.name}</b>.</p>` : ''}
        <div class="row">${
            fert
                ? btn(
                      `Engrais toxique (+${CONT.fertilizer}) · ${H.have('fertilizer')}`,
                      'fert',
                      {},
                      { icon: 'fertilizer', kind: 'toxic', disabled: !H.have('fertilizer') || state.cont >= 100 },
                  )
                : `<p class="note">${ico('lock')} La mutation s’ouvre au niveau ${CONT.mutLvl} : l’engrais toxique fait monter la jauge.</p>`
        }</div>
        <p class="hint">La jauge redescend seule d’un point toutes les 2 minutes${state.level >= 3 ? ' ; l’Épurateur (Recyclage) la fait chuter' : ''}.</p>`,
        'gauge-card',
    );
}

function plotTile(p, i) {
    if (!p.open) {
        const first = state.plots.findIndex(x => !x.open) === i;
        return `<button class="plot closed" data-act="plotTap" data-i="${i}"${first ? '' : ' disabled'}>${ico(first ? 'shovel' : 'lock')}${first ? `<small>Défricher</small>${money(H.nextPlotCost())}` : ''}</button>`;
    }
    if (p.rebel)
        return `<button class="plot rebel" data-act="plotTap" data-i="${i}">${ico('rebel', 'ico crop ready')}<small>Arracher le Rebelle</small></button>`;
    if (!p.crop) return `<button class="plot empty" data-act="plotTap" data-i="${i}"><span class="plus">+</span><small>Semer</small></button>`;
    const c = CROPS[p.crop];
    if (H.cropReady(p)) return `<button class="plot ready" data-act="plotTap" data-i="${i}">${ico(p.crop, 'ico crop ready')}<small>Récolter</small></button>`;
    const left = H.cropLeft(p),
        f = 1 - left / c.t;
    return `<button class="plot growing" data-act="plotTap" data-i="${i}"><span class="sprout" style="--g:${0.35 + 0.5 * f}">${ico(p.crop, 'ico crop')}</span>${timer(left)}${prog(left, c.t)}</button>`;
}

function stockRow() {
    const ids = [...Object.keys(CROPS), ...Object.keys(MUTANTS), 'waste'].filter(id => H.have(id));
    if (!ids.length) return '';
    return card(
        `<h3>Récoltes en stock</h3><div class="chips">${ids.map(id => `<span class="chip${H.isMutant(id) ? ' mut' : ''}">${ico(id)}<b>${H.have(id)}</b></span>`).join('')}</div>`,
    );
}

export function render() {
    return `${gaugeCard()}${card(`<div class="grid">${state.plots.map(plotTile).join('')}</div>`, 'field')}${stockRow()}`;
}

function cropSheet(i) {
    const rows = Object.entries(CROPS)
        .map(([id, c]) => {
            const ok = state.level >= c.lvl;
            const mut = c.mut ? `<small class="mut">Mutant : ${MUTANTS[c.mut].name} (${MUTANTS[c.mut].sell} pièces)</small>` : '';
            return `<div class="pick ${ok ? '' : 'off'}">${ico(id, 'ico big')}<div><b>${c.name}</b><small>${dur(c.t)} · ${c.yield} × ${c.sell} pièces</small>${mut}</div>${
                ok
                    ? btn(`${c.seed}`, 'plant', { i, id }, { icon: 'coin', disabled: state.money < c.seed })
                    : `<span class="lvl">${ico('lock')}niv. ${c.lvl}</span>`
            }</div>`;
        })
        .join('');
    openSheet('Que semer ?', `<p class="hint">Le palier au moment de la récolte décide de ce qui pousse.</p>${rows}`);
}

export const actions = {
    plotTap(el, d) {
        const i = +d.i,
            p = state.plots[i];
        if (!p.open) return H.buyPlot();
        if (p.rebel) return H.uproot(i);
        if (!p.crop) return cropSheet(i);
        if (H.cropReady(p)) {
            const r = H.harvest(i);
            if (r) floatItems(el, r.got);
            if (r && r.mutant) floatAt(el, 'Mutation !', 'big');
            return;
        }
    },
    plant(el, d) {
        if (H.plant(+d.i, d.id)) closeSheet();
    },
    fert(el) {
        if (H.spreadFertilizer()) floatAt(el, `+${CONT.fertilizer} %`, 'toxic');
    },
};
export const view = { id: 'plots', name: 'Parcelles', icon: 'tabPlots', render, actions };
