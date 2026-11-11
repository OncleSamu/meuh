// 1.100 (étape 1) : le camping de la vallée (voir data/camping.js).
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { view } from '../core/view.js';
import { toast, sfx, burst } from '../core/bus.js';
import { RECIPES } from '../data/machines.js';
import { ITEMS } from '../data/items.js';
import { CAMPING, WANTS, PROFILES, ORIGINS, FIRST_NAMES, CAMP_UPGRADES, SAYINGS, STARS, REGULARS, CAMP_EVENTS, EVENT_BONUS } from '../data/camping.js';
import { RESIDENTS, JOBS, JOB_FX } from '../data/campers.js';
import { randomId, rng } from '../art/habitants.js';
import { hasCost, payCost } from './home.js';
import { earn, addXp } from './player.js';
import { canGet, haveQ, takeQ } from './defis.js';
import { ecoLvl } from '../core/state.js';

export const campOpen = () => state.level >= CAMPING.lvl;
export const campBuilt = () => !!state.camping;
export const campGuests = () => (state.camping ? state.camping.guests : []);
export const campPitches = () => (state.camping ? state.camping.pitches : 0);
export const campFree = () => campPitches() - campGuests().length;
export const canBuildCamp = () => campOpen() && !state.camping && hasCost(CAMPING.cost);
export function buildCamp(at) {
    if (!canBuildCamp()) return false;
    payCost(CAMPING.cost);
    state.camping = { pitches: CAMPING.pitches, guests: [], past: [], next: now(), hosted: 0, up: {}, till: 0, tillAt: now() };
    sfx('level');
    burst(at, 'sparkle', 14);
    toast('Le camping de la vallée ouvre ses portes !', ['ui', 'heart']);
    return true;
}
export const campUp = id => !!(state.camping && state.camping.up[id]);
export const upCan = id => !!state.camping && !campUp(id) && hasCost(CAMP_UPGRADES[id].cost);
export function buyUp(id) {
    if (!upCan(id)) return false;
    payCost(CAMP_UPGRADES[id].cost);
    state.camping.up[id] = 1;
    state.camping.tillAt = now();
    sfx('level');
    toast(`${CAMP_UPGRADES[id].name} : aménagé !`, ['ui', 'heart']);
    return true;
}
export const pitchCost = () => (state.camping && state.camping.pitches < CAMPING.maxPitches ? CAMPING.pitchCost(state.camping.pitches + 1) : 0);
export const canAddPitch = () => !!state.camping && state.camping.pitches < CAMPING.maxPitches && state.money >= pitchCost();
export function addPitch() {
    if (!canAddPitch()) return false;
    payCost({ coins: pitchCost() });
    state.camping.pitches++;
    state.camping.tillAt = state.camping.tillAt || now();
    sfx('level');
    return true;
}
const mult = k => Object.keys(state.camping ? state.camping.up : {}).reduce((a, id) => a * (CAMP_UPGRADES[id][k] || 1), 1);
const tipRate = () => CAMPING.tip + Object.keys(state.camping.up).reduce((a, id) => a + (CAMP_UPGRADES[id].tip || 0), 0) + resBonus('tip');
export const campGap = () => CAMPING.gap.map(x => x * mult('gap') * (1 - Math.min(0.5, resBonus('gap'))));

// ---- 1.102 : les métiers des résidents ----
// le métier enregistré est accordé (boulangère) : on retrouve la forme masculine, qui sert de clé à JOB_FX
export const jobKey = r => {
    for (const l of Object.values(JOBS)) for (const [m, f] of l) if (r.job === m || r.job === f) return m;
    return null;
};
export const jobFx = r => JOB_FX[jobKey(r)] || null;
export const resHeartsOf = r => RESIDENTS.hearts.filter(v => (r.fr || 0) >= v).length;
// la somme d'un bonus de métier, pour tous les résidents, multiplié par leurs cœurs
// 1.104.5 : chaque bonus est plafonné (à peu près deux résidents à cinq cœurs)
export const RES_CAPS = { gap: 0.5, stay: 0.5, tip: 0.3, pay: 0.2, fish: 0.6, till: 0.6, xp: 1, order: 0.5, star: 0.2 };
export const resBonus = k => Math.min(RES_CAPS[k] ?? Infinity, state.camping && state.camping.res ? state.camping.res.reduce((a, r) => a + ((jobFx(r) || {})[k] || 0) * resHeartsOf(r), 0) : 0);

// ---- 1.102 : l'événement du jour ----
const dayIndex = () => {
    const t = new Date(now());
    return Math.floor((t.getTime() - t.getTimezoneOffset() * 60000) / 86400000);
};
export const campEventsAll = () => CAMP_EVENTS;
export const campEvent = () => CAMP_EVENTS[dayIndex() % CAMP_EVENTS.length];
const sets = {};
export const inKind = (id, k) => (sets[k] = sets[k] || new Set(pool(k))).has(id);
export const eventBoosts = id => campEvent().kinds.some(k => inKind(id, k));

