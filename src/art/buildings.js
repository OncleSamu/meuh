// Les bâtiments du village (en ruine, en chantier, rénovés) et la maison de la ferme.
import { BLD, C, E, F, FC, FE, HL, KINDS, L, O, P, R, SHADOW, items, svg, ui } from './kit.js';

export const subAny = (kind, id, x, y, s) => `<g transform="translate(${x} ${y}) scale(${s / 64})">${(kind === 'ui' ? ui : items)[id]()}</g>`;

Object.assign(BLD, {
    station: { w: 64, h: 30, wall: '#f2d6a2', roof: '#3f6fb5', sign: ['ui', 'clock'] },
    bakery: { w: 54, h: 34, wall: '#f7e3c0', roof: '#c8453a', sign: ['item', 'bread'] },
    fountain: { kind: 'fountain' },
    inn: { w: 64, h: 40, wall: '#e9c79a', roof: '#6b8f3a', sign: ['item', 'juice'], floors: 2 },
    school: { w: 60, h: 36, wall: '#f7f3ea', roof: '#e8792a', sign: ['ui', 'book'], bell: true },
    florist: { w: 50, h: 32, wall: '#fbe1ea', roof: '#b58ad6', sign: ['item', 'lavender'] },
    pontoon: { kind: 'pontoon' },
    townhall: { w: 76, h: 40, wall: '#f7f3ea', roof: '#3f6fb5', sign: ['ui', 'star'], tower: true },
});

export const grey = '#b9ad9a';

export const greyD = '#8f8574';

export function house(b, s) {
    const x0 = 50 - b.w / 2,
        y0 = 86 - b.h,
        x1 = 50 + b.w / 2;
    const ruin = s === 0,
        site = s === 1;
    const wall = ruin ? grey : b.wall,
        roof = ruin ? greyD : b.roof;
    let o = SHADOW(50, 87, b.w / 2 + 8, 3);
    if (b.tower)
        o +=
            R(42, y0 - 44, 16, 30, 1.5, wall) +
            C(50, y0 - 32, 6, ruin ? '#d8d0c2' : '#fff', 2) +
            L(`M50 ${y0 - 32} L50 ${y0 - 36} M50 ${y0 - 32} L53 ${y0 - 31}`, 1.4) +
            P(`M39 ${y0 - 44} L50 ${y0 - 58} L61 ${y0 - 44}Z`, roof) +
            (ruin ? '' : L(`M50 ${y0 - 58} L50 ${y0 - 70}`, 1.8) + P(`M50 ${y0 - 70} L60 ${y0 - 67} L50 ${y0 - 64}Z`, '#e8364b', 1.6));
    if (!ruin && !b.tower) o += R(x1 - 16, y0 - 22, 8, 16, 1.5, '#a8693a') + FC(x1 - 10, y0 - 28, 4, '#fff', 0.7) + FC(x1 - 6, y0 - 35, 5, '#fff', 0.5);
    o += R(x0, y0, b.w, b.h, 2, wall);
    // toit
    const rh = 20;
    if (ruin)
        o +=
            P(
                `M${x0 - 5} ${y0 + 2} L${50 - 6} ${y0 - rh + 3} L${50 + 2} ${y0 - rh + 8} L${50 + 10} ${y0 - 6} L${x1 - 6} ${y0 - 4} L${x1 + 5} ${y0 + 2}Z`,
                roof,
            ) + L(`M${50 + 2} ${y0 - rh + 8} L${50 + 12} ${y0 - rh + 2} M${50 + 6} ${y0 - 10} L${50 + 16} ${y0 - 15}`, 2, '#6d6457');
    else o += P(`M${x0 - 5} ${y0 + 2} L50 ${y0 - rh} L${x1 + 5} ${y0 + 2}Z`, roof) + L(`M${x0 + 4} ${y0 - 4} L50 ${y0 - rh + 6}`, 1.4, 'rgba(255,255,255,.35)');
    if (b.bell && !ruin) o += R(46, y0 - rh - 12, 8, 10, 1, wall, 2) + C(50, y0 - rh - 5, 2.6, '#ffd23f', 1.4);
    // fenêtres et porte
    const wins = b.floors ? [x0 + 8, x1 - 20, x0 + 8, x1 - 20] : [x0 + 7, x1 - 19];
    wins.forEach((wx, k) => {
        const wy = b.floors ? (k < 2 ? y0 + 5 : y0 + 21) : y0 + 8;
        o += R(wx, wy, 12, 11, 1.5, ruin ? '#5e5548' : '#bfe6fb', 2);
        if (ruin) o += L(`M${wx - 1} ${wy} L${wx + 13} ${wy + 11} M${wx + 13} ${wy} L${wx - 1} ${wy + 11}`, 3, '#a8693a');
        else
            o +=
                F(`M${wx + 2} ${wy + 2} L${wx + 5} ${wy + 2} L${wx + 3} ${wy + 9} L${wx + 1} ${wy + 9}Z`, '#fff', 0.7) +
                L(`M${wx + 6} ${wy} L${wx + 6} ${wy + 11}`, 1.2);
    });
    o += R(44, 86 - 18, 12, 18, 1.5, ruin ? '#6d6457' : '#8b5a2b', 2);
    if (ruin) o += L('M42 74 L58 80 M42 80 L58 74', 3, '#a8693a');
    else o += FC(53, 78, 1.2, '#ffd23f');
    // enseigne
    if (!ruin) o += C(50, y0 - 2, 8.5, '#fff', 2) + subAny(b.sign[0], b.sign[1], 42.5, y0 - 9.5, 15);
    else
        o +=
            L(`M${x0 + 6} ${y0 + 4} L${x0 + 10} ${y0 + 14} L${x0 + 8} ${y0 + 20}`, 1.4, '#6d6457') +
            FE(x0 + 2, 86, 6, 3, '#7fa65a') +
            FE(x1 - 4, 86, 5, 3, '#7fa65a');
    if (s === 2) o += [x0 + 2, x0 + 10, x1 - 10, x1 - 2].map((fx, k) => C(fx, 84, 2.8, ['#e8364b', '#ffd23f', '#f6a5b5', '#b58ad6'][k], 1.4)).join('');
    if (site) o += scaffold(x0, y0, x1);
    return o;
}

