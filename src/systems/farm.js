// Le champ : parcelles, cultures, qualité, compost et serre.
import { state, lvOk } from '../core/state.js';
import { now } from '../core/clock.js';
import { fmt, s, formatDuration } from '../core/format.js';
import { emit, toast, sfx, buzz, burst, float, fly, squish, shake, changed } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { GRID, COLS, GH, SOILS, SOIL_BONUS, DECOS, MAT, HARVESTER_BONUS } from '../data/farm.js';
import { BALANCE } from '../data/progress.js';
import { speedMult, addXp, spend, earn, rank, rollYield } from './player.js';
import { cropRate, isInSeason } from './world.js';
import { decoGrowth, eggAt, decoTool, shooCrow, collectEgg, placeDeco, pickDeco, handleHive, nearDeco, rainbowGold, rainbowGolden } from './farmlife.js';
import { soilMult, treatPest, soilFits, soilOf } from './incidents.js';
import { masterySpeed, addMastery } from './mastery.js';
import { barnBlocked, rollRare } from './barn.js';
import { tip } from './tips.js';
import { storyOk } from './story.js';
import { collect, record } from './book.js';
import { sellPrice, hasMats, matMissing, payMats } from './market.js';
import { challengeOn } from './prestige.js';
import { eventProgress } from './events.js';
import { varGrowth, varHardy, varExtra, varSelfWater, takeVarSeed, harvestVariety, preferSeed } from './genetics.js';
import { wishGold } from './night.js';

const COIN = ['ui', 'coin'];

export const getPlot = i => (i >= 1000 ? state.greenhouse.plots[i - 1000] : state.grid[i]);
export const inGreenhouse = plot => state.greenhouse.plots.includes(plot);
export const gridIndex = plot => state.grid.indexOf(plot);

export function plotStage(p) {
    if (p.isReady) return 2;
    return p.growProgress < ITEMS[p.itemId].time / speedMult() / 2 ? 0 : 1;
}

export const plotRate = (p, i) =>
    p.pest
        ? 0
        : (i >= 1000 ? GH.rate : cropRate(p.itemId) * decoGrowth(i) * soilMult(i, p.itemId) * (p.v && !isInSeason(p.itemId) ? varHardy(p.v) : 1)) *
          masterySpeed(p.itemId) *
          (p.v ? varGrowth(p.v) : 1);

// secondes restantes avant la récolte
export const plotLeft = (p, i) => Math.max(0, Math.ceil((ITEMS[p.itemId].time / speedMult() - p.growProgress) / plotRate(p, i)));

export function allPlots() {
    const list = state.grid.map((p, i) => [p, i]);
    if (state.greenhouse.built) state.greenhouse.plots.forEach((p, k) => list.push([p, 1000 + k]));
    return list;
}

// Ce que fait un appui sur la parcelle avec l'outil en main
export function plotAction(p, tool, i) {
    if (!p.isUnlocked) return 'buy';
    if (state.crow && state.crow.plot === i) return 'crow';
    if (p.pest) return 'pest';
    if (eggAt(i)) return 'egg';
    if (p.deco) return tool === 'shovel' ? 'pickDeco' : p.deco === 'hive' ? 'hive' : 'decoInfo';
    if (decoTool(tool)) return i < 1000 && !p.itemId ? 'placeDeco' : 'decoHint';
    if (tool === 'shovel') return p.itemId ? 'dig' : null;
    if (tool === 'feed') return 'feedhint';
    if (tool === 'fert') return p.itemId && !p.isReady && !p.fert ? 'fert' : 'ferthint';
    if (p.terrain === 'grass') return 'plow';
    if (p.itemId && p.isReady) return 'harvest';
    if (tool === 'var' && !p.itemId) return 'plantVar';
    if (p.itemId && !p.isWatered) return 'water';
    if (p.itemId) return 'info';
    if (tool !== 'hand') return 'plant';
    return 'seedhint';
}

// actions qu'on peut enchaîner en glissant le doigt sur le champ
export const DRAG_ACTIONS = ['plow', 'harvest', 'water', 'plant', 'plantVar', 'fert'];

let pendingDig = null;

