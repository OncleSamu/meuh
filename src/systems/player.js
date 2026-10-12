// Le joueur : argent, expérience et niveaux, équipement, compétences, succès et cadeau du jour.
import { state } from '../core/state.js';
import { today } from '../core/clock.js';
import { fmt, dateKey, fill } from '../core/format.js';
import { emit, toast, sfx, buzz, burst, float } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { ANIMALS } from '../data/animals.js';
import { MACHINES, RECIPES } from '../data/machines.js';
import { UPGRADES, DECOS, DOG, GH, STYLE_LVL } from '../data/farm.js';
import { CHAPTERS, PROJECTS } from '../data/village.js';
import { NATURE } from '../data/nature.js';
import { CAVE_LVL } from '../data/cave.js';
import { INCIDENT_LVL, RARE_EVENT_LVL } from '../data/surprises.js';
import { CONTRACT_LVL, CONTEST_LVL, LEAGUES } from '../data/commerce.js';
import { DAILY_REWARDS } from '../data/world.js';
import { BALANCE, MAX_LEVEL, RENOWN_XP, ACH_REWARDS, MEDALS, CAP_REQ, MASTERY_LVL, HOUSE, FARMHAND, ALBUM_LEVELS } from '../data/progress.js';
import { ACHIEVEMENTS, SKILLS } from '../data/meta.js';
import { trackDayEarn, record } from './book.js';
import { renownStar } from './mastery.js';
import { addPhoto } from './style.js';
import { ensureQuests } from './orders.js';

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
export const getXpReq = lvl => {
    const B = BALANCE,
        early = l => B.xpBase * Math.pow(B.xpGrowth, l - 1);
    const xp = lvl <= B.xpKnee ? early(lvl) : early(B.xpKnee) + B.xpA * Math.pow(lvl - B.xpKnee, B.xpP);
    return Math.round(xp / 10) * 10;
};

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
    if (lvl === 1) return [{ icon: ['seed', 'wheat'], name: 'Graines de blé, le champ et le magasin' }];
    const list = [{ icon: ['ui', 'skillbook'], name: '1 point de compétence à placer dans Progrès' }];
    const add = (icon, name) => list.push({ icon, name });
    Object.values(ITEMS).forEach(x => {
        if (x.reqLvl !== lvl || x.exotic) return;
        if (x.type === 'crop' || x.type === 'tree') add(['seed', x.id], x.seedName + (x.needProject ? ` (après « ${PROJECTS[x.needProject].name} »)` : ''));
        else add(['item', x.id], `${x.name} (au magasin)`);
    });
    Object.values(ANIMALS).forEach(x => x.reqLvl === lvl && add(['animal', x.id], x.name));
    Object.values(MACHINES).forEach(
        x => x.reqLvl === lvl && add(['machine', x.id], x.name + (x.needProject ? ` (après « ${PROJECTS[x.needProject].name} »)` : '')),
    );
    const recs = Object.values(RECIPES).filter(r => r.lvl === lvl && !r.teacher && r.lvl > MACHINES[r.machine].reqLvl);
    if (recs.length)
        add(
            ['item', recs[0].id],
            `${recs.length} nouvelle${recs.length > 1 ? 's' : ''} recette${recs.length > 1 ? 's' : ''} : ${recs.map(r => ITEMS[r.id].name.toLowerCase()).join(', ')}`,
        );
    Object.values(DECOS).forEach(x => x.reqLvl === lvl && !x.rare && add(['ui', x.id], `Décoration : ${x.name.toLowerCase()}`));
    CHAPTERS.forEach(c => {
        if (c.lvl === lvl && c.n > 1)
            add(
                ['ui', 'village'],
                `${{ hamlet: 'Hameau', port: 'Port', alpine: 'Alpage', domaine: 'Domaine' }[c.map] || 'Village'} : chapitre ${c.n}, « ${c.name} » (après le chapitre ${c.n - 1})`,
            );
    });
    Object.values(UPGRADES).forEach(u => u.reqLvl === lvl && add(['ui', u.id], `${u.name} (au magasin)`));
    if (lvl === CAVE_LVL) add(['ui', 'cave'], 'La cave : affinez fromages et cidres, et vendez-les aux enchères (onglet Atelier, puis Cave)');
    if (lvl === CHAPTERS[0].lvl) add(['ui', 'village'], 'Rénovez le village : premier chapitre (onglet Village)');
    if (lvl === INCIDENT_LVL) add(['ui', 'pest'], 'Des imprévus surviennent à la ferme : réagissez vite !');
    if (lvl === DOG.reqLvl) add(['ui', 'dog'], 'Un chien de ferme à adopter');
    if (lvl === NATURE.forest.lvl) add(['item', 'wood'], 'La forêt : coupez du bois (Ferme | Nature)');
    if (lvl === NATURE.mine.lvl) add(['item', 'stone'], 'La mine : cassez des rochers (Ferme | Nature)');
    if (lvl === NATURE.pond.lvl) add(['ui', 'rod'], 'L’étang : allez pêcher (Ferme | Nature)');
    if (lvl === GH.lvl) add(['ui', 'greenhouse'], 'Serre (à construire dans la ferme)');
    if (lvl === CONTRACT_LVL) add(['ui', 'calendar'], 'Contrats de saison : une grosse livraison par saison, avec un ruban (onglet Village)');
    if (lvl === RARE_EVENT_LVL) add(['ui', 'fair'], 'Événements rares : foire aux bestiaux, critique gastronomique, nuée de papillons');
    if (lvl === STYLE_LVL) add(['item', 'brush'], 'Personnalisation : clôture, allées, toit et grange (touchez la maison)');
    if (lvl === MASTERY_LVL) add(['ui', 'medalB'], 'Maîtrise des produits : produisez beaucoup pour gagner des étoiles (Livre de la ferme)');
    HOUSE.forEach((h, k) => h.lvl === lvl && add(['ui', 'house'], `Maison de la ferme, niveau ${k} : ${h.bonus.toLowerCase()}`));
    FARMHAND.forEach((h, k) => h && h.lvl === lvl && add(['villager', 'theo'], `Commis de ferme, niveau ${k} : ${h.plots} parcelles`));
    LEAGUES.forEach(g => {
        if (g.lvl === lvl && g.lvl > CONTEST_LVL) add(['ui', 'podium'], `Concours : la ligue ${g.name.toLowerCase()} est ouverte (gagnez pour y monter)`);
    });
    if (lvl === MAX_LEVEL) {
        add(['ui', 'star'], 'Niveau maximum : l’expérience vous rapporte désormais des étoiles de renommée');
        add(['ui', 'goldCow'], 'Visez le titre de Ferme légendaire (Livre de la ferme)');
    }
    return list;
}

// ---------------- équipement de la ferme ----------------
export const upgradeCost = id => Math.floor(UPGRADES[id].baseCost * Math.pow(UPGRADES[id].mult, state.upgrades[id] || 0));
export const upgradeOpen = id => state.level >= (UPGRADES[id].reqLvl || 1);

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
    toast(`Succès « ${a.name} » : médaille ${['de bronze', 'd’argent', 'd’or'][tier]} !`, ['ui', MEDALS[tier]]);
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
    if (k > 0 && rank(SKILLS[b].list[k - 1].id) < 1) return `Apprenez d’abord « ${SKILLS[b].list[k - 1].name} »`;
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
    toast('Points de compétence rendus : replacez-les comme vous voulez', ['ui', 'skillbook']);
    return true;
}
