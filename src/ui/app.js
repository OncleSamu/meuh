// La coque de l'application : en-tête, onglets, volets, barre d'outils, rafraîchissement et sauvegarde.
import { state, writeSave, getStore, BACKUP_KEY } from '../core/state.js';
import { now } from '../core/clock.js';
import { view, setView } from '../core/view.js';
import { fmt, fmtK, formatDuration } from '../core/format.js';
import { on, emit } from '../core/bus.js';
import { ANIMALS } from '../data/animals.js';
import { MACHINES } from '../data/machines.js';
import { NATURE } from '../data/nature.js';
import { ORCHARD } from '../data/farm.js';
import { ISLAND } from '../data/island.js';
import { GENETICS } from '../data/genetics.js';
import { ABBEY } from '../data/abbey.js';
import { CAVE_LVL } from '../data/cave.js';
import { HARAS_LVL } from '../data/haras.js';
import { MAX_LEVEL } from '../data/progress.js';
import * as G from '../systems/index.js';
import { $$, byId, patch, setupActions, afterAction, actions } from './dom.js';
import { ico, parts } from './icons.js';
import { segmented, dot } from './kit.js';
import { render as renderSheets, openSheet, anySheet, closeSheet } from './sheets.js';
import { momentShown, closeMoment } from './moments.js';
import { todoList, todoCounts } from './todo.js';

// ---------------- l'état de l'interface (jamais sauvegardé, sauf l'onglet) ----------------
export const ui = {
    tab: 'farm',
    sub: { farm: 'field', animals: 'pasture', machines: 'workshop', village: 'orders', market: 'shop' },
    sel: {}, // sélections des vues : commande choisie, chantier, carte…
    todo: [],
    counts: {},
};

export const TABS = [
    {
        id: 'farm',
        name: 'Ferme',
        icon: ['item', 'wheat'],
        subs: [
            ['field', 'Champ', ['ui', 'basket']],
            ['orchard', 'Verger', ['item', 'apple'], () => (state.orchard && state.orchard.slots.some(x => x.open) ? 1 : ORCHARD.lvl)],
            ['nature', 'Nature', ['item', 'wood'], () => NATURE.forest.lvl],
            ['pond', 'Pêche', ['ui', 'rod'], () => NATURE.pond.lvl],
            ['island', 'Île', ['item', 'pineapple'], () => ISLAND.lvl],
        ],
    },
    {
        id: 'animals',
        name: 'Animaux',
        icon: ['animal', 'chicken'],
        lock: () => ANIMALS.chicken.reqLvl,
        subs: [
            ['pasture', 'Prés', ['animal', 'cow']],
            ['haras', 'Haras', ['ui', 'hEcuries'], () => HARAS_LVL],
        ],
    },
    {
        id: 'machines',
        name: 'Atelier',
        icon: ['machine', 'bakery'],
        lock: () => MACHINES.mill.reqLvl,
        subs: [
            ['workshop', 'Production', ['machine', 'mill']],
            ['counter', 'Comptoir', ['machine', 'counter'], () => MACHINES.counter.reqLvl],
            ['cave', 'Cave', ['ui', 'cave'], () => CAVE_LVL],
            ['brew', 'Brasserie', ['ui', 'beer'], () => ABBEY.lvl],
            ['lab', 'Labo', ['ui', 'flowers'], () => GENETICS.lvl],
        ],
    },
    {
        id: 'village',
        name: 'Village',
        icon: ['villager', 'gaston'],
        subs: [
            ['orders', 'Commandes', ['ui', 'scroll']],
            ['village', 'Village', ['ui', 'village']],
        ],
    },
    {
        id: 'market',
        name: 'Marché',
        icon: ['ui', 'stall'],
        subs: [
            ['shop', 'Acheter', ['ui', 'shop']],
            ['sell', 'Vendre', ['ui', 'coin']],
        ],
    },
];
const tabDef = id => TABS.find(t => t.id === id);
export const tabLockLvl = id => (tabDef(id).lock ? tabDef(id).lock() : 1);
export const tabLocked = id => state.level < tabLockLvl(id);
const subLockLvl = (tab, sub) => {
    const s = (tabDef(tab).subs || []).find(x => x[0] === sub);
    return s && s[3] ? s[3]() : 1;
};
export const subLocked = (tab, sub) => state.level < subLockLvl(tab, sub);
export const currentPath = () => (tabDef(ui.tab).subs ? `${ui.tab}/${ui.sub[ui.tab]}` : ui.tab);

