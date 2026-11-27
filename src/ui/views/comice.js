// Animaux | Comice 2.0 (1.179) : Concours express quotidiens, Grand Comice de la semaine
// (préparation tactique, brossage & Parade du Jury), Boutique des Cocardes et Palmarès à paliers.

import { state } from '../../core/state.js';
import { fmt, formatDuration } from '../../core/format.js';
import { sfx, buzz } from '../../core/bus.js';
import {
    COMICE,
    COMICE_CAT,
    COMICE_PREPS,
    COMICE_PREP_IDS,
    COMICE_PALM_TIERS,
    COMICE_SHOP,
} from '../../data/elevage.js';
import { ANIMALS } from '../../data/animals.js';
import * as G from '../../systems/index.js';
import { blocks, actions, esc } from '../dom.js';
import { ico, art } from '../icons.js';
import { btn, bar, hint, timer, empty } from '../kit.js';
import { defineView, refresh, ui } from '../app.js';
import { defineSheet, openSheet, closeSheet } from '../sheets.js';
import { genWrap, animalKey } from '../genlook.js';
import { reduceMotion } from '../fx.js';
import { innerTabs } from '../innertabs.js';

const COIN = () => ico(['ui', 'coin']);
const PARTS = [
    ['genes', 'Gènes'],
    ['beauty', 'Beauté'],
    ['hearts', 'Cœurs'],
    ['show', 'Présentation'],
];
const partsLine = p => PARTS.map(([k, n]) => `${n} ${p[k]}/${COMICE.w[k]}`).join(' · ');
const HUES = [
    '',
    'sepia(.5) saturate(1.5) hue-rotate(-15deg)',
    'brightness(1.12) saturate(.6)',
    'sepia(.35) hue-rotate(10deg)',
    'grayscale(.4) brightness(1.05)',
    'sepia(.6) saturate(2) hue-rotate(-30deg) brightness(.92)',
];
const beastArt = a => genWrap(art('animal', animalKey(a.type, a.g)), a.g);
const MEDAL = ['', 'medalG', 'medalS', 'medalB'];

// ---------------- Barres de note ----------------
function partBars(parts, jury) {
    return `<div class="cm-bars">${PARTS.map(
        ([k, n]) =>
            `<div class="cm-bar${k === jury ? ' jury' : ''}"><span>${n}</span><i><u style="width:${Math.min(100, Math.round(((parts ? parts[k] : 0) / COMICE.w[k]) * 100))}%"></u></i><b>${parts ? parts[k] : 0}</b></div>`,
    ).join('')}</div>`;
}

