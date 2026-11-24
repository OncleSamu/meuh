// La maison de la ferme et Théo, le commis ; coûts en pièces et matériaux.
import { state, lvOk, skill } from '../core/state.js';
import { emit, toast, sfx, buzz, burst } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { MACHINE_SLOTS } from '../data/machines.js';
import { VILLAGERS } from '../data/village.js';
import { FETE_END } from '../data/world.js';
import { HOUSE, FARMHAND } from '../data/progress.js';
import { THEO_OPTS } from '../data/team.js';
import { DOMAINE, DOMAINE_IDS, DOMAINE_COINS, DOMAINE_MATS, PLAN_UPGRADE, WORKS, WORK_IDS, WORKS_COINS, WORKS_MATS } from '../data/domaine.js';
import { domaineOpen, domLvl, domMax, domStepSum, planUpLvl, planUpMax, worksOpen, workLvl, workMax } from './estate.js';
import { spend, addXp, speedMult } from './player.js';
import { chapterOpen, projectDone } from './story.js';
import { addPhoto } from './style.js';
import { ensureQuests } from './orders.js';
import { ensureStall } from './stall.js';
import { resetPlot, harvestPlot, plotRate } from './farm.js';
import { barnBlocked, barnSpace } from './barn.js';
import { mSlotsBonus } from './buildings.js';

// ---------------- coûts en pièces et matériaux ----------------
export const hasCost = c => Object.entries(c).every(([k, n]) => (k === 'coins' ? state.money >= n : (state.inventory[k] || 0) >= n));
export function payCost(c) {
    Object.entries(c).forEach(([k, n]) => (k === 'coins' ? spend(n) : (state.inventory[k] -= n)));
}
// [{ icon, n, ok, name }] pour afficher un coût
export const costParts = c =>
    Object.entries(c).map(([k, n]) => ({
        icon: k === 'coins' ? ['ui', 'coin'] : ['item', k],
        n,
        ok: (k === 'coins' ? state.money : state.inventory[k] || 0) >= n,
        name: k === 'coins' ? 'Pièces' : ITEMS[k].name,
    }));

// ---------------- villageois présents ----------------
export const villagerHere = id => !VILLAGERS[id].ch || chapterOpen(VILLAGERS[id].ch);
export const presentVillagers = () => Object.keys(VILLAGERS).filter(villagerHere);

// ---------------- la maison ----------------
export const houseLvl = () => (state.house && state.house.lvl) || 0;
export const houseNext = () => HOUSE[houseLvl() + 1] || null;
export const houseCanUp = () => {
    const n = houseNext();
    return !!n && state.level >= n.lvl && hasCost(n.cost);
};
// bonus cumulés de la maison et des chantiers
export const extraOrders = () => (houseLvl() >= 2 ? 1 : 0) + (projectDone('hall') ? 1 : 0) + domStepSum('trade', 'orders') + skill('notice');
export const machineSlots = type => MACHINE_SLOTS + (houseLvl() >= 3 ? 1 : 0) + domStepSum('kitchen') + skill('bigQueue') + (type ? mSlotsBonus(type) : 0);
export const extraStall = () => (houseLvl() >= 4 ? 1 : 0) + (houseLvl() >= 6 ? 1 : 0) + (projectDone('washhouse') ? 1 : 0) + domStepSum('trade', 'stall');
export const houseBarn = () => (houseLvl() >= 1 ? 40 : 0) + (houseLvl() >= 6 ? 80 : 0) + domStepSum('barn');
export const housePay = () => (houseLvl() >= 5 ? 1.1 : 1);
export const feteEnd = () => FETE_END + (projectDone('hall') ? 2 : 0);
export const machineBoost = type => (projectDone('windmill') && (type === 'mill' || type === 'oilmill') ? 1.25 : 1);
export const studPay = () => (projectDone('stud') ? 1.15 : 1);

