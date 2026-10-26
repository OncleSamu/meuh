// L'Élevage (1.45) : la foire aux bestiaux (des acheteurs avec une demande précise), les bêtes de choix des voisins,
// et la réputation de l'élevage. Le nom de l'élevage est celui du haras (stud.js).
import { state, scaleLvl, lvOk } from '../core/state.js';
import { now, today } from '../core/clock.js';
import { view } from '../core/view.js';
import { fmt, pickRand, dateKey } from '../core/format.js';
import { toast, sfx, buzz, burst, float, changed } from '../core/bus.js';
import { ANIMALS, BIRTHS } from '../data/animals.js';
import { RIVALS, VILLAGERS } from '../data/village.js';
import { FAIR, PASSERS, REPUTATION, REP_BONUS, NBEASTS, COMICE } from '../data/elevage.js';
import { ANIMAL_TRAITS } from '../data/genetics.js';
import { isAdult, newAnimal, collectAnimal } from './animals.js';
import { isAway } from './port.js';
import { placeAnimal, herdFull } from './pastures.js';
import { breeding, animalTrait, animalBase, animalGain, looksOf, featureLooks, labOpen, CORE_ANIMAL } from './genetics.js';
import { earn, spend, addXp } from './player.js';
import { presentVillagers } from './home.js';
import { addFriendship } from './village.js';
import { nHearts } from './nmarket.js';
import { tip } from './tips.js';

export const fairOpen = () => state.level >= FAIR.lvl;
const SKIP = BIRTHS.skip;
export const BIRTHS_SKIP = SKIP;

export function ensureElevage() {
    if (!state.elevage || typeof state.elevage !== 'object') state.elevage = {};
    const e = state.elevage;
    e.rep = e.rep || 0;
    e.buyers = Array.isArray(e.buyers) ? e.buyers : [];
    e.next = e.next || 0;
    e.beasts = e.beasts && e.beasts.day ? e.beasts : { day: '', list: [] };
    // 1.45 : le nom par défaut du haras devient celui de tout l'élevage
    if (state.haras && state.haras.stud && state.haras.stud.name === 'Haras des Quatre Vents') state.haras.stud.name = 'Les Quatre Vents';
    return e;
}

// ---------------- la réputation ----------------
export const elevRepPts = () => (state.elevage && state.elevage.rep) || 0;
export const elevRepTier = () => REPUTATION.reduce((r, R, k) => (elevRepPts() >= R.pts ? k : r), 0);
export const elevRepName = () => REPUTATION[elevRepTier()].name;
export const elevRepNext = () => REPUTATION[elevRepTier() + 1] || null;
export const elevRepBonus = () => elevRepTier() * REP_BONUS;
export function addElevRep(n, why) {
    const e = ensureElevage();
    const before = elevRepTier();
    e.rep += n;
    if (elevRepTier() > before && view.started) {
        toast(`Votre élevage devient « ${elevRepName()} » : +${Math.round(elevRepBonus() * 100)} % à la foire`, ['ui', 'hEcusson']);
        sfx('level');
        tip('reputation');
    }
    return why;
}

// ---------------- les acheteurs ----------------
export const fairSlots = () => FAIR.slots.reduce((n, [l, s]) => (state.level >= l ? s : n), 0);
const sellable = a => isAdult(a) && !a.sick && !isAway(a) && !a.box && !breeding(a.uid) && !SKIP.includes(a.type);
export const ANIMAL_TRAIT_NAME = k => (ANIMAL_TRAITS.find(t => t.id === k) || {}).name || k;
const traitName = k => (ANIMAL_TRAITS.find(t => t.id === k) || {}).name || k;
// les espèces que l'on a, et que la foire achète
const ownedTypes = () => [...new Set(state.animals.filter(a => !SKIP.includes(a.type)).map(a => a.type))];

function maxReqs() {
    const l = state.level;
    return Math.min(3, (l < 20 ? 1 : l < 35 ? 2 : 3) + (elevRepTier() >= 3 ? 1 : 0));
}

