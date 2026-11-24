// Ferme | Voyages | Les Terres d'Asie (1.171) : des rizières en terrasses irriguées en cascade depuis
// un bassin de source, des rigoles en bambou, une roue à eau en rythme, le verger d'Asie,
// le pavillon de bambou (cerf sika, ver à soie, poule soie) et la jonque de la soie.
import { state } from '../../core/state.js';
import { fmt, formatDuration } from '../../core/format.js';
import { on, sfx, buzz, toast } from '../../core/bus.js';
import { ITEMS } from '../../data/items.js';
import { ASIE, PAVILION, JUNK } from '../../data/asie.js';
import { penModeBar, penBodyHtml, renderPenCritters, birthRow, assocRow } from './animals.js';
import * as G from '../../systems/index.js';
import { blocks, actions, anchorEl, esc, byId } from '../dom.js';
import { genWrap } from '../genlook.js';
import { ico, art } from '../icons.js';
import { btn, bar, hint, section, costRow, timer } from '../kit.js';
import { defineLive, ui, go, refresh } from '../app.js';
import { defineSheet, openSheet, closeSheet } from '../sheets.js';
import { burstAt } from '../fx.js';
import { longPress } from '../longpress.js';
import { askBuy } from '../sheets/askbuy.js';
import { apiaryHtml } from './apiary.js';
import { treeArt, anchorOf, spot } from './orchard.js';

defineLive('ascell', k => {
    const p = G.asiePlots()[+k];
    return p && p.id ? Math.min(1, p.prog / G.asieGrow(p.id)) : 0;
});
defineLive('asbasin', () => Math.min(1, G.asieWater() / G.asieBasinCap()));

const cropStage = p => (p.ready ? 2 : p.prog / G.asieGrow(p.id) < 0.5 ? 0 : 1);
const shortDur = sec => (sec < 90 ? `${Math.round(sec)} s` : sec < 5400 ? `${Math.round(sec / 60)} min` : `${Math.round(sec / 360) / 10} h`);
const fmtDec = n => String(Math.round(n * 10) / 10).replace('.', ',');

function closedCard() {
    const lvl = !G.asieLvlOk();
    return `<div class="card island-closed oa-closed as-closed">
        <div class="ic-art">${art('villager', 'mei')}</div>
        <div class="card-title">Les Terres d’Asie de Mei</div>
        <p class="card-sub">${
            lvl
                ? `Au niveau ${ASIE.lvl}, Mei descend des rizières en terrasses : la vanne de sa source de montagne a cédé.`
                : !G.chapterOpen(25)
                  ? `Finissez d’abord le chapitre ${G.chapterNum(G.chapterAfter(25))} (les aurores du Grand Nord) : Mei attend sur le quai.`
                  : 'Mei a besoin de vous pour ouvrir la vanne des terrasses. Apportez-lui pierres, planches, outils et bois dans le volet Village, carte « Les Terres d’Asie ».'
        }</p>
        ${lvl ? '' : btn('Voir la vanne', { act: 'goAsieMap', kind: 'gold', wide: true, icon: ['ui', 'village'] })}
    </div>`;
}

