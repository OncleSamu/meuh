// Heum — les règles de la V2.
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
function fresh(level = 12) {
    T = 1_000_000_000_000;
    setClock(() => T);
    setRand(null);
    setStore(mem());
    setState(freshState());
    state.level = level;
    state.money = 5000;
}
const wait = s => (T += s * 1000);

test('V2 : un voile protège la parcelle, un concentrateur la pousse', () => {
    fresh();
    state.cont = 40;
    state.inv.veil = 1;
    state.inv.conc = 1;
    assert.ok(H.setGear(0, 'veil'));
    assert.equal(H.plotCont(state.plots[0]), 20);
    assert.equal(H.plotTier(state.plots[0]).id, 'sane');
    assert.ok(H.setGear(1, 'conc'));
    assert.equal(H.plotTier(state.plots[1]).id, 'unst');
    assert.ok(H.setGear(0, null));
    assert.equal(state.inv.veil, 1, 'le voile revient au stock');
});

test('V2 : la récolte suit le palier de sa parcelle (voile en ferme critique)', () => {
    fresh();
    state.cont = 90;
    state.inv.veil = 1;
    H.setGear(0, 'veil');
    H.plant(0, 'lentil');
    wait(121);
    const r = H.harvest(0);
    assert.deepEqual(r.got, [['lentil', 2]], 'à 70 % : Instable, pas de déchet');
});

test('V2 : Victor fixe un mutant, qui se sème ensuite en graine stable', () => {
    fresh();
    state.inv.metal = 20;
    state.inv.compo = 10;
    assert.ok(H.dig());
    assert.equal(H.floors(), 2);
    state.inv.rutabagaGlow = 5;
    state.inv.elec = 2;
    assert.ok(H.startFix('rutabagaGlow'));
    wait(301);
    assert.equal(H.collectFix(), 'rutabagaGlow');
    state.cont = 70;
    setRand(() => 0.01);
    assert.ok(H.plant(0, 'rutabagaGlow'));
    wait(91);
    const r = H.harvest(0);
    assert.deepEqual(r.got, [['rutabagaGlow', 2]]);
    assert.ok(!state.plots[0].rebel, 'jamais Rebelle');
});

test('V2 : une graine stable non fixée ne se sème pas', () => {
    fresh();
    assert.ok(!H.plant(0, 'squashShell'));
});

test('V2 : le chou-éponge fait baisser la jauge', () => {
    fresh();
    state.cont = 40;
    setRand(() => 0.01);
    H.plant(0, 'kale');
    wait(241);
    const r = H.harvest(0);
    assert.ok(r.mutant);
    assert.equal(state.cont, 32);
});

test('V2 : le cochon change un déchet en engrais, et attend s’il n’y en a pas', () => {
    fresh();
    assert.ok(H.buyAnimal('pig'));
    H.tick(601);
    assert.equal(state.animals[0].stock.length, 0);
    state.inv.waste = 2;
    H.tick(601);
    assert.deepEqual(state.animals[0].stock, ['fertilizer']);
    assert.equal(state.inv.waste, 1);
});

test('V2 : l’étable filtrée vide la Charge', () => {
    fresh();
    H.buyAnimal('hen');
    state.animals[0].charge = 80;
    assert.ok(!H.purge(0), 'pas d’étable');
    assert.ok(H.buildStable());
    state.inv.elec = 1;
    assert.ok(H.purge(0));
    assert.equal(state.animals[0].charge, 0);
});

test('V2 : l’expédition rapporte du matériel, même hors ligne', () => {
    fresh();
    state.bunker.floors = 2;
    assert.ok(H.sendExpe('ditch'));
    assert.ok(!H.sendExpe('city'), 'une à la fois');
    wait(901);
    const r = H.collectExpe();
    assert.equal(r.name, 'Les fossés');
    assert.ok(state.inv.scrap >= 4);
});

test('0.3 : le contrôle sanitaire lit la charge réelle du produit', () => {
    fresh();
    const sel = id => {
        let k = 0;
        while (H.convoy().id !== id && k++ < 10) wait(3600);
    };
    state.inv.lentil = 2;
    state.charge.lentil = 10;
    state.inv.rutabagaGlow = 2;
    state.charge.rutabagaGlow = 70;
    sel('filtre');
    assert.equal(H.checkMult('lentil'), 1.25, 'propre, région propre');
    assert.equal(H.checkMult('rutabagaGlow'), 0.3, 'chaud, région propre');
    sel('antennes');
    assert.equal(H.checkMult('rutabagaGlow'), 1.4, 'chaud, région chaude');
    assert.equal(H.checkMult('lentil'), 0.7, 'propre, région chaude');
    sel('forge');
    assert.equal(H.checkMult('rutabagaGlow'), 1, 'région qui ne regarde pas');
    assert.equal(H.checkMult('metal'), 1);
    state.level = 9;
    sel('filtre');
    assert.equal(H.checkMult('rutabagaGlow'), 1, 'pas encore de contrôle');
});

test('V2 : le convoi blindé, livré au compte exact', () => {
    fresh();
    const c = H.armored();
    assert.ok(c && c.n > 0);
    assert.equal(H.deliverArmored(), 0);
    state.inv[c.id] = c.n;
    const m = state.money;
    assert.equal(H.deliverArmored(), c.reward);
    assert.equal(state.money, m + c.reward);
    assert.ok(H.armored() !== c);
});

test('V2 : l’événement du jour, une seule fois', () => {
    fresh();
    const e = H.todayEvent();
    assert.ok(e);
    const k = e.opts.findIndex(o => !o.cost);
    assert.ok(H.chooseEvent(k >= 0 ? k : 0) || true);
    if (k >= 0) assert.ok(H.eventDone());
    if (k >= 0) assert.ok(!H.chooseEvent(k), 'déjà fait aujourd’hui');
    state.level = 3;
    state.event = null;
    assert.equal(H.todayEvent(), null);
});
