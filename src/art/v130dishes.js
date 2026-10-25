// 1.30 : les plats, conserves, farines et ouvrages des nouvelles cultures (64 dessins) et la marmite.
import { C, E, F, FC, FE, L, P, R, SHADOW, badge, bolt, bottle, items, machines, leaf, sack, soap, sub, tart } from './kit.js';
import { bowl, coupe, cup, jar, juiceB, oil, plate, scoop, steamF, tray } from './items2.js';

const dots = (list, r = 2.4) => list.map(([x, y, c]) => C(x, y, r, c, 1.4)).join('');
// un plat de base du jeu, avec la culture en médaillon
const withBadge = (base, crop) => () => sub(base, 0, 0, 64) + badge(crop);
const onPlate = (list, extra = '') => plate(46) + list.map(([id, x, y, s]) => sub(id, x, y, s)).join('') + extra;
const pot = (fill, lid, crop) => jar(fill, lid, sub(crop, 22, 33, 20));

const D = {
    // ---- le navet
    glazedTurnips: () =>
        onPlate(
            [
                ['turnip', 6, 14, 28],
                ['turnip', 30, 14, 28],
                ['turnip', 18, 22, 30],
            ],
            FC(20, 34, 1.2, '#fff', 0.8) + FC(44, 34, 1.2, '#fff', 0.8),
        ),
    turnipSoup: () => bowl('#efe6c8') + steamF + sub('turnip', 21, 14, 20),
    pickledTurnips: () => pot('#e0a8d0', '#c8453a', 'turnip'),
    turnipBaconTart: withBadge('flamiche', 'turnip'),
    // ---- la fève
    favaPuree: () =>
        bowl('#a8cc6a') +
        steamF +
        dots(
            [
                [24, 30, '#5fa040'],
                [40, 29, '#5fa040'],
            ],
            2,
        ),
    favaFlour: () => sack('#e8e4b8', 'favaBean'),
    favaBread: withBadge('bread', 'favaBean'),
    canFavaBeans: () => pot('#a8cc6a', '#8a8a90', 'favaBean'),
    // ---- le panais
    parsnipMash: () => bowl('#f6ecd0') + steamF + sub('parsnip', 22, 12, 20),
    parsnipChips: () =>
        plate(46) +
        [
            [18, 38, -20],
            [30, 34, 15],
            [42, 38, 30],
            [26, 42, 5],
            [38, 43, -15],
        ]
            .map(([x, y, r]) => E(x, y, 6, 3, '#f2dc98', r, 1.4))
            .join(''),
    parsnipCake: withBadge('spongeCake', 'parsnip'),
    // ---- l'échalote
    shallotConfit: () => pot('#a05a40', '#c8453a', 'shallot'),
    shallotTatin: withBadge('tatin', 'shallot'),
    shallotButter: withBadge('butter', 'shallot'),
    shallotFougasse: withBadge('bread', 'shallot'),
    // ---- le brocoli
    broccoliSoup: () => bowl('#9fcf6a') + steamF + sub('broccoli', 22, 12, 20),
    broccoliQuiche: withBadge('spinachQuiche', 'broccoli'),
    cauliflowerGratin: () => tray('#e8c870') + sub('cauliflower', 16, 14, 32),
    piccalilli: () => pot('#f0c838', '#2f6a8a', 'cauliflower'),
    cauliflowerPie: withBadge('pie', 'cauliflower'),
    // ---- la chicorée
    roastedChicory: () => pot('#6a4a2e', '#a8693a', 'chicory'),
    chicoryMilk: () => cup('#d8b890') + sub('chicory', 40, 2, 20),
    chicoryCake: withBadge('walnutCake', 'chicory'),
    endiveTart: withBadge('tatin', 'endive'),
    endiveSalad: () =>
        onPlate([
            ['endive', 4, 12, 32],
            ['walnut', 34, 22, 20],
            ['roquefort', 28, 30, 18],
        ]),
    // ---- l'avoine
    oatFlakes: () => sack('#efe0b8', 'oat'),
    oatFlour: () => sack('#d8c8a0', 'oat'),
    porridge: () => bowl('#e8d8b0') + steamF + FC(32, 31, 3.4, '#e8a548') + FC(26, 32, 1.4, '#c9a96e') + FC(38, 32, 1.4, '#c9a96e'),
    oatBread: withBadge('bread', 'oat'),
    oatGalette: () => plate(46) + P('M12 38 L52 38 L48 50 L16 50Z', '#d8b068', 2) + L('M16 42 L48 42', 1.2, '#b08a48') + sub('oat', 22, 14, 22),
    // ---- le pois chiche
    hummus: () =>
        bowl('#ecd49a') +
        L('M18 30 Q32 25 46 30', 2.4, '#9bb844') +
        dots(
            [
                [26, 29, '#e6c88a'],
                [38, 29, '#e6c88a'],
            ],
            2,
        ),
    falafel: () =>
        plate(46) +
        [
            [20, 40],
            [32, 36],
            [44, 41],
            [27, 46],
            [38, 46],
        ]
            .map(([x, y]) => C(x, y, 5.5, '#8a5a2a', 1.8) + FC(x - 1.5, y - 1.5, 1.3, '#b8803a'))
            .join(''),
    chickpeaFlour: () => sack('#f0dca0', 'chickpea'),
    socca: () =>
        plate(46) +
        E(32, 40, 22, 7, '#e8b848', 0, 1.8) +
        dots(
            [
                [24, 39, '#b8803a'],
                [34, 37, '#b8803a'],
                [42, 41, '#b8803a'],
            ],
            1.4,
        ),
    roastedChickpeas: () =>
        bowl('#e0a860') +
        dots(
            [
                [20, 29, '#e6c88a'],
                [28, 31, '#d8a868'],
                [36, 29, '#e6c88a'],
                [44, 31, '#d8a868'],
                [32, 27, '#e6c88a'],
            ],
            3,
        ),
    vegCouscous: () =>
        bowl('#f0d890') +
        dots(
            [
                [22, 28, '#e8793a'],
                [32, 26, '#5fa040'],
                [42, 28, '#e8793a'],
                [28, 31, '#e6c88a'],
                [38, 31, '#e6c88a'],
            ],
            2.6,
        ),
    // ---- le butternut
    butternutSoup: () => bowl('#f0a848') + steamF + sub('butternut', 23, 8, 18),
    butternutGnocchi: () =>
        bowl('#f0e0b0') +
        dots(
            [
                [20, 29, '#e8a848'],
                [28, 31, '#e8a848'],
                [36, 29, '#e8a848'],
                [44, 31, '#e8a848'],
                [32, 27, '#e8a848'],
            ],
            3.4,
        ),
    butternutTart: () =>
        tart(
            '#f0a848',
            [
                [24, 38, '#e8793a'],
                [40, 38, '#e8793a'],
            ],
            false,
        ) + badge('butternut'),
    butternutCompote: () => pot('#e8a050', '#8a8a90', 'butternut'),
    // ---- la mûre
    blackberryJam: () => pot('#4a3470', '#fffaf0', 'blackberry'),
    blackberryTart: () =>
        tart(
            '#4a3470',
            [
                [24, 38, '#5a3f86'],
                [34, 36, '#3a2a58'],
                [42, 39, '#5a3f86'],
            ],
            false,
        ),
    blackberryIce: () => coupe(scoop(22, 30, 8, '#6a4a98') + scoop(42, 30, 8, '#7a58a8') + scoop(32, 24, 9, '#5a3f86')),
    blackberryJuice: () => juiceB('#5a3f86', 'blackberry'),
    blackberryLiqueur: () => bottle('#4a2a6a', 'blackberry', '#e4f5ff', '#8a2a4a'),
    // ---- le cassis
    blackcurrantJelly: () => pot('#3a2a58', '#c8453a', 'blackcurrant'),
    blackcurrantSorbet: () => coupe(scoop(22, 30, 8, '#4a3a78') + scoop(42, 30, 8, '#5a4a88') + scoop(32, 24, 9, '#3a2a68')),
    blackcurrantTart: () =>
        tart(
            '#3a2a58',
            [
                [24, 38, '#2a2040'],
                [34, 36, '#2a2040'],
                [42, 39, '#2a2040'],
            ],
            true,
        ),
    cassisCream: () => bottle('#2a1a40', 'blackcurrant', '#e4f5ff', '#2a2040'),
    cassisPastilles: () =>
        plate(46) +
        [
            [20, 40],
            [32, 36],
            [44, 40],
            [26, 46],
            [38, 46],
        ]
            .map(([x, y]) => R(x - 5, y - 4, 10, 8, 2.4, '#4a3a78', 1.6) + FE(x, y - 2, 3, 1, '#fff', 0.6))
            .join(''),
    // ---- le chanvre
    hempCloth: () => bolt('#c8b88a', '#a89868'),
    hempRope: () =>
        SHADOW(32, 56, 22, 3) +
        E(32, 42, 22, 12, '#c9a96e', 0, 2) +
        E(32, 40, 14, 6, '#8a6a3a', 0, 1.6) +
        L('M12 42 Q32 52 52 42 M16 36 Q32 44 48 36', 1.2, '#a8884a') +
        L('M50 44 L58 54', 3, '#c9a96e'),
    hempOil: () => oil('#9bb844', 'hemp'),
    toastedHemp: () =>
        bowl('#8a6a3a') +
        dots(
            [
                [20, 29, '#b8a068'],
                [28, 31, '#9a8050'],
                [36, 29, '#b8a068'],
                [44, 31, '#9a8050'],
                [32, 27, '#b8a068'],
            ],
            2.6,
        ),
    hempBread: withBadge('bread', 'hemp'),
    hempBag: () =>
        SHADOW(32, 58, 20, 3) +
        L('M20 26 Q20 8 32 8 Q44 8 44 26', 3.4) +
        L('M20 26 Q20 8 32 8 Q44 8 44 26', 1.6, '#a8884a') +
        P('M14 26 L50 26 L47 56 Q47 58 44 58 L20 58 Q17 58 17 56Z', '#c8b88a') +
        L('M18 34 L46 34 M19 44 L45 44', 1.2, '#a89868') +
        sub('hemp', 22, 32, 20),
    espadrilles: () =>
        SHADOW(32, 58, 26, 3) +
        P('M6 46 Q6 34 18 34 L30 36 Q34 44 30 52 L8 52 Q6 50 6 46Z', '#e6d8a8') +
        R(6, 50, 26, 5, 2.4, '#c9a96e') +
        L('M12 54 L30 54', 1, '#8a6a3a') +
        P('M34 40 Q34 28 46 28 L58 30 Q62 38 58 46 L36 46 Q34 44 34 40Z', '#e6d8a8') +
        R(34, 44, 26, 5, 2.4, '#c9a96e') +
        L('M18 36 L24 44 M44 30 L50 38', 1.4, '#3f6fb5'),
    hempSoap: () => soap('#9bb844', 'hemp'),
    hempLead: () =>
        SHADOW(32, 57, 22, 3) +
        L('M10 22 Q22 8 32 24 Q42 40 54 24', 4.4) +
        L('M10 22 Q22 8 32 24 Q42 40 54 24', 2.4, '#c9a96e') +
        L('M12 24 Q22 12 32 26', 1, '#8a6a3a') +
        R(50, 20, 8, 8, 2, '#c0c4c8', 1.8) +
        C(10, 22, 3.4, '#c0c4c8', 1.6),
};

