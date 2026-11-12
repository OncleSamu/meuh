// Atelier | Cave : climat, lots qui vieillissent, réserve, salle des ventes et équipement.
import { state } from '../../core/state.js';
import { now } from '../../core/clock.js';
import { fmt, formatDuration } from '../../core/format.js';
import { ITEMS } from '../../data/items.js';
import { CAVE_FAMILIES, CAVE_IDEAL, CAVE_SHELVES, CAVE_GEAR, CAVE_MULT, NEGOCIANT, BIDDERS, AUCTION_FINDS } from '../../data/cave.js';
import { BARRELS } from '../../data/abbey.js';
import { VILLAGERS } from '../../data/village.js';
import { beerSvg } from '../../art/abbey.js';
import { wineBottle, LABEL_STYLES } from '../../art/items2.js';
import { renameBtn } from '../sheets/rename.js';
import '../sheets/bottle.js';
import * as G from '../../systems/index.js';
import { blocks, actions, esc } from '../dom.js';
import { DAYS_PER_SEASON } from '../../data/world.js';
import { ico, art, qStar } from '../icons.js';
import { QUALITY } from '../../data/farm.js';
import { btn, bar, timer, card, section, empty } from '../kit.js';
import { defineView, defineLive, ui } from '../app.js';
import { foldWrap } from '../fold.js';
import { defineSheet, closeSheet, sheetOpts } from '../sheets.js';
import { askBuy } from '../sheets/askbuy.js';
import { chateauCard, classTag, lotChateauTag, primeurTag, lotChateauActions, reserveChateauActions } from './chateau.js';
import { innerTabs } from '../innertabs.js';

const COIN = () => ico(['ui', 'coin']);
const findIcon = k => AUCTION_FINDS[k].icon;
// l'icône d'un lot : sa bouteille pour une bière, sinon le produit
export const lotIco = (l, cls = 'ico') =>
    l.id === 'beer' && G.beerOf(l.bid)
        ? `<i class="${cls}">${beerSvg(G.beerOf(l.bid))}</i>`
        : l.vy && G.vintageOf(l)
          ? `<i class="${cls}" data-act="open" data-sheet="bottle" data-uid="${l.uid}" role="button" aria-label="Voir la bouteille en grand"><svg viewBox="0 0 64 64">${wineBottle(l.id, { year: l.vy, vq: l.vq, ls: l.ls })}</svg></i>`
          : ico(['item', l.id], cls);
const bottleTools = l =>
    l.vy && G.vintageOf(l)
        ? `<span class="bottle-tools">${renameBtn('lot', l.uid, 'Nommer la cuvée')}<button class="rename-btn" data-act="cycleLabel" data-uid="${l.uid}" aria-label="Changer l’étiquette" title="Étiquette : ${LABEL_STYLES[l.ls || 0].name}">🏷</button></span>`
        : '';
export const lotSub = l =>
    (l.id === 'beer' && BARRELS[l.k] ? ` · ${BARRELS[l.k].name.toLowerCase()}` : '') +
    (G.vintageOf(l) ? ` · ${G.vintageOf(l).name.toLowerCase()} ${l.vy}` : '');

// ---------------- climat ----------------
function gauge(kind, label, icon) {
    const v = Math.round(state.cave[kind]),
        ok = G.inBand(v);
    const dir = v < CAVE_IDEAL[0] ? 1 : v > CAVE_IDEAL[1] ? -1 : 0;
    const go = dir || (v < 50 ? 1 : -1);
    const act = kind === 'temp' ? (go > 0 ? 'Réchauffer' : 'Rafraîchir') : go > 0 ? 'Humidifier' : 'Assécher';
    return `<div class="gauge${ok ? ' ok' : ' off'}">${ico(['ui', icon])}<div class="gauge-main"><div class="gauge-label">${label}<b>${ok ? 'idéal' : dir > 0 ? 'trop bas' : 'trop haut'}</b></div>
        <div class="gauge-bar"><span class="band" style="left:${CAVE_IDEAL[0]}%;width:${CAVE_IDEAL[1] - CAVE_IDEAL[0]}%"></span><span class="needle" style="left:${v}%"></span></div></div>
        ${btn(act, { act: 'nudge', data: { k: kind, d: go }, kind: ok ? '' : 'blue', size: 'sm' })}</div>`;
}

const oddsBar = o =>
    `<div class="odds"><span class="g" style="flex:${o.good + o.stay}"></span><span class="b" style="flex:${o.bad}"></span><span class="r" style="flex:${o.rot}"></span></div>
     <div class="odds-txt"><span>${o.good ? `${Math.round(o.good * 100)} % mieux` : `${Math.round(o.stay * 100)} % stable`}${o.good && o.stay > 0.005 ? ` · ${Math.round(o.stay * 100)} % sans effet` : ''}</span><span>${Math.round(o.bad * 100)} % tourne</span><span>${Math.round(o.rot * 100)} % perdu</span></div>`;

