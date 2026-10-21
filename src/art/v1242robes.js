// Les robes, les marques et les trois âges du cheval (1.24.2), et les icônes de l'élevage.
import { C, E, FC, FE, HL, L, P, R, SHADOW, svg, animals, ui } from './kit.js';
import { gear } from './v123haras.js';
const MN = '#3a2618';
const eyeS = (x, y) => FC(x, y, 1.9, MN) + FC(x + 0.7, y - 0.7, 0.7, '#fff');
const leg = (d, c) => L(d, 5.4) + L(d, 2.4, c);
// les robes : corps, crins, jambes
export const ROBES = {
    bai: { name: 'Bai', K: '#a8693a', M: '#3a2618', G: '#4a2c18' },
    baibrun: { name: 'Bai brun', K: '#6b3a1e', M: '#2a1a10', G: '#2a1a10' },
    alezan: { name: 'Alezan', K: '#bf6228', M: '#8e3f1c', G: '#a24e1e' },
    noir: { name: 'Noir', K: '#35302f', M: '#1a1616', G: '#1a1616' },
    gris: { name: 'Gris', K: '#c9ced6', M: '#9aa3ad', G: '#aab1bb', dapple: true },
    palomino: { name: 'Palomino', K: '#e3b75e', M: '#f6ecd2', G: '#d9a94a' },
    isabelle: { name: 'Isabelle', K: '#d9a15a', M: '#3a2618', G: '#3a2618' },
    creme: { name: 'Crème', K: '#f1e3c2', M: '#fff7e0', G: '#e8d6aa' },
    rouan: { name: 'Rouan', K: '#8f5a45', M: '#3a2618', G: '#4a2c18', roan: true },
    aubere: { name: 'Aubère', K: '#b8683f', M: '#8e3f1c', G: '#a24e1e', roan: true },
    louvet: { name: 'Louvet', K: '#cfaa70', M: '#3a2618', G: '#3a2618', dorsal: true },
};
const WHITE = '#fffdf6';
// les marques blanches, posées sur le cheval de profil (repère de 80 × 80)
export const MARKS = {
    etoile: () => FE(69.4, 9.6, 1.9, 2.6, WHITE, 1, 40), // 1.24.3 : sur le front, plus sur l'œil
    liste: () => P('M62 9 Q66 12 70 17 Q74 22 75 25 L72 25 Q69 21 65 16 Q62 13 60 10Z', WHITE, 0).replace(`stroke="${MN}" stroke-width="0"`, ''),
    balzanes: () =>
        [
            [22, 71],
            [31, 72],
            [47, 72],
            [55, 71],
        ]
            .map(([x, y]) => L(`M${x} ${y - 8} L${x} ${y}`, 2.6, WHITE))
            .join(''),
    pie: () =>
        P('M18 36 Q22 30 30 34 Q34 40 28 46 Q20 48 18 40Z M40 32 Q48 30 52 36 Q54 44 46 48 Q38 44 40 36Z', WHITE, 1.6) +
        P('M46 20 Q52 18 55 26 L50 32 Q46 28 46 20Z', WHITE, 1.4),
    belleface: () => P('M60 8 Q66 5 70 9 L78 20 Q80 25 74 27 L68 25 L61 16Z', WHITE, 0).replace(`stroke="${MN}" stroke-width="0"`, ''),
    raie: () => L('M44 35 Q30 33 17 38', 2.4, '#4a2c18'),
    lave: () => '',
    appaloosa: () =>
        P('M13 36 Q20 31 31 33 Q36 42 30 51 Q19 53 14 44Z', WHITE, 1.6) +
        [
            [18, 38],
            [24, 36],
            [28, 42],
            [20, 46],
            [26, 48],
            [16, 42],
        ]
            .map(([x, y]) => FC(x, y, 1.7, '#3a2618'))
            .join(''),
};
export const horseR = (r0, marks = [], part = 'all') => {
    const r = marks.includes('lave') ? { ...r0, M: '#f0d9a0' } : r0;
    return horseR2(r, marks, part);
};
const horseR2 = (r, marks = [], part = 'all') =>
    part === 'head' ? headOf(r, marks) : (part === 'all' ? '' : '') + bodyOf(r, marks) + (part === 'all' ? headOf(r, marks) : '');
