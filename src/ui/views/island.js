// Ferme | L'île : plantations tropicales (jamais à arroser) et verger des îles.
import { state } from '../../core/state.js';
import { fmt } from '../../core/format.js';
import { on } from '../../core/bus.js';
import { ITEMS } from '../../data/items.js';
import { ISLAND, SCHOONER } from '../../data/island.js';
import { PROJECTS } from '../../data/village.js';
import * as G from '../../systems/index.js';
import { blocks, actions, anchorEl, esc } from '../dom.js';
import { genWrap } from '../genlook.js';
import { ico, art } from '../icons.js';
import { btn, bar, section, tip15, timer } from '../kit.js';
import { defineLive, ui, go } from '../app.js';
import { defineSheet, closeSheet } from '../sheets.js';
import { burstAt } from '../fx.js';
import { spot } from './orchard.js';
import { askBuy } from '../sheets/askbuy.js';
import { apiaryHtml } from './apiary.js';

defineLive('isle', k => G.islandPct(G.islandPlots()[+k] || {}));

const plotStage = p => (p.ready ? 2 : G.islandPct(p) < 0.5 ? 0 : 1);

function plotHtml(p, k, nextLocked) {
    const anc = `isle:${k}`;
    if (!p.open) {
        if (k !== nextLocked) return '';
        const cost = G.islandPlotCost();
        return `<button class="plot locked next${state.money >= cost ? ' can' : ''}" data-act="buyIslandPlot" data-anchor="${anc}">
            <div class="lock-ico">${art('ui', 'lock')}</div><div class="price-chip">${ico(['ui', 'coin'])}${fmt(cost)}</div></button>`;
    }
    if (!p.id)
        return `<button class="plot plowed watered i-empty" data-act="open" data-sheet="plantIsland" data-k="${k}" data-anchor="${anc}">
            <span class="o-plus">${ico(['ui', 'plus'])}</span>${p.last ? `<small>${ITEMS[p.last].name}</small>` : ''}</button>`;
    return `<button class="plot plowed watered planted${p.ready ? ' ready' : ''}" data-act="islandPlot" data-k="${k}" data-anchor="${anc}">
        <div class="spr-wrap">${p.v && state.genetics && state.genetics.vars[p.v] ? genWrap(art('plant', `${p.id}:${plotStage(p)}`), state.genetics.vars[p.v].g) : art('plant', `${p.id}:${plotStage(p)}`)}</div>
        ${p.ready ? '' : bar(0, 'pbar', `isle:${k}`)}
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
                ? `Au niveau ${ISLAND.lvl}, Tiago le passeur vous attend au port : son vieux bac mène à une île où poussent bananes, ananas et noix de coco.`
                : !G.chapterOpen(13)
                  ? `Finissez d’abord le chapitre ${G.chapterNum(G.chapterAfter(13))} (l’abbaye) : Tiago vous attend sur le quai.`
                  : 'Tiago a besoin de vous pour réparer son bac. Apportez-lui planches, poutres, clous et toile dans le volet Village, carte « L’île ».'
        }</p>
        ${lvl ? '' : btn('Voir le bac', { act: 'goFerry', kind: 'gold', wide: true, icon: ['ui', 'village'] })}
    </div>`;
}

function lagoonCard() {
    const ready = G.lagoonReady();
    const until = state.island && state.island.lagoonAt;
    return `<div class="card">
        <div class="card-head">${ico(['ui', 'lagoon'], 'ico big')}<div class="card-main">
            <div class="card-title">Lagon aux perles</div>
            <div class="card-sub">${ready ? 'Marée basse : plongez ramasser des trésors tropicaux (et parfois une géode de cristal).' : `La marée remonte · prochaine plongée dans ${timer(until, 'b')}`}</div>
        </div>
        ${ready ? btn('Plonger', { act: 'harvestLagoon', kind: 'green', size: 'sm', icon: ['ui', 'lagoon'] }) : ''}</div>
    </div>`;
}

function schoonerCard() {
    const sc = G.schoonerState();
    const loaded = G.schoonerLoads();
    const val = G.schoonerValue();
    if (sc.out) {
        const back = G.schoonerBack();
        return `<div class="card">
            <div class="card-head">${ico(['ui', 'schooner'], 'ico big')}<div class="card-main">
                <div class="card-title">Goélette des îles${back ? ' · de retour !' : ' · en mer'}</div>
                <div class="card-sub">${back ? `Cargaison vendue pour ${fmt(sc.out.gold)} pièces + 1 épice rare + 1 Renom !` : `Retour dans ${timer(sc.out.back, 'b')} · gain prévu : ${fmt(sc.out.gold)} pièces`}</div>
            </div>
            ${back ? btn('Décharger', { act: 'schoonerClaim', kind: 'gold', size: 'sm', icon: ['ui', 'coin'] }) : ''}</div>
        </div>`;
    }
    const items = Object.entries(sc.load);
    const chips = items.length
        ? `<div class="chips-row" style="margin:6px 0">${items
              .map(
                  ([id, n]) =>
                      `<button class="pick-chip on" data-act="schoonerRem" data-id="${id}" title="Retirer">${ico(['item', id])}×${n} ×</button>`,
              )
              .join('')}</div>`
        : '';
    return `<div class="card">
        <div class="card-head">${ico(['ui', 'schooner'], 'ico big')}<div class="card-main">
            <div class="card-title">Goélette des îles · ${loaded} / ${SCHOONER.cap}</div>
            <div class="card-sub">Exporte vos produits tropicaux & poissons à ×${SCHOONER.mult} (min. ${SCHOONER.minLoad} unités) · 3 h · +épices rares & Renom</div>
        </div></div>
        ${chips}
        <div class="actions wrap" style="margin-top:6px">
            ${btn('Charger', { act: 'open', data: { sheet: 'schoonerLoad' }, size: 'sm', icon: ['ui', 'plus'], disabled: loaded >= SCHOONER.cap })}
            ${btn(loaded >= SCHOONER.minLoad ? `Expédier (${fmt(val)} p.)` : `Min. ${SCHOONER.minLoad} unités`, { act: 'schoonerSend', kind: loaded >= SCHOONER.minLoad ? 'gold' : '', size: 'sm', icon: ['ui', 'schooner'], disabled: loaded < SCHOONER.minLoad })}
        </div>
    </div>`;
}

