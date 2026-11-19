// Vérifie la cohérence de src/data/levels.js et affiche au besoin la progression niveau par niveau (1 à 80).
// Usage :
//   node tools/dev/check-levels.mjs               → contrôle tous les invariants
//   node tools/dev/check-levels.mjs --roadmap     → affiche ce qui se débloque à chaque niveau (1..80)
//   node tools/dev/check-levels.mjs --level 42    → détail d’un niveau précis
import { ITEMS } from '../../src/data/items.js';
import { ANIMALS } from '../../src/data/animals.js';
import { DECOS, UPGRADES } from '../../src/data/farm.js';
import { MACHINES, RECIPES } from '../../src/data/machines.js';
import { LEVELS } from '../../src/data/levels.js';
import { CHAPTERS } from '../../src/data/village.js';
import { MAX_LEVEL } from '../../src/data/progress.js';

const errors = [];
const warnings = [];

// 1. Vérifier qu'aucune entrée de levels.js ne pointe vers un ID inexistant
for (const [kind, tbl] of [
    ['items', ITEMS],
    ['animals', ANIMALS],
    ['machines', MACHINES],
    ['recipes', RECIPES],
    ['decos', DECOS],
    ['upgrades', UPGRADES],
]) {
    for (const [id, l] of Object.entries(LEVELS[kind] || {})) {
        if (!tbl[id]) errors.push(`LEVELS.${kind}.${id} : identifiant inconnu`);
        if (l < 1 || l > MAX_LEVEL) errors.push(`LEVELS.${kind}.${id} : niveau hors borne (${l})`);
    }
}

// 2. Vérifier que toute recette s'ouvre après sa machine et tous ses ingrédients
const prodBy = {};
for (const a of Object.values(ANIMALS)) for (const k of [a.prodId, a.extra]) if (k) prodBy[k] = Math.min(prodBy[k] ?? 999, a.reqLvl);
const lvOf = id => (RECIPES[id] ? RECIPES[id].lvl : Math.max((ITEMS[id] && ITEMS[id].reqLvl) || 0, prodBy[id] || 0));

for (const r of Object.values(RECIPES)) {
    const m = MACHINES[r.machine];
    if (!m) {
        errors.push(`Recette ${r.id} : machine inconnue (${r.machine})`);
        continue;
    }
    if (r.lvl < m.reqLvl) errors.push(`Recette ${r.id} (niv. ${r.lvl}) avant sa machine ${m.id} (niv. ${m.reqLvl})`);
    for (const k of Object.keys(r.ing || {})) {
        if (!ITEMS[k]) errors.push(`Recette ${r.id} : ingrédient inconnu (${k})`);
        else if (lvOf(k) > r.lvl) errors.push(`Recette ${r.id} (niv. ${r.lvl}) avant son ingrédient ${k} (niv. ${lvOf(k)})`);
    }
}

// 3. Vérifier qu'une machine ouvre avec au moins une recette à son niveau et qu'il n'y a pas 2 machines sur le même niveau
const machByLvl = new Map();
for (const m of Object.values(MACHINES)) {
    if (machByLvl.has(m.reqLvl)) warnings.push(`Deux machines au niveau ${m.reqLvl} : ${machByLvl.get(m.reqLvl)} et ${m.id}`);
    machByLvl.set(m.reqLvl, m.id);
    const mine = Object.values(RECIPES).filter(r => r.machine === m.id);
    if (mine.length && !mine.some(r => r.lvl === m.reqLvl)) {
        errors.push(`Machine ${m.id} (niv. ${m.reqLvl}) sans aucune recette à son niveau d’ouverture`);
    }
}

// 4. Densité des recettes par niveau (30..80)
for (let l = 30; l <= MAX_LEVEL; l++) {
    const n = Object.values(RECIPES).filter(r => r.lvl === l).length;
    if (n < 8 || n > 20) warnings.push(`Niveau ${l} : ${n} recettes (recommandé : 8 à 20)`);
}

const showLevel = l => {
    const chaps = CHAPTERS.filter(c => c.lvl === l).map(c => c.name);
    const machs = Object.values(MACHINES).filter(m => m.reqLvl === l).map(m => m.name);
    const crops = Object.values(ITEMS).filter(i => (i.type === 'crop' || i.type === 'tree') && i.reqLvl === l).map(i => i.name);
    const anims = Object.values(ANIMALS).filter(a => a.reqLvl === l).map(a => a.name);
    const recs = Object.values(RECIPES).filter(r => r.lvl === l);
    const parts = [];
    if (chaps.length) parts.push(`Chapitre: ${chaps.join(', ')}`);
    if (machs.length) parts.push(`Atelier: ${machs.join(', ')}`);
    if (crops.length) parts.push(`Plantes: ${crops.join(', ')}`);
    if (anims.length) parts.push(`Animaux: ${anims.join(', ')}`);
    parts.push(`${recs.length} recettes`);
    console.log(`Niv. ${String(l).padStart(2)} | ${parts.join(' · ')}`);
    if (process.argv.includes('--level')) {
        console.log('   Recettes :', recs.map(r => `${ITEMS[r.id]?.name || r.id} (${MACHINES[r.machine]?.name})`).join(', '));
    }
};

const lvlIdx = process.argv.indexOf('--level');
if (lvlIdx > 0) {
    showLevel(Number(process.argv[lvlIdx + 1]));
} else if (process.argv.includes('--roadmap')) {
    for (let l = 1; l <= MAX_LEVEL; l++) showLevel(l);
} else {
    console.log(
        `Contrôle de src/data/levels.js : ${Object.keys(ITEMS).length} produits, ${Object.keys(ANIMALS).length} animaux, ${Object.keys(MACHINES).length} machines, ${Object.keys(RECIPES).length} recettes.`,
    );
    console.log(`Erreurs : ${errors.length} | Avertissements : ${warnings.length}`);
    for (const e of errors) console.error('  ✗', e);
    for (const w of warnings) console.warn('  !', w);
    if (errors.length) process.exit(1);
}
