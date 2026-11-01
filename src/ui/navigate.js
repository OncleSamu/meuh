// « Aller produire » : depuis une commande ou un chantier, mène là où ce produit se fabrique.
import { state, lvOk } from '../core/state.js';
import { toast } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { ANIMALS } from '../data/animals.js';
import { MACHINES, RECIPES } from '../data/machines.js';
import * as G from '../systems/index.js';
import { actions } from './dom.js';
import { go, ui } from './app.js';
import { closeAll, openSheet, defineSheet } from './sheets.js';
import { ico, art } from './icons.js';
import { btn } from './kit.js';
import { fmt } from '../core/format.js';
import { goFish } from './views/pond.js';

export function produce(id) {
    const it = ITEMS[id];
    closeAll();
    if (it.sea) {
        go('farm/pond');
        return toast(G.netOpen() ? 'Les produits de la mer viennent du filet (Ferme | Pêche)' : G.storyLockText({ needProject: 'lighthouse' }), ['ui', 'net']);
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
    if (it.nord && (it.type === 'tree' || it.type === 'crop')) {
        go(G.nordOpen() ? 'farm/island#nord' : 'village/village');
        return toast(G.nordOpen() ? `${it.name} : à cultiver au Grand Nord` : 'Rallumez d’abord le poêle de Tuomas pour rejoindre le Grand Nord', ['item', id]);
    }
    if (it.oasis && (it.type === 'tree' || it.type === 'crop')) {
        go(G.oasisOpen() ? 'farm/island#oasis' : 'village/village');
        return toast(G.oasisOpen() ? `${it.name} : à cultiver à l’oasis` : 'Rouvrez d’abord le puits d’Idris pour rejoindre l’oasis', ['item', id]);
    }
    if (it.island && (it.type === 'tree' || it.type === 'crop')) {
        go(G.islandOpen() ? 'farm/island#isle' : 'village/village');
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
    if (it.type === 'fish') return goFish(id);
    if (it.type === 'gem' || it.type === 'ore' || ['wood', 'stone', 'hardwood', 'resin', 'birchSap'].includes(id)) return go('farm/nature');
    const r = RECIPES[id];
    if (!r) return;
    const k = state.machines.findIndex(m => m.type === r.machine);
    if (k < 0) {
        go('market/shop');
        return toast(`Il vous faut : ${MACHINES[r.machine].name}`, ['machine', r.machine]);
    }
    if (r.machine === 'counter') {
        ui.sel.counterTab = 'atelier';
        return go('machines/counter');
    }
    go('machines/workshop');
    openSheet('machine', { i: k, focus: id });
}

// 1.60 : ce qu'il faut pour une recette : chaque ingrédient, combien on en a, d'où il vient, et un bouton qui y mène
defineSheet('needs', {
    title: o => `${ico(['item', o.id])}${ITEMS[o.id].name}`,
    render(o) {
        const r = RECIPES[o.id];
        if (!r) return '';
        const rows = Object.entries(r.ing)
            .map(([k, n]) => {
                const have = state.inventory[k] || 0,
                    ok = have >= n;
                const src = G.sourceOf(k);
                return `<div class="rneed${ok ? ' ok' : ''}"><span class="rneed-art">${art('item', k)}</span>
                    <span class="row-main"><b>${ITEMS[k].name}</b><small>${fmt(Math.min(have, n))} / ${n}${src ? ` · ${src}` : ''}</small></span>
                    ${ok ? `<span class="chip ok">${ico(['ui', 'check'])}en stock</span>` : btn('Y aller', { act: 'produce', data: { id: k }, kind: 'gold', size: 'sm' })}</div>`;
            })
            .join('');
        const miss = Object.entries(r.ing).filter(([k, n]) => (state.inventory[k] || 0) < n).length;
        return `<p class="card-sub">${miss ? `Il manque ${miss > 1 ? `${miss} ingrédients` : 'un ingrédient'}. Touchez « Y aller » : le jeu vous mène là où il se fait.` : 'Tout est en stock : la recette est prête à lancer.'}</p><div class="rneeds">${rows}</div>`;
    },
});

// 1.61 : les objectifs du niveau, chacun avec son bouton qui y mène
export function goalGo(kind, id) {
    if (kind === 'machine') {
        closeAll();
        return go('market/shop#machines');
    }
    if (kind === 'animal') {
        closeAll();
        return go('market/shop#animals');
    }
    if (kind === 'orders') {
        closeAll();
        return go('village/orders');
    }
    if (kind === 'hive') {
        closeAll();
        return go('farm/island#' + (id === 'island' ? 'isle' : id));
    }
    if (kind === 'mead') {
        closeAll();
        return go('machines/brew');
    }
    return produce(id);
}
defineSheet('goals', {
    title: () => `${ico(['ui', 'star'])}Objectifs du niveau ${state.level}`,
    render() {
        const list = G.levelGoals();
        const ready = state.xp >= G.getXpReq(state.level);
        const rows = list
            .map(g => {
                const done = G.goalDone(g);
                return `<div class="rneed${done ? ' ok' : ''}"><span class="rneed-art">${art(...G.lvGoalIcon(g))}</span>
                    <span class="row-main"><b>${G.lvGoalText(g)}</b></span>
                    ${done ? `<span class="chip ok">${ico(['ui', 'check'])}fait</span>` : btn('Y aller', { act: 'goalGo', data: { k: g.kind, id: g.id || '' }, kind: 'gold', size: 'sm' })}</div>`;
            })
            .join('');
        return `<p class="card-sub">${
            ready
                ? `Vous avez assez d’expérience pour le niveau ${state.level + 1} : il passe dès que ces objectifs sont faits.`
                : `Chaque niveau demande d’essayer ce qu’il vient d’ouvrir. Faits, ils laissent passer le niveau ${state.level + 1} dès que l’expérience est là.`
        }</p><div class="rneeds">${rows || '<p class="empty">Aucun objectif pour ce niveau.</p>'}</div>`;
    },
});

export const setupNavigate = () =>
    actions({ produce: (el, d) => produce(d.id), needs: (el, d) => openSheet('needs', { id: d.id }), goalGo: (el, d) => goalGo(d.k, d.id) });
