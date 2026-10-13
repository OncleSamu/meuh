// Les plantes au champ refaites (1.2.8) : bananier, papayer, gingembre, patate douce, soja, génépi, ananas.
import { C, E, FC, FE, G, GD, GL, HL, L, P, SHADOW, leaf, mound, items, youngExtra, readyExtra } from './kit.js';
import { setPalm } from './plants.js';
import { palmTree } from './island.js';

const oldPalm = palmTree;
const OLDL = '#b9b34a',
    OLDD = '#a8a23a';

// une grande feuille de bananier : large pagaie avec sa nervure et deux déchirures
const paddle = (x, y, len, ang, c, wid = 0.32) =>
    `<g transform="translate(${x} ${y}) rotate(${ang})">` +
    P(
        `M0 0 C${len * 0.2} ${-len * wid} ${len * 0.85} ${-len * wid} ${len} ${-len * 0.02} C${len * 0.85} ${len * wid * 0.9} ${len * 0.2} ${len * wid * 0.9} 0 0Z`,
        c,
        2,
    ) +
    L(`M${len * 0.05} 0 L${len * 0.95} 0`, 1.3, GD) +
    L(
        `M${len * 0.45} ${-len * wid * 0.85} L${len * 0.5} ${-len * 0.06} M${len * 0.7} ${len * wid * 0.75} L${len * 0.66} ${len * 0.05}`,
        1.1,
        'rgba(58,38,24,.55)',
    ) +
    `</g>`;

function banana(stage) {
    const old = stage === 3;
    const c1 = old ? OLDL : '#7ccf4a',
        c2 = old ? OLDD : G;
    let o = SHADOW(32, 58, 16, 3);
    // le faux tronc, fait de gaines
    o += P('M27 58 Q26 40 29 26 L35 26 Q38 40 37 58Z', old ? '#b5ad6a' : '#a8c25a') + L('M29 50 Q31 40 30 28 M34 54 Q34 42 33 28', 1.2, 'rgba(58,38,24,.4)');
    o +=
        paddle(32, 27, 26, -165, c2) +
        paddle(32, 26, 26, -15, c2) +
        paddle(31, 25, 24, -125, c1) +
        paddle(33, 25, 24, -55, c1) +
        paddle(32, 26, 20, -92, c2, 0.28);
    if (stage >= 2) {
        // le régime pend, avec la fleur violette au bout
        o += L('M36 28 Q44 32 44 40 L44 48', 2, '#6b7a3a');
        const hands = old ? [36] : [33, 37.5, 42];
        hands.forEach((y, k) => {
            for (const dx of [-5, 0, 5])
                o += P(`M${44 + dx * 0.6} ${y} q${dx} 4 ${dx * 0.4 - 2} 8 q-2 -4 ${-dx * 0.4 + 1} -8Z`, old ? '#e2c84a' : k === 0 ? '#f2dc4a' : '#ffd84a', 1.4);
        });
        o += E(44, old ? 46 : 52, 3, 4.5, '#8b3a6b', 0, 1.6) + FE(43, old ? 45 : 51, 1, 2, '#fff', 0.4);
    }
    return o;
}

// une feuille de papayer : long pétiole et feuille découpée en mains
const papLeaf = (x, y, len, ang, c) =>
    `<g transform="translate(${x} ${y}) rotate(${ang})">` +
    L(`M0 0 L${len * 0.55} 0`, 1.6, '#8aa04a') +
    leaf(len * 0.52, 0, len * 0.42, -38, c, 0.34) +
    leaf(len * 0.52, 0, len * 0.42, 38, c, 0.34) +
    leaf(len * 0.52, 0, len * 0.5, 0, c, 0.36) +
    `</g>`;

function papaya(stage) {
    const old = stage === 3;
    const c1 = old ? OLDL : G,
        c2 = old ? OLDD : GD;
    let o = SHADOW(32, 58, 12, 3);
    o +=
        P('M29 58 L30 22 L34 22 L35 58Z', '#a9a07a') +
        L('M30 50 L34 50 M30 43 L34 43 M30 36 L34 36 M30 29 L34 29', 1.1, '#7a7050') +
        FC(31, 47, 0.8, '#7a7050') +
        FC(33, 40, 0.8, '#7a7050');
    o += [-170, -140, -110, -80, -50, -15].map((a, k) => papLeaf(32, 24, k % 2 ? 22 : 25, a, k % 2 ? c1 : c2)).join('');
    if (stage >= 2) {
        const fr = old
            ? [[28, 28]]
            : [
                  [27, 27],
                  [37, 27],
                  [32, 30],
                  [27, 34],
                  [37, 34],
              ];
        o += fr
            .map(([x, y], k) => E(x, y, 3.6, 5.4, k % 2 ? '#9ec24a' : old ? '#d9a23a' : '#f2a23a', 0, 1.6) + FE(x - 1, y - 2, 0.8, 1.6, '#fff', 0.45))
            .join('');
    }
    return o;
}

