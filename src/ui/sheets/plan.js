// 1.133 : le plan de production. Choisir un plat (ou plusieurs grâce au Tableau d'intendance du domaine,
// une bière maison, ou toute une commande en 1 clic), voir toute la chaîne, tout lancer d'un coup.
import { state } from '../../core/state.js';
import { fmt, qtyName } from '../../core/format.js';
import { ITEMS } from '../../data/items.js';
import { RECIPES, MACHINES } from '../../data/machines.js';
import { DOMAINE_LVL, PLAN_UPGRADE } from '../../data/domaine.js';
import { ABBEY } from '../../data/abbey.js';
import { beerSvg } from '../../art/abbey.js';
import * as G from '../../systems/index.js';
import { defineSheet, openSheet, closeAll } from '../sheets.js';
import { actions, esc } from '../dom.js';
import { ui } from '../app.js';
import { ico, art } from '../icons.js';
import { btn, empty, bar, segmented } from '../kit.js';
import { searchBox, queryOf, matchQ } from '../pager.js';

const dur = s => {
    s = Math.round(s / 60);
    return s < 60 ? `${Math.max(1, s)} min` : `${Math.floor(s / 60)} h${s % 60 ? ` ${String(s % 60).padStart(2, '0')}` : ''}`;
};
const BLOCK = { recipe: 'recette pas encore apprise', machine: 'il faut cette machine' };
const plainName = id => (ITEMS[id] ? ITEMS[id].name.toLowerCase() : G.ingName(id).toLowerCase());
const rawArt = id => (ITEMS[id] ? art('item', id) : art('item', G.ingBase(id)));
const rawHave = id => (ITEMS[id] ? state.inventory[id] || 0 : G.ingHave(id));
const rawName = id => (ITEMS[id] ? ITEMS[id].name : G.ingName(id));
const beerArt = b => `<span class="rneed-art plan-beer-art">${beerSvg(b)}</span>`;

// la liste : étapes à lancer, produits bruts qui manquent, ce qui bloque
function chain(sum, finals = '') {
    const rows = [];
    for (const x of sum.blocked)
        rows.push(
            `<div class="rneed"><span class="rneed-art">${art('item', x.id)}</span><span class="row-main"><b>${ITEMS[x.id].name}</b><small class="short">${BLOCK[x.blocked]} · ${MACHINES[RECIPES[x.id].machine].name}</small></span>${btn('Voir', { act: 'produce', data: { id: x.id }, size: 'sm' })}</div>`,
        );
    for (const s of sum.steps.filter(s => !sum.blocked.some(b => b.id === s.id))) {
        const c = G.coming(s.id);
        rows.push(
            `<div class="rneed${s.n ? '' : ' ok'}"><span class="rneed-art">${art('item', s.id)}</span><span class="row-main"><b>${s.n} ${s.n > 1 ? 'lots' : 'lot'} de ${plainName(s.id)}</b><small>${MACHINES[s.machine].name}${c ? ` · ${c} en route` : ''}</small></span>${ico(['machine', s.machine])}</div>`,
        );
    }
    for (const r of sum.raws) {
        const base = ITEMS[r.id] ? r.id : G.ingBase(r.id);
        rows.push(
            `<div class="rneed"><span class="rneed-art">${rawArt(r.id)}</span><span class="row-main"><b>Il manque ${esc(qtyName(r.n, rawName(r.id)).toLowerCase())}</b><small>${G.sourceOf(base) || 'à récolter'} · en stock : ${fmt(rawHave(r.id))}</small></span>${ITEMS[base] ? btn('Y aller', { act: 'produce', data: { id: base }, kind: 'gold', size: 'sm' }) : ''}</div>`,
        );
    }
    if (finals) rows.push(finals);
    return rows.length ? `<div class="rneeds">${rows.join('')}</div>` : '';
}

