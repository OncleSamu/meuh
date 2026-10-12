// Animaux : le pâturage, les bêtes qui se promènent, la fiche de chaque animal et la transhumance.
import { state } from '../../core/state.js';
import { formatDuration } from '../../core/format.js';
import { on } from '../../core/bus.js';
import { ANIMALS, MAX_STACK } from '../../data/animals.js';
import { ITEMS } from '../../data/items.js';
import * as G from '../../systems/index.js';
import { byId, blocks, esc, actions, run } from '../dom.js';
import { ico, art } from '../icons.js';
import { btn, hint, hearts, bar, timer, lines } from '../kit.js';
import { defineView, defineLive, ui, currentPath } from '../app.js';
import { defineSheet, openSheet } from '../sheets.js';
import { reduceMotion, burstAt } from '../fx.js';
import { pinBar } from './common.js';

let els = [];

// une place libre dans le pré : loin des autres bêtes et hors de la mare
function freeSpot(self, list = els) {
    const others = list.filter(e => e && e !== self && e.style.left).map(e => [parseFloat(e.style.left), parseFloat(e.style.top)]);
    let best = null,
        bestD = -1;
    for (let k = 0; k < 14; k++) {
        const x = 12 + Math.random() * 70,
            y = 22 + Math.random() * 56;
        if (x > 62 && y > 64) continue; // la mare
        const d = others.reduce((m, [ox, oy]) => Math.min(m, Math.hypot(x - ox, (y - oy) * 1.4)), 999);
        if (d > bestD) [best, bestD] = [[x, y], d];
    }
    return best || [30, 40];
}

const babyBody = a => (a.type === 'chicken' ? art('ui', 'chick') : a.type === 'duck' ? art('ui', 'duckling') : art('animal', a.type));

function build(meadow) {
    meadow.querySelectorAll('.critter').forEach(n => n.remove());
    const placed = [];
    els = state.animals.map((a, i) => {
        const el = document.createElement('div');
        el.className = 'critter';
        el.dataset.i = i;
        el.dataset.anchor = 'animal:' + i;
        el.innerHTML = `<div class="critter-body"></div><div class="bubble"></div><div class="food-meter"></div>${bar(0, 'cbar', `prod:${i}`)}${bar(0, 'gbar', `grow:${i}`)}<div class="critter-name"></div>`;
        const [x, y] = freeSpot(el, placed);
        placed.push(el);
        el.style.transition = 'none';
        el.style.left = x + '%';
        el.style.top = y + '%';
        meadow.appendChild(el);
        requestAnimationFrame(() => (el.style.transition = ''));
        return el;
    });
}

