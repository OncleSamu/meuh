// 1.133 : le plan de production. Choisir un plat et une quantité, voir toute la chaîne, tout lancer d'un coup.
import { state } from '../../core/state.js';
import { fmt, qtyName } from '../../core/format.js';
import { ITEMS } from '../../data/items.js';
import { RECIPES, MACHINES } from '../../data/machines.js';
import * as G from '../../systems/index.js';
import { defineSheet, openSheet, closeAll } from '../sheets.js';
import { actions, esc } from '../dom.js';
import { ui } from '../app.js';
import { ico, art } from '../icons.js';
import { btn, empty, bar } from '../kit.js';
import { searchBox, queryOf, matchQ } from '../pager.js';

const dur = s => {
    s = Math.round(s / 60);
    return s < 60 ? `${Math.max(1, s)} min` : `${Math.floor(s / 60)} h${s % 60 ? ` ${String(s % 60).padStart(2, '0')}` : ''}`;
};
const BLOCK = { recipe: 'recette pas encore apprise', machine: 'il faut cette machine' };
const plainName = id => ITEMS[id].name.toLowerCase();

// la liste : étapes à lancer, produits bruts qui manquent, ce qui bloque
function chain(sum, final) {
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
    for (const r of sum.raws)
        rows.push(
            `<div class="rneed"><span class="rneed-art">${art('item', r.id)}</span><span class="row-main"><b>Il manque ${esc(qtyName(r.n, ITEMS[r.id].name).toLowerCase())}</b><small>${G.sourceOf(r.id) || 'à récolter'} · en stock : ${fmt(state.inventory[r.id] || 0)}</small></span>${btn('Y aller', { act: 'produce', data: { id: r.id }, kind: 'gold', size: 'sm' })}</div>`,
        );
    if (final) rows.push(final);
    return rows.length ? `<div class="rneeds">${rows.join('')}</div>` : '';
}

function current(p) {
    const sum = G.planSummary();
    const left = p.n - p.queued;
    const ready = G.finalReady() || p.go;
    const state2 =
        G.barnSpace() <= 0
            ? 'La grange est pleine : le plan ne peut plus ramasser ce que font les machines. Faites de la place.'
            : sum.blocked.length
              ? 'Une étape est bloquée : voyez ci-dessous.'
              : sum.raws.length
                ? 'Il manque des produits du champ ou des bêtes : le plan reprend tout seul dès qu’ils sont en grange.'
                : ready
                  ? `Tout est prêt : les ${left} ${plainName(p.id)} partent dès qu’une place se libère.`
                  : 'Les machines préparent les ingrédients. Le plat final partira tout seul quand il y aura de quoi faire toute la quantité.';
    const final = `<div class="rneed${ready ? ' ok' : ''}"><span class="rneed-art">${art('item', p.id)}</span><span class="row-main"><b>${p.n} ${plainName(p.id)}</b><small>${MACHINES[RECIPES[p.id].machine].name} · ${p.queued} lancé${p.queued > 1 ? 's' : ''} sur ${p.n}</small></span>${ico(['ui', ready ? 'check' : 'clock'])}</div>`;
    return `<p class="card-sub">${state2}${sum.time ? ` Encore environ ${dur(sum.time)}.` : ''}</p>
        ${bar(p.queued / p.n)}
        ${chain(sum, final)}
        <p class="card-sub">Ce que le plan garde ne part ni au grossiste ni à l’étal. Il ramasse lui-même les étapes ; le plat final vous attend à sa machine.</p>
        <div class="row-btns">${btn('Arrêter le plan', { act: 'planStop', size: 'sm' })}</div>`;
}

