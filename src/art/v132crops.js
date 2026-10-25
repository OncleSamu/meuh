// 1.32 : huit cultures de l'île. Chacune a trois dessins : la récolte (items), la jeune pousse (youngExtra) et la plante mûre (readyExtra).
import { C, E, F, FC, FE, G, GD, GL, L, P, SHADOW, leaf, mound, stem, items, youngExtra, readyExtra } from './kit.js';

const PLANTS = {};
const add = (id, icon, young, ready) => (PLANTS[id] = { icon, young, ready });

// ---------- le taro : tubercule brun, anneaux, grande feuille en cœur ----------
const taroCorm = (x, y, s = 1, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M-12 2 Q-12 -10 0 -12 Q12 -10 12 2 Q12 12 0 13 Q-12 12 -12 2Z', '#8a6a4a', 2.2) +
    L('M-10 -2 Q0 1 10 -2 M-11 5 Q0 8 11 5', 1.2, '#5e4630') +
    FE(-4, -6, 3.4, 1.6, '#c8a47a', 0.7, -15) +
    `</g>`;
const taroLeaf = (x, y, s = 1, rot = 0, c = '#3f9a4a') =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    L('M0 0 L0 12', 2.4, '#6b8a3a') +
    P('M0 0 Q-16 -2 -15 -16 Q-12 -26 0 -28 Q12 -26 15 -16 Q16 -2 0 0Z', c, 2.2) +
    L('M0 -2 L0 -24 M0 -8 L-8 -14 M0 -8 L8 -14 M0 -16 L-5 -21 M0 -16 L5 -21', 1, 'rgba(255,255,255,.45)') +
    `</g>`;
add(
    'taro',
    () => SHADOW(32, 58, 22, 3) + taroCorm(22, 44, 1.1, -10) + taroCorm(42, 46, 1, 12) + taroCorm(32, 36, 1.15, 0) + taroLeaf(32, 24, 0.4, 0),
    () => mound() + taroLeaf(32, 58, 0.45, 0),
    () => mound() + taroLeaf(20, 58, 0.8, -25, '#4aa854') + taroLeaf(44, 58, 0.8, 25) + taroLeaf(32, 58, 1, 0, '#3f9a4a') + taroCorm(32, 56, 0.38, 0),
);

// ---------- le curcuma : rhizome orange vif, feuilles longues ----------
const rhizome = (x, y, s = 1, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M-14 4 Q-14 -4 -6 -4 L8 -6 Q16 -6 16 2 Q16 8 8 8 L-6 10 Q-14 10 -14 4Z', '#e8903a', 2.2) +
    P('M2 -5 Q4 -12 10 -12 Q12 -6 8 -5Z', '#e8903a', 2) +
    L('M-8 -3 L-8 9 M-1 -4 L-1 9 M6 -5 L6 8', 1, '#b86a1a') +
    FE(-6, 0, 3, 1.2, '#fff', 0.5) +
    `</g>`;
add(
    'turmeric',
    () =>
        SHADOW(32, 58, 22, 3) +
        rhizome(24, 48, 1.15, -10) +
        rhizome(40, 40, 1.1, 20) +
        rhizome(30, 32, 1, -30) +
        FC(14, 56, 2, '#e8a030', 0.6) +
        FC(52, 54, 1.6, '#e8a030', 0.6),
    () => mound() + leaf(32, 56, 22, -105, G, 0.2) + leaf(32, 56, 22, -75, GL, 0.2) + leaf(32, 56, 20, -125, G, 0.2),
    () =>
        mound() +
        leaf(32, 56, 34, -110, G, 0.2) +
        leaf(32, 56, 34, -70, GL, 0.2) +
        leaf(32, 56, 30, -130, G, 0.2) +
        leaf(32, 56, 30, -50, GL, 0.2) +
        leaf(32, 56, 36, -90, G, 0.18) +
        P('M30 26 L28 18 L32 12 L36 18 L34 26Z', '#f6f0d0', 1.8) +
        FC(32, 17, 2, '#f08a9a'),
);

// ---------- l'arachide : cosses beiges bosselées, graines rose-brun ----------
const peanutShell = (x, y, s = 1, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M-14 0 Q-14 -7 -6 -7 Q-2 -7 -1 -3 Q2 -7 7 -7 Q14 -7 14 0 Q14 7 7 7 Q2 7 -1 3 Q-2 7 -6 7 Q-14 7 -14 0Z', '#e6c88a', 2.2) +
    [
        [-8, -1],
        [-5, 2],
        [8, -1],
        [5, 2],
        [10, 3],
        [-10, 3],
    ]
        .map(([a, b]) => FC(a, b, 0.7, '#a8884a', 0.8))
        .join('') +
    FE(-8, -4, 3, 1, '#fff', 0.6) +
    `</g>`;
add(
    'peanut',
    () =>
        SHADOW(32, 58, 22, 3) +
        peanutShell(22, 44, 1.2, -20) +
        peanutShell(42, 44, 1.2, 15) +
        peanutShell(32, 32, 1.25, 0) +
        C(16, 56, 3, '#c8805a', 1.4) +
        C(50, 55, 3, '#c8805a', 1.4),
    () =>
        mound() +
        stem('M32 56 L32 40', G, 1.6) +
        leaf(32, 46, 10, -150, GL, 0.5) +
        leaf(32, 46, 10, -30, G, 0.5) +
        leaf(32, 40, 9, -110, GL, 0.5) +
        leaf(32, 40, 9, -70, G, 0.5),
    () =>
        mound() +
        stem('M32 56 L32 34', G, 2) +
        [
            [22, 44, -150],
            [42, 44, -30],
            [24, 34, -140],
            [40, 34, -40],
            [32, 26, -90],
        ]
            .map(([x, y, a], k) => leaf(x, y, 12, a, k % 2 ? G : GL, 0.5))
            .join('') +
        L('M32 56 Q22 60 14 58 M32 56 Q42 60 50 58', 1.4, '#8a6a3a') +
        peanutShell(16, 59, 0.38, 0) +
        peanutShell(48, 59, 0.38, 0) +
        FC(32, 22, 2.4, '#ffd23f') +
        FC(22, 32, 1.8, '#ffd23f'),
);

// ---------- le haricot rouge : cosse verte et rouge, grains rouge sombre ----------
const redPod = (x, y, rot = 0, s = 1) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M-18 0 Q-18 -6 -8 -6 L10 -6 Q20 -6 20 1 Q20 6 10 6 L-8 6 Q-18 6 -18 0Z', '#a8c460', 2) +
    F('M-4 -5 L16 -5 Q19 -2 18 1 L2 5Z', '#c8454a', 0.55) +
    L('M-14 -3 L14 -3', 1, 'rgba(255,255,255,.45)') +
    `</g>`;
const redBeanSeed = (x, y, s = 1, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">${E(0, 0, 5, 3.4, '#8a1f2e', 0, 1.6)}${FE(-1.4, -1, 1.8, 0.9, '#e88a8a', 0.8)}${FC(3, 0.6, 0.7, '#fff6e0')}</g>`;
add(
    'redBean',
    () =>
        SHADOW(32, 58, 22, 3) +
        redPod(30, 30, -20, 1.1) +
        redBeanSeed(18, 48, 1.4, -10) +
        redBeanSeed(30, 52, 1.4, 20) +
        redBeanSeed(43, 47, 1.4, -25) +
        redBeanSeed(36, 41, 1.3, 10) +
        redBeanSeed(24, 40, 1.3, -30),
    () =>
        mound() +
        stem('M30 56 L28 34', G, 1.6) +
        stem('M36 56 L38 38', G, 1.6) +
        leaf(28, 42, 9, -150, GL, 0.5) +
        leaf(38, 44, 9, -30, G, 0.5) +
        leaf(28, 34, 8, -100, G, 0.5),
    () =>
        mound() +
        L('M22 56 L22 10 M42 56 L42 10', 2.2, '#a8793a') +
        L('M24 56 Q18 40 26 30 Q32 22 24 12 M40 56 Q46 40 38 30', 1.8, GD) +
        leaf(24, 42, 11, -150, G, 0.5) +
        leaf(40, 36, 11, -30, GL, 0.5) +
        leaf(28, 24, 10, -110, G, 0.5) +
        redPod(30, 40, 90, 0.45) +
        redPod(36, 46, 85, 0.42) +
        redPod(46, 30, 95, 0.4),
);

// ---------- le piment des îles : petits piments rouges et orange dressés ----------
const chiliSmall = (x, y, s = 1, rot = 0, c = '#d8302a') =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M-3 -8 Q-5 4 0 12 Q5 4 3 -8 Q0 -10 -3 -8Z', c, 1.8) +
    P('M-3 -8 Q0 -13 3 -8 Q0 -7 -3 -8Z', '#5fa040', 1.4) +
    FE(-1.4, -2, 0.9, 4, '#fff', 0.55) +
    `</g>`;
add(
    'islandChili',
    () =>
        SHADOW(32, 58, 22, 3) +
        chiliSmall(20, 38, 1.5, -25) +
        chiliSmall(32, 36, 1.6, 0, '#f08a1c') +
        chiliSmall(44, 38, 1.5, 25) +
        chiliSmall(26, 48, 1.3, -10, '#f2c23a') +
        chiliSmall(38, 49, 1.3, 15),
    () => mound() + stem('M32 56 L32 38', G, 1.8) + leaf(32, 46, 10, -150, GL, 0.5) + leaf(32, 46, 10, -30, G, 0.5) + leaf(32, 40, 9, -90, GL, 0.5),
    () =>
        mound() +
        stem('M32 56 L32 12', '#7aa04a', 2.2) +
        leaf(32, 46, 12, -150, G, 0.5) +
        leaf(32, 42, 12, -30, GL, 0.5) +
        leaf(32, 30, 11, -145, GL, 0.5) +
        leaf(32, 26, 11, -35, G, 0.5) +
        chiliSmall(22, 40, 0.8, -20) +
        chiliSmall(42, 38, 0.8, 20, '#f08a1c') +
        chiliSmall(24, 26, 0.7, -15, '#f2c23a') +
        chiliSmall(40, 22, 0.7, 15),
);

// ---------- l'aloe vera : rosette de feuilles charnues dentelées ----------
const aloeLeaf = (x, y, s, rot, c = '#5fb87a') =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M0 0 Q-7 -10 -5 -26 Q-2 -34 0 -38 Q2 -34 5 -26 Q7 -10 0 0Z', c, 2) +
    [-6, -13, -20, -27]
        .map(h =>
            L(
                `M-${3 + (h > -20 ? 2 : 0)} ${h} L-${6 + (h > -20 ? 2 : 0)} ${h - 1} M${3 + (h > -20 ? 2 : 0)} ${h} L${6 + (h > -20 ? 2 : 0)} ${h - 1}`,
                0.9,
                '#f6f0d0',
            ),
        )
        .join('') +
    FE(-1.5, -16, 0.9, 8, '#fff', 0.35) +
    `</g>`;
add(
    'aloe',
    () =>
        SHADOW(32, 58, 22, 3) +
        aloeLeaf(32, 54, 0.9, -50) +
        aloeLeaf(32, 54, 0.9, 50) +
        aloeLeaf(32, 54, 1, -25, '#6cc88a') +
        aloeLeaf(32, 54, 1, 25, '#6cc88a') +
        aloeLeaf(32, 54, 1.05, 0, '#5fb87a'),
    () => mound() + aloeLeaf(32, 56, 0.45, -40) + aloeLeaf(32, 56, 0.45, 40) + aloeLeaf(32, 56, 0.5, 0, '#6cc88a'),
    () =>
        mound() +
        aloeLeaf(32, 56, 0.85, -62) +
        aloeLeaf(32, 56, 0.85, 62) +
        aloeLeaf(32, 56, 0.95, -35, '#6cc88a') +
        aloeLeaf(32, 56, 0.95, 35, '#6cc88a') +
        aloeLeaf(32, 56, 1, 0, '#5fb87a') +
        L('M32 30 L32 8', 1.8, '#c8603a') +
        [
            [32, 8],
            [29, 12],
            [35, 13],
            [30, 17],
            [34, 18],
        ]
            .map(([a, b]) => FC(a, b, 2, '#f06a3a'))
            .join(''),
);

// ---------- l'hibiscus : grande fleur rouge, pistil jaune ----------
const hibFlower = (x, y, s = 1, rot = 0, c = '#d8203f') =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    [0, 72, 144, 216, 288].map(a => `<g transform="rotate(${a})">${P('M0 0 Q-10 -6 -9 -15 Q0 -20 9 -15 Q10 -6 0 0Z', c, 1.8)}</g>`).join('') +
    FC(0, 0, 3, '#8a1030') +
    L('M0 0 L2 -12', 1.6, '#f2c23a') +
    [
        [2, -13],
        [0, -11],
        [4, -11],
    ]
        .map(([a, b]) => FC(a, b, 1.2, '#ffd23f'))
        .join('') +
    `</g>`;
add(
    'hibiscus',
    () =>
        SHADOW(32, 58, 22, 3) +
        leaf(32, 54, 18, -150, G, 0.4) +
        leaf(32, 54, 18, -30, GL, 0.4) +
        hibFlower(24, 38, 1, -15) +
        hibFlower(42, 42, 0.9, 20, '#e8405a') +
        hibFlower(32, 26, 0.85, 0),
    () => mound() + stem('M32 56 L32 34', '#8a5a3a', 1.8) + leaf(32, 46, 10, -150, G, 0.5) + leaf(32, 46, 10, -30, GL, 0.5) + leaf(32, 38, 9, -90, G, 0.5),
    () =>
        mound() +
        stem('M32 56 L32 14', '#8a5a3a', 2.4) +
        leaf(32, 48, 12, -150, G, 0.5) +
        leaf(32, 44, 12, -30, GL, 0.5) +
        leaf(32, 32, 11, -145, GL, 0.5) +
        leaf(32, 28, 11, -35, G, 0.5) +
        hibFlower(22, 30, 0.6, -15) +
        hibFlower(42, 24, 0.55, 20, '#e8405a') +
        hibFlower(32, 14, 0.5, 0),
);

// ---------- le patchouli : feuilles veloutées et dentelées, épi violet ----------
const patchLeaf = (x, y, s, rot, c = '#6a9a3a') =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M0 0 Q-10 -4 -9 -14 L-12 -16 L-6 -20 L-5 -26 L0 -22 L5 -26 L6 -20 L12 -16 L9 -14 Q10 -4 0 0Z', c, 1.8) +
    L('M0 -2 L0 -22 M0 -9 L-6 -14 M0 -9 L6 -14', 1, 'rgba(255,255,255,.45)') +
    `</g>`;
add(
    'patchouli',
    () =>
        SHADOW(32, 58, 22, 3) +
        patchLeaf(18, 54, 1.1, -50) +
        patchLeaf(46, 54, 1.1, 50) +
        patchLeaf(24, 54, 1.2, -20, '#7aaa4a') +
        patchLeaf(40, 54, 1.2, 20, '#7aaa4a') +
        patchLeaf(32, 54, 1.25, 0),
    () => mound() + patchLeaf(32, 56, 0.55, -40) + patchLeaf(32, 56, 0.55, 40) + patchLeaf(32, 56, 0.6, 0, '#7aaa4a'),
    () =>
        mound() +
        stem('M32 56 L32 12', '#7a8a4a', 2.2) +
        patchLeaf(32, 54, 0.8, -60) +
        patchLeaf(32, 54, 0.8, 60) +
        patchLeaf(32, 40, 0.7, -50, '#7aaa4a') +
        patchLeaf(32, 40, 0.7, 50, '#7aaa4a') +
        patchLeaf(32, 28, 0.55, -40) +
        patchLeaf(32, 28, 0.55, 40) +
        [
            [32, 8],
            [30, 12],
            [34, 12],
            [31, 16],
            [33, 16],
        ]
            .map(([a, b]) => FC(a, b, 2.2, '#b898d8'))
            .join(''),
);

Object.entries(PLANTS).forEach(([id, p]) => {
    items[id] = p.icon;
    youngExtra[id] = p.young;
    readyExtra[id] = p.ready;
});
export const NEW_CROPS_132 = Object.keys(PLANTS);
