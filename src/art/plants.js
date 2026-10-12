// Les cultures et les arbres : pousses, plants jeunes et mûrs.
import {
    BLUE_B,
    C,
    E,
    F,
    FC,
    FE,
    G,
    GD,
    GL,
    GRAPE,
    HL,
    L,
    O,
    OLIVE,
    P,
    R,
    SHADOW,
    SUN,
    dots,
    items,
    lavSprig,
    leaf,
    mound,
    readyExtra,
    stem,
    youngExtra,
} from './kit.js';

export const sprout = () => mound() + stem('M32 56 Q31 50 32 44') + leaf(32, 46, 13, -150, GL) + leaf(32, 44, 13, -30, GL);

export const RED = '#e8364b';

export const PURPLE = '#6b3fa0';

export const CAB = '#8fc9a0';

export const pod = (x, y, rot, s = 1) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    E(0, 0, 4, 10, '#7fcf4c', 0, 1.8) +
    FC(0, -5, 1.8, '#c6f09e') +
    FC(0, 0, 1.8, '#c6f09e') +
    FC(0, 5, 1.8, '#c6f09e') +
    L('M-3 -8 Q-4 0 -3 8', 1.1, GD) +
    `</g>`;

export const bell = (x, y, c, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    P('M-7 -4 C-8 8 -3 11 0 9 C3 11 8 8 7 -4 C4 -7 -4 -7 -7 -4Z', c, 2) +
    L('M0 -5 L0 8', 1.2, 'rgba(58,38,24,.35)') +
    HL(-3, -1, 1.6, 3.5, 10, 0.5) +
    R(-1.8, -10, 3.6, 5, 1.5, G, 1.6) +
    `</g>`;

export const aubergine = (x, y, rot, s = 1) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    E(0, 7, 6.5, 11, PURPLE, 0, 2) +
    HL(-2.5, 4, 1.6, 5, 0, 0.45) +
    P('M-6 -3 L0 -1 L6 -3 L3 -7 L0 -10 L-3 -7Z', G, 1.8) +
    `</g>`;

export const melonBody = (x, y, rx, ry) =>
    E(x, y, rx, ry, '#3f8f2e') +
    [-0.6, -0.2, 0.2, 0.6]
        .map(
            k =>
                `<path d="M${x + k * rx} ${y - ry * 0.95} Q${x + k * rx * 1.25} ${y} ${x + k * rx} ${y + ry * 0.95}" fill="none" stroke="#2b6b1f" stroke-width="2.4"/>`,
        )
        .join('') +
    E(x, y, rx, ry, 'none') +
    HL(x - rx * 0.45, y - ry * 0.45, rx * 0.25, ry * 0.18, -15, 0.35);

export const cabbageHead = (x, y, r) =>
    E(x, y + r * 0.25, r * 1.45, r * 0.95, CAB) +
    C(x, y, r, '#b9e3c3') +
    L(
        `M${x} ${y + r} L${x} ${y - r * 0.6} M${x} ${y + r * 0.3} Q${x - r * 0.6} ${y - r * 0.1} ${x - r * 0.75} ${y - r * 0.55} M${x} ${y + r * 0.3} Q${x + r * 0.6} ${y - r * 0.1} ${x + r * 0.75} ${y - r * 0.55}`,
        1.4,
        '#6aa07a',
    ) +
    HL(x - r * 0.4, y - r * 0.45, r * 0.25, r * 0.15, -20, 0.5);

export const lettuceHead = (x, y, r) =>
    E(x - r * 0.75, y + r * 0.3, r * 0.75, r * 0.55, G, -20) +
    E(x + r * 0.75, y + r * 0.3, r * 0.75, r * 0.55, G, 20) +
    C(x, y, r, '#9be06b') +
    C(x, y - r * 0.15, r * 0.6, '#c6f09e', 1.8) +
    L(`M${x} ${y + r} L${x} ${y + r * 0.3} M${x - r * 0.5} ${y + r * 0.7} Q${x - r * 0.3} ${y + r * 0.3} ${x - r * 0.1} ${y}`, 1.2, GD);

Object.assign(youngExtra, {
    onion: () => mound() + leaf(32, 56, 24, -98, G, 0.12) + leaf(32, 56, 22, -82, GL, 0.12) + leaf(32, 56, 18, -115, G, 0.13),
    peas: () =>
        mound() +
        stem('M32 57 Q28 46 32 36 Q36 28 33 22', G, 2) +
        leaf(31, 46, 11, -160, GL, 0.45) +
        leaf(33, 38, 11, -20, G, 0.45) +
        C(33, 22, 3, '#fff', 1.6),
    lettuce: () =>
        mound() + leaf(32, 54, 13, -160, G, 0.55) + leaf(32, 54, 13, -20, G, 0.55) + leaf(32, 52, 12, -115, GL, 0.55) + leaf(32, 52, 12, -65, GL, 0.55),
    cabbage: () =>
        mound() +
        leaf(32, 54, 15, -165, CAB, 0.6) +
        leaf(32, 54, 15, -15, CAB, 0.6) +
        leaf(32, 52, 13, -110, '#b9e3c3', 0.6) +
        leaf(32, 52, 13, -70, '#b9e3c3', 0.6),
    watermelon: () => mound() + L('M34 50 Q44 42 50 48', 2, GD) + leaf(32, 54, 16, -160, G, 0.45) + leaf(32, 54, 16, -20, G, 0.45) + melonBody(44, 51, 5, 4),
    pepper: () =>
        mound() +
        leaf(32, 54, 16, -150, G, 0.36) +
        leaf(32, 54, 16, -30, G, 0.36) +
        leaf(32, 52, 17, -110, GL, 0.36) +
        leaf(32, 52, 17, -70, GL, 0.36) +
        C(25, 38, 3, '#fff', 1.6) +
        C(40, 38, 3, '#fff', 1.6),
    eggplant: () =>
        mound() +
        leaf(32, 54, 16, -150, G, 0.4) +
        leaf(32, 54, 16, -30, G, 0.4) +
        leaf(32, 52, 17, -112, GL, 0.4) +
        leaf(32, 52, 17, -68, GL, 0.4) +
        C(26, 37, 3.4, '#b58ad6', 1.6) +
        FC(26, 37, 1.2, '#ffd23f'),
});

Object.assign(readyExtra, {
    radish: () =>
        leaf(32, 42, 16, -128, G, 0.35) +
        leaf(32, 42, 18, -90, GL, 0.3) +
        leaf(32, 42, 16, -52, G, 0.35) +
        E(32, 47, 9.5, 8.5, RED) +
        HL(28, 44, 2.6, 1.6) +
        mound(),
    lettuce: () => mound() + lettuceHead(32, 44, 12),
    onion: () =>
        mound() +
        leaf(32, 40, 24, -100, G, 0.12) +
        leaf(32, 40, 22, -80, GL, 0.12) +
        leaf(32, 40, 20, -118, G, 0.12) +
        P('M32 34 C42 38 45 50 32 56 C19 50 22 38 32 34Z', '#e6b25a') +
        L('M32 37 L32 54 M27 40 Q25 47 28 53 M37 40 Q39 47 36 53', 1.2, '#b9832f') +
        HL(27, 42, 2, 4, 15, 0.5),
    peas: () =>
        mound() +
        stem('M32 58 Q24 44 30 28 Q36 14 32 6', G, 2.2) +
        leaf(29, 46, 12, -165, GL, 0.45) +
        leaf(31, 34, 12, -15, G, 0.45) +
        leaf(32, 20, 10, -160, GL, 0.45) +
        pod(22, 36, -20) +
        pod(42, 28, 18) +
        pod(36, 46, 6) +
        C(30, 10, 3, '#fff', 1.6),
    pepper: () =>
        mound() +
        leaf(32, 56, 18, -165, G, 0.36) +
        leaf(32, 56, 18, -15, G, 0.36) +
        leaf(32, 50, 17, -120, GL, 0.36) +
        leaf(32, 50, 17, -60, GL, 0.36) +
        stem('M32 56 L32 26', G, 2.4) +
        bell(22, 38, '#e2412f') +
        bell(42, 34, '#f5a623') +
        bell(32, 46, '#e2412f'),
    eggplant: () =>
        mound() +
        leaf(32, 56, 18, -165, G, 0.4) +
        leaf(32, 56, 18, -15, G, 0.4) +
        leaf(32, 48, 16, -120, GL, 0.4) +
        leaf(32, 48, 16, -60, GL, 0.4) +
        stem('M32 56 L32 24', G, 2.4) +
        aubergine(22, 32, 18) +
        aubergine(42, 30, -18),
    cabbage: () => mound() + cabbageHead(32, 44, 12),
    watermelon: () =>
        leaf(12, 50, 14, -160, G, 0.45) + leaf(52, 50, 14, -20, G, 0.45) + L('M8 56 Q20 44 32 50 Q44 56 56 46', 2.2, GD) + mound() + melonBody(32, 46, 19, 12),
});

export const youngPlant = id => {
    if (youngExtra[id]) return youngExtra[id]();
    if (id === 'wheat') {
        return (
            mound() +
            leaf(32, 56, 26, -105, G, 0.14) +
            leaf(32, 56, 24, -75, G, 0.14) +
            leaf(31, 56, 20, -128, GL, 0.16) +
            leaf(33, 56, 20, -52, GL, 0.16) +
            leaf(32, 56, 28, -90, G, 0.13)
        );
    }
    if (id === 'corn')
        return (
            mound() +
            stem('M32 57 L32 24', G, 2.5) +
            leaf(32, 57, 28, -100, G, 0.15) +
            leaf(32, 57, 26, -78, GL, 0.15) +
            leaf(32, 50, 22, -135, G, 0.16) +
            leaf(32, 46, 22, -45, GL, 0.16)
        );
    if (id === 'pumpkin')
        return (
            mound() +
            L('M34 50 Q44 42 48 47', 2, GD) +
            leaf(32, 54, 18, -165, G, 0.45) +
            leaf(32, 54, 18, -15, G, 0.45) +
            leaf(32, 52, 15, -120, GL, 0.45) +
            leaf(32, 52, 15, -60, GL, 0.45) +
            C(42, 51, 5, '#a8d65c', 2)
        );
    const narrow = id === 'carrot' ? 0.22 : 0.36;
    let s =
        mound() + leaf(32, 54, 18, -150, G, narrow) + leaf(32, 54, 18, -30, G, narrow) + leaf(32, 54, 19, -112, GL, narrow) + leaf(32, 54, 19, -68, GL, narrow);
    if (id === 'carrot') s += E(32, 55, 5, 3, '#f08a24', 0, 2);
    if (id === 'tomato') s += C(25, 40, 4, '#a8d65c', 2) + C(39, 42, 4, '#a8d65c', 2);
    if (id === 'potato') s += C(32, 32, 3.5, '#b58ad6', 2) + FC(32, 32, 1.3, '#ffd23f');
    if (id === 'strawberry') s += C(24, 38, 3.8, '#fff', 2) + FC(24, 38, 1.4, '#ffd23f') + C(41, 40, 3.8, '#fff', 2) + FC(41, 40, 1.4, '#ffd23f');
    return s;
};

export const wheatHead = (x, top, n = 6, s = 1) => {
    let g = '';
    for (let k = n - 1; k >= 0; k--) {
        const y = top + 3 + k * 3.3 * s;
        g += E(x - 2.8 * s, y, 2.4 * s, 3.8 * s, '#f2c14e', -28, 1.7) + E(x + 2.8 * s, y, 2.4 * s, 3.8 * s, '#f2c14e', 28, 1.7);
    }
    return g + E(x, top, 2.2 * s, 3.8 * s, '#f7d374', 0, 1.7) + L(`M${x} ${top - 4 * s} L${x} ${top - 10 * s}`, 1.3, '#a8792b');
};

export const readyPlant = id => {
    if (readyExtra[id]) return readyExtra[id]();
    switch (id) {
        case 'wheat':
            return (
                mound() +
                leaf(32, 57, 18, -140, '#b8c95a', 0.16) +
                leaf(32, 57, 18, -40, '#b8c95a', 0.16) +
                stem('M24 57 Q22 40 20 30', '#d9a441', 2.2) +
                stem('M40 57 Q42 40 44 30', '#d9a441', 2.2) +
                stem('M32 57 L32 24', '#d9a441', 2.2) +
                wheatHead(20, 14) +
                wheatHead(44, 14) +
                wheatHead(32, 7)
            );
        case 'carrot':
            return (
                leaf(32, 30, 20, -122, G, 0.26) +
                leaf(32, 30, 22, -90, GL, 0.24) +
                leaf(32, 30, 20, -58, G, 0.26) +
                P('M22 32 Q32 25 42 32 Q39 45 33 56 Q32 58 31 56 Q25 45 22 32Z', '#f08a24') +
                L('M26 38 L30 38', 1.8) +
                L('M35 43 L38 43', 1.8) +
                HL(27, 36, 2, 5, 15, 0.45) +
                P('M12 56 Q32 44 52 56 Q32 61 12 56Z', '#5e3a1e', 2.2)
            );
        case 'tomato': {
            const tom = (x, y) =>
                C(x, y, 8.5, '#e2412f') + HL(x - 3, y - 3, 2.6, 1.7) + P(`M${x - 5} ${y - 7} L${x} ${y - 5} L${x + 5} ${y - 7} L${x} ${y - 9}Z`, G, 1.8);
            return (
                mound() +
                leaf(32, 56, 20, -165, G) +
                leaf(32, 56, 20, -15, G) +
                leaf(32, 52, 18, -120, GL) +
                leaf(32, 52, 18, -60, GL) +
                stem('M32 56 L32 22', G, 2.5) +
                tom(23, 36) +
                tom(42, 33) +
                tom(33, 46)
            );
        }
        case 'potato': {
            const pot = (x, y, r) => E(x, y, 9, 6.5, '#c99a5b', r) + FC(x - 3, y - 1, 1, O) + FC(x + 3, y + 1, 1, O) + HL(x - 3, y - 3, 3, 1.5, r);
            return (
                leaf(32, 42, 16, -165, G) +
                leaf(32, 42, 16, -15, G) +
                leaf(32, 40, 17, -125, GL) +
                leaf(32, 40, 17, -55, GL) +
                leaf(32, 40, 16, -90, G) +
                C(32, 22, 3, '#b58ad6', 2) +
                P('M10 54 Q32 42 54 54 Q32 60 10 54Z', '#5e3a1e', 2.2) +
                pot(22, 52, -10) +
                pot(42, 53, 12)
            );
        }
        case 'corn':
            return (
                mound() +
                stem('M32 58 L32 9', G, 3) +
                leaf(32, 52, 22, -155, G, 0.17) +
                leaf(32, 48, 22, -25, GL, 0.17) +
                leaf(32, 30, 17, -145, GL, 0.17) +
                leaf(32, 24, 16, -35, G, 0.17) +
                L('M32 10 L27 1 M32 10 L37 1 M32 10 L32 -1', 2, '#d9a441') +
                cob(40, 36, 18, 1) +
                cob(24, 40, -18, 0.9)
            );
        case 'pumpkin':
            return leaf(32, 46, 20, -165, G, 0.45) + leaf(32, 46, 20, -15, G, 0.45) + mound() + pumpkinBody(0);
        case 'strawberry': {
            const berry = (x, y) =>
                P(`M${x} ${y - 6} C${x + 8} ${y - 10} ${x + 10} ${y + 1} ${x} ${y + 10} C${x - 10} ${y + 1} ${x - 8} ${y - 10} ${x} ${y - 6}Z`, '#e8364b') +
                [
                    [-3, -1],
                    [3, -1],
                    [0, 3],
                    [-3, 4],
                    [3, 4],
                    [0, -3],
                ]
                    .map(([dx, dy]) => FE(x + dx, y + dy, 0.9, 1.4, '#ffe066'))
                    .join('') +
                P(`M${x - 5} ${y - 7} L${x} ${y - 5} L${x + 5} ${y - 7} L${x} ${y - 10}Z`, G, 1.8);
            return (
                mound() +
                leaf(32, 56, 18, -170, G) +
                leaf(32, 56, 18, -10, G) +
                leaf(32, 54, 19, -125, GL) +
                leaf(32, 54, 19, -55, GL) +
                leaf(32, 54, 18, -90, G) +
                berry(22, 42) +
                berry(42, 44) +
                berry(32, 30)
            );
        }
    }
    return '';
};

export const canopy = 'M14 36 C7 28 13 15 24 16 C26 6 40 5 43 14 C53 13 58 27 51 34 C53 43 41 46 32 42 C23 46 11 43 14 36Z';

export const treeBase = () =>
    SHADOW(32, 58, 14, 3) +
    P('M27 58 L29 36 L35 36 L37 58Z', '#8b5a2b') +
    L('M32 46 L37 40', 2.2) +
    P(canopy, G) +
    F('M20 22 C24 16 30 14 34 15', 'none') +
    HL(25, 20, 7, 3.5, -20, 0.3) +
    L('M38 36 Q42 34 44 30', 1.6, GD) +
    L('M20 30 Q22 33 26 33', 1.6, GD);

export const tree = (id, stage) => {
    if (stage === 0) return mound() + stem('M32 56 L32 34', '#8b5a2b', 2.5) + leaf(32, 42, 13, -150, G) + leaf(32, 38, 13, -30, G) + leaf(32, 35, 12, -95, GL);
    if (stage === 1) return treeBase();
    if (id === 'grape' || id === 'olive') return treeFruitExtra(id, treeBase());
    const col = { apple: '#e2412f', orange: '#f5a623', cherry: '#c2253f', peach: '#ffb07a' }[id] || '#e2412f';
    const fruit =
        id === 'cherry'
            ? (x, y) =>
                  L(`M${x - 2} ${y} Q${x} ${y - 6} ${x + 1} ${y - 7} M${x + 3} ${y + 1} Q${x + 2} ${y - 5} ${x + 1} ${y - 7}`, 1.3, '#6b3d1e') +
                  C(x - 2, y, 3, col, 1.6) +
                  C(x + 3, y + 1, 3, col, 1.6) +
                  FC(x - 3, y - 1, 0.9, '#fff', 0.7)
            : id === 'peach'
              ? (x, y) =>
                    C(x, y, 5, col, 2) +
                    FC(x + 1.5, y + 1, 2.6, '#ff8a6a', 0.6) +
                    L(`M${x} ${y - 4} Q${x - 1.5} ${y} ${x} ${y + 4}`, 1, '#e07a52') +
                    FC(x - 2, y - 2, 1.3, '#fff', 0.6)
              : (x, y) => C(x, y, 4.6, col, 2) + FC(x - 1.5, y - 1.5, 1.4, '#fff', 0.6);
    return treeBase() + fruit(22, 27) + fruit(41, 22) + fruit(31, 35) + fruit(46, 33) + fruit(31, 17) + fruit(18, 37);
};

export const cob = (x, y, rot, s) => {
    let k = '';
    for (let r = -7; r <= 7; r += 3.3) for (const c of [-2.6, 0, 2.6]) if (Math.abs(r) < 7 || c === 0) k += FC(c * s, r * s, 0.95 * s, '#e0a92a');
    return (
        `<g transform="translate(${x} ${y}) rotate(${rot})">` +
        E(0, 0, 5.5 * s, 11 * s, '#ffd23f', 0, 2) +
        k +
        FE(-2 * s, -5 * s, 1.2 * s, 3 * s, '#fff', 0.55) +
        P(`M${-6 * s} ${10 * s} Q${-9 * s} ${3 * s} ${-4.5 * s} ${-1 * s} Q${-2 * s} ${6 * s} 0 ${12 * s}Z`, G, 2) +
        P(`M${6 * s} ${10 * s} Q${9 * s} ${3 * s} ${4.5 * s} ${-1 * s} Q${2 * s} ${6 * s} 0 ${12 * s}Z`, GL, 2) +
        `</g>`
    );
};

export const pumpkinBody = dy =>
    `<g transform="translate(0 ${dy})">` +
    P('M32 30 C46 26 57 34 56 45 C55 56 44 60 32 58 C20 60 9 56 8 45 C7 34 18 26 32 30Z', '#f08a24') +
    L('M32 31 Q28 44 32 58', 2) +
    L('M21 31 Q14 44 20 58', 1.8) +
    L('M43 31 Q50 44 44 58', 1.8) +
    HL(17, 40, 3, 7, 10, 0.4) +
    P('M29 31 L30 21 L36 20 L35 31Z', '#7a8f2e') +
    L('M36 22 Q43 16 46 21', 2, GD) +
    `</g>`;

Object.assign(youngExtra, {
    beet: () => mound() + leaf(32, 54, 18, -150, GD, 0.42) + leaf(32, 54, 18, -30, GD, 0.42) + leaf(32, 52, 18, -105, G, 0.4) + leaf(32, 52, 18, -75, G, 0.4),
    cotton: () =>
        mound() + stem('M32 56 L32 34', '#8b5a2b', 2.2) + leaf(32, 48, 14, -160, G, 0.5) + leaf(32, 42, 14, -20, GL, 0.5) + leaf(32, 36, 12, -100, G, 0.5),
    lavender: () => mound() + [-130, -112, -90, -68, -50].map((a, k) => leaf(32, 56, 18 + (k % 2) * 4, a, '#9fb59a', 0.14)).join(''),
});

Object.assign(readyExtra, {
    beet: () =>
        leaf(32, 40, 20, -140, GD, 0.42) +
        leaf(32, 40, 22, -100, G, 0.4) +
        leaf(32, 40, 22, -80, G, 0.4) +
        leaf(32, 40, 20, -40, GD, 0.42) +
        mound() +
        E(32, 48, 9, 7, '#f3e9da') +
        HL(28, 46, 2, 3, 0, 0.6),
    cotton: () =>
        mound() +
        stem('M32 57 L32 26', '#8b5a2b', 2.4) +
        stem('M32 44 L20 34 M32 38 L44 28', '#8b5a2b', 2) +
        leaf(32, 52, 14, -160, G, 0.5) +
        leaf(32, 50, 14, -20, GL, 0.5) +
        [
            [20, 30],
            [44, 24],
            [32, 20],
            [26, 42],
            [40, 38],
        ]
            .map(([x, y]) => C(x, y, 5.5, '#fff', 2) + FE(x - 1.5, y - 1.5, 1.8, 1.2, '#e6edf1'))
            .join(''),
    lavender: () => mound() + [-28, -16, -6, 6, 16, 28].map((a, k) => lavSprig(32 + a * 0.5, 57, 34 + (k % 2) * 8, a * 0.7)).join(''),
});

Object.assign(youngExtra, {
    pineapple: () => mound() + [-150, -125, -100, -80, -55, -30].map((a, k) => leaf(32, 54, 16 + (k % 2) * 5, a, k % 2 ? G : GD, 0.2)).join(''),
    saffron: () => mound() + [-115, -100, -80, -65].map(a => leaf(32, 56, 20, a, G, 0.1)).join(''),
});

Object.assign(readyExtra, {
    pineapple: () =>
        mound() + [-160, -135, -45, -20].map(a => leaf(32, 54, 20, a, GD, 0.2)).join('') + `<g transform="translate(16 2) scale(.5)">${items.pineapple()}</g>`,
    saffron: () =>
        mound() +
        [-120, -60].map(a => leaf(32, 56, 18, a, G, 0.1)).join('') +
        `<g transform="translate(6 6) scale(.4)">${items.saffron()}</g>` +
        `<g transform="translate(30 10) scale(.42)">${items.saffron()}</g>`,
});

export const sunHead = (x, y, r) =>
    Array.from({ length: 12 }, (_, k) => `<g transform="rotate(${k * 30} ${x} ${y})">${E(x, y - r * 1.15, r * 0.32, r * 0.62, SUN, 0, 1.6)}</g>`).join('') +
    C(x, y, r * 0.75, '#7a4a2a', 2) +
    dots(
        [
            [x - r * 0.3, y - r * 0.2, '#5e3a1e'],
            [x + r * 0.25, y + r * 0.2, '#5e3a1e'],
            [x + r * 0.1, y - r * 0.35, '#5e3a1e'],
        ],
        r * 0.12,
    );

export const berry = (x, y, r, c = BLUE_B) =>
    C(x, y, r, c, 1.8) +
    FC(x - r * 0.35, y - r * 0.35, r * 0.28, '#fff', 0.55) +
    L(`M${x - 1.5} ${y - r + 1} L${x} ${y - r + 3} L${x + 1.5} ${y - r + 1}`, 1, '#2a2f6b');

export const garlicBulb = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    P('M0 -18 Q3 -10 10 -6 Q18 0 14 10 Q8 16 0 16 Q-8 16 -14 10 Q-18 0 -10 -6 Q-3 -10 0 -18Z', '#f7f3ea') +
    L('M0 -12 Q-4 2 0 15 M-7 -4 Q-11 6 -7 14 M7 -4 Q11 6 7 14', 1.3, '#c9b99a') +
    L('M-6 16 L-8 20 M0 16 L0 21 M6 16 L8 20', 1.2, '#c9b99a') +
    HL(-6, -2, 2, 5, 10, 0.6) +
    `</g>`;

export const zuke = (x, y, rot, s = 1) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    R(-22, -6, 44, 12, 6, '#3f8f2e') +
    L('M-16 -2 L14 -2 M-16 3 L12 3', 1.2, '#9be06b') +
    R(20, -3, 6, 6, 2, '#7fae4a', 1.6) +
    HL(-10, -3, 8, 1.2, 0, 0.4) +
    `</g>`;

export const ricePanicle = (x, y, rot) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})">` +
    L('M0 0 Q4 -18 14 -30', 2, '#b9a35a') +
    [0.3, 0.45, 0.6, 0.75, 0.9].map(k => E(4 + k * 10, -k * 30 + 2, 2, 3.4, '#f3e2b0', 30, 1.3)).join('') +
    `</g>`;

