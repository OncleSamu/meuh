// Heum — les dessins des cultures, des produits et de la ferraille (grille 64 × 64).
import { P, C, E, R, L, F, FC, HL, SHADOW, GLOW } from './kit.js';

const leaves = (x, y, col = '#7c9a3c') =>
    P(`M${x} ${y} C${x - 10} ${y - 6} ${x - 12} ${y - 16} ${x - 6} ${y - 20} C${x - 2} ${y - 12} ${x} ${y - 8} ${x} ${y}Z`, col) +
    P(`M${x} ${y} C${x + 10} ${y - 6} ${x + 12} ${y - 16} ${x + 6} ${y - 20} C${x + 2} ${y - 12} ${x} ${y - 8} ${x} ${y}Z`, col) +
    P(`M${x} ${y} C${x - 3} ${y - 10} ${x - 2} ${y - 20} ${x} ${y - 24} C${x + 2} ${y - 20} ${x + 3} ${y - 10} ${x} ${y}Z`, '#94b04a');
const rutabaga = (glow = false) =>
    (glow ? GLOW(32, 40, 28) : '') +
    SHADOW(59, 15) +
    leaves(32, 26, glow ? '#9ccf3a' : '#7c9a3c') +
    P('M32 24 C46 24 52 34 50 44 C48 54 40 58 32 58 C24 58 16 54 14 44 C12 34 18 24 32 24Z', glow ? '#e6f27a' : '#e9d9a8') +
    P('M15 38 C18 28 26 24 32 24 C40 24 47 28 49 38 C42 34 22 34 15 38Z', glow ? '#b56ad8' : '#8e4f8a') +
    (glow ? FC(26, 46, 2.5, '#fff', 0.9) + FC(38, 50, 2, '#fff', 0.9) + FC(40, 42, 1.6, '#fff', 0.9) : L('M26 46 L30 47 M36 50 L40 49', 1.6)) +
    HL(24, 32, 5, 2.5) +
    L('M32 58 L32 62', 2);
const pods = () => {
    let s = SHADOW(58, 18);
    for (const [x, y, r] of [
        [20, 38, -25],
        [34, 30, 10],
        [44, 42, 30],
    ])
        s += E(x, y, 13, 6, '#9fb04c', r) + FC(x - 5, y, 2.4, '#d9c27a') + FC(x, y, 2.4, '#d9c27a') + FC(x + 5, y, 2.4, '#d9c27a');
    for (const [x, y] of [
        [16, 52],
        [24, 54],
        [32, 52],
        [40, 54],
        [48, 51],
        [28, 48],
    ])
        s += C(x, y, 3.2, '#c79a52', 1.6);
    return s;
};
const sorghum = () =>
    SHADOW(59, 10) +
    L('M32 60 L32 24', 3) +
    P('M32 46 C22 44 16 36 14 30 C22 34 28 38 32 44Z', '#8fa34a') +
    P('M32 40 C42 38 48 30 50 24 C42 28 36 32 32 38Z', '#8fa34a') +
    [-6, 0, 6].map((dx, k) => E(32 + dx, 18 - Math.abs(dx) / 2, 4, 9, ['#b24a2a', '#c9572e', '#a3412a'][k], dx * 2)).join('') +
    [...Array(7)].map((_, k) => FC(27 + (k % 3) * 5, 10 + k * 2.4, 1.3, '#f0a050')).join('');
const squash = (shell = false) =>
    (shell ? GLOW(32, 38, 28) : '') +
    SHADOW(58, 22) +
    P('M30 20 C30 14 34 10 38 9', shell ? '#6b6f4a' : '#6f5a2c', 3) +
    E(22, 40, 12, 16, shell ? '#7d8a6a' : '#9aa36a') +
    E(42, 40, 12, 16, shell ? '#7d8a6a' : '#9aa36a') +
    E(32, 40, 12, 18, shell ? '#93a07c' : '#b3ba7a') +
    (shell
        ? P('M22 30 L27 26 L32 30 L37 26 L42 30 L38 36 L32 33 L26 36Z', '#c4cfae', 2) +
          P('M20 44 L26 40 L32 44 L38 40 L44 44 L40 50 L32 47 L24 50Z', '#c4cfae', 2) +
          FC(32, 30, 1.6, '#e8ff7a') +
          FC(32, 44, 1.6, '#e8ff7a')
        : L('M32 24 L32 56', 1.5) + L('M22 26 C18 36 18 46 22 55 M42 26 C46 36 46 46 42 55', 1.4)) +
    HL(26, 30, 3, 6);
