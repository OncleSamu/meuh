// 1.23 : Les grandes écuries (bâtiment à trois niveaux, box, cheval de sport équipé, icônes). Dessins validés le 21 octobre 2026.
import { C, E, F, FC, FE, HL, L, P, R, SHADOW, svg, animals, ui } from './kit.js';

const WALL = '#f6ecd2',
    WALL2 = '#e8d6aa',
    ROOF = '#4f7a63',
    ROOFD = '#3d6350',
    WOOD = '#7a4a2a',
    DOOR = '#a8442f',
    STRAW = '#e8c26a',
    GRAVEL = '#cdbb94';
const planks = (x0, y0, x1, y1, step = 6) => {
    let d = '';
    for (let x = x0 + step; x < x1; x += step) d += `M${x} ${y0} L${x} ${y1} `;
    return L(d, 1, 'rgba(58,38,24,.28)');
};
const tilesRow = (x0, x1, y, step = 7) => {
    let d = '';
    for (let x = x0; x < x1; x += step) d += `M${x} ${y} l3 4 l3 -4 `;
    return L(d, 1.1, 'rgba(0,0,0,.28)');
};
// une tête de cheval qui dépasse de la porte (vue de face-profil, petite)
const peek = (x, y, col = '#a8693a', mane = '#3a2618', white = false) =>
    P(`M${x - 3} ${y + 8} Q${x - 4} ${y - 2} ${x} ${y - 6} Q${x + 4} ${y - 2} ${x + 3} ${y + 8}Z`, col, 1.6) +
    P(`M${x - 3} ${y - 4} L${x - 5} ${y - 9} L${x - 1} ${y - 6}Z M${x + 3} ${y - 4} L${x + 5} ${y - 9} L${x + 1} ${y - 6}Z`, col, 1.3) +
    (white ? F(`M${x - 1} ${y - 4} L${x + 1} ${y - 4} L${x + 1.4} ${y + 7} L${x - 1.4} ${y + 7}Z`, '#fff') : '') +
    P(`M${x - 3.5} ${y - 6} Q${x} ${y - 11} ${x + 3.5} ${y - 6} Q${x} ${y - 7} ${x - 3.5} ${y - 6}Z`, mane, 1.2) +
    FC(x - 1.6, y, 0.9, '#3a2618') +
    FC(x + 1.6, y, 0.9, '#3a2618') +
    FE(x, y + 6.5, 2.2, 1.2, '#3a2618', 0.8);
// une porte de box à deux battants : le haut ouvert (ombre, éventuellement une tête), le bas fermé
const boxDoor = (x, y, w, h, head) =>
    R(x, y, w, h, 1.5, '#4a3524', 1.8) +
    (head ? head(x + w / 2, y + 8) : '') +
    R(x, y + h * 0.5, w, h * 0.5, 1.2, DOOR, 1.8) +
    L(`M${x + 2} ${y + h * 0.5 + 3} L${x + w - 2} ${y + h - 2} M${x + w - 2} ${y + h * 0.5 + 3} L${x + 2} ${y + h - 2}`, 1.2, 'rgba(255,255,255,.35)') +
    R(x + w / 2 - 1.2, y + h * 0.5 + 1, 2.4, 3, 0.8, '#ffd23f', 1) +
    R(x + 1.5, y - 4.5, w - 3, 3.6, 1, '#f6ecd2', 1.2);
const lantern = (x, y) => L(`M${x} ${y} L${x} ${y + 3}`, 1.2) + R(x - 2.2, y + 3, 4.4, 5.5, 1, '#ffd23f', 1.3);
const bale = (x, y, s = 1) =>
    R(x - 7 * s, y - 9 * s, 14 * s, 9 * s, 1.5, STRAW, 1.6) +
    L(`M${x - 3 * s} ${y - 9 * s} L${x - 3 * s} ${y} M${x + 3 * s} ${y - 9 * s} L${x + 3 * s} ${y}`, 1, '#a07a2a');
