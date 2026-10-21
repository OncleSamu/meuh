// Les concours du haras (1.24) : rosettes, coupes, badges de division, Jules remplaçant, décors à gagner. Dessins validés le 21 octobre 2026.
import { C, E, HL, L, P, R, SHADOW, ui } from './kit.js';
import { horsePose, OBST } from './v1232mg.js';

const MN = '#3a2618';
const T = (x, y, s, t, o = {}) =>
    `<text x="${x}" y="${y}" font-size="${s}" font-weight="900" text-anchor="middle" fill="${o.c || MN}" font-family="Nunito,system-ui,sans-serif">${t}</text>`;
const at = (inner, x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">${inner}</g>`;
const FC = (x, y, r, f) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}"/>`;
export const DIV = [
    { n: 'I', name: 'Poneys', c: '#9bd36b', d: '#5fa84a' },
    { n: 'II', name: 'Amateurs', c: '#6ba3d6', d: '#3f6fb5' },
    { n: 'III', name: 'Club', c: '#c07ae0', d: '#8e5bc0' },
    { n: 'IV', name: 'Élite', c: '#f59a3f', d: '#c8702a' },
    { n: 'V', name: 'Prestige', c: '#ffd23f', d: '#c8a020' },
];
// ---------- rosette (64 × 64) : frisons, cœur, rubans ----------
export const rosette = (d, big = false) => {
    let o = SHADOW(32, 60, 18, 2.5);
    o += P('M20 40 L12 62 L22 56 L28 62 L32 42Z', d.d, 2.4) + P('M44 40 L52 62 L42 56 L36 62 L32 42Z', d.c, 2.4);
    for (let k = 0; k < 14; k++) {
        const a = (k / 14) * Math.PI * 2;
        o += C(32 + Math.cos(a) * 19, 28 + Math.sin(a) * 19, 6.4, k % 2 ? d.c : d.d, 2);
    }
    o += C(32, 28, 15, d.c, 2.6) + C(32, 28, 11, '#fff7e0', 2) + T(32, 34, big ? 15 : 14, d.n, { c: d.d }) + HL(25, 20, 5, 2.4, -35, 0.6);
    return o;
};
// ---------- coupe (64 × 64) ----------
export const cup = (c, d) =>
    SHADOW(32, 60, 20, 2.5) +
    R(18, 52, 28, 8, 3, d, 2.4) +
    R(26, 44, 12, 9, 2, c, 2.2) +
    L('M18 14 Q4 14 6 28 Q8 38 22 38', 3.4) +
    L('M18 14 Q4 14 6 28 Q8 38 22 38', 1.6, c) +
    L('M46 14 Q60 14 58 28 Q56 38 42 38', 3.4) +
    L('M46 14 Q60 14 58 28 Q56 38 42 38', 1.6, c) +
    P('M16 10 L48 10 Q48 40 32 46 Q16 40 16 10Z', c, 2.6) +
    R(14, 6, 36, 7, 3, d, 2.2) +
    HL(23, 24, 3, 9, 8, 0.55) +
    P('M32 18 L34.4 24 L40 24 L35.6 27.6 L37.4 33.6 L32 30 L26.6 33.6 L28.4 27.6 L24 24 L29.6 24Z', '#fff7e0', 1.6);
export const ribbon = () =>
    SHADOW(32, 60, 18, 2.5) +
    P('M22 34 L12 60 L24 54 L30 62 L34 36Z', '#c8453a', 2.4) +
    P('M42 34 L52 60 L40 54 L34 62 L30 36Z', '#a32e2e', 2.4) +
    C(32, 24, 17, '#e8364b', 2.6) +
    C(32, 24, 12, '#ffd23f', 2.2) +
    P('M32 14 L34.8 21 L42 21.4 L36.4 26 L38.4 33 L32 29 L25.6 33 L27.6 26 L22 21.4 L29.2 21Z', '#e8364b', 1.8) +
    HL(25, 16, 5, 2.4, -35, 0.6);
