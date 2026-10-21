// Les mini-jeux du haras (1.23.2) : le galop et le saut, en plein écran. La règle est dans systems/horsegames.js.
import * as G from '../systems/index.js';
import { GALOP, SAUT, DISC } from '../data/haras.js';
import { horsePose, OBST, obstFault, MG } from '../art/v1232mg.js';
import { genWrap } from './genlook.js';
import { sfx, buzz } from '../core/bus.js';
import { refresh } from './app.js';
import { reduceMotion } from './fx.js';

const INK = '#3a2618';
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const fmtT = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
const SILKS = ['#c8453a', '#3f6fb5', '#2f9e8f', '#8e5bc0', '#e08a2f'];
const silksOf = a => SILKS[(a.uid.length + (a.name || 'x').charCodeAt(0)) % SILKS.length];
let run = 0;

// ---------------- les morceaux de dessin ----------------
const T = (x, y, s, t, o = {}) =>
    `<text x="${x}" y="${y}" font-size="${s}" font-weight="900" text-anchor="${o.a || 'middle'}" fill="${o.c || INK}" font-family="Nunito,system-ui,sans-serif"${o.st ? ` stroke="${INK}" stroke-width="${o.sw || 4}" paint-order="stroke" stroke-linejoin="round"` : ''}${o.id ? ` id="${o.id}"` : ''}>${t}</text>`;
const at = (inner, x, y, s = 1, id = '') => `<g${id ? ` id="${id}"` : ''} transform="translate(${x} ${y}) scale(${s})">${inner}</g>`;
const rect = (x, y, w, h, r, f, sw = 2.4) =>
    `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${f}"${sw ? ` stroke="${INK}" stroke-width="${sw}"` : ''}/>`;
const line = (d, w = 2.4, c = INK) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const circ = (x, y, r, f, sw = 2) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}"${sw ? ` stroke="${INK}" stroke-width="${sw}"` : ''}/>`;
const defs =
    '<defs><linearGradient id="hgsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8fd3f4"/><stop offset="1" stop-color="#f4f9dc"/></linearGradient></defs>';
const cloud = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})"><ellipse rx="26" ry="9" fill="#fff"/><ellipse cx="-14" cy="4" rx="16" ry="8" fill="#fff"/><ellipse cx="16" cy="4" rx="18" ry="8" fill="#fff"/></g>`;
const tree = (x, y, s = 1) =>
    `<g transform="translate(${x} ${y}) scale(${s})">${line('M0 0 L0 -14', 5, '#7a4a2a')}${circ(0, -22, 12, '#5fa84a')}${circ(-7, -17, 8, '#6cc04a')}${circ(8, -16, 8, '#6cc04a')}</g>`;
const railTile = (x, y, h = 16) => {
    let o =
        line(`M${x} ${y - h + 4} L${x + 360} ${y - h + 4} M${x} ${y - h / 2 + 2} L${x + 360} ${y - h / 2 + 2}`, 6) +
        line(`M${x} ${y - h + 4} L${x + 360} ${y - h + 4} M${x} ${y - h / 2 + 2} L${x + 360} ${y - h / 2 + 2}`, 3, '#fff');
    for (let k = 0; k < 9; k++)
        o += line(`M${x + k * 40 + 20} ${y} L${x + k * 40 + 20} ${y - h}`, 5) + line(`M${x + k * 40 + 20} ${y} L${x + k * 40 + 20} ${y - h}`, 2.4, '#fff');
    return o;
};
// une tuile de décor lointain qui se raccorde à elle-même (début et fin à la même hauteur)
const farTile = (x, tribune) =>
    `<g transform="translate(${x} 0)"><path d="M0 205 Q60 190 130 215 Q200 180 270 210 Q330 190 360 205 L360 300 L0 300Z" fill="#8bc86b" stroke="${INK}" stroke-width="2.4"/>${[30, 80, 150, 210, 300].map((tx, i) => tree(tx, 252 + (i % 2) * 6, 0.9 + (i % 3) * 0.12)).join('')}${
        tribune
            ? rect(236, 214, 100, 42, 3, '#e8d6aa', 2.2) +
              `<path d="M232 216 L240 196 L332 196 L340 216Z" fill="#4f7aa8" stroke="${INK}" stroke-width="2.2"/>` +
              Array.from({ length: 10 }, (_, k) =>
                  circ(244 + k * 9.4, 232 + (k % 2) * 6, 3, ['#e8364b', '#ffd23f', '#fff', '#3f6fb5', '#f59ab1'][k % 5], 0),
              ).join('')
            : ''
    }</g>`;
