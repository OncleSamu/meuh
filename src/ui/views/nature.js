// Ferme | Nature : forêt, mine, étang et filet de pêche en mer.
import { state } from '../../core/state.js';
import { fmt } from '../../core/format.js';
import { NATURE, TOOL_MAX } from '../../data/nature.js';
import { FISH } from '../../data/meta.js';
import * as G from '../../systems/index.js';
import { byId, blocks, actions, run, $ } from '../dom.js';
import { ico, art } from '../icons.js';
import { btn, timer, hint } from '../kit.js';
import { defineView, currentPath } from '../app.js';

function toolRow(kind) {
    if (state.level < NATURE[kind].lvl) return '';
    const lvl = G.toolLvl(kind),
        name = kind === 'forest' ? 'Hache' : 'Pioche',
        icon = ['ui', kind === 'forest' ? 'axe' : 'pickaxe'];
    const effect = `${lvl} coup${lvl > 1 ? 's' : ''} en moins, +${lvl} ${kind === 'forest' ? 'bois' : 'pierre'} par récolte`;
    if (lvl >= TOOL_MAX) return `<div class="tool-row">${ico(icon)}<span>${name} au niveau maximum · ${effect}</span></div>`;
    const c = G.toolCost(kind),
        ok = state.inventory.tools >= c.tools && state.money >= c.coins;
    return `<div class="tool-row">${ico(icon)}<span>${name} niveau ${lvl + 1}${lvl ? ` · ${effect}` : ''}</span>
        ${btn(`${c.tools}${ico(['item', 'tools'])} ${fmt(c.coins)}${ico(['ui', 'coin'])}`, { act: 'upgradeTool', data: { k: kind }, kind: ok ? 'green' : '', size: 'sm', title: 'Améliorer' })}</div>`;
}

function slots(kind) {
    const locked = state.level < NATURE[kind].lvl;
    return state[kind]
        .map((sl, k) => {
            const up = G.slotUp(sl);
            const a = kind === 'forest' ? (up ? art('plant', 'apple:1') : art('ui', 'stump')) : up ? art('ui', sl.gem ? 'rockGem' : 'rock') : '';
            const max = G.slotHp(kind, sl);
            const hp = up && Math.min(sl.hp, max) < max ? `<div class="hp"><div style="width:${(Math.min(sl.hp, max) / max) * 100}%"></div></div>` : '';
            return `<button class="res-slot ${kind}${up ? '' : ' down'}${sl.big && up ? ' big' : ''}" data-res="${kind}" data-k="${k}" data-anchor="res:${kind}${k}" ${locked ? 'disabled' : ''}>
                <div class="res-art">${a}</div>${hp}${up ? '' : `<div class="regrow">${timer(sl.until)}</div>`}</button>`;
        })
        .join('');
}

function resCard(kind, title, sub, icon) {
    const locked = state.level < NATURE[kind].lvl;
    return `<div class="card nature-card${locked ? ' locked' : ''}">
        <div class="nature-head">${ico(icon)}<div class="card-main"><div class="card-title">${title}</div><div class="card-sub">${sub}</div></div>${locked ? `<span class="lock-tag">${ico(['ui', 'lock'])}Niveau ${NATURE[kind].lvl}</span>` : ''}</div>
        <div class="res-row ${kind}">${slots(kind)}</div>${toolRow(kind)}</div>`;
}

// ---------------- l'étang ----------------
const PHASE_BTN = { idle: 'Lancer la ligne', wait: 'Ferrer', bite: 'Ferrer !', reel: 'Ferrer !' };
function pondCard() {
    const locked = state.level < NATURE.pond.lvl;
    const f = G.fishing,
        ph = G.fishPhase();
    const msg = locked
        ? `L’étang ouvre au niveau ${NATURE.pond.lvl}.`
        : {
              idle: `Poissons possibles maintenant : ${G.fishAvailable()
                  .map(id => FISH[id].name.toLowerCase())
                  .join(', ')}.`,
              wait: 'Patience… Ferrez quand le bouchon plonge et que « ! » apparaît.',
              bite: 'Ça mord !',
              reel: 'Arrêtez le curseur dans la zone verte !',
          }[ph];
    const zone = ph === 'reel' ? `left:${(f.center - f.width / 2) * 100}%;width:${f.width * 100}%` : '';
    return `<div class="card nature-card pond-card${locked ? ' locked' : ''}">
        <div class="nature-head">${ico(['ui', 'rod'])}<div class="card-main"><div class="card-title">Étang</div><div class="card-sub">${msg}</div></div>${locked ? `<span class="lock-tag">${ico(['ui', 'lock'])}Niveau ${NATURE.pond.lvl}</span>` : ''}</div>
        <div class="pond" id="pond" data-phase="${ph}" data-anchor="pond"><div class="ripple r1"></div><div class="ripple r2"></div><div class="lily l1"></div><div class="lily l2"></div><div class="bobber"><span class="excl">!</span></div></div>
        <div class="reel"${ph === 'reel' ? '' : ' hidden'}><div class="reel-zone" style="${zone}"></div><div class="reel-cursor" id="reel-cursor"></div></div>
        ${btn(PHASE_BTN[ph], { act: 'fish', kind: ph === 'idle' ? 'blue' : 'gold', wide: true, size: 'lg', disabled: locked, cls: 'fish-btn' })}
    </div>`;
}

