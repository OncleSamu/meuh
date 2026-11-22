// L'apparence d'une création : le dessin de l'espèce, modifié par ses gènes (taille, couleur, motif, auréole).
// Jamais choisie par le joueur : elle découle des gènes. Le motif est posé par-dessus, découpé à la forme du dessin.
import * as G from '../systems/index.js';
import { state } from '../core/state.js';
import { art, qStar, ico } from './icons.js';
import { FEATURES, featuresOf, PLANT_TRAITS, ANIMAL_TRAITS } from '../data/genetics.js';

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
    // 1.154 : 7 nouvelles teintes mutantes
    'sepia(.95) saturate(3.4) hue-rotate(85deg) brightness(.88) contrast(1.08)', // émeraude
    'sepia(.9) saturate(3.8) hue-rotate(138deg) brightness(1.05)', // turquoise
    'sepia(1) saturate(4.2) hue-rotate(-5deg) brightness(1.05)', // ambre
    'sepia(.7) saturate(2.2) hue-rotate(235deg) brightness(1.22)', // lavande
    'grayscale(.7) brightness(.44) contrast(1.38)', // obsidienne
    'sepia(.75) saturate(3.2) hue-rotate(-22deg) brightness(1.04)', // crépuscule
    'grayscale(.65) brightness(1.32) contrast(.96)', // opale
];
// finitions : un filtre léger et/ou un calque découpé à la forme du dessin
const FINISH_FILTER = [
    '',
    'saturate(.8) brightness(1.06) drop-shadow(0 0 3px #bfe9ff)', // 1 givrée
    '', // 2 moussue
    '', // 3 étincelles
    'saturate(1.3) contrast(1.1)', // 4 vernie
    '', // 5 fleurie
    'brightness(1.08) drop-shadow(0 0 4px #4ff2c8) drop-shadow(0 0 2px #bfffea)', // 6 bioluminescente
    'saturate(1.18) brightness(1.1) contrast(1.08) drop-shadow(0 0 3px #d8f3ff)', // 7 cristalline
    'contrast(1.06)', // 8 kintsugi
    'brightness(1.05) saturate(1.08)', // 9 rosée
    'brightness(1.1) saturate(1.12) drop-shadow(0 0 3px rgba(255,215,245,.8))', // 10 nacrée
    'contrast(1.08) drop-shadow(0 0 3px rgba(140,165,255,.7))', // 11 étoilée
    'saturate(1.12)', // 12 automnale
    'saturate(1.25) brightness(1.08) drop-shadow(0 0 4px #ffae34)', // 13 solaire
];
const SPARKS = [
    [8, 12],
    [88, 20],
    [18, 60],
    [82, 66],
    [50, 4],
    [70, 40],
    [30, 35],
];
const FIREFLIES = [
    [12, 22],
    [84, 16],
    [20, 74],
    [80, 68],
    [52, 8],
];
// 1.154 : décors SVG propres aux morphologies des plantes (couronne florale, vrilles, pot bonsaï)
const MORPH_CROWN =
    '<svg class="morph-svg morph-crown" viewBox="0 0 64 64" aria-hidden="true">' +
    '<path d="M16 17 Q32 9 48 17" fill="none" stroke="#4da83b" stroke-width="2.6" stroke-linecap="round"/>' +
    '<circle cx="19" cy="15" r="4.5" fill="#f79ab6" stroke="#3a2618" stroke-width="1.5"/><circle cx="19" cy="15" r="1.7" fill="#ffd23f"/>' +
    '<circle cx="32" cy="11" r="5.2" fill="#fffaf0" stroke="#3a2618" stroke-width="1.6"/><circle cx="32" cy="11" r="2" fill="#ffd23f"/>' +
    '<circle cx="45" cy="15" r="4.5" fill="#c4a6f7" stroke="#3a2618" stroke-width="1.5"/><circle cx="45" cy="15" r="1.7" fill="#ffd23f"/>' +
    '</svg>';
