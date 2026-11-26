// 1.181 : Le Refuge & Clinique Vétérinaire — file de patients (faune sauvage + bêtes de ferme recueillies),
// remèdes naturels, mini-jeu d'auscultation, relâche / adoption, paniers sauvages, agrandissement, boutique & palmarès.

import { state, ecoLvl } from '../core/state.js';
import { now } from '../core/clock.js';
import { fmt, pickRand } from '../core/format.js';
import { emit, toast, sfx, buzz, changed } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { ANIMALS, BIRTHS, NAMES } from '../data/animals.js';
import {
    REFUGE_LVLS,
    WILD_SPECIES,
    WILD_BY_ID,
    REFUGE_REMEDIES,
    REMEDY_BY_ID,
    REFUGE_SHOP,
    REFUGE_PALM,
} from '../data/refuge.js';
import { earn, addXp } from './player.js';
import { hasCost, payCost } from './home.js';
import { wildAnimal, CORE_ANIMAL } from './genetics.js';
import { penKeyOf, pastureFree } from './pastures.js';
import { ensureTcg } from './tcg.js';
import { addPhoto } from './style.js';
import { refugeOpen, refugeSpeciesCount, refugeTotalHealed, refugePalmTotals } from './refugefx.js';

export function ensureRefuge() {
    if (!state.refuge || typeof state.refuge !== 'object') state.refuge = {};
    const r = state.refuge;
    if (!Number.isFinite(r.lvl) || r.lvl < 1) r.lvl = 1;
    if (!Number.isFinite(r.hearts)) r.hearts = 0;
    if (!Number.isFinite(r.healed)) r.healed = 0;
    if (!Number.isFinite(r.released)) r.released = 0;
    if (!Number.isFinite(r.adopted)) r.adopted = 0;
    if (!Number.isFinite(r.uid)) r.uid = 1;
    if (!Number.isFinite(r.nextAt)) r.nextAt = 0;
    if (!Number.isFinite(r.nextBasketAt)) r.nextBasketAt = 0;
    if (!Number.isFinite(r.vitalityUntil)) r.vitalityUntil = 0;
    if (!Number.isFinite(r.breedBalms)) r.breedBalms = 0;
    r.seen ||= {};
    r.palmClaimed ||= {};
    if (!Array.isArray(r.patients)) r.patients = [];
    if (!Array.isArray(r.baskets)) r.baskets = [];
    return r;
}

export const refugeLvl = () => ensureRefuge().lvl;
export const refugeDef = () => REFUGE_LVLS[Math.min(REFUGE_LVLS.length - 1, refugeLvl() - 1)];
export const refugeNext = () => REFUGE_LVLS[refugeLvl()] || null;
export const refugeCanUp = () => refugeOpen() && !!refugeNext() && hasCost(refugeNext().cost);
export const refugeHearts = () => ensureRefuge().hearts;
export const refugePatients = () => ensureRefuge().patients;
export const refugeBaskets = () => ensureRefuge().baskets;
export const refugeSeen = () => ensureRefuge().seen;

export function upgradeRefuge(at = null) {
    const n = refugeNext();
    if (!refugeOpen() || !n || !hasCost(n.cost)) return false;
    payCost(n.cost);
    ensureRefuge().lvl = n.lvl;
    sfx('level');
    buzz(22);
    toast(`${n.name} ouvert ! ${n.beds} lits de soins disponibles`, ['ui', 'refuge']);
    addXp(80 * n.lvl, at);
    emit('changed', 'refuge');
    changed('animals');
    return true;
}

// ---------------- Génération de patients & Paniers sauvages ----------------
function pickWildSpecies(preferRare = false) {
    const r = ensureRefuge();
    const def = refugeDef();
    const list = WILD_SPECIES.map(sp => {
        let w = sp.weight;
        if (preferRare) {
            const missing = !r.seen[sp.id];
            w = (missing ? 40 : 4) * sp.rarity;
        } else if (sp.rarity >= 3) {
            w = w * (1 + def.rareBonus * 2);
        }
        return [sp, w];
    });
    const tot = list.reduce((acc, [, w]) => acc + w, 0);
    let roll = Math.random() * tot;
    for (const [sp, w] of list) {
        if ((roll -= w) <= 0) return sp;
    }
    return WILD_SPECIES[0];
}

