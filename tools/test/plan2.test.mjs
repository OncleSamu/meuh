// Plan de production étendu : Tableau d'intendance (Domaine), multi-plats, bières maison, commandes en 1 clic, audit économique.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import { setClock } from '../../src/core/clock.js';
import * as G from '../../src/systems/index.js';
import { DOMAINE_LVL, PLAN_UPGRADE } from '../../src/data/domaine.js';
import { PROJECTS } from '../../src/data/village.js';

let T = Date.UTC(2026, 10, 19, 12);
function farm(lvl = 45) {
    T = Date.UTC(2026, 10, 19, 12);
    setClock(() => T);
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm', hidden: false });
    state.tutorial.done = true;
    state.level = lvl;
    state.money = 1e9;
    state.barn.lvl = 14;
    state.villagers.gaston = { ...(state.villagers.gaston || {}), hearts: 5 };
    for (const k of ['plank', 'paint', 'beam', 'nail', 'tools']) state.inventory[k] = 500;
    state.machines = [];
    for (const t of ['pastaworks', 'kitchen', 'dairy', 'mill', 'bakery', 'pizzeria', 'malthouse', 'sawmill']) {
        state.machines.push(G.newMachine(t));
    }
}
const run = (sec = 25000) => {
    for (let i = 0; i < sec && G.planOf(); i++) {
        T += 1000;
        G.gameTick();
    }
};

test('Tableau d’intendance (Domaine) : débloque les plans multi-plats de 2 à 8', () => {
    farm(DOMAINE_LVL - 1);
    assert.equal(G.planCap(), 1);
    assert.equal(G.planUpCan(), false);
    assert.equal(G.buyPlanUp(), false);
    state.level = DOMAINE_LVL;
    const spentBefore = G.domSpent();
    for (let k = 0; k < PLAN_UPGRADE.caps.length; k++) {
        assert.ok(G.planUpCan(), `palier ${k + 1} achetable`);
        assert.ok(G.buyPlanUp(), `achat palier ${k + 1}`);
        assert.equal(G.planCap(), PLAN_UPGRADE.caps[k]);
    }
    assert.equal(G.planUpCan(), false);
    assert.equal(G.buyPlanUp(), false);
    assert.equal(
        G.domSpent() - spentBefore,
        PLAN_UPGRADE.coins.reduce((a, b) => a + b, 0),
    );
});

test('plan multi-plats : bloqué à 1 plat avant achat, partage le stock commun après achat', () => {
    farm(45);
    Object.assign(state.inventory, {
        wheat: 60,
        flour: 0,
        egg: 30,
        tomato: 60,
        carrot: 30,
        milk: 60,
        pasta: 0,
        sauce: 0,
        cheese: 2,
        bread: 0,
        lasagna: 0,
    });
    // Sans Tableau d'intendance : startMultiPlan limite à 1 plat
    assert.ok(
        G.startMultiPlan([
            { kind: 'recipe', id: 'lasagna', n: 3 },
            { kind: 'recipe', id: 'bread', n: 2 },
        ]),
    );
    assert.equal(G.planEntries().length, 1);
    G.stopPlan();

    // Avec le palier 1 (2 plats) : les deux plats tournent ensemble et partagent le stock
    assert.ok(G.buyPlanUp());
    assert.equal(G.planCap(), 2);
    const pv = G.prodMultiPreview([
        { kind: 'recipe', id: 'lasagna', n: 2 },
        { kind: 'recipe', id: 'cheese', n: 3 },
    ]);
    // 2 lasagnes (besoin 2 fromages) + 3 fromages finaux : les 2 fromages en stock couvrent les lasagnes,
    // il reste 0 fromage intermédiaire à faire pour les lasagnes !
    assert.ok(!pv.steps.some(s => s.id === 'cheese'), 'le stock commun de fromage est dédupliqué');

    assert.ok(
        G.startMultiPlan([
            { kind: 'recipe', id: 'lasagna', n: 2 },
            { kind: 'recipe', id: 'bread', n: 2 },
        ]),
    );
    assert.equal(G.planEntries().length, 2);
    run(25000);
    assert.equal(G.planOf(), null, 'plan multi-plats terminé');
    const las = state.machines.find(m => m.type === 'pastaworks');
    const bak = state.machines.find(m => m.type === 'bakery');
    assert.equal((las.out.lasagna || 0) + las.queue.filter(x => x === 'lasagna').length, 2);
    assert.equal((bak.out.bread || 0) + bak.queue.filter(x => x === 'bread').length, 2);
});

test('bières maison dans le plan : malte l’orge et enchaîne plusieurs brassins en cuve', () => {
    farm(50);
    state.projects.malthouse = { done: true };
    state.projects.brewhall = { done: true };
    G.ensureBrew();
    const B = state.brew;
    // On crée une bière connue : Blonde fraise (maltBlond + hop + strawberry)
    B.beers.b1 = {
        id: 'b1',
        name: 'Blonde fraise',
        malt: 'maltBlond',
        hop: 1,
        ings: [['strawberry', 1]],
        stars: 2,
        value: 120,
        bases: {},
        note: 0,
        made: 6,
        day: 1,
    };
    B.sig['maltBlond|1|strawberry:1'] = 'b1';
    Object.assign(state.inventory, { barley: 60, maltBlond: 0, hop: 40, strawberry: 40 });
    assert.ok(G.brewPlannable('b1'));
    const pv = G.beerPreview('b1', 3);
    assert.ok(pv.steps.some(s => s.id === 'maltBlond'), 'le plan prévoit le malt à la malterie');
    assert.deepEqual(pv.raws, []);

    assert.ok(G.startBeerPlan('b1', 3));
    // On laisse tourner assez longtemps pour malter, brasser, embouteiller et lancer les 3 brassins
    run(30000);
    assert.equal(G.planOf(), null, 'les 3 brassins sont lancés');
    const inVats = B.vats.filter(v => v && v.bid === 'b1').length;
    const bottled = B.stock.b1 || 0;
    assert.ok(inVats > 0 || bottled > 0, 'des brassins tournent ou sont en bouteille');
});