setPalm((id, stage) => (id === 'banana' ? banana(stage) : id === 'papaya' ? papaya(stage) : oldPalm(id, stage)));

// ---------- les cultures ----------
// une tige de gingembre : roseau avec des feuilles fines de chaque côté
const gingerStem = (x, h, lean, c) => {
    let o = L(`M${x} 56 Q${x + lean / 2} ${56 - h / 2} ${x + lean} ${56 - h}`, 1.8, '#5f8a3e');
    for (let k = 0; k < 4; k++) {
        const t = 0.3 + k * 0.2,
            px = x + lean * t,
            py = 56 - h * t;
        o += leaf(px, py, 11, k % 2 ? -25 + lean : -155 + lean, c, 0.2);
    }
    return o;
};
const rhizome = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">` +
    P('M-12 0 C-12 -5 -6 -6 -4 -3 C-3 -8 3 -8 4 -3 C7 -7 13 -5 12 0 C13 3 8 4 4 3 C0 5 -6 4 -8 3 C-11 4 -12 2 -12 0Z', '#e2c08a', 1.8) +
    L('M-6 -1 Q-4 0 -2 -1 M4 0 Q6 1 8 0', 1, '#b8935a') +
    FC(-5, -3, 1, '#e8a0a0', 0.8) +
    '</g>';

// une feuille de patate douce : en cœur, sur une tige qui court au sol
const heart = (x, y, s, rot, c) =>
    `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">` +
    P('M0 6 C-8 0 -8 -7 -3 -7 C-1 -7 0 -5 0 -4 C0 -5 1 -7 3 -7 C8 -7 8 0 0 6Z', c, 2 / s) +
    L('M0 5 L0 -3', 1 / s, GD) +
    '</g>';
const tuber = (x, y, rot) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})">` +
    P('M-8 0 C-8 -5 -2 -6 4 -5 C9 -4 10 2 6 4 C1 6 -6 5 -8 0Z', '#b8463a', 1.8) +
    L('M-3 -2 Q-1 -1 1 -2', 1, '#7a2a22') +
    HL(-3, -3, 2.5, 1, -10, 0.4) +
    '</g>';

// une feuille de soja en trois folioles
const trefoil = (x, y, ang, c) => leaf(x, y, 9, ang - 35, c, 0.42) + leaf(x, y, 10, ang, c, 0.42) + leaf(x, y, 9, ang + 35, c, 0.42);
// une gousse de soja qui pend : trois grains bombés, duvet clair
const soyPod = (x, y, rot) =>
    `<g transform="translate(${x} ${y}) rotate(${rot})">` +
    P('M0 0 C-3 1 -3 4 -2 6 C-3 8 -3 10 -1 12 C0 14 3 13 3 11 C4 9 3 7 3 6 C4 4 3 1 0 0Z', '#d9cf7a', 1.6) +
    FE(0.5, 3.5, 1.4, 1.8, '#fff', 0.35) +
    L('M0 0 L0 -2', 1.2, '#5f8a3e') +
    '</g>';

// le génépi : touffe argentée et petites fleurs jaunes en pompons
const SILVER = '#a9b8a8',
    SILVER2 = '#c7d2c4';
const featherLeaf = (x, y, len, ang, c) =>
    `<g transform="translate(${x} ${y}) rotate(${ang})">` +
    L(`M0 0 L${len} 0`, 1.6, c) +
    [0.3, 0.55, 0.8].map(t => L(`M${len * t} 0 L${len * t + 3} -3 M${len * t} 0 L${len * t + 3} 3`, 1.4, c)).join('') +
    '</g>';
const rosette = c => [-170, -140, -110, -70, -40, -10].map((a, k) => featherLeaf(32, 55, 11 + (k % 2) * 3, a, k % 2 ? c : SILVER)).join('');
const pompon = (x, y) => C(x, y, 2.6, '#f2d16b', 1.3) + FC(x - 0.8, y - 0.8, 0.8, '#fff', 0.6);

