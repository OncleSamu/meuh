// 1.53 : la cuisine du Grand Nord : les trois machines (poêle-four, chaudron de la taïga, sucrerie de baies) et leurs produits.
import { C, E, F, FC, FE, HL, L, P, R, SHADOW, items, machines, sack, bottle, sub } from './kit.js';
import { plate, bowl, jar, oil, steamF, woodBoard, wheel, scoop } from './items2.js';

const RYE = '#6b4a2e',
    RYED = '#4a3020',
    CRUST = '#c88a4a',
    CRUSTD = '#9a6428',
    CREAM = '#fbf3dc',
    SNOW = '#f2f7fb';
const dots = (list, r = 1.4, c = '#fff8e0') => list.map(([x, y]) => FC(x, y, r, c)).join('');
const berries = (list, r, c, d) => list.map(([x, y]) => C(x, y, r, c, 1.2) + FC(x - r * 0.3, y - r * 0.3, r * 0.25, '#fff', 0.6)).join('') + (d || '');
const pot = (fill, lid, ing) => jar(fill, lid, sub(ing, 22, 33, 20));
// un pain rond, vu de dessus et un peu de côté
const round = (c, d, extra = '') =>
    SHADOW(32, 56, 26, 3) + E(32, 46, 27, 10, d, 0, 2.4) + E(32, 42, 27, 11, c, 0, 2.4) + E(32, 40, 21, 7, 'rgba(255,255,255,.14)', 0, 0) + extra;
// un pain long
const loaf = (c, d, extra = '') =>
    SHADOW(32, 57, 27, 3) +
    P('M6 44 Q6 28 32 27 Q58 28 58 44 Q58 53 32 54 Q6 53 6 44Z', c) +
    F('M8 46 Q32 54 56 46 Q54 52 32 53 Q10 52 8 46Z', d, 0.55) +
    extra +
    HL(18, 34, 6, 2.2, -10, 0.4);
const slash = (n = 3) =>
    Array.from({ length: n }, (_, k) => L(`M${18 + k * 11} 33 Q${22 + k * 11} 38 ${19 + k * 11} 44`, 1.8, 'rgba(255,255,255,.55)')).join('');
const seedsOn = (list, c = '#f6e8c4') => list.map(([x, y], k) => FE(x, y, 1.5, 0.8, c, 1, k * 40)).join('');
// un bol de soupe fumant
const soup = (fill, extra = '') => bowl(fill) + extra + steamF;

