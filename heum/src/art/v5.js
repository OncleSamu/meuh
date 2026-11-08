// Heum — les dessins de la 0.5 : topinambour, betterave, piment (et leurs mutants), silo.
import { P, C, E, R, L, F, FC, HL, SHADOW, GLOW } from './kit.js';

const tuber = (glass = false) =>
    (glass ? GLOW(32, 38, 28) : '') +
    SHADOW(59, 20) +
    L('M32 30 L32 12', 3, '#4f7a4a') +
    [
        [0, 8],
        [-9, 12],
        [9, 12],
    ]
        .map(([dx, r]) => E(32 + dx, 10, 6, 3.5, '#6f9a4a', dx * 4))
        .join('') +
    FC(32, 8, 4, '#f0c040') +
    E(24, 42, 11, 9, glass ? '#bfe8e0' : '#b88a5a', -20) +
    E(40, 40, 10, 8, glass ? '#a8dcd2' : '#a47a4a', 25) +
    E(32, 50, 12, 7, glass ? '#cdf2ea' : '#c49a68', 0) +
    (glass
        ? L('M20 40 L28 44 M38 36 L44 42 M26 50 L38 50', 1.4, '#5a9a90') + FC(22, 38, 2, '#fff', 0.8)
        : L('M18 42 L24 40 M36 38 L42 40 M26 51 L36 51', 1.4, '#7a5a34')) +
    HL(22, 38, 4, 2);
const beet = (blood = false) =>
    (blood ? GLOW(32, 38, 28) : '') +
    SHADOW(59, 18) +
    [
        [-8, -18],
        [0, 0],
        [8, 18],
    ]
        .map(([dx, r]) => E(32 + dx, 14, 5, 11, '#4f8a4a', r))
        .join('') +
    L('M28 24 L26 16 M36 24 L38 16', 2, '#b0364a') +
    P('M32 54 C16 54 12 40 20 32 C26 26 38 26 44 32 C52 40 48 54 32 54Z', blood ? '#5a1230' : '#a02a54') +
    L('M32 54 L32 60', 2) +
    (blood
        ? L('M22 38 C28 34 34 44 42 36 M24 46 C30 42 36 50 42 44', 1.6, '#ff6a8a') + FC(30, 40, 2.2, '#ffd0d8', 0.9)
        : L('M22 38 C28 34 34 44 42 36', 1.4, '#d070a0')) +
    HL(24, 36, 4, 2);
const chili = (ash = false) =>
    (ash ? GLOW(32, 36, 28) : '') +
    SHADOW(59, 18) +
    P('M26 18 C22 14 28 8 34 12 C32 16 30 18 26 18Z', '#5a8a3a') +
    P('M26 18 C14 22 12 44 22 56 C30 52 36 40 38 24 C36 16 30 14 26 18Z', ash ? '#3a3636' : '#d23a2a') +
    P('M42 22 C34 26 34 44 40 54 C48 48 52 34 48 24 C46 20 44 20 42 22Z', ash ? '#4a4444' : '#e24a30') +
    (ash
        ? FC(20, 40, 2, '#ff9a30') + FC(30, 30, 1.6, '#ffd06a') + FC(42, 44, 2, '#ff9a30') + F('M26 14 C24 8 28 4 30 2 C30 8 32 10 30 14Z', '#ff8a2a', 0.9)
        : FC(18, 30, 2, '#ff9080', 0.6)) +
    HL(20, 32, 3, 2);
const silo = () =>
    SHADOW(60, 20) +
    R(14, 22, 36, 36, 4, '#8a9aa0') +
    P('M12 24 C12 8 52 8 52 24Z', '#a7b4b8') +
    L('M14 34 L50 34 M14 46 L50 46', 2, '#566468') +
    R(26, 46, 12, 12, 2, '#3a4448') +
    C(32, 18, 3, '#d8ff5a', 1.6) +
    L('M24 30 L40 30', 1.6, '#d8ff5a') +
    HL(20, 28, 3, 6);

export const V5_ART = {
    topinambour: () => tuber(),
    tuberGlass: () => tuber(true),
    beet: () => beet(),
    beetBlood: () => beet(true),
    chili: () => chili(),
    chiliAsh: () => chili(true),
    silo,
};
