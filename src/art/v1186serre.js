// 1.18.6 : les cultures de la serre (menthe, poivre noir, orchidée) et leurs neuf recettes.
import { C, E, F, FC, FE, HL, L, P, R, SHADOW, items, leaf, mound, stem, youngExtra, readyExtra } from './kit.js';
import { plate, bowl, coupe, scoop, cup, soap } from './items2.js';

// ---------------- la menthe : des brins aux feuilles ovales et dentelées ----------------
const MINT = '#3fae4a';
const MINT_L = '#7ed66a';
// une feuille de menthe : ovale, nervurée, un peu dentelée
const mleaf = (x, y, s, rot, c = MINT) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M0 0 Q-9 -4 -9 -12 Q-6 -15 -4 -17 Q0 -22 4 -17 Q6 -15 9 -12 Q9 -4 0 0Z', c, 2.2) +
    L('M0 -2 L0 -17 M0 -7 L-4 -11 M0 -7 L4 -11 M0 -12 L-3 -15 M0 -12 L3 -15', 1, 'rgba(255,255,255,.55)') +
    `</g>`;
// un brin : tige et trois paires de feuilles
const sprig = (x, y, s, rot) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    stem('M0 0 L0 -36', '#5aa83a', 2.2) +
    mleaf(0, -8, 0.8, -62, MINT) +
    mleaf(0, -8, 0.8, 62, MINT_L) +
    mleaf(0, -18, 0.75, -55, MINT_L) +
    mleaf(0, -18, 0.75, 55, MINT) +
    mleaf(0, -28, 0.7, -45, MINT) +
    mleaf(0, -28, 0.7, 45, MINT_L) +
    mleaf(0, -36, 0.85, 0, MINT_L) +
    `</g>`;
items.mint = () =>
    SHADOW(32, 59, 20, 3) +
    sprig(22, 58, 0.85, -16) +
    sprig(42, 58, 0.85, 16) +
    sprig(32, 58, 0.95, 0) +
    R(26, 47, 12, 6, 2.5, '#d9b878', 1.6) +
    L('M27 50 L37 50', 1, '#a8793a');
youngExtra.mint = () => mound() + mleaf(32, 55, 0.7, -50, MINT) + mleaf(32, 55, 0.7, 50, MINT_L) + mleaf(32, 54, 0.8, 0, MINT_L);
readyExtra.mint = () => mound() + sprig(20, 56, 0.7, -22) + sprig(44, 56, 0.7, 22) + sprig(32, 57, 0.95, 0) + sprig(26, 57, 0.6, -8);

// ---------------- le poivre noir : des grappes de baies sur une liane ----------------
const BERRY = ['#2b2420', '#c8263a', '#3f8a3a', '#2b2420', '#c8263a'];
const raceme = (x, y, s) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    L('M0 0 L0 24', 2, '#7a5a2a') +
    [0, 1, 2, 3, 4, 5, 6, 7]
        .map(k => C(k % 2 ? 3 : -3, 4 + k * 3, 2.9, BERRY[k % 5], 1.3) + FC((k % 2 ? 3 : -3) - 0.9, 3.2 + k * 3, 0.8, '#fff', 0.55))
        .join('') +
    `</g>`;
const pleaf = (x, y, s, rot, c = '#3f8a3a') =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M0 0 Q-11 -3 -9 -14 Q-3 -18 0 -22 Q3 -18 9 -14 Q11 -3 0 0Z', c, 2.2) +
    L('M0 -2 L0 -18', 1, 'rgba(255,255,255,.5)') +
    `</g>`;
items.peppercorn = () =>
    SHADOW(32, 60, 22, 3) +
    L('M10 10 Q32 4 54 10', 2.4, '#7a5a2a') +
    pleaf(18, 12, 0.7, 150, '#3f8a3a') +
    pleaf(46, 12, 0.7, 210, '#4f9a42') +
    raceme(18, 11, 0.95) +
    raceme(32, 8, 1.05) +
    raceme(46, 11, 0.95) +
    [
        [22, 56],
        [30, 58],
        [38, 57],
        [45, 56],
        [34, 53],
    ]
        .map(([x, y]) => C(x, y, 3, '#2b2420', 1.4) + FC(x - 1, y - 1, 0.9, '#fff', 0.6))
        .join('');
youngExtra.peppercorn = () =>
    mound() +
    L('M32 56 L32 24', 2.6, '#a8793a') +
    pleaf(32, 50, 0.7, -50) +
    pleaf(32, 44, 0.65, 50, '#4f9a42') +
    pleaf(32, 38, 0.6, -50) +
    pleaf(32, 34, 0.55, 0, '#6cb04a');
