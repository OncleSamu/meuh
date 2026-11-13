// 1.123 : les dessins de la famille (cadre 64 × 64).
import { C, E, F, FC, FE, HL, L, P, R, SHADOW, ui } from './kit.js';

const O = '#3a2618';
const heart = (x, y, s, c = '#f06292', w = 2) =>
    `<g transform="translate(${x} ${y}) scale(${s})">${P('M0 6 Q-10 -2 -6 -7 Q-2 -11 0 -5 Q2 -11 6 -7 Q10 -2 0 6Z', c, w / s)}</g>`;

Object.assign(ui, {
    // l'onglet Famille : la maison et un cœur sur la porte
    fmHome: () =>
        SHADOW(32, 58, 24, 3) +
        P('M10 30 L32 10 L54 30 L54 56 L10 56Z', '#f6e3c4', 2.6) +
        P('M6 31 L32 7 L58 31 L53 35 L32 16 L11 35Z', '#c0563b', 2.4) +
        R(26, 38, 12, 18, 2, '#8b5a2b', 2.2) +
        R(14, 36, 8, 8, 1.5, '#bfe6ff', 2) +
        R(42, 36, 8, 8, 1.5, '#bfe6ff', 2) +
        heart(32, 25, 0.75) +
        HL(16, 37, 2, 1.2, -30, 0.7),

    // une rose rouge
    fmRose: () =>
        L('M32 34 Q30 46 33 58', 4.4, O) +
        L('M32 34 Q30 46 33 58', 2.4, '#3f8f2e') +
        P('M32 46 Q22 40 20 46 Q26 50 32 48Z', '#6cc04a', 2) +
        P('M32 50 Q42 44 45 50 Q38 54 32 52Z', '#6cc04a', 2) +
        C(32, 22, 14, '#e2412f', 2.6) +
        P('M22 22 Q24 12 32 12 Q40 12 42 22 Q36 16 32 18 Q28 16 22 22Z', '#c62828', 1.8) +
        L('M26 24 Q32 30 38 24 M28 20 Q32 16 36 20', 1.6, '#8e1c1c') +
        HL(26, 16, 3, 1.6, -30, 0.6),

    // la bague
    fmRing: () =>
        E(32, 40, 16, 14, 'none', 0, 0) +
        `<ellipse cx="32" cy="40" rx="15" ry="13" fill="none" stroke="${O}" stroke-width="8"/>` +
        `<ellipse cx="32" cy="40" rx="15" ry="13" fill="none" stroke="#ffd23f" stroke-width="4.4"/>` +
        P('M24 22 L28 14 L36 14 L40 22 L32 30Z', '#b58ad6', 2.4) +
        L('M24 22 L40 22 M28 14 L32 22 L36 14', 1.4, '#7a4ea8') +
        HL(30, 17, 2, 1.2, -30, 0.9) +
        HL(22, 38, 2.4, 4, 20, 0.5),

    // les rendez-vous
    fmWalk: () =>
        F('M4 58 Q20 40 32 44 Q46 48 60 30 L60 40 Q48 56 32 54 Q20 52 10 60Z', '#e8d3a2') +
        L('M4 58 Q20 40 32 44 Q46 48 60 30', 2, '#c4a46a') +
        P('M14 30 Q12 22 18 18 Q24 22 22 30Z', '#6cc04a', 2) +
        L('M18 30 L18 42', 2.4) +
        P('M44 14 Q40 6 46 4 Q52 8 50 14Z', '#9be06b', 2) +
        L('M47 14 L47 26', 2.4) +
        heart(30, 24, 0.7),
    fmPicnic: () =>
        P('M4 44 L32 34 L60 44 L32 56Z', '#f6f1e6', 2.4) +
        L('M11 41.5 L39 53.5 M18 39 L46 51 M25 36.5 L53 48.5 M53 41.5 L25 53.5 M46 39 L18 51 M39 36.5 L11 48.5', 2.6, '#e2412f') +
        P('M22 24 L42 24 L40 40 L24 40Z', '#c08b52', 2.4) +
        L('M24 24 Q32 10 40 24', 2.6) +
        L('M23 30 L41 30 M24 35 L40 35', 1.2, '#8b5a2b') +
        C(48, 30, 4.5, '#e2412f', 2) +
        L('M48 26 L50 22', 1.6),
    fmBall: () =>
        L('M18 12 L18 44', 2.6) +
        C(14, 46, 6, O, 0) +
        E(13, 46, 6, 4.6, O, -20, 0) +
        L('M18 12 L34 8 L34 38', 2.6) +
        E(29, 40, 6, 4.6, O, -20, 0) +
        L('M18 18 L34 14', 3) +
        P('M42 58 Q40 40 48 32 Q56 40 54 58Z', '#f06292', 2.4) +
        C(48, 26, 5, '#f6cfa6', 2) +
        L('M44 40 Q48 44 52 40', 1.4, '#c2185b') +
        FC(52, 14, 2.2, '#ffd23f') +
        FC(58, 22, 1.6, '#ffd23f') +
        FC(42, 16, 1.6, '#ffd23f'),
    fmCandle: () =>
        SHADOW(32, 58, 22, 3) +
        E(32, 52, 24, 6, '#f6f1e6', 0, 2.2) +
        R(20, 26, 7, 24, 2, '#fff8e1', 2.2) +
        R(37, 22, 7, 28, 2, '#fff8e1', 2.2) +
        P('M23.5 25 Q20 18 23.5 12 Q27 18 23.5 25Z', '#ffb300', 1.6) +
        P('M40.5 21 Q37 14 40.5 8 Q44 14 40.5 21Z', '#ffb300', 1.6) +
        FE(23.5, 20, 1.4, 2.8, '#fff3a3') +
        FE(40.5, 16, 1.4, 2.8, '#fff3a3') +
        heart(32, 46, 0.6),

    // les pièces du foyer
    fmBed: () =>
        SHADOW(32, 58, 26, 3) +
        R(6, 18, 8, 38, 2, '#8b5a2b', 2.2) +
        R(8, 34, 50, 16, 3, '#f6f1e6', 2.4) +
        R(8, 30, 50, 10, 3, '#e57373', 2.2) +
        E(18, 30, 7, 4, '#ffffff', 0, 2) +
        E(32, 30, 7, 4, '#ffffff', 0, 2) +
        L('M12 50 L12 56 M54 50 L54 56', 3) +
        heart(48, 16, 0.6),
    fmSofa: () =>
        SHADOW(32, 58, 26, 3) +
        R(8, 22, 48, 18, 6, '#5aa9a0', 2.4) +
        R(4, 32, 10, 20, 4, '#4a8d85', 2.2) +
        R(50, 32, 10, 20, 4, '#4a8d85', 2.2) +
        R(12, 36, 40, 14, 3, '#6fc0b6', 2.2) +
        L('M32 38 L32 49', 1.6, '#3e7a73') +
        L('M12 50 L12 56 M52 50 L52 56', 3) +
        E(22, 30, 5, 4, '#ffd23f', 0, 1.8) +
        HL(16, 26, 4, 1.6, -10, 0.5),
});