// Applique l'action ; renvoie vrai si la parcelle a changé
export function doPlotAction(i, action, at) {
    const p = getPlot(i);
    const tool = state.selectedTool;
    switch (action) {
        case 'buy':
            if (i >= 1000) buyGhPlot(at);
            else buyExp(at);
            return;
        case 'crow':
            shooCrow(i, at);
            return;
        case 'egg':
            collectEgg(i, at);
            return;
        case 'placeDeco':
            placeDeco(i, decoTool(tool), at);
            break;
        case 'pickDeco':
            pickDeco(i, at);
            break;
        case 'hive':
            handleHive(i, at);
            return;
        case 'decoInfo': {
            const d = DECOS[p.deco];
            float(at, [d.name], '', -24);
            toast(`${d.name} : ${d.desc.toLowerCase()}. Reprenez-le avec la pelle.`, ['ui', p.deco]);
            sfx('click');
            return;
        }
        case 'decoHint':
            toast(i >= 1000 ? 'Les décorations se posent dans le champ, pas dans la serre' : 'Posez la décoration sur une parcelle vide, sans culture', [
                'ui',
                decoTool(tool),
            ]);
            sfx('error');
            return;
        case 'ferthint':
            toast('Le compost se met sur une culture en train de pousser', ['item', 'fertilizer']);
            sfx('click');
            return;
        case 'fert':
            if (!applyCompost(i, at)) return;
            break;
        case 'feedhint':
            toast('La nourriture sert aux animaux', ['item', 'feed']);
            return;
        case 'seedhint':
            toast('Choisissez une graine dans la barre du bas', ['item', 'wheat']);
            sfx('click');
            return;
        case 'info':
            float(at, [['ui', 'clock'], formatDuration(plotLeft(p, i))], '', -10);
            sfx('click');
            return;
        case 'dig': {
            const d = ITEMS[p.itemId];
            // un arbre ne s'arrache qu'au second appui
            if (d.type === 'tree' && !(pendingDig && pendingDig.i === i && now() - pendingDig.t < 2500)) {
                pendingDig = { i, t: now() };
                toast(`Touchez encore pour arracher le ${d.seedName.toLowerCase()}`, ['ui', 'shovel']);
                sfx('error');
                return;
            }
            pendingDig = null;
            p.itemId = null;
            p.v = null;
            p.hand = null;
            p.isWatered = false;
            p.isReady = false;
            p.growProgress = 0;
            sfx('plow');
            burst(at, 'dirt', 10);
            burst(at, 'leaf', 5);
            buzz(12);
            break;
        }
        case 'plow':
            p.terrain = 'plowed';
            sfx('plow');
            burst(at, 'dirt', 9, 8);
            buzz(8);
            break;
        case 'pest':
            treatPest(i, at);
            return;
        case 'harvest': {
            if (barnBlocked()) return;
            const r = harvestPlot(p);
            sfx('harvest');
            buzz(12);
            burst(at, 'sparkle', 7, -6);
            burst(at, 'leaf', 5);
            float(at, [`+${r.qty}`, ['item', r.item.id], ['q', r.quality]], r.quality === 2 ? 'gold' : '', -18);
            if (r.quality) {
                burst(at, 'sparkle', r.quality * 5, -10);
                if (r.quality === 2) sfx('golden');
            }
            fly(at, r.item.id, r.qty);
            addXp(r.item.xp, at);
            if (r.golden) goldenHarvest(r.item, at);
            rollRare(BALANCE.rareDrop, at);
            break;
        }
        case 'water':
            p.isWatered = true;
            sfx('water');
            burst(at, 'water', 9, -4);
            buzz(6);
            break;
        case 'plantVar': {
            // une graine de variété (labo) : elle pousse comme son espèce, avec ses propres gènes
            const vid = state.genetics && state.genetics.tool;
            const v = vid && state.genetics.vars[vid];
            if (!v) return;
            if (ITEMS[v.base].island) {
                toast('Cette variété pousse sur l’île : semez-la dans les plantations de l’île', ['item', v.base]);
                return;
            }
            if (i < 1000 && ITEMS[v.base].ghOnly) {
                toast('Cette variété ne pousse que dans la serre', ['ui', 'greenhouse']);
                return;
            }
            if (!takeVarSeed(vid)) {
                toast('Plus de graines de cette variété', ['ui', 'flowers']);
                sfx('error');
                return;
            }
            resetPlot(p, v.base);
            p.v = vid;
            if (i >= 1000 || varSelfWater(vid)) p.isWatered = true;
            sfx('plant');
            burst(at, 'dirt', 5, 6);
            burst(at, 'sparkle', 4, -4);
            buzz(6);
            break;
        }
        case 'plant': {
            const d = ITEMS[tool];
            if (i < 1000 && d.ghOnly) {
                toast(`Le ${d.seedName.toLowerCase()} ne pousse que dans la serre`, ['ui', 'greenhouse']);
                sfx('error');
                return;
            }
            if (i >= 1000 && d.type === 'tree') {
                toast('Les arbres sont trop grands pour la serre', ['ui', 'greenhouse']);
                sfx('error');
                return;
            }
            const res = plantSeed(p, tool);
            if (res && i >= 1000) p.isWatered = true;
            // 1.7 : la variété préférée de cette espèce pousse à sa place
            const pv = res && d.type === 'crop' && preferSeed(tool);
            if (pv) {
                p.v = pv;
                if (varSelfWater(pv)) p.isWatered = true;
            }
            if (!res) {
                sfx('error');
                shake(at);
                return;
            }
            sfx('plant');
            burst(at, 'dirt', 5, 6);
            buzz(6);
            if (state.upgrades.seeder && i < 1000 && d.type === 'crop') {
                const n = seedRow(i, tool);
                if (n) {
                    float(at, [['ui', 'seeder'], `+${n} semées`], 'gold', -44);
                    tip('seeder');
                }
            }
            if (res === 'bought') float(at, [`-${d.cost}`, COIN], 'bad', -14);
            if (soilFits(i, tool)) {
                float(at, [['ui', SOILS[soilOf(i)].icon], 'Sol idéal'], 'gold', -30);
                tip('soil');
                burst(at, 'sparkle', 4, -4);
            }
            break;
        }
        default:
            return;
    }
    squish(at);
    changed('farm');
    return true;
}

