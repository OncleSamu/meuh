// 1.6.1 : sept produits redessinés pour qu'on les reconnaisse au premier coup d'œil
// (fèves de cacao, houblon, riz, soja, sarrasin, café vert, noisette).
import { C, E, F, FC, G, GD, GL, HL, L, P, SHADOW, leaf, mound, stem, items, readyExtra } from './kit.js';

// ---------------- la cabosse de cacao, ouverte sur ses fèves ----------------
const pod = (x, y, s, rot, open) => {
    let o = `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">`;
    // la cabosse : longue, côtelée, du jaune à l'orange
    o += P('M0 -22 Q13 -18 14 0 Q13 18 0 22 Q-13 18 -14 0 Q-13 -18 0 -22Z', '#f2a23a', 2.4);
    o += F('M4 -20 Q12 -14 12 0 Q11 14 4 20 Q8 0 4 -20Z', '#e07a2a', 0.8);
    o += L('M0 -22 Q-5 0 0 22 M-7 -18 Q-12 0 -7 18 M7 -18 Q12 0 7 18', 1.2, 'rgba(58,38,24,.35)');
    o += HL(-6, -8, 2.4, 7, 10, 0.5);
    o += P('M-2 -22 L0 -27 L2 -22Z', '#7a4a2a', 1.6);
    if (open)
        // une moitié ouverte : la pulpe blanche et les fèves
        o +=
            P('M0 -16 Q9 -12 9 0 Q9 12 0 16 Q-9 12 -9 0 Q-9 -12 0 -16Z', '#fbf3e4', 2) +
            [
                [-3.4, -9],
                [3.4, -6],
                [-3.4, -1],
                [3.4, 3],
                [-3.4, 7],
                [3.4, 11],
            ]
                .map(([a, b]) => E(a, b, 3, 2.2, '#7a3a2a', 0, 1.2) + FC(a - 1, b - 0.8, 0.6, '#fff', 0.5))
                .join('');
    return o + '</g>';
};
const bean = (x, y, rot) =>
    E(x, y, 4, 2.8, '#6b2f22', rot, 1.8) + L(`M${x - 2.6} ${y} L${x + 2.6} ${y}`, 0.9, '#a8604a') + FC(x - 1.4, y - 1, 0.7, '#fff', 0.45);

// ---------------- le cône de houblon : des écailles vert tendre en rangs serrés ----------------
const cone = (x, y, s = 1, rot = 0) => {
    let o = `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` + L('M0 -16 L0 -20', 1.6, '#5f8a3e');
    // du bas vers le haut, chaque rang recouvre le précédent
    const rows = [
        [9, [0]],
        [5, [-3.4, 3.4]],
        [1, [-4.6, 0, 4.6]],
        [-3, [-4.4, 0, 4.4]],
        [-7, [-3.6, 3.6]],
        [-11, [0]],
    ];
    for (const [yy, xs] of rows)
        for (const xx of xs)
            o += P(`M${xx - 3.6} ${yy - 2} Q${xx} ${yy + 6} ${xx + 3.6} ${yy - 2} Q${xx} ${yy - 4} ${xx - 3.6} ${yy - 2}Z`, xx ? '#b8e07a' : '#c8ea8e', 1.3);
    return o + HL(-2.6, -4, 1.2, 4, 0, 0.5) + '</g>';
};
const hopLeaf = (x, y, s, rot) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M0 0 L-6 -4 L-12 -2 L-10 -8 L-13 -14 L-6 -13 L-3 -20 L0 -16 L3 -20 L6 -13 L13 -14 L10 -8 L12 -2 L6 -4Z', '#5fa040', 2) +
    L('M0 -1 L0 -15 M0 -7 L-8 -10 M0 -7 L8 -10', 1, 'rgba(255,255,255,.45)') +
    `</g>`;

// ---------------- le riz : un sac de grains blancs et une panicule dorée ----------------
const grain = (x, y, rot, c = '#fffaf0') => E(x, y, 2.2, 1.2, c, rot, 0.9);
const panicle = (x, y, rot) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})">` +
    L('M0 0 Q2 -14 8 -24 Q14 -30 18 -26', 1.8, '#c9a040') +
    [
        [4, -12, -60],
        [6, -17, -50],
        [9, -22, -40],
        [13, -26, -10],
        [17, -25, 20],
        [17, -21, 40],
        [7, -14, 30],
        [10, -19, 20],
    ]
        .map(([a, b, r]) => E(a, b, 2.4, 1.4, '#e8c86a', r, 1))
        .join('') +
    `</g>`;

