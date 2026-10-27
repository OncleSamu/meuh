/* eslint-disable prefer-const -- les gestes déclarent leurs poignées avant de les affecter */
// Le mini-jeu du comptoir (1.17) : une boisson = une suite de gestes, une note de 1 à 3 étoiles.

import { ITEMS } from '../data/items.js';
import { BREW } from '../data/counter.js';
import { VILLAGERS } from '../data/village.js';

import * as G from '../systems/index.js';
import { ico } from './icons.js';
import { sfx, buzz } from '../core/bus.js';

let buzzAt = 0;
// une petite vibration, pas plus d'une par demi-seconde
const buzzSoft = () => {
    const t = performance.now();
    if (t - buzzAt > 500) {
        buzzAt = t;
        buzz(15);
    }
};
import { refresh } from './app.js';

const INK = '#3a2618';
const LBL = {
    grind: 'Mouture',
    extract: 'Extraction',
    foam: 'Mousse',
    pour: 'Service',
    temp: 'Température',
    steep: 'Infusion',
    whisk: 'Fouet',
    squeeze: 'Pressage',
    stir: 'Cuillère',
    shake: 'Shaker',
    ice: 'Glaçons',
    drop: 'Dosage',
    highpour: 'Versé de haut',
};
// 1.43 : la règle de chaque geste, montrée avant de commencer
const HOW = {
    grind: 'Touchez quand l’anneau rouge rejoint le cercle.',
    extract: 'Maintenez pour verser, lâchez sur le trait rouge.',
    pour: 'Maintenez pour verser, lâchez sur le trait rouge.',
    foam: 'Tracez le motif au doigt dans la mousse, avant la fin du temps.',
    temp: 'Maintenez pour chauffer, lâchez à la bonne température.',
    steep: 'Retirez le sachet quand la barre est dans le vert.',
    whisk: 'Tournez le doigt en rond pour fouetter.',
    squeeze: 'Tapotez vite pour presser le fruit.',
    stir: 'Tournez la cuillère, mais pas trop vite : ça déborde !',
    shake: 'Secouez : glissez le doigt de haut en bas, en rythme.',
    ice: 'Touchez les glaçons qui tombent pour les mettre dans le verre.',
    drop: 'Maintenez pour doser, lâchez dans la zone verte. Ça coule vite !',
    highpour: 'Maintenez pour verser, mais seulement quand le verre passe sous le jet.',
};
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const wait = ms => new Promise(r => setTimeout(r, ms));
const fall = (x, t, w, f) => 1 - clamp((Math.abs(x - t) - w) / f);
let run = 0;

const star = on =>
    `<svg viewBox="0 0 40 40"><path d="M20 3l5 11 12 1.5-9 8 2.5 12L20 29l-10.5 6.5L12 23.5l-9-8L15 14z" fill="${on ? '#f4b92e' : '#efe3c8'}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>${on ? '<path d="M17 11l3-5" stroke="#fff" stroke-width="3" stroke-linecap="round"/>' : ''}</svg>`;
const stars = n => [1, 2, 3].map(i => star(i <= n)).join('');

// ---------------- la tasse ----------------
const BODY = 'M40 40H150V108Q150 146 112 146H78Q40 146 40 108Z';
function cupSvg() {
    const rects = [0, 1, 2].map(i => `<rect id="cbl${i}" x="36" width="120" style="display:none"/>`).join('');
    return `<svg viewBox="0 0 200 170"><ellipse cx="95" cy="156" rx="78" ry="9" fill="#a86f3d" stroke="${INK}" stroke-width="3"/><path d="M150 58H172Q190 58 190 78 190 100 164 104H150" fill="none" stroke="${INK}" stroke-width="14" stroke-linecap="round"/><path d="M150 58H172Q190 58 190 78 190 100 164 104H150" fill="none" stroke="#fff8e8" stroke-width="6" stroke-linecap="round"/><clipPath id="cbcl"><path d="${BODY}"/></clipPath><path d="${BODY}" fill="#fff8e8"/><g clip-path="url(#cbcl)">${rects}</g><path d="${BODY}" fill="none" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><path d="M52 52V104" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/><g id="cbtg" style="display:none"><line x1="40" x2="150" y1="146" y2="146" stroke="#e25b45" stroke-width="4" stroke-dasharray="7 5"/><path d="M154 146l12-7v14z" fill="#e25b45" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/></g></svg>`;
}
function setCup(root, layers, target) {
    let y = 146;
    for (let i = 0; i < 3; i++) {
        const r = root.querySelector('#cbl' + i),
            l = layers[i];
        if (!r) return;
        if (l && l.h > 0) {
            const h = l.h * 104;
            y -= h;
            r.setAttribute('y', y);
            r.setAttribute('height', h + 1);
            r.setAttribute('fill', l.c);
            r.style.display = '';
        } else r.style.display = 'none';
    }
    const tg = root.querySelector('#cbtg');
    if (tg) {
        if (target == null) tg.style.display = 'none';
        else {
            tg.style.display = '';
            tg.setAttribute('transform', 'translate(0 ' + -target * 104 + ')');
        }
    }
}

