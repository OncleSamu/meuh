// Ferme | Voyages | Le Grand Nord (1.51) : une grille de cases (cultures et arbres), des poêles qui les réchauffent,
// du bois à fendre. Hors d'un poêle, une plante pousse au ralenti, et pas du tout la nuit de gel.
import { state } from '../../core/state.js';
import { fmt, formatDuration } from '../../core/format.js';
import { on, sfx, buzz, toast } from '../../core/bus.js';
import { ITEMS } from '../../data/items.js';
import { NORD, BARN, SLED } from '../../data/nord.js';
import { stableTile, birthRow, assocRow } from './animals.js';
import * as G from '../../systems/index.js';
import { blocks, actions, anchorEl, esc, byId } from '../dom.js';
import { genWrap } from '../genlook.js';
import { ico, art } from '../icons.js';
import { btn, bar, section, costRow, timer } from '../kit.js';
import { defineLive, ui, go, refresh } from '../app.js';
import { defineSheet, openSheet, closeSheet } from '../sheets.js';
import { burstAt } from '../fx.js';
import { longPress } from '../longpress.js';
import { askBuy } from '../sheets/askbuy.js';
import { treeArt, anchorOf } from './orchard.js';
import { cuttingsHtml } from './orchard2.js';

defineLive('nocell', k => {
    const p = G.nordPlots()[+k];
    return p && p.id ? Math.min(1, p.prog / G.nordGrow(p.id)) : 0;
});
defineLive('nofuel', k => (G.stoveAt(+k) ? Math.min(1, G.stoveAt(+k).fuel / G.stoveCap()) : 0));

const cropStage = p => (p.ready ? 2 : p.prog / G.nordGrow(p.id) < 0.5 ? 0 : 1);
const hours = n => `${String(Math.round(n * 10) / 10).replace('.', ',')} h`;
const shortDur = sec => (sec < 90 ? `${Math.round(sec)} s` : sec < 5400 ? `${Math.round(sec / 60)} min` : `${Math.round(sec / 360) / 10} h`);

function closedCard() {
    const lvl = !G.nordLvlOk();
    return `<div class="card island-closed oa-closed no-closed">
        <div class="ic-art">${art('villager', 'tuomas')}</div>
        <div class="card-title">Le Grand Nord de Tuomas</div>
        <p class="card-sub">${
            lvl
                ? `Au niveau ${NORD.lvl}, un éleveur de rennes arrive en traîneau : son village du Grand Nord n’a plus de bois pour l’hiver.`
                : !G.chapterOpen(23)
                  ? `Finissez d’abord le chapitre ${G.chapterNum(G.chapterAfter(23))} (le souk de l’oasis) : Tuomas attend sur le quai.`
                  : 'Tuomas a besoin de vous pour rallumer le premier poêle. Apportez-lui pierres, planches, outils et bois dans le volet Village, carte « Le Grand Nord ».'
        }</p>
        ${lvl ? '' : btn('Voir le poêle', { act: 'goNordMap', kind: 'gold', wide: true, icon: ['ui', 'village'] })}
    </div>`;
}

