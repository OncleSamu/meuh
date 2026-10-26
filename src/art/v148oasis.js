// 1.48 : l'oasis. Le palmier dattier, le jujubier, l'oranger amer, le cumin, la coriandre, le sésame ;
// la citerne, la source, le chadouf, les galeries (foggara), l'ombre et la chaleur ; Idris le caravanier.
import { C, E, F, FC, FE, G, GD, GL, HL, L, P, R, SHADOW, leaf, mound, stem, items, ui, people, youngExtra, readyExtra } from './kit.js';
import { bust, face } from './people.js';
import { fruitExtra } from './plants.js';

// ======================= le palmier dattier =======================
// une palme pennée : une nervure courbée et des folioles en dents de scie
function palm(x, y, len, ang, c, droop = 0.35) {
    // une feuille longue et étroite qui s'arque ; les folioles sont des traits fins le long de la nervure
    const q = (t, off) => {
        const px = len * t,
            py = droop * len * t * t + off;
        return `${px.toFixed(1)} ${py.toFixed(1)}`;
    };
    const w = len * 0.16;
    const d = `M0 0 Q${q(0.35, -w * 1.1)} ${q(0.7, -w * 0.6)} T${q(1.05, 0)} Q${q(0.7, w * 0.9)} ${q(0.35, w * 0.9)} T0 0Z`;
    let ribs = '';
    for (let i = 1; i <= 5; i++) {
        const t = 0.15 + i * 0.15;
        const ww = w * 0.6 * (1 - t * 0.6);
        ribs += `M${q(t, 0)} L${q(t + 0.1, -ww)} M${q(t, 0)} L${q(t + 0.1, ww)} `;
    }
    return (
        `<g transform="translate(${x} ${y}) rotate(${ang})">` +
        P(d, c, 1.8) +
        L(ribs, 0.9, 'rgba(40,70,30,.55)') +
        L(`M0 0 Q${q(0.5, 0)} ${q(1, 0)}`, 1.1, 'rgba(58,38,24,.5)') +
        `</g>`
    );
}
// le stipe : écailles en losange
const dateTrunk = old =>
    P('M28.5 58 Q29 38 30.5 22 L34 22 Q35.5 38 36 58Z', old ? '#9a7a52' : '#a8834e', 2.2) +
    L('M29 54 L35.5 49 M29 47 L35 42 M29.5 40 L34.5 35 M30 33 L34.4 28 M30.3 26 L34 22', 1.1, '#6e5030') +
    L('M35.5 54 L29 49 M35 47 L29.2 42 M34.6 40 L29.6 35 M34.4 33 L30.1 28 M34 26 L30.4 22', 1.1, '#6e5030');
