// 1.152 : Dessins du Capybara (80×80), des 7 plantes (jeune & mûr), des 2 arbres (fruits sur l'arbre) et des 45 objets/recettes.
import {
    C,
    E,
    F,
    FC,
    FE,
    G,
    GD,
    GL,
    HL,
    L,
    O,
    P,
    R,
    SHADOW,
    animals,
    board,
    bowlB,
    items,
    leaf,
    mound,
    plateB,
    readyExtra,
    st,
    stem,
    youngExtra,
} from './kit.js';
import { leg } from './animals.js';
import { FRUIT_COL, fruitExtra } from './plants.js';

const jar = (fill, lid, emblem = '') =>
    SHADOW(32, 59, 17, 2.5) +
    R(15, 22, 34, 34, 9, fill) +
    HL(21, 34, 2.8, 9, 0, 0.45) +
    R(17, 15, 30, 8, 3, lid) +
    R(20, 11, 24, 5, 2, lid, 2) +
    R(19, 31, 26, 17, 4, '#fffaf0', 1.6) +
    emblem;
const bottle = (glass, liq, cork, label = '') =>
    SHADOW(32, 59, 15, 2.5) +
    P('M26 12 L38 12 L38 22 L46 31 L46 53 Q46 57 42 57 L22 57 Q18 57 18 53 L18 31 L26 22Z', glass) +
    P('M20 34 L44 34 L44 53 Q44 55 41 55 L23 55 Q20 55 20 53Z', liq, 0) +
    P('M26 12 L38 12 L38 22 L46 31 L46 53 Q46 57 42 57 L22 57 Q18 57 18 53 L18 31 L26 22Z', 'none') +
    R(27, 6, 10, 7, 2, cork, 2) +
    R(22, 36, 20, 13, 3, '#fffaf0', 1.6) +
    HL(23, 30, 2.2, 8, 12, 0.5) +
    label;
const teacup = (tea, garnish = '') =>
    SHADOW(32, 56, 22, 3) +
    E(32, 52, 23, 6, '#fffaf0') +
    P('M46 32 Q58 32 56 42 Q54 47 45 45', 'none', 4.5) +
    P('M46 32 Q58 32 56 42 Q54 47 45 45', 'none', 2.2) +
    P('M14 28 L48 28 Q48 48 31 50 Q14 48 14 28Z', '#fffaf0') +
    E(31, 28, 17, 5, tea) +
    garnish +
    L('M24 19 Q22 14 25 10 M33 17 Q31 12 34 8 M40 19 Q38 14 41 10', 1.6, 'rgba(130,110,90,.45)');
const soap = (c, hi, emblem = '') =>
    SHADOW(32, 56, 23, 3.2) +
    R(10, 22, 44, 28, 10, c) +
    R(15, 27, 34, 18, 6, hi, 1.5) +
    HL(19, 27, 6, 2, -12, 0.55) +
    C(50, 16, 4.5, '#dff6ff', 1.6) +
    C(56, 24, 3, '#dff6ff', 1.4) +
    C(12, 18, 3.2, '#dff6ff', 1.4) +
    emblem;
const perfume = (liq, cap, emblem = '') =>
    SHADOW(32, 59, 17, 2.8) +
    R(25, 16, 14, 7, 2, '#f5d36b', 2) +
    R(23, 9, 18, 8, 3, cap, 2.2) +
    P('M15 30 Q15 22 32 22 Q49 22 49 30 L47 52 Q47 57 32 57 Q17 57 17 52Z', '#e8f4fa') +
    P('M18 35 L46 35 L45 51 Q45 55 32 55 Q19 55 19 51Z', liq, 0) +
    P('M15 30 Q15 22 32 22 Q49 22 49 30 L47 52 Q47 57 32 57 Q17 57 17 52Z', 'none') +
    R(22, 34, 20, 14, 3, '#fffaf0', 1.5) +
    HL(21, 31, 2.4, 7, 8, 0.55) +
    emblem;
const tart = (fill, top = '') =>
    SHADOW(32, 55, 25, 3) +
    E(32, 42, 26, 13, '#d9984a') +
    E(32, 39, 25, 11, '#f0be6a') +
    E(32, 38, 20, 8.5, fill, 0, 1.8) +
    top;

