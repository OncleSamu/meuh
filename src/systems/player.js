// Le joueur : argent, expérience et niveaux, équipement, compétences, succès et cadeau du jour.
import { state, lvOk } from '../core/state.js';
import { today } from '../core/clock.js';
import { fmt, dateKey, fill } from '../core/format.js';
import { emit, toast, sfx, buzz, burst, float } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { ANIMALS, BIRTHS } from '../data/animals.js';
import { FAIR, COMICE, ASSOC_LVL } from '../data/elevage.js';
import { MACHINES, RECIPES } from '../data/machines.js';
import { UPGRADES, DECOS, DOG, GH, STYLE_LVL, ORCHARD, CROW_LVL } from '../data/farm.js';
import { NIGHT } from '../data/night.js';
import { CHAPTERS, PROJECTS, NEIGHBOR_LVL, chapterNum, chapterAfter } from '../data/village.js';
import { NATURE } from '../data/nature.js';
import { POND_UNLOCKS } from '../data/fishing.js';
import { NATURE_UNLOCKS } from '../data/nature.js';
import { ORCHARD_UNLOCKS, ORCHARD_UNLOCKS_2 } from '../data/orchard.js';
import { ISLAND } from '../data/island.js';
import { GENETICS } from '../data/genetics.js';
import { CAVE_LVL } from '../data/cave.js';
import { HARAS_LVL } from '../data/haras.js';
import { COMP_LVL } from '../data/companions.js';
import { INCIDENT_LVL, RARE_EVENT_LVL } from '../data/surprises.js';
import { CONTRACT_LVL, CONTEST_LVL, LEAGUES, CARGO, ARMAND, NMARKET, VAULT } from '../data/commerce.js';
import { DOMAINE_LVL } from '../data/domaine.js';
import { DAILY_REWARDS, HOLIDAY_LVL } from '../data/world.js';
import { BALANCE, MAX_LEVEL, RENOWN_XP, ACH_REWARDS, MEDALS, CAP_REQ, MASTERY_LVL, HOUSE, FARMHAND, ALBUM_LEVELS } from '../data/progress.js';
import { ACHIEVEMENTS, SKILLS } from '../data/meta.js';
import { trackDayEarn, record } from './book.js';
import { renownStar } from './mastery.js';
import { addPhoto } from './style.js';
import { ensureQuests } from './orders.js';
import { STALL_LEVELS } from './stall.js';

// ---------------- argent ----------------
export function earn(amount, at) {
    amount = Math.floor(amount);
    if (amount <= 0) return;
    state.money += amount;
    state.stats.earned += amount;
    state.stats.earnedRun += amount;
    trackDayEarn(amount);
    emit('earn', { amount, at });
}

export function spend(amount) {
    state.money -= amount;
    emit('spend', amount);
}

// ---------------- multiplicateurs généraux ----------------
export const speedMult = () => (1 + state.upgrades.speed * 0.1) * (1 + state.prestige.rubans * 0.03);
export const priceMult = () => (1 + state.upgrades.price * 0.1) * (1 + state.prestige.rubans * 0.05) * (1 + rank('gab') * 0.04);
export const rollYield = kind =>
    Math.random() < state.upgrades.yield * 0.1 + (kind === 'crop' ? rank('bounty') * 0.04 : kind === 'animal' ? rank('pasture') * 0.05 : 0) ? 2 : 1;

