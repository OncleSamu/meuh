// 1.13 et 1.14 : le verger vivant — floraison, torche du verger, carnet, arbres remarquables.
import { C, F, FC, HL, L, P, R, SHADOW, ui } from './kit.js';

const flower = (x, y, r = 5, f = '#fff', c = '#f4a6c0') =>
    [0, 72, 144, 216, 288]
        .map(a => C((x + Math.cos((a * Math.PI) / 180) * r * 0.9).toFixed(1), (y + Math.sin((a * Math.PI) / 180) * r * 0.9).toFixed(1), r * 0.62, f, 1.4))
        .join('') + C(x, y, r * 0.5, c, 1.2);
const leaf = (x, y, ang, f = '#6cc04a') => `<g transform="translate(${x} ${y}) rotate(${ang})">` + P('M0 0 C4 -7 11 -7 15 0 C11 7 4 7 0 0Z', f, 1.6) + `</g>`;

const ART = {
    // une branche en fleurs
    blossom:
        SHADOW(32, 60, 24, 3) +
        L('M8 54 Q26 40 56 14', 7.6) +
        L('M8 54 Q26 40 56 14', 4.2, '#8b5a2b') +
        L('M32 34 Q40 40 50 40', 5) +
        L('M32 34 Q40 40 50 40', 2.4, '#a8693a') +
        leaf(14, 46, 200) +
        leaf(36, 22, -70, '#8fd65f') +
        flower(50, 15, 6.4) +
        flower(40, 26, 6) +
        flower(26, 38, 6.4) +
        flower(50, 41, 5.6) +
        flower(18, 50, 5) +
        HL(51, 11, 2.2, 1.2, -30, 0.8),
    // la torche du verger : un pieu de bois, une flamme et un peu de résine
    orchardTorch:
        SHADOW(32, 61, 14, 3) +
        L('M32 58 L32 28', 8) +
        L('M32 58 L32 28', 4.4, '#a8693a') +
        P('M22 26 L42 26 L38 38 L26 38Z', '#8b5a2b', 2.2) +
        L('M26 31 L38 31', 1.6, '#e8a43a') +
        P('M32 4 C42 14 44 22 38 26 C34 28 30 28 26 26 C20 22 22 14 32 4Z', '#ff8a2a', 2.4) +
        P('M32 12 C38 18 38 23 34 25 C30 26 27 24 27 21 C27 17 29 15 32 12Z', '#ffd23f', 1.6) +
        F('M30 16 C32 14 33 14 33 14 C32 17 30 20 29 22Z', '#fff', 0.6) +
        C(20, 18, 2, '#ffd23f', 0.8) +
        C(46, 12, 1.6, '#ffd23f', 0.8),
    // le carnet du verger : couverture verte, une pomme dessus
    orchardBook:
        SHADOW(32, 60, 22, 3) +
        R(12, 8, 40, 50, 5, '#3f8f2e', 2.6) +
        R(12, 8, 8, 50, 3, '#2f6f22', 2) +
        L('M22 14 L22 54', 1.2, '#e8d9a8') +
        C(36, 28, 10, '#e2412f', 2.2) +
        L('M36 18 Q37 13 41 11', 2.4) +
        leaf(37, 16, -20, '#8fd65f') +
        HL(32, 24, 3, 2, -30, 0.8) +
        R(24, 44, 22, 5, 2.5, '#fff7e0', 1.6) +
        L('M28 46.5 L42 46.5', 1.2, '#c9692f'),
    // arbre remarquable : un arbre à fruits dorés
    remGold:
        SHADOW(32, 61, 18, 3) +
        R(28, 38, 8, 20, 3, '#8b5a2b', 2.4) +
        C(32, 26, 18, '#6cc04a', 2.6) +
        C(22, 32, 11, '#5aa83a', 2.2) +
        C(42, 32, 11, '#5aa83a', 2.2) +
        C(26, 24, 5.4, '#ffd23f', 1.8) +
        C(39, 28, 5.4, '#ffd23f', 1.8) +
        C(31, 34, 5.4, '#ffc21f', 1.8) +
        F('M23 21 C25 19 27 19 28 19 C27 22 25 24 24 26Z', '#fff', 0.7) +
        FC(52, 12, 2.4, '#ffd23f', 0.9) +
        FC(10, 20, 2, '#ffd23f', 0.9),
    // arbre remarquable : un arbre jumeau, deux fruits à chaque branche
    remTwin:
        SHADOW(32, 61, 18, 3) +
        R(28, 38, 8, 20, 3, '#8b5a2b', 2.4) +
        C(32, 26, 18, '#6cc04a', 2.6) +
        C(22, 32, 11, '#5aa83a', 2.2) +
        C(42, 32, 11, '#5aa83a', 2.2) +
        C(24, 24, 5, '#e2412f', 1.8) +
        C(33, 22, 5, '#e2412f', 1.8) +
        C(40, 31, 5, '#f5a623', 1.8) +
        C(31, 33, 5, '#f5a623', 1.8) +
        F('M21 21 C23 19 25 19 26 19 C25 22 23 24 22 26Z', '#fff', 0.7),
};
for (const [k, v] of Object.entries(ART)) ui[k] = () => v;