const D = {
    // dans les machines existantes
    ryeFlour: () => sack('#a89478', 'rye'),
    seaBuckthornOil: () => oil('#f0902a', 'seaBuckthorn'),
    reindeerCheese: () => wheel({ rind: '#efe3c4', rindD: '#cdb98c', side: '#e0d0a4', paste: '#fbf3dc', pasteD: '#e8d9aa' }),
    grilledCheese: () =>
        SHADOW(32, 56, 26, 3) +
        R(8, 34, 48, 20, 6, '#f3e4b8', 2.4) +
        R(8, 30, 48, 14, 6, '#fbf0cc', 2.4) +
        L('M16 32 L22 42 M26 32 L32 42 M36 32 L42 42 M46 32 L50 40', 2, '#a8662a') +
        berries(
            [
                [24, 24],
                [34, 22],
                [44, 25],
            ],
            4,
            '#f0a02a',
        ),
    reindeerKefir: () => bottle('#fffdf4', 'reindeerMilk', '#eef8ff', '#8a7a68'),
    cloudberryLiqueur: () => bottle('#e8902a', 'cloudberry', '#eef8ff', '#a83a22'),
    rowanSpirit: () => bottle('#f0efe8', 'rowan', '#eef8ff', '#d8501e'),
    qiviutScarf: () =>
        SHADOW(32, 58, 26, 3) +
        R(6, 24, 52, 24, 6, '#9a8068', 2.4) +
        [14, 26, 38, 50].map(x => L(`M${x} 26 L${x} 46`, 3, '#e6d8bf')).join('') +
        L('M8 30 Q32 34 56 30', 1.2, 'rgba(255,255,255,.35)') +
        [10, 18, 26, 34, 42, 50].map(x => L(`M${x} 48 L${x} 56`, 1.8, '#9a8068')).join(''),
    qiviutHat: () =>
        SHADOW(32, 58, 22, 3) +
        P('M12 46 Q10 20 32 20 Q54 20 52 46Z', '#9a8068', 2.4) +
        R(10, 40, 44, 14, 6, '#e6d8bf', 2.2) +
        L('M12 45 L52 45 M12 50 L52 50', 1, '#9a8068') +
        C(32, 17, 6, '#e6d8bf', 1.8) +
        HL(24, 30, 2, 7, 20, 0.35),
    qiviutBlanket: () =>
        SHADOW(32, 58, 28, 3) +
        R(6, 22, 52, 32, 4, '#7a6450', 2.4) +
        R(10, 26, 44, 24, 2, '#a8927a', 1.4) +
        P('M32 28 L44 38 L32 48 L20 38Z', '#e6d8bf', 1.4) +
        P('M32 33 L38 38 L32 43 L26 38Z', '#7a6450', 1) +
        [14, 50].map(x => P(`M${x} 32 L${x + 3} 38 L${x} 44 L${x - 3} 38Z`, '#e6d8bf', 1)).join(''),
    antlerCarving: () =>
        woodBoard() + `<g transform="translate(8 -6) scale(.8)">${items.antler()}</g>` + L('M22 40 Q28 36 34 40 M26 44 Q32 40 38 44', 1, '#7a5a30'),
    antlerKnife: () =>
        SHADOW(32, 58, 26, 3) +
        P('M30 36 L58 26 L56 36 L30 42Z', '#d6dce2', 2.2) +
        L('M32 38 L54 31', 1, '#fff') +
        P('M6 38 Q8 32 14 32 L32 36 L32 44 L14 46 Q8 46 6 38Z', '#dcc9a0', 2.4) +
        L('M12 38 L28 40', 1.2, '#b89c6c') +
        L('M8 42 Q4 48 8 52', 2.6, '#dcc9a0'),
    antlerPendant: () =>
        SHADOW(32, 58, 22, 3) +
        L('M14 8 Q14 32 32 38 Q50 32 50 8', 2, '#8a5a30') +
        C(32, 42, 11, '#dcc9a0', 2.4) +
        C(32, 42, 7, '#efe1bd', 1.2) +
        L('M28 40 Q32 36 36 40 M28 45 Q32 41 36 45', 1.2, '#a8884a') +
        HL(27, 36, 3, 1.4, -30, 0.6),
    spruceSyrup: () => bottle('#c0a844', 'spruce', '#eef8ff', '#2f6a4a'),
    gravlax: () =>
        woodBoard() +
        [0, 1, 2]
            .map(
                k =>
                    P(`M${6 + k * 19} 44 Q${14 + k * 19} 24 ${22 + k * 19} 44 Q${14 + k * 19} 51 ${6 + k * 19} 44Z`, '#f08a5a', 2) +
                    L(`M${10 + k * 19} 41 Q${14 + k * 19} 33 ${19 + k * 19} 41`, 1.2, '#fbd0b0'),
            )
            .join('') +
        [
            [14, 28, -20],
            [33, 26, 10],
            [52, 28, 25],
        ]
            .map(
                ([x, y, r]) =>
                    `<g transform="rotate(${r} ${x} ${y})">${L(`M${x} ${y} L${x} ${y - 7} M${x - 3} ${y - 4} L${x} ${y - 7} L${x + 3} ${y - 4}`, 1.4, '#2f6a4a')}</g>`,
            )
            .join(''),
    cloudberryIce: () =>
        SHADOW(32, 60, 14, 2.6) +
        P('M22 34 L42 34 L32 58Z', '#d9913d', 2.2) +
        L('M25 38 L36 40 M28 46 L38 46', 1, '#a8662a') +
        scoop(32, 26, 11, '#f0b030') +
        scoop(32, 17, 8, '#fbe6a0') +
        dots(
            [
                [28, 24],
                [37, 28],
                [31, 14],
            ],
            1.3,
            '#c8602a',
        ),
    ptarmiganPasta: () =>
        plate() +
        [24, 34, 44].map(x => E(x, 42, 6, 3.4, '#f0dc9a', 0, 1.8) + L(`M${x - 4} 42 Q${x} 39 ${x + 4} 42`, 1, '#c8a050')).join('') +
        FE(32, 36, 3.4, 4.4, '#e6d6a8', 1, 0) +
        dots(
            [
                [31, 35],
                [34, 37],
            ],
            0.9,
            '#8a5a30',
        ),
    // le poêle-four
    ryeBread: () => loaf(RYE, RYED, slash()),
    karelianPie: () =>
        SHADOW(32, 56, 26, 3) +
        E(32, 44, 27, 12, CRUST, 0, 2.4) +
        E(32, 42, 18, 7, '#f6ecc8', 0, 1.8) +
        dots(
            [
                [26, 41],
                [32, 39],
                [38, 42],
                [30, 44],
                [35, 44],
            ],
            1.2,
            '#e8d6a8',
        ) +
        E(32, 42, 24, 9, 'none', 0, 0) +
        L('M8 42 Q10 38 12 42 M14 38 Q16 34 18 38 M46 38 Q48 34 50 38 M52 42 Q54 38 56 42', 1.4, CRUSTD) +
        P('M26 40 L38 40 L36 44 L28 44Z', '#f8e060', 0),
    pulla: () =>
        loaf('#d8963c', CRUSTD) +
        L('M14 38 Q22 30 30 38 Q38 46 46 38 M16 44 Q24 36 32 44 Q40 52 48 44', 3.2, '#e8b25a') +
        dots(
            [
                [16, 36],
                [26, 34],
                [38, 38],
                [46, 40],
                [22, 44],
                [34, 46],
            ],
            1.3,
            '#fffaf0',
        ),
    seedRye: () =>
        loaf(RYE, RYED) +
        seedsOn(
            [
                [16, 36],
                [24, 32],
                [32, 36],
                [40, 32],
                [48, 38],
                [20, 44],
                [30, 42],
                [40, 44],
            ],
            '#f0d44a',
        ) +
        seedsOn(
            [
                [26, 38],
                [36, 40],
                [44, 36],
            ],
            '#fffaf0',
        ),
    nordicFlat: () =>
        round(
            '#c8a46a',
            CRUSTD,
            dots(
                [
                    [20, 40],
                    [28, 36],
                    [36, 40],
                    [44, 36],
                    [32, 44],
                    [24, 46],
                    [42, 46],
                ],
                1.3,
                '#7a5428',
            ),
        ),
    lingonPastry: () =>
        SHADOW(32, 56, 26, 3) +
        R(8, 30, 48, 24, 6, '#e0a860', 2.4) +
        R(14, 34, 36, 16, 4, CREAM, 1.6) +
        berries(
            [
                [20, 41],
                [27, 38],
                [34, 42],
                [41, 38],
                [45, 44],
                [24, 46],
                [37, 47],
            ],
            3,
            '#c0243a',
        ),
    cloudberryTart: () =>
        SHADOW(32, 56, 26, 3) +
        P('M6 38 L58 38 L53 51 Q52 54 48 54 L16 54 Q12 54 11 51Z', '#d9913d', 2.2) +
        E(32, 38, 26, 9, '#e7a948', 0, 2.2) +
        E(32, 38, 21, 6.5, '#f0b030', 0, 1.6) +
        berries(
            [
                [22, 38],
                [30, 36],
                [38, 38],
                [44, 37],
                [27, 41],
                [35, 41],
            ],
            3.2,
            '#f0a02a',
        ),
    eggPie: () =>
        round(
            '#d8a050',
            CRUSTD,
            E(32, 40, 15, 5, '#f4e8c0', 0, 1.6) +
                dots(
                    [
                        [26, 39],
                        [33, 38],
                        [39, 40],
                        [30, 42],
                    ],
                    1.2,
                    '#8a5a30',
                ) +
                L('M10 42 L14 44 M50 42 L54 44', 1.4, CRUSTD),
        ),
    ryeCookies: () =>
        SHADOW(32, 58, 26, 3) +
        [
            [20, 42],
            [42, 42],
            [31, 32],
        ]
            .map(
                ([x, y]) =>
                    C(x, y, 11, '#a8743a', 2.2) +
                    dots(
                        [
                            [x - 4, y - 2],
                            [x + 3, y - 4],
                            [x + 2, y + 4],
                            [x - 3, y + 4],
                        ],
                        1.1,
                        '#f0d44a',
                    ) +
                    HL(x - 3, y - 5, 3, 1.4, -20, 0.4),
            )
            .join(''),
    // le chaudron de la taïga
    salmonSoup: () =>
        soup(
            '#f0a05a',
            P('M24 28 L32 26 L38 30 L30 33Z', '#f08a5a', 1.4) +
                dots(
                    [
                        [40, 30],
                        [20, 31],
                    ],
                    1.5,
                    '#fffaf0',
                ) +
                L('M34 32 L38 28', 1, '#2f6a4a'),
        ),
    mushroomSoup: () =>
        soup(
            '#d8c09a',
            E(26, 30, 5, 2.6, '#a8743a', 0, 1.4) +
                E(38, 29, 4.6, 2.4, '#b88a52', 0, 1.4) +
                dots(
                    [
                        [32, 31],
                        [44, 31],
                    ],
                    1.2,
                    '#7a8a3a',
                ),
        ),
    ryePorridge: () =>
        bowl('#e8d6b0') +
        steamF +
        berries(
            [
                [26, 29],
                [33, 27],
                [40, 30],
            ],
            3,
            '#c0243a',
        ),
    lingonSoup: () =>
        soup(
            '#c0243a',
            L('M20 29 Q32 33 44 29', 1.4, '#f4a0a8') +
                dots(
                    [
                        [27, 28],
                        [38, 30],
                    ],
                    1.4,
                    '#fffaf0',
                ),
        ),
    lingonStew: () =>
        soup('#8a3a2a', E(25, 29, 4, 2.6, '#6a3a22', 0, 1.4) + E(36, 28, 4.4, 2.6, '#6a3a22', 0, 1.4)) +
        berries(
            [
                [30, 31],
                [42, 30],
                [22, 31],
            ],
            2.4,
            '#c0243a',
        ),
    nordicOmelette: () =>
        plate() +
        P('M12 42 Q14 30 32 30 Q50 30 52 42 Q32 50 12 42Z', '#f4d86a', 2.2) +
        L('M16 40 Q32 34 48 40', 1.2, '#e8b83a') +
        dots(
            [
                [24, 38],
                [34, 36],
                [42, 40],
            ],
            1.6,
            '#8a6a3a',
        ) +
        L('M30 34 L32 31 M36 35 L39 33', 1.4, '#2f6a4a'),
    kalakukko: () =>
        SHADOW(32, 56, 27, 3) +
        E(32, 46, 27, 10, RYED, 0, 2.4) +
        E(32, 42, 27, 11, '#8a6238', 0, 2.4) +
        L('M10 42 Q14 37 18 42 M16 36 Q20 31 24 36 M40 36 Q44 31 48 36 M46 42 Q50 37 54 42', 1.6, RYED) +
        E(32, 41, 15, 6, '#a8793e', 0, 1.6) +
        P('M40 40 Q50 32 59 36 Q56 40 54 41 Q60 44 56 47 Q50 44 44 44Z', '#9fb0bc', 2) +
        L('M46 39 L52 37 M47 42 L53 41', 1, '#fff') +
        FC(41, 41, 1.2, '#2a2622'),
    butterPotatoes: () =>
        bowl('#e8d6a0') +
        [
            [22, 29, 5],
            [32, 27, 5.6],
            [42, 29, 5],
        ]
            .map(([x, y, r]) => E(x, y, r, r * 0.7, '#e8c878', 0, 1.6))
            .join('') +
        R(28, 24, 9, 6, 2, '#fbe46a', 1.4) +
        L('M20 30 L22 33 M44 30 L46 33', 1, '#2f6a4a'),
    // la sucrerie de baies
    cloudberryJam: () => pot('#f0902a', '#fffaf0', 'cloudberry'),
    lingonJelly: () => pot('#b8203a', '#fffaf0', 'lingonberry'),
    buckthornLozenges: () =>
        SHADOW(32, 58, 22, 3) +
        R(12, 28, 40, 26, 5, '#e8d6a8', 2.4) +
        R(10, 22, 44, 9, 3, '#f0902a', 2) +
        [
            [20, 42],
            [30, 38],
            [40, 42],
            [26, 48],
            [36, 48],
            [45, 36],
        ]
            .map(([x, y]) => E(x, y, 4, 3, '#f0902a', 0, 1.3))
            .join(''),
    rowanJelly: () => pot('#d8501e', '#fffaf0', 'rowan'),
    cloudberryCream: () =>
        jar('#fbf0cc', '#f0a02a', sub('cloudberry', 22, 33, 20)) +
        berries(
            [
                [26, 14],
                [33, 12],
                [40, 14],
            ],
            3,
            '#f0a02a',
        ),
    berryPaste: () =>
        SHADOW(32, 58, 26, 3) +
        [
            [10, 38, '#a8203a'],
            [30, 38, '#c0402a'],
            [20, 26, '#c0243a'],
            [40, 26, '#a8203a'],
        ]
            .map(([x, y, c]) => R(x, y, 20, 16, 3, c, 1.8) + R(x + 2, y + 2, 7, 3, 1.5, 'rgba(255,255,255,.35)', 0))
            .join('') +
        dots(
            [
                [22, 48],
                [42, 48],
            ],
            1.2,
            '#fffaf0',
        ),
    spruceCandy: () =>
        SHADOW(32, 58, 22, 3) +
        [
            [20, 44],
            [34, 36],
            [44, 46],
            [26, 28],
        ]
            .map(
                ([x, y], k) =>
                    `<g transform="rotate(${k * 30} ${x} ${y})">${P(`M${x - 8} ${y} L${x - 13} ${y - 4} L${x - 13} ${y + 4}Z M${x + 8} ${y} L${x + 13} ${y - 4} L${x + 13} ${y + 4}Z`, '#2f6a4a', 1.4)}${E(x, y, 8, 5.6, '#7cc04a', 0, 1.8)}${L(`M${x - 4} ${y - 2} L${x + 3} ${y + 2}`, 1, '#e8f6c8')}</g>`,
            )
            .join(''),
    buckthornHoney: () =>
        jar('#f0a02a', '#c8862a', sub('seaBuckthorn', 22, 33, 20)) +
        dots(
            [
                [25, 48],
                [38, 50],
            ],
            1.6,
            '#fbd070',
        ),
};
Object.assign(items, D);

