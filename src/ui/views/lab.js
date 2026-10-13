// Atelier | Labo : croiser des plantes, élever des animaux, suivre ses variétés, fixer et nommer ses créations, le Salon.
// Lisible avant tout : des icônes et des jauges, jamais de tableau de génétique.
import { state } from '../../core/state.js';
import { fmt } from '../../core/format.js';
import { on, toast } from '../../core/bus.js';
import { ITEMS } from '../../data/items.js';
import { ANIMALS } from '../../data/animals.js';
import { PLANT_TRAITS, ANIMAL_TRAITS, FLAVORS, ANIMAL_BASE, GENETICS as GX } from '../../data/genetics.js';
import { PROJECTS } from '../../data/village.js';
import * as G from '../../systems/index.js';
import { blocks, actions, esc, QUIET } from '../dom.js';
import { ico, art } from '../icons.js';
import { btn, hint, timer, section, bar, empty } from '../kit.js';
import { defineView, ui, go } from '../app.js';
import { defineSheet, openSheet, closeSheet } from '../sheets.js';
import { confirmTap } from '../confirm.js';
import { genWrap, looksText, animalArt, lineageHtml } from '../genlook.js';
import { renameBtn } from '../sheets/rename.js';

const pct = x => `${Math.round(x * 100)} %`;

// ---------------- petits morceaux ----------------
// le dessin d'une variété : le produit de son espèce de forme, avec son apparence
export const varArt = v => genWrap(art('item', v.g.form), v.g);
export const varPlantArt = (v, stage = 2) => genWrap(art('plant', `${v.g.form}:${stage}`), v.g);
const parentArt = p => {
    const v = G.variety(p);
    return v ? varArt(v) : art('item', p);
};

// une jauge de caractère : 5 points, ceux gagnés sur l'espèce en couleur ; les versions cachées en « ? »
function traitRow(t, g, base, analyzed) {
    const p = g.t[t.id];
    if (!p) return '';
    const v = G.express(p);
    const pips = Array.from({ length: 5 }, (_, k) => `<i class="${k < v ? (k >= base ? 'on up' : 'on') : ''}"></i>`).join('');
    const hid = analyzed ? `<small class="tr-al">${p[0][0]}${p[0][1] ? '' : 'r'} · ${p[1][0]}${p[1][1] ? '' : 'r'}</small>` : '<small class="tr-al">?</small>';
    return `<div class="tr" title="${t.name}">${ico(t.icon)}<span class="tr-name">${t.name}</span><span class="tr-pips">${pips}</span>${hid}</div>`;
}
export function plantTraits(g, analyzed, keys) {
    const base = FLAVORS[g.form] || [0, 0, 0, 0, 0];
    const list = PLANT_TRAITS.filter(t => !keys || keys.includes(t.id));
    return `<div class="traits">${list.map(t => traitRow(t, g, t.flavor ? base[G.FLAVOR_IDS.indexOf(t.id)] : 2, analyzed)).join('')}</div>`;
}
export function animalTraits(a) {
    const base = ANIMAL_BASE[a.type] || [];
    return `<div class="traits">${ANIMAL_TRAITS.map((t, j) => traitRow(t, a.g, base[j] || 2, a.analyzed)).join('')}</div>`;
}
const chance = (label, x, cls = '') => (x > 0.004 ? `<span class="chip ${cls}">${label} ${pct(x)}</span>` : '');

