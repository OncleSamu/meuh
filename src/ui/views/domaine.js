// 1.148 → 1.149 : Vue du Domaine — carte vivante, organique et actionnable (onglet autonome, facile à retirer).
import { state } from '../../core/state.js';
import { now } from '../../core/clock.js';
import { formatDuration } from '../../core/format.js';
import { emit } from '../../core/bus.js';
import { ANIMALS } from '../../data/animals.js';
import { ITEMS } from '../../data/items.js';
import { MACHINES, RECIPES } from '../../data/machines.js';
import { NATURE } from '../../data/nature.js';
import { STAGES } from '../../data/perfume.js';
import { VILLAGERS } from '../../data/village.js';
import * as G from '../../systems/index.js';
import { blocks, actions, esc, centerOf } from '../dom.js';
import { ico, art, SPR } from '../icons.js';
import { genWrap } from '../genlook.js';
import { SPRITES as CAMP } from '../../art/camping.js';
import { defineView, defineLive, go } from '../app.js';
import { defineSheet, openSheet, closeSheet } from '../sheets.js';
import { burstAt } from '../fx.js';

const SCENE_W = 420;
const SCENE_H = 1820;

// Décorations posables : base accessible + décos liées à ta vraie progression
const DOM_DECOS = [
    { id: 'none', name: 'Libre', icon: ['ui', 'seedPack'], empty: true },
    { id: 'fountain', name: 'Fontaine', icon: ['building', 'fountain'] },
    { id: 'arch', name: 'Arche fleurie', icon: ['ui', 'flowerArch'] },
    { id: 'well', name: 'Puits', icon: ['ui', 'well'] },
    { id: 'bench', name: 'Banc chêne', icon: ['ui', 'oakBench'] },
    { id: 'lamp', name: 'Lanterne', icon: ['ui', 'ironLamp'] },
    { id: 'birdhouse', name: 'Nichoir', icon: ['ui', 'birdhouse'] },
    { id: 'cart', name: 'Charrette', icon: ['ui', 'appleCart'], need: () => G.orchardOpen(), req: 'Verger' },
    { id: 'miniMill', name: 'Petit moulin', icon: ['ui', 'miniMill'], need: () => state.machines.length >= 4, req: '4 ateliers' },
    { id: 'fishTrophy', name: 'Trophée pêche', icon: ['ui', 'fishTrophy'], need: () => G.pondOpen(), req: 'Étang' },
    { id: 'miniLight', name: 'Phare mini', icon: ['ui', 'miniLighthouse'], need: () => G.islandOpen(), req: 'Île' },
    { id: 'pfFountain', name: 'Font. parfum', icon: ['ui', 'perfumeFountain'], need: () => G.perfumeOpen(), req: 'Parfumerie' },
    { id: 'castle', name: 'Tour Château', icon: ['ui', 'castleTower'], need: () => G.chateauOpen() || G.domaineOpen(), req: 'Domaine / Château' },
    {
        id: 'meuhStatue',
        name: 'Statue Meuh',
        icon: ['ui', 'meuhStatue'],
        need: () => Object.values(state.achievements || {}).reduce((a, b) => a + (b || 0), 0) >= 10 || state.level >= 30,
        req: '10 succès ou niv. 30',
    },
    { id: 'wish', name: 'Étoile', icon: ['ui', 'wishStar'], need: () => state.level >= 20 || (state.prestige && state.prestige.n > 0), req: 'Niv. 20' },
    {
        id: 'xmas',
        name: 'Sapin hiver',
        icon: ['ui', 'xmasTree'],
        need: () => G.season().id === 'hiver' || !!(state.decorInv && state.decorInv.xmasTree),
        req: 'Hiver ou déco',
    },
];

// 5 emplacements de déco (0 chevauchement vérifié de 308 à 520 px)
const DECO_SLOTS = [
    [84, 27.5],
    [86, 45.2],
    [55, 58.2],
    [12, 33.5],
    [52, 20.2],
];

// 4 points de promenade de Filou au cœur de la cour de ferme
const DOG_WAYPOINTS = [
    [45, 46.8],
    [56, 46.2],
    [50, 48.0],
    [41, 47.5],
];

// Arbres illustrés (CAMP.tree) sur les lisières extérieures pour unifier le décor avec src/art
const EDGE_TREES = [
    [4.5, 22.5, 11.5, 0],
    [95.5, 23.0, 10.5, 1],
    [95.5, 32.5, 11.0, 0],
    [4.0, 48.5, 11.0, 1],
    [96.0, 49.5, 10.0, 0],
    [4.5, 63.0, 11.5, 1],
    [96.0, 73.5, 11.0, 0],
    [4.5, 88.5, 11.0, 0],
    [95.5, 86.0, 10.5, 1],
];

const local = {
    decorating: false,
    postcard: false,
    pfPop: false,
    dogStep: 0,
    dogFlip: false,
    nextIdx: 0,
};

function domPrefs() {
    if (!state.settings.dom) {
        state.settings.dom = {
            focus: false,
            path: 'sand',
            decos: ['fountain', 'none', 'none', 'none', 'none'],
        };
    }
    const d = state.settings.dom;
    if (!Array.isArray(d.decos) || d.decos.length < DECO_SLOTS.length) {
        d.decos = DECO_SLOTS.map((_, i) => (Array.isArray(d.decos) && d.decos[i]) || 'none');
    }
    return d;
}

function decoUnlocked(d, curId) {
    if (!d.need || d.id === curId) return true;
    return !!d.need();
}

function treeColors() {
    const s = G.season().id;
    const night = document.documentElement.classList.contains('night');
    if (s === 'hiver') return night ? ['#7b93ab', '#8da4ba'] : ['#d9e8f0', '#eef6fa'];
    if (s === 'automne') return night ? ['#9e5b27', '#b27b2d'] : ['#e8792a', '#f0b23a'];
    if (s === 'ete') return night ? ['#2d6b41', '#3b7c46'] : ['#4aa860', '#6bc259'];
    return night ? ['#356f49', '#8c5f76'] : ['#56b566', '#f2a5c2'];
}

function windmillArt(busy) {
    const raw = art('building', 'windmill');
    const first = raw.indexOf('<g transform="rotate(15 50 28)">');
    const hub = raw.indexOf('<circle cx="50" cy="28"');
    if (first < 0 || hub < 0) return raw;
    return `${raw.slice(0, first)}<g class="dom-sails${busy ? ' busy' : ''}">${raw.slice(first, hub)}</g>${raw.slice(hub)}`;
}

// ---------------- calculs live (jauges de progression & graines) ----------------
function activeMachPct() {
    const list = state.machines.filter(m => m.type !== 'counter' && G.machineBusy(m));
    if (!list.length) return 0;
    return Math.max(...list.map(m => G.machinePct(m)));
}

function activePerfumePct() {
    if (!G.perfumeOpen() || !state.perfume) return 0;
    const t = now();
    const vats = (state.perfume.vats || []).filter(v => v && v.stage < STAGES.length);
    if (!vats.length) return 0;
    return Math.max(
        ...vats.map(v => {
            const frac = v.stageSec ? Math.max(0, Math.min(1, 1 - (v.stageUntil - t) / (v.stageSec * 1000))) : 0;
            return (v.stage + frac) / STAGES.length;
        }),
    );
}

function activeCavePct() {
    const t = now();
    let best = 0;
    if (G.brewOpen() && state.brew && state.brew.vats) {
        for (const v of state.brew.vats) {
            if (!v || !v.until || !v.started) continue;
            const p = Math.max(0, Math.min(1, (t - v.started) / Math.max(1, v.until - v.started)));
            if (p > best) best = p;
        }
    }
    if (G.caveOpen() && state.cave && state.cave.slots) {
        for (const l of state.cave.slots) {
            if (!l || l.bad || !l.next) continue;
            const step = G.caveStep(l.id) || 1;
            const p = Math.max(0, Math.min(1, 1 - (l.next - t) / step));
            if (p > best) best = p;
        }
    }
    return best;
}

function pickReplantSeed() {
    const cur = state.selectedTool;
    if (cur && ITEMS[cur] && ITEMS[cur].type === 'crop' && !ITEMS[cur].island) return cur;
    const owned = Object.entries(state.seeds || {}).find(([id, n]) => n > 0 && ITEMS[id] && ITEMS[id].type === 'crop' && !ITEMS[id].island);
    if (owned) return owned[0];
    const avail = G.plantableSeeds();
    return avail.length ? avail[0].id : null;
}

function visitingVillagerId() {
    const spouse = G.spouseOf();
    const list = G.presentVillagers().filter(id => id !== 'odette' && id !== spouse && VILLAGERS[id]);
    if (!list.length) return null;
    return list[(state.day || 1) % list.length];
}

// ---------------- calcul en direct de l'état de chaque zone ----------------
function plotThumb(p) {
    if (!p || !p.isUnlocked || !p.itemId) return '';
    const st = G.plotStage(p);
    const v = p.varId && state.genetics && state.genetics.vars[p.varId];
    const svg = art('plant', `${p.itemId}:${st}`);
    return v ? genWrap(svg, v.g) : svg;
}

