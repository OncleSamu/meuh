// 1.10 : la pêche à l'étang. Trois coins de pêche, des appâts, la canne et son mini-jeu (chaque poisson
// se bat à sa façon), les nasses qui pêchent seules, le carnet des records, les défis de Marcel,
// la remontée des saumons et le concours de pêche du week-end.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { RIVAL_STYLE } from './rivals.js';
import { view } from '../core/view.js';
import { fmt, qtyName, round5 } from '../core/format.js';
import { emit, toast, sfx, buzz, burst, float, fly } from '../core/bus.js';
import { NATURE } from '../data/nature.js';
import { FISH } from '../data/meta.js';
import { RIVALS } from '../data/village.js';
import { DAYS_PER_SEASON } from '../data/world.js';
import { SPOTS, BAITS, BAIT_MULT, WORMS, FLY_CRAFT, RODS, TRAPS, MARCEL, SALMON_RUN, FISH_CONTEST, SIZES, LOG_STEPS } from '../data/fishing.js';
import { spend, addXp, earn, rank } from './player.js';
import { collect } from './book.js';
import { season, isNight, dayInSeason } from './world.js';
import { barnBlocked, barnSpace } from './barn.js';
import { projectDone } from './story.js';
import { addFriendship } from './village.js';
import { trapBonus } from './buildings.js';
import { domStepSum } from './estate.js';

export const pondOpen = () => state.level >= NATURE.pond.lvl;
// les noms féminins, pour « une truite » ou « un brochet »
const FEM = new Set(['bleak', 'perch', 'crayfish', 'trout', 'tench', 'carp', 'eel', 'burbot', 'boot', 'spinyLobster']);
export const fishArt = id => (FEM.has(id) ? 'une' : 'un');
const low = id => FISH[id].name.toLowerCase();
const kg = w => (Math.round(w * 100) / 100).toString().replace('.', ',') + ' kg';
export const kgText = kg;
// « la truite la plus lourde », « le brochet le plus lourd »
export const heaviest = id => (FEM.has(id) ? `la ${low(id)} la plus lourde` : `le ${low(id)} le plus lourd`);

export function ensurePond() {
    const p = (state.pond = state.pond || {});
    if (!SPOTS[p.spot]) p.spot = 'bank';
    if (p.bait === undefined || (p.bait && !BAITS[p.bait])) p.bait = null;
    if (typeof p.rod !== 'number') p.rod = 0;
    if (typeof p.worms !== 'number') p.worms = WORMS.start;
    if (!p.wormsAt) p.wormsAt = now();
    if (typeof p.flies !== 'number') p.flies = 0;
    if (!Array.isArray(p.traps)) p.traps = [];
    if (!p.log || typeof p.log !== 'object') p.log = {};
    if (!p.run || typeof p.run !== 'object') p.run = {};
    if (p.marcel === undefined) p.marcel = null;
    if (p.contest === undefined) p.contest = null;
    if (p.lastContest === undefined) p.lastContest = null;
    if (typeof p.perfect !== 'number') p.perfect = 0;
    wormTick();
    return p;
}

// ---------------- la boîte à vers ----------------
function wormTick() {
    const p = state.pond,
        t = now();
    if (p.worms >= WORMS.max) {
        p.wormsAt = t;
        return;
    }
    const n = Math.floor((t - p.wormsAt) / WORMS.every);
    if (n <= 0) return;
    p.worms = Math.min(WORMS.max, p.worms + n);
    p.wormsAt = p.worms >= WORMS.max ? t : p.wormsAt + n * WORMS.every;
}
export const nextWorm = () => (state.pond.worms >= WORMS.max ? 0 : state.pond.wormsAt + WORMS.every);

