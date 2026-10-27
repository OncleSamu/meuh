// Animaux : le pâturage, les bêtes qui se promènent, la fiche de chaque animal et la transhumance.
import { state } from '../../core/state.js';
import { fmt, formatDuration } from '../../core/format.js';
import { on } from '../../core/bus.js';
import { ANIMALS, MAX_STACK } from '../../data/animals.js';
import { ITEMS } from '../../data/items.js';
import * as G from '../../systems/index.js';
import { byId, blocks, esc, actions, QUIET } from '../dom.js';
import { confirmTap } from '../confirm.js';
import { ico, art } from '../icons.js';
import { btn, hearts, bar, timer, lines, segmented, tip15 } from '../kit.js';
import { defineView, defineLive, ui, currentPath, go } from '../app.js';
import { defineSheet, openSheet, closeSheet } from '../sheets.js';
import { STUD } from '../../data/haras.js';
import { genWrap, looksText, animalKey, featuresText, lineageHtml } from '../genlook.js';
import { animalTraits } from './lab.js';
import { reduceMotion, burstAt } from '../fx.js';
import { pinBar } from './common.js';
import { longPress } from '../longpress.js';
import { renameBtn } from '../sheets/rename.js';
import { askBuy } from '../sheets/askbuy.js';
import { PASTURE } from '../../data/farm.js';

// les bêtes du pré de l'onglet Animaux, et celles du pré de l'enclos ou de l'étable (vues oasis et Nord)
const main = { els: [], key: '' },
    pen = { els: [], key: '' };

// une place libre dans le pré : loin des autres bêtes et hors de la mare
function freeSpot(self, list = main.els) {
    const others = list.filter(e => e && e !== self && e.style.left).map(e => [parseFloat(e.style.left), parseFloat(e.style.top)]);
    let best = null,
        bestD = -1;
    // marges en pixels : la bulle au-dessus, le nom en dessous, la mare en bas à droite
    const h = (self && self.parentElement && self.parentElement.offsetHeight) || 380;
    const y0 = (84 / h) * 100,
        y1 = 100 - (46 / h) * 100,
        pond = 100 - (120 / h) * 100;
    for (let k = 0; k < 14; k++) {
        const x = 12 + Math.random() * 70,
            y = y0 + Math.random() * (y1 - y0);
        if (x > 62 && y > pond) continue; // la mare
        const d = others.reduce((m, [ox, oy]) => Math.min(m, Math.hypot(x - ox, (y - oy) * 1.4)), 999);
        if (d > bestD) [best, bestD] = [[x, y], d];
    }
    return best || [30, 40];
}

const babyBody = a =>
    a.type === 'chicken'
        ? art('ui', 'chick')
        : a.type === 'duck'
          ? art('ui', 'duckling')
          : a.type === 'horse'
            ? art('animal', animalKey('horse', a.g, G.growPct(a) < STUD.stages[0] ? 0 : 1))
            : art('animal', a.type);
// le dessin d'une bête, avec l'apparence de ses gènes (robe, taille, motif)
const bodyOf = a => genWrap(G.isAdult(a) ? art('animal', animalKey(a.type, a.g)) : babyBody(a), a.g);

// le pré regardé : un numéro, ou 'all' (l'étable de tout le troupeau)
const shownPasture = () => {
    const k = ui.sel.pasture;
    return k === 'all' || (typeof k === 'number' && k < state.pastures.length) ? k : 0;
};
const meadowPasture = () => (shownPasture() === 'all' ? 0 : shownPasture());
const herdIdx = k => state.animals.map((a, i) => i).filter(i => (state.animals[i].p || 0) === k);

function build(meadow, idx, hold) {
    meadow.querySelectorAll('.critter').forEach(n => n.remove());
    const placed = [];
    hold.els = [];
    idx.forEach(i => {
        const el = document.createElement('div');
        el.className = 'critter';
        // un appui ouvre la fiche au « clic » : avec un appui au doigt, la fiche ouverte trop tôt se refermait aussitôt
        el.dataset.act = 'animal';
        el.dataset.i = i;
        el.dataset.anchor = 'animal:' + i;
        el.innerHTML = `<div class="critter-body"></div><div class="bubble"></div><div class="food-meter"></div>${bar(0, 'cbar', `prod:${i}`)}${bar(0, 'gbar', `grow:${i}`)}<div class="critter-name"></div>`;
        meadow.appendChild(el);
        const [x, y] = freeSpot(el, placed);
        placed.push(el);
        el.style.transition = 'none';
        el.style.left = x + '%';
        el.style.top = y + '%';
        requestAnimationFrame(() => (el.style.transition = ''));
        hold.els[i] = el;
    });
}

