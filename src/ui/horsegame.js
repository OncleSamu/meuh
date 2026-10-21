// Les mini-jeux du haras (1.23.2 et 1.23.3) : le galop, le saut, le dressage et le raid, en plein écran. La règle est dans systems/horsegames.js.
import * as G from '../systems/index.js';
import { GALOP, SAUT, DISC, DRESSAGE, RAID } from '../data/haras.js';
import { horsePose, OBST, obstFault, MG } from '../art/v1232mg.js';
import { endurancePose, topHorse, GAIT, TERRAIN, TCOL } from '../art/v1233mg.js';
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

const RULES = {
    galop: 'Tenez le doigt pour accélérer, relâchez pour ralentir. À l’entrée de chaque virage, l’aiguille doit être dans le <b>vert</b>. Dans la dernière ligne droite, filez !',
    saut: 'Un anneau se resserre sur la cible. Appuyez quand il touche le <b>vert</b> pour un saut parfait. Huit obstacles, trois fautes et c’est fini.',
    dressage:
        'Quatre figures dans le manège. Posez le doigt sur le <b>point de départ</b> puis suivez le tracé sans lâcher : précision, régularité et tracé complet font la note.',
    endurance:
        'Trois étapes, trois terrains. Choisissez l’allure : <b>pas</b>, <b>trot</b> ou <b>galop</b>. Un pouls trop haut ralentit le cheval, et le vétérinaire contrôle à chaque étape.',
};
const introArt = (d, a, silks) =>
    genWrap(
        d === 'dressage'
            ? `<svg viewBox="0 -6 64 80" class="spr">${topHorse()}</svg>`
            : `<svg viewBox="0 0 80 80" class="spr">${d === 'endurance' ? endurancePose('walkA') : horsePose(d === 'saut' ? 'jump1' : 'galB', { rider: silks })}</svg>`,
        a.g,
    );