// ======================== 1. POTIMARRON ========================
const potimarronFruit = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    P('M0 -18 C-9 -18 -20 -6 -20 6 C-20 17 -10 20 0 19 C10 20 20 17 20 6 C20 -6 9 -18 0 -18Z', '#e85a24') +
    L('M0 -17 Q-9 0 -6 18 M0 -17 Q9 0 6 18 M0 -17 L0 19', 1.8, '#b83c12') +
    P('M-3 -17 Q-1 -26 5 -24 Q4 -20 3 -17Z', '#7c6240', 2) +
    HL(-8, -4, 4.5, 2.4, -35, 0.45) +
    `</g>`;

// ======================== 2. FENOUIL ========================
const fennelBulb = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    L('M-6 -12 L-14 -26 M-2 -14 L-4 -29 M2 -14 L6 -29 M6 -12 L14 -25', 2.4, '#54a83b') +
    L('M-14 -26 L-19 -22 M-14 -26 L-10 -30 M6 -29 L12 -32 M14 -25 L19 -20', 1.8, '#7ad156') +
    P('M-14 4 C-15 -10 -7 -16 0 -14 C7 -16 15 -10 14 4 C14 14 7 18 0 18 C-7 18 -14 14 -14 4Z', '#eef5dc') +
    P('M-9 16 C-11 4 -6 -8 0 -12 C6 -8 11 4 9 16', 'none', 1.6) +
    F('M-11 -6 Q-6 -14 0 -12 Q6 -14 11 -6 Q5 -2 0 -4 Q-5 -2 -11 -6Z', '#b5de82', 0.65) +
    HL(-5, 3, 2.5, 6, -10, 0.6) +
    `</g>`;

