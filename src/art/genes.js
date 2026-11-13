// 1.121 : les icônes propres aux caractères génétiques (elles remplacent des icônes empruntées ailleurs).
// Cadre 64 × 64, lisibles dès 14 px : une forme simple, un contour franc, une couleur dominante.
import { C, E, F, FC, FE, HL, L, P, ui } from './kit.js';

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
        return (
            L('M32 32 Q34 46 26 58', 4, O) +
            L('M32 32 Q34 46 26 58', 2, '#3f8f2e') +
            lf(0, 0, 0) +
            lf(0, 0, 90) +
            lf(0, 0, 180) +
            lf(0, 0, 270) +
            FC(32, 30, 3, '#8bd88b') +
            HL(28, 16, 3, 1.8, -30, 0.7)
        );
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

// ---------------- 1.122 : le plumage des oiseaux et l'essaim des abeilles ----------------
// huppe : où pousse la touffe (sommet de la tête), son inclinaison, sa couleur ;
// frisé : des plumes retroussées posées sur le contour du corps [x, y, direction en degrés] (relevé par rayons depuis le centre du corps)
const PLUME = {
    chicken: {
        c: '#fffaf0',
        d: '#e8dcc6',
        head: [47, 15, -10],
        ruff: [
            [23.1, 58, 125],
            [18.8, 51, 150],
            [14, 44.1, 175],
            [9.7, 33.5, 200],
            [21.6, 30.1, 225],
            [28.5, 27.2, 250],
            [49.8, 53.4, 35],
        ],
    },
    duck: {
        c: '#c9d0da',
        d: '#9aa4b2',
        crest: '#2f7d3a',
        head: [56, 17, -15],
        ruff: [
            [24.9, 58.8, 125],
            [18.8, 53.3, 150],
            [16.2, 45.1, 175],
            [9.7, 34, 200],
            [24.8, 32.6, 225],
            [31.8, 33.2, 250],
            [52, 54.9, 35],
        ],
    },
    goose: {
        c: '#b9bec7',
        d: '#8d939d',
        head: [53, 8, -65],
        ruff: [
            [23.4, 59.3, 125],
            [17, 54, 150],
            [12, 45.9, 175],
            [9.2, 35, 200],
            [23.3, 33.3, 225],
            [30.5, 34.2, 250],
            [50.5, 55.4, 35],
        ],
    },
    peacock: {
        c: '#3f6fb8',
        d: '#2b4f8a',
        crest: '#2a9d8f',
        head: [60, 13, 0],
        ruff: [
            [31.4, 43.3, 125],
            [20.5, 48.3, 150],
            [5.5, 43.6, 175],
            [1.4, 29.8, 200],
            [1.3, 9.8, 225],
            [19, 3.2, 250],
            [53.3, 55.6, 35],
        ],
    },
    turkey: {
        c: '#6b4a33',
        d: '#4e3424',
        head: [55, 22, -10],
        ruff: [
            [26.4, 53.3, 125],
            [25, 47, 150],
            [26.2, 42.4, 175],
            [1.4, 29.5, 200],
            [5.6, 12.8, 225],
            [22, 7.4, 250],
            [52.8, 54.4, 35],
        ],
    },
    quail: {
        c: '#b07a3e',
        d: '#7d5428',
        head: [46, 25, -25],
        ruff: [
            [25.1, 60.8, 125],
            [18.3, 54.8, 150],
            [16, 45.9, 175],
            [19.9, 38, 200],
            [26.8, 34.3, 225],
            [31, 28.4, 250],
            [51, 54.1, 35],
        ],
    },
    pigeon: {
        c: '#a7b1c2',
        d: '#7d8799',
        head: [54, 28, -10],
        ruff: [
            [27.1, 61, 125],
            [18.3, 56.8, 150],
            [14.5, 47.4, 175],
            [19.9, 38.8, 200],
            [28.6, 35.8, 225],
            [35, 36.7, 250],
            [53.8, 56.1, 35],
        ],
    },
    guinea: {
        c: '#5d6470',
        d: '#3e444e',
        head: [56, 25, -5],
        ruff: [
            [24.4, 63, 125],
            [12.8, 59.3, 150],
            [12.5, 47.6, 175],
            [18.9, 39.3, 200],
            [26.8, 35.8, 225],
            [32.8, 35.2, 250],
            [52.8, 56.9, 35],
        ],
    },
    pheasant: {
        c: '#c8732e',
        d: '#8e4f1c',
        crest: '#2f7d5a',
        head: [56, 26, -15],
        ruff: [
            [26.6, 62.5, 125],
            [6.5, 64.3, 150],
            [14.2, 48.1, 175],
            [20.7, 39.5, 200],
            [30.1, 37.6, 225],
            [35.3, 37.7, 250],
            [55, 57.6, 35],
        ],
    },
    ostrich: {
        c: '#2b2a30',
        d: '#151418',
        head: [56, 6, -70],
        ruff: [
            [22.6, 58, 125],
            [17.3, 52.5, 150],
            [7.5, 45.9, 175],
            [10.4, 35.3, 200],
            [19.8, 30.6, 225],
            [27.8, 29.4, 250],
            [50.8, 56.1, 35],
        ],
    },
    ptarmigan: {
        c: '#fbfdff',
        d: '#cfd8e2',
        head: [53, 23, -15],
        ruff: [
            [24.4, 61.8, 125],
            [16.5, 55.5, 150],
            [7.7, 46.1, 175],
            [16.9, 36, 200],
            [24.1, 30.1, 225],
            [31.8, 28.4, 250],
            [55, 55.9, 35],
        ],
    },
};
export const PLUME_SPECIES = Object.keys(PLUME);
// une touffe de trois plumes, pointe vers l'extérieur
const tuft = (x, y, a, c, d) =>
    `<g transform="translate(${x} ${y}) rotate(${a}) scale(.62)">${P('M-3 -4 Q5 -7 10 -3 Q6 -1 4 -0.5 Q9 1 11 4 Q5 4 2 2 Q4 6 6 8 Q0 6 -3 3Z', c, 1.6)}${L('M0 -1 L7 -2 M0 2 L7 3', 0.9, d)}</g>`;
// la huppe : un éventail de plumes qui se dresse sur la tête
const crest = (x, y, a, c, d) =>
    `<g transform="translate(${x} ${y}) rotate(${a}) scale(.85)">${[-38, -14, 10, 34]
        .map(r => `<g transform="rotate(${r})">${P('M-2 1 Q-4 -8 0 -14 Q4 -8 2 1Z', c, 1.6)}${L('M0 -1 L0 -10', 0.9, d)}</g>`)
        .join('')}</g>`;
export function plumeArt(id, v) {
    const p = PLUME[id];
    if (!p || !v) return '';
    if (v === 1) return crest(...p.head, p.crest || p.c, p.d);
    return p.ruff.map(([x, y, a]) => tuft(x, y, a, p.c, p.d)).join('');
}
// l'essaim nombreux : trois abeilles de plus autour de la ruche
const bee = (x, y) =>
    `${FE(x - 1, y - 3.6, 3, 2, '#ffffff', 0.85)}${E(x, y, 4.5, 3.2, '#ffd23f', 0, 1.6)}${L(`M${x - 1} ${y - 3} L${x - 1} ${y + 3} M${x + 1.5} ${y - 3} L${x + 1.5} ${y + 3}`, 1.2)}`;
export const swarmArt = v =>
    v
        ? [
              [30, 12],
              [72, 30],
              [8, 34],
              [40, 6],
          ]
              .map(([x, y]) => bee(x, y))
              .join('')
        : '';
