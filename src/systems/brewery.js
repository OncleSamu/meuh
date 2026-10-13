// La brasserie de l'abbaye (1.6) : on compose ses bières (malt, houblon, 1 à 3 ingrédients), on les nomme,
// on les vend, et on les fait vieillir en fût au cellier.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { view } from '../core/view.js';
import { toast, sfx, buzz, burst, float, emit } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { FLAVORS } from '../data/genetics.js';
import { ABBEY, MALTS, MALT_IDS, HOP_DOSES, NOTES, PAIRS, BARRELS, CELLAR, BEER_BOOK } from '../data/abbey.js';
import { projectDone } from './story.js';
import { earn, addXp, spend } from './player.js';
import { clampQuality } from './farm.js';

// ---------------- ouverture ----------------
export const brewOpen = () => projectDone('brewhall');
export const cellarOpen = () => projectDone('barrelcellar');
export const brewSlots = () => (projectDone('labelshop') ? 3 : projectDone('fermenters') ? 2 : 1);
export const vatCount = () => Object.entries(ABBEY.vats).reduce((a, [p, n]) => a + (projectDone(p) ? n : 0), 0);
// ce qu'on peut mettre dans une bière : toutes les cultures et tous les fruits
export const BREWABLE = Object.values(ITEMS)
    .filter(i => (i.type === 'crop' || i.type === 'tree') && FLAVORS[i.id])
    .map(i => i.id);

export function ensureBrew() {
    const B = (state.brew = state.brew || {});
    B.next = B.next || 1;
    B.beers = B.beers || {};
    B.sig = B.sig || {};
    B.stock = B.stock || {};
    B.book = B.book || {};
    B.bookClaimed = B.bookClaimed || 0;
    B.vats = B.vats || [];
    B.barrels = B.barrels || [];
    B.draft = B.draft || { malt: 'maltBlond', hop: 1, ings: [] };
    while (B.vats.length < vatCount()) B.vats.push(null);
    while (B.barrels.length < (cellarOpen() ? CELLAR.slots : 0)) B.barrels.push(null);
    return B;
}

// ---------------- le goût ----------------
const noteOf = v => v.indexOf(Math.max(...v));
const det = k => (k === 0 ? 'le ' : 'l’') + NOTES[k];
const cap = t => t[0].toUpperCase() + t.slice(1);
// profil d'une recette : malt + houblon + ingrédients dosés
export function brewProfile(malt, hop, ings) {
    const p = [...MALTS[malt].taste];
    p[2] += hop;
    for (const [id, d] of ings) FLAVORS[id].forEach((v, k) => (p[k] += v * d));
    return p;
}
// l'accord : de 0 à 3 étoiles, avec ses raisons
export function brewHarmony(malt, hop, ings) {
    const reasons = [];
    if (!ings.length) return { stars: 0, reasons: ['Ajoutez au moins un ingrédient.'] };
    // le goût des ingrédients seuls, selon leurs doses
    const ip = [0, 0, 0, 0, 0];
    for (const [id, d] of ings) FLAVORS[id].forEach((v, k) => (ip[k] += v * d));
    const order = ip.map((v, k) => [v, k]).sort((x, y) => y[0] - x[0]);
    const [a, b] = [order[0][1], order[1][1]];
    let score = 0;
    // deux notes bien présentes qui s'accordent (ou se battent)
    if (order[1][0] >= order[0][0] * 0.3 && order[1][0] > 0) {
        const pair = PAIRS[`${Math.min(a, b)}-${Math.max(a, b)}`] || 0;
        if (pair > 0) reasons.push(`${cap(det(a))} et ${det(b)} vont bien ensemble.`);
        if (pair < 0) reasons.push(`${cap(det(a))} et ${det(b)} se battent.`);
        score += pair;
    } else reasons.push(`Une seule note domine : ${NOTES[a]}.`);
    // le malt aime certaines notes
    if (MALTS[malt].likes.includes(a)) {
        score += 1;
        reasons.push(`Une ${MALTS[malt].name.toLowerCase()} ${MALTS[malt].text}.`);
    } else reasons.push(`Une ${MALTS[malt].name.toLowerCase()} ${MALTS[malt].text} : essayez un autre malt.`);
    // le houblon : trop fort pour une bière douce, bienvenu dans une bière amère ou épicée
    if (hop === 3 && a === 0) {
        score -= 1;
        reasons.push('Trop de houblon pour une bière douce.');
    }
    if (hop === 1 && (a === 2 || a === 3)) reasons.push('Un houblon plus fort irait bien à ce goût.');
    if (hop === 3 && (a === 2 || a === 3)) {
        score += 1;
        reasons.push('Le houblon fort relève ce goût.');
    }
    // plusieurs ingrédients : un vrai mélange, ou une dispute
    const tops = ings.map(([id]) => noteOf(FLAVORS[id]));
    let clash = false;
    for (let x = 0; x < tops.length; x++)
        for (let y = x + 1; y < tops.length; y++) if ((PAIRS[`${Math.min(tops[x], tops[y])}-${Math.max(tops[x], tops[y])}`] || 0) < 0) clash = true;
    if (clash) {
        score -= 1;
        reasons.push('Deux ingrédients ne s’entendent pas.');
    } else if (ings.length > 1 && new Set(tops).size > 1) {
        score += 1;
        reasons.push('Un beau mélange, riche et équilibré.');
    }
    return { stars: Math.max(0, Math.min(3, score)), reasons };
}
// la couleur : celle du malt, teintée par l'ingrédient principal
export function brewColor(malt) {
    return MALTS[malt].color;
}