// ---------------- les coins de pêche et les appâts ----------------
export const spotOpen = id => {
    const s = SPOTS[id];
    return !!s && state.level >= s.lvl && (!s.project || projectDone(s.project));
};
export const spotLock = id => {
    const s = SPOTS[id];
    if (state.level < s.lvl) return `Niveau ${s.lvl}`;
    if (s.project && !projectDone(s.project))
        return s.project === 'ferry' ? 'Réparez le bac de Tiago (chantier du village)' : 'Réparez le ponton de Marcel (chantier du village)';
    return '';
};
export const baitOpen = id => {
    const b = BAITS[id];
    return !!b && state.level >= b.lvl && (!b.project || projectDone(b.project));
};
export function baitCount(id) {
    const b = BAITS[id],
        p = state.pond;
    if (!b) return 0;
    if (b.have === 'worms') return p.worms;
    if (b.have === 'flies') return p.flies;
    return Math.floor(state.inventory[b.have] || 0);
}
function takeBait(id) {
    const b = BAITS[id],
        p = state.pond;
    if (!b || baitCount(id) <= 0) return false;
    if (b.have === 'worms') {
        if (p.worms >= WORMS.max) p.wormsAt = now();
        p.worms--;
    } else if (b.have === 'flies') p.flies--;
    else state.inventory[b.have]--;
    return true;
}
export function setSpot(id) {
    ensurePond();
    if (!spotOpen(id)) {
        toast(spotLock(id), ['ui', SPOTS[id].icon]);
        sfx('error');
        return false;
    }
    if (fishing.phase !== 'idle') return false;
    state.pond.spot = id;
    sfx('click');
    return true;
}
export function setBait(id) {
    ensurePond();
    if (id && !baitOpen(id)) return false;
    state.pond.bait = state.pond.bait === id ? null : id;
    sfx('click');
    return true;
}
export function craftFlies(at) {
    ensurePond();
    if (!baitOpen('fly')) return false;
    const miss = Object.entries(FLY_CRAFT.ing).filter(([k, n]) => (state.inventory[k] || 0) < n);
    if (miss.length) {
        toast('Il faut une plume (les canards) et une pelote de laine (les moutons)', ['ui', 'fly']);
        sfx('error');
        return false;
    }
    Object.entries(FLY_CRAFT.ing).forEach(([k, n]) => (state.inventory[k] -= n));
    state.pond.flies += FLY_CRAFT.out;
    sfx('pop');
    if (at) float(at, [`+${FLY_CRAFT.out}`, ['ui', 'fly']], '', -30);
    return true;
}

// ---------------- quels poissons, où et quand ----------------
export function fishNow(f) {
    const w = f.when;
    if (!w) return true;
    if (w.seasons && !w.seasons.includes(season().id)) return false;
    if (w.night && !isNight()) return false;
    if (w.weather && !w.weather.includes(state.weather)) return false;
    return true;
}
// la remontée des saumons : quelques jours chaque automne
export const salmonRun = () => state.challenge !== 'winter' && season().id === 'automne' && dayInSeason() >= SALMON_RUN.from && dayInSeason() <= SALMON_RUN.to;
const yearKey = () => Math.floor((state.day - 1) / (DAYS_PER_SEASON * 4));

export function fishOdds(id, spot, bait) {
    const f = FISH[id];
    if (f.spots && !f.spots.includes(spot)) return 0;
    if (!fishNow(f)) return 0;
    let o = f.odds;
    if (f.run && salmonRun()) o *= SALMON_RUN.mult;
    if (bait && f.bait && f.bait.includes(bait)) o *= BAIT_MULT;
    if (bait && f.junk) o *= 0.5;
    return o;
}
export function pickFish(spot = state.pond.spot, bait = null) {
    const pool = Object.keys(FISH)
        .map(id => [id, fishOdds(id, spot, bait)])
        .filter(([, o]) => o > 0);
    let r = Math.random() * pool.reduce((a, [, o]) => a + o, 0);
    for (const [id, o] of pool) if ((r -= o) <= 0) return id;
    return pool.length ? pool[0][0] : 'roach';
}
// ce qu'on peut attraper ici maintenant, et les chances avec l'appât choisi
export function catchTable(spot = state.pond.spot, bait = state.pond.bait) {
    const b = bait && baitCount(bait) > 0 ? bait : null;
    const rows = Object.keys(FISH)
        .map(id => [id, fishOdds(id, spot, b)])
        .filter(([id, o]) => o > 0 && !FISH[id].junk);
    const tot = Object.keys(FISH).reduce((a, id) => a + fishOdds(id, spot, b), 0) || 1;
    return rows
        .map(([id, o]) => ({ id, pct: Math.max(1, Math.round((o / tot) * 100)), boosted: !!(b && FISH[id].bait && FISH[id].bait.includes(b)) }))
        .sort((x, y) => y.pct - x.pct);
}
// le meilleur coin et le meilleur appât pour un poisson (pour « Aller pêcher » depuis une commande)
export function bestFor(id) {
    const f = FISH[id];
    if (!f) return null;
    const spot = (f.spots || ['bank']).find(spotOpen) || null;
    const bait = (f.bait || []).find(baitOpen) || null;
    return { spot, bait };
}
// un poisson qu'on peut demander dans une commande : courant, et son coin est ouvert
export const fishOrderOk = id => {
    const f = FISH[id];
    return !!f && !f.junk && f.odds >= 10 && pondOpen() && (f.spots || ['bank']).some(spotOpen);
};

