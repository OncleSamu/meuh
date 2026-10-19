// Refonte des dessins (1.3) : les produits redessinés, famille par famille. Ces dessins remplacent ceux de items.js.
import { C, E, F, FC, FE, HL, L, P, R, SHADOW, leaf, sub, items, animals, machines } from './kit.js';

// ---------------- les vins et champagnes ----------------
const grapeMark = (x, y, c) =>
    [
        [0, 0],
        [-2.6, 0],
        [2.6, 0],
        [-1.3, 2.3],
        [1.3, 2.3],
        [0, 4.6],
    ]
        .map(([dx, dy]) => FC(x + dx, y + dy, 1.5, c))
        .join('') + L(`M${x} ${y - 1.6} Q${x + 1} ${y - 3.6} ${x + 2.6} ${y - 4}`, 0.9, '#5a7a2e');
const WINE_P = {};
const CHAMP_P = {};
// 1.15 : étiquettes au choix et millésime écrit sur la bouteille
export const LABEL_STYLES = [
    { name: 'Classique' },
    { name: 'Château', label: '#f1e6c8', band: '#2e4a7a', mark: '#2e4a7a' },
    { name: 'Rustique', label: '#e7d3a8', band: '#6b4a2a', mark: '#6b4a2a' },
    { name: 'Doré', label: '#fff2c2', band: '#d9a520', mark: '#9a6a10' },
];
// la capsule dit la qualité de l'année : froide (grise), grande (argent), siècle (or)
const CAPS = [['#8a9a9a', '#5a6a6a'], null, ['#cfd6dc', '#8a96a0'], ['#ffd23f', '#b8860b']];
const yearText = (x, y, year) =>
    `<text x="${x}" y="${y}" font-family="Georgia,serif" font-size="6.8" font-weight="700" text-anchor="middle" fill="#3a2618">${year}</text>`;
const wineDraw = ({ glass, glassHi, wine, label, band, capsule, capsuleD, mark }, o = {}) => {
    const st = LABEL_STYLES[o.ls] || LABEL_STYLES[0];
    if (st.label) ({ label, band, mark } = { label: st.label, band: st.band, mark: st.mark });
    const cp = o.vq != null ? CAPS[o.vq] : null;
    if (cp) [capsule, capsuleD] = cp;
    const body = 'M27.5 3 L36.5 3 L36.5 19 Q36.5 22 39 23.5 Q45 27 45 34 L45 57 Q45 61 41 61 L23 61 Q19 61 19 57 L19 34 Q19 27 25 23.5 Q27.5 22 27.5 19Z';
    return (
        SHADOW(32, 61.5, 14, 2.6) +
        P(body, glass) +
        // le vin, vu à travers le verre
        F('M20.6 30 Q22 26.5 26 25 L38 25 Q42 26.5 43.4 30 L43.4 57 Q43.4 59.4 41 59.4 L23 59.4 Q20.6 59.4 20.6 57Z', wine, 0.85) +
        F('M21 30 Q32 27.5 43 30 L43 31.6 Q32 29 21 31.6Z', '#fff', 0.18) +
        // l'étiquette
        R(21.5, 36, 21, 16, 2.2, label, 1.6) +
        R(21.5, 36, 21, 3.4, 1, band, 0) +
        L('M21.5 39.4 L42.5 39.4', 1.2) +
        grapeMark(32, 42.5, mark) +
        (o.year ? yearText(32, 51, o.year) : L('M26 49.5 L38 49.5', 1.1, 'rgba(58,38,24,.5)')) +
        // la capsule plissée et le col
        P('M27 2 L37 2 L37 15 L27 15Z', capsule, 2.2) +
        L('M29.5 4 L29.5 14 M32 4 L32 14 M34.5 4 L34.5 14', 0.8, capsuleD) +
        L('M27 11 L37 11', 1.4) +
        // reflets du verre
        F('M22.6 32 Q22.8 27.8 25.6 26 L25.6 55 Q22.6 55 22.6 52Z', glassHi, 0.55) +
        FE(40.5, 30, 1.2, 2.8, '#fff', 0.55, 20) +
        FC(24, 57, 0.9, '#fff', 0.5) +
        (o.vq === 3 ? P('M49 5 L50.6 9 L54.6 10.4 L50.6 11.8 L49 16 L47.4 11.8 L43.4 10.4 L47.4 9Z', '#ffd23f', 1.4) : '') +
        P(body, 'none')
    );
};
const wine2 = (id, p) => {
    WINE_P[id] = p;
    return wineDraw(p);
};
const champ2 = (id, p) => {
    CHAMP_P[id] = p;
    return champDraw(p);
};
export const wineBottle = (id, o) => (WINE_P[id] ? wineDraw(WINE_P[id], o) : CHAMP_P[id] ? champDraw(CHAMP_P[id], o) : '');
const champDraw = ({ label, foil, foilD, wine }, o = {}) => {
    const st = LABEL_STYLES[o.ls] || LABEL_STYLES[0];
    if (st.label) label = st.label;
    const cp = o.vq != null ? CAPS[o.vq] : null;
    if (cp) [foil, foilD] = cp;
    const body = 'M28.5 6 L35.5 6 L35.5 20 Q35.5 23 38.5 25 Q46 29 46 37 L46 57 Q46 61 42 61 L22 61 Q18 61 18 57 L18 37 Q18 29 25.5 25 Q28.5 23 28.5 20Z';
    return (
        SHADOW(32, 61.5, 15, 2.6) +
        P(body, '#24432a') +
        F('M19.6 36 Q21 30 26 28 L38 28 Q43 30 44.4 36 L44.4 57 Q44.4 59.4 42 59.4 L22 59.4 Q19.6 59.4 19.6 57Z', '#1d3a22', 0.55) +
        // bulles
        [
            [26, 55],
            [38, 56],
            [41, 39],
            [24, 37],
        ]
            .map(([x, y], k) => C(x, y, k % 2 ? 1 : 1.3, wine, 0.8))
            .join('') +
        // la feuille d'or qui coiffe le col
        P('M26.5 1.5 L37.5 1.5 L37.5 21 Q35 25.5 32 25.5 Q29 25.5 26.5 21Z', foil, 2.2) +
        L('M28 8 L36 8 M28 13 L36 13 M28 18 L36 18', 0.9, foilD) +
        // l'étiquette en écusson et le médaillon
        P('M20.5 38 Q32 34 43.5 38 L43.5 51 Q32 55 20.5 51Z', label, 1.6) +
        (o.year ? yearText(32, 47, o.year) : C(32, 44.5, 4.2, foil, 1.3) + P('M30 43.5 L32 41.5 L34 43.5 L32 47.5Z', foilD, 0)) +
        F('M22 33 Q22.5 29.5 25.5 28 L25.5 55 Q22 55 22 52Z', '#ffffff', 0.22) +
        FE(41, 33, 1.2, 2.6, '#fff', 0.5, 20) +
        // l'étincelle de fête
        P('M49 5 L50.6 9 L54.6 10.4 L50.6 11.8 L49 16 L47.4 11.8 L43.4 10.4 L47.4 9Z', '#ffd23f', 1.4) +
        FC(53, 15, 1, '#fff', 0.9) +
        P(body, 'none')
    );
};

const WINES = {
    tableWine: wine2('tableWine', {
        glass: '#9a7a3c',
        glassHi: '#e8d5a0',
        wine: '#8a2b3a',
        label: '#fff7e0',
        band: '#b07a45',
        capsule: '#b07a45',
        capsuleD: '#7a5028',
        mark: '#8a2b3a',
    }),
    redWine: wine2('redWine', {
        glass: '#2b4f30',
        glassHi: '#7fb08a',
        wine: '#6b1424',
        label: '#f7ecd8',
        band: '#8e2c22',
        capsule: '#a12a36',
        capsuleD: '#6b1424',
        mark: '#6b2a5e',
    }),
    whiteWine: wine2('whiteWine', {
        glass: '#cfe6b8',
        glassHi: '#ffffff',
        wine: '#f2d76a',
        label: '#fffaf0',
        band: '#e8b84a',
        capsule: '#e8c14e',
        capsuleD: '#b48a24',
        mark: '#a6c24a',
    }),
    roseWine: wine2('roseWine', {
        glass: '#f3e7ea',
        glassHi: '#ffffff',
        wine: '#f39ab0',
        label: '#fff4f6',
        band: '#e8364b',
        capsule: '#f0a6b8',
        capsuleD: '#c46a82',
        mark: '#c4406a',
    }),
    champagne: champ2('champagne', { label: '#f7ecd8', foil: '#f2c14e', foilD: '#b08a2a', wine: '#f2d76a' }),
    champagneRose: champ2('champagneRose', { label: '#fbd9e2', foil: '#f6a5b5', foilD: '#c46a82', wine: '#f39ab0' }),
};

// ---------------- les fromages et la laiterie ----------------
const hole = (x, y, r) => E(x, y, r, r * 0.75, '#e0a63a', 0, 0) + FE(x + r * 0.2, y + r * 0.25, r * 0.7, r * 0.4, '#c98b2a', 1);
// une meule vue de trois quarts, avec une part coupée qui montre la pâte
const wheel = ({ rind, rindD, side, paste, pasteD, top = rind, extra = '', concave = false }) =>
    SHADOW(32, 56, 27, 3) +
    // le flanc
    P(concave ? 'M5 30 L5 44 Q8 50 32 51 Q56 50 59 44 L59 30 Q56 36 32 37 Q8 36 5 30Z' : 'M5 30 L5 44 Q6 51 32 51 Q58 51 59 44 L59 30Z', side) +
    L('M6 39 Q32 46 58 39', 1.4, rindD) +
    // le dessus
    E(32, 30, 27, 9, top) +
    // la part qui manque : on voit la pâte
    P('M32 30 L57 26 L57 40 L32 44Z', paste) +
    P('M32 30 L57 26 Q60 28 59 30 L32 30Z', top, 0) +
    L('M32 30 L32 44', 2.2) +
    FE(44, 36, 9, 3, pasteD, 0.35, -8) +
    extra +
    HL(16, 27, 6, 2, -6, 0.5);

