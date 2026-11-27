// Les commandes : tableau de commandes du village, train de marchandises (3 wagons) et montgolfière.
// C'est le vrai cœur de l'économie.
import { addRenom, RENOM } from './renom.js';
import { livingTrees } from './orchard.js';
import { pkTransportOk, pkReq, pkEstimate, pkHave, pullPk } from './maison.js';
import { pfTransportOk, pfReq, pfEstimate, pfHave, pullPf } from './perfume.js';
import { cfTransportOk, cfReq, cfEstimate, cfHave, pullCf } from './confiserie.js';
import { brTransportOk, brReq, brEstimate, brHave, pullBr } from './brewery.js';
import { islandOpen } from './island.js';
import { oasisOpen } from './oasis.js';
import { nordOpen } from './nord.js';
import { asieOpen } from './asie.js';
import { state, scaleLvl, lvOk, ecoLvl } from '../core/state.js';
import { now } from '../core/clock.js';
import { view } from '../core/view.js';
import { pickRand, round5 } from '../core/format.js';
import { emit, toast, sfx, buzz, burst, squish } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { QUALITY } from '../data/farm.js';
import { ANIMALS } from '../data/animals.js';
import { MACHINES, RECIPES } from '../data/machines.js';
import { VILLAGERS, BEST_FRIEND_BONUS, PROJECTS } from '../data/village.js';
import { RARE, ORDER_MAX, ORDER_REFILL, ORDER_TRASH_WAIT, GOLD_ORDER, ORDER_STREAK, TRAIN_STAY, TRAIN_AWAY, BALLOON_STAY, BALLOON_AWAY } from '../data/commerce.js';
import { BALANCE } from '../data/progress.js';
import { netOpen, transOpen } from './port.js';
import { storyOk, projectDone, projectOpen, projectLeft } from './story.js';
import { recipeUnlocked } from './workshop.js';
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
import { defiWanted, haveQ, takeQ } from './defis.js';
import { madeQ } from './neighbordish.js';
import { fishOrderOk } from './fishing.js';
import { cupHas } from './cup.js';
import { eldersMult } from './family.js';
import { metierOrderPay, metierTransportPay, metierPick, clientOrder } from './metier.js';
import { cargoHere } from './cargo.js';
import { armandHere, armandSlots, armandOrder, armandDealt, armandOff } from './armand.js';

// 1.175 : pré-calcul O(1) des machines, animaux, ruches et contrées pour accélérer questPool() et ensureQuests()
function makeCanProduce() {
    const memo = {};
    const treeMemo = {};
    const machSet = new Set(state.machines.map(m => m.type));
    const prodSet = new Set();
    for (const a of state.animals) {
        const d = ANIMALS[a.type];
        if (d) prodSet.add(d.prodId);
    }
    const net = netOpen();
    const trans = transOpen();
    const gh = !!(state.greenhouse && state.greenhouse.built);
    const isl = islandOpen();
    const oas = oasisOpen();
    const nrd = nordOpen();
    const asi = asieOpen();
    let hasHoney;
    const honeyOk = () =>
        hasHoney !== undefined
            ? hasHoney
            : (hasHoney = state.grid.some(p => p.deco === 'hive') || Object.values(state.apiary || {}).some(a => a && a.hives > 0));
    const treeOk = id => (id in treeMemo ? treeMemo[id] : (treeMemo[id] = livingTrees(id) > 0));

    const can = (id, depth = 0) => {
        if (id in memo) return memo[id];
        const i = ITEMS[id];
        let ok = false;
        if (!i || i.exotic || depth > 4) ok = false;
        else if (i.sea) ok = net && id !== 'lobster';
        else if (id === 'alpineMilk') ok = trans;
        else if (id === 'honey') ok = honeyOk();
        else if (i.type === 'crop')
            ok = lvOk(i) && storyOk(i) && (!i.ghOnly || gh) && (i.asie ? asi : i.nord ? nrd : i.oasis ? oas : !i.island || isl);
        else if (i.type === 'tree') ok = treeOk(i.id);
        else if (i.type === 'product') ok = prodSet.has(i.id);
        else if (i.type === 'fish') ok = fishOrderOk(id);
        // 1.104.1 : les boîtes de la Maison (bois, lingots, tissu) : demandées dès qu'on a l'emballerie
        else if (i.box) ok = machSet.has(RECIPES[id].machine) && recipeUnlocked(id);
        else if (i.type === 'artisan') {
            const r = RECIPES[id];
            ok = !!r && !r.fete && !r.holiday && machSet.has(r.machine) && recipeUnlocked(id) && Object.keys(r.ing).every(k => can(k, depth + 1));
        }
        return (memo[id] = ok);
    };
    return can;
}

