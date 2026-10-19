// Le livre de la ferme : collection, pages, et les chiffres des statistiques.
import { state, scaleLvl } from '../core/state.js';
import { view } from '../core/view.js';
import { fmt, fmtTime } from '../core/format.js';
import { emit, toast, sfx, buzz, burst } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { MACHINES, RECIPES } from '../data/machines.js';
import { VILLAGERS } from '../data/village.js';
import { EVENTS } from '../data/world.js';
import { CAVE_ITEMS, CAVE_FAMILIES, VINTAGES } from '../data/cave.js';
import { CARNET } from '../data/carnet.js';
import { ANIMALS } from '../data/animals.js';
import { BOOK_PAGES, TREASURES, FISH, RECORDS } from '../data/meta.js';
import { RARE } from '../data/commerce.js';
import { BOOK_QUARTERS, MASTERY_NAMES } from '../data/progress.js';
import { seedList } from './farm.js';
import { earn, claimableCount } from './player.js';
import { legendReady, masteryCount, masteryStars } from './mastery.js';
import { carnetOpen } from './carnet.js';
import { beerOf, beerPrice } from './brewery.js';
import { flavorGain, stability } from './genetics.js';
import { addPhoto } from './style.js';

export const entryReward = () => Math.round(40 + scaleLvl() * 10);
export const pageReward = () => Math.round((1500 * (1 + scaleLvl() * 0.2)) / 10) * 10;

// les entrées d'une page : [{ key, icon, name, hint, kind, id, star?, fish?, found? }]
const MACH_PAGE = {};
BOOK_PAGES.forEach(p => (p.machines || []).forEach(m => (MACH_PAGE[m] = p.id)));
const recipeEntries = pid =>
    Object.values(RECIPES)
        .filter(r => (MACH_PAGE[r.machine] || 'pantry') === pid && ITEMS[r.id])
        .map(r => ({
            key: 'k_' + r.id,
            kind: 'item',
            id: r.id,
            icon: ['item', r.id],
            name: ITEMS[r.id].name,
            hint: r.teacher
                ? `Recette de ${VILLAGERS[r.teacher].name}`
                : r.fete
                  ? `Plat de fête : ${EVENTS[r.fete].name}`
                  : `${MACHINES[r.machine].name}, niveau ${r.lvl}`,
        }));
const WINES = Object.keys(CAVE_ITEMS).filter(id => ['wine', 'champagne'].includes(CAVE_ITEMS[id]));
const ENTRIES = {
    garden: () =>
        seedList().map(i => ({
            key: 'g_' + i.id,
            kind: 'item',
            id: i.id,
            icon: ['item', i.id],
            name: i.name,
            hint: 'Récoltez-en une de qualité or',
            star: true,
        })),
    orchard: () =>
        Object.values(ITEMS)
            .filter(i => i.type === 'tree')
            .map(i => ({ key: 'o_' + i.id, kind: 'item', id: i.id, icon: ['item', i.id], name: i.name, hint: 'Ramassez-en un fruit au verger' })),
    varieties: () =>
        state.genetics
            ? Object.values(state.genetics.vars).map(v => ({
                  key: 'v_' + v.id,
                  kind: 'variety',
                  id: v.id,
                  icon: ['item', v.base],
                  name: v.name || v.auto,
                  hint: '',
                  found: true,
                  star: !!v.fixed,
              }))
            : [],
    fish: () => Object.entries(FISH).map(([id, f]) => ({ key: 'f_' + id, kind: 'fish', id, icon: ['item', id], name: f.name, hint: f.hint, fish: !f.junk })),
    beers: () =>
        state.brew && state.brew.beers
            ? Object.values(state.brew.beers)
                  .filter(b => (b.made || 0) > 0)
                  .map(b => ({ key: 'b_' + b.id, kind: 'beer', id: b.id, icon: ['ui', 'beer'], name: b.name, hint: '', found: true, star: b.stars >= 3 }))
            : [],
    vintages: () =>
        WINES.flatMap(id =>
            VINTAGES.map((v, q) => ({
                key: `cv_${id}_${q}`,
                kind: 'vintage',
                id,
                q,
                icon: ['item', id],
                name: `${ITEMS[id].name} · ${v.name.toLowerCase()}`,
                hint: 'Sortez de la cave un lot de ce millésime',
                star: q >= 2,
            })),
        ),
    treasure: () => [
        ...TREASURES,
        ...Object.values(ITEMS)
            .filter(i => i.type === 'ore')
            .map(i => ({ key: 'm_' + i.id, kind: 'item', id: i.id, icon: ['item', i.id], name: i.name, hint: 'Dans la mine, selon la profondeur' })),
    ],
    races: () =>
        state.genetics
            ? Object.values(state.genetics.races).map(r => ({
                  key: 'r_' + r.id,
                  kind: 'race',
                  id: r.id,
                  icon: ['animal', r.type],
                  name: r.name,
                  hint: '',
                  found: true,
              }))
            : [],
    cave: () =>
        Object.keys(CAVE_ITEMS).map(id => ({
            key: 'cave_' + id,
            kind: 'item',
            id: id === 'beer' ? null : id,
            icon: id === 'beer' ? ['ui', 'beer'] : ['item', id],
            name: id === 'beer' ? 'Bière de garde' : ITEMS[id].name,
            hint: `Sortez-en un lot au moins « ${CAVE_FAMILIES[CAVE_ITEMS[id]].ranks[3]} »`,
            star: true,
        })),
};
export const BOOK = BOOK_PAGES.map(p => ({ ...p, entries: ENTRIES[p.id] || (() => recipeEntries(p.id)) }));
export const allEntries = () => BOOK.flatMap(p => p.entries());
const staticEntries = () => BOOK.filter(p => !p.dyn).flatMap(p => p.entries());
export const isFound = e => !!(e.found || state.collection[e.key]);
export const pageFound = p => p.entries().filter(isFound).length;

