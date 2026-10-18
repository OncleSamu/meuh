// L'état de la partie : création, chargement, sauvegarde.
// La forme de l'état est celle de la 6.2 : les anciennes sauvegardes se rechargent telles quelles.
import { ITEMS } from '../data/items.js';
import { GRID } from '../data/farm.js';
import { now } from './clock.js';

export const SAVE_KEY = 'meuhSave';
export const BACKUP_KEY = SAVE_KEY + '_secours';
export const SAVE_VERSION = 2;

export function newState() {
    const inventory = {};
    const seeds = {};
    for (const i of Object.values(ITEMS)) {
        inventory[i.id] = 0;
        if (i.type === 'crop' || i.type === 'tree') seeds[i.id] = 0;
    }
    inventory.feed = 5;
    seeds.wheat = 6;
    return {
        version: SAVE_VERSION,
        lv14: true, // échelle des 50 niveaux
        lv18: true, // machines et recettes aux niveaux de la 1.8
        money: 100,
        xp: 0,
        level: 1,
        gameTimeMinutes: 480,
        lastSaved: now(),
        unlockedPlots: GRID.basePlots,
        selectedTool: 'hand',
        inventory,
        seeds,
        grid: [],
        animals: [],
        pastures: [],
        orchard: null,
        island: null,
        genetics: null,
        brew: null, // 1.6 : la brasserie de l'abbaye
        cargo: null, // 1.8 : l'avion-cargo
        defis: null,
        night: null,
        carnet: null,
        machines: [],
        quests: [],
        upgrades: { speed: 0, price: 0, yield: 0, feeder: 0, seeder: 0, harvester: 0 },
        tools: { axe: 0, pick: 0 },
        settings: {
            music: true,
            sfx: true,
            musicVol: 0.6,
            sfxVol: 0.8,
            haptics: true,
            autoReplant: false,
            confirmBuy: true,
            reserve: true,
            calm: false,
            remind: false,
            fireflies: true, // 1.9 : les lucioles la nuit (pur décor)
            textSize: 0,
            contrast: false,
            bigText: false,
            lastView: 'farm',
        },
        day: 1,
        weather: 'sun',
        nextWeather: 'cloudy',
        stats: {
            harvested: 0,
            golden: 0,
            earned: 0,
            earnedRun: 0,
            collected: 0,
            crafted: 0,
            orders: 0,
            trucks: 0,
            crows: 0,
            maxLevel: 1,
            maxPlots: GRID.basePlots,
            prestiges: 0,
            cooked: 0,
            hearts: 0,
            goldQ: 0,
            eventsDone: 0,
            contracts: 0,
            dogFinds: 0,
            honey: 0,
            pets: 0,
            fish: 0,
            chopped: 0,
            mined: 0,
            playSec: 0,
            wagons: 0,
            balloons: 0,
            projects: 0,
            incidents: 0,
            pests: 0,
            rares: 0,
            contestWins: 0,
            houseMax: 0,
            bestLeague: 0,
            handWork: 0,
        },
        villagers: {},
        greenhouse: { built: false, plots: [] },
        quality: {},
        market: { f: {}, hot: null, hotDay: 0 },
        event: null,
        trophies: {},
        egg: null,
        tutorial: { step: 0, done: false },
        skills: {},
        forest: [],
        mine: [],
        collection: {},
        pagesDone: {},
        challenge: null,
        challengesDone: {},
        income: { market: 0, stall: 0, orders: 0, trucks: 0, cave: 0 },
        dayEarn: {},
        sold: {},
        decorInv: {},
        dog: { owned: false, name: 'Biscotte', found: null, nextFind: 0, petDay: 0 },
        achievements: {},
        prestige: { rubans: 0 },
        truck: { status: 'away', arriveAt: 0, expiresAt: 0, slots: [], gold: 0, xp: 0 },
        balloon: { status: 'away', arriveAt: 0, expiresAt: 0, items: [], gold: 0, xp: 0, mats: [] },
        barn: { lvl: 0 },
        projects: {},
        story: { seen: {} },
        incident: null,
        nextIncident: 0,
        merchant: { status: 'away', arriveAt: 0, expiresAt: 0, stock: [] },
        contest: null,
        lastContest: null,
        tips: {},
        stall: { slots: [] },
        locked: {},
        neighbors: {},
        house: { lvl: 0 },
        farmhand: { lvl: 0, t: 0 },
        mastery: {},
        renown: 0,
        league: 0,
        legend: false,
        style: { fence: 'wood', path: 'grass', roof: 'auto', barn: '#c8453a', owned: {} },
        album: [],
        rare: { type: null, until: 0, next: 0, offers: [], dish: null, served: false },
        contract: null,
        stories: {},
        net: { until: 0 },
        boat: { status: 'idle', arriveAt: 0, expiresAt: 0, items: [], gold: 0, xp: 0, mats: [] },
        trans: { returnAt: 0 },
        fseason: null,
        farmTheme: 'none',
        cave: { slots: [], shelves: 0, gear: {}, temp: 50, hum: 50, climAt: 0, reserve: [], cote: 0, auction: null, lastSale: null, uid: 0 },
        holiday: null,
        records: {},
        bookQuarters: [],
        crow: null,
        daily: { last: '', streak: 0 },
    };
}