// ---------------- la canne ----------------
export const rodNow = () => RODS[(state.pond && state.pond.rod) || 0];
export const rodNext = () => RODS[((state.pond && state.pond.rod) || 0) + 1] || null;
export function buyRod(at) {
    ensurePond();
    const r = rodNext();
    if (!r) return false;
    if (state.level < r.lvl) {
        toast(`${r.name} : niveau ${r.lvl}`, ['ui', 'rod']);
        sfx('error');
        return false;
    }
    const c = r.cost;
    if (state.money < c.coins || (state.inventory.tools || 0) < (c.tools || 0) || (state.inventory.plank || 0) < (c.plank || 0)) {
        toast(`Il faut ${fmt(c.coins)} pièces, ${c.tools} outils${c.plank ? ` et ${c.plank} planches` : ''}`, ['ui', 'rod']);
        sfx('error');
        return false;
    }
    spend(c.coins);
    state.inventory.tools -= c.tools || 0;
    if (c.plank) state.inventory.plank -= c.plank;
    state.pond.rod++;
    sfx('level');
    if (at) burst(at, 'sparkle', 14);
    toast(`${r.name} : la zone de ferrage s’élargit et les poissons sont plus lourds`, ['ui', 'rod']);
    return true;
}

// ---------------- le mini-jeu ----------------
// la partie de pêche en cours (jamais sauvegardée) : idle → wait → bite → reel
export const fishing = { phase: 'idle' };
const BITE_WINDOW = 1250;

export function fishPhase() {
    const f = fishing,
        t = now();
    if (f.phase === 'wait' && t >= f.biteAt) {
        f.phase = 'bite';
        f.id = pickFish(f.spot, f.bait);
        sfx('pop');
        buzz(25);
    }
    if (f.phase === 'bite' && t >= f.biteAt + BITE_WINDOW) {
        f.phase = 'idle';
        toast('Trop tard, il s’est sauvé !', ['ui', 'rod']);
        sfx('error');
    }
    return f.phase;
}

// la position du curseur (0 à 1) : chaque poisson se bat à sa façon
export function reelPos(t = now()) {
    const f = fishing,
        ph = ((t - f.t0) / 1000) * f.speed * 2.6;
    if (f.fight === 'zigzag') return (Math.sin(ph - Math.PI / 2 + 0.9 * Math.sin(ph * 0.7)) + 1) / 2;
    if (f.fight === 'dart') {
        // des à-coups, mais sans téléportation : le curseur file d'un côté à l'autre en un instant
        const k = ph / 2.4,
            i = Math.floor(k),
            fr = Math.min(1, (k - i) / 0.35);
        return (Math.sin(ph - Math.PI / 2 + 1.8 * (i + fr * fr * (3 - 2 * fr))) + 1) / 2;
    }
    return (Math.sin(ph - Math.PI / 2) + 1) / 2;
}
// la zone verte : un poisson qui tire fort l'emmène avec lui
export function zoneCenter(t = now()) {
    const f = fishing;
    if (f.fight !== 'pull') return f.center;
    const c = f.center + 0.18 * Math.sin(((t - f.t0) / 1000) * 1.3);
    return Math.min(1 - f.width / 2, Math.max(f.width / 2, c));
}
// la pêche rapide : un ver sur la berge, et les petits poissons sortent d'un seul geste
export const quickFish = () => fishing.spot === 'bank' && fishing.bait === 'worm';

