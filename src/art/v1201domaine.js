// 1.20.1 : les bâtiments du domaine. Neuf branches, deux étapes chacune : la version modeste (palier 2) et la grande (palier 5).
// Chaque dessin tient dans une boîte 100 × 90, le sol à y = 86, comme les bâtiments du village.
import { C, E, F, FC, HL, L, O, P, R, SHADOW } from './kit.js';

const WOOD = '#b57a45',
    WOODD = '#8b5a2b',
    HAY = '#f2c14e',
    CREAM = '#f7e3c0',
    STONE = '#c9bfae',
    STONED = '#9a8f7e',
    RED = '#c8453a',
    BLUE = '#3f6fb5',
    GREEN = '#6b8f3a';

const win = (x, y, s = 7) => R(x, y, s, s, 1.2, '#cfeaf7', 1.6) + L(`M${x + s / 2} ${y} V${y + s} M${x} ${y + s / 2} H${x + s}`, 1.1);
const door = (x, y, w, h, c = WOODD) => R(x, y, w, h, 1.5, c, 1.8) + C(x + w - 3, y + h / 2, 0.9, '#f2c14e', 0.8);
const gable = (x0, x1, top, eave, c) =>
    P(`M${x0 - 4} ${eave} L${(x0 + x1) / 2} ${top} L${x1 + 4} ${eave}Z`, c) + HL((x0 + x1) / 2 - 6, top + 6, 7, 2, -22, 0.4);
const planks = (x0, y0, x1, y1) =>
    [...Array(Math.floor((x1 - x0) / 6))].map((_, k) => L(`M${x0 + 6 * (k + 1)} ${y0 + 1} V${y1 - 1}`, 0.8, 'rgba(58,38,24,.45)')).join('');
const bale = (x, y) => R(x, y, 11, 8, 2, HAY, 1.6) + L(`M${x + 3} ${y} v8 M${x + 8} ${y} v8`, 0.9);
const crate = (x, y, s = 9) => R(x, y, s, s, 1.2, '#c99a5b', 1.5) + L(`M${x} ${y} L${x + s} ${y + s} M${x + s} ${y} L${x} ${y + s}`, 0.9, 'rgba(58,38,24,.6)');
const barrel = (x, y) => R(x, y, 9, 11, 3, '#a8693a', 1.6) + L(`M${x} ${y + 3.5} h9 M${x} ${y + 7.5} h9`, 1, O);
const flag = (x, y, c) => L(`M${x} ${y} V${y - 14}`, 1.8) + P(`M${x} ${y - 14} l10 3 l-10 4Z`, c, 1.4);
const smoke = (x, y) => FC(x, y, 3, '#fff', 0.8) + FC(x + 3, y - 5, 3.6, '#fff', 0.7) + FC(x + 7, y - 11, 4.2, '#fff', 0.55);

