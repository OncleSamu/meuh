// La partie : chargement et remise en ordre de l'état, outil en main, la seconde de jeu et l'absence.
import { state, setState, newState, fromSave, fillGrid, readSave, lvOk, getStore, SAVE_KEY, BROKEN_KEY } from '../core/state.js';
import { readBackups } from './savecodes.js';
import { now } from '../core/clock.js';
import { view } from '../core/view.js';
import { s, fmt, formatDuration } from '../core/format.js';
import { emit, toast } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { GAME_MIN_PER_SEC, EVENTS } from '../data/world.js';
import { CONTRACT_LVL } from '../data/commerce.js';
import { INCIDENTS, RARE_EVENTS } from '../data/surprises.js';
import { MAX_LEVEL } from '../data/progress.js';
import { CHAPTERS } from '../data/village.js';
import { MACHINES, RECIPES } from '../data/machines.js';
import { ensureVillagers } from './village.js';
import { ensureGhPlots, seedList, plotRate, ghTick, ghOffline } from './farm.js';
import { ensureAnimalData, animalsTick, growTick, animalsOffline } from './animals.js';
import { ensureNature } from './nature.js';
import { migrateCounter, counterTick } from './counter.js';
import { ensureMachineData, ensureRecipeMoves, workshopTick, advanceMachine } from './workshop.js';
import { ensureQuests, truckTick, balloonTick, checkQuestReady } from './orders.js';
import { ensureStall, stallTick, neighborTick, neighborsReady } from './stall.js';
import { scheduleFind, decoTool, eggTick, wellTick, honeyTick, crowTick, dogTick } from './farmlife.js';
import { projectDone, storyOk, syncStory, chapterDone } from './story.js';
import { newDay, weatherTick, season, weather } from './world.js';
import { marketTick } from './market.js';
import { syncEvent, eventActive, eventIcon } from './events.js';
import { speedMult, checkNewAchievements, migrateLevels14, migrateLevels60 } from './player.js';
import { handTick, handOffline } from './home.js';
import { incidentTick } from './incidents.js';
import { merchantTick } from './merchant.js';
import { rareTick, ensureContract, rareActive } from './surprises.js';
import { boatTick, transTick, ensureFarmSeason, netReady } from './port.js';
import { ensureHoliday } from './holidays.js';
import { contestTick } from './contest.js';
import { caveOpen, caveTick, auctionTick, caveCareCount, caveOrderTick } from './cave.js';
import { ensureChateau, visitorTick } from './chateau.js';
import { tip } from './tips.js';
import { trimDayEarn, syncBook } from './book.js';
import { ensureOrchard, orchardTick, orchardOffline } from './orchard.js';
import { pickerTick, pickerAfterOffline } from './orchardplus.js';
import { lifeTick, lifeAfterOffline } from './orchardlife.js';
import { ensurePastures } from './pastures.js';
import { ensureHaras, tidyHaras } from './haras.js';
import { showTick } from './show.js';
import { studTick } from './stud.js';
import { nmarketTick } from './nmarket.js';
import { specialTick } from './neighborspecial.js';
import { ensureIsland, islandTick, islandOffline } from './island.js';
import { ensureOasis, oasisTick, oasisOffline, sandstormTick } from './oasis.js';
import { ensureNord, nordTick, nordOffline } from './nord.js';
import { ensureGenetics, geneticsTick, clampVarieties } from './genetics.js';
import { ensureDefis, defiTick } from './defis.js';
import { ensureNight, nightTick } from './night.js';
import { brewOpen, ensureBrew, brewTick } from './brewery.js';
import { cargoTick, cargoHere, cargoLeave } from './cargo.js';
import { armandTick, armandHere, armandLeave, armandPending } from './armand.js';
import { pondTick, trapsReady } from './fishing.js';
import { birthsTick, birthsTip } from './births.js';
import { fairTick } from './fair.js';
import { comiceTick } from './comice.js';
import { herdbookTick } from './herdbook.js';

// ---------------- chargement ----------------
// Lit la sauvegarde (ou commence une partie neuve) et complète ce qui manque
export function loadGame() {
    const saved = readSave();
    let fresh = !saved;
    loadIssue = null;
    if (saved) {
        try {
            applySave(saved);
        } catch (e) {
            // 1.44 : une sauvegarde abîmée n'est plus remplacée par une ferme neuve : on la met de côté
            // et on repart de la plus récente copie de secours lisible
            console.error('Sauvegarde illisible.', e);
            keepBroken();
            fresh = !restoreFromBackups();
        }
    } else if (hasRawSave()) {
        keepBroken();
        fresh = !restoreFromBackups();
    } else {
        setState(newState());
        finishLoad();
    }
    return fresh;
}