export const scaffold = (x0, y0, x1) =>
    L(`M${x0 - 2} 88 L${x0 - 2} ${y0 - 10} M${x1 + 2} 88 L${x1 + 2} ${y0 - 10} M${50} 88 L50 ${y0 - 4}`, 3, '#d9a066') +
    L(`M${x0 - 4} ${y0 + 12} L${x1 + 4} ${y0 + 12} M${x0 - 4} ${y0 - 6} L${x1 + 4} ${y0 - 6}`, 3.4, '#a8693a') +
    L(`M${x0 - 2} ${y0 + 12} L50 ${y0 - 6} L${x1 + 2} ${y0 + 12}`, 1.6, '#d9a066') +
    R(x1 - 10, 78, 10, 8, 1.5, '#5aa9e6', 1.8);

export function fountain(s) {
    let o = SHADOW(50, 86, 36, 4);
    if (s === 0)
        return (
            o +
            E(50, 78, 34, 9, grey) +
            E(50, 76, 28, 6, '#8f8574', 0, 1.6) +
            R(46, 52, 8, 24, 1.5, grey) +
            P('M40 52 L60 52 L57 46 L44 48Z', greyD, 2) +
            L('M30 78 L36 74 L34 80', 1.4, '#6d6457') +
            R(68, 78, 8, 6, 1.5, greyD, 1.6) +
            R(22, 80, 6, 5, 1.5, greyD, 1.6)
        );
    o +=
        E(50, 78, 34, 9, '#d8d0c2') +
        E(50, 76, 28, 6, '#5aa9e6', 0, 1.6) +
        HL(40, 75, 8, 1.5, 0, 0.6) +
        R(46, 44, 8, 32, 1.5, '#d8d0c2') +
        E(50, 46, 14, 4, '#d8d0c2');
    if (s === 2)
        o +=
            L('M50 42 Q50 22 50 18', 4, '#bfe6fb') +
            L('M50 26 Q36 30 30 72 M50 26 Q64 30 70 72', 2.4, '#8fd0f7') +
            FC(50, 18, 4, '#bfe6fb') +
            [
                [26, 76],
                [74, 74],
                [34, 70],
            ]
                .map(([x, y]) => FC(x, y, 1.6, '#fff'))
                .join('');
    else o += scaffold(30, 50, 70);
    return o;
}