// ---------------- 1.124 : les enfants ----------------
import { SKINS, HAIRS, lookOf, habitantArt } from './habitants.js';

// le bébé : emmailloté dans sa couverture (rose ou bleue), les yeux fermés, une mèche de la couleur de ses cheveux
export function babyArt(id, girl) {
    const k = lookOf(id);
    const skin = SKINS[k.skin],
        hair = HAIRS[k.hairColor];
    const wrap = girl ? '#f8bbd0' : '#b3d9f2',
        wrapD = girl ? '#e391b0' : '#7fb3d9';
    return (
        P('M8 64 Q8 40 32 38 Q56 40 56 64Z', wrap, 2.6) +
        P('M14 64 Q20 48 32 50 Q44 48 50 64', 'none', 0) +
        L('M16 60 Q32 50 48 60', 2, wrapD) +
        P('M14 34 Q14 10 32 10 Q50 10 50 34 Q50 48 32 48 Q14 48 14 34Z', wrap, 2.6) +
        C(32, 32, 13, skin, 2.4) +
        P('M28 20 Q30 14 34 16 Q32 18 33 21 Q30 19 28 20Z', hair, 1.6) +
        L('M25 31 Q27 33 29 31 M35 31 Q37 33 39 31', 1.8) +
        FC(24.5, 36, 2.6, '#f49a8f', 0.5) +
        FC(39.5, 36, 2.6, '#f49a8f', 0.5) +
        E(32, 38.5, 2.2, 1.6, '#b5523f', 0, 1.2) +
        HL(26, 25, 3, 1.6, -30, 0.5)
    );
}
// l'enfant : son visage, plus petit dans le cadre (les grands gardent le dessin d'un habitant)
export const childArt = id => `<g transform="translate(7 10) scale(.8)">${habitantArt(id)}</g>`;

