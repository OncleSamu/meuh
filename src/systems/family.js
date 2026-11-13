// 1.123 : la famille. Faire la cour à un villageois (roses), la demande, la noce, le conjoint et le foyer.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { view } from '../core/view.js';
import { toast, sfx, emit, buzz, burst, float } from '../core/bus.js';
import { fmt, pickRand } from '../core/format.js';
import { ITEMS } from '../data/items.js';
import { VILLAGERS } from '../data/village.js';
import { LOVES } from '../data/friends.js';
import { FAMILY, SUITORS, SHE, DATES, ROSE_LINES, FOYER, KIDS, CARES, SNACKS, TASKS, KID_NAMES, SPOUSE_LOOK, KID_METIER, KID_WED, GRANDKIDS, TOWN } from '../data/family.js';
import { METIERS } from '../data/metiers.js';
import { metierOf } from './metier.js';
import { campRes, resHearts } from './residents.js';
import { randomLook, idOf, lookOf, isHabitant } from '../art/habitants.js';
import { meLook } from './identity.js';
import { heartsOf } from './village.js';
import { villagerHere, hasCost, payCost, presentVillagers } from './home.js';
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
    F.kids = F.kids || [];
    if (F.baby === undefined) F.baby = null;
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

// ---------------- 1.124 : les enfants ----------------
export const kids = () => ensureFamily().kids;
export const kidById = id => kids().find(k => k.id === id) || null;
export const kidsMax = () => Math.min(KIDS.max, (roomLvl('nursery') ? 1 : 0) + roomLvl('kidsroom'));
export const canExpect = () => {
    const F = ensureFamily();
    return !!F.spouse && !F.baby && spouseHappy() && F.kids.length < kidsMax();
};
export function expect() {
    if (!canExpect()) return false;
    ensureFamily().baby = { due: now() + KIDS.expect };
    sfx('pop');
    toast(`Un heureux événement s’annonce : le bébé arrivera dans six heures`, ['ui', 'fmCradle']);
    return true;
}
export const babyLeft = () => (ensureFamily().baby ? Math.max(0, ensureFamily().baby.due - now()) : 0);
// le visage d'un enfant : le teint, les cheveux et les yeux d'un parent ou de l'autre, le reste au hasard
const parentLook = who => {
    if (isHabitant(who)) {
        const l = lookOf(who);
        return [l.skin, l.hairColor, l.eyeColor];
    }
    return SPOUSE_LOOK[who] || [1, 2, 1];
};
export function kidLook(a, b, girl, seed) {
    const A = parentLook(a),
        B = parentLook(b);
    const r = j => ((seed >> j) & 1 ? A : B);
    return idOf(randomLook(seed, { female: girl, male: !girl, fix: { skin: r(1)[0], hairColor: r(2)[1], eyeColor: r(3)[2], beard: 0, glasses: 0, hat: 0 } }));
}
function birth() {
    const F = ensureFamily();
    F.baby = null;
    const girl = Math.random() < 0.5;
    const taken = F.kids.map(k => k.name);
    const pool = KID_NAMES[girl ? 'girl' : 'boy'].filter(n => !taken.includes(n));
    const seed = Math.floor(Math.random() * 1e9);
    const kid = {
        id: 'k' + (F.next = (F.next || 0) + 1),
        name: pickRand(pool.length ? pool : KID_NAMES[girl ? 'girl' : 'boy']),
        girl,
        born: now(),
        bornDay: state.day,
        at: now(),
        grow: 0,
        joy: KIDS.joy.max,
        care: {},
        find: now(),
        task: null,
        gen: 1,
        parents: [meLook(), F.spouse],
        look: kidLook(meLook(), F.spouse, girl, seed),
    };
    F.kids.push(kid);
    state.stats.births2 = (state.stats.births2 || 0) + 1;
    addRenom(KIDS.renom, 'une naissance');
    addPhoto('villager', kid.look, `La naissance de ${kid.name}`, 'La famille');
    if (view.started) toast(`${kid.name} est né${girl ? 'e' : ''} ! Bienvenue dans la famille`, ['ui', 'fmCradle']);
    emit('kidBorn', { id: kid.id });
    return kid;
}
export function renameKid(id, n) {
    const k = kidById(id);
    const v = String(n || '')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 16);
    if (!k || !v) return false;
    k.name = v;
    return true;
}
export const stageOf = k => KIDS.ages.filter(h => k.grow >= h).length;
export const stageName = k => KIDS.ageNames[stageOf(k)];
// les heures qui restent avant l'âge suivant
export const kidGrowLeft = k => (stageOf(k) >= KIDS.ages.length ? 0 : KIDS.ages[stageOf(k)] - k.grow);
export const stageInto = k => {
    const st = stageOf(k);
    if (st >= KIDS.ages.length) return 1;
    const a = st ? KIDS.ages[st - 1] : 0;
    return (k.grow - a) / (KIDS.ages[st] - a);
};
const growMult = () => 1 + roomFx('grow');
// le temps qui passe : le bonheur baisse, l'enfant grandit (moitié moins vite s'il est malheureux)
function settleKid(k, t = now()) {
    const dt = Math.max(0, t - (k.at || t));
    k.at = t;
    if (!dt) return;
    const h = dt / 3600000;
    const happy = k.joy >= KIDS.joy.keep;
    const st = stageOf(k);
    if (st < KIDS.ages.length) {
        k.grow += h * (happy ? 1 : 0.5) * growMult();
        if (stageOf(k) > st) grewUp(k);
    }
    k.joy = Math.max(0, k.joy - (h / 24) * KIDS.joy.decayDay * (1 - roomFx('joy')));
}
function grewUp(k) {
    const st = stageOf(k);
    const g = k.girl ? 'e' : '';
    const txt = [null, `${k.name} fait ses premiers pas, c’est un${g ? 'e' : ''} enfant !`, `${k.name} entre dans l’adolescence`, `${k.name} est adulte !`][st];
    if (txt && view.started) toast(txt, ['villager', k.look]);
    addPhoto('villager', k.look, txt || k.name, 'La famille');
    if (st >= 2 && !k.task) k.task = 'field';
    emit('kidGrew', { id: k.id, stage: st });
}
export const kidJoy = k => {
    settleKid(k);
    return Math.round(k.joy);
};
export const caresOf = k => CARES[Math.min(stageOf(k), CARES.length - 1)];
export const careLeft = (k, c) => Math.max(0, (k.care[c.id] || 0) + KIDS.careWait - now());
export const snackOf = () => SNACKS.find(id => ITEMS[id] && (state.inventory[id] || 0) > 0) || null;
export const pocketCoins = c => Math.round((c.coins * (1 + Math.max(0, state.level - FAMILY.lvl) * 0.08)) / 100) * 100;
export function careNeed(c) {
    if (c.need) return c.need;
    if (c.snack) return snackOf() ? { [snackOf()]: 1 } : null;
    return {};
}
export function careCan(k, c) {
    if (careLeft(k, c) > 0) return false;
    if (c.coins && state.money < pocketCoins(c)) return false;
    const nd = careNeed(c);
    return !!nd && Object.entries(nd).every(([id, n]) => (state.inventory[id] || 0) >= n);
}
export function careKid(id, cid, at) {
    const k = kidById(id);
    if (!k) return false;
    settleKid(k);
    const c = caresOf(k).find(x => x.id === cid);
    if (!c || !careCan(k, c)) return false;
    Object.entries(careNeed(c)).forEach(([i, n]) => (state.inventory[i] -= n));
    if (c.coins) spend(pocketCoins(c));
    k.care[c.id] = now();
    k.joy = Math.min(KIDS.joy.max, k.joy + KIDS.joy.care);
    const st = stageOf(k);
    if (st < KIDS.ages.length) {
        k.grow += KIDS.careGrow;
        if (stageOf(k) > st) grewUp(k);
    }
    state.stats.kidCares = (state.stats.kidCares || 0) + 1;
    sfx('pop');
    if (at) burst(at, 'heart', 8);
    return true;
}
// l'enfant (de 1 à 2) ramasse de petites choses
export const findLeft = k => Math.max(0, (k.find || 0) + KIDS.find.every - now());
export const findReady = k => stageOf(k) === 1 && findLeft(k) === 0;
export function kidFind(id, at) {
    const k = kidById(id);
    if (!k || !findReady(k)) return false;
    const pool = KIDS.find.pool.filter(i => ITEMS[i]);
    const n = Math.max(1, Math.round((KIDS.find.base + state.level * KIDS.find.perLvl) * (kidJoy(k) >= KIDS.joy.keep ? 1 : 0.5)));
    const got = {};
    for (let j = 0; j < 2; j++) {
        const i = pickRand(pool);
        got[i] = (got[i] || 0) + n;
    }
    Object.entries(got).forEach(([i, q]) => (state.inventory[i] = (state.inventory[i] || 0) + q));
    k.find = now();
    sfx('harvest');
    if (at) burst(at, 'sparkle', 10);
    toast(
        `${k.name} rapporte ${Object.entries(got)
            .map(([i, q]) => `${q} ${ITEMS[i].name.toLowerCase()}`)
            .join(' et ')}`,
        ['villager', k.look],
    );
    return got;
}
// le coup de main des ados et des adultes
export function setTask(id, task) {
    const k = kidById(id);
    if (!k || stageOf(k) < 2 || !TASKS.some(t => t.id === task) || k.task === task) return false;
    k.task = task;
    sfx('pop');
    return true;
}
export const kidHelp = k => {
    const st = stageOf(k);
    if (st < 2 || !k.task) return 0;
    const base = (KIDS.help + roomFx('help')) * (st >= 3 ? KIDS.adultHelp : 1);
    return base * (k.joy >= KIDS.joy.keep ? 1 : 0.5);
};
// le multiplicateur d'une tâche (1 + la somme des coups de main), lu par le champ, les bêtes, l'atelier et le marché
export const kidFx = task => {
    const F = state.family;
    if (!F || !F.kids || !F.kids.length) return 1;
    return 1 + F.kids.reduce((a, k) => a + (k.task === task ? kidHelp(k) : 0), 0);
};
export const kidReady = k => (findReady(k) ? 1 : 0) + (caresOf(k).some(c => careCan(k, c)) && kidJoy(k) < KIDS.joy.max - 15 ? 1 : 0);