// ---------------- 1. Onglet Express du jour (3 épreuves / jour, jugement immédiat) ----------------
function expressHtml() {
    const list = G.comiceExpressList();
    if (!list.length || list.every(ev => !ev.type)) {
        return empty('Il vous faut au moins une bête adulte au pré pour participer aux concours cantonaux express.');
    }
    return `${hint('3 concours cantonaux par jour, jugement immédiat ! Gagnez pièces, réputation et Cocardes — une 1re place à ≥ 75/100 décerne même la plaque « Primée » !')}<div class="list">${list
        .map(ev => {
            if (!ev.type) return '';
            const cands = G.comiceExpressCandidates(ev.idx);
            const selKey = 'ce:' + ev.idx;
            const chosenUid = cands.some(x => x.id === ui.sel[selKey]) ? ui.sel[selKey] : cands[0] ? cands[0].id : null;
            const chosen = cands.find(x => x.id === chosenUid) || null;
            if (ev.done && ev.result) {
                const r = ev.result;
                return `<div class="card com2-exp done${r.rank === 1 ? ' win' : ''}">
                    <div class="com2-exp-top">
                        <span class="com2-ico">${art('animal', ev.type)}</span>
                        <div class="card-main">
                            <div class="card-title">${esc(COMICE_CAT[ev.type] || ev.type)} · ${esc(ev.themeName)}</div>
                            <div class="card-sub">${r.rank <= 3 ? ico(['ui', MEDAL[r.rank]]) : ''} <b>${r.rank}${r.rank === 1 ? 're' : 'e'} place</b> avec ${esc(r.animalName)} (${r.score}/100)</div>
                            <div class="card-sub">+${fmt(r.coins)}${COIN()} · +${r.cocardes} cocarde${r.cocardes > 1 ? 's' : ''}${r.rep ? ` · +${r.rep} rép.` : ''}${r.gotPrize ? ' · <span class="chip ok">Plaque Primée !</span>' : ''}</div>
                        </div>
                        <span class="chip ok">Terminée</span>
                    </div>
                </div>`;
            }
            return `<div class="card com2-exp">
                <div class="com2-exp-top">
                    <span class="com2-ico">${chosen ? beastArt(chosen.a) : art('animal', ev.type)}</span>
                    <div class="card-main">
                        <div class="card-title">${esc(COMICE_CAT[ev.type] || ev.type)} <span class="chip">${esc(ev.themeName)}</span></div>
                        <div class="card-sub">${esc(ev.themeDesc)}</div>
                        ${
                            chosen
                                ? `<div class="card-sub">Candidate : <b>${esc(chosen.name)}</b> (~${chosen.score}/100 avant Parade)</div>`
                                : '<div class="card-sub">Aucune bête adulte disponible pour cette espèce.</div>'
                        }
                    </div>
                </div>
                <div class="com2-exp-btns">
                    ${cands.length > 1 ? btn('Changer', { act: 'comiceExpPick', data: { idx: ev.idx }, size: 'sm' }) : ''}
                    ${btn('Parade du Jury', { act: 'comiceExpParade', data: { idx: ev.idx, uid: chosenUid || '' }, kind: 'gold', size: 'sm', icon: ['ui', 'sparkle'], disabled: !chosen })}
                    ${btn('Jugement direct', { act: 'comiceExpGo', data: { idx: ev.idx, uid: chosenUid || '' }, kind: 'green', size: 'sm', disabled: !chosen })}
                </div>
            </div>`;
        })
        .join('')}</div>`;
}

// ---------------- 2. Onglet Grand Comice de la semaine ----------------
function weekCatCard(cat) {
    const score = G.catScore(cat);
    const rank = G.catRank(cat);
    const entry = cat.entry ? G.comiceCandidates(cat.id).find(x => x.id === cat.entry) : null;
    const rows = [
        ...cat.rivals.map(r => ({ who: G.rivalName(r.k), name: r.name, hue: r.hue, score: r.score })),
        ...(score ? [{ who: 'Votre élevage', name: entry ? entry.name : '', score, me: true, a: entry && entry.a }] : []),
    ]
        .sort((a, b) => b.score - a.score || (a.me ? -1 : 1))
        .map(
            (r, k) =>
                `<li class="${r.me ? 'me' : ''}"><b>${k < 3 ? ico(['ui', MEDAL[k + 1]]) : k + 1}</b><span class="cm-mini" ${r.me ? '' : `style="filter:${HUES[r.hue || 0] || 'none'}"`}>${r.me && r.a ? beastArt(r.a) : art('animal', cat.id)}</span><span class="cm-who"><b>${esc(r.name || '')}</b><small>${esc(r.who)}</small></span><em>${r.score}</em></li>`,
        )
        .join('');
    const canB = G.canBrush(cat);
    const canP = G.canParade(cat);
    const pCost = G.prepCost();
    const stage = entry
        ? `<div class="cm-entrant">${beastArt(entry.a)}${rank && rank <= 3 ? `<span class="cm-medal">${ico(['ui', MEDAL[rank]])}</span>` : ''}<b>${esc(entry.name)}</b></div>`
        : `<button class="cm-entrant empty" data-act="comicePick" data-cat="${cat.id}" ${G.comiceCandidates(cat.id).length ? '' : 'disabled'}>${art('animal', cat.id)}<b>Choisir</b></button>`;

    const prepRow = entry
        ? `<div class="com2-preps">
            <span class="bc-label">Préparation tactique (${fmt(pCost)}${COIN()})</span>
            <div class="chips-row">${COMICE_PREP_IDS.map(pid => {
                const p = COMICE_PREPS[pid];
                const match = p.stat === cat.jury;
                return `<button class="pick-chip${cat.prep === pid ? ' on' : ''}" data-act="comicePrep" data-cat="${cat.id}" data-prep="${pid}" title="${esc(p.desc)}">${esc(p.name)}${match ? ' ★' : ''}</button>`;
            }).join('')}</div>
        </div>`
        : '';

    return `<div class="card comice-cat${rank === 1 ? ' lead' : ''}">
        <div class="cm-title"><span class="card-title">${G.catName(cat)}</span><span class="cm-jury">${ico(['ui', 'star'])}Le jury regarde surtout ${G.JURY[cat.jury] || ''}</span></div>
        <div class="cm-body">${stage}<div class="cm-side"><div class="comice-note"><b>${score || '—'}</b><small>${rank ? `${rank}${rank === 1 ? 're' : 'e'} place pour l’instant` : 'sur 100'}${entry && entry.paradePts ? ` (Parade +${entry.paradePts})` : ''}</small></div>${partBars(entry && entry.parts, cat.jury)}</div></div>
        ${prepRow}
        <div class="com2-act-btns">
            ${btn(cat.entry ? 'Changer de bête' : 'Inscrire', { act: 'comicePick', data: { cat: cat.id }, kind: cat.entry ? '' : 'gold', size: 'sm', disabled: !G.comiceCandidates(cat.id).length })}
            ${btn(cat.entry && !canB ? 'Brossée' : 'Brosser', { act: 'comiceBrush', data: { cat: cat.id }, kind: canB ? 'green' : '', size: 'sm', disabled: !canB, icon: ['ui', 'hBrosse'] })}
            ${btn(cat.entry && !canP ? 'Parade faite' : 'Parade (+10)', { act: 'comiceParade', data: { cat: cat.id }, kind: canP ? 'gold' : '', size: 'sm', disabled: !canP, icon: ['ui', 'sparkle'] })}
        </div>
        <ol class="cm-rank">${rows}</ol>
    </div>`;
}

