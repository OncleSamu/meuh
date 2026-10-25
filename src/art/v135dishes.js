// 1.35 : les plats des nouveaux animaux (36 dessins).
import { C, E, F, FC, G, GD, L, P, R, SHADOW, items, sub } from './kit.js';
import { bowl, jar, plate, steamF, woodBoard, wheel, yarn } from './items2.js';

const O = '#3a2618';
const dots = (list, r = 1.6) => list.map(([x, y, c]) => C(x, y, r, c, 0)).join('');
const herb = (x, y, rot = 0, s = 1) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M0 0 Q-4 -5 0 -9 Q4 -5 0 0Z', G, 1.2) +
    P('M0 0 Q-7 -2 -9 -6 Q-3 -7 0 0Z', GD, 1.2) +
    `</g>`;
const apple = (x, y, r = 5) =>
    C(x, y, r, '#e8364b', 1.6) + FC(x - r * 0.3, y - r * 0.3, r * 0.25, '#fff', 0.6) + L(`M${x} ${y - r} L${x + 1} ${y - r - 2}`, 1.2, '#5e3a1e');
const smokeW = (x = 32) =>
    L(`M${x - 8} 22 Q${x - 12} 17 ${x - 8} 12 M${x} 24 Q${x - 4} 18 ${x} 12 M${x + 8} 22 Q${x + 4} 17 ${x + 8} 12`, 1.6, 'rgba(150,150,150,.85)');
const mush = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` + P('M-5 0 Q-5 -6 0 -6 Q5 -6 5 0Z', '#c8a078', 1.4) + R(-1.6, 0, 3.2, 4, 1, '#f2e6d0', 1.2) + `</g>`;
// un oiseau rôti vu de côté : corps doré, deux pilons qui dépassent
const roast = (x, y, s, skin = '#d8883a', skin2 = '#b8662a') =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    P('M-18 4 Q-26 -2 -22 -10 Q-16 -8 -12 0Z', skin2, 2 / s) +
    P('M18 4 Q26 -2 22 -10 Q16 -8 12 0Z', skin2, 2 / s) +
    P('M-20 2 Q-20 -14 0 -14 Q20 -14 20 2 Q20 14 0 15 Q-20 14 -20 2Z', skin, 2 / s) +
    F('M-12 -8 Q0 -13 12 -8 Q4 -4 -12 -2Z', '#ffe8b0', 0.55) +
    L('M-10 4 Q0 9 10 4', 1.2, skin2) +
    `</g>`;
const egg = (x, y, c, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` + P('M0 -6 C4 -6 6 -1 6 2 C6 5 3 7 0 7 C-3 7 -6 5 -6 2 C-6 -1 -4 -6 0 -6Z', c, 1.5 / s) + `</g>`;
const halfEgg = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` + E(0, 0, 6, 4.4, '#fffdf4', 1.6 / s) + E(0, 0.4, 3, 2.2, '#f6c030', 0) + `</g>`;
const strip = (x, y, rot, c, w = 18) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})">` +
    R(-w / 2, -2.6, w, 5.2, 2.4, c, 1.6) +
    L(`M${-w / 3} 0 L${w / 4} 0`, 0.8, 'rgba(255,255,255,.35)') +
    `</g>`;

