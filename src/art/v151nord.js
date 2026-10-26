// 1.51 : le Grand Nord. Le seigle, l'airelle, le chicoutai, l'argousier, l'épicéa, le sorbier ;
// le poêle, la réserve de bois, le fendage, le froid ; Tuomas l'éleveur et Ingrid la boulangère.
import { C, E, F, FC, FE, HL, L, P, R, SHADOW, leaf, mound, stem, items, ui, people, youngExtra, readyExtra, BLD, KINDS } from './kit.js';
import { house2 } from './buildings2.js';
import { MAP_BG } from './maps.js';
import { bust, face } from './people.js';
import { fruitExtra, treeArt, canopy } from './plants.js';

const SNOW = '#f2f7fb';

// ======================= le seigle =======================
// un épi : des grains par paires le long de l'axe, de longues barbes qui filent vers le haut
const ryeEar = (x, y, ang, len = 15, c = '#d6b04e') => {
    let o = `<g transform="translate(${x} ${y}) rotate(${ang})">`;
    for (let i = 0; i < 6; i++) {
        const yy = (-i * len) / 6;
        o += E(-1.7, yy, 1.4, 2.5, c, -18, 0.9) + E(1.7, yy - 1.2, 1.4, 2.5, c, 18, 0.9);
    }
    o += L(`M-1.7 ${-len + 2} L-3 ${-len - 6} M0 ${-len} L0 ${-len - 8} M1.7 ${-len + 2} L3 ${-len - 6}`, 0.8, '#b8923a');
    o += L(`M-2.6 ${-len * 0.5} L-4.6 ${-len * 0.5 - 7} M2.6 ${-len * 0.5} L4.6 ${-len * 0.5 - 7}`, 0.7, '#b8923a');
    return o + `</g>`;
};
const ryeGrain = (x, y, rot, c = '#a88a5a') =>
    `<g transform="translate(${x} ${y}) rotate(${rot})">` + E(0, 0, 3.6, 1.7, c, 0, 1) + L('M-2.4 0 L2.4 0', 0.6, '#6e5530') + `</g>`;

// ======================= l'airelle rouge =======================
const berryRed = (x, y, r = 2.6, c = '#c8283a') =>
    C(x, y, r, c, 1.1) + FC(x - r * 0.35, y - r * 0.35, r * 0.28, '#fff', 0.7) + FC(x + r * 0.2, y + r * 0.2, r * 0.18, '#7a1420', 0.8);
// la petite feuille ovale, luisante, de l'airelle
const linLeaf = (x, y, a, c = '#2f6a3a') =>
    `<g transform="translate(${x} ${y}) rotate(${a})">` + E(0, -3.4, 2.4, 3.8, c, 0, 1.1) + L('M0 0 L0 -6.4', 0.6, 'rgba(255,255,255,.4)') + `</g>`;

// ======================= le chicoutai (la mûre arctique) =======================
// une baie faite de petits grains, ambre ; le calice vert dessus
const cloudBerry = (x, y, s = 1, ripe = 1) => {
    const base = ripe ? '#e9902a' : '#e4a46a',
        grain = ripe ? '#f6b64a' : '#f0c08a';
    let o = `<g transform="translate(${x} ${y}) scale(${s})">` + C(0, 0, 8.6, base, 2);
    [
        [-3.6, -3.4],
        [0.4, -4.6],
        [4, -2.6],
        [-5, 0.6],
        [-1.4, 0],
        [2.8, 1],
        [5.4, 2.6],
        [-3.4, 4],
        [0.6, 5],
        [3.4, 5],
    ].forEach(([a, b]) => (o += FC(a, b, 2.1, grain, 0.95) + FC(a - 0.6, b - 0.6, 0.6, '#fff', 0.55)));
    o += P('M-4 -8 L0 -5 L4 -8 L2 -11 L0 -8 L-2 -11Z', '#5f9a3a', 1.2);
    return o + `</g>`;
};
// la grande feuille plissée à lobes (cinq pointes)
const cloudLeaf = (x, y, s = 1, rot = 0, c = '#5fa04a') =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M0 0 Q-11 -2 -11 -9 Q-9 -10 -8 -14 Q-3 -13 -2 -19 Q0 -22 2 -19 Q3 -13 8 -14 Q9 -10 11 -9 Q11 -2 0 0Z', c, 1.5) +
    L('M0 0 L0 -17 M0 -3 L-8 -9 M0 -3 L8 -9', 0.8, 'rgba(40,70,30,.55)') +
    `</g>`;
const cloudFlower = (x, y) =>
    [0, 72, 144, 216, 288].map(a => `<g transform="translate(${x} ${y}) rotate(${a})">${E(0, -3.8, 2.4, 3.6, '#fffaf4', 0, 1)}</g>`).join('') +
    FC(x, y, 1.7, '#f2c43a');

