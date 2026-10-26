// 1.37 : le château et ses vignes (douze recettes, deux chapitres, cuvée classée, primeur, visiteurs, concours).
import test from 'node:test';
import assert from 'node:assert/strict';
import { clock } from './helpers.mjs';
import { state, fromSave } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { ITEMS } from '../../src/data/items.js';
import { MACHINES, RECIPES } from '../../src/data/machines.js';
import { CARNET } from '../../src/data/carnet.js';
import { CAVE_ITEMS } from '../../src/data/cave.js';
import { CHAPTERS, CHAPTER_ORDER, PROJECTS, VILLAGERS } from '../../src/data/village.js';
import { CHATEAU_CLASSES, PRIMEUR, TOURISM, PAIRINGS } from '../../src/data/chateau.js';
import { RECIPES_137 } from '../../src/data/v137.js';
import { SPR } from '../../src/art/index.js';

const ready = () => {
    G.loadGame();
    setView({ started: true, tab: 'farm' });
    state.level = 60;
    state.money = 1e7;
    G.ensureCave();
    G.ensureChateau();
    for (const p of ['chateauChai', 'tastingRoom', 'chateauShop', 'harvestFest']) state.projects[p] = { given: {}, done: true };
    state.cave.slots = state.cave.slots.map(() => null);
    state.cave.reserve = [];
    state.chateau.vis = [];
    state.chateau.contest = { month: '', medal: 0 };
};
const lot = (rank, q = 0, extra = {}) => ({
    uid: 900 + rank,
    id: 'redWine',
    n: 8,
    rank,
    bad: false,
    q,
    next: clock.t + 9e9,
    care: clock.t,
    boost: 0,
    put: clock.t,
    vy: 3,
    vq: 1,
    ...extra,
});

test('1.37 : douze recettes du château, leurs dessins et leurs anecdotes', () => {
    assert.equal(RECIPES_137.length, 12);
    for (const [id, name, machine, ing, , lvl] of RECIPES_137) {
        assert.ok(ITEMS[id].sell > 0 && ITEMS[id].name === name, id);
        assert.ok(MACHINES[machine], `${id} : ${machine}`);
        assert.ok(SPR.has.items[id], `${id} : dessin`);
        assert.ok(CARNET[id], `${id} : anecdote`);
        assert.ok(G.dishOwner(id) >= 0, `${id} : un voisin`);
        assert.ok(lvl >= 55 && lvl <= 60 && RECIPES[id].lvl === lvl, `${id} : niveau`);
        assert.ok(lvl >= MACHINES[machine].reqLvl, `${id} : machine`);
        for (const k of Object.keys(ing)) assert.ok(ITEMS[k] && lvl >= (RECIPES[k] ? RECIPES[k].lvl : 0), `${id} : ${k} avant`);
    }
    assert.equal(CAVE_ITEMS.cognac, 'cider');
    assert.equal(CAVE_ITEMS.strawWine, 'wine');
});

test('1.37 : deux chapitres à la fin de l’histoire, Octave, ce que demande un chantier est ouvert avant', () => {
    assert.deepEqual(CHAPTER_ORDER.slice(-3, -1), [19, 20]); // 1.48 : le chapitre 21 (l'oasis) vient après
    assert.equal(CHAPTERS[18].lvl, 55);
    assert.ok(CHAPTERS[19].lvl >= CHAPTERS[18].lvl);
    assert.ok(VILLAGERS.octave && SPR.villager('octave').includes('<svg'));
    const mine = Object.values(PROJECTS).filter(p => p.map === 'chateau');
    assert.equal(mine.length, 6);
    for (const p of mine) {
        assert.ok(VILLAGERS[p.vid], p.id);
        assert.ok(SPR.building(p.id, 2).length > 200, p.id);
        for (const k of Object.keys(p.need)) {
            const lv = Math.max(ITEMS[k].reqLvl || 1, RECIPES[k] ? RECIPES[k].lvl : 1);
            assert.ok(lv <= CHAPTERS[p.ch - 1].lvl, `${p.id} : ${k} (niveau ${lv})`);
        }
    }
});

test('1.37 : le classement d’une cuvée suit le rang et la qualité', () => {
    assert.equal(G.classOf(lot(1)), 0);
    assert.equal(G.classOf(lot(2)), 1);
    assert.equal(G.classOf(lot(2, 2)), 2);
    assert.equal(G.classOf(lot(3)), 2);
    assert.equal(G.classOf(lot(3, 3)), 3);
    assert.equal(G.classOf(lot(4)), 3);
    assert.equal(G.classOf(lot(4, 4)), 4);
    assert.equal(G.classOf(lot(4, 0, { bad: true })), 0);
    for (let i = 2; i <= 4; i++) assert.ok(CHATEAU_CLASSES[i].mult > CHATEAU_CLASSES[i - 1].mult);
});

