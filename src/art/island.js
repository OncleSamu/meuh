// L'île (bêta 3) : fruits et cultures tropicales, palmiers, produits, machines, bâtiments, villageois et carte.
import {
    BLD,
    C,
    E,
    F,
    FC,
    FE,
    G,
    GD,
    GL,
    HL,
    KINDS,
    L,
    P,
    R,
    SHADOW,
    badge,
    board,
    bottle,
    bowlB,
    cone,
    glassCup,
    items,
    jar,
    leaf,
    machines,
    mound,
    people,
    perfume,
    plateB,
    readyExtra,
    sack,
    soap,
    stem,
    sub,
    tart,
    teacup,
    youngExtra,
} from './kit.js';
import { bust, face, SKIN } from './people.js';
import { scaffold, subAny, grey, greyD } from './buildings.js';
import { setPalm } from './plants.js';

const YEL = '#ffd84a',
    MANGO = '#ffa630',
    COCO = '#8b5a2b',
    CREAM = '#fbf7ee';

// ---------------- fruits et cultures ----------------
const bananaShape = (rot, dx = 0, y = 34, sc = 1) =>
    `<g transform="translate(${32 + dx} ${y}) rotate(${rot}) scale(${sc})">` +
    P('M-18 -4 Q0 18 20 -6 Q22 -2 20 2 Q0 26 -20 0Z', YEL) +
    L('M-16 0 Q0 14 18 -2', 1.4, '#e0b020') +
    R(18, -9, 5, 6, 1.5, '#7a5a2a', 1.6) +
    FE(-19, -1, 1.6, 2.2, '#5e3a1e') +
    `</g>`;