// ======================= les plantes : produit, jeune pousse, plante mûre =======================
const PLANTS = {};
PLANTS.rye = [
    () =>
        SHADOW(32, 58, 22, 3) +
        P('M9 52 Q32 32 55 52 Q32 58 9 52Z', '#b89a6a', 2.2) +
        [
            [18, 49, 25],
            [25, 45, -30],
            [33, 43, 50],
            [41, 46, -20],
            [48, 50, 60],
            [22, 53, 80],
            [30, 50, -5],
            [38, 51, 40],
            [44, 54, -50],
            [28, 40, 10],
            [36, 39, -40],
            [14, 52, -30],
        ]
            .map(([x, y, r], k) => ryeGrain(x, y, r, k % 3 ? '#a88a5a' : '#8e7248'))
            .join('') +
        stem('M46 34 Q47 24 44 14', '#c8a64a', 1.4) +
        ryeEar(44, 16, 8, 12),
    () => mound() + [-112, -98, -84, -68, -52].map((a, k) => leaf(32, 56, k % 2 ? 22 : 26, a, k % 2 ? '#7fae6a' : '#6a9c5a', 0.08)).join(''),
    () =>
        mound() +
        stem('M22 56 Q21 38 17 24', '#c8a64a', 1.4) +
        stem('M29 56 Q29 36 28 18', '#c8a64a', 1.4) +
        stem('M36 56 Q37 36 40 20', '#c8a64a', 1.4) +
        stem('M43 56 Q45 40 49 28', '#c8a64a', 1.4) +
        leaf(32, 54, 18, -150, '#8aaa5a', 0.1) +
        leaf(32, 54, 18, -30, '#8aaa5a', 0.1) +
        ryeEar(17, 26, -14) +
        ryeEar(28, 20, -2) +
        ryeEar(40, 22, 10) +
        ryeEar(49, 30, 22, 13),
];
PLANTS.lingonberry = [
    // le produit : un tas de grosses airelles luisantes, avec quelques feuilles
    () => {
        let o = SHADOW(32, 58, 24, 3);
        [
            [28, 24],
            [36, 24],
            [24, 31],
            [32, 31],
            [40, 31],
            [20, 38],
            [28, 38],
            [36, 38],
            [44, 38],
            [15, 46],
            [23, 46],
            [32, 46],
            [41, 46],
            [49, 46],
        ].forEach(([x, y], k) => (o += berryRed(x, y, 4.8, k % 3 ? '#c8283a' : '#a81e30')));
        const lf = (x, y, a, sc = 1.5) => `<g transform="translate(${x} ${y}) scale(${sc})">${linLeaf(0, 0, a)}</g>`;
        return (
            o +
            lf(12, 54, -70) +
            lf(52, 54, 70) +
            lf(30, 18, -20, 1.3) +
            lf(38, 17, 25, 1.3) +
            berryRed(44, 54, 4.2, '#d9364b') +
            berryRed(20, 55, 4, '#a81e30')
        );
    },
    () =>
        mound() +
        stem('M32 56 L32 42', '#6b4a2a', 1.4) +
        linLeaf(32, 44, -50) +
        linLeaf(32, 44, 50) +
        linLeaf(32, 46, -10, '#3f8a4a') +
        linLeaf(32, 42, 10, '#3f8a4a'),
    // la plante mûre : un petit coussin dense de feuilles luisantes, couvert de baies
    () => {
        let o = mound() + P('M7 57 Q6 34 32 28 Q58 34 57 57Z', '#2f6a3a', 2.2) + HL(22, 38, 7, 3, -20, 0.25);
        [
            [14, 46, -70],
            [22, 40, -30],
            [32, 36, 0],
            [42, 40, 30],
            [50, 46, 70],
            [18, 52, -50],
            [30, 48, 10],
            [40, 50, -20],
            [48, 54, 40],
            [26, 56, -10],
        ].forEach(([x, y, a], k) => (o += linLeaf(x, y, a, k % 2 ? '#3f8a4a' : '#468f4e')));
        [
            [16, 44],
            [25, 38],
            [35, 34],
            [44, 40],
            [51, 48],
            [21, 50],
            [31, 44],
            [40, 48],
            [27, 54],
            [46, 54],
            [12, 53],
            [36, 54],
        ].forEach(([x, y], k) => (o += berryRed(x, y, 3.5, k % 3 ? '#c8283a' : '#d9364b')));
        return o;
    },
];
PLANTS.cloudberry = [
    () => SHADOW(32, 58, 22, 3) + cloudLeaf(46, 36, 1, 30, '#5f9a3a') + cloudBerry(24, 38, 1.35) + cloudBerry(42, 46, 1.15) + cloudBerry(30, 24, 0.9, 0),
    () => mound() + cloudLeaf(32, 54, 0.95, -22) + cloudLeaf(32, 54, 0.95, 22, '#6bb056') + cloudLeaf(32, 54, 0.8, 0, '#4f9a3a'),
    () =>
        mound() +
        stem('M22 56 Q20 44 18 36', '#6b8a3a', 1.4) +
        stem('M42 56 Q44 40 44 30', '#6b8a3a', 1.4) +
        stem('M32 56 L32 42', '#6b8a3a', 1.4) +
        cloudLeaf(18, 42, 1.05, -30) +
        cloudLeaf(32, 46, 1.1, 0, '#4f9a3a') +
        cloudLeaf(45, 38, 1.05, 25, '#6bb056') +
        cloudFlower(18, 28) +
        cloudBerry(44, 22, 0.8) +
        cloudBerry(30, 36, 0.62),
];

