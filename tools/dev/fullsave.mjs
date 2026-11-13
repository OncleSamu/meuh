// 1.128 : LA sauvegarde pour tout essayer. Elle reprend domsave (camping, Maison, domaine), puis passe au niveau 80,
// achète tout ce qui s'achète d'un geste (serre, île, oasis, Grand Nord, pâtures…), et fonde une famille complète.
// usage : node tools/dev/fullsave.mjs sortie.json   (écrit aussi sortie.txt : le code à coller dans Réglages › Importer)
// --- ce qui suit vient de domsave ---
// Sauvegarde d'essai pour la 1.100 : niveau 60, camping construit (8 emplacements, 3 améliorations), campeurs en séjour,
// deux demandes de résidence, 5 résidents à divers cœurs, Maison fondée avec stock, fête presque prête (il manque 1 objectif).
// usage : node tools/dev/campsave.mjs sortie.json   (écrit aussi sortie.txt : le code à coller dans Réglages › Importer)
import { writeFileSync } from 'node:fs';
import { setClock } from '../../src/core/clock.js';
import { state, setStore } from '../../src/core/state.js';
import * as G from '../../src/systems/index.js';
import { ITEMS } from '../../src/data/items.js';
import { PROJECTS } from '../../src/data/village.js';
import { TIPS } from '../../src/data/texts.js';
import { packSave } from '../../src/systems/savecodes.js';

const T0 = Date.now();
setClock(() => T0);
setStore(null);
G.loadGame();
state.level = 80;
state.xp = 0;
state.money = 30000000;
state.barn.lvl = 60;
for (const p of Object.values(PROJECTS)) state.projects[p.id] = { given: {}, done: true };
for (const k of Object.keys(ITEMS)) state.inventory[k] = Math.max(state.inventory[k] || 0, 12);
for (const k of ['plank', 'beam', 'nail', 'stone', 'paint', 'wood', 'tools', 'cloth', 'hempRope']) state.inventory[k] = 400;
// 1.104 : quelques boîtes de l'emballerie, et l'emballerie elle-même
for (const id of ['boxCagette', 'boxPanier', 'boxFilet', 'boxRuban', 'boxCaisse', 'boxTonnelet', 'boxMalle']) state.inventory[id] = 6;
Object.assign(state.inventory, { hardwood: 40, flax: 30, linen: 6, lavender: 10, solidOak: 6, ironIngot: 10, copperIngot: 6, cloth: 400 });
state.machines.push(G.newMachine('emballerie'));
// des produits de toutes les qualités, pour composer un paquet argent, or, platine ou tout en diamant
for (const id of ['apple', 'pear', 'strawberry', 'egg', 'cherry', 'carp', 'perch', 'cheese', 'bread']) {
    state.inventory[id] = 15;
    state.quality[id] = { s: 4, g: 4, p: 3, d: 4 };
}
G.normalizeState();
state.tutorial = { ...(state.tutorial || {}), done: true };
state.tips = state.tips || {};
for (const k of Object.keys(TIPS)) state.tips[k] = true;

