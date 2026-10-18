// 1.11 : la nature repensée — arbres, minerais, lingots, pierres précieuses, bijoux, bûcheron, outils.
import { C, E, F, FC, FE, HL, L, O, P, R, SHADOW, items, ui, people } from './kit.js';
import { bust, face } from './people.js';
import { plate } from './items2.js';

// ================= les minerais =================
const ROCK = 'M8 48 L10 32 L22 20 L38 18 L52 28 L56 46 L48 56 L18 56Z';
const rockOf = (base, line, specks, extra = '') =>
    SHADOW(32, 58, 24, 3) +
    P(ROCK, base) +
    L('M22 20 L28 36 L10 32 M28 36 L46 38 L52 28 M46 38 L56 46 M28 36 L30 56', 1.6, line) +
    specks +
    extra +
    HL(22, 28, 5, 2.2, -30, 0.4);
const speck = (list, c, r = 2) => list.map(([x, y]) => P(`M${x - r} ${y} L${x} ${y - r} L${x + r} ${y} L${x} ${y + r}Z`, c, 1)).join('');
const SPOTS = [
    [20, 40],
    [32, 28],
    [42, 44],
    [46, 32],
    [28, 48],
    [16, 30],
];

const ORES = {
    // charbon : trois morceaux noirs et brillants
    coal:
        SHADOW(32, 58, 24, 3) +
        P('M6 50 L10 36 L22 32 L30 42 L28 54 L12 56Z', '#33343d') +
        P('M26 52 L30 34 L42 28 L52 38 L50 54 L36 58Z', '#2a2b33') +
        P('M18 34 L22 20 L34 16 L42 26 L36 36 L24 38Z', '#3d3e48') +
        L('M22 20 L28 28 L24 38 M42 26 L36 36 M30 34 L36 36', 1.2, '#1c1c22') +
        F('M23 21 L33 18 L30 24 L24 27Z', '#7d7f8d', 0.8) +
        F('M13 38 L20 36 L16 42Z', '#7d7f8d', 0.7) +
        F('M34 33 L41 30 L38 36Z', '#7d7f8d', 0.7),
    ironOre: rockOf('#8d8a86', '#615e5a', speck(SPOTS, '#c8602a', 2.4) + speck([[38, 24]], '#e08a4a', 1.6)),
    copperOre: rockOf('#8c9690', '#5f6a64', speck(SPOTS, '#4ab59a', 2.4) + speck([[38, 24]], '#e08a4a', 2)),
    silverOre: rockOf('#9aa2ae', '#6b7480', speck(SPOTS, '#f4f8ff', 2.4) + speck([[38, 24]], '#cfe3ff', 1.8)),
    goldOre: rockOf('#8f8575', '#665c4c', speck(SPOTS, '#f2c14e', 2.6) + speck([[38, 24]], '#ffe48a', 2)),
};

// ================= les lingots =================
const ingotAt = (x, y, c, top, line) =>
    P(`M${x + 5} ${y} L${x + 21} ${y} L${x + 26} ${y + 8} L${x} ${y + 8}Z`, top, 2) +
    P(`M${x} ${y + 8} L${x + 26} ${y + 8} L${x + 24} ${y + 17} L${x + 2} ${y + 17}Z`, c, 2) +
    L(`M${x + 6} ${y + 3} L${x + 20} ${y + 3}`, 1.1, line) +
    F(`M${x + 3} ${y + 9.5} L${x + 7} ${y + 9.5} L${x + 6} ${y + 15} L${x + 4} ${y + 15}Z`, '#fff', 0.45);
