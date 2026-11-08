// Heum 0.4 : les habitants (statistiques, affectation, niveaux, KO, incidents, journal).
import test from 'node:test';
import assert from 'node:assert/strict';
import { state, setStore, freshState, setState, SAVE_VERSION, migrate } from '../../src/core/state.js';
import { setClock } from '../../src/core/clock.js';
import { setRand } from '../../src/core/rand.js';
import * as H from '../../src/systems/index.js';
import { HABITANTS } from '../../src/data/world.js';

let T = 1_000_000_000_000;
function fresh(level = 12) {
    T = 1_000_000_000_000;
    setClock(() => T);
    setRand(null);
    setStore({ getItem: () => null, setItem: () => {} });
    setState(freshState());
    state.level = level;
    state.money = 5000;
    state.bunker.food = 30;
}
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} ≠ ${b}`);
const wait = s => (T += s * 1000);

test('0.4 : trois habitants au départ, chacun à sa salle, efficacité 100 % dans sa spécialité', () => {
    fresh();
    assert.equal(H.residents().length, 3);
    assert.equal(H.workerOf('kitchen').id, 'armand');
    near(H.power('kitchen'), 1);
    near(H.power('gen'), 1);
    assert.equal(H.power('care'), 0, 'personne à l’infirmerie');
    near(H.canMult(), 1.2);
});

test('0.4 : affecter échange les places ; sans habitant la salle ne sert à rien', () => {
    fresh();
    assert.ok(H.assign('armand', 'gen'));
    assert.equal(H.workerOf('gen').id, 'armand');
    assert.equal(H.workerOf('kitchen').id, 'lison', 'Lison a pris la cuisine');
    assert.ok(Math.abs(H.power('gen') - 0.4) < 1e-9, 'Armand a 1 en Mains');
    H.assign('lison', '');
    assert.equal(H.power('kitchen'), 0);
    assert.equal(H.canMult(), 1);
});

test('0.4 : en travaillant, un habitant monte de niveau et gagne dans la statistique de sa salle', () => {
    fresh();
    const a = H.residents()[0];
    const before = a.esprit;
    H.bunkerTick(HABITANTS.xpEvery * HABITANTS.xpPerLvl);
    assert.equal(a.lvl, 2);
    assert.equal(a.esprit, before + 1);
    assert.ok(state.journal[0].text.includes('niveau 2'));
});

test('0.4 : sans vivres personne ne s’entraîne', () => {
    fresh();
    state.bunker.food = 0;
    H.bunkerTick(1e5);
    assert.equal(H.residents()[0].lvl, 1);
    assert.equal(H.power('kitchen'), 0);
});

test('0.4 : l’air mauvais met KO, jamais pire ; l’infirmerie accélère le soin ; hors ligne rien ne tombe KO', () => {
    fresh();
    state.cont = 80;
    setRand(() => 0);
    H.exposure(1);
    assert.ok(H.residents().every(H.isKo), 'tous KO');
    assert.equal(H.power('kitchen'), 0);
    const slow = H.healTime();
    wait(slow + 1);
    H.bunkerTick(1);
    assert.ok(!H.residents().some(H.isKo), 'remis sur pied');
    H.assign('basile', 'care');
    assert.ok(H.healTime() < slow);
    setRand(() => 1);
    H.exposure(1000);
    assert.ok(!H.residents().some(H.isKo), 'pas de chance, pas de KO');
    fresh();
    state.cont = 99;
    setRand(() => 0);
    H.away(5000);
    assert.ok(!H.residents().some(H.isKo), 'hors ligne : jamais');
});

test('0.4 : un incident arrête la salle, se règle avec un objet, et laisse une trace', () => {
    fresh();
    setRand(() => 0);
    H.maybeIncident(HABITANTS.incidentEvery);
    const i = H.incident();
    assert.ok(i);
    assert.equal(H.power(i.room), 0);
    H.maybeIncident(HABITANTS.incidentEvery);
    assert.equal(H.incident(), i, 'un seul à la fois');
    const need = HABITANTS.incidents[i.kind].cost;
    assert.ok(!H.fixIncident(), 'rien en stock');
    for (const [id, n] of Object.entries(need)) state.inv[id] = n;
    assert.ok(H.fixIncident());
    assert.equal(H.incident(), null);
    assert.ok(H.power(i.room) > 0);
    assert.ok(state.journal.length >= 2);
});

test('0.4 : creuser fait arriver les trois autres habitants ; le labo va plus vite avec Victor', () => {
    fresh();
    state.inv.metal = 20;
    state.inv.compo = 10;
    assert.ok(H.dig());
    assert.equal(H.residents().length, 6);
    assert.equal(H.workerOf('lab').id, 'victor');
    near(H.roomSpeed('lab'), 1);
    H.assign('victor', '');
    assert.equal(H.roomSpeed('lab'), 0.7);
});

test('0.4 : une sauvegarde 0.3 (version 2) reçoit ses habitants', () => {
    const old = JSON.parse(JSON.stringify(freshState()));
    old.v = 2;
    delete old.bunker.res;
    delete old.journal;
    old.bunker.floors = 2;
    const m = migrate(old);
    assert.equal(m.v, SAVE_VERSION);
    assert.equal(m.bunker.res.length, 6);
    assert.deepEqual(m.journal, []);
});