// ---------------- le nom proposé ----------------
const low = id => ITEMS[id].name.toLowerCase();
export function brewName(malt, ings) {
    const list = [...ings].sort((x, y) => y[1] - x[1]).map(([id]) => low(id));
    const what = list.length === 1 ? list[0] : list.length === 2 ? `${list[0]}-${list[1]}` : `${list[0]}, ${list[1]} et ${list[2]}`;
    return `${MALTS[malt].name} ${what}`;
}
const sigOf = (malt, hop, ings) =>
    `${malt}|${hop}|${[...ings]
        .sort((x, y) => (x[0] < y[0] ? -1 : 1))
        .map(([id, d]) => id + ':' + d)
        .join(',')}`;

// ---------------- ce que coûte un brassin ----------------
export function brewCost(malt, hop, ings) {
    const c = { [malt]: ABBEY.maltPerBrew, hop: hop * ABBEY.hopPerDose };
    for (const [id, d] of ings) c[id] = (c[id] || 0) + d * ABBEY.ingPerDose;
    return c;
}
export const brewTime = ings => ABBEY.baseTime + ABBEY.perIng * ings.length;
// valeur d'une bouteille
export function brewValue(malt, hop, ings, stars) {
    const cost = Object.entries(brewCost(malt, hop, ings)).reduce((a, [id, n]) => a + (ITEMS[id].sell || 0) * n, 0);
    return Math.round((((ABBEY.price * cost + 0.1 * brewTime(ings)) / ABBEY.bottles) * ABBEY.harmony[stars]) / 5) * 5;
}
// tout ce qu'il faut pour brasser la recette en cours
export function brewPreview(d = ensureBrew().draft) {
    const ings = d.ings.filter(([id]) => id).slice(0, brewSlots());
    const h = brewHarmony(d.malt, d.hop, ings);
    const cost = brewCost(d.malt, d.hop, ings);
    const miss = Object.entries(cost).filter(([id, n]) => (state.inventory[id] || 0) < n);
    const sig = sigOf(d.malt, d.hop, ings);
    const known = ensureBrew().sig[sig];
    return {
        ings,
        profile: brewProfile(d.malt, d.hop, ings),
        harmony: h,
        cost,
        miss,
        time: brewTime(ings),
        value: ings.length ? brewValue(d.malt, d.hop, ings, h.stars) : 0,
        name: known ? state.brew.beers[known].name : ings.length ? brewName(d.malt, ings) : '',
        known,
        color: brewColor(d.malt),
        freeVat: ensureBrew().vats.findIndex(v => !v),
    };
}

// ---------------- composer ----------------
export function setDraftMalt(m) {
    if (!MALTS[m]) return false;
    ensureBrew().draft.malt = m;
    return true;
}
export function setDraftHop(n) {
    ensureBrew().draft.hop = Math.max(1, Math.min(HOP_DOSES.length, n));
    return true;
}
export function setDraftIng(slot, id) {
    const d = ensureBrew().draft;
    if (slot >= brewSlots()) return false;
    if (id && !BREWABLE.includes(id)) return false;
    // un même ingrédient une seule fois
    if (id && d.ings.some(([x], k) => x === id && k !== slot)) return false;
    while (d.ings.length <= slot) d.ings.push([null, 1]);
    d.ings[slot] = [id, d.ings[slot][1] || 1];
    d.ings = d.ings.filter(([x]) => x);
    return true;
}
export function setDraftDose(slot, n) {
    const d = ensureBrew().draft;
    if (!d.ings[slot]) return false;
    d.ings[slot][1] = Math.max(1, Math.min(3, n));
    return true;
}

