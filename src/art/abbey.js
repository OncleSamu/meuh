// L'abbaye (1.6) : l'orge, les malts, la malterie, les bâtiments, la carte, Frère Hugues et Agnès, et les bières.
import {
    BLD,
    KINDS,
    C,
    E,
    F,
    FC,
    G,
    GL,
    HL,
    L,
    P,
    R,
    SHADOW,
    leaf,
    mound,
    stem,
    sub,
    svg,
    items,
    machines,
    people,
    ui,
    youngExtra,
    readyExtra,
} from './kit.js';
import { bust, face } from './people.js';
import { house2 } from './buildings2.js';
import { MAP_BG } from './maps.js';
import { MALTS } from '../data/abbey.js';

const SKIN = '#f6c9a0';
const BARLEY = '#e8c060';

// ======================= l'orge et les malts =======================
// un épi d'orge : grains en épi serré et longues barbes
const ear = (x, y, s = 1, rot = 0, c = BARLEY) => {
    let o = `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` + L('M0 18 L0 -12', 1.6, '#b8902a');
    for (let k = 0; k < 6; k++) {
        const yy = 12 - k * 4.4;
        o += E(-2.4, yy, 2.2, 3.2, c, -25, 1.2) + E(2.4, yy - 1.6, 2.2, 3.2, c, 25, 1.2);
        o += L(`M-3.4 ${yy - 2.6} L-7 ${yy - 13} M3.4 ${yy - 4.2} L7 ${yy - 15}`, 0.8, '#c9a040');
    }
    return o + '</g>';
};
const RAW = {
    barley: () => SHADOW(32, 58, 16, 3) + ear(24, 38, 1, -14) + ear(40, 38, 1, 14) + ear(32, 32, 1.1, 0) + L('M22 52 Q32 56 42 52', 2.6, '#d9a066'),
};
// un sac de jute ouvert sur des grains de malt, plus ou moins grillés
const maltSack = c =>
    SHADOW(32, 58, 18, 3) +
    P('M17 58 Q11 42 18 27 L22 19 L42 19 L46 27 Q53 42 47 58Z', '#d8c08a') +
    L('M20 30 Q32 34 44 30 M19 44 Q32 48 45 44', 1.2, '#b89a5a') +
    E(32, 19, 11, 4.5, c) +
    [
        [25, 18],
        [30, 17],
        [35, 18],
        [39, 19],
        [28, 21],
        [33, 21],
    ]
        .map(([x, y]) => E(x, y, 1.8, 1.1, c, 20, 0.8) + FC(x - 0.5, y - 0.4, 0.4, '#fff', 0.5))
        .join('') +
    P('M22 20 L18 11 L27 15Z', '#d8c08a', 2) +
    P('M42 20 L46 11 L37 15Z', '#d8c08a', 2) +
    L('M21 23 Q32 27 43 23', 2.4, '#8b5a2b') +
    C(32, 43, 9, c, 2) +
    E(32, 43, 3.2, 5, '#fffaf0', 30, 1) +
    L('M30 40 L34 46', 0.9, 'rgba(58,38,24,.5)');
Object.assign(items, RAW, {
    maltBlond: () => maltSack(MALTS.maltBlond.color),
    maltAmber: () => maltSack(MALTS.maltAmber.color),
    maltBrown: () => maltSack(MALTS.maltBrown.color),
    maltBlack: () => maltSack(MALTS.maltBlack.color),
});
Object.assign(youngExtra, {
    barley: () => mound() + [24, 32, 40].map((x, k) => leaf(x, 56, 18, -100 + k * 10, k % 2 ? GL : G, 0.18)).join(''),
});
Object.assign(readyExtra, {
    barley: () =>
        mound() +
        [20, 28, 36, 44]
            .map(
                (x, k) =>
                    stem(`M${x} 56 Q${x - 2} 40 ${x + (k % 2 ? 2 : -2)} 26`, '#c9a040', 1.2) +
                    ear(x + (k % 2 ? 2 : -2), 20 + (k % 2) * 3, 0.62, k % 2 ? 12 : -12),
            )
            .join(''),
});