function heatCard() {
    const stoves = G.stoveKeys().length,
        chilly = G.nordChilly();
    const wood = state.inventory.wood || 0;
    const left = G.chopLeft();
    const frost = G.isFrost();
    const chop = G.chopOpen()
        ? btn(left ? `Fendre (${left})` : 'Fendre demain', { act: 'chop', kind: left ? 'gold' : '', size: 'sm', icon: ['ui', 'noFendre'], disabled: !left })
        : '';
    const feed = btn('Nourrir', {
        act: 'feedStoves',
        kind: stoves && wood && G.nordFuel() < stoves * G.stoveCap() ? 'green' : '',
        size: 'sm',
        icon: ['item', 'wood'],
        disabled: !stoves,
    });
    return `<div class="card oa-water no-heat${chilly ? ' cold' : ''}">
        <span class="oa-tank">${art('ui', G.nordFuel() > 0 ? 'noPoeleOn' : 'noPoele')}</span>
        <div class="card-main">
            <div class="card-title">Les poêles · <span class="oa-l">${hours(G.nordFuel())}</span> de feu</div>
            <div class="oa-flow"><span class="chip">${ico(['ui', 'noPoele'])}${stoves} poêle${stoves > 1 ? 's' : ''}</span><span class="chip${wood < 10 ? ' bad' : ' ok'}">${ico(['item', 'wood'])}${fmt(wood)} bûches</span>${G.auroraOn() ? `<span class="chip ok">${ico(['ui', 'noAurore'])}Aurore boréale : tout pousse × 1,5</span>` : frost ? `<span class="chip bad">${ico(['ui', 'noFroid'])}Nuit de gel : hors poêle, tout dort</span>` : ''}${G.blizzardOn() ? `<span class="chip bad">${ico(['ui', 'noBlizzard'])}Blizzard : les poêles brûlent deux fois plus</span>` : ''}</div>
            ${!stoves ? '<p class="card-sub oa-dry">Posez un poêle sur une case libre : il réchauffe les cases autour de lui.</p>' : chilly ? `<p class="card-sub oa-dry">${chilly} case${chilly > 1 ? 's' : ''} hors de portée d’un poêle allumé : ça pousse au ralenti.</p>` : ''}
            <div class="actions wrap">${feed}${chop}${btn('Améliorer', { act: 'open', data: { sheet: 'nordUps' }, size: 'sm', icon: ['ui', 'noPoeleOn'] })}</div>
        </div>
    </div>`;
}

function cellHtml(k, nextLocked) {
    const p = G.nordPlots()[k],
        sl = G.slotsOf('nord')[k];
    const anc = `no:${k}`;
    if (!p.open) {
        if (k !== nextLocked) return '<div class="oa-cell no-cell void"></div>';
        const cost = G.nordCellCost();
        return `<button class="oa-cell no-cell locked next${state.money >= cost ? ' can' : ''}" data-act="buyNordCell" data-anchor="${anc}">
            <span class="lock-ico">${art('ui', 'lock')}</span><span class="price-chip">${ico(['ui', 'coin'])}${fmt(cost)}</span></button>`;
    }
    const st = G.stoveAt(k);
    if (st) {
        const lit = G.stoveLit(k);
        return `<button class="oa-cell no-cell stove ${lit ? 'lit' : 'out'}" data-act="open" data-sheet="stove" data-k="${k}" data-anchor="${anc}">
            <span class="oa-art">${art('ui', lit ? 'noPoeleOn' : 'noPoele')}</span>${bar(0, 'oa-pbar', `nofuel:${k}`)}</button>`;
    }
    const warm = G.isWarm(k);
    const chilly = G.isChilly(k);
    const cls = `oa-cell no-cell${warm ? ' warm' : ''}${chilly ? ' chilly' : ''}`;
    const mark = `${warm ? `<i class="oa-shade" title="Au chaud">${ico(['ui', 'noChaleur'])}</i>` : ''}${chilly ? `<i class="oa-thirst no-flake">${ico(['ui', 'noFroid'])}</i>` : ''}`;
    const t = sl.tree;
    if (p.snow)
        return `<button class="${cls} snowed" data-act="clearSnow" data-k="${k}" data-anchor="${anc}"><span class="oa-art">${t ? treeArt(t) : art('plant', `${p.id}:${cropStage(p)}`)}</span><span class="no-drift"></span><small class="no-drift-txt">Dégager</small></button>`;
    if (t) {
        const stg = G.treeStage(t);
        const full = stg !== 'dead' && G.groundFull(t);
        const tag =
            stg === 'dead'
                ? `<span class="o-tag dead">${ico(['item', 'wood'])}</span>`
                : t.ground
                  ? `<span class="o-tag ready${full ? ' full' : ''}">${ico(['item', t.id])}×${t.ground}</span>`
                  : '';
        return `<button class="${cls} tree ${stg}" data-act="tree" data-z="nord" data-k="${k}" data-anchor="${anchorOf('nord', k)}">
            ${tag}<span class="oa-art">${treeArt(t)}</span>${stg === 'dead' ? '' : bar(0, 'oa-pbar', `tree:nord-${k}`)}${mark}</button>`;
    }
    if (!p.id)
        return `<button class="${cls} empty" data-act="open" data-sheet="plantNord" data-k="${k}" data-anchor="${anc}">
            <span class="o-plus">${ico(['ui', 'plus'])}</span>${p.last ? `<small>${ITEMS[p.last].name}</small>` : ''}${mark}</button>`;
    const v = p.v && state.genetics && state.genetics.vars[p.v];
    const a = art('plant', `${p.id}:${cropStage(p)}`);
    return `<button class="${cls} crop${p.ready ? ' ready' : ''}" data-act="nordCell" data-k="${k}" data-anchor="${anc}">
        <span class="oa-art">${v ? genWrap(a, v.g) : a}</span>${p.ready ? '' : bar(0, 'oa-pbar', `nocell:${k}`)}${mark}</button>`;
}