const ingots = (c, top, line) => SHADOW(32, 58, 26, 3) + ingotAt(4, 38, c, top, line) + ingotAt(32, 38, c, top, line) + ingotAt(18, 22, c, top, line);
const INGOTS = {
    ironIngot: ingots('#7d8794', '#aab4c0', '#6b7480'),
    copperIngot: ingots('#c9692f', '#e8935a', '#a4501f'),
    silverIngot: ingots('#b8c4d4', '#eef3fa', '#8794a8'),
    goldIngot: ingots('#e0a82a', '#ffe08a', '#b8801a'),
    // la pierre taillée : un bloc d'angle net, sillons de ciseau
    cutStone:
        SHADOW(32, 58, 24, 3) +
        P('M10 24 L32 12 L54 24 L32 36Z', '#d6dbe0') +
        P('M10 24 L32 36 L32 58 L10 46Z', '#a7adb4') +
        P('M54 24 L32 36 L32 58 L54 46Z', '#8d949c') +
        L('M18 28 L32 36 M24 24 L40 32', 1.2, '#b6bcc3') +
        L('M32 40 L32 54', 1, '#7d848c') +
        F('M14 30 L14 42 L18 44 L18 33Z', '#fff', 0.35) +
        HL(26, 22, 6, 1.4, -26, 0.55),
    // le bois dur : une bûche de chêne coupée net, ses cernes à l'air
    hardwood:
        SHADOW(32, 58, 24, 3) +
        P('M8 22 L48 22 Q56 22 56 34 Q56 46 48 46 L8 46Z', '#7a4a24') +
        E(8, 34, 7, 12, '#e8c38c') +
        `<ellipse cx="8" cy="34" rx="3.6" ry="6.6" fill="none" stroke="#b07a45" stroke-width="1.4"/>` +
        `<ellipse cx="8" cy="34" rx="1.2" ry="2.2" fill="#b07a45"/>` +
        L('M16 26 L50 26 M18 34 L52 34 M16 42 L48 42', 1.4, '#5a3216') +
        HL(30, 26, 12, 1.4, 0, 0.35) +
        P('M30 46 L44 46 L46 56 L28 56Z', '#9c6a2a', 2),
    // le chêne massif : une grosse poutre pleine, honorable
    solidOak:
        SHADOW(32, 58, 26, 3) +
        P('M6 24 L50 18 L58 26 L58 46 L50 52 L6 46Z', '#b07a3a') +
        P('M6 24 L50 18 L58 26 L14 32Z', '#d9a85a') +
        P('M50 18 L58 26 L58 46 L50 52Z', '#8e5e24') +
        E(54, 36, 5, 9, '#e8c38c') +
        `<ellipse cx="54" cy="36" rx="2.4" ry="4.8" fill="none" stroke="#b07a45" stroke-width="1.2"/>` +
        L('M10 32 Q28 30 46 33 M10 38 Q26 37 46 40 M10 44 Q30 42 46 46', 1.2, '#8e5e24') +
        FC(24, 36, 1.8, '#6a4210') +
        HL(22, 22, 12, 1.2, -4, 0.55),
    // la résine : des gouttes d'ambre sur un morceau d'écorce de pin
    resin:
        SHADOW(32, 58, 22, 3) +
        P('M10 40 L50 34 L56 54 L14 58Z', '#7a4a2a') +
        L('M18 44 L16 56 M30 42 L28 57 M42 40 L42 55', 1.4, '#5a3216') +
        P('M22 20 Q22 12 28 8 Q34 14 34 20 Q34 28 28 28 Q22 28 22 20Z', '#e8a43a') +
        P('M38 30 Q38 24 42 20 Q46 26 46 30 Q46 36 42 36 Q38 36 38 30Z', '#f2c14e') +
        P('M30 34 Q30 30 33 27 Q36 31 36 34 Q36 38 33 38 Q30 38 30 34Z', '#d98a2a') +
        F('M25 14 Q27 11 29 11 Q27 14 26 20Z', '#fff', 0.7) +
        F('M40 24 Q42 22 43 22 Q42 25 41 29Z', '#fff', 0.7),
};

// la sève et le sirop de bouleau : des fioles à bouchon
const flask = (liquid, label) =>
    SHADOW(32, 60, 16, 2.6) +
    P('M26 6 L38 6 L38 18 Q48 24 48 38 L48 56 Q48 60 44 60 L20 60 Q16 60 16 56 L16 38 Q16 24 26 18Z', '#f4fbff') +
    F('M17.6 40 L46.4 40 L46.4 56 Q46.4 58.4 44 58.4 L20 58.4 Q17.6 58.4 17.6 56Z', liquid, 0.92) +
    R(22, 42, 20, 12, 3, '#fffaf0', 1.4) +
    label +
    P('M26 6 L38 6 L38 18 Q48 24 48 38 L48 56 Q48 60 44 60 L20 60 Q16 60 16 56 L16 38 Q16 24 26 18Z', 'none') +
    R(24, 2, 16, 6, 2.4, '#a8693a') +
    F('M20 38 L23 34 L23 54 L20 54Z', '#fff', 0.5);
const birchMark = L('M26 46 L30 46 M33 50 L38 50 M27 52 L31 52', 1.6, '#3a2618');
const SAP = {
    birchSap: flask('#dff0e6', birchMark),
    birchSyrup: flask('#d98a2a', birchMark),
};

// ================= les pierres précieuses =================
const gem = (c1, c2, c3, c4) =>
    SHADOW(32, 58, 20, 3) +
    P('M12 26 L22 12 L42 12 L52 26 L32 56Z', c1) +
    P('M12 26 L22 12 L32 26Z', c2, 1.8) +
    P('M22 12 L42 12 L32 26Z', c4, 1.8) +
    P('M42 12 L52 26 L32 26Z', c2, 1.8) +
    P('M12 26 L32 26 L32 56Z', c1, 1.8) +
    P('M52 26 L32 26 L32 56Z', c3, 1.8) +
    HL(26, 18, 4, 1.4, -10, 0.8) +
    FC(44, 42, 1.4, '#fff', 0.7);
