// Outils communs aux tests : une horloge qu'on avance à la main et un stockage en mémoire.
import { setClock } from '../../src/core/clock.js';
import { setStore } from '../../src/core/state.js';

export const clock = { t: Date.UTC(2026, 9, 12, 10, 0, 0) };
setClock(() => clock.t);

export const memStore = () => {
    const m = new Map();
    return { getItem: k => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: k => m.delete(k), m };
};
setStore(memStore());