export function plantSeed(plot, id) {
    const d = ITEMS[id];
    if (d.island) {
        toast(`${d.seedName} : cette culture ne pousse que sur l’île`, ['item', id]);
        return false;
    }
    // des graines reçues en cadeau se plantent même avant le niveau de la culture
    if ((!lvOk(d) || !storyOk(d)) && !(state.seeds[id] > 0)) return false;
    if (state.seeds[id] > 0) {
        state.seeds[id]--;
    } else if (d.type === 'crop' && !d.exotic && state.money >= d.cost) {
        spend(d.cost);
        resetPlot(plot, id);
        return 'bought';
    } else {
        toast(
            d.exotic
                ? `Plus de ${d.seedName.toLowerCase()} : seul le marchand ambulant en vend`
                : d.type === 'tree'
                  ? `Achetez un ${d.seedName.toLowerCase()} au magasin`
                  : 'Pas assez d’argent pour des graines',
            ['ui', d.exotic ? 'merchant' : 'coin'],
        );
        return false;
    }
    resetPlot(plot, id);
    return 'stock';
}

export function resetPlot(plot, id) {
    plot.itemId = id;
    plot.v = null;
    plot.growProgress = 0;
    plot.isReady = false;
    plot.isWatered = false;
}

const FEMININE = ['tomato', 'carrot', 'strawberry', 'pumpkin', 'potato'];

export function goldenHarvest(item, at) {
    state.stats.golden++;
    collect('t_golden');
    sfx('golden');
    buzz(40);
    burst(at, 'sparkle', 22);
    float(at, ['Récolte dorée !'], 'gold', -46);
    earn(sellPrice(item.id) * 10, at);
    toast(`${item.name} doré${FEMININE.includes(item.id) ? 'e' : ''} : vendu dix fois son prix !`, ['ui', 'star']);
}

