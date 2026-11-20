// 1.150 : Système complet de La Grande Table Étoilée (Village › Table).
// Services en salle, calcul d'harmonie gastronomique (terroir, saison, accord boisson/Cave/Brasserie, fraîcheur),
// brigade (villageois & enfants adultes), parfum d'ambiance (Parfumerie), cadeau VIP (Maison), critiques anonymes et 3 Étoiles.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { fmt, pickRand } from '../core/format.js';
import { toast, sfx, buzz, burst, changed } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { RECIPES } from '../data/machines.js';
import { QX } from '../data/farm.js';
import { VILLAGERS } from '../data/village.js';
import {
    GTABLE_LVL,
    GTABLE_HALLS,
    GTABLE_COOLDOWN_MS,
    GTABLE_RANKS,
    GTABLE_STYLES,
    GTABLE_THEMES,
    GTABLE_THEME_IDS,
    MAIN_MACHINES,
    SIDE_MACHINES,
    DRINK_MACHINES,
    GTABLE_CRITICS,
    GTABLE_ROLES,
    BRIGADE_TRAITS,
    GTABLE_BANQUETS,
    GTABLE_SYNERGY,
    newGTable,
} from '../data/gtable.js';
import { earn, addXp } from './player.js';
import { addRenom } from './renom.js';
import { season } from './world.js';
import { hasCost, payCost, presentVillagers } from './home.js';
import { addFriendship, heartsOf } from './village.js';
import { clampQuality, qual } from './farm.js';
import { islandOpen } from './island.js';
import { oasisOpen } from './oasis.js';
import { nordOpen } from './nord.js';
import { beerOf, beerValue } from './brewery.js';
import { lotName, lotValue, caveOpen } from './cave.js';
import { perfumeOpen, perfumeOf, perfumeSignature, perfumeStock } from './perfume.js';
import { kids, stageOf } from './family.js';
import { record } from './book.js';
import { addPhoto } from './style.js';

const QK = [null, 's', 'g', 'p', 'd'];

export function ensureGTable() {
    if (!state.gtable) state.gtable = newGTable();
    const g = state.gtable;
    if (!g.dishes) g.dishes = {};
    if (!Array.isArray(g.recent)) g.recent = [];
    if (!g.brigade) g.brigade = { chef: null, sommelier: null, maitre: null };
    if (!Array.isArray(g.reviews)) g.reviews = [];
    if (!g.banquetDone) g.banquetDone = {};
    return g;
}

export const gtableOpen = () => state.level >= GTABLE_LVL;
export const gtableBuilt = () => gtableOpen() && !!(state.gtable && state.gtable.built);
export const gtableRank = () => (state.gtable ? state.gtable.rank || 0 : 0);
export const gtableRankDef = (r = gtableRank()) => GTABLE_RANKS[Math.min(GTABLE_RANKS.length - 1, Math.max(0, r))] || GTABLE_RANKS[0];
export const gtableHallDef = (h = (state.gtable && state.gtable.hall) || 0) => GTABLE_HALLS[Math.min(GTABLE_HALLS.length - 1, Math.max(0, h))] || GTABLE_HALLS[0];
export const gtableStyleDef = () => GTABLE_STYLES.find(s => s.id === (state.gtable && state.gtable.style)) || GTABLE_STYLES[0];
export const gtableDishCount = () => (state.gtable && state.gtable.dishes ? Object.keys(state.gtable.dishes).length : 0);

// ---------------- fondation & agrandissement ----------------
export function canBuildGTable() {
    if (!gtableOpen() || gtableBuilt()) return false;
    return hasCost(GTABLE_HALLS[0].cost);
}

export function buildGTable(at) {
    if (!canBuildGTable()) return false;
    payCost(GTABLE_HALLS[0].cost);
    const g = ensureGTable();
    g.built = true;
    g.hall = 0;
    g.nextAt = 0;
    sfx('level');
    buzz(20);
    burst(at, 'sparkle', 16);
    addPhoto('ui', 'gtable', 'Ouverture de La Grande Table', 'Les premières nappes sont dressées !');
    toast('La Grande Table ouvre ses portes ! Dressez votre premier service.', ['ui', 'gtable']);
    changed('gtable');
    return true;
}

export function gtableNextHall() {
    if (!gtableBuilt()) return null;
    const next = (state.gtable.hall || 0) + 1;
    return GTABLE_HALLS[next] || null;
}

