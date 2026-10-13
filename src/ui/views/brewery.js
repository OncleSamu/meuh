// Atelier | Brasserie (1.6) : composer sa bière (malt, houblon, 1 à 3 ingrédients), la brasser, la nommer,
// la vendre, la faire vieillir en fût, et remplir le livre des bières.
import { state, lvOk } from '../../core/state.js';
import { now } from '../../core/clock.js';
import { fmt, formatDuration } from '../../core/format.js';
import { ITEMS } from '../../data/items.js';
import { ABBEY, MALTS, MALT_IDS, HOP_DOSES, NOTES, NOTE_COL, BARRELS, CELLAR, BEER_BOOK } from '../../data/abbey.js';
import * as G from '../../systems/index.js';
import { blocks, actions } from '../dom.js';
import { ico, art } from '../icons.js';
import { btn, bar, timer, section, empty } from '../kit.js';
import { defineView, defineLive, ui, go } from '../app.js';
import { defineSheet, openSheet, closeSheet, sheetOpts } from '../sheets.js';
import { renameBtn } from '../sheets/rename.js';
import { beerSvg } from '../../art/abbey.js';

const COIN = () => ico(['ui', 'coin']);
const stars = n => `<span class="brew-stars">${[0, 1, 2].map(k => `<i class="${k < n ? 'on' : ''}">★</i>`).join('')}</span>`;
const bottle = b => `<i class="ico brew-bottle">${beerSvg(b)}</i>`;
const ingIcons = ings => ings.map(([id, d]) => `<span class="brew-ing">${ico(['item', id])}${d > 1 ? `<b>×${d}</b>` : ''}</span>`).join('');

// ---------------- l'abbaye fermée ----------------
function closedCard() {
    const lvl = state.level < ABBEY.lvl;
    return `<div class="card island-closed">
        <div class="ic-art">${art('building', 'brewhall')}</div>
        <div class="card-title">La brasserie de l’abbaye</div>
        <p class="card-sub">${
            lvl
                ? `Au niveau ${ABBEY.lvl}, Frère Hugues et Agnès la malteuse rallument la brasserie de l’abbaye : vous y inventerez vos propres bières.`
                : 'Rénovez la malterie et la salle de brassage de l’abbaye (volet Village, carte « L’abbaye »).'
        }</p>
        ${lvl ? '' : btn('Voir l’abbaye', { act: 'goAbbey', kind: 'gold', wide: true, icon: ['ui', 'village'] })}
    </div>`;
}

// ---------------- les cuves ----------------
defineLive('vat', i => {
    const v = state.brew && state.brew.vats[i];
    if (!v) return 0;
    const b = state.brew.beers[v.bid];
    const tot = G.brewTime(b.ings) * 1000;
    return 1 - Math.max(0, v.until - now()) / tot;
});
function vatsHtml() {
    const B = state.brew;
    return `<div class="brew-vats">${B.vats
        .map((v, i) => {
            if (!v) return `<div class="brew-vat empty">${ico(['ui', 'vat'])}<span>Cuve libre</span></div>`;
            const b = B.beers[v.bid];
            const ready = G.vatReady(v);
            return `<div class="brew-vat${ready ? ' ready' : ''}" data-anchor="vat:${i}">${bottle(b)}<div class="bv-main"><b>${b.name}</b>
                ${ready ? `<small>${v.n} bouteilles prêtes</small>` : `${bar(0, 'thin', `vat:${i}`)}<small>${timer(v.until)}</small>`}</div>
                ${ready ? btn('Mettre en bouteille', { act: 'collectVat', data: { i }, kind: 'green', size: 'sm' }) : ''}</div>`;
        })
        .join('')}</div>`;
}

