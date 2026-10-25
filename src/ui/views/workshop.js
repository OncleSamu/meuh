// Atelier | Machines : chaque machine en vignette, et son tiroir de recettes.
import { state } from '../../core/state.js';
import { fmt, formatDuration } from '../../core/format.js';
import { ITEMS } from '../../data/items.js';
import { MACHINES, RECIPES } from '../../data/machines.js';
import { QUALITY } from '../../data/farm.js';
import * as G from '../../systems/index.js';
import { blocks, actions, byId } from '../dom.js';
import { ico, art, qStar } from '../icons.js';
import { btn, bar, empty, timer, toggle, tip15 } from '../kit.js';
import { defineView, defineLive, ui } from '../app.js';
import { defineSheet } from '../sheets.js';
import { pinBar } from './common.js';
import { now } from '../../core/clock.js';
import { bldRow } from '../sheets/upgrades.js';

const puffs = m => (G.machineBusy(m) ? '<i class="puff"></i><i class="puff p2"></i><i class="puff p3"></i>' : '');
defineLive('mac', i => G.machinePct(state.machines[i] || { queue: [] }));
defineLive('mac2', i => G.machinePct2(state.machines[i] || { queue: [] }));

function tile(m, i) {
    const d = MACHINES[m.type];
    const cur = m.queue[0];
    const ready = Object.entries(m.out).filter(([, n]) => n > 0);
    const status = cur
        ? `<div class="m-now">${ico(['item', cur])}<span>${ITEMS[cur].name}</span></div>${bar(G.machinePct(m), 'm-bar', `mac:${i}`)}<div class="m-time">${timer(now() + G.machineLeft(m) * 1000)}${m.queue.length > 1 ? ` · +${m.queue.length - 1} en file` : ''}</div>`
        : `<div class="m-idle">${m.loop ? 'En boucle : ingrédients manquants' : 'À l’arrêt'}</div>`;
    return `<div class="mtile${G.machineBusy(m) ? ' working' : ''}${ready.length ? ' has-out' : ''}" data-anchor="machine:${i}">
        <button class="mtile-main" ${m.type === 'counter' ? 'data-act="go" data-path="machines/counter"' : `data-act="open" data-sheet="machine" data-i="${i}"`}>
            <span class="m-art">${art('machine', m.type)}${puffs(m)}</span>
            <span class="m-name">${d.name}${m.loop ? ico(['ui', 'loop'], 'ico m-loop') : ''}</span>
            ${status}
        </button>
        ${ready.length ? `<button class="m-collect" data-act="collectMachine" data-i="${i}">${ready.map(([id, n]) => `<span>${ico(['item', id])}×${n * (RECIPES[id].outQty || 1)}</span>`).join('')}<b>Récupérer</b></button>` : ''}
    </div>`;
}

// 1.38 : un filtre en haut de l'atelier ; les machines prêtes passent devant, les machines oubliées depuis 7 jours derrière
const WEEK = 7 * 864e5;
const mState = m => (G.outCount(m) > 0 ? 'ready' : G.machineBusy(m) ? 'busy' : 'idle');
const MFILTERS = [
    ['all', 'Toutes'],
    ['ready', 'Prêtes'],
    ['busy', 'En marche'],
    ['idle', 'À l’arrêt'],
];
function machineList() {
    const f = ui.sel.mfilter || 'all',
        rank = { ready: 0, busy: 1, idle: 2 },
        t = now();
    return state.machines
        .map((m, i) => [m, i])
        .filter(([m]) => f === 'all' || mState(m) === f)
        .sort(([a, i], [b, j]) => rank[mState(a)] - rank[mState(b)] || (t - (a.used || 0) > WEEK) - (t - (b.used || 0) > WEEK) || i - j);
}
function machineFilter() {
    if (state.machines.length < 6) return '';
    const f = ui.sel.mfilter || 'all';
    const n = k => (k === 'all' ? state.machines.length : state.machines.filter(m => mState(m) === k).length);
    return `<div class="chips-row mfilter">${MFILTERS.map(([k, label]) => `<button class="pick-chip${f === k ? ' on' : ''}" data-act="mfilter" data-f="${k}">${label} · ${n(k)}</button>`).join('')}</div>`;
}

