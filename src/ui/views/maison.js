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

const COIN = () => ico(['ui', 'coin']);
const costHtml = c =>
    Object.entries(c)
        .map(([k, n]) => (k === 'coins' ? `${fmt(n)}${COIN()}` : `${ico(['item', k])}${n}`))
        .join(' ');
const QN = ['toute qualité', 'argent ou mieux', 'or ou mieux'];
function label(m, small) {
    const p = PALETTES[m.palette] || PALETTES[0];
    return `<div class="maison-label${small ? ' sm' : ''}" style="background:${p.bg};color:${p.fg};border-color:${p.fg}">${ico(['item', m.emblem], 'ico')}<b>${esc(m.name)}</b></div>`;
}
function pickers() {
    const ids = G.stockable();
    const opt = id => `<option value="${id}">${ITEMS[id].name} (${state.inventory[id]})</option>`;
    const sel = n => `<select class="maison-sel" id="maison-p${n}">${ids.map(opt).join('')}</select>`;
    return `<div class="od-line"><span><b>Composer un coffret</b><small>Trois produits de votre ferme : de trois sortes différentes, de belle qualité, il vaut davantage.</small></span></div>
        <div class="maison-form">${sel(1)}${sel(2)}${sel(3)}<select class="maison-sel" id="maison-q">${QN.map((n, i) => `<option value="${i}">${n}</option>`).join('')}</select></div>
        <div class="od-foot">${btn('Assembler', { act: 'maisonMake', kind: 'green', size: 'sm' })}</div>`;
}
function coffretRow(c) {
    const sells = G.clientsOpen()
        .filter(k => G.canSellTo(c, k))
        .map(k => btn(`${k.name} · ${fmt(G.offerFor(c, k))}`, { act: 'maisonSell', data: { uid: c.uid, id: k.id }, kind: 'green', size: 'sm' }))
        .join('');
    return `<div class="od-line"><span><b>${esc(c.name)}</b><small>${fmt(c.value)} pièces · ${QN[c.q]}</small></span></div>${sells ? `<div class="od-foot">${sells}</div>` : '<p class="card-sub">Aucun client disponible pour l’instant.</p>'}`;
}
export function maisonCard() {
    if (!G.maisonOpen()) return null;
    if (!G.maisonBuilt()) {
        const ok = G.canFoundMaison();
        return `<div class="card camp-card"><div class="card-head">${ico(['ui', 'heart'], 'ico big')}<div class="card-main"><div class="card-title">La Maison</div><div class="card-sub">Votre propre marque : un atelier où composer des coffrets de trois produits à votre étiquette, pour les voisins, les campeurs, le souk, le château.</div></div></div>
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
        ? `<div class="od-line"><span><b>À l’atelier</b><small>${m.work.items.map(i => ITEMS[i].name).join(', ')} · prêt dans ${formatDuration(G.workLeft() / 1000)}</small></span></div>`
        : m.stock.length >= MAISON.stock
          ? '<p class="card-sub">L’atelier est plein : vendez des coffrets.</p>'
          : G.stockable().length >= 1
            ? pickers()
            : '<p class="card-sub">Rien en stock pour composer un coffret.</p>';
    const clients = MAISON_CLIENTS.map(k => `<div class="od-line"><span><b>${k.name}</b><small>${k.tier <= tier ? `${k.say} · paie ×${String(k.pay).replace('.', ',')}, ${QN[k.minQ]}` : `Palier ${k.tier + 1} de réputation`}</small></span></div>`).join('');
    return `<div class="camps"><div class="card camp-card"><div class="card-head">${label(m)}<div class="card-main"><div class="card-title">Votre marque ${renameBtn('maison', 0, 'Nommer la Maison')}</div><div class="card-sub">Réputation : palier ${tier + 1}${next ? ` · ${m.rep}/${next}` : ' · au sommet'} · ${m.sold} coffret${m.sold > 1 ? 's' : ''} vendu${m.sold > 1 ? 's' : ''}</div></div></div>
        <div class="od-line"><span><b>Emblème</b></span></div><div class="maison-row">${emblems}</div>
        <div class="od-line"><span><b>Couleurs</b></span></div><div class="maison-row">${pals}</div></div>
        <div class="card camp-card">${work}</div>
        ${m.stock.length ? `<div class="card camp-card"><div class="card-title">En vitrine (${m.stock.length}/${MAISON.stock})</div>${m.stock.map(coffretRow).join('')}</div>` : ''}
        <div class="card camp-card"><div class="card-title">Vos clients</div>${clients}</div>
        <p class="card-sub">Un coffret vaut 1,3 fois ses produits, plus si les trois sont de sortes différentes, de belle qualité, ou si la réputation est haute. Chaque vente fait monter la réputation, qui ouvre de nouveaux clients et emblèmes.</p></div>`;
}
export function setupMaison() {
    actions({
        maisonFound: el => G.foundMaison(el),
        maisonEmblem: (_, d) => G.setEmblem(d.id),
        maisonPalette: (_, d) => G.setPalette(+d.i),
        maisonSell: (el, d) => G.sellCoffret(+d.uid, d.id, el),
        maisonMake: el => {
            const v = n => (document.getElementById('maison-p' + n) || {}).value;
            const q = +((document.getElementById('maison-q') || {}).value || 0);
            return G.makeCoffret([v(1), v(2), v(3)], q, el);
        },
    });
}
