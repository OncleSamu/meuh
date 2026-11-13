// 1.124 : les enfants. L'heureux événement, les âges, le bonheur, les soins, les coups de main.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { clock, memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { FOYER, KIDS } from '../../src/data/family.js';
import { lookOf } from '../../src/art/habitants.js';

const H = 3600 * 1000;
const married = () => {
    setStore(memStore());
    G.loadGame();
    setView({ started: true, tab: 'farm' });
    state.tutorial.done = true;
    state.level = 40;
    state.money = 1e10;
    state.me = { look: 'h514012302620', farm: 'Test' };
    G.ensureFamily();
    Object.assign(state.family, { spouse: 'idris', aff: 100, affAt: clock.t, rooms: { bedroom: 1 } });
};
const build = id => {
    for (const r of FOYER.find(x => x.id === id).lv) for (const [k, n] of Object.entries(r.cost)) if (k !== 'coins') state.inventory[k] = (state.inventory[k] || 0) + n;
    return G.buildRoom(id);
};

test('il faut la chambre de bébé, puis six heures', () => {
    married();
    assert.equal(G.canExpect(), false, 'pas de chambre');
    assert.ok(build('nursery'));
    assert.equal(G.kidsMax(), 1);
    assert.ok(G.expect());
    assert.equal(G.canExpect(), false);
    clock.t += KIDS.expect + 1000;
    G.familyTick();
    assert.equal(G.kids().length, 1);
    const k = G.kids()[0];
    assert.equal(G.stageOf(k), 0);
    // son visage : un teint, des cheveux, des yeux de l'un des parents
    const l = lookOf(k.look);
    const me = lookOf('h514012302620');
    assert.ok([me.skin, 3].includes(l.skin));
    assert.ok([me.hairColor, 0].includes(l.hairColor));
    // deux enfants : la chambre des enfants
    assert.equal(G.canExpect(), false);
    assert.ok(build('kidsroom'));
    assert.equal(G.kidsMax(), 2);
    assert.ok(G.canExpect());
});

test('grandir : les soins, le bonheur, les âges et les coups de main', () => {
    married();
    build('nursery');
    G.expect();
    clock.t += KIDS.expect + 1000;
    G.familyTick();
    const k = G.kids()[0];
    // le biberon demande du lait
    state.inventory.milk = 0;
    assert.equal(G.careKid(k.id, 'bottle'), false);
    state.inventory.milk = 10;
    k.joy = 40;
    assert.ok(G.careKid(k.id, 'bottle'));
    assert.equal(state.inventory.milk, 8);
    assert.equal(Math.round(k.joy), 40 + KIDS.joy.care);
    assert.equal(G.careKid(k.id, 'bottle'), false, 'toutes les quatre heures');
    // deux jours : un enfant (heureux)
    k.joy = 100;
    clock.t += 30 * H;
    G.familyTick();
    k.joy = 100;
    clock.t += 20 * H;
    G.familyTick();
    assert.equal(G.stageOf(k), 1, G.stageName(k));
    // l'enfant ramasse de petites choses
    k.find = 0;
    assert.ok(G.kidFind(k.id));
    assert.equal(G.kidFind(k.id), false);
    // un malheureux grandit deux fois moins vite
    k.joy = 0;
    const g0 = k.grow;
    clock.t += 10 * H;
    G.familyTick();
    assert.ok(Math.abs(k.grow - g0 - 5) < 0.01, `${k.grow - g0}`);
    // ado : un coup de main au marché
    k.grow = KIDS.ages[1];
    k.joy = 100;
    assert.equal(G.stageOf(k), 2);
    const m0 = G.marketMult();
    assert.ok(G.setTask(k.id, 'market'));
    assert.ok(Math.abs(G.marketMult() / m0 - (1 + KIDS.help)) < 1e-9);
    assert.ok(G.setTask(k.id, 'workshop'));
    assert.equal(G.kidFx('market'), 1);
    assert.ok(G.kidFx('workshop') > 1);
    // le bureau des grands : un peu plus
    const w0 = G.kidFx('workshop');
    build('study');
    assert.ok(G.kidFx('workshop') > w0);
    // adulte
    k.grow = KIDS.ages[2];
    assert.equal(G.stageName(k), 'Adulte');
    assert.ok(G.renameKid(k.id, '  Mon   grand  '));
    assert.equal(k.name, 'Mon grand');
});

test('1.124 : l’onglet Enfants et ses actions existent', () => {
    const v = readFileSync(new URL('../../src/ui/views/family.js', import.meta.url), 'utf8');
    for (const a of ['fmExpect', 'fmCare', 'fmFind', 'fmTask']) assert.match(v, new RegExp(`\\n {8}${a}: `), a);
});