// ---------------- la station fermée ----------------
function closedCard() {
    const lvl = state.level < GX.lvl;
    return `<div class="card island-closed lab-closed">
        <div class="ic-art">${art('building', 'lab')}</div>
        <div class="card-title">La station de recherche</div>
        <p class="card-sub">${
            lvl
                ? `Au niveau ${GX.lvl}, la docteure Agathe et Victor le vétérinaire rouvrent la vieille station : croisez plantes et animaux, et créez vos propres variétés et races.`
                : !G.chapterOpen(15)
                  ? `Finissez d’abord le chapitre ${G.chapterNum(G.chapterAfter(15))} (l’île) : la station est au bout du chemin des vergers.`
                  : 'Aidez Agathe et Victor à rénover la station (volet Village, carte « La station ») : la serre de pollinisation ouvre les croisements de plantes, l’étable de sélection l’élevage.'
        }</p>
        ${lvl ? '' : btn('Voir la station', { act: 'goStation', kind: 'gold', wide: true, icon: ['ui', 'village'] })}
    </div>`;
}

// ---------------- croiser des plantes ----------------
function parentSlot(slot, p, kind) {
    const name = p ? (kind === 'plant' ? G.parentName(p) : esc((G.animalByUid(p) || {}).name || '?')) : 'Choisir';
    const a = p ? (kind === 'plant' ? parentArt(p) : animalArtOf(G.animalByUid(p))) : `<span class="o-plus">${ico(['ui', 'plus'])}</span>`;
    return `<button class="lab-parent${p ? '' : ' empty'}" data-act="pickParent" data-kind="${kind}" data-slot="${slot}"><span class="lp-art">${a}</span><b>${name}</b></button>`;
}
const animalArtOf = a => (a ? animalArt(a.type, a.g) : '');

function crossCard() {
    if (!G.plantLabOpen()) return lockedCard('pollination', ['item', 'strawberry'], 'Croiser des plantes');
    const c = state.genetics.cross;
    if (c)
        return `<div class="card lab-card"><div class="card-head">${ico(['ui', 'flowers'], 'ico big')}<div class="card-main"><div class="card-title">Pollinisation en cours</div>
            <div class="card-sub">${G.parentName(c.a)} × ${G.parentName(c.b)}</div></div></div>
            <div class="lab-pair">${parentSlotStatic(c.a)}<span class="lab-x">×</span>${parentSlotStatic(c.b)}</div>
            ${G.crossReady() ? btn('Récolter les graines', { act: 'finishCross', kind: 'gold', wide: true, size: 'lg', icon: ['ui', 'basket'] }) : `<div class="lab-wait">${ico(['ui', 'clock'])}Prêt dans ${timer(c.until)}</div>`}</div>`;
    const sel = (ui.sel.cross = ui.sel.cross || {});
    const ready = sel.a && sel.b && G.parentGenome(sel.a) && G.parentGenome(sel.b);
    let preview = '';
    if (ready) {
        const P = G.crossPreview(G.parentGenome(sel.a), G.parentGenome(sel.b), 'plant', 200);
        const forms = Object.keys(P.forms);
        preview = `<div class="lab-odds">${chance('Nouvel hybride', P.hybrid, 'ok')}${chance('Meilleur goût', P.better, 'now')}${chance('Retour vers un parent', P.back)}${chance('Mutation', P.mutation, 'stock')}${chance('Graines stériles', P.sterile, 'bad')}</div>
            ${forms.length > 1 ? `<p class="card-sub">Forme : ${forms.map(f => `${ITEMS[f].name.toLowerCase()} ${pct(P.forms[f])}`).join(' ou ')}</p>` : ''}
            <div class="lab-ranges">${PLANT_TRAITS.filter(t => t.flavor)
                .map(t => {
                    const [lo, hi] = P.range[t.id];
                    return hi > 0 ? `<span class="chip">${ico(t.icon)}${lo === hi ? lo : `${lo} à ${hi}`}</span>` : '';
                })
                .join('')}</div>`;
    }
    return `<div class="card lab-card"><div class="card-head">${ico(['ui', 'flowers'], 'ico big')}<div class="card-main"><div class="card-title">Croiser des plantes</div>
        <div class="card-sub">Deux espèces, ou deux variétés : les graines mêlent leurs gènes. Les issues ci-dessous sont des chances, pas des promesses.</div></div></div>
        <div class="lab-pair">${parentSlot('a', sel.a, 'plant')}<span class="lab-x">×</span>${parentSlot('b', sel.b, 'plant')}</div>
        ${preview}
        ${btn(`Polliniser · ${fmt(G.crossCost())}${ico(['ui', 'coin'])}`, { act: 'startCross', kind: ready ? 'green' : '', wide: true, disabled: !ready })}</div>`;
}
const parentSlotStatic = p => `<span class="lab-parent"><span class="lp-art">${parentArt(p)}</span><b>${G.parentName(p)}</b></span>`;