Object.assign(ui, {
    fmCradle: () =>
        SHADOW(32, 58, 24, 3) +
        P('M10 30 Q10 52 32 52 Q54 52 54 30Z', '#f6e3c4', 2.6) +
        L('M14 52 Q12 58 8 58 M50 52 Q52 58 56 58', 3) +
        L('M8 58 Q32 62 56 58', 3) +
        P('M10 30 Q12 12 32 10 L32 30Z', '#b3d9f2', 2.4) +
        L('M14 36 L50 36 M14 42 L50 42', 1.4, '#c4a46a') +
        L('M44 4 L44 14', 1.6) +
        FC(38, 16, 2.4, '#ffd23f') +
        FC(44, 18, 2.4, '#f06292') +
        FC(50, 16, 2.4, '#6cc04a') +
        L('M36 14 L52 14', 1.6),
    fmBunk: () =>
        L('M10 6 L10 60 M54 6 L54 60', 3.4) +
        R(10, 16, 44, 10, 2, '#e57373', 2.2) +
        R(10, 42, 44, 10, 2, '#64b5f6', 2.2) +
        E(18, 15, 5, 3, '#fff', 0, 1.6) +
        E(18, 41, 5, 3, '#fff', 0, 1.6) +
        L('M42 26 L42 42 M48 26 L48 42 M42 31 L48 31 M42 36 L48 36', 1.8, '#8b5a2b'),
    fmToys: () =>
        SHADOW(32, 58, 26, 3) +
        R(6, 38, 18, 18, 2, '#e2412f', 2.2) +
        R(24, 38, 18, 18, 2, '#ffd23f', 2.2) +
        R(15, 20, 18, 18, 2, '#64b5f6', 2.2) +
        L('M11 43 L19 51 M19 43 L11 51', 1.8, '#fff') +
        L('M29 47 L37 47 M33 43 L33 51', 1.8, '#8b5a2b') +
        C(52, 46, 9, '#c08b52', 2.2) +
        C(46, 36, 4, '#c08b52', 2) +
        C(58, 36, 4, '#c08b52', 2) +
        FC(49, 45, 1.2, O) +
        FC(55, 45, 1.2, O) +
        E(52, 49, 2.4, 1.6, '#8b5a2b'),
    fmDesk: () =>
        SHADOW(32, 58, 26, 3) +
        R(6, 30, 52, 8, 2, '#a8693a', 2.4) +
        L('M10 38 L10 58 M54 38 L54 58', 3.2) +
        R(12, 20, 18, 10, 1, '#f6f1e6', 2) +
        L('M15 24 L27 24 M15 27 L24 27', 1.2, '#7a7a7a') +
        L('M44 30 L48 14 L40 8', 2.6) +
        P('M34 8 L44 4 L46 12Z', '#ffd23f', 2) +
        F('M36 12 L46 12 L52 30 L30 30Z', '#fff3a3', 0.5),
    fmTalk: () =>
        P('M6 10 L40 10 Q44 10 44 14 L44 30 Q44 34 40 34 L20 34 L12 42 L13 34 L10 34 Q6 34 6 30Z', '#ffffff', 2.4) +
        P('M24 28 L54 28 Q58 28 58 32 L58 46 Q58 50 54 50 L50 50 L51 58 L43 50 L28 50 Q24 50 24 46Z', '#bfe6ff', 2.4) +
        FC(16, 22, 2, O) +
        FC(25, 22, 2, O) +
        FC(34, 22, 2, O),
});