// ---------------- les trois machines ----------------
Object.assign(machines, {
    // le poêle-four : une tour de carreaux blancs liserés de bleu, une porte de fonte, un tuyau
    tiledStove: () =>
        SHADOW(32, 60, 26, 3) +
        R(16, 12, 32, 46, 4, SNOW, 2.6) +
        [22, 32, 42].map(y => L(`M16 ${y} L48 ${y}`, 1, '#8ab0d0')).join('') +
        [24, 32, 40].map(x => L(`M${x} 12 L${x} 58`, 1, '#8ab0d0')).join('') +
        R(22, 34, 20, 18, 3, '#3a3a40', 2) +
        P('M25 50 Q28 42 32 44 Q34 38 38 44 Q40 46 39 50Z', '#ffa630', 1) +
        R(26, 6, 12, 8, 2, '#3a3a40', 1.8) +
        L('M32 6 Q28 2 32 -2', 1.6, 'rgba(255,255,255,.8)') +
        HL(20, 24, 3, 8, 15, 0.4),
    // le chaudron de la taïga : un chaudron noir au bout d'une potence, des bûches dessous
    taigaPot: () =>
        SHADOW(32, 61, 26, 3) +
        L('M10 58 L10 8 L40 8', 4, '#5e3a1e') +
        L('M40 8 L40 22', 1.6, '#3a3a40') +
        P('M20 28 Q20 56 40 56 Q60 56 60 28Z', '#3a3a40', 2.4).replace('M20 28', 'M16 30') +
        E(38, 30, 22, 5, '#5a4a40', 0, 2) +
        E(38, 30, 18, 3.4, '#a8662a', 0, 1) +
        L('M16 40 Q38 46 60 40', 1.2, 'rgba(255,255,255,.2)') +
        L('M18 58 L58 58 M22 61 L54 55', 3, '#7a4a22') +
        FC(26, 57, 2.4, '#ffa630') +
        FC(40, 57, 2.6, '#e8501e') +
        steamF.replace(/M24 12/, 'M30 14'),
    // la sucrerie de baies : une grande bassine de cuivre pleine de baies, une louche
    berryKettle: () =>
        SHADOW(32, 61, 26, 3) +
        P('M8 30 Q8 58 32 58 Q56 58 56 30Z', '#c8762a', 2.4) +
        E(32, 30, 24, 6, '#e8a04a', 0, 2.2) +
        E(32, 30, 20, 4, '#8a1a2a', 0, 1.2) +
        berries(
            [
                [22, 29],
                [30, 27],
                [38, 29],
                [28, 32],
                [42, 31],
            ],
            3,
            '#c0243a',
        ) +
        berries([[34, 30]], 2.6, '#f0a02a') +
        L('M12 40 Q32 48 52 40', 1.2, 'rgba(255,255,255,.3)') +
        L('M44 26 L58 10', 2.4, '#8a5a30') +
        E(60, 8, 5, 3.4, '#c8762a', 20, 1.8) +
        HL(16, 40, 2, 8, 15, 0.4) +
        steamF,
});

export const NORD_DISHES = Object.keys(D);
