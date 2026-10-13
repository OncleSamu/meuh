// Refonte des dessins (1.3) : les produits redessinés, famille par famille. Ces dessins remplacent ceux de items.js.
import { C, E, F, FC, FE, HL, L, P, R, SHADOW, leaf, items } from './kit.js';

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

Object.assign(items, Object.fromEntries(Object.entries({ ...WINES, ...CHEESES }).map(([k, v]) => [k, () => v])));
