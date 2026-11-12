// 1.114 : les spécialités de ferme. Six métiers, dix rangs, des leçons, des bonus qui dorment quand on change.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import { setClock } from '../../src/core/clock.js';
import * as G from '../../src/systems/index.js';
import { ITEMS } from '../../src/data/items.js';
import { METIERS, METIER_IDS, METIER_RANKS, METIER_CHANGE } from '../../src/data/metiers.js';

let T = Date.UTC(2026, 10, 12, 12);
function fresh(lvl = 30) {
    T = Date.UTC(2026, 10, 12, 12);
    setClock(() => T);
    setStore(memStore());
    G.loadGame();
    setView({ started: true, tab: 'farm', hidden: false });
    state.tutorial.done = true;
    state.level = lvl;
    state.money = 1e9;
}
// réussit les leçons du rang en cours en faisant tourner les compteurs
const passRank = () => {
    for (const l of G.metierLessons()) {
        const left = l.n - G.lessonDone(l);
        if (l.key[0] === 'c') state.metier.c[l.key.slice(2)] = (state.metier.c[l.key.slice(2)] || 0) + left;
        else state.stats[l.key.slice(2)] = (state.stats[l.key.slice(2)] || 0) + left;
    }
    return G.metierRankUp();
};

test('métiers : six métiers, dix rangs de deux leçons, des quantités qui montent', () => {
    assert.equal(METIER_IDS.length, 6);
    for (const id of METIER_IDS) {
        const m = METIERS[id];
        assert.equal(m.lessons.length, METIER_RANKS, id);
        for (const r of m.lessons) {
            assert.equal(r.length, 2, id);
            for (const l of r) assert.ok(l.n > 0 && l.text && /^[cs]:/.test(l.key), `${id} ${l.key}`);
        }
        // une même leçon demande toujours plus d'un rang à l'autre
        const last = {};
        m.lessons.forEach((r, k) =>
            r.forEach(l => {
                if (last[l.key] !== undefined) assert.ok(l.n > last[l.key], `${id} rang ${k + 1} : ${l.key}`);
                last[l.key] = l.n;
            }),
        );
    }
});

test('métiers : chaque leçon de statistique existe dans le jeu', () => {
    const src = ['farm', 'island', 'animals', 'births', 'stud', 'genetics', 'haras', 'comice', 'fair', 'orchard', 'orchardplus', 'orchardlife', 'farmlife', 'apiary', 'workshop', 'orders', 'armand', 'maison', 'cave', 'brewery', 'counter', 'fishing', 'port', 'incidents', 'oasis', 'nord']
        .map(f => readFileSync(new URL(`../../src/systems/${f}.js`, import.meta.url), 'utf8'))
        .join('\n');
    for (const id of METIER_IDS)
        for (const r of METIERS[id].lessons)
            for (const l of r) if (l.key[0] === 's') assert.ok(new RegExp(`stats\\.${l.key.slice(2)}\\b`).test(src), `${id} : ${l.key}`);
});

test('métiers : chaque produit à son métier', () => {
    assert.equal(G.metierOf('wheat'), 'maraicher');
    assert.equal(G.metierOf('milk'), 'eleveur');
    assert.equal(G.metierOf('apple'), 'arbo');
    assert.equal(G.metierOf('carp'), 'pecheur');
    assert.equal(G.metierOf('bread'), 'cuisinier');
    assert.equal(G.metierOf('tableWine'), 'vigneron');
    assert.equal(G.metierOf('juice'), 'vigneron');
    assert.equal(G.metierOf('plank'), null);
});

test('métiers : on choisit, on apprend, le rang fait mieux payer les produits du métier seulement', () => {
    fresh();
    assert.equal(G.metierId(), null);
    const crop = Object.keys(ITEMS).filter(k => ITEMS[k].type === 'crop').sort((a, b) => ITEMS[b].sell - ITEMS[a].sell)[0];
    const p0 = G.sellPrice(crop),
        b0 = G.sellPrice('bread');
    assert.ok(G.chooseMetier('maraicher'));
    assert.equal(G.metierRank(), 0);
    assert.equal(G.metierCanRank(), false);
    // les leçons comptent à partir du rang : ce qui précède ne compte pas
    G.metierCount('wheat', 10);
    assert.equal(G.lessonDone(G.metierLessons()[0]), 10);
    assert.ok(passRank());
    assert.equal(G.metierRank(), 1);
    assert.ok(G.sellPrice(crop) > p0, `${crop} : ${G.sellPrice(crop)} contre ${p0}`);
    assert.equal(G.sellPrice('bread'), b0);
    for (let k = 1; k < METIER_RANKS; k++) assert.ok(passRank(), `rang ${k + 1}`);
    assert.equal(G.metierRank(), METIER_RANKS);
    assert.equal(G.metierRankUp(), false);
    assert.ok(Math.abs(G.metierPriceRate() - (METIERS.maraicher.rate * 10 + 0.1)) < 1e-9);
    assert.match(G.metierTitle(), /Maître/);
});