const dashTile = (x, ys) =>
    `<g transform="translate(${x} 0)">${ys.map((y, i) => line(`M${20 + i * 70} ${y} l24 0 M${200 + i * 50} ${y + 14} l24 0`, 3, 'rgba(255,255,255,.5)')).join('')}</g>`;
const mg = (k, x, y, s = 1) => at(MG[k](), x, y, s);
const gauge = v => {
    const x0 = 30,
        w = 300,
        y = 468,
        [a, b] = GALOP.zone;
    return (
        rect(x0, y, w, 24, 12, '#fff7e0', 2.8) +
        line(`M${x0 + 14} ${y + 12} L${x0 + a * w - 8} ${y + 12}`, 5, '#e8c26a') +
        `<rect x="${x0 + a * w}" y="${y + 2}" width="${(b - a) * w}" height="20" rx="9" fill="#6cc04a" stroke="${INK}" stroke-width="1.6"/>` +
        line(`M${x0 + b * w + 8} ${y + 12} L${x0 + w - 14} ${y + 12}`, 5, '#e07a3f') +
        `<path id="hgneedle" d="M${x0 + v * w - 7} ${y - 8} L${x0 + v * w + 7} ${y - 8} L${x0 + v * w} ${y + 4}Z" fill="#c8453a" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>`
    );
};
const ovalPos = t => {
    const a = t * Math.PI * 2 - Math.PI / 2;
    return [Math.cos(a) * 34, Math.sin(a) * 15];
};
const hudBox = inner => rect(8, 8, 344, 52, 14, 'rgba(255,247,224,.94)', 2.8) + inner;
const horseFrame = (pose, silks, rot = 0) => `<g transform="rotate(${rot} 36 44)">${horsePose(pose, { rider: silks })}</g>`;

// ---------------- l'écran ----------------
function shell(title) {
    document.querySelector('.hg-over')?.remove();
    const o = document.createElement('div');
    o.className = 'hg-over';
    o.innerHTML = `<div class="hg-game"><div class="hg-top"><h2>${title}</h2><button class="btn sm" id="hgquit">Quitter</button></div><div class="hg-stage" id="hgstage" tabindex="0"></div></div>`;
    document.body.appendChild(o);
    const stage = o.querySelector('#hgstage');
    stage.addEventListener('contextmenu', e => e.preventDefault());
    return { o, stage, q: sel => o.querySelector(sel) };
}

// le panneau d'ouverture : choisir de jouer ou de faire une séance rapide
export function openHorseGame(uid, d, el) {
    const a = G.horseByUid(uid);
    if (!a || !a.box || !G.hasGame(d)) return;
    if (!G.canTrain(a)) return void G.trainHorse(uid, d, el); // fatigué, en randonnée ou au plafond : le message s'affiche
    const me = ++run;
    const { o, stage, q } = shell(`${DISC[d].name} · ${a.name}`);
    const close = () => {
        run++;
        o.remove();
        refresh();
    };
    q('#hgquit').onclick = close;
    const cap = G.aptCap(a, d),
        pts = G.aptOf(a, d);
    stage.innerHTML = `<div class="hg-intro">
        <div class="hg-hart">${genWrap(`<svg viewBox="0 0 80 80" class="spr">${horsePose(d === 'saut' ? 'jump1' : 'galB', { rider: silksOf(a) })}</svg>`, a.g)}</div>
        <p class="hg-rules">${
            d === 'galop'
                ? 'Tenez le doigt pour accélérer, relâchez pour ralentir. À l’entrée de chaque virage, l’aiguille doit être dans le <b>vert</b>. Dans la dernière ligne droite, filez !'
                : 'Un anneau se resserre sur la cible. Appuyez quand il touche le <b>vert</b> pour un saut parfait. Huit obstacles, trois fautes et c’est fini.'
        }</p>
        <p class="hg-sub">${DISC[d].name} : ${pts}/${cap} · la séance coûte 1 de forme dès le départ.</p>
        <div class="hg-btns"><button class="btn gold" id="hgplay">Jouer</button><button class="btn" id="hgquick">Séance rapide</button></div>
        <small>Séance rapide : un score moyen, sans jouer.</small></div>`;
    q('#hgquick').onclick = () => {
        G.trainHorse(uid, d, el);
        close();
    };
    q('#hgplay').onclick = () => {
        if (me !== run) return;
        if (!G.startTrain(uid, d)) return close();
        (d === 'galop' ? playGalop : playSaut)({ a, d, o, stage, q, me, close, el, uid });
    };
}

