// 1.154 : Moteur de BEUH — le Meuh underground parallèle caché en easter egg.
// Économie et sauvegarde 100 % isolées dans state.beuh (aucun impact sur la ferme de surface).
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { toast, sfx } from '../core/bus.js';
import { MAX_LEVEL } from '../data/progress.js';
import { randomId } from '../art/habitants.js';
import {
    BEUH_CLIENT_NAMES,
    BEUH_FRONT_IDS,
    BEUH_FRONTS,
    BEUH_MAX_LVL,
    BEUH_MAX_PLOTS,
    BEUH_QUALITIES,
    BEUH_RECIPE_IDS,
    BEUH_RECIPES,
    BEUH_STATIONS,
    BEUH_STRAIN_IDS,
    BEUH_STRAINS,
    BEUH_UPGRADES,
    beuhPlotCost,
    beuhXpReq,
} from '../data/beuh.js';

export const beuhEndgame = () => state.level >= MAX_LEVEL || !!((state.stats && state.stats.prestiges >= 1) || (state.prestige && state.prestige.rubans >= 1));
export const beuhUnlocked = () => !!(state.beuh && state.beuh.found);

const emptyPlot = () => ({ strain: null, progress: 0, watered: false, ready: false });

export function ensureBeuh() {
    if (!state.beuh || typeof state.beuh !== 'object') {
        state.beuh = {
            found: false,
            lvl: 1,
            xp: 0,
            dirty: 260,
            clean: 120,
            heat: 0,
            selStrain: 'rondpoint',
            plots: Array.from({ length: 6 }, emptyPlot),
            seeds: { rondpoint: 10 },
            inv: {},
            stations: { roulage: { job: null, ready: [] } },
            fronts: {},
            up: {},
            clients: [],
            clientUid: 1,
            stats: { harvested: 0, crafted: 0, sold: 0, laundered: 0, raids: 0 },
            lastNotice: '',
        };
    }
    const B = state.beuh;
    if (!Array.isArray(B.plots) || !B.plots.length) B.plots = Array.from({ length: 6 }, emptyPlot);
    B.seeds = B.seeds || {};
    B.inv = B.inv || {};
    B.stations = B.stations || { roulage: { job: null, ready: [] } };
    if (!B.stations.roulage) B.stations.roulage = { job: null, ready: [] };
    B.fronts = B.fronts || {};
    B.up = B.up || {};
    B.clients = Array.isArray(B.clients) ? B.clients : [];
    B.stats = B.stats || { harvested: 0, crafted: 0, sold: 0, laundered: 0, raids: 0 };
    if (!BEUH_STRAINS[B.selStrain]) B.selStrain = 'rondpoint';
    return B;
}

export function beuhUnlock() {
    const B = ensureBeuh();
    const fresh = !B.found;
    B.found = true;
    fillClients(B);
    if (fresh) {
        sfx('level');
        toast('Trappe du sous-sol déverrouillée : bienvenue dans BEUH !', ['ui', 'star']);
    }
    return true;
}

// ---- Utilitaires internes ----
export const beuhItemInfo = id => BEUH_STRAINS[id] || BEUH_RECIPES[id] || null;
export const beuhUpLvl = id => (state.beuh && state.beuh.up && state.beuh.up[id]) || 0;
export const beuhUpCost = id => {
    const u = BEUH_UPGRADES[id];
    const l = beuhUpLvl(id);
    if (!u || l >= u.maxLvl) return 0;
    return Math.round((u.baseCost * Math.pow(u.mult, l)) / 10) * 10;
};
export const beuhFrontLvl = id => (state.beuh && state.beuh.fronts && state.beuh.fronts[id]) || 0;
export const beuhFrontCost = id => {
    const f = BEUH_FRONTS[id];
    const l = beuhFrontLvl(id);
    if (!f) return 0;
    return Math.round((f.cost * Math.pow(2.1, l)) / 10) * 10;
};
export const beuhLaunderRate = () => {
    const B = state.beuh;
    if (!B) return 0;
    return BEUH_FRONT_IDS.reduce((sum, id) => sum + BEUH_FRONTS[id].rate * (B.fronts[id] || 0), 0);
};
export const beuhGrowSpeed = watered => (1 + beuhUpLvl('led') * 0.25) * (watered ? 1.5 : 1);
const heatMult = () => Math.max(0.2, 1 - beuhUpLvl('filter') * 0.18);
const saleMult = () => 1 + beuhUpLvl('van') * 0.15;

