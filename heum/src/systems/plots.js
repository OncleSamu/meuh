// Heum — les Parcelles : planter, attendre, récolter. La Contamination du moment décide de ce qui pousse.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { rnd, pick } from '../core/rand.js';
import { toast, sfx, emit } from '../core/bus.js';
import { CROPS, MUTANTS, plotCost, cropDef, GEAR } from '../data/crops.js';
import { CONT, tierOf } from '../data/world.js';
import { spend, give, take, have, addXp, lvlOk, nameOf } from './player.js';
import { CONT as CONTD } from '../data/world.js';
import { addCont } from './contamination.js';

export const cropReady = p => !!p.crop && !p.rebel && now() >= p.at + cropDef(p.crop).t * 1000;
export const cropLeft = p => (p.crop ? Math.max(0, (p.at + cropDef(p.crop).t * 1000 - now()) / 1000) : 0);
// V2 : la Contamination propre à une parcelle (jauge de la ferme + son équipement)
export const plotCont = p => Math.max(0, Math.min(100, state.cont + (p.gear && GEAR[p.gear] ? GEAR[p.gear].mod : 0)));
export const plotTier = p => tierOf(plotCont(p));
// les graines stables : les mutants fixés au labo
export const stableOpen = () => Object.keys(state.fixed || {}).filter(id => cropDef(id));
export const cropsOpen = () => Object.entries(CROPS).filter(([, c]) => c.lvl <= state.level);
export const openCount = () => state.plots.filter(p => p.open).length;
export const nextPlotCost = () => plotCost(openCount());

export function plant(i, id) {
    const p = state.plots[i],
        c = cropDef(id);
    if (!p || !p.open || p.crop || p.rebel || !c) return false;
    if (c.stable && !(state.fixed || {})[id]) return false;
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
    const c = cropDef(id);
    if (t === 'crit') return { got: [['waste', 1]], waste: true };
    // une graine stable donne toujours son mutant, sans Rebelle
    if (c.stable) return { got: [[id, c.yield]], mutant: true, stable: true };
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
    const c = cropDef(p.crop);
    const r = harvestRoll(p.crop, plotTier(p).id);
    const ch = Math.round(plotCont(p));
    for (const [id, n] of r.got) give(id, n, id === 'waste' ? 100 : ch);
    // le chou-éponge absorbe la Contamination
    const clean = r.got.reduce((a, [id, n]) => a + (MUTANTS[id] && MUTANTS[id].clean ? MUTANTS[id].clean * n : 0), 0);
    if (clean) addCont(-clean);
    r.clean = clean;
    state.stats.harvests++;
    if (r.mutant) state.stats.mutants++;
    addXp(Math.min(40, c.seed) + 2 + (r.mutant && !r.stable ? 10 : 0));
    Object.assign(p, { crop: null, at: 0, rebel: !!r.rebel });
    sfx(r.mutant ? 'mutant' : r.waste ? 'waste' : 'harvest');
    emit('harvest', { i, ...r });
    return r;
}

// un Rebelle bloque sa parcelle : on l'arrache d'un appui
export function uproot(i) {
    const p = state.plots[i];
    if (!p || !p.rebel) return false;
    // 0.3 : un outil (1 métal) ou, à défaut, 15 pièces de main-d'œuvre
    if (have('metal') >= 1) take('metal', 1);
    else if (!spend(CONTD.uprootMoney)) {
        toast(`Pour arracher un Rebelle : 1 métal ou ${CONTD.uprootMoney} pièces`);
        sfx('error');
        return false;
    }
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
const near = i => [i - 3, i + 3, i % 3 ? i - 1 : -1, i % 3 < 2 ? i + 1 : -1].filter(j => j >= 0 && j < state.plots.length);
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

// V2 : poser ou retirer l'équipement d'une parcelle (voile, concentrateur) ; il revient au stock quand on l'enlève
export function setGear(i, g) {
    const p = state.plots[i];
    if (!p || !p.open) return false;
    if (g && !GEAR[g]) return false;
    if (g && !have(g)) {
        toast(`Pas de ${nameOf(g).toLowerCase()} : l’Établi en fabrique`);
        sfx('error');
        return false;
    }
    if (p.gear) give(p.gear, 1);
    if (g) take(g, 1);
    p.gear = g || null;
    sfx('build');
    return true;
}
