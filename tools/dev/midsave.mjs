// 1.137 : une ferme d'essai à un niveau donné (début ou milieu de partie), pour les audits.
// Elle possède ce qu'un joueur a d'ordinaire à ce niveau : une machine de chaque sorte ouverte, quelques bêtes, un peu de stock.
// usage : node tools/dev/midsave.mjs niveau sortie.json
import { writeFileSync } from 'node:fs';
import { setClock } from '../../src/core/clock.js';
import { state, setStore } from '../../src/core/state.js';
import * as G from '../../src/systems/index.js';
import { ITEMS } from '../../src/data/items.js';
import { MACHINES, RECIPES } from '../../src/data/machines.js';
import { ANIMALS } from '../../src/data/animals.js';
import { TIPS } from '../../src/data/texts.js';

const lvl = +process.argv[2] || 10;
const T0 = Date.now();
setClock(() => T0);
setStore(null);
G.loadGame();
state.level = lvl;
state.xp = 0;
state.money = lvl * lvl * 400;
state.barn.lvl = Math.floor(lvl / 2);
state.tutorial = { ...(state.tutorial || {}), done: true };
state.tips = state.tips || {};
for (const k of Object.keys(TIPS)) state.tips[k] = true;
for (const m of Object.values(MACHINES)) if (m.reqLvl && m.reqLvl <= lvl && !m.special && !state.machines.some(x => x.type === m.id)) state.machines.push(G.newMachine(m.id));
for (const a of Object.values(ANIMALS)) if (a.reqLvl && a.reqLvl <= lvl && !a.island && !a.oasis && !a.nord) for (let i = 0; i < 2; i++) state.animals.push(G.newAnimal(a.id));
for (const it of Object.values(ITEMS)) {
    if ((it.type === 'crop' || it.type === 'tree') && it.reqLvl <= lvl && !it.island && !it.needProject) state.inventory[it.id] = 3;
    if (it.type === 'crop' && it.reqLvl <= lvl && state.seeds[it.id] !== undefined) state.seeds[it.id] = 4;
}
for (const a of Object.values(ANIMALS)) if (a.reqLvl <= lvl && a.prodId && ITEMS[a.prodId]) state.inventory[a.prodId] = 3;
for (const r of Object.values(RECIPES)) if (r.lvl && r.lvl <= lvl && !r.teacher && !r.fete && state.machines.some(m => m.type === r.machine)) state.inventory[r.id] = 1;
Object.assign(state.inventory, { feed: 20, fertilizer: 5, wood: 15, stone: 10 });
G.normalizeState();
writeFileSync(process.argv[3] || 'midsave.json', JSON.stringify(state));
console.log('niveau', lvl, '·', state.machines.length, 'machines ·', state.animals.length, 'bêtes ·', G.barnUsed(), '/', G.barnCap(), 'en grange');
