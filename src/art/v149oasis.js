// 1.49 : les bêtes de l'oasis (le dromadaire, le zébu), leurs produits, l'enclos de la palmeraie, la noria,
// la caravane, le souk, la tempête de sable, et Yasmine l'herboriste. Animaux : cadre 80 × 80, ombre vers y = 72.
import { C, E, F, FC, FE, HL, L, P, R, SHADOW, animals, items, ui, people } from './kit.js';
import { leg, eye } from './animals.js';
import { milkB } from './items2.js';
import { bust, face } from './people.js';
import { palmFrond } from './v148oasis.js';

const O = '#3a2618';

// ======================= le dromadaire =======================
// sable doré, une bosse, long cou en S, tête allongée ; coat 1 = longue (crinière et bosse laineuses), 2 = frisée
const DR = '#d9a868',
    DRD = '#b8844a',
    DRL = '#f0c88a';
animals.dromedary = (o = {}) => {
    const long = o.coat === 1,
        curly = o.coat === 2;
    const tuft = (pts, r = 3) => pts.map(([x, y]) => C(x, y, r, DRD, 1.4)).join('');
    return (
        SHADOW(38, 74, 24, 3.4) +
        // les pattes, longues et fines, genoux marqués
        leg('M23 44 L22 58 L23 71', DRD) +
        leg('M30 46 L30 59 L29 71', DRD) +
        leg('M46 46 L47 59 L46 71', DRD) +
        leg('M53 44 L55 58 L54 71', DRD) +
        FC(22, 58, 2.2, DRD) +
        FC(55, 58, 2.2, DRD) +
        L('M20 71 L26 71 M26 71 L32 71 M43 71 L49 71 M51 71 L57 71', 3, O) +
        // la queue
        L('M13 32 Q9 38 11 46', 2.6) +
        P('M9 44 Q11 50 14 46Z', DRD, 1.4) +
        // le corps et la bosse
        P('M15 36 Q13 26 23 22 Q29 8 39 8 Q49 8 53 22 Q61 24 61 34 Q61 46 49 48 L23 48 Q15 46 15 36Z', DR) +
        F('M19 42 Q31 48 49 46 Q57 42 59 36 Q51 44 35 44 Q23 44 19 42Z', DRD, 0.5) +
        HL(33, 14, 7, 3, -15, 0.45) +
        (long
            ? tuft(
                  [
                      [31, 10],
                      [37, 7],
                      [43, 8],
                      [47, 12],
                  ],
                  3.4,
              )
            : '') +
        (curly
            ? [
                  [27, 26],
                  [35, 20],
                  [43, 20],
                  [49, 28],
                  [31, 36],
                  [43, 36],
              ]
                  .map(([x, y]) => C(x, y, 2.6, 'none', 1.1))
                  .join('')
            : '') +
        // le cou en S et la tête
        P('M53 28 Q61 24 62 16 Q63 10 68 9 L72 13 Q68 17 68 22 Q66 34 57 38Z', DR) +
        (long
            ? tuft(
                  [
                      [58, 34],
                      [61, 28],
                      [63, 21],
                  ],
                  2.6,
              )
            : '') +
        P('M64 9 Q66 3 72 4 Q78 5 78 10 Q78 15 72 15 Q66 15 64 11Z', DR) +
        FE(76, 11, 2.6, 2.2, DRL, 0.9) +
        L('M75.5 13 Q77 14 78 12.5', 1.1) +
        FC(77, 9.4, 0.9, O) +
        P('M66 6 L65 1.5 L68 4Z', DRD, 1.4) +
        eye(70, 8) +
        L('M68.2 6.6 Q70 5.4 72 6.4', 1, O)
    );
};

// ======================= le zébu =======================
// gris perle, grosse bosse sur le garrot, fanon qui pend, oreilles tombantes, cornes en croissant (horns : 1 sans, 2 longues, 3 en lyre)
const ZB = '#d8d4cc',
    ZBD = '#a8a299',
    ZBL = '#f2efe8';
