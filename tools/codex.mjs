// Génère le Codex interactif autonome de Meuh (sprites, produits par usine, génétique + haras, brasserie d'abbaye).
// Aucune dépendance externe : utilise uniquement Node.js natif (ESM + zlib).
// Usage : node tools/codex.mjs [--out chemin/vers/codex.html]
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

import { SPR } from '../src/art/index.js';
import { BLD } from '../src/art/kit.js';
import { gear } from '../src/art/haras/ecuries.js';
import { ITEMS } from '../src/data/items.js';
import { RECIPES, MACHINES } from '../src/data/machines.js';
import { ANIMALS } from '../src/data/animals.js';
import { FISH } from '../src/data/meta.js';
import { SPOTS } from '../src/data/fishing.js';
import { VILLAGERS } from '../src/data/village.js';
import { HONEYS, HONEY_COL } from '../src/data/honey.js';
import { CAVE_ITEMS, CAVE_FAMILIES } from '../src/data/cave.js';
import { PACKS } from '../src/data/paquets.js';
import { FIRST_NAMES, ORIGINS, PROFILES } from '../src/data/camping.js';
import { TRAITS, TRAIT_COUNT, TRAIT_NAMES, TRAIT_LABELS, SKINS, HAIRS, EYES, SHIRTS } from '../src/art/habitants.js';
import { LOOKS, FEATURES, featuresOf, FLAVORS, PLANT_TRAITS, ANIMAL_TRAITS } from '../src/data/genetics.js';
import { COAT } from '../src/data/haras.js';
import {
    ABBEY,
    MALTS,
    MALT_IDS,
    HOP_DOSES,
    NOTES,
    NOTE_COL,
    PAIRS,
    CLASSICS,
    BARRELS,
    CELLAR,
    MEAD,
    MEAD_BASES,
    MEAD_CLASSICS,
} from '../src/data/abbey.js';
import {
    PERFUME,
    FACETS,
    FACET_COL,
    PERFUME_PAIRS,
    METHODS,
    METHOD_IDS,
    CONCENTRATIONS,
    CONC_IDS,
    STAGES,
    PERFUME_TOUCHES,
    FAMILIES,
    FAMILY_IDS,
    PERFUME_NOTES,
    HEAD_NOTES,
    HEART_NOTES,
    BASE_NOTES,
    PERFUME_CLASSICS,
    BOTTLES,
    BOTTLE_IDS,
    CAPS,
    CAP_IDS,
} from '../src/data/perfume.js';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const version = fs.readFileSync(path.join(root, 'VERSION'), 'utf8').trim();
const strip = s => s.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');

// 1. Extraction des sprites SVG (innerHTML de chaque <svg> pour minimiser la taille)
const peopleIds = [...new Set([...Object.keys(SPR.has.people), ...Object.keys(VILLAGERS)])];
const people = {};
for (const id of peopleIds) {
    try {
        people[id] = strip(SPR.villager(id));
    } catch {
        // ignore invalid synthetic keys
    }
}

const plants = {};
for (const it of Object.values(ITEMS)) {
    if (it.type === 'crop') {
        plants[it.id] = [strip(SPR.plant(it.id, 1)), strip(SPR.plant(it.id, 2))];
    } else if (it.type === 'tree') {
        plants[it.id] = [strip(SPR.plant(it.id, 0)), strip(SPR.plant(it.id, 1)), strip(SPR.plant(it.id, 2))];
    }
}

// Toutes les combinaisons de traits morphologiques (cornes, oreilles, plumage, essaim, toison)
const animVars = {};
const speciesFeatures = {};
for (const a of Object.values(ANIMALS)) {
    const fsList = featuresOf(a.id);
    speciesFeatures[a.id] = fsList;
    if (!fsList.length) continue;
    const dims = fsList.map(f => FEATURES[f].list.length);
    const combos = [];
    const walk = (idx, cur) => {
        if (idx === dims.length) {
            combos.push(cur);
            return;
        }
        for (let v = 0; v < dims[idx]; v++) walk(idx + 1, cur + v);
    };
    walk(0, '');
    for (const c of combos) {
        if (/^0*$/.test(c)) continue;
        animVars[`${a.id}~${c}`] = strip(SPR.animal(`${a.id}~${c}`));
    }
}

