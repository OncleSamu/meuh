// L'apparence d'une création : le dessin de l'espèce, modifié par ses gènes (taille, couleur, motif, auréole).
// Jamais choisie par le joueur : elle découle des gènes. Le motif est posé par-dessus, découpé à la forme du dessin.
import * as G from '../systems/index.js';
import { art } from './icons.js';
import { FEATURES, featuresOf } from '../data/genetics.js';

const SIZE = [
    [0.82, 0.82],
    [1, 1],
    [1.14, 1.14],
    [1.3, 1.3],
    [0.8, 1.1],
];
// teintes « absolues » : sepia ramène tout à une même teinte, que hue-rotate oriente ensuite
const COLOR = [
    '',
    'sepia(.9) saturate(5) hue-rotate(-45deg) brightness(.95)',
    'sepia(.9) saturate(3.2) hue-rotate(5deg) brightness(1.12)',
    'sepia(.9) saturate(3) hue-rotate(225deg) brightness(.9)',
    'grayscale(1) brightness(1.45) contrast(.9)',
    'grayscale(.4) brightness(.55) contrast(1.2)',
    'sepia(.9) saturate(3) hue-rotate(165deg) brightness(.95)',
];
const masks = new Map();
const maskOf = svg => {
    let m = masks.get(svg);
    if (!m) {
        // guillemets simples : la valeur vit dans un attribut style="…"
        m = `url('data:image/svg+xml;utf8,${encodeURIComponent(svg).replace(/'/g, '%27')}')`;
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
    const L = {
        size: ['Petite', 'Normale', 'Grosse', 'Géante', 'Fine'],
        color: ['', 'rouge', 'dorée', 'violette', 'blanche', 'sombre', 'bleutée'],
        pattern: ['', 'à taches', 'à pois', 'à rayures', 'à reflets'],
    };
    const l = G.looksOf(g);
    const parts = [L.size[l.size]];
    if (l.color) parts.push(L.color[l.color]);
    if (l.pattern) parts.push(L.pattern[l.pattern]);
    if (l.halo) parts.push('auréolée');
    return parts.join(', ');
}

// le dessin d'une bête avec ses traits de gènes (cornes, oreilles, toison), puis son apparence
export function animalKey(type, g) {
    const f = g ? G.featureLooks(g, type) : [];
    return f.some(Boolean) ? `${type}~${f.join('')}` : type;
}
export const animalArt = (type, g, cls = '') => genWrap(art('animal', animalKey(type, g)), g, cls);
// « cornes longues, toison frisée »
export function featuresText(type, g) {
    return featuresOf(type)
        .map(k => [k, G.featureOf(g, k)])
        .filter(([, v]) => v)
        .map(([k, v]) => `${FEATURES[k].name.toLowerCase()} ${FEATURES[k].list[v].toLowerCase()}`)
        .join(', ');
}

// la lignée (1.2) : grands-parents, parents, puis la création elle-même
const escName = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
function lineNode(x, me) {
    if (!x) return '<div class="ln-node empty"><span class="ln-art"></span><b>Inconnu</b></div>';
    const pic = x.t ? animalArt(x.t, x.g) : x.g ? genWrap(art('item', x.b), x.g) : art('item', x.b);
    return `<div class="ln-node${me ? ' me' : ''}"><span class="ln-art">${pic}</span><b>${escName(x.n)}</b><small>${x.gen ? `gén. ${x.gen}` : 'sauvage'}</small></div>`;
}
export function lineageHtml(self) {
    if (!self || !self.lin) return '';
    const grand = self.lin.flatMap(p => (p && p.lin ? p.lin : [null, null]));
    const hasGrand = grand.some(Boolean);
    return `<div class="lineage">
        ${hasGrand ? `<div class="ln-row four">${grand.map(x => lineNode(x)).join('')}</div><div class="ln-links four"></div>` : ''}
        <div class="ln-row two">${self.lin.map(x => lineNode(x)).join('')}</div><div class="ln-links two"></div>
        <div class="ln-row one">${lineNode(self.me, true)}</div>
    </div>`;
}