function farmAnimalPool() {
    return Object.keys(ANIMALS).filter(
        t => !BIRTHS.skip.includes(t) && !penKeyOf(t) && (ANIMALS[t].reqLvl || 1) <= state.level,
    );
}

function makePatient(forceWildRare = false) {
    const r = ensureRefuge();
    const farmPool = farmAnimalPool();
    const isFarm = !forceWildRare && farmPool.length > 0 && Math.random() < 0.3;
    const remedy = pickRand(REFUGE_REMEDIES);
    if (isFarm) {
        const type = pickRand(farmPool);
        const def = ANIMALS[type];
        const baseName = pickRand(NAMES[type] || [def.name]);
        return {
            uid: 'p' + r.uid++,
            kind: 'farm',
            animalType: type,
            name: baseName,
            title: `${def.name} recueilli`,
            remedy: remedy.id,
            symptom: remedy.symptom,
            phase: 'waiting', // 'waiting' | 'ready' | 'healed'
            stars: 0,
            arrivedAt: now(),
        };
    }
    const sp = pickWildSpecies(forceWildRare);
    return {
        uid: 'p' + r.uid++,
        kind: 'wild',
        species: sp.id,
        name: sp.name,
        habitat: sp.habitat,
        rarity: sp.rarity,
        remedy: remedy.id,
        symptom: remedy.symptom,
        phase: 'waiting',
        stars: 0,
        arrivedAt: now(),
    };
}

export function spawnRefugePatient(forceWildRare = false) {
    const r = ensureRefuge();
    const def = refugeDef();
    if (r.patients.length >= def.beds) return null;
    const p = makePatient(forceWildRare);
    r.patients.push(p);
    r.nextAt = now() + def.everyMs;
    emit('changed', 'refuge');
    return p;
}

export function refugeTick() {
    if (!refugeOpen()) return false;
    const r = ensureRefuge();
    const def = refugeDef();
    const t = now();
    let ch = false;

    // Première arrivée immédiate dès l'ouverture du Refuge pour pouvoir jouer tout de suite
    if (r.patients.length === 0 && r.nextAt === 0) {
        r.patients.push(makePatient(false));
        r.nextAt = t + def.everyMs;
        ch = true;
    } else if (r.patients.length < def.beds) {
        if (!r.nextAt) r.nextAt = t + def.everyMs;
        if (t >= r.nextAt) {
            r.patients.push(makePatient(false));
            r.nextAt = t + def.everyMs;
            ch = true;
        }
    } else {
        r.nextAt = t + def.everyMs;
    }

    // Paniers de la faune reconnaissante (dès 1 espèce sauvage relâchée, max 3 en attente)
    if (refugeSpeciesCount() > 0) {
        if (!r.nextBasketAt) r.nextBasketAt = t + def.basketEveryMs;
        if (r.baskets.length < 3 && t >= r.nextBasketAt) {
            const known = WILD_SPECIES.filter(s => r.seen[s.id] > 0);
            const sp = pickRand(known);
            if (sp) {
                const giftId = pickRand(sp.gift);
                const qty = (refugePalmTotals().doubleBasket ? 2 : 1) * (1 + Math.floor(sp.rarity / 2));
                const coins = Math.round((220 + sp.rarity * 140) * (1 + ecoLvl() / 40) * (refugePalmTotals().doubleBasket ? 2 : 1));
                r.baskets.push({ id: 'b' + r.uid++, species: sp.id, item: giftId, qty, coins });
                r.nextBasketAt = t + def.basketEveryMs;
                ch = true;
            }
        }
    }
    return ch;
}

export function refugeNextPatientMs() {
    const r = ensureRefuge();
    if (r.patients.length >= refugeDef().beds) return 0;
    return Math.max(0, (r.nextAt || 0) - now());
}

// ---------------- Remèdes & Soins ----------------
export function remedyHasItems(remedy) {
    if (!remedy) return false;
    return Object.entries(remedy.need).every(([id, q]) => (state.inventory[id] || 0) >= q);
}

export function canGiveRefugeRemedy(uid) {
    const p = refugePatients().find(x => x.uid === uid);
    if (!refugeOpen() || !p || p.phase !== 'waiting') return false;
    const rem = REMEDY_BY_ID[p.remedy];
    if (!rem) return false;
    if (remedyHasItems(rem)) return 'items';
    if (state.money >= rem.coins) return 'coins';
    return false;
}

