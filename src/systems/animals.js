// Le pâturage : production, bébés, câlins et mangeoires.
import { state, scaleLvl } from '../core/state.js';
import { viewShown } from '../core/view.js';
import { emit, toast, sfx, buzz, burst, float, fly, squish } from '../core/bus.js';
import { ANIMALS, GROW, NAMES, MAX_STACK, MAX_FOOD, EXTRA_DROP } from '../data/animals.js';
import { ITEMS } from '../data/items.js';
import { BALANCE } from '../data/progress.js';
import { rank, speedMult, rollYield, addXp, earn } from './player.js';
import { starAnimalMult } from './surprises.js';
import { alpineMult, themeAnimalMult, isAway } from './port.js';
import { masterySpeed, addMastery } from './mastery.js';
import { barnBlocked, rollRare } from './barn.js';
import { fmt } from '../core/format.js';
import { wildAnimal, animalSpeedGene, animalYieldGene, animalQuality, animalSaves } from './genetics.js';
import { addQuality } from './farm.js';
import { wishAnimals } from './night.js';

export const maxFood = () => MAX_FOOD + rank('trough') * 2;
export const isAdult = a => a.adult !== false;
export const animalMult = a =>
    (1 + rank('fed') * 0.08) * (1 + ((a && a.love) || 0) * 0.04) * starAnimalMult(a) * alpineMult(a) * themeAnimalMult() * (a ? animalSpeedGene(a) : 1);
export const animalTime = a => ANIMALS[a.type].time / (speedMult() * animalMult(a) * masterySpeed(ANIMALS[a.type].prodId));
export const growLeft = a => Math.max(0, (GROW[a.type] - (a.age || 0)) / (rank('nursery') ? 2 : 1) / speedMult());
export const growPct = a => Math.min(1, (a.age || 0) / GROW[a.type]);
export const prodPct = a => Math.min(1, (a.prodProgress || 0) / animalTime(a));
// une bête qui travaille : adulte, en forme, nourrie et pas encore pleine
export const isBusy = a => isAdult(a) && !a.sick && !isAway(a) && a.food > 0 && a.stack < MAX_STACK;
export const animalCount = type => state.animals.filter(a => a.type === type).length;

export function pickName(type) {
    const used = new Set(state.animals.map(a => a.name));
    const free = NAMES[type].filter(n => !used.has(n));
    const list = free.length ? free : NAMES[type];
    return list[Math.floor(Math.random() * list.length)];
}

export function newAnimal(type) {
    const G = state.genetics;
    return {
        type,
        food: 0,
        prodProgress: 0,
        stack: 0,
        adult: false,
        age: 0,
        name: pickName(type),
        love: 0,
        petDay: 0,
        produced: 0,
        uid: 'a' + (G ? G.next++ : Date.now()),
        g: wildAnimal(type, true),
        gen: 0,
    };
}

export function ensureAnimalData() {
    state.animals.forEach(a => {
        if (a.adult === undefined) a.adult = true;
        if (!a.name) a.name = pickName(a.type);
        a.love = a.love || 0;
        a.produced = a.produced || 0;
    });
}

// Mangeoire automatique : un animal affamé se sert dans le stock de nourriture
export function autoFeed(a) {
    if (!state.upgrades.feeder || a.food > 0 || state.inventory.feed <= 0) return;
    const n = Math.min(maxFood(), state.inventory.feed);
    a.food += n;
    state.inventory.feed -= n;
}

export function collectAnimal(a) {
    if (a.stack <= 0 || barnBlocked()) return 0;
    const d = ANIMALS[a.type];
    let qty = a.stack * rollYield('animal');
    if (Math.random() < animalYieldGene(a)) qty++;
    // vœu d'étoile filante : le double pendant 10 minutes
    if (wishAnimals()) qty *= 2;
    state.inventory[d.prodId] += qty;
    // de bons gènes donnent des produits de qualité
    const q = animalQuality(a);
    if (q) addQuality(d.prodId, q, qty);
    a.produced = (a.produced || 0) + qty;
    state.stats.collected += qty;
    addMastery(d.prodId, qty);
    // une bête qui a fait la transhumance donne aussi du lait d'alpage
    if (a.alpine && (a.type === 'cow' || a.type === 'goat' || a.type === 'buffalo')) state.inventory.alpineMilk += Math.ceil(qty / 2);
    // la ruche d'élevage donne aussi un peu de miel
    if (a.type === 'bees') state.inventory.honey += Math.ceil(qty / 2);
    // 1.3.2 : de temps en temps, un produit pour le saloir
    let extra = 0;
    if (d.extra) {
        const ch = EXTRA_DROP.chance + EXTRA_DROP.gene * animalYieldGene(a);
        for (let k = 0; k < a.stack; k++) if (Math.random() < ch) extra++;
        if (extra) {
            state.inventory[d.extra] = (state.inventory[d.extra] || 0) + extra;
            addMastery(d.extra, extra);
        }
    }
    const xp = d.xp * a.stack;
    a.stack = 0;
    return { qty, xp, extra, extraId: d.extra };
}

