// Marché | Acheter (le magasin) et Marché | Vendre (l'étal et le grossiste).
import { nightMarketCard } from '../night.js';
import { state, lvOk } from '../../core/state.js';
import { fmt, formatDuration } from '../../core/format.js';
import { ITEMS } from '../../data/items.js';
import { ANIMALS } from '../../data/animals.js';
import { MACHINES } from '../../data/machines.js';
import { UPGRADES, DECOS, DOG, SOILS } from '../../data/farm.js';
import { SEASONS } from '../../data/world.js';
import * as G from '../../systems/index.js';
import { blocks, actions, esc, QUIET } from '../dom.js';
import { ico, art, qStar } from '../icons.js';
import { btn, card, chip, hint, section, empty, toggle, pips, timer } from '../kit.js';
import { defineView, ui } from '../app.js';
import { defineSheet, closeSheet, sheetOpts } from '../sheets.js';
import { pinBar } from './common.js';
import { askBuy } from '../sheets/askbuy.js';

const COIN = () => ico(['ui', 'coin']);
const matChips = m =>
    m
        ? Object.entries(m)
              .map(([k, n]) => `<span class="mat${state.inventory[k] >= n ? '' : ' short'}">${art('item', k)}${n}</span>`)
              .join('')
        : '';
const meta = (icon, text, cls = '') => chip(text, icon, `meta ${cls}`);

// un bouton d'achat : quantité, prix, matériaux
function buyBtn(type, id, qty, unit, locked) {
    const total = unit * qty,
        m = G.matCost(type, id);
    const ok = !locked && G.canBuy(type, id, qty);
    return btn(`${qty > 1 ? `<i class="qty-tag">×${qty}</i>` : ''}${fmt(total)}${COIN()}${matChips(m)}`, {
        act: 'buy',
        data: { type, id, qty },
        kind: 'green',
        size: 'sm',
        disabled: !ok,
    });
}
const shopCard = (icon, title, sub, side, locked, req) =>
    card({
        cls: 'shop',
        art: icon,
        title,
        sub: locked ? (typeof req === 'string' ? req : `Débloqué au niveau ${req}`) : sub,
        side: locked ? '' : side,
        locked,
    });

// ---------------- catégories du magasin ----------------
function seeds() {
    const sm = G.speedMult();
    return G.seedList()
        .filter(i => !i.exotic)
        .map(i => {
            const locked = !lvOk(i) || !G.storyOk(i);
            const season = i.seasons
                ? meta(
                      ['ui', SEASONS.find(sv => sv.id === i.seasons[0]).icon],
                      G.isInSeason(i.id) ? 'de saison' : G.seasonNames(i.seasons).toLowerCase(),
                      G.isInSeason(i.id) ? 'now' : '',
                  )
                : '';
            const soil = G.soilOfCrop(i.id);
            const sub =
                i.type === 'crop'
                    ? [
                          meta(['ui', 'clock'], formatDuration(i.time / sm)),
                          meta(['ui', 'coin'], `${G.sellPrice(i.id)} la récolte`),
                          season,
                          soil ? meta(['ui', SOILS[soil].icon], SOILS[soil].name.toLowerCase()) : '',
                          state.seeds[i.id] ? meta(null, `${state.seeds[i.id]} en stock`, 'stock') : '',
                          i.ghOnly ? meta(['ui', 'greenhouse'], 'serre seulement') : '',
                      ].join('')
                    : [
                          meta(['ui', 'clock'], `adulte en ${formatDuration(i.time / sm)}, puis 1 fruit / ${formatDuration(i.time / sm / 2)}`),
                          meta(['ui', 'coin'], `${G.sellPrice(i.id)} le fruit`),
                          meta(['item', 'apple'], 'se plante au verger'),
                          state.seeds[i.id] ? meta(null, `${state.seeds[i.id]} en stock`, 'stock') : '',
                      ].join('');
            const btns =
                i.type === 'crop'
                    ? buyBtn('seed', i.id, 1, i.cost, locked) + buyBtn('seed', i.id, 10, i.cost, locked)
                    : buyBtn('seed', i.id, 1, i.cost, locked);
            return shopCard(art('seed', i.id), i.seedName, `<span class="metas">${sub}</span>`, btns, locked, !lvOk(i) ? i.reqLvl : G.storyLockText(i));
        })
        .join('');
}

