// 1.173 : L'Équipe du Domaine — centralisée dans Maison › Équipe (Théo, Lina, Henri, Milo).
import { state, lvOk, skill } from '../core/state.js';
import { toast, sfx, buzz, burst } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { RECIPES } from '../data/machines.js';
import { FORAGE } from '../data/nature.js';
import {
    TEAM_LINA,
    TEAM_HENRI,
    TEAM_MILO,
    TEAM_CAMILLE,
    LINA_MODES,
    MILO_MODES,
    CAMILLE_MODES,
    HENRI_TARGET_MIN,
    HENRI_TARGET_MAX,
    HENRI_TARGET_DEFAULT,
    HENRI_STAPLES,
} from '../data/team.js';
import { hasCost, payCost, handLvl, handPaused, machineSlots, setPlanCropPicker } from './home.js';
import { addXp } from './player.js';
import { barnBlocked } from './barn.js';
import { season } from './world.js';
import { maxFood, isResting, collectAnimal } from './animals.js';
import { isAway, netReady, haulNet, castNet } from './port.js';
import { cureCost, cureAnimal } from './incidents.js';
import { recipeUnlocked, canCook, queueQuiet, collectMachine } from './workshop.js';
import { planSummary } from './plan.js';
import { trapReady, haulTrap } from './fishing.js';
import { slotsOf, pickTree } from './orchard.js';
import { natGot } from './nature.js';
import { loadsReady, collectLoads } from './natureplus.js';
import { handleHive } from './farmlife.js';
import { apiaryOpen, apiaryHives, apiaryOf, harvestApiary } from './apiary.js';
import { islandOpen, islandPlots, harvestIsland, plantIsland } from './island.js';
import { oasisOpen, oasisPlots, harvestOasis, plantOasis } from './oasis.js';
import { nordOpen, nordPlots, harvestNord, plantNord, nordChilly, stoveKeys, stoveLit, feedStove } from './nord.js';
import { asieOpen, asiePlots, harvestAsie, plantAsie, clearMud } from './asie.js';
import { tip } from './tips.js';

const FRESH_TEAM = () => ({
    lina: { lvl: 0, t: 0, off: false, mode: 'both' },
    henri: { lvl: 0, t: 0, off: false, rules: [] },
    milo: { lvl: 0, t: 0, off: false, mode: 'all', fg: 0 },
    camille: { lvl: 0, t: 0, off: false, mode: 'both' },
});

let planWired = false;
function pickTheoPlanCrop(isGh) {
    const sum = planSummary();
    if (!sum || !sum.raws || !sum.raws.length) return null;
    // Compter ce qui pousse déjà pour ne pas semer tout le champ avec un seul besoin
    const growing = {};
    for (const p of state.grid) if (p && p.itemId) growing[p.itemId] = (growing[p.itemId] || 0) + 1;
    if (state.greenhouse && state.greenhouse.built) {
        for (const p of state.greenhouse.plots || []) if (p && p.itemId) growing[p.itemId] = (growing[p.itemId] || 0) + 1;
    }
    for (const r of sum.raws) {
        const d = ITEMS[r.id];
        if (!d || d.type !== 'crop' || d.island || (!isGh && d.ghOnly) || !lvOk(d)) continue;
        if ((growing[d.id] || 0) >= r.n) continue;
        if (state.seeds[d.id] > 0 || (!d.exotic && state.money >= d.cost * 4)) return d.id;
    }
    return null;
}

export function ensureTeam() {
    if (!planWired) {
        planWired = true;
        setPlanCropPicker(pickTheoPlanCrop);
    }
    if (!state.team || typeof state.team !== 'object') state.team = FRESH_TEAM();
    const T = state.team;
    if (!T.lina || typeof T.lina !== 'object') T.lina = FRESH_TEAM().lina;
    if (!T.henri || typeof T.henri !== 'object') T.henri = FRESH_TEAM().henri;
    if (!T.milo || typeof T.milo !== 'object') T.milo = FRESH_TEAM().milo;
    if (!T.camille || typeof T.camille !== 'object') T.camille = FRESH_TEAM().camille;
    if (!Array.isArray(T.henri.rules)) T.henri.rules = [];
    if (!LINA_MODES.some(([k]) => k === T.lina.mode)) T.lina.mode = 'both';
    if (!MILO_MODES.some(([k]) => k === T.milo.mode)) T.milo.mode = 'all';
    if (!CAMILLE_MODES.some(([k]) => k === T.camille.mode)) T.camille.mode = 'both';
    return T;
}