function weekHtml(c) {
    if (!c.cats.length) return empty('Il faut des bêtes adultes pour concourir : le Comice tire ses catégories parmi vos espèces.');
    const curCatId = c.cats.some(x => x.id === ui.sel.comiceCat) ? ui.sel.comiceCat : (c.cats.find(x => !x.entry) || c.cats[0]).id;
    const cat = c.cats.find(x => x.id === curCatId) || c.cats[0];
    const seg = `<div class="com2-cats">${c.cats
        .map(x => `<button class="pick-chip${x.id === cat.id ? ' on' : ''}" data-act="comiceCat" data-cat="${x.id}">${art('animal', x.id)}<span>${esc(G.catName(x))}</span>${!x.entry ? '<i class="com2-dot"></i>' : ''}</button>`)
        .join('')}</div>`;
    return `${seg}${weekCatCard(cat)}`;
}

// ---------------- 3. Onglet Boutique des Cocardes ----------------
function shopHtml() {
    const coc = G.comiceCocardes();
    const hayMs = G.comiceGoldHayLeftMs();
    const elix = G.comiceElixirCount();
    const status =
        hayMs > 0 || elix > 0
            ? `<div class="card com2-buffs">${hayMs > 0 ? `<span class="chip ok">Foin d’or actif : ${formatDuration(Math.ceil(hayMs / 1000))} (+35 % vitesse prés)</span>` : ''}${elix > 0 ? `<span class="chip ok">Élixir de lignée prêt ×${elix}</span>` : ''}</div>`
            : '';
    return `${status}${hint('Échangez vos Cocardes gagnées aux épreuves Express et au Grand Comice contre des bonus exclusifs d’élevage.')}<div class="list">${COMICE_SHOP.map(item => {
        const can = coc >= item.cost;
        return `<div class="card com2-shop-row">
            <div class="card-art">${ico(item.icon, 'ico big')}</div>
            <div class="card-main">
                <div class="card-title">${esc(item.name)}</div>
                <div class="card-sub">${esc(item.desc)}</div>
            </div>
            <div class="card-side">
                ${btn(`${item.cost} coc.`, { act: item.needBeast ? 'comiceTreatOpen' : 'comiceBuy', data: { id: item.id }, kind: can ? 'gold' : '', size: 'sm', disabled: !can, icon: ['ui', 'ribbon'] })}
            </div>
        </div>`;
    }).join('')}</div>`;
}