// ======================= les arbres : l'argousier, l'épicéa, le sorbier =======================
// l'argousier : un petit arbre gris-vert aux feuilles étroites, les branches chargées de baies orange
const buckBerry = (x, y, r = 2) => C(x, y, r, '#f08a1a', 0.9) + FC(x - r * 0.3, y - r * 0.3, r * 0.3, '#fff', 0.7);
const buckCluster = (x, y) => buckBerry(x, y) + buckBerry(x + 3.4, y + 1.4) + buckBerry(x - 3, y + 2) + buckBerry(x + 0.6, y + 4.4) + buckBerry(x + 4, y + 5);
const buckLeaves = (x, y, a) => `<g transform="translate(${x} ${y}) rotate(${a})">` + P('M0 0 Q2.4 -6 0 -12 Q-2.4 -6 0 0Z', '#9fbf9a', 0.9) + `</g>`;
function seaBuckthorn(stage) {
    const old = stage === 3;
    const can = old ? '#b6c08a' : '#8fb88c';
    let o = SHADOW(32, 58, 14, 3) + P('M27 58 L29 38 L35 38 L37 58Z', '#7a5a3a') + L('M32 48 L38 42 M31 44 L26 40', 2.2, '#7a5a3a');
    o += P(canopy, can, 2) + HL(25, 20, 7, 3.5, -20, 0.3);
    [
        [18, 26, -60],
        [26, 18, -10],
        [36, 16, 20],
        [44, 24, 60],
        [22, 34, -90],
        [34, 30, 0],
        [42, 34, 90],
        [30, 24, 40],
    ].forEach(([x, y, a]) => (o += buckLeaves(x, y, a)));
    if (stage >= 2) {
        o += buckCluster(19, 28) + buckCluster(31, 22) + buckCluster(41, 28) + buckCluster(26, 35) + buckCluster(37, 36);
        if (!old) o += buckCluster(45, 20) + buckCluster(15, 36);
    }
    return o;
}
// l'épicéa : des étages de branches sombres, de la neige dessus, des cônes qui pendent
const spruceTier = (cy, w, h, snow = true) => {
    const x0 = 32 - w,
        x1 = 32 + w,
        q = w / 2;
    // une pointe en haut, un bord en festons en bas (les branches qui retombent)
    const body = `M32 ${cy - h} Q${32 + w * 0.5} ${cy - h * 0.45} ${x1} ${cy + 1} Q${x1 - q * 0.5} ${cy + 4} ${32 + q} ${cy + 1.5} Q${32 + q * 0.5} ${cy + 4.5} 32 ${cy + 1.5} Q${32 - q * 0.5} ${cy + 4.5} ${32 - q} ${cy + 1.5} Q${x0 + q * 0.5} ${cy + 4} ${x0} ${cy + 1} Q${32 - w * 0.5} ${cy - h * 0.45} 32 ${cy - h}Z`;
    return (
        P(body, '#2f6a4a', 1.8) +
        F(`M32 ${cy - h + 2} Q${32 - w * 0.4} ${cy - h * 0.5} ${x0 + 3} ${cy - 1} Q${32 - q} ${cy - 3} 32 ${cy - h * 0.3}Z`, '#3f8a5e', 0.7) +
        (snow
            ? P(
                  `M32 ${cy - h} Q${32 + w * 0.3} ${cy - h * 0.7} ${32 + w * 0.42} ${cy - h * 0.38} Q${32 + q * 0.4} ${cy - h * 0.5} 32 ${cy - h * 0.46} Q${32 - q * 0.4} ${cy - h * 0.5} ${32 - w * 0.42} ${cy - h * 0.38} Q${32 - w * 0.3} ${cy - h * 0.7} 32 ${cy - h}Z`,
                  SNOW,
                  1.2,
              )
            : '')
    );
};
const cone = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    L('M0 -3 L0 0', 1.2, '#5e3a1e') +
    P('M0 0 Q3.6 1 3 7 Q0 11 -3 7 Q-3.6 1 0 0Z', '#9a6a3a', 1.2) +
    L('M-2.6 3 L2.6 3 M-2.4 5.6 L2.4 5.6', 0.7, '#6e4a26') +
    `</g>`;
