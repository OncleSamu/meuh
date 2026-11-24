// 1.171 : Les bêtes des Terres d'Asie (cerf sika, ver à soie, poule soie) et leurs 6 produits.
// Animaux : cadre 80 × 80, ombre vers y = 72, tournés vers la droite.
import { C, E, F, FC, FE, HL, L, P, R, SHADOW, animals, items } from '../kit.js';
import { leg, eye } from '../animals.js';
import { milkB } from '../items2.js';

const O = '#3a2618';

// ======================= 1. Cerf sika =======================
// Pelage fauve-châtain tacheté de blanc, croupe claire, bois délicats (variants horns 0..3)
const SK = '#c48046',
    SKD = '#8e5628',
    SKL = '#f6ecd8';
animals.sika = (o = {}) => {
    const h = o.horns || 0;
    const beam = (d, w = 2.6) => L(d, w + 1.5, O) + L(d, w, '#dfd0b0');
    const antlers =
        h === 1
            ? FC(60, 14, 1.5, '#cbb896') + FC(65, 13, 1.5, '#cbb896')
            : h === 3
              ? beam('M60 15 Q50 10 53 3 Q56 0 60 3') + beam('M64 13 Q74 8 71 2 Q68 -1 64 2')
              : beam(`M60 15 Q${h === 2 ? '52 8 53 1' : '55 10 56 4'}`) +
                beam(`M64 13 Q${h === 2 ? '72 7 71 1' : '69 9 68 3'}`) +
                beam(h === 2 ? 'M54 7 Q50 5 49 2 M70 6 Q74 4 75 1' : 'M56 8 Q53 6 52 5', 1.8);
    return (
        SHADOW(38, 74, 25, 3) +
        leg('M23 48 Q19 59 22 70', SKD) +
        leg('M31 50 L31 70', SKD) +
        leg('M50 50 L50 70', SKD) +
        leg('M57 48 Q59 59 57 70', SKD) +
        L('M19 71 L25 71 M28 71 L34 71 M47 71 L53 71 M54 71 L60 71', 2.8, O) +
        // queue claire
        P('M14 35 Q9 36 10 42 Q14 42 16 38Z', SKL, 1.6) +
        // corps élancé + taches blanches emblématiques du cerf sika
        P('M15 37 Q17 31 28 32 L46 31 Q55 31 58 39 Q59 46 51 50 Q40 52 30 49 Q20 50 15 44Z', SK) +
        F('M18 44 Q28 50 40 50 Q50 50 55 45 Q45 48 34 47 Q24 47 18 44Z', SKL, 0.85) +
        [
            [24, 36],
            [30, 35],
            [36, 37],
            [42, 35],
            [27, 40],
            [34, 41],
            [40, 40],
            [46, 39],
        ]
            .map(([x, y]) => FC(x, y, 1.7, SKL, 0.92))
            .join('') +
        HL(32, 34, 6, 1.8, -4, 0.35) +
        // cou fin et tête gracieuse
        P('M47 33 Q52 22 58 16 L66 20 Q63 31 59 42 Q54 45 49 40Z', SK) +
        antlers +
        P('M55 14 Q56 8 61 9 L64 13 Q63 16 61 17Z', SK, 1.7) +
        E(58, 12, 1.5, 2.6, SKL, -30, 1.1) +
        P('M59 14 Q60 10 66 11 Q73 13 76 19 Q78 23 75 24 Q70 25 66 22 Q60 20 59 14Z', SK) +
        FE(74, 20.8, 2.8, 2.4, '#3a2e26', 0.95) +
        eye(65, 15.2) +
        HL(66, 12.6, 2.2, 0.8, -10, 0.45)
    );
};

// ======================= 2. Ver à soie (Bombyx sur feuille de mûrier + cocon) =======================
animals.silkworm = () =>
    SHADOW(40, 72, 26, 3.6) +
    // grande feuille de mûrier vert tendre
    P('M10 62 Q12 46 30 44 Q52 42 68 54 Q66 68 42 70 Q18 70 10 62Z', '#5da84c', 2.2) +
    L('M14 60 Q38 56 64 56 M28 57 L24 48 M42 56 L40 46 M52 56 L54 48', 1.2, '#3c7a32') +
    // cocon de soie nacré posé derrière
    E(23, 52, 9, 6.2, '#fff9e6', -14, 1.8) +
    L('M17 51 Q23 48 29 51 M18 54 Q23 52 28 54', 0.9, '#e0d2a8') +
    // ver à soie dodu, blanc-crème nacré, segments doux et petit sourire
    C(32, 54, 7.2, '#fbf7ea', 2) +
    C(40, 52, 7.6, '#fffdf4', 2) +
    C(48, 50, 7.8, '#fbf7ea', 2) +
    C(56, 48, 8.2, '#fffdf4', 2.1) +
    C(63, 44, 7.6, '#fffdf4', 2.1) +
    // petites pattes
    L('M32 61 L32 64 M40 60 L40 63 M48 58 L48 61 M56 56 L56 59', 2, '#c8b48e') +
    // petite corne douce à l'arrière et yeux mignons
    P('M26 52 Q22 46 25 45 Q28 48 29 52Z', '#f2d49a', 1.4) +
    FC(66.5, 43, 1.6, O) +
    FC(67, 42.4, 0.5, '#fff') +
    FE(65.5, 46.5, 1.8, 1.1, '#f4a4b4', 0.7) +
    L('M64 47 Q66 49 68 47', 1.2, O) +
    HL(46, 46, 5, 1.6, -12, 0.5);

