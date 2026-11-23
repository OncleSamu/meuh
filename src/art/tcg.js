// 1.155 : Icônes SVG dédiées au MeuhCG (0 émoji — tout en kit.js).
import { C, F, FC, HL, L, P, R, SHADOW, ui } from './kit.js';

Object.assign(ui, {
    // Éventail de 3 cartes à collectionner avec étoile dorée
    meuhcg: () =>
        SHADOW(32, 58, 22, 3) +
        `<g transform="rotate(-16 32 48)">${R(16, 12, 28, 40, 5, '#5cb85c', 2.2)}${R(20, 16, 20, 16, 2.5, '#eaf8e6', 1.4)}</g>` +
        `<g transform="rotate(16 32 48)">${R(20, 12, 28, 40, 5, '#4da3e8', 2.2)}${R(24, 16, 20, 16, 2.5, '#e6f4ff', 1.4)}</g>` +
        R(18, 9, 28, 42, 5, '#ffd23f', 2.4) +
        R(22, 13, 20, 18, 3, '#fff9e6', 1.6) +
        P('M32 16 L34 20.5 L39 21 L35.2 24 L36.4 28.5 L32 26 L27.6 28.5 L28.8 24 L25 21 L30 20.5Z', '#f59e0b', 1.4) +
        F('M23 36 L41 36 L41 39 L23 39Z', '#c97b18', 0.7) +
        L('M24 43 L38 43 M24 46.5 L34 46.5', 1.8, '#8a5512') +
        C(47, 13, 2.5, '#fff6c8', 1.2) +
        HL(24, 17, 2.2, 5, -18, 0.55),

    // Jeton MeuhCG (ticket doré et cramoisi)
    tcgToken: () =>
        SHADOW(32, 54, 22, 2.8) +
        P('M8 20 L56 20 L56 28 A4 4 0 0 0 56 36 L56 44 L8 44 L8 36 A4 4 0 0 0 8 28Z', '#e05252', 2.4) +
        R(15, 24, 34, 16, 3, '#ffd23f', 1.8) +
        P('M32 26.5 L33.6 30 L37.4 30.4 L34.5 32.8 L35.4 36.5 L32 34.6 L28.6 36.5 L29.5 32.8 L26.6 30.4 L30.4 30Z', '#fff9e0', 1.2) +
        HL(20, 27, 3, 1.5, -18, 0.65),

    // Poussière dorée (étincelles de forge)
    tcgDust: () =>
        P('M32 8 L36.5 23.5 L52 28 L36.5 32.5 L32 48 L27.5 32.5 L12 28 L27.5 23.5Z', '#ffd23f', 2.4) +
        P('M49 38 L51.5 45.5 L59 48 L51.5 50.5 L49 58 L46.5 50.5 L39 48 L46.5 45.5Z', '#ffe88a', 2) +
        P('M15 41 L17 47 L23 49 L17 51 L15 57 L13 51 L7 49 L13 47Z', '#fff3b8', 1.8) +
        FC(32, 28, 3.2, '#fffef2'),

    // Paquet booster scellé
    tcgPack: () =>
        SHADOW(32, 59, 17, 2.6) +
        R(15, 8, 34, 48, 5, '#4da3e8', 2.4) +
        F('M15 8 L49 8 L49 15 L15 15Z', '#2b6cb0', 0.9) +
        F('M15 49 L49 49 L49 56 L15 56Z', '#2b6cb0', 0.9) +
        L('M15 15 L49 15 M15 49 L49 49', 1.8) +
        C(32, 32, 11, '#fff9e6', 2) +
        P('M32 24.5 L34.2 29.5 L39.5 30 L35.5 33.4 L36.8 38.5 L32 35.8 L27.2 38.5 L28.5 33.4 L24.5 30 L29.8 29.5Z', '#ffd23f', 1.5) +
        HL(22, 22, 2.5, 6, -20, 0.55),

    // Duel de cartes (deux cartes croisées + éclair)
    tcgDuel: () =>
        SHADOW(32, 57, 21, 2.8) +
        `<g transform="rotate(-18 26 36)">${R(12, 14, 24, 34, 4, '#e05252', 2.2)}${R(16, 18, 16, 14, 2, '#fff3f0', 1.4)}</g>` +
        `<g transform="rotate(18 38 36)">${R(28, 14, 24, 34, 4, '#3b82f6', 2.2)}${R(32, 18, 16, 14, 2, '#edf5ff', 1.4)}</g>` +
        P('M35 12 L24 33 L32 33 L29 52 L42 29 L34 29Z', '#ffd23f', 2.2),

    // Tente de camping (pour l'onglet Duels Camping)
    tcgTent: () =>
        SHADOW(32, 56, 24, 3) +
        P('M8 52 L32 14 L56 52Z', '#e86f3a', 2.4) +
        P('M22 52 L32 14 L42 52Z', '#fff6dc', 1.8) +
        P('M25 52 L32 32 L39 52Z', '#4a3220', 2) +
        L('M32 14 L32 8 M32 9 L42 12 L32 15', 2, '#ffd23f'),
});