function targetRows(list) {
    return list
        .map(e => {
            const done = e.queued >= e.n;
            const ready = done || e.go || G.entryReady(e);
            if (e.kind === 'beer') {
                const b = G.beerOf(e.bid);
                const label = b ? esc(b.name) : 'Bière maison';
                return `<div class="rneed${done ? ' ok' : ready ? ' ok' : ''}">${b ? beerArt(b) : `<span class="rneed-art">${art('ui', 'beer')}</span>`}<span class="row-main"><b>${e.n} brassin${e.n > 1 ? 's' : ''} · ${label}</b><small>Brasserie · ${e.queued} lancé${e.queued > 1 ? 's' : ''} sur ${e.n} (${e.n * ABBEY.bottles} bouteilles)</small></span>${ico(['ui', done || ready ? 'check' : 'clock'])}</div>`;
            }
            return `<div class="rneed${done || ready ? ' ok' : ''}"><span class="rneed-art">${art('item', e.id)}</span><span class="row-main"><b>${e.n} ${plainName(e.id)}</b><small>${MACHINES[RECIPES[e.id].machine].name} · ${e.queued} lancé${e.queued > 1 ? 's' : ''} sur ${e.n}</small></span>${ico(['ui', done || ready ? 'check' : 'clock'])}</div>`;
        })
        .join('');
}

function current(p) {
    const sum = G.planSummary();
    const list = G.planEntries(p);
    const info = G.planInfo(p);
    const hasBeer = list.some(e => e.kind === 'beer');
    const ready = G.finalReady() || p.go;
    const state2 =
        G.barnSpace() <= 0
            ? 'La grange est pleine : le plan ne peut plus ramasser ce que font les machines. Faites de la place.'
            : sum.blocked.length
              ? 'Une étape est bloquée : voyez ci-dessous.'
              : sum.raws.length
                ? 'Il manque des produits du champ, des bêtes ou du rucher : le plan reprend tout seul dès qu’ils sont en grange.'
                : ready
                  ? hasBeer
                      ? 'Les ingrédients sont prêts : les lots et brassins partent dès qu’une machine ou une cuve se libère.'
                      : 'Tout est prêt : les produits finaux partent dès qu’une place se libère.'
                  : 'Les machines préparent les ingrédients. Chaque produit final partira tout seul dès que tout est réuni.';
    return `${p.label || list.length > 1 ? `<div class="card-head">${ico(info.icon, 'ico big')}<div class="card-main"><div class="card-title">${esc(info.title)}</div><div class="card-sub">${p.queued} / ${p.n} lancé${p.queued > 1 ? 's' : ''}</div></div></div>` : ''}
        <p class="card-sub">${state2}${sum.time ? ` Encore environ ${dur(sum.time)}.` : ''}</p>
        ${bar(p.n ? p.queued / p.n : 0)}
        ${chain(sum, targetRows(list))}
        <p class="card-sub">Ce que le plan garde ne part ni au grossiste ni à l’étal. Il ramasse lui-même les étapes${hasBeer ? ' et enchaîne les brassins en cuve' : ''} ; le résultat vous attend à sa machine.</p>
        <div class="row-btns">${btn('Arrêter le plan', { act: 'planStop', size: 'sm' })}${btn('Nouveau plan', { act: 'planPick', size: 'sm', icon: ['ui', 'loop'] })}</div>`;
}

// 1.134 : la quantité au choix : les raccourcis, les boutons − et +, et une case où taper le nombre
const clampN = n => Math.max(1, Math.min(G.PLAN_MAX, Math.round(n) || 1));
const getDraft = () => (ui.sel.planDraft = Array.isArray(ui.sel.planDraft) ? ui.sel.planDraft : []);
const sameEntry = (a, b) => (a.kind === 'beer' ? b.kind === 'beer' && a.bid === b.bid : b.kind !== 'beer' && a.id === b.id);

