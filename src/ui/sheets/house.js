// La maison de la ferme : agrandissements, Théo le commis et la personnalisation.
import { state } from '../../core/state.js';
import { fmt } from '../../core/format.js';
import { HOUSE, FARMHAND } from '../../data/progress.js';
import { STYLES, STYLE_LVL, STYLE_CHARM } from '../../data/farm.js';
import * as G from '../../systems/index.js';
import { actions } from '../dom.js';
import { ico, art, SPR } from '../icons.js';
import { btn, costRow, section } from '../kit.js';
import { defineSheet } from '../sheets.js';
import { updateScene } from '../scene.js';

const houseArt = l => (G.roofColor() ? SPR.farmhouse(l, G.roofColor()) : art('house', l));

function styles() {
    if (state.level < STYLE_LVL)
        return `<div class="card locked"><div class="card-sub">Au niveau ${STYLE_LVL}, personnalisez la clôture, les allées, le toit et la grange. Chaque style acheté compte pour le charme au concours.</div></div>`;
    return `<p class="card-sub">Chaque style acheté rapporte ${STYLE_CHARM} points de charme au concours, pour toujours. Changez à volonté entre les styles déjà achetés.</p>
        ${Object.entries(STYLES)
            .map(
                ([k, g]) =>
                    `<div class="style-group"><div class="card-title">${g.name}</div><div class="chips-row wrap">${g.list
                        .map(([v, name], idx) => {
                            const own = G.styleOwned(k, v),
                                on = G.styleOf(k) === v;
                            const sw =
                                k === 'roof' || k === 'barn'
                                    ? `<i class="sw" style="background:${v === 'auto' ? 'linear-gradient(135deg,#c8453a,#3f6fb5)' : v}"></i>`
                                    : `<i class="sw sw-${k}-${v}"></i>`;
                            return `<button class="style-chip${on ? ' on' : ''}" data-act="style" data-k="${k}" data-v="${v}">${sw}<span>${name}</span>${own ? '' : `<small>${fmt(G.styleCost(idx))}${ico(['ui', 'coin'])}</small>`}</button>`;
                        })
                        .join('')}</div></div>`,
            )
            .join('')}`;
}

function hand() {
    const hl = G.handLvl(),
        hn = G.handNext();
    if (!hl)
        return `<div class="card hand-card locked"><div class="avatar sm">${art('ui', 'lock')}</div><div class="card-main"><div class="card-title">Commis de ferme</div><div class="card-sub">Réparez le pont du hameau (chapitre 5) : Théo viendra vous aider au champ.</div></div></div>`;
    return `<div class="card hand-card"><div class="card-head"><div class="avatar sm">${art('villager', 'theo')}</div><div class="card-main"><div class="card-title">Théo, commis de ferme · niveau ${hl}</div>
        <div class="card-sub">Toutes les ${FARMHAND[hl].every} secondes, il récolte, replante et arrose les ${FARMHAND[hl].plots} premières parcelles du champ (encadrées). Il replante la dernière culture que vous y avez mise, avec vos graines ou en les achetant.</div></div></div>
        ${
            hn
                ? `<div class="card-sub">Niveau ${hl + 1} : ${hn.plots} parcelles, toutes les ${hn.every} secondes.</div>${costRow(G.costParts(hn.cost))}
            ${state.level < hn.lvl ? btn(`Niveau ${hn.lvl}`, { wide: true, disabled: true, icon: ['ui', 'lock'] }) : btn('Former Théo', { act: 'upgradeHand', kind: G.hasCost(hn.cost) ? 'green' : '', wide: true, disabled: !G.hasCost(hn.cost) })}`
                : '<div class="card-sub">Théo est au sommet de son art.</div>'
        }</div>`;
}

defineSheet('house', {
    title: 'Maison de la ferme',
    render() {
        const l = G.houseLvl(),
            n = G.houseNext();
        const levels = HOUSE.slice(1)
            .map(
                (h, k) =>
                    `<div class="hlvl${k + 1 <= l ? ' on' : ''}"><b>${k + 1}</b><span>${h.bonus}</span>${k + 1 <= l ? ico(['ui', 'check']) : `<small>niv. ${h.lvl}</small>`}</div>`,
            )
            .join('');
        const up = n
            ? `<div class="card house-up"><div class="card-title">Prochaine étape : ${n.name}</div><div class="card-sub">${n.bonus}.</div>${costRow(G.costParts(n.cost))}
                ${state.level < n.lvl ? btn(`Niveau ${n.lvl}`, { wide: true, disabled: true, icon: ['ui', 'lock'] }) : btn('Agrandir la maison', { act: 'upgradeHouse', kind: G.hasCost(n.cost) ? 'gold' : '', wide: true, disabled: !G.hasCost(n.cost) })}</div>`
            : '<p class="card-sub center">Votre maison est au plus haut niveau. Bravo !</p>';
        return [
            ['art', `<div class="house-art">${houseArt(l)}</div><div class="card-title center">${HOUSE[l].name}</div>`],
            ['levels', `<div class="hlevels">${levels}</div>${up}`],
            ['hand', section('Le commis') + hand()],
            ['styles', section('Personnaliser la ferme') + styles()],
        ];
    },
});

export function setupHouse() {
    actions({
        upgradeHouse: el => G.upgradeHouse(el),
        upgradeHand: el => G.upgradeHand(el),
        style: (el, d) => {
            G.pickStyle(d.k, d.v, el);
            updateScene();
        },
    });
}
