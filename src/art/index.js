// API des dessins : chaque fonction renvoie un <svg> prêt à insérer.
import { featuresOf } from '../data/genetics.js';
import { ITEMS } from '../data/items.js';
import { items, animals, machines, ui, people, svg } from './kit.js';
import { tree, sprout, youngPlant, readyPlant } from './plants.js';
import { building, farmhouseArt } from './buildings.js';
import { truck, loco, wagon } from './vehicles.js';
import './items.js';
import './animals.js';
import './people.js';
import './machines.js';
import './icons.js';
import './glyphs.js';
import './island.js';
import './station.js';
import './defis.js';
import './v12.js';
// les dessins refaits (1.2.1 et suivantes) passent en dernier : ils remplacent les anciens
import './items2.js';
import './buildings2.js';
import './plants2.js';
import { balloon2 } from './misc2.js';
import './v131.js';
import './v132.js';
import './v133.js';
import './v15.js';
import './abbey.js';
import './v16.js';
import './v18.js';
import './v18redraw.js';

export const SPR = {
    farmhouse(l, roof) {
        return svg(farmhouseArt(Math.max(0, Math.min(5, l)), roof), '0 0 64 64', 'farmhouse');
    },
    plant(id, stage) {
        const d = ITEMS[id];
        const inner = d.type === 'tree' ? tree(id, stage) : stage === 0 ? sprout() : stage === 1 ? youngPlant(id) : readyPlant(id);
        return svg(inner, '0 0 64 64', 'plant');
    },
    item(id) {
        return items[id] ? svg(items[id]()) : ui.star ? svg(ui.star()) : '';
    },
    // « cow~201 » : la vache avec ses traits de gènes (cornes, oreilles, toison dans l'ordre de featuresOf)
    animal(key) {
        const [id, code] = String(key).split('~');
        const o = {};
        if (code) featuresOf(id).forEach((k, j) => (o[k] = +code[j] || 0));
        return svg(animals[id](o), '0 0 80 80', 'animal-spr');
    },
    machine(id) {
        return svg(machines[id]());
    },
    ui(id) {
        return svg(ui[id]());
    },
    villager(id) {
        return svg(people[id](), '0 0 64 64', 'villager');
    },
    truck() {
        return svg(truck(), '0 0 120 64', 'truck-spr');
    },
    loco() {
        return svg(loco(), '0 0 64 64', 'loco-spr');
    },
    wagon(c) {
        return svg(wagon(c), '0 0 64 64', 'wagon-spr');
    },
    balloon(a = '#e8364b', b = '#ffd23f') {
        return svg(balloon2(a, b), '0 0 64 80', 'balloon-spr');
    },
    building,
    // les arbres se montrent en arbre, les graines en produit
    seed(id) {
        return ITEMS[id].type === 'tree' ? svg(tree(id, 2)) : svg(items[id]());
    },
    has: { items, animals, machines, ui, people },
};

// un dessin par sorte : villager, item, animal, machine, seed, et ui par défaut
const KIND = { villager: SPR.villager, item: SPR.item, animal: SPR.animal, machine: SPR.machine, seed: SPR.seed };
export const sprite = (kind, id) => (KIND[kind] || SPR.ui)(id);