function renderCritters(meadow = byId('pasture'), k = meadowPasture(), hold = main) {
    if (!meadow) return;
    const idx = herdIdx(k);
    const key = idx.join(',');
    const first = hold.els[idx[0]];
    if (key !== hold.key || (first && !first.isConnected) || (idx.length && !first)) {
        build(meadow, idx, hold);
        hold.key = key;
    }
    const mf = G.maxFood();
    idx.forEach(i => {
        const a = state.animals[i];
        const el = hold.els[i],
            d = ANIMALS[a.type];
        const adult = G.isAdult(a);
        const sig = `${a.type}|${adult}|${a.g ? JSON.stringify(G.looksOf(a.g)) : ''}|${a.g && a.g.coat ? G.coatKey(a.g) : ''}|${a.type === 'horse' && !adult ? (G.growPct(a) < STUD.stages[0] ? 0 : 1) : ''}|${esc(a.name)}|${a.race || ''}|${a.love}|${a.star ? 1 : 0}|${G.isAway(a) ? 1 : 0}|${a.stack}|${a.food}|${mf}|${a.sick ? 1 : 0}`;
        if (el._sig === sig) return;
        el._sig = sig;
        el.classList.toggle('baby', !adult);
        el.classList.toggle('foal', !adult && a.type === 'horse');
        el.classList.toggle('star', !!a.star);
        el.classList.toggle('away', G.isAway(a));
        el.classList.toggle('sick', !!a.sick);
        el.classList.toggle('busy', G.isBusy(a));
        el.querySelector('.critter-body').innerHTML = bodyOf(a);
        el.querySelector('.critter-name').innerHTML =
            `${a.star ? ico(['ui', 'star']) : ''}${a.race ? ico(['ui', 'ribbon']) : ''}${a.love ? ico(['ui', 'heart']) : ''}${esc(a.name)}`;
        const bubble = el.querySelector('.bubble');
        let b = '';
        if (a.sick) b = ico(['ui', 'sick']);
        else if (a.stack > 0) b = `${ico(['item', d.prodId])}×${a.stack}`;
        else if (a.food === 0 && adult) b = ico(['item', 'feed']);
        bubble.innerHTML = b;
        bubble.classList.toggle('show', !!b);
        el.querySelector('.food-meter').innerHTML = Array.from({ length: mf }, (_, k) => `<i class="${k < a.food ? 'on' : ''}"></i>`).join('');
        el.style.zIndex = Math.round(parseFloat(el.style.top) || 0) + (b ? 100 : 0);
    });
}

defineLive('prod', i => {
    const a = state.animals[i];
    return a && G.isAdult(a) ? (a.stack >= MAX_STACK ? 1 : G.prodPct(a)) : 0;
});
defineLive('grow', i => {
    const a = state.animals[i];
    return a && !G.isAdult(a) ? G.growPct(a) : 0;
});

export function wanderAnimals() {
    if (reduceMotion()) return;
    const lists = [];
    if (currentPath() === 'animals/pasture') lists.push(main.els);
    if (byId('pasture-pen')) lists.push(pen.els);
    lists.forEach(list => walk(list));
}
function walk(list) {
    list.forEach(el => {
        if (!el) return;
        if (Math.random() > 0.3 || !el.isConnected) return;
        const [x, y] = freeSpot(el, list);
        el.classList.toggle('flip', x < parseFloat(el.style.left));
        el.classList.add('walking');
        el.style.left = x + '%';
        el.style.top = y + '%';
        el.style.zIndex = Math.round(y) + (el.querySelector('.bubble.show') ? 100 : 0);
        clearTimeout(el._stop);
        el._stop = setTimeout(() => el.classList.remove('walking'), 3200);
    });
}

