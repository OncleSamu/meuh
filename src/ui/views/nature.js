// Ferme | Nature : forêt et mine (l'étang et le filet en mer ont leur volet, Ferme | Pêche).
import { state } from '../../core/state.js';
import { fmt } from '../../core/format.js';
import { NATURE, TOOL_MAX, DEPTHS, MINE_GEAR, KILN, WORKERS, workerCap, NAT_LOG, NAT_LOG_IDS } from '../../data/nature.js';
import { ITEMS } from '../../data/items.js';
import * as G from '../../systems/index.js';
import { byId, blocks, actions, run } from '../dom.js';
import { ico, art } from '../icons.js';
import { btn, timer, tip15 } from '../kit.js';
import { defineSheet } from '../sheets.js';
import { foldWrap } from '../fold.js';
import { defineView } from '../app.js';

const costOf = c =>
    G.costParts(c)
        .map(x => `<span class="${x.ok ? 'ok' : 'short'}">${ico(x.icon)}${fmt(x.n)}</span>`)
        .join('');
const TOOL_NAMES = ['', 'en bois', 'en pierre', 'renforcée', 'à tête de fer', 'à tête d’argent', 'à tête d’or'];

function toolRow(kind) {
    if (state.level < NATURE[kind].lvl) return '';
    const lvl = G.toolLvl(kind),
        name = kind === 'forest' ? 'Hache' : 'Pioche',
        icon = ['ui', kind === 'forest' ? 'axe' : 'pickaxe'];
    const effect = `${Math.min(lvl, 3) + (lvl > 3 ? 1 : 0)} coup${lvl > 1 ? 's' : ''} en moins, +${lvl} ${kind === 'forest' ? 'bois' : 'pierre'} par récolte`;
    if (lvl >= TOOL_MAX) return `<div class="tool-row">${ico(icon)}<span>${name} au niveau maximum (tête d’or) · ${effect}</span></div>`;
    if (!G.toolOpen(kind))
        return `<div class="tool-row soon">${ico(icon)}<span>${name} niveau ${lvl + 1} (${TOOL_NAMES[lvl + 1]}) · dès le niveau ${G.toolHead(kind).lvl}</span></div>`;
    const c = G.toolCost(kind),
        ok = G.hasCost(c);
    return `<div class="tool-row">${ico(icon)}<span>${name} niveau ${lvl + 1} (${TOOL_NAMES[lvl + 1]})${lvl ? ` · ${effect}` : ''}</span>
        ${btn(`<span class="cost">${costOf(c)}</span>`, { act: 'upgradeTool', data: { k: kind }, kind: ok ? 'green' : '', size: 'sm', title: 'Améliorer' })}</div>`;
}

function slots(kind) {
    const locked = state.level < NATURE[kind].lvl;
    return state[kind]
        .map((sl, k) => {
            const up = G.slotUp(sl);
            let a;
            if (kind === 'forest')
                a = up
                    ? art('item', { oak: 'treeOak', pine: 'treePine', birch: 'treeBirch', chestnut: 'treeChestnut' }[sl.sp] || 'treeOak')
                    : art('item', 'sapling');
            else
                a = up
                    ? sl.gem
                        ? art('item', 'rockVein')
                        : sl.ore && sl.ore !== 'stone'
                          ? art('item', 'rock' + sl.ore.replace('Ore', '').replace(/^./, c => c.toUpperCase()))
                          : art('ui', 'rock')
                    : '';
            const max = G.slotHp(kind, sl);
            const hp = up && Math.min(sl.hp, max) < max ? `<div class="hp"><div style="width:${(Math.min(sl.hp, max) / max) * 100}%"></div></div>` : '';
            return `<button class="res-slot ${kind}${up ? '' : ' down'}${sl.big && up ? ' big' : ''}${sl.gem && up && kind === 'mine' ? ' vein' : ''}" data-res="${kind}" data-k="${k}" data-anchor="res:${kind}${k}" ${locked ? 'disabled' : ''}>
                <div class="res-art">${a}</div>${hp}${up ? '' : `<div class="regrow">${timer(sl.until)}</div>`}</button>`;
        })
        .join('');
}