// ---------------- Lina · Animaux ----------------
export const linaLvl = () => (state.team && state.team.lina && state.team.lina.lvl) || 0;
export const linaDef = () => TEAM_LINA[linaLvl()] || null;
export const linaNext = () => TEAM_LINA[linaLvl() + 1] || null;
export const linaCanUp = () => {
    const n = linaNext();
    return !!n && state.level >= n.lvl && hasCost(n.cost);
};
export const linaPaused = () => !!(state.team && state.team.lina && state.team.lina.off);
export const linaMode = () => (state.team && state.team.lina && state.team.lina.mode) || 'both';
let linaMsg = '';
export const linaMessage = () => linaMsg;

export function upgradeLina(at) {
    const n = linaNext();
    if (!n || state.level < n.lvl || !hasCost(n.cost)) return false;
    ensureTeam();
    payCost(n.cost);
    state.team.lina.lvl++;
    sfx('level');
    buzz(25);
    burst(at, 'sparkle', 14);
    const l = state.team.lina.lvl;
    toast(l === 1 ? 'Lina rejoint l’équipe pour s’occuper des prés !' : `Lina passe niveau ${l} : ${TEAM_LINA[l].desc}`, ['villager', 'lina']);
    if (l === 1) tip('team');
    return true;
}

export function toggleLina() {
    if (!linaLvl()) return false;
    const T = ensureTeam();
    T.lina.off = !T.lina.off;
    toast(T.lina.off ? 'Lina est en pause' : 'Lina reprend la tournée des prés', ['villager', 'lina']);
    return true;
}

export function setLinaMode(mode) {
    if (!LINA_MODES.some(([k]) => k === mode)) return false;
    ensureTeam().lina.mode = mode;
    return true;
}

export function linaPass() {
    const def = linaDef();
    if (!def || linaPaused()) return null;
    const mode = linaMode();
    let collected = 0,
        fed = 0,
        cured = 0,
        xp = 0;
    const maxF = maxFood();
    state.animals.forEach((a, i) => {
        if (!a || isAway(a) || isResting(a) || a.box || a.trip) return;
        const pIdx = a.p !== undefined ? a.p : a.pasture || 0;
        if (pIdx >= def.pastures) return;
        if (def.heal && a.sick && state.money >= cureCost()) {
            if (cureAnimal(i)) cured++;
        }
        if (mode !== 'feed' && a.stack > 0 && !barnBlocked(true)) {
            const r = collectAnimal(a);
            if (r) {
                collected += r.qty;
                xp += r.xp;
            }
        }
        if (mode !== 'collect' && a.food < maxF && (state.inventory.feed || 0) > 0) {
            const take = Math.min(maxF - a.food, state.inventory.feed);
            if (take > 0) {
                a.food += take;
                state.inventory.feed -= take;
                fed += take;
            }
        }
    });
    if (xp) addXp(xp);
    if (collected || fed || cured) {
        const parts = [];
        if (collected) parts.push(`${collected} produit${collected > 1 ? 's' : ''} ramassé${collected > 1 ? 's' : ''}`);
        if (fed) parts.push(`${fed} repas`);
        if (cured) parts.push(`${cured} soin${cured > 1 ? 's' : ''}`);
        linaMsg = `Lina : ${parts.join(' · ')}`;
        return { collected, fed, cured };
    }
    return null;
}

// ---------------- Henri · Atelier ----------------
export const henriLvl = () => (state.team && state.team.henri && state.team.henri.lvl) || 0;
export const henriDef = () => TEAM_HENRI[henriLvl()] || null;
export const henriNext = () => TEAM_HENRI[henriLvl() + 1] || null;
export const henriCanUp = () => {
    const n = henriNext();
    return !!n && state.level >= n.lvl && hasCost(n.cost);
};
export const henriPaused = () => !!(state.team && state.team.henri && state.team.henri.off);
export const henriMaxSlots = () => (henriDef() ? henriDef().slots + (skill('steward') ? 1 : 0) + (state.ribbonShop && state.ribbonShop.henriPlus ? 1 : 0) : 0);
export const henriRules = () => (state.team && state.team.henri && Array.isArray(state.team.henri.rules) ? state.team.henri.rules : []);
let henriMsg = '';
export const henriMessage = () => henriMsg;

