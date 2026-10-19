// Ferme | Champ : les parcelles, la serre, la maison, le chien et ce qui attend le joueur.
import { state } from '../../core/state.js';
import { farmShown } from '../../core/view.js';
import { now } from '../../core/clock.js';
import { fmt } from '../../core/format.js';
import { on } from '../../core/bus.js';
import { ITEMS } from '../../data/items.js';
import { SOILS, GH, MAT } from '../../data/farm.js';
import { HOUSE, FARMHAND } from '../../data/progress.js';
import { EVENTS } from '../../data/world.js';
import * as G from '../../systems/index.js';
import { byId, blocks, actions, run } from '../dom.js';
import { ico, art, COIN } from '../icons.js';
import { genWrap } from '../genlook.js';
import { btn, toggle, hint, bar } from '../kit.js';
import { defineView, defineLive, ui } from '../app.js';
import { reduceMotion } from '../fx.js';
import { pinBar } from './common.js';
import { formatDuration } from '../../core/format.js';
import { emit } from '../../core/bus.js';
import { PROJECTS } from '../../data/village.js';
import { burstAt, floatText, flyTo } from '../fx.js';
import { centerOf } from '../dom.js';
import { SPR, parts as partsHtml } from '../icons.js';
import { tabEl } from '../app.js';
import { askBuy } from '../sheets/askbuy.js';

const plotEls = [],
    plotSig = [];
let ghEls = [],
    ghSig = [],
    ghKey = '';

// ---------------- les parcelles ----------------
const soilHtml = (i, id) => {
    const s = G.soilOf(i);
    return s ? `<div class="soil ${s}${G.soilFits(i, id) ? ' fit' : ''}"><i>${art('ui', SOILS[s].icon)}</i></div>` : '';
};
const hiveBadge = p => {
    const j = Math.floor(p.honey || 0);
    return j ? `<div class="honey-badge">${art('item', 'honey')}<b>${j}</b></div>` : '';
};
const egg = i => (G.eggAt(i) ? `<div class="egg-spot">${art('item', 'paintedEgg')}</div>` : '');

// une variété du labo pousse avec son apparence (couleur, taille, motif)
const plantArt = (p, stage) => {
    const v = p.v && state.genetics && state.genetics.vars[p.v];
    return v ? genWrap(art('plant', `${p.itemId}:${stage}`), v.g) : art('plant', `${p.itemId}:${stage}`);
};

function buildPlots(box) {
    box.innerHTML = '';
    plotEls.length = 0;
    plotSig.length = 0;
    state.grid.forEach((p, i) => {
        const el = document.createElement('div');
        el.dataset.i = i;
        el.dataset.anchor = 'plot:' + i;
        box.appendChild(el);
        plotEls.push(el);
    });
}

