// 1.8 : la lavande, les salades et les biscuits redessinés (en attente de validation : branchés dans art/index.js une fois validés).
// La lavande redessinée. De vrais épis serrés de petites fleurs violettes, des tiges gris-vert,
// un bouquet noué de raphia ; au champ, une touffe ronde d'où montent les épis.
import { C, E, F, FC, HL, L, P, SHADOW, mound, items, youngExtra, readyExtra } from './kit.js';

const STEM = '#7f9a6a';
const LEAFC = '#93ad8c';
const V1 = '#8a5cc4';
const V2 = '#a982de';
const TIP = '#c4a6ee';

// un épi : une tige, puis des rangs de deux fleurs qui rapetissent vers la pointe
function spike(x, y, h, rot = 0, s = 1) {
    let o = `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">`;
    o += L(`M0 0 L0 ${-h * 0.5}`, 3.6) + L(`M0 0 L0 ${-h * 0.5}`, 1.8, STEM);
    const n = 5;
    for (let k = 0; k < n; k++) {
        const yy = -h * (0.52 + (k / n) * 0.42);
        const r = 2.6 - k * 0.22;
        o += E(-1.7, yy, r, r * 1.3, V1, -12, 1.3) + E(1.7, yy - 0.8, r, r * 1.3, V2, 12, 1.3);
    }
    o += E(0, -h, 1.8, 2.5, TIP, 0, 1.2);
    o += FC(1.5, -h * 0.84, 0.8, '#fff', 0.75) + FC(1.6, -h * 0.66, 0.7, '#fff', 0.55);
    return o + '</g>';
}
// une feuille de lavande : fine, longue, gris-vert
const needle = (x, y, len, ang) => {
    const r = (ang * Math.PI) / 180;
    const x2 = x + Math.cos(r) * len,
        y2 = y + Math.sin(r) * len;
    return L(`M${x} ${y} L${x2.toFixed(1)} ${y2.toFixed(1)}`, 4) + L(`M${x} ${y} L${x2.toFixed(1)} ${y2.toFixed(1)}`, 2, LEAFC);
};

// ---------------- le produit : un bouquet noué ----------------
items.lavender = () =>
    SHADOW(32, 60, 14, 2.4) +
    // les tiges sous le lien
    L('M27 58 L30 44 M32 59 L32 44 M37 58 L34 44', 3.6) +
    L('M27 58 L30 44 M32 59 L32 44 M37 58 L34 44', 1.8, STEM) +
    spike(29, 46, 36, -24) +
    spike(35, 46, 36, 24) +
    spike(31, 45, 40, -8) +
    spike(33, 45, 40, 8) +
    // le raphia et son nœud
    P('M25.5 43 Q32 45.5 38.5 43 L38.5 48 Q32 50.5 25.5 48Z', '#e3c27a', 2) +
    P('M32 46 Q24 41 22 46 Q24 50 32 47Z', '#e3c27a', 1.8) +
    P('M32 46 Q40 41 42 46 Q40 50 32 47Z', '#e3c27a', 1.8) +
    L('M31 47 Q28 52 26 55 M33 47 Q36 52 38 55', 1.8, '#c79c4a') +
    E(32, 46.5, 2.2, 2, '#d4ad5c', 0, 1.6) +
    FC(27, 44.6, 0.9, '#fff', 0.6);

// ---------------- au champ ----------------
Object.assign(youngExtra, {
    lavender: () => mound() + [-150, -128, -108, -90, -72, -52, -30].map((a, k) => needle(32, 56, 9 + (k % 3) * 3, a)).join('') + spike(32, 50, 8, 0, 0.7),
});
Object.assign(readyExtra, {
    lavender: () =>
        mound() +
        // la touffe ronde de feuilles
        P('M16 56 Q14 44 24 42 Q32 38 40 42 Q50 44 48 56Z', LEAFC, 2.2) +
        L('M22 54 L20 46 M28 55 L27 44 M36 55 L37 44 M42 54 L44 46', 1.4, '#6f8a62') +
        [-30, -15, 0, 15, 30].map((a, k) => spike(32 + a * 0.4, 46, 30 + (k % 2 ? 0 : 6), a * 0.75, 0.95)).join('') +
        FC(24, 46, 1.4, '#fff', 0.45),
});