// ---------------- transhumance ----------------
function transCard() {
    if (!G.transOpen()) return null;
    const t = state.trans;
    if (t.returnAt) {
        const away = state.animals.filter(G.isAway);
        return `<div class="card trans-card"><div class="card-head">${ico(['ui', 'mountain'], 'ico big')}<div class="card-main"><div class="card-title">Transhumance en cours</div>
            <div class="card-sub">${away.map(a => esc(a.name)).join(', ')} profite${away.length > 1 ? 'nt' : ''} de l’herbe des estives.</div></div><span class="timer-pill">${ico(['ui', 'clock'])}${timer(t.returnAt)}</span></div></div>`;
    }
    const pick = ui.sel.trans || [];
    const can = G.transCandidates();
    return `<div class="card trans-card"><div class="card-head">${ico(['ui', 'mountain'], 'ico big')}<div class="card-main"><div class="card-title">Transhumance</div>
        <div class="card-sub">Choisissez jusqu’à ${G.transMax()} vaches, chèvres, moutons ou bufflonnes. Partis ${formatDuration(G.transTime() / 1000)}, ils reviennent avec du lait d’alpage (de la laine pour les moutons) et produisent ensuite 20 % plus vite.</div></div></div>
        <div class="chips-row">${
            can.length
                ? can
                      .map(
                          ([a, i]) =>
                              `<button class="pick-chip${pick.includes(i) ? ' on' : ''}${a.alpine ? ' alpine' : ''}" data-act="transPick" data-i="${i}">${ico(['animal', a.type])}<span>${esc(a.name)}</span></button>`,
                      )
                      .join('')
                : '<span class="card-sub">Aucun animal adulte qui puisse monter.</span>'
        }</div>
        ${btn(`Monter aux estives (${pick.length}/${G.transMax()})`, { act: 'startTrans', kind: pick.length ? 'green' : '', wide: true, disabled: !pick.length })}</div>`;
}

// le pré grandit avec le troupeau pour que chacun ait sa place
const meadowHtml = n =>
    `<div class="meadow${n > 14 ? ' crowd' : ''}" id="pasture" style="height:${Math.min(1000, Math.max(380, 160 + n * 42))}px"><div class="pond"></div>${n ? '' : `<div class="empty">${state.animals.length ? 'Ce pré est vide : déplacez-y des bêtes depuis leur fiche.' : 'Votre pâturage est vide. Achetez une poule au marché pour commencer.'}</div>`}</div>`;

// une bête de l'étable
export function stableTile(a, i, mf) {
    const d = ANIMALS[a.type],
        adult = G.isAdult(a);
    const tag = a.sick
        ? `<span class="st-tag sick">${ico(['ui', 'sick'])}</span>`
        : a.stack > 0
          ? `<span class="st-tag ready">${ico(['item', d.prodId])}×${a.stack}</span>`
          : a.food === 0 && adult
            ? `<span class="st-tag hungry">${ico(['item', 'feed'])}</span>`
            : G.isAway(a)
              ? `<span class="st-tag">${ico(['ui', 'mountain'])}</span>`
              : '';
    return `<button class="st-tile${a.stack > 0 ? ' ready' : ''}${a.sick ? ' sick' : ''}${G.isAway(a) ? ' away' : ''}" data-act="animal" data-i="${i}" data-anchor="animal:${i}">
        ${tag}<span class="st-art${adult ? '' : ' baby'}">${bodyOf(a)}</span>
        <b>${a.star ? ico(['ui', 'star']) : ''}${a.race ? ico(['ui', 'ribbon']) : ''}${esc(a.name)}</b>
        <span class="food-meter">${Array.from({ length: mf }, (_, k) => `<i class="${k < a.food ? 'on' : ''}"></i>`).join('')}</span>
        ${adult ? bar(0, 'cbar', `prod:${i}`) : bar(0, 'gbar', `grow:${i}`)}</button>`;
}