defineLive('lot', i => {
    const lot = state.cave.slots[i];
    if (!lot || lot.bad) return 0;
    return 1 - Math.max(0, lot.next - now()) / G.caveStep(lot.id);
});

function lotCard(lot, i) {
    if (!lot) return `<button class="cave-slot empty" data-act="open" data-sheet="cavePut" data-slot="${i}"><b>+</b><span>Mettre en cave</span></button>`;
    const fam = G.caveFam(lot.id);
    const o = G.lotOdds(lot);
    const need = G.careNeeded(lot),
        bk = G.boostKind(lot);
    const stars = Array.from({ length: 4 }, (_, k) => `<i class="${k < lot.rank ? 'on' : ''}"></i>`).join('');
    return `<div class="cave-slot${lot.bad ? ' bad' : ''} r${lot.rank}${lot.flash ? ' flash' : ''}" data-anchor="lot:${i}">
        <div class="cs-top">${lotIco(lot, 'ico cs-ico')}<div class="cs-main"><div class="cs-name">${G.lotName(lot)} <small>×${lot.n}</small>${bottleTools(lot)}</div>
        <div class="cs-rank">${G.rankName(lot)}${lotSub(lot)}</div><div class="cs-stars">${stars}</div></div></div>
        ${lotChateauTag(lot)}${primeurTag(lot)}
        <div class="cs-value">${fmt(G.lotValue(lot))}${COIN()}</div>
        ${
            lot.bad
                ? '<div class="card-sub">Il ne vieillira plus : sortez-le.</div>'
                : `<div class="cs-timer">${bar(0, '', `lot:${i}`)}${timer(lot.next)}</div>
                   ${lot.tasted ? oddsBar(o) : `<div class="card-sub">${lot.rank >= 4 ? 'Légendaire : il ne gagnera plus rien' : need ? 'À soigner une fois pendant cette étape' : 'Goûtez-le pour connaître ses chances'}</div>`}`
        }
        <div class="cs-actions">
            ${need ? btn(fam.care, { act: 'careLot', data: { i }, kind: 'gold', size: 'sm', icon: ['ui', fam.careIcon] }) : ''}
            ${!lot.bad && lot.n >= 2 && !lot.tasted ? btn('Goûter', { act: 'tasteLot', data: { i }, size: 'sm', icon: ['ui', 'taste'] }) : ''}
            ${bk && state.inventory[bk] > 0 && !lot.boost ? btn('+15 %', { act: 'boostLot', data: { i }, size: 'sm', icon: ['item', bk], title: ITEMS[bk].name }) : ''}
            ${lotChateauActions(lot, i)}
            ${btn('Sortir', { act: 'takeOut', data: { i }, size: 'sm', kind: lot.bad || lot.rank >= 4 ? 'green' : '' })}
        </div>
        ${lot.boost ? `<span class="cs-boost">${ico(['item', bk || 'ferment'])}${lot.boost}</span>` : ''}
    </div>`;
}

function reserveHtml() {
    const c = state.cave,
        a = c.auction,
        canDep = !a.lots && !a.over && a.deposits.length < G.depositMax();
    if (!c.reserve.length) return null;
    return (
        section('Réserve') +
        `<div class="list">${c.reserve
            .map(
                l => `<div class="card reserve-row${l.bad ? ' bad' : ''}">${lotIco(l, 'ico big')}<div class="card-main"><div class="card-title">${G.lotName(l)} ×${l.n}${bottleTools(l)}</div>
        <div class="card-sub">${G.rankName(l)}${classTag(l)} · vaut ${fmt(G.lotValue(l))}${COIN()}</div></div>
        <div class="card-side col">${btn(`Négociant ${fmt(G.lotValue(l) * NEGOCIANT)}${COIN()}`, { act: 'negociant', data: { uid: l.uid }, size: 'sm' })}
        ${btn('Aux enchères', { act: 'deposit', data: { uid: l.uid }, size: 'sm', kind: 'gold', icon: ['ui', 'gavel'], disabled: !canDep })}
        ${reserveChateauActions(l)}
        ${G.vaultOpen() ? btn('Au coffre', { act: 'vaultLot', data: { uid: l.uid }, size: 'sm', icon: ['ui', 'vault'] }) : ''}</div></div>`,
            )
            .join('')}</div>`
    );
}

const bidderIco = id => (id === 'you' ? ico(['ui', 'star']) : ico(['villager', id]));