function spruce(stage) {
    const s = stage === 1 ? 0.78 : 1;
    let o = SHADOW(32, 58, 13, 3) + R(29.5, 50, 5, 9, 1, '#6e4a2a', 1.6);
    o += `<g transform="translate(32 58) scale(${s}) translate(-32 -58)">`;
    o += spruceTier(54, 23, 20) + spruceTier(41, 18, 18) + spruceTier(29, 13.5, 16) + spruceTier(18, 9, 14, stage === 3);
    if (stage >= 2) o += cone(14, 54) + cone(50, 55) + cone(20, 42, 0.9) + cone(44, 43, 0.9) + cone(24, 31, 0.8) + cone(40, 31, 0.8);
    return o + `</g>`;
}
// le sorbier : des feuilles composées, des ombelles de baies rouge-orangé
const rowanBerries = (x, y, s = 1, c1 = '#e0452a', c2 = '#f0702a') => {
    let o = L(`M${x} ${y} L${x - 4 * s} ${y + 3 * s} M${x} ${y} L${x + 4 * s} ${y + 3 * s} M${x} ${y} L${x} ${y + 4 * s}`, 0.9, '#6b4a2a');
    [
        [-4, 3],
        [4, 3],
        [0, 4.4],
        [-2, 1],
        [2, 1.2],
        [-5.6, 5.4],
        [5.6, 5.4],
        [-2, 7],
        [2, 7],
        [0, 9.4],
    ].forEach(
        ([a, b], k) => (o += C(x + a * s, y + b * s, 1.7 * s, k % 2 ? c1 : c2, 0.8) + FC(x + a * s - 0.5 * s, y + b * s - 0.5 * s, 0.4 * s, '#fff', 0.7)),
    );
    return o;
};
const rowanLeaf = (x, y, a, c = '#5fa84a') =>
    `<g transform="translate(${x} ${y}) rotate(${a})">` +
    L('M0 0 L0 -12', 0.9, '#4f7a3a') +
    [-2, -5, -8, -11].map((yy, k) => E(-2.6, yy - 0.6, 1.2, 2.2, c, -50, 0.7) + E(2.6, yy - 0.6, 1.2, 2.2, c, 50, 0.7)).join('') +
    E(0, -13, 1.2, 2.2, c, 0, 0.7) +
    `</g>`;
function rowan(stage) {
    const old = stage === 3;
    const can = old ? '#c0b04a' : '#74b24e';
    let o = SHADOW(32, 58, 14, 3) + P('M27 58 L29 36 L35 36 L37 58Z', '#b5a89a', 2) + L('M30 52 Q31 46 30 40 M34 54 Q33 48 34 42', 1, '#8a7a6a');
    o += P(canopy, can, 2) + HL(25, 20, 7, 3.5, -20, 0.3);
    [
        [16, 30, -70],
        [24, 24, -30],
        [34, 20, 10],
        [43, 24, 40],
        [46, 32, 70],
        [30, 32, 0],
    ].forEach(([x, y, a], k) => (o += rowanLeaf(x, y, a, old ? '#b09a3a' : k % 2 ? '#5fa84a' : '#4f9a3a')));
    if (stage >= 2)
        o +=
            rowanBerries(19, 26, 0.9) +
            rowanBerries(32, 18, 1) +
            rowanBerries(44, 26, 0.9) +
            (old ? '' : rowanBerries(26, 34, 0.8) + rowanBerries(38, 34, 0.8));
    return o;
}
treeArt.seaBuckthorn = seaBuckthorn;
treeArt.spruce = spruce;
treeArt.rowan = rowan;
// le fruit posé sur l'arbre (pour les cartes et les vergers)
Object.assign(fruitExtra, {
    seaBuckthorn: (x, y) => buckCluster(x - 2, y - 3),
    spruce: (x, y) => cone(x, y - 3, 0.9),
    rowan: (x, y) => rowanBerries(x, y - 4, 0.7),
});
// les produits
items.seaBuckthorn = () =>
    SHADOW(32, 58, 22, 3) +
    L('M10 22 Q30 16 54 24', 2.4, '#7a5a3a') +
    buckLeaves(18, 22, -70) +
    buckLeaves(32, 19, -10) +
    buckLeaves(46, 22, 60) +
    buckCluster(18, 28) +
    buckCluster(32, 26) +
    buckCluster(46, 29) +
    buckCluster(26, 42) +
    buckCluster(40, 44);