function choose(id) {
    const n = ui.sel.planN || 10;
    const sum = G.prodPreview(id, n);
    const qty = `<div class="chips-row">${G.PLAN_QTYS.map(q => `<button class="pick-chip${q === n ? ' on' : ''}" data-act="planN" data-n="${q}">×${q}</button>`).join('')}</div>`;
    const ok = !sum.blocked.length;
    return `<div class="card-head">${ico(['item', id], 'ico big')}<div class="card-main"><div class="card-title">${n} ${plainName(id)}</div><div class="card-sub">${MACHINES[RECIPES[id].machine].name} · environ ${dur(sum.time)} · en stock : ${fmt(state.inventory[id] || 0)}</div></div></div>
        ${qty}
        ${chain(sum) || '<p class="card-sub">Tout est déjà en grange : le plan lance le plat tout de suite.</p>'}
        <p class="card-sub">${sum.raws.length ? 'Les produits qui manquent sont seulement signalés : le plan attend qu’ils soient en grange.' : 'Rien ne manque du champ ni des bêtes.'} Le plat final part tout seul quand il y a de quoi faire les ${n}.</p>
        ${G.planOf() ? `<p class="card-sub short">Un plan est déjà en cours (${G.planOf().n} ${plainName(G.planOf().id)}) : il sera remplacé.</p>` : ''}
        <div class="row-btns">${btn('Changer de plat', { act: 'planPick', size: 'sm' })}${btn('Tout lancer', { act: 'planGo', data: { id }, kind: 'gold', disabled: !ok, icon: ['ui', 'loop'] })}</div>`;
}

function picker() {
    const q = queryOf('plan');
    const all = Object.values(RECIPES)
        .filter(r => G.plannable(r.id) && Object.keys(r.ing).some(k => RECIPES[k]))
        .sort((a, b) => b.lvl - a.lvl || ITEMS[a.id].name.localeCompare(ITEMS[b.id].name));
    const list = (q ? all.filter(r => matchQ(q, ITEMS[r.id].name, MACHINES[r.machine].name)) : all).slice(0, 40);
    return [
        ['intro', '<p class="card-sub">Les plats qui passent par plusieurs machines. Choisissez-en un : le plan calcule toute la chaîne.</p>'],
        ['search', searchBox('plan', 'Chercher un plat')],
        [
            'list',
            list.length
                ? `<div class="rneeds">${list.map(r => `<button class="rneed" data-act="planPick" data-id="${r.id}"><span class="rneed-art">${art('item', r.id)}</span><span class="row-main"><b>${ITEMS[r.id].name}</b><small>${MACHINES[r.machine].name} · ${Object.keys(r.ing).length} ingrédients</small></span>${ico(['ui', 'arrow'])}</button>`).join('')}</div>`
                : empty('Aucun plat ne correspond.'),
        ],
    ];
}

defineSheet('plan', {
    title: `${ico(['ui', 'loop'])}Plan de production`,
    render(o) {
        const p = G.planOf();
        if (o.id && RECIPES[o.id]) return choose(o.id);
        if (p && !o.pick) return current(p);
        return picker();
    },
});

// la carte en haut de l'atelier
export function planCard() {
    const p = G.planOf();
    if (!p)
        return `<button class="plan-strip" data-act="open" data-sheet="plan">${ico(['ui', 'loop'])}<span><b>Plan de production</b><small>Un plat en quantité : toute la chaîne lancée d’un coup</small></span>${ico(['ui', 'arrow'])}</button>`;
    const sum = G.planSummary();
    const what = sum.blocked.length
        ? 'bloqué'
        : sum.raws.length
          ? `il manque ${sum.raws
                .map(r => qtyName(r.n, ITEMS[r.id].name).toLowerCase())
                .slice(0, 2)
                .join(', ')}`
          : G.finalReady() || p.go
            ? 'le plat final part'
            : 'les ingrédients se préparent';
    return `<button class="plan-strip on" data-act="open" data-sheet="plan">${ico(['item', p.id])}<span><b>${p.n} ${plainName(p.id)} · ${p.queued}/${p.n}</b><small>${esc(what)}</small>${bar(p.queued / p.n)}</span>${ico(['ui', 'arrow'])}</button>`;
}

export function setupPlan() {
    actions({
        planN: (el, d) => (ui.sel.planN = +d.n),
        planPick: (el, d) => openSheet('plan', d.id ? { id: d.id } : { pick: true }),
        planGo: (el, d) => {
            if (G.startPlan(d.id, ui.sel.planN || 10)) openSheet('plan', {});
        },
        planStop: () => {
            G.stopPlan();
            closeAll();
        },
    });
}
