// Les grands défis (1.1) : après le niveau 50, un défi de 14 jours tiré au hasard parmi dix-sept, 4 étapes, une médaille.
import { state, lvOk } from '../core/state.js';
import { now } from '../core/clock.js';
import { view } from '../core/view.js';
import { fmt, qtyName } from '../core/format.js';
import { emit, toast, sfx, buzz, burst } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { DECOS } from '../data/farm.js';
import { VILLAGERS } from '../data/village.js';
import { RENOWN_XP } from '../data/progress.js';
import { DEFI, DEFIS } from '../data/defis.js';
import { earn, addXp } from './player.js';
import { clampQuality, qual, qCount } from './farm.js';
import { questPool } from './orders.js';
import { trainOpen } from './orders.js';
import { hasMachine } from './workshop.js';
import { storyOk } from './story.js';
import { islandOpen } from './island.js';
import { caveOpen, hallOpen } from './cave.js';
import { pondOpen, fishOrderOk } from './fishing.js';
import { depthOpen } from './nature.js';
import { DEPTHS } from '../data/nature.js';
import { netOpen, boatOpen, transOpen } from './port.js';
import { breedOpen, plantLabOpen, labOpen, animalGain, flavorGain, varieties, varName } from './genetics.js';
import { addPhoto } from './style.js';
import { tip } from './tips.js';

const DAY = 24 * 3600 * 1000;

export function ensureDefis() {
    if (!state.defis) state.defis = { cur: null, recent: [], trophies: {}, next: 0 };
    return state.defis;
}
export const defiOpen = () => state.level >= DEFI.lvl;
export const defiScale = () => Math.min(DEFI.maxScale, 1 + DEFI.perStar * (state.renown || 0));
export const curDefi = () => (state.defis && state.defis.cur) || null;

// ---------------- ce qui est ouvert ----------------
const PARTS = {
    breed: () => breedOpen(),
    island: () => islandOpen(),
    cave: () => caveOpen(),
    train: () => trainOpen(),
    lab: () => plantLabOpen() && labOpen(),
    net: () => netOpen(),
    trans: () => transOpen(),
    soap: () => hasMachine('soapworks') || hasMachine('perfumery'),
    hall: () => hallOpen(),
    boat: () => boatOpen(),
    brew: () => hasMachine('brewery'),
    counter: () => hasMachine('counter'),
    pond: () => pondOpen(),
    gallery: () => depthOpen('gallery'),
    wine: () => hasMachine('winery'),
    cannery: () => hasMachine('cannery'),
    perfumery: () => hasMachine('perfumery'),
};
const partOk = k => !k || (PARTS[k] ? PARTS[k]() : true);

// un produit qu'on peut se procurer maintenant (ou avec ses arbres, ou les matériaux)
let poolMemo = null;
export function canGet(id) {
    const i = ITEMS[id];
    if (!i) return false;
    if (['material', 'rare'].includes(i.type) || id === 'crate') return true;
    if (id === 'lobster') return netOpen();
    if (i.type === 'fish') return fishOrderOk(id);
    if (i.type === 'ore' || i.type === 'gem') return Object.values(DEPTHS).some(d => depthOpen(d.id) && [...d.ores, ...d.gems].some(([x]) => x === id));
    if (i.type === 'tree') return lvOk(i) && storyOk(i) && (!i.island || islandOpen());
    if (!poolMemo || poolMemo.t !== now()) poolMemo = { t: now(), ids: new Set(questPool().map(x => x.id)) };
    return poolMemo.ids.has(id);
}

// l'étape réellement jouée (remplacée si elle demande une partie fermée)
const stepDef = s => ((s.needs && !partOk(s.needs)) || (s.alt && s.kind === 'give' && !s.pool.some(canGet)) ? s.alt : s);
const shuffle = list =>
    list
        .map(x => [Math.random(), x])
        .sort((a, b) => a[0] - b[0])
        .map(x => x[1]);
