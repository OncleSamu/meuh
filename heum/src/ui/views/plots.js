// Heum — l'onglet Parcelles : la jauge de Contamination et la grille de culture.
import { state } from '../../core/state.js';
import * as H from '../../systems/index.js';
import { CROPS, MUTANTS, GEAR, cropDef } from '../../data/crops.js';
import { TIERS, CONT, MACHINES } from '../../data/world.js';
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

// V2 : l'événement du jour
function eventCard() {
    const e = H.todayEvent();
    if (!e || H.eventDone()) return '';
    const opts = e.opts
        .map((o, k) => {
            const eff = [
                o.cont ? `jauge ${o.cont > 0 ? '+' : ''}${o.cont}` : '',
                o.cost ? `coûte ${H.costText(o.cost)}` : '',
                o.get
                    ? `gagne ${Object.entries(o.get)
                          .map(
                              ([id, n]) =>
                                  `${n} ${id === 'food' ? 'vivres' : id === 'wreck' ? 'recoins à fouiller' : id === 'xp' ? 'XP' : H.nameOf(id).toLowerCase()}`,
                          )
                          .join(', ')}`
                    : '',
            ]
                .filter(Boolean)
                .join(' · ');
            return `<button class="ev-opt" data-act="eventPick" data-k="${k}"${H.optOk(o) ? '' : ' disabled'}><b>${o.label}</b><small>${eff || 'rien ne change'}</small></button>`;
        })
        .join('');
    return card(
        `${head(`Aujourd’hui : ${e.name}`, 'storm', `${e.text} Choisissez quand vous voulez ; sans réponse, il ne se passe rien.`)}<div class="ev-opts">${opts}</div>`,
        'event',
    );
}

function plotTile(p, i) {
    if (!p.open) {
        const first = state.plots.findIndex(x => !x.open) === i;
        return `<button class="plot closed" data-act="plotTap" data-i="${i}"${first ? '' : ' disabled'}>${ico(first ? 'shovel' : 'lock')}${first ? `<small>Défricher</small>${money(H.nextPlotCost())}` : ''}</button>`;
    }
    const g = p.gear ? `<span class="gear-tag" style="--tc:${H.plotTier(p).col}">${ico(p.gear)}${Math.round(H.plotCont(p))} %</span>` : '';
    if (p.rebel)
        return `<button class="plot rebel" data-act="plotTap" data-i="${i}">${ico('rebel', 'ico crop ready')}<small>Arracher le Rebelle</small>${g}</button>`;
    if (!p.crop) return `<button class="plot empty" data-act="plotTap" data-i="${i}"><span class="plus">+</span><small>Semer</small>${g}</button>`;
    const c = cropDef(p.crop);
    if (H.cropReady(p))
        return `<button class="plot ready" data-act="plotTap" data-i="${i}">${ico(p.crop, 'ico crop ready')}<small>Récolter</small>${g}</button>`;
    const left = H.cropLeft(p),
        f = 1 - left / c.t;
    return `<button class="plot growing" data-act="plotTap" data-i="${i}"><span class="sprout" style="--g:${0.35 + 0.5 * f}">${ico(p.crop, 'ico crop')}</span>${timer(left)}${prog(left, c.t)}${g}</button>`;
}

function stockRow() {
    const ids = [...Object.keys(CROPS), ...Object.keys(MUTANTS), 'waste', 'veil', 'conc'].filter(id => H.have(id));
    if (!ids.length) return '';
    return card(
        `<h3>Récoltes en stock</h3><div class="chips">${ids.map(id => `<span class="chip${H.isMutant(id) ? ' mut' : ''}">${ico(id)}<b>${H.have(id)}</b></span>`).join('')}</div>`,
    );
}

export function render() {
    return `${eventCard()}${gaugeCard()}${card(`<div class="grid">${state.plots.map(plotTile).join('')}</div>`, 'field')}${stockRow()}`;
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
    const p = state.plots[i];
    const stable = H.stableOpen()
        .map(id => {
            const c = cropDef(id);
            return `<div class="pick stable">${ico(id, 'ico big')}<div><b>${c.name} <span class="tag">graine stable</span></b><small>${dur(c.t)} · toujours mutant · ${c.yield} × ${c.sell} pièces</small></div>${btn(`${c.seed}`, 'plant', { i, id }, { icon: 'coin', disabled: state.money < c.seed })}</div>`;
        })
        .join('');
    const gearOn = state.level >= MACHINES.bench.lvl;
    const gear = gearOn
        ? `<h4>Équipement de la parcelle</h4><p class="hint">Jauge de la ferme ${Math.round(state.cont)} % → cette parcelle ${Math.round(H.plotCont(p))} % (${H.plotTier(p).name}).</p><div class="row">${Object.entries(
              GEAR,
          )
              .map(([g, d]) =>
                  p.gear === g
                      ? btn(`Retirer le ${d.name.toLowerCase()}`, 'gear', { i, g: '' }, { icon: g, size: 'sm' })
                      : btn(`${d.name} (${d.mod > 0 ? '+' : ''}${d.mod}) · ${H.have(g)}`, 'gear', { i, g }, { icon: g, size: 'sm', disabled: !H.have(g) }),
              )
              .join('')}</div><p class="hint">${Object.values(GEAR)
              .map(d => `${d.name} : ${d.text}`)
              .join(' ')}</p>`
        : '';
    openSheet('Que semer ?', `${gear}<p class="hint">Le palier de la parcelle au moment de la récolte décide de ce qui pousse.</p>${stable}${rows}`);
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
    gear(el, d) {
        if (H.setGear(+d.i, d.g || null)) cropSheet(+d.i);
    },
    eventPick(el, d) {
        if (H.chooseEvent(+d.k)) floatAt(el, 'C’est réglé', 'gold');
    },
    fert(el) {
        if (H.spreadFertilizer()) floatAt(el, `+${CONT.fertilizer} %`, 'toxic');
    },
};
export const view = { id: 'plots', name: 'Parcelles', icon: 'tabPlots', render, actions };
