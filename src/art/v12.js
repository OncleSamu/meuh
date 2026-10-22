// Meuh 1.2 : crayon, nuit (lucioles, chouette, étoile filante, nichoir…).
import { C, E, F, FC, HL, L, P, R, SHADOW, ui } from './kit.js';

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

    // l'étoile filante : la tête dorée à droite, la traînée derrière elle (elle file vers la droite, un peu vers le bas)
    wishStar: () =>
        F('M2 21 Q18 23 35 24 L34 40 Q16 34 2 21Z', '#ffe27a') +
        F('M10 25 Q22 27 35 28 L34 38 Q20 34 10 25Z', '#fff3b8') +
        F('M20 29 L36 30 L35 36Z', '#ffffff') +
        FC(12, 15, 1.8, '#fff6c8', 0.95) +
        FC(6, 13, 1.2, '#fff6c8', 0.8) +
        F('M20 5 L22 9 L26 11 L22 13 L20 17 L18 13 L14 11 L18 9Z', '#fff6c8') +
        F('M15 43 L16.5 46 L19.5 47.5 L16.5 49 L15 52 L13.5 49 L10.5 47.5 L13.5 46Z', '#fff6c8', 0.9) +
        P('M44 14 L48 26 L61 26 L51 34 L55 47 L44 39 L33 47 L37 34 L27 26 L40 26Z', '#ffd23f', 2.2) +
        HL(42, 25, 3, 2, -20, 0.8),

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
