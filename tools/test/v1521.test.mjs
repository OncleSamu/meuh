// 1.52.1 : le traîneau, le relais, le marché de glace, la cardamome.
import test from 'node:test';
import assert from 'node:assert/strict';
import { clock, memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { ITEMS } from '../../src/data/items.js';
import { SLED } from '../../src/data/nord.js';
import { PROJECTS } from '../../src/data/village.js';
import { STORY_MAPS } from '../../src/data/meta.js';
import { TIPS } from '../../src/data/texts.js';
import { SPR } from '../../src/art/index.js';

function nord() {
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = 64;
    state.money = 100_000_000;
    for (const id of ['northStove', 'northStable', 'northSled']) state.projects[id] = { given: {}, done: true };
    G.ensureNord();
}
const team = n => {
    for (let k = 0; k < n; k++) {
        const a = G.newAnimal('reindeer');
        a.adult = true;
        a.food = 5;
        G.placeAnimal(a);
        state.animals.push(a);
    }
};

test('le traîneau : quatre rennes, des charges de 10, retour en 8 heures', () => {
    nord();
    state.inventory.rye = 100;
    assert.ok(G.sledAdd('rye', 3));
    assert.equal(G.sledLoads(), 3);
    team(3);
    assert.equal(G.sledSend(null), false);
    team(1);
    const value = G.sledValue();
    assert.equal(value, Math.round((30 * G.sellPrice('rye') * SLED.mult) / 10) * 10);
    assert.ok(G.sledSend(null));
    assert.equal(state.inventory.rye, 70);
    assert.equal(G.sledClaim(null), false);
    assert.ok(state.animals.filter(a => a.trip).length === 4);
    clock.t += SLED.time + 1000;
    const m0 = state.money;
    const r = G.sledClaim(null);
    assert.equal(r.value, value);
    assert.ok(state.money >= m0 + value);
    assert.equal(state.animals.filter(a => a.trip).length, 0);
});

test('tarif : plein pour le Nord, modeste pour le reste, +15 % avec le marché de glace', () => {
    nord();
    assert.equal(G.sledMult('rye'), SLED.mult);
    assert.equal(G.sledMult('reindeerMilk'), SLED.mult);
    assert.equal(G.sledMult('cardamom'), SLED.mult);
    assert.equal(G.sledMult('wheat'), SLED.otherMult);
    state.projects.northIce = { given: {}, done: true };
    assert.ok(Math.abs(G.sledMult('rye') / SLED.mult - (1 + SLED.iceBonus)) < 1e-9);
});

test('chapitre 24 : trois chantiers, le dernier fait la fête, dessins et cardamome', () => {
    for (const id of ['northStable', 'northSled', 'northIce']) {
        assert.equal(PROJECTS[id].ch, 24, id);
        assert.equal(PROJECTS[id].map, 'nord', id);
        assert.ok(SPR.building(id, 2).length > 200, id);
    }
    assert.equal(STORY_MAPS.find(m => m.id === 'nord').party, 'northIce');
    assert.ok(ITEMS.cardamom && SPR.item('cardamom').length > 300);
    assert.ok(TIPS.sled);
});

// ---------------- 1.52.2 : le blizzard et l'aurore ----------------
import { WEATHER } from '../../src/data/nord.js';

function weather() {
    nord();
    state.inventory.wood = 200;
    state.inventory.stone = 200;
    state.inventory.plank = 200;
    state.inventory.tools = 30;
    state.gameTimeMinutes = 12 * 60;
    G.buildStove(0);
    G.feedStove(0);
    state.seeds.rye = 10;
    for (const k of [1, 4, 5, 6, 7]) G.plantNord(k, 'rye');
}

test('le blizzard ensevelit des cases hors des poêles, jamais celles qu’un poêle chauffe, et un appui les dégage', () => {
    weather();
    state.nord.stormAt = clock.t - 1;
    assert.ok(G.nordWeatherTick());
    assert.ok(G.blizzardOn());
    const snowed = state.nord.plots.map((p, k) => (p.snow ? k : -1)).filter(k => k >= 0);
    assert.ok(snowed.length >= 1 && snowed.length <= WEATHER.blizzard.cells[1]);
    for (const k of snowed) assert.equal(G.isWarm(k), false);
    for (const k of [1, 4, 5]) assert.ok(!state.nord.plots[k].snow, `case chauffée ${k}`);
    const k = snowed[0];
    const p0 = state.nord.plots[k].prog;
    for (let i = 0; i < 30; i++) G.nordTick();
    assert.equal(state.nord.plots[k].prog, p0, 'une case sous la neige ne pousse pas');
    assert.ok(G.clearSnow(k, null));
    assert.equal(G.snowedCells(), snowed.length - 1);
});

test('pendant le blizzard les poêles brûlent deux fois plus, et le traîneau prend une heure de retard', () => {
    weather();
    const f0 = state.nord.stoves[0].fuel;
    for (let i = 0; i < 360; i++) G.nordTick();
    const calm = f0 - state.nord.stoves[0].fuel;
    state.nord.stoves[0].fuel = f0;
    state.projects.northSled = { given: {}, done: true };
    state.nord.sled = { load: {}, out: { load: {}, value: 1, back: clock.t + 1000, team: [] }, trips: 0 };
    state.nord.stormAt = clock.t - 1;
    G.nordWeatherTick();
    assert.equal(state.nord.sled.out.back, clock.t + 1000 + SLED.blizzardDelay);
    for (const p of state.nord.plots) p.snow = false;
    for (const p of state.nord.plots) if (p.id) Object.assign(p, { prog: 0, ready: false });
    state.nord.stoves[0].fuel = f0;
    for (let i = 0; i < 360; i++) G.nordTick();
    const storm = f0 - state.nord.stoves[0].fuel;
    assert.ok(storm > calm * 1.5, `${storm} vs ${calm}`);
});

test('l’aurore : la nuit de gel, tout pousse, même hors d’un poêle, une fois et demie plus vite', () => {
    weather();
    state.gameTimeMinutes = 23 * 60;
    assert.equal(G.cellMult(7), 0);
    state.nord.auroraAt = clock.t - 1;
    assert.ok(G.nordWeatherTick());
    assert.ok(G.auroraOn());
    assert.ok(G.cellMult(7) > 0);
    const p0 = state.nord.plots[7].prog,
        w0 = state.nord.plots[4].prog;
    for (let i = 0; i < 60; i++) G.nordTick();
    assert.ok(state.nord.plots[7].prog > p0, 'hors poêle ça pousse');
    assert.ok(state.nord.plots[4].prog - w0 > 60 * 1.3, 'au chaud, une fois et demie');
    // elle ne se lève pas le jour
    weather();
    state.gameTimeMinutes = 12 * 60;
    state.nord.auroraAt = clock.t - 1;
    G.nordWeatherTick();
    assert.equal(G.auroraOn(), false);
});
