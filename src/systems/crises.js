// 1.99 : les crises de la vallée (voir data/crises.js).
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { view } from '../core/view.js';
import { toast, sfx, burst } from '../core/bus.js';
import { CRISIS, CRISES } from '../data/crises.js';
import { earn, spend, addXp } from './player.js';

export const crisisOpen = () => state.level >= CRISIS.lvl;
export const curCrisis = () => state.crisis || null;
// 'warn' : l'alerte, on peut se préparer ; 'on' : la crise ; null : rien
export const crisisPhase = (c = state.crisis) => (!c ? null : now() < c.start ? 'warn' : now() < c.end ? 'on' : 'over');
export const crisisCost = () => state.level * CRISIS.costPerLevel;
export const canPrepare = () => {
    const c = state.crisis;
    return !!c && !c.prep && crisisPhase(c) !== 'over' && state.money >= crisisCost();
};
export function prepareCrisis(at) {
    if (!canPrepare()) return false;
    spend(crisisCost());
    state.crisis.prep = true;
    state.crisis.paid = crisisCost();
    sfx('level');
    burst(at, 'sparkle', 10);
    toast(`${CRISES[state.crisis.type].name} : vous êtes prêt`, CRISES[state.crisis.type].icon);
    return true;
}
// le facteur de vitesse ou de prix pendant une crise de ce genre (1 sans crise)
export function crisisMult(kind) {
    const c = state.crisis;
    if (!c || crisisPhase(c) !== 'on') return 1;
    const d = CRISES[c.type];
    return d && d.kind === kind ? (c.prep ? d.prepMult : d.mult) : 1;
}
const gap = () => CRISIS.gap[0] + Math.random() * (CRISIS.gap[1] - CRISIS.gap[0]);

export function startCrisis(type, t = now()) {
    const types = Object.keys(CRISES).filter(k => k !== state.lastCrisis);
    const k = type || types[Math.floor(Math.random() * types.length)];
    state.crisis = { type: k, warn: t, start: t + CRISIS.warn, end: t + CRISIS.warn + CRISIS.last, prep: false, paid: 0 };
    state.lastCrisis = k;
    if (view.started) toast(`Alerte : ${CRISES[k].name.toLowerCase()} dans 12 heures`, CRISES[k].icon);
    return true;
}
function endCrisis() {
    const c = state.crisis;
    state.crisis = null;
    state.nextCrisis = now() + gap();
    state.stats.crises = (state.stats.crises || 0) + 1;
    if (c.prep) {
        state.stats.crisesReady = (state.stats.crisesReady || 0) + 1;
        earn(Math.round(c.paid * CRISIS.reward));
        addXp(CRISIS.xp);
        if (view.started) {
            toast(`${CRISES[c.type].name} passée : la vallée vous remercie`, ['ui', 'heart']);
            sfx('golden');
        }
    } else {
        addXp(Math.round(CRISIS.xp / 4));
        if (view.started) toast(`${CRISES[c.type].name} est passée`, CRISES[c.type].icon);
    }
}
export function crisisTick() {
    if (!crisisOpen()) return false;
    if (state.crisis) {
        if (crisisPhase() === 'over') {
            endCrisis();
            return true;
        }
        return false;
    }
    if (!view.started || view.hidden || !state.tutorial.done) return false;
    if (!state.nextCrisis) state.nextCrisis = now() + CRISIS.firstGap;
    if (now() < state.nextCrisis) return false;
    return startCrisis();
}
export const crisisReady = () => (crisisOpen() && canPrepare() && crisisPhase() === 'warn' ? 1 : 0);
export const crisisName = () => (state.crisis ? CRISES[state.crisis.type].name : '');
export const crisisIcon = () => (state.crisis ? CRISES[state.crisis.type].icon[1] : 'w_heat');
