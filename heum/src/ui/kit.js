// Heum — petites briques d'interface.
import { art } from '../art/index.js';
import { fmt, dur } from '../core/format.js';
import { now } from '../core/clock.js';

export const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
export const ico = (id, cls = 'ico') => `<i class="${cls}">${art(id)}</i>`;
const dataAttrs = data =>
    Object.entries(data || {})
        .map(([k, v]) => ` data-${k}="${esc(v)}"`)
        .join('');
export function btn(label, act, data = {}, o = {}) {
    return `<button class="btn ${o.kind || ''} ${o.size || ''}" data-act="${act}"${dataAttrs(data)}${o.disabled ? ' disabled' : ''}>${o.icon ? ico(o.icon) : ''}<span>${label}</span></button>`;
}
export const bar = (frac, col = '', cls = '') =>
    `<span class="bar ${cls}"><b style="width:${Math.max(0, Math.min(1, frac)) * 100}%${col ? `;background:${col}` : ''}"></b></span>`;
// une minuterie qui se met à jour toute seule chaque seconde (data-end : l'heure de fin)
export const timer = (secLeft, total) =>
    `<span class="timer" data-end="${now() + secLeft * 1000}"${total ? ` data-total="${total}"` : ''}>${dur(secLeft)}</span>`;
export const prog = (secLeft, total) =>
    `<span class="bar prog" data-end="${now() + secLeft * 1000}" data-total="${total}"><b style="width:${(1 - secLeft / total) * 100}%"></b></span>`;
export const money = n => `<span class="money">${ico('coin')}${fmt(n)}</span>`;
export const card = (body, cls = '') => `<section class="card ${cls}">${body}</section>`;
export const head = (title, icon, sub = '') =>
    `<header class="card-h">${icon ? ico(icon, 'ico big') : ''}<div><h2>${title}</h2>${sub ? `<p>${sub}</p>` : ''}</div></header>`;