// ---------------- les vues ----------------
const VIEWS = {};
export const defineView = (path, fn) => (VIEWS[path] = fn);

// ---------------- navigation ----------------
// go('village/orders'), go('market'), go('sheet:book')
export function go(path, opts = {}) {
    if (!path) return;
    if (path.startsWith('sheet:')) {
        openSheet(path.slice(6), opts);
        return;
    }
    // 1.44.2 : concours et élevage sont dans le volet Haras
    if (path === 'animals/show' || path === 'animals/stud') path = 'animals/haras#' + path.split('/')[1];
    // « market/shop#neighbors » : ouvre le volet sur un rayon (ui.sel[volet])
    const [path0, hash] = path.split('#');
    const [tab, sub0] = path0.split('/');
    if (hash && sub0) ui.sel[sub0] = hash;
    let sub = sub0;
    // écran large : l'onglet Ferme montre la nature à droite (le champ est toujours à gauche)
    if (view.wide && tab === 'farm' && !sub) sub = !subLocked('farm', 'orchard') ? 'orchard' : !subLocked('farm', 'nature') ? 'nature' : sub;
    if (tabLocked(tab)) {
        emit('toast', { text: `${tabDef(tab).name} : s’ouvre au niveau ${tabLockLvl(tab)}`, icon: ['ui', 'lock'] });
        emit('sfx', 'error');
        return;
    }
    if (sub && subLocked(tab, sub)) {
        const s = tabDef(tab).subs.find(x => x[0] === sub);
        emit('toast', { text: `${s[1]} : s’ouvre au niveau ${subLockLvl(tab, sub)}`, icon: ['ui', 'lock'] });
        emit('sfx', 'error');
        return;
    }
    const changed = ui.tab !== tab || (sub && ui.sub[tab] !== sub);
    // écran large : le champ reste à gauche, on n'y « va » pas
    if (view.wide && tab === 'farm' && (sub || ui.sub.farm) === 'field') {
        byId('view-farm').scrollTop = 0;
        return;
    }
    ui.tab = tab;
    if (sub) ui.sub[tab] = sub;
    state.settings.lastView = currentPath();
    if (changed) {
        emit('sfx', 'click');
        const v = byId('view-' + tab);
        if (v) v.scrollTop = 0;
    }
    refresh();
}

// ---------------- en-tête ----------------
function renderHud() {
    const req = G.xpNeed();
    const p = Math.min(1, state.xp / req);
    const xpText = state.level >= MAX_LEVEL ? `★ ${state.renown || 0} · ${Math.floor(p * 100)} %` : `${fmtK(state.xp)} / ${fmtK(req)}`;
    const used = G.barnUsed(),
        cap = G.barnCap();
    const menuN = ui.counts.menu || 0;
    patch(
        byId('hud'),
        `<button class="lvl${state.legend ? ' legend' : ''}" data-act="open" data-sheet="levels" aria-label="Niveau ${state.level}${state.level >= MAX_LEVEL ? `, renommée ${state.renown || 0}, ${Math.floor(p * 100)} % vers l’étoile suivante` : ''}, voir les niveaux" title="${state.level >= MAX_LEVEL ? `Renommée : ${state.renown || 0} étoile(s), ${Math.floor(p * 100)} % vers la suivante` : ''}">
            <span class="lvl-star">${ico(['ui', 'star'])}<b${state.level > 9 ? ' class="two"' : ''}>${state.level}</b></span>
            <span class="xp-bar"><i style="width:${(p * 100).toFixed(1)}%"></i><small>${xpText}</small></span>
        </button>
        <span class="pill coins" id="coin-pill">${ico(['ui', 'coin'])}<b id="ui-money"></b></span>
        <button class="pill barn${used >= cap ? ' full' : used >= cap * 0.85 ? ' near' : ''}" id="barn-pill" data-act="open" data-sheet="barn" aria-label="Grange">${ico(['ui', 'barn'])}<b>${used >= 1e4 || cap >= 1e4 ? `${fmt(used)}/${fmt(cap)}` : `${used}/${cap}`}</b></button>
        <button class="icon-btn menu-btn" data-act="open" data-sheet="menu" aria-label="Menu">${ico(['ui', 'menu'])}${dot(menuN)}</button>`,
    );
    if (used >= cap * 0.8) G.tip('barn');
}