// ---------------- 1.8 : salade, salade du jardin et biscuits redessinés ----------------
// une feuille frisée : un ovale au bord ondulé
function ruffle(cx, cy, rx, ry, rot, fill, w = 2, waves = 9, amp = 0.1) {
    const pts = [];
    const n = waves * 4;
    for (let k = 0; k < n; k++) {
        const a = (k / n) * Math.PI * 2;
        const r = 1 + amp * Math.sin(a * waves);
        pts.push([Math.cos(a) * rx * r, Math.sin(a) * ry * r]);
    }
    const c = Math.cos((rot * Math.PI) / 180),
        s = Math.sin((rot * Math.PI) / 180);
    const p = pts.map(([x, y]) => [(cx + x * c - y * s).toFixed(1), (cy + x * s + y * c).toFixed(1)]);
    let d = `M${p[0][0]} ${p[0][1]}`;
    for (let k = 1; k < p.length; k += 2) {
        const q = p[k],
            e = p[(k + 1) % p.length];
        d += ` Q${q[0]} ${q[1]} ${e[0]} ${e[1]}`;
    }
    return P(d + 'Z', fill, w);
}
const LET1 = '#4fa83a';
const LET2 = '#7fcf55';
const LET3 = '#b6eb85';
const LET4 = '#dcf7b8';
// une laitue vue de trois quarts : des feuilles frisées autour d'un cœur clair
const lettuceHead = (x, y, r) =>
    ruffle(x - r * 0.7, y + r * 0.25, r * 0.62, r * 0.42, -25, LET1) +
    ruffle(x + r * 0.7, y + r * 0.25, r * 0.62, r * 0.42, 25, LET1) +
    ruffle(x - r * 0.45, y - r * 0.05, r * 0.6, r * 0.55, -15, LET2) +
    ruffle(x + r * 0.45, y - r * 0.05, r * 0.6, r * 0.55, 15, LET2) +
    ruffle(x, y + r * 0.1, r * 0.62, r * 0.55, 0, LET3) +
    ruffle(x, y - r * 0.12, r * 0.36, r * 0.32, 0, LET4, 1.6, 7, 0.12) +
    L(
        `M${x} ${y + r * 0.6} L${x} ${y + r * 0.15} M${x - r * 0.62} ${y + r * 0.42} Q${x - r * 0.5} ${y + r * 0.1} ${x - r * 0.3} ${y - r * 0.15} M${x + r * 0.62} ${y + r * 0.42} Q${x + r * 0.5} ${y + r * 0.1} ${x + r * 0.3} ${y - r * 0.15}`,
        1.1,
        '#3f8f2e',
    ) +
    HL(x - r * 0.32, y - r * 0.3, r * 0.12, r * 0.07, -25, 0.7);

items.lettuce = () => SHADOW(32, 57, 22, 3) + lettuceHead(32, 38, 22);
Object.assign(youngExtra, {
    lettuce: () => mound() + ruffle(26, 52, 7, 4.5, -25, LET2, 1.8, 7) + ruffle(38, 52, 7, 4.5, 25, LET2, 1.8, 7) + ruffle(32, 50, 6, 5, 0, LET3, 1.8, 7),
});
Object.assign(readyExtra, {
    lettuce: () => mound() + lettuceHead(32, 45, 15),
});

// la salade du jardin : un saladier, des feuilles qui débordent, tomates, concombre et radis
const tomatoWedge = (x, y, rot) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})">` +
    P('M-6 0 Q0 -8 6 0Z', '#e8432f', 1.6) +
    F('M-3.6 -0.6 Q0 -5 3.6 -0.6Z', '#ff8a6e') +
    FC(-1.5, -2, 0.7, '#ffe08a') +
    FC(1.5, -2, 0.7, '#ffe08a') +
    '</g>';