function waterCard() {
    const water = Math.round(G.asieWater()),
        cap = G.asieBasinCap();
    const inflow = G.asieSpringLph(),
        drain = G.asieDrainLph();
    const dry = G.asieDryCount(),
        canals = G.canalKeys().length;
    const left = G.wheelLeft();
    const wheel = G.wheelOpen()
        ? btn(left ? `Roue à eau (${left})` : 'Roue demain', { act: 'wheel', kind: left ? 'gold' : '', size: 'sm', icon: ['ui', 'asRoue'], disabled: !left })
        : '';
    return `<div class="card oa-water as-water${water <= 0 && !G.monsoonOn() ? ' dry' : ''}${G.hanamiOn() ? ' hanami' : ''}">
        <span class="oa-tank">${art('ui', water > 0 || G.monsoonOn() ? 'asBassin' : 'asSec')}</span>
        <div class="card-main">
            <div class="card-title">Le bassin · <span class="oa-l">${fmt(water)} / ${fmt(cap)} L</span></div>
            ${bar(0, 'oa-bar', 'asbasin')}
            <div class="oa-flow"><span class="chip ok">${ico(['ui', 'asEau'])}+${fmtDec(inflow)} L/h</span><span class="chip${drain > inflow ? ' bad' : ''}">${ico(['ui', 'asRigoleOn'])}-${fmtDec(drain)} L/h</span><span class="chip">${ico(['ui', 'asRigole'])}${canals} rigole${canals > 1 ? 's' : ''}</span>${G.monsoonOn() ? `<span class="chip ok">${ico(['ui', 'asMousson'])}Mousson : tout est irrigué, source ×2,5</span>` : ''}${G.hanamiOn() ? `<span class="chip ok">${ico(['ui', 'asHanami'])}Hanami : tout pousse ×1,5</span>` : ''}</div>
            ${dry ? `<p class="card-sub oa-dry">${dry} terrasse${dry > 1 ? 's' : ''} au sec : posez une rigole de bambou en amont ou remplissez le bassin.</p>` : !canals ? '<p class="card-sub oa-dry">La rangée du haut boit au bassin. Posez une rigole en bambou pour faire ruisseler l’eau en cascade vers le bas (+10 % par palier).</p>' : ''}
            <div class="actions wrap">${wheel}${btn('Améliorer', { act: 'open', data: { sheet: 'asieUps' }, size: 'sm', icon: ['ui', 'asRigoleOn'] })}</div>
        </div>
    </div>`;
}

function cellHtml(k, nextLocked) {
    const p = G.asiePlots()[k],
        sl = G.slotsOf('asie')[k];
    const anc = `as:${k}`;
    if (!p.open) {
        if (k !== nextLocked) return '<div class="oa-cell as-cell void"></div>';
        const cost = G.asieCellCost();
        return `<button class="oa-cell as-cell locked next${state.money >= cost ? ' can' : ''}" data-act="buyAsieCell" data-anchor="${anc}">
            <span class="lock-ico">${art('ui', 'lock')}</span><span class="price-chip">${ico(['ui', 'coin'])}${fmt(cost)}</span></button>`;
    }
    if (G.canalAt(k)) {
        const flowing = G.isIrrigated(k);
        return `<button class="oa-cell as-cell canal ${flowing ? 'flowing' : 'dry'}" data-act="open" data-sheet="canal" data-k="${k}" data-anchor="${anc}">
            <span class="oa-art">${art('ui', flowing ? 'asRigoleOn' : 'asRigole')}</span></button>`;
    }
    const irr = G.isIrrigated(k);
    const depth = G.cascadeDepth(k);
    const dry = G.isDryAsieCell(k);
    const cls = `oa-cell as-cell${irr ? ' irrigated' : ''}${depth ? ` cascade-${depth}` : ''}${dry ? ' dry' : ''}`;
    const cTag = depth ? `<span class="as-cascade-tag" title="Bonus de cascade">+${depth * 10}%</span>` : '';
    const mark = `${irr ? `<i class="oa-shade" title="Terrasse irriguée">${ico(['ui', 'asEau'])}</i>` : ''}${dry ? `<i class="oa-thirst">${ico(['ui', 'asSec'])}</i>` : ''}`;
    const t = sl.tree;
    if (p.mud)
        return `<button class="${cls} muddy" data-act="clearMud" data-k="${k}" data-anchor="${anc}"><span class="oa-art">${t ? treeArt(t) : art('plant', `${p.id}:${cropStage(p)}`)}</span><span class="as-mud"></span><small class="as-mud-txt">Drainer</small></button>`;
    if (t) {
        const stg = G.treeStage(t);
        const full = stg !== 'dead' && G.groundFull(t);
        const tag =
            stg === 'dead'
                ? `<span class="o-tag dead">${ico(['item', 'wood'])}</span>`
                : t.ground
                  ? `<span class="o-tag ready${full ? ' full' : ''}">${ico(['item', t.id])}×${t.ground}</span>`
                  : '';
        return `<button class="${cls} tree ${stg}" data-act="tree" data-z="asie" data-k="${k}" data-anchor="${anchorOf('asie', k)}">
            ${tag}${cTag}<span class="oa-art">${treeArt(t)}</span>${stg === 'dead' ? '' : bar(0, 'oa-pbar', `tree:asie-${k}`)}${mark}</button>`;
    }
    if (!p.id)
        return `<button class="${cls} empty" data-act="open" data-sheet="plantAsie" data-k="${k}" data-anchor="${anc}">
            ${cTag}<span class="o-plus">${ico(['ui', 'plus'])}</span>${p.last ? `<small>${ITEMS[p.last].name}</small>` : ''}${mark}</button>`;
    const v = p.v && state.genetics && state.genetics.vars[p.v];
    const a = art('plant', `${p.id}:${cropStage(p)}`);
    return `<button class="${cls} crop${p.ready ? ' ready' : ''}" data-act="asieCell" data-k="${k}" data-anchor="${anc}">
        ${cTag}<span class="oa-art">${v ? genWrap(a, v.g) : a}</span>${p.ready ? '' : bar(0, 'oa-pbar', `ascell:${k}`)}${mark}</button>`;
}