function upsellHtml() {
    if (G.planCap() > 1) return '';
    if (G.domaineOpen()) {
        return `<div class="plan-upsell"><span><b>Plusieurs plats en un seul plan ?</b><small>${PLAN_UPGRADE.name} (Domaine) permet d’enchaîner jusqu’à ${PLAN_UPGRADE.caps.at(-1)} plats ou bières ensemble.</small></span>${btn('Domaine', { act: 'planDomaine', size: 'sm', kind: 'gold' })}</div>`;
    }
    return `<p class="card-sub">Au niveau ${DOMAINE_LVL}, le <b>${PLAN_UPGRADE.name}</b> (Domaine) permet d’enchaîner plusieurs plats et bières maison dans un même plan.</p>`;
}

function draftBox() {
    const cap = G.planCap();
    const draft = getDraft();
    if (cap <= 1 || !draft.length) return '';
    const sum = G.prodMultiPreview(draft);
    const ok = !sum.blocked.length;
    const rows = draft
        .map((e, k) => {
            const isB = e.kind === 'beer';
            const b = isB ? G.beerOf(e.bid) : null;
            const name = isB ? (b ? esc(b.name) : 'Bière') : ITEMS[e.id].name;
            const sub = isB ? `${e.n} brassin${e.n > 1 ? 's' : ''} · ${e.n * ABBEY.bottles} bout.` : MACHINES[RECIPES[e.id].machine].name;
            return `<div class="rneed">${isB && b ? beerArt(b) : `<span class="rneed-art">${art('item', e.id)}</span>`}<span class="row-main"><b>${name}</b><small>${sub}</small></span>
                <div class="stepper">${btn('', { act: 'planDraftQty', data: { k, d: -1 }, icon: ['ui', 'minus'], size: 'sm', disabled: e.n <= 1 })}<b>×${e.n}</b>${btn('', { act: 'planDraftQty', data: { k, d: 1 }, icon: ['ui', 'plus'], size: 'sm', disabled: e.n >= G.PLAN_MAX })}</div>
                ${btn('', { act: 'planDraftDel', data: { k }, icon: ['ui', 'cross'], kind: 'ghost', size: 'sm', title: 'Retirer' })}</div>`;
        })
        .join('');
    return `<div class="card plan-draft">
        <div class="card-head">${ico(['ui', 'loop'], 'ico big')}<div class="card-main"><div class="card-title">Plan en préparation · ${draft.length} / ${cap}</div><div class="card-sub">Chaîne commune · environ ${dur(sum.time)}</div></div></div>
        <div class="rneeds">${rows}</div>
        ${chain(sum) || '<p class="card-sub">Tout est déjà en grange : tout partira dès le lancement.</p>'}
        ${G.planOf() ? `<p class="card-sub short">Un plan est déjà en cours (${esc(G.planInfo().title)}) : il sera remplacé.</p>` : ''}
        <div class="row-btns">${btn('Vider', { act: 'planDraftClear', size: 'sm' })}${btn(`Tout lancer (${draft.length})`, { act: 'planDraftGo', kind: 'gold', disabled: !ok, icon: ['ui', 'loop'] })}</div>
    </div>`;
}

