// 1.81 : les seconds produits des bêtes (viandes, petit-lait, corne, toison royale, gelée royale) et leurs trente-neuf plats.
import { items, P, C, E, R, L, F, FC, FE, HL, SHADOW, G, GD, sub, shirt } from '../kit.js';
import { plate, bowl, steamF, woodBoard, yarn } from '../items2.js';

const PAPER = '#f3e7cf';
const paper = () => SHADOW(32, 57, 26, 3) + P('M6 44 L50 36 L58 48 L14 56Z', PAPER, 2) + L('M12 46 L48 40', 1, 'rgba(58,38,24,.2)');
// un oiseau plumé couché (corps, pilons, croupion), centré en (x, y)
const bird = (x, y, s, skin, sk2, extra = '') =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    P('M-26 -2 Q-30 -10 -24 -14 Q-20 -10 -18 -4Z', sk2, 2 / s) +
    P('M-26 8 Q-32 8 -30 16 Q-24 16 -20 10Z', sk2, 2 / s) +
    P('M-24 0 Q-24 -16 -2 -16 Q22 -16 26 -2 Q26 14 0 15 Q-24 14 -24 0Z', skin, 2 / s) +
    P('M24 -6 Q32 -8 32 -2 Q30 2 24 2Z', skin, 2 / s) +
    F('M-14 -10 Q0 -15 16 -10 Q4 -6 -14 -4Z', '#fff', 0.4) +
    extra +
    `</g>`;
// un poulet entier prêt à rôtir : corps dodu, pilons dressés et ficelés (et l'étiquette rouge s'il est fermier)
const chicken = (skin, dark, tips, tag = false) =>
    P('M10 38 Q4 36 6 31 Q10 30 14 34Z', dark, 1.8) +
    P('M10 40 Q10 24 30 23 Q48 23 52 36 Q54 48 34 50 Q12 51 10 40Z', skin, 2.2) +
    F('M16 30 Q28 24 42 28 Q30 30 18 34Z', '#fff', 0.45) +
    L('M16 44 Q24 46 30 42', 1.4, dark) +
    FE(22, 38, 1, 0.8, dark) +
    FE(30, 34, 1, 0.8, dark) +
    FE(38, 42, 1, 0.8, dark) +
    P('M36 36 Q34 26 44 22 Q50 22 50 28 Q48 34 40 38Z', skin, 2) +
    P('M42 40 Q44 30 52 28 Q58 28 57 34 Q54 40 46 42Z', skin, 2) +
    R(46, 17, 4, 7, 2, tips, 1.6) +
    R(53, 23, 4, 7, 2, tips, 1.6) +
    L('M45 22 Q50 26 56 26', 1.4, '#c8453a') +
    (tag ? L('M56 26 L58 32', 1.2, '#c8453a') + C(58, 35, 3.4, '#c8453a', 1.4) + FC(58, 35, 1.4, '#ffd23f') : '');
// une pièce de viande crue sur son papier
const meat = (c, c2, seed) =>
    paper() +
    P('M10 42 Q14 28 34 28 Q52 30 55 40 Q50 50 30 49 Q12 50 10 42Z', c) +
    P('M12 40 Q16 31 34 30 Q50 32 52 38 Q34 35 12 40Z', c2, 1.6) +
    L(seed, 1.2, c2) +
    HL(22, 34, 6, 1.6, -8, 0.5);
// un os qui dépasse
const bone = (x, y, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})">` +
    R(0, -2.5, 10, 5, 2, '#f6eedc', 1.6) +
    C(11, -3, 3, '#f6eedc', 1.6) +
    C(11, 3, 3, '#f6eedc', 1.6) +
    `</g>`;
