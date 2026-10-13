// Le port et l'alpage : pêche en mer, cargo de livraison, transhumance, saisons de la ferme et fermes à thème.
import { state, scaleLvl } from '../core/state.js';
import { now } from '../core/clock.js';
import { view } from '../core/view.js';
import { pickRand, round5 } from '../core/format.js';
import { toast, sfx, buzz, burst, float } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { RECIPES } from '../data/machines.js';
import { DECOS } from '../data/farm.js';
import { TRANS_KINDS, TRANS_TIME, ALPINE_SPEED } from '../data/animals.js';
import { SEA_NET_TIME, SEA_CATCH } from '../data/nature.js';
import { RARE } from '../data/commerce.js';
import { BOAT_STAY, BOAT_AWAY, BOAT_PAY, FARM_SEASON_MS, FARM_SEASON_TIERS, FARM_SEASONS } from '../data/port.js';
import { BALANCE } from '../data/progress.js';
import { projectDone } from './story.js';
import { tip } from './tips.js';
import { barnBlocked, giveRare } from './barn.js';
import { rank, addXp, earn } from './player.js';
import { addMastery } from './mastery.js';
import { pickItems, qtyFor, xpBonus, hasAll, payItems } from './orders.js';
import { isAdult } from './animals.js';
import { addPhoto } from './style.js';

// ---------------- pêche en mer ----------------
export const netOpen = () => projectDone('lighthouse');
export const netReady = () => netOpen() && state.net.until && now() >= state.net.until;

export function castNet(at) {
    if (!netOpen() || state.net.until) return false;
    state.net.until = now() + SEA_NET_TIME;
    sfx('water');
    burst(at, 'water', 12);
    tip('seaNet');
    return true;
}

function pickCatch() {
    let x = Math.random() * SEA_CATCH.reduce((a, [, w]) => a + w, 0);
    for (const [id, w] of SEA_CATCH) {
        x -= w;
        if (x <= 0) return id;
    }
    return 'sardine';
}

export function haulNet(at) {
    if (!netReady()) return false;
    if (barnBlocked()) return false;
    const n = (6 + Math.floor(Math.random() * 5) + rank('bounty')) * (state.farmTheme === 'coast' ? 2 : 1);
    const got = {};
    for (let k = 0; k < n; k++) {
        const id = pickCatch();
        got[id] = (got[id] || 0) + 1;
    }
    Object.entries(got).forEach(([id, q]) => {
        state.inventory[id] += q;
        addMastery(id, q);
    });
    state.stats.fish = (state.stats.fish || 0) + n;
    state.stats.seaHauls = (state.stats.seaHauls || 0) + 1;
    state.net.until = 0;
    float(
        at,
        Object.entries(got).flatMap(([id, q]) => [`+${q}`, ['item', id]]),
        '',
        -20,
    );
    addXp(8 * n, at);
    burst(at, 'water', 16);
    sfx('harvest');
    if (got.lobster) toast('Un homard dans le filet !', ['item', 'lobster']);
    return true;
}

// ---------------- cargo de livraison ----------------
export const boatOpen = () => projectDone('quay');
export const boatPay = () => BOAT_PAY * (projectDone('shipyard') ? 1.25 : 1);
export const boatAway = () => BOAT_AWAY - (projectDone('shipyard') ? 60 * 60 * 1000 : 0);

export function boatTick() {
    if (!boatOpen()) return false;
    const b = state.boat,
        t = now();
    if (b.status === 'idle') {
        Object.assign(b, { status: 'away', arriveAt: t + 30000 });
        return false;
    }
    if (b.status === 'away' && t >= b.arriveAt) {
        const its = pickItems(4);
        if (its.length < 3) {
            b.arriveAt = t + 60000;
            return false;
        }
        const target = 150 + scaleLvl() * 55;
        const items = its.map(it => ({ id: it.id, qty: qtyFor(it, target * (0.8 + Math.random() * 0.5), 30) }));
        const value = items.reduce((a, x) => a + ITEMS[x.id].sell * x.qty, 0);
        const gold = round5(value * boatPay());
        Object.assign(b, {
            status: 'here',
            expiresAt: t + BOAT_STAY,
            items,
            gold,
            xp: Math.round(value * BOAT_PAY * BALANCE.balloonXp * xpBonus()),
            mats: [pickRand(RARE), pickRand(RARE), pickRand(RARE)],
        });
        if (view.started && !view.hidden) {
            toast('Un cargo accoste au port !', ['ui', 'boat']);
            tip('boat');
            sfx('level');
        }
        return true;
    }
    if (b.status === 'here' && t >= b.expiresAt) {
        if (view.started) toast('Le cargo a repris la mer', ['ui', 'boat']);
        Object.assign(b, { status: 'away', items: [], arriveAt: t + boatAway() });
        return true;
    }
    return false;
}

export function sendBoat(at) {
    const b = state.boat;
    if (b.status !== 'here' || !hasAll(b.items)) return false;
    payItems(b.items);
    sfx('level');
    buzz(30);
    burst(at, 'sparkle', 18);
    earn(b.gold, at);
    addXp(b.xp, at);
    b.mats.forEach(m => giveRare(m, 1, at));
    state.stats.boats = (state.stats.boats || 0) + 1;
    state.income.orders += b.gold;
    Object.assign(b, { status: 'away', items: [], arriveAt: now() + boatAway() });
    toast('Le cargo appareille, chargé de vos produits !', ['ui', 'boat']);
    return true;
}

