// 1.30 : les plats, conserves, farines et ouvrages des nouvelles cultures (64 dessins) et la marmite.
import { C, E, F, FC, FE, L, P, R, SHADOW, badge, bolt, bottle, items, machines, sack, soap, sub, tart } from './kit.js';
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
    favaGoatSalad: () =>
        onPlate([
            ['favaBean', 6, 12, 30],
            ['goatCheese', 28, 16, 26],
        ]),
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
    broccoliPasta: () => bowl('#f2d98a') + sub('broccoli', 10, 14, 24) + sub('broccoli', 30, 14, 24),
    // ---- le chou-fleur
    cauliflowerGratin: () => tray('#e8c870') + sub('cauliflower', 16, 14, 32),
    piccalilli: () => pot('#f0c838', '#2f6a8a', 'cauliflower'),
    cauliflowerPie: withBadge('pie', 'cauliflower'),
    // ---- la chicorée
    roastedChicory: () => pot('#6a4a2e', '#a8693a', 'chicory'),
    chicoryMilk: () => cup('#d8b890') + sub('chicory', 40, 2, 20),
    chicoryCake: withBadge('walnutCake', 'chicory'),
    frisee: () =>
        onPlate(
            [
                ['chicory', 6, 10, 34],
                ['egg', 34, 20, 20],
            ],
            FC(20, 40, 2, '#d8896a') + FC(30, 42, 2, '#d8896a') + FC(40, 41, 2, '#d8896a'),
        ),
    // ---- l'endive
    endiveHam: () => tray('#f6e8b0') + sub('endive', 6, 12, 28) + sub('endive', 30, 12, 28) + sub('ham', 18, 20, 20),
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
    oatCookies: () =>
        plate(46) +
        [
            [22, 40],
            [34, 38],
            [28, 46],
        ]
            .map(([x, y]) => C(x, y, 7, '#c89a58', 1.8) + FC(x - 2, y - 1, 1, '#7a5a2a') + FC(x + 2, y + 2, 1, '#7a5a2a'))
            .join(''),
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