function renderWorkshop(el) {
    const any = state.machines.some(m => G.outCount(m) > 0);
    blocks(el, [
        [
            'top',
            `<div class="view-top end"><div class="actions">${btn('Relancer', { act: 'restartMachines', size: 'sm', icon: ['ui', 'loop'] })}${btn('Tout récupérer', { act: 'collectMachines', kind: any ? 'gold' : '', size: 'sm', icon: ['ui', 'basket'], disabled: !any })}</div></div>`,
        ],
        ['pin', pinBar()],
        [
            'grid',
            state.machines.length
                ? `${machineFilter()}<div class="mgrid">${machineList()
                      .map(([m, i]) => tile(m, i))
                      .join('')}</div>`
                : empty('Aucune machine pour le moment. Le moulin s’achète au marché dès le niveau 3.'),
        ],
        ['hint', tip15('Touchez une machine pour choisir ses recettes. Chacune enchaîne plusieurs lots, même différents.')],
    ]);
}
defineView('machines/workshop', renderWorkshop);

// ---------------- le tiroir d'une machine ----------------
const teacherBadge = r => (r.teacher ? `<span class="rt-who">${art('villager', r.teacher)}</span>` : '');

function queueSlots(m, i) {
    return `<div class="mslots">${Array.from({ length: G.machineSlots(m.type) }, (_, k) => {
        const id = m.queue[k];
        if (!id) return '<span class="mslot empty"></span>';
        if (k === 0) return `<span class="mslot now">${art('item', id)}${bar(G.machinePct(m), 'slot-bar', `mac:${i}`)}</span>`;
        if (k === 1 && m.lane2)
            return `<button class="mslot now can-cancel" data-act="cancelQueued" data-i="${i}" data-k="${k}" aria-label="Annuler">${art('item', id)}${bar(G.machinePct2(m), 'slot-bar', `mac2:${i}`)}</button>`;
        return `<button class="mslot can-cancel" data-act="cancelQueued" data-i="${i}" data-k="${k}" aria-label="Annuler">${art('item', id)}<b>×</b></button>`;
    }).join('')}</div>`;
}

function lane2Row(m, i) {
    if (m.lane2) return `<div class="card-sub center">${ico(['ui', 'check'])} Deuxième poste en service : deux lots tournent en même temps.</div>`;
    if (!G.lane2Open()) return '';
    const c = G.lane2Cost(m.type);
    return `<div class="card lane2-card"><div class="card-main"><div class="card-title">Deuxième poste</div>
        <div class="card-sub">Faire tourner deux plats à la fois dans la file de cette machine.</div></div>
        ${btn(`${fmt(c)}${ico(['ui', 'coin'])}`, { act: 'buyLane2', data: { i }, kind: state.money >= c ? 'gold' : '', size: 'sm' })}</div>`;
}