// une grappe de dattes qui pend
const dateBunch = (x, y, n, ripe) => {
    const cols = ripe ? ['#c8642a', '#a84a1e', '#d9822e'] : ['#e8b23a', '#d9a02a', '#f0c24a'];
    let o = L(`M${x} ${y} Q${x + 2} ${y + 6} ${x + 1} ${y + 12}`, 1.6, '#c89a3a');
    for (let k = 0; k < n; k++) {
        const dx = ((k % 3) - 1) * 3.2,
            dy = 5 + Math.floor(k / 3) * 3.4;
        o += E(x + dx + 1, y + dy, 1.5, 2.1, cols[k % 3], 0, 1);
    }
    return o;
};
function datePalm(stage) {
    const old = stage === 3;
    const c1 = old ? '#c9b84a' : '#7cc04a',
        c2 = old ? '#b0a03a' : '#4f9a3a';
    const top = [32, 22];
    let o = SHADOW(32, 58, 14, 3) + dateTrunk(old);
    // les palmes du fond, puis celles de devant
    o += [-150, -118, -62, -30].map((a, k) => palm(top[0], top[1], 24, a, k % 2 ? c1 : c2, a < -90 ? -0.35 : 0.35)).join('');
    if (stage >= 2) o += dateBunch(28, 24, old ? 3 : 6, true) + dateBunch(36, 24, old ? 3 : 6, old);
    o += [-176, -140, -90, -40, -4].map((a, k) => palm(top[0], top[1] + 1, k === 2 ? 16 : 26, a, k % 2 ? c2 : c1, a < -90 ? -0.55 : 0.55)).join('');
    o += C(32, 22, 2.6, '#8a7a3a', 1.4);
    return o;
}
// une datte (le produit)
const date = (x, y, s = 1, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M0 -12 Q-7 -11 -7 0 Q-7 11 0 12 Q7 11 7 0 Q7 -11 0 -12Z', '#9a4a1e', 2.2) +
    F('M2 -9 Q5 -2 3 9 Q6 2 4 -6Z', '#6e2e10', 0.6) +
    L('M-3 -6 Q-4 0 -2 6', 0.9, '#c8783a') +
    FE(-3, -5, 1.4, 3, '#fff', 0.45, -10) +
    P('M-2 -12 L2 -12 L1.5 -14.5 L-1.5 -14.5Z', '#e8c46a', 1.2) +
    `</g>`;

// ======================= le jujubier =======================
const jujube = (x, y, s = 1, rot = 0, ripe = 1) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    E(0, 0, 8, 10, ripe ? '#a83a22' : '#c8c84a', 0, 2.2) +
    (ripe ? F('M-8 2 Q-6 10 0 10 Q-4 6 -5 -2Z', '#d9a64a', 0.85) : '') +
    FE(-3, -4, 2, 3.4, '#fff', 0.5, -15) +
    L('M0 -10 L1 -13', 1.4, '#6b3d1e') +
    `</g>`;
// une branche de jujubier : petites feuilles luisantes et épines
const jujLeaf = (x, y, a) => leaf(x, y, 9, a, '#4f9a3a', 0.42);

// ======================= l'oranger amer =======================
const bigarade = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    C(0, 0, 13, '#e2681a', 2.4) +
    FE(5, 5, 8, 7, '#c8501a', 0.45) +
    [
        [-6, -4],
        [3, -7],
        [7, 2],
        [-2, 6],
        [-8, 4],
        [2, 0],
    ]
        .map(([a, b]) => FC(a, b, 0.9, '#a8400e', 0.7))
        .join('') +
    FE(-5, -6, 3.2, 2, '#fff', 0.5, -30) +
    F('M0 -13 Q4 -18 10 -16 Q6 -11 0 -13Z', '#3f7a2e') +
    `</g>`;
const bigaradeHalf = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    C(0, 0, 12, '#e2681a', 2.2) +
    C(0, 0, 9.5, '#f4c070', 1) +
    [0, 45, 90, 135].map(a => `<path d="M0 0 L${9 * Math.cos((a * Math.PI) / 180)} ${9 * Math.sin((a * Math.PI) / 180)}" stroke="#e89a3a" stroke-width="1"/>`).join('') +
    [0, 45, 90, 135].map(a => `<path d="M0 0 L${-9 * Math.cos((a * Math.PI) / 180)} ${-9 * Math.sin((a * Math.PI) / 180)}" stroke="#e89a3a" stroke-width="1"/>`).join('') +
    FC(0, 0, 1.4, '#fff8e0') +
    `</g>`;
// la fleur d'oranger : cinq pétales blancs, cœur jaune
const blossom = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    [0, 72, 144, 216, 288].map(a => `<g transform="rotate(${a})">${E(0, -4, 2.2, 3.6, '#fffaf0', 0, 1)}</g>`).join('') +
    FC(0, 0, 1.8, '#f2c43a') +
    `</g>`;

// ======================= le cumin =======================
const cuminSeed = (x, y, rot, c = '#b8925a') =>
    `<g transform="translate(${x} ${y}) rotate(${rot})">` + E(0, 0, 4.4, 1.7, c, 0, 1.1) + L('M-3 0 L3 0', 0.7, '#7a5a30') + `</g>`;
// une petite ombelle (cumin, coriandre)
const umbel = (x, y, r, c = '#fff', rays = 6) => {
    let o = '';
    for (let k = 0; k < rays; k++) {
        const a = ((-160 + (140 * k) / (rays - 1)) * Math.PI) / 180;
        const ex = x + r * Math.cos(a),
            ey = y + r * Math.sin(a) * 0.7;
        o += L(`M${x} ${y} L${ex} ${ey}`, 0.9, GD) + C(ex, ey, 1.6, c, 0.9);
    }
    return o;
};
// des feuilles en fils (cumin, aneth)
const thread = (x, y, len, a, c = GD) =>
    `<g transform="translate(${x} ${y}) rotate(${a})">` + L(`M0 0 Q${len * 0.5} -2 ${len} 1`, 1.2, c) + L(`M${len * 0.4} -1 L${len * 0.55} -4 M${len * 0.65} 0 L${len * 0.8} 3`, 0.9, c) + `</g>`;

// ======================= la coriandre =======================
// une feuille ronde et dentelée
const coriLeaf = (x, y, s = 1, c = '#4f9a3a') =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    P('M0 4 Q-7 4 -7 -2 Q-8 -6 -4 -6 Q-3 -10 0 -9 Q3 -10 4 -6 Q8 -6 7 -2 Q7 4 0 4Z', c, 1.4) +
    L('M0 4 L0 -6 M0 0 L-4 -4 M0 0 L4 -4', 0.7, GD) +
    `</g>`;
const coriSeed = (x, y) => C(x, y, 2.2, '#c8a46a', 1.1) + L(`M${x - 1.6} ${y} Q${x} ${y - 0.8} ${x + 1.6} ${y}`, 0.6, '#8a6a3a');

// ======================= le sésame =======================
const sesSeed = (x, y, rot, c = '#f2e2b8') => `<g transform="translate(${x} ${y}) rotate(${rot})">` + P('M0 -3 Q2.4 -1 0 3 Q-2.4 -1 0 -3Z', c, 0.9) + `</g>`;
const sesPod = (x, y, rot, s = 1, c = '#8aaa4a') =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M-3 6 Q-4 -4 0 -7 Q4 -4 3 6 Q0 8 -3 6Z', c, 1.4) +
    L('M0 -6 L0 6', 0.8, 'rgba(58,38,24,.5)') +
    `</g>`;
const sesFlower = (x, y, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})">` + P('M-3 -4 Q0 -6 3 -4 L3.5 3 Q0 5 -3.5 3Z', '#fbeef4', 1.2) + F('M-2 2 Q0 3.6 2 2 Q0 1 -2 2Z', '#d88aa8') + `</g>`;