// ---------------- expérience et niveaux ----------------
// la courbe des 40 niveaux (jusqu'à la 1.3)
export const getXpReqOld = lvl => {
    const B = BALANCE,
        early = l => B.xpBase * Math.pow(B.xpGrowth, l - 1);
    const xp = lvl <= B.xpKnee ? early(lvl) : early(B.xpKnee) + B.xpA * Math.pow(lvl - B.xpKnee, B.xpP);
    return Math.round(xp / 10) * 10;
};
// 1.4 : 50 niveaux. La courbe reprend celle des 40 niveaux, étirée (×39/49) et un peu allongée (xpK)
const cumOld = x => {
    let s = 0,
        i = 1;
    for (; i + 1 <= x; i++) s += getXpReqOld(i);
    return s + (x - i) * getXpReqOld(i);
};
const REQ50 = [];
export const getXpReq50 = lvl => {
    if (REQ50[lvl] === undefined) {
        const cum = L => BALANCE.xpK * cumOld(1 + ((L - 1) * 39) / 49);
        REQ50[lvl] = Math.round((cum(lvl + 1) - cum(lvl)) / 10) * 10;
    }
    return REQ50[lvl];
};
// 1.36 : 60 niveaux. La même forme de courbe, étirée sur 60 niveaux (×39/59) et réglée (xpK60) avec le robot :
// environ 5 heures de jeu de plus qu'avec les 50 niveaux pour atteindre le maximum
const REQ = [];
export const getXpReq = lvl => {
    if (REQ[lvl] === undefined) {
        const cum = L => BALANCE.xpK60 * cumOld(1 + ((L - 1) * 39) / 59);
        REQ[lvl] = Math.round((cum(lvl + 1) - cum(lvl)) / 10) * 10;
    }
    return REQ[lvl];
};
// expérience totale pour atteindre un niveau
export const xpToReach = (L, req = getXpReq) => {
    let s = 0;
    for (let l = 1; l < L; l++) s += req(l);
    return s;
};

// 1.4 : une partie des 40 niveaux passe à l'échelle des 50, à expérience totale égale (on garde l'avance)
export function migrateLevels14() {
    const OLD_MAX = 40,
        NEW_MAX = 50;
    const toNew = (lvl, xp) => {
        if (lvl >= OLD_MAX) return [NEW_MAX, xp];
        const tot = xpToReach(lvl, getXpReqOld) + xp;
        let L = 1;
        while (L < NEW_MAX && xpToReach(L + 1, getXpReq50) <= tot) L++;
        return [L, Math.max(0, tot - xpToReach(L, getXpReq50))];
    };
    const before = Math.min(state.level, OLD_MAX);
    [state.level, state.xp] = toNew(before, state.xp);
    // ce qui était ouvert avec l'ancien niveau le reste (lvOldLvl : niveau d'avant la 1.4)
    state.lvKeep = {};
    for (const o of [ITEMS, ANIMALS, MACHINES, DECOS, UPGRADES])
        for (const d of Object.values(o)) if (d.lvOld !== undefined && d.lvOld <= before && d.reqLvl > state.level) state.lvKeep[d.id] = true;
    for (const r of Object.values(RECIPES)) if (r.lvOld !== undefined && r.lvOld <= before && r.lvl > state.level) state.lvKeep[r.id] = true;
    state.stats.maxLevel = Math.max(state.level, toNew(Math.min(state.stats.maxLevel || 1, OLD_MAX), 0)[0]);
}

// 1.36 : les niveaux d'avant ne changent pas ; ce qui était ouvert le reste (lv135 : niveau d'avant la 1.36)
export function migrateLevels60() {
    const OLD_MAX = 50;
    const before = Math.min(state.level, OLD_MAX);
    const prevMax = state.stats.maxLevel || 1;
    // au niveau maximum d'avant, les étoiles de renommée redeviennent de l'expérience
    let total = xpToReach(before, getXpReq50) + state.xp + (state.level >= OLD_MAX ? (state.renown || 0) * RENOWN_XP : 0);
    let L = 1;
    while (L < MAX_LEVEL && xpToReach(L + 1) <= total) L++;
    total -= xpToReach(L);
    state.level = L;
    state.renown = 0;
    if (L >= MAX_LEVEL) {
        state.renown = Math.floor(total / RENOWN_XP);
        total -= state.renown * RENOWN_XP;
    }
    state.xp = total;
    state.lvKeep = state.lvKeep || {};
    for (const o of [ITEMS, ANIMALS, MACHINES, DECOS, UPGRADES])
        for (const d of Object.values(o)) if (d.lv135 !== undefined && d.lv135 <= before && d.reqLvl > state.level) state.lvKeep[d.id] = true;
    for (const r of Object.values(RECIPES)) if (r.lv135 !== undefined && r.lv135 <= before && r.lvl > state.level) state.lvKeep[r.id] = true;
    state.stats.maxLevel = Math.max(state.level, prevMax >= OLD_MAX ? OLD_MAX : 1);
}

