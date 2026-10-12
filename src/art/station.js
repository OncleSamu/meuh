// La station de recherche (bêta 4) : ses bâtiments et ses deux habitants.
import { BLD, C, E, F, FC, HL, KINDS, L, P, R, SHADOW, people } from './kit.js';
import { bust, face } from './people.js';
import { scaffold, subAny, grey, greyD } from './buildings.js';

// une serre en verre (pollinisation)
function glasshouse(s) {
    const ruin = s === 0;
    let o = SHADOW(50, 87, 40, 4);
    o += P('M14 86 L14 52 L50 30 L86 52 L86 86Z', ruin ? '#d8d0c2' : '#dff4ff');
    if (!ruin)
        o +=
            F('M18 84 L18 54 L50 34 L50 84Z', '#ffffff', 0.35) +
            L('M32 86 L32 42 M50 86 L50 30 M68 86 L68 42 M14 68 L86 68', 1.6, '#5aa9e6') +
            [24, 40, 60, 76].map((x, k) => C(x, 80, 4, ['#e8364b', '#ffd23f', '#b58ad6', '#f6a5b5'][k], 1.4)).join('');
    else o += L('M30 50 L40 64 L34 76 M62 44 L70 58', 2, '#6d6457') + L('M14 86 L14 52 L50 30 L86 52 L86 86', 2, greyD);
    o += P('M14 86 L14 52 L50 30 L86 52 L86 86Z', 'none');
    if (s === 2) o += C(50, 22, 8.5, '#fff', 2) + subAny('item', 'strawberry', 42.5, 14.5, 15);
    if (s === 1) o += scaffold(14, 40, 86);
    return o;
}
// une ruche de sélection (une grande ruche peinte)
function bighive(s) {
    const ruin = s === 0;
    let o = SHADOW(50, 87, 30, 4);
    o += R(26, 70, 48, 16, 2, ruin ? grey : '#c08b52');
    o += R(30, 40, 40, 30, 3, ruin ? grey : '#ffd23f') + L('M30 50 L70 50 M30 60 L70 60', 2, ruin ? greyD : '#c99a2a');
    o += P('M24 42 L50 24 L76 42Z', ruin ? greyD : '#e8792a');
    if (!ruin) o += E(50, 64, 6, 4, '#3a2618') + [36, 62, 48].map((x, k) => E(x, 32 + k * 4, 3, 2, '#3a2618', 0, 1) + E(x + 2, 31 + k * 4, 2.4, 1.4, '#fff', 0, 1)).join('');
    if (s === 1) o += scaffold(26, 40, 74);
    return o;
}
Object.assign(KINDS, { glasshouse, bighive });
Object.assign(BLD, {
    pollination: { kind: 'glasshouse' },
    breeding: { w: 66, h: 34, wall: '#e9c79a', roof: '#c8453a', sign: ['item', 'milk'] },
    lab: { w: 60, h: 40, wall: '#f7f3ea', roof: '#5aa9e6', sign: ['ui', 'search'], floors: 2 },
    seedbank: { w: 54, h: 32, wall: '#e8f6d8', roof: '#3f8f2e', sign: ['ui', 'packet'] },
    selectHive: { kind: 'bighive' },
    salonHall: { w: 76, h: 40, wall: '#fbe1ea', roof: '#b58ad6', sign: ['ui', 'trophy'], tower: true },
});

Object.assign(people, {
    agathe: () =>
        bust('#ffffff', L('M24 46 L32 60 L40 46', 1.6, '#c9d3dc') + R(40, 50, 6, 8, 1.5, '#5aa9e6', 1.4)) +
        P('M16 34 C12 16 24 12 32 13 C42 12 52 16 48 34 C46 26 40 21 32 21 C24 21 18 26 16 34Z', '#7a4a2a') +
        face() +
        C(32, 9, 6, '#7a4a2a') +
        P('M19 25 C22 17 42 17 45 25 C40 20 26 20 19 25Z', '#7a4a2a') +
        C(27, 30, 4.3, 'none', 1.8) +
        C(37, 30, 4.3, 'none', 1.8) +
        L('M31.3 30 L32.7 30', 1.8) +
        HL(25, 28, 1.4, 1, 0, 0.6),
    victor: () =>
        bust('#3f8f9e', R(26, 46, 12, 14, 2, '#f7f3ea', 1.6) + C(32, 56, 3, '#e8364b', 1.2) + L('M30 56 L34 56 M32 54 L32 58', 1.2, '#fff')) +
        face({ noSmile: true }) +
        L('M28 36 Q32 39 36 36', 2) +
        P('M17 27 C17 13 47 13 47 27 C44 21 38 18 32 18 C26 18 20 21 17 27Z', '#3a2618') +
        P('M20 40 Q24 46 32 46 Q40 46 44 40 Q40 43 32 43 Q24 43 20 40Z', '#5e3a1e', 1.4) +
        FC(23.5, 34, 2.6, '#f49a8f', 0.55),
});