Object.assign(items, {
    banana: () => SHADOW(32, 56, 22, 3) + bananaShape(10, 2) + bananaShape(-6, -2) + bananaShape(-22, 0) + HL(24, 34, 6, 1.5, 10, 0.5),
    coconut: () =>
        SHADOW(32, 57, 22, 3) +
        C(24, 36, 16, COCO) +
        L('M14 30 Q20 26 26 28 M12 40 Q18 36 24 40 M22 48 Q28 44 34 46', 1.3, '#5e3a1e') +
        FC(20, 28, 1.6, '#3a2618') +
        FC(26, 27, 1.6, '#3a2618') +
        FC(23, 32, 1.6, '#3a2618') +
        P('M34 44 Q36 28 50 28 Q60 30 58 44 Q50 52 34 44Z', COCO) +
        P('M38 43 Q40 32 50 32 Q56 34 55 43 Q48 48 38 43Z', CREAM) +
        HL(18, 30, 3, 5, 20, 0.35),
    mango: () =>
        SHADOW(32, 57, 18, 3) +
        P('M30 14 C46 12 54 30 50 44 C46 56 30 58 22 50 C12 40 16 16 30 14Z', MANGO) +
        F('M30 14 C40 13 46 20 48 28 C40 22 30 20 22 22 C24 17 26 15 30 14Z', '#e8452f', 0.85) +
        P('M30 14 C46 12 54 30 50 44 C46 56 30 58 22 50 C12 40 16 16 30 14Z', 'none') +
        L('M30 14 L31 8', 2.4, '#6b3d1e') +
        leaf(31, 9, 13, -20, G) +
        HL(24, 30, 3, 6, 20, 0.45),
    papaya: () =>
        SHADOW(32, 57, 24, 3) +
        E(22, 36, 12, 20, '#f2b23a', -20) +
        F('M14 28 Q18 22 24 20', 'none') +
        L('M16 44 Q20 30 28 22', 1.3, '#d08a20') +
        P('M34 52 Q30 30 44 16 Q60 24 58 42 Q54 56 34 52Z', '#9cc84a') +
        P('M37 49 Q34 31 45 20 Q57 27 55 42 Q52 52 37 49Z', '#ff8a3a') +
        [
            [44, 30],
            [46, 36],
            [44, 42],
            [48, 40],
            [42, 36],
        ]
            .map(([x, y]) => FC(x, y, 1.8, '#2a1a12'))
            .join('') +
        HL(18, 30, 2.5, 6, 20, 0.45),
    lime: () =>
        SHADOW(32, 57, 20, 3) +
        E(24, 36, 15, 13, '#7cc23a', -10) +
        FC(20, 34, 0.9, '#5e9a2a') +
        FC(26, 42, 0.9, '#5e9a2a') +
        P('M17 26 Q16 20 20 18', 'none', 2) +
        leaf(18, 24, 12, -120, G) +
        C(44, 40, 12, '#7cc23a') +
        C(44, 40, 9, '#d8f5a2', 1.4) +
        L('M44 31 L44 49 M35 40 L53 40 M38 34 L50 46 M50 34 L38 46', 1.1, '#9fd16a') +
        HL(19, 31, 3, 4, 20, 0.45),
    avocado: () =>
        SHADOW(32, 57, 22, 3) +
        P('M20 14 C28 14 32 26 32 34 C34 46 28 54 20 54 C10 54 6 44 10 34 C12 26 12 14 20 14Z', '#3f6b2a') +
        P('M42 16 C50 16 54 28 54 36 C56 48 50 56 42 56 C32 56 28 46 32 36 C34 28 34 16 42 16Z', '#3f6b2a') +
        P('M42 19 C48 20 51 29 51 36 C53 46 48 53 42 53 C34 53 31 45 34 37 C36 30 36 20 42 19Z', '#d9ec8a', 1.4) +
        C(42, 42, 7, '#8b5a2b', 1.8) +
        HL(40, 40, 2, 1.4, -30, 0.5) +
        HL(16, 26, 2, 5, 15, 0.3),
    guava: () =>
        SHADOW(32, 57, 22, 3) +
        C(22, 38, 14, '#a8d65c') +
        FC(16, 34, 1, '#7fae3a') +
        FC(24, 44, 1, '#7fae3a') +
        L('M22 24 L23 19', 2, '#6b3d1e') +
        C(44, 38, 13, '#a8d65c') +
        C(44, 38, 10.5, '#ff9db0', 1.4) +
        [
            [41, 35],
            [47, 36],
            [44, 41],
            [40, 41],
            [48, 41],
        ]
            .map(([x, y]) => FC(x, y, 1, '#f7e3c0'))
            .join('') +
        HL(17, 33, 3, 4, 20, 0.45),
    greenCoffee: () =>
        SHADOW(32, 56, 22, 3) +
        [
            [20, 44, 20],
            [32, 48, -10],
            [44, 44, 30],
            [26, 34, -30],
            [38, 34, 15],
            [32, 24, 0],
        ]
            .map(([x, y, r]) => E(x, y, 7, 9, '#a8b86a', r, 2) + L(`M${x} ${y - 6} Q${x + 2} ${y} ${x} ${y + 6}`, 1.4, '#6b7a3a'))
            .join(''),
    lychee: () =>
        SHADOW(32, 57, 20, 3) +
        C(24, 38, 13, '#d9364b') +
        [
            [18, 34],
            [24, 30],
            [30, 36],
            [20, 42],
            [28, 44],
            [24, 38],
        ]
            .map(([x, y]) => P(`M${x - 2} ${y} L${x} ${y - 2.5} L${x + 2} ${y}Z`, '#a8243a', 1))
            .join('') +
        L('M24 25 Q26 18 30 15', 1.8, '#6b3d1e') +
        P('M36 50 Q34 34 44 30 Q56 32 54 46 Q50 54 36 50Z', '#d9364b') +
        C(45, 42, 9, '#f7f3ea', 1.6) +
        HL(42, 38, 2.5, 3, 20, 0.7),
    passionFruit: () =>
        SHADOW(32, 57, 22, 3) +
        C(22, 38, 14, '#6b3a6b') +
        FC(16, 32, 1, '#9a6a9a') +
        FC(26, 44, 1.2, '#9a6a9a') +
        HL(17, 33, 3, 4, 20, 0.35) +
        C(45, 38, 12, '#6b3a6b') +
        C(45, 38, 9.5, '#f2c14e', 1.4) +
        [
            [42, 35],
            [48, 36],
            [45, 41],
            [41, 41],
            [49, 41],
            [45, 34],
        ]
            .map(([x, y]) => FC(x, y, 1.4, '#3a2618'))
            .join(''),
    sweetPotato: () =>
        SHADOW(32, 56, 24, 3) +
        P('M8 40 C10 28 30 24 44 28 C56 30 58 40 54 46 C46 54 22 54 12 48 C8 46 8 44 8 40Z', '#b8463a') +
        L('M16 36 Q20 38 24 36 M34 44 Q38 46 42 44 M42 32 Q46 34 50 32', 1.3, '#7a2a22') +
        L('M54 38 L60 34 M8 42 L3 44', 2, '#7a2a22') +
        HL(20, 32, 6, 2, -10, 0.35),
    cassava: () =>
        SHADOW(32, 57, 24, 3) +
        P('M6 36 C12 30 40 30 56 22 C60 26 58 30 54 32 C40 40 14 44 8 42Z', '#8b5a2b') +
        P('M10 48 C18 42 42 42 58 38 C60 42 58 46 54 46 C40 52 18 54 12 52Z', '#a8693a') +
        L('M18 36 L20 40 M34 34 L36 38 M24 48 L26 52 M40 45 L42 49', 1.2, '#5e3a1e') +
        P('M54 22 C58 20 62 22 60 26 C58 28 56 26 54 22Z', CREAM, 1.6) +
        P('M58 38 C62 37 63 41 60 43 C58 44 57 41 58 38Z', CREAM, 1.6),
    ginger: () =>
        SHADOW(32, 56, 22, 3) +
        P('M10 40 C10 32 20 30 26 34 C28 26 36 24 40 30 C46 24 56 28 54 36 C58 40 56 48 48 48 C40 52 30 50 24 48 C16 50 10 46 10 40Z', '#e2c08a') +
        L('M22 38 Q26 40 30 38 M36 40 Q40 42 44 40 M30 46 Q34 47 38 46', 1.2, '#b8935a') +
        P('M38 30 Q40 22 44 18', 'none', 2) +
        L('M40 26 Q42 20 46 16', 2.2, '#9fd16a') +
        HL(20, 36, 4, 1.6, -10, 0.45),
    tiare: () =>
        SHADOW(32, 56, 16, 2.5) +
        leaf(32, 46, 16, 30, G) +
        leaf(32, 46, 16, 150, GD) +
        [0, 60, 120, 180, 240, 300].map(a => `<g transform="translate(32 32) rotate(${a})">${E(0, -11, 6, 11, '#ffffff', 0, 2)}</g>`).join('') +
        C(32, 32, 5, '#ffd23f', 1.8) +
        FC(31, 31, 1.6, '#fff', 0.7),
});