const GEMS = {
    quartz:
        SHADOW(32, 58, 22, 3) +
        P('M12 54 L16 26 L22 14 L28 28 L28 54Z', '#e9e1f5') +
        P('M26 54 L28 18 L34 6 L42 20 L42 54Z', '#f6f0fb') +
        P('M40 54 L42 30 L48 22 L54 32 L52 54Z', '#d9cfeb') +
        L('M22 14 L22 54 M34 6 L34 54 M48 22 L47 54', 1.2, '#b8a8d4') +
        F('M16 28 L19 20 L19 50 L16 50Z', '#fff', 0.7) +
        F('M30 20 L33 12 L33 50 L30 50Z', '#fff', 0.8) +
        FC(46, 38, 1.4, '#fff', 0.9),
    ruby: gem('#d92f4e', '#f06a82', '#a31d38', '#ff9aaa'),
    sapphire: gem('#2f63d8', '#6a95f0', '#1d3f9e', '#9ab8ff'),
    emerald: gem('#2fa84a', '#6adb82', '#1d7432', '#a8f0b8'),
};

// ================= les bijoux =================
const ringOf = (metal, hi, gemC, gemHi) =>
    SHADOW(32, 58, 20, 3) +
    `<circle cx="32" cy="40" r="14" fill="none" stroke="${O}" stroke-width="8"/>` +
    `<circle cx="32" cy="40" r="14" fill="none" stroke="${metal}" stroke-width="4.4"/>` +
    L('M22 34 Q24 30 28 28', 1.4, hi) +
    P('M24 22 L28 14 L36 14 L40 22 L32 30Z', gemC, 2) +
    F('M27 17 L33 17 L31 22Z', gemHi, 0.9) +
    HL(30, 18, 2.4, 1.2, -10, 0.8);
const pendantOf = (metal, hi, gemC, gemHi) =>
    SHADOW(32, 58, 18, 3) +
    L('M14 6 Q18 36 32 40 Q46 36 50 6', 4.4) +
    L('M14 6 Q18 36 32 40 Q46 36 50 6', 1.8, metal) +
    P('M32 38 L24 46 L32 58 L40 46Z', gemC, 2) +
    P('M32 38 L24 46 L40 46Z', gemHi, 1.4) +
    FC(32, 38, 2.4, metal) +
    HL(30, 46, 2, 1, -10, 0.8) +
    L('M20 24 L22 22', 1.2, hi);
const broochOf = (metal, hi, gemC, gemHi) =>
    SHADOW(32, 58, 22, 3) +
    P('M32 8 L38 16 L48 14 L46 24 L54 30 L46 36 L48 46 L38 44 L32 52 L26 44 L16 46 L18 36 L10 30 L18 24 L16 14 L26 16Z', metal, 2.2) +
    C(32, 30, 11, gemC, 2) +
    P('M32 22 L38 28 L32 30 L26 28Z', gemHi, 1) +
    FC(28, 27, 1.8, '#fff', 0.85) +
    L('M24 8 L26 10', 1.2, hi);
const GOLD = ['#e0a82a', '#ffe08a'];
const SILVER = ['#b8c4d4', '#f4f8ff'];
const RUBY = ['#d92f4e', '#ff9aaa'];
const SAPPH = ['#2f63d8', '#9ab8ff'];
const EMER = ['#2fa84a', '#a8f0b8'];
const QUARTZ = ['#e9e1f5', '#ffffff'];
const JEWELS = {
    quartzPendant: pendantOf(...SILVER, ...QUARTZ),
    rubyRing: ringOf(...GOLD, ...RUBY),
    rubyBrooch: broochOf(...SILVER, ...RUBY),
    sapphirePendant: pendantOf(...SILVER, ...SAPPH),
    sapphireRing: ringOf(...SILVER, ...SAPPH),
    emeraldBrooch: broochOf(...GOLD, ...EMER),
    emeraldRing: ringOf(...GOLD, ...EMER),
    // un vase de cristal de roche
    crystalVase:
        SHADOW(32, 60, 17, 3) +
        P('M22 8 L42 8 L40 18 Q52 28 48 44 Q46 58 32 58 Q18 58 16 44 Q12 28 24 18Z', '#e6f2fb') +
        F('M18 46 Q20 56 32 56 Q44 56 46 46 Q40 50 32 50 Q24 50 18 46Z', '#cfe3f4', 0.9) +
        P('M26 36 L32 28 L38 36 L32 46Z', '#f6f0fb', 1.4) +
        L('M26 36 L38 36 M32 28 L32 46', 0.9, '#b8a8d4') +
        F('M20 24 Q18 34 20 42 L23 40 Q21 33 23 26Z', '#fff', 0.8) +
        R(21, 6, 22, 5, 2, '#d9e6f2', 1.6),
};