export function pontoon(s) {
    let o = F('M0 70 Q50 60 100 70 L100 90 L0 90Z', '#5aa9e6') + L('M8 78 Q16 75 24 78 M60 82 Q68 79 76 82', 1.4, '#bfe6fb');
    const planks = [10, 22, 34, 46, 58, 70, 82];
    o += L('M18 62 L18 88 M82 62 L82 88 M50 62 L50 88', 4, '#5e3a1e');
    planks.forEach((x, k) => {
        if (s === 0 && (k === 2 || k === 5)) return;
        o += R(x, 58, 10, 6, 1, s === 0 ? grey : '#d9a066', 1.6);
    });
    o += R(60, 36, 28, 22, 1.5, s === 0 ? grey : '#f2d6a2') + P('M56 38 L74 24 L92 38Z', s === 0 ? greyD : '#2f7f8f');
    o += R(68, 44, 10, 14, 1, s === 0 ? '#6d6457' : '#8b5a2b', 1.8);
    if (s === 2) o += P('M14 50 L30 50 L28 56 L16 56Z', '#e2412f', 2) + L('M22 50 L22 34 L32 46', 1.6) + subAny('item', 'trout', 72, 26, 12);
    if (s === 1) o += scaffold(60, 36, 88);
    return o;
}

Object.assign(KINDS, { fountain, pontoon });

export function building(id, s) {
    const b = BLD[id];
    const inner = b.kind ? KINDS[b.kind](s) : house(b, s);
    return svg(inner, '0 -20 100 110', 'bld');
}

export function farmhouseArt(l, roofColor) {
    const wall = ['#e9dcc4', '#f7e3c0', '#f7e3c0', '#fbe1ea', '#f7f3ea', '#f7f3ea'][l],
        roof = roofColor || ['#8f8574', '#c8453a', '#c8453a', '#3f6fb5', '#8e2c22', '#3f6fb5'][l];
    const w = 26 + l * 3,
        x0 = 32 - w / 2,
        x1 = 32 + w / 2,
        h = l >= 3 ? 30 : 21,
        y0 = 58 - h;
    let o = SHADOW(32, 59, w / 2 + 7, 2.5);
    if (l >= 1) o += R(x0 + 4, y0 - 12, 6, 12, 1.2, '#a8693a', 1.8) + FC(x0 + 7, y0 - 16, 2.6, '#fff', 0.6);
    if (l >= 4) o += R(x1 + 1, 40, 8, 18, 1.5, wall) + P(`M${x1 - 1} 42 L${x1 + 5} 34 L${x1 + 11} 42Z`, roof) + R(x1 + 3, 46, 4, 5, 1, '#bfe6fb', 1.4);
    o += R(x0, y0, w, h, 2, wall);
    o += P(`M${x0 - 4} ${y0 + 2} L32 ${y0 - 15} L${x1 + 4} ${y0 + 2}Z`, roof) + L(`M${x0 + 2} ${y0 - 2} L32 ${y0 - 11}`, 1.4, 'rgba(255,255,255,.35)');
    if (l === 0) o += L(`M${x0 + 6} ${y0 + 2} L${x0 + 10} ${y0 + 9}`, 1.4, '#8f8574');
    (l >= 3 ? [y0 + 4, y0 + 17] : [y0 + 5]).forEach(y => (o += R(x0 + 3, y, 7, 7, 1, '#bfe6fb', 1.6) + R(x1 - 10, y, 7, 7, 1, '#bfe6fb', 1.6)));
    o += R(28.5, 46, 7, 12, 1.2, '#8b5a2b', 1.8) + FC(34, 52, 0.9, '#ffd23f');
    if (l >= 2) o += R(x0 - 5, 44, w + 10, 3, 1, '#a8693a', 1.6) + L(`M${x0 - 3} 47 L${x0 - 3} 58 M${x1 + 3} 47 L${x1 + 3} 58`, 1.8);
    if (l >= 5) o += L('M32 ' + (y0 - 15) + ' L32 ' + (y0 - 24), 1.6) + P(`M32 ${y0 - 24} L40 ${y0 - 21} L32 ${y0 - 18}Z`, '#e8364b', 1.4);
    if (l >= 1) o += [x0 - 2, x0 + 2, x1 - 2, x1 + 2].map((fx, k) => C(fx, 58, 2, ['#e8364b', '#ffd23f', '#f6a5b5', '#b58ad6'][k], 1.2)).join('');
    return o;
}

