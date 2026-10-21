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
    [0.68, 0.68], // naine
    [1, 1], // gros fruit : le dessin garde sa taille, c'est le fruit qui grossit
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
    'sepia(.8) saturate(3) hue-rotate(290deg) brightness(1.2)', // rose
    'sepia(.9) saturate(5.5) hue-rotate(-18deg) brightness(1.1)', // orange vif
    'grayscale(1) brightness(1.25) contrast(1.15)', // argentée
    'sepia(1) saturate(3.2) hue-rotate(-28deg) brightness(.92) contrast(1.05)', // cuivrée
    'sepia(.6) saturate(2) hue-rotate(200deg) brightness(1.05)', // dégradée
];
// finitions : un filtre léger et/ou un calque découpé à la forme du dessin
const FINISH_FILTER = ['', 'saturate(.8) brightness(1.06) drop-shadow(0 0 3px #bfe9ff)', '', '', 'saturate(1.3) contrast(1.1)', ''];
const SPARKS = [
    [8, 12],
    [88, 20],
    [18, 60],
    [82, 66],
    [50, 4],
    [70, 40],
    [30, 35],
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
    // le gros fruit ne vaut que pour les plantes (les bêtes gardent leur taille)
    const bigFruit = l.size === 6 && !!g.form;
    if ((l.size === 1 || l.size === 6) && !bigFruit && !l.color && !l.pattern && !l.halo && !l.finish) return svg;
    const [sx, sy] = SIZE[l.size] || SIZE[1];
    const filter = [COLOR[l.color] || '', FINISH_FILTER[l.finish] || '', l.halo ? 'drop-shadow(0 0 4px #ffd23f) drop-shadow(0 0 2px #fff6c8)' : '']
        .join(' ')
        .trim();
    const m = `-webkit-mask-image:${maskOf(svg)};mask-image:${maskOf(svg)}`;
    const ov = c => `<i class="gp ${c}" style="${m}"></i>`;
    let over = '';
    if (l.color >= 9) over += ov(`gp-c${l.color}`);
    if (l.pattern) over += ov(`gp-${l.pattern}`);
    if (l.finish && l.finish !== 3) over += ov(`gp-f${l.finish}`);
    if (l.finish === 3) over += SPARKS.map(([x, y], i) => `<b class="spk" style="left:${x}%;top:${y}%;animation-delay:${i * 0.37}s"></b>`).join('');
    const big = bigFruit ? `<div class="bigpart">${svg}</div>` : '';
    return `<span class="gl ${cls}" style="--gsx:${sx};--gsy:${sy};${filter ? `filter:${filter}` : ''}">${svg}${big}${over}</span>`;
}

// une petite description lisible de l'apparence
export function looksText(g) {
    if (!g || !g.l) return '';
    const L = {
        size: ['Petite', 'Normale', 'Grosse', 'Géante', 'Fine', 'Naine', 'Gros fruit'],
        color: ['', 'rouge', 'dorée', 'violette', 'blanche', 'sombre', 'bleutée', 'rose', 'orange vif', 'argentée', 'cuivrée', 'dégradée'],
        pattern: ['', 'à taches', 'à pois', 'à rayures', 'à reflets', 'en damier', 'zébrée', 'mouchetée fin', 'marbrée'],
        finish: ['', 'givrée', 'moussue', 'étincelante', 'vernie', 'fleurie'],
    };
    const l = G.looksOf(g);
    const parts = [L.size[l.size]];
    if (l.color) parts.push(L.color[l.color]);
    if (l.pattern) parts.push(L.pattern[l.pattern]);
    if (l.finish) parts.push(L.finish[l.finish]);
    if (l.halo) parts.push('auréolée');
    return parts.join(', ');
}

// le dessin d'une bête avec ses traits de gènes (cornes, oreilles, toison), puis son apparence
export function animalKey(type, g, stage) {
    const f = g ? G.featureLooks(g, type) : [];
    const base = f.some(Boolean) ? `${type}~${f.join('')}` : type;
    // 1.24.2 : la robe et les marques d'un cheval (et son âge : 0 poulain, 1 jeune)
    if (type === 'horse' && g && g.coat) return `${base.includes('~') ? base : type + '~'}@${G.coatKey(g)}${stage === 0 || stage === 1 ? '.' + stage : ''}`;
    return base;
}
export const animalArt = (type, g, cls = '', stage) => genWrap(art('animal', animalKey(type, g, stage)), g, cls);
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
    // 1.24.3 : un cheval champion Élite porte une couronne ; un cheval de génération 0 est « d'origine »
    const champ = x.t === 'horse' && x.u && G.isChampionUid(x.u) ? `<i class="ln-crown">${art('ui', 'hCouronne')}</i>` : '';
    return `<div class="ln-node${me ? ' me' : ''}">${champ}<span class="ln-art">${pic}</span><b>${escName(x.n)}</b><small>${x.gen ? `gén. ${x.gen}` : x.t === 'horse' ? 'd’origine' : 'sauvage'}</small></div>`;
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
