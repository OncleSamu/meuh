// 1.58 : les vergers de l'oasis et du Grand Nord. Six arbres de chaque : leur fruit (icône), le fruit sur l'arbre, et pour trois d'entre eux
// (figuier de Barbarie, pin cembro, genévrier) l'arbre dessiné à part. Les autres gardent l'arbre commun, chargé de leurs fruits.
import { C, E, F, FC, FE, HL, L, P, SHADOW, leaf, items } from './kit.js';
import { fruitExtra, treeArt } from './plants.js';

// ======================= l'oasis =======================
// le tamarin : une gousse brune bosselée, une autre ouverte sur sa pulpe collante
const tamPod = (x, y, s = 1, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    L('M-17 4 Q-10 -9 2 -8 Q13 -7 18 4', 11, '#3a2618') +
    L('M-17 4 Q-10 -9 2 -8 Q13 -7 18 4', 8, '#a8744a') +
    L('M-12 -2 L-12 -6 M-5 -6 L-5 -10 M3 -6 L3 -10 M11 -2 L11 -6', 1.2, '#7a4e2c') +
    FC(-16, 5, 2, '#6a4226') +
    L('M-8 -7 Q-2 -10 5 -9', 1.6, '#d9a878') +
    `</g>`;
const tamOpen = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    P('M-17 3 Q-10 -9 2 -8 Q13 -7 18 3 Q10 1 2 2 Q-8 1 -17 3Z', '#a8744a', 2.2) +
    P('M-14 3 Q-6 -3 2 -3 Q10 -3 15 3 Q7 7 0 7 Q-8 7 -14 3Z', '#6a3a1e', 1.6) +
    FE(-6, 3, 2.2, 1.4, '#3a1e10', 0.9, -10) +
    FE(2, 4, 2.2, 1.4, '#3a1e10', 0.9, 5) +
    FE(9, 3, 2, 1.3, '#3a1e10', 0.9, 15) +
    L('M-10 2 Q-4 -1 3 0', 1, '#c8844a') +
    `</g>`;
items.tamarind = () => SHADOW(32, 58, 22, 3) + tamPod(30, 30, 1.25, -8) + tamOpen(30, 50, 1.1) + leaf(46, 14, 10, -40, '#6cc04a', 0.3) + leaf(50, 18, 8, 10, '#5fa84a', 0.3);

// le caroubier : la gousse plate, longue et brun sombre, avec ses graines en relief
const carobPod = (x, y, s = 1, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M-19 5 Q-12 -9 2 -9 Q14 -9 20 -3 Q22 -1 19 1 Q12 -3 2 -3 Q-8 -2 -14 8 Q-18 9 -19 5Z', '#6a3a22', 2.2) +
    L('M-12 2 Q-9 -4 -3 -6 M-4 -5 Q2 -6 8 -5 M9 -5 Q14 -5 17 -2', 1, '#4a2614') +
    FC(-6, -3, 1.3, '#4a2614', 0.7) +
    FC(2, -5, 1.3, '#4a2614', 0.7) +
    FC(11, -5, 1.2, '#4a2614', 0.7) +
    L('M-14 0 Q-8 -7 2 -7', 1.4, '#a8683a') +
    `</g>`;
items.carob = () =>
    SHADOW(32, 58, 22, 3) +
    carobPod(30, 44, 1.5, -4) +
    carobPod(33, 26, 1.4, 6) +
    leaf(10, 14, 11, -20, '#4f8a3a', 0.4) +
    leaf(10, 14, 10, 30, '#6cc04a', 0.4);

// l'arganier : un fruit jaune-vert comme une petite olive, et sa noix ouverte sur l'amande, une goutte d'huile
const arganFruit = (x, y, s = 1, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    E(0, 0, 8, 10, '#d4c24a', 0, 2.2) +
    F('M-8 3 Q-6 10 0 10 Q-5 6 -5 -2Z', '#a89a2a', 0.8) +
    FE(-3, -4, 1.8, 3.2, '#fff', 0.5, -15) +
    P('M-2.4 -10 L2.4 -10 L1.6 -12.5 L-1.6 -12.5Z', '#7a5a2a', 1.2) +
    `</g>`;
items.argan = () =>
    SHADOW(32, 58, 22, 3) +
    arganFruit(22, 32, 1.25, -10) +
    arganFruit(40, 28, 1.1, 12) +
    // la noix ouverte
    E(34, 48, 9, 7, '#8a5a2e', -8, 2.2) +
    E(34, 48, 5.6, 3.8, '#f1e2bb', -8, 1.4) +
    FE(32.6, 47, 1.6, 0.9, '#fff', 0.7, -8) +
    // la goutte d'huile
    P('M52 40 Q56 47 52 52 Q48 47 52 40Z', '#e8b830', 1.8) +
    FE(51, 47, 0.9, 1.8, '#fff', 0.6, 10);

// le mûrier blanc : des mûres allongées, crème et rosées, sur leur feuille dentée
const mulBerry = (x, y, s = 1, rot = 0, c = '#f2e2cc') => {
    let g = '';
    for (let j = -6; j <= 6; j += 3) for (const i of [-2.4, 2.4]) g += FC(i, j, 1.5, '#fff', 0.55);
    return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` + E(0, 0, 5.2, 9.5, c, 0, 2) + g + L('M0 -9 L0 -13', 1.4, '#6b8a3a') + `</g>`;
};
items.mulberry = () =>
    SHADOW(32, 58, 20, 3) +
    leaf(30, 54, 24, -140, '#6cc04a', 0.5) +
    leaf(30, 54, 22, -40, '#5fa84a', 0.5) +
    mulBerry(22, 34, 1.3, 14, '#f0d9c0') +
    mulBerry(36, 32, 1.35, -8, '#f6ead6') +
    mulBerry(46, 40, 1.15, -18, '#ecc9c0');

// le figuier de Barbarie : un fruit ovale, rose-pourpre, piqueté de ses coussinets, et une moitié qui montre sa chair
const pearFruit = (x, y, s = 1, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M-6 -7 Q-8 6 -4 11 Q0 13 4 11 Q8 6 6 -7 Q0 -10 -6 -7Z', '#d8365a', 2.2) +
    F('M2 -8 Q7 4 3 10 Q8 4 6 -7Z', '#f08a2a', 0.65) +
    E(0, -8, 5.4, 2, '#8a2a3a', 0, 1.4) +
    FC(-3, -2, 0.8, '#f2d24a') +
    FC(2, 0, 0.8, '#f2d24a') +
    FC(-2, 4, 0.8, '#f2d24a') +
    FC(3, 6, 0.8, '#f2d24a') +
    L('M-3.4 -2.6 L-4.6 -3.8 M2.6 -0.6 L3.8 -1.8 M-2.6 3.4 L-3.8 2.4', 0.8, '#f2d24a') +
    FE(-3, -3, 1.2, 3.2, '#fff', 0.45, 10) +
    `</g>`;
items.pricklyPear = () =>
    SHADOW(32, 58, 22, 3) +
    pearFruit(24, 32, 1.45, -12) +
    // la moitié
    `<g transform="translate(44 40) rotate(14)">` +
    E(0, 0, 8.5, 12, '#d8365a', 0, 2.2) +
    E(0, 0, 5.8, 9.4, '#f06a8a', 0, 1.4) +
    FC(-1.6, -3, 0.8, '#3a1e2a') +
    FC(1.8, -1, 0.8, '#3a1e2a') +
    FC(-1, 2, 0.8, '#3a1e2a') +
    FC(1.6, 5, 0.8, '#3a1e2a') +
    `</g>`;

// le cédratier : un gros citron bosselé à la pointe en mamelon, et sa tranche à l'écorce épaisse
const citron = (x, y, s = 1, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M-11 0 Q-11 -10 -1 -10 Q2 -13 5 -11 Q11 -8 11 0 Q11 9 2 11 Q-3 14 -6 10 Q-11 8 -11 0Z', '#f2cf3a', 2.2) +
    FC(-5, -4, 1, '#d9a81a', 0.7) +
    FC(2, -1, 1, '#d9a81a', 0.7) +
    FC(-3, 4, 1, '#d9a81a', 0.7) +
    FC(5, 5, 1, '#d9a81a', 0.7) +
    FE(-6, -5, 2, 4, '#fff', 0.5, 25) +
    L('M4 -11 L5 -14', 1.6, '#6b8a3a') +
    `</g>`;
items.citron = () =>
    SHADOW(32, 58, 22, 3) +
    citron(26, 32, 1.5, -10) +
    // la tranche
    C(47, 46, 10, '#f2cf3a', 2.2) +
    C(47, 46, 8.4, '#f6efc8', 1.2) +
    C(47, 46, 4.4, '#e8dc7a', 1.2) +
    L('M47 46 L47 41.6 M47 46 L51 48 M47 46 L43 48', 1, '#d9c24a') +
    leaf(48, 22, 12, -60, '#4f8a3a', 0.4);

// ---- les fruits sur l'arbre (petits)
const smallPod = (c, hi) => (x, y) => L(`M${x - 5} ${y - 1} Q${x} ${y - 6} ${x + 5} ${y - 2}`, 4.6, '#3a2618') + L(`M${x - 5} ${y - 1} Q${x} ${y - 6} ${x + 5} ${y - 2}`, 2.8, c) + L(`M${x - 3} ${y - 3} Q${x} ${y - 4.6} ${x + 3} ${y - 3.4}`, 0.8, hi);
fruitExtra.tamarind = (x, y) => smallPod('#a8744a', '#d9a878')(x, y + 2) + smallPod('#a8744a', '#d9a878')(x + 2, y + 6);
fruitExtra.carob = (x, y) => smallPod('#6a3a22', '#a8683a')(x, y + 2) + smallPod('#6a3a22', '#a8683a')(x - 1, y + 6);
fruitExtra.argan = (x, y) => E(x, y, 3.4, 4.2, '#d4c24a', 0, 1.6) + FE(x - 1.2, y - 1.6, 0.8, 1.4, '#fff', 0.6, -15);
fruitExtra.mulberry = (x, y) => E(x, y, 2.6, 4.4, '#f0d9c0', 0, 1.5) + FC(x - 1, y - 1.4, 0.5, '#fff', 0.7);
fruitExtra.citron = (x, y) => E(x, y, 4.8, 3.8, '#f2cf3a', 10, 1.8) + FC(x + 4.6, y - 0.8, 1, '#f2cf3a') + FC(x - 1.4, y - 1.2, 0.9, '#fff', 0.55);

// le figuier de Barbarie : des raquettes vertes empilées, des fruits pourpres sur leur bord
const pad = (x, y, w, h, rot, c, fruit = false, old = false) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})">` +
    E(0, 0, w, h, c, 0, 2.2) +
    FC(-w * 0.35, -h * 0.3, 0.9, '#f2e2a0') +
    FC(w * 0.3, -h * 0.35, 0.9, '#f2e2a0') +
    FC(0, 0, 0.9, '#f2e2a0') +
    FC(-w * 0.3, h * 0.35, 0.9, '#f2e2a0') +
    FC(w * 0.35, h * 0.3, 0.9, '#f2e2a0') +
    HL(-w * 0.25, -h * 0.5, w * 0.35, h * 0.14, -15, 0.3) +
    (fruit ? pearFruit(0, -h - 1, 0.42, 0) : '') +
    (old ? FC(w * 0.5, 0, 1.4, '#b89a4a', 0.7) : '') +
    `</g>`;
treeArt.pricklyPear = stage => {
    const old = stage === 3,
        c = old ? '#8fae5a' : '#4f9a4a';
    const f = stage >= 2;
    return (
        SHADOW(32, 58, 18, 3) +
        pad(32, 49, 12, 8, 0, c) +
        pad(21, 37, 8, 11, -28, c, f) +
        pad(43, 36, 8, 11, 26, old ? c : '#5fae52', f) +
        pad(32, 30, 8.5, 11.5, 4, c, f) +
        pad(22, 19, 6.4, 9, -24, old ? c : '#5fae52', f) +
        pad(41, 17, 6.4, 9, 20, c, f && !old)
    );
};
fruitExtra.pricklyPear = (x, y) => pearFruit(x, y, 0.36);

// ======================= le Grand Nord =======================
// le pommettier : une toute petite pomme, rouge et jaune, sur une longue queue
const crab = (x, y, s = 1, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M0 -6 Q-9 -9 -9 0 Q-9 9 -3 10 Q0 11 3 10 Q9 9 9 0 Q9 -9 0 -6Z', '#e2412f', 2.2) +
    F('M-1 -5 Q-8 -5 -8 1 Q-7 8 -3 9 Q-6 3 -4 -3Z', '#f2c23a', 0.8) +
    FE(-3.4, -1.6, 1.6, 3, '#fff', 0.5, 15) +
    L('M0 -6 Q1 -10 3 -14', 1.6, '#6b3d1e') +
    L('M0 8.4 L0 9.6', 1, '#7a2a1a') +
    `</g>`;
items.crabapple = () =>
    SHADOW(32, 58, 22, 3) +
    leaf(30, 14, 12, 30, '#4f8a3a', 0.42) +
    crab(22, 38, 1.5, -8) +
    crab(41, 32, 1.35, 10) +
    crab(40, 51, 1.05, 24);

// le merisier à grappes : une grappe pendante de baies noires, des fleurs blanches qui reviennent au printemps
const berry = (x, y, r = 2.6, c = '#2a1830') => C(x, y, r, c, 1.4) + FC(x - r * 0.35, y - r * 0.4, r * 0.32, '#fff', 0.7);
items.birdCherry = () => {
    let o = SHADOW(32, 58, 22, 3) + leaf(14, 12, 16, 20, '#4f8a3a', 0.4) + leaf(44, 8, 14, 100, '#5fa84a', 0.4);
    o += L('M22 8 Q26 8 28 14 Q30 34 32 50', 2.4, '#6b3d1e');
    const pts = [
        [25, 14],
        [31, 13],
        [24, 20],
        [30, 21],
        [36, 19],
        [27, 28],
        [33, 28],
        [24, 34],
        [30, 36],
        [36, 34],
        [28, 43],
        [33, 44],
        [31, 51],
    ];
    pts.forEach(([x, y]) => (o += L(`M${x} ${y} L29 ${y - 4}`, 0.9, '#6b3d1e') + berry(x, y, 3.1)));
    return o;
};

// le pin cembro : des écailles brun-violet, et les pignons à côté
const cone = (x, y, s = 1) => {
    let o = `<g transform="translate(${x} ${y}) scale(${s})">` + E(0, 0, 9, 12, '#7a4a52', 0, 2.2);
    for (let j = -8; j <= 8; j += 4) for (let i = -6; i <= 6; i += 4.4) o += P(`M${i} ${j} Q${i + 2.2} ${j - 2} ${i + 4.4} ${j} Q${i + 2.2} ${j + 4} ${i} ${j}Z`, (i + j) % 2 ? '#8a5a62' : '#6a3a42', 1);
    o += HL(-3.6, -5, 1.6, 4, 15, 0.4) + L('M0 -12 L0 -15', 1.8, '#6b3d1e');
    return o + `</g>`;
};
const nut = (x, y, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})">` + P('M0 -6 Q4 -1 3 4 Q0 6 -3 4 Q-4 -1 0 -6Z', '#e8cf9a', 1.6) + FE(-1, -1, 0.7, 2, '#fff', 0.5) + `</g>`;
items.cembro = () =>
    SHADOW(32, 58, 22, 3) +
    cone(28, 31, 1.55) +
    nut(48, 44, 20) +
    nut(52, 52, -20) +
    nut(43, 54, 40) +
    L('M42 8 L46 18 M46 8 L46 18 M50 8 L46 18', 1.1, '#3f6a4a') +
    L('M40 12 L44 20 M52 12 L48 20', 1, '#4f8a5a');

// le genévrier : un brin d'aiguilles bleutées, quatre baies noir-bleu poudrées
const jBerry = (x, y, r = 4.6) =>
    C(x, y, r, '#3a4a78', 1.8) + FC(x - r * 0.3, y - r * 0.3, r * 0.5, '#8a9ac0', 0.6) + L(`M${x} ${y + 0.2} L${x + 1.2} ${y - 1.6} M${x} ${y + 0.2} L${x - 1.4} ${y - 1.2} M${x} ${y + 0.2} L${x} ${y + 1.8}`, 0.8, '#1e2a4a');
const needles = (x, y, ang) => {
    let o = `<g transform="translate(${x} ${y}) rotate(${ang})">` + L('M0 0 L26 0', 2.2, '#6b3d1e');
    for (let k = 3; k <= 24; k += 4) o += L(`M${k} 0 L${k + 6} -6 M${k} 0 L${k + 6} 6`, 2.3, '#3a2618') + L(`M${k} 0 L${k + 6} -6 M${k} 0 L${k + 6} 6`, 1.2, '#6aa0a8');
    return o + `</g>`;
};
items.juniper = () =>
    SHADOW(32, 58, 22, 3) +
    needles(8, 20, 24) +
    needles(10, 46, -22) +
    jBerry(30, 36, 5.2) +
    jBerry(42, 27, 4.6) +
    jBerry(44, 44, 4.8) +
    jBerry(22, 48, 3.8);

// le sureau noir : une ombelle de petites baies sombres sur des tiges rougeâtres
items.elderberry = () => {
    let o = SHADOW(32, 58, 22, 3) + leaf(32, 56, 22, -130, '#4f8a3a', 0.46) + leaf(32, 56, 20, -50, '#5fa84a', 0.46) + L('M32 56 L32 30', 3, '#6b3d1e');
    for (let a = -75; a <= 75; a += 15) o += L(`M32 30 L${(32 + Math.sin((a * Math.PI) / 180) * 21).toFixed(1)} ${(30 - Math.cos((a * Math.PI) / 180) * 12).toFixed(1)}`, 1.2, '#a8465a');
    for (let a = -75; a <= 75; a += 15) {
        const x = 32 + Math.sin((a * Math.PI) / 180) * 21,
            y = 30 - Math.cos((a * Math.PI) / 180) * 12;
        o += berry(x, y, 2.5, '#3a1e4a') + berry(x - Math.sin((a * Math.PI) / 180) * 5, y + 3, 2.2, '#4a2a5a');
    }
    return o;
};

// l'aronia : de grosses baies noir-bleu, une collerette au bout, sur une feuille qui rougit
items.aronia = () =>
    SHADOW(32, 58, 22, 3) +
    leaf(10, 36, 22, -30, '#d8602a', 0.42) +
    leaf(54, 36, 22, 210, '#c8443a', 0.42) +
    L('M32 56 Q31 40 30 24 M30 24 L20 20 M30 28 L42 22 M31 36 L22 40 M31 38 L42 38', 2, '#6b3d1e') +
    [
        [20, 20],
        [30, 17],
        [42, 22],
        [22, 40],
        [42, 38],
        [32, 28],
        [34, 44],
    ].reduce((o, [x, y]) => o + berry(x, y, 5.2, '#262a52') + FC(x + 1.6, y + 1.8, 0.9, '#8a9ac0', 0.7) + FC(x, y + 3.6, 0.7, '#3a2618'), '');

// ---- les fruits sur l'arbre (petits)
fruitExtra.crabapple = (x, y) => C(x, y, 3.2, '#e2412f', 1.6) + FC(x + 1, y + 1.2, 1.2, '#f2c23a', 0.8) + FC(x - 1.2, y - 1.2, 0.8, '#fff', 0.6);
fruitExtra.birdCherry = (x, y) =>
    L(`M${x - 1} ${y - 6} Q${x + 2} ${y} ${x} ${y + 6}`, 1, '#6b3d1e') + FC(x - 1, y - 3, 1.8, '#2a1830') + FC(x + 1.4, y, 1.8, '#2a1830') + FC(x - 1, y + 3, 1.8, '#2a1830') + FC(x + 0.6, y + 5.4, 1.6, '#2a1830');
fruitExtra.elderberry = (x, y) => L(`M${x} ${y + 4} L${x} ${y}`, 1, '#a8465a') + FE(x, y - 1.6, 5.4, 3.6, '#3a1e4a', 0.95) + FC(x - 2, y - 2.6, 0.9, '#fff', 0.5) + FC(x + 1.6, y - 1, 0.7, '#8a5a9a', 0.7);
fruitExtra.aronia = (x, y) => C(x - 1.8, y, 2.6, '#262a52', 1.4) + C(x + 2, y + 1, 2.6, '#262a52', 1.4) + C(x, y - 2.6, 2.4, '#262a52', 1.4) + FC(x - 2.6, y - 0.8, 0.7, '#8a9ac0', 0.7);

// le pin cembro : un conifère large et sombre, aux étages arrondis, des cônes violets
const pineTier = (cy, w, h, snow = false) =>
    P(`M${32 - w} ${cy + h} Q${32 - w * 0.9} ${cy - h * 0.6} 32 ${cy - h} Q${32 + w * 0.9} ${cy - h * 0.6} ${32 + w} ${cy + h} Q32 ${cy + h + 4} ${32 - w} ${cy + h}Z`, '#2f6a58', 2) +
    L(`M${32 - w * 0.7} ${cy + h * 0.5} L${32 - w * 0.85} ${cy + h * 0.2} M${32 - w * 0.2} ${cy + h * 0.6} L${32 - w * 0.3} ${cy + h * 0.25} M${32 + w * 0.3} ${cy + h * 0.6} L${32 + w * 0.4} ${cy + h * 0.25} M${32 + w * 0.7} ${cy + h * 0.5} L${32 + w * 0.85} ${cy + h * 0.2}`, 1.3, '#7fb89a') +
    (snow ? F(`M${32 - w * 0.3} ${cy - h * 0.2} Q32 ${cy - h * 1.2} ${32 + w * 0.3} ${cy - h * 0.2} Q32 ${cy} ${32 - w * 0.3} ${cy - h * 0.2}Z`, '#fff', 0.85) : '');
treeArt.cembro = stage => {
    const old = stage === 3;
    let o = SHADOW(32, 58, 19, 3) + P('M28 58 L29 44 L35 44 L36 58Z', '#6b4a2a', 2);
    o += pineTier(44, 24, 9) + pineTier(32, 21, 9) + pineTier(21, 16, 8.5) + pineTier(11, 10, 7.5, old);
    if (stage >= 2) o += cone(18, 41, 0.5) + cone(46, 40, 0.5) + cone(32, 30, 0.46) + (old ? '' : cone(24, 20, 0.4));
    return o;
};
fruitExtra.cembro = (x, y) => cone(x, y, 0.4);

// le genévrier : un arbuste étroit, bleu-vert, serré, piqueté de baies
treeArt.juniper = stage => {
    const old = stage === 3,
        c = old ? '#7a9a8a' : '#4f8a90';
    let o = SHADOW(32, 58, 15, 3) + P('M29 58 L30 48 L34 48 L35 58Z', '#6b4a2a', 2);
    o += P('M18 52 C12 36 20 22 32 8 C44 22 52 36 46 52 C40 56 24 56 18 52Z', c, 2.2);
    for (const [x, y, a] of [
        [22, 44, -30],
        [30, 36, 10],
        [40, 42, 30],
        [26, 24, -20],
        [36, 28, 20],
        [32, 16, 0],
        [24, 34, -50],
        [41, 33, 50],
    ])
        o += L(`M${x} ${y} L${x + Math.sin((a * Math.PI) / 180) * 7} ${y - Math.cos((a * Math.PI) / 180) * 7}`, 1.4, old ? '#9ab8a8' : '#8ac0c0');
    o += HL(25, 24, 3.6, 8, 14, 0.25);
    if (stage >= 2) o += C(24, 40, 2.6, '#3a4a78', 1.4) + C(38, 46, 2.6, '#3a4a78', 1.4) + C(31, 31, 2.6, '#3a4a78', 1.4) + C(40, 30, 2.4, '#3a4a78', 1.4) + (old ? '' : C(27, 20, 2.2, '#3a4a78', 1.4));
    return o;
};
fruitExtra.juniper = (x, y) => C(x, y, 2.6, '#3a4a78', 1.4) + FC(x - 0.8, y - 0.8, 0.8, '#8a9ac0', 0.7);

export const ORCHARD_158 = {
    oasis: ['tamarind', 'carob', 'argan', 'mulberry', 'pricklyPear', 'citron'],
    nord: ['crabapple', 'birdCherry', 'cembro', 'juniper', 'elderberry', 'aronia'],
};