function lastSaleHtml(last) {
    return `<div class="card auction-card done"><div class="card-head">${ico(['ui', 'gavel'], 'ico big')}<div class="card-main"><div class="card-title">${last.big ? 'La grande vente' : 'La vente'} : résultats</div></div></div>
        <div class="list">${last.results
            .map(l =>
                l.kind === 'sell'
                    ? `<div class="auc-res${l.sold ? ' sold' : ''}">${lotIco(l.lot)}<div class="card-main"><b>${G.lotName(l.lot)} ×${l.lot.n}</b><small>${l.sold ? `Adjugé à ${G.bidderName(l.leader)}` : 'Invendu : revenu en réserve'}</small></div>${l.sold ? `<b class="gold">${fmt(l.price)}${COIN()}</b>` : ''}</div>`
                    : `<div class="auc-res${l.won ? ' sold' : ''}">${ico(findIcon(l.find))}<div class="card-main"><b>${AUCTION_FINDS[l.find].name}</b><small>${l.won ? 'Pour vous !' : l.leader ? `Parti chez ${G.bidderName(l.leader)}` : 'Sans preneur'}</small></div>${l.won ? `<b>−${fmt(l.price)}${COIN()}</b>` : ''}</div>`,
            )
            .join('')}</div>
        ${btn('Vu !', { act: 'dismissAuction', wide: true })}</div>`;
}

function liveLot(l, k) {
    const name = l.kind === 'sell' ? `${G.lotName(l.lot)} ×${l.lot.n}` : AUCTION_FINDS[l.find].name;
    const sub =
        l.kind === 'sell'
            ? `${G.rankName(l.lot)} · réserve ${fmt(l.reserve)}${COIN()}${l.leader && l.price < l.reserve ? ' (pas encore atteinte)' : ''}`
            : AUCTION_FINDS[l.find].desc;
    return `<div class="live-lot${l.done ? ' done' : ''}${l.flash && now() - l.flash < 900 ? ' bump' : ''}">${l.kind === 'sell' ? lotIco(l.lot, 'ico big') : ico(findIcon(l.find), 'ico big')}
        <div class="card-main"><div class="card-title">${name}</div><div class="card-sub">${sub}</div>
        <div class="live-row">${l.leader ? `${bidderIco(l.leader)}<span>${G.bidderName(l.leader)}</span>` : '<span>Pas encore d’offre</span>'}<b class="live-price">${fmt(l.price)}${COIN()}</b></div></div>
        <div class="card-side col">${l.done ? '<b>Adjugé</b>' : `<span class="timer-pill">${ico(['ui', 'clock'])}${timer(l.end)}</span>`}
        ${l.kind === 'buy' && !l.done ? btn(l.leader === 'you' ? 'En tête' : `Enchérir ${fmt(G.bidAsk(l))}`, { act: 'bid', data: { k }, size: 'sm', kind: l.leader === 'you' ? '' : 'gold', disabled: l.leader === 'you' }) : ''}</div></div>`;
}

function saleHtml() {
    const a = state.cave.auction,
        last = G.lastSaleShown();
    const title = a.big ? 'La grande vente du soir' : 'Vente aux enchères';
    let html = last ? lastSaleHtml(last) : '';
    if (a.lots)
        return (
            html +
            `<div class="card auction-card live"><div class="card-head">${ico(['ui', 'gavel'], 'ico big')}<div class="card-main"><div class="card-title">${title} : en direct</div><div class="card-sub">Les enchères montent… Une offre de dernière seconde prolonge la vente.</div></div></div>
        <div class="list">${a.lots.map(liveLot).join('')}</div></div>`
        );
    html += `<div class="card auction-card"><div class="card-head">${ico(['ui', 'gavel'], 'ico big')}<div class="card-main"><div class="card-title">${title}</div>
        <div class="card-sub">Dans ${timer(a.startAt, 'b')} · jusqu’à ${G.depositMax()} lots${a.big ? ', collectionneurs et lots rares' : ''}</div></div></div>
        ${
            a.deposits.length
                ? `<div class="list">${a.deposits
                      .map(
                          d => `<div class="dep-row">${lotIco(d.lot, 'ico big')}<div class="card-main"><div class="card-title">${G.lotName(d.lot)} ×${d.lot.n}</div>
                <div class="card-sub">${G.rankName(d.lot)} · estimé ${fmt(G.lotValue(d.lot))}${COIN()}</div>
                <div class="stepper">${btn('', { act: 'reserve', data: { uid: d.lot.uid, d: -1 }, size: 'sm', icon: ['ui', 'minus'], title: 'Baisser la réserve' })}<span>Réserve <b>${fmt(d.reserve)}</b>${COIN()}</span>${btn('', { act: 'reserve', data: { uid: d.lot.uid, d: 1 }, size: 'sm', icon: ['ui', 'plus'], title: 'Monter la réserve' })}</div></div>
                ${btn('', { act: 'withdraw', data: { uid: d.lot.uid }, size: 'sm', icon: ['ui', 'cross'], title: 'Retirer' })}</div>`,
                      )
                      .join('')}</div>`
                : '<p class="card-sub">Sortez un lot de la cave, puis touchez « Aux enchères » dans la réserve.</p>'
        }
        ${a.finds.length ? `<div class="card-sub"><b>Lots rares à cette vente :</b> ${a.finds.map(k => AUCTION_FINDS[k].name.toLowerCase()).join(', ')}</div>` : ''}
        <div class="bidders">${G.bidderPool(a.big)
            .slice(0, 8)
            .map(id => `<i class="ico" title="${BIDDERS[id].name}">${art('villager', id)}</i>`)
            .join('')}</div></div>`;
    return html;
}

