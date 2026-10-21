// Les grandes écuries (1.23) : les chevaux logés en boxes, leur forme, leurs soins, leurs aptitudes et la randonnée.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { emit, toast, sfx, buzz, burst, float } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { HARAS_LVL, DISCIPLINES, DISC, APT, STABLE, FORM, TRAIN, RATION, BRUSH, RANDO, EQUIP } from '../data/haras.js';
import { animalTrait } from './genetics.js';
import { placeAnimal } from './pastures.js';
import { maxFood } from './animals.js';
import { addXp } from './player.js';
import { rollRare } from './barn.js';
import { hasCost, payCost } from './home.js';
import { tip } from './tips.js';

export const harasOpen = () => state.level >= HARAS_LVL;

export function ensureHaras() {
    const H = (state.haras = state.haras || {});
    H.lvl = H.lvl || 0;
    H.h = H.h || {};
    return H;
}
export const stableLvl = () => ensureHaras().lvl;
export const boxCount = () => STABLE[stableLvl()].boxes;
export const stableNext = () => STABLE[stableLvl() + 1] || null;
export const stableCanUp = () => harasOpen() && !!stableNext() && hasCost(stableNext().cost);

export function upgradeStable(at) {
    const n = stableNext();
    if (!harasOpen() || !n || !hasCost(n.cost)) return false;
    payCost(n.cost);
    ensureHaras().lvl++;
    sfx('level');
    buzz(20);
    burst(at, 'sparkle', 14);
    toast(stableLvl() === 1 ? 'Les grandes écuries sont ouvertes : 4 boxes' : `Les écuries s’agrandissent : ${boxCount()} boxes`, ['ui', 'hEcuries']);
    tip('haras');
    emit('changed', 'haras');
    return true;
}

// ---------------- les chevaux ----------------
export const horses = () => state.animals.filter(a => a.type === 'horse');
export const lodged = () => horses().filter(a => a.box);
export const atGrass = () => horses().filter(a => !a.box);
export const horseByUid = uid => state.animals.find(a => a.uid === uid && a.type === 'horse');
export const boxFree = () => Math.max(0, boxCount() - lodged().length);

// la fiche d'un cheval aux écuries (créée à la demande)
export function rec(a) {
    const H = ensureHaras();
    let r = H.h[a.uid];
    if (!r) r = H.h[a.uid] = { form: FORM.max, t: now(), pts: {}, spec: null, ration: 0, rando: null, brushDay: 0, sessions: 0 };
    DISCIPLINES.forEach(d => (r.pts[d.id] = r.pts[d.id] || 0));
    return r;
}

// ---------------- la forme ----------------
// 1.24.1 : la couverture d'hiver raccourcit le délai d'une pastille
export const formEvery = a => FORM.every * (equippedItem(a, 'couv') ? EQUIP.items[equippedItem(a, 'couv')].recover : 1);
export function formOf(a) {
    const r = rec(a);
    if (r.form < FORM.max) {
        const every = formEvery(a),
            n = Math.floor((now() - r.t) / every);
        if (n > 0) {
            r.form = Math.min(FORM.max, r.form + n);
            r.t = r.form >= FORM.max ? now() : r.t + n * every;
        }
    } else r.t = now();
    return r.form;
}
export const formLeftMs = a => {
    const r = rec(a);
    return formOf(a) >= FORM.max ? 0 : Math.max(0, r.t + formEvery(a) - now());
};
function spendForm(a, n = 1) {
    const r = rec(a);
    if (formOf(a) < n) return false;
    if (r.form >= FORM.max) r.t = now();
    r.form -= n;
    return true;
}
function addForm(a, n = 1) {
    const r = rec(a);
    formOf(a);
    r.form = Math.min(FORM.max, r.form + n);
    if (r.form >= FORM.max) r.t = now();
}

