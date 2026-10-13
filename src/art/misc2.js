// Refonte (1.2.15) : cinq décorations et la montgolfière, redessinées.
import { C, E, F, FC, FE, HL, L, P, R, SHADOW, ui } from './kit.js';

const GOLD = '#ffd23f',
    GOLD_D = '#e0a92a',
    WOOD = '#a8693a',
    WOOD_D = '#7a4a2a',
    WOOD_L = '#d9a066';

// une rosette de ruban
const rosette = (x, y, c1, c2) =>
    P(`M${x - 4} ${y + 2} L${x - 7} ${y + 13} L${x - 2} ${y + 10} L${x} ${y + 14} L${x + 1} ${y + 3}Z`, c2, 1.6) +
    P(`M${x + 4} ${y + 2} L${x + 7} ${y + 13} L${x + 2} ${y + 10} L${x} ${y + 14} L${x - 1} ${y + 3}Z`, c2, 1.6) +
    C(x, y, 6, c1, 1.8) +
    C(x, y, 3, '#fff8d6', 1.2);

Object.assign(ui, {
    // la meule d'or : une grande meule entamée sur sa planche, une part posée devant
    cheeseWheel: () =>
        SHADOW(32, 57, 26, 3) +
        P('M5 51 L59 51 L56 57 L8 57Z', WOOD, 2) +
        L('M14 54 L50 54', 1, 'rgba(58,38,24,.35)') +
        // le flanc, puis le dessus de la meule entière
        P('M7 28 L7 42 Q32 52 57 42 L57 28Z', GOLD_D) +
        L('M7 35 Q32 45 57 35', 1.2, 'rgba(58,38,24,.3)') +
        E(32, 28, 25, 9, GOLD) +
        E(32, 28, 17, 5.5, 'none', 0, 1.2) +
        HL(20, 25, 7, 2, -6, 0.6) +
        // la médaille d'or épinglée sur le flanc
        rosette(20, 40, GOLD, '#c8453a') +
        // une part posée devant
        P('M38 50 L56 45 L56 50 L38 55Z', '#ffe58a', 1.8) +
        P('M38 50 L48 41 L56 45Z', GOLD, 1.8) +
        FC(45, 50.5, 1.2, GOLD_D) +
        FC(50.5, 48.5, 1, GOLD_D),

    // le tonneau d'honneur : sur son chevalet, cerclé de cuivre, robinet et rosette
    honorBarrel: () =>
        SHADOW(32, 58, 24, 3) +
        L('M14 57 L20 44 M50 57 L44 44 M14 57 L24 57 M40 57 L50 57', 3, WOOD_D) +
        L('M16 52 L48 52', 2.6, WOOD) +
        P('M10 30 Q10 14 32 14 Q54 14 54 30 Q54 46 32 46 Q10 46 10 30Z', WOOD) +
        // douelles
        L('M18 17 Q14 30 18 43 M25 15 Q22 30 25 45 M39 15 Q42 30 39 45 M46 17 Q50 30 46 43', 1.1, 'rgba(58,38,24,.4)') +
        // cercles de cuivre
        P('M14 20 Q32 13 50 20', 'none', 0) +
        L('M13.5 21 Q32 15 50.5 21', 3.6, '#3a2618') +
        L('M13.5 21 Q32 15 50.5 21', 2, '#d98b3a') +
        L('M13.5 39 Q32 45 50.5 39', 3.6, '#3a2618') +
        L('M13.5 39 Q32 45 50.5 39', 2, '#d98b3a') +
        HL(20, 26, 3, 7, 0, 0.35) +
        // le robinet
        R(29, 40, 6, 5, 1, '#d98b3a', 1.6) +
        L('M32 45 L32 48', 2.2) +
        L('M29 41 L35 41', 1.6) +
        rosette(32, 28, GOLD, '#c8453a'),

    // la grande cloche : bronze, sur sa sangle de cuir brodée d'edelweiss
    cowbell: () =>
        SHADOW(32, 58, 18, 2.5) +
        // la sangle
        P('M10 8 Q32 22 54 8 L54 15 Q32 29 10 15Z', '#8e2c22', 2) +
        L('M12 11.5 Q32 25 52 11.5', 1, 'rgba(255,255,255,.45)') +
        [16, 25, 39, 48]
            .map(x => {
                const y = 12.5 + 7 * (1 - Math.pow((x - 32) / 22, 2));
                return (
                    [0, 72, 144, 216, 288]
                        .map(a => FE(x + 1.6 * Math.cos((a * Math.PI) / 180), y + 1.6 * Math.sin((a * Math.PI) / 180), 1.2, 1.2, '#fff'))
                        .join('') + FC(x, y, 0.9, GOLD)
                );
            })
            .join('') +
        R(27, 22, 10, 5, 1.5, '#9a9a9a', 1.8) +
        // la cloche
        P('M22 28 Q22 25 26 25 L38 25 Q42 25 42 28 L46 50 Q46 54 32 54 Q18 54 18 50Z', '#d9a03a') +
        F('M38 27 L44 50 Q44 52 38 53 Z', '#b8862a', 0.8) +
        L('M20 47 Q32 50 44 47', 1.4, 'rgba(58,38,24,.45)') +
        HL(26, 36, 2.4, 8, 6, 0.55) +
        C(32, 56, 3.4, '#8a6a3a', 1.8),

    // le pressoir ancien : la vis, la barre, la cage de douelles et le jus qui coule
    oldPress: () =>
        SHADOW(32, 58, 26, 3) +
        // le plateau
        P('M6 50 L58 50 L56 57 L8 57Z', WOOD, 2) +
        R(46, 51, 8, 3, 1, '#7a2a6b', 1.2) +
        // les montants et la traverse
        R(9, 8, 6, 43, 1.5, WOOD_D) +
        R(49, 8, 6, 43, 1.5, WOOD_D) +
        R(6, 6, 52, 7, 2, WOOD) +
        // la vis
        R(29.5, 13, 5, 18, 1, '#8f8574', 1.8) +
        L('M29.5 16 L34.5 18 M29.5 20 L34.5 22 M29.5 24 L34.5 26 M29.5 28 L34.5 30', 1.1) +
        // la barre de manœuvre
        L('M18 22 L46 18', 4.4) +
        L('M18 22 L46 18', 2.4, WOOD_L) +
        // le mouton et la cage
        R(18, 31, 28, 5, 1.5, WOOD) +
        R(19, 36, 26, 14, 2, '#c08b52') +
        L('M24 36 L24 50 M29 36 L29 50 M34 36 L34 50 M39 36 L39 50', 1.2, 'rgba(58,38,24,.45)') +
        L('M19 40 L45 40 M19 46 L45 46', 1.8, '#5e3a1e') +
        // des grappes qui débordent
        [21, 25, 29].map((x, k) => C(x, 34 - (k % 2), 2.2, '#7a2a6b', 1.2)).join('') +
        // le jus
        P('M45 48 Q49 48 50 51 L48 51 Q47 50 45 50Z', '#a8325c', 1.4),

    // le mannequin de couture : robe épinglée, mètre-ruban, pied en bois
    mannequin: () =>
        SHADOW(32, 58, 14, 2.5) +
        L('M32 44 L32 54 M22 57 L32 53 L42 57', 3, WOOD_D) +
        // le buste
        P('M22 10 Q32 6 42 10 Q46 18 42 26 Q46 36 44 44 L20 44 Q18 36 22 26 Q18 18 22 10Z', '#f2e6d0') +
        R(29, 4, 6, 6, 2, WOOD) +
        // la robe épinglée
        P('M22 26 Q32 30 42 26 Q46 36 44 44 L20 44 Q18 36 22 26Z', '#e8364b', 2) +
        P('M24 12 Q32 17 40 12 L42 26 Q32 30 22 26Z', '#e8364b', 2) +
        L('M26 13 Q32 22 38 13', 1.2, '#fff') +
        L('M23 32 Q32 35 41 32', 1, 'rgba(255,255,255,.6)') +
        FC(30, 38, 1.2, '#fff') +
        FC(34, 38, 1.2, '#fff') +
        // épingles
        L('M38 20 L44 16 M40 30 L46 28', 1.2, '#8f8574') +
        FC(44, 16, 1.4, GOLD) +
        FC(46, 28, 1.4, '#5aa9e6') +
        // le mètre-ruban
        L('M21 13 Q14 26 18 40 Q20 46 14 52', 3.4) +
        L('M21 13 Q14 26 18 40 Q20 46 14 52', 2, '#ffd23f') +
        L('M17 20 L18.5 20.5 M15.5 27 L17 27.2 M16 34 L17.5 34 M18 41 L19.5 41', 0.9),
});

