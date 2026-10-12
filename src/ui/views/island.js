// Ferme | L'île : plantations tropicales (jamais à arroser) et verger des îles.
import { state } from '../../core/state.js';
import { fmt } from '../../core/format.js';
import { now } from '../../core/clock.js';
import { on } from '../../core/bus.js';
import { ITEMS } from '../../data/items.js';
import { ISLAND } from '../../data/island.js';
import { PROJECTS } from '../../data/village.js';
import * as G from '../../systems/index.js';
import { blocks, actions, anchorEl } from '../dom.js';
import { ico, art } from '../icons.js';
import { btn, bar, hint, timer, section } from '../kit.js';
import { defineView, defineLive, ui, go } from '../app.js';
import { defineSheet, closeSheet } from '../sheets.js';
import { burstAt } from '../fx.js';
import { spot } from './orchard.js';

defineLive('isle', k => G.islandPct(G.islandPlots()[+k] || {}));

const plotStage = p => (p.ready ? 2 : G.islandPct(p) < 0.5 ? 0 : 1);

function plotHtml(p, k, nextLocked) {
    const anc = `isle:${k}`;
    if (!p.open) {
        if (k !== nextLocked) return '';
        const cost = G.islandPlotCost();
        return `<button class="i-plot locked${state.money >= cost ? ' can' : ''}" data-act="buyIslandPlot" data-anchor="${anc}">
            <span class="o-lock">${art('ui', 'lock')}</span><span class="price-chip">${ico(['ui', 'coin'])}${fmt(cost)}</span></button>`;
    }
    if (!p.id)
        return `<button class="i-plot empty" data-act="open" data-sheet="plantIsland" data-k="${k}" data-anchor="${anc}">
            <span class="o-plus">${ico(['ui', 'plus'])}</span>${p.last ? `<small>${ITEMS[p.last].name}</small>` : '<small>Planter</small>'}</button>`;
    return `<button class="i-plot${p.ready ? ' ready' : ''}" data-act="islandPlot" data-k="${k}" data-anchor="${anc}">
        <span class="i-art">${art('plant', `${p.id}:${plotStage(p)}`)}</span>
        ${p.ready ? `<span class="o-tag ready">${ico(['item', p.id])}</span>` : `${bar(0, 'i-bar', `isle:${k}`)}<small>${timer(now() + G.islandLeft(p) * 1000)}</small>`}
    </button>`;
}

function closedCard() {
    const lvl = state.level < ISLAND.lvl;
    const p = PROJECTS[ISLAND.project];
    return `<div class="card island-closed">
        <div class="ic-art">${art('building', `${p.id}`)}</div>
        <div class="card-title">L’île aux Alizés</div>
        <p class="card-sub">${
            lvl
                ? `Au niveau ${ISLAND.lvl}, Tiago le passeur vous attend au hameau : son vieux bac mène à une île où poussent bananes, ananas et noix de coco.`
                : !G.chapterOpen(13)
                  ? 'Finissez d’abord le chapitre du hameau : Tiago vous attend de l’autre côté de la rivière.'
                  : 'Tiago a besoin de vous pour réparer son bac. Apportez-lui planches, poutres, clous et toile dans le volet Village, carte « L’île ».'
        }</p>
        ${lvl ? '' : btn('Voir le bac', { act: 'goFerry', kind: 'gold', wide: true, icon: ['ui', 'village'] })}
    </div>`;
}

