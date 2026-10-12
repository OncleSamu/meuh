// Le livre de la ferme : collection, pages, et les chiffres des statistiques.
import { state } from '../core/state.js';
import { view } from '../core/view.js';
import { fmt, fmtTime } from '../core/format.js';
import { emit, toast, sfx, buzz, burst } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { MACHINES, RECIPES } from '../data/machines.js';
import { VILLAGERS } from '../data/village.js';
import { EVENTS } from '../data/world.js';
import { CAVE_ITEMS, CAVE_FAMILIES } from '../data/cave.js';
import { BOOK_PAGES, TREASURES, FISH, RECORDS } from '../data/meta.js';
import { RARE } from '../data/commerce.js';
import { BOOK_QUARTERS } from '../data/progress.js';
import { seedList } from './farm.js';
import { earn, claimableCount } from './player.js';
import { legendReady } from './mastery.js';
import { addPhoto } from './style.js';

export const entryReward = () => 40 + state.level * 10;
export const pageReward = () => Math.round((1500 * (1 + state.level * 0.2)) / 10) * 10;

// les entrées d'une page : [{ key, icon, name, hint, star?, fish? }]
const ENTRIES = {
    garden: () => seedList().map(i => ({ key: 'g_' + i.id, icon: ['item', i.id], name: i.name, hint: 'Récoltez-en une de qualité or', star: true })),
    fish: () => Object.entries(FISH).map(([id, f]) => ({ key: 'f_' + id, icon: ['item', id], name: f.name, hint: f.hint, fish: !f.junk })),
    kitchen: () =>
        Object.values(RECIPES).map(r => ({
            key: 'k_' + r.id,
            icon: ['item', r.id],
            name: ITEMS[r.id].name,
            hint: r.teacher
                ? `Recette de ${VILLAGERS[r.teacher].name}`
                : r.fete
                  ? `Plat de fête : ${EVENTS[r.fete].name}`
                  : `${MACHINES[r.machine].name}, niveau ${r.lvl}`,
        })),
    treasure: () => TREASURES,
    cave: () =>
        Object.keys(CAVE_ITEMS).map(id => ({
            key: 'cave_' + id,
            icon: ['item', id],
            name: ITEMS[id].name,
            hint: `Sortez-en un lot au moins « ${CAVE_FAMILIES[CAVE_ITEMS[id]].ranks[3]} »`,
            star: true,
        })),
};
export const BOOK = BOOK_PAGES.map(p => ({ ...p, entries: ENTRIES[p.id] }));
export const allEntries = () => BOOK.flatMap(p => p.entries());
export const pageFound = p => p.entries().filter(e => state.collection[e.key]).length;

export function collect(key, weight) {
    const c = state.collection[key];
    if (c) {
        c.n++;
        if (weight && weight > (c.best || 0)) {
            c.best = weight;
            if (view.started) toast(`Nouveau record : ${weight.toString().replace('.', ',')} kg !`, ['ui', 'trophy']);
        }
        return;
    }
    state.collection[key] = { n: 1, best: weight || 0 };
    if (!view.started) return;
    const e = allEntries().find(x => x.key === key);
    const r = entryReward();
    state.money += r;
    state.stats.earned += r;
    state.stats.earnedRun += r;
    toast(`Nouveau dans le livre : ${e ? e.name : ''} (+${r} pièces)`, ['ui', 'book']);
    sfx('pop');
}

export const pageDone = p => p.entries().every(e => state.collection[e.key]);
export const bookClaimable = () => BOOK.filter(p => pageDone(p) && !state.pagesDone[p.id]).length;

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
    toast(`Page « ${page.name} » complétée : +1 ruban de concours`, ['ui', 'ribbon']);
    return true;
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
    const all = allEntries();
    return { found: all.filter(e => state.collection[e.key]).length, total: all.length };
}
export const quarterReward = k => ({ coins: Math.round((4000 * (k + 1) * (1 + state.level * 0.2)) / 50) * 50, rares: k + 1 });
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
