// 1.100 (étape 3) : la carte de la Maison, votre marque.
import { state } from '../../core/state.js';
import { fmt, formatDuration } from '../../core/format.js';
import { MAISON, MAISON_CLIENTS, EMBLEMS, PALETTES } from '../../data/maison.js';
import { ITEMS } from '../../data/items.js';
import * as G from '../../systems/index.js';
import { actions, esc } from '../dom.js';
import { ico } from '../icons.js';
import { btn } from '../kit.js';
import { renameBtn } from '../sheets/rename.js';
import { QUALITY } from '../../data/farm.js';
import { CAMPING } from '../../data/camping.js';
import { pkHtml } from '../paquets.js';
import { setupPaquet } from '../sheets/paquet.js';
import { blocks } from '../dom.js';
import { defineView } from '../app.js';

const COIN = () => ico(['ui', 'coin']);
const costHtml = c =>
    Object.entries(c)
        .map(([k, n]) => (k === 'coins' ? `${fmt(n)}${COIN()}` : `${ico(['item', k])}${n}`))
        .join(' ');
const QN = ['toute qualité', 'argent ou mieux', 'or ou mieux', 'platine ou mieux', 'diamant'];
function label(m, small) {
    const p = PALETTES[m.palette] || PALETTES[0];
    return `<div class="maison-label${small ? ' sm' : ''}" style="background:${p.bg};color:${p.fg};border-color:${p.fg}">${ico(['item', m.emblem], 'ico')}<b>${esc(m.name)}</b></div>`;
}
function composeBtn() {
    return `<div class="od-line"><span><b>Composer un paquet</b><small>Trois produits de la ferme, au choix, dans la boîte qui leur va. Vous lui donnez le nom que vous voulez.</small></span></div>
        <div class="od-foot">${btn('Composer', { act: 'open', data: { sheet: 'paquet' }, kind: 'green', size: 'sm', icon: ['ui', 'heart'] })}</div>`;
}
function recipeRow(r) {
    const ok = G.canRemake(r);
    return `<div class="pk-row">${pkHtml(r, 'sm')}<span class="pk-row-main"><b>${esc(r.name)}</b><small>${r.items.map(i => ITEMS[i].name).join(', ')} · ${QUALITY[r.q].name}</small></span>${btn('Refaire', { act: 'pkRemake', data: { id: r.id }, kind: ok ? 'green' : '', size: 'sm', disabled: !ok || !!(state.maison && state.maison.work) })}</div>`;
}
function coffretRow(c) {
    const sells = G.clientsOpen()
        .filter(k => G.canSellTo(c, k))
        .map(k => btn(`${k.name} · ${fmt(G.offerFor(c, k))}`, { act: 'maisonSell', data: { uid: c.uid, id: k.id }, kind: 'green', size: 'sm' }))
        .join('');
    return `<div class="pk-shelf-item">${pkHtml(c)}<div class="pk-shelf-main"><b>${esc(c.name)}</b><small>${fmt(c.value)} pièces · ${QN[c.q]}</small>${sells ? `<div class="od-foot">${sells}</div>` : '<small class="card-sub">Aucun client disponible pour l’instant.</small>'}</div></div>`;
}
export function maisonCard() {
    if (!G.maisonOpen()) return null;
    if (!G.maisonBuilt()) {
        const ok = G.canFoundMaison();
        return `<div class="card camp-card"><div class="card-head">${ico(['ui', 'heart'], 'ico big')}<div class="card-main"><div class="card-title">La Maison</div><div class="card-sub">Votre propre marque : un atelier où composer des paquets de trois produits à votre étiquette, pour les voisins, les campeurs, le souk, le château.</div></div></div>
            <div class="od-foot">${btn(`Fonder · ${costHtml(MAISON.cost)}`, { act: 'maisonFound', kind: ok ? 'green' : '', size: 'sm', disabled: !ok })}</div></div>`;
    }
    const m = state.maison;
    const tier = G.maisonTier();
    const next = G.maisonNext();
    const emblems = EMBLEMS.slice(0, G.emblemsOpen())
        .map(id => `<button class="maison-emb${m.emblem === id ? ' on' : ''}" data-act="maisonEmblem" data-id="${id}" aria-label="${ITEMS[id].name}">${ico(['item', id])}</button>`)
        .join('');
    const pals = PALETTES.map((p, i) => `<button class="maison-pal${m.palette === i ? ' on' : ''}" data-act="maisonPalette" data-i="${i}" style="background:${p.bg};color:${p.fg}" aria-label="${p.name}">A</button>`).join('');
    const work = m.work
        ? `<div class="pk-row">${pkHtml({ pack: m.work.pack || 'carton', items: m.work.items, q: m.work.q }, 'sm')}<span class="pk-row-main"><b>À l’atelier : ${esc(m.work.name || 'un paquet')}</b><small>${m.work.items.map(i => ITEMS[i].name).join(', ')} · prêt dans ${formatDuration(G.workLeft() / 1000)}</small></span></div>`
        : m.stock.length >= MAISON.stock
          ? '<p class="card-sub">L’atelier est plein : vendez des paquets.</p>'
          : G.stockable().length >= 1
            ? composeBtn()
            : '<p class="card-sub">Rien en stock pour composer un paquet.</p>';
    const clients = MAISON_CLIENTS.map(k => `<div class="od-line"><span><b>${k.name}</b><small>${k.tier <= tier ? `${k.say} · paie ×${String(k.pay).replace('.', ',')}, ${QN[k.minQ]}` : `Palier ${k.tier + 1} de réputation`}</small></span></div>`).join('');
    return `<div class="camps"><div class="card camp-card"><div class="card-head maison-head">${label(m)}<div class="card-main"><div class="card-title">Votre marque ${renameBtn('maison', 0, 'Nommer la Maison')}</div><div class="card-sub">Réputation : palier ${tier + 1}${next ? ` · ${m.rep}/${next}` : ' · au sommet'} · ${m.sold} paquet${m.sold > 1 ? 's' : ''} vendu${m.sold > 1 ? 's' : ''}</div></div></div>
        <div class="od-line"><span><b>Emblème</b></span></div><div class="maison-row">${emblems}</div>
        <div class="od-line"><span><b>Couleurs</b></span></div><div class="maison-row">${pals}</div></div>
        <div class="card camp-card">${work}</div>
        ${m.stock.length ? `<div class="card camp-card"><div class="card-title">Sur l’étagère (${m.stock.length}/${MAISON.stock})</div><div class="pk-shelf">${m.stock.map(coffretRow).join('')}</div></div>` : ''}
        ${G.recipes().length ? `<div class="card camp-card"><div class="card-title">Vos recettes de paquets</div>${G.recipes().slice().reverse().slice(0, 4).map(recipeRow).join('')}<p class="card-sub">Toutes vos recettes sont dans le Livre de la ferme, Collection › Mes paquets.</p></div>` : ''}
        <div class="card camp-card"><div class="card-title">Vos clients</div>${clients}</div>
        <p class="card-sub">Un paquet vaut 1,3 fois ses produits, plus si les trois sont de genres différents, de belle qualité (jusqu’au diamant), dans une belle boîte, ou si la réputation est haute. Chaque vente fait monter la réputation, qui ouvre de nouveaux clients et emblèmes.</p></div>`;
}
// 1.101 : la Maison est un volet de l'Atelier (elle ne dépend pas que du camping : voisins, souk, château, vitrine)
defineView('machines/maison', el => {
    if (!G.campOpen()) return blocks(el, [['m', `<div class="card"><p class="card-sub">La Maison, votre marque, s’ouvre au niveau ${CAMPING.lvl}, avec le camping de la vallée.</p></div>`]]);
    blocks(el, [['m', maisonCard() || '<div class="card"><p class="card-sub">Aménagez d’abord le camping de la vallée (Ferme › Camping) : la Maison se fonde ensuite ici.</p></div>']]);
});
export function setupMaison() {
    setupPaquet();
    actions({
        maisonFound: el => G.foundMaison(el),
        maisonEmblem: (_, d) => G.setEmblem(d.id),
        maisonPalette: (_, d) => G.setPalette(+d.i),
        maisonSell: (el, d) => G.sellCoffret(+d.uid, d.id, el),
        pkRemake: (el, d) => G.remake(+d.id, el),
    });
}
