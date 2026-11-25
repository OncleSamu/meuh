// Progrès : arbre de compétences visuel (constellation 3 voies), prestige (vendre la ferme), défis et fermes à thème.
import { state } from '../../core/state.js';
import { fmt } from '../../core/format.js';
import { SKILLS, SKILL_WINGS, CHALLENGES } from '../../data/meta.js';
import { PRESTIGE_LVL, CHALLENGE_BONUS } from '../../data/progress.js';
import { FARM_THEMES } from '../../data/port.js';
import * as G from '../../systems/index.js';
import { actions } from '../dom.js';
import { ico } from '../icons.js';
import { btn, card, pips } from '../kit.js';
import { defineSheet, closeAll, sheetOpts } from '../sheets.js';
import { confirmTap } from '../confirm.js';
import { ui } from '../app.js';
import { innerTabs } from '../innertabs.js';

const WING_BY_ID = Object.fromEntries(SKILL_WINGS.map(w => [w.id, w]));

function wingSpent(w) {
    return w.branches.reduce((a, b) => a + G.branchSpent(b), 0);
}
function wingCap(w) {
    return w.branches.reduce((a, b) => a + SKILLS[b].list.reduce((s, sk) => s + sk.max, 0), 0);
}

// Calcule les nœuds et arêtes pour la Vue globale (constellation radiale 3 voies)
function layoutGlobal() {
    const nodes = [];
    const edges = [];
    const wingArcs = {
        terre: [-198, -167, -136, -105],
        domaine: [-68, -32, 4],
        horizon: [40, 72, 104, 136],
    };
    const wingTags = {
        terre: { x: 24, y: 6 },
        domaine: { x: 76, y: 6 },
        horizon: { x: 33, y: 94.5 },
    };
    const cx = 50,
        cy = 49.5;
    const pt = (deg, r) => {
        const rad = (deg * Math.PI) / 180;
        return { x: +(cx + Math.cos(rad) * r).toFixed(2), y: +(cy + Math.sin(rad) * r).toFixed(2) };
    };
    for (const w of SKILL_WINGS) {
        const angles = wingArcs[w.id];
        w.branches.forEach((b, bi) => {
            const br = SKILLS[b];
            const ang = angles[bi];
            const list = br.list;
            const posById = {};
            const midIds = list.filter((sk, idx) => idx > 0 && !sk.cap);
            const rootP = pt(ang, 15);
            posById[list[0].id] = rootP;
            nodes.push({ b, k: 0, sk: list[0], w, ...rootP });
            edges.push({ x1: cx, y1: cy, x2: rootP.x, y2: rootP.y, w, lit: G.rank(list[0].id) > 0, avail: state.level >= (br.lvl || 1) });

            midIds.forEach((sk, mi) => {
                const k = list.indexOf(sk);
                const spread = midIds.length === 3 ? (mi - 1) * 9.5 : (mi - 0.5) * 12.5;
                const rad = midIds.length === 3 ? (mi === 1 ? 30.5 : 26) : mi === 0 ? 25.5 : 30.5;
                const p = pt(ang + spread, rad);
                posById[sk.id] = p;
                nodes.push({ b, k, sk, w, ...p });
                const lit = G.rank(sk.id) > 0;
                const avail = !lit && !G.skillReq(b, k);
                edges.push({ x1: rootP.x, y1: rootP.y, x2: p.x, y2: p.y, w, lit, avail });
            });

            const capSk = list.find(sk => sk.cap);
            if (capSk) {
                const k = list.indexOf(capSk);
                const cp = pt(ang, 41);
                posById[capSk.id] = cp;
                nodes.push({ b, k, sk: capSk, w, ...cp });
                const lit = G.rank(capSk.id) > 0;
                const avail = !lit && !G.skillReq(b, k);
                for (const m of midIds) {
                    const mp = posById[m.id];
                    edges.push({ x1: mp.x, y1: mp.y, x2: cp.x, y2: cp.y, w, lit: lit && G.rank(m.id) > 0, avail: avail && G.rank(m.id) > 0 });
                }
            }
        });
    }
    return { w: 100, h: 100, nodes, edges, wingTags };
}

