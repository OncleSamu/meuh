// Atelier | Brasserie (1.6) : composer sa bière (malt, houblon, 1 à 3 ingrédients), la brasser, la nommer,
// la vendre, et remplir le livre des bières. Le vieillissement en fût se fait à la cave (1.6.3).
import { toast } from '../../core/bus.js';
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
import { btn, bar, timer, section, empty, hint } from '../kit.js';
import { defineView, defineLive, ui, go } from '../app.js';
import { defineSheet, openSheet, closeSheet } from '../sheets.js';
import { page, filterOf, filterChips, filterSelect, searchBox, queryOf, matchQ } from '../pager.js';
import { renameBtn } from '../sheets/rename.js';
import { beerSvg } from '../../art/abbey.js';
import { genWrap } from '../genlook.js';
import { innerTabs } from '../innertabs.js';
import { HONEYS, HONEY_COL } from '../../data/honey.js';
import { MEAD_BASES } from '../../data/abbey.js';

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
    // 1.74 : plusieurs cuves prêtes : un seul bouton pour tout mettre en bouteille
    const nReady = B.vats.filter(v => G.vatReady(v)).length;
    const all = nReady > 1 ? btn(`Tout mettre en bouteille (${nReady})`, { act: 'collectAllVats', kind: 'green', wide: true }) : '';
    return `${all}<div class="brew-vats">${B.vats
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
    const honeyCur = (() => {
        const h = d.malt.startsWith('mead:') ? d.malt.slice(5) : 'all';
        const id = h === 'all' ? 'honey' : 'H' + h;
        return `<button class="brew-malt on" data-act="brewHoneyPick"><i class="swatch" style="background:${HONEY_COL[h] || HONEY_COL.all}"></i><b>${h === 'all' ? 'Toutes fleurs' : cap(HONEYS[h] ? HONEYS[h].name.replace(/^Miel d(e |’)/, '') : h)}</b><small>${ingIco(id)}${G.ingHave(id)}</small></button>`;
    })();
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
                ? `<div class="bc-row"><span class="bc-label">Miel</span>${
                      G.meadHoneys().length > 6
                          ? `<div class="brew-malts honeys">${honeyCur}<button class="brew-malt" data-act="brewHoneyPick"><b>Choisir un miel</b><small>${G.meadHoneys().length} en stock · trier, chercher</small></button></div>`
                          : `<div class="brew-malts honeys">${honeys}</div>`
                  }</div>`
                : `<div class="bc-row"><span class="bc-label">Malt</span><div class="brew-malts">${malts}</div></div>
        <div class="bc-row"><span class="bc-label">Houblon</span><div class="seg n3 brew-hops">${hops}</div></div>`
        }
        <div class="bc-row"><span class="bc-label">Ingrédients</span><div class="brew-slots">${slots}</div></div>${more}
        <div class="center">${btn('Meilleur accord avec mon stock', { act: 'brewBest', size: 'sm', icon: ['ui', 'sparkle'] })}</div>
        ${preview}
        ${
            // 1.74 : quand on ne peut pas brasser, une phrase dit pourquoi (plus de gros bouton gris)
            can
                ? btn('Brasser', { act: 'brew', kind: 'green', wide: true, size: 'lg', icon: mead ? ['item', 'mead'] : ['ui', 'beer'] })
                : `<p class="state-line">${pv.freeVat < 0 ? 'Toutes les cuves sont pleines : mettez une bière en bouteille.' : !pv.ings.length ? 'Choisissez au moins un ingrédient.' : `Il manque : ${pv.miss.map(([id, n]) => `${n - G.ingHave(id)} ${G.ingName(id).toLowerCase()}`).join(', ')}.`}</p>`
        }</div>`;
}