export function canUpgradeGTableHall() {
    const next = gtableNextHall();
    if (!next) return false;
    return gtableRank() >= next.reqRank && hasCost(next.cost);
}

export function upgradeGTableHall(at) {
    const next = gtableNextHall();
    if (!next || !canUpgradeGTableHall()) return false;
    payCost(next.cost);
    const g = ensureGTable();
    g.hall = next.lvl;
    sfx('level');
    buzz(16);
    burst(at, 'sparkle', 14);
    toast(`Salle agrandie : ${next.name} (${next.tables} tables) !`, ['ui', 'gtable']);
    changed('gtable');
    return true;
}

export function setGTableStyle(id) {
    if (!gtableBuilt()) return false;
    const st = GTABLE_STYLES.find(s => s.id === id);
    if (!st || gtableRank() < st.reqRank) return false;
    ensureGTable().style = st.id;
    sfx('pop');
    changed('gtable');
    return true;
}

// ---------------- classification automatique des plats, accompagnements & boissons ----------------
function recipeOfItem(id) {
    return RECIPES[id] || null;
}

export function itemThemes(id) {
    const it = ITEMS[id];
    const rec = recipeOfItem(id);
    const res = [];
    if (!it) return res;
    if (it.type === 'fish') res.push('mer');
    if (it.island) res.push('ile');
    if (it.oasis) res.push('oasis');
    if (it.nord) res.push('nord');
    if (rec && rec.machine) {
        for (const t of Object.values(GTABLE_THEMES)) {
            if (t.machines.includes(rec.machine) && !res.includes(t.id)) res.push(t.id);
        }
    }
    if (!res.length) res.push('terroir');
    return res;
}

export function isItemSeasonal(id) {
    const cur = season().id;
    const it = ITEMS[id];
    if (!it) return false;
    if (Array.isArray(it.season) && it.season.includes(cur)) return true;
    const rec = recipeOfItem(id);
    if (rec && rec.ing) {
        for (const k of Object.keys(rec.ing)) {
            const sub = ITEMS[k];
            if (sub && Array.isArray(sub.season) && sub.season.includes(cur)) return true;
        }
    }
    return false;
}

export function isMainDish(id) {
    const it = ITEMS[id];
    if (!it || !it.sell || it.box) return false;
    const rec = recipeOfItem(id);
    if (rec && MAIN_MACHINES.has(rec.machine)) return true;
    if (it.type === 'fish') return true;
    return false;
}

export function isSideDish(id) {
    const it = ITEMS[id];
    if (!it || !it.sell || it.box) return false;
    const rec = recipeOfItem(id);
    if (rec && SIDE_MACHINES.has(rec.machine)) return true;
    if (it.type === 'tree' || id === 'honey' || id === 'truffle') return true;
    return false;
}

export function isBarnDrink(id) {
    const it = ITEMS[id];
    if (!it || !it.sell || it.box) return false;
    const rec = recipeOfItem(id);
    return !!(rec && DRINK_MACHINES.has(rec.machine));
}

export function gtableMainChoices(themeId) {
    return Object.keys(state.inventory || {})
        .filter(id => (state.inventory[id] || 0) > 0 && isMainDish(id))
        .sort((a, b) => {
            const ma = themeId && itemThemes(a).includes(themeId) ? 1 : 0;
            const mb = themeId && itemThemes(b).includes(themeId) ? 1 : 0;
            if (mb !== ma) return mb - ma;
            const sa = isItemSeasonal(a) ? 1 : 0;
            const sb = isItemSeasonal(b) ? 1 : 0;
            if (sb !== sa) return sb - sa;
            return (ITEMS[b].sell || 0) - (ITEMS[a].sell || 0);
        });
}

export function gtableSideChoices(themeId, excludeId = null) {
    return Object.keys(state.inventory || {})
        .filter(id => id !== excludeId && (state.inventory[id] || 0) > 0 && isSideDish(id))
        .sort((a, b) => {
            const ma = themeId && itemThemes(a).includes(themeId) ? 1 : 0;
            const mb = themeId && itemThemes(b).includes(themeId) ? 1 : 0;
            if (mb !== ma) return mb - ma;
            return (ITEMS[b].sell || 0) - (ITEMS[a].sell || 0);
        });
}

