// Heum — la coque : en-tête, cinq onglets, rendu, minuteries, actions.
import { state, save, wipe } from '../core/state.js';
import { now } from '../core/clock.js';
import { on } from '../core/bus.js';
import * as H from '../systems/index.js';
import { ico, btn, bar, money } from './kit.js';
import { dur } from '../core/format.js';
import { openSheet, closeSheet, sheetOpen } from './sheet.js';
import { toast } from './fx.js';
import { exportSave, pickImport } from './savebox.js';
import { view as plots, gaugeBar } from './views/plots.js';
import { view as animals } from './views/menagerie.js';
import { view as recycle } from './views/recycling.js';
import { view as bunker } from './views/bunker.js';
import { view as caravans } from './views/caravans.js';

const VIEWS = [plots, animals, recycle, bunker, caravans];
const ACTIONS = Object.assign({}, ...VIEWS.map(v => v.actions));
let tab = 'plots';
try {
    tab = localStorage.getItem('heumTab') || 'plots';
} catch {}
const $ = id => document.getElementById(id);

function header() {
    const t = H.tier();
    $('top').innerHTML = `<button class="lvl" data-act="menu"><b>${state.level}</b></button>
        <div class="xp"><small>Niveau ${state.level}</small>${bar(state.xp / H.xpNeed(), '#9ccf3a')}</div>
        ${money(state.money)}
        <button class="cont-chip" data-act="goPlots" style="--tc:${t.col}">${ico('gauge')}<b>${Math.round(state.cont)} %</b></button>`;
    $('mini-gauge').innerHTML = gaugeBar();
}
function tabs() {
    $('tabs').innerHTML = VIEWS.map(
        v => `<button class="tab${v.id === tab ? ' on' : ''}" data-act="tab" data-v="${v.id}">${ico(v.icon)}<span>${v.name}</span></button>`,
    ).join('');
}
// ce qui change la forme de l'écran (le reste, ce sont les minuteries)
const sig = () =>
    JSON.stringify([
        tab,
        state.inv,
        state.money,
        state.level,
        state.xp,
        Math.round(state.cont),
        state.plots.map(p => [p.open, p.crop, p.rebel, H.cropReady(p)]),
        state.animals.map(a => [a.stock.length, Math.round(a.charge)]),
        state.wreck.charges,
        Object.keys(state.machines).map(m => [m, H.jobDone(m)]),
        state.bunker.food,
        H.convoy().id,
        H.sentinel() && H.sentinel().id,
    ]);
let last = '';
export function render() {
    const v = VIEWS.find(x => x.id === tab) || plots;
    header();
    tabs();
    const main = $('main'),
        y = main.scrollTop;
    main.innerHTML = `<h1 class="view-title">${v.name}</h1>${v.render()}`;
    main.scrollTop = y;
    last = sig();
}
function timers() {
    const t = now();
    for (const el of document.querySelectorAll('[data-end]')) {
        const left = Math.max(0, (+el.dataset.end - t) / 1000);
        if (el.classList.contains('timer')) el.textContent = dur(left);
        else if (el.dataset.total) el.firstElementChild.style.width = (1 - left / +el.dataset.total) * 100 + '%';
    }
}
let prev = now();
function loop() {
    const t = now();
    const dt = (t - prev) / 1000;
    // un grand écart = le jeu était suspendu (téléphone verrouillé) : on rattrape sans toucher à la jauge
    if (dt > 10) H.away(dt);
    else H.tick(dt);
    prev = t;
    if (sig() !== last && !sheetOpen()) render();
    else timers();
}

const SHELL = {
    tab(el, d) {
        tab = d.v;
        try {
            localStorage.setItem('heumTab', tab);
        } catch {}
        $('main').scrollTop = 0;
    },
    goPlots() {
        tab = 'plots';
    },
    menu(el, d, first = false) {
        openSheet(
            'Heum 0.5',
            `<p>Heum est le troisième monde de la ferme : un îlot cultivable dans les terres mortes. Vous pilotez la <b>Contamination</b> pour faire muter vos cultures sans perdre vos récoltes.</p>
            <ul class="perks"><li>${ico('gauge')}Saine (0-30 %), Mutagène (30-60 %), Instable (60-85 %), Critique (85 % et plus).</li>
            <li>${ico('rutabagaGlow')}Le palier au moment de la récolte décide : mutant, Rebelle ou déchet.</li>
            <li>${ico('hen')}Hors ligne, rien ne se propage et rien ne se perd.</li></ul>
            ${first ? '' : `<p class="hint">Récoltes : ${state.stats.harvests} · mutants : ${state.stats.mutants} · ventes : ${state.stats.sold}</p>`}
            ${first ? btn('C’est parti', 'close', {}, { kind: 'go' }) : `<h4>Sauvegarde</h4><div class="row">${btn('Exporter', 'saveExport', {}, { size: 'sm' })}${btn('Reprendre un fichier', 'saveImport', {}, { size: 'sm' })}</div><div class="row">${btn('Recommencer la partie', 'reset', {}, { kind: 'danger', size: 'sm' })}</div>`}`,
        );
    },
    saveExport() {
        exportSave();
    },
    saveImport() {
        pickImport(() => render());
    },
    reset() {
        openSheet(
            'Recommencer ?',
            `<p>Toute la partie de Heum sera effacée (Meuh n’est pas touché).</p>${btn('Oui, tout effacer', 'resetYes', {}, { kind: 'danger' })}`,
        );
    },
    resetYes() {
        wipe();
        closeSheet();
    },
};

export function setupApp() {
    document.addEventListener('click', e => {
        const el = e.target.closest('[data-act]');
        if (!el || el.disabled) return;
        const fn = SHELL[el.dataset.act] || ACTIONS[el.dataset.act];
        if (!fn) return;
        fn(el, el.dataset);
        save();
        if (!sheetOpen() || el.dataset.act === 'plant') render();
        else header();
    });
    on('level', ({ level, unlock, gift }) => {
        openSheet(
            `Niveau ${level} !`,
            `<div class="levelup">${ico('xp', 'ico huge')}<p>+${gift} pièces</p>${unlock ? `<p class="unlock">Nouveau : <b>${unlock}</b></p>` : ''}${btn('Super', 'close', {}, { kind: 'go' })}</div>`,
        );
    });
    on('tier', t => toast(`La jauge passe en palier ${t.name}`));
    ACTIONS.close = () => closeSheet();
    render();
    setInterval(loop, 1000);
    setInterval(save, 5000);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) save();
        else {
            // au retour, le temps passé en arrière-plan compte (sans la jauge)
            const gone = H.catchUp();
            prev = now();
            if (gone > 60) toast(`Pendant votre absence (${dur(gone)}), la ferme a tourné sans vous : rien n’est perdu.`);
            render();
        }
    });
    if (!state.seen.intro) {
        state.seen.intro = 1;
        SHELL.menu(null, {}, true);
    }
}