// les lots légendaires : les trophées de la cave
// 1.120 : le millésime de l'année et son palmarès
function millHtml() {
    G.millTick();
    const M = G.ensureMill();
    const b = M.best;
    const daysLeft = 4 * DAYS_PER_SEASON - ((state.day - 1) % (4 * DAYS_PER_SEASON));
    const pic = x => (x.id === 'beer' && G.beerOf(x.bid) ? `<i class="ico big">${beerSvg(G.beerOf(x.bid))}</i>` : ico(x.id === 'beer' ? ['ui', 'beer'] : ['item', x.id], 'ico big'));
    const list = M.list
        .slice(0, 6)
        .map(x => `<div class="trophy cave-legend">${pic(x)}<b>${esc(x.name)}</b><small>Année ${x.y}</small><small>${fmt(x.prize)}${COIN()}</small></div>`)
        .join('');
    return `<div class="card mill-card"><div class="card-head">${ico(['ui', 'trophy'], 'ico big')}<div class="card-main"><div class="card-title">Millésime de l’année ${M.y}</div>
        <div class="card-sub">${b ? `En tête : <b>${esc(b.name)}</b> (${fmt(b.u)}${COIN()} la bouteille)` : 'Aucune bouteille sortie cette année'} · encore ${daysLeft} jour${daysLeft > 1 ? 's' : ''} de jeu</div></div></div>
        <p class="card-sub">À la fin de l’année, la bouteille la plus chère sortie de la cave entre au palmarès : elle rapporte quatre fois sa valeur et 2 points de renommée.${b ? ` Aujourd’hui : ${fmt(G.millPrize(b))}${COIN()}.` : ''}</p>
        ${list ? `<div class="set-sub">Le palmarès</div><div class="trophy-grid">${list}</div>` : ''}</div>`;
}

function legendsHtml() {
    const L = G.caveLegends();
    if (!L.length) return '';
    return (
        section('Trophées de la cave', btn('Salle des trophées', { act: 'open', data: { sheet: 'trophies' }, size: 'sm', kind: 'ghost' })) +
        `<div class="trophy-grid">${L.map(([f, x]) => legendCell(f, x)).join('')}</div>`
    );
}
export function legendCell(f, x) {
    const icon =
        x.id === 'beer' && G.beerOf(x.bid)
            ? `<i class="ico big">${beerSvg(G.beerOf(x.bid))}</i>`
            : ico(x.id === 'beer' ? ['ui', 'beer'] : ['item', x.id], 'ico big');
    return `<div class="trophy cave-legend">${icon}<b>${x.name}</b><small>${CAVE_FAMILIES[f].name} · ${x.n} légendaire${x.n > 1 ? 's' : ''}</small><small>${fmt(x.best)}${COIN()}</small></div>`;
}

function gearHtml() {
    const c = state.cave;
    return (
        section('Équipement') +
        `<div class="list">${Object.entries(CAVE_GEAR)
            .map(([k, g]) =>
                card({
                    icon: ['ui', g.icon],
                    title: g.name,
                    sub: g.desc,
                    side: c.gear[k]
                        ? `<span class="chip ok">${ico(['ui', 'check'])}installé</span>`
                        : btn(
                              `${fmt(g.cost)}${COIN()}${
                                  g.mats
                                      ? Object.entries(g.mats)
                                            .map(([m, n]) => ` ${ico(['item', m])}${n}`)
                                            .join('')
                                      : ''
                              }`,
                              { act: 'caveGear', data: { k }, kind: 'green', size: 'sm', disabled: !(state.money >= g.cost && (!g.mats || G.hasMats(g.mats))) },
                          ),
                }),
            )
            .join(
                '',
            )}${c.gear.oldBarrel ? card({ icon: ['ui', 'barrel'], title: 'Fût centenaire', sub: AUCTION_FINDS.oldBarrel.desc, side: `<span class="chip ok">${ico(['ui', 'check'])}à vous</span>` }) : ''}</div>`
    );
}

