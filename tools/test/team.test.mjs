import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import { setClock } from '../../src/core/clock.js';
import * as G from '../../src/systems/index.js';
import { SPR } from '../../src/art/index.js';
import { TIPS } from '../../src/data/texts.js';
import { CHANGELOG } from '../../src/data/changelog.js';
import { TEAM_LINA, TEAM_HENRI, TEAM_MILO } from '../../src/data/team.js';

const clock = { t: Date.UTC(2026, 10, 24, 12, 0, 0) };
setClock(() => clock.t);
setView({ tab: 'farm', sub: 'field', hidden: false });

function richFarm(lvl = 80) {
    setStore(memStore());
    G.loadGame();
    state.level = lvl;
    state.money = 50_000_000;
    state.barn.lvl = 50;
    state.tutorial.done = true;
    Object.assign(state.inventory, {
        tools: 200,
        wood: 200,
        hardwood: 200,
        resin: 200,
        ironIngot: 200,
        cutStone: 200,
        solidOak: 200,
        silverIngot: 200,
        feed: 100,
        wheat: 100,
        milk: 100,
    });
    state.seeds.wheat = 50;
    state.seeds.carrot = 50;
    state.seeds.tomato = 50;
    G.ensureTeam();
}

test('Théo · Champs & Serre : options « Inclure la Serre » et « Suivre le Plan actif »', () => {
    richFarm(80);
    state.farmhand.lvl = 2;
    state.greenhouse.built = true;
    G.ensureGhPlots();
    assert.equal(G.handGhCan(), false, 'Inclure la Serre demande Théo niv. 3');
    assert.equal(G.handPlanCan(), false, 'Suivre le Plan actif demande Théo niv. 4');

    state.farmhand.lvl = 3;
    assert.equal(G.handGhCan(), true);
    assert.equal(G.toggleHandGh(), true);
    assert.equal(G.handGhOn(), true);

    // Une parcelle prête dans la serre est récoltée et replantée par Théo
    const gp = state.greenhouse.plots[0];
    gp.isUnlocked = true;
    gp.itemId = 'tomato';
    gp.isReady = true;
    gp.isWatered = true;
    const beforeTom = state.inventory.tomato || 0;
    G.handPass();
    assert.ok((state.inventory.tomato || 0) > beforeTom, 'Théo récolte la serre');
    assert.equal(gp.itemId, 'tomato', 'Théo replante la culture précédente en serre');

    // Suivre le Plan actif (niv. 4)
    state.farmhand.lvl = 4;
    assert.equal(G.toggleHandFollowPlan(), true);
    assert.equal(G.handFollowPlanOn(), true);
    // Lancer un plan qui demande des carottes (soupe ou similaire) — ou un plan avec carottes manquantes
    state.inventory.carrot = 0;
    state.inventory.wheat = 0;
    state.machines.push(G.newMachine('mill'));
    G.startPlan('flour', 2); // demande du blé (raws)
    const p0 = state.grid[0];
    p0.isUnlocked = true;
    p0.itemId = null;
    p0.hand = 'carrot';
    G.handPass();
    assert.equal(p0.itemId, 'wheat', 'Théo privilégie la culture manquante du Plan actif');
});

