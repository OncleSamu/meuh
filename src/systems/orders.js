// Les commandes : tableau de commandes du village, train de marchandises (3 wagons) et montgolfière.
// C'est le vrai cœur de l'économie.
import { addRenom, RENOM } from './renom.js';
import { livingTrees } from './orchard.js';
import { pkTransportOk, pkReq, pkEstimate, pkHave, pullPk } from './maison.js';
import { islandOpen } from './island.js';
import { oasisOpen } from './oasis.js';
import { nordOpen } from './nord.js';
import { state, scaleLvl, lvOk } from '../core/state.js';
import { now } from '../core/clock.js';
import { view } from '../core/view.js';
import { pickRand, round5 } from '../core/format.js';
import { emit, toast, sfx, buzz, burst, squish } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { ANIMALS } from '../data/animals.js';
import { MACHINES, RECIPES } from '../data/machines.js';
import { VILLAGERS, BEST_FRIEND_BONUS, PROJECTS } from '../data/village.js';
import { RARE, ORDER_MAX, ORDER_REFILL, ORDER_TRASH_WAIT, TRAIN_STAY, TRAIN_AWAY, BALLOON_STAY, BALLOON_AWAY } from '../data/commerce.js';
import { BALANCE } from '../data/progress.js';
import { netOpen, transOpen } from './port.js';
import { storyOk, projectDone, projectOpen, projectLeft } from './story.js';
import { hasMachine, recipeUnlocked } from './workshop.js';
import { extraOrders, presentVillagers, housePay, studPay } from './home.js';
import { stayOf, workFx } from './estate.js';
import { masteryMult } from './mastery.js';
import { heartsOf, addFriendship } from './village.js';
import { rank, earn, addXp } from './player.js';
import { clampQuality } from './farm.js';
import { record } from './book.js';
import { giveRare, rollRare } from './barn.js';
import { isInSeason } from './world.js';
import { isAdult } from './animals.js';
import { tip } from './tips.js';
import { eventActive, eventProgress } from './events.js';
import { defiWanted } from './defis.js';
import { fishOrderOk } from './fishing.js';
import { cupHas } from './cup.js';
import { ecoLvl } from '../core/state.js';
import { eldersMult } from './family.js';
import { metierOrderPay, metierTransportPay, metierPick, clientOrder } from './metier.js';

// Ce que la ferme sait produire en ce moment (ingrédients compris)
export function questPool() {
    const memo = {};
    const can = (id, depth = 0) => {
        if (id in memo) return memo[id];
        const i = ITEMS[id];
        let ok = false;
        if (!i || i.exotic || depth > 4) ok = false;
        else if (i.sea) ok = netOpen() && id !== 'lobster';
        else if (id === 'alpineMilk') ok = transOpen();
        else if (id === 'honey')
            ok = state.grid.some(p => p.deco === 'hive') || Object.values(state.apiary || {}).some(a => a && a.hives > 0); // 1.94 : les ruchers des contrées aussi
        else if (i.type === 'crop')
            ok =
                lvOk(i) &&
                storyOk(i) &&
                (!i.ghOnly || !!(state.greenhouse && state.greenhouse.built)) &&
                (i.nord ? nordOpen() : i.oasis ? oasisOpen() : !i.island || islandOpen());
        else if (i.type === 'tree') ok = livingTrees(i.id) > 0;
        else if (i.type === 'product') ok = state.animals.some(a => ANIMALS[a.type].prodId === i.id);
        else if (i.type === 'fish') ok = fishOrderOk(id);
        // 1.104.1 : les boîtes de la Maison (bois, lingots, tissu) : demandées dès qu'on a l'emballerie
        else if (i.box) ok = hasMachine(RECIPES[id].machine) && recipeUnlocked(id);
        else if (i.type === 'artisan') {
            const r = RECIPES[id];
            ok = !!r && !r.fete && !r.holiday && hasMachine(r.machine) && recipeUnlocked(id) && Object.keys(r.ing).every(k => can(k, depth + 1));
        }
        return (memo[id] = ok);
    };
    return Object.values(ITEMS).filter(i => i.type !== 'fish' && can(i.id));
}

