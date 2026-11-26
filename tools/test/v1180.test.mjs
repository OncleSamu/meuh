// Tests 1.180 : Concours hippiques 2.0 (Express quotidiens, échauffement, pouvoirs chevaux titrés, Boutique des Éperons, Palmarès & Prestige).
import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../../src/core/state.js';
import * as G from '../../src/systems/index.js';
import { SHOW, FORM, SHOW_EXPRESS, SHOW_PREPS, SHOW_TITLE_FX, SHOW_PALM_TIERS } from '../../src/data/haras.js';
import { ITEMS } from '../../src/data/items.js';

function setupHaras(count = 2, apt = 70) {
    G.loadGame();
    state.level = 100;
    state.money = 1e8;
    for (const id of ['plank', 'beam', 'nail', 'stone', 'paint', 'oat', 'apple', 'iron']) state.inventory[id] = 500;
    G.ensureGenetics();
    G.ensurePastures();
    G.upgradeStable();
    const list = [];
    for (let k = 0; k < count; k++) {
        const a = G.newAnimal('horse');
        a.adult = true;
        a.name = `Éclair ${k + 1}`;
        for (const gKey of ['speed', 'robust', 'docile', 'jump']) a.g.t[gKey] = [[5, 1], [5, 1]];
        state.animals.push(a);
        G.lodge(a.uid);
        const r = G.rec(a);
        for (const d of SHOW.rot) r.pts[d] = apt;
        list.push(a);
    }
    G.ensureShow();
    return list;
}

test('1.180 : Concours Express quotidiens — 3 épreuves, jugement immédiat, Éperons, rosette et titre', () => {
    const [a] = setupHaras(1, 80);
    const list = G.expressList();
    assert.equal(list.length, SHOW_EXPRESS.perDay);
    assert.equal(G.expressLeft(), 3);

    const moneyBefore = state.money;
    const out = G.runExpressJules(a.uid, 0, 0);
    assert.ok(out);
    assert.equal(out.place, 1);
    assert.ok(out.coins > 0);
    assert.ok(state.money > moneyBefore);
    assert.ok(state.income.haras >= out.coins);
    assert.ok(out.spurs >= SHOW_EXPRESS.spurs[0]);
    assert.equal(G.showSpurs(), out.spurs);
    assert.equal(G.titlesOf(a.uid), 1);
    assert.ok(state.show.rose[0] >= 1);
    assert.equal(G.expressLeft(), 2);

    // impossible de rejouer la même épreuve aujourd'hui
    assert.equal(G.runExpressJules(a.uid, 0, 0), null);
});

test('1.180 : Échauffement tactique — bonus discipline préférée, note espérée et consommation au départ', () => {
    const [a] = setupHaras(1, 60);
    for (const p of SHOW_PREPS) {
        if (p.item) assert.ok(ITEMS[p.item], `item manquant: ${p.item}`);
        assert.ok(G.showPrepItemLabel(p).length > 0);
    }
    const beforeGalop = G.showNote(a, 'galop', 0.75).note;
    const beforeDress = G.showNote(a, 'dressage', 0.75).note;

    assert.ok(G.applyPrep(a.uid, 'oat'));
    assert.equal(G.prepOf(a.uid).id, 'oat');
    assert.equal(G.prepBonus(a.uid, 'galop'), 8);
    assert.equal(G.prepBonus(a.uid, 'dressage'), 5);
    assert.ok(G.showNote(a, 'galop', 0.75).note > beforeGalop + 7.5);
    assert.ok(G.showNote(a, 'dressage', 0.75).note > beforeDress + 4.5);

    // consommé après le concours express
    assert.ok(G.runExpressJules(a.uid, 0, 0));
    assert.equal(G.prepOf(a.uid), null);
});