export function fishAction(at) {
    const f = fishing;
    if (!pondOpen()) return;
    ensurePond();
    const phase = fishPhase();
    if (phase === 'idle') {
        if (barnBlocked()) return;
        const p = state.pond;
        f.spot = spotOpen(p.spot) ? p.spot : 'bank';
        f.bait = null;
        if (p.bait) {
            if (takeBait(p.bait)) f.bait = p.bait;
            else toast(`Plus de ${BAITS[p.bait].name.toLowerCase()} : vous pêchez sans appât`, BAITS[p.bait].icon);
        }
        f.phase = 'wait';
        f.biteAt = now() + 1800 + Math.random() * 4200;
        sfx('splash');
        buzz(6);
    } else if (phase === 'wait') {
        f.phase = 'idle';
        toast('Rien n’a mordu. Attendez le « ! » avant de ferrer.', ['ui', 'rod']);
        sfx('click');
    } else if (phase === 'bite') {
        if (FISH[f.id].small && quickFish()) {
            f.phase = 'idle';
            landFish(f.id, weighOf(f.id, f.spot, false), at, false);
        } else startReel();
    } else if (phase === 'reel') stopReel(at);
}

function startReel() {
    const f = fishing,
        F = FISH[f.id];
    f.phase = 'reel';
    f.width = Math.min(0.55, F.zone * rodNow().zone * (1 + rank('expert') * 0.1));
    f.center = f.width / 2 + Math.random() * (1 - f.width);
    f.t0 = now();
    f.speed = F.speed;
    f.fight = F.fight || 'calm';
    sfx('reel');
}

function weighOf(id, spot, perfect) {
    const [a, b] = FISH[id].w;
    let w = a + (b - a) * Math.pow(Math.random(), 1.8);
    w *= rodNow().weight * ((SPOTS[spot] && SPOTS[spot].weight) || 1) * (perfect ? 1.2 : 1);
    return Math.round(Math.min(w, b * 1.5) * 100) / 100;
}

function stopReel(at) {
    const f = fishing,
        F = FISH[f.id];
    const d = Math.abs(reelPos() - zoneCenter());
    f.phase = 'idle';
    if (d > f.width / 2) {
        toast(
            F.junk
                ? 'La botte est retombée à l’eau. Pas grave !'
                : `${fishArt(f.id) === 'une' ? 'La' : 'Le'} ${low(f.id)} s’est échappé${fishArt(f.id) === 'une' ? 'e' : ''}…`,
            ['item', f.id],
        );
        sfx('error');
        burst(at, 'water', 8);
        return false;
    }
    const perfect = d <= f.width * 0.2;
    return landFish(f.id, weighOf(f.id, f.spot, perfect), at, perfect);
}

// la taille d'une prise : petite, belle ou trophée
export function sizeOf(id, w) {
    const [a, b] = FISH[id].w;
    const r = (w - a) / (b - a);
    let s = SIZES[0];
    for (const x of SIZES) if (r >= x.at) s = x;
    return s;
}

// un poisson sorti de l'eau (à la canne)
export function landFish(id, w, at, perfect) {
    const F = FISH[id],
        p = state.pond;
    state.inventory[id]++;
    state.stats.fish = (state.stats.fish || 0) + 1;
    collect('f_' + id, w);
    if (perfect) {
        p.perfect++;
        state.stats.perfectFish = (state.stats.perfectFish || 0) + 1;
    }
    sfx(id === 'goldfish' ? 'golden' : 'harvest');
    buzz(20);
    burst(at, 'water', 12);
    burst(at, 'sparkle', id === 'goldfish' ? 20 : perfect ? 12 : 6, -10);
    const size = F.junk ? null : sizeOf(id, w);
    float(at, ['+1', ['item', id], F.junk ? '' : ' ' + kg(w), perfect ? ' · Parfait !' : ''], id === 'goldfish' || perfect ? 'gold' : '', -30);
    fly(at, id, 1);
    addXp(F.junk ? 2 : 8 + Math.round(F.sell / 12) + (perfect ? 4 : 0), at);
    if (id === 'goldfish') {
        toast('Un poisson doré ! Une prise de légende', ['item', 'goldfish']);
        emit('confetti');
    } else if (size && size.id === 'trophy') toast(`${F.name} de ${kg(w)} : un trophée !`, ['ui', 'medalG']);
    fishing.last = { id, w, perfect, size: size && size.id };
    if (!F.junk) {
        logStep(id, at);
        marcelCatch(id, w, perfect, 1);
        contestCatch(id, w);
        runCatch(id, w);
    }
    return true;
}

