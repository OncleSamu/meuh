// 1.24.1 : la sellerie de Jules et ses objets d'équipement. Dessins validés le 21 octobre 2026.
import { C, HL, L, P, R, SHADOW, items, machines } from './kit.js';

const MN = '#3a2618';
const T = (x, y, s, t) =>
    `<text x="${x}" y="${y}" font-size="${s}" font-weight="900" text-anchor="middle" fill="${MN}" font-family="Nunito,system-ui,sans-serif">${t}</text>`;
const LEATHER = '#8e4a22',
    LD = '#6b3416',
    GOLD = '#ffd23f';
export const OBJ = {
    ferFer: () =>
        SHADOW(32, 58, 18, 2.5) +
        P(
            'M16 14 Q8 34 16 50 Q22 56 28 50 L28 44 Q22 44 22 34 Q22 24 28 22 L28 14Z M48 14 Q56 34 48 50 Q42 56 36 50 L36 44 Q42 44 42 34 Q42 24 36 22 L36 14Z',
            '#9aa3ad',
            2.6,
        ).replace(' M48', ' M48') +
        [
            [20, 24],
            [20, 36],
            [20, 46],
            [44, 24],
            [44, 36],
            [44, 46],
        ]
            .map(([x, y]) => C(x, y, 1.8, '#3a3a45', 0))
            .join('') +
        HL(18, 22, 3, 8, 8, 0.6),
    ferArgent: () =>
        SHADOW(32, 58, 18, 2.5) +
        P(
            'M16 14 Q8 34 16 50 Q22 56 28 50 L28 44 Q22 44 22 34 Q22 24 28 22 L28 14Z M48 14 Q56 34 48 50 Q42 56 36 50 L36 44 Q42 44 42 34 Q42 24 36 22 L36 14Z',
            '#e6edf7',
            2.6,
        ) +
        [
            [20, 24],
            [20, 36],
            [20, 46],
            [44, 24],
            [44, 36],
            [44, 46],
        ]
            .map(([x, y]) => C(x, y, 1.8, '#6ba3d6', 0))
            .join('') +
        HL(18, 22, 3, 8, 8, 0.8) +
        P('M32 4 L34 8 L38 8 L35 11 L36 15 L32 12.6 L28 15 L29 11 L26 8 L30 8Z', GOLD, 1.4),
    selleDress: () =>
        SHADOW(32, 58, 24, 2.5) +
        P('M8 40 Q8 28 20 24 Q28 20 34 26 Q40 20 48 24 Q58 30 56 42 Q44 48 32 46 Q18 48 8 40Z', LEATHER, 2.6) +
        P('M14 42 Q32 52 52 42 L50 50 Q32 58 16 50Z', LD, 2.4) +
        L('M24 36 Q32 40 40 36', 1.8, MN) +
        L('M26 52 L26 60 M40 52 L40 60', 3.6) +
        L('M26 52 L26 60 M40 52 L40 60', 1.6, '#c9ced6') +
        HL(20, 30, 5, 2, -20, 0.55),
    selleObst: () =>
        SHADOW(32, 58, 24, 2.5) +
        P('M8 38 Q8 28 18 24 Q26 22 32 28 Q40 22 50 26 Q58 32 56 40 Q44 46 32 44 Q18 46 8 38Z', '#c0793c', 2.6) +
        P('M12 38 L52 38 L48 54 Q32 58 18 54Z', '#a8693a', 2.4) +
        L('M20 44 L44 44', 1.6, MN) +
        L('M24 54 L24 60 M40 54 L40 60', 3.6) +
        L('M24 54 L24 60 M40 54 L40 60', 1.6, '#c9ced6') +
        HL(20, 29, 5, 2, -20, 0.6),
    selleCourse: () =>
        SHADOW(32, 58, 20, 2.5) +
        P('M14 38 Q14 28 24 26 Q32 24 40 26 Q50 28 50 38 Q40 44 32 43 Q22 44 14 38Z', '#2b2b35', 2.6) +
        L('M22 33 Q32 36 42 33', 1.6, '#5a5a68') +
        L('M24 44 L24 52 M40 44 L40 52', 3.4) +
        L('M24 44 L24 52 M40 44 L40 52', 1.5, '#c9ced6') +
        HL(22, 30, 5, 1.8, -20, 0.5) +
        R(26, 50, 12, 6, 3, '#c8453a', 2),
    bride: () =>
        SHADOW(32, 60, 20, 2.5) +
        L('M18 8 Q16 26 22 38 M46 8 Q48 26 42 38', 3.4, LEATHER).replace('stroke-width="3.4"', 'stroke-width="4"') +
        L('M22 38 Q32 44 42 38', 3.4, LEATHER) +
        L('M20 18 Q32 24 44 18', 3, LEATHER) +
        C(32, 44, 5, 'none', 2.4).replace(`stroke="${MN}"`, `stroke="${GOLD}"`) +
        C(32, 44, 5, 'none', 0.8) +
        L('M14 22 Q6 32 12 44', 2.6, LD) +
        C(22, 38, 2.6, GOLD, 1.4) +
        C(42, 38, 2.6, GOLD, 1.4) +
        HL(20, 22, 2, 7, 6, 0.5),
    tapis: () =>
        SHADOW(32, 58, 22, 2.5) +
        P('M10 22 Q32 14 54 22 L52 52 Q32 60 12 52Z', '#f6ecd2', 2.6) +
        L('M12 46 Q32 54 52 46', 3, '#c8453a') +
        L('M12 38 Q32 46 52 38', 1.6, '#c8453a') +
        R(26, 20, 12, 4, 2, '#e8d6aa', 1.4) +
        HL(20, 30, 6, 2, -10, 0.5),
    couverture: () =>
        SHADOW(32, 60, 24, 2.5) +
        P('M8 24 Q32 14 56 24 L54 54 Q32 62 10 54Z', '#4f7aa8', 2.6) +
        L('M10 36 Q32 44 54 36 M10 46 Q32 54 54 46', 2.2, '#f6ecd2') +
        L('M20 24 L20 58 M44 24 L44 58', 1.2, 'rgba(255,255,255,.3)') +
        R(26, 18, 12, 7, 2, GOLD, 1.8) +
        HL(18, 30, 6, 2, -10, 0.4),
    brosse: () =>
        SHADOW(32, 58, 22, 2.5) +
        P('M8 26 Q8 20 14 20 L50 20 Q56 20 56 26 L56 36 Q56 42 50 42 L14 42 Q8 42 8 36Z', '#c08b52', 2.6) +
        P('M12 42 L52 42 L50 54 L14 54Z', '#e8d6aa', 2) +
        L('M18 44 L17 53 M24 44 L24 54 M30 44 L30 54 M36 44 L36 54 M42 44 L42 54 M48 44 L47 53', 1.4, '#a8693a') +
        R(22, 26, 20, 8, 4, '#a8693a', 1.8) +
        HL(16, 24, 6, 1.6, 0, 0.5),
};
// la sellerie : un atelier de bois avec une selle sur son chevalet
export const sellerie = () =>
    SHADOW(32, 60, 28, 3) +
    R(6, 22, 52, 36, 3, '#c08b52', 2.6) +
    L('M6 32 L58 32 M6 42 L58 42 M6 52 L58 52', 1.2, 'rgba(58,38,24,.3)') +
    P('M2 24 L32 6 L62 24Z', '#7a4a2a', 2.6) +
    L('M10 22 L32 10 L54 22', 1.4, 'rgba(255,255,255,.3)') +
    R(12, 36, 18, 22, 2, '#6b3416', 2) +
    R(34, 34, 18, 12, 2, '#fff7e0', 2) +
    L('M43 36 L43 44', 2, '#c8453a') +
    P('M36 40 L50 40', '#000', 0) +
    P('M14 42 Q22 36 28 42 L26 50 Q20 52 16 50Z', LEATHER, 1.8) +
    L('M44 26 L44 30', 2) +
    L('M40 26 Q44 32 48 26', 2, LEATHER) +
    C(44, 31, 1.6, GOLD, 1) +
    R(26, 12, 12, 6, 2, '#fff7e0', 1.8) +
    T(32, 17, 5, 'JULES');

Object.entries({
    shoeIron: 'ferFer',
    shoeSilver: 'ferArgent',
    saddleDress: 'selleDress',
    saddleJump: 'selleObst',
    saddleRace: 'selleCourse',
    bridle: 'bride',
    saddlePad: 'tapis',
    winterBlanket: 'couverture',
    hairBrush: 'brosse',
}).forEach(([id, k]) => (items[id] = OBJ[k]));
machines.saddlery = sellerie;
