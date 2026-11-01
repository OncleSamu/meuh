// 1.70 : les villageois : goûts, anniversaires, talent de l'ami, duos et histoires.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { VILLAGERS, STORIES, HEART_POINTS } from '../../src/data/village.js';
import { RECIPES } from '../../src/data/machines.js';
import { LOVES, DUO_STORIES } from '../../src/data/friends.js';

function village() {
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = 64;
    G.ensureVillagers();
}
const toHearts = (vid, h) => G.addFriendship(vid, HEART_POINTS[h - 1] - state.villagers[vid].pts);

test('1.70 : 28 histoires, des anniversaires tous différents, un produit adoré et un talent pour chacun', () => {
    village();
    const ids = Object.keys(VILLAGERS);
    assert.equal(ids.length, 28);
    for (const v of ids) {
        assert.ok(STORIES[v] && STORIES[v].steps.length === 3 && STORIES[v].end, v);
        assert.ok(LOVES[v] && G.TALENTS[v], v);
    }
    assert.equal(new Set(ids.map(G.birthdayOf)).size, 28);
    assert.equal(Object.keys(DUO_STORIES).length, 4);
});

test('1.70 : adoré +5, aimé +1 ou +3, bof rien ; on découvre le produit adoré', () => {
    village();
    const vid = 'gaston';
    const love = LOVES[vid];
    state.day = state.day + (G.isBirthday(vid) ? 1 : 0);
    state.inventory[love] = 3;
    const p = state.villagers[vid].pts;
    assert.equal(G.giftKind(vid, love), 'love');
    assert.ok(G.giveGift(vid, love));
    assert.equal(state.villagers[vid].pts - p, 5);
    assert.ok(G.loveFound(vid));
    assert.equal(G.giveGift(vid, love), false, 'un cadeau par jour');
    state.day++;
    if (G.isBirthday(vid)) state.day++;
    const meh = Object.keys(RECIPES).find(id => G.giftKind(vid, id) === 'meh');
    state.inventory[meh] = 1;
    const p2 = state.villagers[vid].pts;
    assert.ok(G.giveGift(vid, meh));
    assert.equal(state.villagers[vid].pts, p2);
    assert.ok(G.triedOf(vid).includes(meh));
});

test('1.70 : le jour de son anniversaire, un cadeau compte triple', () => {
    village();
    const vid = 'lucie';
    while (!G.isBirthday(vid)) state.day++;
    const like = VILLAGERS[vid].likes[0];
    state.inventory[like] = 2;
    const p = state.villagers[vid].pts;
    G.giveGift(vid, like);
    const base = G.giftKind(vid, like) === 'love' ? 5 : like in RECIPES ? 3 : 1;
    assert.equal(state.villagers[vid].pts - p, base * 3);
});

test('1.70 : à 5 cœurs, le talent accélère ses machines et fait mieux vendre ; doublé quand l’histoire est finie', () => {
    village();
    const r = Object.values(RECIPES).find(x => x.machine === 'kitchen');
    const t0 = G.recipeTime(r.id),
        p0 = G.sellPrice(r.id);
    toHearts('gaston', 5);
    assert.equal(G.talentLevel('gaston'), 1);
    assert.ok(G.recipeTime(r.id) < t0);
    assert.ok(G.sellPrice(r.id) >= p0);
    state.stories.gaston = { step: STORIES.gaston.steps.length, given: {} };
    assert.equal(G.talentLevel('gaston'), 2);
    assert.ok(G.talentSpeed('kitchen') > 1.15);
    // les effets à part
    const c0 = G.cureCost();
    toHearts('victor', 5);
    assert.ok(G.cureCost() < c0);
});

test('1.70 : un duo partage les cadeaux et ouvre une histoire à deux', () => {
    village();
    const like = VILLAGERS.agnes.likes[0];
    state.inventory[like] = 1;
    while (G.isBirthday('agnes')) state.day++;
    const p = state.villagers.hugues.pts;
    G.giveGift('agnes', like);
    assert.equal(state.villagers.hugues.pts - p, 1);
    const d = G.duoOf('agnes');
    assert.equal(G.duoOpen(d), false);
    toHearts('agnes', 5);
    toHearts('hugues', 5);
    assert.ok(G.duoOpen(d));
});