// ---------------- transhumance ----------------
export const transOpen = () => projectDone('sheepfold');
export const transMax = () => (projectDone('cablecar') ? 8 : 4);
export const transTime = () => TRANS_TIME / (projectDone('cablecar') ? 2 : 1);
export const isAway = a => !!(a && a.away);
export const alpineMult = a => (a && a.alpine ? ALPINE_SPEED : 1);
// les bêtes qui peuvent monter : [animal, index]
export const transCandidates = () => state.animals.map((a, i) => [a, i]).filter(([a]) => TRANS_KINDS.includes(a.type) && isAdult(a));

export function startTrans(picks, at) {
    const pick = (picks || []).filter(i => state.animals[i] && isAdult(state.animals[i]) && !isAway(state.animals[i])).slice(0, transMax());
    if (!transOpen() || !pick.length || state.trans.returnAt) return false;
    const back = now() + transTime();
    pick.forEach(i => (state.animals[i].away = back));
    state.trans.returnAt = back;
    sfx('level');
    burst(at, 'leaf', 14);
    toast(`${pick.length} bête${pick.length > 1 ? 's' : ''} monte${pick.length > 1 ? 'nt' : ''} aux estives`, ['ui', 'mountain']);
    return true;
}

// au retour : du lait d'alpage, et des bêtes plus vigoureuses
export function transTick() {
    const t = state.trans;
    if (!t.returnAt || now() < t.returnAt) return false;
    let milk = 0,
        n = 0;
    state.animals.forEach(a => {
        if (!a.away) return;
        a.away = 0;
        a.alpine = true;
        n++;
        milk += a.type === 'sheep' ? 2 : 6;
        if (a.type === 'sheep') state.inventory.wool = (state.inventory.wool || 0) + 6;
    });
    state.inventory.alpineMilk = (state.inventory.alpineMilk || 0) + milk;
    addMastery('alpineMilk', milk);
    t.returnAt = 0;
    state.stats.trans = (state.stats.trans || 0) + 1;
    if (view.started && n) {
        toast(`Le troupeau redescend des estives : +${milk} lait d’alpage`, ['item', 'alpineMilk']);
        sfx('level');
    }
    return true;
}

// ---------------- saisons de la ferme (4 semaines) ----------------
export const farmSeasonOpen = () => projectDone('chapel');
export const farmSeasonKey = () => Math.floor(now() / FARM_SEASON_MS);
export const farmSeasonTheme = () => FARM_SEASONS.at(farmSeasonKey() % FARM_SEASONS.length);
export const farmSeasonEndsIn = () => ((farmSeasonKey() + 1) * FARM_SEASON_MS - now()) / 1000;

export function ensureFarmSeason() {
    if (!farmSeasonOpen()) return false;
    const key = farmSeasonKey();
    if (state.fseason && state.fseason.key === key) return false;
    state.fseason = { key, pts: 0, got: [false, false, false, false, false] };
    if (view.started) {
        toast(`Nouvelle saison de la ferme : ${farmSeasonTheme().name.toLowerCase()}`, ['ui', 'trophy']);
        tip('farmSeason');
    }
    return true;
}

// appelé à chaque production (récolte, ramassage, atelier, pêche)
export function farmSeasonAdd(id, qty) {
    if (!farmSeasonOpen()) return;
    ensureFarmSeason();
    if (farmSeasonTheme().items.includes(id)) state.fseason.pts += qty * (RECIPES[id] ? 3 : 1);
}

export const seasonTierReward = k => ({ coins: Math.round((2000 * (k + 1) * (1 + scaleLvl() * 0.2)) / 50) * 50, rares: k + 1 });

export function claimSeasonTier(k, at) {
    const sn = state.fseason;
    if (!sn || sn.got[k] || sn.pts < FARM_SEASON_TIERS[k]) return false;
    sn.got[k] = true;
    const r = seasonTierReward(k);
    earn(r.coins, at);
    RARE.forEach(id => (state.inventory[id] += r.rares));
    if (k === 4) {
        const deco = farmSeasonTheme().deco;
        state.decorInv[deco] = (state.decorInv[deco] || 0) + 1;
        state.prestige.rubans++;
        addPhoto('ui', deco, farmSeasonTheme().name, 'Dernier palier atteint');
        toast(`${DECOS[deco].name} : posez-la dans le champ (+1 ruban)`, ['ui', deco]);
    }
    burst(at, 'sparkle', 14);
    sfx('level');
    return true;
}

export const farmSeasonClaimable = () =>
    state.fseason && farmSeasonOpen() ? FARM_SEASON_TIERS.filter((t, k) => !state.fseason.got[k] && state.fseason.pts >= t).length : 0;

// ---------------- fermes à thème ----------------
export const themeCropMult = id =>
    state.farmTheme === 'garden' && ITEMS[id] && ITEMS[id].type === 'crop'
        ? 1.15
        : state.farmTheme === 'orchard' && ITEMS[id] && ITEMS[id].type === 'tree'
          ? 1.3
          : 1;
export const themeAnimalMult = () => (state.farmTheme === 'dairy' ? 1.2 : 1);
export const themesOpen = () => projectDone('refuge');