// ce qui s'est passé au chargement : { restored: date de la copie } ou { lost: true }
export let loadIssue = null;

function applySave(sv) {
    if (!sv || typeof sv !== 'object' || !Array.isArray(sv.grid) || !Number.isFinite(sv.money) || !Number.isFinite(sv.level || 1))
        throw new Error('sauvegarde incomplète');
    setState(fromSave(sv));
    finishLoad();
}
function finishLoad() {
    fillGrid();
    state.stats.maxLevel = Math.max(state.stats.maxLevel, state.level);
    state.stats.maxPlots = Math.max(state.stats.maxPlots, state.unlockedPlots);
    if (!isToolValid(state.selectedTool)) state.selectedTool = 'hand';
    normalizeState();
}
function hasRawSave() {
    try {
        return !!(getStore() && getStore().getItem(SAVE_KEY));
    } catch {
        return false;
    }
}
function keepBroken() {
    try {
        const raw = getStore().getItem(SAVE_KEY);
        if (raw) getStore().setItem(BROKEN_KEY, raw);
    } catch {
        // stockage indisponible
    }
}
function restoreFromBackups() {
    for (const b of readBackups())
        try {
            applySave(JSON.parse(b.data));
            loadIssue = { restored: b.at };
            return true;
        } catch {
            // copie illisible : la suivante
        }
    setState(newState());
    finishLoad();
    loadIssue = { lost: true };
    return false;
}

// Complète les données que chaque système attend (anciennes sauvegardes, nouvelle partie)
export function normalizeState() {
    // 1.4 : passage aux 50 niveaux (les chapitres déjà ouverts le restent)
    if (!state.lv14) {
        state.story.keep = {};
        for (const c of CHAPTERS) if (state.story.seen[c.n] && !chapterDone(c.n)) state.story.keep[c.n] = true;
        migrateLevels14();
        state.lv14 = true;
    }
    // 1.8 : machines et recettes ont changé de niveau ; ce qu'une partie avait déjà ouvert le reste
    if (!state.lv18) {
        state.lvKeep = state.lvKeep || {};
        for (const o of [MACHINES, RECIPES])
            for (const d of Object.values(o)) {
                const was = d.lv17,
                    now18 = o === MACHINES ? d.reqLvl : d.lvl;
                if (was !== undefined && was <= state.level && now18 > state.level) state.lvKeep[d.id] = true;
            }
        state.lv18 = true;
    }
    // 1.36 : les 50 niveaux passent à 60 ; les chapitres déjà commencés restent ouverts
    if (!state.lv136) {
        state.story.keep = state.story.keep || {};
        for (const c of CHAPTERS) if (state.story.seen[c.n] && !chapterDone(c.n)) state.story.keep[c.n] = true;
        migrateLevels60();
        state.lv136 = true;
    }
    ensureVillagers();
    ensureGhPlots();
    ensureAnimalData();
    ensurePastures();
    ensureOrchard();
    ensureIsland();
    ensureOasis();
    ensureNord();
    ensureGenetics();
    ensureChateau();
    if (brewOpen()) ensureBrew();
    ensureDefis();
    ensureNight();
    migrateCounter();
    ensureHaras();
    tidyHaras();
    syncBook();
    ensureNature();
    ensureMachineData();
    ensureRecipeMoves();
    ensureQuests();
    ensureStall();
    // le corbeau ne survit pas à un rechargement de la page
    if (state.incident && state.incident.type === 'crow' && !state.crow) state.incident = null;
    state.grid.forEach(p => p.pest && (!state.incident || state.incident.type !== 'aphids') && (p.pest = false));
    state.animals.forEach(a => a.sick && !state.incident && (a.sick = false));
    if (state.incident && !state.incident.until && state.incident.type === 'sick') state.incident.until = now() + INCIDENTS.sick.time;
    if (state.dog.owned && !state.dog.nextFind) scheduleFind();
    // le commis arrive avec le pont du hameau
    if (projectDone('bridge') && !state.farmhand.lvl) state.farmhand.lvl = 1;
    if (state.level > MAX_LEVEL) state.level = MAX_LEVEL;
    if (state.settings.bigText && !state.settings.textSize) state.settings.textSize = 1;
}