// les plants des cultures de l'île, dans les parcelles
const youngTropic = (c = G) =>
    mound() + leaf(32, 54, 18, -150, c, 0.36) + leaf(32, 54, 18, -30, c, 0.36) + leaf(32, 54, 20, -100, GL, 0.36) + leaf(32, 54, 20, -80, c, 0.36);
const readyWith = (id, leaves) => mound() + leaves + `<g transform="translate(16 4) scale(.5)">${items[id]()}</g>`;
Object.assign(youngExtra, {
    passionFruit: () => mound() + L('M32 56 Q24 40 32 30 Q40 20 32 12', 2, GD) + leaf(30, 40, 12, -160, G) + leaf(34, 28, 12, -20, G),
    sweetPotato: () => youngTropic(),
    cassava: () => mound() + stem('M32 56 L32 30', '#a8693a', 2) + [-150, -110, -70, -30].map(a => leaf(32, 30, 14, a, G, 0.18)).join(''),
    ginger: () => mound() + [-110, -95, -80, -65].map(a => leaf(32, 56, 24, a, G, 0.14)).join(''),
    tiare: () => youngTropic(GD),
});
Object.assign(readyExtra, {
    passionFruit: () =>
        mound() +
        L('M32 56 Q22 38 32 28 Q42 18 32 8', 2, GD) +
        leaf(28, 40, 12, -160, G) +
        leaf(36, 26, 12, -20, G) +
        C(22, 30, 6, '#6b3a6b', 1.8) +
        C(42, 40, 6, '#6b3a6b', 1.8) +
        HL(20, 28, 1.5, 2, 20, 0.4),
    sweetPotato: () => readyWith('sweetPotato', [-160, -120, -60, -20].map(a => leaf(32, 54, 16, a, G, 0.4)).join('')),
    cassava: () =>
        stem('M32 54 L32 20', '#a8693a', 2) +
        [-160, -120, -60, -20].map(a => leaf(32, 22, 15, a, GD, 0.18)).join('') +
        [-150, -30].map(a => leaf(32, 36, 12, a, G, 0.2)).join('') +
        `<g transform="translate(16 32) scale(.48)">${items.cassava()}</g>` +
        mound(),
    ginger: () => readyWith('ginger', [-120, -100, -80, -60].map(a => leaf(32, 56, 26, a, G, 0.14)).join('')),
    tiare: () =>
        mound() +
        [-150, -110, -70, -30].map(a => leaf(32, 54, 18, a, GD, 0.38)).join('') +
        [
            [22, 30],
            [42, 28],
            [32, 18],
        ]
            .map(
                ([x, y]) =>
                    [0, 72, 144, 216, 288].map(a => `<g transform="translate(${x} ${y}) rotate(${a})">${E(0, -5, 3, 5, '#fff', 0, 1.4)}</g>`).join('') +
                    C(x, y, 2.4, '#ffd23f', 1.2),
            )
            .join(''),
});