export function renderNord(el) {
    G.ensureNord();
    if (!G.nordOpen()) {
        blocks(el, [['closed', closedCard()]]);
        return;
    }
    const plots = G.nordPlots();
    const next = plots.findIndex(x => !x.open);
    const pick = G.nordToPick(),
        empty = plots.filter((p, k) => p.open && !p.id && p.last && !G.slotsOf('nord')[k].tree && !G.stoveAt(k)).length;
    const dead = G.deadTrees('nord');
    blocks(el, [
        ['heat', heatCard()],
        [
            'top',
            `<div class="view-top"><div class="actions wrap">${btn('Récolter', { act: 'harvestNord', kind: pick ? 'green' : '', size: 'sm', icon: ['ui', 'basket'], disabled: !pick })}${btn('Replanter', { act: 'replantNord', size: 'sm', icon: ['ui', 'loop'], disabled: !empty })}${dead > 1 ? btn(`Débiter (${dead})`, { act: 'fellDead', data: { z: 'nord' }, size: 'sm', icon: ['item', 'wood'] }) : ''}</div></div>`,
        ],
        ['h1', section('Le champ de neige', `<small class="o-count small">${plots.filter(p => p.open).length} cases</small>`)],
        ['grid', `<div class="oa-grid no-grid">${plots.map((p, k) => cellHtml(k, next)).join('')}</div>`],
        ['h2', section(BARN.name, G.nordBarnOpen() ? `<small class="o-count small">${G.nordBeasts().length}/${G.nordBarnCap()}</small>` : '')],
        ['barn', barnHtml()],
        ['sled', sledHtml()],
    ]);
}