// Boissons disponibles : Grange + Vraies bouteilles de la Cave + Vraies bières maison de la Brasserie !
export function gtableDrinkChoices() {
    const out = [];
    // 1. Bouteilles en réserve de la Cave (prestige maximal)
    if (caveOpen() && state.cave && Array.isArray(state.cave.reserve)) {
        for (const l of state.cave.reserve) {
            if (!l || l.bad || l.n <= 0) continue;
            const val = Math.round(lotValue(l) / Math.max(1, l.n));
            out.push({
                key: `cave:${l.uid}`,
                kind: 'cave',
                uid: l.uid,
                name: lotName(l),
                icon: l.id === 'beer' ? ['ui', 'beer'] : ['item', l.id],
                qty: l.n,
                val,
                bonus: 16 + Math.min(8, (l.rank || 0) * 2),
                tag: 'Cave',
            });
        }
    }
    // 2. Bières maison de la Brasserie
    if (state.brew && state.brew.stock) {
        for (const [bid, n] of Object.entries(state.brew.stock)) {
            if (!n || n <= 0) continue;
            const b = beerOf(bid);
            if (!b) continue;
            out.push({
                key: `brew:${bid}`,
                kind: 'brew',
                bid,
                name: b.name,
                icon: ['ui', 'beer'],
                qty: n,
                val: Math.round(beerValue(bid)),
                bonus: 15 + Math.min(6, (b.stars || 0) * 2),
                tag: 'Brasserie',
            });
        }
    }
    // 3. Boissons de la grange (Comptoir, pressoir, bar à jus, vins, rhums…)
    const barn = Object.keys(state.inventory || {})
        .filter(id => (state.inventory[id] || 0) > 0 && isBarnDrink(id))
        .sort((a, b) => (ITEMS[b].sell || 0) - (ITEMS[a].sell || 0));
    for (const id of barn) {
        const rec = recipeOfItem(id);
        out.push({
            key: `item:${id}`,
            kind: 'item',
            id,
            name: ITEMS[id].name,
            icon: ['item', id],
            qty: state.inventory[id],
            val: ITEMS[id].sell || 20,
            bonus: rec && (rec.machine === 'winery' || rec.machine === 'brewery' || rec.machine === 'rumDistillery') ? 13 : 10,
            tag: rec && rec.machine === 'counter' ? 'Comptoir' : 'Boisson',
        });
    }
    return out;
}

function bestQualityOf(id) {
    const q = state.quality && state.quality[id];
    if (!q) return 0;
    for (let r = 4; r >= 1; r--) {
        if ((q[QK[r]] || 0) > 0) return r;
    }
    return 0;
}

function consumeBarnItem(id) {
    if (!id || (state.inventory[id] || 0) <= 0) return { ok: false, q: 0, val: 0 };
    const r = bestQualityOf(id);
    if (r > 0) {
        const q = qual(id);
        q[QK[r]] = Math.max(0, (q[QK[r]] || 0) - 1);
    }
    state.inventory[id] -= 1;
    clampQuality();
    const base = (ITEMS[id] && ITEMS[id].sell) || 10;
    return { ok: true, q: r, val: Math.round(base * (QX[r] || 1)) };
}

function consumeDrink(drinkKey) {
    if (!drinkKey) return { ok: true, val: 0, bonus: 0, kind: null };
    const [kind, ref] = String(drinkKey).split(':');
    if (kind === 'cave' && state.cave && Array.isArray(state.cave.reserve)) {
        const idx = state.cave.reserve.findIndex(l => l && String(l.uid) === ref && l.n > 0);
        if (idx < 0) return { ok: false, val: 0, bonus: 0 };
        const l = state.cave.reserve[idx];
        const val = Math.round(lotValue(l) / Math.max(1, l.n));
        const bonus = 16 + Math.min(8, (l.rank || 0) * 2);
        l.n -= 1;
        if (l.n <= 0) state.cave.reserve.splice(idx, 1);
        return { ok: true, val, bonus, kind: 'cave', name: lotName(l) };
    }
    if (kind === 'brew' && state.brew && state.brew.stock && (state.brew.stock[ref] || 0) > 0) {
        const b = beerOf(ref);
        state.brew.stock[ref] -= 1;
        return { ok: true, val: Math.round(beerValue(ref)), bonus: 15 + Math.min(6, ((b && b.stars) || 0) * 2), kind: 'brew', name: (b && b.name) || 'Bière maison' };
    }
    if (kind === 'item') {
        const got = consumeBarnItem(ref);
        if (!got.ok) return { ok: false, val: 0, bonus: 0 };
        const rec = recipeOfItem(ref);
        const bonus = rec && (rec.machine === 'winery' || rec.machine === 'brewery' || rec.machine === 'rumDistillery') ? 13 : 10;
        return { ok: true, val: got.val, bonus, kind: 'item', name: ITEMS[ref].name };
    }
    return { ok: false, val: 0, bonus: 0 };
}