// ---------------- 1.6.3 : les commandes de la cave ----------------
function ordersHtml() {
    const c = state.cave;
    if (!c.orders || !c.orders.length) return '';
    return (
        section('Commandes') +
        `<div class="list">${c.orders
            .map(o => {
                const l = G.caveOrderLot(o),
                    v = VILLAGERS[o.vid];
                return `<div class="card brew-order${l ? ' ready' : ''}"><div class="card-art">${art('villager', o.vid)}</div><div class="card-main"><div class="card-title">${v ? v.name : ''}</div>
                    <div class="card-sub">« Je voudrais ${G.caveOrderText(o)}. »</div>
                    ${l ? `<div class="card-sub">Avec : <b>${G.lotName(l)}</b> (${G.rankName(l)}) · ${fmt(G.caveOrderPay(o, l))}${COIN()}</div>` : '<div class="card-sub">Rien dans la réserve ne convient encore : sortez un lot assez vieux.</div>'}</div>
                    <div class="card-side">${btn('Livrer', { act: 'caveOrder', data: { id: o.id }, kind: 'green', size: 'sm', disabled: !l })}${btn('', { act: 'caveOrderDrop', data: { id: o.id }, icon: ['ui', 'cross'], kind: 'ghost', size: 'sm', title: 'Refuser' })}</div></div>`;
            })
            .join('')}</div>`
    );
}

// ---------------- 1.62 : les vins de cépage en bouteilles ----------------
function cepageHtml() {
    const list = G.cepBottles();
    if (!list.length) return '';
    const free = state.cave.slots.findIndex(l => !l);
    return (
        section(list.every(e => e.race) ? 'Fromages de race' : list.some(e => e.race) ? 'Cépages et fromages de race' : 'Vins de cépage') +
        `<div class="list">${list
            .map(e => {
                const r = G.cepRanks(e.id);
                const chips = [4, 3, 2, 1]
                    .filter(k => r[k])
                    .map(k => `<span class="qchip">${qStar(k)}${r[k]} ${QUALITY[k].name}</span>`)
                    .join('');
                return `<div class="card cep-bottle"><div class="card-art">${art('item', e.item)}</div><div class="card-main"><div class="card-title">${G.cepName(e)}</div>
                    <div class="card-sub">×${G.cepCount(e.id)} · valeur ×${String(e.mult).replace('.', ',')} grâce à la ${e.race ? 'race' : 'variété'}</div>${chips ? `<span class="var-ranks">${chips}</span>` : ''}</div>
                    <div class="card-side">${free >= 0 ? btn('En cave', { act: 'open', data: { sheet: 'cavePut', slot: free, id: 'cep:' + e.id }, kind: 'green', size: 'sm' }) : ''}${btn(`Vendre ${fmt(G.cepValue(e.id))}${COIN()}`, { act: 'sellCep', data: { id: e.id }, kind: 'gold', size: 'sm' })}</div></div>`;
            })
            .join('')}</div>`
    );
}

// le climat : deux jauges, ou une petite ligne quand l'hygromètre s'en occupe
function climHtml() {
    const c = state.cave;
    if (!c.gear.hygro) return gauge('temp', 'Température', 'thermo') + gauge('hum', 'Humidité', 'hygro');
    const ok = G.climOk();
    return `<div class="clim-mini${ok ? ' ok' : ''}">${ico(['ui', 'hygro'])}<span>${ok ? 'Climat idéal' : 'Le climat revient dans la bonne zone'} · ${Math.round(c.temp)}° · ${Math.round(c.hum)} % d’humidité</span><small>réglé par l’hygromètre</small></div>`;
}

// 1.38 : les places libres tiennent sur une seule ligne au lieu d'une grande case chacune
function freeRow(slots) {
    const free = slots.map((l, i) => (l ? -1 : i)).filter(i => i >= 0);
    if (!free.length) return '';
    return `<button class="cave-slot empty free-row" data-act="open" data-sheet="cavePut" data-slot="${free[0]}"><b>+</b><span>Mettre en cave · ${free.length} place${free.length > 1 ? 's' : ''} libre${free.length > 1 ? 's' : ''}</span></button>`;
}

