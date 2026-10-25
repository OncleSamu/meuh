// L'atelier : chaque machine a plusieurs recettes. Une machine a une file de production
// (le premier lot est en cours, les suivants attendent, ingrédients déjà payés)
// et des produits finis qui s'accumulent jusqu'à la récupération.
import { state, lvOk } from '../core/state.js';
import { viewShown } from '../core/view.js';
import { emit, toast, sfx, buzz, burst, float, squish, anchor } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { MACHINES, LEGACY_RECIPE, RECIPES } from '../data/machines.js';
import { VILLAGERS } from '../data/village.js';
import { EVENTS, HOLIDAYS } from '../data/world.js';
import { BALANCE } from '../data/progress.js';
import { heartsOf } from './village.js';
import { eventActive, eventProgress } from './events.js';
import { holidayActive } from './holidays.js';
import { storyOk, storyLockText } from './story.js';
import { speedMult, rollYield, addXp } from './player.js';
import { machineBoost, machineSlots } from './home.js';
import { masterySpeed, addMastery } from './mastery.js';
import { clampAllQuality, addQuality } from './farm.js';
import { inBarn, barnBlocked, rollRare } from './barn.js';
import { collect } from './book.js';
import { takeIngredients } from './genetics.js';
import { qtyName } from '../core/format.js';
import { mTimeMult, mExtraYield } from './buildings.js';

// les machines de cuisine (le compteur « plats cuisinés »)
export const COOKING = ['kitchen', 'stove', 'deli', 'fishmonger'];
export const recipesOf = type => Object.values(RECIPES).filter(r => r.machine === type);

export const recipeUnlocked = id => {
    const r = RECIPES[id];
    return (
        lvOk(r, r.lvl) &&
        (!r.teacher || heartsOf(r.teacher) >= r.hearts) &&
        (!r.fete || eventActive(r.fete)) &&
        (!r.holiday || holidayActive(r.holiday)) &&
        storyOk(ITEMS[id])
    );
};
export const canCook = id => Object.entries(RECIPES[id].ing).every(([k, n]) => state.inventory[k] >= n);
export const missingFor = id =>
    Object.entries(RECIPES[id].ing)
        .filter(([k, n]) => state.inventory[k] < n)
        .map(([k, n]) => qtyName(n - state.inventory[k], ITEMS[k].name));
export const newMachine = type => ({ type, queue: [], progress: 0, out: {}, last: null });
export const machineBusy = m => m.queue.length > 0;
export const outCount = m => Object.values(m.out).reduce((a, b) => a + b, 0);
export const machineOutput = m => Object.keys(m.out).find(k => m.out[k] > 0) || m.queue[0] || null;
// durée réelle d'une recette : vitesse générale, moulin du hameau, maîtrise
export const recipeTime = id => (RECIPES[id].time / (speedMult() * machineBoost(RECIPES[id].machine) * masterySpeed(id))) * mTimeMult(RECIPES[id].machine);
export const machinePct = m => (m.queue.length ? Math.min(1, m.progress / recipeTime(m.queue[0])) : 0);
export const machinePct2 = m => (m.lane2 && m.queue.length > 1 ? Math.min(1, (m.progress2 || 0) / recipeTime(m.queue[1])) : 0);
export const machineLeft = m => (m.queue.length ? Math.max(0, recipeTime(m.queue[0]) - m.progress) : 0);
export const recipeLockText = r =>
    !lvOk(r, r.lvl)
        ? `Niveau ${r.lvl}`
        : !storyOk(ITEMS[r.id])
          ? storyLockText(ITEMS[r.id])
          : r.holiday
            ? `Pendant ${HOLIDAYS[r.holiday].name}`
            : r.fete
              ? `Pendant la fête : ${EVENTS[r.fete].name}`
              : `${VILLAGERS[r.teacher].name} · ${r.hearts} cœur${r.hearts > 1 ? 's' : ''} d’amitié`;
export const hasMachine = type => state.machines.some(m => m.type === type);

