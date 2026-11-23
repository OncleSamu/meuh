// 1.155 : Moteur du MeuhCG — 100 % isolé dans state.tcg (aucun lien économique avec la ferme).
// Boosters, classeur, forge anti-doublons, paliers et duels contre les villageois, campeurs et la famille.
import { state } from '../core/state.js';
import { toast, sfx } from '../core/bus.js';
import { randomId } from '../art/habitants.js';
import { vName, artId, stageOf } from './family.js';
import { guestTitle } from './camping.js';
import {
    TCG_CARD_BACKS,
    TCG_CARD_BY_ID,
    TCG_CARDS,
    TCG_DECK_BUDGET,
    TCG_DUOS,
    TCG_FAMILIES,
    TCG_MILESTONES,
    TCG_RARITIES,
    TCG_RARITY_ORDER,
    TCG_SERIES,
    TCG_STATS,
    TCG_TOURNEY_RULES,
    TCG_VARIANT_ORDER,
    TCG_VARIANTS,
    TCG_VILLAGER_DUELS,
} from '../data/tcg.js';

function cleanDeckIds(arr, cards) {
    if (!Array.isArray(arr)) return [];
    const seen = new Set();
    const out = [];
    for (const id of arr) {
        if (out.length >= 5) break;
        if (!seen.has(id) && TCG_CARD_BY_ID[id] && (cards[id] || 0) > 0) {
            seen.add(id);
            out.push(id);
        }
    }
    return out;
}

function syncActiveDeck(T) {
    if (!Array.isArray(T.decks) || T.decks.length !== 3) T.decks = [[], [], []];
    T.decks[T.deckIdx] = [...T.deck];
}

export function ensureTcg() {
    if (!state.tcg || typeof state.tcg !== 'object') {
        state.tcg = {
            tokens: 120,
            dust: 0,
            freePacks: 2,
            freeGoldPacks: 0,
            dailyDay: 0,
            dailyWins: { day: state.day || 1, ids: [], claimed: false },
            cards: {}, // { cardId: count }
            variants: {}, // { cardId: { reverse: n, sketch: n, fullart: n, gold: n } }
            skin: {}, // { cardId: 'std' | 'reverse' | 'sketch' | 'fullart' | 'gold' }
            deck: [], // jusqu'à 5 ids de cartes (miroir du slot actif)
            decks: [[], [], []], // 3 emplacements de decks sauvegardés
            deckIdx: 0,
            back: 'vallee',
            cups: 0,
            fav: null,
            pity: 0,
            opened: 0,
            wins: 0,
            losses: 0,
            beaten: {}, // { opponentId: count }
            milestones: {}, // { milestoneId: true }
            tourney: null,
            trades: null,
            lastPack: null, // { seriesId, cards: [{ id, isNew, variant, isNewVar }], torn, revealed: [bool...] }
            duel: null,
        };
    }
    const T = state.tcg;
    if (!Number.isFinite(T.tokens)) T.tokens = 120;
    if (!Number.isFinite(T.dust)) T.dust = 0;
    if (!Number.isFinite(T.freePacks)) T.freePacks = 0;
    if (!Number.isFinite(T.freeGoldPacks)) T.freeGoldPacks = 0;
    if (!Number.isFinite(T.cups)) T.cups = 0;
    if (typeof T.back !== 'string' || !T.back) T.back = 'vallee';
    T.cards = T.cards || {};
    T.variants = T.variants || {};
    T.skin = T.skin || {};
    T.deckIdx = Number.isInteger(T.deckIdx) && T.deckIdx >= 0 && T.deckIdx < 3 ? T.deckIdx : 0;
    T.deck = cleanDeckIds(T.deck, T.cards);
    if (!Array.isArray(T.decks) || T.decks.length !== 3) {
        T.decks = [[], [], []];
    } else {
        T.decks = T.decks.map(d => cleanDeckIds(d, T.cards));
    }
    T.decks[T.deckIdx] = [...T.deck];
    T.beaten = T.beaten || {};
    T.milestones = T.milestones || {};
    dailyWinsBox(T);
    return T;
}

function dailyWinsBox(T) {
    const day = state.day || 1;
    if (!T.dailyWins || typeof T.dailyWins !== 'object' || T.dailyWins.day !== day) {
        T.dailyWins = { day, ids: [], claimed: false };
    }
    if (!Array.isArray(T.dailyWins.ids)) T.dailyWins.ids = [];
    return T.dailyWins;
}

// ---- Compteurs, Défi du jour & pastille Menu ----
export const tcgOwnedCount = () => {
    const T = state.tcg;
    if (!T || !T.cards) return 0;
    return TCG_CARDS.filter(c => (T.cards[c.id] || 0) > 0).length;
};
export const tcgTotalCards = () => TCG_CARDS.length;
export const tcgSeriesProgress = sid => {
    const T = state.tcg;
    const list = TCG_CARDS.filter(c => c.series === sid);
    const have = T && T.cards ? list.filter(c => (T.cards[c.id] || 0) > 0).length : 0;
    return { have, total: list.length };
};
export const tcgDailyReady = () => {
    const T = state.tcg;
    if (!T) return true;
    return (state.day || 1) > (T.dailyDay || 0);
};
export const tcgDailyBeaten = oppId => {
    const T = state.tcg;
    if (!T || !T.dailyWins || T.dailyWins.day !== (state.day || 1)) return false;
    return Array.isArray(T.dailyWins.ids) && T.dailyWins.ids.includes(oppId);
};
export const tcgDailyQuestProgress = () => {
    const T = state.tcg;
    const day = state.day || 1;
    const box = T && T.dailyWins && T.dailyWins.day === day ? T.dailyWins : null;
    const have = box && Array.isArray(box.ids) ? box.ids.length : 0;
    const claimed = !!(box && box.claimed);
    return { have, need: 3, claimed, ready: !claimed && have >= 3 };
};
export const tcgClaimableMilestones = () => {
    const T = state.tcg;
    if (!T) return [];
    const n = tcgOwnedCount();
    return TCG_MILESTONES.filter(m => n >= m.need && !(T.milestones && T.milestones[m.id]));
};
export const tcgBadge = () => {
    const T = state.tcg;
    let b = tcgDailyReady() ? 1 : 0;
    if (T && T.freePacks > 0) b += T.freePacks;
    if (T && T.freeGoldPacks > 0) b += T.freeGoldPacks;
    if (tcgDailyQuestProgress().ready) b += 1;
    b += tcgClaimableMilestones().length;
    return b;
};
export const tcgSub = () => {
    const n = tcgOwnedCount();
    return n ? `${n}/${TCG_CARDS.length} cartes` : 'Boosters & Duels';
};

// ---- Booster gratuit quotidien & Défi du jour ----
export function tcgClaimDaily() {
    const T = ensureTcg();
    if (!tcgDailyReady()) return false;
    T.dailyDay = state.day || 1;
    T.freePacks++;
    T.tokens += 30;
    sfx('level');
    toast('MeuhCG : +1 booster gratuit et +30 jetons offerts !', ['ui', 'meuhcg']);
    return true;
}

