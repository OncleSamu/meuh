// Heum — l'événement de Contamination du jour : annoncé, trois choix, une seule fois par jour.
// Il ne se déclenche jamais tout seul : sans réponse, il ne se passe rien.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { toast, sfx } from '../core/bus.js';
import { EVENTS, EVENT_LVL } from '../data/world.js';
import { have, take, give, spend, addXp, nameOf } from './player.js';
import { addCont } from './contamination.js';
import { WRECK } from '../data/world.js';

const day = () => {
    const d = new Date(now());
    return d.getFullYear() * 400 + d.getMonth() * 32 + d.getDate();
};
export const eventOpen = () => state.level >= EVENT_LVL;
export const todayEvent = () => (eventOpen() ? EVENTS[day() % EVENTS.length] : null);
export const eventDone = () => !!state.event && state.event.day === day();
const costOk = cost =>
    Object.entries(cost || {}).every(([id, n]) => (id === 'money' ? state.money >= n : id === 'food' ? state.bunker.food >= n : have(id) >= n));
export const optOk = o => costOk(o.cost);
export const costText = cost =>
    Object.entries(cost || {})
        .map(([id, n]) => `${n} ${id === 'money' ? 'pièces' : id === 'food' ? 'vivres' : nameOf(id).toLowerCase()}`)
        .join(', ');
export function chooseEvent(k) {
    const e = todayEvent(),
        o = e && e.opts[k];
    if (!o || eventDone()) return false;
    if (!optOk(o)) {
        toast(`Il faut ${costText(o.cost)}`);
        sfx('error');
        return false;
    }
    for (const [id, n] of Object.entries(o.cost || {})) {
        if (id === 'money') spend(n);
        else if (id === 'food') state.bunker.food -= n;
        else take(id, n);
    }
    if (o.cont) addCont(o.cont);
    for (const [id, n] of Object.entries(o.get || {})) {
        if (id === 'food') state.bunker.food = Math.min(30, state.bunker.food + n);
        else if (id === 'wreck') state.wreck.charges = Math.min(WRECK.max, state.wreck.charges + n);
        else if (id === 'xp') addXp(n);
        else give(id, n);
    }
    state.event = { day: day(), k };
    addXp(5);
    sfx(o.cont > 0 ? 'toxic' : 'collect');
    return true;
}
