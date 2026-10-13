// Meuh 1.2 : crayon, nuit (lucioles, chouette, étoile filante, nichoir…).
import { C, E, FC, HL, L, P, R, SHADOW, ui } from './kit.js';

Object.assign(ui, {
    pencil: () =>
        P('M10 54 L13 40 L44 9 L55 20 L24 51Z', '#ffd23f') + L('M38 15 L49 26', 2.4) + P('M10 54 L13 40 L24 51Z', '#f5deb3', 2) + FC(12, 52, 2.4, '#3a2618'),

    // une luciole : un petit corps et une lumière
    firefly: () =>
        FC(32, 38, 20, '#fff6a8', 0.45) +
        FC(32, 38, 12, '#ffe066', 0.7) +
        E(32, 34, 6, 9, '#3a2618', 0, 0) +
        E(24, 28, 7, 4, '#ffffff', -30, 1.6) +
        E(40, 28, 7, 4, '#ffffff', 30, 1.6) +
        C(32, 44, 6, '#fff176', 1.8) +
        HL(30, 42, 2, 1.2, 0, 0.9),

    // l'étoile filante
    wishStar: () =>
        P('M4 54 L30 34', 'none', 0) +
        L('M4 58 L28 36', 5, '#fff6c8') +
        L('M8 50 L28 36', 3, '#ffe9a0') +
        P('M40 12 L44 24 L57 24 L47 32 L51 45 L40 37 L29 45 L33 32 L23 24 L36 24Z', '#ffd23f', 2.2) +
        HL(38, 22, 3, 2, -20, 0.8),

    // le nichoir et sa chouette
    owlBox: () =>
        SHADOW(32, 60, 14, 3) +
        L('M32 40 L32 58', 4, '#8b5a2b') +
        R(16, 18, 32, 26, 3, '#c08b52') +
        P('M12 20 L32 6 L52 20Z', '#8f3a2a') +
        C(32, 32, 8, '#3a2618') +
        E(32, 34, 6, 6, '#a8693a', 0, 1.4) +
        FC(29.5, 32, 2.2, '#fff') +
        FC(34.5, 32, 2.2, '#fff') +
        FC(29.5, 32, 1.1, '#3a2618') +
        FC(34.5, 32, 1.1, '#3a2618') +
        P('M31 35 L33 35 L32 37Z', '#f5a623', 0.8),

    // la lanterne à lucioles (bocal)
    fireflyJar: () =>
        SHADOW(32, 60, 16, 3) +
        FC(32, 38, 22, '#fff6a8', 0.35) +
        R(18, 18, 28, 40, 9, '#e4f5ff') +
        R(16, 12, 32, 8, 3, '#8b5a2b') +
        L('M24 12 Q32 2 40 12', 2.4) +
        [
            [26, 30],
            [36, 26],
            [30, 42],
            [40, 46],
            [24, 50],
        ]
            .map(([x, y]) => FC(x, y, 3.5, '#ffe066', 0.7) + FC(x, y, 1.6, '#fff9c4'))
            .join('') +
        HL(23, 26, 2.5, 8, -5, 0.6),
});