export function tcgClaimDailyQuest() {
    const T = ensureTcg();
    const box = dailyWinsBox(T);
    if (box.claimed || box.ids.length < 3) return false;
    box.claimed = true;
    T.tokens += 80;
    T.freePacks++;
    sfx('level');
    toast('Défi du jour MeuhCG : +80 jetons et +1 booster gratuit !', ['ui', 'tcgPack']);
    return true;
}

// ---- Ouverture de boosters ----
const rarIdx = r => TCG_RARITY_ORDER.indexOf(r);

function pickCard(pool, minRarity = 'C') {
    const minI = rarIdx(minRarity);
    const eligible = pool.filter(c => rarIdx(c.rarity) >= minI);
    const src = eligible.length ? eligible : pool;
    const weights = src.map(c => TCG_RARITIES[c.rarity].weight);
    const sum = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * sum;
    for (let i = 0; i < src.length; i++) {
        if ((r -= weights[i]) <= 0) return src[i];
    }
    return src[src.length - 1];
}

export function tcgCanOpenPack(seriesId) {
    const T = ensureTcg();
    const s = TCG_SERIES[seriesId];
    if (!s) return false;
    if (s.allSeries && T.freeGoldPacks > 0) return true;
    if (!s.allSeries && T.freePacks > 0) return true;
    return T.tokens >= s.cost;
}

function rollVariant(card, slotIdx, isGoldPack) {
    const pick = table => {
        let r = Math.random();
        for (const [id, p] of table) {
            if ((r -= p) <= 0) return id;
        }
        return table[table.length - 1][0];
    };
    let v = 'std';
    if (slotIdx === 3) {
        // 4e carte : finition spéciale garantie (Inversée, Croquis, Full Art ou Or Gravé)
        v = pick(
            isGoldPack
                ? [
                      ['fullart', 0.36],
                      ['gold', 0.24],
                      ['reverse', 0.25],
                      ['sketch', 0.15],
                  ]
                : [
                      ['reverse', 0.56],
                      ['sketch', 0.18],
                      ['fullart', 0.18],
                      ['gold', 0.08],
                  ],
        );
    } else if (slotIdx === 4) {
        if (isGoldPack) {
            v = pick([
                ['fullart', 0.44],
                ['gold', 0.34],
                ['reverse', 0.14],
                ['sketch', 0.08],
            ]);
        } else if (Math.random() < 0.3) {
            v = pick([
                ['reverse', 0.4],
                ['fullart', 0.32],
                ['sketch', 0.16],
                ['gold', 0.12],
            ]);
        }
    } else if (Math.random() < 0.08) {
        v = pick([
            ['reverse', 0.62],
            ['sketch', 0.23],
            ['fullart', 0.15],
        ]);
    }
    if (v === 'fullart' && (card.rarity === 'L' || card.rarity === 'S')) v = 'gold';
    return v;
}

export function tcgOpenPack(seriesId) {
    const T = ensureTcg();
    const s = TCG_SERIES[seriesId];
    if (!s || !tcgCanOpenPack(seriesId)) return null;
    const usedFreeGold = !!s.allSeries && T.freeGoldPacks > 0;
    const usedFree = !s.allSeries && T.freePacks > 0;
    if (usedFreeGold) T.freeGoldPacks--;
    else if (usedFree) T.freePacks--;
    else T.tokens -= s.cost;

    const pool = s.allSeries ? TCG_CARDS : TCG_CARDS.filter(c => c.series === seriesId);
    const drawn = [];
    const seenInPack = new Set();
    const drawOne = minR => {
        for (let k = 0; k < 8; k++) {
            const c = pickCard(pool, minR);
            if (!seenInPack.has(c.id)) {
                seenInPack.add(c.id);
                return c;
            }
        }
        return pickCard(pool, minR);
    };

    // 5 cartes : 3 normales, 1 Peu commune+ (finition spéciale garantie !), 1 Rare+ (ou Foil+ sur Doré, ou Légendaire+ au 10e booster)
    drawn.push(drawOne('C'));
    drawn.push(drawOne('C'));
    drawn.push(drawOne('C'));
    drawn.push(drawOne('U'));
    const topMin = T.pity >= 9 ? 'L' : s.minTop || 'R';
    drawn.push(drawOne(topMin));

    const hasBig = drawn.some(c => c.rarity === 'L' || c.rarity === 'S');
    T.pity = hasBig ? 0 : T.pity + 1;
    T.opened++;

    const cards = drawn.map((c, idx) => {
        const isNew = !(T.cards[c.id] > 0);
        T.cards[c.id] = (T.cards[c.id] || 0) + 1;
        const variant = rollVariant(c, idx, !!s.allSeries);
        let isNewVar = false;
        if (variant !== 'std') {
            T.variants[c.id] = T.variants[c.id] || {};
            isNewVar = !(T.variants[c.id][variant] > 0);
            T.variants[c.id][variant] = (T.variants[c.id][variant] || 0) + 1;
            if (!T.skin[c.id] || T.skin[c.id] === 'std') T.skin[c.id] = variant;
        }
        return { id: c.id, isNew, variant, isNewVar };
    });

    // Si le deck n'a pas encore 5 cartes, le compléter automatiquement dans la limite du budget (16 étoiles)
    if (T.deck.length < 5) {
        const byCost = [...cards].sort((a, b) => tcgCardCost(a.id) - tcgCardCost(b.id));
        for (const x of byCost) {
            if (T.deck.length >= 5) break;
            if (!T.deck.includes(x.id) && tcgDeckCost(T.deck) + tcgCardCost(x.id) <= TCG_DECK_BUDGET) {
                T.deck.push(x.id);
            }
        }
        syncActiveDeck(T);
    }
    if (!T.fav && cards.length) T.fav = cards[cards.length - 1].id;

    T.lastPack = {
        seriesId,
        cards,
        torn: false,
        revealed: [false, false, false, false, false],
    };
    sfx('pop');
    return T.lastPack;
}

export function tcgTearPack() {
    const T = ensureTcg();
    if (!T.lastPack || T.lastPack.torn) return false;
    T.lastPack.torn = true;
    sfx('harvest');
    return true;
}

export function tcgRevealCard(idx) {
    const T = ensureTcg();
    const p = T.lastPack;
    if (!p || !p.torn || !p.cards[idx] || p.revealed[idx]) return false;
    p.revealed[idx] = true;
    const entry = p.cards[idx];
    const c = TCG_CARD_BY_ID[entry.id];
    const bigVar = entry.variant === 'gold' || entry.variant === 'fullart';
    const midVar = entry.variant === 'reverse' || entry.variant === 'sketch';
    sfx(
        bigVar || (c && (c.rarity === 'L' || c.rarity === 'S'))
            ? 'level'
            : midVar || (c && (c.rarity === 'R' || c.rarity === 'F'))
              ? 'sell'
              : 'click',
    );
    return true;
}