// ---------------- paliers d'une page ----------------
// pages ordinaires : 25, 50, 75 et 100 % de leurs entrées ; pages qui grandissent avec la partie : des nombres fixes
export const pageCount = p => (p.id === 'varieties' ? (state.genetics ? Object.values(state.genetics.vars).filter(v => v.fixed).length : 0) : pageFound(p));
export const pageGoal = (p, k) => (p.abs ? p.abs[k] : Math.max(1, Math.ceil(p.entries().length * BOOK_QUARTERS[k])));
export const pageDone = p => pageCount(p) >= pageGoal(p, 3);
export const pageTiersGot = p => (state.bookTiers[p.id] || []).filter(Boolean).length + (state.pagesDone[p.id] ? 1 : 0);
export const pageTierReady = (p, k) => k < 3 && !(state.bookTiers[p.id] || [])[k] && pageCount(p) >= pageGoal(p, k);
export const pageTierReward = k => ({ coins: Math.round((pageReward() * [0.3, 0.4, 0.5][k]) / 10) * 10, item: [null, ['hardwood', 10], ['solidOak', 2]][k] });
export const pageReadyCount = p => [0, 1, 2].filter(k => pageTierReady(p, k)).length + (pageDone(p) && !state.pagesDone[p.id] ? 1 : 0);

export function collect(key, weight) {
    const c = state.collection[key];
    if (c) {
        c.n++;
        if (weight && weight > (c.best || 0)) {
            c.best = weight;
            if (view.started) toast(`Nouveau record : ${weight.toString().replace('.', ',')} kg !`, ['ui', 'trophy']);
        }
        return;
    }
    state.collection[key] = { n: 1, best: weight || 0, day: state.day };
    if (!view.started) return;
    const e = allEntries().find(x => x.key === key);
    const r = entryReward();
    state.money += r;
    state.stats.earned += r;
    state.stats.earnedRun += r;
    toast(`Nouveau dans le livre : ${e ? e.name : ''} (+${r} pièces)`, ['ui', 'book']);
    sfx('pop');
}

// les produits déjà maîtrisés avant le Grand livre y entrent sans fanfare (ni récompense à l'unité)
export function syncBook() {
    for (const p of BOOK) {
        if (p.dyn || p.id === 'fish' || p.id === 'cave' || p.id === 'vintages') continue;
        for (const e of p.entries())
            if (e.id && !state.collection[e.key] && (p.id === 'garden' ? false : masteryCount(e.id) > 0))
                state.collection[e.key] = { n: masteryCount(e.id), best: 0, day: 0 };
    }
}