test('Lina · Animaux : prés, modes et auto-soin des bêtes malades au niveau 4', () => {
    richFarm(80);
    assert.equal(G.linaLvl(), 0);
    assert.equal(G.upgradeLina(), true);
    assert.equal(G.linaLvl(), 1);

    // Pré 0 et Pré 1
    G.ensurePastures();
    const cow0 = G.newAnimal('cow');
    cow0.adult = true;
    cow0.pasture = 0;
    cow0.food = 0;
    cow0.stack = 2;
    cow0.sick = true;
    const cow1 = G.newAnimal('cow');
    cow1.adult = true;
    cow1.pasture = 1;
    cow1.food = 0;
    cow1.stack = 2;
    state.animals.push(cow0, cow1);

    const milkBefore = state.inventory.milk || 0;
    G.linaPass();
    assert.ok((state.inventory.milk || 0) > milkBefore, 'Lina niv. 1 ramasse au 1er pré');
    assert.ok(cow0.food > 0, 'Lina niv. 1 nourrit au 1er pré');
    assert.equal(cow0.sick, true, 'Lina niv. 1 ne soigne pas encore');
    assert.equal(cow1.stack, 2, 'Lina niv. 1 ne touche pas encore au 2e pré');

    // Mode Ramasser seulement
    assert.equal(G.setLinaMode('collect'), true);
    cow0.food = 0;
    cow0.stack = 1;
    G.linaPass();
    assert.equal(cow0.stack, 0);
    assert.equal(cow0.food, 0, 'en mode Ramasser seulement, Lina ne nourrit pas');

    // Monter Lina au niveau 4 : tous les prés + auto-soin
    assert.equal(G.setLinaMode('both'), true);
    assert.equal(G.upgradeLina(), true); // niv 2
    assert.equal(G.upgradeLina(), true); // niv 3
    assert.equal(G.upgradeLina(), true); // niv 4
    assert.equal(G.linaLvl(), 4);
    G.linaPass();
    assert.equal(cow0.sick, false, 'Lina niv. 4 soigne automatiquement la bête malade');
    assert.equal(cow1.stack, 0, 'Lina niv. 4 s’occupe aussi des autres prés');
    assert.ok(cow1.food > 0);
});

test('Henri · Atelier : liste de 3 à 6 recettes maintenues au seuil de stock', () => {
    richFarm(80);
    state.machines.push(G.newMachine('mill'), G.newMachine('dairy'), G.newMachine('bakery'));
    assert.equal(G.upgradeHenri(), true);
    assert.equal(G.henriLvl(), 1);
    assert.equal(G.henriMaxSlots(), 3);

    // Ajouter 3 recettes max au niv. 1
    assert.equal(G.henriAddRule('flour', 10), true);
    assert.equal(G.henriAddRule('butter', 10), true);
    assert.equal(G.henriAddRule('bread', 10), true);
    assert.equal(G.henriAddRule('cheese', 10), false, 'plafond de 3 recettes au niveau 1');

    // Modifier seuil et retirer
    assert.equal(G.henriBumpTarget('flour', 5), true);
    assert.equal(G.henriRules().find(r => r.id === 'flour').target, 15);
    assert.equal(G.henriRemoveRule('bread'), true);
    assert.equal(G.henriRules().length, 2);

    // Stock de farine sous le seuil (0 < 15) : Henri lance des lots
    state.inventory.flour = 0;
    state.inventory.wheat = 50;
    state.inventory.butter = 20; // au-dessus du seuil 10 : ne doit PAS lancer de beurre
    const res = G.henriPass();
    assert.ok(res && res.queued > 0, 'Henri lance la farine sous le seuil');
    const mill = state.machines.find(m => m.type === 'mill');
    const dairy = state.machines.find(m => m.type === 'dairy');
    assert.ok(mill.queue.includes('flour'), 'le moulin a reçu la farine');
    assert.equal(dairy.queue.length, 0, 'aucun lot lancé quand le stock dépasse déjà le seuil');

    // Quand le moulin a un lot prêt, Henri le ramasse aussi
    mill.out.flour = 2;
    const beforeF = state.inventory.flour;
    G.henriPass();
    assert.ok(state.inventory.flour >= beforeF + 2, 'Henri ramasse les sorties prêtes');

    // Monter jusqu'au niveau 4 -> 6 recettes
    assert.equal(G.upgradeHenri(), true);
    assert.equal(G.upgradeHenri(), true);
    assert.equal(G.upgradeHenri(), true);
    assert.equal(G.henriMaxSlots(), 6);
});