Object.assign(BLD, {
    bridge: { kind: 'bridge' },
    washhouse: { kind: 'washhouse' },
    windmill: { kind: 'windmill' },
    bandstand: { kind: 'bandstand' },
    stud: { w: 70, h: 32, wall: '#c8693a', roof: '#5e3a1e', sign: ['item', 'horseshoe'] },
    hall: { w: 72, h: 38, wall: '#f7e3c0', roof: '#b58ad6', sign: ['ui', 'ribbon'], floors: 2 },
});

export const flowerRow = xs => xs.map((fx, k) => C(fx, 85, 2.6, ['#e8364b', '#ffd23f', '#f6a5b5', '#b58ad6'][k % 4], 1.4)).join('');

Object.assign(KINDS, {
    bridge(s) {
        let o = F('M0 72 Q50 64 100 72 L100 92 L0 92Z', '#5aa9e6') + L('M8 82 Q16 79 24 82 M72 84 Q80 81 88 84', 1.4, '#bfe6fb');
        const c = s === 0 ? grey : '#d8cbb4';
        if (s === 0)
            o +=
                P('M2 86 L2 54 L30 54 Q34 62 36 70 L36 86Z', c) +
                P('M64 86 L64 70 Q68 60 72 54 L98 54 L98 86Z', c) +
                R(42, 80, 8, 6, 1.5, greyD, 1.6) +
                R(53, 82, 7, 5, 1.5, greyD, 1.6);
        else
            o +=
                P('M2 86 L2 52 L98 52 L98 86 L76 86 Q76 62 50 62 Q24 62 24 86Z', c) +
                L('M2 58 L98 58', 1.4, '#a89a82') +
                [12, 30, 50, 70, 88].map(x => L(`M${x} 52 L${x} 58`, 1.2, '#a89a82')).join('');
        if (s === 2) o += R(0, 44, 100, 5, 2, '#8b5a2b', 1.8) + [6, 20, 34, 48, 62, 76, 90].map(x => R(x, 38, 4, 12, 1, '#a8693a', 1.6)).join('');
        if (s === 1) o += scaffold(24, 58, 76);
        return o;
    },
    washhouse(s) {
        let o = SHADOW(50, 87, 44, 3) + R(10, 70, 80, 16, 2, s === 0 ? grey : '#d8cbb4') + R(16, 72, 68, 8, 2, s === 0 ? greyD : '#5aa9e6', 1.6);
        if (s) o += HL(30, 75, 10, 1.5, 0, 0.6);
        o += [14, 50, 86].map(x => R(x - 2.5, 40, 5, 30, 1, s === 0 ? greyD : '#8b5a2b', 1.8)).join('');
        if (s === 0) o += P('M6 44 L50 28 L60 34 L70 30 L94 44 L80 42 L60 40Z', greyD);
        else o += P('M4 44 L50 22 L96 44Z', '#c8453a') + L('M14 40 L50 26', 1.4, 'rgba(255,255,255,.35)');
        if (s === 2)
            o +=
                L('M20 56 L80 56', 1.2, '#6d6457') +
                R(26, 55, 10, 9, 1, '#f6a5b5', 1.4) +
                R(44, 55, 10, 9, 1, '#bfe6fb', 1.4) +
                R(62, 55, 10, 9, 1, '#ffd23f', 1.4);
        if (s === 1) o += scaffold(10, 44, 90);
        return o;
    },
    windmill(s) {
        const wall = s === 0 ? grey : '#f2d6a2';
        let o =
            SHADOW(50, 87, 22, 3) +
            P('M34 86 L38 34 L62 34 L66 86Z', wall) +
            R(44, 68, 12, 18, 1.5, s === 0 ? '#6d6457' : '#8b5a2b', 2) +
            R(45, 46, 10, 9, 1.5, s === 0 ? '#5e5548' : '#bfe6fb', 1.8) +
            P('M33 36 L50 16 L67 36Z', s === 0 ? greyD : '#8e2c22');
        const sail = (a, broken) =>
            `<g transform="rotate(${a} 50 28)">` +
            (broken
                ? R(48, 6, 4, 22, 1, greyD, 1.6)
                : R(48, -14, 4, 42, 1, '#8b5a2b', 1.6) + R(52, -12, 10, 26, 1, '#f7f3ea', 1.6) + L('M52 -4 L62 -4 M52 4 L62 4', 1, '#c9b99a')) +
            '</g>';
        o += s === 0 ? sail(160, true) + sail(250, true) : [0, 90, 180, 270].map(a => sail(a + 15)).join('');
        o += C(50, 28, 4, '#5e3a1e', 2);
        if (s === 1) o += scaffold(34, 44, 66);
        if (s === 2) o += flowerRow([30, 36, 64, 70]);
        return o;
    },
    bandstand(s) {
        let o = SHADOW(50, 87, 38, 3) + R(14, 74, 72, 12, 3, s === 0 ? grey : '#d8cbb4');
        o += [22, 40, 60, 78].map((x, k) => (s === 0 && k === 2 ? '' : R(x - 2, 44, 4, 30, 1, s === 0 ? greyD : '#f7f3ea', 1.6))).join('');
        if (s === 0) o += P('M14 48 L40 32 L56 38 L50 46Z', greyD);
        else o += P('M12 46 Q50 8 88 46Z', '#3f6fb5') + R(12, 44, 76, 5, 2, '#ffd23f', 1.6) + L('M50 16 L50 6', 1.8) + C(50, 5, 2.4, '#ffd23f', 1.4);
        if (s === 2)
            o +=
                L('M16 74 Q33 66 50 74 Q67 66 84 74', 1.6, '#e8364b') +
                L('M30 34 L30 26 L36 24 L36 32', 1.4) +
                FC(28.5, 34, 2, O) +
                FC(34.5, 32, 2, O) +
                L('M64 30 L64 22', 1.4) +
                FC(62.5, 30, 2, O);
        if (s === 1) o += scaffold(14, 46, 86);
        return o;
    },
});

