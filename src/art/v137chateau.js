// Le château de Margaux (1.37) : ses six chantiers, la carte, l'œnologue Octave.
import { BLD, KINDS, C, E, HL, L, P, R, items, ui, people } from './kit.js';

const sub = (kind, id, x, y, s) => `<g transform="translate(${x} ${y}) scale(${s / 64})">${(kind === 'ui' ? ui : items)[id]()}</g>`;
import { bust, face } from './people.js';
import { house2 } from './buildings2.js';
import { MAP_BG } from './maps.js';

const STONE = '#e8dcc0';
const SLATE = '#4a5a78';
const BARREL = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    P('M-6 -14 Q-8 -7 -6 0 L6 0 Q8 -7 6 -14Z', '#a8693a', 1.8) +
    L('M-7 -10 L7 -10 M-7 -4 L7 -4', 1.6) +
    HL(-3, -9, 1.2, 3, 0, 0.4) +
    '</g>';
// un rang de vigne : un échalas, des feuilles et deux grappes
const vineRow = (x, y) =>
    L(`M${x} ${y} L${x} ${y - 20}`, 1.6, '#8b5a2b') +
    L(`M${x - 6} ${y - 16} L${x + 6} ${y - 16}`, 1.2, '#8b5a2b') +
    [
        [-4, 18],
        [3, 14],
        [-3, 10],
    ]
        .map(([d, h], k) => E(x + d, y - h, 3, 2.4, '#6cc04a', k * 20 - 20, 1))
        .join('') +
    C(x + 2, y - 6, 2.2, '#7b3f9e', 1) +
    C(x - 2, y - 4, 2.2, '#7b3f9e', 1);
// une tourelle à toit pointu et fanion
const turret = (x, y0, ruin, g) =>
    R(x - 6, y0 - 22, 12, 24, 1, g(STONE), 2) +
    P(`M${x - 8} ${y0 - 22} L${x} ${y0 - 36} L${x + 8} ${y0 - 22}Z`, g(SLATE), 1.8) +
    (ruin ? '' : L(`M${x} ${y0 - 36} L${x} ${y0 - 43}`, 1.4) + P(`M${x} ${y0 - 43} L${x + 7} ${y0 - 41} L${x} ${y0 - 39}Z`, '#e8364b', 1)) +
    (ruin ? '' : R(x - 1.6, y0 - 16, 3.2, 6, 1.4, '#3a2618', 0.6));

const CH_BLD = {
    chateauRoof: {
        cfg: { w: 74, h: 36, wall: STONE, roof: SLATE, sign: ['item', 'grape'] },
        st: {
            roof: 'hip',
            tex: 'stone',
            door: 'arch',
            wins: [20, 38, 62, 80],
            top: ({ x0, x1, y0, ruin, g }) => turret(x0 + 2, y0 + 14, ruin, g) + turret(x1 - 2, y0 + 14, ruin, g),
            noFlowers: true,
        },
    },
    chateauVines: {
        cfg: { w: 58, h: 22, wall: '#d8c9a0', roof: '#8a5a2e', sign: ['item', 'grape'] },
        st: {
            roof: 'gable',
            tex: 'planks',
            door: 'barn',
            wins: [],
            props: ({ x0, x1 }) => [x0 - 8, x0 - 2, x1 + 2, x1 + 8].map(x => vineRow(x, 86)).join(''),
            noFlowers: true,
        },
    },
    chateauChai: {
        cfg: { w: 62, h: 28, wall: STONE, roof: '#7a3a2a', sign: ['item', 'redWine'] },
        st: {
            roof: 'gable',
            tex: 'stone',
            door: 'arch',
            wins: [],
            props: ({ x0, x1 }) => BARREL(x0 + 2, 86, 0.9) + BARREL(x0 + 12, 86, 0.9) + BARREL(x0 + 7, 74, 0.8) + BARREL(x1 - 4, 86, 0.9),
            noFlowers: true,
        },
    },
    tastingRoom: {
        cfg: { w: 56, h: 30, wall: '#fff3d6', roof: '#8e2c22', sign: ['item', 'redWine'] },
        st: {
            roof: 'hip',
            tex: 'timber',
            door: 'arch',
            wins: [24, 74],
            props: ({ x0, x1 }) =>
                R(x1 - 4, 76, 14, 3, 1, '#a8693a', 1.4) + L(`M${x1} 79 L${x1} 86 M${x1 + 8} 79 L${x1 + 8} 86`, 1.6) + sub('item', 'redWine', x1 - 2, 62, 12),
        },
    },
    chateauShop: {
        cfg: { w: 54, h: 34, wall: '#f7f3ea', roof: '#7b3f9e', sign: ['item', 'whiteWine'] },
        st: {
            shop: 'l',
            awn: '#7b3f9e',
            goods: (x, y) => [3, 9, 15].map((d, k) => R(x + d, y + 2, 4, 10, 1.4, ['#7a1f2b', '#e8c060', '#d8688a'][k], 1.1)).join(''),
            hang: 'r',
        },
    },
    harvestFest: {
        cfg: { w: 70, h: 30, wall: '#fff3d6', roof: '#7b3f9e', sign: ['item', 'grape'] },
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
                              return P(`M${x - 3} ${y0 + 1} L${x + 3} ${y0 + 1} L${x} ${y0 + 7}Z`, ['#7b3f9e', '#e8c060', '#7a1f2b', '#6cc04a'][k % 4], 1);
                          })
                          .join(''),
            props: ({ x0, x1 }) =>
                R(x0 - 8, 78, 18, 3, 1, '#a8693a', 1.6) +
                L(`M${x0 - 6} 81 L${x0 - 6} 86 M${x0 + 8} 81 L${x0 + 8} 86`, 1.8) +
                BARREL(x1 + 2, 86, 0.8) +
                vineRow(x1 - 6, 86),
        },
    },
};
for (const [id, d] of Object.entries(CH_BLD)) {
    BLD[id] = { ...d.cfg, st: d.st, kind: 'h2_' + id };
    KINDS['h2_' + id] = s => house2(BLD[id], s);
}