// ---------------- le carnet de pêche : récompenses à 10 et 50 prises ----------------
export const caught = id => (state.collection['f_' + id] ? state.collection['f_' + id].n : 0);
export const bestOf = id => (state.collection['f_' + id] ? state.collection['f_' + id].best || 0 : 0);
export const logReward = (id, n) => round5(FISH[id].sell * (n >= 50 ? 20 : 5));
function logStep(id, at) {
    const p = state.pond,
        n = caught(id);
    const step = LOG_STEPS.filter(x => x > 1 && n >= x).pop();
    if (!step || (p.log[id] || 0) >= step) return;
    p.log[id] = step;
    const coins = logReward(id, step);
    earn(coins, at);
    if (step >= 50) state.prestige.rubans++;
    toast(`Carnet de pêche : ${step} ${pluralName(id)} ! +${fmt(coins)} pièces${step >= 50 ? ' et un ruban' : ''}`, ['item', id]);
}
const pluralName = id => qtyName(2, FISH[id].name).replace(/^2 /, '');

// ---------------- les nasses ----------------
export const trapMax = () => (state.level >= TRAPS.lvl ? TRAPS.max(state.level) + trapBonus() + domStepSum('annex', 'trap') : 0);
export const trapReady = t => !!(t && t.start && now() >= t.start + TRAPS.every);
export const trapsReady = () => (state.pond ? state.pond.traps.filter(trapReady).length : 0);
export function buyTrap(at) {
    ensurePond();
    const p = state.pond,
        c = TRAPS.cost;
    if (p.traps.length >= trapMax()) return false;
    if (state.money < c.coins || (state.inventory.wood || 0) < c.wood || (state.inventory.nail || 0) < c.nail) {
        toast(`Une nasse : ${fmt(c.coins)} pièces, ${c.wood} bois et ${c.nail} clous`, ['ui', 'trap']);
        sfx('error');
        return false;
    }
    spend(c.coins);
    state.inventory.wood -= c.wood;
    state.inventory.nail -= c.nail;
    p.traps.push({ spot: spotOpen(p.spot) ? p.spot : 'bank', bait: null, start: 0 });
    sfx('build');
    if (at) burst(at, 'sparkle', 10);
    return true;
}
// poser une nasse dans un coin, avec ou sans appât
export function setTrap(i, spot, bait, at) {
    ensurePond();
    const t = state.pond.traps[i];
    if (!t || t.start || !spotOpen(spot)) return false;
    t.spot = spot;
    t.bait = bait && baitOpen(bait) && takeBait(bait) ? bait : null;
    t.start = now();
    sfx('splash');
    if (at) burst(at, 'water', 8);
    return true;
}
// ce qu'une nasse attrape : les poissons courants de son coin (les écrevisses adorent les nasses)
function trapPick(spot, bait) {
    const pool = Object.keys(FISH)
        .filter(id => !FISH[id].junk && !FISH[id].noTrap && (FISH[id].odds >= TRAPS.minOdds || FISH[id].trap))
        // trapAny : le poulpe se prend dans la nasse de jour comme de nuit
        .map(id => [
            id,
            (FISH[id].trapAny
                ? (FISH[id].spots || []).includes(spot)
                    ? FISH[id].odds * (bait && (FISH[id].bait || []).includes(bait) ? BAIT_MULT : 1)
                    : 0
                : fishOdds(id, spot, bait)) * (FISH[id].trap || 1),
        ])
        .filter(([, o]) => o > 0);
    if (!pool.length) return 'roach';
    let r = Math.random() * pool.reduce((a, [, o]) => a + o, 0);
    for (const [id, o] of pool) if ((r -= o) <= 0) return id;
    return pool[0][0];
}
export function haulTrap(i, at) {
    const p = ensurePond(),
        t = p.traps[i];
    if (!trapReady(t)) return false;
    const n = Math.min(TRAPS.catch[0] + Math.floor(Math.random() * (TRAPS.catch[1] - TRAPS.catch[0] + 1)), Math.max(0, Math.floor(barnSpace())));
    if (n <= 0) {
        barnBlocked();
        return false;
    }
    const got = {};
    for (let k = 0; k < n; k++) {
        const id = trapPick(t.spot, t.bait);
        got[id] = (got[id] || 0) + 1;
    }
    for (const [id, q] of Object.entries(got)) {
        state.inventory[id] += q;
        state.stats.fish = (state.stats.fish || 0) + q;
        for (let k = 0; k < q; k++) collect('f_' + id);
        logStep(id, at);
        marcelCatch(id, 0, false, q);
        if (at) fly(at, id, q);
    }
    addXp(4 * n, at);
    if (at)
        float(
            at,
            Object.entries(got).flatMap(([id, q]) => [`+${q}`, ['item', id]]),
            '',
            -30,
        );
    sfx('harvest');
    buzz(15);
    // on la repose aussitôt, avec le même appât s'il en reste
    const bait = t.bait && takeBait(t.bait) ? t.bait : null;
    Object.assign(t, { bait, start: now() });
    return got;
}
export function haulAllTraps(at) {
    let any = false;
    ensurePond().traps.forEach((t, i) => trapReady(t) && haulTrap(i, at) && (any = true));
    return any;
}

