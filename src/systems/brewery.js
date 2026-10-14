// La brasserie de l'abbaye (1.6) : on compose ses bières (malt, houblon, 1 à 3 ingrédients), on les nomme,
// on les vend. Depuis 1.6.3, le vieillissement en fût se fait à la cave (le cellier ne sert plus qu'aux anciennes sauvegardes).
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { view } from '../core/view.js';
import { toast, sfx, buzz, burst, float, emit } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { FLAVORS } from '../data/genetics.js';
import { ABBEY, MALTS, MALT_IDS, HOP_DOSES, NOTES, PAIRS, BARRELS, CELLAR, BEER_BOOK, DEMAND, BEER_ORDERS } from '../data/abbey.js';
import { VILLAGERS } from '../data/village.js';
import { addFriendship } from './village.js';
import { projectDone } from './story.js';
import { earn, addXp } from './player.js';
import { clampQuality } from './farm.js';
import { varietyMult, varName, traitOf, FLAVOR_IDS, clampVarieties } from './genetics.js';

// ---------------- ouverture ----------------
export const brewOpen = () => projectDone('brewhall');
export const cellarOpen = () => projectDone('barrelcellar');
export const brewSlots = () => (projectDone('labelshop') ? 3 : projectDone('fermenters') ? 2 : 1);
export const vatCount = () => Object.entries(ABBEY.vats).reduce((a, [p, n]) => a + (projectDone(p) ? n : 0), 0);
// ce qu'on peut mettre dans une bière : toutes les cultures et tous les fruits
export const BREWABLE = Object.values(ITEMS)
    .filter(i => (i.type === 'crop' || i.type === 'tree') && FLAVORS[i.id] && i.id !== 'hop')
    .map(i => i.id);

