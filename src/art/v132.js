// 1.3.2 : la brebis laitière, les produits du saloir, leurs recettes et le saloir.
import { C, E, F, FC, FE, HL, L, P, R, SHADOW, leaf, sub, items, animals, machines } from './kit.js';
import { plate, bowl, jar, steamF, woodBoard, milkB, wheel } from './items2.js';
import { figFruit, chestnutNut, cocotte, ramekin } from './v131.js';

const PINK = '#f2a0a0',
    PINK_D = '#d97a7a',
    FAT = '#fbeee6',
    PAPER = '#f2e6d0';

// ======================= la brebis laitière =======================
// le mouton, tête et pattes brunes, une clochette au cou
animals.ewe = (o = {}) =>
    animals.sheep(o).replace(/#4a3b35/g, '#a8693a') +
    L('M53 46 Q58 52 64 48', 2.4, '#8e2c22') +
    P('M56 50 L62 50 L63 56 L55 56Z', '#e2a548', 1.8) +
    FC(59, 57, 1.2, '#3a2618');

// ======================= les produits bruts =======================
// une pièce posée sur un papier de boucher
const paper = () => SHADOW(32, 57, 26, 3) + P('M6 44 L50 36 L58 48 L14 56Z', PAPER, 2) + L('M12 46 L48 40', 1, 'rgba(58,38,24,.2)');
const RAW = {
    sheepMilk: () => milkB('#8a5a9a', '#fffaf0', 'ewe'),
    // le lard : une tranche épaisse, couches roses et blanches, couenne
    lard: () =>
        paper() +
        P('M12 40 L48 32 L52 42 L16 50Z', FAT) +
        F('M13 42.5 L49 34.6 L50 37 L14 45Z', PINK) +
        F('M14.5 46.5 L50.5 38.6 L51.2 40.5 L15.4 48.5Z', PINK_D, 0.8) +
        P('M12 40 L48 32 L52 42 L16 50Z', 'none') +
        P('M12 40 L48 32 L47 28 L11 36Z', '#e8b48a', 2) +
        HL(24, 38, 6, 1, -12, 0.6),
    // le magret : peau quadrillée dorée
    magret: () =>
        paper() +
        P('M12 44 Q14 32 34 30 Q52 30 52 40 Q48 48 30 50 Q14 50 12 44Z', '#c8504a') +
        P('M14 42 Q16 34 34 32 Q50 32 50 39 Q34 36 14 42Z', '#f2d6a0', 1.6) +
        L('M20 36 L26 40 M28 34 L34 38 M36 33 L42 37 M24 34 L20 40 M32 33 L28 39 M40 33 L36 38', 1, '#c98b2a') +
        HL(22, 45, 5, 1.2, -6, 0.4),
    // la cuisse d'oie : dorée, os en bout
    gooseLeg: () =>
        paper() +
        R(40, 30, 14, 5, 2.5, '#fffaf0', 2) +
        C(54, 29, 3, '#fffaf0', 1.8) +
        C(54, 35, 3, '#fffaf0', 1.8) +
        P('M12 40 Q12 26 28 26 Q42 28 42 34 Q42 44 28 48 Q12 50 12 40Z', '#e8a548') +
        HL(20, 32, 5, 2, -20, 0.6),
    // le filet de dinde : pâle et tendre
    turkeyFillet: () =>
        paper() +
        P('M10 42 Q16 30 34 30 Q50 32 54 40 Q48 48 30 48 Q14 48 10 42Z', '#f6d0c0') +
        L('M18 40 Q32 36 46 40', 1, '#e0a898') +
        HL(24, 35, 6, 1.4, -6, 0.6),
    // le morceau de bœuf : rouge persillé, ficelé
    beef: () =>
        paper() +
        P('M12 40 Q12 28 32 28 Q52 28 52 40 Q52 50 32 50 Q12 50 12 40Z', '#c8403a') +
        L('M20 36 Q24 38 22 42 M34 34 Q38 38 36 44 M44 38 Q46 40 44 44', 1.2, '#f6c8c0') +
        L('M22 29 L22 49 M32 28 L32 50 M42 29 L42 49', 2, '#f2e6c0') +
        HL(18, 34, 4, 1.6, -20, 0.5),
    // le râble : un petit rôti roulé
    rabbitSaddle: () =>
        paper() +
        R(14, 32, 36, 16, 8, '#f2c0a8') +
        E(48, 40, 4, 8, '#e8a890', 0, 2) +
        E(48, 40, 2, 4, '#f6d8c8', 0, 1) +
        L('M22 32 L22 48 M30 32 L30 48 M38 32 L38 48', 1.8, '#d9a066') +
        HL(22, 36, 6, 1.4, 0, 0.6),
};
Object.assign(items, RAW);

// ======================= les recettes =======================
const hamShape = (x, y, s) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    P('M-6 -22 Q-2 -26 4 -22 L6 -14 Q20 -4 18 12 Q14 26 0 26 Q-14 26 -18 12 Q-20 -4 -6 -14Z', '#a8423a') +
    F('M-16 10 Q-12 22 0 23 Q12 22 16 10 Q10 18 0 18 Q-10 18 -16 10Z', FAT, 0.9) +
    R(-5, -30, 10, 9, 3, '#fffaf0', 2) +
    HL(-8, -2, 3, 8, 15, 0.4) +
    `</g>`;
const slice = (x, y, rot, c = '#c8504a', fat = FAT, r = 8) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})">` +
    E(0, 0, r, r * 0.6, c, 0, 1.8) +
    P(`M${-r} 0 Q0 ${r * 0.9} ${r} 0`, 'none', 0) +
    F(`M${-r + 1} 1 Q0 ${r * 0.75} ${r - 1} 1 Q0 ${r * 0.5} ${-r + 1} 1Z`, fat, 0.9) +
    '</g>';