// ======================= les plantes : produit, jeune pousse, plante mûre =======================
const PLANTS = {};
PLANTS.cumin = [
    () =>
        SHADOW(32, 58, 22, 3) +
        P('M10 52 Q32 30 54 52 Q32 58 10 52Z', '#c49a62', 2.2) +
        [
            [20, 48, 20],
            [28, 44, -30],
            [36, 45, 40],
            [44, 49, -15],
            [24, 52, 70],
            [32, 50, 0],
            [40, 52, 60],
            [30, 39, -60],
            [35, 40, 25],
            [16, 52, -40],
            [48, 53, 30],
        ]
            .map(([x, y, r], k) => cuminSeed(x, y, r, k % 3 ? '#b8925a' : '#a07a48'))
            .join('') +
        stem('M44 30 Q46 22 48 14', '#6b8a3a', 1.4) +
        umbel(48, 14, 7, '#f6e0ec', 5),
    () => mound() + [-150, -125, -100, -80, -55, -30].map((a, k) => thread(32, 56, k % 2 ? 16 : 20, a)).join(''),
    () =>
        mound() +
        [-140, -115, -90, -65, -40].map((a, k) => thread(32, 56, k % 2 ? 22 : 26, a, k % 2 ? GD : '#5f9a3a')).join('') +
        stem('M26 56 Q24 36 20 22', '#6b8a3a', 1.4) +
        stem('M32 56 Q32 32 32 16', '#6b8a3a', 1.4) +
        stem('M38 56 Q40 36 44 24', '#6b8a3a', 1.4) +
        umbel(20, 22, 7, '#f6e0ec') +
        umbel(32, 16, 8, '#fff') +
        umbel(44, 24, 7, '#f6e0ec'),
];
PLANTS.coriander = [
    () =>
        SHADOW(32, 58, 18, 3) +
        L('M26 56 L30 30 M32 56 L32 26 M38 56 L34 30 M29 56 L31 28 M35 56 L33 28', 1.8, '#5f8f3a') +
        coriLeaf(20, 26, 1.3) +
        coriLeaf(32, 18, 1.4, '#5fa83f') +
        coriLeaf(44, 24, 1.3) +
        coriLeaf(26, 14, 1.1, '#5fa83f') +
        coriLeaf(39, 13, 1.1) +
        coriLeaf(32, 32, 1.2, '#468a34') +
        R(26, 40, 12, 5, 2, '#e8c38c', 1.6) +
        L('M27 42.5 L37 42.5', 0.9, '#a8693a') +
        coriSeed(48, 50) +
        coriSeed(53, 54) +
        coriSeed(45, 55),
    () => mound() + coriLeaf(24, 50, 0.9) + coriLeaf(40, 50, 0.9, '#5fa83f') + coriLeaf(32, 46, 1, '#5fa83f') + L('M32 56 L32 50 M27 56 L25 52 M37 56 L39 52', 1.2, GD),
    () =>
        mound() +
        stem('M26 50 Q22 34 20 22', '#6b9a3a', 1.2) +
        stem('M38 50 Q42 32 44 18', '#6b9a3a', 1.2) +
        umbel(20, 22, 6, '#fff', 5) +
        umbel(44, 18, 6, '#fff', 5) +
        coriSeed(41, 26) +
        coriSeed(23, 30) +
        L('M24 56 L22 42 M32 56 L32 36 M40 56 L42 42 M28 56 L26 46 M36 56 L38 46', 1.4, '#5f8f3a') +
        coriLeaf(18, 48, 1.15) +
        coriLeaf(46, 48, 1.15, '#5fa83f') +
        coriLeaf(26, 42, 1.25, '#5fa83f') +
        coriLeaf(38, 42, 1.25) +
        coriLeaf(32, 34, 1.3, '#468a34') +
        coriLeaf(32, 50, 1.2, '#4f9a3a'),
];
PLANTS.sesame = [
    () =>
        SHADOW(32, 58, 22, 3) +
        P('M8 52 Q32 32 56 52 Q32 58 8 52Z', '#ecd8a8', 2.2) +
        [
            [16, 50, 30],
            [22, 46, -20],
            [28, 42, 60],
            [34, 41, -40],
            [40, 44, 10],
            [46, 48, -60],
            [20, 53, 80],
            [27, 49, -10],
            [33, 47, 40],
            [39, 50, -30],
            [45, 53, 20],
            [30, 54, -70],
            [36, 54, 50],
            [24, 39, 10],
            [31, 36, -30],
        ]
            .map(([x, y, r], k) => sesSeed(x, y, r, k % 4 ? '#f6e8c4' : '#e2c890'))
            .join('') +
        `<g transform="translate(44 18) rotate(30)">` +
        P('M-6 12 Q-8 -6 0 -14 Q8 -6 6 12 Q0 15 -6 12Z', '#a8864a', 2) +
        P('M-2 10 Q-3 -4 0 -10 Q3 -4 2 10Z', '#f6e8c4', 1) +
        `</g>`,
    () => mound() + stem('M32 56 L32 42', GD, 1.6) + leaf(32, 44, 14, -150, '#5fa83f', 0.4) + leaf(32, 44, 14, -30, '#5fa83f', 0.4) + leaf(32, 42, 10, -90, GL, 0.4),
    () =>
        mound() +
        stem('M32 56 L32 8', '#6b8a3a', 1.8) +
        leaf(32, 52, 16, -160, G, 0.36) +
        leaf(32, 52, 16, -20, G, 0.36) +
        leaf(32, 44, 13, -150, GD, 0.36) +
        leaf(32, 44, 13, -30, GD, 0.36) +
        sesPod(27, 38, -15) +
        sesPod(37, 37, 15) +
        sesPod(27, 29, -15, 0.9) +
        sesPod(37, 28, 15, 0.9) +
        sesFlower(27, 20, -20) +
        sesFlower(37, 19, 20) +
        sesFlower(32, 10),
];
// les arbres : le fruit (le produit), et le fruit posé sur l'arbre
items.date = () =>
    SHADOW(32, 58, 20, 3) +
    L('M14 14 Q30 18 34 30', 2.4, '#c89a3a') +
    date(22, 40, 1, -25) +
    date(36, 44, 1.05, 15) +
    date(46, 34, 0.95, 40) +
    date(30, 28, 0.9, -5);
