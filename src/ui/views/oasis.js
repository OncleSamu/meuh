// Ferme | Voyages : l'île et l'oasis (1.48), deux choix en tête comme au haras.
// L'oasis : une grille de cases (cultures et arbres), la citerne, la source, le chadouf, l'ombre des palmiers.
import { state } from '../../core/state.js';
import { fmt, formatDuration } from '../../core/format.js';
import { on, sfx, buzz, toast } from '../../core/bus.js';
import { ITEMS } from '../../data/items.js';
import { OASIS, PEN, CARAVAN } from '../../data/oasis.js';
import { stableTile, birthRow, assocRow } from './animals.js';
import * as G from '../../systems/index.js';
import { blocks, actions, anchorEl, esc, byId } from '../dom.js';
import { genWrap } from '../genlook.js';
import { ico, art } from '../icons.js';
import { btn, bar, section, segmented, costRow, timer } from '../kit.js';
import { defineView, defineLive, ui, go, refresh } from '../app.js';
import { defineSheet, openSheet, closeSheet } from '../sheets.js';
import { burstAt, reduceMotion } from '../fx.js';
import { longPress } from '../longpress.js';
import { askBuy } from '../sheets/askbuy.js';
import { renderIsland } from './island.js';
import { renderNord } from './nord.js';
import { NORD } from '../../data/nord.js';
import { treeArt, anchorOf } from './orchard.js';
import { cuttingsHtml } from './orchard2.js';
import { svg } from '../../art/kit.js';
import { chadouf } from '../../art/v148oasis.js';

// ---------------- le volet Voyages ----------------
const PICKS = [
    ['isle', 'L’île', ['item', 'pineapple']],
    ['oasis', 'L’oasis', ['ui', 'oaOasis']],
    ['nord', 'Le Nord', ['ui', 'noNord']],
];
function renderVoyages(el) {
    const cur = ui.sel.island === 'oasis' || ui.sel.island === 'nord' ? ui.sel.island : 'isle';
    const locked = id => (id === 'oasis' && !G.oasisLvlOk()) || (id === 'nord' && !G.nordLvlOk());
    const pick = segmented(
        PICKS.map(([id, name, icon]) => [id, name, locked(id) ? ['ui', 'lock'] : icon, 0, locked(id)]),
        cur,
        'voyPick',
    );
    blocks(el, [
        ['vpick', pick],
        ['vbody-' + cur, '<div class="voy-body"></div>'],
    ]);
    (cur === 'oasis' ? renderOasis : cur === 'nord' ? renderNord : renderIsland)(el.querySelector('.voy-body'));
}
defineView('farm/island', renderVoyages);

// ---------------- l'oasis ----------------
defineLive('oacell', k => {
    const p = G.oasisPlots()[+k];
    return p && p.id ? Math.min(1, p.prog / G.cropGrowTime(p.id)) : 0;
});
defineLive('oawater', () => G.oasisWater() / G.tankCap());

const cropStage = p => (p.ready ? 2 : p.prog / G.cropGrowTime(p.id) < 0.5 ? 0 : 1);
const litres = n => `${fmt(Math.floor(n))} L`;
const lph = n => `${String(n).replace('.', ',')} L/h`;

function closedCard() {
    const lvl = !G.oasisLvlOk();
    return `<div class="card island-closed oa-closed">
        <div class="ic-art">${art('villager', 'idris')}</div>
        <div class="card-title">L’oasis d’Idris</div>
        <p class="card-sub">${
            lvl
                ? `Au niveau ${OASIS.lvl}, un caravanier arrive au port avec un dromadaire fatigué : la source de son oasis s’est tarie.`
                : !G.chapterOpen(21)
                  ? `Finissez d’abord le chapitre ${G.chapterNum(G.chapterAfter(21))} (le château) : Idris attend sur le quai.`
                  : 'Idris a besoin de vous pour rouvrir le puits. Apportez-lui pierres, poutres, planches et outils dans le volet Village, carte « L’oasis ».'
        }</p>
        ${lvl ? '' : btn('Voir le puits', { act: 'goOasisMap', kind: 'gold', wide: true, icon: ['ui', 'village'] })}
    </div>`;
}

