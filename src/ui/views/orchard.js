// Ferme | Verger : les arbres fruitiers, leurs fruits au sol, leur âge ; plantation et fiche de chaque arbre.
import { state } from '../../core/state.js';
import { fmt, formatDuration } from '../../core/format.js';
import { now } from '../../core/clock.js';
import { on } from '../../core/bus.js';
import { ITEMS } from '../../data/items.js';
import { ORCHARD, treeWood } from '../../data/farm.js';
import { OASIS } from '../../data/oasis.js';
import * as G from '../../systems/index.js';
import { blocks, actions, anchorEl, QUIET, byId } from '../dom.js';
import { longPress } from '../longpress.js';
import { confirmTap } from '../confirm.js';
import { askBuy } from '../sheets/askbuy.js';
import { ico, art } from '../icons.js';
import { btn, bar, hint, timer, lines } from '../kit.js';
import { defineView, defineLive } from '../app.js';
import { defineSheet, openSheet, closeSheet } from '../sheets.js';
import { burstAt } from '../fx.js';
import { lifeCards, setupOrchard3 } from './orchard3.js';
import { orchardCards, treeExtras, cuttingsHtml, setupOrchard2 } from './orchard2.js';

const STAGE_ART = { young: 0, adult: 2, old: 3, dead: 4 };
const STAGE_NAME = { young: 'Jeune plant', adult: 'En pleine forme', old: 'Vieil arbre', dead: 'Arbre mort' };

// le dessin selon l'âge (un jeune plant devient arbrisseau à mi-pousse)
export function treeArt(t) {
    const st = G.treeStage(t);
    const n = st === 'young' ? (G.treeGrowPct(t) < 0.5 ? 0 : 1) : STAGE_ART[st];
    return art('plant', `${t.id}:${n}`);
}

// les fruits tombés, éparpillés au pied
const SPOTS = [
    [18, 84],
    [70, 88],
    [38, 92],
    [82, 78],
    [8, 74],
    [56, 95],
];
const groundHtml = t =>
    SPOTS.slice(0, t.ground)
        .map(([x, y]) => `<i class="o-fruit" style="left:${x}%;top:${y}%">${art('item', t.id)}</i>`)
        .join('');

// zone : 'farm' (le verger de la ferme) ou 'island' (le verger de l'île)
export const anchorOf = (z, k) => `${{ island: 'itree', oasis: 'otree', nord: 'ntree', oasisV: 'otreev', nordV: 'ntreev' }[z] || 'tree'}:${k}`;
const treeAt = (z, k) => (G.slotsOf(z)[k] || {}).tree;

defineLive('tree', arg => {
    const [z, k] = String(arg).split('-');
    const sl = G.slotsOf(z)[+k];
    const t = sl && sl.tree;
    if (!t) return 0;
    const st = G.treeStage(t);
    return st === 'young' ? G.treeGrowPct(t) : st === 'dead' || G.groundFull(t) ? 1 : G.treeFruitPct(t);
});

export function spot(sl, k, nextLocked, z = 'farm') {
    const anc = anchorOf(z, k);
    if (!sl.open) {
        if (k !== nextLocked) return '';
        const cost = G.slotCost(z),
            ok = state.money >= cost;
        return `<button class="o-spot locked${ok ? ' can' : ''}" data-act="buyOrchardSlot" data-z="${z}" data-anchor="${anc}">
            <span class="o-lock">${art('ui', 'lock')}</span><span class="price-chip">${ico(['ui', 'coin'])}${fmt(cost)}</span></button>`;
    }
    const t = sl.tree;
    if (!t)
        return `<button class="o-spot empty" data-act="open" data-sheet="plantTree" data-k="${k}" data-z="${z}" data-anchor="${anc}">
            <span class="o-hole"></span><span class="o-plus">${ico(['ui', 'plus'])}</span><small>Planter</small></button>`;
    const st = G.treeStage(t);
    const full = st !== 'dead' && G.groundFull(t);
    const left = st !== 'dead' && !full ? G.treeLeft(t) : 0;
    const tag =
        st === 'dead'
            ? `<span class="o-tag dead">${ico(['item', 'wood'])}Bois</span>`
            : t.ground
              ? `<span class="o-tag ready${full ? ' full' : ''}">${ico(['item', t.id])}×${t.ground}</span>`
              : '';
    return `<button class="o-spot ${st}${t.ground ? ' has-fruit' : ''}" data-act="tree" data-k="${k}" data-z="${z}" data-anchor="${anc}">
        ${tag}<span class="o-tree">${treeArt(t)}${groundHtml(t)}</span>
        <b>${ITEMS[t.id].seedName}</b>
        ${st === 'dead' ? '<small>Touchez pour le débiter</small>' : bar(0, `o-bar ${st}${full ? ' full' : ''}`, `tree:${z}-${k}`)}
        ${st === 'dead' ? '' : `<small class="o-when">${full ? 'Sol plein : ramassez !' : `${st === 'young' ? 'Adulte' : 'Fruit'} dans ${timer(now() + left * 1000)}`}</small>`}
    </button>`;
}

