// Animaux | Concours (1.24) : le concours de la semaine, le Grand Prix du mois, les divisions, les résultats.
import { fmt } from '../../core/format.js';
import { emit } from '../../core/bus.js';
import { DISC, SHOW, HARAS_LVL, DISCIPLINES } from '../../data/haras.js';
import { DECOS } from '../../data/farm.js';
import * as G from '../../systems/index.js';
import { blocks, actions, esc } from '../dom.js';
import { ico } from '../icons.js';
import { btn, hint, section, timer } from '../kit.js';
import { defineView } from '../app.js';
import { openHorseGame } from '../horsegame.js';

const divName = i => SHOW.divs[i].name;
const num = n => Math.round(n);

function divChips(sel, act) {
    return `<div class="chips-row wrap sh-divs">${SHOW.divs
        .map((d, i) =>
            G.divOpen(i)
                ? `<button class="pick-chip${i === sel ? ' on' : ''}" data-act="${act}" data-div="${i}">${ico(['ui', 'hDiv' + (i + 1)])}${d.name}</button>`
                : `<span class="pick-chip off" title="${G.ensureShow().rose[i - 1]}/${SHOW.open} rosettes en ${divName(i - 1)}">${ico(['ui', 'hDiv' + (i + 1)])}${d.name} <small>${G.ensureShow().rose[i - 1]}/${SHOW.open}</small></span>`,
        )
        .join('')}</div>`;
}

function lastCard() {
    const l = G.ensureShow().last;
    if (!l || l.seen) return '';
    const deco = l.deco ? DECOS[l.deco] : null;
    const rows = l.list
        .map(
            (x, i) =>
                `<div class="sh-rank${x.me ? ' me' : ''}"><b>${i + 1}</b><span>${esc(x.name)}</span><em>${x.note.toFixed(1).replace('.', ',')}</em></div>`,
        )
        .join('');
    return `<div class="card sh-result"><div class="card-title">${ico(['ui', l.place === 1 ? 'hCup2' : 'hCup0'])}Résultats · ${l.kind === 'gp' ? 'Grand Prix' : DISC[l.disc].name} · ${divName(l.div)}</div>
        <p class="card-sub">${esc(l.name)} finit <b>${l.place}${l.place === 1 ? 'er' : 'e'}</b> avec ${l.note.toFixed(1).replace('.', ',')}${l.jules ? ' · Jules a monté' : ''}.</p>
        <div class="sh-ranks">${rows}</div>
        <div class="sh-gains">${l.coins ? `<span class="chip">${ico(['ui', 'coin'])}+${fmt(l.coins)}</span>` : ''}${l.rosette ? `<span class="chip">${ico(['ui', 'hRos' + (l.div + 1)])}Rosette</span>` : ''}${l.cup ? `<span class="chip">${ico(['ui', 'hCup2'])}Coupe</span>` : ''}${l.ribbon ? `<span class="chip">${ico(['ui', 'ribbon'])}+${l.ribbon} ruban</span>` : ''}${deco ? `<span class="chip">${ico(['ui', deco.id])}${deco.name}</span>` : ''}</div>
        ${btn('Compris', { act: 'shSeen', size: 'sm', kind: 'gold' })}</div>`;
}

function horseRow(a, disc, st) {
    const hope = G.showHope(a, disc);
    const mine = st.entry && st.entry.uid === a.uid;
    let right;
    if (!st.entry || !mine)
        right = btn(st.entry ? 'Changer' : 'Inscrire', {
            act: 'shEnter',
            data: { uid: a.uid },
            size: 'sm',
            kind: 'gold',
            disabled: st.entry && st.entry.passage != null,
        });
    else if (st.entry.passage == null)
        right = btn('Jouer', { act: 'shPlay', data: { uid: a.uid, d: disc }, size: 'sm', kind: 'green', disabled: !G.canTrain(a) });
    else right = `<span class="chip">${ico(['ui', 'hCup0'])}Passage joué</span>`;
    return `<div class="card sh-horse${mine ? ' mine' : ''}"><div class="card-main"><div class="card-title">${esc(a.name)}${mine ? ' · inscrit' : ''}</div>
        <div class="card-sub">${DISC[disc].name} ${G.aptOf(a, disc)}/${G.aptCap(a, disc)} · note espérée ${num(hope)}${G.titlesOf(a.uid) ? ` · ${G.titlesOf(a.uid)} victoire${G.titlesOf(a.uid) > 1 ? 's' : ''}` : ''}</div></div>${right}</div>`;
}

function weekCard() {
    const st = G.ensureShow(),
        disc = G.weekDisc();
    const div = st.div;
    const e = st.entry;
    const hint2 = e
        ? e.passage == null
            ? 'Jouez votre passage quand vous voulez avant lundi, sinon Jules monte à votre place.'
            : 'Passage joué : les résultats tombent lundi.'
        : 'Choisissez une division, puis inscrivez un cheval.';
    return `<div class="card sh-week"><div class="card-art">${ico(DISC[disc].icon, 'ico big')}</div><div class="card-main">
        <div class="card-sub">Cette semaine</div><div class="card-title">${DISC[disc].name}</div>
        <div class="card-sub">Division ${divName(div)} · bourse ${fmt(G.purseOf(div))} · inscription ${fmt(G.feeOf(div))}</div>
        <div class="card-sub">Résultats dans ${timer(Date.now() + G.showEndsIn() * 1000)}</div></div></div>
        ${divChips(div, 'shDiv')}<p class="hint">${hint2}</p>`;
}