// ---------------- 1.125 : ils grandissent ----------------
export const isAdultKid = k => stageOf(k) >= KIDS.ages.length;
// son métier : les produits de ce métier se vendent un peu plus cher (une fois par métier)
export function setKidMetier(id, mid) {
    const k = kidById(id);
    if (!k || !isAdultKid(k) || !METIERS[mid] || k.metier === mid) return false;
    k.metier = mid;
    sfx('pop');
    toast(`${k.name} devient ${METIERS[mid].name.toLowerCase()}`, METIERS[mid].icon);
    return true;
}
export const kidMetiers = () => [...new Set(((state.family && state.family.kids) || []).filter(k => k.metier && isAdultKid(k)).map(k => k.metier))];
export const kidMetierMult = item => {
    const F = state.family;
    if (!F || !F.kids || !F.kids.length) return 1;
    const m = metierOf(item);
    return m && kidMetiers().includes(m) ? 1 + KID_METIER.price : 1;
};
// son mariage avec un résident du camping, et la maison au village
export const couples = () => kids().filter(k => k.spouse);
export const kidWedCost = () => ({ coins: KID_WED.house(couples().length + 1), ...KID_WED.mats, ...KID_WED.items });
export const kidMatches = () => campRes().filter(r => resHearts(r) >= KID_WED.hearts);
export const kidCanWed = (k, rid) => !!k && isAdultKid(k) && !k.spouse && kidMatches().some(r => r.id === rid) && hasCost(kidWedCost());
export function kidWed(id, rid, at) {
    const k = kidById(id);
    const r = campRes().find(x => x.id === rid);
    if (!r || !kidCanWed(k, r.id)) return false;
    payCost(kidWedCost());
    state.camping.res = state.camping.res.filter(x => x !== r);
    k.spouse = { name: r.name, look: r.look, woman: !!r.woman, job: r.job || '' };
    k.wedAt = now();
    k.gk = [];
    k.gkAt = now();
    state.stats.kidWeddings = (state.stats.kidWeddings || 0) + 1;
    addRenom(2, 'une noce au village');
    addXp(1500 + state.level * 40, at);
    sfx('level');
    if (at) burst(at, 'heart', 30);
    addPhoto('villager', k.look, `Le mariage de ${k.name} et ${r.name}`, 'Une nouvelle maison au village');
    toast(`${k.name} épouse ${r.name} : une maison de plus au village !`, ['ui', 'fmRing']);
    return true;
}
// les petits-enfants : ils naissent et grandissent tout seuls
export const gkStage = g => KIDS.ages.filter(h => (now() - g.born) / 3600000 >= h).length;
function grandkidTick(k) {
    if (!k.spouse) return false;
    k.gk = k.gk || [];
    if (k.gk.length >= GRANDKIDS.max || now() < (k.gkAt || 0) + GRANDKIDS.every) return false;
    const girl = Math.random() < 0.5;
    const taken = allPeople().map(p => p.name);
    const pool = KID_NAMES[girl ? 'girl' : 'boy'].filter(n => !taken.includes(n));
    const seed = Math.floor(Math.random() * 1e9);
    const g = { id: k.id + 'g' + (k.gk.length + 1), name: pickRand(pool.length ? pool : KID_NAMES[girl ? 'girl' : 'boy']), girl, born: now(), look: kidLook(k.look, k.spouse.look, girl, seed), gen: 2 };
    k.gk.push(g);
    k.gkAt = now();
    state.stats.grandkids = (state.stats.grandkids || 0) + 1;
    addRenom(1, 'un petit-enfant');
    addPhoto('villager', g.look, `La naissance de ${g.name}, fille de ${k.name}`.replace('fille de', girl ? 'fille de' : 'fils de'), 'Les petits-enfants');
    if (view.started) toast(`${k.name} a un${girl ? 'e' : ''} petit${girl ? 'e' : ''} ${g.name} : vous êtes grand-parent !`, ['ui', 'fmCradle']);
    return true;
}
// tous les membres de la famille (pour l'arbre et les noms)
export const allPeople = () => {
    const F = state.family;
    if (!F) return [];
    const out = [];
    for (const k of F.kids || []) {
        out.push(k);
        if (k.spouse) out.push(k.spouse);
        for (const g of k.gk || []) out.push(g);
    }
    return out;
};
// ---------------- la ville ----------------
export function population() {
    const F = state.family || {};
    const fam = (F.spouse ? 1 : 0) + (F.kids || []).reduce((a, k) => a + 1 + (k.spouse ? 1 : 0) + (k.gk || []).length, 0);
    const v = presentVillagers().length;
    const r = campRes().length;
    return { villagers: v, residents: r, family: fam, total: v + r + fam + 1 };
}
export const townTier = () => TOWN.tiers.filter(t => population().total >= t.n).length - 1;
export const townName = () => TOWN.tiers[townTier()].name;
export const townNext = () => TOWN.tiers[townTier() + 1] || null;
export const townMult = () => (familyOpen() ? 1 + TOWN.price * townTier() : 1);