items.jujube = () =>
    SHADOW(32, 58, 20, 3) +
    L('M12 20 Q30 14 50 18', 2, '#6b3d1e') +
    L('M22 17 L19 12 M40 15 L43 10', 1.2, '#6b3d1e') +
    jujLeaf(30, 16, -40) +
    jujLeaf(46, 18, -60) +
    jujLeaf(16, 19, -120) +
    jujube(22, 38, 1.1, -10) +
    jujube(40, 40, 1.15, 12) +
    jujube(31, 30, 0.9, 0, 0);
items.bitterOrange = () => SHADOW(32, 58, 22, 3) + bigaradeHalf(44, 42, 1) + bigarade(24, 36, 1.15) + blossom(46, 18, 1.4) + blossom(54, 26, 1);
const fruitOnTree = {
    jujube: (x, y) => jujube(x - 2, y, 0.32, -10) + jujube(x + 3, y + 2, 0.3, 10, (x + y) % 3 ? 1 : 0),
    bitterOrange: (x, y) => ((x + y) % 4 ? bigarade(x, y, 0.36) : blossom(x, y, 0.8)),
};

Object.assign(fruitExtra, fruitOnTree);

// ======================= l'eau =======================
const water = '#5aa9e6',
    waterD = '#3f86c6';
// la citerne : un réservoir de terre et de pierres ; trois tailles (1 : 100 L, 2 : 250 L, 3 : 400 L)
const cistern = size => {
    const w = [30, 40, 48][size - 1],
        h = [18, 22, 26][size - 1];
    const x = 32 - w / 2,
        y = 56 - h;
    return (
        SHADOW(32, 59, w / 2 + 4, 3) +
        P(`M${x} ${y} L${x} ${y + h - 3} Q32 ${y + h + 4} ${x + w} ${y + h - 3} L${x + w} ${y}Z`, '#d6a874', 2.4) +
        L(`M${x} ${y + h * 0.45} Q32 ${y + h * 0.45 + 5} ${x + w} ${y + h * 0.45}`, 1.2, '#a8784a') +
        [0.2, 0.5, 0.8].map(t => FE(x + w * t, y + h * 0.7, 3, 1.8, '#b88a5a', 0.7)).join('') +
        E(32, y, w / 2, 5, '#c8945e', 0, 2.4) +
        E(32, y + 0.5, w / 2 - 3, 3.4, water, 0, 1.2) +
        FE(26, y - 0.5, 4, 1, '#fff', 0.6) +
        (size === 3 ? L(`M${x + 4} ${y - 2} L${x + 4} ${y - 14} L${x + w - 4} ${y - 14} L${x + w - 4} ${y - 2}`, 2.2, '#8b5a2b') + P(`M${x} ${y - 13} L32 ${y - 22} L${x + w} ${y - 13}Z`, '#e8c38c', 2) : '')
    );
};
const iconCistern = () =>
    cistern(2) + C(50, 16, 9, '#fff', 2) + F('M50 9 Q55 16 53 19 Q50 23 47 19 Q45 16 50 9Z', water) + L('M50 9 Q55 16 53 19 Q50 23 47 19 Q45 16 50 9Z', 1.4);
