// 1.76 : le salon du comptoir, vu de l'intérieur. Il s'agrandit avec son niveau (2 à 5 places)
// et montre les décors posés : plantes, lanternes, tapis, guirlande, enseigne.
// salonScene(lvl, decor) renvoie un <svg> 320 × 180 ; les cinq décors ont aussi leur icône (ui.decoPlant…).
import { ui, P, C, E, R, L, F, FC, HL, SHADOW, svg } from '../kit.js';

const WOOD = '#b9774a',
    WOOD_D = '#8a5434',
    CUP = '#fff7ee';

// ---------------- les décors, dessinés autour de (0, 0) ----------------
const plant = () =>
    SHADOW(0, 30, 13, 3) +
    P('M-11 12 L11 12 L8 30 L-8 30Z', '#d9734a', 2) +
    R(-13, 9, 26, 6, 2, '#e8885c', 2) +
    // grandes feuilles
    P('M0 10 Q-18 2 -17 -16 Q-6 -6 0 10Z', '#5fae3e', 2) +
    P('M0 10 Q18 0 16 -18 Q5 -6 0 10Z', '#6cc04a', 2) +
    P('M0 10 Q-4 -12 4 -26 Q9 -8 0 10Z', '#7fd05a', 2) +
    L('M0 10 Q-9 -2 -14 -12 M0 10 Q9 -3 13 -14 M0 10 Q1 -8 3 -20', 1.2, '#3f8f2e') +
    HL(-5, 18, 2, 4, 0, 0.35);

const lantern = (c = '#f2c14e') =>
    L('M0 -22 L0 -12', 1.6) +
    R(-6, -13, 12, 4, 1.5, '#5a3a24', 1.6) +
    P('M-7 -9 Q-9 0 -7 9 L7 9 Q9 0 7 -9Z', c, 2) +
    F('M-4 -7 Q-6 0 -4 7 L4 7 Q6 0 4 -7Z', '#fff3a0', 0.75) +
    L('M-3 -9 L-3 9 M3 -9 L3 9', 1, '#c9952a') +
    R(-6, 9, 12, 3.5, 1.5, '#5a3a24', 1.6) +
    FC(0, 0, 13, '#ffe48a', 0.18);

const rug = () =>
    E(0, 0, 58, 12, '#c8453a', 0, 2.2) +
    E(0, 0, 49, 9, '#e8885c', 0, 1.2) +
    E(0, 0, 36, 6, '#f2c14e', 0, 1.2) +
    E(0, 0, 18, 3, '#c8453a', 0, 1) +
    [-40, -20, 0, 20, 40].map(x => FC(x, -7.5, 1.4, '#fff7e0')).join('');

const bunting = (w = 200) => {
    const n = Math.max(3, Math.round(w / 22)),
        cols = ['#e0384a', '#ffd23f', '#5aa9e6', '#9be06b', '#f59ab1'];
    let s = L(`M0 0 Q${w / 2} 12 ${w} 0`, 1.4);
    for (let k = 0; k < n; k++) {
        const t = (k + 0.5) / n,
            x = t * w,
            y = 4 * 12 * t * (1 - t) * 0.5 + 0.5;
        s += P(`M${x - 6} ${y} L${x + 6} ${y} L${x} ${y + 11}Z`, cols[k % cols.length], 1.4);
    }
    return s;
};

const sign = () =>
    L('M-26 -16 L-20 -6 M26 -16 L20 -6', 1.6) +
    R(-34, -6, 68, 22, 5, WOOD, 2.2) +
    R(-30, -3, 60, 16, 3, '#d99a68', 1.2) +
    // une tasse fumante et deux feuilles de thé
    P('M-8 2 L8 2 Q8 10 0 10 Q-8 10 -8 2Z', CUP, 1.4) +
    L('M8 4 Q12 4 11 7 Q10 9 7 8', 1.2) +
    L('M-3 0 Q-5 -3 -3 -5 M3 0 Q1 -3 3 -5', 1, '#fff') +
    P('M-24 6 Q-20 0 -14 4 Q-19 10 -24 6Z', '#6cc04a', 1.2) +
    P('M24 6 Q20 0 14 4 Q19 10 24 6Z', '#6cc04a', 1.2);

// les icônes des décors (cartes de l'onglet Bâtiment)
const at = (s, x, y, k = 1) => `<g transform="translate(${x} ${y}) scale(${k})">${s}</g>`;
ui.decoPlant = () => at(plant(), 32, 30, 1);
ui.decoLamp = () => at(lantern(), 22, 36, 1.15) + at(lantern('#e8885c'), 44, 30, 1.05);
ui.decoRug = () => SHADOW(32, 42, 30, 4) + at(rug(), 32, 36, 0.52);
ui.decoGarland = () => at(bunting(56), 4, 14, 1) + L('M4 14 L4 54 M60 14 L60 54', 2, WOOD_D);
ui.decoSign = () => at(sign(), 32, 34, 0.85);

