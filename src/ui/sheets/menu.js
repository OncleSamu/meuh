// Le menu (en haut à droite), les niveaux, l'almanach et la grange.
import { state, lvOk } from '../../core/state.js';
import { fmt } from '../../core/format.js';
import { ITEMS } from '../../data/items.js';
import { DAYS_PER_SEASON, WEATHER } from '../../data/world.js';
import { RARE } from '../../data/commerce.js';
import { MAX_LEVEL } from '../../data/progress.js';
import { NAT_LOG_IDS } from '../../data/nature.js';
import * as G from '../../systems/index.js';
import { actions, esc } from '../dom.js';
import { genWrap, looksText } from '../genlook.js';
import { flavorMini } from '../views/lab.js';
import { varRankChips } from '../genlook.js';
import { ico, art, qStar } from '../icons.js';
import { btn, navRow, lines, line, bar, dot } from '../kit.js';
import { go } from '../app.js';
import { toast } from '../../core/bus.js';
import { defineSheet, openSheet, closeSheet, closeAll, sheetOpts } from '../sheets.js';
import { produce } from '../navigate.js';
import { vaultCard } from './vault.js';

const COIN = () => ico(['ui', 'coin']);

// ---------------- les carnets ----------------
const natReady = () => G.natLogOpen() && NAT_LOG_IDS.some(id => G.natLogCan(id));
// 1.46.1 : le carnet de l'élevage rejoint les autres carnets
const BOOK_ROBES = () => G.BOOK_TYPES.reduce((n, t) => n + G.robeCount(t), 0);
const BOOK_PAIRS = () => Object.keys((state.herdbook && state.herdbook.pairs) || {}).length;
// 1.63.1 : le premier carnet s'ouvre au niveau 8 (l'élevage) : avant, pas de ligne vide dans le menu
const carnetsOpen = () => G.pondOpen() || G.natLogOpen() || G.compOpen() || G.logOpen() || G.robebookOpen();
const carnetsReady = () => (G.logReady() ? 1 : 0) + (G.tierReady() ? 1 : 0) + (natReady() ? 1 : 0);
defineSheet('carnets', {
    title: 'Carnets',
    render() {
        const row = (t, sheet, icon, sub, n) => navRow(t, 'open', { sheet }, icon, n ? dot(n) : '›', sub);
        if (!carnetsOpen())
            return '<p class="empty">Les carnets s’ouvrent au fil du jeu : l’élevage au niveau 8, la pêche et le potager au niveau 9, le verger, la forêt et la mine au niveau 20.</p>';
        return `<div class="menu-grid">
            ${G.pondOpen() ? row('Carnet de pêche', 'fishLog', ['ui', 'book'], 'Records de poids et médailles de taille') : ''}
            ${G.natLogOpen() ? row('Carnet du bûcheron et du mineur', 'natLog', ['item', 'ruby'], 'Paliers de bois, pierres et minerais', natReady() ? 1 : 0) : ''}
            ${G.compOpen() ? row('Carnet du potager', 'companions', ['ui', 'flowers'], `${G.seenCount()} associations découvertes`, G.tierReady() ? 1 : 0) : ''}
            ${G.logOpen() ? row('Carnet du verger', 'orchardLog', ['ui', 'orchardBook'], 'Une page par espèce, des médailles de fruits', G.logReady() ? 1 : 0) : ''}
            ${G.robebookOpen() ? row('Carnet de l’élevage', 'herdbook', ['ui', 'cpCarnet'], `${BOOK_ROBES()} robes trouvées${G.assocOpen() ? ` · ${BOOK_PAIRS()} associations au pré` : ''}`) : ''}
        </div>`;
    },
});

