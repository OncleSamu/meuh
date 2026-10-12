// Outils de dessin partagés : formes de base, contours, reflets, ombres, et les registres de dessins.

export const items = {},
    animals = {},
    people = {},
    machines = {},
    ui = {},
    youngExtra = {},
    readyExtra = {},
    BLD = {},
    KINDS = {};

export const O = '#3a2618';

export const G = '#6cc04a';

export const GD = '#3f8f2e';

export const GL = '#9be06b';

export const st = (w = 2.5) => `stroke="${O}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

export const P = (d, f, w) => `<path d="${d}" fill="${f}" ${st(w)}/>`;

export const C = (x, y, r, f, w) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" ${st(w)}/>`;

export const E = (x, y, rx, ry, f, rot = 0, w) =>
    `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}" ${st(w)}${rot ? ` transform="rotate(${rot} ${x} ${y})"` : ''}/>`;

export const R = (x, y, w, h, r, f, sw) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${f}" ${st(sw)}/>`;

export const L = (d, w = 2.5, c = O) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

export const F = (d, f, o = 1) => `<path d="${d}" fill="${f}" opacity="${o}"/>`;

export const FC = (x, y, r, f, o = 1) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" opacity="${o}"/>`;

export const FE = (x, y, rx, ry, f, o = 1, rot = 0) =>
    `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}" opacity="${o}"${rot ? ` transform="rotate(${rot} ${x} ${y})"` : ''}/>`;

export const HL = (x, y, rx, ry, rot = -25, o = 0.55) => FE(x, y, rx, ry, '#fff', o, rot);

export const SHADOW = (x, y, rx, ry) => FE(x, y, rx, ry, '#000', 0.18);

