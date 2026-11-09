// 1.101 : les packagings de la Maison : boîtes dessinées, n'importe quel produit, qualité jusqu'au diamant, noms et recettes de paquets.
import test from 'node:test';
import assert from 'node:assert/strict';
import { memStore } from './helpers.mjs';
import { state, setStore } from '../../src/core/state.js';
import { setView } from '../../src/core/view.js';
import { setClock } from '../../src/core/clock.js';
import * as G from '../../src/systems/index.js';
import { MAISON } from '../../src/data/maison.js';
import { PACKS } from '../../src/data/paquets.js';
import { PACK_SPRITES, packSprite } from '../../src/art/paquets.js';
import { ITEMS } from '../../src/data/items.js';

let T = Date.UTC(2026, 10, 9, 12);
function farm() {
    setClock(() => T);
    setStore(memStore());
    G.loadGame();
    setView({ started: true, tab: 'farm', hidden: false });
    state.tutorial.done = true;
    state.level = 60;
    state.money = 1e10;
    for (const k of ['plank', 'stone', 'beam', 'tools', 'nail', 'paint', 'cloth', 'hempRope']) state.inventory[k] = 1000;
    G.buildCamp();
    G.foundMaison();
    Object.assign(state.inventory, { apple: 50, pear: 50, strawberry: 50, egg: 50, carp: 50, perch: 50, cheese: 50, bread: 50, ruby: 4 });
    // 1.104 : les boîtes se fabriquent à l'emballerie
    for (const p of PACKS) if (p.item) state.inventory[p.item] = 20;
}

test('paquets : dix boîtes, chacune dessinée, avec un nom et un coût en matériaux', () => {
    assert.equal(PACKS.length, 10);
    for (const p of PACKS) {
        assert.ok(PACK_SPRITES.includes(p.id), p.id);
        const s = packSprite(p.id, { bg: '#fff', fg: '#000' });
        assert.ok(s.back.includes('<svg') && s.front.includes('<svg'), p.id);
        for (const k of Object.keys(p.cost)) assert.ok(ITEMS[k], `${p.id} : ${k}`);
    }
    assert.ok(PACKS.some(p => p.fits === '*'));
});

test('paquets : n’importe quel produit qui se vend, et la boîte qui va avec le contenu', () => {
    farm();
    assert.ok(G.canPack('apple') && G.canPack('carp') && G.canPack('cheese'));
    assert.equal(G.canPack('nope'), false);
    assert.equal(G.kindOf('apple'), 'champ'); // 1.104.3 : verger et champ
    assert.equal(G.kindOf('carp'), 'mer');
    assert.equal(G.kindOf('egg'), 'animaux');
    assert.equal(G.autoPack(['apple', 'pear', 'strawberry']), 'cagette'); // palier 1 : la cagette
    assert.equal(G.autoPack(['apple', 'pear', 'egg']), 'carton'); // la cagette ne prend pas les œufs
    assert.equal(G.autoPack(['apple', 'carp', 'cheese']), 'carton'); // trois genres : une boîte qui prend tout
    state.maison.rep = 20; // palier 2
    assert.equal(G.autoPack(['apple', 'pear', 'egg']), 'panier');
    assert.equal(G.autoPack(['carp', 'perch', 'carp']), 'filet');
    assert.equal(G.packFits('filet', ['apple', 'carp', 'carp']), false);
    assert.equal(G.packOpen('ecrin'), false);
    state.maison.rep = 1000;
    assert.equal(G.packOpen('ecrin'), true);
});

test('paquets : assembler prend les produits (plus de matériaux depuis la 1.103.2) et garde le nom du joueur', () => {
    farm();
    const planks = state.inventory.plank;
    const apples = state.inventory.apple;
    assert.equal(G.makeCoffret(['apple', 'pear', 'strawberry'], 0, null, { pack: 'ecrin' }), false); // boîte pas encore ouverte
    assert.equal(G.makeCoffret(['apple', 'carp', 'egg'], 0, null, { pack: 'cagette' }), false); // la cagette ne prend pas le poisson
    assert.ok(G.makeCoffret(['apple', 'pear', 'strawberry'], 0, null, { pack: 'cagette', name: '  Panier gourmand de fruits ' }));
    assert.equal(state.inventory.apple, apples - 1);
    assert.equal(state.inventory.plank, planks); // 1.103.2 : plus de matériaux
    assert.equal(state.inventory.boxCagette, 19); // 1.104 : une cagette de l'emballerie
    T += MAISON.time + 1;
    G.maisonTick();
    const c = state.maison.stock[0];
    assert.equal(c.name, 'Panier gourmand de fruits');
    assert.equal(c.pack, 'cagette');
    assert.ok(c.value > 0);
});

test('paquets : sans boîte fabriquée, pas de cagette ; le carton est toujours là (1.104)', () => {
    farm();
    state.inventory.boxCagette = 0;
    assert.equal(G.makeCoffret(['apple', 'pear', 'strawberry'], 0, null, { pack: 'cagette' }), false);
    assert.ok(G.makeCoffret(['apple', 'pear', 'strawberry'], 0, null, { pack: 'carton' }));
});

test('paquets : la qualité va jusqu’au diamant et vaut de plus en plus', () => {
    farm();
    const ids = ['apple', 'pear', 'strawberry'];
    let last = 0;
    for (let q = 0; q <= 4; q++) {
        const v = G.coffretValue(ids, q, 'cagette');
        assert.ok(v > last, 'q' + q);
        last = v;
    }
    assert.equal(G.bestQ(ids), 0);
    for (const id of ids) state.inventory[id] = 5;
    state.quality = state.quality || {};
    assert.ok(G.canMake(ids, 0, 'cagette'));
});

test('paquets : chaque paquet garde sa recette, qu’on peut renommer, refaire et oublier', () => {
    farm();
    assert.ok(G.makeCoffret(['apple', 'pear', 'strawberry'], 0, null, { pack: 'cagette', name: 'Mon panier' }));
    assert.equal(G.recipes().length, 1);
    const r = G.recipes()[0];
    assert.equal(r.name, 'Mon panier');
    assert.equal(G.canRemake(r), false); // l'atelier est pris
    T += MAISON.time + 1;
    G.maisonTick();
    assert.equal(r.made, 1);
    assert.ok(G.canRemake(r));
    assert.ok(G.remake(r.id));
    assert.equal(G.recipes().length, 1); // la même recette, pas une nouvelle
    assert.ok(G.renameRecipe(r.id, 'Panier des enfants'));
    assert.equal(state.maison.work.name, 'Panier des enfants');
    assert.equal(G.renameRecipe(r.id, '   '), false);
    T += MAISON.time + 1;
    G.maisonTick();
    assert.equal(state.maison.stock[1].name, 'Panier des enfants');
    // vendre compte dans la recette
    const cof = state.maison.stock[0];
    assert.ok(G.sellCoffret(cof.uid, 'neighbors'));
    assert.equal(r.sold, 1);
    assert.ok(G.dropRecipe(r.id));
    assert.equal(G.recipes().length, 0);
});

test('paquets : un vieux coffret de la 1.100 (sans boîte ni recette) se vend toujours', () => {
    farm();
    state.maison.stock.push({ uid: 99, name: 'Coffret Œuf & Carpe', items: ['egg', 'carp', 'cheese'], q: 1, value: 500, made: T });
    assert.ok(G.sellCoffret(99, 'neighbors'));
});