// ---------------- composer ----------------
function noteBars(p) {
    const max = Math.max(6, ...p);
    return `<div class="brew-notes">${NOTES.map(
        (n, k) => `<div class="bn"><span>${n}</span><i><b style="width:${Math.round((p[k] / max) * 100)}%;background:${NOTE_COL[k]}"></b></i></div>`,
    ).join('')}</div>`;
}
function composerHtml() {
    const B = state.brew,
        d = B.draft,
        pv = G.brewPreview();
    const malts = MALT_IDS.map(
        m =>
            `<button class="brew-malt${d.malt === m ? ' on' : ''}" data-act="brewMalt" data-m="${m}"><i class="swatch" style="background:${MALTS[m].color}"></i><b>${MALTS[m].name}</b><small>${ico(['item', m])}${state.inventory[m] || 0}</small></button>`,
    ).join('');
    const hops = HOP_DOSES.map(
        (h, k) =>
            `<button class="${d.hop === k + 1 ? 'on' : ''}" data-act="brewHop" data-n="${k + 1}"><span>${h}</span><small>${ico(['item', 'hop'])}${(k + 1) * ABBEY.hopPerDose}</small></button>`,
    ).join('');
    const slots = Array.from({ length: G.brewSlots() }, (_, s) => {
        if (d.ings.length > G.brewSlots()) d.ings.length = G.brewSlots();
        const it = d.ings[s];
        if (!it) return `<button class="brew-slot empty" data-act="brewPick" data-s="${s}"><b>+</b><span>Ingrédient</span></button>`;
        const [id, dose] = it;
        return `<div class="brew-slot"><button class="bs-pick" data-act="brewPick" data-s="${s}">${ico(['item', id], 'ico big')}<span>${ITEMS[id].name}</span><small>${state.inventory[id] || 0} en stock</small></button>
            <div class="stepper">${btn('', { act: 'brewDose', data: { s, d: -1 }, icon: ['ui', 'minus'], disabled: dose <= 1, title: 'Moins', size: 'sm' })}<b>×${dose}</b>${btn('', { act: 'brewDose', data: { s, d: 1 }, icon: ['ui', 'plus'], disabled: dose >= 3, title: 'Plus', size: 'sm' })}</div>
            ${btn('', { act: 'brewDrop', data: { s }, icon: ['ui', 'cross'], kind: 'ghost', size: 'sm', title: 'Retirer' })}</div>`;
    }).join('');
    const more =
        G.brewSlots() < 3
            ? `<p class="hint">${G.brewSlots() === 1 ? 'Deux ingrédients après les cuves de fermentation.' : 'Trois ingrédients après l’étiqueterie.'}</p>`
            : '';
    const beerLike = { malt: d.malt, ings: pv.ings, stars: pv.harmony.stars };
    const cost = Object.entries(pv.cost)
        .map(([id, n]) => `<span class="${(state.inventory[id] || 0) >= n ? 'ok' : 'short'}">${ico(['item', id])}${state.inventory[id] || 0}/${n}</span>`)
        .join('');
    const preview = pv.ings.length
        ? `<div class="brew-preview"><div class="bp-art">${beerSvg(beerLike)}</div><div class="bp-main">
            <div class="bp-name">${pv.name} ${pv.known ? '<span class="chip">déjà brassée</span>' : '<span class="chip ok">nouvelle !</span>'}</div>
            <div class="bp-stars">Accord ${stars(pv.harmony.stars)}</div>
            <ul class="bp-why">${pv.harmony.reasons.map(r => `<li>${r}</li>`).join('')}</ul>
            ${noteBars(pv.profile)}
            <div class="cost">${cost}</div>
            <div class="card-sub">${ABBEY.bottles} bouteilles à ${fmt(pv.value)}${COIN()} · ${formatDuration(pv.time)}</div></div></div>`
        : '<p class="hint">Choisissez un ingrédient : chaque fruit et chaque légume de la ferme donne une bière différente.</p>';
    const can = pv.ings.length && !pv.miss.length && pv.freeVat >= 0;
    return `<div class="card brew-compose">
        <div class="bc-row"><span class="bc-label">Malt</span><div class="brew-malts">${malts}</div></div>
        <div class="bc-row"><span class="bc-label">Houblon</span><div class="seg n3 brew-hops">${hops}</div></div>
        <div class="bc-row"><span class="bc-label">Ingrédients</span><div class="brew-slots">${slots}</div></div>${more}
        ${preview}
        ${btn(pv.freeVat < 0 ? 'Toutes les cuves sont pleines' : 'Brasser', { act: 'brew', kind: 'green', wide: true, size: 'lg', disabled: !can, icon: ['ui', 'beer'] })}</div>`;
}