// Calcule les nœuds et arêtes pour une Voie zoomée (arbres ramifiés lisibles au pouce)
function layoutWing(wing) {
    const branches = wing.branches;
    const nodes = [];
    const edges = [];
    const labels = [];
    let cursorY = 7;

    branches.forEach(b => {
        const br = SKILLS[b];
        const list = br.list;
        const midIds = list.filter((sk, idx) => idx > 0 && !sk.cap);
        const laneH = midIds.length === 3 ? 52 : 40;
        const cy = cursorY + laneH * 0.56;
        const locked = state.level < (br.lvl || 1);
        labels.push({
            x: 20,
            y: cursorY + 4.2,
            text: locked ? `${br.name} · niv. ${br.lvl}` : `${br.name} (${G.branchSpent(b)}/${list.reduce((a, x) => a + x.max, 0)})`,
            locked,
        });

        const rootP = { x: 16, y: cy };
        nodes.push({ b, k: 0, sk: list[0], w: wing, ...rootP });

        const posById = { [list[0].id]: rootP };
        midIds.forEach((sk, mi) => {
            const k = list.indexOf(sk);
            const dy = midIds.length === 3 ? (mi - 1) * 15.5 : (mi - 0.5) * 16.5;
            const p = { x: 52, y: +(cy + dy).toFixed(2) };
            posById[sk.id] = p;
            nodes.push({ b, k, sk, w: wing, ...p });
            const lit = G.rank(sk.id) > 0;
            const avail = !lit && !G.skillReq(b, k);
            edges.push({ x1: rootP.x, y1: rootP.y, x2: p.x, y2: p.y, w: wing, lit, avail, curve: true });
        });

        const capSk = list.find(sk => sk.cap);
        if (capSk) {
            const k = list.indexOf(capSk);
            const cp = { x: 84, y: cy };
            nodes.push({ b, k, sk: capSk, w: wing, ...cp });
            const lit = G.rank(capSk.id) > 0;
            const avail = !lit && !G.skillReq(b, k);
            for (const m of midIds) {
                const mp = posById[m.id];
                edges.push({ x1: mp.x, y1: mp.y, x2: cp.x, y2: cp.y, w: wing, lit: lit && G.rank(m.id) > 0, avail: avail && G.rank(m.id) > 0, curve: true });
            }
        }
        cursorY += laneH + 4;
    });
    return { w: 100, h: cursorY + 4, nodes, edges, labels };
}

function edgePath(e) {
    if (e.curve) {
        const mx = +((e.x1 + e.x2) / 2).toFixed(2);
        return `M${e.x1} ${e.y1} C${mx} ${e.y1} ${mx} ${e.y2} ${e.x2} ${e.y2}`;
    }
    return `M${e.x1} ${e.y1} L${e.x2} ${e.y2}`;
}

function nodeDetailHtml(b, k, pts) {
    const br = SKILLS[b];
    const sk = br && br.list[k];
    if (!sk) return '';
    const wing = WING_BY_ID[br.wing] || SKILL_WINGS[0];
    const r = G.rank(sk.id);
    const req = G.skillReq(b, k);
    const full = r >= sk.max;
    const can = !full && !req && pts > 0;
    const curDesc = r ? G.skillDesc(sk, r) + '.' : 'Pas encore appris.';
    const nextDesc = full ? 'Rang maximum atteint.' : `Prochain rang : ${G.skillDesc(sk, r + 1)}.`;
    return `<div class="sk-detail" style="--wc:${wing.color};--wg:${wing.glow}">
        <div class="sk-det-top">
            <div class="sk-det-ico" style="border-color:${wing.color}">${ico(sk.icon)}</div>
            <div class="sk-det-main">
                <div class="sk-det-tag"><i class="sk-dot"></i>${wing.name} · ${br.name}${sk.cap ? ' · Clé' : ''}</div>
                <div class="card-title">${sk.name} ${pips(r, sk.max)}</div>
                <div class="card-sub">${r ? curDesc : G.skillDesc(sk, 1) + '.'}</div>
            </div>
        </div>
        <div class="sk-det-foot">
            <div class="card-sub" style="flex:1;min-width:140px">${req ? `<b>Verrouillé :</b> ${req}.` : nextDesc}</div>
            ${full ? `<span class="chip ok">${ico(['ui', 'check'])} Maîtrisé</span>` : btn(can ? 'Apprendre (1 pt)' : pts < 1 && !req ? '0 point' : 'Apprendre', { act: 'learn', data: { b, k }, kind: can ? 'green' : '', size: 'sm', disabled: !can })}
        </div>
    </div>`;
}

