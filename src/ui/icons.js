// Icônes : [sorte, id] → dessin. Sortes : item, seed, animal, machine, villager, ui ; q = étoile de qualité.
import { sprite, SPR } from '../art/index.js';
import { QUALITY } from '../data/farm.js';

const cache = new Map();
// un dessin manquant ne doit jamais casser l'écran
function safeSprite(kind, id) {
    try {
        return sprite(kind, id);
    } catch (e) {
        console.warn('dessin introuvable', kind, id);
        return '';
    }
}
export function art(kind, id) {
    const key = kind + ':' + id;
    let s = cache.get(key);
    if (s === undefined) {
        s =
            kind === 'building'
                ? SPR.building(id, 2)
                : kind === 'house'
                  ? SPR.farmhouse(+id)
                  : kind === 'plant'
                    ? SPR.plant(
                          ...String(id)
                              .split(':')
                              .map((x, i) => (i ? +x : x)),
                      )
                    : safeSprite(kind, id);
        cache.set(key, s);
    }
    return s;
}

const STAR = 'M10 1l2.6 5.6 6.1.7-4.5 4.2 1.2 6L10 14.5 4.6 17.5l1.2-6L1.3 7.3l6.1-.7z';
const GEM = 'M5.5 2.5h9l4 5.5L10 18.5 1.5 8z';
// l'étoile du rang ; le diamant est une pierre taillée
export const qStar = (q, cls = 'qstar') =>
    q
        ? `<svg class="${cls}" viewBox="0 0 20 20"><path d="${q === 4 ? GEM : STAR}" fill="${QUALITY[q].color}" stroke="#3a2618" stroke-width="1.6" stroke-linejoin="round"/>${q === 4 ? '<path d="M1.5 8h17M7.5 2.5L10 8l2.5-5.5M6 8l4 10.5L14 8" fill="none" stroke="#3a2618" stroke-width="1" stroke-linejoin="round" opacity=".55"/>' : q === 3 ? '<path d="M10 5.5l1.1 2.4 2.6.3-1.9 1.8.5 2.6L10 11.3 7.7 12.6l.5-2.6-1.9-1.8 2.6-.3z" fill="#fff" opacity=".6"/>' : ''}</svg>`
        : '';

// l'icône en ligne, à la taille du texte
export function ico(spec, cls = 'ico') {
    if (!spec) return '';
    const [kind, id] = spec;
    if (kind === 'q' || kind === 'star') return id ? `<i class="${cls}">${qStar(id, 'spr')}</i>` : '';
    if (kind === 'coin') return `<i class="${cls}">${art('ui', 'coin')}</i>`;
    return `<i class="${cls}">${art(kind, id)}</i>`;
}
export const COIN = () => ico(['ui', 'coin']);
export { SPR };

// textes et icônes mélangés (annonces des règles du jeu)
export const parts = list =>
    (list || [])
        .map(p => (Array.isArray(p) ? ico(p) : p === '' || p == null ? '' : `<span>${String(p).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</span>`))
        .join('');