// ================= les objets de la forge =================
const FORGED = {
    // la poêle en fer
    ironPan:
        SHADOW(32, 58, 24, 3) +
        L('M44 40 L60 48', 7) +
        L('M44 40 L60 48', 3.6, '#7a4a2a') +
        E(26, 40, 22, 11, '#4a4f58') +
        E(26, 38, 18, 8, '#6b717c', 0, 1.6) +
        F('M12 38 Q16 33 24 33 Q16 35 14 40Z', '#fff', 0.5) +
        FC(46, 41, 1.2, '#9aa2ae'),
    // la casserole de cuivre, son couvercle
    copperPot:
        SHADOW(32, 59, 24, 3) +
        L('M8 34 L2 30 M56 34 L62 30', 4.4) +
        L('M8 34 L2 30 M56 34 L62 30', 2.2, '#b8501f') +
        P('M10 30 L54 30 L50 56 Q50 59 46 59 L18 59 Q14 59 14 56Z', '#c9692f') +
        F('M12 38 L52 38 L51 42 L13 42Z', '#e8935a', 0.8) +
        E(32, 30, 22, 5.5, '#e8935a') +
        P('M20 28 Q20 16 32 16 Q44 16 44 28Z', '#d9824a') +
        C(32, 14, 3, '#7a4a2a', 1.6) +
        F('M22 30 L26 22 L26 28Z', '#fff', 0.55),
    // les couverts d'argent
    silverCutlery:
        SHADOW(32, 58, 22, 3) +
        `<g transform="rotate(-14 32 32)">` +
        L('M22 28 L22 58', 6.4) +
        L('M22 28 L22 58', 3.2, '#d6dee8') +
        P('M14 6 L14 20 Q14 26 22 26 Q30 26 30 20 L30 6', '#e8eef5', 2) +
        L('M18 6 L18 18 M22 6 L22 18 M26 6 L26 18', 1.2, '#9aa6b8') +
        `</g>` +
        `<g transform="rotate(14 32 32)">` +
        L('M42 26 L42 58', 6.4) +
        L('M42 26 L42 58', 3.2, '#d6dee8') +
        E(42, 14, 7, 11, '#eef3fa') +
        HL(40, 11, 2, 4, -8, 0.8) +
        `</g>`,
    // la cloche dorée
    goldenBell:
        SHADOW(32, 59, 20, 3) +
        L('M32 6 L32 14', 3) +
        P('M14 50 Q16 22 32 14 Q48 22 50 50Z', '#e0a82a') +
        P('M10 50 L54 50 L52 56 L12 56Z', '#c9952a', 2) +
        C(32, 58, 4, '#8b5a2b', 1.6) +
        F('M20 46 Q21 28 30 20 L30 24 Q24 32 24 46Z', '#fff', 0.55) +
        L('M22 38 Q32 42 42 38', 1.2, '#b8801a'),
    // la torche de résine
    pineTorch:
        SHADOW(32, 59, 12, 2.6) +
        L('M26 58 L38 24', 8) +
        L('M26 58 L38 24', 4.6, '#8b5a2b') +
        P('M30 28 Q26 16 36 4 Q36 14 42 18 Q46 26 40 32 Q35 34 30 28Z', '#f2602a') +
        P('M34 28 Q32 20 38 12 Q38 18 41 22 Q42 28 38 30Z', '#ffd23f', 1.4) +
        P('M33 40 L42 38 L40 44 L32 46Z', '#e8a43a', 1.4),
    // la bougie à la résine
    resinCandle:
        SHADOW(32, 59, 14, 2.6) +
        P('M20 28 L44 28 L42 56 Q42 59 38 59 L26 59 Q22 59 22 56Z', '#e8a43a') +
        F('M23 32 L27 32 L26 54 L24 54Z', '#fff', 0.5) +
        L('M32 28 L32 22', 2) +
        P('M28 22 Q27 12 32 4 Q37 12 36 22Z', '#f2c14e') +
        P('M30 22 Q30 15 32 11 Q34 15 34 22Z', '#fff2a8', 1),
    // un pain d'épices au sirop de bouleau
    birchGingerbread:
        plate(46) +
        P('M10 44 Q12 26 32 26 Q52 26 54 44 Q32 52 10 44Z', '#a8602a') +
        P('M14 40 Q16 30 32 30 Q48 30 50 40 Q32 46 14 40Z', '#c8863a', 0) +
        F('M16 32 Q32 24 48 32 Q50 38 46 40 Q32 36 18 40Z', '#d98a2a', 0.9) +
        L('M20 34 L22 40 M30 32 L31 40 M40 33 L42 40', 1.6, '#f6e0b0') +
        FC(26, 36, 1.4, '#f6e0b0') +
        FC(37, 37, 1.4, '#f6e0b0'),
    // la crêpe au sirop de bouleau
    syrupCrepe:
        plate(46) +
        P('M10 42 Q14 28 32 28 Q50 28 54 42 Q32 50 10 42Z', '#f2d49b') +
        P('M14 38 Q20 32 32 32 Q44 32 50 38 Q32 44 14 38Z', '#e8b86a', 0) +
        P('M16 38 Q22 33 32 33 Q42 33 48 38 Q36 36 32 41 Q28 36 16 38Z', '#d98a2a') +
        F('M26 38 Q28 44 30 46 Q27 46 25 41Z', '#d98a2a', 0.95) +
        E(46, 34, 5, 3, '#f6ead0', -20, 1.4),
};