// ======================= la carte : un parc, des rangs de vigne, une allée de gravier =======================
const rows = (x, y, n, dx) => Array.from({ length: n }, (_, k) => `<path d="M${x + k * dx} ${y} L${x + k * dx + 6} ${y + 20}"/>`).join('');
MAP_BG.chateau = `<svg class="vmap-bg" viewBox="0 0 160 110" preserveAspectRatio="none" aria-hidden="true">
    <rect width="160" height="110" fill="#bfe6fb"/>
    <path d="M0 30 Q40 12 80 24 Q120 36 160 16 L160 110 L0 110Z" fill="#b7d97a"/>
    <path d="M0 56 Q50 40 100 52 Q130 58 160 46 L160 110 L0 110Z" fill="#9bd96f"/>
    <g stroke="#5e8f2e" stroke-width="1.8" stroke-linecap="round" fill="none" opacity=".8">${rows(8, 60, 7, 5)}${rows(8, 84, 7, 5)}</g>
    <g fill="#7b3f9e" opacity=".85">${Array.from({ length: 7 }, (_, k) => `<circle cx="${12 + k * 5}" cy="76" r="1.1"/><circle cx="${12 + k * 5}" cy="100" r="1.1"/>`).join('')}</g>
    <path d="M80 110 Q80 84 80 62 M80 62 Q56 56 36 40 M80 62 Q108 58 126 74" stroke="#f2d6a2" stroke-width="6" fill="none" stroke-linecap="round"/>
    <circle cx="80" cy="62" r="6" fill="#7ab8e8" stroke="#d8ccb0" stroke-width="2"/>
    <g fill="#3f8f2e"><circle cx="150" cy="40" r="6"/><circle cx="6" cy="36" r="5"/><circle cx="146" cy="96" r="5"/></g>
    <g fill="#9ad06a"><circle cx="150" cy="38" r="3"/><circle cx="6" cy="34" r="2.6"/></g>
</svg>`;

// ======================= Octave =======================
// l'œnologue : gilet bordeaux, nœud papillon, lunettes rondes, mèche argentée, un verre à la main
Object.assign(people, {
    octave: () =>
        bust(
            '#7a1f2b',
            P('M26 46 L32 52 L38 46 L38 56 L26 56Z', '#f7f3ea', 1.4) +
                P('M28 46 L32 49 L28 52Z M36 46 L32 49 L36 52Z', '#2a1a1e', 1.2) +
                `<g transform="translate(47 52) scale(.5)">${R(-6, -14, 12, 14, 3, 'rgba(228,245,255,.9)', 2.4)}${E(0, -4, 5, 5, '#7a1f2b', 0, 0)}</g>`,
        ) +
        P('M16 30 C14 14 24 9 33 10 C44 9 50 16 47 30 C45 24 40 19 33 19 C26 19 20 24 16 30Z', '#cfd2d6') +
        face() +
        P('M17 24 Q20 12 33 12 Q46 12 47 24 Q42 18 33 17 Q24 17 17 24Z', '#cfd2d6', 1.6) +
        C(27, 31, 4.6, 'none', 1.4) +
        C(38, 31, 4.6, 'none', 1.4) +
        L('M31.6 31 L33.4 31', 1.2),
});