const sprites = {
    items: Object.fromEntries(Object.keys(SPR.has.items).map(k => [k, strip(SPR.item(k))])),
    machines: Object.fromEntries(Object.keys(SPR.has.machines).map(k => [k, strip(SPR.machine(k))])),
    ui: Object.fromEntries(Object.keys(SPR.has.ui).map(k => [k, strip(SPR.ui(k))])),
    animals: Object.fromEntries(Object.keys(SPR.has.animals).map(k => [k, strip(SPR.animal(k))])),
    animVars,
    people,
    buildings: Object.fromEntries(Object.keys(BLD).map(k => [k, strip(SPR.building(k, false))])),
    farmhouses: [0, 1, 2, 3, 4, 5, 6].map(l => strip(SPR.farmhouse(l))),
    vehicles: {
        truck: SPR.truck(),
        loco: SPR.loco(),
        wagon: SPR.wagon('#d9534f'),
        balloon: SPR.balloon(),
    },
    sprout: strip(SPR.plant('wheat', 0)),
    plants,
    gear,
};

// 2. Données du jeu
const BREW_EXTRA = {
    caramel: [3, 0, 2, 0, 1],
    sugar: [5, 0, 0, 0, 0],
    brownSugar: [4, 0, 1, 0, 1],
    darkChoc: [1, 0, 5, 0, 1],
    coffee: [0, 1, 5, 0, 1],
    cider: [2, 4, 0, 0, 0],
    espelettePowder: [0, 0, 0, 5, 1],
};
const BREWABLE = Object.values(ITEMS)
    .filter(i => (i.type === 'crop' || i.type === 'tree') && FLAVORS[i.id] && i.id !== 'hop')
    .map(i => i.id);