function buildZones() {
    const t = now();
    const plots = G.allPlots().filter(([p]) => p.isUnlocked);
    const readyPlots = plots.filter(([p]) => p.itemId && p.isReady);
    const emptyPlots = state.grid.filter(p => p.isUnlocked && !p.itemId && !p.deco);
    const dryPlots = state.grid.filter(p => p.isUnlocked && p.itemId && !p.isReady && !p.isWatered);
    const fieldHoney = state.grid.reduce((a, p) => a + (p.deco === 'hive' ? Math.floor(p.honey || 0) : 0), 0);

    // Champs & Serre
    let fieldBub = null;
    if (readyPlots.length) {
        fieldBub = { icon: ['item', readyPlots[0][0].itemId], label: String(readyPlots.length), cls: 'ready', direct: 'fieldsHarvest' };
    } else if (state.egg) {
        fieldBub = { icon: ['item', 'paintedEgg'], label: 'Œuf !', cls: 'gold', direct: 'fieldsEgg' };
    } else if (fieldHoney > 0) {
        fieldBub = { icon: ['item', 'honey'], label: String(fieldHoney), cls: 'ready', direct: 'fieldsHoney' };
    } else if (dryPlots.length && !G.weather().waters) {
        fieldBub = { icon: ['ui', 'drop'], label: String(dryPlots.length), cls: 'water', direct: 'fieldsWater' };
    }

    // Gare & Commandes
    const trainHere = state.truck && state.truck.status === 'here';
    const readyQuests = state.quests.filter(G.checkQuestReady).length;
    const cargoN = G.cargoReady();
    let stationBub = null;
    if (trainHere) {
        stationBub = {
            icon: ['ui', 'trainIcon'],
            label: state.truck.expiresAt ? `<span data-until="${state.truck.expiresAt}">En gare</span>` : 'En gare',
            rawLabel: true,
            cls: 'gold',
            urgent: true,
            open: 'village/orders#ship',
        };
    } else if (readyQuests > 0) {
        stationBub = { icon: ['ui', 'scroll'], label: String(readyQuests), cls: 'gold', open: 'village/orders#give' };
    } else if (cargoN > 0) {
        stationBub = { icon: ['ui', 'plane'], label: String(cargoN), cls: 'gold', open: 'village/orders#ship' };
    } else if (G.defiReady() > 0) {
        stationBub = { icon: ['ui', 'cupGold'], label: String(G.defiReady()), cls: 'gold', open: 'village/orders#event' };
    }

    // Village, Camping & Famille
    const campN = G.campOpen() ? G.campReady() + G.residentReady() : 0;
    const famN = G.familyOpen() ? G.familyReady() : 0;
    const storyN = G.storyClaimable() + (G.domaineOpen() ? G.domReady() : 0);
    let villageBub = null;
    if (campN > 0) villageBub = { icon: ['ui', 'tent'], label: String(campN), cls: 'gold', open: 'village/camping' };
    else if (famN > 0) villageBub = { icon: ['ui', 'fmHome'], label: String(famN), cls: 'gold', open: 'village/family' };
    else if (storyN > 0) villageBub = { icon: ['ui', 'village'], label: String(storyN), cls: 'gold', open: 'village/village#story' };

    // Voyages (Île, Oasis, Nord)
    const voyagesOpen = G.islandOpen() || G.oasisOpen() || G.nordOpen();
    let voyReady = 0;
    let voyFirst = ['ui', 'oaVoyages'];
    let voyOpenPath = 'farm/island#isle';
    if (G.islandOpen() && state.island) {
        const r = G.islandReady();
        const fr = G.slotsOf('island').reduce((a, x) => a + (x.tree ? x.tree.ground : 0), 0);
        const h = G.apiaryOpen('island') && G.apiaryHives('island') ? Math.floor(G.apiaryOf('island').honey) : 0;
        if (r + fr + h > 0) {
            voyReady += r + fr + h;
            voyFirst = ['item', 'pineapple'];
            voyOpenPath = 'farm/island#isle';
        }
    }
    if (G.oasisOpen() && state.oasis) {
        const r = G.oasisToPick();
        const h = G.apiaryOpen('oasis') && G.apiaryHives('oasis') ? Math.floor(G.apiaryOf('oasis').honey) : 0;
        if (r + h > 0) {
            voyReady += r + h;
            if (voyFirst[1] === 'oaVoyages') {
                voyFirst = ['ui', 'oaOasis'];
                voyOpenPath = 'farm/island#oasis';
            }
        }
    }
    if (G.nordOpen() && state.nord) {
        const r = G.nordToPick();
        const h = G.apiaryOpen('nord') && G.apiaryHives('nord') ? Math.floor(G.apiaryOf('nord').honey) : 0;
        if (r + h > 0) {
            voyReady += r + h;
            if (voyFirst[1] === 'oaVoyages') {
                voyFirst = ['ui', 'noNord'];
                voyOpenPath = 'farm/island#nord';
            }
        }
    }
    let portBub = null;
    if (voyReady > 0) {
        portBub = { icon: voyFirst, label: String(voyReady), cls: 'ready', direct: 'voyagesHarvest' };
    } else if (G.oasisOpen() && state.oasis && state.oasis.dry) {
        portBub = { icon: ['ui', 'drop'], label: 'Citerne', cls: 'urgent', urgent: true, open: 'farm/island#oasis' };
    }

    // Maison
    let houseBub = null;
    if (G.houseCanUp()) {
        houseBub = { icon: ['ui', 'house'], label: 'Agrandir', cls: 'gold', open: 'sheet:house' };
    } else if (G.maisonOpen() && G.maisonReady() > 0) {
        houseBub = { icon: ['ui', 'maison'], label: String(G.maisonReady()), cls: 'gold', open: 'machines/maison' };
    }

    // Grange & Étal
    const stallSold = G.stallSoldCount();
    const barnUsed = G.barnUsed();
    const barnCap = Math.max(1, G.barnCap());
    const barnRatio = Math.min(1, barnUsed / barnCap);
    let barnBub = null;
    if (G.barnSpace() <= 0) {
        barnBub = { icon: ['ui', 'barn'], label: 'Pleine', cls: 'urgent', urgent: true, open: 'sheet:barn' };
    } else if (stallSold > 0) {
        barnBub = { icon: ['ui', 'coin'], label: String(stallSold), cls: 'gold', direct: 'stallCollect' };
    }

    // Ateliers (Production)
    const workMach = state.machines.filter(m => m.type !== 'counter');
    const hasWorkshop = workMach.length > 0;
    const doneMach = workMach.filter(m => G.outCount(m) > 0);
    const busyMach = workMach.filter(m => G.machineBusy(m));
    const workshopBub = doneMach.length
        ? {
              icon: ['item', G.machineOutput(doneMach[0])],
              label: String(doneMach.length),
              cls: 'ready',
              direct: 'machinesCollect',
          }
        : null;

    // Comptoir
    const counterOpen = G.counterOwned();
    const counterW = counterOpen ? G.counterWaiting() : 0;
    const counterBub = counterW > 0 ? { icon: ['machine', 'counter'], label: String(counterW), cls: 'gold', open: 'machines/counter' } : null;

    // Parfumerie
    const pfOpen = G.perfumeOpen();
    const pfActive = pfOpen && state.perfume ? (state.perfume.vats || []).filter(v => v && v.stage < STAGES.length).length : 0;
    let pfBub = null;
    if (pfOpen && state.perfume) {
        const pfReady = G.perfumeReadyCount();
        const pfCare = G.perfumeCareCount();
        const pfOrd = G.perfumeOrdersReady();
        if (pfReady > 0) pfBub = { icon: ['ui', 'perfume'], label: 'Flacon', cls: 'ready', direct: 'perfumeBottle' };
        else if (pfCare > 0) pfBub = { icon: ['ui', 'perfume'], label: 'Soin', cls: 'care', urgent: true, direct: 'perfumePop' };
        else if (pfOrd > 0) pfBub = { icon: ['ui', 'perfume'], label: String(pfOrd), cls: 'gold', open: 'machines/perfume' };
    }

    // Cave, Château & Brasserie
    const caveOrBrew = G.caveOpen() || G.brewOpen();
    const brewVats = G.brewOpen() && state.brew ? state.brew.vats.filter(v => G.vatReady(v) && !v.loop) : [];
    const caveCare = G.caveOpen() ? G.caveCareCount() : 0;
    const caveOrd = G.caveOpen() ? G.caveOrdersReady() : 0;
    const beerOrd = G.brewOpen() ? G.beerOrdersReady() : 0;
    const caveWorking = activeCavePct() > 0;
    let caveBub = null;
    if (brewVats.length > 0) caveBub = { icon: ['ui', 'beer'], label: String(brewVats.length), cls: 'ready', direct: 'brewCollect' };
    else if (caveCare > 0) caveBub = { icon: ['ui', 'turn'], label: String(caveCare), cls: 'care', direct: 'caveCare' };
    else if (caveOrd > 0) caveBub = { icon: ['ui', 'cave'], label: String(caveOrd), cls: 'gold', open: 'machines/cave' };
    else if (beerOrd > 0) caveBub = { icon: ['ui', 'beer'], label: String(beerOrd), cls: 'gold', open: 'machines/brew' };

    // Verger
    const orchardOpen = G.orchardOpen();
    const orchardTrees = state.orchard ? state.orchard.slots.filter(x => x.tree) : [];
    const orchardFruit = orchardTrees.reduce((a, x) => a + (x.tree.ground || 0), 0);
    const firstFruit = orchardTrees.find(x => x.tree.ground > 0);
    const orchardBub = orchardFruit > 0 ? { icon: ['item', firstFruit.tree.id], label: String(orchardFruit), cls: 'ready', direct: 'orchardCollect' } : null;

    // Prés & Haras
    const pastureOpen = state.animals.length > 0 || state.level >= 2;
    const animProd = state.animals.reduce((a, x) => a + x.stack, 0);
    const firstProd = state.animals.find(x => x.stack > 0);
    const hungry = state.animals.filter(a => G.isAdult(a) && a.food === 0).length;
    let pastureBub = null;
    if (animProd > 0 && firstProd) {
        pastureBub = { icon: ['item', ANIMALS[firstProd.type].prodId], label: String(animProd), cls: 'ready', direct: 'animalsCollect' };
    } else if (hungry > 0 && (state.inventory.feed || 0) > 0) {
        pastureBub = { icon: ['item', 'feed'], label: String(hungry), cls: 'gold', direct: 'animalsFeed' };
    }

    // Étang & Forêt
    const natureOpen = state.level >= NATURE.forest.lvl || G.pondOpen();
    const lumberReady = G.loadsReady('lumber');
    const minerReady = G.loadsReady('miner');
    const trapsN = G.pondOpen() ? (G.netReady() ? 1 : 0) + G.trapsReady() : 0;
    let pondBub = null;
    if (lumberReady + minerReady > 0) {
        pondBub = { icon: ['ui', lumberReady ? 'axe' : 'pickaxe'], label: String(lumberReady + minerReady), cls: 'ready', direct: 'natureCollect' };
    } else if (trapsN > 0) {
        pondBub = { icon: ['ui', 'rod'], label: String(trapsN), cls: 'ready', open: 'farm/pond' };
    }

    const samplePlots = state.grid.slice(0, 8);
    const sampleAn = state.animals.slice(0, 4);
    const isChateau = G.chateauOpen();

    return [
        {
            id: 'station',
            name: 'Gare',
            pos: [26, 12.0],
            w: 41,
            open: true,
            go: 'village/orders',
            icon: ['ui', 'trainIcon'],
            tags: [
                trainHere ? 'Train à quai' : 'Train en route',
                `${readyQuests} commande${readyQuests > 1 ? 's' : ''} prête${readyQuests > 1 ? 's' : ''}`,
                G.cargoHere(t) ? 'Cargo présent' : '',
            ].filter(Boolean),
            desc: 'Commandes du village, train régional, cargo, montgolfière et Grands Défis.',
            bub: stationBub,
            art: () =>
                `<div class="dom-art dom-station"><span class="st-bld">${art('building', 'station')}</span>${
                    trainHere ? `<span class="st-train"><span class="st-loco">${SPR.loco()}</span><span class="st-wag">${SPR.wagon('#c8453a')}</span></span>` : ''
                }</div>`,
            svgParts: () => [art('building', 'station')],
        },
        {
            id: 'port',
            name: 'Voyages',
            pos: [76, 16.0],
            w: 34,
            open: voyagesOpen,
            go: voyOpenPath,
            icon: ['ui', 'oaVoyages'],
            tags: [G.islandOpen() ? 'Île' : '', G.oasisOpen() ? 'Oasis' : '', G.nordOpen() ? 'Grand Nord' : ''].filter(Boolean),
            desc: 'Toutes tes contrées lointaines réunies au quai. Touche la bulle pour ramener les récoltes prêtes.',
            bub: portBub,
            art: () => `<div class="dom-art dom-pair"><span class="main">${art('building', 'lighthouse')}</span><span class="boat">${art('ui', 'boat')}</span></div>`,
            svgParts: () => [art('building', 'lighthouse')],
        },
        {
            id: 'village',
            name: 'Village',
            pos: [27, 25.8],
            w: 35,
            open: state.level >= 3,
            go: campN > 0 ? 'village/camping' : famN > 0 ? 'village/family' : 'village/village',
            icon: ['ui', 'village'],
            tags: [G.campOpen() ? 'Camping ouvert' : 'Place du village', G.familyOpen() ? 'Famille' : 'Habitants'],
            desc: 'La place du village, les habitants, le camping de la vallée et ta famille.',
            bub: villageBub,
            art: () =>
                `<div class="dom-art dom-pair"><span class="main">${art('building', 'townhall')}</span>${
                    G.campOpen() ? `<span class="side">${CAMP.tent('#e2582f')}</span>` : ''
                }</div>`,
            svgParts: () => [art('building', 'townhall')],
        },
        {
            id: 'house',
            name: 'Maison',
            pos: [60, 36.8],
            w: 28,
            open: true,
            glow: true,
            go: 'sheet:house',
            icon: ['ui', 'house'],
            tags: [`Maison niv. ${G.houseLvl() + 1}`, G.maisonOpen() ? 'Atelier Maison ouvert' : 'Personnalisable'],
            desc: 'Ta maison évolue avec ton niveau et ta couleur de grange. Touche-la pour l’agrandir ou voir son style.',
            bub: houseBub,
            art: () => `<div class="dom-art">${SPR.farmhouse(G.houseLvl(), G.styleOf('barn'))}</div>`,
            svgParts: () => [SPR.farmhouse(G.houseLvl(), G.styleOf('barn'))],
        },
        {
            id: 'barn',
            name: 'Grange',
            pos: [19, 40.8],
            w: 24,
            open: true,
            go: 'sheet:barn',
            icon: ['ui', 'barn'],
            tags: [`${barnUsed} / ${barnCap}`, stallSold ? `${stallSold} vente(s) à encaisser` : 'Réserves & coffre'],
            desc: 'Tes stocks, le coffre de la grange et l’encaissement rapide de ton étal.',
            bub: barnBub,
            pulse: `<span class="dom-pulse${barnRatio >= 0.92 ? ' full' : barnRatio >= 0.75 ? ' warn' : ''}"><i style="width:${(barnRatio * 100).toFixed(0)}%"></i></span>`,
            art: () => `<div class="dom-art">${art('ui', 'barn')}</div>`,
            svgParts: () => [art('ui', 'barn')],
        },
        {
            id: 'counter',
            name: 'Comptoir',
            pos: [79, 52.2],
            w: 23,
            open: counterOpen,
            go: 'machines/counter',
            icon: ['machine', 'counter'],
            tags: [counterW ? `${counterW} client(s) attendent` : 'Salle calme'],
            desc: 'Sers tes clients au comptoir avec tes spécialités du jour.',
            bub: counterBub,
            art: () => `<div class="dom-art">${art('machine', 'counter')}</div>`,
            svgParts: () => [art('machine', 'counter')],
        },
        {
            id: 'workshop',
            name: 'Ateliers',
            pos: [25, 55.8],
            w: 34,
            open: hasWorkshop,
            glow: true,
            go: 'machines/workshop',
            icon: ['machine', 'bakery'],
            tags: [`${workMach.length} machine(s)`, doneMach.length ? `${doneMach.length} prête(s)` : busyMach.length ? `${busyMach.length} en cours` : 'Au repos'],
            desc: 'Four, moulin, laiterie et ateliers. Collecte tout ou relance tes dernières recettes directement depuis la fiche.',
            bub: workshopBub,
            pulse: busyMach.length ? `<span class="dom-pulse" data-live="domMach"><i style="width:${(activeMachPct() * 100).toFixed(0)}%"></i></span>` : '',
            art: () =>
                `<div class="dom-art dom-pair"><span class="main">${windmillArt(busyMach.length > 0)}</span><span class="side">${art('machine', 'bakery')}</span>${
                    busyMach.length || doneMach.length ? '<span class="dom-smoke"><i></i><i></i></span>' : ''
                }</div>`,
            svgParts: () => [art('building', 'windmill')],
        },
        {
            id: 'cave',
            name: isChateau ? 'Château & Cave' : G.brewOpen() && G.caveOpen() ? 'Cave & Brasserie' : G.brewOpen() ? 'Brasserie' : 'Cave',
            pos: [74, 65.8],
            w: 29,
            open: caveOrBrew,
            go: brewVats.length || beerOrd > 0 || !G.caveOpen() ? 'machines/brew' : 'machines/cave',
            icon: ['ui', G.caveOpen() ? 'cave' : 'beer'],
            tags: [isChateau ? 'Château ouvert' : G.caveOpen() ? 'Cave d’affinage' : '', G.brewOpen() ? 'Brasserie' : ''].filter(Boolean),
            desc: 'Tes cuvées en vieillissement, soins de cave en 1 tap et brassins d’abbaye au flanc du coteau.',
            bub: caveBub,
            pulse: caveWorking ? `<span class="dom-pulse cave" data-live="domCave"><i style="width:${(activeCavePct() * 100).toFixed(0)}%"></i></span>` : '',
            art: () => `<div class="dom-art">${art('building', isChateau ? 'chateauChai' : G.caveOpen() ? 'chai' : 'brewhall')}</div>`,
            svgParts: () => [art('building', isChateau ? 'chateauChai' : G.caveOpen() ? 'chai' : 'brewhall')],
        },
        {
            id: 'perfume',
            name: 'Parfumerie',
            pos: [24, 69.5],
            w: 27,
            open: pfOpen,
            glow: true,
            go: 'machines/perfume',
            icon: ['ui', 'perfume'],
            tags: ['Orgue du Parfumeur', G.perfumeCareCount() ? 'Soin d’étape prêt' : G.perfumeReadyCount() ? 'Flacon prêt' : pfActive ? `${pfActive} macération(s)` : 'Atelier calme'],
            desc: 'Compose tes parfums, applique tes soins de macération directement depuis le Domaine et mets en flacon.',
            bub: pfBub,
            pulse: pfActive ? `<span class="dom-pulse perfume" data-live="domPerfume"><i style="width:${(activePerfumePct() * 100).toFixed(0)}%"></i></span>` : '',
            art: () => `<div class="dom-art">${art('machine', 'perfumery')}</div>`,
            svgParts: () => [art('machine', 'perfumery')],
        },
        {
            id: 'orchard',
            name: 'Verger',
            pos: [75, 80.5],
            w: 35,
            open: orchardOpen,
            go: 'farm/orchard',
            icon: ['item', 'apple'],
            tags: [`${orchardTrees.length} arbre(s)`, orchardFruit ? `${orchardFruit} fruit(s) au sol` : 'Arbres paisibles'],
            desc: 'Tes arbres fruitiers et ruches. Touche la bulle pour ramasser tous les fruits tombés au sol.',
            bub: orchardBub,
            art: () => {
                const t1 = orchardTrees[0] ? art('plant', `${orchardTrees[0].tree.id}:3`) : art('plant', 'apple:3');
                const t2 = orchardTrees[1] ? art('plant', `${orchardTrees[1].tree.id}:3`) : art('plant', 'cherry:3');
                const t3 = orchardTrees[2] ? `<span class="t3">${art('plant', `${orchardTrees[2].tree.id}:3`)}</span>` : '';
                const hasBees = state.animals.some(a => a.type === 'bees');
                return `<div class="dom-art dom-orchard"><span class="t1">${t1}</span><span class="t2">${t2}</span>${t3}${hasBees ? `<span class="hive">${art('animal', 'bees')}</span>` : ''}</div>`;
            },
            svgParts: () => [orchardTrees[0] ? art('plant', `${orchardTrees[0].tree.id}:3`) : art('plant', 'apple:3')],
        },
        {
            id: 'fields',
            name: state.greenhouse && state.greenhouse.built ? 'Champs & Serre' : 'Champs',
            pos: [27, 82.5],
            w: 43,
            open: true,
            go: 'farm/field',
            icon: ['item', 'wheat'],
            tags: [
                readyPlots.length ? `${readyPlots.length} à récolter` : `${plots.length} parcelles`,
                emptyPlots.length ? `${emptyPlots.length} libre(s)` : dryPlots.length ? `${dryPlots.length} à arroser` : 'Bien arrosé',
            ],
            desc: 'Tes vraies parcelles poussent ici en direct. Récolte, arrose ou ressème directement depuis le Domaine.',
            bub: fieldBub,
            art: () =>
                `<div class="dom-art dom-fields-box"><div class="dom-fields">${samplePlots
                    .map(p => `<span class="dom-cell">${plotThumb(p)}</span>`)
                    .join('')}</div>${state.greenhouse && state.greenhouse.built ? `<span class="dom-gh">${art('ui', 'greenhouse')}</span>` : ''}</div>`,
            svgParts: () => [state.greenhouse && state.greenhouse.built ? art('ui', 'greenhouse') : art('item', 'wheat')],
        },
        {
            id: 'pond',
            name: G.pondOpen() ? 'Étang & Forêt' : 'Forêt',
            pos: [77, 93.2],
            w: 31,
            open: natureOpen,
            go: trapsN > 0 ? 'farm/pond' : 'farm/nature',
            icon: ['ui', G.pondOpen() ? 'rod' : 'axe'],
            tags: [G.pondOpen() ? 'Pêche ouverte' : 'Forêt & bois', lumberReady + minerReady ? `${lumberReady + minerReady} charge(s) prête(s)` : 'Tranquille'],
            desc: 'Récupère les charges du bûcheron et du mineur en 1 tap ou pars pêcher à l’étang.',
            bub: pondBub,
            art: () => `<div class="dom-art">${art('building', 'pontoon')}</div>`,
            svgParts: () => [art('building', 'pontoon')],
        },
        {
            id: 'pasture',
            name: G.harasOpen() ? 'Prés & Haras' : 'Prés',
            pos: [27, 94.2],
            w: 42,
            open: pastureOpen,
            go: 'animals/pasture',
            icon: ['animal', 'cow'],
            tags: [`${state.animals.length} animal(aux)`, animProd ? `${animProd} produit(s) prêt(s)` : hungry ? `${hungry} ont faim` : 'Repus'],
            desc: 'Ramasse lait, œufs et laine ou nourris tes animaux en un seul tap.',
            bub: pastureBub,
            art: () => {
                const list = sampleAn.length ? sampleAn.map(a => `<span class="an">${art('animal', a.type)}</span>`).join('') : `<span class="an">${art('animal', 'chicken')}</span>`;
                return `<div class="dom-art dom-pasture-wrap">${G.harasOpen() ? `<span class="stud">${art('building', 'stud')}</span>` : ''}<div class="dom-pasture">${list}</div></div>`;
            },
            svgParts: () => [sampleAn[0] ? art('animal', sampleAn[0].type) : art('animal', 'cow')],
        },
    ];
}

