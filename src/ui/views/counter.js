// Atelier | Comptoir (1.17) : le salon (les clients du village), l'atelier (préparer et mettre en stock) et le bâtiment.
import { state } from '../../core/state.js';

import { fmt } from '../../core/format.js';
import { ITEMS } from '../../data/items.js';
import { MACHINES, RECIPES } from '../../data/machines.js';
import { toast } from '../../core/bus.js';
import { VILLAGERS } from '../../data/village.js';
import { BREW, CLIENT, DECORS, DECOR_COST, DECOR_PATIENCE } from '../../data/counter.js';
import * as G from '../../systems/index.js';
import { blocks, actions } from '../dom.js';
import { ico, art } from '../icons.js';
import { btn, bar, hint, segmented, section, hearts, costRow } from '../kit.js';
import { defineView, defineLive, ui } from '../app.js';
import { openBrew } from '../brew.js';

const tab = () => ui.sel.counterTab || 'salon';
const COIN = () => ico(['ui', 'coin']);

defineLive('seat', i => {
    const s = G.counterSeats()[i];
    return s ? Math.max(0, s.left / G.patienceMax()) : 0;
});

function closedCard() {
    const lock = state.level < MACHINES.counter.reqLvl;
    return `<div class="card island-closed">
        <div class="ic-art">${art('machine', 'counter')}</div>
        <div class="card-title">Le Comptoir</div>
        <p class="card-sub">${
            lock
                ? `Au niveau ${MACHINES.counter.reqLvl}, le comptoir s’ouvre au marché : thés et cafés faits à la main, pour vos commandes, le train et les clients du village.`
                : 'Achetez le comptoir au marché : il remplace le salon de thé et la brûlerie, et vous préparez chaque boisson vous-même.'
        }</p>
        ${lock ? '' : btn('Aller au marché', { act: 'go', data: { path: 'market/shop' }, kind: 'gold', wide: true, icon: ['ui', 'coin'] })}
    </div>`;
}

const stockQ = id => {
    const q = state.quality[id] || { s: 0, g: 0 };
    return q.g + (q.p || 0) + (q.d || 0) > 0 ? 3 : q.s > 0 ? 2 : 1;
};

// ---------------- le salon ----------------
function seatCard(s, i) {
    const v = VILLAGERS[s.drink && s.vid];
    const have = state.inventory[s.drink] || 0;
    const ok = G.counterCanBrew(s.drink);
    const fav = G.counterFavorite(s.vid) === s.drink;
    const price = Math.round(G.sellPrice(s.drink) * CLIENT.premium * (1 + CLIENT.heart * G.heartsOf(s.vid)));
    return `<div class="cseat">
        <div class="avatar sm">${art('villager', s.vid)}</div>
        <div class="card-main">
            <div class="cs-name"><b>${v.name}</b>${hearts(G.heartsOf(s.vid))}${fav ? `<span class="cs-fav" title="Sa boisson préférée">${ico(['ui', 'heart'])}</span>` : ''}</div>
            <div class="cs-order">${ico(['item', s.drink])}<span>${ITEMS[s.drink].name}</span></div>
            ${bar(0, 'thin cs-pat', `seat:${i}`)}
            <small>${fmt(price)} ${COIN()} à 1 étoile, plus avec une belle note</small>
            <div class="cs-acts">
                ${btn('Préparer', { act: 'seatBrew', data: { id: s.drink, vid: s.vid }, kind: 'gold', size: 'sm', disabled: !ok, icon: ['ui', 'clock'] })}
                ${have ? btn(`Du stock ×${have}`, { act: 'seatStock', data: { i }, kind: 'green', size: 'sm' }) : ''}
                ${btn('', { act: 'seatAway', data: { i }, size: 'sm', icon: ['ui', 'cross'], kind: 'ghost', title: 'Renvoyer' })}
            </div>
            ${ok || have ? '' : `<small class="short">${G.canCook(s.drink) ? 'Le comptoir se repose…' : `Il manque ${G.missingFor(s.drink).join(', ')}`}</small>`}
        </div></div>`;
}
function salonHtml() {
    const C = G.ensureCounter(),
        d = G.salonDef();
    const seats = C.seats;
    const rows = seats.map(seatCard);
    for (let k = seats.length; k < d.seats; k++) rows.push('<div class="cseat empty"><span>Place libre. Un client arrive bientôt.</span></div>');
    return `<div class="card"><div class="card-main">
        <div class="card-title">Salon · ${d.seats} places</div>
        <div class="card-sub">Clients servis aujourd’hui : ${C.served}/${CLIENT.daily(C.lvl)} · pourboires ${C.tips}/${CLIENT.tipMax}</div></div></div>
        ${rows.join('')}
        ${hint('Les clients n’arrivent et ne patientent que lorsque vous êtes ici. Un client paie plus que le marché ; une belle note et les cœurs d’amitié augmentent le prix.')}`;
}