// ---------------- mes bières ----------------
function beersHtml() {
    const list = G.myBeers();
    if (!list.length) return section('Mes bières') + empty('Vos bières apparaîtront ici, avec leur nom.');
    return (
        section('Mes bières', `<small>${list.length}</small>`) +
        `<div class="list">${list
            .map(b => {
                const n = G.beerStock(b.id);
                const sub = `${stars(b.stars)} ${ingIcons(b.ings)}${b.aged ? ` <span class="chip">${BARRELS[b.aged.k].name.toLowerCase()}</span>` : ''}`;
                const side =
                    `<b class="bb-n">×${n}</b><small>${fmt(b.value)}${COIN()}</small>` +
                    (n
                        ? btn('Vendre', { act: 'sellBeer', data: { id: b.id, n: 1 }, size: 'sm' }) +
                          (n > 1 ? btn(`Tout · ${fmt(b.value * n)}`, { act: 'sellBeer', data: { id: b.id, n }, kind: 'gold', size: 'sm' }) : '')
                        : '');
                return `<div class="card brew-beer${n ? '' : ' none'}"><div class="card-art">${beerSvg(b)}</div><div class="card-main"><div class="card-title">${b.name} ${renameBtn('beer', b.id, 'Renommer la bière')}</div><div class="card-sub">${sub}</div></div><div class="card-side">${side}</div></div>`;
            })
            .join('')}</div>`
    );
}

// ---------------- le cellier ----------------
defineLive('barrel', i => {
    const b = state.brew && state.brew.barrels[i];
    if (!b || G.barrelDone(b)) return 1;
    const step = CELLAR.steps[b.stage] * 1000;
    return 1 - Math.max(0, b.next - now()) / step;
});
function cellarHtml() {
    if (!G.cellarOpen()) return '';
    const B = state.brew;
    return (
        section('Le cellier à fûts') +
        `<div class="brew-barrels">${B.barrels
            .map((b, i) => {
                if (!b)
                    return `<button class="brew-barrel empty" data-act="open" data-sheet="barrelPut" data-slot="${i}">${ico(['ui', 'barrel'])}<span>Mettre en fût</span></button>`;
                const beer = B.beers[b.bid];
                const done = G.barrelDone(b);
                return `<div class="brew-barrel${b.turned ? ' bad' : ''}${done ? ' done' : ''}">${ico(['ui', 'barrel'], 'ico big')}<div class="bb-main"><b>${beer.name}</b><small>×${b.n} · ${BARRELS[b.k].name}</small>
                    <small>${b.turned ? 'Elle a tourné' : CELLAR.stepNames[b.stage]}${done ? '' : ` · étape suivante ${timer(b.next)}`}</small>${done ? '' : bar(0, 'thin', `barrel:${i}`)}</div>
                    <div class="bb-side"><small>${fmt(G.barrelValue(b))}${COIN()}</small>${btn(b.stage ? 'Sortir' : 'Reprendre', { act: 'takeBarrel', data: { i }, kind: done ? 'green' : '', size: 'sm' })}</div></div>`;
            })
            .join(
                '',
            )}</div><p class="hint">Chaque étape fait monter la valeur (×${CELLAR.mult[1]}, ×${CELLAR.mult[2]}, ×${CELLAR.mult[3]}). Une bière sur douze environ tourne en route.</p>`
    );
}

