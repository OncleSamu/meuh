// Les sauvegardes : une ferme écrite par la 6.2 se charge telle quelle, et les codes d'export font l'aller-retour.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { clock, memStore } from './helpers.mjs';
import { state, setStore, SAVE_KEY } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import { loadGame, gameTick, offlineProgress } from '../../src/systems/game.js';
import { packSave, readCode } from '../../src/systems/savecodes.js';
import * as G from '../../src/systems/index.js';
import { RECIPES } from '../../src/data/machines.js';
import { ITEMS } from '../../src/data/items.js';

const OLD = readFileSync(new URL('./fixtures/save-6.2.json', import.meta.url), 'utf8');

test('une sauvegarde de la 6.2 se charge sans rien perdre', () => {
    const store = memStore();
    store.setItem(SAVE_KEY, OLD);
    setStore(store);
    const old = JSON.parse(OLD);
    clock.t = old.lastSaved + 1000;
    loadGame();
    setView({ started: true, tab: 'farm' });
    // 1.4 : le niveau passe à l'échelle des 50 niveaux, à expérience totale égale (un peu plus haut)
    assert.ok(state.level > old.level && state.level <= 60, 'niveau ' + state.level);
    assert.ok(state.lv14);
    const totOld = G.xpToReach(old.level, G.getXpReqOld) + old.xp;
    assert.ok(Math.abs(G.xpToReach(state.level) + state.xp - totOld) < 10, 'expérience totale gardée');
    // ce qui était ouvert le reste
    for (const r of Object.values(RECIPES))
        if (r.lvOld <= old.level && !r.teacher && !r.fete && !r.holiday && G.storyOk(ITEMS[r.id])) assert.ok(G.recipeUnlocked(r.id), r.id);
    const xp0 = state.xp,
        lv0 = state.level;
    assert.equal(state.money, old.money);
    assert.equal(state.animals.length, old.animals.length);
    // 1.8 : on garde ses machines, mais on n'en reçoit plus en cadeau au chargement
    const types = new Set(state.machines.map(m => m.type));
    // 1.17 : le salon de thé et la brûlerie deviennent un seul comptoir
    const moved = t => (t === 'teahouse' || t === 'roastery' ? 'counter' : t);
    old.machines.forEach(m => assert.ok(types.has(moved(m.type)), m.type));
    assert.equal(
        state.machines.length,
        new Set(old.machines.map(m => moved(m.type))).size +
            old.machines.filter(m => moved(m.type) === m.type).length -
            new Set(old.machines.filter(m => moved(m.type) === m.type).map(m => m.type)).size,
    );
    assert.equal(state.pendingGift131, undefined);
    assert.equal(state.grid.length, old.grid.length);
    assert.equal(state.prestige.rubans, old.prestige.rubans);
    for (const k of Object.keys(old)) assert.ok(k in state, 'clé perdue : ' + k);
    // et la ferme tourne
    for (let s = 0; s < 600; s++) {
        clock.t += 1000;
        gameTick();
    }
    assert.ok(state.level > lv0 || state.xp >= xp0);
});

test('une longue absence sur une vieille ferme', () => {
    clock.t += 9 * 3600 * 1000;
    const r = offlineProgress();
    assert.ok(r && r.lines.length > 0);
});

test('le code d’export fait l’aller-retour', async () => {
    const json = JSON.stringify(state);
    const code = await packSave(json);
    assert.match(code, /^MEUH[01]\./);
    const back = await readCode(code);
    assert.equal(back.json, json);
    assert.equal(back.save.level, state.level);
    await assert.rejects(readCode('pas une ferme'));
});
