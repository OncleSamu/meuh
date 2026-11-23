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
    return T;
}

// ---- Compteurs & pastille Menu ----
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
    b += tcgClaimableMilestones().length;
    return b;
};
export const tcgSub = () => {
    const n = tcgOwnedCount();
    return n ? `${n}/${TCG_CARDS.length} cartes` : 'Boosters & Duels';
};

// ---- Booster gratuit quotidien ----
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

    // Si le deck n'a pas encore 5 cartes, le compléter automatiquement avec les cartes obtenues
    if (T.deck.length < 5) {
        for (const x of cards) {
            if (T.deck.length >= 5) break;
            if (!T.deck.includes(x.id)) T.deck.push(x.id);
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
    toast(`${count} doublon${count > 1 ? 's' : ''} recyclé${count > 1 ? 's' : ''} → +${dust} ✨ poussière dorée`, ['ui', 'meuhcg']);
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
    if (T.deck.length < 5 && !T.deck.includes(id)) T.deck.push(id);
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
    toast(`Palier « ${m.name} » : +${m.tokens} 🎟️ et +${m.packs} booster${m.packs > 1 ? 's' : ''} !`, ['ui', 'meuhcg']);
    return true;
}

// ---- Deck (5 cartes) & Carte favorite ----
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
    T.deck.push(id);
    sfx('pop');
    return true;
}

export function tcgAutoDeck() {
    const T = ensureTcg();
    const owned = TCG_CARDS.filter(c => (T.cards[c.id] || 0) > 0);
    if (!owned.length) return false;
    owned.sort((a, b) => b.stats[0] + b.stats[1] + b.stats[2] - (a.stats[0] + a.stats[1] + a.stats[2]));
    T.deck = owned.slice(0, 5).map(c => c.id);
    sfx('pop');
    return true;
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

// ---- Moteur de Duel (5 manches tactiques) ----
const cardPower = (cardId, statIdx, synSet) => {
    const c = TCG_CARD_BY_ID[cardId];
    if (!c) return 0;
    return c.stats[statIdx] + (synSet.has(c.family) ? 2 : 0);
};

export function tcgStartDuel(oppId) {
    const T = ensureTcg();
    if (T.deck.length < 5) {
        tcgAutoDeck();
        if (T.deck.length < 5) {
            toast('Ouvre un booster pour obtenir 5 cartes avant de lancer un duel !', ['ui', 'meuhcg']);
            return false;
        }
    }
    const opp = tcgOpponents().find(o => o.id === oppId);
    if (!opp) return false;
    const rounds = Array.from({ length: 5 }, (_, i) => (i + Math.floor(Math.random() * 3)) % 3);
    // Mélanger un peu la main adverse
    const oppHand = [...opp.deck].sort(() => Math.random() - 0.5);
    T.duel = {
        oppId: opp.id,
        oppName: opp.name,
        oppRole: opp.role,
        oppArt: opp.art,
        oppDiff: opp.diff,
        oppDiffLabel: opp.diffLabel,
        reward: opp.reward,
        quote: opp.quote,
        winQuote: opp.winQuote,
        loseQuote: opp.loseQuote,
        rounds, // indices de stat (0 Terroir, 1 Saveur, 2 Prestige) pour les 5 manches
        round: 0,
        pHand: [...T.deck],
        oHand: oppHand,
        pSyn: [...tcgDeckSynergies(T.deck)],
        oSyn: [...tcgDeckSynergies(oppHand)],
        pScore: 0,
        oScore: 0,
        last: null, // résultat de la manche précédente
        done: false,
        result: null, // 'win' | 'draw' | 'lose'
        gainTokens: 0,
        firstWinPack: false,
    };
    sfx('pop');
    return true;
}

export function tcgPlayDuelCard(handIdx) {
    const T = ensureTcg();
    const D = T.duel;
    if (!D || D.done || !D.pHand[handIdx]) return false;

    const statIdx = D.rounds[D.round];
    const pId = D.pHand.splice(handIdx, 1)[0];
    const pSyn = new Set(D.pSyn);
    const oSyn = new Set(D.oSyn);

    // Choix IA selon la difficulté : Facile = aléatoire, Moyen = 50 % malin, Difficile/Maître = joue sa meilleure carte sur le critère
    let oPick = 0;
    if (D.oppDiff >= 3 || (D.oppDiff === 2 && Math.random() < 0.55)) {
        let best = -1;
        D.oHand.forEach((cid, i) => {
            const pw = cardPower(cid, statIdx, oSyn);
            if (pw > best) {
                best = pw;
                oPick = i;
            }
        });
    } else {
        oPick = Math.floor(Math.random() * D.oHand.length);
    }
    const oId = D.oHand.splice(oPick, 1)[0];

    const pVal = cardPower(pId, statIdx, pSyn);
    const oVal = cardPower(oId, statIdx, oSyn);
    let outcome = 'draw';
    if (pVal > oVal) {
        D.pScore++;
        outcome = 'win';
    } else if (oVal > pVal) {
        D.oScore++;
        outcome = 'lose';
    }

    D.last = {
        round: D.round + 1,
        stat: TCG_STATS[statIdx],
        pId,
        oId,
        pVal,
        oVal,
        pSynBonus: pSyn.has(TCG_CARD_BY_ID[pId].family),
        oSynBonus: oSyn.has(TCG_CARD_BY_ID[oId].family),
        outcome,
    };
    D.round++;
    sfx(outcome === 'win' ? 'harvest' : outcome === 'lose' ? 'error' : 'click');

    if (D.round >= 5 || !D.pHand.length) {
        D.done = true;
        if (D.pScore > D.oScore) {
            D.result = 'win';
            T.wins++;
            const first = !T.beaten[D.oppId];
            T.beaten[D.oppId] = (T.beaten[D.oppId] || 0) + 1;
            D.gainTokens = D.reward;
            T.tokens += D.gainTokens;
            if (first) {
                D.firstWinPack = true;
                T.freePacks++;
            }
            sfx('level');
        } else if (D.pScore === D.oScore) {
            D.result = 'draw';
            D.gainTokens = Math.round(D.reward * 0.5);
            T.tokens += D.gainTokens;
            sfx('pop');
        } else {
            D.result = 'lose';
            T.losses++;
            D.gainTokens = 10;
            T.tokens += 10;
        }
    }
    return true;
}

export function tcgEndDuel() {
    const T = ensureTcg();
    T.duel = null;
    return true;
}
