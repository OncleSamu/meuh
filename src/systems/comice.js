// L'Élevage (1.45) : le Comice agricole, une fois par semaine. Il remplace le Salon de l'agriculture.
// Trois catégories tirées parmi les espèces que l'on a (une de plus avec le grand hall). Les variétés ont leur concours du potager, au labo.
// Une bête par catégorie ; la note sur 100 : gènes, beauté, cœurs et présentation (le brossage, une fois par jour),
// et chaque semaine le jury de chaque catégorie regarde surtout une chose (1.45.2).
// Les rivales : les quatre fermes voisines, chacune avec son style (comme au concours de la semaine).
import { state, scaleLvl } from '../core/state.js';
import { now } from '../core/clock.js';
import { view } from '../core/view.js';
import { pickRand } from '../core/format.js';
import { emit, toast, sfx, changed } from '../core/bus.js';
import { BIRTHS, NAMES } from '../data/animals.js';
import { RIVALS } from '../data/village.js';
import { COMICE, COMICE_CAT } from '../data/elevage.js';
import { RIVAL_STYLE } from './rivals.js';
import { isAdult } from './animals.js';
import { isAway } from './port.js';
import { animalTrait, animalBase, looksOf, featureLooks, CORE_ANIMAL, salonOpen } from './genetics.js';
import { earn } from './player.js';
import { addElevRep } from './fair.js';
import { addPhoto } from './style.js';
import { tip } from './tips.js';

export const comiceOpen = () => state.level >= COMICE.lvl;
// le grand hall (l'ancien chantier du Salon) : une catégorie de plus et des prix doublés
export const comiceHall = () => salonOpen();
// les semaines commencent le lundi
const MONDAY = Date.UTC(2026, 0, 5);
export const comiceWeek = (t = now()) => Math.floor((t - MONDAY) / COMICE.week);
export const comiceEnd = () => MONDAY + (comiceWeek() + 1) * COMICE.week;
const dayNo = () => Math.floor(now() / 86400000);

export function ensureComice() {
    if (!state.comice || typeof state.comice !== 'object') state.comice = {};
    const c = state.comice;
    c.wins = c.wins || {};
    c.cats = Array.isArray(c.cats) ? c.cats : [];
    return c;
}

const showable = a => isAdult(a) && !a.sick && !isAway(a) && !a.box && !BIRTHS.skip.includes(a.type);
export const comiceTypes = () => ownedTypes();
const ownedTypes = () => [...new Set(state.animals.filter(showable).map(a => a.type))];

// la note d'une bête, de 0 à 100, et son détail
export function animalScore(a, brush = 0, jury = null) {
    const W = COMICE.w;
    const gain = CORE_ANIMAL.reduce((x, k) => x + Math.max(0, animalTrait(a, k) - animalBase(a, k)), 0);
    let beauty = 0;
    if (a.g) {
        const l = looksOf(a.g);
        beauty = (l.color ? 1 : 0) + (l.pattern ? 1 : 0) + (l.finish ? 2 : 0) + (l.halo ? 3 : 0) + featureLooks(a.g, a.type).filter(Boolean).length;
    }
    const parts = {
        genes: Math.round(Math.min(1, gain / COMICE.genesFull) * W.genes),
        beauty: Math.round(Math.min(1, beauty / COMICE.beautyFull) * W.beauty),
        hearts: Math.round(((a.love || 0) / 5) * W.hearts),
        show: Math.round(Math.max(0, Math.min(1, brush)) * W.show),
    };
    // le coup de cœur du jury : ce qu'il regarde surtout compte une fois et demie
    const bonus = jury && parts[jury] ? Math.round(parts[jury] * (COMICE.jury - 1)) : 0;
    return { score: Math.min(100, parts.genes + parts.beauty + parts.hearts + parts.show + bonus), parts, bonus };
}

// la note des fermes voisines dans une catégorie : grandit avec le niveau, selon le style de chaque ferme
// chaque ferme présente une vraie bête : un nom et une robe
function rivalScores(type) {
    const base = COMICE.rivalBase + state.level * COMICE.rivalPerLvl;
    const mine = new Set(state.animals.map(a => a.name));
    const names = [...(NAMES[type] || ['Belle'])].filter(n => !mine.has(n)).sort(() => Math.random() - 0.5);
    return RIVALS.map((_, k) => ({
        k,
        score: Math.max(5, Math.min(98, Math.round(base * RIVAL_STYLE[k].f + (Math.random() - 0.5) * COMICE.rivalSpread))),
        name: names[k % names.length] || 'Belle',
        hue: Math.floor(Math.random() * 6),
    }));
}
export const JURY = {
    genes: 'les gènes',
    beauty: 'la beauté',
    hearts: 'l’affection',
    show: 'la présentation',
};

const newCat = type => ({ id: type, entry: null, brush: 0, brushDay: 0, jury: pickRand(Object.keys(JURY)), rivals: rivalScores(type) });
function newEdition() {
    const c = ensureComice();
    const n = COMICE.cats + (comiceHall() ? 1 : 0);
    // les espèces que l'on a, au hasard (on varie d'une semaine à l'autre)
    const pool = [...ownedTypes()].sort(() => Math.random() - 0.5);
    c.cats = pool.slice(0, n).map(newCat);
    c.wk = comiceWeek();
    c.paid = false;
}

export const catName = cat => COMICE_CAT[cat.id] || cat.id;
export const catOf = id => ensureComice().cats.find(x => x.id === id);
const entryAnimal = cat => (cat.entry ? state.animals.find(a => a.uid === cat.entry) : null);

