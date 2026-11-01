// 1.69 : les miels des contrées. Trois miels de culture (tiaré de l'île, coriandre de l'oasis, airelle du Nord)
// et le rucher de chaque contrée : ruches de palme sur pilotis (île), ruches-jarres de terre (oasis),
// ruche-tronc sous son toit de neige (Nord).
import { items, ui, P, C, E, R, L, F, FC, FE, SHADOW, HL } from './kit.js';

// le même pot que les miels de la ferme (1.67) : verre, tissu noué, étiquette et sa fleur
function pot(honey, light, cloth, check, flower) {
    return (
        SHADOW(32, 59, 16, 3) +
        P('M17 24 Q16 21 19 21 L45 21 Q48 21 47 24 L48 52 Q48 58 42 58 L22 58 Q16 58 16 52Z', honey) +
        F('M19 27 L45 27 L45 31 L19 31Z', light, 0.55) +
        HL(21, 34, 1.8, 9, 0, 0.55) +
        P('M13 18 Q14 10 32 10 Q50 10 51 18 Q52 23 46 22 L18 22 Q12 23 13 18Z', cloth) +
        L('M20 12 L20 21 M28 11 L28 21 M36 11 L36 21 M44 12 L44 21', 1.2, check) +
        L('M15 16 Q32 12 49 16', 1.2, check) +
        L('M15 22 Q32 25 49 22', 1.8, '#8b5a2b') +
        P('M44 22 Q47 26 45 28 Q43 26 44 22Z', '#c08b52', 1.2) +
        R(21, 35, 22, 17, 4, '#fbecc9', 2) +
        flower
    );
}
const rad = a => (a * Math.PI) / 180;
// le tiaré : six pétales blancs en hélice, un cœur jaune
const tiare = () =>
    [0, 60, 120, 180, 240, 300].map(a => E(32 + 3.4 * Math.cos(rad(a)), 43 + 3.4 * Math.sin(rad(a)), 3, 1.5, '#fffdf6', a + 25, 0.9)).join('') +
    C(32, 43, 1.5, '#ffd23f', 0.9);
// la coriandre : une ombelle de petites fleurs blanches et rosées
const coriander = () =>
    L('M32 51 L32 45 M32 45 L27 40 M32 45 L30 38.5 M32 45 L34 38.5 M32 45 L37 40', 1, '#4f8f2e') +
    [
        [27, 40],
        [30, 38.5],
        [34, 38.5],
        [37, 40],
    ]
        .map(([x, y]) => [-1.2, 0, 1.2].map(d => FC(x + d, y - Math.abs(d) * 0.4, 1.1, d ? '#f6dbe6' : '#fff')).join(''))
        .join('') +
    E(28.5, 48.5, 2.4, 1.2, '#6cc04a', -30, 0.8);
// l'airelle : des baies rouges, deux feuilles, une clochette rose
const lingonberry = () =>
    L('M28 39 Q32 41 36 45', 1, '#3f6a2a') +
    E(29, 41.5, 2.4, 1.3, '#3f8f2e', 20, 0.8) +
    E(35, 40, 2.4, 1.3, '#3f8f2e', -20, 0.8) +
    P('M38 38 Q37 42 39.5 42 Q42 42 41 38Z', '#f6b0c8', 0.8) +
    C(29, 46, 2.4, '#d02a3a', 1) +
    C(33.5, 47.5, 2.4, '#e0384a', 1) +
    C(31.5, 43.8, 2.2, '#c02030', 1) +
    FC(28.4, 45.3, 0.6, '#fff', 0.7) +
    FC(33, 46.8, 0.6, '#fff', 0.7);

items.honey_tiare = () => pot('#f6d878', '#fff3c0', '#3ab8b0', '#fff', tiare());
items.honey_coriander = () => pot('#d08a2a', '#f0b860', '#e8d0a0', '#9a6a3a', coriander());
items.honey_lingonberry = () => pot('#b8582a', '#e08a50', '#e8505a', '#fff', lingonberry());