export function remedyCostText(remedyId) {
    const rem = REMEDY_BY_ID[remedyId];
    if (!rem) return '';
    if (remedyHasItems(rem)) {
        return Object.entries(rem.need)
            .map(([id, q]) => `${q} × ${(ITEMS[id] && ITEMS[id].name.toLowerCase()) || id}`)
            .join(' + ');
    }
    return `${fmt(rem.coins)} pièces (pharmacie)`;
}

export function giveRefugeRemedy(uid, at = null) {
    const mode = canGiveRefugeRemedy(uid);
    if (!mode) {
        sfx('error');
        return false;
    }
    const p = refugePatients().find(x => x.uid === uid);
    const rem = REMEDY_BY_ID[p.remedy];
    if (mode === 'items') {
        for (const [id, q] of Object.entries(rem.need)) state.inventory[id] -= q;
    } else {
        state.money -= rem.coins;
    }
    p.phase = 'ready';
    sfx('pop');
    toast(`${rem.name} administré à ${p.name} ! Passez aux soins.`, rem.icon);
    emit('changed', 'refuge');
    changed('animals');
    return true;
}

export function finishRefugeCare(uid, score = 0.5, at = null) {
    const p = refugePatients().find(x => x.uid === uid);
    if (!refugeOpen() || !p || p.phase !== 'ready') return null;
    const s = Math.max(0, Math.min(1, Number(score) || 0));
    const stars = s >= 0.8 ? 3 : s >= 0.45 ? 2 : 1;
    p.phase = 'healed';
    p.stars = stars;
    p.score = Math.round(s * 100);
    sfx(stars >= 2 ? 'level' : 'pop');
    buzz(18);
    toast(
        stars === 3
            ? `Soin parfait (3 étoiles) ! ${p.name} est totalement rétabli.`
            : `${p.name} est guéri (${stars} étoile${stars > 1 ? 's' : ''}) !`,
        ['ui', 'vetHeart'],
    );
    emit('changed', 'refuge');
    changed('animals');
    return p;
}

// ---------------- Finalisation : Relâcher / Adopter / Rendre au village ----------------
function starMult(stars) {
    return stars >= 3 ? 1.5 : stars === 2 ? 1.25 : 1;
}

export function releaseWildPatient(uid, at = null) {
    const r = ensureRefuge();
    const idx = r.patients.findIndex(x => x.uid === uid);
    if (idx < 0) return null;
    const p = r.patients[idx];
    if (p.kind !== 'wild' || p.phase !== 'healed') return null;

    const sp = WILD_BY_ID[p.species] || WILD_SPECIES[0];
    const def = refugeDef();
    const mult = def.rewardMult * starMult(p.stars);
    const firstTime = !r.seen[sp.id];

    const coins = Math.round(sp.coins * (1 + ecoLvl() / 35) * mult);
    const hearts = Math.max(1, Math.round(sp.hearts * starMult(p.stars))) + (firstTime ? 2 : 0);
    const xp = Math.round((35 + sp.rarity * 25) * starMult(p.stars));
    const giftId = pickRand(sp.gift);
    const giftQty = p.stars >= 3 ? 2 : 1;

    r.patients.splice(idx, 1);
    r.seen[sp.id] = (r.seen[sp.id] || 0) + 1;
    r.healed++;
    r.released++;
    r.hearts += hearts;
    if (ITEMS[giftId]) state.inventory[giftId] = (state.inventory[giftId] || 0) + giftQty;

    state.income.refuge = (state.income.refuge || 0) + coins;
    earn(coins, at);
    addXp(xp, at);
    if (firstTime) addPhoto('ui', 'wild_' + sp.id, sp.name, 'Secouru au Refuge');

    sfx('level');
    buzz(24);
    toast(
        `${sp.name} relâché${firstTime ? ' (nouvelle espèce !)' : ''} · +${fmt(coins)} pièces, +${hearts} Cœurs`,
        ['ui', 'vetHeart'],
    );
    emit('changed', 'refuge');
    changed('animals');
    return { coins, hearts, xp, giftId, giftQty, firstTime };
}