// ---------------- 1.127 : la carte de la ville ----------------
const WALLS = ['#f2d6a2', '#f7f3ea', '#f3c9b5', '#e6dcc0', '#d9e7c9', '#cfe0ec', '#f5e1a4'];
const ROOFS = ['#c8453a', '#5aa9e6', '#8e5a3c', '#6c8e3c', '#a05aa8', '#e08a2c', '#596a7a'];
const g = (x, y, s, inner, attrs = '') => `<g transform="translate(${x} ${y}) scale(${s})"${attrs}>${inner}</g>`;
function houseArt(kind, i) {
    const wall = kind === 'farm' ? '#f2d6a2' : kind === 'elder' ? '#efe3cf' : WALLS[i % WALLS.length];
    const roof = kind === 'farm' ? '#b5332a' : kind === 'elder' ? '#7a8a6a' : kind === 'couple' ? '#e0607e' : ROOFS[(i * 3 + 1) % ROOFS.length];
    if (kind === 'farm')
        return (
            SHADOW(32, 59, 30, 3) +
            R(4, 30, 56, 28, 1, wall, 2.4) +
            P('M0 32 L32 8 L64 32Z', roof, 2.4) +
            R(26, 40, 12, 18, 1, '#8b5a2b', 2) +
            R(9, 38, 10, 9, 1, '#bfe6fb', 1.8) +
            R(45, 38, 10, 9, 1, '#bfe6fb', 1.8) +
            L('M27 41 L37 57 M37 41 L27 57', 1.4, '#f2d6a2') +
            heart(32, 22, 0.6, '#ffd23f', 1.6)
        );
    const door = kind === 'couple' ? heart(32, 30, 0.5, '#f06292', 1.6) : '';
    const smoke = kind === 'elder' ? FC(48, 8, 3, '#d6d6d6', 0.8) + FC(52, 3, 2.4, '#e6e6e6', 0.7) : '';
    return (
        SHADOW(32, 59, 24, 3) +
        smoke +
        R(44, 12, 6, 14, 1, '#9a6a4a', 1.8) +
        R(12, 34, 40, 24, 1, wall, 2.4) +
        P('M6 36 L32 16 L58 36Z', roof, 2.4) +
        R(27, 44, 10, 14, 1, '#8b5a2b', 2) +
        R(16, 40, 8, 7, 1, '#bfe6fb', 1.6) +
        R(40, 40, 8, 7, 1, '#bfe6fb', 1.6) +
        door
    );
}
const tentArt = i =>
    SHADOW(32, 58, 24, 3) + P('M8 56 L32 18 L56 56Z', ['#f2a33a', '#64b5f6', '#e57373', '#81c784'][i % 4], 2.4) + P('M26 56 L32 40 L38 56Z', '#5a3a22', 2) + L('M32 18 L32 10', 2);
