// Maîtrise des produits, renommée après le niveau 64, ligues du concours et Ferme légendaire.
import { state } from '../core/state.js';
import { view } from '../core/view.js';
import { fmt } from '../core/format.js';
import { emit, toast, sfx, buzz, burst } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { RECIPES } from '../data/machines.js';
import { CHAPTERS, RIVALS } from '../data/village.js';
import { RARE, LEAGUES } from '../data/commerce.js';
import {
    MAX_LEVEL,
    RENOWN_XP,
    MEDALS,
    MASTERY_LVL,
    MASTERY_TIERS,
    MASTERY_NAMES,
    MASTERY_EXTRA,
    MASTERY_EXTRA_NAMES,
    MASTERY_EXTRA_REWARD,
    MASTERY_EXTRA_FLOOR,
} from '../data/progress.js';
import { LEGEND_GOALS, LEGEND_RUBANS } from '../data/meta.js';
import { HOUSE } from '../data/progress.js';
import { bookProgress } from './book.js';
import { farmSeasonAdd } from './port.js';
import { addPhoto } from './style.js';
import { earn, getXpReq } from './player.js';
import { tip } from './tips.js';
import { mamieMasteryMult } from './mamie.js';
import { chapterDone } from './story.js';

// ---------------- maîtrise ----------------
export function masteryKind(id) {
    const t = ITEMS[id].type;
    if (t === 'crop' || t === 'tree') return 'crop';
    if (t === 'fish') return 'fish';
    if (RECIPES[id]) return 'craft';
    return 'animal';
}
export const masteryCount = id => (state.mastery && state.mastery[id]) || 0;
export const masteryStars = id => (id && ITEMS[id] ? MASTERY_TIERS[masteryKind(id)].filter(t => masteryCount(id) >= t).length : 0);
// 1.19 : les rangs au-delà de l'or (0, 1 platine, 2 diamant)
export const masteryExtra = id => (id && ITEMS[id] && masteryStars(id) >= 3 ? MASTERY_EXTRA[masteryKind(id)].filter(t => masteryCount(id) >= t).length : 0);
// +5 % de prix par étoile (+3 % par rang de plus) ; l'or rend aussi la production 15 % plus rapide (+3 % par rang de plus)
export const masteryMult = id => 1 + 0.05 * masteryStars(id) + 0.03 * masteryExtra(id);
export const masterySpeed = id => (masteryStars(id) >= 3 ? 1.15 + 0.03 * masteryExtra(id) : 1);
// la demande du marché baisse moins vite (−25 %, −50 %) et ne descend pas si bas (40 %, 55 % du prix)
export const dropMult = id => 1 - 0.25 * masteryExtra(id);
export const demandFloor = id => MASTERY_EXTRA_FLOOR[masteryExtra(id)];
export const extraName = id => MASTERY_EXTRA_NAMES[masteryExtra(id) - 1] || '';
export const goldMasteries = () => Object.keys(state.mastery || {}).filter(id => ITEMS[id] && masteryStars(id) >= 3).length;
export const masteryReward = (id, st) => Math.round(((ITEMS[id].sell || 20) * [20, 60, 150][st - 1]) / 10) * 10;
export const nextTier = id => MASTERY_TIERS[masteryKind(id)][Math.min(2, masteryStars(id))];
// le prochain seuil au-delà de l'or (0 si le rang diamant est atteint)
export const nextExtra = id => MASTERY_EXTRA[masteryKind(id)][masteryExtra(id)] || 0;
export const masteryKnown = () =>
    Object.keys(ITEMS)
        .filter(id => ITEMS[id].sell && (state.mastery[id] || 0) > 0)
        .sort((a, b) => masteryStars(b) - masteryStars(a) || masteryCount(b) / nextTier(b) - masteryCount(a) / nextTier(a));

export function addMastery(id, qty) {
    farmSeasonAdd(id, qty);
    // 1.71.1 : ce qu'on fabrique est compté même sans prix de vente (nourriture, planches, clous…), pour les objectifs de niveau
    state.made = state.made || {};
    state.made[id] = (state.made[id] || 0) + qty;
    if (!ITEMS[id] || !ITEMS[id].sell) return;
    const before = masteryStars(id),
        beforeX = masteryExtra(id);
    // 1.83 : le plat de la semaine de Mamie compte double
    state.mastery[id] = masteryCount(id) + qty * mamieMasteryMult(id);
    const after = masteryStars(id),
        afterX = masteryExtra(id);
    if (afterX > beforeX && state.level >= MASTERY_LVL) {
        const coins = Math.round(((ITEMS[id].sell || 20) * MASTERY_EXTRA_REWARD[afterX - 1]) / 10) * 10;
        earn(coins, null);
        if (view.started) {
            toast(`Maîtrise ${MASTERY_EXTRA_NAMES[afterX - 1]} : ${ITEMS[id].name} (+${fmt(coins)} pièces) · la demande baisse moins`, ['ui', 'medalG']);
            sfx('golden');
        }
    }
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
    chapters: () => {
        const n = CHAPTERS.filter(c => chapterDone(c.n)).length;
        return [n >= CHAPTERS.length, `${n} / ${CHAPTERS.length}`];
    },
    house: () => {
        const top = HOUSE.length - 1,
            h = Math.max(state.stats.houseMax || 0, (state.house && state.house.lvl) || 0);
        return [h >= top, `${h} / ${top}`];
    },
    league: () => [(state.stats.bestLeague || 0) >= 3, leagueName(state.stats.bestLeague || 0)],
    cup: () => {
        const p = (state.cup && state.cup.pts) || 0;
        return [p >= 40, `${Math.min(p, 40)} / 40 points`];
    },
    book: () => {
        const b = bookProgress(),
            pc = Math.floor((b.found / b.total) * 100);
        return [pc >= 75, `${pc} %`];
    },
    friends: () => {
        const n = Object.values(state.villagers || {}).filter(v => v && v.hearts >= 5).length;
        return [n >= 20, `${Math.min(n, 20)} / 20`];
    },
    cave: () => {
        const n = Object.keys((state.cave && state.cave.legends) || {}).length;
        return [n >= 1, n ? 'fait' : 'pas encore'];
    },
    haras: () => {
        const ok = Object.values((state.show && state.show.best) || {}).some(d => d >= 3);
        return [ok, ok ? 'fait' : 'pas encore'];
    },
    mastery: () => [goldMasteries() >= 25, `${Math.min(25, goldMasteries())} / 25`],
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
    state.prestige.rubans += LEGEND_RUBANS;
    burst(at, 'sparkle', 30);
    emit('celebrate', {
        icon: ['ui', 'goldCow'],
        title: 'Ferme légendaire !',
        sub: 'Tout le canton vient admirer votre ferme. Vous recevez :',
        lines: [
            [['ui', 'goldCow'], 'La vache dorée, à poser dans le champ (+100 de charme)'],
            [['ui', 'ribbon'], `${LEGEND_RUBANS} rubans de concours`],
            [['ui', 'star'], 'Le titre de Ferme légendaire, pour toujours'],
        ],
    });
    sfx('level');
    buzz(60);
    return true;
}