function gpCard(st, lod) {
    const active = G.gpActive();
    const g = G.gpOf();
    if (!active && !g)
        return `<div class="card sh-gp off"><div class="card-art">${ico(['ui', 'hCup2'], 'ico big')}</div><div class="card-main"><div class="card-title">Grand Prix du mois</div><div class="card-sub">Les quatre disciplines, récompenses doubles et un ruban. Rendez-vous le premier week-end du mois, dans ${timer(G.gpAt())}.</div></div></div>`;
    if (!g) {
        const div = st.div;
        return `<div class="card sh-gp"><div class="card-art">${ico(['ui', 'hCup2'], 'ico big')}</div><div class="card-main"><div class="card-title">Grand Prix du mois</div>
            <div class="card-sub">Ce week-end · bourse ${fmt(G.purseOf(div, SHOW.gpMult))} · inscription ${fmt(G.feeOf(div, SHOW.gpMult))} · jusqu’à dimanche soir</div></div></div>
            <div class="chips-row wrap">${lod.map(a => `<button class="pick-chip" data-act="gpEnter" data-uid="${a.uid}">${esc(a.name)} · ${num(G.showHope(a, G.weekDisc()))}</button>`).join('') || '<small>Logez un cheval en box pour participer.</small>'}</div>`;
    }
    const a = G.horseByUid(g.uid);
    const rows = SHOW.rot
        .map(d => {
            const p = g.passes[d];
            return `<div class="card sh-horse"><div class="card-main"><div class="card-title">${ico(DISC[d].icon)}${DISC[d].name}</div><div class="card-sub">${p != null ? `Passage joué : ${num(p * 100)}` : 'À jouer (sinon Jules monte)'}</div></div>${
                p != null
                    ? `<span class="chip">${ico(['ui', 'hCup0'])}Fait</span>`
                    : btn('Jouer', { act: 'gpPlay', data: { uid: g.uid, d }, size: 'sm', kind: 'green', disabled: !a || !G.canTrain(a) })
            }</div>`;
        })
        .join('');
    return `<div class="card sh-gp"><div class="card-art">${ico(['ui', 'hCup2'], 'ico big')}</div><div class="card-main"><div class="card-title">Grand Prix · ${a ? esc(a.name) : ''}</div><div class="card-sub">Division ${divName(g.div)} · ${Object.keys(g.passes).length}/4 épreuves · fin dans ${timer(G.gpAt())}</div></div></div>${rows}`;
}

function shelf() {
    const s = G.ensureShow();
    return `<div class="card sh-shelf"><div class="sh-shelfrow">${SHOW.divs.map((d, i) => `<div class="sh-ros${s.rose[i] ? '' : ' none'}" title="${d.name}">${ico(['ui', 'hRos' + (i + 1)])}<b>${s.rose[i]}</b></div>`).join('')}</div>
        <div class="card-sub">${ico(['ui', 'hCup2'])}${s.cups} coupe${s.cups > 1 ? 's' : ''} · charme au concours de la ferme : +${G.showCharm()}</div></div>`;
}

function renderShow(el) {
    if (!G.showOpen())
        return blocks(el, [
            [
                'closed',
                `<div class="card island-closed"><div class="card-title">Les concours</div><p class="card-sub">S’ouvrent au niveau ${HARAS_LVL}.</p></div>`,
            ],
        ]);
    if (!G.stableLvl())
        return blocks(el, [
            [
                'closed',
                '<div class="card island-closed"><div class="card-title">Les concours</div><p class="card-sub">Construisez d’abord les grandes écuries (onglet Écuries).</p></div>',
            ],
        ]);
    G.tidyHaras();
    const st = G.ensureShow(),
        lod = G.lodged(),
        disc = G.weekDisc();
    blocks(el, [
        ['last', lastCard()],
        ['week', weekCard()],
        ['hs', section('Vos chevaux')],
        ...(lod.length
            ? lod.map(a => ['h' + a.uid, horseRow(a, disc, st)])
            : [['none', '<div class="card"><small>Logez un cheval en box pour le faire concourir.</small></div>']]),
        ['gps', section('Le Grand Prix')],
        ['gp', gpCard(st, lod)],
        ['ss', section('Votre étagère')],
        ['shelf', shelf()],
        [
            'hint',
            hint(
                `Une discipline par semaine (${DISCIPLINES.map(d => d.name.toLowerCase()).join(', ')}). La note : aptitude 55 %, passage 30 %, présentation 15 % (cœurs d’amitié), +10 % pour la spécialité. Trois rosettes ouvrent la division suivante ; un passage coûte une pastille de forme.`,
            ),
        ],
    ]);
}
defineView('animals/show', renderShow);

const horseOf = d => G.horseByUid(d.uid);
export function setupShow() {
    actions({
        shDiv: (el, d) => {
            G.ensureShow().div = +d.div;
            emit('changed', 'show');
        },
        shEnter: (el, d) => G.enterShow(d.uid, G.ensureShow().div, el),
        shPlay: (el, d) => horseOf(d) && openHorseGame(d.uid, d.d, el, 'show'),
        shSeen: () => G.showSeen(),
        gpEnter: (el, d) => G.enterGp(d.uid, G.ensureShow().div),
        gpPlay: (el, d) => horseOf(d) && openHorseGame(d.uid, d.d, el, 'gp'),
    });
}