// ---------------- Brigade & Parfum d'ambiance (Synergies Famille, Villageois, Parfumerie) ----------------
export function gtableBrigadeCandidates(roleId) {
    const list = [];
    // Villageois présents à 3+ cœurs
    for (const vid of presentVillagers()) {
        const tr = BRIGADE_TRAITS[vid];
        if (!tr || tr.role !== roleId) continue;
        const h = heartsOf(vid);
        if (h >= 3) {
            list.push({
                key: `v:${vid}`,
                kind: 'villager',
                id: vid,
                name: VILLAGERS[vid].name,
                icon: ['villager', vid],
                desc: tr.text,
                score: tr.score,
                pay: tr.pay || 0,
            });
        }
    }
    // Enfants adultes de la Famille (polyvalents sur n'importe quel poste !)
    if (state.family && Array.isArray(state.family.kids)) {
        for (const k of kids()) {
            if (stageOf(k) >= 3) {
                list.push({
                    key: `k:${k.id}`,
                    kind: 'kid',
                    id: k.id,
                    name: k.name,
                    icon: ['ui', 'fmHome'],
                    desc: `+${GTABLE_SYNERGY.kidScore} pts & +${Math.round(GTABLE_SYNERGY.kidPay * 100)} % pourboires (fierté familiale)`,
                    score: GTABLE_SYNERGY.kidScore,
                    pay: GTABLE_SYNERGY.kidPay,
                });
            }
        }
    }
    return list;
}

export function setGTableBrigade(roleId, memberKey) {
    if (!gtableBuilt()) return false;
    const rDef = GTABLE_ROLES.find(r => r.id === roleId);
    if (!rDef || gtableRankDef().brigade < rDef.reqBrigade) return false;
    const g = ensureGTable();
    if (!memberKey) {
        g.brigade[roleId] = null;
        sfx('pop');
        changed('gtable');
        return true;
    }
    const ok = gtableBrigadeCandidates(roleId).some(c => c.key === memberKey);
    if (!ok) return false;
    // Un même membre ne peut pas occuper deux postes à la fois
    for (const k of Object.keys(g.brigade)) {
        if (g.brigade[k] === memberKey) g.brigade[k] = null;
    }
    g.brigade[roleId] = memberKey;
    sfx('pop');
    changed('gtable');
    return true;
}

function brigadeFx(themeId, hasDrink, isSeasonal) {
    const g = ensureGTable();
    let score = 0;
    let pay = 0;
    let fast = 0;
    const maxSlots = gtableRankDef().brigade;
    GTABLE_ROLES.forEach(r => {
        if (r.reqBrigade > maxSlots) return;
        const m = g.brigade[r.id];
        if (!m) return;
        if (m.startsWith('k:')) {
            score += GTABLE_SYNERGY.kidScore;
            pay += GTABLE_SYNERGY.kidPay;
        } else if (m.startsWith('v:')) {
            const tr = BRIGADE_TRAITS[m.slice(2)];
            if (!tr) return;
            score += tr.score || 0;
            pay += tr.pay || 0;
            fast += tr.fast || 0;
            if (tr.theme && tr.theme === themeId) score += tr.themeBonus || 0;
            if (tr.drinkBonus && hasDrink) score += tr.drinkBonus;
            if (tr.seasonBonus && isSeasonal) score += tr.seasonBonus;
        }
    });
    return { score, pay, fast: Math.min(0.45, fast) };
}

export function setGTableScent(pid, at) {
    if (!gtableBuilt() || !perfumeOpen()) return false;
    const g = ensureGTable();
    if (!pid) {
        g.scent = null;
        sfx('pop');
        changed('gtable');
        return true;
    }
    const pf = perfumeOf(pid);
    if (!pf) return false;
    const sig = perfumeSignature();
    const isSig = !!(sig && sig.id === pid);
    if (!isSig) {
        if (perfumeStock(pid) < 1) {
            toast('Aucun flacon de ce parfum en stock', ['ui', 'perfume']);
            return false;
        }
        state.perfume.stock[pid] -= 1;
    }
    g.scent = { pid, left: isSig ? 99 : GTABLE_SYNERGY.perfumeUses, sig: isSig, stars: pf.stars || 1, name: pf.name };
    sfx('pop');
    burst(at, 'sparkle', 8);
    toast(isSig ? `Parfum signature « ${pf.name} » diffusé en salle !` : `« ${pf.name} » parfume la salle (${GTABLE_SYNERGY.perfumeUses} services)`, ['ui', 'perfume']);
    changed('gtable');
    return true;
}

