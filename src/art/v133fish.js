// 1.33 : dix poissons de plus (goujon, lavaret, calmar, dorade, raie, thon, poulpe, vivaneau, mahi-mahi, langouste) et le lagon.
import { C, E, F, FC, HL, L, P, R, SHADOW, items, ui } from './kit.js';
import { fishBody2 } from './items2.js';

const O = '#3a2618';
const spots = (list, c, r = 1.4) => list.map(([x, y]) => C(x, y, r, c, 0)).join('');
const eye = (x, y, r = 3) => C(x, y, r, '#ffffff', 1.4) + FC(x + 0.6, y, r / 2, O);

const FISH = {
    // goujon : petit et fin, dos brun-vert, flancs tachetés, deux barbillons
    gudgeon: fishBody2(
        '#8d8a4a',
        '#f1ecd0',
        '#a8a468',
        spots(
            [
                [20, 31],
                [27, 29],
                [34, 31],
                [41, 29],
                [24, 36],
                [31, 35],
                [38, 36],
            ],
            '#4a4a24',
            1.6,
        ) + L('M7 37 L3 42 M8 38 L5 44', 1.3, O),
        '#a8a468',
        'M6 35 Q12 26 30 26 Q46 26 53 33 L61 26 L59 35 L61 44 L53 37 Q46 43 30 43 Q12 43 6 35Z',
    ),
    // lavaret : argenté, grandes écailles, dos bleu-gris, petite bouche, petite nageoire adipeuse
    whitefish: fishBody2(
        '#c4d0da',
        '#f8fafb',
        '#8ea0b2',
        F('M10 28 Q20 20 34 20 Q46 21 52 30 Q40 26 30 27 Q18 28 10 31Z', '#7d92a8', 0.95) +
            [
                [24, 33],
                [30, 33],
                [36, 33],
                [42, 33],
                [27, 38],
                [33, 38],
                [39, 38],
            ]
                .map(([x, y]) => `<path d="M${x - 2.5} ${y} Q${x} ${y + 2.6} ${x + 2.5} ${y}" fill="none" stroke="#8ea0b2" stroke-width="0.9"/>`)
                .join('') +
            P('M44 24 Q47 20 50 25Z', '#8ea0b2', 1.2),
    ),
    // calmar : manteau en torpille, deux nageoires en pointe, dix bras, gros yeux
    squid:
        SHADOW(32, 58, 18, 3) +
        P('M32 4 L42 16 L32 14 L22 16Z', '#e0a4a8', 1.8) +
        P('M24 14 Q32 8 40 14 Q44 30 38 42 L26 42 Q20 30 24 14Z', '#f0b8b4') +
        F('M26 18 Q32 14 38 18 Q40 28 36 38 Q34 28 32 22Z', '#fbe0d8', 0.7) +
        spots(
            [
                [28, 22],
                [35, 24],
                [31, 30],
                [36, 34],
                [28, 35],
            ],
            '#c0605e',
            1.3,
        ) +
        P('M22 42 Q18 52 20 60 M27 43 Q25 54 26 62 M32 43 L32 62 M37 43 Q39 54 38 62 M42 42 Q46 52 44 60', '#e4a0a0', 0) +
        L('M22 42 Q18 52 20 60 M27 43 Q25 54 26 62 M32 43 L32 62 M37 43 Q39 54 38 62 M42 42 Q46 52 44 60', 2.4, '#e4a0a0') +
        E(32, 43, 11, 3.5, '#f0b8b4', 0, 1.8) +
        eye(27, 42, 2.6) +
        eye(37, 42, 2.6) +
        HL(28, 18, 4, 1.4, -10, 0.6),
    // dorade royale : corps haut, argent, croissant doré entre les yeux, tache sombre sur la ouïe
    bream: fishBody2(
        '#c8ced4',
        '#fbf7f0',
        '#8a929c',
        F('M12 22 Q22 14 36 17 Q46 19 52 30 Q40 25 28 25 Q18 25 12 28Z', '#8a929c', 0.9) +
            L('M12 25 Q15 19 20 21', 2.4, '#e8b420') +
            E(23, 36, 2.8, 4.5, '#6a6e78', 10, 0) +
            [
                [28, 36],
                [34, 36],
                [40, 36],
                [31, 41],
                [37, 41],
            ]
                .map(([x, y]) => `<path d="M${x - 2.4} ${y} Q${x} ${y + 2.4} ${x + 2.4} ${y}" fill="none" stroke="#9aa2ac" stroke-width="0.9"/>`)
                .join(''),
        '#8a929c',
        'M6 34 Q12 15 32 17 Q48 18 52 30 L60 22 L58 34 L60 46 L52 38 Q46 52 30 50 Q12 50 6 34Z',
    ),
    // raie : un grand losange plat vu de dessus, longue queue fine, deux yeux sur le dos
    skate:
        SHADOW(32, 58, 22, 3) +
        L('M32 44 Q34 54 28 62', 2.4, '#7a6a58') +
        P('M32 8 Q40 18 58 30 Q42 34 32 46 Q22 34 6 30 Q24 18 32 8Z', '#a08a70') +
        F('M32 12 Q38 20 52 29 Q40 28 32 22Z', '#c8b494', 0.8) +
        spots(
            [
                [24, 30],
                [40, 30],
                [32, 34],
                [30, 26],
                [36, 24],
                [20, 28],
                [44, 28],
            ],
            '#6a5844',
            1.5,
        ) +
        eye(28, 20, 2.4) +
        eye(36, 20, 2.4) +
        L('M30 26 L34 26', 1.2, '#5a4634') +
        P('M32 8 Q40 18 58 30 Q42 34 32 46 Q22 34 6 30 Q24 18 32 8Z', 'none') +
        HL(26, 22, 5, 1.4, -20, 0.5),
    // thon : torpille bleu nuit, ventre argent, petites nageoires jaunes en queue, queue en croissant
    tuna:
        SHADOW(32, 56, 26, 3) +
        P('M24 22 Q30 12 38 22Z', '#2c4a78', 1.8) +
        P('M26 46 Q32 54 38 46Z', '#2c4a78', 1.8) +
        P('M6 34 Q12 20 32 19 Q46 19 54 30 L62 20 L60 34 L62 48 L54 38 Q46 49 32 49 Q12 48 6 34Z', '#27508c') +
        F('M8 38 Q16 48 32 47 Q46 47 53 38 Q42 42 32 42 Q18 42 8 38Z', '#dce6ee', 0.95) +
        L('M10 33 Q30 31 52 33', 1.6, '#e8c428') +
        L('M44 33 L50 38 M47 31 L52 36', 2.2, '#f0d030') +
        P('M54 30 L62 20 L60 34 L62 48 L54 38', '#1e3c68', 2) +
        eye(15, 30, 3.2) +
        L('M22 26 Q25 34 22 42', 1.6, 'rgba(10,20,40,.5)') +
        HL(24, 24, 7, 1.6, -4, 0.55) +
        P('M6 34 Q12 20 32 19 Q46 19 54 30 Q46 49 32 49 Q12 48 6 34Z', 'none'),
    // poulpe : tête ronde violette, huit bras enroulés avec ventouses, gros yeux
    octopus:
        SHADOW(32, 58, 24, 3) +
        L(
            'M16 38 Q6 44 10 54 Q14 60 20 54 M22 42 Q16 54 22 60 M30 44 Q28 56 32 62 M38 44 Q42 56 38 62 M44 42 Q50 54 44 60 M48 38 Q58 44 54 54 Q50 60 44 54',
            5,
            '#a85a9e',
        ) +
        L(
            'M16 38 Q6 44 10 54 Q14 60 20 54 M22 42 Q16 54 22 60 M30 44 Q28 56 32 62 M38 44 Q42 56 38 62 M44 42 Q50 54 44 60 M48 38 Q58 44 54 54 Q50 60 44 54',
            2.6,
            '#c47ab8',
        ) +
        spots(
            [
                [9, 50],
                [12, 57],
                [21, 58],
                [28, 54],
                [36, 56],
                [43, 56],
                [51, 57],
                [55, 50],
            ],
            '#f4d8ee',
            1.1,
        ) +
        P('M12 28 Q12 6 32 6 Q52 6 52 28 Q52 42 32 44 Q12 42 12 28Z', '#b8689e') +
        F('M18 16 Q26 8 38 10 Q30 12 24 20Z', '#d890c4', 0.8) +
        spots(
            [
                [20, 26],
                [44, 24],
                [32, 14],
                [46, 34],
                [18, 36],
            ],
            '#8a4684',
            1.6,
        ) +
        eye(24, 32, 4) +
        eye(40, 32, 4) +
        P('M12 28 Q12 6 32 6 Q52 6 52 28 Q52 42 32 44 Q12 42 12 28Z', 'none'),
    // vivaneau : rouge rosé, corps haut, œil doré, nageoire dorsale piquante
    snapper:
        fishBody2(
            '#e2564c',
            '#fbd8cc',
            '#c8362e',
            F('M10 26 Q20 18 36 19 Q48 21 52 30 Q40 25 28 26 Q18 27 10 30Z', '#c0342c', 0.95) +
                L('M8 38 Q30 44 52 36', 1.2, '#fbd8cc') +
                [
                    [26, 32],
                    [32, 32],
                    [38, 32],
                    [44, 34],
                    [29, 37],
                    [35, 37],
                ]
                    .map(([x, y]) => `<path d="M${x - 2.4} ${y} Q${x} ${y + 2.4} ${x + 2.4} ${y}" fill="none" stroke="#b8302a" stroke-width="0.9"/>`)
                    .join(''),
            '#c8362e',
            'M6 34 Q12 17 32 18 Q48 19 52 30 L60 22 L58 34 L60 46 L52 38 Q46 51 30 50 Q12 49 6 34Z',
        ) + FC(15.6, 30, 1.2, '#f0c030'),
    // mahi-mahi : front bombé, dos bleu-vert, flancs dorés pointillés, longue nageoire dorsale
    mahi:
        SHADOW(32, 56, 26, 3) +
        P('M16 18 Q30 8 52 22 L50 26 Q32 18 16 24Z', '#2f9ac8', 1.8) +
        P('M26 46 Q34 54 44 44Z', '#f2d040', 1.8) +
        P('M5 36 Q4 22 16 20 Q24 16 38 20 Q50 24 54 31 L62 22 L60 34 L62 46 L54 38 Q46 48 32 48 Q16 48 5 36Z', '#8cc84a') +
        F('M6 38 Q16 47 32 46 Q44 46 52 38 Q42 42 32 42 Q18 42 6 38Z', '#fbf0b8', 0.95) +
        F('M10 26 Q24 20 40 24 Q50 27 52 31 Q36 28 22 29 Q14 29 10 31Z', '#2f9ac8', 0.85) +
        spots(
            [
                [22, 34],
                [28, 36],
                [34, 35],
                [40, 37],
                [26, 40],
                [32, 41],
                [38, 31],
                [44, 35],
            ],
            '#f2d040',
            1.6,
        ) +
        P('M54 31 L62 22 L60 34 L62 46 L54 38', '#f2d040', 2) +
        eye(14, 31, 3) +
        L('M22 26 Q25 34 22 42', 1.6, 'rgba(40,60,20,.5)') +
        HL(20, 24, 6, 1.4, -10, 0.55) +
        P('M5 36 Q4 22 16 20 Q24 16 38 20 Q50 24 54 31 Q46 48 32 48 Q16 48 5 36Z', 'none'),
    // langouste : pas de pinces, deux longues antennes, carapace épineuse, queue en éventail
    spinyLobster:
        SHADOW(32, 58, 22, 3) +
        L('M26 12 Q16 6 8 8 M38 12 Q48 6 56 8', 1.8, '#a84a2a') +
        L('M28 14 Q22 4 14 2 M36 14 Q42 4 50 2', 1.4, '#c86a3a') +
        L('M22 34 L12 38 M22 40 L13 46 M22 46 L14 54 M42 34 L52 38 M42 40 L51 46 M42 46 L50 54', 2, '#c8502e') +
        P('M24 56 L20 62 L32 60 L44 62 L40 56Z', '#c8502e', 1.6) +
        P('M26 40 L38 40 L40 56 L24 56Z', '#d8603a') +
        L('M25 45 L39 45 M25 50 L39 50', 1.2, '#8e3018') +
        P('M24 14 Q32 10 40 14 L42 28 Q42 40 38 42 L26 42 Q22 40 22 28Z', '#d8603a') +
        L('M24 22 L40 22 M24 30 L40 30', 1.2, '#8e3018') +
        spots(
            [
                [27, 18],
                [37, 18],
                [26, 26],
                [38, 26],
                [27, 34],
                [37, 34],
            ],
            '#f6d890',
            1.4,
        ) +
        eye(28, 13, 2.2) +
        eye(36, 13, 2.2) +
        HL(27, 18, 4, 1.4, -10, 0.5),
};
Object.assign(items, Object.fromEntries(Object.entries(FISH).map(([k, v]) => [k, () => v])));

