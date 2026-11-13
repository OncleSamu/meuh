// 1.126 : la transmission. Un enfant adulte reprend la ferme ; rien ne repart de zéro.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { clock, memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { KIDS } from '../../src/data/family.js';

test('léguer la ferme : on devient l’héritier, les parents prennent leur retraite', () => {
    setStore(memStore());
    G.loadGame();
    setView({ started: true, tab: 'farm' });
    state.tutorial.done = true;
    state.level = 60;
    state.money = 123456789;
    state.me = { look: 'h514012302620', farm: 'Les Trois Chênes' };
    G.ensureFamily();
    Object.assign(state.family, { spouse: 'tiago', aff: 100, affAt: clock.t, since: clock.t, rooms: { bedroom: 1, nursery: 1, kidsroom: 1 } });
    const adult = { id: 'k1', name: 'Zoé', girl: true, born: clock.t, at: clock.t, grow: KIDS.ages[2], joy: 100, care: {}, find: clock.t, task: 'market', look: 'h325060300000' };
    const sib = { id: 'k2', name: 'Hugo', girl: false, born: clock.t, at: clock.t, grow: KIDS.ages[2], joy: 100, care: {}, find: clock.t, task: 'field', look: 'h510030200000', metier: 'pecheur' };
    adult.spouse = { name: 'Bastien', look: 'h410030200000', woman: false, likes: ['apple'] };
    adult.gk = [{ id: 'k1g1', name: 'Léo', girl: false, born: clock.t - 50 * 3600000, look: 'h415020100000', gen: 2 }];
    state.family.kids.push(adult, sib);
    assert.equal(G.canLegate('k1'), false, 'il faut un métier');
    G.setKidMetier('k1', 'arbo');
    assert.equal(G.canLegate('k1'), false, 'et un peu de temps');
    clock.t += G.LEGACY.wait;
    assert.ok(G.canLegate('k1'));
    const pop0 = G.population().total;
    const x0 = G.xpBonus();
    const lvl = state.level;
    assert.ok(G.legate('k1'));
    // rien ne repart de zéro
    assert.equal(state.level, lvl);
    assert.equal(state.money, 123456789);
    assert.equal(state.me.farm, 'Les Trois Chênes');
    // on est l'héritière, avec son conjoint et ses enfants
    assert.equal(state.me.look, 'h325060300000');
    assert.equal(G.vName(G.spouseOf()), 'Bastien');
    assert.deepEqual(
        G.kids().map(k => k.name),
        ['Léo'],
    );
    assert.equal(G.stageOf(G.kids()[0]), 2, 'Léo a grandi pendant ce temps : un ado');
    assert.equal(G.kids()[0].task, 'field');
    assert.equal(G.generation(), 2);
    assert.equal(G.elders().length, 1);
    assert.equal(G.elders()[0].spouse, 'tiago');
    // le frère reste au village, son métier compte encore ; personne ne disparaît
    assert.equal(state.family.kin.length, 1);
    assert.ok(G.kidMetiers().includes('pecheur'));
    assert.equal(G.population().total, pop0);
    // la sagesse des anciens
    assert.ok(Math.abs(G.xpBonus() / x0 - (1 + G.LEGACY.xp)) < 1e-9);
    // le conjoint venu du camping : un panier plus garni, et on peut avoir d'autres enfants
    assert.ok(G.basketReady());
    assert.ok(G.takeBasket());
    assert.ok(G.canExpect());
    assert.equal(G.canLegate('k2'), false, 'Hugo n’est plus un enfant de la ferme');
});

test('1.126 : la carte et l’action existent', () => {
    const v = readFileSync(new URL('../../src/ui/views/family.js', import.meta.url), 'utf8');
    assert.match(v, /\n {8}fmLegate: /);
});
