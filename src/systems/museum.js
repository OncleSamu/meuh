// 1.172 : Le Musée de la vallée — 32 spécimens en 4 ailes, atelier de géodes, paliers et bonus permanents.
import { state, skill } from '../core/state.js';
import { now } from '../core/clock.js';
import { fmt, dateKey, s } from '../core/format.js';
import { toast, sfx, buzz, burst, float, changed } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { MINE_STRATA, GEODES, GEODE_IDS } from '../data/mine.js';
import { MUSEUM_LVL, MUSEUM_WINGS, MUSEUM_EXHIBITS, MUSEUM_EXHIBIT_IDS, MUSEUM_BY_WING, MUSEUM_MILESTONES, MUSEUM_SHOP_GEODE } from '../data/museum.js';
import { addXp, earn, spend } from './player.js';
import { addRenom } from './renom.js';
import { addPhoto } from './style.js';
import { tip } from './tips.js';

const COIN = ['ui', 'coin'];

export const museumOpen = () => state.level >= MUSEUM_LVL;

export function ensureMuseum() {
    if (!state.museum || typeof state.museum !== 'object') {
        state.museum = { donated: {}, bag: {}, claimed: {}, shopDay: '', shopBought: 0, geodesCracked: 0, lastCrack: null };
    }
    const M = state.museum;
    M.donated = M.donated || {};
    M.bag = M.bag || {};
    M.claimed = M.claimed || {};
    M.shopDay = M.shopDay || '';
    M.shopBought = M.shopBought || 0;
    M.geodesCracked = M.geodesCracked || 0;
    return M;
}

export const museumDonatedCount = () => {
    const M = state.museum;
    return M && M.donated ? MUSEUM_EXHIBIT_IDS.filter(id => M.donated[id]).length : 0;
};

export const museumWingCount = wingId => {
    const M = state.museum;
    const ids = MUSEUM_BY_WING[wingId] || [];
    return M && M.donated ? ids.filter(id => M.donated[id]).length : 0;
};

export const museumWingBonusPct = wingId => {
    const w = MUSEUM_WINGS.find(x => x.id === wingId);
    if (!w) return 0;
    const n = museumWingCount(wingId);
    const total = (MUSEUM_BY_WING[wingId] || []).length || 8;
    if (n >= total) return w.fullPct;
    if (n >= Math.ceil(total / 2)) return w.halfPct;
    return 0;
};

// Renvoie le multiplicateur additionnel (ex: 0.05 pour +5 %) d'un bonus d'aile : 'xp' | 'mineDrop' | 'sell' | 'nature'
export const museumBonus = key => {
    const w = MUSEUM_WINGS.find(x => x.bonusKey === key);
    return w ? museumWingBonusPct(w.id) / 100 : 0;
};

export const museumBagCount = id => (state.museum && state.museum.bag && state.museum.bag[id]) || 0;
export const museumHasDonated = id => !!(state.museum && state.museum.donated && state.museum.donated[id]);

// Liste des pièces en poche qui n'ont pas encore été données au Musée
export const museumDonateReadyList = () => MUSEUM_EXHIBIT_IDS.filter(id => !museumHasDonated(id) && museumBagCount(id) > 0);
export const museumDonateReady = () => museumDonateReadyList().length;

// Doublons vendables (déjà donnés au Musée, ou exemplaires au-delà du premier non donné)
export const museumDupeList = () =>
    MUSEUM_EXHIBIT_IDS.map(id => {
        const have = museumBagCount(id);
        const dupes = museumHasDonated(id) ? have : Math.max(0, have - 1);
        const mult = skill('archMaster') ? 2 : 1;
        return dupes > 0 ? { id, n: dupes, value: dupes * MUSEUM_EXHIBITS[id].sell * mult } : null;
    }).filter(Boolean);

export const museumDupeValue = () => museumDupeList().reduce((a, x) => a + x.value, 0);

export const museumGeodeTotal = () => {
    const g = state.mineDeep && state.mineDeep.geodes;
    return g ? GEODE_IDS.reduce((a, id) => a + (g[id] || 0), 0) : 0;
};

export const museumClaimableMilestones = () => {
    const M = state.museum;
    const n = museumDonatedCount();
    return MUSEUM_MILESTONES.filter(m => n >= m.at && !(M && M.claimed && M.claimed[m.at]));
};