// ================= les outils (6 niveaux : fer, argent, or) =================
const axeOf = (head, hi) =>
    `<g transform="rotate(-30 32 32)">` +
    L('M32 8 L32 60', 7) +
    L('M32 8 L32 60', 3.5, '#b07a45') +
    P('M30 8 C18 6 10 14 12 24 C18 22 26 22 30 22Z', head) +
    F('M16 18 C18 12 24 10 28 11 L28 14 C22 14 18 16 16 20Z', hi, 0.8) +
    `</g>`;
const pickOf = (head, hi) =>
    `<g transform="rotate(20 32 32)">` +
    L('M32 14 L32 60', 7) +
    L('M32 14 L32 60', 3.5, '#b07a45') +
    P('M6 22 C16 8 48 8 58 22 C46 16 18 16 6 22Z', head) +
    F('M14 18 C22 11 40 11 50 18 C40 14 22 14 14 18Z', hi, 0.8) +
    `</g>`;
const TOOLS = {
    axeIron: axeOf('#7d8794', '#e6edf3'),
    axeSilver: axeOf('#cfd8e4', '#ffffff'),
    axeGold: axeOf('#e0a82a', '#fff2a8'),
    pickIron: pickOf('#7d8794', '#e6edf3'),
    pickSilver: pickOf('#cfd8e4', '#ffffff'),
    pickGold: pickOf('#e0a82a', '#fff2a8'),
};

// ================= la forêt =================
const trunk = (d, w = 9) => L(d, w + 3.4) + L(d, w, '#8b5a2b');
const TREES = {
    // le chêne : large, feuillage rond, des glands
    treeOak:
        SHADOW(32, 58, 22, 3) +
        trunk('M32 58 L32 36', 10) +
        L('M32 44 L22 34 M32 42 L42 32', 5.4) +
        L('M32 44 L22 34 M32 42 L42 32', 3, '#8b5a2b') +
        C(18, 28, 12, '#3f8f2e') +
        C(46, 28, 12, '#3f8f2e') +
        C(32, 18, 15, '#4f9e3a') +
        C(26, 30, 11, '#5aaa42') +
        C(40, 31, 10, '#5aaa42') +
        HL(26, 14, 5, 2, -20, 0.5) +
        [
            [22, 36],
            [36, 38],
            [44, 24],
        ]
            .map(([x, y]) => E(x, y, 2.2, 2.8, '#c9952a', 0, 1.2) + R(x - 2.6, y - 3.8, 5.2, 2.6, 1.2, '#7a4a24', 1))
            .join(''),
    // le pin : trois étages de vert sombre, des pommes de pin
    treePine:
        SHADOW(32, 58, 18, 3) +
        trunk('M32 58 L32 40', 6) +
        P('M32 4 L48 26 L40 26 L52 42 L12 42 L24 26 L16 26Z', '#2f7d4a') +
        P('M32 4 L40 20 L36 20 L46 34 L32 34Z', '#3f9a58', 0) +
        F('M32 8 L40 22 L34 22 L44 36 L32 36Z', '#3f9a58', 0.8) +
        L('M24 26 L32 20 M20 42 L32 34 M44 42 L36 34', 1.2, '#1f5a34') +
        E(24, 40, 2, 3, '#a8693a', 20, 1.2) +
        E(42, 38, 2, 3, '#a8693a', -20, 1.2) +
        HL(26, 20, 3, 1.6, -30, 0.35),
    // le bouleau : tronc blanc à encoches noires, feuillage clair
    treeBirch:
        SHADOW(32, 58, 18, 3) +
        L('M32 58 L33 24', 10) +
        L('M32 58 L33 24', 6.6, '#f2f0e8') +
        L('M29 46 L33 46 M32 38 L36 38 M29 30 L32 30 M31 52 L35 52', 1.8, '#3a2618') +
        L('M33 36 L42 28 M32 44 L24 36', 4.6) +
        L('M33 36 L42 28 M32 44 L24 36', 2.2, '#f2f0e8') +
        C(26, 22, 10, '#a8d65a') +
        C(42, 24, 10, '#a8d65a') +
        C(34, 12, 12, '#c4e86a') +
        C(30, 26, 8, '#b8e060') +
        HL(30, 10, 4, 1.6, -20, 0.55) +
        [
            [22, 20],
            [40, 14],
            [46, 28],
            [30, 6],
        ]
            .map(([x, y]) => FE(x, y, 2, 3.2, '#f6ffd0', 0.9, 30))
            .join(''),
    // le châtaignier : large, sombre, des bogues hérissées
    treeChestnut:
        SHADOW(32, 58, 22, 3) +
        trunk('M32 58 L32 34', 11) +
        C(16, 28, 11, '#2f7d3a') +
        C(48, 28, 11, '#2f7d3a') +
        C(32, 16, 14, '#3a9140') +
        C(24, 30, 10, '#46a04a') +
        C(40, 30, 10, '#46a04a') +
        [
            [20, 36],
            [32, 34],
            [44, 38],
            [38, 22],
            [24, 20],
        ]
            .map(
                ([x, y]) =>
                    C(x, y, 4, '#9bc43a', 1.2) +
                    L(
                        `M${x - 5} ${y} L${x + 5} ${y} M${x} ${y - 5} L${x} ${y + 5} M${x - 3.6} ${y - 3.6} L${x + 3.6} ${y + 3.6} M${x - 3.6} ${y + 3.6} L${x + 3.6} ${y - 3.6}`,
                        0.8,
                        '#6a8a20',
                    ),
            )
            .join('') +
        HL(26, 12, 5, 2, -20, 0.45),
    // la jeune pousse : une tige, deux feuilles, un tuteur
    sapling:
        SHADOW(32, 58, 14, 2.6) +
        L('M32 58 L32 28', 6) +
        L('M32 58 L32 28', 3, '#8b5a2b') +
        P('M32 36 Q18 36 14 24 Q28 22 32 34Z', '#6cc04a') +
        P('M32 30 Q46 30 50 18 Q36 16 32 28Z', '#8fd65f') +
        L('M32 36 L20 28 M32 30 L44 22', 1, '#3f8f2e') +
        L('M24 58 L24 46 M40 58 L40 46', 2.6) +
        L('M24 58 L24 46 M40 58 L40 46', 1.2, '#c08b52') +
        HL(22, 28, 3, 1.2, -30, 0.5),
};

