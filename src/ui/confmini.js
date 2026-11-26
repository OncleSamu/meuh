// 1.178 : Les 3 mini-jeux tactiles 100 % inédits de l'Atelier Confiserie (0 émoji, 8–10 s chacun) :
// 1. Chocolat  : Tempérage sur marbre (maintenir la température dans 3 paliers mobiles : 50 °C → 28 °C → 31 °C)
// 2. Caramel   : L'Instant Ambré (glisser le beurre/miel dans le chaudron pile dans la fenêtre ambrée)
// 3. Berlingots: La Coupe au Ciseau (trancher le ruban de sucre rayé pile au passage des 6 losanges)

import { sfx, buzz } from '../core/bus.js';
import { CONF_KINDS } from '../data/confiserie.js';
import { confSvg } from '../art/confiserie.js';
import * as G from '../systems/index.js';
import { refresh } from './app.js';

let activeRaf = 0;

function closeModal(overlay) {
    if (activeRaf) cancelAnimationFrame(activeRaf);
    activeRaf = 0;
    if (overlay && overlay.parentNode) overlay.remove();
}

export function launchConfMini(kind) {
    const pv = G.confPreview(kind);
    if (!pv.can) return;
    const kDef = CONF_KINDS[kind];

    // Créer la fenêtre modale dédiée
    const overlay = document.createElement('div');
    overlay.className = 'cfm-back';
    overlay.innerHTML = `<div class="cfm-box">
        <div class="cfm-head">
            <span class="cfm-art">${confSvg({ kind, shape: pv.shape, baseCol: pv.baseCol, baseCol2: pv.baseCol2, accentCol: pv.accentCol })}</span>
            <div><b>${kDef.miniName}</b><small>${kDef.miniDesc}</small></div>
        </div>
        <div class="cfm-stage" id="cfm-stage"></div>
        <div class="cfm-foot"><button type="button" class="btn sm" id="cfm-cancel">Annuler</button></div>
    </div>`;
    document.body.appendChild(overlay);

    const stage = overlay.querySelector('#cfm-stage');
    overlay.querySelector('#cfm-cancel').addEventListener('click', () => closeModal(overlay));

    const finish = (stars, summary) => {
        if (activeRaf) cancelAnimationFrame(activeRaf);
        activeRaf = 0;
        const res = G.finishConfMini(kind, stars);
        if (!res) {
            closeModal(overlay);
            return;
        }
        const starHtml = [1, 2, 3].map(i => `<span class="cfm-star${i <= stars ? ' on' : ''}">★</span>`).join('');
        const bonusTxt =
            stars >= 3
                ? 'Finition Miroir ! +30 % valeur et +1 cran de qualité !'
                : stars === 2
                  ? 'Belle maîtrise ! +15 % valeur.'
                  : 'Fournée réussie ! +5 % valeur.';
        stage.innerHTML = `<div class="cfm-done">
            <div class="cfm-done-art">${confSvg({ kind, shape: pv.shape, baseCol: pv.baseCol, baseCol2: pv.baseCol2, accentCol: pv.accentCol, mirror: stars >= 3, classic: !!pv.harmony.classic })}</div>
            <div class="cfm-stars">${starHtml}</div>
            <b>${pv.name} ×${res.qty}</b>
            <p>${summary}</p>
            <small>${bonusTxt}</small>
            <button type="button" class="btn green" id="cfm-ok">Ranger dans mes créations</button>
        </div>`;
        overlay.querySelector('#cfm-cancel').style.display = 'none';
        overlay.querySelector('#cfm-ok').addEventListener('click', () => {
            closeModal(overlay);
            refresh();
        });
    };

    if (kind === 'chocolate') runTemperMini(stage, pv, finish);
    else if (kind === 'caramel') runAmberMini(stage, pv, finish);
    else if (kind === 'nougat') runWhipMini(stage, pv, finish);
    else runSnipMini(stage, pv, finish);
}

