// 1.100 (étape 2) : les résidents du camping (voir data/campers.js).
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { view } from '../core/view.js';
import { toast, sfx, burst } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { PROFILES } from '../data/camping.js';
import { RESIDENTS, JOBS, STORY_LINES, STORY_FLAVOR } from '../data/campers.js';
import { rng } from '../art/habitants.js';
import { hasCost, payCost } from './home.js';
import { earn, addXp } from './player.js';
import { haveQ, takeQ } from './defis.js';
import { pickWant, setLeaveHook } from './camping.js';

const C = () => state.camping;
export const campRes = () => (C() ? C().res || [] : []);
export const campAsks = () => (C() ? C().asks || [] : []);
export const resCabinCost = () => RESIDENTS.cabin(campRes().length + 1);
export const resCanAccept = () => campRes().length < RESIDENTS.max && hasCost({ coins: resCabinCost() });
export const resHearts = r => RESIDENTS.hearts.filter(v => r.fr >= v).length;

// un campeur ravi qui part demande parfois à rester
function onHappyLeave(g) {
    const c = C();
    if (!c) return;
    c.res = c.res || [];
    c.asks = c.asks || [];
    if (c.res.length + c.asks.length >= RESIDENTS.max || c.asks.length >= RESIDENTS.maxAsks) return;
    if (Math.random() >= RESIDENTS.askChance) return;
    const names = [...c.res, ...c.asks, ...c.guests.filter(x => x !== g)].map(x => x.name);
    if (names.includes(g.name)) return;
    const jobs = JOBS[g.profile];
    const job = jobs[Math.floor(Math.random() * jobs.length)][g.woman ? 1 : 0];
    c.asks.push({ look: g.look, name: g.name, from: g.from, profile: g.profile, woman: !!g.woman, job });
    if (view.started) toast(`${g.name} ${g.from} voudrait s’installer au camping`, ['ui', 'heart']);
}
setLeaveHook(onHappyLeave);

export function newResident(a, seed = Math.floor(Math.random() * 1e9)) {
    const r = rng(seed);
    const likes = [];
    for (const k of PROFILES[a.profile].wants) {
        const id = pickWant(k, likes, r);
        if (id) likes.push(id);
    }
    const spare = pickWant(PROFILES[a.profile].wants[0], likes, r);
    const res = { ...a, id: seed, fr: 0, likes, loved: spare || likes[0], seen: false, stories: [], arrived: now(), gift: 0, order: null, wait: 0, done: 0 };
    return res;
}
export function resAccept(i, at) {
    const a = campAsks()[i];
    if (!a || !resCanAccept()) return false;
    payCost({ coins: resCabinCost() });
    C().asks.splice(i, 1);
    const r = newResident(a);
    C().res.push(r);
    resMakeOrder(r);
    state.stats.campResidents = (state.stats.campResidents || 0) + 1;
    addXp(RESIDENTS.xp, at);
    sfx('level');
    burst(at, 'sparkle', 14);
    toast(`${r.name} s’installe dans une cabane du camping !`, ['ui', 'heart']);
    return true;
}
export function resDecline(i) {
    const a = campAsks()[i];
    if (!a) return false;
    C().asks.splice(i, 1);
    return true;
}
// faire partir un résident : on demande confirmation (deuxième appui)
export function resLeave(i) {
    const r = campRes()[i];
    if (!r) return false;
    if (C().confirm !== r.id) {
        C().confirm = r.id;
        return true;
    }
    C().confirm = null;
    C().res.splice(i, 1);
    toast(`${r.name} plie bagage et s’en va`, ['ui', 'heart']);
    return true;
}
export const resConfirming = r => !!C() && C().confirm === r.id;

// ---- le cadeau ----
export const resGiftReady = r => now() >= (r.gift || 0) + RESIDENTS.gift.cool;
export const resCanGift = (r, id) => resGiftReady(r) && haveQ(id, 0) >= 1;
function addPts(r, n, at) {
    const before = resHearts(r);
    r.fr += n;
    const h = resHearts(r);
    if (h > before) {
        sfx('level');
        if (view.started) toast(`${r.name} : ${h} cœur${h > 1 ? 's' : ''} !`, ['ui', 'heart']);
        RESIDENTS.stories.forEach((need, k) => {
            if (h >= need && r.stories.length <= k) r.stories.push(resStory(r, k));
        });
        if (h >= 6) r.seen = true; // le produit adoré se révèle à 6 cœurs
        if (h >= 10) state.stats.campFriends = (state.stats.campFriends || 0) + 1;
    }
}
export function resGift(i, id, at) {
    const r = campRes()[i];
    if (!r || !resCanGift(r, id)) return false;
    takeQ(id, 1, 0);
    r.gift = now();
    const love = id === r.loved;
    addPts(r, love ? RESIDENTS.gift.love : r.likes.includes(id) ? RESIDENTS.gift.like : RESIDENTS.gift.other, at);
    if (love) r.seen = true;
    sfx('coin');
    burst(at, 'sparkle', love ? 14 : 8);
    return true;
}
// ---- la commande permanente ----
export function resMakeOrder(r) {
    const ok = r.likes.filter(id => ITEMS[id]);
    const id = ok[Math.floor(Math.random() * ok.length)];
    r.order = id ? { item: id, n: 1 + Math.floor(Math.random() * RESIDENTS.order.qty) } : null;
}
export const resOrderValue = r => (r.order ? Math.round(ITEMS[r.order.item].sell * r.order.n * RESIDENTS.order.pay) : 0);
export const resCanDeliver = r => !!r.order && haveQ(r.order.item, 0) >= r.order.n;
export function resDeliver(i, at) {
    const r = campRes()[i];
    if (!r || !resCanDeliver(r)) return false;
    takeQ(r.order.item, r.order.n, 0);
    earn(resOrderValue(r), at);
    r.done++;
    r.order = null;
    r.wait = now() + RESIDENTS.order.wait;
    addPts(r, RESIDENTS.order.pts, at);
    sfx('coin');
    return true;
}
// ---- les histoires ----
export function resStory(r, tier, seed = Math.floor(Math.random() * 1e9)) {
    const rn = rng(seed);
    const pick = a => a[Math.floor(rn() * a.length)];
    const pro = r.woman ? 'Elle' : 'Il';
    const sub = s =>
        s
            .replaceAll('{n}', r.name)
            .replaceAll('{from}', r.from)
            .replaceAll('{job}', r.job)
            .replaceAll('{loved}', ITEMS[r.loved].name.toLowerCase())
            .replaceAll('{like}', ITEMS[pick(r.likes)].name.toLowerCase())
            .replaceAll('{Il}', pro)
            .replaceAll('{il}', pro.toLowerCase());
    return sub(pick(STORY_LINES[tier])) + ' ' + sub(pick(STORY_FLAVOR[r.profile]));
}
export function residentTick() {
    if (!C() || !C().res) return false;
    let changed = false;
    for (const r of C().res) if (!r.order && now() >= (r.wait || 0)) (resMakeOrder(r), (changed = true));
    return changed;
}
export const residentReady = () => campRes().filter(r => resCanDeliver(r) || (resGiftReady(r) && r.likes.some(id => haveQ(id, 0) >= 1))).length + (campAsks().length && resCanAccept() ? 1 : 0);
