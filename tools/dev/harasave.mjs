// Sauvegarde d'essai pour l'élevage du haras (1.24.2) : niveau 50, tout ouvert, grandes écuries, chevaux de robes variées,
// champions, reproducteur à la retraite, poulains, sellerie remplie.
// usage : node tools/dev/harasave.mjs sortie.json   (écrit aussi sortie.txt : le code à coller dans Réglages › Importer)
import { writeFileSync } from 'node:fs';
import { setClock } from '../../src/core/clock.js';
import { state, setStore } from '../../src/core/state.js';
import * as G from '../../src/systems/index.js';
import { ITEMS } from '../../src/data/items.js';
import { PROJECTS } from '../../src/data/village.js';
import { EQUIP, DISCIPLINES } from '../../src/data/haras.js';
import { packSave } from '../../src/systems/savecodes.js';

setClock(() => Date.UTC(2026, 9, 21, 12, 0, 0));
setStore(null);
G.loadGame();
state.level = 50;
state.xp = 0;
state.money = 50000000;
state.barn.lvl = 50;
for (const p of Object.values(PROJECTS)) state.projects[p.id] = { given: {}, done: true };
for (const k of Object.keys(ITEMS)) state.inventory[k] = Math.max(state.inventory[k] || 0, 300);
for (const k of Object.keys(EQUIP.items)) state.inventory[k] = 3;
if (!state.machines.some(m => m.type === 'saddlery')) state.machines.push(G.newMachine('saddlery'));
G.ensureGenetics();
G.ensurePastures();
for (let i = 0; i < 3; i++) G.upgradeStable();
// des chevaux adultes aux robes variées
const mk = (name, genes) => {
    const a = G.newAnimal('horse');
    a.adult = true;
    a.age = 99999;
    a.name = name;
    a.love = 3 + Math.floor(Math.random() * 3);
    state.animals.push(a);
    G.ensureGenetics();
    a.g.coat = G.founderCoat();
    for (const [k, v] of Object.entries(genes || {})) a.g.coat[k] = v;
    for (const k of ['speed', 'robust', 'docile', 'jump'])
        if (a.g.t[k])
            a.g.t[k] = [
                [4, 1],
                [5, 1],
            ];
    return a;
};
const T = true,
    F = false;
const noms = [
    ['Tonnerre', { E: [T, T], A: [T, T], Br: [T, T], G: [F, F], Cr: [F, F], Rn: [F, F], D: [F, F] }],
    ['Caramel', { E: [F, F], Cr: [T, F], G: [F, F], Rn: [F, F] }],
    ['Opale', { G: [T, F] }],
    ['Noisette', { E: [T, T], A: [T, T], Br: [F, F], G: [F, F], Cr: [F, F], Rn: [F, F], D: [F, F] }],
    ['Mirage', { E: [T, T], A: [T, T], Br: [T, T], D: [T, F], G: [F, F], Cr: [F, F] }],
    ['Sultane', { E: [T, T], A: [F, F], G: [F, F], Cr: [F, F], Rn: [F, F], D: [F, F] }],
    ['Orage', { E: [T, T], A: [T, T], Br: [T, T], Rn: [T, F], G: [F, F], Cr: [F, F] }],
    ['Pistache', { Cr: [T, T], G: [F, F] }],
];
const hs = noms.map(([n, g]) => mk(n, g));
hs.forEach(a => G.lodge(a.uid));
for (const a of hs) {
    const r = G.rec(a);
    DISCIPLINES.forEach(d => (r.pts[d.id] = 40 + Math.floor(Math.random() * 40)));
}
G.rec(hs[0]).spec = 'galop';
G.rec(hs[1]).spec = 'dressage';
G.rec(hs[2]).spec = 'saut';
// le concours : trois divisions ouvertes, deux champions Élite (l'un est prêt pour la retraite)
const s = G.ensureShow();
s.rose = [6, 6, 4, 1, 0];
s.cups = 6;
s.wins = 5;
s.best = { [hs[0].uid]: 3, [hs[1].uid]: 3, [hs[2].uid]: 2 };
s.titles = { [hs[0].uid]: 3, [hs[1].uid]: 2, [hs[2].uid]: 1 };
// un reproducteur à la retraite, et deux poulains de lui (un poulain, un jeune)
hs[3].chain = 2;
s.best[hs[3].uid] = 3;
s.titles[hs[3].uid] = 4;
G.rec(hs[3]).spec = 'endurance';
G.retire(hs[3].uid);
const foals = [];
for (const [name, age] of [
    ['Petit-Nuage', 0.1],
    ['Fusée', 0.7],
]) {
    const baby = G.newAnimal('horse');
    baby.uid = 'a' + state.genetics.next++;
    baby.name = name;
    baby.g = G.crossGenomes(hs[3].g, hs[1].g).g;
    baby.gen = 1;
    baby.lin = [G.lineSnap(hs[3], true), G.lineSnap(hs[1], true)];
    baby.age = 0;
    state.animals.push(baby);
    G.studBorn(baby, hs[3], hs[1]);
    foals.push([baby, age]);
}
G.ensureStud();
G.studTick();
G.normalizeState();
state.tutorial = { ...(state.tutorial || {}), done: true };
for (const k of ['plank', 'beam', 'nail', 'stone', 'paint', 'wood']) state.inventory[k] = Math.min(state.inventory[k], 60);
// la grange ne doit pas déborder : on ramène le stock à 15 de chaque (sauf l'équipement et les matériaux)
for (const k of Object.keys(state.inventory))
    if (!EQUIP.items[k] && !['plank', 'beam', 'nail', 'stone', 'paint', 'wood'].includes(k)) state.inventory[k] = Math.min(state.inventory[k], 15);
// l'âge des poulains est fixé en dernier (la normalisation ne le touche pas)
import('../../src/data/animals.js').then(async ({ GROW }) => {
    for (const [b, f] of foals) b.age = GROW.horse * f;
    state.haras.stud.day -= 2; // deux jours de saillies à récupérer au premier tour
    const json = JSON.stringify(state);
    const out = process.argv[2] || 'harasave.json';
    writeFileSync(out, json);
    writeFileSync(out.replace(/\.json$/, '') + '.txt', await packSave(json));
    console.log('ok', G.horses().length, 'chevaux', G.lodged().length, 'en box', G.retired().length, 'à la retraite');
});