// une rondelle de chèvre frais
const chevre = (x, y, r = 5.4) =>
    E(x, y, r, r * 0.62, '#fffaf0', 0, 1.8) + FE(x - r * 0.3, y - r * 0.15, r * 0.35, r * 0.18, '#fff', 0.8) + FC(x + r * 0.25, y + r * 0.05, 0.7, '#d8cfae');
// des biscuits à l'avoine : même forme que les cookies du jeu, des flocons clairs à la place des pépites
const oatCookie = (x, y, r, flat) => {
    const flakes = [
        [-0.45, -0.25],
        [0.2, -0.45],
        [0.45, 0.15],
        [-0.15, 0.35],
        [-0.05, -0.02],
    ];
    if (flat)
        return (
            E(x, y + r * 0.24, r, r * 0.42, '#a8702f', 0, 2.2) +
            E(x, y, r, r * 0.4, '#d9a050', 0, 2.2) +
            flakes.map(([a, b], k) => E(x + a * r, y + b * r * 0.4, 2.6, 1.3, '#f2dca0', k * 30, 0.8)).join('') +
            FC(x - r * 0.5, y - r * 0.12, r * 0.08, '#fff', 0.5)
        );
    return (
        C(x, y, r, '#d9a050', 2.4) +
        L(`M${x - r * 0.8} ${y + r * 0.45} Q${x} ${y + r * 1.05} ${x + r * 0.8} ${y + r * 0.45}`, 1.4, '#a8702f') +
        flakes.map(([a, b], k) => E(x + a * r, y + b * r, 2.8, 1.5, '#f2dca0', k * 35, 0.9)).join('') +
        L(`M${x - r * 0.72} ${y - r * 0.15} Q${x - r * 0.58} ${y - r * 0.62} ${x - r * 0.18} ${y - r * 0.76}`, 1.6, 'rgba(255,255,255,.7)')
    );
};
// une feuille de frisée : un petit bouquet frisé
const curl = (x, y, c) =>
    C(x, y, 4.4, c, 1.4) + FC(x - 1.4, y - 1.2, 1.6, '#c8e07a', 0.9) + L(`M${x - 3} ${y + 1} Q${x} ${y - 3} ${x + 3} ${y + 1}`, 1, 'rgba(255,255,255,.4)');