// le panneau d'ouverture : choisir de jouer ou de faire une séance rapide
export function openHorseGame(uid, d, el, mode = null) {
    const a = G.horseByUid(uid);
    if (!a || !a.box || !G.hasGame(d)) return;
    if (!G.canTrain(a)) return void (mode ? G.startPass(uid) : G.trainHorse(uid, d, el)); // fatigué, en randonnée ou au plafond : le message s'affiche
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
        <div class="hg-hart">${introArt(d, a, silksOf(a))}</div>
        <p class="hg-rules">${RULES[d]}</p>
        <p class="hg-sub">${mode ? `Passage de concours : ${DISC[d].name.toLowerCase()} ${pts}/${cap} · il coûte 1 de forme et compte pour la note.` : `${DISC[d].name} : ${pts}/${cap} · la séance coûte 1 de forme dès le départ.`}</p>
        <div class="hg-btns"><button class="btn gold" id="hgplay">Jouer</button>${mode ? '' : '<button class="btn" id="hgquick">Séance rapide</button>'}</div>
        ${mode ? '' : '<small>Séance rapide : un score moyen, sans jouer.</small>'}</div>`;
    if (!mode)
        q('#hgquick').onclick = () => {
            G.trainHorse(uid, d, el);
            close();
        };
    q('#hgplay').onclick = () => {
        if (me !== run) return;
        if (!(mode === 'show' ? G.startShowPass(uid) : mode === 'gp' ? G.startGpPass(uid, d) : G.startTrain(uid, d))) return close();
        ({ galop: playGalop, saut: playSaut, dressage: playDressage, endurance: playRaid })[d]({ a, d, o, stage, q, me, close, el, uid, mode });
    };
}

// le panneau de fin : points gagnés
function finish(c, score, lines) {
    const n = score >= 0.85 ? 3 : score >= 0.6 ? 2 : score >= 0.3 ? 1 : 0;
    const note = c.mode === 'show' ? G.endShowPass(c.uid, score) : c.mode === 'gp' ? G.endGpPass(c.uid, c.d, score) : null;
    const gain = c.mode ? 0 : G.endTrain(c.uid, c.d, c.el, score);
    sfx(n >= 2 ? 'level' : 'pop');
    buzz(18);
    const star = on =>
        `<svg viewBox="0 0 40 40"><path d="M20 3l5 11 12 1.5-9 8 2.5 12L20 29l-10.5 6.5L12 23.5l-9-8L15 14z" fill="${on ? '#f4b92e' : '#efe3c8'}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/></svg>`;
    const box = document.createElement('div');
    box.className = 'hg-result';
    box.innerHTML = `<h3>${n >= 3 ? 'Magnifique !' : n === 2 ? 'Belle séance' : n === 1 ? 'Séance honnête' : 'On fera mieux'}</h3><div class="hg-stars">${[1, 2, 3].map(i => star(i <= n)).join('')}</div>
        ${lines.map(l => `<p>${l}</p>`).join('')}<p class="hg-gain">${c.mode ? `Passage : ${Math.round(score * 100)}/100 · note du concours ${note ? note.note.toFixed(1).replace('.', ',') : ''}` : gain ? `+${gain} point${gain > 1 ? 's' : ''} ${/^[aeiouéè]/i.test(DISC[c.d].name) ? 'd’' : 'de '}${DISC[c.d].name.toLowerCase()}` : 'Plafond atteint'}</p><button class="btn gold" id="hgdone">Terminer</button>`;
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

// ---------------- le dressage ----------------
const LETTERS = [
    ['C', 180, 66],
    ['A', 180, 452],
    ['K', 28, 150],
    ['F', 332, 150],
    ['B', 28, 260],
    ['E', 332, 260],
    ['P', 28, 370],
    ['M', 332, 370],
];
const toPath = pts => 'M' + pts.map(p => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L');
const horseTop = (id, x, y, rot, k = 1.1) => `<g id="${id}" transform="translate(${x} ${y}) rotate(${rot}) scale(${k}) translate(-32 -32)">${topHorse()}</g>`;
function playDressage(c) {
    const { stage, q, me } = c;
    const d = G.newDressage();
    const arena =
        rect(0, 0, 360, 520, 0, '#8bc86b', 0) +
        rect(24, 70, 312, 380, 14, '#e0c48a', 3) +
        `<rect x="34" y="80" width="292" height="360" rx="8" fill="none" stroke="rgba(255,255,255,.7)" stroke-width="1.6"/>` +
        Array.from({ length: 13 }, (_, k) =>
            line(`M${44 + (k % 2) * 30} ${100 + k * 26} l50 0 M${236 + (k % 2) * 20} ${108 + k * 26} l50 0`, 2, 'rgba(160,120,60,.35)'),
        ).join('') +
        LETTERS.map(([l, x, y]) => rect(x - 12, y - 13, 24, 22, 4, '#fff', 2.2) + T(x, y + 3, 14, l)).join('') +
        `<path d="M180 90 L180 430" stroke="rgba(255,255,255,.55)" stroke-width="1.8" stroke-dasharray="3 7"/>`;
    stage.innerHTML = `<svg viewBox="0 0 360 520" class="hg-svg" style="touch-action:none">${defs}${arena}
        <path id="hdguide" d="" fill="none" stroke="rgba(255,255,255,.6)" stroke-width="12" stroke-linecap="round" stroke-linejoin="round"/>
        <path id="hdguide2" d="" fill="none" stroke="#c8453a" stroke-width="4" stroke-linecap="round" stroke-dasharray="2 10"/>
        <path id="hddone" d="" fill="none" stroke="${INK}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
        <path id="hddone2" d="" fill="none" stroke="#ffd23f" stroke-width="4.4" stroke-linecap="round" stroke-linejoin="round"/>
        <g id="hdflag"></g>${horseTop('hdh', 180, 430, 0)}
        ${hudBox(`${T(60, 28, 12, 'Figure')}${T(60, 52, 20, '1 / 4', { id: 'hdn' })}${T(190, 28, 12, 'Volte', { id: 'hdname' })}${rect(145, 36, 90, 14, 7, '#fff', 2.2)}<rect id="hdbar" x="147" y="38" width="0" height="10" rx="5" fill="#6cc04a"/>`)}
        ${rect(30, 470, 300, 36, 18, '#fff7e0', 2.8)}${T(180, 494, 14, 'Posez le doigt sur le point rouge', { id: 'hdmsg' })}
        <g id="hdsay" opacity="0">${T(180, 250, 30, '', { id: 'hdsayt', c: '#fff', st: 1, sw: 6 })}</g></svg>`;
    const $ = id => q('#' + id);
    const svg = stage.querySelector('svg');
    const horse = $('hdh');
    let down = false,
        hx = 180,
        hy = 430,
        tx = 180,
        ty = 430,
        rot = 0,
        last = performance.now(),
        wait = 0,
        busy = false;
    const trail = [];
    const setFig = () => {
        const f = d.fig,
            path = toPath(f.path);
        $('hdguide').setAttribute('d', path);
        $('hdguide2').setAttribute('d', path);
        $('hddone').setAttribute('d', '');
        $('hddone2').setAttribute('d', '');
        $('hdn').textContent = `${d.i + 1} / ${DRESSAGE.figures.length}`;
        $('hdname').textContent = { volte: 'Volte', serpentine: 'Serpentine', diagonale: 'Diagonale', huit: 'Huit' }[f.id];
        $('hdbar').setAttribute('width', 0);
        $('hdflag').innerHTML = circ(f.path[0][0], f.path[0][1], 11, '#c8453a', 2.2) + T(f.path[0][0], f.path[0][1] + 5, 13, '1', { c: '#fff' });
        $('hdmsg').textContent = 'Posez le doigt sur le point rouge';
        [hx, hy] = f.path[0];
        [tx, ty] = f.path[0];
        const nx = f.path[Math.min(4, f.path.length - 1)];
        rot = (Math.atan2(nx[1] - hy, nx[0] - hx) * 180) / Math.PI + 90;
        trail.length = 0;
    };
    setFig();
    const pt = e => {
        const r = svg.getBoundingClientRect();
        return [((e.clientX - r.left) * 360) / r.width, ((e.clientY - r.top) * 520) / r.height];
    };
    const say = t => {
        $('hdsayt').textContent = t;
        $('hdsay').setAttribute('opacity', 1);
        wait = 0.9;
    };
    const endFig = () => {
        if (busy) return;
        const f = d.fig;
        const st = G.figStats(f);
        const before = d.i;
        G.dressFinishFig(d);
        const sc = d.scores[before];
        say(sc >= 0.85 ? 'Parfait !' : sc >= 0.6 ? 'Bien' : sc >= 0.3 ? 'Passable' : 'Raté');
        sfx(sc >= 0.5 ? 'pop' : 'error');
        void st;
        busy = true;
    };
    const onDown = e => {
        e.preventDefault();
        if (busy || d.done) return;
        down = true;
        [tx, ty] = pt(e);
    };
    const onMove = e => {
        if (!down) return;
        [tx, ty] = pt(e);
    };
    const onUp = () => {
        if (!down) return;
        down = false;
        if (d.fig.started && !busy) endFig();
    };
    svg.addEventListener('pointerdown', onDown);
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    const cleanup = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        window.removeEventListener('pointercancel', onUp);
    };
    const origClose = c.close;
    q('#hgquit').onclick = () => {
        cleanup();
        origClose();
    };
    const loop = now => {
        if (me !== run) return cleanup();
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        if (wait > 0) {
            wait -= dt;
            if (wait <= 0) {
                $('hdsay').setAttribute('opacity', 0);
                busy = false;
                if (d.done) {
                    cleanup();
                    const n = G.dressageNotes(d);
                    finish(c, G.dressageScore(d), [
                        `Précision : ${Math.round(n.prec * 10)}/10`,
                        `Régularité : ${Math.round(n.smooth * 10)}/10`,
                        `Tracé complet : ${Math.round(n.cover * 10)}/10`,
                    ]);
                    return;
                }
                setFig();
            }
        } else if (down) {
            // le cheval suit le doigt avec un peu de souplesse : le tracé reste lisse
            const k = 1 - Math.exp(-dt * 14);
            const nx = hx + (tx - hx) * k,
                ny = hy + (ty - hy) * k;
            if (Math.hypot(nx - hx, ny - hy) > 0.4) rot = (Math.atan2(ny - hy, nx - hx) * 180) / Math.PI + 90;
            hx = nx;
            hy = ny;
            const f = d.fig;
            G.dressMove(d, hx, hy);
            if (f.started) {
                $('hdmsg').textContent = 'Suivez le tracé, doucement';
                if (!trail.length || Math.hypot(hx - trail[trail.length - 1][0], hy - trail[trail.length - 1][1]) > 3) trail.push([hx, hy]);
                const p = toPath(trail);
                $('hddone').setAttribute('d', p);
                $('hddone2').setAttribute('d', p);
                const st = G.figStats(f);
                $('hdbar').setAttribute('width', Math.max(0, 86 * st.cover * (0.5 + 0.5 * st.prec)));
                if (G.dressFigDone(d)) {
                    down = false;
                    endFig();
                }
            }
        }
        horse.setAttribute('transform', `translate(${hx} ${hy}) rotate(${rot}) scale(1.1) translate(-32 -32)`);
        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
}

// ---------------- le raid d'endurance ----------------
const GAITN = { pas: 'Pas', trot: 'Trot', galop: 'Galop' };
function playRaid(c) {
    const { a, stage, q, me } = c;
    const silks = '#2f9e8f';
    const r = G.newRaid(G.formOf(a));
    const calm = reduceMotion();
    const frames = {
        pas: ['walkA', 'walkB'].map(p => endurancePose(p)),
        trot: ['trotA', 'trotB'].map(p => endurancePose(p)),
        galop: ['galA', 'galB', 'galC', 'galB'].map(p => horseFrame(p, silks)),
    };
    const sceneBg = i => {
        const t = RAID.stages[i].terrain;
        return `<rect x="0" y="350" width="360" height="114" fill="${TCOL[t]}" stroke="${INK}" stroke-width="2.4"/><g transform="translate(0 140) scale(3 3.1)">${TERRAIN[t]()}</g>`;
    };
    const btn = (g, i) =>
        `<g class="hr-btn" data-g="${g}" style="cursor:pointer"><rect id="hrb-${g}" x="${36 + i * 98}" y="474" width="96" height="28" rx="14" fill="#fff7e0"/>${at(GAIT[g](), 40 + i * 98, 472, 0.5)}${T(88 + i * 98, 494, 13, GAITN[g])}</g>`;
    stage.innerHTML = `<svg viewBox="0 0 360 520" class="hg-svg">${defs}${rect(0, 0, 360, 520, 0, 'url(#hgsky)', 0)}
        <g id="hrbg">${sceneBg(0)}</g>
        <g id="hrdash"></g>
        <rect x="0" y="464" width="360" height="56" fill="#5fa84a" stroke="${INK}" stroke-width="2.4"/>
        <g transform="translate(150 372) scale(2.5) translate(-40 -44)"><g id="hrh">${frames.trot[0]}</g></g>
        ${hudBox(`${at(GAIT.etape(), 6, 2, 0.8)}${T(100, 28, 12, 'Étape 1 / 3', { id: 'hrst' })}${T(100, 52, 18, '', { id: 'hrname' })}${rect(160, 22, 120, 16, 8, '#fff', 2.2)}<rect id="hrbar" x="162" y="24" width="0" height="12" rx="6" fill="#2f9e8f"/>${T(220, 52, 11, 'Parcours')}${T(318, 33, 12, 'Pouls')}${T(318, 52, 18, '62', { id: 'hrp' })}`)}
        <g id="hrhint">${rect(30, 76, 300, 34, 17, '#ffd23f', 2.8)}${T(180, 98, 13, '', { id: 'hrhtxt' })}</g>
        ${rect(30, 470, 300, 36, 18, '#fff7e0', 2.8)}${['pas', 'trot', 'galop'].map(btn).join('')}
        <g id="hrvet" opacity="0" style="pointer-events:none"></g></svg>`;
    const $ = id => q('#' + id);
    const horse = $('hrh');
    let fr = 0,
        frT = 0,
        off = 0,
        last = performance.now(),
        vet = false,
        shown = -1;
    const paintBtns = () => ['pas', 'trot', 'galop'].forEach(g => $('hrb-' + g).setAttribute('fill', g === r.gait ? '#ffd23f' : '#fff7e0'));
    const pick = g => {
        if (vet) return;
        G.setGait(r, g);
        paintBtns();
        sfx('pop');
    };
    stage.querySelectorAll('.hr-btn').forEach(b => b.addEventListener('pointerdown', e => (e.preventDefault(), pick(b.dataset.g))));
    const keys = e => ({ Digit1: 'pas', Digit2: 'trot', Digit3: 'galop' })[e.code] && pick({ Digit1: 'pas', Digit2: 'trot', Digit3: 'galop' }[e.code]);
    window.addEventListener('keydown', keys);
    const cleanup = () => window.removeEventListener('keydown', keys);
    const origClose = c.close;
    q('#hgquit').onclick = () => {
        cleanup();
        origClose();
    };
    const stageUi = () => {
        if (shown === r.i) return;
        shown = r.i;
        const s = RAID.stages[Math.min(r.i, RAID.stages.length - 1)];
        $('hrbg').innerHTML = sceneBg(Math.min(r.i, RAID.stages.length - 1));
        $('hrst').textContent = `Étape ${Math.min(r.i + 1, 3)} / 3`;
        $('hrname').textContent = s.name;
        $('hrhtxt').textContent = s.hint;
        $('hrhint').setAttribute('opacity', 1);
    };
    stageUi();
    paintBtns();
    const showVet = ev => {
        vet = true;
        const rows = [
            ['pouls', 'Pouls', `${ev.pulse} bpm`, G.raidVet(ev.pulse)],
            ['souffle', 'Souffle', ev.vet > 0.7 ? 'calme' : 'rapide', clamp(ev.vet + 0.1)],
            ['pas', 'Allure', ev.score > 0.7 ? 'régulière' : 'irrégulière', ev.score],
        ];
        $('hrvet').innerHTML =
            rect(14, 110, 332, 340, 18, '#fff7e0', 3) +
            T(180, 150, 20, `Contrôle vétérinaire · étape ${ev.stage + 1}`) +
            at(GAIT.veto(), 140, 156, 0.9) +
            rows
                .map(([ic, n, v, p], i) => {
                    const y = 252 + i * 46;
                    return `${at(GAIT[ic](), 24, y - 8, 0.62)}${T(76, y + 14, 15, n, { a: 'start' })}${rect(150, y, 100, 14, 7, '#fff', 2.2)}<rect x="152" y="${y + 2}" width="${Math.max(0, 96 * p - 4)}" height="10" rx="5" fill="${p > 0.75 ? '#6cc04a' : '#ffd23f'}"/>${T(336, y + 12, 11, v, { a: 'end' })}`;
                })
                .join('') +
            (ev.vet > 0.35
                ? rect(80, 396, 200, 36, 18, '#6cc04a', 3) + T(180, 421, 17, r.done ? 'Arrivée !' : 'Apte à repartir', { c: '#fff', st: 1, sw: 4 })
                : rect(80, 396, 200, 36, 18, '#e07a3f', 3) + T(180, 421, 17, 'Repos conseillé', { c: '#fff', st: 1, sw: 4 }));
        $('hrvet').setAttribute('opacity', 1);
        $('hrvet').style.pointerEvents = 'auto';
        $('hrvet').onpointerdown = () => {
            $('hrvet').setAttribute('opacity', 0);
            $('hrvet').style.pointerEvents = 'none';
            vet = false;
            last = performance.now();
            if (r.done) {
                cleanup();
                const times = r.times.map(t => fmtT(t)).join(' · ');
                finish(c, G.raidScore(r), [`Étapes : ${times}`, `Temps total : ${fmtT(r.t)}`]);
            } else stageUi();
        };
        sfx('pop');
    };
    const loop = now => {
        if (me !== run) return cleanup();
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        if (!vet) {
            G.stepRaid(r, dt);
            if (r.event) {
                const ev = r.event;
                r.event = null;
                showVet(ev);
            }
            const sp = G.raidSpeed(r);
            off = (off + sp * 6 * dt) % 360;
            $('hrdash').innerHTML = [0, 1]
                .map(k => line(`M${(k * 180 - off + 360) % 360} 440 l26 0 M${(k * 180 + 90 - off + 360) % 360} 456 l20 0`, 3, 'rgba(255,255,255,.55)'))
                .join('');
            frT += dt * (r.gait === 'pas' ? 3 : r.gait === 'trot' ? 6 : 12);
            const arr = frames[r.gait];
            const f = calm ? 0 : Math.floor(frT) % arr.length;
            if (f !== fr || horse.dataset.g !== r.gait) {
                fr = f;
                horse.dataset.g = r.gait;
                horse.innerHTML = arr[f % arr.length];
            }
            const st = G.raidStage(r);
            $('hrbar').setAttribute('width', Math.min(116, 116 * (r.pos / st.len)));
            $('hrp').textContent = Math.round(r.p);
            $('hrp').setAttribute('fill', r.p > r.lim ? '#c8453a' : r.p > r.lim - 10 ? '#e07a3f' : '#2a8a3a');
            if (r.stageT > 3.5) $('hrhint').setAttribute('opacity', 0);
            if (r.p > r.lim) {
                $('hrhtxt').textContent = 'Pouls trop haut : ralentissez !';
                $('hrhint').setAttribute('opacity', 1);
            }
        }
        requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
}
