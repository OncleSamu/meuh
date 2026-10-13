// L'histoire : rénover le village, puis le hameau, le port, l'alpage et le domaine, chapitre par chapitre.
// Chaque bâtiment demande une liste de produits, débloque quelque chose et fait avancer l'histoire.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { view } from '../core/view.js';
import { emit, toast, sfx, buzz, burst, float } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { CHAPTERS, PROJECTS, CHAPTER_ORDER, chapterNum, chapterAfter } from '../data/village.js';
export { CHAPTER_ORDER, chapterNum, chapterAfter };
import { STORY_MAPS } from '../data/meta.js';
import { tip } from './tips.js';
import { clampQuality } from './farm.js';
import { addPhoto } from './style.js';
import { addFriendship } from './village.js';
import { addXp } from './player.js';
import { ensureQuests } from './orders.js';
import { ensureStall } from './stall.js';
import { ensureIsland } from './island.js';
import { ensureBrew } from './brewery.js';
import { pluralFr } from '../core/format.js';

export const projState = id => state.projects[id] || (state.projects[id] = { given: {}, done: false });
export const projectDone = id => !!(state.projects[id] && state.projects[id].done);
export const chapterProjects = n => Object.values(PROJECTS).filter(p => p.ch === n);
export const chapterDone = n => chapterProjects(n).every(p => projectDone(p.id));
// un chapitre déjà ouvert avant la 1.4 le reste (state.story.keep, posé à la conversion)
export const chapterKept = n => !!(state.story.keep && state.story.keep[n]);
export const chapterOpen = n => chapterKept(n) || (state.level >= CHAPTERS[n - 1].lvl && (chapterAfter(n) === 0 || chapterDone(chapterAfter(n))));
export const projectOpen = id => chapterOpen(PROJECTS[id].ch) && !projectDone(id);
export const givenOf = (id, item) => projState(id).given[item] || 0;
export const projectLeft = (id, item) => Math.max(0, PROJECTS[id].need[item] - givenOf(id, item));
export const projectComplete = id => Object.keys(PROJECTS[id].need).every(item => projectLeft(id, item) === 0);
export const projectStage = id => (projectDone(id) ? 2 : Object.keys(projState(id).given).length ? 1 : 0);
export const storyClaimable = () => Object.keys(PROJECTS).filter(id => projectOpen(id) && projectComplete(id)).length;
export const mapOf = p => p.map || 'village';
// un produit ou une machine qui attend la fin d'un chantier
export const storyOk = d => !d || !d.needProject || projectDone(d.needProject);
export const storyLockText = d => (d && d.needProject && !projectDone(d.needProject) ? `Après le chantier « ${PROJECTS[d.needProject].name} »` : '');

// une carte s'ouvre avec son premier chapitre, ou dès son niveau pour la voir de loin (sauf « strict »)
export const BRANCH_MAPS = [];
const firstOf = map => CHAPTERS[CHAPTER_ORDER.find(n => CHAPTERS[n - 1].map === map) - 1];
export const mapOpen = m => {
    if (m.id === 'village') return true;
    const f = firstOf(m.id);
    return chapterOpen(f.n) || chapterDone(f.n) || (!m.strict && state.level >= f.lvl);
};
export const openMaps = () => STORY_MAPS.filter(mapOpen);
export const mapReady = m => Object.values(PROJECTS).some(p => mapOf(p) === m && projectOpen(p.id) && projectComplete(p.id));

// le chapitre en cours : le premier pas fini de l'histoire (ou d'une carte donnée)
export function currentChapter(map) {
    for (const n of CHAPTER_ORDER) {
        const c = CHAPTERS[n - 1];
        if (!chapterDone(n) && (!map || (c.map || 'village') === map)) return c;
    }
    return null;
}

// Produits encore attendus par les chantiers ouverts (pour la réserve du marché)
export function projectsNeed(item) {
    let n = 0;
    for (const p of Object.values(PROJECTS)) if (p.need[item] && projectOpen(p.id)) n += projectLeft(p.id, item);
    return n;
}

// Annonce un nouveau chapitre une seule fois
export function syncStory() {
    const c = CHAPTER_ORDER.map(n => CHAPTERS[n - 1]).find(x => !chapterDone(x.n) && chapterOpen(x.n) && !state.story.seen[x.n]);
    if (!c) return false;
    state.story.seen[c.n] = true;
    if (view.started) {
        toast(`Chapitre ${chapterNum(c.n)} : ${c.name}`, ['ui', 'village']);
        if (c.n === 1) tip('village');
        if (c.n === 5) tip('hamlet');
        if (c.n === 17) tip('abbey');
        if (c.n === 13) tip('isle');
        if (c.n === 15) tip('station');
        sfx('level');
    }
    return true;
}