// ---------------- 1.7 : un ingrédient peut être une variété du labo (son identifiant « v12 ») ----------------
const VAR = id => (state.genetics && state.genetics.vars[id]) || null;
export const isVarIng = id => !!VAR(id);
export const ingBase = id => (VAR(id) ? VAR(id).base : id);
// le goût d'un ingrédient : celui de l'espèce, ou celui que la variété exprime vraiment
export const ingFlavor = id => (VAR(id) ? FLAVOR_IDS.map(k => traitOf(VAR(id).g, k)) : FLAVORS[id] || [0, 0, 0, 0, 0]);
export const ingName = id => (VAR(id) ? varName(VAR(id)) : ITEMS[id] ? ITEMS[id].name : 'variété perdue');
const ingLow = id => (VAR(id) ? varName(VAR(id)) : ITEMS[id] ? ITEMS[id].name.toLowerCase() : 'variété perdue');
const ingValue = id => (VAR(id) ? (ITEMS[VAR(id).base].sell || 0) * varietyMult(VAR(id)) : (ITEMS[id] && ITEMS[id].sell) || 0);
// combien on en a : pour une variété, ses produits (qui font partie du stock de l'espèce)
export function ingHave(id) {
    const v = VAR(id);
    if (!v) return state.inventory[id] || 0;
    clampVarieties();
    return Math.min(state.genetics.stock[id] || 0, state.inventory[v.base] || 0);
}
function ingTake(id, n) {
    const v = VAR(id);
    if (v) {
        state.genetics.stock[id] -= n;
        state.inventory[v.base] -= n;
        clampQuality(v.base);
    } else {
        state.inventory[id] -= n;
        clampQuality(id);
    }
}
// les variétés qu'on peut mettre dans une bière : celles d'une espèce brassable, avec des produits en stock
export const brewVarieties = () => (state.genetics ? Object.values(state.genetics.vars).filter(v => BREWABLE.includes(v.base) && ingHave(v.id) > 0) : []);
// pour le dessin de la bouteille : l'espèce de chaque variété
const basesOf = ings => Object.fromEntries(ings.filter(([id]) => VAR(id)).map(([id]) => [id, VAR(id).base]));

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
    B.draft.ings = B.draft.ings.filter(([id]) => BREWABLE.includes(id) || (VAR(id) && BREWABLE.includes(VAR(id).base)));
    fixAgedNames(B);
    B.demand = B.demand || {};
    B.orders = B.orders || [];
    B.nextOrder = B.nextOrder || 0;
    while (B.vats.length < vatCount()) B.vats.push(null);
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
    for (const [id, d] of ings) ingFlavor(id).forEach((v, k) => (p[k] += v * d));
    return p;
}
// l'accord : de 0 à 3 étoiles, avec ses raisons
export function brewHarmony(malt, hop, ings) {
    const reasons = [];
    if (!ings.length) return { stars: 0, reasons: ['Ajoutez au moins un ingrédient.'] };
    // le goût des ingrédients seuls, selon leurs doses
    const ip = [0, 0, 0, 0, 0];
    for (const [id, d] of ings) ingFlavor(id).forEach((v, k) => (ip[k] += v * d));
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
    const tops = ings.map(([id]) => noteOf(ingFlavor(id)));
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
const low = id => ingLow(id);
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
    const cost = Object.entries(brewCost(malt, hop, ings)).reduce((a, [id, n]) => a + ingValue(id) * n, 0);
    return Math.round((((ABBEY.price * cost + 0.1 * brewTime(ings)) / ABBEY.bottles) * ABBEY.harmony[stars]) / 5) * 5;
}
// tout ce qu'il faut pour brasser la recette en cours
export function brewPreview(d = ensureBrew().draft) {
    const ings = d.ings.filter(([id]) => id).slice(0, brewSlots());
    const h = brewHarmony(d.malt, d.hop, ings);
    const cost = brewCost(d.malt, d.hop, ings);
    const miss = Object.entries(cost).filter(([id, n]) => ingHave(id) < n);
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
        // une recette jamais brassée garde ses étoiles secrètes : on les découvre en goûtant
        secret: !known,
        hints: brewHints(d.malt, ings),
        color: brewColor(d.malt),
        bases: basesOf(ings),
        freeVat: ensureBrew().vats.findIndex(v => !v),
    };
}

