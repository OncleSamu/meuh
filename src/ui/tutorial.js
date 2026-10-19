// Le tutoriel de Mamie Odette : quelques gestes guidés, une étape à la fois.
import { state } from '../core/state.js';
import { emit, toast } from '../core/bus.js';
import * as G from '../systems/index.js';
import { byId, actions } from './dom.js';
import { art } from './icons.js';
import { currentPath, save, refresh } from './app.js';
import { anySheet } from './sheets.js';
import { momentShown, pump } from './moments.js';
import { confetti } from './fx.js';

const plotWhere = fn => {
    const i = state.grid.findIndex((p, k) => p.isUnlocked && fn(p, k));
    return i >= 0 ? document.querySelector(`.plot[data-i="${i}"]`) : null;
};
const tab = id => document.querySelector(`#tabs [data-tab="${id}"]`);
const VIEW_NAMES = { 'farm/field': 'Ferme', 'market/sell': 'Marché', 'village/orders': 'Village' };
let base = null;

const STEPS = [
    { text: 'Bienvenue à la ferme ! Je suis Mamie Odette. Je te montre l’essentiel, ça prend une minute.', btn: 'C’est parti !' },
    {
        view: 'farm/field',
        text: 'Avec la main, touche une parcelle d’herbe pour la labourer.',
        start: () => G.selectTool('hand'),
        target: () => plotWhere(p => p.terrain === 'grass'),
        done: () => state.grid.some(p => p.isUnlocked && p.terrain === 'plowed'),
    },
    {
        view: 'farm/field',
        text: 'Bien ! Choisis maintenant les graines de blé : touche le sachet de graines dans la barre du bas.',
        target: () => document.querySelector('.sheet .seed[data-t="wheat"]') || document.querySelector('#toolbar .seeds-btn'),
        done: () => state.selectedTool === 'wheat' || state.grid.some(p => p.itemId),
    },
    {
        view: 'farm/field',
        text: 'Touche la terre labourée pour semer. Astuce : garde le doigt appuyé et glisse sur plusieurs parcelles.',
        target: () => plotWhere(p => p.terrain === 'plowed' && !p.itemId),
        done: () => state.grid.some(p => p.itemId),
    },
    {
        view: 'farm/field',
        text: 'Une graine a besoin d’eau : touche-la pour l’arroser.',
        target: () => plotWhere(p => p.itemId && !p.isWatered && !p.isReady),
        done: () => state.grid.some(p => p.itemId && (p.isWatered || p.isReady)),
    },
    {
        view: 'farm/field',
        text: 'Le blé pousse en une vingtaine de secondes. En attendant, tu peux labourer et semer les autres parcelles.',
        target: () => plotWhere(p => p.itemId && !p.isReady),
        done: () => state.grid.some(p => p.isReady) || state.stats.harvested > base.harvested,
    },
    {
        view: 'farm/field',
        text: 'C’est prêt ! Touche le blé pour le récolter.',
        target: () => plotWhere(p => p.isReady),
        done: () => state.stats.harvested > base.harvested,
    },
    { text: 'Direction le marché pour vendre ta récolte.', target: () => tab('market'), done: () => currentPath().startsWith('market') },
    {
        view: 'market/sell',
        text: 'Touche le prix doré pour tout vendre. Les pièces servent à acheter graines, animaux et machines.',
        target: () => document.querySelector('#view-market .goods [data-n="0"]') || document.querySelector('#subnav [data-v="sell"]'),
        done: () => state.stats.earned > base.earned,
    },
    {
        text: 'Dernière chose : les villageois passent des commandes bien payées. Va voir l’onglet Village.',
        target: () => tab('village'),
        done: () => currentPath().startsWith('village'),
    },
    {
        view: 'village/orders',
        text: 'Le tableau des commandes rapporte bien plus que le marché : c’est là qu’on gagne sa vie ! Et dans le volet Village, aide les habitants à rénover leurs bâtiments. Attention, la grange a une place limitée. Amuse-toi bien !',
        btn: 'Merci Mamie !',
    },
];

