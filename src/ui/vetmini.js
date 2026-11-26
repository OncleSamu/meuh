// 1.181 : Mini-jeu tactile « L’Auscultation & Soin » du Refuge Vétérinaire.
// 2 phases fluides (~12 s) :
//   1) Apaiser 4 battements cardiaques dans la zone verte
//   2) Appliquer 3 touches de soin (baume / pansement / caresse)
// Classes CSS strictement préfixées .vm-* (zéro collision).

import * as G from '../systems/index.js';
import { REMEDY_BY_ID } from '../data/refuge.js';
import { sfx, buzz } from '../core/bus.js';
import { ico, art } from './icons.js';
import { refresh } from './app.js';

const INK = '#3a2618';
let runId = 0;

function patientArt(p) {
    if (p.kind === 'wild') return art('ui', 'wild_' + p.species);
    return art('animal', p.animalType);
}

export function openVetMini(uid, el) {
    const p = G.refugePatients().find(x => x.uid === uid);
    if (!p || p.phase !== 'ready') return;
    const rem = REMEDY_BY_ID[p.remedy];
    const me = ++runId;

    document.querySelector('.vm-over')?.remove();
    const o = document.createElement('div');
    o.className = 'vm-over';
    o.innerHTML = `<div class="vm-box">
        <div class="vm-top"><h2>Soin · ${p.name}</h2><button class="btn sm" id="vmquit">Quitter</button></div>
        <div class="vm-stage" id="vmstage"></div>
    </div>`;
    document.body.appendChild(o);

    const stage = o.querySelector('#vmstage');
    let raf = 0;
    const close = () => {
        runId++;
        if (raf) cancelAnimationFrame(raf);
        o.remove();
        refresh();
    };
    o.querySelector('#vmquit').onclick = close;

    // Écran d'introduction court & clair
    stage.innerHTML = `<div class="vm-intro">
        <div class="vm-pic">${patientArt(p)}</div>
        <p class="vm-lead"><b>${p.symptom}</b> · ${rem ? rem.name : 'Soin doux'}</p>
        <p class="vm-sub"><b>1.</b> Apaisez 4 battements quand l’anneau touche le cercle vert.<br><b>2.</b> Posez 3 touches de soin sur les pastilles lumineuses.</p>
        <div class="vm-btns">
            <button class="btn green" id="vmgo">Commencer le soin</button>
            <button class="btn ghost" id="vmcalm">Soin calme (sans mini-jeu)</button>
        </div>
    </div>`;

    o.querySelector('#vmcalm').onclick = () => {
        if (me !== runId) return;
        G.finishRefugeCare(uid, 0.5, el);
        close();
    };

    o.querySelector('#vmgo').onclick = () => {
        if (me !== runId) return;
        startPhase1();
    };

    const scores = [];

    function startPhase1() {
        let beat = 0;
        const totalBeats = 4;
        let phase = 0; // 0 -> 1 (anneau se resserre de r=108 à r=32)
        const target = 0.68; // cercle vert à 0.68
        let speed = 0.72;
        let last = performance.now();
        let locked = false;

        stage.innerHTML = `<div class="vm-play">
            <div class="vm-hud"><span id="vmstep">Phase 1 · Battement 1 / ${totalBeats}</span><span id="vmmsg">Tapez dans le vert !</span></div>
            <div class="vm-arena" id="vmarena">
                <svg viewBox="0 0 240 240" class="vm-ring-svg" aria-hidden="true">
                    <circle cx="120" cy="120" r="64" fill="none" stroke="rgba(91,168,74,0.22)" stroke-width="18"/>
                    <circle cx="120" cy="120" r="64" fill="none" stroke="#4ca33c" stroke-width="3" stroke-dasharray="6 5"/>
                    <circle id="vmring" cx="120" cy="120" r="106" fill="none" stroke="#e89a25" stroke-width="5"/>
                </svg>
                <div class="vm-center-art">${patientArt(p)}</div>
            </div>
            <button class="btn gold lg vm-tap" id="vmtap">Apaiser le cœur</button>
        </div>`;

        const ring = stage.querySelector('#vmring');
        const stepEl = stage.querySelector('#vmstep');
        const msgEl = stage.querySelector('#vmmsg');
        const tapBtn = stage.querySelector('#vmtap');
        const arena = stage.querySelector('#vmarena');

        const evaluate = () => {
            if (me !== runId || locked) return;
            locked = true;
            const err = Math.abs(phase - target);
            let pts = 0.25;
            if (err <= 0.1) {
                pts = 1;
                msgEl.textContent = 'Parfait !';
                sfx('pop');
                buzz(12);
            } else if (err <= 0.21) {
                pts = 0.68;
                msgEl.textContent = 'Bien !';
                sfx('pop');
            } else {
                msgEl.textContent = phase < target ? 'Un peu tôt' : 'Un peu tard';
                sfx('error');
            }
            scores.push(pts);
            beat++;
            if (beat >= totalBeats) {
                if (raf) cancelAnimationFrame(raf);
                setTimeout(() => {
                    if (me === runId) startPhase2();
                }, 320);
                return;
            }
            setTimeout(() => {
                if (me !== runId) return;
                phase = 0;
                speed = 0.72 + beat * 0.09;
                stepEl.textContent = `Phase 1 · Battement ${beat + 1} / ${totalBeats}`;
                locked = false;
                last = performance.now();
            }, 220);
        };

        tapBtn.onpointerdown = e => {
            e.preventDefault();
            evaluate();
        };
        arena.onpointerdown = e => {
            e.preventDefault();
            evaluate();
        };

        const loop = ts => {
            if (me !== runId) return;
            const dt = Math.max(0, Math.min(0.05, (ts - last) / 1000));
            last = ts;
            if (!locked) {
                phase += dt * speed;
                if (phase >= 1.05) {
                    evaluate();
                } else {
                    const r = 108 - phase * 65;
                    ring.setAttribute('r', Math.max(30, r).toFixed(1));
                    const closeEnough = Math.abs(phase - target) <= 0.12;
                    ring.setAttribute('stroke', closeEnough ? '#4ca33c' : '#e89a25');
                }
            }
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
    }

    function startPhase2() {
        const spots = [
            { x: 26, y: 34, label: 'Baume' },
            { x: 70, y: 28, label: 'Soin' },
            { x: 48, y: 68, label: 'Caresse' },
        ];
        let cur = 0;
        let timerId = 0;

        stage.innerHTML = `<div class="vm-play">
            <div class="vm-hud"><span id="vmstep2">Phase 2 · Touche 1 / ${spots.length}</span><span id="vmmsg2">Tapez la pastille verte !</span></div>
            <div class="vm-spot-board" id="vmboard">
                <div class="vm-board-art">${patientArt(p)}</div>
            </div>
        </div>`;

        const board = stage.querySelector('#vmboard');
        const stepEl = stage.querySelector('#vmstep2');
        const msgEl = stage.querySelector('#vmmsg2');

        const spawnSpot = () => {
            if (me !== runId) return;
            board.querySelectorAll('.vm-spot').forEach(x => x.remove());
            if (cur >= spots.length) {
                showResult();
                return;
            }
            const sp = spots[cur];
            stepEl.textContent = `Phase 2 · Touche ${cur + 1} / ${spots.length}`;
            const b = document.createElement('button');
            b.className = 'vm-spot';
            b.style.left = `${sp.x}%`;
            b.style.top = `${sp.y}%`;
            b.innerHTML = `${ico(rem ? rem.icon : ['ui', 'vetHeart'])}<span>${sp.label}</span>`;
            const startAt = performance.now();
            let done = false;

            const resolveSpot = hit => {
                if (done || me !== runId) return;
                done = true;
                clearTimeout(timerId);
                b.remove();
                if (hit) {
                    const elapsed = performance.now() - startAt;
                    const pts = elapsed <= 1250 ? 1 : 0.72;
                    scores.push(pts);
                    msgEl.textContent = elapsed <= 1250 ? 'Geste précis !' : 'Bien posé !';
                    sfx('pop');
                    buzz(10);
                } else {
                    scores.push(0.3);
                    msgEl.textContent = 'Trop lent…';
                    sfx('error');
                }
                cur++;
                setTimeout(spawnSpot, 180);
            };

            b.onpointerdown = e => {
                e.preventDefault();
                resolveSpot(true);
            };
            board.appendChild(b);
            timerId = setTimeout(() => resolveSpot(false), 2300);
        };
        spawnSpot();
    }

    function showResult() {
        const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0.5;
        const done = G.finishRefugeCare(uid, avg, el);
        const stars = done ? done.stars : 1;
        const starSvg = on =>
            `<svg class="vm-star" viewBox="0 0 40 40"><path d="M20 3l5 11 12 1.5-9 8 2.5 12L20 29l-10.5 6.5L12 23.5l-9-8L15 14z" fill="${on ? '#f4b92e' : '#efe3c8'}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/></svg>`;
        const headline = stars === 3 ? 'Soin exemplaire !' : stars === 2 ? 'Très beau soin' : 'Animal rétabli';
        const bonusTxt =
            stars === 3
                ? '+50 % récompenses (et robe rare si adopté !)'
                : stars === 2
                  ? '+25 % récompenses'
                  : 'Récompense standard';
        stage.innerHTML = `<div class="vm-result">
            <div class="vm-pic sm">${patientArt(p)}</div>
            <h3>${headline}</h3>
            <div class="vm-stars">${[1, 2, 3].map(i => starSvg(i <= stars)).join('')}</div>
            <p class="vm-lead">Précision : <b>${Math.round(avg * 100)} %</b></p>
            <p class="vm-sub">${bonusTxt}</p>
            <button class="btn gold lg" id="vmdone">Terminer</button>
        </div>`;
        stage.querySelector('#vmdone').onclick = close;
    }
}