export function makeBuyer() {
    const types = ownedTypes();
    if (!types.length) return null;
    // qui achète : un acheteur de passage, un villageois ou une ferme voisine
    const r = Math.random();
    let who, type, likes;
    const passers = PASSERS.filter(p => !p.types || p.types.some(t => types.includes(t)));
    if (r < 0.4 && passers.length) {
        const p = pickRand(passers);
        type = pickRand(p.types ? p.types.filter(t => types.includes(t)) : types);
        who = { kind: 'passer', id: p.id };
        likes = p.likes;
        if (p.looks && Math.random() < 0.7) likes = ['look'];
    } else if (r < 0.75) {
        const v = pickRand(presentVillagers().filter(id => VILLAGERS[id]) || []);
        if (!v) return null;
        type = pickRand(types);
        who = { kind: 'villager', id: v };
    } else {
        type = pickRand(types);
        who = { kind: 'neighbor', id: Math.floor(Math.random() * RIVALS.length) };
    }
    const cost = ANIMALS[type].cost;
    const count = cost < 1000 ? 1 + Math.floor(Math.random() * 3) : cost < 6000 ? 1 + Math.floor(Math.random() * 2) : 1;
    // les exigences : plus nombreuses avec le niveau et la réputation ; au début, souvent aucune
    let nr = Math.floor(Math.random() * (maxReqs() + 1));
    if (state.level < 20 && Math.random() < 0.5) nr = 0;
    const reqs = [];
    for (let k = 0; k < nr; k++) {
        // la première exigence suit le goût de l'acheteur, les autres au hasard
        const pick = k === 0 && likes && likes.length ? pickRand(likes) : pickRand(CORE_ANIMAL);
        if (pick === 'look' || (Math.random() < 0.15 && !reqs.some(x => x.k === 'look'))) {
            if (!reqs.some(x => x.k === 'look')) reqs.push({ k: 'look' });
            continue;
        }
        if (reqs.some(x => x.trait === pick)) continue;
        const base = animalBase({ type }, pick);
        const up = 1 + (state.level >= 25 && Math.random() < 0.4 ? 1 : 0);
        reqs.push({ k: 'gene', trait: pick, min: Math.min(5, base + up) });
    }
    // une race fixée : seulement quand le labo est ouvert (et pas toujours)
    if (labOpen() && Math.random() < 0.2) reqs.push({ k: 'race' });
    // une bête primée au Comice (dès qu'on en a une)
    if (state.level >= COMICE.lvl && state.animals.some(a => a.prize && a.type === type) && Math.random() < 0.3) reqs.push({ k: 'prize' });
    return { who, type, count, reqs, until: now() + FAIR.stay, id: 'b' + now() + Math.floor(Math.random() * 1000) };
}

export function buyerPrice(b) {
    const n = b.reqs.filter(r => r.k === 'gene' || r.k === 'look').length;
    let per = ANIMALS[b.type].cost * FAIR.base * Math.pow(FAIR.perReq, n);
    if (b.reqs.some(r => r.k === 'race')) per *= FAIR.race;
    if (b.reqs.some(r => r.k === 'prize')) per *= FAIR.prize;
    per *= 1 + elevRepBonus();
    return Math.round((per * b.count) / 5) * 5;
}

const hasLook = a => {
    if (!a.g) return false;
    const l = looksOf(a.g);
    return !!(l.color || l.pattern || l.finish || l.halo || featureLooks(a.g, a.type).some(Boolean));
};
export function meetsReq(a, r) {
    if (r.k === 'gene') return animalTrait(a, r.trait) >= r.min;
    if (r.k === 'look') return hasLook(a);
    if (r.k === 'race') return !!a.race;
    if (r.k === 'prize') return !!a.prize;
    return false;
}
export const reqText = (r, type) =>
    r.k === 'gene'
        ? `${traitName(r.trait)} ${r.min} ou plus`
        : r.k === 'look'
          ? type && ['sheep', 'alpaca', 'mohairGoat', 'yak'].includes(type)
              ? 'une toison ou une robe originale'
              : 'une robe originale'
          : r.k === 'race'
            ? 'race fixée'
            : 'primée au Comice';
