// Heum — les règles de la V1.
import test from 'node:test';
import assert from 'node:assert/strict';
import { state, setStore, freshState, setState } from '../../src/core/state.js';
import { setClock } from '../../src/core/clock.js';
import { setRand } from '../../src/core/rand.js';
import * as H from '../../src/systems/index.js';

let T = 1_000_000_000_000;
const mem = () => {
    const m = {};
    return { getItem: k => m[k] ?? null, setItem: (k, v) => (m[k] = v) };
};
function fresh() {
    T = 1_000_000_000_000;
    setClock(() => T);
    setRand(null);
    setStore(mem());
    setState(freshState());
}
const wait = s => (T += s * 1000);

test('planter puis récolter un rutabaga en palier Sain', () => {
    fresh();
    state.cont = 0;
    assert.ok(H.plant(0, 'rutabaga'));
    assert.equal(H.harvest(0), null, 'pas encore mûr');
    wait(61);
    const r = H.harvest(0);
    assert.deepEqual(r.got, [['rutabaga', 2]]);
    assert.equal(state.inv.rutabaga, 6);
});

test('en palier Mutagène, une mutation donne un rutabaga lumineux', () => {
    fresh();
    state.cont = 40;
    setRand(() => 0.01);
    H.plant(0, 'rutabaga');
    wait(61);
    const r = H.harvest(0);
    assert.ok(r.mutant);
    assert.equal(state.inv.rutabagaGlow, 1);
    assert.equal(state.inv.rutabaga, 5);
});

test('en palier Critique, la récolte devient un déchet radioactif', () => {
    fresh();
    state.cont = 90;
    H.plant(0, 'lentil');
    wait(121);
    H.harvest(0);
    assert.equal(state.inv.waste, 1);
});

test('un Rebelle ne se propage que pendant qu’on joue, et s’arrache', () => {
    fresh();
    state.cont = 70;
    setRand(() => 0.01);
    for (const i of [0, 1]) H.plant(i, 'rutabaga');
    wait(61);
    H.harvest(0);
    assert.ok(state.plots[0].rebel, 'devenu Rebelle');
    state.plots[1].at = T; // replanté
    state.last = T;
    wait(600);
    H.catchUp();
    assert.ok(!state.plots[1].rebel, 'hors ligne : rien ne bouge');
    for (let k = 0; k < 20; k++) H.tick(5);
    assert.ok(state.plots[1].rebel, 'en jeu : il gagne la voisine');
    assert.ok(H.uproot(0));
});

test('la jauge redescend seule ; l’Épurateur la baisse de 15', () => {
    fresh();
    state.level = 3;
    state.cont = 50;
    H.tick(240);
    assert.equal(state.cont, 48);
    state.inv.elec = 1;
    assert.ok(H.startJob('purifier', 'purify'));
    wait(40);
    H.collectJob('purifier');
    assert.equal(state.cont, 33);
});

test('l’engrais toxique ne s’ouvre qu’au niveau 6', () => {
    fresh();
    state.inv.fertilizer = 1;
    assert.ok(!H.spreadFertilizer());
    state.level = 6;
    const c = state.cont;
    assert.ok(H.spreadFertilizer());
    assert.equal(state.cont, c + 10);
});

test('la poule se charge au-dessus de 30 % et pond des œufs mutagènes', () => {
    fresh();
    state.money = 100;
    assert.ok(H.buyAnimal('hen'));
    const a = state.animals[0];
    state.cont = 10;
    H.tick(130);
    assert.deepEqual(a.stock, ['egg']);
    state.cont = 60;
    H.tick(30 * 60);
    assert.ok(a.charge >= 50);
    H.collectAnimal(0);
    assert.ok(state.inv.eggMut >= 1 || a.charge >= 100);
});

test('l’épave se fouille et le Trieur sort 4 pièces triées', () => {
    fresh();
    for (let k = 0; k < 5; k++) H.search();
    state.inv.scrap = 5;
    assert.ok(H.startJob('sorter', 'sort'));
    wait(30);
    const got = H.collectJob('sorter');
    assert.equal(
        Object.values(got).reduce((a, b) => a + b, 0),
        4,
    );
});

test('le convoi paie 60 % de plus ce que sa région réclame', () => {
    fresh();
    const id = H.convoy().wants[0];
    assert.equal(H.priceOf(id), Math.round(H.baseSell(id) * 1.6 * (['canRuta', 'canGlow', 'soup', 'flour', 'shellOil'].includes(id) ? 1.2 : 1)));
    assert.equal(H.upcoming().length, 3);
});

test('nourri, le bunker accélère le Recyclage ; sans vivres il se met en veille', () => {
    fresh();
    assert.ok(H.bunkerFed());
    assert.equal(H.genMult(), 1.25);
    state.bunker.food = 1;
    H.tick(700);
    assert.equal(state.bunker.food, 0);
    assert.ok(!H.bunkerFed());
    state.inv.rutabaga = 3;
    assert.equal(H.deliver('rutabaga', 3), 3);
    assert.equal(state.bunker.food, 3);
});

test('monter de niveau donne des pièces', () => {
    fresh();
    const m = state.money;
    H.addXp(H.xpNeed());
    assert.equal(state.level, 2);
    assert.equal(state.money, m + 40);
});

test('la sauvegarde se recharge, avec le rattrapage', () => {
    fresh();
    state.money = 999;
    state.last = T;
    const st = mem();
    setStore(st);
    st.setItem('heumSave', JSON.stringify(state));
    wait(3600);
    const r = H.loadGame();
    assert.ok(r.ok);
    assert.equal(state.money, 999);
    assert.ok(r.away >= 3599);
});