const cucumber = (x, y) => C(x, y, 4.4, '#5aa844', 1.4) + FC(x, y, 3.2, '#e2f6bb') + FC(x - 1, y - 0.6, 0.5, '#9cc76a') + FC(x + 1, y + 0.6, 0.5, '#9cc76a');
const radish = (x, y) => C(x, y, 3.4, '#e0406a', 1.4) + C(x, y, 2.2, '#fff4f6');
items.salad = () =>
    SHADOW(32, 59, 25, 3) +
    // les feuilles qui débordent du saladier
    ruffle(18, 30, 10, 7, -25, LET1) +
    ruffle(46, 30, 10, 7, 25, LET1) +
    ruffle(26, 26, 10, 8, -10, LET2) +
    ruffle(38, 26, 10, 8, 10, LET2) +
    ruffle(32, 31, 11, 7, 0, LET3) +
    tomatoWedge(20, 29, -20) +
    tomatoWedge(42, 27, 15) +
    cucumber(31, 29) +
    radish(45, 32) +
    // le saladier, devant
    P('M6 36 L58 36 Q57 54 32 56 Q7 54 6 36Z', '#fdfaf2', 2.4) +
    L('M8 40 Q32 45 56 40', 2.2, '#5f9bd1') +
    F('M12 44 Q14 51 24 53 Q15 49 12 44Z', '#fff', 0.8) +
    E(32, 56.5, 9, 1.6, '#e5dccb', 0, 1.6);

// les biscuits : deux à plat, un debout, des pépites de chocolat
const cookie = (x, y, r, flat) => {
    const chips = [
        [-0.45, -0.25],
        [0.2, -0.45],
        [0.45, 0.15],
        [-0.15, 0.35],
        [-0.05, -0.02],
    ];
    if (flat)
        return (
            E(x, y + r * 0.24, r, r * 0.42, '#b97a35', 0, 2.2) +
            E(x, y, r, r * 0.4, '#e3ad5c', 0, 2.2) +
            chips.map(([a, b]) => E(x + a * r, y + b * r * 0.4, 2, 1.2, '#5b3a29')).join('') +
            FC(x - r * 0.5, y - r * 0.12, r * 0.08, '#fff', 0.5)
        );
    return (
        C(x, y, r, '#e3ad5c', 2.4) +
        C(x, y, r * 0.86, 'none', 0) +
        L(`M${x - r * 0.8} ${y + r * 0.45} Q${x} ${y + r * 1.05} ${x + r * 0.8} ${y + r * 0.45}`, 1.4, '#b97a35') +
        chips.map(([a, b], k) => E(x + a * r, y + b * r, 2.4, 1.9, '#5b3a29', k * 35, 0.9)).join('') +
        FC(x - r * 0.25, y + r * 0.6, r * 0.05, '#b97a35') +
        FC(x + r * 0.55, y - r * 0.55, r * 0.05, '#b97a35') +
        F(`M${x - r * 0.75} ${y - r * 0.2} Q${x - r * 0.6} ${y - r * 0.7} ${x - r * 0.15} ${y - r * 0.82}`, 'none') +
        L(`M${x - r * 0.72} ${y - r * 0.15} Q${x - r * 0.58} ${y - r * 0.62} ${x - r * 0.18} ${y - r * 0.76}`, 1.6, 'rgba(255,255,255,.7)')
    );
};
items.cookies = () =>
    SHADOW(32, 58, 24, 3) +
    cookie(32, 50, 19, true) +
    cookie(31, 43, 17, true) +
    cookie(36, 28, 14, false) +
    FC(14, 56, 1.2, '#c78a42') +
    FC(50, 57, 1, '#c78a42') +
    FC(47, 54, 0.8, '#c78a42');
