// Petits signes de l'interface (fermer, menu, retour…), dans le même trait que le reste des dessins.
import { ui, P, C, L, R, O } from './kit.js';

const thick = (d, w = 7) => L(d, w + 4) + L(d, w, '#fff8e6');

Object.assign(ui, {
    cross: () => thick('M20 20 L44 44 M44 20 L20 44'),
    menu: () => R(12, 14, 40, 8, 4, '#fff8e6', 2.5) + R(12, 28, 40, 8, 4, '#fff8e6', 2.5) + R(12, 42, 40, 8, 4, '#fff8e6', 2.5),
    back: () => thick('M38 16 L22 32 L38 48'),
    next: () => thick('M26 16 L42 32 L26 48'),
    plus: () => thick('M32 16 V48 M16 32 H48'),
    minus: () => thick('M16 32 H48'),
    info: () => C(32, 32, 22, '#5aa9e6', 3) + C(32, 21, 4, '#fff', 0) + L('M32 30 V45', 7, '#fff'),
    search: () => C(28, 28, 14, '#cdeffd', 4) + L('M38 38 L50 50', 8) + L('M38 38 L50 50', 4, '#a8693a'),
    share: () => P('M18 30 H14 V52 H50 V30 H46', '#fff8e6', 3) + L('M32 38 V12', 7) + L('M32 38 V12', 3.5, '#fff8e6') + P('M22 20 L32 9 L42 20Z', '#fff8e6', 3),
    download: () => P('M14 42 V52 H50 V42', 'none', 4) + L('M32 10 V40', 7) + L('M32 10 V40', 3.5, '#fff8e6') + P('M21 31 L32 43 L43 31Z', '#fff8e6', 3),
    bookOpen: () => P('M8 18 Q20 12 32 18 V52 Q20 46 8 52Z', '#fff8e6', 3) + P('M56 18 Q44 12 32 18 V52 Q44 46 56 52Z', '#f5deb3', 3),
    bolt: () => P('M36 6 L16 36 H30 L26 58 L48 26 H34Z', '#ffd23f', 3),
    todo: () =>
        R(14, 10, 36, 46, 6, '#fff8e6', 3) + L('M22 24 H42 M22 34 H42 M22 44 H34', 3.5) + C(46, 46, 9, '#6cc04a', 3) + L('M42 46 L45 49 L50 43', 3, '#fff'),
    dots: () => C(16, 32, 5, O, 0) + C(32, 32, 5, O, 0) + C(48, 32, 5, O, 0),
});
