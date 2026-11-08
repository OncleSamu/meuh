// Heum — les Parcelles : planter, attendre, récolter. La Contamination du moment décide de ce qui pousse.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { rnd, pick } from '../core/rand.js';
import { toast, sfx, emit } from '../core/bus.js';
import { CROPS, plotCost } from '../data/crops.js';
import { CONT } from '../data/world.js';
import { spend, give, addXp, lvlOk } from './player.js';
import { tier, addCont } from './contamination.js';

export const cropReady = p => !!p.crop && !p.rebel && now() >= p.at + CROPS[p.crop].t * 1000;
export const cropLeft = p => (p.crop ? Math.max(0, (p.at + CROPS[p.crop].t * 1000 - now()) / 1000) : 0);
export const cropsOpen = () => Object.entries(CROPS).filter(([, c]) => c.lvl <= state.level);
export const openCount = () => state.plots.filter(p => p.open).length;
export const nextPlotCost = () => plotCost(openCount());

export function plant(i, id) {
    const p = state.plots[i],
        c = CROPS[id];
    if (!p || !p.open || p.crop || p.rebel || !c) return false;
    if (!lvlOk(c.lvl, c.name)) return false;
    if (!spend(c.seed)) {
        toast(`Il faut ${c.seed} pièces pour semer`);
        sfx('error');
        return false;
    }
    Object.assign(p, { crop: id, at: now() });
    sfx('plant');
    return true;
}

// ce que donne une récolte selon le palier ; renvoie { got: [[id, n]], rebel, waste }
export function harvestRoll(id, t) {
    const c = CROPS[id];
    if (t === 'crit') return { got: [['waste', 1]], waste: true };
    const ch = CONT.mutChance[t] || 0;
    if (c.mut && ch && rnd() < ch) {
        const got =
            t === 'unst'
                ? [[c.mut, 2]]
                : [
                      [c.mut, 1],
                      [id, c.yield - 1],
                  ];
        return { got: got.filter(([, n]) => n > 0), mutant: true, rebel: t === 'unst' && rnd() < CONT.rebelChance };
    }
    return { got: [[id, c.yield]], rebel: t === 'unst' && rnd() < CONT.rebelChance };
}

export function harvest(i) {
    const p = state.plots[i];
    if (!p || !cropReady(p)) return null;
    const c = CROPS[p.crop];
    const r = harvestRoll(p.crop, tier().id);
    for (const [id, n] of r.got) give(id, n);
    state.stats.harvests++;
    if (r.mutant) state.stats.mutants++;
    addXp(c.seed + 2 + (r.mutant ? 10 : 0));
    Object.assign(p, { crop: null, at: 0, rebel: !!r.rebel });
    sfx(r.mutant ? 'mutant' : r.waste ? 'waste' : 'harvest');
    emit('harvest', { i, ...r });
    return r;
}

// un Rebelle bloque sa parcelle : on l'arrache d'un appui
export function uproot(i) {
    const p = state.plots[i];
    if (!p || !p.rebel) return false;
    p.rebel = false;
    addXp(2);
    sfx('uproot');
    return true;
}

export function buyPlot() {
    const p = state.plots.find(x => !x.open);
    if (!p) return false;
    const cost = nextPlotCost();
    if (!spend(cost)) {
        toast(`Il faut ${cost} pièces pour défricher`);
        sfx('error');
        return false;
    }
    p.open = true;
    sfx('build');
    return true;
}

// les Rebelles ne bougent que pendant qu'on joue (hors ligne, rien ne se propage)
const near = i => [i - 3, i + 3, i % 3 ? i - 1 : -1, i % 3 < 2 ? i + 1 : -1].filter(j => j >= 0 && j < 9);
export function rebelTick(dt) {
    const rebels = state.plots.map((p, i) => (p.rebel ? i : -1)).filter(i => i >= 0);
    if (!rebels.length) {
        state.rebelClock = 0;
        return;
    }
    addCont((CONT.rebelPush * rebels.length * dt) / 60);
    state.rebelClock = (state.rebelClock || 0) + dt;
    if (state.rebelClock < CONT.rebelEvery) return;
    state.rebelClock = 0;
    const targets = rebels.flatMap(near).filter(j => state.plots[j].open && state.plots[j].crop && !state.plots[j].rebel);
    if (!targets.length) return;
    const j = pick(targets);
    Object.assign(state.plots[j], { crop: null, at: 0, rebel: true });
    toast('Un Rebelle a gagné une parcelle voisine !');
    sfx('error');
}