// la source : de l'eau qui sort des rochers et remplit une vasque
const iconSource = () =>
    SHADOW(32, 58, 26, 3) +
    E(32, 50, 24, 7, '#c8945e', 0, 2.4) +
    E(32, 49, 19, 4.6, water, 0, 1.2) +
    FE(26, 48, 5, 1.2, '#fff', 0.55) +
    P('M18 46 Q14 32 22 26 Q28 20 34 24 Q44 20 48 30 Q52 38 46 46 Q32 42 18 46Z', '#b8a088', 2.4) +
    F('M22 30 Q26 26 30 28', 'none') +
    L('M24 34 Q28 30 32 32 M38 30 Q42 30 44 34', 1.2, '#8a7058') +
    P('M30 38 Q32 34 34 38 L35 48 Q32 50 29 48Z', water, 1.6) +
    FC(32, 41, 0.9, '#fff', 0.8) +
    L('M24 49 Q28 47 32 49 Q36 51 40 49', 1, '#fff') +
    leaf(14, 44, 10, -120, G) +
    leaf(50, 44, 10, -60, GD);
// le chadouf : un balancier sur un poteau fourchu ; un seau au bout, un contrepoids de l'autre côté
export const chadouf = (tilt = 0) => {
    // tilt : 0 seau en haut, 1 seau au fond du puits
    const a = -18 + tilt * 34; // angle du balancier
    const rad = (a * Math.PI) / 180;
    const px = 30,
        py = 22;
    const bx = px + 26 * Math.cos(rad),
        by = py + 26 * Math.sin(rad);
    const cx = px - 16 * Math.cos(rad),
        cy = py - 16 * Math.sin(rad);
    return (
        SHADOW(34, 59, 26, 3) +
        // le puits
        R(36, 42, 22, 14, 3, '#c8b098', 2.2) +
        E(47, 42, 11, 3, '#3f6a8a', 0, 2) +
        L('M36 49 L58 49 M43 42 L43 49 M51 42 L51 49 M39 49 L39 56 M47 49 L47 56 M55 49 L55 56', 1.2, '#8a7058') +
        // le poteau fourchu
        L(`M28 58 L30 26 L27 18 M30 26 L33 18`, 4.4) +
        L(`M28 58 L30 26 L27 18 M30 26 L33 18`, 2.2, '#a8793a') +
        // le balancier
        L(`M${cx} ${cy} L${bx} ${by}`, 4.2) +
        L(`M${cx} ${cy} L${bx} ${by}`, 2, '#c8945e') +
        C(px, py, 1.8, '#6e5030', 1) +
        // le contrepoids : une pierre attachée
        E(cx - 1, cy + 3, 5.6, 4.6, '#9a9a9a', 0, 2.2) +
        FE(cx - 3, cy + 1.6, 1.6, 1, '#fff', 0.45) +
        // la corde et le seau
        L(`M${bx} ${by} L${bx} ${Math.min(by + 14, 46)}`, 1.1) +
        P(`M${bx - 4} ${Math.min(by + 14, 46)} L${bx + 4} ${Math.min(by + 14, 46)} L${bx + 3} ${Math.min(by + 21, 53)} L${bx - 3} ${Math.min(by + 21, 53)}Z`, '#8b5a2b', 1.6) +
        (tilt < 0.5 ? E(bx, Math.min(by + 14, 46), 3.4, 1, water, 0, 0.8) : '')
    );
};
// les galeries souterraines (foggara) : une ligne de puits d'aération dans le sable
const iconFoggara = () =>
    SHADOW(32, 58, 28, 2.5) +
    P('M2 44 Q16 38 32 42 Q48 46 62 40 L62 60 L2 60Z', '#e8c690', 2.2) +
    L('M4 54 Q32 50 60 54', 3.6, waterD) +
    L('M4 54 Q32 50 60 54', 1.4, '#9ad0f4') +
    [12, 28, 44, 58]
        .map(
            (x, k) =>
                L(`M${x} ${41 + (k % 2)} L${x} 52`, 1.2, '#a8784a') + E(x, 40 + (k % 2), 4.4, 2.2, '#d6a874', 0, 1.8) + E(x, 39.6 + (k % 2), 2, 0.9, '#5e3a1e', 0, 0),
        )
        .join('') +
    C(18, 18, 6, '#ffd23f', 2) +
    FC(18, 18, 9, '#ffd23f', 0.25);
