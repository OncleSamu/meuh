// Le bus d'événements : les règles du jeu annoncent ce qui se passe, l'interface décide comment le montrer.
// Sans interface (robot, tests), personne n'écoute et rien ne s'affiche.
const listeners = {};

export function on(type, fn) {
    (listeners[type] = listeners[type] || []).push(fn);
    return () => (listeners[type] = listeners[type].filter(f => f !== fn));
}

export function emit(type, payload) {
    const list = listeners[type];
    if (list) for (const fn of list) fn(payload);
}

// raccourcis pour les annonces les plus fréquentes
// at : l'endroit d'où part l'effet (un élément de l'interface, inconnu des règles)
export const toast = (text, icon) => emit('toast', { text, icon });
export const sfx = name => emit('sfx', name);
export const buzz = ms => emit('buzz', ms);
export const burst = (at, kind, n = 10, dy = 0) => emit('burst', { at, kind, n, dy });
// parts : textes et icônes [sorte, id] mélangés, par exemple ['+3', ['item', 'carrot']]
export const float = (at, parts, cls, dy = 0) => emit('float', { at, parts, cls, dy });
export const changed = area => emit('changed', area);
// un objet qui s'envole vers le marché (la grange)
export const fly = (at, item, qty = 1) => emit('fly', { at, item, qty });
// petit écrasement élastique, ou secousse d'erreur
export const squish = at => emit('squish', at);
export const shake = at => emit('shake', at);
// un repère d'effet désigné par son nom quand les règles n'ont pas l'élément sous la main
// (l'interface le retrouve grâce à data-anchor="sorte:i")
export const anchor = (kind, i) => ({ anchor: `${kind}:${i}` });