export const DOM_ART = {
    // ---------- Grange agrandie : hangar à foin → grande grange avec silo ----------
    barn: [
        () =>
            SHADOW(50, 87, 40, 3) +
            R(20, 50, 60, 36, 1, '#e4b878', 2) +
            P('M14 52 L50 28 L86 52Z', '#a8693a') +
            R(20, 52, 60, 4, 0, WOODD, 1.5) +
            [27, 47, 67].map(x => R(x, 52, 6, 34, 0, WOODD, 1.6)).join('') +
            bale(30, 77) +
            bale(41, 77) +
            bale(36, 69) +
            bale(60, 77) +
            L('M63 86 V62', 1.6) +
            HL(36, 36, 8, 2.2, -22, 0.4),
        () =>
            SHADOW(50, 87, 46, 3) +
            R(12, 44, 60, 42, 2, RED, 2.2) +
            planks(12, 44, 72, 86) +
            P('M7 46 L42 22 L77 46Z', '#7a3b2a') +
            P('M16 46 L42 28 L68 46Z', '#9a4a36', 1.2) +
            door(27, 58, 30, 28, '#f7ecd8') +
            L('M27 58 L57 86 M57 58 L27 86', 2.2, RED) +
            R(27, 58, 30, 28, 1.5, 'none', 2.2) +
            C(42, 38, 4, '#f7ecd8', 1.6) +
            R(76, 22, 17, 64, 5, '#c7ccd1', 2.2) +
            P('M74 26 Q84.5 8 95 26Z', '#8f98a2', 2.2) +
            L('M76 38 H93 M76 52 H93 M76 66 H93', 1.2, 'rgba(58,38,24,.5)') +
            bale(14, 78) +
            HL(24, 52, 6, 2, -20, 0.35),
    ],
    // ---------- Cuisines et ateliers : cuisine d'été → grandes cuisines ----------
    kitchen: [
        () =>
            SHADOW(50, 87, 34, 3) +
            R(58, 22, 8, 30, 1, STONE, 2) +
            smoke(62, 18) +
            R(26, 54, 48, 32, 1.5, CREAM, 2) +
            gable(26, 74, 36, 54, '#c8693a') +
            door(34, 64, 12, 22, WOODD) +
            win(54, 62, 10) +
            R(52, 76, 14, 10, 3, '#8f8574', 1.8) +
            F('M55 80 Q59 76 63 80', '#ff9a3c'),
        () =>
            SHADOW(50, 87, 44, 3) +
            R(24, 10, 8, 30, 1, STONE, 2) +
            R(66, 10, 8, 30, 1, STONE, 2) +
            smoke(70, 8) +
            R(16, 38, 68, 48, 2, CREAM, 2.2) +
            R(16, 38, 68, 4, 0, '#e8d3a6', 1.5) +
            gable(16, 84, 20, 38, RED) +
            [22, 38, 56, 70].map(x => win(x, 48, 9)).join('') +
            R(40, 62, 22, 24, 11, WOODD, 2) +
            R(44, 66, 14, 20, 7, '#f2c14e', 1.2) +
            C(50, 30, 6, '#f7ecd8', 1.8) +
            L('M50 30 V26 M50 30 L53 32', 1.4) +
            R(20, 74, 10, 12, 2, '#b87333', 1.6) +
            R(72, 74, 10, 12, 2, '#b87333', 1.6),
    ],
    // ---------- Aide au champ : remise à outils → maison de Théo ----------
    field: [
        () =>
            SHADOW(50, 87, 36, 3) +
            R(26, 56, 44, 30, 1, WOOD, 2) +
            planks(26, 56, 70, 86) +
            P('M22 58 L48 40 L74 58Z', '#6f7d4a') +
            door(36, 66, 14, 20, '#7a4c26') +
            L('M62 86 V64 M58 64 h8', 2) +
            L('M70 86 L78 62', 2) +
            P('M74 62 l8 2 l-2 5 l-8 -2Z', '#9aa3ad', 1.4) +
            R(14, 76, 12, 6, 2, '#c8453a', 1.5) +
            C(17, 84, 3, '#444', 1.4) +
            HL(34, 48, 7, 2, -22, 0.35),
        () =>
            SHADOW(50, 87, 42, 3) +
            R(56, 22, 7, 28, 1, STONE, 2) +
            smoke(59.5, 18) +
            R(22, 46, 52, 40, 2, '#f1d9a6', 2.2) +
            gable(22, 74, 24, 46, '#4f8f4e') +
            door(34, 60, 14, 26, '#a8693a') +
            win(54, 56, 11) +
            win(28, 52, 8) +
            R(14, 70, 12, 16, 2, '#7bbf4a', 1.8) +
            C(20, 66, 6, '#8ed05a', 1.8) +
            L('M82 86 V62', 2) +
            P('M74 66 L90 66 L82 56Z', '#e8c24a', 1.8) +
            C(82, 61, 1.5, O) +
            FC(10, 84, 2.6, '#e8364b') +
            FC(16, 85, 2.6, '#ffd23f') +
            FC(86, 85, 2.6, '#f6a5b5'),
    ],
    // ---------- Commerce : étal couvert → halle du marché ----------
    trade: [
        () =>
            SHADOW(50, 87, 32, 3) +
            R(24, 66, 52, 20, 2, WOOD, 2) +
            L('M28 66 V44 M72 66 V44', 2.6) +
            P('M20 46 L80 46 L74 34 L26 34Z', '#fff', 2.2) +
            [26, 40, 54, 68].map((x, k) => P(`M${x} 34 L${x + 7} 34 L${x + 7 + (k === 3 ? 1 : 0)} 46 L${x - 1} 46Z`, RED, 0)).join('') +
            P('M20 46 L80 46 L74 34 L26 34Z', 'none', 2.2) +
            C(34, 62, 4, '#e8364b', 1.5) +
            C(44, 62, 4, '#ffd23f', 1.5) +
            C(54, 62, 4, '#7bbf4a', 1.5) +
            C(64, 62, 4, '#ff9a3c', 1.5),
        () =>
            SHADOW(50, 87, 44, 3) +
            R(14, 44, 72, 42, 2, '#e9c79a', 2.2) +
            P('M10 46 L50 22 L90 46Z', BLUE) +
            L('M18 42 L50 26 L82 42', 1.2, 'rgba(255,255,255,.4)') +
            R(24, 52, 12, 34, 6, '#5a3a22', 2) +
            R(44, 52, 12, 34, 6, '#5a3a22', 2) +
            R(64, 52, 12, 34, 6, '#5a3a22', 2) +
            P('M22 56 h16 l-2 -6 h-12Z', RED, 1.4) +
            P('M42 56 h16 l-2 -6 h-12Z', '#fff', 1.4) +
            P('M62 56 h16 l-2 -6 h-12Z', RED, 1.4) +
            C(50, 36, 6, '#fff7e0', 1.8) +
            FC(50, 36, 2.4, '#f2c14e') +
            crate(12, 78, 8) +
            crate(80, 78, 8),
    ],
    // ---------- Annexes des métiers : appentis → ailes des métiers ----------
    annex: [
        () =>
            SHADOW(50, 87, 36, 3) +
            P('M30 86 V54 L70 42 V86Z', '#d8b27a', 2) +
            planks(30, 56, 70, 86) +
            P('M24 56 L74 38 L74 46 L24 64Z', '#8b6a4a', 2) +
            barrel(20, 74) +
            barrel(32, 74) +
            crate(70, 77) +
            L('M44 54 q8 6 16 0 M44 60 q8 6 16 0', 1.3, '#9ab') +
            L('M44 54 V66 M60 54 V66', 1.4),
        () =>
            SHADOW(50, 87, 46, 3) +
            R(10, 52, 80, 34, 2, '#e4cfa1', 2.2) +
            P('M6 54 L50 36 L94 54Z', '#9a6b3d') +
            L('M12 52 L50 39 L88 52', 1.2, 'rgba(255,255,255,.35)') +
            door(14, 60, 14, 26, '#a8693a') +
            door(43, 60, 14, 26, '#7a4c26') +
            door(72, 60, 14, 26, '#3f6fb5') +
            C(21, 52, 4.5, '#fff', 1.5) +
            L('M18.5 52 h5 M21 49.5 v5', 1) +
            C(50, 52, 4.5, '#f7ecd8', 1.5) +
            F('M47 54 h6 l-1 -5 h-4Z', '#e8364b') +
            C(79, 52, 4.5, '#fff', 1.5) +
            L('M76 50 q3 4 6 0 M76 54 q3 -4 6 0', 1.1) +
            barrel(2, 75) +
            barrel(88, 75),
    ],
    // ---------- Suite d'Armand : pavillon du chef → petit hôtel ----------
    armand: [
        () =>
            SHADOW(50, 87, 34, 3) +
            L('M28 86 V50 M72 86 V50', 2.6) +
            P('M22 52 Q50 24 78 52 Q50 46 22 52Z', '#fff', 2.2) +
            P('M34 46 Q50 30 66 46', 'none', 1.3) +
            R(30, 66, 40, 20, 2, '#f7f3ea', 1.8) +
            R(30, 66, 40, 4, 0, RED, 1.4) +
            C(40, 60, 4.5, '#f7ecd8', 1.4) +
            R(37, 63, 6, 3, 0, '#f7ecd8', 1) +
            E(40, 55.5, 5, 2.8, '#fff', 0, 1.4) +
            flag(50, 30, RED),
        () =>
            SHADOW(50, 87, 46, 3) +
            R(28, 12, 7, 28, 1, STONE, 1.8) +
            smoke(31.5, 8) +
            R(14, 40, 72, 46, 2, '#f7f3ea', 2.2) +
            R(14, 40, 72, 5, 0, '#e8d8b8', 1.4) +
            P('M10 42 L50 18 L90 42Z', '#2f4a7a') +
            HL(36, 30, 9, 2.4, -24, 0.4) +
            [22, 36, 58, 72].map(x => win(x, 50, 8)).join('') +
            [22, 36, 58, 72].map(x => P(`M${x - 1} 49 h10 l-1 -3 h-8Z`, RED, 0.8)).join('') +
            R(42, 60, 16, 26, 8, '#6b3f1f', 2) +
            C(50, 56, 5, '#f2c14e', 1.8) +
            L('M47 56 h6', 1.2) +
            P('M36 62 L64 62 L61 56 L39 56Z', RED, 1.8) +
            flag(14, 40, '#f2c14e') +
            flag(86, 40, RED),
    ],
    // ---------- Piste du cargo : manche à air et hangar → aérodrome ----------
    cargo: [
        () =>
            SHADOW(50, 87, 42, 3) +
            P('M4 84 Q50 78 96 84 L96 87 L4 87Z', '#c9b28a', 1.6) +
            L('M12 85 h10 M34 85 h10 M56 85 h10 M78 85 h10', 1.6, '#fff') +
            R(48, 54, 36, 30, 2, '#cfd6dc', 2) +
            P('M44 56 Q66 40 88 56Z', '#8f98a2', 2.2) +
            R(58, 62, 16, 22, 1, '#5a6a7a', 1.6) +
            L('M22 84 V52', 2.2) +
            P('M22 52 l16 2 l-3 4 l-13 -2Z', '#ff7a3c', 1.4) +
            P('M28 53 l2 0.3 l-0.5 4 l-2 -0.3Z', '#fff', 0),
        () =>
            SHADOW(50, 87, 46, 3) +
            P('M2 85 Q50 80 98 85 L98 87 L2 87Z', '#c9b28a', 1.6) +
            R(6, 58, 36, 28, 2, '#cfd6dc', 2) +
            P('M2 60 Q24 44 46 60Z', BLUE) +
            R(14, 66, 20, 20, 1, '#5a6a7a', 1.6) +
            R(76, 30, 12, 56, 2, '#e9e4d8', 2) +
            R(70, 20, 24, 14, 3, '#9ad0ee', 2) +
            L('M70 27 h24', 1.2) +
            P('M68 20 L82 10 L96 20Z', RED, 1.8) +
            L('M82 10 V5', 1.6) +
            FC(82, 4.5, 1.6, '#f2c14e') +
            P('M40 78 Q46 74 56 76 L76 78 L56 81 Q46 82 40 78Z', '#fff', 1.8) +
            P('M50 77 L45 69 L52 71Z', '#e04d3a', 1.4) +
            P('M52 79 L48 84 L55 81Z', '#e04d3a', 1.4) +
            L('M40 77 v-4', 1.6),
    ],
    // ---------- Quai agrandi : ponton → grand quai avec grue ----------
    quay: [
        () =>
            F('M0 64 H100 V90 H0Z', '#5aa9e6') +
            L('M6 74 q6 -3 12 0 M66 78 q6 -3 12 0', 1.2, '#bfe6fb') +
            R(14, 56, 72, 8, 1.5, '#b57a45', 2) +
            [20, 38, 56, 74].map(x => R(x, 62, 5, 22, 1, WOODD, 1.6)).join('') +
            planks(14, 56, 86, 64) +
            crate(24, 47, 9) +
            crate(35, 47, 9) +
            barrel(70, 46) +
            P('M44 56 L64 56 L60 68 L48 68Z', '#c8453a', 1.8),
        () =>
            F('M0 62 H100 V90 H0Z', '#5aa9e6') +
            L('M64 80 q6 -3 12 0 M20 82 q6 -3 12 0', 1.2, '#bfe6fb') +
            R(0, 52, 62, 14, 2, STONE, 2.2) +
            L('M8 52 v14 M22 52 v14 M36 52 v14 M50 52 v14', 1, STONED) +
            R(40, 18, 6, 34, 1, '#d9a22a', 1.8) +
            L('M43 18 L72 24', 3, '#d9a22a') +
            L('M72 24 V38', 1.4) +
            R(68, 38, 8, 6, 1, '#7a8a96', 1.4) +
            crate(8, 43, 9) +
            crate(18, 43, 9) +
            crate(13, 34, 9) +
            barrel(26, 41) +
            P('M60 70 L98 70 L92 82 L66 82Z', '#fff', 2) +
            R(70, 60, 14, 10, 1.5, '#f7f3ea', 1.8) +
            win(73, 62, 4) +
            L('M77 60 V50', 1.6) +
            P('M77 50 l8 2 l-8 3Z', RED, 1.2),
    ],
    // ---------- Réception : kiosque d'accueil → maison d'accueil ----------
    guests: [
        () =>
            SHADOW(50, 87, 30, 3) +
            R(34, 54, 32, 32, 2, '#f7e3c0', 2) +
            P('M28 56 L50 36 L72 56Z', '#c8453a') +
            door(44, 66, 12, 20, '#7a4c26') +
            win(36, 62, 7) +
            win(57, 62, 7) +
            L('M20 86 V64', 2.2) +
            R(14, 56, 14, 9, 1.5, '#fff', 1.8) +
            L('M17 60 h8', 1.2) +
            C(50, 48, 3.5, '#f2c14e', 1.5) +
            L('M50 44.5 v-3', 1.4) +
            flag(72, 56, BLUE),
        () =>
            SHADOW(50, 87, 46, 3) +
            R(14, 44, 72, 42, 2, '#f1d9a6', 2.2) +
            P('M10 46 L50 22 L90 46Z', GREEN) +
            HL(36, 34, 9, 2.4, -24, 0.4) +
            [20, 33, 61, 74].map(x => win(x, 54, 8)).join('') +
            R(40, 58, 20, 28, 10, '#7a4c26', 2) +
            C(50, 52, 5, '#fff7e0', 1.8) +
            L('M50 52 V49 M50 52 L52.5 53.5', 1.2) +
            R(8, 74, 16, 5, 1.5, WOOD, 1.6) +
            L('M10 79 v7 M22 79 v7', 1.6) +
            R(76, 74, 16, 5, 1.5, WOOD, 1.6) +
            L('M78 79 v7 M90 79 v7', 1.6) +
            L('M32 50 q4 4 8 0 M60 50 q4 4 8 0', 1.1, '#f2c14e') +
            flag(14, 46, RED) +
            flag(86, 46, '#f2c14e'),
    ],
};

