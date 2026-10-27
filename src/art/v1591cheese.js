// 1.59.1 : dix fromages qui se ressemblaient (une meule entaillée) ont chacun leur silhouette et leur croûte.
import { C, E, F, FC, FE, HL, L, P, R, SHADOW, items } from './kit.js';

// quelques taches sur une zone (x, y, couleur, rayon)
const spots = (list, o = 0.85) => list.map(([x, y, c, r]) => FC(x, y, r || 1.3, c, o)).join('');
// une petite fleur à cinq pétales
const flower = (x, y, c, r = 2.2) =>
    [0, 72, 144, 216, 288].map(a => FC(x + Math.cos((a * Math.PI) / 180) * r, y + Math.sin((a * Math.PI) / 180) * r * 0.6, r * 0.75, c)).join('') +
    FC(x, y, r * 0.55, '#ffd23f');

// le beaufort : une grande meule basse aux flancs creusés (le « talon »), sa plaque bleue
items.beaufort = () =>
    SHADOW(32, 55, 27, 4) +
    P('M7 27 Q14 36.5 7 46 Q32 57 57 46 Q50 36.5 57 27 Z', '#a8743a', 2.4) +
    F('M10 41 Q32 51 54 41 Q52 44 54 46 Q32 55 10 46 Q12 44 10 41Z', '#7a4f22', 0.45) +
    E(32, 27, 25, 7.5, '#d4a862', 0, 2.4) +
    E(32, 27, 19, 5, 'none', 0, 1.2) +
    E(32, 40, 7, 3.4, '#5aa9e6', 0, 1.6) +
    L('M27.5 40 L36.5 40', 1, '#fff') +
    HL(20, 25, 6, 1.6, -4, 0.45);

// le comté : une haute part, pâte dorée et petits cristaux, croûte brune, l'étiquette verte
items.comte = () =>
    SHADOW(32, 56, 24, 3.5) +
    P('M9 50 L45 50 L45 14 Z', '#f2cf5e', 2.4) +
    P('M45 14 L55 21 L55 54 L45 50 Z', '#8a5a2a', 2.4) +
    P('M9 50 L45 50 L55 54 L19 54 Z', '#d6a840', 2.2) +
    R(47.5, 34, 5, 6, 1, '#4caf50', 1.4) +
    spots([
        [30, 40, '#fff6c8', 1.1],
        [38, 33, '#fff6c8', 0.9],
        [24, 45, '#fff6c8', 0.9],
        [40, 44, '#fff6c8', 1.1],
    ]) +
    HL(36, 30, 2.4, 9, 35, 0.4);

// la tomme de montagne : petite meule épaisse, croûte grise fleurie de moisissures
items.tomme = () =>
    SHADOW(32, 55, 23, 4) +
    P('M11 27 L11 42 Q32 53 53 42 L53 27 Z', '#7d7c70', 2.4) +
    E(32, 27, 21, 7, '#a3a294', 0, 2.4) +
    spots([
        [18, 26, '#e8e4c8', 1.8],
        [28, 23, '#d8d3a0', 1.4],
        [40, 29, '#e8e4c8', 2],
        [46, 25, '#f2e7a8', 1.2],
        [33, 30, '#d0cc98', 1.1],
        [16, 37, '#c9c6a8', 1.6],
        [26, 43, '#e0dcb8', 1.3],
        [40, 44, '#c9c6a8', 1.7],
        [49, 37, '#e8e4c8', 1.2],
        [22, 33, '#f2e7a8', 1],
    ]) +
    HL(21, 24, 5, 1.4, -6, 0.35);