function getCam() {
    if (!ui.sel.skCam) ui.sel.skCam = { z: 1, tx: 0, ty: 0 };
    return ui.sel.skCam;
}
function clampCam(c) {
    c.z = Math.max(1, Math.min(2.6, +c.z.toFixed(3)));
    const lim = (c.z - 1) * 52;
    c.tx = Math.max(-lim, Math.min(lim, +c.tx.toFixed(2)));
    c.ty = Math.max(-lim, Math.min(lim, +c.ty.toFixed(2)));
    return c;
}
function zoomCam(c, nextZ, fx = 0, fy = 0) {
    const z0 = c.z;
    const z1 = Math.max(1, Math.min(2.6, nextZ));
    const ratio = z1 / z0;
    c.tx = c.tx * ratio + fx * 100 * (1 - ratio);
    c.ty = c.ty * ratio + fy * 100 * (1 - ratio);
    c.z = z1;
    return clampCam(c);
}
function applyCamDom(canvas, c) {
    if (!canvas) return;
    const stage = canvas.querySelector('.sk-stage');
    if (stage) stage.style.transform = `translate(${c.tx}%, ${c.ty}%) scale(${c.z})`;
    canvas.classList.toggle('zoomed', c.z >= 1.35);
    canvas.classList.toggle('panning', c.z > 1.02);
    const pct = canvas.querySelector('.sk-zpct');
    if (pct) pct.textContent = `${Math.round(c.z * 100)} %`;
    const hint = canvas.querySelector('.sk-zhint');
    if (hint) hint.hidden = c.z > 1.05;
}