export function addXp(amount, at) {
    amount = Math.floor(amount);
    if (amount <= 0) return;
    state.xp += amount;
    if (at !== undefined) emit('float', { at, parts: [`+${fmt(amount)}`, ['ui', 'xp']], cls: 'xp', dy: 0, dx: 18 });
    const start = state.level;
    let req = getXpReq(state.level);
    while (state.level < MAX_LEVEL && state.xp >= req) {
        state.xp -= req;
        state.level++;
        req = getXpReq(state.level);
    }
    // au niveau maximum, l'expérience se change en étoiles de renommée
    if (state.level >= MAX_LEVEL)
        while (state.xp >= RENOWN_XP) {
            state.xp -= RENOWN_XP;
            renownStar();
        }
    for (let l = start + 1; l <= state.level; l++) {
        emit('levelUp', l);
        if (ALBUM_LEVELS.includes(l)) addPhoto('ui', 'star', `Niveau ${l}`, 'Un cap pour la ferme');
    }
    state.stats.maxLevel = Math.max(state.stats.maxLevel, state.level);
    if (state.level > start) ensureQuests();
}

// expérience qu'il reste à gagner pour atteindre le niveau L
export function xpToLevel(L) {
    let need = -state.xp;
    for (let l = state.level; l < L; l++) need += getXpReq(l);
    return Math.max(0, need);
}

