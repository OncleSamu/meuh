// Atelier | Comptoir (1.17) : le salon (les clients du village), l'atelier (préparer et mettre en stock) et le bâtiment.
import { state } from '../../core/state.js';

import { fmt } from '../../core/format.js';
import { ITEMS } from '../../data/items.js';
import { MACHINES, RECIPES } from '../../data/machines.js';
import { toast } from '../../core/bus.js';
import { VILLAGERS } from '../../data/village.js';
import { BREW, CLIENT, DECORS, DECOR_COST, DECOR_PATIENCE, SALON, FAVORITE, CARTE } from '../../data/counter.js';
import { salonScene } from '../../art/village/salon.js';
import * as G from '../../systems/index.js';
import { blocks, actions } from '../dom.js';
import { ico, art, qStar } from '../icons.js';
import { QUALITY } from '../../data/farm.js';
import { btn, bar, hint, segmented, section, hearts, costRow } from '../kit.js';
import { defineView, defineLive, ui } from '../app.js';
import { openBrew } from '../brew.js';
import { openSheet, defineSheet } from '../sheets.js';
import { page, searchBox, queryOf, matchQ } from '../pager.js';

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

// 1.63.2 : le meilleur rang en stock (0 normal à 4 diamant) : c'est celui qui part d'abord chez un client
const stockQ = id => {
    const q = state.quality[id] || {};
    return q.d > 0 ? 4 : q.p > 0 ? 3 : q.g > 0 ? 2 : q.s > 0 ? 1 : 0;
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
                ${have ? btn(`Du stock ×${have}${stockQ(s.drink) ? ` ${qStar(stockQ(s.drink))}` : ''}`, { act: 'seatStock', data: { i }, kind: 'green', size: 'sm' }) : ''}
                ${btn('', { act: 'seatAway', data: { i }, size: 'sm', icon: ['ui', 'cross'], kind: 'ghost', title: 'Renvoyer' })}
            </div>
            ${ok || have ? '' : G.canCook(s.drink) ? '<small class="short">Le comptoir se repose…</small>' : `<button class="short link" data-act="needs" data-id="${s.drink}">Il manque ${G.missingFor(s.drink).join(', ')} ›</button>`}
        </div></div>`;
}
// 1.118 : la carte du salon
const fansOf = id => Object.keys(FAVORITE).filter(v => FAVORITE[v] === id && (G.ensureCounter().favs || {})[v]);
function carteHtml() {
    const carte = G.counterCarte();
    const cells = carte
        .map(id => {
            const fans = fansOf(id);
            return `<button class="carte-item" data-act="carteToggle" data-id="${id}" aria-label="Retirer ${ITEMS[id].name} de la carte">${ico(['item', id], 'ico big')}<b>${ITEMS[id].name}</b><small>×${state.inventory[id] || 0}${fans.length ? ` · ♥ ${fans.length}` : ''}</small></button>`;
        })
        .join('');
    return `<div class="card carte-card"><div class="cut-row"><div><div class="card-title">La carte du salon · ${carte.length}/${CARTE.max}</div><div class="card-sub">${
        carte.length ? `Les clients y commandent surtout, et la paient ${Math.round(CARTE.pay * 100)} % plus cher.` : 'Choisissez jusqu’à quatre boissons : les clients les commanderont surtout, et les habitués viendront pour leur préférée.'
    }</div></div>${btn(carte.length ? 'Changer' : 'Composer', { act: 'open', data: { sheet: 'carte' }, size: 'sm' })}</div>${carte.length ? `<div class="carte-items">${cells}</div>` : ''}</div>`;
}
defineSheet('carte', {
    title: 'La carte du salon',
    render() {
        const carte = G.counterCarte();
        const all = G.counterRecipes()
            .filter(r => G.recipeUnlocked(r.id))
            .map(r => r.id)
            .sort((a, b) => carte.includes(b) - carte.includes(a) || fansOf(b).length - fansOf(a).length || (state.inventory[b] || 0) - (state.inventory[a] || 0) || ITEMS[a].name.localeCompare(ITEMS[b].name, 'fr'));
        return `${hint(`Touchez une boisson pour l’ajouter à la carte ou l’en retirer (quatre au plus). Un ♥ : la boisson préférée d’un habitué que vous connaissez.`)}<div class="pick-grid">${all
            .map(id => {
                const on = carte.includes(id),
                    fans = fansOf(id);
                return `<button class="pick-cell${on ? ' on' : ''}" data-act="carteToggle" data-id="${id}"${!on && carte.length >= CARTE.max ? ' disabled' : ''}>${ico(['item', id], 'ico big')}<b>${ITEMS[id].name}</b><small>×${state.inventory[id] || 0}${fans.length ? ` · ♥ ${fans.map(v => VILLAGERS[v].name).join(', ')}` : ''}</small></button>`;
            })
            .join('')}</div>`;
    },
});
function salonHtml() {
    const C = G.ensureCounter(),
        d = G.salonDef();
    const seats = C.seats;
    const rows = seats.map(seatCard);
    for (let k = seats.length; k < d.seats; k++) rows.push('<div class="cseat empty"><span>Place libre. Un client arrive bientôt.</span></div>');
    return `<div class="card"><div class="card-main">
        <div class="card-title">Salon · ${d.seats} places</div>
        <div class="card-sub">Clients servis aujourd’hui : ${C.served}/${CLIENT.daily(C.lvl)} · pourboires ${C.tips}/${CLIENT.tipMax}</div></div></div>
        ${carteHtml()}
        ${rows.join('')}
        ${hint('Les clients ne s’impatientent que lorsque vous êtes ici ; pendant votre absence, trois au plus s’installent et vous attendent. Un client paie plus que le marché ; une belle note et les cœurs d’amitié augmentent le prix.')}`;
}

// ---------------- l'atelier ----------------
// Famille d'une boisson : café (on moud), thé (du thé dans la recette), sinon tisane, lait ou kvas.
function drinkKind(r) {
    if (BREW[r.id].st.some(x => x[0] === 'grind')) return 'coffee';
    return r.ing.tea > 0 ? 'tea' : 'other';
}
// 1.76 : des lignes compactes par pages de 15, un filtre « Prêtes » ouvert d'abord, les boissons attendues en tête
function atelierBlocks() {
    const all = G.counterRecipes();
    const ready = r => G.recipeUnlocked(r.id) && G.canCook(r.id);
    const waiting = {};
    G.counterSeats().forEach(s => (waiting[s.drink] = waiting[s.drink] || s.vid));
    const filters = [
        ['ready', 'Prêtes', all.filter(ready).length],
        ['all', 'Toutes', all.length],
        ['tea', 'Thés', all.filter(r => drinkKind(r) === 'tea').length],
        ['coffee', 'Cafés', all.filter(r => drinkKind(r) === 'coffee').length],
        ['other', 'Tisanes, laits', all.filter(r => drinkKind(r) === 'other').length],
    ];
    let kind = ui.sel.counterKind || (filters[0][2] ? 'ready' : 'all');
    if (kind === 'ready' && !filters[0][2]) kind = 'all';
    const q = queryOf('counterR');
    const list = all
        .filter(r => (kind === 'all' ? true : kind === 'ready' ? ready(r) : drinkKind(r) === kind))
        .filter(r => matchQ(q, ITEMS[r.id].name, ...Object.keys(r.ing).map(k => (ITEMS[k] ? ITEMS[k].name : k))))
        .sort((a, b) => !!waiting[b.id] - !!waiting[a.id] || G.recipeUnlocked(b.id) - G.recipeUnlocked(a.id) || ready(b) - ready(a) || a.lvl - b.lvl);
    const pg = page('counterR:' + kind, list, 15);
    const rows = pg.items
        .map(r => {
            const open = G.recipeUnlocked(r.id),
                ok = open && G.canCook(r.id),
                n = state.inventory[r.id] || 0,
                who = waiting[r.id];
            if (!open)
                return `<div class="srow drow locked"><span class="srow-art">${art('item', r.id)}</span><div class="srow-main"><b>${ITEMS[r.id].name}</b><small>${ico(['ui', 'lock'])}${G.recipeLockText(r)}</small></div></div>`;
            const ings = Object.entries(r.ing)
                .map(
                    ([k, m]) =>
                        `<span class="${state.inventory[k] >= m ? 'in' : 'miss'}">${ico(['item', k])}${Math.min(state.inventory[k] || 0, m)}/${m}</span>`,
                )
                .join('');
            const pv = ok && state.genetics && state.genetics.bestFirst ? G.previewBatch(r.id) : null;
            const sq = n ? stockQ(r.id) : 0;
            return `<div class="srow drow${ok ? ' ok' : ' short'}${who ? ' wanted' : ''}">
                <span class="srow-art">${art('item', r.id)}${n ? `<em>×${n}</em>` : ''}</span>
                <div class="srow-main"><b>${ITEMS[r.id].name}</b>${who ? `<span class="want">${ico(['villager', who])}${VILLAGERS[who].name.split(' ').pop()} l’attend</span>` : ''}
                    <small>${ings}</small>
                    <small>${fmt(ITEMS[r.id].sell)}${COIN()}${pv && pv.q ? ` · au moins ${qStar(pv.q)}` : ''}${sq ? ` · stock jusqu’en ${QUALITY[sq].name}` : ''}</small></div>
                <div class="srow-btns">${btn(ok ? 'Préparer' : 'Il manque', who && ok ? { act: 'seatBrew', data: { id: r.id, vid: who }, kind: 'gold', size: 'sm' } : { act: 'brewStock', data: { id: r.id }, kind: ok ? 'green' : '', size: 'sm' })}</div>
            </div>`;
        })
        .join('');
    return [
        [
            'filters',
            `<div class="chips-row wrap">${filters
                .filter(f => f[2] || f[0] === kind)
                .map(([k, t, c]) => `<button class="pick-chip${kind === k ? ' on' : ''}" data-act="counterKind" data-f="${k}">${t}<small>${c}</small></button>`)
                .join('')}</div>`,
        ],
        ['search', all.length > 20 ? searchBox('counterR', 'Boisson ou ingrédient') : ''],
        ['list', `${pg.top}<div class="drows">${rows || '<p class="empty">Aucune boisson ici.</p>'}</div>${pg.more}`],
        [
            'hint',
            hint(
                'Chaque boisson se prépare au doigt : plus la note est belle, meilleure est la qualité. Des ingrédients en platine ou en diamant donnent une boisson de ce rang.',
            ),
        ],
    ];
}

// ---------------- le bâtiment ----------------
// 1.76 : le salon dessiné (il grandit et se décore), ses quatre niveaux, les décors en cartes, le carnet du salon
const DECOR_ICON = { plant: 'decoPlant', lamp: 'decoLamp', rug: 'decoRug', garland: 'decoGarland', sign: 'decoSign' };
function batHtml() {
    const C = G.ensureCounter(),
        n = G.salonNext();
    const up = n
        ? `<div class="salon-up">${costRow(G.costParts(n.cost))}${btn(`Agrandir : ${n.seats} places`, { act: 'upSalon', kind: 'green', size: 'sm', disabled: !G.salonCanUp() })}</div>`
        : '';
    const levels = SALON.map(
        (l, k) =>
            `<div class="hlvl${k <= C.lvl ? ' on' : ''}"><b>${k + 1}</b><span>${l.seats} places · un client toutes les ${l.every} s</span>${k <= C.lvl ? ico(['ui', 'check']) : ''}</div>`,
    ).join('');
    const decors = Object.entries(DECORS)
        .map(([k, name]) => {
            const own = !!C.decor[k];
            return `<div class="deco-card${own ? ' own' : ''}"><span class="dc-art">${art('ui', DECOR_ICON[k])}</span><b>${name}</b><small>+${Math.round(DECOR_PATIENCE * 100)} % de patience</small>${
                own
                    ? `<span class="chip ok">${ico(['ui', 'check'])}posé</span>`
                    : btn(`${fmt(DECOR_COST[k])}${COIN()}`, {
                          act: 'buyDecor',
                          data: { id: k },
                          kind: state.money >= DECOR_COST[k] ? 'gold' : '',
                          size: 'sm',
                          disabled: state.money < DECOR_COST[k],
                      })
            }</div>`;
        })
        .join('');
    const favs = C.favs || {};
    const fav = Object.keys(FAVORITE)
        .filter(v => VILLAGERS[v])
        .map(
            v =>
                `<span class="fav${favs[v] ? ' on' : ''}" title="${VILLAGERS[v].name}${favs[v] ? ` : ${ITEMS[FAVORITE[v]].name}` : ''}"><i>${art('villager', v)}</i>${favs[v] ? `<em>${art('item', FAVORITE[v])}</em>` : '<em class="q">?</em>'}</span>`,
        )
        .join('');
    const nf = Object.keys(favs).length;
    return `<div class="salon-art">${salonScene(C.lvl, C.decor)}</div>
        <div class="card salon-lv"><div class="card-title">Salon niveau ${C.lvl + 1} · patience +${Math.round(DECOR_PATIENCE * 100 * G.decorCount())} %</div>
        <div class="hlevels">${levels}</div>${up}</div>
        ${section('Décors', `<small>${G.decorCount()} / ${Object.keys(DECORS).length}</small>`)}
        <div class="deco-grid">${decors}</div>
        ${section('Le carnet du salon')}
        <div class="card salon-book"><div class="tiles">${[
            [fmt(C.total || 0), 'clients servis'],
            [fmt(C.bestStreak || 0), 'meilleure série parfaite'],
            [fmt(state.stats.perfectDrinks || 0), 'boissons parfaites'],
        ]
            .map(([v, l]) => `<div class="tile"><b>${v}</b><span>${l}</span></div>`)
            .join('')}</div>
        <div class="card-sub">Boissons préférées découvertes : ${nf} / ${Object.keys(FAVORITE).length}. Servez à chacun sa préférée pour la révéler.</div>
        <div class="fav-grid">${fav}</div></div>`;
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
        ...(t === 'atelier' ? atelierBlocks() : [['body', t === 'salon' ? salonHtml() : batHtml()]]),
    ]);
}
defineView('machines/counter', renderCounter);

export function setupCounter() {
    actions({
        counterTab: (el, d) => {
            ui.sel.counterTab = d.v;
            if (d.v === 'bat') G.tip('salonBook');
        },
        counterKind: (el, d) => (ui.sel.counterKind = d.f),
        brewStock: (el, d) => {
            if (!G.recipeUnlocked(d.id)) return toast(G.recipeLockText(RECIPES[d.id]), ['ui', 'lock']);
            if (!G.canCook(d.id)) return openSheet('needs', { id: d.id });
            openBrew(d.id, null);
        },
        seatBrew: (el, d) => (G.canCook(d.id) ? openBrew(d.id, d.vid) : openSheet('needs', { id: d.id })),
        seatStock: (el, d) => G.counterServe(+d.i, el),
        seatAway: (el, d) => G.counterSendAway(+d.i),
        upSalon: () => G.upgradeSalon(),
        buyDecor: (el, d) => G.buyDecor(d.id),
        carteToggle: (el, d) => G.toggleCarte(d.id),
    });
}