function skills() {
    const mode = ui.sel.skWing || 'all';
    const pts = G.skillPoints();
    const spent = G.skillsSpent();
    const total = G.skillsTotalCap();

    // Garantir une sélection valide
    if (!ui.sel.skNode || !SKILLS[ui.sel.skNode.b] || !SKILLS[ui.sel.skNode.b].list[ui.sel.skNode.k]) {
        const defB = mode === 'all' ? 'agri' : WING_BY_ID[mode].branches[0];
        ui.sel.skNode = { b: defB, k: 0 };
    }
    const sel = ui.sel.skNode;

    const hud = `<div class="sk-hud">
        <div class="sk-hud-main">
            <span class="sk-pts${pts ? '' : ' zero'}">${ico(['ui', 'skillbook'])}${pts} pt${pts > 1 ? 's' : ''}</span>
            <span class="sk-spent">${spent} / ${total} rangs</span>
        </div>
        ${spent ? btn(`Réinitialiser · ${fmt(G.respecCost())}`, { act: 'respec', size: 'sm', icon: ['ui', 'coin'] }) : '<span class="sk-spent">1 pt par niveau · choisissez vos voies</span>'}
    </div>`;

    const wingTabs = `<div class="sk-wings">
        <button type="button" class="sk-wbtn${mode === 'all' ? ' on' : ''}" data-act="skWing" data-v="all" style="--wc:#f4c84a">
            <i class="sk-dot"></i><span>Vue globale</span>
        </button>
        ${SKILL_WINGS.map(
            w => `<button type="button" class="sk-wbtn${mode === w.id ? ' on' : ''}" data-act="skWing" data-v="${w.id}" style="--wc:${w.color}">
                <i class="sk-dot"></i><span>${w.short}</span><small>${wingSpent(w)}/${wingCap(w)}</small>
            </button>`,
        ).join('')}
    </div>`;

    const isAll = mode === 'all';
    const wing = isAll ? null : WING_BY_ID[mode] || SKILL_WINGS[0];
    const graph = isAll ? layoutGlobal() : layoutWing(wing);
    const ratioStyle = isAll ? '' : `style="aspect-ratio:100 / ${graph.h}"`;

    const edgesSvg = graph.edges
        .map(
            e =>
                `<path class="sk-edge${e.lit ? ' lit' : e.avail ? ' avail' : ''}" style="--wc:${e.w.color};--wg:${e.w.glow}" d="${edgePath(e)}" />`,
        )
        .join('');

    const nodesHtml = graph.nodes
        .map(n => {
            const r = G.rank(n.sk.id);
            const req = G.skillReq(n.b, n.k);
            const full = r >= n.sk.max;
            const can = !full && !req && pts > 0;
            const isSel = sel.b === n.b && sel.k === n.k;
            const cls = `sk-node${n.sk.cap ? ' cap' : ''}${full ? ' full' : ''}${r > 0 ? ' learned' : req ? ' locked' : ''}${can ? ' can' : ''}${isSel ? ' sel' : ''}`;
            const topPct = +((n.y / graph.h) * 100).toFixed(2);
            return `<button type="button" class="${cls}" style="left:${n.x}%;top:${topPct}%;--wc:${n.w.color};--wg:${n.w.glow}" data-act="skPick" data-b="${n.b}" data-k="${n.k}" aria-label="${n.sk.name} (${r}/${n.sk.max})">
                <span class="sk-ni">${ico(n.sk.icon)}</span>
                <span class="sk-rk">${r}/${n.sk.max}</span>
            </button>`;
        })
        .join('');

    const extras = isAll
        ? `<div class="sk-core">${ico(['ui', 'house'])}</div>${SKILL_WINGS.map(w => {
              const t = graph.wingTags[w.id];
              return `<button type="button" class="sk-wtag" style="left:${t.x}%;top:${t.y}%;--wc:${w.color};--wg:${w.glow}" data-act="skWing" data-v="${w.id}">${w.name} (${wingSpent(w)})</button>`;
          }).join('')}`
        : graph.labels
              .map(
                  lb =>
                      `<span class="sk-blbl${lb.locked ? ' locked' : ''}" style="left:${lb.x}%;top:${+((lb.y / graph.h) * 100).toFixed(2)}%">${lb.text}</span>`,
              )
              .join('');

    const cam = isAll ? clampCam(getCam()) : null;
    const stageOpen = isAll ? `<div class="sk-stage" style="transform:translate(${cam.tx}%, ${cam.ty}%) scale(${cam.z})">` : '';
    const stageClose = isAll ? '</div>' : '';
    const zoomHud = isAll
        ? `<div class="sk-zctl" role="group" aria-label="Zoom">
               <button type="button" class="sk-zbtn" data-act="skZoom" data-d="-0.45" aria-label="Dézoomer">−</button>
               <button type="button" class="sk-zbtn sk-zpct" data-act="skZoom" data-d="toggle" aria-label="Réinitialiser le zoom">${Math.round(cam.z * 100)} %</button>
               <button type="button" class="sk-zbtn" data-act="skZoom" data-d="0.45" aria-label="Zoomer">+</button>
           </div>`
        : '';

    return `<div class="sk-wrap">
        ${hud}
        ${wingTabs}
        <div class="sk-canvas ${isAll ? `mode-all${cam.z >= 1.35 ? ' zoomed' : ''}${cam.z > 1.02 ? ' panning' : ''}` : 'mode-wing'}" ${ratioStyle}>
            ${stageOpen}
            <svg class="sk-svg" viewBox="0 0 ${graph.w} ${graph.h}" preserveAspectRatio="none">${edgesSvg}</svg>
            ${extras}
            ${nodesHtml}
            ${stageClose}
            ${zoomHud}
        </div>
        ${nodeDetailHtml(sel.b, sel.k, pts)}
    </div>`;
}