// Ce que débloque un niveau : [{ icon: [sorte, id], name }]
export function unlocksAt(lvl) {
    if (lvl === 1) return [{ icon: ['seed', 'wheat'], name: 'Graines de blé, le champ et le magasin', go: 'market/shop#seeds' }];
    const list = [{ icon: ['ui', 'skillbook'], name: '1 point de compétence à placer dans Progrès' }];
    const add = (icon, name) => list.push({ icon, name });
    // les grandes étapes, en tête de liste
    const big = (icon, name) => list.splice(1, 0, { icon, name, big: true });
    Object.values(ITEMS).forEach(x => {
        if (x.reqLvl !== lvl || x.exotic) return;
        if (x.type === 'crop' || x.type === 'tree')
            add(
                ['seed', x.id],
                x.seedName + (x.needProject ? ` (après « ${PROJECTS[x.needProject].name} »)` : x.oasis ? ' (à l’oasis)' : x.island ? ' (sur l’île)' : ''),
            );
        else add(['item', x.id], `${x.name} (au magasin)`);
    });
    Object.values(ANIMALS).forEach(x => x.reqLvl === lvl && add(['animal', x.id], x.name));
    // 1.8 : une machine arrive toujours avec ses premières recettes
    Object.values(MACHINES).forEach(x => {
        if (x.reqLvl !== lvl) return;
        const first = Object.values(RECIPES).filter(r => r.machine === x.id && r.lvl === lvl && !r.teacher && !r.fete && !r.holiday);
        add(
            ['machine', x.id],
            x.name +
                (x.needProject ? ` (après « ${PROJECTS[x.needProject].name} »)` : '') +
                (first.length ? ` : ${first.map(r => ITEMS[r.id].name.toLowerCase()).join(', ')}` : ''),
        );
    });
    const recs = Object.values(RECIPES).filter(r => r.lvl === lvl && !r.teacher && r.lvl > MACHINES[r.machine].reqLvl);
    if (recs.length)
        add(
            ['item', recs[0].id],
            `${recs.length} nouvelle${recs.length > 1 ? 's' : ''} recette${recs.length > 1 ? 's' : ''} : ${recs.map(r => ITEMS[r.id].name.toLowerCase()).join(', ')}`,
        );
    Object.values(DECOS).forEach(x => x.reqLvl === lvl && !x.rare && add(['ui', x.id], `Décoration : ${x.name.toLowerCase()}`));
    CHAPTERS.forEach(c => {
        if (c.lvl === lvl && c.n > 1)
            add(
                ['ui', 'village'],
                `${{ hamlet: 'Hameau', port: 'Port', abbey: 'Abbaye', alpine: 'Alpage', domaine: 'Domaine', island: 'Île', station: 'Station', chateau: 'Château' }[c.map] || 'Village'} : chapitre ${chapterNum(c.n)}, « ${c.name} » (après le chapitre ${chapterNum(chapterAfter(c.n))})`,
            );
    });
    Object.values(UPGRADES).forEach(u => u.reqLvl === lvl && add(['ui', u.id], `${u.name} (au magasin)`));
    if (lvl === CARGO.lvl) add(['ui', 'plane'], 'L’avion-cargo : toutes les 48 heures, d’énormes soutes à remplir (onglet Village, commandes)');
    if (lvl === ARMAND.lvl)
        add(
            ['villager', 'armand'],
            'Armand, chef du Grand Hôtel : une fois par semaine, il commande en énorme quantité votre produit phare (onglet Village, commandes)',
        );
    if (lvl === DOMAINE_LVL)
        add(
            ['ui', 'house'],
            'L’amélioration du domaine : grange, cuisines, aide au champ, commerce, annexes, Armand, cargo, quai et réception (onglet Village)',
        );
    if (lvl === VAULT.lvl) add(['ui', 'vault'], 'Le coffre-fort de la grange : gardez vos plus beaux produits et vos grands crus à l’abri (Grange)');
    if (lvl === NMARKET.lvl)
        add(['ui', 'nmEtal'], 'Le marché des voisins : leurs étals et la demande d’achat, meilleurs avec l’amitié (Marché | Acheter, rayon Voisins)');
    if (lvl === COMP_LVL)
        add(
            ['ui', 'cpCarnet'],
            'Les cultures compagnes : des cultures voisines qui s’entraident (ou se gênent), le carnet du potager et le conseil de Mamie (Ferme | Champ)',
        );
    if (lvl === HARAS_LVL)
        big(
            ['ui', 'hEcuries'],
            'Grande étape : le Grand Haras. Écuries et mini-jeux (galop, endurance, dressage, saut), concours de la semaine, élevage et lignées (onglet Animaux)',
        );
    if (lvl === CHAPTERS.find(c => c.n === 19).lvl)
        big(
            ['ui', 'star'],
            'Grande étape : le château et ses vignes. Deux chapitres avec Margaux et l’œnologue Octave, cuvées classées, vente en primeur, boutique et visiteurs, concours des vins (onglet Village, puis Atelier | Cave)',
        );
    if (lvl === CAVE_LVL) add(['ui', 'cave'], 'La cave : affinez fromages et cidres, et vendez-les aux enchères (onglet Atelier, puis Cave)');
    if (lvl === CHAPTERS[0].lvl) add(['ui', 'village'], 'Rénovez le village : premier chapitre (onglet Village)');
    if (lvl === INCIDENT_LVL) add(['ui', 'pest'], 'Des imprévus surviennent à la ferme : réagissez vite !');
    if (lvl === DOG.reqLvl) add(['ui', 'dog'], 'Un chien de ferme à adopter');
    if (lvl === ASSOC_LVL)
        add(['ui', 'cpCarnet'], 'Les associations au pré : certaines espèces s’entraident dans un même pré, d’autres se gênent (Animaux | Prés)');
    if (lvl === COMICE.lvl) add(['ui', 'ribbon'], 'Le Comice agricole : chaque semaine, présentez vos plus belles bêtes (Animaux | Comice)');
    if (lvl === FAIR.lvl) {
        add(['ui', 'hEcusson'], 'La foire aux bestiaux : des acheteurs pour vos bêtes, la réputation de votre élevage (Marché | Vendre, Bêtes)');
        add(['animal', 'cow'], 'Les bêtes de choix des voisins, avec un bon gène (Marché | Acheter, rayon Voisins)');
    }
    if (lvl === BIRTHS.lvl)
        add(['ui', 'heart'], 'Les naissances au pré : allumez-les pré par pré, deux bêtes de la même espèce auront parfois un petit (Animaux | Prés)');
    if (lvl === BIRTHS.lvl) add(['ui', 'cpCarnet'], 'Le carnet des robes : chaque couleur et chaque motif de vos bêtes, espèce par espèce (Menu, Carnets)');
    if (lvl === NATURE.forest.lvl) add(['item', 'wood'], 'La forêt : coupez du bois (Ferme | Nature)');
    if (lvl === NATURE.mine.lvl) add(['item', 'stone'], 'La mine : cassez des rochers (Ferme | Nature)');
    ORCHARD_UNLOCKS_2.forEach(([l, t]) => l === lvl && add(['item', 'apple'], `${t} (Ferme | Verger)`));
    ORCHARD_UNLOCKS.forEach(([l, t]) => l === lvl && add(['item', 'apple'], `${t} (Ferme | Verger)`));
    NATURE_UNLOCKS.forEach(([l, t]) => l === lvl && add(['ui', 'pickaxe'], `${t} (Ferme | Nature)`));
    POND_UNLOCKS.forEach(([l, t]) => l === lvl && add(['ui', 'rod'], `${t} (Ferme | Pêche)`));
    if (lvl === GH.lvl) add(['ui', 'greenhouse'], 'Serre (à construire dans la ferme)');
    if (lvl === CONTRACT_LVL) add(['ui', 'calendar'], 'Contrats de saison : une grosse livraison par saison, avec un ruban (onglet Village, volet Commandes)');
    if (lvl === RARE_EVENT_LVL) add(['ui', 'fair'], 'Événements rares : foire aux bestiaux, critique gastronomique, nuée de papillons');
    if (lvl === STYLE_LVL) add(['item', 'brush'], 'Personnalisation : clôture, allées, toit et grange (touchez la maison)');
    if (lvl === MASTERY_LVL) {
        add(['ui', 'medalB'], 'Maîtrise des produits : produisez beaucoup pour gagner des étoiles (Livre de la ferme)');
        add(['villager', 'odette'], 'Les histoires de Mamie Odette : une par recette maîtrisée, dans la fiche de chaque plat (Livre de la ferme)');
    }
    if (lvl === HOLIDAY_LVL) add(['ui', 'basket'], 'Les fêtes : Pâques, Halloween et Noël, avec leur recette et leur panier (aux vraies dates)');
    if (lvl === CROW_LVL) add(['ui', 'crow'], 'Les corbeaux viennent picorer le champ : touchez-les pour les chasser');
    if (lvl === CONTEST_LVL) add(['ui', 'podium'], 'Le concours de la semaine : gagnez des points, montez de ligue (onglet Village)');
    if (lvl === NEIGHBOR_LVL) add(['ui', 'heart'], 'Les fermes voisines : aidez-les, gagnez leur amitié et leurs cadeaux (onglet Village, volet Commandes)');
    if (STALL_LEVELS.includes(lvl)) add(['ui', 'stall'], 'Une place de plus à l’étal (onglet Marché)');
    if (lvl === NIGHT.lvl)
        add(['ui', 'firefly'], 'La nuit : au printemps et en été, vos récoltes de nuit remplissent un bocal de lucioles ; étoiles filantes pour faire un vœu');
    if (lvl === ORCHARD.lvl) add(['ui', 'appleCart'], 'Le verger : plantez vos arbres, ils donnent des fruits longtemps (Ferme | Verger)');
    if (lvl === NIGHT.marketLvl) add(['ui', 'lantern'], 'Le marché de nuit : les soirs d’été, des graines et des décorations rares (Marché | Acheter)');
    HOUSE.forEach((h, k) => h.lvl === lvl && add(['ui', 'house'], `Maison de la ferme, niveau ${k} : ${h.bonus.toLowerCase()}`));
    FARMHAND.forEach((h, k) => h && h.lvl === lvl && add(['villager', 'theo'], `Commis de ferme, niveau ${k} : ${h.plots} parcelles`));
    LEAGUES.forEach(g => {
        if (g.lvl === lvl && g.lvl > CONTEST_LVL) add(['ui', 'podium'], `Concours : la ligue ${g.name.toLowerCase()} est ouverte (gagnez pour y monter)`);
    });
    if (lvl === ORCHARD.lvl) big(['ui', 'appleCart'], 'Grande étape : le verger');
    if (lvl === GH.lvl) big(['ui', 'greenhouse'], 'Grande étape : la serre');
    if (lvl === DOMAINE_LVL) big(['ui', 'house'], 'Grande étape : le domaine, un puits pour vos pièces');
    if (lvl === CAVE_LVL) big(['ui', 'barrel'], 'Grande étape : la cave et ses enchères');
    if (lvl === CHAPTERS[4].lvl) big(['villager', 'theo'], 'Grande étape : le hameau, puis Théo le commis (avec le pont)');
    if (lvl === CHAPTERS[6].lvl) big(['ui', 'boat'], 'Grande étape : le port (pêche en mer, bateau de livraison)');
    if (lvl === CHAPTERS[16].lvl) big(['ui', 'beer'], 'Grande étape : l’abbaye et sa brasserie (vos propres bières)');
    if (lvl === CHAPTERS[16].lvl)
        add(['ui', 'vat'], 'La brasserie : un malt, du houblon et vos ingrédients ; nommez vos bières (après « La salle de brassage »)');
    if (lvl === CHAPTERS[17].lvl) add(['ui', 'barrel'], 'Les bières en fût, à la cave (après « Le cellier à fûts »)');
    if (lvl === ISLAND.lvl) big(['item', 'coconut'], 'Grande étape : l’île aux Alizés (cultures et verger tropicaux)');
    if (lvl === GENETICS.lvl) big(['ui', 'search'], 'Grande étape : la station de recherche et la génétique');
    if (lvl === CHAPTERS[15].lvl) big(['ui', 'trophy'], 'Grande étape : le grand hall du Comice (une catégorie de plus, des prix doublés)');
    if (lvl === CHAPTERS[8].lvl) big(['ui', 'mountain'], 'Grande étape : l’alpage et la transhumance');
    if (lvl === MAX_LEVEL) {
        big(['ui', 'cupGold'], 'Grande étape : grands défis, renommée, prestige et Ferme légendaire');
        add(['ui', 'star'], 'Niveau maximum : l’expérience vous rapporte désormais des étoiles de renommée');
        add(['ui', 'goldCow'], 'Visez le titre de Ferme légendaire (Livre de la ferme)');
        add(['ui', 'ribbon'], 'Vendre la ferme : repartez de zéro avec des rubans, des bonus pour toujours (Progrès)');
        add(['ui', 'cupGold'], 'Les grands défis : un défi de deux semaines, des médailles et des décorations uniques (volet Commandes)');
    }
    return list.map(u => ({ ...u, go: unlockGo(u) }));
}