function waterCard() {
    const w = G.oasisWater(),
        cap = G.tankCap();
    const drink = G.oasisDrink(),
        src = G.springRate();
    const hot = G.isHot();
    const left = G.chadoufLeft();
    const chad = G.chadoufOpen()
        ? btn(left ? `Chadouf (${left})` : 'Chadouf demain', {
              act: 'chadouf',
              kind: left && w < cap ? 'gold' : '',
              size: 'sm',
              icon: ['ui', 'oaChadouf'],
              disabled: !left,
          })
        : '';
    const dry = state.oasis.dry;
    return `<div class="card oa-water${dry ? ' dry' : ''}">
        <span class="oa-tank">${art('ui', `oaCiterne${state.oasis.tank + 1}`)}</span>
        <div class="card-main">
            <div class="card-title">La citerne · <span class="oa-l">${litres(w)}</span> / ${cap} L</div>
            ${bar(0, 'oa-bar', 'oawater')}
            <div class="oa-flow"><span class="chip ok">${ico(['ui', 'oaSource'])}+${src} L/h</span><span class="chip${drink > src ? ' bad' : ''}">${ico(['ui', 'drop'])}−${fmt(Math.round(drink))} L/h</span>${hot ? `<span class="chip bad">${ico(['ui', 'oaMidi'])}Midi : soif × 2 au soleil</span>` : ''}</div>
            ${dry ? `<p class="card-sub oa-dry">La citerne est vide : les plantes attendent l’eau${G.chadoufOpen() && left ? ', le chadouf peut aider' : ''}.</p>` : ''}
            <div class="actions wrap">${chad}${btn('Améliorer', { act: 'open', data: { sheet: 'oasisWater' }, size: 'sm', icon: ['ui', 'oaPuits'] })}</div>
        </div>
    </div>`;
}

function cellHtml(k, nextLocked) {
    const p = G.oasisPlots()[k],
        sl = G.slotsOf('oasis')[k];
    const anc = `oa:${k}`;
    if (!p.open) {
        if (k !== nextLocked) return '<div class="oa-cell void"></div>';
        const cost = G.oasisCellCost();
        return `<button class="oa-cell locked next${state.money >= cost ? ' can' : ''}" data-act="buyOasisCell" data-anchor="${anc}">
            <span class="lock-ico">${art('ui', 'lock')}</span><span class="price-chip">${ico(['ui', 'coin'])}${fmt(cost)}</span></button>`;
    }
    const shade = G.isShaded(k);
    const thirsty = state.oasis.dry && G.cellNeed(k) > 0;
    const cls = `oa-cell${shade ? ' shade' : ''}${thirsty ? ' thirsty' : ''}`;
    const mark = `${shade ? `<i class="oa-shade" title="À l’ombre">${ico(['ui', 'oaOmbre'])}</i>` : ''}${thirsty ? `<i class="oa-thirst">${ico(['ui', 'drop'])}</i>` : ''}`;
    // 1.49 : ensablée par la tempête : un appui la dégage
    if (p.sand)
        return `<button class="${cls} sand" data-act="clearSand" data-k="${k}" data-anchor="${anc}"><span class="oa-art">${sl.tree ? treeArt(sl.tree) : art('plant', `${p.id}:${cropStage(p)}`)}</span><span class="oa-sand"></span><small class="oa-sand-txt">Dégager</small></button>`;
    const t = sl.tree;
    if (t) {
        const st = G.treeStage(t);
        const full = st !== 'dead' && G.groundFull(t);
        const tag =
            st === 'dead'
                ? `<span class="o-tag dead">${ico(['item', 'wood'])}</span>`
                : t.ground
                  ? `<span class="o-tag ready${full ? ' full' : ''}">${ico(['item', t.id])}×${t.ground}</span>`
                  : '';
        return `<button class="${cls} tree ${st}" data-act="tree" data-z="oasis" data-k="${k}" data-anchor="${anchorOf('oasis', k)}">
            ${tag}<span class="oa-art">${treeArt(t)}</span>${st === 'dead' ? '' : bar(0, 'oa-pbar', `tree:oasis-${k}`)}${mark}</button>`;
    }
    if (!p.id)
        return `<button class="${cls} empty" data-act="open" data-sheet="plantOasis" data-k="${k}" data-anchor="${anc}">
            <span class="o-plus">${ico(['ui', 'plus'])}</span>${p.last ? `<small>${ITEMS[p.last].name}</small>` : ''}${mark}</button>`;
    const v = p.v && state.genetics && state.genetics.vars[p.v];
    const a = art('plant', `${p.id}:${cropStage(p)}`);
    return `<button class="${cls} crop${p.ready ? ' ready' : ''}" data-act="oasisCell" data-k="${k}" data-anchor="${anc}">
        <span class="oa-art">${v ? genWrap(a, v.g) : a}</span>${p.ready ? '' : bar(0, 'oa-pbar', `oacell:${k}`)}${mark}</button>`;
}

