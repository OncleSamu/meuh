// Le concours de la semaine : des points pour tout ce que vous faites, trois paliers,
// un classement contre les fermes voisines et des ligues.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { view } from '../core/view.js';
import { pickRand, fmt } from '../core/format.js';
import { emit, toast, sfx, buzz, burst } from '../core/bus.js';
import { DECOS } from '../data/farm.js';
import { RIVALS } from '../data/village.js';
import { CONTEST_LVL, CONTEST_POINTS, CONTEST_TIERS, LEAGUES } from '../data/commerce.js';
import { WEEK_MS } from '../data/world.js';
import { weekEndsIn, weekStart, weekKey } from './events.js';
import { projectDone } from './story.js';
import { styleCharm, addPhoto } from './style.js';
import { peacockCharm } from './surprises.js';
import { leagueOf, leagueName, leagueAfterContest } from './mastery.js';
import { tip } from './tips.js';
import { record } from './book.js';
import { earn, addXp } from './player.js';

export const contestOpen = () => state.level >= CONTEST_LVL;
export const contestTarget = L => Math.round((300 + L * 170) / 50) * 50;
export const contestEndsIn = () => (state.contest ? Math.max(0, state.contest.end - now()) / 1000 : weekEndsIn());
// part de la semaine écoulée depuis votre inscription : les rivales partent en même temps que vous
export const contestFrac = (c, at = now()) => Math.max(0, Math.min(c.end, at) - c.start) / WEEK_MS;

export const charmScore = () =>
    state.grid.reduce((a, p) => a + (p.deco && DECOS[p.deco] ? DECOS[p.deco].charm || 0 : 0), 0) * (projectDone('florist') ? 2 : 1) +
    styleCharm() +
    peacockCharm();

export function contestSnapshot() {
    const o = {};
    Object.keys(CONTEST_POINTS).forEach(k => (o[k] = state.stats[k] || 0));
    return o;
}

export function myContestScore() {
    const c = state.contest;
    if (!c) return { total: 0, parts: [] };
    const cur = contestSnapshot();
    const parts = Object.entries(CONTEST_POINTS).map(([k, P]) => [P.name, Math.floor(Math.max(0, cur[k] - (c.base[k] || 0)) * P.pts)]);
    parts.push(['Charme', charmScore()]);
    if (projectDone('bandstand')) parts.push(['Kiosque', Math.round(parts.reduce((a, [, n]) => a + n, 0) * 0.25)]);
    return { total: parts.reduce((a, [, n]) => a + n, 0), parts: parts.filter(([, n]) => n > 0) };
}

// une inscription en cours de semaine donne des paliers plus bas
const contestWindow = c => Math.max(0.15, (c.end - c.start) / WEEK_MS);
export const contestTiers = c => CONTEST_TIERS.map(f => Math.max(10, Math.round((contestTarget(c.lvl) * contestWindow(c) * f) / 10) * 10));
export const tierReward = c => ({ coins: Math.round((500 * (1 + c.lvl * 0.3) * LEAGUES[c.league || 0].pay) / 10) * 10, xp: 200 + c.lvl * 40 });

function rivalScore(r, c, frac) {
    const noise = 0.9 + ((Math.sin((c.start / 864e5 + 1) * (r.f * 97.3)) + 1) / 2) * 0.2;
    return Math.round(contestTarget(c.lvl) * r.f * LEAGUES[c.league || 0].f * noise * Math.pow(Math.max(0, frac), 0.85));
}

export function contestRanking(at) {
    const c = state.contest;
    const frac = contestFrac(c, at);
    const list = RIVALS.map(r => ({ name: r.name, score: rivalScore(r, c, frac) }));
    list.push({ name: 'Votre ferme', score: myContestScore().total, me: true });
    return list.sort((a, b) => b.score - a.score);
}

export function contestTick() {
    if (!contestOpen()) return false;
    const c = state.contest;
    const t = now();
    if (c && t < c.end) {
        // les paliers suivent votre niveau pendant la semaine
        if (state.level > c.lvl) c.lvl = state.level;
        return false;
    }
    if (c && c.end) {
        // résultats du concours qui vient de se terminer
        const list = contestRanking(c.end);
        contestReward(list.findIndex(x => x.me) + 1, list.find(x => x.me).score, c.league || 0);
    }
    const end = weekStart().getTime() + WEEK_MS;
    state.contest = {
        key: weekKey(),
        start: t,
        end: end > t ? end : t + WEEK_MS,
        lvl: state.level,
        league: leagueOf(),
        base: contestSnapshot(),
        tiers: [false, false, false],
    };
    if (c && view.started) toast('Un nouveau concours de la semaine commence !', ['ui', 'podium']);
    if (view.started) tip('contest');
    return true;
}

export function contestReward(place, score, league = 0) {
    const coins = Math.round((1000 * (1 + state.level * 0.3) * [0, 1, 0.6, 0.35, 0.15, 0.1][place] * LEAGUES[league].pay) / 10) * 10;
    const rub = place === 1 ? 1 : 0;
    state.money += coins;
    state.stats.earned += coins;
    state.prestige.rubans += rub;
    if (place === 1) {
        state.stats.contestWins = (state.stats.contestWins || 0) + 1;
        addPhoto('ui', 'trophy', 'Concours gagné', `Ligue ${leagueName(league).toLowerCase()}`);
    }
    const move = leagueAfterContest(place);
    state.lastContest = { rank: place, score, league: leagueOf() };
    record('contest', score);
    emit('contestResult', { rank: place, score, coins, rub, move });
}

export const contestClaimable = () => {
    const c = state.contest;
    if (!c || !contestOpen()) return 0;
    const pts = myContestScore().total;
    return contestTiers(c).filter((t, k) => !c.tiers[k] && pts >= t).length;
};

export function claimContestTier(k, at) {
    const c = state.contest;
    if (!c || c.tiers[k] || myContestScore().total < contestTiers(c)[k]) return false;
    c.tiers[k] = true;
    const r = tierReward(c);
    sfx('level');
    buzz(20);
    burst(at, 'sparkle', 14);
    if (k < 2) {
        earn(r.coins * (k + 1), at);
        addXp(r.xp * (k + 1), at);
    } else openChest(r);
    return true;
}

// Coffre du dernier palier : pièces, un ruban et une décoration
function openChest(r) {
    state.stats.contracts++;
    const pool = Object.values(DECOS).filter(d => state.level >= d.reqLvl && !d.rare);
    const deco = pool.length ? pickRand(pool) : DECOS.birdhouse;
    state.decorInv[deco.id] = (state.decorInv[deco.id] || 0) + 1;
    state.prestige.rubans++;
    earn(r.coins * 3, null);
    addXp(r.xp * 3);
    emit('celebrate', {
        icon: ['ui', 'chest'],
        title: 'Coffre du concours !',
        sub: 'Dernier palier atteint, le jury vous félicite :',
        lines: [
            [['ui', 'coin'], `${fmt(r.coins * 3)} pièces`],
            [['ui', 'ribbon'], '1 ruban de concours'],
            [['ui', deco.id], `${deco.name}, à poser dans le champ`],
        ],
    });
}
