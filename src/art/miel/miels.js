// 1.67 : les miels de fleurs. Un même pot en verre, la couleur de son miel, un tissu noué sur le couvercle
// et la fleur de son miel sur l'étiquette (lavande, tournesol, sarrasin, menthe, pommier, cerisier, citronnier,
// oranger, châtaignier, amandier).
import { items, O, P, C, E, R, L, F, FC, FE, SHADOW, HL } from '../kit.js';

// le pot : miel (couleur, reflet), tissu du couvercle (couleur, carreaux), étiquette avec sa fleur
function pot(honey, light, cloth, check, flower) {
    return (
        SHADOW(32, 59, 16, 3) +
        // le verre et le miel
        P('M17 24 Q16 21 19 21 L45 21 Q48 21 47 24 L48 52 Q48 58 42 58 L22 58 Q16 58 16 52Z', honey) +
        F('M19 27 L45 27 L45 31 L19 31Z', light, 0.55) +
        HL(21, 34, 1.8, 9, 0, 0.55) +
        // le couvercle en tissu, noué d'une ficelle
        P('M13 18 Q14 10 32 10 Q50 10 51 18 Q52 23 46 22 L18 22 Q12 23 13 18Z', cloth) +
        F('M20 12 L20 21 M26 11 L26 21 M32 10.5 L32 21 M38 11 L38 21 M44 12 L44 21', 'none') +
        L('M20 12 L20 21 M28 11 L28 21 M36 11 L36 21 M44 12 L44 21', 1.2, check) +
        L('M15 16 Q32 12 49 16', 1.2, check) +
        L('M15 22 Q32 25 49 22', 1.8, '#8b5a2b') +
        P('M44 22 Q47 26 45 28 Q43 26 44 22Z', '#c08b52', 1.2) +
        // l'étiquette et sa fleur
        R(21, 35, 22, 17, 4, '#fbecc9', 2) +
        flower
    );
}

// les fleurs de l'étiquette (centrées sur 32,43)
const lavender = () =>
    L('M32 50 L32 37', 1.4, '#4f7d33') +
    [37, 39.5, 42, 44.5]
        .map((y, i) => FE(32 - (i % 2 ? 1.6 : -1.6), y, 1.7, 1.3, '#8b6bd6') + FE(32 + (i % 2 ? 1.6 : -1.6), y + 0.6, 1.5, 1.2, '#a98be8'))
        .join('') +
    L('M32 46 Q29 45 28 43 M32 47 Q35 46 36 44', 1.2, '#4f7d33');
const sunflower = () =>
    [0, 45, 90, 135, 180, 225, 270, 315]
        .map(a => FE(32 + 4 * Math.cos((a * Math.PI) / 180), 43 + 4 * Math.sin((a * Math.PI) / 180), 2.2, 1.2, '#ffcf2e', 1, a))
        .join('') + C(32, 43, 2.6, '#7a4a1a', 1.2);
const buckwheat = () =>
    L('M32 50 L32 39 M32 43 L28 40 M32 42 L36 39', 1.3, '#9a3a2a') +
    [
        [32, 38],
        [28, 39.5],
        [36, 38.5],
        [30, 37],
        [34.5, 36.5],
    ]
        .map(([x, y]) => FC(x, y, 1.5, '#fff') + FC(x, y, 0.6, '#f2a0c8'))
        .join('');
const mint = () =>
    L('M32 50 L32 38', 1.4, '#3f8f2e') +
    E(29, 41, 3, 1.8, '#6cc04a', -30, 1) +
    E(35, 41, 3, 1.8, '#6cc04a', 30, 1) +
    E(29, 46, 3, 1.8, '#9be06b', -30, 1) +
    E(35, 46, 3, 1.8, '#9be06b', 30, 1) +
    FC(32, 37.5, 1.4, '#c9a6e8');
const blossom = (petal, heart) =>
    [0, 72, 144, 216, 288]
        .map(a => C(32 + 3.4 * Math.cos(((a - 90) * Math.PI) / 180), 43 + 3.4 * Math.sin(((a - 90) * Math.PI) / 180), 2.3, petal, 1))
        .join('') + C(32, 43, 1.6, heart, 1);
