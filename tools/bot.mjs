// Robot de jeu : joue efficacement en accéléré, sans interface, et mesure le temps pour chaque niveau.
// usage : node tools/bot.mjs [heures=60] [graine=777]
import { setClock } from '../src/core/clock.js';
import { state, setStore } from '../src/core/state.js';
import { setView } from '../src/core/view.js';
import * as G from '../src/systems/index.js';
import { ITEMS } from '../src/data/items.js';
import { ANIMALS } from '../src/data/animals.js';
import { MACHINES, MACHINE_SLOTS, RECIPES } from '../src/data/machines.js';
import { DECOS, UPGRADES } from '../src/data/farm.js';
import { PROJECTS, STORIES, RIVALS, CHAPTERS } from '../src/data/village.js';
import { RARE, STALL_MAX_QTY, CONTEST_POINTS } from '../src/data/commerce.js';
import { FISH } from '../src/data/meta.js';
import { NATURE } from '../src/data/nature.js';
import { TRANS_KINDS } from '../src/data/animals.js';
import { FARM_SEASON_TIERS } from '../src/data/port.js';
import { CAVE_ITEMS, CAVE_SHELVES, CAVE_GEAR } from '../src/data/cave.js';
import { BALANCE } from '../src/data/progress.js';
import { MALT_IDS } from '../src/data/abbey.js';
import { SKILLS, ACHIEVEMENTS } from '../src/data/meta.js';
import { pickRand } from '../src/core/format.js';

const hours = +(process.argv[2] || 60),
    seed = +(process.argv[3] || 777);