// ---------------- le menu ----------------
defineSheet('menu', {
    title: 'Menu',
    hub: true,
    render() {
        const pts = G.skillPoints(),
            book = G.bookAllClaimable() + G.quartersClaimable();
        // 1.73 : une grille de tuiles en trois groupes, qui tient sur un écran
        const tile = (name, sheet, icon, n = 0, sub = '') =>
            `<button class="mtile${n ? ' hot' : ''}" data-act="open" data-sheet="${sheet}" aria-label="${name}">${ico(icon, 'ico big')}<b>${name}</b>${sub ? `<small>${sub}</small>` : ''}${n ? dot(n) : ''}</button>`;
        const group = (title, tiles) => {
            const t = tiles.filter(Boolean);
            return t.length ? `<h4 class="mgroup">${title}</h4><div class="mtiles">${t.join('')}</div>` : '';
        };
        return (
            group('Ma ferme', [
                tile('Progrès', 'progress', ['ui', 'skillbook'], pts, pts ? `${pts} point${pts > 1 ? 's' : ''}` : 'Compétences'),
                tile('Niveaux', 'levels', ['ui', 'star'], 0, `Niveau ${state.level}`),
                tile('Mes bonus', 'bonus', ['ui', 'upgrade']),
                tile('Statistiques', 'stats', ['ui', 'chart']),
            ]) +
            group('Collections', [
                tile('Livre de la ferme', 'book', ['ui', 'book'], book),
                carnetsOpen() ? tile('Carnets', 'carnets', ['ui', 'cpCarnet'], carnetsReady()) : '',
                G.defiOpen() ? tile('La Coupe', 'cup', ['ui', 'cupRank' + G.cupRank()], 0, G.cupRankName()) : '',
                state.level >= 58 || G.caveLegends().length ? tile('Trophées', 'trophies', ['ui', 'cupGold']) : '',
                state.genetics && G.geneticsOpen() ? tile('Mes créations', 'creations', ['ui', 'flowers']) : '',
            ]) +
            group('Aide et réglages', [
                tile('Guide', 'guide', ['ui', 'info']),
                tile('Almanach', 'almanac', ['ui', G.season().icon], 0, G.season().name),
                tile('Réglages', 'settings', ['ui', 'gear']),
            ])
        );
    },
});

// ---------------- les niveaux ----------------
defineSheet('levels', {
    title: 'Les niveaux',
    cls: 'lv-sheet', // hauteur fixe : passer d'un niveau à l'autre ne fait pas sauter la fenêtre
    open(o) {
        o.l = Math.min(MAX_LEVEL, state.level + 1);
    },
    render(o) {
        const L = o.l;
        const status =
            L < state.level
                ? 'Déjà débloqué'
                : L === state.level
                  ? 'Votre niveau actuel'
                  : `Encore ${fmt(G.xpToLevel(L))} d’expérience${L === state.level + 1 ? '' : ` · ${L - state.level} niveaux`}`;
        const strip = Array.from({ length: MAX_LEVEL }, (_, k) => k + 1)
            .map(
                l =>
                    `<button class="lv-chip${l < state.level ? ' done' : l === state.level ? ' now' : ''}${l === L ? ' on" data-center="1' : ''}" data-act="lvPick" data-l="${l}">${l}</button>`,
            )
            .join('');
        return [
            [
                'nav',
                `<div class="lv-nav">${btn('', { act: 'lvStep', data: { d: -1 }, icon: ['ui', 'back'], disabled: L <= 1, title: 'Niveau précédent' })}<div class="lv-head"><b>Niveau ${L}</b><small>${status}</small></div>${btn('', { act: 'lvStep', data: { d: 1 }, icon: ['ui', 'next'], disabled: L >= MAX_LEVEL, title: 'Niveau suivant' })}</div>`,
            ],
            ['strip', `<div class="lv-strip">${strip}</div>`],
            [
                'list',
                `<div class="lines${L <= state.level ? ' got' : ''}">${G.unlocksAt(L)
                    // 1.42 : chaque ligne mène là où ça se passe
                    .map(u =>
                        u.go
                            ? `<button class="line lv-go${u.big ? ' big' : ''}" data-act="lvGo" data-to="${u.go}">${ico(u.icon)}<div>${u.name}</div><b class="lv-arrow">›</b></button>`
                            : line(u.icon, u.name, u.big ? 'big' : ''),
                    )
                    .join('')}</div>`,
            ],
        ];
    },
});

// ---------------- l'almanach ----------------
defineSheet('almanac', {
    title: 'Almanach',
    render() {
        const sv = G.season(),
            w = G.weather(),
            nw = WEATHER[state.nextWeather] || WEATHER.sun;
        const tomorrow = G.seasonOfDay(state.day + 1);
        const crops = G.seasonCrops(sv.id);
        return `<div class="alm-season">${ico(['ui', sv.icon], 'ico huge')}<div><div class="card-title">${sv.name}</div><div class="card-sub">Jour ${G.dayInSeason()} sur ${DAYS_PER_SEASON} · jour ${state.day} de la ferme</div></div></div>
            ${lines([
                [['ui', w.icon], `<b>Aujourd’hui : ${w.name}</b><div class="card-sub">${w.desc}</div>`],
                [
                    ['ui', nw.icon],
                    `<b>Demain : ${nw.name}</b>${tomorrow.id !== sv.id ? ` · début du ${tomorrow.name.toLowerCase()}` : ''}<div class="card-sub">${nw.desc}</div>`,
                ],
            ])}
            <h3 class="section-title"><span>De saison (pousse 30 % plus vite)</span></h3>
            <div class="alm-crops">${crops.map(c => `<div class="alm-crop${!lvOk(c) ? ' locked' : ''}">${art('item', c.id)}<span>${c.name}</span></div>`).join('') || '<span class="card-sub">Aucune culture</span>'}</div>
            ${navRow('Comment passe le temps ?', 'open', { sheet: 'guide', page: 'time' }, ['ui', 'clock'], '›', 'Heure de la ferme, minuteurs en temps réel, ferme qui continue : voir le Guide du fermier')}
            <p class="card-sub foot-note">${sv.id === 'hiver' ? 'En hiver, les cultures hors saison poussent presque deux fois moins vite et les arbres dorment à moitié.' : sv.id === 'automne' ? 'En automne, les arbres fruitiers produisent 20 % plus vite.' : 'Profitez-en pour planter ce qui est de saison.'}</p>`;
    },
});

