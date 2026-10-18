// La ferme la nuit (1.2) : lucioles et bocal, étoile filante et vœux, chouette du nichoir, marché de nuit l'été.
import { state, scaleLvl, lvOk } from '../core/state.js';
import { now } from '../core/clock.js';
import { view } from '../core/view.js';
import { fmt } from '../core/format.js';
import { toast, sfx, buzz, burst, float } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { DECOS } from '../data/farm.js';
import { NIGHT, WISHES } from '../data/night.js';
import { isNight, hour, season } from './world.js';
import { earn, addXp, spend } from './player.js';
import { storyOk } from './story.js';

export function ensureNight() {
    const N = (state.night = state.night || {});
    N.flies = N.flies || [];
    N.jar = N.jar || 0;
    N.jars = N.jars || 0;
    N.uid = N.uid || 1;
    return N;
}
export const nightOpen = () => state.level >= NIGHT.lvl;
// une nuit va de 20 h au lendemain 6 h : elle porte le numéro du jour où elle commence
export const nightKey = () => (hour() >= 20 ? state.day : state.day - 1);
export const fliesSeason = () => NIGHT.flySeasons.includes(season().id);
export const owlHere = () => state.grid.some(p => p.deco === 'owlBox');
export const wishActive = k => {
    const w = state.night && state.night.wish;
    if (!w || w.kind !== k) return false;
    if (w.until && now() >= w.until) return false;
    if (w.left !== undefined && w.left <= 0) return false;
    return true;
};

// ---------------- chaque seconde ----------------
export function nightTick() {
    if (!nightOpen()) return false;
    const N = ensureNight(),
        t = now();
    let changed = false;
    if (N.wish && !wishActive(N.wish.kind)) {
        N.wish = null;
        changed = true;
    }
    if (!isNight()) {
        if (N.flies.length || N.star) changed = true;
        N.flies = [];
        N.star = null;
        return changed;
    }
    // une nouvelle nuit : l'étoile filante passera peut-être, le marché de nuit change
    const key = nightKey();
    if (N.key !== key) {
        N.key = key;
        N.starAt = Math.random() < NIGHT.starChance ? t + (10 + Math.random() * 90) * 1000 : 0;
        N.market = marketOffers();
        changed = true;
    }
    // les lucioles (printemps et été)
    const before = N.flies.length;
    N.flies = N.flies.filter(f => f.until > t);
    if (fliesSeason() && state.settings.fireflies !== false && N.flies.length < NIGHT.flyMax && Math.random() < 1 / NIGHT.flyEvery)
        N.flies.push({ id: N.uid++, x: 6 + Math.random() * 82, y: 8 + Math.random() * 78, until: t + NIGHT.flyLife });
    if (N.flies.length !== before) changed = true;
    // l'étoile filante
    if (N.starAt && t >= N.starAt) {
        N.starAt = 0;
        N.star = { until: t + NIGHT.starLife, y: 12 + Math.random() * 18 };
        if (view.started) sfx('pop');
        changed = true;
    }
    if (N.star && t >= N.star.until) {
        N.star = null;
        changed = true;
    }
    return changed;
}

