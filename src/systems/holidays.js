// Les fêtes aux vraies dates : Halloween, Noël et Pâques.
import { state } from '../core/state.js';
import { today } from '../core/clock.js';
import { view } from '../core/view.js';
import { toast, sfx, burst } from '../core/bus.js';
import { DECOS } from '../data/farm.js';
import { HOLIDAYS } from '../data/world.js';
import { RARE } from '../data/commerce.js';
import { tip } from './tips.js';
import { earn } from './player.js';
import { addPhoto } from './style.js';

// dimanche de Pâques (calcul grégorien)
export function easterDate(y) {
    const a = y % 19,
        b = Math.floor(y / 100),
        c = y % 100,
        d = Math.floor(b / 4),
        e = b % 4,
        f = Math.floor((b + 8) / 25),
        g = Math.floor((b - f + 1) / 3),
        h = (19 * a + b - d - g + 15) % 30,
        i = Math.floor(c / 4),
        k = c % 4,
        l = (32 + 2 * e + 2 * i - h - k) % 7,
        m = Math.floor((a + 11 * h + 22 * l) / 451),
        month = Math.floor((h + l - 7 * m + 114) / 31),
        day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(y, month - 1, day);
}

// pour essayer une fête hors saison (outils de test)
let forced;
export const forceHoliday = id => (forced = id);

export function holidayNow() {
    if (forced !== undefined) return forced;
    const d = today(),
        y = d.getFullYear(),
        md = (d.getMonth() + 1) * 100 + d.getDate();
    for (const [id, h] of Object.entries(HOLIDAYS)) {
        if (h.easter) {
            const e = easterDate(y);
            const from = new Date(e.getTime() + h.easter[0] * 864e5),
                to = new Date(e.getTime() + (h.easter[1] + 1) * 864e5);
            if (d >= from && d < to) return id;
            continue;
        }
        const a = h.from[0] * 100 + h.from[1],
            b = h.to[0] * 100 + h.to[1];
        if (a <= b ? md >= a && md <= b : md >= a || md <= b) return id;
    }
    return null;
}
export const holidayActive = id => holidayNow() === id;
// l'année de la fête (Noël déborde sur janvier)
const holidayYear = () => {
    const d = today();
    return d.getMonth() === 0 ? d.getFullYear() - 1 : d.getFullYear();
};

export function ensureHoliday() {
    const id = holidayNow();
    if (!id || state.level < 3) return false;
    const y = holidayYear();
    if (state.holiday && state.holiday.id === id && state.holiday.year === y) return false;
    state.holiday = { id, year: y, given: {}, done: false };
    if (view.started) {
        toast(`C’est ${HOLIDAYS[id].name} à la ferme !`, HOLIDAYS[id].icon);
        tip('holiday');
    }
    return true;
}

export const holidayLeft = k => HOLIDAYS[state.holiday.id].goal[k] - (state.holiday.given[k] || 0);
export const holidayOpen = () => !!(state.holiday && !state.holiday.done && holidayActive(state.holiday.id));
export const holidayReady = () => holidayOpen() && Object.keys(HOLIDAYS[state.holiday.id].goal).some(k => holidayLeft(k) > 0 && state.inventory[k] > 0);
export const holidayReward = () => Math.round((3000 * (1 + state.level * 0.2)) / 50) * 50;

export function giveHoliday(at) {
    if (!holidayOpen()) return false;
    const h = HOLIDAYS[state.holiday.id];
    let gave = 0;
    Object.keys(h.goal).forEach(k => {
        const n = Math.min(holidayLeft(k), state.inventory[k] || 0);
        if (n <= 0) return;
        state.inventory[k] -= n;
        state.holiday.given[k] = (state.holiday.given[k] || 0) + n;
        gave += n;
    });
    if (!gave) return false;
    sfx('pop');
    burst(at, 'sparkle', 8);
    if (Object.keys(h.goal).every(k => holidayLeft(k) <= 0)) {
        state.holiday.done = true;
        earn(holidayReward(), at);
        state.decorInv[h.deco] = (state.decorInv[h.deco] || 0) + 1;
        RARE.forEach(id => (state.inventory[id] += 2));
        sfx('level');
        burst(at, 'sparkle', 20);
        toast(`${h.name} : panier complet ! ${DECOS[h.deco].name} à poser dans le champ`, ['ui', h.deco]);
        addPhoto('ui', h.deco, `${h.name} ${state.holiday.year}`, 'Panier de fête rempli');
    }
    return true;
}
