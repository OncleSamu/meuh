// Animaux | Haras › Concours (1.24) : le concours de la semaine, le Grand Prix du mois, les divisions, les résultats.
import { fmt } from '../../core/format.js';
import { emit } from '../../core/bus.js';
import { DISC, SHOW, HARAS_LVL, DISCIPLINES } from '../../data/haras.js';
import { DECOS } from '../../data/farm.js';
import * as G from '../../systems/index.js';
import { blocks, actions, esc } from '../dom.js';
import { ico } from '../icons.js';
import { btn, hint, section, timer } from '../kit.js';
import { openHorseGame } from '../horsegame.js';
import { animalArt } from '../genlook.js';

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

// 1.24.3 : un bloc par cheval inscrit ; le classement commun en dessous
function resultBlock(l) {
    const deco = l.deco ? DECOS[l.deco] : null;
    return `<div class="sh-res1"><p class="card-sub">${esc(l.name)} finit <b>${l.place}${l.place === 1 ? 'er' : 'e'}</b> en ${divName(l.div)} avec ${l.note.toFixed(1).replace('.', ',')}${l.jules ? ' · Jules a monté' : ''}.</p>
        <div class="sh-gains">${l.coins ? `<span class="chip">${ico(['ui', 'coin'])}+${fmt(l.coins)}</span>` : ''}${l.rosette ? `<span class="chip">${ico(['ui', 'hRos' + (l.div + 1)])}${l.crush ? 'Victoire écrasante : 2 rosettes' : 'Rosette'}</span>` : ''}${l.cup ? `<span class="chip">${ico(['ui', 'hCup2'])}Coupe</span>` : ''}${l.ribbon ? `<span class="chip">${ico(['ui', 'ribbon'])}+${l.ribbon} ruban</span>` : ''}${deco ? `<span class="chip">${ico(['ui', deco.id])}${deco.name}</span>` : ''}</div></div>`;
}
function lastCard() {
    const all = G.lastResults().filter(l => !l.seen);
    if (!all.length) return '';
    const best = all.reduce((x, y) => (y.place < x.place ? y : x));
    // les classements, un par division (sans doublon quand plusieurs chevaux couraient ensemble)
    const seenDiv = new Set();
    const tables = all
        .filter(l => !seenDiv.has(l.kind + l.div) && seenDiv.add(l.kind + l.div))
        .map(
            l =>
                `<div class="sh-ranks"><small>${l.kind === 'gp' ? 'Grand Prix' : DISC[l.disc].name} · ${divName(l.div)}</small>${l.list
                    .map(
                        (x, i) =>
                            `<div class="sh-rank${x.mine || x.me ? ' me' : ''}"><b>${i + 1}</b><span>${esc(x.name)}</span><em>${x.note.toFixed(1).replace('.', ',')}</em></div>`,
                    )
                    .join('')}</div>`,
        )
        .join('');
    return `<div class="card sh-result"><div class="card-title">${ico(['ui', best.place === 1 ? 'hCup2' : 'hCup0'])}Résultats du concours</div>
        ${all.map(resultBlock).join('')}${tables}
        ${btn('Compris', { act: 'shSeen', size: 'sm', kind: 'gold' })}</div>`;
}

