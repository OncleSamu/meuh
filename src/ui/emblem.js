// 1.101.2 : l'emblème de la marque peut être n'importe quel dessin du jeu. Il s'écrit « genre:id » (« item:apple », « animal:cow »…) ;
// un simple identifiant (les emblèmes de la 1.100) est un produit.
import { ico } from './icons.js';

export const KINDS = ['item', 'animal', 'machine', 'villager', 'ui'];
export const emblemSpec = e => {
    const s = String(e || 'apple');
    const i = s.indexOf(':');
    return i > 0 && KINDS.includes(s.slice(0, i)) ? [s.slice(0, i), s.slice(i + 1)] : ['item', s];
};
export const emblemIco = (e, cls = 'ico') => ico(emblemSpec(e), cls);
