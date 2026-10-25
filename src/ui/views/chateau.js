// Le château de Margaux (1.37), vu depuis la cave : réputation, boutique et visiteurs, concours, mise en cuvée et vente en primeur.
import { state } from '../../core/state.js';
import { now } from '../../core/clock.js';
import { fmt, formatDuration } from '../../core/format.js';
import { ITEMS } from '../../data/items.js';
import { CHATEAU_CLASSES, REP_MAX, PRIMEUR, CONTEST } from '../../data/chateau.js';
import * as G from '../../systems/index.js';
import { actions } from '../dom.js';
import { ico } from '../icons.js';
import { btn, section } from '../kit.js';
import { defineSheet, closeSheet, sheetOpts } from '../sheets.js';

const COIN = () => ico(['ui', 'coin']);
const stars = n => Array.from({ length: REP_MAX }, (_, k) => ico(['ui', 'star'], k < n ? 'ico sm' : 'ico sm dim')).join('');

// ---------------- sur une carte de lot ----------------
export const classTag = l => (l.cl ? ` · ${CHATEAU_CLASSES[l.cl].name.toLowerCase()}` : '') + (l.md ? ` · ${CONTEST.medals[l.md].name.toLowerCase()}` : '');
export const lotChateauTag = lot => (lot.cuv ? `<div class="cs-cuvee">${ico(['ui', 'star'], 'ico sm')} Cuvée du château</div>` : lot.pr ? '' : '');
export const primeurTag = lot =>
    lot.pr
        ? `<div class="cs-cuvee">${ico(['ui', 'coin'], 'ico sm')} Vendu en primeur (${G.className(lot.pr.r) || ['', '', 'rang 2', 'rang 3', 'légendaire'][lot.pr.r]}) : ${fmt(lot.pr.paid)}</div>`
        : '';
export const lotChateauActions = (lot, i) =>
    (G.canCuvee(lot)
        ? btn('En cuvée', {
              act: 'makeCuvee',
              data: { i },
              size: 'sm',
              kind: 'gold',
              icon: ['ui', 'star'],
              title: 'Octave goûtera et classera ce lot à sa sortie',
          })
        : '') + (G.canPrimeur(lot) ? btn('Primeur', { act: 'open', data: { sheet: 'primeur', slot: i }, size: 'sm', icon: ['ui', 'coin'] }) : '');
export const reserveChateauActions = l =>
    G.wineContestOpen() && l.cl && !l.md
        ? btn('Concours', { act: 'wineContest', data: { uid: l.uid }, size: 'sm', kind: 'gold', icon: ['ui', 'trophy'], disabled: G.wineContestDone() })
        : '';

// ---------------- la fiche du château, en haut de la cave ----------------
function guestRow(v) {
    const left = Math.max(0, v.until - now());
    const have = G.haveWine(v),
        pair = G.havePair(v);
    return `<div class="card guest-row"><div class="ico-stack">${ico(['item', v.wine], 'ico big')}</div><div class="card-main">
        <div class="card-title">${v.n} × ${ITEMS[v.wine].name}</div>
        <div class="card-sub">Cherche un accord avec : ${ITEMS[v.pair].name.toLowerCase()} · il reste ${formatDuration(left / 1000)}</div></div>
        <div class="card-side col">
        ${btn(`Servir ${fmt(G.visitorPrice(v, false))}`, { act: 'guestServe', data: { id: v.id }, size: 'sm', disabled: !have, icon: ['ui', 'coin'] })}
        ${btn(`Avec l’accord ${fmt(G.visitorPrice(v, true))}`, { act: 'guestServe', data: { id: v.id, pair: 1 }, size: 'sm', kind: 'gold', disabled: !have || !pair })}
        </div></div>`;
}