export const caneStalk = (x, h) =>
    R(x - 3.5, 58 - h, 7, h, 3, '#b9c95a') +
    [0.25, 0.5, 0.75].map(k => L(`M${x - 3.5} ${58 - h * k} L${x + 3.5} ${58 - h * k}`, 1.6, '#7a8f2e')).join('') +
    leaf(x, 58 - h + 4, 14, -130, G, 0.18) +
    leaf(x, 58 - h + 4, 14, -50, GL, 0.18);

export const grapeBunch = (x, y, s = 1, c = GRAPE) => {
    const pts = [
        [0, 0],
        [-6, 0],
        [6, 0],
        [-3, 6],
        [3, 6],
        [-9, -6],
        [0, -6],
        [9, -6],
        [0, 12],
    ];
    return (
        `<g transform="translate(${x} ${y}) scale(${s})">` +
        L('M0 -12 L0 -18', 2, '#6b3d1e') +
        leaf(0, -16, 12, -20, G, 0.45) +
        pts.map(([a, b]) => C(a, b, 4.2, c, 1.6) + FC(a - 1.3, b - 1.3, 1.1, '#fff', 0.5)).join('') +
        `</g>`
    );
};

export const olive = (x, y, rot, c = OLIVE) => E(x, y, 4.5, 6.5, c, rot, 1.8) + FE(x - 1.5, y - 2, 1.2, 2, '#fff', 0.45, rot);

