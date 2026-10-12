// Maîtrise des produits, renommée après le niveau 40, ligues du concours et Ferme légendaire.
import { state } from '../core/state.js';
import { view } from '../core/view.js';
import { fmt } from '../core/format.js';
import { emit, toast, sfx, buzz, burst } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { RECIPES } from '../data/machines.js';
import { CHAPTERS, RIVALS } from '../data/village.js';
import { RARE, LEAGUES } from '../data/commerce.js';
import { MAX_LEVEL, RENOWN_XP, MEDALS, MASTERY_LVL, MASTERY_TIERS, MASTERY_NAMES } from '../data/progress.js';
import { LEGEND_GOALS } from '../data/meta.js';
import { farmSeasonAdd } from './port.js';
import { addPhoto } from './style.js';
import { earn, getXpReq } from './player.js';
import { tip } from './tips.js';
import { chapterDone } from './story.js';

// ---------------- maîtrise ----------------
export function masteryKind(id) {
    const t = ITEMS[id].type;
    if (t === 'crop' || t === 'tree') return 'crop';
    if (RECIPES[id]) return 'craft';
    return 'animal';
}
export const masteryCount = id => (state.mastery && state.mastery[id]) || 0;
export const masteryStars = id => (id && ITEMS[id] ? MASTERY_TIERS[masteryKind(id)].filter(t => masteryCount(id) >= t).length : 0);
// +5 % de prix par étoile ; l'or rend aussi la production 15 % plus rapide
export const masteryMult = id => 1 + 0.05 * masteryStars(id);
export const masterySpeed = id => (masteryStars(id) >= 3 ? 1.15 : 1);
export const goldMasteries = () => Object.keys(state.mastery || {}).filter(id => ITEMS[id] && masteryStars(id) >= 3).length;
export const masteryReward = (id, st) => Math.round(((ITEMS[id].sell || 20) * [20, 60, 150][st - 1]) / 10) * 10;
export const nextTier = id => MASTERY_TIERS[masteryKind(id)][Math.min(2, masteryStars(id))];
export const masteryKnown = () =>
    Object.keys(ITEMS)
        .filter(id => ITEMS[id].sell && (state.mastery[id] || 0) > 0)
        .sort((a, b) => masteryStars(b) - masteryStars(a) || masteryCount(b) / nextTier(b) - masteryCount(a) / nextTier(a));

export function addMastery(id, qty) {
    farmSeasonAdd(id, qty);
    if (!ITEMS[id] || !ITEMS[id].sell) return;
    const before = masteryStars(id);
    state.mastery[id] = masteryCount(id) + qty;
    const after = masteryStars(id);
    if (after <= before || state.level < MASTERY_LVL) return;
    const coins = masteryReward(id, after);
    if (after === 3 && goldMasteries() <= 5) addPhoto('item', id, `${ITEMS[id].name} maîtrisé`, 'Maîtrise or');
    earn(coins, null);
    if (!view.started) return;
    tip('mastery');
    toast(`Maîtrise ${MASTERY_NAMES[after - 1]} : ${ITEMS[id].name} (+${fmt(coins)} pièces)`, ['ui', MEDALS[after - 1]]);
    sfx('golden');
}

// ---------------- renommée ----------------
export const xpNeed = () => (state.level >= MAX_LEVEL ? RENOWN_XP : getXpReq(state.level));

export function renownStar() {
    state.renown = (state.renown || 0) + 1;
    const n = state.renown;
    const coins = 20000 + n * 2000;
    earn(coins, null);
    RARE.forEach(id => (state.inventory[id] += 3));
    const rub = n % 5 === 0 ? 1 : 0;
    state.prestige.rubans += rub;
    if (!view.started) return;
    emit('celebrate', {
        icon: ['ui', 'star'],
        num: n,
        title: `Renommée : ${n} étoile${n > 1 ? 's' : ''} !`,
        sub: 'Votre ferme fait parler d’elle dans tout le canton :',
        lines: [
            [['ui', 'coin'], `${fmt(coins)} pièces`],
            [['item', 'paint'], '3 planches, 3 clous et 3 pots de peinture'],
            ...(rub ? [[['ui', 'ribbon'], '1 ruban de concours']] : []),
        ],
    });
}

// ---------------- ligues du concours ----------------
export const leagueOf = () => state.league || 0;
export const leagueName = l => LEAGUES[l].name;
export const canPromote = () => leagueOf() < LEAGUES.length - 1 && state.level >= LEAGUES[leagueOf() + 1].lvl;

export function leagueAfterContest(place) {
    const l = leagueOf();
    if (place === 1 && canPromote()) {
        state.league = l + 1;
        state.stats.bestLeague = Math.max(state.stats.bestLeague || 0, state.league);
        tip('league');
        return `Promotion en ligue ${leagueName(state.league).toLowerCase()} !`;
    }
    if (place === RIVALS.length + 1 && l > 0) {
        state.league = l - 1;
        return `Retour en ligue ${leagueName(state.league).toLowerCase()}`;
    }
    return '';
}

// ---------------- Ferme légendaire ----------------
const LEGEND_CHECK = {
    level: () => [state.stats.maxLevel >= MAX_LEVEL, `${Math.min(state.level, MAX_LEVEL)} / ${MAX_LEVEL}`],
    chapters: () => [chapterDone(6), `${CHAPTERS.filter(c => c.n <= 6 && chapterDone(c.n)).length} / 6`],
    house: () => [(state.stats.houseMax || 0) >= 5, `${state.stats.houseMax || 0} / 5`],
    league: () => [(state.stats.bestLeague || 0) >= 3, leagueName(state.stats.bestLeague || 0)],
    mastery: () => [goldMasteries() >= 10, `${Math.min(10, goldMasteries())} / 10`],
};
// [{ id, name, ok, v }]
export const legendGoals = () =>
    LEGEND_GOALS.map(g => {
        const [ok, v] = LEGEND_CHECK[g.id]();
        return { ...g, ok, v };
    });
export const legendReady = () => !state.legend && legendGoals().every(g => g.ok);

export function claimLegend(at) {
    if (!legendReady()) return false;
    state.legend = true;
    addPhoto('ui', 'goldCow', 'Ferme légendaire', 'Le grand jour');
    state.decorInv.goldCow = (state.decorInv.goldCow || 0) + 1;
    state.prestige.rubans += 10;
    burst(at, 'sparkle', 30);
    emit('celebrate', {
        icon: ['ui', 'goldCow'],
        title: 'Ferme légendaire !',
        sub: 'Tout le canton vient admirer votre ferme. Vous recevez :',
        lines: [
            [['ui', 'goldCow'], 'La vache dorée, à poser dans le champ (+100 de charme)'],
            [['ui', 'ribbon'], '10 rubans de concours'],
            [['ui', 'star'], 'Le titre de Ferme légendaire, pour toujours'],
        ],
    });
    sfx('level');
    buzz(60);
    return true;
}
