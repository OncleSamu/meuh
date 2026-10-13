// 1.3.3 : les 69 recettes de complément (chaque ingrédient sert à 3 recettes au moins).
import { C, E, F, FC, FE, HL, L, P, R, SHADOW, leaf, sub, items } from './kit.js';
import { plate, bowl, jar, coupe, scoop, juiceB, tallGlass, steamF, woodBoard, oil, wheel, flacon } from './items2.js';
import { cocotte } from './v131.js';

// ---- petits morceaux ----
const fishMini = (x, y, s, body, belly = '#f4f1ea', rot = 0) =>
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
const lemonSlice = (x, y, r = 5) =>
    C(x, y, r, '#7cc23a', 1.6) +
    C(x, y, r - 1.6, '#d8f08a', 0) +
    L(`M${x - r + 2} ${y} L${x + r - 2} ${y} M${x} ${y - r + 2} L${x} ${y + r - 2}`, 0.8, '#7cc23a');
const shrimpMini = (x, y, s = 1, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M-6 -4 Q4 -8 7 0 Q6 6 0 6 Q4 3 2 0 Q-1 -2 -6 -1Z', '#f28a5a', 1.6) +
    L('M-1 -4 L0 1 M3 -5 L4 1', 0.8, '#c85a3a') +
    `</g>`;
const truffleBit = (x, y, r) =>
    C(x, y, r, '#3a2a2a', 1.6) + FC(x - r * 0.3, y - r * 0.3, r * 0.25, '#7a6a6a', 0.8) + FC(x + r * 0.3, y + r * 0.2, r * 0.15, '#7a6a6a', 0.8);
const saffronThreads = (x, y) => L(`M${x} ${y} l3 -5 M${x + 2} ${y + 1} l4 -3 M${x - 2} ${y} l1 -6`, 1.4, '#e8361b');
const bottle = (liquid, label, cap = '#3a2618') =>
    SHADOW(32, 61, 13, 2.4) +
    P('M27 2 L37 2 L37 16 Q44 20 44 28 L44 56 Q44 60 40 60 L24 60 Q20 60 20 56 L20 28 Q20 20 27 16Z', '#f4fbff') +
    F('M21.4 30 L42.6 30 L42.6 56 Q42.6 58.6 40 58.6 L24 58.6 Q21.4 58.6 21.4 56Z', liquid, 0.9) +
    R(22, 38, 20, 14, 3, '#fffaf0', 1.4) +
    label +
    P('M27 2 L37 2 L37 16 Q44 20 44 28 L44 56 Q44 60 40 60 L24 60 Q20 60 20 56 L20 28 Q20 20 27 16Z', 'none') +
    R(26, 0, 12, 5, 2, cap) +
    F('M22.5 30 L24.5 28.5 L24.5 54 L22.5 54Z', '#fff', 0.45);
const mark = (id, x = 24, y = 37, s = 16) => sub(id, x, y, s);
const fabric = (c, d, extra = '') =>
    SHADOW(32, 57, 24, 3) +
    P('M8 26 L56 26 L56 50 Q32 56 8 50Z', c) +
    L('M8 32 L56 32 M8 44 Q32 50 56 44', 1.2, d) +
    P('M8 26 L56 26 L52 20 L12 20Z', d, 2) +
    extra;

const ART = () => ({
    // ---------------- l'étang ----------------
    pondFry:
        plate(46) +
        fried(20, 40, -10) +
        fried(34, 37, 8) +
        fried(44, 42, -15) +
        fried(27, 44, 12) +
        lemonSlice(48, 34, 4.5) +
        leaf(14, 36, 6, -150, '#4caf50', 0.5),
    perchMeuniere:
        plate(46) +
        fishMini(30, 40, 1.1, '#c8a04a', '#f2e6c0') +
        L('M20 36 L22 44 M28 35 L30 45 M36 35 L38 45', 1.8, '#5e7a3a') +
        P('M14 46 Q30 52 48 46 Q40 50 30 50 Q20 50 14 46Z', '#f2c23a', 1.2) +
        leaf(48, 36, 6, -40, '#4caf50', 0.5),
    pikeQuenelles:
        plate(46) +
        P('M10 44 Q12 36 32 36 Q52 36 54 44 Q32 50 10 44Z', '#e88a5a') +
        [20, 32, 44].map(x => E(x, 40, 6.5, 3.6, '#f6ead0', -8, 1.8) + FE(x - 2, 38.6, 2.4, 0.9, '#fff', 0.7)).join('') +
        leaf(30, 34, 5, -40, '#4caf50', 0.5),
    pondRillettes: jar('#e8d8b0', '#3f6fb5', fishMini(32, 42, 0.7, '#8fa06a')),
    stuffedCarp:
        plate(46) +
        fishMini(32, 39, 1.4, '#b8a060', '#e8d8a0') +
        L('M20 37 Q32 33 44 37', 1.6, '#3a2618') +
        [24, 30, 36].map(x => C(x, 36.5, 1.6, '#8b5a2b', 1)).join('') +
        leaf(14, 44, 6, -150, '#4caf50', 0.5),
    eelMatelote: cocotte('#c8a060', [18, 28, 38].map(x => R(x, 26, 8, 6, 3, '#6b7a5a', 1.4)).join('') + FC(46, 30, 2.4, '#f2e6f6') + FC(14, 30, 2, '#f2e6f6')),
    smokedCatfish:
        woodBoard() +
        P('M8 40 Q14 28 34 28 Q48 28 54 36 L60 30 L58 40 L60 50 L54 44 Q48 52 34 52 Q14 52 8 40Z', '#a8603a') +
        L('M18 34 L18 48 M26 32 L26 50 M34 32 L34 50 M42 33 L42 49', 1.2, '#e8a060') +
        L('M8 40 L6 34 M8 40 L4 40 M8 40 L6 46', 1.4) +
        FC(14, 38, 1.6, '#3a2618') +
        L('M24 22 Q20 18 24 14 M32 22 Q28 18 32 14', 1.4, 'rgba(160,160,160,.8)'),
    catfishBeurreBlanc:
        plate(46) +
        P('M12 44 Q14 36 32 36 Q50 36 52 44 Q32 50 12 44Z', '#fff6d8') +
        R(18, 34, 28, 10, 4, '#f2ead8', 2) +
        L('M24 36 L26 42 M32 35 L34 43 M40 36 L42 42', 1, '#c8b890') +
        [16, 48].map(x => C(x, 42, 3, '#d8e6a0', 1.2) + FC(x, 42, 1.1, '#8fbf4a')).join(''),
    smokedPike:
        woodBoard() +
        fishMini(32, 40, 1.4, '#b8783a', '#e8b878') +
        L('M20 34 L22 46 M28 33 L30 47 M36 33 L38 47', 1.1, '#e8b878') +
        L('M30 24 Q26 20 30 16 M38 24 Q34 20 38 16', 1.4, 'rgba(160,160,160,.8)'),
    // ---------------- le poisson doré ----------------
    goldfishBowl:
        SHADOW(32, 60, 20, 3) +
        C(32, 36, 22, '#dff2fb') +
        F('M11 40 Q32 34 53 40 Q52 56 32 58 Q12 56 11 40Z', '#9fd4f0', 0.8) +
        fishMini(30, 44, 0.75, '#f2a23a', '#ffd88a') +
        L('M24 56 Q22 50 26 46 M28 56 Q30 50 28 48', 1.6, '#4caf50') +
        FC(42, 38, 1.2, '#fff', 0.9) +
        FC(44, 32, 0.9, '#fff', 0.9) +
        C(32, 36, 22, 'none') +
        E(32, 15, 12, 3, '#dff2fb') +
        HL(18, 26, 3, 7, 20, 0.6),
    goldScalePendant:
        SHADOW(32, 60, 12, 2) +
        L('M12 4 Q32 26 52 4', 1.8, '#c9952a') +
        C(32, 22, 3, '#ffd23f', 1.4) +
        P('M32 26 Q46 34 44 46 Q40 58 32 58 Q24 58 20 46 Q18 34 32 26Z', '#ffd23f') +
        P('M32 32 Q40 38 39 46 Q37 53 32 53 Q27 53 25 46 Q24 38 32 32Z', '#f2a23a', 1.6) +
        L('M26 42 Q32 46 38 42 M27 48 Q32 51 37 48', 1.2, '#c9952a') +
        HL(26, 38, 1.6, 4, 15, 0.7),
    goldfishMobile:
        L('M8 8 L56 8 M32 2 L32 8', 2.4, '#a8693a') +
        [12, 32, 52]
            .map((x, k) => L(`M${x} 8 L${x} ${22 + (k % 2) * 10}`, 1) + fishMini(x, 28 + (k % 2) * 10, 0.55, '#f2a23a', '#ffd88a', k % 2 ? 10 : -10))
            .join('') +
        [22, 42].map(x => L(`M${x} 8 L${x} 44`, 1) + C(x, 48, 3, '#ffd23f', 1.4)).join(''),
    // ---------------- la mer ----------------
    grilledSardines:
        SHADOW(32, 58, 26, 3) +
        R(6, 38, 52, 16, 3, '#5e5548') +
        L('M10 42 L54 42 M10 46 L54 46 M10 50 L54 50', 1.2, '#8f8574') +
        [20, 32, 44].map(x => fishMini(x, 38, 0.65, '#7a9ab0', '#dfe6ec', -90)).join('') +
        lemonSlice(52, 28, 4.5) +
        L('M22 18 Q18 14 22 10 M34 18 Q30 14 34 10', 1.4, 'rgba(160,160,160,.8)'),
    pissaladiere:
        plate(48) +
        R(8, 32, 48, 16, 3, '#e8a548') +
        R(11, 34, 42, 11, 2, '#e8c88a', 1.6) +
        L('M13 36 L51 44 M13 44 L51 36 M24 34 L40 45 M40 34 L24 45', 1.6, '#6b4a3a') +
        [18, 30, 44, 24, 38].map((x, k) => FC(x, k < 3 ? 37 : 42, 1.6, '#3a2618')).join(''),
    mackerelWine: jar('#f2e6b0', '#3f6fb5', fishMini(32, 42, 0.7, '#4f7a9a', '#dfe6ec') + FC(26, 38, 1.6, '#f08a24') + FC(38, 46, 1.6, '#f08a24')),
    seabassTartare:
        plate(46) +
        P('M18 42 L18 32 Q32 28 46 32 L46 42 Q32 46 18 42Z', '#f2d6c8') +
        E(32, 32, 14, 3.5, '#f6e2d6') +
        [24, 30, 36, 40].map((x, k) => FC(x, 31 + (k % 2), 1.4, '#7cc23a')).join('') +
        lemonSlice(50, 40, 4.5) +
        leaf(32, 28, 5, -60, '#4caf50', 0.5),
    lobsterArmoricaine:
        plate(46) +
        P('M10 44 Q12 34 32 34 Q52 34 54 44 Q32 50 10 44Z', '#d8432a') +
        P('M18 40 Q26 30 40 34 Q48 36 46 42 Q36 44 26 44Z', '#e8432a', 1.8) +
        L('M24 37 L26 42 M30 35 L32 43 M36 35 L37 43', 1.2, '#a82a1a') +
        P('M44 38 Q52 30 54 36 Q50 40 46 40Z', '#e8432a', 1.6) +
        leaf(14, 38, 5, -150, '#4caf50', 0.5),
    lobsterBisque: bowl('#e8723a', 30, '#c8453a') + P('M20 30 Q30 26 40 30 Q32 33 22 32Z', '#fff6e0', 1.2) + shrimpMini(44, 29, 0.8) + steamF,
    // ---------------- légumes ----------------
    radishButter:
        woodBoard() +
        R(10, 36, 22, 9, 3, '#f2d090', 1.8) +
        R(12, 33, 14, 4, 1.5, '#fff3c0', 1.4) +
        [38, 46, 54]
            .map(
                (x, k) =>
                    C(x, 38 + (k % 2) * 3, 4.6, '#e8364b', 1.8) +
                    FC(x - 1.5, 36.5 + (k % 2) * 3, 1.2, '#fff', 0.6) +
                    leaf(x, 34 + (k % 2) * 3, 7, -100, '#6cc04a', 0.4),
            )
            .join('') +
        [16, 22, 28].map(x => FC(x, 44, 0.8, '#fff')).join(''),
    peasFrench: cocotte(
        '#8fc65a',
        [18, 24, 30, 36, 42, 46, 21, 27, 33, 39].map((x, k) => FC(x, k < 6 ? 29 : 31.5, 2.2, '#5fb43a')).join('') +
            leaf(28, 30, 8, -20, '#a8e06a', 0.6) +
            FC(40, 28, 2.6, '#f7f3e6'),
    ),
    eggplantCaviar: jar('#a8906a', '#6b3fa0', sub('eggplant', 22, 33, 20)) + leaf(40, 22, 6, -40, '#4caf50', 0.5),
    popcorn:
        SHADOW(32, 59, 16, 3) +
        P('M16 28 L48 28 L44 58 L20 58Z', '#fff') +
        [20, 28, 36, 44].map(x => F(`M${x - 2} 28 L${x + 2} 28 L${x + 1.5} 58 L${x - 1.5} 58Z`, '#e8364b')).join('') +
        P('M16 28 L48 28 L44 58 L20 58Z', 'none') +
        [
            [20, 24],
            [28, 20],
            [36, 22],
            [44, 25],
            [24, 15],
            [34, 13],
            [40, 17],
            [30, 26],
        ]
            .map(([x, y]) => C(x, y, 4.6, '#fff6d8', 1.6) + FC(x + 1, y - 1, 2, '#f2c23a', 0.8))
            .join(''),
    beetSyrup: bottle('#8a2a3a', mark('beet')),
    soySauce: bottle('#3a1a10', mark('soy'), '#c8453a'),
    // ---------------- fruits ----------------
    marmalade: jar('#f29a2a', '#e8792a', sub('orange', 22, 33, 20)) + L('M26 26 L30 24 M36 25 L40 27', 1.4, '#f8c06a'),
    kiwiJam: jar('#7ab43a', '#5e3a1e', sub('kiwi', 22, 33, 20)),
    kiwiSorbet: coupe(
        scoop(24, 26, 10, '#9ad06a') + scoop(40, 26, 10, '#8fc65a'),
        C(48, 14, 7, '#8fc65a', 1.6) +
            C(48, 14, 3, '#f2f6d8', 0) +
            [0, 60, 120, 180, 240, 300]
                .map(a => FC(48 + 4.6 * Math.cos((a * Math.PI) / 180), 14 + 4.6 * Math.sin((a * Math.PI) / 180), 0.7, '#3a2618'))
                .join(''),
    ),
    kiwiJuice: juiceB('#a8d06a', 'kiwi', '#5e3a1e'),
    driedKaki:
        L('M32 2 L32 10', 1.6, '#c8a46a') +
        [12, 22, 32, 42, 52]
            .map((y, k) => E(32, y + 4, 9 - k * 0.6, 4.2, '#c8601e', 0, 1.8) + FE(29, y + 3, 3, 1.2, '#e8903a', 0.7) + L(`M32 ${y} L32 ${y - 1}`, 1.4))
            .join('') +
        SHADOW(32, 62, 10, 1.6),
    kakiSyrup: jar('#f29a3a', '#e8c35a', sub('kaki', 22, 33, 20)),
    kakiSorbet: coupe(scoop(24, 26, 10, '#f2862a') + scoop(40, 26, 10, '#f69a3a'), leaf(46, 12, 9, -30, '#5f8f2e', 0.45)),
    papayaSmoothie: tallGlass('#f6a24a', sub('papaya', 4, 2, 20)),
    candiedPapaya:
        SHADOW(32, 58, 24, 3) +
        E(32, 46, 26, 8, '#fff', 2.2) +
        [
            [18, 42],
            [28, 38],
            [38, 41],
            [46, 44],
            [24, 46],
            [36, 47],
        ]
            .map(([x, y], k) => R(x - 4, y - 3.5, 8, 7, 1.6, k % 2 ? '#f2862a' : '#f6b24a', 1.4) + FC(x - 1.5, y - 1.5, 0.8, '#fff', 0.8))
            .join(''),
    avocadoShrimp:
        plate(46) +
        P('M14 42 Q12 30 24 28 Q34 28 34 38 Q34 46 24 46 Q16 46 14 42Z', '#3f6b2a') +
        P('M17 41 Q16 32 24 31 Q31 31 31 38 Q31 43 24 43 Q18 43 17 41Z', '#c8e080', 0) +
        shrimpMini(24, 36, 0.9) +
        P('M32 44 Q30 32 42 30 Q52 30 52 40 Q52 48 42 48 Q34 48 32 44Z', '#3f6b2a') +
        P('M35 43 Q34 34 42 33 Q49 33 49 40 Q49 45 42 45 Q36 45 35 43Z', '#c8e080', 0) +
        shrimpMini(42, 38, 0.9, 20),
    guavaSorbet: coupe(scoop(24, 26, 10, '#f6889a') + scoop(40, 26, 10, '#f89aa8'), C(48, 12, 7, '#a8d65c', 1.6) + C(48, 12, 4, '#f6889a', 0)),
    coffeeLiqueur: bottle('#3a1a10', mark('greenCoffee'), '#c8a46a'),
    coffeeBeans:
        SHADOW(32, 58, 24, 3) +
        E(32, 46, 26, 8, '#fff', 2.2) +
        [
            [18, 42],
            [26, 38],
            [34, 41],
            [42, 38],
            [48, 43],
            [24, 46],
            [38, 46],
            [31, 35],
        ]
            .map(([x, y], k) => E(x, y, 4, 3, '#3a1f12', k * 20, 1.4) + L(`M${x - 2} ${y} Q${x} ${y - 1} ${x + 2} ${y}`, 0.8, '#8b5a3a'))
            .join(''),
    lycheeSorbet: coupe(scoop(24, 26, 10, '#fbf0f2') + scoop(40, 26, 10, '#fbe6ea'), C(48, 12, 6, '#d9364b', 1.6) + FC(46, 10, 1, '#fff', 0.7)),
    lycheeCocktail: tallGlass('#f6d6dc', C(52, 10, 5, '#d9364b', 1.6) + lemonSlice(14, 10, 4.5), '#fff6f8'),
    bubbleTea: tallGlass('#d8b08a', '', '#f6e6d0', '#3f6fb5') + [24, 30, 36, 40, 27, 33].map((x, k) => FC(x, k < 4 ? 54 : 50, 2.2, '#3a2618')).join(''),
    // ---------------- truffe ----------------
    truffleOmelette:
        plate(46) +
        P('M10 42 Q14 30 32 30 Q50 30 54 42 Q32 50 10 42Z', '#f6d24a') +
        L('M14 40 Q32 46 50 40', 1.4, '#e0b02a') +
        [22, 30, 38, 44].map((x, k) => FC(x, 36 + (k % 2) * 2, 1.4, '#3a2a2a')).join('') +
        truffleBit(46, 30, 4),
    truffleBrie: wheel({
        rind: '#f7f3ea',
        rindD: '#d8d0c2',
        side: '#efe8d8',
        paste: '#fbf3d0',
        pasteD: '#efe0a8',
        extra: L('M14 30 Q32 33 50 30', 2.6, '#3a2a2a') + truffleBit(46, 14, 4),
    }),
    truffleOil: oil('#e8c84a', 'truffle', '#3a2a2a'),
    // ---------------- safran ----------------
    saffronRisotto:
        plate(46) +
        P('M10 44 Q12 32 32 31 Q52 32 54 44 Q32 50 10 44Z', '#f6c24a') +
        [18, 24, 30, 36, 42, 46, 27, 38].map((x, k) => E(x, k < 6 ? 40 : 34, 2.2, 1.2, '#fff3c0', 30, 0.8)).join('') +
        saffronThreads(30, 36) +
        saffronThreads(40, 38) +
        steamF,
    paella:
        SHADOW(32, 58, 28, 3) +
        R(0, 40, 8, 4, 2, '#3a3a3a', 1.6) +
        R(56, 40, 8, 4, 2, '#3a3a3a', 1.6) +
        E(32, 44, 26, 10, '#3a3a40') +
        E(32, 42, 23, 8, '#f6c24a', 0, 1.4) +
        shrimpMini(22, 40, 0.9) +
        shrimpMini(40, 42, 0.9, 30) +
        [18, 30, 46, 34].map((x, k) => R(x - 2, 39 + (k % 2) * 3, 5, 3, 1, '#e2412f', 1)).join('') +
        [26, 44, 36].map((x, k) => FC(x, 44 - (k % 2) * 4, 1.6, '#5fb43a')).join('') +
        lemonSlice(50, 36, 4),
    saffronBrioche:
        plate(50) +
        P('M12 46 Q10 30 22 28 Q24 18 32 18 Q40 18 42 28 Q54 30 52 46 Q32 52 12 46Z', '#f2b22a') +
        C(32, 22, 6, '#f2b22a') +
        HL(20, 34, 3, 6, -20, 0.5) +
        saffronThreads(28, 38) +
        FC(40, 36, 1.2, '#fff8e0'),
    // ---------------- génépi et tiaré ----------------
    genepiTea: items.genepi ? sub('genepi', 40, 4, 22) + cupTea('#e8d88a') : cupTea('#e8d88a'),
    genepiChoc:
        SHADOW(32, 58, 24, 3) +
        R(8, 22, 48, 32, 3, '#5e3a1e') +
        [14, 26, 38].map(x => [26, 38].map(y => R(x, y, 10, 10, 1.6, '#7a4a2a', 1.2)).join('')).join('') +
        P('M8 22 L56 22 L56 34 L40 30 L30 36 L18 30 L8 34Z', '#f2e6c0', 2) +
        sub('genepi', 38, 2, 22),
    tiarePerfume: flacon('drop', '#fff6d8', R(27, 14, 10, 9, 2, '#f2c23a'), sub('tiare', 24, 38, 16)),
    tiareCrown:
        SHADOW(32, 56, 24, 3) +
        E(32, 40, 24, 10, 'none', 0, 3.4) +
        E(32, 40, 24, 10, 'none', 0, 1.4) +
        [0, 45, 90, 135, 180, 225, 270, 315]
            .map(a => {
                const x = 32 + 24 * Math.cos((a * Math.PI) / 180),
                    y = 40 + 10 * Math.sin((a * Math.PI) / 180);
                return (
                    [0, 72, 144, 216, 288].map(b => `<g transform="translate(${x} ${y}) rotate(${b})">${E(0, -3.4, 2, 3.4, '#fff', 0, 1)}</g>`).join('') +
                    FC(x, y, 1.4, '#ffd23f')
                );
            })
            .join(''),
    // ---------------- œufs et laits ----------------
    goosePasta:
        plate(46) +
        L('M14 42 Q22 34 30 42 Q38 50 46 40 M16 38 Q26 30 34 38 Q42 46 50 36 M12 46 Q22 40 32 46 Q42 50 50 44', 3.4) +
        L('M14 42 Q22 34 30 42 Q38 50 46 40 M16 38 Q26 30 34 38 Q42 46 50 36 M12 46 Q22 40 32 46 Q42 50 50 44', 1.8, '#f6d06a') +
        E(46, 26, 6, 8, '#fffaf0', 0, 1.8),
    cremeAnglaise:
        SHADOW(32, 58, 20, 3) +
        P('M10 24 L46 24 L44 52 Q44 56 40 56 L16 56 Q12 56 12 52Z', '#ffffff') +
        F('M11.4 30 L44.6 30 L43 52 Q43 54.6 40 54.6 L16 54.6 Q13 54.6 13 52Z', '#f8e6a0', 0.9) +
        P('M10 24 L46 24 L44 52 Q44 56 40 56 L16 56 Q12 56 12 52Z', 'none') +
        L('M46 30 Q56 32 54 42 Q52 48 45 46', 2.4) +
        P('M10 24 L4 22 L10 28Z', '#ffffff', 1.6) +
        L('M30 22 L44 4', 3, '#3a2618') +
        L('M30 22 L44 4', 1.6, '#dfe6ec') +
        L('M34 20 Q40 16 46 20', 1.2, '#2a1a10'),
    truffleTagliatelle:
        plate(46) +
        L('M14 42 Q22 36 30 42 Q38 48 48 40 M16 38 Q26 32 34 38 Q42 44 50 36', 4) +
        L('M14 42 Q22 36 30 42 Q38 48 48 40 M16 38 Q26 32 34 38 Q42 44 50 36', 2.2, '#f2c23a') +
        [20, 32, 44, 26, 38].map((x, k) => FE(x, k < 3 ? 38 : 42, 2.6, 1.6, '#3a2a2a', 1, k * 20)).join('') +
        truffleBit(48, 28, 4.4),
    burrata:
        plate(46) +
        C(32, 36, 13, '#fffdf6') +
        P('M24 26 Q32 20 40 26 Q34 24 32 28 Q30 24 24 26Z', '#f2ece0', 1.4) +
        P('M32 40 Q38 38 40 44 Q34 48 28 44 Q28 40 32 40Z', '#fff6e0', 1.2) +
        leaf(16, 40, 7, -150, '#4caf50', 0.5) +
        C(48, 40, 4, '#e2412f', 1.4) +
        HL(26, 30, 2.6, 4, -20, 0.6),
    ricotta:
        SHADOW(32, 58, 22, 3) +
        P('M14 28 L50 28 L46 54 L18 54Z', '#e8d8b0') +
        L('M18 32 L46 32 M17 38 L47 38 M17 44 L47 44 M18 50 L46 50 M22 28 L22 54 M30 28 L30 54 M38 28 L38 54', 1, '#c8b48a') +
        P('M14 28 L50 28 L46 54 L18 54Z', 'none') +
        P('M14 28 Q14 16 32 16 Q50 16 50 28Z', '#fffdf6') +
        [22, 30, 38, 26, 36].map((x, k) => FC(x, k < 3 ? 22 : 26, 1.2, '#efe8d8')).join(''),
    donkeyShampoo: flacon('tall', '#f6f2ea', R(27, 14, 10, 9, 2, '#b58ad6'), sub('lavender', 24, 38, 16)),
    // ---------------- fibres ----------------
    cottonThread:
        SHADOW(32, 58, 22, 3) +
        [18, 34, 48]
            .map(
                (x, k) =>
                    R(x - 6, 26 + (k % 2) * 4, 12, 4, 1, '#c08b52', 1.6) +
                    R(x - 5, 30 + (k % 2) * 4, 10, 16, 1, ['#f7f3ea', '#e8364b', '#5aa9e6'][k], 1.6) +
                    L(
                        `M${x - 5} ${34 + (k % 2) * 4} L${x + 5} ${34 + (k % 2) * 4} M${x - 5} ${40 + (k % 2) * 4} L${x + 5} ${40 + (k % 2) * 4}`,
                        0.8,
                        'rgba(58,38,24,.3)',
                    ) +
                    R(x - 6, 46 + (k % 2) * 4, 12, 4, 1, '#c08b52', 1.6),
            )
            .join(''),
    teaTowel: fabric('#f7f3ea', '#c8453a', L('M8 36 L56 36 M8 40 L56 40', 1.4, '#c8453a') + C(32, 46, 3, '#5aa9e6', 1) + leaf(34, 46, 4, -20, '#6cc04a', 0.5)),
    linseedOil: oil('#d8c06a', 'flax', '#5aa9e6'),
    woolSocks:
        SHADOW(32, 58, 24, 3) +
        [18, 42]
            .map(
                (x, k) =>
                    `<g transform="rotate(${k ? 10 : -10} ${x} 34)">` +
                    P(
                        `M${x - 7} 10 L${x + 7} 10 L${x + 7} 40 Q${x + 7} 48 ${x + 16} 50 Q${x + 18} 56 ${x + 10} 56 L${x} 56 Q${x - 8} 56 ${x - 7} 46Z`,
                        k ? '#5aa9e6' : '#e8364b',
                    ) +
                    L(`M${x - 7} 16 L${x + 7} 16 M${x - 7} 20 L${x + 7} 20`, 1.4, '#fff') +
                    '</g>',
            )
            .join(''),
    featherDuster:
        SHADOW(32, 60, 14, 2) +
        L('M34 60 L32 30', 4.4) +
        L('M34 60 L32 30', 2.4, '#c08b52') +
        [-50, -30, -10, 10, 30, 50]
            .map(
                (a, k) =>
                    `<g transform="rotate(${a} 32 30)">` +
                    P('M32 30 Q26 18 32 4 Q38 18 32 30Z', k % 2 ? '#f7f3ea' : '#c8b48a', 1.4) +
                    L('M32 28 L32 8', 0.8, 'rgba(58,38,24,.4)') +
                    '</g>',
            )
            .join(''),
    dreamcatcher:
        C(32, 22, 16, 'none', 3.4) +
        C(32, 22, 16, 'none', 1.6) +
        L('M32 6 L36 22 L32 38 L28 22Z M16 22 L32 18 L48 22 L32 26Z', 1, '#c8a46a') +
        C(32, 22, 2.4, '#5aa9e6', 1) +
        [20, 32, 44]
            .map(
                (x, k) =>
                    L(`M${x} ${36 - Math.abs(k - 1) * 4} L${x} 48`, 1) +
                    `<g transform="translate(${x} 48)">` +
                    P('M0 0 Q-4 6 0 14 Q4 6 0 0Z', k === 1 ? '#3f6fb5' : '#f7f3ea', 1.4) +
                    '</g>',
            )
            .join('') +
        L('M24 44 L22 52 M40 44 L42 52', 2, '#8b5a3a'),
    angoraMittens:
        SHADOW(32, 58, 24, 3) +
        [18, 44]
            .map(
                (x, k) =>
                    P(`M${x - 9} 54 L${x - 9} 26 Q${x - 9} 14 ${x} 14 Q${x + 9} 14 ${x + 9} 26 L${x + 9} 54Z`, '#f6f0f4') +
                    R(x - 10, 46, 20, 8, 3, k ? '#f6a5b5' : '#b58ad6', 1.8) +
                    P(`M${x + (k ? -9 : 9)} 30 Q${x + (k ? -16 : 16)} 30 ${x + (k ? -14 : 14)} 38 L${x + (k ? -9 : 9)} 40`, '#f6f0f4', 2) +
                    FC(x - 3, 24, 1.4, '#fff', 0.8) +
                    FC(x + 3, 32, 1.2, '#fff', 0.8),
            )
            .join(''),
    angoraBlanket: fabric(
        '#f6eef2',
        '#d8c8d0',
        L('M14 26 L14 50 M24 26 L24 52 M34 26 L34 53 M44 26 L44 52 M54 26 L54 50', 1, '#e8d8e0') +
            [12, 20, 28, 36, 44, 52].map(x => L(`M${x} 52 L${x} 58`, 1.6, '#d8c8d0')).join(''),
    ),
    horsehairBrush:
        SHADOW(32, 58, 24, 3) +
        R(8, 30, 48, 12, 6, '#a8693a') +
        L('M12 34 L52 34', 1, '#d9a066') +
        [12, 18, 24, 30, 36, 42, 48].map(x => L(`M${x} 42 L${x - 1} 54 M${x + 3} 42 L${x + 3} 54`, 1.4, '#3a2a2a')).join('') +
        HL(20, 33, 6, 1.2, 0, 0.5),
    plumedHat:
        sub('strawHat', 4, 16, 52) +
        `<g transform="rotate(-30 42 22)">` +
        P('M42 30 Q34 14 42 0 Q50 14 42 30Z', '#2f8f7a', 1.8) +
        C(42, 12, 4, '#3f6fb5', 1.4) +
        C(42, 12, 2, '#f2c23a', 0) +
        L('M42 30 L42 4', 0.8, 'rgba(58,38,24,.5)') +
        '</g>',
    quillPen:
        SHADOW(32, 60, 14, 2) +
        R(20, 42, 24, 16, 3, '#3a2a2a') +
        E(32, 42, 12, 3, '#5a4a4a') +
        `<g transform="rotate(25 32 30)">` +
        P('M32 46 Q22 26 32 2 Q42 26 32 46Z', '#2f8f7a', 1.8) +
        C(32, 14, 4, '#3f6fb5', 1.4) +
        C(32, 14, 2, '#f2c23a', 0) +
        L('M32 46 L32 6', 1, 'rgba(58,38,24,.5)') +
        R(30, 40, 4, 8, 1, '#ffd23f', 1.4) +
        '</g>',
    poncho:
        SHADOW(32, 58, 26, 3) +
        P('M6 50 L22 14 L42 14 L58 50 Q32 58 6 50Z', '#c8a46a') +
        L('M12 40 Q32 46 52 40 M16 32 Q32 38 48 32', 3, '#e8364b') +
        L('M14 44 Q32 50 50 44', 2, '#3f6fb5') +
        E(32, 16, 8, 3, '#8b5a3a') +
        [10, 18, 26, 34, 42, 50].map(x => L(`M${x} ${50 + Math.abs(x - 30) / 8} L${x} ${56 + Math.abs(x - 30) / 8}`, 1.6, '#8b5a3a')).join(''),
    alpacaBlanket: fabric(
        '#e8d8c0',
        '#a8845a',
        L('M8 34 L56 34 M8 40 L56 40', 2.4, '#5aa9e6') + [16, 28, 40, 52].map(x => P(`M${x - 4} 37 L${x} 33 L${x + 4} 37 L${x} 41Z`, '#e8364b', 1)).join(''),
    ),
});

// une tasse fumante
const cupTea = c =>
    SHADOW(32, 58, 22, 3) +
    E(32, 54, 24, 5, '#ffffff') +
    P('M14 32 L50 32 L46 50 Q44 54 40 54 L24 54 Q20 54 18 50Z', '#ffffff') +
    E(32, 32, 18, 4, c) +
    E(32, 32, 18, 4, 'none', 0, 2) +
    L('M50 36 Q58 38 54 46 Q51 49 47 47', 2.4) +
    steamF;

let art = null;
const IDS = Object.keys(ART());
IDS.forEach(k => (items[k] = () => (art = art || ART())[k]));