function challengeCard() {
    const ch = state.challenge && CHALLENGES[state.challenge];
    const done = Object.keys(state.challengesDone).length;
    return card({
        icon: ['ui', 'flag'],
        title: ch ? `Défi en cours : ${ch.name}` : 'Défis de prestige',
        sub: `${ch ? `${ch.desc}. Vendez la ferme pour remporter ${CHALLENGE_BONUS} rubans de plus.` : `Au moment de vendre la ferme, choisissez un défi pour la suivante : réussi, il rapporte ${CHALLENGE_BONUS} rubans de plus.`} ${done}/4 défis réussis.`,
        body: ch ? `<div class="card-foot">${btn('Abandonner', { act: 'abandon', size: 'sm' })}</div>` : '',
    });
}

function prestigeCard() {
    const r = state.prestige.rubans,
        gain = G.rubansGain();
    const can = G.canPrestige();
    return card({
        icon: ['ui', 'ribbon'],
        title: `${r} ruban${r > 1 ? 's' : ''} de concours`,
        sub: `Chaque ruban donne +5 % sur les ventes et +3 % de vitesse, pour toujours. Bonus actuel : +${r * 5} % de ventes, +${r * 3} % de vitesse. ${state.level < PRESTIGE_LVL ? `Vendre la ferme est possible à partir du niveau ${PRESTIGE_LVL}.` : `En vendant maintenant : <b>+${gain} ruban${gain > 1 ? 's' : ''}</b> (selon les pièces gagnées depuis le début de cette ferme).`}`,
        body: `<div class="card-foot">${btn('Vendre la ferme', { act: 'open', data: { sheet: 'prestige' }, kind: can ? 'red' : '', size: 'sm', disabled: !can })}</div>`,
    });
}

defineSheet('progress', {
    title: 'Progrès',
    // 1.74.1 : deux onglets
    render: () => {
        const T = innerTabs(
            'progress',
            [
                ['skills', 'Compétences', null, G.skillPoints() ? 1 : 0],
                ['prestige', 'Prestige', null, 0],
            ],
            'skills',
        );
        return [
            ['tabs', T.html],
            ['skills', T.cur === 'skills' ? skills() : ''],
            ['prestige', T.cur === 'prestige' ? `<div class="list">${prestigeCard()}${challengeCard()}</div>` : ''],
        ];
    },
});

// ---------------- vendre la ferme ----------------
defineSheet('prestige', {
    title: 'Vendre la ferme ?',
    open(o) {
        o.ch = '';
        o.theme = state.farmTheme || 'none';
    },
    render(o) {
        const gain = G.prestigeGain();
        const after = state.prestige.rubans + gain;
        return `<p>Vous repartez de zéro sur une nouvelle ferme, avec des rubans de concours qui rendent tout plus rentable.</p>
            <div class="prestige-gain">+${gain}${ico(['ui', 'ribbon'])}</div>
            <p class="card-sub center">${state.challenge ? `Défi « ${CHALLENGES[state.challenge].name} » réussi : ${CHALLENGE_BONUS} rubans en plus. ` : ''}Après : +${after * 5} % de ventes et +${after * 3} % de vitesse.</p>
            <div class="keep-lose"><div class="line ok"><div><b>Vous gardez</b><br>Rubans, succès, amitiés, chien, décorations, village rénové, grange, livre, cave (étagères et cote), musée, mine, équipe, statistiques</div></div>
            <div class="line bad"><div><b>Vous perdez</b><br>Pièces, niveau, compétences, champs, serre, animaux, machines, stocks, améliorations</div></div></div>
            <div class="set-title">Défi pour la prochaine ferme (facultatif)</div>
            <div class="choice-list"><button class="choice${o.ch ? '' : ' on'}" data-act="pickChallenge" data-c="">Aucun défi</button>${Object.entries(
                CHALLENGES,
            )
                .map(
                    ([id, ch]) =>
                        `<button class="choice${o.ch === id ? ' on' : ''}" data-act="pickChallenge" data-c="${id}">${ico(ch.icon)}<span><b>${ch.name}</b>${state.challengesDone[id] ? ' ✓' : ''}<small>${ch.desc}</small></span></button>`,
                )
                .join('')}</div>
            ${
                G.themesOpen()
                    ? `<div class="set-title">Ferme à thème pour la prochaine partie</div><div class="choice-list">${Object.entries(FARM_THEMES)
                          .map(
                              ([id, t]) =>
                                  `<button class="choice${o.theme === id ? ' on' : ''}" data-act="pickTheme" data-t="${id}">${t.icon ? ico(t.icon) : ''}<span><b>${t.name}</b><small>${t.desc}</small></span></button>`,
                          )
                          .join('')}</div>`
                    : ''
            }`;
    },
    foot: () => `<div class="row-btns">${btn('Annuler', { act: 'sheetClose' })}${btn('Vendre', { act: 'doPrestige', kind: 'red' })}</div>`,
});

