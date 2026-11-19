// 1.142 : Dessin SVG procédural des flacons de l'Atelier du Parfumeur (5 silhouettes, 4 bouchons, couleur du jus, étiquette classique).
import { CAPS } from '../data/perfume.js';

const O = '#3a2618';

// mélange 3 couleurs hex (poids 0.35 tête, 0.40 cœur, 0.25 fond)
export function mixHex(c1, c2, c3) {
    const parse = h => {
        const x = String(h || '#e8b339').replace('#', '');
        const n = parseInt(x.length === 3 ? x.replace(/(.)/g, '$1$1') : x, 16);
        return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    };
    const a = parse(c1),
        b = parse(c2),
        c = parse(c3);
    const ch = i => Math.round(a[i] * 0.35 + b[i] * 0.4 + c[i] * 0.25);
    return '#' + [ch(0), ch(1), ch(2)].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
}

// éclaircit légèrement une couleur hex pour le ménisque du liquide
function tint(hex, amt = 0.28) {
    const x = String(hex || '#e8b339').replace('#', '');
    const n = parseInt(x, 16);
    const ch = s => Math.min(255, Math.round(((n >> s) & 255) + (255 - ((n >> s) & 255)) * amt));
    return '#' + [ch(16), ch(8), ch(0)].map(v => v.toString(16).padStart(2, '0')).join('');
}

const BODIES = {
    apothicaire: {
        glass: 'M24 22 H40 V26 C46 28 49 32 49 38 V54 C49 57 46 59 43 59 H21 C18 59 15 57 15 54 V38 C15 32 18 28 24 26 Z',
        juice: 'M17 40 H47 V54 C47 56 45 57 43 57 H21 C19 57 17 56 17 54 Z',
        topY: 40,
        topW: 30,
        label: [21, 41, 22, 12],
    },
    goutte: {
        glass: 'M27 22 H37 V27 C42 32 50 40 50 48 C50 55 43 59 32 59 C21 59 14 55 14 48 C14 40 22 32 27 27 Z',
        juice: 'M16 44 C18 41 46 41 48 44 C49 46 49 48 49 49 C49 54 42 57 32 57 C22 57 15 54 15 49 C15 48 15 46 16 44 Z',
        topY: 43,
        topW: 30,
        label: [22, 44, 20, 10],
    },
    cristal: {
        glass: 'M26 22 H38 V26 L49 35 L45 57 L32 60 L19 57 L15 35 L26 26 Z',
        juice: 'M17 39 H47 L44 55 L32 58 L20 55 Z',
        topY: 39,
        topW: 28,
        label: [22, 41, 20, 11],
        extra: '<path d="M26 26 L22 56 M38 26 L42 56" stroke="rgba(255,255,255,0.45)" stroke-width="1.3" fill="none"/>',
    },
    amphore: {
        glass: 'M26 22 H38 V27 C46 30 49 38 46 47 C44 53 41 58 38 59 H26 C23 58 20 53 18 47 C15 38 18 30 26 27 Z',
        juice: 'M18 40 H46 C46 44 45 48 43 52 C41 55 39 57 37 57 H27 C25 57 23 55 21 52 C19 48 18 44 18 40 Z',
        topY: 40,
        topW: 26,
        label: [22, 42, 20, 10],
        extra: `<path d="M25 28 C16 28 13 36 18 42 M39 28 C48 28 51 36 46 42" stroke="${O}" stroke-width="2.2" fill="none" stroke-linecap="round"/>`,
    },
    givre: {
        glass: 'M25 22 H39 V27 L48 31 V55 L39 59 H25 L16 55 V31 L25 27 Z',
        juice: 'M18 39 H46 V54 L39 57 H25 L18 54 Z',
        topY: 39,
        topW: 28,
        label: [21, 41, 22, 11],
        extra: '<path d="M20 33 L24 35 M44 33 L40 35 M32 31 V36" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity="0.7"/>',
    },
};

export function perfumeInner(p = {}) {
    const shape = BODIES[p.bottle] || BODIES.apothicaire;
    const cap = CAPS[p.cap] || CAPS.or;
    const col = p.color || '#d988b9';
    const topCol = tint(col, 0.35);
    const gold = !!(p.classic || (p.stars && p.stars >= 3));
    const [lx, ly, lw, lh] = shape.label;
    const capShape =
        cap.id === 'verre'
            ? `<circle cx="32" cy="12" r="6.5" fill="${cap.fill}" stroke="${O}" stroke-width="2"/><ellipse cx="30" cy="10" rx="2.2" ry="1.4" fill="#fff" opacity="0.75"/>`
            : cap.id === 'or'
              ? `<path d="M24 19 L26 9 H38 L40 19 Z" fill="${cap.fill}" stroke="${O}" stroke-width="2" stroke-linejoin="round"/><ellipse cx="30" cy="12" rx="3" ry="1.2" fill="#fff" opacity="0.6"/>`
              : `<rect x="25" y="10" width="14" height="10" rx="2.5" fill="${cap.fill}" stroke="${O}" stroke-width="2"/><path d="M27 14 H37" stroke="rgba(58,38,24,0.35)" stroke-width="1.2"/>`;
    return `<ellipse cx="32" cy="60" rx="16" ry="2.6" fill="rgba(58,38,24,0.18)"/>
        ${shape.extra || ''}
        <path d="${shape.glass}" fill="rgba(255,252,244,0.72)" stroke="${O}" stroke-width="2.4" stroke-linejoin="round"/>
        <path d="${shape.juice}" fill="${col}"/>
        <ellipse cx="32" cy="${shape.topY}" rx="${Math.round(shape.topW / 2) - 1}" ry="2.2" fill="${topCol}"/>
        <path d="${shape.glass}" fill="none" stroke="${O}" stroke-width="2.4" stroke-linejoin="round"/>
        <rect x="25" y="19" width="14" height="4.5" rx="1.5" fill="${gold ? '#f2c14e' : '#e4d6be'}" stroke="${O}" stroke-width="1.8"/>
        ${capShape}
        <rect x="${lx}" y="${ly}" width="${lw}" height="${lh}" rx="2" fill="#fff7e2" stroke="${gold ? '#c9952a' : O}" stroke-width="${gold ? '1.8' : '1.4'}"/>
        <path d="M${lx + 4} ${ly + lh / 2 - 1.5} H${lx + lw - 4}" stroke="${O}" stroke-width="1.3" stroke-linecap="round" opacity="0.65"/>
        <path d="M${lx + 6} ${ly + lh / 2 + 2.2} H${lx + lw - 6}" stroke="${gold ? '#c9952a' : col}" stroke-width="1.4" stroke-linecap="round"/>
        <ellipse cx="22" cy="36" rx="2" ry="5" transform="rotate(-12 22 36)" fill="#fff" opacity="0.55"/>`;
}

export const perfumeSvg = (p = {}) => `<svg viewBox="0 0 64 64" aria-hidden="true">${perfumeInner(p)}</svg>`;
export const perfumeUiIcon = () => perfumeInner({ bottle: 'goutte', cap: 'or', color: '#c47dd9', stars: 3 });
