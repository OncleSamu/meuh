// Icônes : [sorte, id] → dessin. Sortes : item, seed, animal, machine, villager, ui ; q = étoile de qualité.
import { sprite, SPR } from '../art/index.js';
import { QUALITY } from '../data/farm.js';

const cache = new Map();
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
                    ? SPR.plant(...String(id).split(':').map((x, i) => (i ? +x : x)))
                    : sprite(kind, id);
        cache.set(key, s);
    }
    return s;
}

export const qStar = (q, cls = 'qstar') =>
    q
        ? `<svg class="${cls}" viewBox="0 0 20 20"><path d="M10 1l2.6 5.6 6.1.7-4.5 4.2 1.2 6L10 14.5 4.6 17.5l1.2-6L1.3 7.3l6.1-.7z" fill="${QUALITY[q].color}" stroke="#3a2618" stroke-width="1.6" stroke-linejoin="round"/></svg>`
        : '';

// l'icône en ligne, à la taille du texte
export function ico(spec, cls = 'ico') {
    if (!spec) return '';
    const [kind, id] = spec;
    if (kind === 'q') return id ? `<i class="${cls}">${qStar(id, 'spr')}</i>` : '';
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