// ---------------- les lucioles ----------------
// 1.9 : les lucioles ne s'attrapent plus au doigt (elles gênaient les récoltes) ;
// une récolte de nuit, au printemps ou en été, en met une dans le bocal
export function fireflyHarvest(at) {
    if (!nightOpen() || !isNight() || !fliesSeason()) return false;
    return addFly(at);
}
export function catchFly(id, at) {
    const N = ensureNight();
    const k = N.flies.findIndex(f => f.id === +id);
    if (k < 0) return false;
    N.flies.splice(k, 1);
    return addFly(at);
}
function addFly(at) {
    const N = ensureNight();
    N.jar++;
    state.stats.flies = (state.stats.flies || 0) + 1;
    addXp(NIGHT.flyXp, at);
    burst(at, 'sparkle', 6);
    sfx('pop');
    buzz(10);
    if (N.jar >= NIGHT.jar) {
        N.jar = 0;
        N.jars++;
        if (N.jars === 1) {
            state.decorInv.fireflyJar = (state.decorInv.fireflyJar || 0) + 1;
            toast(`Bocal rempli ! Une décoration unique : ${DECOS.fireflyJar.name}`, ['ui', 'fireflyJar']);
        } else {
            const coins = Math.round((300 + scaleLvl() * 150) / 10) * 10;
            earn(coins, at);
            toast(`Bocal rempli ! Vous relâchez les lucioles : ${fmt(coins)} pièces`, ['ui', 'fireflyJar']);
        }
        sfx('golden');
    } else if (at) float(at, [`${N.jar} / ${NIGHT.jar}`, ['ui', 'firefly']], '', -40);
    return true;
}

// ---------------- l'étoile filante et les vœux ----------------
export function catchStar(at) {
    const N = ensureNight();
    if (!N.star) return false;
    N.star = null;
    const w = WISHES[Math.floor(Math.random() * WISHES.length)];
    state.stats.wishes = (state.stats.wishes || 0) + 1;
    if (w.kind === 'gift') {
        const coins = Math.round((500 + scaleLvl() * 250) / 10) * 10;
        earn(coins, at);
        ['plank', 'nail', 'paint'].forEach(id => (state.inventory[id] += 2));
        toast(`Vœu exaucé : ${fmt(coins)} pièces, 2 planches, 2 clous et 2 pots de peinture !`, ['ui', 'wishStar']);
    } else {
        N.wish = { kind: w.kind, ...(w.left ? { left: w.left } : {}), ...(w.secs ? { until: now() + w.secs * 1000 } : {}) };
        toast(`Vœu exaucé : ${w.text}`, ['ui', 'wishStar']);
    }
    burst(at, 'sparkle', 24);
    sfx('golden');
    buzz(40);
    return true;
}
// une récolte du champ : le vœu « récoltes en or » passe la qualité à l'or
export function wishGold() {
    if (!wishActive('gold')) return false;
    state.night.wish.left--;
    return true;
}
export const wishAnimals = () => wishActive('animals');

// ---------------- le marché de nuit (été) ----------------
export const nightMarketOpen = () => nightOpen() && state.level >= NIGHT.marketLvl && isNight() && NIGHT.marketSeasons.includes(season().id);
function marketOffers() {
    const crops = Object.values(ITEMS).filter(i => i.type === 'crop' && !i.island && !i.exotic && !i.ghOnly && lvOk(i) && storyOk(i));
    const c = crops.length ? crops[Math.floor(Math.random() * crops.length)] : ITEMS.wheat;
    return [
        { kind: 'deco', id: 'lantern', price: Math.round(DECOS.lantern.cost * 0.8) },
        { kind: 'deco', id: 'owlBox', price: Math.round(DECOS.owlBox.cost * 0.8) },
        { kind: 'seeds', id: c.id, n: 10, price: Math.round(c.cost * 10 * 0.6) },
    ];
}
export function buyNight(k, at) {
    const N = ensureNight(),
        o = N.market && N.market[k];
    if (!o || o.sold || !nightMarketOpen()) return false;
    if (state.money < o.price) {
        toast('Pas assez de pièces', ['ui', 'coin']);
        return false;
    }
    spend(o.price);
    o.sold = true;
    if (o.kind === 'deco') state.decorInv[o.id] = (state.decorInv[o.id] || 0) + 1;
    else state.seeds[o.id] = (state.seeds[o.id] || 0) + o.n;
    sfx('coin');
    burst(at, 'sparkle', 8);
    toast(
        o.kind === 'deco' ? `${DECOS[o.id].name} : dans vos décorations` : `${o.n} graines de ${ITEMS[o.id].name.toLowerCase()}`,
        o.kind === 'deco' ? ['ui', o.id] : ['item', o.id],
    );
    return true;
}