// l'ananas : rosette de feuilles longues et dentées, bleu-vert
const spike = (x, y, len, ang, c) =>
    `<g transform="translate(${x} ${y}) rotate(${ang})">` +
    P(`M0 -2 Q${len * 0.6} -2.4 ${len} 0 Q${len * 0.6} 2.4 0 2Z`, c, 1.8) +
    L(`M${len * 0.3} -2.1 l2 -1.5 M${len * 0.55} -1.9 l2 -1.4`, 1, 'rgba(58,38,24,.6)') +
    '</g>';
const PINE = '#5f9e6a',
    PINE2 = '#7fb87a';

Object.assign(youngExtra, {
    ginger: () => mound() + gingerStem(28, 22, -3, G) + gingerStem(36, 18, 4, GL),
    sweetPotato: () =>
        mound() +
        L('M32 56 Q24 54 18 56 M32 56 Q40 53 46 55', 1.6, '#5f8a3e') +
        heart(32, 47, 1, 0, G) +
        heart(22, 50, 0.85, -30, GL) +
        heart(42, 50, 0.85, 30, G),
    soy: () => mound() + L('M32 56 L32 42', 1.8, '#5f8a3e') + trefoil(32, 44, -90, G) + trefoil(32, 50, -150, GL) + trefoil(32, 50, -30, G),
    genepi: () => mound() + rosette(SILVER2),
    pineapple: () =>
        mound() +
        [-165, -140, -115, -65, -40, -15].map((a, k) => spike(32, 54, 15 + (k % 3) * 3, a, k % 2 ? PINE : PINE2)).join('') +
        spike(32, 54, 14, -90, PINE),
});

Object.assign(readyExtra, {
    ginger: () =>
        gingerStem(24, 36, -4, G) +
        gingerStem(32, 42, 0, GL) +
        gingerStem(40, 34, 5, G) +
        mound() +
        // les rhizomes affleurent
        rhizome(32, 55, 0.85),
    sweetPotato: () =>
        mound() +
        tuber(22, 55, -8) +
        tuber(41, 56, 12) +
        L('M32 54 Q20 50 10 54 M32 54 Q44 49 54 53 M32 54 Q30 46 33 40', 1.6, '#5f8a3e') +
        heart(12, 49, 0.9, -40, G) +
        heart(52, 48, 0.9, 40, GL) +
        heart(33, 38, 1.1, 0, G) +
        heart(22, 45, 1, -25, GL) +
        heart(43, 44, 1, 25, G) +
        // la fleur en trompette
        C(26, 37, 3, '#e6b3e0', 1.4) +
        FC(26, 37, 1, '#8b3a6b'),
    soy: () =>
        mound() +
        L('M32 56 L32 22 M32 46 L21 32 M32 40 L43 27', 2, '#5f8a3e') +
        trefoil(32, 24, -90, G) +
        trefoil(21, 33, -135, GL) +
        trefoil(43, 28, -45, G) +
        trefoil(32, 46, -160, G) +
        trefoil(32, 44, -20, GL) +
        [
            [27, 38, 10],
            [24, 41, -10],
            [37, 34, -8],
            [40, 37, 12],
            [33, 30, 4],
        ]
            .map(([x, y, r]) => soyPod(x, y, r))
            .join(''),
    genepi: () =>
        mound() +
        rosette(SILVER2) +
        L('M32 54 Q31 40 32 24 M32 54 Q26 42 22 30 M32 54 Q38 42 42 28', 1.6, '#8a9a7a') +
        featherLeaf(31, 42, 7, -150, SILVER) +
        featherLeaf(33, 38, 7, -30, SILVER) +
        [
            [32, 22],
            [29, 25],
            [35, 25],
            [22, 28],
            [19, 31],
            [42, 26],
            [45, 29],
        ]
            .map(([x, y]) => pompon(x, y))
            .join(''),
    pineapple: () =>
        mound() +
        [-170, -150, -125, -55, -30, -10].map((a, k) => spike(32, 54, 19 + (k % 3) * 3, a, k % 2 ? PINE : PINE2)).join('') +
        `<g transform="translate(15 13) scale(.53)">${items.pineapple()}</g>` +
        spike(30, 55, 16, -150, PINE2) +
        spike(34, 55, 16, -30, PINE),
});
