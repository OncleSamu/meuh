// 1.58 : le sorgho, la haute culture de l'oasis. Debout, il fait de l'ombre aux cases voisines et abrite des bêtes du soleil de midi.
import { C, FC, FE, GD, HL, L, P, SHADOW, items, youngExtra, readyExtra, mound } from './kit.js';

const RUST = '#b5532a',
    RUST_D = '#8a3a1a',
    STRAW = '#d9b45a';
// une panicule : un épi serré de petits grains ronds
const head = (x, y, s = 1, rot = 0) => {
    let g = '';
    const rows = [
        [-4.5, 0, -8],
        [4.5, 0, -8],
        [-6.5, 0, -3],
        [0, 0, -3],
        [6.5, 0, -3],
        [-5.5, 0, 3],
        [1.5, 0, 3],
        [6.5, 0, 3],
        [-3, 0, 8],
        [3.5, 0, 8],
        [0.5, 0, 12],
    ];
    rows.forEach(([i, , j], k) => (g += C(i, j, 3.3, k % 3 ? RUST : '#c8683a', 1.3)));
    return (
        `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
        P('M-9 0 Q-9 -12 0 -13 Q9 -12 9 0 Q9 10 0 15 Q-9 10 -9 0Z', RUST_D, 2) +
        g +
        FE(-3, -6, 1.6, 2.4, '#fff', 0.5, -15) +
        `</g>`
    );
};
const blade = (x, y, len, ang, c = '#6cc04a') =>
    `<g transform="translate(${x} ${y}) rotate(${ang})">` +
    P(`M0 0 Q${len * 0.35} ${-len * 0.2} ${len} ${-len * 0.02} Q${len * 0.4} ${len * 0.18} 0 0Z`, c, 1.2) +
    L(`M2 0 Q${len * 0.4} ${-len * 0.04} ${len * 0.9} -${len * 0.01}`, 0.8, 'rgba(40,70,30,.5)') +
    `</g>`;

items.sorghum = () =>
    SHADOW(32, 58, 22, 3) +
    P('M26 56 Q27 44 29 38', 'none', 0) +
    L('M20 56 Q24 40 26 24', 4.6, '#3a2618') +
    L('M20 56 Q24 40 26 24', 2.6, STRAW) +
    head(27, 22, 1.25, 8) +
    C(44, 46, 4, RUST, 1.6) +
    FC(43, 45, 1.2, '#fff', 0.6) +
    C(51, 51, 3.4, '#c8683a', 1.6) +
    C(40, 53, 3.4, RUST, 1.6);

youngExtra.sorghum = () =>
    mound() +
    blade(32, 56, 30, -100) +
    blade(32, 56, 28, -70) +
    blade(32, 56, 26, -125) +
    blade(32, 56, 24, -50, GD) +
    blade(32, 56, 22, -145, GD) +
    L('M32 56 L32 50', 1.4, GD);

readyExtra.sorghum = () =>
    SHADOW(32, 59, 22, 3) +
    mound() +
    // trois hautes tiges
    L('M18 57 Q18 40 20 22', 3.6, '#3a2618') +
    L('M18 57 Q18 40 20 22', 2, STRAW) +
    L('M32 57 Q32 34 32 17', 3.6, '#3a2618') +
    L('M32 57 Q32 34 32 17', 2, STRAW) +
    L('M46 57 Q46 42 44 24', 3.6, '#3a2618') +
    L('M46 57 Q46 42 44 24', 2, STRAW) +
    blade(18, 48, 16, -150) +
    blade(32, 42, 18, -30) +
    blade(46, 50, 16, -30, GD) +
    blade(32, 52, 17, -150, GD) +
    blade(20, 38, 12, -30) +
    blade(44, 40, 12, -150) +
    head(20, 20, 0.7, 6) +
    head(32, 15, 0.85, 0) +
    head(44, 22, 0.7, -6) +
    HL(30, 14, 1.4, 3, -15, 0.3);