function renderOasis(el) {
    G.ensureOasis();
    if (!G.oasisOpen()) {
        blocks(el, [['closed', closedCard()]]);
        return;
    }
    const plots = G.oasisPlots();
    const next = plots.findIndex(x => !x.open);
    const pick = G.oasisToPick(),
        empty = plots.filter((p, k) => p.open && !p.id && p.last && !G.slotsOf('oasis')[k].tree).length;
    const dead = G.deadTrees('oasis');
    blocks(el, [
        ['water', waterCard()],
        [
            'top',
            `<div class="view-top"><div class="actions wrap">${btn('Récolter', { act: 'harvestOasis', kind: pick ? 'green' : '', size: 'sm', icon: ['ui', 'basket'], disabled: !pick })}${btn('Replanter', { act: 'replantOasis', size: 'sm', icon: ['ui', 'loop'], disabled: !empty })}${dead > 1 ? btn(`Débiter (${dead})`, { act: 'fellDead', data: { z: 'oasis' }, size: 'sm', icon: ['item', 'wood'] }) : ''}</div></div>`,
        ],
        ['h1', section('La palmeraie', `<small class="o-count small">${plots.filter(p => p.open).length} cases</small>`)],
        ['grid', `<div class="oa-grid">${plots.map((p, k) => cellHtml(k, next)).join('')}</div>`],
        ['h2', section(PEN.name, G.enclosOpen() ? `<small class="o-count small">${G.penBeasts().length}/${G.enclosCap()}</small>` : '')],
        ['pen', penHtml()],
        ['caravan', caravanHtml()],
    ]);
}