export function waterAll(at) {
    let n = 0;
    state.grid.forEach((p, i) => {
        if (p.isUnlocked && p.itemId && !p.isReady && !p.isWatered) {
            p.isWatered = true;
            n++;
            emit('plotFx', { i, kind: 'water', delay: n * 40 });
        }
    });
    if (n) {
        sfx('water');
        buzz(10);
        toast(`${n} parcelle${s(n)} arrosée${s(n)}`, ['ui', 'drop']);
        changed('farm');
    } else {
        toast('Rien à arroser');
        squish(at);
    }
    return n;
}

export function harvestAll(at) {
    const totals = {};
    let n = 0,
        xp = 0,
        full = false;
    for (const [p, i] of allPlots()) {
        if (!(p.isUnlocked && p.itemId && p.isReady)) continue;
        if (barnBlocked()) {
            full = true;
            break;
        }
        const r = harvestPlot(p);
        rollRare(BALANCE.rareDrop, at);
        totals[r.item.id] = (totals[r.item.id] || 0) + r.qty;
        xp += r.item.xp;
        if (r.golden) goldenHarvest(r.item, at);
        emit('plotFx', { i, kind: 'sparkle', delay: n * 50, item: n < 10 ? r.item.id : null });
        n++;
    }
    if (n) {
        sfx('harvest');
        buzz(15);
        float(
            at,
            Object.keys(totals).flatMap(k => [`+${totals[k]}`, ['item', k]]),
            '',
            -20,
        );
        addXp(xp, at);
        record(
            'harvest',
            Object.values(totals).reduce((a, b) => a + b, 0),
        );
        changed('farm');
    } else if (!full) {
        toast('Rien à récolter');
        squish(at);
    }
    return n;
}

export const getExpCost = () => Math.floor(GRID.expBaseCost * BALANCE.plotCost * Math.pow(GRID.expMult, state.unlockedPlots - GRID.basePlots));

export function buyExp(at) {
    const cost = getExpCost();
    if (challengeOn('smallField') && state.unlockedPlots >= 12) {
        toast('Défi « Petit lopin » : le champ reste à 12 parcelles', ['ui', 'flag']);
        sfx('error');
        return false;
    }
    if (state.money < cost) {
        toast(`Il faut ${fmt(cost)} pièces pour agrandir`, COIN);
        sfx('error');
        return false;
    }
    const target = state.grid.find(p => !p.isUnlocked);
    if (!target) return false;
    spend(cost);
    target.isUnlocked = true;
    state.unlockedPlots++;
    state.stats.maxPlots = Math.max(state.stats.maxPlots, state.unlockedPlots);
    sfx('buy');
    burst(at, 'sparkle', 10);
    buzz(15);
    float(at, [`-${fmt(cost)}`, COIN], 'bad', -14);
    changed('farm');
    return true;
}

// ---------------- la serre ----------------
export function ensureGhPlots() {
    const g = state.greenhouse;
    if (!g.built) return;
    while (g.plots.length < GH.maxPlots)
        g.plots.push({ isUnlocked: g.plots.length < GH.basePlots, terrain: 'plowed', itemId: null, growProgress: 0, isWatered: true, isReady: false });
}

export const ghUnlocked = () => state.greenhouse.plots.filter(p => p.isUnlocked).length;
export const ghCost = () => Math.floor(GH.plotCost * Math.pow(GH.plotMult, ghUnlocked() - GH.basePlots));
export const canBuildGreenhouse = () => !state.greenhouse.built && state.level >= GH.lvl && state.money >= GH.cost && hasMats(MAT.greenhouse);

export function buildGreenhouse(at) {
    if (state.greenhouse.built || state.level < GH.lvl || state.money < GH.cost) return false;
    if (!hasMats(MAT.greenhouse)) {
        toast(matMissing(MAT.greenhouse), ['item', 'wood']);
        sfx('error');
        return false;
    }
    spend(GH.cost);
    payMats(MAT.greenhouse);
    state.greenhouse.built = true;
    ensureGhPlots();
    sfx('level');
    buzz(30);
    burst(at, 'sparkle', 18);
    float(at, [`-${fmt(GH.cost)}`, COIN], 'bad', -20);
    toast('La serre est construite ! Plantez-y même en hiver', ['ui', 'greenhouse']);
    changed('farm');
    return true;
}