// des indices sans les étoiles : le goût du malt et les deux notes principales
export function brewHints(malt, ings) {
    if (!ings.length) return [];
    const ip = [0, 0, 0, 0, 0];
    for (const [id, d] of ings) ingFlavor(id).forEach((v, k) => (ip[k] += v * d));
    const order = ip.map((v, k) => [v, k]).sort((x, y) => y[0] - x[0]);
    const notes = order[1][0] >= order[0][0] * 0.3 && order[1][0] > 0 ? `${NOTES[order[0][1]]} et ${NOTES[order[1][1]]}` : NOTES[order[0][1]];
    return [`Notes principales : ${notes}.`, `Une ${MALTS[malt].name.toLowerCase()} ${MALTS[malt].text}.`];
}
// la note qui domine les ingrédients d'une bière (pour les commandes)
export function beerNote(b) {
    if (b.note !== undefined) return b.note;
    const ip = [0, 0, 0, 0, 0];
    for (const [id, d] of b.ings) ingFlavor(id).forEach((v, k) => (ip[k] += v * d));
    return noteOf(ip);
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
    if (id && !BREWABLE.includes(id) && !(VAR(id) && BREWABLE.includes(VAR(id).base))) return false;
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
export function startBrew(at, d = ensureBrew().draft, quiet = false) {
    if (!brewOpen()) return false;
    const B = ensureBrew();
    const pv = brewPreview(d);
    if (!pv.ings.length || pv.miss.length || pv.freeVat < 0) {
        if (pv.miss.length && !quiet) {
            toast(`Il manque : ${pv.miss.map(([id, n]) => `${n - ingHave(id)} ${low(id)}`).join(', ')}`, ['item', ingBase(pv.miss[0][0])]);
            sfx('error');
        }
        return false;
    }
    for (const [id, n] of Object.entries(pv.cost)) ingTake(id, n);
    // une bière déjà connue garde son nom ; une nouvelle entre dans « Mes bières »
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
            bases: pv.bases,
            note: beerNote({ ings: pv.ings }),
            made: 0,
            day: state.day,
        };
    }
    B.vats[pv.freeVat] = { bid, until: now() + pv.time * 1000, n: ABBEY.bottles, loop: !!d.loop };
    if (quiet) return bid;
    sfx('machine');
    buzz(15);
    if (at) burst(at, 'sparkle', 8);
    return bid;
}
export const vatReady = v => !!v && now() >= v.until;
// la recette d'une bière, pour la rebrasser
export const recipeOf = bid => {
    const b = beerOf(bid);
    return b && !b.aged ? { malt: b.malt, hop: b.hop, ings: b.ings.map(x => [...x]) } : null;
};
export function rebrew(bid, at) {
    const r = recipeOf(bid);
    return r ? startBrew(at, r) : false;
}
// une cuve en boucle relance la même bière dès qu'elle est prête
export function toggleVatLoop(i) {
    const v = ensureBrew().vats[i];
    if (!v) return false;
    v.loop = !v.loop;
    return true;
}
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
    for (const [id0] of beer.ings) {
        const id = ingBase(id0);
        if (ITEMS[id] && !B.book[id]) {
            B.book[id] = true;
            newPages++;
        }
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
// la demande : chaque bouteille vendue fait baisser le prix de cette bière, qui remonte de moitié toutes les 6 heures
const demandNow = bid => {
    const d = state.brew && state.brew.demand && state.brew.demand[bid];
    return d ? d.n * Math.pow(0.5, (now() - d.t) / 1000 / DEMAND.half) : 0;
};
export const demandMult = bid => Math.max(DEMAND.floor, 1 - DEMAND.per * demandNow(bid));
export const beerPrice = bid => Math.max(5, Math.round((beerValue(bid) * demandMult(bid)) / 5) * 5);
export function sellBeer(bid, n, at) {
    const B = ensureBrew();
    const have = B.stock[bid] || 0;
    n = Math.min(have, n);
    if (n <= 0) return false;
    B.stock[bid] = have - n;
    let coins = 0;
    for (let k = 0; k < n; k++) {
        coins += beerPrice(bid);
        B.demand[bid] = { n: demandNow(bid) + 1, t: now() };
    }
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

// ---------------- l'ancien cellier (avant 1.6.3) : on vide ses fûts dans « Mes bières » ----------------
// le nom d'une bière de garde : celui de la bière, raccourci au mot près si besoin, puis son âge
function agedName(name, what) {
    const full = `${name} ${what}`;
    if (full.length <= 22) return full;
    const room = 22 - what.length - 2;
    const cut = name.slice(0, room).replace(/[\s,-]+\S*$/, '');
    return `${cut || name.slice(0, room)}… ${what}`;
}
// 1.7 : les noms coupés en plein mot par la 1.6.3 sont réparés
function fixAgedNames(B) {
    for (const b of Object.values(B.beers)) {
        if (!b.aged || b.named) continue;
        const src = B.beers[b.aged.from];
        if (!src) continue;
        const what = b.aged.turned ? 'tournée' : CELLAR.stepNames[b.aged.stage];
        if (b.name === cleanName(`${src.name} ${what}`) && b.name.length === 22) b.name = agedName(src.name, what);
    }
}
export const barrelOk = k => !BARRELS[k].item || (state.inventory[BARRELS[k].item] || 0) >= 1;
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
            name: agedName(src.name, what),
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
export const brewReadyCount = () => (state.brew ? state.brew.vats.filter(vatReady).length + (beerBookClaimable() ? 1 : 0) + beerOrdersReady() : 0);
// ---------------- les commandes de bière ----------------
const pickR = a => a[Math.floor(Math.random() * a.length)];
export function newBeerOrder() {
    const B = ensureBrew();
    const who = BEER_ORDERS.who.filter(v => VILLAGERS[v]);
    const slots = brewSlots();
    const min = slots >= 2 ? pickR([1, 2, 2, 3]) : pickR([1, 1, 2]);
    // une demande réalisable : une note qu'au moins un ingrédient débloqué peut donner
    const note = pickR([0, 0, 1, 2, 3, 4]);
    const malt = Math.random() < 0.6 ? pickR(MALT_IDS) : null;
    const qty = BEER_ORDERS.qty[0] + Math.floor(Math.random() * (BEER_ORDERS.qty[1] - BEER_ORDERS.qty[0] + 1));
    const o = { id: 'o' + B.next++, vid: pickR(who), malt, note, min, qty };
    B.orders.push(o);
    return o;
}
export const beerOrderText = o =>
    `${o.qty} bouteilles d’une ${o.malt ? MALTS[o.malt].name.toLowerCase() : 'bière'} plutôt ${['sucrée', 'acide', 'amère', 'épicée', 'umami'][o.note]}, ${o.min} étoile${o.min > 1 ? 's' : ''} au moins`;
export const beerFits = (o, b) => (!o.malt || b.malt === o.malt) && b.stars >= o.min && beerNote(b) === o.note;
export const beerOrderMatches = o => myBeers().filter(b => beerFits(o, b) && beerStock(b.id) >= o.qty);
export const beerOrderPay = (o, bid) => Math.round((beerValue(bid) * o.qty * BEER_ORDERS.pay) / 10) * 10;
export function deliverBeerOrder(oid, bid, at) {
    const B = ensureBrew();
    const k = B.orders.findIndex(o => o.id === oid);
    if (k < 0) return false;
    const o = B.orders[k];
    const b = beerOf(bid || (beerOrderMatches(o)[0] || {}).id);
    if (!b || !beerFits(o, b) || beerStock(b.id) < o.qty) return false;
    B.stock[b.id] -= o.qty;
    earn(beerOrderPay(o, b.id), at);
    addXp(BEER_ORDERS.xp + 20 * o.min, at);
    addFriendship(o.vid, BEER_ORDERS.hearts, at);
    state.stats.beerOrders = (state.stats.beerOrders || 0) + 1;
    B.orders.splice(k, 1);
    B.nextOrder = Math.min(B.nextOrder || Infinity, now() + 5 * 60 * 1000);
    sfx('coin');
    buzz(15);
    return true;
}
export function dismissBeerOrder(oid) {
    const B = ensureBrew();
    const k = B.orders.findIndex(o => o.id === oid);
    if (k < 0) return false;
    B.orders.splice(k, 1);
    B.nextOrder = now() + BEER_ORDERS.every * 1000;
    return true;
}
export const beerOrdersReady = () => (state.brew && state.brew.orders ? state.brew.orders.filter(o => beerOrderMatches(o).length).length : 0);

export function brewTick() {
    if (!brewOpen()) return false;
    const B = ensureBrew();
    let ch = false;
    if (B.orders.length < BEER_ORDERS.max && now() >= B.nextOrder) {
        newBeerOrder();
        B.nextOrder = now() + BEER_ORDERS.every * 1000;
        ch = true;
    }
    // les cuves en boucle : on met en bouteille et on relance la même bière
    B.vats.forEach((v, i) => {
        if (v && v.loop && vatReady(v)) {
            const bid = v.bid;
            collectVat(i);
            if (startBrew(null, { ...recipeOf(bid), loop: true }, true)) ch = true;
            else if (view.started) toast(`${B.beers[bid].name} : plus assez d’ingrédients pour la relancer`, ['ui', 'beer']);
            ch = true;
        }
    });
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