function choose(id, bid) {
    const isBeer = !!bid;
    const b = isBeer ? G.beerOf(bid) : null;
    if (isBeer && !b) return picker();
    const n = clampN(ui.sel.planN || (isBeer ? 3 : 10));
    const sum = isBeer ? G.beerPreview(bid, n) : G.prodPreview(id, n);
    const ok = !sum.blocked.length;
    const raw = ui.sel.planRaw !== undefined ? ui.sel.planRaw : String(n);
    const cap = G.planCap();
    const draft = getDraft();
    const entry = isBeer ? { kind: 'beer', bid, n } : { kind: 'recipe', id, n };
    const inDraft = draft.some(x => sameEntry(x, entry));
    const canAdd = cap > 1 && (inDraft || draft.length < cap);
    const headHtml = isBeer
        ? `<div class="card-head"><span class="plan-beer-big">${beerSvg(b)}</span><div class="card-main"><div class="card-title">${n} brassin${n > 1 ? 's' : ''} · ${esc(b.name)}</div><div class="card-sub">${n * ABBEY.bottles} bouteilles · environ ${dur(sum.time)} · en stock : ${fmt(G.beerStock(bid))}</div></div></div>`
        : `<div class="card-head">${ico(['item', id], 'ico big')}<div class="card-main"><div class="card-title">${n} ${plainName(id)}</div><div class="card-sub">${MACHINES[RECIPES[id].machine].name} · environ ${dur(sum.time)} · en stock : ${fmt(state.inventory[id] || 0)}</div></div></div>`;
    const presets = isBeer ? [1, 2, 3, 5, 10] : G.PLAN_QTYS;
    const goData = isBeer ? { bid } : { id };
    const btns = canAdd
        ? `${btn('Retour', { act: 'planPick', size: 'sm' })}${btn(inDraft ? 'Mettre à jour' : `Ajouter (${draft.length}/${cap})`, { act: 'planDraftAdd', data: goData, size: 'sm', kind: 'green' })}${btn(`Lancer seul`, { act: 'planGo', data: goData, kind: 'gold', disabled: !ok, icon: ['ui', 'loop'], size: 'sm' })}`
        : `${btn(isBeer ? 'Autres bières' : 'Changer de plat', { act: 'planPick', size: 'sm' })}${btn(`Tout lancer · ${n}`, { act: 'planGo', data: goData, kind: 'gold', disabled: !ok, icon: ['ui', 'loop'] })}`;
    return [
        ['head', headHtml],
        [
            'qty',
            `<div class="plan-qty">${btn('10', { act: 'planStep', data: { d: -10 }, icon: ['ui', 'minus'], disabled: n <= 1, title: '10 de moins' })}${btn('', { act: 'planStep', data: { d: -1 }, icon: ['ui', 'minus'], disabled: n <= 1, title: 'Un de moins' })}
            <input type="number" inputmode="numeric" min="1" max="${G.PLAN_MAX}" value="${esc(raw)}" data-input="planQty" aria-label="Quantité à faire">
            ${btn('', { act: 'planStep', data: { d: 1 }, icon: ['ui', 'plus'], disabled: n >= G.PLAN_MAX, title: 'Un de plus' })}${btn('10', { act: 'planStep', data: { d: 10 }, icon: ['ui', 'plus'], disabled: n >= G.PLAN_MAX, title: '10 de plus' })}</div>`,
        ],
        ['presets', `<div class="chips-row">${presets.map(q => `<button class="pick-chip${q === n ? ' on' : ''}" data-act="planN" data-n="${q}">×${q}</button>`).join('')}</div>`],
        ['chain', chain(sum) || `<p class="card-sub">Tout est déjà en grange : le plan lance ${isBeer ? 'les brassins' : 'le plat'} tout de suite.</p>`],
        [
            'note',
            `<p class="card-sub">${sum.raws.length ? 'Les produits qui manquent sont seulement signalés : le plan attend qu’ils soient en grange.' : 'Rien ne manque du champ ni des bêtes.'} ${isBeer ? `Les ${n} brassin${n > 1 ? 's' : ''} s’enchaînent automatiquement dans vos cuves libres.` : `Le plat final part tout seul quand il y a de quoi faire les ${n}.`}</p>
            ${G.planOf() ? `<p class="card-sub short">Un plan est déjà en cours (${esc(G.planInfo().title)}) : il sera remplacé.</p>` : ''}
            ${upsellHtml()}`,
        ],
        ['go', `<div class="row-btns">${btns}</div>`],
    ];
}