export const orderSlots = () =>
    Math.min(ORDER_MAX + extraOrders(), 3 + Math.floor(scaleLvl() / 2) + (projectDone('bakery') ? 1 : 0) + extraOrders()) + (cupHas(3) ? 1 : 0);
export const xpBonus = () => (projectDone('school') ? 1.1 : 1) * (1 + workFx('library')) * eldersMult(); // 1.107 : la bibliothèque du domaine ; 1.126 : les anciens

// Quantité qui donne à peu près la valeur visée, bornée
export const qtyFor = (it, target, max = 12) => Math.max(1, Math.min(max, Math.round(target / it.sell)));

// Plus une chaîne de production est longue (ou demande de pêcher, en mer ou à l'étang, ou de monter aux estives),
// plus le produit est rare dans les commandes
export function itemWeight(id) {
    const r = RECIPES[id];
    if (ITEMS[id].sea || id === 'alpineMilk') return 0.3;
    if (!r) return ITEMS[id].island ? 0.6 : 1;
    const ing = Object.keys(r.ing);
    if (ing.some(k => ITEMS[k].type === 'fish' || ITEMS[k].sea || k === 'alpineMilk')) return 0.2;
    if (ing.some(k => RECIPES[k])) return 0.35;
    return ITEMS[id].island ? 0.5 : 0.7;
}

function pickWeighted(list) {
    let x = Math.random() * list.reduce((a, i) => a + itemWeight(i.id), 0);
    for (const i of list) if ((x -= itemWeight(i.id)) <= 0) return i;
    return list[list.length - 1];
}

// Choisit n produits différents, de préférence parmi ceux qu'aime le villageois
export function pickItems(n, likes = []) {
    const pool = questPool();
    const out = [];
    for (let k = 0; k < n && pool.length; k++) {
        const fav = pool.filter(i => likes.includes(i.id) && !out.includes(i));
        const rest = pool.filter(i => !out.includes(i));
        if (!rest.length) break;
        // 1.115 : le métier de la ferme se fait demander plus souvent
        const mine = metierPick(rest);
        out.push(mine || (fav.length && Math.random() < 0.4 ? pickWeighted(fav) : pickWeighted(rest)));
    }
    return out;
}

function orderCount() {
    if (state.level < 3) return 1;
    const r = Math.random();
    if (state.level < 6) return r < 0.55 ? 1 : 2;
    return r < 0.3 ? 1 : r < 0.75 ? 2 : 3;
}

export function makeOrder() {
    // 1.101 : chacun son tour : on évite de redonner une commande à un villageois qui en a déjà une sur le tableau
    const present = presentVillagers();
    const busy = new Set((state.quests || []).map(q => q && q.vid).filter(Boolean));
    const free = present.filter(v => !busy.has(v));
    const vid = pickRand(free.length ? free : present);
    const its = pickItems(orderCount(), VILLAGERS[vid].likes);
    if (!its.length) return null;
    const target = 30 + scaleLvl() * 22;
    const items = its.map(it => ({ id: it.id, qty: qtyFor(it, target * (0.6 + Math.random() * 0.8)) }));
    const value = items.reduce((a, x) => a + ITEMS[x.id].sell * x.qty, 0);
    // la maîtrise et la maison paient plus, sans changer l'expérience
    const bonus = (items.reduce((a, x) => a + ITEMS[x.id].sell * masteryMult(x.id) * x.qty, 0) / value) * housePay() * (1 + workFx('post')) * metierOrderPay(items.map(x => x.id)); // 1.107 : le relais de poste ; 1.114 : le métier
    let mult = BALANCE.orderPay * (0.95 + Math.random() * 0.15);
    if (heartsOf(vid) >= 5) mult *= BEST_FRIEND_BONUS;
    if (vid === 'paul' && projectDone('bakery')) mult *= 1.2;
    if (projectDone('townhall')) mult *= 1.1;
    mult *= (1 + rank('loyal') * 0.1) * (1 + state.upgrades.price * 0.04);
    // 1.38 : +3 % par niveau au-delà de 50 (pièces seulement)
    const gold = round5(value * mult * bonus * (1 + 0.03 * Math.max(0, ecoLvl() - 50)) * (cupHas(5) ? 1.05 : 1));
    return {
        items,
        gold,
        xp: Math.max(5, Math.round(value * mult * BALANCE.orderXp * xpBonus())),
        vid,
        mat: Math.random() < 0.15 ? pickRand(RARE) : null,
        wait: 0,
    };
}