const LANDMARK_ART = {
    well: () => SHADOW(32, 58, 18, 3) + R(18, 40, 28, 16, 2, '#b8b0a4', 2.4) + L('M20 40 L20 20 M44 40 L44 20', 2.6) + P('M14 22 L32 10 L50 22Z', '#8e5a3c', 2.2) + L('M32 22 L32 34', 1.4) + R(29, 32, 6, 5, 1, '#8b5a2b', 1.4),
    chapel: () =>
        SHADOW(32, 59, 22, 3) +
        R(16, 30, 32, 28, 1, '#f7f3ea', 2.4) +
        P('M12 32 L32 14 L52 32Z', '#596a7a', 2.4) +
        R(26, 4, 12, 14, 1, '#f7f3ea', 2) +
        L('M32 -4 L32 4 M28 0 L36 0', 2) +
        P('M27 58 L27 46 Q32 40 37 46 L37 58Z', '#8b5a2b', 2) +
        C(32, 24, 3, '#ffd23f', 1.4),
    fountain: () =>
        SHADOW(32, 58, 26, 3) +
        E(32, 50, 26, 8, '#b8b0a4', 0, 2.4) +
        E(32, 48, 20, 5, '#7cc4f0', 0, 1.4) +
        R(29, 26, 6, 22, 2, '#b8b0a4', 2) +
        E(32, 26, 10, 3, '#b8b0a4', 0, 2) +
        L('M32 24 Q24 12 18 30 M32 24 Q40 12 46 30', 1.8, '#7cc4f0'),
    hall: () =>
        SHADOW(32, 59, 30, 3) +
        P('M2 30 L32 12 L62 30Z', '#c8453a', 2.4) +
        R(6, 30, 52, 4, 1, '#e6dcc0', 2) +
        L('M10 34 L10 58 M22 34 L22 58 M42 34 L42 58 M54 34 L54 58', 3, '#8e5a3c') +
        R(26, 46, 12, 8, 1, '#ffd23f', 1.6) +
        FC(18, 54, 3, '#e2412f') +
        FC(48, 54, 3, '#6cc04a'),
    townhall: () =>
        SHADOW(32, 59, 30, 3) +
        R(4, 28, 56, 30, 1, '#f7f3ea', 2.4) +
        P('M0 30 L32 14 L64 30Z', '#596a7a', 2.4) +
        R(26, 2, 12, 16, 1, '#f7f3ea', 2) +
        C(32, 9, 4, '#fff', 1.6) +
        L('M32 9 L32 6 M32 9 L34 10', 1.2) +
        R(27, 42, 10, 16, 1, '#8b5a2b', 2) +
        R(10, 36, 8, 10, 1, '#bfe6fb', 1.6) +
        R(46, 36, 8, 10, 1, '#bfe6fb', 1.6) +
        R(30, 20, 4, 6, 0, '#4f8bd6') +
        L('M30 20 L30 14', 1.2),
};
const tree = (x, y, s) => g(x, y, s, SHADOW(32, 58, 12, 2) + R(29, 40, 6, 18, 1, '#8b5a2b', 2) + C(32, 30, 16, '#6cc04a', 2.4) + HL(26, 24, 4, 3));
// la carte : la place et ses grands bâtiments, les rues de maisons, le pré du camping
export function townMapArt(houses, tents, marks, pick = null, W = 360) {
    const on = (k, i) => (pick && pick.k === k && pick.i === i ? FE(32, 58, 30, 7, '#ffd23f', 0.9) : '');
    const cols = 5,
        lot = W / cols,
        rowH = 70;
    const parts = [];
    let y = 8;
    // la place
    const placeH = 76;
    parts.push(`<rect x="8" y="${y}" width="${W - 16}" height="${placeH}" rx="14" fill="#e9dcc0" stroke="${O}" stroke-width="2"/>`);
    if (marks.length) {
        const step = (W - 16) / marks.length;
        marks.forEach((m, k) => parts.push(g(8 + step * k + step / 2 - 30, y + 8, 0.95, on('mark', k) + LANDMARK_ART[m.id](), ` data-act="fmMark" data-i="${k}" class="tm-hit"`)));
    } else parts.push(`<text x="${W / 2}" y="${y + placeH / 2 + 5}" text-anchor="middle" font-size="13" fill="#8a7860" font-family="sans-serif">La place du hameau</text>`);
    y += placeH + 8;
    // les rues
    const rows = Math.ceil(houses.length / cols);
    for (let r = 0; r < rows; r++) {
        parts.push(`<rect x="0" y="${y + rowH - 6}" width="${W}" height="12" fill="#d9c49a"/>`);
        for (let c = 0; c < cols; c++) {
            const i = r * cols + c;
            const h = houses[i];
            const x = c * lot + (lot - 58) / 2;
            if (!h) {
                if ((r + c) % 2) parts.push(tree(x + 8, y + 18, 0.7));
                continue;
            }
            parts.push(g(x, y + 2, h.kind === 'farm' ? 0.95 : 0.9, on('house', i) + houseArt(h.kind, i), ` data-act="fmHouse" data-i="${i}" class="tm-hit"`));
        }
        y += rowH + 8;
    }
    // le pré du camping
    if (tents.length) {
        const tc = 9,
            tw = W / tc;
        const tr = Math.ceil(tents.length / tc);
        parts.push(`<rect x="8" y="${y}" width="${W - 16}" height="${tr * 40 + 14}" rx="14" fill="#cfe8b0" stroke="${O}" stroke-width="2" stroke-dasharray="6 5"/>`);
        tents.forEach((n, k) => parts.push(g((k % tc) * tw + (tw - 34) / 2, y + 6 + Math.floor(k / tc) * 40, 0.55, on('tent', k) + tentArt(k), ` data-act="fmTent" data-i="${k}" class="tm-hit"`)));
        y += tr * 40 + 22;
    }
    return `<svg class="tm-map" viewBox="0 0 ${W} ${y}" xmlns="http://www.w3.org/2000/svg"><rect width="${W}" height="${y}" fill="#bfe0a0"/>${parts.join('')}</svg>`;
}