function renderIsland(el) {
    G.ensureIsland();
    if (!G.islandOpen()) {
        blocks(el, [['closed', closedCard()]]);
        return;
    }
    const plots = G.islandPlots(),
        slots = G.slotsOf('island');
    const ready = G.islandReady(),
        empty = plots.filter(p => p.open && !p.id && p.last).length,
        fruits = G.fruitsOnGround('island');
    blocks(el, [
        [
            'top',
            `<div class="view-top"><div class="actions wrap">${btn('Récolter', { act: 'harvestIsland', kind: ready ? 'green' : '', size: 'sm', icon: ['ui', 'basket'], disabled: !ready })}${btn('Replanter', { act: 'replantIsland', size: 'sm', icon: ['ui', 'loop'], disabled: !empty })}${btn('Ramasser', { act: 'pickAllTrees', data: { z: 'island' }, kind: fruits ? 'gold' : '', size: 'sm', icon: ['item', 'banana'], disabled: !fruits })}</div></div>`,
        ],
        ['h1', section('Les plantations')],
        [
            'plots',
            `<div class="isle">${plots
                .map((p, k) =>
                    plotHtml(
                        p,
                        k,
                        plots.findIndex(x => !x.open),
                    ),
                )
                .join('')}</div>`,
        ],
        ['h2', section('Le verger des îles', `<small class="o-count small">${G.treeCountText('island')}</small>`)],
        [
            'orchard',
            `<div class="orchard island">${slots
                .map((sl, k) =>
                    spot(
                        sl,
                        k,
                        slots.findIndex(x => !x.open),
                        'island',
                    ),
                )
                .join('')}</div>`,
        ],
        [
            'hint',
            hint(
                'Sur l’île, tout est de saison et les pluies tropicales arrosent pour vous. « Replanter » remet sur chaque parcelle vide sa dernière culture. Restez appuyé sur un arbre pour sa fiche.',
            ),
        ],
    ]);
}
defineView('farm/island', renderIsland);

// ---------------- planter sur l'île ----------------
defineSheet('plantIsland', {
    title: 'Planter sur l’île',
    render(o) {
        const k = +o.k;
        return `<div class="pick-grid trees">${G.islandCrops()
            .sort((a, b) => a.reqLvl - b.reqLvl)
            .map(d => {
                const open = G.islandCropOk(d),
                    stock = state.seeds[d.id] || 0;
                const t = G.islandGrowTime(d.id) / (G.islandRate(d.id) || 1);
                return `<button class="pick-cell${open ? '' : ' locked'}" data-act="plantIsland" data-k="${k}" data-id="${d.id}" ${open ? '' : 'disabled'}>
                    <span class="pc-art">${art('plant', `${d.id}:2`)}</span><b>${d.name}</b>
                    ${
                        open
                            ? `<small>${fmt(G.sellPrice(d.id))}${ico(['ui', 'coin'])} · ${t < 90 ? `${Math.round(t)} s` : `${Math.round(t / 60)} min`}</small><span class="pc-cost">${stock > 0 ? `${stock} en stock` : `${fmt(d.cost)}${ico(['ui', 'coin'])}`}</span>`
                            : `<small class="lock-txt">${ico(['ui', 'lock'])}Niveau ${d.reqLvl}</small>`
                    }
                </button>`;
            })
            .join('')}</div>`;
    },
});

export function setupIsland() {
    actions({
        buyIslandPlot: el => G.buyIslandPlot(el),
        islandPlot: (el, d) => {
            const p = G.islandPlots()[+d.k];
            if (p && p.ready) G.harvestIsland(+d.k, el);
        },
        plantIsland: (el, d) => {
            if (G.plantIsland(+d.k, d.id, anchorEl(`isle:${d.k}`) || el)) closeSheet('plantIsland');
        },
        harvestIsland: el => G.harvestAllIsland(el),
        replantIsland: el => G.replantIsland(el),
        goFerry: () => {
            ui.sel.map = 'island';
            ui.sel.proj = ISLAND.project;
            go('village/village');
        },
    });
    on('islandFx', ({ k, delay }) => {
        const el = anchorEl(`isle:${k}`);
        if (!el) return;
        setTimeout(() => {
            const r = el.getBoundingClientRect();
            burstAt(r.left + r.width / 2, r.top + r.height / 2, 'sparkle', 5);
        }, delay || 0);
    });
}