// le panneau de fin : points gagnés
function finish(c, score, lines) {
    const n = score >= 0.85 ? 3 : score >= 0.6 ? 2 : score >= 0.3 ? 1 : 0;
    const gain = G.endTrain(c.uid, c.d, c.el, score);
    sfx(n >= 2 ? 'level' : 'pop');
    buzz(18);
    const star = on =>
        `<svg viewBox="0 0 40 40"><path d="M20 3l5 11 12 1.5-9 8 2.5 12L20 29l-10.5 6.5L12 23.5l-9-8L15 14z" fill="${on ? '#f4b92e' : '#efe3c8'}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/></svg>`;
    const box = document.createElement('div');
    box.className = 'hg-result';
    box.innerHTML = `<h3>${n >= 3 ? 'Magnifique !' : n === 2 ? 'Belle séance' : n === 1 ? 'Séance honnête' : 'On fera mieux'}</h3><div class="hg-stars">${[1, 2, 3].map(i => star(i <= n)).join('')}</div>
        ${lines.map(l => `<p>${l}</p>`).join('')}<p class="hg-gain">${gain ? `+${gain} point${gain > 1 ? 's' : ''} de ${DISC[c.d].name.toLowerCase()}` : 'Plafond atteint'}</p><button class="btn gold" id="hgdone">Terminer</button>`;
    c.stage.appendChild(box);
    c.q('#hgdone').onclick = c.close;
}

