// Les grands défis (1.1) : les 12 décorations uniques et les coupes de la salle des trophées.
import { C, E, F, FC, HL, L, P, R, SHADOW, ui } from './kit.js';

// une coupe : couleur de la médaille (vide = pas encore gagnée)
const cup = (f, d) =>
    SHADOW(32, 60, 18, 3) +
    R(20, 50, 24, 8, 2, d) +
    R(26, 42, 12, 9, 1, f) +
    P('M14 10 L50 10 Q50 36 32 40 Q14 36 14 10Z', f) +
    L('M14 14 Q4 14 6 22 Q8 30 18 28 M50 14 Q60 14 58 22 Q56 30 46 28', 3) +
    HL(22, 18, 3, 8, -10, 0.5);

Object.assign(ui, {
    cupNone: () => cup('#e8dcc2', '#cbbd9d').replace(/fill="#e8dcc2"/g, 'fill="#e8dcc2" stroke-dasharray="4 3"'),
    cupBronze: () => cup('#d08a45', '#a8693a') + C(32, 22, 6, '#e8a35f', 1.6),
    cupSilver: () => cup('#cfd6de', '#9aa3ad') + C(32, 22, 6, '#eef2f5', 1.6),
    cupGold: () => cup('#f2c14e', '#d99a2b') + P('M32 15 L34 20 L39 20 L35 23 L37 28 L32 25 L27 28 L29 23 L25 20 L30 20Z', '#fff6c8', 1.4),

    // le banquet : une table dressée
    banquetTable: () =>
        SHADOW(32, 60, 28, 3) +
        L('M10 40 L8 58 M54 40 L56 58', 3.4, '#8b5a2b') +
        R(4, 34, 56, 8, 3, '#fbe9d2') +
        L('M4 42 Q12 48 20 42 Q28 48 36 42 Q44 48 52 42 Q58 46 60 42', 2, '#e8364b') +
        E(18, 30, 9, 5, '#f2c14e') +
        C(18, 27, 3, '#e8792a', 1.4) +
        E(40, 31, 8, 4, '#fff') +
        P('M36 31 Q40 22 44 31Z', '#c8453a', 1.6) +
        R(51, 18, 4, 14, 1, '#7a2a3a', 1.6) +
        C(53, 17, 3, '#7a2a3a', 1.4),

    // la foire aux bestiaux : une statue de taureau sur son socle
    bullStatue: () =>
        SHADOW(32, 60, 22, 3) +
        R(12, 46, 40, 12, 3, '#d8d0c2') +
        L('M16 52 L48 52', 1.4, '#b9ad9a') +
        E(30, 34, 15, 9, '#c9a24a') +
        R(18, 38, 4, 9, 1.5, '#c9a24a', 1.8) +
        R(36, 38, 4, 9, 1.5, '#c9a24a', 1.8) +
        C(46, 28, 7, '#c9a24a') +
        L('M42 22 Q40 15 44 14 M50 22 Q53 15 50 13', 2.4) +
        FC(48, 27, 1.4, '#3a2618') +
        HL(26, 30, 6, 2.5, -10, 0.5),

    // le verger : une brouette de pommes
    appleCart: () =>
        SHADOW(32, 60, 26, 3) +
        L('M6 30 L14 42 M58 30 L50 42', 3, '#8b5a2b') +
        P('M12 30 L52 30 L48 46 L16 46Z', '#c08b52') +
        L('M18 34 L46 34 M20 40 L44 40', 1.4, '#8b5a2b') +
        [16, 25, 34, 43, 21, 30, 39].map((x, k) => C(x + 4, k < 4 ? 26 : 19, 5, k % 3 ? '#e2412f' : '#6cc04a', 1.6)).join('') +
        C(32, 50, 7, '#5e3a1e') +
        C(32, 50, 2.4, '#c08b52', 1.4),

    // les îles : un hamac entre deux palmiers
    hammock: () =>
        SHADOW(32, 60, 28, 3) +
        L('M10 58 Q8 34 12 14 M54 58 Q56 34 52 14', 4, '#8b5a2b') +
        P('M12 14 Q2 10 0 16 Q6 12 12 16 Q8 6 16 4 Q14 10 12 14Z', '#4f9e3a', 1.6) +
        P('M52 14 Q62 10 64 16 Q58 12 52 16 Q56 6 48 4 Q50 10 52 14Z', '#4f9e3a', 1.6) +
        L('M12 30 L18 34 M52 30 L46 34', 1.6) +
        P('M18 32 Q32 48 46 32 Q32 40 18 32Z', '#e8364b') +
        L('M22 36 Q32 42 42 36', 1.4, '#ffd23f'),

    // la cave : un tonneau d'honneur cerclé d'or
    honorBarrel: () =>
        SHADOW(32, 60, 22, 3) +
        L('M10 58 L18 46 M54 58 L46 46', 3, '#5e3a1e') +
        E(32, 34, 22, 15, '#a8693a') +
        L('M16 22 Q12 34 16 46 M48 22 Q52 34 48 46', 3, '#f2c14e') +
        E(32, 34, 9, 15, 'none', 0, 1.4) +
        E(32, 34, 6, 6, '#7a4a2a', 0, 1.6) +
        C(32, 34, 2, '#3a2618') +
        P('M28 12 L32 6 L36 12 L42 10 L38 16 L26 16 L22 10Z', '#f2c14e', 1.4),

    // l'export : une locomotive miniature
    miniLoco: () =>
        SHADOW(32, 60, 28, 3) +
        L('M4 54 L60 54', 2.4, '#8f8574') +
        R(10, 30, 30, 18, 3, '#e8364b') +
        R(36, 20, 18, 28, 3, '#3f6fb5') +
        R(40, 25, 10, 8, 1.5, '#bfe6ff', 1.6) +
        R(14, 20, 7, 11, 1.5, '#5e5548') +
        P('M12 20 L23 20 L21 16 L14 16Z', '#3a2618', 1.6) +
        FC(18, 10, 4, '#fff', 0.85) +
        FC(24, 6, 3, '#fff', 0.7) +
        C(18, 50, 5, '#3a2618') +
        C(32, 50, 5, '#3a2618') +
        C(46, 50, 5, '#3a2618') +
        C(46, 50, 1.6, '#f2c14e', 1),

    // le château : une tour crénelée
    castleTower: () =>
        SHADOW(32, 60, 20, 3) +
        R(16, 18, 32, 40, 2, '#d8d0c2') +
        P('M14 10 L20 10 L20 14 L26 14 L26 10 L32 10 L32 14 L38 14 L38 10 L44 10 L44 14 L50 14 L50 20 L14 20Z', '#c9c2b8') +
        P('M26 58 L26 46 Q32 38 38 46 L38 58Z', '#7a4a2a') +
        R(29, 26, 6, 9, 3, '#3a2618', 1.4) +
        L('M20 30 L24 30 M40 40 L44 40 M20 48 L23 48', 1.4, '#b9ad9a') +
        L('M32 10 L32 0', 2) +
        P('M32 1 L44 4 L32 8Z', '#e8364b', 1.6),

    // le Salon national : une médaille géante sur un chevalet
    bigMedal: () =>
        SHADOW(32, 60, 20, 3) +
        L('M20 58 L28 30 M44 58 L36 30', 3, '#8b5a2b') +
        P('M24 4 L30 22 L34 22 L40 4 L34 4 L32 12 L30 4Z', '#3f6fb5', 1.8) +
        C(32, 32, 15, '#f2c14e') +
        C(32, 32, 10, '#ffd23f', 1.6) +
        P('M32 25 L34 30 L39 30 L35 33 L37 38 L32 35 L27 38 L29 33 L25 30 L30 30Z', '#e8a93a', 1.2) +
        HL(25, 26, 3, 5, -30, 0.6),

    // la marée : un phare miniature
    miniLighthouse: () =>
        SHADOW(32, 60, 20, 3) +
        P('M12 58 Q16 50 32 50 Q48 50 52 58Z', '#8f8574') +
        P('M24 50 L27 18 L37 18 L40 50Z', '#fff') +
        P('M25.6 36 L38.4 36 L39 42 L25 42Z', '#e8364b', 0) +
        P('M26.6 24 L37.4 24 L37.9 30 L26.1 30Z', '#e8364b', 0) +
        P('M24 50 L27 18 L37 18 L40 50Z', 'none') +
        R(25, 10, 14, 8, 2, '#ffd23f') +
        P('M23 10 L32 2 L41 10Z', '#e8364b') +
        F('M39 13 L62 6 L62 20Z', '#fff6a8', 0.6),

    // la transhumance : un chalet miniature fleuri
    miniChalet: () =>
        SHADOW(32, 60, 26, 3) +
        R(12, 30, 40, 28, 2, '#c08b52') +
        L('M12 38 L52 38 M12 46 L52 46', 1.4, '#8b5a2b') +
        P('M4 32 L32 8 L60 32 L54 34 L32 15 L10 34Z', '#8f3a2a') +
        R(27, 42, 10, 16, 1.5, '#7a4a2a') +
        R(16, 34, 8, 7, 1, '#bfe6ff', 1.6) +
        R(40, 34, 8, 7, 1, '#bfe6ff', 1.6) +
        [17, 21, 41, 45].map((x, k) => C(x, 42, 2, k % 2 ? '#e8364b' : '#ffd23f', 1)).join('') +
        L('M44 14 L44 6 L50 6 L50 19', 2.4),

    // le défilé : un mannequin de couture
    mannequin: () =>
        SHADOW(32, 60, 16, 3) +
        L('M32 44 L32 56 M22 58 L42 58', 3, '#5e3a1e') +
        P('M22 10 Q32 4 42 10 L40 24 Q46 34 42 44 L22 44 Q18 34 24 24Z', '#e8364b') +
        P('M24 24 Q32 28 40 24 L41 30 Q32 34 23 30Z', '#ffd23f', 1.6) +
        C(32, 6, 3.4, '#8b5a2b', 1.6) +
        L('M26 14 Q32 18 38 14', 1.4, '#fff') +
        L('M44 20 L54 30', 1.6, '#8f8574') +
        C(54, 30, 2, '#fff', 1.2),

    // les parfums : une fontaine qui sent bon
    perfumeFountain: () =>
        SHADOW(32, 60, 26, 3) +
        E(32, 50, 26, 8, '#b9ad9a') +
        E(32, 48, 22, 5.5, '#9fd6f5', 0, 1.6) +
        R(28, 24, 8, 24, 2, '#d8d0c2') +
        E(32, 24, 12, 4, '#d8d0c2') +
        L('M32 20 Q24 10 20 20 M32 20 Q40 10 44 20', 2, '#5aa9e6') +
        C(32, 14, 4, '#b58ad6', 1.6) +
        [10, 18, 46, 54].map((x, k) => C(x, 44 - (k % 2) * 2, 3, ['#b58ad6', '#f6a5b5', '#ffd23f', '#b58ad6'][k], 1.2)).join(''),
});