// ---------------- la grange ----------------
defineSheet('barn', {
    title: `${ico(['ui', 'barn'])}Grange`,
    render(o) {
        const used = G.barnUsed(),
            cap = G.barnCap(),
            l = state.barn.lvl;
        const cost = G.barnUpCost(l);
        const goods = G.barnGoods();
        const sel = o.sel && state.inventory[o.sel] ? o.sel : null;
        let item = '';
        if (sel) {
            const it = ITEMS[sel],
                keep = G.reservedQty(sel),
                surplus = G.isLocked(sel) ? 0 : G.sellableQty(sel);
            const r = surplus ? G.sellBatch(sel, surplus, false) : { gain: 0 };
            const qq = G.qual(sel);
            const tiers = [
                [4, 'd', 'diamant'],
                [3, 'p', 'platine'],
                [2, 'g', 'or'],
                [1, 's', 'argent'],
            ];
            const nq = Math.min(state.inventory[sel], G.qCount(qq)),
                nplain = state.inventory[sel] - nq;
            const qrow = nq
                ? `<div class="barn-q"><span class="qchip big">&nbsp;×${nplain} ${nplain > 1 ? 'normaux' : 'normal'}</span>${tiers.map(([r, f, n]) => (qq[f] ? `<span class="qchip big">${qStar(r)}${qq[f]} ${n}</span>` : '')).join('')}</div>`
                : '';
            // 1.47 : les variétés du labo dans ce stock (elles partent en dernier)
            const vars = state.genetics ? G.varieties().filter(v => v.base === sel && (state.genetics.stock[v.id] || 0) > 0) : [];
            // 1.63 : les produits des races fixées (le lait d'une race…)
            const races = state.genetics ? Object.values(state.genetics.rv || {}).filter(v => v.base === sel && (state.genetics.stock[v.id] || 0) > 0) : [];
            const rrow = races
                .map(
                    v =>
                        `<div class="row barn-var"><span class="offer-art">${art('item', v.kind === 'honey' ? 'honey_' + v.honey : sel)}</span><span class="row-main"><span>${esc(G.varName(v))} ×${state.genetics.stock[v.id]}</span><small>${v.kind === 'honey' ? 'miel de fleur' : 'race fixée'} · vaut ×${String(Math.round(G.vdefMult(v) * 100) / 100).replace('.', ',')}</small>${varRankChips(v.id)}</span>${btn(`Vendre ${fmt(G.varietyValue(v))}${COIN()}`, { act: 'sellVariety', data: { id: v.id }, kind: 'gold', size: 'sm' })}</div>`,
                )
                .join('');
            const vrow =
                vars.length || races.length
                    ? `<div class="barn-vars"><div class="set-sub">${vars.length ? (races.length ? 'Dont vos variétés et vos races' : 'Dont vos variétés') : races.every(v => v.kind === 'honey') ? 'Dont vos miels de fleurs' : 'Dont vos races'}</div>${rrow}${vars
                          .map(
                              v =>
                                  `<button class="row barn-var" data-act="open" data-sheet="variety" data-id="${v.id}"><span class="offer-art">${genWrap(art('item', sel), v.g)}</span><span class="row-main"><span>${esc(G.varName(v))} ×${state.genetics.stock[v.id]}</span><small>${[looksText(v.g).replace(/^Normale(, )?/, ''), v.fixed ? 'variété fixée' : `génération ${v.gen || 1}`].filter(Boolean).join(' · ')}</small>${varRankChips(v.id)}</span>${flavorMini(v.g)}</button>`,
                          )
                          .join('')}</div>`
                    : '';
            item = `<div class="card barn-item"><div class="card-head">${ico(['item', sel], 'ico big')}<div class="card-main"><div class="card-title">${it.name} ×${state.inventory[sel]}</div>
                <div class="card-sub">${keep ? `${keep} gardé${keep > 1 ? 's' : ''} pour les commandes · ` : ''}${G.isLocked(sel) ? 'verrouillé : jamais vendu' : `surplus : ${surplus}`}</div></div></div>
                ${qrow}${vrow}<div class="row-btns">${btn(G.isLocked(sel) ? 'Déverrouiller' : 'Verrouiller', { act: 'lock', data: { id: sel }, size: 'sm', icon: ['ui', 'lock'] })}
                ${surplus && !G.challengeOn('noMarket') ? btn(`Grossiste +${fmt(r.gain)}${COIN()}`, { act: 'barnSell', data: { id: sel }, kind: 'gold', size: 'sm' }) : ''}
                ${surplus && it.sell ? btn('À l’étal', { act: 'barnStall', data: { id: sel }, kind: 'green', size: 'sm' }) : ''}
                ${G.vaultOpen() ? btn('Au coffre', { act: 'vaultAdd', data: { id: sel }, size: 'sm', icon: ['ui', 'vault'] }) : ''}
                ${btn('Produire', { act: 'produce', data: { id: sel }, size: 'sm' })}</div></div>`;
        }
        const can = G.canUpgradeBarn();
        return [
            ['meter', `<div class="barn-meter">${bar(used / cap, used >= cap ? 'red' : '')}<b>${used} / ${cap}</b></div>`],
            [
                'goods',
                `<div class="barn-goods">${
                    goods.length
                        ? goods
                              .map(
                                  id =>
                                      `<button class="bgood${sel === id ? ' sel' : ''}" data-act="barnSel" data-id="${id}" title="${ITEMS[id].name}">${ico(['item', id])}<b>${state.inventory[id]}</b>${G.isLocked(id) ? `<i class="lk">${art('ui', 'lock')}</i>` : ''}</button>`,
                              )
                              .join('')
                        : '<p class="empty">La grange est vide.</p>'
                }</div>`,
            ],
            [
                'item',
                item ||
                    (goods.length
                        ? '<p class="card-sub center">Touchez un produit pour le vendre, le mettre à l’étal, le verrouiller ou aller en produire.</p>'
                        : ''),
            ],
            ['vault', vaultCard()],
            [
                'up',
                `<div class="card barn-up"><div class="card-title">Agrandir la grange · niveau ${l + 2}</div>
                <div class="card-sub">+${G.barnCapAt(l + 1) - G.barnCapAt(l)} places. Les planches, clous et pots de peinture se trouvent en récoltant, en ramassant, à l’atelier, dans les livraisons et chez le marchand ambulant.</div>
                <div class="rare-row">${RARE.map(id => `<div class="rare-chip${state.inventory[id] >= cost[id] ? ' ok' : ''}">${ico(['item', id])}<b>${state.inventory[id]}</b><small>/ ${cost[id]}</small><span>${ITEMS[id].name}</span></div>`).join('')}</div>
                <div class="card-sub">Autres matériaux : ${ico(['item', 'wood'])} ${state.inventory.wood} bois, ${ico(['item', 'stone'])} ${state.inventory.stone} pierre</div>
                ${btn(`Agrandir · ${fmt(cost.coins)}${COIN()}`, { act: 'upgradeBarn', kind: can ? 'gold' : '', wide: true, disabled: !can })}</div>`,
            ],
            ['hint', '<p class="hint">Les graines, la nourriture, le compost et les matériaux ne prennent pas de place.</p>'],
        ];
    },
    foot: () => btn('Aller au marché', { act: 'barnMarket', wide: true, icon: ['ui', 'crate'] }),
});

