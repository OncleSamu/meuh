// Les sauvegardes : une ferme écrite par la 6.2 se charge telle quelle, et les codes d'export font l'aller-retour.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { clock, memStore } from './helpers.mjs';
import { state, setStore, SAVE_KEY } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import { loadGame, gameTick, offlineProgress } from '../../src/systems/game.js';
import { packSave, readCode } from '../../src/systems/savecodes.js';

const OLD = readFileSync(new URL('./fixtures/save-6.2.json', import.meta.url), 'utf8');

test('une sauvegarde de la 6.2 se charge sans rien perdre', () => {
    const store = memStore();
    store.setItem(SAVE_KEY, OLD);
    setStore(store);
    const old = JSON.parse(OLD);
    clock.t = old.lastSaved + 1000;
    loadGame();
    setView({ started: true, tab: 'farm' });
    assert.equal(state.level, old.level);
    assert.equal(state.money, old.money);
    assert.equal(state.animals.length, old.animals.length);
    assert.equal(state.machines.length, old.machines.length);
    assert.equal(state.grid.length, old.grid.length);
    assert.equal(state.prestige.rubans, old.prestige.rubans);
    for (const k of Object.keys(old)) assert.ok(k in state, 'clé perdue : ' + k);
    // et la ferme tourne
    for (let s = 0; s < 600; s++) {
        clock.t += 1000;
        gameTick();
    }
    assert.ok(state.xp >= old.xp);
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
