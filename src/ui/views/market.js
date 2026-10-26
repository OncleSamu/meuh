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
import { btn, card, chip, section, empty, toggle, pips, timer, hearts, tip15, segmented, bar } from '../kit.js';
import { defineView, ui } from '../app.js';
import { defineSheet, closeSheet, sheetOpts } from '../sheets.js';
import { pinBar } from './common.js';
import { askBuy } from '../sheets/askbuy.js';
import { merchantCard } from './village.js';
import { NMARKET } from '../../data/commerce.js';
import { RIVALS } from '../../data/village.js';
import { PASSERS, REPUTATION } from '../../data/elevage.js';
import { renameBtn } from '../sheets/rename.js';

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

// 1.37.1 : le stock de graines ou de pousses, avec sa revente (40 % du prix)
const stockChip = id => {
    const n = state.seeds[id] || 0;
    if (!n) return '';
    // un début de partie ne doit pas pouvoir revendre ses premières graines d'un doigt distrait
    if (ITEMS[id].type === 'crop' && n < 50) return meta(null, `${n} en stock`, 'stock');
    return `<button class="chip meta stock sell-seed" data-act="sellSeeds" data-id="${id}" title="Revendre le stock">${n} en stock · revendre ${fmt(G.seedBackPrice(id) * n)}${COIN()}</button>`;
};

// 1.38 : les listes du magasin restent courtes. rows : [{ html, locked, lvl }]
// les objets bloqués : seulement les 2 prochains, le reste résumé sur une ligne
function tidy(rows) {
    const open = rows.filter(r => !r.locked),
        locked = rows.filter(r => r.locked).sort((a, b) => (a.lvl || 0) - (b.lvl || 0));
    const next = locked.slice(0, 2),
        rest = locked.slice(2);
    const lv = rest.map(r => r.lvl).filter(x => typeof x === 'number');
    const more = rest.length
        ? `<p class="card-sub center shop-more">${ico(['ui', 'lock'])} ${rest.length} autre${rest.length > 1 ? 's' : ''} à débloquer plus tard${lv.length ? ` (niveaux ${Math.min(...lv)} à ${Math.max(...lv)})` : ''}</p>`
        : '';
    return open.map(r => r.html).join('') + next.map(r => r.html).join('') + more;
}
// ce qui est déjà acquis (machines possédées, améliorations au maximum) se replie sur une ligne
const ownedFold = (id, label, list) =>
    list.length
        ? ui.sel['own_' + id]
            ? list.join('') + `<button class="shop-fold" data-act="shopOwned" data-id="${id}">Replier ${label}</button>`
            : `<button class="shop-fold" data-act="shopOwned" data-id="${id}">${ico(['ui', 'check'])} ${list.length} ${label} · voir</button>`
        : '';

// ---------------- catégories du magasin ----------------
function seeds() {
    const sm = G.speedMult();
    const all = G.seedList().filter(i => !i.exotic);
    const open = all.filter(i => lvOk(i) && G.storyOk(i));
    const tabs = [
        ['season', 'De saison', open.filter(i => G.isInSeason(i.id)).length],
        ['stock', 'En stock', open.filter(i => state.seeds[i.id] > 0).length],
        ['crop', 'Cultures', open.filter(i => i.type === 'crop').length],
        ['tree', 'Arbres', open.filter(i => i.type === 'tree').length],
    ].filter(([, , n]) => n > 0);
    let tab = ui.sel.seedShop;
    if (!tabs.some(([k]) => k === tab)) tab = tabs.length ? tabs[0][0] : 'crop';
    const keep = i => (tab === 'season' ? G.isInSeason(i.id) : tab === 'stock' ? state.seeds[i.id] > 0 : i.type === tab);
    const head = `<div class="chips-row seed-tabs">${tabs.map(([k, label, n]) => `<button class="pick-chip${k === tab ? ' on' : ''}" data-act="seedShop" data-f="${k}">${label} · ${n}</button>`).join('')}</div>`;
    const rows = all
        .filter(i => (lvOk(i) && G.storyOk(i) ? keep(i) : tab === 'crop' || tab === 'tree' ? i.type === tab : false))
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
                          stockChip(i.id),
                          i.ghOnly ? meta(['ui', 'greenhouse'], 'serre seulement') : '',
                      ].join('')
                    : [
                          meta(['ui', 'clock'], `adulte en ${formatDuration(i.time / sm)}, puis 1 fruit / ${formatDuration(i.time / sm / 2)}`),
                          meta(['ui', 'coin'], `${G.sellPrice(i.id)} le fruit`),
                          meta(['item', 'apple'], 'se plante au verger'),
                          stockChip(i.id),
                      ].join('');
            const btns =
                i.type === 'crop'
                    ? buyBtn('seed', i.id, 1, i.cost, locked) + buyBtn('seed', i.id, 10, i.cost, locked)
                    : buyBtn('seed', i.id, 1, i.cost, locked);
            return {
                html: shopCard(art('seed', i.id), i.seedName, `<span class="metas">${sub}</span>`, btns, locked, !lvOk(i) ? i.reqLvl : G.storyLockText(i)),
                locked,
                lvl: i.reqLvl,
            };
        });
    return head + tidy(rows);
}