export function gtableScentBonus() {
    const g = state.gtable;
    if (!g || !g.scent) return 0;
    if (g.scent.sig) return GTABLE_SYNERGY.perfumeAmbience + (g.scent.stars >= 3 ? GTABLE_SYNERGY.perfumeSigBonus : 1);
    return g.scent.left > 0 ? GTABLE_SYNERGY.perfumeAmbience : 0;
}

// ---------------- calcul d'harmonie gastronomique (en direct avant de servir ET au service) ----------------
export function evaluateGTablePlate({ themeId, mainId, sideId = null, drinkKey = null, vipBoxIdx = -1 }) {
    const g = ensureGTable();
    const tags = [];
    if (!mainId || !ITEMS[mainId]) return { score: 0, pay: 0, xp: 0, tags };

    let score = 40; // socle honnête d'un bon plat maison
    const mainThemes = itemThemes(mainId);
    const sideThemes = sideId ? itemThemes(sideId) : [];

    // 1. Accord Terroir (l'envie du convive)
    if (themeId && mainThemes.includes(themeId)) {
        score += 20;
        tags.push({ label: 'Accord Terroir +20', ok: true });
    } else if (themeId && sideThemes.includes(themeId)) {
        score += 10;
        tags.push({ label: 'Touche Terroir +10', ok: true });
    } else if (themeId) {
        tags.push({ label: 'Hors envie du soir', ok: false });
    }

    // 2. Accompagnement / Dessert
    if (sideId && ITEMS[sideId]) {
        score += 9;
        tags.push({ label: 'Menu complet +9', ok: true });
    }

    // 3. Fraîcheur de saison
    const seasonal = isItemSeasonal(mainId) || (sideId && isItemSeasonal(sideId));
    if (seasonal) {
        score += 11;
        tags.push({ label: 'De saison +11', ok: true });
    }

    // 4. Accord Boisson (Cave / Brasserie / Comptoir)
    let drinkVal = 0;
    if (drinkKey) {
        const d = gtableDrinkChoices().find(x => x.key === drinkKey);
        if (d) {
            score += d.bonus;
            drinkVal = d.val;
            tags.push({ label: `Accord ${d.tag} +${d.bonus}`, ok: true });
        }
    }

    // 5. Qualité des produits
    const qMain = bestQualityOf(mainId);
    const qSide = sideId ? bestQualityOf(sideId) : 0;
    const qPts = qMain * 3 + qSide * 2;
    if (qPts > 0) {
        score += qPts;
        tags.push({ label: `Qualité +${qPts}`, ok: true });
    }

    // 6. Fraîcheur de la carte (anti-répétition : varier les plats est récompensé !)
    const rep = g.recent.filter(x => x === mainId).length;
    if (rep >= 2) {
        const pen = Math.min(18, (rep - 1) * 9);
        score -= pen;
        tags.push({ label: `Déjà vu −${pen}`, ok: false });
    } else if (!g.dishes[mainId]) {
        score += 6;
        tags.push({ label: 'Nouveauté carte +6', ok: true });
    }

    // 7. Ambiance de la salle + Parfum d'ambiance + Brigade
    const styleB = gtableStyleDef().bonus;
    const scentB = gtableScentBonus();
    const brig = brigadeFx(themeId, !!drinkKey, seasonal);
    const ambPts = styleB + scentB + brig.score;
    if (ambPts > 0) {
        score += Math.round(ambPts * 0.65);
        tags.push({ label: `Salle & Brigade +${Math.round(ambPts * 0.65)}`, ok: true });
    }

    // 8. Synergie La Maison : coffret cadeau VIP posé sur la table !
    const hasVip = vipBoxIdx >= 0 && state.maison && state.maison.stock && !!state.maison.stock[vipBoxIdx];
    let vipVal = 0;
    if (hasVip) {
        const box = state.maison.stock[vipBoxIdx];
        vipVal = Math.round((box.val || 200) * 1.15);
        score += GTABLE_SYNERGY.maisonVipScore;
        tags.push({ label: `Cadeau Maison +${GTABLE_SYNERGY.maisonVipScore}`, ok: true });
    }

    score = Math.max(25, Math.min(100, Math.round(score)));

    // Paiement généreux selon la valeur réelle des produits, la note et les Étoiles
    const mainVal = Math.round(((ITEMS[mainId] && ITEMS[mainId].sell) || 20) * (QX[qMain] || 1));
    const sideVal = sideId && ITEMS[sideId] ? Math.round((ITEMS[sideId].sell || 15) * (QX[qSide] || 1)) : 0;
    const baseVal = mainVal + sideVal + drinkVal + vipVal;
    const rankMult = gtableRankDef().mult;
    const scoreMult = 0.72 + (score / 100) * 0.68; // 0.89 à 1.40
    const pay = Math.max(80, Math.round(baseVal * rankMult * scoreMult * (1 + brig.pay + (hasVip ? GTABLE_SYNERGY.maisonVipPay : 0))));
    const xp = Math.max(40, Math.round(90 + score * 2.4 + gtableRank() * 90));

    return { score, pay, xp, tags };
}