export function chateauCard() {
    if (!G.chateauOpen()) return null;
    const c = G.ensureChateau(),
        s = G.repStars(),
        nx = G.repNext();
    const sum = c.classes.reduce((a, b) => a + b, 0);
    const contest = G.wineContestOpen()
        ? `<div class="card-sub">Concours des vins : ${G.wineContestDone() ? `déjà joué ce mois-ci${c.contest.medal ? ` (${CONTEST.medals[c.contest.medal].name.toLowerCase()})` : ''}` : G.wineContestLots().length ? 'présentez une cuvée classée depuis la réserve' : 'il vous faut une cuvée classée en réserve'}</div>`
        : '';
    const guests = G.shopOpen()
        ? section('La boutique') +
          (c.vis.length
              ? `<div class="list">${c.vis.map(guestRow).join('')}</div>`
              : `<div class="card-sub">Pas de visiteur pour l’instant : un nouveau arrive environ toutes les ${formatDuration(G.visitEvery() / 1000)}.</div>`)
        : '';
    return `<div class="card chateau-card"><div class="card-head">${ico(['ui', 'star'], 'ico big')}<div class="card-main"><div class="card-title">Le château de Margaux</div>
        <div class="card-sub stars-row">${stars(s)}</div>
        <div class="card-sub">Réputation : ${c.rep}${nx ? ` / ${nx} pour l’étoile suivante` : ' (cinq étoiles)'} · ${sum} cuvée${sum > 1 ? 's' : ''} classée${sum > 1 ? 's' : ''}</div></div></div>
        ${CHATEAU_CLASSES.slice(1)
            .map((k, i) => `<span class="chip">${k.name} ×${c.classes[i + 1]}</span>`)
            .join(' ')}
        ${contest}${guests}</div>`;
}

// ---------------- la vente en primeur ----------------
defineSheet('primeur', {
    title: 'Vente en primeur',
    open(o) {
        const lot = state.cave.slots[+o.slot];
        o.r = lot ? G.primeurRanks(lot)[0] : 0;
    },
    render(o) {
        const lot = state.cave.slots[+o.slot];
        if (!lot || !G.canPrimeur(lot)) return '<p class="empty">Ce lot ne peut plus être vendu en primeur.</p>';
        const ranks = G.primeurRanks(lot),
            fam = G.caveFam(lot.id);
        if (!ranks.includes(o.r)) o.r = ranks[0];
        const cells = ranks
            .map(r => {
                const q = G.primeurAsk(+o.slot, r);
                return `<button class="pick-cell${o.r === r ? ' on' : ''}" data-act="primeurPick" data-r="${r}"><b>${fam.ranks[r]}</b><small>vaut ${fmt(q.est)} · payé ${fmt(q.paid)}</small></button>`;
            })
            .join('');
        const q = G.primeurAsk(+o.slot, o.r);
        return `<p class="card-sub center">Octave vous paie ${Math.round(PRIMEUR.frac * 100)} % de la valeur promise, tout de suite. Le lot reste en cave. S’il atteint « ${fam.ranks[o.r]} », l’acheteur ajoute ${Math.round(PRIMEUR.bonus * 100)} % ; sinon vous rendez ce qui dépasse ${Math.round(PRIMEUR.frac * 100)} % de sa valeur réelle.</p>
        <div class="pick-grid">${cells}</div>
        <p class="card-sub center">Vous recevez ${fmt(q.paid)}${COIN()} maintenant, bonus ${fmt(Math.round(q.est * PRIMEUR.bonus))}${COIN()} si la promesse est tenue.</p>`;
    },
    foot: o => btn('Vendre en primeur', { act: 'primeurGo', kind: 'green', wide: true, size: 'lg' }),
});

export function setupChateau() {
    actions({
        makeCuvee: (el, d) => G.cuveeLot(+d.i),
        primeurPick: (el, d) => (sheetOpts('primeur').r = +d.r),
        primeurGo: el => {
            const o = sheetOpts('primeur');
            if (G.primeurDo(+o.slot, o.r, el)) closeSheet('primeur');
        },
        guestServe: (el, d) => G.guestServe(+d.id, !!d.pair, el),
        wineContest: (el, d) => G.contestDo(+d.uid, el),
    });
}
