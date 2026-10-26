// 1.49 : l'enclos de la palmeraie, le dromadaire, le zébu, le mouton barbarin, la noria, les caravanes, la tempête de sable.
import test from 'node:test';
import assert from 'node:assert/strict';
import { clock, memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import * as G from '../../src/systems/index.js';
import { ITEMS } from '../../src/data/items.js';
import { ANIMALS, GROW, NAMES } from '../../src/data/animals.js';
import { OASIS, PEN, CARAVAN, OASIS_BEAST_IDS } from '../../src/data/oasis.js';
import { PAIRS, COMICE_CAT, PASSERS } from '../../src/data/elevage.js';
import { ANIMAL_BASE, featuresOf } from '../../src/data/genetics.js';
import { CHAPTERS, PROJECTS, VILLAGERS } from '../../src/data/village.js';
import { TIPS } from '../../src/data/texts.js';
import { SPR } from '../../src/art/index.js';

const H = 3600 * 1000;
function oasis({ pen = true } = {}) {
    setStore(memStore());
    G.loadGame();
    setView({ started: false, tab: 'farm' });
    state.level = 59;
    state.money = 100_000_000;
    state.gameTimeMinutes = 8 * 60;
    state.projects.oasisWell = { given: {}, done: true };
    if (pen) state.projects.oasisPen = { given: {}, done: true };
    G.ensureOasis();
    state.oasis.water = 100;
    return state.oasis;
}
const beast = type => {
    const a = G.newAnimal(type);
    a.adult = true;
    a.food = 5;
    G.placeAnimal(a);
    state.animals.push(a);
    return a;
};

test('les bêtes de l’oasis ne vivent que dans l’enclos, et seulement une fois l’enclos bâti', () => {
    oasis({ pen: false });
    assert.equal(G.canBuy('animal', 'dromedary'), false);
    state.projects.oasisPen = { given: {}, done: true };
    assert.ok(G.buy('animal', 'dromedary', 1, null));
    const a = state.animals.at(-1);
    assert.equal(a.p, PEN.key);
    assert.equal(G.moveAnimal(state.animals.length - 1, 0), false);
    // une poule ne va jamais dans l'enclos
    assert.ok(G.buy('animal', 'chicken', 1, null));
    assert.notEqual(state.animals.at(-1).p, PEN.key);
    // une vieille sauvegarde : ensurePastures laisse le dromadaire dans l'enclos
    G.ensurePastures();
    assert.equal(a.p, PEN.key);
});

test('l’enclos a 12 places, 20 avec la palissade agrandie', () => {
    oasis();
    for (let k = 0; k < PEN.cap[0]; k++) beast('barbarySheep');
    assert.ok(G.herdFull('zebu'));
    assert.equal(G.herdFull('cow'), false);
    assert.equal(G.buy('animal', 'zebu', 1, null), false);
    state.inventory.plank = 200;
    state.inventory.beam = 200;
    assert.ok(G.enclosUpgrade(null));
    assert.equal(G.enclosCap(), PEN.cap[1]);
    assert.ok(G.buy('animal', 'zebu', 1, null));
});

test('les bêtes boivent à la citerne ; sans eau, elles ne produisent plus', () => {
    const O = oasis();
    const z = beast('zebu');
    assert.equal(G.penDrink(), ANIMALS.zebu.drink);
    const spring = OASIS.spring;
    OASIS.spring = 0;
    O.water = 0;
    G.oasisTick();
    assert.equal(G.oasisBeastMult(z), 0);
    O.water = 50;
    G.oasisTick();
    assert.equal(G.oasisBeastMult(z), 1);
    assert.ok(O.water < 50);
    OASIS.spring = spring;
});

test('à midi, au soleil, moitié moins vite ; à l’ombre d’un palmier ou pour le barbarin, rien ne change', () => {
    oasis();
    const d = beast('dromedary'),
        s = beast('barbarySheep');
    state.gameTimeMinutes = 13 * 60;
    assert.equal(G.oasisBeastMult(d), PEN.heatMult);
    assert.equal(G.oasisBeastMult(s), 1);
    G.slotsOf('oasis')[0].tree = { id: 'date', age: ITEMS.date.time, drops: 0, ground: 0, prog: 0, gq: 0 };
    assert.equal(G.penShadeSlots(), PEN.shadePerPalm);
    assert.equal(G.oasisBeastMult(d), 1);
});

test('la noria : un zébu attelé donne 8 L/h à la source et plus de lait', () => {
    oasis();
    const z = beast('zebu');
    assert.equal(G.toggleNoria(z.uid), false); // pas encore montée
    state.inventory.beam = 100;
    state.inventory.plank = 100;
    state.inventory.tools = 100;
    assert.ok(G.buildNoria(null));
    const base = G.springRate();
    assert.ok(G.toggleNoria(z.uid));
    assert.equal(G.springRate(), base + PEN.noria.lph);
    assert.equal(G.oasisBeastMult(z), 0);
    assert.ok(G.toggleNoria(z.uid));
    assert.equal(G.springRate(), base);
});

test('les naissances marchent aussi dans l’enclos', () => {
    oasis();
    beast('dromedary');
    beast('dromedary');
    assert.ok(G.toggleBirths(PEN.key));
    G.birthsTick();
    clock.t += G.birthHours('dromedary') * H + 1000;
    const [b] = G.birthsTick();
    assert.ok(b && b.type === 'dromedary' && b.p === PEN.key);
});

test('les associations de l’enclos', () => {
    oasis();
    const z = beast('zebu'),
        d = beast('dromedary');
    state.level = 59;
    clock.t += 2000;
    assert.ok(G.assocMult(d) > 1);
    assert.equal(G.assocMult(z), 1);
    for (const id of ['zebuCamel', 'sheepZebu', 'camelSheep'])
        assert.ok(
            PAIRS.some(P => P.id === id),
            id,
        );
});

test('la caravane : trois dromadaires, des charges de 10, retour en 6 heures avec 2,4 fois le grossiste', () => {
    const O = oasis();
    state.projects.caravanserai = { given: {}, done: true };
    state.inventory.cumin = 100;
    assert.ok(G.caravanAdd('cumin', 3));
    assert.equal(G.caravanLoads(), 3);
    beast('dromedary');
    beast('dromedary');
    assert.equal(G.caravanSend(null), false); // deux dromadaires seulement
    beast('dromedary');
    const value = G.caravanValue();
    assert.equal(value, Math.round((30 * G.sellPrice('cumin') * CARAVAN.mult) / 10) * 10);
    assert.ok(G.caravanSend(null));
    assert.equal(state.inventory.cumin, 70);
    assert.equal(G.caravanCamels().length, 0); // partis
    assert.equal(G.caravanClaim(null), false);
    clock.t += CARAVAN.time + 1000;
    const m = state.money;
    const r = G.caravanClaim(null);
    assert.equal(r.value, value);
    assert.ok(state.money >= m + value);
    assert.equal(O.caravan.out, null);
    assert.equal(G.caravanCamels().length, 3);
});

test('la tempête de sable ensable des cases au soleil, jamais à l’ombre ; un appui les dégage', () => {
    const O = oasis();
    for (let k = 0; k < 8; k++) O.plots[k].open = true;
    G.ensureOasis();
    G.slotsOf('oasis')[0].tree = { id: 'date', age: ITEMS.date.time, drops: 0, ground: 0, prog: 0, gq: 0 };
    for (const k of [1, 2, 3, 4, 5, 6, 7]) G.plantOasis(k, 'cumin', null, true);
    O.stormAt = clock.t - 1;
    assert.ok(G.sandstormTick());
    const sand = O.plots.map((p, k) => (p.sand ? k : -1)).filter(k => k >= 0);
    assert.ok(sand.length >= 2);
    for (const k of sand) assert.ok(!G.isShaded(k), String(k));
    const k = sand[0];
    assert.equal(G.cellNeed(k), 0);
    assert.ok(G.clearSand(k, null));
    assert.ok(G.cellNeed(k) > 0);
});

test('le chapitre 22 : trois chantiers, Yasmine, le souk paie 15 % de plus', () => {
    assert.equal(CHAPTERS[21].lvl, 59);
    const mine = Object.values(PROJECTS).filter(p => p.ch === 22);
    assert.equal(mine.length, 3);
    for (const p of mine) assert.ok(SPR.building(p.id, 2).length > 200, p.id);
    assert.ok(VILLAGERS.yasmine && SPR.villager('yasmine').includes('<svg'));
    oasis();
    const m0 = G.caravanMult();
    state.projects.soukStalls = { given: {}, done: true };
    assert.ok(Math.abs(G.caravanMult() / m0 - (1 + CARAVAN.soukBonus)) < 1e-9);
});

// ---------------- le contrôle : chaque bête est branchée partout ----------------
test('contrôle : les trois bêtes ont leurs dessins, gènes, prénoms, Comice, foire, carnet, bulles', () => {
    assert.equal(OASIS_BEAST_IDS.length, 3);
    for (const id of OASIS_BEAST_IDS) {
        const d = ANIMALS[id];
        assert.ok(d && d.oasis && d.reqLvl === 59 && d.drink > 0, id);
        assert.ok(ITEMS[d.prodId] && SPR.item(d.prodId).length > 300, `produit ${id}`);
        if (d.extra) assert.ok(ITEMS[d.extra], `second produit ${id}`);
        assert.ok(SPR.animal(id).length > 500, `dessin ${id}`);
        assert.ok(GROW[id] && NAMES[id].length >= 6 && ANIMAL_BASE[id], `croissance, prénoms, gènes ${id}`);
        assert.ok(COMICE_CAT[id], `Comice ${id}`);
        assert.ok(
            PASSERS.some(p => p.types && p.types.includes(id)),
            `foire ${id}`,
        );
        assert.ok(G.BOOK_TYPES.includes(id), `carnet des robes ${id}`);
        assert.ok(TIPS[id], `bulle ${id}`);
        assert.ok(featuresOf(id).length > 0, `cornes ou toison ${id}`);
    }
    for (const t of ['caravan', 'sandstorm']) assert.ok(TIPS[t], t);
});
