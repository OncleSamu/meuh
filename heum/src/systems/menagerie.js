// Heum — la Ménagerie : des bêtes à rôle, qui se chargent de Contamination en pâturant.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { toast, sfx } from '../core/bus.js';
import { ANIMALS, CHARGE } from '../data/world.js';
import { spend, give, addXp, lvlOk } from './player.js';
import { addCont } from './contamination.js';

const NAMES = { hen: ['Cocotte', 'Grisette', 'Pépite', 'Rouille'], goat: ['Biquette', 'Ferraille', 'Noisette'] };
export const countOf = type => state.animals.filter(a => a.type === type).length;
export const canBuy = type => countOf(type) < ANIMALS[type].max;

export function buyAnimal(type) {
    const d = ANIMALS[type];
    if (!d || !lvlOk(d.lvl, d.name)) return false;
    if (!canBuy(type)) {
        toast(`L’enclos est plein pour les ${d.name.toLowerCase()}s`);
        return false;
    }
    if (!spend(d.price)) {
        toast(`Il faut ${d.price} pièces`);
        sfx('error');
        return false;
    }
    const n = countOf(type);
    state.animals.push({ type, name: NAMES[type][n % NAMES[type].length], charge: 0, at: now(), clean: 0, stock: [] });
    sfx('animal');
    return true;
}
// ce que la bête produit selon sa Charge : ordinaire à vide, mutagène à moitié, rien quand elle est pleine
export const prodOf = a => (a.charge >= 100 ? null : a.charge >= 50 ? ANIMALS[a.type].prodMut : ANIMALS[a.type].prod);
export const chargeLabel = a =>
    a.charge >= 100 ? 'pleine : elle ne produit plus' : a.charge >= 50 ? 'à moitié : produit mutagène' : 'faible : produit ordinaire';

export function animalTick(dt) {
    const c = state.cont;
    for (const a of state.animals) {
        const d = ANIMALS[a.type];
        a.charge = Math.max(0, Math.min(100, a.charge + (c >= 30 ? (CHARGE.up * c) / 30 : -CHARGE.down) * (dt / 60)));
        // la production : un produit par cycle, jusqu'à 3 en attente
        a.wait = (a.wait || 0) + dt;
        while (a.wait >= d.every) {
            a.wait -= d.every;
            const p = prodOf(a);
            if (p && a.stock.length < 3) a.stock.push(p);
        }
        // la chèvre nettoie
        if (d.clean) {
            a.clean += dt;
            while (a.clean >= d.clean) {
                a.clean -= d.clean;
                addCont(-1);
            }
        }
    }
}
export function collectAnimal(k) {
    const a = state.animals[k];
    if (!a || !a.stock.length) return 0;
    const n = a.stock.length;
    for (const id of a.stock) give(id, 1);
    addXp(n * 2);
    a.stock = [];
    sfx('collect');
    return n;
}
export const animalLeft = a => Math.max(0, ANIMALS[a.type].every - (a.wait || 0));
