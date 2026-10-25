// 1.35 : six animaux de plus. Même cadre que les autres (80 × 80, ombre vers y = 72).
import { C, E, F, FC, FE, HL, L, P, SHADOW, animals } from './kit.js';
import { leg, eye } from './animals.js';

const O = '#3a2618';

// ---- le pigeon biset : gris bleuté, cou irisé, deux barres noires sur l'aile ----
animals.pigeon = () =>
    SHADOW(40, 72, 16, 3) +
    leg('M36 60 L35 69 M32 70 L38 70', '#e87a8a') +
    leg('M45 60 L46 69 M43 70 L49 70', '#e87a8a') +
    P('M16 48 L8 58 L22 56Z', '#7a8696', 2) +
    P('M14 50 Q14 38 28 36 Q36 36 42 38 Q56 38 58 48 Q56 62 38 63 Q20 63 14 50Z', '#9aa6b8') +
    F('M22 54 Q34 62 50 56 Q42 60 30 60 Q24 58 22 54Z', '#c4cbd6', 0.9) +
    P('M24 44 Q34 40 44 46 Q38 56 26 54Z', '#a9b4c4', 1.8) +
    L('M27 44 L32 53 M33 42 L38 52', 2.2, '#4a5260') +
    P('M44 38 Q46 28 54 26 Q62 26 62 34 Q62 40 56 44Z', '#8794a8') +
    FE(54, 40, 7, 3.4, '#6aa88a', 0.85, 30) +
    FE(51, 43, 5, 2.4, '#b878c0', 0.7, 20) +
    P('M60 30 L68 32 L61 35Z', '#e8d8c0', 1.8) +
    C(61, 30, 1.2, '#f2f2f2', 0) +
    eye(57, 29) +
    FC(57, 28, 3.4, '#f6a23a', 0) +
    eye(57, 29) +
    HL(24, 42, 5, 2, -10, 0.5);

// ---- la pintade : grise piquetée de blanc, tête nue bleutée, casque corné, barbillons rouges ----
animals.guinea = () =>
    SHADOW(40, 72, 21, 3.5) +
    leg('M34 62 L33 70 M30 71 L36 71', '#7a6a5a') +
    leg('M46 62 L47 70 M44 71 L50 71', '#7a6a5a') +
    P('M14 46 Q8 56 14 62 Q20 56 22 50Z', '#5a606a', 2) +
    E(34, 50, 22, 15, '#5e6672') +
    [
        [22, 44],
        [28, 40],
        [34, 44],
        [40, 40],
        [46, 44],
        [26, 52],
        [33, 56],
        [40, 52],
        [47, 54],
        [20, 52],
        [36, 48],
        [30, 47],
    ]
        .map(([x, y]) => FC(x, y, 1.9, '#f4f4f0'))
        .join('') +
    P('M48 42 Q50 28 54 22 Q60 20 62 28 Q62 36 58 42Z', '#7a8290') +
    C(58, 22, 6, '#bcd2e8') +
    P('M56 17 Q58 10 62 17Z', '#c8a878', 1.8) +
    P('M62 22 L69 24 L62 27Z', '#d8b878', 1.8) +
    P('M60 26 Q64 32 60 34 Q57 31 59 26Z', '#e2412f', 1.6) +
    eye(58, 21) +
    HL(24, 42, 6, 2, -10, 0.45);

// ---- le faisan : plumage cuivré moucheté, tête verte, joue rouge, collier blanc, longue queue barrée ----
animals.pheasant = () =>
    SHADOW(40, 72, 20, 3) +
    P('M18 52 Q4 54 0 66 Q12 62 24 58Z', '#b8662a', 2) +
    L('M6 62 L12 55 M10 64 L16 57', 1.2, '#6a3a1a') +
    leg('M36 62 L35 70 M32 71 L38 71', '#a89878') +
    leg('M46 62 L47 70 M44 71 L50 71', '#a89878') +
    P('M14 52 Q12 40 28 38 Q38 36 46 40 Q58 42 58 54 Q54 64 36 64 Q18 64 14 52Z', '#c8742a') +
    [
        [24, 46],
        [32, 44],
        [40, 46],
        [28, 54],
        [36, 56],
        [44, 52],
        [20, 52],
    ]
        .map(([x, y]) => FE(x, y, 2.2, 1.6, '#6a3a1a', 0.9, 20))
        .join('') +
    F('M24 58 Q36 64 50 58 Q42 61 32 61 Q27 60 24 58Z', '#8a4a1a', 0.9) +
    P('M44 42 Q46 30 52 26 Q60 24 62 32 Q62 38 56 44Z', '#2f7a58') +
    L('M46 42 Q54 46 60 42', 3, '#fffaf0') +
    E(60, 30, 4, 3.4, '#e2412f', 0, 1.6) +
    P('M62 30 L68 32 L62 35Z', '#e8d8a0', 1.8) +
    eye(58, 28) +
    HL(24, 44, 6, 2, -10, 0.45);