// ---------------- décor SVG organique (4 hameaux, sentier en S, ruisseau, pont, vignes, arc-en-ciel) ----------------
function bgSvg(zones) {
    const W = SCENE_W;
    const H = SCENE_H;
    const skyH = 128;
    const O = '#3a2618';
    const seasonId = G.season().id;
    const winter = seasonId === 'hiver';
    const wId = state.weather || 'sun';
    const pathStyle = domPrefs().path || 'sand';

    // Zones encore verrouillées : petits bois sauvages organiques
    const wildWoods = zones
        .filter(z => !z.open)
        .map((z, k) => {
            const cx = (z.pos[0] / 100) * W;
            const cy = (z.pos[1] / 100) * H;
            const s = k % 2 ? 1 : -1;
            return `<g>
                <ellipse cx="${cx}" cy="${cy + 18}" rx="30" ry="6.5" fill="rgba(58,38,24,.14)"/>
                <rect x="${cx - 17 * s}" y="${cy + 2}" width="7" height="16" rx="2" fill="#8b5a32" stroke="${O}" stroke-width="2"/>
                <circle cx="${cx - 13 * s}" cy="${cy - 6}" r="14.5" fill="var(--dom-tree1)" stroke="${O}" stroke-width="2.2"/>
                <rect x="${cx + 8 * s}" y="${cy + 4}" width="6.5" height="14" rx="2" fill="#8b5a32" stroke="${O}" stroke-width="2"/>
                <circle cx="${cx + 12 * s}" cy="${cy - 3}" r="12.5" fill="var(--dom-tree2)" stroke="${O}" stroke-width="2.2"/>
                <circle cx="${cx - 2 * s}" cy="${cy - 13}" r="12" fill="var(--dom-tree1)" stroke="${O}" stroke-width="2.2"/>
            </g>`;
        })
        .join('');

    // Arc-en-ciel pastel quand la météo est rainbow
    const rainbow =
        wId === 'rainbow'
            ? `<g fill="none" stroke-linecap="round" opacity=".68">
                <path d="M58 118 A152 108 0 0 1 362 118" stroke="#f57c7c" stroke-width="6"/>
                <path d="M64 118 A146 102 0 0 1 356 118" stroke="#ffd25e" stroke-width="6"/>
                <path d="M70 118 A140 96 0 0 1 350 118" stroke="#7fd97a" stroke-width="6"/>
                <path d="M76 118 A134 90 0 0 1 344 118" stroke="#75c5f7" stroke-width="6"/>
                <path d="M82 118 A128 84 0 0 1 338 118" stroke="#c395f0" stroke-width="6"/>
            </g>`
            : '';

    // Sentier de campagne sinueux reliant les 4 hameaux (zéro ligne droite)
    const lane =
        `M${W * 0.28} ${H * 0.28} ` +
        `C${W * 0.42} ${H * 0.32}, ${W * 0.52} ${H * 0.35}, ${W * 0.54} ${H * 0.405} ` +
        `C${W * 0.56} ${H * 0.465}, ${W * 0.72} ${H * 0.485}, ${W * 0.75} ${H * 0.535} ` +
        `C${W * 0.76} ${H * 0.585}, ${W * 0.36} ${H * 0.545}, ${W * 0.29} ${H * 0.585} ` +
        `C${W * 0.23} ${H * 0.625}, ${W * 0.66} ${H * 0.635}, ${W * 0.71} ${H * 0.678} ` +
        `C${W * 0.74} ${H * 0.725}, ${W * 0.38} ${H * 0.685}, ${W * 0.28} ${H * 0.728} ` +
        `C${W * 0.22} ${H * 0.765}, ${W * 0.62} ${H * 0.785}, ${W * 0.70} ${H * 0.82} ` +
        `C${W * 0.62} ${H * 0.86}, ${W * 0.42} ${H * 0.845}, ${W * 0.32} ${H * 0.895}`;
    const spurBarn = `M${W * 0.50} ${H * 0.425} Q${W * 0.34} ${H * 0.455} ${W * 0.20} ${H * 0.43}`;
    const spurPond = `M${W * 0.52} ${H * 0.86} Q${W * 0.65} ${H * 0.89} ${W * 0.73} ${H * 0.92}`;
    const allPaths = `${lane} ${spurBarn} ${spurPond}`;

    const cobble =
        pathStyle === 'cobble'
            ? `<path d="${allPaths}" stroke="rgba(58,38,24,.23)" stroke-width="2.4" stroke-dasharray="2 10" stroke-linecap="round" fill="none"/>`
            : '';

    return `<svg class="dom-bg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
        <defs>
            <linearGradient id="domSky" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--sky-top)"/>
                <stop offset="100%" stop-color="var(--sky-bot)"/>
            </linearGradient>
            <linearGradient id="domMeadow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--dom-m1)"/>
                <stop offset="55%" stop-color="var(--dom-m2)"/>
                <stop offset="100%" stop-color="var(--dom-m3)"/>
            </linearGradient>
        </defs>
        <rect width="${W}" height="${skyH + 48}" fill="url(#domSky)"/>
        ${rainbow}
        <path d="M0 ${skyH - 8} Q${W * 0.22} ${skyH - 44} ${W * 0.5} ${skyH - 14} T${W} ${skyH - 22} L${W} ${H} L0 ${H}Z" fill="var(--dom-h1)"/>
        <path d="M0 ${skyH + 18} Q${W * 0.34} ${skyH - 16} ${W * 0.68} ${skyH + 12} T${W} ${skyH + 2} L${W} ${H} L0 ${H}Z" fill="var(--dom-h2)"/>
        <path d="M0 ${skyH + 38} Q${W * 0.44} ${skyH + 18} ${W} ${skyH + 36} L${W} ${H} L0 ${H}Z" fill="url(#domMeadow)"/>

        <!-- 4 quartiers naturels : placette de cour, clairière lavande, coteau vignoble, plaine fertile -->
        <ellipse cx="${W * 0.48}" cy="${H * 0.445}" rx="134" ry="86" fill="var(--dom-path)" opacity=".34"/>
        <ellipse cx="${W * 0.48}" cy="${H * 0.455}" rx="86" ry="44" fill="var(--dom-path)" opacity=".28"/>
        <ellipse cx="${W * 0.24}" cy="${H * 0.702}" rx="88" ry="46" fill="${winter ? '#dfe9f2' : '#c8aee8'}" opacity=".32"/>
        <ellipse cx="${W * 0.76}" cy="${H * 0.665}" rx="88" ry="48" fill="var(--dom-h1)" opacity=".44"/>
        <ellipse cx="${W * 0.28}" cy="${H * 0.942}" rx="112" ry="50" fill="var(--dom-h2)" opacity=".36"/>

        <!-- Anse du port + ruisseau sinueux jusqu'à l'étang -->
        <path d="M${W * 0.58} ${H * 0.132} Q${W * 0.68} ${H * 0.20} ${W} ${H * 0.205} L${W} ${H * 0.118} Q${W * 0.78} ${H * 0.112} ${W * 0.58} ${H * 0.132}Z" fill="var(--dom-water1)" stroke="${O}" stroke-width="2"/>
        <path class="dom-ripple" d="M${W * 0.68} ${H * 0.165} Q${W * 0.74} ${H * 0.16} ${W * 0.80} ${H * 0.166} M${W * 0.79} ${H * 0.184} Q${W * 0.85} ${H * 0.18} ${W * 0.91} ${H * 0.185}" fill="none" stroke="var(--dom-water2)" stroke-width="2.2" stroke-linecap="round"/>
        <path d="M${W * 0.94} ${H * 0.20} C${W * 0.98} ${H * 0.33}, ${W * 0.88} ${H * 0.44}, ${W * 0.93} ${H * 0.57} C${W * 0.98} ${H * 0.69}, ${W * 0.88} ${H * 0.82}, ${W * 0.78} ${H * 0.93}" fill="none" stroke="var(--dom-water1)" stroke-width="14" stroke-linecap="round"/>
        <path class="dom-ripple" d="M${W * 0.94} ${H * 0.24} Q${W * 0.91} ${H * 0.36} ${W * 0.92} ${H * 0.46} M${W * 0.93} ${H * 0.64} Q${W * 0.94} ${H * 0.74} ${W * 0.88} ${H * 0.82}" fill="none" stroke="var(--dom-water2)" stroke-width="2.4" stroke-dasharray="8 16" stroke-linecap="round"/>
        <ellipse cx="${W * 0.77}" cy="${H * 0.934}" rx="70" ry="30" fill="var(--dom-water1)" stroke="${O}" stroke-width="2.2"/>
        <ellipse class="dom-ripple" cx="${W * 0.77}" cy="${H * 0.93}" rx="48" ry="16" fill="var(--dom-water2)" opacity=".55"/>
        <!-- Nénuphars sur l'étang -->
        <g opacity="${winter ? 0.25 : 0.9}">
            <ellipse cx="${W * 0.67}" cy="${H * 0.942}" rx="6.5" ry="4" fill="#59a846" stroke="${O}" stroke-width="1.2"/>
            <circle cx="${W * 0.675}" cy="${H * 0.94}" r="2.2" fill="#f7a6c4"/>
            <ellipse cx="${W * 0.87}" cy="${H * 0.924}" rx="5.5" ry="3.5" fill="#59a846" stroke="${O}" stroke-width="1.2"/>
        </g>

        <!-- Voie ferrée courbe qui suit la colline -->
        <path d="M0 ${H * 0.142} Q${W * 0.22} ${H * 0.155} ${W * 0.5} ${H * 0.135}" fill="none" stroke="#8b6a4a" stroke-width="7" stroke-dasharray="3 5"/>
        <path d="M0 ${H * 0.14} Q${W * 0.22} ${H * 0.153} ${W * 0.5} ${H * 0.133} M0 ${H * 0.144} Q${W * 0.22} ${H * 0.157} ${W * 0.5} ${H * 0.137}" fill="none" stroke="#5d5248" stroke-width="1.6"/>

        <!-- Rangs de vignes ondulants derrière la Cave / Château -->
        <g stroke="#5e8f2e" stroke-width="2.3" stroke-linecap="round" fill="none" opacity="${winter ? 0.35 : 0.76}">
            <path d="M${W * 0.62} ${H * 0.622} Q${W * 0.75} ${H * 0.611} ${W * 0.9} ${H * 0.62}"/>
            <path d="M${W * 0.64} ${H * 0.632} Q${W * 0.77} ${H * 0.621} ${W * 0.91} ${H * 0.63}"/>
            <path d="M${W * 0.63} ${H * 0.642} Q${W * 0.76} ${H * 0.632} ${W * 0.9} ${H * 0.64}"/>
        </g>

        <!-- Sentiers en S doux (bordure terre + sable/pavés/tomette) -->
        <g fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="${allPaths}" stroke="var(--dom-path-e)" stroke-width="23"/>
            <path d="${allPaths}" stroke="var(--dom-path)" stroke-width="16"/>
        </g>
        ${cobble}

        <!-- Petit pont en bois sur le ruisseau -->
        <g transform="translate(${W * 0.895} ${H * 0.568}) rotate(-12)">
            <rect x="-12" y="-5" width="24" height="10" rx="2.5" fill="#c98a4b" stroke="${O}" stroke-width="1.8"/>
            <path d="M-6 -5 V5 M0 -5 V5 M6 -5 V5" stroke="#8b5a32" stroke-width="1.4"/>
        </g>

        <!-- Bottes de foin ombrées près de la Grange & panneau directionnel au carrefour -->
        <g>
            <ellipse cx="${W * 0.085}" cy="${H * 0.455}" rx="10" ry="6.2" fill="#f2c14e" stroke="${O}" stroke-width="1.7"/>
            <path d="M${W * 0.073} ${H * 0.452} Q${W * 0.085} ${H * 0.457} ${W * 0.097} ${H * 0.452}" stroke="#b88424" stroke-width="1.3" fill="none"/>
            <ellipse cx="${W * 0.122}" cy="${H * 0.461}" rx="8.5" ry="5.5" fill="#e6b03c" stroke="${O}" stroke-width="1.7"/>
            <path d="M${W * 0.44} ${H * 0.585} V${H * 0.598}" stroke="#7a4a2a" stroke-width="2.6" stroke-linecap="round"/>
            <path d="M${W * 0.422} ${H * 0.587} L${W * 0.458} ${H * 0.585} L${W * 0.464} ${H * 0.589} L${W * 0.458} ${H * 0.593} L${W * 0.422} ${H * 0.591}Z" fill="#e8c38c" stroke="${O}" stroke-width="1.4"/>
        </g>

        <!-- Clôtures rustiques courbes -->
        <g stroke="#8b5a32" stroke-width="2.4" stroke-linecap="round" fill="none">
            <path d="M${W * 0.18} ${H * 0.342} Q${W * 0.29} ${H * 0.332} ${W * 0.41} ${H * 0.346}"/>
            <path d="M${W * 0.21} ${H * 0.335} V${H * 0.349} M${W * 0.30} ${H * 0.331} V${H * 0.345} M${W * 0.38} ${H * 0.338} V${H * 0.352}"/>
            <path d="M${W * 0.62} ${H * 0.482} Q${W * 0.72} ${H * 0.475} ${W * 0.80} ${H * 0.484}"/>
            <path d="M${W * 0.64} ${H * 0.476} V${H * 0.489} M${W * 0.72} ${H * 0.473} V${H * 0.486} M${W * 0.78} ${H * 0.477} V${H * 0.49}"/>
        </g>

        <!-- Fleurs sauvages, lavande & touffes d'herbe -->
        <g opacity="${winter ? 0 : 0.92}">
            <circle cx="${W * 0.13}" cy="${H * 0.688}" r="3.4" fill="#8b5ec4" stroke="${O}" stroke-width="1"/>
            <circle cx="${W * 0.16}" cy="${H * 0.728}" r="3" fill="#a87ce0" stroke="${O}" stroke-width="1"/>
            <circle cx="${W * 0.35}" cy="${H * 0.722}" r="3.2" fill="#8b5ec4" stroke="${O}" stroke-width="1"/>
            <circle cx="${W * 0.49}" cy="${H * 0.305}" r="2.8" fill="#fff7c2" stroke="${O}" stroke-width="1"/>
            <circle cx="${W * 0.52}" cy="${H * 0.312}" r="2.3" fill="#f59ab1" stroke="${O}" stroke-width="1"/>
            <circle cx="${W * 0.33}" cy="${H * 0.495}" r="2.6" fill="#ffd23f" stroke="${O}" stroke-width="1"/>
            <circle cx="${W * 0.59}" cy="${H * 0.618}" r="2.5" fill="#fff7c2" stroke="${O}" stroke-width="1"/>
            <circle cx="${W * 0.48}" cy="${H * 0.785}" r="2.7" fill="#f59ab1" stroke="${O}" stroke-width="1"/>
            <circle cx="${W * 0.54}" cy="${H * 0.888}" r="2.8" fill="#fff7c2" stroke="${O}" stroke-width="1"/>
            <path d="M${W * 0.56} ${H * 0.325} l-3 -5 m3 5 l3 -4 M${W * 0.16} ${H * 0.59} l-3 -5 m3 5 l3 -4 M${W * 0.61} ${H * 0.76} l-3 -5 m3 5 l3 -4 M${W * 0.54} ${H * 0.94} l-3 -5 m3 5 l3 -4" stroke="#3f8f2e" stroke-width="1.6" stroke-linecap="round"/>
        </g>
        ${wildWoods}
    </svg>`;
}

