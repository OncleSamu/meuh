// Les robes et les marques (1.24.2) : des gènes dominants ou récessifs, hérités des deux parents.
// L'apparence fantaisiste (couleur, motif, finition) reste celle des gènes du jeu ; la robe se lit dessous.
import { COAT } from '../data/haras.js';

const GENES = Object.keys(COAT.freq);
const dom = p => !!(p[0] || p[1]);
const give = (p, mut) => {
    const v = !!p[Math.random() < 0.5 ? 0 : 1];
    return Math.random() < mut ? !v : v;
};

// les gènes d'un cheval d'origine
export function founderCoat() {
    const c = {};
    for (const k of GENES) c[k] = [Math.random() < COAT.freq[k], Math.random() < COAT.freq[k]];
    return c;
}
// 1.24.5 : un cheval d'avant les robes garde son apparence (bai, sans marque) ; seuls des allèles cachés
// (récessifs) varient, pour que ses poulains puissent surprendre
export function legacyCoat() {
    const c = founderCoat();
    c.E = [true, Math.random() < COAT.freq.E];
    c.A = [true, Math.random() < COAT.freq.A];
    c.Br = [true, Math.random() < COAT.freq.Br];
    for (const k of ['G', 'Rn', 'D', 'etoile', 'liste', 'balzanes', 'pie', 'appaloosa', 'raie']) c[k] = [false, false];
    c.Cr = [false, false];
    c.belleface = [true, Math.random() < COAT.freq.belleface];
    c.lave = [true, Math.random() < COAT.freq.lave];
    return c;
}
// un poulain : un allèle de chaque parent, avec de rares mutations
export function crossCoat(a, b, mut = COAT.mut) {
    const A = a || founderCoat(),
        B = b || founderCoat();
    const c = {};
    for (const k of GENES) c[k] = [give(A[k] || [true, true], mut), give(B[k] || [true, true], mut)];
    return c;
}
export function robeOf(c) {
    if (!c) return 'bai';
    const black = dom(c.E),
        bay = black && dom(c.A);
    const base = !black ? 'alezan' : bay ? (dom(c.Br) ? 'bai' : 'baibrun') : 'noir';
    const cr = (c.Cr[0] ? 1 : 0) + (c.Cr[1] ? 1 : 0);
    if (dom(c.G)) return 'gris';
    if (cr === 2) return 'creme';
    if (dom(c.Rn)) return bay ? 'rouan' : !black ? 'aubere' : 'noir';
    if (dom(c.D) && bay) return 'louvet';
    if (cr === 1) return !black ? 'palomino' : bay ? 'isabelle' : 'noir';
    return base;
}
export function marksOf(c) {
    if (!c) return [];
    const m = [],
        robe = robeOf(c);
    if (!dom(c.belleface)) m.push('belleface');
    else if (dom(c.liste)) m.push('liste');
    else if (dom(c.etoile)) m.push('etoile');
    if (dom(c.balzanes)) m.push('balzanes');
    if (dom(c.pie)) m.push('pie');
    if (dom(c.appaloosa)) m.push('appaloosa');
    if (dom(c.raie) && robe !== 'louvet') m.push('raie');
    if (!dom(c.lave) && ['alezan', 'palomino', 'aubere'].includes(robe)) m.push('lave');
    return m;
}
export const coatOf = g => (g && g.coat ? { robe: robeOf(g.coat), marks: marksOf(g.coat) } : null);
// « Bai, étoile en tête, balzanes »
export function coatText(g) {
    const c = coatOf(g);
    if (!c) return '';
    return [COAT.robes[c.robe], ...c.marks.map(m => COAT.marks[m].toLowerCase())].join(', ');
}
// la clé de dessin d'une robe : « bai.etoile+balzanes »
export const coatKey = g => {
    const c = coatOf(g);
    return c ? `${c.robe}.${c.marks.join('+')}` : '';
};
// chaque gène en lettres, pour le livre généalogique (D = allèle dominant, r = récessif)
export const geneLetters = c => GENES.map(k => `${k}:${c[k].map(x => (x ? 'D' : 'r')).join('')}`).join(' ');