// ---------------- 1. CHOCOLAT : Tempérage sur marbre ----------------
function runTemperMini(stage, pv, finish) {
    // 3 paliers successifs sur 9 secondes : Fondre (78 %), Marbre froid (24 %), Travail (46 %)
    const PHASES = [
        { label: '1/3 · Fondre (50 °C)', target: 0.78, dur: 3.0 },
        { label: '2/3 · Marbre froid (28 °C)', target: 0.24, dur: 3.0 },
        { label: '3/3 · Stabiliser (31 °C)', target: 0.46, dur: 3.0 },
    ];
    stage.innerHTML = `<div class="cfm-temper">
        <div class="cfm-phase" id="cfm-ph">${PHASES[0].label}</div>
        <div class="cfm-therm">
            <div class="cfm-zone" id="cfm-zone"></div>
            <div class="cfm-needle" id="cfm-needle" style="background:${pv.baseCol}"></div>
        </div>
        <div class="cfm-meter"><span>Brillance miroir</span><div class="cfm-mbar"><i id="cfm-fill"></i></div><b id="cfm-pct">0 %</b></div>
        <button type="button" class="btn gold wide lg cfm-hold" id="cfm-heat">Maintenir pour chauffer · Relâcher pour refroidir</button>
    </div>`;

    const phEl = stage.querySelector('#cfm-ph');
    const zoneEl = stage.querySelector('#cfm-zone');
    const needleEl = stage.querySelector('#cfm-needle');
    const fillEl = stage.querySelector('#cfm-fill');
    const pctEl = stage.querySelector('#cfm-pct');
    const heatBtn = stage.querySelector('#cfm-heat');

    let heating = false;
    const onDown = e => {
        e.preventDefault();
        heating = true;
        heatBtn.classList.add('on');
    };
    const onUp = () => {
        heating = false;
        heatBtn.classList.remove('on');
    };
    heatBtn.addEventListener('pointerdown', onDown);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);

    let temp = 0.5;
    let vel = 0;
    let scoreTime = 0;
    let totalTime = 0;
    let last = performance.now();
    const totalDur = 9.0;

    const step = t => {
        const dt = Math.max(0, Math.min(0.05, (t - last) / 1000));
        last = t;
        totalTime += dt;
        const pIdx = Math.max(0, Math.min(2, Math.floor(totalTime / 3)));
        const ph = PHASES[pIdx];
        phEl.textContent = ph.label;

        // Physique douce : maintenir chauffe, relâcher refroidit sur marbre
        vel += (heating ? 1.45 : -1.35) * dt;
        vel *= Math.pow(0.18, dt);
        temp = Math.max(0.04, Math.min(0.96, temp + vel * dt));

        const inZone = Math.abs(temp - ph.target) <= 0.13;
        if (inZone) scoreTime += dt;
        const pct = Math.min(100, Math.round((scoreTime / totalDur) * 100));

        zoneEl.style.left = `${Math.round((ph.target - 0.13) * 100)}%`;
        zoneEl.style.width = '26%';
        zoneEl.classList.toggle('hit', inZone);
        needleEl.style.left = `${Math.round(temp * 100)}%`;
        fillEl.style.width = `${pct}%`;
        pctEl.textContent = `${pct} %`;

        if (totalTime >= totalDur) {
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', onUp);
            const stars = pct >= 68 ? 3 : pct >= 40 ? 2 : 1;
            finish(stars, `Tempérage tenu à ${pct} % sur les 3 paliers.`);
            return;
        }
        activeRaf = requestAnimationFrame(step);
    };
    activeRaf = requestAnimationFrame(step);
}