// ---------------- 1.52.1 : le traîneau ----------------
function sledHtml() {
    if (!G.nordBarnOpen()) return '';
    if (!G.sledOpen())
        return `<div class="card oa-pen-closed"><span class="oa-up-art">${art('ui', 'noTraineau')}</span><div class="card-main"><div class="card-title">Le traîneau</div><div class="card-sub">Ouvrez le relais des traîneaux avec Tuomas : quatre rennes porteront vos produits jusqu’à la grande ville du Sud.</div></div></div>`;
    const c = G.sledState();
    if (c.out) {
        const back = G.sledBack();
        return `<div class="card oa-caravan"><span class="oa-up-art">${art('ui', 'noTraineau')}</span><div class="card-main"><div class="card-title">Le traîneau ${back ? 'est rentré !' : 'est en route'}</div>
            <div class="card-sub">${back ? `Il rapporte ${fmt(c.out.value)} pièces de la grande ville.` : `Retour dans ${timer(c.out.back)} avec environ ${fmt(c.out.value)} pièces.`}</div>
            ${back ? btn('Accueillir le traîneau', { act: 'sledClaim', kind: 'gold', icon: ['ui', 'coin'] }) : ''}</div></div>`;
    }
    const loads = G.sledLoads(),
        team = G.sledReindeer().length;
    const fmtMult = m => String(Math.round(m * 100) / 100).replace('.', ',');
    const chips = Object.entries(c.load)
        .map(([id, n]) => `<button class="pick-chip on" data-act="sledDel" data-id="${id}">${ico(['item', id])}<span>${n * SLED.perLoad}</span></button>`)
        .join('');
    return `<div class="card oa-caravan"><span class="oa-up-art">${art('ui', 'noTraineau')}</span><div class="card-main"><div class="card-title">Le traîneau · ${loads}/${SLED.loads} charges</div>
        <div class="card-sub">Une charge = ${SLED.perLoad} produits. La ville paie ${fmtMult(G.sledMult())} fois le prix du grossiste pour les produits du Nord, ${fmtMult(G.sledMult('wheat'))} fois pour le reste ; retour en 8 heures. ${team < SLED.reindeer ? `Il faut ${SLED.reindeer} rennes adultes (vous en avez ${team}).` : ''}</div>
        ${chips ? `<div class="chips-row">${chips}</div>` : ''}
        ${loads ? `<div class="card-sub">Valeur en ville : <b>${fmt(G.sledValue())}</b> pièces</div>` : ''}
        <div class="actions wrap">${btn('Charger', { act: 'open', data: { sheet: 'sledLoad' }, size: 'sm', icon: ['ui', 'plus'], disabled: loads >= SLED.loads })}${btn('Partir', { act: 'sledSend', kind: loads && team >= SLED.reindeer ? 'green' : '', size: 'sm', icon: ['ui', 'noTraineau'], disabled: !loads || team < SLED.reindeer })}</div></div></div>`;
}
defineSheet('sledLoad', {
    title: 'Charger le traîneau',
    render() {
        const goods = G.sledGoods()
            .map(id => [id, G.sellPrice(id)])
            .sort((a, b) => b[1] * G.sledMult(b[0]) - a[1] * G.sledMult(a[0]))
            .slice(0, 60);
        if (!goods.length) return `<p class="empty">Il faut au moins ${SLED.perLoad} produits d’une même sorte dans la grange.</p>`;
        return `<p class="card-sub center">${G.sledLoads()}/${SLED.loads} charges. Touchez un produit pour en charger ${SLED.perLoad}.</p><div class="pick-grid trees">${goods
            .map(
                ([id, p]) =>
                    `<button class="pick-cell" data-act="sledAdd" data-id="${id}"><span class="pc-art">${art('item', id)}</span><b>${ITEMS[id].name}</b><small>${fmt(Math.round(p * SLED.perLoad * G.sledMult(id)))}${ico(['ui', 'coin'])} la charge</small><span class="pc-cost">${state.inventory[id]} en grange</span></button>`,
            )
            .join('')}</div>`;
    },
});