export const teaLeaf = (x, y, ang, len = 16) => leaf(x, y, len, ang, '#4f9e3a', 0.4);

export const readyFrom = (id, sx = 0.55, dy = 0) =>
    mound() +
    leaf(32, 56, 16, -150, G, 0.35) +
    leaf(32, 56, 16, -30, GL, 0.35) +
    `<g transform="translate(${32 - 32 * sx} ${8 + dy}) scale(${sx})">${items[id]()}</g>`;

Object.assign(readyExtra, {
    sunflower: () => mound() + stem('M32 57 L32 22', G, 2.6) + leaf(32, 46, 14, -150, G) + leaf(32, 40, 14, -30, GL) + sunHead(32, 16, 11),
    garlic: () => mound() + [-110, -95, -80, -65].map(a => leaf(32, 50, 22, a, '#9bb36a', 0.12)).join('') + garlicBulb(32, 50, 0.55),
    zucchini: () =>
        mound() +
        leaf(32, 54, 18, -160, G, 0.5) +
        leaf(32, 54, 18, -20, G, 0.5) +
        leaf(32, 50, 16, -110, GL, 0.5) +
        zuke(26, 52, 10, 0.55) +
        zuke(40, 50, -20, 0.5) +
        C(32, 36, 4, '#ffd23f', 1.4),
    rice: () =>
        mound() +
        ricePanicle(26, 57, -20) +
        ricePanicle(32, 57, 0) +
        ricePanicle(38, 57, 18) +
        leaf(32, 56, 22, -120, G, 0.12) +
        leaf(32, 56, 22, -60, GL, 0.12),
    soy: () => readyFrom('soy', 0.6, 2),
    tea: () =>
        mound() +
        C(32, 38, 15, '#4f9e3a') +
        C(22, 44, 9, '#5aa04a') +
        C(42, 44, 9, '#5aa04a') +
        teaLeaf(32, 30, -90, 12) +
        teaLeaf(26, 34, -130, 10) +
        teaLeaf(38, 34, -50, 10),
    sugarcane: () => mound() + caneStalk(26, 40) + caneStalk(34, 48) + caneStalk(41, 36),
    blueberry: () =>
        mound() +
        C(32, 40, 15, '#3f8f2e') +
        C(22, 46, 8, '#4f9e3a') +
        C(42, 46, 8, '#4f9e3a') +
        berry(26, 38, 3.5) +
        berry(36, 34, 3.5) +
        berry(40, 44, 3.5) +
        berry(30, 46, 3.5) +
        berry(24, 48, 3),
});