test('1.180 : Pouvoirs permanents des chevaux Titrés et Aura des Grands Champions', () => {
    const [champ, trainee] = setupHaras(2, 50);
    const baseForm = G.formEvery(trainee);
    const baseTrain = G.trainGain(trainee, 'galop', 0.5);
    const baseMult = G.showHorseAnimalMult(champ);
    assert.equal(Math.round(baseForm), FORM.every);
    assert.equal(baseMult, 1);

    // 1 titre sur champ → forme -20 %, crin +25 %, rando améliorée
    state.show.titles[champ.uid] = 1;
    assert.ok(G.isTitledHorse(champ));
    assert.ok(!G.isGrandChampHorse(champ));
    assert.ok(G.formEvery(champ) < FORM.every * 0.85);
    assert.equal(G.showHorseAnimalMult(champ), 1 + SHOW_TITLE_FX.crinSpeed);
    assert.equal(G.showRandoBonus(champ).extraDraws, SHOW_TITLE_FX.randoExtra);

    // 3 titres → Grand Champion : Aura active sur l'autre cheval aux boxes
    state.show.titles[champ.uid] = 3;
    assert.ok(G.isGrandChampHorse(champ));
    const aura = G.showStableAura(trainee.uid);
    assert.equal(aura.count, 1);
    assert.ok(G.formEvery(trainee) < baseForm);
    assert.ok(G.trainGain(trainee, 'galop', 0.5) >= baseTrain);

    // Hérédité sur un poulain né d'un Grand Champion + Élixir de galop
    G.rec(champ).spec = 'galop';
    state.show.elixirs = 1;
    const baby = G.newAnimal('horse');
    for (const gKey of ['speed', 'robust', 'docile', 'jump']) baby.g.t[gKey] = [[2, 1], [2, 1]];
    G.studBorn(baby, champ, trainee);
    assert.ok(G.aptOf(baby, 'galop') >= SHOW_TITLE_FX.foalApt);
    assert.ok(G.geneOf(baby, 'galop') >= 3);
    assert.equal(G.showElixirCount(), 0);
});

test('1.180 : Boutique des Éperons d’or — Avoine dorée, Soin complet, Manuel, Élixir et Pack Prestige', () => {
    const [a] = setupHaras(1, 50);
    state.show.spurs = 50;
    G.rec(a).form = 1;
    G.rec(a).spec = 'saut';
    a.love = 2;

    assert.ok(G.buyShowShop('fullCare'));
    assert.equal(G.formOf(a), FORM.max);
    assert.equal(a.love, 3);

    const beforeSaut = G.aptOf(a, 'saut');
    assert.ok(G.buyShowShop('manual', a.uid));
    assert.equal(G.aptOf(a, 'saut'), beforeSaut + 6);

    assert.ok(G.buyShowShop('goldOats'));
    assert.ok(G.showGoldOatsLeftMs() > 3.5 * 3600000);

    assert.ok(G.buyShowShop('elixir'));
    assert.equal(G.showElixirCount(), 1);

    const rubBefore = state.prestige.rubans;
    const packsBefore = G.ensureTcg().freePacks || 0;
    assert.ok(G.buyShowShop('booster'));
    assert.equal(state.prestige.rubans, rubBefore + 1);
    assert.equal(G.ensureTcg().freePacks, packsBefore + 1);
});

test('1.180 : Palmarès à 5 paliers et conservation complète au Prestige', () => {
    setupHaras(1, 60);
    state.show.wins = 20;
    state.show.spurs = 7;
    state.show.elixirs = 2;
    state.show.rose[0] = 4;

    const palm = G.showPalmState();
    assert.equal(palm.length, SHOW_PALM_TIERS.length);
    assert.ok(palm[0].canClaim && palm[1].canClaim && palm[2].canClaim);
    assert.ok(!palm[3].canClaim);

    const rubBefore = state.prestige.rubans;
    assert.ok(G.claimShowPalm('t1'));
    assert.ok(!G.claimShowPalm('t1')); // réclamable une seule fois
    assert.equal(state.prestige.rubans, rubBefore + SHOW_PALM_TIERS[0].rubans);
    assert.equal(G.showSpurs(), 7 + SHOW_PALM_TIERS[0].spurs);

    const tot = G.showPalmTotals();
    assert.ok(tot.train > 0 && tot.purse > 0 && tot.form > 0 && tot.crin > 0 && tot.note >= 2);

    // Vérifier conservation au Prestige
    state.stats.earnedRun = 5000000;
    const spursBefore = G.showSpurs();
    assert.ok(G.doPrestige());
    assert.equal(state.show.wins, 20);
    assert.equal(state.show.spurs, spursBefore);
    assert.equal(state.show.elixirs, 2);
    assert.equal(state.show.rose[0], 4);
    assert.equal(state.show.palmClaimed.t1, true);
    assert.deepEqual(state.show.entries, []);
});