function renderTabs() {
    patch(
        byId('tabs'),
        TABS.map(t => {
            const locked = tabLocked(t.id),
                n = ui.counts[t.id] || 0;
            return `<button class="tab${ui.tab === t.id ? ' on' : ''}${locked ? ' locked' : ''}" data-act="go" data-path="${t.id}" data-tab="${t.id}" aria-label="${t.name}">
                <span class="tab-ico">${ico(locked ? ['ui', 'lock'] : t.icon)}</span><span class="tab-name">${t.name}</span>${locked ? '' : dot(n)}</button>`;
        }).join(''),
    );
}

// 1.44 : la page du Guide du fermier de chaque écran (le bouton « ? » au bout des onglets)
const HELP = {
    'farm/field': 'field',
    'farm/orchard': 'orchard',
    'farm/nature': 'forest',
    'farm/pond': 'pond',
    'farm/island': 'island',
    'animals/pasture': 'animals',
    'animals/haras': 'haras',
    'machines/workshop': 'workshop',
    'machines/counter': 'counter',
    'machines/cave': 'cave',
    'machines/brew': 'brewery',
    'machines/lab': 'labplants',
    'village/orders': 'orders',
    'village/village': 'village',
    'market/shop': 'market',
    'market/sell': 'market',
};

function renderSubnav() {
    const t = tabDef(ui.tab);
    const el = byId('subnav');
    if (!t.subs) {
        el.hidden = true;
        return;
    }
    el.hidden = false;
    const help = currentPath() === 'market/sell' && ui.sel.sell === 'beasts' && G.fairOpen() ? 'elevage' : HELP[currentPath()];
    patch(
        el,
        `<div class="subnav-row">` +
            segmented(
                t.subs.map(([id, label, icon]) => {
                    const locked = subLocked(t.id, id);
                    return [
                        id,
                        locked ? `${label} · niv. ${subLockLvl(t.id, id)}` : label,
                        locked ? ['ui', 'lock'] : icon,
                        locked ? 0 : ui.counts[`${t.id}/${id}`] || 0,
                        locked,
                    ];
                }),
                ui.sub[t.id],
                'sub',
            ) +
            (help
                ? `<button class="sub-help" data-act="open" data-sheet="guide" data-page="${help}" title="Aide de cet écran" aria-label="Aide de cet écran">?</button>`
                : '') +
            '</div>',
    );
}

// grand écran : la nature s'affiche à droite, le champ restant à gauche
const asideShown = () => view.wide && ui.tab === 'farm' && ui.sub.farm !== 'field';
export const viewEl = path => (view.wide && path.startsWith('farm/') && path !== 'farm/field' ? byId('view-aside') : byId('view-' + path.split('/')[0]));

// ---------------- rafraîchissement ----------------
let toolbarRender = () => {};
export const setToolbar = fn => (toolbarRender = fn);
let started = false;

