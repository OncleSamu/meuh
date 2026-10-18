// 1.13 et 1.14 : l'interface du verger vivant — floraison, gelée, grande cueillette, carnet, concours du panier, fête du cidre.
import { state } from '../../core/state.js';
import { fmt } from '../../core/format.js';
import { ITEMS } from '../../data/items.js';
import { ORCHARD_LOG } from '../../data/orchard.js';
import * as G from '../../systems/index.js';
import { actions } from '../dom.js';
import { defineSheet } from '../sheets.js';
import { ico, art } from '../icons.js';
import { btn } from '../kit.js';

const SEASON_NAME = { printemps: 'printemps', ete: 'été', automne: 'automne', hiver: 'hiver' };
const bar = (n, need) =>
    `<div class="gaspard-bar"><div class="bar"><div style="width:${Math.min(100, (n / need) * 100)}%"></div></div><small>${n}/${need}</small></div>`;

// ---- dans la fiche d'un arbre ----
export function seasonLine(t) {
    const sid = G.treeSeasonOf(t.id);
    if (!sid || ITEMS[t.id].island) return null;
    return [
        ['ui', 'calendar'],
        G.seasonMult(t) > 1 ? `En pleine saison (${SEASON_NAME[sid]}) : 30 % plus vite` : `Sa saison : ${SEASON_NAME[sid]} (hors saison, 10 % plus lent)`,
    ];
}
export function remLine(t) {
    const r = G.remOf(t);
    return r ? [['ui', r.gold ? 'remGold' : 'remTwin'], `${r.name} : ${r.text}`] : null;
}