// ---------------- couches météo & vie ambiante ----------------
function weatherLayerHtml() {
    const wId = state.weather || 'sun';
    const seasonId = G.season().id;
    const parts = [];

    if (wId === 'sun' || wId === 'heat' || wId === 'rainbow') {
        parts.push('<div class="dom-sunbeams"></div>');
    }
    if (wId === 'rain' || wId === 'storm') {
        const drops = Array.from({ length: 18 }, (_, i) => {
            const left = 4 + ((i * 19) % 92);
            const delay = ((i * 0.27) % 1.2).toFixed(2);
            const dur = (0.95 + (i % 4) * 0.12).toFixed(2);
            return `<i style="left:${left}%;animation-delay:${delay}s;animation-duration:${dur}s"></i>`;
        }).join('');
        parts.push(`<div class="dom-rain">${drops}</div>`);
        if (wId === 'storm') parts.push('<div class="dom-storm-flash"></div>');
    } else if (wId === 'snow' || (seasonId === 'hiver' && wId !== 'sun')) {
        const flakes = Array.from({ length: 16 }, (_, i) => {
            const left = 5 + ((i * 23) % 90);
            const delay = ((i * 0.65) % 6.5).toFixed(2);
            const dur = (6.4 + (i % 4) * 1.1).toFixed(2);
            return `<i style="left:${left}%;animation-delay:${delay}s;animation-duration:${dur}s"></i>`;
        }).join('');
        parts.push(`<div class="dom-snow">${flakes}</div>`);
    } else if (seasonId === 'printemps' || seasonId === 'automne') {
        const kind = seasonId === 'printemps' ? 'petals' : 'leaves';
        const items = Array.from({ length: 8 }, (_, i) => {
            const left = 8 + ((i * 29) % 84);
            const delay = ((i * 1.15) % 8).toFixed(2);
            return `<i style="left:${left}%;animation-delay:${delay}s"></i>`;
        }).join('');
        parts.push(`<div class="dom-drift ${kind}">${items}</div>`);
    }

    return `<div class="dom-weather">${parts.join('')}</div>`;
}

