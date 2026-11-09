// 1.101 : un paquet de la Maison, dessiné : l'arrière de la boîte, les trois produits, l'avant de la boîte, l'étiquette de la marque.
import { state } from '../core/state.js';
import { PALETTES } from '../data/maison.js';
import { QUALITY } from '../data/farm.js';
import { packSprite } from '../art/paquets.js';
import { ico, qStar } from './icons.js';

const palOf = () => PALETTES[(state.maison && state.maison.palette) || 0] || PALETTES[0];
const cache = {};
// size : 'sm' | '' | 'lg'
export function pkHtml(c, size = '') {
    const pal = palOf();
    const key = c.pack + pal.bg + pal.fg;
    const spr = cache[key] || (cache[key] = packSprite(c.pack, pal));
    const items = (c.items || []).slice(0, 3);
    const q = c.q || 0;
    const emb = state.maison ? state.maison.emblem : 'apple';
    return `<span class="pk ${size}${q ? ' q' + q : ''}" style="--pq:${(QUALITY[q] && QUALITY[q].color) || 'transparent'};--pk-bg:${pal.bg};--pk-fg:${pal.fg}">
        <span class="pk-back">${spr.back}</span>
        <span class="pk-in">${[0, 1, 2].map(i => `<span class="pk-it i${i}">${items[i] ? ico(['item', items[i]]) : ''}</span>`).join('')}</span>
        <span class="pk-front">${spr.front}</span>
        <span class="pk-tag">${ico(['item', emb])}</span>${q ? `<span class="pk-q">${qStar(q)}</span>` : ''}</span>`;
}