// ---- les cartes ----
function bloomCard() {
    if (!G.bloomOn()) return '';
    const hv = G.hiveCount(),
        p = Math.round(G.pollination() * 100);
    return `<div class="card bloom-card"><div class="nature-head">${ico(['ui', 'blossom'], 'ico big')}<div class="card-main"><div class="card-title">Le verger est en fleurs</div>
        <div class="card-sub">${hv ? `${hv} ruche${hv > 1 ? 's' : ''} au champ : ${p} % de chance d’un fruit en plus` : 'Posez des ruches au champ (décor) : chacune donne 12 % de chance d’un fruit en plus pendant la floraison'}.</div></div></div></div>`;
}
function frostCard() {
    if (!G.frostOpen()) return '';
    const st = G.frostStatus(),
        f = state.orchard.frost;
    if (!st)
        return f && f.done && f.s === Math.floor((state.day - 1) / 12) && f.hit !== undefined
            ? `<div class="card frost-card"><div class="card-sub">Gelée de ce printemps : ${f.hit ? `${f.hit} arbres touchés` : 'aucun dégât'}.</div></div>`
            : '';
    const lit = f && f.lit;
    return `<div class="card frost-card on"><div class="nature-head">${ico(['ui', 'orchardTorch'], 'ico big')}<div class="card-main"><div class="card-title">Gelée en vue !</div>
        <div class="card-sub">${lit ? `Torches allumées : ${Math.min(lit, G.slotsOf('farm').filter(x => x.tree).length)} arbres protégés.` : `Allumez ${G.torchNeed()} torche${G.torchNeed() > 1 ? 's' : ''} de résine avant la fin du jour (elles protègent 2 arbres chacune). Vous en avez ${G.torchStock()}. Sinon, quelques fruits seront perdus (jamais l’arbre).`}</div></div>
        ${lit ? '' : btn('Allumer', { act: 'lightTorches', kind: G.torchStock() ? 'green' : '', size: 'sm' })}</div></div>`;
}
function harvestCard() {
    if (!G.harvestOpen()) return '';
    const c = G.harvestState();
    if (!c) return '';
    const r = G.harvestReward();
    return `<div class="card harvest-card${G.harvestReady() ? ' on' : ''}"><div class="nature-head">${ico(['item', Object.keys(c.need)[0]], 'ico big')}<div class="card-main"><div class="card-title">La grande cueillette</div>
        <div class="card-sub">${c.claimed ? 'Panier livré. À l’an prochain !' : 'Remplissez le panier de la saison en ramassant vos fruits.'}</div></div></div>
        ${
            c.claimed
                ? ''
                : Object.keys(c.need)
                      .map(
                          id =>
                              `<div class="need-row">${ico(['item', id])}<b>${ITEMS[id].name}</b>${bar(Math.min(c.need[id], c.got[id] || 0), c.need[id])}</div>`,
                      )
                      .join('') +
                  `<div class="row-btns">${btn(G.harvestDone(c) ? `${fmt(r.coins)}${ico(['ui', 'coin'])} + un greffon rare` : 'En cours', { act: 'claimHarvest', kind: G.harvestDone(c) ? 'green' : '', size: 'sm', disabled: !G.harvestDone(c) })}</div>`
        }</div>`;
}
function feteCard() {
    if (!G.feteOpen()) return '';
    const f = G.feteState();
    if (!f) return '';
    const r = G.feteReward();
    return `<div class="card fete-card${G.feteReady() ? ' on' : ''}"><div class="nature-head">${ico(['item', 'cider'], 'ico big')}<div class="card-main"><div class="card-title">La fête du cidre</div>
        <div class="card-sub">${f.claimed ? 'Les bouteilles sont rentrées à la cave. À l’an prochain !' : 'Livrez des pommes et des poires au village pour la pressée : les bouteilles reviennent chez vous.'}</div></div></div>
        ${
            f.claimed
                ? ''
                : Object.keys(f.need)
                      .map(
                          id =>
                              `<div class="need-row">${ico(['item', id])}<b>${ITEMS[id].name}</b>${bar(f.given[id] || 0, f.need[id])}${btn('Livrer', { act: 'giveFete', data: { id }, size: 'sm', disabled: (f.given[id] || 0) >= f.need[id] || !state.inventory[id] })}</div>`,
                      )
                      .join('') +
                  `<div class="row-btns">${btn(G.feteDone(f) ? `${fmt(r.coins)}${ico(['ui', 'coin'])} + ${r.cider} cidres` : 'En préparation', { act: 'claimFete', kind: G.feteDone(f) ? 'green' : '', size: 'sm', disabled: !G.feteDone(f) })}</div>`
        }</div>`;
}
function vendCard() {
    if (!G.vendOpen()) return '';
    const v = G.vendState();
    if (!v) return '';
    const r = G.vendReward();
    return `<div class="card fete-card${G.vendReady() ? ' on' : ''}"><div class="nature-head">${ico(['item', 'grape'], 'ico big')}<div class="card-main"><div class="card-title">Les vendanges</div>
        <div class="card-sub">${v.claimed ? 'Le vin nouveau coule au village. À l’an prochain !' : 'Margaux prépare la fête du vin : livrez vos raisins, elle vous rend des bouteilles de vin de table.'}</div></div></div>
        ${
            v.claimed
                ? ''
                : `<div class="need-row">${ico(['item', 'grape'])}<b>${ITEMS.grape.name}</b>${bar(v.given, v.need)}${btn('Livrer', { act: 'giveVend', size: 'sm', disabled: v.given >= v.need || !state.inventory.grape })}</div>` +
                  `<div class="row-btns">${btn(G.vendDone(v) ? `${fmt(r.coins)}${ico(['ui', 'coin'])} + ${r.bottles} vins de table` : 'En cours', { act: 'claimVend', kind: G.vendDone(v) ? 'green' : '', size: 'sm', disabled: !G.vendDone(v) })}</div>`
        }</div>`;
}
function basketCard() {
    if (!G.basketOpen()) return '';
    const o = state.orchard,
        c = o.contest,
        last = o.lastContest;
    let body = '';
    if (G.basketResultReady()) {
        const pz = G.basketPrize(last.rank);
        body = `<div class="card-sub">Résultat du dernier concours (${ITEMS[last.id].name.toLowerCase()}) : ${last.rank}${last.rank === 1 ? 'ère' : 'e'} place sur 5, ${last.score} points.</div>
            <div class="row-btns">${btn(pz.coins ? `Récupérer ${fmt(pz.coins)}${ico(['ui', 'coin'])}${pz.rubans ? ` + ${pz.rubans} ruban${pz.rubans > 1 ? 's' : ''}` : ''}` : 'Récupérer', { act: 'claimBasket', kind: 'green', size: 'sm' })}</div>`;
    } else if (c) {
        const rivals = G.basketRivals(c),
            rk = G.basketRank(c);
        body = `<div class="card-sub">Ce week-end : le plus beau panier de ${ITEMS[c.id].name.toLowerCase()}. Un fruit vaut 1 point, argent 2, or 4.</div>
            <div class="basket-board"><div class="you"><b>Vous</b><span>${c.score} pts${rk ? ` · ${rk}${rk === 1 ? 'er' : 'e'}` : ''}</span></div>${rivals.map(r => `<div><b>${r.owner}</b><span>${r.w} pts</span></div>`).join('')}</div>`;
    } else
        body = `<div class="card-sub">Chaque week-end : le plus beau panier de la saison contre les fermes voisines.${G.basketResultReady() ? '' : ' Rendez-vous samedi.'}</div>`;
    return `<div class="card basket-card${G.basketResultReady() ? ' on' : ''}"><div class="nature-head">${ico(['ui', 'basket'], 'ico big')}<div class="card-main"><div class="card-title">Le concours du plus beau panier</div></div></div>${body}</div>`;
}
function logCard() {
    if (!G.logOpen()) return '';
    return `<div class="card log-card${G.logReady() ? ' on' : ''}"><div class="nature-head">${ico(['ui', 'orchardBook'], 'ico big')}<div class="card-main"><div class="card-title">Le carnet du verger</div>
        <div class="card-sub">Une page par espèce, des médailles à 100, 500 et 2 000 fruits.</div></div>${btn(G.logReady() ? 'À réclamer !' : 'Ouvrir', { act: 'open', data: { sheet: 'orchardLog' }, kind: G.logReady() ? 'green' : '', size: 'sm' })}</div></div>`;
}
export function lifeCards() {
    return bloomCard() + frostCard() + harvestCard() + feteCard() + vendCard() + basketCard() + logCard();
}