// ======================== 3. TOPINAMBOUR ========================
const topiTuber = (x, y, s = 1, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M-16 2 C-18 -7 -9 -11 -4 -8 C-1 -14 10 -13 13 -6 C19 -3 19 8 11 11 C6 15 -4 14 -8 10 C-14 12 -17 7 -16 2Z', '#c9976c') +
    F('M-11 6 Q0 12 11 7 Q6 13 -5 12Z', '#9a6842', 0.45) +
    L('M-7 -3 Q-4 2 -6 7 M3 -6 Q6 0 4 6', 1.4, '#8b5a34') +
    HL(-8, -3, 3.5, 1.8, -20, 0.45) +
    `</g>`;

// ======================== 4. THYM ========================
const thymeSprig = (x, y, rot = 0, s = 1) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    L('M0 18 Q-2 0 1 -18', 2.4, '#7a5a3a') +
    [
        [-4, 10],
        [4, 8],
        [-5, 2],
        [5, 0],
        [-4, -6],
        [4, -8],
        [-3, -13],
        [3, -14],
    ]
        .map(([lx, ly]) => E(lx, ly, 3.2, 2, lx < 0 ? '#5b8f48' : '#78b35e', lx < 0 ? -30 : 30, 1.5))
        .join('') +
    FC(1, -19, 2.2, '#d99be6') +
    FC(-2, -16, 1.6, '#e8b6f2') +
    FC(4, -16, 1.6, '#e8b6f2') +
    `</g>`;

// ======================== 5. CAMOMILLE ========================
const daisy = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    [0, 45, 90, 135, 180, 225, 270, 315]
        .map(a => `<ellipse cx="0" cy="-9" rx="3.4" ry="6.2" fill="#fffdf6" ${st(1.6)} transform="rotate(${a})"/>`)
        .join('') +
    C(0, 0, 5.8, '#f5c22c', 2) +
    HL(-1.6, -1.6, 1.6, 1.2, -20, 0.65) +
    `</g>`;

// ======================== 6. WASABI ========================
const wasabiRoot = (x, y, s = 1, rot = -20) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    leaf(0, -14, 14, -120, '#3f8f2e', 0.6) +
    leaf(0, -14, 15, -60, '#5bb544', 0.6) +
    P('M-7 -14 C-10 -4 -10 12 -5 20 C-2 23 2 23 5 20 C10 12 10 -4 7 -14Z', '#8fd156') +
    L('M-6 -6 Q0 -3 6 -6 M-7 2 Q0 5 7 2 M-6 10 Q0 13 6 10', 1.6, '#58962e') +
    HL(-3, -4, 2, 7, 0, 0.45) +
    `</g>`;

// ======================== 7. CITRONNELLE ========================
const lemonStalk = (x, y, rot = 0, s = 1) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M-4 18 Q-5 2 -2 -18 L2 -18 Q5 2 4 18 Q0 22 -4 18Z', '#d9e89c') +
    P('M-2 -18 L-10 -28 L-1 -16 M2 -18 L10 -26 L1 -16', '#5eb83d', 2) +
    L('M0 16 L0 -16', 1.3, '#8eb84a') +
    F('M-3.5 14 Q0 18 3.5 14 L3 18 Q0 21 -3 18Z', '#f6f0d8', 0.9) +
    `</g>`;

// ======================== 8. CANNELLE ========================
const cinStick = (x, y, rot = 0, s = 1) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    R(-16, -4.5, 32, 9, 4, '#a6532a', 2.2) +
    L('M-13 -1 L12 -1 M-12 2 L11 2', 1.3, '#6e3216') +
    C(13, 0, 4.2, '#7c3a1b', 2) +
    L('M13 -2 Q15 0 13 2 Q11 0 13 -1', 1.2, '#d48a5c') +
    HL(-6, -2.2, 5, 1.2, 0, 0.35) +
    `</g>`;

// ======================== 9. NOIX DE MUSCADE ========================
const nutmegSeed = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    E(0, 0, 13, 16, '#8f5932', 15) +
    L('M-6 -10 Q0 -4 -4 6 M2 -12 Q6 -2 2 10 M7 -6 Q9 2 5 8', 1.5, '#593318') +
    L('M-10 -6 Q-2 -2 -4 8 M6 -9 Q2 0 8 5 M-7 4 Q0 6 4 12', 2.4, '#d93829') +
    HL(-4, -6, 3, 2, -25, 0.4) +
    `</g>`;
const nutmegHalf = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    E(0, 0, 11, 13, '#7a4826', -20) +
    E(0, 0, 8.2, 10, '#e8cda8', -20, 1.5) +
    L('M-4 -4 Q0 0 4 -3 M-5 2 Q0 0 5 3 M-2 -7 Q0 0 2 7', 1.5, '#8f5932') +
    `</g>`;

// ======================== 10. CAPYBARA & SES PRODUITS ========================
const cressLeaf = (x, y, r = 5.5, c = '#4da83b') => C(x, y, r, c, 2) + HL(x - r * 0.3, y - r * 0.3, r * 0.3, r * 0.2, -20, 0.45);
const lilyFlower = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    E(0, 10, 22, 8.5, '#4da83b') +
    P('M2 10 L22 7 L19 13Z', '#4aa8c8', 0) +
    P('M-16 6 Q-12 -10 0 -14 Q12 -10 16 6 Q0 10 -16 6Z', '#f79bc0') +
    P('M-11 6 Q-7 -12 0 -18 Q7 -12 11 6 Q0 9 -11 6Z', '#ffc2dc') +
    P('M-5 5 Q-3 -8 0 -13 Q3 -8 5 5Z', '#fff0f7', 1.6) +
    C(0, 2, 4, '#ffd23f', 1.6) +
    `</g>`;

// Animal : Capybara (80×80)
animals.capybara = () =>
    SHADOW(40, 72, 27, 3.8) +
    leg('M20 56 L20 69', '#8a5d3b') +
    leg('M30 58 L30 70', '#8a5d3b') +
    leg('M48 58 L48 70', '#8a5d3b') +
    leg('M57 56 L57 69', '#8a5d3b') +
    P('M11 46 C10 29 24 25 42 26 C55 27 64 34 64 46 C64 59 52 63 36 62 C20 62 12 58 11 46Z', '#a8744a') +
    FE(36, 54, 18, 6, '#c79468', 0.6) +
    C(54, 22, 4.5, '#8a5d3b', 2.2) +
    FC(54, 22, 2, '#d99a8a') +
    C(64, 23, 4.2, '#8a5d3b', 2.2) +
    FC(64, 23, 1.8, '#d99a8a') +
    P('M49 26 C49 18 68 18 72 25 C75 30 75 40 71 43 C67 46 53 46 50 41 C48 37 49 30 49 26Z', '#b57e52') +
    FE(70, 35, 4.2, 5.5, '#6e4528', 0.7) +
    FC(71, 33, 1.2, O) +
    L('M66 40 Q69 42 72 40', 1.6, O) +
    L('M58 29 Q61 27 64 29', 2.2, O) +
    FC(61, 30, 1.6, O) +
    FE(62, 36, 3, 1.8, '#f08a7c', 0.4) +
    HL(28, 34, 8, 3, -10, 0.35);

// Stades de pousse des 7 nouvelles plantes
Object.assign(youngExtra, {
    potimarron: () =>
        mound() +
        stem('M32 56 Q26 44 18 42 M32 56 Q38 44 46 42') +
        leaf(18, 42, 14, -140, G, 0.55) +
        leaf(46, 42, 14, -40, GL, 0.55) +
        C(32, 37, 4.5, '#ffd23f', 1.8),
    fennel: () =>
        mound() +
        stem('M32 56 L32 34') +
        L('M32 42 L20 34 M32 42 L44 34 M32 35 L23 26 M32 35 L41 26', 2.2, '#54a83b') +
        E(32, 52, 7, 5, '#eef5dc', 0, 2),
    topinambour: () =>
        mound() +
        stem('M32 56 L32 22') +
        leaf(32, 44, 14, -145, G, 0.45) +
        leaf(32, 40, 14, -35, GL, 0.45) +
        leaf(32, 30, 12, -140, G, 0.45),
    thyme: () => mound() + thymeSprig(26, 44, -22, 0.65) + thymeSprig(38, 44, 22, 0.65) + thymeSprig(32, 42, 0, 0.7),
    chamomile: () =>
        mound() +
        stem('M28 55 Q26 44 25 36 M36 55 Q38 44 39 36', G, 2.2) +
        leaf(28, 48, 11, -150, G, 0.35) +
        leaf(36, 48, 11, -30, GL, 0.35) +
        C(25, 35, 3, '#fffdf6', 1.6) +
        C(39, 35, 3, '#fffdf6', 1.6),
    wasabi: () =>
        mound() +
        leaf(32, 52, 16, -135, '#4aa338', 0.65) +
        leaf(32, 52, 16, -45, '#6cc04a', 0.65) +
        leaf(32, 48, 15, -90, '#5bb544', 0.65),
    lemongrass: () =>
        mound() +
        L('M32 56 Q26 40 18 28 M32 56 Q31 38 30 22 M32 56 Q38 40 46 28', 3.4, '#5eb83d') +
        L('M32 56 Q29 44 26 32 M32 56 Q35 44 38 32', 2.4, '#9be06b'),
});

Object.assign(readyExtra, {
    potimarron: () =>
        mound() + leaf(16, 46, 16, -150, GD, 0.55) + leaf(48, 46, 16, -30, G, 0.55) + potimarronFruit(25, 44, 0.65) + potimarronFruit(41, 46, 0.55),
    fennel: () => mound() + fennelBulb(25, 45, 0.58) + fennelBulb(40, 44, 0.62),
    topinambour: () =>
        mound() +
        stem('M30 56 L29 18 M36 56 L38 24') +
        leaf(30, 40, 13, -150, G, 0.45) +
        leaf(37, 42, 13, -30, GL, 0.45) +
        C(29, 17, 6.5, '#ffd23f', 2) +
        FC(29, 17, 2.5, '#8b5a2b') +
        C(39, 23, 5, '#ffd23f', 1.8) +
        FC(39, 23, 2, '#8b5a2b') +
        topiTuber(33, 53, 0.45),
    thyme: () =>
        mound() +
        thymeSprig(20, 44, -32, 0.78) +
        thymeSprig(44, 44, 32, 0.78) +
        thymeSprig(28, 38, -12, 0.85) +
        thymeSprig(36, 38, 12, 0.85),
    chamomile: () =>
        mound() +
        stem('M22 55 Q22 42 20 34 M32 55 L32 28 M42 55 Q42 42 44 34', G, 2.2) +
        leaf(24, 48, 11, -150, G, 0.35) +
        leaf(40, 48, 11, -30, G, 0.35) +
        daisy(20, 32, 0.6) +
        daisy(44, 33, 0.6) +
        daisy(32, 26, 0.78),
    wasabi: () =>
        mound() +
        leaf(24, 46, 18, -140, '#3f8f2e', 0.65) +
        leaf(40, 46, 18, -40, '#5bb544', 0.65) +
        leaf(32, 44, 18, -90, '#6cc04a', 0.65) +
        wasabiRoot(32, 51, 0.52, -10),
    lemongrass: () =>
        mound() +
        L('M32 56 Q22 36 12 24 M32 56 Q26 34 20 16 M32 56 Q32 32 32 14 M32 56 Q38 34 44 16 M32 56 Q42 36 52 24', 3.4, '#5eb83d') +
        lemonStalk(27, 46, -10, 0.55) +
        lemonStalk(37, 46, 10, 0.55),
});

// Fruits sur les 2 nouveaux arbres (Cannelier & Muscadier)
Object.assign(FRUIT_COL, {
    cinnamon: '#a6532a',
    nutmeg: '#f2c24a',
});
Object.assign(fruitExtra, {
    cinnamon: (x, y) => cinStick(x, y, -22, 0.34),
    nutmeg: (x, y) => C(x, y, 4.6, '#f2c24a', 1.6) + FC(x, y, 2.2, '#d93829') + FC(x, y, 1.2, '#7a4826'),
});

// Tous les objets récoltés, produits du Capybara et 33 recettes artisanales
Object.assign(items, {
    // Matières premières
    potimarron: () => SHADOW(32, 57, 20, 3) + potimarronFruit(32, 36, 1.05),
    fennel: () => SHADOW(32, 57, 17, 2.8) + fennelBulb(32, 39, 1.05),
    topinambour: () => SHADOW(32, 56, 21, 3) + topiTuber(26, 36, 0.95, -18) + topiTuber(41, 44, 0.72, 22),
    thyme: () =>
        SHADOW(32, 57, 17, 2.8) +
        thymeSprig(26, 35, -18, 1) +
        thymeSprig(38, 35, 18, 1) +
        thymeSprig(32, 32, 0, 1.05) +
        R(24, 42, 16, 5, 2, '#d49a52', 1.8),
    chamomile: () =>
        SHADOW(32, 57, 17, 2.8) +
        stem('M24 52 Q26 40 22 30 M32 53 L32 24 M40 52 Q38 40 42 32', G, 2.4) +
        leaf(26, 44, 11, -150, G, 0.35) +
        leaf(38, 44, 11, -30, GL, 0.35) +
        daisy(22, 28, 0.72) +
        daisy(42, 30, 0.72) +
        daisy(32, 22, 0.92),
    wasabi: () => SHADOW(32, 57, 17, 2.8) + wasabiRoot(32, 36, 1.05, -18),
    lemongrass: () =>
        SHADOW(32, 57, 18, 2.8) +
        lemonStalk(25, 36, -14, 1) +
        lemonStalk(39, 36, 14, 1) +
        lemonStalk(32, 35, 0, 1.05) +
        R(22, 42, 20, 4.5, 2, '#d99a42', 1.8),
    cinnamon: () =>
        SHADOW(32, 56, 21, 3) +
        cinStick(32, 42, -16, 1.05) +
        cinStick(32, 34, 14, 1.05) +
        cinStick(32, 26, -6, 0.95) +
        leaf(44, 22, 13, -35, '#4f9e3a', 0.45),
    nutmeg: () => SHADOW(32, 56, 20, 3) + nutmegSeed(25, 34, 0.95) + nutmegHalf(42, 41, 0.85),
    watercress: () =>
        SHADOW(32, 57, 19, 2.8) +
        stem('M32 54 Q26 42 20 34 M32 54 L32 24 M32 54 Q38 42 44 34', '#4da83b', 2.4) +
        cressLeaf(18, 32, 6, '#3f8f2e') +
        cressLeaf(25, 24, 5.5, '#5ec248') +
        cressLeaf(32, 18, 6.2, '#4da83b') +
        cressLeaf(40, 24, 5.5, '#6cc04a') +
        cressLeaf(46, 32, 6, '#3f8f2e') +
        cressLeaf(32, 34, 5.5, '#6cc04a') +
        R(26, 46, 12, 4, 2, '#78c2d9', 1.6),
    waterLily: () => SHADOW(32, 55, 23, 3) + lilyFlower(32, 36, 1.05),

    // Recettes Potimarron
    potimarronSoup: () =>
        bowlB('#ea6a22', 31) +
        P('M21 31 Q27 27 33 31 Q39 35 45 31', 'none', 2.4) +
        L('M21 31 Q27 27 33 31 Q39 35 45 31', 2.2, '#fff5e0') +
        FC(28, 30, 1.6, '#5fa040') +
        FC(36, 32, 1.6, '#5fa040') +
        FC(32, 29, 1.4, '#8b5a2b') +
        L('M24 20 Q22 15 25 11 M34 18 Q32 13 35 9', 1.6, 'rgba(130,110,90,.45)'),
    potimarronTart: () =>
        tart(
            '#e86420',
            L('M18 36 L46 40 M20 42 L44 34', 1.4, '#c44510') + C(32, 36, 5, '#fffaf0', 1.6) + FC(32, 34, 1.6, '#e85a24') + leaf(35, 34, 7, -30, G, 0.45),
        ),
    potimarronGnocchi: () =>
        plateB() +
        [
            [20, 42, -15],
            [30, 39, 8],
            [42, 41, -10],
            [25, 47, 12],
            [36, 46, -8],
            [31, 34, 4],
        ]
            .map(([x, y, r]) => E(x, y, 6.2, 4.2, '#f49a42', r, 2) + L(`M${x - 2} ${y - 2} L${x - 1} ${y + 2} M${x + 1} ${y - 2} L${x + 2} ${y + 2}`, 1.1, '#c46318'))
            .join('') +
        leaf(44, 34, 9, -45, G, 0.45) +
        leaf(18, 36, 8, -135, GL, 0.45),

    // Recettes Fenouil
    fennelBass: () =>
        plateB() +
        P('M12 41 C18 32 36 30 48 37 L55 32 L54 46 L48 42 C36 49 18 47 12 41Z', '#a4b5c4', 2.2) +
        L('M24 36 L26 44 M32 35 L34 44 M40 36 L41 43', 1.5, '#687a8a') +
        FC(18, 39, 1.5, O) +
        E(28, 45, 6, 3.5, '#eef5dc', -10, 1.6) +
        C(42, 45, 4, '#ffe14a', 1.6) +
        L('M24 32 L18 26 M36 31 L42 25', 1.8, '#54a83b'),
    braisedFennel: () =>
        plateB() +
        P('M16 42 Q24 30 34 38 Q30 49 18 48Z', '#f2cf7a', 2.2) +
        P('M30 40 Q39 29 48 39 Q44 50 32 48Z', '#e4b358', 2.2) +
        L('M22 37 Q26 42 24 46 M36 37 Q40 42 38 46', 1.4, '#a86b24') +
        L('M28 32 L25 25 M38 32 L43 26', 1.8, '#54a83b') +
        HL(23, 38, 3, 1.4, -20, 0.5),
    fennelLiqueur: () =>
        bottle('#e2f6df', '#b2e37d', '#c48f52', L('M32 47 L32 39 M32 42 L27 38 M32 42 L37 38', 1.6, '#3f8f2e') + FC(32, 46, 2.2, '#eef5dc')),

    // Recettes Topinambour
    topiSoup: () =>
        bowlB('#e6d5b8', 31) +
        E(32, 31, 13, 3.6, '#fff8eb', 0, 0) +
        C(27, 30, 2.4, '#c9976c', 1.3) +
        C(36, 31, 2.2, '#b88255', 1.3) +
        FC(31, 32, 1.4, '#5fa040') +
        L('M24 20 Q22 15 25 11 M35 18 Q33 13 36 9', 1.6, 'rgba(130,110,90,.45)'),
    topiChips: () =>
        SHADOW(32, 57, 21, 3) +
        P('M14 42 L50 42 L45 55 L19 55Z', '#d98a4a') +
        [
            [23, 36, -20],
            [34, 33, 12],
            [42, 38, -15],
            [28, 40, 5],
            [37, 41, 20],
        ]
            .map(([x, y, r]) => E(x, y, 8.5, 5.5, '#e8b86a', r, 2) + E(x, y, 5.2, 3, '#f7dca4', r, 1.2))
            .join('') +
        R(18, 46, 28, 5, 2, '#fffaf0', 1.4),
    topiGratin: () =>
        SHADOW(32, 56, 24, 3) +
        R(9, 32, 46, 20, 7, '#c85a3a') +
        R(13, 35, 38, 12, 4, '#f2c76e', 1.8) +
        [
            [20, 40],
            [28, 39],
            [36, 41],
            [44, 39],
            [24, 43],
            [38, 43],
        ]
            .map(([x, y]) => FE(x, y, 3.5, 1.8, '#b56322', 0.55))
            .join('') +
        leaf(32, 33, 8, -35, G, 0.45),

    // Recettes Thym
    thymeOil: () =>
        bottle(
            '#f5f0d8',
            '#e6b82e',
            '#9c6838',
            L('M32 47 L32 38', 1.6, '#5b8f48') + FC(29, 41, 1.6, '#5b8f48') + FC(35, 43, 1.6, '#5b8f48') + FC(32, 38, 1.4, '#d99be6'),
        ),
    thymeCheese: () =>
        board() +
        E(32, 42, 18, 9, '#f7f2e4') +
        E(32, 34, 18, 7, '#fffdf5') +
        [
            [24, 33],
            [31, 32],
            [38, 34],
            [28, 36],
            [35, 36],
        ]
            .map(([x, y]) => FC(x, y, 1.4, '#5b8f48'))
            .join('') +
        thymeSprig(40, 29, 42, 0.45),
    thymeTea: () => teacup('#d4a842', E(31, 28, 12, 3.2, '#e8c460', 0, 0) + thymeSprig(39, 25, 38, 0.4)),

    // Recettes Camomille
    camomileTea: () => teacup('#f2d04e', daisy(31, 28, 0.42)),
    camomileSoap: () => soap('#f7e8a8', '#fff5cc', daisy(32, 36, 0.55)),
    camomileWater: () => perfume('#f6e18c', '#e6b82e', daisy(32, 41, 0.48)),

    // Recettes Wasabi
    wasabiSauce: () => jar('#8fd156', '#3f8f2e', P('M26 44 Q32 34 38 44Z', '#72ba3d', 1.6) + HL(30, 41, 1.6, 2.2, -10, 0.5)),
    wasabiTartare: () =>
        plateB() +
        R(18, 30, 28, 14, 5, '#d94848') +
        E(32, 31, 14, 5, '#eb6565', 0, 1.8) +
        [
            [24, 30],
            [31, 32],
            [38, 30],
            [28, 34],
            [35, 34],
        ]
            .map(([x, y]) => FC(x, y, 1.4, '#ff9a8a'))
            .join('') +
        C(46, 44, 5, '#8fd156', 1.8) +
        HL(44.5, 42.5, 1.5, 1, -20, 0.5) +
        leaf(20, 44, 9, -155, G, 0.45),
    wasabiCashew: () =>
        bowlB('#507a32', 32) +
        [
            [22, 31, -20],
            [32, 29, 15],
            [42, 31, -10],
            [27, 34, 10],
            [37, 34, -25],
        ]
            .map(([x, y, r]) => `<g transform="translate(${x} ${y}) rotate(${r})">` + P('M-5 -2 C-5 -6 3 -6 5 -1 C6 3 2 5 0 2 C-1 0 -5 1 -5 -2Z', '#9be06b', 1.8) + `</g>`)
            .join(''),

    // Recettes Citronnelle
    lemongrassBroth: () =>
        bowlB('#e8c85a', 31) +
        E(26, 31, 4.5, 2.6, '#f29a7a', -15, 1.5) +
        E(38, 32, 4.5, 2.6, '#f29a7a', 20, 1.5) +
        L('M38 29 L52 16 M41 31 L54 20', 2.6, '#9be06b') +
        FC(31, 30, 1.8, '#e2412f') +
        FC(34, 33, 1.5, '#5eb83d'),
    lemongrassIced: () =>
        SHADOW(32, 58, 15, 2.5) +
        P('M18 18 L46 18 L42 54 Q32 57 22 54Z', '#dff6ea') +
        P('M20 26 L44 26 L41 53 Q32 55 23 53Z', '#b8e878', 0) +
        P('M18 18 L46 18 L42 54 Q32 57 22 54Z', 'none') +
        R(24, 31, 7, 7, 2, '#fff', 1.4) +
        R(33, 35, 7, 7, 2, '#fff', 1.4) +
        L('M36 32 L45 10', 3, '#78b840') +
        C(22, 19, 6, '#ffe14a', 1.8),
    lemongrassSoap: () => soap('#b9e378', '#daf5a8', L('M24 41 L38 29 M28 43 L42 31', 2.2, '#4f962e')),

    // Recettes Cannelle
    cinnamonRoll: () =>
        SHADOW(32, 55, 22, 3) +
        E(32, 39, 22, 15, '#d9954c') +
        E(32, 36, 20, 12, '#f0b872', 0, 1.8) +
        L('M32 36 C32 32 38 32 38 36 C38 42 26 42 26 35 C26 28 43 28 43 37 C43 44 22 45 21 36', 2.4, '#8c3f1b') +
        P('M22 30 Q27 25 32 29 Q37 25 42 30 Q39 36 35 33 Q31 38 27 33 Q24 36 22 30Z', '#fffaf2', 1.6),
    cinnamonRum: () => bottle('#f5e6cf', '#b85c22', '#7a4522', cinStick(32, 42, -25, 0.42)),
    cinnamonCocoa: () =>
        teacup('#6b381e', C(27, 27, 3.5, '#fffaf0', 1.4) + C(33, 28, 3.8, '#fffaf0', 1.4) + cinStick(40, 23, -45, 0.45)),

    // Recettes Noix de muscade
    nutmegSauce: () =>
        bowlB('#fbf2dc', 31) +
        [
            [24, 30],
            [31, 29],
            [38, 31],
            [28, 33],
            [35, 32],
        ]
            .map(([x, y]) => FC(x, y, 1.1, '#8f5932'))
            .join('') +
        nutmegHalf(45, 25, 0.42),
    nutmegCake: () =>
        SHADOW(32, 56, 23, 3) +
        P('M12 34 C12 22 52 22 52 34 L50 52 L14 52Z', '#9e5a2b') +
        P('M14 34 C16 25 48 25 50 34', 'none', 1.8) +
        HL(24, 28, 6, 2, -15, 0.3) +
        nutmegHalf(32, 41, 0.48) +
        C(22, 32, 2, '#f5d36b', 1.2) +
        C(42, 32, 2, '#f5d36b', 1.2),
    nutmegElixir: () => perfume('#c97a38', '#7a4826', nutmegSeed(32, 41, 0.34)),

    // Recettes Capybara (Cresson d'eau & Fleur de nénuphar)
    cressSoup: () =>
        bowlB('#4aa33c', 31) + L('M22 31 Q28 28 34 31 Q40 34 44 31', 2, '#f5fae8') + cressLeaf(32, 30, 3.6, '#6cc04a') + cressLeaf(26, 31, 2.8, '#3f8f2e'),
    cressButter: () =>
        board() +
        P('M15 34 L45 34 L49 46 L19 46Z', '#f6e496') +
        P('M15 34 L21 26 L49 26 L45 34Z', '#fff1b3') +
        [
            [25, 30],
            [34, 29],
            [41, 31],
            [27, 40],
            [36, 39],
            [43, 41],
        ]
            .map(([x, y]) => FC(x, y, 1.5, '#4da83b'))
            .join('') +
        cressLeaf(22, 26, 3.6, '#5ec248'),
    cressSalad: () =>
        bowlB('#5ec248', 32) +
        cressLeaf(22, 30, 5, '#4da83b') +
        cressLeaf(32, 28, 5.5, '#6cc04a') +
        cressLeaf(42, 30, 5, '#3f8f2e') +
        C(28, 32, 3.4, '#e84a4a', 1.5) +
        C(37, 32, 3.2, '#ffe14a', 1.5),
    lilyTea: () => teacup('#f7c6d8', lilyFlower(31, 27, 0.38)),
    lilySoap: () => soap('#f7b5d0', '#ffd8e8', lilyFlower(32, 35, 0.42)),
    lilyPerfume: () => perfume('#f5a6c8', '#e86ca0', lilyFlower(32, 41, 0.36)),
});