// ================= la mine : les roches, les veines, les trois profondeurs =================
const vein = (base, line, c1, c2) =>
    rockOf(base, line, speck(SPOTS, c1, 2.6)) +
    `<g opacity=".95">` +
    P('M44 12 L47 6 L50 12 L47 18Z', c2, 1.2) +
    P('M12 14 L14 9 L16 14 L14 19Z', c2, 1.2) +
    `</g>`;
const ROCKS = {
    rockCoal: rockOf('#52535c', '#2a2b33', speck(SPOTS, '#9aa0ad', 1.6)),
    rockIron: rockOf('#8d8a86', '#615e5a', speck(SPOTS, '#c8602a', 2.2)),
    rockCopper: rockOf('#8c9690', '#5f6a64', speck(SPOTS, '#4ab59a', 2.2)),
    rockSilver: rockOf('#9aa2ae', '#6b7480', speck(SPOTS, '#f4f8ff', 2.2)),
    rockGold: rockOf('#8f8575', '#665c4c', speck(SPOTS, '#f2c14e', 2.4)),
    // une veine : un filon qui brille, minerai ou pierre précieuse garantis
    rockVein: vein('#8f8575', '#665c4c', '#ffe48a', '#ffe48a'),
};
// la carrière : le roc à ciel ouvert
ui.mineQuarry = () =>
    P('M0 0 L64 0 L64 64 L0 64Z', '#9bd4f2', 0) +
    P('M0 44 L10 24 L22 34 L38 14 L54 30 L64 22 L64 64 L0 64Z', '#a7adb4') +
    L('M10 24 L16 44 M38 14 L34 44 M54 30 L48 50', 1.6, '#7d848c') +
    P('M0 52 L20 46 L44 52 L64 46 L64 64 L0 64Z', '#8d949c') +
    L('M44 8 L44 30', 2.4, '#8b5a2b') +
    P('M40 8 L54 8 L50 14 L44 14Z', '#c8453a', 1.6) +
    HL(30, 24, 5, 1.6, -30, 0.45);
// la galerie : un tunnel étayé, une lampe, des rails
ui.mineGallery = () =>
    P('M4 60 L4 20 Q4 4 32 4 Q60 4 60 20 L60 60Z', '#3a2f3a') +
    P('M12 60 L12 24 Q12 12 32 12 Q52 12 52 24 L52 60Z', '#554a58') +
    L('M10 60 L10 22 M54 60 L54 22 M10 22 Q32 6 54 22', 5.4) +
    L('M10 60 L10 22 M54 60 L54 22 M10 22 Q32 6 54 22', 3, '#8b5a2b') +
    L('M20 62 L26 44 M44 62 L38 44', 2.2, '#c9d3dc') +
    L('M18 58 L46 58 M22 50 L42 50', 2.6, '#8b5a2b') +
    L('M32 8 L32 18', 1.6) +
    C(32, 22, 5, '#ffd23f', 1.6) +
    FC(32, 22, 9, 'rgba(255,226,120,.28)') +
    FC(30.6, 20.6, 1.6, '#fff');
