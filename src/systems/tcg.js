// 1.155 : Moteur du MeuhCG — 100 % isolé dans state.tcg (aucun lien économique avec la ferme).
// Boosters, classeur, forge anti-doublons, paliers et duels contre les villageois, campeurs et la famille.
import { state } from '../core/state.js';
import { toast, sfx } from '../core/bus.js';
import { randomId } from '../art/habitants.js';
import { vName, artId, stageOf } from './family.js';
import { guestTitle } from './camping.js';
import {
    TCG_CARD_BY_ID,
    TCG_CARDS,
    TCG_DECK_BUDGET,
    TCG_MILESTONES,
    TCG_RARITIES,
    TCG_RARITY_ORDER,
    TCG_SERIES,
    TCG_STATS,
    TCG_VILLAGER_DUELS,
} from '../data/tcg.js';

export function ensureTcg() {
    if (!state.tcg || typeof state.tcg !== 'object') {
        state.tcg = {
            tokens: 120,
            dust: 0,
            freePacks: 2,
            dailyDay: 0,
            dailyWins: { day: state.day || 1, ids: [], claimed: false },
            cards: {}, // { cardId: count }
            deck: [], // jusqu'à 5 ids de cartes
            fav: null,
            pity: 0,
            opened: 0,
            wins: 0,
            losses: 0,
            beaten: {}, // { opponentId: count }
            milestones: {}, // { milestoneId: true }
            lastPack: null, // { seriesId, cards: [{ id, isNew }], torn, revealed: [bool...] }
            duel: null,
        };
    }
    const T = state.tcg;
    if (!Number.isFinite(T.tokens)) T.tokens = 120;
    if (!Number.isFinite(T.dust)) T.dust = 0;
    if (!Number.isFinite(T.freePacks)) T.freePacks = 0;
    T.cards = T.cards || {};
    T.deck = Array.isArray(T.deck) ? T.deck.filter(id => TCG_CARD_BY_ID[id] && (T.cards[id] || 0) > 0).slice(0, 5) : [];
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
    if (!s.allSeries && T.freePacks > 0) return true;
    return T.tokens >= s.cost;
}

export function tcgOpenPack(seriesId) {
    const T = ensureTcg();
    const s = TCG_SERIES[seriesId];
    if (!s || !tcgCanOpenPack(seriesId)) return null;
    const usedFree = !s.allSeries && T.freePacks > 0;
    if (usedFree) T.freePacks--;
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

    // 5 cartes : 3 normales, 1 Peu commune+, 1 Rare+ (ou Foil+ sur Doré, ou Légendaire+ au 10e booster !)
    drawn.push(drawOne('C'));
    drawn.push(drawOne('C'));
    drawn.push(drawOne('C'));
    drawn.push(drawOne('U'));
    const topMin = T.pity >= 9 ? 'L' : s.minTop || 'R';
    drawn.push(drawOne(topMin));

    const hasBig = drawn.some(c => c.rarity === 'L' || c.rarity === 'S');
    T.pity = hasBig ? 0 : T.pity + 1;
    T.opened++;

    const cards = drawn.map(c => {
        const isNew = !(T.cards[c.id] > 0);
        T.cards[c.id] = (T.cards[c.id] || 0) + 1;
        return { id: c.id, isNew };
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
    const c = TCG_CARD_BY_ID[p.cards[idx].id];
    sfx(c && (c.rarity === 'L' || c.rarity === 'S') ? 'level' : c && (c.rarity === 'R' || c.rarity === 'F') ? 'sell' : 'click');
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
        return r === 'L' || r === 'S';
    });
    sfx(big ? 'level' : 'harvest');
    return true;
}