// le puits plus profond : le puits avec une flèche vers le bas
const iconDeep = () =>
    SHADOW(32, 59, 20, 3) +
    R(12, 30, 40, 26, 4, '#c8b098', 2.4) +
    E(32, 30, 20, 5, '#3f6a8a', 0, 2.2) +
    L('M12 42 L52 42 M22 30 L22 42 M42 30 L42 42 M17 42 L17 56 M32 42 L32 56 M47 42 L47 56', 1.4, '#8a7058') +
    P('M27 4 L37 4 L37 14 L43 14 L32 25 L21 14 L27 14Z', water, 2);
// l'ombre : une palme au-dessus d'une case à l'ombre
const iconShade = () =>
    E(32, 50, 26, 8, '#e8c690', 0, 2.2) +
    FE(32, 50, 20, 5.4, '#000', 0.22) +
    palm(30, 16, 26, -165, '#5f8f3a', -0.3) +
    palm(30, 16, 26, -15, '#7aa84a', 0.3) +
    palm(30, 17, 20, -95, '#5f8f3a', 0.1) +
    L('M30 16 L30 44', 3.2, '#a8834e') +
    L('M30 16 L30 44', 1.2, '#6e5030');
// la chaleur de midi : un soleil qui tremble au-dessus du sable
const iconNoon = () =>
    P('M2 50 Q18 42 32 46 Q46 50 62 44 L62 62 L2 62Z', '#e8c690', 2.2) +
    [0, 45, 90, 135, 180, 225, 270, 315].map(a => `<g transform="translate(32 24) rotate(${a})">${P('M14 -2 L22 0 L14 2Z', '#ffb02a', 1.4)}</g>`).join('') +
    C(32, 24, 11, '#ffd23f', 2.4) +
    FC(28, 20, 3, '#fff', 0.5) +
    L('M14 40 Q17 37 20 40 Q23 43 26 40 M38 40 Q41 37 44 40 Q47 43 50 40', 1.6, '#e8701a');