test('planifier toute une commande en 1 clic : train, montgolfière, bateau, chantier, villageois', () => {
    farm(45);
    Object.assign(state.inventory, {
        wheat: 80,
        flour: 0,
        egg: 40,
        tomato: 80,
        carrot: 40,
        milk: 80,
        pasta: 0,
        sauce: 0,
        cheese: 0,
        lasagna: 1,
        bread: 0,
        wood: 0,
        plank: 0,
    });

    // 1. Train (multi-étapes : lasagnes nécessite pâte + sauce + fromage)
    state.truck = {
        status: 'here',
        expiresAt: T + 3600000,
        slots: [
            { id: 'lasagna', qty: 3, loaded: false, gold: 100 },
            { id: 'cheese', qty: 2, loaded: false, gold: 100 },
            { id: 'wheat', qty: 5, loaded: false, gold: 50 },
        ],
    };
    assert.ok(G.canPlanOrder('train'));
    const td = G.orderPlanData('train');
    assert.equal(td.items.find(x => x.id === 'lasagna').n, 2, '1 lasagne déjà en stock déduite');
    assert.equal(td.items.find(x => x.id === 'cheese').n, 2);
    assert.ok(G.startOrderPlan('train'));
    assert.equal(G.planInfo().title, 'Train de marchandises');
    G.stopPlan();

    // 2. Montgolfière (avec produit brut manquant)
    state.balloon = {
        status: 'here',
        expiresAt: T + 3600000,
        items: [
            { id: 'lasagna', qty: 3 },
            { id: 'strawberry', qty: 10 },
        ],
    };
    state.inventory.strawberry = 0;
    assert.ok(G.canPlanOrder('balloon'));
    assert.ok(G.startOrderPlan('balloon'));
    assert.equal(G.planInfo().title, 'Montgolfière');
    assert.ok(G.planSummary().raws.some(r => r.id === 'strawberry'), 'les fraises brutes manquantes sont signalées');
    G.stopPlan();

    // 3. Bateau
    state.boat = { status: 'here', expiresAt: T + 3600000, items: [{ id: 'lasagna', qty: 3 }] };
    assert.ok(G.canPlanOrder('boat'));
    assert.ok(G.startOrderPlan('boat'));
    assert.equal(G.planInfo().title, 'Bateau de livraison');
    G.stopPlan();

    // 4. Chantier du village (la boulangerie du chapitre 1 demande du pain + du blé)
    const pid = 'bakery';
    assert.ok(PROJECTS[pid] && G.projectOpen(pid));
    state.projects[pid] = { done: false, given: {} };
    state.inventory.bread = 0;
    state.inventory.wheat = 0; // blé manquant : le plan reste actif en attente du blé
    assert.ok(G.canPlanOrder('project', pid));
    assert.ok(G.startOrderPlan('project', pid));
    assert.ok(G.planInfo().title.startsWith('Chantier · '));
    G.stopPlan();

    // 5. Commande de villageois
    state.quests = [{ vid: 'marie', items: [{ id: 'lasagna', qty: 3 }], gold: 200, xp: 20 }];
    assert.ok(G.canPlanOrder('quest', 0));
    assert.ok(G.startOrderPlan('quest', 0));
    assert.ok(G.planInfo().title.startsWith('Commande de '));
    G.stopPlan();
});

test('UI et actions : tous les nouveaux boutons du planificateur et du domaine sont câblés', () => {
    const planSrc = readFileSync(new URL('../../src/ui/sheets/plan.js', import.meta.url), 'utf8');
    const ordersSrc = readFileSync(new URL('../../src/ui/views/orders.js', import.meta.url), 'utf8');
    const villageSrc = readFileSync(new URL('../../src/ui/views/village.js', import.meta.url), 'utf8');
    const brewSrc = readFileSync(new URL('../../src/ui/views/brewery.js', import.meta.url), 'utf8');
    for (const act of ['planTab', 'planBeer', 'planDraftAdd', 'planDraftQty', 'planDraftDel', 'planDraftClear', 'planDraftGo', 'planOrder', 'planDomaine']) {
        assert.match(planSrc, new RegExp(`\\n {8}${act}: `), `action ${act} dans plan.js`);
    }
    assert.match(villageSrc, /\n {8}buyPlanUp: /, 'action buyPlanUp dans village.js');
    assert.ok(ordersSrc.includes("act: 'planOrder'"), 'bouton Planifier dans orders.js');
    assert.ok(villageSrc.includes("act: 'planOrder'"), 'bouton Planifier dans village.js');
    assert.ok(brewSrc.includes("act: 'planBeer'"), 'bouton Planifier dans brewery.js');
});

test('audit économique (tools/dev/check-econ.mjs) : JSON valide et zéro marge négative vendable', () => {
    const out = execFileSync(process.execPath, ['tools/dev/check-econ.mjs', '--json', '--strict'], { encoding: 'utf8' });
    const data = JSON.parse(out);
    assert.ok(data.summary.recipes > 800);
    assert.equal(data.summary.negativeMarginCount, 0);
    assert.ok(data.topBottlenecks.length > 0);
    assert.ok(data.byMachine.length > 40);
});