// ---------- le chantier d'une branche : tant que le palier 2 n'est pas atteint ----------
const SITE_NAMES = {
    barn: 'Grange',
    kitchen: 'Cuisines',
    field: 'Aide au champ',
    trade: 'Commerce',
    annex: 'Annexes',
    armand: 'Suite d’Armand',
    cargo: 'Piste',
    quay: 'Quai',
    guests: 'Réception',
};
const site = (b, n) =>
    SHADOW(50, 78, 36, 4) +
    E(50, 72, 34, 10, '#c9a36a', 0, 1.6) +
    [20, 40, 60, 80].map(x => L(`M${x} 78 V60`, 2.4)).join('') +
    L('M20 62 Q35 66 50 62 T80 62', 1.2, '#f5efe0') +
    crate(30, 66, 8) +
    R(56, 64, 12, 3, 1, '#d9b57a', 1.2) +
    R(56, 67, 12, 3, 1, '#d9b57a', 1.2) +
    R(34, 40, 32, 14, 2, '#f7ecd8', 1.8) +
    L('M50 54 V62', 2) +
    `<text x="50" y="50" font-size="7.4" font-weight="700" text-anchor="middle" fill="${O}" font-family="sans-serif">${SITE_NAMES[b]}</text>` +
    (n ? `<text x="50" y="33" font-size="8" font-weight="700" text-anchor="middle" fill="#6b4a1c" font-family="sans-serif">${n} / 5</text>` : '');