function animals() {
    const sm = G.speedMult();
    return Object.values(ANIMALS)
        .sort((a, b) => a.reqLvl - b.reqLvl)
        .map(a => {
            const locked = !lvOk(a),
                p = ITEMS[a.prodId];
            const owned = G.animalCount(a.id);
            return shopCard(
                art('animal', a.id),
                a.name,
                `<span class="metas">${meta(['item', p.id], p.name)}${meta(['ui', 'clock'], formatDuration(a.time / sm))}${meta(['ui', 'coin'], G.sellPrice(p.id))}${owned ? meta(null, `${owned} à la ferme`, 'stock') : ''}</span>`,
                buyBtn('animal', a.id, 1, a.cost, locked),
                locked,
                a.reqLvl,
            );
        })
        .join('');
}

function machines() {
    return Object.values(MACHINES)
        .sort((a, b) => a.reqLvl - b.reqLvl)
        .map(m => {
            const locked = !lvOk(m) || !G.storyOk(m),
                owned = G.hasMachine(m.id);
            const recs = G.recipesOf(m.id);
            const strip = `<span class="rec-strip">${recs
                .slice(0, 7)
                .map(r => ico(['item', r.id]))
                .join('')}${recs.length > 7 ? `<b>+${recs.length - 7}</b>` : ''}</span>`;
            return shopCard(
                art('machine', m.id),
                m.name,
                `${m.desc} · ${recs.length} recettes${strip}`,
                owned ? `<span class="chip ok">${ico(['ui', 'check'])}Possédé</span>` : buyBtn('machine', m.id, 1, m.cost, locked),
                locked,
                !lvOk(m) ? m.reqLvl : G.storyLockText(m),
            );
        })
        .join('');
}

function gear() {
    const f = ITEMS.feed,
        cp = ITEMS.fertilizer,
        cpLocked = !lvOk(cp);
    let html = shopCard(
        art('item', 'feed'),
        'Nourriture',
        `Un sac = une production animale. En stock : ${state.inventory.feed}`,
        buyBtn('feed', 'feed', 1, f.cost) + buyBtn('feed', 'feed', 10, f.cost),
        false,
    );
    html += shopCard(
        art('item', 'fertilizer'),
        'Compost',
        `Sur une culture qui pousse : bien meilleures chances de qualité argent ou or. En stock : ${state.inventory.fertilizer}`,
        buyBtn('compost', 'fertilizer', 1, cp.cost, cpLocked) + buyBtn('compost', 'fertilizer', 10, cp.cost, cpLocked),
        cpLocked,
        cp.reqLvl,
    );
    html += Object.keys(UPGRADES)
        .map(k => {
            const u = UPGRADES[k],
                lvl = state.upgrades[k] || 0,
                max = lvl >= u.maxLvl,
                cost = G.upgradeCost(k);
            if (!G.upgradeOpen(k)) return shopCard(art('ui', k), u.name, '', '', true, u.reqLvl);
            return card({
                art: art('ui', k),
                title: `${u.name}${u.maxLvl > 1 ? pips(lvl, u.maxLvl) : ''}`,
                sub: `${u.desc}.${u.maxLvl > 1 ? ` Niveau ${lvl} sur ${u.maxLvl}.` : lvl ? ' Installée.' : ''}`,
                side: btn(max ? (u.maxLvl > 1 ? 'Max' : 'Installée') : `${fmt(cost)}${COIN()}`, {
                    act: 'upgrade',
                    data: { id: k },
                    kind: max ? '' : 'green',
                    size: 'sm',
                    disabled: max || state.money < cost,
                }),
            });
        })
        .join('');
    return html;
}

