// 1.33 : les plats de poisson et de fruits de mer (34 dessins).
import { C, E, F, FC, FE, G, GD, L, P, R, SHADOW, items, sub } from './kit.js';
import { bowl, coupe, jar, plate, steamF, woodBoard } from './items2.js';

const O = '#3a2618';
const dots = (list, r = 1.6) => list.map(([x, y, c]) => C(x, y, r, c, 0)).join('');
// ---- petits morceaux ----
const lemon = (x, y, r = 5) =>
    C(x, y, r, '#f2c23a', 1.6) +
    C(x, y, r - 1.8, '#fbe98a', 0) +
    L(`M${x - r + 2} ${y} L${x + r - 2} ${y} M${x} ${y - r + 2} L${x} ${y + r - 2}`, 0.8, '#f2c23a');
const lime = (x, y, r = 5) =>
    C(x, y, r, '#5aa83a', 1.6) +
    C(x, y, r - 1.8, '#c8e88a', 0) +
    L(`M${x - r + 2} ${y} L${x + r - 2} ${y} M${x} ${y - r + 2} L${x} ${y + r - 2}`, 0.8, '#5aa83a');
const herb = (x, y, rot = 0, s = 1) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M0 0 Q-4 -5 0 -9 Q4 -5 0 0Z', G, 1.2) +
    P('M0 0 Q-7 -2 -9 -6 Q-3 -7 0 0Z', GD, 1.2) +
    `</g>`;
const tomato = (x, y, r = 4) => C(x, y, r, '#e8364b', 1.5) + FC(x - r * 0.3, y - r * 0.3, r * 0.25, '#fff', 0.6);
const tomSlice = (x, y, r = 4) =>
    C(x, y, r, '#e8364b', 1.4) +
    C(x, y, r - 1.6, '#f58a8a', 0) +
    dots(
        [
            [x - 1, y],
            [x + 1.2, y + 0.6],
        ],
        0.8,
    );
const butter = (x, y) => R(x - 4, y - 2.5, 8, 5, 1.5, '#ffe27a', 1.4);
const rice = (x, y, rx = 11, ry = 6) =>
    E(x, y, rx, ry, '#fffdf4', 1.6) +
    dots(
        [
            [x - 4, y - 1, '#e8e4d4'],
            [x + 2, y - 2, '#e8e4d4'],
            [x + 5, y + 1, '#e8e4d4'],
            [x - 1, y + 2, '#e8e4d4'],
        ],
        0.9,
    );