const CHEESES = {
    // un morceau de fromage à trous : la part classique
    cheese:
        SHADOW(32, 55, 25, 3) +
        P('M6 34 L50 14 Q57 13 58 19 L58 42 Q58 46 54 46 L10 50 Q6 50 6 46Z', '#ffd75a') +
        P('M6 34 L50 14 Q57 13 58 19 L58 24 L8 40 Q6 38 6 34Z', '#ffe58a', 0) +
        L('M8 40 L58 24', 2.2) +
        hole(22, 43, 3.6) +
        hole(40, 36, 4.4) +
        hole(51, 41, 2.6) +
        hole(31, 30, 2.4) +
        hole(45, 22, 2.2) +
        P('M58 24 L58 42 Q58 46 54 46 L50 46.4 Q53 40 52 34 Q51 28 58 24Z', '#f2c14e', 0) +
        HL(22, 33, 6, 1.6, -22, 0.6) +
        P('M6 34 L50 14 Q57 13 58 19 L58 42 Q58 46 54 46 L10 50 Q6 50 6 46Z', 'none'),
    // la bûche de chèvre cendrée, une rondelle coupée et du thym
    goatCheese:
        SHADOW(32, 56, 26, 3) +
        R(6, 26, 40, 24, 12, '#f4f1ea') +
        [
            [14, 32],
            [22, 42],
            [30, 30],
            [36, 44],
            [12, 44],
            [26, 36],
        ]
            .map(([x, y]) => FC(x, y, 1.2, '#b9b4aa'))
            .join('') +
        HL(16, 30, 7, 2, -4, 0.6) +
        E(48, 38, 9, 12, '#f4f1ea') +
        E(48, 38, 6.5, 9.4, '#fffdf6', 0, 0) +
        FE(46.5, 35, 2, 3, '#ffffff', 0.9) +
        L('M50 14 Q54 20 52 26', 1.6, '#5a7a2e') +
        leaf(51.5, 17, 5, 30, '#6cc04a', 0.5) +
        leaf(53, 22, 5, -10, '#6cc04a', 0.5),
    // le camembert dans sa boîte en bois, et une part posée devant
    camembert:
        SHADOW(30, 57, 27, 3) +
        P('M4 34 L4 44 Q4 51 30 51 Q56 51 56 44 L56 34Z', '#e3b97a') +
        L('M5 40 Q30 47 55 40', 1.2, '#b98a4a') +
        E(30, 34, 26, 9, '#e3b97a') +
        E(30, 32, 22, 7, '#fbf8ef') +
        [
            [16, 31],
            [22, 34],
            [30, 29],
            [38, 33],
            [44, 30],
        ]
            .map(([x, y]) => FC(x, y, 1.6, '#ece6d6'))
            .join('') +
        HL(16, 30, 5, 1.6, -6, 0.7) +
        SHADOW(48, 60, 13, 2) +
        P('M36 46 L46 56 L46 60 L36 50Z', '#ffe27a') +
        P('M46 56 L60 44 L60 48 L46 60Z', '#ece6d6') +
        P('M36 46 L60 44 L46 56Z', '#fbf8ef') +
        P('M38 49 Q38 55 41 53 Q42 57 44 55', '#ffd75a', 1.2) +
        FC(48, 48, 1.2, '#e2dccb'),
    // le bleu : une part marbrée de vert-bleu, enveloppée d'un papier argenté
    bleu:
        SHADOW(32, 55, 25, 3) +
        P('M7 34 L48 14 Q55 13 56 19 L56 42 Q56 46 52 46 L11 50 Q7 50 7 46Z', '#f7f1e0') +
        P('M7 34 L48 14 Q55 13 56 19 L56 24 L9 40 Q7 38 7 34Z', '#fffaf0', 0) +
        L('M9 40 L56 24', 2.2) +
        P('M14 44 Q18 41 22 44 Q19 47 14 44Z', '#5b8aa8', 0) +
        P('M30 39 Q36 35 40 39 Q35 43 30 39Z', '#4f7d99', 0) +
        P('M44 40 Q48 37 51 41 Q47 44 44 40Z', '#5b8aa8', 0) +
        FC(25, 41, 1.6, '#3f6f8f') +
        FC(38, 43, 1.3, '#3f6f8f') +
        FC(48, 31, 1.4, '#5b8aa8') +
        FC(30, 30, 1.2, '#5b8aa8') +
        FC(40, 25, 1, '#5b8aa8') +
        P('M7 46 L7 50 Q7 52 11 52 L52 48 Q56 48 56 44 L56 42 Q56 46 52 46 L11 50 Q7 50 7 46Z', '#c9d3dc', 1.6) +
        HL(20, 32, 6, 1.4, -22, 0.6) +
        P('M7 34 L48 14 Q55 13 56 19 L56 42 Q56 46 52 46 L11 50 Q7 50 7 46Z', 'none'),
    // la mozzarella dans son bol de petit-lait, avec une feuille de basilic
    mozzarella:
        SHADOW(32, 57, 27, 3) +
        P('M5 34 Q6 54 32 54 Q58 54 59 34Z', '#e9f4fb') +
        E(32, 34, 27, 8, '#cfe6f5') +
        E(32, 34, 23, 6, '#e8f5fc', 0, 0) +
        C(22, 32, 9, '#ffffff') +
        C(40, 31, 10, '#ffffff') +
        C(31, 26, 8, '#fffdf6') +
        HL(19, 28, 2.4, 1.6, -20, 0.9) +
        HL(37, 26, 3, 2, -20, 0.9) +
        leaf(44, 22, 10, -40, '#4caf50', 0.55) +
        L('M10 44 Q32 50 54 44', 1.2, '#9fc6de'),
    // le beaufort : une grosse meule aux flancs creusés, croûte brune
    beaufort: wheel({
        rind: '#c98b4a',
        rindD: '#8b5a2b',
        side: '#b5763a',
        paste: '#ffe08a',
        pasteD: '#e8b84a',
        top: '#d8a05e',
        concave: true,
        extra: FC(22, 32, 1.4, '#a8693a') + FC(14, 29, 1.2, '#a8693a'),
    }),
    // la tomme : croûte grise et moussue, pâte ivoire à petits trous
    tomme: wheel({
        rind: '#9a9488',
        rindD: '#6d6457',
        side: '#8f8a7e',
        paste: '#f8edcf',
        pasteD: '#d8c9a0',
        top: '#aaa497',
        extra:
            [
                [12, 30],
                [20, 27],
                [26, 33],
                [17, 34],
                [9, 34],
                [24, 28],
            ]
                .map(([x, y], k) => FC(x, y, k % 2 ? 1.8 : 2.4, k % 3 ? '#c8c2b4' : '#7e786c'))
                .join('') +
            FC(42, 33, 1, '#d8c9a0') +
            FC(50, 36, 1.2, '#d8c9a0'),
    }),
    // le reblochon : petit disque à croûte orangée, sa pastille verte et son papier
    reblochon:
        SHADOW(32, 55, 25, 3) +
        E(32, 44, 26, 8, '#fffaf0') +
        P('M8 32 L8 40 Q9 47 32 47 Q55 47 56 40 L56 32Z', '#f0b46a') +
        L('M9 37 Q32 43 55 37', 1.2, '#c9853e') +
        E(32, 32, 24, 7.5, '#f5c27e') +
        [
            [18, 31],
            [26, 34],
            [40, 30],
            [46, 33],
            [32, 29],
        ]
            .map(([x, y]) => FC(x, y, 1.3, '#e3a25a'))
            .join('') +
        C(32, 32, 4, '#6cc04a', 1.4) +
        FC(31, 31, 1.2, '#b9e89a') +
        HL(18, 30, 5, 1.4, -4, 0.6),
    // le comté : meule dorée, tampon vert sur le flanc, part jaune avec ses cristaux
    comte: wheel({
        rind: '#e2a548',
        rindD: '#a8692a',
        side: '#d3913a',
        paste: '#ffe580',
        pasteD: '#efc24e',
        top: '#eab459',
        extra:
            R(13, 41, 10, 6, 1.5, '#5aa05a', 1.2) +
            L('M15 44 L21 44', 0.9, '#e9f6df') +
            FC(43, 35, 0.9, '#fff7d0') +
            FC(50, 32, 0.8, '#fff7d0') +
            FC(47, 39, 0.9, '#fff7d0'),
    }),
    // le beurre : une motte sur son papier, une boucle de beurre
    butter:
        SHADOW(32, 55, 26, 3) +
        P('M4 44 L16 34 L60 34 L48 44Z', '#f7f3ea', 1.8) +
        P('M14 38 L14 28 L46 28 L46 38 Q46 41 43 41 L17 41 Q14 41 14 38Z', '#ffd75a') +
        P('M14 28 L22 21 L54 21 L46 28Z', '#ffe58a') +
        P('M46 28 L54 21 L54 31 Q54 34 51 36 L46 38Z', '#f2c14e') +
        P('M24 25 Q30 20 36 24 Q32 27 28 26', '#fff3b0', 1.4) +
        HL(20, 31, 4, 1.4, 0, 0.6),
    // la crème fraîche dans son pot en grès, une cuillère qui en déborde
    cream:
        SHADOW(32, 59, 20, 3) +
        P('M12 24 Q9 44 17 56 Q20 59 25 59 L39 59 Q44 59 47 56 Q55 44 52 24Z', '#d9b07a') +
        F('M11.6 34 L52.4 34 Q52.6 37 52.2 40 L11.8 40 Q11.4 37 11.6 34Z', '#5aa9e6', 0.9) +
        P('M12 24 Q9 44 17 56 Q20 59 25 59 L39 59 Q44 59 47 56 Q55 44 52 24Z', 'none') +
        E(32, 24, 20, 5.5, '#c08b52') +
        P('M13 24 Q15 14 24 17 Q32 9 40 15 Q50 12 51 24 Q32 29 13 24Z', '#fffdf3') +
        P('M15 24 Q16 31 20 29 Q20 26 18 24Z', '#fffdf3', 1.6) +
        L('M40 18 L54 2', 3.4) +
        L('M40 18 L54 2', 1.6, '#d8d0c2') +
        HL(18, 44, 1.6, 6, 0, 0.5),
    // le tofu : un bloc blanc dans l'eau, sur une planche
    tofu:
        SHADOW(32, 56, 27, 3) +
        R(4, 42, 56, 10, 4, '#c08b52') +
        C(54, 47, 2, '#8b5a2b', 1) +
        P('M12 42 L12 26 L44 26 L44 42Z', '#fffdf3') +
        P('M12 26 L20 18 L52 18 L44 26Z', '#ffffff') +
        P('M44 26 L52 18 L52 35 L44 42Z', '#ece6d6') +
        L('M24 30 L24 40 M34 30 L34 40', 0.9, '#e6dfcc') +
        FC(48, 13, 1.6, '#cfe6f5') +
        FC(55, 16, 1.2, '#cfe6f5') +
        HL(18, 30, 3, 1.4, 0, 0.6),
};

// ---------------- les boissons ----------------
// ---- formes communes ----
// bouteille de jus ronde : liquide visible, bouchon à vis, étiquette ronde avec le fruit
const juiceB = (liquid, fruit, cap = '#c8453a') => {
    const body = 'M26 6 L38 6 L38 13 Q51 19 51 33 L51 54 Q51 60 45 60 L19 60 Q13 60 13 54 L13 33 Q13 19 26 13Z';
    return (
        SHADOW(32, 61, 17, 2.6) +
        P(body, '#eaf6fd') +
        // le jus, avec un reflet à sa surface
        F('M14.4 27 Q20 23.5 32 23.5 Q44 23.5 49.6 27 L49.6 54 Q49.6 58.6 45 58.6 L19 58.6 Q14.4 58.6 14.4 54Z', liquid) +
        F('M14.4 27 Q32 23.5 49.6 27 L49.6 29.4 Q32 25.6 14.4 29.4Z', '#fff', 0.35) +
        // l'étiquette : un grand cartouche crème avec le fruit, un liseré de la couleur du bouchon
        R(17, 34, 30, 21, 5, '#fffaf0', 1.8) +
        R(19.5, 36.5, 25, 16, 3.5, 'none', 0) +
        L('M20 51.5 L44 51.5', 1.6, cap) +
        sub(fruit, 22, 33.5, 20) +
        // gouttes de fraîcheur et reflets
        FC(47, 30, 1, '#fff', 0.8) +
        FE(47.5, 33, 0.8, 1.3, '#fff', 0.7) +
        F('M16.4 29 L19.4 27.4 L19.4 52 L16.4 52Z', '#fff', 0.5) +
        P(body, 'none') +
        // le bouchon à vis, couleur du fruit
        R(24, 1.5, 16, 7.5, 2.5, cap) +
        L('M27 3.5 L27 7.5 M30.3 3.5 L30.3 7.5 M33.6 3.5 L33.6 7.5 M37 3.5 L37 7.5', 0.9, 'rgba(58,38,24,.35)') +
        HL(26, 4, 1, 1.6, 0, 0.6)
    );
};
// grand verre : boisson, glaçons, paille et garniture sur le bord
const tallGlass = (liquid, garnish = '', top = '#fff6e0', straw = '#e8364b') => {
    const g = 'M15 10 L49 10 L45 58 Q45 60 43 60 L21 60 Q19 60 19 58Z';
    return (
        SHADOW(32, 61, 14, 2.6) +
        P(g, '#eaf6fd') +
        F('M16.6 20 L47.4 20 L44 57 Q44 58.6 42.5 58.6 L21.5 58.6 Q20 58.6 20 57Z', liquid) +
        F('M16.6 20 L47.4 20 L47.1 23 L16.9 23Z', top, 0.8) +
        R(23, 28, 7, 7, 1.6, '#ffffff', 1.4) +
        R(33, 36, 7, 7, 1.6, '#ffffff', 1.4) +
        L('M37 14 L44 -2', 3.2) +
        L('M37 14 L44 -2', 1.6, straw) +
        F('M19 14 L22 13 L24 55 L22 56Z', '#fff', 0.45) +
        P(g, 'none') +
        garnish
    );
};
// une tasse et sa soucoupe, avec de la vapeur
const steam = L('M24 10 Q20 6 24 2 M32 12 Q28 7 32 2 M40 10 Q36 6 40 2', 1.8, 'rgba(255,255,255,.9)');
const cup = (tea, extra = '', cupC = '#ffffff') =>
    SHADOW(32, 58, 24, 3) +
    E(32, 52, 26, 6, '#ffffff') +
    E(32, 51, 18, 3.6, '#eef3f6', 0, 1.2) +
    P('M48 28 Q60 28 58 38 Q56 46 46 44', 'none', 3.4) +
    P('M48 28 Q60 28 58 38 Q56 46 46 44', 'none', 0) +
    L('M48 28 Q60 28 58 38 Q56 46 46 44', 1.6, cupC) +
    P('M10 24 L54 24 Q54 46 32 50 Q10 46 10 24Z', cupC) +
    E(32, 24, 22, 5.5, cupC) +
    E(32, 24.5, 18.5, 4, tea, 0, 1.2) +
    HL(16, 32, 2, 6, -10, 0.6) +
    steam +
    extra;