export function renderIsland(el) {
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
            `<div class="field isle"><div class="plots">${plots
                .map((p, k) =>
                    plotHtml(
                        p,
                        k,
                        plots.findIndex(x => !x.open),
                    ),
                )
                .join('')}</div></div>`,
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
        ['apiary', apiaryHtml('island')],
        ['lagoon', lagoonCard()],
        ['schooner', schoonerCard()],
        [
            'hint',
            tip15(
                'Sur l’île, tout est de saison et les pluies tropicales arrosent pour vous. Plongez au lagon à marée basse et chargez la goélette pour exporter vos produits tropicaux à ×2,3 !',
            ),
        ],
    ]);
}

// ---------------- charger la goélette ----------------
defineSheet('schoonerLoad', {
    title: `${ico(['ui', 'schooner'])}Charger la goélette`,
    render() {
        const room = SCHOONER.cap - G.schoonerLoads();
        if (room <= 0) return '<p class="card-sub center">La cale est pleine ! Vous pouvez expédier la goélette.</p>';
        const goods = G.schoonerGoods().slice(0, 48);
        if (!goods.length) return '<p class="card-sub center">Aucun produit disponible dans votre grange.</p>';
        return `<p class="card-sub">Place restante : <b>${room} / ${SCHOONER.cap}</b>. Les produits tropicaux et poissons de mer valent ×${SCHOONER.mult}.</p>
            <div class="rneeds">${goods
                .map(id => {
                    const have = state.inventory[id] || 0;
                    const mult = G.schoonerMult(id);
                    const unit = Math.round((ITEMS[id].sell || 0) * mult * G.priceMult());
                    const maxAdd = Math.min(room, have);
                    return `<div class="rneed"><span class="rneed-art">${art('item', id)}</span><span class="row-main"><b>${ITEMS[id].name} <small>×${fmt(have)}</small></b><small>${fmt(unit)} p./u. (×${mult})</small></span><span class="cut-btns">${btn('+1', { act: 'schoonerAdd', data: { id, n: 1 }, size: 'sm' })}${maxAdd > 1 ? btn(`+${Math.min(5, maxAdd)}`, { act: 'schoonerAdd', data: { id, n: Math.min(5, maxAdd) }, kind: 'gold', size: 'sm' }) : ''}</span></div>`;
                })
                .join('')}</div>`;
    },
});

// ---------------- planter sur l'île ----------------
defineSheet('plantIsland', {
    title: 'Planter sur l’île',
    render(o) {
        const k = +o.k;
        const vars = state.genetics
            ? G.varieties().filter(v => ITEMS[v.base].island && !ITEMS[v.base].oasis && !ITEMS[v.base].nord && !ITEMS[v.base].asie && (state.genetics.seeds[v.id] || 0) > 0)
            : [];
        const varHtml = vars.length
            ? `<h3 class="section-title"><span>Mes variétés</span></h3><div class="pick-grid trees">${vars
                  .map(
                      v =>
                          `<button class="pick-cell var${ui.sel.isleVar === v.id ? ' on' : ''}" data-act="plantIslandVar" data-k="${k}" data-id="${v.id}"><span class="pc-art">${genWrap(art('plant', `${v.base}:2`), v.g)}</span><b>${esc(G.varName(v))}</b><span class="pc-cost">${state.genetics.seeds[v.id]} graines</span></button>`,
                  )
                  .join('')}</div><h3 class="section-title"><span>Cultures</span></h3>`
            : '';
        return `${varHtml}<div class="pick-grid trees">${G.islandCrops()
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
        buyIslandPlot: el =>
            askBuy(
                {
                    title: 'Agrandir les parcelles de l’île',
                    icon: ['item', 'pineapple'],
                    text: 'Une parcelle de plus sur l’île.',
                    cost: G.islandPlotCost(),
                    run: at => G.buyIslandPlot(at),
                },
                el,
            ),
        islandPlot: (el, d) => {
            const p = G.islandPlots()[+d.k];
            if (p && p.ready) G.harvestIsland(+d.k, el);
        },
        plantIsland: (el, d) => {
            if (G.plantIsland(+d.k, d.id, anchorEl(`isle:${d.k}`) || el)) closeSheet('plantIsland');
        },
        plantIslandVar: (el, d) => {
            if (G.plantIslandVar(+d.k, d.id, anchorEl(`isle:${d.k}`) || el)) closeSheet('plantIsland');
        },
        harvestIsland: el => G.harvestAllIsland(el),
        replantIsland: el => G.replantIsland(el),
        harvestLagoon: el => G.harvestLagoon(el),
        schoonerAdd: (el, d) => G.schoonerAdd(d.id, +d.n || 1),
        schoonerRem: (el, d) => G.schoonerRemove(d.id),
        schoonerSend: el => G.schoonerSend(el),
        schoonerClaim: el => G.schoonerClaim(el),
        goFerry: () => {
            ui.sel.map = 'island';
            ui.sel.proj = ISLAND.project;
            go('village/village#story');
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