const bucket = (x, y) =>
    P(`M${x - 4} ${y - 6} L${x + 4} ${y - 6} L${x + 3} ${y} L${x - 3} ${y}Z`, '#6ba3d6', 1.4) + L(`M${x - 4} ${y - 6} Q${x} ${y - 10} ${x + 4} ${y - 6}`, 1.1);
const fence = (x0, x1, y, h = 9) => {
    let o = '';
    const n = Math.max(2, Math.round((x1 - x0) / 9));
    for (let i = 0; i <= n; i++) {
        const x = x0 + ((x1 - x0) * i) / n;
        o += L(`M${x} ${y} L${x} ${y - h}`, 2.4, WOOD);
    }
    return (
        L(`M${x0} ${y - h + 2} L${x1} ${y - h + 2} M${x0} ${y - h / 2 + 1} L${x1} ${y - h / 2 + 1}`, 2.2, '#fff') +
        L(`M${x0} ${y - h + 2} L${x1} ${y - h + 2} M${x0} ${y - h / 2 + 1} L${x1} ${y - h / 2 + 1}`, 0.8, WOOD) +
        o
    );
};
// girouette en forme de cheval (galopant)
const vane = (x, y) =>
    L(`M${x} ${y} L${x} ${y - 9}`, 1.8, '#3a2618') +
    P(
        `M${x - 6} ${y - 11} Q${x - 3} ${y - 14} ${x} ${y - 12} L${x + 4} ${y - 15} L${x + 6} ${y - 13} L${x + 4} ${y - 10} L${x + 1} ${y - 9} L${x + 1} ${y - 6} L${x - 1} ${y - 6} L${x - 2} ${y - 9} L${x - 5} ${y - 7} L${x - 6} ${y - 9}Z`,
        '#d9a316',
        1.2,
    );
const cupola = (cx, base, big) =>
    R(cx - 7, base - 15, 14, 15, 1, WALL2, 1.8) +
    R(cx - 3, base - 12, 6, 8, 3, '#2d1d12', 1.4) +
    P(`M${cx - 10} ${base - 15} L${cx} ${base - 25} L${cx + 10} ${base - 15}Z`, ROOFD, 1.8) +
    vane(cx, base - 25) +
    (big ? C(cx, base - 17, 0, '#fff') : '');