// une chope de bière avec sa mousse
const chope = (beer, extra = '') => {
    const g = 'M12 18 L44 18 L44 56 Q44 60 40 60 L16 60 Q12 60 12 56Z';
    return (
        SHADOW(30, 61, 18, 2.6) +
        L('M44 26 Q56 26 56 38 Q56 48 44 48', 6) +
        L('M44 26 Q56 26 56 38 Q56 48 44 48', 2.6, '#eaf6fd') +
        P(g, '#eaf6fd') +
        F('M13.4 22 L42.6 22 L42.6 56 Q42.6 58.6 40 58.6 L16 58.6 Q13.4 58.6 13.4 56Z', beer) +
        [
            [20, 50],
            [30, 42],
            [36, 52],
            [24, 36],
        ]
            .map(([x, y]) => FC(x, y, 1.2, '#fff', 0.7))
            .join('') +
        F('M16 24 L19 24 L19 54 L16 54Z', '#fff', 0.4) +
        P(g, 'none') +
        P('M10 20 Q8 10 18 10 Q22 4 30 8 Q38 3 42 10 Q50 10 46 20 Q46 24 42 22 Q38 26 34 22 Q28 26 24 22 Q18 26 14 22 Q10 24 10 20Z', '#fffdf3') +
        extra
    );
};
const BUB = (x, y, r = 1.4) => FC(x, y, r, '#fff', 0.85);

// dessinées à la demande : certains fruits (île) sont enregistrés après ce fichier
const DRINKS = () => ({
    juice: juiceB('#f5c542', 'apple', '#6cc04a'),
    carrotJuice: juiceB('#f28c28', 'carrot'),
    orangeJuice: juiceB('#f7a21b', 'orange', '#f28c28'),
    watermelonJuice: juiceB('#f2546b', 'watermelon', '#4caf50'),
    peachNectar: juiceB('#ffb27f', 'peach', '#f28c28'),
    grapeJuice: juiceB('#7b2d86', 'grape', '#6b2a5e'),
    blueberryJuice: juiceB('#3f4fa0', 'blueberry', '#2f3f7a'),
    pineappleJuice: juiceB('#ffd94a', 'pineapple', '#4caf50'),
    mangoJuice: juiceB('#ffad33', 'mango', '#e8792a'),
    guavaJuice: juiceB('#f78fa7', 'guava', '#6cc04a'),
    // le cidre : bouteille bouchée, muselet et étiquette à la pomme
    cider:
        SHADOW(32, 61, 13, 2.6) +
        P('M27 6 L37 6 L37 18 Q46 23 46 34 L46 56 Q46 60 42 60 L22 60 Q18 60 18 56 L18 34 Q18 23 27 18Z', '#5f7f3a') +
        F('M19.4 32 Q22 24 32 24 Q42 24 44.6 32 L44.6 56 Q44.6 58.6 42 58.6 L22 58.6 Q19.4 58.6 19.4 56Z', '#e8b04a', 0.75) +
        R(21, 36, 22, 16, 3, '#fffaf0', 1.6) +
        sub('apple', 25.5, 37.5, 13) +
        R(26, 1, 12, 8, 3, '#d9b07a') +
        L('M26 8 L38 8 M28 2 L28 9 M36 2 L36 9', 1.4, '#8f8574') +
        F('M21 30 L23.5 27 L23.5 54 L21 54Z', '#fff', 0.35) +
        BUB(30, 30) +
        BUB(36, 28, 1),
    // le pommeau : une petite carafe ventrue, couleur d'ambre
    pommeau:
        SHADOW(32, 61, 17, 2.6) +
        P('M27 4 L37 4 L37 22 Q52 28 52 44 Q52 60 32 60 Q12 60 12 44 Q12 28 27 22Z', '#f3e7d2') +
        F('M13.5 40 Q20 34 32 34 Q44 34 50.5 40 Q51 58.6 32 58.6 Q13 58.6 13.5 40Z', '#b5562a') +
        P('M27 4 L37 4 L37 22 Q52 28 52 44 Q52 60 32 60 Q12 60 12 44 Q12 28 27 22Z', 'none') +
        R(25, 0, 14, 6, 2.5, '#7a3a1e') +
        R(22, 42, 20, 9, 2, '#f2c14e', 1.4) +
        sub('apple', 27, 41.5, 10) +
        HL(19, 42, 2, 7, 10, 0.5),
    // la liqueur de génépi : une bouteille fine avec un brin de plante dedans
    genepiLiqueur:
        SHADOW(32, 61, 11, 2.6) +
        P('M28 4 L36 4 L36 16 Q42 20 42 28 L42 56 Q42 60 38 60 L26 60 Q22 60 22 56 L22 28 Q22 20 28 16Z', '#eef8e6') +
        F('M23.4 28 Q26 22 32 22 Q38 22 40.6 28 L40.6 56 Q40.6 58.6 38 58.6 L26 58.6 Q23.4 58.6 23.4 56Z', '#cfe89a') +
        L('M32 56 Q30 42 33 28', 1.6, '#5a7a2e') +
        leaf(31, 46, 6, 210, '#6cc04a', 0.5) +
        leaf(33, 38, 6, -30, '#6cc04a', 0.5) +
        C(33, 28, 1.8, '#ffd23f', 1) +
        P('M28 4 L36 4 L36 16 Q42 20 42 28 L42 56 Q42 60 38 60 L26 60 Q22 60 22 56 L22 28 Q22 20 28 16Z', 'none') +
        R(27, 0, 10, 6, 2, '#4f9e3a') +
        F('M24.4 30 L26.4 28 L26.4 54 L24.4 54Z', '#fff', 0.5),
    // le punch de l'été : un grand saladier en verre, des fruits et une louche
    summerPunch:
        SHADOW(32, 60, 26, 3) +
        P('M6 26 Q8 54 32 56 Q56 54 58 26Z', '#eaf6fd') +
        F('M7.6 30 L56.4 30 Q54 52 32 54.4 Q10 52 7.6 30Z', '#f2546b') +
        E(32, 26, 26, 6, '#fde0e6') +
        E(32, 26, 26, 6, 'none') +
        C(18, 26, 4, '#f7a21b', 1.4) +
        C(42, 25, 3.5, '#e8364b', 1.4) +
        C(30, 27, 3, '#6cc04a', 1.4) +
        L('M46 30 L56 6', 3) +
        E(56, 6, 5, 3, '#d8d0c2', -20, 1.6) +
        HL(14, 38, 2, 7, -20, 0.5) +
        R(24, 54, 16, 4, 2, '#eaf6fd'),
    // le lait de coco : une demi-noix et son lait
    coconutMilk:
        SHADOW(32, 58, 24, 3) +
        P('M8 30 Q8 56 32 56 Q56 56 56 30Z', '#7a4a2a') +
        L('M12 40 Q18 44 22 40 M30 48 Q34 52 38 48 M44 40 Q48 44 52 38', 1.2, '#5e3a1e') +
        E(32, 30, 24, 7, '#fffaf0') +
        E(32, 30, 24, 7, 'none', 0, 3) +
        E(32, 30, 20, 5, '#ffffff', 0, 0) +
        FE(26, 29, 6, 1.6, '#fff', 0.9) +
        C(50, 14, 7, '#7a4a2a') +
        FE(52, 16, 3, 2, '#fffaf0', 1) +
        FC(47, 11, 1.2, '#3a2618'),
    bananaSmoothie: tallGlass('#ffe28a', sub('banana', 6, 0, 18), '#ffd0da', '#f2546b'),
    mangoPassion: tallGlass('#ffad33', sub('passionFruit', 42, 0, 16), '#ffd9a0', '#7b2d86'),
    lassi: tallGlass('#ffe7b0', sub('mango', 42, 0, 16), '#fffaf0', '#e8792a'),
    limeade: tallGlass(
        '#dff5b8',
        C(15, 10, 7, '#a6d94a', 2) + C(15, 10, 4.5, '#e8f8c8', 1) + L('M15 5.5 L15 14.5 M10.5 10 L19.5 10', 0.8, '#6cc04a'),
        '#ffffff',
        '#4caf50',
    ),
    // le cocktail des îles : dans une noix de coco, avec une ombrelle
    islandCocktail:
        SHADOW(32, 59, 22, 3) +
        P('M10 32 Q10 58 32 58 Q54 58 54 32Z', '#8b5a2b') +
        L('M14 42 Q20 46 24 42 M34 50 Q38 54 42 50', 1.2, '#5e3a1e') +
        E(32, 32, 22, 6, '#ffad33') +
        E(32, 32, 22, 6, 'none', 0, 3) +
        L('M36 32 L48 4', 1.8, '#c08b52') +
        P('M38 10 Q48 -2 60 8 Q50 6 49 10 Q46 6 38 10Z', '#e8364b', 1.6) +
        L('M44 6 L49 10 M54 6 L49 10', 1, '#fff') +
        L('M24 32 L30 6', 3) +
        L('M24 32 L30 6', 1.6, '#4fb3f6') +
        sub('pineapple', 4, 14, 18),
    // les thés
    greenTea: cup('#a6c84a', leaf(50, 18, 9, -40, '#6cc04a', 0.5)),
    lavenderTea: cup('#c9a7e8', L('M44 28 L52 4', 1.6, '#5a7a2e') + [6, 9, 12, 15].map(y => E(50 - (y - 6) * 0.3, y, 2.2, 1.6, '#9a6fd0', -20, 1)).join('')),
    milkTea: cup('#d9b07a', P('M4 8 Q6 2 12 4 Q16 0 20 6 Q24 6 22 10 L6 12Z', 'none', 0)),
    gingerTea: cup('#e8c14e', sub('ginger', 44, 36, 18)),
    icedTea: tallGlass('#d9893a', C(49, 12, 6.5, '#ffb27f', 2) + C(49, 12, 3.5, '#ffd9b8', 1), '#f2c79a', '#f28c28'),
    // les bières
    blondBeer: chope('#f5c542'),
    amberBeer: chope('#c4682a'),
    cherryBeer: chope('#b51d38', sub('cherry', 40, 30, 22)),
    // l'hydromel : une cruche en grès et une goutte de miel
    mead:
        SHADOW(32, 60, 18, 3) +
        P('M22 10 L42 10 L42 16 Q54 24 54 40 Q54 58 32 58 Q10 58 10 40 Q10 24 22 16Z', '#d9b07a') +
        L('M42 22 Q58 22 56 34 Q54 42 50 42', 4) +
        L('M42 22 Q58 22 56 34 Q54 42 50 42', 1.8, '#d9b07a') +
        R(20, 6, 24, 6, 3, '#a8793a') +
        F('M10.6 34 L53.4 34 L53.6 40 L10.4 40Z', '#ffd23f', 0.95) +
        P('M22 10 L42 10 L42 16 Q54 24 54 40 Q54 58 32 58 Q10 58 10 40 Q10 24 22 16Z', 'none') +
        P('M22 12 Q22 20 25 20 Q28 20 27 14', '#ffd23f', 1.4) +
        sub('honey', 22, 40, 18) +
        HL(17, 30, 2, 6, -10, 0.5),
    // le rhum blanc : bouteille carrée, étiquette à la canne à sucre
    rum:
        SHADOW(32, 61, 14, 2.6) +
        P('M27 4 L37 4 L37 16 Q46 18 46 24 L46 56 Q46 60 42 60 L22 60 Q18 60 18 56 L18 24 Q18 18 27 16Z', '#f1f8fb') +
        R(21, 32, 22, 18, 3, '#2f9e8f', 1.6) +
        sub('sugarcane', 24, 32, 16) +
        R(26, 0, 12, 7, 2, '#8b5a2b') +
        F('M20 26 L22.5 24 L22.5 54 L20 54Z', '#fff', 0.6) +
        FE(42, 26, 1.2, 2.4, '#fff', 0.7, 20),
    // le rhum arrangé : une grande dame-jeanne pleine de fruits
    arrangedRum:
        SHADOW(32, 61, 21, 3) +
        P('M24 6 L40 6 L40 14 Q56 20 56 38 Q56 60 32 60 Q8 60 8 38 Q8 20 24 14Z', '#f6e8c8') +
        F('M9.6 32 Q14 24 32 24 Q50 24 54.4 32 Q56 58.6 32 58.6 Q8 58.6 9.6 32Z', '#e8a548', 0.7) +
        sub('pineapple', 12, 30, 18) +
        sub('lime', 30, 38, 16) +
        sub('vanilla', 34, 24, 16) +
        C(22, 50, 3, '#e8364b', 1.2) +
        P('M24 6 L40 6 L40 14 Q56 20 56 38 Q56 60 32 60 Q8 60 8 38 Q8 20 24 14Z', 'none') +
        R(22, 1, 20, 7, 3, '#8b5a2b') +
        HL(15, 36, 2.4, 9, 6, 0.5),
    // le punch coco : un verre crémeux, une rondelle de coco
    coconutPunch: tallGlass('#fff6e0', C(48, 11, 6.5, '#8b5a2b', 2) + C(48, 11, 4, '#fffaf0', 1), '#ffffff', '#8b5a2b'),
    // le café : un sac de grains torréfiés ouvert
    coffee:
        SHADOW(32, 60, 22, 3) +
        P('M14 20 L50 20 L54 54 Q54 58 50 58 L14 58 Q10 58 10 54Z', '#d9b07a') +
        P('M14 20 Q20 26 32 24 Q44 26 50 20 L48 14 Q32 18 16 14Z', '#c08b52') +
        [
            [22, 18],
            [30, 15],
            [38, 18],
            [44, 15],
            [27, 21],
            [35, 21],
        ]
            .map(([x, y]) => E(x, y, 3.4, 2.4, '#5e3a1e', 20, 1.2) + L(`M${x - 2} ${y + 0.6} Q${x} ${y - 0.6} ${x + 2} ${y + 0.6}`, 0.7, '#2a1a10'))
            .join('') +
        C(32, 40, 9, '#fffaf0', 1.6) +
        E(32, 40, 4.5, 3, '#5e3a1e', 30, 1.2) +
        L('M29.5 41.5 Q32 39 34.5 38.5', 0.8, '#2a1a10') +
        HL(16, 34, 2, 8, -6, 0.4),
    // le café au lait : un grand bol et un cœur de mousse
    cafeLatte:
        SHADOW(32, 58, 24, 3) +
        P('M8 22 Q8 52 32 52 Q56 52 56 22Z', '#f5f1e6') +
        R(24, 50, 16, 5, 2, '#f5f1e6') +
        E(32, 22, 24, 6.5, '#f5f1e6') +
        E(32, 22.5, 20.5, 5, '#c08b52', 0, 1.2) +
        P('M32 26 Q26 21 28.5 19 Q31 18 32 20.5 Q33 18 35.5 19 Q38 21 32 26Z', '#fffaf0', 0) +
        L('M10 34 Q32 40 54 34', 2.4, '#5aa9e6') +
        HL(14, 30, 2, 6, -10, 0.6) +
        steam,
    // le chocolat chaud : une tasse fumante et une guimauve
    hotChoc:
        SHADOW(32, 58, 20, 3) +
        L('M46 28 Q58 28 56 38 Q54 46 44 44', 5) +
        L('M46 28 Q58 28 56 38 Q54 46 44 44', 2.4, '#e8364b') +
        P('M12 22 L48 22 L46 54 Q46 58 42 58 L18 58 Q14 58 14 54Z', '#e8364b') +
        L('M13 40 L47 40', 2, '#fff') +
        L('M13 44 L47 44', 1.2, '#fff') +
        E(30, 22, 18, 4.6, '#e8364b') +
        E(30, 22.5, 15, 3.4, '#6b3a1e', 0, 1.2) +
        R(24, 14, 10, 8, 2, '#fffaf0', 1.6) +
        R(32, 16, 8, 7, 2, '#f8c8d4', 1.4) +
        HL(18, 32, 2, 6, -6, 0.5) +
        steam,
    // le lait de soja : une brique avec les graines
    soyMilk:
        SHADOW(32, 60, 16, 2.6) +
        P('M16 18 L32 6 L48 18 L48 58 L16 58Z', '#ffffff') +
        P('M16 18 L32 6 L48 18Z', '#e8f4dc') +
        L('M32 6 L32 2 L38 2', 2, '#3a2618') +
        R(16, 26, 32, 22, 0, '#a6c84a', 0) +
        L('M16 26 L48 26 M16 48 L48 48', 2) +
        sub('soy', 22, 27, 20) +
        L('M16 18 L48 18', 1.6) +
        P('M16 18 L32 6 L48 18 L48 58 L16 58Z', 'none') +
        F('M44 20 L46 20 L46 56 L44 56Z', '#000', 0.08),
});