export function tcgRevealAll() {
    const T = ensureTcg();
    const p = T.lastPack;
    if (!p) return false;
    p.torn = true;
    p.revealed = p.cards.map(() => true);
    const big = p.cards.some(x => {
        const r = TCG_CARD_BY_ID[x.id]?.rarity;
        return r === 'L' || r === 'S' || x.variant === 'gold' || x.variant === 'fullart';
    });
    sfx(big ? 'level' : 'harvest');
    return true;
}

export function tcgClosePack() {
    const T = ensureTcg();
    T.lastPack = null;
    return true;
}

// ---- Variantes & Finitions de cartes (Inversée, Croquis, Full Art, Or Gravé) ----
export function tcgCardVariants(id) {
    const T = ensureTcg();
    if (!(T.cards[id] > 0)) return [];
    const vmap = (T.variants && T.variants[id]) || {};
    return TCG_VARIANT_ORDER.filter(v => v === 'std' || (vmap[v] || 0) > 0);
}

export function tcgCardSkin(id) {
    const T = state.tcg;
    if (!T || !(T.cards && T.cards[id] > 0)) return 'std';
    const cur = T.skin && T.skin[id];
    if (cur && cur !== 'std' && T.variants && T.variants[id] && T.variants[id][cur] > 0) return cur;
    return 'std';
}

export function tcgHasSpecialVariant(id) {
    const T = state.tcg;
    const vmap = T && T.variants && T.variants[id];
    return !!(vmap && Object.values(vmap).some(n => n > 0));
}

export function tcgSpecialVariantCount() {
    const T = state.tcg;
    if (!T || !T.variants) return 0;
    let total = 0;
    for (const vmap of Object.values(T.variants)) {
        if (!vmap) continue;
        for (const [k, n] of Object.entries(vmap)) {
            if (k !== 'std' && n > 0) total++;
        }
    }
    return total;
}

export function tcgSetCardSkin(id, variantId) {
    const T = ensureTcg();
    if (!TCG_CARD_BY_ID[id] || !(T.cards[id] > 0) || !TCG_VARIANTS[variantId]) return false;
    if (variantId !== 'std' && !(T.variants[id] && T.variants[id][variantId] > 0)) return false;
    T.skin[id] = variantId;
    sfx('click');
    return true;
}

export function tcgCraftVariant(id, variantId) {
    const T = ensureTcg();
    const c = TCG_CARD_BY_ID[id];
    const v = TCG_VARIANTS[variantId];
    if (!c || !v || variantId === 'std' || !(T.cards[id] > 0)) return false;
    T.variants[id] = T.variants[id] || {};
    if (T.variants[id][variantId] > 0) return tcgSetCardSkin(id, variantId);
    if (T.dust < v.craft) return false;
    T.dust -= v.craft;
    T.variants[id][variantId] = 1;
    T.skin[id] = variantId;
    sfx('level');
    toast(`${c.name} · édition ${v.name} débloquée !`, ['ui', 'meuhcg']);
    return true;
}

// ---- Doublons, Forge & Paliers ----
export function tcgDupeSummary() {
    const T = ensureTcg();
    let count = 0;
    let dust = 0;
    for (const [id, n] of Object.entries(T.cards)) {
        if (n > 1 && TCG_CARD_BY_ID[id]) {
            const extra = n - 1;
            count += extra;
            dust += extra * TCG_RARITIES[TCG_CARD_BY_ID[id].rarity].dust;
        }
    }
    return { count, dust };
}

export function tcgRecycleDupes() {
    const T = ensureTcg();
    const { count, dust } = tcgDupeSummary();
    if (!count) return 0;
    for (const id of Object.keys(T.cards)) {
        if (T.cards[id] > 1 && TCG_CARD_BY_ID[id]) T.cards[id] = 1;
    }
    T.dust += dust;
    sfx('sell');
    toast(`${count} doublon${count > 1 ? 's' : ''} recyclé${count > 1 ? 's' : ''} : +${dust} poussière dorée`, ['ui', 'tcgDust']);
    return dust;
}

export function tcgCraftCard(id) {
    const T = ensureTcg();
    const c = TCG_CARD_BY_ID[id];
    if (!c || (T.cards[id] || 0) > 0) return false;
    const cost = TCG_RARITIES[c.rarity].craft;
    if (T.dust < cost) return false;
    T.dust -= cost;
    T.cards[id] = 1;
    if (T.deck.length < 5 && !T.deck.includes(id) && tcgDeckCost(T.deck) + tcgCardCost(id) <= TCG_DECK_BUDGET) {
        T.deck.push(id);
        syncActiveDeck(T);
    }
    sfx('level');
    toast(`Carte forgée : ${c.name} !`, ['ui', 'meuhcg']);
    return true;
}

export function tcgClaimMilestone(id) {
    const T = ensureTcg();
    const m = TCG_MILESTONES.find(x => x.id === id);
    if (!m || T.milestones[id] || tcgOwnedCount() < m.need) return false;
    T.milestones[id] = true;
    T.tokens += m.tokens;
    T.freePacks += m.packs;
    sfx('level');
    toast(`Palier « ${m.name} » : +${m.tokens} jetons et +${m.packs} booster${m.packs > 1 ? 's' : ''} !`, ['ui', 'tcgPack']);
    return true;
}

// ---- 3 Decks sauvegardés (5 cartes, budget 16 étoiles), Duos secrets & Dos de cartes ----
export const tcgCardCost = id => TCG_RARITIES[TCG_CARD_BY_ID[id]?.rarity]?.cost || 1;
export const tcgDeckCost = (deckIds = ensureTcg().deck) => deckIds.reduce((s, id) => s + tcgCardCost(id), 0);
export const tcgDeckValid = (deckIds = ensureTcg().deck, maxBudget = TCG_DECK_BUDGET) =>
    deckIds.length === 5 && tcgDeckCost(deckIds) <= maxBudget;

export function tcgSelectDeck(idx) {
    const T = ensureTcg();
    if (!Number.isInteger(idx) || idx < 0 || idx > 2) return false;
    if (T.deckIdx === idx) return true;
    syncActiveDeck(T);
    T.deckIdx = idx;
    T.deck = [...(T.decks[idx] || [])];
    sfx('click');
    return true;
}

export function tcgToggleDeck(id) {
    const T = ensureTcg();
    if (!TCG_CARD_BY_ID[id] || !(T.cards[id] > 0)) return false;
    const idx = T.deck.indexOf(id);
    if (idx >= 0) {
        T.deck.splice(idx, 1);
        syncActiveDeck(T);
        sfx('click');
        return true;
    }
    if (T.deck.length >= 5) {
        toast('Ton deck contient déjà 5 cartes : retire-en une d’abord.', ['ui', 'meuhcg']);
        return false;
    }
    const nextCost = tcgDeckCost(T.deck) + tcgCardCost(id);
    if (nextCost > TCG_DECK_BUDGET) {
        toast(`Budget du deck dépassé (${nextCost}/${TCG_DECK_BUDGET} étoiles max) : retire une carte coûteuse.`, ['ui', 'meuhcg']);
        return false;
    }
    T.deck.push(id);
    syncActiveDeck(T);
    sfx('pop');
    return true;
}

