// La barre d'outils du champ et du pâturage : main, pelle, nourriture, compost, graines et décorations.
import { state } from '../core/state.js';
import { view } from '../core/view.js';
import { toast } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { DECOS } from '../data/farm.js';
import * as G from '../systems/index.js';
import { byId, patch, actions } from './dom.js';
import { ico, art, COIN } from './icons.js';
import { currentPath, setToolbar } from './app.js';
import { defineSheet, closeSheet } from './sheets.js';
import { hint } from './kit.js';

const isSeed = t => ITEMS[t] && (ITEMS[t].type === 'crop' || ITEMS[t].type === 'tree');

function seedButton() {
    const t = state.selectedTool,
        deco = G.decoTool(t);
    let badge = '';
    if (isSeed(t)) {
        const n = state.seeds[t];
        badge = n > 0 ? `<span class="badge">${n}</span>` : ITEMS[t].type === 'crop' ? `<span class="badge price">${COIN()}${ITEMS[t].cost}</span>` : '<span class="badge">0</span>';
    } else if (deco) badge = `<span class="badge blue">${state.decorInv[deco]}</span>`;
    return `<button class="tool seeds-btn${isSeed(t) || deco ? ' on' : ''}" data-act="open" data-sheet="seeds" aria-label="Choisir une graine">${isSeed(t) ? art('seed', t) : deco ? art('ui', deco) : art('ui', 'packet')}${badge}</button>`;
}

const tool = (id, icon, label, badge = '') =>
    `<button class="tool${state.selectedTool === id ? ' on' : ''}" data-act="tool" data-t="${id}" aria-label="${label}">${art(icon[0], icon[1])}${badge}</button>`;

function renderToolbar() {
    const el = byId('toolbar');
    const p = currentPath();
    const show = p === 'farm/field' || p === 'animals' || view.wide;
    el.hidden = !show;
    document.body.classList.toggle('with-toolbar', show);
    if (!show) return;
    patch(
        el,
        `<div class="tools">
            ${tool('hand', ['ui', 'hand'], 'Main')}
            ${tool('shovel', ['ui', 'shovel'], 'Pelle')}
            ${tool('feed', ['item', 'feed'], 'Nourriture', `<span class="badge blue">${state.inventory.feed}</span>`)}
            ${state.level >= 4 ? tool('fert', ['item', 'fertilizer'], 'Compost', `<span class="badge blue">${state.inventory.fertilizer}</span>`) : ''}
            ${seedButton()}
        </div>`,
    );
}

function selectTool(t) {
    if (!G.isToolValid(t)) return;
    G.selectTool(t);
    if (G.decoTool(t)) toast('Touchez une parcelle vide pour poser la décoration. La zone dorée montre son effet.', ['ui', G.decoTool(t)]);
}

// ---------------- le tiroir des graines ----------------
defineSheet('seeds', {
    title: 'Que planter ?',
    render() {
        const sid = G.season().id;
        const seeds = G.plantableSeeds()
            .map(i => {
                const n = state.seeds[i.id];
                const badge = n > 0 ? `<span class="badge">${n}</span>` : i.type === 'crop' ? `<span class="badge price">${COIN()}${i.cost}</span>` : '<span class="badge">0</span>';
                const tag = G.isInSeason(i.id) ? `<span class="season-tag">${art('ui', G.season().icon)}</span>` : '';
                return `<button class="seed${state.selectedTool === i.id ? ' on' : ''}${n === 0 && i.type === 'tree' ? ' empty' : ''}" data-act="pickSeed" data-t="${i.id}">${art('seed', i.id)}${badge}${tag}<small>${i.name}</small></button>`;
            })
            .join('');
        const decos = Object.values(DECOS)
            .filter(d => state.decorInv[d.id] > 0)
            .map(
                d =>
                    `<button class="seed${state.selectedTool === 'deco:' + d.id ? ' on' : ''}" data-act="pickSeed" data-t="deco:${d.id}">${art('ui', d.id)}<span class="badge blue">${state.decorInv[d.id]}</span><small>${d.name}</small></button>`,
            )
            .join('');
        return `<div class="seed-grid">${seeds}</div>${decos ? `<h3 class="section-title"><span>Décorations à poser</span></h3><div class="seed-grid">${decos}</div>` : ''}${hint(`En ${G.season().name.toLowerCase()}, les cultures marquées ${ico(['ui', G.season().icon])} poussent 30 % plus vite.`)}${sid ? '' : ''}`;
    },
});

export function setupToolbar() {
    setToolbar(renderToolbar);
    actions({
        tool: (el, d) => selectTool(d.t),
        pickSeed: (el, d) => {
            selectTool(d.t);
            closeSheet('seeds');
        },
    });
}