const D = {
    // ================= le pigeon =================
    poachedPigeonEggs: () =>
        plate() +
        R(10, 36, 44, 8, 3, '#e8c078', 1.8) +
        [18, 32, 46].map(x => E(x, 34, 7, 4.6, '#fffdf4', 1.8) + FC(x, 33.4, 2.6, '#f6b020')).join('') +
        herb(32, 28, 0, 1.2) +
        dots(
            [
                [22, 30, '#2f8f2e'],
                [42, 30, '#2f8f2e'],
            ],
            1.2,
        ),
    squabPeas: () =>
        plate() +
        roast(32, 36, 0.95) +
        dots(
            [
                [10, 44, '#6cc04a'],
                [14, 48, '#6cc04a'],
                [50, 46, '#6cc04a'],
                [54, 42, '#6cc04a'],
                [48, 50, '#6cc04a'],
                [16, 42, '#6cc04a'],
            ],
            3,
        ) +
        herb(32, 24, 0, 1),
    pigeonPastilla: () =>
        plate() +
        E(32, 38, 22, 11, '#e0a850', 2) +
        E(32, 37, 18, 8, '#f2c870', 0, 1.4) +
        L('M18 33 L46 43 M24 31 L50 41 M46 33 L18 43 M40 31 L14 41', 1.2, '#fffaf0') +
        L('M24 38 L40 38 M32 33 L32 43', 1.4, '#8a5a2a') +
        C(32, 38, 2.4, '#fffaf0', 0),
    pigeonPie: () =>
        plate() +
        P('M10 44 Q10 22 32 22 Q54 22 54 44 Q32 50 10 44Z', '#e0a850', 2) +
        L('M22 26 Q26 40 24 46 M32 24 L32 46 M42 26 Q38 40 40 46', 1.4, '#a8702a') +
        E(32, 26, 6, 2.4, '#f2d890', 0, 1.2) +
        P('M44 30 Q52 28 54 38 Q48 40 44 36Z', '#8a3a2a', 1.8) +
        herb(50, 44, 30),
    smokedSquab: () =>
        woodBoard() +
        `<g transform="translate(18 38) scale(.6)">${roast(0, 0, 1, '#a8702a', '#7a4a1a')}</g>` +
        `<g transform="translate(44 38) scale(.6)">${roast(0, 0, 1, '#a8702a', '#7a4a1a')}</g>` +
        smokeW(32),
    pigeonTerrine: () => jar('#d89080', '#8a5a2a', sub('squab', 22, 33, 20)),
    // ================= la pintade =================
    guineaOmelette: () =>
        plate() +
        P('M8 42 Q10 28 32 28 Q54 28 56 42 Q32 52 8 42Z', '#f6c840', 2) +
        L('M32 29 Q30 40 32 50', 1.6, '#c89a20') +
        F('M14 36 Q24 30 36 31 Q22 34 14 40Z', '#fff3a0', 0.6) +
        herb(44, 34, 20) +
        dots(
            [
                [40, 38, '#2f8f2e'],
                [22, 42, '#2f8f2e'],
            ],
            1.2,
        ),
    guineaMimosa: () =>
        plate() +
        halfEgg(18, 36) +
        halfEgg(32, 34) +
        halfEgg(46, 36) +
        halfEgg(25, 44) +
        halfEgg(39, 44) +
        dots(
            [
                [16, 33, '#f6c030'],
                [34, 31, '#f6c030'],
                [44, 33, '#f6c030'],
                [24, 41, '#f6c030'],
                [40, 41, '#f6c030'],
            ],
            1.4,
        ) +
        herb(32, 28, 0, 1),
    guineaCider: () => plate() + roast(32, 36, 0.95, '#c8783a', '#9a5226') + apple(12, 44) + apple(52, 44) + herb(32, 24),
    guineaCabbage: () =>
        plate() +
        E(22, 38, 11, 8, '#8cc84a', 1.8) +
        E(42, 38, 11, 8, '#8cc84a', 1.8) +
        L('M14 36 Q22 42 30 36 M34 36 Q42 42 50 36', 1.2, '#4a8a2a') +
        R(18, 30, 8, 3, 1.2, '#f0a898', 1.4) +
        R(38, 30, 8, 3, 1.2, '#f0a898', 1.4) +
        L('M18 40 L26 44 M38 40 L46 44', 1.4, '#c8a878'),
    smokedGuinea: () => woodBoard() + `<g transform="translate(32 38) scale(.8)">${roast(0, 0, 1, '#a8702a', '#7a4a1a')}</g>` + smokeW(32),
    guineaRillettes: () => jar('#e0b8a0', '#8a5a2a', sub('guineaFowl', 22, 33, 20)),
    // ================= le faisan =================
    pheasantScramble: () =>
        bowl('#f6d040') +
        steamF +
        dots(
            [
                [18, 28, '#fff3a0'],
                [28, 26, '#fff3a0'],
                [40, 28, '#fff3a0'],
                [48, 27, '#fff3a0'],
            ],
            3,
        ) +
        mush(24, 30) +
        mush(40, 29) +
        herb(33, 24),
    pickledPheasantEggs: () => jar('#e8d890', '#8a5a2a', egg(26, 38, '#a89860', 1.4) + egg(36, 41, '#a89860', 1.2)),
    pheasantApples: () => plate() + roast(32, 36, 0.95, '#c8742a', '#8a4a1a') + apple(11, 44) + apple(53, 44) + apple(53, 34, 4) + herb(32, 24),
    pheasantPate: () =>
        plate() +
        R(10, 30, 44, 16, 4, '#d8a050', 2) +
        R(12, 32, 40, 12, 3, '#b86a5a', 1.6) +
        dots(
            [
                [20, 38, '#f2d8a0'],
                [30, 36, '#6a3a2a'],
                [40, 39, '#f2d8a0'],
                [46, 36, '#6a3a2a'],
            ],
            2.2,
        ) +
        L('M14 30 L50 30', 1.4, '#a8702a') +
        herb(54, 44, 20),
    smokedPheasant: () =>
        woodBoard() +
        P('M2 40 Q8 34 14 38 L18 44Z', '#b8662a', 1.6) +
        `<g transform="translate(34 38) scale(.8)">${roast(0, 0, 1, '#a8702a', '#7a4a1a')}</g>` +
        smokeW(34),
    pheasantTerrine: () => jar('#c07a5a', '#8a5a2a', sub('pheasant', 22, 33, 20)),
    // ================= le yack =================
    yakCheese: () =>
        wheel({
            rind: '#f2ead6',
            rindD: '#c8bca0',
            side: '#e8dfc8',
            paste: '#fbf3d6',
            pasteD: '#efe0b0',
            extra:
                dots(
                    [
                        [20, 28, '#a89878'],
                        [42, 26, '#a89878'],
                    ],
                    1.2,
                ) + FC(14, 30, 1.2, '#4a3226'),
        }),
    yakTomme: () =>
        wheel({
            rind: '#a89a80',
            rindD: '#7a6e58',
            side: '#988a70',
            paste: '#f4e4a8',
            pasteD: '#e8d078',
            extra:
                L('M10 38 Q32 44 54 38', 1.2, '#7a6e58') +
                dots(
                    [
                        [18, 28, '#6a5e48'],
                        [40, 25, '#6a5e48'],
                        [30, 32, '#6a5e48'],
                    ],
                    1.2,
                ),
        }),
    yakYogurt: () => jar('#fffaf0', '#c8a878', sub('yakMilk', 22, 33, 20)) + L('M44 8 L52 -2', 3) + L('M44 8 L52 -2', 1.4, '#e8d8b8'),
    yakStew: () =>
        bowl('#8a4a2a') +
        steamF +
        P('M14 28 Q20 24 26 28 Q20 32 14 28Z', '#6a2a2a', 1.4) +
        P('M32 26 Q38 22 44 26 Q38 30 32 26Z', '#6a2a2a', 1.4) +
        C(28, 31, 3.2, '#f09040', 1.4) +
        C(42, 31, 3.2, '#f09040', 1.4) +
        E(20, 32, 3.4, 2.6, '#f0d078', 1.4) +
        herb(48, 29, 20),
    yakMomos: () =>
        plate() +
        [
            [18, 40],
            [32, 36],
            [46, 40],
            [25, 46],
            [39, 46],
        ]
            .map(
                ([x, y]) =>
                    P(`M${x - 7} ${y + 3} Q${x - 7} ${y - 6} ${x} ${y - 7} Q${x + 7} ${y - 6} ${x + 7} ${y + 3}Z`, '#fbf4e4', 1.8) +
                    L(`M${x - 4} ${y - 4} L${x - 2} ${y} M${x} ${y - 6} L${x} ${y - 1} M${x + 4} ${y - 4} L${x + 2} ${y}`, 1, '#c8b890'),
            )
            .join('') +
        C(54, 34, 4, '#c8402a', 1.6) +
        herb(10, 34, -30),
    driedYak: () => woodBoard() + strip(32, 34, -8, '#6a2a2a') + strip(30, 40, 6, '#7a3030') + strip(36, 46, -4, '#6a2a2a', 20),
    // ================= l'autruche =================
    giantOmelette: () =>
        plate() +
        P('M6 42 Q8 24 32 24 Q56 24 58 42 Q32 54 6 42Z', '#f6c840', 2) +
        L('M32 25 Q30 40 32 52', 1.6, '#c89a20') +
        mush(20, 36, 1.2) +
        mush(44, 36, 1.2) +
        F('M12 34 Q24 28 38 29 Q22 32 12 40Z', '#fff3a0', 0.6) +
        herb(32, 20, 0, 1.2),
    giantPavlova: () =>
        plate() +
        E(32, 40, 24, 9, '#fffaf0', 2) +
        P('M12 38 Q14 22 32 22 Q50 22 52 38 Q32 44 12 38Z', '#fffaf0', 2) +
        L('M18 36 Q20 28 26 26 M30 24 Q36 26 40 28 M46 36 Q44 30 40 28', 1.2, '#e8dcc0') +
        [
            [22, 24],
            [32, 22],
            [42, 25],
            [27, 28],
            [37, 28],
        ]
            .map(([x, y]) => C(x, y, 3, '#4a58b8', 1.4))
            .join('') +
        herb(32, 18, 0, 1),
    ostrichQuiche: () =>
        plate() +
        P('M8 44 L30 24 Q44 22 56 32 L56 44Z', '#e0a850', 2) +
        P('M14 42 L32 28 Q44 26 52 34 L52 42Z', '#f6e090', 0) +
        L('M26 34 L36 42 M38 30 L46 40', 1.2, '#c89a20') +
        R(36, 32, 8, 3, 1.2, '#f0a898', 1.4) +
        dots([[24, 40, '#2f8f2e']], 1.4) +
        E(8, 44, 3, 2, '#c07a2a', 0, 1.4),
    grilledOstrich: () =>
        plate() +
        P('M10 44 Q10 28 32 28 Q54 28 54 40 Q54 48 32 48 Q12 48 10 44Z', '#7a1e30', 2) +
        L('M16 32 L18 46 M26 30 L28 48 M36 30 L38 48 M46 32 L48 46', 1.8, '#3a0e18') +
        R(26, 30, 12, 6, 3, '#fff3a0', 1.6) +
        herb(52, 32, 30) +
        herb(12, 30, -30),
    ostrichCarpaccio: () =>
        plate() +
        [
            [22, 36],
            [34, 34],
            [44, 38],
            [26, 44],
            [38, 44],
        ]
            .map(([x, y]) => E(x, y, 8, 4, '#c8344a', 1.6))
            .join('') +
        L('M24 36 L32 36 M36 44 L42 44', 1, '#f0a898') +
        dots(
            [
                [28, 40, '#fff3c8'],
                [40, 40, '#fff3c8'],
                [34, 38, '#fff3c8'],
                [30, 32, '#fffaf0'],
            ],
            1.6,
        ) +
        C(52, 32, 5, '#f2c23a', 1.6) +
        herb(14, 34, -30),
    driedOstrich: () => woodBoard() + strip(32, 34, 6, '#6a1e2e') + strip(30, 40, -8, '#7a2236') + strip(34, 46, 4, '#6a1e2e', 20),
    // ================= le mohair =================
    mohairYarn: () => yarn('#fbf7ee', '#d8cdb2'),
    dyedMohair: () => yarn('#e8648a', '#b83a62'),
    mohairPlush:
        SHADOW(32, 58, 20, 3) +
        [
            [18, 20, 8],
            [46, 20, 8],
        ]
            .map(([x, y, r]) => C(x, y, r, '#fbf7ee', 2) + FC(x, y, r - 3.4, '#f0a8b0'))
            .join('') +
        [
            [32, 18, 14],
            [32, 44, 15],
        ]
            .map(([x, y, r]) => C(x, y, r, '#fbf7ee', 2))
            .join('') +
        [
            [18, 52, 6],
            [46, 52, 6],
            [14, 38, 6],
            [50, 38, 6],
        ]
            .map(([x, y, r]) => C(x, y, r, '#fbf7ee', 2))
            .join('') +
        FC(32, 18, 13.4, '#fbf7ee') +
        FC(32, 44, 14.4, '#fbf7ee') +
        E(32, 24, 6, 4.4, '#d8cdb2', 0, 1.6) +
        FC(32, 22.6, 1.8, O) +
        L('M32 24.4 L32 27 M29 27.4 Q32 29.6 35 27.4', 1.2) +
        FC(25, 15, 2, O) +
        FC(39, 15, 2, O) +
        L('M23 11 Q25 9.6 27 11 M37 11 Q39 9.6 41 11', 1) +
        R(26, 33, 12, 4, 2, '#e8364b', 1.6),
    mohairScarf:
        SHADOW(32, 58, 26, 3) +
        P('M8 22 Q32 12 56 22 L56 34 Q32 24 8 34Z', '#fbf7ee', 2) +
        P('M8 26 Q32 16 56 26 L56 30 Q32 20 8 30Z', '#f0a8b0', 0) +
        P('M44 28 L54 28 L58 56 L48 56Z', '#fbf7ee', 2) +
        L('M47 36 L56 36 M48 44 L57 44', 3, '#f0a8b0') +
        L('M48 56 L48 60 M52 56 L52 61 M56 56 L56 60', 1.8, '#d8cdb2') +
        L('M14 22 Q20 20 26 22', 1.2, '#d8cdb2'),
    mohairSweater:
        SHADOW(32, 58, 24, 3) +
        P('M20 14 L8 24 L12 36 L20 32 L20 56 L44 56 L44 32 L52 36 L56 24 L44 14 Q32 22 20 14Z', '#fbf7ee', 2) +
        P('M24 14 Q32 22 40 14 Q32 17 24 14Z', '#d8cdb2', 1.4) +
        L('M20 40 L44 40 M20 46 L44 46', 3, '#f0a8b0') +
        [
            [14, 28],
            [50, 28],
            [28, 30],
            [38, 30],
        ]
            .map(([x, y]) => FC(x, y, 1.2, '#d8cdb2'))
            .join('') +
        L('M10 32 L18 30 M46 30 L54 32', 1.2, '#d8cdb2'),
    mohairPlaid:
        SHADOW(32, 58, 26, 3) +
        P('M6 34 Q32 22 58 34 L56 52 Q32 44 8 52Z', '#fbf7ee', 2) +
        L('M6 40 Q32 30 58 40 M7 46 Q32 38 57 46', 3, '#e8a8b0') +
        L('M18 28 Q14 40 16 50 M32 26 Q30 38 32 47 M46 28 Q48 40 46 50', 3, '#e8a8b0') +
        L('M8 52 L8 56 M14 51 L14 56 M20 50 L20 55 M44 50 L44 55 M50 51 L50 56 M56 52 L56 56', 1.4, '#d8cdb2'),
};
Object.assign(items, Object.fromEntries(Object.entries(D).map(([k, v]) => [k, typeof v === 'function' ? v : () => v])));
export const DISHES_135 = Object.keys(D);