export function upgradeHenri(at) {
    const n = henriNext();
    if (!n || state.level < n.lvl || !hasCost(n.cost)) return false;
    ensureTeam();
    payCost(n.cost);
    state.team.henri.lvl++;
    sfx('level');
    buzz(25);
    burst(at, 'sparkle', 14);
    const l = state.team.henri.lvl;
    toast(l === 1 ? 'Henri rejoint l’équipe à l’atelier !' : `Henri passe niveau ${l} : ${TEAM_HENRI[l].slots} recettes maintenues`, ['villager', 'henri']);
    if (l === 1) tip('team');
    return true;
}

export function toggleHenri() {
    if (!henriLvl()) return false;
    const T = ensureTeam();
    T.henri.off = !T.henri.off;
    toast(T.henri.off ? 'Henri est en pause' : 'Henri reprend la surveillance de l’atelier', ['villager', 'henri']);
    return true;
}

export function henriStockInfo(id) {
    const r = RECIPES[id];
    const perBatch = (r && r.out) || 1;
    const inv = state.inventory[id] || 0;
    let queued = 0,
        out = 0;
    for (const m of state.machines) {
        if (!r || m.type !== r.machine) continue;
        for (const q of m.queue || []) if (q === id) queued += perBatch;
        if (m.out && m.out[id]) out += m.out[id];
    }
    return { inv, queued, out, total: inv + queued + out };
}

export function henriAddRule(id, target = HENRI_TARGET_DEFAULT) {
    if (!henriLvl()) return false;
    const r = RECIPES[id];
    if (!r || !recipeUnlocked(id)) return false;
    if (!state.machines.some(m => m.type === r.machine)) return false;
    const T = ensureTeam();
    if (T.henri.rules.some(x => x.id === id)) return false;
    if (T.henri.rules.length >= henriMaxSlots()) return false;
    const tgt = Math.max(HENRI_TARGET_MIN, Math.min(HENRI_TARGET_MAX, Math.round(target)));
    T.henri.rules.push({ id, target: tgt });
    sfx('click');
    return true;
}

export function henriSetTarget(id, target) {
    const T = ensureTeam();
    const rule = T.henri.rules.find(x => x.id === id);
    if (!rule) return false;
    rule.target = Math.max(HENRI_TARGET_MIN, Math.min(HENRI_TARGET_MAX, Math.round(target)));
    return true;
}

export function henriBumpTarget(id, delta) {
    const T = ensureTeam();
    const rule = T.henri.rules.find(x => x.id === id);
    if (!rule) return false;
    return henriSetTarget(id, rule.target + delta);
}

export function henriRemoveRule(id) {
    const T = ensureTeam();
    const idx = T.henri.rules.findIndex(x => x.id === id);
    if (idx < 0) return false;
    T.henri.rules.splice(idx, 1);
    sfx('click');
    return true;
}

// Recettes disponibles pour la liste d'Henri (machine possédée + recette débloquée + pas déjà dans la liste)
export function henriCandidates(query = '') {
    const owned = new Set(state.machines.map(m => m.type));
    const chosen = new Set(henriRules().map(r => r.id));
    const q = (query || '').trim().toLowerCase();
    const list = Object.values(RECIPES).filter(r => {
        if (!owned.has(r.machine) || chosen.has(r.id) || !recipeUnlocked(r.id)) return false;
        if (!q) return true;
        const name = (ITEMS[r.id] && ITEMS[r.id].name) || r.id;
        return name.toLowerCase().includes(q);
    });
    const stapleIdx = id => {
        const i = HENRI_STAPLES.indexOf(id);
        return i >= 0 ? i : 999;
    };
    return list.sort((a, b) => stapleIdx(a.id) - stapleIdx(b.id) || (a.lvl || 1) - (b.lvl || 1) || (ITEMS[a.id]?.name || '').localeCompare(ITEMS[b.id]?.name || '', 'fr'));
}