// ---------------- les défis de Marcel : un par jour ----------------
const dayKey = (t = now()) => {
    const d = new Date(t);
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
};
export const marcelOpen = () => state.level >= MARCEL.lvl;
function seedRand(seed) {
    let a = seed >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}
const hashStr = s => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) | 0, 7);
// les poissons qu'on peut demander : leur coin est ouvert, ils ne sont ni légendaires ni trop rares
const challengeFish = () => Object.keys(FISH).filter(id => !FISH[id].junk && FISH[id].odds >= 10 && (FISH[id].spots || []).some(spotOpen));

function newMarcel(day) {
    const rnd = seedRand(hashStr(day + ':' + state.level));
    const list = challengeFish();
    const id = list[Math.floor(rnd() * list.length)] || 'roach';
    const F = FISH[id],
        r = rnd();
    const k = hashStr(day) % 3 === 0;
    if (r < 0.15) return { day, kind: 'perfect', need: 3, got: 0, done: false, claimed: false, flies: k };
    if (r < 0.55 || F.trap) {
        const need = F.small ? 6 : F.odds >= 14 ? 3 : 2;
        return { day, kind: 'count', id, need, got: 0, done: false, claimed: false, flies: k };
    }
    const [a, b] = F.w;
    const min = Math.round((a + (b - a) * 0.45) * 10) / 10;
    return { day, kind: 'weight', id, min, need: 1, got: 0, done: false, claimed: false, flies: k };
}
export function ensureMarcel() {
    if (!marcelOpen()) return null;
    const p = ensurePond(),
        day = dayKey();
    if (!p.marcel || p.marcel.day !== day) p.marcel = newMarcel(day);
    return p.marcel;
}
export function marcelText(m = ensureMarcel()) {
    if (!m) return '';
    if (m.kind === 'perfect') return `${m.need} prises parfaites à la canne (la touche au cœur de la zone verte)`;
    if (m.kind === 'count') return `${qtyName(m.need, FISH[m.id].name)} aujourd’hui`;
    return `${fishArt(m.id) === 'une' ? 'Une' : 'Un'} ${low(m.id)} de plus de ${kg(m.min)}`;
}
export const marcelReward = () => ({ coins: round5(MARCEL.coins(state.level)), xp: MARCEL.xp(state.level) });
function marcelCatch(id, w, perfect, q) {
    const m = state.pond && state.pond.marcel;
    if (!m || m.done || m.day !== dayKey()) return;
    if (m.kind === 'perfect' && perfect) m.got++;
    else if (m.kind === 'count' && m.id === id) m.got += q;
    else if (m.kind === 'weight' && m.id === id && w >= m.min) m.got = 1;
    if (m.got >= m.need) {
        m.got = m.need;
        m.done = true;
        if (view.started) toast('Défi de Marcel réussi ! Venez chercher votre récompense à l’étang', ['villager', 'marcel']);
    }
}
export const marcelReady = () => !!(marcelOpen() && state.pond && state.pond.marcel && state.pond.marcel.done && !state.pond.marcel.claimed);
export function claimMarcel(at) {
    const m = state.pond && state.pond.marcel;
    if (!m || !m.done || m.claimed) return false;
    m.claimed = true;
    const r = marcelReward();
    earn(r.coins, at);
    addXp(r.xp, at);
    addFriendship('marcel', MARCEL.hearts, at);
    if (m.flies) state.pond.flies += MARCEL.flies;
    state.stats.marcelDone = (state.stats.marcelDone || 0) + 1;
    sfx('level');
    toast(`Marcel : « Pas mal, pour un fermier ! »${m.flies ? ` +${MARCEL.flies} mouches` : ''}`, ['villager', 'marcel']);
    return true;
}

