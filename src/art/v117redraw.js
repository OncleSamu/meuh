// 1.17 : les kakis séchés, les lardons et huit plats redessinés.
import { C, E, F, FC, FE, HL, L, O, P, R, SHADOW, items, sub } from './kit.js';
import { woodBoard } from './items2.js';

// ---------------- kakis séchés : trois hoshigaki pendus à la ficelle ----------------
const KAKI = '#c4601e';
const KAKI_D = '#9a4616';
// un kaki qui sèche : rond un peu aplati, ridé, avec son chapeau de feuilles et une pointe de sucre blanc
function hoshi(x, y, s) {
    const g = (d, f, w) => P(d, f, w);
    return (
        `<g transform="translate(${x} ${y}) scale(${s})">` +
        L('M0 -22 L0 -15', 3.4) +
        L('M0 -22 L0 -15', 1.6, '#d9b878') +
        // le corps, ridé et plus étroit en bas
        g('M-10.5 -4 Q-11 -14 0 -15 Q11 -14 10.5 -4 Q11 8 4 13 Q0 15 -4 13 Q-11 8 -10.5 -4Z', KAKI, 2.3) +
        F('M-10.5 -4 Q-11 -14 0 -15 Q11 -14 10.5 -4 Q9 -9 0 -9 Q-9 -9 -10.5 -4Z', '#e0842e', 0.55) +
        L('M-6 -6 Q-4 0 -5 8 M0 -7 Q1 1 0 11 M6 -6 Q4 1 5 8', 1.3, KAKI_D) +
        FC(-4, 3, 1.1, '#fff4dc', 0.8) +
        FC(3, 6, 1, '#fff4dc', 0.7) +
        FC(6, -2, 0.9, '#fff4dc', 0.7) +
        HL(-6.5, -9, 2.6, 1.3, -30, 0.7) +
        // le chapeau
        g('M-8 -14 Q-4 -19 0 -16 Q4 -19 8 -14 Q4 -12 0 -13 Q-4 -12 -8 -14Z', '#6f9a3a', 1.9) +
        F('M-5 -15 Q-2 -17 0 -15', '#a8cf62', 0.8) +
        `</g>`
    );
}
items.driedKaki = () =>
    SHADOW(32, 61, 22, 2.2) +
    // la barre de séchage et ses deux cordes
    R(4, 6, 56, 5, 2, '#a8693a', 2.2) +
    FE(30, 7.6, 20, 0.9, '#fff', 0.5) +
    hoshi(13, 30, 0.82) +
    hoshi(32, 38, 0.92) +
    hoshi(51, 30, 0.82);

// ---------------- lardons : un tas de petits bâtonnets rayés sur une planche ----------------
const PINK = '#e07a6c';
const PINK_D = '#c8574c';
const FAT = '#f8e8d2';
function lardon(x, y, rot, w = 13) {
    const h = 5.6;
    return (
        `<g transform="translate(${x} ${y}) rotate(${rot})">` +
        R(-w / 2, -h / 2, w, h, 1.4, PINK, 1.8) +
        F(`M${-w / 2 + 0.6} ${-h / 2 + 1.6} L${w / 2 - 0.6} ${-h / 2 + 1.6} L${w / 2 - 0.6} ${-h / 2 + 3} L${-w / 2 + 0.6} ${-h / 2 + 3}Z`, FAT, 0.95) +
        F(`M${-w / 2 + 0.6} ${h / 2 - 1} L${w / 2 - 0.6} ${h / 2 - 1} L${w / 2 - 0.6} ${h / 2 - 0.2} L${-w / 2 + 0.6} ${h / 2 - 0.2}Z`, PINK_D, 0.9) +
        FE(-w / 4, -h / 2 + 0.9, 2.2, 0.5, '#fff', 0.7) +
        `</g>`
    );
}
items.lardons = () =>
    woodBoard() +
    lardon(20, 41, -14) +
    lardon(36, 43, 8) +
    lardon(46, 39, -22, 12) +
    lardon(14, 33, 12, 12) +
    lardon(28, 34, -6) +
    lardon(42, 31, 14, 12) +
    lardon(24, 25, 20, 11) +
    lardon(36, 23, -10, 12) +
    lardon(48, 24, 18, 10);