// un ouvrier : embauche, charges prêtes, amélioration
function workerRow(k) {
    const W = WORKERS[k];
    if (state.level < W.lvl) return `<div class="tool-row soon">${ico(['ui', W.icon])}<span>${W.name} : dès le niveau ${W.lvl}</span></div>`;
    const lvl = G.workerLvl(k);
    if (!lvl) {
        const ok = G.hasCost(W.hire);
        return `<div class="tool-row">${ico(['ui', W.icon])}<span>${W.name} : une charge toutes les 2 heures, même jeu fermé</span>
            ${btn(`<span class="cost">${costOf(W.hire)}</span>`, { act: 'hireWorker', data: { k }, kind: ok ? 'green' : '', size: 'sm', title: 'Embaucher' })}</div>`;
    }
    const n = G.loadsReady(k),
        load = G.loadOf(k),
        cap = workerCap(lvl);
    const parts = Object.entries(load)
        .map(([id, q]) => `<span class="load">${ico(['item', id])}${q}</span>`)
        .join('');
    const nxt = G.workerNext(k);
    return `<div class="worker${n ? ' ready' : ''}"><div class="worker-top">${ico(['ui', W.icon])}<span><b>${W.name}</b> · niveau ${lvl} · ${n}/${cap} charge${cap > 1 ? 's' : ''}</span>
        ${btn(n ? `Récupérer${n > 1 ? ` (${n})` : ''}` : 'En route…', { act: 'collectLoads', data: { k }, kind: n ? 'green' : '', size: 'sm', disabled: !n })}</div>
        <div class="worker-load">Une charge : ${parts}</div>
        ${nxt ? `<div class="worker-up"><span>Niveau ${lvl + 1} : plus de matériaux, plus de place</span>${btn(`<span class="cost">${costOf(nxt)}</span>`, { act: 'upgradeWorker', data: { k }, kind: G.hasCost(nxt) ? 'green' : '', size: 'sm', title: 'Améliorer' })}</div>` : ''}</div>`;
}

function kilnRow() {
    if (state.level < KILN.lvl) return '';
    const k = state.nat && state.nat.kiln;
    if (!k)
        return `<div class="tool-row">${ico(['ui', 'charcoalKiln'])}<span>La charbonnière : le bois y brûle lentement et devient du charbon</span>
        ${btn(`<span class="cost">${costOf(KILN.build)}</span>`, { act: 'buildKiln', kind: G.hasCost(KILN.build) ? 'green' : '', size: 'sm', title: 'Construire' })}</div>`;
    if (G.kilnReady())
        return `<div class="tool-row ready">${ico(['ui', 'charcoalKiln'])}<span>Le charbon est prêt</span>${btn(`+${KILN.coal} ${ico(['item', 'coal'])}`, { act: 'kilnTake', kind: 'green', size: 'sm' })}</div>`;
    if (G.kilnBusy()) return `<div class="tool-row">${ico(['ui', 'charcoalKiln'])}<span>La charbonnière brûle…</span>${timer(k.start + KILN.time)}</div>`;
    const ok = state.inventory.wood >= KILN.wood;
    return `<div class="tool-row">${ico(['ui', 'charcoalKiln'])}<span>Allumer : ${KILN.wood} bois donnent ${KILN.coal} charbon (20 min)</span>${btn(`${KILN.wood}${ico(['item', 'wood'])}`, { act: 'kilnLight', kind: ok ? 'green' : '', size: 'sm', disabled: !ok })}</div>`;
}

function depthRow() {
    if (state.level < NATURE.mine.lvl) return '';
    const n = G.ensureNat();
    const tabs = Object.values(DEPTHS)
        .map(
            d =>
                `<button class="depth${n.depth === d.id ? ' on' : ''}${G.depthOpen(d.id) ? '' : ' lock'}" data-act="setDepth" data-id="${d.id}" ${state.level < d.lvl ? 'disabled' : ''}>${ico(['ui', d.icon])}<b>${d.name}</b><small>${state.level < d.lvl ? `Niveau ${d.lvl}` : G.depthOpen(d.id) ? '' : 'Équipement'}</small></button>`,
        )
        .join('');
    let gear = '';
    if (state.level >= DEPTHS.gallery.lvl) {
        gear = Object.entries(MINE_GEAR)
            .map(([k, g]) =>
                n.gear[k]
                    ? `<span class="gear on">${ico(['ui', g.icon])}${g.name}</span>`
                    : `<div class="tool-row">${ico(['ui', g.icon])}<span>${g.name} (pour descendre)</span>${btn(`<span class="cost">${costOf(g.cost)}</span>`, { act: 'buyGear', data: { k }, kind: G.hasCost(g.cost) ? 'green' : '', size: 'sm', title: 'Acheter' })}</div>`,
            )
            .join('');
    }
    return `<div class="depth-row">${tabs}</div><div class="card-sub depth-sub">${G.depthNow().desc}</div>${gear}`;
}

function resCard(kind, title, sub, icon, extra = '') {
    const locked = state.level < NATURE[kind].lvl;
    return `<div class="card nature-card${locked ? ' locked' : ''}">
        <div class="nature-head">${ico(icon)}<div class="card-main"><div class="card-title">${title}</div><div class="card-sub">${sub}</div></div>${locked ? `<span class="lock-tag">${ico(['ui', 'lock'])}Niveau ${NATURE[kind].lvl}</span>` : ''}</div>
        ${kind === 'mine' ? depthRow() : ''}<div class="res-row ${kind}">${slots(kind)}</div>${toolRow(kind)}${extra}</div>`;
}

function gaspardCard() {
    const g = G.ensureGaspard();
    if (!g) return '';
    const p = G.gaspardProgress(g),
        r = G.gaspardReward();
    return `<div class="card gaspard-card${g.done && !g.claimed ? ' on' : ''}"><div class="nature-head">${ico(['villager', 'gaspard'], 'ico big')}<div class="card-main">
        <div class="card-title">Gaspard, le bûcheron</div>
        <div class="card-sub">${g.claimed ? 'Défi réussi. À demain !' : G.gaspardText(g)}</div></div></div>
        ${
            g.claimed
                ? ''
                : `<div class="gaspard-bar"><div class="bar"><div style="width:${Math.min(100, (p / g.need) * 100)}%"></div></div><small>${p}/${g.need}</small>
        ${btn(g.done ? `${fmt(r.coins)}${ico(['ui', 'coin'])}` : 'En cours', { act: 'claimGaspard', kind: g.done ? 'green' : '', size: 'sm', disabled: !g.done })}</div>`
        }</div>`;
}