export const emptyOrder = wait => ({ items: [], gold: 0, xp: 0, vid: null, mat: null, wait });
export const isOpen = q => q && q.items.length > 0;

// Complète le tableau et remplit les places libres dont l'attente est finie
export function ensureQuests() {
    let changed = false;
    const n = orderSlots(),
        t = now();
    if (state.quests.some(q => !q || !Array.isArray(q.items))) state.quests = state.quests.filter(q => q && Array.isArray(q.items));
    while (state.quests.length < n) {
        state.quests.push(emptyOrder(0));
        changed = true;
    }
    // une commande devenue impossible (arbre arraché, ruche retirée…) est remplacée sans attendre
    if (state.quests.some(isOpen)) {
        const ok = new Set(questPool().map(i => i.id));
        state.quests.forEach((q, i) => {
            if (isOpen(q) && q.items.some(x => !ok.has(x.id))) {
                state.quests[i] = emptyOrder(0);
                changed = true;
            }
        });
    }
    state.quests.forEach((q, i) => {
        if (!isOpen(q) && q.wait <= t) {
            const o = makeOrder();
            if (o) {
                state.quests[i] = o;
                changed = true;
            }
        }
    });
    return changed;
}

// 1.115 : le client attitré du métier (rang 4), une commande par jour
export const metierClient = () => clientOrder(questPool(), qtyFor, 30 + scaleLvl() * 22, xpBonus());
export function deliverClient(at) {
    const c = metierClient();
    if (!c || c.done || !hasAll(c.items)) return false;
    payItems(c.items);
    c.done = true;
    state.stats.orders++;
    state.stats.clientOrders = (state.stats.clientOrders || 0) + 1;
    state.income.orders += c.gold;
    sfx('level');
    buzz(20);
    burst(at, 'sparkle', 14);
    earn(c.gold, at);
    addXp(c.xp, at);
    rollRare(0.3, at);
    return true;
}
export const hasAll = items => items.every(x => state.inventory[x.id] >= x.qty);
export const checkQuestReady = q => isOpen(q) && hasAll(q.items);

export function payItems(items) {
    items.forEach(x => {
        state.inventory[x.id] -= x.qty;
        clampQuality(x.id);
    });
}

export function turnInQuest(i, at) {
    const q = state.quests[i];
    if (!checkQuestReady(q)) return false;
    payItems(q.items);
    state.stats.orders++;
    state.income.orders += q.gold;
    record('order', q.gold);
    if (q.vid) addFriendship(q.vid, VILLAGERS[q.vid].likes.some(id => q.items.some(x => x.id === id)) ? 4 : 2, at);
    sfx('buy');
    buzz(15);
    burst(at, 'sparkle', 12);
    earn(q.gold, at);
    addXp(q.xp, at);
    if (q.mat) giveRare(q.mat, 1, at);
    else rollRare(0.1, at);
    state.quests[i] = emptyOrder(now() + ORDER_REFILL);
    return true;
}

// la confirmation (second appui) est demandée par l'interface
export function trashQuest(i) {
    const q = state.quests[i];
    if (!isOpen(q)) return false;
    state.quests[i] = emptyOrder(now() + ORDER_TRASH_WAIT);
    sfx('click');
    return true;
}