export const museumBadge = () => (museumOpen() ? museumDonateReady() + museumGeodeTotal() + museumClaimableMilestones().length : 0);
export const museumSub = () => `${museumDonatedCount()} / ${MUSEUM_EXHIBIT_IDS.length} pièces`;

// Tire un spécimen cohérent avec la strate (0..3), avec forte priorité aux pièces manquantes
export function rollMuseumSpecimen(maxStratum = 0, wingFilter = null, favorMissing = 0.72) {
    const pool = MUSEUM_EXHIBIT_IDS.map(id => MUSEUM_EXHIBITS[id]).filter(
        ex => ex.stratum <= maxStratum && (!wingFilter || ex.wing === wingFilter),
    );
    if (!pool.length) return MUSEUM_EXHIBIT_IDS[0];
    const missing = pool.filter(ex => !museumHasDonated(ex.id) && !museumBagCount(ex.id));
    const list = missing.length && Math.random() < favorMissing ? missing : pool;
    // Poids selon la rareté et proximité de la strate
    const rWeight = { C: 45, R: 28, E: 15, L: 6 };
    const weights = list.map(ex => {
        let w = rWeight[ex.rarity] || 10;
        if (ex.stratum === maxStratum) w *= 1.8;
        return w;
    });
    const tot = weights.reduce((a, x) => a + x, 0);
    let r = Math.random() * tot;
    for (let i = 0; i < list.length; i++) {
        if ((r -= weights[i]) <= 0) return list[i].id;
    }
    return list[0].id;
}

export function museumAddSpecimen(id, qty = 1, at = null, quiet = false) {
    const ex = MUSEUM_EXHIBITS[id];
    if (!ex || qty <= 0) return false;
    const M = ensureMuseum();
    const isNew = !M.donated[id] && !M.bag[id];
    M.bag[id] = (M.bag[id] || 0) + qty;
    state.stats.museumFound = (state.stats.museumFound || 0) + qty;
    if (!quiet) {
        toast(isNew ? `Nouveau spécimen : ${ex.name} ! (Menu › Musée)` : `Spécimen trouvé : ${ex.name}`, ['ui', ex.id]);
        if (at) float(at, [`+${qty}`, ['ui', ex.id]], 'gold', -42);
        tip('museum');
    }
    changed('museum');
    return true;
}

export function museumDonate(id, at = null, quiet = false) {
    const ex = MUSEUM_EXHIBITS[id];
    if (!ex) return false;
    const M = ensureMuseum();
    if (M.donated[id] || !(M.bag[id] > 0)) return false;
    const wingBefore = museumWingBonusPct(ex.wing);
    M.bag[id]--;
    if (!M.bag[id]) delete M.bag[id];
    M.donated[id] = now();
    state.stats.museumDonated = museumDonatedCount();
    addXp(ex.xp, at);
    const wingAfter = museumWingBonusPct(ex.wing);
    if (!quiet) {
        sfx('level');
        buzz(15);
        burst(at, 'sparkle', 10);
        if (wingAfter > wingBefore) {
            const w = MUSEUM_WINGS.find(x => x.id === ex.wing);
            toast(`Aile ${w.name} : +${wingAfter} % ${w.bonusName.toLowerCase()} !`, ['ui', w.icon]);
            tip('museumWing');
        } else {
            toast(`${ex.name} exposé au Musée ! (+${ex.xp} XP)`, ['ui', ex.id]);
        }
    }
    if (museumDonatedCount() === MUSEUM_EXHIBIT_IDS.length) {
        addPhoto('ui', 'museumTrophy', 'Musée complet', 'Les 32 pièces réunies dans la vallée');
    }
    changed('museum');
    return true;
}

export function museumDonateAll(at = null) {
    const list = museumDonateReadyList();
    if (!list.length) return 0;
    let n = 0;
    for (const id of list) if (museumDonate(id, at, true)) n++;
    if (n) {
        sfx('level');
        buzz(18);
        burst(at, 'sparkle', 14);
        toast(`${n} pièce${s(n)} exposée${s(n)} au Musée !`, ['ui', 'museum']);
        changed('museum');
    }
    return n;
}

export function museumSellDupes(at = null) {
    const M = ensureMuseum();
    const list = museumDupeList();
    if (!list.length) return 0;
    let total = 0,
        count = 0;
    for (const { id, n, value } of list) {
        M.bag[id] = (M.bag[id] || 0) - n;
        if (M.bag[id] <= 0) delete M.bag[id];
        total += value;
        count += n;
    }
    earn(total, at);
    sfx('coin');
    toast(`${count} doublon${s(count)} vendu${s(count)} : +${fmt(total)} pièces`, COIN);
    changed('museum');
    return total;
}

