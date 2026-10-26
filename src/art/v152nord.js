// 1.52 : les bêtes du Grand Nord (le renne, le bœuf musqué, le lagopède) et leurs produits.
// Animaux : cadre 80 × 80, ombre vers y = 72, tournés vers la droite.
import { C, E, F, FC, FE, HL, L, P, SHADOW, animals, items } from './kit.js';
import { leg, eye } from './animals.js';
import { milkB } from './items2.js';

const O = '#3a2618';

// ======================= le renne =======================
// pelage brun-gris, collerette crème, bois branchus ; coat 1 = clair (presque blanc), 2 = sombre ; horns 1 = bois tombés, 2 = grands bois
const RN = '#a58f78',
    RND = '#7c6850',
    RNL = '#ece3d2';
animals.reindeer = (o = {}) => {
    const body = o.coat === 1 ? '#d9cfbf' : o.coat === 2 ? '#7a6652' : RN;
    const dark = o.coat === 1 ? '#b3a590' : o.coat === 2 ? '#54463a' : RND;
    const h = o.horns || 0;
    const beam = (d, w = 3.2) => L(d, w + 1.6, O) + L(d, w, '#dcc9a0');
    const antlers =
        h === 1
            ? FC(60, 14, 1.6, '#c9b690') + FC(66, 14, 1.6, '#c9b690')
            : beam(`M61 15 Q${h === 2 ? '54 9 56 3' : '56 9 58 3'}`) +
              beam(`M65 14 Q${h === 2 ? '72 7 68 3' : '70 8 67 2'}`) +
              beam(h === 2 ? 'M56.5 8 Q51 7 50 3 M56 5 Q60 5 61 2' : 'M57 7 Q53 6 52 3', 2.4) +
              beam(h === 2 ? 'M70 6 Q75 6 76 2 M69.5 4 Q66 4 65 2' : 'M69 7 Q73 6 74 3', 2.4);
    return (
        SHADOW(38, 74, 24, 3.2) +
        leg('M24 52 L23 70', dark) +
        leg('M32 54 L32 70', dark) +
        leg('M50 54 L50 70', dark) +
        leg('M58 52 L59 70', dark) +
        L('M20 71 L27 71 M29 71 L36 71 M47 71 L54 71 M56 71 L63 71', 3.4, O) +
        // la queue : une petite touffe claire
        P('M14 40 Q9 40 10 46 Q14 48 16 44Z', RNL, 1.6) +
        // le corps, la croupe claire, le ventre pâle
        P('M15 44 Q13 32 26 31 L46 30 Q60 30 60 42 Q60 56 46 57 L26 57 Q15 56 15 44Z', body) +
        F('M17 50 Q32 58 50 56 Q58 52 59 46 Q48 54 34 54 Q22 54 17 50Z', RNL, 0.75) +
        F('M20 36 Q32 31 46 33 Q34 35 20 36Z', dark, 0.4) +
        HL(30, 37, 7, 2.4, -6, 0.4) +
        // le cou et la collerette crème, la tête
        P('M48 34 Q54 24 58 20 L67 25 Q65 36 60 46 Q54 48 48 42Z', body) +
        P('M49 38 Q56 33 60 28 Q64 38 62 46 Q57 52 50 47 Q46 43 49 38Z', RNL, 1.8) +
        antlers +
        P('M56 17 Q57 11 62 11 L66 14 Q66 18 64 20Z', body, 1.8) +
        E(59.5, 14.5, 1.8, 3, dark, -35, 1.3) +
        P('M60 18 Q60 13 66 14 Q73 15 76 20 Q78 25 75 28 Q71 30 66 27 Q61 25 60 18Z', body) +
        FE(73, 24.4, 3.7, 3.4, '#3a2e26', 0.95) +
        FC(75, 23.4, 0.9, '#c8a98c') +
        eye(66, 19.6) +
        HL(66, 16.4, 2.6, 1, -10, 0.45)
    );
};

// ======================= le bœuf musqué =======================
// brun presque noir, la jupe de longs poils qui tombe jusqu'aux sabots, la selle pâle, les cornes qui descendent puis se relèvent ;
// coat 1 = clair, 2 = très sombre ; horns 1 = courtes, 2 = grandes
const MX = '#4e3a2b',
    MXD = '#2e2118',
    MXL = '#d2bf93';