// ---------------- 1.52 : l'étable de rondins ----------------
function barnHtml() {
    if (!G.nordBarnOpen())
        return `<div class="card oa-pen-closed"><span class="oa-up-art">${art('ui', 'noPoeleOn')}</span><div class="card-main"><div class="card-sub">${
            !G.chapterOpen(24)
                ? `Finissez d’abord le chapitre ${G.chapterNum(23)} : Ingrid, la boulangère du village, attend le poêle de Tuomas.`
                : 'Bâtissez l’étable avec Ingrid : chapitre « Les aurores d’Ingrid », Village, carte « Le Grand Nord ». Rennes, bœufs musqués et lagopèdes y vivront.'
        }</div></div></div>`;
    const list = G.nordBeasts();
    const mf = G.maxFood();
    const idx = list.map(a => state.animals.indexOf(a));
    const frost = G.isFrost();
    const tiles = idx.length
        ? `<div class="stable oa-stable">${idx
              .sort((x, y) => (state.animals[x].type < state.animals[y].type ? -1 : state.animals[x].type > state.animals[y].type ? 1 : x - y))
              .map(i => stableTile(state.animals[i], i, mf))
              .join('')}</div>`
        : `<p class="empty">L’étable est vide. Rennes, bœufs musqués et lagopèdes vous attendent au marché.</p>`;
    const big = state.nord.barnBig
        ? ''
        : `<div class="line">${ico(['ui', 'noPoeleOn'])}<div>Agrandir l’étable : ${BARN.cap[1]} places. ${costRow(G.costParts(BARN.upCost))}</div>${btn('Agrandir', { act: 'barnUp', size: 'sm', kind: G.hasCost(BARN.upCost) ? 'green' : '', disabled: !G.hasCost(BARN.upCost) })}</div>`;
    return `<div class="card oa-pen">
        <div class="oa-flow"><span class="chip ok">${ico(['ui', 'noChaleur'])}${G.nordShelterSlots()} à l’abri</span>${frost ? `<span class="chip bad">${ico(['ui', 'noFroid'])}Nuit de gel : moitié moins vite hors d’un poêle</span>` : ''}</div>
        <div class="actions wrap">${btn('Nourrir', { act: 'feedAll', kind: 'gold', size: 'sm', icon: ['item', 'feed'] })}${btn('Ramasser', { act: 'collectAnimals', kind: 'green', size: 'sm', icon: ['ui', 'basket'] })}${btn('Acheter', { act: 'go', data: { path: 'market/shop#animals' }, size: 'sm', icon: ['ui', 'coin'] })}</div>
        ${birthRow(BARN.key)}${assocRow(BARN.key)}${tiles}${big}
        <p class="card-sub">Chaque poêle allumé abrite ${BARN.shelterPerStove} bêtes la nuit de gel (il brûle alors une bûche par heure). Le bœuf musqué ne craint pas le froid.</p>
    </div>`;
}

// ---------------- planter sur une case (ou y poser un poêle) ----------------
defineSheet('plantNord', {
    title: 'Au Grand Nord',
    render(o) {
        const k = +o.k;
        const warm = G.isWarm(k);
        const head = `<p class="card-sub center">${warm ? `${ico(['ui', 'noChaleur'])}Cette case est au chaud : un poêle allumé la réchauffe.` : `${ico(['ui', 'noFroid'])}Cette case est hors de portée d’un poêle allumé : elle pousse au ralenti le jour, et dort la nuit de gel. Un poêle voisin la réchaufferait.`}</p>`;
        const sc = NORD.stove.cost;
        const stoveCard = `<div class="card oa-up"><span class="oa-up-art">${art('ui', 'noPoeleOn')}</span><div class="card-main"><div class="card-title">Poser un poêle ici</div>
            <div class="card-sub">Il réchauffe les cases autour de lui, et brûle une bûche par heure (seulement s’il y a de quoi réchauffer).</div>${costRow(G.costParts(sc))}
            ${btn('Poser le poêle', { act: 'buildStove', data: { k }, kind: G.hasCost(sc) ? 'green' : '', size: 'sm', disabled: !G.hasCost(sc) })}</div></div>`;
        const vars = state.genetics
            ? G.varieties().filter(v => ITEMS[v.base].nord && ITEMS[v.base].type === 'crop' && (state.genetics.seeds[v.id] || 0) > 0)
            : [];
        const varHtml = vars.length
            ? `${section('Mes variétés')}<div class="pick-grid trees">${vars
                  .map(
                      v =>
                          `<button class="pick-cell var${ui.sel.nrVar === v.id ? ' on' : ''}" data-act="plantNordVar" data-k="${k}" data-id="${v.id}"><span class="pc-art">${genWrap(art('plant', `${v.base}:2`), v.g)}</span><b>${esc(G.varName(v))}</b><span class="pc-cost">${state.genetics.seeds[v.id]} graines</span></button>`,
                  )
                  .join('')}</div>`
            : '';
        const crops = G.nordCrops()
            .sort((a, b) => a.reqLvl - b.reqLvl)
            .map(d => {
                const open = G.nordCropOk(d),
                    stock = state.seeds[d.id] || 0;
                const t = G.nordGrow(d.id) / (G.nordRate(d.id) || 1);
                return `<button class="pick-cell${open ? '' : ' locked'}" data-act="plantNord" data-k="${k}" data-id="${d.id}" ${open ? '' : 'disabled'}>
                    <span class="pc-art">${art('plant', `${d.id}:2`)}</span><b>${d.name}</b>
                    ${open ? `<small>${fmt(G.sellPrice(d.id))}${ico(['ui', 'coin'])} · ${shortDur(t)}</small><span class="pc-cost">${stock > 0 ? `${stock} en stock` : `${fmt(d.cost)}${ico(['ui', 'coin'])}`}</span>` : `<small class="lock-txt">${ico(['ui', 'lock'])}Niveau ${d.reqLvl}</small>`}
                </button>`;
            })
            .join('');
        const trees = G.treeList('nord')
            .sort((a, b) => a.reqLvl - b.reqLvl)
            .map(d => {
                const open = G.treeUnlocked(d),
                    stock = state.seeds[d.id] || 0;
                return `<button class="pick-cell${open ? '' : ' locked'}" data-act="plantNordTree" data-k="${k}" data-id="${d.id}" ${open ? '' : 'disabled'}>
                    <span class="pc-art">${art('plant', `${d.id}:2`)}</span><b>${d.seedName}</b>
                    ${open ? `<small>${ico(['item', d.id])}${fmt(G.sellPrice(d.id))}${ico(['ui', 'coin'])}</small><span class="pc-cost">${stock > 0 ? `${stock} en stock` : `${fmt(d.cost)}${ico(['ui', 'coin'])}`}</span>` : `<small class="lock-txt">${ico(['ui', 'lock'])}Niveau ${d.reqLvl}</small>`}
                </button>`;
            })
            .join('');
        return `${head}${stoveCard}${varHtml}${section('Cultures')}<div class="pick-grid trees">${crops}</div>${section('Arbres')}${cuttingsHtml(k, 'nord')}<div class="pick-grid trees">${trees}</div>`;
    },
});