function lockedCard(pid, icon, title) {
    return `<div class="card lab-card locked"><div class="card-head">${ico(icon, 'ico big')}<div class="card-main"><div class="card-title">${title}</div>
        <div class="card-sub">S’ouvre avec le chantier « ${PROJECTS[pid].name} » (carte « La station »).</div></div></div></div>`;
}

// ---------------- élever ----------------
function breedCard() {
    if (!G.breedOpen()) return lockedCard('breeding', ['animal', 'cow'], 'Élever des animaux');
    const b = state.genetics.breed;
    if (b) {
        const A = G.animalByUid(b.a),
            B = G.animalByUid(b.b);
        return `<div class="card lab-card"><div class="card-head">${ico(['animal', b.type], 'ico big')}<div class="card-main"><div class="card-title">Un petit est en route</div>
            <div class="card-sub">${esc(A ? A.name : '?')} et ${esc(B ? B.name : '?')}</div></div></div>
            <div class="lab-wait">${ico(['ui', 'clock'])}Naissance dans ${timer(b.until)}${G.herdFull() ? ' · il faut une place au pré !' : ''}</div></div>`;
    }
    const sel = (ui.sel.breed = ui.sel.breed || {});
    const A = G.animalByUid(sel.a),
        B = G.animalByUid(sel.b);
    const ready = G.breedable(A, B);
    let preview = '';
    if (ready) {
        const P = G.crossPreview(A.g, B.g, 'animal', 200);
        preview = `<div class="lab-odds">${chance('Mieux que les parents', P.better, 'now')}${chance('Comme un parent', P.back)}${chance('Mutation', P.mutation, 'stock')}</div>
            <div class="lab-ranges">${ANIMAL_TRAITS.map(t => {
                const [lo, hi] = P.range[t.id];
                return `<span class="chip">${ico(t.icon)}${lo === hi ? lo : `${lo} à ${hi}`}</span>`;
            }).join('')}</div>`;
    }
    return `<div class="card lab-card"><div class="card-head">${ico(['animal', 'cow'], 'ico big')}<div class="card-main"><div class="card-title">Élever des animaux</div>
        <div class="card-sub">Deux adultes de la même espèce : le petit tient de l’un et de l’autre, et naît dans un pré qui a de la place.</div></div></div>
        <div class="lab-pair">${parentSlot('a', sel.a, 'animal')}<span class="lab-x">×</span>${parentSlot('b', sel.b, 'animal')}</div>
        ${preview}
        ${btn(`Faire naître · ${fmt(G.breedCost())}${ico(['ui', 'coin'])}`, { act: 'startBreed', kind: ready ? 'green' : '', wide: true, disabled: !ready })}</div>`;
}

// ---------------- mes variétés ----------------
function varTile(v) {
    const seeds = state.genetics.seeds[v.id] || 0,
        stock = state.genetics.stock[v.id] || 0;
    return `<button class="v-tile${v.fixed ? ' fixed' : ''}${G.canFix(v) ? ' can-fix' : ''}" data-act="open" data-sheet="variety" data-id="${v.id}">
        <span class="v-art">${varArt(v)}</span><b>${esc(G.varName(v))}</b>
        <small>${v.fixed ? `${ico(['ui', 'trophy'])}Fixée` : `Gén. ${v.gen} · ${pct(G.stability(v.g))} stable`}</small>
        <span class="v-counts">${seeds ? `<span>${ico(['ui', 'packet'])}${seeds}</span>` : ''}${stock ? `<span>${ico(['item', v.base])}${stock}</span>` : ''}</span></button>`;
}
function varietiesBlock() {
    const list = G.varieties().sort((a, b) => b.fixed - a.fixed || b.born - a.born);
    if (!list.length) return G.plantLabOpen() ? empty('Aucune variété pour le moment : faites votre premier croisement !') : '';
    return `<div class="v-grid">${list.map(varTile).join('')}</div>`;
}