export function tcgDeckDuos(deckIds) {
    const set = new Set(deckIds || []);
    return TCG_DUOS.filter(d => d.cards.every(id => set.has(id)));
}

export function tcgAutoDeck(maxBudget = TCG_DECK_BUDGET) {
    const T = ensureTcg();
    const owned = TCG_CARDS.filter(c => (T.cards[c.id] || 0) > 0);
    if (!owned.length) return false;

    const statSum = c => c.stats[0] + c.stats[1] + c.stats[2];
    const capByCost = { 1: 5, 2: 4, 3: 3, 4: 2, 5: 2, 6: 2 };
    const buckets = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };
    for (const c of owned) buckets[tcgCardCost(c.id)].push(c);
    const pool = [];
    for (let cost = 1; cost <= 6; cost++) {
        buckets[cost].sort((a, b) => statSum(b) - statSum(a));
        pool.push(...buckets[cost].slice(0, capByCost[cost]));
    }

    let bestDeck = null;
    let bestScore = -1;
    const cur = [];
    const dfs = (start, cost, sum) => {
        const rem = 5 - cur.length;
        if (rem === 0) {
            const famCount = {};
            for (const c of cur) famCount[c.family] = (famCount[c.family] || 0) + 1;
            let synBonus = 0;
            for (const c of cur) if (famCount[c.family] >= 2) synBonus += 5;
            const ids = cur.map(c => c.id);
            const duoBonus = tcgDeckDuos(ids).reduce((s, d) => s + d.bonus * 5, 0);
            const total = sum + synBonus + duoBonus;
            if (total > bestScore) {
                bestScore = total;
                bestDeck = ids;
            }
            return;
        }
        if (cost + rem > maxBudget) return;
        for (let i = start; i <= pool.length - rem; i++) {
            const c = pool[i];
            const cc = tcgCardCost(c.id);
            if (cost + cc + (rem - 1) > maxBudget) continue;
            cur.push(c);
            dfs(i + 1, cost + cc, sum + statSum(c));
            cur.pop();
        }
    };
    if (pool.length >= 5) dfs(0, 0, 0);

    if (bestDeck) {
        T.deck = bestDeck;
    } else {
        // Fallback si moins de 5 cartes possédées ou aucune combinaison <= budget
        const cheap = [...owned].sort((a, b) => tcgCardCost(a.id) - tcgCardCost(b.id) || statSum(b) - statSum(a));
        const pick = [];
        let cost = 0;
        for (const c of cheap) {
            const cc = tcgCardCost(c.id);
            if (pick.length < 5 && cost + cc <= maxBudget) {
                pick.push(c.id);
                cost += cc;
            }
        }
        T.deck = pick;
    }
    syncActiveDeck(T);
    sfx('pop');
    return T.deck.length > 0;
}

export function tcgSetFav(id) {
    const T = ensureTcg();
    if (!TCG_CARD_BY_ID[id] || !(T.cards[id] > 0)) return false;
    T.fav = id;
    sfx('click');
    return true;
}

export function tcgDeckSynergies(deckIds) {
    const counts = {};
    for (const id of deckIds) {
        const c = TCG_CARD_BY_ID[id];
        if (c) counts[c.family] = (counts[c.family] || 0) + 1;
    }
    return new Set(Object.keys(counts).filter(f => counts[f] >= 2));
}

// ---- Dos de cartes déblocables ----
export function tcgUnlockedBacks() {
    const T = state.tcg;
    const owned = tcgOwnedCount();
    const cups = (T && T.cups) || 0;
    return TCG_CARD_BACKS.filter(b => owned >= b.needCards || (b.needCups > 0 && cups >= b.needCups)).map(b => b.id);
}

export function tcgCardBack() {
    const T = state.tcg;
    const cur = T && T.back;
    if (cur && tcgUnlockedBacks().includes(cur)) return cur;
    return 'vallee';
}

export function tcgSetCardBack(backId) {
    const T = ensureTcg();
    if (!tcgUnlockedBacks().includes(backId)) return false;
    T.back = backId;
    sfx('click');
    return true;
}

// ---- Troc du jour avec les villageois (3 offres quotidiennes) ----
function nextRng(seed) {
    return (Math.imul(seed || 1337, 1664525) + 1013904223) >>> 0;
}

function tradesBox(T) {
    const day = state.day || 1;
    if (T.trades && typeof T.trades === 'object' && T.trades.day === day && Array.isArray(T.trades.offers) && T.trades.offers.length === 3) {
        return T.trades;
    }
    let rng = hashStr('tcg-trades:' + day);
    const pick = arr => {
        rng = nextRng(rng);
        return arr[rng % arr.length];
    };
    const vPool = [...TCG_VILLAGER_DUELS];
    const specs = [
        { rarities: ['C', 'U'], forceVar: ['reverse', 'sketch'] },
        { rarities: ['U', 'R'], preferMissing: true, altVar: ['reverse', 'sketch'] },
        { rarities: ['R', 'F'], preferMissing: true, altVar: ['fullart', 'gold'] },
    ];
    const offers = specs.map((sp, idx) => {
        rng = nextRng(rng);
        const vIdx = rng % vPool.length;
        const v = vPool.splice(vIdx, 1)[0];
        const rar = pick(sp.rarities);
        const allR = TCG_CARDS.filter(c => c.rarity === rar);
        const missing = sp.preferMissing ? allR.filter(c => !(T.cards[c.id] > 0)) : [];
        const card = pick(missing.length ? missing : allR);
        let offerVariant = 'std';
        if (sp.forceVar) {
            offerVariant = pick(sp.forceVar);
        } else if (missing.length) {
            rng = nextRng(rng);
            if (rng % 10 < 3) offerVariant = pick(sp.altVar);
        } else {
            offerVariant = pick(sp.altVar);
        }
        return {
            idx,
            villagerId: v.id,
            villagerName: v.name,
            villagerArt: v.art,
            giveRarity: rar,
            offerCardId: card.id,
            offerVariant,
            done: false,
        };
    });
    T.trades = { day, offers };
    return T.trades;
}

export function tcgTradeCandidate(rarity, excludeCardId = null) {
    const T = ensureTcg();
    const dupes = Object.entries(T.cards)
        .filter(([id, n]) => n > 1 && TCG_CARD_BY_ID[id]?.rarity === rarity)
        .sort((a, b) => (a[0] === excludeCardId ? 1 : 0) - (b[0] === excludeCardId ? 1 : 0) || b[1] - a[1]);
    return dupes.length ? dupes[0][0] : null;
}