// l'étable : le troupeau en fiches compactes, par pré puis par espèce
function stableHtml(k) {
    const mf = G.maxFood();
    const group = p => {
        const order = herdIdx(p)
            .map(i => [state.animals[i], i])
            .sort((x, y) => (x[0].type < y[0].type ? -1 : x[0].type > y[0].type ? 1 : x[1] - y[1]));
        return order.map(([a, i]) => stableTile(a, i, mf)).join('');
    };
    if (k !== 'all') return `<div class="stable">${group(k) || '<p class="empty">Ce pré est vide.</p>'}</div>`;
    return state.pastures
        .map((p, j) =>
            G.pastureLoad(j)
                ? `<h3 class="section-title st-head"><span>${esc(p.name)}</span>${renameBtn('pasture', j, 'Renommer ce pré')}<small>${G.pastureLoad(j)}/20</small></h3><div class="stable">${group(j)}</div>`
                : '',
        )
        .join('');
}

// 1.45 : l'interrupteur des naissances du pré regardé (éteint par défaut), et quand arrive le prochain petit
export function birthRow(k) {
    if (!G.birthsOpen() || !G.penOf(k)) return '';
    const on = G.birthsOn(k);
    const pairs = Object.keys(G.birthPairs(k));
    const next = G.nextBirthIn(k);
    const sub = !on
        ? 'Éteintes : aucun petit ne naîtra dans ce pré'
        : !pairs.length
          ? 'Il faut deux adultes de la même espèce'
          : G.pastureFree(k) <= 0
            ? 'Le pré est plein : plus de place pour un petit'
            : `Prochain petit dans ${timer(Date.now() + next)}`;
    return `<button class="row toggle birth-row" data-act="toggleBirths" data-k="${k}" role="switch" aria-checked="${on}"><span class="row-main"><span>${ico(['ui', 'heart'])}Naissances</span><small>${sub}</small></span><span class="switch${on ? ' on' : ''}"><i></i></span></button>`;
}

// 1.46 : les associations actives dans le pré regardé
export function assocRow(k) {
    const list = G.pastureAssocs(k);
    if (!list.length) return '';
    return `<button class="assoc-row" data-act="open" data-sheet="herdbook" data-tab="pairs">${list
        .map(
            P =>
                `<span class="chip ${P.bad ? 'bad' : 'ok'}">${ico(['animal', P.a])}${ico(['animal', P.b])}${P.f > 0 ? '+' : '−'}${Math.round(Math.abs(P.f) * 100)} %</span>`,
        )
        .join('')}</button>`;
}

// les prés : une pastille par pré, et le bouton pour en acheter un
function pastureBar(mode, cur) {
    const chips = state.pastures
        .map((p, k) => {
            const n = G.pastureLoad(k);
            return `<button class="pas-chip${cur === k ? ' on' : ''}${n >= 20 ? ' full' : ''}" data-act="pickPasture" data-k="${k}"><span>${esc(p.name)}</span><small>${n}/20</small></button>`;
        })
        .join('');
    const all =
        mode === 'stable' && state.pastures.length > 1
            ? `<button class="pas-chip${cur === 'all' ? ' on' : ''}" data-act="pickPasture" data-k="all"><span>Tous les prés</span><small>${state.animals.filter(a => !a.box).length}</small></button>`
            : '';
    const add = G.canAddPasture()
        ? `<button class="pas-chip add${G.herdFull() ? ' urge' : ''}" data-act="buyPasture">${ico(['ui', 'plus'])}<span>Nouveau pré</span><small>${fmt(G.pastureCost())}${ico(['ui', 'coin'])}</small></button>`
        : '';
    const ren = typeof cur === 'number' && state.pastures[cur] ? `<span class="pas-ren">${renameBtn('pasture', cur, 'Renommer ce pré')}</span>` : '';
    return `<div class="pas-bar">${all}${chips}${ren}${add}</div>${typeof cur === 'number' ? birthRow(cur) + assocRow(cur) : ''}`;
}

