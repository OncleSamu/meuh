// 1.100 : les dernières recettes : plats à l'argile, pâtes de baies, friture, ablettes marinées, laines du désert.
import { C, E, F, FC, FE, HL, L, P, R, SHADOW, leaf, items } from '../kit.js';
import { plate, jar } from '../items2.js';

const fish = (x, y, s, body, belly = '#f4f1ea', rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M-14 0 Q-8 -8 4 -7 Q12 -6 14 -1 L20 -6 L19 0 L20 6 L14 1 Q12 6 4 7 Q-8 8 -14 0Z', body, 2.2 / s) +
    F('M-12 1 Q-4 7 6 6 Q12 4 13 1Z', belly, 0.85) +
    FC(-8, -1.5, 1.4, '#3a2618') +
    `</g>`;
const fried = (x, y, rot) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})">` +
    P('M-10 0 Q-6 -5 4 -4 Q9 -3 10 0 L14 -3 L13 1 L14 4 L10 1 Q8 4 2 4 Q-6 5 -10 0Z', '#d9902a', 1.6) +
    FC(-6, -1, 0.9, '#3a2618') +
    `</g>`;
const lemon = (x, y, r = 5) => C(x, y, r, '#7cc23a', 1.6) + C(x, y, r - 1.6, '#d8f08a', 0) + L(`M${x - r + 2} ${y} L${x + r - 2} ${y} M${x} ${y - r + 2} L${x} ${y + r - 2}`, 0.8, '#7cc23a');
// un plat cuit sous une croûte d'argile fendue : la croûte, la fente, le poisson qui en sort
const clay = f =>
    SHADOW(32, 56, 28, 3) +
    E(32, 46, 28, 10, '#ffffff') +
    E(32, 45, 20, 6.5, '#eef3f6', 0, 1.4) +
    P('M8 42 Q8 30 22 28 Q32 25 42 28 Q56 30 56 42 Q56 50 46 51 L18 51 Q8 50 8 42Z', '#b9855a') +
    P('M10 42 Q10 32 22 30 Q32 27 42 30 Q54 32 54 42', 'none', 0) +
    HL(20, 33, 6, 1.8, -10, 0.4) +
    L('M20 36 L26 40 L34 36 L42 41', 1.6, '#6b4527') +
    f;
const grains = (x, y) => FC(x, y, 1.6, '#b8742a', 0.9) + FC(x + 0.5, y - 0.5, 0.5, '#e8b060', 0.8);
const wool = (c, c2) =>
    SHADOW(32, 56, 24, 3) +
    P('M8 38 Q8 22 24 20 Q34 14 46 22 Q58 26 56 40 Q54 52 40 52 L22 52 Q8 52 8 38Z', c) +
    HL(22, 28, 6, 2, -20, 0.5) +
    [[18, 30], [30, 26], [42, 30], [24, 42], [38, 42], [48, 42]].map(([x, y]) => L(`M${x} ${y} q3 -3 6 0`, 1.4, c2)).join('');
const rug = (c, stripe, trim) =>
    SHADOW(32, 56, 28, 3) +
    P('M6 22 L58 22 L62 50 L2 50Z', c) +
    P('M10 26 L54 26 L57 46 L7 46Z', 'none', 1.6, stripe) +
    L('M12 32 L52 32 M10 38 L54 38', 2, stripe) +
    [14, 24, 32, 40, 50].map(x => L(`M${x} 50 L${x - 1} 56`, 1.4, trim)).join('') +
    [14, 24, 32, 40, 50].map(x => L(`M${x} 22 L${x + 1} 17`, 1.4, trim)).join('');
const cloak = (c, trim) =>
    SHADOW(32, 58, 22, 3) +
    P('M32 6 Q20 6 18 18 Q10 26 8 56 L56 56 Q54 26 46 18 Q44 6 32 6Z', c) +
    P('M32 6 Q26 6 24 16 Q32 24 40 16 Q38 6 32 6Z', trim) +
    L('M32 20 L32 56', 1.6, trim) +
    HL(20, 30, 2, 8, -10, 0.35);

Object.assign(items, {
    sorghumFlatbread: () =>
        plate(46) +
        E(32, 44, 20, 8.5, '#d9a05a', 0, 2) +
        E(32, 43, 15, 6, '#eec27a', 0, 0) +
        [[22, 43], [30, 40], [40, 44], [34, 47], [26, 47], [44, 40]].map(([x, y]) => grains(x, y)).join('') +
        L('M20 44 Q32 38 44 44', 1.2, '#b8742a') +
        leaf(14, 46, 6, -150, '#4caf50', 0.5),
    clayTench: () => clay(fish(32, 38, 0.95, '#7f8f4a', '#d9d3a0') + lemon(48, 46, 4)),
    clayBurbot: () => clay(fish(32, 38, 0.95, '#a89060', '#e8e0c0') + FC(24, 46, 1.2, '#8b5a2b') + FC(30, 47, 1, '#8b5a2b') + FC(40, 47, 1.2, '#8b5a2b')),
    claySturgeon: () => clay(fish(32, 38, 1.05, '#7a8a96', '#dfe6ec') + L('M20 35 L22 33 M26 34 L28 32 M32 34 L34 32', 1, '#4a5a66') + lemon(48, 46, 4)),
    zebuMilkJam: () => jar('#f0d38a', '#8b5a2b', null) + FE(30, 34, 8, 4, '#fff1c8', 0.8) + R(21, 34, 22, 12, 4, '#fffaf0', 1.4) + FC(32, 40, 3, '#e8b84f', 0.9),
    turkeyEggCurd: () => jar('#f6d36a', '#c7882f', null) + R(21, 33, 22, 14, 4, '#fffaf0', 1.4) + E(32, 40, 5.5, 3.6, '#fffdf4', 0, 1) + FC(32, 40, 2.1, '#ffc42b', 0.8),
    sorghumBerryPaste: () =>
        SHADOW(32, 56, 24, 3) +
        R(10, 28, 44, 22, 5, '#8a2f4a') +
        R(10, 26, 44, 8, 4, '#b84a68') +
        [[18, 42], [28, 40], [38, 43], [46, 40]].map(([x, y]) => grains(x, y)).join('') +
        L('M32 28 L32 50', 1.2, '#5a1f30') +
        HL(20, 31, 8, 1.6, 0, 0.5),
    friedBleak: () => plate(46) + fried(22, 44, -10) + fried(34, 40, 8) + fried(44, 46, -4) + fried(30, 48, 14) + lemon(14, 44, 4.4) + leaf(50, 40, 6, -30, '#4caf50', 0.5),
    marinatedBleak: () => jar('#f2e6b0', '#3f6fb5', null) + fish(30, 38, 0.5, '#8aa0aa', '#dfe6ec') + fish(30, 47, 0.5, '#8aa0aa', '#dfe6ec', 6) + lemon(38, 32, 3.2),
    camelRug: () => rug('#c98a4a', '#f4ead6', '#8b5a2b'),
    camelBurnous: () => cloak('#b98a52', '#e6cf9a'),
    barbaryShawl: () => wool('#d9c3a0', '#a8895a') + L('M12 52 L10 58 M20 52 L19 58 M30 52 L30 58 M40 52 L41 58 M50 52 L52 58', 1.6, '#a8895a'),
});
