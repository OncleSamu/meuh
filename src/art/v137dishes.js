// 1.37 : les douze recettes du château.
import { C, E, F, FC, G, GD, L, P, R, SHADOW, items, bottle, wineBottle } from './kit.js';
import { plate, bowl, jar, steamF } from './items2.js';

const WINE = '#7a1f2b';
const herb = (x, y, rot = 0, s = 1) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M0 0 Q-4 -5 0 -9 Q4 -5 0 0Z', G, 1.2) +
    P('M0 0 Q-7 -2 -9 -6 Q-3 -7 0 0Z', GD, 1.2) +
    `</g>`;
const grape = (x, y, r = 3.4, c = '#7b3f9e') => C(x, y, r, c, 1.4) + FC(x - r * 0.3, y - r * 0.3, r * 0.3, '#fff', 0.6);
const bunch = (x, y, c = '#7b3f9e', s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    [
        [-6, 0],
        [0, 0],
        [6, 0],
        [-3, 6],
        [3, 6],
        [0, 12],
    ]
        .map(([a, b]) => grape(a, b, 3.6, c))
        .join('') +
    L('M0 -3 Q1 -8 4 -9', 1.6, '#5e3a1e') +
    P('M2 -6 Q8 -12 12 -6 Q8 -3 2 -6Z', G, 1.2) +
    `</g>`;
const dots = (list, r = 1.6) => list.map(([x, y, c]) => C(x, y, r, c, 0)).join('');
const glassStem = (liquid, lay) =>
    SHADOW(32, 59, 14, 2.5) +
    R(22, 55, 20, 3.4, 1.6, '#e4f5ff', 1.6) +
    L('M32 40 L32 55', 2.4, '#d8e8f2') +
    P('M16 12 L48 12 Q48 40 32 42 Q16 40 16 12Z', '#e4f5ff', 2) +
    F('M18 20 L46 20 Q45 38 32 40 Q19 38 18 20Z', liquid, 0.95) +
    (lay ? F('M18 20 L46 20 Q46.4 26 45 29 L19 29 Q17.6 26 18 20Z', lay, 0.95) : '') +
    F('M20 14 L23 14 L24 30 L21 30Z', '#fff', 0.5);

const D = {
    guineaWine: () =>
        plate() +
        E(32, 38, 22, 11, '#7a2430', 2) +
        P('M16 38 Q18 26 32 26 Q46 26 48 38 Q32 46 16 38Z', '#d8883a', 2) +
        F('M22 32 Q32 28 42 32 Q34 35 22 35Z', '#ffe0a0', 0.6) +
        [
            [14, 44],
            [50, 44],
            [30, 47],
        ]
            .map(([x, y]) => C(x, y, 3.4, '#c8a078', 1.4))
            .join('') +
        herb(32, 24, 0, 1.1),
    beefBourguignon: () =>
        bowl('#7a2430', 30) +
        [
            [22, 29, '#9a5a3a'],
            [32, 31, '#8a4a2e'],
            [41, 29, '#9a5a3a'],
        ]
            .map(([x, y, c]) => P(`M${x - 5} ${y} Q${x} ${y - 5} ${x + 5} ${y} Q${x} ${y + 4} ${x - 5} ${y}Z`, c, 1.4))
            .join('') +
        [
            [27, 26],
            [37, 27],
        ]
            .map(([x, y]) => C(x, y, 3, '#ee8a2e', 1.2))
            .join('') +
        C(46, 30, 2.4, '#f4ead0', 1.2) +
        herb(32, 22, 0, 1) +
        steamF,
    eggsMeurette: () =>
        plate() +
        E(32, 38, 22, 10, '#7a2430', 2) +
        [20, 32, 44].map(x => E(x, 36, 7, 5, '#fffdf4', 1.6) + FC(x, 35.4, 2.8, '#f6b020')).join('') +
        R(12, 44, 40, 5, 2, '#e8c078', 1.6) +
        dots(
            [
                [18, 42, '#4a2a1e'],
                [27, 44, '#4a2a1e'],
                [40, 43, '#4a2a1e'],
                [47, 42, '#4a2a1e'],
            ],
            1.4,
        ) +
        herb(32, 28, 0, 0.9),
    winePears: () =>
        plate() +
        [
            [22, 36, 0.8],
            [42, 36, 0.8],
        ]
            .map(
                ([x, y, s]) =>
                    `<g transform="translate(${x} ${y}) scale(${s})">` +
                    P('M0 -14 Q-6 -14 -6 -6 Q-6 -2 -10 4 Q-14 12 -6 16 Q0 18 6 16 Q14 12 10 4 Q6 -2 6 -6 Q6 -14 0 -14Z', '#a8344e', 2.2) +
                    L('M0 -14 Q1 -19 3 -21', 2, '#6b3d1e') +
                    F('M-4 -4 Q-3 4 -6 10', '#fff', 0.35) +
                    `</g>`,
            )
            .join('') +
        P('M12 46 Q32 54 52 46 Q32 50 12 46Z', '#7a1f2b', 1.2) +
        L('M30 26 L34 20', 1.6, '#8a5a2a') +
        herb(32, 24, 0, 0.9),
    candiedGrapes: () =>
        jar('#6a2c78', '#e8c078') +
        bunch(32, 34, '#5a2a78', 0.9) +
        dots(
            [
                [22, 48, '#c8a0e0'],
                [42, 46, '#c8a0e0'],
            ],
            1.2,
        ),
    grapeJelly: () => jar('#8a3a9a', '#f4ead0') + F('M18 30 L46 30 L46 48 L18 48Z', '#b068c0', 0.35) + bunch(32, 38, '#7b3f9e', 0.7),
    zanderWine: () =>
        plate() +
        E(32, 38, 22, 10, '#f2e6a8', 2) +
        P('M12 38 Q22 26 40 30 L52 24 L50 38 L52 50 L40 46 Q22 50 12 38Z', '#d8dce0', 1.8) +
        L('M20 34 Q30 30 38 34 M20 42 Q30 46 38 42', 1.2, '#9aa4ac') +
        C(18, 36, 1.6, '#3a2618', 0) +
        FC(46, 40, 3, '#f6e870', 0.9) +
        herb(32, 28, 0, 1),
    marcBrandy: () => bottle('#f4efd8', 'grape', '#eaf6fd', '#6b3d8e'),
    cognac: () => bottle('#b8651e', 'whiteWine', '#d8c8a0', '#5e3a1e'),
    kir: () => glassStem('#f6ecb0', '#a0204a') + FC(18, 14, 0, '#fff', 0) + C(48, 14, 5, '#a0204a', 1.6) + L('M48 9 L50 5', 1.4, '#5e3a1e'),
    strawWine: () => wineBottle('#e8b040', '#f7ecd8', '#c8a040', '#c8a868') + L('M24 56 L26 62 M36 56 L38 62', 1.4, '#e8c878'),
    mulledWine: () =>
        SHADOW(32, 58, 20, 3) +
        P('M14 24 L46 24 Q46 52 30 54 Q14 52 14 24Z', '#f7f3ea', 2) +
        P('M46 30 Q58 30 55 40 Q53 46 45 45', 'none', 2.4) +
        E(30, 24, 16, 4.4, WINE, 0, 1.8) +
        C(24, 24, 4.6, '#ee9a2e', 1.4) +
        L('M36 18 L40 28', 2, '#8a5a2a') +
        FC(34, 25, 1.6, '#e8d8a0', 0) +
        L('M24 14 Q21 9 24 4 M34 14 Q31 9 34 4', 1.8, 'rgba(150,150,150,.85)'),
};
Object.assign(items, Object.fromEntries(Object.entries(D).map(([k, v]) => [k, typeof v === 'function' ? v : () => v])));
export const DISHES_137 = Object.keys(D);
