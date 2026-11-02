// Atelier | Brasserie (1.6) : composer sa bière (malt, houblon, 1 à 3 ingrédients), la brasser, la nommer,
// la vendre, et remplir le livre des bières. Le vieillissement en fût se fait à la cave (1.6.3).
import { state, lvOk } from '../../core/state.js';
import { now } from '../../core/clock.js';
import { fmt, formatDuration } from '../../core/format.js';
import { ITEMS } from '../../data/items.js';
import { ABBEY, MALTS, MALT_IDS, HOP_DOSES, NOTES, NOTE_COL, BARRELS, BEER_BOOK } from '../../data/abbey.js';
import { VILLAGERS } from '../../data/village.js';
import * as G from '../../systems/index.js';
import { blocks, actions, esc } from '../dom.js';
import { ico, art, qStar } from '../icons.js';
import { QUALITY } from '../../data/farm.js';
import { btn, bar, timer, section, empty } from '../kit.js';
import { defineView, defineLive, ui, go } from '../app.js';
import { defineSheet, openSheet, closeSheet } from '../sheets.js';
import { page, filterOf, filterChips, searchBox, queryOf, matchQ } from '../pager.js';
import { renameBtn } from '../sheets/rename.js';
import { beerSvg } from '../../art/abbey.js';
import { genWrap } from '../genlook.js';
import { innerTabs } from '../innertabs.js';
import { HONEYS, HONEY_COL } from '../../data/honey.js';

const cap = t => t[0].toUpperCase() + t.slice(1);
const COIN = () => ico(['ui', 'coin']);
const stars = n => `<span class="brew-stars">${[0, 1, 2].map(k => `<i class="${k < n ? 'on' : ''}">★</i>`).join('')}</span>`;
const bottle = b => `<i class="ico brew-bottle">${beerSvg(b)}</i>`;
// 1.7 : une variété du labo se dessine avec son apparence
const varOf = id => state.genetics && state.genetics.vars[id];
// 1.68 : un miel de fleur (base d'un hydromel) a son pot
const honeyOf = id => (/^H[a-z]/.test(id) && HONEYS[id.slice(1)] ? id.slice(1) : null);
const ingIco = (id, cls = 'ico') =>
    honeyOf(id)
        ? ico(['item', 'honey_' + honeyOf(id)], cls)
        : varOf(id)
          ? `<i class="${cls}">${genWrap(art('item', varOf(id).g.form), varOf(id).g)}</i>`
          : ico(['item', id], cls);