const MORPH_VINE =
    '<svg class="morph-svg morph-vine" viewBox="0 0 64 64" aria-hidden="true">' +
    '<path d="M12 46 C4 38 7 24 16 24 C20 24 20 30 15 30 C12 30 12 26 15 26" fill="none" stroke="#3f9432" stroke-width="2.4" stroke-linecap="round"/>' +
    '<path d="M52 44 C60 36 57 22 48 22 C44 22 44 28 49 28 C52 28 52 24 49 24" fill="none" stroke="#3f9432" stroke-width="2.4" stroke-linecap="round"/>' +
    '<ellipse cx="9" cy="36" rx="3.4" ry="2" transform="rotate(-35 9 36)" fill="#6cc04a" stroke="#3a2618" stroke-width="1.2"/>' +
    '<ellipse cx="55" cy="34" rx="3.4" ry="2" transform="rotate(35 55 34)" fill="#6cc04a" stroke="#3a2618" stroke-width="1.2"/>' +
    '</svg>';
const MORPH_BONSAI =
    '<svg class="morph-svg morph-bonsai" viewBox="0 0 64 64" aria-hidden="true">' +
    '<path d="M15 49 L49 49 L45 59 L19 59Z" fill="#9c4f2b" stroke="#3a2618" stroke-width="2" stroke-linejoin="round"/>' +
    '<rect x="12" y="46" width="40" height="4.5" rx="2" fill="#be663a" stroke="#3a2618" stroke-width="1.8"/>' +
    '<ellipse cx="32" cy="46.5" rx="14" ry="2.2" fill="#5aa13e" opacity=".85"/>' +
    '</svg>';
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
    const isPlant = !!g.form;
    // le gros fruit et les morphologies ne valent que pour les plantes
    const bigFruit = l.size === 6 && isPlant;
    const morph = isPlant ? l.morph || 0 : 0;
    if ((l.size === 1 || l.size === 6) && !bigFruit && !l.color && !l.pattern && !l.halo && !l.finish && !morph) return svg;
    let [sx, sy] = SIZE[l.size] || SIZE[1];
    if (morph === 6) {
        sx *= 0.82;
        sy *= 0.82;
    }
    const filter = [
        COLOR[l.color] || '',
        FINISH_FILTER[l.finish] || '',
        morph === 5 ? 'drop-shadow(0 0 2px rgba(255,232,214,.95))' : '',
        l.halo ? 'drop-shadow(0 0 4px #ffd23f) drop-shadow(0 0 2px #fff6c8)' : '',
    ]
        .join(' ')
        .trim();
    const m = `-webkit-mask-image:${maskOf(svg)};mask-image:${maskOf(svg)}`;
    const ov = c => `<i class="gp ${c}" style="${m}"></i>`;
    let over = '';
    if (l.color >= 9) over += ov(`gp-c${l.color}`);
    if (l.pattern) over += ov(`gp-${l.pattern}`);
    if (l.finish && l.finish !== 3) over += ov(`gp-f${l.finish}`);
    if (l.finish === 3) over += SPARKS.map(([x, y], i) => `<b class="spk" style="left:${x}%;top:${y}%;animation-delay:${i * 0.37}s"></b>`).join('');
    if (l.finish === 6) over += FIREFLIES.map(([x, y], i) => `<b class="ffly" style="left:${x}%;top:${y}%;animation-delay:${i * 0.55}s"></b>`).join('');
    if (l.finish === 13) over += SPARKS.slice(0, 5).map(([x, y], i) => `<b class="spk sun" style="left:${x}%;top:${y}%;animation-delay:${i * 0.42}s"></b>`).join('');
    if (morph === 1) over += ov('gp-m1');
    if (morph === 5) over += ov('gp-m5');
    if (morph === 3) over += MORPH_CROWN;
    if (morph === 4) over += MORPH_VINE;
    const pre = morph === 2 ? `<div class="morph-twin">${svg}</div>` : '';
    const post = morph === 6 ? MORPH_BONSAI : '';
    const big = bigFruit ? `<div class="bigpart">${svg}</div>` : '';
    return `<span class="gl${morph === 6 ? ' gl-bonsai' : ''} ${cls}" style="--gsx:${sx};--gsy:${sy};${filter ? `filter:${filter}` : ''}">${pre}${svg}${big}${over}${post}</span>`;
}

