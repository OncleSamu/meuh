// Refonte des dessins (1.3) : les produits redessinés, famille par famille. Ces dessins remplacent ceux de items.js.
import { C, E, F, FC, FE, HL, L, P, R, SHADOW, leaf, sub, items } from './kit.js';

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
const wine2 = ({ glass, glassHi, wine, label, band, capsule, capsuleD, mark }) => {
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
        L('M26 49.5 L38 49.5', 1.1, 'rgba(58,38,24,.5)') +
        // la capsule plissée et le col
        P('M27 2 L37 2 L37 15 L27 15Z', capsule, 2.2) +
        L('M29.5 4 L29.5 14 M32 4 L32 14 M34.5 4 L34.5 14', 0.8, capsuleD) +
        L('M27 11 L37 11', 1.4) +
        // reflets du verre
        F('M22.6 32 Q22.8 27.8 25.6 26 L25.6 55 Q22.6 55 22.6 52Z', glassHi, 0.55) +
        FE(40.5, 30, 1.2, 2.8, '#fff', 0.55, 20) +
        FC(24, 57, 0.9, '#fff', 0.5) +
        P(body, 'none')
    );
};
const champ2 = ({ label, foil, foilD, wine }) => {
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
        C(32, 44.5, 4.2, foil, 1.3) +
        P('M30 43.5 L32 41.5 L34 43.5 L32 47.5Z', foilD, 0) +
        F('M22 33 Q22.5 29.5 25.5 28 L25.5 55 Q22 55 22 52Z', '#ffffff', 0.22) +
        FE(41, 33, 1.2, 2.6, '#fff', 0.5, 20) +
        // l'étincelle de fête
        P('M49 5 L50.6 9 L54.6 10.4 L50.6 11.8 L49 16 L47.4 11.8 L43.4 10.4 L47.4 9Z', '#ffd23f', 1.4) +
        FC(53, 15, 1, '#fff', 0.9) +
        P(body, 'none')
    );
};

const WINES = {
    redWine: wine2({
        glass: '#2b4f30',
        glassHi: '#7fb08a',
        wine: '#6b1424',
        label: '#f7ecd8',
        band: '#8e2c22',
        capsule: '#a12a36',
        capsuleD: '#6b1424',
        mark: '#6b2a5e',
    }),
    whiteWine: wine2({
        glass: '#cfe6b8',
        glassHi: '#ffffff',
        wine: '#f2d76a',
        label: '#fffaf0',
        band: '#e8b84a',
        capsule: '#e8c14e',
        capsuleD: '#b48a24',
        mark: '#a6c24a',
    }),
    roseWine: wine2({
        glass: '#f3e7ea',
        glassHi: '#ffffff',
        wine: '#f39ab0',
        label: '#fff4f6',
        band: '#e8364b',
        capsule: '#f0a6b8',
        capsuleD: '#c46a82',
        mark: '#c4406a',
    }),
    champagne: champ2({ label: '#f7ecd8', foil: '#f2c14e', foilD: '#b08a2a', wine: '#f2d76a' }),
    champagneRose: champ2({ label: '#fbd9e2', foil: '#f6a5b5', foilD: '#c46a82', wine: '#f39ab0' }),
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