// ---------------- 4. Onglet Palmarès & Pouvoirs Primée ----------------
function palmHtml(c) {
    const nWins = G.comiceWinSpeciesCount();
    const totals = G.comicePalmTotals();
    const types = [...new Set([...G.comiceTypes(), ...Object.keys(c.wins || {})])].filter(t => COMICE_CAT[t]);
    const powers = `<div class="card com2-powers">
        <div class="card-title">${ico(['ui', 'medalG'])} Pouvoirs permanents des bêtes Primées</div>
        <ul class="com2-plist">
            <li><b>+25 % vitesse</b> et <b>+18 % qualité</b> (Or → Diamant) sur ses propres produits.</li>
            <li><b>Aura de championne</b> : +10 % vitesse aux autres bêtes du même pré (jusqu’à +30 %).</li>
            <li><b>Lignée d’élite</b> : ses petits héritent de +1 trait garanti et +25 % de chances de robe rare.</li>
            <li><b>Prix doublé</b> si vous choisissez de la vendre à la foire aux bestiaux.</li>
        </ul>
    </div>`;

    const tiers = `<div class="card">
        <div class="card-title">Paliers permanents du Palmarès · ${nWins} espèce${nWins > 1 ? 's' : ''} primée${nWins > 1 ? 's' : ''}</div>
        <div class="card-sub">Bonus actifs en permanence (conservés au Prestige) : +${Math.round(totals.speed * 100)} % vitesse · +${Math.round(totals.qual * 100)} % qualité · +${Math.round(totals.rare * 100)} % robes rares.</div>
        ${bar(Math.min(1, nWins / COMICE_PALM_TIERS[COMICE_PALM_TIERS.length - 1].need))}
        <div class="com2-tiers">${COMICE_PALM_TIERS.map((t, i) => {
            const reached = nWins >= t.need;
            const claimed = !!(c.palmClaimed && c.palmClaimed[i]);
            return `<div class="com2-tier${claimed ? ' done' : reached ? ' ready' : ''}">
                <div class="com2-tmain"><b>${t.need} espèces · ${esc(t.name)}</b><small>${esc(t.desc)} (+${fmt(t.coins)} pièces)</small></div>
                <div class="com2-tside">${claimed ? '<span class="chip ok">Acquis</span>' : reached ? btn('Réclamer', { act: 'comicePalmClaim', data: { i }, kind: 'gold', size: 'sm' }) : `<span class="chip">${nWins}/${t.need}</span>`}</div>
            </div>`;
        }).join('')}</div>
    </div>`;

    const grid = types.length
        ? `<div class="card comice-palm"><div class="card-title">Espèces primées (${nWins}/${types.length})</div><div class="cm-palm">${types
              .map(t => `<span class="cm-cup${c.wins[t] ? ' won' : ''}">${art('animal', t)}${c.wins[t] ? `<i>${ico(['ui', 'ribbon'])}×${c.wins[t]}</i>` : '<i>—</i>'}</span>`)
              .join('')}</div></div>`
        : '';

    const last =
        c.last && c.last.lines.length
            ? `<div class="card comice-last"><div class="card-title">Dernier Grand Comice</div>${c.last.lines.map(([i, t]) => `<p class="card-sub">${ico(i)} ${t}</p>`).join('')}</div>`
            : '';

    return powers + tiers + grid + last;
}

