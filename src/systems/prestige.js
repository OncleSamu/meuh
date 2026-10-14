// Le prestige : vendre la ferme, rubans et défis.
import { ensureOrchard } from './orchard.js';
import { ensurePastures } from './pastures.js';
import { ensureIsland } from './island.js';
import { ensureGenetics } from './genetics.js';
import { state, newState, setState, fillGrid } from '../core/state.js';
import { now } from '../core/clock.js';
import { emit, toast, sfx, buzz } from '../core/bus.js';
import { PRESTIGE_LVL, CHALLENGE_BONUS } from '../data/progress.js';
import { ensureVillagers } from './village.js';
import { addPhoto } from './style.js';
import { ensureQuests } from './orders.js';

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
        // la génétique garde ses créations, ses variétés et leurs graines ; produits et bêtes partent avec la ferme
        genetics: state.genetics ? { ...state.genetics, stock: {}, cross: null, breed: null } : null,
        // la brasserie garde ses recettes et son livre ; les bouteilles, les cuves et les fûts partent avec la ferme
        brew: state.brew ? { ...state.brew, stock: {}, vats: [], barrels: [] } : null,
        // les grands défis gardent leurs trophées ; le défi en cours est mis de côté
        defis: state.defis ? { ...state.defis, cur: null } : null,
        night: state.night,
        carnet: state.carnet,
        // les chapitres gardés à la conversion 1.4 ne survivent pas à une nouvelle ferme
        story: { ...state.story, keep: {} },
        barn: state.barn,
        farmhand: state.farmhand,
        mastery: state.mastery,
        renown: state.renown,
        league: state.league,
        legend: state.legend,
        style: state.style,
        album: state.album,
        stories: state.stories,
        fseason: state.fseason,
        records: state.records,
        bookQuarters: state.bookQuarters,
        holiday: state.holiday,
        farmTheme: theme || 'none',
        // la cave garde ses étagères, son équipement, sa cote et ses trophées ; les lots partent avec la ferme
        cave: {
            ...newState().cave,
            shelves: state.cave.shelves,
            gear: state.cave.gear,
            cote: state.cave.cote,
            uid: state.cave.uid,
            legends: state.cave.legends || {},
        },
        contest: state.contest,
        lastContest: state.lastContest,
        day: state.day,
        weather: state.weather,
        nextWeather: state.nextWeather,
    };
    setState({ ...newState(), ...keep });
    fillGrid();
    ensurePastures();
    ensureOrchard();
    ensureIsland();
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