// ---- les envies ----
const memo = {};
function pool(kind) {
    if (!memo[kind]) {
        const w = WANTS[kind];
        memo[kind] = w.types
            ? Object.values(ITEMS).filter(i => w.types.includes(i.type) && i.sell).map(i => i.id)
            : Object.values(RECIPES).filter(r => w.machines.includes(r.machine) && ITEMS[r.id] && ITEMS[r.id].sell && !r.fete && !r.holiday).map(r => r.id);
    }
    return memo[kind];
}
export function pickWant(kind, taken, r) {
    const all = pool(kind).filter(id => !taken.includes(id));
    const ok = all.filter(canGet);
    const l = ok.length ? ok : all;
    return l.length ? l[Math.floor(r() * l.length)] : null;
}
export const starChance = () => STARS.chance + resBonus('star');
// opts (tests) : { star: index dans STARS.who, regular: nom d'un ancien campeur, plain: ni l'un ni l'autre }
export function newGuest(t = now(), seed, opts = {}) {
    const c = state.camping;
    seed = seed ?? (Date.now() ^ (c.hosted * 7919) ^ Math.floor(Math.random() * 1e6)) >>> 0;
    const r = rng(seed);
    const used = [...c.guests, ...(c.res || []), ...(c.asks || [])].map(g => g.name);
    // un habitué qui revient, ou un campeur remarquable, ou un inconnu
    const olds = (c.past || []).filter(p => p.mood === 2 && !used.includes(p.name));
    const back = opts.regular ? olds.find(p => p.name === opts.regular) : !opts.plain && opts.star == null && olds.length && r() < REGULARS.chance ? olds[Math.floor(r() * olds.length)] : null;
    const starOk = !c.guests.some(g => g.star != null);
    const star = back ? null : opts.star != null ? opts.star : !opts.plain && starOk && r() < starChance() ? Math.floor(r() * STARS.who.length) : null;
    const pid = back ? back.profile : star != null ? STARS.who[star].profile : Object.keys(PROFILES)[Math.floor(r() * Object.keys(PROFILES).length)];
    const woman = back ? !!back.woman : r() < 0.5;
    const stay = (CAMPING.stay[0] + r() * (CAMPING.stay[1] - CAMPING.stay[0])) * mult('stay') * (1 + resBonus('stay'));
    const taken = [];
    const wants = [];
    for (const k of PROFILES[pid].wants) {
        const id = pickWant(k, taken, r);
        if (id) {
            taken.push(id);
            wants.push(star != null ? { item: id, done: false, q: STARS.q } : { item: id, done: false });
        }
    }
    const names = FIRST_NAMES.filter(n => !used.includes(n));
    const say = SAYINGS[pid];
    const g = {
        look: back ? back.look : randomId(seed, woman ? { female: true } : { male: true }),
        name: back ? back.name : names[Math.floor(r() * names.length)] || FIRST_NAMES[0],
        from: back ? back.from : ORIGINS[Math.floor(r() * ORIGINS.length)],
        profile: pid,
        woman,
        arrive: t,
        leave: t + stay,
        wants,
        say: star != null ? STARS.who[star].say : say[Math.floor(r() * say.length)],
    };
    if (star != null) g.star = star;
    if (back) {
        c.visits = c.visits || {};
        g.visits = (c.visits[back.name] || 1) + 1;
        c.past = c.past.filter(p => p !== back);
    }
    c.guests.push(g);
    c.hosted++;
    if (view.started)
        toast(
            back ? `${g.name} revient au camping (${g.visits}e séjour)` : star != null ? `${g.name}, ${STARS.who[star].name.toLowerCase()}, arrive au camping !` : `${g.name} ${g.from} plante sa tente au camping`,
            ['ui', back || star != null ? 'star' : 'heart'],
        );
    return g;
}
export const guestTitle = g => (g.star != null ? STARS.who[g.star].name : g.visits > 1 ? `Habitué${g.woman ? 'e' : ''} · ${g.visits}e séjour` : PROFILES[g.profile].name);
// le prix au camping : ×2, les aménagements, le peintre, le poissonnier, l'événement du jour, un campeur remarquable
export const priceOf = (id, g) =>
    Math.round(ITEMS[id].sell * CAMPING.pay * mult('pay') * (1 + resBonus('pay')) * (inKind(id, 'fish') ? 1 + resBonus('fish') : 1) * (eventBoosts(id) ? EVENT_BONUS : 1) * (g && g.star != null ? STARS.pay : 1));
