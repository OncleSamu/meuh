// 1.100 (étape 3) : la carte de la Maison, votre marque.
import { state } from '../../core/state.js';
import { fmt, formatDuration } from '../../core/format.js';
import { MAISON, MAISON_CLIENTS, EMBLEMS, PALETTES, MAISON_ORDERS, ORDER_KIND_TXT } from '../../data/maison.js';
import { PACKS } from '../../data/paquets.js';
import { ITEMS } from '../../data/items.js';
import * as G from '../../systems/index.js';
import { actions, esc } from '../dom.js';
import { closeSheet, defineSheet } from '../sheets.js';
import { ico } from '../icons.js';
import { btn, segmented, bar, hint } from '../kit.js';
import { renameBtn } from '../sheets/rename.js';
import { QUALITY } from '../../data/farm.js';
import { CAMPING } from '../../data/camping.js';
import { pkHtml } from '../paquets.js';
import { emblemIco } from '../emblem.js';
import '../sheets/emblem.js';
import { setupPaquet } from '../sheets/paquet.js';
import { blocks } from '../dom.js';
import { defineView, ui } from '../app.js';

const COIN = () => ico(['ui', 'coin']);
const costHtml = c =>
    Object.entries(c)
        .map(([k, n]) => (k === 'coins' ? `${fmt(n)}${COIN()}` : `${ico(['item', k])}${n}`))
        .join(' ');
