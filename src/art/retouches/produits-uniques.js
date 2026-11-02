// 1.72 : des dessins à part pour les produits qui se ressemblaient trop (même forme, mêmes couleurs,
// seule une petite pastille changeait). Chacun a maintenant sa silhouette et ses couleurs.
import { items, O, P, C, E, R, L, F, FC, FE, SHADOW, HL, dots, plateB, board } from '../kit.js';

const rad = a => (a * Math.PI) / 180;
const ring = (n, cx, cy, r, f) =>
    Array.from({ length: n }, (_, k) => f(cx + r * Math.cos(rad((360 / n) * k - 90)), cy + r * Math.sin(rad((360 / n) * k - 90)), k)).join('');

// ---------------- les pains ----------------
// pain aux fèves : une boule ronde, entaillée en croix, piquée de fèves vertes
items.favaBread = () =>
    SHADOW(32, 57, 22, 3) +
    P('M10 44 Q8 24 32 20 Q56 24 54 44 Q52 54 32 55 Q12 54 10 44Z', '#c98a3e') +
    L('M22 30 L42 44 M42 30 L22 44', 2.4, '#8b5a2b') +
    HL(20, 30, 3, 6, -30, 0.35) +
    [
        [18, 40],
        [46, 38],
        [32, 26],
        [30, 49],
    ]
        .map(([x, y]) => E(x, y, 3.2, 2, '#7ac04a', 20, 1.3))
        .join('');
// fougasse : une feuille plate et dorée, ajourée, avec des éclats d'échalote
items.shallotFougasse = () =>
    SHADOW(32, 58, 24, 3) +
    P('M32 6 Q52 16 52 36 Q50 54 32 58 Q14 54 12 36 Q12 16 32 6Z', '#e8bf6a') +
    L('M32 12 L32 52', 2, '#b8803a') +
    [
        [22, 22, -35],
        [42, 22, 35],
        [20, 36, -25],
        [44, 36, 25],
        [25, 48, -15],
        [39, 48, 15],
    ]
        .map(([x, y, r]) => E(x, y, 4.5, 1.8, '#fbecc9', r, 1.6))
        .join('') +
    dots(
        [
            [28, 28, '#b06a9a'],
            [37, 42, '#b06a9a'],
            [27, 54, '#b06a9a'],
        ],
        1.6,
    );
// pain d'avoine : un pain long, clair, couvert de flocons
items.oatBread = () =>
    SHADOW(32, 56, 26, 3) +
    P('M6 44 Q6 28 32 26 Q58 28 58 44 Q56 52 32 53 Q8 52 6 44Z', '#e3cfa0') +
    [
        [14, 36],
        [22, 32],
        [30, 31],
        [38, 32],
        [46, 34],
        [18, 42],
        [27, 39],
        [36, 39],
        [45, 41],
        [52, 40],
        [12, 44],
    ]
        .map(([x, y], k) => FE(x, y, 2.4, 1.3, k % 2 ? '#f6ead0' : '#cbb07a', 1, k * 37))
        .join('') +
    HL(16, 33, 4, 1.5, -10, 0.4);
// pain aux graines de chanvre : un pain de mie carré, foncé, couvert de graines vertes
items.hempBread = () =>
    SHADOW(32, 58, 22, 3) +
    R(12, 28, 40, 28, 4, '#8a5a2e') +
    P('M10 30 Q10 14 32 14 Q54 14 54 30Z', '#a8703a') +
    dots(
        [
            [20, 22, '#7f9a4a'],
            [28, 18, '#9ab25e'],
            [36, 19, '#7f9a4a'],
            [44, 23, '#9ab25e'],
            [24, 27, '#9ab25e'],
            [33, 25, '#7f9a4a'],
            [41, 28, '#9ab25e'],
        ],
        1.5,
    ) +
    L('M16 36 L16 52', 1.2, '#6a4220');

// ---------------- les gâteaux ----------------
// gâteau au panais et au miel : un cake rectangulaire, crème, nappé de miel qui coule
items.parsnipCake = () =>
    SHADOW(32, 57, 25, 3) +
    R(8, 30, 48, 24, 4, '#f0dcae') +
    L('M8 42 L56 42', 1.4, '#d8bf86') +
    P(
        'M8 32 Q8 26 14 26 L50 26 Q56 26 56 32 L56 34 Q52 34 52 38 Q50 41 48 38 Q46 34 40 34 Q36 34 35 39 Q33 42 31 39 Q30 34 22 34 Q18 34 17 37 Q15 40 13 37 Q12 34 8 34Z',
        '#f2a516',
        2,
    ) +
    P('M38 22 L48 12 L52 16 L42 25Z', '#f6eedc', 1.6) +
    L('M48 12 L54 8 M50 14 L56 12', 1.4, '#6cc04a');