function picker() {
    const beers = G.brewOpen() ? G.myBeers().filter(b => G.brewPlannable(b.id)) : [];
    const tab = ui.sel.planTab === 'beer' && beers.length ? 'beer' : 'dish';
    const q = queryOf('plan');
    const tabsHtml = beers.length
        ? segmented(
              [
                  ['dish', 'Plats'],
                  ['beer', `Bières maison (${beers.length})`],
              ],
              tab,
              'planTab',
          )
        : '';
    let listHtml = '';
    if (tab === 'beer') {
        const list = (q ? beers.filter(b => matchQ(q, b.name, ...b.ings.map(x => G.ingName(x[0])))) : beers)
            .sort((a, b) => (G.isFav(b.id) ? 1 : 0) - (G.isFav(a.id) ? 1 : 0) || b.stars - a.stars || b.value - a.value)
            .slice(0, 40);
        listHtml = list.length
            ? `<div class="rneeds">${list
                  .map(
                      b =>
                          `<button class="rneed" data-act="planPick" data-bid="${b.id}">${beerArt(b)}<span class="row-main"><b>${esc(b.name)}</b><small>${'★'.repeat(b.stars)}${'☆'.repeat(3 - b.stars)} · ${b.mead ? 'Hydromel' : 'Bière'} · ${G.beerStock(b.id)} en stock</small></span>${ico(['ui', 'arrow'])}</button>`,
                  )
                  .join('')}</div>`
            : empty('Aucune bière maison ne correspond.');
    } else {
        const all = Object.values(RECIPES)
            .filter(r => G.plannable(r.id) && Object.keys(r.ing).some(k => RECIPES[k]))
            .sort((a, b) => b.lvl - a.lvl || ITEMS[a.id].name.localeCompare(ITEMS[b.id].name));
        const list = (q ? all.filter(r => matchQ(q, ITEMS[r.id].name, MACHINES[r.machine].name)) : all).slice(0, 40);
        listHtml = list.length
            ? `<div class="rneeds">${list
                  .map(
                      r =>
                          `<button class="rneed" data-act="planPick" data-id="${r.id}"><span class="rneed-art">${art('item', r.id)}</span><span class="row-main"><b>${ITEMS[r.id].name}</b><small>${MACHINES[r.machine].name} · ${Object.keys(r.ing).length} ingrédients</small></span>${ico(['ui', 'arrow'])}</button>`,
                  )
                  .join('')}</div>`
            : empty('Aucun plat ne correspond.');
    }
    const cap = G.planCap();
    const intro =
        tab === 'beer'
            ? 'Planifiez plusieurs brassins de vos bières maison ou hydromels : la malterie et les ateliers préparent tout, puis les cuves s’enchaînent.'
            : cap > 1
              ? `Composez un plan jusqu’à ${cap} plats ou bières : toute la chaîne et les ingrédients communs sont calculés ensemble.`
              : 'Les plats qui passent par plusieurs machines. Choisissez-en un : le plan calcule toute la chaîne.';
    return [
        ['draft', draftBox()],
        ['tabs', tabsHtml],
        ['intro', `<p class="card-sub">${intro}</p>${upsellHtml()}`],
        ['search', searchBox('plan', tab === 'beer' ? 'Chercher une bière maison' : 'Chercher un plat')],
        ['list', listHtml],
    ];
}

defineSheet('plan', {
    title: `${ico(['ui', 'loop'])}Plan de production`,
    render(o) {
        const p = G.planOf();
        if (o.bid && G.brewPlannable(o.bid)) return choose(null, o.bid);
        if (o.id && RECIPES[o.id]) return choose(o.id, null);
        if (p && !o.pick) return current(p);
        return picker();
    },
});

