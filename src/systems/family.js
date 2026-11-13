// 1.123 : la famille. Faire la cour à un villageois (roses), la demande, la noce, le conjoint et le foyer.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { view } from '../core/view.js';
import { toast, sfx, emit, buzz, burst, float } from '../core/bus.js';
import { fmt, pickRand } from '../core/format.js';
import { ITEMS } from '../data/items.js';
import { VILLAGERS } from '../data/village.js';
import { LOVES } from '../data/friends.js';
import { FAMILY, SUITORS, SHE, DATES, ROSE_LINES, FOYER } from '../data/family.js';
import { heartsOf } from './village.js';
import { villagerHere, hasCost, payCost } from './home.js';
import { spend, addXp } from './player.js';
import { addRenom } from './renom.js';
import { addPhoto } from './style.js';

const DAY = 24 * 3600 * 1000;
export const familyOpen = () => state.level >= FAMILY.lvl;
export function ensureFamily() {
    if (!state.family || typeof state.family !== 'object') state.family = {};
    const F = state.family;
    F.pts = F.pts || {};
    F.rooms = F.rooms || {};
    if (F.court === undefined) F.court = null;
    if (F.spouse === undefined) F.spouse = null;
    F.dateAt = F.dateAt || 0;
    return F;
}
export const vName = vid => (VILLAGERS[vid] ? VILLAGERS[vid].name : '');
export const isShe = vid => SHE.includes(vid);
export const ilElle = vid => (isShe(vid) ? 'elle' : 'il');
export const eFem = vid => (isShe(vid) ? 'e' : '');

// ---------------- la cour ----------------
export const suitors = () => SUITORS.filter(v => VILLAGERS[v] && villagerHere(v));
export const canCourt = vid => familyOpen() && SUITORS.includes(vid) && heartsOf(vid) >= FAMILY.hearts && !ensureFamily().spouse && !ensureFamily().engaged;
export const courtOf = () => ensureFamily().court;
export const lovePts = vid => ensureFamily().pts[vid] || 0;
export const rosesOf = vid => Math.min(FAMILY.roses, Math.floor(lovePts(vid) / FAMILY.rosePts));
export function court(vid) {
    if (!canCourt(vid)) return false;
    const F = ensureFamily();
    if (F.court === vid) return false;
    F.court = vid;
    sfx('pop');
    toast(`Vous faites la cour à ${vName(vid)}`, ['villager', vid]);
    return true;
}
export function stopCourt() {
    const F = ensureFamily();
    if (!F.court || F.engaged) return false;
    F.court = null;
    return true;
}
function addLove(vid, n, at) {
    const F = ensureFamily();
    if (F.court !== vid || F.engaged || F.spouse) return 0;
    const before = rosesOf(vid);
    F.pts[vid] = Math.min(FAMILY.roses * FAMILY.rosePts, lovePts(vid) + n);
    const after = rosesOf(vid);
    if (after > before) {
        if (at) burst(at, 'heart', 14);
        toast(`${vName(vid)} : ${after} rose${after > 1 ? 's' : ''}. ${ROSE_LINES[after - 1]}`, ['ui', 'fmRose']);
        emit('rose', { vid, roses: after });
    }
    return n;
}
// un cadeau ordinaire au prétendant compte aussi (appelé par giveGift)
export const giftLove = (vid, kind, at) => (kind === 'love' || kind === 'like' ? addLove(vid, FAMILY.gift[kind], at) : 0);

