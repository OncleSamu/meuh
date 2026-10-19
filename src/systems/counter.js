// Le Comptoir (1.17) : thés et cafés préparés à la main (mini-jeu), stock pour les commandes, le train et les quêtes,
// et un salon où les villageois viennent commander. Les produits gardent leurs identifiants.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { view } from '../core/view.js';
import { emit, toast, sfx, buzz, burst, float } from '../core/bus.js';
import { RECIPES } from '../data/machines.js';
import { VILLAGERS } from '../data/village.js';
import { BALANCE } from '../data/progress.js';
import { CLIENT, BREW_COOLDOWN, SALON, DECORS, DECOR_COST, DECOR_PATIENCE, FAVORITE } from '../data/counter.js';
import { heartsOf, addFriendship } from './village.js';
import { presentVillagers, hasCost, payCost } from './home.js';
import { recipeUnlocked, canCook, missingFor, hasMachine, newMachine } from './workshop.js';
import { takeIngredients } from './genetics.js';
import { addQuality, clampAllQuality } from './farm.js';
import { rollYield, addXp, earn } from './player.js';
import { addMastery } from './mastery.js';
import { collect } from './book.js';
import { eventProgress } from './events.js';
import { rollRare } from './barn.js';
import { sellPrice } from './market.js';
import { mExtraYield } from './buildings.js';

const DAY = 86400000;
export const counterRecipes = () => Object.values(RECIPES).filter(r => r.machine === 'counter');
export const counterOwned = () => hasMachine('counter');

export function ensureCounter() {
    const C = (state.counter = state.counter || {});
    C.lvl = C.lvl || 0;
    C.decor = C.decor || {};
    C.seats = Array.isArray(C.seats) ? C.seats : [];
    C.next = C.next || 0;
    C.last = C.last || 0;
    C.day = C.day || 0;
    C.served = C.served || 0;
    C.tips = C.tips || 0;
    C.total = C.total || 0;
    return C;
}

// Anciennes sauvegardes : le salon de thé et la brûlerie deviennent le comptoir ; rien ne se perd
export function migrateCounter() {
    ensureCounter();
    const old = state.machines.filter(m => m.type === 'teahouse' || m.type === 'roastery');
    if (!old.length) return;
    old.forEach(m => {
        for (const [id, n] of Object.entries(m.out || {})) if (n) state.inventory[id] = (state.inventory[id] || 0) + n * (RECIPES[id].outQty || 1);
        for (const id of m.queue || []) if (RECIPES[id]) state.inventory[id] = (state.inventory[id] || 0) + 1;
    });
    const had = state.machines.some(m => m.type === 'counter');
    state.machines = state.machines.filter(m => m.type !== 'teahouse' && m.type !== 'roastery');
    if (!had) state.machines.push(newMachine('counter'));
}

// ---------------- le salon ----------------
export const salonLvl = () => ensureCounter().lvl;
export const salonDef = () => SALON[salonLvl()];
export const salonNext = () => SALON[salonLvl() + 1] || null;
export const decorCount = () => Object.values(ensureCounter().decor).filter(Boolean).length;
export const patienceMax = () => CLIENT.patience * (1 + DECOR_PATIENCE * Math.min(3, decorCount()));
export const dailyLeft = () => {
    const C = ensureCounter();
    return Math.max(0, CLIENT.daily(C.lvl) - (C.day === Math.floor(now() / DAY) ? C.served : 0));
};
function rollDay() {
    const C = ensureCounter(),
        d = Math.floor(now() / DAY);
    if (C.day !== d) {
        C.day = d;
        C.served = 0;
        C.tips = 0;
    }
}

export function salonCanUp() {
    const n = salonNext();
    return !!n && counterOwned() && hasCost(n.cost);
}
export function upgradeSalon() {
    const n = salonNext();
    if (!n || !hasCost(n.cost)) return false;
    payCost(n.cost);
    ensureCounter().lvl++;
    sfx('level');
    toast(`Le salon s’agrandit : ${salonDef().seats} places`, ['machine', 'counter']);
    return true;
}
export function buyDecor(id) {
    const C = ensureCounter();
    if (!DECORS[id] || C.decor[id] || state.money < DECOR_COST[id]) return false;
    payCost({ coins: DECOR_COST[id] });
    C.decor[id] = true;
    sfx('level');
    toast(`${DECORS[id]} : les clients attendront plus longtemps`, ['machine', 'counter']);
    return true;
}

// ---------------- les clients ----------------
// ce qu'un client peut commander : une boisson que vous savez faire (et pas hors de portée)
function orderable() {
    return counterRecipes().filter(r => recipeUnlocked(r.id));
}
function pickDrink(vid) {
    const list = orderable();
    if (!list.length) return null;
    const fav = FAVORITE[vid];
    if (fav && list.some(r => r.id === fav) && Math.random() < 0.35) return fav;
    // plutôt des boissons que l'on peut préparer ou avoir en stock
    const easy = list.filter(r => canCook(r.id) || state.inventory[r.id] > 0);
    const pool = easy.length && Math.random() < 0.7 ? easy : list;
    return pool[Math.floor(Math.random() * pool.length)].id;
}
function newClient() {
    const C = ensureCounter();
    const here = C.seats.map(s => s.vid);
    const cands = presentVillagers().filter(v => !here.includes(v));
    if (!cands.length) return false;
    const vid = cands[Math.floor(Math.random() * cands.length)];
    const drink = pickDrink(vid);
    if (!drink) return false;
    C.seats.push({ vid, drink, left: patienceMax() });
    return true;
}
// appelé chaque seconde par la boucle du jeu : les clients n'arrivent et ne s'impatientent que si le salon est à l'écran
export function counterTick(dt = 1) {
    if (!counterOwned() || !view.started) return false;
    const C = ensureCounter();
    rollDay();
    if (!viewOpen()) return false;
    let changed = false;
    const keep = [];
    for (const s of C.seats) {
        s.left -= dt;
        if (s.left <= 0) {
            changed = true;
            toast(`${VILLAGERS[s.vid].name} est reparti sans sa boisson`, ['villager', s.vid]);
            addFriendshipMiss(s.vid);
        } else keep.push(s);
    }
    C.seats = keep;
    C.next -= dt;
    if (C.next <= 0) {
        C.next = salonDef().every * (0.8 + Math.random() * 0.4);
        if (C.seats.length < salonDef().seats && dailyLeft() > C.seats.length && newClient()) changed = true;
    }
    return changed;
}
// un client déçu ne retire rien : il revient plus tard
const addFriendshipMiss = () => {};
const viewOpen = () => view.tab === 'machines' && view.sub === 'counter' && !view.hidden;
export const counterSeats = () => ensureCounter().seats;