function startStep() {
    base = { harvested: state.stats.harvested, earned: state.stats.earned };
    scrolled = false;
    const st = STEPS[state.tutorial.step];
    if (st && st.start) st.start();
    const b = document.querySelector('#tuto .tuto-bubble');
    if (b) {
        b.classList.remove('pop');
        void b.offsetWidth;
        b.classList.add('pop');
    }
}
let scrolled = false;

function next() {
    state.tutorial.step++;
    emit('sfx', 'pop');
    if (state.tutorial.step >= STEPS.length) return finish(true);
    startStep();
    save();
}

function finish(reward) {
    state.tutorial.done = true;
    byId('tuto').hidden = true;
    if (reward) {
        state.seeds.wheat += 10;
        G.earn(100, document.querySelector('#tuto .tuto-bubble'));
        toast('Cadeau de Mamie Odette : 100 pièces et 10 graines de blé', ['villager', 'odette']);
        emit('sfx', 'level');
        confetti();
    }
    refresh();
    save();
    setTimeout(pump, 600);
}

export function tutoTick() {
    const wrap = byId('tuto');
    if (!state.tutorial || state.tutorial.done || momentShown()) {
        wrap.hidden = true;
        return;
    }
    const st = STEPS[state.tutorial.step];
    if (!st) return finish(true);
    if (!base) startStep();
    if (st.done && st.done()) return next();
    wrap.hidden = false;
    if (!wrap.firstChild)
        wrap.innerHTML = `<div class="tuto-ring"></div><div class="tuto-hand">${art('ui', 'hand')}</div>
        <div class="tuto-bubble"><div class="tuto-avatar">${art('villager', 'odette')}</div><div class="tuto-main"><div class="tuto-name">Mamie Odette <span class="tuto-step"></span></div><p class="tuto-text"></p>
        <div class="tuto-actions"><button class="btn gold sm tuto-btn" data-act="tutoNext"></button><button class="tuto-skip" data-act="tutoSkip">Passer le tutoriel</button></div></div></div>`;
    let target = null,
        text = st.text;
    if (st.view && currentPath() !== st.view && !(st.view === 'farm/field' && document.body.classList.contains('wide'))) {
        target = tab(st.view.split('/')[0]);
        text = `Retourne dans l’onglet ${VIEW_NAMES[st.view]} pour continuer.`;
        if (currentPath().startsWith(st.view.split('/')[0])) {
            target = document.querySelector(`#subnav [data-v="${st.view.split('/')[1]}"]`);
            if (target) text = `Touche « ${(target.querySelector('span') || target).textContent.trim()} » en haut pour continuer.`;
        }
    } else if (st.target) target = st.target();
    const q = s => wrap.querySelector(s);
    q('.tuto-text').textContent = text;
    q('.tuto-btn').hidden = !st.btn;
    if (st.btn) q('.tuto-btn').textContent = st.btn;
    q('.tuto-step').textContent = `${state.tutorial.step + 1} / ${STEPS.length}`;
    const ring = q('.tuto-ring'),
        hand = q('.tuto-hand'),
        bubble = q('.tuto-bubble');
    if (target && target.offsetParent !== null) {
        const r = target.getBoundingClientRect();
        if (!scrolled && (r.top < 120 || r.bottom > innerHeight - 140) && !anySheet()) {
            scrolled = true;
            target.scrollIntoView({ block: 'center', behavior: 'smooth' });
        }
        const pad = 6;
        ring.hidden = hand.hidden = false;
        ring.style.transform = `translate(${r.left - pad}px, ${r.top - pad}px)`;
        ring.style.width = r.width + pad * 2 + 'px';
        ring.style.height = r.height + pad * 2 + 'px';
        hand.style.transform = `translate(${r.left + r.width * 0.55}px, ${r.top + r.height * 0.55}px)`;
        bubble.classList.toggle('top', r.top + r.height / 2 > innerHeight * 0.5);
    } else {
        ring.hidden = hand.hidden = true;
        bubble.classList.remove('top');
    }
}

export function setupTutorial() {
    actions({
        tutoNext: () => next(),
        tutoSkip: () => finish(false),
    });
}