// Un appui sur une bête : ramasser sa production, sinon la nourrir (un repas).
// Avec l'outil nourriture en main, on nourrit toujours. La fiche s'ouvre par un appui long (interface).
export function tapAnimal(i, at) {
    const a = state.animals[i],
        d = ANIMALS[a.type];
    if (a.stack > 0 && state.selectedTool !== 'feed') {
        if (barnBlocked()) return;
        const r = collectAnimal(a);
        rollRare(BALANCE.rareDrop, at);
        sfx('harvest');
        sfx(a.type);
        buzz(12);
        burst(at, 'sparkle', 7, -20);
        float(at, [`+${r.qty}`, ['item', d.prodId], ...(r.extra ? [` +${r.extra}`, ['item', r.extraId]] : [])], '', -36);
        fly(at, d.prodId, r.qty);
        addXp(r.xp, at);
    } else {
        if (a.food >= maxFood()) {
            float(at, ['Repu !'], '', -30);
            sfx(a.type);
            return;
        }
        if (state.inventory.feed <= 0) {
            toast('Plus de nourriture : achetez-en au magasin ou au moulin', ['item', 'feed']);
            sfx('error');
            return;
        }
        state.inventory.feed--;
        a.food++;
        sfx('feed');
        burst(at, 'crumbs', 7, 10);
        buzz(6);
        float(at, ['+1', ['item', 'feed']], '', -30);
    }
    squish(at);
    return true;
}

export function feedAll(at) {
    if (!state.animals.length) {
        toast('Aucun animal pour le moment');
        return 0;
    }
    let used = 0,
        progress = true;
    while (progress && state.inventory.feed > 0) {
        progress = false;
        for (const a of state.animals) {
            if (state.inventory.feed <= 0) break;
            if (a.food < maxFood()) {
                a.food++;
                state.inventory.feed--;
                used++;
                progress = true;
            }
        }
    }
    if (used) {
        sfx('feed');
        buzz(10);
        emit('animalsFx', 'crumbs');
        toast(`${used} repas distribué${used > 1 ? 's' : ''}`, ['item', 'feed']);
    } else {
        toast(state.inventory.feed <= 0 ? 'Plus de nourriture : achetez-en au magasin' : 'Toutes les mangeoires sont pleines', ['item', 'feed']);
        squish(at);
    }
    return used;
}

export function collectAll(at) {
    const totals = {};
    let xp = 0;
    state.animals.forEach((a, k) => {
        const r = collectAnimal(a);
        if (r) {
            rollRare(BALANCE.rareDrop, at);
            const id = ANIMALS[a.type].prodId;
            totals[id] = (totals[id] || 0) + r.qty;
            if (r.extra) totals[r.extraId] = (totals[r.extraId] || 0) + r.extra;
            xp += r.xp;
            emit('animalFx', { i: k, item: id });
        }
    });
    const keys = Object.keys(totals);
    if (keys.length) {
        sfx('harvest');
        buzz(15);
        float(
            at,
            keys.flatMap(k => [`+${totals[k]}`, ['item', k]]),
            '',
            -20,
        );
        addXp(xp, at);
    } else {
        toast('Rien à ramasser');
        squish(at);
    }
    return keys.length;
}

export function petAnimal(i, at) {
    const a = state.animals[i];
    if (!a || a.petDay === state.day || a.love >= 5) return false;
    a.petDay = state.day;
    a.love++;
    state.stats.pets++;
    sfx(a.type);
    sfx('pop');
    buzz(15);
    emit('hearts', { at, n: 4 });
    addXp(5 + scaleLvl() * 2, at);
    return true;
}

export function feedOne(i, at) {
    const a = state.animals[i];
    if (!a) return false;
    if (a.food >= maxFood()) {
        toast('Sa mangeoire est déjà pleine', ['item', 'feed']);
        sfx('click');
        return false;
    }
    if (state.inventory.feed <= 0) {
        toast('Plus de nourriture : achetez-en au magasin ou au moulin', ['item', 'feed']);
        sfx('error');
        return false;
    }
    state.inventory.feed--;
    a.food++;
    sfx('feed');
    buzz(6);
    burst(at, 'crumbs', 7, 20);
    return true;
}

