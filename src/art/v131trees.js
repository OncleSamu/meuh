// 1.31 : les sept nouveaux arbres (le fruit, et le fruit sur l'arbre) et leurs trente plats.
import { C, E, F, FC, FE, G, L, P, R, SHADOW, badge, bottle, items, leaf, sub, tart } from './kit.js';
import { FRUIT_COL, fruitExtra } from './plants.js';
import { bowl, coupe, jar, juiceB, oil, plate, scoop, tallGlass, woodBoard } from './items2.js';

const dots = (list, r = 2.4) => list.map(([x, y, c]) => C(x, y, r, c, 1.4)).join('');
const withBadge = (base, fruit) => () => sub(base, 0, 0, 64) + badge(fruit);
const pot = (fill, lid, fruit) => jar(fill, lid, sub(fruit, 22, 33, 20));

// ======================= les fruits =======================
// une quetsche : bleu-violet, la pruine claire, un sillon
const quetsche = (x, y, s = 1, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M0 -12 Q-8 -12 -9 -2 Q-9 11 0 12 Q9 11 9 -2 Q8 -12 0 -12Z', '#5a3f86', 2.2) +
    FE(2, 4, 5, 6, '#7a4a98', 0.45) +
    L('M0 -11 Q-3 0 0 11', 1, 'rgba(255,255,255,.35)') +
    FE(-3.4, -4, 2, 4, '#c8b8e8', 0.6, -10) +
    L('M0 -12 L1 -16', 1.6, '#6b3d1e') +
    `</g>`;
// une mandarine : petite, aplatie, le creux de la tige
const mandarinFruit = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    P('M-11 2 Q-11 -9 0 -9 Q11 -9 11 2 Q11 11 0 11 Q-11 11 -11 2Z', '#f58a1c', 2.2) +
    FE(4, 5, 5, 4, '#e8680a', 0.4) +
    FC(0, -8, 2, '#d8d04a') +
    F('M0 -9 Q4 -14 9 -12 Q6 -8 0 -9Z', '#5fa040') +
    FE(-5, -3, 2.4, 1.4, '#fff', 0.55, -20) +
    `</g>`;
// un pamplemousse entier et sa moitié
const grapefruitWhole = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    C(0, 0, 14, '#f2c23a', 2.4) +
    FE(5, 5, 9, 8, '#f08a5a', 0.4) +
    FE(-5, -6, 3.4, 2, '#fff', 0.55, -30) +
    F('M0 -14 Q4 -19 10 -17 Q6 -12 0 -14Z', '#5fa040') +
    `</g>`;
const grapefruitHalf = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    C(0, 0, 13, '#f2c23a', 2.4) +
    C(0, 0, 10.5, '#fbe2d0', 1) +
    C(0, 0, 9.4, '#f08a8a', 0) +
    [0, 45, 90, 135, 180, 225, 270, 315]
        .map(a => L(`M0 0 L${(9.4 * Math.cos((a * Math.PI) / 180)).toFixed(1)} ${(9.4 * Math.sin((a * Math.PI) / 180)).toFixed(1)}`, 1, '#fbe2d0'))
        .join('') +
    FC(0, 0, 1.6, '#fbe2d0') +
    `</g>`;
// une grenade : ronde, rouge, la couronne
const pomegranateWhole = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    P('M-4 -13 L-2 -17 L0 -14 L2 -17 L4 -13Z', '#b81c34', 1.6) +
    C(0, 0, 13, '#c2253f', 2.4) +
    FE(5, 5, 8, 7, '#8a1030', 0.35) +
    FE(-5, -5, 3, 2, '#fff', 0.5, -30) +
    `</g>`;
const pomegranateHalf = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    C(0, 0, 13, '#c2253f', 2.4) +
    C(0, 0, 10.4, '#f6d8c8', 0) +
    [
        [-5, -4],
        [0, -6],
        [5, -4],
        [-6, 1],
        [-1, 0],
        [5, 2],
        [-3, 6],
        [2, 6],
    ]
        .map(([a, b], k) => C(a, b, 2.6, k % 2 ? '#d8203f' : '#e8405a', 1.1) + FC(a - 0.8, b - 0.8, 0.7, '#fff', 0.7))
        .join('') +
    `</g>`;
// une pistache : deux coques entrouvertes, l'amande verte
const pistachioShell = (x, y, s = 1, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M-6 -9 Q-8 0 -4 9 Q0 12 4 9 Q8 0 6 -9 Q0 -12 -6 -9Z', '#e8d2a8', 2) +
    E(0, 0, 3.4, 7, '#9bc860', 0, 1.4) +
    L('M0 -9 L0 -1', 1.2, '#b89a68') +
    FE(-2.6, -2, 1, 2.8, '#d8f0a0', 0.8) +
    `</g>`;
// un fruit du dragon : magenta, les écailles vertes
const dragonWhole = (x, y, s = 1, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M0 -13 Q-12 -11 -12 1 Q-12 12 0 13 Q12 12 12 1 Q12 -11 0 -13Z', '#e8366b', 2.4) +
    [
        [-12, -3, -50],
        [-12, 5, -70],
        [12, -3, 50],
        [12, 5, 70],
        [-5, -12, -20],
        [5, -12, 20],
        [-6, 12, -150],
        [6, 12, 150],
        [0, 12, 180],
    ]
        .map(([a, b, r]) => `<g transform="translate(${a} ${b}) rotate(${r})">${P('M-2.4 0 Q0 -8 2.4 0Z', '#6cb04a', 1.1)}</g>`)
        .join('') +
    FE(-4, -4, 2.6, 4, '#fff', 0.4, -20) +
    `</g>`;
const dragonHalf = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    P('M0 -13 Q-12 -11 -12 1 Q-12 12 0 13 Q12 12 12 1 Q12 -11 0 -13Z', '#e8366b', 2.4) +
    P('M0 -10 Q-9 -8 -9 1 Q-9 9 0 10 Q9 9 9 1 Q9 -8 0 -10Z', '#fbf3f0', 1) +
    [
        [-4, -4],
        [3, -5],
        [5, 1],
        [-5, 2],
        [0, 0],
        [-2, 6],
        [3, 6],
    ]
        .map(([a, b]) => FC(a, b, 0.9, '#3a2618'))
        .join('') +
    `</g>`;
// une noix de cajou : le haricot gris-brun
const cashewNut = (x, y, s = 1, rot = 0, c = '#d8b878') =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M-8 -2 Q-8 -9 0 -9 Q9 -9 9 0 Q9 7 3 9 Q-1 8 2 3 Q4 -1 0 -3 Q-4 -3 -5 2 Q-6 4 -8 -2Z', c, 2) +
    FE(-2, -6, 3, 1.2, '#fff', 0.5, -10) +
    `</g>`;
// la pomme de cajou : jaune et rouge, la noix qui pend dessous
const cashewApple = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    P('M0 -12 Q-11 -10 -10 2 Q-9 12 0 12 Q9 12 10 2 Q11 -10 0 -12Z', '#f6a23a', 2.2) +
    FE(4, 4, 6, 7, '#e8403a', 0.55) +
    FE(-4, -5, 2, 3.4, '#fff', 0.5, -15) +
    cashewNut(2, 17, 0.62, 80, '#8a7a68') +
    L('M0 -12 L1 -17', 1.8, '#6b3d1e') +
    `</g>`;

const FRUITS = {
    plum: () => SHADOW(32, 58, 22, 3) + leaf(30, 18, 15, -50, G, 0.45) + quetsche(20, 40, 1.15, -12) + quetsche(44, 38, 1.15, 10) + quetsche(32, 46, 1.25, 0),
    mandarin: () =>
        SHADOW(32, 58, 22, 3) + mandarinFruit(20, 44, 1.2) + mandarinFruit(44, 44, 1.2) + mandarinFruit(32, 30, 1.3) + leaf(32, 16, 12, -90, G, 0.4),
    grapefruit: () => SHADOW(32, 58, 22, 3) + grapefruitWhole(24, 38, 1.35) + grapefruitHalf(46, 48, 0.9),
    pomegranate: () => SHADOW(32, 58, 22, 3) + pomegranateWhole(26, 36, 1.4) + pomegranateHalf(47, 48, 0.85),
    pistachio: () =>
        SHADOW(32, 58, 22, 3) +
        pistachioShell(20, 40, 1.4, -20) +
        pistachioShell(34, 36, 1.5, 12) +
        pistachioShell(46, 46, 1.2, 35) +
        dots(
            [
                [14, 54, '#9bc860'],
                [52, 54, '#9bc860'],
            ],
            2.2,
        ),
    dragonfruit: () => SHADOW(32, 58, 22, 3) + dragonWhole(24, 38, 1.4, -12) + dragonHalf(47, 48, 0.9),
    cashew: () => SHADOW(32, 58, 22, 3) + cashewApple(22, 28, 1.4) + cashewNut(44, 46, 1.5, -20) + cashewNut(30, 54, 0.9, 30),
};
Object.assign(items, FRUITS);

// les fruits sur l'arbre
Object.assign(FRUIT_COL, {
    plum: '#5a3f86',
    mandarin: '#f58a1c',
    grapefruit: '#f2c23a',
    pomegranate: '#c2253f',
    pistachio: '#9bc860',
    dragonfruit: '#e8366b',
    cashew: '#f6a23a',
});
Object.assign(fruitExtra, {
    plum: (x, y) => quetsche(x - 2, y, 0.34, -10) + quetsche(x + 3, y + 1, 0.34, 10),
    mandarin: (x, y) => mandarinFruit(x, y, 0.38),
    grapefruit: (x, y) => grapefruitWhole(x, y, 0.36),
    pomegranate: (x, y) => pomegranateWhole(x, y, 0.36),
    pistachio: (x, y) => pistachioShell(x - 2, y, 0.42, -15) + pistachioShell(x + 3, y + 1, 0.42, 15),
    dragonfruit: (x, y) => dragonWhole(x, y, 0.4),
    cashew: (x, y) => cashewApple(x, y - 2, 0.34),
});

// ======================= les plats =======================
const scoops = (a, b, c) => coupe(scoop(22, 30, 8, a) + scoop(42, 30, 8, b) + scoop(32, 24, 9, c));
const nuts = list => list.map(([x, y, r], k) => cashewNut(x, y, 0.5, r, k % 2 ? '#d8b878' : '#c8a460')).join('');
const slice = (x, y, r, c) => `<g transform="rotate(${r} ${x} ${y})">${R(x - 7, y - 3, 14, 6, 1.6, c, 1.4)}</g>`;

const D = {
    // ---- le prunier
    plumTart: () =>
        tart(
            '#5a3f86',
            [
                [24, 38, '#3a2a58'],
                [34, 36, '#4a3470'],
                [42, 39, '#3a2a58'],
            ],
            true,
        ),
    plumJam: () => pot('#7a4a98', '#fffaf0', 'plum'),
    driedPlums: () =>
        bowl('#e8d8b0') +
        dots(
            [
                [20, 29, '#3a2a40'],
                [28, 31, '#4a3450'],
                [36, 29, '#3a2a40'],
                [44, 31, '#4a3450'],
                [32, 27, '#3a2a40'],
            ],
            3.6,
        ),
    plumBrandy: () => bottle('#f4f0e4', 'plum', '#e4f5ff', '#5a3f86'),
    magretPlums: () =>
        plate(46) +
        [
            [18, 41, -8],
            [28, 40, -4],
            [38, 41, 2],
        ]
            .map(
                ([x, y, r]) =>
                    `<g transform="rotate(${r} ${x} ${y})">${R(x - 6, y - 4, 13, 8, 2.4, '#7a3a2a', 1.6)}${R(x - 5, y - 2, 11, 3.4, 1.4, '#e8a090', 0)}</g>`,
            )
            .join('') +
        quetsche(46, 40, 0.5) +
        quetsche(14, 46, 0.45) +
        L('M16 47 Q32 51 48 47', 2, '#5a3f86'),
    // ---- le mandarinier
    mandarinJuice: () => juiceB('#ffa630', 'mandarin'),
    mandarinMarmalade: () => pot('#f5a623', '#c8453a', 'mandarin'),
    mandarinCake: withBadge('spongeCake', 'mandarin'),
    chocMandarins: () =>
        plate(46) +
        [
            [18, 42, -20],
            [30, 38, 8],
            [42, 42, 25],
            [30, 46, -5],
        ]
            .map(
                ([x, y, r]) =>
                    `<g transform="rotate(${r} ${x} ${y})">${P(`M${x - 7} ${y} Q${x} ${y - 9} ${x + 7} ${y} Q${x} ${y + 4} ${x - 7} ${y}Z`, '#5b3a29', 1.8)}${F(`M${x - 5} ${y} Q${x} ${y - 6} ${x + 5} ${y} Q${x} ${y + 1} ${x - 5} ${y}Z`, '#f58a1c')}</g>`,
            )
            .join(''),
    // ---- le pamplemoussier
    grapefruitJuice: () => juiceB('#f08a7a', 'grapefruit'),
    grapefruitMarmalade: () => pot('#f0a870', '#fffaf0', 'grapefruit'),
    grapefruitSorbet: () => scoops('#f6a8a0', '#f8b8a8', '#f4988c'),
    grapefruitTart: () =>
        tart(
            '#f4a8a0',
            [
                [24, 38, '#f2c23a'],
                [34, 36, '#f08a8a'],
                [42, 39, '#f2c23a'],
            ],
            false,
        ) + badge('grapefruit'),
    // ---- le grenadier
    pomegranateJuice: () => juiceB('#c2253f', 'pomegranate'),
    grenadine: () => bottle('#d8203f', 'pomegranate', '#e4f5ff', '#2a2040'),
    magretPomegranate: () =>
        plate(46) +
        [
            [18, 41, -8],
            [28, 40, -4],
            [38, 41, 2],
        ]
            .map(
                ([x, y, r]) =>
                    `<g transform="rotate(${r} ${x} ${y})">${R(x - 6, y - 4, 13, 8, 2.4, '#7a3a2a', 1.6)}${R(x - 5, y - 2, 11, 3.4, 1.4, '#e8a090', 0)}</g>`,
            )
            .join('') +
        dots(
            [
                [16, 46, '#d8203f'],
                [24, 47, '#e8405a'],
                [34, 47, '#d8203f'],
                [44, 45, '#e8405a'],
                [47, 40, '#d8203f'],
                [12, 42, '#e8405a'],
            ],
            2.2,
        ),
    pomegranateSorbet: () => scoops('#d8405a', '#e8506a', '#c82a48'),
    // ---- le pistachier
    roastedPistachios: () =>
        bowl('#e8d2a8') +
        pistachioShell(20, 28, 0.5, -20) +
        pistachioShell(32, 24, 0.55, 10) +
        pistachioShell(44, 28, 0.5, 30) +
        pistachioShell(26, 31, 0.45, 70),
    pistachioOil: () => oil('#b8c860', 'pistachio'),
    pistachioIce: () => scoops('#a8d070', '#b8dc80', '#98c862'),
    pistachioNougat: () =>
        woodBoard() +
        R(10, 36, 18, 10, 2.4, '#fffaf0', 1.8) +
        R(32, 38, 20, 9, 2.4, '#fffaf0', 1.8) +
        dots(
            [
                [16, 41, '#9bc860'],
                [22, 40, '#9bc860'],
                [38, 42, '#9bc860'],
                [46, 41, '#9bc860'],
                [42, 44, '#9bc860'],
            ],
            1.8,
        ),
    pistachioFinancier: () =>
        plate(46) +
        [
            [18, 42, -8],
            [32, 39, 4],
            [45, 43, 12],
        ]
            .map(
                ([x, y, r]) =>
                    `<g transform="rotate(${r} ${x} ${y})">${R(x - 8, y - 5, 16, 10, 2.4, '#e0a84a', 1.8)}${dots(
                        [
                            [x - 3, y - 2, '#9bc860'],
                            [x + 3, y, '#9bc860'],
                            [x - 1, y + 2, '#9bc860'],
                        ],
                        1.2,
                    )}</g>`,
            )
            .join(''),
    // ---- le fruit du dragon
    dragonJuice: () => juiceB('#e8366b', 'dragonfruit'),
    dragonSmoothie: () => tallGlass('#e8366b', sub('dragonfruit', 4, 0, 18), '#fff0f4', '#6cb04a'),
    dragonSorbet: () => scoops('#f06a94', '#f882a8', '#e8508a'),
    exoticTartlet: () =>
        tart(
            '#fff0f4',
            [
                [24, 38, '#e8366b'],
                [34, 36, '#3a2618'],
                [42, 39, '#e8366b'],
            ],
            false,
        ) + badge('dragonfruit'),
    // ---- la noix de cajou
    roastedCashews: () =>
        bowl('#e8d2a8') +
        nuts([
            [20, 28, -20],
            [32, 24, 10],
            [44, 28, 30],
            [27, 31, 70],
            [38, 31, -40],
        ]),
    cashewButter: () => pot('#d8b878', '#8a8a90', 'cashew'),
    cashewRice: () =>
        bowl('#f6ecc0') +
        nuts([
            [22, 27, -20],
            [34, 24, 15],
            [44, 28, 40],
        ]) +
        dots(
            [
                [28, 29, '#5fa040'],
                [40, 30, '#e8793a'],
                [18, 30, '#5fa040'],
            ],
            2,
        ),
    cashewBrittle: () =>
        woodBoard() +
        slice(20, 42, -6, '#d89a3a') +
        slice(40, 40, 6, '#c8862a') +
        nuts([
            [16, 41, 10],
            [26, 43, -20],
            [38, 39, 20],
            [46, 41, 0],
        ]),
};
Object.assign(items, D);
export const DISHES_131 = Object.keys(D);