// ---------------- 1.17.4 : bananes, tartes, quiche, brioche, pain à l'ail, pissaladière, tian ----------------
const CRUST = '#e0a04a';
const CRUST_D = '#b8742a';
// le fond de tarte vu de trois quarts : bord cannelé, côté plissé, garniture au centre
function tarteBase(fill, rim = CRUST) {
    const flutes = Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return [32 + Math.cos(a) * 26.5, 39 + Math.sin(a) * 9.6];
    });
    return (
        SHADOW(32, 57, 26, 3) +
        P('M5.5 39 L58.5 39 L54 51 Q53 54.5 48 54.5 L16 54.5 Q11 54.5 10 51Z', '#d9913d', 2.4) +
        L('M12 43 L13.5 52 M20 44 L21 54 M28 45 L28.5 54.5 M36 45 L35.5 54.5 M44 44 L43 54 M52 43 L50.5 52', 1.3, CRUST_D) +
        E(32, 39, 27, 10.5, rim, 0, 2.4) +
        flutes.map(([x, y]) => FC(x, y, 1.7, '#f6c878')).join('') +
        E(32, 39, 21, 7.4, fill, 0, 2) +
        HL(18, 35, 5, 1.2, -8, 0.5)
    );
}
// une chantilly de meringue : pic blanc à pointe dorée
function pic(x, y, s, tip = '#e9b24f') {
    return (
        `<g transform="translate(${x} ${y}) scale(${s})">` +
        P('M-5.5 0 Q-6.5 -6 -2.5 -9 Q-2 -13 1 -16 Q2 -11 4 -9 Q7 -6 5.5 0Z', '#fffaf0', 2) +
        F('M-2.4 -9 Q-2 -13 1 -16 Q2 -12.5 3 -10.5 Q0 -11 -2.4 -9Z', tip, 0.9) +
        HL(-2.6, -4, 1.1, 2.4, 10, 0.8) +
        `</g>`
    );
}
items.lemonTart = () =>
    tarteBase('#ffd93a') +
    // la meringue sur toute la tarte
    [
        [23, 41, 0.75],
        [32, 43, 0.8],
        [41, 41, 0.75],
        [27, 37, 0.75],
        [37, 37, 0.75],
        [32, 34, 0.8],
    ]
        .map(([x, y, s]) => pic(x, y, s))
        .join('') +
    // un quartier de citron
    `<g transform="translate(50 22)">` +
    C(0, 0, 6.5, '#ffe36a', 2) +
    C(0, 0, 4.6, '#fff3b0', 1.2) +
    L('M0 -4.4 L0 4.4 M-4.4 0 L4.4 0 M-3.1 -3.1 L3.1 3.1 M3.1 -3.1 L-3.1 3.1', 0.9, '#f2c230') +
    `</g>`;

// la rhubarbe : bâtons roses coupés en tronçons, posés en éventail sous deux lanières de pâte
function tige(x, y, rot, len = 15) {
    return (
        `<g transform="translate(${x} ${y}) rotate(${rot})">` +
        R(-len / 2, -2.8, len, 5.6, 2.4, '#e2455d', 1.9) +
        F(`M${-len / 2 + 2} -1.2 L${len / 2 - 2} -1.2 L${len / 2 - 2} 0.2 L${-len / 2 + 2} 0.2Z`, '#f7a2ad', 0.9) +
        L(`M${-len / 2 + 2} 2 L${len / 2 - 2} 2`, 0.9, '#b02a40') +
        `</g>`
    );
}
items.rhubarbTart = () =>
    tarteBase('#f08a9a') +
    tige(24, 38, -18) +
    tige(34, 36, -4, 17) +
    tige(43, 39, 14) +
    tige(30, 42, 8, 14) +
    tige(39, 43, -14, 12) +
    L('M14 37 L50 44', 2.6, '#9a5a1e') +
    L('M14 37 L50 44', 1.5, '#f0c06a') +
    L('M17 43 L47 35', 2.6, '#9a5a1e') +
    L('M17 43 L47 35', 1.5, '#f0c06a');

