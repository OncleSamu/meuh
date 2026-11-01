// 1.68 : l'hydromel. Un cruchon trapu en grès, bouché et cacheté de cire ; une bande de la couleur de son miel,
// l'étiquette montre son ingrédient principal (et les autres en médaillons), les étoiles de son accord.
import { C, F, L, P, R, SHADOW, HL, FE, sub, svg } from './kit.js';
import { HONEY_COL } from '../data/honey.js';

export function meadSvg(b) {
    const col = HONEY_COL[b.honey || 'all'] || HONEY_COL.all;
    const base = id => (b.bases && b.bases[id]) || id;
    const ings = b.ings || [];
    const main = ings.length ? base([...ings].sort((x, y) => y[1] - x[1])[0][0]) : 'honey';
    const aged = !!b.aged;
    const clay = aged ? '#b9a48a' : '#d9cbb2';
    const body = 'M24 14 L40 14 L40 19 Q52 24 52 40 Q52 58 32 59 Q12 58 12 40 Q12 24 24 19Z';
    const inner =
        SHADOW(32, 61, 18, 2.6) +
        // l'anse
        P('M45 24 Q57 25 56 36 Q55 44 48 45 L47 41 Q51 40 51.5 35 Q52 29 45 28.5Z', clay, 2) +
        P(body, clay) +
        // le grès : une glaçure bleue en haut, la bande de la couleur du miel
        F('M24.3 19.6 L39.7 19.6 Q46 22 48.5 27 L15.5 27 Q18 22 24.3 19.6Z', '#5a7fae', 0.85) +
        F('M13.2 29.5 L50.8 29.5 L51.2 37 L12.8 37Z', col, 0.95) +
        HL(19, 40, 2, 9, 0, 0.35) +
        // l'étiquette
        R(19, 38, 26, 17, 5, '#fffaf0', 1.6) +
        sub(main, 24.5, 38.5, 15) +
        ings
            .slice(1, 4)
            .map(([id], k) => C(20 + k * 12, 37.5, 4.2, '#fffaf0', 1.1) + sub(base(id), 16.2 + k * 12, 33.7, 7.6))
            .join('') +
        P(body, 'none') +
        // le bouchon cacheté de cire
        R(26, 7, 12, 8, 2.5, '#c9a070', 1.8) +
        P('M24.5 8 Q32 3 39.5 8 Q40 11 37 11 Q32 9.5 27 11 Q24 11 24.5 8Z', aged ? '#7a2a1a' : '#b8321f', 1.6) +
        FE(29.5, 7.5, 1.6, 0.9, '#fff', 0.35) +
        (aged ? L('M14 46 Q32 49 50 46', 1.2, '#8b6a44') : '') +
        [0, 1, 2]
            .map(k => (k < (b.stars || 0) ? P(`M${26 + k * 6} 52 l1 2 2.2 .3 -1.6 1.5 .4 2.2 -2 -1 -2 1 .4 -2.2 -1.6 -1.5 2.2 -.3Z`, '#ffd23f', 0.8) : ''))
            .join('');
    return svg(inner);
}