// ---------------- les ruchers ----------------
const bees = pts => pts.map(([x, y]) => E(x, y, 2.2, 1.6, '#ffd23f', 0, 1) + L(`M${x} ${y - 1.4} L${x} ${y + 1.4}`, 1) + FE(x - 1, y - 2.2, 1.6, 1, '#fff', 0.85)).join('');
// île : deux ruches tressées en palme sur un petit pilotis de bambou, un toit de palmes
ui.apiaryIsland = () =>
    SHADOW(32, 60, 24, 3) +
    L('M14 58 L14 44 M30 58 L30 44 M34 58 L34 44 M50 58 L50 44', 2.6, '#8a6a2a') +
    R(10, 42, 44, 5, 2, '#c8a050') +
    L('M10 44.5 L54 44.5', 1, '#8a6a2a') +
    // les ruches tressées
    P('M12 42 Q11 28 21 26 Q31 28 30 42Z', '#e8c070') +
    L('M12.5 37 Q21 39 29.5 37 M13 32 Q21 34 29 32', 1.4, '#b8903a') +
    E(21, 38.5, 2.6, 2.2, '#3a2618', 0, 1.5) +
    P('M34 42 Q33 28 43 26 Q53 28 52 42Z', '#e8c070') +
    L('M34.5 37 Q43 39 51.5 37 M35 32 Q43 34 51 32', 1.4, '#b8903a') +
    E(43, 38.5, 2.6, 2.2, '#3a2618', 0, 1.5) +
    // le toit de palmes
    P('M6 26 Q20 12 32 10 Q44 12 58 26 Q50 24 44 26 Q38 22 32 25 Q26 22 20 26 Q14 24 6 26Z', '#6cc04a') +
    L('M32 10 L20 25 M32 10 L32 24 M32 10 L44 25', 1.3, '#3f8f2e') +
    HL(24, 17, 3, 1.4, -25, 0.4) +
    bees([
        [56, 34],
        [8, 36],
    ]);
// oasis : trois ruches-jarres de terre couchées, empilées, à l'ombre d'une natte
ui.apiaryOasis = () =>
    SHADOW(32, 60, 25, 3) +
    [
        [17, 50],
        [37, 50],
        [27, 37],
    ]
        .map(
            ([x, y]) =>
                P(`M${x - 8} ${y - 7} L${x + 8} ${y - 7} Q${x + 12} ${y} ${x + 8} ${y + 7} L${x - 8} ${y + 7} Q${x - 10} ${y} ${x - 8} ${y - 7}Z`, '#d89a5a') +
                L(`M${x - 3} ${y - 7} Q${x - 1} ${y} ${x - 3} ${y + 7} M${x + 3} ${y - 7} Q${x + 5} ${y} ${x + 3} ${y + 7}`, 1.2, '#a8683a') +
                E(x - 8.5, y, 2.6, 6.4, '#c07a40', 0, 1.6) +
                C(x - 8.5, y, 1.5, '#3a2618', 1),
        )
        .join('') +
    // la natte d'ombre sur deux perches
    L('M8 58 L8 22 M56 58 L56 22', 2.4, '#8a6a2a') +
    P('M4 22 L60 22 L58 27 L6 27Z', '#e8c890') +
    L('M10 22 L9 27 M18 22 L17.5 27 M26 22 L26 27 M34 22 L34 27 M42 22 L42.5 27 M50 22 L51 27', 1, '#b8903a') +
    bees([
        [48, 34],
        [14, 31],
    ]);
// Nord : une ruche-tronc creusée, debout, son toit de bardeaux sous la neige, un épicéa derrière
ui.apiaryNord = () =>
    SHADOW(32, 60, 22, 3) +
    P('M48 52 L48 30 M40 36 L48 22 L56 36Z', '#3f7a4a', 1.8) +
    P('M41 44 L48 30 L55 44Z', '#3f7a4a', 1.8) +
    R(46.5, 50, 3, 8, 1, '#7a4a2a', 1.4) +
    // le tronc
    R(16, 26, 24, 32, 6, '#a8693a') +
    L('M20 30 L20 54 M27 28 L27 56 M34 30 L34 54', 1.2, '#7a4a2a') +
    E(28, 44, 3, 2.4, '#3a2618', 0, 1.5) +
    R(23, 47, 10, 2.4, 1.2, '#c8945a', 1.2) +
    // le toit et la neige
    P('M10 28 L28 16 L46 28Z', '#6a4a3a') +
    P('M10 28 Q12 24 18 23 L28 16 L38 23 Q44 24 46 28 Q40 25.5 34 27 Q28 24 22 27 Q16 25.5 10 28Z', '#fff', 1.6) +
    FC(20, 22, 0.9, '#d8ecf8') +
    // la neige au pied
    P('M6 58 Q14 53 24 56 Q34 52 44 56 Q52 53 58 58Z', '#fff', 1.6) +
    bees([[12, 38]]);