// Anciennes sauvegardes : une recette unique et des compteurs deviennent une file et un stock par recette
export function ensureMachineData() {
    state.machines.forEach(m => {
        if (Array.isArray(m.queue) && m.out && typeof m.out === 'object') return;
        const rid = m.recipe || LEGACY_RECIPE[m.type] || null;
        const progress = m.progress || 0;
        const queue = m.isActive && rid ? Array(1 + (+m.queue || 0)).fill(rid) : [];
        const n = typeof m.out === 'number' ? m.out : m.isReady ? 1 : 0;
        Object.keys(m).forEach(k => k !== 'type' && delete m[k]);
        Object.assign(m, { queue, progress: queue.length ? progress : 0, out: n && rid ? { [rid]: n } : {}, last: rid });
    });
}

// 1.3.1 : des recettes ont changé de machine ; la « boucle » d'une machine ne relance plus une recette partie ailleurs.
// 1.8 : plus aucune machine offerte au chargement (un cadeau trop gros, et sans recette au bon niveau) :
// la nouvelle machine s'achète au magasin quand son niveau arrive.
export function ensureRecipeMoves() {
    state.machines.forEach(m => {
        if (m.last && RECIPES[m.last] && RECIPES[m.last].machine !== m.type) m.last = null;
    });
    delete state.pendingGift131;
    state.moved131 = true;
}

// une recette en file, avec la qualité promise par ses ingrédients
function pushJob(m, id, q) {
    m.queue.push(id);
    m.qq = m.qq || [];
    while (m.qq.length < m.queue.length - 1) m.qq.push(0);
    m.qq.push(q || 0);
}

// Production en boucle : la machine relance sa dernière recette tant qu'il y a les ingrédients
export function loopRefill(m) {
    if (!m.loop || !m.last || m.queue.length >= machineSlots(m.type)) return false;
    const r = RECIPES[m.last];
    if (!r || !recipeUnlocked(r.id) || !canCook(r.id)) return false;
    const q = takeIngredients(r.id);
    if (!m.queue.length) m.progress = 0;
    if (m.queue.length < 2) m.progress2 = 0;
    pushJob(m, r.id, q);
    return true;
}

export function toggleLoop(i) {
    const m = state.machines[i];
    if (!m) return;
    m.loop = !m.loop;
    if (m.loop && !m.last) {
        toast('Lancez d’abord une recette : la machine la répétera ensuite', ['machine', m.type]);
        m.loop = false;
    } else
        toast(m.loop ? `${MACHINES[m.type].name} : production en boucle (${ITEMS[m.last].name.toLowerCase()})` : 'Production en boucle arrêtée', [
            'machine',
            m.type,
        ]);
    sfx('click');
    loopRefill(m);
}

// 1.37.1 : un deuxième poste de travail (acheté une fois par machine) fait tourner deux lots à la fois :
// le lot de tête (progress) et le suivant de la file (progress2).
export const LANE2_LVL = 15;
export const lane2Cost = type => Math.round(((MACHINES[type].cost || 6000) * 6 + 30000) / 1000) * 1000;
export const lane2Open = () => state.level >= LANE2_LVL;
export function buyLane2(i, at) {
    const m = state.machines[i];
    if (!m || m.lane2) return false;
    const c = lane2Cost(m.type);
    if (!lane2Open() || state.money < c) {
        sfx('error');
        toast(!lane2Open() ? `Le deuxième poste s’ouvre au niveau ${LANE2_LVL}` : 'Pas assez de pièces', ['ui', 'coin']);
        emit('shake', at);
        return false;
    }
    state.money -= c;
    m.lane2 = true;
    m.progress2 = 0;
    sfx('level');
    buzz(20);
    burst(at, 'sparkle', 12);
    toast(`${MACHINES[m.type].name} : deux lots à la fois`, ['machine', m.type]);
    return true;
}
const laneB = m => !!m.lane2 && m.queue.length > 1;

