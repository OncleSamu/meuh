// 1.172 : Ferme | Nature | Descente souterraine — grille 5×5 sur 40 étages, lanterne, dynamite, boussole et ascenseur.
import { state } from '../../core/state.js';
import { fmt, formatDuration } from '../../core/format.js';
import { MINE_DEEP, MINE_STRATA, stratumOf, MINE_UPS } from '../../data/mine.js';
import * as G from '../../systems/index.js';
import { blocks, actions } from '../dom.js';
import { ico, art } from '../icons.js';
import { btn, bar, section, costRow, hint } from '../kit.js';
import { ui } from '../app.js';
import { defineSheet } from '../sheets.js';

function cellArt(c) {
    if (c.cleared) {
        if (c.stairs) return `<span class="mn-art">${art('ui', 'mineStairs')}</span><b class="mn-stairs-lbl">Descendre</b>`;
        return '';
    }
    if (c.kind === 'chest') return `<span class="mn-art">${art('ui', 'mineChest')}</span>`;
    if (c.kind === 'relic') return `<span class="mn-art">${art('ui', 'mineRelicRock')}</span>`;
    if (c.kind === 'geode') return `<span class="mn-art">${art('ui', 'mineGeodeRock')}</span>`;
    if (c.kind === 'vein') return `<span class="mn-art">${art('item', 'rockVein')}</span>`;
    if (c.kind === 'ore' && c.ore && c.ore !== 'stone') {
        const key = 'rock' + c.ore.replace('Ore', '').replace(/^./, x => x.toUpperCase());
        return `<span class="mn-art">${art('item', key)}</span>`;
    }
    return `<span class="mn-art">${art('ui', 'rock')}</span>`;
}

function cellHtml(c, k) {
    const cls = `mn-cell ${c.kind}${c.cleared ? ' cleared' : ''}${c.stairs && c.cleared ? ' stairs' : ''}${c.hinted && !c.cleared ? ' hinted' : ''}`;
    const hp = !c.cleared && c.hp < c.maxHp ? `<span class="mn-hp"><b style="width:${(c.hp / c.maxHp) * 100}%"></b></span>` : '';
    const hintDot = c.hinted && !c.cleared ? `<span class="mn-hint-dot">${c.stairs ? '↓' : '★'}</span>` : '';
    const act = ui.sel.mineBomb && !c.cleared ? 'mineBombAt' : 'mineDig';
    return `<button class="${cls}" data-act="${act}" data-k="${k}" data-anchor="mndig:${k}" ${c.cleared && !c.stairs ? 'disabled' : ''}>${cellArt(c)}${hp}${hintDot}</button>`;
}

