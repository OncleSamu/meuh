// Les maisons du village refaites (1.2.7) : chacune sa silhouette (commerce, grange, chalet, bâtiment public…), en ruine comme rénovée.
import { BLD, C, E, F, FC, FE, HL, KINDS, L, P, R, SHADOW, items, ui } from './kit.js';

const sub = (kind, id, x, y, s) => `<g transform="translate(${x} ${y}) scale(${s / 64})">${(kind === 'ui' ? ui : items)[id]()}</g>`;
const LINE = 'rgba(58,38,24,.35)';
const GR = '#b9ad9a',
    GRM = '#a39884',
    GRD = '#8f8574',
    BOARD = '#a8693a';

// en ruine : chaque couleur devient un gris de même clarté
function lum(c) {
    if (!/^#[0-9a-f]{6}$/i.test(c)) return 0.6;
    const n = parseInt(c.slice(1), 16);
    return (0.3 * (n >> 16) + 0.59 * ((n >> 8) & 255) + 0.11 * (n & 255)) / 255;
}
const greyOf = c => (lum(c) > 0.7 ? GR : lum(c) > 0.42 ? GRM : GRD);

// ---------- les morceaux ----------
function roofPath(kind, x0, y0, x1, rh) {
    const m = (x0 + x1) / 2;
    switch (kind) {
        case 'hip':
            return `M${x0 - 5} ${y0 + 2} L${x0 + 9} ${y0 - rh} L${x1 - 9} ${y0 - rh} L${x1 + 5} ${y0 + 2}Z`;
        case 'gambrel':
            return `M${x0 - 4} ${y0 + 2} L${x0 + 1} ${y0 - rh * 0.55} L${m} ${y0 - rh - 4} L${x1 - 1} ${y0 - rh * 0.55} L${x1 + 4} ${y0 + 2}Z`;
        case 'chalet':
            return `M${x0 - 10} ${y0 + 4} L${m} ${y0 - rh + 2} L${x1 + 10} ${y0 + 4}Z`;
        case 'mansard':
            return `M${x0 - 3} ${y0 + 2} L${x0 + 3} ${y0 - rh + 4} Q${m} ${y0 - rh - 2} ${x1 - 3} ${y0 - rh + 4} L${x1 + 3} ${y0 + 2}Z`;
        case 'thatch':
            return `M${x0 - 8} ${y0 + 4} L${m} ${y0 - rh} L${x1 + 8} ${y0 + 4}Z`;
        case 'flat':
            return `M${x0 - 4} ${y0 + 1} L${x0 - 4} ${y0 - 6} L${x1 + 4} ${y0 - 6} L${x1 + 4} ${y0 + 1}Z`;
        default:
            return `M${x0 - 5} ${y0 + 2} L${m} ${y0 - rh} L${x1 + 5} ${y0 + 2}Z`;
    }
}

// les rangs de tuiles : traits courts dans le toit
function tiles(kind, x0, y0, x1, rh, ruin) {
    const m = (x0 + x1) / 2;
    let o = '';
    if (kind === 'flat') return '';
    if (kind === 'thatch') {
        // frange de chaume
        let d = `M${x0 - 8} ${y0 + 4}`;
        for (let x = x0 - 8; x < x1 + 8; x += 6) d += ` L${x + 3} ${y0 + 9} L${x + 6} ${y0 + 4}`;
        return (
            P(d + 'Z', ruin ? GRM : '#d9a85a', 1.8) +
            L(
                `M${m - 10} ${y0 - rh + 10} L${m - 16} ${y0 - 4} M${m + 4} ${y0 - rh + 8} L${m + 8} ${y0 - 6} M${m - 26} ${y0 - 2} L${m - 22} ${y0 - 8}`,
                1.2,
                LINE,
            )
        );
    }
    for (let k = 1; k <= 3; k++) {
        const y = y0 + 2 - (rh * k) / 4;
        const half = kind === 'hip' || kind === 'mansard' ? (x1 - x0) / 2 + 2 - k * 3 : ((x1 - x0) / 2 + 5) * (1 - k / 4) - 2;
        if (half < 4) continue;
        o += L(`M${m - half} ${y} L${m + half} ${y}`, 1.2, LINE);
    }
    return o;
}

function texture(kind, x0, y0, x1, y1, floors) {
    let o = '';
    const w = x1 - x0;
    if (kind === 'timber') {
        const c = '#5e3a1e';
        o += L(`M${x0 + 1} ${y0 + 2} L${x1 - 1} ${y0 + 2}`, 2.6, c);
        if (floors) o += L(`M${x0} ${(y0 + y1) / 2} L${x1} ${(y0 + y1) / 2}`, 2.6, c);
        for (const fx of [x0 + 4, x1 - 4]) o += L(`M${fx} ${y0 + 2} L${fx} ${y1 - 1}`, 2.4, c);
        const yb = floors ? (y0 + y1) / 2 : y1;
        o += L(`M${x0 + 4} ${yb} L${x0 + 16} ${y0 + 2} M${x1 - 4} ${yb} L${x1 - 16} ${y0 + 2}`, 2, c);
    } else if (kind === 'planks') {
        for (let x = x0 + 5; x < x1 - 2; x += 5) o += L(`M${x} ${y0 + 2} L${x} ${y1 - 1}`, 1, LINE);
    } else if (kind === 'stone') {
        const pts = [
            [0.1, 0.25],
            [0.3, 0.12],
            [0.86, 0.3],
            [0.08, 0.7],
            [0.92, 0.72],
            [0.62, 0.9],
            [0.22, 0.92],
            [0.7, 0.15],
        ];
        pts.forEach(([a, b], k) => (o += E(x0 + a * w, y0 + b * (y1 - y0), 3 + (k % 2), 2, 'rgba(0,0,0,.08)', 0, 1)));
    } else if (kind === 'brick') {
        for (let y = y0 + 6; y < y1 - 2; y += 6) o += L(`M${x0 + 2} ${y} L${x1 - 2} ${y}`, 0.9, LINE);
    }
    return o;
}

function win(x, y, w, h, ruin, opt = {}) {
    let o = '';
    if (opt.shut && !ruin) o += R(x - 4, y, 4, h, 1, opt.shut, 1.6) + R(x + w, y, 4, h, 1, opt.shut, 1.6);
    const glass = ruin ? '#5e5548' : '#bfe6fb';
    if (opt.arch) o += P(`M${x} ${y + h} L${x} ${y + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2} L${x + w} ${y + h}Z`, glass, 2);
    else if (opt.round) o += C(x + w / 2, y + w / 2, w / 2, glass, 2);
    else o += R(x, y, w, h, 1.5, glass, 2);
    if (ruin) return o + L(`M${x - 1} ${y + 1} L${x + w + 1} ${y + h - 1} M${x + w + 1} ${y + 2} L${x - 1} ${y + h - 2}`, 2.6, BOARD);
    o += F(`M${x + 2} ${y + 3} L${x + 4.5} ${y + 3} L${x + 3} ${y + h - 2} L${x + 1.5} ${y + h - 2}Z`, '#fff', 0.7);
    if (!opt.round) o += L(`M${x + w / 2} ${y + (opt.arch ? 1 : 0)} L${x + w / 2} ${y + h} M${x} ${y + h / 2 + 1} L${x + w} ${y + h / 2 + 1}`, 1.1);
    if (opt.box)
        o +=
            R(x - 1, y + h, w + 2, 3, 1, '#a8693a', 1.4) +
            [x + 2, x + w / 2, x + w - 2].map((fx, k) => C(fx, y + h - 0.5, 1.6, ['#e8364b', '#ffd23f', '#f6a5b5'][k], 1)).join('');
    return o;
}

function door(kind, x, w, h, ruin, col) {
    const y = 86 - h;
    let o = '';
    const c = ruin ? '#6d6457' : col || '#8b5a2b';
    if (kind === 'barn') {
        o +=
            R(x, y, w, h, 1, c, 2) +
            L(
                `M${x + w / 2} ${y} L${x + w / 2} 86 M${x} ${y} L${x + w / 2} 86 L${x + w} ${y} M${x} 86 L${x + w / 2} ${y} L${x + w} 86`,
                1.4,
                ruin ? '#4d463c' : '#5e3a1e',
            );
    } else if (kind === 'arch') {
        o +=
            P(`M${x} 86 L${x} ${y + w / 2} A${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2} L${x + w} 86Z`, c, 2) +
            L(`M${x + w / 2} ${y + 1} L${x + w / 2} 86`, 1.2);
    } else if (kind === 'glass') {
        o += R(x, y, w, h, 1.5, c, 2) + R(x + 2.5, y + 2.5, w - 5, h * 0.45, 1, ruin ? '#5e5548' : '#bfe6fb', 1.4);
    } else o += R(x, y, w, h, 1.5, c, 2);
    if (ruin) o += L(`M${x - 2} ${y + 5} L${x + w + 2} ${y + 11} M${x - 2} ${y + 12} L${x + w + 2} ${y + 6}`, 2.6, BOARD);
    else if (kind !== 'barn') o += FC(x + w - 3, y + h * 0.6, 1.2, '#ffd23f');
    return o + R(x - 3, 85, w + 6, 3, 1, ruin ? GRD : '#d8d0c2', 1.6);
}

function awning(x, y, w, c, ruin) {
    const n = Math.max(3, Math.round(w / 7)),
        sw = w / n;
    let o = P(`M${x} ${y} L${x + w} ${y} L${x + w + 3} ${y + 8} L${x - 3} ${y + 8}Z`, ruin ? GRM : '#fff', 1.8);
    if (ruin) return o + L(`M${x + 4} ${y + 2} L${x + 9} ${y + 10} M${x + w - 8} ${y + 1} L${x + w - 4} ${y + 12}`, 1.6, '#6d6457');
    for (let k = 0; k < n; k += 2) {
        const a = x + k * sw,
            b = a + sw;
        o += F(`M${a} ${y} L${b} ${y} L${b + (3 * (b - x - w / 2)) / (w / 2)} ${y + 8} L${a + (3 * (a - x - w / 2)) / (w / 2)} ${y + 8}Z`, c, 1);
    }
    o += P(`M${x} ${y} L${x + w} ${y} L${x + w + 3} ${y + 8} L${x - 3} ${y + 8}Z`, 'none', 1.8);
    for (let k = 0; k < n; k++) o += P(`M${x - 3 + k * ((w + 6) / n)} ${y + 8} a${(w + 6) / n / 2} 3 0 0 0 ${(w + 6) / n} 0Z`, k % 2 ? '#fff' : c, 1.4);
    return o;
}

const sign = (b, x, y, ruin, r = 8.5) => (ruin ? '' : C(x, y, r, '#fff', 2) + sub(b.sign[0], b.sign[1], x - r + 1.5, y - r + 1.5, (r - 1.5) * 2));
// enseigne pendue à une potence
const hangSign = (b, x, y, ruin, dir = 1) =>
    ruin
        ? L(`M${x} ${y} L${x + 12 * dir} ${y}`, 2.4, '#6d6457')
        : L(`M${x} ${y} L${x + 11 * dir} ${y} M${x + 2 * dir} ${y + 4} L${x + 6 * dir} ${y}`, 2.4, '#3a2618') +
          L(`M${x + 8 * dir} ${y} L${x + 8 * dir} ${y + 3}`, 1.2) +
          sign(b, x + 8 * dir, y + 10, false, 7);

const chimney = (x, y, ruin, tall) =>
    R(x, y - (tall ? 30 : 22), 8, tall ? 22 : 16, 1.5, ruin ? GRD : '#a8693a') +
    (ruin ? '' : FC(x + 4, y - (tall ? 36 : 28), 4, '#fff', 0.7) + FC(x + 8, y - (tall ? 43 : 35), 5, '#fff', 0.5));

const flowers = (x0, x1) => [x0 + 2, x0 + 10, x1 - 10, x1 - 2].map((fx, k) => C(fx, 84, 2.8, ['#e8364b', '#ffd23f', '#f6a5b5', '#b58ad6'][k], 1.4)).join('');
const weeds = (x0, x1) =>
    FE(x0 + 2, 86, 6, 3, '#7fa65a') + FE(x1 - 4, 86, 5, 3, '#7fa65a') + L(`M${x0 + 1} 86 L${x0 - 1} 80 M${x0 + 4} 86 L${x0 + 5} 79`, 1.4, '#5f8a3e');
const cracks = (x0, y0) => L(`M${x0 + 6} ${y0 + 4} L${x0 + 10} ${y0 + 14} L${x0 + 8} ${y0 + 20}`, 1.4, '#6d6457');

const scaffold = (x0, y0, x1) =>
    L(`M${x0 - 2} 88 L${x0 - 2} ${y0 - 10} M${x1 + 2} 88 L${x1 + 2} ${y0 - 10} M50 88 L50 ${y0 - 4}`, 3, '#d9a066') +
    L(`M${x0 - 4} ${y0 + 12} L${x1 + 4} ${y0 + 12} M${x0 - 4} ${y0 - 6} L${x1 + 4} ${y0 - 6}`, 3.4, '#a8693a') +
    L(`M${x0 - 2} ${y0 + 12} L50 ${y0 - 6} L${x1 + 2} ${y0 + 12}`, 1.6, '#d9a066') +
    R(x1 - 10, 78, 10, 8, 1.5, '#5aa9e6', 1.8);

// ---------- les accessoires devant la maison ----------
const barrel = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    P('M-6 -14 Q-8 -7 -6 0 L6 0 Q8 -7 6 -14Z', '#a8693a', 1.8) +
    L('M-7 -10 L7 -10 M-7 -4 L7 -4', 1.6) +
    HL(-3, -9, 1.2, 3, 0, 0.4) +
    '</g>';
const crate = (x, y, c = '#d9a066') => R(x - 6, y - 11, 12, 11, 1, c, 1.8) + L(`M${x - 6} ${y - 11} L${x + 6} ${y}`, 1.2);
const hay = (x, y) =>
    R(x - 8, y - 10, 16, 10, 3, '#f0c75e', 1.8) + L(`M${x - 5} ${y - 7} L${x - 2} ${y - 3} M${x + 1} ${y - 8} L${x + 4} ${y - 4}`, 1.1, '#b8862a');
const can = (x, y) =>
    P(`M${x - 4} ${y} L${x - 4} ${y - 9} L${x - 2} ${y - 12} L${x + 2} ${y - 12} L${x + 4} ${y - 9} L${x + 4} ${y}Z`, '#d8d0c2', 1.6) +
    L(`M${x - 4} ${y - 6} L${x + 4} ${y - 6}`, 1.2);
const bench = (x, y) => R(x - 9, y - 7, 18, 3, 1, '#a8693a', 1.6) + L(`M${x - 7} ${y - 4} L${x - 7} ${y} M${x + 7} ${y - 4} L${x + 7} ${y}`, 1.8);
const pots = x =>
    [0, 7, 14]
        .map(
            (d, k) =>
                P(`M${x + d - 3} 86 L${x + d - 2.5} 80 L${x + d + 2.5} 80 L${x + d + 3} 86Z`, '#c8693a', 1.4) +
                C(x + d, 77, 3, ['#e8364b', '#f6a5b5', '#ffd23f'][k], 1.3),
        )
        .join('');
const lantern = (x, y) => L(`M${x} ${y} L${x} ${y + 4}`, 1.2) + R(x - 2.5, y + 4, 5, 6, 1, '#ffd23f', 1.4);
const bunting = (x0, x1, y) => {
    let o = L(`M${x0} ${y} Q${(x0 + x1) / 2} ${y + 6} ${x1} ${y}`, 1.2);
    const n = 6;
    for (let k = 1; k < n; k++) {
        const x = x0 + ((x1 - x0) * k) / n,
            yy = y + 6 * (1 - Math.pow((2 * k) / n - 1, 2)) - 0.5;
        o += P(`M${x - 2.5} ${yy} L${x + 2.5} ${yy} L${x} ${yy + 5}Z`, ['#e8364b', '#ffd23f', '#5aa9e6', '#6cc04a', '#b58ad6'][k % 5], 1);
    }
    return o;
};

// ---------- la maison ----------
export function house2(b, s) {
    const S = b.st || {};
    const ruin = s === 0,
        site = s === 1;
    const g = c => (ruin ? greyOf(c) : c);
    const x0 = 50 - b.w / 2,
        y0 = 86 - b.h,
        x1 = 50 + b.w / 2,
        m = 50;
    const rk = S.roof || 'gable';
    const rh = S.rh || (rk === 'hip' ? 14 : rk === 'chalet' ? 18 : rk === 'mansard' ? 16 : rk === 'flat' ? 6 : 20);
    let o = SHADOW(50, 87, b.w / 2 + 8, 3);
    // derrière la maison
    if (S.back) o += S.back({ x0, y0, x1, ruin, g });
    if (S.chim) o += chimney(S.chim === 'l' ? x0 + 6 : x1 - 15, y0 + 2 - (rk === 'flat' ? -4 : 0), ruin, S.tall);
    // les murs
    o += R(x0, y0, b.w, b.h, 2, g(b.wall));
    if (S.base && !ruin) o += R(x0, 80, b.w, 6, 1, S.base, 1.8);
    o += texture(S.tex, x0, y0, x1, 86, b.floors);
    // le toit
    let roof = P(roofPath(rk, x0, y0, x1, rh), g(b.roof)) + tiles(rk, x0, y0, x1, rh, ruin);
    if (rk !== 'flat' && rk !== 'thatch') roof += L(`M${x0 + 2} ${y0 - 2} L${m - 8} ${y0 - rh + 6}`, 1.4, 'rgba(255,255,255,.35)');
    if (S.snow && !ruin)
        roof += P(
            `M${m - 22} ${y0 - rh + 13} L${m} ${y0 - rh + 2} L${m + 22} ${y0 - rh + 13} Q${m + 14} ${y0 - rh + 16} ${m + 8} ${y0 - rh + 11} Q${m} ${y0 - rh + 15} ${m - 8} ${y0 - rh + 11} Q${m - 14} ${y0 - rh + 16} ${m - 22} ${y0 - rh + 13}Z`,
            '#fff',
            1.6,
        );
    if (ruin) {
        // un trou dans le toit et des tuiles qui pendent
        roof +=
            P(`M${m - 2} ${y0 - rh * 0.55} L${m + 8} ${y0 - rh * 0.4} L${m + 12} ${y0 - 2} L${m + 2} ${y0 - 1}Z`, '#4d463c', 1.6) +
            L(`M${m + 2} ${y0 - rh * 0.5} L${m + 14} ${y0 - rh * 0.9} M${m + 6} ${y0 - 6} L${m + 16} ${y0 - 11}`, 2, '#6d6457');
    }
    o += roof;
    if (S.top) o += S.top({ x0, y0, x1, rh, ruin, g });
    // fenêtres
    const ww = S.ww || 11,
        wh = S.wh || 11;
    const wopt = { arch: S.warch, shut: S.shut && g(S.shut), box: S.box && !ruin, round: false };
    const cols = S.wins || [x0 + 7, x1 - 7 - ww];
    const rows = b.floors ? [y0 + 5, y0 + b.h / 2 + 3] : [y0 + 8];
    if (S.shop) {
        // grande vitrine et store à rayures
        const sx = S.shop === 'r' ? x1 - 6 - 22 : x0 + 6;
        o += R(sx, y0 + 15, 22, 14, 1.5, ruin ? '#5e5548' : '#bfe6fb', 2);
        if (!ruin)
            o +=
                F(`M${sx + 3} ${y0 + 17} L${sx + 7} ${y0 + 17} L${sx + 4} ${y0 + 27} L${sx + 2} ${y0 + 27}Z`, '#fff', 0.7) +
                (S.goods ? S.goods(sx, y0 + 15) : '');
        else o += L(`M${sx} ${y0 + 16} L${sx + 22} ${y0 + 28} M${sx + 22} ${y0 + 16} L${sx} ${y0 + 28}`, 2.6, BOARD);
        o += awning(sx - 1, y0 + 6, 24, g(S.awn || b.roof), ruin);
        const ox = S.shop === 'r' ? x0 + 7 : x1 - 7 - ww;
        if (b.w >= 60) o += win(ox, y0 + 7, ww, wh, ruin, wopt);
    } else rows.forEach(wy => cols.forEach(wx => (o += win(wx, wy, ww, wh, ruin, wopt))));
    // porte
    const dk = S.door || 'plain',
        dw = dk === 'barn' ? 18 : 12,
        dh = dk === 'barn' ? 20 : 18;
    const dx = S.shop ? (S.shop === 'r' ? m - 14 : m + 2) : m - dw / 2;
    o += door(dk, dx, dw, dh, ruin, S.doorC);
    if (S.balcony)
        o +=
            R(x0 + 4, y0 + b.h / 2 - 1, b.w - 8, 3, 1, g('#7a4a2a'), 1.8) +
            L(
                Array.from(
                    { length: Math.floor((b.w - 10) / 5) },
                    (_, k) => `M${x0 + 7 + k * 5} ${y0 + b.h / 2 + 2} L${x0 + 7 + k * 5} ${y0 + b.h / 2 + 8}`,
                ).join(' '),
                1.4,
                ruin ? '#6d6457' : '#5e3a1e',
            ) +
            L(`M${x0 + 4} ${y0 + b.h / 2 + 8} L${x1 - 4} ${y0 + b.h / 2 + 8}`, 1.8, ruin ? '#6d6457' : '#5e3a1e');
    // enseigne
    if (S.hang) o += hangSign(b, S.hang === 'l' ? x0 : x1, y0 + 4, ruin, S.hang === 'l' ? -1 : 1);
    else if (!S.nosign) o += sign(b, S.signX || m, S.signY || y0 - 3, ruin);
    if (S.front) o += S.front({ x0, y0, x1, ruin, g, rh });
    if (ruin) o += cracks(x0, y0) + weeds(x0, x1);
    if (s === 2) o += (S.props ? S.props({ x0, y0, x1 }) : '') + (S.noFlowers ? '' : flowers(x0, x1));
    if (site) o += scaffold(x0, y0, x1);
    return o;
}

// ---------- chaque maison avec son style ----------
const tower = (cx, top, ruin, g, opt = {}) => {
    const w = opt.w || 16;
    let o = R(cx - w / 2, top, w, 30, 1.5, g(opt.wall || '#f7f3ea'));
    o += opt.noClock
        ? win(cx - 3, top + 8, 6, 10, ruin, { arch: true })
        : C(cx, top + 12, 6, ruin ? '#d8d0c2' : '#fff', 2) +
          (ruin
              ? L(`M${cx - 3} ${top + 9} L${cx + 3} ${top + 15}`, 1.4)
              : L(`M${cx} ${top + 12} L${cx} ${top + 8} M${cx} ${top + 12} L${cx + 3} ${top + 13}`, 1.4));
    if (opt.spire) o += P(`M${cx - w / 2 - 2} ${top} L${cx} ${top - 26} L${cx + w / 2 + 2} ${top}Z`, g(opt.roof));
    else o += P(`M${cx - w / 2 - 3} ${top} L${cx} ${top - 14} L${cx + w / 2 + 3} ${top}Z`, g(opt.roof));
    const tip = opt.spire ? top - 26 : top - 14;
    if (!ruin)
        o += opt.cross
            ? L(`M${cx} ${tip} L${cx} ${tip - 9} M${cx - 3} ${tip - 6} L${cx + 3} ${tip - 6}`, 1.8)
            : L(`M${cx} ${tip} L${cx} ${tip - 12}`, 1.8) + P(`M${cx} ${tip - 12} L${cx + 10} ${tip - 9} L${cx} ${tip - 6}Z`, opt.flag || '#e8364b', 1.6);
    return o;
};

const ST = {
    station: {
        roof: 'hip',
        tex: 'brick',
        chim: 'r',
        // le quai couvert sur le côté, l'horloge et la voie
        front: ({ x0, x1, y0, ruin, g }) =>
            L(`M${x0 - 14} 86 L${x0 - 14} ${y0 + 6} M${x0 - 4} 86 L${x0 - 4} ${y0 + 8}`, 2.4, ruin ? '#6d6457' : '#5e3a1e') +
            P(`M${x0 - 17} ${y0 + 6} L${x0 + 2} ${y0 + 2} L${x0 + 2} ${y0 + 8} L${x0 - 17} ${y0 + 10}Z`, g('#3f6fb5'), 1.8) +
            (ruin
                ? ''
                : C(x0 - 9, y0 + 16, 4.5, '#fff', 1.6) + L(`M${x0 - 9} ${y0 + 16} L${x0 - 9} ${y0 + 13} M${x0 - 9} ${y0 + 16} L${x0 - 7} ${y0 + 17}`, 1.1)) +
            L(`M${x0 - 16} 89 L${x1 + 8} 89`, 1.6, '#6d6457'),
        props: ({ x1 }) => bench(x1 - 3, 86),
        noFlowers: true,
    },
    bakery: {
        shop: 'l',
        awn: '#c8453a',
        chim: 'r',
        tex: 'stone',
        goods: (x, y) => sub('item', 'bread', x + 7, y + 3, 10) + sub('item', 'croissant', x + 13, y + 4, 9),
        props: ({ x1 }) => bench(x1 - 2, 86),
        hang: 'r',
    },
    inn: { tex: 'timber', chim: 'l', box: true, door: 'arch', hang: 'r', props: ({ x0 }) => barrel(x0 + 5, 86, 0.8) + lantern(52, 59) },
    school: {
        roof: 'gable',
        shut: '#3f6fb5',
        top: ({ y0, rh, ruin, g }) =>
            R(45, y0 - rh - 12, 10, 12, 1, g('#f7f3ea'), 2) +
            P(`M43 ${y0 - rh - 12} L50 ${y0 - rh - 20} L57 ${y0 - rh - 12}Z`, g('#e8792a'), 1.8) +
            (ruin ? '' : C(50, y0 - rh - 6, 2.6, '#ffd23f', 1.4)),
        props: ({ x1 }) =>
            L(`M${x1 + 4} 86 L${x1 + 4} 66 L${x1 - 6} 66 L${x1 - 6} 86`, 2) +
            L(`M${x1 - 3} 66 L${x1 - 3} 76 M${x1 + 1} 66 L${x1 + 1} 76`, 1) +
            R(x1 - 4, 76, 6, 2, 0.5, '#e8364b', 1.2),
    },
    florist: {
        shop: 'l',
        awn: '#b58ad6',
        box: true,
        roof: 'gable',
        goods: (x, y) => [4, 10, 16].map((d, k) => C(x + d + 1, y + 9, 3, ['#e8364b', '#ffd23f', '#f6a5b5'][k], 1.2)).join(''),
        props: ({ x1 }) => pots(x1 + 1),
        noFlowers: true,
    },
    townhall: {
        roof: 'mansard',
        tex: 'stone',
        warch: true,
        shut: '#3f6fb5',
        wins: [13, 27, 62, 76],
        ww: 10,
        back: ({ y0, ruin, g }) => tower(50, y0 - 38, ruin, g, { roof: '#3f6fb5', wall: '#f7f3ea', flag: '#3f6fb5' }),
        door: 'arch',
        props: ({ x0, x1 }) => R(x0 + 24, 84, b('townhall').w - 48, 3, 1, '#d8d0c2', 1.4),
    },
    stud: {
        roof: 'gambrel',
        tex: 'planks',
        door: 'barn',
        wins: [16, 72],
        props: ({ x0 }) => hay(x0 + 6, 86) + L('M70 86 L70 76 M82 86 L82 76 M68 79 L84 79', 2, '#5e3a1e'),
        top: ({ y0, rh, ruin }) => (ruin ? '' : P(`M44 ${y0 - rh + 4} L56 ${y0 - rh + 4} L56 ${y0 - 2} L44 ${y0 - 2}Z`, '#5e3a1e', 1.8)),
    },
    hall: {
        roof: 'gable',
        warch: true,
        ww: 10,
        wins: [20, 33, 57, 70],
        top: ({ x0, x1, y0, ruin }) => (ruin ? '' : bunting(x0 - 2, x1 + 2, y0 + 1)),
        door: 'arch',
        props: ({ x0 }) => lantern(x0 - 2, 56),
    },
    fishmarket: {
        roof: 'hip',
        tex: 'planks',
        shop: 'l',
        awn: '#3f6fb5',
        goods: (x, y) => sub('item', 'sardine', x + 3, y + 2, 9) + sub('item', 'trout', x + 11, y + 3, 9),
        props: ({ x0 }) => crate(x0 - 3, 86, '#bfe6fb') + crate(x0 - 3, 75),
        hang: 'r',
        noFlowers: true,
    },
    brewhouse: {
        tex: 'brick',
        chim: 'r',
        tall: true,
        door: 'arch',
        props: ({ x0, x1 }) => barrel(x0 + 4, 86, 0.8) + barrel(x0 + 14, 86, 0.8) + barrel(x0 + 9, 75, 0.7),
        hang: 'l',
        noFlowers: true,
    },
    chocoshop: {
        shop: 'r',
        awn: '#7a4a2a',
        goods: (x, y) => sub('item', 'darkChoc', x + 3, y + 2, 10) + sub('item', 'pralines', x + 12, y + 3, 9),
        box: true,
        hang: 'l',
    },
    sheepfold: {
        roof: 'gambrel',
        tex: 'stone',
        door: 'barn',
        wins: [12, 77],
        props: ({ x1 }) => hay(x1 - 6, 86) + L(`M8 86 L8 76 M20 86 L20 76 M6 80 L22 80`, 2, '#5e3a1e'),
        noFlowers: true,
    },
    chalet: {
        roof: 'chalet',
        tex: 'planks',
        snow: true,
        balcony: true,
        shut: '#c8453a',
        props: ({ x0 }) => R(x0 - 6, 76, 10, 10, 1, '#a8693a', 1.6) + L(`M${x0 - 6} 79 L${x0 + 4} 79 M${x0 - 6} 82 L${x0 + 4} 82`, 1),
    },
    alpinedairy: {
        roof: 'chalet',
        tex: 'stone',
        snow: true,
        shut: '#6b8f3a',
        door: 'arch',
        props: ({ x0, x1 }) => can(x0 + 4, 86) + can(x0 + 12, 86) + sub('item', 'beaufort', x1 - 14, 72, 14),
        noFlowers: true,
    },
    chapel: {
        roof: 'gable',
        rh: 26,
        nosign: true,
        tex: 'stone',
        warch: true,
        ww: 8,
        wh: 14,
        wins: [32, 60],
        door: 'arch',
        back: ({ y0, ruin, g }) => tower(50, y0 - 34, ruin, g, { roof: '#8f9aa6', spire: true, cross: true, noClock: false, w: 14 }),
        front: ({ y0, ruin }) => (ruin ? '' : C(50, y0 + 2, 4, '#f6a5b5', 1.6) + L(`M50 ${y0 - 2} L50 ${y0 + 6} M46 ${y0 + 2} L54 ${y0 + 2}`, 1)),
    },
    refuge: {
        roof: 'chalet',
        tex: 'stone',
        snow: true,
        chim: 'l',
        shut: '#c8453a',
        props: ({ x1 }) =>
            R(x1 - 4, 74, 12, 12, 1, '#a8693a', 1.6) +
            L(`M${x1 - 4} 78 L${x1 + 8} 78 M${x1 - 4} 82 L${x1 + 8} 82`, 1) +
            L(`M${x1 + 10} 86 L${x1 + 14} 66`, 2, '#5e3a1e'),
        hang: 'l',
    },
    chai: {
        roof: 'hip',
        tex: 'stone',
        door: 'barn',
        wins: [20, 70],
        ww: 10,
        wh: 8,
        props: ({ x0, x1 }) => barrel(x0 + 4, 86, 0.85) + barrel(x0 + 15, 86, 0.85) + barrel(x1 - 4, 86, 0.85),
        noFlowers: true,
        top: ({ x0, x1, y0, ruin }) =>
            ruin
                ? ''
                : L(`M${x0} ${y0 + 3} Q${x0 + 10} ${y0 + 8} ${x0 + 18} ${y0 + 2}`, 2.4, '#4f9e3a') +
                  [x0 + 6, x0 + 12].map(x => FC(x, y0 + 7, 2, '#7a2a6b')).join(''),
    },
    cooperage: {
        roof: 'gable',
        tex: 'planks',
        door: 'barn',
        props: ({ x0, x1 }) => barrel(x0 + 4, 86, 0.8) + barrel(x1 - 4, 86, 0.8) + barrel(x1 - 4, 74, 0.7) + E(x0 + 16, 85, 5, 1.5, '#a8693a', 0, 1.4),
        noFlowers: true,
        hang: 'l',
    },
    affinage: {
        tex: 'timber',
        shut: '#6b8f3a',
        door: 'arch',
        props: ({ x1 }) =>
            R(x1 - 2, 72, 14, 3, 1, '#a8693a', 1.4) + sub('item', 'camembert', x1, 62, 10) + L(`M${x1} 75 L${x1} 86 M${x1 + 10} 75 L${x1 + 10} 86`, 1.6),
        hang: 'l',
    },
    auctionHall: {
        roof: 'hip',
        tex: 'stone',
        nosign: true,
        warch: true,
        wins: [21, 68],
        ww: 10,
        door: 'arch',
        front: ({ y0, ruin, g }) =>
            // le fronton à colonnes
            P(`M30 ${y0 + 4} L50 ${y0 - 10} L70 ${y0 + 4}Z`, g('#f7f3ea'), 2) +
            [33, 41, 59, 67].map(x => R(x - 2, y0 + 4, 4, 82 - y0 - 4 + 0, 1, g('#f7f3ea'), 1.6)).join('') +
            R(30, 82, 40, 4, 1, g('#d8d0c2'), 1.6) +
            (ruin ? L('M41 70 L43 64 L40 58', 1.4, '#6d6457') : C(50, y0 - 1, 4.5, '#fff', 1.6) + sub('ui', 'gavel', 46, y0 - 5, 8)),
    },
    cidery: {
        tex: 'timber',
        shut: '#c8453a',
        props: ({ x0, x1 }) => barrel(x0 + 4, 86, 0.8) + sub('item', 'apple', x1 - 14, 74, 12),
        hang: 'r',
        top: ({ x1, y0, ruin }) => (ruin ? '' : C(x1 - 6, y0 - 2, 6, '#6cc04a', 1.6) + FC(x1 - 8, y0 - 3, 1.6, '#e8364b') + FC(x1 - 4, y0, 1.6, '#e8364b')),
    },
    bakehut: {
        roof: 'thatch',
        tex: 'planks',
        shop: 'l',
        awn: '#e8792a',
        goods: (x, y) => sub('item', 'coconutFlan', x + 6, y + 2, 11),
        props: ({ x1 }) =>
            P(`M${x1 - 10} 86 Q${x1 - 10} 74 ${x1 - 2} 74 Q${x1 + 6} 74 ${x1 + 6} 86Z`, '#c8693a', 1.8) +
            P(`M${x1 - 5} 86 Q${x1 - 5} 80 ${x1 - 2} 80 Q${x1 + 1} 80 ${x1 + 1} 86Z`, '#3a2618', 1) +
            FC(x1 - 2, 84, 1.6, '#ffd23f'),
        noFlowers: true,
    },
    roasting: {
        roof: 'thatch',
        tex: 'planks',
        chim: 'r',
        tall: true,
        shut: '#2f7f8f',
        props: ({ x0 }) => R(x0 - 4, 74, 12, 12, 2, '#f2d6a2', 1.6) + L(`M${x0 - 4} 78 L${x0 + 8} 78`, 1) + sub('item', 'coffee', x0 - 3, 62, 10),
    },
    rumhouse: {
        roof: 'hip',
        tex: 'planks',
        shut: '#2f7f8f',
        // véranda à colonnes
        front: ({ x0, x1, y0, ruin, g }) =>
            P(`M${x0 - 6} ${y0 + 12} L${x1 + 6} ${y0 + 12} L${x1 + 8} ${y0 + 17} L${x0 - 8} ${y0 + 17}Z`, g('#2f7f8f'), 1.8) +
            [x0 - 4, x1 + 4].map(x => R(x - 1.5, y0 + 17, 3, 86 - y0 - 17, 1, g('#fff3dc'), 1.4)).join(''),
        props: ({ x0, x1 }) => barrel(x0 + 6, 86, 0.8) + barrel(x1 - 6, 86, 0.8),
        noFlowers: true,
    },
    breeding: {
        roof: 'gambrel',
        tex: 'planks',
        door: 'barn',
        wins: [16, 64],
        props: ({ x0, x1 }) => hay(x1 - 4, 86) + can(x0 + 4, 86) + can(x0 + 12, 86),
        noFlowers: true,
    },
    lab: {
        roof: 'flat',
        tex: 'none',
        door: 'glass',
        ww: 12,
        back: ({ x1, y0, ruin, g }) =>
            // la coupole
            P(`M${x1 - 26} ${y0 - 6} A12 12 0 0 1 ${x1 - 2} ${y0 - 6}Z`, g('#d8d0c2'), 2) +
            (ruin ? L(`M${x1 - 18} ${y0 - 14} L${x1 - 12} ${y0 - 8}`, 1.4) : R(x1 - 16, y0 - 18, 4, 12, 1, '#5aa9e6', 1.4)) +
            L(`M${x0p(x1)} ${y0 - 6} L${x0p(x1)} ${y0 - 22}`, 1.6) +
            C(x0p(x1), y0 - 23, 2, ruin ? GRD : '#e8364b', 1.2),
        signY: 69 - 40 + 4,
    },
    seedbank: {
        roof: 'gable',
        tex: 'none',
        // une aile en verre à côté
        front: ({ x1, y0, ruin, g }) =>
            P(
                `M${x1 - 2} 86 L${x1 - 2} ${y0 + 10} L${x1 + 10} ${y0 + 2} L${x1 + 14} ${y0 + 10} L${x1 + 14} 86Z`,
                ruin ? '#8f8574' : 'rgba(191,230,251,.85)',
                2,
            ) +
            (ruin
                ? L(`M${x1} ${y0 + 12} L${x1 + 12} ${y0 + 30}`, 1.4, '#6d6457')
                : L(`M${x1 + 6} ${y0 + 6} L${x1 + 6} 86 M${x1 - 2} ${y0 + 26} L${x1 + 14} ${y0 + 26}`, 1.2) + leafy(x1 + 2, 84) + leafy(x1 + 10, 84)),
    },
    salonHall: {
        roof: 'mansard',
        warch: true,
        ww: 10,
        wins: [17, 29, 61, 73],
        door: 'arch',
        nosign: true,
        // la grande verrière en dôme
        back: ({ y0, ruin, g }) =>
            P(`M30 ${y0 - 10} A20 20 0 0 1 70 ${y0 - 10}Z`, ruin ? GRM : '#bfe6fb', 2.2) +
            (ruin
                ? L(`M44 ${y0 - 26} L52 ${y0 - 12} M58 ${y0 - 24} L54 ${y0 - 16}`, 1.6, '#6d6457')
                : L(
                      `M50 ${y0 - 30} L50 ${y0 - 10} M38 ${y0 - 27} L42 ${y0 - 10} M62 ${y0 - 27} L58 ${y0 - 10} M31 ${y0 - 17} Q50 ${y0 - 22} 69 ${y0 - 17}`,
                      1.3,
                  ) + HL(40, y0 - 22, 3, 6, -30, 0.6)) +
            L(`M50 ${y0 - 30} L50 ${y0 - 40}`, 1.8) +
            (ruin ? '' : P(`M50 ${y0 - 40} L60 ${y0 - 37} L50 ${y0 - 34}Z`, '#b58ad6', 1.6)),
        front: ({ y0, ruin }) => (ruin ? '' : C(50, y0 - 4, 8.5, '#fff', 2) + sub('ui', 'trophy', 43, y0 - 11, 14) + bunting(14, 86, y0 + 2)),
    },
};
const b = id => BLD[id];
const x0p = x1 => x1 - 14;
const leafy = (x, y) =>
    L(`M${x} ${y} L${x} ${y - 8}`, 1.4, '#3f8f2e') + FE(x - 2, y - 7, 2.5, 1.5, '#6cc04a', 1, -30) + FE(x + 2, y - 9, 2.5, 1.5, '#6cc04a', 1, 30);

// on branche
function install() {
    for (const [id, S] of Object.entries(ST)) {
        if (!BLD[id] || BLD[id].kind) continue;
        BLD[id].st = S;
        KINDS['h2_' + id] = s => house2(BLD[id], s);
    }
    for (const id of Object.keys(ST)) if (BLD[id] && BLD[id].st) BLD[id].kind = 'h2_' + id;
}
install();