export function buyGhPlot(at) {
    const cost = ghCost();
    if (state.money < cost) {
        toast(`Il faut ${fmt(cost)} pièces pour agrandir la serre`, COIN);
        sfx('error');
        return false;
    }
    const p = state.greenhouse.plots.find(x => !x.isUnlocked);
    if (!p) return false;
    if (!hasMats(MAT.ghPlot)) {
        toast(matMissing(MAT.ghPlot), ['item', 'wood']);
        sfx('error');
        return false;
    }
    spend(cost);
    payMats(MAT.ghPlot);
    p.isUnlocked = true;
    sfx('buy');
    burst(at, 'sparkle', 10);
    buzz(15);
    float(at, [`-${fmt(cost)}`, COIN], 'bad', -14);
    changed('farm');
    return true;
}

export function ghTick() {
    let changedAny = false;
    if (!state.greenhouse.built) return false;
    state.greenhouse.plots.forEach(p => {
        if (!p.isUnlocked || !p.itemId || p.isReady) return;
        const req = ITEMS[p.itemId].time / speedMult();
        const firstHalf = p.growProgress < req / 2;
        p.isWatered = true;
        p.growProgress += GH.rate;
        if (firstHalf && p.growProgress >= req / 2) changedAny = true;
        if (p.growProgress >= req) {
            p.isReady = true;
            p.growProgress = req;
            changedAny = true;
            emit('ripe', 'greenhouse');
        }
    });
    return changedAny;
}

export function ghOffline(elapsed) {
    let n = 0;
    if (!state.greenhouse.built) return 0;
    state.greenhouse.plots.forEach(p => {
        if (!p.isUnlocked || !p.itemId || p.isReady) return;
        const req = ITEMS[p.itemId].time / speedMult();
        p.growProgress += elapsed * GH.rate;
        if (p.growProgress >= req) {
            p.isReady = true;
            p.growProgress = req;
            n++;
        }
    });
    return n;
}

// ---------------- la qualité (argent, or) ----------------
export const qual = id => (state.quality[id] = state.quality[id] || { s: 0, g: 0 });

export function clampQuality(id) {
    const q = state.quality[id];
    if (!q) return;
    const inv = state.inventory[id] || 0;
    let over = q.s + q.g - inv;
    if (over > 0) {
        const ds = Math.min(q.s, over);
        q.s -= ds;
        over -= ds;
    }
    if (over > 0) q.g = Math.max(0, q.g - over);
}

export function clampAllQuality() {
    Object.keys(state.quality).forEach(clampQuality);
}

export function addQuality(id, q, n) {
    if (!q) return;
    clampQuality(id);
    const o = qual(id);
    if (q === 2) o.g += n;
    else o.s += n;
}

export function rollQuality(plot) {
    // vœu d'étoile filante : les prochaines récoltes sont en or
    if (wishGold()) return 2;
    const inGh = inGreenhouse(plot);
    let x = 0.08;
    if (inGh || isInSeason(plot.itemId)) x += 0.15;
    if (!inGh && (state.weather === 'sun' || state.weather === 'rain')) x += 0.05;
    if (plot.fert) x += 0.35;
    const gi = gridIndex(plot);
    if (soilFits(gi, plot.itemId)) x += SOIL_BONUS.quality;
    x += rank('expert') * 0.05;
    if (gi >= 0 && nearDeco(gi, 'flowers')) x += 0.1;
    x += Math.min(0.1, state.prestige.rubans * 0.01);
    const r = Math.random();
    return r < x * 0.35 * rainbowGold() ? 2 : r < x ? 1 : 0;
}