// ---------------- la gousse de soja, velue, ouverte sur trois fèves ----------------
const soyPod = (x, y, s, rot, open) => {
    let o = `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">`;
    o += P('M-16 -2 Q-16 -9 -9 -8 Q-5 -11 0 -8 Q5 -11 9 -8 Q16 -9 16 -2 Q16 6 9 6 Q5 9 0 6 Q-5 9 -9 6 Q-16 6 -16 -2Z', '#a8b85a', 2.2);
    // le duvet
    o += L('M-14 -8 L-15 -11 M-6 -10 L-6 -13 M2 -10 L3 -13 M10 -9 L12 -12 M-12 6 L-13 9 M4 8 L4 11 M12 5 L14 8', 0.9, '#8a7a4a');
    if (open)
        o +=
            P('M-12 -2 Q-12 -5 -8 -5 L8 -5 Q12 -5 12 -2 Q12 2 8 2 L-8 2 Q-12 2 -12 -2Z', '#7a8a3a', 1.4) +
            [-6.5, 0, 6.5].map(xx => C(xx, -1.5, 3, '#f2d27a', 1.3) + FC(xx - 1, -2.6, 0.8, '#fff', 0.6)).join('');
    else o += L('M-12 -1 L12 -1', 1, 'rgba(58,38,24,.3)') + HL(-6, -4, 4, 1, 0, 0.4);
    return o + L('M-16 -2 L-20 -4', 1.6, '#7a8a3a') + '</g>';
};