// ---------- les grandes écuries ----------
export function stable(level) {
    // level 0 : chantier ; 1 : 4 boxes ; 2 : 8 boxes ; 3 : 12 boxes + manège
    let o = SHADOW(50, 87, 46, 3);
    const gx0 = 6,
        gx1 = 70,
        y0 = 52,
        h = 34;
    if (level === 0) {
        o += R(gx0, 80, gx1 - gx0, 6, 1, '#b8b0a0', 1.8);
        o += [gx0 + 3, 28, 50, gx1 - 5].map(x => L(`M${x} 80 L${x} 46`, 3.2, WOOD)).join('');
        o += L(`M${gx0 + 3} 46 L${gx1 - 5} 46 M${gx0 + 3} 62 L${gx1 - 5} 62`, 2.6, WOOD);
        o += L(`M${gx0 + 3} 62 L28 46 M50 62 L${gx1 - 5} 46`, 1.8, '#c9a46e');
        o +=
            P(`M${gx0 - 2} 46 L${(gx0 + gx1) / 2 - 6} 24 L${(gx0 + gx1) / 2 + 6} 24 L${gx1 + 2} 46Z`, 'none', 2.2) +
            L(`M${gx0 + 8} 46 L${gx0 + 18} 28 M${gx1 - 8} 46 L${gx1 - 18} 28`, 2.2, WOOD);
        o += R(78, 70, 16, 5, 1, '#c9a46e', 1.6) + R(79, 64, 14, 5, 1, '#d9b57a', 1.6) + R(80, 58, 12, 5, 1, '#c9a46e', 1.6);
        o += R(36, 66, 20, 12, 2, '#f6ecd2', 1.8) + C(46, 72, 0, '#fff') + L('M39 70 L53 70 M39 74 L50 74', 1.6, WOOD);
        return o;
    }
    // l'aile du fond (8 et 12 boxes)
    if (level >= 2) o += R(12, 38, 50, 20, 1.5, WALL2, 1.8) + P('M8 40 L16 24 L56 24 L64 40Z', ROOFD, 1.8) + tilesRow(18, 54, 31);
    // bâtiment principal
    o += R(gx0, y0, gx1 - gx0, h, 2, WALL) + R(gx0, 80, gx1 - gx0, 6, 1, '#b8b0a0', 1.8) + planks(gx0, y0, gx1, 80, 7);
    o +=
        P(`M${gx0 - 4} ${y0 + 2} L${gx0 + 8} ${y0 - 17} L${gx1 - 8} ${y0 - 17} L${gx1 + 4} ${y0 + 2}Z`, ROOF, 2) +
        tilesRow(gx0 + 6, gx1 - 6, y0 - 10) +
        tilesRow(gx0 + 2, gx1 - 2, y0 - 3) +
        L(`M${gx0 + 2} ${y0 - 2} L${gx0 + 14} ${y0 - 14}`, 1.4, 'rgba(255,255,255,.35)');
    o += cupola(38, y0 - 17);
    // portes de box
    const n = 4,
        dw = 12,
        step = (gx1 - gx0 - 6) / n;
    const heads = [peek, null, (x, y) => peek(x, y, '#e6e0d4', '#9a9186', true), null];
    for (let i = 0; i < n; i++) o += boxDoor(gx0 + 4 + i * step + (step - dw) / 2, y0 + 8, dw, 24, level >= 1 ? heads[i] : null);
    o += lantern(gx0 + 2, y0 + 6) + lantern(gx1 - 2, y0 + 6);
    o += bale(gx0 + 8, 87) + bucket(gx1 - 8, 87);
    // l'enclos et, au niveau 3, le manège
    if (level === 1) o += fence(74, 98, 86) + bale(88, 79, 0.8);
    if (level === 2)
        o += F('M72 86 L98 86 L98 78 L72 78Z', GRAVEL, 0.7) + fence(72, 98, 86) + fence(72, 98, 74) + bale(90, 74, 0.8) + peek(82, 66, '#8b5a2b', '#3a2618');
    if (level >= 3) {
        o +=
            FE(85, 80, 17, 7, '#e6cf99', 1) +
            FE(85, 80, 17, 7, 'none', 1) +
            `<ellipse cx="85" cy="80" rx="17" ry="7" fill="none" stroke="#7a4a2a" stroke-width="2.4"/>` +
            L('M69 80 Q85 90 101 80', 1.2, 'rgba(0,0,0,.25)');
        o += L('M76 83 L76 74 M94 83 L94 74', 2.6, WOOD) + L('M76 76 L94 76', 3.2, '#c8453a') + L('M76 76 L94 76', 1.2, '#fff');
        o += L('M99 70 L99 52', 2, '#3a2618') + P('M99 52 L112 56 L99 61Z', '#c8453a', 1.4);
        o += FE(62, 82, 6, 2, '#8b8574', 0.35);
    }
    if (level >= 2) o += C(66, 30, 0, '#fff');
    return o;
}
export const stableSvg = lv => svg(stable(lv), '0 -20 115 110', 'bld');

