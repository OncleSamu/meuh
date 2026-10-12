// Ce qui attend le joueur, en un coup d'œil : la liste « À faire » et les pastilles des onglets.
// Chaque entrée : { go: 'onglet/volet' ou 'menu:…', icon, text, n, urgent }
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
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
    if (state.egg) add('farm/field', ['item', 'paintedEgg'], 'Un œuf caché !');
    const honey = state.grid.reduce((a, p) => a + (p.deco === 'hive' ? Math.floor(p.honey || 0) : 0), 0);
    add('farm/field', ['item', 'honey'], `${honey} pot${s(honey)} de miel`, honey);
    if (state.dog.found) add('farm/field', ['ui', 'dog'], `${state.dog.name} a trouvé quelque chose`);
    if (G.houseCanUp()) push('sheet:house', ['ui', 'house'], 'Maison à agrandir', 0);

    const products = state.animals.reduce((a, x) => a + x.stack, 0);
    const firstProd = state.animals.find(x => x.stack);
    add('animals', firstProd ? ['item', ANIMALS[firstProd.type].prodId] : null, `${products} à ramasser`, products);
    const hungry = state.animals.filter(a => G.isAdult(a) && a.food === 0).length;
    add('animals', ['item', 'feed'], `${hungry} ${hungry > 1 ? 'ont' : 'a'} faim`, hungry);

    const done = state.machines.filter(m => G.outCount(m) > 0);
    add('machines/workshop', done.length ? ['item', G.machineOutput(done[0])] : null, `${done.length} machine${s(done.length)} prête${s(done.length)}`, done.length);
    const idle = state.machines.filter(m => !G.machineBusy(m) && G.recipesOf(m.type).some(r => G.recipeUnlocked(r.id) && G.canCook(r.id))).length;
    add('machines/workshop', ['machine', 'mill'], `${idle} à l’arrêt`, idle);
    if (G.holidayReady()) push('village/village', ['ui', HOLIDAYS[state.holiday.id].deco], `${HOLIDAYS[state.holiday.id].name} : panier à remplir`, 1);
    const bq = G.quartersClaimable();
    if (bq) push('sheet:book', ['ui', 'book'], 'Récompense du livre', bq);
    if (G.caveOpen()) {
        const care = G.caveCareCount();
        if (care) push('machines/cave', ['ui', 'turn'], `${care} lot${s(care)} à soigner`, care);
        if (!G.climOk() && state.cave.slots.some(Boolean)) push('machines/cave', ['ui', 'thermo'], 'Climat de la cave à régler', 1, { urgent: !!state.cave.gear.hygro });
        const a = state.cave.auction;
        if (a && a.lots && !a.over) push('machines/cave', ['ui', 'gavel'], 'Enchères en direct !', 1, { urgent: true });
        const last = state.cave.lastSale;
        if (last && last.results.length && now() < last.until) push('machines/cave', ['ui', 'gavel'], 'Résultats de la vente', 1);
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
    if (state.merchant.status === 'here') push('village/village', ['ui', 'merchant'], 'Le marchand est là', 0);
    const goals = G.eventReady();
    add('village/orders', G.eventIcon(G.season().id), `${goals} objectif${s(goals)} de fête`, goals);
    const tiers = G.contestClaimable();
    if (tiers) push('village/village', ['ui', 'podium'], `${tiers} palier${s(tiers)} du concours`, tiers);

    const sold = G.stallSoldCount();
    add('market/sell', ['ui', 'stall'], `${sold} vente${s(sold)} à encaisser`, sold);
    if (state.rare.type && G.rareActive(state.rare.type) && state.rare.type !== 'butterflies')
        push('village/village', ['ui', RARE_EVENTS[state.rare.type].icon], RARE_EVENTS[state.rare.type].name, 1, { urgent: true });
    if (G.rareActive('butterflies')) list.unshift({ go: 'farm/field', icon: ['ui', 'butterfly'], text: 'Papillons : récoltes dorées !', n: 0 });
    if (state.boat.status === 'here') {
        const ok = G.hasAll(state.boat.items);
        push('village/orders', ['ui', 'boat'], ok ? 'Cargo prêt à charger' : 'Un cargo au port', ok ? 1 : 0);
    }
    if (G.netReady()) push('farm/nature', ['ui', 'net'], 'Filet de pêche plein', 1);
    const fst = G.farmSeasonClaimable();
    if (fst) push('village/village', ['ui', 'trophy'], `${fst} palier${s(fst)} de saison`, fst);
    if (G.contractReady()) push('village/village', ['ui', 'calendar'], 'Contrat de saison prêt', 1);
    const stories = G.storiesReady();
    if (stories) push('village/village', ['ui', 'scroll'], `${stories} histoire${s(stories)} à faire avancer`, stories);
    const neigh = G.neighborsReady();
    if (neigh) push('village/village', ['ui', 'heart'], `${neigh} voisin${s(neigh)} à aider`, neigh);

    const pts = G.skillPoints();
    add('sheet:progress', ['ui', 'skillbook'], `${pts} point${s(pts)} de compétence`, pts);
    const ach = G.claimableCount();
    add('sheet:book', ['ui', 'trophy'], `${ach} succès à réclamer`, ach);
    add('sheet:book', ['ui', 'book'], 'Page du livre complète', G.bookClaimable());
    if (G.legendReady()) add('sheet:book', ['ui', 'goldCow'], 'Ferme légendaire !');
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