animals.muskox = (o = {}) => {
    const body = o.coat === 1 ? '#6e5640' : o.coat === 2 ? '#2e2118' : MX;
    const dark = o.coat === 2 ? '#1c140e' : MXD;
    const h = o.horns || 0;
    const horn = d => L(d, 4.6, O) + L(d, 2.4, '#efe1bd');
    const horns =
        h === 1
            ? horn('M60 24 Q56 30 58 34') + horn('M70 24 Q74 30 72 34')
            : horn('M59 23 Q50 28 52 38 Q54 40 56 34') + horn('M71 23 Q80 28 78 38 Q76 40 74 34');
    const strands = (pts, c) => pts.map(([x, y, l]) => L(`M${x} ${y} Q${x - 1} ${y + l / 2} ${x + 0.6} ${y + l}`, 1.7, c)).join('');
    return (
        SHADOW(40, 74, 27, 3.6) +
        // les pattes courtes, claires aux sabots, cachées par la jupe
        leg('M24 60 L24 71', MXL) +
        leg('M34 60 L34 71', MXL) +
        leg('M50 60 L50 71', MXL) +
        leg('M58 60 L58 71', MXL) +
        L('M21 71 L27 71 M31 71 L37 71 M47 71 L53 71 M55 71 L61 71', 3, O) +
        P('M12 44 Q8 46 9 53 Q13 54 15 49Z', dark, 1.6) +
        // le corps trapu, la bosse du garrot, la selle pâle
        P('M12 46 Q10 32 24 31 L38 28 Q52 24 58 32 Q64 42 60 54 Q56 62 44 62 L22 62 Q12 60 12 46Z', body) +
        F('M36 28 Q46 25 54 29 Q50 36 40 36Z', MXL, 0.9) +
        // la jupe de longs poils
        P('M14 50 Q12 62 14 68 L20 66 L24 69 L30 66 L36 69 L42 66 L48 69 L54 66 L58 68 Q60 60 60 52 Q38 60 14 50Z', dark, 2) +
        strands(
            [
                [18, 54, 12],
                [24, 56, 12],
                [30, 57, 11],
                [36, 57, 12],
                [42, 57, 11],
                [48, 56, 12],
                [54, 54, 12],
            ],
            body,
        ) +
        HL(28, 37, 8, 2.4, -6, 0.2) +
        // la tête basse, le front massif, le museau clair
        horns +
        P('M54 28 Q52 40 56 52 Q64 54 68 48 Q76 44 76 36 Q75 26 66 22 Q58 21 54 28Z', body, 2.2) +
        P('M62 20 Q68 16 74 22 Q70 26 62 24Z', dark, 1.6) +
        FE(72, 42, 4.6, 4, MXL, 0.95) +
        FC(71, 42, 0.8, O) +
        FC(74, 42, 0.8, O) +
        eye(66, 34) +
        P('M55 30 Q50 32 51 38 Q55 36 57 33Z', dark, 1.4)
    );
};