export function renderAsie(el) {
    G.ensureAsie();
    if (!G.asieOpen()) {
        blocks(el, [['closed', closedCard()]]);
        return;
    }
    const plots = G.asiePlots();
    const next = plots.findIndex(x => !x.open);
    const groveSlots = G.slotsOf('asieV'),
        groveNext = groveSlots.findIndex(x => !x.open);
    const pick = G.asieToPick(),
        empty = plots.filter((p, k) => p.open && !p.id && p.last && !G.slotsOf('asie')[k].tree && !G.canalAt(k)).length;
    const dead = G.deadTrees('asie');
    blocks(el, [
        ['water', waterCard()],
        [
            'top',
            `<div class="view-top"><div class="actions wrap">${btn('Récolter', { act: 'harvestAsie', kind: pick ? 'green' : '', size: 'sm', icon: ['ui', 'basket'], disabled: !pick })}${btn('Replanter', { act: 'replantAsie', size: 'sm', icon: ['ui', 'loop'], disabled: !empty })}${dead > 1 ? btn(`Débiter (${dead})`, { act: 'fellDead', data: { z: 'asie' }, size: 'sm', icon: ['item', 'wood'] }) : ''}</div></div>`,
        ],
        ['h1', section('Les rizières en terrasses', `<small class="o-count small">${plots.filter(p => p.open).length} terrasses</small>`)],
        ['grid', `<div class="oa-grid as-grid">${plots.map((p, k) => cellHtml(k, next)).join('')}</div>`],
        ['hv', section('Le verger des Terres d’Asie', `<small class="o-count small">${G.treeCountText('asieV')}</small>`)],
        ['verger', `<div class="orchard island">${groveSlots.map((sl, k) => spot(sl, k, groveNext, 'asieV')).join('')}</div>`],
        ['hvt', hint('Les arbres du verger d’Asie poussent en pleine terre sans consommer le bassin. La floraison Hanami les accélère aussi ×1,5.')],
        ['apiary', apiaryHtml('asie')],
        ['h2', section(PAVILION.name, G.asiaPavilionOpen() ? `<small class="o-count small">${G.asieBeasts().length}/${G.asiaPavilionCap()}</small>` : '')],
        ['pmode', G.asiaPavilionOpen() ? penModeBar(PAVILION.key) : ''],
        ['pasture', G.asiaPavilionOpen() ? penBodyHtml(PAVILION.key, 'bamboo') : ''],
        ['pavilion', pavilionHtml()],
        ['junk', junkHtml()],
    ]);
    renderPenCritters();
}