// ---------------- 2. CARAMEL : L'Instant Ambré ----------------
function runAmberMini(stage, pv, finish) {
    // 2 cuissons rapides : glisser le beurre vers le haut (ou toucher le chaudron) dans la zone ambrée (66 % – 86 %)
    stage.innerHTML = `<div class="cfm-amber">
        <div class="cfm-phase" id="cfm-aph">Fournée 1/2 · Attends la teinte ambrée !</div>
        <div class="cfm-pot" id="cfm-pot">
            <div class="cfm-liquid" id="cfm-liq"></div>
            <span class="cfm-pot-deg" id="cfm-deg">110 °C</span>
        </div>
        <div class="cfm-cbar"><div class="cfm-czone"></div><i id="cfm-cprog"></i></div>
        <div class="cfm-butter-pad">
            <button type="button" class="btn gold wide lg cfm-drop" id="cfm-drop">Glisse vers le haut ou touche pour déglacer !</button>
        </div>
    </div>`;

    const phEl = stage.querySelector('#cfm-aph');
    const liqEl = stage.querySelector('#cfm-liq');
    const degEl = stage.querySelector('#cfm-deg');
    const progEl = stage.querySelector('#cfm-cprog');
    const dropBtn = stage.querySelector('#cfm-drop');

    let round = 0;
    let heat = 0;
    let speed = 0.22;
    const scores = [];
    let last = performance.now();
    let locked = false;

    const triggerDrop = () => {
        if (locked) return;
        locked = true;
        sfx('confSizzle');
        buzz(20);
        // Fenêtre parfaite : 0.68..0.85
        const dist = heat < 0.68 ? 0.68 - heat : heat > 0.85 ? heat - 0.85 : 0;
        const pts = dist === 0 ? 3 : dist <= 0.12 ? 2 : 1;
        scores.push(pts);
        round++;
        if (round >= 2) {
            const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
            const stars = avg >= 2.5 ? 3 : avg >= 1.75 ? 2 : 1;
            const txt = scores.map((s, i) => `Cuvée ${i + 1} : ${s === 3 ? 'ambre parfait' : s === 2 ? 'doré' : 'trop tôt/tard'}`).join(' · ');
            finish(stars, txt);
            return;
        }
        phEl.textContent = 'Fournée 2/2 · Plus vif cette fois !';
        heat = 0;
        speed = 0.29;
        setTimeout(() => {
            locked = false;
        }, 320);
    };

    let startY = null;
    dropBtn.addEventListener('pointerdown', e => {
        startY = e.clientY;
    });
    dropBtn.addEventListener('pointermove', e => {
        if (startY != null && startY - e.clientY > 28) {
            startY = null;
            triggerDrop();
        }
    });
    dropBtn.addEventListener('click', () => triggerDrop());

    const colorAt = h => {
        if (h < 0.45) return '#f6e0a2';
        if (h < 0.68) return '#eba638';
        if (h <= 0.85) return '#c86414';
        return '#421d08';
    };

    const step = t => {
        const dt = Math.max(0, Math.min(0.05, (t - last) / 1000));
        last = t;
        if (!locked) {
            heat += speed * (1 + heat * 0.45) * dt;
            if (heat >= 1) {
                heat = 1;
                triggerDrop();
                if (round >= 2) return;
            }
        }
        const deg = Math.round(105 + heat * 70);
        degEl.textContent = `${deg} °C`;
        liqEl.style.background = colorAt(heat);
        progEl.style.width = `${Math.round(heat * 100)}%`;
        activeRaf = requestAnimationFrame(step);
    };
    activeRaf = requestAnimationFrame(step);
}