// la note actuelle d'une catégorie (0 sans inscrit, ou si la bête est partie)
export function catScore(cat) {
    const a = entryAnimal(cat);
    return a && showable(a) ? animalScore(a, cat.brush, cat.jury).score : 0;
}
export const catRank = cat => {
    const s = catScore(cat);
    return s ? 1 + cat.rivals.filter(r => r.score > s).length : 0;
};

// les candidats d'une catégorie, les meilleurs d'abord
export function comiceCandidates(id) {
    const cat = catOf(id);
    if (!cat) return [];
    return state.animals
        .filter(a => a.type === id && showable(a))
        .map(a => ({ id: a.uid, name: a.name, a, ...animalScore(a, cat.entry === a.uid ? cat.brush : 0, cat.jury) }))
        .sort((a, b) => b.score - a.score);
}

export function comiceEnter(id, who) {
    const cat = catOf(id);
    if (!cat || state.comice.paid || !comiceCandidates(id).some(x => x.id === who)) return false;
    if (cat.entry !== who) cat.brush = 0;
    cat.entry = who;
    sfx('pop');
    tip('comice');
    changed('animals');
    return true;
}

// la présentation : le brossage, une fois par jour et par catégorie ; on garde le meilleur
export const canBrush = cat => !!(cat && cat.entry && cat.brushDay !== dayNo() && !state.comice.paid);
export function comiceBrush(id, q) {
    const cat = catOf(id);
    if (!canBrush(cat)) return false;
    cat.brushDay = dayNo();
    cat.brush = Math.max(cat.brush || 0, Math.max(0, Math.min(1, q)));
    changed('animals');
    return true;
}

// les résultats : à la fin de la semaine (ou au retour d'absence)
function award() {
    const c = ensureComice();
    c.paid = true;
    const mult = (1 + scaleLvl() * 0.05) * (comiceHall() ? 2 : 1);
    const lines = [];
    let firsts = 0;
    for (const cat of c.cats) {
        const r = catRank(cat);
        if (!r || r > 3) continue;
        const coins = Math.round((COMICE.prizes[r] * mult) / 10) * 10;
        earn(coins, null);
        addElevRep(COMICE.rep[r]);
        if (r === 1) {
            firsts++;
            const first = !c.wins[cat.id];
            c.wins[cat.id] = (c.wins[cat.id] || 0) + 1;
            state.prestige.rubans += first ? 2 : 1;
            state.stats.salonWins = (state.stats.salonWins || 0) + 1;
            const a = entryAnimal(cat);
            if (a) a.prize = (a.prize || 0) + 1; // la plaque « Primée au Comice »
            if (first) addPhoto('animal', cat.id, `${COMICE_CAT[cat.id]} : premier prix`, 'Comice agricole');
        }
        lines.push([['ui', r === 1 ? 'ribbon' : 'star'], `${catName(cat)} : ${r}${r === 1 ? 're' : 'e'} place · ${coins.toLocaleString('fr-FR')} pièces`]);
    }
    c.last = { lines, firsts, at: now() };
    if (view.started && lines.length)
        emit('celebrate', {
            icon: ['ui', 'ribbon'],
            title: firsts ? `Comice : ${firsts} premier${firsts > 1 ? 's' : ''} prix !` : 'Les résultats du Comice',
            sub: firsts ? 'Vos bêtes primées portent la plaque : leur prix double à la foire.' : 'Vos bêtes se sont bien défendues.',
            lines,
        });
    else if (view.started && c.cats.some(x => x.entry)) toast('Comice : pas de place sur le podium cette semaine', ['ui', 'ribbon']);
}

// en cours de semaine : le grand hall ouvre sa catégorie de plus
function topUp(c) {
    let ch = false;
    // 1.45.2 : le potager quitte le Comice (il a son concours au labo) ; les anciennes catégories reçoivent un jury et des bêtes rivales
    if (c.cats.some(x => x.id === 'potager')) {
        c.cats = c.cats.filter(x => x.id !== 'potager');
        ch = true;
    }
    c.cats.forEach(cat => {
        if (!cat.jury) cat.jury = pickRand(Object.keys(JURY));
        if (cat.rivals.some(r => !r.name)) {
            const fresh = rivalScores(cat.id);
            cat.rivals.forEach((r, k) => Object.assign(r, { name: fresh[k].name, hue: fresh[k].hue }));
        }
    });
    const want = COMICE.cats + (comiceHall() ? 1 : 0);
    if (c.cats.length < want && !c.paid) {
        const free = ownedTypes().filter(t => !c.cats.some(x => x.id === t));
        if (free.length) {
            c.cats.push(newCat(pickRand(free)));
            ch = true;
        }
    }
    return ch;
}

export function comiceTick() {
    if (!comiceOpen()) return false;
    const c = ensureComice();
    const wk = comiceWeek();
    if (c.wk === wk) return topUp(c);
    // la semaine passée se termine : les prix, puis une nouvelle édition
    if (c.wk !== undefined && c.wk !== wk && !c.paid && c.cats.some(x => x.entry)) award();
    newEdition();
    if (view.started) tip('comice');
    return true;
}

// ce qui attend : une catégorie sans inscrit, ou une bête à brosser aujourd'hui
export function comiceTodo() {
    if (!comiceOpen() || !state.comice || state.comice.paid) return 0;
    return state.comice.cats.filter(cat => (!cat.entry && comiceCandidates(cat.id).length) || canBrush(cat)).length;
}
export const rivalName = k => `${RIVALS[k].owner} · ${RIVALS[k].name.replace(/^(La ferme|Le domaine|Domaine) (des |du |de )?/, '')}`;