// Ce que la ferme sait produire en ce moment (ingrédients compris)
export function questPool() {
    const can = makeCanProduce();
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

export const orderTarget = (L = ecoLvl()) => Math.max(30 + scaleLvl() * 22, L >= 20 ? 220 * Math.pow(1.06, L - 15) : 0);
export const orderMaxQty = (L = ecoLvl()) => Math.min(18, 12 + Math.floor(Math.max(0, L - 30) / 10));
export const orderStreak = () => {
    const s = state.orderStreak;
    return s && s.day === state.day ? s.n : 0;
};

export function makeOrder() {
    // 1.101 : chacun son tour : on évite de redonner une commande à un villageois qui en a déjà une sur le tableau
    const present = presentVillagers();
    const busy = new Set((state.quests || []).map(q => q && q.vid).filter(Boolean));
    const free = present.filter(v => !busy.has(v));
    const vid = pickRand(free.length ? free : present);
    const its = pickItems(orderCount(), VILLAGERS[vid].likes);
    if (!its.length) return null;
    const oldTarget = 30 + scaleLvl() * 22;
    const target = orderTarget();
    const maxQ = orderMaxQty();
    const rnds = its.map(() => 0.6 + Math.random() * 0.8);
    const items = its.map((it, k) => ({ id: it.id, qty: qtyFor(it, target * rnds[k], maxQ) }));
    const oldValue = its.reduce((a, it, k) => a + it.sell * qtyFor(it, oldTarget * rnds[k]), 0);
    // 1.183 : commandes dorées (dès le niveau 10, exige Argent ou Or sur un produit déjà produit à ce rang, prime +45 % pièces et +35 % XP)
    let goldOrder = false;
    if (state.level >= GOLD_ORDER.lvl && Math.random() < GOLD_ORDER.chance) {
        const cand = items.filter(x => madeQ(x.id, 1));
        if (cand.length) {
            const pick = pickRand(cand);
            pick.q = madeQ(pick.id, 2) && Math.random() < GOLD_ORDER.goldChance ? 2 : 1;
            pick.qty = Math.max(1, Math.min(pick.qty, GOLD_ORDER.qCap[pick.q]));
            goldOrder = true;
        }
    }
    const qMultOf = x => (x.q && QUALITY[x.q] ? QUALITY[x.q].mult : 1);
    const value = items.reduce((a, x) => a + ITEMS[x.id].sell * x.qty * qMultOf(x), 0);
    // la maîtrise et la maison paient plus, sans changer l'expérience
    const bonus =
        (items.reduce((a, x) => a + ITEMS[x.id].sell * masteryMult(x.id) * x.qty * qMultOf(x), 0) / Math.max(1, value)) *
        housePay() *
        (1 + workFx('post')) *
        metierOrderPay(items.map(x => x.id)); // 1.107 : le relais de poste ; 1.114 : le métier
    let mult = BALANCE.orderPay * (0.95 + Math.random() * 0.15);
    if (heartsOf(vid) >= 5) mult *= BEST_FRIEND_BONUS;
    if (vid === 'paul' && projectDone('bakery')) mult *= 1.2;
    if (projectDone('townhall')) mult *= 1.1;
    mult *= (1 + rank('loyal') * 0.1) * (1 + state.upgrades.price * 0.04);
    // 1.38 : +3 % par niveau au-delà de 50 (pièces seulement) ; 1.183 : prime dorée
    const gold = round5(value * mult * bonus * (goldOrder ? GOLD_ORDER.payMult : 1) * (1 + 0.03 * Math.max(0, ecoLvl() - 50)) * (cupHas(5) ? 1.05 : 1));
    const xp = Math.max(5, Math.round(oldValue * mult * BALANCE.orderXp * (goldOrder ? GOLD_ORDER.xpMult : 1) * xpBonus()));
    const matChance = goldOrder ? GOLD_ORDER.matChance : 0.15;
    return {
        items,
        gold,
        xp,
        vid,
        mat: Math.random() < matChance ? pickRand(RARE) : null,
        goldOrder,
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
        const can = makeCanProduce();
        state.quests.forEach((q, i) => {
            if (isOpen(q) && q.items.some(x => ITEMS[x.id]?.type === 'fish' || !can(x.id))) {
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
export const itemHave = x =>
    x.pk
        ? pkHave(x.pk)
        : x.pf
          ? pfHave(x.pf)
          : x.cf
            ? cfHave(x.cf)
            : x.br
              ? brHave(x.br)
              : x.q
                ? haveQ(x.id, x.q)
                : state.inventory[x.id] || 0;
export const hasAll = items => items.every(x => itemHave(x) >= x.qty);
export const checkQuestReady = q => isOpen(q) && hasAll(q.items);

export function payItems(items) {
    items.forEach(x => {
        if (x.pk) pullPk(x.pk, x.qty);
        else if (x.pf) pullPf(x.pf, x.qty);
        else if (x.cf) pullCf(x.cf, x.qty);
        else if (x.br) pullBr(x.br, x.qty);
        else if (x.q) takeQ(x.id, x.qty, x.q);
        else {
            state.inventory[x.id] -= x.qty;
            clampQuality(x.id);
        }
    });
}

export function turnInQuest(i, at) {
    const q = state.quests[i];
    if (!checkQuestReady(q)) return false;
    payItems(q.items);
    state.stats.orders++;
    if (q.goldOrder) state.stats.goldOrders = (state.stats.goldOrders || 0) + 1;
    state.income.orders += q.gold;
    record('order', q.gold);
    const favPts = VILLAGERS[q.vid].likes.some(id => q.items.some(x => x.id === id)) ? 4 : 2;
    if (q.vid) addFriendship(q.vid, favPts + (q.goldOrder ? 1 : 0), at);
    sfx('buy');
    buzz(15);
    burst(at, 'sparkle', q.goldOrder ? 16 : 12);
    earn(q.gold, at);
    addXp(q.xp, at);
    if (q.mat) giveRare(q.mat, 1, at);
    else rollRare(0.1, at);
    // 1.183 : série quotidienne (tous les 5 livraisons du jour : prime pièces + 1 matériau rare + 1 Renom)
    const cur = orderStreak() + 1;
    state.orderStreak = { day: state.day, n: cur };
    if (cur % ORDER_STREAK.step === 0) {
        const sBonus = round5(q.gold * ORDER_STREAK.bonus);
        if (sBonus > 0) {
            earn(sBonus, at);
            state.income.orders += sBonus;
        }
        giveRare(pickRand(RARE), 1, at);
        addRenom(RENOM.streak, 'streak', false);
        if (view.started) toast(`Série de ${cur} commandes : +${sBonus} pièces, +1 matériau rare et +1 Renom !`, ['ui', 'star']);
    }
    state.quests[i] = emptyOrder(now() + ORDER_REFILL);
    return true;
}

// 1.136 : toutes les commandes prêtes d'un coup, dans l'ordre du tableau ; chacune revérifie le stock qui reste
export const questsReady = () => state.quests.filter(checkQuestReady).length;
export function turnInAll(at) {
    let n = 0;
    state.quests.forEach((q, i) => {
        if (turnInQuest(i, at)) n++;
    });
    if (n > 1) toast(`${n} commandes livrées`, ['ui', 'scroll']);
    return n;
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
    if (it.asie) return 'Terres d’Asie';
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
        return id === 'cardamom' ? 'Traîneau du Grand Nord' : id === 'starAnise' ? 'Jonque des Terres d’Asie' : '';
    }
    const r = RECIPES[id];
    return r && MACHINES[r.machine] ? MACHINES[r.machine].name : '';
}
// combien sont déjà en route à l'atelier
export const inProduction = id => state.machines.reduce((n, m) => n + m.queue.filter(q => q === id).length + (m.out[id] || 0), 0);

// ---------------- le train de marchandises ----------------
// 1.104.1 : paquets de la Maison ; 1.146 : parfums maison ; 1.183 : confiseries et boissons de la Brasserie
const TRAIN_PK = 0.35,
    TRAIN_PK_PAY = 1.6,
    TRAIN_PF = 0.3,
    TRAIN_PF_PAY = 1.75,
    TRAIN_CF = 0.35,
    TRAIN_CF_PAY = 1.75,
    TRAIN_BR = 0.35,
    TRAIN_BR_PAY = 1.7;
// 1.106 : la valeur de marchandises demandée par wagon. Avant, elle grandissait en ligne droite (1 250 au niveau 60) alors que
// la production de la ferme double tous les huit niveaux : un train plein ne pesait plus rien. Elle suit maintenant la production
// (environ 600 au niveau 15, 5 000 au niveau 40, 30 000 au niveau 60), et un wagon peut demander jusqu'à 60 produits.
export const wagonTarget = (L = ecoLvl()) => Math.max(60 + scaleLvl() * 30, L >= 15 ? 400 * Math.pow(1.09, L - 10) : 0);
export const wagonMax = (L = ecoLvl()) => Math.round(Math.min(60, 20 + Math.max(0, L - 30) * 1.34));
export const slotHave = sl =>
    sl.pk
        ? pkHave(sl.pk) >= sl.qty
        : sl.pf
          ? pfHave(sl.pf) >= sl.qty
          : sl.cf
            ? cfHave(sl.cf) >= sl.qty
            : sl.br
              ? brHave(sl.br) >= sl.qty
              : (state.inventory[sl.id] || 0) >= sl.qty;
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

function makeSpecialtyWagon(kind, mult) {
    if (kind === 'pk') {
        const pk = pkReq();
        const qty = 1 + Math.floor(Math.random() * 2);
        const gold = round5(pkEstimate(pk) * qty * TRAIN_PK_PAY * mult);
        return { id: 'paquet', pk, qty, mult, loaded: false, gold, xp: Math.max(5, Math.round(gold * BALANCE.truckXp * xpBonus() * 2)), mat: Math.random() < 0.5 ? pickRand(RARE) : null };
    }
    if (kind === 'pf') {
        const pf = pfReq();
        const qty = 1 + Math.floor(Math.random() * 2);
        const gold = round5(pfEstimate(pf) * qty * TRAIN_PF_PAY * mult);
        return { id: 'perfumeCustom', pf, qty, mult, loaded: false, gold, xp: Math.max(5, Math.round(gold * BALANCE.truckXp * xpBonus() * 2)), mat: Math.random() < 0.5 ? pickRand(RARE) : null };
    }
    if (kind === 'cf') {
        const cf = cfReq();
        const qty = 2 + Math.floor(Math.random() * 3);
        const gold = round5(cfEstimate(cf) * qty * TRAIN_CF_PAY * mult);
        return { id: 'confCustom', cf, qty, mult, loaded: false, gold, xp: Math.max(5, Math.round(gold * BALANCE.truckXp * xpBonus() * 2)), mat: Math.random() < 0.5 ? pickRand(RARE) : null };
    }
    const br = brReq();
    const qty = 2 + Math.floor(Math.random() * 3);
    const gold = round5(brEstimate(br) * qty * TRAIN_BR_PAY * mult);
    return { id: 'brewCustom', br, qty, mult, loaded: false, gold, xp: Math.max(5, Math.round(gold * BALANCE.truckXp * xpBonus() * 2)), mat: Math.random() < 0.5 ? pickRand(RARE) : null };
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
    // 1.104.1, 1.146 & 1.183 : jusqu'à deux wagons d'ateliers spécialisés (paquets, parfums, confiseries, brasserie)
    const specPool = [];
    if (pkTransportOk()) specPool.push(['pk', TRAIN_PK]);
    if (pfTransportOk()) specPool.push(['pf', TRAIN_PF]);
    if (cfTransportOk()) specPool.push(['cf', TRAIN_CF]);
    if (brTransportOk()) specPool.push(['br', TRAIN_BR]);
    if (specPool.length) {
        const first = pickRand(specPool);
        if (Math.random() < Math.min(0.65, first[1] + (specPool.length - 1) * 0.1)) {
            slots[2] = makeSpecialtyWagon(first[0], mult);
            const rest = specPool.filter(x => x[0] !== first[0]);
            if (rest.length && Math.random() < 0.25) {
                const second = pickRand(rest);
                slots[1] = makeSpecialtyWagon(second[0], mult);
            }
        }
    }
    const isSpec = sl => !!(sl.pk || sl.pf || sl.cf || sl.br);
    const sum = slots.reduce((a, sl) => a + sl.gold, 0);
    const xpSum = slots.reduce((a, sl) => a + (isSpec(sl) ? sl.xp / 2 : sl.xp), 0);
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

export function dismissTruck() {
    const t = state.truck;
    if (!t || t.status !== 'here') return false;
    sfx('click');
    truckLeave();
    return true;
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
    } else if (sl.pf) {
        const val = pullPf(sl.pf, sl.qty);
        sl.gold = round5(val * TRAIN_PF_PAY * (sl.mult || 1));
        sl.xp = Math.max(5, Math.round(sl.gold * BALANCE.truckXp * xpBonus() * 2));
    } else if (sl.cf) {
        const val = pullCf(sl.cf, sl.qty);
        sl.gold = round5(val * TRAIN_CF_PAY * (sl.mult || 1));
        sl.xp = Math.max(5, Math.round(sl.gold * BALANCE.truckXp * xpBonus() * 2));
    } else if (sl.br) {
        const val = pullBr(sl.br, sl.qty);
        sl.gold = round5(val * TRAIN_BR_PAY * (sl.mult || 1));
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

// ---------------- la montgolfière (1.183 : courrier express de prestige, petites quantités de qualité Or/Argent ou créations d'atelier + Renom) ----------------
export const balloonOpen = () => projectDone('inn');
export const balloonTarget = (L = ecoLvl()) => Math.max(90 + scaleLvl() * 40, L >= 15 ? 360 * Math.pow(1.085, L - 10) : 0);

export function balloonTick() {
    if (!balloonOpen()) return false;
    const b = state.balloon,
        n = now();
    if (b.status === 'away' && n >= b.arriveAt) {
        const target = balloonTarget();
        const minSell = target / 15 / 1.5;
        const its = pickItems(8)
            .map((it, k) => [it, k])
            .sort((x, y) => (y[0].sell >= minSell) - (x[0].sell >= minSell) || x[1] - y[1])
            .slice(0, 3)
            .map(x => x[0]);
        if (its.length < 3) {
            b.arriveAt = n + 60000;
            return false;
        }
        const oldTarget = 90 + scaleLvl() * 40;
        const rnds = its.map(() => 0.8 + Math.random() * 0.5);
        const items = its.map((it, k) => ({ id: it.id, qty: qtyFor(it, target * rnds[k], 15) }));
        const oldValue = its.reduce((a, it, k) => a + it.sell * qtyFor(it, oldTarget * rnds[k], 20), 0);
        // Ligne de prestige qualité Argent/Or sur un produit déjà maîtrisé à ce rang
        let prestige = false;
        if (state.level >= GOLD_ORDER.lvl) {
            const qCand = items.slice(0, 2).filter(x => madeQ(x.id, 1));
            if (qCand.length && Math.random() < 0.7) {
                const pick = pickRand(qCand);
                pick.q = madeQ(pick.id, 2) && Math.random() < 0.5 ? 2 : 1;
                pick.qty = Math.max(1, Math.min(pick.qty, pick.q === 2 ? 2 : 4));
                prestige = true;
            }
        }
        // 3e ligne : parfois une création d'atelier (parfum, confiserie ou cuvée d'abbaye)
        const craftPool = [];
        if (pfTransportOk()) craftPool.push('pf');
        if (cfTransportOk()) craftPool.push('cf');
        if (brTransportOk()) craftPool.push('br');
        if (craftPool.length && Math.random() < 0.55) {
            const cKind = pickRand(craftPool);
            if (cKind === 'pf') {
                const pf = pfReq();
                const qty = 1;
                items[2] = { id: 'perfumeCustom', pf, qty, est: Math.round(pfEstimate(pf) * 1.65) };
            } else if (cKind === 'cf') {
                const cf = cfReq();
                const qty = 1 + Math.floor(Math.random() * 2);
                items[2] = { id: 'confCustom', cf, qty, est: Math.round(cfEstimate(cf) * 1.65) };
            } else {
                const br = brReq();
                const qty = 1 + Math.floor(Math.random() * 2);
                items[2] = { id: 'brewCustom', br, qty, est: Math.round(brEstimate(br) * 1.6) };
            }
            prestige = true;
        }
        const lineVal = x => (x.est ? x.est * x.qty : ITEMS[x.id].sell * x.qty * (x.q && QUALITY[x.q] ? QUALITY[x.q].mult : 1));
        const value = items.reduce((a, x) => a + lineVal(x), 0);
        const prestigeMult = prestige ? 1.2 : 1;
        const gold = round5(value * BALANCE.balloonPay * studPay() * prestigeMult);
        const xp = Math.round(oldValue * BALANCE.balloonPay * studPay() * BALANCE.balloonXp * (prestige ? 1.25 : 1) * xpBonus());
        Object.assign(b, {
            status: 'here',
            expiresAt: n + stayOf(BALLOON_STAY),
            items,
            gold,
            xp,
            prestige,
            renom: RENOM.balloon,
            mats: [pickRand(RARE), pickRand(RARE)],
        });
        if (view.started && !view.hidden) {
            toast('Une montgolfière express se pose dans le pré !', ['ui', 'balloon']);
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
    let totalGold = b.gold;
    // Si la nacelle contient une création artisanale, on recalcule sa part sur la valeur réelle prélevée
    const hasSpec = b.items.some(x => x.pf || x.cf || x.br || x.pk);
    if (hasSpec) {
        let stdVal = 0;
        let specVal = 0;
        b.items.forEach(x => {
            if (x.pf) specVal += pullPf(x.pf, x.qty) * 1.65;
            else if (x.cf) specVal += pullCf(x.cf, x.qty) * 1.65;
            else if (x.br) specVal += pullBr(x.br, x.qty) * 1.6;
            else if (x.pk) specVal += pullPk(x.pk, x.qty) * 1.6;
            else {
                if (x.q) takeQ(x.id, x.qty, x.q);
                else {
                    state.inventory[x.id] -= x.qty;
                    clampQuality(x.id);
                }
                stdVal += ITEMS[x.id].sell * x.qty * (x.q && QUALITY[x.q] ? QUALITY[x.q].mult : 1);
            }
        });
        totalGold = Math.max(b.gold, round5((stdVal + specVal) * BALANCE.balloonPay * studPay() * (b.prestige ? 1.2 : 1)));
    } else {
        payItems(b.items);
    }
    sfx('level');
    buzz(30);
    burst(at, 'sparkle', 16);
    earn(totalGold, at);
    addXp(b.xp, at);
    b.mats.forEach(m => giveRare(m, 1, at));
    addRenom(b.renom || RENOM.balloon, 'balloon', at);
    state.stats.balloons = (state.stats.balloons || 0) + 1;
    state.income.orders += totalGold;
    emit('balloonLeaves');
    Object.assign(b, { status: 'away', items: [], arriveAt: now() + BALLOON_AWAY });
    toast('La montgolfière s’envole, chargée de votre courrier express !', ['ui', 'balloon']);
    return true;
}

export function dismissBalloon() {
    const b = state.balloon;
    if (!b || b.status !== 'here') return false;
    Object.assign(b, { status: 'away', items: [], arriveAt: now() + BALLOON_AWAY });
    sfx('click');
    if (view.started) toast('La montgolfière repart à vide', ['ui', 'balloon']);
    return true;
}

// Tout ce que demandent en ce moment les commandes, les transports (train, montgolfière, bateau, avion-cargo), Armand, l'acheteur pressé et les chantiers
const isStd = x => !!x && !x.pk && !x.pf && !x.cf && !x.br && !!ITEMS[x.id];
export function wantedItems() {
    const w = new Set();
    state.quests.forEach(q => isOpen(q) && q.items.forEach(x => isStd(x) && itemHave(x) < x.qty && w.add(x.id)));
    if (state.truck.status === 'here') state.truck.slots.forEach(sl => isStd(sl) && !sl.loaded && (state.inventory[sl.id] || 0) < sl.qty && w.add(sl.id));
    if (state.balloon.status === 'here') state.balloon.items.forEach(x => isStd(x) && itemHave(x) < x.qty && w.add(x.id));
    if (state.boat && state.boat.status === 'here')
        (state.boat.items || []).forEach(cr => isStd(cr) && !cr.loaded && (state.inventory[cr.id] || 0) < cr.qty && w.add(cr.id));
    if (cargoHere() && state.cargo && !state.cargo.done)
        (state.cargo.holds || []).forEach(h => isStd(h) && h.got < h.qty && (state.inventory[h.id] || 0) < h.qty - h.got && w.add(h.id));
    if (armandHere()) {
        for (let i = 0; i < armandSlots(); i++) {
            const o = armandOrder(i);
            if (o && !o.done && armandDealt(o) && !armandOff(o) && ITEMS[o.id] && (state.inventory[o.id] || 0) < o.qty - o.got) w.add(o.id);
        }
    }
    if (state.incident && state.incident.type === 'express') state.incident.items.forEach(x => w.add(x.id));
    Object.values(PROJECTS).forEach(p => projectOpen(p.id) && Object.keys(p.need).forEach(id => projectLeft(p.id, id) > state.inventory[id] && w.add(id)));
    defiWanted().forEach(id => w.add(id));
    return w;
}