// gâteau à la mandarine : une couronne (savarin) glacée d'orange, des quartiers dessus
items.mandarinCake = () =>
    plateB() +
    E(32, 40, 22, 10, '#e88a2a') +
    E(32, 34, 22, 10, '#f6a63a') +
    E(32, 34, 7, 3, '#e0d0b0', 0, 1.8) +
    ring(6, 32, 34, 15, (x, y) => E(x, y, 3.2, 1.8, '#ffb24a', 0, 1.2)) +
    HL(20, 30, 4, 1.5, -10, 0.45);
// gâteau de taro : des carrés violets empilés
items.taroCake = () =>
    plateB() +
    R(14, 32, 16, 14, 2, '#a98bd0') +
    R(32, 34, 16, 13, 2, '#9a7ac4') +
    R(22, 20, 16, 14, 2, '#b89ce0') +
    F('M23.5 21.5 L36.5 21.5 L36.5 24 L23.5 24Z', '#fff', 0.35) +
    dots(
        [
            [26, 28, '#7a5aa4'],
            [33, 30, '#7a5aa4'],
            [19, 40, '#7a5aa4'],
            [40, 41, '#7a5aa4'],
        ],
        1,
    );
// gâteau chicorée-noisette : un gâteau rond chocolat, glaçage qui coule, noisettes
items.chicoryCake = () =>
    plateB() +
    R(12, 26, 40, 20, 5, '#6a3e22') +
    E(32, 26, 20, 6, '#4a2814') +
    P('M12 28 Q14 34 16 30 Q19 36 22 30 Q26 35 29 31 Q32 37 35 31 Q39 36 42 30 Q45 35 48 30 Q51 33 52 28Z', '#4a2814', 1.6) +
    dots(
        [
            [24, 24, '#c08b52'],
            [32, 23, '#c08b52'],
            [40, 24, '#c08b52'],
        ],
        2.4,
    ) +
    L('M14 38 L50 38', 1.2, '#8b5a2b');

// ---------------- les tartes et tourtes ----------------
// le plat de la tarte aux pommes (vue de côté, la garniture dessus) : couleur du plat, fond, garniture
const pieDish = (dish, fill, top) =>
    SHADOW(32, 54, 25, 3) +
    P('M6 38 L58 38 L53 50 Q52 53 48 53 L16 53 Q12 53 11 50Z', dish) +
    E(32, 38, 26, 9, '#e7a948') +
    F('M10 38 C14 33 50 33 54 38 C50 42 14 42 10 38Z', fill) +
    top +
    E(32, 38, 26, 9, 'none') +
    HL(18, 35, 4, 1.4, -8, 0.5);
// tatin d'échalotes : retournée sur assiette, caramel ambré, demi-échalotes rosées et du thym
items.shallotTatin = () =>
    SHADOW(32, 55, 26, 3) +
    E(32, 50, 27, 7, '#ffffff') +
    E(32, 49, 20, 4.5, '#eef3f6', 0, 1.4) +
    P('M8 42 Q8 50 32 51 Q56 50 56 42 L56 36 Q32 30 8 36Z', '#8a3e16') +
    E(32, 36, 24, 8, '#b85a1e') +
    [
        [18, 35],
        [28, 33],
        [38, 33],
        [46, 36],
        [24, 39],
        [36, 39],
    ]
        .map(
            ([x, y]) =>
                E(x, y, 5, 3.4, '#c87a9a', -10, 1.4) +
                L(`M${x - 3} ${y} Q${x} ${y - 2} ${x + 3} ${y}`, 0.9, '#f2c0d4') +
                FE(x - 1.5, y - 1.2, 1.6, 0.8, '#ffd88a', 0.8),
        )
        .join('') +
    L('M44 30 L50 26 M46 29 L47 26 M48 28 L50 29', 1.2, '#4f7d33') +
    E(32, 36, 24, 8, 'none', 0, 2);
// tarte aux navets et à l'oignon : plat bleu, crème, rondelles de navet blanc-violet en éventail, lardons
items.turnipBaconTart = () =>
    pieDish(
        '#5a7fae',
        '#f4e6c0',
        [
            [17, 38, -20],
            [25, 36.5, -10],
            [32, 36, 0],
            [39, 36.5, 10],
            [47, 38, 20],
        ]
            .map(([x, y, r]) => E(x, y, 3.8, 2.4, '#fffaf2', r, 1.2) + F(`M${x - 4} ${y - 1} Q${x} ${y - 4} ${x + 4} ${y - 1}`, '#b884d0', 0.85))
            .join('') +
            [
                [21, 40.5],
                [32, 40.5],
                [43, 40.5],
            ]
                .map(([x, y]) => R(x - 2.2, y - 1.3, 4.4, 2.6, 1, '#e88a7a', 1))
                .join(''),
    );
