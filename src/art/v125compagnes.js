// Les cultures compagnes (1.25) : feuilles d'association, effets, trois sœurs, carnet du potager, graines de Mamie.
import { C, E, FC, HL, L, P, R, SHADOW, ui } from './kit.js';
const MN = '#3a2618';
// la feuille d'association : verte (bonne), fanée brun-rouge (mauvaise)
export const leafGood = () =>
    P('M32 54 C14 46 10 26 22 14 C30 8 44 8 52 12 C54 28 48 46 32 54Z', '#6cc04a', 2.8) +
    L('M32 54 Q34 34 50 14', 2.4, '#3f8f2e') +
    L('M34 40 L24 34 M36 30 L28 22 M40 22 L44 30', 1.8, '#3f8f2e') +
    HL(24, 24, 5, 3, -40, 0.5);
export const leafBad = () =>
    P('M32 54 C16 48 14 32 22 22 C24 30 28 30 30 24 C34 16 44 12 50 16 C52 32 46 46 32 54Z', '#c8693a', 2.8) +
    L('M32 54 Q34 36 48 18', 2.4, '#8e3f1c') +
    P('M44 40 L50 44 L46 48Z', '#8e3f1c', 1.4) +
    FC(28, 40, 2.4, '#8e3f1c') +
    FC(38, 30, 1.8, '#8e3f1c');
// les effets
export const fxPousse = () => C(32, 34, 20, '#bfe6f5', 2.8) + L('M32 34 L32 20 M32 34 L42 40', 3.2) + P('M44 10 L56 14 L48 22Z', '#6cc04a', 2);
export const fxQualite = () => P('M32 6 L39 22 L56 24 L43 36 L47 54 L32 45 L17 54 L21 36 L8 24 L25 22Z', '#ffd23f', 2.8) + HL(26, 20, 4, 2.4, -30, 0.6);
export const fxRecolte = () =>
    P('M10 30 L54 30 L48 54 L16 54Z', '#c08b52', 2.8) +
    L('M14 38 L50 38 M18 46 L46 46', 1.8, '#7a4a2a') +
    C(24, 24, 7, '#e8364b', 2.2) +
    C(38, 22, 7, '#ff9f1c', 2.2) +
    R(42, 4, 18, 18, 9, '#6cc04a', 2.4) +
    L('M51 8 L51 18 M46 13 L56 13', 3, '#fff');
export const fxNuisibles = () =>
    P('M32 6 L54 14 L52 34 Q48 50 32 58 Q16 50 12 34 L10 14Z', '#6ba3d6', 2.8) +
    E(32, 34, 9, 11, '#e8364b', 0, 2) +
    L('M32 24 L32 45', 1.6) +
    FC(28, 30, 1.8, MN) +
    FC(36, 36, 1.8, MN) +
    FC(29, 40, 1.6, MN) +
    L('M20 20 L44 48', 3.6, '#fff') +
    L('M20 20 L44 48', 2);
export const fxMalus = () => C(32, 32, 22, '#f5c4b8', 2.8) + L('M32 14 L32 36', 4.4, '#c8453a') + FC(32, 46, 3, '#c8453a');
export const trio = () =>
    [
        [20, 22, '#ffd23f'],
        [44, 22, '#6cc04a'],
        [32, 44, '#e07a3f'],
    ]
        .map(([x, y, c]) => C(x, y, 12, c, 2.6))
        .join('') +
    L('M20 22 L44 22 L32 44Z', 2.2, '#fff') +
    FC(32, 30, 3.4, '#fff');
export const carnet = () =>
    SHADOW(32, 58, 22, 2.5) +
    R(10, 6, 44, 50, 6, '#6cc04a', 2.8) +
    R(14, 10, 36, 42, 3, '#fff7e0', 2) +
    L('M18 18 L46 18 M18 26 L40 26', 1.8, 'rgba(58,38,24,.5)') +
    `<g transform="translate(18 26) scale(.45)">${leafGood()}</g>` +
    R(10, 6, 7, 50, 3, '#3f8f2e', 2.4);
export const mamieSeed = () =>
    SHADOW(32, 58, 18, 2.5) +
    P('M14 22 L50 22 L46 56 L18 56Z', '#f6ecd2', 2.6) +
    R(12, 14, 40, 10, 4, '#c8453a', 2.4) +
    `<g transform="translate(16 26) scale(.5)">${leafGood()}</g>` +
    C(42, 42, 6, '#ffd23f', 1.8);

Object.assign(ui, {
    cpGood: leafGood,
    cpBad: leafBad,
    cpPousse: fxPousse,
    cpQualite: fxQualite,
    cpRecolte: fxRecolte,
    cpNuisibles: fxNuisibles,
    cpMalus: fxMalus,
    cpTrio: trio,
    cpCarnet: carnet,
    cpGraines: mamieSeed,
});
