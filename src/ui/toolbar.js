// La barre d'outils du champ et du pâturage : main, pelle, nourriture, compost, graines et décorations.
import { state } from '../core/state.js';
import { view } from '../core/view.js';
import { toast } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { DECOS } from '../data/farm.js';
import * as G from '../systems/index.js';
import { byId, patch, actions, esc } from './dom.js';
import { genWrap } from './genlook.js';
import { ico, art, COIN } from './icons.js';
import { currentPath, setToolbar, ui } from './app.js';
import { defineSheet, closeSheet } from './sheets.js';
import { hint } from './kit.js';

const isSeed = t => ITEMS[t] && ITEMS[t].type === 'crop';

const curVar = () => (state.selectedTool === 'var' && state.genetics && state.genetics.vars[state.genetics.tool]) || null;

function seedButton() {
    const t = state.selectedTool,
        deco = G.decoTool(t),
        v = curVar();
    let badge = '';
    if (v)
        return `<button class="tool seeds-btn on" data-act="open" data-sheet="seeds" aria-label="Choisir une graine">${genWrap(art('item', v.base), v.g)}<span class="badge gold">${state.genetics.seeds[v.id] || 0}</span></button>`;
    if (isSeed(t)) {
        const n = state.seeds[t];
        badge =
            n > 0
                ? `<span class="badge">${n}</span>`
                : ITEMS[t].type === 'crop'
                  ? `<span class="badge price">${COIN()}${ITEMS[t].cost}</span>`
                  : '<span class="badge">0</span>';
    } else if (deco) badge = `<span class="badge blue">${state.decorInv[deco]}</span>`;
    return `<button class="tool seeds-btn${isSeed(t) || deco ? ' on' : ''}" data-act="open" data-sheet="seeds" aria-label="Choisir une graine">${isSeed(t) ? art('seed', t) : deco ? art('ui', deco) : art('ui', 'packet')}${badge}</button>`;
}

const tool = (id, icon, label, badge = '') =>
    `<button class="tool${state.selectedTool === id ? ' on' : ''}" data-act="tool" data-t="${id}" aria-label="${label}">${art(icon[0], icon[1])}${badge}</button>`;

function renderToolbar() {
    const el = byId('toolbar');
    const p = currentPath();
    const show = p === 'farm/field' || p === 'animals/pasture' || view.wide;
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
    if (G.decoTool(t))
        toast('Touchez une parcelle pour poser la décoration dans son coin : la culture continue de pousser. La zone dorée montre son effet.', [
            'ui',
            G.decoTool(t),
        ]);
}

// ---------------- le tiroir des graines ----------------
// 1.38 : le tiroir des graines en onglets (de saison, en stock, toutes, variétés, décorations) et les dernières semées en haut
const RECENT_MAX = 6;
const seedBtn = i => {
    const n = state.seeds[i.id];
    const badge =
        n > 0 ? `<span class="badge">${n}</span>` : i.type === 'crop' ? `<span class="badge price">${COIN()}${i.cost}</span>` : '<span class="badge">0</span>';
    const tag = G.isInSeason(i.id) ? `<span class="season-tag">${art('ui', G.season().icon)}</span>` : '';
    return `<button class="seed${state.selectedTool === i.id ? ' on' : ''}${n === 0 && i.type === 'tree' ? ' empty' : ''}" data-act="pickSeed" data-t="${i.id}">${art('seed', i.id)}${badge}${tag}<small>${i.name}</small></button>`;
};
defineSheet('seeds', {
    title: 'Que planter ?',
    render() {
        const all = G.plantableSeeds();
        const inSeason = all.filter(i => G.isInSeason(i.id));
        const inStock = all.filter(i => state.seeds[i.id] > 0);
        const vars = state.genetics ? G.varieties().filter(v => (state.genetics.seeds[v.id] || 0) > 0 && !ITEMS[v.base].island) : [];
        const decos = Object.values(DECOS).filter(d => state.decorInv[d.id] > 0);
        const tabs = [
            ['season', 'De saison', inSeason.length],
            ['stock', 'En stock', inStock.length],
            ['all', 'Toutes', all.length],
            ['vars', 'Variétés', vars.length],
            ['decos', 'Décos', decos.length],
        ].filter(([k, , n]) => n > 0 || k === 'all');
        let tab = ui.sel.seedTab;
        if (!tabs.some(([k]) => k === tab)) tab = tabs[0][0];
        const recent = (state.settings.recentSeeds || []).map(id => all.find(i => i.id === id)).filter(Boolean);
        const sorted = list => list.slice().sort((a, b) => G.isInSeason(b.id) - G.isInSeason(a.id) || (a.reqLvl || 0) - (b.reqLvl || 0));
        let grid;
        if (tab === 'vars')
            grid = vars
                .map(
                    v =>
                        `<button class="seed var${curVar() === v ? ' on' : ''}" data-act="pickVarSeed" data-id="${v.id}">${genWrap(art('item', v.base), v.g)}<span class="badge gold">${state.genetics.seeds[v.id]}</span><small>${esc(G.varName(v))}</small></button>`,
                )
                .join('');
        else if (tab === 'decos')
            grid = decos
                .map(
                    d =>
                        `<button class="seed${state.selectedTool === 'deco:' + d.id ? ' on' : ''}" data-act="pickSeed" data-t="deco:${d.id}">${art('ui', d.id)}<span class="badge blue">${state.decorInv[d.id]}</span><small>${d.name}</small></button>`,
                )
                .join('');
        else
            grid = sorted(tab === 'season' ? inSeason : tab === 'stock' ? inStock : all)
                .map(seedBtn)
                .join('');
        return `${recent.length ? `<h3 class="section-title"><span>Récentes</span></h3><div class="seed-grid recent">${recent.map(seedBtn).join('')}</div>` : ''}
            <div class="chips-row seed-tabs">${tabs.map(([k, label, n]) => `<button class="pick-chip${k === tab ? ' on' : ''}" data-act="seedTab" data-f="${k}">${label} · ${n}</button>`).join('')}</div>
            <div class="seed-grid">${grid}</div>
            ${tab === 'season' || tab === 'all' ? hint(`En ${G.season().name.toLowerCase()}, les cultures marquées ${ico(['ui', G.season().icon])} poussent 30 % plus vite.`) : ''}`;
    },
});
const rememberSeed = id => {
    const r = (state.settings.recentSeeds || []).filter(x => x !== id);
    r.unshift(id);
    state.settings.recentSeeds = r.slice(0, RECENT_MAX);
};

export function setupToolbar() {
    setToolbar(renderToolbar);
    actions({
        tool: (el, d) => selectTool(d.t),
        pickSeed: (el, d) => {
            selectTool(d.t);
            if (ITEMS[d.t]) rememberSeed(d.t);
            closeSheet('seeds');
        },
        seedTab: (el, d) => (ui.sel.seedTab = d.f),
        pickVarSeed: (el, d) => {
            state.genetics.tool = d.id;
            selectTool('var');
            closeSheet('seeds');
        },
    });
}