// tarte au butternut : plat vert, garniture orange sous un croisillon doré, feuilles de sauge
items.butternutTart = () =>
    pieDish(
        '#4f8f3a',
        '#f08a2a',
        L('M14 36 L30 44 M24 33 L44 43 M36 32 L52 40 M50 34 L34 43 M40 32 L20 43 M28 32 L13 40', 2.4, '#f6d48a') +
            E(46, 34, 4, 1.8, '#8aa86a', 20, 1.1) +
            E(19, 34, 4, 1.8, '#8aa86a', -20, 1.1),
    );
// tarte aux quetsches : plat brun, demi-quetsches serrées en rangs, sucre glace
items.plumTart = () =>
    pieDish(
        '#7a4a2a',
        '#6a2a7a',
        [
            [14, 37],
            [21, 35],
            [28, 34],
            [36, 34],
            [43, 35],
            [50, 37],
            [18, 40],
            [26, 39],
            [34, 39],
            [42, 39.5],
        ]
            .map(([x, y]) => E(x, y, 3.6, 2.2, '#8a3aa0', -25, 1) + FE(x + 0.8, y + 0.2, 1.6, 1, '#f2c94e', 1, -25))
            .join('') + [20, 30, 40, 46].map(x => FC(x, 36.5, 0.7, '#fff')).join(''),
    );
items.endiveTart = () =>
    SHADOW(32, 55, 27, 3) +
    R(6, 32, 52, 20, 3, '#e3b064') +
    R(9, 34, 46, 15, 2, '#f2d48a', 1.4) +
    [13, 21, 29, 37, 45].map(x => P(`M${x} 46 Q${x + 4} 34 ${x + 8} 46Z`, '#f6eab0', 1.4) + L(`M${x + 4} 37 L${x + 4} 45`, 1, '#c9a64a')).join('') +
    L('M10 47 L54 47', 1.6, '#a8601e');
items.cauliflowerPie = () =>
    SHADOW(32, 58, 24, 3) +
    P('M10 44 L54 44 L50 56 L14 56Z', '#c98a3e') +
    P('M8 44 Q8 22 32 20 Q56 22 56 44Z', '#e6a84e') +
    L('M14 40 Q32 30 50 40 M20 30 Q32 26 44 30', 1.4, '#b8702a') +
    // un bouquet de chou-fleur posé dessus, dans ses feuilles
    E(24, 25, 5, 2.4, '#6cc04a', -30, 1.4) +
    E(40, 25, 5, 2.4, '#6cc04a', 30, 1.4) +
    ring(6, 32, 24, 3.6, (x, y) => C(x, y, 2.6, '#f6f2e8', 1.2)) +
    C(32, 24, 2.6, '#f6f2e8', 1.2) +
    L('M8 44 L56 44', 2, O);
// quiche brocoli-saumon : une part triangulaire sur assiette, vert et rose
items.broccoliQuiche = () =>
    plateB() +
    P('M12 44 L52 36 L52 46 L12 52Z', '#d9913d') +
    P('M12 44 L52 36 L48 30 Q30 30 12 44Z', '#f4dc8a') +
    dots(
        [
            [28, 38, '#4fa83a'],
            [40, 36, '#4fa83a'],
            [22, 42, '#4fa83a'],
        ],
        2.4,
    ) +
    [
        [34, 41],
        [46, 39],
    ]
        .map(([x, y]) => R(x - 2.5, y - 1.5, 5, 3, 1, '#f49a7a', 1))
        .join('');
items.blackcurrantTart = () =>
    SHADOW(32, 56, 26, 3) +
    [
        [16, 44],
        [48, 44],
        [32, 34],
    ]
        .map(
            ([x, y]) =>
                P(`M${x - 11} ${y} L${x + 11} ${y} L${x + 8} ${y + 9} L${x - 8} ${y + 9}Z`, '#d9913d') +
                E(x, y, 11, 3.6, '#2a1438') +
                dots(
                    [
                        [x - 4, y - 1, '#3a1a4a'],
                        [x + 2, y - 1, '#4a2a5a'],
                        [x - 1, y + 1, '#3a1a4a'],
                    ],
                    1.8,
                ),
        )
        .join('') +
    E(38, 26, 4, 2, '#6cc04a', -30, 1.2);