function renderAnimals(el) {
    const n = state.animals.length;
    const mode = n > 0 ? ui.sel.animalMode || (n > 16 ? 'stable' : 'meadow') : 'meadow';
    let k = shownPasture();
    if (mode === 'meadow' && k === 'all') k = 0;
    if (mode === 'stable' && ui.sel.pasture === undefined && state.pastures.length > 1) k = 'all';
    blocks(el, [
        [
            'top',
            `<div class="view-top end"><div class="actions">${btn('Nourrir', { act: 'feedAll', kind: 'gold', size: 'sm', icon: ['item', 'feed'], anchor: 'btn:feed' })}${btn('Ramasser', { act: 'collectAnimals', kind: 'green', size: 'sm', icon: ['ui', 'basket'], anchor: 'btn:collect' })}</div></div>`,
        ],
        ['pin', pinBar()],
        [
            'mode',
            n > 0
                ? segmented(
                      [
                          ['meadow', 'Le pré', ['ui', 'flowers']],
                          ['stable', 'L’étable', ['ui', 'barn']],
                      ],
                      mode,
                      'animalMode',
                  )
                : '',
        ],
        ['pastures', n || state.pastures.length > 1 ? pastureBar(mode, k) : ''],
        ['meadow', mode === 'stable' ? stableHtml(k) : meadowHtml(G.pastureLoad(k))],
        [
            'hint',
            tip15(
                mode === 'stable'
                    ? 'Touchez une bête pour ramasser sa production ou la nourrir. Restez appuyé pour ouvrir sa fiche : câlin, nom et pré.'
                    : 'Touchez une bête pour ramasser ou la nourrir (un sac = une production). Restez appuyé pour ouvrir sa fiche : câlin, nom et pré.',
            ),
        ],
        ['trans', transCard()],
    ]);
    if (mode === 'meadow') renderCritters();
}

// 1.58.3 : le pré de l'enclos de la palmeraie ou de l'étable du Nord, sous leur verger : les bêtes s'y promènent comme dans l'onglet Animaux
export const penMeadowHtml = (k, theme) => {
    const n = G.pastureLoad(k);
    return `<div class="meadow pen-meadow ${theme}" id="pasture-pen" data-pen="${k}" style="height:${Math.min(700, Math.max(260, 140 + n * 36))}px"><div class="pond"></div>${n ? '' : `<div class="empty">${k === 99 ? 'L’enclos est vide. Dromadaires, zébus et moutons barbarins vous attendent au marché.' : 'L’étable est vide. Rennes, bœufs musqués et lagopèdes vous attendent au marché.'}</div>`}</div>`;
};
// 1.58.4 : comme dans Animaux, on choisit le pré (les bêtes se promènent) ou l'étable (la liste)
export const penModeBar = k =>
    G.pastureLoad(k)
        ? segmented(
              [
                  ['meadow', 'Le pré', ['ui', 'flowers']],
                  ['stable', 'L’étable', ['ui', 'barn']],
              ],
              ui.sel.penMode || 'meadow',
              'penMode',
          )
        : '';
export function penBodyHtml(k, theme) {
    if ((ui.sel.penMode || 'meadow') !== 'stable' || !G.pastureLoad(k)) return penMeadowHtml(k, theme);
    const mf = G.maxFood();
    const idx = herdIdx(k).sort((x, y) => (state.animals[x].type < state.animals[y].type ? -1 : state.animals[x].type > state.animals[y].type ? 1 : x - y));
    return `<div class="stable oa-stable">${idx.map(i => stableTile(state.animals[i], i, mf)).join('')}</div>`;
}
export function renderPenCritters() {
    const m = byId('pasture-pen');
    if (m) renderCritters(m, +m.dataset.pen, pen);
}
defineView('animals/pasture', renderAnimals);