// ---------------- La jonque de la soie ----------------
function junkHtml() {
    if (!G.asiaPavilionOpen()) return '';
    if (!G.junkOpen())
        return `<div class="card oa-pen-closed"><span class="oa-up-art">${art('ui', 'asJonque')}</span><div class="card-main"><div class="card-title">La jonque de la soie</div><div class="card-sub">Bâtissez le quai de la jonque avec Kenji : trois cerfs sika hâleront vos cargaisons jusqu’au grand port d’Orient.</div></div></div>`;
    const c = G.junkState();
    if (c.out) {
        const back = G.junkBack();
        return `<div class="card oa-caravan"><span class="oa-up-art">${art('ui', 'asJonque')}</span><div class="card-main"><div class="card-title">La jonque ${back ? 'est de retour !' : 'navigue vers l’Orient'}</div>
            <div class="card-sub">${back ? `Elle rapporte ${fmt(c.out.value)} pièces du grand port.` : `Retour dans ${timer(c.out.back)} avec environ ${fmt(c.out.value)} pièces.`}</div>
            ${back ? btn('Accueillir la jonque', { act: 'junkClaim', kind: 'gold', icon: ['ui', 'coin'] }) : ''}</div></div>`;
    }
    const loads = G.junkLoads(),
        team = G.junkSikas().length;
    const fmtMult = m => String(Math.round(m * 100) / 100).replace('.', ',');
    return `<div class="card oa-caravan"><span class="oa-up-art">${art('ui', 'asJonque')}</span><div class="card-main"><div class="card-title">La jonque de la soie · ${loads}/${JUNK.loads} charges</div>
        <div class="card-sub">Une charge = ${JUNK.perLoad} produits. Le grand port paie ${fmtMult(G.junkMult())} fois le prix du grossiste pour les produits d’Asie, ${fmtMult(G.junkMult('wheat'))} fois pour le reste ; retour en 7 heures, parfois avec de la badiane étoilée. ${team < JUNK.sikas ? `Il faut ${JUNK.sikas} cerfs sika adultes (vous en avez ${team}).` : ''}</div>
        ${loads ? `<div class="card-sub">Valeur au port : <b>${fmt(G.junkValue())}</b> pièces</div>` : ''}
        <div class="actions wrap">${btn(loads ? 'Charger, décharger' : 'Charger', { act: 'open', data: { sheet: 'junkLoad' }, size: 'sm', icon: ['ui', 'plus'] })}${btn('Lever l’ancre', { act: 'junkSend', kind: loads && team >= JUNK.sikas ? 'green' : '', size: 'sm', icon: ['ui', 'asJonque'], disabled: !loads || team < JUNK.sikas })}</div></div></div>`;
}

defineSheet('junkLoad', {
    title: 'La cale de la jonque',
    render() {
        const c = G.junkState();
        const loaded = Object.entries(c.load || {});
        const chips = loaded
            .map(([id, n]) => `<button class="pick-chip on" data-act="junkDel" data-id="${id}">${ico(['item', id])}<span>${n * JUNK.perLoad}</span></button>`)
            .join('');
        const goods = G.junkGoods()
            .map(id => [id, G.sellPrice(id)])
            .sort((a, b) => b[1] * G.junkMult(b[0]) - a[1] * G.junkMult(a[0]))
            .slice(0, 60);
        const head = `<p class="card-sub center">${G.junkLoads()}/${JUNK.loads} charges. Touchez un produit pour en embarquer ${JUNK.perLoad}.</p>`;
        const on = loaded.length
            ? `<p class="card-sub center">Dans la cale : touchez pour décharger.</p><div class="chips-row wrap center">${chips}</div>`
            : '';
        if (!goods.length)
            return `${head}${on}${loaded.length ? '' : `<p class="empty">Il faut au moins ${JUNK.perLoad} produits d’une même sorte dans la grange.</p>`}`;
        return `${head}${on}<div class="pick-grid trees">${goods
            .map(
                ([id, p]) =>
                    `<button class="pick-cell" data-act="junkAdd" data-id="${id}"><span class="pc-art">${art('item', id)}</span><b>${ITEMS[id].name}</b><small>${fmt(Math.round(p * JUNK.perLoad * G.junkMult(id)))}${ico(['ui', 'coin'])} la charge</small><span class="pc-cost">${state.inventory[id]} en grange</span></button>`,
            )
            .join('')}</div>`;
    },
});