// ---------------- les aptitudes ----------------
export const geneOf = (a, d) => animalTrait(a, DISC[d].gene);
export const aptCap = (a, d) => Math.min(APT.max, APT.base + APT.perGene * geneOf(a, d));
export const aptOf = (a, d) => Math.min(aptCap(a, d), rec(a).pts[d] || 0);
export const rationLeftMs = a => Math.max(0, rec(a).ration - now());
export const rando = a => rec(a).rando;
export const randoLeftMs = a => (rando(a) ? Math.max(0, rando(a).until - now()) : 0);
export const randoDone = a => !!rando(a) && now() >= rando(a).until;
export const onRando = a => !!rando(a);

// les points d'un entraînement ; score de 0 à 1 (la séance simple vaut TRAIN.easyScore, les mini-jeux feront mieux)
export function trainGain(a, d, score = TRAIN.easyScore) {
    const cap = aptCap(a, d),
        pts = aptOf(a, d);
    if (pts >= cap) return 0;
    const base = TRAIN.min + TRAIN.span * Math.max(0, Math.min(1, score));
    const near = pts / cap > TRAIN.slow ? Math.max(TRAIN.floor, 1 - ((pts / cap - TRAIN.slow) / (1 - TRAIN.slow)) * (1 - TRAIN.floor)) : 1;
    const ration = rationLeftMs(a) > 0 ? 1 + RATION.bonus : 1;
    return Math.max(1, Math.round(base * near * ration * (1 + (a.love || 0) * TRAIN.love)));
}
export function canTrain(a) {
    return !!a && a.box && !onRando(a) && formOf(a) >= TRAIN.cost;
}
// une séance en deux temps : on paie la forme au départ (quitter en route la fait perdre), les points arrivent à la fin
export function startTrain(uid, d) {
    const a = horseByUid(uid);
    if (!a || !a.box || !DISC[d]) return null;
    if (onRando(a)) return toast(`${a.name} est en randonnée`, ['ui', 'hRando']), null;
    if (aptOf(a, d) >= aptCap(a, d))
        return toast(`${a.name} a atteint son plafond en ${DISC[d].name.toLowerCase()} : croisez pour viser plus haut`, DISC[d].icon), null;
    if (!spendForm(a, TRAIN.cost))
        return toast(`${a.name} est fatigué : la forme remonte d’une pastille toutes les 30 minutes`, ['ui', 'hForme']), sfx('error'), null;
    return a;
}
// 1.24 : un passage de concours coûte aussi une pastille de forme (mais ne donne pas de points d'aptitude)
export function startPass(uid) {
    const a = horseByUid(uid);
    if (!a || !a.box) return null;
    if (onRando(a)) return toast(`${a.name} est en randonnée`, ['ui', 'hRando']), null;
    if (!spendForm(a, TRAIN.cost))
        return toast(`${a.name} est fatigué : la forme remonte d’une pastille toutes les 30 minutes`, ['ui', 'hForme']), sfx('error'), null;
    return a;
}
export function endTrain(uid, d, at, score = TRAIN.easyScore) {
    const a = horseByUid(uid);
    if (!a || !a.box || !DISC[d]) return 0;
    const r = rec(a);
    const g = trainGain(a, d, score);
    r.pts[d] = Math.min(aptCap(a, d), aptOf(a, d) + g);
    r.sessions++;
    state.stats.trained = (state.stats.trained || 0) + 1;
    sfx(a.type);
    sfx('pop');
    buzz(10);
    float(at, [`+${g}`, DISC[d].icon], '', -30);
    addXp(8 + Math.round(g * 2), at);
    emit('changed', 'haras');
    return g;
}
export function trainHorse(uid, d, at, score = TRAIN.easyScore) {
    return startTrain(uid, d) ? endTrain(uid, d, at, score) : 0;
}
// les disciplines qui ont leur mini-jeu
export const hasGame = d => ['galop', 'saut', 'dressage', 'endurance'].includes(d);
export function setSpec(uid, d) {
    const a = horseByUid(uid);
    if (!a || !DISC[d]) return false;
    const r = rec(a);
    r.spec = r.spec === d ? null : d;
    emit('changed', 'haras');
    return true;
}