// ======================= la malterie =======================
machines.malthouse = () =>
    SHADOW(32, 60, 28, 3) +
    // le four à touraille, son toit en pointe et sa fumée
    R(8, 26, 30, 32, 2, '#d8c8a8') +
    L('M8 36 L38 36 M8 46 L38 46 M18 26 L18 36 M28 36 L28 46 M18 46 L18 58', 1, 'rgba(58,38,24,.25)') +
    P('M6 28 L23 8 L40 28Z', '#a8432a') +
    R(20, 2, 6, 8, 1, '#8b5a2b', 1.8) +
    L('M23 0 Q20 -4 24 -8', 1.6, '#c8c8c8') +
    R(16, 44, 14, 14, 6, '#3a2618') +
    FC(23, 52, 4, '#e8792a', 0.9) +
    // l'aire de germination et ses grains
    R(38, 44, 22, 12, 2, '#c08b52') +
    [42, 46, 50, 54, 44, 48, 52, 56]
        .map((x, k) =>
            E(x, k < 4 ? 47 : 51, 1.6, 1, [MALTS.maltBlond.color, MALTS.maltAmber.color, MALTS.maltBrown.color, MALTS.maltBlack.color][k % 4], 20, 0.8),
        )
        .join('') +
    sub('barley', 40, 22, 20);

// ======================= les icônes =======================
// une chope moussue
ui.beer = () =>
    SHADOW(32, 59, 16, 3) +
    P('M14 20 L44 20 L42 56 Q42 59 39 59 L19 59 Q16 59 16 56Z', '#f2b02a') +
    F('M18 24 L22 24 L21 54 L19 54Z', '#fff', 0.45) +
    L('M24 30 L24 52 M32 30 L32 52', 1, 'rgba(58,38,24,.25)') +
    P('M44 28 Q56 28 56 38 Q56 48 43 48', 'none', 3.6) +
    L('M44 28 Q56 28 56 38 Q56 48 43 48', 1.6, '#fff6e0') +
    P('M12 22 Q10 12 18 12 Q20 6 28 8 Q34 4 40 9 Q48 8 46 18 Q46 24 40 22 L16 24Z', '#fffaf0', 2) +
    FC(22, 15, 1.6, '#fff') +
    FC(36, 13, 1.2, '#fff');
// une cuve de cuivre
ui.vat = () =>
    SHADOW(32, 59, 18, 3) +
    P('M14 22 Q14 14 32 14 Q50 14 50 22 L50 50 Q50 58 32 58 Q14 58 14 50Z', '#d98b3a') +
    E(32, 22, 18, 6, '#e8a548') +
    L('M14 36 Q32 42 50 36', 2, '#a8531f') +
    HL(22, 34, 2, 8, 0, 0.5) +
    R(28, 6, 8, 9, 2, '#d98b3a', 2) +
    L('M50 44 L58 44 L58 50', 2.4);

// ======================= une bouteille de bière =======================
// la couleur du malt, l'étiquette crème avec l'ingrédient principal, la capsule et les étoiles d'accord
export function beerSvg(b) {
    const c = (MALTS[b.malt] || MALTS.maltBlond).color;
    const main = b.ings && b.ings.length ? [...b.ings].sort((x, y) => y[1] - x[1])[0][0] : 'barley';
    const body = 'M27 4 L37 4 L37 16 Q46 22 46 30 L46 56 Q46 60 42 60 L22 60 Q18 60 18 56 L18 30 Q18 22 27 16Z';
    const aged = !!b.aged;
    const inner =
        SHADOW(32, 61, 15, 2.4) +
        P(body, aged ? '#5a3a20' : '#7a4a1a') +
        F('M19.4 30 Q32 27 44.6 30 L44.6 56 Q44.6 58.6 42 58.6 L22 58.6 Q19.4 58.6 19.4 56Z', c, 0.92) +
        R(20, 34, 24, 18, 4, '#fffaf0', 1.6) +
        L('M22 49 L42 49', 1.4, c) +
        sub(main, 24, 34, 15) +
        (b.ings && b.ings.length > 1
            ? b.ings
                  .slice(1)
                  .map(([id], k) => C(23 + k * 18, 33, 3.6, '#fffaf0', 1.2) + sub(id, 20 + k * 18, 30, 6))
                  .join('')
            : '') +
        F('M20.5 28 L23 26 L23 54 L20.5 54Z', '#fff', 0.4) +
        P(body, 'none') +
        R(26, 0, 12, 6, 2, aged ? '#8b5a2b' : '#c8453a') +
        (aged ? L('M18 40 L46 40', 1.2, '#d8b070') : '') +
        [0, 1, 2]
            .map(k => (k < (b.stars || 0) ? P(`M${26 + k * 6} 56.5 l1 2 2.2 .3 -1.6 1.5 .4 2.2 -2 -1 -2 1 .4 -2.2 -1.6 -1.5 2.2 -.3Z`, '#ffd23f', 0.8) : ''))
            .join('');
    return svg(inner);
}

// ======================= les bâtiments =======================
const BARREL = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    P('M-6 -14 Q-8 -7 -6 0 L6 0 Q8 -7 6 -14Z', '#a8693a', 1.8) +
    L('M-7 -10 L7 -10 M-7 -4 L7 -4', 1.6) +
    HL(-3, -9, 1.2, 3, 0, 0.4) +
    '</g>';
