// 1.11 : la nature repensée — charbonnière, ouvriers (bûcheron, mineur), défi de Gaspard, carnet du mineur.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { view } from '../core/view.js';
import { round5 } from '../core/format.js';
import { toast, sfx, burst, emit } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { KILN, WORKERS, WORKER_EVERY, workerCap, NAT_LOG, GASPARD, SPECIES } from '../data/nature.js';
import { earn, addXp } from './player.js';
import { hasCost, payCost } from './home.js';
import { addFriendship } from './village.js';
import { ensureNat, depthOpen, onNatureHit, natGot } from './nature.js';

// ---------------- la charbonnière ----------------
export const kilnOpen = () => state.level >= KILN.lvl;
export function buildKiln(at) {
    const n = ensureNat();
    if (!kilnOpen() || n.kiln) return false;
    if (!hasCost(KILN.build)) {
        sfx('error');
        toast('Il manque du bois, de la pierre ou des pièces', ['ui', 'charcoalKiln']);
        return false;
    }
    payCost(KILN.build);
    n.kiln = { start: 0, done: false };
    sfx('level');
    burst(at, 'sparkle', 10);
    return true;
}
export const kilnBusy = () => !!(state.nat && state.nat.kiln && state.nat.kiln.start);
export const kilnReady = () => kilnBusy() && now() - state.nat.kiln.start >= KILN.time;
export function kilnLight(at) {
    const k = ensureNat().kiln;
    if (!k || k.start || state.inventory.wood < KILN.wood) return false;
    state.inventory.wood -= KILN.wood;
    k.start = now();
    sfx('click');
    burst(at, 'sparkle', 6);
    return true;
}
export function kilnTake(at) {
    if (!kilnReady()) return false;
    state.nat.kiln.start = 0;
    state.inventory.coal = (state.inventory.coal || 0) + KILN.coal;
    natGot('coal', KILN.coal);
    emit('float', { at, parts: [`+${KILN.coal}`, ['item', 'coal']], cls: '', dy: -30, delay: 0 });
    sfx('coin');
    return true;
}

// ---------------- les ouvriers ----------------
export const workerOpen = k => state.level >= WORKERS[k].lvl;
export const workerLvl = k => (state.nat && state.nat.workers[k] && state.nat.workers[k].lvl) || 0;
export const workerNext = k => WORKERS[k].up[workerLvl(k) - 1] || null;
export function hireWorker(k, at) {
    const n = ensureNat();
    if (!workerOpen(k) || n.workers[k].lvl > 0) return false;
    if (!hasCost(WORKERS[k].hire)) {
        sfx('error');
        toast('Il manque des pièces ou des matériaux', ['ui', WORKERS[k].icon]);
        return false;
    }
    payCost(WORKERS[k].hire);
    n.workers[k] = { lvl: 1, at: now() };
    sfx('level');
    emit('confetti');
    burst(at, 'sparkle', 14);
    toast(`${WORKERS[k].name} est embauché : une charge toutes les 2 heures`, ['ui', WORKERS[k].icon]);
    return true;
}
export function upgradeWorker(k, at) {
    const c = workerNext(k);
    if (!c || workerLvl(k) >= 4 || !hasCost(c)) {
        sfx('error');
        return false;
    }
    collectLoads(k); // on encaisse d'abord ce qui est prêt
    payCost(c);
    state.nat.workers[k].lvl++;
    sfx('level');
    burst(at, 'sparkle', 10);
    return true;
}
export function loadsReady(k) {
    const w = state.nat && state.nat.workers[k];
    if (!w || w.lvl < 1) return 0;
    return Math.min(workerCap(w.lvl), Math.floor((now() - w.at) / WORKER_EVERY));
}
// ce qu'une charge contient, selon le niveau de l'ouvrier et ce que la mine a ouvert
export function loadOf(k) {
    const l = workerLvl(k),
        out = {};
    if (k === 'lumber') {
        out.wood = 6 + 3 * l;
        out.hardwood = 1 + l;
        out.resin = l;
        if (state.level >= SPECIES.birch.lvl) out.birchSap = 1 + l;
    } else {
        out.stone = 6 + 3 * l;
        out.coal = 2 + l;
        if (depthOpen('gallery')) {
            out.ironOre = l;
            out.copperOre = l - 1;
        }
        if (depthOpen('cave')) {
            out.silverOre = Math.max(0, l - 1);
            out.goldOre = Math.max(0, l - 2);
        }
    }
    for (const id in out) if (out[id] <= 0) delete out[id];
    return out;
}
export function collectLoads(k, at) {
    const n = loadsReady(k);
    if (!n) return null;
    const w = state.nat.workers[k],
        got = {};
    const load = loadOf(k);
    for (const id in load) {
        const q = load[id] * n;
        state.inventory[id] = (state.inventory[id] || 0) + q;
        natGot(id, q);
        got[id] = q;
    }
    w.at = n >= workerCap(w.lvl) ? now() : w.at + n * WORKER_EVERY;
    state.stats.loads = (state.stats.loads || 0) + n;
    if (at) {
        sfx('coin');
        burst(at, 'sparkle', 8);
    }
    return got;
}