// ---------------- Le pavillon de bambou ----------------
function pavilionHtml() {
    if (!G.asiaPavilionOpen())
        return `<div class="card oa-pen-closed"><span class="oa-up-art">${art('ui', 'asPavillon')}</span><div class="card-main"><div class="card-sub">${
            !G.chapterOpen(26)
                ? `Finissez d’abord le chapitre ${G.chapterNum(25)} : Kenji attend que les rizières de Mei soient en eau.`
                : 'Bâtissez le pavillon de bambou avec Kenji : chapitre « La jonque de Kenji », Village, carte « Les Terres d’Asie ». Cerfs sika, vers à soie et poules soie y vivront.'
        }</div></div></div>`;
    const dryAir = G.asieWater() <= 0 && !G.monsoonOn();
    const big = state.asie.pavilionBig
        ? ''
        : `<div class="line">${ico(['ui', 'asPavillon'])}<div>Agrandir le pavillon : ${PAVILION.cap[1]} places. ${costRow(G.costParts(PAVILION.upCost))}</div>${btn('Agrandir', { act: 'pavilionUp', size: 'sm', kind: G.hasCost(PAVILION.upCost) ? 'green' : '', disabled: !G.hasCost(PAVILION.upCost) })}</div>`;
    return `<div class="card oa-pen">
        <div class="oa-flow"><span class="chip${dryAir ? ' bad' : ' ok'}">${ico(['ui', dryAir ? 'asSec' : 'asEau'])}${dryAir ? 'Bassin à sec : vers à soie deux fois moins vite' : 'Air humide : les vers à soie filent à plein régime'}</span></div>
        <div class="actions wrap">${btn('Nourrir', { act: 'feedAll', kind: 'gold', size: 'sm', icon: ['item', 'feed'] })}${btn('Ramasser', { act: 'collectAnimals', kind: 'green', size: 'sm', icon: ['ui', 'basket'] })}</div>
        ${birthRow(PAVILION.key)}${assocRow(PAVILION.key)}${big}
        <p class="card-sub">Cerfs sika et poules soie vivent au pavillon sans craindre la sécheresse. Les vers à soie aiment l’air frais du bassin rempli.</p>
    </div>`;
}

