// 1.179 : Suite de tests complète pour le Comice agricole 2.0.
import test from 'node:test';
import assert from 'node:assert/strict';
import { clock, memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { COMICE, COMICE_EXPRESS, COMICE_PALM_TIERS, COMICE_PRIZE_FX } from '../../src/data/elevage.js';

function boot(types = ['cow', 'cow', 'goat', 'chicken', 'sheep']) {
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'animals' });
    state.level = 55;
    state.money = 500_000;
    state.animals = types.map(t => {
        const a = G.newAnimal(t);
        a.adult = true;
        a.p = 0;
        a.food = 3;
        return a;
    });
}

test('1.179 : pouvoirs permanents des bêtes Primées (vitesse +25 %, aura pré +10..30 %, Foin d’or +35 %)', () => {
    boot(['cow', 'cow', 'goat', 'sheep']);
    const [champ, mate1, mate2, mate3] = state.animals;
    const baseSelf = G.comiceAnimalMult(champ);
    const baseMate = G.comiceAnimalMult(mate1);
    assert.equal(baseSelf, 1);
    assert.equal(baseMate, 1);

    // 1 bête primée : +25 % pour elle, +10 % aura pour les voisines du même pré
    champ.prize = 1;
    assert.ok(Math.abs(G.comiceAnimalMult(champ) - (1 + COMICE_PRIZE_FX.speed)) < 1e-6);
    assert.ok(Math.abs(G.comiceAnimalMult(mate1) - (1 + COMICE_PRIZE_FX.auraPer)) < 1e-6);

    // 3 bêtes primées dans le pré -> aura plafonnée à +30 % sur la 4e bête
    mate1.prize = 1;
    mate2.prize = 1;
    assert.ok(Math.abs(G.comicePastureAura(0, mate3) - COMICE_PRIZE_FX.auraMax) < 1e-6);

    // Foin d'or (+35 %) cumulé par-dessus
    state.comice = G.ensureComice();
    state.comice.cocardes = 10;
    assert.equal(G.buyComiceShop('goldHay'), true);
    assert.ok(G.comiceGoldHayLeftMs() > 3 * 3600 * 1000);
    assert.ok(G.comiceAnimalMult(mate3) > 1.7);
});

test('1.179 : Concours express quotidiens (3/jour, résultat immédiat, Cocardes, revenus & plaque Primée)', () => {
    boot(['cow', 'cow', 'goat', 'chicken']);
    G.comiceTick();
    const list = G.comiceExpressList();
    assert.equal(list.length, COMICE_EXPRESS.perDay);
    assert.equal(G.comiceExpressLeft(), 3);

    // Préparer une bête forte (5 cœurs + bons gènes) et rivales faibles pour garantir 1re place >= 75
    const ev = list[0];
    const cand = state.animals.find(a => a.type === ev.type);
    cand.love = 5;
    for (const k of Object.keys(cand.g.t)) {
        cand.g.t[k] = [
            [6, 1],
            [6, 1],
        ];
    }
    ev.rivals.forEach(r => (r.score = 10));

    const m0 = state.money;
    const res = G.runComiceExpress(0, cand.uid, 1);
    assert.ok(res);
    assert.equal(res.rank, 1);
    assert.ok(res.score >= COMICE_EXPRESS.prizeMinScore);
    assert.equal(res.gotPrize, true, 'plaque Primée décernée dès 75/100 en 1re place');
    assert.equal(cand.prize, 1);
    assert.ok(state.money > m0);
    assert.ok((state.income.comice || 0) > 0);
    assert.equal(G.comiceCocardes(), COMICE_EXPRESS.cocardes[1]);
    assert.equal(G.comiceExpressLeft(), 2);
    // Impossible de relancer une épreuve déjà terminée
    assert.equal(G.runComiceExpress(0, cand.uid, 1), null);
});