items.spruce = () =>
    SHADOW(32, 58, 22, 3) +
    L('M10 30 Q30 26 56 34', 2.4, '#6e4a2a') +
    [14, 22, 30, 38, 46, 54]
        .map(
            (x, k) =>
                L(`M${x} ${30 + k * 0.8} l-3 -10 M${x} ${30 + k * 0.8} l3 10`, 2.2, k > 3 ? '#9ad06a' : '#3f8a5e') +
                FC(x - 3, 20 + k * 0.8, 2.2, '#b8e07a', 0.95) +
                FC(x + 3, 40 + k * 0.8, 2.2, '#b8e07a', 0.95),
        )
        .join('') +
    cone(24, 44, 1.5) +
    cone(40, 48, 1.3);
// un corymbe : des baies serrées en dôme aplati, tenues par un éventail de queues
const rowanCorymb = (x, y, s = 1) => {
    let o = L(`M${x} ${y - 9 * s} L${x - 12 * s} ${y + 1 * s} M${x} ${y - 9 * s} L${x + 12 * s} ${y + 1 * s} M${x} ${y - 9 * s} L${x} ${y}`, 1.4, '#6b4a2a');
    const rows = [5, 4, 3, 2, 1];
    const cols = ['#e8452a', '#f26a2a', '#d9362a'];
    let k = 0;
    rows.forEach((n, r) => {
        for (let i = 0; i < n; i++) {
            const bx = x + (i - (n - 1) / 2) * 6.6 * s,
                by = y + r * 5.6 * s;
            o += C(bx, by, 3.5 * s, cols[k++ % 3], 1.3) + FC(bx - 1 * s, by - 1.2 * s, 0.8 * s, '#fff', 0.7);
        }
    });
    return o;
};
const bigRowanLeaf = (x, y, a) => `<g transform="translate(${x} ${y}) scale(1.45)">${rowanLeaf(0, 0, a)}</g>`;
items.rowan = () => SHADOW(32, 58, 22, 3) + bigRowanLeaf(22, 57, -42) + bigRowanLeaf(42, 57, 42) + rowanCorymb(32, 18, 1.15);

// ======================= les cultures : l'enregistrement =======================
Object.entries(PLANTS).forEach(([id, [icon, young, ready]]) => {
    items[id] = icon;
    youngExtra[id] = young;
    readyExtra[id] = ready;
});
export const NORD_CROPS = Object.keys(PLANTS);
export const NORD_TREES = ['seaBuckthorn', 'spruce', 'rowan'];

// ======================= le poêle, le bois, le froid =======================
const IRON = '#3a3a42',
    IRON_L = '#55555e';
// le poêle en fonte : un corps, une porte vitrée, un tuyau qui monte ; allumé, la vitre brille et la fumée sort
function stove(lit) {
    const glow = lit ? '#ffb23a' : '#4a4a54';
    let o = SHADOW(32, 59, 18, 3);
    o += R(26, 6, 5, 18, 1.5, IRON_L, 1.8) + R(24, 6, 9, 3, 1, IRON, 1.4); // le tuyau
    if (lit) o += P('M30 3 Q26 -1 29 -5', 'none') + L('M28.5 3 Q25 -2 28 -6 Q31 -9 28 -13', 1.6, 'rgba(180,190,200,.7)');
    o += R(16, 22, 32, 8, 2, IRON_L, 2); // le dessus
    o += R(18, 28, 28, 25, 4, IRON, 2.2);
    o += R(21, 33, 22, 15, 3, lit ? '#7a3a14' : '#2a2a30', 1.6);
    o += R(23, 35, 18, 11, 2, glow, 0.6);
    if (lit) o += P('M32 45 Q27 41 30 37 Q31 40 33 38 Q37 41 35 45Z', '#fff2a0', 0.8) + P('M32 45 Q29 42 31 39 Q33 41 34 43Z', '#ff7a1a', 0.6);
    o += L('M31 35 L31 46 M23 40.5 L41 40.5', 1, 'rgba(0,0,0,.5)');
    o += R(18, 52, 5, 6, 1, IRON, 1.6) + R(41, 52, 5, 6, 1, IRON, 1.6);
    o += L('M20 31 L20 51', 1.2, 'rgba(255,255,255,.25)');
    return o;
}
// un anneau sans remplissage
const ring = (x, y, r, w = 0.9, c = '#8a6030') => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${c}" stroke-width="${w}"/>`;
// une bûche vue de bout : des cernes
const logEnd = (x, y, r = 5) => C(x, y, r, '#c89a5a', 1.6) + ring(x, y, r * 0.62) + ring(x, y, r * 0.28);
// la caisse à bûches
const woodBox = () =>
    SHADOW(32, 59, 22, 3) +
    R(8, 30, 48, 26, 3, '#a8693a', 2.2) +
    [
        [16, 30],
        [27, 30],
        [38, 30],
        [49, 30],
        [21.5, 22],
        [32.5, 22],
        [43.5, 22],
        [27, 15],
        [38, 15],
    ]
        .map(([x, y]) => logEnd(x, y, 5.4))
        .join('') +
    L('M8 40 L56 40 M8 48 L56 48', 1.2, '#7a4a22') +
    R(8, 52, 48, 4, 1, '#8a5a2e', 1.4);
