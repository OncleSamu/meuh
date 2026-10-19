// Le livre de la ferme : collection (et ses quarts), maîtrise, exploits, légende et album photo.
import { state } from '../../core/state.js';
import { fmt } from '../../core/format.js';
import { ITEMS } from '../../data/items.js';
import { SEASONS, EVENTS } from '../../data/world.js';
import { ACH_REWARDS, MEDALS, MAX_LEVEL, BOOK_QUARTERS, MASTERY_NAMES, MASTERY_EXTRA_NAMES as EXTRA_NAMES } from '../../data/progress.js';
import { ACHIEVEMENTS } from '../../data/meta.js';
import * as G from '../../systems/index.js';
import { actions, esc } from '../dom.js';
import { ico, art, qStar, SPR } from '../icons.js';
import { btn, bar, segmented, empty } from '../kit.js';
import { defineSheet, sheetOpts } from '../sheets.js';

const COIN = () => ico(['ui', 'coin']);
const medals = n => `<span class="medals">${MEDALS.map((m, k) => `<i class="ico">${art('ui', k < n ? m : 'medalOff')}</i>`).join('')}</span>`;

// ---------------- collection ----------------
function quarters() {
    const p = G.bookProgress(),
        got = state.bookQuarters || [];
    return `<div class="card book-quarters"><div class="bq-head"><b>Tout le livre : ${p.found} / ${p.total}</b><span>${Math.floor((p.found / p.total) * 100)} %</span></div>${bar(p.found / p.total)}
        <div class="tiers-row">${BOOK_QUARTERS.map((q, k) =>
            got[k]
                ? `<span class="stier done">${ico(['ui', 'check'])}</span>`
                : G.quarterReady(k)
                  ? btn(`${q * 100} %`, { act: 'quarter', data: { k }, kind: 'gold', size: 'sm' })
                  : `<span class="stier">${q * 100} %</span>`,
        ).join('')}</div>
        <div class="card-sub">À chaque quart : des pièces et des matériaux rares. Livre complet : le Livre d’or et 1 ruban.</div></div>`;
}

const pct = q => `${Math.round(q * 100)} %`;
const dots = e => {
    if (!(e.kind === 'item' && e.id)) return '';
    const q = state.qmade[e.id] || { s: 0, g: 0 };
    return `<span class="bk-dots"><i class="b"></i><i class="${q.s ? 's' : ''}"></i><i class="${q.g ? 'g' : ''}"></i></span>`;
};
const starsOf = n => (n ? `<span class="bk-star">${'★'.repeat(n)}${'☆'.repeat(Math.max(0, 3 - n))}</span>` : '');

// l'étagère : une carte par page, avec ses quatre paliers
function shelf() {
    const cards = G.BOOK.map(p => {
        const n = G.pageCount(p),
            tot = p.abs ? p.abs[3] : p.entries().length;
        const got = [0, 1, 2].map(k => (state.bookTiers[p.id] || [])[k]);
        got[3] = state.pagesDone[p.id];
        const pips = [0, 1, 2, 3]
            .map(
                k =>
                    `<span class="${got[k] ? 'on' : (k < 3 ? G.pageTierReady(p, k) : G.pageDone(p)) ? 'rdy' : ''}">${got[k] ? '✓' : p.abs ? G.pageGoal(p, k) : pct(BOOK_QUARTERS[k]).replace(' %', '')}</span>`,
            )
            .join('');
        const rdy = G.pageReadyCount(p);
        return `<button class="bk-pg" data-act="bookPage" data-p="${p.id}">${rdy ? `<span class="bk-new">${rdy}</span>` : ''}<div class="top">${ico(p.icon, 'ico big')}<div><b>${p.name}</b><small>${fmt(n)} / ${fmt(tot)}</small></div></div>${bar(Math.min(1, n / tot))}<div class="bk-pips">${pips}</div></button>`;
    }).join('');
    return `<div class="bk-shelf">${cards}</div><p class="card-sub center">Touchez une page pour l’ouvrir. Chaque page a quatre paliers : le dernier donne 1 ruban.</p>`;
}