export function tcgDailyTrades() {
    const T = ensureTcg();
    const box = tradesBox(T);
    return box.offers.map(o => {
        const giveId = o.done ? null : tcgTradeCandidate(o.giveRarity, o.offerCardId);
        return { ...o, giveId, canAccept: !o.done && !!giveId };
    });
}

export function tcgAcceptTrade(idx) {
    const T = ensureTcg();
    const box = tradesBox(T);
    const offer = box.offers[idx];
    if (!offer || offer.done) return false;
    const giveId = tcgTradeCandidate(offer.giveRarity, offer.offerCardId);
    if (!giveId) {
        const rName = TCG_RARITIES[offer.giveRarity]?.name || offer.giveRarity;
        toast(`Il te faut un doublon ${rName} pour cet échange.`, ['ui', 'meuhcg']);
        return false;
    }
    const c = TCG_CARD_BY_ID[offer.offerCardId];
    if (!c) return false;
    T.cards[giveId]--;
    T.cards[offer.offerCardId] = (T.cards[offer.offerCardId] || 0) + 1;
    if (offer.offerVariant && offer.offerVariant !== 'std') {
        T.variants[offer.offerCardId] = T.variants[offer.offerCardId] || {};
        T.variants[offer.offerCardId][offer.offerVariant] = (T.variants[offer.offerCardId][offer.offerVariant] || 0) + 1;
        T.skin[offer.offerCardId] = offer.offerVariant;
    }
    offer.done = true;
    if (T.deck.length < 5 && !T.deck.includes(c.id) && tcgDeckCost(T.deck) + tcgCardCost(c.id) <= TCG_DECK_BUDGET) {
        T.deck.push(c.id);
        syncActiveDeck(T);
    }
    sfx('level');
    const vLabel = offer.offerVariant !== 'std' ? ` (${TCG_VARIANTS[offer.offerVariant]?.name || offer.offerVariant})` : '';
    toast(`Troc réussi avec ${offer.villagerName} : ${c.name}${vLabel} reçue !`, ['ui', 'meuhcg']);
    return true;
}

// ---- Adversaires de Duel : Villageois + Campeurs réels + Famille réelle ----
function hashStr(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) {
        h ^= s.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return h >>> 0;
}

function seededDeck(seed, maxRarIdx) {
    const pool = TCG_CARDS.filter(c => rarIdx(c.rarity) <= maxRarIdx);
    const out = [];
    let x = seed || 1337;
    while (out.length < 5 && pool.length) {
        x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
        const c = pool[x % pool.length];
        if (!out.includes(c.id)) out.push(c.id);
    }
    return out;
}

const DEMO_CAMPERS = [
    {
        id: 'c_demo_leo',
        cat: 'camping',
        name: 'Léo du Van',
        role: 'Campeur de passage',
        art: randomId(41021, { male: true, season: 'ete' }),
        diff: 1,
        diffLabel: 'Facile',
        terrain: 'horizons',
        terrainName: 'Feu de camp',
        reward: 45,
        quote: '« On fait une partie autour du feu de camp ? »',
        winQuote: '« Super partie ! J’adore l’ambiance de ta vallée. »',
        loseQuote: '« Les soirées au camping, ça aiguise la stratégie ! »',
        deck: ['v03', 'v12', 'h01', 'h03', 't06'],
    },
    {
        id: 'c_demo_camille',
        cat: 'camping',
        name: 'Camille',
        role: 'Randonneuse curieuse',
        art: randomId(78932, { female: true, season: 'printemps' }),
        diff: 2,
        diffLabel: 'Moyen',
        terrain: 'horizons',
        terrainName: 'Sentier du camping',
        reward: 65,
        quote: '« J’ai glissé mes cartes préférées dans mon sac à dos ! »',
        winQuote: '« Bravo ! Tu m’offres la revanche au prochain sentier ? »',
        loseQuote: '« Et une victoire de plus dans mon carnet de voyage ! »',
        deck: ['h05', 'h14', 'p01', 'p09', 'h23'],
    },
];

function kidPortraitId(k) {
    const st = stageOf(k);
    if (st === 0) return (k.girl ? 'B:' : 'b:') + k.look;
    if (st === 1) return 'c:' + k.look;
    return k.look;
}

export function tcgOpponents() {
    const out = [...TCG_VILLAGER_DUELS];

    // 1. Campeurs réels du camping (invités + résidents)
    const guests = (state.camping && state.camping.guests) || [];
    const res = (state.camping && state.camping.res) || [];
    if (guests.length || res.length) {
        guests.forEach((g, idx) => {
            const h = hashStr('g:' + g.name + ':' + (g.look || idx));
            const star = g.star != null;
            let title = 'Campeur';
            try {
                title = guestTitle(g) || 'Campeur';
            } catch {
                title = 'Campeur';
            }
            out.push({
                id: 'cg_' + (h & 0xfffff),
                cat: 'camping',
                name: g.name,
                role: title + (g.from ? ' · ' + g.from : ''),
                art: g.look,
                diff: star ? 3 : 2,
                diffLabel: star ? 'Difficile' : 'Moyen',
                terrain: 'horizons',
                terrainName: 'Clairière du camping',
                reward: star ? 90 : 55,
                quote: g.say ? `« ${g.say} On se fait un duel ? »` : '« Super camping ! Tu fais une petite partie de MeuhCG ? »',
                winQuote: '« Quelle partie mémorable, je reviendrai au camping ! »',
                loseQuote: '« Héhé, je repars avec un beau souvenir de duel ! »',
                deck: seededDeck(h, star ? 4 : 2),
            });
        });
        res.forEach((r, idx) => {
            const h = hashStr('r:' + r.name + ':' + (r.look || idx));
            out.push({
                id: 'cr_' + (h & 0xfffff),
                cat: 'camping',
                name: r.name,
                role: r.job ? `Résident · ${r.job}` : 'Résident du camping',
                art: r.look,
                diff: 3,
                diffLabel: 'Difficile',
                terrain: 'horizons',
                terrainName: 'Bungalow du camping',
                reward: 80,
                quote: '« Depuis que j’habite ici, je m’entraîne tous les soirs au MeuhCG ! »',
                winQuote: '« Magnifique victoire ! On remet ça demain ? »',
                loseQuote: '« L’air du camping me réussit vraiment aux cartes ! »',
                deck: seededDeck(h, 4),
            });
        });
    } else {
        out.push(...DEMO_CAMPERS);
    }

    // 2. Famille réelle (conjoint, enfants, proches)
    const F = state.family;
    if (F) {
        if (F.spouse) {
            const name = vName(F.spouse);
            const look = artId(F.spouse);
            const h = hashStr('sp:' + name);
            out.push({
                id: 'fam_spouse',
                cat: 'family',
                name,
                role: 'Ton conjoint',
                art: look,
                diff: 3,
                diffLabel: 'Difficile',
                terrain: 'village',
                terrainName: 'Table de la maison',
                reward: 90,
                quote: '« Le perdant fait la vaisselle ce soir ! Prêt ? »',
                winQuote: '« D’accord, d’accord, je fais la vaisselle avec le sourire ! »',
                loseQuote: '« Héhé ! À toi l’éponge ce soir, mon amour ! »',
                deck: seededDeck(h, 4),
            });
        }
        (F.kids || []).forEach(k => {
            const st = stageOf(k);
            const h = hashStr('kid:' + k.id + ':' + k.name);
            const diff = st >= 3 ? 3 : st >= 2 ? 2 : 1;
            out.push({
                id: 'fam_kid_' + k.id,
                cat: 'family',
                name: k.name,
                role: st === 0 ? 'Bébé de la maison' : st === 1 ? 'Enfant de la maison' : st === 2 ? 'Ado de la maison' : 'Jeune adulte',
                art: kidPortraitId(k),
                diff,
                diffLabel: diff === 1 ? 'Facile' : diff === 2 ? 'Moyen' : 'Difficile',
                terrain: 'elevage',
                terrainName: 'Salon familial',
                reward: 45 + diff * 15,
                quote: st <= 1 ? '« Regarde mes cartes brillantes ! On joue ensemble ? »' : '« J’ai monté un deck secret pour te battre ! »',
                winQuote: '« Trop fort ! Tu m’apprends tes combos ? »',
                loseQuote: '« Ouais !! L’élève a dépassé le maître ! »',
                deck: seededDeck(h, diff === 1 ? 1 : diff === 2 ? 3 : 4),
            });
        });
        (F.kin || []).slice(0, 6).forEach((k, idx) => {
            const h = hashStr('kin:' + (k.name || idx));
            out.push({
                id: 'fam_kin_' + (h & 0xfffff),
                cat: 'family',
                name: k.name || 'Ancien de la famille',
                role: k.role || 'Membre de la lignée',
                art: k.look || 'odette',
                diff: 3,
                diffLabel: 'Difficile',
                terrain: 'village',
                terrainName: 'Terrasse familiale',
                reward: 85,
                quote: '« Voyons si la nouvelle génération maîtrise toujours le MeuhCG ! »',
                winQuote: '« La relève est assurée, quelle fierté ! »',
                loseQuote: '« L’expérience de la lignée parle encore ! »',
                deck: seededDeck(h, 4),
            });
        });
    }

    return out;
}