// une petite feuille
const leafy = (x, y, s = 1, c = G) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` + P('M0 0 Q-5 -3 -4 -9 Q1 -6 0 0Z', c, 1.2) + P('M0 0 Q5 -3 4 -9 Q-1 -6 0 0Z', GD, 1.2) + `</g>`;
const balls = (list, r, c, w = 1.2) => list.map(([x, y]) => C(x, y, r, c, w) + FC(x - r * 0.3, y - r * 0.3, r * 0.28, '#fff', 0.55)).join('');
const specks = (list, c, r = 0.9) => list.map(([x, y]) => FC(x, y, r, c)).join('');
// la cocotte en fonte, vue un peu de dessus
const cocotte = (fill, food = '', c = '#c8453a') =>
    SHADOW(32, 59, 25, 3) +
    R(2, 34, 8, 6, 3, c, 2) +
    R(54, 34, 8, 6, 3, c, 2) +
    P('M8 34 L56 34 Q56 58 32 58 Q8 58 8 34Z', c) +
    L('M12 44 Q32 50 52 44', 1.4, 'rgba(0,0,0,.18)') +
    E(32, 34, 24, 7.5, '#3a3a3a', 0, 2.2) +
    E(32, 34.5, 21, 6, fill, 0, 1.2) +
    food +
    HL(14, 46, 1.6, 5, 0, 0.35);
// le tajine ouvert et le plat en terre
const CLAY = '#c8743a',
    CLAYD = '#9a5228',
    CLAYL = '#e0975a';
const openTajine = food =>
    SHADOW(32, 58, 26, 3) + E(32, 46, 28, 10, CLAYD, 0, 2.4) + E(32, 44, 24, 7, CLAY, 0, 1.6) + food + P('M50 40 Q60 30 54 22 Q50 26 48 34Z', CLAYL, 1.6);
// une tourte dorée, bombée, avec ses fentes
const pie = (crust, dark, extra = '') =>
    SHADOW(32, 57, 26, 3) +
    P('M6 42 L58 42 L54 52 Q53 55 49 55 L15 55 Q11 55 10 52Z', '#d9913d') +
    P('M6 42 Q8 22 32 21 Q56 22 58 42 Q32 47 6 42Z', crust) +
    L('M24 30 L28 36 M32 27 L32 34 M40 30 L36 36', 1.8, dark) +
    HL(20, 30, 5, 2, -20, 0.4) +
    extra;
// une terrine rectangulaire en faïence, une tranche coupée
const terrine = (fill, fat, extra = '') =>
    SHADOW(32, 57, 26, 3) +
    R(6, 30, 52, 24, 5, '#f2ece0') +
    L('M8 40 L56 40', 1.4, '#5aa9e6') +
    R(10, 26, 30, 12, 3, fill, 2) +
    L('M10 30 L40 30', 2, fat) +
    P('M40 26 L50 26 L50 38 L40 38Z', fill, 2) +
    extra;
// une brochette en biais
const skewer = (x, y, cols, rot = -12) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})">` +
    L('M-26 0 L26 0', 2.4, '#a8693a') +
    cols.map((c, k) => R(-20 + k * 10, -5, 9, 10, 2.5, c, 1.6)).join('') +
    `</g>`;
// une couronne (tout ce qui est « royal »)
const crown = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    P('M-8 4 L-9 -5 L-4 -1 L0 -7 L4 -1 L9 -5 L8 4Z', '#f2c14e', 1.6) +
    FC(0, -7.5, 1.4, '#e0384a') +
    FC(-9, -5.5, 1.2, '#5aa9e6') +
    FC(9, -5.5, 1.2, '#5aa9e6') +
    `</g>`;
// une goutte de miel qui coule
const drizzle = d => L(d, 2.6, '#e8a21c') + L(d, 1, '#ffd96a');
const grapeBunch = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    balls(
        [
            [-4, -4],
            [3, -4],
            [-1, 1],
            [-6, 2],
            [5, 2],
            [1, 7],
        ],
        3.4,
        '#8a4fb0',
        1.2,
    ) +
    L('M0 -8 L1 -12', 1.6, GD) +
    leafy(4, -9, 0.6) +
    `</g>`;