let camGesturesBound = false;
function bindCamGestures() {
    if (camGesturesBound || typeof document === 'undefined') return;
    camGesturesBound = true;
    let drag = null;
    let pinch = null;
    let suppressUntil = 0;

    const canvasOf = el => el && el.closest && el.closest('.sk-canvas.mode-all');
    const focalOf = (canvas, cx, cy) => {
        const r = canvas.getBoundingClientRect();
        return [(cx - r.left) / r.width - 0.5, (cy - r.top) / r.height - 0.5, r];
    };

    // Bloquer le clic parasite juste après un glissement / pincement
    document.addEventListener(
        'click',
        e => {
            if (performance.now() < suppressUntil && canvasOf(e.target)) {
                e.stopPropagation();
                e.preventDefault();
            }
        },
        true,
    );

    // Molette souris sur ordinateur
    document.addEventListener(
        'wheel',
        e => {
            const canvas = canvasOf(e.target);
            if (!canvas) return;
            e.preventDefault();
            const c = getCam();
            const [fx, fy] = focalOf(canvas, e.clientX, e.clientY);
            const factor = e.deltaY < 0 ? 1.18 : 1 / 1.18;
            zoomCam(c, c.z * factor, fx, fy);
            applyCamDom(canvas, c);
        },
        { passive: false },
    );

    // Pincement à deux doigts + glissement à un doigt (tactile)
    document.addEventListener(
        'touchstart',
        e => {
            const canvas = canvasOf(e.target);
            if (!canvas || e.target.closest('.sk-zctl')) return;
            if (e.touches.length === 2) {
                e.preventDefault();
                drag = null;
                const [a, b] = e.touches;
                const c = getCam();
                pinch = {
                    canvas,
                    d0: Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY) || 1,
                    mx: (a.clientX + b.clientX) / 2,
                    my: (a.clientY + b.clientY) / 2,
                    z0: c.z,
                    tx0: c.tx,
                    ty0: c.ty,
                };
            } else if (e.touches.length === 1 && getCam().z > 1.02) {
                const t = e.touches[0];
                const c = getCam();
                drag = { canvas, sx: t.clientX, sy: t.clientY, tx0: c.tx, ty0: c.ty, moved: false, touch: true };
            }
        },
        { passive: false },
    );

    document.addEventListener(
        'touchmove',
        e => {
            if (pinch && e.touches.length === 2) {
                e.preventDefault();
                const [a, b] = e.touches;
                const d = Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY) || 1;
                const mx = (a.clientX + b.clientX) / 2;
                const my = (a.clientY + b.clientY) / 2;
                const [fx, fy, r] = focalOf(pinch.canvas, pinch.mx, pinch.my);
                const c = getCam();
                c.z = pinch.z0;
                c.tx = pinch.tx0;
                c.ty = pinch.ty0;
                zoomCam(c, pinch.z0 * (d / pinch.d0), fx, fy);
                c.tx += ((mx - pinch.mx) / r.width) * 100;
                c.ty += ((my - pinch.my) / r.height) * 100;
                clampCam(c);
                applyCamDom(pinch.canvas, c);
                suppressUntil = performance.now() + 260;
            } else if (drag && drag.touch && e.touches.length === 1) {
                const t = e.touches[0];
                const dx = t.clientX - drag.sx;
                const dy = t.clientY - drag.sy;
                if (!drag.moved && Math.hypot(dx, dy) < 6) return;
                drag.moved = true;
                e.preventDefault();
                const r = drag.canvas.getBoundingClientRect();
                const c = getCam();
                c.tx = drag.tx0 + (dx / r.width) * 100;
                c.ty = drag.ty0 + (dy / r.height) * 100;
                clampCam(c);
                applyCamDom(drag.canvas, c);
                suppressUntil = performance.now() + 220;
            }
        },
        { passive: false },
    );

    document.addEventListener('touchend', e => {
        if (e.touches.length < 2) pinch = null;
        if (e.touches.length === 0) drag = null;
    });

    // Glissement souris sur ordinateur quand zoomé
    document.addEventListener('mousedown', e => {
        if (e.button !== 0) return;
        const canvas = canvasOf(e.target);
        if (!canvas || e.target.closest('.sk-zctl') || getCam().z <= 1.02) return;
        const c = getCam();
        drag = { canvas, sx: e.clientX, sy: e.clientY, tx0: c.tx, ty0: c.ty, moved: false, touch: false };
    });
    document.addEventListener('mousemove', e => {
        if (!drag || drag.touch) return;
        const dx = e.clientX - drag.sx;
        const dy = e.clientY - drag.sy;
        if (!drag.moved && Math.hypot(dx, dy) < 6) return;
        drag.moved = true;
        const r = drag.canvas.getBoundingClientRect();
        const c = getCam();
        c.tx = drag.tx0 + (dx / r.width) * 100;
        c.ty = drag.ty0 + (dy / r.height) * 100;
        clampCam(c);
        applyCamDom(drag.canvas, c);
        suppressUntil = performance.now() + 200;
    });
    document.addEventListener('mouseup', () => {
        if (drag && !drag.touch) drag = null;
    });
}