// ---------------- farine et semoule ----------------
// semoule : une boîte en carton jaune, une fenêtre de grains
items.semolina = () =>
    SHADOW(32, 58, 18, 3) +
    P('M16 18 L44 18 L48 22 L48 58 L16 58Z', '#f2c94e') +
    P('M16 18 L20 12 L48 12 L44 18Z', '#f7dc7a', 2) +
    P('M44 18 L48 12 L48 22Z', '#d8a830', 2) +
    R(20, 30, 24, 18, 3, '#fff6dc', 1.8) +
    Array.from({ length: 14 }, (_, k) => FC(23 + (k % 7) * 3.2, 36 + Math.floor(k / 7) * 5 + (k % 2), 1.1, '#e0a83a')).join('') +
    L('M20 24 L44 24', 1.6, '#c8453a');

// ---------------- sorbets et glaces ----------------
// sorbet à l'hibiscus : une verrine haute, rouge profond, une fleur d'hibiscus
items.hibiscusSorbet = () =>
    SHADOW(32, 59, 12, 2.5) +
    P('M20 24 L44 24 L41 56 Q40 58 38 58 L26 58 Q24 58 23 56Z', '#e8f4ff') +
    F('M22 34 L42 34 L40.5 55 Q40 56.5 38 56.5 L26 56.5 Q24 56.5 23.5 55Z', '#a0123a') +
    P('M20 24 L44 24 L41 56 Q40 58 38 58 L26 58 Q24 58 23 56Z', 'none') +
    C(32, 24, 9, '#c8205a') +
    ring(5, 32, 14, 6, (x, y) => C(x, y, 4, '#e8508a', 1.4)) +
    C(32, 14, 2, '#ffd23f', 1.2) +
    F('M25 28 L27 27 L27 52 L25 52Z', '#fff', 0.45);
// sorbet au cassis : deux quenelles noires dans une petite coupe, une grappe de cassis
items.blackcurrantSorbet = () =>
    SHADOW(32, 57, 20, 3) +
    P('M10 40 L54 40 Q52 54 32 55 Q12 54 10 40Z', '#f7f3ea') +
    E(24, 38, 11, 7, '#2a1438', -15) +
    E(40, 36, 11, 7, '#3a1a4a', 15) +
    HL(20, 35, 3, 1.4, -15, 0.4) +
    L('M46 18 Q48 24 46 28', 1.4, '#3f8f2e') +
    dots(
        [
            [44, 28, '#2a1438'],
            [48, 30, '#2a1438'],
            [45, 32, '#2a1438'],
        ],
        2.2,
    ) +
    E(50, 20, 4, 2, '#6cc04a', 30, 1.2);

// ---------------- thés et cafés ----------------
// thé à la mandarine : une grande tasse en verre, thé orangé, un quartier sur le bord
items.mandarinTea = () =>
    SHADOW(32, 59, 14, 2.5) +
    P('M18 20 L46 20 L44 56 Q44 58 40 58 L24 58 Q20 58 20 56Z', '#e8f4ff') +
    F('M19.6 28 L44.4 28 L43 55 Q43 56.5 40 56.5 L24 56.5 Q21 56.5 21 55Z', '#f0902a', 0.85) +
    P('M18 20 L46 20 L44 56 Q44 58 40 58 L24 58 Q20 58 20 56Z', 'none') +
    P('M46 28 Q56 30 54 40 Q52 47 45 46', 'none', 2.2) +
    P('M10 22 A9 9 0 0 1 28 22Z', '#ffa52a', 2) +
    L('M19 22 L14 16 M19 22 L19 14 M19 22 L24 16', 1.2, '#e06a10') +
    F('M23 31 L25 30 L25 52 L23 52Z', '#fff', 0.45);
// thé à la bigarade : un petit verre à thé orné, ambré, une rondelle d'orange amère et de la menthe
items.bitterOrangeTea = () =>
    SHADOW(32, 59, 12, 2.5) +
    P('M22 22 L42 22 L39 50 Q38 56 32 57 Q26 56 25 50Z', '#e8f4ff') +
    F('M23 28 L41 28 L38.6 50 Q37.6 55 32 55.6 Q26.4 55 25.4 50Z', '#c86a1a', 0.85) +
    P('M22 22 L42 22 L39 50 Q38 56 32 57 Q26 56 25 50Z', 'none') +
    L('M24 36 L40 36 M25 44 L39 44', 1.8, '#d8a830') +
    dots(
        [
            [28, 40, '#d8a830'],
            [32, 40, '#2a8a9a'],
            [36, 40, '#d8a830'],
        ],
        1.2,
    ) +
    C(44, 20, 6, '#f08a2a') +
    C(44, 20, 4, '#ffc06a', 1.2) +
    L('M44 16 L44 24 M40 20 L48 20', 0.9, '#f08a2a') +
    E(28, 17, 4, 2, '#4fa83a', -30, 1.2) +
    E(33, 15, 4, 2, '#6cc04a', 20, 1.2);