// la liste d'un nouveau niveau repart du haut
const lvTop = () => {
    const el = document.querySelector('.lv-sheet [data-key="list"]');
    if (el) el.scrollTop = 0;
};

export function setupMenu() {
    actions({
        lvGo: (el, d) => {
            const to = d.to;
            closeAll();
            if (to.startsWith('produce:')) return produce(to.slice(8));
            go(to);
        },
        lvStep: (el, d) => {
            const o = sheetOpts('levels');
            o.l = Math.max(1, Math.min(MAX_LEVEL, o.l + +d.d));
            lvTop();
        },
        lvPick: (el, d) => {
            sheetOpts('levels').l = +d.l;
            lvTop();
        },
        barnSel: (el, d) => {
            const o = sheetOpts('barn');
            o.sel = o.sel === d.id ? null : d.id;
        },
        lock: (el, d) => G.toggleLock(d.id),
        barnSell: (el, d) => G.sellFromBarn(d.id, el),
        barnStall: (el, d) => {
            G.ensureStall();
            const k = G.stallFree();
            if (k < 0) return toast('L’étal est plein : encaissez ou attendez une vente', ['ui', 'stall']);
            closeSheet('barn');
            go('market/sell');
            openSheet('stall', { k, id: d.id });
        },
        upgradeBarn: el => G.upgradeBarn(el),
        barnMarket: () => {
            closeSheet('barn');
            go('market/sell');
        },
    });
}
