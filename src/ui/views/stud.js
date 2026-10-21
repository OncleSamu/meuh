// Animaux | Élevage (1.24.2) : le nom d'élevage, les reproducteurs à la retraite, la collection de robes, les poulains et l'arbre de famille.
import { fmt } from '../../core/format.js';
import { COAT, STUD, DISC, HARAS_LVL } from '../../data/haras.js';
import * as G from '../../systems/index.js';
import { blocks, actions, esc } from '../dom.js';
import { ico } from '../icons.js';
import { btn, section } from '../kit.js';
import { defineView } from '../app.js';
import { animalArt, lineageHtml } from '../genlook.js';
import { renameBtn } from '../sheets/rename.js';
import { emit } from '../../core/bus.js';
import { closeMoment } from '../moments.js';
import { horseR, ROBES } from '../../art/v1242robes.js';
import { svg } from '../../art/kit.js';

let sel = null; // le cheval dont on regarde l'arbre

const stage = a => (G.isAdult(a) ? undefined : G.growPct(a) < STUD.stages[0] ? 0 : 1);
const pic = a => animalArt('horse', a.g, '', stage(a));
const robeName = a => {
    const c = G.coatOf(a.g);
    return c ? COAT.robes[c.robe] : '';
};

function headCard() {
    const s = G.ensureStud();
    return `<div class="card sd-head"><div class="card-art">${ico(['ui', 'hEcusson'], 'ico big')}</div><div class="card-main">
        <div class="card-title">${esc(s.name)}${renameBtn('stud', 'stud', 'Renommer l’élevage')}</div>
        <div class="card-sub">${s.foals} poulain${s.foals > 1 ? 's' : ''} né${s.foals > 1 ? 's' : ''} · ${fmt(s.earned)} pièces de saillies · ${s.famous} lignée${s.famous > 1 ? 's' : ''} célèbre${s.famous > 1 ? 's' : ''}</div></div></div>`;
}

function retiredCard(a) {
    const r = G.rec(a);
    const spec =
        r.spec && DISC[r.spec]
            ? `Poulains : +${STUD.foalPts} en ${DISC[r.spec].name.toLowerCase()}`
            : 'Sans spécialité : rien à transmettre (choisissez-en une aux Écuries)';
    return `<div class="card sd-horse"><span class="sd-pic">${pic(a)}</span><div class="card-main"><div class="card-title">${esc(a.name)}</div>
        <div class="card-sub">${robeName(a)} · ${ico(['ui', 'hSaillie'])}${fmt(G.studIncome(a))} / jour${G.chainOf(a) > 1 ? ` · ${G.chainOf(a)} champions de suite` : ''}</div><div class="card-sub">${spec}</div></div>
        ${treeBtn(a)}</div>${sel === a.uid ? tree(a) : ''}`;
}
function candidateCard(a) {
    const why = G.retireWhy(a);
    return `<div class="card sd-horse"><span class="sd-pic">${pic(a)}</span><div class="card-main"><div class="card-title">${esc(a.name)}</div>
        <div class="card-sub">${robeName(a)} · ${G.titlesOf(a.uid)} victoire${G.titlesOf(a.uid) > 1 ? 's' : ''}${why ? ` · ${why}` : ''}</div></div>
        ${btn('Retraite', { act: 'stRetire', data: { uid: a.uid }, size: 'sm', kind: 'gold', disabled: !!why })}</div>`;
}

// 1.24.3 : robes et marques en vignettes de même taille, centrées ; les inconnues restent en silhouette
const MARK_ROBE = { pie: 'noir', appaloosa: 'gris', raie: 'palomino', balzanes: 'alezan', lave: 'alezan', belleface: 'bai', liste: 'alezan', etoile: 'noir' };
const tile = (seen, pic, name) => `<div class="sd-tile${seen ? '' : ' none'}">${pic}<small>${seen ? name : '?'}</small></div>`;
function collection() {
    const s = G.ensureStud();
    const robes = Object.keys(COAT.robes)
        .map(k => tile(s.robes[k], svg(horseR(ROBES[k], []), '0 0 80 80'), COAT.robes[k]))
        .join('');
    const marks = Object.keys(COAT.marks)
        .map(k => tile(s.marks[k], svg(horseR(ROBES[MARK_ROBE[k]], [k]), '0 0 80 80'), COAT.marks[k]))
        .join('');
    return `<div class="card"><div class="card-sub">Robes vues : <b>${G.robesSeen()}/${G.robesAll()}</b></div><div class="sd-tiles">${robes}</div>
        <div class="card-sub">Marques vues : <b>${G.marksSeen()}/${G.marksAll()}</b></div><div class="sd-tiles">${marks}</div></div>`;
}