function renderPlots() {
    const box = byId('plots');
    if (!box) return;
    if (plotEls.length !== state.grid.length || !plotEls[0] || !plotEls[0].isConnected) buildPlots(box);
    const cost = G.getExpCost();
    const nextLocked = state.grid.findIndex(p => !p.isUnlocked);
    const visibleLimit = nextLocked === -1 ? state.grid.length : Math.ceil((nextLocked + 1) / 6) * 6;
    const pins = G.pinnedCrops();
    const zone = new Set(G.handZone());
    const tool = state.selectedTool;
    const auras = !!G.decoTool(tool) || tool === 'shovel';
    box.classList.toggle('deco-mode', !!G.decoTool(tool));
    // 1.9 : juste après la pose d'une décoration, ses parcelles s'éclairent
    const fl = state.decoFlash;
    const flash = new Set(fl && now() < fl.until ? G.decoZone(fl.i) : []);
    state.grid.forEach((p, i) => {
        const el = plotEls[i];
        let sig;
        if (!p.isUnlocked) sig = i >= visibleLimit ? 'H' : `L|${i === nextLocked ? cost : ''}`;
        else
            sig = `${p.terrain}|${p.isWatered}|${p.itemId}|${p.itemId ? G.plotStage(p) : ''}|v:${p.v || ''}|${p.pest ? 'pest' : ''}|${state.crow && state.crow.plot === i ? 'crow' : ''}|${G.eggAt(i) ? 'egg' : ''}|${p.fert ? 'f' : ''}|d:${p.deco || ''}|h:${p.deco === 'hive' ? Math.floor(p.honey || 0) : ''}|${pins.has(p.itemId) ? 'pin' : ''}|${zone.has(i) ? 'z' : ''}|${(auras && G.hasAura(i)) || flash.has(i) ? 'a' : ''}`;
        if (plotSig[i] === sig) return;
        const prev = plotSig[i];
        plotSig[i] = sig;
        if (sig === 'H') {
            el.className = 'plot hidden';
            el.innerHTML = '';
            return;
        }
        if (!p.isUnlocked) {
            el.className = 'plot locked' + (i === nextLocked ? ' next' : '');
            el.innerHTML =
                `<div class="lock-ico${i === nextLocked ? '' : ' dim'}">${art('ui', 'lock')}</div>` +
                (i === nextLocked ? `<div class="price-chip">${COIN()}${fmt(cost)}</div>` : '');
            return;
        }
        const aura = (auras && G.hasAura(i)) || flash.has(i) ? ' aura' : '';
        // 1.9 : la décoration est dans le coin de la parcelle, la culture pousse à côté
        const deco = p.deco
            ? `<div class="deco-corner${prev && prev.includes('d:' + p.deco) ? '' : ' pop'}">${art('ui', p.deco)}</div>${p.deco === 'hive' ? hiveBadge(p) : ''}`
            : '';
        el.className = `plot ${p.terrain}${p.isWatered ? ' watered' : ''}${p.itemId ? ' planted' : ''}${p.isReady ? ' ready' : ''}${p.pest ? ' pested' : ''}${pins.has(p.itemId) ? ' pinned' : ''}${zone.has(i) ? ' hand' : ''}${p.deco ? ' has-deco' : ''}${aura}`;
        if (!p.itemId) {
            el.innerHTML = soilHtml(i) + deco + egg(i);
            return;
        }
        const stage = G.plotStage(p);
        // l'animation de pousse ne se joue que si le stade change vraiment
        const stageChanged = !prev || prev.split('|')[2] !== String(p.itemId) || prev.split('|')[3] !== String(stage);
        el.innerHTML =
            soilHtml(i, p.itemId) +
            `<div class="spr-wrap${stageChanged ? ' pop' : ''}${p.v ? ' var' : ''}">${plantArt(p, stage)}</div>` +
            (p.pest ? `<div class="pest">${art('ui', 'pest')}</div>` : '') +
            (p.isReady ? '' : bar(0, 'pbar', `plot:${i}`)) +
            (!p.isWatered && !p.isReady ? `<div class="need-water">${art('ui', 'drop')}</div>` : '') +
            (state.crow && state.crow.plot === i ? `<div class="crow">${art('ui', 'crow')}</div>` : '') +
            (p.fert && !p.isReady ? `<div class="fert-badge">${art('item', 'fertilizer')}</div>` : '') +
            deco +
            egg(i);
    });
}

const growPct = p => (p.itemId && !p.isReady ? p.growProgress / (ITEMS[p.itemId].time / G.speedMult()) : 1);
defineLive('plot', i => growPct(state.grid[i]));
defineLive('gh', k => growPct(state.greenhouse.plots[k]));

// ---------------- la serre ----------------
function greenhouseHtml() {
    const g = state.greenhouse;
    if (g.built) return null;
    const locked = state.level < GH.lvl;
    const can = G.canBuildGreenhouse();
    const mats = Object.entries(MAT.greenhouse || {})
        .map(([k, n]) => `<span class="${state.inventory[k] >= n ? 'ok' : 'short'}">${ico(['item', k])}${n}</span>`)
        .join('');
    return `<div class="card gh-card${locked ? ' locked' : ''}">
        <div class="card-art">${art('ui', 'greenhouse')}</div>
        <div class="card-main"><div class="card-title">Serre</div>
        <div class="card-sub">Toujours de saison, arrosage automatique et à l’abri des corbeaux.${locked ? ` Constructible au niveau ${GH.lvl}.` : ''}</div>
        ${locked ? '' : `<div class="cost">${COIN()}${fmt(GH.cost)} ${mats}</div>`}</div>
        ${locked ? '' : `<div class="card-side">${btn('Construire', { act: 'buildGreenhouse', kind: can ? 'green' : '', disabled: !can, anchor: 'gh:build' })}</div>`}
    </div>`;
}

