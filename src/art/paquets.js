// 1.101 : les dix packagings de la Maison. Chaque boîte est dessinée en deux couches : l'arrière (l'intérieur, l'anse, le papier de soie)
// et l'avant (la façade). Les produits se glissent entre les deux, si bien que le bas de chaque produit disparaît dans la boîte.
import { svg, P, R, L, E, C, FE, HL, O, ui } from './kit.js';

const W = '#c98a4b', WD = '#9a6532', WDD = '#6b4220', WL = '#e2ad6b';
const nail = (x, y) => C(x, y, 1.1, '#e8e2d4', 0.9);
const lines = (n, f) => Array.from({ length: n }, (_, i) => f(i)).join('');

// pal = { bg, fg } : les couleurs de la marque, utilisées pour les rubans et les étiquettes
const MODELS = {
    carton: pal => ({
        back: P('M10 31 L4 20 L26 26 Z', '#b88a52', 2) + P('M54 31 L60 20 L38 26 Z', '#b88a52', 2) + P('M10 28 H54 V36 H10Z', '#8f6a3c', 2),
        front: R(9, 32, 46, 25, 2, '#d3a76b') + R(28, 32, 8, 25, 0, '#efe0b0', 1.5) + R(14, 44, 12, 8, 1.5, pal.bg, 1.8) + L('M16 48 H24', 1.6, pal.fg),
    }),
    cagette: () => ({
        back: P('M10 28 H54 L52 56 H12Z', WDD, 2.2),
        front:
            R(8, 31, 48, 9, 2, W) + R(8, 41, 48, 9, 2, WL) + R(8, 51, 48, 7, 2, W) + R(8, 29, 6, 29, 2, WD) + R(50, 29, 6, 29, 2, WD) + nail(11, 36) + nail(53, 36) + nail(11, 47) + nail(53, 47),
    }),
    panier: () => ({
        back: L('M13 38 Q32 -6 51 38', 7, O) + L('M13 38 Q32 -6 51 38', 4, '#a9763a'),
        front:
            P('M8 35 Q32 44 56 35 L51 57 Q32 62 13 57Z', '#d9a65a', 2.4) +
            L('M10 42 Q32 50 54 42', 1.8, '#a9763a') +
            L('M12 49 Q32 57 52 49', 1.8, '#a9763a') +
            lines(7, i => L(`M${15 + i * 6} 39 Q${16 + i * 6} 49 ${16 + i * 5} 58`, 1.4, '#b98744')) +
            P('M7 34 Q32 44 57 34 Q57 37 56 38 Q32 48 8 38 Q7 36 7 34Z', '#b98744', 2.2),
    }),
    filet: () => ({
        back: R(14, 22, 36, 8, 3, '#e9d9ae', 2),
        front:
            P('M12 30 Q32 38 52 30 Q54 46 48 57 Q32 62 16 57 Q10 46 12 30Z', '#f0e3b8', 2.4) +
            lines(6, i => L(`M${15 + i * 7} 33 L${22 + i * 5} 58`, 1.3, '#a98e57')) +
            lines(6, i => L(`M${49 - i * 7} 33 L${42 - i * 5} 58`, 1.3, '#a98e57')) +
            R(11, 28, 42, 6, 3, '#b08850') +
            C(32, 31, 4.2, '#8f6a3c', 2),
    }),
    caisse: () => ({
        back: P('M9 28 H55 L53 56 H11Z', '#27476e', 2.2),
        front:
            R(8, 31, 48, 26, 3, '#3f6fa8') + R(8, 41, 48, 5, 0, '#f4f1e6', 1.6) + R(8, 31, 48, 5, 2, '#2f5688') + L('M16 35 Q16 31 20 31', 2.6, '#d9c394') + L('M48 35 Q48 31 44 31', 2.6, '#d9c394') + C(32, 51, 2.4, '#f4f1e6', 1.4),
    }),
    ruban: pal => ({
        back: P('M10 32 Q14 20 22 26 Q28 16 34 24 Q42 14 46 26 Q54 22 54 32Z', '#ffe3ec', 2.2),
        front:
            R(9, 33, 46, 24, 3, pal.bg === '#f7eed9' ? '#f3c9d3' : pal.bg) +
            R(27, 33, 10, 24, 0, pal.fg, 1.8) +
            R(7, 29, 50, 8, 3, pal.fg === '#7a1f2b' ? '#a02c3d' : pal.fg) +
            P('M32 29 Q22 18 16 24 Q14 30 32 29Z', pal.fg, 2) +
            P('M32 29 Q42 18 48 24 Q50 30 32 29Z', pal.fg, 2) +
            C(32, 29, 3.6, pal.fg, 2) +
            HL(14, 41, 3, 6, -10, 0.45),
    }),
    tonnelet: () => ({
        back: E(32, 30, 19, 4.5, WDD, 0, 2.2),
        front:
            P('M13 30 Q6 43 13 57 H51 Q58 43 51 30 Q32 35 13 30Z', '#a8683a', 2.4) +
            lines(5, i => L(`M${20 + i * 6} 32 Q${19 + i * 6} 44 ${20 + i * 6} 57`, 1.2, WD)) +
            P('M10 37 Q32 42 54 37 L55 41 Q32 46 9 41Z', '#7d838c', 2) +
            P('M8 48 Q32 53 56 48 L56 52 Q32 57 8 52Z', '#7d838c', 2) +
            HL(19, 42, 2.6, 8, -8, 0.4),
    }),
    malle: () => ({
        back: P('M10 31 L14 12 Q32 6 50 12 L54 31Z', '#a0693a', 2.4) + L('M17 16 Q32 11 47 16', 1.6, '#caa24c'),
        front:
            R(7, 30, 50, 27, 4, '#8b5a32') + R(14, 30, 6, 27, 0, '#caa24c', 1.8) + R(44, 30, 6, 27, 0, '#caa24c', 1.8) + R(7, 30, 50, 6, 3, '#6f4624') + R(28, 33, 8, 10, 2, '#e5c364') + C(32, 39, 1.6, O) + nail(17, 50) + nail(47, 50),
    }),
    cloche: () => ({
        back: E(32, 54, 27, 5.5, '#ddd5c4', 0, 2.4) + E(32, 52.5, 24, 4, '#f2ecdd', 0, 1.6),
        front:
            `<path d="M10 52 Q9 22 32 20 Q55 22 54 52 Q32 57 10 52Z" fill="#cfe9f5" fill-opacity=".38" stroke="${O}" stroke-width="2.4" stroke-linejoin="round"/>` +
            FE(20, 34, 3, 9, '#fff', 0.7, 12) +
            C(32, 17.5, 3.4, '#caa24c', 2) +
            P('M5 54 Q32 62 59 54 L58 57 Q32 65 6 57Z', '#ddd5c4', 2),
    }),
    ecrin: pal => ({
        back: P('M9 34 L13 14 Q32 8 51 14 L55 34Z', '#3d3560', 2.4) + P('M14 18 Q32 13 50 18 L53 32 H11Z', '#5a2a4e', 1.6),
        front:
            R(7, 33, 50, 24, 4, '#2f2a4a') + R(7, 33, 50, 6, 3, '#e0b84a') + R(7, 52, 50, 5, 3, '#e0b84a') + R(27, 36, 10, 11, 2.5, '#e0b84a') + C(32, 41, 2, pal.fg === '#7a1f2b' ? '#a02c3d' : pal.fg, 1.4) + HL(15, 44, 2.4, 5, -10, 0.35),
    }),
};
// l'ordre de présentation des modèles
export const packSprite = (id, pal) => {
    const m = (MODELS[id] || MODELS.carton)(pal || { bg: '#f7eed9', fg: '#7a1f2b' });
    return { back: svg(m.back), front: svg(m.front) };
};
export const PACK_SPRITES = Object.keys(MODELS);
// l'icône de la Maison : un coffret à ruban
const inner = s => s.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
ui.maison = () => {
    const s = packSprite('ruban', { bg: '#f7eed9', fg: '#7a1f2b' });
    return inner(s.back) + inner(s.front);
};