// ce qui attend le joueur (pastille de l'onglet)
export function familyReady() {
    if (!familyOpen()) return 0;
    const F = ensureFamily();
    if (F.spouse)
        return (
            (basketReady() ? 1 : 0) +
            (wordLeft() === 0 && affection() < FAMILY.aff.max - 10 ? 1 : 0) +
            (canExpect() ? 1 : 0) +
            F.kids.reduce((a, k) => a + kidReady(k), 0) +
            F.kids.filter(k => isAdultKid(k) && !k.metier).length
        );
    if (F.engaged) return canWed() ? 1 : 0;
    if (F.court) return (dateReady() && DATES.some(d => dateCan(d)) ? 1 : 0) + (canPropose() ? 1 : 0);
    return 0;
}
export function familyTick() {
    if (!familyOpen()) return false;
    const F = ensureFamily();
    let ch = false;
    // la ville change de palier
    const tier = townTier();
    if (F.town !== undefined && tier > F.town && view.started) toast(`La vallée compte ${population().total} habitants : la voici « ${townName()} »`, ['ui', 'village']);
    if (F.town !== tier) {
        F.town = tier;
        ch = true;
    }
    if (!F.spouse) return ch;
    if (F.baby && now() >= F.baby.due) {
        birth();
        ch = true;
    }
    for (const k of F.kids || []) {
        const st = stageOf(k);
        settleKid(k);
        if (stageOf(k) !== st) ch = true;
        if (grandkidTick(k)) ch = true;
    }
    const before = state.family.aff >= FAMILY.aff.keep;
    settleAff();
    const after = state.family.aff >= FAMILY.aff.keep;
    if (before && !after && view.started) toast(`${vName(state.family.spouse)} se sent un peu délaissé${eFem(state.family.spouse)}`, ['ui', 'heartOff']);
    return ch || before !== after;
}
export const fmtCoins = n => fmt(n);