// ---------------- 1.49 : l'enclos de la palmeraie ----------------
function penHtml() {
    if (!G.enclosOpen())
        return `<div class="card oa-pen-closed"><span class="oa-up-art">${art('ui', 'oaEnclos')}</span><div class="card-main"><div class="card-sub">${
            state.level < 59
                ? 'Au niveau 59, Idris bâtit un enclos à l’ombre des palmes, pour des dromadaires, des zébus et des moutons barbarins.'
                : 'Bâtissez l’enclos avec Idris : chapitre « Le souk de l’oasis », Village, carte « L’oasis ».'
        }</div></div></div>`;
    const list = G.penBeasts();
    const mf = G.maxFood();
    const idx = list.map(a => state.animals.indexOf(a));
    const shade = G.penShadeSlots();
    const hot = G.isHot();
    const zebu = G.noriaZebu();
    const tiles = idx.length
        ? `<div class="stable oa-stable">${idx
              .sort((x, y) => (state.animals[x].type < state.animals[y].type ? -1 : state.animals[x].type > state.animals[y].type ? 1 : x - y))
              .map(i => stableTile(state.animals[i], i, mf))
              .join('')}</div>`
        : `<p class="empty">L’enclos est vide. Dromadaires, zébus et moutons barbarins vous attendent au marché.</p>`;
    const noria = G.noriaBuilt()
        ? `<div class="line">${ico(['ui', 'oaNoria'])}<div>${zebu ? `La noria tourne : ${esc(zebu.name)} donne +${PEN.noria.lph} L/h à la source.` : 'La noria attend un zébu : attelez-en un depuis sa fiche (appui long).'}</div></div>`
        : `<div class="line">${ico(['ui', 'oaNoria'])}<div>La noria : un zébu y tourne la roue, la source donne +${PEN.noria.lph} L/h (mais il ne fait plus de lait). ${costRow(G.costParts(PEN.noria.cost))}</div>${btn('Monter', { act: 'buildNoria', size: 'sm', kind: G.hasCost(PEN.noria.cost) ? 'green' : '', disabled: !G.hasCost(PEN.noria.cost) })}</div>`;
    const big = state.oasis.penBig
        ? ''
        : `<div class="line">${ico(['ui', 'oaEnclos'])}<div>Agrandir la palissade : ${PEN.cap[1]} places. ${costRow(G.costParts(PEN.upCost))}</div>${btn('Agrandir', { act: 'penUp', size: 'sm', kind: G.hasCost(PEN.upCost) ? 'green' : '', disabled: !G.hasCost(PEN.upCost) })}</div>`;
    return `<div class="card oa-pen">
        <div class="oa-flow"><span class="chip">${ico(['ui', 'drop'])}−${String(Math.round(G.penDrink() * 10) / 10).replace('.', ',')} L/h</span><span class="chip ok">${ico(['ui', 'oaOmbre'])}${shade} à l’ombre</span>${hot ? `<span class="chip bad">${ico(['ui', 'oaMidi'])}Midi : moitié moins vite au soleil</span>` : ''}</div>
        <div class="actions wrap">${btn('Nourrir', { act: 'feedAll', kind: 'gold', size: 'sm', icon: ['item', 'feed'] })}${btn('Ramasser', { act: 'collectAnimals', kind: 'green', size: 'sm', icon: ['ui', 'basket'] })}${btn('Acheter', { act: 'go', data: { path: 'market/shop#animals' }, size: 'sm', icon: ['ui', 'coin'] })}</div>
        ${birthRow(PEN.key)}${assocRow(PEN.key)}${tiles}${noria}${big}
        <p class="card-sub">Chaque palmier dattier adulte abrite ${PEN.shadePerPalm} bêtes du soleil de midi. Le mouton barbarin ne craint pas la chaleur.</p>
    </div>`;
}