// 1.42 : où mène chaque ligne de la fiche des niveaux (un toucher y emmène)
const UNLOCK_GO = [
    ['amélioration du domaine', 'sheet:domaine'],
    ['point de compétence', 'sheet:progress'],
    ['Graines de blé, le champ', 'market/shop#seeds'],
    ['nouvelle recette', null], // voir plus bas : la machine de la recette
    ['avion-cargo', 'village/orders'],
    ['Armand', 'village/orders'],
    ['coffre-fort', 'sheet:vault'],
    ['marché des voisins', 'market/shop#neighbors'],
    ['cultures compagnes', 'sheet:companions'],
    ['Grand Haras', 'animals/haras'],
    ['naissances au pré', 'animals/pasture'],
    ['associations au pré', 'animals/pasture'],
    ['carnet des robes', 'sheet:herdbook'],
    ['foire aux bestiaux', 'market/sell#beasts'],
    ['bêtes de choix des voisins', 'market/shop#neighbors'],
    ['château et ses vignes', 'machines/cave'],
    ['La cave : affinez', 'machines/cave'],
    ['Grande étape : la cave', 'machines/cave'],
    ['bières en fût', 'machines/cave'],
    ['Rénovez le village', 'village/village'],
    ['chapitre', 'village/village'],
    ['imprévus', 'farm/field'],
    ['chien de ferme', 'market/shop#decos'],
    ['La forêt', 'farm/nature'],
    ['La mine', 'farm/nature'],
    ['(Ferme | Nature)', 'farm/nature'],
    ['(Ferme | Verger)', 'farm/orchard'],
    ['(Ferme | Pêche)', 'farm/pond'],
    ['Serre', 'farm/field'],
    ['la serre', 'farm/field'],
    ['Contrats de saison', 'village/orders'],
    ['Événements rares', 'village/orders'],
    ['Personnalisation', 'sheet:house'],
    ['Maîtrise des produits', 'sheet:book'],
    ['histoires de Mamie', 'sheet:book'],
    ['Les fêtes', 'village/orders'],
    ['corbeaux', 'farm/field'],
    ['concours de la semaine', 'village/village'],
    ['Concours : la ligue', 'village/village'],
    ['fermes voisines', 'village/orders'],
    ['place de plus à l’étal', 'market/sell'],
    ['La nuit', 'farm/field'],
    ['Le verger', 'farm/orchard'],
    ['le verger', 'farm/orchard'],
    ['marché de nuit', 'market/shop'],
    ['le domaine', 'sheet:domaine'],
    ['le hameau', 'village/village'],
    ['le port', 'village/village'],
    ['abbaye', 'machines/brew'],
    ['La brasserie', 'machines/brew'],
    ['île aux Alizés', 'farm/island#isle'],
    ['oasis', 'farm/island#oasis'],
    ['génétique', 'machines/lab'],
    ['grand hall du Comice', 'animals/comice'],
    ['Comice agricole', 'animals/comice'],
    ['alpage', 'animals'],
    ['grands défis, renommée', 'village/orders'],
    ['Les grands défis', 'village/orders'],
    ['étoiles de renommée', 'sheet:progress'],
    ['Ferme légendaire', 'sheet:book'],
    ['Vendre la ferme', 'sheet:prestige'],
    ['Maison de la ferme', 'sheet:house'],
    ['Commis de ferme', 'sheet:house'],
];
const plain = t => String(t).replace(/[\u00a0\u202f]/g, ' ');
export function unlockGo(u) {
    if (u.go) return u.go;
    const [kind, id] = u.icon || [];
    const name = plain(u.name);
    if (kind === 'seed') return ITEMS[id] && ITEMS[id].oasis ? 'farm/island#oasis' : ITEMS[id] && ITEMS[id].island ? 'farm/island#isle' : 'market/shop#seeds';
    if (kind === 'animal') return 'market/shop#animals';
    if (kind === 'machine') return (state.machines || []).some(m => m.type === id) ? 'machines/workshop' : 'market/shop#machines';
    if (kind === 'item' && /nouvelles? recettes?/.test(name)) return 'produce:' + id;
    if (name.includes('(au magasin)')) return 'market/shop#gear';
    if (kind === 'ui' && DECOS[id] && name.startsWith('Décoration')) return 'market/shop#decos';
    const hit = UNLOCK_GO.find(([k, g]) => g && name.includes(plain(k)));
    return hit ? hit[1] : null;
}