// ---------------- gestes ----------------
// maintenir le doigt (ou la barre d'espace)
function hold(stage, on, off) {
    const ac = new AbortController(),
        o = { signal: ac.signal };
    let h = false;
    const d = () => {
        if (h) return;
        h = true;
        on();
    };
    const u = () => {
        if (!h) return;
        h = false;
        off();
    };
    stage.addEventListener(
        'pointerdown',
        e => {
            e.preventDefault();
            d();
        },
        o,
    );
    window.addEventListener('pointerup', u, o);
    window.addEventListener('pointercancel', u, o);
    window.addEventListener(
        'keydown',
        e => {
            if (e.code === 'Space') {
                e.preventDefault();
                d();
            }
        },
        o,
    );
    window.addEventListener('keyup', e => e.code === 'Space' && u(), o);
    return () => ac.abort();
}
async function ready(c) {
    const b = document.createElement('div');
    b.className = 'cb-read big';
    c.stage.innerHTML = '';
    c.stage.appendChild(b);
    for (const [t, ms] of [
        ['Prêt ?', 700],
        ['Go !', 350],
    ]) {
        b.textContent = t;
        await wait(ms);
    }
    c.stage.innerHTML = '';
}

async function fill(p, c, msg) {
    c.hint(msg);
    const st = c.stage;
    st.innerHTML = '<div class="cb-pad" id="cbpad">Maintenez</div><div class="cb-read" id="cbfr"></div>';
    const layer = { c: p.c, h: 0 };
    c.layers.push(layer);
    const base = c.layers.slice(0, -1).reduce((a, l) => a + l.h, 0);
    const target = p.t;
    c.cup(target);
    return new Promise(res => {
        let on = false,
            last = 0,
            raf,
            done = false,
            off;
        const lvl = () => base + layer.h;
        const stop = () => {
            if (done) return;
            done = true;
            cancelAnimationFrame(raf);
            off();
            c.cup(null);
            res(fall(lvl(), target, p.w, 0.22));
        };
        const loop = t => {
            // 1.43 : la partie a été quittée : on arrête tout (sinon la boucle tournait sans fin)
            if (!c.alive()) return void ((done = true), off && off());
            const dt = last ? (t - last) / 1000 : 0;
            last = t;
            if (on) {
                layer.h = Math.min(1 - base, layer.h + dt * 0.22);
                c.cup(target);
                if (lvl() >= 1 - 0.001) stop();
            }
            if (!done) raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        off = hold(
            st,
            () => {
                on = true;
                const pad = st.querySelector('#cbpad');
                pad.textContent = 'Verse…';
                pad.style.background = '#6fbf5a';
            },
            () => {
                if (on && layer.h > 0.02) stop();
                else on = false;
            },
        );
    });
}

const STEP = {
    async grind(p, c) {
        c.hint(`Moulez : touchez quand l’anneau rejoint le cercle (${p.beats} fois)`);
        const st = c.stage,
            tg = 44;
        let tot = 0;
        st.innerHTML = `<svg class="cb-layer" viewBox="0 0 300 300"><circle cx="150" cy="150" r="${tg}" fill="none" stroke="${INK}" stroke-width="5"/><circle cx="150" cy="150" r="${tg - 8}" fill="#a86f3d" stroke="${INK}" stroke-width="4"/><circle id="cbring" cx="150" cy="150" r="130" fill="none" stroke="#e25b45" stroke-width="7"/><text id="cbgn" x="150" y="156" text-anchor="middle" font-family="Nunito,sans-serif" font-weight="900" font-size="20" fill="#fff8e8" stroke="${INK}" stroke-width="1">0/${p.beats}</text></svg>`;
        const ring = st.querySelector('#cbring'),
            gn = st.querySelector('#cbgn');
        for (let b = 0; b < p.beats; b++) {
            const dur = 1500 - b * 80;
            const sc = await new Promise(res => {
                const t0 = performance.now();
                let fin = false,
                    raf;
                const ac = new AbortController();
                const end = v => {
                    if (fin) return;
                    fin = true;
                    ac.abort();
                    cancelAnimationFrame(raf);
                    res(v);
                };
                const hit = () => end(clamp(1 - Math.abs(+ring.getAttribute('r') - tg) / p.tol));
                const fr = () => {
                    if (!c.alive()) return void ((fin = true), ac.abort());
                    const k = (performance.now() - t0) / dur;
                    ring.setAttribute('r', Math.max(14, 130 - (130 - 14) * k));
                    if (k >= 1) end(0);
                    else raf = requestAnimationFrame(fr);
                };
                raf = requestAnimationFrame(fr);
                st.addEventListener('pointerdown', hit, { signal: ac.signal });
                window.addEventListener(
                    'keydown',
                    e => {
                        if (e.code === 'Space') {
                            e.preventDefault();
                            hit();
                        }
                    },
                    { signal: ac.signal },
                );
            });
            tot += sc;
            gn.textContent = `${b + 1}/${p.beats}`;
            ring.setAttribute('stroke', sc > 0.75 ? '#6fbf5a' : sc > 0.35 ? '#f4b92e' : '#e25b45');
            await wait(200);
            ring.setAttribute('stroke', '#e25b45');
            if (!c.alive()) return 0;
        }
        return tot / p.beats;
    },
    extract: (p, c) => fill(p, c, 'Maintenez pour verser, lâchez sur le trait'),
    pour: (p, c) => fill(p, c, `Maintenez pour verser ${p.label}, lâchez sur le trait`),
    async foam(p, c) {
        // 1.43 : trois motifs (cœur, feuille, tulipe) et un temps limité
        const shape = p.shape || 'heart';
        const NAMES = { heart: 'un cœur', leaf: 'une feuille', tulip: 'une tulipe' };
        const limit = p.dur || 12;
        c.hint(`Dessinez ${NAMES[shape]} en suivant les pointillés`);
        const st = c.stage;
        st.innerHTML = '<canvas></canvas><div class="cb-read" id="cbft">Tracez avec le doigt</div>';
        const cv = st.querySelector('canvas'),
            W = st.clientWidth,
            H = st.clientHeight,
            dpr = window.devicePixelRatio || 1;
        cv.width = W * dpr;
        cv.height = H * dpr;
        const g = cv.getContext('2d');
        g.scale(dpr, dpr);
        const cx = W / 2,
            cy = H / 2 + 10,
            s = Math.min(W, H) / 46;
        const pts = [];
        if (shape === 'heart')
            for (let i = 0; i <= 80; i++) {
                const t = (i / 80) * Math.PI * 2;
                pts.push([cx + s * 16 * Math.pow(Math.sin(t), 3), cy - s * (13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))]);
            }
        else if (shape === 'leaf') {
            // une feuille en amande et sa nervure
            for (let i = 0; i <= 64; i++) {
                const t = (i / 64) * Math.PI * 2;
                pts.push([cx + s * 9 * Math.sin(t) * Math.abs(Math.cos(t / 2)) * 1.4, cy - s * 15 * Math.cos(t)]);
            }
            for (let i = 0; i <= 16; i++) pts.push([cx, cy + s * 15 - (i / 16) * s * 30]);
        } else {
            // une tulipe : trois arches empilées et une tige
            [-9, 0, 9].forEach((dy, k) => {
                const r = s * (11 - k * 2.5);
                for (let i = 0; i <= 24; i++) {
                    const t = Math.PI + (i / 24) * Math.PI;
                    pts.push([cx + Math.cos(t) * r, cy + dy * s * 0.9 + Math.sin(t) * r * 0.75]);
                }
            });
            for (let i = 0; i <= 10; i++) pts.push([cx, cy + s * 9 + (i / 10) * s * 8]);
        }
        g.fillStyle = '#f3e2c4';
        g.strokeStyle = INK;
        g.lineWidth = 4;
        g.beginPath();
        g.arc(cx, cy, Math.min(W, H) / 2 - 14, 0, 7);
        g.fill();
        g.stroke();
        g.fillStyle = '#8a5a33';
        g.beginPath();
        g.arc(cx, cy, Math.min(W, H) / 2 - 20, 0, 7);
        g.globalAlpha = 0.25;
        g.fill();
        g.globalAlpha = 1;
        g.setLineDash([7, 8]);
        g.strokeStyle = '#8a5a33';
        g.lineWidth = 3;
        g.beginPath();
        let prev = null;
        pts.forEach(q => {
            // un saut entre deux morceaux du motif : on lève le crayon
            if (!prev || Math.hypot(q[0] - prev[0], q[1] - prev[1]) > s * 6) g.moveTo(q[0], q[1]);
            else g.lineTo(q[0], q[1]);
            prev = q;
        });
        g.stroke();
        g.setLineDash([]);
        const drawn = [];
        let down = false;
        const pos = e => {
            const r = cv.getBoundingClientRect();
            return [e.clientX - r.left, e.clientY - r.top];
        };
        return new Promise(res => {
            const ac = new AbortController(),
                o = { signal: ac.signal };
            const b = document.createElement('button');
            b.className = 'btn green';
            b.textContent = 'Terminé';
            b.style.cssText = 'position:absolute;right:10px;bottom:10px';
            st.appendChild(b);
            b.addEventListener('pointerdown', e => e.stopPropagation());
            st.addEventListener(
                'pointerdown',
                e => {
                    if (e.target === b) return;
                    down = true;
                    const q = pos(e);
                    drawn.push(q);
                    g.beginPath();
                    g.moveTo(q[0], q[1]);
                },
                o,
            );
            st.addEventListener(
                'pointermove',
                e => {
                    if (!down) return;
                    const q = pos(e);
                    drawn.push(q);
                    g.strokeStyle = '#fff8e8';
                    g.lineWidth = 9;
                    g.lineCap = 'round';
                    g.lineTo(q[0], q[1]);
                    g.stroke();
                },
                o,
            );
            window.addEventListener('pointerup', () => (down = false), o);
            const t0 = performance.now();
            let over = false;
            const end = () => {
                if (over) return;
                over = true;
                clearInterval(watch);
                ac.abort();
                if (drawn.length < 8) return res(0);
                const cover = pts.filter(q => drawn.some(d => Math.hypot(d[0] - q[0], d[1] - q[1]) < 22)).length / pts.length;
                const good = drawn.filter(d => pts.some(q => Math.hypot(d[0] - q[0], d[1] - q[1]) < 28)).length / drawn.length;
                res(clamp(cover * 0.7 + good * 0.3) * clamp(cover * 1.15));
            };
            const watch = setInterval(() => {
                if (!c.alive()) {
                    over = true;
                    clearInterval(watch);
                    return ac.abort();
                }
                const left = limit - (performance.now() - t0) / 1000;
                const tx = st.querySelector('#cbft');
                if (tx) tx.textContent = left > 0 ? `${Math.ceil(left)} s` : 'Temps écoulé';
                if (left <= 0) end();
            }, 100);
            b.onclick = end;
        });
    },
    // 1.43 : presser un agrume en tapotant vite
    async squeeze(p, c) {
        c.hint(`Pressez ${p.label || 'le fruit'} : tapotez vite !`);
        const st = c.stage;
        st.innerHTML = `<svg class="cb-layer" viewBox="0 0 300 300"><g id="cbfruit"><ellipse cx="150" cy="150" rx="70" ry="56" fill="${p.c || '#f4d03f'}" stroke="${INK}" stroke-width="6"/><ellipse cx="128" cy="128" rx="16" ry="9" fill="#fff" opacity=".55"/><path d="M214 150 l18 -6 l-4 12z" fill="#6cc04a" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/></g></svg><div class="cb-bar"><i id="cbqf" style="width:0"></i></div><div class="cb-read" id="cbqt"></div>`;
        const layer = { c: p.c || '#f4d03f', h: 0 };
        c.layers.push(layer);
        return new Promise(res => {
            const ac = new AbortController();
            let n = 0,
                done = false,
                t0 = null;
            const fin = () => {
                if (done) return;
                done = true;
                ac.abort();
                clearInterval(iv);
                res(clamp(n / p.n));
            };
            const iv = setInterval(() => {
                if (!c.alive()) return fin();
                if (t0 == null) return;
                const l = p.dur - (performance.now() - t0) / 1000;
                const t = st.querySelector('#cbqt');
                if (t) t.textContent = Math.max(0, Math.ceil(l)) + ' s';
                if (l <= 0) fin();
            }, 100);
            st.addEventListener(
                'pointerdown',
                () => {
                    if (t0 == null) t0 = performance.now();
                    n++;
                    const k = clamp(n / p.n);
                    st.querySelector('#cbqf').style.width = k * 100 + '%';
                    st.querySelector('#cbfruit').setAttribute('transform', `translate(150 150) scale(${1 - 0.35 * k} ${1 - 0.2 * k}) translate(-150 -150)`);
                    layer.h = 0.12 * k;
                    c.cup(null);
                    if (n >= p.n) fin();
                },
                { signal: ac.signal },
            );
        });
    },
    // 1.43 : remuer à la cuillère sans aller trop vite
    async stir(p, c) {
        c.hint(`Remuez ${p.turns} tours, doucement : trop vite, ça déborde !`);
        const st = c.stage;
        st.innerHTML = `<svg class="cb-layer" viewBox="0 0 300 300"><circle cx="150" cy="150" r="110" fill="${p.c || '#c98a45'}" stroke="${INK}" stroke-width="6"/><circle cx="150" cy="150" r="70" fill="none" stroke="#fff8e8" stroke-width="3" stroke-dasharray="3 12" opacity=".6"/><g id="cbsp"><line x1="150" y1="150" x2="150" y2="70" stroke="#cfd6de" stroke-width="9" stroke-linecap="round"/><ellipse cx="150" cy="70" rx="12" ry="16" fill="#e6ebef" stroke="${INK}" stroke-width="3"/></g></svg><div class="cb-bar"><i id="cbrf" style="width:0"></i></div><div class="cb-read" id="cbrt">Tournez doucement</div>`;
        return new Promise(res => {
            const ac = new AbortController(),
                o = { signal: ac.signal };
            let prev = null,
                tot = 0,
                spill = 0,
                lastT = 0,
                t0 = null,
                done = false;
            const goal = Math.PI * 2 * p.turns;
            const fin = () => {
                if (done) return;
                done = true;
                ac.abort();
                clearInterval(iv);
                res(clamp(tot / goal) * clamp(1 - 0.2 * spill));
            };
            const iv = setInterval(() => {
                if (!c.alive()) return fin();
                if (t0 == null) return;
                if ((performance.now() - t0) / 1000 > p.dur) fin();
            }, 100);
            st.addEventListener(
                'pointermove',
                e => {
                    const r = st.getBoundingClientRect(),
                        a = Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)),
                        t = performance.now();
                    if (prev != null && (e.buttons || e.pointerType === 'touch')) {
                        let d = a - prev;
                        if (d > Math.PI) d -= Math.PI * 2;
                        if (d < -Math.PI) d += Math.PI * 2;
                        if (t0 == null) t0 = t;
                        const speed = Math.abs(d) / Math.max(0.008, (t - lastT) / 1000);
                        const tx = st.querySelector('#cbrt');
                        if (speed > (p.max || 9)) {
                            spill += Math.abs(d) / Math.PI;
                            if (tx) tx.textContent = 'Trop vite, ça déborde !';
                            buzzSoft();
                        } else {
                            tot += Math.abs(d);
                            if (tx) tx.textContent = `${Math.min(p.turns, Math.floor(tot / (Math.PI * 2)))} / ${p.turns} tours`;
                        }
                        st.querySelector('#cbsp').setAttribute('transform', `rotate(${(a * 180) / Math.PI + 90} 150 150)`);
                        st.querySelector('#cbrf').style.width = clamp(tot / goal) * 100 + '%';
                        if (tot >= goal) fin();
                    }
                    prev = a;
                    lastT = t;
                },
                o,
            );
            st.addEventListener('pointerup', () => (prev = null), o);
        });
    },
    // 1.43 : le shaker, secoué de haut en bas
    async shake(p, c) {
        c.hint(`Secouez le shaker : ${p.n} allers-retours, du haut vers le bas`);
        const st = c.stage;
        st.innerHTML = `<svg class="cb-layer" viewBox="0 0 300 300"><g id="cbsh"><path d="M118 70 L182 70 L172 230 L128 230Z" fill="#cfd6de" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/><rect x="124" y="46" width="52" height="26" rx="8" fill="#9aa3ad" stroke="${INK}" stroke-width="5"/><rect x="140" y="30" width="20" height="18" rx="6" fill="#9aa3ad" stroke="${INK}" stroke-width="5"/><path d="M134 90 L136 200" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/></g></svg><div class="cb-bar"><i id="cbhf" style="width:0"></i></div><div class="cb-read" id="cbht"></div>`;
        return new Promise(res => {
            const ac = new AbortController(),
                o = { signal: ac.signal };
            let y0 = null,
                dir = 0,
                n = 0,
                t0 = null,
                done = false;
            const fin = () => {
                if (done) return;
                done = true;
                ac.abort();
                clearInterval(iv);
                res(clamp(n / p.n));
            };
            const iv = setInterval(() => {
                if (!c.alive()) return fin();
                if (t0 == null) return;
                const l = p.dur - (performance.now() - t0) / 1000;
                const t = st.querySelector('#cbht');
                if (t) t.textContent = Math.max(0, Math.ceil(l)) + ' s';
                if (l <= 0) fin();
            }, 100);
            st.addEventListener('pointerdown', e => (y0 = e.clientY), o);
            st.addEventListener(
                'pointermove',
                e => {
                    if (y0 == null || !(e.buttons || e.pointerType === 'touch')) return;
                    const dy = e.clientY - y0;
                    st.querySelector('#cbsh').setAttribute('transform', `translate(0 ${clamp(dy, -60, 60)})`);
                    const d = dy > 36 ? 1 : dy < -36 ? -1 : 0;
                    if (d && d !== dir) {
                        if (t0 == null) t0 = performance.now();
                        if (dir) n += 0.5;
                        dir = d;
                        y0 = e.clientY;
                        st.querySelector('#cbhf').style.width = clamp(n / p.n) * 100 + '%';
                        if (n >= p.n) fin();
                    }
                },
                o,
            );
            window.addEventListener('pointerup', () => (y0 = null), o);
        });
    },
    // 1.43 : attraper les glaçons qui tombent
    async ice(p, c) {
        c.hint(`Touchez les ${p.n} glaçons avant qu’ils ne tombent`);
        const st = c.stage;
        st.innerHTML = '<div class="cb-read" id="cbit">0</div>';
        const W = st.clientWidth,
            H = st.clientHeight;
        return new Promise(res => {
            let caught = 0,
                gone = 0,
                made = 0,
                done = false;
            const cubes = [];
            const fin = () => {
                if (done) return;
                done = true;
                clearInterval(spawn);
                cancelAnimationFrame(raf);
                res(clamp(caught / p.n));
            };
            const spawn = setInterval(() => {
                if (!c.alive()) return fin();
                if (made >= p.n) return clearInterval(spawn);
                made++;
                const el = document.createElement('button');
                el.className = 'cb-ice';
                el.setAttribute('aria-label', 'Glaçon');
                const cube = { el, x: 20 + Math.random() * (W - 70), y: -40, v: (p.speed || 120) * (0.85 + Math.random() * 0.3), dead: false };
                el.style.left = cube.x + 'px';
                el.addEventListener('pointerdown', e => {
                    e.stopPropagation();
                    if (cube.dead) return;
                    cube.dead = true;
                    caught++;
                    el.classList.add('got');
                    setTimeout(() => el.remove(), 250);
                    st.querySelector('#cbit').textContent = `${caught} / ${p.n}`;
                    const top = c.layers[c.layers.length - 1];
                    if (top) c.cup(null);
                });
                st.appendChild(el);
                cubes.push(cube);
            }, p.every || 650);
            let last = 0,
                raf;
            const loop = t => {
                if (!c.alive()) return fin();
                const dt = last ? (t - last) / 1000 : 0;
                last = t;
                cubes.forEach(q => {
                    if (q.dead) return;
                    q.y += q.v * dt;
                    q.el.style.top = q.y + 'px';
                    if (q.y > H - 30) {
                        q.dead = true;
                        gone++;
                        q.el.remove();
                    }
                });
                if (caught + gone >= p.n) return fin();
                raf = requestAnimationFrame(loop);
            };
            raf = requestAnimationFrame(loop);
        });
    },
    // 1.54 : le thé versé de haut : le verre va et vient, on ne verse que lorsqu'il passe sous le jet
    async highpour(p, c) {
        c.hint('Versez de haut : maintenez quand le verre passe sous le jet');
        const st = c.stage;
        st.innerHTML = `<svg class="cb-layer" viewBox="0 0 300 300" style="pointer-events:none"><path d="M120 38 L180 38 L170 74 L130 74Z" fill="#d8dde2" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><rect id="cbhs" x="146" y="74" width="8" height="0" rx="3" fill="${p.c}" opacity=".9"/><g id="cbhg"><path d="M-34 232 L34 232 L28 292 L-28 292Z" fill="#fff8e8" fill-opacity=".55" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><rect id="cbhf" x="-27" y="292" width="54" height="0" fill="${p.c}"/></g></svg><div class="cb-bar"><i id="cbhb" style="width:0"></i></div><div class="cb-read" id="cbht">Maintenez pour verser (${p.dur} s)</div>`;
        const layer = { c: p.c, h: 0 };
        c.layers.push(layer);
        return new Promise(res => {
            let v = 0,
                spill = 0,
                on = false,
                last = 0,
                t0 = null,
                raf,
                done = false,
                off;
            const stop = () => {
                if (done) return;
                done = true;
                cancelAnimationFrame(raf);
                off();
                res(clamp(v * (1 - 0.6 * clamp(spill / 0.6)) + 0.1 * (v > 0.9 ? 1 : 0)));
            };
            const loop = t => {
                if (!c.alive()) return void ((done = true), off && off());
                const dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
                last = t;
                if (t0 == null) t0 = t;
                const el = t0 == null ? 0 : (t - t0) / 1000;
                const gx = Math.sin((t / 1000) * 2.1 * p.speed) * 95;
                st.querySelector('#cbhg').setAttribute('transform', `translate(${150 + gx} -40)`);
                const under = Math.abs(gx) <= p.w * 150;
                const s = st.querySelector('#cbhs');
                s.setAttribute('height', on ? 130 : 0);
                s.setAttribute('x', 146);
                if (on) {
                    if (under) v = Math.min(1, v + dt * 0.33);
                    else spill += dt;
                    st.querySelector('#cbhf').setAttribute('y', 292 - 60 * v);
                    st.querySelector('#cbhf').setAttribute('height', 60 * v);
                    st.querySelector('#cbhb').style.width = v * 100 + '%';
                    layer.h = 0.5 * v;
                    c.cup(null);
                    const tx = st.querySelector('#cbht');
                    if (tx) tx.textContent = under ? 'Dans le verre' : 'À côté !';
                }
                if (v >= 1 || el > p.dur) stop();
                if (!done) raf = requestAnimationFrame(loop);
            };
            raf = requestAnimationFrame(loop);
            off = hold(
                st,
                () => (on = true),
                () => (on = false),
            );
        });
    },
    // 1.43 : une goutte de sirop, dosée au plus juste (ça coule vite)
    async drop(p, c) {
        c.hint(`Dosez ${p.label || 'le sirop'} : maintenez, lâchez dans le vert`);
        const st = c.stage;
        const lo = (p.t - p.w) * 100,
            hi = (p.t + p.w) * 100;
        st.innerHTML = `<div class="cb-gauge"><u style="bottom:${lo}%;height:${hi - lo}%"></u><i id="cbdf" style="height:0"></i></div><svg class="cb-layer" viewBox="0 0 300 300" style="pointer-events:none"><path d="M150 40 L170 120 Q174 150 150 156 Q126 150 130 120Z" fill="${p.c || '#c8453a'}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/><ellipse cx="143" cy="118" rx="5" ry="12" fill="#fff" opacity=".5"/></svg><div class="cb-read" id="cbdt">Maintenez</div>`;
        return new Promise(res => {
            let v = 0,
                on = false,
                last = 0,
                raf,
                done = false,
                off;
            const stop = () => {
                if (done) return;
                done = true;
                cancelAnimationFrame(raf);
                off();
                res(fall(v, p.t, p.w, 0.18));
            };
            const loop = t => {
                if (!c.alive()) return void ((done = true), off && off());
                const dt = last ? (t - last) / 1000 : 0;
                last = t;
                if (on) {
                    v = Math.min(1, v + dt * (p.rate || 0.55));
                    st.querySelector('#cbdf').style.height = v * 100 + '%';
                    if (v >= 1) stop();
                }
                if (!done) raf = requestAnimationFrame(loop);
            };
            raf = requestAnimationFrame(loop);
            off = hold(
                st,
                () => {
                    on = true;
                    const t = st.querySelector('#cbdt');
                    if (t) t.textContent = 'Ça coule…';
                },
                () => {
                    if (on && v > 0.02) stop();
                    else on = false;
                },
            );
        });
    },
    async temp(p, c) {
        c.hint(`Chauffez l’eau à ${p.t} °C : maintenez, lâchez à bonne température`);
        const st = c.stage,
            min = 20,
            max = 100,
            rate = 26;
        const ty = 270 - ((p.t - min) / (max - min)) * 240;
        st.innerHTML = `<svg class="cb-layer" viewBox="0 0 300 300"><rect x="120" y="30" width="60" height="240" rx="30" fill="#efe3c8" stroke="${INK}" stroke-width="5"/><clipPath id="cbtc"><rect x="120" y="30" width="60" height="240" rx="30"/></clipPath><rect id="cbtf" x="120" y="270" width="60" height="0" fill="#e25b45" clip-path="url(#cbtc)"/><rect x="120" y="30" width="60" height="240" rx="30" fill="none" stroke="${INK}" stroke-width="5"/><line x1="100" x2="200" y1="${ty}" y2="${ty}" stroke="${INK}" stroke-width="4" stroke-dasharray="6 5"/><path d="M204 ${ty}l14-8v16z" fill="#6fbf5a" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/><text x="226" y="${ty + 7}" font-family="Nunito,sans-serif" font-weight="900" font-size="20" fill="${INK}">${p.t}°</text><circle cx="150" cy="270" r="40" fill="#e25b45" stroke="${INK}" stroke-width="5"/></svg><div class="cb-read" id="cbtr">20 °C</div>`;
        return new Promise(res => {
            let T = min,
                on = false,
                last = 0,
                raf,
                done = false,
                off;
            const stop = () => {
                if (done) return;
                done = true;
                cancelAnimationFrame(raf);
                off();
                res(fall(T, p.t, p.w, 18));
            };
            const loop = t => {
                if (!c.alive()) return void ((done = true), off && off());
                const dt = last ? (t - last) / 1000 : 0;
                last = t;
                if (on) {
                    T = Math.min(max, T + rate * dt);
                    const f = st.querySelector('#cbtf');
                    f.setAttribute('y', 270 - ((T - min) / (max - min)) * 240);
                    f.setAttribute('height', ((T - min) / (max - min)) * 240 + 20);
                    st.querySelector('#cbtr').textContent = Math.round(T) + ' °C';
                    if (T >= max) stop();
                }
                if (!done) raf = requestAnimationFrame(loop);
            };
            raf = requestAnimationFrame(loop);
            off = hold(
                st,
                () => (on = true),
                () => {
                    if (on && T > min + 1) stop();
                    else on = false;
                },
            );
        });
    },
    async steep(p, c) {
        c.hint('Retirez le sachet quand la barre est dans le vert');
        const st = c.stage;
        st.innerHTML = `<div class="cb-read">Infusion…</div><div class="cb-bar"><u style="left:${p.a * 100}%;width:${(p.b - p.a) * 100}%"></u><i id="cbsf" style="width:0"></i></div><svg class="cb-layer" viewBox="0 0 300 300" style="pointer-events:none"><g id="cbbag"><line x1="150" y1="40" x2="150" y2="120" stroke="${INK}" stroke-width="4"/><rect x="128" y="120" width="44" height="52" rx="8" fill="#e8dca0" stroke="${INK}" stroke-width="4"/><path d="M136 134h28" stroke="#fff" stroke-width="4" stroke-linecap="round"/></g></svg><button class="btn gold" id="cbrm" style="position:absolute;left:50%;transform:translateX(-50%);bottom:64px">Retirer le sachet</button>`;
        return new Promise(res => {
            const t0 = performance.now();
            let done = false,
                raf;
            const ac = new AbortController();
            const fin = v => {
                if (done) return;
                done = true;
                cancelAnimationFrame(raf);
                ac.abort();
                res(v);
            };
            const k = () => (performance.now() - t0) / 1000 / p.dur;
            const fr = () => {
                if (!c.alive()) return void ((done = true), ac.abort());
                const x = Math.min(1, k());
                st.querySelector('#cbsf').style.width = x * 100 + '%';
                st.querySelector('#cbbag').setAttribute('transform', `translate(0 ${x * 50})`);
                if (x >= 1) fin(0);
                else raf = requestAnimationFrame(fr);
            };
            raf = requestAnimationFrame(fr);
            const stop = () => {
                const x = k(),
                    mid = (p.a + p.b) / 2,
                    half = (p.b - p.a) / 2;
                fin(x >= p.a && x <= p.b ? 0.85 + 0.15 * (1 - Math.abs(x - mid) / half) : clamp(0.85 * (1 - (x < p.a ? p.a - x : x - p.b) / 0.3)));
            };
            st.querySelector('#cbrm').addEventListener(
                'pointerdown',
                e => {
                    e.stopPropagation();
                    stop();
                },
                { signal: ac.signal },
            );
            window.addEventListener(
                'keydown',
                e => {
                    if (e.code === 'Space') {
                        e.preventDefault();
                        stop();
                    }
                },
                { signal: ac.signal },
            );
        });
    },
    async whisk(p, c) {
        c.hint('Fouettez en tournant le doigt en rond');
        const st = c.stage;
        st.innerHTML = `<svg class="cb-layer" viewBox="0 0 300 300"><circle cx="150" cy="150" r="110" fill="#b9d96a" stroke="${INK}" stroke-width="6"/><circle cx="150" cy="150" r="80" fill="none" stroke="#fff8e8" stroke-width="4" stroke-dasharray="4 14" opacity=".7"/><g id="cbwk"><line x1="150" y1="150" x2="150" y2="60" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><line x1="150" y1="150" x2="150" y2="60" stroke="#fff8e8" stroke-width="4" stroke-linecap="round"/><circle cx="150" cy="60" r="12" fill="#f4b92e" stroke="${INK}" stroke-width="4"/></g></svg><div class="cb-bar"><i id="cbwf" style="width:0"></i></div><div class="cb-read" id="cbwt"></div>`;
        return new Promise(res => {
            const ac = new AbortController(),
                o = { signal: ac.signal };
            let prev = null,
                tot = 0,
                t0 = null,
                done = false,
                iv;
            const fin = () => {
                if (done) return;
                done = true;
                ac.abort();
                clearInterval(iv);
                res(clamp(tot / (Math.PI * 2 * p.turns)));
            };
            iv = setInterval(() => {
                if (!c.alive()) {
                    done = true;
                    ac.abort();
                    return clearInterval(iv);
                }
                if (t0 == null) return;
                const l = p.dur - (performance.now() - t0) / 1000;
                st.querySelector('#cbwt').textContent = Math.max(0, Math.ceil(l)) + ' s';
                if (l <= 0) fin();
            }, 100);
            st.addEventListener(
                'pointermove',
                e => {
                    const r = st.getBoundingClientRect(),
                        a = Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2));
                    if (prev != null && (e.buttons || e.pointerType === 'touch')) {
                        let d = a - prev;
                        if (d > Math.PI) d -= Math.PI * 2;
                        if (d < -Math.PI) d += Math.PI * 2;
                        tot += Math.abs(d);
                        if (t0 == null) t0 = performance.now();
                        st.querySelector('#cbwk').setAttribute('transform', `rotate(${(a * 180) / Math.PI + 90} 150 150)`);
                        st.querySelector('#cbwf').style.width = clamp(tot / (Math.PI * 2 * p.turns)) * 100 + '%';
                        if (tot >= Math.PI * 2 * p.turns) fin();
                    }
                    prev = a;
                },
                o,
            );
            st.addEventListener('pointerup', () => (prev = null), o);
        });
    },
};