function renderGreenhouse() {
    const box = byId('gh-grid');
    const g = state.greenhouse;
    if (!box || !g.built) return;
    if (ghKey !== g.plots.length + '' || !ghEls[0] || !ghEls[0].isConnected) {
        ghKey = g.plots.length + '';
        box.innerHTML = '';
        ghSig = [];
        ghEls = g.plots.map((p, k) => {
            const el = document.createElement('div');
            el.dataset.i = 1000 + k;
            el.dataset.anchor = 'plot:' + (1000 + k);
            box.appendChild(el);
            return el;
        });
    }
    const cost = G.ghCost();
    const nextLocked = g.plots.findIndex(p => !p.isUnlocked);
    g.plots.forEach((p, k) => {
        const el = ghEls[k];
        const sig = !p.isUnlocked ? (k === nextLocked ? `L|${cost}` : 'H') : `${p.itemId}|${p.itemId ? G.plotStage(p) : ''}|${p.v || ''}`;
        if (ghSig[k] === sig) return;
        const prev = ghSig[k];
        ghSig[k] = sig;
        if (sig === 'H') {
            el.className = 'plot hidden';
            el.innerHTML = '';
            return;
        }
        if (!p.isUnlocked) {
            el.className = 'plot locked next';
            el.innerHTML = `<div class="lock-ico">${art('ui', 'lock')}</div><div class="price-chip">${COIN()}${fmt(cost)}</div>`;
            return;
        }
        el.className = `plot plowed watered gh${p.itemId ? ' planted' : ''}${p.isReady ? ' ready' : ''}`;
        if (!p.itemId) {
            el.innerHTML = '';
            return;
        }
        const stage = G.plotStage(p);
        el.innerHTML = `<div class="spr-wrap${!prev || prev !== sig ? ' pop' : ''}">${plantArt(p, stage)}</div>` + (p.isReady ? '' : bar(0, 'pbar', `gh:${k}`));
    });
}

// ---------------- la cour : maison et commis ----------------
function farmyardHtml() {
    const l = G.houseLvl(),
        n = G.houseNext();
    const can = G.houseCanUp() || G.handCanUp();
    const sub = G.handLvl()
        ? G.handMessage() || `Théo s’occupe de ${FARMHAND[G.handLvl()].plots} parcelles`
        : n && state.level < n.lvl
          ? `Agrandissement au niveau ${n.lvl}`
          : n
            ? 'Touchez pour agrandir la maison'
            : 'La plus belle maison du canton';
    if (G.houseCanUp()) G.tip('house');
    return `<button class="farmyard card" data-act="open" data-sheet="house" aria-label="Maison de la ferme">
        <span class="yard-house">${houseArt(l)}</span>
        <span class="card-main"><span class="card-title">${HOUSE[l].name}${state.legend ? ' ' + ico(['ui', 'goldCow']) : ''}</span><span class="card-sub">${sub}</span></span>
        ${G.handLvl() ? `<span class="yard-hand">${art('villager', 'theo')}</span>` : ''}${can ? '<span class="dot">!</span>' : ''}</button>`;
}
// la maison avec la couleur de toit choisie
const houseArt = l => (G.roofColor() ? SPR.farmhouse(l, G.roofColor()) : art('house', l));

// ---------------- le haut de la vue ----------------
function topHtml() {
    const h = Math.floor(state.gameTimeMinutes / 60),
        m = Math.floor(state.gameTimeMinutes % 60);
    const night = G.isNight() && ['sun', 'cloudy', 'heat'].includes(state.weather);
    return `<div class="view-top">
        <button class="pill clock" data-act="open" data-sheet="almanac" aria-label="Heure de la ferme (une journée de jeu dure environ 5 minutes) : almanach" title="Heure de la ferme, pas l’heure réelle">${night ? moonSvg : ico(['ui', G.weather().icon])}<b>${String(h).padStart(2, '0')}:${String(m - (m % 10)).padStart(2, '0')}</b>${ico(['ui', G.season().icon])}</button>
        <div class="actions">${btn('Arroser', { act: 'waterAll', kind: 'blue', size: 'sm', icon: ['ui', 'can'], anchor: 'btn:water' })}${btn('Récolter', { act: 'harvestAll', kind: 'green', size: 'sm', icon: ['ui', 'basket'], anchor: 'btn:harvest' })}${ITEMS[state.selectedTool]?.type === 'crop' ? btn('Semer', { act: 'plantAll', size: 'sm', icon: ['item', state.selectedTool] }) : ''}</div>
    </div>`;
}
const moonSvg = `<i class="ico"><svg viewBox="0 0 64 64" class="spr"><path d="M40 10 C24 12 16 26 20 40 C24 52 40 58 52 50 C36 50 28 36 32 24 C34 18 36 14 40 10Z" fill="#fffbe8" stroke="#3a2618" stroke-width="3" stroke-linejoin="round"/></svg></i>`;

