// Les fêtes de saison : quatre jours d'objectifs et un trophée.
import { state } from '../core/state.js';
import { now, today } from '../core/clock.js';
import { view } from '../core/view.js';
import { fmt, dateKey } from '../core/format.js';
import { emit, toast, sfx, buzz, burst, float } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { EVENTS, FETE_START, DAYS_PER_SEASON, GAME_MIN_PER_SEC } from '../data/world.js';
import { questPool, trainOpen } from './orders.js';
import { feteEnd } from './home.js';
import { dayInSeason, seasonOfDay, season } from './world.js';
import { tip } from './tips.js';
import { clampQuality } from './farm.js';
import { earn, addXp } from './player.js';
import { addPhoto } from './style.js';

export const eventActive = sid => !!(state.event && !state.event.ended && (!sid || state.event.season === sid));
export const eventIcon = sid => EVENTS[sid].icon;

const pickFrom = (ids, fallback) => {
    const pool = questPool().map(i => i.id);
    const ok = ids.filter(id => pool.includes(id));
    return ok.length ? ok[Math.floor(Math.random() * ok.length)] : fallback;
};

// objectifs prévus pour une fête de quatre jours de jeu
const scaleN = (base, per) => Math.round((base + state.level * per) * 1.6);

export function makeEventGoals(sid) {
    const g = [];
    if (sid === 'printemps') {
        g.push({ type: 'find', target: 6 });
        g.push({ type: 'harvest', item: pickFrom(['carrot', 'strawberry', 'radish', 'peas', 'lettuce', 'wheat'], 'wheat'), target: scaleN(12, 1) });
        g.push({ type: 'deliver', item: pickFrom(['egg', 'carrot', 'strawberry'], 'wheat'), target: scaleN(6, 0.6) });
    } else if (sid === 'ete') {
        g.push({ type: 'sell', target: Math.round(scaleN(400, 180) / 50) * 50 });
        g.push({
            type: 'harvest',
            item: pickFrom(['corn', 'tomato', 'strawberry', 'pepper', 'eggplant', 'watermelon', 'wheat'], 'wheat'),
            target: scaleN(12, 1),
        });
        g.push({
            type: 'deliver',
            item: pickFrom(['jam', 'cornbread', 'bread', 'tomato', 'salad', 'ratatouille', 'cherry', 'wheat'], 'wheat'),
            target: scaleN(3, 0.4),
        });
    } else if (sid === 'automne') {
        g.push({ type: 'gold', target: 3 });
        g.push({ type: 'harvest', item: pickFrom(['pumpkin', 'potato', 'apple', 'cabbage', 'onion', 'wheat'], 'wheat'), target: scaleN(10, 0.8) });
        g.push({ type: 'deliver', item: pickFrom(['soup', 'pie', 'juice', 'apple', 'potato', 'carrot'], 'carrot'), target: scaleN(3, 0.4) });
    } else {
        g.push(trainOpen() ? { type: 'truck', target: 1 } : { type: 'craft', target: 3 });
        g.push({ type: 'craft', target: scaleN(4, 0.4) });
        g.push({ type: 'deliver', item: pickFrom(['gratin', 'soup', 'cheese', 'cloth', 'potato', 'carrot'], 'carrot'), target: scaleN(3, 0.4) });
    }
    g.forEach(x => {
        x.prog = 0;
        x.claimed = false;
    });
    return g;
}

export function goalText(x) {
    const nm = x.item ? ITEMS[x.item].name.toLowerCase() : '';
    switch (x.type) {
        case 'find':
            return `Trouver ${x.target} œufs décorés dans le champ`;
        case 'harvest':
            return `Récolter ${x.target} ${nm}`;
        case 'deliver':
            return `Apporter ${x.target} ${nm} au stand`;
        case 'sell':
            return `Vendre pour ${fmt(x.target)} pièces au marché`;
        case 'gold':
            return 'Présenter 3 récoltes de qualité or au concours';
        case 'truck':
            return 'Remplir un train complet';
        case 'craft':
            return `Fabriquer ${x.target} produits à l’atelier`;
    }
    return '';
}

export const goalIcon = x =>
    x.item
        ? ['item', x.item]
        : x.type === 'find'
          ? ['item', 'paintedEgg']
          : x.type === 'sell'
            ? ['ui', 'coin']
            : x.type === 'gold'
              ? ['q', 2]
              : x.type === 'truck'
                ? ['ui', 'trainIcon']
                : ['machine', 'bakery'];

// on peut apporter quelque chose pour cet objectif
export const goalCanGive = x =>
    x.prog < x.target && ((x.type === 'deliver' && state.inventory[x.item] > 0) || (x.type === 'gold' && Object.values(state.quality).some(q => q.g > 0)));

export const goalReward = () => ({ coins: Math.round((150 * (1 + state.level * 0.4)) / 10) * 10, xp: 40 + state.level * 10 });