// badge de division (icône carrée avec le numéro)
export const divBadge = d =>
    SHADOW(32, 60, 20, 2.5) +
    P('M32 4 L56 12 L56 34 Q56 52 32 60 Q8 52 8 34 L8 12Z', d.c, 2.8) +
    P('M32 10 L50 16 L50 34 Q50 47 32 54 Q14 47 14 34 L14 16Z', '#fff7e0', 2) +
    T(32, 42, 26, d.n, { c: d.d }) +
    HL(20, 18, 5, 2.4, -30, 0.5);
// ---------- jockey remplaçant : Jules en buste ----------
export const jules = () =>
    SHADOW(32, 60, 20, 2.5) +
    P('M10 62 Q10 40 32 38 Q54 40 54 62Z', '#2f7a4f', 2.6) +
    P('M24 40 L32 52 L40 40Z', '#fff7e0', 2) +
    L('M32 52 L32 62', 2, MN) +
    R(27, 32, 10, 9, 3, '#e8b88a', 2) +
    E(32, 24, 12, 13, '#f2c9a0', 0, 2.4) +
    P('M18 20 Q20 6 32 6 Q44 6 46 20 Q40 14 32 14 Q24 14 18 20Z', '#8e5b2a', 2.4) +
    P('M16 21 L48 21 Q50 25 46 25 L18 25 Q14 25 16 21Z', '#5a3a1c', 2.2) +
    FC(27, 25, 1.7, MN) +
    FC(37, 25, 1.7, MN) +
    L('M25.5 21.5 L29 21 M35 21 L38.5 21.5', 1.6) +
    L('M26 33 Q32 28 38 33 Q32 31 26 33Z', '#8e5b2a', 1.8) +
    L('M29 34.5 Q32 36.5 35 34.5', 1.6) +
    HL(27, 18, 4, 1.6, -30, 0.5);
// ---------- décors à gagner ----------
const decoObstacle = () => at(OBST.oxer(), 0, -4, 0.64);
const decoBarriere = () =>
    SHADOW(32, 58, 26, 3) +
    [10, 32, 54].map(x => R(x - 3, 20, 6, 38, 2, '#fff', 2.2)).join('') +
    R(6, 28, 52, 6, 2, '#fff', 2.2) +
    R(6, 42, 52, 6, 2, '#fff', 2.2) +
    [10, 32, 54].map(x => P(`M${x - 3} 20 L${x} 14 L${x + 3} 20Z`, '#fff', 2)).join('');
const decoGirouette = () =>
    SHADOW(32, 60, 14, 2.5) +
    L('M32 60 L32 24', 3.6) +
    L('M32 60 L32 24', 1.6, '#c9ced6') +
    L('M18 40 L46 40 M32 40 L32 40', 2.8) +
    C(32, 24, 3, '#ffd23f', 2) +
    at(`<g transform="scale(0.5)">${horsePose('galB')}</g>`, 12, -6, 1.0).replace('scale(1)', 'scale(1)') +
    P('M10 44 L18 40 L18 48Z', '#c8453a', 1.8) +
    P('M54 44 L46 40 L46 48Z', '#3f6fb5', 1.8);
const decoPodium = () =>
    SHADOW(32, 60, 28, 3) +
    R(4, 40, 18, 20, 2, '#c9ced6', 2.4) +
    R(23, 28, 18, 32, 2, '#ffd23f', 2.4) +
    R(42, 46, 18, 14, 2, '#d99a5a', 2.4) +
    T(13, 54, 12, '2') +
    T(32, 48, 14, '1') +
    T(51, 56, 11, '3') +
    P('M32 12 L34.4 18 L40 18 L35.6 21.6 L37.4 27.6 L32 24 L26.6 27.6 L28.4 21.6 L24 18 L29.6 18Z', '#e8364b', 1.8);
// ---------- branchement dans le jeu ----------
DIV.forEach((d, i) => {
    ui['hRos' + (i + 1)] = () => rosette(d);
    ui['hDiv' + (i + 1)] = () => divBadge(d);
});
ui.hCup0 = () => cup('#d99a5a', '#a8693a');
ui.hCup1 = () => cup('#d4dae2', '#8d96a3');
ui.hCup2 = () => cup('#ffd23f', '#c8a020');
ui.hJules = jules;
ui.showjump = decoObstacle;
ui.whitefence = decoBarriere;
ui.horsevane = decoGirouette;
ui.showpodium = decoPodium;