// l'étape à dessiner : 0 chantier, 1 modeste (palier 2), 2 grande (palier 5)
export const domStage = lvl => (lvl >= 5 ? 2 : lvl >= 2 ? 1 : 0);
export const domPiece = (b, lvl) => (domStage(lvl) ? DOM_ART[b][domStage(lvl) - 1]() : site(b, lvl));
// la vignette d'une branche (cartes de la feuille du domaine)
export const domThumb = (b, lvl) =>
    `<svg class="dom-thumb" viewBox="0 0 100 90" aria-hidden="true"><path d="M0 70 Q50 62 100 70 V90 H0Z" fill="#9bd96f"/>${domPiece(b, lvl)}</svg>`;

// ---------- la vue d'ensemble du domaine ----------
const tree = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">${SHADOW(0, 2, 9, 2.4)}${R(-2, -9, 4, 11, 1, '#8b5a2b', 1.4)}${C(0, -17, 9, '#4f9f3a', 1.8)}${C(-4, -19, 3.4, '#7bc65a', 0)}</g>`;
const fence = (x0, y, n) =>
    [...Array(n)].map((_, k) => R(x0 + k * 9, y - 7, 2.6, 8, 0.6, '#d9b57a', 1.1)).join('') + L(`M${x0} ${y - 4} H${x0 + n * 9}`, 1.5, O);