// ---------------- 1.49 : la caravane ----------------
function caravanHtml() {
    if (!G.enclosOpen()) return '';
    if (!G.caravanOpen())
        return `<div class="card oa-pen-closed"><span class="oa-up-art">${art('ui', 'oaCaravane')}</span><div class="card-main"><div class="card-title">La caravane</div><div class="card-sub">Rebâtissez le caravansérail avec Idris : trois dromadaires porteront vos produits au souk de la ville.</div></div></div>`;
    const c = G.caravanState();
    if (c.out) {
        const back = G.caravanBack();
        return `<div class="card oa-caravan"><span class="oa-up-art">${art('ui', 'oaCaravane')}</span><div class="card-main"><div class="card-title">La caravane ${back ? 'est rentrée !' : 'est en route'}</div>
            <div class="card-sub">${back ? `Elle rapporte ${fmt(c.out.value)} pièces du souk.` : `Retour dans ${timer(c.out.back)} avec environ ${fmt(c.out.value)} pièces.`}</div>
            ${back ? btn('Accueillir la caravane', { act: 'caravanClaim', kind: 'gold', icon: ['ui', 'coin'] }) : ''}</div></div>`;
    }
    const loads = G.caravanLoads(),
        camels = G.caravanCamels().length;
    const chips = Object.entries(c.load)
        .map(([id, n]) => `<button class="pick-chip on" data-act="caravanDel" data-id="${id}">${ico(['item', id])}<span>${n * CARAVAN.perLoad}</span></button>`)
        .join('');
    return `<div class="card oa-caravan"><span class="oa-up-art">${art('ui', 'oaCaravane')}</span><div class="card-main"><div class="card-title">La caravane · ${loads}/${CARAVAN.loads} charges</div>
        <div class="card-sub">Une charge = ${CARAVAN.perLoad} produits. Le souk paie ${String(Math.round(G.caravanMult() * 100) / 100).replace('.', ',')} fois le prix du grossiste ; retour en 6 heures. ${camels < CARAVAN.camels ? `Il faut ${CARAVAN.camels} dromadaires adultes (vous en avez ${camels}).` : ''}</div>
        ${chips ? `<div class="chips-row">${chips}</div>` : ''}
        ${loads ? `<div class="card-sub">Valeur au souk : <b>${fmt(G.caravanValue())}</b> pièces</div>` : ''}
        <div class="actions wrap">${btn('Charger', { act: 'open', data: { sheet: 'caravanLoad' }, size: 'sm', icon: ['ui', 'plus'], disabled: loads >= CARAVAN.loads })}${btn('Partir', { act: 'caravanSend', kind: loads && camels >= CARAVAN.camels ? 'green' : '', size: 'sm', icon: ['ui', 'oaCaravane'], disabled: !loads || camels < CARAVAN.camels })}</div></div></div>`;
}
defineSheet('caravanLoad', {
    title: 'Charger la caravane',
    render() {
        const goods = G.caravanGoods()
            .map(id => [id, G.sellPrice(id)])
            .sort((a, b) => b[1] - a[1])
            .slice(0, 60);
        if (!goods.length) return `<p class="empty">Il faut au moins ${CARAVAN.perLoad} produits d’une même sorte dans la grange.</p>`;
        return `<p class="card-sub center">${G.caravanLoads()}/${CARAVAN.loads} charges. Touchez un produit pour en charger ${CARAVAN.perLoad}.</p><div class="pick-grid trees">${goods
            .map(
                ([id, p]) =>
                    `<button class="pick-cell" data-act="caravanAdd" data-id="${id}"><span class="pc-art">${art('item', id)}</span><b>${ITEMS[id].name}</b><small>${fmt(Math.round(p * CARAVAN.perLoad * G.caravanMult()))}${ico(['ui', 'coin'])} la charge</small><span class="pc-cost">${state.inventory[id]} en grange</span></button>`,
            )
            .join('')}</div>`;
    },
});