export function tcgClosePack() {
    const T = ensureTcg();
    T.lastPack = null;
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

// ---- Deck (5 cartes, budget 16 étoiles) & Carte favorite ----
export const tcgCardCost = id => TCG_RARITIES[TCG_CARD_BY_ID[id]?.rarity]?.cost || 1;
export const tcgDeckCost = (deckIds = ensureTcg().deck) => deckIds.reduce((s, id) => s + tcgCardCost(id), 0);
export const tcgDeckValid = (deckIds = ensureTcg().deck) => deckIds.length === 5 && tcgDeckCost(deckIds) <= TCG_DECK_BUDGET;

export function tcgToggleDeck(id) {
    const T = ensureTcg();
    if (!TCG_CARD_BY_ID[id] || !(T.cards[id] > 0)) return false;
    const idx = T.deck.indexOf(id);
    if (idx >= 0) {
        T.deck.splice(idx, 1);
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
    sfx('pop');
    return true;
}

export function tcgAutoDeck() {
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
            const total = sum + synBonus;
            if (total > bestScore) {
                bestScore = total;
                bestDeck = cur.map(c => c.id);
            }
            return;
        }
        if (cost + rem > TCG_DECK_BUDGET) return;
        for (let i = start; i <= pool.length - rem; i++) {
            const c = pool[i];
            const cc = tcgCardCost(c.id);
            if (cost + cc + (rem - 1) > TCG_DECK_BUDGET) continue;
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
            if (pick.length < 5 && cost + cc <= TCG_DECK_BUDGET) {
                pick.push(c.id);
                cost += cc;
            }
        }
        T.deck = pick;
    }
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

// ---- Moteur de Duel 2.1 (pouvoirs rééquilibrés, terrain, Coup spécial Boss +2 & anti-spam quotidien) ----
function evalCard(cardId, statIdx, { synSet, terrain, otherHand, nextBonus, entraide, masterBoost, oppIsHorizons }) {
    const c = TCG_CARD_BY_ID[cardId];
    if (!c) return { total: 0, tags: [] };
    let total = c.stats[statIdx];
    const tags = [];
    if (synSet.has(c.family)) {
        if (oppIsHorizons) {
            tags.push('Synergie annulée (Aventure)');
        } else {
            total += 2;
            tags.push('+2 synergie');
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

export function tcgCardPreviewPower(D, cardId) {
    if (!D || D.done) return 0;
    const statIdx = D.rounds[D.round];
    const others = D.pHand.filter(id => id !== cardId);
    return evalCard(cardId, statIdx, {
        synSet: new Set(D.pSyn || []),
        terrain: D.terrain,
        otherHand: others,
        nextBonus: D.pNextBonus || 0,
        entraide: (D.pEntraide || 0) > 0,
        masterBoost: D.boostArmed ? 3 : 0,
        oppIsHorizons: false,
    }).total;
}

export function tcgStartDuel(oppId) {
    const T = ensureTcg();
    if (T.deck.length < 5) {
        tcgAutoDeck();
        if (T.deck.length < 5) {
            toast('Ouvre un booster pour obtenir 5 cartes avant de lancer un duel !', ['ui', 'meuhcg']);
            return false;
        }
    }
    if (tcgDeckCost(T.deck) > TCG_DECK_BUDGET) {
        toast(`Ton deck dépasse le budget de ${TCG_DECK_BUDGET} étoiles : ajuste-le dans Mon Deck ou clique sur Auto !`, ['ui', 'meuhcg']);
        return false;
    }
    const opp = tcgOpponents().find(o => o.id === oppId);
    if (!opp) return false;
    // 5 manches variées couvrant toujours les 3 critères au moins une fois
    const base = [0, 1, 2, Math.floor(Math.random() * 3), Math.floor(Math.random() * 3)];
    const rounds = base.sort(() => Math.random() - 0.5);
    const oppHand = [...opp.deck].sort(() => Math.random() - 0.5);
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
        history: [], // 'win' | 'lose' | 'draw'
        round: 0,
        pHand: [...T.deck],
        oHand: oppHand,
        pSyn: [...tcgDeckSynergies(T.deck)],
        oSyn: [...tcgDeckSynergies(oppHand)],
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

    // Choix IA selon difficulté (tient compte du terrain, synergie et pouvoirs)
    let oPick = 0;
    if (D.oppDiff >= 3 || (D.oppDiff === 2 && Math.random() < 0.6)) {
        let best = -1;
        D.oHand.forEach((cid, i) => {
            const others = D.oHand.filter((_, j) => j !== i);
            const ev = evalCard(cid, statIdx, {
                synSet: oSyn,
                terrain: D.terrain,
                otherHand: others,
                nextBonus: D.oNextBonus || 0,
                entraide: (D.oEntraide || 0) > 0,
                masterBoost: 0,
                oppIsHorizons: false,
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
    const oBossBoost = !!(D.oHasBoost && !D.oUsedBoost && D.round >= 1 && D.round <= 3 && (D.oScore <= D.pScore || D.round === 3));
    if (oBossBoost) D.oUsedBoost = true;

    const pEval = evalCard(pId, statIdx, {
        synSet: pSyn,
        terrain: D.terrain,
        otherHand: D.pHand,
        nextBonus: D.pNextBonus || 0,
        entraide: (D.pEntraide || 0) > 0,
        masterBoost: D.boostArmed ? 3 : 0,
        oppIsHorizons: oCard.family === 'horizons',
    });
    const oEval = evalCard(oId, statIdx, {
        synSet: oSyn,
        terrain: D.terrain,
        otherHand: D.oHand,
        nextBonus: D.oNextBonus || 0,
        entraide: (D.oEntraide || 0) > 0,
        masterBoost: oBossBoost ? 2 : 0,
        oppIsHorizons: pCard.family === 'horizons',
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

    // Effets après manche : Récolte (Potager) & Entraide (Village : +1 sur les 2 prochaines cartes)
    if (outcome === 'win') {
        D.pScore++;
        if (pCard.family === 'potager') {
            D.pNextBonus = 2;
            notes.push('Récolte : +2 sur ta prochaine carte !');
        }
    } else if (outcome === 'lose') {
        D.oScore++;
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
    sfx(outcome === 'win' ? 'harvest' : outcome === 'lose' ? 'error' : 'click');

    if (D.round >= 5 || !D.pHand.length) {
        D.done = true;
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