// ---------------- les gènes d'une bête (station de recherche) ----------------
// 1.45.1 : avant le labo, les gènes se lisent quand même (la foire et le Comice les demandent), avec ce qu'ils font
function simpleGenes(a) {
    if (!a.g || !G.birthsOpen() || G.BIRTHS_SKIP.includes(a.type)) return '';
    return `<div class="gene-box"><div class="set-sub">Ses gènes ${btn('?', { act: 'open', data: { sheet: 'guide', page: 'elevage' }, size: 'sm', kind: 'ghost', title: 'Les gènes des bêtes' })}</div>
        <p class="card-sub">Pastilles jaunes : la moyenne de l’espèce ; en vert, ce que ${esc(a.name)} a en plus. Ses petits en héritent.</p>
        ${animalTraits(a, true)}</div>`;
}
function geneBlock(a) {
    if (!state.genetics || !G.geneticsOpen() || !a.g) return simpleGenes(a);
    const race = a.race && state.genetics.races[a.race];
    const can = G.canFixRace(a);
    return `<div class="gene-box"><div class="set-sub">Ses gènes${race ? ` · race « ${esc(race.name)} »` : a.gen ? ` · génération ${a.gen}` : ''}</div>
        <p class="card-sub">${[G.coatText(a.g), looksText(a.g), featuresText(a.type, a.g)].filter(Boolean).join(', ')}${a.parents ? ` · ${a.type === 'horse' ? 'issu' : a.born === 'pre' ? 'née au pré,' : 'fille'} de ${a.parents.map(esc).join(' et ')}` : ''}${a.type === 'horse' && G.isRetired(a) ? ' · reproducteur à la retraite' : ''}</p>
        ${G.geneEffects(a).length ? `<p class="card-sub gene-fx">${ico(['ui', race ? 'ribbon' : 'star'])}${race ? 'Ce que lui donne sa race' : 'Ce que lui donnent ses gènes'} : ${G.geneEffects(a).join(', ')}.</p>` : ''}
        ${a.lin ? lineageHtml({ lin: a.lin, me: G.lineSnap(a) }) : ''}
        ${animalTraits(a, true)}
        <div class="row-btns wrap">${G.labOpen() && !a.analyzed ? btn(`Analyser · ${fmt(G.analyzeCost())}${ico(['ui', 'coin'])}`, { act: 'analyze', data: { id: a.uid }, size: 'sm', icon: ['ui', 'search'] }) : ''}${G.breedOpen() && G.isAdult(a) && !G.breeding(a.uid) ? btn('Choisir pour l’élevage', { act: 'breedWith', data: { id: a.uid }, size: 'sm', icon: ['ui', 'heart'] }) : ''}</div>
        ${can ? `<div class="rename"><input type="text" maxlength="22" id="race-name" placeholder="Nom de la race">${btn('Fixer la race', { act: 'fixRace', data: { id: a.uid }, kind: 'gold', size: 'sm' })}</div>` : ''}
    </div>`;
}