const hopVine = (x, y) =>
    L(`M${x} ${y} L${x} ${y - 26}`, 1.6, '#8b5a2b') +
    [6, 12, 18, 24].map((d, k) => E(x + (k % 2 ? 3 : -3), y - d, 2.4, 3.2, '#9ad06a', k % 2 ? 20 : -20, 1.1)).join('');
const bell = ({ y0, rh, ruin, g }) =>
    R(45, y0 - rh - 14, 10, 14, 1, g('#f2e6d0'), 2) +
    P(`M43 ${y0 - rh - 14} L50 ${y0 - rh - 24} L57 ${y0 - rh - 14}Z`, g('#7a4a2a'), 1.8) +
    (ruin ? '' : P(`M47.5 ${y0 - rh - 4} Q47.5 ${y0 - rh - 10} 50 ${y0 - rh - 10} Q52.5 ${y0 - rh - 10} 52.5 ${y0 - rh - 4}Z`, '#e2a548', 1.2)) +
    (ruin ? '' : L(`M50 ${y0 - rh - 24} L50 ${y0 - rh - 30} M47.5 ${y0 - rh - 27} L52.5 ${y0 - rh - 27}`, 1.6));
const STONE = '#e2d6bc';
const ABBEY_BLD = {
    malthouse: {
        cfg: { w: 58, h: 34, wall: STONE, roof: '#a8432a', sign: ['item', 'maltAmber'] },
        st: {
            tex: 'stone',
            chim: 'r',
            tall: true,
            door: 'barn',
            wins: [27, 62],
            props: ({ x0 }) => R(x0 - 4, 76, 10, 10, 2, '#d8c08a', 1.6) + R(x0 - 2, 70, 8, 8, 2, '#d8c08a', 1.6),
            hang: 'l',
            noFlowers: true,
        },
    },
    brewhall: {
        cfg: { w: 66, h: 40, wall: STONE, roof: '#7a4a2a', sign: ['ui', 'beer'], floors: 2 },
        st: { tex: 'stone', warch: true, door: 'arch', wins: [23, 66], top: bell, props: ({ x0, x1 }) => BARREL(x0 + 4, 86, 0.8) + BARREL(x1 - 4, 86, 0.8) },
    },
    fermenters: {
        cfg: { w: 56, h: 30, wall: '#f2e6d0', roof: '#5a6a7a', sign: ['ui', 'vat'] },
        st: {
            roof: 'hip',
            tex: 'planks',
            door: 'barn',
            wins: [28, 61],
            back: ({ x1, ruin, g }) =>
                (ruin ? '' : '') +
                R(x1 - 4, 50, 16, 36, 6, g('#d98b3a')) +
                E(x1 + 4, 50, 8, 3, g('#e8a548')) +
                L(`M${x1 - 4} 66 L${x1 + 12} 66`, 1.6, g('#a8531f')),
            noFlowers: true,
        },
    },
    barrelcellar: {
        cfg: { w: 60, h: 28, wall: STONE, roof: '#3f6a3a', sign: ['ui', 'barrel'] },
        st: {
            roof: 'gable',
            tex: 'stone',
            door: 'arch',
            wins: [],
            props: ({ x0, x1 }) => BARREL(x0 + 2, 86, 0.9) + BARREL(x0 + 12, 86, 0.9) + BARREL(x0 + 7, 74, 0.8) + BARREL(x1 - 4, 86, 0.9),
            noFlowers: true,
        },
    },
    labelshop: {
        cfg: { w: 52, h: 34, wall: '#f7f3ea', roof: '#b58ad6', sign: ['item', 'paint'] },
        st: {
            shop: 'l',
            awn: '#b58ad6',
            goods: (x, y) => [3, 9, 15].map((d, k) => R(x + d, y + 4, 5, 8, 1, ['#f2c84a', '#d8822a', '#3a2018'][k], 1.1)).join(''),
            hang: 'r',
        },
    },
    beerfest: {
        cfg: { w: 70, h: 30, wall: '#fff3d6', roof: '#c8453a', sign: ['ui', 'beer'] },
        st: {
            roof: 'gable',
            tex: 'timber',
            door: 'arch',
            top: ({ x0, x1, y0, ruin }) =>
                ruin
                    ? ''
                    : [0, 1, 2, 3, 4, 5, 6, 7]
                          .map(k => {
                              const x = x0 - 2 + ((x1 - x0 + 4) * k) / 7;
                              return P(`M${x - 3} ${y0 + 1} L${x + 3} ${y0 + 1} L${x} ${y0 + 7}Z`, ['#e8364b', '#ffd23f', '#3f6fb5', '#6cc04a'][k % 4], 1);
                          })
                          .join(''),
            props: ({ x0, x1 }) =>
                R(x0 - 8, 78, 18, 3, 1, '#a8693a', 1.6) +
                L(`M${x0 - 6} 81 L${x0 - 6} 86 M${x0 + 8} 81 L${x0 + 8} 86`, 1.8) +
                BARREL(x1 + 2, 86, 0.8) +
                hopVine(x1 - 6, 86),
        },
    },
};
for (const [id, d] of Object.entries(ABBEY_BLD)) {
    BLD[id] = { ...d.cfg, st: d.st, kind: 'h2_' + id };
    KINDS['h2_' + id] = s => house2(BLD[id], s);
}