// ---------------- le sarrasin : grappes de petites fleurs, et ses grains à trois faces ----------------
const bwGrain = (x, y, s = 1, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M0 -4.4 L3.8 2.6 L-3.8 2.6Z', '#7a4a2a', 1.4) +
    F('M0 -4.4 L3.8 2.6 L0 1Z', '#a8693a') +
    P('M0 -4.4 L3.8 2.6 L-3.8 2.6Z', 'none', 1.4) +
    `</g>`;
const bwFlowers = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    [
        [0, 0],
        [-4, 2],
        [4, 2],
        [-2, -4],
        [2, -4],
        [0, 4],
        [-5, -2],
        [5, -2],
    ]
        .map(([a, b], k) => C(a, b, 2.4, k % 3 ? '#fff6f4' : '#f6c8d0', 1) + FC(a, b, 0.7, '#e8a0b0'))
        .join('') +
    `</g>`;

// ---------------- les cerises de café sur leur branche ----------------
const cherry = (x, y, r, c) =>
    C(x, y, r, c, 1.6) + FC(x - r * 0.35, y - r * 0.35, r * 0.28, '#fff', 0.7) + FC(x + r * 0.3, y + r * 0.45, r * 0.18, 'rgba(58,38,24,.4)');

// ---------------- la noisette dans sa collerette verte ----------------
const nut = (x, y, s, rot, husk) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M0 -12 Q10 -11 11 1 Q11 12 0 12 Q-11 12 -11 1 Q-10 -11 0 -12Z', '#b8763a', 2.2) +
    F('M-11 1 Q-10 -6 -4 -9 Q-7 -2 -6 8 Q-10 6 -11 1Z', '#d8a060', 0.7) +
    E(0, -10, 6, 2.6, '#e8c38c', 0, 1.4) +
    L('M-4 2 Q-3 6 -4 9 M3 3 Q4 6 3 9', 1, 'rgba(58,38,24,.35)') +
    HL(-5, -2, 1.6, 4, 20, 0.6) +
    (husk
        ? P('M-12 -8 Q-14 -16 -8 -14 Q-6 -20 -1 -16 Q2 -21 5 -15 Q11 -18 10 -11 Q15 -10 12 -5 Q6 -9 0 -8 Q-6 -9 -12 -8Z', '#7ab84a', 2) +
          L('M-8 -11 L-5 -13 M0 -12 L1 -15 M6 -11 L8 -13', 1, 'rgba(255,255,255,.45)')
        : '') +
    `</g>`;

Object.assign(items, {
    cacao: () => SHADOW(32, 58, 22, 3) + pod(24, 34, 1, -22, false) + pod(40, 36, 1, 18, true) + bean(14, 54, -15) + bean(52, 55, 10),
    hop: () =>
        SHADOW(32, 58, 18, 3) +
        L('M14 10 Q30 6 48 14', 2, '#5f8a3e') +
        hopLeaf(44, 22, 0.9, 40) +
        cone(20, 36, 1.15, -12) +
        cone(36, 40, 1.25, 8) +
        cone(28, 24, 0.95, -4),
    rice: () =>
        SHADOW(32, 58, 22, 3) +
        P('M14 30 Q10 46 14 56 L50 56 Q54 46 50 30Z', '#d8c08a') +
        L('M18 38 Q16 48 18 54 M46 38 Q48 48 46 54', 1.2, 'rgba(58,38,24,.25)') +
        P('M12 30 Q32 22 52 30 Q32 38 12 30Z', '#f6f0e0') +
        [16, 21, 26, 31, 36, 41, 46, 19, 24, 29, 34, 39, 44, 27, 32, 37].map((x, k) => grain(x, k < 7 ? 30 : k < 13 ? 28 : 26, ((k * 37) % 60) - 30)).join('') +
        L('M14 33 Q32 39 50 33', 2.4, '#8b5a2b') +
        panicle(42, 32, -8) +
        grain(10, 57, 20) +
        grain(56, 56, -15),
    soy: () =>
        SHADOW(32, 58, 22, 3) + soyPod(22, 30, 1, -25, false) + soyPod(34, 44, 1.15, 5, true) + C(52, 54, 3.2, '#f2d27a', 1.3) + C(12, 54, 3, '#f2d27a', 1.3),
    buckwheat: () =>
        SHADOW(32, 58, 22, 3) +
        stem('M22 50 Q20 34 24 20', '#b8483a', 1.4) +
        stem('M34 50 Q36 32 32 14', '#b8483a', 1.4) +
        leaf(22, 40, 10, -150, G, 0.55) +
        leaf(34, 34, 10, -30, GL, 0.55) +
        bwFlowers(24, 18, 0.9) +
        bwFlowers(32, 12, 0.95) +
        // le tas de grains au pied
        [
            [26, 54, 0],
            [33, 55, 20],
            [40, 54, -15],
            [47, 55, 10],
            [30, 50, 35],
            [37, 50, -10],
            [44, 50, 25],
            [41, 46, 5],
        ]
            .map(([x, y, r]) => bwGrain(x, y, 0.95, r))
            .join(''),
    greenCoffee: () =>
        SHADOW(32, 58, 22, 3) +
        L('M8 30 Q30 26 56 34', 3, '#7a4a2a') +
        L('M8 30 Q30 26 56 34', 1.4, '#a8693a') +
        leaf(16, 29, 14, -110, GD, 0.42) +
        leaf(46, 32, 15, -70, G, 0.42) +
        leaf(30, 28, 13, 80, G, 0.42) +
        cherry(24, 38, 5.4, '#d8303a') +
        cherry(32, 41, 5.6, '#c8303a') +
        cherry(28, 47, 5.2, '#e04a3a') +
        cherry(38, 46, 5, '#8fbf3a') +
        cherry(20, 46, 4.6, '#e8603a'),
    hazelnut: () => SHADOW(32, 58, 22, 3) + nut(22, 42, 1.05, -14, true) + nut(42, 40, 1.05, 14, true) + nut(32, 50, 0.85, 0, false),
});

// le houblon prêt au champ : la liane sur son tuteur, couverte de cônes
readyExtra.hop = () =>
    mound() +
    L('M24 58 L24 4 M40 58 L40 4 M22 6 L42 6', 2.4, '#a8793a') +
    L('M24 56 Q30 44 24 34 Q18 24 24 14 M40 56 Q34 44 40 34 Q46 24 40 14', 2, GD) +
    hopLeaf(22, 46, 0.55, -50) +
    hopLeaf(42, 30, 0.55, 50) +
    cone(28, 40, 0.55, 10) +
    cone(36, 24, 0.55, -10) +
    cone(22, 22, 0.5, 5) +
    cone(42, 46, 0.5, -5);
export { pod as cacaoPod, cone as hopCone };