// objectif du moment
function nextGoal() {
    if (!state.tutorial.done) return null;
    const ready = Object.values(PROJECTS).find(p => G.projectOpen(p.id) && G.projectComplete(p.id));
    if (ready) return { icon: ['ui', 'village'], text: `Terminez la rénovation : ${ready.name.toLowerCase()}`, go: 'village/village' };
    const open = Object.values(PROJECTS).find(p => G.projectOpen(p.id));
    if (open) {
        const tot = Object.values(open.need).reduce((a, b) => a + b, 0),
            got = Object.keys(open.need).reduce((a, k) => a + (open.need[k] - G.projectLeft(open.id, k)), 0);
        return {
            icon: ['building', open.id],
            text: `Prochain but : rénover ${open.name.toLowerCase()} (${Math.floor((got / tot) * 100)} %)`,
            go: 'village/village',
        };
    }
    const c = G.currentChapter();
    if (c && state.level < c.lvl)
        return { icon: ['ui', 'village'], text: `Chapitre ${G.chapterNum(c.n)} au niveau ${c.lvl} : « ${c.name} »`, go: 'sheet:levels' };
    if (G.houseCanUp()) return { icon: ['ui', 'house'], text: 'Agrandissez la maison de la ferme', go: 'sheet:house' };
    if (!state.legend) {
        const n = G.legendGoals().filter(g => g.ok).length;
        return { icon: ['ui', 'goldCow'], text: `Ferme légendaire : ${n} exploit${n > 1 ? 's' : ''} sur 5`, go: 'sheet:book', sec: 'legend' };
    }
    return null;
}

function goalHtml() {
    const g = nextGoal();
    if (!g) return '';
    return `<button class="goal-line" data-act="go" data-path="${g.go}"${g.sec ? ` data-sec="${g.sec}"` : ''}>${g.icon[0] === 'building' ? `<i class="ico">${art('building', g.icon[1])}</i>` : ico(g.icon)}<span>${g.text}</span><b>›</b></button>`;
}

// ce qui attend, en puces qu'on fait défiler du doigt
function todoHtml() {
    if (!ui.todo.length) return '';
    return `<div class="todo" aria-label="À faire">${ui.todo
        .map(
            t =>
                `<button class="todo-chip${t.urgent ? ' urgent' : ''}${t.n ? '' : ' soft'}" data-act="go" data-path="${t.go}">${t.icon ? ico(t.icon) : ''}<span>${t.text}</span></button>`,
        )
        .join('')}</div>`;
}

function eventBanner() {
    if (!G.eventActive()) return '';
    const e = state.event,
        ready = G.eventReady();
    return `<button class="event-banner" data-act="go" data-path="village/orders">${ico(G.eventIcon(e.season))}<span>${EVENTS[e.season].name}</span><small>${formatDuration(G.eventEndsIn())}</small>${ready ? `<span class="dot">${ready}</span>` : ''}</button>`;
}

const FIELD = `<div class="field"><div class="fence"></div>
    <div id="dog" class="dog" hidden data-anchor="dog"><div class="bubble"></div><div class="dog-body"></div><div class="dog-name"></div></div>
    <div id="plots" class="plots"></div><div class="field-night"></div><div id="flies" class="flies"></div></div>`;
const GH_BOX = `<div class="glasshouse"><div class="gh-roof"></div><div class="gh-head">${ico(['ui', 'greenhouse'])}<span>Serre</span><small>toujours de saison · arrosage automatique</small></div><div id="gh-grid" class="plots gh"></div></div>`;

export function renderFarm(el) {
    blocks(el, [
        ['top', topHtml()],
        ['pin', pinBar()],
        ['goal', goalHtml()],
        ['todo', todoHtml()],
        ['event', eventBanner()],
        ['field', FIELD],
        ['ghcard', greenhouseHtml()],
        ['gh', state.greenhouse.built ? GH_BOX : null],
        ['yard', farmyardHtml()],
        ['replant', toggle('Replanter automatiquement après la récolte', state.settings.autoReplant, 'setting', { key: 'autoReplant' })],
        ['hint', hint('Astuce : gardez le doigt appuyé et glissez sur les parcelles pour labourer, planter, arroser ou récolter d’un seul geste.')],
    ]);
    renderPlots();
    renderGreenhouse();
    renderDog();
}
defineView('farm/field', renderFarm);

