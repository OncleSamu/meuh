// 1.123 : la famille. La cour, les rendez-vous, la demande, la noce, le conjoint et le foyer.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { clock, memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { FAMILY, DATES, FOYER, SUITORS } from '../../src/data/family.js';
import { VILLAGERS } from '../../src/data/village.js';
import { TALENTS } from '../../src/data/friends.js';

const fresh = lvl => {
    setStore(memStore());
    G.loadGame();
    setView({ started: true, tab: 'farm' });
    state.tutorial.done = true;
    state.level = lvl;
    state.money = 1e9;
};
const H = 3600 * 1000;

test('les prétendants sont des villageois adultes, avec un talent', () => {
    for (const v of SUITORS) {
        assert.ok(VILLAGERS[v], v);
        assert.ok(TALENTS[v], v);
    }
    for (const v of ['odette', 'lucie', 'hugues']) assert.ok(!SUITORS.includes(v));
});

test('la cour : il faut le niveau 30 et 3 cœurs, puis les roses montent', () => {
    fresh(29);
    G.ensureFamily();
    G.ensureVillagers();
    state.villagers.jules.hearts = 3;
    assert.equal(G.canCourt('jules'), false, 'niveau 29');
    state.level = 30;
    assert.ok(G.canCourt('jules'));
    state.villagers.gaspard = { ...(state.villagers.gaspard || {}), hearts: 1 };
    assert.equal(G.court('gaspard'), false, 'pas assez d’amitié');
    assert.ok(G.court('jules'));
    // la promenade : gratuite ; puis il faut attendre trois heures
    assert.ok(G.dateReady());
    assert.ok(G.goDate('walk'));
    assert.equal(G.lovePts('jules'), DATES[0].pts);
    assert.equal(G.goDate('walk'), false, 'trop tôt');
    clock.t += FAMILY.dateWait;
    // le bal demande deux roses
    assert.equal(G.goDate('ball'), false);
    // un cadeau aimé compte aussi
    const like = VILLAGERS.jules.likes.find(id => id !== 'horseshoe');
    state.inventory[like] = 5;
    state.villagers.jules.giftDay = 0;
    assert.ok(G.giveGift('jules', like));
    assert.equal(G.lovePts('jules'), DATES[0].pts + FAMILY.gift.like);
    // le pique-nique prend trois produits aimés
    const before = state.inventory[like];
    assert.ok(G.goDate('picnic'));
    assert.equal(state.inventory[like], before - 3);
});

test('la demande, la noce et le conjoint', () => {
    fresh(40);
    G.ensureVillagers();
    state.villagers.margaux.hearts = 5;
    assert.ok(G.court('margaux'));
    state.family.pts.margaux = 100;
    assert.equal(G.rosesOf('margaux'), 5);
    assert.equal(G.canPropose(), false, 'pas de bague');
    state.inventory[FAMILY.ring] = 1;
    assert.ok(G.propose());
    assert.equal(state.inventory[FAMILY.ring], 0);
    assert.equal(G.court('jules'), false, 'fiancés : plus de cour');
    // la noce : la chambre d'abord
    for (const [k, n] of Object.entries(G.weddingCost())) if (k !== 'coins') state.inventory[k] = n;
    assert.equal(G.canWed(), false);
    for (const [k, n] of Object.entries(FOYER[0].lv[0].cost)) if (k !== 'coins') state.inventory[k] = n;
    assert.ok(G.buildRoom('bedroom'));
    assert.equal(G.roomLvl('bedroom'), 1);
    assert.ok(G.canWed());
    const talent0 = G.talentLevel('margaux');
    assert.ok(G.marry());
    assert.equal(G.spouseOf(), 'margaux');
    assert.equal(G.talentLevel('margaux'), talent0 + 1, 'le talent monte d’un cran');
    // le panier, tout de suite puis toutes les douze heures
    assert.ok(G.basketReady());
    const got = G.takeBasket();
    assert.ok(Object.keys(got).length >= 1);
    assert.equal(G.basketReady(), false);
    clock.t += FAMILY.basket.every;
    assert.ok(G.basketReady());
    // la tendresse baisse : sous 50 %, plus de cran
    clock.t += 5 * 24 * H;
    assert.ok(G.affection() < FAMILY.aff.keep);
    assert.equal(G.talentLevel('margaux'), talent0);
    assert.ok(G.sweetWord());
    assert.equal(G.sweetWord(), false, 'un mot doux toutes les quatre heures');
    // le grand salon garnit les paniers
    const q0 = G.basketQty();
    for (const [k, n] of Object.entries(FOYER[1].lv[0].cost)) if (k !== 'coins') state.inventory[k] = n;
    assert.ok(G.buildRoom('salon'));
    assert.ok(G.basketQty() > q0);
});

test('1.123 : l’onglet Famille et ses actions existent', () => {
    const v = readFileSync(new URL('../../src/ui/views/family.js', import.meta.url), 'utf8');
    for (const a of ['fmCourt', 'fmStop', 'fmDate', 'fmPropose', 'fmWed', 'fmWord', 'fmBasket', 'fmRoom']) assert.match(v, new RegExp(`\\n {8}${a}: `), a);
    assert.match(readFileSync(new URL('../../src/ui/app.js', import.meta.url), 'utf8'), /\['family', 'Famille'/);
});