// ---------------- les plats et pâtisseries ----------------
// ---- contenants communs ----
const plate = (y = 46) => SHADOW(32, y + 10, 27, 3) + E(32, y, 28, 10, '#ffffff') + E(32, y - 1, 20, 6.5, '#eef3f6', 0, 1.4);
// un bol en faïence à liseré bleu, rempli à ras
const bowl = (fill, top = 30, rim = '#5aa9e6') =>
    SHADOW(32, 59, 23, 3) +
    P(`M7 ${top} Q8 57 32 57 Q56 57 57 ${top}Z`, '#fbf7ee') +
    L(`M10 ${top + 8} Q32 ${top + 14} 54 ${top + 8}`, 2, rim) +
    R(24, 55, 16, 4, 2, '#fbf7ee') +
    E(32, top, 25, 6.5, fill) +
    E(32, top, 25, 6.5, 'none', 0, 2.5) +
    HL(14, top + 10, 2, 5, -15, 0.6);
const steamF = L('M24 12 Q20 8 24 4 M32 14 Q28 9 32 4 M40 12 Q36 8 40 4', 1.8, 'rgba(255,255,255,.95)');
// un bocal à couvercle et étiquette illustrée
const jar = (fill, lid, mark, lidTop = lid) =>
    SHADOW(32, 60, 16, 2.6) +
    P('M16 18 L48 18 L48 54 Q48 59 43 59 L21 59 Q16 59 16 54Z', '#eaf6fd') +
    F('M17.4 22 L46.6 22 L46.6 54 Q46.6 57.6 43 57.6 L21 57.6 Q17.4 57.6 17.4 54Z', fill) +
    R(14, 9, 36, 10, 3, lid) +
    L('M17 12 L47 12', 1, lidTop === lid ? 'rgba(255,255,255,.45)' : lidTop) +
    R(20, 32, 24, 18, 4, '#fffaf0', 1.6) +
    mark +
    F('M19 24 L21.5 22.5 L21.5 52 L19 52Z', '#fff', 0.45);
// une boîte de conserve ouverte
// une coupe de glace en verre
const coupe = (scoops, extra = '') =>
    SHADOW(32, 61, 13, 2.6) +
    R(26, 56, 12, 4, 2, '#eaf6fd') +
    L('M32 44 L32 56', 4) +
    L('M32 44 L32 56', 2, '#eaf6fd') +
    scoops +
    P('M9 32 L55 32 Q53 47 32 47 Q11 47 9 32Z', '#eaf6fd') +
    FE(16, 37, 2, 4, '#fff', 0.7, -20) +
    extra;
const scoop = (x, y, r, c, hi = '#fff') => C(x, y, r, c) + FC(x - r * 0.35, y - r * 0.4, r * 0.25, hi, 0.7);
const woodBoard = () => SHADOW(32, 58, 28, 3) + R(4, 42, 56, 12, 5, '#c08b52') + L('M10 47 L30 47 M36 49 L52 49', 1, '#a0703a') + C(54, 48, 2, '#8b5a2b', 1.2);
const tray = (fill, x = 6, w = 52) =>
    SHADOW(32, 58, 27, 3) + R(x, 30, w, 24, 6, '#e8792a') + R(x + 4, 33, w - 8, 15, 4, fill, 1.6) + L(`M${x - 2} 40 L${x} 40 M${x + w} 40 L${x + w + 2} 40`, 3);

