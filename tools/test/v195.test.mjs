// 1.95 : les saisons de la ferme passent à douze thèmes, liés aux grands défis.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import { setClock } from '../../src/core/clock.js';
import * as G from '../../src/systems/index.js';
import { FARM_SEASONS, FARM_SEASON_DEFIS, FARM_SEASON_MS } from '../../src/data/port.js';
import { DEFIS } from '../../src/data/defis.js';
import { DECOS } from '../../src/data/farm.js';
import { ITEMS } from '../../src/data/items.js';
import { PROJECTS } from '../../src/data/village.js';
import { MACHINES } from '../../src/data/machines.js';
import { ANIMALS } from '../../src/data/animals.js';
import { VILLAGERS } from '../../src/data/village.js';
import { ui } from '../../src/art/kit.js';
import '../../src/art/index.js';

let T = 0;
// le début d'une saison dont le thème est `id`
const startOf = id => {
    const k0 = Math.floor(Date.UTC(2026, 10, 8) / FARM_SEASON_MS);
    const k = k0 + ((FARM_SEASONS.findIndex(s => s.id === id) - (k0 % FARM_SEASONS.length) + FARM_SEASONS.length) % FARM_SEASONS.length);
    return k * FARM_SEASON_MS + 3600e3;
};
function farm(theme = 'cheese') {
    T = startOf(theme);
    setClock(() => T);
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = 64;
    state.projects.chapel = { done: true };
}
function fullFarm(theme) {
    farm(theme);
    state.level = 100;
    state.greenhouse.built = true;
    Object.keys(PROJECTS).forEach(k => (state.projects[k] = { done: true }));
    Object.keys(VILLAGERS).forEach(k => (state.villagers[k] = { ...(state.villagers[k] || {}), hearts: 10 }));
    Object.keys(MACHINES).forEach(t => state.machines.push({ type: t, id: t, q: [] }));
    Object.keys(ANIMALS).forEach(t => state.animals.push({ type: t }));
    state.apiary = { island: { hives: 2, honey: 0 }, oasis: { hives: 2, honey: 0 }, nord: { hives: 2, honey: 0 } };
}

test('1.95 : douze saisons, chacune avec ses produits, son fanion et ses défis', () => {
    assert.equal(FARM_SEASONS.length, 12);
    for (const s of FARM_SEASONS) {
        assert.ok(ITEMS[s.icon], `${s.id} : icône`);
        assert.ok(DECOS[s.deco], `${s.id} : décoration`);
        assert.equal(typeof ui[s.deco], 'function', `${s.id} : dessin`);
        assert.ok(s.items.length >= 8, s.id);
        s.items.filter(x => x !== 'beer').forEach(x => assert.ok(ITEMS[x], `${s.id} : ${x}`));
        assert.ok((FARM_SEASON_DEFIS[s.id] || []).length >= 1, s.id);
        FARM_SEASON_DEFIS[s.id].forEach(d => assert.ok(DEFIS[d], `${s.id} : ${d}`));
    }
});

test('1.95 : une saison finie laisse un trophée daté, sans doublon', () => {
    farm('haras');
    G.ensureFarmSeason();
    state.fseason.pts = 1000;
    state.fseason.got[0] = state.fseason.got[1] = true;
    T += FARM_SEASON_MS;
    G.ensureFarmSeason();
    const log = G.farmSeasonLog();
    assert.equal(log.length, 1);
    assert.equal(log[0].id, 'haras');
    assert.equal(log[0].tiers, 2);
    assert.equal(log[0].pts, 1000);
    G.ensureFarmSeason();
    assert.equal(G.farmSeasonLog().length, 1);
    // une saison sans point ne laisse rien
    T += FARM_SEASON_MS;
    G.ensureFarmSeason();
    assert.equal(G.farmSeasonLog().length, 1);
});

test('1.95 : un défi du thème de la saison compte double pour la Coupe', () => {
    farm('haras');
    assert.equal(G.defiThemed('haras'), true);
    assert.equal(G.defiThemed('chateau'), false);
    G.ensureCup();
    const p0 = G.cupPts();
    G.cupOnMedal(3, 'chateau');
    const plain = G.cupPts() - p0;
    G.cupOnMedal(3, 'haras');
    assert.equal(G.cupPts() - p0 - plain, plain * 2);
});

test('1.95 : la saison met son défi dans l’offre', () => {
    for (let k = 0; k < 8; k++) {
        fullFarm('miel');
        const offer = G.drawOffer();
        assert.equal(offer.length, 3);
        assert.ok(offer.includes('miel'), offer.join());
    }
});

test('1.95 : la bière et le miel comptent pour la saison', () => {
    farm('brasserie');
    G.ensureFarmSeason();
    G.farmSeasonAdd('beer', 4);
    assert.equal(state.fseason.pts, 4);
    farm('miel');
    G.ensureFarmSeason();
    G.farmSeasonAdd('honey', 3);
    assert.equal(state.fseason.pts, 3);
});