// ---------------- Vue principale (4 onglets) ----------------
function renderComice(el) {
    if (!G.comiceOpen()) {
        return blocks(el, [
            [
                'closed',
                `<div class="card island-closed"><div class="card-title">Le Comice agricole</div><p class="card-sub">Au niveau ${COMICE.lvl}, participez aux concours express quotidiens et au Grand Comice pour primer vos bêtes, gagner des Cocardes et booster tous vos prés.</p></div>`,
            ],
        ]);
    }
    G.comiceTick();
    const c = G.ensureComice();
    const expLeft = G.comiceExpressLeft();
    const weekTodo = c.cats.filter(cat => (!cat.entry && G.comiceCandidates(cat.id).length) || G.canBrush(cat)).length;
    const palmRdy = G.comicePalmClaimable();
    const hayMs = G.comiceGoldHayLeftMs();

    const head = `<div class="card comice-head"><div class="cm-bunting"></div>
        <div class="cm-headrow">
            <span class="offer-art">${art('ui', 'ribbon')}</span>
            <div class="card-main">
                <div class="card-title">Le Comice agricole</div>
                <div class="card-sub">Grand Comice dans ${timer(G.comiceEnd())}${G.comiceHall() ? ' · Grand hall (prix ×2)' : ''}</div>
            </div>
            <span class="com2-coc">${ico(['ui', 'ribbon'])}<b>${G.comiceCocardes()}</b><small>cocardes</small></span>
        </div>
        ${hayMs > 0 ? `<div class="com2-head-buff">Foin d’or actif : +35 % sur tous les prés (${formatDuration(Math.ceil(hayMs / 1000))})</div>` : ''}
    </div>`;

    const T = innerTabs(
        'comice2',
        [
            ['express', 'Express', null, expLeft],
            ['week', 'Grand Comice', null, weekTodo],
            ['shop', 'Boutique', null, 0],
            ['palm', 'Palmarès', null, palmRdy],
        ],
        'express',
    );
    const t = T.cur;
    blocks(el, [
        ['head', head],
        ['tabs', T.html],
        ['express', t === 'express' ? expressHtml() : ''],
        ['week', t === 'week' ? weekHtml(c) : ''],
        ['shop', t === 'shop' ? shopHtml() : ''],
        ['palm', t === 'palm' ? palmHtml(c) : ''],
    ]);
}
defineView('animals/comice', renderComice);

// ---------------- Feuilles de sélection ----------------
defineSheet('comicePick', {
    title: o => `Inscrire : ${G.catName(G.catOf(o.cat) || { id: o.cat })}`,
    render(o) {
        const cat = G.catOf(o.cat);
        if (!cat) return '<p class="empty">Cette catégorie est terminée.</p>';
        const list = G.comiceCandidates(o.cat);
        if (!list.length) return '<p class="empty">Aucun candidat pour l’instant.</p>';
        return `<div class="list">${list
            .slice(0, 30)
            .map(
                x =>
                    `<button class="row comice-pick${cat.entry === x.id ? ' on' : ''}" data-act="comiceIn" data-cat="${o.cat}" data-who="${x.id}"><span class="offer-art">${beastArt(x.a)}</span><span class="row-main"><span>${esc(x.name)}${x.a.prize ? ' ★' : ''}</span><small>${partsLine(x.parts)}</small></span><b class="comice-score">${x.score}</b></button>`,
            )
            .join('')}</div><p class="card-sub center">Les meilleurs d’abord. La présentation et la Parade comptent en plus.</p>`;
    },
});

defineSheet('comiceExpPick', {
    title: 'Choisir la candidate',
    render(o) {
        const list = G.comiceExpressCandidates(+o.idx);
        if (!list.length) return empty('Aucune bête disponible.');
        return `<div class="list">${list
            .slice(0, 30)
            .map(
                x =>
                    `<button class="row comice-pick" data-act="comiceExpSet" data-idx="${o.idx}" data-who="${x.id}"><span class="offer-art">${beastArt(x.a)}</span><span class="row-main"><span>${esc(x.name)}${x.a.prize ? ' ★' : ''}</span><small>${partsLine(x.parts)}</small></span><b class="comice-score">${x.score}</b></button>`,
            )
            .join('')}</div>`;
    },
});

defineSheet('comiceTreat', {
    title: 'Offrir une Friandise royale (+1 cœur)',
    render() {
        const list = state.animals.filter(a => !a.box && (a.love || 0) < 5).sort((a, b) => (b.love || 0) - (a.love || 0));
        if (!list.length) return empty('Toutes vos bêtes ont déjà 5 cœurs !');
        return `<div class="list">${list
            .slice(0, 40)
            .map(
                a =>
                    `<button class="row" data-act="comiceTreatDo" data-uid="${a.uid}"><span class="offer-art">${beastArt(a)}</span><span class="row-main"><span>${esc(a.name)}</span><small>${esc(ANIMALS[a.type]?.name || a.type)} · ${a.love || 0}/5 cœurs</small></span><span class="chip ok">+1 ${ico(['ui', 'heart'])}</span></button>`,
            )
            .join('')}</div>`;
    },
});

