// Événements rares (foire aux bestiaux, critique gastronomique, nuée de papillons), contrats de saison,
// histoires des villageois, animaux d'exception et charme du paon.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { view } from '../core/view.js';
import { fmt, pickRand, round5 } from '../core/format.js';
import { emit, toast, sfx, burst, float } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { ANIMALS, STAR_ANIMAL_SPEED, PEACOCK_CHARM } from '../data/animals.js';
import { RECIPES } from '../data/machines.js';
import { VILLAGERS, STORIES } from '../data/village.js';
import { DAYS_PER_SEASON } from '../data/world.js';
import { RARE, CONTRACT_LVL } from '../data/commerce.js';
import { RARE_EVENT_LVL, RARE_EVENT_GAP, RARE_EVENTS } from '../data/surprises.js';
import { isAdult, newAnimal } from './animals.js';
import { challengeOn } from './prestige.js';
import { recipeUnlocked, hasMachine } from './workshop.js';
import { tip } from './tips.js';
import { spend, earn, addXp } from './player.js';
import { clampQuality } from './farm.js';
import { masteryStars } from './mastery.js';
import { addPhoto } from './style.js';
import { dayInSeason } from './world.js';
import { questPool } from './orders.js';
import { heartsOf } from './village.js';
import { villagerHere } from './home.js';

const rnd = ([a, b]) => a + Math.random() * (b - a);
export const starAnimalMult = a => (a && a.star ? STAR_ANIMAL_SPEED : 1);
export const peacockCharm = () => state.animals.filter(a => a.type === 'peacock' && isAdult(a)).length * PEACOCK_CHARM;

// ---------------- événements rares ----------------
export const rareActive = type => !!(state.rare && state.rare.type === type && now() < state.rare.until);
export const rareLeft = () => Math.max(0, ((state.rare && state.rare.until) || 0) - now()) / 1000;
// la nuée de papillons s'ajoute à l'arc-en-ciel
export const butterflyGolden = () => (rareActive('butterflies') ? 3 : 1);

export function rareTick() {
    if (state.level < RARE_EVENT_LVL || !view.started || view.hidden || !state.tutorial.done) return false;
    const r = state.rare,
        t = now();
    if (r.type) {
        if (t < r.until) return false;
        endRare();
        return true;
    }
    if (!r.next) {
        r.next = t + rnd(RARE_EVENT_GAP);
        return false;
    }
    if (t < r.next) return false;
    return startRare();
}

function pickRareType() {
    const list = Object.entries(RARE_EVENTS).filter(([id]) => id !== 'fair' || !challengeOn('noAnimals'));
    let x = Math.random() * list.reduce((a, [, e]) => a + e.weight, 0);
    for (const [id, e] of list) {
        x -= e.weight;
        if (x <= 0) return id;
    }
    return list[0][0];
}

// plats que le critique peut demander : des recettes que vous savez déjà faire
function criticDishes() {
    const food = ['kitchen', 'bakery', 'confectionery', 'icecream', 'dairy', 'pastaworks', 'teahouse', 'press'];
    return Object.values(RECIPES).filter(r => food.includes(r.machine) && !r.fete && recipeUnlocked(r.id) && hasMachine(r.machine) && ITEMS[r.id].sell);
}

export function startRare(force) {
    const type = force || pickRareType(),
        r = state.rare,
        t = now();
    const E = RARE_EVENTS[type];
    Object.assign(r, { type, until: t + E.time, offers: [], dish: null, served: false });
    if (type === 'fair') {
        // parmi les animaux les plus précieux déjà disponibles
        const pool = Object.values(ANIMALS)
            .filter(a => state.level >= a.reqLvl)
            .sort((a, b) => b.cost - a.cost)
            .slice(0, 5);
        r.offers = pool
            .sort(() => Math.random() - 0.5)
            .slice(0, 2)
            .map(a => ({ id: a.id, price: Math.round((a.cost * 5) / 50) * 50, sold: false }));
    }
    if (type === 'critic') {
        const list = criticDishes();
        if (!list.length) {
            r.type = null;
            r.next = t + 10 * 60 * 1000;
            return false;
        }
        r.dish = pickRand(list).id;
    }
    state.stats.rareEvents = (state.stats.rareEvents || 0) + 1;
    if (view.started) {
        toast(`${E.name} !`, ['ui', E.icon]);
        sfx('level');
        tip('rareEvent');
    }
    return true;
}