// ======================= la carte =======================
MAP_BG.abbey = `<svg class="vmap-bg" viewBox="0 0 160 110" preserveAspectRatio="none" aria-hidden="true">
    <rect width="160" height="110" fill="#b5d98a"/>
    <path d="M0 0 L160 0 L160 20 Q120 30 80 22 Q40 14 0 24Z" fill="#9cc770"/>
    <g stroke="#7fae4a" stroke-width="1.4" stroke-linecap="round" opacity=".8"><path d="M118 92 L118 104 M126 92 L126 104 M134 92 L134 104 M142 92 L142 104 M150 92 L150 104"/></g>
    <g fill="#9ad06a"><circle cx="118" cy="90" r="2"/><circle cx="126" cy="91" r="2"/><circle cx="134" cy="90" r="2"/><circle cx="142" cy="91" r="2"/><circle cx="150" cy="90" r="2"/></g>
    <rect x="44" y="30" width="72" height="50" rx="4" fill="none" stroke="#d8ccb0" stroke-width="3"/>
    <rect x="60" y="44" width="40" height="22" rx="2" fill="#d6ecb0"/>
    <circle cx="80" cy="55" r="4" fill="#7ab8e8" stroke="#d8ccb0" stroke-width="1.6"/>
    <path d="M80 80 L80 110 M0 70 Q30 64 44 66 M116 56 Q140 52 160 58" stroke="#f2d6a2" stroke-width="5" fill="none" stroke-linecap="round"/>
    <g fill="#e8c060"><rect x="6" y="88" width="30" height="16" rx="3" opacity=".75"/></g>
    <g fill="#6cc04a"><circle cx="152" cy="34" r="6"/><circle cx="10" cy="40" r="5"/><circle cx="140" cy="76" r="4"/></g>
</svg>`;

// ======================= Frère Hugues et Agnès =======================
Object.assign(people, {
    // le frère brasseur : bure brune, cordon, couronne de cheveux autour de la tonsure, joues rondes
    hugues: () =>
        bust(
            '#8b5a2b',
            L('M20 52 Q32 58 44 52', 2.2, '#f2e6c0') + C(44, 55, 2, '#f2e6c0', 1.2) + P('M22 46 Q32 52 42 46 L40 50 Q32 54 24 50Z', '#7a4a2a', 1.6),
        ) +
        face() +
        P('M17 30 Q16 20 22 18 Q20 24 21 30Z', '#c8c8c0', 1.6) +
        P('M47 30 Q48 20 42 18 Q44 24 43 30Z', '#c8c8c0', 1.6) +
        P('M21 19 Q32 12 43 19 Q38 16 32 16 Q26 16 21 19Z', '#c8c8c0', 1.4) +
        FC(32, 18, 6, SKIN) +
        HL(30, 18, 2.4, 1.4, 0, 0.5),
    // la malteuse : foulard noué, tresse sur l'épaule, tablier et un épi d'orge
    agnes: () =>
        bust('#5a8a4a', R(24, 48, 16, 18, 2, '#f2e6d0', 1.6) + `<g transform="translate(46 44) rotate(20) scale(.45)">${ear(0, 0, 1)}</g>`) +
        P('M18 34 C14 18 24 12 32 13 C42 12 50 18 46 34 C44 26 38 21 32 21 C26 21 20 26 18 34Z', '#a8693a') +
        P('M44 30 Q50 40 46 52 Q44 44 42 36Z', '#a8693a', 2) +
        L('M45 38 L47 40 M44 44 L46 46', 1, '#7a4a2a') +
        face() +
        P('M17 26 Q18 12 32 11 Q46 12 47 26 Q40 19 32 19 Q24 19 17 26Z', '#e8364b') +
        [22, 30, 38].map((x, k) => FC(x, 17 - (k % 2), 1.2, '#fffaf0')).join('') +
        P('M45 22 L52 20 L50 26Z', '#e8364b', 1.6),
});

export { RAW as ABBEY_RAW };
