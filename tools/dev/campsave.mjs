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
state.level = 60;
state.xp = 0;
state.money = 30000000;
state.barn.lvl = 60;
for (const p of Object.values(PROJECTS)) state.projects[p.id] = { given: {}, done: true };
for (const k of Object.keys(ITEMS)) state.inventory[k] = Math.max(state.inventory[k] || 0, 12);
for (const k of ['plank', 'beam', 'nail', 'stone', 'paint', 'wood', 'tools', 'cloth', 'hempRope']) state.inventory[k] = 400;
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
    const r = G.newResident({ look: g.look, name: g.name, from: g.from, profile: g.profile, woman: !!g.woman, job: 'Habitant' }, 5000 + i);
    state.camping.res.push(r);
    G.resMakeOrder(r);
}
// histoires et cœurs : on remonte par le système lui-même
state.camping.res.forEach((r, i) => {
    const total = [0, 3, 8, 15, 38][i];
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

const json = JSON.stringify(state);
const out = process.argv[2] || 'campsave.json';
writeFileSync(out, json);
writeFileSync(out.replace(/\.json$/, '') + '.txt', await packSave(json));
console.log('ok', state.camping.guests.length, 'campeurs', state.camping.res.length, 'résidents', state.camping.asks.length, 'demandes', (state.maison.stock || []).length, 'coffrets');