// ---------------- palmiers : bananier, cocotier, papayer ----------------
const frond = (x, y, len, ang, c) =>
    `<g transform="translate(${x} ${y}) rotate(${ang})">` +
    P(`M0 0 C${len * 0.3} ${-len * 0.28} ${len * 0.7} ${-len * 0.22} ${len} ${len * 0.12} C${len * 0.7} ${len * 0.02} ${len * 0.3} ${len * 0.05} 0 0Z`, c, 2) +
    L(`M${len * 0.15} ${-len * 0.04} L${len * 0.85} ${len * 0.06}`, 1.1, GD) +
    `</g>`;
const PALM_LEAF = { banana: '#7ccf4a', coconut: '#5fb43a', papaya: '#6cc04a' };
export function palmTree(id, stage) {
    const old = stage === 3;
    const leafC = old ? '#b9b34a' : PALM_LEAF[id] || G;
    const trunk =
        id === 'coconut'
            ? P('M28 58 Q26 40 32 20 L36 20 Q32 40 36 58Z', '#a8793a') + L('M29 50 L35 50 M29 42 L35 42 M30 34 L35 34 M31 26 L35 26', 1.3, '#7a5a2a')
            : id === 'papaya'
              ? R(29, 22, 6, 36, 2, '#9aa86a') + L('M29 30 L35 30 M29 38 L35 38 M29 46 L35 46', 1.2, '#6b7a3a')
              : R(28, 26, 8, 32, 3, '#9bb35a') + L('M30 32 Q32 40 30 52 M34 30 Q35 40 34 54', 1.1, '#6b8a3a');
    const top = id === 'coconut' ? [34, 20] : id === 'papaya' ? [32, 22] : [32, 26];
    const fronds = [-170, -135, -100, -70, -40, -8].map((a, k) => frond(top[0], top[1], k % 2 ? 22 : 25, a, k % 2 ? leafC : old ? '#a8a23a' : GD)).join('');
    let fruit = '';
    if (stage >= 2) {
        if (id === 'coconut') fruit = [-6, 0, 6].map((dx, k) => C(top[0] + dx, top[1] + 4 + (k % 2) * 2, 4.5, COCO, 1.8)).join('');
        else if (id === 'banana')
            fruit =
                L(`M${top[0] + 6} ${top[1] + 2} L${top[0] + 8} ${top[1] + 16}`, 1.6, '#6b5a2a') +
                [0, 4, 8].map(dy => P(`M${top[0] + 3} ${top[1] + 4 + dy} q5 5 10 0`, '#ffd84a', 1.6)).join('');
        else
            fruit = [
                [-5, 6],
                [5, 7],
                [0, 12],
            ]
                .map(([dx, dy]) => E(top[0] + dx, top[1] + dy, 3.5, 5, old ? '#d9a23a' : '#f2b23a', 0, 1.6))
                .join('');
        if (old) fruit = fruit.split('</g>').slice(0, 1).join('</g>');
    }
    return SHADOW(32, 58, 14, 3) + trunk + fronds + fruit;
}
setPalm(palmTree);

// ---------------- les produits de l'île ----------------
const umbrella = (x, y) =>
    L(`M${x} ${y} L${x + 10} ${y - 16}`, 1.6) +
    P(`M${x + 2} ${y - 18} Q${x + 10} ${y - 30} ${x + 20} ${y - 14}Z`, '#e8364b', 1.6) +
    L(`M${x + 10} ${y - 16} L${x + 12} ${y - 25}`, 1, '#fff');
const flame = (x, y) =>
    P(`M${x} ${y} Q${x - 5} ${y - 8} ${x} ${y - 16} Q${x + 2} ${y - 8} ${x + 6} ${y - 10} Q${x + 6} ${y - 2} ${x} ${y}Z`, '#ffa630', 1.4) +
    F(`M${x} ${y - 2} Q${x - 2} ${y - 7} ${x} ${y - 11} Q${x + 3} ${y - 6} ${x} ${y - 2}Z`, '#ffd84a');