const parsnip = () =>
    SHADOW(59, 8) +
    leaves(32, 20, '#86a548') +
    P('M24 20 C28 18 36 18 40 20 C40 34 36 48 32 60 C28 48 24 34 24 20Z', '#efe3c0') +
    L('M27 30 L31 31 M33 40 L37 39 M29 48 L32 49', 1.5) +
    HL(28, 26, 2, 5);
const egg = (mut = false) =>
    (mut ? GLOW(32, 36, 26) : '') +
    SHADOW(58, 13) +
    E(32, 36, 15, 20, mut ? '#d8ec8a' : '#eadcbf') +
    (mut ? FC(26, 30, 3, '#9ccf3a') + FC(37, 42, 2.4, '#9ccf3a') + FC(36, 28, 1.6, '#9ccf3a') : FC(37, 44, 1.4, '#b49a72') + FC(27, 40, 1, '#b49a72')) +
    HL(26, 26, 4, 6);
const milk = (mut = false) =>
    (mut ? GLOW(32, 36, 26) : '') +
    SHADOW(59, 15) +
    P('M22 20 L42 20 L44 28 L46 56 L18 56 L20 28Z', '#c9c0ab') +
    R(24, 12, 16, 9, 2, '#8a5a3a') +
    P('M20 32 L44 32 L46 54 L18 54Z', mut ? '#e2f59a' : '#fbf6ea') +
    R(26, 38, 12, 10, 2, mut ? '#9ccf3a' : '#b5562f', 2) +
    HL(24, 40, 2, 7);
const scrapPile = () =>
    SHADOW(58, 22) +
    P('M10 56 L16 40 L28 46 L26 56Z', '#8c7f6a') +
    P('M24 56 L30 34 L44 38 L42 56Z', '#a9774c') +
    P('M38 56 L46 42 L56 50 L54 56Z', '#6d7f86') +
    L('M30 40 L40 42 M32 48 L38 49', 1.5) +
    C(18, 48, 2, '#5b5048', 1.5) +
    P('M44 30 L52 22 L56 26 L48 34Z', '#b5562f', 2);
const metal = () =>
    SHADOW(56, 18) +
    P('M14 44 L30 30 L52 36 L36 52Z', '#9aa3a8') +
    P('M14 44 L36 52 L36 56 L14 48Z', '#6c757a') +
    P('M36 52 L52 36 L52 40 L36 56Z', '#7f888d') +
    C(26, 42, 2, '#5c6468', 1.5) +
    C(40, 40, 2, '#5c6468', 1.5) +
    HL(30, 36, 6, 2);
const plastic = () =>
    SHADOW(58, 12) +
    P('M24 18 L40 18 L40 24 C46 28 46 34 46 40 L46 54 C46 57 18 57 18 54 L18 40 C18 34 18 28 24 24Z', '#5fa6c9') +
    R(26, 10, 12, 8, 2, '#e0b13a') +
    P('M18 38 L46 38 L46 46 L18 46Z', '#e9eef0', 2) +
    HL(24, 30, 2, 6);
const elec = () =>
    SHADOW(58, 20) +
    R(12, 18, 40, 32, 4, '#3f7a52') +
    L('M18 26 L28 26 L28 34 L40 34 M22 42 L34 42 L34 30 M44 24 L44 44', 2, '#d9c27a') +
    R(24, 28, 10, 10, 1.5, '#2e2620', 1.5) +
    [18, 24, 30, 36, 42, 48].map(x => L(`M${x} 50 L${x} 55`, 2)).join('') +
    FC(44, 24, 2, '#e8ff7a') +
    FC(18, 26, 1.6, '#e8ff7a');
const compo = () =>
    SHADOW(56, 18) +
    P('M14 30 L40 22 L52 34 L26 44Z', '#3b3b40') +
    P('M14 30 L26 44 L26 52 L14 38Z', '#26262a') +
    P('M26 44 L52 34 L52 42 L26 52Z', '#303036') +
    L('M20 31 L44 25 M22 35 L47 29 M25 39 L49 33', 1.2, '#7a7a86') +
    HL(32, 28, 7, 1.6);