function renderOrchard(el) {
    G.ensureOrchard();
    const slots = state.orchard.slots;
    const nextLocked = slots.findIndex(x => !x.open);
    const fruits = G.fruitsOnGround('farm');
    const dead = G.deadTrees('farm');
    blocks(el, [
        [
            'top',
            `<div class="view-top"><span class="o-count">${ico(['item', 'apple'])}${G.treeCountText('farm')}</span><div class="actions">${btn('Tout ramasser', {
                act: 'pickAllTrees',
                kind: fruits ? 'green' : '',
                size: 'sm',
                icon: ['ui', 'basket'],
                disabled: !fruits,
                anchor: 'btn:pickTrees',
            })}${dead > 1 ? btn(`Débiter les morts (${dead})`, { act: 'fellDead', size: 'sm', icon: ['item', 'wood'] }) : ''}</div></div>`,
        ],
        ['orchard', `<div class="orchard">${slots.map((sl, k) => spot(sl, k, nextLocked)).join('')}</div>`],
        ['cards', `<div class="orchard-cards">${lifeCards()}${orchardCards()}</div>`],
        [
            'hint',
            hint(
                dead
                    ? `${dead} arbre${dead > 1 ? 's sont morts' : ' est mort'} de vieillesse : touchez-le pour récupérer son bois, puis replantez.`
                    : `Touchez un arbre pour ramasser ses fruits, restez appuyé pour sa fiche. Après une centaine de fruits il vieillit, puis meurt et donne du bois.`,
            ),
        ],
    ]);
}
defineView('farm/orchard', renderOrchard);

// ---------------- planter ----------------
const shortDur = sec => (sec < 90 ? `${Math.round(sec)} s` : sec < 5400 ? `${Math.round(sec / 60)} min` : `${Math.round(sec / 360) / 10} h`);

defineSheet('plantTree', {
    title: 'Planter un arbre',
    render(o) {
        const k = +o.k,
            z = o.z || 'farm';
        const list = G.treeList(z).sort((a, b) => a.reqLvl - b.reqLvl);
        return `${cuttingsHtml(k, z)}<p class="card-sub center">Un arbre vit une centaine de fruits, puis donne du bois en mourant.</p>
            <div class="pick-grid trees">${list
                .map(d => {
                    const open = G.treeUnlocked(d),
                        stock = state.seeds[d.id] || 0;
                    const ok = open && (stock > 0 || state.money >= d.cost);
                    const fruitEvery = (d.time * ORCHARD.fruitRate) / G.speedMult();
                    return `<button class="pick-cell${open ? '' : ' locked'}${ok ? '' : ' short'}" data-act="plantTree" data-k="${k}" data-z="${z}" data-id="${d.id}" ${open ? '' : 'disabled'}>
                        <span class="pc-art">${art('plant', `${d.id}:2`)}</span><b>${d.seedName}</b>
                        ${
                            open
                                ? `<small>${ico(['item', d.id])}${fmt(G.sellPrice(d.id))}${ico(['ui', 'coin'])}</small><small>${ico(['ui', 'clock'])}1 fruit / ${shortDur(fruitEvery)}</small>
                        <span class="pc-cost">${stock > 0 ? `${stock} en stock` : `${fmt(d.cost)}${ico(['ui', 'coin'])}`}</span>`
                                : `<small class="lock-txt">${ico(['ui', 'lock'])}Niveau ${d.reqLvl}</small>`
                        }
                    </button>`;
                })
                .join('')}</div>`;
    },
});

