// 1.32 : les plats, poudres, huiles et ouvrages des cultures de l'île (33 dessins).
import { C, E, FC, FE, L, P, R, SHADOW, badge, bottle, items, soap, sub } from './kit.js';
import { bowl, coupe, jar, juiceB, oil, plate, scoop, steamF, woodBoard, tallGlass, cup } from './items2.js';

const dots = (list, r = 2.4) => list.map(([x, y, c]) => C(x, y, r, c, 1.4)).join('');
const withBadge = (base, crop) => () => sub(base, 0, 0, 64) + badge(crop);
const pot = (fill, lid, crop) => jar(fill, lid, sub(crop, 22, 33, 20));
// un petit sac de poudre
const pouch = (c, crop) =>
    SHADOW(32, 58, 18, 3) +
    P('M17 58 Q11 42 18 27 L22 19 L42 19 L46 27 Q53 42 47 58Z', '#f0e0c0') +
    E(32, 19, 11, 4.5, c) +
    P('M22 20 L18 11 L27 15Z', '#f0e0c0', 2) +
    P('M42 20 L46 11 L37 15Z', '#f0e0c0', 2) +
    L('M21 23 Q32 27 43 23', 2.4, '#a8693a') +
    C(32, 43, 10, '#fff', 2) +
    sub(crop, 23, 34, 18);
const chips = (c, list) => plate(46) + list.map(([x, y, r]) => E(x, y, 6.4, 3.4, c, r, 1.5) + FE(x - 1.4, y - 1, 2, 0.8, '#fff', 0.5, r)).join('');
const cupWith = (tea, crop) => cup(tea) + sub(crop, 40, 2, 18);
const scoops = (a, b, c) => coupe(scoop(22, 30, 8, a) + scoop(42, 30, 8, b) + scoop(32, 24, 9, c));