// camping
G.buildCamp();
state.camping.pitches = 8;
for (const u of ['water', 'common', 'shop']) state.camping.up[u] = 1;
state.camping.tillAt = T0 - 8 * 3600e3;
for (let i = 0; i < 5; i++) G.newGuest(T0 - i * 2 * 3600e3, 1000 + i);
state.camping.hosted = 20;
state.camping.asks = [];
state.camping.res = [];
// quelques campeurs repartis (historique)
for (let i = 0; i < 3; i++) {
    const g = G.newGuest(T0, 2000 + i);
    state.camping.guests = state.camping.guests.filter(x => x !== g);
    state.camping.past.push({ name: g.name, look: g.look, from: g.from, profile: g.profile, woman: g.woman, mood: 2 - (i % 3) });
}
// 1.102 : un habitué qui revient et un campeur remarquable
const old = G.newGuest(T0, 2100);
state.camping.guests = state.camping.guests.filter(x => x !== old);
state.camping.past.unshift({ name: old.name, look: old.look, from: old.from, profile: old.profile, woman: old.woman, mood: 2 });
state.camping.visits = { [old.name]: 2 };
G.newGuest(T0 - 3600e3, 1200, { regular: old.name });
G.newGuest(T0 - 1800e3, 1300, { star: 0 });
// 1.104.4 : un campeur ravi qui demande à rester, depuis sa tente
const stay = G.newGuest(T0 - 1200e3, 1400, { plain: true });
stay.wants.forEach(w => (w.done = true));
stay.asked = true;
stay.ask = { job: 'boulanger' };
// deux demandes de résidence
for (let i = 0; i < 2; i++) {
    const g = G.newGuest(T0, 3000 + i);
    state.camping.guests = state.camping.guests.filter(x => x !== g);
    state.camping.asks.push({ look: g.look, name: g.name, from: g.from, profile: g.profile, woman: !!g.woman, job: ['Boulanger', 'Boulangère'][i] });
}
// cinq résidents, à des cœurs variés
for (let i = 0; i < 5; i++) {
    const g = G.newGuest(T0, 4000 + i);
    state.camping.guests = state.camping.guests.filter(x => x !== g);
    const r = G.newResident({ look: g.look, name: g.name, from: g.from, profile: g.profile, woman: !!g.woman, job: [['guide de randonnée', 'guide de randonnée'], ['boulanger', 'boulangère'], ['pêcheur', 'pêcheuse'], ['peintre', 'peintre'], ['fleuriste', 'fleuriste']][i][g.woman ? 1 : 0] }, 5000 + i);
    state.camping.res.push(r);
    G.resMakeOrder(r);
}
// histoires et cœurs : on remonte par le système lui-même
state.camping.res.forEach((r, i) => {
    const total = [0, 5, 14, 30, 70][i];
    r.fr = 0;
    r.fr = total;
    const hearts = G.resHearts(r);
    [3, 6, 10].forEach((need, k) => { if (hearts >= need && r.stories.length <= k) r.stories.push(G.resStory(r, k)); });
    if (hearts >= 6) r.seen = true;
    r.gift = 0;
});
state.stats.campResidents = 4;
state.stats.campGuests = 24;
state.stats.campHappy = 10;
state.stats.campFriends = 1;

// la Maison
G.foundMaison();
state.maison.name = 'Les Meuh du Val';
state.maison.rep = 120; // palier 4 : toutes les boîtes jusqu'à la tonnelle
state.maison.stock = [];
import('../../src/data/maison.js').then(() => {});
const ids = Object.keys(ITEMS).filter(k => G.canPack(k) && ITEMS[k].type !== 'ore' && ITEMS[k].type !== 'ingot');
const NAMES = ['Panier gourmand de fruits', 'Cagette du large', 'Coffret du terroir', 'Surprise de la vallée', 'Pêche du matin', 'Boîte de gourmandises'];
for (let n = 0; n < 6; n++) {
    const items = [ids[(n * 7) % ids.length], ids[(n * 7 + 3) % ids.length], ids[(n * 7 + 5) % ids.length]];
    const q = n % 5;
    const pack = G.autoPack(items);
    state.maison.n++;
    state.maison.rn++;
    state.maison.recipes.push({ id: state.maison.rn, name: NAMES[n], pack, items, q, made: 1 + n, sold: n });
    state.maison.stock.push({ uid: state.maison.n, name: NAMES[n], items, q, pack, rid: state.maison.rn, value: G.coffretValue(items, q, pack), made: T0 });
}
state.stats.coffretsSold = 9; // il manque un coffret vendu pour la fête

// 1.107 : de quoi essayer le domaine en grand (5 milliards, branches au palier 5, matériaux)
state.money = 5e9;
for (const k of ['plank', 'beam', 'nail', 'paint', 'tools']) state.inventory[k] = 3000;
state.barn.lvl = 60;
state.domaine = Object.fromEntries(['barn', 'kitchen', 'field', 'trade', 'annex', 'armand', 'cargo', 'quay', 'guests'].map(b => [b, 5]));
const { MACHINES } = await import('../../src/data/machines.js');
for (const m of Object.values(MACHINES)) if ((m.reqLvl || 1) <= 60 && !state.machines.some(x => x.type === m.id)) state.machines.push(G.newMachine(m.id));

