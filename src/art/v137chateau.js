// Le château de Margaux (1.37) : ses six chantiers, la carte, l'œnologue Octave.
import { BLD, KINDS, C, E, HL, L, P, R, people } from './kit.js';

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
            tex: 'stone',
            door: 'arch',
            wins: [26, 74],
            props: ({ x1 }) => BARREL(x1 + 4, 86, 0.8),
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

// ======================= la carte : parc, vignes en rangs, allée de gravier bordée de cyprès =======================
MAP_BG.chateau = `<svg class="vmap-bg" viewBox="0 0 160 110" preserveAspectRatio="none" aria-hidden="true">
    <rect width="160" height="110" fill="#cfeaf8"/>
    <path d="M0 22 Q30 8 60 18 Q95 28 125 14 Q145 8 160 14 L160 40 L0 40Z" fill="#a9cf8a"/>
    <path d="M0 30 Q40 18 80 28 Q120 38 160 24 L160 110 L0 110Z" fill="#b9dd86"/>
    <path d="M0 52 Q50 40 100 52 Q135 60 160 48 L160 110 L0 110Z" fill="#a4d870"/>
    <path d="M0 80 Q50 70 100 82 Q135 88 160 78 L160 110 L0 110Z" fill="#94cf63"/>
    <rect x="4" y="62" width="44" height="34" rx="6" fill="#c89868"/>
    <g stroke="#4f8f2e" stroke-width="2" stroke-linecap="round" fill="none"><path d="M8 70.0 Q24 64.0 42 72.0"/><path d="M8 74.6 Q24 68.6 42 76.6"/><path d="M8 79.2 Q24 73.2 42 81.2"/><path d="M8 83.8 Q24 77.8 42 85.8"/><path d="M8 88.4 Q24 82.4 42 90.4"/><path d="M8 93.0 Q24 87.0 42 95.0"/></g>
    <g fill="#7b3f9e"><circle cx="11" cy="71.0" r=".9"/><circle cx="16" cy="71.0" r=".9"/><circle cx="21" cy="71.0" r=".9"/><circle cx="26" cy="71.0" r=".9"/><circle cx="31" cy="71.0" r=".9"/><circle cx="36" cy="71.0" r=".9"/><circle cx="11" cy="75.6" r=".9"/><circle cx="16" cy="75.6" r=".9"/><circle cx="21" cy="75.6" r=".9"/><circle cx="26" cy="75.6" r=".9"/><circle cx="31" cy="75.6" r=".9"/><circle cx="36" cy="75.6" r=".9"/><circle cx="11" cy="80.2" r=".9"/><circle cx="16" cy="80.2" r=".9"/><circle cx="21" cy="80.2" r=".9"/><circle cx="26" cy="80.2" r=".9"/><circle cx="31" cy="80.2" r=".9"/><circle cx="36" cy="80.2" r=".9"/><circle cx="11" cy="84.8" r=".9"/><circle cx="16" cy="84.8" r=".9"/><circle cx="21" cy="84.8" r=".9"/><circle cx="26" cy="84.8" r=".9"/><circle cx="31" cy="84.8" r=".9"/><circle cx="36" cy="84.8" r=".9"/><circle cx="11" cy="89.4" r=".9"/><circle cx="16" cy="89.4" r=".9"/><circle cx="21" cy="89.4" r=".9"/><circle cx="26" cy="89.4" r=".9"/><circle cx="31" cy="89.4" r=".9"/><circle cx="36" cy="89.4" r=".9"/><circle cx="11" cy="94.0" r=".9"/><circle cx="16" cy="94.0" r=".9"/><circle cx="21" cy="94.0" r=".9"/><circle cx="26" cy="94.0" r=".9"/><circle cx="31" cy="94.0" r=".9"/><circle cx="36" cy="94.0" r=".9"/></g>
    <path d="M70 84 Q50 82 38 76 M72 70 Q90 68 108 62 M66 80 Q40 52 30 44 M76 52 Q100 38 118 28" stroke="#f0dcae" stroke-width="5" fill="none" stroke-linecap="round"/>
    <path d="M70 110 Q70 92 66 80 Q62 66 78 52 Q84 46 80 38" stroke="#f0dcae" stroke-width="9" fill="none" stroke-linecap="round"/>
    <path d="M70 110 Q70 92 66 80 Q62 66 78 52 Q84 46 80 38" stroke="#fff3d0" stroke-width="2.4" fill="none" stroke-linecap="round" stroke-dasharray="1 5" opacity=".8"/>
    <path d="M2 100 L158 100" stroke="#b8b0a0" stroke-width="2" stroke-dasharray="5 1.4" opacity=".7"/>
    <ellipse cx="140" cy="92" rx="12" ry="6" fill="#7ab8e8"/><ellipse cx="140" cy="91" rx="9" ry="3.6" fill="#a8d6f4"/>
    <ellipse cx="60" cy="92" rx="2.2" ry="6" fill="#2f7a3a"/><ellipse cx="59.3" cy="90.5" rx="0.9" ry="3.5" fill="#4a9a4a"/><ellipse cx="76" cy="96" rx="2.2" ry="6" fill="#2f7a3a"/><ellipse cx="75.3" cy="94.5" rx="0.9" ry="3.5" fill="#4a9a4a"/><ellipse cx="58" cy="70" rx="2.2" ry="6" fill="#2f7a3a"/><ellipse cx="57.3" cy="68.5" rx="0.9" ry="3.5" fill="#4a9a4a"/><ellipse cx="82" cy="70" rx="2.2" ry="6" fill="#2f7a3a"/><ellipse cx="81.3" cy="68.5" rx="0.9" ry="3.5" fill="#4a9a4a"/><circle cx="8" cy="27.2" r="6" fill="#2f7a3a" opacity=".35"/><circle cx="8" cy="26" r="6" fill="#3f9a3f"/><circle cx="6.2" cy="24.2" r="3.0" fill="#6cc04a"/><circle cx="152" cy="31.2" r="6" fill="#2f7a3a" opacity=".35"/><circle cx="152" cy="30" r="6" fill="#3f9a3f"/><circle cx="150.2" cy="28.2" r="3.0" fill="#6cc04a"/><circle cx="150" cy="65.2" r="5" fill="#2f7a3a" opacity=".35"/><circle cx="150" cy="64" r="5" fill="#3f9a3f"/><circle cx="148.5" cy="62.5" r="2.5" fill="#6cc04a"/><circle cx="6" cy="53.2" r="5" fill="#2f7a3a" opacity=".35"/><circle cx="6" cy="52" r="5" fill="#3f9a3f"/><circle cx="4.5" cy="50.5" r="2.5" fill="#6cc04a"/><circle cx="112" cy="49.2" r="4.5" fill="#2f7a3a" opacity=".35"/><circle cx="112" cy="48" r="4.5" fill="#3f9a3f"/><circle cx="110.65" cy="46.65" r="2.25" fill="#6cc04a"/><circle cx="96" cy="101.2" r="4.5" fill="#2f7a3a" opacity=".35"/><circle cx="96" cy="100" r="4.5" fill="#3f9a3f"/><circle cx="94.65" cy="98.65" r="2.25" fill="#6cc04a"/><circle cx="30" cy="103.2" r="4.5" fill="#2f7a3a" opacity=".35"/><circle cx="30" cy="102" r="4.5" fill="#3f9a3f"/><circle cx="28.65" cy="100.65" r="2.25" fill="#6cc04a"/>
    <g fill="#e8364b"><circle cx="58" cy="44" r="1.1"/><circle cx="64" cy="46" r="1.1"/><circle cx="96" cy="46" r="1.1"/></g>
    <g fill="#ffd23f"><circle cx="61" cy="45" r="1.1"/><circle cx="100" cy="44" r="1.1"/></g>
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