// ---------------- la fiche d'un animal ----------------
const FEM_KIND = ['cow', 'goat', 'chicken', 'ewe', 'guinea', 'ostrich', 'mohairGoat', 'quail'];
defineSheet('animal', {
    cls: 'animal-sheet',
    title: o => {
        const a = state.animals[o.i];
        return a ? esc(a.name) : '';
    },
    render(o) {
        const i = +o.i,
            a = state.animals[i];
        if (!a) return '<p class="empty">Cet animal n’est plus là.</p>';
        const d = ANIMALS[a.type],
            p = ITEMS[d.prodId];
        const adult = G.isAdult(a);
        const info = [];
        if (!adult) info.push([['ui', 'clock'], `Devient adulte dans ${formatDuration(G.growLeft(a))}. Vous pouvez déjà remplir sa mangeoire.`]);
        else
            info.push([
                ['item', d.prodId],
                `${p.name} toutes les ${formatDuration(G.animalTime(a))}${a.love ? ` (+${a.love * 4} % grâce à l’affection)` : ''}`,
            ]);
        info.push([['item', 'feed'], `Mangeoire : ${a.food} / ${G.maxFood()} repas`]);
        if (a.produced) info.push([['ui', 'basket'], G.producedText(a)]);
        // 1.49 : une bête de l'oasis
        if (ANIMALS[a.type].oasis) {
            info.push([
                ['ui', 'oaEnclos'],
                `Vit dans l’enclos de la palmeraie, à l’oasis ; boit ${String(ANIMALS[a.type].drink).replace('.', ',')} L par heure à la citerne`,
            ]);
            if (a.noria) info.push([['ui', 'oaNoria'], `Tourne la noria : +8 L/h à la source, mais pas de lait`]);
            else if (a.trip) info.push([['ui', 'oaCaravane'], 'Parti en caravane au souk de la ville']);
            else if (adult && G.isHot() && !G.penShaded(a) && a.type !== 'barbarySheep')
                info.push([['ui', 'oaMidi'], 'Au soleil de midi : il produit deux fois moins vite']);
        }
        // 1.52 : une bête du Grand Nord
        if (ANIMALS[a.type].nord) {
            info.push([['ui', 'noPoeleOn'], 'Vit dans l’étable de rondins, au Grand Nord']);
            if (adult && ANIMALS[a.type].cold && G.isFrost())
                info.push(
                    G.nordSheltered(a)
                        ? [['ui', 'noChaleur'], 'À l’abri d’un poêle allumé : nuit de gel sans souci']
                        : [['ui', 'noFroid'], 'Nuit de gel, hors d’un poêle allumé : il produit deux fois moins vite'],
                );
        }
        // 1.45 : né au pré, de quels parents (au labo, la fiche des gènes le dit déjà)
        if (a.born === 'pre' && a.parents && !(state.genetics && G.geneticsOpen() && a.g))
            info.push([
                ['ui', 'heart'],
                `Né${FEM_KIND.includes(a.type) ? 'e' : ''} au pré, de ${a.parents.map(esc).join(' et ')}${a.race ? '' : ' (sans papiers)'}`,
            ]);
        const petted = a.petDay === state.day;
        return `<div class="animal-card">
            <div class="animal-art${adult ? '' : ' baby'}" data-anchor="animalArt">${bodyOf(a)}</div>
            <div class="animal-kind">${adult ? d.name : `Bébé ${d.name.toLowerCase()}`}${a.star ? ` · ${ico(['ui', 'star'])} d’exception` : ''}</div>
            <div class="hearts-big">${hearts(a.love)}</div>
            ${a.sick ? `<div class="line sick">${ico(['ui', 'sick'])}<div>${esc(a.name)} est malade et ne produit plus.</div>${btn(`Soigner · ${G.cureCost()}${ico(['ui', 'coin'])}`, { act: 'cure', data: { i }, kind: 'green', size: 'sm' })}</div>` : ''}
            ${lines(info)}
            <div class="row-btns">${btn(a.love >= 5 ? 'Affection au maximum' : petted ? 'Déjà câliné aujourd’hui' : 'Faire un câlin', { act: 'pet', data: { i }, kind: 'gold', disabled: petted || a.love >= 5, icon: ['ui', 'heart'] })}${btn('Nourrir', { act: 'feedOne', data: { i }, icon: ['item', 'feed'] })}</div>
            ${a.type === 'zebu' && adult && G.noriaBuilt() ? `<div class="row-btns">${btn(a.noria ? 'Dételer de la noria' : 'Atteler à la noria', { act: 'noriaToggle', data: { uid: a.uid }, kind: a.noria ? '' : 'gold', icon: ['ui', 'oaNoria'] })}</div>` : ''}
            ${
                state.pastures.length > 1 && !ANIMALS[a.type].oasis && !ANIMALS[a.type].nord
                    ? `<div class="set-sub">Son pré</div><div class="chips-row pas-move">${state.pastures
                          .map((p, k) => {
                              const here = (a.p || 0) === k,
                                  full = !here && G.pastureFree(k) <= 0;
                              return `<button class="pick-chip${here ? ' on' : ''}" data-act="moveAnimal" data-i="${i}" data-k="${k}" ${full ? 'disabled' : ''}><span>${esc(p.name)}</span><small>${G.pastureLoad(k)}/20</small></button>`;
                          })
                          .join('')}</div>`
                    : ''
            }
            ${geneBlock(a, i)}
            <div class="rename"><input type="text" maxlength="16" value="${esc(a.name)}" aria-label="Nom de l’animal" id="rename-animal">${btn('Renommer', { act: 'renameAnimal', data: { i }, size: 'sm' })}</div>
            <div class="row-btns">${
                G.animalSellBlock(a)
                    ? `<p class="card-sub center">${G.animalSellBlock(a)} : impossible de la vendre pour l’instant.</p>`
                    : btn(`${G.fairOpen() ? 'Vendre au maquignon' : 'Vendre'} · ${fmt(G.animalSalePrice(a))}${ico(['ui', 'coin'])}`, {
                          act: 'sellAnimal',
                          data: { i },
                          kind: 'red',
                          size: 'sm',
                      }) +
                      (G.fairOpen() && !G.BIRTHS_SKIP.includes(a.type)
                          ? btn('Voir les acheteurs', { act: 'go', data: { path: 'market/sell#beasts' }, kind: 'gold', size: 'sm' })
                          : '')
            }</div>
        </div>`;
    },
});