// la carte en haut de l'atelier
export function planCard() {
    const p = G.planOf();
    if (!p)
        return `<button class="plan-strip" data-act="open" data-sheet="plan">${ico(['ui', 'loop'])}<span><b>Plan de production</b><small>Plats en quantité, commandes ou bières maison : toute la chaîne d’un coup</small></span>${ico(['ui', 'arrow'])}</button>`;
    const sum = G.planSummary();
    const info = G.planInfo(p);
    const what = sum.blocked.length
        ? 'bloqué'
        : sum.raws.length
          ? `il manque ${sum.raws
                .map(r => qtyName(r.n, rawName(r.id)).toLowerCase())
                .slice(0, 2)
                .join(', ')}`
          : G.finalReady() || p.go
            ? 'les produits finaux partent'
            : 'les ingrédients se préparent';
    const artHtml = info.beer ? `<span class="plan-beer-strip">${beerSvg(info.beer)}</span>` : ico(info.icon);
    return `<button class="plan-strip on" data-act="open" data-sheet="plan">${artHtml}<span><b>${esc(info.title)} · ${p.queued}/${p.n}</b><small>${esc(what)}</small>${bar(p.n ? p.queued / p.n : 0)}</span>${ico(['ui', 'arrow'])}</button>`;
}

export function setupPlan() {
    actions({
        planTab: (el, d) => {
            ui.sel.planTab = d.v === 'beer' ? 'beer' : 'dish';
        },
        planN: (el, d) => {
            ui.sel.planN = clampN(+d.n);
            delete ui.sel.planRaw;
        },
        planStep: (el, d) => {
            ui.sel.planN = clampN((ui.sel.planN || 10) + +d.d);
            delete ui.sel.planRaw;
        },
        // en tapant : la case garde ce qu'on écrit ; le nombre compte dès qu'il est valable
        planQty: (el, d) => {
            ui.sel.planRaw = d.value;
            const v = parseInt(d.value, 10);
            if (v > 0) ui.sel.planN = clampN(v);
            if (v > G.PLAN_MAX) ui.sel.planRaw = String(G.PLAN_MAX);
        },
        planPick: (el, d) => {
            delete ui.sel.planRaw;
            if (d.bid) {
                ui.sel.planN = 3;
                openSheet('plan', { bid: d.bid });
            } else if (d.id) {
                ui.sel.planN = 10;
                openSheet('plan', { id: d.id });
            } else openSheet('plan', { pick: true });
        },
        planBeer: (el, d) => {
            delete ui.sel.planRaw;
            ui.sel.planTab = 'beer';
            ui.sel.planN = 3;
            openSheet('plan', { bid: d.id });
        },
        planGo: (el, d) => {
            delete ui.sel.planRaw;
            const n = clampN(ui.sel.planN || (d.bid ? 3 : 10));
            const ok = d.bid ? G.startBeerPlan(d.bid, n) : G.startPlan(d.id, n);
            if (ok) {
                if (G.planOf()) openSheet('plan', {});
                else closeAll();
            }
        },
        planDraftAdd: (el, d) => {
            delete ui.sel.planRaw;
            const n = clampN(ui.sel.planN || (d.bid ? 3 : 10));
            const entry = d.bid ? { kind: 'beer', bid: d.bid, n } : { kind: 'recipe', id: d.id, n };
            const draft = getDraft();
            const idx = draft.findIndex(x => sameEntry(x, entry));
            if (idx >= 0) draft[idx].n = n;
            else if (draft.length < G.planCap()) draft.push(entry);
            openSheet('plan', { pick: true });
        },
        planDraftQty: (el, d) => {
            const draft = getDraft();
            const e = draft[+d.k];
            if (e) e.n = clampN(e.n + +d.d);
        },
        planDraftDel: (el, d) => {
            const draft = getDraft();
            draft.splice(+d.k, 1);
        },
        planDraftClear: () => {
            ui.sel.planDraft = [];
        },
        planDraftGo: () => {
            const draft = getDraft();
            if (G.startMultiPlan(draft)) {
                ui.sel.planDraft = [];
                if (G.planOf()) openSheet('plan', {});
                else closeAll();
            }
        },
        planOrder: (el, d) => {
            const ref = d.kind === 'quest' ? +d.ref : d.ref;
            if (G.startOrderPlan(d.kind, ref)) {
                if (G.planOf()) openSheet('plan', {});
                else closeAll();
            }
        },
        planDomaine: () => openSheet('domaine', {}),
        planStop: () => {
            G.stopPlan();
            closeAll();
        },
    });
}
