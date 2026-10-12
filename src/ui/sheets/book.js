// Le livre de la ferme : collection (et ses quarts), maîtrise, exploits, légende et album photo.
import { state } from '../../core/state.js';
import { fmt } from '../../core/format.js';
import { ITEMS } from '../../data/items.js';
import { SEASONS, EVENTS } from '../../data/world.js';
import { ACH_REWARDS, MEDALS, MAX_LEVEL, BOOK_QUARTERS, MASTERY_NAMES } from '../../data/progress.js';
import { ACHIEVEMENTS } from '../../data/meta.js';
import * as G from '../../systems/index.js';
import { actions } from '../dom.js';
import { ico, art, qStar, SPR } from '../icons.js';
import { btn, bar, segmented } from '../kit.js';
import { defineSheet, sheetOpts } from '../sheets.js';

const COIN = () => ico(['ui', 'coin']);
const medals = n => `<span class="medals">${MEDALS.map((m, k) => `<i class="ico">${art('ui', k < n ? m : 'medalOff')}</i>`).join('')}</span>`;

// ---------------- collection ----------------
function quarters() {
    const p = G.bookProgress(),
        got = state.bookQuarters || [];
    return `<div class="card book-quarters"><div class="bq-head"><b>Tout le livre : ${p.found} / ${p.total}</b><span>${Math.floor((p.found / p.total) * 100)} %</span></div>${bar(p.found / p.total)}
        <div class="tiers-row">${BOOK_QUARTERS.map((q, k) =>
            got[k]
                ? `<span class="stier done">${ico(['ui', 'check'])}</span>`
                : G.quarterReady(k)
                  ? btn(`${q * 100} %`, { act: 'quarter', data: { k }, kind: 'gold', size: 'sm' })
                  : `<span class="stier">${q * 100} %</span>`,
        ).join('')}</div>
        <div class="card-sub">À chaque quart : des pièces et des matériaux rares. Livre complet : le Livre d’or et 1 ruban.</div></div>`;
}

function collection(o) {
    const page = G.BOOK.find(p => p.id === o.page) || G.BOOK[0],
        list = page.entries();
    const found = G.pageFound(page);
    const tabs = `<div class="chips-row">${G.BOOK.map(p => `<button class="pick-chip${p.id === page.id ? ' on' : ''}" data-act="bookPage" data-p="${p.id}">${p.name}<small>${G.pageFound(p)}/${p.entries().length}</small></button>`).join('')}</div>`;
    const grid = list
        .map(e => {
            const c = state.collection[e.key];
            return `<div class="entry${c ? '' : ' unknown'}"><span class="entry-ico">${art(e.icon[0], e.icon[1])}${c && e.star ? qStar(2, 'entry-star') : ''}</span>
            <b>${c ? e.name : '???'}</b><small>${c ? (e.fish ? `Record : ${(c.best || 0).toString().replace('.', ',')} kg` : `×${fmt(c.n)}`) : e.hint}</small></div>`;
        })
        .join('');
    const done = found === list.length,
        claimed = state.pagesDone[page.id];
    const foot = claimed
        ? '<p class="card-sub center">Page complétée, bravo !</p>'
        : `${bar(found / list.length)}<p class="card-sub center">${found} / ${list.length} · Page complète : ${fmt(G.pageReward())} pièces et 1 ruban</p>${btn('Réclamer la page', { act: 'claimPage', data: { p: page.id }, kind: done ? 'gold' : '', wide: true, disabled: !done })}`;
    return [
        ['q', quarters()],
        ['tabs', tabs],
        ['grid', `<div class="book-grid">${grid}</div>`],
        ['foot', foot],
    ];
}

// ---------------- maîtrise ----------------
function mastery() {
    const known = G.masteryKnown();
    if (!known.length) return '<p class="empty">Produisez pour commencer à maîtriser vos produits.</p>';
    const gold = G.goldMasteries();
    return `<p class="card-sub center">Chaque étoile : +5 % sur le prix du produit. L’or le rend aussi 15 % plus rapide à produire. ${gold} produit${gold > 1 ? 's' : ''} en or.</p>
        <div class="list">${known
            .map(id => {
                const sv = G.masteryStars(id),
                    t = G.nextTier(id),
                    n = G.masteryCount(id);
                return `<div class="mrow">${ico(['item', id], 'ico big')}<div class="card-main"><div class="pname">${ITEMS[id].name}${medals(sv)}</div>
                ${sv >= 3 ? `<div class="card-sub">Maîtrise complète · ${fmt(n)} produits</div>` : `${bar(n / t)}<div class="card-sub">${fmt(n)} / ${fmt(t)} pour l’étoile ${MASTERY_NAMES[sv]}</div>`}</div></div>`;
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
        <p class="card-sub center">Renommée : ${r} étoile${r > 1 ? 's' : ''}${state.level >= MAX_LEVEL ? '' : ` · au niveau ${MAX_LEVEL}, l’expérience se transforme en étoiles de renommée`}. Ligue actuelle : ${G.leagueName(G.leagueOf()).toLowerCase()}.</p></div>`;
}

// ---------------- album ----------------
export const photoArt = ph =>
    ph.kind === 'building' ? SPR.building(ph.id, 2) : ph.kind === 'house' ? SPR.farmhouse(+ph.id) : ph.kind === 'item' ? SPR.item(ph.id) : ph.kind === 'villager' ? SPR.villager(ph.id) : SPR.ui(ph.id);

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
        o.page = o.page || 'garden';
        if (!o.sec) o.sec = G.claimableCount() ? 'exploits' : G.legendReady() ? 'legend' : 'collection';
    },
    render(o) {
        const seg = segmented(
            SECTIONS.map(([id, name, icon]) => [id, name, icon, badge(id)]),
            o.sec,
            'bookSec',
        );
        const body = o.sec === 'collection' ? collection(o) : o.sec === 'mastery' ? [['m', mastery()]] : o.sec === 'exploits' ? exploits() : o.sec === 'legend' ? [['l', legend()]] : [['a', album()]];
        return [['seg', `<div class="book-seg">${seg}</div>`], ...body.map(([k, h]) => [o.sec + k, h])];
    },
});

export function setupBook() {
    const o = () => sheetOpts('book');
    actions({
        bookSec: (el, d) => (o().sec = d.v),
        bookPage: (el, d) => (o().page = d.p),
        claimPage: (el, d) => G.claimPage(d.p, el),
        quarter: (el, d) => G.claimQuarter(+d.k, el),
        claimAch: (el, d) => G.claimAchievement(d.id, el),
        claimLegend: el => G.claimLegend(el),
    });
}
