// Sauvegarde d'essai pour le comptoir (1.17) : niveau 50, île ouverte, brûlerie faite, comptoir acheté, ingrédients en stock.
// usage : node tools/dev/testsave.mjs sortie.json
import { writeFileSync } from 'node:fs';
import { setClock } from '../../src/core/clock.js';
import { state, setStore } from '../../src/core/state.js';
import * as G from '../../src/systems/index.js';
import { ITEMS } from '../../src/data/items.js';
import { RECIPES } from '../../src/data/machines.js';
import { PROJECTS } from '../../src/data/village.js';

setClock(() => Date.UTC(2026, 9, 19, 12, 0, 0));
setStore(null);
G.loadGame();
state.level = 50;
state.xp = 0;
state.money = 500000;
state.barn.lvl = 50;
for (const p of Object.values(PROJECTS)) state.projects[p.id] = { given: {}, done: true };
for (const k of Object.keys(ITEMS)) if (ITEMS[k].type !== 'artisan' || state.inventory[k] === undefined) state.inventory[k] = state.inventory[k] || 0;
// tout ce qu'il faut pour les boissons, et pour agrandir le salon
for (const r of Object.values(RECIPES).filter(x => x.machine === 'counter')) for (const k of Object.keys(r.ing)) state.inventory[k] = 60;
['plank', 'paint', 'wood', 'stone'].forEach(k => (state.inventory[k] = 80));
G.migrateCounter();
if (!state.machines.some(m => m.type === 'counter')) state.machines.push(G.newMachine('counter'));
G.ensureCounter();
// quelques cœurs d'amitié pour voir les clients
['odette', 'gaston', 'lucie', 'paul'].forEach(v => state.villagers[v] && (state.villagers[v].pts = 40));
G.normalizeState();
writeFileSync(process.argv[2] || 'testsave.json', JSON.stringify(state));
console.log('ok', G.counterOwned(), G.islandOpen(), G.counterRecipes().filter(r => G.recipeUnlocked(r.id)).length + '/' + G.counterRecipes().length);