function chateauFold() {
    const html = chateauCard();
    if (!html) return null;
    const c = G.ensureChateau();
    const serve = G.shopOpen() ? c.vis.filter(v => G.haveWine(v)).length : 0;
    const sum = `${G.repStars()} étoile${G.repStars() > 1 ? 's' : ''}${G.shopOpen() ? ` · ${c.vis.length} visiteur${c.vis.length > 1 ? 's' : ''}${serve ? `, ${serve} à servir` : ''}` : ''}`;
    return foldWrap('chateau', ['ui', 'star'], 'Le château de Margaux', sum, html, serve > 0);
}

// 1.117 : l'état de la cave, en tête des Lots : ce qui attend, avec un geste pour chaque chose
function stateHtml(c, needCare, finished, auction) {
    const free = c.slots.filter(l => !l).length;
    const ready = G.caveOrdersReady();
    const items = [];
    if (!G.climOk()) items.push(['warn', 'Le climat abîme vos lots', 'caveGo', 'clim', 'Régler']);
    if (needCare) items.push(['care', `${needCare} lot${needCare > 1 ? 's' : ''} à soigner`, 'careAll', '', 'Tout soigner']);
    if (finished) items.push(['done', `${finished} lot${finished > 1 ? 's' : ''} fini${finished > 1 ? 's' : ''}`, 'takeOutDone', '', 'Sortir']);
    if (ready) items.push(['order', `${ready} client${ready > 1 ? 's' : ''} servi${ready > 1 ? 's' : ''} par vos lots`, 'caveGo', 'orders', 'Voir']);
    if (auction) items.push(['auction', 'Une vente aux enchères en cours', 'caveGo', 'sales', 'Voir']);
    if (free) items.push(['free', `${free} place${free > 1 ? 's' : ''} libre${free > 1 ? 's' : ''}`, 'open', 'cavePut', 'Remplir']);
    if (!items.length) return '<div class="cave-state ok">Tout va bien dans la cave : rien à faire pour l’instant.</div>';
    return `<div class="cave-state">${items
        .map(
            ([k, text, act, v, label]) =>
                `<div class="cave-state-row ${k}"><span>${text}</span>${
                    act === 'open'
                        ? `<button class="btn sm" data-act="open" data-sheet="cavePut" data-slot="${c.slots.findIndex(l => !l)}">${label}</button>`
                        : btn(label, { act, data: v ? { v } : {}, size: 'sm', kind: k === 'warn' ? 'gold' : '' })
                }</div>`,
        )
        .join('')}</div>`;
}
function renderCave(el) {
    if (!G.caveOpen()) return blocks(el, [['lock', empty('La cave s’ouvre au niveau 20.')]]);
    G.ensureCave();
    const c = state.cave;
    const needCare = c.slots.filter(l => l && G.careNeeded(l)).length;
    const nextShelf = CAVE_SHELVES[c.shelves];
    // 1.73 : quatre onglets au lieu d'une page de neuf écrans
    const finished = c.slots.filter(l => l && (l.bad || l.rank >= 4)).length;
    const auction = c.auction && c.auction.lots && !c.auction.over;
    const T = innerTabs(
        'cave',
        [
            ['lots', 'Lots', null, needCare + finished],
            ['sales', 'Réserve', null, auction ? 1 : 0],
            ['orders', 'Clients', null, G.caveOrdersReady()],
            ['gear', 'Matériel', null, 0],
        ],
        'lots',
    );
    const t = T.cur;
    blocks(el, [
        ['tabs', T.html],
        [
            'clim',
            t === 'lots'
                ? `<div class="card cave-clim"><div class="card-head">${ico(['ui', 'cave'], 'ico big')}<div class="card-main"><div class="card-title">La cave</div>
            <div class="card-sub">Cote de la cave : <b>${Math.round(c.cote)}</b> / 100 · lots de ${G.caveLotMax()} au plus${G.climOk() ? '' : ' · le climat abîme vos lots'}</div></div></div>
            ${stateHtml(c, needCare, finished, auction)}
            <div id="cave-clim-box">${climHtml()}</div></div>`
                : '',
        ],
        ['cepage', t === 'sales' ? cepageHtml() : ''],
        [
            'slots',
            t === 'lots'
                ? `<div class="cave-grid">${c.slots.map((l, i) => (l ? lotCard(l, i) : '')).join('')}${freeRow(c.slots)}${
                      nextShelf !== undefined
                          ? `<button class="cave-slot locked" data-act="buyShelf"${state.money < nextShelf ? ' disabled' : ''}>${ico(['ui', 'shelf'])}<span>Étagère : +2 places${c.shelves % 2 ? ', lots plus grands' : ''}</span><b>${fmt(nextShelf)}${COIN()}</b></button>`
                          : ''
                  }</div>`
                : '',
        ],
        ['sale', t === 'sales' ? saleHtml() : ''],
        [
            'reserve',
            t === 'sales' ? reserveHtml() || empty('La réserve est vide : sortez un lot de la cave pour le vendre, l’envoyer aux enchères ou au coffre.') : '',
        ],
        ['chateau', t === 'sales' ? chateauFold() : ''],
        ['mill', t === 'sales' ? millHtml() : ''],
        ['legends', t === 'sales' ? legendsHtml() : ''],
        ['orders', t === 'orders' ? ordersHtml() || empty('Pas de commande pour le moment : les habitués de la cave passent régulièrement.') : ''],
        ['gear', t === 'gear' ? gearHtml() : ''],
    ]);
    c.slots.forEach(l => l && (l.flash = 0));
}
defineView('machines/cave', renderCave);

