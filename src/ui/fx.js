// Les effets : chiffres qui s'envolent, particules, objets qui volent vers un onglet, confettis, éclairs.
// Ils écoutent les annonces des règles (bus) et ne touchent jamais à l'état du jeu.
import { state } from '../core/state.js';
import { fmt } from '../core/format.js';
import { on } from '../core/bus.js';
import { art, parts } from './icons.js';
import { byId, centerOf, anchorEl } from './dom.js';

const layer = () => byId('fx');
const systemCalm = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
// animations réduites : réglage du système ou option du jeu
export const reduceMotion = () => systemCalm || state.settings.calm;

export function floatText(x, y, html, cls = '') {
    const el = document.createElement('div');
    el.className = `fx-float ${cls}`;
    el.innerHTML = html;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    layer().appendChild(el);
    el.animate(
        [
            { transform: 'translate(-50%,-30%) scale(.5)', opacity: 0 },
            { transform: 'translate(-50%,-80%) scale(1.15)', opacity: 1, offset: 0.2 },
            { transform: 'translate(-50%,-160%) scale(1)', opacity: 1, offset: 0.7 },
            { transform: 'translate(-50%,-200%) scale(.95)', opacity: 0 },
        ],
        { duration: 1100, easing: 'ease-out' },
    ).onfinish = () => el.remove();
}

const PARTICLES = {
    dirt: { colors: ['#7a4a2a', '#5e3a1e', '#a0703f'], shape: 'dot', up: 1, spread: 1 },
    water: { colors: ['#4fb3f6', '#8fd3ff', '#ffffff'], shape: 'drop', up: 1.2, spread: 0.9 },
    leaf: { colors: ['#6cc04a', '#9be06b', '#3f8f2e'], shape: 'leaf', up: 1.1, spread: 1.1 },
    sparkle: { colors: ['#ffd23f', '#fff3a3', '#ffffff'], shape: 'star', up: 1.4, spread: 1.2 },
    crumbs: { colors: ['#f2c14e', '#d9a441', '#d8b779'], shape: 'dot', up: 0.8, spread: 0.7 },
    feather: { colors: ['#2d2a3a', '#4a4560', '#1d1b26'], shape: 'leaf', up: 1, spread: 1.3 },
    chips: { colors: ['#e8c38c', '#c08b52', '#a8693a'], shape: 'leaf', up: 1.1, spread: 1 },
    pebbles: { colors: ['#a7adb4', '#7d848c', '#d6dade'], shape: 'dot', up: 1, spread: 1.1 },
    smoke: { colors: ['#ffffff', '#e8e8e8'], shape: 'puff', up: 1.5, spread: 0.5 },
};