test('1.179 : Préparation tactique (+6 pts ×1,5 jury) et 2e mini-jeu Parade du Jury (+10 pts)', () => {
    boot(['cow', 'goat', 'chicken']);
    G.comiceTick();
    const cat = state.comice.cats[0];
    cat.jury = 'beauty';
    const [best] = G.comiceCandidates(cat.id);
    G.comiceEnter(cat.id, best.id);
    const s0 = G.catScore(cat);

    // Préparation Toilettage de gala (+6 beauté, amplifié ×1,5 par le jury beauté => +9)
    assert.equal(G.setComicePrep(cat.id, 'groom'), true);
    const s1 = G.catScore(cat);
    assert.ok(s1 > s0, 'la préparation tactique augmente la note');

    // Parade du Jury (+10 pts max, 1 fois/jour)
    assert.equal(G.canParade(cat), true);
    assert.equal(G.comiceParade(cat.id, 1), true);
    assert.equal(G.canParade(cat), false);
    assert.equal(G.catScore(cat), Math.min(100, s1 + COMICE.paradeMax));
});

test('1.179 : Boutique des Cocardes (Friandise, Élixir de lignée, Booster MeuhCG, Bête championne) & Palmarès + Prestige', () => {
    boot(['cow', 'cow']);
    G.comiceTick();
    const c = G.ensureComice();
    c.cocardes = 50;

    // Friandise royale : +1 cœur
    const [cow1, cow2] = state.animals;
    cow1.love = 2;
    assert.equal(G.buyComiceShop('treat', cow1.uid), true);
    assert.equal(cow1.love, 3);

    // Élixir de lignée : actif à la prochaine naissance au pré (garde les gènes hauts + finition rare)
    assert.equal(G.buyComiceShop('elixir'), true);
    assert.equal(G.comiceElixirCount(), 1);
    for (const x of [cow1, cow2]) {
        x.g.t.rich = [
            [5, 1],
            [5, 1],
        ];
    }
    G.toggleBirths(0);
    G.birthsTick();
    clock.t += 30 * 3600 * 1000;
    const [baby] = G.birthsTick();
    assert.ok(baby, 'un petit est né au pré');
    assert.equal(G.comiceElixirCount(), 0, 'l’Élixir a été consommé');
    assert.ok(G.traitOf(baby.g, 'rich') >= 5, 'aucune régression sur les bons gènes grâce à l’Élixir');
    assert.ok(G.looksOf(baby.g).finish > 0, 'finition rare garantie par l’Élixir');

    // Booster MeuhCG
    const packsBefore = G.ensureTcg().freePacks;
    assert.equal(G.buyComiceShop('booster'), true);
    assert.equal(G.ensureTcg().freePacks, packsBefore + 1);

    // Bête de lignée championne
    const countBefore = state.animals.length;
    assert.equal(G.buyComiceShop('champ'), true);
    assert.equal(state.animals.length, countBefore + 1);
    const champ = state.animals[state.animals.length - 1];
    assert.equal(champ.prize, 1);
    assert.ok(G.looksOf(champ.g).finish > 0);

    // Palmarès à paliers (3 espèces -> palier 0 réclamable + bonus vitesse +5 %)
    c.wins = { cow: 1, goat: 1, sheep: 1 };
    assert.equal(G.comiceWinSpeciesCount(), 3);
    assert.equal(G.comicePalmClaimable(), 1);
    assert.equal(G.claimComicePalm(0), true);
    assert.equal(G.comicePalmClaimable(), 0);
    assert.equal(G.comicePalmTotals().speed, COMICE_PALM_TIERS[0].speed);

    // Prestige : palmarès, paliers et cocardes conservés
    state.level = 100;
    state.money = 10_000_000;
    state.stats.earnedRun = 10_000_000;
    const cocBefore = c.cocardes;
    assert.equal(G.doPrestige(), true);
    assert.equal(G.comiceWinSpeciesCount(), 3, 'palmarès conservé au Prestige');
    assert.equal(G.comiceCocardes(), cocBefore, 'cocardes conservées au Prestige');
    assert.equal(state.comice.palmClaimed[0], true, 'paliers conservés au Prestige');
});