// --- tout ce qui s'achète d'un geste, autant de fois que possible ---
state.money = 5e10;
for (const k of Object.keys(ITEMS)) state.inventory[k] = Math.max(state.inventory[k] || 0, G.inBarn(k) ? 25 : ITEMS[k].type === 'material' || ITEMS[k].type === 'rare' ? 5000 : 200);
const once = ['buildGreenhouse', 'buildKiln', 'buildNoria', 'buyDog'];
const many = ['buyGhPlot', 'buyIslandPlot', 'buyOasisCell', 'buyNordCell', 'buyPasture', 'buyRod', 'buyTrap', 'buySlot', 'buyShelf', 'buyUp', 'buyExp'];
const done = {};
for (const f of [...once, ...many]) {
    let n = 0;
    try {
        while (n < (once.includes(f) ? 1 : 60) && G[f](null)) n++;
    } catch (e) {
        done[f + '!'] = e.message;
    }
    done[f] = n;
    state.money = 5e10;
}
const H = 3600e3;
// --- une ferme qui tourne : toutes les machines, et deux bêtes de chaque espèce ---
const { ANIMALS } = await import('../../src/data/animals.js');
const { MACHINES: MCH } = await import('../../src/data/machines.js');
for (const id of Object.keys(MCH)) {
    try {
        G.buy('machine', id, 1, null);
    } catch {
        /* une machine à part */
    }
    state.money = 5e10;
}
let beasts = 0;
for (const id of Object.keys(ANIMALS))
    for (let n = 0; n < 2; n++) {
        try {
            if (G.buy('animal', id, 1, null)) beasts++;
        } catch {
            /* une bête à part */
        }
        state.money = 5e10;
    }
done.animaux = beasts;
done.machines = state.machines.length;
// --- vous, votre ferme, votre métier (rang 5 : le client du métier est ouvert) ---
state.me = { look: 'h514012302620', farm: 'La Ferme d’Essai' };
state.metier = { id: 'eleveur', r: { eleveur: { rank: 5, base: {}, kept: {} } }, c: {}, changes: 1, at: T0 - 30 * 24 * H };
// --- la famille : marié à Margaux, trois enfants (un enfant, un ado, une adulte mariée avec deux petits-enfants), la transmission possible ---
state.villagers = state.villagers || {};
for (const v of ['margaux', 'jules', 'ines', 'idris']) state.villagers[v] = { ...(state.villagers[v] || {}), hearts: 5, pts: 0 };
const res0 = state.camping.res[4];
state.family = {
    pts: {},
    court: 'margaux',
    spouse: 'margaux',
    rooms: { bedroom: 1, salon: 2, nursery: 1, kidsroom: 2, playroom: 1, study: 1 },
    aff: 70,
    affAt: T0,
    wordAt: 0,
    basketAt: 0,
    dateAt: 0,
    wedAt: T0 - 9 * 24 * H,
    since: T0 - 9 * 24 * H,
    wedDay: Math.max(1, (state.day || 30) - 9),
    baby: null,
    next: 3,
    kids: [
        { id: 'k1', name: 'Zoé', girl: true, born: T0 - 250 * H, bornDay: 1, at: T0, grow: 250, joy: 80, care: {}, find: T0, task: 'market', metier: 'arbo', gen: 1, look: 'h325060300000', spouse: { name: res0 ? res0.name : 'Bastien', look: res0 ? res0.look : 'h410030200000', woman: false }, gk: [{ id: 'k1g1', name: 'Léo', girl: false, born: T0 - 47 * H, look: 'h415020100000', gen: 2 }], gkAt: T0 - 47 * H },
        { id: 'k2', name: 'Hugo', girl: false, born: T0 - 160 * H, bornDay: 1, at: T0, grow: 160, joy: 60, care: {}, find: T0, task: 'field', gen: 1, look: 'h510030200000', askNext: T0 },
        { id: 'k3', name: 'Louise', girl: true, born: T0 - 95 * H, bornDay: 1, at: T0, grow: 95, joy: 55, care: {}, find: T0 - 7 * H, task: null, gen: 1, look: 'h335040100000', bd: 0, askNext: T0 },
    ],
};
if (res0) state.camping.res = state.camping.res.filter(r => r !== res0);
state.stats.births2 = 3;
// une grange assez grande pour tout ce stock, avec de la place libre
while (G.barnSpace() < 3000) state.barn.lvl++;
// toutes les astuces vues, et le jeu prêt
G.normalizeState();
G.familyTick();
const json = JSON.stringify(state);
const out = process.argv[2] || 'fullsave.json';
writeFileSync(out, json);
writeFileSync(out.replace(/\.json$/, '') + '.txt', await packSave(json));
console.log('ok niveau', state.level, 'grange', G.barnUsed() + '/' + G.barnCap(), JSON.stringify(done));