// ======================= 3. Poule soie (petit nuage duveteux à huppe pompon) =======================
animals.silkie = (o = {}) => {
    const crest = o.plume || 0;
    return (
        SHADOW(40, 73, 22, 3.2) +
        // pattes gris-bleuté emplumées
        L('M34 58 L34 70 M46 58 L46 70', 2.6, '#4a5568') +
        L('M30 70 L38 70 M42 70 L50 70', 2.2, '#4a5568') +
        // corps tout rond en nuage de soie blanche
        C(24, 48, 10, '#f7f4ec', 2) +
        C(36, 48, 14, '#fffdf8', 2.2) +
        C(48, 46, 12, '#fffdf8', 2.2) +
        C(30, 38, 10, '#fffdf8', 2) +
        C(44, 38, 11, '#fffdf8', 2) +
        // queue en pompon
        C(17, 41, 7.5, '#f2eee4', 1.8) +
        C(21, 35, 6.5, '#fffdf8', 1.8) +
        // tête et grosse huppe soyeuse
        C(56, 33, 9.5, '#fffdf8', 2.2) +
        C(54, 24, crest ? 8.5 : 7, '#fffdf8', 2) +
        C(60, 26, crest ? 7.5 : 6, '#f6f2e8', 1.8) +
        // petit bec gris-bleu et joues bleu turquoise emblématiques de la poule soie
        P('M64 33 L72 35 L64 38Z', '#5a687c', 1.6) +
        FC(61, 36.5, 2.2, '#5aa4c8', 0.9) +
        eye(60.5, 32) +
        // aile duveteuse
        P('M32 45 Q40 42 46 50 Q38 56 30 52Z', '#efeae0', 1.6) +
        HL(38, 36, 5, 2, -10, 0.55)
    );
};

// ======================= 6 produits d'élevage des Terres d'Asie =======================
items.sikaMilk = () => milkB('#c48046', '#f6efe0', 'sika', '#fffdf6', 'jug');
items.velvetAntler = () =>
    SHADOW(32, 58, 22, 3) +
    P('M12 50 Q24 44 30 28 Q34 16 44 12 Q48 12 46 18 Q38 24 36 32 Q44 26 52 24 Q56 26 52 32 Q40 38 32 46 Q22 54 14 54Z', '#b88258', 2.2) +
    F('M16 50 Q26 42 32 28 Q36 18 44 15 Q38 26 34 36 Q24 48 16 50Z', '#d6a47a', 0.7) +
    HL(36, 22, 3, 1.4, -40, 0.5);

items.silkThread = () =>
    SHADOW(32, 58, 18, 3) +
    R(16, 12, 32, 6, 3, '#a87442', 1.8) +
    R(16, 46, 32, 6, 3, '#a87442', 1.8) +
    R(20, 18, 24, 28, 4, '#fff8e8', 2) +
    L('M20 24 L44 24 M20 30 L44 30 M20 36 L44 36 M20 42 L44 42', 1.2, '#e2d2b0') +
    L('M44 38 Q54 40 52 50 Q50 56 42 54', 1.8, '#f4e8cc') +
    HL(25, 32, 2.2, 10, 0, 0.65);

items.goldenSilk = () =>
    SHADOW(32, 58, 18, 3) +
    R(16, 12, 32, 6, 3, '#8a5228', 1.8) +
    R(16, 46, 32, 6, 3, '#8a5228', 1.8) +
    R(20, 18, 24, 28, 4, '#f4c644', 2) +
    L('M20 24 L44 24 M20 30 L44 30 M20 36 L44 36 M20 42 L44 42', 1.2, '#c89218') +
    L('M44 38 Q54 40 52 50 Q50 56 42 54', 2, '#f4c644') +
    HL(25, 32, 2.4, 10, 0, 0.75) +
    FC(48, 20, 2, '#fff5a0', 0.9);

items.silkieEgg = () =>
    SHADOW(32, 58, 18, 3) +
    P('M20 42 Q20 20 32 16 Q44 20 44 42 Q44 54 32 54 Q20 54 20 42Z', '#f7ece0', 2.2) +
    FE(37, 42, 5, 9, '#e8d4c0', 0.55, 8) +
    HL(26, 30, 3, 6, -15, 0.65);

items.silkieFeather = () =>
    SHADOW(32, 58, 20, 3) +
    P('M14 52 Q18 26 48 12 Q52 28 38 42 Q26 52 14 52Z', '#fffdf6', 2) +
    P('M20 46 Q24 30 44 18 Q44 30 34 38 Q26 44 20 46Z', '#f2ece0', 0.9) +
    L('M12 54 Q28 36 48 14', 1.6, '#c8beb0') +
    L('M24 40 L20 34 M32 32 L28 24 M40 24 L37 18', 1, '#d8d0c4');
