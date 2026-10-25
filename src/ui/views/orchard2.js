// 1.12 : l'interface du verger — maturité, greffes, soins, boutures, pépinière, cueilleur, Odile.
import { state } from '../../core/state.js';
import { fmt, formatDuration } from '../../core/format.js';
import { ITEMS } from '../../data/items.js';
import { GRAFTS, GRAFT_IDS, CARE, PICKER, MATURE } from '../../data/orchard.js';
import * as G from '../../systems/index.js';
import { actions, anchorEl } from '../dom.js';
import { closeSheet } from '../sheets.js';
import { foldWrap } from '../fold.js';
import { ico } from '../icons.js';
import { btn, lines } from '../kit.js';
import { seasonLine, remLine } from './orchard3.js';

const costOf = c =>
    G.costParts(c)
        .map(x => `<span class="${x.ok ? 'ok' : 'short'}">${ico(x.icon)}${fmt(x.n)}</span>`)
        .join('');
const anchorOf = (z, k) => `${z === 'island' ? 'itree' : 'tree'}:${k}`;

// ---- la fiche d'un arbre ----
export function stars(t) {
    const n = G.matStars(t);
    return `<span class="stars" aria-label="${n} étoile${n > 1 ? 's' : ''}">${[1, 2, 3].map(i => `<i class="${i <= n ? 'on' : ''}">${ico(['ui', 'star'])}</i>`).join('')}</span>`;
}
export function treeExtras(t, k, z) {
    const st = G.treeStage(t),
        m = G.matOf(t),
        g = G.graftOf(t);
    const info = [];
    const pct = Math.round(G.maturity(t) * 100);
    info.push([
        ['ui', 'star'],
        m >= MATURE.at
            ? 'Mûr : fruits plus beaux et plus nombreux au maximum'
            : `Maturité ${pct} % (${m} / ${MATURE.at} fruits) : plus de fruits et de qualité en vieillissant`,
    ]);
    if (g) info.push([['item', g.item], `${g.name} : ${g.text}`]);
    for (const l of [seasonLine(t), remLine(t)]) if (l) info.push(l);
    if (G.isPruned(t)) info.push([['ui', 'pruners'], 'Taillé : fruits 15 % plus vite cette saison']);
    if (G.manureLeft(t)) info.push([['item', 'fertilizer'], `Fumé : 25 % plus vite pendant encore ${formatDuration(G.manureLeft(t) / 1000)}`]);
    let html = `<div class="tree-mat">${stars(t)}${lines(info)}</div>`;
    if (st === 'dead' || !G.careOpen()) return html;
    const owned = GRAFT_IDS.filter(id => G.graftStock(id) > 0 && t.g !== id);
    const btns = [];
    for (const id of owned)
        btns.push(
            btn(`Greffer · ${GRAFTS[id].name.replace('Greffon ', '')}`, { act: 'graftTree', data: { k, z, id }, size: 'sm', icon: ['item', GRAFTS[id].item] }),
        );
    if (t.g) btns.push(btn('Retirer le greffon', { act: 'ungraftTree', data: { k, z }, size: 'sm' }));
    if (G.canPrune(t)) btns.push(btn('Tailler', { act: 'pruneTree', data: { k, z }, kind: 'green', size: 'sm', icon: ['ui', 'pruners'] }));
    else if (!G.isWinter() && !G.isPruned(t)) btns.push(btn('Tailler (hiver)', { disabled: true, size: 'sm', icon: ['ui', 'pruners'] }));
    if (!G.manureLeft(t)) btns.push(btn(`Fumer <span class="cost">${costOf(CARE.manure.cost)}</span>`, { act: 'manureTree', data: { k, z }, size: 'sm' }));
    if (G.canRejuvenate(t))
        btns.push(
            btn(`Rajeunir <span class="cost">${costOf(CARE.rejuvenate.cost)}</span>`, {
                act: 'rejuvenateTree',
                data: { k, z },
                kind: G.hasCost(CARE.rejuvenate.cost) ? 'gold' : '',
                size: 'sm',
            }),
        );
    if (btns.length) html += `<div class="care-btns">${btns.join('')}</div>`;
    return html;
}

// ---- boutures dans la fenêtre de plantation ----
export function cuttingsHtml(k, z) {
    const list = state.orchard.cuttings || [];
    if (!list.length) return '';
    return `<div class="cuttings"><div class="card-sub center">Boutures : elles gardent le greffon et un tiers de la maturité</div><div class="pick-grid trees">${list
        .map((c, ci) => {
            const ok = !!ITEMS[c.id].island === (z === 'island');
            const g = c.g && GRAFTS[c.g];
            return `<button class="pick-cell${ok ? '' : ' short'}" data-act="plantCutting" data-k="${k}" data-z="${z}" data-ci="${ci}">
                <span class="pc-art">${ico(['item', 'cutting'], 'ico big')}</span><b>${ITEMS[c.id].seedName}</b>
                <small>${ico(['ui', 'star'])}${c.mat} fruits${g ? ` · ${g.name.replace('Greffon ', '')}` : ''}</small></button>`;
        })
        .join('')}</div></div>`;
}

