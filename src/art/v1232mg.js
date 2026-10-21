// 1.23.2 : dessins des mini-jeux du haras (galop et saut) : cheval en mouvement, jockey, obstacles, repères. Validés le 21 octobre 2026.
import { C, E, F, FC, FE, HL, L, P, R, SHADOW, svg } from './kit.js';

const MN = '#3a2618',
    KB = '#a8693a',
    WOOD = '#7a4a2a',
    RED = '#c8453a';
const eyeS = (x, y) => FC(x, y, 1.9, MN) + FC(x + 0.7, y - 0.7, 0.7, '#fff');
const leg = (pts, c = '#8b5a2b') => {
    const d = `M${pts[0]} ${pts[1]} L${pts[2]} ${pts[3]} L${pts[4]} ${pts[5]}`;
    return L(d, 5.4) + L(d, 2.4, c) + FC(pts[4], pts[5], 2.2, MN);
};
// jambes : [arrière loin, arrière près, avant loin, avant près] ; chacune = hanche → genou → sabot
const POSES = {
    stand: [
        [23, 50, 22, 62, 22, 71],
        [31, 52, 31, 62, 31, 72],
        [47, 52, 47, 62, 47, 72],
        [54, 50, 55, 62, 55, 71],
    ],
    galA: [
        [22, 50, 12, 58, 3, 62],
        [30, 52, 20, 61, 11, 68],
        [47, 52, 58, 59, 66, 64],
        [54, 50, 64, 56, 72, 58],
    ],
    galB: [
        [22, 50, 28, 60, 22, 66],
        [30, 52, 36, 60, 30, 67],
        [47, 52, 50, 60, 44, 66],
        [54, 50, 56, 60, 52, 67],
    ],
    galC: [
        [22, 50, 14, 58, 12, 68],
        [30, 52, 24, 62, 20, 70],
        [47, 52, 54, 58, 58, 66],
        [54, 50, 62, 52, 68, 58],
    ],
    jump1: [
        [22, 50, 16, 60, 14, 70],
        [30, 52, 26, 62, 24, 71],
        [47, 52, 52, 60, 48, 66],
        [54, 50, 60, 56, 60, 62],
    ],
    jumpUp: [
        [22, 50, 12, 54, 6, 50],
        [30, 52, 20, 58, 12, 56],
        [47, 52, 58, 50, 54, 58],
        [54, 50, 64, 47, 60, 55],
    ],
    jumpLand: [
        [22, 50, 12, 54, 8, 60],
        [30, 52, 20, 58, 14, 64],
        [47, 52, 54, 62, 56, 70],
        [54, 50, 62, 60, 64, 69],
    ],
};
export const horsePose = (pose, { K = KB, rider = null, tailUp = 0 } = {}) => {
    const lg = POSES[pose];
    const tail = P(`M15 34 Q${1 - tailUp} ${37 - tailUp} ${3 - tailUp} ${64 - tailUp * 3} Q${8} 52 16 44Z`, MN, 2);
    return (
        SHADOW(36, 75, 26, 3) +
        leg(lg[0]) +
        leg(lg[1]) +
        tail +
        P('M13 37 Q13 30 21 30 L47 30 Q57 30 58 38 Q58 53 48 54 L24 54 Q13 53 13 37Z', K, 2.4) +
        leg(lg[2]) +
        leg(lg[3]) +
        P('M45 36 L53 10 Q57 5 62 8 L66 20 L58 42Z', K, 2.4) +
        P('M58 8 Q64 2 69 7 L77 19 Q79 25 74 26 L68 24 L61 17Z', K, 2.4) +
        P('M60 7 L59 0 L64 5Z', K, 2) +
        P('M53 9 Q42 18 43 36 L52 35 Q52 22 59 10Z', MN, 2) +
        eyeS(66, 11) +
        FE(75.5, 22.5, 1.3, 1, MN, 0.9) +
        HL(24, 38, 8, 3, -10, 0.45) +
        // tapis et selle
        P('M24 30 Q35 27 46 30 L45 46 Q35 49 25 46Z', '#fff', 2.2) +
        `<text x="35" y="42" font-size="11" font-weight="900" text-anchor="middle" fill="#c8453a" font-family="Nunito,sans-serif">7</text>` +
        P('M29 26 Q35 22 42 26 L41 31 Q35 34 30 31Z', MN, 2.2) +
        // bride
        L('M62 9 L69 19 M60 12 L64 20', 2, '#8e2f1f') +
        E(73, 20.5, 4.2, 3.4, 'none', -22, 2.2) +
        C(63, 11, 1.6, '#ffd23f', 1.1) +
        L('M76 24 Q64 30 52 26', 1.7, '#8e2f1f') +
        (rider ? jockey(rider) : '')
    );
};
// la jockey : penchée en avant, casque de couleur, bras vers les rênes
export const jockey = col =>
    // la jambe : culotte blanche puis botte noire, pied court dans l'étrier
    L('M36 27 L43 37', 6.4) +
    L('M36 27 L43 37', 3.6, '#fff') +
    L('M43 37 L40 46', 6.6) +
    L('M43 37 L40 46', 4, '#2b2b35') +
    E(41.5, 47.4, 4.2, 2.2, '#2b2b35', -8, 1.6) +
    // le buste penché en avant, aux couleurs de l'écurie
    P('M32 29 Q32 18 43 14 Q52 13 52 20 Q49 28 41 31 Q35 32 32 29Z', col, 2.2) +
    L('M35 28 Q40 21 47 17', 1.8, 'rgba(255,255,255,.65)') +
    HL(41, 17, 4, 1.6, -30, 0.5) +
    // le bras tendu vers les rênes, gant blanc
    L('M46 18 L55 25', 6, '#3a2618') +
    L('M46 18 L55 25', 3.6, col) +
    C(56.4, 25.8, 2.6, '#fff', 1.6) +
    // la tête : casque blanc à visière
    C(53.6, 10.4, 4.8, '#f2c9a0', 1.8) +
    FC(55.4, 11.6, 0.9, '#3a2618') +
    P('M48.6 10.6 Q49 3.8 56 5 Q59.2 7 58 10.4 L48.6 10.6Z', '#fff', 1.9) +
    L('M48.8 8 Q53 6 58 8.4', 1.4, col) +
    L('M57.4 9.8 L62 11.6', 2.8) +
    L('M57.4 9.8 L62 11.6', 1.2, '#fff');