// ---------- un box (fond de carte), libre ou occupé ----------
export function boxTile(occupied) {
    let o =
        R(2, 2, 116, 76, 6, '#d9b57a', 2.2) +
        planks(2, 2, 118, 60, 9) +
        R(2, 58, 116, 20, 4, STRAW, 2) +
        L('M10 66 q6 -4 12 0 M40 70 q6 -4 12 0 M80 64 q6 -4 12 0 M96 72 q6 -4 12 0', 1.4, '#c9a02a');
    o += R(86, 12, 28, 6, 1.5, WOOD, 1.8) + L('M90 18 L90 26 M110 18 L110 26', 1.6, WOOD) + R(88, 22, 24, 7, 2, STRAW, 1.6);
    o += R(10, 12, 26, 10, 2, '#f6ecd2', 1.8) + (occupied ? L('M14 17 L32 17', 1.6, WOOD) : L('M14 17 L28 17', 1.4, 'rgba(58,38,24,.4)'));
    o += bucket(20, 74);
    if (occupied) {
        const K = '#a8693a',
            M = '#3a2618';
        o +=
            '<g transform="translate(0 7)">' +
            P('M40 52 Q42 32 50 24 L70 24 Q78 32 80 52Z', K, 2.2) +
            P('M44 52 Q45 36 50 28 L52 40Z M76 52 Q75 36 70 28 L68 40Z', M, 1.6) +
            P('M49 10 L47 -1 L55 6Z M71 10 L73 -1 L65 6Z', K, 2) +
            P('M52 6 Q60 2 68 6 L66 30 Q65 41 60 43 Q55 41 54 30Z', K, 2.2) +
            P('M58 6 L62 6 L62.8 34 L57.2 34Z', '#fff', 1) +
            P('M52 7 Q60 14 68 7 Q60 3 52 7Z', M, 1.4) +
            FC(54.6, 19, 1.9, M) +
            FC(65.4, 19, 1.9, M) +
            C(55, 18.4, 0.6, '#fff', 0) +
            C(65.8, 18.4, 0.6, '#fff', 0) +
            E(60, 38, 6, 4.2, '#c98f63', 0, 1.6) +
            FE(57.6, 38, 1.1, 1.6, M, 0.8) +
            FE(62.4, 38, 1.1, 1.6, M, 0.8) +
            HL(54, 22, 3, 6, 0, 0.5) +
            '</g>';
        o += R(30, 46, 60, 26, 2, DOOR, 2.4) + L('M34 50 L86 68 M86 50 L34 68', 1.6, 'rgba(255,255,255,.35)') + R(56, 47, 8, 6, 1.5, '#ffd23f', 1.4);
    }
    return o;
}
export const boxSvg = occ => svg(boxTile(occ), '0 0 120 80');

// ---------- l'équipement, posé sur le cheval (repère de 80 × 80) ----------
const KB = '#a8693a',
    MN = '#3a2618';
const slimLeg = (d, c) => L(d, 5.4) + L(d, 2.4, c);
const eyeS = (x, y) => FC(x, y, 1.9, MN) + FC(x + 0.7, y - 0.7, 0.7, '#fff');
export const slimHorse = (K = KB) =>
    SHADOW(36, 75, 26, 3) +
    slimLeg('M23 50 L22 71', '#8b5a2b') +
    slimLeg('M31 52 L31 72', '#8b5a2b') +
    slimLeg('M47 52 L47 72', '#8b5a2b') +
    slimLeg('M54 50 L55 71', '#8b5a2b') +
    [22, 31, 47, 55].map((x, i) => L(`M${x - 1.6} 73 L${x + 1.6} 73`, 4, MN)).join('') +
    P('M15 34 Q1 38 3 66 Q8 52 16 44Z', MN, 2) +
    P('M13 37 Q13 30 21 30 L47 30 Q57 30 58 38 Q58 53 48 54 L24 54 Q13 53 13 37Z', K, 2.4) +
    P('M45 36 L53 10 Q57 5 62 8 L66 20 L58 42Z', K, 2.4) +
    P('M58 8 Q64 2 69 7 L77 19 Q79 25 74 26 L68 24 L61 17Z', K, 2.4) +
    P('M60 7 L59 0 L64 5Z', K, 2) +
    P('M53 9 Q44 20 46 38 L52 35 Q52 22 59 10Z', MN, 2) +
    eyeS(66, 11) +
    FE(75.5, 22.5, 1.3, 1, MN, 0.9) +
    HL(24, 38, 8, 3, -10, 0.45);