// ---------------- la préparation ----------------
export const counterCooldown = () => Math.max(0, ensureCounter().last + BREW_COOLDOWN * 1000 - now());
export function counterCanBrew(id) {
    const r = RECIPES[id];
    return !!r && r.machine === 'counter' && counterOwned() && recipeUnlocked(id) && canCook(id) && counterCooldown() === 0;
}
// 1 à 3 étoiles : étoiles = niveau de qualité (1 normal, 2 argent, 3 or)
export function counterStart(id) {
    if (!counterCanBrew(id)) {
        if (counterCooldown() > 0) toast('Laissez le comptoir se reposer un instant', ['ui', 'clock']);
        else if (!canCook(id)) toast(`Il manque ${missingFor(id).join(', ')}`, ['item', id]);
        sfx('error');
        return false;
    }
    return true;
}
// le mini-jeu est fini : stars 1 à 3 ; vid = le villageois à servir (ou rien : la boisson va au stock)
export function counterFinish(id, stars, vid, at) {
    const C = ensureCounter();
    if (!canCook(id)) return null;
    // les ingrédients ne sont payés qu'à la fin : quitter en route ne coûte rien
    const job = { id, q: takeIngredients(id) };
    clampAllQuality();
    C.last = now();
    const r = RECIPES[id];
    stars = Math.max(1, Math.min(3, stars | 0));
    const tier = Math.max(stars - 1, job.q || 0);
    const seat = C.seats.findIndex(x => x.vid === vid);
    const s = seat >= 0 ? C.seats[seat] : null;
    const qty = s ? 1 : Math.max(1, Math.round(rollYield() * (r.outQty || 1) + mExtraYield('counter')));
    state.stats.crafted += qty;
    collect('k_' + id);
    addMastery(id, qty);
    eventProgress('craft', id, qty);
    state.stats.drinks = (state.stats.drinks || 0) + qty;
    addXp(r.xp * Math.max(1, stars - 0), at);
    if (stars === 3) state.stats.perfectDrinks = (state.stats.perfectDrinks || 0) + 1;
    rollRare(BALANCE.rareDrop * 1.5, at);
    if (s && s.drink === id) {
        serve(seat, id, tier, stars, at);
    } else {
        state.inventory[id] = (state.inventory[id] || 0) + qty;
        if (tier) addQuality(id, tier, qty);
        float(at, [`+${qty}`, ['item', id]], '', -20);
    }
    sfx('harvest');
    buzz(12);
    burst(at, 'sparkle', 8);
    return { stars, qty };
}

// servir un client avec une boisson déjà en stock (la meilleure qualité d'abord)
export function counterServe(seat, at) {
    const C = ensureCounter(),
        s = C.seats[seat];
    if (!s || !(state.inventory[s.drink] > 0)) return false;
    const q = state.quality[s.drink] || { s: 0, g: 0 };
    let tier = 0;
    if (q.g > 0) {
        q.g--;
        tier = 2;
    } else if (q.s > 0) {
        q.s--;
        tier = 1;
    }
    state.inventory[s.drink]--;
    serve(seat, s.drink, tier, tier + 1, at);
    return true;
}
function serve(seat, id, tier, stars, at) {
    const C = ensureCounter();
    rollDay();
    const s = C.seats[seat];
    if (!s) return;
    const hearts = heartsOf(s.vid);
    const base = sellPrice(id);
    const price = Math.round(base * CLIENT.premium * CLIENT.star[tier] * (1 + CLIENT.heart * hearts));
    earn(price, at);
    let tip = 0;
    if (stars === 3 && C.tips < CLIENT.tipMax) {
        tip = Math.max(1, Math.round(price * CLIENT.tipRate));
        C.tips++;
        earn(tip, at);
    }
    const fav = FAVORITE[s.vid] === id;
    addFriendship(s.vid, (stars === 3 ? 4 : stars === 2 ? 3 : 2) + (fav ? 3 : 0), at);
    C.seats.splice(seat, 1);
    C.served++;
    C.total++;
    state.stats.clients = (state.stats.clients || 0) + 1;
    toast(`${VILLAGERS[s.vid].name} paie ${price}${tip ? ` + ${tip} de pourboire` : ''}${fav ? ' (sa préférée !)' : ''}`, ['villager', s.vid]);
    emit('counterServed', { seat });
}
export function counterSendAway(seat) {
    const C = ensureCounter();
    if (!C.seats[seat]) return false;
    C.seats.splice(seat, 1);
    return true;
}
export const counterStars = r => {
    const o = state.quality[r] || { s: 0, g: 0 };
    return o.g > 0 ? 3 : o.s > 0 ? 2 : 1;
};

export const counterFavorite = vid => FAVORITE[vid];