// macchiato : un petit verre droit, café dessous, lait et mousse dessus
items.macchiato = () =>
    SHADOW(32, 59, 13, 2.5) +
    P('M20 20 L44 20 L42 56 Q42 58 39 58 L25 58 Q22 58 22 56Z', '#e8f4ff') +
    F('M21.6 40 L42.4 40 L41 56 Q41 56.5 39 56.5 L25 56.5 Q23 56.5 23 56Z', '#5a3010') +
    F('M20.8 30 L43.2 30 L42.4 40 L21.6 40Z', '#c8945a') +
    F('M20.4 24 L43.6 24 L43.2 30 L20.8 30Z', '#fff6e6') +
    P('M20 20 L44 20 L42 56 Q42 58 39 58 L25 58 Q22 58 22 56Z', 'none') +
    E(32, 20, 13, 4, '#fffaf2', 0, 2) +
    C(32, 19, 2, '#c8945a', 1);

// ---------------- eaux-de-vie et liqueurs ----------------
// eau-de-vie de marc : une flûte haute et fine, presque transparente, un bouchon de liège
items.marcBrandy = () =>
    SHADOW(32, 60, 10, 2.4) +
    P('M28 14 L36 14 L36 22 Q42 28 42 36 L42 56 Q42 59 38 59 L26 59 Q22 59 22 56 L22 36 Q22 28 28 22Z', '#f2f6e0') +
    F('M23.4 38 L40.6 38 L40.6 56 Q40.6 57.6 38 57.6 L26 57.6 Q23.4 57.6 23.4 56Z', '#e8e0a8', 0.8) +
    P('M28 14 L36 14 L36 22 Q42 28 42 36 L42 56 Q42 59 38 59 L26 59 Q22 59 22 56 L22 36 Q22 28 28 22Z', 'none') +
    R(28, 5, 8, 10, 2, '#c8945a') +
    R(25, 40, 14, 12, 2, '#fffaf0', 1.4) +
    dots(
        [
            [30, 44, '#7a3a9a'],
            [34, 44, '#7a3a9a'],
            [32, 47.5, '#7a3a9a'],
        ],
        1.4,
    ) +
    F('M25 27 L27 26 L27 52 L25 52Z', '#fff', 0.5);
// eau-de-vie de sorbier : une gourde ronde et plate, des baies rouges peintes
items.rowanSpirit = () =>
    SHADOW(32, 59, 18, 2.5) +
    C(32, 38, 19, '#e4f2ee') +
    C(32, 38, 15, '#f6ead0', 1.4) +
    L('M26 44 Q32 36 38 30', 1.4, '#6a8a3a') +
    dots(
        [
            [26, 44, '#e0402a'],
            [30, 47, '#e0402a'],
            [24, 48, '#e0402a'],
            [36, 32, '#e0402a'],
            [40, 34, '#e0402a'],
        ],
        2,
    ) +
    E(34, 40, 4, 2, '#6cc04a', -40, 1.1) +
    R(28, 12, 8, 8, 2, '#e4f2ee') +
    R(27, 6, 10, 7, 2.5, '#8b5a2b') +
    HL(22, 30, 3, 6, 20, 0.5);
// lait fermenté de renne : un pichet de grès blanc, bande bleue, des bois de renne
items.reindeerKefir = () =>
    SHADOW(32, 59, 16, 2.5) +
    P('M44 26 Q54 28 52 38 Q50 44 44 43', 'none', 2.4) +
    P('M18 16 L44 16 L46 52 Q46 58 40 58 L22 58 Q16 58 16 52Z', '#f6f2ea') +
    P('M18 16 L14 12 L22 14Z', '#f6f2ea', 2) +
    F('M17 30 L45.4 30 L45.6 36 L16.6 36Z', '#5a7fae') +
    L('M17 30 L45.4 30 M16.6 36 L45.6 36', 1.4) +
    L('M26 46 Q24 42 22 41 M24 43 L21 44 M36 46 Q38 42 40 41 M38 43 L41 44', 1.6, '#a8693a') +
    E(31, 48, 4, 3, '#a8693a', 0, 1.4);
// liqueur de café : une bouteille ronde et trapue, presque noire, étiquette rouge et grains
items.coffeeLiqueur = () =>
    SHADOW(32, 59, 17, 2.5) +
    P('M28 8 L36 8 L36 22 Q50 26 50 42 Q50 58 32 58 Q14 58 14 42 Q14 26 28 22Z', '#2a160a') +
    R(27, 4, 10, 6, 2, '#c8453a') +
    R(19, 36, 26, 14, 3, '#c8453a', 1.6) +
    [
        [26, 43],
        [32, 43],
        [38, 43],
    ]
        .map(([x, y]) => E(x, y, 2.6, 3.4, '#6a3a1a', 0, 1.2) + L(`M${x} ${y - 2.6} Q${x - 1} ${y} ${x} ${y + 2.6}`, 0.9, '#2a160a'))
        .join('') +
    HL(20, 30, 2, 5, 20, 0.35);