// ---------------- le galop ----------------
function playGalop(c) {
    const { a, stage, q, me } = c;
    const silks = silksOf(a);
    const g = G.newGalop();
    const calm = reduceMotion();
    const frames = ['galA', 'galB', 'galC', 'galB'].map(p => horseFrame(p, silks));
    stage.innerHTML = `<svg viewBox="0 0 360 520" class="hg-svg">${defs}${rect(0, 0, 360, 520, 0, 'url(#hgsky)', 0)}${cloud(70, 130)}${cloud(260, 104, 0.8)}
        <g id="hgfar">${farTile(0, true)}${farTile(360, false)}${farTile(720, true)}</g>
        <rect x="0" y="296" width="360" height="40" fill="#6cc04a" stroke="${INK}" stroke-width="2.4"/><g id="hgrail">${railTile(0, 336)}${railTile(360, 336)}</g>
        <rect x="0" y="336" width="360" height="128" fill="#d9b57a" stroke="${INK}" stroke-width="2.4"/><g id="hgdash">${dashTile(0, [366, 398, 430])}${dashTile(360, [366, 398, 430])}</g>
        <rect x="0" y="464" width="360" height="56" fill="#5fa84a" stroke="${INK}" stroke-width="2.4"/>
        <g id="hgfin" transform="translate(500 270) scale(1.6)">${MG.arrivee()}</g><g id="hgsign" transform="translate(500 290) scale(1.3)">${MG.virage()}</g>
        <g id="hgspeed" opacity="0">${line('M20 352 L-20 352 M26 368 L-10 368 M16 384 L-30 384', 3.2, 'rgba(255,255,255,.8)')}</g>
        <g id="hgdust" opacity=".7"></g>
        <g transform="translate(140 352) scale(2.5) translate(-40 -44)"><g id="hgh">${frames[1]}</g></g>
        ${hudBox(`<g id="hgoval" transform="translate(60 34)"><ellipse rx="42" ry="20" fill="#d9b57a" stroke="${INK}" stroke-width="2.6"/><ellipse rx="26" ry="9" fill="#6cc04a" stroke="${INK}" stroke-width="2.2"/>${line('M0 -20 L0 -9', 2.6, '#c8453a')}${Array.from({ length: GALOP.rivals }, (_, i) => `<circle id="hgr${i}" r="3.4" fill="#b9b3a6" stroke="${INK}" stroke-width="1.4"/>`).join('')}<circle id="hgme" r="5" fill="#ffd23f" stroke="${INK}" stroke-width="2"/></g>${T(190, 28, 12, 'Place')}${T(190, 50, 22, '1 / 6', { id: 'hgrank' })}${mg('chrono', 270, 11, 0.6)}${T(332, 46, 17, '0:00', { id: 'hgtime' })}`)}
        <g id="hgwarn" opacity="0">${rect(40, 70, 280, 38, 19, '#ffd23f', 2.8)}${T(180, 95, 18, 'Virage !', { id: 'hgwtxt' })}</g>
        <g id="hgmsg" opacity="0">${T(180, 200, 28, '', { id: 'hgmtxt', c: '#fff', st: 1, sw: 6 })}</g>
        ${gauge(g.v)}${T(180, 514, 12, 'Maintenez : accélérer · Relâchez : ralentir', { c: '#fff', st: 1, sw: 3.4 })}
        <g id="hgcount"></g></svg>`;
    const $ = id => q('#' + id);
    const horse = $('hgh'),
        needle = $('hgneedle'),
        far = $('hgfar'),
        rail = $('hgrail'),
        dash = $('hgdash'),
        sign = $('hgsign'),
        fin = $('hgfin'),
        warn = $('hgwarn'),
        msg = $('hgmsg'),
        speed = $('hgspeed');
    let fr = 0,
        frT = 0,
        offF = 0,
        offR = 0,
        offD = 0,
        msgT = 0,
        last = performance.now(),
        started = false,
        cd = 3;
    // départ : 3, 2, 1
    const down = () => (g.hold = true);
    const up = () => (g.hold = false);
    stage.addEventListener('pointerdown', e => {
        e.preventDefault();
        down();
    });
    const keyd = e => e.code === 'Space' && (e.preventDefault(), down());
    const keyu = e => e.code === 'Space' && up();
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    window.addEventListener('keydown', keyd);
    window.addEventListener('keyup', keyu);
    const cleanup = () => {
        window.removeEventListener('pointerup', up);
        window.removeEventListener('pointercancel', up);
        window.removeEventListener('keydown', keyd);
        window.removeEventListener('keyup', keyu);
    };
    const origClose = c.close;
    q('#hgquit').onclick = () => {
        cleanup();
        origClose();
    };
    const count = $('hgcount');
    const say = (t, secs = 1) => {
        $('hgmtxt').textContent = t;
        msg.setAttribute('opacity', 1);
        msgT = secs;
    };
    const loop = now => {
        if (me !== run) return cleanup();
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        if (!started) {
            cd -= dt;
            count.innerHTML = T(180, 250, 90, String(Math.max(1, Math.ceil(cd))), { c: '#fff', st: 1, sw: 9 });
            if (cd <= 0) {
                started = true;
                count.innerHTML = '';
                say('Go !', 0.6);
            }
            return requestAnimationFrame(loop);
        }
        const before = g.turnsDone.length;
        G.stepGalop(g, dt);
        if (g.turnsDone.length > before) {
            const s = g.turnsDone[g.turnsDone.length - 1];
            say(s >= 0.85 ? 'Parfait !' : s >= 0.5 ? 'Bien négocié' : g.v > GALOP.zone[1] ? 'Trop vite !' : 'Trop lent !', 1.1);
            sfx(s >= 0.5 ? 'pop' : 'error');
        }
        const rate = G.galopRate(g.v);
        offF = (offF + rate * 0.45 * dt * 3) % 360;
        offR = (offR + rate * 2.4 * dt) % 360;
        offD = (offD + rate * 3.6 * dt) % 360;
        far.setAttribute('transform', `translate(${-offF} 0)`);
        rail.setAttribute('transform', `translate(${-offR} 0)`);
        dash.setAttribute('transform', `translate(${-offD} 0)`);
        frT += dt * (4 + g.v * 9);
        const f = calm ? 1 : Math.floor(frT) % 4;
        if (f !== fr) {
            fr = f;
            horse.innerHTML = frames[f];
        }
        speed.setAttribute('opacity', calm ? 0 : clamp((g.v - 0.4) * 1.6));
        // le panneau de virage, annoncé quelques secondes avant
        const ahead = G.galopTurnAhead(g);
        const win = rate * GALOP.warn;
        if (ahead != null && ahead < win) {
            sign.setAttribute('transform', `translate(${40 + (ahead / win) * 330} 290) scale(1.3)`);
            warn.setAttribute('opacity', 1);
            $('hgwtxt').textContent = `Virage dans ${Math.max(1, Math.ceil(ahead / rate))} s !`;
        } else {
            sign.setAttribute('transform', 'translate(500 290) scale(1.3)');
            const spr = g.dist >= GALOP.length - GALOP.sprint;
            warn.setAttribute('opacity', spr ? 1 : 0);
            if (spr) $('hgwtxt').textContent = 'Sprint ! Tenez le doigt !';
        }
        const remain = GALOP.length - g.dist;
        fin.setAttribute('transform', `translate(${remain < 180 ? 120 + remain * 2 : 500} 270) scale(1.6)`);
        needle.setAttribute('transform', `translate(${(g.v - 0.3) * 300} 0)`);
        // la mini-piste
        const [mx, my] = ovalPos(g.dist / GALOP.length);
        const me2 = $('hgme');
        me2.setAttribute('cx', mx);
        me2.setAttribute('cy', my);
        g.rivalDist.forEach((d, i) => {
            const [rx, ry] = ovalPos(Math.min(1, d / GALOP.length));
            const r = $('hgr' + i);
            r.setAttribute('cx', rx);
            r.setAttribute('cy', ry);
        });
        $('hgrank').textContent = `${G.galopRank(g)} / ${GALOP.rivals + 1}`;
        $('hgtime').textContent = fmtT(g.t);
        if (msgT > 0) {
            msgT -= dt;
            if (msgT <= 0) msg.setAttribute('opacity', 0);
        }
        if (g.done) {
            cleanup();
            stage.querySelector('.hg-svg') &&
                finish(c, G.galopScore(g), [
                    `Place : ${G.galopRank(g)} sur ${GALOP.rivals + 1}`,
                    `Virages : ${g.turnsDone.map(s => (s >= 0.85 ? 'parfait' : s >= 0.5 ? 'bien' : 'raté')).join(', ')}`,
                    `Temps : ${fmtT(g.t)}`,
                ]);
            return;
        }
        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
}

// ---------------- le saut ----------------
const GROUND = 340;
function playSaut(c) {
    const { a, stage, q, me } = c;
    const silks = silksOf(a);
    const s = G.newSaut();
    const calm = reduceMotion();
    const run3 = ['galA', 'galB', 'galC', 'galB'].map(p => horseFrame(p, silks));
    const jf = { up: horseFrame('jumpUp', silks, -12), land: horseFrame('jumpLand', silks, 8), pre: horseFrame('jump1', silks) };
    const obst = i => OBST[G.sautSeq(i)]();
    const faultSvg = obstFault().replace(/<svg[^>]*>|<\/svg>/g, '');
    stage.innerHTML = `<svg viewBox="0 0 360 520" class="hg-svg">${defs}${rect(0, 0, 360, 520, 0, 'url(#hgsky)', 0)}${cloud(90, 130)}${cloud(280, 150, 0.8)}
        <g id="hgfar">${farTile(0, false)}${farTile(360, false)}${farTile(720, false)}</g>
        <g>${line('M0 270 Q90 292 180 270 T360 270', 2)}${[24, 74, 124, 176, 226, 276, 326].map((x, i) => `<path d="M${x} ${i % 2 ? 276 : 272} l8 0 l-4 12Z" fill="${['#e8364b', '#ffd23f', '#3f6fb5'][i % 3]}" stroke="${INK}" stroke-width="1.4"/>`).join('')}</g>
        <g id="hgrail">${railTile(0, 318, 18)}${railTile(360, 318, 18)}</g>
        <rect x="0" y="318" width="360" height="146" fill="#e0c48a" stroke="${INK}" stroke-width="2.4"/><g id="hgdash">${dashTile(0, [350, 372, 420])}${dashTile(360, [350, 372, 420])}</g>
        <rect x="0" y="464" width="360" height="56" fill="#5fa84a" stroke="${INK}" stroke-width="2.4"/>
        <g id="hgring" opacity="0" transform="translate(150 414)"><ellipse rx="${130 * (SAUT.target + 0.17)}" ry="${34 * (SAUT.target + 0.17)}" fill="rgba(108,192,74,.55)"/><ellipse rx="${130 * (SAUT.target + 0.07)}" ry="${34 * (SAUT.target + 0.07)}" fill="rgba(255,210,63,.9)"/><ellipse rx="${130 * (SAUT.target - 0.07)}" ry="${34 * (SAUT.target - 0.07)}" fill="rgba(255,247,224,.9)"/><ellipse id="hgrr" rx="130" ry="34" fill="rgba(255,255,255,.15)" stroke="#fff" stroke-width="4"/></g>
        <g id="hgob" transform="translate(500 287) scale(1.6)">${obst(0)}</g>
        <g id="hgh" transform="translate(110 ${GROUND}) scale(2) translate(-40 -44)">${run3[1]}</g>
        ${hudBox(`${at(MG.plan(), 10, 4, 0.8)}${T(120, 28, 12, 'Obstacle')}${T(120, 50, 22, `1 / ${SAUT.obstacles}`, { id: 'hgn' })}${T(206, 28, 12, 'Fautes')}${Array.from({ length: SAUT.maxFaults }, (_, k) => `<g id="hgf${k}">${circ(186 + k * 26, 46, 9, '#fff7e0', 2.4)}</g>`).join('')}${mg('chrono', 270, 11, 0.6)}${T(332, 46, 17, '0:00', { id: 'hgtime' })}`)}
        <g id="hgmsg" opacity="0">${at(MG.parfait(), 148, 90, 1, 'hgmicon')}${T(180, 192, 30, '', { id: 'hgmtxt', c: '#ffd23f', st: 1, sw: 6 })}</g>
        ${rect(30, 478, 300, 30, 15, '#fff7e0', 2.8)}${T(180, 499, 13, 'Appuyez quand l’anneau touche le vert !', { id: 'hghint' })}<g id="hgcount"></g></svg>`;
    const $ = id => q('#' + id);
    const horse = $('hgh'),
        ob = $('hgob'),
        ring = $('hgring'),
        rr = $('hgrr'),
        msg = $('hgmsg'),
        far = $('hgfar'),
        rail = $('hgrail'),
        dash = $('hgdash');
    // l'état de la mise en scène
    let phase = 'count',
        pt = 0,
        total = 0,
        tapT = null,
        verdict = null,
        msgT = 0,
        offF = 0,
        offR = 0,
        offD = 0,
        fr = 0,
        frT = 0,
        last = performance.now();
    const APPROACH = 1.1,
        FLIGHT = 0.95,
        LAND = 0.55;
    const ac = new AbortController();
    const tap = () => {
        if (phase === 'ring' && tapT == null) tapT = pt;
    };
    stage.addEventListener(
        'pointerdown',
        e => {
            e.preventDefault();
            tap();
        },
        { signal: ac.signal },
    );
    const keyd = e => e.code === 'Space' && (e.preventDefault(), tap());
    window.addEventListener('keydown', keyd, { signal: ac.signal });
    const origClose = c.close;
    q('#hgquit').onclick = () => {
        ac.abort();
        origClose();
    };
    const setPhase = p => {
        phase = p;
        pt = 0;
    };
    const showMsg = (text, color, icon) => {
        $('hgmtxt').textContent = text;
        $('hgmtxt').setAttribute('fill', color);
        $('hgmicon').innerHTML = MG[icon]();
        msg.setAttribute('opacity', 1);
        msgT = 1.4;
    };
    const setFaults = () => {
        for (let k = 0; k < SAUT.maxFaults; k++)
            $('hgf' + k).innerHTML =
                k < s.faults
                    ? circ(186 + k * 26, 46, 9, '#c8453a', 2.4) + line(`M${182 + k * 26} 42 l8 8 M${190 + k * 26} 42 l-8 8`, 2.4, '#fff')
                    : circ(186 + k * 26, 46, 9, '#fff7e0', 2.4);
    };
    const place = (x, y, rot) => horse.setAttribute('transform', `translate(${x} ${y}) rotate(${rot}) scale(2) translate(-40 -44)`);
    const next = () => {
        ob.innerHTML = obst(s.i);
        $('hgn').textContent = `${Math.min(s.i + 1, SAUT.obstacles)} / ${SAUT.obstacles}`;
        tapT = null;
        verdict = null;
        setPhase('approach');
    };
    const loop = now => {
        if (me !== run) return ac.abort();
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        pt += dt;
        total += phase === 'count' ? 0 : dt;
        $('hgtime').textContent = fmtT(total);
        const moving = phase === 'approach' || phase === 'ring';
        if (moving) {
            offF = (offF + 40 * dt) % 360;
            offR = (offR + 150 * dt) % 360;
            offD = (offD + 230 * dt) % 360;
            far.setAttribute('transform', `translate(${-offF} 0)`);
            rail.setAttribute('transform', `translate(${-offR} 0)`);
            dash.setAttribute('transform', `translate(${-offD} 0)`);
            frT += dt * 9;
            const f = calm ? 1 : Math.floor(frT) % 4;
            if (f !== fr) {
                fr = f;
                horse.firstElementChild.innerHTML = run3[f];
            }
        }
        if (phase === 'count') {
            const n = Math.max(1, Math.ceil(2 - pt));
            $('hgcount').innerHTML = T(180, 250, 90, String(n), { c: '#fff', st: 1, sw: 9 });
            if (pt >= 2) {
                $('hgcount').innerHTML = '';
                next();
            }
        } else if (phase === 'approach') {
            const k = clamp(pt / APPROACH);
            ob.setAttribute('transform', `translate(${500 - (500 - 205) * (1 - (1 - k) * (1 - k))} 287) scale(1.6)`);
            if (pt >= APPROACH) {
                setPhase('ring');
                rr.setAttribute('rx', 130);
                rr.setAttribute('ry', 34);
                ring.setAttribute('opacity', 1);
            }
        } else if (phase === 'ring') {
            const dur = G.sautDur(s.i);
            const r = G.ringAt(s.i, pt);
            rr.setAttribute('rx', 130 * r);
            rr.setAttribute('ry', 34 * r);
            if (tapT != null || pt >= dur + 0.15) {
                verdict = G.judgeJump(s.i, tapT);
                ring.setAttribute('opacity', 0);
                horse.firstElementChild.innerHTML = jf.pre;
                sfx(verdict === 'faute' ? 'error' : 'pop');
                setPhase('flight');
            }
        } else if (phase === 'flight') {
            const k = clamp(pt / FLIGHT);
            const high = verdict === 'faute' ? 45 : verdict === 'bon' ? 90 : 105;
            place(110, GROUND + 28 - Math.sin(k * Math.PI) * high, 0);
            horse.firstElementChild.innerHTML = k < 0.15 ? jf.pre : k < 0.62 ? jf.up : jf.land;
            ob.setAttribute('transform', `translate(${205 - 440 * k} 287) scale(1.6)`);
            if (k > 0.42 && verdict === 'faute' && ob.dataset.fault !== String(s.i)) {
                ob.dataset.fault = String(s.i);
                ob.innerHTML = faultSvg;
                buzz(20);
            }
            if (pt >= FLIGHT) {
                G.recordJump(s, verdict);
                setFaults();
                if (verdict === 'parfait') showMsg('PARFAIT !', '#ffd23f', 'parfait');
                else if (verdict === 'bon') showMsg('Bien sauté', '#fff', 'bon');
                else showMsg('Barre tombée', '#fff', 'faute');
                place(110, GROUND + 28, 0);
                horse.firstElementChild.innerHTML = run3[2];
                setPhase('land');
            }
        } else if (phase === 'land') {
            if (pt >= LAND) {
                if (s.done) {
                    ac.abort();
                    return finish(c, G.sautScore(s), [
                        s.eliminated ? 'Éliminé : trop de fautes' : `Parcours terminé : ${s.faults} faute${s.faults > 1 ? 's' : ''}`,
                        `${s.results.filter(v => v === 'parfait').length} saut${s.results.filter(v => v === 'parfait').length > 1 ? 's' : ''} parfait${s.results.filter(v => v === 'parfait').length > 1 ? 's' : ''} sur ${s.results.length}`,
                        `Temps : ${fmtT(total)}`,
                    ]);
                }
                place(110, GROUND, 0);
                next();
            }
        }
        if (msgT > 0) {
            msgT -= dt;
            if (msgT <= 0) msg.setAttribute('opacity', 0);
        }
        requestAnimationFrame(loop);
    };
    place(110, GROUND, 0);
    requestAnimationFrame(loop);
}