function cloudsHtml() {
    const wId = state.weather || 'sun';
    const n = wId === 'cloud' || wId === 'rain' || wId === 'storm' ? 4 : wId === 'cloudy' ? 3 : 2;
    const clouds = Array.from({ length: n }, (_, i) => {
        const top = 14 + (i % 3) * 18;
        const w = 44 + (i % 2) * 16;
        const dur = 34 + i * 9;
        const delay = -(i * 11);
        return `<i class="dom-cloud" style="top:${top}px;width:${w}px;animation-duration:${dur}s;animation-delay:${delay}s"></i>`;
    }).join('');
    return `<div class="dom-clouds">${clouds}</div>`;
}

function butterfliesHtml() {
    const wId = state.weather || 'sun';
    if (G.season().id === 'hiver' || wId === 'rain' || wId === 'storm' || wId === 'snow') return '';
    return `<div class="dom-butterflies">
        <i class="dom-bfly" style="left:44%;top:62%;animation-delay:0s"></i>
        <i class="dom-bfly pink" style="left:36%;top:76%;animation-delay:2.6s"></i>
    </div>`;
}

// ---------------- exécution des actions directes réelles ----------------
function runDirect(kind, el) {
    const at = centerOf(el);
    if (kind === 'fieldsHarvest') {
        G.harvestAll(at);
        return true;
    }
    if (kind === 'fieldsWater') {
        G.waterAll(at);
        return true;
    }
    if (kind === 'fieldsReplant') {
        const seed = pickReplantSeed();
        if (!seed) {
            emit('toast', { text: 'Aucune graine disponible pour ressemer', icon: ['ui', 'seedPack'] });
            return false;
        }
        G.selectTool(seed);
        G.plantAll(at);
        return true;
    }
    if (kind === 'fieldsEgg') {
        if (state.egg) G.collectEgg(state.egg.i, at);
        return true;
    }
    if (kind === 'fieldsHoney') {
        state.grid.forEach((p, i) => {
            if (p.deco === 'hive' && Math.floor(p.honey || 0) >= 1) G.handleHive(i, at);
        });
        return true;
    }
    if (kind === 'orchardCollect') {
        G.pickAllTrees(at, 'farm');
        return true;
    }
    if (kind === 'animalsCollect') {
        G.collectAll(at);
        return true;
    }
    if (kind === 'animalsFeed') {
        G.feedAll(at);
        return true;
    }
    if (kind === 'machinesCollect') {
        G.collectAllMachines(at);
        return true;
    }
    if (kind === 'machinesRestart') {
        G.restartAllMachines(at);
        return true;
    }
    if (kind === 'stallCollect') {
        G.collectAllStall(at);
        return true;
    }
    if (kind === 'questsTurnIn') {
        G.turnInAll(at);
        return true;
    }
    if (kind === 'caveCare') {
        if (state.cave && state.cave.slots) {
            let n = 0;
            state.cave.slots.forEach((l, i) => {
                if (l && G.careNeeded(l) && G.careLot(i, at)) n++;
            });
            return n > 0;
        }
        return false;
    }
    if (kind === 'brewCollect') {
        if (state.brew) {
            state.brew.vats.forEach((v, i) => {
                if (G.vatReady(v) && !v.loop) G.collectVat(i, at);
            });
        }
        return true;
    }
    if (kind === 'perfumeBottle') {
        if (state.perfume) {
            state.perfume.vats.forEach((v, i) => {
                if (G.perfumeVatReady(v)) G.bottlePerfume(i, at);
            });
        }
        return true;
    }
    if (kind === 'perfumePop') {
        local.pfPop = !local.pfPop;
        emit('sfx', 'click');
        return true;
    }
    if (kind === 'natureCollect') {
        if (G.loadsReady('lumber')) G.collectLoads('lumber', at);
        if (G.loadsReady('miner')) G.collectLoads('miner', at);
        return true;
    }
    if (kind === 'voyagesHarvest') {
        if (G.islandOpen()) {
            G.harvestAllIsland(at);
            G.pickAllTrees(at, 'island');
            if (G.apiaryOpen('island') && Math.floor(G.apiaryOf('island').honey) >= 1) G.harvestApiary('island', at);
        }
        if (G.oasisOpen()) {
            G.harvestAllOasis(at);
            if (G.apiaryOpen('oasis') && Math.floor(G.apiaryOf('oasis').honey) >= 1) G.harvestApiary('oasis', at);
        }
        if (G.nordOpen()) {
            G.harvestAllNord(at);
            if (G.apiaryOpen('nord') && Math.floor(G.apiaryOf('nord').honey) >= 1) G.harvestApiary('nord', at);
        }
        return true;
    }
    return false;
}

