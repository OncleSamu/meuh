import test from 'node:test';
import assert from 'node:assert/strict';
import { clock } from './helpers.mjs';
import { state } from '../../src/core/state.js';
import * as G from '../../src/systems/index.js';
import { GALOP, SAUT } from '../../src/data/haras.js';

const horse = () => {
    G.loadGame();
    state.level = 44;
    state.money = 1e9;
    for (const id of ['plank', 'beam', 'nail', 'stone', 'paint']) state.inventory[id] = 999;
    const a = G.newAnimal('horse');
    a.adult = true;
    state.animals = [a];
    G.ensureGenetics();
    G.ensurePastures();
    G.upgradeStable();
    G.lodge(a.uid);
    return a;
};
const play = (g, pattern, dt = 0.05) => {
    let k = 0;
    while (!g.done && k++ < 5000) {
        g.hold = pattern(g);
        G.stepGalop(g, dt);
    }
    return g;
};

test('1.23.2 galop : une course bien menée vaut mieux qu’un doigt collé ou jamais posé', () => {
    const rand = () => 0.5;
    // doigt collé : vitesse maximale, virages ratés
    const stuck = play(G.newGalop(rand), () => true);
    // doigt jamais posé : on ralentit à l’arrêt, pas de sprint
    const never = play(G.newGalop(rand), () => false);
    // bien mené : on vise le vert avant chaque virage, on fonce dans le sprint
    const [a, b] = GALOP.zone;
    const good = play(G.newGalop(rand), g => {
        const ahead = G.galopTurnAhead(g);
        if (g.dist >= GALOP.length - GALOP.sprint) return true;
        return g.v < (a + b) / 2 || (ahead != null && ahead > 150 && g.v < b - 0.02);
    });
    const [s1, s2, s3] = [stuck, never, good].map(G.galopScore);
    assert.ok(s3 > s1 && s3 > s2, `${s3} > ${s1}, ${s2}`);
    assert.ok(s3 > 0.6, 'une belle course dépasse 0,6');
    assert.equal(good.turnsDone.length, GALOP.turns.length);
});

test('1.23.2 galop : la note d’un virage est pleine dans le vert et retombe hors de la zone', () => {
    const [a, b] = GALOP.zone;
    assert.equal(G.turnScore((a + b) / 2), 1);
    assert.equal(G.turnScore(a), 1);
    assert.equal(G.turnScore(1), 0);
    assert.ok(G.turnScore(b + 0.1) < 1 && G.turnScore(b + 0.1) > 0);
});

test('1.23.2 galop : la course finit à la longueur de piste, avec un classement', () => {
    const g = play(
        G.newGalop(() => 0.5),
        () => true,
    );
    assert.ok(g.done && g.dist === GALOP.length);
    assert.ok(G.galopRank(g) >= 1 && G.galopRank(g) <= GALOP.rivals + 1);
    const slow = play(
        G.newGalop(() => 0.5),
        () => false,
    );
    assert.ok(G.galopRank(slow) >= G.galopRank(g));
});

test('1.23.2 saut : l’anneau donne parfait, bon ou faute selon le moment', () => {
    for (const i of [0, SAUT.obstacles - 1]) {
        const dur = G.sautDur(i);
        const at = r => (1 - r) * dur; // l’instant où l’anneau a ce rayon
        assert.equal(G.judgeJump(i, at(SAUT.target)), 'parfait');
        assert.equal(G.judgeJump(i, at(SAUT.target + G.sautWindows(i).good - 0.01)), 'bon');
        assert.equal(G.judgeJump(i, at(0.9)), 'faute', 'trop tôt');
        assert.equal(G.judgeJump(i, null), 'faute', 'pas d’appui');
    }
    assert.ok(G.sautDur(SAUT.obstacles - 1) < G.sautDur(0), 'de plus en plus vite');
    assert.ok(G.sautWindows(SAUT.obstacles - 1).perfect < G.sautWindows(0).perfect);
});

test('1.23.2 saut : trois fautes éliminent, huit obstacles finissent le parcours', () => {
    const s = G.newSaut();
    G.recordJump(s, 'faute');
    G.recordJump(s, 'parfait');
    G.recordJump(s, 'faute');
    assert.equal(s.done, false);
    G.recordJump(s, 'faute');
    assert.ok(s.done && s.eliminated);
    const all = G.newSaut();
    for (let k = 0; k < SAUT.obstacles; k++) G.recordJump(all, 'parfait');
    assert.ok(all.done && !all.eliminated);
    assert.equal(G.sautScore(all), 1);
    const half = G.newSaut();
    for (let k = 0; k < SAUT.obstacles; k++) G.recordJump(half, k % 2 ? 'faute' : 'bon');
    assert.ok(G.sautScore(half) < 0.5);
});

test('1.23.2 : une séance jouée paie la forme au départ et donne les points à la fin', () => {
    const a = horse();
    assert.ok(G.hasGame('galop') && G.hasGame('saut') && !G.hasGame('autre'));
    assert.equal(G.formOf(a), 5);
    assert.ok(G.startTrain(a.uid, 'saut'));
    assert.equal(G.formOf(a), 4);
    assert.equal(G.aptOf(a, 'saut'), 0);
    a.love = 0;
    const low = G.trainGain(a, 'saut', 0);
    const high = G.trainGain(a, 'saut', 1);
    assert.ok(high > low, 'un meilleur score donne plus de points');
    const got = G.endTrain(a.uid, 'saut', null, 1);
    assert.equal(got, high);
    assert.equal(G.aptOf(a, 'saut'), high);
    clock.t += 1;
});

test('1.23.2 : sans forme, pas de séance', () => {
    const a = horse();
    for (let k = 0; k < 5; k++) G.startTrain(a.uid, 'galop');
    assert.equal(G.startTrain(a.uid, 'galop'), null);
});