export function burstAt(x, y, kind, n = 10) {
    if (document.hidden) return;
    if (reduceMotion()) n = Math.ceil(n / 3);
    const k = PARTICLES[kind];
    if (!k) return;
    for (let i = 0; i < n; i++) {
        const el = document.createElement('div');
        el.className = 'fx-p';
        const size = 5 + Math.random() * 6;
        const col = k.colors[i % k.colors.length];
        if (k.shape === 'star') {
            el.innerHTML = `<svg viewBox="0 0 20 20" width="${size * 2}" height="${size * 2}"><path d="M10 0l2.4 7.6L20 10l-7.6 2.4L10 20l-2.4-7.6L0 10l7.6-2.4z" fill="${col}" stroke="#3a2618" stroke-width="1.2"/></svg>`;
        } else {
            el.style.width = size + 'px';
            el.style.height = (k.shape === 'leaf' ? size * 0.6 : k.shape === 'drop' ? size * 1.3 : size) + 'px';
            el.style.background = col;
            el.style.borderRadius = k.shape === 'drop' ? '50% 50% 50% 50% / 60% 60% 40% 40%' : k.shape === 'leaf' ? '0 100% 0 100%' : '50%';
            el.style.border = k.shape === 'puff' ? 'none' : '1.5px solid #3a2618';
            if (k.shape === 'puff') {
                el.style.width = el.style.height = size * 2.2 + 'px';
                el.style.opacity = 0.8;
            }
        }
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        layer().appendChild(el);
        const ang = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * k.spread;
        const dist = 26 + Math.random() * 42;
        const dx = Math.cos(ang) * dist,
            dy = Math.sin(ang) * dist * k.up;
        const rot = (Math.random() - 0.5) * 540;
        el.animate(
            [
                { transform: `translate(-50%,-50%) rotate(0deg) scale(1)`, opacity: 1 },
                {
                    transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${rot / 2}deg) scale(1)`,
                    opacity: 1,
                    offset: 0.45,
                    easing: 'ease-in',
                },
                {
                    transform: `translate(calc(-50% + ${dx * 1.3}px), calc(-50% + ${dy + (kind === 'smoke' ? -30 : 50)}px)) rotate(${rot}deg) scale(.4)`,
                    opacity: 0,
                },
            ],
            { duration: 650 + Math.random() * 350, easing: 'cubic-bezier(.2,.7,.4,1)' },
        ).onfinish = () => el.remove();
    }
}

export function flyTo(x, y, target, html, { delay = 0, size = 30, onArrive } = {}) {
    const t = centerOf(target);
    const el = document.createElement('div');
    el.className = 'fx-fly';
    el.style.width = el.style.height = size + 'px';
    el.style.left = x - size / 2 + 'px';
    el.style.top = y - size / 2 + 'px';
    el.innerHTML = html;
    layer().appendChild(el);
    const sx = (Math.random() - 0.5) * 70,
        sy = -30 - Math.random() * 50;
    el.animate(
        [
            { transform: 'translate(0,0) scale(.4)', opacity: 0 },
            { transform: `translate(${sx}px,${sy}px) scale(1.15)`, opacity: 1, offset: 0.28, easing: 'cubic-bezier(.55,0,.8,.6)' },
            { transform: `translate(${t.x - x}px,${t.y - y}px) scale(.65)`, opacity: 1 },
        ],
        { duration: 650 + Math.random() * 200, delay, fill: 'both' },
    ).onfinish = () => {
        el.remove();
        if (onArrive) onArrive();
    };
}

export function bump(el, cls = 'bump') {
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
}

export function squish(at) {
    const el = anchorEl(at);
    if (!el || reduceMotion()) return;
    const target = el.querySelector('.critter-body, .spr-wrap') || el;
    target.animate([{ transform: 'scale(1)' }, { transform: 'scale(.88, .84)' }, { transform: 'scale(1.06, 1.04)' }, { transform: 'scale(1)' }], {
        duration: 260,
        easing: 'ease-out',
    });
}

export function shake(at) {
    const el = anchorEl(at);
    if (el) el.animate([{ transform: 'translateX(-4px)' }, { transform: 'translateX(4px)' }, { transform: 'none' }], 200);
}

export function confetti() {
    const colors = ['#e2412f', '#f2c14e', '#6cc04a', '#5aa9e6', '#f6a5b5', '#ffffff'];
    const n = reduceMotion() ? 0 : 70;
    for (let i = 0; i < n; i++) {
        const el = document.createElement('div');
        el.className = 'confetti';
        el.style.background = colors[i % colors.length];
        el.style.left = Math.random() * 100 + 'vw';
        layer().appendChild(el);
        const drift = (Math.random() - 0.5) * 160;
        el.animate(
            [
                { transform: `translate(0,-20px) rotate(0deg)`, opacity: 1 },
                { transform: `translate(${drift}px, ${innerHeight + 40}px) rotate(${(Math.random() - 0.5) * 1080}deg)`, opacity: 0.9 },
            ],
            { duration: 1800 + Math.random() * 1600, delay: Math.random() * 400, easing: 'cubic-bezier(.25,.4,.6,1)' },
        ).onfinish = () => el.remove();
    }
}

export function lightning() {
    const f = byId('flash');
    if (!f || reduceMotion() || document.hidden) return;
    f.animate([{ opacity: 0 }, { opacity: 0.85, offset: 0.08 }, { opacity: 0.1, offset: 0.2 }, { opacity: 0.6, offset: 0.3 }, { opacity: 0 }], {
        duration: 700,
    });
}

// ---------------- l'argent qui arrive dans la bourse ----------------
// les pièces en vol ne sont pas encore comptées dans l'affichage
export const money = { shown: 0, hold: 0 };

function coinsFly(amount, at) {
    const el = anchorEl(at);
    if (!el || reduceMotion() || document.hidden) return false;
    const c = centerOf(el);
    const n = Math.max(3, Math.min(12, Math.round(Math.log2(amount + 1) * 1.6)));
    const batch = { left: amount };
    money.hold += amount;
    const part = Math.floor(amount / n);
    const pill = byId('coin-pill');
    for (let i = 0; i < n; i++) {
        flyTo(c.x, c.y, pill, art('ui', 'coin'), {
            delay: i * 55,
            size: 26,
            onArrive: () => {
                const give = i === n - 1 ? batch.left : Math.min(part, batch.left);
                batch.left -= give;
                money.hold -= give;
                if (i % 2 === 0) emitCoin();
                bump(pill);
            },
        });
    }
    setTimeout(() => {
        if (batch.left > 0) {
            money.hold -= batch.left;
            batch.left = 0;
        }
    }, 2500);
    floatText(c.x, c.y - 10, `+${fmt(amount)}${`<i class="ico">${art('ui', 'coin')}</i>`}`, 'gold');
    return true;
}
let emitCoin = () => {};

// à chaque image : la bourse rattrape doucement le vrai montant
function tickMoney() {
    const target = state.money - money.hold;
    const d = target - money.shown;
    if (Math.abs(d) < 1) money.shown = target;
    else money.shown += d * 0.16 + Math.sign(d) * 0.6;
    const el = byId('ui-money');
    if (el) {
        const txt = fmt(money.shown);
        if (el.textContent !== txt) el.textContent = txt;
    }
    requestAnimationFrame(tickMoney);
}

// ---------------- branchement sur les annonces des règles ----------------
export function setupFx({ sfx, tabEl }) {
    emitCoin = () => sfx('coin');
    money.shown = state.money;
    requestAnimationFrame(tickMoney);
    const at = a => centerOf(a);
    on('float', ({ at: a, parts: p, cls, dy = 0, dx = 0, delay = 0 }) => {
        if (!anchorEl(a) && a !== undefined && a !== null) return;
        if (!a) return;
        const c = at(a);
        const go = () => floatText(c.x + dx, c.y + dy, parts(p), cls || '');
        delay ? setTimeout(go, delay) : go();
    });
    on('burst', ({ at: a, kind, n, dy = 0 }) => {
        if (!anchorEl(a)) return;
        const c = at(a);
        burstAt(c.x, c.y + dy, kind, n);
    });
    // un produit qui part vers l'onglet où il sert
    on('fly', ({ at: a, item, qty = 1, to = 'market' }) => {
        if (!anchorEl(a) || reduceMotion()) return;
        const c = at(a),
            tab = tabEl(to);
        const n = Math.min(qty, 4);
        for (let i = 0; i < n; i++)
            flyTo(c.x, c.y, tab, art('item', item), { delay: 80 + i * 70, size: 34, onArrive: i === n - 1 ? () => bump(tab, 'got') : null });
    });
    on('flyIcon', ({ at: a, icon, to }) => {
        if (!anchorEl(a) || reduceMotion()) return;
        const c = at(a);
        flyTo(c.x, c.y, tabEl(to), art(icon[0], icon[1]), { size: 44 });
    });
    on('squish', squish);
    on('shake', shake);
    on('earn', ({ amount, at: a }) => coinsFly(amount, a));
    on('rare', ({ at: a, id, n }) => {
        if (!anchorEl(a)) return;
        const c = at(a);
        setTimeout(() => {
            floatText(c.x + 20, c.y - 34, `+${n}<i class="ico">${art('item', id)}</i>`, 'gold');
            flyTo(c.x, c.y, byId('barn-pill'), art('item', id), { size: 30 });
        }, 350);
    });
    on('confetti', confetti);
    on('lightning', () => {
        lightning();
        setTimeout(() => sfx('thunder'), 250 + Math.random() * 500);
    });
    on('swing', ({ at: a, tool }) => {
        if (!anchorEl(a)) return;
        const c = at(a);
        const el = document.createElement('div');
        el.className = 'swing';
        el.innerHTML = art('ui', tool);
        el.style.left = c.x + 6 + 'px';
        el.style.top = c.y - 46 + 'px';
        layer().appendChild(el);
        setTimeout(() => el.remove(), 360);
    });
    on('hearts', ({ at: a, n = 3 }) => {
        if (!anchorEl(a)) return;
        const c = at(a);
        for (let k = 0; k < n; k++)
            setTimeout(() => floatText(c.x + (Math.random() - 0.5) * 60, c.y - 20, `<i class="ico">${art('ui', 'heart')}</i>`), k * 110);
    });
    on('barnFull', () => bump(byId('barn-pill'), 'shake'));
}