// crème de cassis : une carafe ronde, violet presque noir, étiquette dorée
items.cassisCream = () =>
    SHADOW(32, 59, 16, 2.5) +
    P('M27 8 L37 8 L37 20 Q48 24 48 40 Q48 58 32 58 Q16 58 16 40 Q16 24 27 20Z', '#e8f4ff') +
    F('M17.4 34 L46.6 34 Q46.6 56.6 32 56.6 Q17.4 56.6 17.4 34Z', '#3a0f3a') +
    P('M27 8 L37 8 L37 20 Q48 24 48 40 Q48 58 32 58 Q16 58 16 40 Q16 24 27 20Z', 'none') +
    C(32, 4, 4, '#3a0f3a', 1.8) +
    E(32, 44, 10, 6, '#f2c94e', 0, 1.6) +
    dots(
        [
            [29, 44, '#3a0f3a'],
            [33, 43, '#3a0f3a'],
            [35, 46, '#3a0f3a'],
        ],
        1.4,
    ) +
    F('M21 26 L23 25 L23 38 L21 38Z', '#fff', 0.5);
// sauce pimentée : une petite bouteille à long col, rouge vif, bouchon vert, un piment
items.hotSauce = () =>
    SHADOW(32, 59, 10, 2.4) +
    P('M29 6 L35 6 L35 26 Q41 30 41 38 L41 55 Q41 58 38 58 L26 58 Q23 58 23 55 L23 38 Q23 30 29 26Z', '#e83a1a') +
    R(28, 2, 8, 6, 2, '#3f8f2e') +
    R(25, 38, 14, 14, 2, '#fff6dc', 1.4) +
    P('M30 41 Q36 42 35 50 Q33 47 30 46 Q28 44 30 41Z', '#e0402a', 1.2) +
    L('M30 41 L28 39', 1.2, '#3f8f2e') +
    F('M25 32 L26.5 31 L26.5 52 L25 52Z', '#fff', 0.45);
// piment d'Espelette en poudre : une boîte ronde en fer, la poudre rouge en tas, un piment
items.espelettePowder = () =>
    SHADOW(32, 58, 18, 3) +
    R(14, 30, 36, 26, 4, '#c8453a') +
    E(32, 30, 18, 5, '#8a2a1a') +
    P('M18 30 Q32 16 46 30Z', '#d8502a', 1.8) +
    Array.from({ length: 8 }, (_, k) => FC(22 + k * 2.8, 26 - (k % 3), 0.8, '#a8301a')).join('') +
    R(18, 38, 28, 12, 2, '#f6e6c8', 1.4) +
    P('M24 42 Q34 40 40 46 Q36 48 30 47 Q25 46 24 42Z', '#e0402a', 1.2) +
    L('M24 42 L21 40', 1.2, '#3f8f2e');

// ---------------- laine ----------------
// laine barbarine : une toison brute, nouée d'une ficelle, crème et brune
items.barbaryWool = () =>
    SHADOW(32, 57, 24, 3) +
    ring(9, 32, 40, 13, (x, y, k) => C(x, y, 7, k % 3 ? '#efe2c8' : '#d8c09a', 1.6)) +
    C(32, 40, 10, '#efe2c8', 0) +
    L('M14 40 Q32 48 50 40', 2, '#a8693a') +
    L('M30 46 L26 54 M34 46 L38 54', 1.6, '#a8693a') +
    C(24, 34, 3, '#c8a878', 1) +
    C(40, 36, 3, '#c8a878', 1);
// fil de mohair : un écheveau tordu, rose nacré
items.mohairYarn = () =>
    SHADOW(32, 57, 24, 3) +
    P('M10 36 Q10 26 22 28 Q32 30 42 26 Q54 24 54 34 Q54 44 42 42 Q32 40 22 44 Q10 46 10 36Z', '#f2c2d8') +
    L('M14 32 Q22 38 30 32 Q38 26 46 32 M14 40 Q22 34 30 40 Q38 46 50 38', 1.6, '#d890b0') +
    HL(20, 31, 4, 1.4, -10, 0.6) +
    L('M54 34 Q58 44 50 50', 2, '#f2c2d8');

// ---------------- terrines et rillettes ----------------
// rillettes de pintade : un pot en grès rond, couvercle, bande brune
items.guineaRillettes = () =>
    SHADOW(32, 58, 18, 3) +
    P('M14 26 L50 26 L48 52 Q48 57 42 57 L22 57 Q16 57 16 52Z', '#e8d8b8') +
    F('M15 36 L49.2 36 L48.6 44 L15.6 44Z', '#8a5a2e') +
    E(32, 26, 19, 5, '#d8c4a0') +
    E(32, 20, 13, 4, '#d8c4a0', 0, 2) +
    C(32, 16, 3, '#8a5a2e', 1.6) +
    dots(
        [
            [26, 40, '#f6f2ea'],
            [32, 40, '#f6f2ea'],
            [38, 40, '#f6f2ea'],
        ],
        1.4,
    );