// pour chaque exigence : une de nos bêtes la remplit-elle ?
export const reqMet = (b, r) => state.animals.some(a => a.type === b.type && sellable(a) && meetsReq(a, r));

// les bêtes qui conviennent, les moins précieuses d'abord (on garde ses meilleures pour l'élevage)
export function buyerMatches(b) {
    return state.animals
        .filter(a => a.type === b.type && sellable(a) && b.reqs.every(r => meetsReq(a, r)))
        .sort((x, y) => animalGain(x) - animalGain(y) + (x.race ? 1 : 0) - (y.race ? 1 : 0) + (x.love || 0) * 0.01 - (y.love || 0) * 0.01);
}
export const buyerReady = b => buyerMatches(b).length >= b.count;
export const fairReadyCount = () => (fairOpen() && state.elevage ? state.elevage.buyers.filter(buyerReady).length : 0);

export const buyerName = b =>
    b.who.kind === 'passer'
        ? (PASSERS.find(p => p.id === b.who.id) || {}).name || 'Un acheteur'
        : b.who.kind === 'villager'
          ? VILLAGERS[b.who.id].name
          : `${RIVALS[b.who.id].owner}, ${RIVALS[b.who.id].name}`;

export function sellToBuyer(id, at) {
    const e = ensureElevage();
    const b = e.buyers.find(x => x.id === id);
    if (!b) return false;
    const sold = buyerMatches(b).slice(0, b.count);
    if (sold.length < b.count) {
        toast('Il vous manque des bêtes qui conviennent', ['animal', b.type]);
        sfx('error');
        return false;
    }
    // la plaque « Primée au Comice » : le prix d'une bête primée double, même si l'acheteur ne le demandait pas
    const per = buyerPrice(b) / b.count;
    const price = buyerPrice(b) + (b.reqs.some(r => r.k === 'prize') ? 0 : Math.round((sold.filter(a => a.prize).length * per) / 5) * 5);
    sold.forEach(a => {
        if (a.stack > 0) collectAnimal(a);
        const i = state.animals.indexOf(a);
        if (i >= 0) state.animals.splice(i, 1);
    });
    e.buyers = e.buyers.filter(x => x !== b);
    earn(price, at);
    addXp((FAIR.xp + scaleLvl()) * sold.length, at);
    addElevRep(1 + b.reqs.length + (b.reqs.some(r => r.k === 'race') ? 2 : 0) + (b.reqs.some(r => r.k === 'prize') ? 2 : 0));
    if (b.who.kind === 'villager') addFriendship(b.who.id, 4 + b.reqs.length * 2, at);
    state.stats.fairSales = (state.stats.fairSales || 0) + sold.length;
    sfx('coin');
    buzz(20);
    burst(at, 'coin', 12);
    toast(`${buyerName(b)} repart avec ${sold.map(a => a.name).join(', ')} : ${fmt(price)} pièces`, ['animal', b.type]);
    changed('animals');
    return price;
}

export function dismissBuyer(id) {
    const e = ensureElevage();
    e.buyers = e.buyers.filter(x => x.id !== id);
    // un acheteur renvoyé : le suivant passe un peu plus tôt
    e.next = Math.min(e.next, now() + FAIR.every / 3);
    return true;
}
export const nextBuyerAt = () => (state.elevage ? state.elevage.next : 0);