// ---------------- équipement de la ferme ----------------
export const upgradeCost = id => Math.floor(UPGRADES[id].baseCost * Math.pow(UPGRADES[id].mult, state.upgrades[id] || 0));
export const upgradeOpen = id => lvOk(UPGRADES[id]);

export function buyUpgrade(id, at) {
    const u = UPGRADES[id];
    state.upgrades[id] = state.upgrades[id] || 0;
    if (state.upgrades[id] >= u.maxLvl || !upgradeOpen(id)) return false;
    const cost = upgradeCost(id);
    if (state.money < cost) return false;
    spend(cost);
    state.upgrades[id]++;
    sfx('level');
    buzz(20);
    burst(at, 'sparkle', 14);
    float(at, [`${u.name} niv. ${state.upgrades[id]}`], '', -20);
    return true;
}

// ---------------- cadeau du jour ----------------
export const dailyCoins = r => Math.round((r.coins * (1 + state.level * 0.15)) / 10) * 10;

// le cadeau du jour s'il n'a pas encore été ouvert : { today, streak }
export function dailyDue() {
    const d = dateKey(today());
    if (state.daily.last === d) return null;
    const yesterday = dateKey(new Date(today().getTime() - 864e5));
    const streak = state.daily.last === yesterday ? (state.daily.streak % 7) + 1 : 1;
    return { today: d, streak };
}