// ---------------- le livre des bières ----------------
function bookHtml() {
    const B = state.brew;
    const n = G.beerBookPages(),
        tot = G.BREWABLE.length;
    return (
        section('Le livre des bières', `<small>${n} / ${tot}</small>`) +
        `<div class="card"><div class="card-sub">Une page par ingrédient mis dans une bière. Une récompense toutes les ${BEER_BOOK.every} pages, ${BEER_BOOK.rubans} rubans au livre complet.</div>
        ${bar(n / tot)}<div class="brew-book">${G.BREWABLE.map(id => `<i class="ico${B.book[id] ? '' : ' off'}" title="${ITEMS[id].name}">${art('item', id)}</i>`).join('')}</div>
        ${G.beerBookClaimable() ? btn(`Récompense : ${fmt(BEER_BOOK.coins * (B.bookClaimed + 1))}`, { act: 'claimBeerBook', kind: 'gold', wide: true, icon: ['ui', 'coin'] }) : ''}</div>`
    );
}

function renderBrew(el) {
    if (!G.brewOpen()) return blocks(el, [['closed', closedCard()]]);
    G.ensureBrew();
    blocks(el, [
        [
            'head',
            `<div class="card"><div class="card-head">${ico(['ui', 'beer'], 'ico big')}<div class="card-main"><div class="card-title">La brasserie de l’abbaye</div><div class="card-sub">${state.brew.vats.length} cuve${state.brew.vats.length > 1 ? 's' : ''} · jusqu’à ${G.brewSlots()} ingrédient${G.brewSlots() > 1 ? 's' : ''} par bière</div></div></div></div>`,
        ],
        ['vats', vatsHtml()],
        ['compose', composerHtml()],
        ['beers', beersHtml()],
        ['cellar', cellarHtml()],
        ['book', bookHtml()],
    ]);
}
defineView('machines/brew', renderBrew);

// ---------------- choisir un ingrédient ----------------
const brewables = () =>
    G.BREWABLE.filter(id => (state.inventory[id] || 0) > 0 || (lvOk(ITEMS[id]) && G.storyOk(ITEMS[id]) && !ITEMS[id].exotic)).sort(
        (a, b) => (state.inventory[b] || 0) - (state.inventory[a] || 0) || ITEMS[a].name.localeCompare(ITEMS[b].name),
    );
defineSheet('brewPick', {
    title: 'Un ingrédient',
    render(o) {
        const used = state.brew.draft.ings.map(([id]) => id);
        const list = brewables();
        return `<p class="card-sub">Il en faut ${ABBEY.ingPerDose} par dose. Les pages déjà dans le livre des bières sont cochées.</p><div class="pick-grid">${list
            .map(
                id =>
                    `<button class="pick-cell${used.includes(id) ? ' locked' : ''}" data-act="brewSet" data-id="${id}" data-s="${o.s}"${used.includes(id) ? ' disabled' : ''}>${ico(['item', id], 'ico big')}<b>${ITEMS[id].name}</b><small>×${state.inventory[id] || 0}${state.brew.book[id] ? ' ✓' : ''}</small></button>`,
            )
            .join('')}</div>`;
    },
});

