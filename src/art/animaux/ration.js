// 1.81 : la ration d'engraissement (moulin : maïs et betterave) : un seau de bois plein de grains, un épi de maïs posé dessus.
import { items, P, C, E, R, L, F, HL, SHADOW } from '../kit.js';

items.ration = () =>
    SHADOW(32, 58, 19, 3) +
    // le seau de bois cerclé
    P('M13 28 L51 28 L47 56 Q47 58 45 58 L19 58 Q17 58 17 56Z', '#c98458', 2.4) +
    L('M24 29 L23 57 M32 29 L32 58 M40 29 L41 57', 1.2, '#8a5434') +
    R(14, 36, 36, 4, 1.5, '#7a8a96', 1.8) +
    R(16, 49, 32, 4, 1.5, '#7a8a96', 1.8) +
    HL(19, 44, 1.6, 6, 0, 0.35) +
    // le grain en dôme
    P('M12 29 Q16 17 32 16 Q48 17 52 29Z', '#f2c14e', 2.2) +
    [
        [20, 24],
        [26, 21],
        [33, 20],
        [40, 22],
        [45, 26],
        [28, 26],
        [37, 26],
    ]
        .map(([x, y]) => E(x, y, 2.2, 1.6, '#e0a92a', 0, 0.9))
        .join('') +
    F('M18 22 Q24 18 30 18', '#fff3a0', 0.6) +
    // l'épi de maïs couché
    `<g transform="rotate(-28 40 14)">` +
    E(40, 14, 11, 4.5, '#ffd23f', 0, 2) +
    L('M32 14 L48 14 M34 11.5 L46 11.5 M34 16.5 L46 16.5', 0.9, '#e0a92a') +
    P('M50 14 Q56 9 60 11 Q56 14 50 16Z', '#6cc04a', 1.6) +
    '</g>' +
    // une feuille de betterave
    P('M14 27 Q8 18 12 12 Q18 18 16 27Z', '#5fae3e', 1.6) +
    C(15, 27, 3.2, '#b0304f', 1.6);
