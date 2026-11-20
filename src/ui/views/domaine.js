// 1.148 : Vue du Domaine — carte vivante et interactive de toute la ferme (onglet autonome, facile à retirer).
import { state } from '../../core/state.js';
import { now } from '../../core/clock.js';
import { emit } from '../../core/bus.js';
import { ANIMALS } from '../../data/animals.js';
import { NATURE } from '../../data/nature.js';
import * as G from '../../systems/index.js';
import { blocks, actions, esc, centerOf } from '../dom.js';
import { ico, art, SPR } from '../icons.js';
import { genWrap } from '../genlook.js';
import { SPRITES as CAMP } from '../../art/camping.js';
import { defineView, go } from '../app.js';
import { defineSheet, openSheet, closeSheet } from '../sheets.js';
import { burstAt } from '../fx.js';

const DOM_DECOS = [
    { id: 'none', name: 'Libre', icon: ['ui', 'seedPack'], empty: true },
    { id: 'fountain', name: 'Fontaine', icon: ['building', 'fountain'] },
    { id: 'arch', name: 'Arche fleurie', icon: ['ui', 'flowerArch'] },
    { id: 'pfFountain', name: 'Fontaine parfum', icon: ['ui', 'perfumeFountain'] },
    { id: 'trophy', name: 'Trophée', icon: ['ui', 'trophy'] },
    { id: 'cart', name: 'Charrette', icon: ['ui', 'appleCart'] },
    { id: 'birdhouse', name: 'Nichoir', icon: ['ui', 'birdhouse'] },
    { id: 'wish', name: 'Étoile', icon: ['ui', 'wishStar'] },
];

const DECO_SLOTS = [
    [36, 46],
    [64, 46],
    [49, 64],
    [14, 59],
    [50, 82],
];

const DOG_WAYPOINTS = [
    [56, 48],
    [41, 49],
    [60, 58],
    [46, 62],
    [35, 48],
];