// dessinés à la demande, comme les boissons
const FOOD = () => ({
    // la soupe à l'ail : bol fumant, croûtons, une tête d'ail
    garlicSoup:
        bowl('#f2e3b0') +
        FC(22, 30, 2.2, '#e8b04a') +
        FC(34, 28, 2, '#e8b04a') +
        FC(42, 31, 1.8, '#e8b04a') +
        leaf(28, 31, 5, -20, '#6cc04a', 0.5) +
        steamF +
        sub('garlic', 42, 34, 22),
    // le risotto : grains crémeux, parmesan, feuille de persil
    risotto:
        plate(46) +
        P('M10 44 Q12 32 32 31 Q52 32 54 44 Q32 50 10 44Z', '#f6e7b4') +
        [
            [18, 41],
            [24, 37],
            [30, 42],
            [36, 36],
            [42, 41],
            [46, 38],
            [27, 33],
            [38, 33],
        ]
            .map(([x, y]) => E(x, y, 2.2, 1.2, '#fffaf0', 30, 0.8))
            .join('') +
        leaf(33, 35, 6, -30, '#4caf50', 0.5) +
        leaf(35, 36, 6, 30, '#4caf50', 0.5) +
        steamF,
    // le riz au lait : bol, cannelle, gousse de vanille
    ricePudding:
        bowl('#fff6e0') +
        [
            [20, 29],
            [28, 32],
            [36, 28],
            [44, 31],
            [24, 27],
            [40, 27],
        ]
            .map(([x, y]) => E(x, y, 2.2, 1.2, '#fffdf6', 20, 0.8))
            .join('') +
        L('M18 30 L28 26 M20 32 L30 28', 2.2, '#a0582a') +
        L('M38 22 Q46 18 56 22', 2.6, '#3a2618'),
    // le gâteau de Savoie : un grand biscuit en couronne, du sucre glace
    spongeCake:
        plate(50) +
        P('M10 46 L10 34 Q12 16 32 14 Q52 16 54 34 L54 46 Q32 52 10 46Z', '#f5c96a') +
        P('M10 34 Q12 16 32 14 Q52 16 54 34 Q32 40 10 34Z', '#e8a548') +
        E(32, 26, 7, 3, '#fffaf0', 0, 1.6) +
        L('M16 24 Q22 20 26 22 M38 20 Q44 20 48 26', 1.2, '#fffaf0') +
        [
            [18, 30],
            [44, 30],
            [30, 32],
            [24, 20],
            [40, 18],
        ]
            .map(([x, y]) => FC(x, y, 1.2, '#fffaf0'))
            .join('') +
        HL(16, 40, 2, 4, 0, 0.5),
    // les sorbets : une coupe et le fruit à côté
    melonSorbet: coupe(
        scoop(23, 25, 10, '#f2546b') +
            scoop(41, 25, 10, '#f77d8f') +
            scoop(32, 19, 9, '#f2546b') +
            [
                [20, 24],
                [26, 28],
                [39, 25],
                [44, 28],
                [30, 17],
                [34, 21],
            ]
                .map(([x, y]) => FE(x, y, 0.8, 1.2, '#3a2618', 1))
                .join(''),
        sub('watermelon', 38, 0, 22) + leaf(34, 11, 6, -50, '#4caf50', 0.5),
    ),
    peachSorbet: coupe(
        scoop(23, 25, 10, '#ffb27f') + scoop(41, 25, 10, '#ffc69e') + scoop(32, 19, 9, '#ffb27f'),
        sub('peach', 40, 2, 20) + leaf(34, 11, 6, -50, '#4caf50', 0.5),
    ),
    // les pâtes : un nid de tagliatelles et de la farine
    pasta:
        woodBoard() +
        [0, 1, 2]
            .map(
                k =>
                    E(20 + k * 12, 38 - (k % 2) * 3, 7, 5, '#f7d77a', 0, 1.6) +
                    L(
                        `M${15 + k * 12} ${37 - (k % 2) * 3} Q${20 + k * 12} ${33 - (k % 2) * 3} ${25 + k * 12} ${37 - (k % 2) * 3} M${16 + k * 12} ${40 - (k % 2) * 3} Q${20 + k * 12} ${36 - (k % 2) * 3} ${24 + k * 12} ${40 - (k % 2) * 3}`,
                        1,
                        '#e3b24a',
                    ),
            )
            .join('') +
        FE(52, 40, 6, 2.2, '#fffdf6', 1) +
        FC(48, 36, 0.8, '#fffdf6') +
        FC(55, 35, 0.6, '#fffdf6'),
    // les pâtes à l'ail : assiette de spaghettis, persil, ail
    garlicPasta:
        plate(46) +
        P('M12 44 Q14 30 32 30 Q50 30 52 44 Q32 50 12 44Z', '#f7d77a') +
        L('M16 42 Q24 32 32 40 Q40 32 48 42 M20 38 Q28 30 36 38 M28 44 Q36 36 44 42', 1.3, '#e3b24a') +
        FC(26, 36, 1.4, '#4caf50') +
        FC(38, 38, 1.2, '#4caf50') +
        FC(32, 34, 1.2, '#4caf50') +
        sub('garlic', 42, 26, 20),
    // les rillettes de maquereau : un pot en terre et une tartine
    mackerelRillettes:
        SHADOW(30, 59, 24, 3) +
        P('M10 26 Q8 52 18 56 L38 56 Q46 52 44 26Z', '#d9b07a') +
        E(27, 26, 17, 5, '#a8793a') +
        E(27, 25, 14, 3.6, '#f2c79a', 0, 1.2) +
        L('M10 38 Q27 44 44 38', 2, '#5aa9e6') +
        sub('mackerel', 4, 36, 22) +
        P('M40 52 L60 46 L62 52 L42 58Z', '#e8a548') +
        P('M41 50 L60 44 L61 47 L42 53Z', '#f2c79a', 1.2),
    // les crevettes en bocal
    cannedShrimp: jar('#fbd1c4', '#5aa9e6', sub('shrimp', 22, 31, 20)),
    // l'omelette géante dans sa poêle, des œufs autour
    giantOmelette:
        SHADOW(30, 58, 28, 3) +
        L('M50 42 L62 50', 6) +
        L('M50 42 L62 50', 3, '#8b5a2b') +
        E(28, 42, 26, 12, '#3a3a3a') +
        E(28, 40, 22, 9, '#ffd75a', 0, 1.4) +
        FE(20, 38, 4, 2, '#fff6b0', 1) +
        [
            [22, 42],
            [34, 38],
            [30, 45],
        ]
            .map(([x, y]) => FC(x, y, 1.4, '#4caf50'))
            .join('') +
        E(14, 22, 5, 6.5, '#fffaf0') +
        E(26, 18, 5, 6.5, '#fffaf0') +
        HL(12, 20, 1, 2, 0, 0.7),
    // la tarte au citron vert meringuée
    limePie:
        plate(50) +
        P('M10 44 L14 34 L50 34 L54 44Z', '#e8a548') +
        E(32, 34, 18, 5, '#c8e870') +
        P('M14 34 Q14 22 20 26 Q22 18 28 23 Q32 15 36 23 Q42 18 44 26 Q50 22 50 34 Q32 38 14 34Z', '#fffaf0') +
        L('M20 30 Q22 26 24 30 M34 28 Q36 24 38 28', 1, '#e8c38c') +
        C(48, 18, 6, '#a6d94a', 2) +
        C(48, 18, 3.8, '#e8f8c8', 1) +
        L('M48 14.2 L48 21.8 M44.2 18 L51.8 18', 0.8, '#6cc04a'),
    // le blanc-manger coco et sa fleur de tiaré
    blancManger:
        plate(50) +
        P('M14 46 L18 22 Q32 14 46 22 L50 46 Q32 52 14 46Z', '#ffffff') +
        E(32, 22, 14, 4.5, '#fffdf6') +
        L('M20 30 Q32 34 44 30 M18 38 Q32 42 46 38', 1.2, '#e9eef2') +
        sub('tiare', 24, 8, 16) +
        FC(14, 44, 1.6, '#8b5a2b') +
        FC(50, 44, 1.6, '#8b5a2b'),
    // le gâteau de patate douce : une belle part orange
    sweetPotatoCake:
        plate(50) +
        P('M10 44 L10 32 L52 22 L54 34 Q54 44 48 46 L14 48 Q10 48 10 44Z', '#f28c28') +
        P('M10 32 L52 22 L54 26 L12 36Z', '#c9611a', 0) +
        L('M10 32 L52 22', 2) +
        L('M12 40 L54 30', 1.2, '#c9611a') +
        P('M10 32 L52 22 L46 18 L8 28Z', '#fffaf0') +
        FC(30, 23, 1.4, '#a0582a') +
        FC(40, 21, 1.2, '#a0582a') +
        sub('sweetPotato', 38, 34, 22),
    // le riz au lait de coco dans une demi-noix
    coconutRice:
        SHADOW(32, 58, 24, 3) +
        P('M8 30 Q8 56 32 56 Q56 56 56 30Z', '#7a4a2a') +
        L('M12 40 Q18 44 22 40 M40 48 Q44 52 48 48', 1.2, '#5e3a1e') +
        E(32, 30, 24, 7, '#fffaf0') +
        E(32, 30, 24, 7, 'none', 0, 3) +
        [
            [20, 29],
            [28, 32],
            [36, 28],
            [44, 31],
            [26, 27],
        ]
            .map(([x, y]) => E(x, y, 2.2, 1.2, '#ffffff', 20, 0.8))
            .join('') +
        FC(40, 30, 2.4, '#ffd23f') +
        leaf(42, 26, 6, -40, '#4caf50', 0.5),
    // le curry de légumes au coco : bol jaune, légumes et riz
    coconutCurry:
        bowl('#f2b33d', 30, '#e8364b') +
        C(22, 30, 3, '#f28c28', 1.2) +
        C(38, 28, 2.6, '#6cc04a', 1.2) +
        E(30, 31, 3, 2, '#e8364b', 0, 1.2) +
        C(44, 31, 2.2, '#fffaf0', 1) +
        P('M38 24 Q44 18 52 22 Q50 28 42 28Z', '#ffffff', 1.6) +
        leaf(25, 27, 5, -30, '#4caf50', 0.5) +
        steamF,
    // la purée de patate douce
    sweetPotatoMash:
        bowl('#f28c28') +
        P('M16 30 Q20 22 28 24 Q32 18 38 23 Q46 21 48 30Z', '#f6a24a', 1.8) +
        L('M24 26 Q30 22 34 26', 1, '#c9611a') +
        FE(30, 21, 3, 1.6, '#ffe48a', 1) +
        sub('sweetPotato', 40, 36, 22),
    // le chutney de mangue en bocal
    mangoChutney: jar('#f7a21b', '#4caf50', sub('mango', 22, 31, 20)),
    // les litchis au sirop
    lycheeSyrup: jar('#fff1d8', '#e8364b', sub('lychee', 22, 31, 20)),
    // le pain de maïs : des carrés dorés dans un plat
    cornbread:
        tray('#f5c542') +
        L('M24 33 L24 48 M40 33 L40 48 M10 40.5 L54 40.5', 1.6, '#c9952a') +
        [
            [16, 36],
            [32, 44],
            [47, 37],
            [30, 36],
        ]
            .map(([x, y]) => FC(x, y, 1.2, '#c9952a'))
            .join('') +
        sub('corn', 40, 6, 22),
    // la raclette : fromage fondu qui coule sur des pommes de terre
    raclette:
        plate(48) +
        E(20, 42, 7, 5.5, '#d9a84a') +
        E(34, 44, 7, 5.5, '#d9a84a') +
        E(26, 36, 6.5, 5, '#e8b65a') +
        P('M14 38 Q20 30 30 32 Q38 30 42 38 Q40 44 36 40 Q34 46 30 41 Q26 46 24 40 Q18 44 14 38Z', '#ffd75a') +
        E(46, 38, 8, 5, '#f2a8a0') +
        L('M40 36 Q46 33 52 36 M41 39 Q46 37 52 40', 1, '#e07a6e') +
        C(48, 46, 2.6, '#6cc04a', 1.2),
    // la focaccia : une galette dorée, olives et romarin
    focaccia:
        woodBoard() +
        P('M8 40 Q8 24 32 24 Q56 24 56 40 Q56 46 32 46 Q8 46 8 40Z', '#f2c46a') +
        [
            [16, 32],
            [26, 30],
            [38, 30],
            [48, 34],
            [20, 40],
            [32, 38],
            [44, 41],
        ]
            .map(([x, y]) => C(x, y, 1.6, '#c9952a', 0))
            .join('') +
        C(22, 35, 2.6, '#5e7a2e', 1.2) +
        C(40, 36, 2.6, '#3a2a26', 1.2) +
        C(30, 28, 2.4, '#5e7a2e', 1.2) +
        leaf(46, 28, 6, 30, '#4f9e3a', 0.4) +
        leaf(48, 30, 6, -10, '#4f9e3a', 0.4) +
        HL(16, 28, 4, 1.4, -6, 0.5),
    // le pain à l'ail : tranches beurrées et persillées
    garlicBread:
        woodBoard() +
        [0, 1, 2]
            .map(
                k =>
                    P(`M${8 + k * 15} 44 L${10 + k * 15} 28 Q${17 + k * 15} 22 ${24 + k * 15} 28 L${24 + k * 15} 44Z`, '#e8a548') +
                    P(`M${11 + k * 15} 42 L${12 + k * 15} 30 Q${17 + k * 15} 26 ${22 + k * 15} 30 L${22 + k * 15} 42Z`, '#ffe08a', 1.2) +
                    FC(15 + k * 15, 34, 1, '#4caf50') +
                    FC(18 + k * 15, 38, 1, '#4caf50'),
            )
            .join('') +
        sub('garlic', 44, 18, 18),
    // l'anguille fumée en tronçons sur une planche
    smokedEel:
        woodBoard() +
        [0, 1, 2, 3]
            .map(
                k =>
                    R(8 + k * 12, 32, 10, 12, 3, '#6b4a2e') +
                    E(13 + k * 12, 32, 5, 2.2, '#f2c79a', 0, 1.2) +
                    L(`M${10 + k * 12} 38 Q${13 + k * 12} 36 ${16 + k * 12} 38`, 0.9, '#8b6a4a'),
            )
            .join('') +
        leaf(54, 34, 7, 30, '#4caf50', 0.5),
    // la terrine de brochet : une tranche marbrée et la terrine
    pikeTerrine:
        woodBoard() +
        R(6, 26, 30, 18, 3, '#f7e6d2') +
        L('M8 31 Q21 28 34 31 M8 37 Q21 34 34 37', 1.2, '#f2b6a0') +
        C(14, 34, 1.6, '#4caf50', 0) +
        C(28, 33, 1.4, '#e8364b', 0) +
        R(36, 24, 22, 20, 3, '#e8792a') +
        R(39, 22, 16, 5, 2, '#e8792a') +
        L('M38 30 L56 30', 1.2, '#b9561a') +
        leaf(18, 26, 6, -30, '#4caf50', 0.5),
    // la tartiflette dans son plat, reblochon fondu et lardons
    tartiflette:
        tray('#ffd75a') +
        [
            [16, 38],
            [28, 41],
            [40, 37],
            [48, 43],
            [22, 45],
        ]
            .map(([x, y]) => E(x, y, 4, 3, '#e8b65a', 0, 1))
            .join('') +
        [
            [20, 36],
            [34, 44],
            [46, 39],
        ]
            .map(([x, y]) => R(x - 1.6, y - 1.6, 3.2, 3.2, 0.8, '#e07a6e', 0.8))
            .join('') +
        FE(32, 38, 10, 3, '#fff6b0', 0.6) +
        steamF,
    // le tofu sauté : wok, dés dorés, légumes, baguettes
    stirTofu:
        SHADOW(30, 58, 27, 3) +
        L('M52 38 L62 32', 5) +
        L('M52 38 L62 32', 2.4, '#8b5a2b') +
        P('M4 34 Q8 54 30 54 Q52 54 56 34Z', '#4a4f57') +
        E(30, 34, 26, 7, '#5e6670') +
        [
            [14, 33],
            [24, 31],
            [34, 34],
            [42, 31],
            [20, 36],
        ]
            .map(([x, y]) => R(x - 3, y - 3, 6, 6, 1.2, '#f7e2a0', 1.2))
            .join('') +
        E(30, 31, 3, 1.6, '#e8364b', 0, 1) +
        E(46, 35, 3, 1.6, '#6cc04a', 0, 1) +
        E(10, 36, 3, 1.6, '#6cc04a', 0, 1) +
        L('M20 26 L48 6 M24 28 L50 10', 2.2, '#c08b52'),
    // les accras : beignets dorés, citron vert et sauce
    accras:
        plate(48) +
        [
            [18, 40],
            [30, 38],
            [42, 41],
            [24, 33],
            [36, 32],
        ]
            .map(
                ([x, y]) =>
                    C(x, y, 6, '#e8a548') +
                    [
                        [-2, -1],
                        [2, 1],
                        [0, 2.5],
                    ]
                        .map(([dx, dy]) => FC(x + dx, y + dy, 0.9, '#c9781a'))
                        .join('') +
                    FC(x - 2, y - 2, 1.4, '#ffd27a', 0.8),
            )
            .join('') +
        P('M44 32 L54 30 Q56 36 50 38Z', '#a6d94a', 1.4) +
        leaf(28, 27, 6, -30, '#4caf50', 0.5),
    // les galettes de manioc, empilées
    cassavaCakes:
        plate(48) +
        [0, 1, 2]
            .map(
                k =>
                    E(30 - k * 2, 42 - k * 5, 17, 5.5, k === 2 ? '#fbf1cf' : '#f2e3b0', 0, 1.8) +
                    [
                        [24, 0],
                        [31, 1],
                        [38, -1],
                    ]
                        .map(([x, d]) => FC(x - k * 2, 41 - k * 5 + d, 0.9, '#d9b07a'))
                        .join(''),
            )
            .join('') +
        FE(22, 31, 5, 1.4, '#fff', 0.6) +
        sub('cassava', 40, 26, 20),
    // les rochers coco dans leurs caissettes
    coconutRocks:
        plate(48) +
        [
            [20, 38],
            [34, 40],
            [27, 30],
            [43, 32],
        ]
            .map(
                ([x, y]) =>
                    P(`M${x - 6} ${y + 2} L${x - 5} ${y + 7} L${x + 5} ${y + 7} L${x + 6} ${y + 2}Z`, '#f6a5b5', 1.2) +
                    P(`M${x - 6} ${y + 2} Q${x - 7} ${y - 6} ${x} ${y - 7} Q${x + 7} ${y - 6} ${x + 6} ${y + 2}Z`, '#fbf3df') +
                    L(`M${x - 3} ${y - 3} L${x - 1} ${y - 1} M${x + 1} ${y - 5} L${x + 3} ${y - 3} M${x - 2} ${y + 0.5} L${x} ${y + 1.5}`, 0.9, '#d9c49a'),
            )
            .join(''),
    // le banana bread : un cake tranché avec une banane dessus
    bananaBread:
        woodBoard() +
        P('M8 44 L8 28 Q8 22 14 22 L42 22 Q48 22 48 28 L48 44Z', '#c98b4a') +
        P('M8 28 Q8 22 14 22 L42 22 Q48 22 48 28 Q28 32 8 28Z', '#a8693a') +
        P('M14 24 Q28 14 42 24 Q28 20 14 24Z', '#ffd94a', 1.6) +
        R(48, 26, 9, 18, 2, '#f2c79a') +
        [
            [51, 32],
            [54, 38],
            [51, 41],
        ]
            .map(([x, y]) => FC(x, y, 0.9, '#8b5a2b'))
            .join('') +
        HL(14, 30, 4, 1.4, 0, 0.5),
    // le gâteau renversé à l'ananas : anneaux d'ananas et cerises
    pineappleCake:
        plate(50) +
        P('M8 44 L8 32 Q32 28 56 32 L56 44 Q32 50 8 44Z', '#e8a548') +
        E(32, 32, 24, 7, '#c9781a') +
        [
            [18, 31],
            [32, 33],
            [46, 31],
        ]
            .map(([x, y]) => E(x, y, 6, 3.2, '#ffd94a', 0, 1.4) + E(x, y, 2.2, 1.2, '#c9781a', 0, 1) + C(x, y - 0.5, 1.6, '#e8364b', 1))
            .join('') +
        L('M10 40 Q32 44 54 40', 1.2, '#c9781a'),
    // la sauce tomate en bocal, une tomate et du basilic
    sauce: jar('#d93a2b', '#4caf50', sub('tomato', 22, 31, 20)) + leaf(46, 12, 8, -30, '#4caf50', 0.5),
});