Object.assign(youngExtra, {
    sunflower: () => mound() + stem('M32 56 L32 36', G, 2.2) + leaf(32, 44, 14, -150, G) + leaf(32, 40, 14, -30, GL),
    sugarcane: () => mound() + [-100, -85, -70].map(a => leaf(32, 56, 24, a, G, 0.12)).join(''),
    rice: () => mound() + [-115, -100, -80, -65].map(a => leaf(32, 56, 20, a, G, 0.1)).join(''),
});

export const treeFruitExtra = (id, base) =>
    id === 'grape'
        ? base + grapeBunch(22, 30, 0.45) + grapeBunch(40, 26, 0.45) + grapeBunch(31, 38, 0.45)
        : base + olive(22, 28, -10) + olive(40, 24, 10, '#3a2f3a') + olive(31, 36, 0) + olive(44, 34, -15) + olive(18, 38, 20, '#3a2f3a');

Object.assign(youngExtra, {
    hop: () => mound() + L('M32 56 L32 24', 2, GD) + leaf(32, 44, 12, -150, G) + leaf(32, 36, 12, -30, GL),
    cacao: () => mound() + R(29, 30, 6, 26, 2, '#8b5a2b', 1.6) + leaf(32, 32, 14, -150, GD) + leaf(32, 30, 14, -30, G),
    genepi: () => mound() + L('M32 56 L32 38', 2, '#7fae4a') + leaf(32, 46, 10, -150, '#9aa3ad') + leaf(32, 44, 10, -30, '#9aa3ad'),
});