export const svg = (inner, vb = '0 0 64 64', cls = '') =>
    `<svg class="spr ${cls}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;

export const stem = (d, c = G, w = 3) => L(d, w + 3) + L(d, w, c);

export const leaf = (x, y, len, ang, f = G, wr = 0.38) =>
    `<g transform="translate(${x} ${y}) rotate(${ang})"><path d="M0 0 C${len * 0.3} ${-len * wr} ${len * 0.75} ${-len * wr * 0.85} ${len} 0 C${len * 0.75} ${len * wr * 0.85} ${len * 0.3} ${len * wr} 0 0Z" fill="${f}" ${st(2.2)}/>` +
    `<path d="M${len * 0.18} 0 L${len * 0.72} 0" stroke="${GD}" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".55"/></g>`;

export const mound = () => P('M14 57 Q32 49 50 57 Q32 61 14 57Z', '#5e3a1e', 2.2);

export const fishBody = (body, belly, fin, extra = '') =>
    SHADOW(32, 56, 22, 2.5) +
    P('M48 32 L60 20 Q62 32 60 44 Z', fin, 2.2) +
    P('M26 18 Q32 10 40 18 Z', fin, 2) +
    P('M28 46 Q32 52 38 46 Z', fin, 2) +
    P('M6 32 C10 18 30 14 46 22 C52 26 52 38 46 42 C30 50 10 46 6 32Z', body) +
    F('M10 36 C20 44 36 44 46 40 C40 46 22 48 12 40Z', belly, 0.9) +
    extra +
    P('M6 32 C10 18 30 14 46 22 C52 26 52 38 46 42 C30 50 10 46 6 32Z', 'none') +
    FC(16, 28, 3, '#fff') +
    FC(16.5, 28, 1.7, O) +
    L('M8 35 Q11 36 13 34', 1.6) +
    L('M24 22 Q22 32 24 42', 1.6, 'rgba(58,38,24,.45)') +
    HL(30, 24, 7, 2, -8, 0.4);

export const cloud = (f, dy = 0) =>
    P(
        `M16 ${46 + dy} C7 ${46 + dy} 6 ${35 + dy} 13 ${32 + dy} C12 ${23 + dy} 23 ${19 + dy} 29 ${25 + dy} C32 ${15 + dy} 48 ${16 + dy} 49 ${27 + dy} C57 ${27 + dy} 59 ${39 + dy} 52 ${43 + dy} C52 ${46 + dy} 49 ${46 + dy} 47 ${46 + dy}Z`,
        f,
    );

export const medal = (c, hl, off) =>
    P('M20 6 L28 6 L36 26 L28 26Z', off ? '#cfc6b6' : '#c8453a', 2) +
    P('M44 6 L36 6 L28 26 L36 26Z', off ? '#e0d8ca' : '#5aa9e6', 2) +
    C(32, 40, 16, c) +
    C(32, 40, 10.5, hl, 2) +
    (off ? '' : F('M32 33 L34 38 L39 38 L35 41 L37 46 L32 43 L27 46 L29 41 L25 38 L30 38Z', c));

export const sub = (id, x, y, s) => `<g transform="translate(${x} ${y}) scale(${s / 64})">${items[id]()}</g>`;

export const badge = id => C(51, 51, 10.5, '#fff', 2) + sub(id, 42, 42, 18);

export const plateB = () => SHADOW(32, 56, 26, 3) + E(32, 46, 27, 11, '#ffffff') + E(32, 45, 19, 7, '#eef3f6', 0, 1.5);

export const bowlB = (soup, top = 30) =>
    SHADOW(32, 58, 22, 3) +
    P(`M8 ${top} L56 ${top} Q56 56 32 57 Q8 56 8 ${top}Z`, '#f7f3ea') +
    E(32, top, 24, 6.5, soup) +
    L(`M13 ${top + 12} Q32 ${top + 18} 51 ${top + 12}`, 1.6, '#c9b99a');

export const board = () => SHADOW(32, 57, 27, 3) + R(5, 40, 54, 14, 5, '#c08b52') + C(52, 47, 2.2, '#8b5a2b', 1.4);

export const dots = (list, r = 2.4) => list.map(([x, y, c]) => C(x, y, r, c, 1.4)).join('');

export const sack = (powder, b) =>
    SHADOW(32, 58, 18, 3) +
    P('M17 58 Q11 42 18 27 L22 19 L42 19 L46 27 Q53 42 47 58Z', '#e8d3a8') +
    L('M20 30 Q32 34 44 30', 1.4, '#c9a96e') +
    E(32, 19, 11, 4.5, powder) +
    P('M22 20 L18 11 L27 15Z', '#e8d3a8', 2) +
    P('M42 20 L46 11 L37 15Z', '#e8d3a8', 2) +
    L('M21 23 Q32 27 43 23', 2.4, '#a8693a') +
    C(32, 43, 10, '#fff', 2) +
    sub(b, 23, 34, 18);

export const tart = (fill, fruit, lattice) =>
    SHADOW(32, 55, 25, 3) +
    P('M6 38 L58 38 L53 50 Q52 53 48 53 L16 53 Q12 53 11 50Z', '#d9913d') +
    E(32, 38, 26, 9, '#e7a948') +
    E(32, 38, 21, 6.5, fill, 0, 1.8) +
    (lattice ? L('M16 36 L30 43 M25 33 L44 42 M36 33 L50 39 M48 35 L34 43 M38 33 L20 42', 2.2, '#f0c06a') : '') +
    dots(fruit, 2.6);

export const bottle = (liquid, b, glass = '#e4f5ff', cap = '#c8453a') =>
    SHADOW(32, 59, 14, 2.5) +
    P('M26 8 L38 8 L38 18 Q47 23 47 33 L47 54 Q47 58 43 58 L21 58 Q17 58 17 54 L17 33 Q17 23 26 18Z', glass) +
    F('M18.6 34 L45.4 34 L45.4 54 Q45.4 56.5 43 56.5 L21 56.5 Q18.6 56.5 18.6 54Z', liquid) +
    F('M21 25 L24 23 L24 52 L21 52Z', '#fff', 0.5) +
    P('M26 8 L38 8 L38 18 Q47 23 47 33 L47 54 Q47 58 43 58 L21 58 Q17 58 17 54 L17 33 Q17 23 26 18Z', 'none') +
    R(24, 3, 16, 7, 2.5, cap) +
    (b ? badge(b) : '');

export const jar = (fill, lid, b) =>
    SHADOW(32, 58, 15, 3) + R(16, 20, 32, 37, 9, fill) + HL(22, 30, 1.6, 6, 0, 0.45) + R(14, 13, 36, 9, 3, lid) + (b ? badge(b) : '');

export const bolt = (c, stripe) =>
    SHADOW(32, 56, 26, 3) +
    R(8, 26, 46, 24, 4, c) +
    L('M14 32 L48 32 M14 44 L48 44', 1.6, stripe) +
    E(54, 38, 6, 12, c) +
    E(54, 38, 2.4, 5, '#e8c38c', 0, 1.8) +
    P('M8 30 L2 50 L18 50 L14 46Z', c, 2);

export const yarn = c =>
    SHADOW(32, 56, 18, 3) +
    C(30, 36, 18, c) +
    L('M14 30 Q28 22 44 26 M13 40 Q30 28 47 34 M16 47 Q32 34 47 42 M22 52 Q34 42 44 48', 1.8, 'rgba(58,38,24,.35)') +
    HL(23, 27, 5, 3, -30, 0.6) +
    L('M44 47 Q52 54 58 49', 2.2, c);

export const shirt = (c, sleeves, deco = '') =>
    SHADOW(32, 59, 22, 3) +
    P(
        sleeves === 'long'
            ? 'M14 18 L24 12 Q32 18 40 12 L50 18 L60 40 L52 43 L48 32 L48 56 L16 56 L16 32 L12 43 L4 40Z'
            : 'M14 16 L24 11 Q32 17 40 11 L50 16 L58 28 L49 33 L47 27 L47 56 L17 56 L17 27 L15 33 L6 28Z',
        c,
    ) +
    L('M24 11 Q32 21 40 11', 2) +
    deco;

export const cone = scoops =>
    SHADOW(32, 59, 10, 2.5) +
    P('M20 30 L44 30 L33 59 Q32 61 31 59Z', '#e0a050') +
    L('M23 34 L38 52 M29 31 L41 43 M41 34 L26 52 M35 31 L23 43', 1.3, '#b8702a') +
    scoops.map(([x, y, r, c]) => C(x, y, r, c, 2.2) + HL(x - r * 0.35, y - r * 0.35, r * 0.25, r * 0.15, -30, 0.6)).join('');

export const cup = (c, b) =>
    SHADOW(32, 58, 16, 3) +
    C(32, 26, 13, c) +
    HL(27, 21, 3.5, 2, -30, 0.6) +
    P('M14 32 L50 32 L44 56 L20 56Z', '#f7f3ea') +
    L('M17 40 L47 40', 2, '#e2412f') +
    (b ? badge(b) : '');

export const wrapped = (x, y, c, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})">` +
    P('M-15 -6 L-7 -2 L-7 2 L-15 6Z', c, 1.8) +
    P('M15 -6 L7 -2 L7 2 L15 6Z', c, 1.8) +
    E(0, 0, 8, 6, c, 0, 2) +
    FE(-2.5, -2, 2.4, 1.2, '#fff', 0.6) +
    `</g>`;