function addXp(B, amount) {
    if (B.lvl >= BEUH_MAX_LVL || !(amount > 0)) return;
    B.xp += Math.round(amount);
    while (B.lvl < BEUH_MAX_LVL && B.xp >= beuhXpReq(B.lvl)) {
        B.xp -= beuhXpReq(B.lvl);
        B.lvl++;
        B.lastNotice = `Rang ${B.lvl} atteint dans le sous-sol !`;
        sfx('level');
    }
}

function addHeat(B, amount) {
    if (!(amount > 0)) return;
    B.heat = Math.min(100, (B.heat || 0) + amount * heatMult());
    if (B.heat >= 100) triggerRaid(B);
}

function triggerRaid(B) {
    const safeLvl = beuhUpLvl('safe');
    const keepRatio = Math.min(0.85, 0.2 * safeLvl); // 0%, 20%, 40%, 60% supplémentaire protégé
    const seizeRate = Math.max(0.12, 0.38 * (1 - keepRatio));
    const lost = Math.round(B.dirty * seizeRate);
    B.dirty = Math.max(0, B.dirty - lost);
    B.heat = 20;
    B.stats.raids = (B.stats.raids || 0) + 1;
    B.lastNotice = lost > 0 ? `🚨 Descente ! La patrouille saisit ${lost.toLocaleString('fr-FR')} 💵 de cash sale (cash propre intact !)` : '🚨 Descente ! Rien à saisir dans la cave, la patrouille repart bredouille.';
    sfx('error');
}

function spendAny(B, cost, prefer = 'dirty') {
    if (prefer === 'clean') {
        if (B.clean < cost) return false;
        B.clean -= cost;
        return true;
    }
    if (B.dirty >= cost) {
        B.dirty -= cost;
        return true;
    }
    if (B.dirty + B.clean >= cost) {
        const rem = cost - B.dirty;
        B.dirty = 0;
        B.clean -= rem;
        return true;
    }
    return false;
}

// ---- Clients de nuit ----
function unlockedItems(B) {
    const list = BEUH_STRAIN_IDS.filter(id => BEUH_STRAINS[id].lvl <= B.lvl);
    for (const rid of BEUH_RECIPE_IDS) {
        const r = BEUH_RECIPES[rid];
        if (r.lvl <= B.lvl && B.stations[r.station]) list.push(rid);
    }
    return list;
}

function makeClient(B) {
    const pool = unlockedItems(B);
    // privilégier un produit déjà en stock (45 % du temps) pour un rythme dynamique
    const inStock = pool.filter(id => (B.inv[id] || 0) > 0);
    const item = inStock.length && Math.random() < 0.45 ? inStock[Math.floor(Math.random() * inStock.length)] : pool[Math.floor(Math.random() * pool.length)];
    const info = beuhItemInfo(item);
    const qty = BEUH_RECIPES[item] ? 1 + Math.floor(Math.random() * 2) : 2 + Math.floor(Math.random() * 4);
    const isCop = B.lvl >= 3 && Math.random() < 0.14;
    const pick = isCop ? BEUH_CLIENT_NAMES[BEUH_CLIENT_NAMES.length - 1] : BEUH_CLIENT_NAMES[Math.floor(Math.random() * (BEUH_CLIENT_NAMES.length - 1))];
    const seed = (B.clientUid++ * 4999 + Math.floor(Math.random() * 1e5)) >>> 0;
    const look = randomId(seed, {
        ...(pick[2] ? { female: true } : { male: true }),
        fix: isCop ? { glasses: 7, beard: 4, hat: 1 } : { glasses: Math.random() < 0.55 ? 3 : 0 },
    });
    const basePay = Math.round(info.sell * qty * (1.28 + Math.random() * 0.24) * saleMult());
    const heat = Math.round((info.heat || 4) * (isCop ? 3.2 : 1.1) + qty * 0.8);
    return {
        uid: seed,
        name: pick[0],
        sub: pick[1],
        look,
        item,
        qty,
        pay: basePay,
        xp: Math.round((info.xp || 15) * qty * 0.7),
        heat,
        shady: isCop,
        expires: now() + 8 * 60 * 1000,
    };
}