// ---------------- planter sur une case ----------------
const shortDur = sec => (sec < 90 ? `${Math.round(sec)} s` : sec < 5400 ? `${Math.round(sec / 60)} min` : `${Math.round(sec / 360) / 10} h`);
defineSheet('plantOasis', {
    title: 'Planter à l’oasis',
    render(o) {
        const k = +o.k;
        const shade = G.isShaded(k);
        const vars = state.genetics
            ? G.varieties().filter(v => ITEMS[v.base].oasis && ITEMS[v.base].type === 'crop' && (state.genetics.seeds[v.id] || 0) > 0)
            : [];
        const head = `<p class="card-sub center">${shade ? `${ico(['ui', 'oaOmbre'])}Cette case est à l’ombre d’un palmier : elle boit un tiers de moins et ne craint pas midi.` : `${ico(['ui', 'oaMidi'])}Cette case est au soleil : de midi à 16 h, elle boit deux fois plus. Un palmier dattier voisin lui ferait de l’ombre.`}</p>`;
        const varHtml = vars.length
            ? `${section('Mes variétés')}<div class="pick-grid trees">${vars
                  .map(
                      v =>
                          `<button class="pick-cell var${ui.sel.oaVar === v.id ? ' on' : ''}" data-act="plantOasisVar" data-k="${k}" data-id="${v.id}"><span class="pc-art">${genWrap(art('plant', `${v.base}:2`), v.g)}</span><b>${esc(G.varName(v))}</b><span class="pc-cost">${state.genetics.seeds[v.id]} graines</span></button>`,
                  )
                  .join('')}</div>`
            : '';
        const crops = G.oasisCrops()
            .sort((a, b) => a.reqLvl - b.reqLvl)
            .map(d => {
                const open = G.oasisCropOk(d),
                    stock = state.seeds[d.id] || 0;
                const t = G.cropGrowTime(d.id) / (G.oasisRate(d.id) || 1);
                return `<button class="pick-cell${open ? '' : ' locked'}" data-act="plantOasis" data-k="${k}" data-id="${d.id}" ${open ? '' : 'disabled'}>
                    <span class="pc-art">${art('plant', `${d.id}:2`)}</span><b>${d.name}</b>
                    ${open ? `<small>${fmt(G.sellPrice(d.id))}${ico(['ui', 'coin'])} · ${shortDur(t)}</small><small>${ico(['ui', 'drop'])}${lph(OASIS.drink.crop)}</small><span class="pc-cost">${stock > 0 ? `${stock} en stock` : `${fmt(d.cost)}${ico(['ui', 'coin'])}`}</span>` : `<small class="lock-txt">${ico(['ui', 'lock'])}Niveau ${d.reqLvl}</small>`}
                </button>`;
            })
            .join('');
        const trees = G.treeList('oasis')
            .sort((a, b) => a.reqLvl - b.reqLvl)
            .map(d => {
                const open = G.treeUnlocked(d),
                    stock = state.seeds[d.id] || 0;
                const L = d.id === OASIS.palm ? OASIS.drink.palm : OASIS.drink.tree;
                return `<button class="pick-cell${open ? '' : ' locked'}" data-act="plantOasisTree" data-k="${k}" data-id="${d.id}" ${open ? '' : 'disabled'}>
                    <span class="pc-art">${art('plant', `${d.id}:2`)}</span><b>${d.seedName}</b>
                    ${open ? `<small>${ico(['item', d.id])}${fmt(G.sellPrice(d.id))}${ico(['ui', 'coin'])}</small><small>${ico(['ui', 'drop'])}${lph(L)}${d.id === OASIS.palm ? ' · ombre' : ''}</small><span class="pc-cost">${stock > 0 ? `${stock} en stock` : `${fmt(d.cost)}${ico(['ui', 'coin'])}`}</span>` : `<small class="lock-txt">${ico(['ui', 'lock'])}Niveau ${d.reqLvl}</small>`}
                </button>`;
            })
            .join('');
        return `${head}${varHtml}${section('Cultures')}<div class="pick-grid trees">${crops}</div>${section('Arbres')}${cuttingsHtml(k, 'oasis')}<div class="pick-grid trees">${trees}</div>`;
    },
});

// ---------------- la citerne et la source ----------------
defineSheet('oasisWater', {
    title: 'L’eau de l’oasis',
    render() {
        G.ensureOasis();
        const tn = G.tankNext(),
            sn = G.springUpNext();
        const tankCard = tn
            ? `<div class="card oa-up"><span class="oa-up-art">${art('ui', `oaCiterne${state.oasis.tank + 2}`)}</span><div class="card-main"><div class="card-title">Agrandir la citerne : ${tn.cap} L</div>
                <div class="card-sub">Plus de réserve pour la nuit et pour midi.</div>${costRow(G.costParts(tn.cost))}
                ${btn('Agrandir', { act: 'oaTank', kind: G.hasCost(tn.cost) ? 'green' : '', size: 'sm', disabled: !G.hasCost(tn.cost) })}</div></div>`
            : `<div class="card oa-up"><span class="oa-up-art">${art('ui', 'oaCiterne3')}</span><div class="card-main"><div class="card-title">La grande citerne : ${G.tankCap()} L</div><div class="card-sub">Elle ne peut pas être plus grande.</div></div></div>`;
        const springCard = sn
            ? `<div class="card oa-up"><span class="oa-up-art">${art('ui', sn[0] === 'deep' ? 'oaPuits' : 'oaFoggara')}</span><div class="card-main"><div class="card-title">${sn[1]} : +${sn[2]} L/h</div>
                <div class="card-sub">${sn[0] === 'deep' ? 'Creuser plus bas, jusqu’à la nappe fraîche.' : 'De longues galeries sous le sable amènent l’eau de la montagne, comme les anciens le faisaient.'}</div>${costRow(G.costParts(sn[3]))}
                ${btn('Construire', { act: 'oaSpring', kind: G.hasCost(sn[3]) ? 'green' : '', size: 'sm', disabled: !G.hasCost(sn[3]) })}</div></div>`
            : '';
        return `<div class="card oa-up"><span class="oa-up-art">${art('ui', 'oaSource')}</span><div class="card-main"><div class="card-title">La source : ${G.springRate()} L par heure</div>
            <div class="card-sub">Elle coule jour et nuit, même jeu fermé. En ce moment, l’oasis boit ${fmt(Math.round(G.oasisDrink()))} L par heure.</div></div></div>
            ${tankCard}${springCard}
            <p class="card-sub center">Tant qu’elle pousse, une culture boit ${lph(OASIS.drink.crop)}, un arbre ${lph(OASIS.drink.tree)}, un palmier dattier ${lph(OASIS.drink.palm)} ; une plante mûre ne boit plus. À l’ombre, un tiers de moins ; au soleil de midi à 16 h, deux fois plus. Une variété qui résiste à la soif boit moins.</p>`;
    },
});