const FIXED = new Set(['lobster']);

export function defiEligible(id) {
    const d = DEFIS[id];
    if (!partOk(d.open)) return false;
    return d.steps.map(stepDef).every(s => s.kind !== 'give' || s.pool.some(canGet));
}

function buildStep(s0) {
    const s = stepDef(s0);
    const k = defiScale();
    const st = { kind: s.kind, name: s.name, done: false };
    if (s.kind === 'give') {
        const ok = s.pool.filter(canGet);
        st.q = s.q || 0;
        st.items = shuffle(ok.length ? ok : s.pool.filter(x => ITEMS[x]))
            .slice(0, s.k)
            .map(id => ({ id, n: FIXED.has(id) ? s.n : Math.round(s.n * k), got: 0 }));
    } else if (s.kind === 'count') {
        Object.assign(st, { stat: s.stat, n: s.n <= 1 ? s.n : Math.round(s.n * k), base: state.stats[s.stat] || 0, icon: s.icon, text: s.text });
    } else if (s.kind === 'beer') {
        Object.assign(st, { n: Math.min(3, s.n + Math.floor((state.renown || 0) / 20)), text: s.text });
    } else {
        Object.assign(st, { n: s.n + Math.floor((state.renown || 0) / 10), text: s.text });
    }
    return st;
}

// ---------------- tirage ----------------
export function drawDefi() {
    const D = ensureDefis();
    const ids = Object.keys(DEFIS).filter(defiEligible);
    let pool = ids.filter(id => !D.recent.includes(id));
    if (!pool.length) pool = ids.filter(id => id !== D.recent[D.recent.length - 1]);
    if (!pool.length) pool = ['chateau'];
    return pool[Math.floor(Math.random() * pool.length)];
}

export function startDefi(id = drawDefi(), t = now()) {
    const D = ensureDefis();
    D.cur = { id, start: t, end: t + DEFI.days * DAY, steps: DEFIS[id].steps.map(buildStep), awarded: 0 };
    D.recent.push(id);
    while (D.recent.length > DEFI.noRepeat) D.recent.shift();
    D.next = 0;
    if (view.started) {
        tip('defis');
        toast(`Nouveau grand défi : ${DEFIS[id].name} !`, ['villager', DEFIS[id].who]);
        sfx('level');
    }
    return D.cur;
}

// ---------------- les étapes ----------------
// ce qu'on a en stock pour une qualité demandée (0 : tout, 1 : argent ou mieux, 2 : or ou mieux)
export function haveQ(id, q) {
    const inv = state.inventory[id] || 0;
    if (!q) return inv;
    clampQuality(id);
    return Math.min(inv, qCount(qual(id), q));
}
// retire n produits : les ordinaires d'abord quand la qualité ne compte pas, puis le plus bas rang qui convient
export function takeQ(id, n, q) {
    clampQuality(id);
    const o = qual(id);
    let left = n;
    if (!q) {
        const plain = Math.max(0, (state.inventory[id] || 0) - qCount(o));
        left -= Math.min(plain, left);
    }
    for (const [r, k] of [
        [1, 's'],
        [2, 'g'],
        [3, 'p'],
        [4, 'd'],
    ]) {
        if (left <= 0) break;
        if (r < q) continue;
        const t = Math.min(o[k], left);
        o[k] -= t;
        left -= t;
    }
    state.inventory[id] -= n;
}

export const stepCount = st =>
    st.kind === 'give'
        ? st.items.reduce((a, x) => a + x.got, 0)
        : st.kind === 'count'
          ? Math.max(0, Math.min(st.n, (state.stats[st.stat] || 0) - st.base))
          : st.done
            ? 1
            : 0;