// ---------------- le Salon ----------------
function salonCard() {
    if (!G.salonOpen()) return '';
    const s = state.genetics.salon;
    const crit = G.salonCrit();
    if (!s || !crit) return '';
    const rows = [...s.rivals, ...(s.entry ? [{ name: `${s.entry.name} (vous)`, score: s.entry.score, you: true }] : [])]
        .sort((a, b) => b.score - a.score)
        .map((r, k) => `<li class="${r.you ? 'me' : ''}"><b>${k + 1}</b><span>${esc(r.name)}</span><em>${String(r.score).replace('.', ',')}</em></li>`)
        .join('');
    return `<div class="card salon-card"><div class="card-head">${ico(crit.icon, 'ico big')}<div class="card-main"><div class="card-title">Salon de l’agriculture</div>
        <div class="card-sub">${crit.name} · se termine dans ${timer(s.end)}</div></div></div>
        <ol class="ranking">${rows}</ol>
        ${btn(s.entry ? 'Changer de candidat' : 'Inscrire une création', { act: 'open', data: { sheet: 'salonPick' }, kind: s.entry ? '' : 'gold', wide: true })}</div>`;
}

function renderLab(el) {
    G.ensureGenetics();
    if (!G.geneticsOpen()) {
        blocks(el, [['closed', closedCard()]]);
        return;
    }
    blocks(el, [
        ['cross', crossCard()],
        ['breed', breedCard()],
        [
            'h1',
            section(
                'Mes variétés',
                G.fixedVarieties().length || Object.keys(state.genetics.races).length
                    ? btn('Mes créations', { act: 'open', data: { sheet: 'creations' }, size: 'sm', icon: ['ui', 'trophy'] })
                    : '',
            ),
        ],
        ['vars', varietiesBlock()],
        ['salon', salonCard()],
        [
            'hint',
            hint(
                'Une variété se sème comme son espèce (graines dans la barre du champ, ou plantations de l’île). Pour la fixer : recroisez-la avec elle-même jusqu’à ce que tous ses gènes soient identiques par paires, puis nommez-la au laboratoire.',
            ),
        ],
    ]);
}
defineView('machines/lab', renderLab);

// ---------------- choisir un parent ----------------
defineSheet('parentPick', {
    title: o => (o.kind === 'animal' ? 'Choisir un adulte' : 'Choisir une plante'),
    render(o) {
        if (o.kind === 'animal') {
            const other = G.animalByUid((ui.sel.breed || {})[o.slot === 'a' ? 'b' : 'a']);
            const list = state.animals.filter(a => G.isAdult(a) && !a.sick && (!other || (a.type === other.type && a !== other)));
            if (!list.length) return empty('Aucun adulte disponible.');
            return `<div class="pick-grid animals">${list
                .sort((a, b) => (a.type < b.type ? -1 : a.type > b.type ? 1 : G.animalGain(b) - G.animalGain(a)))
                .map(
                    a =>
                        `<button class="pick-cell" data-act="setParent" data-kind="animal" data-slot="${o.slot}" data-id="${a.uid}"><span class="pc-art">${animalArtOf(a)}</span><b>${esc(a.name)}</b><small>${ANIMALS[a.type].name}${a.gen ? ` · gén. ${a.gen}` : ''}${G.animalGain(a) ? ` · +${G.animalGain(a)}` : ''}</small></button>`,
                )
                .join('')}</div>`;
        }
        const list = G.plantParents();
        const vars = list.filter(p => G.variety(p)),
            wild = list.filter(p => !G.variety(p));
        const cell = p => {
            const v = G.variety(p);
            const g = G.parentGenome(p);
            const fl = G.FLAVOR_IDS.map((k, j) => [k, G.traitOf(g, k), j])
                .filter(x => x[1] >= 3)
                .map(x => `${ico(PLANT_TRAITS[x[2]].icon)}${x[1]}`)
                .join(' ');
            return `<button class="pick-cell" data-act="setParent" data-kind="plant" data-slot="${o.slot}" data-id="${p}"><span class="pc-art">${parentArt(p)}</span><b>${v ? esc(G.varName(v)) : ITEMS[p].name}</b><small>${fl || '—'}</small></button>`;
        };
        return `${vars.length ? `${section('Mes variétés')}<div class="pick-grid">${vars.map(cell).join('')}</div>` : ''}${section('Espèces')}<div class="pick-grid">${wild.map(cell).join('')}</div>`;
    },
});