function renderCritters() {
    const meadow = byId('pasture');
    if (!meadow) return;
    if (els.length !== state.animals.length || (els[0] && !els[0].isConnected)) build(meadow);
    const mf = G.maxFood();
    state.animals.forEach((a, i) => {
        const el = els[i],
            d = ANIMALS[a.type];
        const adult = G.isAdult(a);
        const sig = `${a.type}|${adult}|${esc(a.name)}|${a.love}|${a.star ? 1 : 0}|${G.isAway(a) ? 1 : 0}|${a.stack}|${a.food}|${mf}|${a.sick ? 1 : 0}`;
        if (el._sig === sig) return;
        el._sig = sig;
        el.classList.toggle('baby', !adult);
        el.classList.toggle('star', !!a.star);
        el.classList.toggle('away', G.isAway(a));
        el.classList.toggle('sick', !!a.sick);
        el.classList.toggle('busy', G.isBusy(a));
        el.querySelector('.critter-body').innerHTML = adult ? art('animal', a.type) : babyBody(a);
        el.querySelector('.critter-name').innerHTML = `${a.star ? ico(['ui', 'star']) : ''}${a.love ? ico(['ui', 'heart']) : ''}${esc(a.name)}`;
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
    if (currentPath() !== 'animals' || reduceMotion()) return;
    els.forEach(el => {
        if (Math.random() > 0.3 || !el.isConnected) return;
        const [x, y] = freeSpot(el);
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
        <div class="card-sub">Choisissez jusqu’à ${G.transMax()} vaches, chèvres, moutons ou bufflonnes. Partis ${formatDuration(G.transTime() / 1000)}, ils reviennent avec du lait d’alpage (de la laine pour les moutons) et produisent ensuite 20 % plus vite.</div></div></div>
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

function renderAnimals(el) {
    blocks(el, [
        [
            'top',
            `<div class="view-top"><h2 class="view-title">Pâturage</h2><div class="actions">${btn('Nourrir', { act: 'feedAll', kind: 'gold', size: 'sm', icon: ['item', 'feed'], anchor: 'btn:feed' })}${btn('Ramasser', { act: 'collectAnimals', kind: 'green', size: 'sm', icon: ['ui', 'basket'], anchor: 'btn:collect' })}</div></div>`,
        ],
        ['pin', pinBar()],
        [
            'meadow',
            `<div class="meadow" id="pasture"><div class="pond"></div>${state.animals.length ? '' : '<div class="empty">Votre pâturage est vide. Achetez une poule au marché pour commencer.</div>'}</div>`,
        ],
        ['hint', hint('Chaque sac de nourriture donne une production. Touchez un animal pour ouvrir sa fiche : câlin, nourriture et nom.')],
        ['trans', transCard()],
    ]);
    renderCritters();
}
defineView('animals', renderAnimals);

// ---------------- la fiche d'un animal ----------------
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
        else info.push([['item', d.prodId], `${p.name} toutes les ${formatDuration(G.animalTime(a))}${a.love ? ` (+${a.love * 4} % grâce à l’affection)` : ''}`]);
        info.push([['item', 'feed'], `Mangeoire : ${a.food} / ${G.maxFood()} repas`]);
        if (a.produced) info.push([['ui', 'basket'], G.producedText(a)]);
        const petted = a.petDay === state.day;
        return `<div class="animal-card">
            <div class="animal-art${adult ? '' : ' baby'}" data-anchor="animalArt">${adult ? art('animal', a.type) : babyBody(a)}</div>
            <div class="animal-kind">${adult ? d.name : `Bébé ${d.name.toLowerCase()}`}${a.star ? ` · ${ico(['ui', 'star'])} d’exception` : ''}</div>
            <div class="hearts-big">${hearts(a.love)}</div>
            ${a.sick ? `<div class="line sick">${ico(['ui', 'sick'])}<div>${esc(a.name)} est malade et ne produit plus.</div>${btn(`Soigner · ${G.cureCost()}${ico(['ui', 'coin'])}`, { act: 'cure', data: { i }, kind: 'green', size: 'sm' })}</div>` : ''}
            ${lines(info)}
            <div class="row-btns">${btn(a.love >= 5 ? 'Affection au maximum' : petted ? 'Déjà câliné aujourd’hui' : 'Faire un câlin', { act: 'pet', data: { i }, kind: 'gold', disabled: petted || a.love >= 5, icon: ['ui', 'heart'] })}${btn('Nourrir', { act: 'feedOne', data: { i }, icon: ['item', 'feed'] })}</div>
            <div class="rename"><input type="text" maxlength="16" value="${esc(a.name)}" aria-label="Nom de l’animal" id="rename-animal">${btn('Renommer', { act: 'renameAnimal', data: { i }, size: 'sm' })}</div>
        </div>`;
    },
});

export function setupAnimals() {
    actions({
        feedAll: el => G.feedAll(el),
        collectAnimals: el => G.collectAll(el),
        animal: (el, d) => {
            if (G.tapAnimal(+d.i, el) === 'card') openSheet('animal', { i: +d.i });
        },
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
    byId('view-animals').addEventListener('pointerdown', e => {
        const c = e.target.closest('.critter');
        if (!c) return;
        e.preventDefault();
        run('animal', c, c.dataset);
    });
    on('animalFx', ({ i }) => {
        const el = els[i];
        if (!el || !el.isConnected) return;
        const r = el.getBoundingClientRect();
        burstAt(r.left + r.width / 2, r.top + r.height / 2 - 20, 'sparkle', 5);
    });
    on('animalsFx', kind =>
        els.forEach((el, k) => {
            if (!el.isConnected) return;
            const r = el.getBoundingClientRect();
            setTimeout(() => burstAt(r.left + r.width / 2, r.top + r.height / 2 + 10, kind, 5), k * 40);
        }),
    );
    on('reset', () => (els = []));
}
