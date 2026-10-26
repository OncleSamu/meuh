// Animaux | Comice (1.45) : le Comice agricole de la semaine, ses catégories, les inscrits, le brossage et le palmarès.
import { state } from '../../core/state.js';
import { fmt } from '../../core/format.js';
import { sfx, buzz } from '../../core/bus.js';
import { COMICE, COMICE_CAT } from '../../data/elevage.js';
import * as G from '../../systems/index.js';
import { blocks, actions, esc } from '../dom.js';
import { ico, art } from '../icons.js';
import { btn, hint, timer, empty } from '../kit.js';
import { defineView, refresh } from '../app.js';
import { defineSheet, openSheet, closeSheet } from '../sheets.js';
import { genWrap, animalKey } from '../genlook.js';
import { reduceMotion } from '../fx.js';

const PARTS = [
    ['genes', 'Gènes'],
    ['beauty', 'Beauté'],
    ['hearts', 'Cœurs'],
    ['show', 'Présentation'],
];
const partsLine = p => PARTS.map(([k, n]) => `${n} ${p[k]}/${COMICE.w[k]}`).join(' · ');
// les robes des bêtes rivales (une teinte douce par bête)
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

// les quatre barres de la note, celle du jury en avant
function partBars(parts, jury) {
    return `<div class="cm-bars">${PARTS.map(
        ([k, n]) =>
            `<div class="cm-bar${k === jury ? ' jury' : ''}"><span>${n}</span><i><u style="width:${Math.round(((parts ? parts[k] : 0) / COMICE.w[k]) * 100)}%"></u></i><b>${parts ? parts[k] : 0}</b></div>`,
    ).join('')}</div>`;
}

function catCard(cat) {
    const score = G.catScore(cat),
        rank = G.catRank(cat);
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
    const can = G.canBrush(cat);
    const stage = entry
        ? `<div class="cm-entrant">${beastArt(entry.a)}${rank && rank <= 3 ? `<span class="cm-medal">${ico(['ui', MEDAL[rank]])}</span>` : ''}<b>${esc(entry.name)}</b></div>`
        : `<button class="cm-entrant empty" data-act="comicePick" data-cat="${cat.id}" ${G.comiceCandidates(cat.id).length ? '' : 'disabled'}>${art('animal', cat.id)}<b>Choisir</b></button>`;
    return `<div class="card comice-cat${rank === 1 ? ' lead' : ''}">
        <div class="cm-title"><span class="card-title">${G.catName(cat)}</span><span class="cm-jury">${ico(['ui', 'star'])}Le jury regarde surtout ${G.JURY[cat.jury] || ''}</span></div>
        <div class="cm-body">${stage}<div class="cm-side"><div class="comice-note"><b>${score || '—'}</b><small>${rank ? `${rank}${rank === 1 ? 're' : 'e'} place pour l’instant` : 'sur 100'}</small></div>${partBars(entry && entry.parts, cat.jury)}</div></div>
        <div class="row-btns">${btn(cat.entry ? 'Changer de bête' : 'Inscrire', { act: 'comicePick', data: { cat: cat.id }, kind: cat.entry ? '' : 'gold', size: 'sm', disabled: !G.comiceCandidates(cat.id).length })}${btn(
            cat.entry && !can ? 'Brossée aujourd’hui' : 'Brosser',
            { act: 'comiceBrush', data: { cat: cat.id }, kind: can ? 'green' : '', size: 'sm', disabled: !can, icon: ['ui', 'hBrosse'] },
        )}</div>
        <ol class="cm-rank">${rows}</ol></div>`;
}