export function upgradeHouse(at) {
    const n = houseNext();
    if (!n || state.level < n.lvl || !hasCost(n.cost)) return false;
    payCost(n.cost);
    state.house.lvl++;
    state.stats.houseMax = Math.max(state.stats.houseMax || 0, state.house.lvl);
    sfx('level');
    buzz(30);
    burst(at, 'sparkle', 18);
    emit('confetti');
    toast(`${n.name} : ${n.bonus.toLowerCase()}`, ['ui', 'house']);
    addPhoto('house', state.house.lvl, n.name, 'La maison s’agrandit');
    ensureQuests();
    ensureStall();
    return true;
}

// ---------------- le commis de ferme ----------------
export const handLvl = () => (state.farmhand && state.farmhand.lvl) || 0;
export const handNext = () => FARMHAND[handLvl() + 1] || null;
export const handCanUp = () => {
    const n = handNext();
    return !!(handLvl() && n && state.level >= n.lvl && hasCost(n.cost));
};
let handMsg = '';
export const handMessage = () => handMsg;

// 1.111 : Théo peut être mis en pause (il ne récolte plus, ne replante plus, n'arrose plus, même pendant l'absence)
export const handPaused = () => !!(state.farmhand && state.farmhand.off);
export function toggleHand() {
    if (!handLvl()) return false;
    state.farmhand.off = !state.farmhand.off;
    toast(state.farmhand.off ? 'Théo est en pause : le champ est à vous' : 'Théo reprend le travail', ['villager', 'theo']);
    return true;
}
// 1.173 : options fin de partie de Théo (« Inclure la Serre » et « Suivre le Plan actif »)
export const handGhCan = () => handLvl() >= THEO_OPTS.ghLvl && !!(state.greenhouse && state.greenhouse.built);
export const handGhOn = () => handGhCan() && !!(state.farmhand && state.farmhand.gh);
export function toggleHandGh() {
    if (!handGhCan()) return false;
    state.farmhand.gh = !state.farmhand.gh;
    toast(state.farmhand.gh ? 'Théo s’occupe maintenant aussi de la serre' : 'Théo ne touche plus à la serre', ['villager', 'theo']);
    return true;
}
export const handPlanCan = () => handLvl() >= THEO_OPTS.planLvl;
export const handFollowPlanOn = () => handPlanCan() && !!(state.farmhand && state.farmhand.followPlan);
export function toggleHandFollowPlan() {
    if (!handPlanCan()) return false;
    state.farmhand.followPlan = !state.farmhand.followPlan;
    toast(state.farmhand.followPlan ? 'Théo suit désormais le Plan actif' : 'Théo replante la culture précédente', ['villager', 'theo']);
    return true;
}
// branché par team.js pour éviter tout import circulaire avec plan.js
let planCropPicker = null;
export function setPlanCropPicker(fn) {
    planCropPicker = fn;
}

export function handZone() {
    const l = handLvl();
    if (!l || handPaused()) return [];
    const out = [];
    for (let i = 0; i < state.grid.length && out.length < FARMHAND[l].plots + domStepSum('field'); i++) if (state.grid[i].isUnlocked) out.push(i);
    return out;
}

// replante une culture précise (plan actif) ou la culture que le joueur avait mise sur cette parcelle
function handPlant(p, isGh = false, forcedId = null) {
    const cid = forcedId || p.hand;
    const d = ITEMS[cid];
    if (!d || d.type !== 'crop' || d.island || (!isGh && d.ghOnly) || !lvOk(d)) return false;
    if (state.seeds[d.id] > 0) state.seeds[d.id]--;
    else if (!d.exotic && state.money >= d.cost * 4) spend(d.cost);
    else return false;
    if (!isGh) p.terrain = 'plowed';
    resetPlot(p, d.id);
    p.isWatered = true;
    return true;
}

function pickPlanCrop(isGh) {
    if (!handFollowPlanOn() || !planCropPicker) return null;
    return planCropPicker(isGh) || null;
}

