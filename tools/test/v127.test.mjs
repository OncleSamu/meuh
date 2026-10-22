import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../../src/core/state.js';
import * as G from '../../src/systems/index.js';
import { NREQ, NMARKET } from '../../src/data/commerce.js';
import { RECIPES, MACHINES } from '../../src/data/machines.js';
import { PROJECTS, VILLAGERS } from '../../src/data/village.js';
import { clock } from './helpers.mjs';

const farm = (lvl = 50, hearts = 0, equip = true) => {
    G.loadGame();
    state.level = lvl;
    state.money = 1e8;
    state.barn.lvl = 30;
    state.nmarket = null;
    state.stats.dishServed = {};
    state.qmade = {};
    state.quality = {};
    G.ensureNeighbors();
    Object.values(state.neighbors).forEach(n => {
        n.hearts = hearts;
        n.pts = 0;
        n.req = null;
    });
    if (equip) {
        for (const m of Object.keys(MACHINES)) if (!state.machines.some(x => x.type === m)) state.machines.push(G.newMachine(m));
        for (const p of Object.values(PROJECTS)) state.projects[p.id] = { done: true };
        for (const v of Object.keys(VILLAGERS)) state.villagers[v] = { ...(state.villagers[v] || {}), hearts: 10 };
    }
};

test('1.27 : un plat de 0 à 2 cœurs, deux ou trois plats différents de 3 à 5 cœurs', () => {
    for (let h = 0; h <= 5; h++) {
        farm(50, h);
        const seen = new Set();
        for (let n = 0; n < 80; n++) {
            const r = G.makeNeighborReq(1);
            seen.add(r.items.length);
            assert.equal(new Set(r.items.map(x => x.id)).size, r.items.length, 'plats différents');
            for (const x of r.items) assert.equal(G.dishOwner(x.id), 1);
            if (h < 3) assert.equal(r.items.length, 1);
            else assert.ok(r.items.length >= 2 && r.items.length <= 3);
            if (h < 3)
                assert.ok(
                    r.items.every(x => !x.q),
                    'pas de qualité avant 3 cœurs',
                );
        }
        if (h >= 3) assert.ok(seen.has(2), `h=${h} : deux plats`);
        if (h === 5) assert.ok(seen.has(3), 'trois plats à 5 cœurs');
        assert.ok(!seen.has(3) || h >= 3);
    }
});

test('1.27 : la qualité n’est exigée que si la ferme a déjà su la faire', () => {
    farm(50, 5);
    for (let n = 0; n < 150; n++)
        assert.ok(
            G.makeNeighborReq(1).items.every(x => !x.q),
            'jamais sans l’avoir fabriqué',
        );
    for (const id of Object.keys(RECIPES)) if (G.dishOwner(id) === 1) state.qmade[id] = { s: 5, g: 0 };
    let q1 = 0,
        q2 = 0;
    for (let n = 0; n < 300; n++) {
        const r = G.makeNeighborReq(1);
        assert.ok(r.items.filter(x => x.q).length <= 1, 'une seule exigence par demande');
        for (const x of r.items.filter(y => y.q)) {
            assert.ok(x.q === 1, 'pas d’or sans or fabriqué');
            assert.ok(x.qty <= NREQ.qCap[1]);
            q1++;
        }
    }
    assert.ok(q1 > 40, `argent exigé ${q1} fois sur 300`);
    for (const id of Object.keys(RECIPES)) if (G.dishOwner(id) === 1) state.qmade[id] = { s: 5, g: 5 };
    for (let n = 0; n < 300; n++)
        for (const x of G.makeNeighborReq(1).items.filter(y => y.q)) {
            if (x.q === 2) {
                q2++;
                assert.ok(x.qty <= NREQ.qCap[2]);
            }
        }
    assert.ok(q2 > 20, `or exigé ${q2} fois`);
});

test('1.27 : récompense = 1,6 × la valeur (qualité comprise), +15 % par plat en plus', () => {
    farm(50, 5);
    for (const id of Object.keys(RECIPES)) if (G.dishOwner(id) === 2) state.qmade[id] = { s: 3, g: 3 };
    for (let n = 0; n < 60; n++) {
        const r = G.makeNeighborReq(2);
        const want = Math.round((G.reqValue(r.items) * 1.6 * (1 + NREQ.extra * (r.items.length - 1))) / 5) * 5;
        assert.equal(r.coins, want);
        assert.ok(r.mats.length >= (r.items.length > 1 ? 2 : 1));
    }
});

