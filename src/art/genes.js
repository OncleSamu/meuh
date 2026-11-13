// 1.121 : les icônes propres aux caractères génétiques (elles remplacent des icônes empruntées ailleurs).
// Cadre 64 × 64, lisibles dès 14 px : une forme simple, un contour franc, une couleur dominante.
import { C, E, F, FC, HL, L, P, ui } from './kit.js';

const O = '#3a2618';

Object.assign(ui, {
    // Santé : un écusson blanc et sa croix verte
    gHealth: () =>
        P('M32 6 Q44 12 54 12 Q54 40 32 58 Q10 40 10 12 Q20 12 32 6Z', '#f4fbf2', 2.6) +
        P('M27 18 L37 18 L37 27 L46 27 L46 37 L37 37 L37 46 L27 46 L27 37 L18 37 L18 27 L27 27Z', '#4caf50', 2.2) +
        HL(20, 18, 4, 2.4, -30, 0.7),

    // Maturation lente : l'escargot, sa coquille d'or (lent, mais plus souvent en or)
    gLate: () =>
        P('M8 50 Q8 42 18 42 L44 42 Q52 42 56 34 Q58 30 54 26 Q58 24 60 28 Q62 36 58 44 Q54 52 44 52 L14 52 Q8 52 8 50Z', '#c9a27a', 2.4) +
        L('M50 30 L48 20 M56 27 L58 18', 2.2) +
        FC(48, 19, 2.2, O) +
        FC(58, 17, 2.2, O) +
        C(30, 30, 15, '#ffd23f', 2.6) +
        L('M30 30 m-3 0 a3 3 0 1 1 6 0 a6 6 0 1 1 -12 0 a9 9 0 1 1 18 0', 2.2, '#b8860b') +
        HL(23, 22, 4, 2.4, -30, 0.75),

    // Sociabilité : trois têtes rondes serrées l'une contre l'autre
    gSocial: () =>
        C(16, 36, 10, '#f6c28b', 2.4) +
        C(48, 36, 10, '#f6c28b', 2.4) +
        P('M4 60 Q6 48 16 48 Q26 48 28 60Z', '#7fb3d5', 2.2) +
        P('M36 60 Q38 48 48 48 Q58 48 60 60Z', '#7fb3d5', 2.2) +
        C(32, 26, 12, '#ffd9a8', 2.6) +
        P('M17 62 Q19 42 32 42 Q45 42 47 62Z', '#e57373', 2.4) +
        FC(28, 25, 1.6, O) +
        FC(36, 25, 1.6, O) +
        L('M28 31 Q32 34 36 31', 2) +
        HL(27, 19, 3.4, 2, -25, 0.7),

    // Chance : le trèfle à quatre feuilles
    gLuck: () => {
        const lf = (x, y, r) => `<g transform="rotate(${r} 32 30)">${P('M32 30 Q22 22 24 12 Q28 6 32 12 Q36 6 40 12 Q42 22 32 30Z', '#5cb85c', 2.4)}</g>`;
        return L('M32 32 Q34 46 26 58', 4, O) + L('M32 32 Q34 46 26 58', 2, '#3f8f2e') + lf(0, 0, 0) + lf(0, 0, 90) + lf(0, 0, 180) + lf(0, 0, 270) + FC(32, 30, 3, '#8bd88b') + HL(28, 16, 3, 1.8, -30, 0.7);
    },

    // Fécondité : le nid et ses trois œufs
    gFertile: () =>
        E(32, 30, 8, 10, '#fff8e8', -12, 2.2) +
        E(22, 34, 7.5, 9.5, '#cfe8f5', -20, 2.2) +
        E(42, 34, 7.5, 9.5, '#f9e2b8', 18, 2.2) +
        P('M6 38 Q8 56 32 58 Q56 56 58 38 Q46 46 32 46 Q18 46 6 38Z', '#b07a43', 2.6) +
        L('M10 44 Q32 52 54 44 M14 50 Q32 56 50 50', 1.8, '#7a4f26') +
        L('M8 40 L4 36 M56 40 L61 36 M20 47 L16 52', 1.8, '#7a4f26') +
        HL(30, 25, 2.4, 3.4, -20, 0.8),

    // Curiosité : la loupe et une étincelle au fond du verre
    gCurious: () =>
        L('M40 40 L56 56', 9, O) +
        L('M40 40 L56 56', 5.4, '#8b5a2b') +
        C(28, 28, 18, '#d9f0fb', 3) +
        C(28, 28, 13, '#eaf8ff', 0) +
        F('M28 18 L30.5 25.5 L38 28 L30.5 30.5 L28 38 L25.5 30.5 L18 28 L25.5 25.5Z', '#ffd23f') +
        HL(20, 20, 5, 2.6, -40, 0.8),

    // Douceur : une plume légère, toute en barbes
    gSoft: () =>
        P('M50 8 Q60 22 50 38 Q40 52 18 54 Q14 44 22 32 Q32 16 50 8Z', '#fbe3ec', 2.4) +
        L('M50 8 Q36 30 12 58', 2.6) +
        L('M44 18 Q40 24 32 26 M40 26 Q34 32 26 33 M35 34 Q30 40 22 42 M47 24 Q46 32 42 38 M42 34 Q40 42 34 46', 1.4, '#d98aa5') +
        HL(42, 16, 4, 2, -50, 0.75),

    // 1.121 : le sachet du catalogue de semences. La fenêtre blanche reçoit, par-dessus, le dessin de la variété.
    seedPack: () =>
        P('M12 10 L52 10 L54 58 L10 58Z', '#d9b27c', 2.6) +
        P('M12 10 L52 10 L52 18 L12 18Z', '#a8743f', 2.2) +
        L('M16 14 L48 14', 1.4, '#7a4f26') +
        P('M17 23 L47 23 Q49 23 49 25 L49 47 Q49 49 47 49 L17 49 Q15 49 15 47 L15 25 Q15 23 17 23Z', '#fffaf0', 2) +
        L('M18 53 L46 53', 1.6, '#a8743f') +
        HL(18, 30, 2, 5, 0, 0.5),
});