export function endRare() {
    const r = state.rare;
    if (r.type === 'critic' && !r.served && view.started) toast('Le critique est reparti sans goûter…', ['ui', 'critic']);
    Object.assign(r, { type: null, until: 0, offers: [], dish: null, served: false, next: now() + rnd(RARE_EVENT_GAP) });
}

export function buyStarAnimal(k, at) {
    const r = state.rare,
        o = r.offers && r.offers[k];
    if (!rareActive('fair') || !o || o.sold) return false;
    if (challengeOn('noAnimals')) return false;
    if (state.money < o.price) {
        toast('Pas assez d’argent', ['ui', 'coin']);
        sfx('error');
        return false;
    }
    spend(o.price);
    o.sold = true;
    const a = newAnimal(o.id);
    a.star = true;
    state.animals.push(a);
    burst(at, 'sparkle', 16);
    sfx('buy');
    toast(`${a.name}, ${ANIMALS[o.id].name.toLowerCase()} d’exception, rejoint le pâturage`, ['animal', o.id]);
    return true;
}

export function serveCritic(at) {
    const r = state.rare,
        id = r.dish;
    if (!rareActive('critic') || r.served || !id || state.inventory[id] < 1) return false;
    state.inventory[id]--;
    clampQuality(id);
    r.served = true;
    const stars = Math.min(5, 2 + masteryStars(id) + (Math.random() < 0.45 ? 1 : 0));
    const coins = round5(ITEMS[id].sell * stars * 4),
        xp = 80 * stars;
    earn(coins, at);
    addXp(xp, at);
    burst(at, 'sparkle', 8 + stars * 4);
    if (stars === 5) {
        state.prestige.rubans++;
        addPhoto('ui', 'critic', 'Cinq étoiles du critique', ITEMS[id].name);
    }
    state.stats.criticStars = Math.max(state.stats.criticStars || 0, stars);
    const name = ITEMS[id].name;
    emit('celebrate', {
        icon: ['ui', 'critic'],
        title: `${'★'.repeat(stars)}${'☆'.repeat(5 - stars)}`,
        sub:
            stars === 5
                ? `« ${name} : un chef-d’œuvre. Je reviendrai. »`
                : stars >= 4
                  ? `« ${name} : excellent, presque parfait. »`
                  : `« ${name} : honnête. La maîtrise viendra. »`,
        lines: [
            [['ui', 'coin'], `${fmt(coins)} pièces`],
            ...(stars === 5 ? [[['ui', 'ribbon'], '1 ruban de concours']] : []),
            ...(stars < 5 ? [[['ui', 'medalG'], 'Astuce : plus vous maîtrisez un plat, meilleure est la note.']] : []),
        ],
    });
    sfx('level');
    r.until = now() + 1500;
    return true;
}

// ---------------- contrats de saison ----------------
export const seasonKey = () => Math.floor((state.day - 1) / DAYS_PER_SEASON);
export const seasonDaysLeft = () => DAYS_PER_SEASON - dayInSeason() + 1;

export function ensureContract() {
    if (state.level < CONTRACT_LVL) return false;
    const key = seasonKey(),
        c = state.contract;
    if (c && c.key === key) return false;
    const pool = questPool().filter(i => i.sell >= 20 && !(RECIPES[i.id] && RECIPES[i.id].fete));
    if (!pool.length) return false;
    const it = pickRand(pool);
    const qty = Math.max(10, Math.min(200, Math.round((1000 + state.level * 300) / it.sell / 5) * 5));
    const coins = round5(it.sell * qty * 2.2);
    state.contract = { key, item: it.id, qty, given: 0, done: false, coins, xp: Math.round(coins * 0.08) };
    if (view.started && c) toast(`Nouveau contrat de saison : ${qty} × ${it.name.toLowerCase()}`, ['ui', 'calendar']);
    if (view.started) tip('contract');
    return true;
}