// ---------------- un poêle ----------------
defineSheet('stove', {
    title: 'Un poêle',
    render(o) {
        const k = +o.k;
        const st = G.stoveAt(k);
        if (!st) return '<p class="empty">Plus de poêle ici.</p>';
        const cap = G.stoveCap(),
            wood = state.inventory.wood || 0;
        const room = Math.floor((cap - st.fuel) / NORD.stove.woodHours);
        const warms = G.nordNeighbors(k, G.stoveRadius()).filter(j => G.cellGrowing(j)).length;
        return `<div class="card oa-up"><span class="oa-up-art">${art('ui', st.fuel > 0 ? 'noPoeleOn' : 'noPoele')}</span><div class="card-main">
            <div class="card-title">${st.fuel > 0 ? 'Le poêle est allumé' : 'Le poêle est éteint'} · ${hours(st.fuel)} / ${hours(cap)}</div>
            ${bar(0, 'oa-bar', `nofuel:${k}`)}
            <div class="card-sub">Il réchauffe ${warms} case${warms > 1 ? 's' : ''} qui pousse${warms > 1 ? 'nt' : ''} en ce moment, jusqu’à ${G.stoveRadius() > 1 ? 'deux pas' : 'un pas'} autour de lui, et brûle ${String(Math.round(G.stoveBurn() * 100) / 100).replace('.', ',')} bûche par heure s’il y en a.</div>
            <div class="actions wrap">${btn(room > 0 ? `Ajouter du bois (${Math.min(room, wood)})` : 'Poêle plein', { act: 'feedStove', data: { k }, kind: wood && room > 0 ? 'green' : '', size: 'sm', icon: ['item', 'wood'], disabled: !(wood && room > 0) })}${btn('Reprendre le poêle', { act: 'takeStove', data: { k }, size: 'sm', icon: ['ui', 'loop'] })}</div></div></div>
            <p class="card-sub center">Reprendre un poêle libère la case et rend le bois qu’il contient ; le poêle lui-même est perdu.</p>`;
    },
});