// ---------------- les produits bruts ----------------
// ---- le lait : une bouteille en verre, capsule et étiquette avec l'animal ----
const milkB = (cap, label, animal, milk = '#ffffff', shape = 'round') => {
    const body =
        shape === 'jug'
            ? 'M22 8 L42 8 L42 16 Q50 22 50 32 L50 56 Q50 60 46 60 L18 60 Q14 60 14 56 L14 32 Q14 22 22 16Z'
            : 'M26 6 L38 6 L38 16 Q48 22 48 32 L48 56 Q48 60 44 60 L20 60 Q16 60 16 56 L16 32 Q16 22 26 16Z';
    return (
        SHADOW(32, 61, 16, 2.6) +
        (shape === 'jug' ? L('M49 28 Q60 28 58 40 Q56 48 49 47', 5) + L('M49 28 Q60 28 58 40 Q56 48 49 47', 2.4, '#eaf6fd') : '') +
        P(body, '#eaf6fd') +
        F(
            shape === 'jug'
                ? 'M15.4 26 Q20 22 32 22 Q44 22 48.6 26 L48.6 56 Q48.6 58.6 46 58.6 L18 58.6 Q15.4 58.6 15.4 56Z'
                : 'M17.4 26 Q22 22 32 22 Q42 22 46.6 26 L46.6 56 Q46.6 58.6 44 58.6 L20 58.6 Q17.4 58.6 17.4 56Z',
            milk,
        ) +
        R(shape === 'jug' ? 17 : 19, 34, shape === 'jug' ? 30 : 26, 18, 3, label, 1.6) +
        `<g transform="translate(${shape === 'jug' ? 21 : 22} 33) scale(${20 / 80})">${animals[animal]()}</g>` +
        F('M19 26 L22 24 L22 54 L19 54Z', '#fff', 0.5) +
        P(body, 'none') +
        R(shape === 'jug' ? 20 : 24.5, shape === 'jug' ? 3 : 1.5, shape === 'jug' ? 24 : 15, 7, 2.5, cap) +
        HL(27, 4, 1, 1.6, 0, 0.6)
    );
};
// ---- poissons : silhouettes et motifs propres à chaque espèce ----
const fishBody2 = (body, belly, fin, marks = '', tail = fin, shape = 'M6 34 Q14 20 32 20 Q46 20 52 30 L60 22 L58 34 L60 46 L52 38 Q46 48 32 48 Q14 48 6 34Z') =>
    SHADOW(32, 56, 24, 3) +
    P('M24 21 Q30 12 38 20Z', fin, 1.8) +
    P('M28 47 Q32 54 38 47Z', fin, 1.8) +
    P(shape, body) +
    F('M8 36 Q16 46 32 46 Q44 46 50 38 Q40 42 32 42 Q18 42 8 36Z', belly, 0.9) +
    marks +
    P('M52 30 L60 22 L58 34 L60 46 L52 38', tail, 2) +
    C(15, 30, 3.2, '#ffffff', 1.4) +
    FC(15.6, 30, 1.5, '#3a2618') +
    L('M22 26 Q25 34 22 42', 1.6, 'rgba(58,38,24,.5)') +
    HL(26, 25, 6, 1.6, -6, 0.6) +
    P(shape, 'none');
// ---- la laine : une pelote, fil qui dépasse ----
const yarn = (c, d, extra = '') =>
    SHADOW(30, 58, 22, 3) +
    C(30, 34, 22, c) +
    L('M12 24 Q30 34 48 22 M10 34 Q30 46 52 32 M14 46 Q30 52 46 46 M20 14 Q16 34 22 54 M34 12 Q42 34 36 56', 1.4, d) +
    C(30, 34, 22, 'none') +
    L('M50 44 Q58 52 54 58 Q50 62 58 62', 1.8, d) +
    HL(20, 24, 4, 2, -30, 0.6) +
    extra;

// dessinés à la demande (les animaux sont enregistrés après ce fichier)
const RAW = () => ({
    milk: milkB('#5aa9e6', '#e9f4fb', 'cow'),
    goatMilk: milkB('#6cc04a', '#eef8e6', 'goat', '#fffcf2', 'jug'),
    buffaloMilk: milkB('#4a4f57', '#eef0f2', 'buffalo', '#fffdf6'),
    donkeyMilk: milkB('#b58ad6', '#f4ecfb', 'donkey', '#fffaf4', 'jug'),
    // le lait d'alpage : un bidon en fer avec une fleur
    alpineMilk:
        SHADOW(32, 61, 18, 2.6) +
        P('M18 18 L46 18 L48 56 Q48 60 44 60 L20 60 Q16 60 16 56Z', '#c9d3dc') +
        R(22, 6, 20, 13, 3, '#dfe6ec') +
        R(20, 4, 24, 5, 2, '#9aa6b2') +
        L('M18 30 L46 30 M17 48 L47 48', 3, '#9aa6b2') +
        L('M22 12 Q14 12 14 20 M42 12 Q50 12 50 20', 2.4) +
        C(32, 39, 6, '#fffaf0', 1.4) +
        [0, 72, 144, 216, 288]
            .map(a => FE(32 + 3.4 * Math.cos((a * Math.PI) / 180), 39 + 3.4 * Math.sin((a * Math.PI) / 180), 2, 1.3, '#f6a5b5', 1, a))
            .join('') +
        FC(32, 39, 1.4, '#ffd23f') +
        HL(21, 34, 1.6, 7, 0, 0.6),
    // gardon : argenté, nageoires rouges
    roach: fishBody2('#c9d3dc', '#eef3f6', '#e8364b', L('M20 32 L48 32', 1, '#9aa6b2')),
    // perche : verte à bandes sombres, nageoire dorsale épineuse
    perch: fishBody2('#9cc45a', '#e8f4c8', '#f28c28', [24, 31, 38, 44].map(x => L(`M${x} 22 Q${x + 2} 34 ${x} 46`, 3, '#5e7a2e')).join('')),
    // sardine : fine et bleutée, rangée de points
    sardine: fishBody2(
        '#7fa7c9',
        '#eef3f6',
        '#5b7f9e',
        [22, 27, 32, 37, 42].map(x => FC(x, 30, 1.2, '#3f5f7a')).join(''),
        '#5b7f9e',
        'M6 34 Q14 26 32 26 Q46 26 52 31 L60 24 L58 34 L60 44 L52 37 Q46 42 32 42 Q14 42 6 34Z',
    ),
    // bar : gris argent, dos foncé, grande gueule
    seabass: fishBody2(
        '#a8b4be',
        '#f2f5f7',
        '#6d7a86',
        F('M10 28 Q20 20 34 20 Q46 21 52 30 Q40 26 30 27 Q18 28 10 30Z', '#6d7a86', 0.9) + L('M6 35 L12 36', 1.4),
    ),
    // les laines
    wool: yarn('#f7f3ea', '#c9bfa8'),
    alpacaWool: yarn('#e8c38c', '#b98a4a'),
    // le crin de cheval : une mèche nouée d'un ruban
    horsehair:
        SHADOW(32, 58, 18, 3) +
        P('M24 10 Q14 30 18 56 L26 56 Q22 34 30 14Z', '#5e3a1e') +
        P('M30 10 Q30 34 34 56 L42 56 Q38 32 38 10Z', '#7a4a2a') +
        P('M36 10 Q48 30 46 56 L52 56 Q56 30 42 10Z', '#5e3a1e') +
        L('M22 30 Q22 44 24 54 M34 20 Q36 40 38 54 M46 26 Q50 42 50 54', 1, '#a0703a') +
        R(20, 16, 26, 7, 3, '#e8364b') +
        P('M33 19 L26 28 L30 29Z', '#e8364b', 1.4) +
        P('M33 19 L40 28 L36 29Z', '#e8364b', 1.4),
    // la patate douce : tubercule rose, chair orangée
    sweetPotato:
        SHADOW(32, 56, 26, 3) +
        P('M6 36 Q8 24 22 22 Q40 18 54 28 Q60 34 56 42 Q48 50 30 48 Q10 48 6 36Z', '#c25a6a') +
        P('M40 30 Q50 26 56 34 Q52 44 42 42 Q36 38 40 30Z', '#f7a24a', 1.6) +
        L('M14 30 L18 32 M24 40 L28 40 M30 26 L33 28', 1.2, '#8e3a48') +
        L('M6 36 L1 38 M56 30 L62 26', 1.6) +
        HL(18, 28, 6, 2, -10, 0.45),
    // le ferment noble : un pot de grès et ses bulles
    ferment:
        SHADOW(32, 60, 18, 3) +
        P('M16 22 Q12 44 20 58 L44 58 Q52 44 48 22Z', '#d9b07a') +
        R(14, 14, 36, 9, 3, '#8b5a2b') +
        L('M14 34 Q32 38 50 34', 2, '#4f9e3a') +
        [
            [26, 8],
            [34, 4],
            [40, 9],
        ]
            .map(([x, y], k) => C(x, y, 2.2 + k * 0.4, '#fff6dc', 1.2))
            .join('') +
        C(32, 46, 6, '#fffaf0', 1.4) +
        FC(32, 46, 2.4, '#4f9e3a') +
        HL(20, 40, 1.6, 6, 0, 0.5),
    // la levure : un sachet en papier et une pincée qui s'en échappe
    yeast:
        SHADOW(32, 60, 17, 3) +
        P('M18 16 L46 16 L48 58 L16 58Z', '#f2e3b0') +
        L('M18 16 L22 10 L42 10 L46 16', 2.4) +
        L('M20 22 L44 22', 1.4, '#c9b07a') +
        C(32, 40, 8, '#fffaf0', 1.6) +
        [
            [30, 38],
            [34, 41],
            [31, 43],
            [35, 37],
        ]
            .map(([x, y]) => FC(x, y, 1.4, '#d9b07a'))
            .join('') +
        [
            [50, 12],
            [54, 8],
            [52, 16],
        ]
            .map(([x, y]) => FC(x, y, 1.4, '#fffaf0'))
            .join('') +
        HL(22, 30, 1.4, 8, 0, 0.4),
});