function fillClients(B) {
    const t = now();
    B.clients = B.clients.filter(c => !c.expires || c.expires > t);
    while (B.clients.length < 3) B.clients.push(makeClient(B));
}

// ---- Boucle temps réel & hors ligne ----
export function beuhTick(dt = 1) {
    if (!beuhUnlocked()) return false;
    const B = ensureBeuh();
    let changed = false;

    // 1. Pousse des pots
    for (const p of B.plots) {
        if (p.strain && !p.ready) {
            const s = BEUH_STRAINS[p.strain];
            if (!s) {
                p.strain = null;
                continue;
            }
            p.progress += dt * beuhGrowSpeed(p.watered);
            if (p.progress >= s.time) {
                p.progress = s.time;
                p.ready = true;
                changed = true;
            }
        }
    }

    // 2. Postes d'atelier
    for (const st of Object.values(B.stations)) {
        if (st && st.job) {
            const r = BEUH_RECIPES[st.job.id];
            if (!r) {
                st.job = null;
                continue;
            }
            st.job.progress += dt;
            if (st.job.progress >= r.time) {
                st.ready.push(st.job.id);
                st.job = null;
                changed = true;
            }
        }
    }

    // 3. Blanchiment passif via les façades
    if (B.dirty > 0) {
        let totalClean = 0;
        let totalDirtyUsed = 0;
        for (const id of BEUH_FRONT_IDS) {
            const lvl = B.fronts[id] || 0;
            if (!lvl) continue;
            const f = BEUH_FRONTS[id];
            const can = Math.min(B.dirty - totalDirtyUsed, f.rate * lvl * dt);
            if (can > 0) {
                totalDirtyUsed += can;
                totalClean += can * f.bonus;
            }
        }
        if (totalDirtyUsed > 0) {
            B.dirty = Math.max(0, B.dirty - totalDirtyUsed);
            B.clean += totalClean;
            B.stats.laundered = (B.stats.laundered || 0) + totalDirtyUsed;
            changed = true;
        }
    }

    // 4. Refroidissement naturel de la chaleur
    if (B.heat > 0) {
        const cool = 0.22 * (1 + beuhUpLvl('lookout') * 0.4) * dt;
        B.heat = Math.max(0, B.heat - cool);
    }

    // 5. Clients nocturnes
    const beforeLen = B.clients.length;
    fillClients(B);
    if (B.clients.length !== beforeLen) changed = true;
    return changed;
}

export function beuhOffline(elapsed) {
    if (!beuhUnlocked() || !(elapsed > 0)) return 0;
    const cap = Math.min(elapsed, 12 * 3600);
    beuhTick(cap);
    return cap;
}

// ---- Actions Planque (Serres) ----
export function beuhSelectStrain(id) {
    const B = ensureBeuh();
    if (!BEUH_STRAINS[id] || BEUH_STRAINS[id].lvl > B.lvl) return false;
    B.selStrain = id;
    return true;
}

export function beuhBuySeed(id, qty = 5) {
    const B = ensureBeuh();
    const s = BEUH_STRAINS[id];
    if (!s || s.lvl > B.lvl || qty < 1) return false;
    const cost = s.seedCost * qty;
    if (!spendAny(B, cost, 'dirty')) return false;
    B.seeds[id] = (B.seeds[id] || 0) + qty;
    sfx('buy');
    return true;
}

export function beuhPlant(idx, strainId) {
    const B = ensureBeuh();
    const p = B.plots[idx];
    const id = strainId || B.selStrain;
    const s = BEUH_STRAINS[id];
    if (!p || p.strain || !s || s.lvl > B.lvl) return false;
    if ((B.seeds[id] || 0) < 1) {
        // achat auto d'1 graine si possible
        if (!spendAny(B, s.seedCost, 'dirty')) return false;
    } else {
        B.seeds[id]--;
    }
    p.strain = id;
    p.progress = 0;
    p.watered = false;
    p.ready = false;
    sfx('plant');
    return true;
}