// ---- l'autruche : grand corps noir, plumes blanches de la queue, long cou rose, grosses pattes ----
animals.ostrich = () =>
    SHADOW(40, 74, 22, 3.5) +
    L('M34 56 L33 71 M30 72 L37 72', 7) +
    L('M34 56 L33 71 M30 72 L37 72', 4, '#e8a8a0') +
    L('M46 56 L47 71 M43 72 L50 72', 7) +
    L('M46 56 L47 71 M43 72 L50 72', 4, '#e8a8a0') +
    P('M14 38 Q8 42 10 54 Q14 50 22 52Z', '#f7f3ea', 2) +
    P('M14 40 Q12 32 22 30 Q40 26 52 34 Q60 42 54 54 Q44 64 26 60 Q14 56 14 40Z', '#2a2a30') +
    P('M12 34 Q4 38 8 50 Q16 48 20 40Z', '#f7f3ea', 2) +
    P('M24 40 Q36 34 48 42 Q44 54 28 52Z', '#f7f3ea', 1.8) +
    L('M54 38 Q58 22 58 12', 6) +
    L('M54 38 Q58 22 58 12', 3.2, '#e8a8a0') +
    E(60, 9, 6, 4.6, '#e8a8a0', 8, 2) +
    P('M64 8 L72 10 L64 13Z', '#e8c088', 1.8) +
    eye(60, 8) +
    L('M57 5 L58 1 M60 4 L61 0', 1.2, '#2a2a30') +
    HL(24, 36, 6, 2, -10, 0.4);

// ---- la chèvre angora : toute en boucles blanches, petites cornes, barbiche ; coat 1 = longue, 2 = frisée ----
const MH = '#fbf7ee',
    MHD = '#d8cdb2';
const cloud = (pts, r, w = 2) => pts.map(([x, y, rr]) => C(x, y, rr || r, MH, w)).join('') + pts.map(([x, y, rr]) => FC(x, y, (rr || r) - 0.6, MH)).join('');
animals.mohairGoat = (o = {}) => {
    const long = o.coat === 1,
        curly = o.coat === 2;
    const body = [
        [22, 46],
        [28, 40],
        [36, 38],
        [45, 40],
        [52, 45],
        [52, 52],
        [44, 56],
        [34, 57],
        [26, 55],
        [21, 51],
        [36, 47, 12],
    ];
    const skirt = long
        ? [
              [24, 60, 3.2, 7.5],
              [32, 61, 3.2, 8.5],
              [41, 61, 3.2, 8.5],
              [49, 59, 3.2, 7],
          ]
              .map(([x, y, rx, ry]) => E(x, y, rx, ry, MH, 0, 2))
              .join('')
        : '';
    return (
        SHADOW(38, 73, 22, 3.4) +
        L('M27 56 L27 70 M33 58 L33 70 M45 58 L45 70 M51 56 L51 70', 5, O) +
        L('M27 56 L27 70 M33 58 L33 70 M45 58 L45 70 M51 56 L51 70', 2.6, MH) +
        L('M25.5 70.5 L29 70.5 M31.5 70.5 L35 70.5 M43.5 70.5 L47 70.5 M49.5 70.5 L53 70.5', 3, '#8a6a4a') +
        skirt +
        P('M48 44 C50 38 54 34 58 32 L64 38 C62 44 60 50 58 54Z', MH, 2) +
        cloud([[16, 46, 4]], 4) +
        cloud(body, 7) +
        FE(36, 54, 14, 3.4, MHD, 0.5) +
        HL(30, 43, 5, 2, -10, 0.7) +
        (curly
            ? [
                  [25, 46],
                  [33, 42],
                  [41, 43],
                  [49, 47],
                  [30, 52],
                  [39, 52],
                  [46, 52],
              ]
                  .map(([x, y]) => C(x, y, 2.4, 'none', 1.1))
                  .join('')
            : '') +
        (long
            ? cloud(
                  [
                      [53, 40],
                      [55, 46],
                      [52, 50],
                  ],
                  3.6,
              )
            : '') +
        // la tête : museau court, barbiche, deux cornes en arrière
        L('M58 28 Q52 20 46 22 M63 27 Q60 18 54 16', 4.2) +
        L('M58 28 Q52 20 46 22 M63 27 Q60 18 54 16', 2, '#e8d8b8') +
        E(63, 33, 8, 7, MH, -15, 2) +
        E(70, 37, 4.6, 4, MHD, -15, 2) +
        FC(72, 36, 0.9, O) +
        L('M69 39.5 Q71 40.5 73 39', 1.1) +
        P('M68 41 Q70 49 66 51 Q64 46 65 41Z', MH, 1.6) +
        P('M56 31 Q50 31 50 37 Q56 38 59 34Z', MH, 1.8) +
        cloud(
            [
                [60, 27, 3],
                [64, 26, 3.4],
            ],
            3.2,
            1.8,
        ) +
        eye(64, 32)
    );
};

