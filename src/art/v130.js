// 1.30 : quatorze nouvelles cultures. Chacune a trois dessins : la récolte (items), la jeune pousse (youngExtra) et la plante mûre (readyExtra).
import { C, E, F, FC, FE, G, GD, GL, HL, L, P, R, SHADOW, leaf, mound, stem, items, youngExtra, readyExtra } from './kit.js';

const PLANTS = {};
const add = (id, icon, young, ready) => {
    PLANTS[id] = { icon, young, ready };
};

// une petite touffe de feuilles au sol
const tuft = (c1 = G, c2 = GL, y = 56, n = 3) =>
    leaf(32, y, 16, -150, c1, 0.4) + leaf(32, y, 16, -30, c1, 0.4) + (n > 2 ? leaf(32, y, 18, -90, c2, 0.4) : '');
const grassBlade = (x, y, h, lean, c = G) => stem(`M${x} ${y} Q${x + lean / 2} ${y - h / 2} ${x + lean} ${y - h}`, c, 1.4);

// ---------- le navet : boule blanche et violette, fanes vertes ----------
const turnip = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    P('M-1 8 Q0 14 1 8Z', '#e8dcc8', 1.6) +
    P('M-14 -4 Q-14 10 0 12 Q14 10 14 -4 Q14 -16 0 -16 Q-14 -16 -14 -4Z', '#f4efe6', 2.2) +
    F('M-14 -4 Q-14 -16 0 -16 Q14 -16 14 -4 Q0 -9 -14 -4Z', '#b05a98') +
    HL(-6, -2, 3.5, 6, -15, 0.55) +
    `</g>`;
add(
    'turnip',
    () =>
        SHADOW(32, 57, 22, 3) +
        leaf(28, 30, 22, -115, G, 0.4) +
        leaf(38, 30, 22, -65, GL, 0.4) +
        leaf(32, 28, 22, -90, G, 0.4) +
        turnip(32, 44, 1.25),
    () => mound() + tuft(G, GL, 54) + F('M26 56 Q32 50 38 56Z', '#f4efe6'),
    () => mound() + leaf(24, 44, 22, -125, G, 0.4) + leaf(40, 44, 22, -55, GL, 0.4) + leaf(32, 42, 26, -90, G, 0.4) + turnip(32, 50, 0.8),
);

// ---------- la fève : cosse verte bosselée, grosses graines ----------
const pod = (x, y, rot, s = 1) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M-22 0 Q-22 -7 -12 -7 L14 -7 Q24 -7 24 0 Q24 7 14 7 L-12 7 Q-22 7 -22 0Z', '#6cb04a', 2.2) +
    [-12, -2, 8].map(xx => E(xx, 0, 5, 3.2, '#a8d46a', 0, 1.2)).join('') +
    L('M-18 -6 L18 -6', 1, 'rgba(255,255,255,.45)') +
    `</g>`;
add(
    'favaBean',
    () => SHADOW(32, 57, 24, 3) + pod(30, 40, -20, 1.1) + pod(36, 50, 10, 0.9) + E(46, 30, 4, 3, '#a8d46a', 20, 1.6) + E(16, 52, 4, 3, '#a8d46a', -20, 1.6),
    () => mound() + stem('M30 56 L30 30', G, 1.8) + stem('M36 56 L36 36', G, 1.8) + leaf(30, 38, 10, -150, GL, 0.5) + leaf(36, 42, 10, -30, G, 0.5) + leaf(30, 30, 9, -100, G, 0.5),
    () =>
        mound() +
        stem('M30 56 L30 12', G, 2.2) +
        stem('M38 56 L38 18', G, 2.2) +
        leaf(30, 40, 12, -150, GL, 0.5) +
        leaf(38, 36, 12, -30, G, 0.5) +
        leaf(30, 24, 11, -145, G, 0.5) +
        leaf(38, 26, 11, -35, GL, 0.5) +
        pod(24, 46, 85, 0.5) +
        pod(44, 44, 95, 0.5) +
        FC(34, 14, 2.2, '#fffaf0') +
        FC(34, 14, 1, '#3a2618'),
);