// ---- Tournoi de la Vallée (3 matchs éliminatoires/jour + règles tournantes) ----
function tourneyBox(T) {
    const day = state.day || 1;
    if (
        T.tourney &&
        typeof T.tourney === 'object' &&
        T.tourney.day === day &&
        Array.isArray(T.tourney.oppIds) &&
        T.tourney.oppIds.length === 3
    ) {
        return T.tourney;
    }
    const rule = TCG_TOURNEY_RULES[(day - 1) % TCG_TOURNEY_RULES.length];
    let rng = hashStr('tcg-tourney:' + day);
    const pick = arr => {
        rng = nextRng(rng);
        return arr[rng % arr.length];
    };
    const easy = TCG_VILLAGER_DUELS.filter(v => v.diff === 1);
    const med = TCG_VILLAGER_DUELS.filter(v => v.diff === 2);
    const hard = TCG_VILLAGER_DUELS.filter(v => v.diff >= 3);
    const o0 = pick(easy);
    const o1 = pick(med);
    const o2 = pick(hard);
    T.tourney = {
        day,
        ruleId: rule.id,
        oppIds: [o0.id, o1.id, o2.id],
        stage: 0,
        wonToday: false,
    };
    return T.tourney;
}

export function tcgTourneyStatus() {
    const T = ensureTcg();
    const box = tourneyBox(T);
    const rule = TCG_TOURNEY_RULES.find(r => r.id === box.ruleId) || TCG_TOURNEY_RULES[0];
    const opps = box.oppIds.map(id => TCG_VILLAGER_DUELS.find(v => v.id === id)).filter(Boolean);
    return {
        day: box.day,
        rule,
        stage: box.stage || 0,
        wonToday: !!box.wonToday,
        cups: T.cups || 0,
        opps,
    };
}

export function tcgStartTourneyMatch() {
    const T = ensureTcg();
    const box = tourneyBox(T);
    if (box.wonToday) {
        toast('Tu as déjà remporté le Tournoi de la Vallée aujourd’hui ! Reviens demain.', ['ui', 'meuhcg']);
        return false;
    }
    const rule = TCG_TOURNEY_RULES.find(r => r.id === box.ruleId) || TCG_TOURNEY_RULES[0];
    const stage = Math.max(0, Math.min(2, box.stage || 0));
    const oppId = box.oppIds[stage];
    return tcgStartDuel(oppId, {
        stage,
        ruleId: rule.id,
        ruleName: rule.name,
        ruleDesc: rule.desc,
        budget: rule.budget,
    });
}

// ---- Moteur de Duel 2.2 (Duos secrets, Manche ×2, décomposition & Tournoi de la Vallée) ----
function resolveDuos(ids) {
    if (!Array.isArray(ids) || !ids.length) return [];
    return ids.map(id => TCG_DUOS.find(d => d.id === id)).filter(Boolean);
}

function evalCard(
    cardId,
    statIdx,
    { synSet, duos, terrain, otherHand, nextBonus, entraide, masterBoost, oppIsHorizons, synBonus = 2, saveurBoost = 0 },
) {
    const c = TCG_CARD_BY_ID[cardId];
    if (!c) return { total: 0, tags: [] };
    let total = c.stats[statIdx];
    const tags = [];
    if (synSet.has(c.family)) {
        if (oppIsHorizons) {
            tags.push('Synergie annulée (Aventure)');
        } else {
            total += synBonus;
            tags.push(`+${synBonus} synergie`);
        }
    }
    if (duos && duos.length) {
        for (const d of duos) {
            if (d.cards.includes(cardId)) {
                total += d.bonus;
                tags.push(`+${d.bonus} ${d.name}`);
            }
        }
    }
    if (terrain && c.family === terrain) {
        total += 1;
        tags.push('+1 terrain');
    }
    if (c.family === 'elevage') {
        const herd = Math.min(2, otherHand.filter(id => TCG_CARD_BY_ID[id]?.family === 'elevage').length);
        if (herd > 0) {
            total += herd;
            tags.push(`+${herd} Troupeau`);
        }
    }
    if (c.family === 'horizons' && terrain && terrain !== 'horizons') {
        total += 1;
        tags.push('+1 Aventure');
    }
    if (c.family === 'terroir' && statIdx === 1) {
        total += 1;
        tags.push('+1 Festin');
    }
    if (saveurBoost > 0 && statIdx === 1) {
        total += saveurBoost;
        tags.push(`+${saveurBoost} Banquet`);
    }
    if (nextBonus > 0) {
        total += nextBonus;
        tags.push(`+${nextBonus} Récolte`);
    }
    if (entraide) {
        total += 1;
        tags.push('+1 Entraide');
    }
    if (masterBoost > 0) {
        total += masterBoost;
        tags.push(masterBoost >= 3 ? `+${masterBoost} Coup de Maître` : `+${masterBoost} Coup spécial`);
    }
    return { total, tags };
}

