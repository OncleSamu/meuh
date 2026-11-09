// 1.102 : un camping vivant. Les métiers des résidents, les paniers, les habitués, les campeurs remarquables, l'événement du jour.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import { setClock } from '../../src/core/clock.js';
import * as G from '../../src/systems/index.js';
import { ITEMS } from '../../src/data/items.js';
import { JOBS, JOB_FX, RESIDENTS, BASKET_EVERY } from '../../src/data/campers.js';
import { STARS, CAMP_EVENTS, CAMPING, EVENT_BONUS } from '../../src/data/camping.js';

let T = Date.UTC(2026, 10, 9, 12);
function farm() {
    T = Date.UTC(2026, 10, 9, 12);
    setClock(() => T);
    setStore(memStore());
    G.loadGame();
    setView({ started: true, tab: 'farm', hidden: false });
    state.tutorial.done = true;
    state.level = 60;
    state.money = 1e10;
    for (const k of ['plank', 'stone', 'beam', 'tools']) state.inventory[k] = 1000;
    G.buildCamp();
    state.camping.res = [];
    state.camping.asks = [];
}
const resident = (job, fr = 0, profile = 'gourmet') => {
    state.camping.asks.push({ look: 'a', name: `R${state.camping.res.length}`, from: 'de Bretagne', profile, woman: false, job });
    G.resAccept(state.camping.asks.length - 1);
    const r = G.campRes()[G.campRes().length - 1];
    r.fr = fr;
    return r;
};

test('métiers : chaque métier des campeurs a un effet', () => {
    for (const l of Object.values(JOBS)) for (const [m] of l) assert.ok(JOB_FX[m], m);
});

test('métiers : le métier accordé (boulangère) retrouve son effet', () => {
    farm();
    const r = resident('boulangère');
    assert.equal(G.jobKey(r), 'boulanger');
    assert.equal(G.jobFx(r).basket, 'bread');
});

test('métiers : le bonus grandit avec les cœurs, rien à zéro cœur', () => {
    farm();
    const r = resident('peintre');
    const id = Object.keys(ITEMS).find(k => ITEMS[k].type === 'crop' && ITEMS[k].sell);
    const ev = G.eventBoosts(id) ? EVENT_BONUS : 1;
    const base = Math.round(ITEMS[id].sell * CAMPING.pay * ev);
    assert.equal(G.priceOf(id), base);
    r.fr = RESIDENTS.hearts[2]; // 3 cœurs
    assert.equal(G.resBonus('pay'), 0.06);
    assert.equal(G.priceOf(id), Math.round(ITEMS[id].sell * CAMPING.pay * 1.06 * ev));
});

test('métiers : guide et aubergiste raccourcissent l’attente et allongent le séjour', () => {
    farm();
    const g0 = G.campGap()[0];
    resident('guide de randonnée', RESIDENTS.hearts[4]);
    assert.ok(Math.abs(G.campGap()[0] - g0 * 0.85) < 1);
    resident('aubergiste', RESIDENTS.hearts[1]);
    assert.equal(G.resBonus('stay'), 0.1);
});

test('panier : un boulanger à 2 cœurs dépose 2 produits, une fois par jour', () => {
    farm();
    const r = resident('boulanger', RESIDENTS.hearts[1]);
    assert.equal(G.resBasketReady(r), true);
    const before = Object.values(state.inventory).reduce((a, n) => a + n, 0);
    const got = G.resBasket(0);
    assert.ok(got);
    assert.equal(Object.values(got).reduce((a, n) => a + n, 0), 2);
    assert.equal(Object.values(state.inventory).reduce((a, n) => a + n, 0), before + 2);
    assert.equal(G.resBasketReady(r), false);
    assert.equal(G.resBasket(0), null);
    T += BASKET_EVERY;
    assert.equal(G.resBasketReady(r), true);
});

test('panier : rien sans cœur, rien pour un métier sans panier', () => {
    farm();
    const a = resident('fromager', 0);
    const b = resident('peintre', 100);
    assert.equal(G.resBasketReady(a), false);
    assert.equal(G.resBasketReady(b), false);
});

test('habitués : un campeur reparti ravi revient, son pourboire grandit', () => {
    farm();
    state.camping.guests = [];
    state.camping.past = [{ name: 'Hugo', look: 'h1', from: 'de Savoie', profile: 'hiker', woman: false, mood: 2 }];
    state.camping.visits = { Hugo: 2 };
    const g = G.newGuest(T, 42, { regular: 'Hugo' });
    assert.equal(g.name, 'Hugo');
    assert.equal(g.visits, 3);
    assert.equal(state.camping.past.length, 0);
    assert.match(G.guestTitle(g), /3e séjour/);
});

test('remarquables : produits d’argent au moins, payés ×1,5', () => {
    farm();
    state.camping.guests = [];
    const g = G.newGuest(T, 7, { star: 0 });
    assert.equal(g.star, 0);
    assert.equal(g.profile, STARS.who[0].profile);
    assert.ok(g.wants.every(w => w.q === STARS.q));
    const w = g.wants[0];
    assert.equal(G.priceOf(w.item, g), Math.round(G.priceOf(w.item) * STARS.pay) || G.priceOf(w.item, g));
    // un produit de qualité normale ne suffit pas
    state.inventory[w.item] = 5;
    state.quality[w.item] = { s: 0, g: 0, p: 0, d: 0 };
    assert.equal(G.canSell(g, 0), false);
    state.quality[w.item] = { s: 1, g: 0, p: 0, d: 0 };
    assert.equal(G.canSell(g, 0), true);
    assert.equal(G.sellTo(0, 0), true);
});

test('remarquables : jamais deux à la fois', () => {
    farm();
    state.camping.guests = [];
    G.newGuest(T, 7, { star: 0 });
    for (let s = 0; s < 40; s++) {
        const g = G.newGuest(T, 100 + s);
        assert.equal(g.star, undefined);
        state.camping.guests.pop();
    }
});

test('événement du jour : un par jour, il change le lendemain', () => {
    farm();
    const a = G.campEvent();
    assert.ok(CAMP_EVENTS.includes(a));
    T += 86400000;
    assert.notEqual(G.campEvent().id, a.id);
});

test('campeurs : une petite phrase à l’arrivée', () => {
    farm();
    const g = G.newGuest(T, 11);
    assert.ok(g.say && g.say.length > 5);
});
