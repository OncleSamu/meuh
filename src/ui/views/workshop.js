// Atelier | Machines : chaque machine en vignette, et son tiroir de recettes.
import { state } from '../../core/state.js';
import { fmt, formatDuration } from '../../core/format.js';
import { ITEMS } from '../../data/items.js';
import { MACHINES, RECIPES } from '../../data/machines.js';
import * as G from '../../systems/index.js';
import { blocks, actions, byId } from '../dom.js';
import { ico, art } from '../icons.js';
import { btn, bar, hint, empty, timer } from '../kit.js';
import { defineView, defineLive, ui } from '../app.js';
import { defineSheet } from '../sheets.js';
import { pinBar } from './common.js';
import { now } from '../../core/clock.js';

const puffs = m => (G.machineBusy(m) ? '<i class="puff"></i><i class="puff p2"></i><i class="puff p3"></i>' : '');
defineLive('mac', i => G.machinePct(state.machines[i] || { queue: [] }));

function tile(m, i) {
    const d = MACHINES[m.type];
    const cur = m.queue[0];
    const ready = Object.entries(m.out).filter(([, n]) => n > 0);
    const status = cur
        ? `<div class="m-now">${ico(['item', cur])}<span>${ITEMS[cur].name}</span></div>${bar(G.machinePct(m), 'm-bar', `mac:${i}`)}<div class="m-time">${timer(now() + G.machineLeft(m) * 1000)}${m.queue.length > 1 ? ` · +${m.queue.length - 1} en file` : ''}</div>`
        : `<div class="m-idle">${m.loop ? 'En boucle : ingrédients manquants' : 'À l’arrêt'}</div>`;
    return `<div class="mtile${G.machineBusy(m) ? ' working' : ''}${ready.length ? ' has-out' : ''}" data-anchor="machine:${i}">
        <button class="mtile-main" data-act="open" data-sheet="machine" data-i="${i}">
            <span class="m-art">${art('machine', m.type)}${puffs(m)}</span>
            <span class="m-name">${d.name}${m.loop ? ico(['ui', 'loop'], 'ico m-loop') : ''}</span>
            ${status}
        </button>
        ${ready.length ? `<button class="m-collect" data-act="collectMachine" data-i="${i}">${ready.map(([id, n]) => `<span>${ico(['item', id])}×${n * (RECIPES[id].outQty || 1)}</span>`).join('')}<b>Récupérer</b></button>` : ''}
    </div>`;
}

function renderWorkshop(el) {
    const any = state.machines.some(m => G.outCount(m) > 0);
    blocks(el, [
        [
            'top',
            `<div class="view-top"><h2 class="view-title">Atelier</h2><div class="actions">${btn('Relancer', { act: 'restartMachines', size: 'sm', icon: ['ui', 'loop'] })}${btn('Tout récupérer', { act: 'collectMachines', kind: any ? 'gold' : '', size: 'sm', icon: ['ui', 'basket'], disabled: !any })}</div></div>`,
        ],
        ['pin', pinBar()],
        [
            'grid',
            state.machines.length
                ? `<div class="mgrid">${state.machines.map(tile).join('')}</div>`
                : empty('Aucune machine pour le moment. Le moulin s’achète au marché dès le niveau 3.'),
        ],
        ['hint', hint('Touchez une machine pour choisir ses recettes. Chacune enchaîne plusieurs lots, même différents.')],
    ]);
}
defineView('machines/workshop', renderWorkshop);

// ---------------- le tiroir d'une machine ----------------
const teacherBadge = r => (r.teacher ? `<span class="rt-who">${art('villager', r.teacher)}</span>` : '');

function queueSlots(m, i) {
    return `<div class="mslots">${Array.from({ length: G.machineSlots() }, (_, k) => {
        const id = m.queue[k];
        if (!id) return '<span class="mslot empty"></span>';
        if (k === 0) return `<span class="mslot now">${art('item', id)}${bar(G.machinePct(m), 'slot-bar', `mac:${i}`)}</span>`;
        return `<button class="mslot can-cancel" data-act="cancelQueued" data-i="${i}" data-k="${k}" aria-label="Annuler">${art('item', id)}<b>×</b></button>`;
    }).join('')}</div>`;
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
        const full = m.queue.length >= G.machineSlots();
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
                    .map(([k, n]) => `<span class="ing${state.inventory[k] >= n ? ' ok' : ''}">${ico(['item', k])}${Math.min(state.inventory[k], n)}/${n}</span>`)
                    .join('');
                const price = it.sell ? `${fmt(G.sellPrice(r.id))}${ico(['ui', 'coin'])}` : `${r.outQty} sacs`;
                return `<button class="rtile${open ? (ok ? ' ok' : ' short') : ' locked'}${wanted.has(r.id) ? ' wanted' : ''}${o.focus === r.id ? ' focus' : ''}" data-act="queue" data-i="${i}" data-id="${r.id}" data-anchor="recipe:${r.id}">
                    <span class="rt-art">${art('item', r.id)}${r.outQty ? `<em>×${r.outQty}</em>` : ''}${teacherBadge(r)}</span>
                    <b>${it.name}</b>
                    ${open ? `<span class="ings">${ings}</span><small>${ico(['ui', 'clock'])}${formatDuration(G.recipeTime(r.id))} · ${price}</small>` : `<small class="lock-txt">${ico(['ui', 'lock'])}${G.recipeLockText(r)}</small>`}
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
                ${queueSlots(m, i)}<div class="card-sub">${full ? 'La file est pleine : attendez la fin du lot en cours.' : m.queue.length > 1 ? 'Touchez un lot en attente pour l’annuler (ingrédients rendus).' : 'Touchez une recette pour la lancer ou l’ajouter à la file.'}</div></div></div>`,
            ],
            [
                'out',
                `<div class="row-btns">${ready.length ? btn(`Récupérer ${ready.map(([id, n]) => `${ico(['item', id])}×${n * (RECIPES[id].outQty || 1)}`).join(' ')}`, { act: 'collectMachine', data: { i }, kind: 'gold' }) : ''}
                ${btn(m.loop ? 'En boucle' : 'Boucle', { act: 'toggleLoop', data: { i }, icon: ['ui', 'loop'], cls: m.loop ? 'on' : '', title: 'Relancer automatiquement la dernière recette' })}</div>`,
            ],
            ['filters', `<div class="chips-row">${filters.map(([k, t]) => `<button class="pick-chip${f === k ? ' on' : ''}" data-act="recipeFilter" data-f="${k}">${t}</button>`).join('')}</div>`],
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
        cancelQueued: (el, d) => G.cancelQueued(+d.i, +d.k),
        toggleLoop: (el, d) => G.toggleLoop(+d.i),
        recipeFilter: (el, d) => (ui.sel.recipeFilter = d.f),
    });
}