// le billot et la hache (le fendage)
const chopBlock = () =>
    SHADOW(32, 59, 22, 3) +
    R(14, 36, 26, 20, 3, '#b0804a', 2.2) +
    E(27, 36, 13, 5, '#d6a868', 0, 2) +
    `<ellipse cx="27" cy="36" rx="8" ry="3" fill="none" stroke="#8a6030" stroke-width="0.9"/>` +
    L('M20 42 L20 54 M34 43 L34 55', 1, '#7a4a22') +
    `<g transform="translate(36 38) rotate(-35)">` +
    R(-1.6, -28, 3.2, 30, 1.4, '#a8693a', 1.8) +
    P('M-1.6 -28 L-10 -30 Q-12 -24 -9 -19 L-1.6 -21Z', '#aab4bc', 1.8) +
    `</g>` +
    // des copeaux et une bûche fendue
    P('M44 50 L52 46 L54 52 L46 56Z', '#c89a5a', 1.6) +
    P('M48 50 L56 50 L55 56 L47 56Z', '#d6a868', 1.4);
// la fenêtre : un flocon
const flake = (x, y, r, c = '#5aa0d6', w = 2) => {
    let d = '';
    for (let k = 0; k < 6; k++) {
        const a = (k * Math.PI) / 3,
            cx = Math.cos(a),
            cy = Math.sin(a);
        d += `M${x} ${y} L${x + r * cx} ${y + r * cy} M${x + r * 0.6 * cx} ${y + r * 0.6 * cy} l${-r * 0.22 * (cx * 0.5 + cy * 0.87)} ${-r * 0.22 * (cy * 0.5 - cx * 0.87)} M${x + r * 0.6 * cx} ${y + r * 0.6 * cy} l${-r * 0.22 * (cx * 0.5 - cy * 0.87)} ${-r * 0.22 * (cy * 0.5 + cx * 0.87)} `;
    }
    return L(d, w, c);
};
// le blizzard : un nuage gris, des rafales et des flocons
const blizzard = () =>
    P('M12 30 Q10 20 20 20 Q22 10 34 12 Q42 8 48 16 Q58 16 56 28 Q56 34 48 34 L18 34 Q12 34 12 30Z', '#aab6c4', 2.2) +
    FE(24, 18, 6, 2.4, '#fff', 0.5, -15) +
    L('M10 44 Q22 40 34 44 T58 42 M6 52 Q20 48 32 52 T56 50', 2.2, '#8fb0d0') +
    [
        [18, 40],
        [28, 46],
        [40, 40],
        [48, 48],
        [24, 56],
        [38, 56],
    ]
        .map(([x, y]) => flake(x, y, 3, '#7aa8d0', 1.1))
        .join('');
// l'aurore boréale : un ciel nuit, des rideaux verts et violets, des sapins noirs
const aurora = () =>
    R(4, 6, 56, 52, 8, '#1c2a4a', 2.2) +
    F('M10 44 Q14 22 22 14 Q20 30 26 46Z', '#5be0a0', 0.8) +
    F('M22 46 Q28 16 38 10 Q34 28 40 46Z', '#7af0b8', 0.75) +
    F('M38 46 Q44 22 52 18 Q50 32 54 46Z', '#9a7af0', 0.7) +
    [
        [14, 12],
        [30, 8],
        [48, 12],
        [54, 30],
        [8, 26],
    ]
        .map(([x, y]) => FC(x, y, 0.9, '#fff', 0.9))
        .join('') +
    P('M8 58 L8 50 L12 40 L16 50 L16 58Z', '#0e1626', 1) +
    P('M44 58 L46 44 L50 34 L54 44 L56 58Z', '#0e1626', 1) +
    P('M20 58 L22 52 L26 46 L30 52 L32 58Z', '#0e1626', 1);
// le traîneau : deux patins, un panier, des caisses
const sled = () =>
    SHADOW(32, 59, 24, 3) +
    L('M6 52 Q4 46 10 46 L52 46 Q58 46 56 40', 3.6, '#5e3a1e') +
    L('M6 52 Q4 46 10 46 L52 46 Q58 46 56 40', 1.6, '#c89a5a') +
    L('M10 52 L52 52', 3.2, '#5e3a1e') +
    L('M10 52 L52 52', 1.4, '#aab4bc') +
    R(14, 30, 36, 16, 3, '#a8693a', 2.2) +
    L('M14 38 L50 38 M26 30 L26 46 M38 30 L38 46', 1.2, '#7a4a22') +
    R(20, 22, 12, 9, 2, '#c8453a', 1.8) +
    R(34, 24, 11, 7, 2, '#e8c38c', 1.8) +
    L('M50 38 L58 30 M58 30 L58 22', 1.6, '#5e3a1e');
