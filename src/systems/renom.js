// 1.106 : le renom du domaine. Remplir un train, vendre une belle bouteille de la cave ou livrer une commande de bière
// fait parler de la ferme : le grossiste du marché paie alors tout un peu plus cher. Le renom retombe d'un point toutes les 4 heures.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { view } from '../core/view.js';
import { toast } from '../core/bus.js';
import { workFx } from './estate.js';

export const RENOM = { max: 12, per: 0.01, decay: 4 * 3600000, train: 2, cave: 1, beer: 1, lvl: 12 };
// 1.107 : le pigeonnier relève le plafond, la tour de l'horloge ralentit la baisse
export const renomMax = () => RENOM.max + workFx('pigeon');
// 1.107.1 : la table d'hôtes donne un plancher au renom
export const renomFloor = () => workFx('table');
export const renomDecay = () => RENOM.decay + workFx('clock') * 3600000;
const slot = () => state.market.renom || (state.market.renom = { p: 0, at: 0 });
// points entiers restants (la baisse est calculée à la lecture, donc juste aussi hors ligne)
export function renomPts(t = now()) {
    const r = state.market && state.market.renom;
    const fl = renomFloor();
    if (!r || !r.p) return fl;
    return Math.max(fl, r.p - Math.floor(Math.max(0, t - r.at) / renomDecay()));
}
export const renomMult = (t = now()) => 1 + renomPts(t) * RENOM.per;
// temps avant la perte du prochain point
export function renomNext(t = now()) {
    const r = state.market && state.market.renom;
    if (renomPts(t) <= renomFloor()) return 0;
    return renomDecay() - ((t - r.at) % renomDecay());
}
export function addRenom(n, why, at) {
    const t = now(),
        r = slot(),
        before = renomPts(t);
    // on garde le temps déjà écoulé vers la prochaine baisse
    const left = before > renomFloor() ? (t - r.at) % renomDecay() : 0;
    r.p = Math.min(renomMax(), before + n);
    r.at = t - left;
    if (view.started && at !== false) toast(r.p > before ? `Renom du domaine +${r.p - before} : le marché paie ${r.p} % de plus` : 'Renom du domaine au plus haut', ['ui', 'star']);
    return r.p - before;
}