const terrineDish = (fill, extra = '') =>
    SHADOW(32, 58, 26, 3) +
    R(6, 30, 52, 24, 6, '#c8693a') +
    L('M8 44 L56 44', 1.4, '#a8531f') +
    E(32, 31, 24, 5, fill) +
    extra +
    E(32, 31, 24, 5, 'none', 0, 2.2) +
    R(4, 34, 4, 8, 2, '#c8693a', 1.8) +
    R(56, 34, 4, 8, 2, '#c8693a', 1.8);
const bakingDish = (layers, top) =>
    SHADOW(32, 58, 27, 3) +
    R(4, 30, 56, 24, 5, '#f2e6d0') +
    layers +
    R(4, 30, 56, 24, 5, 'none') +
    E(32, 31, 26, 5.5, top) +
    E(32, 31, 26, 5.5, 'none', 0, 2.2);
const lentils = (xs, y) => xs.map((x, k) => E(x, y + (k % 2), 2, 1.5, k % 2 ? '#a65e1e' : '#8b4a22', 0, 0.8)).join('');
const bean = (x, y) => E(x, y, 2.6, 1.8, '#f2e6c0', 0, 1);

const REC = () => ({
    // ---- saloir ----
    ham: SHADOW(32, 60, 16, 3) + L('M32 2 L32 10', 1.8) + hamShape(32, 34, 1),
    lardons:
        bowl('#f2e6d0', 30, '#8a5a9a') +
        [16, 24, 32, 40, 48, 20, 28, 36, 44].map((x, k) => R(x - 3, (k < 5 ? 26 : 30) - 2, 6, 4.5, 1, k % 2 ? PINK : '#e8a090', 1.2)).join(''),
    saucisson:
        woodBoard() +
        P('M6 36 Q8 24 26 24 L42 24 Q48 24 48 34 Q48 42 42 42 L20 42 Q6 42 6 36Z', '#8e3a3a') +
        L('M12 28 L44 40 M12 36 L30 26 M20 42 L42 26 M30 42 L46 30', 1, '#f2e6d0') +
        [
            [52, 38],
            [58, 44],
        ]
            .map(([x, y]) => C(x, y, 5, '#c8504a', 1.8) + FC(x - 1.5, y - 1, 1, FAT) + FC(x + 1.5, y + 1.5, 0.8, FAT) + FC(x + 1, y - 2, 0.8, FAT))
            .join(''),
    driedMagret: woodBoard() + [14, 24, 34, 44].map((x, k) => slice(x, 40 - (k % 2) * 3, -20 + k * 6, '#a8423a', FAT, 9)).join(''),
    duckConfit: jar('#f2e6c0', '#c8453a', sub('magret', 22, 34, 20)),
    gooseConfit: jar('#f6e8c8', '#3f6fb5', sub('gooseLeg', 22, 34, 20)),
    gooseRillettes:
        SHADOW(32, 58, 20, 3) +
        P('M14 26 L50 26 L48 54 Q48 57 44 57 L20 57 Q16 57 16 54Z', '#f2e6d0') +
        L('M15 32 L49 32', 1.6, '#c8693a') +
        E(32, 26, 18, 4.5, '#e8c8a0') +
        L('M20 26 Q26 22 32 26 Q38 22 44 26', 1.2, '#c8a07a') +
        E(32, 26, 18, 4.5, 'none', 0, 2.2) +
        P('M40 50 L58 40 L62 46 L44 56Z', '#e8a548', 1.8) +
        P('M43 50 L57 42.5 L58.5 45 L45 52.5Z', '#e8c8a0', 0),
    smokedTurkey:
        woodBoard() +
        [14, 25, 36, 47].map((x, k) => slice(x, 40 - (k % 2) * 3, -15 + k * 8, '#f2c8b0', '#c8693a', 9)).join('') +
        L('M20 18 Q16 12 20 6 M34 16 Q30 10 34 4', 1.6, '#c9c2b8'),
    driedBeef: woodBoard() + [14, 24, 34, 44].map((x, k) => slice(x, 40 - (k % 2) * 3, -10 + k * 6, '#7a2a2a', '#a8423a', 9)).join(''),
    rabbitTerrine: terrineDish(
        '#d8a888',
        [20, 28, 36, 44].map(x => FC(x, 31, 1.2, '#8b5a3a')).join('') + leaf(40, 29, 6, -30, '#4caf50', 0.5) + leaf(40, 29, 6, -150, '#4caf50', 0.5),
    ),
    // ---- comptoir froid ----
    melonHam:
        plate(46) +
        [18, 32, 46]
            .map(
                (x, k) =>
                    P(`M${x - 9} 44 Q${x} 30 ${x + 9} 44 Q${x} 40 ${x - 9} 44Z`, '#a8c06a', 1.8) +
                    P(`M${x - 7} 43 Q${x} 33 ${x + 7} 43 Q${x} 39 ${x - 7} 43Z`, '#f6a23a', 0),
            )
            .join('') +
        L('M10 38 Q20 32 26 38 Q32 44 40 36 Q46 30 54 38', 5, '#3a2618') +
        L('M10 38 Q20 32 26 38 Q32 44 40 36 Q46 30 54 38', 3, '#c8504a') +
        L('M12 37 Q20 33 26 37', 1, '#fbe6e0'),
    hamSandwich:
        woodBoard() +
        P('M4 40 Q4 28 16 28 L50 28 Q60 28 60 38 Q60 44 52 44 L12 44 Q4 44 4 40Z', '#e8a548') +
        L('M14 30 L18 34 M26 30 L30 34 M38 30 L42 34 M50 30 L54 34', 1.4, '#c98b2a') +
        L('M8 38 Q20 42 32 38 Q44 42 56 38', 4, '#3a2618') +
        L('M8 38 Q20 42 32 38 Q44 42 56 38', 2.4, PINK) +
        L('M10 40 L54 40', 1.4, '#ffe58a'),
    // ---- fourneau ----
    cassoulet:
        terrineDish('#c8742a') +
        [16, 24, 40, 48, 20, 44].map((x, k) => bean(x, k < 4 ? 30 : 33)).join('') +
        R(26, 28, 12, 5, 2.5, '#8e3a3a', 1.6) +
        FC(30, 30, 0.8, FAT) +
        steamF,
    petitSale:
        bowl('#7a4a2a', 30) +
        lentils([14, 18, 22, 26, 34, 38, 42, 46, 50], 29) +
        R(27, 26, 7, 5, 1, PINK, 1.2) +
        R(36, 29, 6, 4, 1, PINK, 1.2) +
        E(20, 32, 3.5, 2, '#f08a24', 20, 1.2) +
        steamF,
    potAuFeu: cocotte(
        '#e8c88a',
        R(16, 25, 12, 7, 2, '#a8423a', 1.6) + E(36, 28, 6, 2.4, '#f08a24', 15, 1.4) + R(40, 23, 12, 5, 2, '#e8f0c0', 1.4) + FC(28, 32, 2.6, '#f2e6c0'),
    ),
    turkeyChestnut:
        plate(48) +
        P('M12 40 Q10 22 32 20 Q54 22 52 40 Q32 48 12 40Z', '#c8742a') +
        F('M16 36 Q14 26 30 24', 'none') +
        L('M18 30 Q28 24 42 26', 1.6, '#e8a548') +
        R(48, 22, 10, 4, 2, '#fffaf0', 1.6) +
        R(6, 24, 10, 4, 2, '#fffaf0', 1.6) +
        HL(22, 28, 5, 2, -20, 0.5) +
        chestnutNut(14, 46, 0.4) +
        chestnutNut(50, 46, 0.4) +
        chestnutNut(32, 50, 0.4),
    rabbitMustard: cocotte(
        '#f2d06a',
        R(18, 25, 10, 6, 3, '#f2c0a8', 1.4) + R(34, 26, 10, 6, 3, '#f2c0a8', 1.4) + [24, 30, 42, 46].map(x => FC(x, 31, 1, '#b8862a')).join(''),
    ),
    magretFigs:
        plate(46) +
        [16, 25, 34].map((x, k) => slice(x, 42 - k, -20 + k * 10, '#c8504a', '#f2d6a0', 7)).join('') +
        figFruit(46, 38, 0.6) +
        P('M38 44 Q38 38 44 38 Q50 38 50 44 Q50 48 44 48 Q38 48 38 44Z', '#6b2f5e', 1.6) +
        P('M40 44 Q40 40 44 40 Q48 40 48 44 Q48 46.5 44 46.5 Q40 46.5 40 44Z', '#d8436a', 0),
    moussaka:
        bakingDish(F('M5 40 L59 40 L59 46 L5 46Z', '#7a3f7a', 0.9) + F('M5 46 L59 46 L59 52 L5 52Z', '#c8504a', 0.8), '#f2c86a') +
        [14, 24, 34, 44, 50].map((x, k) => FC(x, 30 + (k % 2), 1.6, '#c98b2a')).join(''),
    choucroute:
        plate(46) +
        P('M10 44 Q12 30 32 30 Q52 30 54 44 Q32 50 10 44Z', '#f2e6a0') +
        L('M14 40 Q20 36 24 40 M28 36 Q34 32 38 36 M42 40 Q46 36 50 40', 1, '#c8b860') +
        R(14, 32, 26, 6, 3, '#c8742a', 1.8) +
        R(34, 36, 18, 5, 2.5, '#e8b48a', 1.6) +
        C(20, 42, 4, '#f2d6a0', 1.6) +
        C(44, 44, 3.6, '#f2d6a0', 1.6),
    stuffedCabbage:
        plate(48) +
        C(32, 36, 14, '#8fbf6a') +
        L('M32 22 Q26 36 32 50 M22 26 Q28 36 22 46 M42 26 Q36 36 42 46', 1.4, '#5f8a3e') +
        HL(26, 30, 3, 5, -20, 0.5) +
        P('M18 46 Q32 52 46 46', 'none', 0) +
        FC(18, 46, 1.6, '#c8453a') +
        FC(46, 46, 1.6, '#c8453a'),
    gooseLegApples: plate(46) + sub('gooseLeg', 6, 14, 40) + [42, 50].map(x => C(x, 42, 5, '#f2d06a', 1.6) + FE(x, 42, 2, 1.4, '#e8a548')).join(''),
    rabbitPrunes: cocotte(
        '#7a4a3a',
        R(18, 25, 10, 6, 3, '#d8a088', 1.4) + R(34, 26, 10, 6, 3, '#d8a088', 1.4) + [24, 30, 44].map(x => E(x, 31, 2.6, 2, '#3a2a3a', 0, 1)).join(''),
    ),
    // ---- laiterie ----
    roquefort:
        SHADOW(32, 57, 26, 3) +
        P('M6 46 L32 24 L58 46 L58 52 L6 52Z', '#f4f1ea') +
        P('M6 46 L32 24 L58 46Z', '#fbf8f0') +
        L('M14 44 Q20 40 24 44 M28 36 Q32 32 36 36 M38 46 Q44 42 50 46 M20 50 Q26 48 32 50 M40 50 L46 48', 1.8, '#5a7a8a') +
        [18, 30, 44, 26, 38].map((x, k) => FC(x, k < 3 ? 47 : 40, 1.4, '#3f6a7a')).join('') +
        P('M6 46 L32 24 L58 46 L58 52 L6 52Z', 'none') +
        L('M6 46 L58 46', 1.4),
    sheepTomme: wheel({
        rind: '#c8b48a',
        rindD: '#9a8458',
        side: '#b8a070',
        paste: '#fbf3d8',
        pasteD: '#e8d8a8',
        extra: L('M10 28 Q14 24 18 28 M42 22 Q46 20 50 22', 1.2, '#9a8458'),
    }),
    sheepYogurt: ramekin('#fffdf6', P('M24 26 Q32 22 40 28 Q34 32 26 30Z', '#f2c23a', 1.4) + L('M44 18 L56 6', 3) + L('M44 18 L56 6', 1.6, '#c08b52')),
});

// ======================= le saloir =======================
const SALOIR = () =>
    SHADOW(32, 60, 28, 3) +
    R(6, 10, 52, 48, 4, '#a8693a') +
    R(10, 14, 44, 40, 2, '#5e3a1e', 1.8) +
    L('M10 20 L54 20', 2.4, '#d9a066') +
    hamShape(20, 36, 0.48) +
    hamShape(44, 36, 0.48) +
    L('M20 20 L20 22 M44 20 L44 22 M32 20 L32 24', 1.4, '#f2e6d0') +
    R(29, 24, 6, 16, 3, '#8e3a3a', 1.6) +
    L('M30 28 L34 32 M30 34 L34 30', 0.9, '#f2e6d0') +
    R(10, 48, 44, 6, 1, '#d9a066', 1.6) +
    [16, 24, 40, 48].map(x => FC(x, 51, 1.4, '#fff')).join('') +
    P('M4 10 L32 2 L60 10Z', '#7a4a2a');

let rec = null;
Object.keys(REC()).forEach(k => (items[k] = () => (rec = rec || REC())[k]));
machines.saloir = SALOIR;