function decos() {
    const list = Object.values(DECOS)
        .filter(d => !d.rare)
        .map(d => {
            const locked = !lvOk(d);
            const n = G.decoCount(d.id);
            return shopCard(
                art('ui', d.id),
                d.name,
                `${d.desc}. À poser sur une parcelle vide${n ? ` · vous en avez ${n}` : ''}`,
                buyBtn('placedeco', d.id, 1, d.cost, locked),
                locked,
                d.reqLvl,
            );
        })
        .join('');
    const locked = !lvOk(DOG),
        owned = state.dog.owned;
    const dog = shopCard(
        art('ui', 'dog'),
        `Chien de ferme${owned ? ` : ${esc(state.dog.name)}` : ''}`,
        'Chasse les corbeaux, rapporte des trouvailles et adore les caresses',
        owned
            ? `<span class="chip ok">${ico(['ui', 'check'])}Adopté</span>`
            : btn(`${fmt(DOG.cost)}${COIN()}`, { act: 'buyDog', kind: 'green', size: 'sm', disabled: state.money < DOG.cost }),
        locked,
        DOG.reqLvl,
    );
    return list + dog;
}

const CATS = [
    ['seeds', 'Graines', ['ui', 'packet'], seeds],
    ['animals', 'Animaux', ['animal', 'chicken'], animals],
    ['machines', 'Machines', ['machine', 'mill'], machines],
    ['gear', 'Équipement', ['ui', 'upgrade'], gear],
    ['decos', 'Décos', ['ui', 'flowers'], decos],
];

function renderShop(el) {
    const cat = ui.sel.shop || 'seeds';
    const c = CATS.find(x => x[0] === cat);
    blocks(el, [
        ['night', nightMarketCard()],
        ['pin', pinBar()],
        [
            'cats',
            `<div class="chips-row cats">${CATS.map(([id, label, icon]) => `<button class="pick-chip${id === cat ? ' on' : ''}" data-act="shopCat" data-c="${id}">${ico(icon)}${label}</button>`).join('')}</div>`,
        ],
        ['list', `<div class="list shop-list">${c[3]()}</div>`],
    ]);
}
defineView('market/shop', renderShop);

// ---------------- l'étal ----------------
function stallCard() {
    G.ensureStall();
    const slots = state.stall.slots;
    const sold = G.stallSoldCount();
    const later = G.STALL_LEVELS.filter(l => state.level < l);
    return `<div class="card stall-card">
        <div class="card-head">${ico(['ui', 'stall'], 'ico big')}<div class="card-main"><div class="card-title">L’étal de la ferme</div><div class="card-sub">Vous choisissez le prix : les passants achètent, mais il faut attendre qu’ils viennent.</div></div>
        ${sold ? btn('Tout encaisser', { act: 'collectStalls', kind: 'gold', size: 'sm' }) : ''}</div>
        <div class="stall-slots">${slots
            .map((sl, k) => {
                if (!sl) return `<button class="sslot empty" data-act="open" data-sheet="stall" data-k="${k}"><b>+</b><span>Vendre</span></button>`;
                if (sl.sold)
                    return `<button class="sslot sold" data-act="collectStall" data-k="${k}">${ico(['ui', 'coin'])}<b>${fmt(sl.qty * sl.price)}</b><span>Encaisser</span></button>`;
                return `<div class="sslot listed">${ico(['item', sl.id])}<b>×${sl.qty}</b><span>${fmt(sl.price)}${COIN()} l’unité</span><small>client ≈ ${timer(sl.sellAt)}</small><button class="sx" data-act="cancelStall" data-k="${k}" aria-label="Retirer">×</button></div>`;
            })
            .join('')}</div>
        ${later.length ? `<p class="card-sub">Une place de plus ${later.length > 1 ? `aux niveaux ${later.slice(0, -1).join(', ')} et ${later.at(-1)}` : `au niveau ${later[0]}`}.</p>` : ''}
    </div>`;
}

function banners() {
    const hot = state.market.hot;
    let html = '';
    if (G.challengeOn('noMarket'))
        html += card({
            icon: ['ui', 'flag'],
            title: 'Défi « Marché fermé »',
            sub: 'Le grossiste n’achète rien sur cette ferme : livrez des commandes et des trains.',
            cls: 'banner',
        });
    if (hot)
        html += card({
            icon: ['item', hot],
            title: `Produit du jour : ${ITEMS[hot].name}`,
            sub: `Vendu 50 % plus cher aujourd’hui${state.inventory[hot] ? '' : ', mais vous n’en avez pas en stock'}.`,
            cls: 'banner hot',
        });
    if (G.eventActive('ete'))
        html += card({ icon: ['ui', 's_summer'], title: 'Fête de l’été', sub: 'Toutes les ventes rapportent 25 % de plus.', cls: 'banner fair' });
    return html || null;
}

