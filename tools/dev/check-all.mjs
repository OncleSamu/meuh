// Garde-fou global de Meuh : vérifie en 1 seconde la cohérence des données, des niveaux, des recettes et des sprites.
// Usage : npm run check  (ou node tools/dev/check-all.mjs)
import fs from 'fs';
import { ITEMS } from '../../src/data/items.js';
import { ANIMALS } from '../../src/data/animals.js';
import { DECOS, UPGRADES } from '../../src/data/farm.js';
import { MACHINES, RECIPES } from '../../src/data/machines.js';
import { LEVELS } from '../../src/data/levels.js';
import { MAX_LEVEL } from '../../src/data/progress.js';
import { FLAVORS } from '../../src/data/genetics.js';
import { CAVE_ITEMS } from '../../src/data/cave.js';
import { HONEYS, HONEY_COL } from '../../src/data/honey.js';
import { PERFUME_NOTES, PERFUME_ORDERS } from '../../src/data/perfume.js';
import { VILLAGERS } from '../../src/data/village.js';
import { CHANGELOG } from '../../src/data/changelog.js';
import { SPR } from '../../src/art/index.js';
import { BLD } from '../../src/art/kit.js';

const errors = [];
const warnings = [];
const okSvg = s => typeof s === 'string' && s.includes('<svg') && s.length > 120;

// 1. Cohérence de src/data/levels.js
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

// 2. Dépendances des recettes et machines
const prodBy = {};
for (const a of Object.values(ANIMALS)) {
    if (!ITEMS[a.prodId]) errors.push(`Animal ${a.id} : prodId inconnu (${a.prodId})`);
    if (a.extra && !ITEMS[a.extra]) errors.push(`Animal ${a.id} : extra inconnu (${a.extra})`);
    for (const k of [a.prodId, a.extra]) if (k) prodBy[k] = Math.min(prodBy[k] ?? 999, a.reqLvl);
}
const lvOf = id => (RECIPES[id] ? RECIPES[id].lvl : Math.max((ITEMS[id] && ITEMS[id].reqLvl) || 0, prodBy[id] || 0));