// la quiche : appareil doré, épinards, une part déjà servie à côté
function epi(x, y, rot, s = 1) {
    return (
        `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
        P('M-4.5 0 Q-3 -4 1 -3.6 Q5 -3 4.5 0.5 Q3 4 -1 3.6 Q-4 3 -4.5 0Z', '#3f8a3a', 1.6) +
        F('M-2.5 -0.6 Q0 -2.4 2.6 -1.4', '#7cc23a', 0.9) +
        `</g>`
    );
}
items.spinachQuiche = () =>
    tarteBase('#f4d672') +
    FE(40, 37, 6, 2, '#d9a03a', 0.55) +
    FE(24, 41, 5, 1.8, '#d9a03a', 0.5) +
    epi(22, 38, 20) +
    epi(30, 35.5, -30, 1.1) +
    epi(38, 40, 40) +
    epi(45, 37, -10, 0.95) +
    epi(29, 42, 10) +
    epi(34, 37.5, 60, 0.8) +
    L('M20 10 Q17 6 20 2 M32 10 Q29 6 32 2 M44 10 Q41 6 44 2', 1.5, 'rgba(160,160,160,.8)');

// la brioche à tête : boule cannelée, petite tête, safran
items.saffronBrioche = () => {
    const body = 'M9 46 Q6 30 18 24 Q32 19 46 24 Q58 30 55 46 Q32 54 9 46Z';
    return (
        SHADOW(32, 57, 26, 3) +
        P(body, '#f0a824', 2.4) +
        F('M13 33 Q20 24 32 24 Q44 24 51 33 Q40 28 32 28 Q22 28 13 33Z', '#ffd25a', 0.8) +
        L('M20 28 Q16 38 18 49 M28 26 Q26 38 27 51 M36 26 Q38 38 37 51 M44 28 Q48 38 46 49', 1.4, '#c27a14') +
        // la tête de la brioche
        P('M24 24 Q22 12 32 12 Q42 12 40 24 Q32 28 24 24Z', '#f6b92e', 2.2) +
        F('M26 20 Q28 15 33 15 Q30 17 29 22Z', '#ffe08a', 0.8) +
        HL(27, 17, 2.4, 1.2, -30, 0.8) +
        HL(18, 34, 3.2, 6, -22, 0.55) +
        // les fils de safran
        L('M38 38 q3 -5 6 -3 M42 44 q4 -4 6 -1 M30 41 q2 -4 5 -3', 1.8, '#e2361b') +
        FC(33, 44, 1, '#fff6d0') +
        FC(46, 38, 1, '#fff6d0')
    );
};

// le pain à l'ail : demi-baguette ouverte, beurre persillé et grillé
items.garlicBread = () => {
    const half = (x, y, rot) =>
        `<g transform="translate(${x} ${y}) rotate(${rot})">` +
        R(-25, -7, 50, 14, 6.5, '#d9892f', 2.2) +
        R(-22.5, -4.6, 45, 9, 4, '#ffe9a8', 1.6) +
        F('M-21 -3 L21 -3 L21 0 L-21 0Z', '#ffd75a', 0.85) +
        [-16, -8, 0, 8, 16].map(a => L(`M${a - 2} -4 L${a + 2} 4`, 1.1, '#e6b84a')).join('') +
        [-18, -10, -3, 5, 12, 19].map((a, k) => FC(a, k % 2 ? 1.6 : -1.6, 1.2, '#4caf50')).join('') +
        `</g>`;
    return (
        woodBoard() + half(30, 33, -9) + half(32, 42, 5) + sub('garlic', 44, 8, 18) + L('M12 20 Q9 16 12 12 M22 22 Q19 18 22 14', 1.5, 'rgba(160,160,160,.75)')
    );
};

// la pissaladière : fond de pâte, onions fondantes, grille d'anchois, olives noires
items.pissaladiere = () => {
    const anch = (d, c) => L(d, 3.8, O) + L(d, 2, c);
    return (
        SHADOW(32, 58, 27, 3) +
        P('M6 40 L58 40 L58 49 Q58 52 54 52 L10 52 Q6 52 6 49Z', '#c98b2a', 2.4) +
        R(5, 22, 54, 24, 5, CRUST, 2.4) +
        R(9, 26, 46, 16, 3, '#e2a63e', 1.6) +
        L('M12 30 Q18 27 24 30 T36 30 T48 30 M12 35 Q18 32 24 35 T36 35 T48 35 M13 40 Q19 37 25 40 T37 40 T49 40', 1.3, '#b87a22') +
        FE(22, 29, 6, 1.2, '#fff', 0.45) +
        anch('M12 41 L52 27', '#8a6552') +
        anch('M12 27 L52 41', '#8a6552') +
        anch('M12 34 L52 34', '#8a6552') +
        [
            [22, 33],
            [32, 30],
            [42, 36],
            [32, 38],
            [20, 38],
            [44, 30],
        ]
            .map(([x, y]) => C(x, y, 3, '#3a3340', 1.8) + FC(x, y, 1, '#f3f0f5', 0.55) + FC(x - 1, y - 1, 0.7, '#fff', 0.8))
            .join('') +
        FC(26, 28, 0.9, '#5fb43a') +
        FC(47, 33, 0.9, '#5fb43a') +
        FC(16, 31, 0.9, '#5fb43a')
    );
};

// le tian : rangs de courgettes et de tomates en tranches serrées dans un plat de terre
items.tian = () => {
    const sl = (x, y, c, c2) => E(x, y, 4.3, 5.4, c, 0, 1.6) + E(x, y + 0.4, 2.6, 3.4, c2, 0, 0);
    const tr = [];
    // trois rangs concentriques, dessinés du fond vers l'avant
    for (const [rx, ry, n, off] of [
        [17, 5.6, 9, 0.2],
        [11, 3.6, 6, 0.5],
        [5, 1.8, 3, 0],
    ]) {
        for (let i = 0; i < n; i++) {
            const a = (i / n + off) * Math.PI * 2;
            tr.push([32 + Math.cos(a) * rx, 33 + Math.sin(a) * ry, i % 2]);
        }
    }
    tr.sort((a, b) => a[1] - b[1]);
    return (
        SHADOW(32, 58, 28, 3) +
        P('M5 36 L59 36 L55 52 Q54 55 49 55 L15 55 Q10 55 9 52Z', '#c8653a', 2.4) +
        F('M9 44 L55 44 L54.5 47 L9.5 47Z', '#e08650', 0.7) +
        E(32, 36, 28, 11.5, '#e08650', 0, 2.4) +
        E(32, 36, 24, 9, '#f0c470', 0, 1.8) +
        tr.map(([x, y, k]) => (k ? sl(x, y, '#e2412f', '#ee6a52') : sl(x, y, '#4f9a42', '#a8d36a'))).join('') +
        L('M46 24 q4 -3 6 0 M48 27 q4 -3 6 0', 1.5, '#4f8a3a') +
        FC(51, 23, 1, '#4f8a3a')
    );
};

// la banane : un régime de quatre bananes courbées autour d'un même cœur
const banane = (x, y, rot) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})">` +
    P('M-3 -2 Q-4 4 -2 12 Q2 28 10 36 Q14 40 17 38 L18 33 Q10 28 7 14 Q6 6 5 -2Z', '#ffd23a', 2.4) +
    F('M-1 2 Q-1.5 8 0.5 14 Q3 24 8 31 Q5 22 3.5 13 Q2.8 6 3 2Z', '#fff2a0', 0.7) +
    L('M2 6 Q4 20 12 32', 1, '#d9a210') +
    P('M16 36 Q19 37 20 41 Q20 43 17.5 41.5Z', '#5e3a1e', 1.8) +
    P('M-3 -2 L5 -2 L4.5 -6 L-2.5 -6Z', '#8a9a3a', 2) +
    `</g>`;
items.banana = () =>
    SHADOW(32, 58, 20, 3) +
    `<g transform="translate(9 6) scale(0.8)">` +
    banane(18, 14, 16) +
    banane(26, 13, 6) +
    banane(34, 13, -4) +
    banane(41, 14, -14) +
    P('M18 8 Q32 2 46 9 L45 15 Q32 9 19 15Z', '#7a8c34', 2.4) +
    F('M22 9 Q32 5 40 8 Q32 7 22 11Z', '#b6c862', 0.8) +
    `</g>`;