const speck = (pts, c = '#fffdf6') => pts.map(([x, y]) => FC(x, y, 1.1, c)).join('');
const ROAN_BODY = [
    [18, 38],
    [24, 34],
    [30, 42],
    [36, 36],
    [42, 44],
    [48, 38],
    [22, 48],
    [34, 50],
    [44, 33],
    [52, 46],
    [16, 44],
    [28, 33],
];
const bodyOf = (r, marks) =>
    SHADOW(36, 75, 26, 3) +
    leg('M23 50 L22 71', r.G) +
    leg('M31 52 L31 72', r.G) +
    leg('M47 52 L47 72', r.G) +
    leg('M54 50 L55 71', r.G) +
    [22, 31, 47, 55].map(x => L(`M${x - 1.6} 73 L${x + 1.6} 73`, 4, MN)).join('') +
    P('M15 34 Q1 38 3 66 Q8 52 16 44Z', r.M, 2) +
    P('M13 37 Q13 30 21 30 L47 30 Q57 30 58 38 Q58 53 48 54 L24 54 Q13 53 13 37Z', r.K, 2.4) +
    (r.dapple
        ? [
              [20, 40],
              [28, 36],
              [36, 44],
              [44, 38],
              [26, 48],
              [50, 44],
              [18, 33],
          ]
              .map(([x, y]) => E(x, y, 3.6, 2.2, '#aab1bb', 0, 0).replace(/ stroke="[^"]*" stroke-width="[^"]*"/, ''))
              .join('')
        : '') +
    (r.roan ? speck(ROAN_BODY) : '') +
    (r.dorsal ? MARKS.raie() : '') +
    marks
        .filter(m => ['balzanes', 'pie', 'appaloosa', 'raie'].includes(m))
        .map(m => MARKS[m]())
        .join('') +
    HL(24, 38, 8, 3, -10, 0.45);
const headOf = (r, marks) =>
    P('M45 36 L53 10 Q57 5 62 8 L66 20 L58 42Z', r.K, 2.4) +
    P('M58 8 Q64 2 69 7 L77 19 Q79 25 74 26 L68 24 L61 17Z', r.K, 2.4) +
    P('M60 7 L59 0 L64 5Z', r.K, 2) +
    P('M53 9 Q44 20 46 38 L52 35 Q52 22 59 10Z', r.M, 2) +
    (r.roan
        ? speck([
              [56, 14],
              [60, 20],
              [52, 24],
              [64, 24],
              [49, 30],
              [68, 16],
          ])
        : '') +
    marks
        .filter(m => ['etoile', 'liste', 'belleface'].includes(m))
        .map(m => MARKS[m]())
        .join('') +
    eyeS(66, 11) +
    FE(75.5, 22.5, 1.3, 1, MN, 0.9);