// ---------------- la remontée des saumons ----------------
export const runOpen = () => spotOpen('pier');
export function runState() {
    if (!runOpen() || !salmonRun()) return null;
    const p = ensurePond(),
        key = yearKey();
    if (p.run.key !== key) p.run = { key, warned: p.run.warned ?? null, done: false, claimed: false };
    return p.run;
}
export const runReward = () => ({ coins: round5(MARCEL.coins(state.level) * 3), xp: MARCEL.xp(state.level) * 2 });
function runCatch(id, w) {
    const r = runState();
    if (!r || r.done || id !== 'salmon' || w < SALMON_RUN.minKg) return;
    r.done = true;
    toast('Un saumon de plus de 5 kg pendant la remontée ! Marcel n’en revient pas', ['item', 'salmon']);
}
export const runReady = () => {
    const r = runState();
    return !!(r && r.done && !r.claimed);
};
export function claimRun(at) {
    const r = runState();
    if (!r || !r.done || r.claimed) return false;
    r.claimed = true;
    const g = runReward();
    earn(g.coins, at);
    addXp(g.xp, at);
    addFriendship('marcel', MARCEL.hearts * 2, at);
    sfx('level');
    emit('confetti');
    return true;
}

// ---------------- le concours de pêche du week-end ----------------
export const fishContestOpen = () => state.level >= FISH_CONTEST.lvl;
const localDay = (t = now()) => Math.floor((t - new Date(t).getTimezoneOffset() * 60000) / 86400000);
// les semaines commencent le lundi (le 1er janvier 1970 était un jeudi)
export const fishWeek = (t = now()) => Math.floor((localDay(t) + 3) / 7);
export const isWeekend = (t = now()) => [0, 6].includes(new Date(t).getDay());
// la fin du week-end en cours (lundi 0 h, heure locale)
export function weekendEnd(t = now()) {
    const d = new Date(t);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + (d.getDay() === 0 ? 1 : 8 - d.getDay()));
    return d.getTime();
}
const contestPool = () =>
    Object.keys(FISH).filter(
        id => !FISH[id].junk && !FISH[id].small && !FISH[id].trap && FISH[id].odds >= 10 && (FISH[id].spots || []).some(x => x !== 'pier' && spotOpen(x)),
    );