test('1.37 : une cuvée sort classée, la réputation monte, la valeur aussi ; un lot sans cuvée est inchangé', () => {
    ready();
    state.inventory.redWine = 40;
    assert.ok(G.putInCave(0, 'redWine', 8) && G.putInCave(1, 'redWine', 8));
    assert.ok(G.cuveeLot(0));
    assert.equal(G.cuveeLot(0), false, 'une seule fois');
    state.cave.slots[0].rank = 3;
    state.cave.slots[1].rank = 3;
    const base = G.lotValue(state.cave.slots[1]);
    const rep = state.chateau.rep;
    assert.ok(G.takeOut(0) && G.takeOut(1));
    const [a, b] = state.cave.reserve;
    assert.equal(a.cl, 2);
    assert.equal(b.cl, undefined, 'sans cuvée, pas de classement');
    assert.equal(G.lotValue(b), base);
    assert.ok(G.lotValue(a) > G.lotValue(b));
    assert.equal(state.chateau.rep, rep + CHATEAU_CLASSES[2].stars);
    assert.equal(state.chateau.classes[2], 1);
});

test('1.37 : un lot trop jeune en cuvée n’est pas classé, un légendaire d’avant reste intact', () => {
    ready();
    state.inventory.redWine = 40;
    G.putInCave(0, 'redWine', 8);
    G.cuveeLot(0);
    G.takeOut(0);
    assert.equal(state.cave.reserve[0].cl, undefined);
    assert.equal(state.chateau.rep, 0);
    // une ancienne partie : un lot légendaire sorti avant la 1.37
    state.cave.reserve = [lot(4, 2, { uid: 5 })];
    const v = G.lotValue(state.cave.reserve[0]);
    assert.ok(v > 0 && G.classMult(state.cave.reserve[0]) === 1);
});

test('1.37 : primeur tenu, bonus ; primeur manqué, on rend la différence ; jamais de gain à promettre trop', () => {
    ready();
    state.inventory.redWine = 40;
    G.putInCave(0, 'redWine', 8);
    G.putInCave(1, 'redWine', 8);
    const lot0 = state.cave.slots[0];
    const q3 = G.primeurAsk(0, 3);
    assert.ok(q3.paid > 0 && q3.paid <= q3.est * PRIMEUR.frac + 1 && q3.paid <= PRIMEUR.cap);
    const m0 = state.money;
    assert.ok(G.primeurDo(0, 3));
    assert.equal(state.money, m0 + q3.paid);
    assert.equal(G.primeurDo(0, 3), false, 'un seul primeur par lot');
    assert.equal(G.canPrimeur(lot0), false);
    // le lot reste en cave, rien n’est perdu
    assert.equal(state.cave.slots[0].n, 8);
    // promesse tenue
    lot0.rank = 3;
    const m1 = state.money;
    G.takeOut(0);
    assert.equal(state.chateau.primeur.bonus, Math.round(q3.est * PRIMEUR.bonus));
    assert.ok(state.money >= m1 + state.chateau.primeur.bonus);
    assert.equal(state.chateau.primeur.won, 1);
    // promesse manquée : promettre le plus haut, finir au plus bas
    const q4 = G.primeurAsk(1, 4);
    G.primeurDo(1, 4);
    const real = G.lotValue(state.cave.slots[1]);
    G.takeOut(1);
    const owed = state.chateau.primeur.refunded;
    assert.equal(owed, Math.max(0, q4.paid - Math.round(real * PRIMEUR.frac)));
    assert.equal(state.chateau.primeur.lost, 1);
    // on ne gagne jamais plus qu’en gardant le lot : payé + gardé ≤ valeur réelle × frac + reste
    assert.ok(q4.paid - owed <= Math.round(real * PRIMEUR.frac) + 1);
});

test('1.37 : le primeur d’un lot perdu en cave est rendu', () => {
    ready();
    state.inventory.redWine = 40;
    G.putInCave(0, 'redWine', 8);
    const q = G.primeurAsk(0, 2);
    G.primeurDo(0, 2);
    // le lot tourne puis sort : on rend la somme reçue moins la part de sa valeur réelle
    state.cave.slots[0].bad = true;
    G.takeOut(0);
    const owed = state.chateau.primeur.refunded;
    assert.ok(owed <= q.paid && owed >= q.paid - Math.round(G.lotValue(state.cave.reserve[0]) * PRIMEUR.frac));
});