// ---------- le panais : racine longue, crème ----------
const parsnip = (x, y, s = 1, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M-8 -22 Q-9 -4 -2 20 Q0 24 2 20 Q9 -4 8 -22 Q0 -26 -8 -22Z', '#f2e4c0', 2.2) +
    L('M-6 -8 L-1 -7 M-5 4 L0 5 M2 -2 L6 -3', 1, '#b89a68') +
    HL(-3, -14, 2, 6, -10, 0.6) +
    `</g>`;
add(
    'parsnip',
    () => SHADOW(32, 57, 22, 3) + leaf(26, 22, 18, -115, G, 0.35) + leaf(38, 22, 18, -65, GL, 0.35) + parsnip(26, 38, 1, 20) + parsnip(40, 40, 1.05, -12),
    () => mound() + leaf(32, 56, 16, -120, G, 0.3) + leaf(32, 56, 16, -60, GL, 0.3) + leaf(32, 56, 18, -90, G, 0.3),
    () => mound() + leaf(24, 48, 24, -125, G, 0.33) + leaf(40, 48, 24, -55, GL, 0.33) + leaf(32, 46, 26, -90, G, 0.33) + leaf(32, 46, 20, -108, GL, 0.3) + P('M28 54 Q32 48 36 54Z', '#f2e4c0', 1.6),
);

// ---------- l'échalote : bulbe allongé, cuivré ----------
const shallot = (x, y, s = 1, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M0 -20 Q-4 -12 -10 -4 Q-12 8 0 12 Q12 8 10 -4 Q4 -12 0 -20Z', '#c98458', 2.2) +
    L('M0 -18 Q-5 -2 -2 11 M0 -18 Q5 -2 3 11', 1, '#a35c3a') +
    L('M-1 12 L-3 16 M1 12 L3 16', 1.2) +
    HL(-4, -2, 2, 6, -10, 0.5) +
    `</g>`;
add(
    'shallot',
    () => SHADOW(32, 57, 22, 3) + shallot(24, 44, 1.05, -15) + shallot(40, 44, 1.05, 15) + shallot(32, 38, 1.1, 0),
    () => mound() + [26, 32, 38].map(x => stem(`M${x} 56 L${x} 34`, GD, 1.6)).join('') + stem('M32 56 L32 30', G, 1.6),
    () =>
        mound() +
        [22, 28, 34, 40].map((x, k) => stem(`M${x} 54 Q${x + (k % 2 ? 3 : -3)} 36 ${x + (k % 2 ? 5 : -4)} ${16 + k * 2}`, k % 2 ? G : GD, 2)).join('') +
        shallot(26, 54, 0.45, -10) +
        shallot(38, 54, 0.45, 10),
);

// ---------- le brocoli : petits arbres verts sur un tronc clair ----------
const brocc = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    P('M-5 2 L-3 16 L3 16 L5 2Z', '#a8d070', 2) +
    [[-10, -10, 8], [0, -14, 9], [10, -10, 8], [-5, -4, 8], [6, -4, 8]].map(([a, b, r]) => C(a, b, r, '#3f8a3a', 2)).join('') +
    [[-10, -10], [0, -14], [10, -10], [-5, -4], [6, -4]].map(([a, b]) => FC(a - 2, b - 2, 4, '#5fa850', 0.9) + FC(a + 2, b + 2, 1, '#2f6a2a')).join('') +
    `</g>`;
add(
    'broccoli',
    () => SHADOW(32, 57, 22, 3) + brocc(32, 40, 1.35),
    () => mound() + leaf(32, 56, 18, -150, '#5f9a6a', 0.4) + leaf(32, 56, 18, -30, '#5f9a6a', 0.4) + leaf(32, 54, 18, -90, '#6fae78', 0.4),
    () => mound() + leaf(20, 48, 22, -160, '#5f9a6a', 0.4) + leaf(44, 48, 22, -20, '#5f9a6a', 0.4) + leaf(22, 40, 18, -130, '#6fae78', 0.4) + leaf(42, 40, 18, -50, '#6fae78', 0.4) + brocc(32, 38, 0.8),
);

// ---------- le chou-fleur : pomme blanche en grappe, collerette ----------
const cauli = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    leaf(-6, 8, 18, -150, '#6fae78', 0.4) +
    leaf(6, 8, 18, -30, '#5f9a6a', 0.4) +
    [[-9, -6, 8], [0, -10, 9], [9, -6, 8], [-5, 1, 8], [6, 1, 8]].map(([a, b, r]) => C(a, b, r, '#f4efe0', 2)).join('') +
    [[-9, -6], [0, -10], [9, -6], [-5, 1], [6, 1]].map(([a, b]) => FC(a - 2, b - 2, 3, '#fffdf4') + FC(a + 3, b + 2, 1.2, '#d8cfae')).join('') +
    `</g>`;
add(
    'cauliflower',
    () => SHADOW(32, 57, 22, 3) + cauli(32, 42, 1.35),
    () => mound() + leaf(32, 56, 18, -150, '#6fae78', 0.4) + leaf(32, 56, 18, -30, '#6fae78', 0.4) + leaf(32, 54, 18, -90, '#8fc890', 0.4),
    () => mound() + leaf(20, 48, 22, -160, '#6fae78', 0.4) + leaf(44, 48, 22, -20, '#6fae78', 0.4) + cauli(32, 44, 0.8) + leaf(32, 38, 14, -90, '#8fc890', 0.4),
);

// ---------- l'avoine : épi lâche aux grains pendants ----------
const oatSpike = (x, y, h, lean = 0) => {
    let o = stem(`M${x} ${y} Q${x + lean / 2} ${y - h / 2} ${x + lean} ${y - h}`, '#c8a54a', 1.5);
    for (let k = 0; k < 4; k++) {
        const t = 0.5 + k * 0.14;
        const px = x + lean * t,
            py = y - h * t;
        o += L(`M${px} ${py} Q${px - 4} ${py + 4} ${px - 5} ${py + 8}`, 0.9, '#b8903a') + E(px - 5, py + 11, 1.8, 3.4, '#e6cf7a', -12, 1.2);
        o += L(`M${px} ${py} Q${px + 4} ${py + 4} ${px + 5} ${py + 8}`, 0.9, '#b8903a') + E(px + 5, py + 11, 1.8, 3.4, '#ecd88a', 12, 1.2);
    }
    return o;
};
add(
    'oat',
    () => SHADOW(32, 57, 20, 3) + oatSpike(24, 56, 40, -2) + oatSpike(32, 56, 46, 2) + oatSpike(40, 56, 40, 3),
    () => mound() + [24, 28, 32, 36, 40].map((x, k) => grassBlade(x, 56, 24 - (k % 2) * 4, (k - 2) * 3)).join(''),
    () => mound() + oatSpike(22, 56, 34, -3) + oatSpike(32, 56, 42, 0) + oatSpike(42, 56, 36, 4) + leaf(28, 56, 14, -110, G, 0.2) + leaf(38, 56, 14, -70, GL, 0.2),
);

// ---------- le chanvre : feuille digitée ----------
const hempLeaf = (x, y, s = 1, rot = 0, c = '#4f9a3a') => {
    const blade = a => `<g transform="rotate(${a})">` + P('M0 0 Q-3 -8 0 -22 Q3 -8 0 0Z', c, 1.6) + L('M0 -2 L0 -18', 0.7, 'rgba(255,255,255,.45)') + `</g>`;
    return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` + [-75, -45, -22, 0, 22, 45, 75].map(a => blade(a * 0.8)).join('') + `</g>`;
};
add(
    'hemp',
    () => SHADOW(32, 57, 22, 3) + hempLeaf(32, 54, 1.4, 0) + hempLeaf(20, 52, 0.7, -35, '#6cb04a') + hempLeaf(44, 52, 0.7, 35, '#6cb04a'),
    () => mound() + stem('M32 56 L32 38', G, 1.6) + hempLeaf(32, 40, 0.7, 0),
    () =>
        mound() +
        stem('M32 56 L32 10', '#5f8a3a', 2.4) +
        hempLeaf(32, 24, 0.55, 0) +
        hempLeaf(22, 36, 0.62, -40, '#6cb04a') +
        hempLeaf(42, 36, 0.62, 40, '#6cb04a') +
        hempLeaf(24, 48, 0.6, -60) +
        hempLeaf(40, 48, 0.6, 60),
);

// ---------- la chicorée : rosette dentelée, fleur bleue ----------
const chicLeaf = (x, y, s, rot, c = '#5fa040') =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M0 0 Q-9 -4 -7 -14 L-11 -18 L-5 -20 L-6 -26 L0 -30 L6 -26 L5 -20 L11 -18 L7 -14 Q9 -4 0 0Z', c, 1.8) +
    L('M0 -2 L0 -26', 0.9, 'rgba(255,255,255,.5)') +
    `</g>`;
add(
    'chicory',
    () => SHADOW(32, 57, 22, 3) + chicLeaf(18, 52, 1, -60) + chicLeaf(46, 52, 1, 60) + chicLeaf(24, 52, 1.05, -30, '#6cb04a') + chicLeaf(40, 52, 1.05, 30, '#6cb04a') + chicLeaf(32, 52, 1.1, 0, '#7ec45a'),
    () => mound() + chicLeaf(32, 56, 0.55, -50) + chicLeaf(32, 56, 0.55, 50) + chicLeaf(32, 56, 0.6, 0, '#6cb04a'),
    () =>
        mound() +
        chicLeaf(22, 56, 0.7, -60) +
        chicLeaf(42, 56, 0.7, 60) +
        stem('M32 56 L32 14', '#6a8a3a', 1.8) +
        [20, 30, 40].map((y, k) => leaf(32, y + 8, 9, k % 2 ? -30 : -150, G, 0.5)).join('') +
        FC(32, 12, 5, '#8fb8f0') +
        [0, 60, 120, 180, 240, 300].map(a => FE(32 + 6 * Math.cos((a * Math.PI) / 180), 12 + 6 * Math.sin((a * Math.PI) / 180), 3.4, 1.8, '#a8c8f8', 1, a)).join('') +
        FC(32, 12, 2, '#f0d878'),
);

// ---------- le pois chiche : gousse enflée, billes beiges ----------
const chickpea = (x, y, r = 5) => C(x, y, r, '#e6c88a', 1.8) + P(`M${x - 1} ${y - r} L${x + 1.5} ${y - r - 2.4} L${x + 2} ${y - r + 0.5}Z`, '#d8b070', 1) + HL(x - 1.6, y - 1.6, 1.6, 1.2, -20, 0.6);
add(
    'chickpea',
    () => SHADOW(32, 57, 22, 3) + chickpea(22, 50, 7) + chickpea(34, 52, 7.5) + chickpea(45, 49, 6.5) + chickpea(28, 40, 7) + chickpea(40, 39, 7) + chickpea(33, 30, 6.5),
    () => mound() + stem('M32 56 L32 38', G, 1.6) + leaf(32, 46, 10, -150, GL, 0.5) + leaf(32, 46, 10, -30, G, 0.5) + leaf(32, 38, 9, -90, GL, 0.5),
    () =>
        mound() +
        stem('M32 56 L32 12', '#7aa04a', 2) +
        leaf(32, 44, 11, -150, GL, 0.5) +
        leaf(32, 40, 11, -30, G, 0.5) +
        leaf(32, 30, 10, -145, G, 0.5) +
        leaf(32, 26, 10, -35, GL, 0.5) +
        P('M22 36 Q18 30 24 28 Q30 30 28 38Z', '#9ec860', 1.6) +
        P('M40 30 Q36 24 42 22 Q48 24 46 32Z', '#9ec860', 1.6) +
        FC(25, 33, 1.4, '#e6c88a') +
        FC(43, 27, 1.4, '#e6c88a'),
);

// ---------- le butternut : poire orangée, goulot ----------
const butternut = (x, y, s = 1, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M-6 -22 Q-8 -12 -6 -6 Q-17 -2 -16 10 Q-14 22 0 22 Q14 22 16 10 Q17 -2 6 -6 Q8 -12 6 -22 Q0 -26 -6 -22Z', '#e8b068', 2.2) +
    L('M-4 -20 Q-3 0 -9 18 M4 -20 Q3 0 9 18', 1, '#c88a40') +
    P('M-2 -22 Q0 -30 4 -27', 'none', 1.6) +
    L('M0 -23 Q1 -28 5 -28', 2.4, '#7a5a2a') +
    HL(-9, 4, 2.5, 6, -10, 0.45) +
    `</g>`;
add(
    'butternut',
    () => SHADOW(32, 58, 24, 3) + butternut(32, 36, 1.2),
    () => mound() + stem('M16 56 Q24 44 36 50 Q46 56 52 46', GD, 1.6) + leaf(22, 50, 10, -120, GL, 0.5) + leaf(44, 52, 10, -60, G, 0.5),
    () =>
        mound() +
        L('M6 56 Q20 44 32 50 Q46 56 58 46', 2.2, GD) +
        leaf(14, 50, 14, -150, G, 0.5) +
        leaf(52, 48, 14, -30, GL, 0.5) +
        butternut(30, 46, 0.62, -10) +
        butternut(46, 50, 0.45, 20) +
        leaf(32, 36, 12, -90, GL, 0.5),
);

// ---------- la mûre : baies noires, feuille dentelée ----------
const blackberry = (x, y, s = 1, rot = 0) => {
    const B = [[-4, -4], [4, -4], [0, -7], [-6, 1], [0, 0], [6, 1], [-3, 6], [3, 6], [0, 9]];
    return (
        `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
        B.map(([a, b]) => C(a, b, 3.4, '#3a2a58', 2)).join('') +
        B.map(([a, b], k) => FC(a, b, 3.1, k % 2 ? '#4a3470' : '#5a3f86') + FC(a - 1, b - 1, 0.8, '#fff', 0.65)).join('') +
        P('M-4 -9 L-2 -12 L0 -10 L2 -12 L4 -9 Q0 -7 -4 -9Z', '#5fa040', 1.2) +
        `</g>`
    );
};
const thornCane = (d, c = '#7a4a3a') => stem(d, c, 1.6);
add(
    'blackberry',
    () => SHADOW(32, 57, 22, 3) + leaf(32, 34, 16, -90, '#5fa040', 0.5) + blackberry(22, 42, 1.2, -10) + blackberry(40, 44, 1.2, 10) + blackberry(31, 30, 1.25, 0),
    () => mound() + thornCane('M28 56 L26 32') + thornCane('M36 56 L40 36') + leaf(26, 44, 9, -140, '#5fa040', 0.5) + leaf(38, 46, 9, -40, G, 0.5),
    () =>
        mound() +
        thornCane('M24 56 Q20 34 26 12') +
        thornCane('M40 56 Q46 34 38 14') +
        leaf(24, 40, 12, -150, '#5fa040', 0.5) +
        leaf(40, 34, 12, -30, G, 0.5) +
        blackberry(26, 30, 0.8, 0) +
        blackberry(40, 24, 0.8, 0) +
        blackberry(34, 44, 0.75, 8) +
        C(32, 14, 2.6, '#fffaf0', 1.2),
);

// ---------- le cassis : grappe de baies bleu-noir ----------
const cassisBerry = (x, y, r = 4.5) => C(x, y, r, '#2a2040', 1.8) + FC(x - 1.4, y - 1.4, 1.2, '#fff', 0.6) + FC(x + r * 0.5, y - r * 0.2, 0.6, '#6a58a0');
const cluster = (x, y, s = 1, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    L('M0 -22 L0 -6', 1.6, '#6a8a3a') +
    [[-6, -4], [6, -2], [0, 4], [-7, 8], [7, 9], [0, 14]].map(([a, b]) => cassisBerry(a, b)).join('') +
    `</g>`;
add(
    'blackcurrant',
    () => SHADOW(32, 57, 22, 3) + leaf(30, 22, 14, -110, G, 0.5) + cluster(22, 36, 1.1, -10) + cluster(42, 38, 1.1, 10) + cluster(32, 30, 1.15, 0),
    () => mound() + stem('M30 56 L28 34', '#8a6a4a', 1.6) + stem('M36 56 L38 36', '#8a6a4a', 1.6) + leaf(28, 42, 9, -145, G, 0.5) + leaf(38, 42, 9, -35, GL, 0.5),
    () =>
        mound() +
        stem('M26 56 Q22 34 28 14', '#8a6a4a', 1.8) +
        stem('M40 56 Q44 34 38 14', '#8a6a4a', 1.8) +
        leaf(24, 38, 12, -150, G, 0.5) +
        leaf(42, 34, 12, -30, GL, 0.5) +
        leaf(32, 20, 11, -90, G, 0.5) +
        cluster(26, 36, 0.6, -5) +
        cluster(40, 32, 0.6, 5) +
        cluster(33, 46, 0.55, 0),
);

// ---------- l'endive : chicon blanc aux pointes jaunes ----------
const chicon = (x, y, s = 1, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M0 22 Q-12 16 -11 -2 Q-9 -16 0 -26 Q9 -16 11 -2 Q12 16 0 22Z', '#f6f0d0', 2.2) +
    P('M0 -26 Q-5 -16 -6 -4 Q-3 -14 0 -26Z', '#e8dc9a', 0.01) +
    L('M0 -24 Q-1 -4 0 20 M-6 -10 Q-8 4 -5 16 M6 -10 Q8 4 5 16', 1, '#c8bc7a') +
    F('M0 -26 Q-9 -16 -10 -6 Q-3 -12 0 -26Z', '#d8e07a') +
    F('M0 -26 Q9 -16 10 -6 Q3 -12 0 -26Z', '#c8d868') +
    HL(-4, -6, 2, 7, -8, 0.6) +
    `</g>`;
add(
    'endive',
    () => SHADOW(32, 58, 20, 3) + chicon(22, 38, 0.95, -12) + chicon(42, 38, 0.95, 12) + chicon(32, 34, 1.05, 0),
    () => mound() + leaf(32, 56, 18, -150, '#6fae78', 0.35) + leaf(32, 56, 18, -30, '#6fae78', 0.35) + leaf(32, 56, 20, -90, '#8fc890', 0.35),
    () => mound() + chicon(24, 52, 0.55, -12) + chicon(40, 52, 0.55, 12) + chicon(32, 46, 0.65, 0) + leaf(14, 54, 12, -160, '#6fae78', 0.4) + leaf(50, 54, 12, -20, '#6fae78', 0.4),
);

Object.entries(PLANTS).forEach(([id, p]) => {
    items[id] = p.icon;
    youngExtra[id] = p.young;
    readyExtra[id] = p.ready;
});

export const NEW_CROPS_130 = Object.keys(PLANTS);
