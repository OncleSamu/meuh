// 1.1 : les grands défis (tirage sans répétition, étapes, médailles, trophées).
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { clock, memStore } from './helpers.mjs';
import { state, setStore, SAVE_KEY } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { DEFI, DEFIS } from '../../src/data/defis.js';
import { ITEMS } from '../../src/data/items.js';
import { DECOS } from '../../src/data/farm.js';
import { VILLAGERS } from '../../src/data/village.js';

const OLD = readFileSync(new URL('./fixtures/save-6.2.json', import.meta.url), 'utf8');
const tick = s => {
    for (let k = 0; k < s; k++) {
        clock.t += 1000;
        G.gameTick();
    }
};

test('les données des défis sont complètes', () => {
    assert.equal(Object.keys(DEFIS).length, 17);
    for (const [id, d] of Object.entries(DEFIS)) {
        assert.ok(VILLAGERS[d.who], `${id} : ${d.who}`);
        assert.ok(DECOS[d.deco], `${id} : ${d.deco}`);
        assert.equal(d.steps.length, 4, id);
        for (const s0 of d.steps)
            for (const s of [s0, s0.alt].filter(Boolean)) {
                if (s.kind === 'give') for (const x of s.pool) assert.ok(ITEMS[x], `${id} : ${x}`);
                if (s.kind === 'count') assert.ok(s.stat && s.text, `${id} : ${s.name}`);
            }
    }
});

test('au niveau 50, un défi arrive ; un défi ne revient pas avant le 4e tirage', () => {
    const st = memStore();
    st.setItem(SAVE_KEY, OLD);
    setStore(st);
    clock.t = JSON.parse(OLD).lastSaved + 1000;
    G.loadGame();
    setView({ started: true, tab: 'farm' });
    tick(2);
    assert.equal(G.curDefi(), null, 'rien avant le niveau 50');
    state.level = 60;
    tick(2);
    // 1.40 : trois défis proposés, on en choisit un
    const offer = G.defiOffer();
    assert.equal(offer.length, 3);
    assert.equal(new Set(offer).size, 3);
    assert.ok(G.pickDefi(offer[0]));
    const d = G.curDefi();
    assert.ok(d && DEFIS[d.id], 'un défi en cours');
    assert.equal(d.steps.length, 4);
    // tirages successifs : jamais un des 3 derniers
    const seen = [d.id];
    for (let k = 0; k < 30; k++) {
        clock.t = G.curDefi().end + 1000;
        tick(1);
        assert.ok(G.pickDefi(G.defiOffer()[0]));
        const id = G.curDefi().id;
        assert.ok(!seen.slice(-DEFI.noRepeat).includes(id), `${id} trop tôt (${seen.slice(-3)})`);
        seen.push(id);
    }
});

test('livrer, compter, et la médaille d’or tombe à la 4e étape', () => {
    G.startDefi('chateau');
    const d = G.curDefi();
    const before = state.money;
    // tout livrer
    d.steps.forEach((st, k) => {
        st.items.forEach(x => (state.inventory[x.id] = (state.inventory[x.id] || 0) + x.n));
        assert.ok(G.giveDefi(k));
    });
    assert.equal(G.stepsDone(), 4);
    assert.equal(d.awarded, 3, 'or');
    assert.ok(state.money > before);
    assert.equal(state.defis.trophies.chateau.best, 3);
    assert.ok(state.decorInv.castleTower >= 1, 'décoration unique');
    // 1.40 : médaille gagnée, les trois défis suivants sont proposés tout de suite ; on garde le défi tant qu'on n'a pas choisi
    tick(5);
    assert.equal(G.curDefi().id, 'chateau');
    assert.equal(G.defiOffer().length, 3);
    assert.ok(!G.defiOffer().includes('chateau'));
    assert.ok(G.pickDefi(G.defiOffer()[1]));
    assert.notEqual(G.curDefi().id, 'chateau');
});

test('une étape à compter avance toute seule ; 2 étapes donnent le bronze', () => {
    G.startDefi('export');
    const d = G.curDefi();
    const cnt = d.steps.filter(s => s.kind === 'count');
    cnt.slice(0, 2).forEach(s => (state.stats[s.stat] = (state.stats[s.stat] || 0) + s.n));
    tick(1);
    assert.equal(G.stepsDone(), 2);
    clock.t = d.end + 1000;
    tick(1);
    assert.equal(state.defis.trophies.export.best, 1, 'bronze');
});

test('le marché garde ce que le défi attend ; vendre la ferme garde les trophées', () => {
    G.startDefi('banquet');
    const st = G.curDefi().steps[0];
    const id = st.items[0].id;
    state.settings.reserve = true;
    state.inventory[id] = 3;
    assert.equal(G.reservedQty(id), 3);
    const n = Object.keys(state.defis.trophies).length;
    G.doPrestige('', 'none');
    assert.equal(Object.keys(state.defis.trophies).length, n);
    assert.equal(G.curDefi(), null);
    tick(3);
});

test('1.18 : les 5 nouveaux défis se construisent, les compteurs avancent et la bière se présente', () => {
    for (const id of ['brasserie', 'comptoir', 'grandePeche', 'expedition', 'cuvee']) {
        G.startDefi(id);
        const d = G.curDefi();
        assert.equal(d.id, id);
        assert.equal(d.steps.length, 4);
        for (const st of d.steps) assert.ok(st.kind !== 'give' || st.items.length > 0, `${id} : ${st.name}`);
    }
    // la bière maison : refusée sous les étoiles demandées, acceptée au-dessus
    G.startDefi('brasserie');
    const k = G.curDefi().steps.findIndex(s => s.kind === 'beer');
    assert.ok(k >= 0);
    const need = G.curDefi().steps[k].n;
    state.brew = state.brew || { beers: {} };
    state.brew.beers = { b1: { id: 'b1', name: 'La Blonde', stars: Math.max(1, need - 1), made: 3 } };
    assert.equal(G.presentDefi(k, 'b1'), false);
    state.brew.beers.b1.stars = need;
    assert.ok(G.presentDefi(k, 'b1'));
    assert.equal(G.curDefi().steps[k].who, 'La Blonde');
    // un compteur de défi avance quand on agit
    G.startDefi('comptoir');
    const c = G.curDefi().steps.findIndex(s => s.stat === 'clients');
    state.stats.clients = (state.stats.clients || 0) + G.curDefi().steps[c].n;
    assert.equal(G.stepCount(G.curDefi().steps[c]), G.curDefi().steps[c].n);
});
