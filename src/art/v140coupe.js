// La Coupe de la vallée (1.40) : les grands travaux du mécénat, la carte du domaine des légendes,
// les blasons des six rangs, le socle des monuments et la grande statue dorée de Meuh.
import { BLD, KINDS, C, E, FC, HL, L, P, R, SHADOW, ui, goldCowArt } from './kit.js';
import { house2 } from './buildings2.js';
import { MAP_BG } from './maps.js';

const STONE = '#e8dcc0';
const SLATE = '#4a5a78';
const GOLD = '#ffd23f';

// ======================= les grands travaux =======================
const spire = (cx, top, h, w, g) =>
    R(cx - w / 2, top, w, 40, 1.5, g(STONE), 2) +
    R(cx - 2.5, top + 8, 5, 10, 2.5, '#8fd0f7', 1.4) +
    R(cx - 2.5, top + 24, 5, 8, 2.5, '#8fd0f7', 1.4) +
    P(`M${cx - w / 2 - 2} ${top} L${cx} ${top - h} L${cx + w / 2 + 2} ${top}Z`, g(SLATE), 2) +
    L(`M${cx} ${top - h} L${cx} ${top - h - 8} M${cx - 3} ${top - h - 5} L${cx + 3} ${top - h - 5}`, 1.8);
const rose = (cx, cy, r) =>
    C(cx, cy, r, '#8fd0f7', 2) +
    L(
        Array.from({ length: 8 }, (_, k) => {
            const a = (k * Math.PI) / 4;
            return `M${cx} ${cy} L${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)}`;
        }).join(' '),
        1.1,
    ) +
    C(cx, cy, r * 0.35, '#e8364b', 1.2);
const column = (x, y0, y1) => R(x - 2.2, y0, 4.4, y1 - y0, 1, '#f7f3ea', 1.6) + R(x - 3.2, y0 - 2, 6.4, 2.6, 1, '#f7f3ea', 1.4);
const dome = (cx, y, r, fill) => P(`M${cx - r} ${y} A${r} ${r} 0 0 1 ${cx + r} ${y}Z`, fill, 2) + HL(cx - r * 0.4, y - r * 0.55, r * 0.18, r * 0.3, -30, 0.5);
const steam = (x, y) => L(`M${x} ${y} Q${x - 3} ${y - 4} ${x} ${y - 8} Q${x + 3} ${y - 12} ${x} ${y - 16}`, 1.6, 'rgba(255,255,255,.85)');