// ---------------- Gaspard, le bûcheron : un défi par jour ----------------
export const gaspardOpen = () => state.level >= GASPARD.lvl;
const dayKey = (t = now()) => {
    const d = new Date(t);
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};
const GET_POOL = () => {
    const lvl = state.level,
        list = [
            ['wood', 20, 3],
            ['hardwood', 6, 3],
            ['resin', 5, 3],
        ];
    if (lvl >= 8) list.push(['stone', 25, 8], ['coal', 8, 8]);
    if (lvl >= 12) list.push(['birchSap', 8, 12]);
    if (lvl >= 18 && depthOpen('gallery')) list.push(['ironOre', 6, 18], ['copperOre', 5, 18], ['quartz', 1, 18], ['amethyst', 1, 18]);
    if (lvl >= 30 && depthOpen('cave')) list.push(['silverOre', 5, 30], ['goldOre', 3, 30], ['ruby', 1, 30], ['sapphire', 1, 30], ['emerald', 1, 30]);
    return list;
};
function newGaspard(day) {
    const roll = Math.random();
    const base = { day, done: false, claimed: false, got: 0 };
    if (roll < 0.2 && state.level >= 8 && depthOpen('quarry') && state.level >= 18 && depthOpen('gallery')) return { ...base, kind: 'vein', need: 1 };
    if (roll < 0.4) {
        const sps = Object.keys(SPECIES).filter(id => state.level >= SPECIES[id].lvl);
        return { ...base, kind: 'species', id: sps[Math.floor(Math.random() * sps.length)], need: 4 + Math.floor(state.level / 15) };
    }
    const pool = GET_POOL(),
        [id, need] = pool[Math.floor(Math.random() * pool.length)];
    const q = id === 'ruby' || id === 'sapphire' || id === 'emerald' || id === 'quartz' || id === 'amethyst' ? need : Math.round(need * (1 + state.level / 40));
    return { ...base, kind: 'get', id, need: q, from: ensureNat().log[id] || 0 };
}
export function ensureGaspard() {
    if (!gaspardOpen()) return null;
    const n = ensureNat(),
        day = dayKey();
    if (!n.gaspard || n.gaspard.day !== day) n.gaspard = newGaspard(day);
    return n.gaspard;
}
export function gaspardProgress(g = ensureGaspard()) {
    if (!g) return 0;
    if (g.kind === 'get') return Math.min(g.need, (state.nat.log[g.id] || 0) - g.from);
    return g.got;
}
export function gaspardCheck() {
    const g = state.nat && state.nat.gaspard;
    if (!g || g.done || g.day !== dayKey()) return;
    if (gaspardProgress(g) >= g.need) {
        g.done = true;
        if (view.started) toast('Défi de Gaspard réussi ! Venez chercher votre récompense à la forêt', ['villager', 'gaspard']);
    }
}
export function gaspardText(g = ensureGaspard()) {
    if (!g) return '';
    if (g.kind === 'vein') return 'Casser une veine qui brille, au fond de la mine';
    if (g.kind === 'species') return `Abattre ${g.need} ${SPECIES[g.id].name.toLowerCase()}s`;
    return `Rapporter ${g.need} ${ITEMS[g.id].name.toLowerCase()}`;
}
export const gaspardReward = () => ({ coins: round5(GASPARD.coins(state.level)), xp: GASPARD.xp(state.level) });
export const gaspardReady = () => !!(gaspardOpen() && state.nat && state.nat.gaspard && state.nat.gaspard.done && !state.nat.gaspard.claimed);
export function claimGaspard(at) {
    const g = state.nat && state.nat.gaspard;
    if (!g || !g.done || g.claimed) return false;
    g.claimed = true;
    const r = gaspardReward();
    earn(r.coins, at);
    addXp(r.xp, at);
    addFriendship('gaspard', GASPARD.hearts, at);
    // un défi sur trois : un petit lingot
    if (Math.random() < 0.34 && state.level >= 18) {
        state.inventory.ironIngot = (state.inventory.ironIngot || 0) + 1;
        toast('Gaspard : « Tiens, un lingot pour la route. »', ['item', 'ironIngot']);
    } else toast('Gaspard : « Pas mal du tout, pour un fermier ! »', ['villager', 'gaspard']);
    state.stats.gaspardDone = (state.stats.gaspardDone || 0) + 1;
    sfx('level');
    return true;
}
// appelée à chaque abattage ou coup de pioche réussi
onNatureHit((kind, sl) => {
    const g = state.nat && state.nat.gaspard;
    if (g && !g.done && g.day === dayKey()) {
        if (g.kind === 'species' && kind === 'forest' && sl.sp === g.id) g.got++;
        if (g.kind === 'vein' && kind === 'mine' && sl.gem) g.got++;
    }
    gaspardCheck();
});

// ---------------- le carnet du mineur et du bûcheron ----------------
export const natLogOpen = () => state.level >= NAT_LOG.lvl;
export const natLogStep = id => {
    const n = (state.nat && state.nat.log[id]) || 0;
    return NAT_LOG.steps.filter(s => n >= s).length;
};
export const natLogCan = id => natLogStep(id) > ((state.nat && state.nat.logClaimed[id]) || 0);
export function claimNatLog(id, at) {
    if (!natLogCan(id)) return false;
    const n = ensureNat(),
        k = n.logClaimed[id] || 0;
    n.logClaimed[id] = k + 1;
    earn(NAT_LOG.coins[k], at);
    sfx('level');
    toast(`Carnet : ${ITEMS[id].name.toLowerCase()}, palier ${k + 1}`, ['item', id]);
    return true;
}