// Un passage du commis : récolter, replanter, arroser (champ + serre optionnelle)
export function handPass() {
    let harvested = 0,
        xp = 0,
        planted = 0,
        watered = 0;
    const tend = (p, isGh) => {
        if (p.pest) return;
        if (p.itemId && ITEMS[p.itemId] && ITEMS[p.itemId].type === 'crop') p.hand = p.itemId;
        if (p.isReady) {
            if (barnBlocked(true)) return;
            const r = harvestPlot(p);
            harvested += r.qty;
            xp += r.item.xp;
        }
        if (!p.itemId) {
            const planId = pickPlanCrop(isGh);
            if ((planId && handPlant(p, isGh, planId)) || (p.hand && handPlant(p, isGh))) planted++;
        }
        if (p.itemId && !p.isReady && !p.isWatered) {
            p.isWatered = true;
            watered++;
        }
    };
    for (const i of handZone()) tend(state.grid[i], false);
    if (!handPaused() && handGhOn()) {
        for (const p of state.greenhouse.plots || []) if (p && p.isUnlocked) tend(p, true);
    }
    if (xp) addXp(xp);
    if (harvested || planted || watered) {
        state.stats.handWork = (state.stats.handWork || 0) + harvested;
        handMsg = harvested
            ? `Théo a récolté ${harvested} produit${harvested > 1 ? 's' : ''}`
            : planted
              ? `Théo a replanté ${planted} parcelle${planted > 1 ? 's' : ''}`
              : `Théo a arrosé ${watered} parcelle${watered > 1 ? 's' : ''}`;
        return true;
    }
    return false;
}

export function handTick() {
    const l = handLvl();
    if (!l) return false;
    const h = state.farmhand;
    h.t = (h.t || 0) + 1;
    if (h.t < FARMHAND[l].every) return false;
    h.t = 0;
    return handPass();
}

// Pendant l'absence : chaque parcelle de la zone enchaîne pousses et récoltes (champ + serre si incluse)
export function handOffline(elapsed) {
    const zone = handZone();
    let crops = 0;
    // 1.75 : la place en grange, comptée une fois puis tenue à jour (la recompter à chaque récolte coûtait cher)
    let space = barnSpace();
    const runPlot = (p, idx, isGh) => {
        if (p.pest) return;
        if (p.itemId && ITEMS[p.itemId] && ITEMS[p.itemId].type === 'crop') p.hand = p.itemId;
        let t = elapsed;
        for (let k = 0; k < 40 && t > 0; k++) {
            if (!p.itemId) {
                const planId = pickPlanCrop(isGh);
                if (!((planId && handPlant(p, isGh, planId)) || (p.hand && handPlant(p, isGh)))) break;
            }
            p.isWatered = true;
            const req = ITEMS[p.itemId].time / speedMult();
            if (!p.isReady) {
                const rate = plotRate(p, idx);
                const need = (req - p.growProgress) / rate;
                if (t < need) {
                    p.growProgress += t * rate;
                    break;
                }
                t -= need;
                p.isReady = true;
                p.growProgress = req;
            }
            if (ITEMS[p.itemId].type !== 'crop' || space <= 0) break;
            const r = harvestPlot(p);
            crops += r.qty;
            space -= r.qty;
            addXp(r.item.xp);
        }
    };
    for (const i of zone) runPlot(state.grid[i], i, false);
    if (!handPaused() && handGhOn()) {
        (state.greenhouse.plots || []).forEach((p, k) => p && p.isUnlocked && runPlot(p, 1000 + k, true));
    }
    return { zone: new Set(zone), crops };
}

export function upgradeHand(at) {
    if (!handCanUp()) return false;
    payCost(handNext().cost);
    state.farmhand.lvl++;
    sfx('level');
    buzz(25);
    burst(at, 'sparkle', 14);
    toast(`Théo s’occupe maintenant de ${FARMHAND[handLvl()].plots} parcelles`, ['villager', 'theo']);
    return true;
}