// ---------------- la fiche d'une variété ----------------
defineSheet('variety', {
    title: o => {
        const v = G.variety(o.id);
        return v ? esc(G.varName(v)) : '';
    },
    render(o) {
        const v = G.variety(o.id);
        if (!v) return empty('Cette variété n’existe plus.');
        const seeds = state.genetics.seeds[v.id] || 0,
            stock = state.genetics.stock[v.id] || 0;
        const stab = G.stability(v.g);
        const island = ITEMS[v.base].island;
        const lines = [
            `${ico(['item', v.base])}Pousse comme : <b>${ITEMS[v.base].name.toLowerCase()}</b>${island ? ' (sur l’île)' : ''}`,
            `${ico(['ui', 'star'])}Apparence : ${looksText(v.g)}${v.mut ? ' · mutation' : ''}`,
            `${ico(['ui', 'packet'])}${seeds} graine${seeds > 1 ? 's' : ''} · ${ico(['item', v.base])}${stock} en stock`,
        ];
        const actionsHtml = [
            seeds ? btn('Semer', { act: 'sowVariety', data: { id: v.id }, kind: 'green', icon: ['ui', 'packet'] }) : '',
            !v.fixed && G.plantLabOpen() && !state.genetics.cross
                ? btn('Recroiser avec elle-même', { act: 'selfCross', data: { id: v.id }, icon: ['ui', 'loop'] })
                : '',
            G.plantLabOpen() ? btn('Croiser avec…', { act: 'crossWith', data: { id: v.id }, icon: ['ui', 'flowers'] }) : '',
            G.labOpen() && !v.analyzed
                ? btn(`Analyser · ${fmt(G.analyzeCost())}${ico(['ui', 'coin'])}`, { act: 'analyze', data: { id: v.id }, icon: ['ui', 'search'] })
                : '',
            stock
                ? btn(`Vendre ${stock} · ${fmt(G.varietyPrice(v) * stock)}${ico(['ui', 'coin'])}`, { act: 'sellVariety', data: { id: v.id }, kind: 'gold' })
                : '',
            v.fixed && G.seedbankOpen()
                ? btn(`5 graines · ${fmt(G.seedPrice(v) * 5)}${ico(['ui', 'coin'])}`, { act: 'buyVarSeeds', data: { id: v.id }, kind: 'green' })
                : '',
        ].join('');
        const fix = v.fixed
            ? `<p class="card-sub center">${ico(['ui', 'trophy'])} Variété fixée : elle fait partie de vos créations.</p>`
            : `<div class="fix-box"><div class="fix-head"><span>Stabilité</span>${bar(stab, 'fix-bar')}<b>${pct(stab)}</b></div>
                <p class="card-sub">${
                    G.canFix(v)
                        ? 'Tous ses gènes sont identiques par paires : vous pouvez la fixer et lui donner un nom.'
                        : !G.labOpen()
                          ? 'Pour fixer une variété, il faut le laboratoire de la station.'
                          : v.gen < GX.fixGen
                            ? `Génération ${v.gen} : il en faut au moins ${GX.fixGen}. Recroisez-la avec elle-même.`
                            : 'Encore des gènes mélangés : recroisez-la avec elle-même et gardez les meilleures.'
                }</p>
                ${G.canFix(v) ? `<div class="rename"><input type="text" maxlength="22" id="fix-name" placeholder="Son nom" value="${esc(G.varName(v))}">${btn('Fixer', { act: 'fixVariety', data: { id: v.id }, kind: 'gold', size: 'sm' })}</div>` : ''}</div>`;
        return `<div class="variety-card">
            <div class="tree-art var-art">${varPlantArt(v)}</div>
            <div class="animal-kind">${v.fixed ? 'Création' : `Hybride · génération ${v.gen}`}${renameBtn('variety', v.id, 'Renommer la variété')}</div>
            <div class="lines">${lines.map(l => `<div class="line"><div>${l}</div></div>`).join('')}</div>
            ${plantTraits(v.g, v.analyzed)}
            ${v.lin ? `<div class="set-sub">Sa lignée</div>${lineageHtml({ lin: v.lin, me: G.lineSnap(v) })}` : ''}
            ${v.analyzed ? '' : `<p class="card-sub center">« ? » : la version cachée de chaque gène${G.labOpen() ? ', révélée par une analyse' : ''}.</p>`}
            ${fix}
            <div class="row-btns wrap">${actionsHtml}</div>
            ${v.fixed ? '' : `<div class="row-btns">${btn('Jeter cette variété', { act: 'discardVariety', data: { id: v.id }, kind: 'red', size: 'sm' })}</div>`}
        </div>`;
    },
});