// ---------------- la fiche d'un arbre ----------------
defineSheet('tree', {
    title: o => {
        const t = treeAt(o.z || 'farm', o.k);
        return t ? `${ico(['item', t.id])}${ITEMS[t.id].seedName}` : '';
    },
    render(o) {
        const k = +o.k,
            z = o.z || 'farm',
            t = treeAt(z, k);
        if (!t) return '<p class="empty">Cet emplacement est vide.</p>';
        const d = ITEMS[t.id],
            st = G.treeStage(t);
        const life = G.treeLife(t);
        const info = [];
        if (st === 'young') info.push([['ui', 'clock'], `Donnera ses premiers fruits dans ${formatDuration(G.treeLeft(t))}`]);
        else if (st !== 'dead') {
            info.push([
                ['item', t.id],
                `Un fruit environ toutes les ${formatDuration(G.fruitTime(t) / (G.treeRate(t) || 1))}${st === 'old' ? ' (il ralentit avec l’âge)' : ''}`,
            ]);
            info.push([
                ['ui', 'basket'],
                `${t.ground} / ${G.groundMax()} fruits au sol${G.groundFull(t) ? ' : il attend qu’on ramasse, et ses fruits pourrissent' : ''}`,
            ]);
        }
        info.push([
            ['ui', 'calendar'],
            `${t.drops} fruit${t.drops > 1 ? 's donnés' : ' donné'}${G.lifeMax(t) === Infinity ? ' : il ne vieillit jamais' : ` sur une vie d’environ ${Math.round(G.lifeMax(t))}`}`,
        ]);
        if (d.nord) {
            info.push([
                ['ui', 'noChaleur'],
                'Au Grand Nord : il pousse à plein régime près d’un poêle allumé ; ailleurs il va au tiers de sa vitesse, et dort la nuit de gel',
            ]);
        } else if (d.oasis) {
            info.push([
                ['ui', 'drop'],
                `À l’oasis : il boit ${String(OASIS.drink.tree).replace('.', ',')} litres par heure (sauf sol plein), et attend s’il n’y a plus d’eau`,
            ]);
        } else if (d.island) info.push([['ui', 'w_sun'], 'Sous les tropiques : pas d’hiver, il produit toute l’année']);
        else if (G.season().id === 'hiver') info.push([['ui', 'w_snow'], 'L’hiver, il dort à moitié']);
        else if (G.season().id === 'automne') info.push([['ui', 'w_cloudy'], 'L’automne, il produit 20 % plus vite']);
        const fellWood = st === 'dead' ? treeWood(d) : st === 'young' ? 0 : Math.round(treeWood(d) * ORCHARD.felledWood * life);
        return `<div class="tree-card">
            <div class="tree-art ${st}">${treeArt(t)}${groundHtml(t)}</div>
            <div class="animal-kind">${STAGE_NAME[st]}</div>
            ${st === 'dead' ? '' : `<div class="life"><span>Vie</span>${bar(life, `life-bar${life < 1 - ORCHARD.oldAt ? ' low' : ''}`)}</div>`}
            ${lines(info)}
            ${treeExtras(t, k, z)}
            <div class="row-btns">${
                st === 'dead'
                    ? btn(`Débiter en bois · +${fellWood}${ico(['item', 'wood'])}`, { act: 'fellTree', data: { k, z }, kind: 'gold', wide: true })
                    : `${btn(t.ground ? `Ramasser ${t.ground}${ico(['item', t.id])}` : 'Rien à ramasser', { act: 'pickTree', data: { k, z }, kind: t.ground ? 'green' : '', disabled: !t.ground })}${btn(fellWood ? `Abattre · +${fellWood}${ico(['item', 'wood'])}` : 'Arracher', { act: 'fellTree', data: { k, z }, kind: 'red' })}`
            }</div>
        </div>`;
    },
});

export function setupOrchard() {
    setupOrchard2();
    setupOrchard3();
    actions({
        buyOrchardSlot: (el, d) => {
            const z = d.z || 'farm';
            return askBuy(
                {
                    title:
                        z === 'island'
                            ? 'Agrandir le verger des îles'
                            : z === 'oasisV'
                              ? 'Agrandir le verger de l’oasis'
                              : z === 'nordV'
                                ? 'Agrandir le verger du Nord'
                                : 'Agrandir le verger',
                    icon: z === 'island' ? ['item', 'coconut'] : z === 'oasisV' ? ['item', 'date'] : z === 'nordV' ? ['item', 'spruce'] : ['item', 'apple'],
                    text: 'Une place de plus pour planter un arbre.',
                    cost: G.slotCost(z),
                    run: at => G.buySlot(at, z),
                },
                el,
            );
        },
        pickAllTrees: (el, d) => G.pickAllTrees(el, d.z || 'farm'),
        fellDead: (el, d) => G.fellDeadTrees(el, d.z || 'farm'),
        // un appui : ramasser, ou débiter un arbre mort ; l'appui long ouvre la fiche
        tree: (el, d) => {
            const z = d.z || 'farm',
                t = treeAt(z, +d.k);
            if (!t) return;
            if (G.treeStage(t) === 'dead') G.fellTree(+d.k, el, z);
            else if (t.ground) G.pickTree(+d.k, el, false, z);
            else openSheet('tree', { k: +d.k, z });
        },
        pickTree: (el, d) => G.pickTree(+d.k, anchorEl(anchorOf(d.z, d.k)) || el, false, d.z || 'farm'),
        plantTree: (el, d) => {
            if (G.plantTree(+d.k, d.id, anchorEl(anchorOf(d.z, d.k)) || el, d.z || 'farm')) closeSheet('plantTree');
        },
        fellTree: (el, d) => {
            const z = d.z || 'farm',
                t = treeAt(z, +d.k);
            if (!t) return;
            // un arbre vivant ne s'abat qu'au second appui
            if (G.treeStage(t) !== 'dead' && !confirmTap('fell' + z + d.k, el, 'Toucher encore pour confirmer')) return QUIET;
            if (G.fellTree(+d.k, anchorEl(anchorOf(z, d.k)) || el, z)) closeSheet('tree');
        },
    });
    const onLong = el => openSheet('tree', { k: +el.dataset.k, z: el.dataset.z || 'farm' });
    longPress(byId('view-farm'), '.o-spot[data-act="tree"]', onLong);
    longPress(byId('view-aside'), '.o-spot[data-act="tree"]', onLong);
    on('treeFx', ({ k, z, delay }) => {
        const el = anchorEl(anchorOf(z, k));
        if (!el) return;
        setTimeout(() => {
            const r = el.getBoundingClientRect();
            burstAt(r.left + r.width / 2, r.top + r.height * 0.6, 'sparkle', 5);
        }, delay || 0);
    });
}