Object.assign(BLD, {
    lighthouse: { kind: 'lighthouse' },
    fishmarket: { w: 70, h: 30, wall: '#bfe6fb', roof: '#3f6fb5', sign: ['item', 'sardine'] },
    quay: { kind: 'quay' },
    brewhouse: { w: 58, h: 36, wall: '#e8c38c', roof: '#8e2c22', sign: ['item', 'hop'] },
    chocoshop: { w: 54, h: 34, wall: '#fbe1ea', roof: '#7a4a2a', sign: ['item', 'darkChoc'] },
    shipyard: { kind: 'shipyard' },
    sheepfold: { w: 66, h: 30, wall: '#c9c2b8', roof: '#5e3a1e', sign: ['item', 'wool'] },
    chalet: { w: 60, h: 36, wall: '#c08b52', roof: '#7a4a2a', sign: ['item', 'genepi'], floors: 2 },
    alpinedairy: { w: 62, h: 32, wall: '#f7f3ea', roof: '#5e3a1e', sign: ['item', 'beaufort'] },
    cablecar: { kind: 'cablecar' },
    chapel: { w: 44, h: 36, wall: '#f7f3ea', roof: '#8f9aa6', sign: ['ui', 'star'], tower: true },
    refuge: { w: 64, h: 32, wall: '#a8693a', roof: '#3a2618', sign: ['item', 'fondue'] },
});