function goodsGrid() {
    G.clampAllQuality();
    const keys = G.sellableKeys();
    if (!keys.length) return empty('Rien à vendre pour l’instant. Récoltez des cultures ou ramassez des produits pour remplir vos caisses.');
    const hot = state.market.hot;
    return `<div class="goods-grid">${keys
        .map(k => {
            const it = ITEMS[k],
                n = state.inventory[k],
                q = G.qual(k),
                f = G.demand(k);
            const keep = G.reservedQty(k),
                all = G.sellBatch(k, n - keep, false),
                one = G.sellBatch(k, 1, false);
            const trend = f < 0.98 ? `<span class="trend">−${Math.round((1 - f) * 100)} %</span>` : '';
            const qs = [q.g ? `<span class="qchip">${qStar(2)}${q.g}</span>` : '', q.s ? `<span class="qchip">${qStar(1)}${q.s}</span>` : ''].join('');
            return `<div class="goods${k === hot ? ' hot' : ''}" data-anchor="goods:${k}">
                ${k === hot ? '<span class="hot-tag">+50 %</span>' : ''}
                <span class="goods-art">${art('item', k)}</span>
                <b class="goods-name">${it.name} <small>×${n}</small></b>
                ${qs ? `<span class="qrow">${qs}</span>` : ''}
                ${G.isLocked(k) ? `<span class="reserved">${ico(['ui', 'lock'])} verrouillé</span>` : keep ? `<span class="reserved">${keep} gardé${keep > 1 ? 's' : ''}</span>` : ''}
                <span class="unit">${COIN()}${fmt(G.unitPrice(k, 0))} ${trend}</span>
                <span class="goods-btns">${btn(`+${fmt(one.gain)}`, { act: 'sell', data: { id: k, n: 1 }, size: 'sm' })}${btn(all.sold ? fmt(all.gain) : 'Gardé', { act: 'sell', data: { id: k, n: 0 }, kind: 'gold', size: 'sm', disabled: !all.sold })}</span>
            </div>`;
        })
        .join('')}</div>`;
}

function renderSell(el) {
    blocks(el, [
        ['pin', pinBar()],
        ['stall', stallCard()],
        ['whole', section('Grossiste', btn('Tout vendre', { act: 'sellAll', kind: 'gold', size: 'sm', icon: ['ui', 'coin'], anchor: 'btn:sellAll' }))],
        [
            'reserve',
            toggle(
                'Garder ce qu’il faut pour les commandes',
                state.settings.reserve,
                'toggleReserve',
                null,
                'Train, chantiers, fête et acheteur pressé compris',
            ),
        ],
        ['banners', banners()],
        ['goods', goodsGrid()],
        [
            'hint',
            hint(
                'Le grossiste achète tout de suite, mais bien moins cher que vos clients de l’étal. Graines, nourriture, matériaux et produits verrouillés ne sont jamais vendus.',
            ),
        ],
    ]);
}
defineView('market/sell', renderSell);

// ---------------- mettre en vente à l'étal ----------------
const stallSum = (o, unit) =>
    `<span>${fmt(unit)}${COIN()} l’unité · <b>${fmt(unit * o.qty)}${COIN()}</b> en tout</span><small>${G.stallMood(o.ratio)} · un client vers ${Math.round(G.stallWait(o.ratio))} min</small>`;
