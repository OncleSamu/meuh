// 1.67 : les miels de fleurs. Un même pot en verre, la couleur de son miel, un tissu noué sur le couvercle
// et la fleur de son miel sur l'étiquette (lavande, tournesol, sarrasin, menthe, pommier, cerisier, citronnier,
// oranger, châtaignier, amandier).
import { items, O, P, C, E, R, L, F, FC, FE, SHADOW, HL } from './kit.js';

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