Object.assign(KINDS, {
    lighthouse(s) {
        const c1 = s === 0 ? grey : '#f7f3ea',
            c2 = s === 0 ? greyD : '#e2412f';
        let o = SHADOW(50, 87, 20, 3) + P('M38 86 L42 26 L58 26 L62 86Z', c1);
        o += P('M40 66 L60 66 L61 76 L39 76Z M41 46 L59 46 L60 56 L40 56Z', c2, 1.6);
        o += R(40, 14, 20, 12, 2, s === 0 ? '#5e5548' : '#ffe48a') + P('M38 14 L50 2 L62 14Z', c2);
        if (s === 2) o += P('M60 18 L96 8 L96 28Z', '#ffe48a', 0) + P('M40 18 L4 8 L4 28Z', '#ffe48a', 0);
        if (s === 1) o += scaffold(38, 30, 62);
        return o;
    },
    quay(s) {
        let o = F('M0 64 Q50 56 100 64 L100 92 L0 92Z', '#5aa9e6') + L('M10 78 Q18 75 26 78 M66 82 Q74 79 82 82', 1.4, '#bfe6fb');
        o += R(6, 52, 88, 10, 2, s === 0 ? grey : '#a8693a') + [14, 34, 54, 74].map(x => L(`M${x} 62 L${x} 88`, 4, s === 0 ? greyD : '#5e3a1e')).join('');
        if (s === 0) o += R(40, 50, 14, 4, 1, '#5aa9e6', 0);
        if (s === 2) o += `<g transform="translate(46 10) scale(.6)">${ui.boat()}</g>` + C(20, 48, 4, '#e2412f', 1.4);
        if (s === 1) o += scaffold(10, 50, 90);
        return o;
    },
    shipyard(s) {
        let o = SHADOW(50, 87, 40, 3) + L('M14 86 L14 30 M86 86 L86 30 M14 30 L86 30', 4, s === 0 ? greyD : '#8b5a2b');
        o += P('M24 70 Q50 84 76 70 L72 58 L28 58Z', s === 0 ? grey : '#c8453a') + L('M30 62 L70 62', 1.4, s === 0 ? greyD : '#8e2c22');
        if (s === 2) o += L('M50 58 L50 34', 2.4) + P('M50 36 L66 54 L50 54Z', '#f7f3ea', 1.6) + C(80, 82, 2.4, '#ffd23f', 1.4);
        if (s === 1) o += scaffold(24, 50, 76);
        return o;
    },
    cablecar(s) {
        let o = SHADOW(50, 87, 30, 3) + L('M0 20 L100 70', 1.8, s === 0 ? greyD : '#3a2618');
        o += R(8, 20, 14, 66, 2, s === 0 ? grey : '#8f9aa6') + R(78, 58, 14, 28, 2, s === 0 ? grey : '#8f9aa6');
        if (s !== 0)
            o +=
                L('M50 46 L50 52', 2) +
                R(40, 52, 20, 16, 3, s === 2 ? '#e2412f' : '#c9c2b8') +
                R(43, 55, 6, 6, 1, '#bfe6fb', 1.2) +
                R(51, 55, 6, 6, 1, '#bfe6fb', 1.2);
        if (s === 1) o += scaffold(30, 50, 70);
        return o;
    },
});

Object.assign(BLD, {
    chai: { w: 72, h: 32, wall: '#e9d6a8', roof: '#8e2c22', sign: ['item', 'redWine'] },
    cooperage: { w: 56, h: 32, wall: '#c08b52', roof: '#5e3a1e', sign: ['ui', 'barrel'] },
    affinage: { w: 58, h: 36, wall: '#f7f3ea', roof: '#6b8f3a', sign: ['item', 'camembert'], floors: 2 },
    auctionHall: { w: 72, h: 40, wall: '#f2d6a2', roof: '#2a2f6b', sign: ['ui', 'gavel'], tower: true },
    cidery: { w: 56, h: 32, wall: '#f7e3c0', roof: '#c8453a', sign: ['item', 'cider'] },
    crayere: { kind: 'crayere' },
});

Object.assign(KINDS, {
    crayere(s) {
        const chalk = s === 0 ? grey : '#f3ede0',
            dark = s === 0 ? '#5e5548' : '#3a2618';
        let o = SHADOW(50, 87, 42, 3) + P('M4 88 Q10 40 50 34 Q90 40 96 88Z', chalk);
        o += L('M18 70 Q24 60 30 66 M70 60 Q76 52 84 58 M40 48 Q46 44 52 46', 1.4, s === 0 ? greyD : '#d8d0c2');
        o += P('M36 88 L36 68 Q36 54 50 54 Q64 54 64 68 L64 88Z', dark);
        if (s === 0) o += L('M38 66 L62 84 M62 66 L38 84', 3, '#a8693a');
        else o += `<g transform="translate(40 60) scale(.32)">${ui.riddle()}</g>`;
        if (s === 2)
            o += `<g transform="translate(70 30) scale(.3)">${items.champagne()}</g>` + C(22, 84, 2.6, '#ffd23f', 1.2) + C(80, 84, 2.6, '#f6a5b5', 1.2);
        if (s === 1) o += scaffold(32, 54, 68);
        return o;
    },
});