// 1.24.5 : la couleur des gènes appliquée à une couleur précise (les chevaux des mini-jeux sont dessinés couleur par couleur,
// sans filtre CSS) : on rejoue les filtres sepia, saturate, hue-rotate, brightness, grayscale et contrast sur la couleur
const MAT = {
    grayscale: a => {
        const k = 1 - a;
        return [
            0.2126 + 0.7874 * k,
            0.7152 - 0.7152 * k,
            0.0722 - 0.0722 * k,
            0.2126 - 0.2126 * k,
            0.7152 + 0.2848 * k,
            0.0722 - 0.0722 * k,
            0.2126 - 0.2126 * k,
            0.7152 - 0.7152 * k,
            0.0722 + 0.9278 * k,
        ];
    },
    sepia: a => {
        const k = 1 - a;
        return [
            0.393 + 0.607 * k,
            0.769 - 0.769 * k,
            0.189 - 0.189 * k,
            0.349 - 0.349 * k,
            0.686 + 0.314 * k,
            0.168 - 0.168 * k,
            0.272 - 0.272 * k,
            0.534 - 0.534 * k,
            0.131 + 0.869 * k,
        ];
    },
    saturate: s => [
        0.213 + 0.787 * s,
        0.715 - 0.715 * s,
        0.072 - 0.072 * s,
        0.213 - 0.213 * s,
        0.715 + 0.285 * s,
        0.072 - 0.072 * s,
        0.213 - 0.213 * s,
        0.715 - 0.715 * s,
        0.072 + 0.928 * s,
    ],
    'hue-rotate': deg => {
        const a = (deg * Math.PI) / 180,
            c = Math.cos(a),
            n = Math.sin(a);
        return [
            0.213 + c * 0.787 - n * 0.213,
            0.715 - c * 0.715 - n * 0.715,
            0.072 - c * 0.072 + n * 0.928,
            0.213 - c * 0.213 + n * 0.143,
            0.715 + c * 0.285 + n * 0.14,
            0.072 - c * 0.072 - n * 0.283,
            0.213 - c * 0.213 - n * 0.787,
            0.715 - c * 0.715 + n * 0.715,
            0.072 + c * 0.928 + n * 0.072,
        ];
    },
};
const clamp1 = x => Math.max(0, Math.min(1, x));
export function filterHex(hex, filter) {
    let c = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255);
    for (const [, fn, arg] of String(filter || '').matchAll(/([a-z-]+)\(([-\d.]+)(?:deg)?\)/g)) {
        const v = +arg;
        if (MAT[fn]) {
            const m = MAT[fn](v);
            c = [0, 1, 2].map(r => clamp1(m[r * 3] * c[0] + m[r * 3 + 1] * c[1] + m[r * 3 + 2] * c[2]));
        } else if (fn === 'brightness') c = c.map(x => clamp1(x * v));
        else if (fn === 'contrast') c = c.map(x => clamp1((x - 0.5) * v + 0.5));
    }
    return (
        '#' +
        c
            .map(x =>
                Math.round(x * 255)
                    .toString(16)
                    .padStart(2, '0'),
            )
            .join('')
    );
}
// la couleur d'un dessin, teintée comme le ferait genWrap pour ce génome
export const tintHex = (hex, g) => {
    if (!g || !g.l || !hex) return hex;
    const col = G.looksOf(g).color;
    return col ? filterHex(hex, COLOR[col]) : hex;
};