// ---------------- cycle d'un Service en salle ----------------
function openThemeIds() {
    return GTABLE_THEME_IDS.filter(id => {
        const t = GTABLE_THEMES[id];
        if (!t.land) return true;
        if (t.land === 'island') return islandOpen();
        if (t.land === 'oasis') return oasisOpen();
        if (t.land === 'nord') return nordOpen();
        return true;
    });
}

export function gtableCooldownLeft() {
    if (!gtableBuilt()) return 0;
    const g = ensureGTable();
    if (g.service) return 0;
    return Math.max(0, (g.nextAt || 0) - now());
}

export function gtableReadyToOpen() {
    return gtableBuilt() && !state.gtable.service && gtableCooldownLeft() === 0;
}

export function gtableTablesWaiting() {
    if (!gtableBuilt() || !state.gtable.service) return 0;
    return state.gtable.service.tables.filter(t => !t.served).length;
}

export function openGTableService(at) {
    if (!gtableReadyToOpen()) return false;
    const g = ensureGTable();
    const nTables = gtableHallDef().tables;
    const themes = openThemeIds();
    const vils = presentVillagers();
    const usedVils = new Set();

    // Un Critique anonyme du Guide se glisse régulièrement dans le service (garanti au 1er service puis 1 service sur 2)
    const hasCritic = g.services === 0 || g.services % 2 === 1 || Math.random() < 0.55;
    const criticSlot = hasCritic ? Math.floor(Math.random() * nTables) : -1;
    const critic = hasCritic ? GTABLE_CRITICS[(g.services + g.criticsWon) % GTABLE_CRITICS.length] : null;

    const tables = [];
    for (let i = 0; i < nTables; i++) {
        const themeId = themes[(i + Math.floor(Math.random() * themes.length)) % themes.length];
        const theme = GTABLE_THEMES[themeId];
        if (i === criticSlot && critic) {
            tables.push({
                i,
                who: critic.avatar,
                name: 'Client discret',
                title: 'Table réservée',
                themeId,
                want: `${pickRand(theme.wants)} — ${critic.clue}`,
                isCritic: true,
                criticId: critic.id,
                served: false,
                result: null,
            });
        } else {
            const pool = vils.filter(v => !usedVils.has(v));
            const vid = pool.length ? pickRand(pool) : pickRand(vils);
            usedVils.add(vid);
            const v = VILLAGERS[vid] || { name: 'Convive' };
            tables.push({
                i,
                who: vid,
                name: v.name,
                title: 'Habitant de la vallée',
                themeId,
                want: pickRand(theme.wants),
                isCritic: false,
                served: false,
                result: null,
            });
        }
    }

    g.service = {
        startedAt: now(),
        tables,
        served: 0,
        scoreSum: 0,
        earned: 0,
        criticScore: null,
        criticId: critic ? critic.id : null,
        criticMenu: null,
    };
    g.lastReport = null;
    sfx('pop');
    burst(at, 'sparkle', 10);
    toast(`Service ouvert : ${nTables} tables vous attendent en salle !`, ['ui', 'gtable']);
    changed('gtable');
    return true;
}

