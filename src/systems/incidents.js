// Les imprévus (corbeau, pucerons, bête malade, acheteur pressé) et les sols du champ.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { view, farmShown } from '../core/view.js';
import { pickRand, round5, formatDuration } from '../core/format.js';
import { toast, sfx, buzz, burst, float } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { SOILS, SOIL_BONUS, CROW_LVL, CROW_TIME } from '../data/farm.js';
import { INCIDENT_LVL, INCIDENT_GAP, INCIDENTS } from '../data/surprises.js';
import { BALANCE } from '../data/progress.js';
import { isAdult } from './animals.js';
import { nearDeco } from './farmlife.js';
import { questPool, pickItems, qtyFor, xpBonus, hasAll, payItems } from './orders.js';
import { tip } from './tips.js';
import { addXp, spend, earn } from './player.js';
import { rollRare } from './barn.js';

export function scheduleIncident() {
    state.nextIncident = now() + INCIDENT_GAP[0] + Math.random() * (INCIDENT_GAP[1] - INCIDENT_GAP[0]);
}

export function incidentTick() {
    const t = now(),
        inc = state.incident;
    if (inc) {
        if (inc.until && t >= inc.until) {
            endIncident(false);
            return true;
        }
        return false;
    }
    if (state.level < CROW_LVL || !view.started || view.hidden || !state.tutorial.done) return false;
    if (!state.nextIncident) scheduleIncident();
    if (t < state.nextIncident) return false;
    return startIncident();
}

export function startIncident(force) {
    const t = now();
    const growing = state.grid.map((p, i) => [p, i]).filter(([p]) => p.isUnlocked && p.itemId && !p.isReady && ITEMS[p.itemId].type === 'crop');
    const adults = state.animals.filter(a => isAdult(a) && !a.sick);
    // le corbeau ne vient que si vous êtes au champ (il faut le chasser en 15 secondes)
    const crowSpots = growing.filter(([, i]) => !nearDeco(i, 'birdhouse'));
    const scared = state.grid.some(p => p.deco === 'scarecrow') && Math.random() < 0.75;
    const kinds = [];
    if (farmShown() && crowSpots.length && !scared) kinds.push('crow', 'crow');
    if (state.level >= INCIDENT_LVL) {
        if (growing.length) kinds.push('aphids');
        if (adults.length) kinds.push('sick');
        if (questPool().length >= 2) kinds.push('express', 'express');
    }
    const type = force || pickRand(kinds);
    if (!type) {
        scheduleIncident();
        return false;
    }
    const I = INCIDENTS[type];
    if (type === 'crow') {
        if (!crowSpots.length) return false;
        const [, i] = pickRand(crowSpots);
        state.crow = { plot: i, until: t + CROW_TIME };
        state.incident = { type, plot: i, until: 0 };
        sfx('caw');
    } else if (type === 'aphids') {
        // les canards de la mare mangent les pucerons des parcelles voisines
        const prey = growing.filter(([, j]) => !nearDeco(j, 'duckPond'));
        if (!prey.length) return false;
        const [p, i] = pickRand(prey);
        p.pest = true;
        state.incident = { type, plot: i, until: t + I.time };
    } else if (type === 'sick') {
        if (!adults.length) return false;
        const a = pickRand(adults);
        a.sick = true;
        state.incident = { type, name: a.name, until: t + I.time };
    } else {
        const its = pickItems(state.level < 6 ? 1 : 2);
        if (!its.length) return false;
        const items = its.map(it => ({ id: it.id, qty: qtyFor(it, 40 + state.level * 20, 10) }));
        const value = items.reduce((a, x) => a + ITEMS[x.id].sell * x.qty, 0);
        const gold = round5(value * BALANCE.orderPay * 3);
        state.incident = { type, items, gold, xp: Math.round(gold * BALANCE.orderXp * 0.5 * xpBonus()), until: t + I.time };
    }
    state.stats.incidents = (state.stats.incidents || 0) + 1;
    // la première fois, c'est Mamie Odette qui explique ; ensuite un simple message
    if (state.tips[type] || !state.tutorial.done) toast(`${I.name} ${I.text}`, ['ui', I.icon]);
    tip(type);
    if (type !== 'crow') sfx('horn');
    buzz([20, 60, 20]);
    return true;
}

