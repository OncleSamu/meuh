// 1.5 : six cultures, quatre arbres, la caille, la crêperie et leurs recettes.
import { C, E, F, FC, FE, G, GD, GL, HL, L, P, R, SHADOW, leaf, mound, stem, sub, items, animals, machines, youngExtra, readyExtra, tart } from './kit.js';
import { FRUIT_COL, fruitExtra } from './plants.js';
import { plate, bowl, jar, coupe, scoop, juiceB, steamF, woodBoard, oil, cup, tallGlass } from './items2.js';
import { eye, leg } from './animals.js';

// ======================= les formes de base =======================
// une feuille d'épinard, large et cloquée
const spinLeaf = (x, y, s, rot, c = '#3f8a3a') =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M0 0 Q-12 -6 -10 -22 Q0 -30 10 -22 Q12 -6 0 0Z', c, 2.2) +
    L('M0 -2 L0 -24 M0 -10 L-6 -16 M0 -10 L6 -16 M0 -18 L-4 -22 M0 -18 L4 -22', 1, 'rgba(255,255,255,.45)') +
    `</g>`;
// un concombre, rayé et piqué de petits points
const cuke = (x, y, s, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M-22 -2 Q-22 -8 -14 -8 L16 -8 Q24 -8 24 0 Q24 8 16 8 L-14 8 Q-22 8 -22 2Z', '#3f8a3a', 2.2) +
    L('M-16 -3 L18 -3 M-16 3 L18 3', 1.2, '#7ab84a') +
    [-12, -4, 4, 12].map(xx => FC(xx, -5, 0.8, '#d8ecb0') + FC(xx + 3, 5, 0.8, '#d8ecb0')).join('') +
    R(-26, -2, 5, 4, 1.5, '#a8793a', 1.4) +
    HL(-4, -5, 8, 1.2, 0, 0.45) +
    `</g>`;
// une tige de rhubarbe, rouge dégradé vers le vert, sa grande feuille
const rhubarbStalk = (x, y, s, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M-3 0 L-3 -34 Q0 -36 3 -34 L3 0 Q0 2 -3 0Z', '#d8394a', 2) +
    F('M-2 -20 L2 -20 L2 -33 Q0 -35 -2 -33Z', '#8fbf4a', 0.85) +
    L('M0 -2 L0 -30', 0.9, 'rgba(255,255,255,.4)') +
    `</g>`;
// une framboise : petites boules serrées
const rasp = (x, y, s = 1) => {
    let o = `<g transform="translate(${x} ${y}) scale(${s})">` + P('M-7 -4 Q-8 6 0 10 Q8 6 7 -4 Q0 -8 -7 -4Z', '#d8264a', 2);
    for (const [a, b] of [
        [-4, -2],
        [0, -3],
        [4, -2],
        [-5, 2],
        [-1, 2],
        [3, 2],
        [-2, 6],
        [2, 6],
    ])
        o += C(a, b, 2, '#e8405a', 0.9);
    return o + FC(-3, -3, 0.8, '#fff', 0.8) + P('M-4 -5 L0 -9 L4 -5 L0 -6Z', '#4f9a3a', 1.2) + '</g>';
};
// un grain de sarrasin : petit tétraèdre brun
const bwSeed = (x, y, r = 2.4, c = '#8b5a2b') => P(`M${x} ${y - r} L${x + r} ${y + r * 0.7} L${x - r} ${y + r * 0.7}Z`, c, 0.9);
// un piment d'Espelette, rouge vif et pointu
const chili = (x, y, s, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M-4 -14 Q6 -14 5 -2 Q4 10 -2 18 Q-3 10 -6 0 Q-8 -10 -4 -14Z', '#d8263a', 2.2) +
    HL(-2, -4, 1.2, 6, 10, 0.55) +
    P('M-5 -14 Q-1 -19 4 -14 Q0 -15 -5 -14Z', '#4f9a3a', 1.6) +
    L('M0 -16 Q2 -21 6 -22', 1.8, '#3f7a2e') +
    `</g>`;
// le citron, la noisette, l'amande et le coing
const lemonFruit = (x, y, s, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M-16 0 Q-14 -11 0 -12 Q14 -11 16 0 Q14 11 0 12 Q-14 11 -16 0Z', '#ffd83a', 2.2) +
    P('M16 0 L20 -1.5 L20 1.5Z', '#f2c22a', 1.4) +
    P('M-16 0 L-19 -1.2 L-19 1.2Z', '#f2c22a', 1.4) +
    [-6, 0, 6].map(xx => FC(xx, 3, 0.7, '#e8b82a')).join('') +
    HL(-6, -5, 4, 2, -15, 0.6) +
    `</g>`;
const lemonHalf = (x, y, r) =>
    C(x, y, r, '#ffd83a', 2) +
    C(x, y, r - 2.2, '#fff6b0', 1) +
    [0, 60, 120, 180, 240, 300]
        .map(a => L(`M${x} ${y} L${x + (r - 2.6) * Math.cos((a * Math.PI) / 180)} ${y + (r - 2.6) * Math.sin((a * Math.PI) / 180)}`, 0.9, '#f2c22a'))
        .join('');
const hazel = (x, y, s, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M0 -12 Q11 -10 11 2 Q11 12 0 12 Q-11 12 -11 2 Q-11 -10 0 -12Z', '#b8763a', 2.2) +
    P('M-11 2 Q-11 -10 0 -12 Q11 -10 11 2 Q6 -3 0 -3 Q-6 -3 -11 2Z', '#e8c38c', 1.4) +
    L('M-4 4 Q-3 8 -5 10 M3 5 Q4 8 2 10', 1, '#8b5a2b') +
    HL(-4, 5, 2, 3, 15, 0.45) +
    `</g>`;
const almondNut = (x, y, s, rot = 0, c = '#c88a52') =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M0 -14 Q10 -4 8 6 Q6 13 0 13 Q-6 13 -8 6 Q-10 -4 0 -14Z', c, 2.2) +
    L('M-3 -6 Q-4 0 -3 6 M2 -4 Q3 2 2 8', 1, 'rgba(58,38,24,.35)') +
    HL(-3, -2, 1.6, 4, 15, 0.5) +
    `</g>`;
const quinceFruit = (x, y, s, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M0 -14 Q8 -15 10 -8 Q16 -2 15 6 Q13 15 0 15 Q-13 15 -15 6 Q-16 -2 -10 -8 Q-8 -15 0 -14Z', '#f0c83a', 2.2) +
    L('M-6 -8 Q-9 2 -6 12 M6 -8 Q9 2 6 12', 1, 'rgba(58,38,24,.25)') +
    FE(6, 4, 4, 5, '#e8a83a', 0.5) +
    HL(-6, -2, 3, 5, 15, 0.55) +
    L('M0 -14 Q1 -18 3 -19', 2, '#6b3d1e') +
    P('M3 -18 Q10 -22 14 -16 Q8 -15 3 -18Z', '#7aa04a', 1.4) +
    `</g>`;
// un œuf de caille, crème moucheté de brun
const qEgg = (x, y, s = 1, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    E(0, 0, 6, 7.6, '#f2e6c8', 0, 1.8) +
    [
        [-2, -3, 1.4],
        [2, -1, 1.1],
        [-1, 3, 1.3],
        [3, 4, 0.9],
        [-4, 1, 0.8],
        [1, -5, 0.8],
    ]
        .map(([a, b, r]) => FC(a, b, r, '#6b4a2a'))
        .join('') +
    HL(-2, -3, 1.4, 2.4, -20, 0.5) +
    `</g>`;
// la crêpe pliée en éventail, la galette carrée à bords dorés
const crepe = (fill = '', top = '') =>
    plate(46) +
    P('M10 42 Q14 30 32 28 Q50 30 54 42 Q40 50 32 50 Q22 50 10 42Z', '#f2c879') +
    F('M14 40 Q18 32 32 30 Q46 32 50 40', '#e8a548', 0.35) +
    L('M16 41 Q32 36 48 41', 1.2, '#c98b2a') +
    fill +
    P('M10 42 Q22 34 32 38 Q42 34 54 42 Q40 50 32 50 Q22 50 10 42Z', '#f6d48c', 2) +
    L('M14 43 Q20 46 26 45 M38 45 Q44 46 50 43', 1, '#d99a3a') +
    top;
const galette = inner =>
    plate(46) +
    P('M8 40 L32 28 L56 40 L32 52Z', '#8b5a2b') +
    F('M12 40 L32 30 L52 40 L32 50Z', '#a8693a', 0.6) +
    [16, 24, 40, 48].map((x, k) => FC(x, 40 + (k % 2 ? 2 : -2), 1, '#5e3a1e')).join('') +
    P('M16 40 L32 32 L48 40 L32 48Z', '#c88a52', 1.6) +
    inner;
const sugarDust = (list, c = '#ffffff') => list.map(([x, y]) => FC(x, y, 0.9, c)).join('');

// ======================= les produits bruts =======================
const RAW = {
    // les épinards : une poignée de feuilles
    spinach: () =>
        SHADOW(32, 57, 20, 3) +
        spinLeaf(22, 54, 0.95, -35, '#3f8a3a') +
        spinLeaf(42, 54, 0.95, 35, '#3f8a3a') +
        spinLeaf(32, 56, 1.1, 0, '#4f9a42') +
        L('M24 56 L32 58 L40 56', 2, '#8fbf5a'),
    // le concombre : un long, un petit, une rondelle
    cucumber: () =>
        SHADOW(32, 57, 24, 3) +
        cuke(30, 38, 1, -25) +
        C(46, 50, 7, '#3f8a3a', 2) +
        C(46, 50, 5.4, '#e8f6c8', 0.8) +
        [0, 72, 144, 216, 288].map(a => FC(46 + 2.6 * Math.cos((a * Math.PI) / 180), 50 + 2.6 * Math.sin((a * Math.PI) / 180), 0.8, '#b8d88a')).join(''),
    // la rhubarbe : trois tiges nouées, une feuille
    rhubarb: () =>
        SHADOW(32, 58, 20, 3) +
        P('M31 26 Q14 12 24 4 Q36 -1 41 10 Q44 20 35 27Z', '#5fa040', 2) +
        L('M33 25 Q31 14 29 8 M31 17 L25 12 M32 19 L38 13', 1, 'rgba(255,255,255,.4)') +
        rhubarbStalk(26, 58, 0.9, -12) +
        rhubarbStalk(32, 58, 0.95, 0) +
        rhubarbStalk(38, 58, 0.9, 12) +
        L('M24 48 Q32 52 40 48', 2.6, '#d9a066'),
    // les framboises : une barquette
    raspberry: () =>
        SHADOW(32, 58, 22, 3) +
        P('M10 36 L54 36 L50 56 L14 56Z', '#fff6e8') +
        L('M12 42 L52 42 M13 48 L51 48 M20 36 L22 56 M32 36 L32 56 M44 36 L42 56', 1, 'rgba(58,38,24,.2)') +
        rasp(18, 32, 0.9) +
        rasp(30, 30, 1) +
        rasp(42, 31, 0.95) +
        rasp(24, 24, 0.85) +
        rasp(37, 23, 0.9),
    // le sarrasin : un épi de grains bruns et quelques fleurs blanches
    buckwheat: () => {
        let o = SHADOW(32, 58, 18, 3) + stem('M32 58 Q30 40 32 14', '#b8483a', 1.8);
        [
            [26, 20],
            [38, 22],
            [24, 30],
            [40, 32],
            [27, 40],
            [37, 42],
            [32, 12],
        ].forEach(([x, y], k) => (o += k % 3 === 2 ? C(x, y, 3, '#fffaf0', 1.4) + FC(x, y, 1, '#f2a0a0') : bwSeed(x, y, 3.4)));
        return o + leaf(32, 48, 12, -150, G, 0.5) + leaf(32, 46, 12, -30, GL, 0.5);
    },
    // le piment d'Espelette : une petite guirlande de trois piments
    espelette: () => SHADOW(32, 58, 20, 3) + L('M12 8 Q32 16 52 8', 2, '#c9a96e') + chili(20, 30, 1, 20) + chili(32, 34, 1.1, 0) + chili(44, 30, 1, -20),
    lemon: () => SHADOW(32, 57, 22, 3) + lemonFruit(28, 40, 1.15, -15) + lemonHalf(46, 46, 9) + leaf(30, 28, 12, -60, G, 0.45),
    hazelnut: () =>
        SHADOW(32, 57, 20, 3) + hazel(22, 44, 1, -15) + hazel(40, 46, 1, 15) + hazel(31, 32, 0.95, 0) + P('M14 28 Q24 14 36 18 Q30 28 14 28Z', '#8fbf5a', 1.6),
    almond: () => SHADOW(32, 57, 20, 3) + almondNut(22, 42, 1, -25) + almondNut(42, 42, 1, 25) + almondNut(32, 36, 1.05, 0, '#d89a62'),
    quince: () => SHADOW(32, 58, 18, 3) + quinceFruit(32, 38, 1.35),
    // les œufs de caille, dans leur boîte en carton
    quailEgg: () =>
        SHADOW(32, 57, 24, 3) +
        P('M8 42 L56 42 L52 56 L12 56Z', '#c8a46a') +
        L('M20 42 L19 56 M32 42 L32 56 M44 42 L45 56', 1, 'rgba(58,38,24,.3)') +
        qEgg(16, 38, 1, -10) +
        qEgg(28, 37, 1.05, 5) +
        qEgg(40, 38, 1, -5) +
        qEgg(50, 39, 0.95, 10),
};

// ======================= les plantes au champ =======================
const sprout = c => mound() + leaf(32, 54, 15, -140, c, 0.4) + leaf(32, 54, 15, -40, c, 0.4) + leaf(32, 54, 13, -90, GL, 0.4);
Object.assign(youngExtra, {
    spinach: () => mound() + spinLeaf(26, 56, 0.55, -40) + spinLeaf(38, 56, 0.55, 40) + spinLeaf(32, 56, 0.6, 0, '#4f9a42'),
    cucumber: () => sprout('#4f9a3a'),
    rhubarb: () => mound() + rhubarbStalk(28, 56, 0.5, -15) + rhubarbStalk(36, 56, 0.5, 15) + leaf(32, 40, 14, -90, '#5fa040', 0.6),
    raspberry: () =>
        mound() +
        stem('M28 56 L26 30', '#8a5a3a', 1.6) +
        stem('M36 56 L38 34', '#8a5a3a', 1.6) +
        leaf(26, 40, 10, -150, G, 0.5) +
        leaf(38, 42, 10, -30, G, 0.5),
    buckwheat: () => mound() + [26, 32, 38].map(x => stem(`M${x} 56 L${x} 38`, '#b8483a', 1.2) + leaf(x, 42, 7, -120, G, 0.6)).join(''),
    espelette: () => sprout('#4f9a3a') + stem('M32 54 L32 40', G, 1.4),
});
Object.assign(readyExtra, {
    spinach: () => mound() + [-50, -25, 0, 25, 50].map((a, k) => spinLeaf(32 + a / 8, 56, 0.72, a, k % 2 ? '#4f9a42' : '#3f8a3a')).join(''),
    cucumber: () =>
        mound() +
        L('M22 56 L22 12 M42 56 L42 12 M20 14 L44 14', 2.4, '#a8793a') +
        L('M24 56 Q18 40 26 30 Q34 20 28 12 M40 56 Q46 40 38 30', 2, GD) +
        leaf(24, 40, 11, -150, G, 0.55) +
        leaf(40, 34, 11, -30, GL, 0.55) +
        leaf(30, 22, 10, -100, G, 0.55) +
        cuke(28, 34, 0.42, 80) +
        cuke(38, 44, 0.42, 95) +
        C(34, 18, 2.4, '#ffd23f', 1.2),
    rhubarb: () =>
        mound() +
        rhubarbStalk(24, 56, 0.85, -20) +
        rhubarbStalk(32, 56, 0.9, 0) +
        rhubarbStalk(40, 56, 0.85, 20) +
        P('M14 26 Q6 8 22 6 Q32 4 30 22Z', '#5fa040', 2) +
        P('M50 26 Q58 8 42 6 Q32 4 34 22Z', '#4f9a3a', 2) +
        P('M24 22 Q22 6 32 4 Q42 6 40 22Z', '#6cb04a', 2),
    raspberry: () =>
        mound() +
        stem('M24 56 Q20 34 24 14', '#8a5a3a', 1.6) +
        stem('M40 56 Q44 34 40 14', '#8a5a3a', 1.6) +
        leaf(22, 42, 11, -150, G, 0.5) +
        leaf(42, 40, 11, -30, G, 0.5) +
        leaf(24, 26, 10, -150, GL, 0.5) +
        leaf(40, 24, 10, -30, GL, 0.5) +
        rasp(20, 32, 0.6) +
        rasp(28, 20, 0.6) +
        rasp(44, 30, 0.6) +
        rasp(36, 16, 0.55),
    buckwheat: () =>
        mound() +
        [22, 30, 38, 44]
            .map(
                (x, k) =>
                    stem(`M${x} 56 Q${x - 2} 36 ${x} ${18 + (k % 2) * 4}`, '#b8483a', 1.4) +
                    leaf(x, 44, 7, k % 2 ? -30 : -150, G, 0.5) +
                    [0, 4, 8].map(d => C(x + (d === 4 ? 2.4 : -1.6), 16 + (k % 2) * 4 + d, 2.4, d === 8 ? '#f2a0a0' : '#fffaf0', 1.1)).join(''),
            )
            .join(''),
    espelette: () =>
        mound() +
        stem('M32 56 L32 18', '#4f9a3a', 2) +
        leaf(32, 46, 12, -150, G, 0.45) +
        leaf(32, 40, 12, -30, GL, 0.45) +
        leaf(32, 26, 10, -150, G, 0.45) +
        leaf(32, 22, 10, -30, G, 0.45) +
        chili(24, 40, 0.55, 15) +
        chili(40, 36, 0.55, -15) +
        chili(28, 26, 0.5, 10) +
        chili(38, 22, 0.5, -10),
});

// les fruits sur l'arbre
Object.assign(FRUIT_COL, { lemon: '#ffd83a', hazelnut: '#b8763a', almond: '#9ac06a', quince: '#f0c83a' });
Object.assign(fruitExtra, {
    lemon: (x, y) => lemonFruit(x, y, 0.32, -20),
    hazelnut: (x, y) => hazel(x - 2.5, y, 0.32) + hazel(x + 2.5, y + 1, 0.32),
    // l'amande reste dans sa coque verte et veloutée sur l'arbre
    almond: (x, y) => E(x, y, 3.6, 4.6, '#9ac06a', 20, 1.6) + L(`M${x - 1} ${y - 3} Q${x + 1} ${y} ${x - 1} ${y + 3}`, 0.8, '#6f8f3a'),
    quince: (x, y) => quinceFruit(x, y, 0.36),
});

// ======================= la caille =======================
animals.quail = () =>
    SHADOW(38, 72, 16, 3) +
    leg('M33 62 L32 70 M29 71 L35 71', '#e8a548') +
    leg('M42 62 L43 70 M40 71 L46 71', '#e8a548') +
    P('M16 50 Q14 38 26 36 Q30 26 40 24 Q52 24 54 34 Q58 44 52 54 Q44 64 30 63 Q18 60 16 50Z', '#a8763a') +
    P('M40 24 Q52 24 54 34 Q50 38 44 36 Q38 32 40 24Z', '#8b5a2b', 0) +
    P('M16 50 Q14 38 26 36 Q30 26 40 24 Q52 24 54 34 Q58 44 52 54 Q44 64 30 63 Q18 60 16 50Z', 'none') +
    // le plastron clair et les mouchetures
    E(40, 48, 10, 9, '#e8c890', -10) +
    [
        [24, 46],
        [28, 52],
        [22, 54],
        [30, 44],
        [36, 54],
        [44, 46],
        [42, 54],
    ]
        .map(([x, y]) => FE(x, y, 1.6, 1, '#4a3020', 0.9, -20))
        .join('') +
    L('M22 44 Q28 48 34 46', 1.4, '#6b4a2a') +
    // la tête, le sourcil blanc, la plume qui dépasse
    L('M44 28 Q50 26 54 30', 1.8, '#fffaf0') +
    L('M46 24 Q44 16 48 12', 2) +
    C(48, 12, 2, '#3a2618', 0) +
    P('M54 32 L61 34 L54 36Z', '#5e3a1e', 2) +
    eye(50, 31) +
    HL(30, 40, 4, 2, -20, 0.5);

// ======================= les recettes =======================
const RECIPES_ART = () => ({
    buckwheatFlour:
        SHADOW(32, 58, 18, 3) +
        P('M17 58 Q11 42 18 27 L22 19 L42 19 L46 27 Q53 42 47 58Z', '#e8d3a8') +
        E(32, 19, 11, 4.5, '#b8a088') +
        P('M22 20 L18 11 L27 15Z', '#e8d3a8', 2) +
        P('M42 20 L46 11 L37 15Z', '#e8d3a8', 2) +
        L('M21 23 Q32 27 43 23', 2.4, '#a8693a') +
        C(32, 43, 10, '#fff', 2) +
        sub('buckwheat', 23, 34, 18),
    sobacha: cup('#c8843a', sub('buckwheat', 6, 4, 18)),
    buckwheatSalad:
        bowl('#c8a46a', 30) +
        [14, 20, 26, 32, 38, 44, 50, 17, 23, 29, 35, 41, 47].map((x, k) => bwSeed(x, k < 7 ? 28 : 32, 1.8)).join('') +
        C(22, 27, 4, '#3f8a3a', 1.4) +
        C(22, 27, 2.8, '#e8f6c8', 0.6) +
        C(40, 28, 4, '#3f8a3a', 1.4) +
        C(40, 28, 2.8, '#e8f6c8', 0.6) +
        lemonHalf(52, 22, 5),
    tzatziki:
        bowl('#f6f6ee', 30) +
        C(20, 28, 3.6, '#3f8a3a', 1.2) +
        C(20, 28, 2.4, '#e8f6c8', 0.6) +
        [28, 34, 40, 46, 31, 43].map((x, k) => FC(x, k < 4 ? 27 : 31, 0.9, '#5fa040')).join('') +
        E(38, 29, 4, 1.4, '#f2e6a0', 0, 0.8),
    gazpacho:
        bowl('#e2503a', 30) +
        C(22, 28, 3.2, '#3f8a3a', 1.2) +
        C(22, 28, 2, '#e8f6c8', 0.5) +
        FC(36, 27, 1.6, '#6cc04a') +
        FC(42, 30, 1.4, '#ffd23f') +
        FC(30, 31, 1.3, '#fff', 0.7),
    quailSalad:
        bowl('#4f9a42', 30) +
        spinLeaf(16, 32, 0.4, -50) +
        spinLeaf(48, 32, 0.4, 50) +
        qEgg(24, 26, 0.8) +
        qEgg(34, 25, 0.8, 15) +
        qEgg(42, 28, 0.75, -10) +
        lemonHalf(14, 22, 4.5),
    raspberrySorbet: coupe(scoop(24, 30, 9, '#e8405a') + scoop(40, 30, 9, '#f2607a') + scoop(32, 22, 9, '#d8264a'), rasp(46, 18, 0.6)),
    hazelnutIce: coupe(scoop(24, 30, 9, '#c89a62') + scoop(40, 30, 9, '#d8aa72') + scoop(32, 22, 9, '#b8885a'), hazel(44, 16, 0.4)),
    lemonade: tallGlass('#fff6b0', lemonHalf(46, 10, 6), '#fffae0', '#ffd23f'),
    almondMilk: juiceB('#fbf6ec', 'almond', '#c88a52'),
    raspberryLiqueur: juiceB('#a8183a', 'raspberry', '#7a1a2a'),
    limoncello: juiceB('#f6e64a', 'lemon', '#3f8a3a'),
    quinceRatafia: juiceB('#d8963a', 'quince', '#8b5a2b'),
    rhubarbCompote: jar('#e88a8a', '#5fa040', sub('rhubarb', 22, 33, 20)),
    pickles: jar('#9ab85a', '#3f6fb5', sub('cucumber', 22, 33, 20)),
    piperade: jar('#e2503a', '#c8453a', sub('espelette', 22, 33, 20)),
    quinceJelly: jar('#e8a83a', '#c8453a', sub('quince', 22, 33, 20)),
    rhubarbJam: jar('#d8394a', '#fffaf0', sub('strawberry', 20, 33, 13) + sub('rhubarb', 31, 33, 13)),
    rhubarbTart: tart(
        '#f2a0a0',
        [
            [20, 37, '#d8394a'],
            [28, 36, '#e8607a'],
            [36, 36, '#d8394a'],
            [44, 37, '#e8607a'],
        ],
        true,
    ),
    spinachQuiche:
        tart('#f2d670', [
            [20, 38, '#3f8a3a'],
            [30, 36, '#4f9a42'],
            [40, 37, '#3f8a3a'],
            [26, 40, '#4f9a42'],
            [36, 40, '#3f8a3a'],
        ]) + steamF,
    lemonTart:
        tart('#ffe04a', []) +
        [18, 26, 34, 42, 22, 30, 38]
            .map(
                (x, k) =>
                    P(`M${x - 4} ${k < 4 ? 38 : 35} Q${x} ${k < 4 ? 28 : 25} ${x + 4} ${k < 4 ? 38 : 35}Z`, '#fffaf0', 1.4) +
                    FC(x, k < 4 ? 31 : 28, 1, '#e8a548'),
            )
            .join(''),
    galetteRois:
        plate(46) +
        E(32, 40, 23, 9, '#e8a548') +
        E(32, 38, 23, 9, '#f2c879') +
        L('M14 36 Q32 30 50 36 M16 41 Q32 36 48 41 M26 32 Q30 38 26 44 M38 32 Q34 38 38 44', 1.2, '#c98b2a') +
        P('M22 22 L26 14 L30 20 L32 12 L34 20 L38 14 L42 22Z', '#ffd23f', 1.8) +
        FC(32, 17, 1.4, '#e8364b'),
    espelettePowder: jar('#c8263a', '#8b5a2b', sub('espelette', 22, 33, 20)),
    quincePaste:
        woodBoard() +
        [10, 24, 38]
            .map((x, k) => R(x, 30 - (k % 2) * 2, 14, 12, 2, '#d8823a') + F(`M${x + 2} ${32 - (k % 2) * 2} L${x + 12} ${32 - (k % 2) * 2}`, '#fff', 0.3))
            .join('') +
        sugarDust([
            [13, 32],
            [18, 36],
            [27, 31],
            [33, 34],
            [41, 32],
            [47, 36],
        ]) +
        quinceFruit(52, 30, 0.5),
    espeletteHam:
        woodBoard() +
        P('M8 40 Q6 24 22 18 Q40 14 50 26 Q54 32 50 40Z', '#c8504a') +
        P('M8 40 Q6 24 22 18', 'none', 0) +
        E(29, 40, 21, 5, '#f6c8c0') +
        L('M18 26 Q30 22 44 28', 1.2, '#a8303a') +
        [16, 26, 36, 46].map((x, k) => FC(x, 28 + (k % 2) * 4, 1.2, '#7a1a1a')).join('') +
        chili(54, 24, 0.55, -30),
    hazelnutSpread: jar('#6b3d1e', '#e8364b', sub('hazelnut', 22, 33, 20)),
    praline:
        plate(46) +
        [18, 28, 38, 46, 24, 34, 42].map((x, k) => (k % 2 ? hazel(x, k < 4 ? 40 : 34, 0.42) : almondNut(x, k < 4 ? 40 : 34, 0.38, 20))).join('') +
        P('M10 44 Q20 36 30 42 Q40 34 54 42', 'none', 2.2) +
        L('M10 44 Q20 36 30 42 Q40 34 54 42', 1.2, '#f2b04a'),
    chocAlmonds:
        bowl('#6b3d1e', 32, '#c8453a') +
        [16, 24, 32, 40, 48, 20, 28, 36, 44].map((x, k) => E(x, k < 5 ? 30 : 26, 4, 2.6, k % 3 ? '#5e3a1e' : '#7a4a2a', 15 * (k % 2 ? 1 : -1), 1)).join(''),
    hazelnutOil: oil('#e8c060', 'hazelnut'),
    smokedQuailEggs:
        woodBoard() +
        [14, 24, 34, 44, 52].map((x, k) => qEgg(x, 38 - (k % 2) * 3, 0.9, (k - 2) * 8).replace(/#f2e6c8/g, '#d8a868')).join('') +
        L('M20 14 Q16 8 20 2 M34 12 Q30 6 34 0', 1.4, '#c8c8c8'),
    galetteComplete: galette(
        E(32, 40, 10, 5, '#f6c8c0', 0, 1.2) +
            C(32, 40, 5, '#fffaf0', 1.4) +
            C(32, 40, 2.6, '#ffc83a', 1) +
            FC(26, 38, 1.2, '#ffe080') +
            FC(38, 42, 1.2, '#ffe080'),
    ),
    spinachGalette: galette(spinLeaf(26, 44, 0.32, -40) + spinLeaf(36, 44, 0.32, 40) + E(32, 40, 6, 3, '#f6e8a0', 0, 1)),
    quailGalette: galette(spinLeaf(32, 46, 0.3, 0) + [26, 32, 38].map(x => C(x, 39, 3, '#fffaf0', 1.2) + FC(x, 39, 1.5, '#ffb83a')).join('')),
    lemonCrepe: crepe(
        '',
        lemonHalf(48, 34, 5) +
            sugarDust([
                [22, 44],
                [28, 46],
                [34, 45],
                [40, 46],
                [30, 42],
            ]),
    ),
    raspberryCrepe: crepe('', rasp(24, 42, 0.5) + rasp(32, 44, 0.5) + rasp(40, 42, 0.5) + L('M20 46 Q32 50 44 46', 2, '#d8264a')),
    spreadCrepe: crepe('', L('M18 44 Q32 49 46 44', 3, '#6b3d1e') + hazel(48, 34, 0.4)),
    calvadosCrepe:
        crepe('', '') +
        P('M22 40 Q20 30 26 26 Q26 32 30 30 Q30 22 36 18 Q36 26 40 28 Q44 26 42 20 Q48 28 44 40Z', '#ffb83a', 1.6) +
        F('M28 40 Q28 34 32 32 Q34 36 36 34 Q38 36 38 40Z', '#ffe080'),
});

// ======================= la crêperie =======================
const MACH = () => ({
    // la crêperie : une billig fumante sous un store bleu et blanc, crêpes empilées
    crepery:
        SHADOW(32, 60, 28, 3) +
        R(6, 32, 52, 26, 3, '#a8693a') +
        L('M6 42 L58 42', 1.4, '#8b5a2b') +
        P('M4 14 L60 14 L58 24 L6 24Z', '#fff') +
        [4, 18, 32, 46].map(x => F(`M${x + 1} 14 L${x + 8} 14 L${x + 8} 24 L${x + 2} 24Z`, '#3f6fb5')).join('') +
        P('M4 14 L60 14 L58 24 L6 24Z', 'none', 2) +
        E(22, 32, 13, 4, '#3a3a40') +
        E(22, 31, 11, 3, '#f2c879', 0, 1.4) +
        L('M18 26 Q16 22 18 18 M26 26 Q24 22 26 18', 1.2, '#fff') +
        [0, 3, 6].map(d => E(46, 34 - d, 9, 2.6, d === 6 ? '#f6d48c' : '#e8a548', 0, 1.4)).join('') +
        R(12, 46, 16, 8, 2, '#f2e6d0', 1.4) +
        L('M15 50 L25 50', 1.2, '#3f6fb5') +
        sub('buckwheat', 38, 42, 14),
});

// ======================= l'enregistrement =======================
Object.assign(items, RAW);
let rec = null;
Object.keys(RECIPES_ART()).forEach(k => (items[k] = () => (rec = rec || RECIPES_ART())[k]));
let mach = null;
Object.keys(MACH()).forEach(k => (machines[k] = () => (mach = mach || MACH())[k]));