// ---------------- la partie ----------------
// id : la boisson ; vid : le villageois qui attend (ou rien : pour le stock)
export function openBrew(id, vid) {
    if (!BREW[id] || !G.counterStart(id)) return;
    const me = ++run;
    const d = BREW[id];
    document.querySelector('.cb-over')?.remove();
    const o = document.createElement('div');
    o.className = 'cb-over';
    o.innerHTML = `<div class="cb-game"><div class="cb-top"><h2>${ITEMS[id].name}</h2><button class="btn sm" id="cbquit">Quitter</button></div>
        <div class="cb-counter"><div class="cb-cup">${cupSvg()}</div></div>
        <div class="cb-steps">${d.st.map(() => '<i class="cb-dot"></i>').join('')}</div>
        <div class="cb-hint" id="cbhint"></div>
        <div class="cb-stage" id="cbstage" tabindex="0"></div></div>`;
    document.body.appendChild(o);
    const close = () => {
        run++;
        window.removeEventListener('pointerup', unp);
        window.removeEventListener('pointercancel', unp);
        o.remove();
        refresh();
    };
    o.querySelector('#cbquit').onclick = close;
    const stage = o.querySelector('#cbstage');
    stage.addEventListener('contextmenu', e => e.preventDefault());
    stage.addEventListener('pointerdown', e => {
        stage.classList.add('press');
        const r = stage.getBoundingClientRect(),
            i = document.createElement('i');
        i.className = 'cb-rip';
        i.style.left = e.clientX - r.left + 'px';
        i.style.top = e.clientY - r.top + 'px';
        stage.appendChild(i);
        setTimeout(() => i.remove(), 480);
    });
    const unp = () => stage.classList.remove('press');
    window.addEventListener('pointerup', unp);
    window.addEventListener('pointercancel', unp);
    const layers = [];
    const cup = t => setCup(o, layers, t);
    cup();
    (async () => {
        // 1.43 : « Comment on joue ? » : les gestes de la boisson, puis un seul « Prêt ? Go ! »
        const kinds = [...new Set(d.st.map(x => x[0]))];
        stage.innerHTML = `<div class="cb-how"><b>Comment on joue ?</b>${d.st.map((x, k) => `<p><i>${k + 1}</i><span><b>${LBL[x[0]]}</b> : ${HOW[x[0]]}</span></p>`).join('')}<button class="btn gold" id="cbgo">C’est parti !</button></div>`;
        o.querySelector('#cbhint').textContent = `${d.st.length} geste${d.st.length > 1 ? 's' : ''} : ${kinds.map(k => LBL[k].toLowerCase()).join(', ')}`;
        await new Promise(r => (o.querySelector('#cbgo').onclick = r));
        if (me !== run) return;
        await ready({ stage });
        const scores = [];
        for (let i = 0; i < d.st.length; i++) {
            if (me !== run) return;
            o.querySelectorAll('.cb-dot').forEach((e, j) => (e.className = 'cb-dot' + (j < i ? ' done' : j === i ? ' on' : '')));
            const [kind, p] = d.st[i];
            const s = await STEP[kind](p, {
                layers,
                cup,
                stage,
                hint: t => {
                    const h = o.querySelector('#cbhint');
                    if (h) h.textContent = t;
                },
                alive: () => me === run,
            });
            if (me !== run) return;
            scores.push([kind, clamp(s)]);
            await wait(450);
        }
        window.removeEventListener('pointerup', unp);
        window.removeEventListener('pointercancel', unp);
        o.querySelectorAll('.cb-dot').forEach(e => (e.className = 'cb-dot done'));
        result(o, id, scores, vid, close);
    })();
}