function pageView(page) {
    const list = page.entries(),
        n = G.pageCount(page),
        tot = page.abs ? page.abs[3] : list.length;
    const ladder = [0, 1, 2, 3]
        .map(k => {
            const r = k < 3 ? G.pageTierReward(k) : null;
            const got = k < 3 ? (state.bookTiers[page.id] || [])[k] : state.pagesDone[page.id];
            const ready = k < 3 ? G.pageTierReady(page, k) : G.pageDone(page) && !got;
            const lab = page.abs ? `${G.pageGoal(page, k)} ${page.unit || ''}${G.pageGoal(page, k) > 1 ? 's' : ''}` : pct(BOOK_QUARTERS[k]);
            const rew = k < 3 ? `${fmt(r.coins)}${r.item ? ` + ${r.item[1]} ${ITEMS[r.item[0]].name.toLowerCase()}` : ''}` : `${fmt(G.pageReward())} + 1 ruban`;
            const action = ready
                ? btn('Réclamer', { act: k < 3 ? 'bookTier' : 'claimPage', data: k < 3 ? { p: page.id, k } : { p: page.id }, kind: 'gold', size: 'sm' })
                : '';
            return `<div class="${got ? 'on' : ready ? 'rdy' : ''}"><b>${got ? '✓ ' : ''}${lab}</b><em>${rew}</em>${action}</div>`;
        })
        .join('');
    const head = `<div class="bk-head"><h3>${page.name} <small>${fmt(n)} / ${fmt(tot)}</small></h3>${bar(Math.min(1, n / tot))}<div class="bk-ladder">${ladder}</div></div>`;
    const empty =
        page.dyn && !list.length
            ? `<p class="card-sub center">${page.id === 'varieties' ? 'Croisez des plantes au labo : chaque variété créée a sa fiche ici.' : page.id === 'beers' ? 'Brassez une bière à la brasserie : elle aura sa fiche ici.' : 'Fixez une race à la station : elle aura sa fiche ici.'}</p>`
            : '';
    // les entrées encore inconnues : les 9 premières seulement, le reste est compté
    let shownUnknown = 0,
        hidden = 0;
    const grid = list
        .map(e => {
            const f = G.isFound(e),
                c = state.collection[e.key];
            if (!f && ++shownUnknown > 9) {
                hidden++;
                return '';
            }
            if (!f) return `<div class="entry unknown"><span class="entry-ico">${art(e.icon[0], e.icon[1])}</span><b>???</b><small>${e.hint}</small></div>`;
            const sub = e.fish
                ? `Record : ${((c && c.best) || 0).toString().replace('.', ',')} kg`
                : e.kind === 'beer'
                  ? ''
                  : e.kind === 'variety'
                    ? e.star
                        ? 'Fixée'
                        : 'Pas fixée'
                    : c
                      ? `×${fmt(c.n)}`
                      : '';
            const bs = e.kind === 'beer' && state.brew && state.brew.beers[e.id] ? state.brew.beers[e.id].stars : 0;
            return `<button class="entry" data-act="open" data-sheet="bookEntry" data-key="${e.key}"><span class="entry-ico">${art(e.icon[0], e.icon[1])}${f && e.star && e.kind !== 'variety' ? qStar(2, 'entry-star') : ''}</span><b>${esc(e.name)}</b>${starsOf(bs)}<small>${sub}</small>${dots(e)}</button>`;
        })
        .join('');
    return `<button class="bk-back" data-act="bookBack">‹ Toutes les pages</button>${head}${empty}<div class="book-grid">${grid}</div>${hidden ? `<p class="card-sub center">… et ${hidden} autre${hidden > 1 ? 's' : ''} à découvrir.</p>` : ''}`;
}

function collection(o) {
    const page = G.BOOK.find(p => p.id === o.page);
    return page
        ? [['p', pageView(page)]]
        : [
              ['q', quarters()],
              ['shelf', shelf()],
          ];
}

// la fiche d'une entrée
defineSheet('bookEntry', {
    title: o => {
        const i = G.entryInfo(o.key);
        return i ? i.e.name : 'Fiche';
    },
    render(o) {
        const i = G.entryInfo(o.key);
        if (!i) return empty('Cette page n’existe plus.');
        const e = i.e;
        const cnt = i.counters
            ? `<div class="bk-cnt">${i.counters.map((c, k) => `<div class="${k === 1 ? 's' : k === 2 ? 'g' : ''}"><b>${fmt(c[1])}</b><small>${c[0].toUpperCase()}</small></div>`).join('')}</div>`
            : '';
        const lines = i.lines.map(([l, v]) => `<div class="bk-line"><span>${l}</span><span>${esc(String(v))}</span></div>`).join('');
        const mamie = i.anecdote
            ? `<div class="bk-odette">${art('villager', 'odette')}<p>${i.locked ? esc(i.anecdote) : `« ${esc(i.anecdote)} »`}<br><small>Page de Mamie Odette</small></p></div>`
            : '';
        return `<div class="bk-fiche">${art(e.icon[0], e.icon[1])}<h3>${esc(e.name)}</h3>${starsOf(i.stars)}${i.found ? '' : `<p class="card-sub">${e.hint}</p>`}${cnt}${lines}${mamie}</div>`;
    },
});