export function refresh() {
    if (!started) return;
    ui.todo = todoList();
    ui.counts = todoCounts(ui.todo);
    setView({ tab: ui.tab, sub: ui.sub[ui.tab] || '' });
    renderHud();
    renderTabs();
    renderSubnav();
    const path = currentPath();
    const aside = asideShown();
    $$('.view').forEach(v =>
        v.classList.toggle('on', v.dataset.tab === 'aside' ? aside : (v.dataset.tab === ui.tab && !aside) || (view.wide && v.dataset.tab === 'farm')),
    );
    if (VIEWS[path]) VIEWS[path](viewEl(path));
    // grand écran : le champ toujours à gauche
    if (view.wide && (ui.tab !== 'farm' || aside)) VIEWS['farm/field'](byId('view-farm'));
    toolbarRender();
    renderSheets();
    live();
}

// ---------------- ce qui bouge chaque seconde sans tout redessiner ----------------
const LIVE = {};
export const defineLive = (kind, fn) => (LIVE[kind] = fn);

export function live() {
    const t = now();
    $$('[data-until]').forEach(el => {
        const txt = formatDuration(Math.max(0, (+el.dataset.until - t) / 1000));
        if (el.textContent !== txt) el.textContent = txt;
    });
    $$('[data-live]').forEach(el => {
        const [kind, ...args] = el.dataset.live.split(':');
        const fn = LIVE[kind];
        if (!fn) return;
        const p = fn(...args);
        const i = el.firstElementChild;
        if (i && p !== undefined && p !== null) i.style.width = `${(Math.max(0, Math.min(1, p)) * 100).toFixed(1)}%`;
    });
}

// ---------------- sauvegarde ----------------
let saveTimer = null;
let noSave = false;
export const stopSaving = () => (noSave = true);
export function save() {
    if (noSave || saveTimer) return;
    saveTimer = setTimeout(saveNow, 400);
}
export function saveNow() {
    clearTimeout(saveTimer);
    saveTimer = null;
    if (noSave) return;
    // 1.44 : plus de place sur l'appareil ? on libère les copies de secours et on réessaie, puis on prévient (une fois)
    if (!writeSave() && getStore()) {
        try {
            getStore().removeItem(BACKUP_KEY);
        } catch {
            // rien à libérer
        }
        if (!writeSave() && !saveWarned) {
            saveWarned = true;
            toast({ text: 'Plus de place sur l’appareil : la ferme ne se sauvegarde plus. Exportez-la depuis les Réglages.', icon: ['ui', 'download'] });
        }
        return;
    }
    saveWarned = false;
    G.pushBackup();
}
let saveWarned = false;

// ---------------- messages ----------------
function toast({ text, icon }) {
    if (!started) return;
    const box = byId('toasts');
    const same = [...box.children].find(t => t.dataset.msg === text);
    if (same) same.remove();
    while (box.children.length >= 2) box.firstChild.remove();
    const t = document.createElement('div');
    t.className = 'toast';
    t.dataset.msg = text;
    t.innerHTML = (icon ? ico(icon) : '') + '<span></span>';
    t.querySelector('span').textContent = text;
    t.addEventListener('pointerdown', () => t.remove());
    box.appendChild(t);
    setTimeout(() => t.remove(), 2600);
}

// ---------------- annuler une vente ----------------
let undoTimer = null;
function showUndo(sale) {
    const el = byId('undo');
    el.innerHTML = `<span>${parts([`Vendu ${sale.n} produit${sale.n > 1 ? 's' : ''} pour ${sale.gain.toLocaleString('fr-FR')}`, ['ui', 'coin']])}</span><button class="btn gold sm" data-act="undoSale">Annuler</button><i class="undo-time"></i>`;
    el.hidden = false;
    el.classList.remove('run');
    void el.offsetWidth;
    el.classList.add('run');
    clearTimeout(undoTimer);
    undoTimer = setTimeout(() => (el.hidden = true), 5000);
}
const hideUndo = () => (byId('undo').hidden = true);