export function renameAnimal(i, name) {
    const a = state.animals[i],
        n = (name || '').trim().slice(0, 16);
    if (!a || !n) return false;
    a.name = n;
    return true;
}

// les petits grandissent
export function growTick(dt, quiet) {
    const mult = (rank('nursery') ? 2 : 1) * speedMult();
    let grew = false;
    state.animals.forEach(a => {
        if (isAdult(a)) return;
        a.age = (a.age || 0) + dt * mult;
        if (a.age >= GROW[a.type]) {
            a.adult = true;
            grew = true;
            if (!quiet) {
                const f = a.type === 'chicken' || a.type === 'cow' ? 'e' : '';
                toast(`${a.name} est devenu${f} grand${f} : place à la production !`, ['animal', a.type]);
                sfx(a.type);
            }
        }
    });
    return grew;
}

// une seconde au pâturage
export function animalsTick() {
    let changed = false;
    state.animals.forEach(anim => {
        autoFeed(anim);
        if (!isAdult(anim) || anim.sick || isAway(anim) || anim.food <= 0 || anim.stack >= MAX_STACK) return;
        anim.prodProgress++;
        if (anim.prodProgress < animalTime(anim)) return;
        anim.prodProgress = 0;
        anim.stack++;
        if (!animalSaves(anim)) anim.food--;
        changed = true;
        if (viewShown('animals')) sfx('pop');
    });
    if (growTick(1)) changed = true;
    return changed;
}

// pendant l'absence : renvoie le nombre de produits prêts et de bêtes affamées
export function animalsOffline(elapsed) {
    let products = 0,
        hungry = 0;
    state.animals.forEach(anim => {
        const timeReq = animalTime(anim);
        let t = elapsed;
        autoFeed(anim);
        while (isAdult(anim) && !anim.sick && !isAway(anim) && anim.food > 0 && anim.stack < MAX_STACK) {
            const need = timeReq - anim.prodProgress;
            if (t >= need) {
                t -= need;
                anim.prodProgress = 0;
                anim.stack++;
                anim.food--;
                products++;
                autoFeed(anim);
            } else {
                anim.prodProgress += t;
                break;
            }
        }
        if (isAdult(anim) && anim.food === 0 && anim.stack < MAX_STACK) hungry++;
    });
    return { products, hungry };
}

// texte du nombre produit depuis l'arrivée de la bête
export function producedText(a) {
    const p = ITEMS[ANIMALS[a.type].prodId];
    const many = a.produced > 1;
    return `${fmt(a.produced)} ${p.name.toLowerCase()}${many && !p.name.endsWith('s') && p.id !== 'milk' && p.id !== 'wool' ? 's' : ''} produit${many ? 's' : ''} depuis son arrivée`;
}

// ---------------- 1.8.2 : vendre une bête ----------------
// la moitié de son prix d'achat ; plus pour une bête d'exception ou de race, moins pour un bébé
export function animalSalePrice(a) {
    if (!a) return 0;
    let p = ANIMALS[a.type].cost * 0.5;
    if (a.star) p *= 1.5;
    if (a.race) p *= 1.3;
    if (!isAdult(a)) p *= 0.6;
    return Math.max(5, Math.round(p / 5) * 5);
}
// pas pendant la transhumance, ni quand elle fait un petit à l'étable de sélection
export const animalSellBlock = a =>
    !a
        ? 'introuvable'
        : isAway(a)
          ? 'Elle est en transhumance'
          : state.genetics && state.genetics.breeds && state.genetics.breeds.some(b => b.a === a.uid || b.b === a.uid)
            ? 'Elle fait un petit à l’étable de sélection'
            : '';
export function sellAnimal(i, at) {
    const a = state.animals[i];
    const why = animalSellBlock(a);
    if (why) {
        toast(why, ['ui', 'flowers']);
        sfx('error');
        return false;
    }
    // ce qu'elle a produit part d'abord à la grange
    if (a.stack > 0) collectAnimal(a);
    const price = animalSalePrice(a);
    state.animals.splice(i, 1);
    earn(price, at);
    state.stats.animalsSold = (state.stats.animalsSold || 0) + 1;
    sfx('coin');
    buzz(12);
    toast(`${a.name} est vendu${a.type === 'cow' || a.type === 'goat' || a.type === 'chicken' || a.type === 'ewe' ? 'e' : ''} : ${fmt(price)} pièces`, [
        'animal',
        a.type,
    ]);
    return price;
}