// État local purement visuel (jamais bloquant pour la sauvegarde)
const local = {
    decorating: false,
    postcard: false,
    pfPop: false,
    dogStep: 0,
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

// ---------------- calcul en direct de l'état de chaque zone ----------------
function plotThumb(p) {
    if (!p || !p.isUnlocked || !p.itemId) return '';
    const st = G.plotStage(p);
    const v = p.varId && state.genetics && state.genetics.vars[p.varId];
    const svg = art('plant', `${p.itemId}:${st}`);
    return v ? genWrap(svg, v.g) : svg;
}

function buildZones() {
    const plots = G.allPlots().filter(([p]) => p.isUnlocked);
    const readyPlots = plots.filter(([p]) => p.itemId && p.isReady);
    const dryPlots = state.grid.filter(p => p.isUnlocked && p.itemId && !p.isReady && !p.isWatered);
    const fieldHoney = state.grid.reduce((a, p) => a + (p.deco === 'hive' ? Math.floor(p.honey || 0) : 0), 0);

    // Champs & Serre
    let fieldBub = null;
    if (readyPlots.length) {
        fieldBub = {
            icon: ['item', readyPlots[0][0].itemId],
            label: String(readyPlots.length),
            cls: 'ready',
            direct: 'fieldsHarvest',
        };
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
        stationBub = { icon: ['ui', 'trainIcon'], label: 'En gare', cls: 'gold', urgent: true, open: 'village/orders#ship' };
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
    let barnBub = null;
    if (G.barnSpace() <= 0) {
        barnBub = { icon: ['ui', 'barn'], label: 'Pleine', cls: 'urgent', urgent: true, open: 'sheet:barn' };
    } else if (stallSold > 0) {
        barnBub = { icon: ['ui', 'coin'], label: String(stallSold), cls: 'gold', direct: 'stallCollect' };
    }

    // Ateliers (Production)
    const hasWorkshop = state.machines.some(m => m.type !== 'counter');
    const doneMach = state.machines.filter(m => m.type !== 'counter' && G.outCount(m) > 0);
    const busyMach = state.machines.some(m => m.type !== 'counter' && G.machineBusy(m));
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
    let pfBub = null;
    if (pfOpen && state.perfume) {
        const pfReady = G.perfumeReadyCount();
        const pfCare = G.perfumeCareCount();
        const pfOrd = G.perfumeOrdersReady();
        if (pfReady > 0) pfBub = { icon: ['ui', 'perfume'], label: 'Flacon', cls: 'ready', direct: 'perfumeBottle' };
        else if (pfCare > 0) pfBub = { icon: ['ui', 'perfume'], label: 'Soin', cls: 'care', urgent: true, direct: 'perfumePop' };
        else if (pfOrd > 0) pfBub = { icon: ['ui', 'perfume'], label: String(pfOrd), cls: 'gold', open: 'machines/perfume' };
    }

    // Cave & Brasserie
    const caveOrBrew = G.caveOpen() || G.brewOpen();
    const brewVats = G.brewOpen() && state.brew ? state.brew.vats.filter(v => G.vatReady(v) && !v.loop) : [];
    const caveCare = G.caveOpen() ? G.caveCareCount() : 0;
    const caveOrd = G.caveOpen() ? G.caveOrdersReady() : 0;
    const beerOrd = G.brewOpen() ? G.beerOrdersReady() : 0;
    let caveBub = null;
    if (brewVats.length > 0) caveBub = { icon: ['ui', 'beer'], label: String(brewVats.length), cls: 'ready', direct: 'brewCollect' };
    else if (caveCare > 0) caveBub = { icon: ['ui', 'turn'], label: String(caveCare), cls: 'care', open: 'machines/cave' };
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

    const samplePlots = state.grid.slice(0, 6);
    const sampleAn = state.animals.slice(0, 3);

    return [
        {
            id: 'station',
            name: 'Gare',
            pos: [22, 18],
            w: 26,
            open: true,
            go: 'village/orders',
            icon: ['ui', 'trainIcon'],
            tags: [trainHere ? 'Train à quai' : 'Train en route', `${readyQuests} commande${readyQuests > 1 ? 's' : ''} prête${readyQuests > 1 ? 's' : ''}`],
            desc: 'Commandes du village, train régional, cargo, montgolfière et Grands Défis.',
            bub: stationBub,
            art: () =>
                `<div class="dom-art">${art('building', 'station')}${
                    trainHere ? `<div class="dom-train"><span class="loco">${SPR.loco()}</span><span class="wag">${SPR.wagon('#c8453a')}</span></div>` : ''
                }</div>`,
        },
        {
            id: 'village',
            name: 'Village',
            pos: [54, 17],
            w: 26,
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
        },
        {
            id: 'port',
            name: 'Voyages',
            pos: [83, 21],
            w: 24,
            open: voyagesOpen,
            go: voyOpenPath,
            icon: ['ui', 'oaVoyages'],
            tags: [G.islandOpen() ? 'Île' : '', G.oasisOpen() ? 'Oasis' : '', G.nordOpen() ? 'Grand Nord' : ''].filter(Boolean),
            desc: 'Toutes tes contrées lointaines réunies au quai. Touche la bulle pour ramener les récoltes prêtes.',
            bub: portBub,
            art: () => `<div class="dom-art dom-pair"><span class="main">${art('building', 'lighthouse')}</span><span class="boat">${art('ui', 'boat')}</span></div>`,
        },
        {
            id: 'house',
            name: 'Maison',
            pos: [50, 40],
            w: 27,
            open: true,
            glow: true,
            go: 'sheet:house',
            icon: ['ui', 'house'],
            tags: [`Maison niv. ${G.houseLvl() + 1}`, G.maisonOpen() ? 'Atelier Maison ouvert' : 'Personnalisable'],
            desc: 'Ta maison évolue avec ton niveau et ta couleur de grange. Touche la maison pour l’agrandir ou voir son style.',
            bub: houseBub,
            art: () => `<div class="dom-art">${SPR.farmhouse(G.houseLvl(), G.styleOf('barn'))}</div>`,
        },
        {
            id: 'barn',
            name: 'Grange',
            pos: [18, 42],
            w: 21,
            open: true,
            go: 'sheet:barn',
            icon: ['ui', 'barn'],
            tags: [`${G.barnUsed()} / ${G.barnCap()}`, stallSold ? `${stallSold} vente(s) à encaisser` : 'Réserves & coffre'],
            desc: 'Tes stocks, le coffre de la grange et l’encaissement rapide de ton étal.',
            bub: barnBub,
            art: () => `<div class="dom-art">${art('ui', 'barn')}</div>`,
        },
        {
            id: 'workshop',
            name: 'Ateliers',
            pos: [82, 42],
            w: 26,
            open: hasWorkshop,
            glow: true,
            go: 'machines/workshop',
            icon: ['machine', 'bakery'],
            tags: [`${state.machines.filter(m => m.type !== 'counter').length} machines`, doneMach.length ? `${doneMach.length} prête(s)` : busyMach ? 'En cours' : 'Au repos'],
            desc: 'Four, moulin, laiterie et ateliers de transformation. Une fumée s’élève tant qu’une machine tourne.',
            bub: workshopBub,
            art: () =>
                `<div class="dom-art dom-pair"><span class="main">${art('building', 'windmill')}</span><span class="side">${art('machine', 'bakery')}</span>${
                    busyMach || doneMach.length ? '<span class="dom-smoke"><i></i><i></i></span>' : ''
                }</div>`,
        },
        {
            id: 'counter',
            name: 'Comptoir',
            pos: [30, 56],
            w: 19,
            open: counterOpen,
            go: 'machines/counter',
            icon: ['machine', 'counter'],
            tags: [counterW ? `${counterW} client(s) attendent` : 'Salle calme'],
            desc: 'Sers tes clients au comptoir avec tes spécialités du jour.',
            bub: counterBub,
            art: () => `<div class="dom-art">${art('machine', 'counter')}</div>`,
        },
        {
            id: 'perfume',
            name: 'Parfumerie',
            pos: [69, 55],
            w: 20,
            open: pfOpen,
            glow: true,
            go: 'machines/perfume',
            icon: ['ui', 'perfume'],
            tags: ['Orgue du Parfumeur', G.perfumeCareCount() ? 'Soin d’étape prêt' : G.perfumeReadyCount() ? 'Flacon prêt' : 'Atelier calme'],
            desc: 'Compose tes parfums, applique tes soins de macération directement depuis la bulle et livre le Salon.',
            bub: pfBub,
            art: () => `<div class="dom-art">${art('machine', 'perfumery')}</div>`,
        },
        {
            id: 'cave',
            name: G.brewOpen() && G.caveOpen() ? 'Cave & Brasserie' : G.brewOpen() ? 'Brasserie' : 'Cave',
            pos: [85, 66],
            w: 23,
            open: caveOrBrew,
            go: brewVats.length || beerOrd > 0 || !G.caveOpen() ? 'machines/brew' : 'machines/cave',
            icon: ['ui', G.caveOpen() ? 'cave' : 'beer'],
            tags: [G.caveOpen() ? 'Cave d’affinage' : '', G.brewOpen() ? 'Brasserie d’abbaye' : ''].filter(Boolean),
            desc: 'Tes cuvées en vieillissement et tes brassins d’abbaye réunis au flanc du coteau.',
            bub: caveBub,
            art: () => `<div class="dom-art">${art('building', G.caveOpen() ? 'chai' : 'brewhall')}</div>`,
        },
        {
            id: 'fields',
            name: state.greenhouse && state.greenhouse.built ? 'Champs & Serre' : 'Champs',
            pos: [27, 72],
            w: 34,
            open: true,
            go: 'farm/field',
            icon: ['item', 'wheat'],
            tags: [readyPlots.length ? `${readyPlots.length} à récolter` : `${plots.length} parcelles`, dryPlots.length ? `${dryPlots.length} à arroser` : 'Bien arrosé'],
            desc: 'Tes vraies parcelles poussent ici en direct. Un tap sur la bulle récolte tout ce qui est mûr ou arrose le champ.',
            bub: fieldBub,
            art: () =>
                `<div class="dom-art"><div class="dom-fields">${samplePlots
                    .map(p => `<span class="dom-cell">${plotThumb(p)}</span>`)
                    .join('')}${state.greenhouse && state.greenhouse.built ? `<span class="dom-gh">${art('ui', 'greenhouse')}</span>` : ''}</div></div>`,
        },
        {
            id: 'orchard',
            name: 'Verger',
            pos: [64, 74],
            w: 27,
            open: orchardOpen,
            go: 'farm/orchard',
            icon: ['item', 'apple'],
            tags: [`${orchardTrees.length} arbre(s)`, orchardFruit ? `${orchardFruit} fruit(s) au sol` : 'Arbres paisibles'],
            desc: 'Tes arbres fruitiers et ruches. Touche la bulle pour ramasser tous les fruits tombés au sol.',
            bub: orchardBub,
            art: () => {
                const t1 = orchardTrees[0] ? art('plant', `${orchardTrees[0].tree.id}:3`) : art('plant', 'apple:3');
                const t2 = orchardTrees[1] ? art('plant', `${orchardTrees[1].tree.id}:3`) : art('plant', 'cherry:3');
                const hasBees = state.animals.some(a => a.type === 'bees');
                return `<div class="dom-art dom-orchard"><span class="t1">${t1}</span><span class="t2">${t2}</span>${hasBees ? `<span class="hive">${art('animal', 'bees')}</span>` : ''}</div>`;
            },
        },
        {
            id: 'pasture',
            name: G.harasOpen() ? 'Prés & Haras' : 'Prés',
            pos: [30, 89],
            w: 33,
            open: pastureOpen,
            go: 'animals/pasture',
            icon: ['animal', 'cow'],
            tags: [`${state.animals.length} animal(aux)`, animProd ? `${animProd} produit(s) prêt(s)` : hungry ? `${hungry} ont faim` : 'Repus'],
            desc: 'Ramasse lait, œufs et laine ou nourris tes animaux en un seul tap.',
            bub: pastureBub,
            art: () => {
                const list = sampleAn.length ? sampleAn.map(a => `<span class="an">${art('animal', a.type)}</span>`).join('') : `<span class="an">${art('animal', 'chicken')}</span>`;
                return `<div class="dom-art dom-pasture">${G.harasOpen() ? `<span class="stud">${art('building', 'stud')}</span>` : ''}${list}</div>`;
            },
        },
        {
            id: 'pond',
            name: G.pondOpen() ? 'Étang & Forêt' : 'Forêt',
            pos: [76, 89],
            w: 25,
            open: natureOpen,
            go: trapsN > 0 ? 'farm/pond' : 'farm/nature',
            icon: ['ui', G.pondOpen() ? 'rod' : 'axe'],
            tags: [G.pondOpen() ? 'Pêche ouverte' : 'Forêt & bois', lumberReady + minerReady ? `${lumberReady + minerReady} charge(s) prête(s)` : 'Tranquille'],
            desc: 'Récupère les charges du bûcheron et du mineur en 1 tap ou pars pêcher à l’étang.',
            bub: pondBub,
            art: () => `<div class="dom-art">${art('building', 'pontoon')}</div>`,
        },
    ];
}

// ---------------- décor SVG ancré (saisons, nuit, bois sauvages) ----------------
function bgSvg(zones) {
    const W = 420;
    const H = 790;
    const skyH = 110;
    const O = '#3a2618';
    const winter = G.season().id === 'hiver';
    const pathStyle = domPrefs().path || 'sand';

    const wildWoods = zones
        .filter(z => !z.open)
        .map(z => {
            const cx = (z.pos[0] / 100) * W;
            const cy = (z.pos[1] / 100) * H;
            return `<g>
                <ellipse cx="${cx}" cy="${cy + 18}" rx="28" ry="6" fill="rgba(58,38,24,.15)"/>
                <rect x="${cx - 16}" y="${cy + 1}" width="7" height="16" rx="2" fill="#8b5a32" stroke="${O}" stroke-width="2"/>
                <circle cx="${cx - 12}" cy="${cy - 7}" r="14" fill="var(--dom-tree1)" stroke="${O}" stroke-width="2.2"/>
                <rect x="${cx + 7}" y="${cy + 3}" width="7" height="14" rx="2" fill="#8b5a32" stroke="${O}" stroke-width="2"/>
                <circle cx="${cx + 11}" cy="${cy - 4}" r="13" fill="var(--dom-tree2)" stroke="${O}" stroke-width="2.2"/>
                <circle cx="${cx}" cy="${cy - 12}" r="12" fill="var(--dom-tree1)" stroke="${O}" stroke-width="2.2"/>
            </g>`;
        })
        .join('');

    const cobble =
        pathStyle === 'cobble'
            ? `<g stroke="rgba(58,38,24,.26)" stroke-width="2.5" stroke-dasharray="2 9" stroke-linecap="round" fill="none">
                <path d="M${W * 0.52} ${skyH + 14} Q${W * 0.48} ${H * 0.34} ${W * 0.5} ${H * 0.48} Q${W * 0.5} ${H * 0.63} ${W * 0.47} ${H * 0.77}"/>
                <path d="M${W * 0.21} ${H * 0.46} Q${W * 0.48} ${H * 0.5} ${W * 0.8} ${H * 0.46}"/>
              </g>`
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
        <rect width="${W}" height="${skyH + 40}" fill="url(#domSky)"/>
        <path d="M0 ${skyH - 8} Q${W * 0.24} ${skyH - 42} ${W * 0.52} ${skyH - 12} T${W} ${skyH - 20} L${W} ${H} L0 ${H}Z" fill="var(--dom-h1)"/>
        <path d="M0 ${skyH + 16} Q${W * 0.32} ${skyH - 18} ${W * 0.64} ${skyH + 10} T${W} ${skyH - 2} L${W} ${H} L0 ${H}Z" fill="var(--dom-h2)"/>
        <path d="M0 ${skyH + 34} Q${W * 0.48} ${skyH + 16} ${W} ${skyH + 30} L${W} ${H} L0 ${H}Z" fill="url(#domMeadow)"/>
        <path d="M${W * 0.66} ${skyH + 8} Q${W * 0.78} ${skyH + 38} ${W} ${skyH + 54} L${W} ${skyH - 6} Q${W * 0.84} ${skyH - 4} ${W * 0.66} ${skyH + 8}Z" fill="var(--dom-water1)" stroke="${O}" stroke-width="2"/>
        <path d="M${W * 0.92} ${skyH + 46} Q${W * 0.97} ${H * 0.54} ${W * 0.9} ${H * 0.74} Q${W * 0.85} ${H * 0.84} ${W * 0.76} ${H * 0.89}" fill="none" stroke="var(--dom-water1)" stroke-width="13" stroke-linecap="round"/>
        <ellipse cx="${W * 0.76}" cy="${H * 0.9}" rx="54" ry="24" fill="var(--dom-water1)" stroke="${O}" stroke-width="2.2"/>
        <ellipse cx="${W * 0.76}" cy="${H * 0.895}" rx="40" ry="14" fill="var(--dom-water2)" opacity=".55"/>
        <path d="M0 ${skyH + 10} Q${W * 0.18} ${skyH + 22} ${W * 0.39} ${skyH + 6}" fill="none" stroke="#8b6a4a" stroke-width="7" stroke-dasharray="3 5"/>
        <path d="M0 ${skyH + 8} Q${W * 0.18} ${skyH + 20} ${W * 0.39} ${skyH + 4} M0 ${skyH + 12} Q${W * 0.18} ${skyH + 24} ${W * 0.39} ${skyH + 8}" fill="none" stroke="#5d5248" stroke-width="1.6"/>
        <g fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="M${W * 0.52} ${skyH + 8} Q${W * 0.48} ${H * 0.34} ${W * 0.5} ${H * 0.48} Q${W * 0.5} ${H * 0.63} ${W * 0.47} ${H * 0.77} M${W * 0.19} ${H * 0.46} Q${W * 0.48} ${H * 0.5} ${W * 0.82} ${H * 0.46} M${W * 0.5} ${H * 0.58} Q${W * 0.34} ${H * 0.66} ${W * 0.28} ${H * 0.73} M${W * 0.5} ${H * 0.6} Q${W * 0.68} ${H * 0.67} ${W * 0.76} ${H * 0.74}" stroke="var(--dom-path-e)" stroke-width="24"/>
            <path d="M${W * 0.52} ${skyH + 8} Q${W * 0.48} ${H * 0.34} ${W * 0.5} ${H * 0.48} Q${W * 0.5} ${H * 0.63} ${W * 0.47} ${H * 0.77} M${W * 0.19} ${H * 0.46} Q${W * 0.48} ${H * 0.5} ${W * 0.82} ${H * 0.46} M${W * 0.5} ${H * 0.58} Q${W * 0.34} ${H * 0.66} ${W * 0.28} ${H * 0.73} M${W * 0.5} ${H * 0.6} Q${W * 0.68} ${H * 0.67} ${W * 0.76} ${H * 0.74}" stroke="var(--dom-path)" stroke-width="17"/>
        </g>
        ${cobble}
        <g stroke="#8b5a32" stroke-width="2.6" stroke-linecap="round">
            <path d="M${W * 0.26} ${H * 0.34} H${W * 0.42} M${W * 0.58} ${H * 0.34} H${W * 0.74}"/>
            <path d="M${W * 0.28} ${H * 0.325} V${H * 0.355} M${W * 0.35} ${H * 0.325} V${H * 0.355} M${W * 0.41} ${H * 0.325} V${H * 0.355}"/>
            <path d="M${W * 0.59} ${H * 0.325} V${H * 0.355} M${W * 0.66} ${H * 0.325} V${H * 0.355} M${W * 0.73} ${H * 0.325} V${H * 0.355}"/>
        </g>
        <g stroke="${O}" stroke-width="2">
            <circle cx="${W * 0.03}" cy="${H * 0.31}" r="18" fill="var(--dom-tree1)"/>
            <circle cx="${W * 0.07}" cy="${H * 0.34}" r="13" fill="var(--dom-tree2)"/>
            <circle cx="${W * 0.97}" cy="${H * 0.35}" r="17" fill="var(--dom-tree1)"/>
            <circle cx="${W * 0.93}" cy="${H * 0.38}" r="12" fill="var(--dom-tree2)"/>
            <circle cx="${W * 0.04}" cy="${H * 0.6}" r="16" fill="var(--dom-tree1)"/>
            <circle cx="${W * 0.97}" cy="${H * 0.55}" r="15" fill="var(--dom-tree2)"/>
            <circle cx="${W * 0.04}" cy="${H * 0.95}" r="18" fill="var(--dom-tree1)"/>
            <circle cx="${W * 0.96}" cy="${H * 0.95}" r="18" fill="var(--dom-tree1)"/>
        </g>
        <g opacity="${winter ? 0 : 0.9}">
            <circle cx="${W * 0.37}" cy="${H * 0.31}" r="2.8" fill="#fff7c2" stroke="${O}" stroke-width="1"/>
            <circle cx="${W * 0.4}" cy="${H * 0.325}" r="2.4" fill="#f59ab1" stroke="${O}" stroke-width="1"/>
            <circle cx="${W * 0.63}" cy="${H * 0.315}" r="2.6" fill="#fff7c2" stroke="${O}" stroke-width="1"/>
            <circle cx="${W * 0.14}" cy="${H * 0.54}" r="2.7" fill="#ffd23f" stroke="${O}" stroke-width="1"/>
        </g>
        ${wildWoods}
    </svg>`;
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
    if (kind === 'stallCollect') {
        G.collectAllStall(at);
        return true;
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
    return `<div class="dom-pop" style="left:clamp(124px,69%,calc(100% - 124px));top:calc(55% - 32px)">
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

    // Barre Tournée rapide + outils (Focus / Décorer / Carte postale)
    const chips = [];
    if (state.dog && state.dog.owned && state.dog.found) {
        chips.push(`<button class="dom-chip urgent" data-act="domDog">${ico(['ui', 'dog'])}<span>${esc(state.dog.name)}</span></button>`);
    }
    for (const z of active) {
        chips.push(
            `<button class="dom-chip${z.bub.urgent ? ' urgent' : ''}" data-act="domFocus" data-id="${z.id}">${ico(z.bub.icon)}<span>${esc(z.name)}</span></button>`,
        );
    }

    const tourInner =
        chips.length === 0
            ? `<div class="dom-calm-msg">${ico(['ui', 'w_sun'])}<span>Tout est calme sur le domaine</span></div>`
            : (directCount >= 2
                  ? `<button class="btn sm green" data-act="domAll">${ico(['ui', 'sparkle'])}<span>Tout faire (${directCount})</span></button>`
                  : '') + chips.join('');

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
                <div class="dom-deco-note">Touche un cercle « + » ou une déco sur le domaine pour placer tes trophées.</div>
            </div>`
            : '';

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
                  }>${ico(b.icon)}<span>${esc(b.label)}</span></span>`
                : '';
            return `<div class="dom-spot${b ? ' has-bub' : ''}" id="dom-spot-${z.id}" data-act="domZone" data-id="${z.id}" style="left:${z.pos[0]}%;top:${z.pos[1]}%;width:${z.w}%" role="button" tabindex="0" aria-label="${esc(z.name)}">
                ${z.glow ? '<span class="dom-glow"></span>' : ''}
                ${bubHtml}
                ${z.art()}
                <span class="dom-name">${esc(z.name)}</span>
            </div>`;
        })
        .join('');

    const [dx, dy] = DOG_WAYPOINTS[local.dogStep % DOG_WAYPOINTS.length];
    const dogHtml =
        state.dog && state.dog.owned
            ? `<button class="dom-dog" data-act="domDog" style="left:${dx}%;top:${dy}%" aria-label="${esc(state.dog.name)}">
                ${state.dog.found ? `<span class="dom-dog-bub">${ico(['ui', 'coin'])}<span>Trésor !</span></span>` : ''}
                ${ico(['ui', 'dog'])}
            </button>`
            : '';

    const planeHtml = G.cargoHere(now()) ? `<div class="dom-plane">${ico(['ui', 'plane'])}</div>` : '';
    const fireflies = Array.from({ length: 10 }, (_, i) => {
        const l = 10 + ((i * 23) % 82);
        const top = 26 + ((i * 19) % 66);
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

    const exitPc = local.postcard
        ? `<button class="btn gold sm dom-exit-pc" data-act="domPostcard">${ico(['ui', 'camera'])}<span>Réafficher</span></button>`
        : '';

    const sceneHtml = `<div class="${sceneCls}">
        ${bgSvg(zones)}
        ${planeHtml}
        ${decosHtml}
        ${spotsHtml}
        ${dogHtml}
        ${perfumePopHtml()}
        <div class="dom-night-veil"></div>
        <div class="dom-fireflies">${fireflies}</div>
        ${exitPc}
    </div>`;

    blocks(el, [['dom', `<div class="dom-wrap">${topHtml}${decoBarHtml}${sceneHtml}</div>`]]);
}

defineView('domaine', renderDomaine);

// ---------------- fiches bâtiment & choix déco ----------------
defineSheet('domZone', {
    title: o => {
        const z = buildZones().find(x => x.id === o.id);
        return z ? z.name : 'Domaine';
    },
    render(o) {
        const z = buildZones().find(x => x.id === o.id);
        if (!z) return '<p class="empty">Zone introuvable.</p>';
        const b = z.bub;
        const actBtn = b
            ? `<button class="btn green" data-act="${b.direct ? 'domSheetAct' : 'domSheetGo'}"${
                  b.direct ? ` data-kind="${b.direct}"` : ` data-path="${b.open}"`
              }>${ico(b.icon)}<span>${esc(b.label)} maintenant</span></button>`
            : '';
        return `<div class="card">
            <div class="dom-sheet-tags">${(z.tags || []).map(t => `<span class="dom-sheet-tag">${esc(t)}</span>`).join('')}</div>
            <p class="card-sub">${esc(z.desc)}</p>
            <div class="row" style="gap:8px;margin-top:10px">
                ${actBtn}
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
            <p class="card-sub">Pose librement une décoration sur ton domaine (pure mise en scène, modifiable à tout moment).</p>
            <div class="dom-deco-grid">
                ${DOM_DECOS.map(
                    d => `<button class="dom-deco-opt${cur === d.id ? ' on' : ''}" data-act="domDecoPick" data-i="${i}" data-id="${d.id}">
                        ${ico(d.icon)}<span>${esc(d.name)}</span>
                    </button>`,
                ).join('')}
            </div>
        </div>`;
    },
});

// ---------------- initialisation des gestes ----------------
export function setupDomaine() {
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
            const sp = document.getElementById('dom-spot-' + d.id);
            if (!sp) return;
            sp.scrollIntoView({ behavior: 'smooth', block: 'center' });
            sp.classList.remove('spotlight');
            void sp.offsetWidth;
            sp.classList.add('spotlight');
            setTimeout(() => sp.classList.remove('spotlight'), 1900);
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
            domPrefs().decos[+d.i] = d.id;
            closeSheet('domDeco');
            emit('sfx', 'plant');
        },
        domDog: el => {
            if (!state.dog || !state.dog.owned) return;
            G.handleDog(centerOf(el));
            local.dogStep = (local.dogStep + 1) % DOG_WAYPOINTS.length;
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