// ---------------- améliorer ----------------
defineSheet('nordUps', {
    title: 'Le feu du Grand Nord',
    render() {
        G.ensureNord();
        const cards = NORD.ups
            .map(([id, name, text, cost]) => {
                const done = G.nordUp(id);
                return `<div class="card oa-up"><span class="oa-up-art">${art('ui', id === 'logbox' ? 'noBois' : id === 'iron' ? 'noPoeleOn' : 'noFroid')}</span><div class="card-main"><div class="card-title">${name}</div>
                    <div class="card-sub">${text}</div>${done ? '<div class="card-sub"><b>Fait</b></div>' : `${costRow(G.costParts(cost))}${btn('Améliorer', { act: 'upNord', data: { id }, kind: G.hasCost(cost) ? 'green' : '', size: 'sm', disabled: !G.hasCost(cost) })}`}</div></div>`;
            })
            .join('');
        return `${cards}<p class="card-sub center">Un poêle chauffe les ${G.stoveRadius() > 1 ? 'cases à deux pas' : 'huit cases autour de lui'}. Hors d’un poêle, une plante pousse au tiers de sa vitesse le jour, et pas du tout la nuit de gel (de ${NORD.frost[0]} h à ${NORD.frost[1]} h). Une variété rustique résiste mieux au froid.</p>`;
    },
});

