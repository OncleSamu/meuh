// 1.8 : l'avion-cargo.
import { C, E, F, HL, L, P, R, SHADOW, ui } from './kit.js';

// ---------------- 1.8 : l'avion-cargo ----------------
ui.plane = () =>
    SHADOW(32, 58, 22, 2.4) +
    // l'aile du fond
    P('M30 34 L44 22 L49 22 L40 35Z', '#9fb3c6', 2) +
    // la queue
    P('M6 30 L4 14 L11 14 L18 29Z', '#3f6fb5', 2.2) +
    P('M4 31 L16 31 L16 35 L6 35Z', '#c9d5e0', 1.8) +
    // le gros fuselage
    P('M8 30 Q10 26 20 26 L50 26 Q60 27 60 34 Q60 41 50 42 L18 42 Q9 41 8 36Z', '#eef3f8', 2.4) +
    F('M10 37 L58 37 Q57 40 50 41 L18 41 Q11 40 10 37Z', '#c9d5e0') +
    L('M10 34 L57 34', 2.6, '#3f6fb5') +
    // le cockpit et les hublots
    P('M52 29 Q57 29 58 32 L52 32Z', '#7fc4e8', 1.4) +
    [22, 28, 34, 40, 46].map(x => C(x, 30.5, 1.3, '#7fc4e8', 1)).join('') +
    // l'aile de devant et son moteur
    P('M28 37 L42 50 L48 50 L40 37Z', '#b9c9d8', 2.2) +
    R(37, 44, 10, 5, 2.5, '#9fb3c6', 1.8) +
    E(47, 46.5, 1.2, 2.5, '#3a2618') +
    // les roues
    C(20, 44.5, 2.2, '#3a2618') +
    C(46, 44.5, 2.2, '#3a2618') +
    HL(24, 28, 5, 1.4, 0, 0.7);