export function serveGTable(tableIdx, { mainId, sideId = null, drinkKey = null, vipBoxIdx = -1 }, at) {
    if (!gtableBuilt() || !state.gtable.service) return false;
    const g = ensureGTable();
    const tbl = g.service.tables[tableIdx];
    if (!tbl || tbl.served) return false;
    if (!mainId || (state.inventory[mainId] || 0) <= 0) {
        toast('Choisissez un plat disponible dans votre grange', ['ui', 'gtable']);
        return false;
    }

    const preview = evaluateGTablePlate({ themeId: tbl.themeId, mainId, sideId, drinkKey, vipBoxIdx });

    // Consommation réelle des stocks
    const mainCons = consumeBarnItem(mainId);
    if (!mainCons.ok) return false;
    if (sideId) consumeBarnItem(sideId);
    const drinkCons = drinkKey ? consumeDrink(drinkKey) : { ok: true };
    if (drinkKey && !drinkCons.ok) return false;
    if (vipBoxIdx >= 0 && state.maison && state.maison.stock && state.maison.stock[vipBoxIdx]) {
        state.maison.stock.splice(vipBoxIdx, 1);
    }

    // Gains & statistiques
    earn(preview.pay, at);
    state.income.gtable = (state.income.gtable || 0) + preview.pay;
    addXp(preview.xp, at);
    state.stats.gtableCovers = (state.stats.gtableCovers || 0) + 1;
    if (!tbl.isCritic && VILLAGERS[tbl.who]) {
        addFriendship(tbl.who, preview.score >= 85 ? 4 : preview.score >= 70 ? 3 : 2, at);
    }

    // Palmarès & anti-répétition
    const prev = g.dishes[mainId] || { n: 0, best: 0 };
    g.dishes[mainId] = { n: prev.n + 1, best: Math.max(prev.best, preview.score) };
    g.recent.unshift(mainId);
    if (g.recent.length > 8) g.recent.length = 8;

    tbl.served = true;
    tbl.result = {
        mainId,
        sideId,
        drinkName: drinkCons.name || null,
        vip: vipBoxIdx >= 0,
        score: preview.score,
        pay: preview.pay,
    };

    g.service.served += 1;
    g.service.scoreSum += preview.score;
    g.service.earned += preview.pay;
    g.covers += 1;
    g.totalScore += preview.score;
    if (preview.score > g.bestScore) {
        g.bestScore = preview.score;
        record('gtableScore', preview.score);
    }

    if (tbl.isCritic) {
        g.service.criticScore = preview.score;
        g.service.criticMenu = {
            mainName: ITEMS[mainId].name,
            sideName: sideId && ITEMS[sideId] ? ITEMS[sideId].name : null,
            drinkName: drinkCons.name || null,
        };
    }

    sfx(preview.score >= 85 ? 'level' : 'coin');
    burst(at, preview.score >= 85 ? 'sparkle' : 'heart', preview.score >= 85 ? 12 : 6);
    toast(
        `${tbl.isCritic ? 'Table mystère' : tbl.name} : ${preview.score}/100 (+${fmt(preview.pay)} pièces)`,
        ['ui', 'gtable'],
    );

    if (g.service.served >= g.service.tables.length) {
        finishGTableService(at);
    } else {
        changed('gtable');
    }
    return true;
}