export const soap = (c, b) =>
    SHADOW(32, 56, 22, 3) +
    R(10, 30, 44, 22, 8, c) +
    F('M14 33 L50 33 L50 37 L14 37Z', '#fff', 0.35) +
    C(46, 22, 5, '#e6f6ff', 1.6) +
    C(52, 14, 3, '#e6f6ff', 1.4) +
    C(39, 16, 2.5, '#e6f6ff', 1.2) +
    sub(b, 23, 31, 18);

export const lavSprig = (x, y, h, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})">` +
    L(`M0 0 L0 ${-h}`, 2.4, GD) +
    [0.35, 0.5, 0.65, 0.8, 0.95].map(k => E(0, -h * k, 2.6, 3.4, '#9a6fd0', 0, 1.4)).join('') +
    `</g>`;

export const fishShape = (x, y, body, s = 1, rot = 0) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M14 0 L24 -8 L22 0 L24 8Z', body, 2) +
    P('M-20 0 C-14 -10 6 -10 14 0 C6 10 -14 10 -20 0Z', body, 2.2) +
    FC(-12, -2, 1.8, O) +
    L('M-4 -6 Q-6 0 -4 6', 1.3, 'rgba(58,38,24,.4)') +
    `</g>`;

export const bug = (x, y, s, c = '#4a4a4a') =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    L('M-6 -2 L-10 -6 M-6 2 L-11 3 M-4 5 L-7 9 M6 -2 L10 -6 M6 2 L11 3 M4 5 L7 9', 1.6) +
    E(0, 1, 7, 6, c, 0, 2) +
    C(0, -6, 3.6, '#222', 1.8) +
    FC(-1.2, -6.8, 0.9, '#fff') +
    FC(1.4, -6.8, 0.9, '#fff') +
    HL(-2.5, -0.5, 1.5, 2.4, 20, 0.5) +
    `</g>`;