// ---------------- grand écran ----------------
const WIDE = '(min-width: 1100px)';
function applyWide() {
    const wide = matchMedia(WIDE).matches;
    if (wide === view.wide) return;
    setView({ wide });
    document.body.classList.toggle('wide', wide);
    if (wide && ui.tab === 'farm' && ui.sub.farm === 'field') ui.tab = 'village';
    refresh();
}

// ---------------- clavier (ordinateur) ----------------
// 1 à 5 : onglets ; A arroser, R récolter ou ramasser, N nourrir, V tout vendre ; Échap ferme.
function handleKey(e) {
    if (e.ctrlKey || e.metaKey || e.altKey || /input|textarea|select/i.test(e.target.tagName)) return;
    if (e.key === 'Escape') {
        if (momentShown()) closeMoment();
        else if (anySheet()) closeSheet();
        return;
    }
    if (momentShown() || anySheet()) return;
    if (/^[1-5]$/.test(e.key)) return go(TABS[+e.key - 1].id);
    const k = e.key.toLowerCase(),
        p = currentPath();
    const press = act => {
        const b = document.querySelector(`#view-${ui.tab} [data-act="${act}"]`);
        if (b) b.click();
    };
    if (p === 'farm/field' && k === 'a') press('waterAll');
    else if (p === 'farm/field' && k === 'r') press('harvestAll');
    else if (p === 'animals/pasture' && k === 'n') press('feedAll');
    else if (p === 'animals/pasture' && k === 'r') press('collectAnimals');
    else if (p === 'machines/workshop' && k === 'r') press('collectMachines');
    else if (p === 'market/sell' && k === 'v') press('sellAll');
}

// l'élément d'un onglet (pour les objets qui s'y envolent)
export const tabEl = id => document.querySelector(`#tabs [data-tab="${id}"]`) || byId('tabs');

export function setupApp() {
    setupActions();
    // après chaque geste : on redessine et on sauvegarde
    afterAction(() => {
        refresh();
        save();
    });
    actions({
        go: (el, d) => go(d.path, { ...d }), // une copie : le dataset du bouton transforme tout en texte
        sub: (el, d) => go(`${ui.tab}/${d.v}`),
        open: (el, d) => openSheet(d.sheet, { ...d }),
        // sur téléphone, le « clic » qui suit le geste d'ouverture tombe sur le fond de la fenêtre qui vient de s'ouvrir : on l'ignore
        sheetClose: el => {
            const w = el && el.closest && el.closest('.sheet-wrap');
            if (el && el.classList && el.classList.contains('sheet-back') && w && performance.now() - (w._t || 0) < 450) return;
            closeSheet();
        },
        momentOk: () => closeMoment(),
        undoSale: () => {
            G.undoSale();
            hideUndo();
        },
    });
    on('toast', toast);
    on('sale', showUndo);
    on('tool', () => toolbarRender());
    on('reset', () => {
        ui.sel = {};
        go('farm/field');
    });
    document.addEventListener('keydown', handleKey);
    document.addEventListener('visibilitychange', () => {
        setView({ hidden: document.hidden });
        if (document.hidden) saveNow();
    });
    window.addEventListener('pagehide', saveNow);
    matchMedia(WIDE).addEventListener('change', applyWide);
    setView({ wide: matchMedia(WIDE).matches });
    document.body.classList.toggle('wide', view.wide);
    // l'onglet de la dernière fois
    const last = state.settings.lastView;
    if (last && state.tutorial.done) {
        const [tab, sub] = String(last).split('/');
        if (tabDef(tab) && !tabLocked(tab)) {
            ui.tab = tab;
            if (sub && (tabDef(tab).subs || []).some(s => s[0] === sub) && !subLocked(tab, sub)) ui.sub[tab] = sub;
        }
    }
    // grand écran : le champ est déjà à gauche, la colonne de droite montre le village
    if (view.wide && ui.tab === 'farm' && ui.sub.farm === 'field') ui.tab = 'village';
    started = true;
}