// la tomme de brebis : croûte orangée marquée par la faisselle tressée, une tête de brebis en relief
items.sheepTomme = () =>
    SHADOW(32, 55, 25, 4) +
    P('M9 28 L9 42 Q32 52 55 42 L55 28 Z', '#c47f37', 2.4) +
    L('M13 32 L17 45 M19 32 L23 47 M25 33 L29 48 M31 33 L34 48 M37 33 L40 48 M43 32 L46 47 M49 31 L52 45', 1.1, '#8f5520') +
    L('M11 37 Q32 46 53 37', 1.1, '#8f5520') +
    E(32, 28, 23, 7, '#e0a65c', 0, 2.4) +
    E(32, 28, 6, 3.6, '#f3d4a0', 0, 1.4) +
    FE(28.5, 26.5, 1.8, 1, '#8f5520', 0.9, -30) +
    FE(35.5, 26.5, 1.8, 1, '#8f5520', 0.9, 30) +
    FC(30.5, 28.4, 0.6, '#3a2618') +
    FC(33.5, 28.4, 0.6, '#3a2618') +
    HL(18, 26, 5, 1.4, -6, 0.4);

// le munster : petit fromage plat à croûte orange lavée, ridée, sur sa planche, avec du cumin
items.munster = () =>
    SHADOW(32, 56, 26, 3.5) +
    R(7, 44, 50, 9, 3.5, '#c48a4a', 2.2) +
    L('M12 48.5 L52 48.5', 1, '#a06a32') +
    P('M14 35 L14 43 Q32 50 50 43 L50 35 Z', '#cc5418', 2.4) +
    E(32, 35, 18, 6.5, '#ee8a36', 0, 2.4) +
    L('M20 34 Q24 31 28 34 Q32 37 36 34 Q40 31 44 34 M24 38 Q28 36 32 38 Q36 40 40 38', 1.1, '#c4501a') +
    FE(12, 50, 1.4, 0.6, '#5a3a1a', 1, 20) +
    FE(51, 51, 1.4, 0.6, '#5a3a1a', 1, -30) +
    FE(48, 46.5, 1.4, 0.6, '#5a3a1a', 1, 10) +
    HL(24, 32, 4, 1.2, -8, 0.5);

// le cantal : une haute fourme, croûte grise et fleurie, sa plaque rouge
items.cantal = () =>
    SHADOW(32, 57, 20, 3.5) +
    P('M15 13 L15 48 Q32 56 49 48 L49 13 Z', '#b9a274', 2.4) +
    E(32, 13, 17, 5.5, '#d6c296', 0, 2.4) +
    spots([
        [19, 22, '#8a7550', 1.2],
        [24, 40, '#8a7550', 1.4],
        [44, 24, '#8a7550', 1.1],
        [41, 44, '#8a7550', 1.3],
        [20, 32, '#e6dcc0', 1.4],
        [45, 35, '#e6dcc0', 1.2],
    ]) +
    R(25, 25, 14, 9, 1.5, '#c8453a', 1.6) +
    L('M28 29.5 L36 29.5', 1.2, '#fff') +
    HL(19, 20, 1.6, 8, 0, 0.35);

// le fromage aux fleurs d'alpage : une meule dont la croûte est couverte de fleurs séchées
items.alpineFlowerCheese = () =>
    SHADOW(32, 55, 25, 4) +
    P('M9 29 L9 41 Q32 51 55 41 L55 29 Z', '#c9b27a', 2.4) +
    E(32, 29, 23, 7, '#e8daa6', 0, 2.4) +
    flower(19, 28, '#b06ad0') +
    flower(28, 25, '#f59ab1') +
    flower(38, 26, '#5aa9e6') +
    flower(46, 30, '#b06ad0') +
    flower(32, 31, '#ffffff') +
    flower(22, 33, '#f59ab1', 1.8) +
    flower(15, 39, '#5aa9e6', 1.8) +
    flower(30, 44, '#b06ad0', 1.8) +
    flower(45, 41, '#f59ab1', 1.8) +
    L('M24 30 l3 -1 M41 32 l3 1 M35 24 l2 -2', 1.2, '#4caf50');

// le fromage de yack : des cubes séchés, durs comme du bois, enfilés sur une cordelette
const cube = (x, y, a) =>
    `<g transform="rotate(${a} ${x} ${y})">` +
    R(x - 4.5, y - 4.5, 9, 9, 1.8, '#f3ead2', 2) +
    F(`M${x - 4.5} ${y + 1} L${x + 4.5} ${y + 1} L${x + 4.5} ${y + 4.5} L${x - 4.5} ${y + 4.5}Z`, '#d8c9a0', 0.7) +
    FC(x, y - 1, 0.9, '#3a2618') +
    `</g>`;