export function setupProgress() {
    bindCamGestures();
    actions({
        branch: (el, d) => {
            ui.sel.branch = d.b;
            const br = SKILLS[d.b];
            if (br) {
                ui.sel.skWing = br.wing;
                ui.sel.skNode = { b: d.b, k: 0 };
            }
        },
        skWing: (el, d) => {
            ui.sel.skWing = d.v;
            if (d.v !== 'all' && WING_BY_ID[d.v]) {
                const cur = ui.sel.skNode;
                if (!cur || !WING_BY_ID[d.v].branches.includes(cur.b)) {
                    ui.sel.skNode = { b: WING_BY_ID[d.v].branches[0], k: 0 };
                }
            }
        },
        skZoom: (el, d) => {
            const c = getCam();
            const canvas = el && el.closest && el.closest('.sk-canvas.mode-all');
            if (d.d === 'toggle') {
                if (c.z > 1.05) {
                    c.z = 1;
                    c.tx = 0;
                    c.ty = 0;
                } else {
                    zoomCam(c, 1.85, 0, 0);
                }
            } else {
                zoomCam(c, c.z + Number(d.d || 0), 0, 0);
            }
            applyCamDom(canvas, c);
        },
        skPick: (el, d) => {
            ui.sel.skNode = { b: d.b, k: +d.k };
        },
        learn: (el, d) => G.learnSkill(d.b, +d.k, el),
        respec: el => confirmTap('respec', el, `Touchez encore : ${fmt(G.respecCost())} pièces`) && G.respecSkills(),
        abandon: el => confirmTap('abandon', el, 'Confirmer ?') && G.abandonChallenge(),
        pickChallenge: (el, d) => (sheetOpts('prestige').ch = d.c),
        pickTheme: (el, d) => (sheetOpts('prestige').theme = d.t),
        doPrestige: () => {
            const o = sheetOpts('prestige');
            closeAll();
            G.doPrestige(o.ch, o.theme);
        },
    });
}