export function harvestPlot(plot) {
    const d = ITEMS[plot.itemId];
    const gi = gridIndex(plot);
    const vid = plot.v;
    const qty = rollYield('crop') + bonusYield(plot, d, gi) + (vid ? varExtra(vid) : 0);
    state.inventory[plot.itemId] += qty;
    if (vid) harvestVariety(vid, qty);
    state.stats.harvested += qty;
    addMastery(d.id, qty);
    const quality = rollQuality(plot);
    addQuality(d.id, quality, qty);
    if (quality === 2) {
        state.stats.goldQ += qty;
        collect('g_' + d.id);
    }
    eventProgress('harvest', d.id, qty);
    const golden = d.type === 'crop' && Math.random() < 0.025 * rainbowGolden() * (1 + rank('midas') * 0.6) * (gi >= 0 && nearDeco(gi, 'gnome') ? 2 : 1);
    plot.fert = false;
    if (d.type === 'tree') {
        plot.isReady = false;
        plot.isWatered = inGreenhouse(plot);
        plot.growProgress = (d.time / speedMult()) * 0.5;
    } else {
        plot.itemId = null;
        plot.v = null;
        plot.isWatered = inGreenhouse(plot);
        plot.isReady = false;
        plot.growProgress = 0;
        // une variété se replante avec ses propres graines, s'il en reste
        if (vid && state.settings.autoReplant && takeVarSeed(vid)) {
            resetPlot(plot, d.id);
            plot.v = vid;
            plot.isWatered = inGreenhouse(plot) || varSelfWater(vid);
        } else if (state.settings.autoReplant) {
            autoReplant(plot, d);
            const pv = plot.itemId === d.id && !plot.v && preferSeed(d.id);
            if (pv) plot.v = pv;
        }
    }
    return { item: d, qty, golden, quality };
}

let replantWarned = 0;

// Replante la même culture juste après la récolte (graines en stock, sinon achetées)
export function autoReplant(plot, d) {
    if (!lvOk(d)) return;
    if (state.seeds[d.id] > 0) state.seeds[d.id]--;
    else if (d.exotic) return;
    else if (state.money >= d.cost) spend(d.cost);
    else {
        if (now() - replantWarned > 4000) toast(`Plus assez de pièces pour replanter : ${d.name.toLowerCase()}`, ['item', d.id]);
        replantWarned = now();
        return;
    }
    const gh = inGreenhouse(plot);
    resetPlot(plot, d.id);
    plot.isWatered = gh;
}

export function applyCompost(i, at) {
    const p = getPlot(i);
    if (state.inventory.fertilizer <= 0) {
        toast('Plus de compost : achetez-en au magasin', ['item', 'fertilizer']);
        sfx('error');
        return false;
    }
    state.inventory.fertilizer--;
    p.fert = true;
    sfx('plant');
    burst(at, 'leaf', 8);
    burst(at, 'sparkle', 4, -6);
    buzz(8);
    return true;
}

// Toutes les graines : cultures puis arbres, chacune par niveau de déblocage
export const seedList = () =>
    Object.values(ITEMS)
        .filter(i => i.type === 'crop' || i.type === 'tree')
        .sort((a, b) => (a.type === b.type ? 0 : a.type === 'crop' ? -1 : 1) || a.reqLvl - b.reqLvl);

// ---------------- semoir et moissonneuse ----------------
export const rowOf = i => Array.from({ length: COLS }, (_, k) => Math.floor(i / COLS) * COLS + k).filter(j => j < state.grid.length);

// le semoir plante toute la rangée (parcelles labourées et vides)
export function seedRow(i, id) {
    let n = 0;
    rowOf(i).forEach(j => {
        const p = state.grid[j];
        if (j === i || !p.isUnlocked || p.deco || p.itemId || p.terrain !== 'plowed') return;
        if (plantSeed(p, id)) n++;
    });
    return n;
}

// une rangée est « entière » si toutes ses parcelles portent (ou viennent de porter) la même culture
export function fullRow(i, id) {
    const t = now();
    return rowOf(i).every(j => {
        const p = state.grid[j];
        return p.isUnlocked && !p.deco && (p.itemId === id || (p.lastCrop === id && t - (p.lastAt || 0) < 4000));
    });
}

// récolte en plus : moissonneuse sur une rangée entière, moulin miniature voisin
export function bonusYield(plot, d, gi) {
    let extra = 0;
    if (gi < 0 || d.type !== 'crop') return 0;
    if (state.upgrades.harvester && fullRow(gi, d.id) && Math.random() < HARVESTER_BONUS) extra++;
    if (nearDeco(gi, 'miniMill') && Math.random() < 0.25) extra++;
    plot.lastCrop = d.id;
    plot.lastAt = now();
    return extra;
}
