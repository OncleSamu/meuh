// 1.125 : les enfants adultes (métier, mariage avec un résident), les petits-enfants, la ville.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { clock, memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { KIDS, KID_WED, GRANDKIDS, TOWN, KID_METIER } from '../../src/data/family.js';
import { RECIPES } from '../../src/data/machines.js';

const setup = () => {
    setStore(memStore());
    G.loadGame();
    setView({ started: true, tab: 'farm' });
    state.tutorial.done = true;
    state.level = 50;
    state.money = 1e10;
    state.me = { look: 'h514012302620', farm: 'Test' };
    G.ensureFamily();
    Object.assign(state.family, { spouse: 'lea', aff: 100, affAt: clock.t, rooms: { bedroom: 1, nursery: 1 } });
    state.family.kids.push({ id: 'k1', name: 'Louise', girl: true, born: clock.t, at: clock.t, grow: KIDS.ages[2], joy: 100, care: {}, find: clock.t, task: 'field', look: 'h343050100000' });
    return state.family.kids[0];
};

test('le métier d’un enfant adulte : ses produits se vendent plus cher', () => {
    const k = setup();
    const item = Object.keys(RECIPES).find(id => G.metierOf(id) === 'cuisinier');
    const p0 = G.craftMult(item);
    assert.ok(G.setKidMetier('k1', 'cuisinier'));
    assert.ok(Math.abs(G.craftMult(item) / p0 - (1 + KID_METIER.price)) < 1e-9);
    k.grow = 10;
    assert.equal(G.setKidMetier('k1', 'vigneron'), false, 'pas avant d’être adulte');
});

test('le mariage avec un résident du camping, la maison, les petits-enfants', () => {
    const k = setup();
    G.ensureCamping && G.ensureCamping();
    state.camping = state.camping || {};
    state.camping.res = [{ id: 123, name: 'Bastien', look: 'h510030200000', woman: false, fr: 0, job: 'boulanger' }];
    assert.equal(G.kidMatches().length, 0, 'il faut des cœurs avec lui');
    state.camping.res[0].fr = 100;
    assert.equal(G.kidMatches().length, 1);
    for (const [kk, n] of Object.entries(G.kidWedCost())) if (kk !== 'coins') state.inventory[kk] = n;
    const pop0 = G.population().total;
    assert.ok(G.kidWed('k1', 123));
    assert.equal(k.spouse.name, 'Bastien');
    assert.equal(state.camping.res.length, 0, 'il quitte sa cabane pour la maison du village');
    assert.equal(G.population().total, pop0, 'un habitant de plus en famille, un de moins au camping');
    assert.equal(G.kidWedCost().coins, KID_WED.house(2), 'la maison suivante coûte plus');
    // un petit-enfant tous les deux jours, deux au plus
    clock.t += GRANDKIDS.every + 1000;
    G.familyTick();
    assert.equal(k.gk.length, 1);
    assert.equal(G.population().total, pop0 + 1);
    clock.t += GRANDKIDS.every * 5;
    G.familyTick();
    G.familyTick();
    G.familyTick();
    assert.equal(k.gk.length, GRANDKIDS.max);
});

test('la ville : des paliers d’habitants qui relèvent les prix', () => {
    setup();
    const t = G.townTier();
    assert.equal(G.townMult(), 1 + TOWN.price * t);
    assert.equal(G.townName(), TOWN.tiers[t].name);
    state.level = 20;
    assert.equal(G.townMult(), 1, 'avant le niveau 30, pas de bonus');
});

test('1.125 : les actions et l’arbre existent', () => {
    const v = readFileSync(new URL('../../src/ui/views/family.js', import.meta.url), 'utf8');
    for (const a of ['fmMetier', 'fmKidWed']) assert.match(v, new RegExp(`\\n {8}${a}: `), a);
    assert.match(v, /defineSheet\('famTree'/);
});
