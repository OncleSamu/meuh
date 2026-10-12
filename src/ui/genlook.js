// L'apparence d'une création : le dessin de l'espèce, modifié par ses gènes (taille, couleur, motif, auréole).
// Jamais choisie par le joueur : elle découle des gènes. Le motif est posé par-dessus, découpé à la forme du dessin.
import * as G from '../systems/index.js';

const SIZE = [
    [0.82, 0.82],
    [1, 1],
    [1.14, 1.14],
    [1.3, 1.3],
    [0.8, 1.1],
];
const COLOR = [
    '',
    'hue-rotate(-35deg) saturate(1.5)',
    'sepia(.55) saturate(2) hue-rotate(-12deg) brightness(1.06)',
    'hue-rotate(250deg) saturate(1.2)',
    'grayscale(.85) brightness(1.3)',
    'brightness(.68) saturate(1.3)',
    'hue-rotate(160deg) saturate(1.1)',
];
const masks = new Map();
const maskOf = svg => {
    let m = masks.get(svg);
    if (!m) {
        m = `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
        if (masks.size > 400) masks.clear();
        masks.set(svg, m);
    }
    return m;
};

// enveloppe un dessin selon les gènes d'apparence ; sans génome (ou génome sauvage), le dessin reste tel quel
export function genWrap(svg, g, cls = '') {
    if (!g || !g.l) return svg;
    const l = G.looksOf(g);
    if (l.size === 1 && !l.color && !l.pattern && !l.halo) return svg;
    const [sx, sy] = SIZE[l.size] || SIZE[1];
    const filter = [COLOR[l.color] || '', l.halo ? 'drop-shadow(0 0 4px #ffd23f) drop-shadow(0 0 2px #fff6c8)' : ''].join(' ').trim();
    const pat = l.pattern ? `<i class="gp gp-${l.pattern}" style="-webkit-mask-image:${maskOf(svg)};mask-image:${maskOf(svg)}"></i>` : '';
    return `<span class="gl ${cls}" style="--gsx:${sx};--gsy:${sy};${filter ? `filter:${filter}` : ''}">${svg}${pat}</span>`;
}

// une petite description lisible de l'apparence
export function looksText(g) {
    if (!g || !g.l) return '';
    const L = { size: ['Petite', 'Normale', 'Grosse', 'Géante', 'Fine'], color: ['', 'rouge', 'dorée', 'violette', 'blanche', 'sombre', 'bleutée'], pattern: ['', 'à taches', 'à pois', 'à rayures', 'à reflets'] };
    const l = G.looksOf(g);
    const parts = [L.size[l.size]];
    if (l.color) parts.push(L.color[l.color]);
    if (l.pattern) parts.push(L.pattern[l.pattern]);
    if (l.halo) parts.push('auréolée');
    return parts.join(', ');
}