// ---------------- le salon ----------------
const chair = (x, y, flip = false) =>
    `<g transform="translate(${x} ${y})${flip ? ' scale(-1 1)' : ''}">` +
    R(-1, -26, 4, 26, 1.5, WOOD_D, 1.6) +
    R(-1, -26, 4, 10, 1.5, WOOD, 1.6) +
    R(-1, -6, 16, 4, 1.5, WOOD, 1.8) +
    L('M1 -2 L1 10 M13 -2 L13 10', 2.4, WOOD_D) +
    '</g>';
const table = (x, y) =>
    SHADOW(x, y + 22, 22, 3) +
    R(x - 22, y - 3, 44, 6, 3, '#d99a68', 2) +
    L(`M${x} ${y + 3} L${x} ${y + 21} M${x - 9} ${y + 21} L${x + 9} ${y + 21}`, 2.6, WOOD_D) +
    // une tasse et une théière sur la table
    P(`M${x - 13} ${y - 9} L${x - 5} ${y - 9} Q${x - 5} ${y - 3} ${x - 9} ${y - 3} Q${x - 13} ${y - 3} ${x - 13} ${y - 9}Z`, CUP, 1.3) +
    E(x + 8, y - 8, 7, 5, '#5aa9e6', 0, 1.4) +
    L(`M${x + 15} ${y - 9} L${x + 19} ${y - 13}`, 1.6) +
    C(x + 8, y - 13.5, 1.6, '#5aa9e6', 1.2);
const stool = x =>
    SHADOW(x, 160, 9, 2) +
    E(x, 128, 9, 3, '#e0384a', 0, 1.8) +
    L(`M${x - 5} 130 L${x - 7} 158 M${x + 5} 130 L${x + 7} 158 M${x - 6} 146 L${x + 6} 146`, 2, WOOD_D);

// le comptoir et sa machine à café
const bar = () =>
    R(10, 96, 92, 64, 4, WOOD, 2.4) +
    R(6, 90, 100, 9, 3, '#d99a68', 2.2) +
    [26, 50, 74].map(x => R(x - 9, 108, 18, 40, 3, '#c98458', 1.4)).join('') +
    HL(20, 94, 8, 1.5, 0, 0.4) +
    // la machine
    R(18, 62, 30, 28, 4, '#9aa6b0', 2) +
    R(22, 66, 22, 10, 2, '#cfd8de', 1.2) +
    L('M28 76 L28 82 M38 76 L38 82', 2.2) +
    R(25, 82, 6, 6, 1, CUP, 1.2) +
    C(33, 71, 2, '#e0384a', 1) +
    // bocaux de thé
    [62, 76, 90]
        .map(
            (x, k) =>
                R(x - 5, 74, 10, 16, 2.5, '#e8f6ff', 1.6) +
                F(`M${x - 3} 82 L${x + 3} 82 L${x + 3} 88 L${x - 3} 88Z`, ['#5fae3e', '#a8693a', '#e0384a'][k]) +
                R(x - 5.5, 72, 11, 3.5, 1.2, '#c9952a', 1.2),
        )
        .join('');

// les places : [table x, côté] ; la cinquième est un tabouret au comptoir
const SEATS = [
    [160, -1],
    [160, 1],
    [260, -1],
    [260, 1],
    ['stool', 0],
];

export function salonScene(lvl = 0, decor = {}) {
    const seats = Math.min(5, 2 + lvl);
    const tables = seats >= 3 ? [160, 260] : [160];
    let s =
        // le mur, la boiserie, le parquet
        `<rect width="320" height="180" fill="#f6e2b6"/>` +
        F('M0 0 H320 V8 H0Z', '#e8c38c') +
        `<rect y="104" width="320" height="22" fill="#e8c38c"/>` +
        L('M0 104 H320 M0 126 H320', 1.6, '#c9952a') +
        `<rect y="126" width="320" height="54" fill="#d99a68"/>` +
        [0, 1, 2, 3, 4, 5, 6, 7].map(k => L(`M${k * 44 + (k % 2) * 10} 126 L${k * 44 + (k % 2) * 10 - 14} 180`, 1, '#b9774a')).join('') +
        L('M0 150 H320', 1, '#b9774a') +
        // la fenêtre
        R(196, 22, 76, 56, 6, '#bfe6fb', 2.4) +
        F('M200 64 Q230 48 268 60 L268 74 L200 74Z', '#9bd96f') +
        L('M234 22 L234 78 M196 50 L272 50', 2) +
        R(192, 76, 84, 6, 2, WOOD, 2) +
        HL(210, 34, 6, 2, -20, 0.6);
    if (decor.rug) s += at(rug(), 212, 162, 1.25);
    if (decor.sign) s += at(sign(), 56, 30, 1);
    s += bar();
    tables.forEach(x => (s += table(x, 132)));
    SEATS.slice(0, seats).forEach(([x, side]) => {
        if (x === 'stool') s += stool(94);
        else s += chair(x + side * 34 - (side > 0 ? 0 : 14), 160, side > 0);
    });
    if (decor.plant) s += at(plant(), 306, 134, 0.8) + at(plant(), 128, 70, 0.6);
    if (decor.lamp) s += at(lantern(), 156, 44, 1) + at(lantern('#e8885c'), 296, 40, 0.95) + at(lantern(), 124, 30, 0.8);
    if (decor.garland) s += at(bunting(300), 10, 8, 1);
    return svg(s, '0 0 320 180', 'salon-scene');
}
