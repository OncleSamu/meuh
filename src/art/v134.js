// 1.34 : sept boissons du comptoir et six produits de cave.
import { C, E, F, FC, FE, HL, L, P, R, SHADOW, items, sub } from './kit.js';
import { wheel } from './items2.js';
import { tea, slice, espresso, mug, glassMug } from './v117drinks.js';

const D = {
    // ---- les boissons ----
    hempTisane: tea('#a8b85a', sub('hemp', 40, 2, 22)),
    mandarinTea: tea('#f09a3a', slice(50, 18, '#e87a1a', '#ffc070')),
    chicoryCoffee: espresso('#5a3a22', sub('chicory', 42, 4, 22)),
    hibiscusTea: tea('#c8283e', sub('hibiscus', 40, 2, 22)),
    macchiato: espresso('#6a3a1e', E(32, 32.2, 5.5, 1.5, '#fffdf3', 0, 0) + FE(30, 31.8, 2, 0.6, '#fff', 0.8)),
    frappe: glassMug(
        '#b88858',
        P('M14 16 Q16 8 29 8 Q42 8 44 16 Q29 21 14 16Z', '#fffaf0', 1.8),
        R(22, 34, 8, 8, 2, '#ffffff', 1.4) + R(32, 42, 8, 8, 2, '#ffffff', 1.4) + L('M38 14 L46 -2', 3.2) + L('M38 14 L46 -2', 1.6, '#e8364b'),
    ),
    spicedCoffee: mug(
        '#6a3a1e',
        P('M14 17 Q16 9 29 9 Q42 9 44 17 Q29 22 14 17Z', '#fffaf0', 1.8) +
            dotsOf(
                [
                    [22, 14],
                    [29, 12],
                    [36, 14],
                ],
                '#a8693a',
            ),
        sub('ginger', 36, 36, 22),
        '#e8a23a',
    ),
    // ---- la cave : le munster, un disque à croûte orangée lavée ----
    munster: wheel({
        rind: '#e8985a',
        rindD: '#b8662a',
        side: '#dd8844',
        paste: '#f6dc9a',
        pasteD: '#e8c070',
        extra: L('M12 30 Q32 34 52 30', 1.4, '#b8662a') + FC(44, 24, 1.2, '#b8662a') + FC(20, 26, 1.2, '#b8662a'),
    }),
    // le cantal : grosse meule grise et dorée, pâte jaune pressée
    cantal: wheel({
        rind: '#c8b08a',
        rindD: '#9a8058',
        side: '#b89c70',
        paste: '#fbe27a',
        pasteD: '#f0c850',
        extra: L('M10 38 Q32 44 54 38', 1.2, '#9a8058') + FC(18, 28, 1.4, '#9a8058') + FC(40, 25, 1.2, '#9a8058'),
    }),
    // le valençay : une pyramide tronquée, cendrée de gris
    valencay:
        SHADOW(32, 56, 24, 3) +
        P('M10 50 L22 20 L42 20 L54 50 Q32 56 10 50Z', '#8a8a90') +
        P('M22 20 L42 20 L44 26 L20 26Z', '#a8a8ae', 1.6) +
        P('M10 50 L20 26 L44 26 L54 50 Q32 56 10 50Z', '#9a9aa0', 0) +
        P('M38 22 L56 48 Q48 54 40 54 L32 24Z', '#fbf4e0', 1.8) +
        L('M16 40 L26 28 M34 30 L44 44', 1.2, '#6a6a70') +
        [
            [22, 44],
            [30, 36],
            [46, 40],
            [28, 48],
        ]
            .map(([x, y]) => FC(x, y, 1.2, '#6a6a70'))
            .join('') +
        HL(20, 32, 3, 8, 20, 0.4) +
        P('M10 50 L22 20 L42 20 L54 50 Q32 56 10 50Z', 'none'),
    // le saucisson sec : un boyau gris-blanc couvert de fleurette, ficelé, suspendu
    drySausage:
        SHADOW(32, 60, 18, 3) +
        L('M32 2 L32 12', 1.8) +
        L('M32 12 L32 16', 2.4, '#c8a878') +
        P('M20 18 Q32 12 44 18 L45 52 Q32 60 19 52Z', '#d8d4c8') +
        F('M22 22 Q32 17 42 22 L43 48 Q32 54 21 48Z', '#ece8dc', 0.7) +
        [
            [26, 28],
            [36, 26],
            [30, 36],
            [38, 40],
            [25, 44],
            [34, 48],
            [28, 22],
        ]
            .map(([x, y]) => FC(x, y, 1.2, '#b8b0a0'))
            .join('') +
        L('M20 26 L44 26 M20 36 L44 36 M20 46 L44 46', 1.6, '#c8a878') +
        P('M26 52 Q32 56 38 52 Q38 58 32 58 Q26 58 26 52Z', '#e8364b', 0) +
        HL(24, 30, 2, 10, 0, 0.5) +
        P('M20 18 Q32 12 44 18 L45 52 Q32 60 19 52Z', 'none'),
    // la coppa : un gros cylindre marbré de gras, filet de ficelle
    coppa:
        SHADOW(32, 58, 26, 3) +
        P('M6 32 Q6 20 32 20 Q58 20 58 32 L56 44 Q56 52 32 52 Q8 52 8 44Z', '#a8423a') +
        E(32, 24, 26, 6, '#c8504a', 0, 1.6) +
        [
            [16, 34],
            [26, 30],
            [38, 34],
            [46, 30],
            [22, 42],
            [34, 44],
            [46, 42],
        ]
            .map(([x, y]) => E(x, y, 4.4, 1.8, '#fbeed8', 25, 0))
            .join('') +
        L('M12 22 L12 50 M24 22 L24 52 M36 22 L36 52 M48 22 L48 50', 1.4, '#c8a878') +
        L('M8 30 L56 34 M8 42 L56 40', 1.2, '#c8a878') +
        HL(14, 28, 4, 10, 0, 0.35) +
        P('M6 32 Q6 20 32 20 Q58 20 58 32 L56 44 Q56 52 32 52 Q8 52 8 44Z', 'none'),
    // le fromage aux fleurs d'alpage : une meule aux fleurs séchées pressées sur la croûte
    alpineFlowerCheese: wheel({
        rind: '#e8d8a8',
        rindD: '#b8a070',
        side: '#dcc890',
        paste: '#fbe48a',
        pasteD: '#f0c850',
        extra:
            [
                [14, 28],
                [22, 25],
                [30, 27],
                [38, 24],
                [46, 27],
                [18, 33],
                [40, 31],
            ]
                .map(([x, y], k) => FC(x, y, 1.6, k % 2 ? '#a07ad8' : '#f8f0c0'))
                .join('') + L('M24 29 Q28 24 32 28 M36 29 Q40 25 44 28', 1.2, '#4a8a3a'),
    }),
};
function dotsOf(list, c) {
    return list.map(([x, y]) => C(x, y, 1.4, c, 0)).join('');
}
Object.assign(items, Object.fromEntries(Object.entries(D).map(([k, v]) => [k, () => v])));
export const ART_134 = Object.keys(D);