export const contestFish = (week = fishWeek()) => {
    const list = contestPool();
    return list[(week * 7) % list.length];
};
// les fermes voisines : leur plus belle prise de la semaine (toujours la même pour une semaine donnée).
// 1.39 : elles pêchent par sorties pendant le week-end, chacune à ses heures : leur record monte par à-coups,
// et la plus belle prise peut tomber le dimanche soir.
export function rivalCatches(c, k) {
    const [a, b] = FISH[c.id].w;
    const end = weekendEnd(c.endAt ? c.endAt - 1 : c.startAt || now());
    const start = end - 2 * 864e5;
    const r = RIVALS[k];
    const rnd = seedRand(c.week * 1000 + k);
    const frac = Math.min(0.97, Math.max(0.2, 0.3 + rnd() * 0.5 + (r.f - 0.75) * 0.25));
    const hours = (RIVAL_STYLE[k] || RIVAL_STYLE[0]).hours;
    const slots = [0, 1].flatMap(d => hours.map(h => start + d * 864e5 + h * 3600e3 + (rnd() - 0.5) * 3600e3));
    const n = Math.min(slots.length, 3 + Math.floor(rnd() * 3));
    const picked = slots
        .sort(() => rnd() - 0.5)
        .slice(0, n)
        .sort((x, y) => x - y);
    const best = Math.floor(rnd() * n);
    return picked.map((t, i) => ({ t, w: Math.round((a + (b - a) * frac * (i === best ? 1 : 0.7 + rnd() * 0.25)) * 100) / 100 }));
}
export function rivalsOf(c, t = now()) {
    return RIVALS.map((r, k) => {
        const got = rivalCatches(c, k).filter(x => x.t <= t);
        return { name: r.name, owner: r.owner, avatar: r.avatar, w: got.length ? Math.max(...got.map(x => x.w)) : 0 };
    });
}
export function contestRank(c, t) {
    if (!c.best) return 0;
    return 1 + rivalsOf(c, t).filter(r => r.w > c.best).length;
}
export function contestTickPond() {
    if (!fishContestOpen()) return false;
    const p = ensurePond(),
        wk = fishWeek();
    let changed = false;
    // le week-end est fini : on fige le classement
    if (p.contest && p.contest.week !== wk) {
        const c = p.contest;
        const end = weekendEnd(c.startAt || 0);
        if (c.best > 0)
            p.lastContest = { ...c, endAt: end, rank: contestRank({ ...c, endAt: end }, end), rivals: rivalsOf({ ...c, endAt: end }, end), seen: false };
        p.contest = null;
        changed = true;
    }
    if (!p.contest && isWeekend()) {
        p.contest = { week: wk, id: contestFish(wk), best: 0, startAt: now() };
        if (view.started && pondOpen()) toast(`Concours de pêche ce week-end : ${heaviest(p.contest.id)} !`, ['item', p.contest.id]);
        changed = true;
    }
    return changed;
}
function contestCatch(id, w) {
    const c = state.pond && state.pond.contest;
    if (!c || c.id !== id || !isWeekend() || c.week !== fishWeek()) return;
    if (w > c.best) c.best = w;
}
export const contestPrize = rank => {
    const pz = FISH_CONTEST.prize[rank - 1];
    return { coins: pz ? round5(pz.coins(state.level)) : 0, rubans: pz ? pz.rubans : 0, xp: FISH_CONTEST.xp(state.level) };
};
export const contestResultReady = () => !!(state.pond && state.pond.lastContest && !state.pond.lastContest.seen);
export function claimContest(at) {
    const c = state.pond && state.pond.lastContest;
    if (!c || c.seen) return false;
    c.seen = true;
    const g = contestPrize(c.rank);
    if (g.coins) earn(g.coins, at);
    if (g.rubans) state.prestige.rubans += g.rubans;
    addXp(g.xp, at);
    if (c.rank === 1) {
        state.stats.fishContests = (state.stats.fishContests || 0) + 1;
        emit('confetti');
    }
    sfx(c.rank <= 3 ? 'level' : 'pop');
    return true;
}

// ---------------- à chaque seconde : Marcel prévient de la remontée, le concours ----------------
export function pondTick() {
    if (!pondOpen()) return false;
    const p = ensurePond();
    let changed = contestTickPond();
    ensureMarcel();
    // la veille de la remontée des saumons, Marcel prévient
    if (runOpen() && season().id === 'automne' && dayInSeason() === SALMON_RUN.from - 1 && p.run.warned !== yearKey()) {
        p.run.warned = yearKey();
        if (view.started) toast('Marcel : « Demain, les saumons remontent la rivière ! Venez au ponton avec des mouches. »', ['villager', 'marcel']);
        changed = true;
    }
    return changed;
}
