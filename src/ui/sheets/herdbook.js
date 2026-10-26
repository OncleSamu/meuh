// 1.46 : le carnet de l'élevage (Animaux | Prés) : les robes de chaque espèce, les raretés, les associations au pré.
import { state, lvOk } from '../../core/state.js';
import { ANIMALS } from '../../data/animals.js';
import { ITEMS } from '../../data/items.js';
import { LOOKS } from '../../data/genetics.js';
import { PAIRS, ASSOC_LVL, ROBEBOOK, COMICE_CAT } from '../../data/elevage.js';
import * as G from '../../systems/index.js';
import { actions, esc } from '../dom.js';
import { ico, art } from '../icons.js';
import { segmented } from '../kit.js';
import { defineSheet, sheetOpts } from '../sheets.js';
import { genWrap } from '../genlook.js';

const pair = v => [
    [v, 1],
    [v, 1],
];
// le dessin d'une robe : l'espèce avec cette couleur, ce motif ou cette finition
const look = (type, { c = 0, p = 0, f = 0, halo = false }) =>
    genWrap(art('animal', type), { t: {}, l: { size: pair(1), color: pair(c), pattern: pair(p), finish: pair(f) }, halo });

function robesTab(o) {
    const types = G.BOOK_TYPES.filter(t => lvOk(ANIMALS[t]));
    const cur = types.includes(o.type) ? o.type : types.find(t => G.robeCount(t)) || types[0];
    const chips = `<div class="chips-row hb-types">${types
        .map(
            t =>
                `<button class="pick-chip${t === cur ? ' on' : ''}" data-act="hbType" data-t="${t}">${ico(['animal', t])}<small>${G.robeCount(t)}/${G.robeTotal()}</small>${state.herdbook && state.herdbook.done && state.herdbook.done[t] ? ico(['ui', 'ribbon']) : ''}</button>`,
        )
        .join('')}</div>`;
    const cell = (kind, i, name) => {
        const got = G.hasRobe(cur, kind, i);
        return `<div class="hb-robe${got ? ' got' : ''}"><span class="hb-art">${got ? look(cur, kind === 'c' ? { c: i } : { p: i }) : art('animal', cur)}</span><small>${got ? name : '?'}</small></div>`;
    };
    const done = state.herdbook && state.herdbook.done && state.herdbook.done[cur];
    return `${chips}<div class="card hb-head"><div class="card-title">${ANIMALS[cur].name} · ${G.robeCount(cur)} robes sur ${G.robeTotal()}</div>
        <div class="card-sub">${done ? 'Espèce complète : un ruban gagné !' : `Toutes les robes : ${ROBEBOOK.rubans} ruban. Chaque nouvelle robe rapporte des pièces.`}</div></div>
        <h4 class="hb-sub">Les couleurs</h4><div class="hb-grid">${G.ROBE_COLORS.map(i => cell('c', i, LOOKS.color[i])).join('')}</div>
        <h4 class="hb-sub">Les motifs</h4><div class="hb-grid">${G.ROBE_PATTERNS.map(i => cell('p', i, LOOKS.pattern[i])).join('')}</div>
        <h4 class="hb-sub">Les raretés (toutes espèces)</h4><div class="hb-grid">${G.RARE_LOOKS.map(id => {
            const got = G.hasRare(id);
            const f = id === 'halo' ? { halo: true } : { f: +id.slice(1) };
            return `<div class="hb-robe${got ? ' got' : ''}"><span class="hb-art">${got ? look(cur, f) : art('animal', cur)}</span><small>${got ? (id === 'halo' ? 'Auréolée' : LOOKS.finish[+id.slice(1)]) : '?'}</small></div>`;
        }).join('')}</div>
        <p class="card-sub hb-note">Beaucoup de bêtes cachent une robe dans leurs gènes : elle apparaît quand deux parents porteurs ont un petit au pré. Les bêtes de choix des voisins en montrent souvent une. Les raretés ne naissent qu’au labo, par mutation.</p>`;
}

function pairsTab() {
    if (!G.assocOpen()) return `<p class="empty">Les associations au pré s’ouvrent au niveau ${ASSOC_LVL}.</p>`;
    const h = G.ensureHerdbook();
    const n = PAIRS.filter(P => h.pairs[P.id]).length;
    return `<div class="card hb-head"><div class="card-title">${n} association${n > 1 ? 's' : ''} sur ${PAIRS.length}</div>
        <div class="card-sub">Deux espèces dans un même pré : l’une produit plus vite, ou plus lentement. Elles s’inscrivent ici dès qu’elles se rencontrent.</div></div>
        <div class="list">${PAIRS.map(P => {
            const got = !!h.pairs[P.id];
            const fx = `${P.f > 0 ? '+' : '−'}${Math.round(Math.abs(P.f) * 100)} % pour ${(COMICE_CAT[P.on] || ANIMALS[P.on].name).toLowerCase()}`;
            return `<div class="card hb-pair${got ? (P.bad ? ' bad' : ' good') : ''}"><div class="hb-duo"><span>${art('animal', P.a)}</span><b>+</b><span>${art('animal', P.b)}</span></div>
                <div class="card-main"><div class="card-title">${got ? esc(P.name) : 'À découvrir'}</div>
                <div class="card-sub">${got ? `<span class="chip ${P.bad ? 'bad' : 'ok'}">${fx}</span> ${esc(P.why)}` : `Mettez ${ANIMALS[P.a].name.toLowerCase()} et ${ANIMALS[P.b].name.toLowerCase()} dans le même pré pour voir ce qui se passe.`}</div>
                ${got ? `<p class="hb-mamie">${ico(['villager', 'odette'])}<span>« ${esc(P.mamie)} »</span></p>` : ''}</div></div>`;
        }).join('')}</div>`;
}