function animals() {
    const sm = G.speedMult();
    const rows = Object.values(ANIMALS)
        .sort((a, b) => a.reqLvl - b.reqLvl)
        .map(a => {
            const locked = !lvOk(a),
                p = ITEMS[a.prodId];
            const owned = G.animalCount(a.id);
            return {
                html: shopCard(
                    art('animal', a.id),
                    a.name,
                    `<span class="metas">${meta(['item', p.id], p.name)}${meta(['ui', 'clock'], formatDuration(a.time / sm))}${meta(['ui', 'coin'], G.sellPrice(p.id))}${owned ? meta(null, `${owned} à la ferme`, 'stock') : ''}</span>`,
                    buyBtn('animal', a.id, 1, a.cost, locked),
                    locked,
                    a.reqLvl,
                ),
                locked,
                lvl: a.reqLvl,
            };
        });
    return tidy(rows);
}

function machines() {
    const owned = [];
    const rows = Object.values(MACHINES)
        .sort((a, b) => a.reqLvl - b.reqLvl)
        .map(m => {
            const locked = !lvOk(m) || !G.storyOk(m),
                own = G.hasMachine(m.id);
            const recs = G.recipesOf(m.id);
            const strip = `<span class="rec-strip">${recs
                .slice(0, 7)
                .map(r => ico(['item', r.id]))
                .join('')}${recs.length > 7 ? `<b>+${recs.length - 7}</b>` : ''}</span>`;
            const html = shopCard(
                art('machine', m.id),
                m.name,
                `${m.desc} · ${recs.length} recettes${strip}`,
                own ? `<span class="chip ok">${ico(['ui', 'check'])}Possédé</span>` : buyBtn('machine', m.id, 1, m.cost, locked),
                locked,
                !lvOk(m) ? m.reqLvl : G.storyLockText(m),
            );
            if (own) owned.push(html);
            return own ? null : { html, locked, lvl: m.reqLvl };
        })
        .filter(Boolean);
    return tidy(rows) + ownedFold('machines', `machine${owned.length > 1 ? 's' : ''} déjà achetée${owned.length > 1 ? 's' : ''}`, owned);
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
    const done = [];
    const rows = Object.keys(UPGRADES)
        .map(k => {
            const u = UPGRADES[k],
                lvl = state.upgrades[k] || 0,
                max = lvl >= u.maxLvl,
                cost = G.upgradeCost(k);
            if (!G.upgradeOpen(k)) return { html: shopCard(art('ui', k), u.name, '', '', true, u.reqLvl), locked: true, lvl: u.reqLvl };
            const html = card({
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
            if (max) done.push(html);
            return max ? null : { html, locked: false };
        })
        .filter(Boolean);
    return html + tidy(rows) + ownedFold('gear', `amélioration${done.length > 1 ? 's' : ''} au maximum`, done);
}

function decos() {
    const list = Object.values(DECOS)
        .filter(d => !d.rare)
        .map(d => {
            const locked = !lvOk(d);
            const n = G.decoCount(d.id);
            return {
                html: shopCard(
                    art('ui', d.id),
                    d.name,
                    `${d.desc}. Se pose dans un coin de parcelle : la culture pousse toujours${n ? ` · vous en avez ${n}` : ''}`,
                    buyBtn('placedeco', d.id, 1, d.cost, locked),
                    locked,
                    d.reqLvl,
                ),
                locked,
                lvl: d.reqLvl,
            };
        });
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
    return tidy(list) + dog;
}

// ---------------- 1.26 : les étals des voisins et la demande d'achat ----------------
function neighborsList() {
    if (!G.nmarketOpen()) return empty(`Les fermes voisines ouvrent leurs étals au niveau ${NMARKET.lvl}.`);
    G.nmarketTick();
    const m = G.ensureNMarket();
    const head = `<div class="card nm-head"><div class="card-main"><div class="card-title">Le marché des voisins</div><div class="card-sub">Nouveaux étals dans ${timer(G.nmarketRenewAt(), 'b')} · plus d’offres et de meilleurs prix avec l’amitié</div></div></div>`;
    const stalls = m.stalls
        .map(st => {
            const r = RIVALS[st.k],
                h = G.nHearts(st.k);
            const [c1, c2] = NMARKET.colors[st.k];
            const offers = st.offers
                .map(
                    (o, n) =>
                        `<div class="offer nm-offer${o.sold ? ' sold' : ''}${o.gold ? ' gold' : ''}"><span class="offer-art">${art('item', o.id)}${o.gold ? qStar(2) : ''}</span><b>${o.qty} × ${ITEMS[o.id].name}</b>${o.gold ? '<small>Coup de cœur : qualité or</small>' : ''}${
                            o.sold
                                ? '<small>Vendu</small>'
                                : btn(`${fmt(o.price)}${COIN()}`, {
                                      act: 'nmBuy',
                                      data: { k: st.k, n },
                                      kind: state.money >= o.price ? 'green' : '',
                                      size: 'sm',
                                      disabled: state.money < o.price,
                                  })
                        }</div>`,
                )
                .join('');
            return `<div class="card nm-stall" style="--a1:${c1};--a2:${c2}"><div class="nm-awning"></div>
                <div class="card-head"><div class="avatar sm">${art('villager', r.avatar)}</div><div class="card-main"><div class="card-title">${r.owner}</div><div class="card-sub">${r.name} · ${NMARKET.specs[st.k]}</div>${hearts(h)}</div>
                <small class="nm-price${h >= 3 ? ' good' : ''}">${h >= 5 ? 'Prix d’ami' : h >= 3 ? 'Bons prix' : 'Prix normal'}</small></div>
                <div class="offers">${offers || '<small>Rien à vendre pour l’instant : débloquez ses produits.</small>'}</div>
                ${beastOffer(st.k)}
                <div class="nm-loyal"><small>Fidélité</small><i><u style="width:${Math.round(G.loyaltyPct(st.k) * 100)}%"></u></i></div></div>`;
        })
        .join('');
    const asks = m.asks
        .map(
            (a, n) =>
                `<div class="card nm-ask${a.ready ? ' ready' : ''}"><span class="offer-art">${art('item', a.id)}</span><div class="card-main"><div class="card-title">${a.qty} × ${ITEMS[a.id].name}</div>
                <div class="card-sub">${RIVALS[a.k].owner} · ${fmt(a.price)}${COIN()} à la livraison${a.ready ? '' : ` · ${timer(a.until)}`}</div></div>${
                    a.ready
                        ? btn('Récupérer', { act: 'nmCollect', data: { n }, kind: 'green', size: 'sm' })
                        : btn('Annuler', { act: 'nmCancel', data: { n }, kind: 'ghost', size: 'sm' })
                }</div>`,
        )
        .join('');
    const askHead = `<div class="card nm-askhead"><span class="offer-art">${art('ui', 'nmDemande')}</span><div class="card-main"><div class="card-title">Demande d’achat</div><div class="card-sub">L’étal à l’envers : vous fixez votre prix, un voisin livre d’autant plus vite. ${m.asks.length}/${G.askSlots()} demandes.</div></div>${btn('Demander', { act: 'open', data: { sheet: 'nmAsk' }, kind: 'gold', size: 'sm', disabled: m.asks.length >= G.askSlots() })}</div>`;
    return head + stalls + askHead + asks;
}

// 1.45 : la bête de choix du jour de chaque voisin
function beastOffer(k) {
    const o = G.neighborBeasts().find(x => x.k === k);
    if (!o) return '';
    const a = o.a;
    const genes = o.traits.map(t => `${G.ANIMAL_TRAIT_NAME(t)} ${G.animalTrait(a, t)} (+${G.animalTrait(a, t) - G.animalBase(a, t)})`).join(', ');
    return `<div class="nb-beast${o.sold ? ' sold' : ''}"><span class="offer-art">${art('animal', a.type)}</span><div class="card-main"><b>${esc(a.name)}, ${ANIMALS[a.type].name.toLowerCase()}</b><small>Bête de choix du jour : ${genes}</small></div>${
        o.sold
            ? '<small>Vendue</small>'
            : btn(`${fmt(o.price)}${COIN()}`, {
                  act: 'nbBuy',
                  data: { k },
                  kind: state.money >= o.price ? 'green' : '',
                  size: 'sm',
                  disabled: state.money < o.price,
              })
    }</div>`;
}

const CATS = [
    ['seeds', 'Graines', ['ui', 'packet'], seeds],
    ['animals', 'Animaux', ['animal', 'chicken'], animals],
    ['machines', 'Machines', ['machine', 'mill'], machines],
    ['gear', 'Équipement', ['ui', 'upgrade'], gear],
    ['decos', 'Décos', ['ui', 'flowers'], decos],
    ['neighbors', 'Voisins', ['ui', 'nmEtal'], neighborsList],
];

function renderShop(el) {
    const cat = ui.sel.shop || 'seeds';
    const c = CATS.find(x => x[0] === cat);
    blocks(el, [
        ['merchant', merchantCard()],
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
    const free = slots.map((x, k) => (x ? -1 : k)).filter(k => k >= 0);
    return `<div class="card stall-card">
        <div class="card-head">${ico(['ui', 'stall'], 'ico big')}<div class="card-main"><div class="card-title">L’étal de la ferme</div><div class="card-sub">Vous choisissez le prix : les passants achètent, mais il faut attendre qu’ils viennent.</div></div>
        ${sold ? btn('Tout encaisser', { act: 'collectStalls', kind: 'gold', size: 'sm' }) : ''}</div>
        <div class="stall-slots">${slots
            .map((sl, k) => {
                // 1.38 : une seule case pour toutes les places libres
                if (!sl)
                    return k === free[0]
                        ? `<button class="sslot empty free-row" data-act="open" data-sheet="stall" data-k="${k}"><b>+</b><span>Vendre · ${free.length} place${free.length > 1 ? 's' : ''} libre${free.length > 1 ? 's' : ''}</span></button>`
                        : '';
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

// 1.38 : le grossiste par familles, les plus belles valeurs d'abord, 24 à la fois
const FAMS = [
    ['all', 'Tout', () => true],
    ['crop', 'Récoltes', t => t === 'crop' || t === 'tree'],
    ['product', 'Bêtes', t => t === 'product'],
    ['artisan', 'Atelier', t => t === 'artisan'],
    ['fish', 'Pêche', t => t === 'fish'],
    ['other', 'Mine et forêt', t => ['gem', 'ore', 'ingot', 'material', 'junk'].includes(t)],
];
const GOODS_PAGE = 24;
function goodsGrid() {
    G.clampAllQuality();
    const all = G.sellableKeys();
    if (!all.length) return empty('Rien à vendre pour l’instant. Récoltez des cultures ou ramassez des produits pour remplir vos caisses.');
    const hot = state.market.hot;
    const fams = FAMS.map(([id, label, ok]) => [id, label, all.filter(k => ok(ITEMS[k].type)).length]).filter(([id, , n]) => id === 'all' || n > 0);
    let f = ui.sel.sellF || 'all';
    if (!fams.some(([id]) => id === f)) f = 'all';
    const ok = FAMS.find(x => x[0] === f)[2];
    const sorted = all
        .filter(k => ok(ITEMS[k].type))
        .sort((a, b) => (b === hot) - (a === hot) || G.unitPrice(b, 0) * state.inventory[b] - G.unitPrice(a, 0) * state.inventory[a]);
    const more = !ui.sel.sellMore && sorted.length > GOODS_PAGE;
    const keys = more ? sorted.slice(0, GOODS_PAGE) : sorted;
    const chips =
        all.length > 12
            ? `<div class="chips-row sell-fams">${fams.map(([id, label, n]) => `<button class="pick-chip${id === f ? ' on' : ''}" data-act="sellF" data-f="${id}">${label} · ${n}</button>`).join('')}</div>`
            : '';
    return `${chips}<div class="goods-grid">${keys
        .map(k => {
            const it = ITEMS[k],
                n = state.inventory[k],
                q = G.qual(k),
                f = G.demand(k);
            const keep = G.reservedQty(k),
                all = G.sellBatch(k, n - keep, false),
                one = G.sellBatch(k, 1, false);
            const trend = f < 0.98 ? `<span class="trend">−${Math.round((1 - f) * 100)} %</span>` : '';
            const qs = [
                [4, 'd'],
                [3, 'p'],
                [2, 'g'],
                [1, 's'],
            ]
                .map(([r, f]) => (q[f] ? `<span class="qchip">${qStar(r)}${q[f]}</span>` : ''))
                .join('');
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
        .join('')}</div>${more ? `<button class="shop-fold" data-act="sellMore">Voir les ${sorted.length - GOODS_PAGE} autres produits</button>` : ''}`;
}

// ---------------- 1.45 : la foire aux bestiaux ----------------
const buyerAvatar = b =>
    b.who.kind === 'passer'
        ? art(...(PASSERS.find(p => p.id === b.who.id) || { icon: ['ui', 'coin'] }).icon)
        : b.who.kind === 'villager'
          ? art('villager', b.who.id)
          : art('villager', RIVALS[b.who.id].avatar);
function repCard() {
    const nx = G.elevRepNext(),
        R = REPUTATION[G.elevRepTier()];
    return `<div class="card fair-rep"><span class="offer-art">${art('ui', 'hEcusson')}</span><div class="card-main">
        <div class="card-title">Élevage « ${esc(G.studName())} » ${renameBtn('stud', 'stud', 'Renommer l’élevage')}</div>
        <div class="card-sub">${G.elevRepName()}${G.elevRepBonus() ? ` · +${Math.round(G.elevRepBonus() * 100)} % à la foire` : ''}</div>
        ${nx ? `${bar((G.elevRepPts() - R.pts) / (nx.pts - R.pts))}<small class="card-sub">${fmt(G.elevRepPts())} / ${fmt(nx.pts)} points pour « ${nx.name} »</small>` : '<small class="card-sub">La plus haute réputation !</small>'}</div></div>`;
}
function buyerCard(b) {
    const d = ANIMALS[b.type];
    const m = G.buyerMatches(b);
    const ready = m.length >= b.count;
    const pick = m.slice(0, b.count);
    const reqs = [`<span class="req ok">${ico(['ui', 'check'])}${b.count > 1 ? 'adultes' : 'adulte'}</span>`]
        .concat(
            b.reqs.map(
                r => `<span class="req ${G.reqMet(b, r) ? 'ok' : 'no'}">${ico(['ui', G.reqMet(b, r) ? 'check' : 'lock'])}${G.reqText(r, b.type)}</span>`,
            ),
        )
        .join('');
    const name = d.name.toLowerCase();
    const wants = `${b.count} ${b.count > 1 ? (name.endsWith('s') || name.endsWith('x') ? name : name + 's') : name}`;
    return `<div class="card fair-buyer${ready ? ' ready' : ''}"><div class="card-head"><span class="avatar sm">${buyerAvatar(b)}</span>
        <div class="card-main"><div class="card-title">${esc(G.buyerName(b))}</div><div class="card-sub">Veut ${wants} · repart dans ${timer(b.until)}</div></div>
        <b class="fair-price">${fmt(G.buyerPrice(b))}${COIN()}</b></div>
        <div class="fair-reqs">${reqs}</div>
        <div class="fair-match">${
            ready
                ? `<span class="fair-pick">${pick.map(a => `<span class="fair-mini" title="${esc(a.name)}">${art('animal', a.type)}</span>`).join('')}</span><small>${pick.map(a => esc(a.name)).join(', ')}</small>${btn('Vendre', { act: 'fairSell', data: { id: b.id }, kind: 'gold', size: 'sm' })}`
                : `<small>${m.length ? `${m.length} sur ${b.count} conviennent` : 'Aucune de vos bêtes ne convient encore'}</small>${btn('Renvoyer', { act: 'fairDismiss', data: { id: b.id }, kind: 'ghost', size: 'sm' })}`
        }</div></div>`;
}
function fairHtml() {
    G.fairTick();
    const e = G.ensureElevage();
    const list = e.buyers.length
        ? e.buyers.map(buyerCard).join('')
        : empty(state.animals.length ? 'Aucun acheteur pour l’instant.' : 'Les acheteurs viendront quand vous aurez des bêtes.');
    return `${repCard()}${list}<p class="card-sub center fair-foot">${e.buyers.length < G.fairSlots() ? `Prochain acheteur dans ${timer(e.next)}` : `${G.fairSlots()} acheteurs au plus`} · chacun reste un jour</p>`;
}

function renderSell(el) {
    const tab = G.fairOpen() && ui.sel.sell === 'beasts' ? 'beasts' : 'goods';
    if (tab === 'beasts')
        return blocks(el, [
            ['pin', pinBar()],
            ['selltab', sellTabs(tab)],
            ['fair', fairHtml()],
            [
                'hint',
                tip15(
                    'La foire achète vos bêtes adultes. Le jeu propose d’abord les moins précieuses qui conviennent : vos meilleures restent pour l’élevage.',
                ),
            ],
        ]);
    blocks(el, [
        ['selltab', sellTabs(tab)],
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
            tip15(
                'Le grossiste achète tout de suite, mais bien moins cher que vos clients de l’étal. Graines, nourriture, matériaux et produits verrouillés ne sont jamais vendus.',
            ),
        ],
    ]);
}
defineView('market/sell', renderSell);
const sellTabs = tab =>
    G.fairOpen()
        ? segmented(
              [
                  ['goods', 'Produits', ['ui', 'coin']],
                  ['beasts', 'Bêtes', ['animal', 'cow'], G.fairReadyCount()],
              ],
              tab,
              'sellTab',
          )
        : '';

// ---------------- 1.26 : la demande d'achat ----------------
const ASK_MULTS = [1.2, 1.5, 2, 2.5];
defineSheet('nmAsk', {
    title: `${ico(['ui', 'nmDemande'])}Demande d’achat`,
    open(o) {
        o.qty = 10;
        o.mult = 1.5;
    },
    render(o) {
        const ks = [0, 1, 2, 3].filter(k => G.specialtyOf(k).length);
        if (!ks.includes(o.k)) o.k = ks[0];
        const ids = G.specialtyOf(o.k);
        const groups = `<div class="chips-row wrap nm-who">${ks.map(k => `<button class="pick-chip${o.k === k ? ' on' : ''}" data-act="nmWho" data-k="${k}"><i class="avatar xs">${art('villager', RIVALS[k].avatar)}</i>${RIVALS[k].owner}</button>`).join('')}</div>
            <small class="nm-spec">${NMARKET.specs[o.k]}</small>
            <div class="barn-goods">${ids.map(id => `<button class="bgood${o.id === id ? ' sel' : ''}" data-act="nmPick" data-id="${id}" title="${ITEMS[id].name}">${ico(['item', id])}<b>${state.inventory[id] || 0}</b></button>`).join('')}</div>`;
        if (!o.id) return groups + '<p class="card-sub center">Choisissez le produit qu’il vous manque.</p>';
        const k = G.sellerOf(o.id);
        const max = G.askMaxQty(k);
        o.qty = Math.max(1, Math.min(o.qty, max));
        const price = G.askPrice(o.id, o.qty, o.mult);
        const delay = G.askDelay(k, o.mult);
        return `${groups}<div class="stall-form">
            <div class="card-head">${ico(['item', o.id], 'ico big')}<div class="card-main"><div class="card-title">${ITEMS[o.id].name}</div><div class="card-sub">valeur ${fmt(ITEMS[o.id].sell)} · ${state.inventory[o.id] || 0} en stock · livré par ${RIVALS[k].owner}</div></div></div>
            <div class="form-row"><span>Quantité</span><div class="stepper">${btn('', { act: 'nmQty', data: { d: -5 }, size: 'sm', icon: ['ui', 'minus'], title: 'Moins' })}<b>${o.qty}</b>${btn('', { act: 'nmQty', data: { d: 5 }, size: 'sm', icon: ['ui', 'plus'], title: 'Plus' })}${btn('Max', { act: 'nmQty', data: { d: 999 }, size: 'sm' })}</div></div>
            <div class="form-row"><span>Votre prix</span><div class="chips-row nm-mult">${ASK_MULTS.map(m => `<button class="pick-chip${o.mult === m ? ' on' : ''}" data-act="nmMult" data-m="${m}">${String(m).replace('.', ',')} ×</button>`).join('')}</div></div>
            <div class="stall-sum"><span><b>${fmt(price)}${COIN()}</b> à la livraison (max ${max})</span><small>Livraison dans ${delay >= 60 ? `${Math.floor(delay / 60)} h ${String(delay % 60).padStart(2, '0')}` : `${delay} min`} environ${G.nHearts(k) ? ` · amitié de ${RIVALS[k].owner} : −${Math.round(NMARKET.ask.heartCut * G.nHearts(k) * 100)} %` : ''}</small></div>
        </div>`;
    },
    foot: o => (o.id ? btn('Envoyer la demande', { act: 'nmSend', kind: 'gold', wide: true, size: 'lg' }) : ''),
});

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
        seedShop: (el, d) => (ui.sel.seedShop = d.f),
        sellF: (el, d) => {
            ui.sel.sellF = d.f;
            ui.sel.sellMore = false;
        },
        sellMore: () => (ui.sel.sellMore = true),
        sellTab: (el, d) => (ui.sel.sell = d.v),
        fairSell: (el, d) => G.sellToBuyer(d.id, el),
        fairDismiss: (el, d) => G.dismissBuyer(d.id),
        nbBuy: (el, d) => G.buyNeighborBeast(+d.k, el),
        shopOwned: (el, d) => (ui.sel['own_' + d.id] = !ui.sel['own_' + d.id]),
        nmBuy: (el, d) => G.buyOffer(+d.k, +d.n, el),
        nmCollect: (el, d) => G.collectAsk(+d.n, el),
        nmCancel: (el, d) => G.cancelAsk(+d.n),
        nmPick: (el, d) => (sheetOpts('nmAsk').id = d.id),
        nmWho: (el, d) => (sheetOpts('nmAsk').k = +d.k),
        nmQty: (el, d) => {
            const o = sheetOpts('nmAsk');
            const max = G.askMaxQty(G.sellerOf(o.id));
            o.qty = +d.d === 999 ? max : Math.max(1, Math.min(max, o.qty + +d.d));
        },
        nmMult: (el, d) => (sheetOpts('nmAsk').mult = +d.m),
        nmSend: () => {
            const o = sheetOpts('nmAsk');
            if (G.placeAsk(o.id, o.qty, o.mult)) closeSheet('nmAsk');
        },
        sellSeeds: (el, d) => G.sellSeeds(d.id, 0, el),
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