// ---------------- les soins ----------------
export function brushHorse(uid, at) {
    const a = horseByUid(uid);
    if (!a || !a.box) return false;
    const r = rec(a);
    if (r.brushDay === state.day) return toast(`${a.name} est déjà bien brossé aujourd’hui`, ['ui', 'hBrosse']), false;
    r.brushDay = state.day;
    if ((a.love || 0) < 5) a.love = (a.love || 0) + 1;
    sfx(a.type);
    sfx('pop');
    buzz(12);
    emit('hearts', { at, n: 4 });
    if (formOf(a) < FORM.max && Math.random() < (equippedItem(a, 'brosse') ? EQUIP.items[equippedItem(a, 'brosse')].brush : BRUSH.form)) {
        addForm(a, 1);
        float(at, ['+1', ['ui', 'hForme']], '', -34);
    }
    addXp(5, at);
    emit('changed', 'haras');
    return true;
}
export function feedHorse(uid, at) {
    const a = horseByUid(uid);
    if (!a) return 0;
    const room = maxFood() - a.food;
    if (room <= 0) return toast(`${a.name} n’a plus faim`, ['item', 'feed']), 0;
    const n = Math.min(room, state.inventory.feed || 0);
    if (n <= 0) return toast('Plus de nourriture : achetez-en au magasin ou au moulin', ['item', 'feed']), sfx('error'), 0;
    state.inventory.feed -= n;
    a.food += n;
    sfx('feed');
    burst(at, 'crumbs', 6, 10);
    float(at, [`+${n}`, ['item', 'feed']], '', -30);
    emit('changed', 'haras');
    return n;
}
export function giveRation(uid, id, at) {
    const a = horseByUid(uid);
    if (!a || !a.box || !RATION.items.includes(id)) return false;
    if ((state.inventory[id] || 0) <= 0) return toast(`Il vous faut : ${ITEMS[id].name.toLowerCase()}`, ['item', id]), sfx('error'), false;
    state.inventory[id]--;
    rec(a).ration = now() + RATION.hours * 3600000;
    sfx('feed');
    burst(at, 'crumbs', 6, 10);
    float(at, ['Ration !', ['item', id]], '', -30);
    emit('changed', 'haras');
    return true;
}

// ---------------- la randonnée ----------------
export function startRando(uid, at) {
    const a = horseByUid(uid);
    if (!a || !a.box || onRando(a)) return false;
    if (!spendForm(a, RANDO.cost)) return toast(`${a.name} est fatigué : un peu de repos avant de partir`, ['ui', 'hForme']), sfx('error'), false;
    rec(a).rando = { until: now() + RANDO.hours * 3600000 };
    sfx(a.type);
    toast(`${a.name} part en randonnée pour ${RANDO.hours} h`, ['ui', 'hRando']);
    emit('changed', 'haras');
    return true;
}
function drawFind() {
    const tot = RANDO.finds.reduce((x, f) => x + f[1], 0);
    let r = Math.random() * tot;
    for (const f of RANDO.finds) if ((r -= f[1]) < 0) return f[0];
    return RANDO.finds[0][0];
}
export function collectRando(uid, at) {
    const a = horseByUid(uid);
    if (!a || !randoDone(a)) return null;
    const r = rec(a);
    const qty = 1 + Math.floor(aptOf(a, 'endurance') / 40);
    const got = {};
    for (let k = 0; k < RANDO.draws; k++) {
        const id = drawFind();
        const n = 1 + Math.floor(Math.random() * qty);
        got[id] = (got[id] || 0) + n;
    }
    Object.entries(got).forEach(([id, n]) => (state.inventory[id] = (state.inventory[id] || 0) + n));
    const before = aptOf(a, 'endurance');
    r.pts.endurance = Math.min(aptCap(a, 'endurance'), before + RANDO.endurance);
    r.rando = null;
    state.stats.randos = (state.stats.randos || 0) + 1;
    rollRare(1, at);
    sfx('harvest');
    sfx(a.type);
    buzz(14);
    float(
        at,
        Object.entries(got).flatMap(([id, n]) => [`+${n}`, ['item', id]]),
        '',
        -30,
    );
    addXp(20, at);
    emit('changed', 'haras');
    return { got, gain: r.pts.endurance - before };
}