test('métiers : changer garde les rangs et fait dormir les bonus ; premier changement gratuit, puis payant et sept jours d’attente', () => {
    fresh();
    G.chooseMetier('pecheur');
    passRank();
    passRank();
    // une leçon du rang 3 à moitié faite
    const l = G.metierLessons()[0];
    state.metier.c.fish += Math.floor(l.n / 2);
    const half = G.lessonDone(l);
    assert.equal(G.metierChangeCost(), 0);
    const m = state.money;
    assert.ok(G.chooseMetier('cuisinier'));
    assert.equal(state.money, m);
    assert.equal(G.metierRankOf('pecheur'), 2);
    assert.equal(G.metierPriceRate('pecheur'), 0);
    assert.equal(G.metierPrice('carp'), 1);
    // le deuxième : payant, et pas avant sept jours
    assert.ok(G.metierChangeCost() > 0);
    assert.equal(G.chooseMetier('pecheur'), false);
    T += METIER_CHANGE.wait + 1;
    const cost = G.metierChangeCost();
    const m2 = state.money;
    assert.ok(G.chooseMetier('pecheur'));
    assert.equal(m2 - state.money, cost);
    // le pêcheur reprend où il en était, rang et leçon à moitié
    assert.equal(G.metierRank(), 2);
    assert.equal(G.lessonDone(G.metierLessons()[0]), half);
    assert.ok(G.metierPrice('carp') > 1);
});

test('métiers : les commandes et les transports paient plus aux rangs 3 et 6', () => {
    fresh();
    G.chooseMetier('maraicher');
    assert.equal(G.metierOrderPay(['wheat']), 1);
    passRank();
    passRank();
    passRank();
    assert.equal(G.metierOrderPay(['wheat', 'bread']), 1.1);
    assert.equal(G.metierOrderPay(['bread']), 1);
    assert.equal(G.metierTransportPay('wheat'), 1);
    passRank();
    passRank();
    passRank();
    assert.equal(G.metierTransportPay('wheat'), 1.15);
    assert.equal(G.metierTransportPay('bread'), 1);
});

test('métiers : le vigneron fait mieux payer la cave et les bières', () => {
    fresh();
    assert.equal(G.metierCellar(), 1);
    G.chooseMetier('vigneron');
    passRank();
    assert.ok(G.metierCellar() > 1);
    G.chooseMetier('pecheur');
    assert.equal(G.metierCellar(), 1);
});

test('métiers : les compteurs tournent avec la vraie production', () => {
    fresh();
    G.chooseMetier('maraicher');
    const before = state.metier.c.crop || 0;
    G.addMastery('wheat', 5);
    assert.equal(state.metier.c.crop, before + 5);
    assert.ok(ITEMS.wheat);
});

test('métiers : une ancienne sauvegarde sans métier se charge, et les écrans ont leurs actions', () => {
    fresh();
    delete state.metier;
    assert.equal(G.metierId(), null);
    assert.equal(G.metierPrice('wheat'), 1);
    assert.equal(G.metierRank(), 0);
    const src = readFileSync(new URL('../../src/ui/sheets/metier.js', import.meta.url), 'utf8');
    for (const act of ['metierOpen', 'metierOther', 'metierBack', 'metierRankUp', 'metierPick', 'meMetier']) assert.ok(new RegExp(`\\n {8}${act}: `).test(src), act);
});

test('1.115 : le métier se fait demander plus souvent par le village et le train', () => {
    fresh(40);
    const pool = G.questPool();
    const count = () => {
        let n = 0;
        for (let k = 0; k < 600; k++) n += G.pickItems(1).filter(i => G.metierOf(i.id) === 'pecheur').length;
        return n / 600;
    };
    state.inventory.carp = 1;
    if (!pool.some(i => G.metierOf(i.id) === 'pecheur')) return; // rien à pêcher à ce niveau sur cette ferme d'essai
    const before = count();
    G.chooseMetier('pecheur');
    assert.ok(G.metierDemand() >= 0.15);
    const after = count();
    assert.ok(after > before + 0.08, `${before} puis ${after}`);
});

