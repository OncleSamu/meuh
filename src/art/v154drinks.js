// 1.54 : les huit boissons de l'oasis, avec les mêmes tasses que le reste du comptoir.
import { E, F, FC, FE, L, P, R, SHADOW, sub, items } from './kit.js';
import { tea, slice, espresso, mug, glassMug } from './v117drinks.js';

// le verre à thé du désert : petit, ciselé, plein de menthe
const glass = (liquid, extra = '') =>
    SHADOW(32, 58, 20, 3) +
    P('M17 22 L47 22 L43 54 Q43 57 40 57 L24 57 Q21 57 21 54Z', '#f4fbff') +
    F('M18.2 30 L45.8 30 L43 53.6 Q43 55 40 55 L24 55 Q21 55 21 53.6Z', liquid) +
    P('M17 22 L47 22 L43 54 Q43 57 40 57 L24 57 Q21 57 21 54Z', 'none') +
    L('M20 36 L44 36', 1, '#d6b65a') +
    L('M21 46 L43 46', 1, '#d6b65a') +
    F('M20 25 L23 25 L25 53 L22.4 53Z', '#fff', 0.55) +
    extra;
const mintSprig = (x, y) =>
    L(`M${x} ${y + 8} L${x} ${y}`, 1.6, '#2f7a2a') +
    P(`M${x} ${y + 2} Q${x - 9} ${y - 2} ${x - 8} ${y - 8} Q${x - 1} ${y - 7} ${x} ${y + 2}Z`, '#6cc04a', 1.4) +
    P(`M${x} ${y + 3} Q${x + 9} ${y - 1} ${x + 8} ${y - 7} Q${x + 1} ${y - 6} ${x} ${y + 3}Z`, '#8fd16a', 1.4);

const D = {
    desertTea: glass('#8fbf4a', mintSprig(32, 12) + L('M26 8 Q24 3 27 0 M38 8 Q36 3 39 0', 1.6, 'rgba(255,255,255,.9)')),
    dateTea: tea('#b0703a', sub('date', 40, 2, 22)),
    jujubeTisane: tea('#c0452a', sub('jujube', 40, 2, 22)),
    bitterOrangeTea: tea('#e8913a', slice(50, 18, '#e2681a', '#ffc070')),
    dateCoffee: espresso('#4a2a14', sub('date', 38, 34, 22)),
    sesameMilk: glassMug(
        '#e8d8b0',
        P('M14 17 Q16 9 29 9 Q42 9 44 17 Q29 22 14 17Z', '#fffaf0', 1.8),
        R(22, 34, 8, 8, 2, '#ffffff', 1.4) +
            R(31, 42, 8, 8, 2, '#ffffff', 1.4) +
            FC(25, 26, 1.4, '#7a5a2a') +
            FC(33, 29, 1.4, '#7a5a2a') +
            FC(38, 25, 1.4, '#7a5a2a'),
    ),
    camelDate: mug('#e6c89a', E(29, 18, 12, 2.6, '#fffaf0', 0, 0) + sub('date', 20, 6, 18), sub('date', 34, 38, 20), '#e9d9b8'),
    saffronMilk: mug(
        '#f0b640',
        FE(29, 18, 9, 1.8, '#f8d27a', 0.9) + L('M22 16 L26 19 M30 15 L34 19 M26 14 L30 18', 1, '#e0520a'),
        P('M40 40 Q44 34 48 40 Q44 44 40 40Z', '#e0520a', 1.4) + L('M44 34 L44 30', 1.4, '#c0410a'),
        '#f5e6c8',
    ),
};
Object.keys(D).forEach(k => (items[k] = () => D[k]));
export const OASIS_DRINKS = Object.keys(D);