export function eventEndsIn() {
    const daysLeft = feteEnd() - dayInSeason();
    return (daysLeft * 1440 + (1440 - state.gameTimeMinutes)) / GAME_MIN_PER_SEC;
}

// Temps avant la prochaine fête, et la saison où elle aura lieu
export function nextFete() {
    const d = dayInSeason();
    const days = d < FETE_START ? FETE_START - d : DAYS_PER_SEASON - d + FETE_START;
    const sn = seasonOfDay(state.day + days); // respecte le défi « Hiver éternel »
    return { season: sn, secs: ((days - 1) * 1440 + (1440 - state.gameTimeMinutes)) / GAME_MIN_PER_SEC };
}

export function syncEvent() {
    const sid = season().id,
        active = dayInSeason() >= FETE_START && dayInSeason() <= feteEnd();
    const key = state.day - dayInSeason() + FETE_START;
    if (active && (!state.event || state.event.key !== key)) {
        state.event = { key, season: sid, goals: makeEventGoals(sid), ended: false, rewarded: false };
        if (view.started) {
            toast(`La fête commence : ${EVENTS[sid].name} !`, eventIcon(sid));
            tip('fete');
            sfx('level');
        }
        return true;
    }
    if (!active && state.event && !state.event.ended) {
        const done = state.event.rewarded;
        state.event.ended = true;
        if (view.started)
            toast(
                done ? `${EVENTS[state.event.season].name} est terminée. Bravo !` : `${EVENTS[state.event.season].name} est terminée.`,
                eventIcon(state.event.season),
            );
        return true;
    }
    return false;
}

export function eventProgress(type, item, n = 1) {
    if (!eventActive()) return;
    state.event.goals.forEach(x => {
        if (x.type !== type || x.prog >= x.target) return;
        if (x.item && item && x.item !== item) return;
        x.prog = Math.min(x.target, x.prog + n);
        if (x.prog >= x.target) {
            toast(`Objectif de fête atteint : ${goalText(x).toLowerCase()}`, eventIcon(state.event.season));
            sfx('pop');
        }
    });
}

export function contributeGoal(k, at) {
    const x = state.event && state.event.goals[k];
    if (!x || x.prog >= x.target) return false;
    let given = 0;
    if (x.type === 'deliver') {
        given = Math.min(state.inventory[x.item], x.target - x.prog);
        state.inventory[x.item] -= given;
        clampQuality(x.item);
    } else if (x.type === 'gold') {
        for (const id of Object.keys(state.quality)) {
            clampQuality(id);
            while (state.quality[id].g > 0 && given < x.target - x.prog) {
                state.quality[id].g--;
                state.inventory[id]--;
                given++;
            }
        }
    }
    if (!given) {
        toast(x.type === 'gold' ? 'Vous n’avez aucune récolte de qualité or' : 'Rien à apporter pour le moment', eventIcon(state.event.season));
        sfx('error');
        return false;
    }
    x.prog += given;
    sfx('load');
    buzz(12);
    burst(at, 'sparkle', 8);
    float(at, [`+${given}`], '', -20);
    return true;
}

export function claimGoal(k, at) {
    const x = state.event && state.event.goals[k];
    if (!x || x.claimed || x.prog < x.target) return false;
    x.claimed = true;
    const r = goalReward();
    sfx('level');
    buzz(20);
    burst(at, 'sparkle', 14);
    earn(r.coins, at);
    addXp(r.xp, at);
    return true;
}

export function claimEvent(at) {
    const e = state.event;
    if (!e || e.rewarded || !e.goals.every(x => x.claimed)) return false;
    e.rewarded = true;
    const first = !state.trophies[e.season];
    state.trophies[e.season] = (state.trophies[e.season] || 0) + 1;
    addPhoto('ui', 'trophy', EVENTS[e.season].name, 'Trophée de la fête');
    state.stats.eventsDone++;
    const r = goalReward();
    earn(r.coins * 4, at);
    if (first) state.prestige.rubans++;
    emit('celebrate', {
        icon: ['ui', 'trophy'],
        title: `Trophée : ${EVENTS[e.season].name} !`,
        sub: first ? 'Premier trophée de cette fête : vous gagnez aussi un ruban de concours.' : 'Un trophée de plus sur votre étagère.',
        lines: [[['ui', 'trophy'], `${fmt(r.coins * 4)} pièces`], ...(first ? [[['ui', 'ribbon'], '1 ruban : +5 % de ventes, +3 % de vitesse']] : [])],
    });
    sfx('level');
    buzz(40);
    return true;
}

// objectifs de fête prêts à réclamer
export const eventReady = () => (eventActive() ? state.event.goals.filter(x => x.prog >= x.target && !x.claimed).length : 0);

// ---------------- la semaine (concours) ----------------
export function weekStart(d = today()) {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate() - ((d.getDay() + 6) % 7));
}
export const weekKey = () => dateKey(weekStart());
export const weekEndsIn = () => (weekStart().getTime() + 7 * 864e5 - now()) / 1000;