const citrus = (fruit, leaf) =>
    E(29, 45, 4, 3.6, fruit, 0, 1.2) +
    E(35, 40, 3, 1.6, leaf, -30, 1) +
    blossom('#fff', '#ffd23f')
        .replace(/cx="(\d+\.?\d*)"/g, (m, x) => `cx="${+x + 4}"`)
        .replace(/cy="(\d+\.?\d*)"/g, (m, y) => `cy="${+y - 1}"`);
const chestnut = () =>
    C(32, 44, 5, '#9bc04a', 1.2) +
    [0, 40, 80, 120, 160, 200, 240, 280, 320]
        .map(a =>
            L(
                `M${32 + 5 * Math.cos((a * Math.PI) / 180)} ${44 + 5 * Math.sin((a * Math.PI) / 180)} L${32 + 7.5 * Math.cos((a * Math.PI) / 180)} ${44 + 7.5 * Math.sin((a * Math.PI) / 180)}`,
                1,
                '#6b8a2a',
            ),
        )
        .join('') +
    E(32, 44.5, 3, 2.6, '#8b4a22', 0, 1);

items.honey_lavender = () => pot('#f2c94e', '#ffe9a0', '#a98be8', '#6a4ab0', lavender());
items.honey_sunflower = () => pot('#f7b80f', '#ffe066', '#ffcf2e', '#c98a10', sunflower());
items.honey_buckwheat = () => pot('#6b3a1a', '#9a5a2a', '#e8d8c0', '#9a3a2a', buckwheat());
items.honey_mint = () => pot('#c9a43a', '#e8d070', '#9be06b', '#3f8f2e', mint());
items.honey_apple = () => pot('#f0b44a', '#ffd98a', '#f6d0d8', '#d0606a', blossom('#fde4ea', '#ffd23f'));
items.honey_cherry = () => pot('#e39a2e', '#f6c66a', '#e8505a', '#fff', blossom('#f6a6c0', '#c03050'));
items.honey_lemon = () => pot('#f3d878', '#fff1b8', '#fff3a0', '#d8b820', citrus('#ffe14a', '#6cc04a'));
items.honey_orange = () => pot('#f2a020', '#ffd06a', '#ffb050', '#e06a10', citrus('#ff9a2a', '#3f8f2e'));
items.honey_chestnut = () => pot('#8a4416', '#b8702e', '#c9a070', '#6b3a1a', chestnut());
items.honey_almond = () => pot('#f1d394', '#fff0c8', '#f6e6ea', '#c9a0a8', blossom('#fff4f6', '#e8a0b0'));
void O;

// 1.67 : dix miels de plus (six de la ferme ; litchi, avocatier, arganier et sapin pour les contrées, plus tard)
const raspberry = () =>
    E(35, 39, 3, 1.6, '#6cc04a', -25, 1) +
    C(30, 44, 4.6, '#e0405a', 1.2) +
    [
        [28.5, 42.5],
        [31.5, 42.5],
        [30, 45.5],
        [27.5, 45.5],
        [32.5, 45.5],
    ]
        .map(([x, y]) => FC(x, y, 0.9, '#ff8a9a'))
        .join('');
const blueberry = () =>
    L('M34 37 Q32 39 31 41', 1.1, '#3f8f2e') +
    C(28.5, 45, 3, '#4a5ec8', 1) +
    C(34, 46, 3, '#3a4aa8', 1) +
    C(31, 41.5, 2.8, '#5a70d8', 1) +
    FC(28, 44, 0.8, '#fff', 0.6) +
    FC(33.5, 45, 0.8, '#fff', 0.6);
const cotton = () =>
    P('M27 49 L32 45 L37 49', '#8b5a2b', 1) + C(29, 42, 3.2, '#fff', 1) + C(35, 42, 3.2, '#fff', 1) + C(32, 39.5, 3.4, '#fff', 1) + C(32, 44, 3, '#fff', 1);
const basil = () =>
    L('M32 50 L32 38', 1.3, '#3f8f2e') +
    E(28.5, 44, 3.4, 2.2, '#4fa83a', -25, 1) +
    E(35.5, 44, 3.4, 2.2, '#4fa83a', 25, 1) +
    E(29.5, 48, 2.8, 1.8, '#6cc04a', -25, 1) +
    E(34.5, 48, 2.8, 1.8, '#6cc04a', 25, 1) +
    FC(32, 37, 1.1, '#fff') +
    FC(32, 39.5, 1.1, '#fff');