animals.zebu = (o = {}) => {
    const h = o.horns || 0;
    const horn = d => L(d, 4.2) + L(d, 2, '#efe3c4');
    const horns =
        h === 1
            ? FC(60, 22, 1.8, '#c8bfa8') + FC(68, 22, 1.8, '#c8bfa8')
            : h === 2
              ? horn('M60 24 Q52 18 50 8') + horn('M68 24 Q76 18 78 8')
              : h === 3
                ? horn('M60 24 Q50 20 52 10 Q54 6 58 8') + horn('M68 24 Q78 20 76 10 Q74 6 70 8')
                : horn('M60 24 Q55 18 57 12') + horn('M68 24 Q73 18 71 12');
    return (
        SHADOW(40, 74, 26, 3.6) +
        leg('M24 56 L24 71', ZBD) +
        leg('M32 58 L32 71', ZBD) +
        leg('M50 58 L50 71', ZBD) +
        leg('M58 56 L58 71', ZBD) +
        L('M21 71 L27 71 M29 71 L35 71 M47 71 L53 71 M55 71 L61 71', 3, '#4a4038') +
        L('M12 40 Q8 50 10 60', 2.4) +
        P('M7 58 Q10 66 13 59Z', '#5a5048', 1.4) +
        // le corps, puis la bosse sur les épaules
        P('M12 46 Q10 32 24 32 L48 30 Q62 32 62 44 Q62 58 50 60 L24 60 Q12 58 12 46Z', ZB) +
        P('M44 32 Q44 18 52 18 Q60 20 58 32Z', ZB, 2.2) +
        FE(52, 22, 3, 2, ZBL, 0.8) +
        F('M16 52 Q30 60 52 58 Q60 54 61 48 Q50 56 36 56 Q22 56 16 52Z', ZBD, 0.45) +
        HL(28, 38, 7, 2.4, -8, 0.45) +
        // la tête, le fanon et les oreilles tombantes
        P('M52 38 Q50 50 56 58 Q60 52 62 42 Q58 40 52 38Z', ZBL, 1.8) +
        horns +
        P('M56 26 Q64 20 72 26 Q76 36 70 44 Q64 46 60 40 Q56 34 56 26Z', ZB, 2.2) +
        E(67, 42, 5.4, 4, '#8e877e', 0, 1.8) +
        FC(65.4, 42, 0.9, O) +
        FC(68.6, 42, 0.9, O) +
        P('M57 28 Q50 30 50 38 Q55 36 58 32Z', ZBD, 1.6) +
        P('M71 28 Q78 30 78 38 Q73 36 70 32Z', ZBD, 1.6) +
        eye(61, 32) +
        eye(68, 32)
    );
};

// ======================= les produits =======================
const yarn2 = (c, d) =>
    SHADOW(30, 58, 22, 3) +
    C(30, 34, 22, c) +
    L('M12 24 Q30 34 48 22 M10 34 Q30 46 52 32 M14 46 Q30 52 46 46 M20 14 Q16 34 22 54 M34 12 Q42 34 36 56', 1.4, d) +
    C(30, 34, 22, 'none') +
    L('M50 44 Q58 52 54 58 Q50 62 58 62', 1.8, d) +
    HL(20, 24, 4, 2, -30, 0.6);
Object.assign(items, {
    camelMilk: () => milkB('#c8945e', '#f6ead6', 'dromedary', '#fffaf0', 'jug'),
    zebuMilk: () => milkB('#8e877e', '#efece6', 'zebu', '#fffdf6'),
    camelWool: () => yarn2('#c8945e', '#8a5a2e'),
});

