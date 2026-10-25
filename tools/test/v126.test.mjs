import test from 'node:test';
import assert from 'node:assert/strict';
import { state, writeSave } from '../../src/core/state.js';
import * as G from '../../src/systems/index.js';
import { NMARKET } from '../../src/data/commerce.js';
import { ITEMS } from '../../src/data/items.js';
import { ANIMALS } from '../../src/data/animals.js';
import { RECIPES } from '../../src/data/machines.js';
import { clock } from './helpers.mjs';
const setNow = t => t != null && (clock.t = t);

const farm = (lvl = 30, hearts = 0) => {
    G.loadGame();
    state.level = lvl;
    state.money = 1e8;
    state.barn.lvl = 30;
    G.ensureNeighbors();
    Object.values(state.neighbors).forEach(n => (n.hearts = hearts));
    state.nmarket = null;
    G.nmarketTick();
};

test('1.26 : le marché ouvre au niveau 12', () => {
    farm(11);
    assert.equal(G.nmarketOpen(), false);
    assert.equal(state.nmarket, null);
    farm(12);
    assert.equal(state.nmarket.stalls.length, 4);
});

test('1.26 : chaque voisine vend sa spécialité, rien de plus tard que le niveau', () => {
    for (const lvl of [12, 25, 50]) {
        farm(lvl);
        const all = G.askable();
        assert.equal(new Set(all).size, all.length, 'un produit, une seule voisine');
        for (const id of all) {
            assert.ok(ITEMS[id], id);
            const r = RECIPES[id];
            if (r) assert.ok(!r.lvl || r.lvl <= lvl, `${id} recette niveau ${r.lvl}`);
            if (ITEMS[id].lvl) assert.ok(ITEMS[id].lvl <= lvl, `${id} niveau ${ITEMS[id].lvl}`);
        }
        // Yvette : poissons et viandes, pas de plats ni de poisson rouge
        const yv = G.specialtyOf(2);
        assert.ok(!yv.includes('goldfish'));
        for (const id of yv) assert.ok(!RECIPES[id] || Object.values(ANIMALS).some(a => a.extra === id), id);
        assert.ok(!G.specialtyOf(1).includes('horsehair'));
    }
});

test('1.26 : offres, quantités et prix selon les cœurs', () => {
    for (let h = 0; h <= 5; h++) {
        farm(40, h);
        for (const st of state.nmarket.stalls) {
            assert.ok(st.offers.length <= NMARKET.offers[h]);
            for (const o of st.offers) {
                const per = Math.max(1, ITEMS[o.id].sell);
                assert.ok(o.price >= per * o.qty * 1.5, `${o.id} trop bon marché`);
                assert.equal(o.gold, h >= 5 && st.offers.indexOf(o) === 0);
            }
        }
    }
});

test('1.26 : acheter une offre, la fidélité monte jusqu’au cœur', () => {
    farm(30);
    const st = state.nmarket.stalls[0];
    const o = st.offers[0];
    const before = state.inventory[o.id] || 0;
    const money = state.money;
    assert.ok(G.buyOffer(0, 0));
    assert.equal(state.inventory[o.id], before + o.qty);
    assert.equal(state.money, money - o.price);
    assert.equal(G.buyOffer(0, 0), false, 'déjà vendu');
    state.nmarket.spent[0] = NMARKET.loyalty(30) * 3;
    const o2 = st.offers[1];
    G.buyOffer(0, 1);
    assert.ok(state.neighbors[0].hearts >= 1, 'un cœur de fidélité');
    assert.ok(o2.sold);
});

test('1.26 : grange pleine, pas d’achat', () => {
    farm(30);
    state.barn.lvl = 0;
    state.inventory.wheat = G.barnCap();
    const o = state.nmarket.stalls[0].offers[0];
    if (G.inBarn(o.id)) assert.equal(G.buyOffer(0, 0), false);
});

test('1.26 : les étals se renouvellent toutes les 4 heures', () => {
    farm(30);
    const at = state.nmarket.at;
    setNow(at + NMARKET.every - 1000);
    assert.equal(G.nmarketTick(), false);
    setNow(at + NMARKET.every + 1000);
    assert.equal(G.nmarketTick(), true);
    assert.ok(state.nmarket.stalls[0].offers.every(o => !o.sold));
    setNow(null);
});

test('1.26 : demande d’achat — prix, délai, livraison, annulation', () => {
    farm(30);
    assert.equal(G.askDelay(0, 1.2), 180);
    assert.equal(G.askDelay(0, 2.5), 15);
    assert.ok(G.askDelay(0, 2) < G.askDelay(0, 1.5));
    state.neighbors[1].hearts = 4;
    assert.equal(G.askDelay(1, 1.2), Math.round(180 * 0.8));
    const id = G.specialtyOf(1)[0];
    assert.equal(G.askPrice(id, 10, 2), 2 * G.askPrice(id, 10, 1));
    const t0 = clock.t;
    setNow(t0);
    assert.ok(G.placeAsk(id, 999, 2.5));
    const a = state.nmarket.asks[0];
    assert.equal(a.qty, G.askMaxQty(1), 'quantité plafonnée');
    assert.equal(a.k, 1);
    assert.equal(G.collectAsk(0), false, 'pas encore livré');
    setNow(t0 + 16 * 60000);
    G.nmarketTick();
    assert.equal(G.asksReady(), 1);
    const inv = state.inventory[id] || 0,
        money = state.money;
    assert.ok(G.collectAsk(0));
    assert.equal(state.inventory[id], inv + a.qty);
    assert.equal(state.money, money - a.price);
    // annulation : rien n'est payé
    assert.ok(G.placeAsk(id, 5, 1.2));
    const m2 = state.money;
    assert.ok(G.cancelAsk(0));
    assert.equal(state.money, m2);
    assert.equal(state.nmarket.asks.length, 0);
    // places limitées
    for (let n = 0; n < G.askSlots(); n++) assert.ok(G.placeAsk(id, 1, 1.2));
    assert.equal(G.placeAsk(id, 1, 1.2), false);
    setNow(null);
});