const QN = ['toute qualité', 'argent ou mieux', 'or ou mieux', 'platine ou mieux', 'diamant'];
function label(m, small) {
    const p = PALETTES[m.palette] || PALETTES[0];
    return `<div class="maison-label${small ? ' sm' : ''}" style="background:${p.bg};color:${p.fg};border-color:${p.fg}">${emblemIco(m.emblem)}<b>${esc(m.name)}</b></div>`;
}
function composeBtn() {
    return `${hint('Trois produits de la ferme, au choix, dans la boîte qui leur va. Vous lui donnez le nom que vous voulez.')}
        <div class="od-foot">${btn('Composer', { act: 'open', data: { sheet: 'paquet' }, kind: 'green', size: 'sm', icon: ['ui', 'maison'] })}</div>`;
}
function recipeRow(r) {
    const ok = G.canRemake(r);
    return `<div class="pk-row">${pkHtml(r, 'sm')}<span class="pk-row-main"><b>${esc(r.name)}</b><small>${r.items.map(i => ITEMS[i].name).join(', ')} · ${QUALITY[r.q].name}${G.packCan(r.pack) ? '' : ' · boîte à fabriquer'}</small></span>${btn('Refaire', { act: 'pkRemake', data: { id: r.id }, kind: ok ? 'green' : '', size: 'sm', disabled: !ok })}</div>`;
}
function coffretRow(c) {
    const sells = G.clientsOpen()
        .filter(k => G.canSellTo(c, k))
        .map(k => btn(`${k.name} · ${fmt(G.offerFor(c, k))}`, { act: 'maisonSell', data: { uid: c.uid, id: k.id }, kind: 'green', size: 'sm' }))
        .join('');
    return `<div class="pk-shelf-item">${pkHtml(c)}<div class="pk-shelf-main"><b>${esc(c.name)}</b><small>${fmt(G.pkValue(c))} pièces · ${QN[c.q]}</small>${sells ? `<div class="od-foot">${sells}</div>` : '<small class="card-sub">Aucun client disponible pour l’instant.</small>'}</div></div>`;
}
const tierName = t => `palier ${t + 1}`;
// 1.103 : l'échelle de la renommée, ce que chaque palier ouvre
function fameHtml(tier) {
    return MAISON.rep
        .map((need, t) => {
            const gets = [
                ...MAISON_CLIENTS.filter(k => k.tier === t).map(k => `client : ${k.name.toLowerCase()}`),
                ...PACKS.filter(p => p.tier === t).map(p => p.name.toLowerCase()),
                t && MAISON.times[t] !== MAISON.times[t - 1] ? `atelier en ${MAISON.times[t] / 60000} min` : '',
                t && MAISON.slots[t] !== MAISON.slots[t - 1] ? `${MAISON.slots[t]} paquets à la suite` : '',
            ].filter(Boolean);
            const st = t <= tier ? 'done' : t === tier + 1 ? 'next' : 'off';
            return `<div class="fame-row ${st}"><span class="fame-n">${t + 1}</span><span><b>${t ? `${need} de réputation` : 'Au départ'}</b><small>${gets.join(' · ') || '—'}</small></span>${t <= tier ? ico(['ui', 'check']) : ''}</div>`;
        })
        .join('');
}
function atelierTab(m) {
    const q = G.queue();
    const work = m.work
        ? `<div class="pk-row">${pkHtml({ pack: m.work.pack || 'carton', items: m.work.items, q: m.work.q }, 'sm')}<span class="pk-row-main"><b>À l’atelier : ${esc(m.work.name || 'un paquet')}</b><small>${m.work.items.map(i => ITEMS[i].name).join(', ')} · prêt dans ${formatDuration(G.workLeft() / 1000)}</small></span></div>`
        : '';
    const wait = q.map((w, k) => `<div class="pk-row dim">${pkHtml({ pack: w.pack || 'carton', items: w.items, q: w.q }, 'sm')}<span class="pk-row-main"><b>${k + 2}. ${esc(w.name)}</b><small>en attente</small></span></div>`).join('');
    const room = G.slotsMax() - G.busyCount();
    const compose =
        m.stock.length + G.busyCount() >= MAISON.stock
            ? '<p class="card-sub">L’étagère est pleine : vendez des paquets.</p>'
            : !room
              ? `<p class="card-sub">L’atelier est occupé (${G.busyCount()}/${G.slotsMax()}).</p>`
              : G.stockable().length >= 1
                ? composeBtn()
                : '<p class="card-sub">Rien en stock pour composer un paquet.</p>';
    const head = `<div class="card-title">L’atelier · ${G.busyCount()}/${G.slotsMax()}</div><p class="card-sub">${G.workTime() / 60000} min par paquet${G.slotsMax() > 1 ? ` · ${G.slotsMax()} à la suite` : ''}</p>${hint('La renommée fait aller l’atelier plus vite et permet de lancer plusieurs paquets à la suite (onglet Marque).')}`;
    const rec = G.recipes().length
        ? `<div class="card camp-card"><div class="card-title">Vos recettes de paquets</div>${G.recipes().slice().reverse().slice(0, 5).map(recipeRow).join('')}${hint('Toutes vos recettes sont dans le Livre de la ferme, Collection › Mes paquets.')}</div>`
        : '';
    return `<div class="card camp-card">${head}${work}${wait}${compose}</div>${rec}`;
}
function shelfTab(m) {
    if (!m.stock.length) return '<div class="card camp-card"><p class="card-sub">L’étagère est vide. Composez des paquets à l’atelier.</p></div>';
    const n = G.pkBuyers();
    return `<div class="card camp-card"><div class="card-title">Sur l’étagère (${m.stock.length}/${MAISON.stock})</div>${G.maisonTier() >= 1 ? `<p class="card-sub">${n ? `${n} campeur${n > 1 ? 's' : ''} au camping peu${n > 1 ? 'vent' : 't'} acheter un paquet.` : 'Aucun campeur à servir pour l’instant.'}</p>` : ''}<div class="pk-shelf">${m.stock.map(coffretRow).join('')}</div></div>`;
}
function orderRow(o, i) {
    if (o.due) return `<div class="od-line off">${ico(['ui', 'clock'])}<span><b>Une nouvelle commande</b><small>arrive dans ${formatDuration(Math.max(0, o.due - Date.now()) / 1000)}</small></span></div>`;
    const best = G.bestPkFor(o);
    const deliver = best
        ? btn(`Livrer « ${esc(best.name)} » · ${fmt(G.orderPay(best, o))}${COIN()}`, { act: 'pkOrder', data: { i, uid: best.uid }, kind: 'green', size: 'sm' })
        : btn('Aucun paquet ne convient', { size: 'sm', disabled: true });
    const rc = o.kind === 'recipe' ? G.recipeAt(o.rid) : null;
    const redo = !best && rc ? btn('Refaire', { act: 'pkRemake', data: { id: rc.id }, kind: G.canRemake(rc) ? 'green' : '', size: 'sm', disabled: !G.canRemake(rc) }) : '';
    const pick = best && state.maison.stock.filter(c => G.orderFits(c, o)).length > 1 ? btn('Choisir', { act: 'open', data: { sheet: 'pkOrder', i }, size: 'sm' }) : '';
    const what =
        o.kind === 'recipe'
            ? `<div class="pk-row">${pkHtml({ pack: o.pack || 'carton', items: o.items, q: o.q }, 'sm')}<span class="pk-row-main"><b>Voudrait « ${esc(o.name)} »</b><small>${o.items.map(id => ITEMS[id].name).join(', ')}${o.q ? ` · ${QUALITY[o.q].name} ou mieux` : ''}, ${esc(o.why)}. +${MAISON_ORDERS.friend} d’amitié.</small></span></div>`
            : `<p class="card-sub">Un paquet ${ORDER_KIND_TXT[o.kind]}${o.q ? `, <b>${QUALITY[o.q].name}</b> ou mieux` : ''}, ${esc(o.why)}.</p>`;
    const who = o.vid ? `<span class="avatar xs">${ico(['villager', o.vid])}</span>` : '';
    return `<div class="card camp-card pk-order"><div class="card-title">${who}${esc(o.who)}</div>${what}<div class="od-foot">${deliver}${redo}${pick}${btn('Passer', { act: 'pkSkip', data: { i }, size: 'sm' })}</div></div>`;
}
function ordersTab() {
    const os = G.orders();
    return `${os.map(orderRow).join('')}${hint(`Une commande paie ${String(MAISON_ORDERS.pay).replace('.', ',')} fois la valeur du paquet (plus si elle demande une belle qualité), et rapporte ${MAISON_ORDERS.rep} points de réputation. Une nouvelle arrive ${MAISON_ORDERS.gap / 3600000} h après une livraison.`)}`;
}
function brandTab(m, tier) {
    const quick = EMBLEMS.slice(0, 7).includes(m.emblem) ? EMBLEMS.slice(0, 7) : [m.emblem, ...EMBLEMS.slice(0, 6)];
    const emblems =
        quick.map(id => `<button class="maison-emb${m.emblem === id ? ' on' : ''}" data-act="maisonEmblem" data-id="${id}" aria-label="Emblème">${emblemIco(id)}</button>`).join('') +
        `<button class="maison-emb more" data-act="open" data-sheet="emblem" aria-label="Tous les dessins du jeu">${ico(['ui', 'search'])}<small>Tous</small></button>`;
    const pals = PALETTES.map((p, i) => `<button class="maison-pal${m.palette === i ? ' on' : ''}" data-act="maisonPalette" data-i="${i}" style="background:${p.bg};color:${p.fg}" aria-label="${p.name}">A</button>`).join('');
    const clients = MAISON_CLIENTS.map(k => `<div class="od-line"><span><b>${k.name}</b><small>${k.tier <= tier ? `${k.say} · paie ×${String(k.pay).replace('.', ',')}, ${QN[k.minQ]}` : `S’ouvre au ${tierName(k.tier)}`}</small></span></div>`).join('');
    return `<div class="card camp-card"><div class="od-line"><span><b>Emblème</b></span></div><div class="maison-row">${emblems}</div>
        <div class="od-line"><span><b>Couleurs</b></span></div><div class="maison-row">${pals}</div></div>
        <div class="card camp-card"><div class="card-title">La renommée</div>${fameHtml(tier)}</div>
        <div class="card camp-card"><div class="card-title">Vos clients</div>${clients}${hint(`Un client revient ${MAISON.wait / 3600000} h après un achat ; chaque campeur achète un paquet par séjour.`)}</div>
        ${hint(`Un paquet vaut ses trois produits (avec leur qualité) ×${String(MAISON.base).replace('.', ',')}, plus si les trois sont de genres différents, dans une belle boîte, ou si la réputation est haute. Chaque vente fait monter la réputation.`)}`;
}
const TABS = [
    ['atelier', 'Atelier'],
    ['shelf', 'Étagère'],
    ['orders', 'Commandes'],
    ['brand', 'Marque'],
];
export function maisonCard() {
    if (!G.maisonOpen()) return null;
    if (!G.maisonBuilt()) {
        const ok = G.canFoundMaison();
        return `<div class="card camp-card"><div class="card-head">${ico(['ui', 'maison'], 'ico big')}<div class="card-main"><div class="card-title">La Maison</div><div class="card-sub">Votre propre marque : un atelier où composer des paquets de trois produits à votre étiquette, pour les voisins, les campeurs, le souk, le château.</div></div></div>
            <div class="od-foot">${btn(`Fonder · ${costHtml(MAISON.cost)}`, { act: 'maisonFound', kind: ok ? 'green' : '', size: 'sm', disabled: !ok })}</div></div>`;
    }
    const m = state.maison;
    const tier = G.maisonTier();
    const next = G.maisonNext();
    const cur = TABS.some(t => t[0] === ui.sel.maison) ? ui.sel.maison : 'atelier';
    const sellable = m.stock.filter(c => G.clientsOpen().some(k => G.canSellTo(c, k))).length;
    const ordOk = G.orders().filter(o => G.orderReady(o)).length;
    const seg = segmented(
        TABS.map(([id, name]) => [id, name, null, id === 'shelf' ? sellable : id === 'orders' ? ordOk : 0]),
        cur,
        'maisonTab',
    );
    const body = cur === 'shelf' ? shelfTab(m) : cur === 'orders' ? ordersTab() : cur === 'brand' ? brandTab(m, tier) : atelierTab(m);
    return `<div class="camps"><div class="card camp-card"><div class="card-head maison-head">${label(m)}<div class="card-main"><div class="card-title">Votre marque ${renameBtn('maison', 0, 'Nommer la Maison')}</div><div class="card-sub">Renommée : ${tierName(tier)}${next ? ` · ${m.rep}/${next}` : ' · au sommet'} · ${m.sold} paquet${m.sold > 1 ? 's' : ''} vendu${m.sold > 1 ? 's' : ''}</div>${next ? bar((m.rep - MAISON.rep[tier]) / (next - MAISON.rep[tier]), 'gold') : ''}</div></div></div>
        ${seg}${body}</div>`;
}
// 1.103 : choisir le paquet à livrer pour une commande
defineSheet('pkOrder', {
    title: 'Quel paquet livrer ?',
    render(o) {
        const od = G.orders()[+o.i];
        if (!od || od.due) return '<p class="empty">Cette commande n’est plus là.</p>';
        const list = state.maison.stock.filter(c => G.orderFits(c, od));
        return list.length
            ? list.map(c => `<div class="pk-row">${pkHtml(c, 'sm')}<span class="pk-row-main"><b>${esc(c.name)}</b><small>${QUALITY[c.q].name} · ${fmt(G.orderPay(c, od))} pièces</small></span>${btn('Livrer', { act: 'pkOrder', data: { i: o.i, uid: c.uid }, kind: 'green', size: 'sm' })}</div>`).join('')
            : '<p class="empty">Aucun paquet ne convient.</p>';
    },
});
// 1.103 : vendre un paquet à un campeur, depuis sa fiche au camping
defineSheet('pkGuest', {
    title: 'Proposer un paquet',
    render(o) {
        const g = G.campGuests()[+o.g];
        if (!g || g.pk) return '<p class="empty">Ce campeur a déjà son paquet.</p>';
        const c = MAISON_CLIENTS.find(k => k.camp);
        const list = state.maison ? state.maison.stock.filter(x => G.canSellToGuest(x, g)) : [];
        return list.length
            ? `${g.star != null ? '<p class="card-sub">Un campeur remarquable : un paquet d’argent au moins.</p>' : ''}${list.map(x => `<div class="pk-row">${pkHtml(x, 'sm')}<span class="pk-row-main"><b>${esc(x.name)}</b><small>${QUALITY[x.q].name} · ${fmt(G.offerFor(x, c, g))} pièces</small></span>${btn('Vendre', { act: 'pkGuestSell', data: { g: o.g, uid: x.uid }, kind: 'green', size: 'sm' })}</div>`).join('')}`
            : '<p class="empty">Aucun paquet ne lui convient sur l’étagère.</p>';
    },
});
// 1.101 : la Maison est un volet de l'Atelier (elle ne dépend pas que du camping : voisins, souk, château, vitrine)
defineView('machines/maison', el => {
    if (!G.campOpen()) return blocks(el, [['m', `<div class="card"><p class="card-sub">La Maison, votre marque, s’ouvre au niveau ${CAMPING.lvl}, avec le camping de la vallée.</p></div>`]]);
    blocks(el, [['m', maisonCard() || '<div class="card"><p class="card-sub">Aménagez d’abord le camping de la vallée (Village › Camping) : la Maison se fonde ensuite ici.</p></div>']]);
});
export function setupMaison() {
    setupPaquet();
    actions({
        maisonFound: el => G.foundMaison(el),
        maisonEmblem: (_, d) => G.setEmblem(d.id) && closeSheet('emblem'),
        maisonPalette: (_, d) => G.setPalette(+d.i),
        maisonSell: (el, d) => G.sellCoffret(+d.uid, d.id, el),
        maisonTab: (el, d) => {
            ui.sel.maison = d.v;
        },
        pkOrder: (el, d) => G.deliverOrder(+d.i, +d.uid, el) && closeSheet('pkOrder'),
        pkSkip: (el, d) => G.skipOrder(+d.i),
        pkGuestSell: (el, d) => G.sellToGuest(+d.uid, +d.g, el) && closeSheet('pkGuest'),
        pkRemake: (el, d) => G.remake(+d.id, el),
    });
}