// le chaud : une flamme
const flame = () =>
    SHADOW(32, 58, 14, 3) +
    P('M32 6 Q42 20 44 32 Q46 50 32 56 Q18 50 20 34 Q20 24 26 18 Q26 26 30 28 Q28 16 32 6Z', '#f2802a', 2.2) +
    P('M32 28 Q38 36 38 44 Q38 52 32 54 Q26 52 26 44 Q26 36 32 28Z', '#ffd24a', 1.2) +
    FE(30, 46, 2.4, 4, '#fff', 0.6, 10);
// le grand Nord (choix du volet) : un sapin sous la neige et une étoile
const iconNord = () =>
    R(4, 4, 56, 56, 12, '#cfe3f2', 2.2) +
    FC(46, 16, 5, '#fff7d0', 0.95) +
    spruceTier(54, 19, 17) +
    spruceTier(42, 15, 15) +
    spruceTier(31, 11, 14) +
    P('M6 56 Q20 50 32 56 T58 54 L58 60 L6 60Z', SNOW, 1.6) +
    FC(14, 14, 1.2, '#fff') +
    FC(24, 24, 1, '#fff') +
    FC(52, 34, 1.1, '#fff');
Object.assign(ui, {
    noPoele: () => stove(false),
    noPoeleOn: () => stove(true),
    noBois: woodBox,
    noFendre: chopBlock,
    noFroid: () => R(4, 4, 56, 56, 12, '#e4f0fa', 2.2) + flake(32, 32, 20),
    noChaleur: flame,
    noBlizzard: blizzard,
    noAurore: aurora,
    noTraineau: sled,
    noNord: iconNord,
});

// ======================= Tuomas, l'éleveur de rennes =======================
people.tuomas = () =>
    bust(
        '#3a6aa8',
        // la tunique bleue à galon rouge et jaune, la ceinture
        P('M20 47 L32 58 L44 47', 'none') +
            L('M12 56 Q32 62 52 56', 2.6, '#c8453a') +
            L('M12 59 Q32 65 52 59', 1.6, '#e8c060') +
            P('M26 47 L32 54 L38 47', '#c8453a', 1.4),
    ) +
    face() +
    // la barbe poivre et sel
    P('M19 34 Q19 47 32 48 Q45 47 45 34 Q41 42 32 42 Q23 42 19 34Z', '#b8b2a6', 1.8) +
    P('M28.2 37 Q32 40.4 35.8 37 Q32 38.4 28.2 37Z', '#b5523f', 1.2) +
    // le bonnet de fourrure à rabats, avec une plume
    P('M14 30 C12 10 52 10 50 30 C48 22 42 18 32 18 C22 18 16 22 14 30Z', '#7a4a2a', 2.2) +
    P('M13 29 Q12 40 17 44 Q19 38 19 30Z', '#7a4a2a', 1.8) +
    P('M51 29 Q52 40 47 44 Q45 38 45 30Z', '#7a4a2a', 1.8) +
    P('M13 24 C14 16 50 16 51 24 C46 20 18 20 13 24Z', '#c89a6a', 1.6) +
    L('M16 22 Q20 20 24 22 M26 21 Q30 19 34 21 M36 21 Q40 19 44 21', 1.1, '#8a5a30') +
    L('M44 16 Q50 8 54 12', 1.6, '#a8a090') +
    P('M44 16 Q52 6 56 10 Q50 14 44 16Z', '#e8e2d6', 1);

// ======================= Ingrid, la boulangère =======================
people.ingrid = () =>
    bust(
        '#f4efe4',
        // le tablier à bretelles, brodé
        P('M20 47 L32 58 L44 47', 'none') +
            P('M22 66 L24 48 L40 48 L42 66Z', '#9a3a3a', 2) +
            L('M26 54 L38 54 M25 59 L39 59', 1.2, '#f2c43a') +
            P('M26 52 L22 47 M38 52 L42 47', 'none') +
            L('M24 48 L22 45 M40 48 L42 45', 1.8, '#9a3a3a'),
    ) +
    face() +
    // les tresses blondes enroulées en couronne
    P('M16 30 C14 14 50 14 48 30 C46 22 40 19 32 19 C24 19 18 22 16 30Z', '#e8c46a', 2.2) +
    P('M15 30 Q13 40 18 48 Q19 40 20 32Z', '#e8c46a', 1.8) +
    P('M49 30 Q51 40 46 48 Q45 40 44 32Z', '#e8c46a', 1.8) +
    L('M20 22 Q32 16 44 22 M18 26 Q32 20 46 26', 1.2, '#b8923a') +
    // un petit foulard rouge noué dans les cheveux
    P('M24 18 Q32 10 40 18 Q32 16 24 18Z', '#c8453a', 1.6) +
    FC(32, 14, 2.2, '#c8453a', 1);