// ---------------- mettre en cave ----------------
// o.id : un produit, ou 'beer:<bid>' pour une bière de la brasserie (qui choisit aussi son fût, o.k)
// 1.62 : 'cep:<cid>' pour une cuvée de cépage
const putList = () => [...G.cepBottles().map(e => 'cep:' + e.id), ...G.caveCandidates(), ...G.caveBeers().map(b => 'beer:' + b.id)];
const putBid = o => (o.id && o.id.startsWith('beer:') ? o.id.slice(5) : null);
const putCep = o => (o.id && o.id.startsWith('cep:') ? o.id.slice(4) : null);
const putHave = o => (putBid(o) ? G.beerStock(putBid(o)) : putCep(o) ? G.cepCount(putCep(o)) : state.inventory[o.id] || 0);
const barrelCanPay = k => (BARRELS[k].item ? G.barrelOk(k) : state.money >= BARRELS[k].cost);
defineSheet('cavePut', {
    title: 'Mettre en cave',
    open(o) {
        const list = putList();
        o.id = o.id && list.includes(o.id) ? o.id : list[0] || null;
        o.k = 'oak';
        o.n = o.id ? Math.min(G.caveLotMax(), putHave(o)) : 1;
    },
    render(o) {
        const list = putList();
        if (o.id && !list.includes(o.id)) o.id = list[0] || null;
        if (!list.length)
            return `<p class="empty">Rien à mettre en cave pour l’instant. Fabriquez du fromage à la laiterie ou du cidre au pressoir${G.projectDone('chai') ? ', du vin à la cuverie' : ''}${G.cellarOpen() ? ', ou brassez une bière' : ''}.</p>`;
        const max = Math.min(G.caveLotMax(), putHave(o));
        o.n = Math.max(1, Math.min(o.n, max));
        const bid = putBid(o),
            beer = bid && G.beerOf(bid),
            cid = putCep(o),
            cep = cid && G.ensureCepage().list[cid];
        const cells = list
            .map(id => {
                if (id.startsWith('cep:')) {
                    const e = G.ensureCepage().list[id.slice(4)];
                    return `<button class="pick-cell${o.id === id ? ' on' : ''}" data-act="cavePick" data-id="${id}">${ico(['item', e.item], 'ico big')}<b>${G.cepName(e)}</b><small>×${G.cepCount(e.id)} · cépage</small></button>`;
                }
                if (id.startsWith('beer:')) {
                    const b = G.beerOf(id.slice(5));
                    return `<button class="pick-cell${o.id === id ? ' on' : ''}" data-act="cavePick" data-id="${id}"><span class="pc-art">${beerSvg(b)}</span><b>${b.name}</b><small>×${G.beerStock(b.id)} · ${b.mead ? 'hydromel' : 'bière'}</small></button>`;
                }
                return `<button class="pick-cell${o.id === id ? ' on' : ''}" data-act="cavePick" data-id="${id}">${ico(['item', id], 'ico big')}<b>${ITEMS[id].name}</b><small>×${state.inventory[id]} · ${G.caveFam(id).name.toLowerCase()}</small></button>`;
            })
            .join('');
        const kinds = beer
            ? section('Le fût') +
              `<div class="pick-grid">${Object.entries(BARRELS)
                  .map(
                      ([k, b]) =>
                          `<button class="pick-cell${o.k === k ? ' on' : ''}${barrelCanPay(k) ? '' : ' locked'}" data-act="caveBarrel" data-k="${k}">${ico(b.item ? ['item', b.item] : ['ui', 'barrel'], 'ico big')}<b>${b.name}</b><small>${b.item ? `1 ${ITEMS[b.item].name.toLowerCase()} (${state.inventory[b.item] || 0} en stock)` : `${fmt(b.cost)} pièces`} · valeur ×${String(b.mult).replace('.', ',')}</small></button>`,
                  )
                  .join('')}</div>`
            : '';
        const unit = beer ? beer.value * BARRELS[o.k].mult : cep ? ITEMS[cep.item].sell * cep.mult : ITEMS[o.id].sell;
        const step = G.caveStep(beer ? 'beer' : cep ? cep.item : o.id);
        const lq = beer ? G.beerPutQuality(bid, o.n) : cep ? G.cepPutQuality(cid, o.n) : o.id ? G.putQuality(o.id, o.n) : 0;
        return `<div class="pick-grid">${cells}</div>${kinds}
           ${lq ? `<p class="card-sub center cave-q">${qStar(lq)} Lot en ${QUALITY[lq].name} : il gardera sa qualité (vaut ×${String(QUALITY[lq].mult).replace('.', ',')}) et vieillit un peu mieux.</p>` : ''}
           <div class="stepper big">${btn('', { act: 'caveQty', data: { d: -1 }, icon: ['ui', 'minus'], disabled: o.n <= 1, title: 'Moins' })}<span><b>${o.n}</b> × ${beer || cep ? 'bouteille' + (o.n > 1 ? 's' : '') : ITEMS[o.id].name.toLowerCase()}</span>${btn('', { act: 'caveQty', data: { d: 1 }, icon: ['ui', 'plus'], disabled: o.n >= max, title: 'Plus' })}</div>
           <p class="card-sub center">Une étape toutes les ${formatDuration(step / 1000)}, un soin par étape. Valeur jeune : ${fmt(unit * o.n)}${COIN()}, légendaire : ${fmt(unit * o.n * CAVE_MULT[4])}${COIN()}</p>`;
    },
    foot: o =>
        o.id
            ? btn(putBid(o) ? 'Mettre en fût' : 'Mettre en cave', {
                  act: 'putInCave',
                  kind: 'green',
                  wide: true,
                  size: 'lg',
                  disabled: !!putBid(o) && !barrelCanPay(o.k),
              })
            : '',
});

