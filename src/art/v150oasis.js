// 1.50 : les trois machines de l'oasis (four en terre, tajine, confiserie orientale) et leurs trente-huit produits.
import { C, E, F, FC, FE, G, GD, HL, L, P, R, SHADOW, items, machines, sack, bottle, sub } from './kit.js';
import { plate, bowl, jar, oil, steamF, woodBoard } from './items2.js';

const CLAY = '#c8743a',
    CLAYD = '#9a5228',
    CLAYL = '#e0975a';
const SEMO = '#f0d48a';
const dots = (list, r = 1.4, c = '#fff8e0') => list.map(([x, y]) => FC(x, y, r, c)).join('');
const seeds = (x, y, n = 6, c = '#f6e8c4') =>
    Array.from({ length: n }, (_, k) => FE(x + ((k * 7) % 13) - 6, y + ((k * 5) % 9) - 4, 1.1, 0.6, c, 1, k * 30)).join('');
const leafy = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` + P('M0 0 Q-5 -3 -4 -8 Q0 -6 0 0Z', G, 1) + P('M0 0 Q5 -3 4 -8 Q0 -6 0 0Z', GD, 1) + `</g>`;

// ---------------- les ustensiles ----------------
// le plat en terre et son couvercle conique
const tajinePot = (lid = CLAY, food = '') =>
    SHADOW(32, 58, 26, 3) +
    E(32, 48, 28, 9, CLAYD, 0, 2.4) +
    E(32, 46, 24, 6, CLAY, 0, 1.6) +
    food +
    P('M12 46 Q20 40 26 22 Q28 12 32 10 Q36 12 38 22 Q44 40 52 46Z', lid, 2.4) +
    L('M16 42 Q32 38 48 42', 1.2, 'rgba(255,255,255,.4)') +
    L('M21 34 Q32 31 43 34', 1.2, 'rgba(58,38,24,.3)') +
    C(32, 9, 3.4, lid, 1.8) +
    HL(24, 32, 2, 6, 20, 0.45);
// le plat ouvert (sans couvercle), avec ce qu'il y a dedans
const openTajine = food =>
    SHADOW(32, 58, 26, 3) + E(32, 46, 28, 10, CLAYD, 0, 2.4) + E(32, 44, 24, 7, CLAY, 0, 1.6) + food + P('M50 40 Q60 30 54 22 Q50 26 48 34Z', CLAYL, 1.6);
// une galette ronde
const flat = (c, extra = '') => SHADOW(32, 56, 26, 3) + E(32, 44, 27, 11, c, 0, 2.4) + E(32, 42, 22, 8, 'rgba(255,255,255,.18)', 0, 0) + extra;
// un plateau en cuivre
const tray = extra => SHADOW(32, 58, 28, 3) + E(32, 48, 29, 10, '#c8862a', 0, 2.4) + E(32, 47, 24, 7, '#e8b04a', 0, 1.4) + extra;
// une petite étiquette à épice
const pot = (fill, lid, ing) => jar(fill, lid, sub(ing, 22, 33, 20));
// un tapis plié
const rug = (a, b, c) =>
    SHADOW(32, 58, 28, 3) +
    R(6, 22, 52, 32, 3, a, 2.4) +
    R(10, 26, 44, 24, 2, b, 1.4) +
    P('M32 28 L44 38 L32 48 L20 38Z', c, 1.4) +
    P('M32 33 L38 38 L32 43 L26 38Z', a, 1) +
    [14, 50].map(x => P(`M${x} 32 L${x + 3} 38 L${x} 44 L${x - 3} 38Z`, c, 1)).join('') +
    L('M8 54 L8 58 M14 54 L14 58 M20 54 L20 58 M26 54 L26 58 M32 54 L32 58 M38 54 L38 58 M44 54 L44 58 M50 54 L50 58 M56 54 L56 58', 1.2, '#e8d6aa');

// ---------------- les produits ----------------
const D = {
    // dans les machines existantes
    semolina: () => sack(SEMO, 'wheat'),
    rasElHanout: () =>
        pot('#c8742a', '#7a3a1e', 'cumin') +
        dots(
            [
                [26, 28],
                [36, 26],
                [30, 24],
                [40, 30],
            ],
            1.2,
            '#e8a03a',
        ),
    harissa: () => pot('#c8261e', '#3a2618', 'pepper'),
    preservedLemon: () => jar('#f0dc6a', '#c8945e', sub('lemon', 22, 33, 20)) + FC(24, 50, 3, '#f6e88a') + FC(38, 46, 3, '#f6e88a'),
    datePaste: () => pot('#7a3a1e', '#c8945e', 'date'),
    jujubeSyrup: () => bottle('#a83a22', 'jujube'),
    bitterMarmalade: () => pot('#e2681a', '#fffaf0', 'bitterOrange'),
    sesameOil: () => oil('#d8a848', 'sesame'),
    tahini: () => pot('#c8a46a', '#7a5a3a', 'sesame'),
    orangeBlossomWater: () =>
        SHADOW(32, 60, 14, 2.6) +
        P('M27 6 L37 6 L37 16 Q48 22 48 36 Q48 58 32 58 Q16 58 16 36 Q16 22 27 16Z', '#eef8ff', 2.2) +
        F('M17.6 36 Q17.6 56.4 32 56.4 Q46.4 56.4 46.4 36Z', '#f6f2e0', 0.95) +
        R(25, 2, 14, 6, 2.4, '#c8945e', 1.8) +
        sub('bitterOrange', 22, 30, 20) +
        F('M20 28 L23 26 L23 48 L20 48Z', '#fff', 0.5),
    camelCheese: () =>
        woodBoard() +
        P('M12 42 Q12 30 32 30 Q52 30 52 42 Q52 48 32 48 Q12 48 12 42Z', '#fbf3dc', 2.2) +
        E(32, 32, 19, 4, '#fffaf0', 0, 1.2) +
        dots(
            [
                [22, 40],
                [36, 42],
                [44, 38],
            ],
            1.3,
            '#e8d6aa',
        ) +
        leafy(46, 30, 0.9),
    smen: () =>
        SHADOW(32, 59, 18, 3) +
        P('M18 26 Q12 40 18 54 Q32 60 46 54 Q52 40 46 26Z', CLAY, 2.4) +
        E(32, 26, 15, 5, CLAYD, 0, 2) +
        E(32, 26, 12, 3.4, '#f2d060', 0, 1.2) +
        L('M16 40 Q32 44 48 40', 1.4, CLAYL) +
        HL(22, 38, 2, 6, 10, 0.4),
    lben: () =>
        SHADOW(32, 59, 13, 2.5) +
        P('M20 14 L44 14 L41 56 Q41 58 39 58 L25 58 Q23 58 23 56Z', '#eef8ff', 2.2) +
        F('M20.8 22 L43.2 22 L40.6 56 L23.4 56Z', '#fbf8f0', 0.95) +
        E(32, 22, 11.2, 2.4, '#ffffff', 0, 1) +
        F('M23 18 L26 18 L27 52 L25 52Z', '#fff', 0.6) +
        sub('camelMilk', 42, 40, 18),
    berberRug: () => rug('#b8302a', '#f4ead6', '#2f4a8a'),
    caravanBlanket: () =>
        SHADOW(32, 58, 26, 3) +
        R(8, 24, 48, 30, 4, '#c8945e', 2.4) +
        L('M8 30 L56 30 M8 36 L56 36 M8 42 L56 42 M8 48 L56 48', 2.4, '#8a5a2e') +
        L('M8 33 L56 33 M8 45 L56 45', 1.4, '#e8c060') +
        P('M44 24 Q58 26 56 40 Q50 32 44 30Z', '#b07a46', 2),

    // le four en terre
    kesra: () =>
        flat(
            '#e8c078',
            dots(
                [
                    [20, 42],
                    [30, 38],
                    [40, 44],
                    [26, 48],
                    [44, 40],
                ],
                1.3,
                '#c8904a',
            ) + L('M12 44 Q32 52 52 44', 1, 'rgba(58,38,24,.25)'),
        ),
    cuminBread: () => flat('#d9a458', seeds(26, 40, 8, '#8a5a2e') + seeds(40, 44, 6, '#8a5a2e') + L('M18 40 L46 40 M20 46 L44 46', 1.2, 'rgba(58,38,24,.3)')),
    msemen: () =>
        SHADOW(32, 56, 24, 3) +
        R(12, 28, 40, 26, 4, '#e8b86a', 2.4) +
        R(14, 24, 36, 26, 4, '#f0c87a', 2) +
        L('M14 37 L50 37 M32 24 L32 50', 1.2, 'rgba(58,38,24,.28)') +
        F('M18 28 L30 28 L30 34 L18 34Z', '#fff', 0.25),
    sesameBread: () =>
        SHADOW(32, 56, 24, 3) +
        P('M8 44 Q8 26 32 24 Q56 26 56 44 Q56 52 32 52 Q8 52 8 44Z', '#d9a458', 2.4) +
        seeds(24, 34, 10) +
        seeds(40, 36, 10) +
        seeds(32, 42, 6),
    dateBread: () =>
        SHADOW(32, 56, 24, 3) +
        P('M10 46 Q10 30 32 28 Q54 30 54 46 Q54 52 32 52 Q10 52 10 46Z', '#c8904a', 2.4) +
        [
            [22, 38],
            [32, 36],
            [42, 39],
            [27, 45],
            [38, 45],
        ]
            .map(([x, y]) => E(x, y, 2.4, 1.6, '#6e2e10', 0, 0.9))
            .join(''),
    batbout: () =>
        SHADOW(32, 56, 26, 3) +
        E(22, 44, 14, 8, '#f0d090', 0, 2.2) +
        E(42, 40, 14, 8, '#e8c078', 0, 2.2) +
        P('M36 40 Q42 34 50 40', 'none', 1.4) +
        F('M34 40 Q42 44 52 40 Q42 38 34 40Z', '#5fa040', 0.9) +
        FC(44, 38, 1.6, '#e2412f'),

    // le tajine
    lemonTajine: () => tajinePot(CLAY, '') + sub('lemon', 4, 38, 16) + sub('olive', 46, 42, 14),
    vegTajine: () =>
        openTajine(
            P('M18 44 L28 36 L30 46Z', '#f08a2a', 1.2) +
                P('M34 36 L44 38 L40 46Z', '#7ab04a', 1.2) +
                C(26, 42, 3, '#f0d060', 1) +
                C(38, 44, 3, '#e2412f', 1) +
                leafy(32, 38, 0.8),
        ),
    couscous: () =>
        plate(48) +
        P('M10 46 Q14 22 32 20 Q50 22 54 46Z', SEMO, 2.2) +
        dots(
            [
                [20, 36],
                [26, 30],
                [34, 26],
                [40, 32],
                [46, 40],
                [16, 42],
                [30, 38],
                [38, 42],
            ],
            1,
            '#e0b860',
        ) +
        P('M22 26 L28 16 L34 26Z', '#f08a2a', 1.4) +
        P('M34 24 L44 20 L42 30Z', '#7ab04a', 1.4) +
        C(18, 40, 3.2, '#e8c890', 1.2) +
        C(46, 40, 3.2, '#e8c890', 1.2),
    chakchouka: () =>
        SHADOW(32, 58, 26, 3) +
        L('M54 40 L62 34', 4.4) +
        L('M54 40 L62 34', 2, '#5e3a1e') +
        E(30, 44, 26, 10, '#3a3a3a', 0, 2.4) +
        E(30, 42, 22, 7, '#c8301e', 0, 1.2) +
        [
            [20, 42],
            [36, 40],
        ]
            .map(([x, y]) => E(x, y, 6, 3.6, '#fff', 0, 1.2) + C(x, y, 2.2, '#f2b22a', 1))
            .join('') +
        leafy(30, 46, 0.7),
    harira: () =>
        bowl('#c8501e', 30, '#2f4a8a') +
        dots(
            [
                [22, 30],
                [30, 28],
                [40, 31],
                [34, 32],
            ],
            1.8,
            '#e8c890',
        ) +
        leafy(26, 30, 0.7) +
        steamF,
    keftas: () =>
        plate(48) +
        [0, 1].map(k => L(`M10 ${42 - k * 8} L54 ${38 - k * 8}`, 1.6, '#8b5a2b')).join('') +
        [16, 26, 36, 46].map((x, k) => C(x, 41 - k + 0, 4.4, '#8a4a2a', 1.4) + C(x + 2, 33 - k, 4.4, '#9a5a3a', 1.4)).join('') +
        leafy(48, 46, 0.8),
    dateTajine: () =>
        openTajine(
            P('M16 44 Q22 36 32 38 Q40 36 46 44 Q32 50 16 44Z', '#8a4a2a', 1.4) +
                [
                    [22, 40],
                    [36, 40],
                    [30, 44],
                ]
                    .map(([x, y]) => E(x, y, 3, 2, '#6e2e10', 0, 1))
                    .join('') +
                dots(
                    [
                        [26, 38],
                        [40, 42],
                    ],
                    1.4,
                    '#f6e8c4',
                ),
        ),
    camelCouscous: () =>
        bowl(SEMO, 32, '#c8945e') +
        dots(
            [
                [22, 32],
                [30, 30],
                [40, 33],
            ],
            1,
            '#e0b860',
        ) +
        E(32, 31, 8, 2.4, '#fffaf0', 0, 1) +
        sub('date', 36, 18, 18),

    // la confiserie orientale
    gazelleHorns: () =>
        tray(
            [
                [20, 42, -20],
                [34, 40, 10],
                [44, 46, -10],
                [26, 50, 20],
            ]
                .map(
                    ([x, y, r]) =>
                        `<g transform="translate(${x} ${y}) rotate(${r})">${P('M-9 2 Q-8 -6 0 -6 Q8 -6 9 2 Q4 -2 0 -2 Q-4 -2 -9 2Z', '#f6e6c0', 1.4)}${FC(0, -4, 1, '#fff')}</g>`,
                )
                .join(''),
        ),
    halva: () =>
        woodBoard() +
        P('M12 44 L20 26 L52 26 L52 44Z', '#d8b878', 2.2) +
        P('M12 44 L20 26 L20 44Z', '#c8a060', 1.4) +
        L('M26 30 L46 30 M26 36 L48 36 M24 41 L50 41', 1, 'rgba(58,38,24,.25)') +
        dots(
            [
                [30, 33],
                [42, 38],
            ],
            1.4,
            '#7cc04a',
        ),
    makrout: () =>
        tray(
            [
                [20, 42],
                [32, 40],
                [44, 42],
                [26, 48],
                [38, 48],
            ]
                .map(
                    ([x, y]) =>
                        P(`M${x - 6} ${y} L${x} ${y - 4} L${x + 6} ${y} L${x} ${y + 4}Z`, '#c8862a', 1.4) + L(`M${x - 3} ${y} L${x + 3} ${y}`, 1.4, '#6e2e10'),
                )
                .join(''),
        ),
    baklava: () =>
        tray(
            [
                [20, 44],
                [32, 40],
                [44, 44],
                [26, 50],
                [38, 50],
            ]
                .map(([x, y]) => P(`M${x - 6} ${y} L${x} ${y - 5} L${x + 6} ${y} L${x} ${y + 5}Z`, '#e8b04a', 1.4) + FC(x, y - 1, 1.8, '#7cc04a'))
                .join(''),
        ),
    chebakia: () =>
        tray(
            [
                [22, 44],
                [36, 42],
                [30, 50],
                [44, 48],
            ]
                .map(
                    ([x, y]) =>
                        [0, 72, 144, 216, 288]
                            .map(a => `<g transform="translate(${x} ${y}) rotate(${a})">${E(0, -3.4, 2.4, 3.4, '#a8541e', 0, 1)}</g>`)
                            .join('') + FC(x, y, 1.6, '#e8b04a'),
                )
                .join('') + seeds(32, 44, 10),
        ),
    nougat: () =>
        woodBoard() +
        R(10, 30, 44, 14, 3, '#fbf3dc', 2.2) +
        L('M10 34 L54 34', 1.2, 'rgba(58,38,24,.2)') +
        [
            [16, 38],
            [26, 37],
            [36, 39],
            [46, 37],
        ]
            .map(([x, y]) => E(x, y, 3, 2, '#d8a868', 0, 1))
            .join('') +
        dots(
            [
                [21, 40],
                [41, 40],
            ],
            1.4,
            '#7cc04a',
        ),
    stuffedDates: () =>
        plate(48) +
        [
            [20, 44, -20],
            [32, 40, 0],
            [44, 44, 20],
        ]
            .map(
                ([x, y, r]) =>
                    `<g transform="translate(${x} ${y}) rotate(${r})">${E(0, 0, 9, 5, '#7a3a1e', 0, 1.6)}${E(0, -1, 6, 2.4, '#f6e6c0', 0, 1)}${FE(-4, 2, 2, 1, '#fff', 0.4)}</g>`,
            )
            .join(''),
    loukoum: () =>
        SHADOW(32, 58, 24, 3) +
        R(10, 36, 44, 20, 3, '#d8b878', 2.2) +
        [
            [16, 30, '#f2a0c8'],
            [28, 30, '#fbf3dc'],
            [40, 30, '#f2a0c8'],
            [22, 22, '#fbf3dc'],
            [34, 22, '#f2a0c8'],
        ]
            .map(([x, y, c]) => R(x - 5, y - 1, 10, 10, 2, c, 1.6) + FC(x - 2, y + 2, 0.8, '#fff') + FC(x + 2, y + 5, 0.8, '#fff'))
            .join(''),
    honeyJujubes: () => jar('#e8a03a', '#a83a22', sub('jujube', 22, 33, 20)) + FC(26, 50, 2.6, '#a83a22') + FC(38, 52, 2.6, '#a83a22'),
};
Object.assign(items, D);

// ---------------- les trois machines ----------------
Object.assign(machines, {
    // le four en terre : un dôme d'argile, une bouche où rougeoie le feu, une galette à la pelle
    earthOven: () =>
        SHADOW(32, 60, 28, 3) +
        R(6, 50, 52, 8, 2, '#a8784a', 2) +
        P('M10 52 Q10 14 32 12 Q54 14 54 52Z', CLAY, 2.6) +
        L('M16 30 Q32 24 48 30 M14 40 Q32 34 50 40', 1.2, CLAYL) +
        P('M22 52 Q22 36 32 36 Q42 36 42 52Z', '#3a2618', 2) +
        P('M25 52 Q28 44 32 46 Q34 40 38 46 Q40 48 39 52Z', '#ffa630', 1.2) +
        F('M29 52 Q31 48 33 50 Q35 47 36 52Z', '#ffd23f') +
        R(28, 6, 8, 8, 2, CLAYD, 1.8) +
        L('M32 6 Q28 2 32 -2', 1.6, 'rgba(255,255,255,.8)') +
        HL(20, 22, 3, 7, 20, 0.35),
    // le tajine : un grand plat sur son brasero de terre
    tajine: () =>
        SHADOW(32, 61, 26, 3) +
        P('M16 46 L48 46 L44 60 L20 60Z', '#8a5a2e', 2.2) +
        E(32, 46, 16, 4, '#3a2618', 0, 1.8) +
        FC(26, 46, 2, '#ffa630') +
        FC(36, 46, 2, '#e8501e') +
        `<g transform="translate(4 -10) scale(.88)">${tajinePot('#c8501e')}</g>` +
        steamF.replace(/M24 12/, 'M24 8'),
    // la confiserie orientale : une échoppe à arche, un plateau étagé de pâtisseries
    orientalSweets: () =>
        SHADOW(32, 60, 28, 3) +
        R(6, 18, 52, 40, 3, '#f0dcae', 2.4) +
        P('M14 58 L14 34 Q14 22 32 22 Q50 22 50 34 L50 58Z', '#2f4a8a', 2.2) +
        P('M18 58 L18 36 Q18 26 32 26 Q46 26 46 36 L46 58Z', '#fbf3dc', 1.6) +
        L('M32 30 L32 52', 1.6, '#c8862a') +
        E(32, 52, 12, 3, '#c8862a', 0, 1.6) +
        E(32, 41, 9, 2.4, '#c8862a', 0, 1.4) +
        dots(
            [
                [26, 50],
                [32, 49],
                [38, 50],
            ],
            2,
            '#e8b04a',
        ) +
        dots(
            [
                [28, 39],
                [36, 39],
            ],
            1.8,
            '#7cc04a',
        ) +
        P('M4 18 L60 18 L56 10 L8 10Z', '#c8302a', 2) +
        [12, 22, 32, 42, 52].map(x => FC(x, 14, 1.4, '#ffd23f')).join(''),
});

export const OASIS_DISHES = Object.keys(D);
export { tajinePot };