test('Milo · Nature : nasses, fruits tombés du verger, charges et cueillette forêt', () => {
    richFarm(80);
    assert.equal(G.upgradeMilo(), true);
    assert.equal(G.miloLvl(), 1);

    // 1. Nasse prête
    const p = G.ensurePond();
    p.traps.push({ spot: 'bank', bait: null, start: clock.t - 10 * 3600 * 1000 });
    // 2. Fruit tombé au verger
    const slot = G.slotsOf('farm')[0];
    slot.unlocked = true;
    slot.tree = { id: 'apple', ground: 3, drops: 1, mat: 1000 };

    const appleBefore = state.inventory.apple || 0;
    const fishBefore = state.stats.fish || 0;
    const r1 = G.miloPass(false);
    assert.ok(r1 && r1.traps > 0, 'Milo relève les nasses prêtes');
    assert.ok((state.stats.fish || 0) > fishBefore);
    assert.ok((state.inventory.apple || 0) >= appleBefore + 3, 'Milo ramasse les fruits tombés du verger');
    assert.equal(slot.tree.ground, 0);

    // Mode Verger seulement ne touche pas aux nasses
    assert.equal(G.setMiloMode('orchard'), true);
    p.traps[0].start = clock.t - 10 * 3600 * 1000;
    G.miloPass(false);
    assert.equal(G.trapReady(p.traps[0]), true, 'en mode Verger seulement, les nasses restent en attente');

    // Niveau 2 : charges bûcheron/mineur + cueillette forêt
    assert.equal(G.setMiloMode('all'), true);
    assert.equal(G.upgradeMilo(), true);
    const n = G.ensureNat();
    n.workers.lumber = { lvl: 1, at: clock.t - 5 * 3600 * 1000 };
    const woodBefore = state.inventory.wood || 0;
    const r2 = G.miloPass(true);
    assert.ok(r2 && r2.loads > 0 && state.inventory.wood > woodBefore, 'Milo niv. 2 collecte les charges du bûcheron');
});

test('Bouton maître « Tout mettre en pause / Tout activer », hors-ligne et Prestige', () => {
    richFarm(80);
    state.farmhand.lvl = 3;
    G.upgradeLina();
    G.upgradeHenri();
    G.upgradeMilo();
    assert.equal(G.teamHiredCount(), 4);
    assert.equal(G.teamActiveCount(), 4);

    // Pause globale
    assert.equal(G.teamToggleAll(), true);
    assert.equal(G.teamActiveCount(), 0);
    assert.equal(G.handPaused(), true);
    assert.equal(G.linaPaused(), true);
    assert.equal(G.henriPaused(), true);
    assert.equal(G.miloPaused(), true);

    // Réactivation globale
    assert.equal(G.teamToggleAll(), true);
    assert.equal(G.teamActiveCount(), 4);

    // Règle d'Henri + Prestige conserve toute l'équipe
    state.machines.push(G.newMachine('mill'));
    G.henriAddRule('flour', 25);
    const off = G.teamOffline(1800);
    assert.equal(typeof off.lina, 'number');
    assert.equal(typeof off.henri, 'number');
    assert.equal(typeof off.milo, 'number');

    G.doPrestige();
    assert.equal(G.handLvl(), 3);
    assert.equal(G.linaLvl(), 1);
    assert.equal(G.henriLvl(), 1);
    assert.equal(G.miloLvl(), 1);
    assert.equal(G.henriRules().length, 1);
    assert.equal(G.henriRules()[0].id, 'flour');
    assert.equal(G.henriRules()[0].target, 25);
});

test('Portraits SVG (Lina, Henri, Milo), données, astuce, changelog et déblocages', () => {
    for (const id of ['theo', 'lina', 'henri', 'milo']) {
        const svg = SPR.villager(id);
        assert.ok(svg.includes('<svg') && !svg.includes('undefined') && !svg.includes('NaN'), `portrait ${id} valide`);
    }
    assert.equal(TEAM_LINA.length, 5);
    assert.equal(TEAM_HENRI.length, 5);
    assert.equal(TEAM_MILO.length, 5);
    assert.ok(TIPS.team && TIPS.team.title);
    const ver = readFileSync(new URL('../../VERSION', import.meta.url), 'utf8').trim();
    assert.equal(CHANGELOG[0].v, ver);
    for (const lvl of [28, 30, 32]) {
        const list = G.unlocksAt(lvl);
        assert.ok(
            list.some(u => u.go === 'sheet:house' && /Équipe du Domaine/.test(u.name)),
            `déblocage Équipe présent au niveau ${lvl}`,
        );
    }
});