Object.assign(readyExtra, {
    hop: () =>
        mound() +
        L('M24 58 L24 10 M40 58 L40 10', 2, '#a8693a') +
        L('M22 12 L42 12', 1.6, '#a8693a') +
        [
            [24, 24],
            [40, 30],
            [24, 40],
            [40, 46],
        ]
            .map(([x, y]) => E(x, y, 5, 7, '#b9d96a', 0, 1.6))
            .join('') +
        leaf(32, 34, 10, -60, G, 0.4),
    cacao: () =>
        mound() +
        R(29, 18, 6, 38, 2, '#8b5a2b', 1.6) +
        leaf(32, 20, 16, -150, GD) +
        leaf(32, 18, 16, -30, G) +
        E(26, 36, 5, 8, '#c8693a', 10, 1.6) +
        E(38, 40, 5, 8, '#e8a93a', -10, 1.6),
    genepi: () =>
        mound() +
        L('M32 56 L32 24 M32 40 L22 30 M32 36 L42 26', 2, '#7fae4a') +
        C(32, 22, 4, '#f2d16b', 1.4) +
        C(22, 28, 4, '#f2d16b', 1.4) +
        C(42, 24, 4, '#f2d16b', 1.4),
});

export const mushCap = (x, y, s = 1, c = '#c8693a') =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    R(-4, -2, 8, 14, 3, '#f7ecd8', 1.8) +
    P('M-14 0 Q-14 -14 0 -14 Q14 -14 14 0Z', c, 2) +
    FC(-6, -7, 2, '#fff', 0.8) +
    FC(5, -9, 1.6, '#fff', 0.8) +
    `</g>`;