Object.assign(items, {
    pineappleJuice: () => bottle(YEL, 'pineapple'),
    mangoJuice: () => bottle(MANGO, 'mango'),
    guavaJuice: () => bottle('#ff9db0', 'guava'),
    coconutMilk: () => bottle(CREAM, 'coconut', '#e4f5ff', COCO),
    bananaSmoothie: () => glassCup('#ffe58a', badge('banana')),
    mangoPassion: () => glassCup('#ffab3d', FC(30, 30, 1.5, '#3a2618') + FC(36, 36, 1.5, '#3a2618') + badge('passionFruit')),
    lassi: () => glassCup('#ffe2a6', badge('mango')),
    limeade: () => glassCup('#d8f5a2', C(40, 18, 7, '#7cc23a', 1.6) + C(40, 18, 5, '#d8f5a2', 1) + badge('lime')),
    islandCocktail: () =>
        SHADOW(32, 58, 20, 3) +
        P('M10 34 Q12 58 32 58 Q52 58 54 34Z', COCO) +
        E(32, 34, 22, 6, '#ffb03a') +
        L('M14 44 Q32 50 50 44', 1.2, '#5e3a1e') +
        umbrella(30, 30) +
        C(46, 30, 5, '#d9364b', 1.4),
    bananaBread: () =>
        board() +
        R(10, 22, 44, 22, 6, '#b8793a') +
        E(32, 23, 21, 5, '#8b5a2b') +
        [18, 28, 38, 46].map((x, k) => E(x, 22 + (k % 2), 4, 2.5, '#ffe58a', 0, 1.4)).join(''),
    coconutFlan: () =>
        plateB() +
        P('M16 44 L20 24 L44 24 L48 44Z', '#ffe7a6') +
        E(32, 24, 12, 3.5, '#c8793a') +
        F('M20 27 L22 33 L24 27 L28 34 L30 27Z', '#c8793a', 0.8) +
        dots(
            [
                [26, 22, '#fff'],
                [34, 21, '#fff'],
                [38, 23, '#fff'],
            ],
            1.2,
        ),
    pineappleCake: () =>
        SHADOW(32, 56, 25, 3) +
        R(8, 30, 48, 22, 6, '#e8a948') +
        E(32, 30, 24, 7, '#ffd84a') +
        [
            [20, 30],
            [32, 28],
            [44, 30],
        ]
            .map(([x, y]) => E(x, y, 6, 3, '#ffe58a', 0, 1.6) + E(x, y, 2.4, 1.2, '#e8a948', 0, 1.2) + FC(x, y, 1.4, '#d9364b'))
            .join(''),
    limePie: () =>
        tart('#d8f5a2', [
            [22, 36, '#fff'],
            [32, 34, '#fff'],
            [42, 36, '#fff'],
            [27, 40, '#fff'],
            [37, 40, '#fff'],
        ]) + badge('lime'),
    blancManger: () =>
        plateB() + P('M18 44 Q16 22 32 18 Q48 22 46 44Z', '#ffffff') + HL(25, 28, 2.5, 7, 10, 0.6) + F('M30 18 Q32 12 36 14', 'none') + badge('coconut'),
    sweetPotatoCake: () =>
        plateB() +
        P('M12 42 L32 22 L52 42Z', '#d9763a') +
        P('M12 42 L52 42 L52 46 L12 46Z', '#b85a2a', 2) +
        E(32, 26, 3, 2, '#fff', 0, 1.2) +
        badge('sweetPotato'),
    coffee: () => sack('#5a3a22', 'greenCoffee'),
    cafeLatte: () => teacup('#c89b6a', P('M27 29 Q32 26 37 29 Q32 32 27 29Z', '#fff', 1) + badge('coffee')),
    tiramisu: () =>
        SHADOW(32, 57, 26, 3) +
        R(8, 30, 48, 24, 4, '#f7f3ea') +
        F('M10 38 L54 38 L54 41 L10 41Z', '#8b5a2b', 0.85) +
        F('M10 47 L54 47 L54 50 L10 50Z', '#8b5a2b', 0.85) +
        R(8, 26, 48, 8, 4, '#6b3d1e') +
        [14, 22, 30, 38, 46].map(x => FC(x, 29, 1, '#3a2618')).join(''),
    bananasFlambe: () => plateB() + bananaShape(0, 0, 42, 0.8) + flame(26, 40) + flame(38, 38),
    coconutRice: () =>
        bowlB(CREAM) +
        dots(
            [
                [24, 30, '#fff'],
                [32, 28, '#fff'],
                [40, 31, '#fff'],
            ],
            1.6,
        ) +
        badge('coconut'),
    coconutCurry: () =>
        bowlB('#f2b23a') +
        dots(
            [
                [22, 30, '#ff8a3a'],
                [32, 28, '#9fd16a'],
                [42, 31, '#ff8a3a'],
                [28, 32, '#fff'],
            ],
            2.2,
        ) +
        badge('ginger'),
    sweetPotatoMash: () => bowlB('#f08a3a', 30) + R(28, 22, 9, 6, 1.5, '#ffe7a6', 1.4) + badge('sweetPotato'),
    cassavaCakes: () =>
        plateB() +
        [
            [22, 42],
            [42, 42],
            [32, 34],
        ]
            .map(([x, y]) => E(x, y, 10, 5, '#e8b35a', 0, 2) + FC(x - 3, y - 1, 1, '#b8793a') + FC(x + 3, y, 1, '#b8793a'))
            .join(''),
    guacamole: () =>
        bowlB('#9fd16a') +
        dots(
            [
                [26, 29, '#e2412f'],
                [36, 31, '#fff'],
            ],
            1.6,
        ) +
        P('M46 18 L58 26 L48 30Z', '#f2c14e', 1.6) +
        P('M8 22 L20 20 L16 30Z', '#f2c14e', 1.6),
    exoticSalad: () =>
        bowlB(CREAM) +
        dots(
            [
                [22, 30, MANGO],
                [30, 28, '#ff8a3a'],
                [38, 30, '#7cc23a'],
                [44, 31, MANGO],
                [33, 32, '#9fd16a'],
            ],
            2.6,
        ),
    accras: () =>
        plateB() +
        [
            [20, 42],
            [32, 44],
            [44, 42],
            [26, 34],
            [38, 34],
        ]
            .map(([x, y]) => C(x, y, 6, '#d9963a', 1.8) + FC(x - 2, y - 2, 1.6, '#f2c14e', 0.8))
            .join('') +
        leaf(46, 32, 10, -40, G),
    mangoSorbet: () =>
        cone([
            [32, 24, 11, MANGO],
            [32, 12, 8, '#ffc94a'],
        ]),
    coconutIce: () =>
        cone([
            [32, 24, 11, CREAM],
            [32, 12, 8, '#a8793a'],
        ]),
    passionSorbet: () =>
        cone([
            [32, 24, 11, '#f2c14e'],
            [32, 12, 8, '#9a5a9a'],
        ]),
    coconutRocks: () =>
        plateB() +
        [
            [20, 40],
            [44, 40],
            [32, 32],
        ]
            .map(
                ([x, y]) =>
                    P(`M${x - 8} ${y + 4} Q${x - 9} ${y - 6} ${x} ${y - 9} Q${x + 9} ${y - 6} ${x + 8} ${y + 4}Z`, '#f7efe0', 1.8) +
                    E(x, y + 4, 8, 2.5, '#a8693a', 0, 1.6),
            )
            .join(''),
    guavaPaste: () => board() + R(12, 24, 40, 18, 3, '#d9566b') + L('M24 24 L24 42 M38 24 L38 42', 1.4, '#a8364b') + HL(18, 28, 4, 1.5, 0, 0.4),
    mangoChutney: () => jar('#e8902a', '#c8453a', 'mango'),
    lycheeSyrup: () => jar('#f6eadf', '#e8364b', 'lychee'),
    coconutOil: () => jar('#fff8e6', COCO, 'coconut'),
    coconutSoap: () => soap('#f7f1e3', 'coconut'),
    monoi: () => perfume('#fff1c8', '#ffffff', 'tiare'),
    coconutRope: () =>
        SHADOW(32, 56, 24, 3) +
        E(32, 40, 24, 14, '#c8a06a') +
        E(32, 40, 18, 10, '#b8905a', 0, 1.6) +
        E(32, 40, 12, 6, '#c8a06a', 0, 1.6) +
        E(32, 40, 6, 3, '#8b6a3a', 0, 1.4) +
        L('M54 40 Q60 30 52 22', 4.5) +
        L('M54 40 Q60 30 52 22', 2.5, '#c8a06a'),
    gingerTea: () => teacup('#e8c25a', badge('ginger')),
    rum: () => bottle('#fdf6e3', 'sugarcane', '#e4f5ff', COCO),
    arrangedRum: () => jar('#f2cf7a', COCO, 'pineapple') + E(26, 38, 3, 6, '#ffd84a', 20, 1.2) + E(36, 44, 2, 7, '#3a2618', -10, 1),
    coconutPunch: () => glassCup('#fff3dc', badge('coconut')),
});
// petits points ronds (comme kit.dots, en local pour ne pas dépendre de l'ordre)
function dots(list, r = 2.4) {
    return list.map(([x, y, c]) => C(x, y, r, c, 1.4)).join('');
}

