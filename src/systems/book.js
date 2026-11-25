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
import { BOOK_PAGES, BOOK_EXTRA, TREASURES, FISH, RECORDS } from '../data/meta.js';
import { RARE } from '../data/commerce.js';
import { BOOK_QUARTERS, MASTERY_NAMES } from '../data/progress.js';
import { seedList } from './farm.js';
import { earn, claimableCount } from './player.js';
import { legendReady, masteryCount, masteryStars, masteryExtra, extraName } from './mastery.js';
import { carnetOpen } from './carnet.js';
import { beerOf, beerPrice } from './brewery.js';
import { FAMILIES, CONCENTRATIONS, METHODS, PERFUME_TOUCHES, PERFUME_CLASSICS } from '../data/perfume.js';
import { perfumeOf, perfumePrice, perfumeNoteName } from './perfume.js';
import { CONF_KINDS, CONF_CLASSICS } from '../data/confiserie.js';
import { confOf, confPrice, confIngName, confBaseDef, confQual } from './confiserie.js';
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
// 1.82 : la page Élevage : le produit de chaque bête et son second produit (pas le compost)
const herdEntries = () => {
    const seen = new Set(),
        out = [];
    for (const a of Object.values(ANIMALS))
        for (const [id, second] of [
            [a.prodId, false],
            [a.extra, true],
        ]) {
            if (!id || !ITEMS[id] || id === 'fertilizer' || seen.has(id)) continue;
            seen.add(id);
            out.push({
                key: 'a_' + id,
                kind: 'item',
                id,
                icon: ['item', id],
                name: ITEMS[id].name,
                hint: second ? `${a.name} : au ramassage, parfois` : `${a.name} : au ramassage`,
            });
        }
    return out;
};
const WINES = Object.keys(CAVE_ITEMS).filter(id => ['wine', 'champagne'].includes(CAVE_ITEMS[id]));
const ENTRIES = {
    // 1.90 : le potager ne compte que les cultures ; les arbres (pommes, poires…) sont au verger
    garden: () =>
        seedList()
            .filter(i => i.type === 'crop')
            .map(i => ({
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
    herd: herdEntries,
    fish: () => Object.entries(FISH).map(([id, f]) => ({ key: 'f_' + id, kind: 'fish', id, icon: ['item', id], name: f.name, hint: f.hint, fish: !f.junk })),
    beers: () =>
        state.brew && state.brew.beers
            ? Object.values(state.brew.beers)
                  .filter(b => (b.made || 0) > 0)
                  .map(b => ({ key: 'b_' + b.id, kind: 'beer', id: b.id, icon: ['ui', 'beer'], name: b.name, hint: '', found: true, star: b.stars >= 3 }))
            : [],
    perfumes: () =>
        state.perfume && state.perfume.creations
            ? Object.values(state.perfume.creations)
                  .filter(p => (p.made || 0) > 0)
                  .map(p => ({ key: 'pf_' + p.id, kind: 'perfume', id: p.id, icon: ['ui', 'perfume'], name: p.name, hint: '', found: true, star: p.stars >= 3 }))
            : [],
    confiseries: () =>
        state.confiserie && state.confiserie.creations
            ? Object.values(state.confiserie.creations)
                  .filter(c => (c.made || 0) > 0)
                  .map(c => ({ key: 'cf_' + c.id, kind: 'confiserie', id: c.id, icon: ['ui', 'confiserie'], name: c.name, hint: '', found: true, star: c.stars >= 3 }))
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
const extraEntries = pid => {
    const x = BOOK_EXTRA[pid];
    return x ? x.ids.filter(id => ITEMS[id]).map(id => ({ key: 'x_' + id, kind: 'item', id, icon: ['item', id], name: ITEMS[id].name, hint: x.hint, extra: true })) : [];
};
const withExtra = (pid, f) => (BOOK_EXTRA[pid] ? () => [...f(), ...extraEntries(pid)] : f);
export const BOOK = BOOK_PAGES.map(p => ({ ...p, entries: withExtra(p.id, ENTRIES[p.id] || (() => recipeEntries(p.id))) }));
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
            if (view.started) toast(`Nouveau record : ${(Math.round(weight * 100) / 100).toString().replace('.', ',')} kg !`, ['ui', 'trophy']);
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
    // 1.139 : les ajouts du livre (pêche en mer, miel…) : trouvés dès qu'on en a eu un
    for (const p of BOOK)
        for (const e of extraEntries(p.id))
            if (!state.collection[e.key] && (masteryCount(e.id) > 0 || (state.made && state.made[e.id] > 0) || (state.inventory[e.id] || 0) > 0))
                state.collection[e.key] = { n: 1, best: 0, day: state.day };
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
            ...(q.p || q.d
                ? [
                      ['En platine', q.p || 0],
                      ['En diamant', q.d || 0],
                  ]
                : []),
        ];
        const sv = masteryStars(e.id);
        info.lines.push(['Maîtrise', sv ? `${MASTERY_NAMES[sv - 1]}${masteryExtra(e.id) ? ` · rang ${extraName(e.id)}` : ''}` : 'pas encore']);
        if (day) info.lines.push(['Première fois', day]);
        if (CARNET[e.id]) {
            info.anecdote = carnetOpen(e.id) ? CARNET[e.id] : 'Une anecdote de Mamie Odette se débloque à la maîtrise bronze de ce produit.';
            info.locked = !carnetOpen(e.id);
        }
    } else if (e.kind === 'fish') {
        // 1.82 : les prises par qualité, comme pour les produits
        const q = state.qmade[e.id] || { s: 0, g: 0 };
        info.counters = [
            ['Pêchés', c.n],
            ...(e.fish
                ? [
                      ['En argent', q.s],
                      ['En or', q.g],
                      ...(q.p || q.d
                          ? [
                                ['En platine', q.p || 0],
                                ['En diamant', q.d || 0],
                            ]
                          : []),
                  ]
                : []),
        ];
        if (e.fish && ITEMS[e.id]) {
            const sv = masteryStars(e.id);
            info.lines.push(['Maîtrise', sv ? `${MASTERY_NAMES[sv - 1]}${masteryExtra(e.id) ? ` · rang ${extraName(e.id)}` : ''}` : 'pas encore']);
        }
        if (c.best) info.lines.push(['Record', `${(Math.round(c.best * 100) / 100).toString().replace('.', ',')} kg`]);
        if (day) info.lines.push(['Première prise', day]);
        if (e.hint) info.lines.push(['Où', e.hint]);
    } else if (e.kind === 'beer') {
        const b = beerOf(e.id);
        info.stars = b ? b.stars : 0;
        const bq = (b && b.qmade) || {};
        info.counters = [
            ['Brassées', b ? b.made : 0],
            ['En argent', bq.s || 0],
            ['En or', bq.g || 0],
            ...(bq.p || bq.d
                ? [
                      ['En platine', bq.p || 0],
                      ['En diamant', bq.d || 0],
                  ]
                : []),
        ];
        if (b) {
            info.lines.push(['Prix de la bouteille', `${fmt(beerPrice(b.id))} pièces`]);
            if (b.note) info.lines.push(['Dégustation', b.note]);
        }
    } else if (e.kind === 'perfume') {
        const p = perfumeOf(e.id);
        info.stars = p ? p.stars : 0;
        const pq = (p && p.qmade) || {};
        info.counters = [
            ['Flacons', p ? p.made : 0],
            ['En argent', pq.s || 0],
            ['En or', pq.g || 0],
            ...(pq.p || pq.d
                ? [
                      ['En platine', pq.p || 0],
                      ['En diamant', pq.d || 0],
                  ]
                : []),
        ];
        if (p) {
            const fam = FAMILIES[p.family];
            const conc = CONCENTRATIONS[p.conc];
            const meth = METHODS[p.method];
            info.lines.push(['Famille', fam ? fam.name : p.family]);
            if (conc) info.lines.push(['Concentration', conc.name]);
            if (meth) info.lines.push(['Extraction', meth.name]);
            info.lines.push(['Pyramide', `${perfumeNoteName(p.head)} · ${perfumeNoteName(p.heart)} · ${perfumeNoteName(p.base)}`]);
            if (p.touch && PERFUME_TOUCHES[p.touch]) info.lines.push(['Touche', PERFUME_TOUCHES[p.touch]]);
            if (p.classic) {
                const cl = PERFUME_CLASSICS.find(x => x.id === p.classic);
                if (cl) info.lines.push(['Grand classique', cl.name]);
            }
            info.lines.push(['Prix du flacon', `${fmt(perfumePrice(p.id))} pièces`]);
        }
    } else if (e.kind === 'confiserie') {
        const cf = confOf(e.id);
        info.stars = cf ? cf.stars : 0;
        const cq = cf ? confQual(cf.id) : {};
        info.counters = [
            ['Pièces', cf ? cf.made : 0],
            ['En argent', cq.s || 0],
            ['En or', cq.g || 0],
            ...(cq.p || cq.d
                ? [
                      ['En platine', cq.p || 0],
                      ['En diamant', cq.d || 0],
                  ]
                : []),
        ];
        if (cf) {
            const kd = CONF_KINDS[cf.kind];
            info.lines.push(['Métier', kd ? kd.name : cf.kind]);
            info.lines.push(['Base', confBaseDef(cf.base).name]);
            if (cf.ings && cf.ings.length) info.lines.push(['Ingrédients', cf.ings.map(confIngName).join(' · ')]);
            if (cf.mirror) info.lines.push(['Finition', 'Miroir (3★ mini-jeu)']);
            if (cf.classic) {
                const cl = CONF_CLASSICS.find(x => x.id === cf.classic);
                if (cl) info.lines.push(['Grand Classique', cl.name]);
            }
            info.lines.push(['Prix à la pièce', `${fmt(confPrice(cf.id))} pièces`]);
        }
    } else if (e.kind === 'variety') {
        const v = state.genetics && state.genetics.vars[e.id];
        if (v) {
            const h = v.harv || {};
            info.counters = [
                ['Récoltées', h.n || 0],
                ['En argent', h.s || 0],
                ['En or', h.g || 0],
                ...(h.p || h.d
                    ? [
                          ['En platine', h.p || 0],
                          ['En diamant', h.d || 0],
                      ]
                    : []),
            ];
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
        .slice(0, 8);
    // origine des pièces
    const inc = state.income,
        known =
            inc.market +
            (inc.stall || 0) +
            inc.orders +
            inc.trucks +
            (inc.cave || 0) +
            (inc.brew || 0) +
            (inc.perfume || 0) +
            (inc.confiserie || 0) +
            (inc.comice || 0) +
            (inc.counter || 0) +
            (inc.haras || 0) +
            (inc.camping || 0) +
            (inc.maison || 0);
    const sources = [
        ['Étal', inc.stall || 0],
        ['Grossiste', inc.market],
        ['Commandes', inc.orders],
        ['Trains', inc.trucks],
        ['Cave et enchères', inc.cave || 0],
        // 1.75.2
        ['Brasserie', inc.brew || 0],
        ['Parfumerie', inc.perfume || 0],
        ['Confiserie', inc.confiserie || 0],
        ['Comice agricole', inc.comice || 0],
        ['Comptoir', inc.counter || 0],
        ['Haras', inc.haras || 0],
        ['Camping', inc.camping || 0],
        ['La Maison', inc.maison || 0],
        ['Autres', Math.max(0, (S.earned || 0) - known)],
    ];
    // 1.74.2 : toute la ferme, rangée par coin (seuls les chiffres non nuls)
    const n = k => S[k] || 0;
    const GR = [
        [
            'La ferme',
            [
                ['Temps de jeu', S.playSec ? fmtTime(S.playSec) : 0, ['ui', 'clock']],
                ['Jour de la ferme', state.day, ['ui', 'calendar']],
                ['Pièces gagnées', n('earned'), ['ui', 'coin']],
                ['Ventes de fermes', n('prestiges'), ['ui', 'ribbon']],
            ],
        ],
        [
            'Champ et verger',
            [
                ['Cultures récoltées', n('harvested'), ['item', 'wheat']],
                ['Fruits du verger', n('orchardFruits'), ['item', 'apple']],
                ['Récoltes des contrées', n('islandHarvest'), ['item', 'coconut']],
                ['Gestes de Théo', n('handWork'), ['ui', 'basket']],
            ],
        ],
        [
            'Animaux',
            [
                ['Produits des bêtes', n('collected'), ['item', 'egg']],
                ['Croisements', n('crosses'), ['ui', 'heart']],
                ['Concours gagnés', n('contestWins'), ['ui', 'podium']],
                ['Premiers prix Comice', n('salonWins'), ['ui', 'medalG']],
                ['Épreuves express Comice', n('comiceExpress'), ['ui', 'ribbon']],
                // 1.92 : le haras
                ['Concours du haras', (state.show && state.show.wins) || 0, ['ui', 'hCup2']],
                ['Poulains nés', n('foals'), ['animal', 'horse']],
                ['Entraînements', n('trained'), ['ui', 'gear']],
                ['Balades', n('randos'), ['ui', 'clock']],
            ],
        ],
        [
            'Atelier',
            [
                ['Produits fabriqués', n('crafted'), ['ui', 'gear']],
                ['Plats cuisinés', n('cooked'), ['item', 'soup']],
                ['Plans terminés', n('plans'), ['ui', 'loop']],
                ['Boissons brassées', n('beers'), ['ui', 'beer']],
                ['Parfums créés', n('perfumes'), ['ui', 'perfume']],
                ['Confiseries façonnées', n('confiseries'), ['ui', 'confiserie']],
                ['Lots de cave', n('caveLots'), ['ui', 'cave']],
                ['Créations', n('creations'), ['ui', 'star']],
                // 1.92 : la brasserie, le comptoir et le labo
                ['Commandes de bière', n('beerOrders'), ['ui', 'beer']],
                ['Commandes de parfum', n('perfumeOrders'), ['ui', 'perfume']],
                ['Parfums offerts', n('perfumeGifts'), ['ui', 'perfume']],
                ['Commandes gourmandes', n('confOrders'), ['ui', 'confiserie']],
                ['Confiseries offertes', n('confGifts'), ['ui', 'confiserie']],
                ['Boissons servies', n('drinks'), ['ui', 'beer']],
                ['Clients du comptoir', n('clients'), ['ui', 'heart']],
                ['Variétés fixées', state.genetics ? Object.values(state.genetics.vars || {}).filter(v => v && v.fixed).length : 0, ['ui', 'flowers']],
            ],
        ],
        [
            'Nature',
            [
                ['Poissons pêchés', n('fish'), ['item', 'carp']],
                ['Bois coupé', n('chopped'), ['item', 'wood']],
                ['Pierres minées', n('mined'), ['item', 'stone']],
                ['Pots de miel', n('honey'), ['item', 'honey']],
            ],
        ],
        [
            'Village et voyages',
            [
                ['Commandes livrées', n('orders'), ['ui', 'scroll']],
                ['Trains complets', n('trucks'), ['ui', 'trainIcon']],
                ['Bateaux', n('boats'), ['ui', 'boat']],
                ['Montgolfières', n('balloons'), ['ui', 'balloon']],
                ['Cœurs d’amitié', n('hearts'), ['ui', 'heart']],
                ['Chantiers', n('projects'), ['ui', 'crate']],
            ],
        ],
        // 1.139 : le camping, la Maison et la famille avaient leurs compteurs, mais pas de place ici
        [
            'Camping et Maison',
            [
                ['Campeurs accueillis', n('campGuests'), ['ui', 'tent']],
                ['Campeurs repartis ravis', n('campHappy'), ['ui', 'heart']],
                ['Résidents installés', n('campResidents'), ['ui', 'house']],
                ['Paquets vendus', n('coffretsSold'), ['ui', 'maison']],
            ],
        ],
        [
            'Famille',
            [
                ['Mariages', n('weddings'), ['ui', 'heart']],
                ['Repas de famille', n('familyMeals'), ['item', 'soup']],
                ['Anniversaires fêtés', n('bdays'), ['ui', 'star']],
                ['Soins aux enfants', n('kidCares'), ['ui', 'fmHome']],
                ['Petits-enfants', n('grandkids'), ['ui', 'fmHome']],
                ['Transmissions', n('legacies'), ['ui', 'house']],
            ],
        ],
    ];
    const groups = GR.map(([t, l]) => [t, l.filter(x => x[1]).map(([a, v, i]) => [a, typeof v === 'number' ? fmt(v) : v, i])]).filter(g => g[1].length);
    return { tiles, groups, perDay, top, sources };
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