function result(o, id, scores, vid, close) {
    const avg = scores.reduce((a, s) => a + s[1], 0) / scores.length;
    const st = avg >= 0.82 ? 3 : avg >= 0.55 ? 2 : 1;
    const who = vid && G.counterSeats().some(s => s.vid === vid && s.drink === id) ? vid : null;
    const res = document.createElement('div');
    res.className = 'cb-res-wrap';
    res.innerHTML = `<div class="cb-res" role="dialog" aria-label="Résultat"><h2>${st === 3 ? 'Parfait !' : st === 2 ? 'Bien servi' : 'À améliorer'}</h2><div class="cb-stars">${stars(st)}</div>
        <div class="cb-rows">${scores.map(s => `<div class="cb-row"><span>${LBL[s[0]]}</span><i>${Math.round(s[1] * 100)} %</i></div>`).join('')}
        ${who ? `<div class="cb-row"><span>${VILLAGERS[who].name} attend</span><i>${ico(['item', id])}</i></div>` : ''}</div>
        ${st === 3 && (G.ensureCounter().streak || 0) >= 1 ? `<p class="cb-streak">Série de boissons parfaites : <b>${G.ensureCounter().streak + 1}</b>${G.ensureCounter().streak + 1 > 1 ? ` · pourboire ×${(1 + 0.1 * Math.min(5, G.ensureCounter().streak)).toFixed(1).replace('.', ',')}` : ''}</p>` : st < 3 && (G.ensureCounter().streak || 0) >= 2 ? `<p class="cb-streak lost">Série de ${G.ensureCounter().streak} parfaites interrompue</p>` : ''}
        <div class="cb-acts">${who ? '<button class="btn gold" id="cbkeep">Au stock</button><button class="btn green" id="cbserve">Servir</button>' : '<button class="btn green" id="cbkeep">Ranger au stock</button>'}</div></div>`;
    o.appendChild(res);
    sfx(st === 3 ? 'golden' : 'harvest');
    const done = (b, target) => {
        G.counterFinish(id, st, target, b);
        return true;
    };
    res.querySelector('#cbkeep').onclick = e => {
        done(e.currentTarget, null);
        close();
    };
    const sv = res.querySelector('#cbserve');
    if (sv)
        sv.onclick = e => {
            done(e.currentTarget, who);
            close();
        };
}