// ---------------- mes créations ----------------
defineSheet('creations', {
    title: 'Mes créations',
    render() {
        const vars = G.fixedVarieties(),
            races = Object.values(state.genetics.races);
        if (!vars.length && !races.length) return empty('Fixez une variété ou une race au laboratoire : elle apparaîtra ici, avec le nom que vous lui donnez.');
        const vHtml = vars
            .map(
                v => `<div class="card crea-card"><span class="crea-art">${varArt(v)}</span><div class="card-main"><div class="card-title">${esc(v.name)}${renameBtn('variety', v.id, 'Renommer la variété')}</div>
                <div class="card-sub">${ITEMS[v.base].name} · ${looksText(v.g)}</div>${plantTraits(v.g, true, G.FLAVOR_IDS)}</div>
                <div class="card-side col">${G.seedbankOpen() ? btn(`5 graines · ${fmt(G.seedPrice(v) * 5)}${ico(['ui', 'coin'])}`, { act: 'buyVarSeeds', data: { id: v.id }, size: 'sm', kind: 'green' }) : ''}${btn('Fiche', { act: 'open', data: { sheet: 'variety', id: v.id }, size: 'sm' })}</div></div>`,
            )
            .join('');
        const rHtml = races
            .map(
                r => `<div class="card crea-card"><span class="crea-art">${animalArt(r.type, r.g)}</span><div class="card-main"><div class="card-title">${esc(r.name)}${renameBtn('race', r.id, 'Renommer la race')}</div>
                <div class="card-sub">${ANIMALS[r.type].name} · ${looksText(r.g)}</div>${animalTraits({ type: r.type, g: r.g, analyzed: true })}</div>
                <div class="card-side col">${G.seedbankOpen() ? btn(`Un petit · ${fmt(G.racePrice(r))}${ico(['ui', 'coin'])}`, { act: 'buyRaceBaby', data: { id: r.id }, size: 'sm', kind: 'green' }) : ''}</div></div>`,
            )
            .join('');
        return `${vars.length ? section('Variétés') + `<div class="list">${vHtml}</div>` : ''}${races.length ? section('Races') + `<div class="list">${rHtml}</div>` : ''}
            ${G.seedbankOpen() ? '' : hint('Avec le conservatoire des semences (carte « La station »), vous pourrez racheter graines et petits de vos créations.')}`;
    },
});

