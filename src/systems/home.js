// La maison de la ferme et Théo, le commis ; coûts en pièces et matériaux.
import { state, lvOk } from '../core/state.js';
import { emit, toast, sfx, buzz, burst } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { MACHINE_SLOTS } from '../data/machines.js';
import { VILLAGERS } from '../data/village.js';
import { FETE_END } from '../data/world.js';
import { HOUSE, FARMHAND } from '../data/progress.js';
import { spend, addXp, speedMult } from './player.js';
import { chapterOpen, projectDone } from './story.js';
import { addPhoto } from './style.js';
import { ensureQuests } from './orders.js';
import { ensureStall } from './stall.js';
import { resetPlot, harvestPlot, plotRate } from './farm.js';
import { barnBlocked } from './barn.js';
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
export const extraOrders = () => (houseLvl() >= 2 ? 1 : 0) + (projectDone('hall') ? 1 : 0);
export const machineSlots = type => MACHINE_SLOTS + (houseLvl() >= 3 ? 1 : 0) + (type ? mSlotsBonus(type) : 0);
export const extraStall = () => (houseLvl() >= 4 ? 1 : 0) + (projectDone('washhouse') ? 1 : 0);
export const houseBarn = () => (houseLvl() >= 1 ? 40 : 0);
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

export function handZone() {
    const l = handLvl();
    if (!l) return [];
    const out = [];
    for (let i = 0; i < state.grid.length && out.length < FARMHAND[l].plots; i++) if (state.grid[i].isUnlocked) out.push(i);
    return out;
}

// replante la culture que le joueur avait mise sur cette parcelle
function handPlant(p) {
    const d = ITEMS[p.hand];
    if (!d || d.type !== 'crop' || !lvOk(d)) return false;
    if (state.seeds[d.id] > 0) state.seeds[d.id]--;
    else if (!d.exotic && state.money >= d.cost * 4) spend(d.cost);
    else return false;
    p.terrain = 'plowed';
    resetPlot(p, d.id);
    p.isWatered = true;
    return true;
}

// Un passage du commis : récolter, replanter, arroser
export function handPass() {
    let harvested = 0,
        xp = 0,
        planted = 0,
        watered = 0;
    for (const i of handZone()) {
        const p = state.grid[i];
        if (p.pest) continue;
        if (p.itemId && ITEMS[p.itemId].type === 'crop') p.hand = p.itemId;
        if (p.isReady) {
            if (barnBlocked(true)) continue;
            const r = harvestPlot(p);
            harvested += r.qty;
            xp += r.item.xp;
        }
        if (!p.itemId && p.hand && handPlant(p)) planted++;
        if (p.itemId && !p.isReady && !p.isWatered) {
            p.isWatered = true;
            watered++;
        }
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

// Pendant l'absence : chaque parcelle de la zone enchaîne pousses et récoltes
export function handOffline(elapsed) {
    const zone = handZone();
    let crops = 0;
    for (const i of zone) {
        const p = state.grid[i];
        if (p.pest) continue;
        if (p.itemId && ITEMS[p.itemId].type === 'crop') p.hand = p.itemId;
        let t = elapsed;
        for (let k = 0; k < 40 && t > 0; k++) {
            if (!p.itemId) {
                if (!p.hand || !handPlant(p)) break;
            }
            p.isWatered = true;
            const req = ITEMS[p.itemId].time / speedMult();
            if (!p.isReady) {
                const need = (req - p.growProgress) / plotRate(p, i);
                if (t < need) {
                    p.growProgress += t * plotRate(p, i);
                    break;
                }
                t -= need;
                p.isReady = true;
                p.growProgress = req;
            }
            if (ITEMS[p.itemId].type !== 'crop' || barnBlocked(true)) break;
            const r = harvestPlot(p);
            crops += r.qty;
            addXp(r.item.xp);
        }
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