items.yakCheese = () =>
    SHADOW(32, 56, 22, 3) +
    L('M6 12 Q32 58 58 12', 3, '#8a5a2a') +
    cube(12, 26, -40) +
    cube(21, 37, -22) +
    cube(32, 41, 0) +
    cube(43, 37, 22) +
    cube(52, 26, 40) +
    FC(6, 12, 2.4, '#c8453a') +
    FC(58, 12, 2.4, '#c8453a');

// la tomme de yack : meule à croûte sombre, ceinte d'une sangle tissée rouge et jaune, nouée dessus
items.yakTomme = () =>
    SHADOW(32, 55, 25, 4) +
    P('M9 28 L9 42 Q32 52 55 42 L55 28 Z', '#4e3b28', 2.4) +
    E(32, 28, 23, 7, '#6e5638', 0, 2.4) +
    P('M9 33 Q32 42 55 33 L55 38 Q32 47 9 38 Z', '#b8342a', 1.8) +
    L('M14 37 l3 1 M22 39.5 l3 0.6 M30 40.6 l3 0 M38 40.2 l3 -0.4 M46 38.4 l3 -0.8', 1.4, '#ffd23f') +
    P('M30 28 Q27 21 23 22 Q27 25 29 29 Z', '#b8342a', 1.6) +
    P('M34 28 Q37 21 41 22 Q37 25 35 29 Z', '#b8342a', 1.6) +
    C(32, 28, 2.4, '#d04a3a', 1.6) +
    HL(19, 26, 4, 1.2, -6, 0.3);

// le fromage de renne : une galette épaisse dorée au four, tachetée de brun, sur une planche de bouleau
items.reindeerCheese = () =>
    SHADOW(32, 56, 27, 3.5) +
    E(32, 47, 27, 8, '#e8dcc4', 0, 2.2) +
    L('M10 46 Q32 52 54 46', 1, '#b8ab90') +
    P('M11 37 L11 42 Q32 51 53 42 L53 37 Z', '#e6c27a', 2.2) +
    E(32, 37, 21, 7.5, '#f6e3b0', 0, 2.2) +
    spots(
        [
            [22, 35, '#b8763a', 2.4],
            [30, 39, '#9a5a2a', 1.8],
            [38, 34, '#b8763a', 2.6],
            [44, 38, '#9a5a2a', 1.6],
            [27, 33, '#c98a4a', 1.4],
            [35, 40.5, '#c98a4a', 1.6],
            [17, 39, '#c98a4a', 1.3],
            [47, 35, '#b8763a', 1.2],
        ],
        0.8,
    ) +
    HL(24, 34, 5, 1.2, -6, 0.4);

// le roquefort : dans son papier d'argent, ouvert sur une pâte persillée, le sceau rouge à la brebis
items.roquefort = () =>
    SHADOW(32, 56, 24, 3.5) +
    P('M10 30 L10 46 Q32 55 54 46 L54 30 Z', '#c9d2da', 2.4) +
    L('M14 34 L16 48 M22 36 L23 51 M30 37 L30 52 M38 37 L37 52 M46 35 L44 50', 1, '#9aa6b0') +
    E(32, 30, 22, 7.5, '#f4f1e2', 0, 2.4) +
    spots([
        [22, 29, '#3f6f8f', 1.4],
        [28, 32, '#5a8fb0', 1.1],
        [33, 27.5, '#3f6f8f', 1.5],
        [39, 31, '#5a8fb0', 1.2],
        [44, 28.5, '#3f6f8f', 1.1],
        [26, 26.5, '#5a8fb0', 0.9],
        [36, 33, '#3f6f8f', 0.9],
    ]) +
    P('M10 30 Q16 23 24 24 Q16 27 13 33 Z', '#dfe6ec', 1.6) +
    P('M54 30 Q48 23 40 24 Q48 27 51 33 Z', '#dfe6ec', 1.6) +
    C(32, 45, 4.6, '#c8453a', 1.6) +
    FE(32, 45, 2.2, 1.5, '#fff', 0.85);