// ---------------- maîtrise ----------------
function mastery() {
    const known = G.masteryKnown();
    if (!known.length) return '<p class="empty">Produisez pour commencer à maîtriser vos produits.</p>';
    const gold = G.goldMasteries();
    return `<p class="card-sub center">Chaque étoile : +5 % sur le prix du produit. L’or le rend aussi 15 % plus rapide à produire. Au-delà, les rangs platine et diamant font moins baisser la demande au marché. ${gold} produit${gold > 1 ? 's' : ''} en or.</p>
        <div class="list">${known
            .map(id => {
                const sv = G.masteryStars(id),
                    t = G.nextTier(id),
                    n = G.masteryCount(id);
                return `<div class="mrow">${ico(['item', id], 'ico big')}<div class="card-main"><div class="pname">${ITEMS[id].name}${medals(sv)}</div>
                ${sv >= 3 ? (G.nextExtra(id) ? `${bar(n / G.nextExtra(id))}<div class="card-sub">${fmt(n)} / ${fmt(G.nextExtra(id))} pour le rang ${EXTRA_NAMES[G.masteryExtra(id)]}${G.masteryExtra(id) ? ` · rang ${EXTRA_NAMES[G.masteryExtra(id) - 1]} atteint` : ''}</div>` : `<div class="card-sub">Rang diamant · ${fmt(n)} produits</div>`) : `${bar(n / t)}<div class="card-sub">${fmt(n)} / ${fmt(t)} pour l’étoile ${MASTERY_NAMES[sv]}</div>`}</div></div>`;
            })
            .join('')}</div>`;
}

// ---------------- exploits : trophées et succès ----------------
function exploits() {
    const shelf = `<div class="trophy-shelf">${SEASONS.map(sv => {
        const n = state.trophies[sv.id] || 0;
        return `<div class="trophy-slot${n ? '' : ' empty'}"><span class="t-ico">${art('ui', 'trophy')}<span class="t-season">${art('ui', sv.icon)}</span></span><small>${EVENTS[sv.id].name}</small><b>${n ? '×' + n : '—'}</b></div>`;
    }).join('')}</div>`;
    const achs = ACHIEVEMENTS.map(a => {
        const done = G.achClaimed(a),
            val = state.stats[a.id] || 0;
        const max = done >= 3,
            target = a.tiers[Math.min(done, 2)];
        const can = G.achClaimable(a);
        const r = ACH_REWARDS[Math.min(done, 2)];
        return `<div class="card ach${can ? ' can' : ''}">${ico(a.icon, 'ico big')}
            <div class="card-main"><div class="card-title">${a.name}${medals(done)}</div>
            <div class="card-sub">${max ? 'Tous les paliers sont atteints.' : G.achDesc(a, target)}</div>
            ${max ? '' : `${bar(val / target)}<div class="card-sub">${fmt(Math.min(val, target))} / ${fmt(target)}</div>`}</div>
            ${max ? '' : `<div class="card-side col"><span class="reward">${fmt(r.coins)}${COIN()}</span>${r.ruban ? `<span class="reward">+1${ico(['ui', 'ribbon'])}</span>` : ''}${btn('Réclamer', { act: 'claimAch', data: { id: a.id }, kind: can ? 'gold' : '', size: 'sm', disabled: !can })}</div>`}</div>`;
    }).join('');
    return [
        ['shelf', shelf],
        ['achs', `<div class="list">${achs}</div>`],
    ];
}