// ======================= l'oasis, suite =======================
const water = '#5aa9e6';
// l'enclos de la palmeraie : une palissade en palmes, un abreuvoir, un palmier
const iconEnclos = () =>
    SHADOW(32, 60, 28, 3) +
    E(32, 48, 28, 10, '#e8c690', 0, 2.2) +
    `<g transform="translate(46 44)">${L('M0 0 Q-1 -12 1 -22', 3.4)}${L('M0 0 Q-1 -12 1 -22', 1.6, '#a8834e')}${palmFrond(1, -22, 16, -165, '#5f9a3a', -0.4)}${palmFrond(1, -22, 16, -15, '#7cc04a', 0.4)}${palmFrond(1, -22, 13, -130, '#7cc04a', -0.3)}${palmFrond(1, -22, 13, -50, '#5f9a3a', 0.3)}${palmFrond(1, -22, 10, -92, '#7cc04a', 0.1)}</g>` +
    [8, 14, 20, 26, 32, 38, 44, 50, 56]
        .map(
            (x, k) =>
                L(`M${x} ${58 - Math.abs(k - 4) * 0.8} L${x} ${46 - Math.abs(k - 4) * 0.8}`, 3.6) +
                L(`M${x} ${58 - Math.abs(k - 4) * 0.8} L${x} ${46 - Math.abs(k - 4) * 0.8}`, 1.8, '#c8a46a'),
        )
        .join('') +
    L('M6 50 Q32 46 58 50 M6 55 Q32 51 58 55', 2, '#8b5a2b') +
    R(14, 36, 16, 6, 2, '#a8834e', 1.8) +
    E(22, 36.5, 7, 1.4, water, 0, 0);
// l'abreuvoir
const iconTrough = () =>
    SHADOW(32, 58, 26, 3) +
    P('M8 34 L56 34 L52 54 L12 54Z', '#c8945e', 2.4) +
    E(32, 34, 24, 4, '#a8784a', 0, 2.2) +
    E(32, 34.5, 21, 2.6, water, 0, 0) +
    FE(24, 34, 5, 0.8, '#fff', 0.6) +
    L('M14 42 L50 42 M16 48 L48 48', 1.2, '#8a5a2e');
// la noria : une grande roue à godets, un zébu qui tourne le manège
const iconNoria = () => {
    let o = SHADOW(32, 60, 28, 3) + E(32, 56, 28, 5, '#e8c690', 0, 2) + E(18, 55, 12, 3, water, 0, 1.4);
    // la roue
    o += C(18, 34, 16, 'none', 3) + C(18, 34, 16, 'none', 1.4).replace('stroke="#3a2618"', 'stroke="#c8945e"');
    for (let k = 0; k < 8; k++) {
        const a = (k * Math.PI) / 4;
        o += L(`M18 34 L${18 + 15 * Math.cos(a)} ${34 + 15 * Math.sin(a)}`, 1.8, '#8b5a2b');
        o += P(`M${18 + 16 * Math.cos(a) - 2.4} ${34 + 16 * Math.sin(a) - 2} l4.8 0 l-0.8 4 l-3.2 0Z`, '#a8693a', 1.2);
    }
    o += C(18, 34, 3, '#8b5a2b', 1.6);
    // l'arbre de transmission et le petit zébu
    o += L('M18 34 L44 30', 2.6, '#8b5a2b') + L('M44 22 L44 50', 3, '#8b5a2b');
    o += `<g transform="translate(36 30) scale(.36)">${animals.zebu()}</g>`;
    return o;
};
// la caravane : trois dromadaires à la file, chargés
const loaded = (x, y, s) =>
    `<g transform="translate(${x} ${y}) scale(${s})">${animals.dromedary()}` +
    R(24, 20, 22, 10, 3, '#c8453a', 2) +
    L('M28 20 L28 30 M35 20 L35 30 M42 20 L42 30', 1.2, '#ffd23f') +
    `</g>`;
const iconCaravan = () =>
    P('M0 60 Q20 52 40 56 Q54 58 64 54 L64 64 L0 64Z', '#e8c690', 2) +
    loaded(-4, 20, 0.36) +
    loaded(16, 22, 0.38) +
    loaded(36, 24, 0.4) +
    L('M14 38 L22 40 M34 40 L42 42', 1.2, '#8b5a2b');
// le souk : un étal sous un auvent, des sacs d'épices
const sack = (x, y, c) =>
    P(`M${x - 6} ${y + 10} Q${x - 7} ${y} ${x - 4} ${y - 2} L${x + 4} ${y - 2} Q${x + 7} ${y} ${x + 6} ${y + 10}Z`, '#e8d6aa', 1.8) +
    E(x, y - 1, 4.4, 1.8, c, 0, 1.2);