// ---------------- 3. BERLINGOTS : La Coupe au Ciseau ----------------
function runSnipMini(stage, pv, finish) {
    // 6 losanges défilent vers la ligne de coupe (x = 22 %)
    stage.innerHTML = `<div class="cfm-snip">
        <div class="cfm-phase" id="cfm-sph">Tranche pile sur les 6 repères (0/6)</div>
        <div class="cfm-belt" id="cfm-belt" style="--c1:${pv.baseCol};--c2:${pv.accentCol}">
            <div class="cfm-cutline"></div>
            <div class="cfm-marks" id="cfm-marks"></div>
        </div>
        <button type="button" class="btn green wide lg" id="cfm-cut">Couper le ruban !</button>
    </div>`;

    const phEl = stage.querySelector('#cfm-sph');
    const marksEl = stage.querySelector('#cfm-marks');
    const cutBtn = stage.querySelector('#cfm-cut');
    const beltEl = stage.querySelector('#cfm-belt');

    const CUT_X = 22; // pourcentage depuis la gauche
    const marks = Array.from({ length: 6 }, (_, i) => ({
        x: 75 + i * 32,
        hit: null, // 'perfect' | 'ok' | 'miss'
    }));

    const nodes = marks.map(() => {
        const el = document.createElement('span');
        el.className = 'cfm-diamond';
        marksEl.appendChild(el);
        return el;
    });

    let perfect = 0;
    let ok = 0;
    let doneCount = 0;
    let last = performance.now();

    const doCut = () => {
        sfx('confSnip');
        buzz(12);
        beltEl.classList.add('snip');
        setTimeout(() => beltEl.classList.remove('snip'), 120);
        // Trouver le repère non tranché le plus proche de CUT_X
        let bestIdx = -1,
            bestDist = 999;
        marks.forEach((m, i) => {
            if (m.hit) return;
            const d = Math.abs(m.x - CUT_X);
            if (d < bestDist) {
                bestDist = d;
                bestIdx = i;
            }
        });
        if (bestIdx < 0 || bestDist > 18) return;
        const m = marks[bestIdx];
        if (bestDist <= 6.5) {
            m.hit = 'perfect';
            perfect++;
        } else {
            m.hit = 'ok';
            ok++;
        }
        nodes[bestIdx].classList.add(m.hit);
        doneCount++;
        phEl.textContent = `Tranche pile sur les 6 repères (${doneCount}/6)`;
    };

    cutBtn.addEventListener('pointerdown', e => {
        e.preventDefault();
        doCut();
    });
    beltEl.addEventListener('pointerdown', e => {
        e.preventDefault();
        doCut();
    });

    const step = t => {
        const dt = Math.max(0, Math.min(0.05, (t - last) / 1000));
        last = t;
        for (let i = 0; i < marks.length; i++) {
            const m = marks[i];
            m.x -= 36 * dt;
            if (!m.hit && m.x < CUT_X - 14) {
                m.hit = 'miss';
                nodes[i].classList.add('miss');
                doneCount++;
                phEl.textContent = `Tranche pile sur les 6 repères (${doneCount}/6)`;
            }
            nodes[i].style.left = `${m.x.toFixed(1)}%`;
        }
        if (doneCount >= 6) {
            const pts = perfect * 2 + ok;
            const stars = pts >= 10 ? 3 : pts >= 6 ? 2 : 1;
            finish(stars, `${perfect} coupes parfaites · ${ok} correctes sur 6 berlingots.`);
            return;
        }
        activeRaf = requestAnimationFrame(step);
    };
    activeRaf = requestAnimationFrame(step);
}