// un lardon
const lardon = (x, y, r = 0) =>
    `<g transform="rotate(${r} ${x} ${y})">${R(x - 4, y - 2, 8, 4, 1.4, '#d8896a', 1.2)}${L(`M${x - 2} ${y} L${x + 2} ${y}`, 1, '#f6c8b0')}</g>`;
// un rouleau d'endive dans sa tranche de jambon
const endiveRoll = (x, y, rot = 0) =>
    `<g transform="rotate(${rot} ${x} ${y})">` +
    E(x - 10, y, 4, 4.4, '#f6f0c8', 0, 1.6) +
    FC(x - 11, y - 1, 1.2, '#e4e8a0') +
    R(x - 8, y - 5, 17, 10, 4.4, '#e88a8a', 1.8) +
    L(`M${x - 4} ${y - 5} L${x - 4} ${y + 5} M${x + 3} ${y - 5} L${x + 3} ${y + 5}`, 1.2, '#f6c8c8') +
    FE(x, y - 2.6, 6, 1.2, '#fff', 0.45) +
    `</g>`;

const D2 = {
    // la salade de fèves : un grand bol de feuilles, de fèves vertes et de chèvre en rondelles
    favaGoatSalad: () =>
        bowl('#bfe08a', 31) +
        [
            [18, 26, -30],
            [28, 22, 10],
            [40, 23, -10],
            [47, 27, 30],
            [34, 28, 0],
        ]
            .map(([x, y, r]) => leaf(x, y + 6, 11, r - 90, '#6cb04a', 0.5))
            .join('') +
        [
            [20, 27],
            [26, 24],
            [31, 27],
            [37, 24],
            [43, 27],
            [24, 29],
            [34, 22],
            [40, 29],
        ]
            .map(([x, y]) => E(x, y, 3.2, 2.3, '#9bd05a', 20, 1.4) + FC(x - 0.8, y - 0.6, 0.7, '#d8f0a0'))
            .join('') +
        chevre(24, 25) +
        chevre(38, 26) +
        chevre(31, 21, 4.6) +
        L('M16 29 Q32 33 48 29', 1.2, '#e8c048'),
    // les pâtes : un nid de tagliatelles crémeuses sur l'assiette, couronné de fleurettes
    broccoliPasta: () =>
        plate(46) +
        E(32, 42, 21, 8, '#f2d98a', 0, 1.8) +
        ['M13 42 Q21 35 29 42 Q37 49 51 41', 'M15 46 Q25 40 33 46 Q42 50 49 45', 'M17 38 Q25 33 33 38 Q41 43 47 37', 'M20 42 Q28 38 36 43']
            .map(d => L(d, 2, '#c9a548'))
            .join('') +
        [
            [18, 42],
            [27, 46],
            [39, 46],
            [46, 41],
        ]
            .map(([x, y]) => FE(x, y, 4, 1.4, '#fff6dc', 0.75))
            .join('') +
        sub('broccoli', 14, 27, 20) +
        sub('broccoli', 36, 28, 20) +
        sub('broccoli', 25, 23, 22) +
        dots(
            [
                [22, 45, '#5fa040'],
                [44, 44, '#5fa040'],
            ],
            1.4,
        ),
    // la frisée : un nid de salade frisée sur l'assiette, lardons dorés, œuf poché
    frisee: () =>
        plate(46) +
        [
            [16, 44],
            [24, 40],
            [32, 38],
            [40, 40],
            [48, 44],
            [20, 47],
            [30, 46],
            [41, 47],
            [26, 43],
            [37, 43],
        ]
            .map(([x, y], k) => curl(x, y, k % 2 ? '#8fc040' : '#6cb04a'))
            .join('') +
        lardon(20, 41, -20) +
        lardon(40, 44, 25) +
        lardon(30, 47, 5) +
        lardon(46, 41, -10) +
        E(31, 35, 9, 5.4, '#fff', 0, 1.6) +
        FC(31, 34, 3.6, '#ffc83a') +
        FC(30, 33, 1, '#fff', 0.8),
    // les endives : un plat à gratin de quatre rouleaux de jambon, nappés de fromage fondu
    endiveHam: () =>
        SHADOW(32, 58, 28, 3) +
        R(4, 30, 56, 26, 8, '#fbf7ee') +
        R(8, 33, 48, 20, 6, '#e8b848', 1.6) +
        endiveRoll(24, 38, -6) +
        endiveRoll(40, 38, 6) +
        endiveRoll(24, 48, 4) +
        endiveRoll(40, 48, -4) +
        [
            [16, 44],
            [32, 41],
            [48, 44],
            [32, 51],
            [12, 36],
        ]
            .map(([x, y]) => FE(x, y, 4.6, 2, '#ffe9a0', 0.9))
            .join('') +
        FE(15, 36, 4, 1.2, '#fff', 0.5) +
        L('M20 24 Q16 20 20 15 M32 24 Q28 19 32 13 M44 24 Q40 20 44 15', 1.8, 'rgba(255,255,255,.95)'),
    // les cookies à l'avoine : comme ceux du jeu, des flocons clairs dessus
    oatCookies: () =>
        SHADOW(32, 58, 24, 3) +
        oatCookie(32, 50, 19, true) +
        oatCookie(31, 43, 17, true) +
        oatCookie(36, 28, 14, false) +
        FC(14, 56, 1.2, '#c78a42') +
        FC(50, 57, 1, '#c78a42') +
        FC(47, 54, 0.8, '#c78a42'),
};
Object.assign(D, D2);

// la marmite : un gros faitout en fonte sur son foyer, la vapeur qui monte
machines.marmite = () =>
    SHADOW(32, 60, 28, 3) +
    R(6, 46, 52, 12, 3, '#8b8f94') +
    L('M10 52 L54 52', 1.2, '#5e6266') +
    P('M10 28 Q8 46 20 48 L44 48 Q56 46 54 28Z', '#3a3a40') +
    E(32, 28, 22, 5.5, '#4a4a52') +
    E(32, 27, 18, 3.6, '#d89a3a') +
    R(4, 30, 6, 4, 1.6, '#3a3a40', 1.4) +
    R(54, 30, 6, 4, 1.6, '#3a3a40', 1.4) +
    FC(26, 27, 1.6, '#8fbf5a') +
    FC(36, 27, 1.8, '#e8793a') +
    F('M14 34 L16 33 L16 46 L14 46Z', '#fff', 0.25) +
    L('M24 18 Q20 12 24 6 M32 18 Q28 11 32 4 M40 18 Q36 12 40 6', 1.8, 'rgba(255,255,255,.95)') +
    P('M26 21 L38 21 L36 25 L28 25Z', '#c0c4c8', 1.6);

Object.assign(items, D);
export const DISHES_130 = Object.keys(D);