// ---------------- brasser ----------------
export function startBrew(at) {
    if (!brewOpen()) return false;
    const B = ensureBrew();
    const pv = brewPreview();
    if (!pv.ings.length || pv.miss.length || pv.freeVat < 0) {
        if (pv.miss.length) {
            toast(`Il manque : ${pv.miss.map(([id, n]) => `${n - (state.inventory[id] || 0)} ${low(id)}`).join(', ')}`, ['item', pv.miss[0][0]]);
            sfx('error');
        }
        return false;
    }
    for (const [id, n] of Object.entries(pv.cost)) {
        state.inventory[id] -= n;
        clampQuality(id);
    }
    // une bière déjà connue garde son nom ; une nouvelle entre dans « Mes bières »
    const d = B.draft;
    const sig = sigOf(d.malt, d.hop, pv.ings);
    let bid = B.sig[sig];
    if (!bid) {
        bid = 'b' + B.next++;
        B.sig[sig] = bid;
        B.beers[bid] = {
            id: bid,
            name: pv.name,
            malt: d.malt,
            hop: d.hop,
            ings: pv.ings.map(x => [...x]),
            stars: pv.harmony.stars,
            value: pv.value,
            made: 0,
            day: state.day,
        };
    }
    B.vats[pv.freeVat] = { bid, until: now() + pv.time * 1000, n: ABBEY.bottles };
    sfx('machine');
    buzz(15);
    if (at) burst(at, 'sparkle', 8);
    return bid;
}
export const vatReady = v => !!v && now() >= v.until;
export function collectVat(i, at) {
    const B = ensureBrew();
    const v = B.vats[i];
    if (!vatReady(v)) return false;
    const beer = B.beers[v.bid];
    B.vats[i] = null;
    B.stock[v.bid] = (B.stock[v.bid] || 0) + v.n;
    beer.made += v.n;
    state.stats.beers = (state.stats.beers || 0) + v.n;
    // le livre des bières : une page par ingrédient
    let newPages = 0;
    for (const [id] of beer.ings)
        if (!B.book[id]) {
            B.book[id] = true;
            newPages++;
        }
    addXp(Math.round(((brewTime(beer.ings) * 3.8) / 60) * (0.8 + beer.stars * 0.2)), at);
    if (at) float(at, [`+${v.n}`, ['ui', 'beer']], '', -20);
    if (newPages) toast(`Livre des bières : ${Object.keys(B.book).length} / ${BREWABLE.length} ingrédients`, ['ui', 'beer']);
    sfx('pop');
    emit('brew', beer.id);
    return true;
}