// ---------------- le chien ----------------
let dogBusy = false;
function renderDog() {
    const el = byId('dog');
    if (!el) return;
    const d = state.dog;
    el.hidden = !d.owned;
    if (!d.owned) return;
    if (!el.dataset.ready) {
        el.dataset.ready = '1';
        el.querySelector('.dog-body').innerHTML = art('ui', 'dog');
        requestAnimationFrame(() => {
            const f = el.parentElement;
            placeDogAt(f.clientWidth * 0.7, f.clientHeight * 0.5, true);
        });
    }
    const b = el.querySelector('.bubble');
    const key = d.found ? JSON.stringify(d.found) : '';
    if (b.dataset.key !== key) {
        b.dataset.key = key;
        b.innerHTML = d.found ? `${ico(G.findIcon(d.found))}!` : '';
        b.classList.toggle('show', !!d.found);
    }
    const nm = el.querySelector('.dog-name');
    if (nm.textContent !== d.name) nm.textContent = d.name;
}

function placeDogAt(x, y, instant) {
    const el = byId('dog');
    if (!el) return;
    if (instant) el.style.transition = 'none';
    const old = parseFloat(el.style.left) || 0;
    el.classList.toggle('flip', x < old);
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    if (instant) requestAnimationFrame(() => (el.style.transition = ''));
    else {
        el.classList.add('walking');
        clearTimeout(el._stop);
        el._stop = setTimeout(() => el.classList.remove('walking'), 1600);
    }
}

export function wanderDog() {
    if (!state.dog.owned || !farmShown() || dogBusy || reduceMotion()) return;
    if (Math.random() > 0.55) return;
    const f = document.querySelector('.field');
    if (!f) return;
    placeDogAt(10 + Math.random() * (f.clientWidth - 70), 10 + Math.random() * (f.clientHeight - 70));
}
// 1.9 : le chien se pousse vers le bord du champ (quand on touche une parcelle sous lui, ou après quelques caresses)
let dogPets = 0;
function scootDog() {
    const f = document.querySelector('.field');
    if (!f) return;
    dogPets = 0;
    dogBusy = true;
    const left = Math.random() < 0.5;
    placeDogAt(left ? -8 : f.clientWidth - 46, 10 + Math.random() * (f.clientHeight - 70));
    setTimeout(() => (dogBusy = false), 6000);
}

// ---------------- les gestes sur le champ ----------------
let drag = null;
function plotEl(i) {
    return i >= 1000 ? ghEls[i - 1000] : plotEls[i];
}

function press(i) {
    const p = G.getPlot(i);
    const a = G.plotAction(p, state.selectedTool, i);
    // agrandir : on demande au relâché, pour que le doigt ne valide pas la fenêtre
    if (a === 'buy') buyPress = i;
    else run('plot', plotEl(i), { i, a });
    return a;
}

let buyPress = null;
function askPlot(i) {
    const gh = i >= 1000;
    askBuy(
        {
            title: gh ? 'Agrandir la serre' : 'Agrandir le champ',
            icon: gh ? ['ui', 'greenhouse'] : ['ui', 'shovel'],
            text: gh ? 'Une parcelle de plus dans la serre.' : `Une parcelle de plus : le champ passera à ${state.unlockedPlots + 1} parcelles.`,
            cost: gh ? G.ghCost() : G.getExpCost(),
            run: at => run('plot', at, { i, a: 'buy' }),
        },
        plotEl(i),
    );
}