export function henriPass() {
    const def = henriDef();
    if (!def || henriPaused()) return null;
    const rules = henriRules().slice(0, henriMaxSlots());
    if (!rules.length) return null;
    let queued = 0,
        collected = 0;
    for (const rule of rules) {
        const r = RECIPES[rule.id];
        if (!r || !recipeUnlocked(rule.id)) continue;
        // 1. Ramasser les lots prêts de cette recette sur les machines concernées
        state.machines.forEach((m, mi) => {
            if (m.type === r.machine && m.out && m.out[rule.id] > 0 && !barnBlocked(true)) {
                const got = collectMachine(mi, null, true);
                if (got) collected += got;
            }
        });
        // 2. Relancer si stock + en cours < seuil
        const perBatch = r.out || 1;
        const info = henriStockInfo(rule.id);
        if (info.total >= rule.target) continue;
        for (let mi = 0; mi < state.machines.length && info.total < rule.target; mi++) {
            const m = state.machines[mi];
            if (m.type !== r.machine) continue;
            const cap = machineSlots(m.type);
            while (m.queue.length < cap && info.total < rule.target && canCook(rule.id)) {
                if (!queueQuiet(mi, rule.id)) break;
                queued++;
                info.total += perBatch;
            }
        }
    }
    if (queued || collected) {
        const parts = [];
        if (queued) parts.push(`${queued} lot${queued > 1 ? 's' : ''} lancé${queued > 1 ? 's' : ''}`);
        if (collected) parts.push(`${collected} ramassé${collected > 1 ? 's' : ''}`);
        henriMsg = `Henri : ${parts.join(' · ')}`;
        return { queued, collected };
    }
    return null;
}

// ---------------- Milo · Nature ----------------
export const miloLvl = () => (state.team && state.team.milo && state.team.milo.lvl) || 0;
export const miloDef = () => TEAM_MILO[miloLvl()] || null;
export const miloNext = () => TEAM_MILO[miloLvl() + 1] || null;
export const miloCanUp = () => {
    const n = miloNext();
    return !!n && state.level >= n.lvl && hasCost(n.cost);
};
export const miloPaused = () => !!(state.team && state.team.milo && state.team.milo.off);
export const miloMode = () => (state.team && state.team.milo && state.team.milo.mode) || 'all';
let miloMsg = '';
export const miloMessage = () => miloMsg;

export function upgradeMilo(at) {
    const n = miloNext();
    if (!n || state.level < n.lvl || !hasCost(n.cost)) return false;
    ensureTeam();
    payCost(n.cost);
    state.team.milo.lvl++;
    sfx('level');
    buzz(25);
    burst(at, 'sparkle', 14);
    const l = state.team.milo.lvl;
    toast(l === 1 ? 'Milo rejoint l’équipe pour veiller sur la nature !' : `Milo passe niveau ${l} : ${TEAM_MILO[l].desc}`, ['villager', 'milo']);
    if (l === 1) tip('team');
    return true;
}

export function toggleMilo() {
    if (!miloLvl()) return false;
    const T = ensureTeam();
    T.milo.off = !T.milo.off;
    toast(T.milo.off ? 'Milo est en pause' : 'Milo reprend sa tournée nature', ['villager', 'milo']);
    return true;
}

export function setMiloMode(mode) {
    if (!MILO_MODES.some(([k]) => k === mode)) return false;
    ensureTeam().milo.mode = mode;
    return true;
}