// la grotte : des cristaux qui brillent
ui.mineCave = () =>
    P('M2 62 L2 18 Q10 2 32 2 Q54 2 62 18 L62 62Z', '#2a2540') +
    P('M10 62 L10 28 Q16 14 32 14 Q48 14 54 28 L54 62Z', '#3b3560') +
    P('M8 62 L12 44 L18 62Z', '#6aa8f0', 1.6) +
    P('M16 62 L22 36 L28 62Z', '#9a7af0', 1.6) +
    P('M34 62 L40 40 L46 62Z', '#f06a82', 1.6) +
    P('M44 62 L48 48 L56 62Z', '#6adb82', 1.6) +
    P('M20 6 L24 18 L16 18Z', '#9a7af0', 1.4) +
    P('M44 6 L48 16 L40 16Z', '#6aa8f0', 1.4) +
    FE(24, 46, 1.4, 5, '#fff', 0.7, 10) +
    FC(40, 22, 1.8, '#fff', 0.9) +
    FC(14, 30, 1.4, '#fff', 0.9) +
    FC(50, 36, 1.6, '#fff', 0.9);

// ================= les nouveaux lieux et objets =================
// la charbonnière : un four de terre qui fume
ui.charcoalKiln = () =>
    SHADOW(32, 58, 26, 3) +
    P('M6 56 Q6 22 32 20 Q58 22 58 56Z', '#8b5a2b') +
    F('M10 52 Q12 30 32 26 Q22 32 20 54Z', 'rgba(255,255,255,.18)') +
    L('M14 44 Q32 36 50 44 M12 52 Q32 44 52 52 M18 34 Q32 28 46 34', 1.4, '#5a3216') +
    P('M26 56 Q26 44 32 44 Q38 44 38 56Z', '#2a1a10', 2) +
    P('M28 56 Q28 49 32 49 Q36 49 36 56Z', '#f2602a') +
    R(28, 8, 8, 14, 2.4, '#7a4a2a', 2) +
    L('M30 6 Q26 2 30 -2 M36 6 Q32 2 36 -2', 1.6, 'rgba(160,160,170,.85)');
// la lampe du mineur
ui.lamp = () =>
    SHADOW(32, 59, 14, 2.6) +
    L('M24 14 Q32 2 40 14', 2.4) +
    P('M22 16 L42 16 L40 24 L24 24Z', '#7d8794', 2) +
    P('M24 24 L40 24 L42 50 L22 50Z', '#fff2a8') +
    FC(32, 38, 16, 'rgba(255,226,120,.3)') +
    P('M28 46 Q26 36 32 28 Q38 36 36 46Z', '#f2602a') +
    P('M30 46 Q29 40 32 35 Q35 40 34 46Z', '#ffd23f', 1) +
    L('M24 24 L22 50 M32 24 L32 50 M40 24 L42 50', 1.6, '#7d8794') +
    P('M20 50 L44 50 L42 58 L22 58Z', '#7d8794', 2);
// le wagonnet de mine
ui.cart = () =>
    SHADOW(32, 60, 26, 3) +
    P('M6 22 L58 22 L52 48 L12 48Z', '#8d949c') +
    F('M9 28 L55 28 L54 32 L10 32Z', '#a7adb4', 0.9) +
    L('M6 22 L58 22', 3, '#6b717c') +
    P('M14 20 L22 10 L30 16 L36 8 L46 18 L50 20Z', '#a7adb4') +
    FC(26, 14, 2, '#f2c14e') +
    FC(40, 14, 2, '#4ab59a') +
    C(18, 54, 6, '#3a2618') +
    C(46, 54, 6, '#3a2618') +
    FC(18, 54, 2.4, '#c9d3dc') +
    FC(46, 54, 2.4, '#c9d3dc');
// le grenier : un petit comble en bois au-dessus de la grange
ui.granary = () =>
    SHADOW(32, 60, 26, 3) +
    R(22, 52, 4, 8, 1, '#7a4a24', 1.6) +
    R(38, 52, 4, 8, 1, '#7a4a24', 1.6) +
    P('M10 28 L32 8 L54 28Z', '#c8453a') +
    R(14, 28, 36, 24, 2, '#c08b52') +
    L('M14 36 L50 36 M14 44 L50 44', 1.2, '#8b5a2b') +
    R(26, 30, 12, 10, 2, '#5a3216', 1.6) +
    L('M26 35 L38 35 M32 30 L32 40', 1, '#8b5a2b') +
    P('M8 30 L32 6 L56 30', 'none') +
    FC(32, 18, 2.4, '#f6e8c8');
// l'abreuvoir de pierre
ui.trough = () =>
    SHADOW(32, 58, 26, 3) +
    P('M6 30 L58 30 L54 52 Q54 56 50 56 L14 56 Q10 56 10 52Z', '#a7adb4') +
    E(32, 30, 26, 6, '#5aa9e6') +
    E(32, 30, 26, 6, 'none', 0, 2.4) +
    L('M16 38 L20 52 M32 40 L32 54 M48 38 L44 52', 1.2, '#7d848c') +
    HL(20, 29, 8, 1.6, -4, 0.6) +
    L('M42 14 L42 28 M42 14 Q52 14 52 22', 3.6) +
    L('M42 14 L42 28 M42 14 Q52 14 52 22', 1.8, '#c9d3dc');