export function claimDaily(at) {
    const d = dailyDue();
    if (!d) return false;
    const r = DAILY_REWARDS[d.streak - 1];
    earn(dailyCoins(r), at);
    if (r.feed) state.inventory.feed += r.feed;
    if (r.seeds) state.seeds[r.seeds[0]] += r.seeds[1];
    state.daily = { last: d.today, streak: d.streak };
    record('streak', d.streak);
    sfx('level');
    buzz(20);
    burst(at, 'sparkle', 16, -20);
    return true;
}

// ---------------- succès ----------------
export const achClaimed = a => state.achievements[a.id] || 0;
export const achClaimable = a => achClaimed(a) < 3 && (state.stats[a.id] || 0) >= a.tiers[achClaimed(a)];
export const claimableCount = () => ACHIEVEMENTS.filter(achClaimable).length;
export const achDesc = (a, n) => fill(a.desc, n);

export function claimAchievement(id, at) {
    const a = ACHIEVEMENTS.find(x => x.id === id);
    if (!a || !achClaimable(a)) return false;
    const tier = achClaimed(a),
        r = ACH_REWARDS[tier];
    state.achievements[id] = tier + 1;
    sfx('level');
    buzz(25);
    burst(at, 'sparkle', 16);
    earn(r.coins, at);
    addXp(r.xp, at);
    if (r.ruban) {
        state.prestige.rubans++;
        float(at, ['+1', ['ui', 'ribbon']], '', -50);
    }
    toast(`Succès « ${a.name} » : médaille ${['de bronze', 'd’argent', 'd’or'][tier]} !`, ['ui', MEDALS[tier]]);
    return true;
}