// terrine de faisan : une terrine ovale en fonte rouge, une plume sur le couvercle
items.pheasantTerrine = () =>
    SHADOW(32, 56, 26, 3) +
    P('M6 38 L58 38 L56 50 Q55 54 50 54 L14 54 Q9 54 8 50Z', '#b8301a') +
    E(32, 38, 26, 8, '#d8402a') +
    E(32, 36, 22, 6, '#c8361e', 0, 1.6) +
    R(26, 30, 12, 4, 2, '#8a2a1a', 1.6) +
    P('M18 32 Q30 22 46 26 Q36 30 18 32Z', '#c8803a', 1.4) +
    L('M20 31 Q32 25 44 27', 1, '#5a3010') +
    L('M24 30 L26 27 M30 28 L32 25 M36 27 L38 24', 0.8, '#2a4a7a');

// ---------------- poissons ----------------
// lavaret : un poisson fin, dos vert olive, flancs argentés, queue fourchue
items.whitefish = () =>
    SHADOW(32, 52, 24, 3) +
    P('M48 36 L60 26 L57 36 L60 46Z', '#a8b89a', 2) +
    P('M6 36 C14 24 38 24 50 36 C38 46 14 46 6 36Z', '#dfe8e2', 2.2) +
    F('M8 34 C16 26 36 26 48 34 C36 30 16 30 8 34Z', '#7a8a5a') +
    L('M20 37 L44 37', 1, 'rgba(58,38,24,.3)') +
    FC(13, 34, 1.8, O) +
    P('M28 28 L34 22 L38 29Z', '#a8b89a', 1.6) +
    HL(22, 39, 5, 1.2, 0, 0.6);

// ---------------- les viandes ----------------
// viande d'autruche : un gros pilon sur papier
items.ostrichMeat = () =>
    SHADOW(32, 56, 24, 3) +
    P('M6 46 L50 40 L58 50 L14 56Z', '#f2e6cc', 1.8) +
    P('M18 46 Q8 40 14 30 Q22 22 34 28 Q42 34 38 42 Q32 50 18 46Z', '#8a2a2a') +
    HL(20, 33, 4, 2, -30, 0.35) +
    P('M36 40 L48 46', 'none', 5) +
    L('M36 40 L48 46', 3, '#f6eedc') +
    C(50, 45, 3, '#f6eedc', 1.6) +
    C(49, 49, 3, '#f6eedc', 1.6);
// autruche séchée : des lanières pendues à une ficelle
items.driedOstrich = () =>
    SHADOW(32, 59, 22, 2.5) +
    L('M8 14 L56 14', 2, '#a8693a') +
    [14, 24, 34, 44]
        .map((x, k) =>
            P(
                `M${x} 14 L${x + 6} 14 L${x + 5} ${44 + (k % 2) * 8} Q${x + 3} ${48 + (k % 2) * 8} ${x + 1} ${44 + (k % 2) * 8}Z`,
                k % 2 ? '#5a1a1a' : '#6e2424',
                1.6,
            ),
        )
        .join('') +
    [17, 27, 37, 47].map(x => L(`M${x} 22 L${x + 1} 26 M${x} 32 L${x + 1} 35`, 0.8, '#a84a3a')).join('');

// ---------------- les plats ----------------
// rougail de tomate : une assiette, un dôme de riz blanc et la sauce rouge en morceaux
items.rougail = () =>
    plateB() +
    P('M12 44 Q12 32 24 32 Q34 32 34 44Z', '#fbf8f0') +
    [
        [18, 38],
        [23, 35],
        [28, 39],
        [21, 41],
    ]
        .map(([x, y]) => FE(x, y, 1.4, 0.8, '#e8e0cc'))
        .join('') +
    E(44, 43, 12, 6, '#d8301a') +
    dots(
        [
            [40, 42, '#f05a3a'],
            [46, 40, '#f05a3a'],
            [48, 45, '#f05a3a'],
            [42, 46, '#3f8f2e'],
        ],
        1.8,
    );