// D'où vient un produit
export function sourceOf(id) {
    const it = ITEMS[id];
    if (id === 'honey') return 'Ruche';
    if (it.sea) return 'Pêche en mer';
    if (id === 'alpineMilk') return 'Transhumance';
    if (it.ghOnly) return 'Serre';
    if (it.oasis) return 'Oasis';
    if (it.nord) return 'Grand Nord';
    if (it.island) return it.type === 'tree' ? 'Verger de l’île' : 'Île';
    if (it.type === 'crop') return isInSeason(id) ? 'Champ (de saison)' : 'Champ';
    if (it.type === 'tree') return 'Arbre fruitier';
    if (it.type === 'fish') return 'Pêche';
    if (it.type === 'product') {
        const a = Object.values(ANIMALS).find(x => x.prodId === id);
        if (a) return a.name;
        // 1.79.1 : un second produit (viande, laine…), de temps en temps au ramassage
        const b = Object.values(ANIMALS).find(x => x.extra === id);
        if (b) return `${b.name} (au ramassage, parfois)`;
        return id === 'cardamom' ? 'Traîneau du Grand Nord' : '';
    }
    const r = RECIPES[id];
    return r && MACHINES[r.machine] ? MACHINES[r.machine].name : '';
}
// combien sont déjà en route à l'atelier
export const inProduction = id => state.machines.reduce((n, m) => n + m.queue.filter(q => q === id).length + (m.out[id] || 0), 0);

// ---------------- le train de marchandises ----------------
// 1.104.1 : un wagon de paquets (une chance sur trois quand la Maison a des recettes), payé 1,6 fois leur valeur
const TRAIN_PK = 0.35,
    TRAIN_PK_PAY = 1.6;
// 1.106 : la valeur de marchandises demandée par wagon. Avant, elle grandissait en ligne droite (1 250 au niveau 60) alors que
// la production de la ferme double tous les huit niveaux : un train plein ne pesait plus rien. Elle suit maintenant la production
// (environ 600 au niveau 15, 5 000 au niveau 40, 30 000 au niveau 60), et un wagon peut demander jusqu'à 60 produits.
export const wagonTarget = (L = ecoLvl()) => Math.max(60 + scaleLvl() * 30, L >= 15 ? 400 * Math.pow(1.09, L - 10) : 0);
export const wagonMax = (L = ecoLvl()) => Math.round(Math.min(60, 20 + Math.max(0, L - 30) * 1.34));
export const slotHave = sl => (sl.pk ? pkHave(sl.pk) >= sl.qty : (state.inventory[sl.id] || 0) >= sl.qty);
export const trainOpen = () => projectDone('station');
// chaque cheval fait revenir le train 10 % plus tôt (30 % au plus)
export const trainAway = () => TRAIN_AWAY * (1 - Math.min(0.3, 0.1 * state.animals.filter(a => a.type === 'horse' && isAdult(a)).length));

export function truckTick() {
    if (!trainOpen()) return false;
    const t = state.truck,
        n = now();
    if (t.status === 'away' && n >= t.arriveAt) {
        makeTruck();
        if (t.status === 'here' && !view.hidden && view.started) {
            toast('Le train de marchandises entre en gare !', ['ui', 'trainIcon']);
            tip('train');
            sfx('horn');
        }
        return true;
    }
    if (t.status === 'here' && n >= t.expiresAt) {
        truckLeave();
        return true;
    }
    return false;
}