const potato = (x, y, s = 1) => E(x, y, 5 * s, 3.4 * s, '#f0d078', 1.6) + FE(x - 1.5, y - 1, 1.6, 0.8, '#fff6c8', 0.7);
const ring = (x, y, r = 4.6) => C(x, y, r, '#e8b04a', 1.6) + C(x, y, r - 2.4, '#fff', 0);
const cube = (x, y, c, s = 3.6) => R(x - s, y - s, s * 2, s * 2, 1, c, 1.3);
// un filet vu en trois-quarts : corps arrondi, stries de cuisson
const fillet = (x, y, s, body, mark, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M-16 1 Q-13 -9 0 -9 Q12 -9 18 -3 Q15 7 1 8 Q-12 8 -16 1Z', body, 2 / s) +
    F('M-12 -1 Q-6 -6 4 -6 Q10 -6 13 -3 Q4 -3 -3 -1Z', '#ffffff', 0.35) +
    L('M-8 -6 L-10 5 M-2 -7 L-4 6 M5 -7 L3 6 M11 -5 L9 4', 1.6, mark) +
    `</g>`;
// un petit poisson entier doré (pour les fritures)
const mini = (x, y, rot = 0, s = 1, body = '#e6b050') =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M-9 0 Q-5 -4 3 -3.4 Q8 -2.6 9 0 L14 -4 L13 0 L14 4 L9 0 Q8 3 3 3.4 Q-5 4 -9 0Z', body, 1.6 / s) +
    FC(-5.4, -0.8, 0.9, O) +
    `</g>`;
const smokeW = (x = 32) =>
    L(`M${x - 8} 22 Q${x - 12} 17 ${x - 8} 12 M${x} 24 Q${x - 4} 18 ${x} 12 M${x + 8} 22 Q${x + 4} 17 ${x + 8} 12`, 1.6, 'rgba(150,150,150,.85)');
// un plat creux de cuisson
const dish = () => SHADOW(32, 58, 28, 3) + E(32, 48, 29, 10, '#d8783a', 2) + E(32, 46, 25, 7.5, '#f6e8d0', 0, 1.6);
// une boîte de conserve
const tin = lab => SHADOW(32, 57, 22, 3) + R(10, 26, 44, 28, 6, '#c9d3dc') + R(14, 22, 36, 8, 4, '#e8e8f0', 2) + R(13, 33, 38, 15, 2, lab, 1.4);

const D = {
    // ================= le goujon =================
    gudgeonFry: () =>
        plate() +
        mini(20, 38, -15, 1.1) +
        mini(34, 34, 10, 1.1) +
        mini(44, 40, -8, 1.1) +
        mini(28, 42, 5, 1) +
        mini(38, 44, 20, 0.9) +
        mini(18, 45, 10, 0.9) +
        lemon(48, 32, 5) +
        herb(14, 32, -30),
    gudgeonLemon: () =>
        plate() +
        mini(22, 36, 20, 1.2, '#c9b878') +
        mini(40, 35, -20, 1.2, '#c9b878') +
        mini(24, 44, -10, 1.2, '#c9b878') +
        mini(41, 44, 12, 1.2, '#c9b878') +
        lemon(32, 40, 6) +
        lemon(50, 40, 4) +
        dots(
            [
                [14, 40, '#f5eed0'],
                [32, 30, '#f5eed0'],
                [32, 50, '#f5eed0'],
            ],
            2,
        ) +
        herb(32, 33, 10),
    smokedGudgeon: () => woodBoard() + mini(14, 40, 0, 1.2, '#b9772c') + mini(30, 40, 0, 1.2, '#b9772c') + mini(46, 40, 0, 1.2, '#b9772c') + smokeW(32),
    // ================= le lavaret =================
    whitefishMeuniere: () =>
        plate() +
        fillet(30, 36, 1.35, '#e8b858', '#a0702a', -5) +
        butter(46, 32) +
        lemon(14, 40, 5) +
        herb(46, 42, 20) +
        herb(18, 30, -50) +
        dots(
            [
                [24, 32, '#2f8f2e'],
                [34, 40, '#2f8f2e'],
            ],
            1.2,
        ),
    smokedWhitefish: () => woodBoard() + fillet(32, 38, 1.7, '#b9772c', '#7a4a1a', 0) + smokeW(32),
    whitefishTartare: () =>
        plate() +
        R(18, 28, 28, 14, 6, '#f0a090', 2) +
        F('M22 31 Q32 28 42 31 Q32 33 22 33Z', '#fff', 0.5) +
        dots(
            [
                [24, 36, '#7a2a6a'],
                [32, 34, '#7a2a6a'],
                [40, 37, '#7a2a6a'],
                [28, 39, '#ffffff'],
            ],
            1.5,
        ) +
        herb(32, 30, 0, 1.2) +
        lemon(52, 42, 4) +
        herb(10, 42, -30),
    whitefishLeek: () =>
        plate() +
        L('M12 40 Q32 34 52 40 M12 44 Q32 38 52 44', 4, '#8cc84a') +
        L('M12 40 Q32 34 52 40 M12 44 Q32 38 52 44', 1.6, '#c8e88a') +
        fillet(32, 33, 1.3, '#f0d890', '#a8884a', 0) +
        E(32, 38, 20, 4, 'rgba(255,255,255,.85)', 0, 0) +
        dots(
            [
                [20, 38, '#fff'],
                [44, 38, '#fff'],
            ],
            2,
        ),
    // ================= le thon =================
    grilledTuna: () =>
        plate() +
        R(14, 28, 36, 14, 6, '#7a4a3a', 2) +
        R(18, 31, 28, 8, 3, '#e8707a', 0) +
        L('M20 28 L22 42 M30 28 L32 42 M40 28 L42 42', 1.6, '#3a2618') +
        lemon(54, 38, 4) +
        herb(10, 36, -30) +
        herb(52, 46, 30),
    cannedTuna: () => tin('#2f6fa8') + sub('tuna', 16, 30, 32) + L('M13 33 L51 33', 1.2, '#e8c428'),
    tunaTartare: () =>
        plate() +
        R(18, 28, 28, 14, 6, '#c8344a', 2) +
        dots(
            [
                [24, 33, '#e8707a'],
                [32, 31, '#e8707a'],
                [40, 34, '#e8707a'],
                [28, 38, '#e8707a'],
                [37, 38, '#e8707a'],
            ],
            2,
        ) +
        P('M20 28 Q32 22 44 28Z', '#8cc84a', 1.6) +
        P('M24 27 Q32 24 40 27Z', '#d8f0a0', 0) +
        lime(52, 42, 4) +
        dots(
            [
                [14, 44, '#fff'],
                [18, 40, '#fff'],
            ],
            1.2,
        ),
    tunaPoke: () =>
        bowl('#fffdf4') +
        rice(22, 30, 10, 4.5) +
        R(32, 26, 16, 8, 3, '#8cc84a', 1.4) +
        cube(30, 29, '#c8344a', 3.2) +
        cube(36, 28, '#c8344a', 3.2) +
        cube(42, 30, '#c8344a', 3.2) +
        P('M14 32 Q20 27 26 33Z', '#f8e070', 1.4) +
        dots(
            [
                [22, 27, '#2a2a2a'],
                [28, 31, '#2a2a2a'],
                [40, 33, '#fff'],
            ],
            1,
        ),
    // ================= le calmar =================
    friedSquid: () =>
        plate() +
        ring(18, 40) +
        ring(28, 36) +
        ring(39, 38) +
        ring(47, 42) +
        ring(32, 44) +
        ring(22, 46, 4) +
        C(54, 34, 5, '#fff3d0', 1.6) +
        lemon(12, 32, 5) +
        herb(46, 31, 10),
    stuffedSquid: () =>
        plate() +
        E(32, 44, 20, 5, '#e8364b', 0, 0) +
        `<g transform="translate(24 36) rotate(-70) scale(.5)">${sub('squid', -32, -32, 64)}</g>` +
        `<g transform="translate(40 36) rotate(70) scale(.5)">${sub('squid', -32, -32, 64)}</g>` +
        dots(
            [
                [14, 40, '#e8364b'],
                [50, 40, '#e8364b'],
            ],
            3,
        ) +
        herb(32, 30, 0, 1.2),
    squidSalad: () =>
        bowl('#8cc84a') +
        herb(14, 24, -40, 1.6) +
        herb(46, 24, 40, 1.6) +
        ring(22, 28, 4) +
        ring(32, 25, 4.4) +
        ring(42, 28, 4) +
        tomato(18, 25, 3.4) +
        tomato(46, 23, 3.4) +
        lemon(32, 31, 4),
    // ================= la raie =================
    skateBlackButter: () =>
        plate() +
        P('M8 42 L32 20 L56 42 Q32 50 8 42Z', '#e0c8a8', 2) +
        L('M32 22 L14 42 M32 22 L22 45 M32 22 L32 46 M32 22 L42 45 M32 22 L50 42', 1.3, '#b0906a') +
        P('M20 36 Q32 30 44 36 Q38 42 32 42 Q26 42 20 36Z', '#3a2a1a', 1.6) +
        dots(
            [
                [26, 37, '#8cc84a'],
                [34, 38, '#8cc84a'],
                [39, 35, '#8cc84a'],
            ],
            1.3,
        ) +
        herb(52, 40, 30),
    skateMustard: () =>
        plate() +
        P('M8 42 L32 20 L56 42 Q32 50 8 42Z', '#e0c8a8', 2) +
        L('M32 22 L14 42 M32 22 L22 45 M32 22 L32 46 M32 22 L42 45 M32 22 L50 42', 1.3, '#b0906a') +
        P('M18 38 Q32 28 46 38 Q40 44 32 44 Q24 44 18 38Z', '#e8c030', 1.6) +
        dots(
            [
                [26, 39, '#a07a10'],
                [34, 40, '#a07a10'],
                [40, 37, '#a07a10'],
            ],
            1.3,
        ) +
        herb(32, 24, 0, 1.2),
    skateSoup: () =>
        bowl('#f0b878') +
        steamF +
        P('M18 28 Q24 24 30 28 Q24 32 18 28Z', '#d8c0a0', 1.4) +
        C(36, 29, 3.4, '#f0d078', 1.4) +
        C(42, 27, 3, '#f09040', 1.4) +
        C(28, 31, 2.8, '#8cc84a', 1.4) +
        herb(46, 31, 10),
    // ================= la dorade =================
    bakedBream: () => dish() + sub('bream', 10, 14, 46) + potato(14, 46) + potato(50, 46) + potato(32, 52) + lemon(50, 36, 5) + herb(14, 36, -40),
    herbBream: () =>
        plate() +
        sub('bream', 8, 12, 48) +
        herb(14, 44, -30, 1.3) +
        herb(22, 48, 20, 1.3) +
        herb(48, 46, 30, 1.3) +
        herb(42, 50, -20, 1.3) +
        tomSlice(54, 52, 3.4) +
        tomSlice(10, 52, 3.4),
    breamCeviche: () =>
        coupe(
            cube(20, 25, '#fbf4e6', 3.6) +
                cube(30, 23, '#fbf4e6', 3.6) +
                cube(40, 25, '#fbf4e6', 3.6) +
                cube(25, 29, '#f6e8d0', 3.2) +
                cube(35, 29, '#f6e8d0', 3.2) +
                cube(45, 29, '#f6e8d0', 3.2) +
                dots(
                    [
                        [22, 20, '#9a3a8a'],
                        [32, 18, '#9a3a8a'],
                        [42, 20, '#9a3a8a'],
                    ],
                    2,
                ) +
                lime(50, 22, 5),
        ),
    // ================= le poulpe =================
    grilledOctopus: () =>
        plate() +
        L('M12 44 Q18 28 28 34 Q36 40 42 30 Q46 24 52 28', 7, '#8a4a7e') +
        L('M12 44 Q18 28 28 34 Q36 40 42 30 Q46 24 52 28', 4.4, '#b66aa4') +
        dots(
            [
                [16, 36, '#f4d8ee'],
                [24, 32, '#f4d8ee'],
                [32, 38, '#f4d8ee'],
                [42, 29, '#f4d8ee'],
                [48, 26, '#f4d8ee'],
            ],
            1.2,
        ) +
        potato(16, 48) +
        potato(48, 46) +
        lemon(52, 36, 4) +
        herb(30, 28, -20),
    octopusProvencale: () =>
        bowl('#d8402a') +
        steamF +
        L('M14 29 Q22 22 30 28 Q36 32 44 24', 5, '#8a4a7e') +
        L('M14 29 Q22 22 30 28 Q36 32 44 24', 3, '#b66aa4') +
        C(20, 32, 2.4, '#2a2a2a', 1.2) +
        C(40, 31, 2.4, '#2a2a2a', 1.2) +
        herb(48, 29, 20),
    octopusSalad: () =>
        plate() +
        potato(18, 38) +
        potato(26, 34) +
        potato(34, 38) +
        potato(42, 34) +
        L('M16 44 Q22 36 28 42 Q34 46 40 40 Q46 36 50 42', 5, '#8a4a7e') +
        L('M16 44 Q22 36 28 42 Q34 46 40 40 Q46 36 50 42', 3, '#b66aa4') +
        R(44, 30, 8, 5, 2, '#e8364b', 1.4) +
        dots(
            [
                [20, 30, '#9a3a8a'],
                [32, 30, '#9a3a8a'],
            ],
            2,
        ) +
        herb(14, 30, -30),
    octopusOil: () => jar('#e8c848', '#8a5a2a', L('M24 40 Q28 34 32 40 Q36 46 40 38', 3, '#8a4a7e') + L('M24 40 Q28 34 32 40 Q36 46 40 38', 1.6, '#b66aa4')),
    // ================= la langouste =================
    grilledSpinyLobster: () =>
        plate() +
        P('M12 38 Q12 26 30 26 Q50 26 54 36 Q46 44 30 44 Q14 44 12 38Z', '#d8603a', 2) +
        E(32, 36, 15, 5, '#fbe8d0', 0, 0) +
        L('M20 28 L20 44 M30 26 L30 44 M40 28 L40 44', 1.4, '#8e3018') +
        butter(32, 36) +
        L('M52 32 Q58 26 62 28', 1.4, '#a84a2a') +
        lemon(14, 32, 5) +
        herb(50, 44, 20),
    vanillaSpinyLobster: () =>
        plate() +
        P('M12 38 Q12 26 30 26 Q50 26 54 36 Q46 44 30 44 Q14 44 12 38Z', '#d8603a', 2) +
        E(32, 36, 15, 5, '#fff3d0', 0, 0) +
        L('M20 28 L20 44 M30 26 L30 44 M40 28 L40 44', 1.4, '#8e3018') +
        L('M10 50 Q20 46 28 48', 2.4, '#3a2a1a') +
        dots(
            [
                [26, 36, '#3a2a1a'],
                [36, 36, '#3a2a1a'],
            ],
            1,
        ) +
        P('M44 24 Q50 20 54 24 Q50 28 44 24Z', '#fff', 1.4),
    spinyBisque: () =>
        bowl('#e87a58') +
        steamF +
        P('M16 31 Q32 22 48 31 Q32 27 16 31Z', '#fff3e0', 1.2) +
        L('M22 30 Q32 25 42 30', 1.6, '#e87a58') +
        P('M40 24 Q46 20 50 24 Q46 28 40 24Z', '#d8603a', 1.6) +
        herb(24, 25, -30),
    // ================= le vivaneau =================
    snapperLime: () => plate() + rice(22, 40, 10, 5) + fillet(40, 36, 1.2, '#f0786a', '#b8362e', 0) + lime(14, 32, 5) + lime(50, 46, 4) + herb(30, 30, -20),
    creoleSnapper: () =>
        plate() +
        rice(16, 40, 9, 4.5) +
        E(38, 40, 17, 6, '#d8402a', 0, 0) +
        fillet(40, 34, 1.15, '#f0786a', '#b8362e', 0) +
        dots(
            [
                [28, 42, '#f5eed0'],
                [36, 45, '#f5eed0'],
                [48, 41, '#8cc84a'],
                [44, 46, '#e8364b'],
            ],
            2.2,
        ) +
        herb(26, 32, -30),
    snapperCeviche: () =>
        coupe(
            cube(20, 25, '#f8b0a0', 3.6) +
                cube(30, 23, '#f8b0a0', 3.6) +
                cube(40, 25, '#f8b0a0', 3.6) +
                cube(25, 29, '#f8c8b8', 3.2) +
                cube(35, 29, '#f8c8b8', 3.2) +
                cube(45, 29, '#f6a21a', 3.2) +
                dots(
                    [
                        [22, 20, '#f6a21a'],
                        [32, 18, '#f6a21a'],
                        [42, 20, '#f6a21a'],
                    ],
                    2,
                ) +
                lime(50, 22, 5),
        ),
    // ================= le mahi-mahi =================
    mahiPineapple: () =>
        plate() +
        fillet(26, 35, 1.2, '#f2d878', '#b89030', -5) +
        C(44, 38, 8, '#f2c23a', 1.8) +
        C(44, 38, 3, '#fff3c0', 1.4) +
        L('M38 34 L50 42 M38 42 L50 34', 1, '#d8a020') +
        rice(30, 46, 10, 3.5) +
        herb(14, 30, -40),
    mahiPoke: () =>
        bowl('#fffdf4') +
        rice(22, 30, 10, 4.5) +
        cube(34, 28, '#f8a040', 3.2) +
        cube(40, 30, '#f8a040', 3.2) +
        cube(46, 28, '#f8a040', 3.2) +
        R(28, 31, 14, 5, 2, '#f6c030', 1.4) +
        P('M14 32 Q20 27 26 33Z', '#8cc84a', 1.4) +
        dots(
            [
                [22, 27, '#2a2a2a'],
                [28, 26, '#2a2a2a'],
                [44, 33, '#fff'],
            ],
            1,
        ),
    smokedMahi: () => woodBoard() + fillet(32, 38, 1.7, '#d8982a', '#8a5a10', 0) + smokeW(32),
    mahiTacos: () =>
        plate() +
        P('M10 44 Q12 28 28 28 Q34 38 28 46Z', '#f2d890', 2) +
        P('M32 46 Q30 30 46 28 Q54 36 50 46Z', '#f2d890', 2) +
        P('M12 36 Q20 32 26 36', '#f8a040', 3) +
        P('M36 36 Q44 32 50 36', '#f8a040', 3) +
        herb(16, 33, -30) +
        herb(40, 33, 30) +
        dots(
            [
                [22, 35, '#8cc84a'],
                [44, 36, '#8cc84a'],
            ],
            2,
        ) +
        lime(54, 46, 4),
};
Object.assign(items, Object.fromEntries(Object.entries(D)));
export const DISHES_133 = Object.keys(D);