// ---------------- l'outil en main ----------------
export function isToolValid(t) {
    return (
        (decoTool(t) && state.decorInv[decoTool(t)] > 0) ||
        t === 'hand' ||
        t === 'shovel' ||
        (t === 'var' && !!state.genetics && !!state.genetics.tool && state.genetics.seeds[state.genetics.tool] > 0) ||
        t === 'feed' ||
        (t === 'fert' && state.level >= 4) ||
        (state.seeds[t] !== undefined && ITEMS[t].type === 'crop' && !ITEMS[t].island && ((lvOk(ITEMS[t]) && storyOk(ITEMS[t])) || state.seeds[t] > 0))
    );
}

export function selectTool(t) {
    if (!isToolValid(t)) return false;
    state.selectedTool = t;
    emit('tool', t);
    return true;
}

// Graines disponibles dans la barre : cultures puis arbres, par niveau
export const plantableSeeds = () => seedList().filter(i => i.type === 'crop' && !i.island && ((lvOk(i) && !i.exotic && storyOk(i)) || state.seeds[i.id] > 0));

// ---------------- une seconde de jeu ----------------
// chaque sous-système avance d'une seconde ; celui qui plante est isolé et n'arrête pas les autres
let errorShown = false;
function safe(fn) {
    try {
        return fn();
    } catch (e) {
        console.error(`Erreur dans ${fn.name}`, e);
        if (!errorShown) {
            errorShown = true;
            toast('Un petit souci est survenu, le jeu continue.');
        }
        return false;
    }
}

function tickClock() {
    const prev = state.gameTimeMinutes;
    state.gameTimeMinutes = (state.gameTimeMinutes + GAME_MIN_PER_SEC) % 1440;
    if (state.gameTimeMinutes >= prev) return false;
    newDay(false);
    return true;
}

function tickWorld() {
    let changed = weatherTick(!view.hidden);
    marketTick();
    if (syncEvent()) changed = true;
    if (eggTick()) changed = true;
    return changed;
}

function tickFarm() {
    let changed = false;
    const sm = speedMult();
    state.grid.forEach((plot, gi) => {
        if (!plot.itemId || plot.isReady || !plot.isWatered || plot.pest) return;
        const timeReq = ITEMS[plot.itemId].time / sm;
        const firstHalf = plot.growProgress < timeReq / 2;
        plot.growProgress += plotRate(plot, gi);
        if (firstHalf && plot.growProgress >= timeReq / 2) changed = true;
        if (plot.growProgress >= timeReq) {
            plot.isReady = true;
            plot.growProgress = timeReq;
            changed = true;
            emit('ripe', 'farm');
        }
    });
    if (ghTick()) changed = true;
    if (orchardTick()) changed = true;
    if (pickerTick()) changed = true;
    if (lifeTick()) changed = true;
    if (islandTick()) changed = true;
    if (oasisTick()) changed = true;
    if (nordTick()) changed = true;
    if (sandstormTick()) changed = true;
    if (wellTick()) changed = true;
    if (honeyTick(1)) changed = true;
    if (crowTick()) changed = true;
    if (handTick()) changed = true;
    if (dogTick()) changed = true;
    return changed;
}

function tickDeliveries() {
    let changed = ensureQuests();
    if (truckTick()) changed = true;
    if (balloonTick()) changed = true;
    if (incidentTick()) changed = true;
    if (merchantTick()) changed = true;
    if (stallTick()) changed = true;
    if (neighborTick()) changed = true;
    if (rareTick()) changed = true;
    if (boatTick()) changed = true;
    if (transTick()) changed = true;
    if (ensureFarmSeason()) changed = true;
    if (state.level >= CONTRACT_LVL && ensureContract()) changed = true;
    if (ensureHoliday()) changed = true;
    if (geneticsTick()) changed = true;
    if (brewTick()) changed = true;
    if (cargoTick()) changed = true;
    if (armandTick()) changed = true;
    if (pondTick()) changed = true;
    if (defiTick()) changed = true;
    if (nightTick()) changed = true;
    if (contestTick()) changed = true;
    if (showTick()) changed = true;
    if (studTick()) changed = true;
    // 1.45 : les naissances au pré (vérifiées toutes les 10 secondes)
    if ((state.stats.playSec || 0) % 10 === 0) {
        if (birthsTick().length) changed = true;
        birthsTip();
        if (fairTick()) changed = true;
        if (comiceTick()) changed = true;
        if (herdbookTick()) changed = true;
    }
    if (nmarketTick()) changed = true;
    if (specialTick()) changed = true;
    if (syncStory()) changed = true;
    return changed;
}

// la cave : vieillissement, climat et salle des ventes
function tickCave() {
    if (!caveOpen()) return false;
    tip('cave');
    const sum = caveTick();
    const sale = auctionTick();
    if (visitorTick()) return true;
    if (caveOrderTick()) return true;
    return sale || sum.up.length + sum.bad.length + sum.rot.length > 0;
}

