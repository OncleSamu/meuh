// 1.106 : le train et l'avion-cargo à la taille de la ferme, et le renom du domaine (bonus de prix au marché).
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore, scaleLvl } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import { setClock } from '../../src/core/clock.js';
import * as G from '../../src/systems/index.js';
import { ITEMS } from '../../src/data/items.js';
import { MACHINES } from '../../src/data/machines.js';
import { CARGO } from '../../src/data/commerce.js';
import { BALANCE } from '../../src/data/progress.js';

let T = Date.UTC(2026, 10, 10, 12);
function farm(lvl = 60) {
    T = Date.UTC(2026, 10, 10, 12);
    setClock(() => T);
    setStore(memStore());
    G.loadGame();
    setView({ started: true, tab: 'farm', hidden: false });
    state.tutorial.done = true;
    state.level = lvl;
    state.money = 1e9;
    state.projects.station = { done: true };
    state.machines = Object.values(MACHINES).filter(m => (m.reqLvl || 1) <= lvl).map(m => G.newMachine(m.id));
}
const train = () => {
    state.truck.status = 'away';
    state.truck.arriveAt = T - 1;
    G.truckTick();
    return state.truck;
};

test('wagon : la valeur demandée suit la production (rien ne change avant le niveau 15)', () => {
    farm(10);
    assert.equal(G.wagonTarget(), 60 + scaleLvl() * 30);
    farm(60);
    assert.ok(G.wagonTarget() > 25000 && G.wagonTarget() < 35000);
    assert.equal(G.wagonMax(), 60);
    state.level = 20;
    assert.equal(G.wagonMax(), 20);
    let prev = 0;
    for (let L = 1; L <= 64; L++) {
        state.level = L;
        assert.ok(G.wagonTarget() >= prev, `niveau ${L}`);
        prev = G.wagonTarget();
    }
});

test('train : au niveau 60 un train plein paie des centaines de milliers de pièces, l’expérience reste celle d’avant', () => {
    farm(60);
    let gold = 0,
        xp = 0,
        n = 0;
    for (let i = 0; i < 30; i++) {
        const t = train();
        if (t.status !== 'here') continue;
        n++;
        gold += t.gold + t.slots.reduce((a, s) => a + s.gold, 0);
        xp += t.xp + t.slots.reduce((a, s) => a + s.xp, 0);
        for (const s of t.slots) if (!s.pk) assert.ok(s.qty <= 60);
    }
    assert.ok(n > 20);
    assert.ok(gold / n > 150000, `or moyen ${gold / n}`);
    // l'ancienne échelle : 5 wagons d'environ 1 250 pièces de marchandises
    const oldXp = (60 + scaleLvl() * 30) * 1.05 * 5 * 1.5 * BALANCE.trainPay * BALANCE.truckXp;
    assert.ok(xp / n < oldXp * 3, `xp moyen ${xp / n} contre ${oldXp}`);
});

test('renom : un train plein donne 2 points, +1 % par point au marché, 12 au plus', () => {
    farm(40);
    const id = Object.keys(ITEMS).find(k => ITEMS[k].sell > 5000);
    const p0 = G.sellPrice(id);
    assert.equal(G.renomPts(), 0);
    G.addRenom(2);
    assert.equal(G.renomPts(), 2);
    assert.ok(Math.abs(G.sellPrice(id) / p0 - 1.02) < 0.01);
    for (let i = 0; i < 10; i++) G.addRenom(2);
    assert.equal(G.renomPts(), G.RENOM.max);
    assert.ok(Math.abs(G.marketMult() / (G.marketMult() / G.renomMult()) - 1.12) < 1e-9);
});

test('renom : il baisse d’un point toutes les 4 heures, même hors ligne, et un gain ne remet pas l’horloge à zéro', () => {
    farm(40);
    G.addRenom(3);
    T += G.RENOM.decay - 1000;
    assert.equal(G.renomPts(), 3);
    G.addRenom(1);
    assert.equal(G.renomPts(), 4);
    T += 2000;
    assert.equal(G.renomPts(), 3);
    T += G.RENOM.decay * 10;
    assert.equal(G.renomPts(), 0);
    assert.equal(G.renomMult(), 1);
});

test('renom : le départ d’un train plein le fait monter', () => {
    farm(30);
    const t = train();
    assert.equal(t.status, 'here');
    for (const s of t.slots) {
        if (s.pk) continue;
        state.inventory[s.id] = s.qty;
    }
    if (t.slots.some(s => s.pk)) return;
    t.slots.forEach((s, k) => assert.ok(G.loadSlot(k), `wagon ${k}`));
    assert.equal(G.renomPts(), G.RENOM.train);
});

test('avion-cargo : une soute vaut au moins trois wagons', () => {
    farm(60);
    assert.ok(3 * G.wagonTarget() > CARGO.value(scaleLvl()));
});