export function miloPass(allowForage = true) {
    const def = miloDef();
    if (!def || miloPaused()) return null;
    const T = ensureTeam();
    const mode = miloMode();
    let traps = 0,
        fruits = 0,
        loads = 0,
        forage = 0,
        honey = 0,
        seaNet = 0;

    // 1. Nasses prêtes à l'étang + filet de mer + ruches du champ
    if (mode !== 'orchard') {
        if (state.pond && Array.isArray(state.pond.traps)) {
            state.pond.traps.forEach((t, i) => {
                if (trapReady(t) && !barnBlocked(true)) {
                    const got = haulTrap(i);
                    if (got) traps += Object.values(got).reduce((a, b) => a + b, 0);
                }
            });
        }
        // 1.186 : Filet de pêche en mer (relève et relance)
        if (netReady() && !barnBlocked(true)) {
            if (haulNet()) {
                seaNet++;
                castNet();
            }
        }
        // 1.186 : Ruches du champ
        if (Array.isArray(state.grid)) {
            state.grid.forEach((p, i) => {
                if (p && p.deco === 'hive' && Math.floor(p.honey || 0) >= 1 && !barnBlocked(true)) {
                    const before = Math.floor(p.honey || 0);
                    if (handleHive(i)) honey += before;
                }
            });
        }
    }

    // 2. Fruits tombés du verger + ruchers régionaux (dès niv. 3)
    if (mode !== 'wild') {
        const zones = def.lands ? ['farm', 'island', 'oasis', 'nord', 'asie', 'oasisV', 'nordV', 'asieV'] : ['farm'];
        let xp = 0;
        for (const z of zones) {
            slotsOf(z).forEach((slot, k) => {
                if (!slot || !slot.tree || !slot.tree.ground) return;
                const r = pickTree(k, null, true, z);
                if (!r) return;
                fruits += r.qty;
                xp += Math.floor(r.xp / 2);
            });
        }
        if (xp) addXp(xp);
    }
    if (def.lands && mode !== 'orchard') {
        for (const land of ['island', 'oasis', 'nord', 'asie']) {
            if (apiaryOpen(land) && apiaryHives(land) > 0 && !barnBlocked(true)) {
                const jars = Math.floor(apiaryOf(land).honey || 0);
                if (jars >= 1 && harvestApiary(land)) honey += jars;
            }
        }
    }

    // 3. Forêt : charges du bûcheron/mineur + trouvailles saisonnières (dès niv. 2)
    if (mode !== 'orchard' && def.forest) {
        for (const k of ['lumber', 'miner']) {
            if (loadsReady(k) > 0) {
                const got = collectLoads(k);
                if (got) loads += Object.values(got).reduce((a, b) => a + b, 0);
            }
        }
        if (allowForage && state.level >= FORAGE.lvl && !barnBlocked(true)) {
            T.milo.fg = (T.milo.fg || 0) + 1;
            if (T.milo.fg >= 4) {
                T.milo.fg = 0;
                const list = FORAGE.by[season().id];
                if (list && list.length) {
                    const id = list[Math.floor(Math.random() * list.length)];
                    const qty = def.bonusForage ? 2 : 1;
                    state.inventory[id] = (state.inventory[id] || 0) + qty;
                    natGot(id, qty);
                    forage += qty;
                }
            }
        }
    }

    if (traps || fruits || loads || forage || honey || seaNet) {
        const parts = [];
        if (traps) parts.push(`${traps} prise${traps > 1 ? 's' : ''} aux nasses`);
        if (seaNet) parts.push('filet de mer relevé');
        if (honey) parts.push(`${honey} pot${honey > 1 ? 's' : ''} de miel`);
        if (fruits) parts.push(`${fruits} fruit${fruits > 1 ? 's' : ''} au verger`);
        if (loads) parts.push(`${loads} matériaux`);
        if (forage) parts.push(`${forage} cueillette${forage > 1 ? 's' : ''}`);
        miloMsg = `Milo : ${parts.join(' · ')}`;
        return { traps, fruits, loads, forage, honey, seaNet };
    }
    return null;
}

// ---------------- 1.186 : Camille · Intendante des Contrées ----------------
export const camilleLvl = () => (state.team && state.team.camille && state.team.camille.lvl) || 0;
export const camilleDef = () => TEAM_CAMILLE[camilleLvl()] || null;
export const camilleNext = () => TEAM_CAMILLE[camilleLvl() + 1] || null;
export const camilleCanUp = () => {
    const n = camilleNext();
    return !!n && state.level >= n.lvl && hasCost(n.cost);
};
export const camillePaused = () => !!(state.team && state.team.camille && state.team.camille.off);
export const camilleMode = () => (state.team && state.team.camille && state.team.camille.mode) || 'both';
let camilleMsg = '';
export const camilleMessage = () => camilleMsg;

