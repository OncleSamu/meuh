// Le décor : couleur du ciel selon l'heure et la météo, soleil et lune, nuit, saison, fêtes.
import { state } from '../core/state.js';
import { SKY, HOLIDAY_LVL } from '../data/world.js';
import { weather, season } from '../systems/world.js';
import { styleOf } from '../systems/style.js';
import { rareActive } from '../systems/surprises.js';
import { holidayNow } from '../systems/holidays.js';
import { byId } from './dom.js';

const hex = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
export const mix = (a, b, t) =>
    '#' +
    hex(a)
        .map((v, i) =>
            Math.round(v + (hex(b)[i] - v) * t)
                .toString(16)
                .padStart(2, '0'),
        )
        .join('');

let lastBody = '';
let lastSky = '',
    fadeUntil = 0;

export function updateScene() {
    const h = state.gameTimeMinutes / 60;
    let i = 0;
    while (i < SKY.length - 2 && h >= SKY[i + 1][0]) i++;
    const [h0, t0, b0] = SKY[i],
        [h1, t1, b1] = SKY[i + 1];
    const t = Math.min(1, Math.max(0, (h - h0) / (h1 - h0)));
    const scene = byId('scene');
    const g = weather().gray;
    const tint = c => (g > 0 ? mix(c, '#7d8894', g) : g < 0 ? mix(c, '#ffb46b', -g) : c);
    // 1.44 : le ciel ne se repeint que s'il a changé ; un fondu seulement pour un vrai saut (la météo),
    // sinon le fondu tournerait sans arrêt et repeindrait tout l'écran à chaque image
    const top = tint(mix(t0, t1, t)),
        bot = tint(mix(b0, b1, t));
    if (top + bot !== lastSky) {
        const jump = lastSky && Math.max(...hex(top).map((v, k) => Math.abs(v - hex(lastSky.slice(0, 7))[k]))) > 12;
        if (jump) fadeUntil = Date.now() + 1300;
        scene.classList.toggle('sky-fade', Date.now() < fadeUntil);
        scene.style.setProperty('--sky-top', top);
        scene.style.setProperty('--sky-bot', bot);
        lastSky = top + bot;
    }
    const meta = document.querySelector('meta[name=theme-color]');
    if (meta) meta.setAttribute('content', mix(t0, t1, t));

    // obscurité : 0 le jour, 1 en pleine nuit
    let dark = 0;
    if (h < 5 || h >= 21) dark = 1;
    else if (h < 7) dark = 1 - (h - 5) / 2;
    else if (h >= 19) dark = (h - 19) / 2;
    byId('night').style.opacity = (dark * 0.42).toFixed(3);
    byId('stars').style.opacity = dark.toFixed(2);

    const W = innerWidth,
        H = innerHeight * 0.5;
    const arc = p => ({ x: p * (W + 80) - 75, y: H * 0.55 - Math.sin(p * Math.PI) * H * 0.45 });
    const sunP = (h - 5.5) / 15; // 5h30 → 20h30
    const sun = byId('sun'),
        moon = byId('moon');
    if (sunP >= 0 && sunP <= 1) {
        const a = arc(sunP);
        sun.style.transform = `translate(${a.x}px, ${a.y}px)`;
    }
    sun.style.opacity = sunP >= 0 && sunP <= 1 && g < 0.4 ? (g > 0.2 ? 0.5 : 1) : 0;
    const moonP = ((h + 24 - 20) % 24) / 10; // 20h → 6h
    if (moonP >= 0 && moonP <= 1) {
        const a = arc(moonP);
        moon.style.transform = `translate(${a.x}px, ${a.y}px)`;
        moon.style.opacity = 1;
    } else moon.style.opacity = 0;

    // classes de la page (sur <html>) : météo, saison, fête, papillons, style, confort
    const hol = holidayNow();
    const cls = [
        `w-${state.weather}`,
        `season-${season().id}`,
        hol && state.level >= HOLIDAY_LVL ? `hol-${hol}` : '',
        rareActive('butterflies') ? 'butterflies' : '',
        `fence-${styleOf('fence')}`,
        `path-${styleOf('path')}`,
        `ts-${state.settings.textSize || 0}`,
        state.settings.contrast ? 'contrast' : '',
        state.settings.calm ? 'calm' : '',
        h < 5.5 || h >= 20.5 ? 'night' : '',
    ]
        .filter(Boolean)
        .join(' ');
    if (cls !== lastBody) {
        lastBody = cls;
        document.documentElement.className = cls;
    }
    const barn = byId('hill-barn');
    if (barn) barn.setAttribute('fill', styleOf('barn'));
}