// ---------------- inscrire au Salon ----------------
defineSheet('salonPick', {
    title: 'Inscrire au Salon',
    render() {
        const crit = G.salonCrit();
        const list = G.salonCandidates().sort((a, b) => b.score - a.score);
        if (!crit) return '';
        return `<p class="card-sub center">${crit.name} : la note de chaque création pour ce critère.</p>${
            list.length
                ? `<div class="list">${list
                      .slice(0, 30)
                      .map(
                          c =>
                              `<button class="row" data-act="enterSalon" data-id="${c.id}"><span class="row-main"><span>${esc(c.name)}</span></span><b>${String(c.score).replace('.', ',')}</b></button>`,
                      )
                      .join('')}</div>`
                : empty(crit.kind === 'plant' ? 'Aucune variété à présenter : croisez des plantes au labo.' : 'Aucun animal à présenter pour ce critère.')
        }`;
    },
});

export function setupLab() {
    actions({
        goStation: () => {
            ui.sel.map = 'station';
            ui.sel.proj = 'pollination';
            go('village/village');
        },
        pickParent: (el, d) => openSheet('parentPick', { kind: d.kind, slot: d.slot }),
        setParent: (el, d) => {
            const sel = d.kind === 'animal' ? (ui.sel.breed = ui.sel.breed || {}) : (ui.sel.cross = ui.sel.cross || {});
            sel[d.slot] = d.id;
            closeSheet('parentPick');
        },
        startCross: el => {
            const s = ui.sel.cross || {};
            if (G.startCross(s.a, s.b, el)) ui.sel.cross = {};
        },
        finishCross: el => {
            const v = G.finishCross(el);
            if (v) openSheet('variety', { id: v.id });
        },
        startBreed: el => {
            const s = ui.sel.breed || {};
            if (G.startBreed(s.a, s.b, el)) ui.sel.breed = {};
        },
        selfCross: (el, d) => {
            if (G.startCross(d.id, d.id, el)) {
                closeSheet('variety');
                go('machines/lab');
            }
        },
        crossWith: (el, d) => {
            ui.sel.cross = { a: d.id };
            closeSheet('variety');
            go('machines/lab');
        },
        analyze: (el, d) => G.analyze(d.id, el),
        sellVariety: (el, d) => G.sellVariety(d.id, state.genetics.stock[d.id] || 0, el),
        buyVarSeeds: (el, d) => G.buyVarietySeeds(d.id, 5, el),
        buyRaceBaby: (el, d) => G.buyRaceBaby(d.id, el),
        fixVariety: (el, d) => {
            const input = document.getElementById('fix-name');
            G.fixVariety(d.id, input ? input.value : '', el);
        },
        discardVariety: (el, d) => {
            if (!confirmTap('discard' + d.id, el, 'Toucher encore pour la jeter')) return QUIET;
            if (G.discardVariety(d.id)) closeSheet('variety');
        },
        sowVariety: (el, d) => {
            const v = G.variety(d.id);
            if (!v) return;
            state.genetics.tool = v.id;
            closeSheet('variety');
            if (ITEMS[v.base].island) {
                ui.sel.isleVar = v.id;
                go('farm/island');
            } else {
                G.selectTool('var');
                go('farm/field');
            }
        },
        enterSalon: (el, d) => {
            if (G.enterSalon(d.id)) closeSheet('salonPick');
        },
    });
    on('salonResult', ({ rank, coins, rub }) => {
        const txt = rank === 1 ? 'Premier prix au Salon !' : `${rank}e place au Salon`;
        toast(`${txt} ${fmt(coins)} pièces${rub ? ` et ${rub} ruban${rub > 1 ? 's' : ''}` : ''}`, ['ui', 'trophy']);
    });
}