test('1.37 : les visiteurs viennent de la boutique, pas avant ; jamais servis par le coffre-fort', () => {
    ready();
    state.projects.chateauShop.done = false;
    state.chateau.nextVisit = 0;
    clock.t += 1e8;
    assert.equal(G.visitorTick(), false);
    state.projects.chateauShop.done = true;
    state.chateau.rep = 0;
    G.visitorTick();
    clock.t += TOURISM.every * 3;
    G.visitorTick();
    assert.ok(state.chateau.vis.length > 0 && state.chateau.vis.length <= G.queueMax());
    const v = state.chateau.vis[0];
    assert.ok(PAIRINGS[v.wine].includes(v.pair));
    // le vin n’est que dans le coffre : impossible à servir
    state.inventory[v.wine] = 0;
    state.vault.slots = [{ kind: 'item', id: v.wine, q: 0, n: 50 }];
    assert.equal(G.haveWine(v), false);
    assert.equal(G.guestServe(v.id, false), false);
    assert.equal(state.vault.slots[0].n, 50);
    // dans la grange, c’est possible, et l’accord paie plus
    state.inventory[v.wine] = v.n;
    state.inventory[v.pair] = 1;
    const plain = G.visitorPrice(v, false),
        pair = G.visitorPrice(v, true);
    assert.ok(pair > plain && plain > 0);
    const m = state.money;
    assert.equal(G.guestServe(v.id, true), pair);
    assert.equal(state.money, m + pair);
    assert.equal(state.inventory[v.wine], 0);
    assert.equal(state.inventory[v.pair], 0);
    assert.ok(!state.chateau.vis.find(x => x.id === v.id));
});

test('1.37 : la réputation donne des étoiles, la file grandit', () => {
    ready();
    state.chateau.rep = 0;
    assert.equal(G.repStars(), 0);
    const q0 = G.queueMax();
    state.chateau.rep = 14;
    assert.equal(G.repStars(), 3);
    assert.equal(G.queueMax(), q0 + 3);
    state.chateau.rep = 999;
    assert.equal(G.repStars(), 5);
    assert.ok(G.visitorWines().includes('champagneRose'));
});

test('1.37 : le concours des vins, une fois par mois, avec une cuvée classée', () => {
    ready();
    state.cave.reserve = [lot(3, 0, { uid: 11, cl: 2 }), lot(2, 0, { uid: 12 })];
    assert.equal(G.wineContestLots().length, 1);
    const r = state.prestige.rubans,
        v = G.lotValue(state.cave.reserve[0]);
    assert.ok(G.contestDo(11));
    assert.equal(state.cave.reserve[0].md, 2);
    assert.ok(state.prestige.rubans > r);
    assert.ok(G.lotValue(state.cave.reserve[0]) > v);
    assert.equal(G.contestDo(11), false);
    state.cave.reserve.push(lot(4, 4, { uid: 13, cl: 4 }));
    assert.equal(G.contestDo(13), false, 'un seul concours ce mois-ci');
    clock.t += 40 * 86400e3;
    assert.ok(G.contestDo(13));
    assert.equal(state.cave.reserve[2].md, 3);
});

test('1.37 : la nouvelle ferme garde réputation et médailles, pas les visiteurs ni les primeurs', () => {
    ready();
    state.chateau.rep = 20;
    state.chateau.medals[3] = 2;
    state.chateau.vis = [{ id: 1, wine: 'redWine', n: 1, pair: 'cheese', until: clock.t + 1e6 }];
    state.level = 60;
    state.stats.earnedRun = 1e10;
    assert.ok(G.doPrestige());
    assert.equal(state.chateau.rep, 20);
    assert.equal(state.chateau.medals[3], 2);
    assert.deepEqual(state.chateau.vis, []);
    assert.ok(state.chateau.classes.every(n => n >= 0));
});

test('1.37 : une ancienne sauvegarde reçoit le château sans rien perdre', () => {
    G.loadGame();
    delete state.chateau;
    G.normalizeState();
    assert.ok(state.chateau && state.chateau.rep === 0 && state.chateau.classes.length === 5);
    assert.equal(G.chateauOpen(), false);
});

test('1.37 : le château survit à une sauvegarde et un rechargement', () => {
    ready();
    state.chateau.rep = 9;
    state.chateau.classes[3] = 2;
    state.chateau.vis = [{ id: 4, wine: 'redWine', n: 1, pair: 'cheese', until: clock.t + 1e6 }];
    state.cave.reserve = [lot(4, 0, { uid: 31, cl: 3, md: 2 })];
    const json = JSON.parse(JSON.stringify(state));
    G.loadGame();
    const back = fromSave(json);
    assert.equal(back.chateau.rep, 9);
    assert.equal(back.chateau.classes[3], 2);
    assert.equal(back.chateau.vis.length, 1);
    assert.equal(back.cave.reserve[0].cl, 3);
    assert.equal(back.cave.reserve[0].md, 2);
});