// annonce un nouveau succès à réclamer
let lastClaimable = null;
export function checkNewAchievements() {
    const n = claimableCount();
    if (lastClaimable !== null && n > lastClaimable) {
        toast('Nouveau succès à réclamer dans le Livre de la ferme', ['ui', 'trophy']);
        sfx('pop');
    }
    lastClaimable = n;
}

// ---------------- compétences ----------------
export const rank = id => (state.skills && state.skills[id]) || 0;
export const skillsSpent = () => Object.values(state.skills || {}).reduce((a, b) => a + b, 0);
export const skillPoints = () => Math.max(0, state.level - 1 - skillsSpent());
export const branchSpent = b => SKILLS[b].list.reduce((a, sk) => a + rank(sk.id), 0);
export const respecCost = () => 400 * state.level;
export const skillDesc = (sk, r) => fill(sk.desc, 0, r * (sk.per || 0));

export function skillReq(b, k) {
    const sk = SKILLS[b].list[k];
    if (k > 0 && rank(SKILLS[b].list[k - 1].id) < 1) return `Apprenez d’abord « ${SKILLS[b].list[k - 1].name} »`;
    if (sk.cap && branchSpent(b) < CAP_REQ) return `Placez ${CAP_REQ} points en ${SKILLS[b].name.toLowerCase()} pour le débloquer`;
    return null;
}

export function learnSkill(b, k, at) {
    const sk = SKILLS[b].list[k];
    if (skillPoints() < 1 || rank(sk.id) >= sk.max || skillReq(b, k)) return false;
    state.skills[sk.id] = rank(sk.id) + 1;
    sfx('level');
    buzz(20);
    burst(at, 'sparkle', 12);
    float(at, [sk.name], '', -24);
    return true;
}

// la confirmation (second appui) est demandée par l'interface
export function respecSkills() {
    const cost = respecCost();
    if (state.money < cost) {
        toast('Pas assez d’argent pour réinitialiser', ['ui', 'coin']);
        sfx('error');
        return false;
    }
    spend(cost);
    state.skills = {};
    sfx('buy');
    toast('Points de compétence rendus : replacez-les comme vous voulez', ['ui', 'skillbook']);
    return true;
}