const pear = () =>
    L('M32 37 L33 35', 1.2, '#8b5a2b') +
    E(35, 36.5, 2.4, 1.2, '#6cc04a', -20, 0.8) +
    P('M32 38 Q29 38 29.5 42 Q26 45 28 48.5 Q32 51 36 48.5 Q38 45 34.5 42 Q35 38 32 38Z', '#c8d850', 1.2) +
    FC(30, 46, 1, '#fff', 0.5);
const plum = () =>
    L('M33 37 L34 35', 1.2, '#8b5a2b') + E(31, 44, 4.4, 5, '#7a3a9a', 0, 1.2) + L('M31 40 Q30 44 31 48', 0.9, '#5a2a78') + FC(29.5, 42, 1, '#fff', 0.5);
const litchi = () =>
    // un litchi dans sa coque rouge, et un autre épluché, blanc nacré
    C(29, 45.5, 4, '#d8384e', 1.2) +
    [
        [27.5, 44],
        [30.5, 44],
        [29, 47],
        [27, 47],
    ]
        .map(([x, y]) => FC(x, y, 0.75, '#9a2236'))
        .join('') +
    E(35, 42.5, 3.2, 3.6, '#fbf2e6', 0, 1.1) +
    FE(34, 41.5, 1, 1.4, '#fff', 0.9) +
    L('M36.5 38 Q37.5 36.5 39 36.5', 1, '#3f8f2e');
const avocado = () =>
    P('M32 37 Q27 38 27.5 44 Q27 50 32 50 Q37 50 36.5 44 Q37 38 32 37Z', '#4f8a2a', 1.2) +
    P('M32 39.5 Q29.5 40 29.8 44 Q29.5 48 32 48 Q34.5 48 34.2 44 Q34.5 40 32 39.5Z', '#d8e870', 0.8) +
    C(32, 45, 1.9, '#8b5a2b', 0.8);
const argan = () =>
    L('M26 48 Q32 42 38 38', 1.4, '#8b5a2b') +
    L('M29 45 L27 42 M34 41 L35 38', 0.9, '#8b5a2b') +
    E(30, 46, 2, 2.6, '#c8b040', -20, 0.9) +
    E(36, 41.5, 2, 2.6, '#d8c050', -20, 0.9) +
    E(33, 44, 2.6, 1.3, '#4f8a2a', 30, 0.8);
const fir = () =>
    P('M32 36 L37 42 L35 42 L38.5 46.5 L35.5 46.5 L39 51 L25 51 L28.5 46.5 L25.5 46.5 L29 42 L27 42Z', '#2f7a3a', 1.1) +
    R(30.8, 50, 2.4, 2, 0.5, '#8b5a2b', 0.8) +
    FC(30, 44, 0.7, '#fff', 0.6) +
    FC(34, 48, 0.7, '#fff', 0.6);

items.honey_raspberry = () => pot('#e39a4a', '#f6c48a', '#f6a0b0', '#c02a40', raspberry());
items.honey_blueberry = () => pot('#9a5a2a', '#c8884a', '#a0b0f0', '#3a4aa8', blueberry());
items.honey_cotton = () => pot('#f2e2b8', '#fff8e0', '#ffffff', '#c8b890', cotton());
items.honey_basil = () => pot('#e2b048', '#f8d888', '#9be06b', '#2f7a3a', basil());
items.honey_pear = () => pot('#f0cc78', '#fff0b8', '#e8f0a0', '#9aa830', pear());
items.honey_plum = () => pot('#d48a36', '#f2b46a', '#c8a0e0', '#7a3a9a', plum());
items.honey_lychee = () => pot('#ecbc68', '#fde0a0', '#f8b0c0', '#c03050', litchi());
items.honey_avocado = () => pot('#4a2814', '#7a4a24', '#b8d880', '#4f8a2a', avocado());
items.honey_argan = () => pot('#b05e26', '#d88a4a', '#f0d890', '#a07020', argan());
items.honey_fir = () => pot('#5e2e16', '#8a4a26', '#7ab08a', '#1f5a2a', fir());
