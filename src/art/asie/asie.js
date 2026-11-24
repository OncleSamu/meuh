// 1.171 : Les Terres d'Asie — 4 cultures en terrasses, 6 arbres du verger d'Asie, badiane étoilée,
// 2 miels, rucher des terrasses, icônes UI, décors, Mei & Kenji, 6 chantiers et la carte des Terres d'Asie.
import { C, E, F, FC, FE, HL, L, P, R, SHADOW, leaf, mound, stem, items, ui, people, youngExtra, readyExtra, BLD, KINDS } from '../kit.js';
import { house2 } from '../buildings2.js';
import { MAP_BG } from '../maps.js';
import { bust, face } from '../people.js';
import { fruitExtra, treeArt } from '../plants.js';

const BAMBOO = '#6fa843',
    BAMBOO_D = '#4a7a2c',
    BAMBOO_L = '#a8d474',
    SAKURA = '#f8b4c8',
    JADE = '#3c9a7c',
    WATER = '#56b4d3';

// ======================= 4 cultures en terrasses =======================
// 1. Racine de lotus : rhizome crème cloisonné + fleur rose sur l'eau
const lotusSlice = (x, y, r = 9) =>
    C(x, y, r, '#f4e6cf', 1.8) +
    C(x, y, r * 0.82, '#efe0c2', 0.8) +
    [0, 60, 120, 180, 240, 300].map(a => FC(x + Math.cos((a * Math.PI) / 180) * r * 0.48, y + Math.sin((a * Math.PI) / 180) * r * 0.48, r * 0.16, '#8a6a4a')).join('') +
    FC(x, y, r * 0.13, '#8a6a4a');
const lotusFlower = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    P('M0 2 Q-10 -2 -12 -10 Q-5 -8 0 0Z', '#f29ab4', 1.3) +
    P('M0 2 Q10 -2 12 -10 Q5 -8 0 0Z', '#f29ab4', 1.3) +
    P('M0 2 Q-7 -6 -6 -15 Q-1 -10 0 0Z', '#f8b8cc', 1.3) +
    P('M0 2 Q7 -6 6 -15 Q1 -10 0 0Z', '#f8b8cc', 1.3) +
    P('M0 2 Q-4 -8 0 -17 Q4 -8 0 2Z', '#ffd6e2', 1.3) +
    FC(0, -4, 2.2, '#f2c84a') +
    `</g>`;