function give(pid, item, n) {
    state.inventory[item] -= n;
    clampQuality(item);
    const g = projState(pid).given;
    g[item] = (g[item] || 0) + n;
}

export function giveToProject(pid, item, at) {
    if (!projectOpen(pid)) return false;
    const n = Math.min(state.inventory[item], projectLeft(pid, item));
    if (n <= 0) {
        toast(`Il vous faut encore des ${pluralFr(ITEMS[item].name).toLowerCase()}`, ['item', item]);
        sfx('error');
        return false;
    }
    give(pid, item, n);
    sfx('load');
    buzz(12);
    burst(at, 'sparkle', 8);
    float(at, [`+${n}`, ['item', item]], '', -20);
    return true;
}

export function giveAllToProject(pid, at) {
    if (!projectOpen(pid)) return false;
    let any = false;
    for (const item of Object.keys(PROJECTS[pid].need)) {
        const n = Math.min(state.inventory[item], projectLeft(pid, item));
        if (n > 0) {
            give(pid, item, n);
            any = true;
        }
    }
    if (!any) {
        toast('Rien à apporter pour le moment', ['ui', 'village']);
        sfx('error');
        return false;
    }
    sfx('load');
    buzz(15);
    burst(at, 'sparkle', 12);
    return true;
}

export function finishProject(pid, at) {
    if (!projectOpen(pid) || !projectComplete(pid)) return false;
    const p = PROJECTS[pid];
    projState(pid).done = true;
    state.stats.projects = (state.stats.projects || 0) + 1;
    applyProjectReward(pid);
    addPhoto('building', pid, p.name, 'Rénovation terminée');
    addFriendship(p.vid, 6, at);
    addXp(150 + chapterNum(p.ch) * 150, at);
    emit('story', { pid, next: storyNextText(p) });
    sfx('level');
    buzz(40);
    return true;
}

export function applyProjectReward(pid) {
    const t = now();
    if (pid === 'station') Object.assign(state.truck, { status: 'away', arriveAt: t + 3000 });
    if (pid === 'inn') Object.assign(state.balloon, { status: 'away', arriveAt: t + 30000 });
    if (pid === 'fountain') Object.assign(state.merchant, { status: 'away', arriveAt: t + 30000 });
    if (pid === 'florist') state.decorInv.flowers = (state.decorInv.flowers || 0) + 2;
    if (pid === 'townhall') state.prestige.rubans += 3;
    if (pid === 'bakery' || pid === 'hall') ensureQuests();
    if (pid === 'bridge') {
        state.farmhand.lvl = Math.max(1, state.farmhand.lvl || 0);
        tip('farmhand');
    }
    if (pid === 'washhouse') ensureStall();
    if (pid === 'bandstand') state.prestige.rubans += 5;
    if (pid === 'ferry') ensureIsland();
    if (pid === 'carnival' || pid === 'salonHall' || pid === 'beerfest') state.prestige.rubans += 5;
    if (pid === 'brewhall') tip('brew');
    if (pid === 'brewhall' || pid === 'fermenters' || pid === 'beerfest' || pid === 'barrelcellar') ensureBrew();
}

const MAP_TEASE = {
    hamlet: 'de l’autre côté de la rivière, un vieux hameau',
    port: 'au bout de la route, un petit port',
    alpine: 'là-haut, les alpages',
    domaine: 'sur les coteaux, un vieux domaine',
    abbey: 'derrière le port, une vieille abbaye',
    island: 'depuis le port, une île tiède',
    station: 'au bout du chemin des vergers, une station de recherche',
};

// la suite de l'histoire, après une rénovation
export function storyNextText(p) {
    const c = currentChapter();
    if (!c)
        return 'Village, hameau, port, abbaye, île, station, alpage et domaine : toute l’histoire est écrite. Merci pour tout ! Prochain grand but : la Ferme légendaire (Livre de la ferme).';
    const at = state.level < c.lvl ? ` au niveau ${c.lvl}` : '';
    if (chapterDone(p.ch) && c.map && c.map !== mapOf(p)) return `Ce n’est pas fini : ${MAP_TEASE[c.map]} vous attend${at}.`;
    if (chapterDone(p.ch)) return `Chapitre ${chapterNum(p.ch)} terminé ! Prochain chapitre : « ${c.name} »${at}.`;
    return '';
}