// ---------------- Mini-jeu 1 : Le brossage ----------------
let run = 0;
function openBrush(catId) {
    const cat = G.catOf(catId);
    const a = cat && state.animals.find(x => x.uid === cat.entry);
    if (!a || !G.canBrush(cat)) return;
    const me = ++run;
    document.querySelector('.hg-over')?.remove();
    const o = document.createElement('div');
    o.className = 'hg-over';
    o.innerHTML = `<div class="hg-game"><div class="hg-top"><h2>Présenter ${esc(a.name)}</h2><button class="btn sm" id="cbquit">Quitter</button></div>
        <div class="hg-stage cmb-stage" id="cbstage"><div class="cmb-beast">${genWrap(art('animal', animalKey(a.type, a.g)), a.g)}</div><div class="cmb-sparks"></div>
        <div class="cmb-panel"><div class="cmb-gauge"><i style="width:0%"></i></div><div class="cmb-line"><span id="cbpct">Éclat 0 %</span><span id="cbtime">${COMICE.brushTime} s</span></div>
        <p class="cmb-help">Glissez le doigt sur ${esc(a.name)}, de la tête vers la queue (de droite à gauche). À contre-poil, l’éclat retombe.</p>
        <div class="hg-btns"><button class="btn gold" id="cbgo">C’est parti !</button></div></div></div></div>`;
    document.body.appendChild(o);
    const q = s => o.querySelector(s);
    const close = () => {
        run++;
        o.remove();
        refresh();
    };
    q('#cbquit').onclick = close;
    q('#cbgo').onclick = () => {
        if (me !== run) return;
        q('.hg-btns').remove();
        play();
    };
    function play() {
        const stage = q('#cbstage'),
            gauge = q('.cmb-gauge i'),
            sparks = q('.cmb-sparks');
        const t0 = performance.now();
        let shine = 0,
            last = null,
            done = false;
        const w = () => stage.getBoundingClientRect().width || 300;
        const move = e => {
            if (done) return;
            const x = e.clientX;
            if (last !== null) {
                const dx = x - last;
                shine = Math.max(0, Math.min(1, shine + (dx < 0 ? (-dx / w()) * 0.07 : -(dx / w()) * 0.12)));
                if (dx < -3 && Math.random() < 0.3 && !reduceMotion()) {
                    const s = document.createElement('b');
                    s.className = 'cmb-spark';
                    const r = stage.getBoundingClientRect();
                    s.style.left = `${x - r.left}px`;
                    s.style.top = `${e.clientY - r.top}px`;
                    sparks.appendChild(s);
                    setTimeout(() => s.remove(), 700);
                }
                if (dx > 6) buzz(6);
            }
            last = x;
            gauge.style.width = `${Math.round(shine * 100)}%`;
            q('#cbpct').textContent = `Éclat ${Math.round(shine * 100)} %`;
        };
        const up = () => (last = null);
        stage.addEventListener('pointermove', e => (e.buttons || e.pointerType === 'touch' ? move(e) : (last = null)));
        stage.addEventListener('pointerdown', e => {
            last = e.clientX;
            stage.setPointerCapture && stage.setPointerCapture(e.pointerId);
        });
        stage.addEventListener('pointerup', up);
        stage.addEventListener('pointercancel', up);
        const tick = () => {
            if (me !== run || done) return;
            const left = COMICE.brushTime - (performance.now() - t0) / 1000;
            const now2 = performance.now();
            shine = Math.max(0, shine - ((now2 - (tick.t || now2)) / 1000) * 0.03);
            tick.t = now2;
            gauge.style.width = `${Math.round(shine * 100)}%`;
            q('#cbpct').textContent = `Éclat ${Math.round(shine * 100)} %`;
            q('#cbtime').textContent = `${Math.max(0, Math.ceil(left))} s`;
            if (left <= 0) return end();
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        function end() {
            done = true;
            const before = cat.brush || 0;
            G.comiceBrush(catId, shine);
            const pts = Math.round(Math.max(before, shine) * COMICE.w.show);
            sfx(shine >= 0.7 ? 'level' : 'pop');
            const box = document.createElement('div');
            box.className = 'hg-result';
            box.innerHTML = `<h3>${shine >= 0.85 ? 'Un pelage de concours !' : shine >= 0.5 ? 'Bien brossée' : 'On fera mieux demain'}</h3>
                <p>Éclat ${Math.round(shine * 100)} %</p><p class="hg-gain">Présentation : ${pts}/${COMICE.w.show}${shine < before ? ' (on garde le meilleur brossage)' : ''}</p>
                <p>Note de ${esc(a.name)} : ${fmt(G.catScore(cat))}/100</p><button class="btn gold" id="cbdone">Terminer</button>`;
            stage.appendChild(box);
            q('#cbdone').onclick = close;
        }
    }
}

// ---------------- Mini-jeu 2 (1.179) : La Parade du Jury ----------------
function openParade(opts) {
    const a =
        opts.mode === 'week'
            ? (() => {
                  const cat = G.catOf(opts.catId);
                  return cat && G.canParade(cat) ? state.animals.find(x => x.uid === cat.entry) : null;
              })()
            : state.animals.find(x => x.uid === opts.uid);
    if (!a) return;

    const me = ++run;
    document.querySelector('.com2-back')?.remove();
    const overlay = document.createElement('div');
    overlay.className = 'com2-back';
    overlay.innerHTML = `<div class="com2-modal">
        <div class="com2-mhead">
            <span class="com2-mart">${beastArt(a)}</span>
            <div><b>La Parade du Jury · ${esc(a.name)}</b><small>Touche au bon tempo quand le marqueur traverse la zone dorée (5 passages) !</small></div>
        </div>
        <div class="com2-pstage" id="com2-pstage">
            <div class="com2-pcount" id="com2-pcount">Passage 1 / 5 · Allure 0 %</div>
            <div class="com2-track" id="com2-track">
                <div class="com2-goldzone" id="com2-zone"></div>
                <div class="com2-cursor" id="com2-cur"></div>
            </div>
            <div class="com2-pips" id="com2-pips">${Array.from({ length: 5 }, () => '<i></i>').join('')}</div>
            <button type="button" class="btn gold wide lg" id="com2-tap">Saluer le jury !</button>
        </div>
        <div class="com2-mfoot"><button type="button" class="btn sm" id="com2-quit">Annuler</button></div>
    </div>`;
    document.body.appendChild(overlay);

    const close = () => {
        run++;
        overlay.remove();
        refresh();
    };
    overlay.querySelector('#com2-quit').onclick = close;

    const countEl = overlay.querySelector('#com2-pcount');
    const zoneEl = overlay.querySelector('#com2-zone');
    const curEl = overlay.querySelector('#com2-cur');
    const pipsEl = overlay.querySelectorAll('#com2-pips i');
    const tapBtn = overlay.querySelector('#com2-tap');
    const trackEl = overlay.querySelector('#com2-track');

    let stepIdx = 0;
    let totalPts = 0;
    let pos = 0.08;
    let dir = 1;
    let speed = 1.05;
    let target = 0.5;
    let last = performance.now();
    let ended = false;

    const setZone = () => {
        target = 0.25 + Math.random() * 0.5;
        zoneEl.style.left = `${Math.round((target - 0.11) * 100)}%`;
        zoneEl.style.width = '22%';
    };
    setZone();

    const finishParade = () => {
        ended = true;
        const norm = Math.max(0, Math.min(1, totalPts / 100));
        const stage = overlay.querySelector('#com2-pstage');
        overlay.querySelector('#com2-quit').style.display = 'none';
        if (opts.mode === 'week') {
            G.comiceParade(opts.catId, norm);
            const cat = G.catOf(opts.catId);
            const bonus = Math.round(norm * COMICE.paradeMax);
            sfx(norm >= 0.7 ? 'level' : 'pop');
            stage.innerHTML = `<div class="com2-done">
                <b>Allure devant le jury : ${Math.round(norm * 100)} %</b>
                <p>Bonus de Parade : +${bonus} / ${COMICE.paradeMax} pts · Note actuelle : ${G.catScore(cat)}/100</p>
                <button type="button" class="btn green wide" id="com2-ok">Parfait !</button>
            </div>`;
        } else {
            const res = G.runComiceExpress(opts.idx, opts.uid, norm);
            stage.innerHTML = res
                ? `<div class="com2-done">
                    <b>${res.rank}${res.rank === 1 ? 're' : 'e'} place ! (${res.score}/100)</b>
                    <p>Allure ${Math.round(norm * 100)} % · +${fmt(res.coins)}${COIN()} · +${res.cocardes} cocarde${res.cocardes > 1 ? 's' : ''}${res.gotPrize ? ' · Plaque Primée obtenue !' : ''}</p>
                    <button type="button" class="btn green wide" id="com2-ok">Super !</button>
                </div>`
                : `<div class="com2-done"><p>Épreuve déjà terminée.</p><button type="button" class="btn wide" id="com2-ok">Fermer</button></div>`;
        }
        stage.querySelector('#com2-ok').onclick = close;
    };

    const doTap = () => {
        if (ended) return;
        const dist = Math.abs(pos - target);
        let pts = 4,
            cls = 'miss';
        if (dist <= 0.11) {
            pts = 20;
            cls = 'ok';
            sfx('pop');
        } else if (dist <= 0.2) {
            pts = 12;
            cls = 'mid';
            sfx('click');
        } else {
            sfx('error');
        }
        buzz(10);
        totalPts += pts;
        if (pipsEl[stepIdx]) pipsEl[stepIdx].classList.add(cls);
        stepIdx++;
        if (stepIdx >= 5) return finishParade();
        speed += 0.18;
        setZone();
        countEl.textContent = `Passage ${stepIdx + 1} / 5 · Allure ${Math.min(100, totalPts)} %`;
    };

    tapBtn.addEventListener('pointerdown', e => {
        e.preventDefault();
        doTap();
    });
    trackEl.addEventListener('pointerdown', e => {
        e.preventDefault();
        doTap();
    });

    const tick = t => {
        if (me !== run || ended) return;
        const dt = Math.max(0, Math.min(0.05, (t - last) / 1000));
        last = t;
        pos += dir * speed * dt;
        if (pos >= 0.94) {
            pos = 0.94;
            dir = -1;
        } else if (pos <= 0.06) {
            pos = 0.06;
            dir = 1;
        }
        curEl.style.left = `${(pos * 100).toFixed(1)}%`;
        requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
}

export function setupComice() {
    actions({
        comiceCat: (el, d) => {
            ui.sel.comiceCat = d.cat;
        },
        comicePick: (el, d) => openSheet('comicePick', { cat: d.cat }),
        comiceIn: (el, d) => {
            if (G.comiceEnter(d.cat, d.who)) closeSheet('comicePick');
        },
        comicePrep: (el, d) => G.setComicePrep(d.cat, d.prep),
        comiceBrush: (el, d) => openBrush(d.cat),
        comiceParade: (el, d) => openParade({ mode: 'week', catId: d.cat }),
        comiceExpPick: (el, d) => openSheet('comiceExpPick', { idx: +d.idx }),
        comiceExpSet: (el, d) => {
            ui.sel['ce:' + d.idx] = d.who;
            closeSheet('comiceExpPick');
        },
        comiceExpGo: (el, d) => G.runComiceExpress(+d.idx, d.uid, 0.5),
        comiceExpParade: (el, d) => openParade({ mode: 'express', idx: +d.idx, uid: d.uid }),
        comiceBuy: (el, d) => G.buyComiceShop(d.id),
        comiceTreatOpen: () => openSheet('comiceTreat', {}),
        comiceTreatDo: (el, d) => {
            if (G.buyComiceShop('treat', d.uid)) closeSheet('comiceTreat');
        },
        comicePalmClaim: (el, d) => G.claimComicePalm(+d.i),
    });
}