// ---------------- légende ----------------
function legend() {
    const done = state.legend,
        goals = G.legendGoals();
    const r = state.renown || 0;
    return `<div class="card legend-card${done ? ' done' : ''}"><div class="legend-art">${art('ui', 'goldCow')}</div>
        <div class="card-title center">${done ? 'Votre ferme est légendaire' : 'Devenir une Ferme légendaire'}</div>
        <p class="card-sub center">${done ? 'Le canton entier connaît votre nom. La vache dorée veille sur vos champs.' : 'Le grand but de Meuh. Réussissez ces cinq exploits pour recevoir la vache dorée, 10 rubans et le titre pour toujours.'}</p>
        <div class="lgoals">${goals.map(g => `<div class="lgoal${g.ok ? ' ok' : ''}">${ico(['ui', g.ok ? 'check' : 'medalOff'])}<span>${g.name}</span><small>${g.v}</small></div>`).join('')}</div>
        ${done ? '' : btn('Devenir légendaire', { act: 'claimLegend', kind: G.legendReady() ? 'gold' : '', wide: true, disabled: !G.legendReady() })}
        <p class="card-sub center">Renommée : ${r} étoile${r > 1 ? 's' : ''}${state.level >= MAX_LEVEL ? '' : ` · au niveau ${MAX_LEVEL}, l’expérience se transforme en étoiles de renommée`}. Ligue actuelle : ${G.leagueName(G.leagueOf()).toLowerCase()}.</p></div>`;
}

// ---------------- album ----------------
export const photoArt = ph =>
    ph.kind === 'building'
        ? SPR.building(ph.id, 2)
        : ph.kind === 'house'
          ? SPR.farmhouse(+ph.id)
          : ph.kind === 'item'
            ? SPR.item(ph.id)
            : ph.kind === 'villager'
              ? SPR.villager(ph.id)
              : SPR.ui(ph.id);

function album() {
    const list = state.album || [];
    const card = btn('Une carte postale de la ferme', { act: 'open', data: { sheet: 'postcard' }, kind: 'gold', wide: true, icon: ['ui', 'camera'] });
    if (!list.length) return card + '<p class="empty">Les grands moments de votre ferme (chantiers, niveaux, concours…) apparaîtront ici en photo.</p>';
    return `${card}<p class="card-sub center">${list.length} souvenir${list.length > 1 ? 's' : ''}. Touchez une photo pour la regarder ou la partager.</p>
        <div class="album">${list
            .map(
                (ph, k) =>
                    `<button class="polaroid" data-act="open" data-sheet="photo" data-k="${k}" style="--r:${((k * 37) % 7) - 3}deg"><span class="ph-art" style="background:${G.PHOTO_BG[ph.season] || '#fff'}">${photoArt(ph)}</span><b>${ph.title}</b><small>Jour ${ph.day}</small></button>`,
            )
            .join('')}</div>`;
}

const SECTIONS = [
    ['collection', 'Collection', ['ui', 'book']],
    ['mastery', 'Maîtrise', ['ui', 'medalG']],
    ['exploits', 'Exploits', ['ui', 'trophy']],
    ['legend', 'Légende', ['ui', 'goldCow']],
    ['album', 'Album', ['ui', 'camera']],
];
const badge = id =>
    id === 'collection' ? G.bookClaimable() + G.quartersClaimable() : id === 'exploits' ? G.claimableCount() : id === 'legend' ? (G.legendReady() ? 1 : 0) : 0;

defineSheet('book', {
    cls: 'book-sheet',
    title: 'Livre de la ferme',
    open(o) {
        G.syncBook();
        if (!o.sec) o.sec = G.claimableCount() ? 'exploits' : G.legendReady() ? 'legend' : 'collection';
    },
    render(o) {
        const seg = segmented(
            SECTIONS.map(([id, name, icon]) => [id, name, icon, badge(id)]),
            o.sec,
            'bookSec',
        );
        const body =
            o.sec === 'collection'
                ? collection(o)
                : o.sec === 'mastery'
                  ? [['m', mastery()]]
                  : o.sec === 'exploits'
                    ? exploits()
                    : o.sec === 'legend'
                      ? [['l', legend()]]
                      : [['a', album()]];
        return [['seg', `<div class="book-seg">${seg}</div>`], ...body.map(([k, h]) => [o.sec + k, h])];
    },
});

export function setupBook() {
    const o = () => sheetOpts('book');
    actions({
        bookSec: (el, d) => (o().sec = d.v),
        bookPage: (el, d) => (o().page = d.p),
        bookBack: () => (o().page = null),
        bookTier: (el, d) => G.claimPageTier(d.p, +d.k, el),
        claimPage: (el, d) => G.claimPage(d.p, el),
        quarter: (el, d) => G.claimQuarter(+d.k, el),
        claimAch: (el, d) => G.claimAchievement(d.id, el),
        claimLegend: el => G.claimLegend(el),
    });
}