// ---------------- Planter sur une terrasse (ou poser une rigole) ----------------
defineSheet('plantAsie', {
    title: 'Aux Terres d’Asie',
    render(o) {
        const k = +o.k;
        const irr = G.isIrrigated(k),
            depth = G.cascadeDepth(k);
        const head = `<p class="card-sub center">${
            irr
                ? `${ico(['ui', 'asEau'])}Terrasse irriguée${depth ? ` en cascade (+${depth * 10} % de vitesse)` : ' directement par le bassin'}.`
                : `${ico(['ui', 'asSec'])}Cette terrasse est au sec : elle pousse au tiers de sa vitesse. Posez une rigole en bambou sur une case irriguée au-dessus.`
        }</p>`;
        const cc = ASIE.canal.cost;
        const canalCard = `<div class="card oa-up"><span class="oa-up-art">${art('ui', 'asRigoleOn')}</span><div class="card-main"><div class="card-title">Poser une rigole en bambou</div>
            <div class="card-sub">Elle capte l’eau de la terrasse et la fait ruisseler sur les côtés et en cascade vers les paliers inférieurs (+10 % par palier, max +30 %).</div>${costRow(G.costParts(cc))}
            ${btn('Poser la rigole', { act: 'buildCanal', data: { k }, kind: G.hasCost(cc) ? 'green' : '', size: 'sm', disabled: !G.hasCost(cc) })}</div></div>`;
        const vars = state.genetics
            ? G.varieties().filter(v => ITEMS[v.base].asie && ITEMS[v.base].type === 'crop' && (state.genetics.seeds[v.id] || 0) > 0)
            : [];
        const varHtml = vars.length
            ? `${section('Mes variétés')}<div class="pick-grid trees">${vars
                  .map(
                      v =>
                          `<button class="pick-cell var${ui.sel.asVar === v.id ? ' on' : ''}" data-act="plantAsieVar" data-k="${k}" data-id="${v.id}"><span class="pc-art">${genWrap(art('plant', `${v.base}:2`), v.g)}</span><b>${esc(G.varName(v))}</b><span class="pc-cost">${state.genetics.seeds[v.id]} graines</span></button>`,
                  )
                  .join('')}</div>`
            : '';
        const crops = G.asieCrops()
            .sort((a, b) => a.reqLvl - b.reqLvl)
            .map(d => {
                const open = G.asieCropOk(d),
                    stock = state.seeds[d.id] || 0;
                const t = G.asieGrow(d.id) / ((G.asieRate(d.id) || 1) * G.asieCellMult(k));
                return `<button class="pick-cell${open ? '' : ' locked'}" data-act="plantAsie" data-k="${k}" data-id="${d.id}" ${open ? '' : 'disabled'}>
                    <span class="pc-art">${art('plant', `${d.id}:2`)}</span><b>${d.name}</b>
                    ${open ? `<small>${fmt(G.sellPrice(d.id))}${ico(['ui', 'coin'])} · ${shortDur(t)}</small><span class="pc-cost">${stock > 0 ? `${stock} en stock` : `${fmt(d.cost)}${ico(['ui', 'coin'])}`}</span>` : `<small class="lock-txt">${ico(['ui', 'lock'])}Niveau ${d.reqLvl}</small>`}
                </button>`;
            })
            .join('');
        return `${head}${canalCard}${varHtml}${section('Cultures')}<div class="pick-grid trees">${crops}</div>`;
    },
});

// ---------------- Une rigole en bambou ----------------
defineSheet('canal', {
    title: 'Rigole en bambou',
    render(o) {
        const k = +o.k;
        if (!G.canalAt(k)) return '<p class="empty">Plus de rigole ici.</p>';
        const flowing = G.isIrrigated(k);
        const weir = G.asieUp('weir');
        return `<div class="card oa-up"><span class="oa-up-art">${art('ui', flowing ? 'asRigoleOn' : 'asRigole')}</span><div class="card-main">
            <div class="card-title">${flowing ? 'L’eau cascade ici' : 'Rigole à sec'}</div>
            <div class="card-sub">${
                flowing
                    ? `Cette rigole irrigue ses voisines de palier et fait descendre la cascade sur ${weir ? 'trois colonnes' : 'toute la colonne'} en dessous (+10 % de vitesse par palier descendu, jusqu’à +30 %).`
                    : 'Pour couler, cette rigole doit être sur la rangée du haut (au bassin) ou alimentée par une rigole au-dessus.'
            }</div>
            <div class="actions wrap">${btn('Retirer la rigole', { act: 'takeCanal', data: { k }, size: 'sm', icon: ['ui', 'loop'] })}</div></div></div>
            <p class="card-sub center">Retirer une rigole libère la terrasse immédiatement ; le bambou n’est pas récupéré.</p>`;
    },
});