// 1.104 : les boîtes comme produits (fabriquées à l'emballerie), vides, aux couleurs neutres
import { items, machines, SHADOW } from './kit.js';
import { BOX_OF } from '../data/ajouts/emballerie.js';
const NEUTRAL = { bg: '#f7eed9', fg: '#7a1f2b' };
for (const [pack, id] of Object.entries(BOX_OF))
    items[id] = () => {
        const s = packSprite(pack, NEUTRAL);
        return inner(s.back) + inner(s.front);
    };
// l'emballerie : un établi, une cagette en cours, un rouleau de ruban et une pile de boîtes
machines.emballerie = () =>
    SHADOW(32, 61, 28, 3) +
    R(6, 34, 52, 6, 2, '#b07a40', 2.2) +
    L('M10 40 V58 M54 40 V58', 3.4, '#6b4220') +
    L('M10 50 H54', 2, '#6b4220') +
    R(38, 20, 18, 14, 2, '#d3a76b', 2) +
    R(45, 20, 4, 14, 0, '#efe0b0', 1.2) +
    R(40, 8, 14, 12, 2, '#c98a4b', 2) +
    L('M40 13 H54', 1.4, '#9a6532') +
    R(10, 24, 20, 10, 2, '#c98a4b', 2) +
    R(10, 22, 20, 3, 1, '#9a6532', 1.6) +
    C(24, 30, 1, '#e8e2d4', 0.8) +
    C(16, 30, 1, '#e8e2d4', 0.8) +
    E(33, 30, 4, 4, '#e2582f', 0, 1.8) +
    C(33, 30, 1.4, '#fffaf0', 0) +
    L('M36 31 Q40 36 36 40', 1.6, '#e2582f');