// hasard reproductible (le même que le robot de la 6.2)
Math.random = (() => {
    let a = seed;
    return () => {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
})();
let now = Date.UTC(2026, 3, 1, 8, 0, 0);
setClock(() => now);
setStore(null);
G.loadGame();
setView({ tab: 'none', started: true, hidden: false });
state.tutorial.done = true;

const xpBy = {};
const levels = { 1: 0 };
let t = 0;
const stuck = {};
const log = [];
const tag = (s, fn) => {
    const lvl = state.level,
        xp0 = state.xp;
    fn();
    // expérience gagnée pendant le geste (approximatif lors d'un passage de niveau)
    const gained = state.level === lvl ? state.xp - xp0 : G.getXpReq(lvl) - xp0 + state.xp;
    if (gained > 0) xpBy[s] = (xpBy[s] || 0) + gained;
};

const crops = () => Object.values(ITEMS).filter(i => i.type === 'crop' && !i.exotic && !i.ghOnly && G.storyOk(i) && state.level >= i.reqLvl);
// produits à affiner : ce que la cave peut accueillir
const caveWant = () => {
    if (!G.caveOpen()) return {};
    const free = state.cave.slots.filter(l => !l).length;
    const ok = Object.keys(CAVE_ITEMS).filter(id => RECIPES[id] && G.recipeUnlocked(id) && G.hasMachine(RECIPES[id].machine));
    ok.sort((a, b) => ITEMS[b].sell - ITEMS[a].sell);
    const m = G.caveLotMax();
    return free && ok.length ? { [ok[0]]: m, ...(ok[1] && free > 1 ? { [ok[1]]: m } : {}) } : {};
};
// quantités utiles : commandes, train, montgolfière, chantiers, et ingrédients de ces produits
const need = () => {
    const n = {};
    const add = (id, q) => (n[id] = (n[id] || 0) + q);
    state.quests.forEach(q => G.isOpen(q) && q.items.forEach(x => add(x.id, x.qty)));
    if (state.truck.status === 'here') state.truck.slots.forEach(sl => !sl.loaded && add(sl.id, sl.qty));
    if (state.balloon.status === 'here') state.balloon.items.forEach(x => add(x.id, x.qty));
    if (state.boat.status === 'here') state.boat.items.forEach(x => add(x.id, x.qty));
    if (state.incident && state.incident.type === 'express') state.incident.items.forEach(x => add(x.id, x.qty));
    Object.values(PROJECTS).forEach(p => G.projectOpen(p.id) && Object.keys(p.need).forEach(id => add(id, G.projectLeft(p.id, id))));
    const ct = state.contract;
    if (ct && !ct.done) add(ct.item, ct.qty - ct.given);
    Object.keys(STORIES).forEach(v => G.villagerStoryOpen(v) && Object.keys(G.storyNeed(v)).forEach(k => add(k, G.storyLeftOf(v, k))));
    if (G.rareActive('critic') && !state.rare.served) add(state.rare.dish, 1);
    const df = G.curDefi();
    if (df && !df.awarded) df.steps.forEach(st => st.kind === 'give' && !st.done && st.items.forEach(x => add(x.id, x.n - x.got)));
    const bc = G.barnUpCost(state.barn.lvl);
    ['plank', 'nail'].forEach(id => add(id, Math.max(0, bc[id] - state.inventory[id])));
    if (state.level >= 11 && G.toolLvl('forest') < 3) add('tools', 1);
    const hn = G.houseNext();
    if (hn && state.level >= hn.lvl) ['beam', 'plank', 'nail', 'tools'].forEach(id => hn.cost[id] && add(id, hn.cost[id]));
    const kn = G.handLvl() && G.handNext();
    if (kn && state.level >= kn.lvl) add('tools', kn.cost.tools);
    // la brasserie : de quoi tenir deux brassins d'avance
    if (G.brewOpen()) {
        const maltStock = MALT_IDS.reduce((x, m) => x + (state.inventory[m] || 0), 0);
        if (maltStock < 8) add(MALT_IDS[(state.day || 0) % 4], 8);
        add('hop', Math.max(0, 12 - (state.inventory.hop || 0)));
    }
    // ingrédients des produits demandés, sur trois étages (flan coco → lait de coco → noix de coco)
    let level = Object.keys(n);
    for (let d = 0; d < 3 && level.length; d++) {
        const next = [];
        level.forEach(id => {
            const r = RECIPES[id];
            const miss = Math.max(0, n[id] - state.inventory[id]);
            if (r && miss) Object.entries(r.ing).forEach(([k, q]) => (next.push(k), add(k, q * miss)));
        });
        level = next;
    }
    return n;
};

function farm() {
    const nd = need();
    const best = crops()
        .sort((a, b) => (b.sell - b.cost) / b.time - (a.sell - a.cost) / a.time)
        .slice(0, 4);
    const wanted = crops().filter(c => (nd[c.id] || 0) > state.inventory[c.id]);
    let k = 0;
    // le verger : un arbre quand un fruit est demandé et qu'aucun ne pousse ; ramasser ; débiter les morts
    if (G.orchardOpen()) {
        state.orchard.slots.forEach((sl, j) => {
            if (!sl.tree) return;
            if (G.treeStage(sl.tree) === 'dead') G.fellTree(j);
            else if (sl.tree.ground && !G.barnBlocked(true))
                tag('verger', () => {
                    const r = G.pickTree(j, null, true);
                    if (r) G.addXp(r.xp);
                });
        });
        const tree = G.treeList().find(d => state.level >= d.reqLvl && (nd[d.id] || 0) > state.inventory[d.id] && !G.livingTrees(d.id));
        if (tree && state.money > tree.cost * 3) {
            let j = state.orchard.slots.findIndex(x => x.open && !x.tree);
            if (j < 0 && state.money > G.slotCost() * 3 && G.buySlot()) j = state.orchard.slots.findIndex(x => x.open && !x.tree);
            if (j >= 0) G.plantTree(j, tree.id);
        }
    }
    G.allPlots().forEach(([p, i]) => {
        if (!p.isUnlocked) return;
        if (p.pest) tag('imprévus', () => G.treatPest(i));
        if (p.terrain === 'grass') p.terrain = 'plowed';
        if (p.itemId && p.isReady && !G.barnBlocked(true))
            tag('récoltes', () => {
                const r = G.harvestPlot(p);
                G.addXp(r.item.xp);
                G.rollRare(BALANCE.rareDrop);
            });
        if (!p.itemId && !p.deco) {
            const pick = wanted.length ? wanted[k % wanted.length] : best[k % best.length];
            k++;
            if (pick && state.money > pick.cost + 50) G.plantSeed(p, pick.id);
        }
        if (p.itemId) p.isWatered = true;
    });
    if (state.unlockedPlots < 36 && state.money > G.getExpCost() * 3) G.buyExp();
}

function animals() {
    if (G.herdFull() && state.money > G.pastureCost() * 2) G.buyPasture();
    Object.values(ANIMALS).forEach(a => {
        const n = G.animalCount(a.id);
        if (state.level >= a.reqLvl && n < 3 && state.money > a.cost * 2.5) G.buy('animal', a.id, 1);
    });
    if (state.inventory.feed < 30 && state.money > 200) {
        state.money -= 60;
        state.inventory.feed += 30;
    }
    state.animals.forEach((a, k) => {
        if (a.sick && state.money > G.cureCost() * 2) tag('imprévus', () => G.cureAnimal(k));
        while (a.food < G.maxFood() && state.inventory.feed > 0) {
            a.food++;
            state.inventory.feed--;
        }
        if (a.stack && !G.barnBlocked(true))
            tag('animaux', () => {
                const r = G.collectAnimal(a);
                G.addXp(r.xp);
            });
    });
}

function machines() {
    Object.values(MACHINES).forEach(m => {
        if (state.level >= m.reqLvl && !G.hasMachine(m.id) && state.money > m.cost * 1.5 && G.hasMats(G.matCost('machine', m.id))) G.buy('machine', m.id, 1);
    });
    const nd = need();
    state.machines.forEach((m, i) => {
        if (G.outCount(m)) tag('atelier', () => G.collectMachine(i, null, true));
        let guard = 0;
        while (m.queue.length < MACHINE_SLOTS && guard++ < 4) {
            const opts = G.recipesOf(m.type).filter(r => G.recipeUnlocked(r.id) && G.canCook(r.id));
            if (!opts.length) break;
            const cw = caveWant();
            const dem = x => (nd[x.id] || 0) - state.inventory[x.id];
            opts.sort(
                (a, b) =>
                    dem(b) - dem(a) ||
                    (cw[b.id] && state.inventory[b.id] < cw[b.id] ? 1 : 0) - (cw[a.id] && state.inventory[a.id] < cw[a.id] ? 1 : 0) ||
                    (ITEMS[b.id].sell || 0) / b.time - (ITEMS[a.id].sell || 0) / a.time,
            );
            const r = opts[0];
            if (!(nd[r.id] > state.inventory[r.id]) && G.barnSpace() < G.barnCap() * 0.3) break;
            // comme le joueur : les meilleurs ingrédients d'abord (plats d'argent et d'or)
            if (!G.queueRecipe(i, r.id, null)) break;
        }
    });
}

function orders() {
    state.quests.forEach((q, i) => {
        if (!G.isOpen(q)) return;
        const key = q.items.map(x => x.id + x.qty).join() + q.gold;
        if (G.checkQuestReady(q)) {
            tag('commandes', () => G.turnInQuest(i));
            return;
        }
        stuck[key] = (stuck[key] || 0) + 5;
        if (stuck[key] > 2400) {
            G.trashQuest(i);
            delete stuck[key];
        }
    });
    const tr = state.truck;
    if (tr.status === 'here')
        tr.slots.forEach((sl, k) => {
            if (!sl.loaded && state.inventory[sl.id] >= sl.qty) tag('train', () => G.loadSlot(k));
        });
    if (state.balloon.status === 'here' && G.hasAll(state.balloon.items)) tag('montgolfière', () => G.sendBalloon());
    if (state.boat.status === 'here' && G.hasAll(state.boat.items)) tag('bateau', () => G.sendBoat());
    if (G.netOpen() && !state.net.until) G.castNet();
    if (G.netReady() && !G.barnBlocked(true)) tag('nature', () => G.haulNet());
    if (G.transOpen() && !state.trans.returnAt) {
        const pick = state.animals
            .map((a, i) => [a, i])
            .filter(([a]) => TRANS_KINDS.includes(a.type) && G.isAdult(a) && !a.alpine)
            .slice(0, G.transMax())
            .map(([, i]) => i);
        if (pick.length) G.startTrans(pick);
    }
    if (G.farmSeasonOpen()) for (let k = 0; k < FARM_SEASON_TIERS.length; k++) tag('saison', () => G.claimSeasonTier(k));
    const inc = state.incident;
    if (inc && inc.type === 'express' && G.hasAll(inc.items)) tag('commandes', () => G.deliverExpress());
    Object.values(PROJECTS).forEach(p => {
        if (!G.projectOpen(p.id)) return;
        G.giveAllToProject(p.id);
        if (G.projectComplete(p.id)) {
            tag('chantiers', () => G.finishProject(p.id));
            log.push(`${Math.round(t / 60)} min : ${p.name} (niv. ${state.level})`);
        }
    });
    if (state.neighbors)
        RIVALS.forEach(
            (r, k) => state.neighbors[k] && state.neighbors[k].req && G.hasAll(state.neighbors[k].req.items) && tag('voisins', () => G.helpNeighbor(k)),
        );
    for (let k = 0; k < 3; k++) if (state.contest && !state.contest.tiers[k]) G.claimContestTier(k);
    G.ensureContract();
    if (G.contractReady()) tag('commandes', () => G.giveContract());
    Object.keys(STORIES).forEach(v => G.villagerStoryReady(v) && tag('commandes', () => G.giveStory(v)));
    if (G.rareActive('critic') && !state.rare.served && state.inventory[state.rare.dish] > 0) tag('commandes', () => G.serveCritic());
    if (G.rareActive('fair')) state.rare.offers.forEach((o, k) => !o.sold && state.money > o.price * 4 && G.buyStarAnimal(k));
    if (state.merchant.status === 'here')
        state.merchant.stock.forEach((o, k) => {
            if (!o.sold && o.kind === 'rare' && state.money > o.price * 3) G.buyMerchant(k);
        });
    if (RARE.every(id => state.inventory[id] >= G.barnUpCost(state.barn.lvl)[id]) && state.money > G.barnUpCost(state.barn.lvl).coins * 2) G.upgradeBarn();
}

function sell() {
    // l'étal : encaisser, puis remettre en vente le surplus le plus précieux au prix normal
    G.ensureStall();
    state.stall.slots.forEach((x, k) => x && x.sold && G.collectStall(k, null, true));
    state.stall.slots.forEach((x, k) => {
        if (x) return;
        const id = G.stallChoices().find(i => G.sellableQty(i) - (need()[i] || 0) >= 3);
        if (!id) return;
        G.listStall(k, id, Math.min(STALL_MAX_QTY, G.sellableQty(id) - (need()[id] || 0)), 1);
    });
    const nd = need();
    const full = G.barnUsed() > G.barnCap() * 0.7;
    Object.keys(ITEMS).forEach(id => {
        const it = ITEMS[id];
        if (!it.sell || !state.inventory[id]) return;
        const usedInRecipe = Object.values(RECIPES).some(r => r.ing[id] && G.hasMachine(r.machine) && G.recipeUnlocked(r.id));
        const keep = (nd[id] || 0) + (usedInRecipe && !full ? 4 : 0);
        const n = state.inventory[id] - keep;
        if (n > 0 && (full || !G.inBarn(id) || !usedInRecipe)) {
            const r = G.sellBatch(id, n, true);
            G.earn(r.gain, null);
        }
    });
}

function progress() {
    Object.keys(SKILLS).forEach(b =>
        SKILLS[b].list.forEach((sk, k) => {
            if (G.skillPoints() > 0 && G.rank(sk.id) < sk.max && !G.skillReq(b, k)) G.learnSkill(b, k);
        }),
    );
    ACHIEVEMENTS.forEach(a => {
        if (G.achClaimable(a)) tag('succès', () => G.claimAchievement(a.id));
    });
    if (state.inventory.tools > 0) ['forest', 'mine'].forEach(k => G.upgradeTool(k));
    if (state.level >= DECOS.lightningRod.reqLvl && !G.hasRod() && state.money > DECOS.lightningRod.cost * 3) {
        const spot = state.grid.find(p => p.isUnlocked && !p.deco && (!p.itemId || ITEMS[p.itemId].type === 'crop'));
        if (spot) {
            G.spend(DECOS.lightningRod.cost);
            G.resetPlot(spot, null);
            spot.deco = 'lightningRod';
        }
    }
    const hn = G.houseNext();
    if (hn && state.level >= hn.lvl && G.hasCost({ ...hn.cost, coins: hn.cost.coins * 2 })) G.upgradeHouse();
    const kn = G.handNext();
    if (G.handLvl() && kn && state.level >= kn.lvl && G.hasCost({ ...kn.cost, coins: kn.cost.coins * 2 })) G.upgradeHand();
    ['speed', 'price', 'feeder'].forEach(u => {
        if (state.upgrades[u] < UPGRADES[u].maxLvl && state.money > G.upgradeCost(u) * 4) G.buyUpgrade(u);
    });
    // forêt et mine : un arbre ou une roche toutes les 30 s environ (vrais coups de hache et de pioche)
    if (t % 30 === 0 && state.level >= 3)
        tag('nature', () => {
            G.ensureNature();
            ['forest', 'mine'].forEach(kind => {
                if (state.level < NATURE[kind].lvl) return;
                const k = state[kind].findIndex(sl => G.slotUp(sl));
                for (let n = 0; k >= 0 && n < 12; n++) if (G.hitSlot(kind, k) !== 'hit') break;
            });
        });
    // la mine : l'équipement, la profondeur, les ouvriers, la charbonnière, Gaspard, les bâtiments
    if (t % 600 === 0 && state.level >= 3) {
        tag('nature', () => {
            G.ensureNature();
            ['lamp', 'cart'].forEach(k => state.money > 12000 && G.buyGear(k));
            ['cave', 'gallery'].find(d => G.depthOpen(d) && (G.setDepth(d) || state.nat.depth === d));
            ['lumber', 'miner'].forEach(k => {
                if (G.workerOpen(k) && !G.workerLvl(k) && state.money > 20000) G.hireWorker(k);
                if (G.workerLvl(k) && G.workerNext(k) && state.money > 80000) G.upgradeWorker(k);
                G.collectLoads(k);
            });
            if (G.kilnOpen() && !state.nat.kiln && state.money > 5000) G.buildKiln();
            if (G.kilnReady()) G.kilnTake();
            if (state.nat.kiln && !G.kilnBusy() && state.inventory.wood > 40) G.kilnLight();
            if (G.gaspardReady()) G.claimGaspard();
            // le verger : cueilleur, Odile, greffons
            if (G.pickerOpen() && G.pickerNext() && state.money > 60000) G.upgradePicker();
            if (G.ensureOdile() && G.odileReady()) G.claimOdile();
            state.orchard.slots.forEach((sl, k) => {
                if (!sl.tree || sl.tree.g) return;
                const id = ['eternal', 'double', 'gold', 'robust'].find(g => G.graftStock(g));
                if (id) G.graftTree(k, id);
            });
            ['barn', 'pens', 'cave', 'orchard', 'ladder', 'basket', 'greenhouse', 'traps'].forEach(
                id => G.bldOpen(id) && G.bldCan('b', id) && state.money > G.bldNext('b', id).cost.coins * 3 && G.upgradeBld('b', id),
            );
            state.machines.forEach(m => G.bldCan('m', m.type) && state.money > G.bldNext('m', m.type).cost.coins * 4 && G.upgradeBld('m', m.type));
        });
    }
    // la pêche : un lancer toutes les 2 minutes, les nasses, Marcel et le concours
    if (t % 120 === 0 && state.level >= NATURE.pond.lvl && !G.barnBlocked(true)) {
        G.ensurePond();
        const spot = pickRand(['bank', 'reeds', 'pier'].filter(G.spotOpen));
        const id = G.pickFish(spot, null);
        const [a, b] = FISH[id].w;
        G.landFish(id, a + (b - a) * Math.random(), null, Math.random() < 0.2);
    }
    if (t % 60 === 0 && state.pond) {
        if (state.pond.traps.length < G.trapMax() && state.money > 5000) G.buyTrap();
        state.pond.traps.forEach((x, i) => {
            if (G.trapReady(x) && !G.barnBlocked(true)) G.haulTrap(i);
            else if (!x.start) G.setTrap(i, G.spotOpen('reeds') && i % 2 ? 'reeds' : 'bank', 'worm');
        });
        if (G.marcelReady()) G.claimMarcel();
        if (G.runReady()) G.claimRun();
        if (G.contestResultReady()) G.claimContest();
    }
}

// la cave : mettre en cave ce qui dépasse, soigner, régler le climat, vendre
function cave() {
    if (!G.caveOpen()) return;
    G.ensureCave();
    const c = state.cave,
        nd = need();
    if (CAVE_SHELVES[c.shelves] !== undefined && state.money > CAVE_SHELVES[c.shelves] * 4) G.buyShelf();
    Object.keys(CAVE_GEAR).forEach(k => !c.gear[k] && state.money > CAVE_GEAR[k].cost * 5 && G.buyCaveGear(k));
    ['temp', 'hum'].forEach(k => !G.inBand(c[k]) && G.nudgeClimate(k, c[k] < 50 ? 1 : -1));
    c.slots.forEach((lot, i) => {
        if (!lot) {
            const id = Object.keys(CAVE_ITEMS)
                .filter(x => state.inventory[x] - (nd[x] || 0) >= 2)
                .sort((a, b) => ITEMS[b].sell - ITEMS[a].sell)[0];
            if (id) G.putInCave(i, id, Math.min(G.caveLotMax(), state.inventory[id] - (nd[id] || 0)));
            // 1.6.3 : une bière en fût de chêne, s'il en reste assez
            const b = !id && G.caveBeers().find(x => G.beerStock(x.id) >= 6);
            if (b && state.money > 20000) tag('cave', () => G.putBeerInCave(i, b.id, G.beerStock(b.id), 'oak'));
            return;
        }
        if (G.careNeeded(lot)) tag('cave', () => G.careLot(i));
        const o = G.lotOdds(lot);
        if (lot.bad || lot.rank >= 3 || (lot.rank >= 2 && o.good < 0.45)) tag('cave', () => G.takeOut(i));
    });
    const a = c.auction;
    (c.orders || []).slice().forEach(o => G.caveOrderLot(o) && tag('cave', () => G.deliverCaveOrder(o.id)));
    c.reserve.slice().forEach(l => {
        if (!a.lots && a.deposits.length < G.depositMax() && !l.bad) G.depositLot(l.uid);
    });
    if (c.reserve.length > 3) G.sellNegociant(c.reserve[0].uid);
    if (a.lots && !a.over) a.lots.forEach((l, k) => l.kind === 'buy' && !l.done && l.leader !== 'you' && state.money > l.price * 6 && G.playerBid(k));
}

// l'île : récolter, replanter ce qui est demandé (sinon le plus rentable), arbres tropicaux demandés
function island() {
    if (!G.islandOpen()) return;
    const nd = need();
    const plots = G.islandPlots();
    plots.forEach((p, k) => {
        if (p.ready && !G.barnBlocked(true))
            tag('île', () => {
                const r = G.harvestIsland(k, null, true);
                if (r) G.addXp(r.xp);
            });
    });
    const ok = G.islandCrops().filter(d => state.level >= d.reqLvl);
    const wanted = ok.filter(d => (nd[d.id] || 0) > state.inventory[d.id]);
    const best = [...ok].sort((a, b) => (b.sell - b.cost) / b.time - (a.sell - a.cost) / a.time);
    let j = 0;
    plots.forEach((p, k) => {
        if (!p.open || p.id) return;
        const pick = wanted.length ? wanted[j % wanted.length] : best[j % Math.min(3, best.length)];
        j++;
        if (pick && state.money > pick.cost + 50) G.plantIsland(k, pick.id, null, true);
    });
    if (plots.filter(p => p.open).length < 12 && state.money > G.islandPlotCost() * 3) G.buyIslandPlot();
    G.slotsOf('island').forEach((sl, k) => {
        if (!sl.tree) return;
        if (G.treeStage(sl.tree) === 'dead') G.fellTree(k, null, 'island');
        else if (sl.tree.ground && !G.barnBlocked(true))
            tag('île', () => {
                const r = G.pickTree(k, null, true, 'island');
                if (r) G.addXp(r.xp);
            });
    });
    const tree = G.treeList('island').find(d => state.level >= d.reqLvl && (nd[d.id] || 0) > state.inventory[d.id] && !G.livingTrees(d.id));
    if (tree && state.money > tree.cost * 3) {
        let k = G.slotsOf('island').findIndex(x => x.open && !x.tree);
        if (k < 0 && state.money > G.slotCost('island') * 3 && G.buySlot(null, 'island')) k = G.slotsOf('island').findIndex(x => x.open && !x.tree);
        if (k >= 0) G.plantTree(k, tree.id, null, 'island');
    }
}

// le labo (bêta 4) : un croisement de temps en temps, recroiser la meilleure variété, livrer le chef, entrer au Salon
// 1.8 : l'avion-cargo : charger ce qui dépasse des besoins
function cargo() {
    if (!G.cargoHere() || !state.cargo || state.cargo.done) return;
    const nd = need();
    state.cargo.holds.forEach((h, i) => {
        const spare = (state.inventory[h.id] || 0) - (nd[h.id] || 0);
        if (spare > 0 && h.got < h.qty) tag('cargo', () => G.loadHold(i, undefined, spare));
    });
}

function lab() {
    if (!state.genetics || !G.plantLabOpen()) return;
    const gx = state.genetics;
    // 1.7 : une portée : garder le jeune plant le plus proche du but, ou le plus savoureux
    while (G.crossReady()) G.finishCross();
    gx.litters.slice().forEach(L => {
        const score = k => (G.goalOf() ? G.goalScore(k.g) * 10 : 0) + G.flavorGain(k.g) + G.stability(k.g);
        const best = L.kids.map((k, j) => [score(k), j]).sort((x, y) => y[0] - x[0])[0];
        if (!G.keepSeedling(L.id, best[1])) G.dropLitter(L.id);
    });
    if (gx.chef && gx.chef.base && !G.goalOf()) G.setGoal('chef');
    if (G.junkVarieties().length > 6) G.compostJunk();
    while (G.crossFree() && state.money > G.crossCost() * 20) {
        const plan = G.goalPlan();
        if (plan && plan.a && G.startCross(plan.a, plan.b)) continue;
        const best = G.openVarieties().sort((a, b) => G.flavorGain(b.g) - G.flavorGain(a.g))[0];
        if (best && Math.random() < 0.6 && G.startCross(best.id, best.id)) continue;
        const pool = crops()
            .map(i => i.id)
            .filter(G.isPlant);
        if (!(pool.length > 1 && G.startCross(pool[t % pool.length], pool[(t * 7 + 3) % pool.length]))) break;
    }
    G.varieties().forEach(v => {
        if (G.canFix(v)) G.fixVariety(v.id, `Bot ${v.id}`);
        if (gx.stock[v.id] > 0 && G.chefMatches(v)) G.deliverChef(v.id);
        // le but atteint : la semer par défaut pour en récolter
        const p = G.goalPlan();
        if (p && p.done === v.id && G.preferOf(v.base) !== v.id) G.setPrefer(v.id);
    });
    if (G.salonOpen() && gx.salon && !gx.salon.entry) {
        const c = G.salonCandidates().sort((a, b) => b.score - a.score)[0];
        if (c) G.enterSalon(c.id);
    }
}

// le verger de la ferme : ramasser, débiter les arbres morts, planter les fruits demandés ou les plus rentables
function orchard() {
    if (!G.orchardOpen()) return;
    const nd = need();
    G.slotsOf('farm').forEach((sl, k) => {
        if (!sl.tree) return;
        if (G.treeStage(sl.tree) === 'dead') G.fellTree(k, null, 'farm');
        else if (sl.tree.ground && !G.barnBlocked(true))
            tag('verger', () => {
                const r = G.pickTree(k, null, true, 'farm');
                if (r) G.addXp(r.xp);
            });
    });
    (state.orchard.cuttings || []).forEach((c, ci) => {
        const j = G.slotsOf('farm').findIndex(x => x.open && !x.tree);
        if (j >= 0 && !ITEMS[c.id].island) G.plantCutting(j, ci, null, 'farm');
    });
    const ok = G.treeList('farm').filter(d => state.level >= d.reqLvl);
    if (!ok.length) return;
    const wanted = ok.filter(d => (nd[d.id] || 0) > state.inventory[d.id]);
    const best = [...ok].sort((a, b) => b.sell / b.time - a.sell / a.time);
    let k = G.slotsOf('farm').findIndex(x => x.open && !x.tree);
    if (k < 0 && state.money > G.slotCost('farm') * 4 && G.buySlot(null, 'farm')) k = G.slotsOf('farm').findIndex(x => x.open && !x.tree);
    if (k < 0) return;
    const pick = wanted.find(d => G.livingTrees(d.id) < 2) || best[t % Math.min(3, best.length)];
    if (pick && state.money > pick.cost * 3) G.plantTree(k, pick.id, null, 'farm');
}

// les grands défis : livrer dès qu'on peut, présenter la meilleure bête ou variété
function defis() {
    const d = G.curDefi();
    if (!d || d.awarded) return;
    d.steps.forEach((st, k) => {
        if (G.canGive(st)) tag('défi', () => G.giveDefi(k));
        if (G.canPresent(st)) {
            const c =
                st.kind === 'animal' ? G.animalCandidates().sort((a, b) => b.score - a.score)[0] : G.varietyCandidates().sort((a, b) => b.score - a.score)[0];
            if (c) G.presentDefi(k, st.kind === 'animal' ? c.a.uid : c.v.id);
        }
    });
}

// l'abbaye : brasser la meilleure bière possible avec ce qu'on a, et tout vendre
function abbey() {
    if (!G.brewOpen()) return;
    const B = G.ensureBrew();
    B.vats.forEach((v, i) => G.vatReady(v) && tag('brasserie', () => G.collectVat(i)));
    for (const o of [...B.orders]) if (G.beerOrderMatches(o).length) tag('brasserie', () => G.deliverBeerOrder(o.id));
    // on garde de quoi servir les commandes ouvertes, on vend le reste tant que le prix tient
    const keep = new Set(
        B.orders.flatMap(o =>
            G.myBeers()
                .filter(b => G.beerFits(o, b))
                .map(b => b.id),
        ),
    );
    for (const b of Object.values(B.beers)) if (G.beerStock(b.id) && !keep.has(b.id) && G.demandMult(b.id) > 0.75) G.sellBeer(b.id, G.beerStock(b.id));
    if (!B.vats.some(v => !v) || (state.inventory.hop || 0) < 2) return;
    const malts = MALT_IDS.filter(m => (state.inventory[m] || 0) >= 4);
    if (!malts.length) return;
    const pool = G.BREWABLE.filter(id => (state.inventory[id] || 0) >= 4)
        .sort((a, b) => state.inventory[b] - state.inventory[a])
        .slice(0, 6);
    let best = null;
    const tryOne = (malt, ings) => {
        for (const hop of [1, 2, 3]) {
            const h = G.brewHarmony(malt, hop, ings).stars;
            const v = G.brewValue(malt, hop, ings, h);
            // une commande ouverte que cette bière remplirait passe avant tout
            const fits = B.orders.some(o => G.beerFits(o, { malt, hop, ings, stars: h }));
            const sc = h + (fits ? 3 : 0);
            if (!best || sc > best.sc || (sc === best.sc && v > best.v)) best = { malt, hop, ings, h, v, sc };
        }
    };
    for (const m of malts)
        for (let i = 0; i < pool.length; i++) {
            tryOne(m, [[pool[i], 1]]);
            if (G.brewSlots() > 1)
                for (let j = i + 1; j < pool.length; j++)
                    tryOne(m, [
                        [pool[i], 1],
                        [pool[j], 1],
                    ]);
        }
    if (!best) return;
    B.draft = { malt: best.malt, hop: best.hop, ings: best.ings };
    G.startBrew();
}

function step() {
    abbey();
    cave();
    cargo();
    farm();
    island();
    orchard();
    lab();
    defis();
    animals();
    machines();
    orders();
    sell();
    progress();
}

// --contest : points du concours gagnés chaque heure de jeu (sans le charme), pour régler les ligues
const contestLog = process.argv.includes('--contest') ? [] : null;
const contestPts = () => Object.entries(CONTEST_POINTS).reduce((a, [k, P]) => a + (state.stats[k] || 0) * P.pts, 0);
let cp0 = contestPts();
const total = Math.round(hours * 3600);
for (let k = 0; k < total; k++) {
    t++;
    now += 1000;
    G.gameTick();
    if (t % 5 === 0) step();
    if (!levels[state.level]) levels[state.level] = t;
    if (contestLog && t % 3600 === 0) {
        const p = contestPts();
        contestLog.push([state.level, Math.round(p - cp0), G.charmScore()]);
        cp0 = p;
    }
}
if (contestLog) console.log('CONTEST ' + JSON.stringify(contestLog));

const fmtH = sec => (sec >= 3600 ? `${Math.floor(sec / 3600)} h ${String(Math.floor((sec % 3600) / 60)).padStart(2, '0')}` : `${Math.floor(sec / 60)} min`);
const out = {
    level: state.level,
    money: Math.round(state.money),
    levels: Object.fromEntries(Object.entries(levels).map(([l, sec]) => [l, sec])),
    xpBy,
    income: Object.fromEntries(Object.entries(state.income).map(([k, v]) => [k, Math.round(v)])),
    stats: { orders: state.stats.orders, wagons: state.stats.wagons, balloons: state.stats.balloons, incidents: state.stats.incidents },
    world: {
        chapters: CHAPTERS.filter(c => G.chapterDone(c.n)).length,
        house: G.houseLvl(),
        hand: G.handLvl(),
        league: state.league,
        renown: state.renown,
        cave: {
            lots: state.stats.caveLots || 0,
            sold: state.stats.auctionSold || 0,
            legend: state.stats.caveLegend || 0,
            orders: state.stats.caveOrders || 0,
            income: Math.round(state.income.cave || 0),
        },
        boats: state.stats.boats || 0,
        defis: state.defis ? Object.fromEntries(Object.entries(state.defis.trophies).map(([k, v]) => [k, v.best])) : {},
        defi: state.defis && state.defis.cur ? `${state.defis.cur.id} ${G.stepsDone()} / 4` : '',
    },
};
const saveAt = process.argv.indexOf('--save');
if (saveAt > 0) {
    state.lastSaved = now;
    (await import('fs')).writeFileSync(process.argv[saveAt + 1], JSON.stringify(state));
}
if (process.argv.includes('--json')) console.log(JSON.stringify(out));
else {
    console.log('niveau atteint :', out.level, '· pièces :', out.money);
    for (const [l, sec] of Object.entries(levels)) if (+l % 5 === 0 || +l === out.level) console.log(`  niveau ${String(l).padStart(2)} à ${fmtH(sec)}`);
    const tot = Object.values(xpBy).reduce((a, b) => a + b, 0) || 1;
    console.log(
        'expérience :',
        Object.entries(xpBy)
            .sort((a, b) => b[1] - a[1])
            .map(([k, v]) => `${k} ${Math.round((v / tot) * 100)} %`)
            .join(', '),
    );
    console.log('revenus :', out.income, '· activité :', out.stats);
    console.log('monde :', JSON.stringify(out.world));
    log.slice(-5).forEach(l => console.log('  chantier :', l));
}
