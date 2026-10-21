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
            ? `${DISC[r.spec].name} : ses poulains partent avec +${STUD.foalPts} points`
            : 'Sans spécialité : choisissez-en une aux écuries pour transmettre ses points';
    return `<div class="card sd-horse"><span class="sd-pic">${pic(a)}</span><div class="card-main"><div class="card-title">${esc(a.name)}${G.chainOf(a) ? ` · ${G.chainOf(a)}e champion de sa lignée` : ''}</div>
        <div class="card-sub">${robeName(a)} · ${ico(['ui', 'hSaillie'])}${fmt(G.studIncome())} par jour</div><div class="card-sub">${spec}</div></div>
        <button class="pick-chip" data-act="stPick" data-uid="${a.uid}">Arbre</button></div>`;
}
function candidateCard(a) {
    const why = G.retireWhy(a);
    return `<div class="card sd-horse"><span class="sd-pic">${pic(a)}</span><div class="card-main"><div class="card-title">${esc(a.name)}</div>
        <div class="card-sub">${robeName(a)} · ${G.titlesOf(a.uid)} victoire${G.titlesOf(a.uid) > 1 ? 's' : ''}${why ? ` · ${why}` : ''}</div></div>
        ${btn('Retraite', { act: 'stRetire', data: { uid: a.uid }, size: 'sm', kind: 'gold', disabled: !!why })}</div>`;
}

function collection() {
    const s = G.ensureStud();
    const robes = Object.keys(COAT.robes)
        .map(
            k =>
                `<div class="sd-robe${s.robes[k] ? '' : ' none'}" title="${COAT.robes[k]}">${svg(horseR(ROBES[k], []), '0 0 80 80')}<small>${s.robes[k] ? COAT.robes[k] : '?'}</small></div>`,
        )
        .join('');
    const marks = Object.keys(COAT.marks)
        .map(k => `<span class="chip${s.marks[k] ? '' : ' off'}">${s.marks[k] ? COAT.marks[k] : '?'}</span>`)
        .join('');
    return `<div class="card"><div class="card-sub">Robes vues : <b>${G.robesSeen()}/${G.robesAll()}</b> · marques : <b>${G.marksSeen()}/${G.marksAll()}</b></div><div class="sd-robes">${robes}</div><div class="chips-row wrap">${marks}</div></div>`;
}

function foalCard(a) {
    const r = G.rec(a);
    const heir = r.heir && r.heir.length ? ` · talent de ${r.heir.map(esc).join(' et ')}` : '';
    return `<div class="card sd-horse"><span class="sd-pic">${pic(a)}</span><div class="card-main"><div class="card-title">${esc(a.name)}</div>
        <div class="card-sub">${robeName(a)}${G.isAdult(a) ? '' : ` · ${G.growPct(a) < STUD.stages[0] ? 'poulain' : 'jeune'} (${Math.round(G.growPct(a) * 100)} %)`}${heir}</div>
        <div class="card-sub">${esc(G.coatText(a.g))}</div></div><button class="pick-chip" data-act="stPick" data-uid="${a.uid}">Arbre</button></div>`;
}

function tree() {
    const a = sel && G.horseByUid(sel);
    if (!a) return '<div class="card"><small>Touchez « Arbre » sur un cheval pour voir sa famille.</small></div>';
    const self = { me: { n: a.name, t: 'horse', g: a.g, gen: a.gen || 0 }, lin: a.lin };
    return `<div class="card"><div class="card-title">${esc(a.name)} · ${G.coatText(a.g)}</div>${a.lin ? lineageHtml(self) : '<small>Un cheval d’origine : pas d’ancêtres connus.</small>'}
        ${a.g && a.g.coat ? `<small class="sd-genes">${G.geneLetters(a.g.coat)}</small>` : ''}</div>`;
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
        ['ts', section('Arbre de famille')],
        ['tree', tree()],
    ]);
}
defineView('animals/stud', renderStud);

export function setupStud() {
    actions({
        stRetire: (el, d) => G.retire(d.uid),
        stPick: (el, d) => {
            sel = d.uid;
            emit('changed', 'haras');
        },
    });
}