// le lagon : eau turquoise, sable blanc et un palmier
ui.spotLagoon = () =>
    P('M2 28 Q16 24 32 28 Q48 32 62 28 L62 58 Q32 62 2 58Z', '#3fc8d0') +
    P('M2 42 Q20 38 36 42 Q50 46 62 42 L62 58 Q32 62 2 58Z', '#7ae0dc') +
    L('M10 36 Q16 34 22 36 M40 50 Q46 48 52 50 M18 52 Q24 50 30 52', 1.4, '#e8fbfa') +
    P('M2 24 Q16 20 30 26 Q22 32 2 32Z', '#f6e6b8') +
    P('M4 27 Q14 25 22 28', '#e8d29a', 0) +
    R(11, 8, 3, 18, 1.4, '#8b5a2b', 1.6) +
    P('M12 9 Q4 4 1 10 Q6 8 12 11Z', '#3f9a4a', 1.6) +
    P('M13 9 Q20 2 26 7 Q20 7 14 11Z', '#4aa854', 1.6) +
    P('M12 10 Q14 2 20 2 Q16 6 14 12Z', '#3f9a4a', 1.6) +
    C(13, 12, 2, '#8b5a2b', 1.2) +
    P('M44 30 Q50 22 56 30Z', '#fff', 1.6) +
    L('M50 30 L50 34', 1.6, '#8b5a2b');
export const FISH_133_ART = Object.keys(FISH);