// ---------------- 4. NOUGATS & CALISSONS : Le Montage en Neige (1.181) ----------------
function runWhipMini(stage, pv, finish) {
    const honeyCol = pv.baseCol2 || '#e8b339';
    stage.innerHTML = `<div class="cfm-whip">
        <div class="cfm-phase" id="cfm-wph">Garde la cadence dans la zone verte !</div>
        <div class="cfm-bowl-wrap" id="cfm-bowl">
            <div class="cfm-pour" style="background:${honeyCol}"></div>
            <div class="cfm-bowl">
                <div class="cfm-foam" id="cfm-foam"></div>
                <div class="cfm-whisk" id="cfm-whisk"><i></i><i></i><i></i></div>
            </div>
        </div>
        <div class="cfm-wbar">
            <div class="cfm-wzone" id="cfm-wzone"></div>
            <div class="cfm-wneedle" id="cfm-wneedle"></div>
        </div>
        <div class="cfm-meter"><span>Neige ferme</span><div class="cfm-mbar"><i id="cfm-wfill"></i></div><b id="cfm-wpct">0 %</b></div>
        <button type="button" class="btn gold wide lg cfm-hold" id="cfm-beat">Fouetter ! (tapote en rythme)</button>
    </div>`;

    const phEl = stage.querySelector('#cfm-wph');
    const bowlEl = stage.querySelector('#cfm-bowl');
    const foamEl = stage.querySelector('#cfm-foam');
    const whiskEl = stage.querySelector('#cfm-whisk');
    const zoneEl = stage.querySelector('#cfm-wzone');
    const needleEl = stage.querySelector('#cfm-wneedle');
    const fillEl = stage.querySelector('#cfm-wfill');
    const pctEl = stage.querySelector('#cfm-wpct');
    const beatBtn = stage.querySelector('#cfm-beat');

    let pace = 0.28;
    let angle = 0;
    let firm = 0;
    let elapsed = 0;
    let last = performance.now();
    let lastSwipeX = null;
    const totalDur = 8.5;

    const pulse = (amt = 0.21) => {
        pace = Math.min(1, pace + amt);
        sfx('pop');
        buzz(8);
    };

    beatBtn.addEventListener('pointerdown', e => {
        e.preventDefault();
        pulse(0.21);
    });
    bowlEl.addEventListener('pointerdown', e => {
        e.preventDefault();
        lastSwipeX = e.clientX;
        pulse(0.18);
    });
    bowlEl.addEventListener('pointermove', e => {
        if (lastSwipeX != null && Math.abs(e.clientX - lastSwipeX) > 26) {
            lastSwipeX = e.clientX;
            pulse(0.14);
        }
    });
    const endSwipe = () => {
        lastSwipeX = null;
    };
    window.addEventListener('pointerup', endSwipe);
    window.addEventListener('pointercancel', endSwipe);

    const step = t => {
        const dt = Math.max(0, Math.min(0.05, (t - last) / 1000));
        last = t;
        elapsed += dt;

        // La fenêtre idéale se resserre légèrement à mi-parcours pendant la coulée du miel
        const half = elapsed > 4.2 ? 0.15 : 0.19;
        const center = 0.58;
        const lo = center - half;
        const hi = center + half;

        pace = Math.max(0, pace - 0.44 * dt);
        const inZone = pace >= lo && pace <= hi;
        if (inZone) {
            firm = Math.min(1, firm + 0.165 * dt);
        } else if (pace > hi) {
            // Trop rapide : légères éclaboussures
            firm = Math.max(0, firm - 0.03 * dt);
        }

        angle = (angle + (120 + pace * 540) * dt) % 360;
        const pct = Math.min(100, Math.round(firm * 100));

        phEl.textContent =
            pace < lo
                ? 'Fouette un peu plus vite !'
                : pace > hi
                  ? 'Doucement, le miel éclabousse !'
                  : elapsed > 4.2
                    ? 'Parfait ! Le miel chaud s’incorpore !'
                    : 'Super cadence, les blancs montent !';

        zoneEl.style.left = `${Math.round(lo * 100)}%`;
        zoneEl.style.width = `${Math.round((hi - lo) * 100)}%`;
        zoneEl.classList.toggle('hit', inZone);
        needleEl.style.left = `${Math.round(pace * 100)}%`;
        foamEl.style.height = `${26 + Math.round(firm * 56)}%`;
        whiskEl.style.transform = `translateX(${Math.round(Math.sin((angle * Math.PI) / 180) * 20)}px) rotate(${Math.round(Math.cos((angle * Math.PI) / 180) * 14)}deg)`;
        fillEl.style.width = `${pct}%`;
        pctEl.textContent = `${pct} %`;

        if (elapsed >= totalDur) {
            window.removeEventListener('pointerup', endSwipe);
            window.removeEventListener('pointercancel', endSwipe);
            const stars = pct >= 66 ? 3 : pct >= 38 ? 2 : 1;
            finish(stars, `Blancs montés à ${pct} % avec le filet de miel chaud.`);
            return;
        }
        activeRaf = requestAnimationFrame(step);
    };
    activeRaf = requestAnimationFrame(step);
}