function runAllDirect(el) {
    const at = centerOf(el);
    const zones = buildZones();
    let count = 0;
    if (state.dog && state.dog.owned && state.dog.found) {
        G.handleDog(at);
        count++;
    }
    for (const z of zones) {
        if (!z.open || !z.bub || !z.bub.direct || z.bub.direct === 'perfumePop') continue;
        if (runDirect(z.bub.direct, el)) count++;
    }
    if (count > 0) {
        burstAt(at.x, at.y, 'sparkle', 10);
        emit('toast', { text: `Tournée rapide : ${count} zone${count > 1 ? 's' : ''} faite${count > 1 ? 's' : ''} !`, icon: ['ui', 'sparkle'] });
    }
}

// ---------------- export Carte postale PNG (composition SVG pure → Canvas, compatible iOS & desktop) ----------------
function extractSvgInner(svgStr) {
    if (!svgStr) return null;
    const vbMatch = svgStr.match(/viewBox="([^"]+)"/);
    const inner = svgStr.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
    return { vb: vbMatch ? vbMatch[1] : '0 0 64 64', inner };
}

function placeSvgSprite(svgStr, cx, cy, w, h) {
    const p = extractSvgInner(svgStr);
    if (!p) return '';
    return `<svg x="${(cx - w / 2).toFixed(1)}" y="${(cy - h / 2).toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" viewBox="${p.vb}">${p.inner}</svg>`;
}

function resolveVars(svgText, sceneEl) {
    const cs = getComputedStyle(sceneEl);
    const rootCs = getComputedStyle(document.documentElement);
    return svgText.replace(/var\((--[a-zA-Z0-9-]+)\)/g, (_, name) => {
        const val = cs.getPropertyValue(name).trim() || rootCs.getPropertyValue(name).trim();
        return val || '#86c95b';
    });
}