defineSheet('stall', {
    title: `${ico(['ui', 'stall'])}Mettre en vente`,
    open(o) {
        o.k = +o.k;
        o.ratio = 1;
        o.qty = 1;
        if (o.id) o.qty = G.stallMax(o.id);
    },
    render(o) {
        const list = G.stallChoices();
        const grid = list.length
            ? `<div class="barn-goods">${list.map(id => `<button class="bgood${o.id === id ? ' sel' : ''}" data-act="stallPick" data-id="${id}" title="${ITEMS[id].name}">${ico(['item', id])}<b>${G.sellableQty(id)}</b></button>`).join('')}</div>`
            : empty('Rien à vendre : les produits gardés pour les commandes ou verrouillés ne sont pas proposés.');
        if (!o.id || !list.includes(o.id)) return grid + (list.length ? '<p class="card-sub center">Choisissez un produit à mettre en vente.</p>' : '');
        const max = G.stallMax(o.id);
        o.qty = Math.max(1, Math.min(o.qty, max));
        const unit = G.stallUnit(o.id, o.ratio);
        const whole = G.unitPrice(o.id, 0);
        return `${grid}<div class="stall-form">
            <div class="card-head">${ico(['item', o.id], 'ico big')}<div class="card-main"><div class="card-title">${ITEMS[o.id].name}</div><div class="card-sub">${G.sellableQty(o.id)} disponible${G.sellableQty(o.id) > 1 ? 's' : ''} · au grossiste : ${fmt(whole)} pièce${whole > 1 ? 's' : ''} l’unité</div></div></div>
            <div class="form-row"><span>Quantité</span><div class="stepper">${btn('', { act: 'stallQty', data: { d: -1 }, size: 'sm', icon: ['ui', 'minus'], title: 'Moins' })}<b>${o.qty}</b>${btn('', { act: 'stallQty', data: { d: 1 }, size: 'sm', icon: ['ui', 'plus'], title: 'Plus' })}${btn('Max', { act: 'stallQty', data: { d: 99 }, size: 'sm' })}</div></div>
            <div class="form-row"><span>Prix</span><input type="range" min="50" max="150" step="5" value="${Math.round(o.ratio * 100)}" data-input="stallPrice"><b id="stall-pct">${Math.round(o.ratio * 100)} %</b></div>
            <div class="stall-sum" id="stall-sum">${stallSum(o, unit)}</div>
        </div>`;
    },
    foot: o => (o.id && G.stallChoices().includes(o.id) ? btn('Mettre en vente', { act: 'listStall', kind: 'gold', wide: true, size: 'lg' }) : ''),
});

export function setupMarket() {
    const so = () => sheetOpts('stall');
    actions({
        shopCat: (el, d) => (ui.sel.shop = d.c),
        buy: (el, d) =>
            d.type === 'machine'
                ? askBuy(
                      {
                          title: `Acheter : ${MACHINES[d.id].name.toLowerCase()}`,
                          icon: ['machine', d.id],
                          text: 'Une nouvelle machine pour l’atelier.',
                          cost: MACHINES[d.id].cost,
                          mats: G.matCost('machine', d.id),
                          run: at => G.buy(d.type, d.id, +d.qty, at),
                      },
                      el,
                  )
                : G.buy(d.type, d.id, +d.qty, el),
        upgrade: (el, d) => G.buyUpgrade(d.id, el.closest('.card')),
        buyDog: el => G.buyDog(el),
        sell: (el, d) => G.sellItem(d.id, +d.n, el),
        sellAll: el => G.sellAll(el),
        toggleReserve: () => G.toggleReserve(),
        collectStall: (el, d) => G.collectStall(+d.k, el),
        collectStalls: el => G.collectAllStall(el),
        cancelStall: (el, d) => G.cancelStall(+d.k),
        stallPick: (el, d) => {
            const o = so();
            o.id = d.id;
            o.qty = G.stallMax(d.id);
        },
        stallQty: (el, d) => {
            const o = so(),
                max = G.stallMax(o.id);
            o.qty = +d.d === 99 ? max : Math.max(1, Math.min(max, o.qty + +d.d));
        },
        // le curseur bouge sans redessiner le tiroir (sinon on le lâcherait)
        stallPrice: (el, d) => {
            const o = so();
            o.ratio = +d.value / 100;
            document.getElementById('stall-pct').textContent = `${Math.round(o.ratio * 100)} %`;
            document.getElementById('stall-sum').innerHTML = stallSum(o, G.stallUnit(o.id, o.ratio));
            return QUIET;
        },
        listStall: el => {
            const o = so();
            if (G.listStall(o.k, o.id, o.qty, o.ratio, el)) closeSheet('stall');
        },
    });
}
