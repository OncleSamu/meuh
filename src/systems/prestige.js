// Le prestige : vendre la ferme, rubans et défis.
import { ensureOrchard } from './orchard.js';
import { ensurePastures } from './pastures.js';
import { ensureIsland } from './island.js';
import { ensureOasis } from './oasis.js';
import { ensureNord } from './nord.js';
import { ensureAsie } from './asie.js';
import { ensureGenetics } from './genetics.js';
import { state, newState, setState, fillGrid } from '../core/state.js';
import { now } from '../core/clock.js';
import { emit, toast, sfx, buzz } from '../core/bus.js';
import { PRESTIGE_LVL, CHALLENGE_BONUS } from '../data/progress.js';
import { ensureVillagers } from './village.js';
import { addPhoto } from './style.js';
import { ensureQuests } from './orders.js';
import { newChateau } from '../data/chateau.js';

export const rubansGain = () => Math.floor(Math.sqrt(state.stats.earnedRun / 25000));
export const canPrestige = () => state.level >= PRESTIGE_LVL && rubansGain() >= 1;
export const prestigeGain = () => rubansGain() + (state.challenge ? CHALLENGE_BONUS : 0);
export const challengeOn = id => state.challenge === id;

// challenge : le défi choisi pour la ferme suivante ; theme : son thème
export function doPrestige(challenge, theme) {
    const base = rubansGain();
    if (state.level < PRESTIGE_LVL || base < 1) return false;
    const won = state.challenge;
    const gain = base + (won ? CHALLENGE_BONUS : 0);
    const keep = {
        prestige: { rubans: state.prestige.rubans + gain },
        collection: state.collection,
        pagesDone: state.pagesDone,
        income: state.income,
        dayEarn: state.dayEarn,
        sold: state.sold,
        challengesDone: won ? { ...state.challengesDone, [won]: true } : state.challengesDone,
        challenge: challenge || null,
        achievements: state.achievements,
        settings: state.settings,
        daily: state.daily,
        villagers: state.villagers,
        stats: { ...state.stats, prestiges: state.stats.prestiges + 1, earnedRun: 0, maxPlots: state.stats.maxPlots },
        dog: state.dog,
        tutorial: { step: 0, done: true },
        decorInv: (() => {
            const inv = { ...state.decorInv };
            state.grid.forEach(p => {
                if (p.deco) inv[p.deco] = (inv[p.deco] || 0) + 1;
            });
            return inv;
        })(),
        // le village rénové et la grange restent acquis
        projects: state.projects,
        // la génétique garde ses créations, ses variétés et leurs graines ; produits, bêtes, chef et catalogue partent avec la ferme
        genetics: state.genetics ? { ...state.genetics, stock: {}, q: {}, crosses: [], breeds: [], litters: [], chef: null, cat: null } : null,
        // la brasserie garde ses recettes et son livre ; bouteilles, cuves, fûts et commandes partent avec la ferme
        brew: state.brew ? { ...state.brew, stock: {}, q: {}, vats: [], barrels: [], orders: [], demand: {} } : null,
        // 1.143 : la parfumerie garde ses créations, son Orgue et sa signature ; flacons, dame-jeannes et commandes partent avec la ferme
        perfume: state.perfume ? { ...state.perfume, stock: {}, q: {}, vats: [], orders: [], demand: {} } : null,
        // 1.178 : la confiserie garde ses créations et son Grimoire ; stock, chaudrons et commandes partent avec la ferme
        confiserie: state.confiserie ? { ...state.confiserie, stock: {}, q: {}, kettles: [], orders: [], demand: {} } : null,
        // 1.179 : le Comice garde son palmarès, ses paliers, ses cocardes et ses élixirs ; les épreuves en cours repartent avec la ferme
        comice: state.comice
            ? {
                  wins: state.comice.wins || {},
                  cocardes: state.comice.cocardes || 0,
                  palmClaimed: state.comice.palmClaimed || {},
                  elixirs: state.comice.elixirs || 0,
                  goldHayUntil: 0,
                  cats: [],
              }
            : null,
        // 1.180 : les Concours hippiques gardent palmarès, victoires, rosettes, éperons et élixirs ; les épreuves en cours repartent
        show: state.show
            ? {
                  rose: (state.show.rose || [0, 0, 0, 0, 0]).slice(),
                  cups: state.show.cups || 0,
                  wins: state.show.wins || 0,
                  titles: {},
                  div: 0,
                  entries: [],
                  gp: null,
                  last: null,
                  lastAll: null,
                  gpDone: state.show.gpDone || 0,
                  spurs: state.show.spurs || 0,
                  palmClaimed: state.show.palmClaimed || {},
                  goldOatsUntil: 0,
                  elixirs: state.show.elixirs || 0,
                  preps: {},
                  express: [],
                  deco1: !!state.show.deco1,
                  deco2: !!state.show.deco2,
                  deco3: !!state.show.deco3,
                  deco4: !!state.show.deco4,
              }
            : null,
        // 1.181 : le Refuge garde niveau, carnet de la faune, cœurs, palmarès et baumes d'élevage ; patients & paniers repartent
        refuge: state.refuge
            ? {
                  lvl: state.refuge.lvl || 1,
                  hearts: state.refuge.hearts || 0,
                  healed: state.refuge.healed || 0,
                  released: state.refuge.released || 0,
                  adopted: state.refuge.adopted || 0,
                  seen: state.refuge.seen || {},
                  palmClaimed: state.refuge.palmClaimed || {},
                  breedBalms: state.refuge.breedBalms || 0,
                  vitalityUntil: 0,
                  patients: [],
                  baskets: [],
                  nextAt: 0,
                  nextBasketAt: 0,
                  uid: state.refuge.uid || 1,
              }
            : null,
        // les grands défis gardent leurs trophées ; le défi en cours, le mini-défi et l'offre sont mis de côté
        defis: state.defis ? { ...state.defis, cur: null, mini: null, offer: null } : null,
        night: state.night,
        // les chapitres gardés à la conversion 1.4 ne survivent pas à une nouvelle ferme
        story: { ...state.story, keep: {} },
        barn: state.barn,
        farmhand: state.farmhand,
        team: state.team
            ? {
                  lina: { ...state.team.lina, t: 0 },
                  henri: { ...state.team.henri, t: 0, rules: (state.team.henri.rules || []).map(r => ({ ...r })) },
                  milo: { ...state.team.milo, t: 0, fg: 0 },
              }
            : null,
        mastery: state.mastery,
        renown: state.renown,
        cup: state.cup, // 1.40 : la Coupe de la vallée (points, rangs, mécénat) se garde
        league: state.league,
        legend: state.legend,
        style: state.style,
        album: state.album,
        stories: state.stories,
        fseason: state.fseason,
        fseasonLog: state.fseasonLog,
        records: state.records,
        bookQuarters: state.bookQuarters,
        bookTiers: state.bookTiers,
        qmade: state.qmade,
        duos: state.duos,
        herdbook: state.herdbook,
        me: state.me,
        family: state.family,
        tcg: state.tcg,
        museum: state.museum,
        mineDeep: state.mineDeep ? { ...state.mineDeep, floor: 1, grid: null, sonarUsed: false } : null,
        holiday: state.holiday,
        farmTheme: theme || 'none',
        // la cave garde ses étagères, son équipement, sa cote, son palmarès et ses trophées ; les lots partent avec la ferme
        cave: {
            ...newState().cave,
            shelves: state.cave.shelves,
            gear: state.cave.gear,
            cote: state.cave.cote,
            uid: state.cave.uid,
            legends: state.cave.legends || {},
            mill: state.cave.mill || null,
            seen: state.cave.seen || {},
        },
        // le château garde sa réputation, ses classements et ses médailles ; visiteurs et primeurs repartent avec la ferme
        chateau: {
            ...newChateau(),
            rep: (state.chateau || {}).rep || 0,
            classes: (state.chateau && state.chateau.classes) || newChateau().classes,
            medals: (state.chateau && state.chateau.medals) || newChateau().medals,
        },
        // le coffre garde sa taille ; ce qu'il contient part avec la ferme
        vault: { lvl: (state.vault && state.vault.lvl) || 0, slots: [] },
        contest: state.contest,
        lastContest: state.lastContest,
        contestHist: state.contestHist,
        day: state.day,
        weather: state.weather,
        nextWeather: state.nextWeather,
    };
    setState({ ...newState(), ...keep });
    fillGrid();
    ensurePastures();
    ensureOrchard();
    ensureIsland();
    ensureOasis();
    ensureNord();
    ensureAsie();
    ensureGenetics();
    state.truck.arriveAt = now() + 60000;
    ensureVillagers();
    addPhoto('ui', 'ribbon', 'Une nouvelle ferme', `${state.prestige.rubans} rubans en poche`);
    ensureQuests();
    sfx('level');
    buzz(60);
    emit('reset', 'prestige');
    toast(`Nouvelle ferme ! Vous gardez ${state.prestige.rubans} ruban${state.prestige.rubans > 1 ? 's' : ''}`, ['ui', 'ribbon']);
    return true;
}

export function abandonChallenge() {
    state.challenge = null;
    toast('Défi abandonné : la ferme reprend ses règles normales', ['ui', 'flag']);
    return true;
}