const peas = list => balls(list, 2.2, '#7fc94a', 1);
const carrots = list => list.map(([x, y]) => E(x, y, 3.2, 2.2, '#f08a2a', 0, 1.2) + FC(x, y, 1, '#ffc070')).join('');
const shrooms = list =>
    list.map(([x, y]) => P(`M${x - 4} ${y} Q${x} ${y - 6} ${x + 4} ${y}Z`, '#c8a070', 1.2) + R(x - 1.4, y, 2.8, 3, 1, '#f2e6cc', 1)).join('');
const garlicClove = (x, y) => P(`M${x} ${y - 5} Q${x + 5} ${y} ${x + 3} ${y + 4} L${x - 3} ${y + 4} Q${x - 5} ${y} ${x} ${y - 5}Z`, '#fbf5e6', 1.4);
// un morceau rôti (cuisse, tranche) : brun doré
const roastLeg = (x, y, s = 1, c = '#b8662a') =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    P('M-16 4 Q-20 -8 -8 -12 Q6 -14 12 -6 Q16 2 6 8 Q-6 12 -16 4Z', c, 2 / s) +
    F('M-12 -4 Q-4 -10 6 -8', '#f2c06a', 0.5) +
    bone(10, 2, 30) +
    `</g>`;
const slices = (x, y, n, c, c2) =>
    Array.from({ length: n }, (_, k) => E(x + k * 7, y - k * 1.5, 6, 4.5, c, -15, 1.4) + FE(x + k * 7, y - k * 1.5, 3.5, 2.4, c2, 0.8, -15)).join('');
const steam = L('M24 18 Q20 14 24 10 M32 20 Q28 15 32 10 M40 18 Q36 14 40 10', 1.8, 'rgba(255,255,255,.95)');