const waste = () =>
    GLOW(32, 36, 28) +
    SHADOW(59, 15) +
    R(18, 16, 28, 42, 4, '#e0b13a') +
    L('M18 24 L46 24 M18 50 L46 50', 2.5) +
    C(32, 37, 7, '#2e2620', 0) +
    P('M32 37 L28 31 A7 7 0 0 1 36 31Z', '#e0b13a', 0) +
    P('M32 37 L39 37 A7 7 0 0 1 35 43Z', '#e0b13a', 0) +
    P('M32 37 L29 43 A7 7 0 0 1 25 37Z', '#e0b13a', 0) +
    FC(32, 37, 1.8, '#e0b13a') +
    F('M44 52 C46 56 44 60 40 60 C42 58 42 55 44 52Z', '#b8ff3a');
const fertilizer = () =>
    SHADOW(59, 15) +
    P('M18 20 L40 20 L46 26 L46 58 L18 58Z', '#6f8a3a') +
    R(22, 12, 10, 8, 2, '#2e2620') +
    P('M40 20 L46 26 L40 26Z', '#4f6a2a', 2) +
    R(22, 32, 20, 16, 2, '#e9e0c8', 2) +
    P('M32 35 C36 40 36 44 32 45 C28 44 28 40 32 35Z', '#9ccf3a', 1.6) +
    F('M30 12 C30 6 34 4 36 2 C36 6 34 8 34 12Z', '#b8ff3a', 0.9);
const can = (lab, mark) =>
    SHADOW(59, 15) + R(18, 16, 28, 42, 3, '#b8b2a4') + R(18, 26, 28, 22, 0, lab, 2) + E(32, 16, 14, 4, '#d8d2c4', 0, 2) + mark + HL(23, 36, 2, 7);
const canRuta = () => can('#8e4f8a', `<g transform="translate(22 27) scale(.31)">${rutabaga()}</g>`);
const canGlow = () => GLOW(32, 36, 28) + can('#6aa03a', `<g transform="translate(22 27) scale(.31)">${rutabaga(true)}</g>`);
const flour = () =>
    SHADOW(59, 18) +
    P('M18 24 C18 18 24 16 32 16 C40 16 46 18 46 24 L48 52 C48 58 16 58 16 52Z', '#e8dcc0') +
    L('M22 20 C28 24 36 24 42 20', 2) +
    `<g transform="translate(22 30) scale(.3)">${sorghum()}</g>` +
    HL(24, 34, 2, 8);
const soup = () =>
    SHADOW(58, 22) +
    P('M10 32 L54 32 C54 46 46 54 32 54 C18 54 10 46 10 32Z', '#a9774c') +
    E(32, 32, 22, 6, '#c9a052') +
    [22, 30, 38, 42, 26, 34].map((x, k) => FC(x, 31 + (k % 2), 2, '#7a5a2a')).join('') +
    L('M24 22 C22 18 26 16 24 12 M34 22 C32 18 36 16 34 12', 2, '#8c7f6a');
const shellOil = () =>
    GLOW(32, 36, 26) +
    SHADOW(59, 13) +
    P('M27 10 L37 10 L37 20 C44 24 46 30 46 38 L46 52 C46 57 18 57 18 52 L18 38 C18 30 20 24 27 20Z', '#d8c45a') +
    R(26, 6, 12, 6, 2, '#6b6f4a') +
    `<g transform="translate(23 34) scale(.28)">${squash(true)}</g>` +
    HL(24, 32, 2, 8);
const coin = () => SHADOW(56, 14) + C(32, 34, 18, '#d7a640') + C(32, 34, 12, '#e8bd52', 2) + L('M28 30 L32 26 L36 30 L32 42Z', 2) + HL(26, 26, 5, 3);
const xp = () => P('M32 8 L38 26 L56 26 L42 37 L47 56 L32 45 L17 56 L22 37 L8 26 L26 26Z', '#9ccf3a') + HL(28, 22, 4, 2);

export const ITEM_ART = {
    rutabaga: () => rutabaga(),
    rutabagaGlow: () => rutabaga(true),
    lentil: pods,
    sorghum,
    squash: () => squash(),
    squashShell: () => squash(true),
    parsnip,
    egg: () => egg(),
    eggMut: () => egg(true),
    milk: () => milk(),
    milkMut: () => milk(true),
    scrap: scrapPile,
    metal,
    plastic,
    elec,
    compo,
    waste,
    fertilizer,
    canRuta,
    canGlow,
    flour,
    soup,
    shellOil,
    coin,
    xp,
};
