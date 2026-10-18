// La pêche repensée : coins, appâts, nasses, défis de Marcel, remontée des saumons, concours du week-end.
import test from 'node:test';
import assert from 'node:assert/strict';
import { clock } from './helpers.mjs';
import { state, fromSave } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { FISH } from '../../src/data/meta.js';
import { ITEMS } from '../../src/data/items.js';
import { RECIPES } from '../../src/data/machines.js';
import { TRAPS, SALMON_RUN } from '../../src/data/fishing.js';
import { DAYS_PER_SEASON } from '../../src/data/world.js';
import { SPR } from '../../src/art/index.js';

const H = 3600000;
// jour de jeu : saison (0 printemps … 3 hiver) et jour dans la saison
const setDay = (s, d) => (state.day = s * DAYS_PER_SEASON + d);

test('chaque poisson et chaque recette de la pêche existe, se dessine et se fait', () => {
    for (const id of Object.keys(FISH)) {
        assert.ok(ITEMS[id], id);
        assert.ok(SPR.item(id).includes('<svg'), id);
    }
    for (const id of [
        'bleakFry',
        'crayfishBisque',
        'tenchHerbs',
        'burbotCider',
        'pochouse',
        'zanderLeeks',
        'smokedSalmon',
        'salmonSteak',
        'salmonTartare',
        'crayfishGratin',
        'pondTerrine',
        'smokedSturgeon',
        'caviar',
    ]) {
        assert.ok(RECIPES[id] && ITEMS[id], id);
        assert.ok(
            Object.keys(RECIPES[id].ing).every(k => ITEMS[k]),
            id,
        );
    }
    // chaque nouveau poisson sert au moins à une recette
    for (const id of ['bleak', 'crayfish', 'tench', 'burbot', 'zander', 'salmon', 'sturgeon'])
        assert.ok(
            Object.values(RECIPES).some(r => r.ing[id]),
            id,
        );
    for (const k of ['worm', 'fly', 'trap', 'spotBank', 'spotReeds', 'spotPier']) assert.ok(SPR.ui(k).includes('<svg'), k);
});

test('les coins et les appâts : la mouche sort une truite une fois sur deux au printemps', () => {
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = 14;
    G.ensurePond();
    setDay(0, 3);
    state.gameTimeMinutes = 12 * 60;
    state.weather = 'sun';
    const plain = G.catchTable('bank', null).find(r => r.id === 'trout').pct;
    const fly = G.catchTable('bank', 'fly');
    state.pond.flies = 5;
    const withFly = G.catchTable('bank', 'fly').find(r => r.id === 'trout');
    assert.ok(plain < 25, `sans appât ${plain} %`);
    assert.ok(withFly.pct >= 40 && withFly.boosted, `avec la mouche ${withFly.pct} %`);
    assert.ok(fly.length);
    // la lotte : les nuits d'hiver seulement (toutes les conditions comptent)
    setDay(3, 3);
    assert.equal(G.fishOdds('burbot', 'reeds', null), 0, 'en plein jour, pas de lotte');
    state.gameTimeMinutes = 23 * 60;
    assert.ok(G.fishOdds('burbot', 'reeds', null) > 0, 'la nuit, oui');
    assert.equal(G.fishOdds('burbot', 'bank', null), 0, 'mais pas sur la berge');
    // le ponton attend son chantier ; le sandre ne vient pas dans les commandes avant
    state.projects.pontoon = { given: {}, done: false };
    assert.equal(G.spotOpen('pier'), false);
    assert.equal(G.fishOrderOk('zander'), false);
    state.projects.pontoon.done = true;
    assert.ok(G.spotOpen('pier'));
    assert.ok(G.fishOrderOk('zander'));
});

test('la remontée des saumons : quelques jours d’automne au ponton', () => {
    setDay(2, SALMON_RUN.from - 1);
    const before = G.fishOdds('salmon', 'pier', 'fly');
    setDay(2, SALMON_RUN.from);
    assert.ok(G.salmonRun());
    const during = G.fishOdds('salmon', 'pier', 'fly');
    assert.ok(during >= before * 10);
    const r = G.runState();
    assert.ok(r && !r.done);
    G.landFish('salmon', SALMON_RUN.minKg + 1, null, false);
    assert.ok(G.runReady());
    const m = state.money;
    assert.ok(G.claimRun());
    assert.ok(state.money > m);
    assert.ok(!G.claimRun(), 'une seule fois');
});