export function beuhPlantAll(strainId) {
    const B = ensureBeuh();
    let n = 0;
    for (let i = 0; i < B.plots.length; i++) if (beuhPlant(i, strainId)) n++;
    return n;
}

export function beuhWater(idx) {
    const B = ensureBeuh();
    const p = B.plots[idx];
    if (!p || !p.strain || p.ready || p.watered) return false;
    p.watered = true;
    sfx('water');
    return true;
}

export function beuhWaterAll() {
    const B = ensureBeuh();
    let n = 0;
    for (let i = 0; i < B.plots.length; i++) if (beuhWater(i)) n++;
    return n;
}

export function beuhHarvest(idx) {
    const B = ensureBeuh();
    const p = B.plots[idx];
    if (!p || !p.strain || !p.ready) return false;
    const s = BEUH_STRAINS[p.strain];
    const hydro = beuhUpLvl('hydro');
    const qty = Math.random() < hydro * 0.15 ? 2 : 1;
    // petit bonus de qualité qui se convertit en valeur / récolte bonus
    const qRoll = Math.random() + hydro * 0.08 + (p.watered ? 0.05 : 0);
    const qIdx = qRoll > 1.05 ? 3 : qRoll > 0.9 ? 2 : qRoll > 0.68 ? 1 : 0;
    const bonusUnit = qIdx >= 2 && Math.random() < 0.35 ? 1 : 0;
    B.inv[s.id] = (B.inv[s.id] || 0) + qty + bonusUnit;
    B.stats.harvested = (B.stats.harvested || 0) + qty + bonusUnit;
    addXp(B, s.xp * (1 + qIdx * 0.2));
    addHeat(B, s.heat * 0.5);
    if (qIdx >= 2) B.lastNotice = `✨ Récolte ${BEUH_QUALITIES[qIdx].name} : ${s.name} ×${qty + bonusUnit}`;
    p.strain = null;
    p.progress = 0;
    p.watered = false;
    p.ready = false;
    sfx('harvest');
    return true;
}

export function beuhHarvestAll() {
    const B = ensureBeuh();
    let n = 0;
    for (let i = 0; i < B.plots.length; i++) if (beuhHarvest(i)) n++;
    return n;
}

export function beuhExpandPlot() {
    const B = ensureBeuh();
    if (B.plots.length >= BEUH_MAX_PLOTS) return false;
    const cost = beuhPlotCost(B.plots.length);
    if (!spendAny(B, cost, 'dirty')) return false;
    B.plots.push(emptyPlot());
    sfx('level');
    return true;
}

// ---- Actions Atelier clandestin ----
export function beuhBuyStation(id) {
    const B = ensureBeuh();
    const st = BEUH_STATIONS[id];
    if (!st || B.stations[id] || B.lvl < st.lvl) return false;
    if (!spendAny(B, st.cost, 'dirty')) return false;
    B.stations[id] = { job: null, ready: [] };
    sfx('level');
    return true;
}

export function beuhCanCraft(recipeId) {
    const B = state.beuh;
    const r = BEUH_RECIPES[recipeId];
    if (!B || !r || B.lvl < r.lvl) return false;
    const st = B.stations[r.station];
    if (!st || st.job) return false;
    for (const [k, q] of Object.entries(r.ing)) if ((B.inv[k] || 0) < q) return false;
    return true;
}

export function beuhStartCraft(recipeId) {
    if (!beuhCanCraft(recipeId)) return false;
    const B = ensureBeuh();
    const r = BEUH_RECIPES[recipeId];
    for (const [k, q] of Object.entries(r.ing)) B.inv[k] -= q;
    B.stations[r.station].job = { id: recipeId, progress: 0 };
    sfx('plant');
    return true;
}