// la montgolfière : enveloppe à fuseaux, cordages, nacelle tressée et sacs de lest
export const balloon2 = (a = '#e8364b', b = '#ffd23f') =>
    `<ellipse cx="32" cy="78" rx="10" ry="2" fill="#000" opacity=".12"/>` +
    P('M32 4 C50 4 58 18 56 32 C54 44 42 50 38 56 L26 56 C22 50 10 44 8 32 C6 18 14 4 32 4Z', a) +
    P('M32 4 C38 4 42 18 41 32 C40 44 36 50 35 56 L29 56 C28 50 24 44 23 32 C22 18 26 4 32 4Z', b, 2) +
    P('M32 4 C34 10 34 40 32 56', 'none', 1.6) +
    L('M9 30 Q32 36 55 30', 1.4, 'rgba(58,38,24,.45)') +
    HL(18, 18, 3, 7, 20, 0.5) +
    R(25, 55, 14, 3, 1.5, '#8f8574', 1.6) +
    L('M26 58 L27 66 M38 58 L37 66 M31 58 L31 66 M33 58 L33 66', 1.2) +
    P('M25 66 L39 66 L37 76 L27 76Z', '#c08b52', 2) +
    L('M25.6 69.5 L38.4 69.5 M26.3 73 L37.7 73 M30 66 L29.8 76 M34 66 L34.2 76', 0.9, 'rgba(58,38,24,.5)') +
    E(24, 70, 2.4, 3, '#d8c39a', 0, 1.4) +
    E(40, 70, 2.4, 3, '#d8c39a', 0, 1.4);

// l'icône (carré 64) reprend la nouvelle montgolfière
ui.balloon = () => `<g transform="translate(6.4 0) scale(.8)">${balloon2()}</g>`;