export function museumClaimMilestone(atCount, at = null) {
    const M = ensureMuseum();
    const m = MUSEUM_MILESTONES.find(x => x.at === atCount);
    if (!m || museumDonatedCount() < m.at || M.claimed[m.at]) return false;
    M.claimed[m.at] = now();
    if (m.coins) earn(m.coins, at);
    if (m.xp) addXp(m.xp, at);
    if (m.rubans) {
        state.prestige = state.prestige || { rubans: 0, count: 0 };
        state.prestige.rubans = (state.prestige.rubans || 0) + m.rubans;
    }
    if (m.deco) {
        state.decorInv = state.decorInv || {};
        state.decorInv[m.deco] = (state.decorInv[m.deco] || 0) + 1;
    }
    sfx('level');
    buzz(20);
    burst(at, 'sparkle', 14);
    toast(`Récompense du Musée (${m.at} dons) : ${m.label}`, ['ui', m.deco || 'museum']);
    changed('museum');
    return true;
}

// ---------------- Atelier de géodes du Musée ----------------
const pickWeighted = list => {
    const tot = list.reduce((a, [, w]) => a + w, 0);
    let r = Math.random() * tot;
    for (const [id, w] of list) if ((r -= w) <= 0) return id;
    return list[0][0];
};

export function museumCrackGeode(geodeId, at = null, quiet = false) {
    const gDef = GEODES[geodeId];
    if (!gDef) return null;
    const M = ensureMuseum();
    const bag = state.mineDeep && state.mineDeep.geodes;
    if (!bag || !(bag[geodeId] > 0)) return null;
    if (state.money < gDef.crackCost) {
        if (!quiet) {
            toast(`Il faut ${fmt(gDef.crackCost)} pièces pour ouvrir une ${gDef.name.toLowerCase()}`, COIN);
            sfx('error');
        }
        return null;
    }
    spend(gDef.crackCost);
    bag[geodeId]--;
    if (!bag[geodeId]) delete bag[geodeId];
    M.geodesCracked = (M.geodesCracked || 0) + 1;
    state.stats.geodesCracked = (state.stats.geodesCracked || 0) + 1;

    const stratum = MINE_STRATA[gDef.stratum] || MINE_STRATA[0];
    let result;
    // 72 % de chance d'obtenir un spécimen du Musée (sinon gemmes + minerai de la strate)
    if (Math.random() < 0.72) {
        const exId = rollMuseumSpecimen(gDef.stratum, null, 0.78);
        const isNew = !museumHasDonated(exId) && !museumBagCount(exId);
        museumAddSpecimen(exId, 1, at, true);
        result = { kind: 'specimen', id: exId, name: MUSEUM_EXHIBITS[exId].name, icon: ['ui', exId], isNew };
    } else {
        const gemId = pickWeighted(stratum.gems);
        const qty = 1 + (Math.random() < 0.35 ? 1 : 0);
        state.inventory[gemId] = (state.inventory[gemId] || 0) + qty;
        result = { kind: 'item', id: gemId, qty, name: ITEMS[gemId].name, icon: ['item', gemId], isNew: false };
    }
    M.lastCrack = { geodeId, ...result, at: now() };
    if (!quiet) {
        sfx(result.isNew ? 'level' : 'rock');
        buzz(14);
        burst(at, 'sparkle', 10);
        toast(
            result.kind === 'specimen'
                ? `${gDef.name} → ${result.name}${result.isNew ? ' (Nouveau !)' : ' (doublon)'}`
                : `${gDef.name} → +${result.qty} ${result.name}`,
            result.icon,
        );
    }
    changed('museum');
    return result;
}

export function museumCrackAllGeodes(geodeId, at = null) {
    const bag = state.mineDeep && state.mineDeep.geodes;
    const gDef = GEODES[geodeId];
    if (!bag || !gDef || !(bag[geodeId] > 0)) return 0;
    let opened = 0,
        newFound = 0;
    while (bag[geodeId] > 0 && state.money >= gDef.crackCost) {
        const r = museumCrackGeode(geodeId, at, true);
        if (!r) break;
        opened++;
        if (r.isNew) newFound++;
    }
    if (opened) {
        sfx(newFound ? 'level' : 'rock');
        buzz(16);
        burst(at, 'sparkle', 12);
        toast(`${opened} ${gDef.name.toLowerCase()}${s(opened)} ouverte${s(opened)}${newFound ? ` · ${newFound} nouveau${newFound > 1 ? 'x' : ''} spécimen${s(newFound)} !` : ''}`, [
            'ui',
            gDef.icon,
        ]);
        changed('museum');
    } else if (bag[geodeId] > 0) {
        toast(`Pas assez de pièces pour ouvrir les ${gDef.name.toLowerCase()}s`, COIN);
        sfx('error');
    }
    return opened;
}

