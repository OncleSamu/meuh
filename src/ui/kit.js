// La boîte à composants : boutons, cartes, barres, puces, minuteries… toujours le même dessin partout.
import { fmt } from '../core/format.js';
import { ico, art } from './icons.js';

// attributs data-* d'une action : { i: 2, id: 'bread' } → data-i="2" data-id="bread"
const dataAttrs = data =>
    Object.entries(data || {})
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => ` data-${k}="${String(v).replace(/"/g, '&quot;')}"`)
        .join('');

// un bouton : kind = green | gold | blue | red | ghost ; size = sm | lg ; wide pour toute la largeur
export function btn(label, { act, data, kind = '', size = '', icon, disabled, wide, cls = '', title, anchor } = {}) {
    const c = ['btn', kind, size, wide ? 'wide' : '', cls].filter(Boolean).join(' ');
    return `<button class="${c}"${act ? ` data-act="${act}"` : ''}${dataAttrs(data)}${disabled ? ' disabled' : ''}${title ? ` aria-label="${title}" title="${title}"` : ''}${anchor ? ` data-anchor="${anchor}"` : ''}>${icon ? ico(icon) : ''}${label ? `<span>${label}</span>` : ''}</button>`;
}

// un bouton rond avec seulement une icône
export const iconBtn = (icon, act, data, title, cls = '') =>
    `<button class="icon-btn ${cls}" data-act="${act}"${dataAttrs(data)} aria-label="${title}" title="${title}">${ico(icon)}</button>`;

// une carte : icône à gauche, titre et sous-titre, actions à droite
export function card({ icon, art: big, title, sub, side = '', body = '', cls = '', act, data, locked }) {
    const tag = act ? 'button' : 'div';
    return `<${tag} class="card ${cls}${locked ? ' locked' : ''}"${act ? ` data-act="${act}"` : ''}${dataAttrs(data)}>
        ${big ? `<div class="card-art">${big}</div>` : icon ? `<div class="card-ico">${ico(icon, 'ico')}</div>` : ''}
        <div class="card-main">${title ? `<div class="card-title">${title}</div>` : ''}${sub ? `<div class="card-sub">${sub}</div>` : ''}${body}</div>
        ${side ? `<div class="card-side">${side}</div>` : ''}</${tag}>`;
}

// barre de progression : p de 0 à 1 ; live = clé pour la mise à jour à chaque seconde
export const bar = (p, cls = '', live = '') =>
    `<div class="bar ${cls}"${live ? ` data-live="${live}"` : ''}><i style="width:${Math.max(0, Math.min(100, p * 100)).toFixed(1)}%"></i></div>`;

// petite étiquette : icône + texte
export const chip = (text, icon, cls = '') => `<span class="chip ${cls}">${icon ? ico(icon) : ''}${text}</span>`;

// minuterie qui se met à jour seule : until en millisecondes
export const timer = (until, cls = '') => `<span class="timer ${cls}" data-until="${Math.round(until)}"></span>`;

export const coins = (n, cls = '') => `<span class="coins ${cls}">${fmt(n)}${ico(['ui', 'coin'])}</span>`;

export const hearts = (n, max = 5) =>
    `<span class="hearts">${Array.from({ length: max }, (_, k) => `<i class="ico">${art('ui', k < n ? 'heart' : 'heartOff')}</i>`).join('')}</span>`;

export const pips = (n, max) => `<span class="pips">${Array.from({ length: max }, (_, k) => `<i class="${k < n ? 'on' : ''}"></i>`).join('')}</span>`;

export const section = (title, extra = '') => `<h3 class="section-title"><span>${title}</span>${extra}</h3>`;

export const empty = text => `<p class="empty">${text}</p>`;
export const hint = text => `<p class="hint">${text}</p>`;
export const dot = n => (n ? `<span class="dot">${n > 9 ? '9+' : n}</span>` : '');

// coût en pièces et matériaux : parts = [{ icon, n, ok }]
export const costRow = list => `<span class="cost">${list.map(c => `<span class="${c.ok ? 'ok' : 'short'}">${ico(c.icon)}${fmt(c.n)}</span>`).join('')}</span>`;

// contrôle segmenté (sous-onglets)
export const segmented = (items, current, act) =>
    `<div class="seg" role="tablist">${items
        .map(
            ([id, label, icon, badge, locked]) =>
                `<button role="tab" class="${id === current ? 'on' : ''}${locked ? ' locked' : ''}" data-act="${act}" data-v="${id}" aria-selected="${id === current}">${icon ? ico(icon) : ''}<span>${label}</span>${dot(badge)}</button>`,
        )
        .join('')}</div>`;

// interrupteur (réglages)
export const toggle = (label, on, act, data, sub = '') =>
    `<button class="row toggle" data-act="${act}"${dataAttrs(data)} role="switch" aria-checked="${!!on}"><span class="row-main"><span>${label}</span>${sub ? `<small>${sub}</small>` : ''}</span><span class="switch${on ? ' on' : ''}"><i></i></span></button>`;

// une ligne de liste qui mène quelque part
export const navRow = (label, act, data, icon, side = '›', sub = '') =>
    `<button class="row nav" data-act="${act}"${dataAttrs(data)}>${icon ? ico(icon) : ''}<span class="row-main"><span>${label}</span>${sub ? `<small>${sub}</small>` : ''}</span><span class="row-side">${side}</span></button>`;

// une ligne d'info dans une fenêtre : icône + texte
export const line = (icon, html, cls = '') => `<div class="line ${cls}">${ico(icon)}<div>${html}</div></div>`;
export const lines = list => `<div class="lines">${list.map(([icon, t]) => line(icon, t)).join('')}</div>`;