// ======================= le lagopède =======================
// la perdrix des neiges : ronde, pattes emplumées, sourcil rouge ; coat 0 = robe blanche d'hiver, 1 = robe brune d'été (queue noire dans les deux)
animals.ptarmigan = (o = {}) => {
    const summer = o.coat === 1;
    const b = summer ? '#a9824f' : '#fbfcfd',
        bd = summer ? '#7a5a34' : '#d6e0ea',
        bl = summer ? '#c7a674' : '#ffffff';
    return (
        SHADOW(38, 72, 20, 3) +
        // les pattes emplumées : de petites moufles
        E(32, 66, 4.6, 5.6, bl, 0, 1.8) +
        E(46, 66, 4.6, 5.6, bl, 0, 1.8) +
        L('M28 71 L27 74 M32 71 L32 74 M36 71 L37 74', 1.4) +
        L('M42 71 L41 74 M46 71 L46 74 M50 71 L51 74', 1.4) +
        // la queue courte, bordée de noir
        P('M15 42 Q8 38 7 46 Q10 54 20 54Z', '#2a2622', 1.8) +
        P('M16 41 Q10 40 10 45 Q12 50 19 51Z', bd, 0) +
        // le corps rond
        P('M14 46 Q14 28 36 28 Q58 28 58 46 Q58 64 36 64 Q14 64 14 46Z', b) +
        F('M18 54 Q36 66 56 52 Q50 60 36 62 Q22 62 18 54Z', bd, 0.7) +
        // l'aile repliée
        P('M20 42 Q34 34 46 40 Q42 54 28 54 Q20 52 20 42Z', bd, 1.8) +
        (summer
            ? [
                  [26, 46],
                  [34, 44],
                  [40, 48],
                  [30, 51],
              ]
                  .map(([x, y]) => FC(x, y, 1.2, '#6a4a28'))
                  .join('')
            : L('M26 46 Q34 42 42 46 M26 50 Q34 47 40 50', 1, 'rgba(120,150,180,.55)')) +
        HL(30, 36, 6, 2.2, -12, 0.55) +
        // la tête, le sourcil rouge, le bec noir
        P('M48 40 Q46 26 56 24 Q66 24 66 34 Q66 42 58 44 Q52 44 48 40Z', b) +
        FE(58, 25.4, 5, 2.6, '#d83a2c', 0.95) +
        P('M64 31 L72 34 L64 37Z', '#2a2622', 1.4) +
        eye(60, 32) +
        HL(55, 27, 3, 1.2, -10, 0.5)
    );
};

// ======================= les produits =======================
const eggLagopede = () =>
    SHADOW(32, 58, 14, 2.6) +
    P('M32 8 Q48 12 48 36 Q48 54 32 54 Q16 54 16 36 Q16 12 32 8Z', '#e6d6a8') +
    [
        [26, 22, 2.4],
        [38, 28, 2.8],
        [28, 36, 3],
        [40, 42, 2.2],
        [24, 46, 2],
        [34, 18, 1.6],
        [32, 48, 1.8],
    ]
        .map(([x, y, r]) => FC(x, y, r, '#8a5a30', 0.85))
        .join('') +
    F('M22 18 Q24 12 30 10 Q24 16 24 24Z', '#fff', 0.55);
const yarn3 = (c, d) =>
    SHADOW(30, 58, 22, 3) +
    C(30, 34, 22, c) +
    L('M12 24 Q30 34 48 22 M10 34 Q30 46 52 32 M14 46 Q30 52 46 46 M20 14 Q16 34 22 54 M34 12 Q42 34 36 56', 1.4, d) +
    L('M16 18 Q14 24 18 26 M44 40 Q48 44 44 48 M24 48 Q22 54 26 56', 1.2, d) +
    C(30, 34, 22, 'none') +
    L('M50 44 Q58 52 54 58 Q50 62 58 62', 1.8, d) +
    HL(20, 24, 4, 2, -30, 0.6);
// le bois de renne : un bois mué, deux andouillers et un empan
const antlerItem = () =>
    SHADOW(32, 58, 22, 3) +
    L('M14 52 Q12 30 24 18 Q30 12 40 10', 7.6, O) +
    L('M14 52 Q12 30 24 18 Q30 12 40 10', 5.2, '#dcc9a0') +
    L('M17 38 Q12 30 8 26', 6, O) +
    L('M17 38 Q12 30 8 26', 3.6, '#dcc9a0') +
    L('M24 22 Q32 22 36 28', 6, O) +
    L('M24 22 Q32 22 36 28', 3.6, '#dcc9a0') +
    L('M40 10 Q46 8 50 12 M40 10 Q44 4 50 4', 5.4, O) +
    L('M40 10 Q46 8 50 12 M40 10 Q44 4 50 4', 3.2, '#dcc9a0') +
    L('M14 52 Q15 36 22 24', 1.4, '#b89c6c') +
    E(14, 54, 6.4, 3.2, '#b89c6c', 0, 1.8) +
    HL(22, 22, 3, 1.2, -50, 0.6);
Object.assign(items, {
    reindeerMilk: () => milkB('#8a7a68', '#f4efe4', 'reindeer', '#fffdf4', 'jug'),
    antler: antlerItem,
    qiviut: () => yarn3('#6a5444', '#3e2e22'),
    ptarmiganEgg: eggLagopede,
});
export const NORD_BEASTS_ART = ['reindeer', 'muskox', 'ptarmigan'];