function horseRow(a, disc) {
    const hope = G.showHope(a, disc);
    const e = G.entryOf(a.uid);
    const left = G.entriesLeft();
    let right;
    if (!e)
        right = btn('Inscrire', {
            act: 'shEnter',
            data: { uid: a.uid },
            size: 'sm',
            kind: 'gold',
            disabled: left <= 0,
            title: left <= 0 ? `${SHOW.entries} chevaux au plus par semaine` : '',
        });
    else if (e.passage == null)
        right = `<span class="sh-acts">${btn('Jouer', { act: 'shPlay', data: { uid: a.uid, d: disc }, size: 'sm', kind: 'green', disabled: !G.canTrain(a) })}${btn('Retirer', { act: 'shOut', data: { uid: a.uid }, size: 'sm', kind: 'ghost' })}</span>`;
    else right = `<span class="chip">${ico(['ui', 'hCup0'])}Passage joué</span>`;
    return `<div class="card sh-horse${e ? ' mine' : ''}"><span class="sd-pic sm">${animalArt('horse', a.g)}</span><div class="card-main"><div class="card-title">${esc(a.name)}${e ? ` · ${divName(e.div)}` : ''}</div>
        <div class="card-sub">${DISC[disc].name} ${G.aptOf(a, disc)}/${G.aptCap(a, disc)} · note espérée ${num(hope)}${G.titlesOf(a.uid) ? ` · ${G.titlesOf(a.uid)} victoire${G.titlesOf(a.uid) > 1 ? 's' : ''}` : ''}</div></div>${right}</div>`;
}

function weekCard() {
    const st = G.ensureShow(),
        disc = G.weekDisc();
    const div = st.div;
    const n = G.entriesNow().length;
    const toPlay = G.entriesNow().filter(e => e.passage == null).length;
    const hint2 = n
        ? toPlay
            ? `Jouez les passages quand vous voulez avant lundi, sinon Jules monte à votre place. Vos chevaux d’une même division courent aussi entre eux.`
            : 'Passages joués : les résultats tombent lundi.'
        : 'Choisissez une division, puis inscrivez jusqu’à trois chevaux.';
    return `<div class="card sh-week"><div class="card-art">${ico(DISC[disc].icon, 'ico big')}</div><div class="card-main">
        <div class="card-sub">Cette semaine · ${n}/${SHOW.entries} inscrits</div><div class="card-title">${DISC[disc].name}</div>
        <div class="card-sub">Division ${divName(div)} · bourse ${fmt(G.purseOf(div))} · inscription ${fmt(G.feeOf(div))}</div>
        <div class="card-sub">Rivales : notes de ${SHOW.divs[div].rivals[0]} à ${SHOW.divs[div].rivals[1]}</div>
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
            <div class="chips-row wrap">${lod.map(a => `<button class="pick-chip" data-act="gpEnter" data-uid="${a.uid}">${esc(a.name)} · ${num(SHOW.rot.reduce((n, d) => n + G.showHope(a, d), 0) / SHOW.rot.length)}</button>`).join('') || '<small>Logez un cheval en box pour participer.</small>'}</div>`;
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
                '<div class="card island-closed"><div class="card-title">Les concours</div><p class="card-sub">Construisez d’abord les grandes écuries (choix Écuries, en haut).</p></div>',
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
            ? lod.map(a => ['h' + a.uid, horseRow(a, disc)])
            : [['none', '<div class="card"><small>Logez un cheval en box pour le faire concourir.</small></div>']]),
        ['gps', section('Le Grand Prix')],
        ['gp', gpCard(st, lod)],
        ['ss', section('Votre étagère')],
        ['shelf', shelf()],
        [
            'hint',
            hint(
                `Une discipline par semaine (${DISCIPLINES.map(d => d.name.toLowerCase()).join(', ')}). La note : aptitude 55 %, passage 30 %, présentation 15 % (cœurs d’amitié), +10 % pour la spécialité. Jusqu’à trois chevaux par semaine (ceux d’une même division courent aussi entre eux). Trois rosettes ouvrent la division suivante (une victoire avec 12 points d’avance en vaut deux) ; un passage coûte une pastille de forme, et un cheval bien entraîné a un mini-jeu plus facile.`,
            ),
        ],
    ]);
}
export { renderShow }; // 1.44.2 : dans le volet Haras (voir haras.js)

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
        shOut: (el, d) => G.withdrawShow(d.uid),
        gpEnter: (el, d) => G.enterGp(d.uid, G.ensureShow().div),
        gpPlay: (el, d) => horseOf(d) && openHorseGame(d.uid, d.d, el, 'gp'),
    });
}