// ---------------- 1.117 : le carnet des favorites ----------------
function carnetHtml() {
    const favs = G.favBeers();
    if (!favs.length) return G.myBeers().length ? '<p class="hint">Touchez l’étoile d’une bière (onglet Bières) pour la garder dans votre carnet et la relancer d’ici.</p>' : '';
    return `<div class="card brew-carnet"><div class="card-title">Mon carnet</div>${favs
        .slice(0, 8)
        .map(b => {
            const ok = G.canRebrew(b.id);
            return `<div class="cut-row"><span class="carnet-name">${stars(b.stars)} <b>${b.name}</b> ${ingIcons(b.ings)}</span>${btn(ok ? 'Brasser' : 'Il manque…', { act: 'rebrew', data: { id: b.id }, kind: ok ? 'green' : '', size: 'sm', icon: ['ui', 'loop'] })}</div>`;
        })
        .join('')}</div>`;
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
    const favs = all.filter(b => G.isFav(b.id));
    const opts = [
        ['stock', 'En stock', inStock.length],
        ['fav', 'Carnet', favs.length],
        ['top', '3 étoiles', top.length],
        ['all', 'Toutes', all.length],
    ];
    // 1.68 : bières ou hydromels
    if (meads.length) opts.splice(2, 0, ['beer', 'Bières', all.length - meads.length], ['mead', 'Hydromels', meads.length]);
    const f = filterOf('beers', opts);
    const q = queryOf('beers');
    const list = (f === 'stock' ? inStock : f === 'fav' ? favs : f === 'top' ? top : f === 'mead' ? meads : f === 'beer' ? all.filter(b => !b.mead) : [...all])
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
                const again =
                    (b.aged ? '' : btn('Rebrasser', { act: 'rebrew', data: { id: b.id }, kind: 'green', size: 'sm', icon: ['ui', 'loop'] })) +
                    (b.aged ? '' : `<button class="fav-star${G.isFav(b.id) ? ' on' : ''}" data-act="favBeer" data-id="${b.id}" aria-label="${G.isFav(b.id) ? 'Retirer du carnet' : 'Garder dans le carnet'}">${G.isFav(b.id) ? '★' : '☆'}</button>`);
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
        ['carnet', t === 'make' ? carnetHtml() : ''],
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
// 1.108 : feuilles de tri. Une recherche, des puces (en stock, fruits, cultures, ateliers, variétés) et un tri (stock, nom, une note de goût).
const NOTE_SORT = NOTES.map((n, k) => [`n${k}`, `${cap(n)} d’abord`]);
const TRIS = [['stock', 'En stock d’abord'], ['name', 'Nom (A à Z)'], ...NOTE_SORT];
const tri = (key, cur, count) =>
    `<label class="list-sel"><span>Trier par</span><select data-input="filtSel" data-k="${key}">${TRIS.map(([id, n]) => `<option value="${id}"${cur === id ? ' selected' : ''}>${n}</option>`).join('')}</select></label>${count}`;
const sortOf = key => {
    const f = ui.sel.filt && ui.sel.filt[key];
    return TRIS.some(x => x[0] === f) ? f : 'stock';
};
const noteLine = id =>
    G.ingFlavor(id)
        .map((v, k) => [v, k])
        .filter(x => x[0] >= 3)
        .map(([v, k]) => `${NOTES[k]} ${v}`)
        .join(', ');
const brewables = () =>
    [...G.BREWABLE, ...Object.keys(G.BREW_EXTRA).filter(id => (state.inventory[id] || 0) > 0)].filter(
        id => (state.inventory[id] || 0) > 0 || (lvOk(ITEMS[id]) && G.storyOk(ITEMS[id]) && !ITEMS[id].exotic),
    );
const pickCell = (id, o, used, label, small, extra = '') =>
    `<button class="pick-cell${used.includes(id) ? ' locked' : ''}${(state.inventory[id] || 0) <= 0 && !extra ? ' short' : ''}" data-act="brewSet" data-id="${id}" data-s="${o.s}"${used.includes(id) ? ' disabled' : ''}>${ingIco(id, 'ico big')}<b>${label}</b><small>${small}</small></button>`;
defineSheet('brewPick', {
    title: () => (G.isMead(state.brew && state.brew.draft && state.brew.draft.malt) ? 'Un ingrédient de l’hydromel' : 'Un ingrédient de la bière'),
    render(o) {
        if (!state.brew || !state.brew.draft) return '';
        const used = state.brew.draft.ings.map(([id]) => id);
        const mead = G.isMead(state.brew.draft.malt);
        const all = brewables();
        const vars = G.brewVarieties();
        const q = queryOf('ing');
        const fruit = id => ITEMS[id].type === 'tree';
        const extra = id => id in G.BREW_EXTRA;
        const stock = id => (state.inventory[id] || 0) > 0;
        const opts = [
            ['all', 'Tout', all.length + vars.length],
            ['stock', 'En stock', all.filter(stock).length + vars.length],
            ['fruit', 'Fruits', all.filter(fruit).length],
            ['crop', 'Légumes et céréales', all.filter(id => !fruit(id) && !extra(id)).length],
            ['extra', 'Ateliers', all.filter(extra).length],
            ['vars', 'Mes variétés', vars.length],
        ];
        const f = filterOf('ing', opts);
        const sort = sortOf('ingSort');
        const keep = id => (f === 'all' || (f === 'stock' && stock(id)) || (f === 'fruit' && fruit(id)) || (f === 'crop' && !fruit(id) && !extra(id)) || (f === 'extra' && extra(id))) && matchQ(q, ITEMS[id].name);
        const cmp = (flav, have, name) => (a, b) =>
            (sort.startsWith('n') ? flav(b)[+sort[1]] - flav(a)[+sort[1]] : 0) ||
            (sort === 'name' ? 0 : have(b) - have(a)) ||
            name(a).localeCompare(name(b), 'fr');
        const list = (f === 'vars' ? [] : all.filter(keep)).sort(cmp(G.ingFlavor, id => state.inventory[id] || 0, id => ITEMS[id].name));
        const vlist = (f === 'all' || f === 'stock' || f === 'vars' ? vars : [])
            .filter(v => matchQ(q, G.varName(v), ITEMS[v.base].name))
            .sort(cmp(v => G.ingFlavor(v.id), v => G.ingHave(v.id), v => G.varName(v)));
        const pg = page('ing:' + f + sort, list, 30);
        const varHtml = vlist.length
            ? `${section('Mes variétés')}<div class="pick-grid">${vlist
                  .map(v => pickCell(v.id, o, used, G.varName(v), `×${G.ingHave(v.id)}${noteLine(v.id) ? ` · ${noteLine(v.id)}` : ''}`, 'v'))
                  .join('')}</div>${list.length ? section('Espèces') : ''}`
            : '';
        const cells = pg.items
            .map(id => pickCell(id, o, used, ITEMS[id].name, `×${state.inventory[id] || 0}${state.brew.book[id] ? ' ✓' : ''}${noteLine(id) ? ` · ${noteLine(id)}` : ''}`))
            .join('');
        return [
            ['info', hint(mead ? 'Pour un hydromel, le miel donne la base : ajoutez-y un fruit sucré ou acidulé, ou des herbes. Il en faut ' + ABBEY.ingPerDose + ' par dose. Les pages déjà dans le livre sont cochées (✓).' : `Il en faut ${ABBEY.ingPerDose} par dose. Les pages déjà dans le livre des bières sont cochées (✓). Chaque ingrédient a des notes de goût : sucré, acide, amer, épicé, umami.`)],
            ['search', searchBox('ing', 'Chercher un ingrédient')],
            ['chips', filterChips('ing', opts, f)],
            ['sort', `<div class="list-tools">${tri('ingSort', sort, '')}<small class="card-sub">${list.length + vlist.length} ingrédient${list.length + vlist.length > 1 ? 's' : ''}</small></div>`],
            ['top', pg.top],
            ['vars', varHtml],
            ['cells', list.length ? `<div class="pick-grid">${cells}</div>` : vlist.length ? '' : empty(q ? `Aucun ingrédient ne correspond à « ${esc(ui.sel.q.ing)} ».` : 'Rien dans cette catégorie pour le moment.')],
            ['more', pg.more],
        ];
    },
});

// 1.108 : le choix du miel d'un hydromel : une feuille de tri (recherche, ce qu'il aime, tri par stock ou par nom)
const LIKES = NOTES.map((n, k) => [`l${k}`, `Aime le ${n}`, k]);
defineSheet('brewHoneyPick', {
    title: 'Un miel pour l’hydromel',
    render() {
        if (!state.brew || !state.brew.draft) return '';
        const cur = state.brew.draft.malt;
        const all = G.meadHoneys();
        const q = queryOf('honey');
        const name = h => (h === 'all' ? 'Toutes fleurs' : cap(HONEYS[h].name.replace(/^Miel d(e |’)/, '')));
        const have = h => G.ingHave(h === 'all' ? 'honey' : 'H' + h);
        const likes = h => (MEAD_BASES[h] ? MEAD_BASES[h].likes : []);
        const opts = [['all', 'Tous', all.length], ...LIKES.map(([id, n, k]) => [id, n, all.filter(h => likes(h).includes(k)).length])];
        const f = filterOf('honey', opts);
        const sort = ui.sel.filt && ui.sel.filt.honeySort === 'name' ? 'name' : 'stock';
        const list = all
            .filter(h => (f === 'all' || likes(h).includes(+f.slice(1))) && matchQ(q, name(h), MEAD_BASES[h].text))
            .sort((a, b) => (sort === 'name' ? 0 : have(b) - have(a)) || name(a).localeCompare(name(b), 'fr'));
        return [
            ['info', hint('Un miel de fleur donne un goût propre à l’hydromel. « Aime… » dit ce qui s’accorde le mieux avec lui. Toutes fleurs va avec tout, sans éclat.')],
            ['search', all.length > 6 ? searchBox('honey', 'Chercher un miel') : ''],
            ['chips', filterChips('honey', opts, f)],
            ['sort', filterSelect('honeySort', [['stock', 'En stock d’abord', all.length], ['name', 'Nom (A à Z)', all.length]], sort, 'Trier par')],
            [
                'cells',
                list.length
                    ? `<div class="pick-grid">${list
                          .map(
                              h =>
                                  `<button class="pick-cell${cur === 'mead:' + h ? ' locked' : ''}" data-act="brewHoneySet" data-h="${h}"><i class="swatch" style="background:${HONEY_COL[h]}"></i><b>${name(h)}</b><small>×${have(h)} · ${esc(MEAD_BASES[h].text)}</small></button>`,
                          )
                          .join('')}</div>`
                    : empty('Aucun miel ne correspond.'),
            ],
        ];
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
        brewHoneyPick: () => openSheet('brewHoneyPick', {}),
        brewHoneySet: (el, d) => {
            if (G.setDraftHoney(d.h)) closeSheet('brewHoneyPick');
        },
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
        favBeer: (el, d) => G.toggleFav(d.id),
        brewBest: () => {
            const b = G.applyBestAccord();
            if (!b) toast('Pas assez d’ingrédients en stock pour proposer un accord', ['ui', 'beer']);
            // les étoiles d'une bière nouvelle restent à découvrir en la brassant
            else toast('Voici le meilleur accord avec votre stock', ['ui', 'sparkle']);
        },
        vatLoop: (el, d) => G.toggleVatLoop(+d.i),
        beerOrder: (el, d) => G.deliverBeerOrder(d.id, null, el),
        beerDrop: (el, d) => G.dismissBeerOrder(d.id),
        collectVat: (el, d) => G.collectVat(+d.i, el),
        collectAllVats: el => state.brew.vats.forEach((v, i) => G.vatReady(v) && G.collectVat(i, el)),
        sellBeer: (el, d) => G.sellBeer(d.id, +d.n, el),
        claimBeerBook: el => G.claimBeerBook(el),
    });
}