// ceviche de vivaneau : un plat creux, cubes roses, rondelles d'oignon rouge, citron vert
items.snapperCeviche = () =>
    SHADOW(32, 56, 25, 3) +
    E(32, 42, 26, 12, '#e8f2f6') +
    E(32, 40, 21, 8, '#f6f0e0', 0, 1.6) +
    [
        [22, 39],
        [30, 37],
        [38, 40],
        [27, 43],
        [35, 44],
    ]
        .map(([x, y]) => R(x - 2.5, y - 2.5, 5, 5, 1, '#f8a8a0', 1.1))
        .join('') +
    C(44, 38, 3.4, 'none', 1.6) +
    C(18, 44, 3, 'none', 1.4) +
    L('M44 38 m-3.4 0 a3.4 3.4 0 1 0 6.8 0 a3.4 3.4 0 1 0 -6.8 0', 1.6, '#b04a9a') +
    P('M44 26 A8 8 0 0 1 56 34 L44 34Z', '#9be06b', 1.6) +
    L('M44 34 L50 28 M44 34 L53 32', 1, '#3f8f2e');
// gnocchis de butternut : des petits coussins orange striés et des feuilles de sauge
items.butternutGnocchi = () =>
    plateB() +
    [
        [20, 40],
        [30, 37],
        [40, 40],
        [25, 46],
        [35, 46],
        [45, 45],
    ]
        .map(([x, y]) => E(x, y, 5, 3.4, '#f2a03a', 0, 1.4) + L(`M${x - 3} ${y - 1} L${x + 3} ${y - 1} M${x - 3} ${y + 1} L${x + 3} ${y + 1}`, 0.8, '#c8701a'))
        .join('') +
    E(18, 33, 5, 2.2, '#8aa86a', -25, 1.2) +
    E(46, 32, 5, 2.2, '#8aa86a', 25, 1.2);
// riz jaune au curcuma : un dôme de riz jaune dans une assiette creuse, petits pois et racine
items.yellowRice = () =>
    SHADOW(32, 57, 24, 3) +
    E(32, 46, 25, 9, '#f4f0e8') +
    P('M12 46 Q14 26 32 24 Q50 26 52 46Z', '#f6c832') +
    Array.from({ length: 16 }, (_, k) => FE(17 + (k % 8) * 4.4, 32 + Math.floor(k / 8) * 7 + (k % 2) * 2, 1.5, 0.8, '#fff2a0', 1, k * 23)).join('') +
    dots(
        [
            [24, 38, '#6cc04a'],
            [38, 34, '#6cc04a'],
            [33, 42, '#6cc04a'],
        ],
        1.6,
    ) +
    P('M46 52 Q52 48 58 50 Q56 54 50 55Z', '#d88a2a', 1.4);
// crème apaisante : un tube souple blanc, bouchon vert, une feuille d'aloe
items.soothingCream = () =>
    SHADOW(32, 58, 22, 3) +
    P('M10 44 L44 34 L48 48 L14 56Z', '#f6f6f2') +
    L('M10 44 L14 56', 2.6) +
    P('M44 34 L54 32 L56 42 L48 48Z', '#4fa83a', 2) +
    F('M16 47 L42 40 L43 43 L17 50Z', '#9be06b', 0.8) +
    P('M22 46 Q24 38 28 36 Q28 42 22 46Z', '#6cc04a', 1.2) +
    HL(24, 46, 6, 1, -15, 0.6);
// beurre à l'échalote : un rouleau de beurre tranché, piqué d'échalote, sur planche
items.shallotButter = () =>
    board() +
    R(8, 30, 30, 14, 7, '#f6dc7a') +
    E(38, 37, 5, 7, '#f8e49a', 0, 2) +
    E(48, 38, 4.4, 6.4, '#f8e49a', 0, 2) +
    dots(
        [
            [16, 35, '#b06a9a'],
            [24, 39, '#b06a9a'],
            [30, 34, '#b06a9a'],
            [38, 36, '#b06a9a'],
            [48, 39, '#b06a9a'],
        ],
        1,
    ) +
    L('M14 34 L32 34', 1, '#fff8d0');
// bougie au patchouli : une bougie dans un verre ambré, cire brun-vert, une feuille
items.patchouliCandle = () =>
    SHADOW(32, 59, 17, 2.5) +
    P('M15 24 L49 24 L47 56 Q47 58 44 58 L20 58 Q17 58 17 56Z', '#e8c890') +
    F('M16.4 30 L47.6 30 L46.4 55 Q46.4 56.5 44 56.5 L20 56.5 Q17.6 56.5 17.6 55Z', '#6a7a3a', 0.85) +
    P('M15 24 L49 24 L47 56 Q47 58 44 58 L20 58 Q17 58 17 56Z', 'none') +
    L('M32 30 L32 22', 1.6) +
    P('M32 10 Q36 16 32 21 Q28 16 32 10Z', '#ffb020', 1.4) +
    P('M24 46 Q28 38 34 38 Q32 46 24 46Z', '#8ab84a', 1.2) +
    L('M24 46 L31 40', 0.8, '#3f6a2a');

void HL;
