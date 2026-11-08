// 1.100 (étape 4) : la fête de la vallée (voir data/fete.js).
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { emit, sfx } from '../core/bus.js';
import { FETE } from '../data/fete.js';
import { VILLAGERS, CHAPTERS } from '../data/village.js';
import { hasCost, payCost } from './home.js';
import { campBuilt } from './camping.js';
import { chapterDone } from './story.js';

export const valleeOpen = () => campBuilt();
export const valleeDone = () => !!(state.fete && state.fete.done);
export const valleeGoal = g => Math.min(g.need, state.stats[g.stat] || 0);
export const valleeGoalsDone = () => FETE.goals.every(g => valleeGoal(g) >= g.need);
export const canValleeFete = () => valleeOpen() && !valleeDone() && valleeGoalsDone() && hasCost(FETE.cost);
// le valleeBilan : tout ce qu'on a fait dans la partie, figé le soir de la fête
export function valleeBilan() {
    const s = state.stats;
    return {
        day: state.day,
        level: state.level,
        playSec: s.playSec || 0,
        harvested: s.harvested || 0,
        crafted: s.crafted || 0,
        orders: s.orders || 0,
        earned: s.earned || 0,
        chapters: CHAPTERS.filter(c => chapterDone(c.n)).length,
        guests: s.campGuests || 0,
        happy: s.campHappy || 0,
        residents: state.camping && state.camping.res ? state.camping.res.length : 0,
        friends: s.campFriends || 0,
        coffrets: s.coffretsSold || 0,
        brand: state.maison ? state.maison.name : '',
    };
}
export function launchValleeFete() {
    if (!canValleeFete()) return false;
    payCost(FETE.cost);
    state.fete = { done: true, at: now(), bilan: valleeBilan(), cast: (state.camping.res || []).map(r => ({ look: r.look, name: r.name, job: r.job })) };
    state.stats.fete = 1;
    sfx('level');
    emit('celebrate', { icon: ['ui', 'heart'], title: FETE.title, sub: FETE.scene.join(' '), lines: [] });
    return true;
}
// le générique : les habitants de toujours, les résidents, les campeurs de passage, la Maison
export function valleeCredits() {
    const c = state.camping || {};
    return {
        villagers: Object.values(VILLAGERS).map(v => ({ id: v.id, name: v.name, role: v.role })),
        residents: (c.res || []).map(r => ({ look: r.look, name: r.name, job: r.job })),
        passers: (c.past || []).map(p => ({ look: p.look, name: p.name })),
        brand: state.maison ? state.maison.name : '',
    };
}
