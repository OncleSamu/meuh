// 1.10 (pêche) : sept nouveaux poissons de l'étang et leurs recettes.
import { C, E, F, FC, FE, HL, L, P, R, SHADOW, leaf, items, ui } from './kit.js';
import { plate, bowl, woodBoard, steamF, fishBody2 } from './items2.js';
import { cocotte } from './v131.js';

const O = '#3a2618';

// ---- petits morceaux ----
const fishMini = (x, y, s, body, belly = '#f4f1ea', rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M-14 0 Q-8 -8 4 -7 Q12 -6 14 -1 L20 -6 L19 0 L20 6 L14 1 Q12 6 4 7 Q-8 8 -14 0Z', body, 2.2 / s) +
    F('M-12 1 Q-4 7 6 6 Q12 4 13 1Z', belly, 0.85) +
    FC(-8, -1.5, 1.4, O) +
    `</g>`;
const lemonSlice = (x, y, r = 5) =>
    C(x, y, r, '#f2c23a', 1.6) +
    C(x, y, r - 1.6, '#fbe98a', 0) +
    L(`M${x - r + 2} ${y} L${x + r - 2} ${y} M${x} ${y - r + 2} L${x} ${y + r - 2}`, 0.8, '#f2c23a');
const smoke = (x = 30) => L(`M${x - 4} 24 Q${x - 8} 20 ${x - 4} 16 M${x + 4} 24 Q${x} 20 ${x + 4} 16`, 1.4, 'rgba(160,160,160,.8)');
// une écrevisse vue de dessus, petite (pour les plats)
const crayMini = (x, y, s = 1, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M-8 -2 Q-12 -8 -16 -6 Q-14 -2 -10 0 Q-14 2 -16 6 Q-12 8 -8 2Z', '#d9482b', 1.4 / s) +
    P('M-8 -3 Q0 -6 8 -3 Q12 0 8 3 Q0 6 -8 3Z', '#e2552f', 1.6 / s) +
    P('M8 -2 L14 -4 L14 4 L8 2Z', '#c83c22', 1.4 / s) +
    L('M-2 -4 L-2 4 M3 -4 L3 4', 0.8, '#9e2a16') +
    `</g>`;

// ================= les poissons =================
const NEW_FISH = {
    // ablette : petite, fine, argent bleuté, une bande brillante
    bleak:
        SHADOW(32, 54, 22, 2.6) +
        P('M26 28 Q31 21 37 27Z', '#aebccb', 1.6) +
        P('M30 40 Q33 46 38 40Z', '#aebccb', 1.6) +
        P('M52 32 L61 24 L59 34 L61 44 L52 36', '#aebccb', 2) +
        P('M6 34 Q14 26 32 26 Q46 26 53 32 Q46 41 32 41 Q14 42 6 34Z', '#d6e2ea') +
        F('M8 31 Q20 26 34 26.6 Q46 27 51 31 Q36 29 22 31 Q14 32 8 33Z', '#6f9fb0', 0.9) +
        L('M12 34 L50 33', 1.6, '#ffffff') +
        F('M9 36 Q20 41 32 40 Q44 39 50 35 Q40 38 30 38 Q18 38 9 36Z', '#f4f8fa', 0.9) +
        P('M6 34 Q14 26 32 26 Q46 26 53 32 Q46 41 32 41 Q14 42 6 34Z', 'none') +
        C(13, 32, 2.6, '#ffffff', 1.3) +
        FC(13.5, 32, 1.3, O) +
        HL(26, 29, 5, 1.2, -4, 0.6),
    // tanche : trapue, vert olive doré, l'oeil rouge, nageoires arrondies
    tench:
        fishBody2(
            '#6f8a3a',
            '#d8d68a',
            '#4f6a2a',
            [
                [22, 26],
                [30, 25],
                [38, 26],
                [26, 31],
                [34, 31],
                [42, 31],
            ]
                .map(([x, y]) => `<path d="M${x - 3} ${y} Q${x} ${y - 2.5} ${x + 3} ${y}" fill="none" stroke="#4f6a2a" stroke-width="1.1"/>`)
                .join('') + L('M7 37 Q4 40 5 43', 1.4),
            '#4f6a2a',
            'M6 34 Q12 18 32 18 Q48 18 52 30 L60 20 Q63 34 60 48 L52 38 Q48 50 32 50 Q12 50 6 34Z',
        ) +
        FC(15.6, 30, 1.9, '#e8364b') +
        FC(15.8, 30, 0.9, O),
    // lotte de rivière : longue, brune marbrée, un seul barbillon au menton
    burbot:
        SHADOW(32, 56, 27, 3) +
        P('M22 26 Q36 20 54 26 L54 29 Q36 25 22 29Z', '#6b5530', 1.6) +
        P('M24 42 Q40 46 54 40 L54 37 Q40 42 24 39Z', '#6b5530', 1.6) +
        P('M4 34 Q8 24 20 25 Q40 26 54 30 L62 26 Q63 34 62 42 L54 38 Q40 43 20 43 Q8 44 4 34Z', '#a8884a') +
        F('M6 37 Q14 42 24 41 Q40 40 52 37 Q40 40 24 39 Q14 39 6 37Z', '#e6d8a6', 0.9) +
        [
            [16, 30, 2.4],
            [24, 32, 2],
            [30, 29, 2.6],
            [38, 33, 2],
            [44, 30, 2.2],
            [50, 34, 1.6],
            [20, 36, 1.6],
            [34, 36, 1.8],
        ]
            .map(([x, y, r]) => FE(x, y, r * 1.3, r, '#6b5530', 0.9))
            .join('') +
        P('M4 34 Q8 24 20 25 Q40 26 54 30 L62 26 Q63 34 62 42 L54 38 Q40 43 20 43 Q8 44 4 34Z', 'none') +
        L('M6 38 Q5 44 8 48', 1.8) +
        C(11, 31, 2.6, '#ffffff', 1.3) +
        FC(11.5, 31, 1.3, O) +
        HL(28, 27, 6, 1.4, -4, 0.5),
    // sandre : gris-vert à bandes sombres, double nageoire épineuse, gros oeil vitreux
    zander:
        SHADOW(32, 56, 25, 3) +
        P('M18 22 L20 12 L24 20 L27 11 L30 20 L33 12 L35 21Z', '#8a9470', 1.6) +
        P('M38 21 Q44 13 50 25Z', '#8a9470', 1.6) +
        P('M30 46 Q34 54 40 46Z', '#8a9470', 1.6) +
        P('M4 34 Q12 21 30 21 Q46 21 52 30 L61 22 L59 34 L61 46 L52 38 Q46 47 30 47 Q12 47 4 34Z', '#a9b48c') +
        F('M6 36 Q16 45 30 45 Q44 45 50 38 Q40 42 30 42 Q16 42 6 36Z', '#eef0dc', 0.9) +
        [20, 28, 36, 44].map(x => L(`M${x} 23 Q${x + 2} 30 ${x} 38`, 3.2, '#5e6a4a')).join('') +
        P('M4 34 Q12 21 30 21 Q46 21 52 30 L61 22 L59 34 L61 46 L52 38 Q46 47 30 47 Q12 47 4 34Z', 'none') +
        P('M52 30 L61 22 L59 34 L61 46 L52 38', '#8a9470', 2) +
        C(13, 29, 3.8, '#e8f0f2', 1.4) +
        FC(13.6, 29, 1.9, O) +
        FC(12.6, 28, 0.8, '#fff') +
        L('M4 35 L10 36', 1.4) +
        HL(26, 25, 6, 1.5, -6, 0.5),
    // saumon : grand, dos bleu ardoise, flanc argent rosé, petits points noirs, mâchoire crochue
    salmon:
        SHADOW(32, 57, 27, 3) +
        P('M24 21 Q30 11 38 20Z', '#5f7486', 1.8) +
        P('M44 22 Q47 18 49 24Z', '#5f7486', 1.4) +
        P('M30 47 Q34 54 40 47Z', '#8aa0b0', 1.8) +
        P('M52 30 L62 20 L59 34 L62 48 L52 38', '#5f7486', 2) +
        P('M3 32 Q10 19 32 19 Q46 19 53 30 Q46 49 32 49 Q12 49 3 36Z', '#d4dde4') +
        F('M5 30 Q12 20 32 20 Q46 20 52 29 Q40 26 30 27 Q16 27 5 32Z', '#5f7486', 0.95) +
        F('M8 36 Q24 33 50 34 Q40 42 26 42 Q14 41 8 38Z', '#f6b8bc', 0.8) +
        F('M10 41 Q22 48 34 47 Q44 45 49 39 Q38 44 28 44 Q16 44 10 41Z', '#f8f4f2', 0.9) +
        [
            [24, 24],
            [30, 22.5],
            [36, 23],
            [42, 25.5],
            [27, 28],
            [34, 27],
            [40, 29],
            [46, 28],
        ]
            .map(([x, y]) => FC(x, y, 1.1, O))
            .join('') +
        P('M3 32 Q10 19 32 19 Q46 19 53 30 Q46 49 32 49 Q12 49 3 36Z', 'none') +
        L('M3 32 Q1 35 5 37 M3 36 L9 37', 1.8) +
        C(13, 29, 3, '#ffffff', 1.3) +
        FC(13.6, 29, 1.5, O) +
        L('M20 26 Q23 34 20 42', 1.6, 'rgba(58,38,24,.5)') +
        HL(28, 31, 7, 1.6, -4, 0.6),
    // esturgeon : long, gris bleu, museau pointu, rangées de plaques osseuses, queue de requin
    sturgeon:
        SHADOW(32, 56, 28, 3) +
        P('M50 30 L62 16 L58 32Z', '#5f7486', 2) +
        P('M50 36 L60 42 L56 34Z', '#5f7486', 1.8) +
        P('M36 26 Q42 18 46 27Z', '#5f7486', 1.6) +
        P('M2 34 Q8 28 16 27 Q34 24 52 29 Q56 32 52 37 Q34 42 16 41 Q8 40 2 34Z', '#8fa3b4') +
        F('M6 36 Q16 40 30 40 Q44 39 52 36 Q40 38 30 38 Q16 38 6 36Z', '#e6ecf0', 0.9) +
        [14, 21, 28, 35, 42]
            .map(
                x =>
                    P(`M${x} 26.5 L${x + 2.2} 24.4 L${x + 4.4} 26.5 L${x + 2.2} 28.6Z`, '#eef3f6', 1) +
                    P(`M${x + 1} 33 L${x + 3} 31.4 L${x + 5} 33 L${x + 3} 34.6Z`, '#eef3f6', 1),
            )
            .join('') +
        P('M2 34 Q8 28 16 27 Q34 24 52 29 Q56 32 52 37 Q34 42 16 41 Q8 40 2 34Z', 'none') +
        L('M8 38 L7 42 M10 38.6 L10 43', 1.2) +
        C(11, 31.5, 2.2, '#ffffff', 1.2) +
        FC(11.4, 31.5, 1.1, O) +
        HL(30, 27, 6, 1.2, -4, 0.5),
    // écrevisse : rouge brun, deux grosses pinces, la queue en éventail
    crayfish:
        SHADOW(32, 58, 22, 3) +
        L('M26 22 Q20 10 10 6 M30 21 Q28 8 22 2', 1.4) +
        // les pattes
        L('M24 36 L14 42 M28 38 L20 46 M36 38 L44 46 M40 36 L50 42', 2) +
        // les pinces
        P('M24 26 Q16 22 12 14 Q8 8 4 12 Q2 18 8 20 Q14 22 22 30Z', '#c83c22', 2) +
        P('M4 12 Q10 6 14 10 Q10 12 8 16Z', '#e2552f', 1.4) +
        P('M40 26 Q48 22 52 14 Q56 8 60 12 Q62 18 56 20 Q50 22 42 30Z', '#c83c22', 2) +
        P('M60 12 Q54 6 50 10 Q54 12 56 16Z', '#e2552f', 1.4) +
        // le corps et la queue
        P('M24 28 Q32 20 40 28 Q42 36 38 40 L26 40 Q22 36 24 28Z', '#d9482b') +
        P('M26 40 L38 40 L37 46 L27 46Z', '#e2552f', 1.8) +
        P('M27 46 L37 46 L36 51 L28 51Z', '#e2552f', 1.8) +
        P('M28 51 L36 51 Q42 56 40 60 Q32 58 24 60 Q22 56 28 51Z', '#c83c22', 1.8) +
        C(29, 25, 1.8, '#fff', 1) +
        C(35, 25, 1.8, '#fff', 1) +
        FC(29.2, 25, 0.9, O) +
        FC(35.2, 25, 0.9, O) +
        HL(30, 31, 3, 1.4, -20, 0.55),
};

// ================= les recettes =================
const NEW_DISH = {
    // friture d'ablettes : un cornet de papier, les petits poissons qui dépassent
    bleakFry:
        SHADOW(32, 60, 14, 2.4) +
        [
            [22, 16, -30],
            [30, 12, -8],
            [38, 15, 20],
            [26, 20, -14],
            [35, 20, 10],
        ]
            .map(
                ([x, y, r]) =>
                    `<g transform="translate(${x} ${y}) rotate(${r - 90})">` +
                    P('M-9 0 Q-5 -4 3 -3.4 Q7 -2.6 8 0 L11 -3 L10.4 0 L11 3 L8 0.6 Q6 3 2 3.4 Q-5 4 -9 0Z', '#d9902a', 1.4) +
                    FC(-6, -0.8, 0.8, O) +
                    `</g>`,
            )
            .join('') +
        P('M14 22 L50 22 L33 60 Q32 61 31 60Z', '#f2e3b0') +
        L('M20 28 L44 28', 1.2, '#c9b07a') +
        P('M17 22 L47 22 L46 26 L18 26Z', '#e8364b', 1.6) +
        lemonSlice(48, 34, 5),
    // gratin d'écrevisses : un plat à gratin doré, les écrevisses qui dépassent
    crayfishGratin:
        SHADOW(32, 57, 27, 3) +
        P('M6 34 L58 34 L54 52 Q32 56 10 52Z', '#f0e6d2') +
        L('M8 42 Q32 47 56 42', 1.6, '#5aa9e6') +
        E(32, 34, 26, 7, '#f2c25a') +
        [
            [20, 33],
            [30, 31],
            [40, 34],
            [26, 36],
            [44, 31],
        ]
            .map(([x, y]) => FE(x, y, 3, 1.6, '#c8892a', 0.8))
            .join('') +
        crayMini(22, 31, 0.7, -20) +
        crayMini(40, 32, 0.7, 200) +
        E(32, 34, 26, 7, 'none', 0, 2.5) +
        R(1, 36, 7, 4, 2, '#f0e6d2', 1.8) +
        R(56, 36, 7, 4, 2, '#f0e6d2', 1.8) +
        HL(14, 44, 2, 4, -15, 0.6),
    // bisque d'écrevisses : un bol orangé, une pince et la crème
    crayfishBisque: bowl('#e8762a', 32) + L('M18 32 Q26 28 32 32 Q38 36 46 32', 2.2, '#fbe8d0') + crayMini(40, 30, 0.8, 30) + steamF,
    // tanche aux herbes : sur l'assiette, persil et beurre
    tenchHerbs:
        plate(46) +
        fishMini(30, 40, 1.3, '#7f9a46', '#e8e6a6') +
        [22, 30, 38].map(x => leaf(x, 34, 4, -70, '#3f8f2e', 0.55)).join('') +
        R(42, 42, 8, 5, 1.6, '#f6dc6a', 1.4) +
        leaf(12, 44, 6, -160, '#4caf50', 0.5),
    // lotte au cidre : une cocotte, morceaux blancs et pommes
    burbotCider: cocotte(
        '#e8c878',
        [16, 26, 36].map(x => R(x, 26, 9, 6, 3, '#f6eedc', 1.4)).join('') +
            C(46, 29, 3.4, '#e8364b', 1.2) +
            FC(45, 28, 1, '#fff', 0.7) +
            C(12, 30, 2.8, '#9be06b', 1.2),
    ),
    // pochouse : la matelote bourguignonne de l'étang, au cidre
    pochouse: cocotte(
        '#d8a85a',
        [14, 24, 34].map((x, k) => R(x, 26, 8, 6, 3, ['#f6eedc', '#e6d8a6', '#c9b07a'][k], 1.4)).join('') +
            FC(46, 30, 2.6, '#f2e6f6') +
            FC(43, 27, 1.8, '#f2e6f6') +
            leaf(10, 28, 4, -150, '#3f8f2e', 0.5),
    ),
    // sandre aux poireaux : un gros filet doré sur une fondue de poireaux à la crème
    zanderLeeks:
        plate(46) +
        P('M8 45 Q10 37 32 37 Q54 37 56 45 Q32 52 8 45Z', '#eef0c8') +
        [12, 18, 46, 52].map(x => E(x, 43, 3, 1.8, '#9be06b', 0, 1.1)).join('') +
        P('M14 40 Q16 28 34 28 Q50 29 50 38 Q46 45 32 45 Q16 45 14 40Z', '#f8f0e0', 2.2) +
        F('M16 32 Q24 28 34 28.6 Q46 29 49 34 Q38 31 30 31.4 Q20 32 16 35Z', '#d9a64a', 0.9) +
        L('M24 33 Q26 38 24 43 M32 32 Q34 38 32 44 M40 33 Q42 38 40 43', 1.1, '#e8d8b8') +
        leaf(32, 27, 5, -90, '#4caf50', 0.5),
    // terrine de l'étang : une tranche rose et blanche sur la planche
    pondTerrine:
        woodBoard() +
        R(10, 26, 30, 18, 2, '#f6eedc') +
        F('M11 32 L39 32 L39 38 L11 38Z', '#f2a0a8') +
        R(10, 26, 30, 18, 2, 'none') +
        P('M42 28 L54 30 L54 46 L42 44Z', '#f6eedc', 2) +
        F('M42.8 33 L53.2 35 L53.2 40 L42.8 38Z', '#f2a0a8') +
        leaf(16, 24, 4, -60, '#4caf50', 0.5),
    // saumon fumé : de belles tranches orangées sur la planche
    smokedSalmon:
        woodBoard() +
        [12, 22, 32].map(x => P(`M${x} 44 Q${x + 2} 30 ${x + 12} 28 Q${x + 18} 32 ${x + 16} 44Z`, '#f28a5a', 2)).join('') +
        [12, 22, 32].map(x => L(`M${x + 6} 42 Q${x + 8} 34 ${x + 14} 32`, 1.2, '#fbd0b0')).join('') +
        lemonSlice(52, 38, 5) +
        smoke(30),
    // pavé de saumon au miel et citron
    salmonSteak:
        plate(46) +
        R(18, 32, 26, 14, 4, '#f28a5a', 2.2) +
        L('M24 33 L22 45 M31 33 L29 45 M38 33 L36 45', 1.2, '#fbd0b0') +
        F('M19 33 L43 33 L43 36 L19 36Z', '#c8892a', 0.7) +
        P('M20 30 Q28 26 34 30', 'none') +
        L('M22 31 Q30 28 40 31', 2, '#f2c23a') +
        lemonSlice(50, 42, 5) +
        leaf(12, 42, 6, -160, '#4caf50', 0.5),
    // tartare de saumon : un petit cercle de dés orangés, citron et ciboulette
    salmonTartare:
        plate(46) +
        E(32, 42, 13, 5, '#e8762a') +
        P('M19 42 L19 34 Q32 30 45 34 L45 42 Q32 47 19 42Z', '#f28a5a') +
        [
            [24, 36],
            [30, 34],
            [36, 35],
            [41, 37],
            [27, 39],
            [34, 39],
        ]
            .map(([x, y]) => R(x - 2, y - 2, 4, 4, 1, '#fbb08a', 1))
            .join('') +
        L('M28 30 L36 26 M30 31 L38 28', 1.6, '#3f8f2e') +
        lemonSlice(50, 44, 4.5),
    // caviar : une petite boîte ronde ouverte, pleine de grains noirs, une cuillère de nacre
    caviar:
        SHADOW(32, 58, 22, 3) +
        E(30, 22, 20, 8, '#f2c23a', -8) +
        E(30, 22, 15, 5, '#e0a82a', -8, 1.2) +
        HL(22, 20, 5, 1.4, -8, 0.6) +
        P('M10 36 L54 36 L52 50 Q32 56 12 50Z', '#c9d3dc') +
        L('M11 42 Q32 47 53 42', 1.4, '#9aa6b2') +
        E(32, 36, 22, 7, '#2a2a33') +
        [
            [20, 35],
            [26, 33],
            [32, 34],
            [38, 33],
            [44, 35],
            [24, 38],
            [30, 38],
            [36, 38],
            [42, 38],
            [17, 37],
            [47, 37],
        ]
            .map(([x, y]) => FC(x, y, 1.2, '#6a6a7a'))
            .join('') +
        E(32, 36, 22, 7, 'none', 0, 2.5) +
        P('M44 30 Q54 28 58 22 Q60 18 56 18 Q50 20 42 28Z', '#f6eef0', 1.6) +
        HL(16, 44, 1.6, 4, -15, 0.6),
    // esturgeon fumé : un gros tronçon sur la planche
    smokedSturgeon:
        woodBoard() +
        P('M8 40 Q10 30 22 29 L48 29 Q56 32 56 40 Q54 46 48 46 L22 46 Q10 46 8 40Z', '#c87a3a') +
        [18, 26, 34, 42].map(x => P(`M${x} 30 L${x + 2} 27.6 L${x + 4} 30Z`, '#f6eedc', 1)).join('') +
        L('M18 36 L18 44 M26 34 L26 45 M34 34 L34 45 M42 34 L42 45', 1.2, '#e8b878') +
        smoke(32),
};

export const NEW_FISH_IDS = Object.keys(NEW_FISH);
export const NEW_DISH_IDS = Object.keys(NEW_DISH);
for (const [k, v] of Object.entries({ ...NEW_FISH, ...NEW_DISH })) items[k] = () => v;

// ================= l'étang : appâts, nasse, coins de pêche =================
// la boîte à vers : une boîte de conserve, de la terre, deux vers roses qui dépassent
ui.worm = () =>
    SHADOW(32, 59, 18, 2.6) +
    P('M14 26 L50 26 L48 56 Q48 59 45 59 L19 59 Q16 59 16 56Z', '#c9d3dc') +
    L('M15 36 L49 36 M15.6 46 L48.4 46', 1.4, '#9aa6b2') +
    E(32, 26, 18, 5, '#6b4426') +
    L('M24 26 Q20 14 28 12 Q34 11 32 18', 5.6) +
    L('M24 26 Q20 14 28 12 Q34 11 32 18', 3.4, '#f29aa8') +
    L('M38 26 Q42 18 48 20', 5.6) +
    L('M38 26 Q42 18 48 20', 3.4, '#f29aa8') +
    E(32, 26, 18, 5, 'none', 0, 2.4) +
    FC(26, 25, 1.2, '#4a2e18') +
    FC(36, 27, 1.2, '#4a2e18') +
    HL(20, 42, 1.6, 5, 0, 0.6);
// la mouche de pêche : un hameçon, un corps de laine, des plumes
ui.fly = () =>
    SHADOW(32, 58, 14, 2.4) +
    L('M40 12 L40 44 Q40 54 32 54 Q24 54 24 46', 4.4) +
    L('M40 12 L40 44 Q40 54 32 54 Q24 54 24 46', 2.2, '#c9d3dc') +
    P('M24 46 L20 42 L26 42Z', '#c9d3dc', 1.4) +
    P('M40 14 Q22 8 14 18 Q24 22 40 22Z', '#e8a43a') +
    P('M40 16 Q30 22 22 34 Q34 30 40 24Z', '#c87a2a') +
    R(36, 18, 8, 22, 4, '#3f8f2e') +
    L('M36 24 L44 24 M36 30 L44 30 M36 36 L44 36', 1.2, '#f2c23a') +
    C(40, 12, 3, '#3a2618', 1.4) +
    HL(20, 15, 4, 1.4, -15, 0.6);
// la nasse : un panier en osier allongé, un entonnoir à l'entrée, une corde
ui.trap = () =>
    SHADOW(32, 56, 26, 3) +
    P('M8 26 Q6 36 8 46 L48 44 Q60 36 48 28Z', '#d9a85a') +
    L('M16 26 L16 46 M24 26 L24 46 M32 26 L32 46 M40 27 L40 45', 1.4, '#9c6a2a') +
    L('M8 32 Q30 30 54 32 M8 40 Q30 42 54 40', 1.2, '#9c6a2a') +
    P('M8 26 Q6 36 8 46 L48 44 Q60 36 48 28Z', 'none') +
    E(8, 36, 4, 10, '#b8823a') +
    E(8, 36, 2, 5, '#5e3a1e', 0, 1.4) +
    L('M54 34 Q60 24 58 12', 2.2, '#8b5a2b') +
    HL(28, 29, 7, 1.4, -2, 0.55);
const water = (y = 40) =>
    P(`M2 ${y} Q16 ${y - 3} 32 ${y} Q48 ${y + 3} 62 ${y} L62 58 Q32 62 2 58Z`, '#7fc4e8') +
    L(`M10 ${y + 8} Q16 ${y + 6} 22 ${y + 8} M36 ${y + 12} Q42 ${y + 10} 48 ${y + 12}`, 1.4, '#e8f6fd');
// la berge : herbe, galets, eau claire
ui.spotBank = () =>
    water(38) +
    P('M2 30 Q20 24 40 30 Q50 33 62 30 L62 40 Q40 36 20 40 Q10 42 2 40Z', '#8fd16a') +
    C(14, 40, 4, '#c9d3dc', 1.6) +
    C(24, 41, 3, '#dfe6ec', 1.6) +
    C(46, 37, 3.4, '#c9d3dc', 1.6) +
    L('M8 30 L6 22 M12 30 L13 21 M54 30 L52 22 M58 31 L60 23', 2, '#3f8f2e');
// les roseaux : de hautes tiges brunes au bord de l'eau calme
ui.spotReeds = () =>
    water(42) +
    [10, 18, 26, 40, 50, 56].map((x, k) => L(`M${x} 50 Q${x - 2} 30 ${x + (k % 2 ? 2 : -2)} ${12 + (k % 3) * 4}`, 2.4, '#3f8f2e')).join('') +
    [18, 40, 56].map((x, k) => R(x - 2.4 + (k % 2 ? 2 : -2), 12 + (k % 3) * 4, 5, 12, 2.4, '#8b5a2b', 1.6)).join('') +
    E(32, 52, 6, 2, '#5aa83a', 0, 1.4);
// le ponton : des planches sur pilotis au-dessus de l'eau profonde
ui.spotPier = () =>
    P('M2 34 Q16 31 32 34 Q48 37 62 34 L62 58 Q32 62 2 58Z', '#4f8fc0') +
    L('M10 46 Q16 44 22 46 M40 50 Q46 48 52 50', 1.4, '#cfe8f8') +
    R(14, 30, 4, 24, 1.5, '#8b5a2b', 1.8) +
    R(40, 30, 4, 24, 1.5, '#8b5a2b', 1.8) +
    P('M4 24 L60 24 L58 32 L6 32Z', '#c08b52') +
    L('M18 24 L17 32 M32 24 L32 32 M46 24 L47 32', 1.2, '#8b5a2b') +
    R(50, 12, 3, 13, 1, '#8b5a2b', 1.6) +
    HL(20, 26, 6, 1, 0, 0.5);