export function adoptFarmPatient(uid, at = null) {
    const r = ensureRefuge();
    const idx = r.patients.findIndex(x => x.uid === uid);
    if (idx < 0) return null;
    const p = r.patients[idx];
    if (p.kind !== 'farm' || p.phase !== 'healed') return null;

    const pen = state.pastures.findIndex((_, k) => pastureFree(k) > 0);
    if (pen < 0) {
        toast('Aucun pré libre pour accueillir cet animal : agrandissez ou libérez une place.', ['ui', 'barn']);
        sfx('error');
        return null;
    }

    const type = p.animalType;
    const G = state.genetics;
    const g = wildAnimal(type, true);
    const traitRolls = p.stars >= 3 ? 3 : 2;
    for (let i = 0; i < traitRolls; i++) {
        const k = pickRand(CORE_ANIMAL);
        if (g.t && g.t[k]) {
            g.t[k][0] = [Math.min(8, g.t[k][0][0] + 1), 1];
            g.t[k][1] = [Math.min(8, g.t[k][1][0] + 1), 0];
        }
    }
    if (p.stars >= 3 && g.l) {
        const col = 1 + Math.floor(Math.random() * 10);
        const fin = 1 + Math.floor(Math.random() * 3);
        if (g.l.color) g.l.color = [[col, 1], [col, 0]];
        if (g.l.finish) g.l.finish = [[fin, 1], [0, 0]];
    }

    const used = new Set(state.animals.map(a => a.name));
    const name = used.has(p.name) ? `${p.name} du Refuge` : p.name;
    const beast = {
        type,
        food: 5,
        prodProgress: 0,
        stack: 0,
        adult: true,
        age: 999,
        name,
        love: 3,
        petDay: 0,
        produced: 0,
        uid: 'a' + (G ? G.next++ : Date.now()),
        g,
        gen: 1,
        p: pen,
        rescued: 1,
    };
    state.animals.push(beast);

    const hearts = Math.max(1, p.stars);
    r.patients.splice(idx, 1);
    r.healed++;
    r.adopted++;
    r.hearts += hearts;
    addXp(50 * p.stars, at);
    sfx('level');
    buzz(26);
    toast(`${name} adopté dans vos prés ! (+${hearts} Cœurs${p.stars >= 3 ? ', robe rare !' : ''})`, ['animal', type]);
    emit('changed', 'refuge');
    changed('animals');
    return beast;
}

export function returnFarmPatient(uid, at = null) {
    const r = ensureRefuge();
    const idx = r.patients.findIndex(x => x.uid === uid);
    if (idx < 0) return null;
    const p = r.patients[idx];
    if (p.kind !== 'farm' || p.phase !== 'healed') return null;

    const def = refugeDef();
    const mult = def.rewardMult * starMult(p.stars);
    const coins = Math.round(900 * (1 + ecoLvl() / 30) * mult);
    const hearts = 2 + p.stars;
    const xp = 45 * p.stars;

    r.patients.splice(idx, 1);
    r.healed++;
    r.hearts += hearts;
    state.income.refuge = (state.income.refuge || 0) + coins;
    earn(coins, at);
    addXp(xp, at);
    sfx('level');
    toast(`${p.name} rendu à son propriétaire ! +${fmt(coins)} pièces, +${hearts} Cœurs`, ['ui', 'vetHeart']);
    emit('changed', 'refuge');
    changed('animals');
    return { coins, hearts, xp };
}

// ---------------- Paniers de la faune reconnaissante ----------------
export function collectRefugeBasket(id, at = null) {
    const r = ensureRefuge();
    const idx = r.baskets.findIndex(b => b.id === id);
    if (idx < 0) return null;
    const b = r.baskets.splice(idx, 1)[0];
    if (ITEMS[b.item]) state.inventory[b.item] = (state.inventory[b.item] || 0) + b.qty;
    state.income.refuge = (state.income.refuge || 0) + b.coins;
    earn(b.coins, at);
    addXp(25, at);
    sfx('coin');
    const sp = WILD_BY_ID[b.species];
    const itName = (ITEMS[b.item] && ITEMS[b.item].name.toLowerCase()) || b.item;
    toast(`Panier de ${sp ? sp.name : 'la forêt'} : +${b.qty} ${itName} et +${fmt(b.coins)} pièces`, ['ui', 'vetHeart']);
    emit('changed', 'refuge');
    changed('animals');
    return b;
}