const ingIcons = ings => ings.map(([id, d]) => `<span class="brew-ing">${ingIco(id)}${d > 1 ? `<b>×${d}</b>` : ''}</span>`).join('');

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
                <div class="bv-btns">${ready ? btn('Mettre en bouteille', { act: 'collectVat', data: { i }, kind: 'green', size: 'sm' }) : ''}${btn(v.loop ? 'En boucle' : 'Boucle', { act: 'vatLoop', data: { i }, kind: v.loop ? 'blue' : '', size: 'sm', icon: ['ui', 'loop'], title: 'Relancer la même bière quand elle est prête' })}</div></div>`;
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
    const mead = G.isMead(d.malt);
    const kinds = G.meadOpen()
        ? `<div class="bc-row"><span class="bc-label">Boisson</span><div class="seg n2">${[
              ['beer', 'Bière'],
              ['mead', 'Hydromel'],
          ]
              .map(([k, n]) => `<button class="${(k === 'mead') === mead ? 'on' : ''}" data-act="brewKind" data-k="${k}">${n}</button>`)
              .join('')}</div></div>`
        : '';
    // 1.68 : un hydromel : un miel (toutes fleurs ou de fleur), pas de houblon
    const honeys = G.meadHoneys()
        .map(h => {
            const id = h === 'all' ? 'honey' : 'H' + h;
            return `<button class="brew-malt${d.malt === 'mead:' + h ? ' on' : ''}" data-act="brewHoney" data-h="${h}"><i class="swatch" style="background:${HONEY_COL[h]}"></i><b>${h === 'all' ? 'Toutes fleurs' : cap(HONEYS[h].name.replace(/^Miel d(e |’)/, ''))}</b><small>${ingIco(id)}${G.ingHave(id)}</small></button>`;
        })
        .join('');
    const malts = MALT_IDS.map(
        m =>
            `<button class="brew-malt${d.malt === m ? ' on' : ''}" data-act="brewMalt" data-m="${m}"><i class="swatch" style="background:${MALTS[m].color}"></i><b>${MALTS[m].name}</b><small>${ico(['item', m])}${state.inventory[m] || 0}</small></button>`,
    ).join('');
    const hops = HOP_DOSES.map(
        (h, k) =>
            `<button class="${d.hop === k + 1 ? 'on' : ''}" data-act="brewHop" data-n="${k + 1}"><span>${h}</span><small>${ico(['item', 'hop'])}${(k + 1) * ABBEY.hopPerDose}</small></button>`,
    ).join('');
    const nSlots = G.brewSlots(d.malt);
    const slots = Array.from({ length: nSlots }, (_, s) => {
        if (d.ings.length > nSlots) d.ings.length = nSlots;
        const it = d.ings[s];
        if (!it) return `<button class="brew-slot empty" data-act="brewPick" data-s="${s}"><b>+</b><span>Ingrédient</span></button>`;
        const [id, dose] = it;
        return `<div class="brew-slot"><button class="bs-pick" data-act="brewPick" data-s="${s}">${ingIco(id, 'ico big')}<span>${G.ingName(id)}${varOf(id) ? ' <small class="chip ok">variété</small>' : ''}</span><small>${G.ingHave(id)} en stock</small></button>
            <div class="stepper">${btn('', { act: 'brewDose', data: { s, d: -1 }, icon: ['ui', 'minus'], disabled: dose <= 1, title: 'Moins', size: 'sm' })}<b>×${dose}</b>${btn('', { act: 'brewDose', data: { s, d: 1 }, icon: ['ui', 'plus'], disabled: dose >= 3, title: 'Plus', size: 'sm' })}</div>
            ${btn('', { act: 'brewDrop', data: { s }, icon: ['ui', 'cross'], kind: 'ghost', size: 'sm', title: 'Retirer' })}</div>`;
    }).join('');
    const more =
        G.brewSlots() < 3 && !mead
            ? `<p class="hint">${G.brewSlots() === 1 ? 'Deux ingrédients après les cuves de fermentation.' : 'Trois ingrédients après l’étiqueterie.'}</p>`
            : '';
    const beerLike = { malt: d.malt, ings: pv.ings, stars: pv.secret ? 0 : pv.harmony.stars, bases: pv.bases };
    const cost = Object.entries(pv.cost)
        .map(([id, n]) => `<span class="${G.ingHave(id) >= n ? 'ok' : 'short'}">${ingIco(id)}${G.ingHave(id)}/${n}</span>`)
        .join('');
    const preview = pv.ings.length
        ? `<div class="brew-preview"><div class="bp-art">${beerSvg(beerLike)}</div><div class="bp-main">
            <div class="bp-name">${pv.name} ${pv.known ? '<span class="chip">déjà brassée</span>' : '<span class="chip ok">nouvelle !</span>'}</div>
            ${
                pv.secret
                    ? `<div class="bp-stars">Accord <b class="brew-secret">? ? ?</b> <small>à découvrir en la brassant</small></div><ul class="bp-why">${pv.hints.map(r => `<li>${r}</li>`).join('')}</ul>`
                    : `<div class="bp-stars">Accord ${stars(pv.harmony.stars)}</div><ul class="bp-why">${pv.harmony.reasons.map(r => `<li>${r}</li>`).join('')}</ul>`
            }
            ${noteBars(pv.profile)}
            <div class="cost">${cost}</div>
            <div class="card-sub">${ABBEY.bottles} bouteilles${pv.secret ? '' : ` à ${fmt(pv.value)}${COIN()}`} · ${formatDuration(pv.time)}</div>${pv.q ? `<div class="card-sub bp-q">${qStar(pv.q)} sortira en ${QUALITY[pv.q].name} (×${String(QUALITY[pv.q].mult).replace('.', ',')})</div>` : ''}</div></div>`
        : `<p class="hint">${mead ? 'Choisissez un ingrédient : la pomme, le raisin, les fruits rouges ou les herbes font les grands hydromels.' : 'Choisissez un ingrédient : chaque fruit et chaque légume de la ferme donne une bière différente.'}</p>`;
    const can = pv.ings.length && !pv.miss.length && pv.freeVat >= 0;
    return `<div class="card brew-compose">
        ${kinds}
        ${
            mead
                ? `<div class="bc-row"><span class="bc-label">Miel</span><div class="brew-malts honeys">${honeys}</div></div>`
                : `<div class="bc-row"><span class="bc-label">Malt</span><div class="brew-malts">${malts}</div></div>
        <div class="bc-row"><span class="bc-label">Houblon</span><div class="seg n3 brew-hops">${hops}</div></div>`
        }
        <div class="bc-row"><span class="bc-label">Ingrédients</span><div class="brew-slots">${slots}</div></div>${more}
        ${preview}
        ${btn(pv.freeVat < 0 ? 'Toutes les cuves sont pleines' : 'Brasser', { act: 'brew', kind: 'green', wide: true, size: 'lg', disabled: !can, icon: mead ? ['item', 'mead'] : ['ui', 'beer'] })}</div>`;
}

// ---------------- mes bières ----------------
function beersHtml() {
    const all = G.myBeers();
    if (!all.length)
        return empty(G.meadOpen() ? 'Vos bières et vos hydromels apparaîtront ici, avec leur nom.' : 'Vos bières apparaîtront ici, avec leur nom.');
    // 1.64 : une longue liste : filtres (en stock, les meilleures, toutes) et « Voir plus »
    const inStock = all.filter(b => G.beerStock(b.id) > 0),
        top = all.filter(b => b.stars >= 3),
        meads = all.filter(b => b.mead);
    const opts = [
        ['stock', 'En stock', inStock.length],
        ['top', '3 étoiles', top.length],
        ['all', 'Toutes', all.length],
    ];
    // 1.68 : bières ou hydromels
    if (meads.length) opts.splice(2, 0, ['beer', 'Bières', all.length - meads.length], ['mead', 'Hydromels', meads.length]);
    const f = filterOf('beers', opts);
    const q = queryOf('beers');
    const list = (f === 'stock' ? inStock : f === 'top' ? top : f === 'mead' ? meads : f === 'beer' ? all.filter(b => !b.mead) : [...all])
        .filter(b => matchQ(q, b.name, ...b.ings.map(x => G.ingName(x[0]))))
        .sort((a, b) => G.beerStock(b.id) - G.beerStock(a.id) || b.stars - a.stars || b.value - a.value);
    const pg = page('beers:' + f, list, 10);
    return (
        filterChips('beers', opts, f) +
        (list.length ? '' : empty(`Aucune bière ne correspond à « ${esc(ui.sel.q.beers)} ».`)) +
        pg.top +
        `<div class="list">${pg.items
            .map(b => {
                const n = G.beerStock(b.id);
                const bq = n ? G.beerQual(b.id) : null;
                const chips = bq
                    ? [
                          [4, 'd'],
                          [3, 'p'],
                          [2, 'g'],
                          [1, 's'],
                      ]
                          .map(([r, f]) => (bq[f] ? `<span class="qchip">${qStar(r)}${bq[f]}</span>` : ''))
                          .join('')
                    : '';
                const sub = `${stars(b.stars)} ${ingIcons(b.ings)}${chips}${b.aged ? ` <span class="chip">${BARRELS[b.aged.k].name.toLowerCase()}</span>` : ''}`;
                const price = G.beerPrice(b.id),
                    low = price < b.value;
                const side =
                    `<b class="bb-n">×${n}</b><small class="${low ? 'bb-low' : ''}" title="${low ? 'Vous en avez beaucoup vendu : le prix remonte avec le temps' : ''}">${fmt(price)}${COIN()}${low ? ' ↓' : ''}</small>` +
                    (n
                        ? btn('Vendre', { act: 'sellBeer', data: { id: b.id, n: 1 }, size: 'sm' }) +
                          (n > 1 ? btn('Tout vendre', { act: 'sellBeer', data: { id: b.id, n }, kind: 'gold', size: 'sm' }) : '')
                        : '');
                const again = b.aged ? '' : btn('Rebrasser', { act: 'rebrew', data: { id: b.id }, kind: 'green', size: 'sm', icon: ['ui', 'loop'] });
                return `<div class="card brew-beer${n ? '' : ' none'}"><div class="card-art">${beerSvg(b)}</div><div class="card-main"><div class="card-title">${b.name} ${renameBtn('beer', b.id, b.mead ? 'Renommer l’hydromel' : 'Renommer la bière')}</div><div class="card-sub">${sub}</div>${again ? `<div class="bb-again">${again}</div>` : ''}</div><div class="card-side">${side}</div></div>`;
            })
            .join('')}</div>${pg.more}`
    );
}

// ---------------- les commandes de bière ----------------
function ordersHtml() {
    const B = state.brew;
    if (!B.orders.length) return '';
    return (
        section('Commandes de bière') +
        `<div class="list">${B.orders
            .map(o => {
                const fits = G.beerOrderMatches(o);
                const best = fits[0];
                const v = VILLAGERS[o.vid];
                return `<div class="card brew-order${best ? ' ready' : ''}"><div class="card-art">${art('villager', o.vid)}</div><div class="card-main"><div class="card-title">${v ? v.name : ''}</div>
                    <div class="card-sub">« ${G.beerOrderText(o)}. »</div>
                    ${best ? `<div class="card-sub">Avec : <b>${best.name}</b> · ${fmt(G.beerOrderPay(o, best.id))}${COIN()}</div>` : `<div class="card-sub">${o.mead ? 'Aucun de vos hydromels ne convient encore.' : 'Aucune de vos bières ne convient encore.'}</div>`}</div>
                    <div class="card-side">${btn('Livrer', { act: 'beerOrder', data: { id: o.id }, kind: 'green', size: 'sm', disabled: !best })}${btn('', { act: 'beerDrop', data: { id: o.id }, icon: ['ui', 'cross'], kind: 'ghost', size: 'sm', title: 'Refuser' })}</div></div>`;
            })
            .join('')}</div>`
    );
}

// ---------------- le cellier : 1.6.3, les fûts sont descendus à la cave ----------------
function cellarHtml() {
    if (!G.cellarOpen()) return '';
    const n = state.cave.slots.filter(l => l && l.id === 'beer').length;
    return `<div class="card"><div class="card-head">${ico(['ui', 'barrel'], 'ico big')}<div class="card-main"><div class="card-title">Le vieillissement en fût</div>
        <div class="card-sub">${n ? `${n} fût${n > 1 ? 's' : ''} en cave. ` : ''}Vos bières vieillissent à la cave, avec les fromages et les vins : un soin par étape, et elles peuvent devenir légendaires.</div></div>
        ${btn('À la cave', { act: 'goCave', size: 'sm', icon: ['ui', 'cave'] })}</div></div>`;
}

// ---------------- le livre des bières ----------------
function bookHtml() {
    const B = state.brew;
    const n = G.beerBookPages(),
        tot = G.bookTotal();
    // 1.68 : une page par miel brassé en hydromel
    const hp = G.meadOpen()
        ? G.BOOK_HONEYS.map(
              h =>
                  `<i class="ico${B.book['H' + h] ? '' : ' off'}" title="${h === 'all' ? 'Miel toutes fleurs' : HONEYS[h].name}">${art('item', h === 'all' ? 'honey' : 'honey_' + h)}</i>`,
          ).join('')
        : '';
    return (
        section('Le livre des bières', `<small>${n} / ${tot}</small>`) +
        `<div class="card"><div class="card-sub">Une page par ingrédient mis dans une bière${G.meadOpen() ? ', et une par miel mis dans un hydromel' : ''}. Une récompense toutes les ${BEER_BOOK.every} pages, ${BEER_BOOK.rubans} rubans au livre complet.</div>
        ${bar(n / tot)}<div class="brew-book">${G.BREWABLE.map(id => `<i class="ico${B.book[id] ? '' : ' off'}" title="${ITEMS[id].name}">${art('item', id)}</i>`).join('')}${hp}</div>
        ${G.beerBookClaimable() ? btn(`Récompense : ${fmt(BEER_BOOK.coins * (B.bookClaimed + 1))}`, { act: 'claimBeerBook', kind: 'gold', wide: true, icon: ['ui', 'coin'] }) : ''}</div>`
    );
}

function renderBrew(el) {
    if (!G.brewOpen()) return blocks(el, [['closed', closedCard()]]);
    G.ensureBrew();
    // 1.73 : quatre onglets au lieu d'une page de dix écrans
    const B = state.brew;
    const ready = B.vats.filter(v => G.vatReady(v)).length;
    const n = G.myBeers().length;
    const T = innerTabs(
        'brew',
        [
            ['make', 'Brasser', null, ready],
            ['mine', G.meadOpen() ? 'Boissons' : 'Bières', null, 0],
            ['orders', 'Clients', null, G.beerOrdersReady()],
            ['book', 'Livre', null, G.beerBookClaimable() ? 1 : 0],
        ],
        'make',
    );
    const t = T.cur;
    blocks(el, [
        ['tabs', T.html],
        [
            'head',
            t === 'make'
                ? `<div class="card"><div class="card-head">${ico(['ui', 'beer'], 'ico big')}<div class="card-main"><div class="card-title">La brasserie de l’abbaye</div><div class="card-sub">${B.vats.length} cuve${B.vats.length > 1 ? 's' : ''} · jusqu’à ${G.brewSlots()} ingrédient${G.brewSlots() > 1 ? 's' : ''} par bière${G.meadOpen() ? `, ${G.brewSlots('mead:all')} par hydromel` : ''}</div></div></div></div>`
                : '',
        ],
        ['vats', t === 'make' ? vatsHtml() : ''],
        ['compose', t === 'make' ? composerHtml() : ''],
        ['beersHead', t === 'mine' ? section(G.meadOpen() ? 'Mes boissons' : 'Mes bières', n ? `<small>${n}</small>` : '') : ''],
        ['beerSearch', t === 'mine' && n > 20 ? searchBox('beers', G.meadOpen() ? 'Boisson ou ingrédient' : 'Bière ou ingrédient') : ''],
        ['beers', t === 'mine' ? beersHtml() : ''],
        ['cellar', t === 'mine' ? cellarHtml() : ''],
        [
            'orders',
            t === 'orders' ? ordersHtml() || empty('Pas de commande de bière pour le moment : Frère Hugues, Agnès et les habitués passent régulièrement.') : '',
        ],
        ['book', t === 'book' ? bookHtml() : ''],
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
        if (!state.brew || !state.brew.draft) return '';
        const used = state.brew.draft.ings.map(([id]) => id);
        const list = brewables();
        const vars = G.brewVarieties();
        const top = id =>
            G.ingFlavor(id)
                .map((v, k) => [v, k])
                .filter(x => x[0] >= 3)
                .map(([v, k]) => `${NOTES[k]} ${v}`)
                .join(', ');
        const varHtml = vars.length
            ? `${section('Mes variétés')}<p class="card-sub">Une variété garde son propre goût dans la bière.</p><div class="pick-grid">${vars
                  .map(
                      v =>
                          `<button class="pick-cell${used.includes(v.id) ? ' locked' : ''}" data-act="brewSet" data-id="${v.id}" data-s="${o.s}"${used.includes(v.id) ? ' disabled' : ''}>${ingIco(v.id, 'ico big')}<b>${G.varName(v)}</b><small>×${G.ingHave(v.id)}${top(v.id) ? ` · ${top(v.id)}` : ''}</small></button>`,
                  )
                  .join('')}</div>${section('Espèces')}`
            : '';
        return `<p class="card-sub">Il en faut ${ABBEY.ingPerDose} par dose. Les pages déjà dans le livre des bières sont cochées.</p>${varHtml}<div class="pick-grid">${list
            .map(
                id =>
                    `<button class="pick-cell${used.includes(id) ? ' locked' : ''}" data-act="brewSet" data-id="${id}" data-s="${o.s}"${used.includes(id) ? ' disabled' : ''}>${ico(['item', id], 'ico big')}<b>${ITEMS[id].name}</b><small>×${state.inventory[id] || 0}${state.brew.book[id] ? ' ✓' : ''}</small></button>`,
            )
            .join('')}</div>`;
    },
});

export function setupBrewery() {
    actions({
        goCave: () => go('machines/cave'),
        goAbbey: () => {
            ui.sel.map = 'abbey';
            ui.sel.proj = 'malthouse';
            go('village/village#story');
        },
        brewMalt: (el, d) => G.setDraftMalt(d.m),
        brewHop: (el, d) => G.setDraftHop(+d.n),
        brewKind: (el, d) => G.setDraftKind(d.k),
        brewHoney: (el, d) => G.setDraftHoney(d.h),
        brewPick: (el, d) => openSheet('brewPick', { s: +d.s }),
        brewSet: (el, d) => {
            if (G.setDraftIng(+d.s, d.id)) closeSheet('brewPick');
        },
        brewDose: (el, d) => G.setDraftDose(+d.s, state.brew.draft.ings[+d.s][1] + +d.d),
        brewDrop: (el, d) => {
            state.brew.draft.ings.splice(+d.s, 1);
        },
        brew: el => G.startBrew(el),
        rebrew: (el, d) => G.rebrew(d.id, el),
        vatLoop: (el, d) => G.toggleVatLoop(+d.i),
        beerOrder: (el, d) => G.deliverBeerOrder(d.id, null, el),
        beerDrop: (el, d) => G.dismissBeerOrder(d.id),
        collectVat: (el, d) => G.collectVat(+d.i, el),
        sellBeer: (el, d) => G.sellBeer(d.id, +d.n, el),
        claimBeerBook: el => G.claimBeerBook(el),
    });
}