export function museumCrackEveryGeode(at = null) {
    const bag = state.mineDeep && state.mineDeep.geodes;
    if (!bag) return 0;
    let opened = 0,
        newFound = 0,
        gems = 0;
    for (const id of GEODE_IDS) {
        const gDef = GEODES[id];
        if (!gDef) continue;
        while ((bag[id] || 0) > 0 && state.money >= gDef.crackCost) {
            const r = museumCrackGeode(id, at, true);
            if (!r) break;
            opened++;
            if (r.isNew) newFound++;
            if (r.kind === 'item') gems += r.qty || 1;
        }
    }
    if (opened) {
        sfx(newFound ? 'level' : 'rock');
        buzz(18);
        burst(at, 'sparkle', 16);
        const bits = [`${opened} géode${s(opened)} cassée${s(opened)}`];
        if (newFound) bits.push(`${newFound} nouveau${newFound > 1 ? 'x' : ''} spécimen${s(newFound)}`);
        if (gems) bits.push(`+${gems} gemme${s(gems)}`);
        toast(bits.join(' · ') + ' !', ['ui', 'geodeCrystal']);
        changed('museum');
    } else if (GEODE_IDS.some(id => (bag[id] || 0) > 0)) {
        toast('Pas assez de pièces pour casser vos géodes', COIN);
        sfx('error');
    }
    return opened;
}

// Géode mystère du jour (1 par jour réel)
const todayKey = () => dateKey(new Date(now()));

export function museumShopGeodeId() {
    const maxF = (state.mineDeep && state.mineDeep.maxFloor) || 1;
    if (maxF >= 31) return 'geodeAbyss';
    if (maxF >= 21) return 'geodeCrystal';
    if (maxF >= 11) return 'geodeAmethyst';
    return 'geodeStone';
}

export function museumShopLeft() {
    const M = ensureMuseum();
    return M.shopDay === todayKey() ? Math.max(0, MUSEUM_SHOP_GEODE.perDay - (M.shopBought || 0)) : MUSEUM_SHOP_GEODE.perDay;
}

export function museumBuyGeode(at = null) {
    if (!museumOpen() || !museumShopLeft()) return false;
    const M = ensureMuseum();
    const id = museumShopGeodeId();
    const price = MUSEUM_SHOP_GEODE.prices[id];
    if (state.money < price) {
        toast(`Il faut ${fmt(price)} pièces pour la géode du jour`, COIN);
        sfx('error');
        return false;
    }
    spend(price);
    if (M.shopDay !== todayKey()) {
        M.shopDay = todayKey();
        M.shopBought = 0;
    }
    M.shopBought++;
    if (!state.mineDeep) state.mineDeep = { geodes: {} };
    state.mineDeep.geodes = state.mineDeep.geodes || {};
    state.mineDeep.geodes[id] = (state.mineDeep.geodes[id] || 0) + 1;
    sfx('buy');
    burst(at, 'sparkle', 8);
    toast(`${GEODES[id].name} achetée ! Ouvrez-la à l’atelier ci-dessus`, ['ui', id]);
    changed('museum');
    return true;
}