export const horseRSvg = (k, marks) => svg(horseR(ROBES[k], marks), '0 0 80 80');
// ---------- les trois âges ----------
export const foalOf = (r, stage) => foal(r, stage);
// 1.24.3 : le poulain garde ses marques et ses crins lavés ; il est remonté pour que les sabots et l'ombre tiennent dans le cadre
export const foal = (r0, stage, marks = []) => {
    const r = marks.includes('lave') ? { ...r0, M: '#f0d9a0' } : r0;
    return stage === 0
        ? `<g transform="translate(8 18) scale(0.74)">${bodyOf(r, marks)}</g><g transform="translate(-2.5 10.4) scale(0.95)">${headOf(r, marks)}</g>`
        : `<g transform="translate(5 8) scale(0.88)">${horseR(r, marks)}</g>`;
};
export const foalSvg = (k, stage) => svg(foal(ROBES[k], stage), '0 0 80 80');
// ---------- icônes (64 × 64) ----------
const ic = inner => svg(inner, '0 0 64 64');
export const IC = {
    saillie: () =>
        SHADOW(32, 58, 20, 2.5) +
        P('M32 54 C10 38 8 18 20 12 C26 9 31 13 32 18 C33 13 38 9 44 12 C56 18 54 38 32 54Z', '#f59ab1', 2.6) +
        L('M24 24 Q32 34 40 24', 2.4, '#fff') +
        HL(22, 20, 5, 3, -30, 0.55),
    retraite: () =>
        SHADOW(32, 58, 22, 2.5) +
        P('M8 38 Q8 24 32 24 Q56 24 56 38 L56 46 L8 46Z', '#6cc04a', 2.6) +
        L('M14 38 Q32 32 50 38', 2, '#fff') +
        [
            [16, 30],
            [26, 26],
            [38, 26],
            [48, 30],
        ]
            .map(([x, y], i) => C(x, y, 3.2, ['#e8364b', '#ffd23f', '#fff', '#f59ab1'][i], 1.6))
            .join('') +
        R(18, 46, 28, 10, 3, '#a8693a', 2.4) +
        L('M24 51 L40 51', 2, '#ffd23f'),
    arbre: () =>
        SHADOW(32, 60, 20, 2.5) +
        L('M32 56 L32 30 M32 40 L16 24 M32 40 L48 24 M16 24 L10 12 M16 24 L22 12 M48 24 L42 12 M48 24 L54 12', 3.6, '#7a4a2a') +
        [
            [10, 10],
            [22, 10],
            [42, 10],
            [54, 10],
            [32, 26],
        ]
            .map(([x, y], i) => C(x, y, 5.6, i === 4 ? '#ffd23f' : '#6cc04a', 2))
            .join(''),
    ecusson: () =>
        SHADOW(32, 60, 20, 2.5) +
        P('M32 4 L56 12 L56 34 Q56 52 32 60 Q8 52 8 34 L8 12Z', '#3f6fb5', 2.8) +
        P('M32 10 L50 16 L50 34 Q50 47 32 54 Q14 47 14 34 L14 16Z', '#fff7e0', 2) +
        P('M32 16 L35 24 L43 24 L37 29 L39 37 L32 32 L25 37 L27 29 L21 24 L29 24Z', '#ffd23f', 1.8),
    couronne: () =>
        SHADOW(32, 58, 22, 2.5) +
        C(32, 34, 18, 'none', 6).replace(`stroke="${MN}"`, 'stroke="#3f8f2e"') +
        C(32, 34, 18, 'none', 2) +
        [
            [14, 34, '#e8364b'],
            [22, 18, '#ffd23f'],
            [42, 18, '#fff'],
            [50, 34, '#f59ab1'],
            [32, 52, '#c07ae0'],
        ]
            .map(([x, y, c]) => C(x, y, 4.4, c, 1.8))
            .join(''),
    cadre: () => SHADOW(32, 60, 22, 2.5) + R(8, 8, 48, 46, 4, '#a8693a', 2.8) + R(14, 14, 36, 34, 2, '#bfe6f5', 2) + R(24, 54, 16, 6, 2, '#ffd23f', 1.8),
    poulain: () => SHADOW(32, 58, 18, 2.5) + `<g transform="scale(0.8) translate(6 6)">${foal(ROBES.alezan, 0)}</g>`,
};
export const icSvg = k => ic(IC[k]());

// ---------- branchement dans le jeu ----------
// la clé « bai.etoile+balzanes.1 » (robe, marques, âge : 0 poulain, 1 jeune, rien ou 2 adulte) arrive dans o.robe, o.marks, o.stage
const PIECES = {
    horse: [],
    horseS: [],
    horseSdress: [gear.padDress, gear.saddleDress, gear.stirrup, gear.bridle],
    horseSjump: [gear.padJump, gear.saddleJump, gear.stirrup, gear.bridle],
    horseSrace: [gear.padRace, gear.saddleRace, gear.bridle],
    horseScover: [gear.blanket],
    horseSshoes: [gear.shoes],
};
// la toison du pré : crins longs ou frisés
const COATFX = (r, c) => (c === 1 ? P('M12 38 Q0 46 4 70 Q8 58 15 48Z', r.M, 2) + P('M58 12 Q46 22 46 44 L54 36 Q56 24 63 15Z', r.M, 2) : '');
for (const [id, pieces] of Object.entries(PIECES)) {
    const old = animals[id];
    animals[id] = (o = {}) => {
        const r = o.robe && ROBES[o.robe];
        if (!r) return old ? old(o) : '';
        const marks = o.marks || [];
        if (o.stage === 0 || o.stage === 1) return foal(r, o.stage, marks);
        return horseR(r, marks) + (o.coat === 1 ? COATFX(r, 1) : '') + pieces.join('');
    };
}
Object.assign(ui, {
    hSaillie: IC.saillie,
    hRetraite: IC.retraite,
    hArbre: IC.arbre,
    hEcusson: IC.ecusson,
    hCouronne: IC.couronne,
    hCadre: IC.cadre,
    hPoulain: IC.poulain,
});