export const gear = {
    // 1.24.3 : selles redessinées (plus basses : un siège creusé, un quartier court, plus de « seau » sur le dos)
    padDress: P('M23 31 Q35 28 47 31 L46 44 Q35 47 24 44Z', '#f6ecd2', 2.2) + L('M24 40.5 Q35 43.5 46 40.5', 2, '#c8453a'),
    saddleDress:
        P('M31 32.5 Q36.5 34 42 32.5 L41.6 41 Q36.5 42.6 31.4 41Z', '#7a3e1a', 2) +
        P('M26 31 Q25.6 26.4 30 28 Q35 30.6 40 28.6 Q44.6 26 45.6 31 Q36 35 26 31Z', '#5a2c12', 2.2) +
        HL(31, 29.4, 3.2, 1, -6, 0.5),
    padJump: P('M23 31 Q35 28 47 31 L46 43 Q35 46 24 43Z', '#3f6fb5', 2.2) + L('M24 39.5 Q35 42.5 46 39.5', 2, '#fff'),
    saddleJump:
        P('M32 32.5 Q38 34 44 32.5 L45.4 40 Q39 42.4 33 40.4Z', '#c0793c', 2) +
        E(43.6, 36.4, 1.6, 3, '#a8693a', -14, 1.3) +
        P('M26 31 Q25.6 26.8 30 28.2 Q35 30.6 40 28.8 Q44.4 26.4 45.6 31 Q36 35 26 31Z', '#a8693a', 2.2) +
        HL(31, 29.6, 3.2, 1, -6, 0.55),
    padRace:
        P('M25 30 Q35 27 46 30 L45 45 Q35 48 26 45Z', '#fff', 2.2) +
        `<text x="35.5" y="42" font-size="11" font-weight="900" text-anchor="middle" fill="#c8453a" font-family="Nunito,sans-serif">7</text>`,
    saddleRace: P('M29 26 Q35 22 42 26 L41 31 Q35 34 30 31Z', MN, 2.2) + HL(33, 27, 3.4, 1.4, -8, 0.5),
    stirrup: L('M37 35 L37 47', 1.8, MN) + E(37, 49.4, 3, 2.2, '#c9ced6', 0, 1.7),
    bridle:
        L('M62 9 L69 19 M60 12 L64 20', 2, '#8e2f1f') +
        E(73, 20.5, 4.2, 3.4, 'none', -22, 2.2) +
        C(63, 11, 1.6, '#ffd23f', 1.1) +
        L('M76 24 Q62 31 46 30', 1.7, '#8e2f1f'),
    blanket:
        P('M13 33 Q35 25 58 33 L57 54 Q35 59 14 54Z', '#4f7aa8', 2.4) +
        L('M14 41 Q35 46 57 41 M14 48 Q35 53 57 48', 2, '#f6ecd2') +
        L('M27 30 L27 57 M44 30 L44 57', 1.2, 'rgba(255,255,255,.3)') +
        HL(24, 36, 6, 2, -10, 0.4),
    shoes: [22, 31, 47, 55]
        .map(
            x =>
                `<path d="M${x - 3.6} 71.5 Q${x} 78 ${x + 3.6} 71.5" fill="none" stroke="#3a2618" stroke-width="4.2" stroke-linecap="round"/><path d="M${x - 3.6} 71.5 Q${x} 78 ${x + 3.6} 71.5" fill="none" stroke="#dfe3ea" stroke-width="2.2" stroke-linecap="round"/>`,
        )
        .join(''),
};
const horseWith = (...pieces) => slimHorse() + pieces.join('');
export const horses = {
    nu: horseWith(),
    dressage: horseWith(gear.padDress, gear.saddleDress, gear.stirrup, gear.bridle),
    obstacle: horseWith(gear.padJump, gear.saddleJump, gear.stirrup, gear.bridle),
    course: horseWith(gear.padRace, gear.saddleRace, gear.bridle),
    couverture: horseWith(gear.blanket),
    ferre: horseWith(gear.shoes),
};