// une recette terminée : elle attend dans la sortie de la machine
function finishJob(m, k) {
    const id = m.queue.splice(k, 1)[0];
    const q = (m.qq || []).splice(k, 1)[0] || 0;
    m.out[id] = (m.out[id] || 0) + 1;
    // la qualité du lot (de meilleurs ingrédients) suit le produit jusqu'à la récupération
    if (q) {
        m.outq = m.outq || {};
        const o = (m.outq[id] = m.outq[id] || { s: 0, g: 0 });
        const key = ['s', 's', 'g', 'p', 'd'][q];
        o[key] = (o[key] || 0) + 1;
    }
}

// Avance une machine de dt secondes ; renvoie le nombre de lots terminés
export function advanceMachine(m, dt) {
    let done = 0;
    loopRefill(m);
    if (!m.lane2) m.progress2 = 0;
    for (let guard = 0; m.queue.length && dt > 1e-9 && guard < 5000; guard++) {
        const needA = recipeTime(m.queue[0]) - m.progress;
        const needB = laneB(m) ? recipeTime(m.queue[1]) - (m.progress2 || 0) : Infinity;
        const step = Math.min(dt, needA, needB);
        m.progress += step;
        if (laneB(m)) m.progress2 = (m.progress2 || 0) + step;
        dt -= step;
        if (m.progress >= recipeTime(m.queue[0]) - 1e-9) {
            // le lot de tête est fini : celui du second poste passe en tête avec son avance
            const hadB = laneB(m);
            finishJob(m, 0);
            m.progress = hadB ? m.progress2 || 0 : 0;
            m.progress2 = 0;
            done++;
            loopRefill(m);
        } else if (laneB(m) && m.progress2 >= recipeTime(m.queue[1]) - 1e-9) {
            finishJob(m, 1);
            m.progress2 = 0;
            done++;
            loopRefill(m);
        }
    }
    if (!m.queue.length) m.progress = m.progress2 = 0;
    return done;
}

export function workshopTick() {
    let changed = false;
    state.machines.forEach(m => {
        if (loopRefill(m)) changed = true;
        if (advanceMachine(m, 1)) {
            changed = true;
            if (viewShown('machines')) sfx('pop');
        }
    });
    return changed;
}

export function queueRecipe(i, id, at) {
    const m = state.machines[i],
        r = RECIPES[id];
    if (!m || !r) return false;
    if (!recipeUnlocked(id)) {
        toast(
            r.teacher
                ? `Recette de ${VILLAGERS[r.teacher].name} : gagnez ${r.hearts} cœur${r.hearts > 1 ? 's' : ''} d’amitié`
                : !storyOk(ITEMS[id])
                  ? storyLockText(ITEMS[id])
                  : `Recette débloquée au niveau ${r.lvl}`,
            ['ui', 'lock'],
        );
        sfx('error');
        return false;
    }
    if (m.queue.length >= machineSlots(m.type)) {
        toast('La file de cette machine est pleine', ['machine', m.type]);
        sfx('error');
        return false;
    }
    if (!canCook(id)) {
        toast(`Il manque ${missingFor(id).join(', ')}`, ['item', Object.keys(r.ing).find(k => state.inventory[k] < r.ing[k])]);
        sfx('error');
        emit('shake', at);
        return false;
    }
    let q = takeIngredients(id);
    // 1.14 : le bois fruitier parfume le fumoir : un lot sur quatre sort en argent
    if (m.type === 'smokehouse' && !q && state.inventory.fruitWood > 0 && Math.random() < 0.25) {
        state.inventory.fruitWood--;
        q = 1;
        toast('Le bois fruitier parfume le lot : il sortira en argent', ['item', 'fruitWood']);
    }
    clampAllQuality();
    if (!m.queue.length) m.progress = 0;
    if (m.queue.length < 2) m.progress2 = 0;
    pushJob(m, id, q);
    m.last = id;
    sfx('machine');
    buzz(8);
    burst(at, 'smoke', 4);
    float(at, [m.queue.length === 1 ? 'Lancé !' : 'En file'], '', -20);
    return true;
}

