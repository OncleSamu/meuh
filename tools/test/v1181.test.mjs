// Tests 1.181 : Le Refuge & Clinique Vétérinaire (patients sauvages/ferme, remèdes, soins, adoption, paniers, boutique, palmarès & Prestige).
import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../../src/core/state.js';
import * as G from '../../src/systems/index.js';
import { ITEMS } from '../../src/data/items.js';
import { WILD_SPECIES, REFUGE_REMEDIES, REFUGE_LVLS, REFUGE_PALM } from '../../src/data/refuge.js';

function setupRefuge(lvl = 40) {
    G.loadGame();
    state.level = lvl;
    state.money = 1e6;
    for (const id of ['wood', 'plank', 'stone', 'nail', 'cotton', 'lavender', 'chamomile', 'mint', 'thyme', 'honey', 'milk', 'carrot', 'apple', 'feed']) {
        state.inventory[id] = 50;
    }
    G.ensureGenetics();
    G.ensurePastures();
    G.ensureRefuge();
}

test('1.181 : Données Refuge valides (12 espèces sauvages, 5 remèdes aux ingrédients existants)', () => {
    assert.equal(WILD_SPECIES.length, 12);
    for (const sp of WILD_SPECIES) {
        for (const g of sp.gift) assert.ok(ITEMS[g], `gift manquant: ${g}`);
    }
    for (const rem of REFUGE_REMEDIES) {
        for (const id of Object.keys(rem.need)) assert.ok(ITEMS[id], `ingrédient remède manquant: ${id}`);
    }
});

test('1.181 : Cycle complet animal sauvage (arrivée → remède → soin → relâche → Carnet + bonus vitesse)', () => {
    setupRefuge(40);
    assert.ok(G.refugeOpen());
    assert.ok(G.refugeTick()); // 1er patient immédiat
    assert.equal(G.refugePatients().length, 1);

    // Forcer un patient sauvage
    state.refuge.patients = [];
    const p = G.spawnRefugePatient(true);
    assert.ok(p && p.kind === 'wild');
    assert.equal(p.phase, 'waiting');

    assert.ok(G.giveRefugeRemedy(p.uid));
    assert.equal(p.phase, 'ready');

    const cared = G.finishRefugeCare(p.uid, 0.92);
    assert.ok(cared && cared.phase === 'healed' && cared.stars === 3);

    const moneyBefore = state.money;
    const multBefore = G.refugeAnimalMult();
    const res = G.releaseWildPatient(p.uid);
    assert.ok(res && res.firstTime);
    assert.ok(state.money > moneyBefore);
    assert.ok(state.income.refuge >= res.coins);
    assert.equal(G.refugeSpeciesCount(), 1);
    assert.equal(G.refugeTotalHealed(), 1);
    assert.ok(G.refugeHearts() >= 3);
    assert.ok(G.refugeAnimalMult() > multBefore);
});

test('1.181 : Animal de ferme recueilli — adoption avec robe rare (3 étoiles) et retour au village', () => {
    setupRefuge(40);
    state.refuge.patients = [
        { uid: 'pf1', kind: 'farm', animalType: 'cow', name: 'Marguerite', title: 'Vache recueillie', remedy: 'balm', symptom: 'Patte foulée', phase: 'ready', stars: 0 },
        { uid: 'pf2', kind: 'farm', animalType: 'sheep', name: 'Flocon', title: 'Mouton recueilli', remedy: 'tea', symptom: 'Grosse frayeur', phase: 'ready', stars: 0 },
    ];
    const animalsBefore = state.animals.length;
    G.finishRefugeCare('pf1', 0.95);
    const adopted = G.adoptFarmPatient('pf1');
    assert.ok(adopted);
    assert.equal(state.animals.length, animalsBefore + 1);
    assert.equal(adopted.love, 3);
    assert.equal(adopted.rescued, 1);

    G.finishRefugeCare('pf2', 0.6);
    const ret = G.returnFarmPatient('pf2');
    assert.ok(ret && ret.coins > 0 && ret.hearts >= 4);
});

test('1.181 : Agrandissement de la clinique, Paniers sauvages et Boutique de Bienveillance', () => {
    setupRefuge(50);
    assert.equal(G.refugeLvl(), 1);
    assert.ok(G.upgradeRefuge());
    assert.equal(G.refugeLvl(), 2);
    assert.equal(G.refugeDef().beds, REFUGE_LVLS[1].beds);
    assert.ok(G.upgradeRefuge());
    assert.equal(G.refugeLvl(), 3);
    assert.equal(G.refugeDef().beds, REFUGE_LVLS[2].beds);

    // Panier de la faune reconnaissante
    state.refuge.baskets.push({ id: 'b99', species: 'faon', item: 'honey', qty: 2, coins: 400 });
    const honeyBefore = state.inventory.honey;
    assert.ok(G.collectRefugeBasket('b99'));
    assert.equal(state.inventory.honey, honeyBefore + 2);

    // Boutique de Bienveillance
    state.refuge.hearts = 30;
    const cow = G.newAnimal('cow');
    cow.adult = true;
    cow.sick = true;
    cow.love = 2;
    state.animals.push(cow);

    assert.ok(G.buyRefugeShop('tenderness'));
    assert.equal(cow.sick, false);
    assert.equal(cow.love, 3);

    assert.ok(G.buyRefugeShop('vitality'));
    assert.ok(G.refugeVitalityLeftMs() > 3.5 * 3600000);
    assert.equal(G.refugeSickResist(), 1);
    assert.equal(G.cureCost(), 0);

    assert.ok(G.buyRefugeShop('breedBalm'));
    assert.equal(G.refugeBreedBalmCount(), 1);
    const baby = G.newAnimal('cow');
    assert.ok(G.applyRefugeBirthBonus(baby));
    assert.equal(G.refugeBreedBalmCount(), 0);

    const rubBefore = state.prestige.rubans;
    assert.ok(G.buyRefugeShop('pack'));
    assert.equal(state.prestige.rubans, rubBefore + 1);
});

test('1.181 : Palmarès Vétérinaire à 5 paliers et conservation complète au Prestige', () => {
    setupRefuge(100);
    state.refuge.lvl = 3;
    state.refuge.healed = 30;
    state.refuge.hearts = 9;
    state.refuge.breedBalms = 2;
    state.refuge.seen = { faon: 2, lynx: 1 };

    const palm = G.refugePalmState();
    assert.equal(palm.length, REFUGE_PALM.length);
    assert.ok(palm[0].canClaim && palm[1].canClaim && palm[2].canClaim);
    assert.ok(!palm[3].canClaim);

    const rubBefore = state.prestige.rubans;
    assert.ok(G.claimRefugePalm('r1'));
    assert.ok(!G.claimRefugePalm('r1'));
    assert.equal(state.prestige.rubans, rubBefore + REFUGE_PALM[0].rubans);
    assert.equal(G.refugeHearts(), 9 + REFUGE_PALM[0].hearts);
    assert.ok(G.refugeFreeCure());
    assert.ok(G.refugeSickResist() >= 0.45);

    // Vérifier conservation au Prestige
    state.stats.earnedRun = 5000000;
    const heartsBefore = G.refugeHearts();
    assert.ok(G.doPrestige());
    assert.equal(state.refuge.lvl, 3);
    assert.equal(state.refuge.healed, 30);
    assert.equal(state.refuge.hearts, heartsBefore);
    assert.equal(state.refuge.breedBalms, 2);
    assert.equal(state.refuge.seen.lynx, 1);
    assert.equal(state.refuge.palmClaimed.r1, true);
    assert.deepEqual(state.refuge.patients, []);
});