export function upgradeCamille(at) {
    const n = camilleNext();
    if (!n || state.level < n.lvl || !hasCost(n.cost)) return false;
    ensureTeam();
    payCost(n.cost);
    state.team.camille.lvl++;
    sfx('level');
    buzz(25);
    burst(at, 'sparkle', 14);
    const l = state.team.camille.lvl;
    toast(l === 1 ? 'Camille rejoint l’équipe pour s’occuper des contrées !' : `Camille passe niveau ${l} : ${TEAM_CAMILLE[l].desc}`, ['villager', 'camille']);
    if (l === 1) tip('team');
    return true;
}

export function toggleCamille() {
    if (!camilleLvl()) return false;
    const T = ensureTeam();
    T.camille.off = !T.camille.off;
    toast(T.camille.off ? 'Camille est en pause' : 'Camille reprend sa tournée des contrées', ['villager', 'camille']);
    return true;
}

export function setCamilleMode(mode) {
    if (!CAMILLE_MODES.some(([k]) => k === mode)) return false;
    ensureTeam().camille.mode = mode;
    return true;
}

export function camillePass() {
    const def = camilleDef();
    if (!def || camillePaused()) return null;
    const replant = camilleMode() === 'both';
    let harvested = 0,
        planted = 0,
        tended = 0;

    if (def.lands.includes('island') && islandOpen()) {
        islandPlots().forEach((p, k) => {
            if (!p || !p.open || !p.ready || barnBlocked(true)) return;
            const prevId = p.id;
            if (harvestIsland(k, null, true)) {
                harvested++;
                if (replant && prevId && plantIsland(k, prevId, null, true)) planted++;
            }
        });
    }
    if (def.lands.includes('oasis') && oasisOpen()) {
        oasisPlots().forEach((p, k) => {
            if (!p || !p.open || !p.ready || barnBlocked(true)) return;
            const prevId = p.id;
            if (harvestOasis(k, null, true)) {
                harvested++;
                if (replant && prevId && plantOasis(k, prevId, null, true)) planted++;
            }
        });
    }
    if (def.lands.includes('nord') && nordOpen()) {
        if (nordChilly()) {
            for (const k of stoveKeys()) {
                if (!stoveLit(k) && feedStove(k, null, true)) tended++;
            }
        }
        nordPlots().forEach((p, k) => {
            if (!p || !p.open || !p.ready || barnBlocked(true)) return;
            const prevId = p.id;
            if (harvestNord(k, null, true)) {
                harvested++;
                if (replant && prevId && plantNord(k, prevId, null, true)) planted++;
            }
        });
    }
    if (def.lands.includes('asie') && asieOpen()) {
        asiePlots().forEach((p, k) => {
            if (!p || !p.open) return;
            if (p.mud && clearMud(k)) tended++;
            if (!p.ready || p.mud || barnBlocked(true)) return;
            const prevId = p.id;
            if (harvestAsie(k, null, true)) {
                harvested++;
                if (replant && prevId && plantAsie(k, prevId, null, true)) planted++;
            }
        });
    }

    if (harvested || planted || tended) {
        const parts = [];
        if (harvested) parts.push(`${harvested} récolte${harvested > 1 ? 's' : ''}`);
        if (planted) parts.push(`${planted} semis`);
        if (tended) parts.push(`${tended} entretien${tended > 1 ? 's' : ''}`);
        camilleMsg = `Camille : ${parts.join(' · ')}`;
        return { harvested, planted, tended };
    }
    return null;
}

// ---------------- Contrôles globaux de l'Équipe ----------------
export function teamHiredCount() {
    return (handLvl() > 0 ? 1 : 0) + (linaLvl() > 0 ? 1 : 0) + (henriLvl() > 0 ? 1 : 0) + (miloLvl() > 0 ? 1 : 0) + (camilleLvl() > 0 ? 1 : 0);
}
export function teamActiveCount() {
    return (
        (handLvl() > 0 && !handPaused() ? 1 : 0) +
        (linaLvl() > 0 && !linaPaused() ? 1 : 0) +
        (henriLvl() > 0 && !henriPaused() ? 1 : 0) +
        (miloLvl() > 0 && !miloPaused() ? 1 : 0) +
        (camilleLvl() > 0 && !camillePaused() ? 1 : 0)
    );
}
export const teamAnyHired = () => teamHiredCount() > 0;
export const teamAnyActive = () => teamActiveCount() > 0;
export const teamCanUpCount = () => (linaCanUp() ? 1 : 0) + (henriCanUp() ? 1 : 0) + (miloCanUp() ? 1 : 0) + (camilleCanUp() ? 1 : 0);
export const teamCanUp = () => teamCanUpCount() > 0;

