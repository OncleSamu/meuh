// 1.3.1 : les nouvelles cultures, les nouveaux arbres, leurs recettes et six machines.
import { C, E, F, FC, FE, G, GD, GL, HL, L, P, R, SHADOW, leaf, mound, stem, sub, items, machines, youngExtra, readyExtra } from './kit.js';
import { FRUIT_COL, fruitExtra } from './plants.js';
import { plate, bowl, jar, coupe, scoop, juiceB, steamF, woodBoard, oil } from './items2.js';

// ======================= les produits bruts =======================
const pod = (x, y, rot, len = 30, c = '#5fb43a') =>
    `<g transform="translate(${x} ${y}) rotate(${rot})">` +
    P(`M0 0 Q${len * 0.5} -5 ${len} -1 Q${len + 3} 1 ${len} 2 Q${len * 0.5} 4 0 3Z`, c, 2) +
    L(`M3 0.8 Q${len * 0.5} -2.6 ${len - 2} 0`, 1, 'rgba(255,255,255,.5)') +
    L(`M0 1.5 L-4 0`, 1.6, '#3f8f2e') +
    `</g>`;

const pearShape = (x, y, s, c, blush) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    P('M0 -14 Q-6 -14 -6 -6 Q-6 -2 -10 4 Q-14 12 -6 16 Q0 18 6 16 Q14 12 10 4 Q6 -2 6 -6 Q6 -14 0 -14Z', c, 2.2) +
    (blush ? FE(5, 8, 4, 5, blush, 0.45) : '') +
    HL(-4, 2, 2, 5, 15, 0.55) +
    L('M0 -14 Q1 -19 3 -21', 2, '#6b3d1e') +
    `</g>`;

const plum = (x, y, r, c, blush) =>
    C(x, y, r, c, 2) +
    FE(x + r * 0.3, y + r * 0.2, r * 0.5, r * 0.45, blush, 0.5) +
    L(`M${x} ${y - r + 1} Q${x - r * 0.4} ${y} ${x} ${y + r - 1}`, 1, 'rgba(58,38,24,.25)') +
    FC(x - r * 0.4, y - r * 0.4, r * 0.25, '#fff', 0.7);

const apricotFruit = (x, y, r) =>
    C(x, y, r, '#f6a23a', 2) +
    FE(x + r * 0.35, y + r * 0.1, r * 0.55, r * 0.6, '#e8603a', 0.55) +
    L(`M${x - r * 0.1} ${y - r + 1} Q${x - r * 0.45} ${y} ${x + r * 0.1} ${y + r - 1}`, 1.3, 'rgba(58,38,24,.35)') +
    FC(x - r * 0.45, y - r * 0.4, r * 0.25, '#fff', 0.7);