export function setupCave() {
    const put = () => sheetOpts('cavePut');
    actions({
        nudge: (el, d) => G.nudgeClimate(d.k, +d.d),
        careLot: (el, d) => G.careLot(+d.i, el),
        careAll: el => G.careAll(el),
        // 1.117 : un geste de l'état de la cave : changer d'onglet, ou descendre jusqu'au climat
        caveGo: (el, d) => {
            if (d.v === 'clim') return void document.getElementById('cave-clim-box')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            ui.sel['it:cave'] = d.v;
        },
        cycleLabel: (el, d) => G.cycleLabel(d.uid),
        tasteLot: (el, d) => G.tasteLot(+d.i, el),
        boostLot: (el, d) => G.boostLot(+d.i),
        // 1.73 : sortir d'un coup les lots tournés ou légendaires
        takeOutDone: el => state.cave.slots.forEach((l, i) => l && (l.bad || l.rank >= 4) && G.takeOut(i, el)),
        takeOut: (el, d) => G.takeOut(+d.i, el),
        negociant: (el, d) => G.sellNegociant(+d.uid, el),
        deposit: (el, d) => G.depositLot(+d.uid),
        withdraw: (el, d) => G.withdrawLot(+d.uid),
        reserve: (el, d) => G.setReserve(+d.uid, +d.d),
        bid: (el, d) => G.playerBid(+d.k, el),
        dismissAuction: () => G.dismissAuction(),
        buyShelf: el =>
            askBuy(
                { title: 'Une étagère de plus', icon: ['ui', 'shelf'], text: 'Deux places de plus en cave.', cost: G.shelfCost(), run: at => G.buyShelf(at) },
                el,
            ),
        caveGear: (el, d) => G.buyCaveGear(d.k, el),
        cavePick: (el, d) => {
            const o = put();
            o.id = d.id;
            o.n = Math.min(G.caveLotMax(), putHave(o));
        },
        caveBarrel: (el, d) => (put().k = d.k),
        caveQty: (el, d) => (put().n += +d.d),
        putInCave: el => {
            const o = put(),
                bid = putBid(o);
            const cid = putCep(o);
            if (bid ? G.putBeerInCave(+o.slot, bid, o.n, o.k, el) : cid ? G.putCepageInCave(+o.slot, cid, o.n, el) : G.putInCave(+o.slot, o.id, o.n, el))
                closeSheet('cavePut');
        },
        caveOrder: (el, d) => G.deliverCaveOrder(d.id, el),
        sellCep: (el, d) => G.sellCepage(d.id, G.cepCount(d.id), el),
        caveOrderDrop: (el, d) => G.dismissCaveOrder(d.id),
    });
}