readyExtra.peppercorn = () =>
    mound() +
    L('M32 56 L32 8', 2.8, '#a8793a') +
    L('M22 12 L42 12', 2.2, '#a8793a') +
    pleaf(32, 50, 0.9, -55) +
    pleaf(32, 40, 0.85, 55, '#4f9a42') +
    pleaf(32, 30, 0.8, -55) +
    raceme(24, 14, 0.8) +
    raceme(40, 14, 0.8) +
    raceme(32, 24, 0.75) +
    pleaf(32, 20, 0.6, 50, '#4f9a42');

// ---------------- l'orchidée : un pot, de larges feuilles et une hampe fleurie ----------------
const OR = '#fff0f7';
const OR_D = '#f2a4c8';
const orchidFlower = (x, y, s, rot = 0, c = OR, lip = '#d63a8a') =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    E(0, -10, 4.8, 7, c, 0, 2) +
    E(-8, -1, 8.5, 6.5, c, -18, 2.2) +
    E(8, -1, 8.5, 6.5, c, 18, 2.2) +
    E(-5, 7, 4.6, 7, c, 22, 2) +
    E(5, 7, 4.6, 7, c, -22, 2) +
    FE(-8, -1, 5, 3.5, OR_D, 0.55, -18) +
    FE(8, -1, 5, 3.5, OR_D, 0.55, 18) +
    E(0, 3, 3.2, 4.4, lip, 0, 1.6) +
    FC(0, 0, 1.4, '#ffd23f') +
    `</g>`;
const orchidPot = () =>
    P('M18 44 L46 44 L42 60 Q42 61 40 61 L24 61 Q22 61 22 60Z', '#d9743a') +
    R(16, 40, 32, 7, 2.5, '#e8884a', 2) +
    L('M22 54 L42 54', 1.2, 'rgba(58,38,24,.3)') +
    HL(22, 51, 2, 5, -6, 0.5);
const oleaf = (x, y, rot, s = 1) => leaf(x, y, 26 * s, rot, '#3f9a48', 0.42);
items.orchid = () =>
    SHADOW(32, 62, 18, 3) +
    oleaf(30, 42, -150, 0.85) +
    oleaf(34, 42, -30, 0.85) +
    orchidPot() +
    stem('M32 42 Q28 22 40 12 Q46 8 52 12', '#5aa83a', 1.8) +
    orchidFlower(31, 26, 0.55, -15) +
    orchidFlower(40, 14, 0.6, 5) +
    orchidFlower(52, 14, 0.5, 20) +
    FC(34, 6, 2.6, '#f7c6dc', 0.9) +
    C(28, 18, 2, '#f7c6dc', 1);
youngExtra.orchid = () => mound() + oleaf(32, 54, -150, 0.5) + oleaf(32, 54, -30, 0.5) + oleaf(32, 54, -90, 0.45);
readyExtra.orchid = () =>
    SHADOW(32, 62, 18, 3) +
    oleaf(30, 46, -150, 0.8) +
    oleaf(34, 46, -30, 0.8) +
    orchidPot() +
    stem('M32 44 Q26 24 36 12 Q42 6 50 8', '#5aa83a', 1.8) +
    orchidFlower(28, 28, 0.55, -20) +
    orchidFlower(33, 17, 0.6, -5) +
    orchidFlower(44, 9, 0.6, 15) +
    orchidFlower(51, 18, 0.5, 30);

// ---------------- les recettes ----------------
// le taboulé : un bol de semoule dorée, de dés de tomate et de menthe
items.taboule = () =>
    bowl('#e6d18a') +
    [
        [20, 29],
        [30, 31],
        [40, 28],
        [47, 31],
    ]
        .map(([x, y]) => R(x - 2.5, y - 2, 5, 4, 1, '#e2503a', 1.2))
        .join('') +
    mleaf(26, 30, 0.45, -40, MINT_L) +
    mleaf(38, 30, 0.45, 40, MINT) +
    mleaf(32, 27, 0.5, 0, MINT_L);
// la glace à la menthe : trois boules vert tendre, un brin au sommet, des pépites de chocolat
items.mintIce = () =>
    coupe(
        scoop(22, 34, 9, '#b9efd0') +
            scoop(42, 34, 9, '#a7e8c4') +
            scoop(32, 26, 10.5, '#c9f5dc') +
            [
                [28, 22],
                [36, 28],
                [24, 32],
                [44, 30],
            ]
                .map(([x, y]) => C(x, y, 1.5, '#5a3a22', 0.8))
                .join(''),
        mleaf(32, 17, 0.55, -20, MINT) + mleaf(36, 17, 0.5, 35, MINT_L),
    );