export function beuhCollectCraft(stationId) {
    const B = ensureBeuh();
    const st = B.stations[stationId];
    if (!st || !st.ready.length) return 0;
    const n = st.ready.length;
    for (const rid of st.ready) {
        const r = BEUH_RECIPES[rid];
        B.inv[rid] = (B.inv[rid] || 0) + 1;
        B.stats.crafted = (B.stats.crafted || 0) + 1;
        if (r) {
            addXp(B, r.xp);
            addHeat(B, r.heat * 0.45);
        }
    }
    st.ready = [];
    sfx('harvest');
    return n;
}

// ---- Actions La Rue (Ventes & Clients) ----
export function beuhSellClient(idx, negotiate = false) {
    const B = ensureBeuh();
    const c = B.clients[idx];
    if (!c || (B.inv[c.item] || 0) < c.qty) return false;
    B.inv[c.item] -= c.qty;
    if (c.shady) {
        // client louche (Inspecteur Moustache) : forte hausse de chaleur, mais paie quand même avant de filer !
        B.dirty += Math.round(c.pay * 0.6);
        B.lastNotice = `🕵️ ${c.name} était un flic en civil ! Chaleur en hausse !`;
        addHeat(B, c.heat + (negotiate ? 14 : 0));
    } else {
        const mult = negotiate ? 1.25 : 1;
        const gain = Math.round(c.pay * mult);
        B.dirty += gain;
        B.stats.sold = (B.stats.sold || 0) + 1;
        addXp(B, c.xp);
        addHeat(B, c.heat * (negotiate ? 1.45 : 1));
        B.lastNotice = `💵 ${c.name} paie ${gain.toLocaleString('fr-FR')} 💵${negotiate ? ' (négocié !)' : ''}`;
    }
    B.clients.splice(idx, 1);
    fillClients(B);
    sfx('sell');
    return true;
}

export function beuhDismissClient(idx) {
    const B = ensureBeuh();
    if (!B.clients[idx]) return false;
    const c = B.clients[idx];
    if (c.shady) B.lastNotice = `👍 Bien joué : vous avez reconnu ${c.name} et évité le piège !`;
    B.clients.splice(idx, 1);
    fillClients(B);
    return true;
}

export function beuhQuickSell(itemId, qty = 1) {
    const B = ensureBeuh();
    const info = beuhItemInfo(itemId);
    const have = B.inv[itemId] || 0;
    const n = Math.min(have, Math.max(1, qty));
    if (!info || n <= 0) return false;
    B.inv[itemId] -= n;
    const gain = Math.round(info.sell * 0.78 * n * saleMult());
    B.dirty += gain;
    addHeat(B, 2 * n);
    sfx('sell');
    return true;
}

// ---- Actions Façades & Équipement ----
export function beuhBuyFront(id) {
    const B = ensureBeuh();
    const f = BEUH_FRONTS[id];
    if (!f || B.lvl < f.lvl) return false;
    const cost = beuhFrontCost(id);
    // La 1re façade (Laverie niv. 0) peut s'acheter en cash sale pour lancer le blanchiment ; le reste en cash propre !
    const pref = id === 'laverie' && beuhFrontLvl(id) === 0 ? 'dirty' : 'clean';
    if (!spendAny(B, cost, pref)) return false;
    B.fronts[id] = (B.fronts[id] || 0) + 1;
    B.lastNotice = `🧼 ${f.name} (niv. ${B.fronts[id]}) blanchit votre cash !`;
    sfx('level');
    return true;
}

export function beuhBuyUpgrade(id) {
    const B = ensureBeuh();
    const u = BEUH_UPGRADES[id];
    const cost = beuhUpCost(id);
    if (!u || !cost) return false;
    if (!spendAny(B, cost, u.currency)) return false;
    B.up[id] = (B.up[id] || 0) + 1;
    B.lastNotice = `⚡ ${u.name} niveau ${B.up[id]} installé !`;
    sfx('level');
    return true;
}

export function beuhLayLow() {
    const B = ensureBeuh();
    if (B.heat <= 5) return false;
    const cost = Math.max(60, Math.round(B.lvl * 45));
    if (!spendAny(B, cost, 'clean')) return false;
    B.heat = Math.max(0, B.heat - 38);
    B.lastNotice = '🤫 Profil bas : les patrouilles s’éloignent du quartier (−38 % chaleur).';
    sfx('buy');
    return true;
}