export function setupFarm() {
    actions({
        plot: (el, d) => G.doPlotAction(+d.i, d.a, el),
        waterAll: el => G.waterAll(el),
        harvestAll: el => G.harvestAll(el),
        plantAll: el => G.plantAll(el),
        buildGreenhouse: el =>
            askBuy(
                {
                    title: 'Construire la serre',
                    icon: ['ui', 'greenhouse'],
                    text: 'Une serre : on y cultive toute l’année, sans arrosage.',
                    cost: GH.cost,
                    mats: MAT.greenhouse,
                    run: at => G.buildGreenhouse(at),
                },
                el,
            ),
        dog: el => G.handleDog(el),
    });
    const down = e => {
        const el = e.target.closest('.plot[data-i]');
        if (el) {
            e.preventDefault();
            const i = +el.dataset.i;
            const a = press(i);
            if (G.DRAG_ACTIONS.includes(a)) drag = { mode: a, done: new Set([i]) };
            return;
        }
        if (e.target.closest('#dog')) {
            e.preventDefault();
            // 1.9 : sans trouvaille, le doigt traverse le chien jusqu'à la parcelle, et il se pousse
            if (!state.dog.found) {
                const under = document.elementsFromPoint(e.clientX, e.clientY).find(x => x.closest && x.closest('.plot[data-i]'));
                const pl = under && under.closest('.plot[data-i]');
                if (pl) {
                    scootDog();
                    const i = +pl.dataset.i;
                    const a = press(i);
                    if (G.DRAG_ACTIONS.includes(a)) drag = { mode: a, done: new Set([i]) };
                    return;
                }
            }
            const found = !!state.dog.found;
            run('dog', byId('dog'));
            // une trouvaille ramassée, ou trois caresses : il laisse la place
            if (found || ++dogPets >= 3) setTimeout(scootDog, 700);
        }
    };
    const viewEl = byId('view-farm');
    viewEl.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', e => {
        if (!drag) return;
        const t = document.elementFromPoint(e.clientX, e.clientY);
        const el = t && t.closest && t.closest('.plot[data-i]');
        if (!el) return;
        const i = +el.dataset.i;
        if (drag.done.has(i)) return;
        drag.done.add(i);
        if (G.plotAction(G.getPlot(i), state.selectedTool, i) === drag.mode) run('plot', el, { i, a: drag.mode });
    });
    const end = e => {
        drag = null;
        if (buyPress === null) return;
        const i = buyPress;
        buyPress = null;
        const el = e.target && e.target.closest && e.target.closest('.plot[data-i]');
        if (el && +el.dataset.i === i && e.type === 'pointerup') askPlot(i);
    };
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    // le geste ne fait pas défiler la page pendant qu'on glisse sur le champ
    viewEl.addEventListener('touchmove', e => drag && e.preventDefault(), { passive: false });

    // effets sur les parcelles
    on('crowAway', ({ i, plant }) => crowFlyAway(i, plant));
    on('plotFx', ({ i, kind, delay, item }) => setTimeout(() => plotBurst(i, kind, item), delay || 0));
    on('plotFloat', ({ i, parts, dy }) => floatOnPlot(i, parts, dy));
    on('struck', i => plotBurst(i, 'dirt'));
    on('dogChase', i => {
        const plot = plotEl(i),
            field = document.querySelector('.field');
        if (!plot || !field) return;
        dogBusy = true;
        const fr = field.getBoundingClientRect(),
            pr = plot.getBoundingClientRect();
        placeDogAt(pr.left - fr.left + pr.width / 2 - 26, pr.top - fr.top + pr.height / 2 - 20);
        setTimeout(() => (dogBusy = false), 2000);
    });
    on('dogPet', () => {
        const el = byId('dog');
        if (!el) return;
        el.classList.remove('wag');
        void el.offsetWidth;
        el.classList.add('wag');
        emitHearts(el);
    });
    on('newDay', () => (plotSig.length = 0));
    on('reset', () => {
        plotEls.length = 0;
        ghEls = [];
    });
}

const emitHearts = el => emit('hearts', { at: el, n: 3 });

function plotBurst(i, kind, item) {
    const el = plotEl(i);
    if (!el || !el.isConnected) return;
    const c = centerOf(el);
    burstAt(c.x, c.y - 6, kind, 5);
    if (item && !reduceMotion()) flyTo(c.x, c.y, tabEl('market'), art('item', item), { size: 34 });
}
function floatOnPlot(i, p, dy = 0) {
    const el = plotEl(i);
    if (!el || !el.isConnected) return;
    const c = centerOf(el);
    floatText(c.x, c.y + dy, partsHtml(p));
}

function crowFlyAway(i, withPlant) {
    const el = plotEls[i];
    if (!el || !el.isConnected) return;
    const c = centerOf(el);
    const f = document.createElement('div');
    f.className = 'fx-fly';
    f.style.width = f.style.height = '54px';
    f.style.left = c.x - 27 + 'px';
    f.style.top = c.y - 40 + 'px';
    f.innerHTML = art('ui', 'crow');
    byId('fx').appendChild(f);
    const dir = Math.random() < 0.5 ? -1 : 1;
    f.animate(
        [
            { transform: 'translate(0,0) scaleX(' + dir + ')' },
            { transform: `translate(${dir * 60}px,-60px) scaleX(${dir}) rotate(${-dir * 15}deg)`, offset: 0.3 },
            { transform: `translate(${dir * 260}px,-320px) scaleX(${dir}) scale(.6)`, opacity: 0 },
        ],
        { duration: 1100, easing: 'ease-in' },
    ).onfinish = () => f.remove();
    burstAt(c.x, c.y - 10, withPlant ? 'leaf' : 'feather', 8);
}