// ---------------- les produits d'atelier ----------------
const ani = (id, x, y, s) => `<g transform="translate(${x} ${y}) scale(${s / 80})">${animals[id]()}</g>`;

// ---- savons : un pain arrondi, une empreinte, des bulles ----
const soap = (c, d, mark, extra = '') =>
    SHADOW(32, 56, 25, 3) +
    P('M8 34 Q8 24 18 24 L46 24 Q56 24 56 34 L56 44 Q56 52 46 52 L18 52 Q8 52 8 44Z', c) +
    P('M8 34 Q8 24 18 24 L46 24 Q56 24 56 34 Q32 40 8 34Z', d, 0) +
    L('M8 34 Q32 40 56 34', 1.4, 'rgba(58,38,24,.4)') +
    R(20, 38, 24, 10, 4, 'none', 0) +
    mark +
    HL(16, 30, 5, 1.6, -6, 0.6) +
    C(48, 16, 4, '#eaf6fd', 1.4) +
    C(55, 9, 2.6, '#eaf6fd', 1.2) +
    C(41, 9, 2, '#eaf6fd', 1) +
    extra;
// ---- huiles : une burette en verre, l'huile dorée, une goutte, l'ingrédient en étiquette ----
const oil = (c, ing, cap = '#c8453a') => {
    const body = 'M27 8 L37 8 L37 20 Q48 26 48 38 L48 56 Q48 60 44 60 L20 60 Q16 60 16 56 L16 38 Q16 26 27 20Z';
    return (
        SHADOW(32, 61, 16, 2.6) +
        P(body, '#eaf6fd') +
        F('M17.4 34 Q22 28 32 28 Q42 28 46.6 34 L46.6 56 Q46.6 58.6 44 58.6 L20 58.6 Q17.4 58.6 17.4 56Z', c) +
        C(32, 46, 9, '#fffaf0', 1.6) +
        sub(ing, 25, 39, 14) +
        F('M19 34 L21.5 32 L21.5 54 L19 54Z', '#fff', 0.5) +
        P(body, 'none') +
        P('M28 8 L36 8 L35 2 L29 2Z', cap) +
        P('M50 14 Q46 22 50 24 Q54 22 50 14Z', c, 1.4) +
        HL(49, 21, 0.8, 1.2, 0, 0.8)
    );
};
// ---- teintures : un pot de teinte, des coulures et la fleur qui donne la couleur ----
const dye = (c, d, ing) =>
    SHADOW(30, 58, 22, 3) +
    P('M10 24 L46 24 L42 56 Q42 58 40 58 L16 58 Q14 58 14 56Z', '#8f8574') +
    L('M12 34 L44 34', 1.4, '#6d6457') +
    E(28, 24, 18, 5, '#6d6457') +
    E(28, 24, 15, 3.8, c, 0, 1.2) +
    P('M14 25 Q14 33 17 32 Q18 28 18 26 M38 26 Q40 36 42 34 Q42 30 41 26', c, 1.4) +
    L('M28 20 L44 4', 3, '#a0703a') +
    E(46, 3, 4, 2, c, -40, 1.4) +
    sub(ing, 38, 36, 22) +
    FE(22, 23, 4, 1, '#fff', 0.5);
// ---- parfums : flacons de formes différentes ----
const flacon = (shape, c, cap, extra = '') => {
    const B = {
        round: 'M20 26 Q8 34 10 46 Q12 58 32 58 Q52 58 54 46 Q56 34 44 26Z',
        square: 'M14 26 L50 26 L50 54 Q50 58 46 58 L18 58 Q14 58 14 54Z',
        tall: 'M22 22 L42 22 L46 54 Q46 58 42 58 L22 58 Q18 58 18 54Z',
        drop: 'M32 22 Q50 36 48 48 Q46 58 32 58 Q18 58 16 48 Q14 36 32 22Z',
    }[shape];
    const LQ = {
        round: 'M10.6 40 L53.4 40 Q53.8 43 53.6 46 Q51.6 56.6 32 56.6 Q12.4 56.6 10.4 46 Q10.2 43 10.6 40Z',
        square: 'M15.4 38 L48.6 38 L48.6 54 Q48.6 56.6 46 56.6 L18 56.6 Q15.4 56.6 15.4 54Z',
        tall: 'M19.6 38 L44.4 38 L44.6 54 Q44.6 56.6 42 56.6 L22 56.6 Q19.4 56.6 19.4 54Z',
        drop: 'M17.6 40 L46.4 40 Q47.4 44 46.6 48 Q45 56.6 32 56.6 Q19 56.6 17.4 48 Q16.6 44 17.6 40Z',
    }[shape];
    return (
        SHADOW(32, 60, 18, 2.6) +
        P(B, '#f4fbff') +
        F(LQ, c, 0.9) +
        P(B, 'none') +
        R(27, 14, 10, 9, 2, '#d8d0c2') +
        cap +
        extra +
        FE(22, 40, 2, 5, '#fff', 0.6, 10)
    );
};
const atom = c => C(32, 10, 5, c) + L('M37 10 Q44 10 46 4', 2) + C(48, 3, 3, c, 1.4);

// dessinés à la demande
const CRAFT = () => ({
    lavenderSoap: soap(
        '#c9a7e8',
        '#ddc6f2',
        L('M26 46 L38 40', 1.6, '#5a7a2e') + [0, 1, 2, 3].map(k => E(29 + k * 2.4, 44 - k * 1.3, 1.8, 1.1, '#7f56b5', -30, 0.8)).join(''),
    ),
    goatSoap: soap('#fbf6ea', '#ffffff', ani('goat', 22, 33, 20)),
    oliveSoap: soap(
        '#b8c88a',
        '#cbd8a2',
        L('M22 44 Q32 40 42 44', 1.6, '#5a7a2e') +
            E(27, 42, 2.2, 3, '#4a6a2a', 30, 1) +
            E(37, 41, 2.2, 3, '#3a2a26', -20, 1) +
            leaf(32, 42, 5, -60, '#6cc04a', 0.4),
    ),
    donkeySoap: soap('#e9dcf4', '#f4ecfb', ani('donkey', 22, 32, 20)),
    coconutSoap: soap('#ffffff', '#fdfaf2', E(32, 43, 7, 4.5, '#7a4a2a', 0, 1.4) + E(32, 42, 5, 3, '#fffaf0', 0, 1)),
    sunflowerOil: oil('#f6c94a', 'sunflower', '#ffd23f'),
    soyOil: oil('#efd98a', 'soy', '#6cc04a'),
    oliveOil: oil('#b7c24a', 'olive', '#4f7a2e'),
    coconutOil:
        SHADOW(32, 60, 18, 2.6) +
        P('M14 22 L50 22 L50 54 Q50 58 46 58 L18 58 Q14 58 14 54Z', '#eaf6fd') +
        F('M15.4 28 L48.6 28 L48.6 54 Q48.6 56.6 46 56.6 L18 56.6 Q15.4 56.6 15.4 54Z', '#fbf5e6') +
        R(12, 14, 40, 9, 3, '#8b5a2b') +
        C(32, 42, 9, '#fffaf0', 1.6) +
        E(32, 43, 6, 4, '#7a4a2a', 0, 1.2) +
        E(32, 42, 4.2, 2.6, '#fffaf0', 0, 0.8) +
        F('M17 30 L19.5 28 L19.5 54 L17 54Z', '#fff', 0.6),
    redDye: dye('#d93a2b', '#a12a1e', 'beet'),
    yellowDye: dye('#f5c542', '#c9952a', 'sunflower'),
    blueDye: dye('#3f6fb5', '#2a4f8a', 'blueberry'),
    perfume: flacon(
        'square',
        '#c9a7e8',
        atom('#9a6fd0'),
        leaf(26, 46, 8, -60, '#6cc04a', 0.3) + [0, 1, 2].map(k => E(28 + k * 2, 42 - k * 3, 1.8, 1.2, '#7f56b5', -30, 0.8)).join(''),
    ),
    lavenderWater: flacon(
        'tall',
        '#d9c4f0',
        R(26, 4, 12, 10, 2, '#7f56b5'),
        L('M30 54 L34 34', 1.4, '#5a7a2e') + [0, 1, 2, 3].map(k => E(34 + k * 0.4, 34 + k * 3, 1.6, 1.1, '#9a6fd0', -20, 0.8)).join(''),
    ),
    summerPerfume: flacon('round', '#ffd27a', atom('#f28c28'), sub('sunflower', 22, 34, 20)),
    vanillaPerfume: flacon(
        'drop',
        '#f0c97a',
        C(32, 9, 5.5, '#3a2618') + HL(30, 7, 1.4, 1, 0, 0.7),
        L('M22 52 Q32 36 42 46', 2.6, '#3a2618') + L('M22 52 Q32 36 42 46', 1, '#6b4a2e'),
    ),
    monoi: flacon('round', '#fff2c8', C(32, 9, 5, '#f2c14e'), sub('tiare', 22, 34, 20)),
    // la crème au lait d'ânesse : un petit pot rond et son étiquette
    donkeyCream:
        SHADOW(32, 58, 22, 3) +
        P('M10 30 L54 30 L52 52 Q52 56 48 56 L16 56 Q12 56 12 52Z', '#f4ecfb') +
        R(8, 22, 48, 10, 4, '#b58ad6') +
        L('M12 26 L52 26', 1, 'rgba(255,255,255,.6)') +
        R(18, 36, 28, 16, 4, '#fffaf0', 1.6) +
        ani('donkey', 22, 34, 20) +
        HL(15, 40, 1.4, 5, 0, 0.6),
    // le sirop de canne : une bouteille ambrée, un tronçon de canne
    caneSyrup:
        SHADOW(30, 61, 16, 2.6) +
        P('M24 8 L34 8 L34 18 Q44 24 44 34 L44 56 Q44 60 40 60 L18 60 Q14 60 14 56 L14 34 Q14 24 24 18Z', '#f4fbff') +
        F('M15.4 32 Q20 26 29 26 Q38 26 42.6 32 L42.6 56 Q42.6 58.6 40 58.6 L18 58.6 Q15.4 58.6 15.4 56Z', '#d98a2a') +
        R(18, 38, 22, 14, 3, '#fffaf0', 1.4) +
        FE(29, 45, 6, 3, '#d98a2a', 1) +
        P('M14 32 Q20 26 29 26 Q38 26 44 32', 'none', 0) +
        P('M24 8 L34 8 L34 18 Q44 24 44 34 L44 56 Q44 60 40 60 L18 60 Q14 60 14 56 L14 34 Q14 24 24 18Z', 'none') +
        R(23, 3, 12, 7, 2.5, '#8b5a2b') +
        R(46, 20, 7, 40, 3, '#9ac45a') +
        L('M46 32 L53 32 M46 46 L53 46', 2) +
        leaf(50, 20, 10, -70, '#6cc04a', 0.35),
    // la cassonade : un bocal de grains roux et une cuillère
    brownSugar:
        SHADOW(32, 60, 20, 3) +
        P('M12 30 Q10 56 22 58 L42 58 Q54 56 52 30Z', '#f4fbff') +
        F('M11.6 38 L52.4 38 Q53 56 42 56.6 L22 56.6 Q11 56 11.6 38Z', '#c9853e') +
        [
            [18, 44],
            [26, 48],
            [36, 44],
            [44, 50],
            [30, 52],
            [22, 54],
            [40, 54],
        ]
            .map(([x, y]) => R(x - 1.4, y - 1.4, 2.8, 2.8, 0.6, '#e8a856', 0))
            .join('') +
        E(32, 30, 20, 5, '#eaf6fd') +
        E(32, 30, 20, 5, 'none') +
        L('M40 34 L54 14', 3) +
        L('M40 34 L54 14', 1.4, '#d8d0c2') +
        E(56, 12, 5, 3, '#d8d0c2', -50, 1.6) +
        FC(56, 11, 1.6, '#c9853e') +
        HL(16, 46, 1.4, 6, 0, 0.5),
    // le coussin de plumes : gonflé, coins noués, une plume qui s'échappe
    pillow:
        SHADOW(32, 58, 26, 3) +
        P('M8 18 Q32 26 56 18 Q50 36 56 54 Q32 46 8 54 Q14 36 8 18Z', '#fbe1ea') +
        L('M14 24 Q32 30 50 24 M14 48 Q32 42 50 48', 1, '#e8b4c4') +
        C(32, 36, 3, '#e8364b', 1.4) +
        L('M32 36 L26 30 M32 36 L38 30 M32 36 L26 42 M32 36 L38 42', 0.9, '#e8b4c4') +
        P('M50 6 Q60 4 58 12 Q54 8 50 6Z', '#ffffff', 1.4) +
        L('M50 6 L60 12', 0.9) +
        HL(16, 26, 4, 1.4, 10, 0.6),
    // la toile de coton : un rouleau blanc et une fleur de coton
    cottonFabric:
        SHADOW(30, 58, 26, 3) +
        P('M8 30 L44 30 L44 50 L8 50Z', '#fffdf6') +
        E(44, 40, 6, 10, '#fffdf6') +
        E(44, 40, 3, 5, '#e6dfcc', 0, 1.2) +
        E(8, 40, 6, 10, '#f4efe2') +
        P('M8 50 L4 58 L40 58 L44 50Z', '#fffdf6', 1.8) +
        L('M14 30 L14 50 M24 30 L24 50 M34 30 L34 50', 0.8, '#ece6d6') +
        sub('cotton', 40, 4, 22),
    // la toile de lin : un rouleau écru, un brin de lin bleu
    linen:
        SHADOW(30, 58, 26, 3) +
        P('M8 30 L44 30 L44 50 L8 50Z', '#e6d6b0') +
        E(44, 40, 6, 10, '#e6d6b0') +
        E(44, 40, 3, 5, '#c9b88f', 0, 1.2) +
        E(8, 40, 6, 10, '#d9c79e') +
        P('M8 50 L4 58 L40 58 L44 50Z', '#e6d6b0', 1.8) +
        L('M10 34 L42 34 M10 38 L42 38 M10 42 L42 42 M10 46 L42 46', 0.6, '#c9b88f') +
        sub('flax', 40, 4, 22),
    // le duvet : un petit sac en toile d'où sortent des plumes légères
    down:
        SHADOW(32, 58, 22, 3) +
        P('M16 28 Q12 52 20 56 L44 56 Q52 52 48 28Z', '#e9eef2') +
        L('M16 30 Q32 36 48 30', 2) +
        L('M22 40 L42 40 M22 46 L42 46', 0.9, '#c9d3dc') +
        [
            [22, 22, -20],
            [32, 16, 0],
            [42, 22, 20],
            [28, 8, -30],
            [40, 10, 30],
        ]
            .map(([x, y, a]) => `<g transform="rotate(${a} ${x} ${y})">${E(x, y, 4, 7, '#ffffff', 0, 1.4)}${L(`M${x} ${y - 6} L${x} ${y + 7}`, 0.9)}</g>`)
            .join(''),
});

