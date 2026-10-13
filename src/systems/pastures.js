// Les prés : 20 bêtes par pré, des prés à acheter, et chaque animal rangé dans le sien (a.p).
import { state } from '../core/state.js';
import { fmt } from '../core/format.js';
import { toast, sfx, buzz, burst, float, changed } from '../core/bus.js';
import { PASTURE, PASTURE_NAMES } from '../data/farm.js';
import { spend } from './player.js';
import { tip } from './tips.js';

const COIN = ['ui', 'coin'];

export const pastures = () => state.pastures;
export const inPasture = k => state.animals.filter(a => (a.p || 0) === k);
export const pastureLoad = k => inPasture(k).length;
export const pastureFree = k => PASTURE.cap - pastureLoad(k);
export const pastureCost = () => Math.floor(PASTURE.cost * Math.pow(PASTURE.mult, Math.max(0, state.pastures.length - 1)));
export const canAddPasture = () => state.pastures.length < PASTURE.max;
// le premier pré qui a de la place (en commençant par celui qu'on regarde)
export function roomyPasture(pref = 0) {
    if (pastureFree(pref) > 0) return pref;
    const k = state.pastures.findIndex((_, j) => pastureFree(j) > 0);
    return k;
}
export const herdFull = () => roomyPasture() < 0;

const newPasture = k => ({ name: PASTURE_NAMES[k] || `Pré ${k + 1}` });

// Anciennes sauvegardes : autant de prés que nécessaire, offerts, et chaque bête rangée
export function ensurePastures() {
    if (!Array.isArray(state.pastures) || !state.pastures.length) state.pastures = [newPasture(0)];
    const need = Math.min(PASTURE.max, Math.max(1, Math.ceil(state.animals.length / PASTURE.cap)));
    while (state.pastures.length < need) state.pastures.push(newPasture(state.pastures.length));
    // bêtes sans pré, ou dans un pré qui n'existe pas ou qui déborde
    const count = state.pastures.map(() => 0);
    const homeless = [];
    state.animals.forEach(a => {
        const k = a.p || 0;
        if (k < state.pastures.length && count[k] < PASTURE.cap) {
            a.p = k;
            count[k]++;
        } else homeless.push(a);
    });
    homeless.forEach(a => {
        let k = count.findIndex(c => c < PASTURE.cap);
        if (k < 0) k = state.pastures.length - 1; // au-delà de 400 bêtes : on tasse dans le dernier
        a.p = k;
        count[k]++;
    });
}

// place une nouvelle bête ; renvoie le pré choisi, ou -1 si tout est plein
export function placeAnimal(a, pref = 0) {
    const k = roomyPasture(pref);
    if (k < 0) return -1;
    a.p = k;
    if (pastureFree(k) <= 2) tip('pasture');
    return k;
}

export function buyPasture(at) {
    if (!canAddPasture()) {
        toast('Vous avez déjà tous les prés possibles', ['ui', 'flowers']);
        return false;
    }
    const cost = pastureCost();
    if (state.money < cost) {
        toast(`Il faut ${fmt(cost)} pièces pour un nouveau pré`, COIN);
        sfx('error');
        return false;
    }
    spend(cost);
    state.pastures.push(newPasture(state.pastures.length));
    sfx('buy');
    buzz(15);
    burst(at, 'sparkle', 12);
    float(at, [`-${fmt(cost)}`, COIN], 'bad', -14);
    toast(`${state.pastures[state.pastures.length - 1].name} est à vous : 20 places de plus`, ['ui', 'flowers']);
    changed('animals');
    return state.pastures.length - 1;
}

export function moveAnimal(i, k) {
    const a = state.animals[i];
    if (!a || k < 0 || k >= state.pastures.length || (a.p || 0) === k) return false;
    if (pastureFree(k) <= 0) {
        toast(`${state.pastures[k].name} est plein (20 bêtes)`, ['ui', 'flowers']);
        sfx('error');
        return false;
    }
    a.p = k;
    sfx('click');
    toast(`${a.name} part dans ${state.pastures[k].name.replace(/^Le /, 'le ')}`, ['animal', a.type]);
    changed('animals');
    return true;
}

// renommer un pré (1.2)
export function renamePasture(k, name) {
    const p = state.pastures[k];
    const n = String(name || '')
        .trim()
        .slice(0, 22);
    if (!p || !n) return false;
    p.name = n;
    toast(`Le pré s’appelle maintenant « ${n} »`, ['ui', 'flowers']);
    return true;
}