function tickProgress() {
    state.stats.playSec = (state.stats.playSec || 0) + 1;
    if (state.stats.maxLevel < state.level) state.stats.maxLevel = state.level;
    checkNewAchievements();
    trimDayEarn();
    clampVarieties();
    return false;
}

const SYSTEMS = [tickClock, tickWorld, tickFarm, animalsTick, workshopTick, () => counterTick(1), tickDeliveries, tickCave, tickProgress];

// renvoie vrai si quelque chose de visible a changé
export function gameTick() {
    let changed = false;
    for (const sys of SYSTEMS) if (safe(sys)) changed = true;
    return changed;
}

// ---------------- l'absence ----------------
// Fait avancer la ferme du temps passé loin du jeu ; renvoie le compte rendu
// { elapsed, lines: [[icône, texte]] } ou null si l'absence est trop courte.
export function offlineProgress() {
    const elapsed = Math.floor((now() - state.lastSaved) / 1000);
    if (elapsed < 60) return null;
    const sm = speedMult();
    let crops = 0;

    honeyTick(elapsed);
    growTick(elapsed, true);
    const transBack = transTick();
    const caveSum = caveTick();
    const aucBefore = caveOpen() && state.cave.auction && !state.cave.auction.over;
    auctionTick();
    const aucDone = aucBefore && state.cave.auction.over ? state.cave.auction.results.filter(l => l.sold) : null;
    // les imprévus attendent votre retour
    if (state.incident && state.incident.until) state.incident.until += elapsed * 1000;
    crops += ghOffline(elapsed);
    const orch = orchardOffline(elapsed);
    pickerAfterOffline();
    lifeAfterOffline();
    const isl = islandOffline(elapsed);
    const oas = oasisOffline(elapsed);
    const nor = nordOffline(elapsed);
    // le commis travaille pendant votre absence
    const hand = handOffline(elapsed);
    state.grid.forEach((plot, gi) => {
        if (hand.zone.has(gi)) return;
        if (plot.itemId && !plot.isReady && plot.isWatered && !plot.pest) {
            const timeReq = ITEMS[plot.itemId].time / sm;
            // 1.37.2 : même vitesse qu'en jeu (saison, sol, décorations, maîtrise, variété, compagnes)
            plot.growProgress += elapsed * plotRate(plot, gi);
            if (plot.growProgress >= timeReq) {
                plot.isReady = true;
                plot.growProgress = timeReq;
                crops++;
            }
        }
    });
    const pasture = animalsOffline(elapsed);
    const babies = birthsTick(); // 1.45 : les naissances au pré pendant l'absence
    let artisan = 0;
    state.machines.forEach(m => (artisan += advanceMachine(m, elapsed)));
    const totalMin = state.gameTimeMinutes + elapsed * GAME_MIN_PER_SEC;
    const days = Math.floor(totalMin / 1440);
    // le calendrier avance de tous les jours écoulés ; seule la météo du dernier jour est tirée
    if (days > 0) {
        state.day += days - 1;
        newDay(true);
    }
    state.gameTimeMinutes = totalMin % 1440;

    // ce qui attend au village (train, montgolfière, marchand, fête, commandes)
    truckTick();
    balloonTick();
    cargoTick();
    armandTick();
    pondTick();
    merchantTick();
    stallTick();
    neighborTick();
    boatTick();
    const sold = state.stall.slots.filter(x => x && x.sold).length;
    const neigh = neighborsReady();
    syncEvent();
    ensureQuests();
    const ready = state.quests.filter(checkQuestReady).length;

    const lines = [];
    const add = (cond, icon, text) => cond && lines.push([icon, text]);
    add(crops, ['item', 'wheat'], `${crops} culture${s(crops)} prête${s(crops)} à récolter`);
    add(isl, ['item', 'pineapple'], `${isl} culture${s(isl)} prête${s(isl)} sur l’île`);
    add(oas.crops + oas.fruits, ['ui', 'oaOasis'], `${oas.crops + oas.fruits} récolte${s(oas.crops + oas.fruits)} à faire à l’oasis`);
    add(nor.crops + nor.fruits, ['ui', 'noNord'], `${nor.crops + nor.fruits} récolte${s(nor.crops + nor.fruits)} à faire au Grand Nord`);
    add(orch.fell, ['item', 'apple'], `${orch.fell} fruit${s(orch.fell)} tombé${s(orch.fell)} au verger`);
    add(orch.picked, ['villager', 'picker'], `Le cueilleur a ramassé ${orch.picked} fruit${s(orch.picked)} au verger`);
    add(orch.dead, ['item', 'wood'], `${orch.dead} arbre${s(orch.dead)} mort${s(orch.dead)} de vieillesse au verger`);
    add(pasture.products, ['item', 'egg'], `${pasture.products} produit${s(pasture.products)} à ramasser au pâturage`);
    add(artisan, ['machine', 'bakery'], `${artisan} produit${s(artisan)} terminé${s(artisan)} à l’atelier`);
    add(hand.crops, ['villager', 'theo'], `Théo, votre commis, a récolté ${hand.crops} produit${s(hand.crops)}`);
    add(
        babies.length,
        ['animal', babies.length ? babies[0].type : 'chicken'],
        `${babies.length} petit${s(babies.length)} ${babies.length > 1 ? 'sont nés' : 'est né'} au pré`,
    );
    add(pasture.hungry, ['item', 'feed'], `${pasture.hungry} ${pasture.hungry > 1 ? 'animaux ont' : 'animal a'} faim`);
    add(ready, ['ui', 'scroll'], `${ready} commande${s(ready)} prête${s(ready)} à livrer`);
    add(sold, ['ui', 'stall'], `${sold} vente${s(sold)} à encaisser à l’étal`);
    add(
        state.rare.type && rareActive(state.rare.type),
        state.rare.type && ['ui', RARE_EVENTS[state.rare.type].icon],
        state.rare.type && `En ce moment : ${RARE_EVENTS[state.rare.type].name.toLowerCase()}`,
    );
    add(neigh, ['ui', 'heart'], `${neigh} voisin${s(neigh)} à aider`);
    add(transBack, ['ui', 'mountain'], 'Le troupeau est redescendu des estives avec du lait d’alpage');
    const up = caveSum.up.length,
        bad = caveSum.bad.length,
        rot = caveSum.rot.length,
        care = caveCareCount();
    add(up, ['ui', 'cave'], `En cave, ${up} lot${up > 1 ? 's ont' : ' a'} bien vieilli`);
    add(bad, ['ui', 'cave'], `${bad} lot${bad > 1 ? 's ont' : ' a'} tourné en cave`);
    add(rot, ['ui', 'rot'], `${rot} lot${s(rot)} perdu${s(rot)} en cave (au compost)`);
    add(care, ['ui', 'turn'], `${care} lot${s(care)} à soigner en cave`);
    add(
        aucDone,
        ['ui', 'gavel'],
        aucDone &&
            (aucDone.length
                ? `Vente aux enchères : ${aucDone.length} lot${s(aucDone.length)} adjugé${s(aucDone.length)} pour ${fmt(aucDone.reduce((x, l) => x + l.price, 0))} pièces`
                : 'Vente aux enchères close : rien de vendu'),
    );
    add(netReady(), ['ui', 'net'], 'Le filet de pêche est plein');
    const traps = trapsReady();
    add(traps, ['ui', 'trap'], `${traps} nasse${s(traps)} pleine${s(traps)} à l’étang`);
    add(state.boat.status === 'here', ['ui', 'boat'], 'Un cargo attend au port');
    add(state.truck.status === 'here', ['ui', 'trainIcon'], 'Le train de marchandises est en gare');
    add(
        cargoHere() && state.cargo && !state.cargo.done,
        ['ui', 'plane'],
        `L’avion-cargo est posé : il repart dans ${formatDuration((cargoLeave() - now()) / 1000)}`,
    );
    add(
        armandHere() && armandPending(),
        ['villager', 'armand'],
        `Armand, du Grand Hôtel, attend sa commande : il repart dans ${formatDuration((armandLeave() - now()) / 1000)}`,
    );
    add(state.balloon.status === 'here', ['ui', 'balloon'], 'Une montgolfière attend dans le pré');
    add(state.merchant.status === 'here', ['ui', 'merchant'], 'Zéphyr, le marchand ambulant, est là (onglet Marché)');
    add(eventActive(), eventActive() && eventIcon(state.event.season), eventActive() && `La fête bat son plein : ${EVENTS[state.event.season].name}`);
    const inc = state.incident && state.incident.type !== 'crow' && INCIDENTS[state.incident.type];
    add(inc, inc && ['ui', inc.icon], inc && `Imprévu en cours : ${inc.name.toLowerCase()}`);
    add(
        days,
        ['ui', season().icon],
        `${days} jour${s(days)} de jeu ont passé : c’est ${season().id === 'printemps' ? 'le ' : 'l’'}${season().name.toLowerCase()}, temps ${weather().name.toLowerCase()}`,
    );
    return { elapsed, lines };
}