export const horseSvg = (pose, o) => svg(horsePose(pose, o), '0 0 80 80');

// ---------- les obstacles (100 × 70) ----------
const pole = (x0, y, x1, c1 = RED, c2 = '#fff') => {
    let o = L(`M${x0} ${y} L${x1} ${y}`, 6.6) + L(`M${x0} ${y} L${x1} ${y}`, 3.4, c2);
    for (let x = x0 + 3; x < x1 - 2; x += 10) o += L(`M${x} ${y} L${x + 5} ${y}`, 3.4, c1);
    return o;
};
const post = (x, y0, y1, c = WOOD) => L(`M${x} ${y0} L${x} ${y1}`, 6) + L(`M${x} ${y0} L${x} ${y1}`, 3, c) + FC(x, y0, 2.6, '#e8c26a');
export const OBST = {
    vertical: () => SHADOW(50, 68, 40, 3) + post(14, 14, 66) + post(86, 14, 66) + pole(14, 22, 86) + pole(14, 36, 86, '#3f6fb5') + pole(14, 50, 86),
    oxer: () =>
        SHADOW(50, 68, 46, 3) +
        post(8, 26, 66) +
        post(34, 20, 66) +
        post(66, 20, 66) +
        post(92, 26, 66) +
        pole(8, 34, 34, RED) +
        pole(8, 50, 34, '#3f6fb5') +
        pole(66, 28, 92, RED) +
        pole(66, 44, 92, '#3f6fb5') +
        L('M34 22 L66 22', 3, '#8e2f1f'),
    mur: () =>
        SHADOW(50, 68, 40, 3) +
        R(12, 22, 76, 44, 3, '#c0793c', 2.4) +
        [30, 44, 58]
            .map(
                (y, i) =>
                    L(`M12 ${y} L88 ${y}`, 1.6, 'rgba(58,38,24,.5)') +
                    [0, 1, 2, 3, 4].map(k => L(`M${24 + k * 15 + (i % 2) * 7} ${y - 8} L${24 + k * 15 + (i % 2) * 7} ${y}`, 1.4, 'rgba(58,38,24,.5)')).join(''),
            )
            .join('') +
        R(8, 16, 84, 9, 2, '#e8d6aa', 2.2) +
        HL(24, 20, 8, 1.6, 0, 0.6) +
        C(30, 14, 4.5, '#f59ab1', 1.6) +
        C(52, 13, 4.5, '#ffd23f', 1.6) +
        C(72, 14, 4.5, '#fff', 1.6),
    riviere: () =>
        SHADOW(50, 68, 44, 3) +
        R(4, 40, 92, 26, 6, '#6ba3d6', 2.4) +
        L('M12 48 q6 -4 12 0 M40 54 q6 -4 12 0 M68 48 q6 -4 12 0 M24 60 q6 -4 12 0 M60 60 q6 -4 12 0', 1.8, 'rgba(255,255,255,.75)') +
        R(2, 34, 96, 8, 3, '#f6ecd2', 2.2) +
        L('M10 34 L10 42 M30 34 L30 42 M50 34 L50 42 M70 34 L70 42 M90 34 L90 42', 1.4, 'rgba(58,38,24,.4)') +
        post(8, 14, 36) +
        post(92, 14, 36) +
        pole(8, 22, 92, '#3f6fb5'),
    haie: () =>
        SHADOW(50, 68, 42, 3) +
        P('M8 66 L8 36 Q8 22 22 24 Q28 12 42 18 Q54 10 66 18 Q80 12 88 28 Q94 34 92 44 L92 66Z', '#5fa84a', 2.6) +
        [
            [20, 34],
            [38, 28],
            [58, 30],
            [76, 36],
            [28, 50],
            [50, 46],
            [70, 54],
            [84, 50],
            [16, 56],
        ].map(([x, y]) => FC(x, y, 3, '#7fc05a')) +
        [
            [30, 40],
            [64, 42],
            [48, 58],
        ].map(([x, y]) => C(x, y, 2.4, '#ffd23f', 1.2)) +
        HL(26, 26, 8, 3, -15, 0.45),
    barriere: () =>
        SHADOW(50, 68, 40, 3) +
        post(10, 18, 66, '#fff') +
        post(90, 18, 66, '#fff') +
        R(10, 24, 80, 9, 2, '#fff', 2.2) +
        R(10, 40, 80, 9, 2, '#fff', 2.2) +
        R(10, 56, 80, 8, 2, '#fff', 2.2) +
        L('M14 62 L86 28', 2.4, WOOD) +
        L('M14 28 L86 62', 2.4, WOOD),
    fleurie: () =>
        SHADOW(50, 68, 40, 3) +
        post(12, 16, 66) +
        post(88, 16, 66) +
        pole(12, 30, 88, '#f59ab1', '#fff') +
        R(18, 48, 64, 16, 3, '#a8693a', 2.2) +
        L('M24 52 L76 52', 1.2, 'rgba(255,255,255,.4)') +
        [
            [28, 44, '#ffd23f'],
            [40, 42, '#f59ab1'],
            [52, 44, '#fff'],
            [64, 42, '#e8364b'],
            [74, 44, '#b79ad8'],
        ]
            .map(([x, y, c]) => L(`M${x} ${y} L${x} 50`, 2, '#3f8f2e') + C(x, y, 4.2, c, 1.6) + FC(x, y, 1.4, '#ffd23f'))
            .join(''),
};
export const obstSvg = k => svg(OBST[k](), '0 0 100 74');
// la même, une barre à terre (faute)
export const obstFault = () =>
    svg(
        SHADOW(50, 68, 40, 3) +
            post(14, 14, 66) +
            post(86, 14, 66) +
            pole(14, 22, 86) +
            pole(14, 36, 86, '#3f6fb5') +
            L('M24 62 L78 70', 6.6) +
            L('M24 62 L78 70', 3.4, '#fff') +
            L('M34 63 L40 64.5 M54 66 L60 67.5', 3.4, RED),
        '0 0 100 74',
    );

