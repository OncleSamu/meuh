// La ferme la nuit (1.2) : lucioles sur le champ, étoile filante dans le ciel, marché de nuit.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { fmt } from '../core/format.js';
import { DECOS } from '../data/farm.js';
import { ITEMS } from '../data/items.js';
import { NIGHT } from '../data/night.js';
import * as G from '../systems/index.js';
import { actions } from './dom.js';
import { ico, art } from './icons.js';
import { btn, timer } from './kit.js';

let lastFlies = '',
    lastStar = '';

// chaque seconde : les lucioles du champ et l'étoile filante
export function updateNight() {
    const N = state.night;
    const layer = document.getElementById('flies');
    if (layer) {
        const flies = N && G.isNight() && G.nightOpen() ? N.flies : [];
        const wish = N && N.wish && G.wishActive(N.wish.kind) ? N.wish : null;
        const showJar = flies.length || (N && N.jar && G.isNight() && G.fliesSeason());
        const key = flies.map(f => f.id).join(',') + '|' + (showJar ? N.jar : '') + '|' + (wish ? wish.kind + (wish.left || '') : '');
        if (key !== lastFlies) {
            lastFlies = key;
            layer.innerHTML =
                flies
                    .map(
                        f =>
                            `<button class="fly" data-act="catchFly" data-id="${f.id}" style="left:${f.x}%;top:${f.y}%;--d:${(f.id % 5) * 0.4}s" aria-label="Attraper la luciole">${art('ui', 'firefly')}</button>`,
                    )
                    .join('') +
                (showJar || wish
                    ? `<div class="night-pill">${showJar ? `${ico(['ui', 'fireflyJar'])}<b>${N.jar} / ${NIGHT.jar}</b>` : ''}${wish ? `${ico(['ui', 'wishStar'])}<span>${wish.kind === 'gold' ? `${wish.left} récolte${wish.left > 1 ? 's' : ''} en or` : 'Bêtes ×2'}</span>` : ''}</div>`
                    : '');
        }
    }
    // l'étoile filante passe en haut de l'écran : on la touche pour faire un vœu
    let star = document.getElementById('wish-star');
    const s = N && N.star && now() < N.star.until ? N.star : null;
    const sk = s ? String(s.until) : '';
    if (sk === lastStar) return;
    lastStar = sk;
    if (!s) {
        if (star) star.remove();
        return;
    }
    if (!star) {
        star = document.createElement('button');
        star.id = 'wish-star';
        star.dataset.act = 'catchStar';
        star.setAttribute('aria-label', 'Faire un vœu');
        star.innerHTML = art('ui', 'wishStar');
        document.body.appendChild(star);
    }
    star.style.top = `${s.y}%`;
    star.style.setProperty('--dur', `${NIGHT.starLife / 1000}s`);
    star.classList.remove('go');
    void star.offsetWidth;
    star.classList.add('go');
}

// la carte du marché de nuit (Marché | Acheter, les nuits d'été)
export function nightMarketCard() {
    if (!G.nightMarketOpen() || !state.night || !state.night.market) return null;
    const offers = state.night.market
        .map((o, k) => {
            const name = o.kind === 'deco' ? DECOS[o.id].name : `${o.n} graines de ${ITEMS[o.id].name.toLowerCase()}`;
            const pic = o.kind === 'deco' ? ico(['ui', o.id], 'ico big') : ico(['item', o.id], 'ico big');
            return `<div class="nm-offer${o.sold ? ' sold' : ''}">${pic}<b>${name}</b>${o.sold ? '<small>Vendu</small>' : btn(`${fmt(o.price)}${ico(['ui', 'coin'])}`, { act: 'buyNight', data: { k }, size: 'sm', kind: state.money >= o.price ? 'green' : '' })}</div>`;
        })
        .join('');
    const end = now() + ((((6 - G.hour() + 24) % 24) * 60) / 5) * 1000;
    return `<div class="card night-market"><div class="card-head">${ico(['ui', 'lantern'], 'ico big')}<div class="card-main"><div class="card-title">Le marché de nuit</div><div class="card-sub">Les soirs d’été, à la lueur des lanternes. Il remballe à l’aube.</div></div><span class="timer-pill">${ico(['ui', 'clock'])}${timer(end)}</span></div><div class="nm-offers">${offers}</div></div>`;
}

export function setupNight() {
    actions({
        catchFly: (el, d) => G.catchFly(d.id, el),
        catchStar: el => {
            G.catchStar(el);
            el.remove();
            lastStar = '';
        },
        buyNight: (el, d) => G.buyNight(+d.k, el),
    });
}