const rows = (x, y, n) => [...Array(n)].map((_, k) => L(`M${x} ${y + k * 6} H${x + 40}`, 2.2, k % 2 ? '#5fae3c' : '#3f8f2e')).join('');
const bed = (x, y) => E(x, y, 11, 4, '#6b4a2a', 0, 1.4) + FC(x - 5, y - 1, 2, '#e8364b') + FC(x, y - 2, 2, '#ffd23f') + FC(x + 5, y - 1, 2, '#f6a5b5');
const SLOTS = {
    barn: [10, 16, 1],
    cargo: [236, 10, 1],
    field: [22, 138, 0.92],
    kitchen: [128, 118, 0.96],
    trade: [244, 120, 0.94],
    annex: [14, 246, 0.9],
    armand: [124, 232, 1],
    guests: [132, 346, 0.95],
    quay: [250, 336, 0.95],
};
export function domaineScene(levels) {
    const lv = b => (levels && levels[b]) || 0;
    const order = Object.keys(SLOTS).sort((a, b) => SLOTS[a][1] + 90 * SLOTS[a][2] - (SLOTS[b][1] + 90 * SLOTS[b][2]));
    const bg =
        `<rect width="360" height="470" fill="#bfe6fb"/>` +
        FE0(20, 22, 26, 8) +
        FE0(280, 40, 30, 9) +
        `<path d="M0 60 Q70 36 150 52 T360 40 V470 H0Z" fill="#b7d97a"/>` +
        `<path d="M0 150 Q120 126 240 146 T360 138 V470 H0Z" fill="#9bd96f"/>` +
        `<path d="M200 330 Q250 318 300 326 Q340 332 360 322 V470 H180 Q170 400 200 330Z" fill="#5aa9e6"/>` +
        `<path d="M214 372 q10 -4 20 0 M290 440 q10 -4 20 0 M246 420 q8 -3 16 0" stroke="#bfe6fb" stroke-width="1.4" fill="none"/>` +
        // chemins : une grande allée depuis l'entrée, des sentiers vers chaque bâtiment
        `<g stroke="#f2d6a2" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round">` +
        `<path d="M170 470 C172 430 150 410 170 380 C190 350 150 330 170 300 C190 270 150 250 172 220 C190 190 160 170 176 120 C186 90 170 70 160 60"/>` +
        `<path d="M170 300 C140 296 110 296 60 292 M172 220 C140 212 100 212 80 196 M176 120 C150 118 120 124 100 124"/>` +
        `<path d="M172 220 C210 226 240 226 260 214 M176 150 C220 154 250 150 290 126 M174 372 C200 376 220 380 245 384"/>` +
        `<path d="M180 70 C220 70 250 70 280 70"/></g>` +
        `<g stroke="#e4bf84" stroke-width="2" fill="none" stroke-dasharray="1 5" stroke-linecap="round"><path d="M170 470 C172 430 150 410 170 380"/></g>`;
    // portail d'entrée
    const gate =
        R(142, 452, 5, 18, 1, '#8b5a2b', 1.6) +
        R(194, 452, 5, 18, 1, '#8b5a2b', 1.6) +
        L('M144 454 Q170 444 197 454', 2.6) +
        `<rect x="156" y="440" width="30" height="8" rx="2" fill="#f7ecd8" stroke="${O}" stroke-width="1.4"/><text x="171" y="446.4" font-size="6" font-weight="700" text-anchor="middle" fill="${O}" font-family="sans-serif">DOMAINE</text>`;
    const deco =
        fence(8, 134, 8) +
        fence(200, 104, 3) +
        fence(8, 236, 7) +
        fence(234, 238, 9) +
        tree(112, 108, 1.1) +
        tree(232, 110, 0.9) +
        tree(120, 222, 1.1) +
        tree(222, 232, 1) +
        tree(8, 300, 1.2) +
        tree(36, 330, 1) +
        tree(100, 330, 0.9) +
        tree(212, 326, 1) +
        tree(330, 232, 1.1) +
        tree(346, 262, 0.9) +
        tree(60, 440, 1.1) +
        tree(100, 456, 0.9) +
        bed(110, 290) +
        bed(220, 290) +
        bed(100, 400) +
        bed(236, 300) +
        rows(18, 226, 3) +
        '';
    const parts = order.map(b => {
        const [x, y, s] = SLOTS[b];
        return `<g transform="translate(${x} ${y}) scale(${s})">${domPiece(b, lv(b))}</g>`;
    });
    return `<svg class="dom-scene" viewBox="0 0 360 470" role="img" aria-label="Vue du domaine">${bg}${deco}${gate}${parts.join('')}</svg>`;
}
function FE0(x, y, rx, ry) {
    return `<ellipse cx="${x + rx}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff" opacity=".85"/><ellipse cx="${x + rx + 14}" cy="${y - 4}" rx="${rx * 0.6}" ry="${ry * 0.8}" fill="#fff" opacity=".85"/>`;
}