function exportPostcardPng() {
    const sceneEl = document.querySelector('#view-domaine .dom-scene');
    if (!sceneEl) return;
    const zones = buildZones();
    const prefs = domPrefs();
    const [tc1, tc2] = treeColors();

    const bgResolved = resolveVars(bgSvg(zones), sceneEl);
    const bgParsed = extractSvgInner(bgResolved);

    const layers = [];
    // Arbres de lisière
    for (const [x, y, w, cIdx] of EDGE_TREES) {
        const px = (x / 100) * SCENE_W;
        const py = (y / 100) * SCENE_H;
        const sw = (w / 100) * SCENE_W;
        layers.push(placeSvgSprite(CAMP.tree(cIdx ? tc2 : tc1), px, py, sw, sw));
    }
    // Décos posées
    DECO_SLOTS.forEach(([x, y], i) => {
        const d = DOM_DECOS.find(k => k.id === prefs.decos[i]);
        if (!d || d.empty) return;
        const px = (x / 100) * SCENE_W;
        const py = (y / 100) * SCENE_H;
        layers.push(placeSvgSprite(art(d.icon[0], d.icon[1]), px, py, 44, 44));
    });
    // Bâtiments ouverts
    for (const z of zones) {
        if (!z.open) continue;
        const px = (z.pos[0] / 100) * SCENE_W;
        const py = (z.pos[1] / 100) * SCENE_H;
        const sw = Math.min(130, (z.w / 100) * SCENE_W);
        const parts = z.svgParts ? z.svgParts() : [];
        if (parts[0]) layers.push(placeSvgSprite(parts[0], px, py, sw, sw * 0.85));
    }
    // PNJ & Filou
    layers.push(placeSvgSprite(art('villager', 'odette'), SCENE_W * 0.48, SCENE_H * 0.728, 38, 42));
    const vid = visitingVillagerId();
    if (vid) layers.push(placeSvgSprite(art('villager', vid), SCENE_W * 0.62, SCENE_H * 0.256, 38, 42));
    const spouse = G.spouseOf();
    if (spouse) layers.push(placeSvgSprite(art('villager', spouse), SCENE_W * 0.87, SCENE_H * 0.382, 38, 42));
    if (state.dog && state.dog.owned) {
        const [dx, dy] = DOG_WAYPOINTS[local.dogStep % DOG_WAYPOINTS.length];
        layers.push(placeSvgSprite(art('ui', 'dog'), (dx / 100) * SCENE_W, (dy / 100) * SCENE_H, 42, 42));
    }

    // Cartouche souvenir en bas de la carte postale
    const farm = esc(G.farmName());
    const meta = esc(`${G.season().name} · Jour ${state.day} · Niveau ${state.level}`);
    const banner = `<g>
        <rect x="44" y="${SCENE_H - 84}" width="${SCENE_W - 88}" height="62" rx="14" fill="#fff8e4" stroke="#3a2618" stroke-width="3"/>
        <text x="${SCENE_W / 2}" y="${SCENE_H - 56}" text-anchor="middle" font-family="Nunito,system-ui,sans-serif" font-size="18" font-weight="900" fill="#3a2618">${farm}</text>
        <text x="${SCENE_W / 2}" y="${SCENE_H - 35}" text-anchor="middle" font-family="Nunito,system-ui,sans-serif" font-size="12" font-weight="800" fill="#7a5838">${meta}</text>
    </g>`;

    const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SCENE_W * 2}" height="${SCENE_H * 2}" viewBox="0 0 ${SCENE_W} ${SCENE_H}">
        ${bgParsed ? bgParsed.inner : ''}
        ${layers.join('')}
        ${banner}
    </svg>`;

    const blob = new Blob([fullSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = SCENE_W * 2;
            canvas.height = SCENE_H * 2;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);
            canvas.toBlob(png => {
                if (!png) return;
                const dlUrl = URL.createObjectURL(png);
                const a = document.createElement('a');
                const slug = G.farmName()
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/^-|-$/g, '');
                a.href = dlUrl;
                a.download = `carte-postale-${slug || 'meuh'}.png`;
                document.body.appendChild(a);
                a.click();
                a.remove();
                setTimeout(() => URL.revokeObjectURL(dlUrl), 1500);
                emit('toast', { text: 'Carte postale enregistrée en PNG !', icon: ['ui', 'camera'] });
            }, 'image/png');
        } catch {
            URL.revokeObjectURL(url);
            emit('toast', { text: 'Impossible de générer l’image sur cet appareil', icon: ['ui', 'camera'] });
        }
    };
    img.onerror = () => {
        URL.revokeObjectURL(url);
        emit('toast', { text: 'Erreur lors de la création de la carte postale', icon: ['ui', 'camera'] });
    };
    img.src = url;
}

// ---------------- rendu de la vue Domaine ----------------
function perfumePopHtml() {
    if (!local.pfPop || !G.perfumeOpen() || !state.perfume) return '';
    const idx = state.perfume.vats.findIndex(v => G.perfumeVatCanCare(v));
    if (idx < 0) {
        local.pfPop = false;
        return '';
    }
    const v = state.perfume.vats[idx];
    const p = state.perfume.creations[v.pid];
    const name = p ? p.name : 'Macération';
    return `<div class="dom-pop" style="left:clamp(124px,24%,calc(100% - 124px));top:calc(69.5% - 34px)">
        <div class="dom-pop-head">${ico(['ui', 'perfume'])}<span>${esc(name)}</span><button class="dom-pop-close" data-act="domPfClose" aria-label="Fermer">×</button></div>
        <div class="dom-pop-btns">
            <button class="dom-pop-opt" data-act="domPfCare" data-i="${idx}" data-choice="quick">${ico(['ui', 'drop'])}<strong>Rapide</strong><span>Gratuit</span></button>
            <button class="dom-pop-opt deep" data-act="domPfCare" data-i="${idx}" data-choice="deep">${ico(['item', 'lavender'])}<strong>Approfondi</strong><span>Soin renforcé</span></button>
        </div>
    </div>`;
}

function renderDomaine(el) {
    const prefs = domPrefs();
    const zones = buildZones();
    const active = zones.filter(z => z.open && z.bub);
    const directCount =
        active.filter(z => z.bub.direct && z.bub.direct !== 'perfumePop').length + (state.dog && state.dog.owned && state.dog.found ? 1 : 0);

    // Barre Tournée rapide collante + Suivant + Outils
    const chips = [];
    if (state.dog && state.dog.owned && state.dog.found) {
        chips.push(`<button class="dom-chip urgent" data-act="domDog">${ico(['ui', 'dog'])}<span>${esc(state.dog.name)}</span></button>`);
    }
    for (const z of active) {
        chips.push(
            `<button class="dom-chip${z.bub.urgent ? ' urgent' : ''}" data-act="domFocus" data-id="${z.id}">${ico(z.bub.icon)}<span>${esc(z.name)}</span></button>`,
        );
    }

    const nextBtn =
        active.length >= 1
            ? `<button class="dom-chip next" data-act="domNext" title="Aller à la prochaine zone active"><span>Suivant →</span></button>`
            : `<button class="dom-chip next" data-act="domNext" title="Parcourir les quartiers"><span>Quartiers →</span></button>`;

    const tourInner =
        chips.length === 0
            ? `<div class="dom-calm-msg">${ico(['ui', G.weather().icon || 'w_sun'])}<span>${esc(G.weather().name)} · Tout est calme</span></div>${nextBtn}`
            : (directCount >= 2 ? `<button class="btn sm green" data-act="domAll">${ico(['ui', 'sparkle'])}<span>Tout (${directCount})</span></button>` : '') +
              nextBtn +
              chips.join('');

    const topHtml = local.postcard
        ? ''
        : `<div class="dom-top">
            <div class="dom-tour">${tourInner}</div>
            <div class="dom-tools">
                <button class="dom-tool${prefs.focus ? ' on' : ''}" data-act="domToggleFocus" title="Mode Focus : ne montrer que les bâtiments actifs" aria-label="Mode Focus">${ico(['ui', 'sparkle'])}</button>
                <button class="dom-tool${local.decorating ? ' on' : ''}" data-act="domToggleDeco" title="Personnaliser le chemin et les décorations" aria-label="Personnaliser">${ico(['ui', 'flowers'])}</button>
                <button class="dom-tool" data-act="domPostcard" title="Mode Carte postale" aria-label="Carte postale">${ico(['ui', 'camera'])}</button>
            </div>
        </div>`;

    const decoBarHtml =
        local.decorating && !local.postcard
            ? `<div class="dom-deco-bar">
                <span>Chemin :</span>
                <div class="dom-seg">
                    <button class="${prefs.path === 'sand' ? 'on' : ''}" data-act="domPath" data-v="sand">Sable</button>
                    <button class="${prefs.path === 'cobble' ? 'on' : ''}" data-act="domPath" data-v="cobble">Pavés</button>
                    <button class="${prefs.path === 'brick' ? 'on' : ''}" data-act="domPath" data-v="brick">Tomette</button>
                </div>
                <button class="btn sm" data-act="open" data-sheet="house">${ico(['ui', 'house'])}<span>Style maison</span></button>
                <div class="dom-deco-note">Touche un cercle « + » ou une déco sur le domaine pour placer tes trophées et décos.</div>
            </div>`
            : '';

    const [tc1, tc2] = treeColors();
    const treesHtml = `<div class="dom-trees">${EDGE_TREES.map(
        ([x, y, w, cIdx]) => `<span class="dom-tree" style="left:${x}%;top:${y}%;width:${w}%">${CAMP.tree(cIdx ? tc2 : tc1)}</span>`,
    ).join('')}</div>`;

    const decosHtml = DECO_SLOTS.map(([x, y], i) => {
        const d = DOM_DECOS.find(k => k.id === prefs.decos[i]) || DOM_DECOS[0];
        return `<button class="dom-deco${d.empty ? ' empty' : ''}" data-act="domDecoSlot" data-i="${i}" style="left:${x}%;top:${y}%" aria-label="${esc(d.name)}">
            ${d.empty ? '<span class="dom-deco-plus">+</span>' : ico(d.icon)}
        </button>`;
    }).join('');

    const spotsHtml = zones
        .filter(z => z.open)
        .map(z => {
            const b = z.bub;
            const bubHtml = b
                ? `<span class="dom-bub ${b.cls}" data-act="${b.direct ? 'domBub' : 'go'}"${
                      b.direct ? ` data-kind="${b.direct}"` : ` data-path="${b.open}"`
                  }>${ico(b.icon)}<span>${b.rawLabel ? b.label : esc(b.label)}</span></span>`
                : '';
            return `<div class="dom-spot${b ? ' has-bub' : ''}" id="dom-spot-${z.id}" data-act="domZone" data-id="${z.id}" style="left:${z.pos[0]}%;top:${z.pos[1]}%;width:${z.w}%" role="button" tabindex="0" aria-label="${esc(z.name)}">
                ${z.glow ? '<span class="dom-glow"></span>' : ''}
                ${bubHtml}
                ${z.art()}
                <span class="dom-name">${esc(z.name)}</span>
                ${z.pulse || ''}
            </div>`;
        })
        .join('');

    const [dx, dy] = DOG_WAYPOINTS[local.dogStep % DOG_WAYPOINTS.length];
    const dogHtml =
        state.dog && state.dog.owned
            ? `<button class="dom-dog${local.dogFlip ? ' flip' : ''}" data-act="domDog" style="left:${dx}%;top:${dy}%" aria-label="${esc(state.dog.name)}">
                ${state.dog.found ? `<span class="dom-dog-bub">${ico(['ui', 'coin'])}<span>Trésor !</span></span>` : ''}
                ${ico(['ui', 'dog'])}
            </button>`
            : '';

    const mamieReady = G.mamieReady && G.mamieReady();
    const odetteHtml = `<button class="dom-npc" data-act="domOdette" style="left:48%;top:72.8%" aria-label="Mamie Odette">
        ${mamieReady ? `<span class="dom-dog-bub">${ico(['ui', 'heart'])}<span>Plat !</span></span>` : ''}
        ${ico(['villager', 'odette'])}
    </button>`;

    const vid = state.level >= 3 ? visitingVillagerId() : null;
    const vilHtml = vid
        ? `<button class="dom-npc" data-act="domVillager" data-vid="${vid}" style="left:62%;top:25.6%" aria-label="${esc(VILLAGERS[vid].name)}">
            ${ico(['villager', vid])}
        </button>`
        : '';

    const spouse = G.spouseOf();
    const famReady = G.familyOpen() && G.familyReady() > 0;
    const spouseHtml = spouse
        ? `<button class="dom-npc" data-act="domSpouse" style="left:87%;top:38.2%" aria-label="${esc(G.vName(spouse))}">
            ${famReady ? `<span class="dom-dog-bub">${ico(['ui', 'heart'])}<span>Famille</span></span>` : ''}
            ${ico(['villager', spouse])}
        </button>`
        : '';

    const planeHtml = G.cargoHere(now()) ? `<div class="dom-plane">${ico(['ui', 'plane'])}</div>` : '';
    const fireflies = Array.from({ length: 10 }, (_, i) => {
        const l = 10 + ((i * 23) % 82);
        const top = 24 + ((i * 19) % 68);
        return `<i style="left:${l}%;top:${top}%;animation-delay:${(i * 0.45).toFixed(2)}s"></i>`;
    }).join('');

    const sceneCls = [
        'dom-scene',
        `path-${prefs.path || 'sand'}`,
        prefs.focus ? 'focus' : '',
        local.decorating ? 'decorating' : '',
        local.postcard ? 'postcard' : '',
    ]
        .filter(Boolean)
        .join(' ');

    const postcardBar = local.postcard
        ? `<div class="dom-pc-bar">
            <div class="dom-pc-stamp">
                <strong>${esc(G.farmName())}</strong>
                <span>${esc(G.season().name)} · Jour ${state.day} · Niveau ${state.level}</span>
            </div>
            <div class="dom-pc-btns">
                <button class="btn green sm" data-act="domExportPng">${ico(['ui', 'camera'])}<span>Enregistrer PNG</span></button>
                <button class="btn gold sm" data-act="domPostcard"><span>Réafficher</span></button>
            </div>
        </div>`
        : '';

    const sceneHtml = `<div class="${sceneCls}">
        ${bgSvg(zones)}
        ${cloudsHtml()}
        ${treesHtml}
        ${planeHtml}
        ${decosHtml}
        ${spotsHtml}
        ${vilHtml}
        ${spouseHtml}
        ${odetteHtml}
        ${dogHtml}
        ${butterfliesHtml()}
        ${perfumePopHtml()}
        <div class="dom-night-veil"></div>
        ${weatherLayerHtml()}
        <div class="dom-fireflies">${fireflies}</div>
    </div>${postcardBar}`;

    blocks(el, [['dom', `<div class="dom-wrap">${topHtml}${decoBarHtml}${sceneHtml}</div>`]]);
}

defineView('domaine', renderDomaine);

// ---------------- mises à jour live chaque seconde (sans re-render DOM) ----------------
defineLive('domMach', activeMachPct);
defineLive('domPerfume', activePerfumePct);
defineLive('domCave', activeCavePct);

// ---------------- mini-fiches bâtiment vraiment actionnables ----------------
function renderZoneDetails(z) {
    const t = now();
    const btns = [];
    let body = '';

    if (z.id === 'fields') {
        const readyN = G.allPlots().filter(([p]) => p.isUnlocked && p.itemId && p.isReady).length;
        const dryN = state.grid.filter(p => p.isUnlocked && p.itemId && !p.isReady && !p.isWatered).length;
        const emptyN = state.grid.filter(p => p.isUnlocked && !p.itemId && !p.deco).length;
        const seed = pickReplantSeed();
        if (readyN > 0) btns.push(`<button class="btn green" data-act="domSheetAct" data-kind="fieldsHarvest">${ico(['ui', 'basket'])}<span>Récolter (${readyN})</span></button>`);
        if (dryN > 0 && !G.weather().waters) {
            btns.push(`<button class="btn" data-act="domSheetAct" data-kind="fieldsWater">${ico(['ui', 'drop'])}<span>Arroser (${dryN})</span></button>`);
        }
        if (emptyN > 0 && seed) {
            btns.push(
                `<button class="btn gold" data-act="domSheetAct" data-kind="fieldsReplant">${ico(['item', seed])}<span>Ressemer (${esc(ITEMS[seed].name)})</span></button>`,
            );
        }
    } else if (z.id === 'workshop') {
        const work = state.machines.filter(m => m.type !== 'counter');
        const doneN = work.filter(m => G.outCount(m) > 0).length;
        const busy = work.filter(m => G.machineBusy(m));
        const restartable = work.filter(m => !G.machineBusy(m) && m.last && RECIPES[m.last] && G.recipeUnlocked(m.last) && G.canCook(m.last)).length;
        if (busy.length) {
            body = `<div class="dom-sheet-list">${busy
                .slice(0, 4)
                .map(m => {
                    const rid = m.queue[0];
                    const rec = RECIPES[rid];
                    const pct = Math.round(G.machinePct(m) * 100);
                    const left = formatDuration(G.machineLeft(m));
                    return `<div class="dom-sheet-item">
                        ${ico(['machine', m.type])}
                        <div class="mid">
                            <strong>${esc((MACHINES[m.type] && MACHINES[m.type].name) || m.type)} · ${esc((rec && rec.name) || rid)}</strong>
                            <small>Reste ${esc(left)}</small>
                            <div class="dom-sheet-bar"><i style="width:${pct}%"></i></div>
                        </div>
                    </div>`;
                })
                .join('')}</div>`;
        }
        if (doneN > 0) btns.push(`<button class="btn green" data-act="domSheetAct" data-kind="machinesCollect">${ico(['ui', 'sparkle'])}<span>Collecter (${doneN})</span></button>`);
        if (restartable > 0) {
            btns.push(`<button class="btn gold" data-act="domSheetAct" data-kind="machinesRestart">${ico(['machine', 'mill'])}<span>Relancer (${restartable})</span></button>`);
        }
    } else if (z.id === 'station') {
        const readyQ = state.quests.filter(G.checkQuestReady);
        const rows = [];
        if (state.truck && state.truck.status === 'here') {
            rows.push(
                `<div class="dom-sheet-item">${ico(['ui', 'trainIcon'])}<div class="mid"><strong>Train à quai</strong><small>Départ dans <span data-until="${state.truck.expiresAt}">…</span></small></div></div>`,
            );
        }
        if (G.cargoHere(t)) {
            rows.push(
                `<div class="dom-sheet-item">${ico(['ui', 'plane'])}<div class="mid"><strong>Cargo prêt</strong><small>Décolle dans <span data-until="${G.cargoLeave()}">…</span></small></div></div>`,
            );
        }
        if (rows.length) body = `<div class="dom-sheet-list">${rows.join('')}</div>`;
        if (readyQ.length > 0) {
            btns.push(`<button class="btn green" data-act="domSheetAct" data-kind="questsTurnIn">${ico(['ui', 'scroll'])}<span>Livrer (${readyQ.length})</span></button>`);
        }
    } else if (z.id === 'cave') {
        const careN = G.caveOpen() ? G.caveCareCount() : 0;
        const brewReady = G.brewOpen() && state.brew ? state.brew.vats.filter(v => G.vatReady(v) && !v.loop).length : 0;
        const rows = [];
        if (G.caveOpen() && state.cave && state.cave.slots) {
            state.cave.slots
                .filter(l => l && !l.bad)
                .slice(0, 3)
                .forEach(l => {
                    const need = G.careNeeded(l);
                    rows.push(
                        `<div class="dom-sheet-item">${ico(G.lotIcon(l))}<div class="mid"><strong>${esc(G.lotName(l))}</strong><small>${need ? 'Soin / remuage prêt' : 'En affinage'}</small></div></div>`,
                    );
                });
        }
        if (rows.length) body = `<div class="dom-sheet-list">${rows.join('')}</div>`;
        if (careN > 0) btns.push(`<button class="btn green" data-act="domSheetAct" data-kind="caveCare">${ico(['ui', 'turn'])}<span>Soigner / Remuer (${careN})</span></button>`);
        if (brewReady > 0) btns.push(`<button class="btn green" data-act="domSheetAct" data-kind="brewCollect">${ico(['ui', 'beer'])}<span>Brassins (${brewReady})</span></button>`);
    } else if (z.id === 'perfume' && G.perfumeOpen() && state.perfume) {
        const vats = (state.perfume.vats || []).map((v, i) => [v, i]).filter(([v]) => !!v);
        if (vats.length) {
            body = `<div class="dom-sheet-list">${vats
                .map(([v, i]) => {
                    const p = state.perfume.creations[v.pid];
                    const ready = G.perfumeVatReady(v);
                    const care = G.perfumeVatCanCare(v);
                    const frac = !ready && v.stageSec ? Math.max(0, Math.min(1, 1 - (v.stageUntil - t) / (v.stageSec * 1000))) : 0;
                    const pct = ready ? 100 : Math.round(((v.stage + frac) / STAGES.length) * 100);
                    return `<div class="dom-sheet-item">
                        ${ico(['ui', 'perfume'])}
                        <div class="mid">
                            <strong>${esc((p && p.name) || 'Macération')}</strong>
                            <small>${ready ? 'Prêt à mettre en flacon' : `Étape ${v.stage + 1}/${STAGES.length}${care ? ' · Soin prêt' : ''}`}</small>
                            <div class="dom-sheet-bar"><i style="width:${pct}%"></i></div>
                        </div>
                        ${care ? `<button class="btn sm gold" data-act="domPfCare" data-i="${i}" data-choice="quick">Soin</button>` : ''}
                    </div>`;
                })
                .join('')}</div>`;
        }
        if (G.perfumeReadyCount() > 0) {
            btns.push(`<button class="btn green" data-act="domSheetAct" data-kind="perfumeBottle">${ico(['ui', 'perfume'])}<span>Mettre en flacon</span></button>`);
        }
    } else if (z.bub && z.bub.direct && z.bub.direct !== 'perfumePop') {
        btns.push(`<button class="btn green" data-act="domSheetAct" data-kind="${z.bub.direct}">${ico(z.bub.icon)}<span>${esc(z.bub.label)} maintenant</span></button>`);
    }

    return { body, btns };
}

defineSheet('domZone', {
    title: o => {
        const z = buildZones().find(x => x.id === o.id);
        return z ? z.name : 'Domaine';
    },
    render(o) {
        const z = buildZones().find(x => x.id === o.id);
        if (!z) return '<p class="empty">Zone introuvable.</p>';
        const { body, btns } = renderZoneDetails(z);
        return `<div class="card">
            <div class="dom-sheet-tags">${(z.tags || []).map(tag => `<span class="dom-sheet-tag">${esc(tag)}</span>`).join('')}</div>
            <p class="card-sub">${esc(z.desc)}</p>
            ${body}
            <div class="dom-sheet-acts">
                ${btns.join('')}
                <button class="btn" data-act="domSheetGo" data-path="${z.go}">${ico(z.icon)}<span>Ouvrir la vue</span></button>
            </div>
        </div>`;
    },
});

defineSheet('domDeco', {
    title: 'Décorer cet emplacement',
    render(o) {
        const i = +o.i;
        const cur = domPrefs().decos[i] || 'none';
        return `<div class="card">
            <p class="card-sub">Pose une décoration sur ton domaine. Les pièces de prestige se débloquent avec ton avancée !</p>
            <div class="dom-deco-grid">
                ${DOM_DECOS.map(d => {
                    const ok = decoUnlocked(d, cur);
                    return `<button class="dom-deco-opt${cur === d.id ? ' on' : ''}${ok ? '' : ' locked'}" data-act="domDecoPick" data-i="${i}" data-id="${d.id}">
                        ${ico(d.icon)}<span>${esc(d.name)}</span>${ok ? '' : `<small>${esc(d.req)}</small>`}
                    </button>`;
                }).join('')}
            </div>
        </div>`;
    },
});

// ---------------- helpers de focus & promenade autonome de Filou ----------------
function focusSpot(id) {
    const sp = document.getElementById('dom-spot-' + id);
    if (!sp) return;
    sp.scrollIntoView({ behavior: 'smooth', block: 'center' });
    sp.classList.remove('spotlight');
    void sp.offsetWidth;
    sp.classList.add('spotlight');
    setTimeout(() => sp.classList.remove('spotlight'), 1900);
}

let wanderTimer = null;
function startDogWander() {
    if (wanderTimer) return;
    wanderTimer = setInterval(() => {
        if (local.postcard || document.documentElement.classList.contains('calm')) return;
        const view = document.getElementById('view-domaine');
        if (!view || !view.classList.contains('on')) return;
        const dogEl = view.querySelector('.dom-dog');
        if (!dogEl) return;
        const [prevX] = DOG_WAYPOINTS[local.dogStep % DOG_WAYPOINTS.length];
        local.dogStep = (local.dogStep + 1) % DOG_WAYPOINTS.length;
        const [nx, ny] = DOG_WAYPOINTS[local.dogStep];
        local.dogFlip = nx < prevX;
        dogEl.classList.toggle('flip', local.dogFlip);
        dogEl.style.left = nx + '%';
        dogEl.style.top = ny + '%';
    }, 9000);
}

// ---------------- initialisation des gestes ----------------
export function setupDomaine() {
    startDogWander();
    actions({
        domBub: (el, d) => {
            runDirect(d.kind, el);
        },
        domZone: (el, d) => {
            if (local.postcard) return;
            openSheet('domZone', { id: d.id });
        },
        domSheetAct: (el, d) => {
            closeSheet('domZone');
            runDirect(d.kind, el);
        },
        domSheetGo: (el, d) => {
            closeSheet('domZone');
            go(d.path);
        },
        domAll: el => {
            local.pfPop = false;
            runAllDirect(el);
        },
        domFocus: (el, d) => {
            focusSpot(d.id);
        },
        domNext: () => {
            const zones = buildZones().filter(z => z.open);
            const active = zones.filter(z => z.bub);
            const list = active.length ? active : zones.filter(z => ['station', 'house', 'cave', 'fields'].includes(z.id));
            if (!list.length) return;
            const target = list[local.nextIdx % list.length];
            local.nextIdx = (local.nextIdx + 1) % list.length;
            focusSpot(target.id);
        },
        domToggleFocus: () => {
            const p = domPrefs();
            p.focus = !p.focus;
            emit('toast', { text: p.focus ? 'Mode Focus : seuls les bâtiments actifs ressortent' : 'Affichage complet du domaine', icon: ['ui', 'sparkle'] });
        },
        domToggleDeco: () => {
            local.decorating = !local.decorating;
            local.pfPop = false;
        },
        domPostcard: () => {
            local.postcard = !local.postcard;
            local.pfPop = false;
        },
        domExportPng: () => {
            exportPostcardPng();
        },
        domPath: (el, d) => {
            domPrefs().path = d.v;
        },
        domDecoSlot: (el, d) => {
            if (!local.decorating) {
                emit('toast', { text: 'Touche le bouton fleurs en haut pour personnaliser tes décos', icon: ['ui', 'flowers'] });
                return;
            }
            openSheet('domDeco', { i: +d.i });
        },
        domDecoPick: (el, d) => {
            const def = DOM_DECOS.find(k => k.id === d.id);
            const cur = domPrefs().decos[+d.i] || 'none';
            if (!def) return;
            if (!decoUnlocked(def, cur)) {
                emit('toast', { text: `${def.name} : se débloque avec « ${def.req} »`, icon: ['ui', 'lock'] });
                emit('sfx', 'error');
                return;
            }
            domPrefs().decos[+d.i] = d.id;
            closeSheet('domDeco');
            emit('sfx', 'plant');
        },
        domDog: el => {
            if (!state.dog || !state.dog.owned) return;
            G.handleDog(centerOf(el));
            const [prevX] = DOG_WAYPOINTS[local.dogStep % DOG_WAYPOINTS.length];
            local.dogStep = (local.dogStep + 1) % DOG_WAYPOINTS.length;
            local.dogFlip = DOG_WAYPOINTS[local.dogStep][0] < prevX;
        },
        domOdette: el => {
            if (G.mamieReady && G.mamieReady()) {
                go('village/orders#give');
                return;
            }
            const at = centerOf(el);
            burstAt(at.x, at.y, 'heart', 5);
            const wId = state.weather || 'sun';
            const sId = G.season().id;
            const pool = [
                'Mamie Odette : « Comme le domaine respire bon aujourd’hui ! »',
                'Mamie Odette : « Un petit tour près des champs, et je rentre au fourneau. »',
            ];
            if (wId === 'rain' || wId === 'storm') pool.push('Mamie Odette : « Bonne petite pluie pour le potager ! »');
            if (sId === 'hiver') pool.push('Mamie Odette : « Je prépare une soupe bien chaude pour ce soir. »');
            if (sId === 'printemps') pool.push('Mamie Odette : « Les cerisiers en fleurs illuminent tout le chemin ! »');
            if (sId === 'automne') pool.push('Mamie Odette : « Quelle belle lumière d’automne sur les vignes ! »');
            emit('toast', { text: pool[Math.floor(Math.random() * pool.length)], icon: ['villager', 'odette'] });
        },
        domVillager: (el, d) => {
            const v = VILLAGERS[d.vid];
            if (!v) return;
            const at = centerOf(el);
            burstAt(at.x, at.y, 'heart', 4);
            const lines = [
                `${v.name} : « Quelle belle promenade sur ton domaine ! »`,
                `${v.name} : « On sent que la ferme tourne à plein régime ici. »`,
                `${v.name} : « Passe au village quand tu auras une minute ! »`,
            ];
            emit('toast', { text: lines[Math.floor(Math.random() * lines.length)], icon: ['villager', d.vid] });
        },
        domSpouse: el => {
            const sp = G.spouseOf();
            if (!sp) return;
            if (G.familyOpen() && G.familyReady() > 0) {
                go('village/family');
                return;
            }
            const at = centerOf(el);
            burstAt(at.x, at.y, 'heart', 6);
            emit('toast', {
                text: `${G.vName(sp)} : « Heureux·se de voir notre maison s’animer chaque jour ! »`,
                icon: ['villager', sp],
            });
        },
        domPfClose: () => {
            local.pfPop = false;
        },
        domPfCare: (el, d) => {
            local.pfPop = false;
            G.carePerfumeVat(+d.i, d.choice, centerOf(el));
        },
    });
}