defineSheet('herdbook', {
    title: 'Le carnet de l’élevage',
    open(o) {
        o.tab = o.tab || 'robes';
    },
    render: o =>
        segmented(
            [
                ['robes', 'Les robes', ['ui', 'cpCarnet']],
                ['pairs', 'Les associations', ['ui', 'heart']],
            ],
            o.tab,
            'hbTab',
        ) + (o.tab === 'pairs' ? pairsTab() : robesTab(o)),
});

// ---------------- 1.47 : les variétés du labo (carnets du potager et du verger) ----------------
const plantLook = (base, { c = 0, p = 0, s = 1, f = 0, halo = false }) =>
    genWrap(art('item', base), { t: {}, form: base, l: { size: pair(s), color: pair(c), pattern: pair(p), finish: pair(f) }, halo });
const SIZE_NAMES = ['Petite', 'Normale', 'Grosse', 'Géante', 'Fine', 'Naine', 'Gros fruit'];
export function plantRobesTab(kind, o) {
    if (!G.plantLabOpen()) return '<p class="empty">Les variétés se créent au labo des plantes (station de recherche, niveau 40).</p>';
    const bases = G.plantBookTypes(kind);
    if (!bases.length)
        return `<p class="empty">Créez une variété ${kind === 'tree' ? 'd’arbre fruitier' : 'de culture'} au labo : sa page s’ouvrira ici, avec toutes les couleurs et tous les motifs à obtenir.</p>`;
    const cur = bases.includes(o.base) ? o.base : bases[0];
    const chips = `<div class="chips-row hb-types">${bases
        .map(
            b =>
                `<button class="pick-chip${b === cur ? ' on' : ''}" data-act="pbBase" data-b="${b}">${ico(['item', b])}<small>${G.plantRobeCount(b)}/${G.robeTotal()}</small>${state.herdbook.pdone && state.herdbook.pdone[b] ? ico(['ui', 'ribbon']) : ''}</button>`,
        )
        .join('')}</div>`;
    const cell = (k, i, name) => {
        const got = G.hasPlantRobe(cur, k, i);
        return `<div class="hb-robe${got ? ' got' : ''}"><span class="hb-art">${got ? plantLook(cur, k === 'c' ? { c: i } : { p: i }) : art('item', cur)}</span><small>${got ? name : '?'}</small></div>`;
    };
    const rare = G.PLANT_RARE.map(id => {
        const got = G.hasPlantRare(id);
        const f = id === 'halo' ? { halo: true } : id[0] === 's' ? { s: +id.slice(1) } : { f: +id.slice(1) };
        const name = id === 'halo' ? 'Auréolée' : id[0] === 's' ? SIZE_NAMES[+id.slice(1)] : LOOKS.finish[+id.slice(1)];
        return `<div class="hb-robe${got ? ' got' : ''}"><span class="hb-art">${got ? plantLook(cur, f) : art('item', cur)}</span><small>${got ? name : '?'}</small></div>`;
    }).join('');
    // les variétés qui existent encore pour cette plante
    const vars = G.varieties().filter(v => v.base === cur);
    return `${chips}<div class="card hb-head"><div class="card-title">${ITEMS[cur].name} · ${G.plantRobeCount(cur)} sur ${G.robeTotal()}</div>
        <div class="card-sub">Chaque couleur et chaque motif obtenus au labo rapportent des pièces ; tous ensemble, un ruban.${vars.length ? ` Vos variétés : ${vars.map(v => esc(G.varName(v))).join(', ')}.` : ''}</div></div>
        <h4 class="hb-sub">Les couleurs</h4><div class="hb-grid">${G.ROBE_COLORS.map(i => cell('c', i, LOOKS.color[i])).join('')}</div>
        <h4 class="hb-sub">Les motifs</h4><div class="hb-grid">${G.ROBE_PATTERNS.map(i => cell('p', i, LOOKS.pattern[i])).join('')}</div>
        <h4 class="hb-sub">Les raretés (toutes ${kind === 'tree' ? 'les plantes' : 'les plantes'})</h4><div class="hb-grid">${rare}</div>
        <p class="card-sub hb-note">Les couleurs et les motifs viennent des croisements et des mutations au labo ; la ruche de sélection donne plus de mutations.</p>`;
}

export function setupHerdbook() {
    const o = () => sheetOpts('herdbook');
    actions({
        hbTab: (el, d) => (o().tab = d.v),
        hbType: (el, d) => (o().type = d.t),
        // les onglets des carnets du potager et du verger
        pbTab: (el, d) => {
            for (const id of ['companions', 'orchardLog']) {
                const s = sheetOpts(id);
                if (s) s.tab = d.v;
            }
        },
        pbBase: (el, d) => {
            for (const id of ['companions', 'orchardLog']) {
                const s = sheetOpts(id);
                if (s) s.base = d.b;
            }
        },
    });
}