export const SUN = '#ffd23f';

export const BLUE_B = '#4b5bb8';

export const GRAPE = '#7b3f9e';

export const OLIVE = '#6f7d2e';

export const CLAY = '#c8693a';

export const GOLD = '#f2c14e';

export const teacup = (liquid, extra = '') =>
    SHADOW(32, 57, 20, 3) +
    E(32, 52, 22, 5, '#f7f3ea') +
    P('M14 30 L50 30 Q48 50 32 50 Q16 50 14 30Z', '#ffffff') +
    E(32, 30, 18, 4.5, liquid) +
    P('M49 34 Q58 34 56 42 Q54 47 46 45', 'none', 2.4) +
    L('M26 22 Q23 17 26 12 M34 22 Q31 17 34 12', 1.8, '#c9d3dc') +
    L('M19 40 Q32 44 45 40', 1.2, '#c9b99a') +
    extra;

export const glassCup = (liquid, extra = '') =>
    SHADOW(32, 59, 13, 2.5) +
    P('M18 14 L46 14 L42 58 L22 58Z', '#e4f5ff') +
    F('M20 26 L44 26 L41 56 L23 56Z', liquid, 0.95) +
    R(24, 28, 7, 7, 1.5, '#ffffff', 1.4) +
    R(33, 34, 7, 7, 1.5, '#ffffff', 1.4) +
    P('M18 14 L46 14 L42 58 L22 58Z', 'none') +
    L('M40 14 L48 2', 2.6, '#e2412f') +
    extra;

export const dish = (fill, extra = '') => SHADOW(32, 57, 26, 3) + R(6, 34, 52, 20, 6, '#e8e1d2') + R(10, 32, 44, 16, 4, fill) + extra;

export const pot = (c, extra = '') =>
    SHADOW(32, 59, 16, 3) + P('M16 30 L48 30 L44 58 L20 58Z', c) + R(13, 26, 38, 7, 2, c) + L('M18 38 L46 38', 1.2, 'rgba(0,0,0,.18)') + extra;

export const vaseShape = (c, extra = '') =>
    SHADOW(32, 59, 13, 3) +
    P('M24 8 L40 8 L38 16 Q52 26 48 44 Q46 56 32 58 Q18 56 16 44 Q12 26 26 16Z', c) +
    R(22, 5, 20, 5, 2, c) +
    extra +
    HL(23, 30, 2, 8, 10, 0.4);

export const lockShape = () =>
    L('M20 6 Q32 22 44 6', 1.6, '#c9a14e') +
    P('M32 58 C10 44 12 26 22 24 C28 23 31 27 32 30 C33 27 36 23 42 24 C52 26 54 44 32 58Z', GOLD) +
    C(32, 40, 5, '#e8364b', 1.6) +
    HL(22, 32, 2, 5, 20, 0.5);

export const dyePot = (c, b) =>
    SHADOW(32, 58, 16, 3) +
    P('M14 26 L50 26 L46 56 Q32 60 18 56Z', '#8a8f98') +
    E(32, 26, 18, 5, c) +
    P('M20 27 Q24 36 28 28 Q31 40 36 28 Q40 34 44 27', c, 1.6) +
    (b ? badge(b) : '');