export const stepTotal = st => (st.kind === 'give' ? st.items.reduce((a, x) => a + x.n, 0) : st.kind === 'count' ? st.n : 1);
export const stepFrac = st => (st.done ? 1 : stepCount(st) / stepTotal(st));
export const stepsDone = (d = curDefi()) => (d ? d.steps.filter(s => s.done).length : 0);
export const medalOf = n => (n >= 4 ? 3 : n === 3 ? 2 : n === 2 ? 1 : 0);
export const defiLeft = (d = curDefi()) => (d ? Math.max(0, d.end - now()) : 0);

// peut-on livrer quelque chose pour cette étape ?
export const canGive = st => st.kind === 'give' && !st.done && st.items.some(x => x.got < x.n && haveQ(x.id, st.q) > 0);
export const animalCandidates = () => state.animals.filter(a => a.g).map(a => ({ a, score: animalGain(a) }));
export const varietyCandidates = () => (state.genetics ? varieties().map(v => ({ v, score: Math.round(flavorGain(v.g) * 10) / 10 })) : []);
export const beerCandidates = () =>
    state.brew && state.brew.beers
        ? Object.values(state.brew.beers)
              .filter(b => b.stars > 0 && (b.made || 0) > 0)
              .map(b => ({ b, score: b.stars }))
        : [];
export const canPresent = st =>
    !st.done &&
    ((st.kind === 'animal' && animalCandidates().some(c => c.score >= st.n)) ||
        (st.kind === 'variety' && varietyCandidates().some(c => c.score >= st.n)) ||
        (st.kind === 'beer' && beerCandidates().some(c => c.score >= st.n)));
// nombre d'étapes où l'on peut agir tout de suite (pastille)
export const defiReady = () => {
    const d = curDefi();
    if (!d || d.awarded || !defiOpen()) return 0;
    return d.steps.filter(st => canGive(st) || canPresent(st)).length;
};

function finishStep(st, at) {
    if (st.done) return;
    st.done = true;
    const k = defiScale();
    earn(Math.round(DEFI.stepCoins * k), at);
    addXp(Math.round(DEFI.stepXp * k), at);
    if (view.started) {
        toast(`Étape réussie : ${st.name} (${stepsDone()} / 4)`, ['ui', 'trophy']);
        sfx('golden');
        buzz(30);
        burst(at, 'sparkle', 16);
    }
    if (stepsDone() >= 4) award(3);
}

export function giveDefi(k, at) {
    const d = curDefi();
    const st = d && d.steps[k];
    if (!st || st.kind !== 'give' || st.done) return false;
    let gave = 0;
    st.items.forEach(x => {
        const n = Math.min(x.n - x.got, haveQ(x.id, st.q));
        if (n > 0) {
            takeQ(x.id, n, st.q);
            x.got += n;
            gave += n;
        }
    });
    if (!gave) {
        toast(
            st.q === 2 ? 'Il faut des produits de qualité or' : st.q === 1 ? 'Il faut des produits de qualité argent ou or' : 'Rien à livrer pour le moment',
            ['ui', 'trophy'],
        );
        return false;
    }
    sfx('coin');
    if (st.items.every(x => x.got >= x.n)) finishStep(st, at);
    return true;
}

export function presentDefi(k, ref, at) {
    const d = curDefi();
    const st = d && d.steps[k];
    if (!st || st.done) return false;
    const c =
        st.kind === 'animal'
            ? animalCandidates().find(x => x.a.uid === ref)
            : st.kind === 'beer'
              ? beerCandidates().find(x => x.b.id === ref)
              : varietyCandidates().find(x => x.v.id === ref);
    if (!c || c.score < st.n) {
        toast('Le jury attend mieux : il faut plus de points', ['ui', 'trophy']);
        return false;
    }
    st.who = st.kind === 'animal' ? c.a.name : st.kind === 'beer' ? c.b.name : varName(c.v);
    finishStep(st, at);
    return true;
}