// l'état courant : les modules lisent `state` (liaison vivante) et le remplacent par setState
export let state = newState();
export const setState = s => (state = s);
// 1.4 : le jeu passe de 40 à 50 niveaux ; les gains et les tailles de commandes gardent l'échelle des 40 niveaux
// 1.4 : ce qu'une ancienne partie avait déjà débloqué reste ouvert (state.lvKeep, posé à la conversion)
export const lvOk = (d, lvl = d.reqLvl) => state.level >= (lvl || 1) || !!(state.lvKeep && state.lvKeep[d.id]);
export const scaleLvl = () => 1 + ((state.level - 1) * 39) / 49;

// champs remis à zéro à chaque chargement (états passagers)
const TRANSIENT_KEYS = ['crow', 'egg'];

// fusionne une sauvegarde avec une partie neuve : les champs inconnus prennent leur valeur par défaut
export function fromSave(parsed) {
    const base = newState();
    const s = { ...base };
    for (const [k, def] of Object.entries(base)) {
        if (TRANSIENT_KEYS.includes(k) || !(k in parsed)) continue;
        const v = parsed[k];
        if (Array.isArray(def)) s[k] = Array.isArray(v) ? v : def;
        else if (def && typeof def === 'object') s[k] = { ...def, ...(v && typeof v === 'object' ? v : {}) };
        else s[k] = v;
    }
    // les objets apparus depuis la sauvegarde (nouveaux produits, nouvelles graines) commencent à zéro
    for (const id of Object.keys(base.inventory)) if (typeof s.inventory[id] !== 'number') s.inventory[id] = 0;
    for (const id of Object.keys(base.seeds)) if (typeof s.seeds[id] !== 'number') s.seeds[id] = 0;
    s.version = SAVE_VERSION;
    // une sauvegarde d'avant la 1.4 est convertie aux 50 niveaux (normalizeState)
    if (!parsed.lv14) s.lv14 = false;
    if (!parsed.lv18) s.lv18 = false;
    return s;
}

export const createEmptyPlot = index => ({
    id: index,
    isUnlocked: index < GRID.basePlots,
    terrain: 'grass',
    itemId: null,
    growProgress: 0,
    isWatered: false,
    isReady: false,
});

export function fillGrid(s = state) {
    while (s.grid.length < GRID.maxPlots) s.grid.push(createEmptyPlot(s.grid.length));
    s.unlockedPlots = s.grid.filter(p => p.isUnlocked).length;
}

// ---------------- Sauvegarde ----------------
// le stockage est injecté : localStorage dans le navigateur, une mémoire dans les tests
let store = (() => {
    try {
        return globalThis.localStorage || null;
    } catch {
        return null; // navigation privée sans stockage
    }
})();
export const setStore = s => (store = s);
export const getStore = () => store;

export function readSave() {
    try {
        const raw = store && store.getItem(SAVE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function writeSave() {
    if (!store) return false;
    state.lastSaved = now();
    try {
        store.setItem(SAVE_KEY, JSON.stringify(state));
        return true;
    } catch {
        return false;
    }
}