export const bookClaimable = () => BOOK.reduce((n, p) => n + pageReadyCount(p), 0);

export function claimPageTier(id, k, at) {
    const page = BOOK.find(p => p.id === id);
    if (!page || !pageTierReady(page, k)) return false;
    (state.bookTiers[id] = state.bookTiers[id] || [])[k] = true;
    const r = pageTierReward(k);
    earn(r.coins, at);
    if (r.item) state.inventory[r.item[0]] = (state.inventory[r.item[0]] || 0) + r.item[1];
    sfx('level');
    buzz(20);
    burst(at, 'sparkle', 10);
    toast(
        `Page « ${page.name} » à ${BOOK_QUARTERS[k] * 100} % : +${fmt(r.coins)} pièces${r.item ? ` et ${r.item[1]} ${ITEMS[r.item[0]].name.toLowerCase()}` : ''}`,
        ['ui', 'book'],
    );
    return true;
}

export function claimPage(id, at) {
    const page = BOOK.find(p => p.id === id);
    if (!page || !pageDone(page) || state.pagesDone[page.id]) return false;
    state.pagesDone[page.id] = true;
    state.prestige.rubans++;
    earn(pageReward(), at);
    sfx('level');
    buzz(30);
    burst(at, 'sparkle', 18);
    emit('confetti');
    toast(`Page « ${page.name} » complétée : +1 ruban de concours`, ['ui', 'ribbon']);
    return true;
}

// ---------------- la fiche d'une entrée ----------------
export function entryInfo(key) {
    const e = allEntries().find(x => x.key === key);
    if (!e) return null;
    const c = state.collection[key] || { n: 0, best: 0 };
    const info = { e, found: isFound(e), counters: null, lines: [], anecdote: null, stars: 0 };
    const day = c.day ? `jour ${c.day}` : null;
    if (!info.found) return info;
    if (e.kind === 'item' && e.id && ITEMS[e.id]) {
        const q = state.qmade[e.id] || { s: 0, g: 0 };
        info.counters = [
            ['Fabriqués', masteryCount(e.id)],
            ['En argent', q.s],
            ['En or', q.g],
        ];
        const sv = masteryStars(e.id);
        info.lines.push(['Maîtrise', sv ? `${MASTERY_NAMES[sv - 1]}` : 'pas encore']);
        if (day) info.lines.push(['Première fois', day]);
        if (CARNET[e.id]) {
            info.anecdote = carnetOpen(e.id) ? CARNET[e.id] : 'Une anecdote de Mamie Odette se débloque à la maîtrise bronze de ce produit.';
            info.locked = !carnetOpen(e.id);
        }
    } else if (e.kind === 'fish') {
        info.counters = [['Pêchés', c.n]];
        if (c.best) info.lines.push(['Record', `${c.best.toString().replace('.', ',')} kg`]);
        if (day) info.lines.push(['Première prise', day]);
        if (e.hint) info.lines.push(['Où', e.hint]);
    } else if (e.kind === 'beer') {
        const b = beerOf(e.id);
        info.stars = b ? b.stars : 0;
        info.counters = [['Brassées', b ? b.made : 0]];
        if (b) {
            info.lines.push(['Prix de la bouteille', `${fmt(beerPrice(b.id))} pièces`]);
            if (b.note) info.lines.push(['Dégustation', b.note]);
        }
    } else if (e.kind === 'variety') {
        const v = state.genetics && state.genetics.vars[e.id];
        if (v) {
            info.lines.push(['État', v.fixed ? 'Fixée' : 'Pas encore fixée']);
            info.lines.push(['Gain de saveur', `+${(Math.round(flavorGain(v.g) * 10) / 10).toString().replace('.', ',')}`]);
            info.lines.push(['Stabilité', `${Math.round(stability(v.g) * 100)} %`]);
        }
    } else if (e.kind === 'race') {
        const r = state.genetics && state.genetics.races[e.id];
        if (r) info.lines.push(['Espèce', ANIMALS[r.type] ? ANIMALS[r.type].name : r.type]);
    } else if (e.kind === 'vintage') {
        info.lines.push(['Millésime', VINTAGES[e.q].name]);
        info.lines.push(['Valeur', `×${VINTAGES[e.q].mult.toString().replace('.', ',')}`]);
        info.counters = [['Sortis de la cave', c.n]];
    }
    return info;
}

