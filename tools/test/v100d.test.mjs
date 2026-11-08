// 1.100 étape 4 : la fête de la vallée, le bilan et le générique.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import { setClock } from '../../src/core/clock.js';
import * as G from '../../src/systems/index.js';
import { FETE } from '../../src/data/fete.js';
import { VILLAGERS } from '../../src/data/village.js';

let T = Date.UTC(2026, 10, 8, 12);
function farm(camp = true) {
    setClock(() => T);
    setStore(memStore());
    G.loadGame();
    setView({ started: true, tab: 'farm', hidden: false });
    state.tutorial.done = true;
    state.level = 60;
    state.money = 1e10;
    for (const k of ['plank', 'stone', 'beam', 'tools']) state.inventory[k] = 1000;
    if (camp) G.buildCamp();
}
const reach = () => FETE.goals.forEach(g => (state.stats[g.stat] = g.need));

test('fête : il faut le camping ; pas avant les cinq buts', () => {
    farm(false);
    assert.equal(G.valleeOpen(), false);
    farm();
    assert.equal(G.valleeOpen(), true);
    assert.equal(G.canValleeFete(), false);
    assert.equal(G.launchValleeFete(), false);
    FETE.goals.slice(0, 4).forEach(g => (state.stats[g.stat] = g.need));
    assert.equal(G.canValleeFete(), false);
    assert.equal(G.valleeGoal(FETE.goals[0]), FETE.goals[0].need);
});

test('fête : les buts plafonnent, la table coûte, et on ne la dresse qu’une fois', () => {
    farm();
    reach();
    state.stats.campGuests = 999;
    assert.equal(G.valleeGoal(FETE.goals[0]), FETE.goals[0].need);
    state.money = 1;
    assert.equal(G.canValleeFete(), false);
    state.money = 1e10;
    const m = state.money;
    assert.ok(G.launchValleeFete());
    assert.equal(m - state.money, FETE.cost.coins);
    assert.equal(G.valleeDone(), true);
    assert.equal(G.launchValleeFete(), false);
    assert.equal(state.stats.fete, 1);
});

test('fête : le bilan est figé le soir de la fête et compte la partie', () => {
    farm();
    reach();
    state.stats.harvested = 1234;
    G.launchValleeFete();
    const b = state.fete.bilan;
    assert.equal(b.harvested, 1234);
    assert.equal(b.guests, 999 > 0 ? state.stats.campGuests : 0);
    state.stats.harvested = 9999;
    assert.equal(state.fete.bilan.harvested, 1234);
    assert.ok(b.level === 60 && b.day >= 1);
});

test('fête : le générique réunit les habitants, les résidents et les campeurs de passage', () => {
    farm();
    state.camping.res = [{ look: 'h000000000000', name: 'Bastien', job: 'fleuriste' }];
    state.camping.past = [{ look: 'h111111111111', name: 'Lola' }];
    const c = G.valleeCredits();
    assert.equal(c.villagers.length, Object.keys(VILLAGERS).length);
    assert.equal(c.residents[0].name, 'Bastien');
    assert.equal(c.passers[0].name, 'Lola');
    reach();
    G.launchValleeFete();
    assert.equal(state.fete.cast[0].name, 'Bastien');
});