// ---------------- médailles ----------------
function award(medal) {
    const D = ensureDefis(),
        d = D.cur;
    if (!d || d.awarded || !medal) return;
    d.awarded = medal;
    const M = DEFI.medals[medal - 1],
        def = DEFIS[d.id],
        k = defiScale();
    const t = (D.trophies[d.id] = D.trophies[d.id] || { best: 0, n: 0, gold: 0 });
    const firstGold = medal === 3 && !t.gold;
    t.best = Math.max(t.best, medal);
    t.n++;
    if (medal === 3) t.gold++;
    const coins = Math.round(M.coins * k);
    earn(coins);
    addXp(Math.round(RENOWN_XP * M.star));
    state.prestige.rubans += M.rubans;
    if (firstGold) state.decorInv[def.deco] = (state.decorInv[def.deco] || 0) + 1;
    state.stats.defis = (state.stats.defis || 0) + 1;
    addPhoto('ui', 'trophy', def.name, `Médaille ${M.name.toLowerCase()}`);
    if (!view.started) return;
    emit('celebrate', {
        icon: ['ui', 'trophy'],
        title: `Médaille ${M.name.toLowerCase()} : ${def.name} !`,
        sub: `${VILLAGERS[def.who].name} vous remercie au nom de toute la vallée.`,
        lines: [
            [['ui', 'coin'], `${fmt(coins)} pièces`],
            [['ui', 'star'], M.star >= 1 ? '1 étoile de renommée' : M.star >= 0.5 ? 'une demi-étoile de renommée' : 'un quart d’étoile de renommée'],
            ...(M.rubans ? [[['ui', 'ribbon'], `${M.rubans} ruban${M.rubans > 1 ? 's' : ''}`]] : []),
            ...(firstGold ? [[['ui', def.deco], `Décoration unique : ${DECOS[def.deco].name}`]] : []),
        ],
    });
    sfx('level');
}

function endDefi(t) {
    const D = ensureDefis(),
        d = D.cur;
    if (!d.awarded) {
        const m = medalOf(stepsDone(d));
        if (m) award(m);
        else if (view.started) toast(`Le grand défi « ${DEFIS[d.id].name} » est terminé. Le prochain arrive !`, ['ui', 'trophy']);
    }
    D.cur = null;
    startDefi(drawDefi(), t);
}

// une seconde de jeu : les compteurs avancent, le défi se termine à sa date
export function defiTick() {
    if (!defiOpen()) return false;
    const D = ensureDefis();
    const t = now();
    if (!D.cur) {
        startDefi(drawDefi(), t);
        return true;
    }
    const d = D.cur;
    let changed = false;
    if (!d.awarded)
        d.steps.forEach(st => {
            if (st.kind === 'count' && !st.done && stepCount(st) >= st.n) {
                finishStep(st);
                changed = true;
            }
        });
    if (t >= d.end) {
        endDefi(t);
        changed = true;
    }
    return changed;
}

// quantité gardée pour le défi (le marché ne la vend pas)
export function defiNeed(id) {
    const d = curDefi();
    if (!d || d.awarded) return 0;
    return d.steps.reduce((a, st) => a + (st.kind === 'give' && !st.done ? st.items.filter(x => x.id === id).reduce((b, x) => b + x.n - x.got, 0) : 0), 0);
}
export function defiWanted() {
    const d = curDefi();
    if (!d || d.awarded) return [];
    return d.steps.flatMap(st => (st.kind === 'give' && !st.done ? st.items.filter(x => x.got < x.n).map(x => x.id) : []));
}

// texte court d'une étape (carte et fiche)
export function stepText(st) {
    if (st.kind === 'give') {
        const q = st.q === 2 ? ' en or' : st.q === 1 ? ' en argent ou or' : '';
        return `Livrer ${st.items.map(x => qtyName(x.n, ITEMS[x.id].name)).join(', ')}${q}`;
    }
    return st.text.replace('{n}', fmt(st.n));
}