test('les nasses pêchent seules toutes les 2 heures, même jeu fermé', () => {
    state.level = 14;
    state.money = 1e6;
    state.inventory.wood = 100;
    state.inventory.nail = 20;
    state.pond.traps = [];
    assert.equal(G.trapMax(), 4);
    assert.ok(G.buyTrap());
    assert.ok(G.buyTrap());
    setDay(1, 3); // l'été : des écrevisses dans les nasses de la berge
    state.pond.worms = 10;
    assert.ok(G.setTrap(0, 'bank', 'worm'));
    assert.equal(state.pond.worms, 9);
    assert.equal(G.trapReady(state.pond.traps[0]), false);
    // on ferme le jeu deux heures
    state.lastSaved = clock.t;
    clock.t += TRAPS.every + 1000;
    const r = G.offlineProgress();
    assert.ok(
        r.lines.some(l => /nasse/.test(l[1])),
        'le compte rendu le dit',
    );
    assert.equal(G.trapsReady(), 1);
    const fish = Object.keys(FISH).reduce((a, id) => a + (state.inventory[id] || 0), 0);
    const got = G.haulTrap(0);
    const n = Object.values(got).reduce((a, b) => a + b, 0);
    assert.ok(n >= TRAPS.catch[0] && n <= TRAPS.catch[1]);
    assert.equal(
        Object.keys(FISH).reduce((a, id) => a + (state.inventory[id] || 0), 0),
        fish + n,
    );
    assert.ok(Object.keys(got).every(id => (FISH[id].spots || []).includes('bank')));
    // elle est reposée aussitôt avec le même appât
    assert.ok(state.pond.traps[0].start === clock.t && state.pond.traps[0].bait === 'worm');
});

test('Marcel : un défi par jour, une récompense', () => {
    state.level = 14;
    const m = G.ensureMarcel();
    assert.ok(m && G.marcelText(m).length > 5);
    // on force un défi simple
    Object.assign(m, { kind: 'count', id: 'roach', need: 2, got: 0, done: false, claimed: false });
    G.landFish('roach', 0.2, null, false);
    G.landFish('roach', 0.3, null, false);
    assert.ok(G.marcelReady());
    const h = state.villagers.marcel.pts;
    assert.ok(G.claimMarcel());
    assert.ok(state.villagers.marcel.pts > h);
    assert.ok(!G.marcelReady());
    // le lendemain, un nouveau défi
    clock.t += 24 * H;
    assert.notEqual(G.ensureMarcel().day, m.day);
});

test('le concours de pêche du week-end : classement figé le lundi', () => {
    state.level = 14;
    state.pond.contest = null;
    state.pond.lastContest = null;
    // samedi midi
    while (new Date(clock.t).getDay() !== 6) clock.t += 24 * H;
    clock.t = new Date(new Date(clock.t).setHours(12, 0, 0, 0)).getTime();
    G.pondTick();
    const c = state.pond.contest;
    assert.ok(c && FISH[c.id]);
    const [, b] = FISH[c.id].w;
    G.landFish(c.id, b * 1.4, null, true);
    assert.equal(c.best, b * 1.4);
    assert.equal(G.contestRank(c), 1, 'le plus gros de tous');
    // lundi : résultats
    clock.t += 2 * 24 * H;
    G.pondTick();
    assert.equal(state.pond.contest, null);
    assert.ok(G.contestResultReady());
    assert.equal(state.pond.lastContest.rank, 1);
    const rub = state.prestige.rubans;
    assert.ok(G.claimContest());
    assert.equal(state.prestige.rubans, rub + 2);
    assert.ok(!G.contestResultReady());
});

test('la canne en carbone, la boîte à vers qui se remplit, et la sauvegarde', () => {
    state.level = 14;
    state.money = 1e6;
    state.inventory.tools = 5;
    state.pond.rod = 0;
    assert.ok(G.buyRod());
    assert.equal(G.rodNow().name, 'Canne en carbone');
    assert.equal(G.buyRod(), false, 'la suivante au niveau 20');
    state.pond.worms = 0;
    state.pond.wormsAt = clock.t;
    clock.t += 3 * 180000 + 1000;
    G.ensurePond();
    assert.equal(state.pond.worms, 3);
    const copy = fromSave(JSON.parse(JSON.stringify(state)));
    assert.deepEqual(copy.pond, state.pond);
});