// ---- le carnet ----
const MEDALS = ['bronze', 'argent', 'or'];
defineSheet('orchardLog', {
    title: 'Le carnet du verger',
    render() {
        const ids = G.logIds();
        if (!ids.length) return '<p class="empty">Ramassez des fruits : chaque espèce aura sa page.</p>';
        const rem = state.stats.remarkable || 0;
        return `<div class="log-grid">${ids
            .map(id => {
                const l = G.logOf(id),
                    st = G.logStep(id),
                    can = G.logCan(id);
                const next = ORCHARD_LOG.steps[st];
                return `<div class="log-page${can ? ' ready' : ''}">${art('item', id)}<b>${ITEMS[id].name}</b>
                    <small>${fmt(l.n)} fruits${next ? ` / ${fmt(next)}` : ''}</small>
                    <small>Plus gros ramassage : ${l.best} · dorés : ${l.gold} · arbre le plus mûr : ${l.old}</small>
                    <span class="medals">${MEDALS.map((m, i) => `<i class="medal ${m}${i < st ? ' on' : ''}"></i>`).join('')}</span>
                    ${can ? btn(`Médaille · ${fmt(ORCHARD_LOG.coins[(state.orchard.logClaimed && state.orchard.logClaimed[id]) || 0])}${ico(['ui', 'coin'])}`, { act: 'claimLog', data: { id }, kind: 'green', size: 'sm' }) : ''}</div>`;
            })
            .join(
                '',
            )}</div>${rem ? `<p class="card-sub center">${ico(['ui', 'remGold'])} ${rem} arbre${rem > 1 ? 's' : ''} remarquable${rem > 1 ? 's' : ''} découvert${rem > 1 ? 's' : ''}</p>` : ''}`;
    },
});

export function setupOrchard3() {
    actions({
        lightTorches: el => G.lightTorches(el),
        claimHarvest: el => G.claimHarvest(el),
        giveFete: (el, d) => G.giveFete(d.id, el),
        claimFete: el => G.claimFete(el),
        giveVend: el => G.giveVend(el),
        claimVend: el => G.claimVend(el),
        claimBasket: el => G.claimBasket(el),
        claimLog: (el, d) => G.claimLog(d.id, el),
    });
}