export function tcgCardPreview(D, cardId) {
    if (!D || D.done) return { total: 0, tags: [] };
    const statIdx = D.rounds[D.round];
    const others = D.pHand.filter(id => id !== cardId);
    return evalCard(cardId, statIdx, {
        synSet: new Set(D.pSyn || []),
        duos: resolveDuos(D.pDuos),
        terrain: D.terrain,
        otherHand: others,
        nextBonus: D.pNextBonus || 0,
        entraide: (D.pEntraide || 0) > 0,
        masterBoost: D.boostArmed ? 3 : 0,
        oppIsHorizons: false,
        synBonus: D.synBonus || 2,
        saveurBoost: D.saveurBoost || 0,
    });
}

export function tcgCardPreviewPower(D, cardId) {
    return tcgCardPreview(D, cardId).total;
}

export function tcgStartDuel(oppId, tourneyOpt = null) {
    const T = ensureTcg();
    const budget = tourneyOpt ? tourneyOpt.budget : TCG_DECK_BUDGET;
    if (T.deck.length < 5) {
        tcgAutoDeck(budget);
        if (T.deck.length < 5) {
            toast('Ouvre un booster pour obtenir 5 cartes avant de lancer un duel !', ['ui', 'meuhcg']);
            return false;
        }
    }
    if (tcgDeckCost(T.deck) > budget) {
        toast(
            budget < TCG_DECK_BUDGET
                ? `Ce tournoi impose un budget de ${budget} étoiles max : utilise « Auto ${budget}★ » ou un autre deck !`
                : `Ton deck dépasse le budget de ${budget} étoiles : ajuste-le dans Mon Deck ou clique sur Auto !`,
            ['ui', 'meuhcg'],
        );
        return false;
    }
    const opp = tcgOpponents().find(o => o.id === oppId);
    if (!opp) return false;
    // 5 manches variées couvrant toujours les 3 critères au moins une fois
    const base = [0, 1, 2, Math.floor(Math.random() * 3), Math.floor(Math.random() * 3)];
    const rounds = base.sort(() => Math.random() - 0.5);
    const oppHand = [...opp.deck].sort(() => Math.random() - 0.5);
    const doubleRound = 1 + Math.floor(Math.random() * 3); // Manche 2, 3 ou 4 vaut ×2 points !
    T.duel = {
        oppId: opp.id,
        oppName: opp.name,
        oppRole: opp.role,
        oppArt: opp.art,
        oppDiff: opp.diff,
        oppDiffLabel: opp.diffLabel,
        terrain: opp.terrain || 'village',
        terrainName: opp.terrainName || 'Place du village',
        reward: opp.reward,
        quote: opp.quote,
        winQuote: opp.winQuote,
        loseQuote: opp.loseQuote,
        rounds,
        doubleRound,
        history: [], // 'win' | 'lose' | 'draw'
        round: 0,
        pHand: [...T.deck],
        oHand: oppHand,
        pSyn: [...tcgDeckSynergies(T.deck)],
        oSyn: [...tcgDeckSynergies(oppHand)],
        pDuos: tcgDeckDuos(T.deck).map(d => d.id),
        oDuos: tcgDeckDuos(oppHand).map(d => d.id),
        tourney: tourneyOpt ? { ...tourneyOpt } : null,
        synBonus: tourneyOpt?.ruleId === 'double_syn' ? 3 : 2,
        saveurBoost: tourneyOpt?.ruleId === 'boost_saveur' ? 2 : 0,
        randomTerrain: tourneyOpt?.ruleId === 'random_terrain',
        pNextBonus: 0,
        oNextBonus: 0,
        pEntraide: 0,
        oEntraide: 0,
        usedReroll: false,
        usedBoost: false,
        boostArmed: false,
        oHasBoost: opp.diff >= 3,
        oUsedBoost: false,
        pScore: 0,
        oScore: 0,
        last: null,
        done: false,
        result: null,
        gainTokens: 0,
        training: false,
        firstWinPack: false,
        tourneyChamp: false,
        tourneyNext: null,
        tourneyOut: false,
    };
    sfx('pop');
    return true;
}

export function tcgDuelReroll() {
    const T = ensureTcg();
    const D = T.duel;
    if (!D || D.done || D.usedReroll) return false;
    D.rounds[D.round] = (D.rounds[D.round] + 1) % 3;
    D.usedReroll = true;
    sfx('click');
    return true;
}

export function tcgDuelBoost() {
    const T = ensureTcg();
    const D = T.duel;
    if (!D || D.done || D.usedBoost) return false;
    D.usedBoost = true;
    D.boostArmed = true;
    sfx('level');
    return true;
}