// ---------------- 1.20 : l'Amélioration du domaine ----------------
export const domCost = (b, n = domLvl(b) + 1) =>
    n > domMax() ? null : { coins: DOMAINE_COINS[n - 1], [DOMAINE[b].mats[0]]: DOMAINE_MATS[n - 1][0], [DOMAINE[b].mats[1]]: DOMAINE_MATS[n - 1][1] };
export const domCan = b => domaineOpen() && domLvl(b) < domMax() && hasCost(domCost(b));
// Tableau d'intendance : plans multi-plats et bières maison
export const planUpCost = (n = planUpLvl() + 1) =>
    n > planUpMax()
        ? null
        : { coins: PLAN_UPGRADE.coins[n - 1], [PLAN_UPGRADE.mats[0]]: PLAN_UPGRADE.matQty[n - 1][0], [PLAN_UPGRADE.mats[1]]: PLAN_UPGRADE.matQty[n - 1][1] };
export const planUpCan = () => domaineOpen() && planUpLvl() < planUpMax() && hasCost(planUpCost());
export const domReady = () => DOMAINE_IDS.filter(domCan).length + WORK_IDS.filter(gworkCan).length + (planUpCan() ? 1 : 0);
export const domTotal = () => DOMAINE_IDS.reduce((a, b) => a + domLvl(b), 0);
// 1.107 : les dépendances du domaine
export const workCost = (w, n = workLvl(w) + 1) =>
    n > workMax() ? null : { coins: WORKS_COINS[n - 1], [WORKS[w].mats[0]]: WORKS_MATS[n - 1][0], [WORKS[w].mats[1]]: WORKS_MATS[n - 1][1] };
export const gworkCan = w => worksOpen() && workLvl(w) < workMax() && hasCost(workCost(w));
export const worksTotal = () => WORK_IDS.reduce((a, w) => a + workLvl(w), 0);
// tout ce que le domaine a coûté en pièces (pour l'afficher)
export const domSpent = () =>
    DOMAINE_IDS.reduce((a, b) => a + DOMAINE_COINS.slice(0, domLvl(b)).reduce((x, y) => x + y, 0), 0) +
    PLAN_UPGRADE.coins.slice(0, planUpLvl()).reduce((x, y) => x + y, 0) +
    WORK_IDS.reduce((a, w) => a + WORKS_COINS.slice(0, workLvl(w)).reduce((x, y) => x + y, 0), 0);
export function buyPlanUp(at) {
    if (!planUpCan()) return false;
    payCost(planUpCost());
    state.domaine = state.domaine || {};
    state.domaine.planUp = planUpLvl() + 1;
    sfx('level');
    buzz(30);
    burst(at, 'sparkle', 18);
    emit('confetti');
    toast(`${PLAN_UPGRADE.name} : ${PLAN_UPGRADE.steps[planUpLvl() - 1].toLowerCase()}`, PLAN_UPGRADE.icon);
    return true;
}
export function buyWork(w, at) {
    if (!WORKS[w] || !gworkCan(w)) return false;
    payCost(workCost(w));
    state.works = state.works || {};
    state.works[w] = workLvl(w) + 1;
    state.stats.works = worksTotal();
    sfx('level');
    buzz(30);
    burst(at, 'sparkle', 18);
    emit('confetti');
    toast(`${WORKS[w].name} : ${WORKS[w].steps[workLvl(w) - 1].toLowerCase()}`, ['ui', 'house']);
    return true;
}
export function buyDomaine(b, at) {
    if (!DOMAINE[b] || !domCan(b)) return false;
    payCost(domCost(b));
    state.domaine = state.domaine || {};
    state.domaine[b] = domLvl(b) + 1;
    state.stats.domaine = domTotal();
    sfx('level');
    buzz(30);
    burst(at, 'sparkle', 18);
    emit('confetti');
    toast(`${DOMAINE[b].name} : ${DOMAINE[b].steps[domLvl(b) - 1][0].toLowerCase()}`, DOMAINE[b].icon);
    ensureQuests();
    ensureStall();
    return true;
}
