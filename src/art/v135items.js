// 1.35 : les onze produits bruts des nouveaux animaux (œufs, viandes, lait de yack, mohair).
import { C, F, FC, FE, HL, L, P, SHADOW, items } from './kit.js';
import { milkB } from './items2.js';

const PAPER = '#f3e7cf';
const paper = () => SHADOW(32, 57, 26, 3) + P('M6 44 L50 36 L58 48 L14 56Z', PAPER, 2) + L('M12 46 L48 40', 1, 'rgba(58,38,24,.2)');
// un œuf : forme, couleur, mouchetures, échelle
const egg = (x, y, s, base, spots = '#a8693a', pores = false) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    P('M0 -22 C13 -22 19 -1 18 10 C17 20 9 25 0 25 C-9 25 -17 20 -18 10 C-19 -1 -13 -22 0 -22Z', base, 2 / s) +
    (spots
        ? [
              [-7, -6],
              [6, -10],
              [9, 6],
              [-6, 12],
              [1, 2],
              [-11, 4],
          ]
              .map(([a, b]) => (pores ? FC(a, b, 1.1, spots, 0.7) : FE(a, b, 2, 1.4, spots, 0.75)))
              .join('')
        : '') +
    HL(-8, -10, 3, 6, 20, 0.6) +
    `</g>`;
// un oiseau plumé, prêt à rôtir : corps ovale couché, deux pilons, croupion
const bird = (skin, sk2, s = 1, extra = '') =>
    `<g transform="translate(32 38) scale(${s})">` +
    P('M-26 -2 Q-30 -10 -24 -14 Q-20 -10 -18 -4Z', sk2, 2) +
    P('M-26 8 Q-32 8 -30 16 Q-24 16 -20 10Z', sk2, 2) +
    P('M-24 0 Q-24 -16 -2 -16 Q22 -16 26 -2 Q26 14 0 15 Q-24 14 -24 0Z', skin, 2) +
    P('M24 -6 Q32 -8 32 -2 Q30 2 24 2Z', skin, 2) +
    F('M-14 -10 Q0 -15 16 -10 Q4 -6 -14 -4Z', '#fff', 0.4) +
    extra +
    `</g>`;
const meat = (c, c2, seed) =>
    paper() +
    P('M10 42 Q14 28 34 28 Q52 30 55 40 Q50 50 30 49 Q12 50 10 42Z', c) +
    P('M12 40 Q16 31 34 30 Q50 32 52 38 Q34 35 12 40Z', c2, 1.6) +
    L(seed, 1.2, c2) +
    HL(22, 34, 6, 1.6, -8, 0.5);

const RAW = {
    pigeonEgg: SHADOW(32, 57, 14, 2.5) + egg(24, 36, 0.75, '#f7efe0', '', false) + egg(40, 38, 0.65, '#f2e8d4', '', false),
    guineaEgg: SHADOW(32, 58, 14, 2.5) + egg(32, 36, 0.95, '#d8b078', '#8a5a2a'),
    pheasantEgg: SHADOW(32, 58, 14, 2.5) + egg(32, 36, 0.95, '#a89860', '#6a5a30', false),
    ostrichEgg: SHADOW(32, 60, 22, 3) + egg(32, 36, 1.5, '#f2e6c8', '#d8c498', true),
    squab: paper() + bird('#f0c8b0', '#e8b098', 0.85),
    guineaFowl:
        paper() +
        bird(
            '#e6c0a8',
            '#d8a888',
            1,
            [
                [-6, -6],
                [4, -8],
                [-2, 0],
                [7, 2],
                [-8, 4],
            ]
                .map(([a, b]) => FC(a, b, 1.1, '#b89078'))
                .join(''),
        ),
    pheasant:
        paper() +
        P('M18 30 Q2 36 -2 50 Q12 46 24 40Z', '#b8662a', 2) +
        L('M4 42 L12 36 M8 46 L16 38', 1.2, '#6a3a1a') +
        bird(
            '#e0a878',
            '#d09060',
            1.05,
            [
                [-4, -8],
                [4, -4],
                [-7, 2],
                [6, 6],
            ]
                .map(([a, b]) => FE(a, b, 1.6, 1, '#a86a3a', 0.9, 20))
                .join(''),
        ),
    yakMeat: meat('#9a2e34', '#e8c8c0', 'M20 38 Q24 41 22 45 M34 36 Q38 40 36 46 M44 40 Q47 42 45 46'),
    ostrichMeat: meat('#7a1e30', '#d8a8a8', 'M20 40 Q30 36 44 40'),
    yakMilk: milkB('#7a5a3a', '#f4ecdc', 'yak', '#fffaf0', 'jug'),
    mohair:
        SHADOW(32, 58, 22, 3) +
        [
            [18, 40, 9],
            [32, 36, 11],
            [46, 40, 9],
            [24, 48, 8],
            [40, 48, 8],
            [32, 28, 8],
        ]
            .map(([x, y, r]) => C(x, y, r, '#fbf7ee', 2))
            .join('') +
        [
            [18, 40, 9],
            [32, 36, 11],
            [46, 40, 9],
            [24, 48, 8],
            [40, 48, 8],
            [32, 28, 8],
        ]
            .map(([x, y, r]) => FC(x, y, r - 0.7, '#fbf7ee'))
            .join('') +
        L('M14 40 Q18 34 22 40 M28 36 Q33 28 38 36 M42 40 Q46 34 50 40 M20 48 Q24 43 28 48 M36 48 Q40 43 44 48', 1.3, '#d8cdb2') +
        HL(26, 30, 4, 2, -20, 0.6),
};
Object.assign(items, Object.fromEntries(Object.entries(RAW).map(([k, v]) => [k, () => v])));
export const ITEMS_135_ART = Object.keys(RAW);