// les rendez-vous
export const dateWaitLeft = () => Math.max(0, ensureFamily().dateAt + FAMILY.dateWait - now());
export const dateReady = () => !!ensureFamily().court && !ensureFamily().engaged && dateWaitLeft() === 0;
export const dateCoins = d => (d.coins ? Math.round((d.coins * (1 + Math.max(0, state.level - FAMILY.lvl) * 0.08)) / 100) * 100 : 0);
// les produits qu'il faut pour un rendez-vous : { id: n } ou null s'il n'y en a pas assez
export function dateNeed(d, vid = courtOf()) {
    if (!vid) return null;
    if (d.love) return { [LOVES[vid]]: 1 };
    if (d.likes) {
        const have = VILLAGERS[vid].likes.filter(id => ITEMS[id] && (state.inventory[id] || 0) > 0).sort((a, b) => (state.inventory[b] || 0) - (state.inventory[a] || 0));
        // trois produits aimés, les plus abondants d'abord (un même produit peut compter plusieurs fois)
        const need = {};
        let left = d.likes;
        for (const id of have) {
            const n = Math.min(left, state.inventory[id]);
            need[id] = n;
            left -= n;
            if (!left) break;
        }
        return left ? null : need;
    }
    return {};
}
export function dateCan(d, vid = courtOf()) {
    if (!vid || rosesOf(vid) < d.roses) return false;
    if (d.coins && state.money < dateCoins(d)) return false;
    const need = dateNeed(d, vid);
    return !!need && Object.entries(need).every(([id, n]) => (state.inventory[id] || 0) >= n);
}
export function goDate(id, at) {
    const F = ensureFamily();
    const d = DATES.find(x => x.id === id);
    const vid = F.court;
    if (!d || !vid || !dateReady() || !dateCan(d, vid)) return false;
    Object.entries(dateNeed(d, vid)).forEach(([k, n]) => (state.inventory[k] -= n));
    if (d.coins) spend(dateCoins(d));
    F.dateAt = now();
    state.stats.dates = (state.stats.dates || 0) + 1;
    sfx('buy');
    buzz(15);
    addLove(vid, d.pts, at);
    if (at) float(at, [`+${d.pts}`, ['ui', 'heart']], 'good', -14);
    toast(`${d.name} avec ${vName(vid)}`, d.icon);
    return true;
}

// ---------------- la demande et la noce ----------------
export const canPropose = () => {
    const F = ensureFamily();
    return !!F.court && !F.engaged && rosesOf(F.court) >= FAMILY.roses && (state.inventory[FAMILY.ring] || 0) > 0;
};
export function propose(at) {
    if (!canPropose()) return false;
    const F = ensureFamily();
    state.inventory[FAMILY.ring]--;
    F.engaged = true;
    sfx('level');
    if (at) burst(at, 'heart', 24);
    toast(`${vName(F.court)} a dit oui !`, ['ui', 'fmRing']);
    addPhoto('villager', F.court, `Les fiançailles avec ${vName(F.court)}`, 'La famille');
    emit('engaged', { vid: F.court });
    return true;
}
export const weddingCoins = () => Math.round((FAMILY.weddingCoins * (1 + Math.max(0, state.level - FAMILY.lvl) * 0.05)) / 1000) * 1000;
export const weddingCost = () => ({ coins: weddingCoins(), ...FAMILY.wedding });
export const canWed = () => !!ensureFamily().engaged && roomLvl('bedroom') > 0 && hasCost(weddingCost());
export function marry(at) {
    if (!canWed()) return false;
    const F = ensureFamily();
    payCost(weddingCost());
    F.spouse = F.court;
    F.court = null;
    F.engaged = false;
    F.wedAt = now();
    F.wedDay = state.day;
    F.aff = FAMILY.aff.max;
    F.affAt = now();
    F.wordAt = 0;
    F.basketAt = now() - FAMILY.basket.every; // un premier panier tout de suite
    state.stats.weddings = (state.stats.weddings || 0) + 1;
    addRenom(FAMILY.renom, 'la noce');
    addXp(2000 + state.level * 60, at);
    sfx('level');
    buzz([30, 40, 30]);
    if (at) burst(at, 'heart', 40);
    addPhoto('villager', F.spouse, `Le mariage avec ${vName(F.spouse)}`, 'Tout le village était là');
    toast(`Vive les mariés ! ${vName(F.spouse)} s’installe à la ferme`, ['ui', 'fmRing']);
    emit('wedding', { vid: F.spouse });
    return true;
}