function makeTruck() {
    const t = state.truck,
        n = now();
    // 1.106 : aux hauts niveaux, le train préfère les produits de valeur (sinon il en faudrait des centaines par wagon)
    const minSell = wagonTarget() / wagonMax() / 1.5;
    const its = pickItems(9)
        .map((it, k) => [it, k])
        .sort((x, y) => (y[0].sell >= minSell) - (x[0].sell >= minSell) || x[1] - y[1])
        .slice(0, 3)
        .map(x => x[0]);
    if (its.length < 3) {
        t.arriveAt = n + 60000;
        return;
    }
    // 1.106 : la taille d'un wagon suit la production de la ferme (voir wagonTarget) ; l'expérience reste celle d'avant
    const old = 60 + scaleLvl() * 30;
    const target = wagonTarget();
    const mult = BALANCE.trainPay * (eventActive('hiver') ? 1.3 : 1) * (1 + rank('logistics') * 0.1) * studPay() * (1 + workFx('wheel')); // 1.107 : la remise du charron
    const slots = its.map(it => {
        const rnd = 0.8 + Math.random() * 0.5;
        const qty = qtyFor(it, target * rnd, wagonMax());
        const gold = round5(it.sell * qty * mult * metierTransportPay(it.id)); // 1.114 : le métier, au rang 6
        const goldOld = round5(it.sell * qtyFor(it, old * rnd, 20) * mult);
        return {
            id: it.id,
            qty,
            loaded: false,
            gold,
            xp: Math.max(5, Math.round(goldOld * BALANCE.truckXp * xpBonus())),
            mat: Math.random() < 0.25 ? pickRand(RARE) : null,
        };
    });
    // 1.104.1 : un wagon demande parfois des paquets de la Maison
    if (pkTransportOk() && Math.random() < TRAIN_PK) {
        const pk = pkReq();
        const qty = 1 + Math.floor(Math.random() * 2);
        const gold = round5(pkEstimate(pk) * qty * TRAIN_PK_PAY * mult);
        slots[2] = { id: 'paquet', pk, qty, mult, loaded: false, gold, xp: Math.max(5, Math.round(gold * BALANCE.truckXp * xpBonus() * 2)), mat: Math.random() < 0.5 ? pickRand(RARE) : null };
    }
    const sum = slots.reduce((a, sl) => a + sl.gold, 0);
    const xpSum = slots.reduce((a, sl) => a + (sl.pk ? sl.xp / 2 : sl.xp), 0);
    Object.assign(t, {
        status: 'here',
        expiresAt: n + stayOf(TRAIN_STAY),
        slots,
        gold: round5(sum * 0.5),
        xp: Math.round(xpSum * 0.5),
        justArrived: true,
    });
}

function truckLeave() {
    const t = state.truck;
    const n = t.slots.filter(sl => sl.loaded).length;
    if (view.started) toast(n ? `Le train repart avec ${n} wagon${n > 1 ? 's' : ''} sur 3` : 'Le train est reparti à vide', ['ui', 'trainIcon']);
    t.status = 'away';
    t.slots = [];
    t.arriveAt = now() + trainAway();
}

export function loadSlot(k, at) {
    const t = state.truck,
        sl = t.slots[k];
    if (!sl || sl.loaded || !slotHave(sl)) return false;
    if (sl.pk) {
        // 1.104.5 : payé selon la valeur réelle des paquets chargés (le prix affiché n'est qu'une estimation)
        const val = pullPk(sl.pk, sl.qty);
        sl.gold = round5(val * TRAIN_PK_PAY * (sl.mult || 1));
        sl.xp = Math.max(5, Math.round(sl.gold * BALANCE.truckXp * xpBonus() * 2));
    } else {
        state.inventory[sl.id] -= sl.qty;
        clampQuality(sl.id);
    }
    sl.loaded = true;
    state.stats.wagons = (state.stats.wagons || 0) + 1;
    sfx('load');
    buzz(12);
    burst(at, 'crumbs', 8);
    squish(at);
    earn(sl.gold, at);
    addXp(sl.xp, at);
    state.income.trucks += sl.gold;
    if (sl.mat) giveRare(sl.mat, 1, at);
    if (t.slots.every(x => x.loaded)) sendTruck(at);
    return true;
}