export const candleShape = (c, extra = '') =>
    SHADOW(32, 59, 13, 3) +
    R(20, 26, 24, 32, 3, c) +
    E(32, 26, 12, 3, '#fff8e0', 0, 1.6) +
    L('M32 24 L32 16', 2) +
    E(32, 12, 3.5, 6, '#ffb347', 0, 1.6) +
    FE(32, 13, 1.5, 3, '#fff', 0.9) +
    extra;

export const sushiPiece = (x, y) =>
    R(x - 7, y - 4, 14, 10, 4, '#ffffff', 2) + R(x - 8, y - 8, 16, 6, 3, '#f2936f', 1.8) + R(x - 2, y - 8, 4, 14, 1, '#2f4a2a', 1.2);

export const goldCowArt = () =>
    animals
        .cow()
        .replace(/#ffffff/g, '#f2c14e')
        .replace(/#3a2a26/g, '#c9952a')
        .replace(/#f4a9a0/g, '#ffe48a');

export const RAINBOW = ['#e8364b', '#f5a623', '#ffd23f', '#6cc04a', '#4fb3f6', '#9a6fd0'];

export const fishOf = (body, belly, fin, extra = '') => fishBody(body, belly, fin, extra);

export const wineBottle = (liquid, label, cap, glass = '#2f5e3a') =>
    SHADOW(32, 60, 12, 2.5) +
    P('M27 4 L37 4 L37 20 Q44 24 44 32 L44 56 Q44 60 40 60 L24 60 Q20 60 20 56 L20 32 Q20 24 27 20Z', glass) +
    F('M21.5 34 L42.5 34 L42.5 56 Q42.5 58.5 40 58.5 L24 58.5 Q21.5 58.5 21.5 56Z', liquid, 0.55) +
    R(22, 36, 20, 14, 2, label, 1.6) +
    L('M26 41 L38 41 M27 45 L37 45', 1.2, 'rgba(58,38,24,.55)') +
    F('M23 24 L25.5 22 L25.5 54 L23 54Z', '#fff', 0.35) +
    R(26, 2, 12, 12, 2, cap);

export const champBottle = (label, foil = '#f2c14e') =>
    SHADOW(32, 60, 13, 2.5) +
    P('M28 8 L36 8 L36 20 Q46 26 46 36 L46 56 Q46 60 42 60 L22 60 Q18 60 18 56 L18 36 Q18 26 28 20Z', '#2b4a2e') +
    P('M27 2 L37 2 L37 22 Q34 24 32 24 Q30 24 27 22Z', foil) +
    L('M28 12 L36 12 M28 17 L36 17', 1.2, '#b08a2a') +
    R(21, 38, 22, 13, 2, label, 1.6) +
    C(32, 44.5, 3.6, foil, 1.2) +
    F('M21 30 L24 27 L24 54 L21 54Z', '#fff', 0.3) +
    FC(44, 6, 1.6, '#fff', 0.9) +
    FC(48, 11, 1.2, '#fff', 0.8);

export const grapesArt = () =>
    L('M32 8 L32 16', 2.4, '#7a4a2a') +
    leaf(33, 12, 12, -20, G, 0.5) +
    [
        [24, 22],
        [32, 22],
        [40, 22],
        [28, 30],
        [36, 30],
        [44, 30],
        [24, 38],
        [32, 38],
        [40, 38],
        [28, 46],
        [36, 46],
        [32, 54],
    ]
        .map(([x, y]) => C(x, y, 5, '#7a3f8f', 1.6) + FC(x - 1.6, y - 1.6, 1.3, '#fff', 0.5))
        .join('');

export const perfume = (liquid, cap, b) =>
    SHADOW(32, 59, 14, 2.5) +
    R(16, 26, 32, 32, 9, '#f4fbff') +
    F('M18.5 38 L45.5 38 L45.5 50 Q45.5 55.5 40 55.5 L24 55.5 Q18.5 55.5 18.5 50Z', liquid, 0.8) +
    F('M20 30 L23 29 L23 52 L20 52Z', '#fff', 0.6) +
    R(16, 26, 32, 32, 9, 'none') +
    R(27, 18, 10, 9, 2, '#e9e1d0') +
    C(32, 12, 7, cap) +
    HL(29, 10, 2, 1.4, -30, 0.6) +
    (b ? badge(b) : '');