const D = {
    // ---- le taro
    taroChips: () =>
        chips('#d8b8e8', [
            [18, 41, -20],
            [30, 37, 15],
            [42, 41, 30],
            [25, 45, 5],
            [37, 46, -15],
        ]),
    taroCoconut: () =>
        bowl('#f4eef8') +
        steamF +
        sub('taro', 22, 10, 20) +
        dots(
            [
                [20, 30, '#d8b8e8'],
                [44, 29, '#d8b8e8'],
            ],
            2.6,
        ),
    taroFritters: () =>
        plate(46) +
        [
            [20, 41],
            [32, 38],
            [44, 42],
            [27, 46],
            [38, 46],
        ]
            .map(([x, y]) => C(x, y, 5.4, '#d8903a', 1.8) + FC(x - 1.6, y - 1.6, 1.2, '#f2c880'))
            .join(''),
    taroCake: withBadge('spongeCake', 'taro'),
    // ---- le curcuma
    turmericPowder: () => pouch('#f0b020', 'turmeric'),
    goldenMilk: () => cupWith('#f2c23a', 'turmeric'),
    yellowRice: () =>
        bowl('#f6d44a') +
        steamF +
        dots(
            [
                [22, 29, '#fff6c0'],
                [32, 27, '#fff6c0'],
                [42, 29, '#fff6c0'],
                [27, 31, '#f0b020'],
                [38, 31, '#f0b020'],
            ],
            2,
        ),
    pickledTurmeric: () => pot('#f0a020', '#c8453a', 'turmeric'),
    // ---- l'arachide
    roastedPeanuts: () =>
        bowl('#e8d2a8') +
        sub('peanut', 16, 6, 18) +
        sub('peanut', 30, 4, 18) +
        dots(
            [
                [22, 30, '#c8805a'],
                [34, 31, '#c8805a'],
                [44, 30, '#c8805a'],
            ],
            2.8,
        ),
    peanutOil: () => oil('#e8b848', 'peanut'),
    peanutButter: () => pot('#c89050', '#e8c070', 'peanut'),
    peanutBrittle: () =>
        woodBoard() +
        R(10, 36, 20, 10, 2.4, '#d89a3a', 1.8) +
        R(32, 38, 20, 9, 2.4, '#c8862a', 1.8) +
        dots(
            [
                [16, 41, '#c8805a'],
                [24, 40, '#c8805a'],
                [38, 42, '#c8805a'],
                [46, 41, '#c8805a'],
            ],
            1.8,
        ),
    chocPeanuts: () =>
        plate(46) +
        [
            [20, 41],
            [32, 38],
            [44, 42],
            [27, 46],
            [38, 46],
        ]
            .map(([x, y]) => E(x, y, 5, 4, '#5b3a29', 20, 1.6) + FE(x - 1.4, y - 1.2, 1.4, 0.8, '#fff', 0.5))
            .join(''),
    // ---- le haricot rouge
    redBeanRice: () =>
        bowl('#fbf3e4') +
        steamF +
        dots(
            [
                [20, 28, '#8a1f2e'],
                [28, 30, '#8a1f2e'],
                [36, 28, '#8a1f2e'],
                [44, 30, '#8a1f2e'],
                [32, 26, '#8a1f2e'],
            ],
            2.4,
        ),
    canRedBeans: () => pot('#a02a3a', '#8a8a90', 'redBean'),
    redBeanPaste: () => plate(46) + E(32, 40, 17, 7, '#7a2a3a', 0, 1.8) + FE(26, 38, 6, 1.6, '#c86a7a', 0.6) + sub('redBean', 24, 20, 16),
    dorayaki: () =>
        plate(46) +
        E(32, 44, 20, 8, '#c88a40', 0, 1.8) +
        E(32, 40, 20, 8, '#e0a850', 0, 1.8) +
        E(32, 40, 15, 4, '#7a2a3a', 0, 0) +
        E(32, 37, 18, 6, '#e0a850', 0, 1.8) +
        FE(26, 35, 5, 1.4, '#f6dca0', 0.7),
    // ---- le piment des îles
    chiliPowder: () => pouch('#d8302a', 'islandChili'),
    rougail: () =>
        bowl('#e8503a') +
        dots(
            [
                [22, 28, '#f2c23a'],
                [32, 27, '#5fa040'],
                [42, 28, '#fff6e0'],
            ],
            2.6,
        ) +
        steamF,
    hotSauce: () => bottle('#d8302a', 'islandChili', '#e4f5ff', '#2a2a2a'),
    spicedRum: () => bottle('#c8803a', 'islandChili', '#e4f5ff', '#8a2a1a'),
    // ---- l'aloe vera
    aloeGel: () => pot('#bfeed0', '#5fb87a', 'aloe'),
    aloeSoap: () => soap('#7ad8a0', 'aloe'),
    soothingCream: () => pot('#e8f6e8', '#6cc88a', 'aloe'),
    aloeLimeJuice: () => juiceB('#b8e8a0', 'aloe'),
    // ---- l'hibiscus
    driedHibiscus: () =>
        bowl('#e8d2c8') +
        sub('hibiscus', 18, 4, 18) +
        sub('hibiscus', 34, 6, 16) +
        dots(
            [
                [26, 30, '#a01030'],
                [44, 29, '#a01030'],
            ],
            2.4,
        ),
    bissap: () => tallGlass('#b81c3a', sub('hibiscus', 4, 0, 18), '#fff0f4', '#d8203f'),
    hibiscusJam: () => pot('#a01030', '#fffaf0', 'hibiscus'),
    hibiscusSorbet: () => scoops('#d8405a', '#e8506a', '#c82a48'),
    // ---- le patchouli
    patchouliEssence: () => oil('#a89a58', 'patchouli', '#5a3f86'),
    patchouliPerfume: () => bottle('#b898d8', 'patchouli', '#e4f5ff', '#8a6a3a'),
    patchouliCandle: () => sub('candle', 0, 0, 64) + badge('patchouli'),
    patchouliSachet: () =>
        SHADOW(32, 58, 22, 3) +
        P('M12 22 L52 22 L50 56 Q50 58 47 58 L17 58 Q14 58 14 56Z', '#e8d8b8') +
        L('M12 22 L22 16 L42 16 L52 22', 2, '#8a6a3a') +
        L('M14 26 L50 26', 1.4, '#b8a078') +
        sub('patchouli', 22, 28, 22),
};
Object.assign(items, D);
export const DISHES_132 = Object.keys(D);