defineSheet('machine', {
    cls: 'machine-sheet',
    title: o => {
        const m = state.machines[o.i];
        return m ? `${ico(['machine', m.type])}${MACHINES[m.type].name}` : '';
    },
    render(o) {
        const i = +o.i,
            m = state.machines[i];
        if (!m) return '';
        const full = m.queue.length >= G.machineSlots(m.type);
        const ready = Object.entries(m.out).filter(([, n]) => n > 0);
        const f = ui.sel.recipeFilter || 'all',
            wanted = G.wantedItems();
        const list = G.recipesOf(m.type)
            .filter(r => f === 'all' || (f === 'can' ? G.recipeUnlocked(r.id) && G.canCook(r.id) : wanted.has(r.id)))
            .sort((a, b) => wanted.has(b.id) - wanted.has(a.id) || G.recipeUnlocked(b.id) - G.recipeUnlocked(a.id) || a.lvl - b.lvl);
        const tiles = list
            .map(r => {
                const it = ITEMS[r.id],
                    open = G.recipeUnlocked(r.id),
                    ok = open && G.canCook(r.id);
                const ings = Object.entries(r.ing)
                    .map(
                        ([k, n]) =>
                            `<span class="ing${state.inventory[k] >= n ? ' ok' : ''}">${ico(['item', k])}${Math.min(state.inventory[k], n)}/${n}</span>`,
                    )
                    .join('');
                const pv = ok && state.genetics && state.genetics.bestFirst ? G.previewBatch(r.id) : null;
                const qb = pv && pv.q ? `<span class="rt-q" title="Sortira en ${QUALITY[pv.q].name}">${qStar(pv.q)}</span>` : '';
                const qtxt = pv && pv.q ? `<small class="rt-qtxt">sortira en ${QUALITY[pv.q].name}</small>` : '';
                const price = it.sell ? `${fmt(G.sellPrice(r.id))}${ico(['ui', 'coin'])}` : `${r.outQty} sacs`;
                return `<button class="rtile${open ? (ok ? ' ok' : ' short') : ' locked'}${wanted.has(r.id) ? ' wanted' : ''}${o.focus === r.id ? ' focus' : ''}" data-act="queue" data-i="${i}" data-id="${r.id}" data-anchor="recipe:${r.id}">
                    <span class="rt-art">${art('item', r.id)}${r.outQty ? `<em>×${r.outQty}</em>` : ''}${teacherBadge(r)}${qb}</span>
                    <b>${it.name}</b>
                    ${open ? `<span class="ings">${ings}</span>${qtxt}<small>${ico(['ui', 'clock'])}${formatDuration(G.recipeTime(r.id))} · ${price}</small>` : `<small class="lock-txt">${ico(['ui', 'lock'])}${G.recipeLockText(r)}</small>`}
                </button>`;
            })
            .join('');
        const filters = [
            ['all', 'Toutes'],
            ['can', 'Faisables'],
            ['wanted', 'Demandées'],
        ];
        return [
            [
                'head',
                `<div class="machine-head"><span class="m-art big">${art('machine', m.type)}${puffs(m)}</span><div class="card-main"><div class="card-sub">${MACHINES[m.type].desc}</div>
                ${queueSlots(m, i)}<div class="card-sub">${full ? 'La file est pleine : attendez la fin du lot en cours.' : m.queue.length > 1 ? 'Touchez un lot en attente pour l’annuler (ingrédients rendus).' : 'Touchez une recette pour la lancer ou l’ajouter à la file.'}</div></div></div>`,
            ],
            [
                'out',
                `<div class="row-btns">${ready.length ? btn(`Récupérer ${ready.map(([id, n]) => `${ico(['item', id])}×${n * (RECIPES[id].outQty || 1)}`).join(' ')}`, { act: 'collectMachine', data: { i }, kind: 'gold' }) : ''}
                ${btn(m.loop ? 'En boucle' : 'Boucle', { act: 'toggleLoop', data: { i }, icon: ['ui', 'loop'], cls: m.loop ? 'on' : '', title: 'Relancer automatiquement la dernière recette' })}</div>`,
            ],
            ['lane2', lane2Row(m, i)],
            ['up', bldRow('m', m.type)],
            [
                'best',
                state.genetics && G.geneticsOpen()
                    ? toggle(
                          'Meilleurs ingrédients d’abord',
                          state.genetics.bestFirst,
                          'toggleBest',
                          null,
                          'Variétés savoureuses et produits argent ou or : le plat sort en argent ou en or',
                      )
                    : '',
            ],
            [
                'filters',
                `<div class="chips-row">${filters.map(([k, t]) => `<button class="pick-chip${f === k ? ' on' : ''}" data-act="recipeFilter" data-f="${k}">${t}</button>`).join('')}</div>`,
            ],
            [
                'grid',
                list.length
                    ? `<div class="recipe-grid">${tiles}</div>`
                    : empty(f === 'can' ? 'Aucune recette faisable avec votre stock.' : 'Aucune commande ne demande un produit de cette machine.'),
            ],
        ];
    },
    open(o) {
        if (o.focus) {
            ui.sel.recipeFilter = 'all';
            setTimeout(() => {
                const t = byId('sheets').querySelector(`[data-anchor="recipe:${o.focus}"]`);
                if (t) t.scrollIntoView({ block: 'center', behavior: 'smooth' });
            }, 120);
        }
    },
});

export function setupWorkshop() {
    actions({
        collectMachine: (el, d) => {
            const r = G.collectMachine(+d.i, el.closest('[data-anchor]') || el);
            return r;
        },
        collectMachines: el => G.collectAllMachines(el),
        restartMachines: el => G.restartAllMachines(el),
        queue: (el, d) => G.queueRecipe(+d.i, d.id, el),
        buyLane2: (el, d) => G.buyLane2(+d.i, el),
        cancelQueued: (el, d) => G.cancelQueued(+d.i, +d.k),
        toggleLoop: (el, d) => G.toggleLoop(+d.i),
        recipeFilter: (el, d) => (ui.sel.recipeFilter = d.f),
        mfilter: (el, d) => (ui.sel.mfilter = d.f),
        toggleBest: () => (state.genetics.bestFirst = !state.genetics.bestFirst),
    });
}