// ---------------- machines ----------------
const strawRoof = (x0, x1, y, h) =>
    P(`M${x0} ${y} L${(x0 + x1) / 2} ${y - h} L${x1} ${y}Z`, '#e8c26a') +
    L(
        `M${x0 + 4} ${y - 2} L${x0 + 6} ${y + 4} M${x0 + 12} ${y - 2} L${x0 + 13} ${y + 4} M${x1 - 12} ${y - 2} L${x1 - 13} ${y + 4} M${x1 - 4} ${y - 2} L${x1 - 6} ${y + 4} M${(x0 + x1) / 2} ${y - 2} L${(x0 + x1) / 2} ${y + 4}`,
        1.6,
        '#c89a3a',
    );
Object.assign(machines, {
    juiceBar: () =>
        SHADOW(32, 60, 28, 3) +
        L('M12 22 L12 46 M52 22 L52 46', 3, '#8b5a2b') +
        strawRoof(4, 60, 24, 16) +
        R(6, 40, 52, 18, 3, '#8b5a2b') +
        L('M10 46 L54 46 M10 52 L54 52', 1.2, '#5e3a1e') +
        sub('pineappleJuice', 12, 22, 20) +
        sub('mangoPassion', 32, 22, 20),
    islandBakery: () =>
        SHADOW(32, 60, 28, 3) +
        P('M8 58 L8 34 Q32 10 56 34 L56 58Z', '#f2a65a') +
        P('M20 58 L20 44 Q32 32 44 44 L44 58Z', '#3a2618', 2) +
        F('M24 58 L24 48 Q32 40 40 48 L40 58Z', '#ff8a3a', 0.9) +
        F('M28 58 Q32 50 36 58Z', '#ffd84a') +
        R(42, 10, 8, 16, 2, '#c8693a') +
        sub('coconutFlan', 6, 38, 14),
    roastery: () =>
        SHADOW(32, 60, 28, 3) +
        R(8, 50, 48, 8, 2, '#5e3a1e') +
        E(30, 36, 20, 14, '#8a8f98') +
        L('M14 30 L46 30 M12 38 L48 38', 1.6, '#5e6670') +
        C(30, 36, 5, '#c8a06a', 1.6) +
        R(46, 6, 7, 26, 2, '#5e6670') +
        FC(50, 4, 3, '#fff', 0.7) +
        sub('greenCoffee', 4, 6, 18),
    rumDistillery: () =>
        SHADOW(32, 60, 28, 3) +
        R(6, 50, 52, 8, 2, '#5e3a1e') +
        E(22, 38, 14, 14, '#d9844a') +
        HL(16, 32, 3, 6, 20, 0.45) +
        P('M18 24 L26 24 L24 14 L20 14Z', '#d9844a', 2) +
        L('M22 14 Q30 6 40 14 L46 26', 3, '#b8692a') +
        R(40, 26, 14, 24, 3, '#c8693a') +
        L('M40 34 L54 34 M40 42 L54 42', 1.4, '#7a3f1e'),
});