function netCard() {
    if (!G.netOpen()) return null;
    const n = state.net;
    return `<div class="card nature-card net-card">
        <div class="nature-head">${ico(['ui', 'net'])}<div class="card-main"><div class="card-title">Pêche en mer</div>
        <div class="card-sub">${!n.until ? 'Posez le filet, et relevez-le dans 20 minutes : sardines, maquereaux, crevettes, bars, parfois un homard.' : G.netReady() ? 'Le filet est plein, relevez-le !' : `Le filet est en mer : encore ${timer(n.until)}.`}</div></div></div>
        <div class="sea${n.until ? ' out' : ''}">${art('ui', 'net')}</div>
        ${!n.until ? btn('Poser le filet', { act: 'castNet', kind: 'blue', wide: true }) : btn('Relever le filet', { act: 'haulNet', kind: G.netReady() ? 'gold' : '', wide: true, disabled: !G.netReady() })}
    </div>`;
}

function renderNature(el) {
    G.ensureNature();
    blocks(el, [
        [
            'head',
            `<div class="view-top"><h2 class="view-title">Nature</h2><div class="mats"><span class="mat big">${ico(['item', 'wood'])}${state.inventory.wood}</span><span class="mat big">${ico(['item', 'stone'])}${state.inventory.stone}</span></div></div>`,
        ],
        ['hint', hint('Le bois et la pierre servent à construire les machines, la serre et les décorations.')],
        ['forest', resCard('forest', 'Forêt', 'Touchez un arbre pour le couper. Les gros arbres donnent plus de bois.', ['ui', 'axe'])],
        ['mine', resCard('mine', 'Mine', 'Cassez les rochers. Les gros filons et ceux qui brillent cachent des trésors.', ['ui', 'pickaxe'])],
        ['pond', pondCard()],
        ['net', netCard()],
    ]);
    if (G.fishing.phase !== 'idle') fishLoop();
}
defineView('farm/nature', renderNature);

// le curseur du moulinet et la touche du poisson, à chaque image
let looping = false;
function fishLoop() {
    if (looping) return;
    looping = true;
    let last = '';
    const step = () => {
        if (currentPath() !== 'farm/nature') {
            looping = false;
            return;
        }
        const ph = G.fishPhase();
        if (ph !== last) {
            last = ph;
            renderNature(byId('view-farm'));
        }
        if (ph === 'reel') {
            const c = byId('reel-cursor');
            if (c) c.style.left = G.reelPos() * 100 + '%';
        }
        if (ph === 'idle') {
            looping = false;
            return;
        }
        requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
}

export function setupNature() {
    actions({
        upgradeTool: (el, d) => G.upgradeTool(d.k, el),
        fish: () => {
            G.fishAction($('#pond'));
            fishLoop();
        },
        castNet: el => G.castNet(el),
        haulNet: el => G.haulNet(el),
        hit: (el, d) => G.hitSlot(d.res, +d.k, el),
    });
    // un coup de hache au premier contact, sans attendre le « clic »
    byId('view-farm').addEventListener('pointerdown', e => {
        const slot = e.target.closest('[data-res]');
        if (slot && !slot.disabled) {
            e.preventDefault();
            run('hit', slot, slot.dataset);
            return;
        }
        // toucher l'étang pendant la pêche, c'est ferrer
        if (e.target.closest('#pond') && G.fishing.phase !== 'idle') {
            e.preventDefault();
            run('fish', null);
        }
    });
}