// ---------------- fendre le bois : un geste de rythme ----------------
let run = 0;
function openChop() {
    if (!G.chopOpen() || !G.chopLeft()) return;
    const C = NORD.chop;
    const me = ++run;
    document.querySelector('.hg-over')?.remove();
    const o = document.createElement('div');
    o.className = 'hg-over';
    o.innerHTML = `<div class="hg-game"><div class="hg-top"><h2>Fendre le bois</h2><button class="btn sm" id="chquit">Quitter</button></div>
        <div class="hg-stage no-chop" id="chstage"><div class="oa-chad-art no-chop-art">${art('ui', 'noFendre')}</div>
        <div class="cmb-panel"><div class="oa-chad-line"><span id="chl">0 bûche</span><span id="chn">Coup 1 / ${C.swings}</span></div>
        <div class="no-meter"><i class="no-zone"></i><b class="no-mark" id="chmark"></b></div>
        <p class="cmb-help">Le trait va et vient. Touchez quand il passe au milieu de la zone : plus c’est juste, plus la bûche se fend net.</p>
        <div class="hg-btns"><button class="btn gold" id="chgo">C’est parti !</button></div></div></div></div>`;
    document.body.appendChild(o);
    const q = s => o.querySelector(s);
    const close = () => {
        run++;
        o.remove();
        refresh();
    };
    q('#chquit').onclick = close;
    q('#chgo').onclick = () => {
        if (me !== run) return;
        q('.hg-btns').remove();
        play();
    };
    function play() {
        const stage = q('#chstage'),
            mark = q('#chmark');
        const scores = [];
        const t0 = performance.now();
        let pos = 0,
            done = false,
            lock = 0;
        const period = () => 1500 - scores.length * 170;
        stage.addEventListener('pointerdown', () => {
            if (done || performance.now() < lock) return;
            // au milieu (pos = 0,5) : coup parfait
            const sc = Math.max(0, 1 - Math.abs(pos - 0.5) * 4);
            scores.push(sc);
            lock = performance.now() + 350;
            sfx(sc > 0.7 ? 'chop' : 'pop');
            buzz(sc > 0.7 ? 15 : 6);
            const tag = document.createElement('b');
            tag.className = 'oa-chad-tag' + (sc > 0.7 ? ' good' : sc > 0.3 ? '' : ' bad');
            tag.textContent = sc > 0.85 ? 'Net !' : sc > 0.5 ? 'Bien' : sc > 0.2 ? 'De travers' : 'Raté';
            stage.appendChild(tag);
            setTimeout(() => tag.remove(), 700);
            const l = scores.reduce((a, x) => a + x * C.perSwing, 0);
            q('#chl').textContent = `${Math.round(l)} bûche${Math.round(l) > 1 ? 's' : ''}`;
            q('#chn').textContent = `Coup ${Math.min(C.swings, scores.length + 1)} / ${C.swings}`;
            if (scores.length >= C.swings) end();
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
            const got = G.chopDraw(scores, stage);
            const box = document.createElement('div');
            box.className = 'hg-result';
            const tot = Math.round(scores.reduce((a, x) => a + x * C.perSwing, 0));
            box.innerHTML = `<h3>${tot >= 26 ? 'Un vrai bûcheron !' : tot >= 16 ? 'Bien fendu' : 'Beaucoup de copeaux'}</h3>
                <p class="hg-gain">+${got} bûche${got > 1 ? 's' : ''} dans la grange</p><p>${G.chopLeft()} séance${G.chopLeft() > 1 ? 's' : ''} encore aujourd’hui</p><button class="btn gold" id="chdone">Terminer</button>`;
            stage.appendChild(box);
            q('#chdone').onclick = close;
        }
    }
}

export function setupNord() {
    actions({
        goNordMap: () => {
            ui.sel.map = 'nord';
            ui.sel.proj = NORD.project;
            go('village/village');
        },
        buyNordCell: el =>
            askBuy(
                {
                    title: 'Une case de plus au Grand Nord',
                    icon: ['ui', 'noNord'],
                    text: 'Une case de plus pour une culture, un arbre ou un poêle.',
                    cost: G.nordCellCost(),
                    run: at => G.buyNordCell(at),
                },
                el,
            ),
        nordCell: (el, d) => {
            const p = G.nordPlots()[+d.k];
            if (p && p.ready) G.harvestNord(+d.k, el);
            else if (p && p.id) {
                const m = G.cellMult(+d.k);
                toast(
                    m > 0
                        ? `${ITEMS[p.id].name} : prête dans ${formatDuration(Math.max(0, (G.nordGrow(p.id) - p.prog) / ((G.nordRate(p.id) || 1) * m)))}`
                        : `${ITEMS[p.id].name} dort : c’est la nuit de gel, et aucun poêle ne la réchauffe`,
                    ['item', p.id],
                );
            }
        },
        plantNord: (el, d) => {
            if (G.plantNord(+d.k, d.id, anchorEl(`no:${d.k}`) || el)) closeSheet('plantNord');
        },
        plantNordVar: (el, d) => {
            if (G.plantNordVar(+d.k, d.id, anchorEl(`no:${d.k}`) || el)) closeSheet('plantNord');
        },
        plantNordTree: (el, d) => {
            if (G.plantNordTree(+d.k, d.id, anchorEl(`no:${d.k}`) || el)) closeSheet('plantNord');
        },
        harvestNord: el => G.harvestAllNord(el),
        replantNord: el => G.replantNord(el),
        buildStove: (el, d) => {
            if (G.buildStove(+d.k, anchorEl(`no:${d.k}`) || el)) closeSheet('plantNord');
        },
        feedStove: (el, d) => G.feedStove(+d.k, el),
        feedStoves: el => G.feedAllStoves(el),
        takeStove: (el, d) => {
            if (G.removeStove(+d.k)) {
                toast('Poêle repris : la case est libre', ['ui', 'noPoele']);
                closeSheet('stove');
            }
        },
        upNord: (el, d) => G.upgradeNord(d.id, el),
        barnUp: el => G.upNordBarn(el),
        clearSnow: (el, d) => G.clearSnow(+d.k, el),
        sledAdd: (el, d) => G.sledAdd(d.id),
        sledDel: (el, d) => G.sledRemove(d.id),
        sledSend: el => G.sledSend(el),
        sledClaim: el => G.sledClaim(el),
        chop: () => openChop(),
    });
    const onLong = el => openSheet('tree', { k: +el.dataset.k, z: 'nord' });
    longPress(byId('view-farm'), '.no-cell[data-act="tree"]', onLong);
    on('nordFx', ({ k, delay }) => {
        const el = anchorEl(`no:${k}`) || anchorEl(anchorOf('nord', k));
        if (!el) return;
        setTimeout(() => {
            const r = el.getBoundingClientRect();
            burstAt(r.left + r.width / 2, r.top + r.height / 2, 'sparkle', 5);
        }, delay || 0);
    });
}