function renderComice(el) {
    if (!G.comiceOpen())
        return blocks(el, [
            [
                'closed',
                `<div class="card island-closed"><div class="card-title">Le Comice agricole</div><p class="card-sub">Il ouvre au niveau ${COMICE.lvl}.</p></div>`,
            ],
        ]);
    G.comiceTick();
    const c = G.ensureComice();
    const inLice = c.cats.map(cat => cat.entry && state.animals.find(a => a.uid === cat.entry)).filter(Boolean);
    const head = `<div class="card comice-head"><div class="cm-bunting"></div>
        <div class="cm-headrow"><span class="offer-art">${art('ui', 'ribbon')}</span><div class="card-main"><div class="card-title">Le Comice de la semaine</div>
        <div class="card-sub">Résultats dans ${timer(G.comiceEnd())}${G.comiceHall() ? ' · grand hall : prix doublés' : ''}</div></div></div>
        <div class="cm-lice">${inLice.length ? inLice.map(a => `<span class="cm-lice-b">${beastArt(a)}<small>${esc(a.name)}</small></span>`).join('') : '<small>Aucune bête en lice : inscrivez-en une dans chaque catégorie.</small>'}</div></div>`;
    const cats = c.cats.length
        ? c.cats.map(catCard).join('')
        : empty('Il faut des bêtes adultes pour concourir : le Comice tire ses catégories parmi vos espèces.');
    const last =
        c.last && c.last.lines.length
            ? `<div class="card comice-last"><div class="card-title">La semaine dernière</div>${c.last.lines.map(([i, t]) => `<p class="card-sub">${ico(i)} ${t}</p>`).join('')}</div>`
            : '';
    // le palmarès : toutes les espèces de l'élevage, gagnées ou à gagner
    const types = [...new Set([...G.comiceTypes(), ...Object.keys(c.wins || {})])].filter(t => COMICE_CAT[t]);
    const palm = types.length
        ? `<div class="card comice-palm"><div class="card-title">Le palmarès de l’élevage</div><p class="card-sub">${Object.keys(c.wins || {}).length} espèce${Object.keys(c.wins || {}).length > 1 ? 's' : ''} primée${Object.keys(c.wins || {}).length > 1 ? 's' : ''} sur ${types.length}</p><div class="cm-palm">${types
              .map(
                  t =>
                      `<span class="cm-cup${c.wins[t] ? ' won' : ''}">${art('animal', t)}${c.wins[t] ? `<i>${ico(['ui', 'ribbon'])}×${c.wins[t]}</i>` : '<i>—</i>'}</span>`,
              )
              .join('')}</div></div>`
        : '';
    blocks(el, [
        ['head', head],
        ['cats', cats],
        ['last', last],
        ['palm', palm],
        [
            'hint',
            hint(
                `La note sur 100 : gènes au-dessus de la moyenne de l’espèce ${COMICE.w.genes}, beauté (robe, motifs, cornes…) ${COMICE.w.beauty}, cœurs ${COMICE.w.hearts}, présentation ${COMICE.w.show} (le brossage, une fois par jour). Ce que le jury regarde surtout compte une fois et demie. Premier prix : un ruban, des pièces et la plaque « Primée » : son prix double à la foire.`,
            ),
        ],
    ]);
}
defineView('animals/comice', renderComice);

// ---------------- inscrire une bête ----------------
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
                    `<button class="row comice-pick${cat.entry === x.id ? ' on' : ''}" data-act="comiceIn" data-cat="${o.cat}" data-who="${x.id}"><span class="offer-art">${beastArt(x.a)}</span><span class="row-main"><span>${esc(x.name)}</span><small>${partsLine(x.parts)}</small></span><b class="comice-score">${x.score}</b></button>`,
            )
            .join('')}</div><p class="card-sub center">Les meilleurs d’abord. La présentation compte seulement après le brossage.</p>`;
    },
});

// ---------------- le brossage : dans le sens du poil (de la tête vers la queue) ----------------
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
                // de droite à gauche : dans le sens du poil
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
            // le pelage se ternit doucement : il faut brosser sans s'arrêter
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

export function setupComice() {
    actions({
        comicePick: (el, d) => openSheet('comicePick', { cat: d.cat }),
        comiceIn: (el, d) => {
            if (G.comiceEnter(d.cat, d.who)) closeSheet('comicePick');
        },
        comiceBrush: (el, d) => openBrush(d.cat),
    });
}
