// Le monde : saisons, météo et passage des jours.
import { state } from '../core/state.js';
import { emit, toast, sfx } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { SEASONS, DAYS_PER_SEASON, WEATHER, WEATHER_ODDS } from '../data/world.js';
import { rank } from './player.js';
import { themeCropMult } from './port.js';
import { hasRod, stormTick } from './farmlife.js';

export const seasonOfDay = d => (state.challenge === 'winter' ? SEASONS[3] : SEASONS[Math.floor((d - 1) / DAYS_PER_SEASON) % 4]);
export const season = () => seasonOfDay(state.day);
export const dayInSeason = () => ((state.day - 1) % DAYS_PER_SEASON) + 1;
export const seasonNames = ids => ids.map(id => SEASONS.find(x => x.id === id).name).join(', ');
export const isInSeason = id => (ITEMS[id].seasons || []).includes(season().id);
export const weather = () => WEATHER[state.weather] || WEATHER.sun;
export const hour = () => state.gameTimeMinutes / 60;
export const isNight = () => {
    const h = hour();
    return h < 6 || h >= 20;
};

export function rollWeather(seasonId) {
    const odds = WEATHER_ODDS[seasonId];
    let r = Math.random() * Object.values(odds).reduce((a, b) => a + b, 0);
    for (const [k, v] of Object.entries(odds)) {
        r -= v;
        if (r <= 0) return k;
    }
    return 'sun';
}

export function cropRate(id) {
    const d = ITEMS[id],
        sid = season().id;
    let f;
    if (d.type === 'tree') f = sid === 'hiver' ? 0.5 : sid === 'automne' ? 1.2 : 1;
    else f = isInSeason(id) ? 1.3 : sid === 'hiver' ? 0.6 : 1;
    return f * weather().crop * (1 + rank('green') * 0.05) * themeCropMult(id);
}

export function seasonCrops(sid = season().id) {
    return Object.values(ITEMS).filter(i => i.seasons && i.seasons.includes(sid));
}

export function seasonCropsText() {
    const list = seasonCrops()
        .filter(i => state.level >= i.reqLvl)
        .map(i => i.name.toLowerCase());
    return list.length ? `De saison : ${list.join(', ')}.` : '';
}

export function newDay(silent) {
    const before = season().id;
    state.day++;
    state.weather = state.nextWeather || rollWeather(season().id);
    state.nextWeather = rollWeather(seasonOfDay(state.day + 1).id);
    if (silent) return;
    if (season().id !== before) {
        toast(`C’est le ${season().name.toLowerCase()} ! ${seasonCropsText()}`, ['ui', season().icon]);
        sfx('level');
    } else if (state.weather === 'storm' && !hasRod())
        toast(`Jour ${state.day} : orage ! La foudre peut brûler une culture. Un paratonnerre protège tout le champ.`, ['ui', 'w_storm']);
    else if (state.weather === 'rainbow') toast(`Jour ${state.day} : arc-en-ciel ! Les récoltes dorées sont bien plus fréquentes.`, ['ui', 'w_rainbow']);
    else toast(`Jour ${state.day} : ${weather().name.toLowerCase()}`, ['ui', weather().icon]);
    if (state.weather === 'storm') emit('tip', 'storm');
    emit('newDay', state.day);
}

// Une seconde de météo : la pluie arrose, la canicule assèche, l'orage gronde.
export function weatherTick(visible = true) {
    let changed = false;
    const w = weather();
    if (w.waters)
        state.grid.forEach(p => {
            if (p.isUnlocked && p.itemId && !p.isReady && !p.isWatered) {
                p.isWatered = true;
                changed = true;
            }
        });
    if (w.dries)
        state.grid.forEach(p => {
            if (p.isUnlocked && p.itemId && !p.isReady && p.isWatered && ITEMS[p.itemId].type === 'crop' && Math.random() < 1 / 150) {
                p.isWatered = false;
                changed = true;
            }
        });
    if (state.weather === 'storm' && visible && Math.random() < 1 / 10) emit('lightning');
    if (stormTick()) changed = true;
    return changed;
}
