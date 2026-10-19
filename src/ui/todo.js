// Ce qui attend le joueur, en un coup d'œil : la liste « À faire » et les pastilles des onglets.
// Chaque entrée : { go: 'onglet/volet' ou 'menu:…', icon, text, n, urgent }
import { state } from '../core/state.js';
import { ANIMALS } from '../data/animals.js';
import { HOLIDAYS } from '../data/world.js';
import { RARE_EVENTS } from '../data/surprises.js';
import * as G from '../systems/index.js';

const s = n => (n > 1 ? 's' : '');

export function todoList() {
    const list = [];
    const add = (go, icon, text, n = 1, extra = {}) => n > 0 && list.push({ go, icon, text, n, ...extra });
    const push = (go, icon, text, n, extra = {}) => list.push({ go, icon, text, n, ...extra });
    const plots = G.allPlots().filter(([p]) => p.isUnlocked);

    const ready = plots.filter(([p]) => p.itemId && p.isReady);
    add('farm/field', ready.length ? ['item', ready[0][0].itemId] : null, `${ready.length} à récolter`, ready.length);
    const dry = state.grid.filter(p => p.isUnlocked && p.itemId && !p.isReady && !p.isWatered).length;
    if (!G.weather().waters) add('farm/field', ['ui', 'drop'], `${dry} à arroser`, dry);
    if (state.egg) add('farm/field', ['item', 'paintedEgg'], 'Un œuf caché !');
    const honey = state.grid.reduce((a, p) => a + (p.deco === 'hive' ? Math.floor(p.honey || 0) : 0), 0);
    add('farm/field', ['item', 'honey'], `${honey} pot${s(honey)} de miel`, honey);
    if (state.dog.found) add('farm/field', ['ui', 'dog'], `${state.dog.name} a trouvé quelque chose`);
    if (G.houseCanUp()) push('sheet:house', ['ui', 'house'], 'Maison à agrandir', 0);
    // l'île : cultures prêtes, fruits au pied des arbres
    if (state.island && G.islandOpen()) {
        const r = G.islandReady();
        add('farm/island', ['item', 'pineapple'], `${r} récolte${s(r)} sur l’île`, r);
        const isl = G.slotsOf('island').filter(x => x.tree && x.tree.ground > 0);
        const fr = isl.reduce((a, x) => a + x.tree.ground, 0);
        if (fr) add('farm/island', ['item', isl[0].tree.id], `${fr} fruit${s(fr)} sur l’île`, isl.length, { urgent: isl.some(x => G.groundFull(x.tree)) });
        const dd = G.deadTrees('island');
        add('farm/island', ['item', 'wood'], `${dd} arbre${s(dd)} mort${s(dd)} sur l’île`, dd);
    }
    // le verger : un arbre au sol plein compte comme une tâche
    if (state.orchard) {
        const trees = state.orchard.slots.filter(x => x.tree);
        const withFruit = trees.filter(x => x.tree.ground > 0);
        const fruits = withFruit.reduce((a, x) => a + x.tree.ground, 0);
        if (fruits)
            add('farm/orchard', ['item', withFruit[0].tree.id], `${fruits} fruit${s(fruits)} au verger`, withFruit.length, {
                urgent: withFruit.some(x => G.groundFull(x.tree)),
            });
        const dead = G.deadTrees('farm');
        add('farm/orchard', ['item', 'wood'], `${dead} arbre${s(dead)} mort${s(dead)}`, dead);
    }

    const products = state.animals.reduce((a, x) => a + x.stack, 0);
    const firstProd = state.animals.find(x => x.stack);
    add('animals', firstProd ? ['item', ANIMALS[firstProd.type].prodId] : null, `${products} à ramasser`, products);
    const hungry = state.animals.filter(a => G.isAdult(a) && a.food === 0).length;
    add('animals', ['item', 'feed'], `${hungry} ${hungry > 1 ? 'ont' : 'a'} faim`, hungry);

    const done = state.machines.filter(m => G.outCount(m) > 0);
    add(
        'machines/workshop',
        done.length ? ['item', G.machineOutput(done[0])] : null,
        `${done.length} machine${s(done.length)} prête${s(done.length)}`,
        done.length,
    );
    const idle = state.machines.filter(m => !G.machineBusy(m) && G.recipesOf(m.type).some(r => G.recipeUnlocked(r.id) && G.canCook(r.id))).length;
    add('machines/workshop', ['machine', 'mill'], `${idle} à l’arrêt`, idle);
    if (G.holidayReady()) push('village/orders', ['ui', HOLIDAYS[state.holiday.id].deco], `${HOLIDAYS[state.holiday.id].name} : panier à remplir`, 1);
    const bq = G.quartersClaimable();
    if (bq) push('sheet:book', ['ui', 'book'], 'Récompense du livre', bq);
    if (G.brewOpen() && state.brew) {
        const vr = state.brew.vats.filter(v => G.vatReady(v) && !v.loop).length;
        if (vr) push('machines/brew', ['ui', 'beer'], `${vr} cuve${s(vr)} à mettre en bouteille`, vr);
        const bo = G.beerOrdersReady();
        if (bo) push('machines/brew', ['villager', 'hugues'], `${bo} commande${s(bo)} de bière à livrer`, bo);
        if (G.beerBookClaimable()) push('machines/brew', ['ui', 'beer'], 'Récompense du livre des bières', 1);
    }
    // 1.19.1 : Armand
    if (G.armandHere()) {
        const ao = G.armandOrder();
        if (!ao && G.armandCandidates().length) push('village/orders', ['villager', 'armand'], 'Armand cherche un produit phare', 1);
        else if (ao && !ao.done && (state.inventory[ao.id] || 0) > 0) push('village/orders', ['villager', 'armand'], 'Armand attend sa commande', 1);
    }
    // 1.8 : l'avion-cargo
    const cg = G.cargoReady();
    if (cg) push('village/orders', ['ui', 'plane'], `${cg} soute${s(cg)} de l’avion-cargo à charger`, cg);
    // 1.7 : le labo
    if (state.genetics && G.geneticsOpen()) {
        const lt = state.genetics.litters.length + (G.crossReady() ? 1 : 0);
        if (lt) push('machines/lab', ['ui', 'flowers'], `${lt} portée${s(lt)} à découvrir`, lt);
        const p = G.goalPlan();
        if (p && p.done && !(state.genetics.stock[p.done] > 0)) push('machines/lab', ['ui', 'search'], 'But atteint : semez la variété', 1);
    }
    if (G.caveOpen()) {
        const care = G.caveCareCount();
        if (care) push('machines/cave', ['ui', 'turn'], `${care} lot${s(care)} à soigner`, care);
        if (!G.climOk() && !state.cave.gear.hygro && state.cave.slots.some(Boolean)) push('machines/cave', ['ui', 'thermo'], 'Climat de la cave à régler', 1);
        const co = G.caveOrdersReady();
        if (co) push('machines/cave', ['ui', 'cave'], `${co} commande${s(co)} de cave à livrer`, co);
        const a = state.cave.auction;
        if (a && a.lots && !a.over) push('machines/cave', ['ui', 'gavel'], 'Enchères en direct !', 1, { urgent: true });
        const last = G.lastSaleShown();
        if (last && last.results.length) push('machines/cave', ['ui', 'gavel'], 'Résultats de la vente', 1);
    }

    // imprévus en premier : ils pressent
    const inc = G.incidentTodo();
    if (inc)
        list.unshift({
            go: inc.view === 'farm' ? 'farm/field' : inc.view === 'animals' ? 'animals' : 'village/orders',
            icon: inc.icon,
            text: inc.text,
            n: 1,
            urgent: true,
        });
    if (G.barnSpace() <= 0) list.unshift({ go: 'sheet:barn', icon: ['ui', 'barn'], text: 'Grange pleine', n: 0, urgent: true });

    const orders = state.quests.filter(G.checkQuestReady).length;
    add('village/orders', ['ui', 'scroll'], `${orders} commande${s(orders)} prête${s(orders)}`, orders);
    if (state.truck.status === 'here') add('village/orders', ['ui', 'trainIcon'], 'Le train est en gare');
    if (state.balloon.status === 'here') {
        const ok = G.hasAll(state.balloon.items);
        push('village/orders', ['ui', 'balloon'], ok ? 'Montgolfière prête' : 'Une montgolfière attend', ok ? 1 : 0);
    }
    const proj = G.storyClaimable();
    if (proj) push('village/village', ['ui', 'village'], `${proj} chantier${s(proj)} à terminer`, proj);
    if (state.merchant.status === 'here') push('market/shop', ['ui', 'merchant'], 'Le marchand est là', 0);
    const dr = G.defiReady();
    if (dr) push('village/orders', ['ui', 'cupGold'], `Grand défi : ${dr} étape${s(dr)} à faire avancer`, dr);
    const goals = G.eventReady();
    add('village/orders', G.eventIcon(G.season().id), `${goals} objectif${s(goals)} de fête`, goals);
    const tiers = G.contestClaimable();
    if (tiers) push('village/village', ['ui', 'podium'], `${tiers} palier${s(tiers)} du concours`, tiers);

    const sold = G.stallSoldCount();
    add('market/sell', ['ui', 'stall'], `${sold} vente${s(sold)} à encaisser`, sold);
    if (state.rare.type && G.rareActive(state.rare.type) && state.rare.type !== 'butterflies')
        push('village/orders', ['ui', RARE_EVENTS[state.rare.type].icon], RARE_EVENTS[state.rare.type].name, 1, { urgent: true });
    if (G.rareActive('butterflies')) list.unshift({ go: 'farm/field', icon: ['ui', 'butterfly'], text: 'Papillons : récoltes dorées !', n: 0 });
    if (state.boat.status === 'here') {
        const ok = G.hasAll(state.boat.items);
        push('village/orders', ['ui', 'boat'], ok ? 'Cargo prêt à charger' : 'Un cargo au port', ok ? 1 : 0);
    }
    if (G.netReady()) push('farm/pond', ['ui', 'net'], 'Filet de pêche plein', 1);
    const traps = G.trapsReady();
    if (traps) push('farm/pond', ['ui', 'trap'], `${traps} nasse${s(traps)} pleine${s(traps)}`, traps);
    if (G.bldReady()) push('sheet:upgrades', ['ui', 'granary'], 'Un bâtiment peut être amélioré', 0);
    if (G.odileReady()) push('farm/orchard', ['villager', 'odile'], 'Défi d’Odile réussi', 1);
    if (G.harvestReady()) push('farm/orchard', ['item', 'apple'], 'Grande cueillette réussie', 1);
    if (G.vendReady()) push('farm/orchard', ['item', 'grape'], 'Les vendanges sont finies', 1);
    if (G.feteReady()) push('farm/orchard', ['item', 'cider'], 'La pressée est prête', 1);
    if (G.logReady()) push('farm/orchard', ['ui', 'orchardBook'], 'Une médaille du carnet du verger', 1);
    if (G.basketResultReady()) push('farm/orchard', ['item', 'apple'], 'Résultats du concours du panier', 1);
    if (G.frostStatus() === 'warn' && !(state.orchard.frost && state.orchard.frost.lit))
        push('farm/orchard', ['item', 'pineTorch'], 'Gelée en vue : torches !', 1);
    if (G.gaspardReady()) push('farm/nature', ['villager', 'gaspard'], 'Défi de Gaspard réussi', 1);
    if (G.loadsReady('lumber')) push('farm/nature', ['ui', 'axe'], 'Le bûcheron a une charge', G.loadsReady('lumber'));
    if (G.loadsReady('miner')) push('farm/nature', ['ui', 'pickaxe'], 'Le mineur a une charge', G.loadsReady('miner'));
    if (G.kilnReady()) push('farm/nature', ['item', 'coal'], 'La charbonnière a fini', 1);
    if (G.marcelReady()) push('farm/pond', ['villager', 'marcel'], 'Défi de Marcel réussi', 1);
    if (G.runReady()) push('farm/pond', ['item', 'salmon'], 'Défi de la remontée réussi', 1);
    if (G.contestResultReady()) push('farm/pond', ['ui', 'trophy'], 'Résultats du concours de pêche', 1);
    const fst = G.farmSeasonClaimable();
    if (fst) push('village/orders', ['ui', 'trophy'], `${fst} palier${s(fst)} de saison`, fst);
    if (G.contractReady()) push('village/orders', ['ui', 'calendar'], 'Contrat de saison prêt', 1);
    const stories = G.storiesReady();
    if (stories) push('village/village', ['ui', 'scroll'], `${stories} histoire${s(stories)} à faire avancer`, stories);
    const neigh = G.neighborsReady();
    if (neigh) push('village/orders', ['ui', 'heart'], `${neigh} voisin${s(neigh)} à aider`, neigh);

    const pts = G.skillPoints();
    add('sheet:progress', ['ui', 'skillbook'], `${pts} point${s(pts)} de compétence`, pts);
    const ach = G.claimableCount();
    add('sheet:book', ['ui', 'trophy'], `${ach} succès à réclamer`, ach);
    add('sheet:book', ['ui', 'book'], 'Page du livre complète', G.bookClaimable());
    if (G.legendReady()) add('sheet:book', ['ui', 'goldCow'], 'Ferme légendaire !');
    return list;
}

// total par onglet (farm, animals, machines, village, market, menu) et par volet (farm/nature, machines/cave…)
export function todoCounts(list) {
    const c = {};
    for (const t of list) {
        const tab = t.go.startsWith('sheet:') ? 'menu' : t.go.split('/')[0];
        // une pastille compte les choses à faire, pas les objets : « 35 à récolter » compte pour une
        const n = t.n ? 1 : 0;
        c[tab] = (c[tab] || 0) + n;
        if (t.go.includes('/')) c[t.go] = (c[t.go] || 0) + n;
    }
    // la maison et la grange s'ouvrent depuis la ferme : pas dans le menu
    return c;
}