const RAW = {
    // ---------------- les produits ----------------
    chickenMeat: () => paper() + chicken('#f4d48e', '#e8b868', '#fbf3e2', true),
    quailMeat: () => paper() + bird(22, 40, 0.5, '#efc0a0', '#e0a888') + bird(42, 36, 0.55, '#f2c8a8', '#e4b090'),
    lambLeg: () =>
        paper() +
        P('M10 44 Q6 30 20 28 Q34 26 44 34 Q48 38 46 42 Q36 48 20 48 Q12 48 10 44Z', '#d8707a') +
        P('M12 42 Q12 32 22 31 Q34 30 42 36 Q30 34 12 42Z', '#f4d6d0', 1.4) +
        HL(20, 33, 5, 1.5, -8, 0.5) +
        bone(44, 38, -10),
    whey: () =>
        SHADOW(32, 59, 14, 2.5) +
        P('M26 8 L38 8 L38 18 Q47 23 47 33 L47 54 Q47 58 43 58 L21 58 Q17 58 17 54 L17 33 Q17 23 26 18Z', '#e4f5ff') +
        F('M18.6 32 L45.4 32 L45.4 54 Q45.4 56.5 43 56.5 L21 56.5 Q18.6 56.5 18.6 54Z', '#eef0b8') +
        F('M21 25 L24 23 L24 52 L21 52Z', '#fff', 0.5) +
        P('M26 8 L38 8 L38 18 Q47 23 47 33 L47 54 Q47 58 43 58 L21 58 Q17 58 17 54 L17 33 Q17 23 26 18Z', 'none') +
        R(24, 3, 16, 7, 2.5, '#9be06b') +
        C(32, 44, 7, '#fff', 1.6) +
        P('M32 39 Q36 44 34 47 Q32 49 30 47 Q28 44 32 39Z', '#dfe6a0', 1.2),
    kidMeat: () => meat('#e89090', '#f8dcd4', 'M22 40 Q28 37 34 40') + bone(46, 34, -20),
    goatHorn: () =>
        SHADOW(32, 57, 22, 3) +
        P('M12 52 Q8 30 26 16 Q42 6 56 14 Q44 14 36 22 Q26 32 26 52Z', '#d8c4a0', 2.2) +
        L('M14 44 L26 44 M14 36 L27 37 M17 28 L30 30 M23 21 L34 24 M30 16 L39 19', 1.4, '#a88a60') +
        F('M15 46 Q14 32 24 22', '#fff', 0.35) +
        E(19, 52, 7, 2.5, '#b89a70', 0, 1.8),
    royalFleece: () =>
        SHADOW(32, 58, 24, 3) +
        [
            [16, 40, 9],
            [30, 34, 12],
            [46, 39, 10],
            [22, 49, 8],
            [40, 49, 9],
        ]
            .map(([x, y, r]) => C(x, y, r, '#fff8e6', 2))
            .join('') +
        F('M8 42 Q30 46 56 42 L56 47 Q30 51 8 47Z', '#f2c14e', 1) +
        L('M8 42 Q30 46 56 42 M8 47 Q30 51 56 47', 1.4) +
        crown(32, 22, 1),
    veal: () => meat('#f2b0aa', '#fde4de', 'M20 40 Q30 36 44 40'),
    royalJelly: () =>
        SHADOW(32, 58, 15, 2.6) +
        P('M18 26 L46 26 L46 54 Q46 58 42 58 L22 58 Q18 58 18 54Z', '#eaf6fd') +
        F('M19.4 30 L44.6 30 L44.6 54 Q44.6 56.6 42 56.6 L22 56.6 Q19.4 56.6 19.4 54Z', '#fff2c4') +
        P('M18 26 L46 26 L46 54 Q46 58 42 58 L22 58 Q18 58 18 54Z', 'none') +
        R(16, 18, 32, 9, 3, '#f2c14e') +
        HL(23, 38, 1.6, 6, 0, 0.5) +
        crown(32, 44, 1),
    zebuBeef: () => meat('#b2343a', '#f2d0c8', 'M20 38 Q24 41 22 45 M32 36 Q36 40 34 46 M44 38 Q47 41 45 45'),
    barbaryLamb: () =>
        paper() +
        P('M10 42 Q14 28 34 28 Q52 30 55 40 Q50 50 30 49 Q12 50 10 42Z', '#f6ecdc') +
        P('M14 42 Q18 32 34 32 Q48 33 50 40 Q46 46 30 46 Q16 46 14 42Z', '#c85a62', 1.6) +
        HL(24, 36, 6, 1.6, -8, 0.5),
    muskoxMeat: () =>
        meat('#7a2228', '#d8a0a0', 'M22 40 Q26 36 30 41 M38 37 Q42 41 46 39') +
        L('M44 22 L56 30', 1.6, '#5a7a3a') +
        balls(
            [
                [48, 23],
                [53, 27],
                [50, 29],
            ],
            2,
            '#3a4f8a',
        ),
    ptarmiganMeat: () =>
        paper() + bird(30, 40, 0.7, '#e8b4a0', '#d89a88') + P('M44 18 Q56 20 54 34 Q48 26 42 24Z', '#ffffff', 1.6) + L('M44 22 L52 30', 1, '#c9d4dc'),

    // ---------------- poulet ----------------
    chickenCream: () =>
        plate() +
        P('M12 46 Q14 38 32 38 Q50 38 52 46 Q32 52 12 46Z', '#fbf3dc', 1.4) +
        roastLeg(30, 41, 0.85, '#e8a86a') +
        shrooms([
            [18, 46],
            [44, 46],
        ]) +
        leafy(46, 40, 0.6),
    chickenBasque: () =>
        cocotte(
            '#d8452a',
            roastLeg(30, 32, 0.6, '#e09a5a') +
                L('M14 34 Q18 32 20 35 M42 34 Q46 31 49 35', 2.4, '#5fae3e') +
                L('M22 37 Q25 35 27 38 M38 37 Q41 35 43 38', 2.4, '#ffd23f'),
        ),
    smokedChicken: () =>
        woodBoard() +
        `<g transform="translate(0 -4)">${chicken('#b8662a', '#8a4a1e', '#f6eedc')}</g>` +
        L('M14 14 Q10 10 14 6 M22 12 Q18 8 22 4', 1.8, 'rgba(160,160,160,.7)'),

    // ---------------- caille ----------------
    quailGrapes: () => plate() + bird(22, 40, 0.42, '#c8783a', '#a85a2a') + bird(38, 42, 0.42, '#c8783a', '#a85a2a') + grapeBunch(48, 36, 0.8),
    quailHoney: () =>
        plate() +
        bird(22, 40, 0.42, '#d8902a', '#b8701a') +
        bird(40, 41, 0.42, '#d8902a', '#b8701a') +
        drizzle('M16 34 Q22 38 28 34 Q34 38 40 35 Q46 38 50 35'),
    quailTerrine: () =>
        terrine(
            '#d8a080',
            '#fff0d8',
            specks(
                [
                    [16, 34],
                    [24, 32],
                    [32, 35],
                    [44, 32],
                ],
                '#7a4a2a',
                1.2,
            ) + leafy(52, 26, 0.7),
        ),

    // ---------------- gigot ----------------
    lambGarlic: () =>
        woodBoard() +
        roastLeg(28, 38, 1.15, '#a8562a') +
        garlicClove(48, 40) +
        garlicClove(14, 46) +
        peas([
            [40, 48],
            [45, 50],
            [50, 48],
        ]),
    navarin: () =>
        cocotte(
            '#8a4a2a',
            E(25, 33, 5, 3, '#a8562a', 0, 1.3) +
                E(38, 34, 5, 3, '#a8562a', 0, 1.3) +
                carrots([
                    [17, 34],
                    [31, 36],
                    [45, 33],
                ]) +
                balls(
                    [
                        [31, 31],
                        [46, 37],
                    ],
                    2.6,
                    '#f0e4f2',
                ),
        ),
    lambLasagna: () =>
        SHADOW(32, 57, 26, 3) +
        R(6, 34, 52, 20, 6, '#e8e1d2') +
        R(10, 26, 30, 22, 3, '#f2d48a', 2) +
        [31, 37, 43].map(y => L(`M10 ${y} L40 ${y}`, 2.4, '#c8452a')).join('') +
        F('M10 26 L40 26 L40 29 L10 29Z', '#e8a840') +
        leafy(48, 34, 0.8),

    // ---------------- petit-lait ----------------
    brousse: () =>
        SHADOW(32, 57, 18, 3) +
        P('M14 30 L50 30 L44 54 L20 54Z', '#f6f1e6') +
        specks(
            [
                [22, 38],
                [30, 40],
                [38, 38],
                [42, 46],
                [26, 47],
                [34, 49],
            ],
            '#bfb6a6',
            1.2,
        ) +
        P('M16 30 Q18 18 32 18 Q46 18 48 30Z', '#ffffff', 2) +
        HL(24, 24, 4, 2, -20, 0.5),
    wheyBread: () =>
        SHADOW(32, 56, 26, 3) +
        E(32, 44, 26, 11, '#c88a3a', 0, 2.4) +
        P('M8 42 Q10 22 32 21 Q54 22 56 42 Q32 48 8 42Z', '#e8b060') +
        L('M20 30 Q32 26 44 30 M18 37 Q32 33 46 37', 1.6, '#f6dca0') +
        HL(22, 28, 5, 2, -20, 0.4),
    wheySoap: () =>
        SHADOW(32, 56, 22, 3) +
        R(10, 30, 44, 22, 8, '#f2f0c8') +
        F('M14 33 L50 33 L50 37 L14 37Z', '#fff', 0.35) +
        C(46, 22, 5, '#e6f6ff', 1.6) +
        C(52, 14, 3, '#e6f6ff', 1.4) +
        sub('whey', 23, 31, 18),

    // ---------------- chevreau ----------------
    kidMint: () =>
        plate() +
        slices(16, 44, 3, '#c8784a', '#f0b8a0') +
        balls(
            [
                [42, 44],
                [48, 41],
            ],
            3.6,
            '#f2d070',
        ) +
        leafy(40, 38, 0.7) +
        leafy(24, 38, 0.6),
    kidOlives: () =>
        cocotte(
            '#c8452a',
            E(24, 33, 5, 3, '#c8784a', 0, 1.3) +
                E(38, 34, 5, 3, '#c8784a', 0, 1.3) +
                balls(
                    [
                        [16, 34],
                        [31, 36],
                        [45, 32],
                        [30, 31],
                    ],
                    2.2,
                    '#5a6a2a',
                ),
        ),
    kidPie: () => pie('#e8a84a', '#a86a2a', leafy(32, 22, 0.7)),

    // ---------------- corne ----------------
    hornComb: () =>
        SHADOW(32, 56, 24, 3) +
        P('M8 22 Q32 16 56 22 L56 30 L8 30Z', '#b8864a') +
        Array.from({ length: 13 }, (_, k) => R(9 + k * 3.6, 29, 2.4, 22 - (k % 2) * 4, 1, '#c8965a', 1.2)).join('') +
        F('M12 22 Q32 18 52 22', '#fff', 0.35) +
        L('M14 25 Q32 21 50 25', 1, '#8a5a2a'),
    hornCardigan: () =>
        shirt(
            '#7a9a5a',
            'long',
            L('M32 18 L32 56', 1.8) +
                [26, 34, 42, 50].map(y => C(35.5, y, 2.4, '#b8864a', 1.4)).join('') +
                L('M20 50 L28 50 M38 50 L44 50', 1.2, 'rgba(0,0,0,.2)'),
        ),
    hornKnife: () =>
        SHADOW(32, 56, 24, 3) +
        `<g transform="rotate(-20 32 36)">` +
        P('M28 32 L58 30 Q58 38 50 40 L28 40Z', '#d8e2ea') +
        F('M30 33 L54 32', '#fff', 0.6) +
        P('M6 32 Q4 36 6 40 L28 41 L28 31Z', '#b8864a') +
        L('M10 33 Q9 36 10 39 M16 32 Q15 36 16 40 M22 32 Q21 36 22 40', 1.2, '#8a5a2a') +
        C(13, 36, 1.4, '#e8d8b0', 1) +
        C(24, 36, 1.4, '#e8d8b0', 1) +
        `</g>`,

    // ---------------- toison royale ----------------
    royalShawl: () =>
        SHADOW(32, 57, 26, 3) +
        P('M6 22 L58 22 L32 50Z', '#fff4dc') +
        L('M12 26 L52 26 M18 32 L46 32 M24 38 L40 38', 1.4, '#e8c878') +
        Array.from({ length: 8 }, (_, k) => L(`M${10 + k * 3.2} ${26 + k * 3.4} L${7 + k * 3.2} ${31 + k * 3.4}`, 1.4, '#c9952a')).join('') +
        Array.from({ length: 8 }, (_, k) => L(`M${54 - k * 3.2} ${26 + k * 3.4} L${57 - k * 3.2} ${31 + k * 3.4}`, 1.4, '#c9952a')).join('') +
        crown(32, 16, 0.8),
    royalYarn: () => yarn('#fff4dc', '#e0c890') + L('M16 34 Q30 26 46 30', 1.6, '#e0a92a') + crown(46, 18, 0.7),
    royalDyed: () =>
        SHADOW(32, 58, 24, 3) +
        [
            [16, 40, 9],
            [30, 34, 12],
            [46, 39, 10],
            [22, 49, 8],
            [40, 49, 9],
        ]
            .map(([x, y, r]) => C(x, y, r, '#d8384a', 2))
            .join('') +
        F('M8 42 Q30 46 56 42 L56 47 Q30 51 8 47Z', '#f2c14e', 1) +
        L('M8 42 Q30 46 56 42 M8 47 Q30 51 56 47', 1.4) +
        HL(26, 30, 4, 2, -20, 0.4) +
        crown(32, 22, 1),

    // ---------------- veau ----------------
    blanquette: () =>
        cocotte(
            '#fbf2d8',
            E(24, 33, 5, 3, '#f0c8b0', 0, 1.3) +
                E(39, 34, 5, 3, '#f0c8b0', 0, 1.3) +
                carrots([
                    [16, 34],
                    [31, 36],
                    [46, 33],
                ]) +
                shrooms([
                    [31, 32],
                    [44, 37],
                ]),
            '#3a6ab0',
        ),
    ossobuco: () =>
        plate() +
        P('M12 46 Q14 38 32 38 Q50 38 52 46 Q32 52 12 46Z', '#d8452a', 1.4) +
        E(30, 43, 11, 6, '#b8662a', 0, 1.8) +
        E(30, 42.5, 4, 2.4, '#f6eedc', 0, 1.4) +
        FE(30, 42.5, 2, 1.2, '#e8b07a') +
        carrots([
            [44, 44],
            [18, 46],
        ]) +
        P('M40 38 Q44 34 48 38 Q44 40 40 38Z', '#ffe06a', 1.2),
    vitello: () =>
        plate() +
        slices(14, 46, 4, '#f2d0c8', '#fbe8e0') +
        drizzle('M14 42 Q22 46 30 42 Q38 46 46 42')
            .replace(/#e8a21c/g, '#e8dcb0')
            .replace(/#ffd96a/g, '#fff8e0') +
        balls(
            [
                [24, 44],
                [36, 41],
            ],
            1.4,
            '#6a8a3a',
            1,
        ),

    // ---------------- gelée royale ----------------
    royalCream: () =>
        SHADOW(32, 57, 22, 3) +
        R(10, 34, 44, 20, 6, '#f4e4f0') +
        L('M12 42 L52 42', 1.4, '#c9952a') +
        E(32, 34, 22, 6, '#fff6d8', 0, 2) +
        P('M26 33 Q32 26 38 33 Q32 36 26 33Z', '#fff', 1.2) +
        E(20, 20, 11, 4, '#f2c14e', -18, 2) +
        crown(20, 13, 0.6),
    royalSoap: () =>
        SHADOW(32, 56, 22, 3) +
        R(10, 30, 44, 22, 8, '#f6d878') +
        F('M14 33 L50 33 L50 37 L14 37Z', '#fff', 0.35) +
        C(46, 22, 5, '#e6f6ff', 1.6) +
        C(52, 14, 3, '#e6f6ff', 1.4) +
        sub('royalJelly', 23, 31, 18),
    royalCandy: () =>
        SHADOW(32, 57, 24, 3) +
        [
            [20, 44, -15],
            [40, 46, 12],
            [30, 32, 4],
        ]
            .map(
                ([x, y, r]) =>
                    `<g transform="translate(${x} ${y}) rotate(${r})">` +
                    P('M-15 -6 L-7 -2 L-7 2 L-15 6Z', '#f2c14e', 1.8) +
                    P('M15 -6 L7 -2 L7 2 L15 6Z', '#f2c14e', 1.8) +
                    E(0, 0, 8, 6, '#ffe48a', 0, 2) +
                    FE(-2.5, -2, 2.4, 1.2, '#fff', 0.7) +
                    `</g>`,
            )
            .join(''),

    // ---------------- zébu ----------------
    zebuTajine: () =>
        openTajine(
            E(24, 42, 6, 3.4, '#8a3a2a', 0, 1.4) +
                E(38, 43, 6, 3.4, '#8a3a2a', 0, 1.4) +
                balls(
                    [
                        [31, 40],
                        [18, 45],
                        [44, 41],
                    ],
                    2.4,
                    '#3a1a2a',
                ) +
                [
                    [28, 46],
                    [36, 39],
                ]
                    .map(([x, y]) => FE(x, y, 2, 1.1, '#f6e8c4', 1, 20))
                    .join(''),
        ),
    zebuSkewers: () =>
        woodBoard() +
        skewer(30, 34, ['#8a3a2a', '#e8c040', '#8a3a2a', '#c8452a', '#8a3a2a']) +
        skewer(34, 44, ['#8a3a2a', '#5fae3e', '#8a3a2a', '#e8c040', '#8a3a2a'], -6) +
        specks(
            [
                [20, 30],
                [36, 28],
                [44, 40],
            ],
            '#a86a2a',
            1,
        ),
    couscousRoyal: () =>
        plate() +
        P('M10 46 Q16 30 32 30 Q48 30 54 46 Q32 52 10 46Z', '#f0d48a', 1.8) +
        specks(
            [
                [20, 40],
                [28, 36],
                [36, 38],
                [44, 42],
                [32, 44],
            ],
            '#d8b060',
            1,
        ) +
        E(30, 34, 6, 3.4, '#8a3a2a', 0, 1.4) +
        carrots([
            [20, 42],
            [42, 38],
        ]) +
        balls(
            [
                [36, 44],
                [26, 44],
            ],
            2,
            '#e8c890',
        ),

    // ---------------- agneau barbarin ----------------
    mechoui: () =>
        SHADOW(32, 58, 28, 3) +
        E(32, 48, 29, 10, '#c8862a', 0, 2.4) +
        E(32, 47, 24, 7, '#e8b04a', 0, 1.4) +
        roastLeg(28, 40, 1.2, '#9a4a1e') +
        specks(
            [
                [20, 38],
                [28, 34],
                [34, 40],
                [16, 42],
            ],
            '#e8c070',
            1.1,
        ) +
        leafy(48, 46, 0.8),
    lambApricot: () =>
        openTajine(
            E(25, 42, 6, 3.4, '#a8563a', 0, 1.4) +
                E(38, 43, 6, 3.4, '#a8563a', 0, 1.4) +
                balls(
                    [
                        [31, 40],
                        [18, 45],
                        [44, 41],
                    ],
                    2.8,
                    '#f2a040',
                ) +
                FE(29, 46, 2, 1.1, '#f6e8c4', 1, 20),
        ),
    pastilla: () =>
        SHADOW(32, 56, 26, 3) +
        E(32, 44, 27, 11, '#c88a3a', 0, 2.4) +
        E(32, 41, 26, 10, '#f6ecd6', 0, 2) +
        L('M14 38 L50 44 M14 44 L50 38 M32 31 L32 51', 2.2, '#a8693a') +
        specks(
            [
                [24, 40],
                [40, 42],
                [32, 36],
            ],
            '#e8c070',
            1.4,
        ),

    // ---------------- bœuf musqué ----------------
    tundraStew: () =>
        bowl('#6a3a22') +
        E(24, 30, 5, 2.6, '#4a2214', 0, 1.3) +
        E(38, 29, 5, 2.6, '#4a2214', 0, 1.3) +
        balls(
            [
                [31, 31],
                [44, 31],
            ],
            1.8,
            '#3a4f8a',
        ) +
        steamF,
    juniperRoast: () =>
        woodBoard() +
        slices(14, 44, 4, '#6a2a22', '#c88070') +
        E(40, 34, 10, 7, '#5a2218', 0, 2) +
        L('M44 22 L56 30', 1.6, '#5a7a3a') +
        balls(
            [
                [48, 23],
                [53, 27],
                [50, 29],
            ],
            2,
            '#3a4f8a',
        ),
    nordPie: () =>
        pie(
            '#a8784a',
            '#6a4a2a',
            balls(
                [
                    [26, 26],
                    [32, 24],
                    [38, 26],
                ],
                2.4,
                '#c0243a',
            ),
        ),

    // ---------------- lagopède ----------------
    ptarmiganLingon: () =>
        plate() +
        bird(30, 40, 0.55, '#c8783a', '#a85a2a') +
        balls(
            [
                [46, 42],
                [50, 45],
                [44, 46],
                [16, 46],
            ],
            2.4,
            '#c0243a',
        ),
    ptarmiganSoup: () =>
        bowl('#f6ecd0') +
        E(24, 30, 4.6, 2.6, '#d8a080', 0, 1.3) +
        E(40, 29, 4.6, 2.6, '#d8a080', 0, 1.3) +
        balls(
            [
                [32, 31],
                [46, 31],
            ],
            2.4,
            '#f2d070',
        ) +
        leafy(18, 30, 0.5) +
        steamF,
    ptarmiganCloudberry: () =>
        plate() +
        bird(30, 40, 0.55, '#d8902a', '#b8701a') +
        balls(
            [
                [46, 42],
                [50, 45],
                [44, 46],
            ],
            2.6,
            '#f29a2a',
        ) +
        drizzle('M20 34 Q28 38 36 34'),
};
Object.assign(items, RAW);
void steam;