// ---------------- Boutique de Bienveillance ----------------
export function canBuyRefugeShop(itemId) {
    const r = ensureRefuge();
    const item = REFUGE_SHOP.find(x => x.id === itemId);
    if (!refugeOpen() || !item || r.hearts < item.cost) return false;
    if (itemId === 'wildCall') return r.patients.length < refugeDef().beds;
    if (itemId === 'tenderness') return state.animals.some(a => a.adult !== false);
    return true;
}

export function buyRefugeShop(itemId, at = null) {
    if (!canBuyRefugeShop(itemId)) {
        sfx('error');
        return false;
    }
    const r = ensureRefuge();
    const item = REFUGE_SHOP.find(x => x.id === itemId);
    r.hearts -= item.cost;

    if (itemId === 'vitality') {
        const base = Math.max(now(), r.vitalityUntil || 0);
        r.vitalityUntil = base + 4 * 3600000;
        sfx('level');
        toast('Sérum de vitalité actif 4 h : +30 % vitesse animaux et immunité maladies !', ['ui', 'vetHeart']);
    } else if (itemId === 'tenderness') {
        let cured = 0,
            loved = 0;
        for (const a of state.animals) {
            if (a.adult === false) continue;
            if (a.sick) {
                a.sick = false;
                cured++;
            }
            if ((a.love || 0) < 5) {
                a.love = (a.love || 0) + 1;
                loved++;
            }
        }
        if (state.incident && state.incident.type === 'sick') state.incident = null;
        sfx('level');
        toast(`Trousse de tendresse : +1 cœur sur ${loved} bête${loved > 1 ? 's' : ''}${cured ? ` et ${cured} guérie` : ''} !`, ['ui', 'vetKit']);
    } else if (itemId === 'wildCall') {
        const p = spawnRefugePatient(true);
        sfx('level');
        toast(`${p ? p.name : 'Un animal sauvage rare'} arrive au Refuge !`, ['ui', 'refuge']);
    } else if (itemId === 'breedBalm') {
        r.breedBalms = (r.breedBalms || 0) + 1;
        sfx('level');
        toast('Baume d’élevage rare ajouté : actif à la prochaine naissance au pré !', ['ui', 'sparkle']);
    } else if (itemId === 'pack') {
        const T = ensureTcg();
        T.freePacks = (T.freePacks || 0) + 1;
        state.prestige.rubans += 1;
        sfx('level');
        toast('Coffret reçu : +1 booster MeuhCG et +1 ruban de Prestige !', ['ui', 'ribbon']);
    }
    emit('changed', 'refuge');
    changed('animals');
    return true;
}

// ---------------- Palmarès Vétérinaire ----------------
export function refugePalmState() {
    const r = ensureRefuge();
    const healed = refugeTotalHealed();
    return REFUGE_PALM.map(t => {
        const reached = healed >= t.need;
        const claimed = !!r.palmClaimed[t.id];
        return { ...t, healed, reached, claimed, canClaim: reached && !claimed };
    });
}

export function claimRefugePalm(tierId, at = null) {
    const r = ensureRefuge();
    const tier = REFUGE_PALM.find(t => t.id === tierId);
    if (!tier || refugeTotalHealed() < tier.need || r.palmClaimed[tierId]) return false;
    r.palmClaimed[tierId] = true;
    state.prestige.rubans += tier.rubans;
    r.hearts += tier.hearts;
    addXp(tier.need * 12, at);
    sfx('level');
    buzz(26);
    toast(`Palier « ${tier.name} » débloqué ! +${tier.rubans} rubans, +${tier.hearts} Cœurs`, ['ui', 'vetHeart']);
    emit('changed', 'refuge');
    changed('animals');
    return true;
}

export function refugeBadgeCount() {
    if (!refugeOpen()) return 0;
    const r = ensureRefuge();
    const actionable = r.patients.filter(p => p.phase === 'healed' || p.phase === 'ready').length;
    const claimable = refugePalmState().filter(t => t.canClaim).length;
    return actionable + r.baskets.length + claimable;
}

export function refugeWildCountText() {
    return `${refugeSpeciesCount()}/${WILD_SPECIES.length}`;
}