test('1.26 : la sauvegarde garde le marché', () => {
    farm(30);
    G.placeAsk(G.specialtyOf(0)[0], 3, 1.5);
    writeSave();
    state.nmarket = null;
    G.loadGame();
    assert.equal(state.nmarket.asks.length, 1);
});

// ---------------- 1.26.3 : les demandes des voisins sont des plats de leur spécialité ----------------
import { RECIPES as RCP, MACHINES } from '../../src/data/machines.js';
import { PROJECTS } from '../../src/data/village.js';
import { VILLAGERS } from '../../src/data/village.js';

const fullFarm = () => {
    farm(50);
    for (const m of Object.keys(MACHINES)) if (!state.machines.some(x => x.type === m)) state.machines.push(G.newMachine(m));
    for (const p of Object.values(PROJECTS)) state.projects[p.id] = { done: true };
    for (const v of Object.keys(VILLAGERS)) state.villagers[v] = { ...(state.villagers[v] || {}), hearts: 10 };
    state.barn.lvl = 30;
};

test('1.26.3 : chaque plat a un voisin (sauf fêtes, outils, bijoux, selles…)', () => {
    const none = Object.keys(RCP).filter(id => G.dishOwner(id) < 0);
    for (const id of none) {
        const r = RCP[id];
        assert.ok(
            r.fete || r.holiday || ['forge', 'sawmill', 'jewelry', 'saddlery', 'pottery', 'counter'].includes(r.machine),
            `${id} (${r.machine}) sans voisin`,
        );
    }
    const by = [0, 1, 2, 3].map(k => Object.keys(RCP).filter(id => G.dishOwner(id) === k));
    for (const l of by) assert.ok(l.length >= 40, 'chaque voisin a de quoi demander');
});

test('1.26.3 : les plats d’Yvette contiennent du poisson ou de la viande', () => {
    const swallow = new Set(['sardine', 'mackerel', 'shrimp', 'seabass', 'lobster']);
    const meats = new Set(
        Object.values(ANIMALS)
            .map(a => a.extra)
            .filter(Boolean),
    );
    const deep = (id, d = 0) => (RCP[id] && d < 6 ? Object.keys(RCP[id].ing).flatMap(g => deep(g, d + 1)) : [id]);
    for (const id of Object.keys(RCP).filter(i => G.dishOwner(i) === 2))
        assert.ok(
            deep(id).some(g => ITEMS[g].type === 'fish' || swallow.has(g) || ITEMS[g].sea || meats.has(g)),
            id,
        );
});

test('1.26.3 : à haut niveau, une voisine demande un de ses plats, jamais un plat de fête', () => {
    fullFarm();
    const pool = new Set(G.questPool().map(i => i.id));
    for (let k = 0; k < 4; k++) {
        let last;
        const seen = new Set();
        for (let n = 0; n < 60; n++) {
            const it = G.neighborWant(k, last);
            assert.ok(pool.has(it.id));
            assert.equal(G.dishOwner(it.id), k, `${it.id} pour ${k}`);
            assert.notEqual(it.id, last, 'jamais deux fois de suite le même');
            seen.add((last = it.id));
        }
        assert.ok(seen.size >= 12, `voisin ${k} : ${seen.size} plats différents en 60 demandes`);
    }
});

test('1.26.3 : les demandes de la ferme (tick) donnent un plat du voisin', () => {
    fullFarm();
    state.neighbors = {};
    G.ensureNeighbors();
    G.neighborTick();
    const reqs = [0, 1, 2, 3].map(k => state.neighbors[k].req);
    for (const [k, r] of reqs.entries()) {
        if (!r) continue;
        assert.equal(G.dishOwner(r.items[0].id), k);
        assert.ok(r.coins > 0 && r.items[0].qty >= 1);
    }
});

test('1.26.3 : au niveau 6, sans atelier de cuisine, on demande ce que la ferme produit', () => {
    farm(6);
    state.neighbors = {};
    G.ensureNeighbors();
    for (let k = 0; k < 4; k++) {
        const it = G.neighborWant(k);
        assert.ok(it, `voisin ${k}`);
    }
    // Hortense (légumes et fruits) : une culture ou un plat de légumes
    const h = G.neighborWant(0);
    assert.ok(h.type === 'crop' || h.type === 'tree' || G.dishOwner(h.id) === 0);
});