// ---------------- l'atelier ----------------
// Famille d'une boisson : café (on moud), thé (du thé dans la recette), sinon tisane, lait ou kvas.
function drinkKind(r) {
    if (BREW[r.id].st.some(x => x[0] === 'grind')) return 'coffee';
    return r.ing.tea > 0 ? 'tea' : 'other';
}
function atelierHtml() {
    const kind = ui.sel.counterKind || 'all';
    const list = G.counterRecipes()
        .filter(r => kind === 'all' || drinkKind(r) === kind)
        .sort((a, b) => G.recipeUnlocked(b.id) - G.recipeUnlocked(a.id) || a.lvl - b.lvl);
    const filters = [
        ['all', 'Toutes'],
        ['tea', 'Thés'],
        ['coffee', 'Cafés'],
        ['other', 'Tisanes, laits…'],
    ];
    const tiles = list
        .map(r => {
            const open = G.recipeUnlocked(r.id),
                ok = open && G.canCook(r.id);
            const ings = Object.entries(r.ing)
                .map(([k, n]) => `<span class="ing${state.inventory[k] >= n ? ' ok' : ''}">${ico(['item', k])}${Math.min(state.inventory[k], n)}/${n}</span>`)
                .join('');
            const n = state.inventory[r.id] || 0;
            return `<button class="rtile${open ? (ok ? ' ok' : ' short') : ' locked'}" data-act="brewStock" data-id="${r.id}">
                <span class="rt-art">${art('item', r.id)}${n ? `<em>×${n}</em>` : ''}</span>
                <b>${ITEMS[r.id].name}</b>
                ${open ? `<span class="ings">${ings}</span><small>${fmt(ITEMS[r.id].sell)}${COIN()}${n ? ` · en stock ${'★'.repeat(stockQ(r.id))}` : ''}</small>` : `<small class="lock-txt">${ico(['ui', 'lock'])}${G.recipeLockText(r)}</small>`}
            </button>`;
        })
        .join('');
    return `<div class="chips-row">${filters.map(([k, t]) => `<button class="pick-chip${kind === k ? ' on' : ''}" data-act="counterKind" data-f="${k}">${t}</button>`).join('')}</div>
        <div class="recipe-grid">${tiles}</div>
        ${hint('Chaque boisson se prépare au doigt : plus la note est belle, meilleure est la qualité (argent, or), et le stock sert aux commandes, au train et aux quêtes.')}`;
}

// ---------------- le bâtiment ----------------
function batHtml() {
    const C = G.ensureCounter(),
        d = G.salonDef(),
        n = G.salonNext();
    const up = n
        ? `<div class="card"><div class="card-main"><div class="card-title">Agrandir le salon</div>
            <div class="card-sub">${n.seats} places, un client toutes les ${n.every} s environ</div>
            ${costRow(G.costParts(n.cost))}</div>
            <div class="card-side">${btn('Agrandir', { act: 'upSalon', kind: 'green', disabled: !G.salonCanUp() })}</div></div>`
        : '<div class="card"><div class="card-main"><div class="card-sub">Le salon est au maximum.</div></div></div>';
    const decors = Object.entries(DECORS)
        .map(
            ([k, name]) =>
                `<button class="pick-chip${C.decor[k] ? ' on' : ''}" data-act="buyDecor" data-id="${k}" ${C.decor[k] ? 'disabled' : ''}>${name}${C.decor[k] ? '' : ` · ${fmt(DECOR_COST[k])}`}</button>`,
        )
        .join('');
    return `<div class="card"><div class="card-art">${art('machine', 'counter')}</div><div class="card-main">
        <div class="card-title">Salon · niveau ${C.lvl + 1}</div>
        <div class="card-sub">${d.seats} places · un client toutes les ${d.every} s</div>
        <div class="card-sub">Patience : +${Math.round(DECOR_PATIENCE * 100 * Math.min(3, G.decorCount()))} % grâce aux décors</div></div></div>
        ${up}
        ${section('Décors')}
        <div class="chips-row wrap">${decors}</div>
        ${hint(`Chaque décor posé rend les clients plus patients (+${Math.round(DECOR_PATIENCE * 100)} %, jusqu’à 3 décors).`)}`;
}

function renderCounter(el) {
    if (!G.counterOwned()) return blocks(el, [['closed', closedCard()]]);
    const t = tab();
    blocks(el, [
        [
            'seg',
            segmented(
                [
                    ['salon', 'Salon', ['ui', 'heart']],
                    ['atelier', 'Recettes', ['machine', 'counter']],
                    ['bat', 'Bâtiment', ['ui', 'gear']],
                ],
                t,
                'counterTab',
            ),
        ],
        ['body', t === 'salon' ? salonHtml() : t === 'atelier' ? atelierHtml() : batHtml()],
    ]);
}
defineView('machines/counter', renderCounter);

export function setupCounter() {
    actions({
        counterTab: (el, d) => (ui.sel.counterTab = d.v),
        counterKind: (el, d) => (ui.sel.counterKind = d.f),
        brewStock: (el, d) => {
            if (!G.recipeUnlocked(d.id)) return toast(G.recipeLockText(RECIPES[d.id]), ['ui', 'lock']);
            openBrew(d.id, null);
        },
        seatBrew: (el, d) => openBrew(d.id, d.vid),
        seatStock: (el, d) => G.counterServe(+d.i, el),
        seatAway: (el, d) => G.counterSendAway(+d.i),
        upSalon: () => G.upgradeSalon(),
        buyDecor: (el, d) => G.buyDecor(d.id),
    });
}