// ---- les cartes sous le verger ----
function odileCard() {
    const g = G.ensureOdile();
    if (!g) return '';
    const p = G.odileProgress(g),
        r = G.odileReward(g);
    return `<div class="card odile-card${g.done && !g.claimed ? ' on' : ''}"><div class="nature-head">${ico(['villager', 'odile'], 'ico big')}<div class="card-main">
        <div class="card-title">Odile, l’arboricultrice</div>
        <div class="card-sub">${g.claimed ? 'Défi réussi. À demain !' : G.odileText(g)}</div></div></div>
        ${
            g.claimed
                ? ''
                : `<div class="gaspard-bar"><div class="bar"><div style="width:${Math.min(100, (p / g.need) * 100)}%"></div></div><small>${p}/${g.need}</small>
        ${btn(g.done ? `${fmt(r.coins)}${ico(['ui', 'coin'])}` : 'En cours', { act: 'claimOdile', kind: g.done ? 'green' : '', size: 'sm', disabled: !g.done })}</div>
        <small class="odile-hint">Parfois, une branche rare en cadeau${g.kind === 'choice' ? ' (plus souvent pour des fruits de choix)' : ''}.</small>`
        }</div>`;
}
function nurseryCard() {
    if (!G.nurseryOpen()) return '';
    const rows = GRAFT_IDS.filter(id => GRAFTS[id].cost)
        .map(id => {
            const gr = GRAFTS[id],
                ok = G.hasCost(gr.cost);
            return `<div class="graft-row">${ico(['item', gr.item])}<span><b>${gr.name}</b> <small>(${G.graftStock(id)}) ${gr.text}</small></span>
            ${btn(`<span class="cost">${costOf(gr.cost)}</span>`, { act: 'craftGraft', data: { id }, kind: ok ? 'green' : '', size: 'sm', title: 'Fabriquer' })}</div>`;
        })
        .join('');
    const rare = GRAFT_IDS.filter(id => GRAFTS[id].rare && G.graftStock(id) > 0)
        .map(id => `<span class="chip">${ico(['item', GRAFTS[id].item])}${GRAFTS[id].name.replace('Greffon ', '')} ×${G.graftStock(id)}</span>`)
        .join('');
    return `<div class="card nursery-card"><div class="nature-head">${ico(['ui', 'nursery'], 'ico big')}<div class="card-main"><div class="card-title">La pépinière</div>
        <div class="card-sub">Des greffons à poser sur un arbre (touchez-le longuement pour sa fiche).</div></div></div>${rows}${rare ? `<div class="graft-rare">${rare}</div>` : ''}</div>`;
}
function pickerCard() {
    if (!G.pickerOpen()) return '';
    const lvl = G.pickerLvl(),
        nxt = G.pickerNext();
    const sub = lvl
        ? `Niveau ${lvl} · il ramasse les fruits au sol toutes les ${formatDuration(G.pickerEvery() / 1000)}, même quand vous n’êtes pas là.`
        : 'Il ramasse tous les fruits tombés, même quand vous n’êtes pas là.';
    return `<div class="card picker-card"><div class="nature-head">${ico(['villager', 'picker'], 'ico big')}<div class="card-main"><div class="card-title">Le cueilleur</div><div class="card-sub">${sub}</div></div></div>
        ${nxt ? `<div class="worker-up"><span>${lvl ? `Niveau ${lvl + 1} : plus vite (${formatDuration(PICKER.every[lvl + 1] / 1000)})` : 'Embaucher le cueilleur'}</span>${btn(`<span class="cost">${costOf(nxt)}</span>`, { act: 'upgradePicker', kind: G.hasCost(nxt) ? 'green' : '', size: 'sm', title: lvl ? 'Améliorer' : 'Embaucher' })}</div>` : ''}</div>`;
}
// 1.38 : Odile, la pépinière et le cueilleur se replient sur une ligne
export function orchardCards() {
    const g = G.ensureOdile(),
        lvl = G.pickerOpen() ? G.pickerLvl() : 0,
        stock = GRAFT_IDS.reduce((a, id) => a + G.graftStock(id), 0);
    return [
        g &&
            foldWrap(
                'odile',
                ['villager', 'odile'],
                'Odile, l’arboricultrice',
                g.claimed ? 'Défi réussi, à demain' : `${G.odileProgress(g)} / ${g.need}`,
                odileCard(),
                g.done && !g.claimed,
            ),
        G.nurseryOpen() && foldWrap('nursery', ['ui', 'nursery'], 'La pépinière', `${stock} greffon${stock > 1 ? 's' : ''} en stock`, nurseryCard()),
        G.pickerOpen() && foldWrap('picker', ['villager', 'picker'], 'Le cueilleur', lvl ? `Niveau ${lvl}` : 'À embaucher', pickerCard()),
    ]
        .filter(Boolean)
        .join('');
}

export function setupOrchard2() {
    const at = (d, el) => anchorEl(anchorOf(d.z || 'farm', d.k)) || el;
    actions({
        graftTree: (el, d) => G.graftTree(+d.k, d.id, at(d, el), d.z || 'farm'),
        ungraftTree: (el, d) => G.ungraftTree(+d.k, at(d, el), d.z || 'farm'),
        pruneTree: (el, d) => G.pruneTree(+d.k, at(d, el), d.z || 'farm'),
        manureTree: (el, d) => G.manureTree(+d.k, at(d, el), d.z || 'farm'),
        rejuvenateTree: (el, d) => G.rejuvenateTree(+d.k, at(d, el), d.z || 'farm'),
        plantCutting: (el, d) => {
            if (G.plantCutting(+d.k, +d.ci, at(d, el), d.z || 'farm')) closeSheet('plantTree');
        },
        craftGraft: (el, d) => G.craftGraft(d.id, el),
        upgradePicker: el => G.upgradePicker(el),
        claimOdile: el => G.claimOdile(el),
    });
}