// ======================= le chapitre 23 : les chantiers et la carte =======================
const LOG = '#a8693a',
    SNOWROOF = '#e8f0f6';
const NB = {
    northStove: {
        cfg: { w: 34, h: 18, wall: LOG, roof: SNOWROOF, sign: ['ui', 'noPoeleOn'] },
        st: { roof: 'chalet', tex: 'planks', snow: true, door: 'plain', wins: [14], chim: 'r', noFlowers: true },
    },
    northWood: {
        cfg: { w: 30, h: 16, wall: '#9a6a3e', roof: SNOWROOF, sign: ['ui', 'noBois'] },
        st: {
            roof: 'gable',
            tex: 'planks',
            snow: true,
            door: 'plain',
            wins: [],
            props: ({ x0, ruin }) =>
                ruin ? '' : [0, 1, 2].map(k => `<g transform="translate(${x0 - 14 + k * 5} 74) scale(.3)">${logEnd(16, 16, 14)}</g>`).join(''),
            noFlowers: true,
        },
    },
    northGreenhouse: {
        cfg: { w: 38, h: 20, wall: '#cfe6ee', roof: '#e0eef4', sign: ['item', 'cloudberry'] },
        st: { roof: 'hip', tex: 'planks', snow: true, door: 'arch', wins: [10, 28], noFlowers: true },
    },
};
for (const [id, d] of Object.entries(NB)) {
    BLD[id] = { ...d.cfg, st: d.st, kind: 'h2_' + id };
    KINDS['h2_' + id] = st => house2(BLD[id], st);
}

// la carte : un ciel qui vire à l'aurore, la neige, les sapins, un feu de poêle à la fenêtre
const mfir = (x, y, s) =>
    `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-1" y="0" width="2" height="4" fill="#5e3a1e"/>` +
    `<path d="M-8 0 L0 -12 L8 0Z M-6 -8 L0 -19 L6 -8Z M-4 -15 L0 -25 L4 -15Z" fill="#2f6a4a"/>` +
    `<path d="M-6 -3 L0 -11 L6 -3Z M-4 -11 L0 -18 L4 -11Z" fill="#f2f7fb" opacity=".85"/></g>`;
MAP_BG.nord = `<svg class="vmap-bg" viewBox="0 0 160 110" preserveAspectRatio="none" aria-hidden="true">
    <rect width="160" height="110" fill="#e4eef6"/>
    <rect width="160" height="40" fill="#2a3a66"/>
    <path d="M10 40 Q30 14 56 10 Q46 26 52 40Z" fill="#5be0a0" opacity=".55"/>
    <path d="M60 40 Q80 8 110 6 Q98 24 104 40Z" fill="#7af0b8" opacity=".5"/>
    <path d="M110 40 Q126 16 150 14 Q144 28 148 40Z" fill="#9a7af0" opacity=".5"/>
    <circle cx="20" cy="10" r="1" fill="#fff"/><circle cx="76" cy="6" r="1" fill="#fff"/><circle cx="134" cy="8" r="1" fill="#fff"/><circle cx="44" cy="26" r="0.8" fill="#fff"/><circle cx="100" cy="22" r="0.8" fill="#fff"/>
    <path d="M0 38 Q40 28 80 36 Q120 44 160 32 L160 110 L0 110Z" fill="#f2f7fb"/>
    <path d="M0 62 Q50 50 100 64 Q135 72 160 58 L160 110 L0 110Z" fill="#e6eff7"/>
    <path d="M0 86 Q50 76 100 88 Q135 94 160 82 L160 110 L0 110Z" fill="#d9e6f1"/>
    <path d="M70 110 Q74 92 84 80 M40 70 Q60 72 70 72 M96 74 Q110 66 124 58" stroke="#cfdfec" stroke-width="5" fill="none" stroke-linecap="round"/>
    <rect x="76" y="62" width="14" height="9" fill="#a8693a"/><path d="M74 62 L83 55 L92 62Z" fill="#f2f7fb"/><rect x="80" y="65" width="3" height="3" fill="#ffd24a"/>
    ${[
        [12, 52, 1],
        [28, 58, 0.8],
        [46, 70, 0.9],
        [58, 56, 0.7],
        [104, 58, 0.8],
        [122, 70, 1],
        [142, 54, 0.9],
        [18, 92, 1],
        [60, 96, 0.9],
        [112, 94, 1],
        [148, 92, 0.85],
    ]
        .map(([x, y, s]) => mfir(x, y, s))
        .join('')}
</svg>`;