Object.assign(items, Object.fromEntries(Object.entries({ ...WINES, ...CHEESES }).map(([k, v]) => [k, () => v])));
let drinks = null;
const DRINK_IDS = [
    'juice',
    'carrotJuice',
    'orangeJuice',
    'watermelonJuice',
    'peachNectar',
    'grapeJuice',
    'blueberryJuice',
    'pineappleJuice',
    'mangoJuice',
    'guavaJuice',
    'cider',
    'pommeau',
    'genepiLiqueur',
    'summerPunch',
    'coconutMilk',
    'bananaSmoothie',
    'mangoPassion',
    'lassi',
    'limeade',
    'islandCocktail',
    'greenTea',
    'lavenderTea',
    'milkTea',
    'gingerTea',
    'icedTea',
    'blondBeer',
    'amberBeer',
    'cherryBeer',
    'mead',
    'rum',
    'arrangedRum',
    'coconutPunch',
    'coffee',
    'cafeLatte',
    'hotChoc',
    'soyMilk',
];
DRINK_IDS.forEach(k => (items[k] = () => (drinks = drinks || DRINKS())[k]));

let food = null;
const FOOD_IDS = [
    'garlicSoup',
    'risotto',
    'ricePudding',
    'spongeCake',
    'melonSorbet',
    'peachSorbet',
    'pasta',
    'garlicPasta',
    'mackerelRillettes',
    'cannedShrimp',
    'giantOmelette',
    'limePie',
    'blancManger',
    'sweetPotatoCake',
    'coconutRice',
    'coconutCurry',
    'sweetPotatoMash',
    'mangoChutney',
    'lycheeSyrup',
    'cornbread',
    'raclette',
    'focaccia',
    'garlicBread',
    'smokedEel',
    'pikeTerrine',
    'tartiflette',
    'stirTofu',
    'accras',
    'cassavaCakes',
    'coconutRocks',
    'bananaBread',
    'pineappleCake',
    'sauce',
];
FOOD_IDS.forEach(k => (items[k] = () => (food = food || FOOD())[k]));

let raw = null;
const RAW_IDS = [
    'milk',
    'goatMilk',
    'buffaloMilk',
    'donkeyMilk',
    'alpineMilk',
    'roach',
    'perch',
    'sardine',
    'seabass',
    'wool',
    'alpacaWool',
    'horsehair',
    'sweetPotato',
    'ferment',
    'yeast',
];
RAW_IDS.forEach(k => (items[k] = () => (raw = raw || RAW())[k]));

let craft = null;
const CRAFT_IDS = [
    'lavenderSoap',
    'goatSoap',
    'oliveSoap',
    'donkeySoap',
    'coconutSoap',
    'sunflowerOil',
    'soyOil',
    'oliveOil',
    'coconutOil',
    'redDye',
    'yellowDye',
    'blueDye',
    'perfume',
    'lavenderWater',
    'summerPerfume',
    'vanillaPerfume',
    'monoi',
    'donkeyCream',
    'caneSyrup',
    'brownSugar',
    'pillow',
    'cottonFabric',
    'linen',
    'down',
];
CRAFT_IDS.forEach(k => (items[k] = () => (craft = craft || CRAFT())[k]));

// ---------------- quatre machines redessinées ----------------
const MACH = () => ({
    // la fromagerie d'alpage : un grand chaudron de cuivre sur le feu, des meules sur l'étagère
    alpineDairy:
        SHADOW(32, 60, 29, 3) +
        R(36, 10, 24, 46, 3, '#c08b52') +
        L('M36 24 L60 24 M36 38 L60 38', 2.4) +
        E(48, 20, 9, 3, '#e2a548', 0, 1.6) +
        R(39, 16, 18, 4, 1, '#e2a548', 1.6) +
        E(48, 34, 9, 3, '#d3913a', 0, 1.6) +
        R(39, 30, 18, 4, 1, '#d3913a', 1.6) +
        E(48, 48, 9, 3, '#e2a548', 0, 1.6) +
        R(39, 44, 18, 5, 1, '#e2a548', 1.6) +
        P('M4 28 L36 28 Q36 50 20 52 Q4 50 4 28Z', '#d4793a') +
        E(20, 28, 16, 4.6, '#b8612a') +
        E(20, 28, 13, 3.4, '#fff6dc', 0, 1.2) +
        L('M8 34 Q20 40 32 34', 1.4, '#a8531f') +
        HL(9, 38, 1.6, 5, 0, 0.5) +
        L('M20 18 L20 26', 3) +
        L('M14 14 L26 14', 3, '#8b5a2b') +
        P('M10 56 Q12 50 16 54 Q18 48 21 54 Q24 49 26 56Z', '#f28c28', 1.4) +
        R(6, 54, 28, 4, 2, '#5e5548'),
    // la chocolaterie : une marmite où fond le chocolat qui coule dans un moule à tablettes
    chocolatier:
        SHADOW(32, 60, 29, 3) +
        R(4, 46, 56, 12, 3, '#d9b07a') +
        L('M4 50 L60 50', 1.2, '#a8793a') +
        R(30, 38, 26, 10, 2, '#5e3a1e', 1.8) +
        L('M38.6 38 L38.6 48 M47.2 38 L47.2 48', 1.2, '#3a2618') +
        FE(36, 41, 2, 1, '#8b5a2b', 1) +
        P('M6 16 L32 16 L30 40 Q30 44 26 44 L12 44 Q8 44 8 40Z', '#c9d3dc') +
        E(19, 16, 13, 3.6, '#5e3a1e') +
        E(19, 16, 13, 3.6, 'none') +
        P('M30 18 Q38 18 40 26 L40 40 Q40 42 38 40 L36 28 Q34 22 30 22Z', '#5e3a1e', 1.6) +
        FC(39, 42, 1.6, '#5e3a1e') +
        L('M12 6 L22 16', 2.6) +
        E(11, 5, 4, 2.4, '#d8d0c2', 40, 1.4) +
        HL(10, 24, 1.4, 6, 0, 0.6) +
        L('M2 22 L6 22 M32 22 L36 22', 2.4),
    // la conserverie : un tapis où défilent les boîtes, la sertisseuse au-dessus
    cannery:
        SHADOW(32, 60, 29, 3) +
        R(4, 40, 56, 8, 3, '#5e5548') +
        [10, 22, 34, 46, 56].map(x => C(x, 44, 2.4, '#8f8574', 1.2)).join('') +
        R(4, 48, 4, 10, 1, '#5e5548', 1.6) +
        R(56, 48, 4, 10, 1, '#5e5548', 1.6) +
        [
            [10, '#e8364b'],
            [24, '#3f6fb5'],
            [38, '#f7a21b'],
        ]
            .map(([x, c]) => R(x - 5, 28, 10, 12, 2, '#c9d3dc') + R(x - 5, 31, 10, 6, 0, c, 1.2) + E(x, 28, 5, 1.6, '#dfe6ec', 0, 1.4))
            .join('') +
        R(44, 6, 16, 22, 3, '#3f8f9e') +
        R(48, 28, 8, 6, 1.5, '#8f8574') +
        L('M52 34 L52 37', 2.4) +
        R(46, 10, 12, 7, 2, '#dfe6ec', 1.4) +
        FC(49, 22, 1.6, '#e8364b') +
        FC(55, 22, 1.6, '#6cc04a'),
    // la brasserie : une cuve de cuivre à dôme, le houblon et une chope
    brewery:
        SHADOW(32, 60, 28, 3) +
        R(4, 54, 40, 5, 2, '#5e5548') +
        P('M8 30 Q8 16 24 14 Q40 16 40 30 L40 52 Q40 56 36 56 L12 56 Q8 56 8 52Z', '#d4793a') +
        L('M8 34 L40 34 M8 46 L40 46', 1.6, '#a8531f') +
        L('M24 14 L24 6 L46 6 L46 20', 3) +
        L('M24 14 L24 6 L46 6 L46 20', 1.4, '#e2a548') +
        C(24, 40, 4, '#e2a548', 1.4) +
        FC(24, 40, 1.6, '#3a2618') +
        HL(13, 28, 2, 8, 0, 0.5) +
        R(44, 34, 14, 22, 3, '#eaf6fd') +
        F('M45.4 40 L56.6 40 L56.6 54 Q56.6 55 55 55 L47 55 Q45.4 55 45.4 54Z', '#f5c542') +
        P('M43 36 Q42 28 48 30 Q51 26 55 30 Q60 30 59 36Z', '#fffdf3') +
        L('M58 40 Q63 40 63 46 Q63 51 58 51', 2.2) +
        sub('hop', 4, 4, 16),
});
let mach = null;
['alpineDairy', 'chocolatier', 'cannery', 'brewery'].forEach(k => (machines[k] = () => (mach = mach || MACH())[k]));

// les outils de dessin, réutilisés par les familles suivantes (1.3.1)
export { plate, bowl, jar, coupe, scoop, juiceB, tallGlass, tray, steamF, woodBoard, cup, oil, milkB, wheel, yarn, soap, flacon, fishBody2 };