// ---------------- 1.187 : Grande Aile des Expéditions (Mine post-Musée, ≥ 16 dons) ----------------
export const MUSEUM_EXPED_MIN = 16;
export const MUSEUM_EXPEDITIONS = [
    {
        id: 'galeries',
        name: 'Expédition des Galeries',
        desc: 'Fouille rapide des veines de fer et de cuivre avec Anatole',
        time: 2 * 3600,
        cost: { ironOre: 3, copperOre: 2 },
        geode: 'geodeStone',
        coins: 12000,
        xp: 600,
        renom: 1,
        gems: ['quartz', 'amethyst'],
        gemQty: 2,
        packs: 0,
        rubanChance: 0,
    },
    {
        id: 'veinesArgent',
        name: 'Expédition des Veines d’Argent',
        desc: 'Prospection profonde dans les strates cristallines',
        time: 4 * 3600,
        cost: { silverOre: 3, coal: 2 },
        geode: 'geodeCrystal',
        coins: 32000,
        xp: 1400,
        renom: 2,
        gems: ['ruby', 'sapphire', 'emerald'],
        gemQty: 2,
        packs: 1,
        rubanChance: 0,
    },
    {
        id: 'abysses',
        name: 'Expédition des Abysses d’Obsidienne',
        desc: 'Mission d’élite jusqu’au cœur géologique de la vallée',
        time: 6 * 3600,
        cost: { goldOre: 3, silverOre: 2 },
        geode: 'geodeAbyss',
        coins: 75000,
        xp: 3000,
        renom: 3,
        gems: ['ruby', 'sapphire', 'emerald'],
        gemQty: 3,
        packs: 2,
        rubanChance: 0.25,
    },
];

export const museumExpedOpen = () => museumOpen() && museumDonatedCount() >= MUSEUM_EXPED_MIN;
export const museumExpedState = () => ensureMuseum().exped || null;
export const museumExpedReady = () => {
    const e = museumExpedState();
    return !!(e && now() >= e.back);
};
export function museumCanStartExped(id) {
    if (!museumExpedOpen() || museumExpedState()) return false;
    const def = MUSEUM_EXPEDITIONS.find(x => x.id === id);
    if (!def) return false;
    for (const [k, n] of Object.entries(def.cost)) {
        if ((state.inventory[k] || 0) < n) return false;
    }
    const bag = state.mineDeep && state.mineDeep.geodes;
    if (def.geode && (!bag || !(bag[def.geode] > 0))) return false;
    return true;
}

export function museumStartExped(id, at = null) {
    if (!museumCanStartExped(id)) return false;
    const def = MUSEUM_EXPEDITIONS.find(x => x.id === id);
    const M = ensureMuseum();
    for (const [k, n] of Object.entries(def.cost)) state.inventory[k] -= n;
    if (def.geode) {
        state.mineDeep.geodes[def.geode]--;
        if (!state.mineDeep.geodes[def.geode]) delete state.mineDeep.geodes[def.geode];
    }
    M.exped = { id: def.id, back: now() + def.time * 1000 };
    sfx('pickaxe');
    buzz(16);
    burst(at, 'sparkle', 10);
    toast(`${def.name} lancée ! Retour dans ${def.time / 3600} h`, ['ui', 'museum']);
    changed('museum');
    return true;
}

export function museumClaimExped(at = null) {
    if (!museumExpedReady()) return null;
    const M = ensureMuseum();
    const def = MUSEUM_EXPEDITIONS.find(x => x.id === M.exped.id);
    M.exped = null;
    if (!def) return null;
    M.expedDone = (M.expedDone || 0) + 1;
    state.stats.museumExpeds = (state.stats.museumExpeds || 0) + 1;
    earn(def.coins, at);
    addXp(def.xp, at);
    addRenom(def.renom);
    const gemId = def.gems[Math.floor(Math.random() * def.gems.length)];
    if (ITEMS[gemId]) state.inventory[gemId] = (state.inventory[gemId] || 0) + def.gemQty;
    if (def.packs > 0) {
        state.tcg = state.tcg || { freePacks: 0 };
        state.tcg.freePacks = (state.tcg.freePacks || 0) + def.packs;
    }
    const gotRuban = def.rubanChance > 0 && Math.random() < def.rubanChance;
    if (gotRuban) {
        state.prestige = state.prestige || { rubans: 0, count: 0 };
        state.prestige.rubans = (state.prestige.rubans || 0) + 1;
    }
    sfx('level');
    buzz(22);
    burst(at, 'sparkle', 18);
    const bits = [`+${fmt(def.coins)} p.`, `+${def.renom} Renom`, `+${def.gemQty} ${ITEMS[gemId]?.name || gemId}`];
    if (def.packs) bits.push(`+${def.packs} booster${s(def.packs)} MeuhCG`);
    if (gotRuban) bits.push('+1 Ruban !');
    toast(`${def.name} terminée : ${bits.join(' · ')}`, ['ui', 'museum']);
    changed('museum');
    return { id: def.id, coins: def.coins, xp: def.xp, renom: def.renom, gemId, gemQty: def.gemQty, packs: def.packs, ruban: gotRuban };
}