export function endIncident(won) {
    const inc = state.incident;
    if (!inc) return;
    if (inc.type === 'aphids') {
        const p = state.grid[inc.plot];
        if (p && p.pest) {
            p.pest = false;
            if (!won && p.itemId) {
                const name = ITEMS[p.itemId].name.toLowerCase();
                p.itemId = null;
                p.isReady = false;
                p.isWatered = false;
                p.growProgress = 0;
                toast(`Les pucerons ont dévoré la culture (${name})`, ['ui', 'pest']);
            }
        }
    } else if (inc.type === 'sick') {
        const a = state.animals.find(x => x.sick);
        if (a) {
            a.sick = false;
            if (!won) toast(`${a.name} s’est remis tout seul, mais n’a rien produit pendant ce temps`, ['ui', 'sick']);
        }
    } else if (inc.type === 'express' && !won) toast('L’acheteur pressé est reparti', ['ui', 'express']);
    state.incident = null;
    scheduleIncident();
}

export const incidentLeft = () => (state.incident && state.incident.until ? Math.max(0, (state.incident.until - now()) / 1000) : 0);

export function treatPest(i, at) {
    const p = state.grid[i];
    if (!p || !p.pest) return false;
    state.stats.pests = (state.stats.pests || 0) + 1;
    sfx('pop');
    buzz(15);
    burst(at, 'leaf', 10, -6);
    burst(at, 'sparkle', 8, -10);
    float(at, ['Ouste !'], '', -24);
    addXp(20 + state.level * 3, at);
    endIncident(true);
    return true;
}

export const cureCost = () => Math.round((40 + state.level * 15) / 5) * 5;

export function cureAnimal(i, at) {
    const a = state.animals[i];
    if (!a || !a.sick) return false;
    const cost = cureCost();
    if (state.money < cost) {
        toast('Pas assez d’argent pour le vétérinaire', ['ui', 'coin']);
        sfx('error');
        return false;
    }
    spend(cost);
    a.sick = false;
    if (state.incident && state.incident.type === 'sick') endIncident(true);
    sfx(a.type);
    buzz(15);
    burst(at, 'sparkle', 12);
    float(at, ['Guéri !'], '', -30);
    addXp(15 + state.level * 3, at);
    return true;
}

export function deliverExpress(at) {
    const inc = state.incident;
    if (!inc || inc.type !== 'express' || !hasAll(inc.items)) return false;
    payItems(inc.items);
    sfx('level');
    buzz(25);
    burst(at, 'sparkle', 16);
    earn(inc.gold, at);
    addXp(inc.xp, at);
    state.stats.orders++;
    state.income.orders += inc.gold;
    rollRare(0.5, at);
    endIncident(true);
    return true;
}

// l'imprévu en cours pour la liste « À faire » : { view, icon, text }
export function incidentTodo() {
    const inc = state.incident;
    if (!inc) return null;
    const I = INCIDENTS[inc.type];
    const left = inc.until ? ` · ${formatDuration(incidentLeft())}` : '';
    const where = inc.type === 'aphids' ? 'farm' : inc.type === 'sick' ? 'animals' : 'quests';
    return { view: where, icon: ['ui', I.icon], text: `${I.name}${left}` };
}

// ---------------- les sols ----------------
export function soilOf(i) {
    if (i >= 1000 || i < 0) return null;
    const h = Math.floor(Math.abs(Math.sin(i * 12.9898 + 4.1) * 43758.5453)) % 10;
    return h < 3 ? 'wet' : h < 6 ? 'dry' : h < 8 ? 'shade' : null;
}
export const soilFits = (i, id) => {
    const sl = soilOf(i);
    return !!(sl && id && SOILS[sl].crops.includes(id));
};
export const soilMult = (i, id) => (soilFits(i, id) ? SOIL_BONUS.speed : 1);
export const soilOfCrop = id => Object.keys(SOILS).find(k => SOILS[k].crops.includes(id));