for (const r of Object.values(RECIPES)) {
    if (!ITEMS[r.id]) errors.push(`Recette ${r.id} : produit absent de ITEMS`);
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
const machByLvl = new Map();
for (const m of Object.values(MACHINES)) {
    if (machByLvl.has(m.reqLvl)) warnings.push(`Deux machines au niveau ${m.reqLvl} : ${machByLvl.get(m.reqLvl)} et ${m.id}`);
    machByLvl.set(m.reqLvl, m.id);
    const mine = Object.values(RECIPES).filter(r => r.machine === m.id);
    if (mine.length && !mine.some(r => r.lvl === m.reqLvl)) errors.push(`Machine ${m.id} (niv. ${m.reqLvl}) sans recette à son niveau d’ouverture`);
}
for (let l = 30; l <= MAX_LEVEL; l++) {
    const n = Object.values(RECIPES).filter(r => r.lvl === l).length;
    if (n < 8 || n > 20) warnings.push(`Niveau ${l} : ${n} recettes (recommandé : 8 à 20)`);
}

// 3. Synchronisation des niveaux inline dans les fichiers sources principaux avec levels.js
function checkInline(filePath, sectionRe, kind, key) {
    const src = fs.readFileSync(filePath, 'utf8');
    const start = src.match(sectionRe)?.index ?? 0;
    for (const [id, finalLvl] of Object.entries(LEVELS[kind])) {
        const entryRe = new RegExp(`(^|\\n)(\\s*${id}:\\s*\\{)`, 'g');
        entryRe.lastIndex = start;
        const m = entryRe.exec(src);
        if (!m) continue;
        const openBrace = m.index + m[1].length + m[2].length - 1;
        let depth = 0,
            endBrace = -1;
        for (let i = openBrace; i < src.length; i++) {
            if (src[i] === '{') depth++;
            else if (src[i] === '}') {
                depth--;
                if (depth === 0) {
                    endBrace = i;
                    break;
                }
            }
        }
        if (endBrace < 0) continue;
        const block = src.slice(openBrace, endBrace + 1);
        const km = block.match(new RegExp(`\\b${key}:\\s*(\\d+)`));
        if (km && +km[1] !== finalLvl) warnings.push(`${filePath} · ${id} : ${key}=${km[1]} inline ≠ levels.js (${finalLvl})`);
    }
}
checkInline('src/data/items.js', /export const ITEMS = \{/, 'items', 'reqLvl');
checkInline('src/data/animals.js', /export const ANIMALS = \{/, 'animals', 'reqLvl');
checkInline('src/data/farm.js', /export const DECOS = \{/, 'decos', 'reqLvl');
checkInline('src/data/farm.js', /export const UPGRADES = \{/, 'upgrades', 'reqLvl');
checkInline('src/data/machines.js', /export const MACHINES = \{/, 'machines', 'reqLvl');
checkInline('src/data/machines.js', /export const RECIPES = \{/, 'recipes', 'lvl');

// 4. Sprites SVG et profils annexes (saveurs, cave, miels)
for (const it of Object.values(ITEMS)) {
    if (!SPR.has.items[it.id]) errors.push(`Item ${it.id} : dessin manquant dans src/art/`);
    else if (!okSvg(SPR.item(it.id))) errors.push(`Item ${it.id} : SVG invalide`);
    if (it.type === 'crop' || it.type === 'tree') {
        if (!FLAVORS[it.id]) errors.push(`Plante/arbre ${it.id} : profil absent de FLAVORS (genetics.js)`);
        for (const st of [0, 1, 2]) if (!okSvg(SPR.plant(it.id, st))) errors.push(`Plante ${it.id} (stade ${st}) : SVG invalide`);
    }
}
for (const a of Object.values(ANIMALS)) if (!SPR.has.animals[a.id] || !okSvg(SPR.animal(a.id))) errors.push(`Animal ${a.id} : dessin manquant ou invalide`);
for (const m of Object.values(MACHINES)) if (!SPR.has.machines[m.id] || !okSvg(SPR.machine(m.id))) errors.push(`Machine ${m.id} : dessin manquant ou invalide`);
for (const id of Object.keys(BLD)) if (!okSvg(SPR.building(id, false))) errors.push(`Bâtiment ${id} : dessin invalide`);
for (const id of Object.keys(CAVE_ITEMS)) if (id !== 'beer' && !ITEMS[id]) errors.push(`Cave ${id} : produit inconnu`);
for (const id of Object.keys(HONEYS)) if (!HONEY_COL[id]) errors.push(`Miel ${id} : couleur absente de HONEY_COL`);
for (const id of Object.keys(PERFUME_NOTES)) if (!ITEMS[id]) errors.push(`Parfumerie ${id} : essence absente de ITEMS`);
for (const vid of PERFUME_ORDERS.villagers) if (!VILLAGERS[vid]) errors.push(`Parfumerie Salon : villageois inconnu « ${vid} »`);
if (!SPR.has.ui.perfume || !okSvg(SPR.ui('perfume'))) errors.push('Icône UI perfume manquante ou invalide');

// 5. Documentation en jeu : la version courante (VERSION) doit figurer en tête de changelog.js
const curVersion = fs.readFileSync('VERSION', 'utf8').trim();
if (!CHANGELOG[0] || CHANGELOG[0].v !== curVersion) {
    errors.push(`VERSION (${curVersion}) ≠ dernière entrée de src/data/changelog.js (${CHANGELOG[0] ? CHANGELOG[0].v : 'vide'})`);
}

console.log(
    `Audit Meuh ${curVersion} : ${Object.keys(ITEMS).length} produits · ${Object.keys(ANIMALS).length} animaux · ${Object.keys(MACHINES).length} machines · ${Object.keys(RECIPES).length} recettes · ${Object.keys(SPR.has.items).length} sprites d’objets`,
);
console.log(`Erreurs : ${errors.length} | Avertissements : ${warnings.length}`);
for (const e of errors) console.error('  ✗', e);
for (const w of warnings) console.warn('  !', w);
if (errors.length) process.exit(1);