test('1.115 : le client attitré (rang 4) passe une commande par jour, payée 1,5 fois', () => {
    fresh(40);
    G.chooseMetier('maraicher');
    for (let k = 0; k < 3; k++) passRank();
    assert.equal(G.clientOpen(), false);
    assert.equal(G.metierClient(), null);
    passRank();
    assert.ok(G.clientOpen());
    const c = G.metierClient();
    assert.ok(c && c.items.length >= 1);
    assert.ok(c.items.every(x => G.metierOf(x.id) === 'maraicher'));
    assert.equal(G.metierClient(), c, 'la même toute la journée');
    for (const x of c.items) state.inventory[x.id] = x.qty;
    const m = state.money;
    assert.ok(G.deliverClient());
    assert.equal(state.money - m, c.gold);
    assert.equal(G.deliverClient(), false);
    assert.ok(G.clientDone());
    T += 24 * 3600000;
    const c2 = G.metierClient();
    assert.ok(c2 && !c2.done);
});

test('1.115 : le produit signature (rang 5) se vend plus cher, se change une fois par semaine', () => {
    fresh(40);
    G.chooseMetier('maraicher');
    const crop = Object.keys(ITEMS).filter(k => ITEMS[k].type === 'crop').sort((a, b) => ITEMS[b].sell - ITEMS[a].sell)[0];
    for (let k = 0; k < 4; k++) passRank();
    assert.equal(G.setSignature(crop), false, 'pas avant le rang 5');
    passRank();
    const p0 = G.sellPrice(crop);
    assert.equal(G.setSignature('bread'), false, 'pas un produit d’un autre métier');
    assert.ok(G.setSignature(crop));
    assert.equal(G.signature(), crop);
    assert.ok(G.sellPrice(crop) > p0);
    assert.equal(G.signatureWait(), 0, 'le premier choix ne fait pas attendre');
    assert.ok(G.setSignature('wheat'));
    assert.ok(G.signatureWait() > 0);
    assert.equal(G.setSignature('carrot'), false);
    T += 7 * 24 * 3600000 + 1;
    assert.ok(G.setSignature('carrot'));
    // le client demande le produit signature
    state.metier.client = null;
    const c = G.metierClient();
    if (G.questPool().some(i => i.id === 'carrot')) assert.ok(c.items.some(x => x.id === 'carrot'));
});

test('1.116 : les boissons du comptoir comptent pour le vigneron', async () => {
    const { RECIPES } = await import('../../src/data/machines.js');
    const drinks = Object.values(RECIPES).filter(r => r.machine === 'counter');
    assert.ok(drinks.length > 20);
    for (const r of drinks) assert.equal(G.metierOf(r.id), 'vigneron', r.id);
});

test('1.117 : le carnet de la brasserie et le meilleur accord avec le stock', () => {
    fresh(60);
    state.projects.abbey = { done: true };
    G.ensureBrew();
    const B = state.brew;
    B.beers.b1 = { id: 'b1', name: 'Blonde du verger', malt: 'maltBlond', hop: 1, ings: [['apple', 1]], stars: 2, value: 100 };
    assert.equal(G.isFav('b1'), false);
    assert.ok(G.toggleFav('b1'));
    assert.equal(G.isFav('b1'), true);
    assert.equal(G.favBeers().length, 1);
    assert.equal(G.toggleFav('nope'), false);
    G.toggleFav('b1');
    assert.equal(G.favBeers().length, 0);
    // aucun ingrédient en stock : pas d'accord (le malt et le houblon, eux, sont là)
    for (const k of G.BREWABLE) state.inventory[k] = 0;
    for (const k of Object.keys(state.inventory)) if (/^malt/.test(k)) state.inventory[k] = 500;
    state.inventory.hop = 500;
    state.inventory.maltBlond = 500;
    assert.equal(G.bestAccord(), null);
    state.inventory.apple = 50;
    state.inventory.pear = 50;
    const b = G.bestAccord();
    assert.ok(b && b.ings.length >= 1);
    assert.ok(b.ings.every(([id]) => ['apple', 'pear'].includes(id)));
    assert.ok(G.applyBestAccord());
    assert.deepEqual(B.draft.ings, b.ings);
});

test('1.117 : l’état de la cave a ses actions', () => {
    const src = readFileSync(new URL('../../src/ui/views/cave.js', import.meta.url), 'utf8');
    assert.ok(/\n {8}caveGo: /.test(src));
    const brew = readFileSync(new URL('../../src/ui/views/brewery.js', import.meta.url), 'utf8');
    for (const act of ['favBeer', 'brewBest', 'rebrew']) assert.ok(new RegExp(`\\n {8}${act}: `).test(brew), act);
});