export const wantQ = w => w.q || 0;
export const canSell = (g, i) => !!g.wants[i] && !g.wants[i].done && haveQ(g.wants[i].item, wantQ(g.wants[i])) >= 1;
export function sellTo(gi, i, at) {
    const g = campGuests()[gi];
    if (!g || !canSell(g, i)) return false;
    const w = g.wants[i];
    takeQ(w.item, 1, wantQ(w));
    w.done = true;
    earn(priceOf(w.item, g), at);
    checkRavi(g);
    state.stats.campSales = (state.stats.campSales || 0) + 1;
    sfx('coin');
    burst(at, 'sparkle', 8);
    return true;
}
export const guestMood = g => {
    const n = g.wants.filter(w => w.done).length;
    return n === g.wants.length ? 2 : n > 0 ? 1 : 0; // 0 déçu, 1 content, 2 ravi
};
export const MOODS = ['Déçu', 'Content', 'Ravi'];
// eslint-disable-next-line no-var -- var : les imports circulaires (residents.js) appellent setLeaveHook avant cette ligne
var leaveHook;
export function setLeaveHook(f) {
    leaveHook = f;
}
// 1.104.4 : un campeur ravi demande parfois à rester, depuis sa tente (residents.js décide)
// eslint-disable-next-line no-var -- var : même raison que leaveHook
var raviHook;
export function setRaviHook(f) {
    raviHook = f;
}
function checkRavi(g) {
    if (g.asked || guestMood(g) !== 2) return;
    g.asked = true;
    if (raviHook) raviHook(g);
}
// stay : il range sa tente pour s'installer dans une cabane (pas de demande au portail)
export const leaveToStay = (g, at) => leave(g, at, true);
function leave(g, at, stay = false) {
    const mood = guestMood(g);
    const loyal = Math.min(REGULARS.tipMax, ((g.visits || 1) - 1) * REGULARS.tip);
    const tip = mood === 2 ? Math.round(g.wants.reduce((a, w) => a + priceOf(w.item, g), 0) * (tipRate() + loyal + (g.star != null ? STARS.tip : 0))) : 0;
    const c = state.camping;
    c.visits = c.visits || {};
    c.visits[g.name] = g.visits || 1;
    if (g.star == null) c.past.unshift({ name: g.name, look: g.look, from: g.from, profile: g.profile, woman: g.woman, mood });
    if (mood === 2 && leaveHook && !stay) leaveHook(g);
    c.past.length = Math.min(c.past.length, CAMPING.keep);
    c.guests = c.guests.filter(x => x !== g);
    if (tip) earn(tip, at);
    addXp(CAMPING.xp * (mood === 2 ? 1 : mood === 1 ? 0.5 : 0.2) * (1 + resBonus('xp')) * (g.star != null && mood === 2 ? STARS.xp : 1), at);
    state.stats.campGuests = (state.stats.campGuests || 0) + 1;
    if (g.star != null && mood === 2) state.stats.campStars = (state.stats.campStars || 0) + 1;
    if ((g.visits || 1) > 1) state.stats.campRegulars = (state.stats.campRegulars || 0) + 1;
    if (mood === 2) state.stats.campHappy = (state.stats.campHappy || 0) + 1;
    if (view.started && !stay) toast(`${g.name} repart ${MOODS[mood].toLowerCase()}${tip ? ` · pourboire ${tip}` : ''}`, ['ui', 'coin']);
}
// ---- l'épicerie : une caisse qui se remplit hors ligne ----
export const tillCap = () => CAMPING.tillHours * tillPerHour();
const tillPerHour = () => ecoLvl() * CAMPING.tillRate * (state.camping ? state.camping.pitches : 0) * (1 + resBonus('till'));
export function tillTick() {
    const c = state.camping;
    if (!c || !c.up.shop) return;
    const dt = Math.max(0, now() - (c.tillAt || now())) / 3600000;
    c.tillAt = now();
    c.till = Math.min(tillCap(), (c.till || 0) + dt * tillPerHour());
}
export const tillAmount = () => (state.camping && state.camping.up.shop ? Math.floor(state.camping.till || 0) : 0);
export function collectTill(at) {
    const n = tillAmount();
    if (n <= 0) return false;
    state.camping.till = 0;
    earn(n, at);
    sfx('coin');
    return true;
}
export function campTick() {
    const c = state.camping;
    if (!c) return false;
    let changed = false;
    for (const g of c.guests) checkRavi(g);
    for (const g of c.guests.slice()) if (now() >= g.leave) (leave(g, null), (changed = true));
    tillTick();
    if (view.started && !view.hidden && campFree() > 0 && now() >= c.next) {
        newGuest();
        const [a, b] = campGap();
        c.next = now() + a + Math.random() * (b - a);
        changed = true;
    }
    return changed;
}
export const campReady = () => (state.camping ? state.camping.guests.filter(g => g.wants.some((_, i) => canSell(g, i))).length + (tillAmount() > 0 ? 1 : 0) : 0);