export function sendTruck(at) {
    const t = state.truck;
    if (t.status !== 'here' || !t.slots.every(sl => sl.loaded)) return false;
    sfx('horn');
    buzz(25);
    emit('trainLeaves');
    earn(t.gold, at);
    addXp(t.xp, at);
    giveRare(pickRand(RARE), 1, at);
    state.stats.trucks++;
    addRenom(RENOM.train, 'train', at);
    state.income.trucks += t.gold;
    eventProgress('truck', null, 1);
    t.status = 'away';
    t.slots = [];
    t.arriveAt = now() + trainAway();
    toast('Train complet, le chef de gare vous félicite !', ['ui', 'trainIcon']);
    return true;
}

// ---------------- la montgolfière ----------------
export const balloonOpen = () => projectDone('inn');

export function balloonTick() {
    if (!balloonOpen()) return false;
    const b = state.balloon,
        n = now();
    if (b.status === 'away' && n >= b.arriveAt) {
        const its = pickItems(3);
        if (its.length < 3) {
            b.arriveAt = n + 60000;
            return false;
        }
        const target = 90 + scaleLvl() * 40;
        const items = its.map(it => ({ id: it.id, qty: qtyFor(it, target * (0.8 + Math.random() * 0.5), 20) }));
        const value = items.reduce((a, x) => a + ITEMS[x.id].sell * x.qty, 0);
        const gold = round5(value * BALANCE.balloonPay * studPay());
        Object.assign(b, {
            status: 'here',
            expiresAt: n + stayOf(BALLOON_STAY),
            items,
            gold,
            xp: Math.round(gold * BALANCE.balloonXp * xpBonus()),
            mats: [pickRand(RARE), pickRand(RARE)],
        });
        if (view.started && !view.hidden) {
            toast('Une montgolfière se pose dans le pré !', ['ui', 'balloon']);
            tip('balloon');
            sfx('level');
        }
        return true;
    }
    if (b.status === 'here' && n >= b.expiresAt) {
        if (view.started) toast('La montgolfière s’est envolée', ['ui', 'balloon']);
        Object.assign(b, { status: 'away', items: [], arriveAt: n + BALLOON_AWAY });
        return true;
    }
    return false;
}

export function sendBalloon(at) {
    const b = state.balloon;
    if (b.status !== 'here' || !hasAll(b.items)) return false;
    payItems(b.items);
    sfx('level');
    buzz(30);
    burst(at, 'sparkle', 16);
    earn(b.gold, at);
    addXp(b.xp, at);
    b.mats.forEach(m => giveRare(m, 1, at));
    state.stats.balloons = (state.stats.balloons || 0) + 1;
    state.income.orders += b.gold;
    emit('balloonLeaves');
    Object.assign(b, { status: 'away', items: [], arriveAt: now() + BALLOON_AWAY });
    toast('La montgolfière s’envole, chargée de vos produits !', ['ui', 'balloon']);
    return true;
}

// Tout ce que demandent en ce moment les commandes, le train, la montgolfière, l'acheteur pressé et les chantiers
export function wantedItems() {
    const w = new Set();
    state.quests.forEach(q => isOpen(q) && q.items.forEach(x => state.inventory[x.id] < x.qty && w.add(x.id)));
    if (state.truck.status === 'here') state.truck.slots.forEach(sl => !sl.pk && !sl.loaded && state.inventory[sl.id] < sl.qty && w.add(sl.id));
    if (state.balloon.status === 'here') state.balloon.items.forEach(x => state.inventory[x.id] < x.qty && w.add(x.id));
    if (state.incident && state.incident.type === 'express') state.incident.items.forEach(x => w.add(x.id));
    Object.values(PROJECTS).forEach(p => projectOpen(p.id) && Object.keys(p.need).forEach(id => projectLeft(p.id, id) > state.inventory[id] && w.add(id)));
    defiWanted().forEach(id => w.add(id));
    return w;
}