// ---- le yack : noir-brun, bosse sur le garrot, longue jupe de poils, grandes cornes ; coat 1 = longue, 2 = frisée ----
const YK = '#4a3226',
    YKD = '#2e1e16',
    YKL = '#6a4a38';
animals.yak = (o = {}) => {
    const long = o.coat === 1,
        curly = o.coat === 2;
    return (
        SHADOW(40, 74, 26, 3.6) +
        L('M26 60 L26 71 M34 62 L34 71 M50 62 L50 71 M58 60 L58 71', 7.4, O) +
        L('M26 60 L26 71 M34 62 L34 71 M50 62 L50 71 M58 60 L58 71', 4.2, YKD) +
        P('M12 44 Q6 46 8 62 Q12 56 16 52Z', YK, 2) +
        P('M14 52 Q12 38 26 34 Q36 24 48 30 Q64 32 68 42 Q70 52 62 58 Q52 62 40 62 Q22 62 14 52Z', YK) +
        // la jupe de poils
        P(
            `M14 54 Q16 ${long ? 74 : 68} 22 ${long ? 74 : 66} Q26 ${long ? 70 : 64} 30 ${long ? 76 : 66} Q36 ${long ? 72 : 64} 42 ${long ? 76 : 66} Q48 ${long ? 72 : 64} 54 ${long ? 75 : 66} Q60 ${long ? 72 : 64} 64 ${long ? 70 : 62} L66 54Z`,
            YKD,
            2,
        ) +
        FE(36, 40, 18, 6, YKL, 0.4, -8) +
        (curly
            ? [
                  [22, 46],
                  [30, 42],
                  [40, 40],
                  [50, 42],
                  [58, 46],
                  [28, 54],
                  [40, 54],
                  [52, 54],
              ]
                  .map(([x, y]) => C(x, y, 2.6, 'none', 1.1))
                  .join('')
            : '') +
        L('M24 54 L24 62 M32 56 L32 64 M44 56 L44 64 M54 54 L54 62', 1.4, YKL) +
        // la tête basse et large, cornes qui partent de côté puis remontent
        P('M60 36 Q66 28 74 34 Q78 44 72 54 Q64 56 60 48Z', YK, 2) +
        E(74, 48, 6, 5, '#8a7a6a', -20, 1.8) +
        FC(75.6, 47, 1, O) +
        L('M62 34 Q54 32 52 24 Q52 20 55 19', 4.4) +
        L('M62 34 Q54 32 52 24 Q52 20 55 19', 2.2, '#efe3c4') +
        L('M70 32 Q76 28 77 21 Q76 18 73 18', 4.4) +
        L('M70 32 Q76 28 77 21 Q76 18 73 18', 2.2, '#efe3c4') +
        P('M62 38 Q57 38 57 44 Q62 44 64 41Z', YKD, 1.6) +
        FE(66, 38, 5, 2.4, YKL, 0.5, -10) +
        eye(68, 40) +
        HL(30, 38, 6, 2, -10, 0.35)
    );
};
export const ANIMALS_135_ART = ['pigeon', 'guinea', 'pheasant', 'ostrich', 'mohairGoat', 'yak'];
