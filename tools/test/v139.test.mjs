// 1.39 : le moteur des fermes rivales (concours de la semaine).
import test from 'node:test';
import assert from 'node:assert/strict';
import { clock } from './helpers.mjs';
import { state, fromSave } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { RIVALS } from '../../src/data/village.js';

const DAY = 864e5;
const start = hist => {
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = 40;
    state.contest = null;
    state.contestHist = hist;
    G.contestTick();
    const c = state.contest;
    // une semaine entière, pour des calculs nets
    c.start = c.end - 7 * DAY;
    c.base0 = undefined;
    c.riv = null;
    c.feed = [];
    return c;
};

test('les rivales se calent sur vos derniers concours', () => {
    const c = start([2000, 2000, 2000]);
    const list = G.contestRanking(c.end);
    const firmin = list.find(x => x.name === RIVALS[3].name).score,
        hortense = list.find(x => x.name === RIVALS[0].name).score;
    assert.ok(Math.abs(firmin - 2200) <= 8, `Firmin ${firmin}`);
    assert.ok(Math.abs(hortense - 1600) <= 8, `Hortense ${hortense}`);
});

test('elles jouent par séances : le score monte par paliers, pas en continu', () => {
    const c = start([1000]);
    const ses = G.rivalSessions(c, 0);
    assert.ok(ses.length >= 15 && ses.length <= 21, `${ses.length} séances`);
    const mid = ses[5].t;
    G.contestRanking(mid - 1000);
    const a = c.riv[0].s;
    G.contestRanking(mid + 1000);
    assert.ok(c.riv[0].s >= a);
});

test('le même concours donne toujours les mêmes rivales', () => {
    const c = start([900]);
    const a = G.rivalSessions(c, 2).map(x => x.t + x.w);
    const b = G.rivalSessions(c, 2).map(x => x.t + x.w);
    assert.deepEqual(a, b);
});

test('coup de collier en fin de semaine quand une rivale est juste derrière', () => {
    // sans vous (score 0) : son but exact ; avec vous juste devant : plus
    const c = start([2000]);
    c.base0 = 2000;
    c.win = 1;
    const alone = G.rivalGoal(c, 2);
    const me = { total: Math.round(alone * 1.05) };
    c.riv = null;
    G.advanceRivals(c, c.end - 2 * DAY, me.total);
    G.advanceRivals(c, c.end, me.total);
    assert.ok(c.riv[2].s > alone + 5, `${c.riv[2].s} contre ${Math.round(alone)}`);
});

test('votre score entre dans la moyenne et se garde dans la sauvegarde', () => {
    const c = start([]);
    clock.t = c.end + 1000;
    G.contestTick();
    assert.equal(state.contestHist.length, 1);
    const back = fromSave(JSON.parse(JSON.stringify(state)));
    assert.deepEqual(back.contestHist, state.contestHist);
    assert.ok(back.contest.base0 > 0, 'les rivales du nouveau concours sont calées');
});