// 2. Pousses de bambou : turions coniques à écailles vert-doré
const bambooTurion = (x, y, s = 1, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M-9 12 Q-8 -4 0 -18 Q8 -4 9 12 Q0 15 -9 12Z', '#d6c284', 1.8) +
    P('M-7 10 Q-5 -2 0 -16 Q5 -2 7 10Z', '#efe0a8', 0.9) +
    P('M-9 12 Q-4 2 0 7 Q4 2 9 12Z', '#8a6e3e', 1.3) +
    P('M-7 4 Q-2 -4 0 0 Q3 -4 7 4Z', '#789c46', 1.2) +
    L('M-4 -4 Q0 -8 4 -4', 1.1, '#5a7a32') +
    HL(-3, -2, 1.4, 5, -10, 0.45) +
    `</g>`;

// 3. Shiitake : chapeau brun chaud bombé, lamelles crème, pied court
const shiitakeCap = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    P('M-4 4 L-5 14 Q0 16 5 14 L4 4Z', '#ebdcb8', 1.6) +
    E(0, 3, 13, 4.5, '#d6c096', 0, 1.5) +
    P('M-14 3 Q-14 -11 0 -12 Q14 -11 14 3 Q0 6 -14 3Z', '#7a4a2a', 2) +
    F('M-11 -1 Q0 -10 11 -1 Q0 -4 -11 -1Z', '#9a643c', 0.65) +
    L('M-5 -6 L5 -2 M5 -6 L-5 -2', 1.1, '#e8d4ac') +
    HL(-5, -6, 3.2, 1.4, -18, 0.35) +
    `</g>`;

// 4. Pak choï : tiges blanches charnues en rosette et feuilles vert jade
const bokChoyArt = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    P('M-10 12 Q-16 0 -14 -12 Q-6 -14 -4 -2 L-4 12Z', '#3c8f4a', 1.7) +
    P('M10 12 Q16 0 14 -12 Q6 -14 4 -2 L4 12Z', '#3c8f4a', 1.7) +
    P('M-5 10 Q-9 -4 -7 -16 Q0 -19 7 -16 Q9 -4 5 10Z', '#4ca858', 1.8) +
    P('M-8 14 Q-11 6 -7 -2 Q-2 2 -2 14Z', '#f6f2e2', 1.6) +
    P('M8 14 Q11 6 7 -2 Q2 2 2 14Z', '#f6f2e2', 1.6) +
    P('M-4 15 Q-5 5 0 -2 Q5 5 4 15 Q0 17 -4 15Z', '#fffdf4', 1.8) +
    L('M0 13 L0 -12 M-6 10 L-10 -8 M6 10 L10 -8', 0.9, '#b8d8a0') +
    `</g>`;

const PLANTS = {
    lotus: [
        () =>
            SHADOW(32, 57, 23, 3) +
            E(24, 42, 13, 8, '#e8d4b0', -15, 2) +
            E(42, 46, 11, 7, '#dec8a0', 12, 2) +
            lotusSlice(34, 34, 11) +
            lotusFlower(46, 28, 0.7),
        () =>
            mound() +
            E(32, 50, 18, 5, '#4c9c56', 0, 1.6) +
            stem('M28 52 Q26 42 22 36', '#4a8a3a', 1.5) +
            E(22, 36, 9, 4, '#5eb466', -10, 1.5),
        () =>
            mound() +
            E(32, 52, 22, 6, '#3f8f4c', 0, 1.8) +
            stem('M24 52 Q22 36 22 26', '#4a8a3a', 1.5) +
            stem('M40 52 Q42 38 44 30', '#4a8a3a', 1.5) +
            E(22, 42, 10, 4.5, '#58ad62', -8, 1.5) +
            E(44, 44, 9, 4, '#58ad62', 10, 1.5) +
            lotusFlower(24, 28, 1.1) +
            lotusFlower(43, 32, 0.85),
    ],
    bambooShoot: [
        () => SHADOW(32, 57, 21, 3) + bambooTurion(23, 38, 1.05, -10) + bambooTurion(41, 41, 0.95, 12),
        () =>
            mound() +
            R(28, 30, 5, 24, 2, BAMBOO, 1.6) +
            L('M28 38 L33 38 M28 46 L33 46', 1.2, BAMBOO_D) +
            leaf(33, 34, 14, -35, BAMBOO_L, 0.14),
        () =>
            mound() +
            R(18, 16, 6, 38, 2, BAMBOO, 1.8) +
            R(30, 10, 6, 44, 2, BAMBOO_L, 1.8) +
            R(42, 22, 6, 32, 2, BAMBOO, 1.8) +
            L('M18 26 L24 26 M18 38 L24 38 M30 22 L36 22 M30 34 L36 34 M30 46 L36 46 M42 32 L48 32', 1.4, BAMBOO_D) +
            leaf(24, 20, 14, -40, BAMBOO_L, 0.14) +
            leaf(36, 16, 16, -25, BAMBOO, 0.14) +
            leaf(42, 24, 13, -150, BAMBOO_L, 0.14) +
            bambooTurion(26, 46, 0.55, -8),
    ],
    shiitake: [
        () => SHADOW(32, 57, 23, 3) + shiitakeCap(23, 38, 0.95) + shiitakeCap(42, 41, 0.88) + shiitakeCap(33, 27, 0.82),
        () => mound() + R(12, 46, 40, 8, 4, '#6e4c2e', 1.8) + shiitakeCap(26, 43, 0.55) + shiitakeCap(39, 44, 0.5),
        () =>
            mound() +
            R(10, 44, 44, 10, 4, '#6e4c2e', 2) +
            shiitakeCap(18, 38, 0.72) +
            shiitakeCap(32, 33, 0.85) +
            shiitakeCap(46, 39, 0.72),
    ],
    bokChoy: [
        () => SHADOW(32, 57, 20, 3) + bokChoyArt(32, 36, 1.35),
        () => mound() + bokChoyArt(32, 44, 0.8),
        () => mound() + bokChoyArt(22, 43, 0.85) + bokChoyArt(42, 43, 0.85) + bokChoyArt(32, 38, 0.95),
    ],
};
Object.entries(PLANTS).forEach(([id, [icon, young, ready]]) => {
    items[id] = icon;
    youngExtra[id] = young;
    readyExtra[id] = ready;
});

// ======================= 6 arbres du verger d'Asie =======================
const yuzuFruit = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    C(0, 0, 9, '#f2c82e', 1.8) +
    F('M-7 2 Q0 9 7 2 Q0 6 -7 2Z', '#d8a618', 0.65) +
    FC(-3, -3, 1.2, '#fff7b0', 0.85) +
    FC(3, -1, 0.9, '#d49e14', 0.7) +
    FC(-1, 4, 0.9, '#d49e14', 0.7) +
    P('M0 -9 Q4 -15 9 -12 Q5 -7 0 -9Z', '#4c9438', 1.2) +
    `</g>`;
const umeFruit = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    C(0, 0, 8.2, '#b8d85a', 1.8) +
    FE(3, -2, 3.8, 4.5, '#e87872', 0.65, 18) +
    L('M0 -7 Q-2 0 0 7', 0.9, '#7a9c32') +
    HL(-3, -3, 2, 1.1, -20, 0.6) +
    `</g>`;
const kumquatFruit = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    E(0, 0, 6.2, 8.8, '#f0821e', 0, 1.7) +
    HL(-2.2, -3.2, 1.6, 2.8, -12, 0.55) +
    P('M0 -9 Q5 -13 8 -9 Q4 -6 0 -9Z', '#4a9036', 1.1) +
    `</g>`;
const nashiFruit = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    C(0, 1, 9.5, '#e6c864', 1.8) +
    F('M-7 4 Q0 11 7 4 Q0 8 -7 4Z', '#c9a444', 0.6) +
    FC(-3, -2, 0.8, '#9a7a30', 0.5) +
    FC(3, 2, 0.8, '#9a7a30', 0.5) +
    FC(1, -4, 0.8, '#9a7a30', 0.5) +
    L('M0 -8 L2 -14', 1.6, '#6e4a2a') +
    HL(-3.5, -3, 2.4, 1.3, -20, 0.6) +
    `</g>`;
const longanFruit = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    C(0, 0, 6.4, '#c89e64', 1.5) +
    F('M-5 2 Q0 7 5 2 Q0 5 -5 2Z', '#9e7642', 0.6) +
    HL(-2, -2, 1.8, 1, -20, 0.5) +
    `</g>`;
const ginkgoLeaf = (x, y, s = 1, rot = 0, c = '#e8c438') =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    L('M0 8 L0 0', 1.4, '#8a7228') +
    P('M0 0 Q-11 -4 -10 -12 Q-4 -14 -1 -10 L0 -12 L1 -10 Q4 -14 10 -12 Q11 -4 0 0Z', c, 1.4) +
    `</g>`;
const ginkgoNut = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    E(0, 0, 5.8, 7.6, '#f2e0b4', 0, 1.6) +
    L('M0 -7 L0 7', 0.9, '#c8ae7a') +
    HL(-2, -2.5, 1.4, 2.2, -10, 0.55) +
    `</g>`;

const asieCanopy = (cx, cy, r, c, cd) =>
    C(cx - r * 0.45, cy + r * 0.15, r * 0.62, cd, 1.8) +
    C(cx + r * 0.45, cy + r * 0.15, r * 0.62, cd, 1.8) +
    C(cx, cy - r * 0.15, r * 0.72, c, 1.8) +
    C(cx - r * 0.35, cy + r * 0.05, r * 0.56, c, 1.6) +
    C(cx + r * 0.35, cy + r * 0.05, r * 0.56, c, 1.6) +
    HL(cx - r * 0.25, cy - r * 0.35, r * 0.28, r * 0.14, -18, 0.35);

function makeAsieTree(col, colD, fruitFn, trunk = '#6e4c2e') {
    return (st, old) => {
        const sc = st === 0 ? 0.58 : st === 1 ? 0.8 : 1;
        const c = old ? '#c9a84a' : col,
            cd = old ? '#9e7e2a' : colD;
        let o = SHADOW(32, 59, 18 * sc, 3 * sc) + `<g transform="translate(32 58) scale(${sc}) translate(-32 -58)">`;
        o += P('M28 58 Q29 44 29 36 L35 36 Q35 44 36 58Z', trunk, 1.8);
        o += asieCanopy(32, 24, 18, c, cd);
        if (st >= 2 && !old) o += fruitFn(22, 22, 0.48) + fruitFn(36, 18, 0.48) + fruitFn(41, 29, 0.48) + fruitFn(26, 31, 0.46);
        return o + '</g>';
    };
}

treeArt.yuzu = makeAsieTree('#3f8e48', '#2a6632', yuzuFruit);
treeArt.ume = makeAsieTree('#e894b2', '#c86e8e', umeFruit); // floraison rose prune ume !
treeArt.kumquat = makeAsieTree('#469648', '#2d6e32', kumquatFruit);
treeArt.nashi = makeAsieTree('#5ca44e', '#3e7a34', nashiFruit);
treeArt.longan = makeAsieTree('#3c8444', '#265c2e', longanFruit);
treeArt.ginkgo = makeAsieTree('#e6bf36', '#c2981e', (x, y, s) => ginkgoLeaf(x, y, s * 0.9, 10, '#f4d44c'));

Object.assign(fruitExtra, {
    yuzu: (x, y) => yuzuFruit(x, y - 2, 0.5),
    ume: (x, y) => umeFruit(x, y - 2, 0.5),
    kumquat: (x, y) => kumquatFruit(x, y - 2, 0.52),
    nashi: (x, y) => nashiFruit(x, y - 2, 0.48),
    longan: (x, y) => longanFruit(x, y - 2, 0.52),
    ginkgo: (x, y) => ginkgoNut(x, y - 2, 0.55),
});

items.yuzu = () => SHADOW(32, 57, 21, 3) + yuzuFruit(24, 38, 1.25) + yuzuFruit(42, 41, 1.08);
items.ume = () => SHADOW(32, 57, 21, 3) + umeFruit(23, 39, 1.2) + umeFruit(41, 36, 1.15) + umeFruit(33, 47, 1.05);
items.kumquat = () => SHADOW(32, 57, 20, 3) + kumquatFruit(21, 41, 1.25) + kumquatFruit(34, 35, 1.3) + kumquatFruit(45, 42, 1.2);
items.nashi = () => SHADOW(32, 57, 21, 3) + nashiFruit(25, 40, 1.22) + nashiFruit(42, 38, 1.1);
items.longan = () =>
    SHADOW(32, 57, 22, 3) +
    L('M32 14 L22 30 M32 14 L32 32 M32 14 L42 30 M32 14 L26 42 M32 14 L39 42', 1.6, '#6e4a2a') +
    longanFruit(21, 34, 1.2) +
    longanFruit(33, 30, 1.2) +
    longanFruit(43, 35, 1.2) +
    longanFruit(27, 45, 1.25) +
    longanFruit(39, 45, 1.2);
items.ginkgo = () => SHADOW(32, 57, 22, 3) + ginkgoLeaf(24, 34, 1.6, -24) + ginkgoLeaf(42, 36, 1.5, 22) + ginkgoNut(27, 46, 1.15) + ginkgoNut(39, 47, 1.15);

// ======================= Badiane étoilée (épice rare de la jonque) =======================
items.starAnise = () => {
    let o = SHADOW(32, 57, 21, 3);
    for (let k = 0; k < 8; k++) {
        const a = k * 45;
        o += `<g transform="translate(32 34) rotate(${a})">${P('M-4 -4 Q0 -23 4 -4 Q0 -1 -4 -4Z', '#7a3e22', 1.6)}${FE(0, -11, 1.8, 3.6, '#c87e44', 0.85)}</g>`;
    }
    return o + C(32, 34, 4.5, '#5a2a14', 1.6) + FC(31, 33, 1.3, '#c88a50', 0.8);
};

// ======================= 2 miels d'Asie & le rucher des terrasses =======================
function honeyPot(honey, light, cloth, check, flower) {
    return (
        SHADOW(32, 59, 16, 3) +
        P('M17 24 Q16 21 19 21 L45 21 Q48 21 47 24 L48 52 Q48 58 42 58 L22 58 Q16 58 16 52Z', honey) +
        F('M19 27 L45 27 L45 31 L19 31Z', light, 0.55) +
        HL(21, 34, 1.8, 9, 0, 0.55) +
        P('M13 18 Q14 10 32 10 Q50 10 51 18 Q52 23 46 22 L18 22 Q12 23 13 18Z', cloth) +
        L('M20 12 L20 21 M28 11 L28 21 M36 11 L36 21 M44 12 L44 21', 1.2, check) +
        L('M15 16 Q32 12 49 16', 1.2, check) +
        L('M15 22 Q32 25 49 22', 1.8, '#8b5a2b') +
        R(21, 35, 22, 17, 4, '#fbecc9', 2) +
        flower
    );
}
items.honey_yuzu = () => honeyPot('#f0c948', '#fff098', '#68b468', '#3c7a3c', yuzuFruit(32, 44, 0.55));
items.honey_lotus = () => honeyPot('#ebb0b8', '#ffe0e6', '#f28ca8', '#c05070', lotusFlower(32, 47, 0.65));

ui.apiaryAsie = () =>
    SHADOW(32, 59, 24, 3) +
    L('M14 56 L14 42 M50 56 L50 42', 2.4, BAMBOO_D) +
    R(10, 40, 44, 5, 2, BAMBOO, 1.8) +
    R(16, 26, 13, 14, 3, '#e8c47a', 1.8) +
    R(35, 26, 13, 14, 3, '#e8c47a', 1.8) +
    L('M16 31 L29 31 M16 36 L29 36 M35 31 L48 31 M35 36 L48 36', 1.1, '#a87c3a') +
    P('M8 26 Q32 12 56 26 Q52 22 46 22 L18 22 Q12 22 8 26Z', '#b83c34', 2) +
    FC(22, 34, 1.6, '#3a2618') +
    FC(41, 34, 1.6, '#3a2618') +
    E(32, 13, 2.2, 1.5, '#ffd23f', 0, 1) +
    E(48, 17, 2.2, 1.5, '#ffd23f', 0, 1);

// ======================= Icônes UI des Terres d'Asie =======================
const canalArt = on =>
    SHADOW(32, 58, 20, 3) +
    R(14, 14, 8, 38, 3, BAMBOO, 1.8) +
    R(42, 14, 8, 38, 3, BAMBOO, 1.8) +
    R(10, 22, 44, 12, 4, BAMBOO_L, 2) +
    L('M22 22 L22 34 M42 22 L42 34', 1.4, BAMBOO_D) +
    (on
        ? P('M14 28 Q32 24 50 28 L50 32 Q32 30 14 32Z', WATER, 1.2) +
          P('M26 32 Q24 44 26 54 L38 54 Q40 44 38 32Z', '#74cde8', 1.4) +
          L('M29 36 L29 50 M35 38 L35 51', 1.4, '#e6f9ff')
        : R(24, 24, 16, 8, 2, '#9a7a4a', 1.2));

const wheelArt = () =>
    SHADOW(32, 58, 22, 3) +
    P('M12 54 Q32 48 52 54 L52 58 L12 58Z', WATER, 1.6) +
    C(32, 30, 19, 'none', 2.4) +
    `<circle cx="32" cy="30" r="19" fill="none" stroke="${BAMBOO}" stroke-width="4.5"/>` +
    `<circle cx="32" cy="30" r="19" fill="none" stroke="#3a2618" stroke-width="1.6"/>` +
    [0, 45, 90, 135, 180, 225, 270, 315]
        .map(a => {
            const rad = (a * Math.PI) / 180,
                x = 32 + Math.cos(rad) * 19,
                y = 30 + Math.sin(rad) * 19;
            return L(`M32 30 L${x.toFixed(1)} ${y.toFixed(1)}`, 1.8, BAMBOO_D) + R(x - 3, y - 3, 6, 6, 1.5, '#c89a5a', 1.3);
        })
        .join('') +
    C(32, 30, 4.2, '#8a5a2e', 1.8);

const junkArt = () =>
    SHADOW(32, 59, 25, 3) +
    P('M8 46 Q32 58 56 44 L52 54 Q32 60 12 54Z', '#8a5228', 2.2) +
    L('M12 49 L52 49', 1.3, '#5a3216') +
    L('M26 46 L26 12 M40 46 L40 16', 2.4, '#5a3216') +
    P('M26 14 Q42 18 40 40 Q32 38 26 42Z', '#c83c32', 2) +
    L('M26 22 L39 24 M26 30 L40 31 M26 37 L39 38', 1.2, '#7a1e18') +
    P('M12 22 Q24 24 25 40 Q18 39 12 42Z', '#e86842', 1.8) +
    L('M13 29 L24 30 M13 35 L24 36', 1.1, '#8a2e18') +
    C(50, 42, 3.2, '#e83838', 1.2); // petite lanterne rouge à la proue

const hanamiArt = () =>
    R(4, 4, 56, 56, 12, '#fde8f0', 2.2) +
    L('M8 44 Q24 32 54 16', 2.6, '#6e4a38') +
    [
        [20, 34, 1],
        [34, 24, 1.15],
        [46, 18, 0.95],
        [26, 48, 0.7],
        [44, 40, 0.75],
    ]
        .map(
            ([x, y, s]) =>
                `<g transform="translate(${x} ${y}) scale(${s})">` +
                [0, 72, 144, 216, 288].map(a => `<g transform="rotate(${a})">${E(0, -4.5, 2.6, 4, SAKURA, 0, 1)}</g>`).join('') +
                FC(0, 0, 2, '#f2c44a') +
                `</g>`,
        )
        .join('');

const monsoonArt = () =>
    R(4, 4, 56, 56, 12, '#cfe4ee', 2.2) +
    P('M14 28 Q12 18 22 18 Q26 10 38 14 Q48 12 50 22 Q54 28 46 32 L18 32 Q12 32 14 28Z', '#5a7890', 2) +
    L('M18 38 L14 50 M28 38 L24 52 M38 38 L34 50 M48 38 L44 52', 2.4, WATER);

const iconAsie = () =>
    R(4, 4, 56, 56, 12, '#d8efe4', 2.2) +
    P('M6 42 Q22 30 38 38 Q48 32 58 40 L58 58 L6 58Z', '#62a864', 1.6) +
    P('M6 48 Q26 42 58 48 L58 58 L6 58Z', '#4c945c', 1.4) +
    P('M6 54 Q30 50 58 54 L58 58 L6 58Z', WATER, 1.2) +
    // petite pagode rouge
    R(26, 24, 12, 14, 1, '#f4ebe0', 1.5) +
    P('M21 25 Q32 16 43 25 L41 26 L23 26Z', '#c83c34', 1.6) +
    P('M23 19 Q32 11 41 19 L39 20 L25 20Z', '#c83c34', 1.5) +
    L('M32 11 L32 7', 1.6, '#c83c34') +
    FC(48, 15, 4.5, '#f4b4c8', 0.9);

const pavilionIcon = () =>
    SHADOW(32, 58, 22, 3) +
    R(14, 28, 36, 26, 3, '#d8c28a', 2) +
    L('M22 28 L22 54 M32 28 L32 54 M42 28 L42 54', 1.6, BAMBOO_D) +
    P('M8 29 Q32 12 56 29 Q50 24 44 24 L20 24 Q14 24 8 29Z', '#2f7a5a', 2.2) +
    C(32, 38, 4.5, '#e8483c', 1.4);

Object.assign(ui, {
    asAsie: iconAsie,
    asRigole: () => canalArt(false),
    asRigoleOn: () => canalArt(true),
    asBassin: () =>
        SHADOW(32, 58, 22, 3) +
        R(10, 26, 44, 28, 6, '#7a8a8e', 2.2) +
        R(14, 30, 36, 20, 4, WATER, 1.6) +
        L('M18 36 Q26 33 34 36 T46 36 M18 43 Q26 40 34 43 T46 43', 1.4, '#d8f6ff') +
        R(24, 12, 16, 14, 3, BAMBOO, 1.8),
    asRoue: wheelArt,
    asEau: () =>
        SHADOW(32, 58, 14, 3) +
        P('M32 8 Q46 28 46 38 A14 14 0 1 1 18 38 Q18 28 32 8Z', WATER, 2.2) +
        HL(27, 36, 3, 6, -15, 0.55),
    asSec: () =>
        R(4, 4, 56, 56, 12, '#f6ebd6', 2.2) +
        P('M32 12 Q44 28 44 37 A12 12 0 1 1 20 37 Q20 28 32 12Z', '#d8c29a', 2) +
        L('M14 50 L50 14', 2.8, '#c8453a'),
    asMousson: monsoonArt,
    asHanami: hanamiArt,
    asJonque: junkArt,
    asPavillon: pavilionIcon,
    asiaJunkDeco: junkArt,
    bannerAsie: () =>
        SHADOW(32, 59, 14, 3) +
        L('M16 10 L16 58', 3, '#6e4a2a') +
        P('M16 12 L52 16 L46 28 L52 40 L16 42Z', '#c83c34', 2) +
        lotusFlower(33, 31, 0.8),
});

// ======================= Mei & Kenji (personnages) =======================
people.mei = () =>
    bust(
        JADE,
        P('M20 47 L32 59 L44 47', 'none') +
            L('M22 47 L36 62 M42 47 L28 62', 2.4, '#f8e6c8') +
            L('M16 57 Q32 62 48 57', 2.4, '#e86882'),
    ) +
    face() +
    // chignon noir, épingle de jade et fleur de cerisier
    C(32, 13, 8, '#221c1a', 2) +
    P('M16 32 C14 14 50 14 48 32 C46 22 40 19 32 19 C24 19 18 22 16 32Z', '#221c1a', 2.2) +
    L('M20 12 L46 16', 2, '#5ad0a4') +
    C(40, 17, 3.2, SAKURA, 1.2) +
    FC(40, 17, 1.2, '#f2c44a');

people.kenji = () =>
    bust(
        '#2c4870',
        L('M22 47 L36 62 M42 47 L28 62', 2.4, '#e6d8c0') + L('M14 58 Q32 63 50 58', 2.4, '#c8453a'),
    ) +
    face() +
    // cheveux noirs courts + bandeau hachimaki blanc noué
    P('M16 30 C14 12 50 12 48 30 C46 22 40 19 32 19 C24 19 18 22 16 30Z', '#221c1a', 2.2) +
    P('M15 23 Q32 18 49 23 L49 27 Q32 22 15 27Z', '#fffaf0', 1.6) +
    FC(32, 22.5, 2.2, '#c83c34', 0.9);

// ======================= 6 chantiers & la carte des Terres d'Asie =======================
const AS_B = {
    asiaSluice: {
        cfg: { w: 34, h: 18, wall: '#8c9a9e', roof: '#3c7a62', sign: ['ui', 'asBassin'] },
        st: { roof: 'hip', tex: 'stone', door: 'arch', wins: [12], noFlowers: false },
    },
    asiaWheel: {
        cfg: { w: 32, h: 18, wall: '#b8945a', roof: '#4a7a3a', sign: ['ui', 'asRoue'] },
        st: { roof: 'gable', tex: 'planks', door: 'plain', wins: [14], noFlowers: false },
    },
    asiaGrove: {
        cfg: { w: 36, h: 18, wall: '#efe6d4', roof: '#c83c34', sign: ['item', 'yuzu'] },
        st: { roof: 'hip', tex: 'planks', door: 'arch', wins: [10, 26], noFlowers: false },
    },
    asiaPavilion: {
        cfg: { w: 38, h: 20, wall: '#d8c28a', roof: '#2f7a5a', sign: ['ui', 'asPavillon'] },
        st: { roof: 'hip', tex: 'planks', door: 'arch', wins: [10, 28], noFlowers: false },
    },
    asiaJunk: {
        cfg: { w: 34, h: 18, wall: '#a86e40', roof: '#c83c34', sign: ['ui', 'asJonque'] },
        st: { roof: 'gable', tex: 'planks', door: 'plain', wins: [14], noFlowers: false },
    },
    asiaLanterns: {
        cfg: { w: 36, h: 18, wall: '#f4e6d2', roof: '#b8322a', sign: ['ui', 'asHanami'] },
        st: { roof: 'hip', tex: 'planks', door: 'arch', wins: [12, 24], noFlowers: false },
    },
};
for (const [id, d] of Object.entries(AS_B)) {
    BLD[id] = { ...d.cfg, st: d.st, kind: 'h2_' + id };
    KINDS['h2_' + id] = st => house2(BLD[id], st);
}

// La carte des Terres d'Asie : montagnes brumeuses, rizières en terrasses, pagode et cerisiers en fleurs
const msakura = (x, y, s) =>
    `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-1" y="0" width="2" height="5" fill="#6e4a38"/>` +
    `<circle cx="0" cy="-6" r="6" fill="#f8b4c8"/><circle cx="-4" cy="-3" r="4.5" fill="#f49ab4"/><circle cx="4" cy="-3" r="4.5" fill="#fcd0de"/></g>`;
MAP_BG.asie = `<svg class="vmap-bg" viewBox="0 0 160 110" preserveAspectRatio="none" aria-hidden="true">
    <rect width="160" height="110" fill="#dff0e8"/>
    <rect width="160" height="36" fill="#fce8ee"/>
    <circle cx="132" cy="18" r="9" fill="#ffe6a0" opacity=".85"/>
    <path d="M0 36 Q28 14 58 28 Q90 10 124 26 Q142 18 160 28 L160 52 L0 52Z" fill="#7aa898" opacity=".6"/>
    <path d="M0 44 Q42 32 82 42 Q122 50 160 36 L160 110 L0 110Z" fill="#88c27e"/>
    <path d="M0 58 Q48 48 96 60 Q130 68 160 54 L160 110 L0 110Z" fill="#6fb26c"/>
    <path d="M0 74 Q50 64 100 76 Q135 84 160 70 L160 110 L0 110Z" fill="#5ca062"/>
    <path d="M0 90 Q50 82 100 92 Q135 98 160 88 L160 110 L0 110Z" fill="#58b4c8" opacity=".75"/>
    <path d="M18 52 Q52 46 84 54 M28 68 Q68 62 112 72 M14 84 Q60 78 118 86" stroke="#8ce0ee" stroke-width="2.5" fill="none" stroke-linecap="round" opacity=".8"/>
    <rect x="74" y="42" width="12" height="10" fill="#f6ece0"/><path d="M70 43 Q80 35 90 43Z" fill="#c83c34"/><path d="M72 38 Q80 31 88 38Z" fill="#c83c34"/>
    ${[
        [14, 50, 0.9],
        [38, 46, 0.8],
        [112, 48, 0.95],
        [144, 46, 0.85],
        [24, 92, 0.9],
        [136, 90, 1],
    ]
        .map(([x, y, s]) => msakura(x, y, s))
        .join('')}
</svg>`;