// ---------------- bâtiments ----------------
// une paillote sur pilotis, au toit de paille
function hut(b, s) {
    const ruin = s === 0;
    const x0 = 50 - b.w / 2,
        x1 = 50 + b.w / 2,
        y0 = 86 - b.h;
    let o = SHADOW(50, 87, b.w / 2 + 8, 3);
    o += L(`M${x0 + 4} 88 L${x0 + 4} ${y0} M${x1 - 4} 88 L${x1 - 4} ${y0}`, 4, ruin ? greyD : '#8b5a2b');
    o += R(x0, y0 + b.h - 22, b.w, 14, 2, ruin ? grey : b.wall);
    if (ruin)
        o +=
            P(`M${x0 - 6} ${y0 + 2} L${x0 + 18} ${y0 - 12} L${x1 - 10} ${y0 - 4} L${x1 + 6} ${y0 + 4}Z`, '#b9ad9a') +
            L(`M${x0 + 10} ${y0 - 6} L${x0 + 24} ${y0 + 6}`, 2, '#6d6457');
    else o += strawRoof(x0 - 8, x1 + 8, y0 + 4, 24);
    if (!ruin) o += C(50, y0 + b.h - 15, 7.5, '#fff', 2) + subAny(b.sign[0], b.sign[1], 43.5, y0 + b.h - 21.5, 13);
    if (s === 2 && b.bunting)
        o +=
            L(`M${x0 - 8} ${y0 + 6} Q50 ${y0 + 16} ${x1 + 8} ${y0 + 6}`, 1.2) +
            [0.15, 0.32, 0.5, 0.68, 0.85]
                .map((t, k) => P(`M${x0 - 8 + t * (b.w + 16) - 3} ${y0 + 10} l3 7 l3 -7Z`, ['#e8364b', '#ffd23f', '#5aa9e6', '#9be06b', '#f6a5b5'][k], 1))
                .join('');
    if (s === 2) o += [x0 - 2, x1 + 2].map(fx => C(fx, 84, 3, '#fff', 1.4) + FC(fx, 84, 1.2, '#ffd23f')).join('');
    if (s === 1) o += scaffold(x0, y0, x1);
    return o;
}
// le bac : un radeau tiré sur un câble entre deux pontons
function ferry(s) {
    const ruin = s === 0;
    let o = F('M0 64 Q50 56 100 64 L100 90 L0 90Z', '#5aa9e6') + L('M10 74 Q18 71 26 74 M64 80 Q72 77 80 80', 1.4, '#bfe6fb');
    o += L('M4 50 L4 88 M96 50 L96 88', 4, ruin ? greyD : '#5e3a1e');
    o += L(ruin ? 'M4 52 Q30 70 46 62' : 'M4 52 L96 52', 1.4, ruin ? '#6d6457' : '#3a2618');
    o +=
        R(26, 60, 48, 10, 2, ruin ? grey : '#d9a066') +
        L('M34 60 L34 70 M42 60 L42 70 M50 60 L50 70 M58 60 L58 70 M66 60 L66 70', 1.2, ruin ? '#8f8574' : '#a8693a');
    if (!ruin) o += L('M50 60 L50 52', 1.6) + R(40, 44, 20, 16, 2, '#f2d6a2') + P('M36 46 L50 36 L64 46Z', '#2f7f8f') + subAny('item', 'banana', 44, 46, 12);
    if (s === 1) o += scaffold(30, 46, 70);
    return o;
}
const HUTS = {
    paillote: { w: 52, h: 40, wall: '#d9a066', sign: ['item', 'pineappleJuice'] },
    carnival: { w: 64, h: 42, wall: '#f6a5b5', sign: ['item', 'tiare'], bunting: true },
};
Object.assign(KINDS, { ferry, paillote: s => hut(HUTS.paillote, s), carnival: s => hut(HUTS.carnival, s) });
Object.assign(BLD, {
    ferry: { kind: 'ferry' },
    paillote: { kind: 'paillote' },
    bakehut: { w: 54, h: 32, wall: '#fbe9d0', roof: '#e8792a', sign: ['item', 'coconutFlan'] },
    roasting: { w: 56, h: 34, wall: '#f2d6a2', roof: '#7a4a2a', sign: ['item', 'coffee'] },
    rumhouse: { w: 60, h: 34, wall: '#fff3dc', roof: '#2f7f8f', sign: ['item', 'rum'] },
    carnival: { kind: 'carnival' },
});