export function giveContract(at) {
    const c = state.contract;
    if (!c || c.done) return false;
    const n = Math.min(state.inventory[c.item] || 0, c.qty - c.given);
    if (n <= 0) {
        toast(`Il vous faut des ${ITEMS[c.item].name.toLowerCase()}`, ['item', c.item]);
        sfx('error');
        return false;
    }
    state.inventory[c.item] -= n;
    clampQuality(c.item);
    c.given += n;
    float(at, [`+${n}`, ['item', c.item]], '', -20);
    sfx('load');
    if (c.given >= c.qty) {
        c.done = true;
        earn(c.coins, at);
        addXp(c.xp, at);
        RARE.forEach(id => (state.inventory[id] += 2));
        state.stats.contractsDone = (state.stats.contractsDone || 0) + 1;
        burst(at, 'sparkle', 20);
        emit('confetti');
        toast('Contrat de saison rempli : 2 planches, 2 clous et 2 pots de peinture en prime', ['item', 'paint']);
    }
    return true;
}

export const contractReady = () => {
    const c = state.contract;
    return !!(c && !c.done && state.level >= CONTRACT_LVL && (state.inventory[c.item] || 0) >= c.qty - c.given);
};

// ---------------- histoires des villageois ----------------
export const storyState = vid => state.stories[vid] || (state.stories[vid] = { step: 0, given: {} });
export const villagerStoryOpen = vid => !!STORIES[vid] && heartsOf(vid) >= 5 && villagerHere(vid) && storyState(vid).step < STORIES[vid].steps.length;
export const storyNeed = vid => STORIES[vid].steps[storyState(vid).step][1];
export const storyLeftOf = (vid, item) => Math.max(0, storyNeed(vid)[item] - (storyState(vid).given[item] || 0));
export const villagerStoryReady = vid => villagerStoryOpen(vid) && Object.keys(storyNeed(vid)).every(k => (state.inventory[k] || 0) >= storyLeftOf(vid, k));
export const storiesReady = () => Object.keys(STORIES).filter(villagerStoryReady).length;

export function giveStory(vid, at) {
    if (!villagerStoryOpen(vid)) return false;
    const st = storyState(vid),
        need = storyNeed(vid);
    let any = false;
    for (const item of Object.keys(need)) {
        const n = Math.min(state.inventory[item] || 0, storyLeftOf(vid, item));
        if (n > 0) {
            state.inventory[item] -= n;
            clampQuality(item);
            st.given[item] = (st.given[item] || 0) + n;
            any = true;
        }
    }
    if (!any) {
        toast('Rien à apporter pour le moment', ['villager', vid]);
        sfx('error');
        return false;
    }
    sfx('load');
    if (Object.keys(need).every(k => storyLeftOf(vid, k) === 0)) {
        const value = Object.entries(need).reduce((a, [k, n]) => a + (ITEMS[k].sell || 50) * n, 0);
        const coins = round5(value * 2.5);
        earn(coins, at);
        addXp(Math.round(value * 0.3), at);
        st.step++;
        st.given = {};
        burst(at, 'sparkle', 16);
        const S = STORIES[vid];
        if (st.step >= S.steps.length) {
            state.prestige.rubans++;
            state.stats.stories = (state.stats.stories || 0) + 1;
            addPhoto('villager', vid, S.title, `L’histoire de ${VILLAGERS[vid].name}`);
            emit('storyEnd', { vid, coins });
            sfx('level');
        } else toast(`${VILLAGERS[vid].name} : étape ${st.step} sur 3 réussie (+${fmt(coins)} pièces)`, ['villager', vid]);
    }
    return true;
}