// ---------------- Améliorer les terrasses ----------------
defineSheet('asieUps', {
    title: 'Les eaux des terrasses',
    render() {
        G.ensureAsie();
        const cards = ASIE.ups
            .map(([id, name, text, cost]) => {
                const done = G.asieUp(id);
                const ic = id === 'weir' ? 'asRigoleOn' : id === 'reservoir' ? 'asBassin' : 'asEau';
                return `<div class="card oa-up"><span class="oa-up-art">${art('ui', ic)}</span><div class="card-main"><div class="card-title">${name}</div>
                    <div class="card-sub">${text}</div>${done ? '<div class="card-sub"><b>Fait</b></div>' : `${costRow(G.costParts(cost))}${btn('Améliorer', { act: 'upAsie', data: { id }, kind: G.hasCost(cost) ? 'green' : '', size: 'sm', disabled: !G.hasCost(cost) })}`}</div></div>`;
            })
            .join('');
        return `${cards}<p class="card-sub center">La rangée du haut boit au bassin de source. Les rigoles en bambou font descendre l’eau d’une terrasse à l’autre avec +10 % de vitesse par palier (max +30 %). Une terrasse au sec pousse au tiers de sa vitesse.</p>`;
    },
});

// ---------------- La roue à eau en bambou : minijeu de rythme ----------------
let run = 0;
function openWheel() {
    if (!G.wheelOpen() || !G.wheelLeft()) return;
    const W = ASIE.wheel;
    const me = ++run;
    document.querySelector('.hg-over')?.remove();
    const o = document.createElement('div');
    o.className = 'hg-over';
    o.innerHTML = `<div class="hg-game"><div class="hg-top"><h2>La roue à eau en bambou</h2><button class="btn sm" id="whquit">Quitter</button></div>
        <div class="hg-stage as-wheel" id="whstage"><div class="oa-chad-art as-wheel-art">${art('ui', 'asRoue')}</div>
        <div class="cmb-panel"><div class="oa-chad-line"><span id="whl">0 L</span><span id="whn">Godet 1 / ${W.scoops}</span></div>
        <div class="as-meter"><i class="as-zone"></i><b class="as-mark" id="whmark"></b></div>
        <p class="cmb-help">La roue tourne en rythme. Touchez quand le trait passe au milieu : chaque godet plein remplit le bassin des terrasses.</p>
        <div class="hg-btns"><button class="btn gold" id="whgo">Lancer la roue !</button></div></div></div></div>`;
    document.body.appendChild(o);
    const q = s => o.querySelector(s);
    const close = () => {
        run++;
        o.remove();
        refresh();
    };
    q('#whquit').onclick = close;
    q('#whgo').onclick = () => {
        if (me !== run) return;
        q('.hg-btns').remove();
        play();
    };
    function play() {
        const stage = q('#whstage'),
            mark = q('#whmark');
        const scores = [];
        const t0 = performance.now();
        let pos = 0,
            done = false,
            lock = 0;
        const period = () => 1450 - scores.length * 145;
        stage.addEventListener('pointerdown', () => {
            if (done || performance.now() < lock) return;
            const sc = Math.max(0, 1 - Math.abs(pos - 0.5) * 4);
            scores.push(sc);
            lock = performance.now() + 330;
            sfx(sc > 0.7 ? 'water' : 'pop');
            buzz(sc > 0.7 ? 15 : 6);
            const tag = document.createElement('b');
            tag.className = 'oa-chad-tag' + (sc > 0.7 ? ' good' : sc > 0.3 ? '' : ' bad');
            tag.textContent = sc > 0.85 ? 'Plein !' : sc > 0.5 ? 'Bien' : sc > 0.2 ? 'Éclaboussé' : 'Raté';
            stage.appendChild(tag);
            setTimeout(() => tag.remove(), 700);
            const l = scores.reduce((a, x) => a + x * W.perScoop, 0);
            q('#whl').textContent = `${Math.round(l)} L`;
            q('#whn').textContent = `Godet ${Math.min(W.scoops, scores.length + 1)} / ${W.scoops}`;
            if (scores.length >= W.scoops) end();
        });
        const tick = () => {
            if (me !== run || done) return;
            const ph = ((performance.now() - t0) % period()) / period();
            pos = (1 - Math.cos(ph * Math.PI * 2)) / 2;
            mark.style.left = `${pos * 100}%`;
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        function end() {
            done = true;
            const got = G.wheelDraw(scores, stage);
            const box = document.createElement('div');
            box.className = 'hg-result';
            const tot = Math.round(scores.reduce((a, x) => a + x * W.perScoop, 0));
            box.innerHTML = `<h3>${tot >= 65 ? 'Quelle belle cascade !' : tot >= 35 ? 'Le bassin se remplit' : 'Quelques gouttes'}</h3>
                <p class="hg-gain">+${got} L dans le bassin</p><p>${G.wheelLeft()} séance${G.wheelLeft() > 1 ? 's' : ''} encore aujourd’hui</p><button class="btn gold" id="whdone">Terminer</button>`;
            stage.appendChild(box);
            q('#whdone').onclick = close;
        }
    }
}

export function setupAsie() {
    actions({
        goAsieMap: () => {
            ui.sel.map = 'asie';
            ui.sel.proj = ASIE.project;
            go('village/village#story');
        },
        buyAsieCell: el =>
            askBuy(
                {
                    title: 'Une terrasse de plus aux Terres d’Asie',
                    icon: ['ui', 'asAsie'],
                    text: 'Une terrasse de plus pour une culture, un arbre ou une rigole en bambou.',
                    cost: G.asieCellCost(),
                    run: at => G.buyAsieCell(at),
                },
                el,
            ),
        asieCell: (el, d) => {
            const p = G.asiePlots()[+d.k];
            if (p && p.ready) G.harvestAsie(+d.k, el);
            else if (p && p.id) {
                const m = G.asieCellMult(+d.k) * (G.hanamiOn() ? 1.5 : 1);
                const rem = formatDuration(Math.max(0, (G.asieGrow(p.id) - p.prog) / ((G.asieRate(p.id) || 1) * m)));
                const depth = G.cascadeDepth(+d.k);
                toast(
                    G.isIrrigated(+d.k)
                        ? `${ITEMS[p.id].name} : prête dans ${rem}${depth ? ` (cascade +${depth * 10} %)` : ''}`
                        : `${ITEMS[p.id].name} au sec : prête dans ${rem} (une rigole en amont l’accélèrerait)`,
                    ['item', p.id],
                );
            }
        },
        plantAsie: (el, d) => {
            if (G.plantAsie(+d.k, d.id, anchorEl(`as:${d.k}`) || el)) closeSheet('plantAsie');
        },
        plantAsieVar: (el, d) => {
            if (G.plantAsieVar(+d.k, d.id, anchorEl(`as:${d.k}`) || el)) closeSheet('plantAsie');
        },
        harvestAsie: el => G.harvestAllAsie(el),
        replantAsie: el => G.replantAsie(el),
        buildCanal: (el, d) => {
            if (G.buildCanal(+d.k, anchorEl(`as:${d.k}`) || el)) closeSheet('plantAsie');
        },
        takeCanal: (el, d) => {
            if (G.removeCanal(+d.k)) {
                toast('Rigole retirée : la terrasse est libre', ['ui', 'asRigole']);
                closeSheet('canal');
            }
        },
        upAsie: (el, d) => G.upgradeAsie(d.id, el),
        pavilionUp: el => G.upAsiePavilion(el),
        clearMud: (el, d) => G.clearMud(+d.k, el),
        junkAdd: (el, d) => G.junkAdd(d.id),
        junkDel: (el, d) => G.junkRemove(d.id),
        junkSend: el => G.junkSend(el),
        junkClaim: el => G.junkClaim(el),
        wheel: () => openWheel(),
    });
    const onLong = el => openSheet('tree', { k: +el.dataset.k, z: 'asie' });
    longPress(byId('view-farm'), '.as-cell[data-act="tree"]', onLong);
    on('asieFx', ({ k, delay }) => {
        const el = anchorEl(`as:${k}`) || anchorEl(anchorOf('asie', k)) || (k >= 40 && anchorEl(anchorOf('asieV', k - 40)));
        if (!el) return;
        setTimeout(() => {
            const r = el.getBoundingClientRect();
            burstAt(r.left + r.width / 2, r.top + r.height / 2, 'sparkle', 5);
        }, delay || 0);
    });
}