export function finishGTableService(at) {
    if (!gtableBuilt() || !state.gtable.service) return false;
    const g = ensureGTable();
    const sv = g.service;
    const served = Math.max(1, sv.served);
    const avg = Math.round(sv.scoreSum / served);

    g.services += 1;
    state.stats.gtableServices = (state.stats.gtableServices || 0) + 1;

    // Décompte du parfum d'ambiance (si non signature)
    if (g.scent && !g.scent.sig) {
        g.scent.left -= 1;
        if (g.scent.left <= 0) g.scent = null;
    }

    // Chronique du Critique anonyme s'il a été servi !
    let review = null;
    if (sv.criticScore !== null && sv.criticId) {
        const cr = GTABLE_CRITICS.find(c => c.id === sv.criticId) || GTABLE_CRITICS[0];
        const nextR = GTABLE_RANKS[g.rank + 1];
        const minNeed = nextR ? nextR.need.minCriticScore : 88;
        const won = sv.criticScore >= minNeed;
        if (won) {
            g.criticsWon += 1;
            state.stats.gtableCritics = (state.stats.gtableCritics || 0) + 1;
            addRenom(35 + g.rank * 25, 'gtable', at);
        }
        const quote = sv.criticScore >= 86 ? cr.praise : sv.criticScore >= 70 ? cr.mid : cr.low;
        review = {
            criticId: cr.id,
            criticName: cr.name,
            criticTitle: cr.title,
            avatar: cr.avatar,
            day: state.day,
            season: season().name,
            score: sv.criticScore,
            won,
            menu: sv.criticMenu,
            quote,
        };
        g.reviews.unshift(review);
        if (g.reviews.length > 24) g.reviews.length = 24;
    }

    // Vérifier le passage au rang d'Étoile supérieur !
    let promoted = null;
    const nextRank = GTABLE_RANKS[g.rank + 1];
    if (
        nextRank &&
        g.services >= nextRank.need.services &&
        g.criticsWon >= nextRank.need.critics &&
        gtableDishCount() >= nextRank.need.dishes &&
        (!review || review.score >= nextRank.need.minCriticScore || g.bestScore >= nextRank.need.minCriticScore)
    ) {
        g.rank += 1;
        state.stats.gtableStars = Math.max(state.stats.gtableStars || 0, nextRank.stars);
        if (nextRank.renom) addRenom(nextRank.renom, 'gtable', at);
        addPhoto('ui', 'gtable', `La Grande Table : ${nextRank.name}`, `Distinction décrochée au jour ${state.day} !`);
        sfx('level');
        buzz(25);
        burst(at, 'sparkle', 20);
        promoted = nextRank;
        toast(`Distinction du Guide : ${nextRank.name} !`, ['ui', 'gtable']);
    }

    const brig = brigadeFx(null, false, false);
    const cd = Math.round(GTABLE_COOLDOWN_MS * (1 - brig.fast));
    g.nextAt = now() + cd;
    g.lastReport = {
        avg,
        served: sv.served,
        earned: sv.earned,
        review,
        promoted: promoted ? promoted.name : null,
    };
    g.service = null;
    changed('gtable');
    return true;
}

// ---------------- Banquets d'Honneur ----------------
export function gtableBanquetCooldown(id) {
    const g = state.gtable;
    if (!g || !g.banquetDone || !g.banquetDone[id]) return 0;
    return Math.max(0, g.banquetDone[id] + 4 * 3600000 - now());
}

export function runGTableBanquet(banquetId, { mainId, sideId = null, drinkKey = null, vipBoxIdx = -1 }, at) {
    if (!gtableBuilt()) return false;
    const b = GTABLE_BANQUETS.find(x => x.id === banquetId);
    if (!b || gtableRank() < b.reqRank || gtableBanquetCooldown(banquetId) > 0) return false;
    if (!mainId || (state.inventory[mainId] || 0) <= 0) {
        toast('Choisissez un plat principal disponible', ['ui', 'gtable']);
        return false;
    }
    if (b.needDrink && !drinkKey) {
        toast('Ce banquet demande un accord boisson', ['ui', 'gtable']);
        return false;
    }
    const ev = evaluateGTablePlate({ themeId: b.theme, mainId, sideId, drinkKey, vipBoxIdx });
    if (ev.score < b.minScore) {
        toast(`Note prévue ${ev.score}/100 (il faut au moins ${b.minScore} pour ce banquet)`, ['ui', 'gtable']);
        sfx('error');
        return false;
    }

    consumeBarnItem(mainId);
    if (sideId) consumeBarnItem(sideId);
    if (drinkKey) consumeDrink(drinkKey);
    if (vipBoxIdx >= 0 && state.maison && state.maison.stock && state.maison.stock[vipBoxIdx]) {
        state.maison.stock.splice(vipBoxIdx, 1);
    }

    const g = ensureGTable();
    g.banquetDone[banquetId] = now();
    const totalPay = b.rewardCoins + ev.pay;
    earn(totalPay, at);
    state.income.gtable = (state.income.gtable || 0) + totalPay;
    addXp(b.rewardXp, at);
    addRenom(b.rewardRenom, 'gtable', at);
    state.stats.gtableBanquets = (state.stats.gtableBanquets || 0) + 1;
    sfx('level');
    buzz(22);
    burst(at, 'sparkle', 18);
    toast(`${b.name} triomphal (${ev.score}/100) : +${fmt(totalPay)} pièces !`, ['ui', 'gtable']);
    changed('gtable');
    return true;
}

export function gtableTick() {
    // Rien à muter périodiquement : l'horloge compare directement now() >= nextAt
    return false;
}
