// 1.96 : podium de fin de saison, records, bilan de l'année, défis éclair.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import { setClock } from '../../src/core/clock.js';
import * as G from '../../src/systems/index.js';
import { FARM_SEASON_MS } from '../../src/data/port.js';
import { DEFIS, MINI } from '../../src/data/defis.js';

let T = 0;
function farm() {
    T = Math.floor(Date.UTC(2026, 10, 8) / FARM_SEASON_MS) * FARM_SEASON_MS + 3600e3;
    setClock(() => T);
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = 80;
    state.projects.chapel = { done: true };
}
const endSeason = pts => {
    G.ensureFarmSeason();
    state.fseason.pts = pts;
    T += FARM_SEASON_MS;
    G.ensureFarmSeason();
};

test('1.96 : une saison finie classe la ferme face aux quatre rivales, toujours pareil', () => {
    farm();
    endSeason(5000);
    const r = G.farmSeasonLog().at(-1);
    assert.equal(r.riv.length, 4);
    assert.ok(r.rank >= 1 && r.rank <= 5);
    assert.equal(r.rank, 1 + r.riv.filter(p => p > r.pts).length);
    // une très grosse saison gagne, une toute petite perd
    farm();
    endSeason(5000000);
    assert.equal(G.farmSeasonLog().at(-1).rank, 1);
    farm();
    endSeason(1);
    assert.equal(G.farmSeasonLog().at(-1).rank, 5);
});

test('1.96 : le podium garde les cinq fermes et un souvenir pour les trois premiers', () => {
    farm();
    endSeason(5000000);
    const p = G.lastPodium();
    assert.equal(p.rows.length, 5);
    assert.equal(p.rows[0].me, true);
    assert.ok((state.album || []).some(ph => /Première place/.test(ph.sub)));
});

test('1.96 : records par thème et bilan de l’année', () => {
    farm();
    endSeason(1000);
    assert.equal(G.farmSeasonLog().at(-1).record, true);
    assert.equal(Object.values(G.seasonRecords())[0], 1000);
    const y = G.yearReview();
    assert.equal(y.seasons, 1);
    assert.equal(y.podium.length, 3);
    assert.ok(y.topTheme && y.topTheme.id);
});

test('1.96 : défi éclair : se lance, se compte, se récupère une fois', () => {
    farm();
    state.stats.clients = 0;
    state.machines.push({ type: 'counter', id: 'c', q: [] });
    G.ensureDefis();
    state.defis.miniLast = null;
    // on force un défi dont le compteur est simple
    assert.equal(G.startMini(), true);
    assert.equal(G.startMini(), false, 'un seul à la fois');
    const m = G.curMini();
    assert.ok(m && m.n >= 1);
    assert.equal(G.claimMini(), false);
    state.stats[m.stat] = (state.stats[m.stat] || 0) + m.n;
    assert.equal(G.miniDone(m), true);
    const money = state.money;
    assert.equal(G.claimMini(), true);
    assert.ok(state.money > money);
    assert.equal(G.curMini(), null);
    assert.equal(G.miniLog().length, 1);
});

test('1.96 : un défi éclair non fini disparaît au bout de trois jours', () => {
    farm();
    assert.equal(G.startMini(), true);
    T += (MINI.days + 0.1) * 86400000;
    G.defiTick();
    assert.equal(G.curMini(), null);
    assert.equal(G.miniLog().length, 0);
});

test('1.96 : toutes les parties qui ouvrent un défi ou un éclair sont connues', () => {
    Object.entries(DEFIS).forEach(([id, d]) => assert.ok(G.partKnown(d.open), `${id} : ${d.open}`));
    Object.values(DEFIS).forEach(d => d.steps.forEach(s => [s.needs].forEach(n => assert.ok(G.partKnown(n), n))));
    MINI.list.forEach(m => assert.ok(G.partKnown(m.open), `éclair ${m.id} : ${m.open}`));
});

test('1.96 : le souk et le grand hiver restent fermés sans l’oasis ni le Grand Nord', () => {
    farm();
    assert.equal(G.partOk('oasis'), false);
    assert.equal(G.partOk('nord'), false);
    assert.equal(G.defiEligible('souk'), false);
    assert.equal(G.defiEligible('hiver'), false);
});