export const flaxFlower = (x, y, r = 4) =>
    [0, 72, 144, 216, 288].map(a => `<g transform="rotate(${a} ${x} ${y})">${E(x, y - r, r * 0.6, r, '#6f9be8', 0, 1.2)}</g>`).join('') +
    FC(x, y, r * 0.45, '#ffd23f');

Object.assign(youngExtra, {
    flax: () => mound() + L('M28 56 L28 34 M32 56 L32 30 M36 56 L36 34', 2, G),
    mushroom: () => mound() + mushCap(32, 50, 0.45, '#e8c38c'),
    vanilla: () => mound() + L('M32 56 Q26 40 34 30', 2.4, '#7fae4a') + leaf(30, 42, 10, -160, G, 0.45) + leaf(33, 34, 10, -20, GL, 0.45),
});

Object.assign(readyExtra, {
    flax: () => mound() + L('M24 56 L26 22 M32 56 L32 16 M40 56 L38 22', 2, G) + flaxFlower(26, 20, 4.6) + flaxFlower(32, 14, 4.6) + flaxFlower(38, 20, 4.6),
    mushroom: () => mound() + mushCap(24, 48, 0.9) + mushCap(40, 46, 1.05) + mushCap(32, 54, 0.6, '#e8a93a'),
    vanilla: () =>
        mound() +
        L('M32 56 Q22 36 34 16', 2.6, '#7fae4a') +
        leaf(28, 40, 12, -160, G, 0.45) +
        leaf(32, 28, 12, -20, GL, 0.45) +
        L('M36 22 L42 44 M40 20 L46 40', 2.6, '#5e3a1e') +
        C(24, 22, 3.6, '#fff7d6', 1.2),
});
