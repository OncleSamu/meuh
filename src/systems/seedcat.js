// 1.120 : le catalogue de semences. On y inscrit jusqu'à trois variétés fixées ; les voisins en commandent des sachets
// (une commande toutes les deux heures, trois en attente au plus, absence comprise). On les livre avec ses propres graines.
import { state, scaleLvl } from '../core/state.js';
import { now } from '../core/clock.js';
import { toast, sfx, float } from '../core/bus.js';
import { fmt, pickRand } from '../core/format.js';
import { RIVALS } from '../data/village.js';
import { FLAVORS, PLANT_BASE } from '../data/genetics.js';
import { SEEDCAT } from '../data/brewfest.js';
import { seedbankOpen, fixedVarieties, variety, varName, seedPrice, traitOf, FLAVOR_IDS } from './genetics.js';
import { earn, addXp } from './player.js';

export const catOpen = () => !!state.genetics && seedbankOpen();
export function ensureCat() {
    const G = state.genetics;
    if (!G.cat || typeof G.cat !== 'object') G.cat = { ids: [], orders: [], at: now(), n: 0 };
    const c = G.cat;
    // une variété disparue (composteur) sort du catalogue et de ses commandes
    c.ids = c.ids.filter(id => G.vars[id] && G.vars[id].fixed);
    c.orders = c.orders.filter(o => c.ids.includes(o.vid) || (G.vars[o.vid] && G.vars[o.vid].fixed));
    return c;
}
export const catIds = () => (catOpen() ? ensureCat().ids : []);
export const inCat = id => catIds().includes(id);

// ce qui fait la réputation d'une variété : ses caractères au-dessus de l'espèce (saveurs, pousse, soif, froid, rendement)
export function varMerit(v) {
    if (!v || !v.g) return 0;
    const base = FLAVORS[v.base] || [0, 0, 0, 0, 0];
    let m = FLAVOR_IDS.reduce((a, k, j) => a + Math.max(0, traitOf(v.g, k) - base[j]), 0);
    for (const [k, b] of Object.entries(PLANT_BASE)) m += Math.max(0, traitOf(v.g, k) - b);
    return m;
}
export const meritMult = v => 1 + Math.min(SEEDCAT.meritMax, varMerit(v) * SEEDCAT.merit);
export const catPay = (v, n) => Math.round(((SEEDCAT.fee * (1 + scaleLvl() * 0.1) + n * seedPrice(v) * SEEDCAT.mult) * meritMult(v)) / 10) * 10;

export function toggleCat(id) {
    if (!catOpen()) return false;
    const c = ensureCat();
    const v = variety(id);
    if (!v || !v.fixed) return false;
    if (c.ids.includes(id)) c.ids = c.ids.filter(x => x !== id);
    else {
        if (c.ids.length >= SEEDCAT.slots) {
            toast(`Le catalogue tient ${SEEDCAT.slots} variétés : retirez-en une d’abord`, ['ui', 'packet']);
            sfx('error');
            return false;
        }
        c.ids.push(id);
        if (!c.orders.length && c.ids.length === 1) c.at = now() - SEEDCAT.every; // la première commande arrive vite
    }
    sfx('pop');
    return true;
}

// les commandes arrivent avec le temps, même absent
export function catTick(t = now()) {
    if (!catOpen()) return false;
    const c = ensureCat();
    if (!c.ids.length) {
        c.at = t;
        return false;
    }
    let ch = false;
    if (t - c.at > SEEDCAT.every * (SEEDCAT.max + 1)) c.at = t - SEEDCAT.every * SEEDCAT.max;
    while (t - c.at >= SEEDCAT.every) {
        c.at += SEEDCAT.every;
        if (c.orders.length >= SEEDCAT.max) continue;
        const vid = pickRand(c.ids);
        const n = pickRand(SEEDCAT.sizes);
        const r = pickRand(RIVALS);
        c.orders.push({ id: ++c.n, vid, n, who: r.owner });
        ch = true;
    }
    return ch;
}
export const catOrders = () => (catOpen() ? ensureCat().orders : []);
export const catReady = () => catOrders().filter(o => (state.genetics.seeds[o.vid] || 0) >= o.n).length;

export function deliverCat(oid, at) {
    const c = ensureCat();
    const o = c.orders.find(x => x.id === +oid);
    if (!o) return false;
    const v = variety(o.vid);
    const G = state.genetics;
    if (!v || (G.seeds[o.vid] || 0) < o.n) {
        toast('Pas assez de graines de cette variété : semez-la, ses récoltes en rendent', ['ui', 'packet']);
        sfx('error');
        return false;
    }
    G.seeds[o.vid] -= o.n;
    const pay = catPay(v, o.n);
    c.orders = c.orders.filter(x => x !== o);
    earn(pay, at);
    addXp(Math.round(pay * 0.02), at);
    state.stats.seedOrders = (state.stats.seedOrders || 0) + 1;
    sfx('coin');
    float(at, [`+${fmt(pay)}`, ['ui', 'coin']], 'good', -14);
    toast(`${o.who} est ravi(e) de ses ${o.n} graines de ${varName(v)}`, ['ui', 'packet']);
    return true;
}
export const catChoices = () => (catOpen() ? fixedVarieties() : []);