const CUP_BLD = {
    cathedral: {
        cfg: { w: 50, h: 40, wall: STONE, roof: SLATE, sign: ['ui', 'star'] },
        st: {
            roof: 'gable',
            rh: 22,
            tex: 'stone',
            door: 'arch',
            wins: [],
            nosign: true,
            back: ({ x0, x1, y0, g }) => spire(x0 + 2, y0 - 6, 26, 12, g) + spire(x1 - 2, y0 - 6, 26, 12, g),
            front: ({ y0 }) => rose(50, y0 + 13, 7),
            noFlowers: true,
        },
    },
    observatory: {
        cfg: { w: 40, h: 26, wall: '#f7f3ea', roof: '#9aa3ad', sign: ['ui', 'star'] },
        st: {
            roof: 'flat',
            tex: 'stone',
            door: 'arch',
            wins: [33, 59],
            nosign: true,
            top: ({ y0, g }) =>
                dome(50, y0 - 4, 17, g('#cfd6dd')) +
                R(47, y0 - 21, 6, 17, 1, '#3a4658', 1.4) +
                `<g transform="rotate(-35 50 ${y0 - 14})">${R(48, y0 - 30, 4, 18, 1.5, '#5a6a80', 1.6)}${R(47, y0 - 32, 6, 4, 1, '#3a4658', 1.4)}</g>` +
                FC(30, y0 - 24, 1.2, GOLD) +
                FC(70, y0 - 30, 1.4, GOLD) +
                FC(64, y0 - 20, 1, GOLD),
            noFlowers: true,
        },
    },
    museum: {
        cfg: { w: 66, h: 26, wall: '#efe6d2', roof: '#b0a48c', sign: ['ui', 'star'] },
        st: {
            roof: 'hip',
            rh: 12,
            tex: 'stone',
            door: 'arch',
            wins: [],
            nosign: true,
            top: ({ y0 }) => P(`M28 ${y0 - 1} L50 ${y0 - 14} L72 ${y0 - 1}Z`, '#f7f3ea', 2) + C(50, y0 - 5, 3, GOLD, 1.4),
            front: ({ x0, x1, y0 }) =>
                [x0 + 6, x0 + 16, x1 - 16, x1 - 6].map(x => column(x, y0 + 3, 84)).join('') + R(x0 - 2, 84, x1 - x0 + 4, 3, 1, '#d8ccb0', 1.6),
            noFlowers: true,
        },
    },
    baths: {
        cfg: { w: 60, h: 22, wall: '#e9d8bf', roof: '#c2603c', sign: ['ui', 'star'] },
        st: {
            roof: 'flat',
            tex: 'stone',
            door: 'arch',
            warch: true,
            wins: [22, 67],
            nosign: true,
            top: ({ y0, g }) => dome(50, y0 - 3, 13, g('#c2603c')) + C(50, y0 - 17, 2, GOLD, 1.2) + steam(36, y0 - 6) + steam(64, y0 - 8),
            props: ({ x1 }) => E(x1 + 6, 85, 10, 3.6, '#7ab8e8', 0, 1.8) + FE2(x1 + 6, 84.5, 7, 1.6),
            noFlowers: true,
        },
    },
};
const FE2 = (x, y, rx, ry) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="#bfe6fb"/>`;
for (const [id, d] of Object.entries(CUP_BLD)) {
    BLD[id] = { ...d.cfg, st: d.st, kind: 'h2_' + id };
    KINDS['h2_' + id] = s => house2(BLD[id], s);
}

// l'opéra : façade à arcades, loggia à colonnes jumelées, deux pavillons et leurs statues dorées, coupole verte et lyre d'Apollon
BLD.opera = { w: 84, h: 40, wall: '#f3e2c0', roof: '#4f8a72', kind: 'opera' };
KINDS.opera = s => {
    const site = s === 1;
    const CREAM = '#f3e2c0',
        COPPER = '#5d9e84',
        GLASS = '#3f5f8a';
    let o = SHADOW(50, 88, 44, 3);
    // la coupole, derrière
    o += R(37, 38, 26, 10, 1.5, CREAM, 2);
    o += P('M34 39 Q50 14 66 39Z', COPPER, 2) + L('M42 38 Q46 24 50 21 M58 38 Q54 24 50 21 M50 21 L50 38', 1.2, '#3f7a62') + HL(42, 31, 2, 5, -25, 0.45);
    o += R(47.5, 14, 5, 7, 1, COPPER, 1.6);
    o += P('M45 13 Q50 2 55 13 Q50 9 45 13Z', GOLD, 1.6) + L('M48 12 L48 7 M50 12 L50 5 M52 12 L52 7', 0.9);
    // les deux pavillons et leurs statues dorées
    for (const x of [8, 80]) {
        o += R(x, 44, 12, 38, 1.5, CREAM, 2) + R(x - 1, 42, 14, 4, 1, '#e8d2a8', 1.8);
        o += R(x + 3, 52, 6, 9, 3, GLASS, 1.4) + R(x + 3, 66, 6, 12, 3, '#7a2a2a', 1.4);
        const cx = x + 6;
        o +=
            P(`M${cx - 3} 42 L${cx + 3} 42 L${cx + 2} 34 L${cx - 2} 34Z`, GOLD, 1.4) +
            C(cx, 32, 2.2, GOLD, 1.2) +
            P(
                `M${cx - 2} 36 Q${cx - 8} 31 ${cx - 6} 27 Q${cx - 3} 31 ${cx - 1} 34Z M${cx + 2} 36 Q${cx + 8} 31 ${cx + 6} 27 Q${cx + 3} 31 ${cx + 1} 34Z`,
                GOLD,
                1.2,
            );
    }
    // le corps central
    o += R(20, 48, 60, 34, 1.5, CREAM, 2);
    o += R(19, 46, 62, 4, 1, GOLD, 1.8) + L('M24 48 L76 48', 0.8, '#b8862a');
    // la loggia : vitrage sombre et colonnes jumelées
    o += R(22, 52, 56, 12, 1, GLASS, 1.6);
    for (const x of [24, 33, 42, 54, 63, 72]) o += R(x, 51, 2.6, 13, 0.8, '#fbf6ea', 1.2) + R(x + 3, 51, 2.6, 13, 0.8, '#fbf6ea', 1.2);
    o += R(20, 64, 60, 3, 1, '#e8d2a8', 1.6);
    // le rez-de-chaussée : cinq arcades
    for (const x of [23, 34, 45, 56, 67]) o += P(`M${x} 82 L${x} 72 Q${x + 5} 66 ${x + 10} 72 L${x + 10} 82Z`, '#7a2a2a', 1.6) + FC(x + 5, 70, 1, GOLD);
    // les marches et le tapis rouge
    o += R(16, 82, 68, 3, 1, '#e8dcc0', 1.6) + R(12, 85, 76, 3, 1, '#d8ccb0', 1.6) + R(46, 82, 8, 6, 0.5, '#e8364b', 1.2);
    // deux lanternes
    o += [3, 97].map(x => L(`M${x} 88 L${x} 74`, 1.8) + R(x - 2.2, 70, 4.4, 5, 1, GOLD, 1.2)).join('');
    if (site)
        o +=
            L('M18 88 L18 22 M82 88 L82 22 M50 88 L50 8', 3, '#d9a066') +
            L('M14 60 L86 60 M14 40 L86 40 M24 24 L76 24', 3.2, '#a8693a') +
            L('M18 60 L50 24 L82 60', 1.6, '#d9a066') +
            R(70, 76, 10, 8, 1.5, '#5aa9e6', 1.8);
    return o;
};

// le grand pont de pierre : trois arches au-dessus de la rivière, des lanternes
BLD.bigBridge = { w: 84, h: 20, wall: STONE, roof: STONE, kind: 'bigBridge' };
KINDS.bigBridge = s => {
    const site = s === 1;
    let o = SHADOW(50, 89, 46, 3);
    o += P('M4 70 Q50 64 96 70 L96 90 L4 90Z', '#7ab8e8', 2) + L('M12 80 Q20 78 28 80 M60 84 Q68 82 76 84', 1.4, '#bfe6fb');
    o += P('M6 60 L94 60 L94 72 Q86 72 84 84 L72 84 Q70 72 62 72 Q56 72 54 84 L46 84 Q44 72 38 72 Q30 72 28 84 L16 84 Q14 72 6 72Z', STONE, 2);
    o += L('M10 66 L90 66', 1.2, '#c9b998');
    o += R(4, 54, 92, 6, 1.5, '#d8ccb0', 2);
    o += L('M4 54 L96 54', 2);
    if (!site)
        o +=
            [14, 50, 86].map(x => L(`M${x} 54 L${x} 40`, 2) + R(x - 3, 34, 6, 7, 1.5, GOLD, 1.6) + FC(x, 37.5, 1.4, '#fff', 0.8)).join('') +
            P('M44 54 L50 44 L56 54Z', '#e8364b', 1.6);
    else
        o +=
            L('M8 54 L8 30 M92 54 L92 30 M50 54 L50 26', 3, '#d9a066') + L('M6 42 L94 42 M6 32 L94 32', 3.2, '#a8693a') + R(70, 46, 10, 8, 1.5, '#5aa9e6', 1.8);
    return o;
};

// ======================= le socle d'un monument, la grande statue =======================
Object.assign(ui, {
    plinth: () =>
        SHADOW(32, 60, 22, 3) +
        R(12, 50, 40, 9, 2, '#d8ccb0', 2) +
        R(16, 44, 32, 7, 2, '#e8dcc0', 2) +
        L('M20 47.5 L44 47.5', 1, '#b8ab8c') +
        HL(20, 45.5, 3, 1, 0, 0.5),
    meuhStatue: () =>
        SHADOW(32, 61, 26, 3) +
        R(8, 52, 48, 9, 2, '#d8ccb0', 2) +
        R(14, 40, 36, 13, 2, '#e8dcc0', 2) +
        R(22, 44, 20, 5, 1, GOLD, 1.2) +
        `<g transform="translate(9 -12) scale(.72)">${goldCowArt()}</g>` +
        FC(12, 12, 2, '#fff', 0.9) +
        FC(54, 8, 1.6, '#fff', 0.9) +
        FC(50, 22, 1.2, '#fff', 0.8),
});

// ======================= les blasons des six rangs =======================
// du canton (bois) au monde (diamant) : un écu, une couronne de laurier et des étoiles
const RANK_COLORS = [
    ['#c08b52', '#a8693a'],
    ['#d99a5a', '#c8803a'],
    ['#dfe5ea', '#b9c2cc'],
    ['#ffe27a', GOLD],
    ['#efe9ff', '#b8aee0'],
    ['#bfefff', '#7fd3f5'],
];
const crest = k => () => {
    const [c1, c2] = RANK_COLORS[k];
    const laurel = side =>
        Array.from({ length: 5 }, (_, i) => {
            const y = 50 - i * 8,
                x = side < 0 ? 12 + i * 0.8 : 52 - i * 0.8;
            return E(x, y, 3.2, 1.8, '#6cc04a', side * (40 - i * 8), 1.2);
        }).join('');
    const stars = Array.from({ length: k }, (_, i) => {
        const x = 32 + (i - (k - 1) / 2) * 6.5;
        return P(starPath(x, 34, 2.8), '#fff', 1);
    }).join('');
    return (
        SHADOW(32, 60, 18, 2.5) +
        laurel(-1) +
        laurel(1) +
        P('M18 12 L46 12 L46 34 Q46 50 32 56 Q18 50 18 34Z', c2, 2.2) +
        P('M22 16 L42 16 L42 33 Q42 45 32 50 Q22 45 22 33Z', c1, 1.6) +
        HL(27, 22, 2, 5, -10, 0.55) +
        (k === 5 ? P('M32 18 L38 24 L32 31 L26 24Z', '#fff', 1.4) + L('M26 24 L38 24 M32 18 L30 24 L32 31 L34 24Z', 0.9) : C(32, 24, 4.5, c2, 1.4)) +
        stars
    );
};
function starPath(cx, cy, r) {
    return (
        Array.from({ length: 10 }, (_, i) => {
            const a = -Math.PI / 2 + (i * Math.PI) / 5,
                rr = i % 2 ? r * 0.45 : r;
            return `${i ? 'L' : 'M'}${(cx + Math.cos(a) * rr).toFixed(2)} ${(cy + Math.sin(a) * rr).toFixed(2)}`;
        }).join(' ') + 'Z'
    );
}
for (let k = 0; k < 6; k++) ui['cupRank' + k] = crest(k);

// ======================= la carte du domaine des légendes =======================
// un grand parc : une allée en anneau autour de la place de la statue, la rivière en haut pour le pont
const ring = Array.from({ length: 17 }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 17;
    return [80 + Math.cos(a) * 52, 64 + Math.sin(a) * 30];
});
const hedge = (x, y) =>
    `<ellipse cx="${x}" cy="${y + 1.2}" rx="3.4" ry="2" fill="#2f7a3a" opacity=".35"/><ellipse cx="${x}" cy="${y}" rx="3.4" ry="2.2" fill="#3f9a3f"/>`;
MAP_BG.legendes = `<svg class="vmap-bg" viewBox="0 0 160 110" preserveAspectRatio="none" aria-hidden="true">
    <rect width="160" height="110" fill="#cfeaf8"/>
    <path d="M0 18 Q40 10 80 16 Q120 22 160 12 L160 30 L0 30Z" fill="#a9cf8a"/>
    <path d="M0 22 Q50 14 100 22 Q135 28 160 20 L160 110 L0 110Z" fill="#b9dd86"/>
    <path d="M0 24 Q40 30 80 26 Q120 22 160 28 L160 33 Q120 27 80 31 Q40 35 0 29Z" fill="#7ab8e8"/>
    <path d="M10 28 Q20 27 30 28 M110 26 Q120 25 130 26" stroke="#bfe6fb" stroke-width="1" fill="none"/>
    <ellipse cx="80" cy="64" rx="56" ry="33" fill="#a4d870"/>
    <ellipse cx="80" cy="64" rx="52" ry="30" fill="none" stroke="#f0dcae" stroke-width="5"/>
    <ellipse cx="80" cy="64" rx="52" ry="30" fill="none" stroke="#fff3d0" stroke-width="1.4" stroke-dasharray="1 5" opacity=".8"/>
    <ellipse cx="80" cy="64" rx="16" ry="9" fill="#f0dcae"/>
    <path d="M80 73 L80 110 M64 64 L28 64 M96 64 L132 64" stroke="#f0dcae" stroke-width="4"/>
    ${ring.map(([x, y]) => `<ellipse cx="${x.toFixed(1)}" cy="${(y + 2).toFixed(1)}" rx="4.2" ry="1.8" fill="#d8ccb0"/>`).join('')}
    ${[
        [8, 46],
        [152, 46],
        [10, 96],
        [150, 98],
        [40, 104],
        [120, 104],
        [6, 70],
        [154, 72],
    ]
        .map(([x, y]) => hedge(x, y))
        .join('')}
    <g fill="#e8364b"><circle cx="66" cy="58" r="1.1"/><circle cx="94" cy="70" r="1.1"/><circle cx="74" cy="72" r="1.1"/></g>
    <g fill="#ffd23f"><circle cx="70" cy="56" r="1.1"/><circle cx="90" cy="58" r="1.1"/><circle cx="86" cy="72" r="1.1"/></g>
</svg>`;
export const LEGEND_SPOTS = ring;