// ---------- les icônes (64 × 64) ----------
const raw = inner => inner;
const icons = {
    galop: raw(
        SHADOW(32, 58, 18, 2.5) +
            L('M3 20 L16 20 M0 32 L13 32 M4 44 L16 44', 3, '#e07a3f') +
            P('M22 8 L32 8 L32 40 Q32 44 36 44 Q40 44 40 40 L40 8 L50 8 L50 42 Q50 58 36 58 Q22 58 22 42Z', '#c9ced6', 2.6) +
            L('M24 10 L24 40', 1.6, 'rgba(255,255,255,.7)') +
            C(27, 20, 1.5, '#3a2618', 1) +
            C(27, 32, 1.5, '#3a2618', 1) +
            C(45, 20, 1.5, '#3a2618', 1) +
            C(45, 32, 1.5, '#3a2618', 1),
    ),
    endurance: raw(
        SHADOW(32, 58, 16, 2.5) +
            L('M22 16 Q10 28 14 46', 3, '#7a3f1e') +
            L('M42 16 Q54 28 50 46', 3, '#7a3f1e') +
            P('M20 18 Q32 8 44 18 Q52 30 48 46 Q44 56 32 56 Q20 56 16 46 Q12 30 20 18Z', '#c78a4a', 2.4) +
            P('M26 14 L38 14 L37 8 L27 8Z', '#7a4a2a', 2) +
            C(32, 36, 9, '#f6ecd2', 2) +
            P('M32 29 Q36 35 32 41 Q28 35 32 29Z', '#6ba3d6', 1.6) +
            HL(24, 26, 5, 2, -30, 0.5),
    ),
    dressage: raw(
        SHADOW(32, 58, 20, 2.5) +
            P('M10 46 Q10 44 14 44 L50 44 Q54 44 54 46 Q54 52 48 52 L16 52 Q10 52 10 46Z', '#2b2b35', 2.4) +
            P('M18 44 L18 18 Q18 10 32 10 Q46 10 46 18 L46 44Z', '#2b2b35', 2.4) +
            R(18, 36, 28, 6, 0, '#c8453a', 2) +
            P('M32 24 L34 28 L38 28 L35 31 L36 35 L32 33 L28 35 L29 31 L26 28 L30 28Z', '#ffd23f', 1.2) +
            HL(23, 22, 3, 8, -5, 0.35),
    ),
    saut: raw(
        SHADOW(32, 58, 22, 2.5) +
            L('M12 56 L12 18 M52 56 L52 18', 4, '#7a4a2a') +
            [
                [22, '#c8453a'],
                [32, '#fff'],
                [42, '#c8453a'],
            ]
                .map(([y, c], i) => R(10, y, 44, 8, 2, c, 2.2))
                .join('') +
            R(8, 52, 14, 8, 2, '#5fa84a', 2) +
            R(42, 52, 14, 8, 2, '#5fa84a', 2) +
            C(15, 50, 2.5, '#f6a5b5', 1.2) +
            C(49, 50, 2.5, '#ffd23f', 1.2),
    ),
    forme: raw(
        SHADOW(32, 58, 18, 2.5) +
            P('M32 56 C10 40 8 22 20 16 C26 13 31 17 32 22 C33 17 38 13 44 16 C56 22 54 40 32 56Z', '#5fa84a', 2.6) +
            HL(22, 24, 5, 3, -30, 0.55) +
            L('M24 34 L30 40 L42 28', 4, '#fff'),
    ),
    brosse: raw(
        SHADOW(32, 58, 22, 2.5) +
            P('M8 40 L56 40 L54 54 L10 54Z', '#f1e2b8', 2.2) +
            L('M14 40 L13 54 M20 40 L20 54 M26 40 L26 54 M32 40 L32 54 M38 40 L38 54 M44 40 L44 54 M50 40 L51 54', 1.5, '#a07a2a') +
            P('M6 22 Q6 14 16 14 L48 14 Q58 14 58 22 L58 36 Q58 40 54 40 L10 40 Q6 40 6 36Z', '#7a4a2a', 2.4) +
            P('M12 24 Q32 18 52 24 L52 32 Q32 38 12 32Z', '#a8693a', 1.6) +
            HL(20, 20, 9, 2, -4, 0.5),
    ),
    randonnee: raw(
        SHADOW(32, 58, 14, 2.5) +
            L('M32 56 L32 8', 4, '#7a4a2a') +
            P('M34 12 L56 12 L60 18 L56 24 L34 24Z', '#e8c26a', 2.2) +
            P('M30 28 L10 28 L6 34 L10 40 L30 40Z', '#f6ecd2', 2.2) +
            L('M38 18 L52 18', 2, '#3a2618') +
            L('M14 34 L26 34', 2, '#3a2618') +
            C(32, 8, 3, '#c8453a', 1.8),
    ),
    ecuries: raw(C(32, 32, 28, '#fff7e0', 2.6) + `<g transform="translate(6 6) scale(.62)">${stableInner()}</g>`, '0 0 64 64'),
    selle: raw(
        SHADOW(32, 58, 22, 2.5) +
            P('M16 44 L46 44 L44 58 Q30 62 18 58Z', '#8e4a22', 2.2) +
            L('M24 46 L24 58 M32 46 L32 59 M40 46 L39 58', 1.1, 'rgba(0,0,0,.25)') +
            P('M6 36 Q6 28 14 28 Q20 28 24 32 Q34 36 42 30 Q48 24 54 28 Q60 32 56 40 Q54 44 48 44 L12 44 Q6 42 6 36Z', '#c0793c', 2.4) +
            P('M14 30 Q20 28 24 32 Q30 35 34 34', 'none', 0) +
            HL(22, 34, 7, 2, -15, 0.55) +
            L('M50 44 L54 56', 2, '#3a2618') +
            E(55, 58, 3.5, 2.4, 'none', 0, 2),
    ),
};
function stableInner() {
    return (
        R(10, 40, 60, 28, 2, WALL, 2.6) +
        P('M4 42 L16 22 L64 22 L76 42Z', ROOF, 2.6) +
        R(24, 46, 12, 22, 2, DOOR, 2.2) +
        R(44, 46, 12, 22, 2, DOOR, 2.2) +
        `<g transform="translate(36 14)">${vane(0, 4)}</g>`
    );
}