// ---------------- les boxes ----------------
export function lodge(uid) {
    const a = horseByUid(uid);
    if (!a || a.box || !harasOpen() || !boxFree()) return false;
    if (rec(a).retired) return toast(`${a.name} est à la retraite au pré`, ['ui', 'hRetraite']), false;
    if (a.adult === false) return toast(`${a.name} est encore trop jeune pour les écuries`, ['animal', 'horse']), false;
    a.box = true;
    a.p = -1;
    rec(a);
    sfx(a.type);
    toast(`${a.name} s’installe dans son box`, ['ui', 'hEcuries']);
    emit('changed', 'haras');
    return true;
}
export function unlodge(uid) {
    const a = horseByUid(uid);
    if (!a || !a.box) return false;
    if (onRando(a)) return toast(`${a.name} est en randonnée`, ['ui', 'hRando']), false;
    a.box = false;
    if (placeAnimal(a) < 0) {
        a.box = true;
        a.p = -1;
        toast('Tous vos prés sont pleins : il faut une place pour le cheval', ['ui', 'flowers']);
        sfx('error');
        return false;
    }
    sfx(a.type);
    toast(`${a.name} retourne au pré`, ['animal', 'horse']);
    emit('changed', 'haras');
    return true;
}

// les chevaux vendus ou disparus : on range leur fiche
export function tidyHaras() {
    const H = ensureHaras();
    const ids = new Set(horses().map(a => a.uid));
    Object.keys(H.h).forEach(k => !ids.has(k) && delete H.h[k]);
    // une bête en box sans écurie (fiche perdue) retourne au pré
    horses().forEach(a => {
        if (a.box && (H.lvl <= 0 || lodged().indexOf(a) >= boxCount())) {
            a.box = false;
            if (placeAnimal(a) < 0) a.p = 0;
        }
    });
}
export const fmtMin = ms => `${Math.max(1, Math.ceil(ms / 60000))} min`;

// ---------------- l'équipement (1.24.1) ----------------
export const eqOf = a => (rec(a).eq ||= {});
export const equippedItem = (a, slot) => (rec(a).eq || {})[slot] || null;
export const equipFor = slot => Object.keys(EQUIP.items).filter(id => EQUIP.items[id].slot === slot);
export function equip(uid, id, at) {
    const a = horseByUid(uid),
        e = EQUIP.items[id];
    if (!a || !a.box || !e) return false;
    if ((state.inventory[id] || 0) <= 0) return toast(`Il vous faut : ${ITEMS[id].name.toLowerCase()}`, ['item', id]), sfx('error'), false;
    const eq = eqOf(a),
        old = eq[e.slot];
    state.inventory[id]--;
    if (old) state.inventory[old] = (state.inventory[old] || 0) + 1;
    eq[e.slot] = id;
    sfx('pop');
    buzz(10);
    float(at, ['+', ['item', id]], '', -28);
    emit('changed', 'haras');
    return true;
}
export function unequip(uid, slot) {
    const a = horseByUid(uid);
    if (!a) return false;
    const eq = eqOf(a),
        old = eq[slot];
    if (!old) return false;
    state.inventory[old] = (state.inventory[old] || 0) + 1;
    eq[slot] = null;
    sfx('pop');
    emit('changed', 'haras');
    return true;
}
const eqItems = a => Object.values(rec(a).eq || {}).filter(Boolean);
// les points d'aptitude de l'équipement dans une discipline, et les points de présentation (comptés au concours seulement)
export const equipApt = (a, d) => eqItems(a).reduce((n, id) => n + ((EQUIP.items[id] && EQUIP.items[id].apt && EQUIP.items[id].apt[d]) || 0), 0);
export const equipPres = a => eqItems(a).reduce((n, id) => n + ((EQUIP.items[id] && EQUIP.items[id].pres) || 0), 0);