// ---------------- le conjoint ----------------
export const spouseOf = () => (state.family && state.family.spouse) || null;
function settleAff(t = now()) {
    const F = ensureFamily();
    if (!F.spouse) return;
    const days = (t - (F.affAt || t)) / DAY;
    F.aff = Math.max(0, Math.min(FAMILY.aff.max, (F.aff ?? FAMILY.aff.max) - days * FAMILY.aff.decayDay));
    F.affAt = t;
}
export const affection = () => {
    if (!spouseOf()) return 0;
    settleAff();
    return Math.round(state.family.aff);
};
export const spouseHappy = () => !!spouseOf() && affection() >= FAMILY.aff.keep;
export const wordLeft = () => Math.max(0, (ensureFamily().wordAt || 0) + FAMILY.aff.wordWait - now());
export function sweetWord(at) {
    const F = ensureFamily();
    if (!F.spouse || wordLeft() > 0) return false;
    settleAff();
    F.aff = Math.min(FAMILY.aff.max, F.aff + FAMILY.aff.word);
    F.wordAt = now();
    sfx('pop');
    if (at) burst(at, 'heart', 10);
    toast(`${vName(F.spouse)} sourit`, ['villager', F.spouse]);
    return true;
}
// le panier : trois produits qu'il ou elle aime, plus garni avec le grand salon et la tendresse
export const basketLeft = () => Math.max(0, (ensureFamily().basketAt || 0) + FAMILY.basket.every - now());
export const basketReady = () => !!spouseOf() && basketLeft() === 0;
export const basketMult = () => 1 + roomFx('basket');
export const basketQty = () => Math.max(1, Math.round((FAMILY.basket.base + state.level * FAMILY.basket.perLvl) * basketMult() * (spouseHappy() ? 1 : 0.5)));
export function takeBasket(at) {
    const F = ensureFamily();
    if (!basketReady()) return false;
    const pool = VILLAGERS[F.spouse].likes.filter(id => ITEMS[id]);
    const got = {};
    const n = basketQty();
    for (let k = 0; k < FAMILY.basket.items; k++) {
        const id = pickRand(pool);
        got[id] = (got[id] || 0) + n;
    }
    Object.entries(got).forEach(([id, q]) => (state.inventory[id] = (state.inventory[id] || 0) + q));
    F.basketAt = now();
    state.stats.baskets = (state.stats.baskets || 0) + 1;
    sfx('harvest');
    if (at) burst(at, 'sparkle', 12);
    toast(
        `Le panier de ${vName(F.spouse)} : ${Object.entries(got)
            .map(([id, q]) => `${q} ${ITEMS[id].name.toLowerCase()}`)
            .join(', ')}`,
        ['ui', 'basket'],
    );
    return got;
}

// ---------------- le foyer ----------------
export const roomLvl = id => ensureFamily().rooms[id] || 0;
export const roomDef = id => FOYER.find(r => r.id === id);
export const roomNext = id => {
    const r = roomDef(id);
    return r && r.lv[roomLvl(id)] ? r.lv[roomLvl(id)] : null;
};
export const roomCan = id => !!roomNext(id) && hasCost(roomNext(id).cost);
export function buildRoom(id, at) {
    const nx = roomNext(id);
    if (!familyOpen() || !nx || !hasCost(nx.cost)) return false;
    payCost(nx.cost);
    const F = ensureFamily();
    F.rooms[id] = roomLvl(id) + 1;
    state.stats.rooms = (state.stats.rooms || 0) + 1;
    addXp(500 + state.level * 20, at);
    sfx('level');
    if (at) burst(at, 'sparkle', 20);
    toast(`${roomDef(id).name} : ${nx.fx}`, roomDef(id).icon);
    return true;
}
// la somme d'un effet sur toutes les pièces construites
export const roomFx = k =>
    FOYER.reduce((a, r) => {
        const l = roomLvl(r.id);
        return a + (l ? r.lv[l - 1][k] || 0 : 0);
    }, 0);
export const foyerSpent = () => FOYER.reduce((a, r) => a + r.lv.slice(0, roomLvl(r.id)).reduce((b, x) => b + (x.cost.coins || 0), 0), 0);

// ce qui attend le joueur (pastille de l'onglet)
export function familyReady() {
    if (!familyOpen()) return 0;
    const F = ensureFamily();
    if (F.spouse) return (basketReady() ? 1 : 0) + (wordLeft() === 0 && affection() < FAMILY.aff.max - 10 ? 1 : 0);
    if (F.engaged) return canWed() ? 1 : 0;
    if (F.court) return (dateReady() && DATES.some(d => dateCan(d)) ? 1 : 0) + (canPropose() ? 1 : 0);
    return 0;
}
export function familyTick() {
    if (!state.family || !state.family.spouse) return false;
    const before = state.family.aff >= FAMILY.aff.keep;
    settleAff();
    const after = state.family.aff >= FAMILY.aff.keep;
    if (before && !after && view.started) toast(`${vName(state.family.spouse)} se sent un peu délaissé${eFem(state.family.spouse)}`, ['ui', 'heartOff']);
    return before !== after;
}
export const fmtCoins = n => fmt(n);
