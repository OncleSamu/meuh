// 1.127 : la vie de famille. Anniversaires, cadeau préféré, repas de famille et carte de la ville.
import test from 'node:test';
import assert from 'node:assert/strict';
import { clock, memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { KIDS, BDAY, GIFT, MEAL, FAVS } from '../../src/data/family.js';
import { ITEMS } from '../../src/data/items.js';
import { townMapArt } from '../../src/art/famille.js';

const H = 3600000;
function setup() {
    setStore(memStore());
    G.loadGame();
    setView({ started: true, tab: 'farm' });
    state.tutorial.done = true;
    state.level = 40;
    G.ensureFamily();
    Object.assign(state.family, { spouse: 'tiago', aff: 50, affAt: clock.t, rooms: { bedroom: 1, nursery: 1, kidsroom: 2 } });
    const kid = (id, name, grow, born) => ({ id, name, girl: true, born, at: clock.t, grow, joy: 50, care: {}, find: clock.t, task: null, look: 'h325060300000' });
    state.family.kids.push(kid('k1', 'Louise', 10, clock.t), kid('k2', 'Zoé', 100, clock.t - 3 * 24 * H));
    return state.family.kids;
}

test('les cadeaux préférés existent tous', () => {
    for (const pool of FAVS) for (const id of pool) assert.ok(ITEMS[id], id);
    for (const id of [...BDAY.cakes, ...MEAL.dishes]) assert.ok(ITEMS[id], id);
});

test('le cadeau préféré : du bonheur, puis une autre envie', () => {
    const [k] = setup();
    const fav = G.favOf(k);
    assert.ok(FAVS[0].includes(fav));
    assert.equal(G.giftCan(k), false);
    state.inventory[fav] = 2;
    assert.ok(G.giveKidGift('k1'));
    assert.equal(state.inventory[fav], 1);
    assert.equal(Math.round(k.joy), 50 + GIFT.joy);
    assert.notEqual(G.favOf(k), fav);
    assert.equal(G.giftCan(k), false, 'une fois toutes les huit heures');
    clock.t += GIFT.wait;
    state.inventory[G.favOf(k)] = 1;
    assert.ok(G.giftCan(k));
});

test('l’anniversaire : on le fête avec un gâteau, ou on l’oublie', () => {
    const [k1, k2] = setup();
    // une partie existante : on ne rattrape pas les anniversaires passés
    assert.equal(G.bdayToday(k2), false);
    assert.equal(k2.bd, 1);
    // le premier anniversaire de Louise, deux jours après sa naissance
    assert.equal(G.bdayToday(k1), false);
    clock.t += BDAY.every;
    G.familyTick();
    assert.ok(G.bdayToday(k1));
    assert.ok(G.familyReady() >= 1);
    assert.equal(G.bdayCan(k1), false, 'il faut un gâteau');
    state.inventory.chocCake = 1;
    state.inventory[G.favOf(k1)] = 1;
    const g0 = k1.grow;
    assert.ok(G.celebrate('k1'));
    assert.equal(state.inventory.chocCake, 0);
    assert.equal(k1.joy, KIDS.joy.max);
    assert.ok(k1.grow >= g0 + BDAY.grow + BDAY.favGrow);
    assert.equal(G.bdayToday(k1), false);
    // le suivant est oublié : l'enfant est triste
    clock.t += BDAY.every + BDAY.window + 1000;
    const j0 = G.kidJoy(k1);
    G.familyTick();
    assert.ok(Math.abs(k1.joy - Math.max(0, j0 - BDAY.miss)) < 1);
    assert.equal(k1.bd, 2);
});

test('le repas de famille : tout le monde à table', () => {
    const kids = setup();
    assert.equal(G.mealGuests().length, 4);
    assert.equal(G.mealNeed(), 2);
    assert.equal(G.mealCan(), false);
    state.inventory.soup = 1;
    assert.equal(G.mealPlan(), null);
    state.inventory.pizza = 3;
    assert.deepEqual(G.mealPlan(), { pizza: 1, soup: 1 });
    assert.ok(G.mealVaried(G.mealPlan()));
    const xp0 = state.xp;
    const lvl0 = state.level;
    assert.ok(G.familyMeal());
    assert.ok(state.xp > xp0 || state.level > lvl0);
    assert.equal(state.inventory.soup, 0);
    assert.equal(G.affection(), 50 + MEAL.aff);
    for (const k of kids) assert.ok(k.joy >= 50 + MEAL.joy - 1);
    assert.equal(G.mealCan(), false, 'un repas par jour');
    clock.t += MEAL.wait;
    assert.deepEqual(G.mealPlan(), { pizza: 2 });
    assert.equal(G.mealVaried(G.mealPlan()), false, 'deux fois le même plat');
});

test('la carte de la ville : une maison par foyer, une tente par résident', () => {
    setup();
    state.family.kids[1].spouse = { name: 'Bastien', look: 'h410030200000' };
    state.family.elders = [{ look: 'h514012302620', spouse: 'idris', gen: 1 }];
    state.family.gen = 2;
    const hs = G.townHouses();
    assert.equal(hs[0].kind, 'farm');
    assert.ok(hs.some(h => h.kind === 'couple' && h.who.includes('Bastien')));
    assert.ok(hs.some(h => h.kind === 'elder' && h.name === 'La maison de vos parents'));
    assert.equal(hs.filter(h => h.kind === 'villager').length, G.population().villagers);
    const svg = townMapArt(hs, ['Clara', 'Paul'], G.landmarks(), { k: 'house', i: 0 });
    assert.equal((svg.match(/data-act="fmHouse"/g) || []).length, hs.length);
    assert.equal((svg.match(/data-act="fmTent"/g) || []).length, 2);
});
