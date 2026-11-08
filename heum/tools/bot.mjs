// Heum — robot joueur glouton pour mesurer la progression et l'économie (horloge simulée).
// usage : node heum/tools/bot.mjs [heures=12] [passage=1] [stratégie=mut|crit]
//   passage : 1 = toujours en jeu ; 40 = un passage toutes les 10 minutes
import { state, setStore, freshState, setState } from '../src/core/state.js';
import { setClock } from '../src/core/clock.js';
import { setRand } from '../src/core/rand.js';
import * as H from '../src/systems/index.js';
import { CROPS } from '../src/data/crops.js';

const hours = +process.argv[2] || 12;
const every = +process.argv[3] || 1;
const strat = process.argv[4] || 'mut';
const STEP = 15;
let T = 1_800_000_000_000;
setClock(() => T);
setRand(null);
setStore({ getItem: () => null, setItem: () => {} });
setState(freshState());
const log = [];
let lastLvl = 1;
const KEEP = ['scrap', 'metal', 'plastic', 'elec', 'compo', 'fertilizer', 'waste'];
for (let s = 0, k = 0; s < hours * 3600; s += STEP, k++) {
    T += STEP * 1000;
    const online = k % every === 0;
    // absent : tout avance sauf la jauge ; présent : tout
    if (online) H.tick(every === 1 ? STEP : STEP * every);
    else continue;
    state.plots.forEach((p, i) => (H.cropReady(p) ? H.harvest(i) : p.rebel && H.uproot(i)));
    const target = strat === 'crit' ? 88 : 38;
    while (state.level >= 6 && state.cont < target && H.have('fertilizer')) H.spreadFertilizer();
    if (strat !== 'crit' && state.cont >= 58 && state.level >= 3 && H.have('elec') && !H.jobOf('purifier')) H.startJob('purifier', 'purify');
    for (const m of Object.keys(state.machines)) if (H.jobDone(m)) H.collectJob(m);
    if (!H.jobOf('sorter') && H.have('scrap') >= 5) H.startJob('sorter', 'sort');
    if (state.level >= 6 && !H.jobOf('reactor')) {
        if (H.have('fertilizer') < 3) H.startJob('reactor', 'fert');
        else if (H.have('rutabagaGlow') >= 2) H.startJob('reactor', 'canGlow');
        else if (H.have('rutabaga') >= 3) H.startJob('reactor', 'canRuta');
    }
    while (state.wreck.charges > 0) H.search();
    if (H.countOf('hen') < 3) H.buyAnimal('hen');
    if (state.level >= 6 && H.countOf('goat') < 2) H.buyAnimal('goat');
    state.animals.forEach((a, i) => H.collectAnimal(i));
    for (const id of Object.keys(state.inv)) {
        if (KEEP.includes(id)) continue;
        const n = H.have(id) - (id === 'rutabaga' ? 3 : 0);
        if (n > 0 && H.priceOf(id)) H.sell(id, n);
    }
    if (H.have('waste')) H.sell('waste', H.have('waste'));
    while (state.plots.some(p => !p.open) && state.money > H.nextPlotCost() + 60 && H.buyPlot());
    const opts = Object.entries(CROPS)
        .filter(([, c]) => c.lvl <= state.level)
        .sort((a, b) => (b[1].yield * b[1].sell - b[1].seed) / b[1].t - (a[1].yield * a[1].sell - a[1].seed) / a[1].t);
    state.plots.forEach((p, i) => {
        if (p.open && !p.crop && !p.rebel) for (const [id] of opts) if (H.plant(i, id)) break;
    });
    if (state.level !== lastLvl) {
        log.push(`niv ${state.level} à ${(s / 3600).toFixed(1)} h · ${Math.round(state.money)} pièces · jauge ${Math.round(state.cont)}`);
        lastLvl = state.level;
    }
}
console.log(
    `Après ${hours} h (passage ${every}, stratégie ${strat}) : niveau ${state.level}, ${Math.round(state.money)} pièces, ${state.stats.harvests} récoltes, ${state.stats.mutants} mutants`,
);
console.log(log.filter(l => /niv (6|10|13|20|30|40) /.test(l)).join('\n'));
