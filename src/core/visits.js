// Les visiteurs à créneaux absolus (avion-cargo, Armand) : un créneau tous les `every` ms depuis l'époque,
// le visiteur est là pendant les `stay` premières ms. Le temps réel compte, même jeu fermé.
import { now } from './clock.js';

// stay : une durée, ou une fonction qui la donne (elle peut changer avec le domaine)
export function visitor(every, stayOf) {
    const stay = () => (typeof stayOf === 'function' ? stayOf() : stayOf);
    const cycle = (t = now()) => Math.floor(t / every);
    return {
        cycle,
        arrive: (t = now()) => (cycle(t) + (t - cycle(t) * every < stay() ? 0 : 1)) * every,
        leave: () => cycle() * every + stay(),
        here: (t = now()) => t - cycle(t) * every < stay(),
    };
}