// le thé à la menthe : tasse de thé vert pâle, brin de menthe qui dépasse
items.mintTea = () => cup('#a9d96c', mleaf(44, 26, 0.7, 20, MINT) + mleaf(40, 24, 0.7, -25, MINT_L) + mleaf(42, 20, 0.6, 0, MINT));
// le magret au poivre : tranches rosées nappées de sauce, grains noirs
items.pepperMagret = () =>
    plate(46) +
    [
        [22, 44, -8],
        [32, 42, 0],
        [42, 44, 8],
    ]
        .map(
            ([x, y, r]) =>
                E(x, y, 9, 5.5, '#a8483a', r, 2) +
                E(x, y - 0.6, 6.5, 3, '#e8a0a0', r, 0) +
                L(`M${x - 6} ${y - 4} Q${x} ${y - 6} ${x + 6} ${y - 4}`, 1.4, '#f2d6a8'),
        )
        .join('') +
    E(32, 47, 15, 3, '#6a3a22', 0, 0) +
    [
        [18, 40],
        [26, 38],
        [36, 38],
        [46, 40],
        [30, 48],
        [40, 48],
        [23, 48],
    ]
        .map(([x, y]) => C(x, y, 1.7, '#2b2420', 1))
        .join('');
// le fromage au poivre : une part de tomme, la croûte, des grains noirs
items.pepperCheese = () =>
    SHADOW(32, 57, 24, 3) +
    P('M6 46 L58 46 L58 36 Q34 20 6 38Z', '#f2d06a') +
    P('M6 46 L58 46 L58 54 L6 54Z', '#d9a840') +
    P('M6 38 Q34 20 58 36 L58 40 Q34 25 6 42Z', '#f7e29a', 0) +
    L('M6 46 L58 46', 1.4, 'rgba(58,38,24,.4)') +
    [
        [16, 42],
        [26, 38],
        [34, 41],
        [44, 40],
        [52, 43],
        [22, 44],
        [38, 44],
        [30, 34],
    ]
        .map(([x, y]) => C(x, y, 1.9, '#2b2420', 1) + FC(x - 0.6, y - 0.6, 0.5, '#fff', 0.6))
        .join('') +
    HL(14, 40, 4, 1.4, -15, 0.55);
// le saucisson au poivre : le boyau rosé, des mouchetures blanches et noires, la ficelle
items.pepperSaucisson = () =>
    SHADOW(32, 56, 25, 3) +
    P('M8 36 Q8 26 18 26 L46 26 Q56 26 56 36 Q56 46 46 46 L18 46 Q8 46 8 36Z', '#a8483a') +
    F('M10 33 Q10 28 18 28 L46 28 Q54 28 54 33 Q32 32 10 33Z', '#c8645a', 0.6) +
    [
        [16, 34],
        [24, 40],
        [32, 33],
        [40, 41],
        [48, 36],
        [28, 29],
        [44, 31],
        [20, 42],
    ]
        .map(([x, y], k) => (k % 2 ? C(x, y, 2.1, '#2b2420', 0.8) : C(x, y, 2.4, '#fff4dc', 0.8)))
        .join('') +
    L('M22 26 L22 46 M42 26 L42 46', 2.2, '#d9b878') +
    L('M8 36 Q4 32 6 26', 2, '#d9b878') +
    HL(18, 31, 5, 1.4, -4, 0.5);
// le parfum d'orchidée : un flacon rose, un bouchon doré, une orchidée sur l'étiquette
items.orchidPerfume = () =>
    SHADOW(32, 60, 17, 2.6) +
    R(26, 8, 12, 8, 2.5, '#e8b83a', 2) +
    R(28, 15, 8, 6, 1.5, '#eaf6fd', 1.8) +
    P('M16 34 Q16 22 28 21 L36 21 Q48 22 48 34 L48 54 Q48 60 42 60 L22 60 Q16 60 16 54Z', '#fde7f2') +
    F('M17.4 32 Q18 24 28 23 L36 23 Q46 24 46.6 32 L46.6 54 Q46.6 58.6 42 58.6 L22 58.6 Q17.4 58.6 17.4 54Z', '#f7b6d4') +
    C(32, 42, 10, '#fffaf0', 1.6) +
    orchidFlower(32, 42, 0.42, 0) +
    F('M19 32 L21.5 28 L21.5 54 L19 54Z', '#fff', 0.5);
// le savon à l'orchidée : un pain rose pâle marqué d'une fleur
items.orchidSoap = () => soap('#f7c6dc', '#fbe1ee', orchidFlower(32, 42, 0.5, 0));
// les orchidées séchées : une botte à l'envers, nouée d'un ruban, les fleurs pâlies
const dry = '#f3d9c6';
items.orchidDried = () =>
    SHADOW(32, 60, 18, 2.6) +
    L('M32 4 L32 22', 2.4, '#a8793a') +
    stem('M26 22 L22 44', '#a89a5a', 1.6) +
    stem('M32 22 L32 48', '#a89a5a', 1.6) +
    stem('M38 22 L42 44', '#a89a5a', 1.6) +
    orchidFlower(21, 50, 0.5, 180, dry, '#c47a5a') +
    orchidFlower(32, 54, 0.55, 180, dry, '#c47a5a') +
    orchidFlower(43, 50, 0.5, 180, dry, '#c47a5a') +
    R(26, 19, 12, 6, 2.5, '#e8364b', 1.8);