export function fairTick() {
    if (!fairOpen()) return false;
    const e = ensureElevage();
    const t = now();
    let ch = false;
    const before = e.buyers.length;
    e.buyers = e.buyers.filter(b => b.until > t);
    if (e.buyers.length !== before) ch = true;
    // la première fois, la foire est déjà pleine
    if (!e.next) e.next = t - FAIR.every * fairSlots();
    // les places libres se remplissent une à une, toutes les 3 heures (au retour d'absence, d'un coup)
    while (e.buyers.length < fairSlots() && t >= e.next) {
        const b = makeBuyer();
        if (!b) {
            e.next = t + FAIR.every;
            break;
        }
        e.buyers.push(b);
        e.next += FAIR.every;
        ch = true;
    }
    if (e.buyers.length >= fairSlots() && t >= e.next) e.next = t + FAIR.every;
    if (ch && view.started) tip('fair');
    return ch;
}

// ---------------- les bêtes de choix des voisins ----------------
function choiceBeast(k) {
    const types = Object.values(ANIMALS)
        .filter(a => lvOk(a) && !SKIP.includes(a.id))
        .map(a => a.id);
    if (!types.length) return null;
    const type = pickRand(types);
    const a = newAnimal(type);
    a.adult = true;
    // un bon gène (deux avec l'amitié) au-dessus de la moyenne de l'espèce
    const n = nHearts(k) >= 3 ? 2 : 1;
    const picked = [];
    for (let j = 0; j < n; j++) {
        const trait = pickRand(CORE_ANIMAL.filter(x => !picked.includes(x)));
        picked.push(trait);
        const v = Math.min(5, animalBase({ type }, trait) + 1 + (nHearts(k) >= 5 && j === 0 ? 1 : 0));
        a.g.t[trait] = [
            [v, 1],
            [v, 1],
        ];
    }
    const pts = picked.reduce((s, tr) => s + Math.max(0, animalTrait(a, tr) - animalBase(a, tr)), 0);
    // 1.46 : souvent, une robe visible (couleur ou motif), le moyen d'en avoir une avant les naissances
    let look = false;
    if (Math.random() < NBEASTS.lookChance) {
        const kind = Math.random() < 0.6 ? 'color' : 'pattern';
        const v = pickRand(kind === 'color' ? NBEASTS.colors : NBEASTS.patterns);
        a.g.l[kind] = [
            [v, 1],
            [v, 1],
        ];
        look = true;
    }
    const price = Math.round((ANIMALS[type].cost * (NBEASTS.price + NBEASTS.perPoint * pts) * (look ? NBEASTS.lookMult : 1)) / 50) * 50;
    return { k, a, price, traits: picked, look, sold: false };
}
export function neighborBeasts() {
    if (!fairOpen()) return [];
    const e = ensureElevage();
    const day = dateKey(today());
    if (e.beasts.day !== day) e.beasts = { day, list: RIVALS.map((_, k) => choiceBeast(k)).filter(Boolean) };
    if (view.started && e.beasts.list.length) tip('nbeast');
    return e.beasts.list;
}
export function buyNeighborBeast(k, at) {
    const o = neighborBeasts().find(x => x.k === k);
    if (!o || o.sold) return false;
    if (herdFull()) {
        toast('Tous vos prés sont pleins', ['ui', 'flowers']);
        sfx('error');
        return false;
    }
    if (state.money < o.price) {
        toast(`Il faut ${fmt(o.price)} pièces`, ['ui', 'coin']);
        sfx('error');
        return false;
    }
    spend(o.price);
    const a = JSON.parse(JSON.stringify(o.a));
    a.uid = 'a' + (state.genetics ? state.genetics.next++ : now());
    a.from = RIVALS[k].owner;
    placeAnimal(a);
    state.animals.push(a);
    o.sold = true;
    sfx('buy');
    burst(at, 'sparkle', 12);
    float(at, [`-${fmt(o.price)}`, ['ui', 'coin']], 'bad', -14);
    toast(`${a.name} arrive de la ferme de ${RIVALS[k].owner} : ses petits pourront hériter de ses bons gènes`, ['animal', a.type]);
    changed('animals');
    return true;
}