// ---------- les icônes et repères du jeu (64 × 64) ----------
export const MG = {
    // l'anneau qui se resserre : la cible verte, l'anneau extérieur, le trait où appuyer
    anneau: () =>
        FC(32, 32, 28, 'rgba(255,255,255,.25)') +
        C(32, 32, 27, 'none', 3) +
        C(32, 32, 17, '#bfe6a8', 2.6) +
        C(32, 32, 9, '#6cc04a', 2.4) +
        FC(32, 32, 3, '#fff') +
        L('M32 2 L32 8 M32 56 L32 62 M2 32 L8 32 M56 32 L62 32', 2.2, '#c8453a'),
    parfait: () => P('M32 4 L39 22 L58 24 L44 37 L48 57 L32 47 L16 57 L20 37 L6 24 L25 22Z', '#ffd23f', 2.8) + HL(28, 22, 6, 3, -30, 0.7),
    bon: () => C(32, 32, 26, '#6cc04a', 2.8) + L('M18 33 L28 43 L47 22', 6, '#fff') + L('M18 33 L28 43 L47 22', 2.4, '#3f8f2e') + HL(24, 18, 8, 3, -20, 0.5),
    faute: () => C(32, 32, 26, '#c8453a', 2.8) + L('M20 20 L44 44 M44 20 L20 44', 6.4, '#fff') + HL(24, 17, 8, 3, -20, 0.45),
    // le cadran d'allure, avec sa zone verte
    allure: () =>
        SHADOW(32, 58, 22, 2.5) +
        P('M6 50 A26 26 0 0 1 58 50 L48 50 A16 16 0 0 0 16 50Z', '#fff7e0', 2.6) +
        P('M14 30 A26 26 0 0 1 28 25 L31 36 A16 16 0 0 0 23 39Z', '#e8c26a', 1.8) +
        P('M28 25 A26 26 0 0 1 44 28 L40 38 A16 16 0 0 0 31 36Z', '#6cc04a', 1.8) +
        P('M44 28 A26 26 0 0 1 56 40 L46 44 A16 16 0 0 0 40 38Z', '#c8453a', 1.8) +
        L('M32 50 L40 30', 3.6) +
        FC(32, 50, 4.6, '#c8453a') +
        FC(32, 50, 1.6, '#fff'),
    // le panneau de virage
    virage: () =>
        SHADOW(32, 60, 14, 2.5) +
        L('M32 60 L32 34', 5) +
        L('M32 60 L32 34', 2.4, '#7a4a2a') +
        P('M10 8 L54 8 Q58 8 58 12 L58 32 Q58 36 54 36 L10 36 Q6 36 6 32 L6 12 Q6 8 10 8Z', '#ffd23f', 2.8) +
        L('M16 28 L16 20 Q16 14 24 14 L40 14', 4.4, '#3a2618') +
        P('M38 8 L50 14 L38 20Z', '#3a2618', 1.4) +
        HL(14, 11, 6, 2, 0, 0.6),
    // la ligne d'arrivée : l'arche à damier
    arrivee: () =>
        SHADOW(32, 60, 26, 2.5) +
        L('M10 60 L10 14 M54 60 L54 14', 5.4) +
        L('M10 60 L10 14 M54 60 L54 14', 2.6, '#f6ecd2') +
        R(6, 8, 52, 16, 2, '#fff', 2.6) +
        [0, 1, 2, 3, 4, 5, 6, 7].map(k => F(`M${8 + k * 6.2} ${k % 2 ? 16 : 10} h6.2 v6 h-6.2Z`, '#3a2618')).join('') +
        [0, 1, 2, 3, 4, 5, 6, 7].map(k => F(`M${8 + k * 6.2} ${k % 2 ? 10 : 16} h6.2 v6 h-6.2Z`, '#fff')).join('') +
        R(6, 8, 52, 16, 2, 'none', 2.6),
    // le sprint : un éclair
    sprint: () => SHADOW(32, 58, 16, 2.5) + P('M36 4 L14 36 L28 36 L22 60 L48 26 L33 26Z', '#ffd23f', 2.8) + HL(28, 22, 4, 2, -50, 0.6),
    // le plan d'un parcours
    plan: () =>
        R(6, 8, 52, 48, 5, '#fff7e0', 2.6) +
        L('M14 44 Q20 18 32 30 Q44 42 50 16', 2.4, 'rgba(58,38,24,.55)') +
        [
            [14, 44, 1],
            [26, 24, 2],
            [38, 36, 3],
            [50, 16, 4],
        ]
            .map(
                ([x, y, n]) =>
                    C(x, y, 6.4, '#c8453a', 2) +
                    `<text x="${x}" y="${y + 3.4}" font-size="9" font-weight="900" text-anchor="middle" fill="#fff" font-family="Nunito,sans-serif">${n}</text>`,
            )
            .join(''),
    chrono: () =>
        SHADOW(32, 58, 18, 2.5) +
        C(32, 34, 22, '#fff7e0', 2.8) +
        R(28, 6, 8, 6, 2, '#a8693a', 2) +
        L('M32 34 L32 20 M32 34 L42 40', 3.4) +
        FC(32, 34, 2.4, '#c8453a') +
        L('M50 14 L54 10', 3),
};
export const mgSvg = k => svg(MG[k](), '0 0 64 64');