const iconSouk = () =>
    SHADOW(32, 60, 28, 3) +
    L('M8 22 L8 58 M56 22 L56 58', 3) +
    L('M8 22 L8 58 M56 22 L56 58', 1.4, '#c8945e') +
    [0, 1, 2, 3, 4, 5]
        .map(k => P(`M${6 + k * 9} 14 L${15 + k * 9} 14 L${15 + k * 9} 22 Q${10.5 + k * 9} 27 ${6 + k * 9} 22Z`, k % 2 ? '#2f4a8a' : '#e8a03a', 1.6))
        .join('') +
    P('M4 14 L60 14 L56 8 L8 8Z', '#c8453a', 2.2) +
    R(10, 44, 44, 14, 2, '#a8693a', 2) +
    sack(18, 38, '#e8701a') +
    sack(32, 36, '#c8302a') +
    sack(46, 38, '#d9b030') +
    FC(52, 30, 2.4, '#fff8e0', 0.9);
// la tempête de sable : un tourbillon ocre qui avance
const iconStorm = () =>
    P('M0 56 Q20 50 40 54 Q52 56 64 52 L64 64 L0 64Z', '#e8c690', 2) +
    P('M14 50 Q4 48 6 38 Q4 28 14 26 Q16 14 30 14 Q40 8 48 16 Q60 16 60 28 Q64 38 56 44 Q56 52 44 50 Q34 56 24 50 Q18 54 14 50Z', '#d9a868', 2.4) +
    F('M14 44 Q24 48 34 44 Q46 48 54 42 Q50 50 40 49 Q30 52 22 48 Q16 50 14 44Z', '#b8844a', 0.6) +
    L('M20 30 Q28 24 36 30 Q42 34 36 38 Q30 40 30 34', 2, '#b8844a') +
    FE(26, 22, 6, 2.4, '#f0d6a0', 0.7, -10) +
    L('M2 22 L12 22 M0 32 L6 32 M54 8 L62 8 M58 54 L64 54', 2.2, '#c8945e') +
    [
        [8, 56],
        [52, 58],
        [62, 46],
        [4, 42],
    ]
        .map(([x, y]) => FC(x, y, 1.4, '#c8945e'))
        .join('');
Object.assign(ui, {
    oaEnclos: iconEnclos,
    oaAbreuvoir: iconTrough,
    oaNoria: iconNoria,
    oaCaravane: iconCaravan,
    oaSouk: iconSouk,
    oaTempete: iconStorm,
});

// ======================= Yasmine, l'herboriste =======================
const DARK = '#d6a07a',
    DARK_SH = '#bb845e';
const tint = s => s.replaceAll('#f6cfa6', DARK).replaceAll('#e9b48a', DARK_SH).replaceAll('#d9967a', '#9a6a4a').replaceAll('#c98a62', '#9a6a4a');
people.yasmine = () =>
    tint(
        bust(
            '#3f8a6a',
            P('M24 46 L32 56 L40 46', '#e8c060', 1.6) +
                // un bouquet d'herbes dans les bras
                `<g transform="translate(40 50)">${L('M0 12 L-2 0 M3 12 L4 -1 M6 12 L9 1', 1.6, '#4f8a3a')}${E(-2, 0, 2.6, 4, '#7cc04a', -15, 1.2)}${E(4, -1, 2.4, 4, '#5fa83f', 5, 1.2)}${E(9, 1, 2.2, 3.6, '#7cc04a', 25, 1.2)}${FC(1, -3, 1.4, '#b898d8')}${FC(7, -2, 1.3, '#fff')}</g>`,
        ),
    ) +
    tint(face()) +
    // le foulard vert sauge, noué sur le côté, un pan qui tombe sur l'épaule
    P('M14 32 C12 10 52 10 50 32 C48 22 42 18 32 18 C22 18 16 22 14 32Z', '#5fa88a', 2.2) +
    P('M14 30 C12 40 14 48 18 50 C18 42 18 36 18 30Z', '#5fa88a', 2) +
    P('M50 30 Q56 40 52 52 Q48 46 47 34Z', '#4f9878', 2) +
    L('M17 22 C24 16 40 16 47 22', 1.2, '#e8c060') +
    FC(48, 33, 2.2, '#e8c060') +
    P('M28.2 36.2 Q32 40 35.8 36.2 Q32 37.4 28.2 36.2Z', '#b5523f', 1.2);

export const OASIS_ANIMALS_ART = ['dromedary', 'zebu'];