export function teamToggleAll() {
    if (!teamAnyHired()) return false;
    const T = ensureTeam();
    const pauseAll = teamAnyActive();
    if (handLvl() > 0) state.farmhand.off = pauseAll;
    if (linaLvl() > 0) T.lina.off = pauseAll;
    if (henriLvl() > 0) T.henri.off = pauseAll;
    if (miloLvl() > 0) T.milo.off = pauseAll;
    if (camilleLvl() > 0) T.camille.off = pauseAll;
    toast(pauseAll ? 'Toute l’équipe du domaine est en pause' : 'Toute l’équipe reprend le travail !', ['villager', 'theo']);
    sfx('click');
    return true;
}

// ---------------- Boucle 1 s et rattrapage hors-ligne ----------------
export function teamTick() {
    if (!state.team) return false;
    const T = ensureTeam();
    let changed = false;

    const pace = base => Math.max(4, Math.round(base * (1 - 0.1 * skill('teamSpeed'))));

    const lDef = linaDef();
    if (lDef && !T.lina.off) {
        T.lina.t = (T.lina.t || 0) + 1;
        if (T.lina.t >= pace(lDef.every)) {
            T.lina.t = 0;
            if (linaPass()) changed = true;
        }
    }

    const hDef = henriDef();
    if (hDef && !T.henri.off) {
        T.henri.t = (T.henri.t || 0) + 1;
        if (T.henri.t >= pace(hDef.every)) {
            T.henri.t = 0;
            if (henriPass()) changed = true;
        }
    }

    const mDef = miloDef();
    if (mDef && !T.milo.off) {
        T.milo.t = (T.milo.t || 0) + 1;
        if (T.milo.t >= pace(mDef.every)) {
            T.milo.t = 0;
            if (miloPass(true)) changed = true;
        }
    }

    const cDef = camilleDef();
    if (cDef && !T.camille.off) {
        T.camille.t = (T.camille.t || 0) + 1;
        if (T.camille.t >= pace(cDef.every)) {
            T.camille.t = 0;
            if (camillePass()) changed = true;
        }
    }

    return changed;
}

export function teamOffline(elapsed) {
    const out = { lina: 0, henri: 0, milo: 0, camille: 0 };
    if (!state.team || elapsed < 60) return out;
    const T = ensureTeam();

    // Lina : un passage de ramassage/nourrissage/soin à la fin de l'absence
    if (linaLvl() > 0 && !T.lina.off) {
        const r = linaPass();
        if (r) out.lina = r.collected + r.fed + r.cured;
    }

    // Henri : un passage de ramassage + relance vers ses seuils
    if (henriLvl() > 0 && !T.henri.off) {
        const r = henriPass();
        if (r) out.henri = r.queued + r.collected;
    }

    // Milo : relève les nasses/vergers/ruches/charges + cueillette proportionnelle (plafonnée à 8)
    const mDef = miloDef();
    if (mDef && !T.milo.off) {
        const r = miloPass(false);
        if (r) out.milo += r.traps + r.fruits + r.loads + (r.honey || 0) + (r.seaNet || 0);
        if (mDef.forest && miloMode() !== 'orchard' && state.level >= FORAGE.lvl && !barnBlocked(true)) {
            const finds = Math.min(8, Math.floor(elapsed / Math.max(120, mDef.every * 4)));
            const list = FORAGE.by[season().id];
            if (finds > 0 && list && list.length) {
                const qty = finds * (mDef.bonusForage ? 2 : 1);
                for (let k = 0; k < qty; k++) {
                    const id = list[Math.floor(Math.random() * list.length)];
                    state.inventory[id] = (state.inventory[id] || 0) + 1;
                    natGot(id, 1);
                }
                out.milo += qty;
            }
        }
    }

    // Camille : un passage sur les contrées à la fin de l'absence
    if (camilleLvl() > 0 && !T.camille.off) {
        const r = camillePass();
        if (r) out.camille = r.harvested + r.planted + r.tended;
    }
    return out;
}