// ---------- branchement dans le jeu ----------
// le cheval de sport (les écuries) : mêmes gènes d'apparence que le cheval du pré, un dessin plus fin
const EQUIP = {
    horseS: [],
    horseSdress: [gear.padDress, gear.saddleDress, gear.stirrup, gear.bridle],
    horseSjump: [gear.padJump, gear.saddleJump, gear.stirrup, gear.bridle],
    horseSrace: [gear.padRace, gear.saddleRace, gear.bridle],
    horseScover: [gear.blanket],
    horseSshoes: [gear.shoes],
};
for (const [id, pieces] of Object.entries(EQUIP)) animals[id] = () => horseWith(...pieces);
// pour être posés à la taille d'une icône (64 × 64) : bâtiment et icônes
const fit = (inner, s, dx, dy) => `<g transform="translate(${dx} ${dy}) scale(${s})">${inner}</g>`;
for (const lv of [0, 1, 2, 3]) ui['stable' + lv] = () => fit(stable(lv), 0.55, 0, 11);
Object.entries({
    hGalop: 'galop',
    hEndurance: 'endurance',
    hDressage: 'dressage',
    hSaut: 'saut',
    hForme: 'forme',
    hBrosse: 'brosse',
    hRando: 'randonnee',
    hSelle: 'selle',
    hEcuries: 'ecuries',
}).forEach(([id, k]) => {
    ui[id] = () => icons[k];
});
