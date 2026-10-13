// « Aller produire » : depuis une commande ou un chantier, mène là où ce produit se fabrique.
import { state, lvOk } from '../core/state.js';
import { toast } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { ANIMALS } from '../data/animals.js';
import { MACHINES, RECIPES } from '../data/machines.js';
import * as G from '../systems/index.js';
import { actions } from './dom.js';
import { go } from './app.js';
import { closeAll, openSheet } from './sheets.js';

export function produce(id) {
    const it = ITEMS[id];
    closeAll();
    if (it.sea) {
        go('farm/nature');
        return toast(G.netOpen() ? 'Les produits de la mer viennent du filet (Ferme | Nature)' : G.storyLockText({ needProject: 'lighthouse' }), ['ui', 'net']);
    }
    if (id === 'alpineMilk') {
        go('animals');
        return toast(
            G.transOpen() ? 'Envoyez vaches et chèvres en transhumance, elles donnent ensuite du lait d’alpage' : G.storyLockText({ needProject: 'sheepfold' }),
            ['ui', 'mountain'],
        );
    }
    if (it.type === 'crop' && !G.storyOk(it)) {
        go('village/village');
        return toast(G.storyLockText(it), ['ui', 'village']);
    }
    if (it.island && (it.type === 'tree' || it.type === 'crop')) {
        go(G.islandOpen() ? 'farm/island' : 'village/village');
        return toast(G.islandOpen() ? `${it.name} : à cultiver sur l’île` : 'Réparez d’abord le bac de Tiago pour rejoindre l’île', ['item', id]);
    }
    if (it.type === 'tree') {
        go('farm/orchard');
        return toast(
            G.livingTrees(id) ? `Ramassez les fruits de vos ${it.seedName.toLowerCase()}s au verger` : `Plantez un ${it.seedName.toLowerCase()} au verger`,
            ['seed', id],
        );
    }
    if (it.type === 'crop') {
        if (state.seeds[id] > 0 || (it.type === 'crop' && !it.exotic && lvOk(it))) {
            go('farm/field');
            G.selectTool(id);
            return toast(`${it.seedName} en main : touchez une parcelle ${it.ghOnly ? 'de la serre' : 'labourée'} pour planter`, ['seed', id]);
        }
        go('market/shop');
        return toast(it.exotic ? 'Seul le marchand ambulant vend ces graines' : `Achetez un ${it.seedName.toLowerCase()} au marché`, ['seed', id]);
    }
    if (id === 'honey') {
        go('farm/field');
        return toast('Le miel vient des ruches posées dans le champ', ['item', 'honey']);
    }
    if (it.type === 'product') {
        const a = Object.values(ANIMALS).find(x => x.prodId === id);
        const owned = G.animalCount(a.id) > 0;
        go(owned ? 'animals' : 'market/shop');
        return toast(owned ? `${a.name} : nourrissez-les pour obtenir ${it.name.toLowerCase()}` : `Il vous faut un animal : ${a.name.toLowerCase()} (marché)`, [
            'animal',
            a.id,
        ]);
    }
    if (it.type === 'fish' || it.type === 'gem' || id === 'wood' || id === 'stone') return go('farm/nature');
    const r = RECIPES[id];
    if (!r) return;
    const k = state.machines.findIndex(m => m.type === r.machine);
    if (k < 0) {
        go('market/shop');
        return toast(`Il vous faut : ${MACHINES[r.machine].name}`, ['machine', r.machine]);
    }
    go('machines/workshop');
    openSheet('machine', { i: k, focus: id });
}

export const setupNavigate = () => actions({ produce: (el, d) => produce(d.id) });