// ---------------- le chadouf : un geste de rythme ----------------
let run = 0;
function openChadouf() {
    if (!G.chadoufOpen() || !G.chadoufLeft()) return;
    const C = OASIS.chadouf;
    const me = ++run;
    document.querySelector('.hg-over')?.remove();
    const o = document.createElement('div');
    o.className = 'hg-over';
    o.innerHTML = `<div class="hg-game"><div class="hg-top"><h2>Le chadouf</h2><button class="btn sm" id="chquit">Quitter</button></div>
        <div class="hg-stage oa-chad" id="chstage"><div class="oa-chad-art"></div>
        <div class="cmb-panel"><div class="oa-chad-line"><span id="chl">0 L</span><span id="chn">Seau 1 / ${C.scoops}</span></div>
        <p class="cmb-help">Le seau monte et descend. Touchez au moment où il plonge dans l’eau : plus c’est juste, plus il remonte plein.</p>
        <div class="hg-btns"><button class="btn gold" id="chgo">C’est parti !</button></div></div></div></div>`;
    document.body.appendChild(o);
    const q = s => o.querySelector(s);
    const draw = tilt => (q('.oa-chad-art').innerHTML = svg(chadouf(tilt), '0 0 64 64', 'oa-chad-svg'));
    draw(0);
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
        const stage = q('#chstage');
        const scores = [];
        const t0 = performance.now();
        let tilt = 0,
            done = false,
            lock = 0;
        // une période qui raccourcit à chaque seau
        const period = () => 1900 - scores.length * 180;
        stage.addEventListener('pointerdown', () => {
            if (done || performance.now() < lock) return;
            // au fond (tilt = 1) : seau plein
            const sc = Math.max(0, 1 - Math.abs(1 - tilt) * 2.5);
            scores.push(sc);
            lock = performance.now() + 350;
            sfx(sc > 0.7 ? 'water' : 'pop');
            buzz(sc > 0.7 ? 15 : 6);
            const tag = document.createElement('b');
            tag.className = 'oa-chad-tag' + (sc > 0.7 ? ' good' : sc > 0.3 ? '' : ' bad');
            tag.textContent = sc > 0.85 ? 'Plein !' : sc > 0.5 ? 'Bien' : sc > 0.2 ? 'À moitié' : 'Raté';
            stage.appendChild(tag);
            setTimeout(() => tag.remove(), 700);
            const l = scores.reduce((a, x) => a + x * C.perScoop, 0);
            q('#chl').textContent = `${Math.round(l)} L`;
            q('#chn').textContent = `Seau ${Math.min(C.scoops, scores.length + 1)} / ${C.scoops}`;
            if (scores.length >= C.scoops) end();
        });
        const tick = () => {
            if (me !== run || done) return;
            const ph = ((performance.now() - t0) % period()) / period();
            tilt = (1 - Math.cos(ph * Math.PI * 2)) / 2;
            draw(reduceMotion() ? Math.round(tilt * 4) / 4 : tilt);
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        function end() {
            done = true;
            const got = G.chadoufDraw(scores, stage);
            const box = document.createElement('div');
            box.className = 'hg-result';
            const tot = Math.round(scores.reduce((a, x) => a + x * C.perScoop, 0));
            box.innerHTML = `<h3>${tot >= 34 ? 'Un vrai porteur d’eau !' : tot >= 20 ? 'Bien remonté' : 'Le seau a beaucoup fui'}</h3>
                <p class="hg-gain">+${Math.round(got)} litres dans la citerne</p><p>${G.chadoufLeft()} séance${G.chadoufLeft() > 1 ? 's' : ''} encore aujourd’hui</p><button class="btn gold" id="chdone">Terminer</button>`;
            stage.appendChild(box);
            q('#chdone').onclick = close;
        }
    }
}

