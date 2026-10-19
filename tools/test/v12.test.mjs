// 1.2 : renommer, cornes et toison, lignée, la nuit, le carnet de Mamie Odette.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { clock, memStore } from './helpers.mjs';
import { state, setStore, SAVE_KEY } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { PROJECTS } from '../../src/data/village.js';
import { GENETICS } from '../../src/data/genetics.js';
import { RECIPES } from '../../src/data/machines.js';
import { CARNET } from '../../src/data/carnet.js';
import { SPR } from '../../src/art/index.js';

const OLD = readFileSync(new URL('./fixtures/save-6.2.json', import.meta.url), 'utf8');
const tick = s => {
    for (let k = 0; k < s; k++) {
        clock.t += 1000;
        G.gameTick();
    }
};
const build = id => {
    Object.entries(PROJECTS[id].need).forEach(([k, n]) => (state.inventory[k] = Math.max(state.inventory[k] || 0, n)));
    G.giveAllToProject(id);
    return G.finishProject(id);
};

test('une vieille ferme reçoit cornes, oreilles et toison ; on renomme un pré', () => {
    const st = memStore();
    st.setItem(SAVE_KEY, OLD);
    setStore(st);
    clock.t = JSON.parse(OLD).lastSaved + 1000;
    G.loadGame();
    setView({ started: true, tab: 'farm' });
    const cow = state.animals.find(a => a.type === 'cow');
    assert.ok(cow.g.l.horns, 'la vache a un gène de cornes');
    const chick = state.animals.find(a => a.type === 'chicken');
    assert.ok(!chick || !chick.g.l.horns, 'pas de cornes pour une poule');
    assert.ok(G.renamePasture(0, '  Le pré de Mamie  '));
    assert.equal(state.pastures[0].name, 'Le pré de Mamie');
    assert.ok(!G.renamePasture(0, '   '));
});

test('chaque variante de dessin s’affiche', () => {
    for (const key of ['cow~2', 'cow~3', 'cow~1', 'goat~31', 'buffalo~3', 'sheep~32', 'rabbit~1', 'pig~1', 'horse~1', 'horse~2', 'alpaca~2', 'donkey~1'])
        assert.ok(SPR.animal(key).length > 500, key);
});

test('un petit hérite des traits et garde sa lignée sur deux générations', () => {
    state.level = 41;
    state.money = 1e9;
    state.barn.lvl = 60;
    // 1.4 : la station suit l'île dans l'histoire ; les chapitres d'avant sont finis
    G.CHAPTER_ORDER.slice(0, G.CHAPTER_ORDER.indexOf(15)).forEach(n => G.chapterProjects(n).forEach(p => (G.projState(p.id).done = true)));
    for (const id of ['pollination', 'breeding', 'lab']) build(id);
    const cows = state.animals.filter(a => a.type === 'cow' && G.isAdult(a));
    cows[0].g.l.horns = [
        [3, 1],
        [3, 1],
    ];
    cows[1].g.l.horns = [
        [3, 1],
        [3, 1],
    ];
    if (G.herdFull()) G.buyPasture();
    G.startBreed(cows[0].uid, cows[1].uid);
    tick(GENETICS.breedTime + 2);
    const baby = state.animals[state.animals.length - 1];
    assert.equal(G.featureOf(baby.g, 'horns'), 3, 'cornes en lyre héritées');
    assert.equal(baby.lin.length, 2);
    assert.equal(baby.lin[0].n, cows[0].name);
    // petit-enfant : la lignée remonte aux grands-parents
    baby.adult = true;
    baby.born = 0;
    const mate = cows[1];
    if (G.herdFull()) G.buyPasture();
    if (G.isAdult(baby) && G.startBreed(baby.uid, mate.uid)) {
        tick(GENETICS.breedTime + 2);
        const g2 = state.animals[state.animals.length - 1];
        assert.ok(g2.lin[0].lin && g2.lin[0].lin[0].n === cows[0].name, 'grand-parent');
    }
});

test('la nuit : lucioles, bocal, étoile filante et vœu', () => {
    state.level = 30;
    state.day = 15; // été
    state.gameTimeMinutes = 20 * 60 + 30;
    tick(1);
    assert.ok(G.isNight());
    const N = state.night;
    N.flies = [];
    for (let k = 0; k < 20; k++) {
        N.flies.push({ id: 5000 + k, x: 10, y: 10, until: clock.t + 60000 });
        assert.ok(G.catchFly(5000 + k));
    }
    assert.equal(N.jars, 1);
    assert.equal(state.decorInv.fireflyJar, 1, 'lanterne à lucioles');
    N.star = { until: clock.t + 5000, y: 10 };
    assert.ok(G.catchStar());
    assert.ok(state.stats.wishes >= 1);
    // le jour, plus de lucioles
    state.gameTimeMinutes = 12 * 60;
    tick(1);
    assert.equal(state.night.flies.length, 0);
});

test('les histoires de Mamie : une par recette, lues dans la fiche du livre une fois la maîtrise bronze atteinte', () => {
    assert.equal(Object.keys(CARNET).length, Object.keys(RECIPES).length);
    const id = 'flour';
    state.mastery[id] = 0;
    state.collection['k_' + id] = { n: 1, best: 0, day: 1 };
    assert.ok(G.entryInfo('k_' + id).locked, 'verrouillée au départ');
    state.mastery[id] = 1000;
    const info = G.entryInfo('k_' + id);
    assert.ok(!info.locked && info.anecdote === CARNET[id]);
});