// ---------------- mettre en fût ----------------
defineSheet('barrelPut', {
    title: 'Mettre en fût',
    open(o) {
        const list = G.myBeers().filter(b => !b.aged && G.beerStock(b.id) > 0);
        o.id = list[0] ? list[0].id : null;
        o.k = 'oak';
        o.n = o.id ? Math.min(CELLAR.maxBottles, G.beerStock(o.id)) : 1;
    },
    render(o) {
        const list = G.myBeers().filter(b => !b.aged && G.beerStock(b.id) > 0);
        if (!list.length) return empty('Brassez d’abord une bière : elles vieillissent en fût par lots de 12 bouteilles au plus.');
        if (!list.some(b => b.id === o.id)) o.id = list[0].id;
        const max = Math.min(CELLAR.maxBottles, G.beerStock(o.id));
        o.n = Math.max(1, Math.min(o.n, max));
        const kinds = Object.entries(BARRELS)
            .map(
                ([k, b]) =>
                    `<button class="pick-cell${o.k === k ? ' on' : ''}${G.barrelOk(k) || !b.item ? '' : ' locked'}" data-act="barrelKind" data-k="${k}">${ico(b.item ? ['item', b.item] : ['ui', 'barrel'], 'ico big')}<b>${b.name}</b><small>${b.item ? `1 ${ITEMS[b.item].name.toLowerCase()} · ×${state.inventory[b.item] || 0}` : `${fmt(b.cost)} pièces`} · note ${b.note}</small></button>`,
            )
            .join('');
        return `<div class="pick-grid">${list
            .map(
                b =>
                    `<button class="pick-cell${o.id === b.id ? ' on' : ''}" data-act="barrelBeer" data-id="${b.id}"><span class="pc-art">${beerSvg(b)}</span><b>${b.name}</b><small>×${G.beerStock(b.id)}</small></button>`,
            )
            .join('')}</div>${section('Le fût')}<div class="pick-grid">${kinds}</div>
            <div class="stepper big">${btn('', { act: 'barrelQty', data: { d: -1 }, icon: ['ui', 'minus'], disabled: o.n <= 1, title: 'Moins' })}<span><b>${o.n}</b> bouteille${o.n > 1 ? 's' : ''}</span>${btn('', { act: 'barrelQty', data: { d: 1 }, icon: ['ui', 'plus'], disabled: o.n >= max, title: 'Plus' })}</div>
            <p class="card-sub center">Étapes de ${CELLAR.steps.map(s => formatDuration(s)).join(', ')}.</p>`;
    },
    foot: o =>
        o.id
            ? btn('Mettre en fût', {
                  act: 'putBarrel',
                  kind: 'green',
                  wide: true,
                  size: 'lg',
                  disabled: !(BARRELS[o.k].item ? G.barrelOk(o.k) : state.money >= BARRELS[o.k].cost),
              })
            : '',
});

export function setupBrewery() {
    const put = () => sheetOpts('barrelPut');
    actions({
        goAbbey: () => {
            ui.sel.map = 'abbey';
            ui.sel.proj = 'malthouse';
            go('village/village');
        },
        brewMalt: (el, d) => G.setDraftMalt(d.m),
        brewHop: (el, d) => G.setDraftHop(+d.n),
        brewPick: (el, d) => openSheet('brewPick', { s: +d.s }),
        brewSet: (el, d) => {
            if (G.setDraftIng(+d.s, d.id)) closeSheet('brewPick');
        },
        brewDose: (el, d) => G.setDraftDose(+d.s, state.brew.draft.ings[+d.s][1] + +d.d),
        brewDrop: (el, d) => {
            state.brew.draft.ings.splice(+d.s, 1);
        },
        brew: el => G.startBrew(el),
        collectVat: (el, d) => G.collectVat(+d.i, el),
        sellBeer: (el, d) => G.sellBeer(d.id, +d.n, el),
        claimBeerBook: el => G.claimBeerBook(el),
        takeBarrel: (el, d) => G.takeFromBarrel(+d.i, el),
        barrelBeer: (el, d) => {
            const o = put();
            o.id = d.id;
            o.n = Math.min(CELLAR.maxBottles, G.beerStock(d.id));
        },
        barrelKind: (el, d) => (put().k = d.k),
        barrelQty: (el, d) => (put().n += +d.d),
        putBarrel: el => {
            const o = put();
            if (G.putInBarrel(+o.slot, o.id, o.n, o.k, el)) closeSheet('barrelPut');
        },
    });
}