// une petite description lisible de l'apparence
export function looksText(g) {
    if (!g || !g.l) return '';
    const L = {
        size: ['Petite', 'Normale', 'Grosse', 'Géante', 'Fine', 'Naine', 'Gros fruit'],
        color: [
            '',
            'rouge',
            'dorée',
            'violette',
            'blanche',
            'sombre',
            'bleutée',
            'rose',
            'orange vif',
            'argentée',
            'cuivrée',
            'dégradée',
            'émeraude',
            'turquoise',
            'ambre',
            'lavande',
            'obsidienne',
            'crépuscule',
            'opale',
        ],
        pattern: [
            '',
            'à taches',
            'à pois',
            'à rayures',
            'à reflets',
            'en damier',
            'zébrée',
            'mouchetée fin',
            'marbrée',
            'tigrée',
            'à écailles',
            'à spirales',
            'bicolore',
            'à cœurs',
            'à flocons',
            'nervurée',
            'calico',
        ],
        finish: [
            '',
            'givrée',
            'moussue',
            'étincelante',
            'vernie',
            'fleurie',
            'bioluminescente',
            'cristalline',
            'kintsugi',
            'de rosée',
            'nacrée',
            'étoilée',
            'automnale',
            'solaire',
        ],
        morph: ['', 'panachée', 'à fruits jumeaux', 'à couronne florale', 'à vrilles', 'veloutée', 'bonsaï'],
    };
    const l = G.looksOf(g);
    const parts = [L.size[l.size]];
    if (l.color) parts.push(L.color[l.color]);
    if (l.pattern) parts.push(L.pattern[l.pattern]);
    if (g.form && l.morph) parts.push(L.morph[l.morph]);
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
// 1.119 : les caractères d'un ancêtre, lus dans sa fiche (un chiffre par gène)
// pour un ancêtre noté avant 1.119, on relit la variété ou la bête si elle est encore à la ferme
function liveKey(x) {
    if (x.k) return x.k;
    const st = state;
    if (x.t) {
        const a = x.u && (st.animals || []).find(b => b.uid === x.u);
        return a ? G.traitKey(a.g, G.ANIMAL_IDS) || '' : '';
    }
    // une plante sauvage : les caractères de son espèce
    if (!x.gen && x.b) return G.traitKey(G.wildPlant(x.b), G.PLANT_IDS) || '';
    const v = Object.values((st.genetics && st.genetics.vars) || {}).find(y => G.varName(y) === x.n);
    return v ? G.traitKey(v.g, G.PLANT_IDS) || '' : '';
}
export function nodeTraits(x) {
    if (!x) return [];
    const k = liveKey(x);
    if (!k) return [];
    x = { ...x, k };
    const list = x.t ? ANIMAL_TRAITS.filter(t => !t.species || t.species.includes(x.t)) : PLANT_TRAITS;
    const ids = (x.t ? ANIMAL_TRAITS : PLANT_TRAITS).map(t => t.id);
    return list.map(t => ({ t, v: +x.k[ids.indexOf(t.id)] || 0 })).filter(o => o.v > 0);
}
// les deux plus forts, en petits badges sous le portrait
const topTraits = x =>
    nodeTraits(x)
        .filter(o => !o.t.extra)
        .sort((a, b) => b.v - a.v)
        .slice(0, 2);
// chaque nœud dessiné reçoit un numéro (les 200 derniers sont gardés pour la fiche au toucher)
const lnNodes = new Map();
let lnSeq = 0;
export const lineNodeAt = i => lnNodes.get(i) || null;
function lineNode(x, me) {
    if (!x) return '<div class="ln-node empty"><span class="ln-art"></span><b>Inconnu</b></div>';
    const pic = x.t ? animalArt(x.t, x.g) : x.g ? genWrap(art('item', x.b), x.g) : art('item', x.b);
    // 1.24.3 : un cheval champion Élite porte une couronne ; un cheval de génération 0 est « d'origine »
    const champ = x.t === 'horse' && x.u && G.isChampionUid(x.u) ? `<i class="ln-crown">${art('ui', 'hCouronne')}</i>` : '';
    const top = topTraits(x);
    const tr = top.length ? `<span class="ln-tr">${top.map(o => `<i title="${o.t.name}">${ico(o.t.icon)}${o.v}</i>`).join('')}</span>` : '';
    const id = ++lnSeq;
    lnNodes.set(id, x);
    if (lnNodes.size > 200) lnNodes.delete(lnNodes.keys().next().value);
    return `<button type="button" class="ln-node${me ? ' me' : ''}" data-act="lnNode" data-i="${id}" aria-label="Voir ${escName(x.n)}">${champ}<span class="ln-art">${pic}</span><b>${escName(x.n)}</b><small>${x.gen ? `gén. ${x.gen}` : x.t === 'horse' ? 'd’origine' : 'sauvage'}</small>${tr}</button>`;
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

// 1.62 : les rangs des produits d'une variété (argent, or, platine, diamant)
const QN = ['', 'argent', 'or', 'platine', 'diamant'];
export const varRankChips = vid => {
    const r = G.varRanks(vid);
    const chips = [4, 3, 2, 1].filter(k => r[k]).map(k => `<span class="qchip">${qStar(k)}${r[k]} ${QN[k]}</span>`);
    return chips.length ? `<span class="var-ranks">${chips.join('')}</span>` : '';
};

// 1.121 : le sachet de graines d'une variété : le sachet kraft, et la variété (couleur, motif) dans sa fenêtre
export const packArt = v => `<span class="pack-art">${art('ui', 'seedPack')}<span class="pack-in">${genWrap(art('item', v.base), v.g)}</span></span>`;