const figFruit = (x, y, s, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M0 -12 Q3 -12 4 -8 Q12 -2 11 6 Q10 14 0 14 Q-10 14 -11 6 Q-12 -2 -4 -8 Q-3 -12 0 -12Z', '#6b2f5e', 2.2) +
    F('M3 -6 Q10 0 9 6 Q8 11 3 12 Q7 6 3 -6Z', '#8c4a7a', 0.8) +
    HL(-5, 0, 1.6, 4, 15, 0.45) +
    R(-2, -15, 4, 4, 1, '#6b8a2e', 1.6) +
    `</g>`;

const walnutShell = (x, y, s) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    E(0, 0, 12, 13, '#c8a46a', 0, 2.2) +
    L('M0 -13 L0 13', 1.6, '#9a7a44') +
    L('M-6 -8 Q-3 -4 -7 0 Q-3 4 -6 8 M6 -8 Q3 -4 7 0 Q3 4 6 8 M-9 -2 Q-6 0 -9 3 M9 -2 Q6 0 9 3', 1.1, '#9a7a44') +
    HL(-5, -6, 2, 3, -20, 0.5) +
    `</g>`;

const chestnutNut = (x, y, s, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M0 -12 Q10 -6 11 4 Q11 12 0 12 Q-11 12 -11 4 Q-10 -6 0 -12Z', '#8b4a22', 2.2) +
    F('M-10 6 Q0 10 10 6 L10 8 Q9 12 0 12 Q-9 12 -10 8Z', '#e8c38c', 1) +
    P('M-10 6 Q0 10 10 6', 'none', 1.4) +
    HL(-4, -3, 2, 5, 25, 0.6) +
    L('M0 -12 L1 -15', 1.8) +
    `</g>`;

const artichokeHead = (x, y, s, ready = true) => {
    const c1 = ready ? '#7aa04a' : '#8fbf5a',
        c2 = ready ? '#8a5a9a' : '#7aa04a';
    let o = `<g transform="translate(${x} ${y}) scale(${s})">`;
    o += P('M-14 2 Q-14 -14 0 -16 Q14 -14 14 2 Q12 16 0 17 Q-12 16 -14 2Z', c1, 2.2);
    // les bractées, rang par rang
    for (const [yy, n, w] of [
        [10, 5, 5],
        [3, 4, 6],
        [-4, 3, 7],
        [-11, 2, 6],
    ])
        for (let k = 0; k < n; k++) {
            const xx = (k - (n - 1) / 2) * w;
            o += P(`M${xx - w / 2} ${yy + 2} Q${xx} ${yy - 7} ${xx + w / 2} ${yy + 2} Q${xx} ${yy} ${xx - w / 2} ${yy + 2}Z`, k % 2 ? c1 : c2, 1.4);
        }
    return o + HL(-7, -4, 2, 5, 20, 0.4) + '</g>';
};

const ITEMS_RAW = {
    // les haricots verts : une botte de gousses fines, nouée de raphia
    greenBean: () =>
        SHADOW(32, 57, 22, 3) +
        pod(10, 48, -28, 40, '#4fa832') +
        pod(12, 52, -18, 42, '#5fb43a') +
        pod(14, 56, -8, 40, '#6cc04a') +
        pod(10, 44, -38, 36, '#5fb43a') +
        P('M24 39 Q28 46 26 52 L30 52 Q32 46 28 39Z', '#e8c38c', 1.6) +
        L('M22 44 L33 42', 2.4, '#d9a066'),
    // le poireau : fût blanc, racines, feuilles en éventail
    leek: () =>
        SHADOW(32, 58, 22, 3) +
        `<g transform="translate(32 34) rotate(-35) scale(.82) translate(-32 -30)">` +
        L('M26 60 L24 64 M29 61 L29 65 M32 60 L34 64', 1.4, '#c8b48a') +
        R(25, 30, 10, 30, 4, '#f7f3e6') +
        F('M25 30 L35 30 L35 40 L25 40Z', '#d8ecb0', 0.9) +
        P('M25 32 Q16 14 14 2 Q22 12 28 30Z', '#3f7a3a', 2) +
        P('M35 32 Q44 14 48 2 Q40 12 32 30Z', '#4f8f3a', 2) +
        P('M28 31 Q28 12 31 0 Q34 12 33 31Z', '#5fa040', 2) +
        HL(28, 48, 1.4, 8, 0, 0.6) +
        `</g>`,
    // le basilic : un brin aux feuilles brillantes
    basil: () =>
        SHADOW(32, 58, 16, 2.6) +
        stem('M32 58 Q31 40 32 18', '#5f9a3a', 2) +
        leaf(32, 46, 17, -160, '#4fae3a', 0.55) +
        leaf(32, 44, 17, -20, '#4fae3a', 0.55) +
        leaf(32, 32, 15, -150, '#62c04a', 0.55) +
        leaf(32, 30, 15, -30, '#62c04a', 0.55) +
        leaf(32, 20, 12, -110, '#7ad05a', 0.55) +
        leaf(32, 20, 12, -70, '#7ad05a', 0.55) +
        FE(23, 41, 2, 1, '#fff', 0.5, -20) +
        FE(41, 41, 2, 1, '#fff', 0.5, 20),
    // les lentilles : un petit sac de toile ouvert qui déborde
    lentil: () => {
        let o =
            SHADOW(32, 58, 24, 3) +
            P('M14 26 Q10 44 14 56 L50 56 Q54 44 50 26Z', '#d9c08a') +
            L('M18 34 Q16 46 18 54 M46 34 Q48 46 46 54', 1.2, 'rgba(58,38,24,.25)');
        o += P('M12 26 Q32 18 52 26 Q32 34 12 26Z', '#b8863a');
        const pts = [
            [20, 25],
            [26, 23],
            [32, 22],
            [38, 23],
            [44, 25],
            [23, 28],
            [29, 27],
            [35, 27],
            [41, 28],
            [32, 25],
            [52, 52],
            [56, 55],
            [8, 54],
        ];
        o += pts.map(([x, y], k) => E(x, y, 2.6, 2, k % 3 ? '#c9762a' : '#a65e1e', 0, 1)).join('');
        return o + L('M14 30 Q32 36 50 30', 2.4, '#8b5a2b') + R(26, 38, 12, 8, 2, '#fffaf0', 1.4) + E(32, 42, 2.4, 1.8, '#c9762a', 0, 1);
    },
    // la moutarde : un bol de graines et la fleur jaune
    mustard: () =>
        SHADOW(30, 58, 22, 3) +
        P('M8 38 Q10 56 30 56 Q50 56 52 38Z', '#c08b52') +
        E(30, 38, 22, 6, '#d9b45a') +
        [12, 18, 24, 30, 36, 42, 48, 15, 21, 27, 33, 39, 45].map((x, k) => FC(x, k < 7 ? 37 : 39.5, 1.5, k % 2 ? '#b8862a' : '#e8c35a')).join('') +
        E(30, 38, 22, 6, 'none', 0, 2.2) +
        stem('M46 40 Q48 24 46 8', '#5f9a3a', 1.6) +
        [
            [46, 8],
            [41, 12],
            [51, 13],
            [44, 17],
            [50, 20],
        ]
            .map(
                ([x, y]) =>
                    [0, 90, 180, 270].map(a => FE(x + 2 * Math.cos((a * Math.PI) / 180), y + 2 * Math.sin((a * Math.PI) / 180), 1.8, 1.8, '#ffd23f')).join('') +
                    FC(x, y, 0.9, '#e8a317'),
            )
            .join('') +
        leaf(47, 30, 9, -20, '#62c04a', 0.5),
    // le melon : brodé de son filet, une tranche ouverte devant
    melon: () =>
        SHADOW(32, 58, 26, 3) +
        C(26, 32, 20, '#c8c86a') +
        L('M12 26 Q26 22 40 28 M10 36 Q26 32 44 40 M18 16 Q22 32 18 50 M28 12 Q34 32 30 52 M38 16 Q42 32 40 48', 1, 'rgba(58,38,24,.35)') +
        HL(18, 22, 4, 6, 25, 0.45) +
        L('M26 12 Q28 7 32 6', 2.2, '#6b8a2e') +
        P('M30 54 Q44 30 60 44 Q50 60 30 54Z', '#a8c06a', 2.2) +
        P('M33 52 Q45 33 57 45 Q49 57 33 52Z', '#f6a23a', 0) +
        F('M38 48 Q46 40 52 45', 'none') +
        [
            [42, 46],
            [46, 44],
            [50, 46],
            [45, 49],
        ]
            .map(([x, y]) => FE(x, y, 1.2, 0.7, '#fff3c0', 1, 30))
            .join(''),
    // l'asperge : une botte nouée, pointes violettes
    asparagus: () => {
        let o = SHADOW(32, 59, 20, 3);
        [
            [22, -6, '#7fb84a'],
            [28, -2, '#8fc65a'],
            [34, 2, '#7fb84a'],
            [40, 6, '#8fc65a'],
            [31, 0, '#9ad06a'],
        ].forEach(([x, rot, c]) => {
            o +=
                `<g transform="rotate(${rot} ${x} 58)">` +
                R(x - 3, 14, 6, 44, 3, c, 2) +
                P(`M${x - 3} 18 Q${x} 6 ${x + 3} 18Z`, '#8a5a9a', 1.8) +
                L(`M${x - 3} 28 L${x} 26 M${x + 3} 36 L${x} 34 M${x - 3} 44 L${x} 42`, 1.1, '#5a8a3a') +
                '</g>';
        });
        return o + R(18, 40, 28, 6, 2, '#c8453a', 2) + L('M22 43 L42 43', 1, 'rgba(255,255,255,.5)');
    },
    // l'artichaut : la tête aux bractées vert-violet
    artichoke: () => SHADOW(32, 58, 18, 3) + L('M32 50 L32 60', 4) + L('M32 50 L32 60', 2, '#7aa04a') + artichokeHead(32, 32, 1.35),
    // la poire : jaune verte, joue rosée, feuille
    pear: () => SHADOW(32, 59, 16, 3) + pearShape(32, 38, 1.35, '#d8d04a', '#f08a5a') + leaf(36, 12, 13, -30, G, 0.4),
    // les mirabelles : trois petites prunes dorées sur leur rameau
    mirabelle: () =>
        SHADOW(32, 58, 22, 3) +
        L('M10 14 Q28 18 50 12', 2.4, '#6b3d1e') +
        L('M20 16 L20 28 M32 17 L32 34 M44 14 L44 26', 1.4, '#6b3d1e') +
        leaf(26, 17, 13, -60, G, 0.4) +
        leaf(40, 15, 12, -120, GL, 0.4) +
        plum(20, 36, 9, '#f2c23a', '#e8803a') +
        plum(44, 34, 9, '#f6cc4a', '#e8803a') +
        plum(32, 44, 10, '#f2c23a', '#e8803a'),
    // l'abricot : deux fruits veloutés et une feuille
    apricot: () => SHADOW(32, 58, 22, 3) + leaf(30, 18, 16, -40, G, 0.45) + apricotFruit(22, 40, 13) + apricotFruit(42, 36, 12),
    // la figue : une entière, une ouverte au cœur rose
    fig: () =>
        SHADOW(32, 58, 24, 3) +
        figFruit(22, 36, 1.35, -10) +
        P('M38 44 Q38 30 48 28 Q58 30 58 44 Q58 56 48 56 Q38 56 38 44Z', '#6b2f5e', 2.2) +
        P('M41 44 Q41 33 48 31 Q55 33 55 44 Q55 53 48 53 Q41 53 41 44Z', '#f2d6b0', 0) +
        P('M43 44 Q44 35 48 34 Q52 35 53 44 Q53 51 48 51 Q43 51 43 44Z', '#d8436a', 0) +
        [
            [46, 40],
            [50, 42],
            [47, 46],
            [49, 48],
            [45, 44],
        ]
            .map(([x, y]) => FC(x, y, 0.9, '#fff3c0'))
            .join(''),
    // les noix : une entière, un cerneau et la coque
    walnut: () =>
        SHADOW(32, 58, 24, 3) +
        walnutShell(22, 36, 1.3) +
        P('M38 52 Q36 40 46 38 Q56 40 54 52Z', '#c8a46a', 2) +
        P('M41 50 Q40 43 46 42 Q52 43 51 50 Q48 46 46 50 Q44 46 41 50Z', '#e8d0a0', 1.4),
    // la châtaigne : la bogue ouverte et ses deux fruits brillants
    chestnut: () => {
        let o = SHADOW(32, 58, 24, 3);
        let spikes = '';
        for (let a = 200; a <= 340; a += 12) {
            const r = (a * Math.PI) / 180;
            spikes += `M${32 + 22 * Math.cos(r)} ${44 + 14 * Math.sin(r)} L${32 + 28 * Math.cos(r)} ${44 + 19 * Math.sin(r)} `;
        }
        o +=
            L(spikes, 1.4, '#7aa04a') +
            P('M8 44 Q10 28 32 26 Q54 28 56 44 Q46 52 32 52 Q18 52 8 44Z', '#a8c65a') +
            P('M12 44 Q14 32 32 30 Q50 32 52 44 Q32 50 12 44Z', '#f2e6c0', 1.6);
        return o + chestnutNut(24, 40, 1, -12) + chestnutNut(40, 40, 1, 12);
    },
};

// ======================= les plantes au champ =======================
const sprout2 = (c = G) => mound() + leaf(32, 54, 16, -140, c, 0.4) + leaf(32, 54, 16, -40, c, 0.4) + leaf(32, 54, 14, -90, GL, 0.4);
Object.assign(youngExtra, {
    greenBean: () => mound() + stem('M32 56 L32 30', G, 2) + leaf(32, 46, 13, -150, G, 0.5) + leaf(32, 42, 13, -30, GL, 0.5) + leaf(32, 34, 11, -120, G, 0.5),
    leek: () => mound() + [-100, -88, -76].map((a, k) => leaf(32, 56, 24, a, k % 2 ? '#4f8f3a' : '#3f7a3a', 0.16)).join(''),
    basil: () => sprout2('#4fae3a'),
    lentil: () => mound() + [26, 32, 38].map(x => stem(`M${x} 56 L${x} 40`, G, 1.4) + leaf(x, 44, 7, -150, GL, 0.5) + leaf(x, 42, 7, -30, G, 0.5)).join(''),
    mustard: () => sprout2('#62c04a'),
    melon: () => mound() + L('M32 54 Q44 48 52 52', 2, GD) + leaf(32, 54, 16, -160, G, 0.55) + leaf(32, 54, 16, -20, G, 0.55) + C(46, 52, 3, '#ffd23f', 1.4),
    asparagus: () =>
        mound() +
        [24, 32, 40]
            .map(
                (x, k) =>
                    R(x - 2, 40 + k * 3, 4, 16 - k * 3, 2, '#8fc65a', 1.6) +
                    P(`M${x - 2} ${42 + k * 3} Q${x} ${36 + k * 3} ${x + 2} ${42 + k * 3}Z`, '#8a5a9a', 1.2),
            )
            .join(''),
    artichoke: () => mound() + [-160, -120, -60, -20].map((a, k) => leaf(32, 54, 18, a, k % 2 ? '#8fb07a' : '#a0bf8a', 0.3)).join(''),
});
const vine = (x, y) => L(`M${x} ${y} Q${x - 6} ${y - 10} ${x} ${y - 20} Q${x + 6} ${y - 30} ${x} ${y - 40}`, 2, GD);
Object.assign(readyExtra, {
    greenBean: () =>
        mound() +
        L('M20 56 L20 10 M44 56 L44 10 M18 12 L46 12', 2.4, '#a8793a') +
        vine(26, 56) +
        vine(38, 56) +
        leaf(26, 40, 10, -150, G, 0.5) +
        leaf(38, 30, 10, -30, GL, 0.5) +
        leaf(26, 22, 9, -150, GL, 0.5) +
        pod(24, 30, 80, 18, '#5fb43a') +
        pod(30, 34, 95, 18, '#4fa832') +
        pod(40, 24, 85, 18, '#6cc04a') +
        pod(36, 42, 100, 14, '#5fb43a'),
    leek: () =>
        mound() +
        [24, 32, 40]
            .map(
                x =>
                    R(x - 3, 34, 6, 22, 3, '#f7f3e6', 1.8) +
                    P(`M${x - 3} 36 Q${x - 10} 20 ${x - 12} 8 Q${x - 4} 18 ${x} 34Z`, '#3f7a3a', 1.8) +
                    P(`M${x + 3} 36 Q${x + 9} 20 ${x + 10} 8 Q${x + 3} 18 ${x} 34Z`, '#4f8f3a', 1.8),
            )
            .join(''),
    basil: () =>
        mound() +
        stem('M32 56 L32 18', '#5f9a3a', 2) +
        [46, 38, 30, 22]
            .map(
                (y, k) =>
                    leaf(32, y, 15 - k * 2, -160, k % 2 ? '#62c04a' : '#4fae3a', 0.55) + leaf(32, y - 1, 15 - k * 2, -20, k % 2 ? '#4fae3a' : '#62c04a', 0.55),
            )
            .join('') +
        [28, 32, 36].map((x, k) => FC(x, 14 - (k % 2) * 2, 1.6, '#f6f0ff')).join(''),
    lentil: () =>
        mound() +
        [22, 30, 38, 44]
            .map(
                x =>
                    stem(`M${x} 56 Q${x - 2} 40 ${x} 26`, '#7aa04a', 1.4) +
                    leaf(x, 44, 7, -150, GL, 0.5) +
                    leaf(x, 36, 7, -30, G, 0.5) +
                    P(`M${x - 4} 30 Q${x} 26 ${x + 4} 30 Q${x} 33 ${x - 4} 30Z`, '#d8c88a', 1.2),
            )
            .join(''),
    mustard: () =>
        mound() +
        [24, 32, 40]
            .map(
                (x, k) =>
                    stem(`M${x} 56 L${x} ${18 + k * 2}`, '#5f9a3a', 1.6) +
                    leaf(x, 46, 10, k % 2 ? -30 : -150, G, 0.5) +
                    [0, 5, 10].map(d => C(x + (d % 10 ? 3 : -3), 18 + k * 2 + d, 2.6, '#ffd23f', 1.2)).join(''),
            )
            .join(''),
    melon: () =>
        mound() +
        L('M32 54 Q44 46 54 50 M32 54 Q20 46 10 50', 2, GD) +
        leaf(14, 48, 14, -150, G, 0.55) +
        leaf(50, 48, 14, -30, G, 0.55) +
        leaf(32, 52, 14, -90, GL, 0.55) +
        `<g transform="translate(14 22) scale(.56)">${ITEMS_RAW.melon().replace(/<ellipse[^>]*opacity="0.18"[^>]*\/>/, '')}</g>`,
    asparagus: () =>
        mound() +
        [20, 27, 34, 41]
            .map(
                (x, k) =>
                    R(x - 2.5, 20 + (k % 2) * 6, 5, 36 - (k % 2) * 6, 2.5, k % 2 ? '#9ad06a' : '#7fb84a', 1.8) +
                    P(`M${x - 2.5} ${23 + (k % 2) * 6} Q${x} ${14 + (k % 2) * 6} ${x + 2.5} ${23 + (k % 2) * 6}Z`, '#8a5a9a', 1.4),
            )
            .join('') +
        L('M47 56 Q48 36 52 18 M52 18 L48 12 M52 18 L56 14 M50 28 L46 24 M50 28 L55 26', 1.2, '#7fb84a'),
    artichoke: () =>
        mound() +
        [-165, -125, -55, -15].map((a, k) => leaf(32, 54, 20, a, k % 2 ? '#8fb07a' : '#a0bf8a', 0.3)).join('') +
        stem('M32 54 L32 30', '#7aa04a', 3) +
        artichokeHead(32, 22, 0.75),
});

// les fruits sur l'arbre
Object.assign(FRUIT_COL, { pear: '#d8d04a', mirabelle: '#f2c23a', apricot: '#f6a23a', fig: '#6b2f5e', walnut: '#a8c65a', chestnut: '#a8c65a' });
Object.assign(fruitExtra, {
    pear: (x, y) => pearShape(x, y, 0.42, '#d8d04a', '#f08a5a'),
    mirabelle: (x, y) => plum(x - 2.5, y, 3, '#f2c23a', '#e8803a') + plum(x + 2.5, y + 1, 3, '#f6cc4a', '#e8803a'),
    apricot: (x, y) => apricotFruit(x, y, 4.6),
    fig: (x, y) => figFruit(x, y, 0.4),
    // la noix et la châtaigne restent dans leur coque verte sur l'arbre
    walnut: (x, y) => C(x, y, 4.4, '#8fbf5a', 1.8) + FC(x - 1.4, y - 1.4, 1.2, '#fff', 0.5) + FC(x + 1.5, y + 1, 0.6, '#5f8a3e'),
    chestnut: (x, y) => {
        let s = '';
        for (let a = 0; a < 360; a += 40)
            s += `M${x + 4 * Math.cos((a * Math.PI) / 180)} ${y + 4 * Math.sin((a * Math.PI) / 180)} L${x + 6.5 * Math.cos((a * Math.PI) / 180)} ${y + 6.5 * Math.sin((a * Math.PI) / 180)} `;
        return L(s, 1, '#7aa04a') + C(x, y, 4.4, '#a8c65a', 1.6) + FC(x - 1.4, y - 1.4, 1.1, '#fff', 0.5);
    },
});

// ======================= les recettes =======================
const cocotte = (fill, extra = '') =>
    SHADOW(32, 59, 26, 3) +
    P('M8 30 L56 30 L54 52 Q54 57 48 57 L16 57 Q10 57 10 52Z', '#c8453a') +
    F('M10 44 L54 44 L54 52 Q54 57 48 57 L16 57 Q10 57 10 52Z', '#a8352a', 0.6) +
    R(2, 32, 8, 6, 3, '#c8453a', 2) +
    R(54, 32, 8, 6, 3, '#c8453a', 2) +
    E(32, 30, 24, 6, fill) +
    extra +
    E(32, 30, 24, 6, 'none', 0, 2.4) +
    HL(16, 40, 2, 6, 0, 0.5) +
    steamF;
const tartBase = (fill, top = '') =>
    plate(48) +
    P('M8 42 Q8 50 32 51 Q56 50 56 42 L54 36 Q32 30 10 36Z', '#e8a548') +
    E(32, 37, 22, 7, fill) +
    top +
    E(32, 37, 22, 7, 'none', 0, 2) +
    L('M10 38 Q14 42 18 39 Q22 43 26 40 Q30 44 34 40 Q38 44 42 40 Q46 43 50 39 Q53 42 55 38', 1.6, '#c98b2a');
const brandy = (glass, liquid, label, mark, cap = '#c8453a', shape = 'tall') => {
    const body =
        shape === 'flask'
            ? 'M27 4 L37 4 L37 16 Q50 22 50 40 Q50 60 32 60 Q14 60 14 40 Q14 22 27 16Z'
            : 'M27 2 L37 2 L37 18 Q46 22 46 30 L46 56 Q46 60 42 60 L22 60 Q18 60 18 56 L18 30 Q18 22 27 18Z';
    const lq =
        shape === 'flask'
            ? 'M15.5 34 Q32 30 48.5 34 Q49 58.5 32 58.5 Q15 58.5 15.5 34Z'
            : 'M19.4 30 Q32 27 44.6 30 L44.6 56 Q44.6 58.6 42 58.6 L22 58.6 Q19.4 58.6 19.4 56Z';
    return (
        SHADOW(32, 61, 16, 2.6) +
        P(body, glass) +
        F(lq, liquid, 0.85) +
        (mark || '') +
        R(20, 38, 24, 14, 3, label, 1.6) +
        F('M20.5 30 L23 28 L23 54 L20.5 54Z', '#fff', 0.45) +
        P(body, 'none') +
        R(26, 0, 12, 6, 2, cap)
    );
};
const labelMark = id => sub(id, 25.5, 38.5, 13);
const cone = (fill, extra = '') =>
    SHADOW(32, 59, 12, 2.4) + extra + P('M14 22 L50 22 L33 60 Q32 62 31 60Z', fill) + L('M18 30 L46 30 M22 40 L42 40', 1, 'rgba(58,38,24,.3)');
const ramekin = (top, extra = '') =>
    SHADOW(32, 57, 24, 3) +
    P('M8 30 L56 30 L54 52 Q54 55 50 55 L14 55 Q10 55 10 52Z', '#ffffff') +
    L('M12 36 L52 36 M12 42 L52 42 M12 48 L52 48', 1, 'rgba(58,38,24,.18)') +
    E(32, 30, 24, 6.5, top) +
    extra +
    E(32, 30, 24, 6.5, 'none', 0, 2.4);
const sack = (fill, top, dots) =>
    SHADOW(32, 58, 22, 3) +
    P('M14 28 Q10 46 14 56 L50 56 Q54 46 50 28Z', fill) +
    P('M12 28 Q32 20 52 28 Q32 36 12 28Z', top) +
    dots +
    L('M14 32 Q32 38 50 32', 2.4, '#8b5a2b');

const RECIPES_ART = () => ({
    // ---- comptoir froid ----
    pesto: jar('#5fa040', '#c8453a', sub('basil', 22, 33, 20)) + FC(26, 26, 1.6, '#e8d070') + FC(38, 27, 1.4, '#e8d070'),
    nicoise:
        bowl('#8fc65a', 30, '#3f6fb5') +
        pod(14, 30, -10, 18, '#4fa832') +
        pod(30, 26, 15, 16, '#5fb43a') +
        C(22, 28, 5, '#fffaf0', 1.6) +
        FC(22, 28, 2.6, '#ffd23f') +
        C(40, 30, 5, '#fffaf0', 1.6) +
        FC(40, 30, 2.6, '#ffd23f') +
        C(30, 32, 4, '#e2412f', 1.6) +
        FC(48, 28, 2.2, '#3a2618') +
        FC(16, 33, 2.2, '#3a2618'),
    lentilSalad:
        bowl('#a65e1e', 30) +
        [16, 22, 28, 34, 40, 46, 19, 25, 31, 37, 43].map((x, k) => E(x, k < 7 ? 28 : 32, 2.2, 1.6, k % 2 ? '#c9762a' : '#8b4a22', 0, 0.8)).join('') +
        E(36, 29, 3.5, 2, '#f2e6f6', 0, 1.2) +
        E(24, 31, 3.5, 2, '#f2e6f6', 0, 1.2) +
        leaf(30, 29, 6, -30, '#4caf50', 0.5),
    // ---- cuisine ----
    asparagusMousseline:
        plate(46) +
        [-14, -7, 0, 7]
            .map(
                (dy, k) =>
                    `<g transform="rotate(${-12 + k * 2} 32 ${44 + dy / 3})">` +
                    R(10, 40 + dy / 3, 38, 5, 2.5, k % 2 ? '#8fc65a' : '#7fb84a', 1.8) +
                    P(`M48 ${40 + dy / 3} Q55 ${42.5 + dy / 3} 48 ${45 + dy / 3}Z`, '#8a5a9a', 1.4) +
                    '</g>',
            )
            .join('') +
        P('M16 38 Q24 34 30 40 Q36 46 44 42 Q40 50 28 48 Q18 46 16 38Z', '#ffe58a', 1.8),
    asparagusVeloute: bowl('#a8d06a', 30) + L('M18 30 Q30 26 44 31', 2, '#fffaf0') + sub('asparagus', 38, 30, 22) + steamF,
    // ---- fourneau ----
    barigoule: cocotte('#c89a4a', artichokeHead(22, 28, 0.42) + artichokeHead(40, 29, 0.42) + FC(31, 30, 2, '#f08a24') + FC(48, 28, 1.6, '#f08a24')),
    pistou:
        bowl('#8fbf4a', 30) +
        pod(14, 30, -8, 14, '#4fa832') +
        pod(34, 28, 10, 12, '#5fb43a') +
        E(26, 31, 3, 2, '#f2e6c0', 0, 1) +
        E(44, 30, 3, 2, '#f2e6c0', 0, 1) +
        leaf(30, 29, 7, -30, '#3f9a2a', 0.55) +
        leaf(30, 29, 7, -150, '#3f9a2a', 0.55) +
        steamF,
    leekVeloute:
        bowl('#d8e6a0', 30) +
        [20, 30, 40].map(x => C(x, 30, 3.2, '#f7f3e6', 1.2) + C(x, 30, 1.4, '#a8d06a', 0.8)).join('') +
        L('M14 32 Q24 34 30 32', 1.4, '#fffaf0') +
        steamF,
    peaVeloute:
        bowl('#7ac040', 30) +
        P('M20 30 Q28 24 36 30 Q30 34 24 32Z', '#fffaf0', 1.2) +
        FC(42, 29, 2, '#a8e06a') +
        FC(46, 31, 2, '#a8e06a') +
        leaf(16, 30, 6, -20, '#3f9a2a', 0.5) +
        steamF,
    dhal:
        bowl('#f0b83a', 30, '#e8792a') +
        P('M20 30 Q30 25 40 30 Q32 33 22 32Z', '#fffaf0', 1.2) +
        [18, 26, 44, 36].map((x, k) => FC(x, 30 + (k % 2), 1.6, '#e8792a')).join('') +
        leaf(42, 28, 6, -40, '#4caf50', 0.5) +
        steamF,
    // ---- poissonnerie ----
    eelGreen:
        plate(46) +
        P('M12 44 Q14 34 32 34 Q50 34 52 44 Q32 50 12 44Z', '#7ab84a') +
        [18, 28, 38].map(x => R(x, 36, 8, 7, 3, '#6b7a5a', 1.6) + E(x + 4, 37.5, 3, 1, '#b8c8a0', 0, 0)).join('') +
        leaf(46, 40, 6, -40, '#3f9a2a', 0.5) +
        leaf(14, 40, 6, -150, '#3f9a2a', 0.5),
    seabassSalt:
        woodBoard() +
        P('M6 40 Q14 22 34 22 Q50 22 56 32 L62 26 L60 38 L62 50 L56 44 Q50 52 34 52 Q14 52 6 40Z', '#f7f3ea') +
        [14, 22, 30, 38, 46, 18, 26, 34, 42].map((x, k) => FC(x, k < 5 ? 34 : 42, 1.1, '#d8d0c2')).join('') +
        P('M30 22 L34 30 L28 36 L34 42 L31 52', 'none', 1.8) +
        P('M31 30 L42 30 L44 40 L33 42 L28 36Z', '#c9d3dc', 1.6) +
        FC(14, 36, 2.2, '#3a2618') +
        sub('lime', 44, 40, 16),
    // ---- four à pain ----
    flamiche: tartBase(
        '#f4e3a0',
        [18, 26, 34, 42, 46, 22, 38].map((x, k) => C(x, k < 5 ? 36 : 39, 2.8, '#d8e6a0', 1.2) + FC(x, k < 5 ? 36 : 39, 1.1, '#8fbf4a')).join(''),
    ),
    artichokeTart:
        plate(48) +
        R(8, 32, 48, 16, 3, '#e8a548') +
        R(11, 34, 42, 11, 2, '#f2d090', 1.6) +
        [18, 28, 38, 48].map(x => artichokeHead(x - 1, 39.5, 0.28)).join('') +
        [14, 33, 43].map(x => leaf(x, 38, 4, -60, '#4caf50', 0.4)).join(''),
    // ---- pâtisserie ----
    tatin:
        plate(48) +
        P('M8 42 Q8 50 32 51 Q56 50 56 42 L56 36 Q32 30 8 36Z', '#a8531f') +
        E(32, 36, 24, 8, '#c8742a') +
        [
            [18, 35],
            [28, 33],
            [38, 33],
            [46, 36],
            [24, 39],
            [36, 39],
        ]
            .map(([x, y]) => E(x, y, 5, 3.4, '#e09a3a', -10, 1.4) + FE(x - 1.5, y - 1, 2, 1, '#ffd88a', 0.8))
            .join('') +
        E(32, 36, 24, 8, 'none', 0, 2),
    madeleines:
        plate(48) +
        [
            [20, 40, -15],
            [42, 40, 15],
            [31, 34, 0],
        ]
            .map(
                ([x, y, r]) =>
                    `<g transform="rotate(${r} ${x} ${y})">` +
                    P(
                        `M${x - 11} ${y + 2} Q${x - 10} ${y - 9} ${x} ${y - 10} Q${x + 10} ${y - 9} ${x + 11} ${y + 2} Q${x} ${y + 7} ${x - 11} ${y + 2}Z`,
                        '#f2b84a',
                    ) +
                    L(
                        `M${x} ${y - 9} L${x} ${y + 4} M${x - 5} ${y - 7} L${x - 3} ${y + 3} M${x + 5} ${y - 7} L${x + 3} ${y + 3} M${x - 9} ${y - 3} L${x - 6} ${y + 3} M${x + 9} ${y - 3} L${x + 6} ${y + 3}`,
                        1,
                        '#c98b2a',
                    ) +
                    '</g>',
            )
            .join(''),
    waffles:
        plate(48) +
        `<g transform="rotate(-8 32 38)">` +
        R(12, 26, 40, 22, 4, '#f2b84a') +
        [18, 25, 32, 39, 46].map(x => L(`M${x} 27 L${x} 47`, 1.4, '#c98b2a')).join('') +
        [32, 37, 42].map(y => L(`M13 ${y} L51 ${y}`, 1.4, '#c98b2a')).join('') +
        '</g>' +
        [20, 28, 36, 44, 24, 40].map((x, k) => FC(x, k < 4 ? 30 : 38, 1.4, '#fff')).join(''),
    mirabelleTart: tartBase(
        '#f6e0a0',
        [16, 22, 28, 34, 40, 46, 19, 25, 31, 37, 43, 26, 38].map((x, k) => plum(x, k < 6 ? 36 : k < 11 ? 39 : 33, 2.8, '#f2c23a', '#e8803a')).join(''),
    ),
    apricotTart: tartBase(
        '#f6e0a0',
        [18, 30, 42, 24, 36]
            .map((x, k) => E(x, k < 3 ? 36 : 39.5, 5, 3.4, '#f6a23a', 0, 1.6) + FE(x + 1, (k < 3 ? 36 : 39.5) + 0.5, 2, 1.4, '#e8603a', 0.6))
            .join(''),
    ),
    walnutCake:
        plate(50) +
        P('M10 46 L10 30 Q32 22 54 30 L54 46 Q32 52 10 46Z', '#8b5a2b') +
        E(32, 30, 22, 7, '#a8693a') +
        [
            [20, 29],
            [32, 27],
            [44, 29],
            [26, 32],
            [38, 32],
        ]
            .map(([x, y]) => walnutShell(x, y, 0.32))
            .join('') +
        L('M10 38 Q32 44 54 38', 1.6, '#f2e6c0') +
        HL(14, 40, 1.6, 4, 0, 0.5),
    // ---- confiserie ----
    figJam: jar('#7a2f5e', '#c8453a', sub('fig', 22, 33, 20)),
    apricotJam: jar('#f29a2a', '#e8c35a', sub('apricot', 22, 33, 20)),
    melonJam: jar('#f6b04a', '#7cc23a', sub('melon', 22, 33, 20)),
    chestnutCream: jar('#8b5a3a', '#3f6fb5', sub('chestnut', 22, 33, 20)),
    marronsGlaces:
        SHADOW(32, 58, 26, 3) +
        R(6, 40, 52, 14, 4, '#c8453a') +
        L('M8 44 L56 44', 1, 'rgba(255,255,255,.4)') +
        [16, 32, 48]
            .map(
                x =>
                    P(`M${x - 9} 42 L${x - 7} 30 L${x + 7} 30 L${x + 9} 42Z`, '#f2d06a', 1.8) +
                    L(`M${x - 6} 32 L${x - 5} 41 M${x} 31 L${x} 41 M${x + 6} 32 L${x + 5} 41`, 0.9, '#c9952a') +
                    chestnutNut(x, 26, 0.75) +
                    FE(x - 2, 22, 2.5, 1.2, '#fff', 0.7),
            )
            .join(''),
    // ---- glacier ----
    belleHelene: coupe(
        scoop(24, 26, 9, '#fff6e0') +
            pearShape(38, 22, 0.75, '#e8e090', '') +
            P('M16 24 Q24 34 30 26 Q34 32 40 30 Q44 36 48 30', 'none', 3) +
            L('M16 24 Q24 34 30 26 Q34 32 40 30 Q44 36 48 30', 2.2, '#5e3a1e'),
    ),
    melonIce: coupe(
        scoop(24, 26, 10, '#f6a23a') + scoop(40, 26, 10, '#f8b85a') + scoop(32, 18, 9, '#f6a23a'),
        P('M44 10 Q52 2 60 12 Q54 18 44 10Z', '#a8c06a', 1.8) + P('M46 10 Q52 5 58 12 Q53 15 46 10Z', '#f6a23a', 0),
    ),
    // ---- pressoir ----
    pearJuice: juiceB('#e8e09a', 'pear', '#8fbf4a'),
    apricotJuice: juiceB('#f6a23a', 'apricot', '#e8603a'),
    // ---- moulin ----
    mustardSauce:
        SHADOW(32, 59, 18, 3) +
        P('M14 20 L50 20 L48 54 Q48 58 44 58 L20 58 Q16 58 16 54Z', '#f2e6d0') +
        L('M15 26 L49 26', 1.4, '#c9b48a') +
        R(20, 34, 24, 14, 3, '#3f6fb5', 1.6) +
        L('M23 41 L41 41', 1.6, '#fffaf0') +
        E(32, 20, 18, 4.5, '#e8b83a') +
        [22, 28, 34, 40, 25, 31, 37].map((x, k) => FC(x, k < 4 ? 19 : 21, 1.2, '#b8862a')).join('') +
        E(32, 20, 18, 4.5, 'none', 0, 2.2) +
        L('M40 18 L54 4', 3, '#c08b52'),
    // ---- huilerie ----
    walnutOil: oil('#c8a04a', 'walnut', '#8b5a2b'),
    mustardOil: oil('#e8c83a', 'mustard', '#c8453a'),
    // ---- conserverie ----
    cannedArtichoke: jar('#b8c06a', '#3f8f2e', artichokeHead(32, 41, 0.42)),
    cannedBeans: jar('#7ab84a', '#e8792a', pod(22, 42, -6, 20, '#4fa832') + pod(23, 46, 4, 18, '#5fb43a')),
    radishPickles: jar('#f2c0d0', '#e8b83a', sub('radish', 22, 33, 20)),
    asparagusJar: jar('#c8d890', '#8a5a9a', sub('asparagus', 22, 33, 20)),
    // ---- laiterie ----
    cremeBrulee:
        ramekin('#d9902a', L('M18 28 L26 32 L22 34 M38 27 L44 31', 1.4, '#a8601e') + FE(28, 28, 6, 1.6, '#fff', 0.45)) +
        L('M44 18 L58 8', 3) +
        L('M44 18 L58 8', 1.6, '#dfe6ec') +
        E(42, 20, 3.5, 2.2, '#dfe6ec', -35, 1.6),
    // ---- séchoir ----
    prunes:
        bowl('#3a2a3a', 30, '#8a5a9a') +
        [16, 24, 32, 40, 48, 20, 28, 36, 44]
            .map((x, k) => E(x, k < 5 ? 28 : 31, 3.4, 2.6, k % 2 ? '#4a2a4a' : '#5e3a5e', 0, 1.2) + FC(x - 1, (k < 5 ? 28 : 31) - 1, 0.7, '#fff', 0.5))
            .join(''),
    driedPear:
        woodBoard() +
        [
            [18, 36],
            [32, 34],
            [46, 36],
        ]
            .map(
                ([x, y]) =>
                    `<g transform="translate(${x} ${y}) scale(1 .7)">` +
                    P('M0 -12 Q-6 -12 -6 -5 Q-8 0 -10 5 Q-12 12 0 13 Q12 12 10 5 Q8 0 6 -5 Q6 -12 0 -12Z', '#a8743a', 2.2) +
                    L('M-3 -2 Q0 2 3 -2 M-5 6 Q0 9 5 6', 1, '#7a4a22') +
                    '</g>' +
                    L(`M${x} ${y - 8} L${x + 1} ${y - 12}`, 1.6, '#6b3d1e'),
            )
            .join(''),
    driedApricot: sack(
        '#d9c08a',
        '#e8803a',
        [18, 25, 32, 39, 46, 22, 29, 36, 43].map((x, k) => E(x, k < 5 ? 26 : 29, 3.4, 2.4, k % 2 ? '#e8803a' : '#f29a3a', 0, 1.1)).join(''),
    ),
    driedFig:
        L('M8 12 Q32 22 56 12', 2, '#c8a46a') +
        [14, 24, 34, 44, 52]
            .map(
                (x, k) =>
                    L(`M${x} ${14 + Math.sin(k) * 2} L${x} ${20 + (k % 2) * 2}`, 1.2, '#c8a46a') +
                    figFruit(x, 30 + (k % 2) * 4, 0.62, k % 2 ? 8 : -8)
                        .replace(/#6b2f5e/g, '#7a4a3a')
                        .replace(/#8c4a7a/g, '#9a6a4a'),
            )
            .join(''),
    trailMix:
        SHADOW(32, 58, 18, 3) +
        P('M16 24 L48 24 L46 56 L18 56Z', '#c8a46a') +
        L('M16 24 L20 18 L44 18 L48 24', 2.2) +
        R(22, 36, 20, 12, 3, '#fffaf0', 1.4) +
        sub('walnut', 24, 35, 14) +
        walnutShell(24, 20, 0.3) +
        apricotFruit(34, 19, 3.4) +
        figFruit(42, 19, 0.32),
    // ---- alambic ----
    pearBrandy: brandy('#eaf6fd', '#fbf6e0', '#fffaf0', pearShape(32, 46, 0.65, '#d8d04a', '#f08a5a'), '#8fbf4a') + labelMark('pear'),
    mirabelleBrandy: brandy('#eaf6fd', '#fbf6e0', '#fffaf0', '', '#f2c23a', 'flask') + labelMark('mirabelle'),
    calvados: brandy('#d8c8a0', '#c8742a', '#fffaf0', '', '#5e3a1e') + labelMark('apple'),
    walnutWine: brandy('#5a3a2a', '#3a1a1a', '#f2e6c0', '', '#8b5a2b') + labelMark('walnut'),
    // ---- brûlerie ----
    roastChestnut:
        cone('#f2e6c0', [22, 32, 42, 27, 37].map((x, k) => chestnutNut(x, k < 3 ? 22 : 17, 0.55, (k - 2) * 15).replace(/#8b4a22/g, '#5e3a1e')).join('')) +
        steamF,
});

// ======================= les machines =======================
const MACH = () => ({
    // le comptoir froid : vitrine réfrigérée, saladiers et un sandwich
    deli:
        SHADOW(32, 60, 28, 3) +
        R(4, 30, 56, 28, 4, '#5aa9e6') +
        L('M8 44 L56 44', 1.6, '#3f8fc6') +
        P('M6 30 L14 12 L58 12 L58 30Z', '#eaf6fd') +
        L('M14 12 L14 30 M36 12 L36 30', 1.4, '#bfe6fb') +
        sub('salad', 14, 14, 18) +
        sub('pesto', 38, 14, 16) +
        F('M16 14 L22 14 L18 28 L12 28Z', '#fff', 0.4) +
        R(8, 48, 48, 6, 2, '#fffaf0', 1.4) +
        FC(52, 38, 2, '#ffd23f'),
    // la pâtisserie : vitrine rose sous un store, gâteaux et tartes
    pastry:
        SHADOW(32, 60, 28, 3) +
        R(6, 26, 52, 32, 4, '#fbe1ea') +
        P('M4 14 L60 14 L58 24 L6 24Z', '#fff') +
        [4, 18, 32, 46].map(x => F(`M${x + 1} 14 L${x + 8} 14 L${x + 8} 24 L${x + 2} 24Z`, '#f6a5b5')).join('') +
        P('M4 14 L60 14 L58 24 L6 24Z', 'none', 2) +
        [10, 24, 38, 52].map(x => P(`M${x - 6} 24 a6 3 0 0 0 12 0Z`, '#f6a5b5', 1.4)).join('') +
        R(10, 30, 44, 22, 3, '#eaf6fd', 2) +
        sub('strawberryCake', 12, 32, 18) +
        sub('tatin', 32, 33, 18) +
        F('M14 31 L18 31 L15 50 L12 50Z', '#fff', 0.45),
    // la poissonnerie : un étal de glace pilée, poissons, citron et ardoise
    fishmonger:
        SHADOW(32, 60, 28, 3) +
        R(4, 40, 56, 18, 3, '#3f6fb5') +
        L('M4 46 L60 46', 1.4, '#2f5a9a') +
        P('M2 40 L62 40 L56 26 L8 26Z', '#eaf6fd') +
        [12, 20, 28, 36, 44, 52, 16, 24, 32, 40, 48].map((x, k) => FC(x, k < 6 ? 36 : 31, 1.6, '#fff')).join('') +
        sub('trout', 6, 22, 22) +
        sub('seabass', 24, 20, 22) +
        sub('lime', 44, 24, 14) +
        R(46, 6, 14, 12, 2, '#3a3a3a', 1.8) +
        L('M49 10 L57 10 M49 14 L55 14', 1.2, '#fff'),
    // le fourneau : cuisinière en fonte, cocotte rouge qui mijote
    stove:
        SHADOW(32, 60, 28, 3) +
        R(6, 30, 52, 28, 3, '#3a3a40') +
        R(10, 40, 20, 14, 2, '#5a5a62', 1.8) +
        R(34, 40, 20, 14, 2, '#5a5a62', 1.8) +
        L('M14 47 L26 47 M38 47 L50 47', 2, '#c9a85a') +
        R(4, 28, 56, 5, 2, '#c9a85a', 2) +
        P('M14 28 L50 28 L48 14 Q48 10 44 10 L20 10 Q16 10 16 14Z', '#c8453a') +
        E(32, 10, 16, 3, '#a8352a') +
        C(32, 7, 3, '#3a3a40', 1.6) +
        R(8, 16, 8, 5, 2.5, '#c8453a', 1.8) +
        R(48, 16, 8, 5, 2.5, '#c8453a', 1.8) +
        HL(22, 18, 2, 4, 0, 0.5) +
        L('M24 4 Q20 0 24 -4 M40 4 Q36 0 40 -4', 1.6, '#fff'),
    // le séchoir : claies de bois au soleil, fruits en rangs
    dryer:
        SHADOW(32, 60, 28, 3) +
        L('M8 58 L8 14 M56 58 L56 14', 3.4, '#8b5a2b') +
        P('M4 14 L32 4 L60 14Z', '#c8453a') +
        [22, 36, 50]
            .map(
                (y, k) =>
                    R(8, y, 48, 5, 1.5, '#d9a066', 1.8) +
                    [14, 22, 30, 38, 46]
                        .map(x =>
                            k === 0
                                ? apricotFruit(x, y - 2, 3.4)
                                : k === 1
                                  ? E(x, y - 1.5, 3.6, 2.4, '#7a4a3a', 0, 1.2)
                                  : plum(x, y - 2, 3.2, '#f2c23a', '#e8803a'),
                        )
                        .join(''),
            )
            .join('') +
        C(52, 6, 3, '#ffd23f', 1.4),
    // l'alambic : chaudière de cuivre, col de cygne, serpentin et bouteille
    still:
        SHADOW(32, 60, 28, 3) +
        R(4, 46, 30, 12, 2, '#8f8574') +
        F('M10 50 L28 50 L28 56 L10 56Z', '#e8792a', 0.7) +
        P('M6 46 Q4 26 19 24 Q34 26 32 46Z', '#d98b3a') +
        E(19, 24, 8, 3, '#e2a548') +
        P('M19 22 Q19 10 30 8 L46 12', 'none', 4.6) +
        L('M19 22 Q19 10 30 8 L46 12', 2.6, '#e2a548') +
        R(40, 14, 16, 26, 3, '#a0703a') +
        L('M42 20 Q48 18 54 22 Q48 26 42 24 Q48 28 54 30 Q48 34 42 32', 1.6, '#e2a548') +
        L('M48 40 L48 46', 2.4) +
        sub('pearBrandy', 40, 40, 18) +
        HL(12, 34, 2, 6, 0, 0.5) +
        L('M16 36 L22 36', 1.2, '#a8531f'),
});

// ======================= l'enregistrement =======================
Object.assign(items, ITEMS_RAW);
let rec = null;
Object.keys(RECIPES_ART()).forEach(k => (items[k] = () => (rec = rec || RECIPES_ART())[k]));
let mach = null;
Object.keys(MACH()).forEach(k => (machines[k] = () => (mach = mach || MACH())[k]));

// pour la 1.3.2
export { pod, pearShape, plum, apricotFruit, figFruit, walnutShell, chestnutNut, artichokeHead, cocotte, ramekin };