export function cancelQueued(i, k) {
    const m = state.machines[i];
    if (!m || k < 1 || !m.queue[k]) return false;
    const id = m.queue.splice(k, 1)[0];
    if (m.qq) m.qq.splice(k, 1);
    if (k === 1) m.progress2 = 0;
    Object.entries(RECIPES[id].ing).forEach(([key, n]) => (state.inventory[key] += n));
    sfx('click');
    toast(`${ITEMS[id].name} retiré de la file, ingrédients rendus`, ['item', id]);
    return true;
}

export function collectMachine(i, at, quiet) {
    const m = state.machines[i];
    if (!m || !outCount(m)) return 0;
    // la nourriture du moulin ne va pas dans la grange
    if (Object.keys(m.out).some(id => m.out[id] && inBarn(id)) && barnBlocked()) return 0;
    let xp = 0,
        total = 0,
        k = 0;
    for (const [id, n] of Object.entries(m.out)) {
        if (!n) continue;
        const r = RECIPES[id];
        let qty = 0;
        const per = [];
        for (let j = 0; j < n; j++) {
            const x = rollYield() * (r.outQty || 1) + mExtraYield(m.type);
            per.push(x);
            qty += x;
        }
        state.inventory[id] += qty;
        // les lots faits de meilleurs ingrédients sortent en argent ou en or
        const oq = m.outq && m.outq[id];
        if (oq) {
            let j = 0;
            for (const [r, f] of [
                [4, 'd'],
                [3, 'p'],
                [2, 'g'],
                [1, 's'],
            ])
                for (let g = 0; g < (oq[f] || 0) && j < per.length; g++) {
                    if (r >= 2) state.stats.goldDishes = (state.stats.goldDishes || 0) + per[j];
                    addQuality(id, r, per[j++]);
                }
            delete m.outq[id];
        }
        state.stats.crafted += qty;
        if (COOKING.includes(m.type)) state.stats.cooked += qty;
        collect('k_' + id);
        addMastery(id, qty);
        eventProgress('craft', id, qty);
        xp += r.xp * n;
        total += qty;
        emit('float', { at, parts: [`+${qty}`, ['item', id]], cls: '', dy: -20 - k * 4, delay: k * 180 });
        emit('fly', { at, item: id, qty: Math.min(qty, 2), to: id === 'feed' ? 'animals' : 'market' });
        k++;
    }
    m.out = {};
    rollRare(BALANCE.rareDrop * 1.5, at);
    burst(at, 'sparkle', 8);
    addXp(xp, at);
    if (!quiet) {
        sfx('harvest');
        buzz(12);
    }
    return total;
}

export function collectAllMachines(at) {
    let n = 0;
    state.machines.forEach((m, i) => {
        if (outCount(m)) n += collectMachine(i, anchor('machine', i), true) ? 1 : 0;
    });
    if (!n) {
        if (!barnBlocked(true)) toast('Aucun produit à récupérer');
        squish(at);
        return 0;
    }
    sfx('harvest');
    buzz(15);
    return n;
}

// Relance la dernière recette de chaque machine à l'arrêt
export function restartAllMachines(at) {
    let n = 0;
    state.machines.forEach((m, i) => {
        const id = m.last;
        if (machineBusy(m) || !id || !RECIPES[id] || !recipeUnlocked(id) || !canCook(id)) return;
        pushJob(m, id, takeIngredients(id));
        m.progress = 0;
        burst(anchor('machine', i), 'smoke', 5, -20);
        n++;
    });
    if (!n) {
        toast('Aucune machine à l’arrêt ne peut relancer sa dernière recette');
        squish(at);
        return 0;
    }
    clampAllQuality();
    sfx('machine');
    toast(`${n} machine${n > 1 ? 's' : ''} relancée${n > 1 ? 's' : ''}`, ['machine', 'mill']);
    return n;
}