export const bookAllClaimable = () => bookClaimable() + claimableCount() + (legendReady() ? 1 : 0);

// ---------------- statistiques ----------------
export function trackDayEarn(amount) {
    state.dayEarn[state.day] = (state.dayEarn[state.day] || 0) + amount;
}

// garde les 30 derniers jours de gains
export function trimDayEarn() {
    const days = Object.keys(state.dayEarn);
    if (days.length > 30)
        days.map(Number)
            .sort((a, b) => a - b)
            .slice(0, days.length - 30)
            .forEach(k => delete state.dayEarn[k]);
}

export function statsData() {
    const S = state.stats;
    const tiles = [
        ['Temps de jeu', fmtTime(S.playSec || 0)],
        ['Pièces gagnées', fmt(S.earned || 0)],
        ['Cultures récoltées', fmt(S.harvested || 0)],
        ['Jour de la ferme', state.day],
        ['Poissons pêchés', fmt(S.fish || 0)],
        ['Plats cuisinés', fmt(S.cooked || 0)],
    ];
    // gains par jour (10 derniers jours de jeu)
    const days = Array.from({ length: 10 }, (_, k) => state.day - 9 + k).filter(d => d >= 1);
    const perDay = days.map(d => ({ day: d, v: Math.round(state.dayEarn[d] || 0) }));
    // produits les plus rentables au marché
    const top = Object.entries(state.sold)
        .filter(([, v]) => v > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);
    // origine des pièces
    const inc = state.income,
        known = inc.market + (inc.stall || 0) + inc.orders + inc.trucks + (inc.cave || 0);
    const sources = [
        ['Étal', inc.stall || 0],
        ['Grossiste', inc.market],
        ['Commandes', inc.orders],
        ['Trains', inc.trucks],
        ['Cave et enchères', inc.cave || 0],
        ['Autres', Math.max(0, (S.earned || 0) - known)],
    ];
    return { tiles, perDay, top, sources };
}

// ---------------- records personnels ----------------
export const recordText = (key, v) => {
    const d = RECORDS[key];
    return key === 'streak' ? `${v} jour${v > 1 ? 's' : ''}` : `${fmt(v)} ${d.unit}`;
};

export function record(key, v) {
    if (!state.records) state.records = {};
    const old = state.records[key] || 0;
    if (v <= old) return false;
    state.records[key] = v;
    // pas de fanfare pour le tout premier record de chaque sorte
    if (old && view.started && v >= old * 1.05) toast(`Nouveau record : ${RECORDS[key].name.toLowerCase()} !`, ['ui', 'trophy']);
    return true;
}

// ---------------- le livre par quart ----------------
export function bookProgress() {
    const all = staticEntries();
    return { found: all.filter(isFound).length, total: all.length };
}
export const quarterReward = k => ({ coins: Math.round((4000 * (k + 1) * (1 + scaleLvl() * 0.2)) / 50) * 50, rares: k + 1 });
export const quarterReady = k => {
    const p = bookProgress();
    return !(state.bookQuarters || [])[k] && p.found >= Math.ceil(p.total * BOOK_QUARTERS[k]);
};
export const quartersClaimable = () => BOOK_QUARTERS.filter((_, k) => quarterReady(k)).length;

export function claimQuarter(k, at) {
    if (!quarterReady(k)) return false;
    state.bookQuarters = state.bookQuarters || [];
    state.bookQuarters[k] = true;
    const r = quarterReward(k);
    earn(r.coins, at);
    RARE.forEach(id => (state.inventory[id] += r.rares));
    if (k === 3) {
        state.decorInv.goldenBook = (state.decorInv.goldenBook || 0) + 1;
        state.prestige.rubans++;
        addPhoto('ui', 'goldenBook', 'Livre de la ferme complet', 'Toutes les pages');
    }
    sfx('level');
    burst(at, 'sparkle', 16);
    toast(k === 3 ? 'Livre complet : le Livre d’or et 1 ruban !' : `Le livre est rempli à ${BOOK_QUARTERS[k] * 100} % !`, ['ui', 'book']);
    return true;
}