export function setupOasis() {
    actions({
        voyPick: (el, d) => {
            if (d.v === 'oasis' && !G.oasisLvlOk()) {
                toast(`L’oasis s’ouvre au niveau ${OASIS.lvl}`, ['ui', 'lock']);
                return;
            }
            if (d.v === 'nord' && !G.nordLvlOk()) {
                toast(`Le Grand Nord s’ouvre au niveau ${NORD.lvl}`, ['ui', 'lock']);
                return;
            }
            ui.sel.island = d.v;
            const v = document.getElementById('view-farm');
            if (v) v.scrollTop = 0;
        },
        goOasisMap: () => {
            ui.sel.map = 'oasis';
            ui.sel.proj = OASIS.project;
            go('village/village');
        },
        buyOasisCell: el =>
            askBuy(
                {
                    title: 'Une case de plus à l’oasis',
                    icon: ['ui', 'oaOasis'],
                    text: 'Une case de plus pour une culture ou un arbre.',
                    cost: G.oasisCellCost(),
                    run: at => G.buyOasisCell(at),
                },
                el,
            ),
        oasisCell: (el, d) => {
            const p = G.oasisPlots()[+d.k];
            if (p && p.ready) G.harvestOasis(+d.k, el);
            else if (p && p.id)
                toast(`${ITEMS[p.id].name} : prête dans ${formatDuration(Math.max(0, (G.cropGrowTime(p.id) - p.prog) / (G.oasisRate(p.id) || 1)))}`, [
                    'item',
                    p.id,
                ]);
        },
        plantOasis: (el, d) => {
            if (G.plantOasis(+d.k, d.id, anchorEl(`oa:${d.k}`) || el)) closeSheet('plantOasis');
        },
        plantOasisVar: (el, d) => {
            if (G.plantOasisVar(+d.k, d.id, anchorEl(`oa:${d.k}`) || el)) closeSheet('plantOasis');
        },
        plantOasisTree: (el, d) => {
            if (G.plantOasisTree(+d.k, d.id, anchorEl(`oa:${d.k}`) || el)) closeSheet('plantOasis');
        },
        harvestOasis: el => G.harvestAllOasis(el),
        replantOasis: el => G.replantOasis(el),
        chadouf: () => openChadouf(),
        oaTank: el => G.upgradeTank(el),
        clearSand: (el, d) => G.clearSand(+d.k, el),
        buildNoria: el => G.buildNoria(el),
        penUp: el => G.enclosUpgrade(el),
        caravanAdd: (el, d) => G.caravanAdd(d.id),
        caravanDel: (el, d) => G.caravanRemove(d.id),
        caravanSend: el => G.caravanSend(el),
        caravanClaim: el => G.caravanClaim(el),
        oaSpring: el => G.upgradeSpring(el),
    });
    const onLong = el => openSheet('tree', { k: +el.dataset.k, z: 'oasis' });
    longPress(byId('view-farm'), '.oa-cell[data-act="tree"]', onLong);
    on('oasisFx', ({ k, delay }) => {
        const el = anchorEl(`oa:${k}`) || anchorEl(anchorOf('oasis', k));
        if (!el) return;
        setTimeout(() => {
            const r = el.getBoundingClientRect();
            burstAt(r.left + r.width / 2, r.top + r.height / 2, 'sparkle', 5);
        }, delay || 0);
    });
}
