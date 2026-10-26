// 1.50.2 : les fruits sur l'arbre redessinés (ils étaient de simples ronds) : pomme, orange, noix, châtaigne,
// mangue, citron vert, avocat, goyave, café, litchi. Chaque fruit est dessiné autour de (x, y), à la taille d'un fruit au verger.
import { C, E, F, FC, FE, L, P } from './kit.js';
import { fruitExtra } from './plants.js';

const stalk = (x, y, len = 4, c = '#6b3d1e') => L(`M${x} ${y} L${x + 0.6} ${y - len}`, 1.2, c);
const tinyLeaf = (x, y, rot = -30, c = '#4f9a3a') => `<g transform="translate(${x} ${y}) rotate(${rot})">` + P('M0 0 Q3 -2.4 6 0 Q3 2.4 0 0Z', c, 0.9) + `</g>`;
const shine = (x, y, r = 1.2) => FC(x, y, r, '#fff', 0.6);

Object.assign(fruitExtra, {
    // la pomme : rouge, joue jaune, queue et feuille
    apple: (x, y) =>
        stalk(x, y - 3.6) +
        P(
            `M${x} ${y - 3} Q${x - 5} ${y - 6} ${x - 5} ${y} Q${x - 4} ${y + 5} ${x} ${y + 4.4} Q${x + 4} ${y + 5} ${x + 5} ${y} Q${x + 5} ${y - 6} ${x} ${y - 3}Z`,
            '#e2412f',
            1.6,
        ) +
        FE(x + 2, y + 1.6, 1.8, 1.4, '#f2b23a', 0.7) +
        tinyLeaf(x + 0.6, y - 6, -20) +
        shine(x - 2.2, y - 1.4),
    // l'orange : peau grenue, petite feuille vert foncé
    orange: (x, y) =>
        C(x, y, 4.6, '#f5a623', 1.6) +
        [
            [-1.6, -1],
            [1.8, 0.4],
            [-0.6, 2],
            [1, -2.4],
        ]
            .map(([a, b]) => FC(x + a, y + b, 0.45, '#d9801a'))
            .join('') +
        tinyLeaf(x + 1, y - 4.4, -40, '#2f7a2a') +
        shine(x - 1.8, y - 1.8),
    // la noix : brou vert, parfois fendu sur la coquille brune
    walnut: (x, y) =>
        E(x - 2.4, y, 3.4, 3.8, '#8fbf5a', -10, 1.4) +
        FC(x - 3.4, y - 1.2, 0.6, '#c8e08a') +
        FC(x - 1.8, y + 1.4, 0.5, '#c8e08a') +
        E(x + 2.6, y + 1, 3.4, 3.8, '#7aaa4a', 10, 1.4) +
        P(
            `M${x + 1} ${y - 1} Q${x + 2.6} ${y - 3} ${x + 4.2} ${y - 1} Q${x + 4.4} ${y + 2.6} ${x + 2.6} ${y + 3} Q${x + 0.8} ${y + 2.6} ${x + 1} ${y - 1}Z`,
            '#b8925a',
            1,
        ) +
        L(`M${x + 2.6} ${y - 2} L${x + 2.6} ${y + 2.6}`, 0.6, '#7a5a30'),
    // la châtaigne : la bogue piquante, entrouverte sur deux châtaignes brillantes
    chestnut: (x, y) => {
        let o = '';
        for (let k = 0; k < 12; k++) {
            const a = (k * Math.PI) / 6;
            o += L(`M${x + 3.6 * Math.cos(a)} ${y + 3.6 * Math.sin(a)} L${x + 6 * Math.cos(a)} ${y + 6 * Math.sin(a)}`, 0.8, '#5f8a2e');
        }
        return (
            o +
            C(x, y, 4.2, '#9cc85a', 1.4) +
            P(`M${x - 2.6} ${y - 0.4} Q${x - 2.4} ${y - 3.4} ${x} ${y - 3.2} Q${x + 0.4} ${y} ${x - 2.6} ${y - 0.4}Z`, '#8a4a22', 0.9) +
            P(`M${x + 0.4} ${y - 0.2} Q${x + 1.6} ${y - 3.2} ${x + 3.2} ${y - 1.4} Q${x + 2.6} ${y + 1.4} ${x + 0.4} ${y - 0.2}Z`, '#9a5a2a', 0.9) +
            FC(x - 1.6, y - 2.2, 0.5, '#fff', 0.6)
        );
    },
    // la mangue : longue, en haricot, verte puis rouge-orangé, qui pend au bout de sa queue
    mango: (x, y) =>
        L(`M${x} ${y - 6} Q${x + 1} ${y - 3} ${x + 0.4} ${y - 2}`, 1.2, '#6b7a3a') +
        `<g transform="translate(${x} ${y + 2}) rotate(15)">` +
        P('M0 -5 Q4.4 -5 4.6 0 Q4.4 6 -0.4 6.4 Q-4 6 -3.8 1 Q-3.6 -2 -1 -2.4 Q-0.6 -4.6 0 -5Z', '#f2a23a', 1.4) +
        F('M-3.6 1 Q-3.4 5.6 -0.4 6 Q-2.6 3 -1.4 -2.2 Q-3.4 -1.6 -3.6 1Z', '#7ab04a', 0.85) +
        F('M2 -4 Q4.4 -3 4.4 1 Q3 -1 1 -2.6Z', '#e8503a', 0.7) +
        FC(1.6, -2.6, 0.9, '#fff', 0.5) +
        `</g>`,
    // le citron vert : petits ovales en grappe de deux, avec leur téton
    lime: (x, y) =>
        [
            [-2.2, 0, -20],
            [2.4, 1.4, 20],
        ]
            .map(
                ([a, b, r]) =>
                    `<g transform="translate(${x + a} ${y + b}) rotate(${r})">${E(0, 0, 3, 3.8, '#a8d83a', 0, 1.3)}${P('M-0.8 3.4 L0 4.8 L0.8 3.4Z', '#5f9a2a', 0.8)}${FC(-1, -1.2, 0.8, '#fff', 0.6)}</g>`,
            )
            .join('') + stalk(x, y - 3),
    // l'avocat : en poire, vert sombre et grenu, qui pend
    avocado: (x, y) =>
        L(`M${x} ${y - 6.4} L${x} ${y - 3.6}`, 1.2, '#6b5a2a') +
        P(
            `M${x} ${y - 4} Q${x + 2.4} ${y - 4} ${x + 2.6} ${y - 0.4} Q${x + 4.4} ${y + 2} ${x + 3.6} ${y + 4} Q${x + 2} ${y + 6.4} ${x} ${y + 6.2} Q${x - 2} ${y + 6.4} ${x - 3.6} ${y + 4} Q${x - 4.4} ${y + 2} ${x - 2.6} ${y - 0.4} Q${x - 2.4} ${y - 4} ${x} ${y - 4}Z`,
            '#2e3a1e',
            1.4,
        ) +
        [
            [-1.4, 2],
            [1.4, 3.6],
            [0.6, 0],
        ]
            .map(([a, b]) => FC(x + a, y + b, 0.45, '#6a7a4a'))
            .join('') +
        FC(x - 1.2, y - 1, 0.8, '#fff', 0.35),
    // la goyave : ronde-ovale, vert tendre rosé, la couronne du calice au bout
    guava: (x, y) =>
        E(x, y + 0.4, 4.2, 4.8, '#e6e27a', 0, 1.5) +
        FE(x + 1.4, y + 1.6, 2.4, 2.4, '#f0a0a0', 0.55) +
        P(`M${x - 1.4} ${y + 5} L${x - 0.6} ${y + 6.4} L${x} ${y + 5.2} L${x + 0.6} ${y + 6.4} L${x + 1.4} ${y + 5}Z`, '#6b8a3a', 0.8) +
        stalk(x, y - 4) +
        FC(x - 1.6, y - 1.6, 0.9, '#fff', 0.55),
    // le café : des cerises rouges et vertes serrées le long d'un rameau
    greenCoffee: (x, y) =>
        L(`M${x - 6} ${y - 3} Q${x} ${y - 1} ${x + 6} ${y + 2}`, 1.3, '#6b4a2a') +
        [
            [-4, -2, '#c8303a'],
            [-1.4, -0.8, '#e2412f'],
            [1.2, 0.4, '#c8303a'],
            [3.8, 1.6, '#9ac24a'],
            [-2.6, 1.6, '#e2412f'],
            [0.6, 3, '#d9364b'],
        ]
            .map(([a, b, c]) => C(x + a, y + b, 1.9, c, 0.9) + FC(x + a - 0.6, y + b - 0.6, 0.5, '#fff', 0.6))
            .join(''),
    // le litchi : une petite grappe de fruits rouges à la peau à écailles
    lychee: (x, y) => {
        const one = (a, b) =>
            C(x + a, y + b, 2.6, '#d9364b', 1.1) +
            [
                [-1, -0.8],
                [0.8, -1],
                [0, 0.6],
                [-1.2, 1],
                [1.2, 0.8],
            ]
                .map(([u, v]) => FC(x + a + u, y + b + v, 0.35, '#8a1a2a'))
                .join('');
        return (
            L(`M${x} ${y - 6} L${x - 2} ${y - 2} M${x} ${y - 6} L${x + 2.4} ${y - 1.6} M${x} ${y - 6} L${x} ${y + 1}`, 1, '#6b4a2a') +
            one(-2.4, -0.6) +
            one(2.6, 0) +
            one(0, 2.6)
        );
    },
});
export const ROUND_FIXED = ['apple', 'orange', 'walnut', 'chestnut', 'mango', 'lime', 'avocado', 'guava', 'greenCoffee', 'lychee'];