export function tcgPlayDuelCard(handIdx) {
    const T = ensureTcg();
    const D = T.duel;
    if (!D || D.done || !D.pHand[handIdx]) return false;

    const statIdx = D.rounds[D.round];
    const pId = D.pHand.splice(handIdx, 1)[0];
    const pSyn = new Set(D.pSyn || []);
    const oSyn = new Set(D.oSyn || []);
    const pDuos = resolveDuos(D.pDuos);
    const oDuos = resolveDuos(D.oDuos);
    const synBonus = D.synBonus || 2;
    const saveurBoost = D.saveurBoost || 0;

    // Choix IA selon difficulté (tient compte du terrain, synergie, duos et pouvoirs)
    let oPick = 0;
    if (D.oppDiff >= 3 || (D.oppDiff === 2 && Math.random() < 0.6)) {
        let best = -1;
        D.oHand.forEach((cid, i) => {
            const others = D.oHand.filter((_, j) => j !== i);
            const ev = evalCard(cid, statIdx, {
                synSet: oSyn,
                duos: oDuos,
                terrain: D.terrain,
                otherHand: others,
                nextBonus: D.oNextBonus || 0,
                entraide: (D.oEntraide || 0) > 0,
                masterBoost: 0,
                oppIsHorizons: false,
                synBonus,
                saveurBoost,
            });
            if (ev.total > best) {
                best = ev.total;
                oPick = i;
            }
        });
    } else {
        oPick = Math.floor(Math.random() * D.oHand.length);
    }
    const oId = D.oHand.splice(oPick, 1)[0];
    const pCard = TCG_CARD_BY_ID[pId];
    const oCard = TCG_CARD_BY_ID[oId];

    // Coup spécial (+2) des adversaires Difficile & Maître (utilisé 1× entre les manches 2 et 4)
    const oBossBoost = !!(
        D.oHasBoost &&
        !D.oUsedBoost &&
        D.round >= 1 &&
        D.round <= 3 &&
        (D.round === D.doubleRound || D.oScore <= D.pScore || D.round === 3)
    );
    if (oBossBoost) D.oUsedBoost = true;

    const pEval = evalCard(pId, statIdx, {
        synSet: pSyn,
        duos: pDuos,
        terrain: D.terrain,
        otherHand: D.pHand,
        nextBonus: D.pNextBonus || 0,
        entraide: (D.pEntraide || 0) > 0,
        masterBoost: D.boostArmed ? 3 : 0,
        oppIsHorizons: oCard.family === 'horizons',
        synBonus,
        saveurBoost,
    });
    const oEval = evalCard(oId, statIdx, {
        synSet: oSyn,
        duos: oDuos,
        terrain: D.terrain,
        otherHand: D.oHand,
        nextBonus: D.oNextBonus || 0,
        entraide: (D.oEntraide || 0) > 0,
        masterBoost: oBossBoost ? 2 : 0,
        oppIsHorizons: pCard.family === 'horizons',
        synBonus,
        saveurBoost,
    });

    // Consommer les bonus à usage unique et 1 charge d'Entraide
    D.pNextBonus = 0;
    D.oNextBonus = 0;
    D.boostArmed = false;
    if (D.pEntraide > 0) D.pEntraide--;
    if (D.oEntraide > 0) D.oEntraide--;

    let outcome = 'draw';
    const notes = [];
    if (oBossBoost) notes.push(`${D.oppName} déclenche son Coup spécial (+2) !`);

    if (pEval.total > oEval.total) {
        if (oCard.family === 'atelier' && pEval.total - oEval.total <= 2) {
            outcome = 'draw';
            notes.push('Savoir-faire adverse : égalité sauvée !');
        } else {
            outcome = 'win';
        }
    } else if (oEval.total > pEval.total) {
        if (pCard.family === 'atelier' && oEval.total - pEval.total <= 2) {
            outcome = 'draw';
            notes.push('Savoir-faire : égalité sauvée !');
        } else {
            outcome = 'lose';
        }
    } else {
        // Égalité : le pouvoir Festin (Terroir) tranche !
        if (pCard.family === 'terroir' && oCard.family !== 'terroir') {
            outcome = 'win';
            notes.push('Festin remporte l’égalité !');
        } else if (oCard.family === 'terroir' && pCard.family !== 'terroir') {
            outcome = 'lose';
            notes.push('Festin adverse remporte l’égalité !');
        }
    }

    const pts = D.round === D.doubleRound ? 2 : 1;

    // Effets après manche : Récolte (Potager) & Entraide (Village : +1 sur les 2 prochaines cartes)
    if (outcome === 'win') {
        D.pScore += pts;
        if (pts === 2) notes.unshift('Manche double (×2) : +2 points !');
        if (pCard.family === 'potager') {
            D.pNextBonus = 2;
            notes.push('Récolte : +2 sur ta prochaine carte !');
        }
    } else if (outcome === 'lose') {
        D.oScore += pts;
        if (pts === 2) notes.unshift('Manche double (×2) : +2 points adverses !');
        if (oCard.family === 'potager') {
            D.oNextBonus = 2;
            notes.push('Récolte adverse : +2 au prochain tour.');
        }
    }
    if (pCard.family === 'village' && D.pHand.length) {
        D.pEntraide = (D.pEntraide || 0) + 2;
        notes.push('Entraide : +1 sur tes 2 prochaines cartes !');
    }
    if (oCard.family === 'village' && D.oHand.length) {
        D.oEntraide = (D.oEntraide || 0) + 2;
    }

    D.history = [...(D.history || []), outcome];
    D.last = {
        round: D.round + 1,
        stat: TCG_STATS[statIdx],
        pts,
        pId,
        oId,
        pVal: pEval.total,
        oVal: oEval.total,
        pTags: pEval.tags,
        oTags: oEval.tags,
        notes,
        outcome,
    };
    D.round++;

    // Règle Tournoi Vagabond : changer le terrain à chaque manche
    if (D.randomTerrain && D.round < 5 && D.pHand.length) {
        const fams = Object.keys(TCG_FAMILIES).filter(f => f !== D.terrain);
        if (fams.length) {
            D.terrain = fams[Math.floor(Math.random() * fams.length)];
            D.terrainName = `Terrain : ${TCG_FAMILIES[D.terrain].name}`;
        }
    }

    sfx(outcome === 'win' ? 'harvest' : outcome === 'lose' ? 'error' : 'click');

    if (D.round >= 5 || !D.pHand.length) {
        D.done = true;
        if (D.tourney) {
            const box = tourneyBox(T);
            if (D.pScore > D.oScore) {
                D.result = 'win';
                T.wins++;
                const nextStage = Math.min(3, (D.tourney.stage || 0) + 1);
                box.stage = nextStage;
                if (nextStage >= 3) {
                    box.wonToday = true;
                    T.cups = (T.cups || 0) + 1;
                    D.gainTokens = 120;
                    T.tokens += 120;
                    T.freeGoldPacks = (T.freeGoldPacks || 0) + 1;
                    D.tourneyChamp = true;
                } else {
                    D.gainTokens = 35 + nextStage * 15;
                    T.tokens += D.gainTokens;
                    D.tourneyNext = nextStage;
                }
                sfx('level');
            } else {
                D.result = D.pScore === D.oScore ? 'draw' : 'lose';
                if (D.result === 'lose') T.losses++;
                box.stage = 0;
                D.tourneyOut = true;
                D.gainTokens = D.result === 'draw' ? 20 : 10;
                T.tokens += D.gainTokens;
                sfx(D.result === 'draw' ? 'pop' : 'error');
            }
            return true;
        }

        const box = dailyWinsBox(T);
        const alreadyToday = box.ids.includes(D.oppId);
        if (D.pScore > D.oScore) {
            D.result = 'win';
            T.wins++;
            const first = !T.beaten[D.oppId];
            T.beaten[D.oppId] = (T.beaten[D.oppId] || 0) + 1;
            if (!alreadyToday) {
                box.ids.push(D.oppId);
                D.gainTokens = D.reward;
                D.training = false;
            } else {
                D.gainTokens = 5;
                D.training = true;
            }
            T.tokens += D.gainTokens;
            if (first) {
                D.firstWinPack = true;
                T.freePacks++;
            }
            sfx('level');
        } else if (D.pScore === D.oScore) {
            D.result = 'draw';
            D.training = alreadyToday;
            D.gainTokens = alreadyToday ? 3 : Math.round(D.reward * 0.5);
            T.tokens += D.gainTokens;
            sfx('pop');
        } else {
            D.result = 'lose';
            T.losses++;
            D.training = alreadyToday;
            D.gainTokens = alreadyToday ? 2 : 10;
            T.tokens += D.gainTokens;
        }
    }
    return true;
}

export function tcgEndDuel() {
    const T = ensureTcg();
    T.duel = null;
    return true;
}