test('1.27 : livrer une demande avec qualité prend l’argent avant l’or et rend les pièces', () => {
    farm(50, 3);
    const [a, b] = Object.keys(RECIPES).filter(id => G.dishOwner(id) === 3 && G.questPool().some(i => i.id === id));
    state.neighbors[3].req = {
        items: [
            { id: a, qty: 2, q: 1 },
            { id: b, qty: 2 },
        ],
        until: clock.t + 1e6,
        coins: 5000,
        mats: ['plank'],
    };
    state.inventory[a] = 4;
    state.inventory[b] = 2;
    state.quality[a] = { s: 2, g: 1 };
    assert.equal(G.haveQ(a, 1), 3);
    assert.ok(G.reqReady(state.neighbors[3].req));
    state.quality[a] = { s: 0, g: 1 };
    assert.equal(G.reqReady(state.neighbors[3].req), false, 'une qualité suffisante manque');
    state.quality[a] = { s: 2, g: 1 };
    const money = state.money;
    assert.ok(G.helpNeighbor(3));
    assert.equal(state.money, money + 5000);
    assert.equal(state.inventory[a], 2);
    assert.equal(state.inventory[b], 0);
    assert.deepEqual(state.quality[a], { s: 0, g: 1 }, 'l’argent part avant l’or');
    assert.equal(G.dishServed(a), 2);
    assert.equal(G.dishServed(b), 2);
    assert.equal(state.neighbors[3].pts, 1);
    assert.equal(state.neighbors[3].req, null);
});

test('1.27 : la commande spéciale arrive au niveau 12, une par semaine, avec un plat jamais livré', () => {
    farm(11);
    G.specialTick();
    assert.equal(G.specialOf(), null);
    farm(50);
    assert.ok(G.specialTick());
    const sp = G.specialOf();
    assert.ok(sp && !sp.done);
    assert.equal(sp.items.length, 1);
    assert.equal(G.dishOwner(sp.items[0].id), sp.k);
    assert.equal(G.dishServed(sp.items[0].id), 0);
    assert.equal(sp.coins, Math.round((G.reqValue(sp.items) * NREQ.special.coins) / 5) * 5);
    assert.equal(sp.mats.length, NREQ.special.mats);
    assert.ok(sp.until > clock.t && sp.until <= clock.t + 7 * 864e5);
    const same = sp;
    assert.equal(G.specialTick(), false, 'une seule par semaine');
    assert.equal(G.specialOf(), same);
});

test('1.27 : livrer la commande spéciale (récompenses, amitié, plat noté), puis une autre la semaine suivante', () => {
    farm(50);
    G.specialTick();
    const sp = G.specialOf();
    const [x] = sp.items;
    assert.equal(G.helpSpecial(), false, 'rien en stock');
    state.inventory[x.id] = x.qty;
    state.quality[x.id] = { s: 0, g: x.q ? x.qty : 0 };
    if (x.q === 1) state.quality[x.id] = { s: x.qty, g: 0 };
    assert.ok(G.specialReady());
    const money = state.money,
        pts = state.neighbors[sp.k].pts,
        hearts = state.neighbors[sp.k].hearts;
    assert.ok(G.helpSpecial());
    assert.equal(state.money, money + sp.coins);
    assert.equal(state.inventory[x.id], 0);
    assert.ok(state.neighbors[sp.k].pts + state.neighbors[sp.k].hearts * 100 > pts + hearts * 100 - 1);
    assert.ok(sp.done && G.dishServed(x.id) === x.qty);
    assert.equal(G.helpSpecial(), false, 'une seule livraison');
    assert.equal(G.specialReady(), false);
    // la semaine suivante : un autre plat, pas encore livré
    clock.t += 8 * 864e5;
    assert.ok(G.specialTick());
    const sp2 = G.specialOf();
    assert.ok(sp2 && !sp2.done && sp2.week !== sp.week);
    assert.notEqual(sp2.items[0].id, x.id);
    assert.equal(G.dishServed(sp2.items[0].id), 0);
});

test('1.27 : la commande spéciale tourne entre les quatre voisins et se rabat sur le moins livré', () => {
    farm(50);
    const owners = new Set();
    for (let w = 0; w < 4; w++) {
        G.specialTick();
        owners.add(G.specialOf().k);
        clock.t += 7 * 864e5;
    }
    assert.equal(owners.size, 4, 'chaque voisin à son tour');
    // tout a été livré une fois : on retombe sur un des moins livrés
    for (const id of Object.keys(RECIPES)) if (G.dishOwner(id) >= 0) state.stats.dishServed[id] = 2;
    const first = Object.keys(RECIPES).find(id => G.dishOwner(id) === 0 && G.questPool().some(i => i.id === id));
    state.stats.dishServed[first] = 1;
    clock.t += 7 * 864e5;
    state.nmarket.special = null;
    G.specialTick();
    const sp = G.specialOf();
    assert.ok(sp);
    assert.ok(G.dishServed(sp.items[0].id) <= 2);
});

test('1.27 : sans ateliers, pas de commande spéciale ; elle arrive dès qu’un plat est possible', () => {
    farm(50, 0, false);
    state.machines = [];
    assert.equal(G.specialTick(), false);
    assert.equal(G.specialOf(), null);
    // les nouvelles machines ouvrent la commande, après la pause de 5 minutes
    for (const m of ['bakery', 'mill']) state.machines.push(G.newMachine(m));
    clock.t += 6 * 60000;
    assert.ok(G.specialTick());
    assert.ok(G.specialOf());
});

test('1.27 : le marché de nuit des voisins reste ouvert au niveau 12 (aucun effet de bord)', () => {
    farm(12);
    assert.equal(NMARKET.lvl, 12);
    assert.ok(G.nmarketOpen());
});