// les décorations en matériaux : cloche de cuivre, banc de chêne, lanterne en fer forgé
ui.copperBell = () =>
    SHADOW(32, 59, 22, 3) +
    L('M16 8 L48 8', 3.4) +
    L('M16 8 L48 8', 1.6, '#8b5a2b') +
    L('M16 8 L16 58 M48 8 L48 58', 4.4) +
    L('M16 8 L16 58 M48 8 L48 58', 2.2, '#8b5a2b') +
    L('M32 8 L32 18', 2) +
    P('M20 46 Q22 24 32 18 Q42 24 44 46Z', '#c9692f') +
    P('M17 46 L47 46 L45 52 L19 52Z', '#a4501f', 2) +
    C(32, 54, 3, '#8b5a2b', 1.4) +
    F('M24 42 Q25 30 30 24 L30 28 Q27 34 27 42Z', '#fff', 0.5);
ui.oakBench = () =>
    SHADOW(32, 58, 26, 3) +
    P('M6 24 L58 24 L58 32 L6 32Z', '#b07a3a') +
    P('M6 36 L58 36 L58 42 L6 42Z', '#9c6a2a') +
    L('M10 28 L54 28', 1.2, '#8e5e24') +
    R(10, 42, 6, 16, 1.6, '#7a4a24', 1.8) +
    R(48, 42, 6, 16, 1.6, '#7a4a24', 1.8) +
    R(10, 10, 6, 16, 1.6, '#7a4a24', 1.8) +
    R(48, 10, 6, 16, 1.6, '#7a4a24', 1.8) +
    P('M6 12 L58 12 L58 20 L6 20Z', '#b07a3a') +
    HL(20, 14, 8, 1.2, -2, 0.5);
ui.ironLamp = () =>
    SHADOW(32, 59, 14, 2.6) +
    L('M32 58 L32 24', 5.4) +
    L('M32 58 L32 24', 2.6, '#4a4f58') +
    L('M24 58 L40 58', 3.4) +
    L('M32 30 Q44 28 48 18', 4) +
    L('M32 30 Q44 28 48 18', 1.8, '#4a4f58') +
    P('M42 18 L54 18 L52 32 L44 32Z', '#fff2a8') +
    FC(48, 25, 9, 'rgba(255,226,120,.28)') +
    P('M40 18 L56 18 L50 12Z', '#4a4f58', 2) +
    L('M42 18 L44 32 M54 18 L52 32', 1.2, '#4a4f58') +
    P('M46 30 Q44 24 48 20 Q52 24 50 30Z', '#f2602a', 1);

// le bûcheron : un nouveau villageois
people.gaspard = () =>
    bust('#c8453a', L('M10 54 L54 54 M12 60 L52 60 M22 46 L22 66 M32 46 L32 66 M42 46 L42 66', 1.6, 'rgba(58,38,24,.55)') + P('M20 47 L32 58 L44 47', 'none')) +
    face() +
    // la barbe et la moustache
    P('M18 30 C18 46 25 52 32 52 C39 52 46 46 46 30 C44 38 40 41 36 39 C34 38 30 38 28 39 C24 41 20 38 18 30Z', '#a8602a', 2) +
    P('M24 38 Q28 35 32 38 Q36 35 40 38 Q36 41 32 39 Q28 41 24 38Z', '#8a4a1e', 1.4) +
    // le bonnet vert à pompon
    P('M16 25 C16 8 48 8 48 25Z', '#3f8f2e') +
    P('M14 24 L50 24 Q52 28 48 29 L16 29 Q12 28 14 24Z', '#2f6f22', 2) +
    L('M20 14 Q32 10 44 14', 1.2, '#6cc04a') +
    C(32, 7, 4.4, '#f6e8c8', 1.6);

// ================= enregistrement =================
const ITEM_ART = { ...ORES, ...INGOTS, ...SAP, ...GEMS, ...JEWELS, ...FORGED, ...TOOLS, ...TREES, ...ROCKS };
export const NATURE_ART_IDS = {
    ores: Object.keys(ORES),
    ingots: ['ironIngot', 'copperIngot', 'silverIngot', 'goldIngot', 'cutStone', 'hardwood', 'solidOak', 'resin', 'birchSap', 'birchSyrup'],
    gems: Object.keys(GEMS),
    jewels: Object.keys(JEWELS),
    forged: Object.keys(FORGED),
    tools: Object.keys(TOOLS),
    trees: Object.keys(TREES),
    rocks: Object.keys(ROCKS),
};
for (const [k, v] of Object.entries(ITEM_ART)) items[k] = () => v;