function foalCard(a) {
    const r = G.rec(a);
    const age = G.isAdult(a) ? `génération ${a.gen || 1}` : `${G.growPct(a) < STUD.stages[0] ? 'poulain' : 'jeune'} (${Math.round(G.growPct(a) * 100)} %)`;
    const heir = r.heir && r.heir.length ? `<div class="card-sub">${ico(['ui', 'hSaillie'])}Talent de ${r.heir.map(esc).join(' et ')}</div>` : '';
    return `<div class="card sd-horse"><span class="sd-pic">${pic(a)}</span><div class="card-main"><div class="card-title">${esc(a.name)}</div>
        <div class="card-sub">${esc(G.coatText(a.g))} · ${age}</div>${heir}</div>${treeBtn(a)}</div>${sel === a.uid ? tree(a) : ''}`;
}

const treeBtn = a => `<button class="pick-chip${sel === a.uid ? ' on' : ''}" data-act="stPick" data-uid="${a.uid}">Arbre</button>`;
// l'arbre s'ouvre sous la carte du cheval (plus en bas de page, où on ne le voyait pas)
function tree(a) {
    const self = { me: { n: a.name, t: 'horse', g: a.g, gen: a.gen || 0, u: a.uid }, lin: a.lin };
    const champs = [a, ...(a.lin || [])].filter(x => x && G.bestDiv(x.uid || x.u) >= STUD.champDiv).length;
    return `<div class="card sd-tree">${a.lin ? lineageHtml(self) : '<small>Un cheval d’origine : pas d’ancêtres connus.</small>'}
        ${champs ? `<small>${ico(['ui', 'hCouronne'])}${champs} champion${champs > 1 ? 's' : ''} Élite dans cette famille proche${G.chainOf(a) ? ` · ${G.chainOf(a)}e champion de suite` : ''}</small>` : ''}</div>`;
}

function renderStud(el) {
    if (!G.harasOpen() || !G.stableLvl())
        return blocks(el, [
            [
                'closed',
                `<div class="card island-closed"><div class="card-title">L’élevage</div><p class="card-sub">${G.harasOpen() ? 'Construisez d’abord les grandes écuries (onglet Écuries).' : `S’ouvre au niveau ${HARAS_LVL}.`}</p></div>`,
            ],
        ]);
    G.tidyHaras();
    const ret = G.retired();
    const cands = G.horses().filter(a => !G.isRetired(a) && G.isAdult(a) && G.isChampion(a));
    const foals = G.horses()
        .filter(a => a.sire || a.dam)
        .sort((x, y) => (y.gen || 0) - (x.gen || 0));
    blocks(el, [
        ['head', headCard()],
        ['rs', section(`Reproducteurs au pré (${ret.length}/${STUD.max})`)],
        ...(ret.length
            ? ret.map(a => ['r' + a.uid, retiredCard(a)])
            : [
                  [
                      'rn',
                      '<div class="card"><small>Un champion qui a gagné en division Élite peut prendre sa retraite : il rapporte chaque jour et ses poulains héritent de son talent.</small></div>',
                  ],
              ]),
        ...(cands.length ? [['cs', section('Champions')], ...cands.map(a => ['c' + a.uid, candidateCard(a)])] : []),
        ['cos', section('Collection de robes')],
        ['col', collection()],
        ['fs', section('Poulains et descendants')],
        ...(foals.length
            ? foals.map(a => ['f' + a.uid, foalCard(a)])
            : [['fn', '<div class="card"><small>Croisez deux chevaux à l’étable de sélection (onglet Labo) pour avoir des poulains.</small></div>']]),
    ]);
}
defineView('animals/stud', renderStud);

export function setupStud() {
    actions({
        stRetire: (el, d) => G.retire(d.uid),
        foalOk: (el, d) => {
            const input = document.getElementById('foal-name');
            if (input) G.nameHorse(d.uid, input.value);
            closeMoment();
        },
        stPick: (el, d) => {
            sel = sel === d.uid ? null : d.uid;
            emit('changed', 'haras');
        },
    });
}
