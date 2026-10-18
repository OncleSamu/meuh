// Ferme | Nature : forêt et mine (l'étang et le filet en mer ont leur volet, Ferme | Étang).
import { state } from '../../core/state.js';
import { fmt } from '../../core/format.js';
import { NATURE, TOOL_MAX } from '../../data/nature.js';
import * as G from '../../systems/index.js';
import { byId, blocks, actions, run } from '../dom.js';
import { ico, art } from '../icons.js';
import { btn, timer, hint } from '../kit.js';
import { defineView } from '../app.js';

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

function renderNature(el) {
    G.ensureNature();
    blocks(el, [
        [
            'head',
            `<div class="view-top end"><div class="mats"><span class="mat big">${ico(['item', 'wood'])}${fmt(Math.floor(state.inventory.wood))}</span><span class="mat big">${ico(['item', 'stone'])}${fmt(Math.floor(state.inventory.stone))}</span></div></div>`,
        ],
        ['hint', hint('Le bois et la pierre servent à construire les machines, la serre et les décorations.')],
        ['forest', resCard('forest', 'Forêt', 'Touchez un arbre pour le couper. Les gros arbres donnent plus de bois.', ['ui', 'axe'])],
        ['mine', resCard('mine', 'Mine', 'Cassez les rochers. Les gros filons et ceux qui brillent cachent des trésors.', ['ui', 'pickaxe'])],
    ]);
}
defineView('farm/nature', renderNature);

export function setupNature() {
    actions({
        upgradeTool: (el, d) => G.upgradeTool(d.k, el),
        hit: (el, d) => G.hitSlot(d.res, +d.k, el),
    });
    // un coup de hache au premier contact, sans attendre le « clic »
    const down = e => {
        const slot = e.target.closest('[data-res]');
        if (slot && !slot.disabled) {
            e.preventDefault();
            run('hit', slot, slot.dataset);
        }
    };
    byId('view-farm').addEventListener('pointerdown', down);
    byId('view-aside').addEventListener('pointerdown', down);
}