const data = {
    version,
    items: Object.fromEntries(
        Object.values(ITEMS).map(i => [
            i.id,
            {
                id: i.id,
                name: i.name,
                ...(i.seedName ? { seedName: i.seedName } : {}),
                type: i.type,
                ...(i.sell != null ? { sell: i.sell } : {}),
                ...(i.cost != null ? { cost: i.cost } : {}),
                ...(i.time != null ? { time: i.time } : {}),
                ...(i.reqLvl != null ? { reqLvl: i.reqLvl } : {}),
                ...(i.seasons ? { seasons: i.seasons } : {}),
                ...(i.island ? { island: true } : {}),
                ...(i.oasis ? { oasis: true } : {}),
                ...(i.nord ? { nord: true } : {}),
                ...(i.asie ? { asie: true } : {}),
                ...(i.ghOnly ? { ghOnly: true } : {}),
                ...(i.sea ? { sea: true } : {}),
                ...(i.exotic ? { exotic: true } : {}),
                ...(i.box ? { box: true } : {}),
                ...(i.needProject ? { needProject: i.needProject } : {}),
            },
        ]),
    ),
    machines: Object.fromEntries(
        Object.values(MACHINES).map(m => [
            m.id,
            { id: m.id, name: m.name, reqLvl: m.reqLvl || 1, ...(m.needProject ? { needProject: m.needProject } : {}) },
        ]),
    ),
    recipes: Object.fromEntries(
        Object.values(RECIPES).map(r => [
            r.id,
            { id: r.id, machine: r.machine, lvl: r.lvl || 1, time: r.time || 0, ing: r.ing, ...(r.out ? { out: r.out } : {}) },
        ]),
    ),
    animals: Object.fromEntries(
        Object.values(ANIMALS).map(a => [
            a.id,
            {
                id: a.id,
                name: a.name,
                prodId: a.prodId,
                ...(a.extra ? { extra: a.extra } : {}),
                reqLvl: a.reqLvl || 1,
                ...(a.oasis ? { oasis: true } : {}),
                ...(a.nord ? { nord: true } : {}),
                ...(a.asie ? { asie: true } : {}),
            },
        ]),
    ),
    fish: Object.fromEntries(Object.entries(FISH).map(([k, f]) => [k, { spots: f.spots || null, junk: !!f.junk }])),
    spots: Object.fromEntries(Object.entries(SPOTS).map(([k, s]) => [k, s.name])),
    villagers: Object.fromEntries(Object.entries(VILLAGERS).map(([k, v]) => [k, v.name])),
    honeys: HONEYS,
    honeyCol: HONEY_COL,
    cave: {
        items: CAVE_ITEMS,
        families: Object.fromEntries(Object.entries(CAVE_FAMILIES).map(([k, v]) => [k, v.name])),
    },
    packs: PACKS.map(p => ({ id: p.id, name: p.name, bonus: p.bonus, blurb: p.blurb, fits: p.fits, item: p.item })),
    genetics: {
        looks: LOOKS,
        features: FEATURES,
        speciesFeatures,
        flavors: FLAVORS,
        plantTraits: PLANT_TRAITS.map(t => ({ id: t.id, name: t.name, flavor: !!t.flavor, extra: !!t.extra, hint: t.hint || '' })),
        animalTraits: ANIMAL_TRAITS.map(t => ({ id: t.id, name: t.name, flavor: !!t.flavor, extra: !!t.extra, hint: t.hint || '' })),
    },
    haras: { coat: COAT },
    abbey: {
        abbey: ABBEY,
        malts: MALTS,
        maltIds: MALT_IDS,
        hopDoses: HOP_DOSES,
        notes: NOTES,
        noteCol: NOTE_COL,
        pairs: PAIRS,
        classics: CLASSICS,
        barrels: BARRELS,
        cellar: CELLAR,
        mead: MEAD,
        meadBases: MEAD_BASES,
        meadClassics: MEAD_CLASSICS,
        brewable: BREWABLE,
        brewExtra: BREW_EXTRA,
    },
    perfume: {
        cfg: PERFUME,
        facets: FACETS,
        facetCol: FACET_COL,
        pairs: PERFUME_PAIRS,
        methods: METHODS,
        methodIds: METHOD_IDS,
        concs: CONCENTRATIONS,
        concIds: CONC_IDS,
        stages: STAGES,
        touches: PERFUME_TOUCHES,
        families: FAMILIES,
        familyIds: FAMILY_IDS,
        notes: PERFUME_NOTES,
        head: HEAD_NOTES,
        heart: HEART_NOTES,
        base: BASE_NOTES,
        classics: PERFUME_CLASSICS,
        bottles: BOTTLES,
        bottleIds: BOTTLE_IDS,
        caps: CAPS,
        capIds: CAP_IDS,
    },
    camping: {
        names: FIRST_NAMES,
        origins: ORIGINS,
        profiles: Object.values(PROFILES).map(p => p.name),
    },
    hab: {
        traits: TRAITS,
        count: TRAIT_COUNT,
        names: TRAIT_NAMES,
        labels: TRAIT_LABELS,
        skins: SKINS,
        hairs: HAIRS,
        eyes: EYES,
        shirts: SHIRTS,
    },
};

const raw = JSON.stringify({ sprites, data });
const gzB64 = zlib.gzipSync(raw, { level: 9 }).toString('base64');

const tplPath = path.join(root, 'tools/codex.template.html');
const tpl = fs.readFileSync(tplPath, 'utf8');
const html = tpl.replace('__VERSION__', () => version).replace('__DATA_GZ__', () => gzB64);

const outIdx = process.argv.indexOf('--out');
const publish = process.argv.includes('--publish');
const targets = outIdx > 0 ? [path.resolve(process.argv[outIdx + 1])] : [path.join(root, publish ? 'tools/codex.html' : 'dist/codex.html')];

for (const outPath of targets) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, html, 'utf8');
    console.log(`Codex généré : ${outPath} (${(html.length / 1024).toFixed(1)} ko, payload brut ${(raw.length / 1024).toFixed(0)} ko)`);
}