// ---------------- vendre, renommer ----------------
export const beerOf = bid => state.brew && state.brew.beers[bid];
export const beerValue = bid => {
    const b = beerOf(bid);
    return b ? b.value : 0;
};
export function sellBeer(bid, n, at) {
    const B = ensureBrew();
    const have = B.stock[bid] || 0;
    n = Math.min(have, n);
    if (n <= 0) return false;
    B.stock[bid] = have - n;
    const coins = beerValue(bid) * n;
    earn(coins, at);
    state.stats.beersSold = (state.stats.beersSold || 0) + n;
    if (at) float(at, [`+${coins}`, ['ui', 'coin']], '', -20);
    sfx('coin');
    return true;
}
const cleanName = name =>
    String(name || '')
        .replace(/[<>&"]/g, '')
        .trim()
        .slice(0, 22);
export function renameBeer(bid, name) {
    const b = beerOf(bid),
        n = cleanName(name);
    if (!b || !n) return false;
    b.name = n;
    return true;
}

// ---------------- le livre des bières ----------------
export const beerBookPages = () => Object.keys(ensureBrew().book).length;
export const beerBookClaimable = () => Math.floor(beerBookPages() / BEER_BOOK.every) > ensureBrew().bookClaimed;
export function claimBeerBook(at) {
    const B = ensureBrew();
    if (!beerBookClaimable()) return false;
    B.bookClaimed++;
    earn(BEER_BOOK.coins * B.bookClaimed, at);
    if (beerBookPages() >= BREWABLE.length && !B.bookDone) {
        B.bookDone = true;
        state.prestige.rubans += BEER_BOOK.rubans;
        toast(`Livre des bières complet ! +${BEER_BOOK.rubans} rubans`, ['ui', 'ribbon']);
    }
    sfx('level');
    return true;
}

// ---------------- le cellier : vieillir en fût ----------------
export const barrelOk = k => !BARRELS[k].item || (state.inventory[BARRELS[k].item] || 0) >= 1;
export function putInBarrel(slot, bid, n, k, at) {
    const B = ensureBrew();
    if (!cellarOpen() || B.barrels[slot] || !BARRELS[k]) return false;
    const beer = beerOf(bid);
    if (!beer || beer.aged) return false;
    n = Math.min(n, B.stock[bid] || 0, CELLAR.maxBottles);
    if (n <= 0) return false;
    const bar = BARRELS[k];
    if (bar.item) {
        if (!barrelOk(k)) return false;
        state.inventory[bar.item]--;
        clampQuality(bar.item);
    } else {
        if (state.money < bar.cost) return false;
        spend(bar.cost);
    }
    B.stock[bid] -= n;
    B.barrels[slot] = { bid, n, k, stage: 0, next: now() + CELLAR.steps[0] * 1000, turned: false };
    sfx('load');
    if (at) burst(at, 'sparkle', 8);
    return true;
}
export const barrelValue = b => Math.round((beerValue(b.bid) * CELLAR.mult[b.stage] * BARRELS[b.k].mult * (b.turned ? CELLAR.turned : 1)) / 5) * 5;
export const barrelDone = b => b.turned || b.stage >= CELLAR.steps.length;
export function cellarTick(t = now()) {
    if (!state.brew || !state.brew.barrels) return false;
    let ch = false;
    state.brew.barrels.forEach(b => {
        while (b && !barrelDone(b) && t >= b.next) {
            b.stage++;
            if (Math.random() < CELLAR.turn) b.turned = true;
            if (!barrelDone(b)) b.next += CELLAR.steps[b.stage] * 1000;
            ch = true;
        }
    });
    return ch;
}
// sortir du fût : une bière de garde, avec son propre nom, entre dans « Mes bières »
export function takeFromBarrel(slot, at) {
    const B = ensureBrew();
    const b = B.barrels[slot];
    if (!b) return false;
    const src = beerOf(b.bid);
    if (b.stage === 0) {
        // trop tôt : la bière repart en stock, telle quelle
        B.stock[b.bid] = (B.stock[b.bid] || 0) + b.n;
        B.barrels[slot] = null;
        return true;
    }
    const sig = `${b.bid}|${b.k}|${b.stage}|${b.turned ? 1 : 0}`;
    let bid = B.sig[sig];
    if (!bid) {
        bid = 'b' + B.next++;
        B.sig[sig] = bid;
        const what = b.turned ? 'tournée' : CELLAR.stepNames[b.stage];
        B.beers[bid] = {
            ...src,
            id: bid,
            name: cleanName(`${src.name} ${what}`),
            aged: { from: b.bid, k: b.k, stage: b.stage, turned: b.turned },
            value: barrelValue(b),
            made: 0,
        };
    }
    B.stock[bid] = (B.stock[bid] || 0) + b.n;
    B.beers[bid].made += b.n;
    B.barrels[slot] = null;
    addXp(20 * b.stage * b.n, at);
    sfx('pop');
    return true;
}

// ---------------- pour l'interface et le robot ----------------
export const myBeers = () =>
    Object.values(ensureBrew().beers).sort((a, b) => (state.brew.stock[b.id] || 0) - (state.brew.stock[a.id] || 0) || b.value - a.value);
export const beerStock = bid => (state.brew && state.brew.stock[bid]) || 0;
export const brewReadyCount = () =>
    state.brew ? state.brew.vats.filter(vatReady).length + state.brew.barrels.filter(b => b && barrelDone(b)).length + (beerBookClaimable() ? 1 : 0) : 0;
export function brewTick() {
    if (!brewOpen()) return false;
    const B = ensureBrew();
    let ch = cellarTick();
    B.vats.forEach(v => {
        if (v && vatReady(v) && !v.told) {
            v.told = true;
            if (view.started) toast(`${B.beers[v.bid].name} : la bière est prête !`, ['ui', 'beer']);
            ch = true;
        }
    });
    return ch;
}
export { MALT_IDS };
