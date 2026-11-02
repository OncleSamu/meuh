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
import './nuit.js';
// les dessins refaits (1.2.1 et suivantes) passent en dernier : ils remplacent les anciens
import './items2.js';
import './buildings2.js';
import './plants2.js';
import { balloon2 } from './misc2.js';
import './champ/nouvelles-cultures.js';
import './cuisine/plats-cultures.js';
import './verger/arbres.js';
import './ile/cultures.js';
import './ile/plats.js';
import './peche/poissons.js';
import './cuisine/plats-poissons.js';
import './cuisine/cultures-arbres-machines.js';
import './cuisine/saloir.js';
import './cuisine/complements.js';
import './champ/cultures-caille-creperie.js';
import './abbey.js';
import './retouches/sept-produits.js';
import './avion.js';
import './retouches/lavande-salades.js';
import './peche/poissons-etang.js';
import './nature/foret-mine.js';
import './verger/outils.js';
import './verger/vivant.js';
import './verger/bois.js';
import './comptoir/cave.js';
import './animaux/nouveaux.js';
import './animaux/produits.js';
import './cuisine/plats-animaux.js';
import './village/chateau-plats.js';
import './village/chateau.js';
import './village/coupe.js';
import './comptoir/boissons.js';
import './retouches/kakis-lardons.js';
import './village/decos-defis.js';
import './champ/serre.js';
import './village/armand.js';
import './haras/ecuries.js';
import './haras/concours.js';
import './haras/sellerie.js';
import './haras/robes.js';
import './champ/compagnes.js';
import './village/voisins.js';
import './village/coffre.js';
import './oasis/oasis.js';
import './oasis/betes.js';
import './oasis/cuisine.js';
import './nord/nord.js';
import './nord/betes.js';
import './nord/cuisine.js';
import './comptoir/boissons-oasis.js';
import './comptoir/boissons-nord.js';
import './verger/fruits-sur-arbre.js';
import './oasis/sorgho.js';
import './verger/contrees.js';

export const SPR = {
    farmhouse(l, roof) {
        return svg(farmhouseArt(Math.max(0, Math.min(6, l)), roof), '0 0 64 64', 'farmhouse');
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
        const [id, rest] = String(key).split('~');
        const [code, robe] = String(rest || '').split('@');
        const o = {};
        if (code) featuresOf(id).forEach((k, j) => (o[k] = +code[j] || 0));
        // 1.24.2 : « horse~0@bai.etoile+balzanes.1 » : la robe, les marques et l'âge du cheval
        if (robe) {
            const [r, m, st, fl] = robe.split('.');
            o.robe = r;
            o.marks = m ? m.split('+') : [];
            if (st !== undefined && st !== '') o.stage = +st;
            if (fl && fl.includes('f')) o.shoes = fl.includes('fa') ? 2 : 1; // 1.24.5 : fers en fer (f) ou en argent (fa)
        }
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
import './retouches/fromages.js';
import './miel/cire.js';
import './cuisine/pizzeria.js';
import './miel/miels.js';
import './miel/ruchers.js';
import './village/amis.js';
import './retouches/produits-uniques.js';