function upgradesCard() {
    if (state.level < 14) return '';
    const can = G.bldReady();
    return `<div class="card up-card${can ? ' on' : ''}"><div class="nature-head">${ico(['ui', 'granary'])}<div class="card-main"><div class="card-title">Chantier de la ferme</div>
        <div class="card-sub">Améliorez la grange, les prés, la cave, le verger, la serre, les nasses et chaque machine avec ce que vous ramassez ici.</div></div>
        ${btn(can ? 'À améliorer !' : 'Ouvrir', { act: 'openUpgrades', kind: can ? 'green' : '', size: 'sm' })}</div></div>`;
}

export function logCard() {
    if (!G.natLogOpen()) return '';
    const tiles = NAT_LOG_IDS.map(id => {
        const n = (state.nat && state.nat.log[id]) || 0,
            st = G.natLogStep(id),
            can = G.natLogCan(id),
            nxt = NAT_LOG.steps[st];
        return `<button class="log-tile${n ? '' : ' unknown'}${can ? ' ready' : ''}" data-act="claimNatLog" data-id="${id}" ${can ? '' : 'disabled'}>
            <div class="log-art">${ico(['item', id])}${st ? `<span class="medal">${ico(['ui', ['medalB', 'medalS', 'medalG'][st - 1]])}</span>` : ''}</div>
            <b>${ITEMS[id].name}</b><small>${fmt(n)}${nxt ? ` / ${nxt}` : ' · complet'}</small>${can ? `<small>${fmt(NAT_LOG.coins[state.nat.logClaimed[id] || 0])} pièces</small>` : ''}</button>`;
    }).join('');
    return `<div class="card log-card"><div class="nature-head">${ico(['item', 'ruby'])}<div class="card-main"><div class="card-title">Récoltes de la forêt et de la mine</div><div class="card-sub">Chaque palier rapporte des pièces (25, 100 et 400 ramassés).</div></div></div><div class="log-grid">${tiles}</div></div>`;
}

defineSheet('natLog', { title: 'Carnet du bûcheron et du mineur', render: () => logCard() });

function renderNature(el) {
    G.ensureNature();
    const inv = id => `<span class="mat big">${ico(['item', id])}${fmt(Math.floor(state.inventory[id] || 0))}</span>`;
    blocks(el, [
        [
            'head',
            `<div class="view-top end"><div class="mats">${inv('wood')}${inv('stone')}${state.level >= 8 ? inv('coal') : ''}${state.level >= 12 ? inv('hardwood') : ''}</div></div>`,
        ],
        [
            'hint',
            tip15(
                'Le bois et la pierre construisent et améliorent les bâtiments ; les lingots, le chêne massif et les pierres précieuses ouvrent les derniers niveaux.',
            ),
        ],
        [
            'gaspard',
            (g =>
                g &&
                foldWrap(
                    'gaspard',
                    ['villager', 'gaspard'],
                    'Gaspard, le bûcheron',
                    g.claimed ? 'Défi réussi, à demain' : `${G.gaspardProgress(g)} / ${g.need}`,
                    gaspardCard(),
                    g.done && !g.claimed,
                ))(G.ensureGaspard()),
        ],
        ['ups', upgradesCard()],
        [
            'forest',
            resCard(
                'forest',
                'Forêt',
                'Chêne : bois dur · pin : résine · bouleau : sève · châtaignier : bois dur. Les gros arbres donnent plus.',
                ['ui', 'axe'],
                kilnRow() + workerRow('lumber'),
            ),
        ],
        [
            'mine',
            resCard(
                'mine',
                'Mine',
                'Les roches cachent du minerai. Une veine qui brille donne toujours une pierre précieuse.',
                ['ui', 'pickaxe'],
                workerRow('miner'),
            ),
        ],
    ]);
}
defineView('farm/nature', renderNature);

export function setupNature() {
    actions({
        upgradeTool: (el, d) => G.upgradeTool(d.k, el),
        hit: (el, d) => G.hitSlot(d.res, +d.k, el),
        setDepth: (el, d) => G.setDepth(d.id),
        buyGear: (el, d) => G.buyGear(d.k, el),
        buildKiln: el => G.buildKiln(el),
        kilnLight: el => G.kilnLight(el),
        kilnTake: el => G.kilnTake(el),
        hireWorker: (el, d) => G.hireWorker(d.k, el),
        upgradeWorker: (el, d) => G.upgradeWorker(d.k, el),
        collectLoads: (el, d) => G.collectLoads(d.k, el),
        claimGaspard: el => G.claimGaspard(el),
        claimNatLog: (el, d) => G.claimNatLog(d.id, el),
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