// ---------------- villageois ----------------
Object.assign(people, {
    maeva: () =>
        bust('#ff7a5a', L('M22 50 Q32 56 42 50', 1.6, '#c8453a')) +
        P('M15 36 C10 16 24 11 32 12 C42 11 54 16 49 36 C47 26 40 20 32 20 C24 20 17 26 15 36Z', '#2a1a12') +
        P('M47 28 Q56 40 50 56 Q47 46 45 36Z', '#2a1a12', 2) +
        face() +
        P('M19 26 C22 17 42 17 45 26 C40 21 26 21 19 26Z', '#2a1a12') +
        [0, 72, 144, 216, 288].map(a => `<g transform="translate(46 20) rotate(${a})">${E(0, -3.5, 2.4, 3.5, '#fff', 0, 1.2)}</g>`).join('') +
        C(46, 20, 1.8, '#ffd23f', 1),
    tiago: () =>
        bust('#f7f3ea', L('M14 52 L50 52 M12 58 L52 58', 2, '#3f6fb5')) +
        face({ noSmile: true }) +
        P('M19 32 C19 44 25 47 32 47 C39 47 45 44 45 32 C42 37 38 38 32 37 C26 38 22 37 19 32Z', '#3a2618', 2) +
        L('M29 40 Q32 41.5 35 40', 1.6, SKIN) +
        E(32, 19, 22, 4.5, '#e8c26a') +
        P('M21 19 Q21 7 32 7 Q43 7 43 19Z', '#e8c26a') +
        L('M21.5 15 L42.5 15', 2.2, '#c8453a'),
});