// l'oasis : la puce du volet Voyages
const iconOasis = () =>
    P('M2 46 Q20 34 36 42 Q50 34 62 44 L62 62 L2 62Z', '#e8c690', 2.2) +
    E(40, 52, 14, 4, water, 0, 1.8) +
    FE(36, 51, 4, 1, '#fff', 0.6) +
    L('M22 50 Q22 32 26 18', 3.6) +
    L('M22 50 Q22 32 26 18', 1.8, '#a8834e') +
    palm(26, 18, 18, -170, '#5f8f3a', -0.4) +
    palm(26, 18, 18, -10, '#7aa84a', 0.4) +
    palm(26, 18, 15, -130, '#7aa84a', -0.3) +
    palm(26, 18, 15, -50, '#5f8f3a', 0.3) +
    dateBunch(24, 19, 4, true);
// les voyages : une boussole
const iconVoyages = () =>
    SHADOW(32, 58, 20, 3) +
    C(32, 32, 24, '#e8c38c', 2.6) +
    C(32, 32, 19, '#fff7e0', 1.6) +
    L('M32 15 L32 19 M32 45 L32 49 M15 32 L19 32 M45 32 L49 32', 1.6) +
    P('M32 18 L37 32 L32 30 L27 32Z', '#e8364b', 1.6) +
    P('M32 46 L27 32 L32 34 L37 32Z', '#8a9aa8', 1.6) +
    C(32, 32, 2.4, '#ffd23f', 1.4) +
    HL(22, 20, 5, 2, -40, 0.45);
Object.assign(ui, {
    oaCiterne: iconCistern,
    oaCiterne1: () => cistern(1),
    oaCiterne2: () => cistern(2),
    oaCiterne3: () => cistern(3),
    oaSource: iconSource,
    oaChadouf: () => chadouf(0),
    oaChadoufBas: () => chadouf(1),
    oaFoggara: iconFoggara,
    oaPuits: iconDeep,
    oaOmbre: iconShade,
    oaMidi: iconNoon,
    oaOasis: iconOasis,
    oaVoyages: iconVoyages,
});

// ======================= Idris, le caravanier =======================
const DARK = '#c48a5c',
    DARK_SH = '#a8704a';
const darkFace = o => face(o).replaceAll('#f6cfa6', DARK).replaceAll('#e9b48a', DARK_SH).replaceAll('#d9967a', '#8a5a3a').replaceAll('#c98a62', '#8a5a3a');
people.idris = () =>
    bust(
        '#f2ead8',
        P('M24 46 L32 60 L40 46', 'none') + L('M32 50 L32 66', 1.4, '#c8b088') + P('M8 66 C9 56 14 50 22 47 L26 66Z', '#3a5a9a', 2) + P('M56 66 C55 56 50 50 42 47 L38 66Z', '#3a5a9a', 2),
    ).replaceAll('#f6cfa6', DARK) +
    darkFace() +
    // la barbe courte
    P('M20 34 Q20 46 32 47 Q44 46 44 34 Q40 42 32 42 Q24 42 20 34Z', '#3a2a22', 1.8) +
    P('M28.4 37 Q32 40 35.6 37 Q32 38.6 28.4 37Z', '#b5523f', 1.2) +
    // le chèche indigo, enroulé, avec un pan qui retombe
    P('M15 30 C13 12 51 12 49 30 C46 24 40 21 32 21 C24 21 18 24 15 30Z', '#2f4a8a', 2.2) +
    P('M16 25 C20 18 44 18 48 25 L48 21 C44 13 20 13 16 21Z', '#3f5fa8', 2) +
    L('M18 19 C26 16 38 16 46 19 M17 23 C26 20 38 20 47 23', 1.2, '#24386a') +
    P('M46 26 Q54 34 52 46 Q48 40 44 32Z', '#2f4a8a', 2);

// ======================= l'enregistrement =======================
Object.entries(PLANTS).forEach(([id, [icon, young, ready]]) => {
    items[id] = icon;
    youngExtra[id] = young;
    readyExtra[id] = ready;
});
export const OASIS_CROPS = Object.keys(PLANTS);
export const OASIS_TREES = ['date', 'jujube', 'bitterOrange'];
export { datePalm, fruitOnTree as OASIS_FRUIT, palm as palmFrond };
