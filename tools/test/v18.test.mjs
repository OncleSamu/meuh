// 1.8 : machines rangées par niveau, l'avion-cargo, le temps hors ligne.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { clock, memStore } from './helpers.mjs';
import { state, setStore, SAVE_KEY } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { MACHINES, RECIPES } from '../../src/data/machines.js';
import { CARGO } from '../../src/data/commerce.js';
import { ITEMS } from '../../src/data/items.js';

const OLD = readFileSync(new URL('./fixtures/save-6.2.json', import.meta.url), 'utf8');

test('une partie en cours garde les machines et recettes qu’elle avait déjà', () => {
    const st = memStore();
    const old = JSON.parse(OLD);
    st.setItem(SAVE_KEY, JSON.stringify({ ...old, lv14: true, lv18: undefined, level: 7 }));
    setStore(st);
    clock.t = old.lastSaved + 1000;
    G.loadGame();
    setView({ started: true, tab: 'farm' });
    assert.equal(state.lv18, true);
    // la pâtisserie (niveau 6 avant, plus tard maintenant) reste achetable pour cette partie
    if (MACHINES.pastry.lv17 <= 7 && MACHINES.pastry.reqLvl > 7) assert.ok(state.lvKeep.pastry);
    for (const r of Object.values(RECIPES)) if (r.lv17 !== undefined && r.lv17 <= 7 && r.lvl > 7) assert.ok(state.lvKeep[r.id], r.id);
    assert.equal(state.pendingGift131, undefined, 'aucune machine offerte');
});

test('la cuisine attend la pierre, la boulangerie ne demande rien', () => {
    assert.ok(MACHINES.kitchen.reqLvl >= 8);
    assert.equal(G.matCost('machine', 'bakery'), null);
    const per = {};
    for (const m of Object.values(MACHINES)) per[m.reqLvl] = (per[m.reqLvl] || 0) + 1;
    assert.ok(
        Object.values(per).every(n => n === 1),
        'une machine par niveau',
    );
});

test('l’avion-cargo se pose toutes les 48 heures pour 24 heures, même jeu fermé', () => {
    state.level = 32;
    state.money = 1e6;
    // on se place juste avant un atterrissage
    clock.t = Math.ceil(clock.t / CARGO.every) * CARGO.every - 1000;
    assert.equal(G.cargoHere(), false);
    state.lastSaved = clock.t - 5000;
    clock.t += 3600 * 1000;
    const r = G.offlineProgress();
    assert.ok(G.cargoHere());
    assert.equal(state.cargo.holds.length, CARGO.holds);
    assert.ok(
        r.lines.some(l => /avion-cargo/.test(l[1])),
        'le compte rendu le dit',
    );
    const h = state.cargo.holds[0];
    assert.ok(h.qty >= CARGO.min && h.qty <= CARGO.max);
    // charger en plusieurs fois
    state.inventory[h.id] = Math.ceil(h.qty / 2);
    const m = state.money;
    assert.ok(G.loadHold(0));
    assert.ok(h.got > 0 && h.got < h.qty);
    assert.ok(state.money > m);
    // tout remplir : le bonus
    state.cargo.holds.forEach(x => (state.inventory[x.id] = (state.inventory[x.id] || 0) + x.qty));
    const m2 = state.money;
    state.cargo.holds.forEach((x, i) => G.loadHold(i));
    assert.ok(G.cargoFull() && state.cargo.done);
    assert.ok(state.money - m2 > G.cargoBonus());
    // 24 heures plus tard, il est reparti ; 48 heures après, un nouveau
    clock.t += CARGO.stay;
    G.cargoTick();
    assert.equal(G.cargoHere(), false);
    clock.t += CARGO.every - CARGO.stay;
    G.cargoTick();
    assert.ok(G.cargoHere() && !state.cargo.done);
    assert.ok(state.cargo.holds.every(x => ITEMS[x.id]));
});

test('jeu fermé : cultures, machines et cave avancent', () => {
    const p = state.grid.find(x => x.isUnlocked && !x.deco);
    Object.assign(p, { itemId: 'wheat', isReady: false, isWatered: true, pest: false, growProgress: 0, terrain: 'plowed' });
    const m = state.machines[0];
    m.queue = [Object.keys(RECIPES).find(id => RECIPES[id].machine === m.type)];
    m.progress = 0;
    m.out = {};
    state.lastSaved = clock.t - 6 * 3600 * 1000;
    const day = state.day;
    let r = G.offlineProgress();
    // un parasite ou un corbeau peut s'inviter pendant l'absence (hasard) : on retente quelques fois
    for (let k = 0; k < 8 && !p.isReady; k++) {
        Object.assign(p, { itemId: 'wheat', isReady: false, isWatered: true, pest: false, growProgress: 0, terrain: 'plowed' });
        state.crow = null;
        state.lastSaved = clock.t - 6 * 3600 * 1000;
        r = G.offlineProgress();
    }
    assert.ok(p.isReady, 'le blé a poussé');
    assert.ok(Object.values(m.out).reduce((a, b) => a + b, 0) >= 1, 'la machine a fini');
    assert.ok(state.day > day, 'des jours de jeu ont passé');
    assert.ok(r.elapsed >= 6 * 3600 - 2);
});

test('l’avion-cargo survit à la sauvegarde', async () => {
    const { fromSave } = await import('../../src/core/state.js');
    const copy = fromSave(JSON.parse(JSON.stringify(state)));
    assert.ok(state.cargo && state.cargo.holds.length);
    assert.deepEqual(copy.cargo, state.cargo);
});

test('1.8.2 : vendre une bête, sauf en transhumance ou à l’élevage', () => {
    const n = state.animals.length;
    const i = state.animals.findIndex(a => !G.animalSellBlock(a));
    const a = state.animals[i];
    a.stack = 1;
    const prod = state.inventory[G.ANIMALS ? G.ANIMALS[a.type].prodId : 'egg'] || 0;
    const price = G.animalSalePrice(a);
    const m = state.money;
    assert.ok(price > 0);
    assert.equal(G.sellAnimal(i), price);
    assert.equal(state.animals.length, n - 1);
    assert.equal(state.money, m + price);
    assert.ok(prod >= 0);
    // une bête qui fait un petit ne se vend pas
    const b = state.animals[0];
    state.genetics.breeds = [{ a: b.uid, b: 'x', type: b.type, until: clock.t + 1e6 }];
    assert.ok(G.animalSellBlock(b));
    assert.equal(G.sellAnimal(0), false);
    state.genetics.breeds = [];
});