export function renderMineDeep(el) {
    if (!G.mineDeepOpen()) {
        blocks(el, [
            [
                'lock',
                `<div class="card"><div class="card-head"><span class="oa-up-art">${art('ui', 'mineDeep')}</span><div class="card-main"><div class="card-title">La mine souterraine</div><p class="card-sub">La descente s’ouvre au niveau ${MINE_DEEP.lvl}, en même temps que la carrière : 40 étages à explorer, géodes, fossiles et reliques pour le Musée.</p></div></div></div>`,
            ],
        ]);
        return;
    }
    const D = G.ensureMineDeep();
    const sDef = stratumOf(D.floor);
    const energy = G.mineEnergy(),
        maxE = G.mineMaxEnergy();
    const nextMs = G.mineNextEnergyMs();
    const snackLeft = G.mineSnackLeft();
    const coal = state.inventory.coal || 0;
    const bombCost = G.mineBombCost();
    const canBomb = G.hasCost(bombCost);
    const canSonar = !D.sonarUsed && G.hasCost(MINE_DEEP.sonarCost);
    const msBadge = G.museumBadge();
    const geodeTot = G.museumGeodeTotal();
    const elevs = G.mineElevators();
    const stairFound = D.grid.some(c => c.stairs && c.cleared);

    const headCard = `<div class="card mn-head ${sDef.theme}">
        <div class="card-head">
            <span class="oa-up-art">${art('ui', 'mineDeep')}</span>
            <div class="card-main">
                <div class="card-title">Étage ${D.floor} / ${MINE_DEEP.maxFloor} · ${sDef.name}</div>
                <div class="card-sub">${sDef.desc}</div>
                <div class="oa-flow">
                    <span class="chip${energy > 0 ? ' ok' : ' bad'}">${ico(['ui', 'mineLantern'])}${energy} / ${maxE} coups${nextMs ? ` (+1 dans ${formatDuration(nextMs / 1000)})` : ''}</span>
                    <span class="chip">${ico(['item', 'coal'])}${fmt(coal)} charbon</span>
                    ${geodeTot ? `<span class="chip ok">${ico(['ui', sDef.geode])}${geodeTot} géode${geodeTot > 1 ? 's' : ''}</span>` : ''}
                </div>
                ${bar(energy / maxE, 'thin')}
                <div class="actions wrap ap-acts">
                    ${btn(snackLeft ? `Recharger (${MINE_DEEP.snackCoal} charb. · ${snackLeft})` : 'Recharge demain', { act: 'mineSnack', kind: snackLeft && energy < maxE && coal >= MINE_DEEP.snackCoal ? 'gold' : '', size: 'sm', icon: ['ui', 'mineLantern'], disabled: !snackLeft || energy >= maxE || coal < MINE_DEEP.snackCoal })}
                    ${btn('Améliorer', { act: 'open', data: { sheet: 'mineUps' }, size: 'sm', icon: ['ui', 'pickaxe'] })}
                    ${btn(msBadge ? `Musée (${msBadge})` : 'Musée', { act: 'open', data: { sheet: 'museum' }, kind: msBadge ? 'green' : '', size: 'sm', icon: ['ui', 'museum'] })}
                </div>
            </div>
        </div>
    </div>`;

    const toolsBar = `<div class="mn-tools">
        ${btn(ui.sel.mineBomb ? 'Dynamite ACTIVE (toucher un rocher)' : `Dynamite (${bombCost.coal} charb. · ${fmt(bombCost.coins)} p.)`, { act: 'mineToggleBomb', kind: ui.sel.mineBomb ? 'red' : canBomb ? 'gold' : '', size: 'sm', icon: ['ui', 'mineBomb'], disabled: !ui.sel.mineBomb && !canBomb })}
        ${btn(D.sonarUsed ? 'Boussole activée' : `Boussole (${MINE_DEEP.sonarCost.coal} charb. · ${fmt(MINE_DEEP.sonarCost.coins)} p.)`, { act: 'mineSonar', kind: canSonar ? 'green' : '', size: 'sm', icon: ['ui', 'mineSonar'], disabled: !canSonar })}
        ${stairFound ? btn(`Descendre → Ét. ${Math.min(MINE_DEEP.maxFloor, D.floor + 1)}`, { act: 'mineStairs', kind: 'gold', size: 'sm', icon: ['ui', 'mineStairs'] }) : ''}
    </div>`;

    const elevHtml = `<div class="card"><div class="card-title">Ascenseur de la mine <small class="o-count small">Record : étage ${D.maxFloor}</small></div>
        <div class="mn-elev">${elevs
            .map(
                f =>
                    `<button class="pick-chip${D.floor === f ? ' on' : ''}" data-act="mineGoFloor" data-f="${f}"><span>Ét. ${f}</span></button>`,
            )
            .join('')}</div>
        <p class="card-sub">Chaque palier de 5 étages atteint reste ouvert définitivement, avec un coffre au trésor à chaque palier !</p></div>`;

    const strataInfo = `<div class="card"><div class="card-title">Les 4 strates souterraines</div>${MINE_STRATA.map(st => {
        const open = G.mineStratumOpen(st);
        return `<div class="ms-bonus-row"><span>${ico(['ui', st.geode])} <b>${st.name}</b> <small>(Ét. ${st.from}–${st.to})</small></span><span class="chip${open ? ' ok' : ''}">${open ? 'Ouvert' : G.mineStratumLockText(st)}</span></div>`;
    }).join('')}</div>`;

    blocks(el, [
        ['head', headCard],
        ['tools', toolsBar],
        ['hgrid', section(`Sous-sol · Étage ${D.floor}`, `<small class="o-count small">${D.grid.filter(c => c.cleared).length} / ${MINE_DEEP.cells} dégagées</small>`)],
        ['grid', `<div class="mn-grid ${sDef.theme}${ui.sel.mineBomb ? ' bomb-mode' : ''}">${D.grid.map((c, k) => cellHtml(c, k)).join('')}</div>`],
        ['hint', hint('Creusez pour trouver l’escalier caché vers l’étage suivant, les géodes et les fossiles du Musée. Votre niveau de pioche accélère aussi la fouille !')],
        ['elev', elevHtml],
        ['strata', strataInfo],
    ]);
}

defineSheet('mineUps', {
    title: 'Équipement souterrain',
    render() {
        G.ensureMineDeep();
        return (
            MINE_UPS.map(u => {
                const done = G.mineUp(u.id);
                const lvlOk = state.level >= u.lvl;
                const can = lvlOk && !done && G.hasCost(u.cost);
                return `<div class="card oa-up"><span class="oa-up-art">${art('ui', u.icon)}</span><div class="card-main">
                    <div class="card-title">${u.name}</div>
                    <div class="card-sub">${u.desc}</div>
                    ${done ? '<div class="card-sub"><b>Installé</b></div>' : !lvlOk ? `<div class="card-sub">${ico(['ui', 'lock'])}Niveau ${u.lvl}</div>` : `${costRow(G.costParts(u.cost))}${btn('Installer', { act: 'mineBuyUp', data: { id: u.id }, kind: can ? 'green' : '', size: 'sm', disabled: !can })}`}
                </div></div>`;
            }).join('') +
            '<p class="card-sub center">Ces équipements souterrains sont conservés après un prestige.</p>'
        );
    },
});

export function setupMine() {
    actions({
        mineDig: (el, d) => {
            ui.sel.mineBomb = false;
            G.mineDig(+d.k, el);
        },
        mineToggleBomb: () => {
            ui.sel.mineBomb = !ui.sel.mineBomb;
        },
        mineBombAt: (el, d) => {
            if (G.mineBomb(+d.k, el)) ui.sel.mineBomb = false;
        },
        mineSonar: el => G.mineSonar(el),
        mineStairs: el => {
            ui.sel.mineBomb = false;
            G.mineUseStairs(el);
        },
        mineGoFloor: (el, d) => {
            ui.sel.mineBomb = false;
            G.mineGoFloor(+d.f, el);
        },
        mineSnack: el => G.mineSnack(el),
        mineBuyUp: (el, d) => G.mineBuyUpgrade(d.id, el),
    });
}