// appui long : la fiche de la bête (un appui court ramasse ou nourrit)
const setupLongPress = () => {
    longPress(byId('view-animals'), '.critter[data-i], .st-tile[data-i]', el => openSheet('animal', { i: +el.dataset.i }));
    // 1.49 : les bêtes de l'enclos, dans la vue de l'oasis
    longPress(byId('view-farm'), '.st-tile[data-i], .pen-meadow .critter[data-i]', el => openSheet('animal', { i: +el.dataset.i }));
};

export function setupAnimals() {
    actions({
        noriaToggle: (el, d) => G.toggleNoria(d.uid),
        animalMode: (el, d) => (ui.sel.animalMode = d.v),
        penMode: (el, d) => (ui.sel.penMode = d.v),
        sellAnimal: (el, d) => {
            const a = state.animals[+d.i];
            if (!a || !confirmTap('sell' + a.uid, el, `Toucher encore pour vendre ${a.name}`)) return QUIET;
            if (G.sellAnimal(+d.i, el)) closeSheet('animal');
        },
        breedWith: (el, d) => {
            ui.sel.breed = { a: d.id };
            closeSheet('animal');
            go('machines/lab');
        },
        fixRace: (el, d) => {
            const input = document.getElementById('race-name');
            G.fixRace(d.id, input ? input.value : '', el);
        },
        pickPasture: (el, d) => (ui.sel.pasture = d.k === 'all' ? 'all' : +d.k),
        toggleBirths: (el, d) => G.toggleBirths(+d.k),
        buyPasture: el =>
            askBuy(
                {
                    title: 'Un pré de plus',
                    icon: ['ui', 'barn'],
                    text: `Un nouveau pré pour ${PASTURE.cap} bêtes.`,
                    cost: G.pastureCost(),
                    run: at => {
                        const k = G.buyPasture(at);
                        if (k !== false) ui.sel.pasture = k;
                    },
                },
                el,
            ),
        moveAnimal: (el, d) => G.moveAnimal(+d.i, +d.k),
        feedAll: el => G.feedAll(el),
        collectAnimals: el => G.collectAll(el),
        animal: (el, d) => G.tapAnimal(+d.i, el),
        pet: (el, d) => G.petAnimal(+d.i, byId('sheets').querySelector('[data-anchor="animalArt"]')),
        feedOne: (el, d) => G.feedOne(+d.i, byId('sheets').querySelector('[data-anchor="animalArt"]')),
        cure: (el, d) => G.cureAnimal(+d.i, el),
        renameAnimal: (el, d) => {
            const input = document.getElementById('rename-animal');
            if (input && G.renameAnimal(+d.i, input.value)) input.blur();
        },
        transPick: (el, d) => {
            const pick = (ui.sel.trans = ui.sel.trans || []);
            const i = +d.i,
                k = pick.indexOf(i);
            if (k >= 0) pick.splice(k, 1);
            else if (pick.length < G.transMax()) pick.push(i);
        },
        startTrans: el => {
            if (G.startTrans(ui.sel.trans, el)) ui.sel.trans = [];
        },
    });
    setupLongPress();
    on('animalFx', ({ i }) => {
        const el = main.els[i] || pen.els[i];
        if (!el || !el.isConnected) return;
        const r = el.getBoundingClientRect();
        burstAt(r.left + r.width / 2, r.top + r.height / 2 - 20, 'sparkle', 5);
    });
    on('animalsFx', kind =>
        [...main.els, ...pen.els].forEach((el, k) => {
            if (!el || !el.isConnected) return;
            const r = el.getBoundingClientRect();
            setTimeout(() => burstAt(r.left + r.width / 2, r.top + r.height / 2 + 10, kind, 5), k * 40);
        }),
    );
    on('reset', () => {
        main.els = [];
        pen.els = [];
    });
}
