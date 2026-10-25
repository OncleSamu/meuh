// Meuh 1.36 : répartit les niveaux de la 1.35 (50 niveaux) sur 60 niveaux.
// Usage : node tools/levels60.mjs [--write]   (sans --write : seulement le rapport)
// Lit les niveaux d'avant (lv135 s'ils existent, sinon le niveau actuel) et écrit src/data/levels60.js.
// Règles : les niveaux 1 à 20 ne bougent pas ; une chose ne s'ouvre jamais avant ce qu'elle demande ;
// ce que demande un chantier reste débloqué un niveau avant son chapitre ; chaque niveau est rempli au plus
// de sa capacité, le reste passe au niveau suivant (on ne déplace une chose que vers plus tard).
import './test/helpers.mjs';
import fs from 'node:fs';
import { ITEMS } from '../src/data/items.js';
import { MACHINES, RECIPES } from '../src/data/machines.js';
import { ANIMALS } from '../src/data/animals.js';
import { PROJECTS } from '../src/data/village.js';

const WRITE = process.argv.includes('--write');
const MAXL = 60;
const KEEP_UNTIL = 20; // le début de partie ne bouge pas
const CAP_REC = 16;
// niveaux des chapitres (nouvelle échelle) : seuls ceux d'après le Salon bougent
const CH_NEW = { 9: 50, 10: 52, 11: 53, 12: 54 };
const chapterLvl = n => CH_NEW[n] ?? { 1: 2, 2: 7, 3: 13, 4: 19, 5: 25, 6: 28, 7: 30, 8: 33, 13: 38, 14: 39, 15: 40, 16: 43, 17: 35, 18: 37 }[n];
const projLvl = p => chapterLvl(PROJECTS[p].ch);

const old = x => x.lv135 ?? x.reqLvl ?? x.lvl ?? 1;
const oldRec = r => r.lv135 ?? r.lvl ?? 1;
const oldMach = m => m.lv135 ?? m.reqLvl ?? 1;

// ---------- 1. les bornes hautes : ce que demandent les chantiers ----------
const prodBy = {};
for (const a of Object.values(ANIMALS)) for (const k of [a.prodId, a.extra]) if (k) prodBy[k] = a.id;
const gated = id => {
    const it = ITEMS[id],
        r = RECIPES[id];
    if (!it) return false;
    if (it.needProject || it.island) return true;
    return !!r && (!!MACHINES[r.machine].needProject || Object.keys(r.ing).some(gated));
};
const OPEN = {};
const ub = {}; // clé : 'r:id' recette, 'm:id' machine, 'a:id' animal, 'p:id' plante
const pin = (key, v) => {
    if (ub[key] === undefined || v < ub[key]) ub[key] = v;
};
const pinItem = (id, v) => {
    const r = RECIPES[id];
    const lvPlant = ITEMS[id] && ITEMS[id].reqLvl ? old(ITEMS[id]) : 99;
    const lvAnim = prodBy[id] ? old(ANIMALS[prodBy[id]]) : 99;
    const lvRec = r ? Math.max(oldRec(r), oldMach(MACHINES[r.machine])) : 99;
    const best = Math.min(lvPlant, lvAnim, lvRec);
    if (best === lvRec && r) {
        pin('r:' + id, v);
        pin('m:' + r.machine, v);
        for (const k of Object.keys(r.ing)) pinItem(k, v);
    } else if (best === lvAnim && prodBy[id]) pin('a:' + prodBy[id], v);
    else if (ITEMS[id]) pin('p:' + id, v);
};
for (const p of Object.values(PROJECTS)) {
    const c = chapterLvl(p.ch);
    for (const k of Object.keys(p.need)) pinItem(k, gated(k) ? c : Math.max(2, c - 1));
}

const NEW = { item: {}, animal: {}, mach: {}, rec: {} };
// ---------- 4. les machines ----------
const MOVE = { saddlery: 45, dyeworks: 47, perfumery: 49, sugarmill: 56 };
for (const m of Object.values(MACHINES)) {
    const o = oldMach(m);
    let l = MOVE[m.id] ?? o;
    if (m.needProject) l = Math.max(l, projLvl(m.needProject));
    if (ub['m:' + m.id] !== undefined && l > ub['m:' + m.id]) {
        console.log('machine bloquée par un chantier :', m.id, l, '>', ub['m:' + m.id]);
        l = Math.max(o, ub['m:' + m.id]);
    }
    NEW.mach[m.id] = l;
}
// une machine par niveau au plus : en cas d'égalité, la suivante passe au niveau d'après
{
    const used = new Set();
    for (const m of Object.values(MACHINES).sort((a, b) => NEW.mach[a.id] - NEW.mach[b.id] || oldMach(a) - oldMach(b))) {
        while (used.has(NEW.mach[m.id])) NEW.mach[m.id]++;
        used.add(NEW.mach[m.id]);
    }
}

// 4b. de quoi ouvrir chaque machine : une recette faisable avec ce qui est déjà ouvert (les ingrédients de la plus simple passent en borne haute)
const recsAll = Object.values(RECIPES);
const fixedRec = r => r.teacher || r.fete || r.holiday;
for (const m of Object.values(MACHINES)) {
    const o = oldMach(m);
    const mine = recsAll.filter(r => r.machine === m.id && !fixedRec(r) && oldRec(r) <= o);
    if (!mine.length) continue;
    const cost = r => Math.max(0, ...Object.keys(r.ing).map(k => (ITEMS[k] && ITEMS[k].reqLvl ? old(ITEMS[k]) : 0)));
    mine.sort((a, b) => cost(a) - cost(b));
    const r = mine[0];
    pin('r:' + r.id, NEW.mach[m.id]);
    for (const k of Object.keys(r.ing)) pinItem(k, Math.max(NEW.mach[m.id], m.needProject ? projLvl(m.needProject) : 0));
    OPEN[m.id] = r.id;
}

// ---------- 2. les plantes ----------
const plants = Object.values(ITEMS)
    .filter(i => (i.type === 'crop' || i.type === 'tree') && i.reqLvl > 1)
    .sort((a, b) => old(a) - old(b) || (a.type === 'crop' ? -1 : 1));
const place = (cnt, lvl, lo, cap, hi = 99) => {
    let l = Math.max(lo, lvl);
    while ((cnt[l] || 0) >= (typeof cap === 'function' ? cap(l) : cap) && l < Math.min(hi, MAXL)) l++;
    if (l > hi) l = hi;
    cnt[l] = (cnt[l] || 0) + 1;
    return l;
};
const plantCnt = {};
// les plantes d'après le niveau 20 sont posées à intervalles réguliers (environ une et demie par niveau), jamais avant leur niveau d'avant
const latePlants = plants.filter(p => old(p) > KEEP_UNTIL);
for (const p of plants) if (old(p) <= KEEP_UNTIL) NEW.item[p.id] = old(p);
latePlants.forEach((p, k) => {
    const o = old(p);
    let lo = Math.max(o, Math.round(21 + (k * (59 - 21)) / (latePlants.length - 1)));
    if (p.needProject) lo = Math.max(lo, projLvl(p.needProject));
    NEW.item[p.id] = place(plantCnt, lo, lo, 3, ub['p:' + p.id]);
});

// ---------- 3. les animaux : un tous les deux à trois niveaux ----------
const anims = Object.values(ANIMALS).sort((a, b) => old(a) - old(b));
for (const a of anims) if (old(a) <= KEEP_UNTIL) NEW.animal[a.id] = old(a);
// les bêtes d'après le niveau 20 : quatre par tranche de dix niveaux, jamais avant leur niveau d'avant
const ANIM_NEW = {
    bees: 21,
    turkey: 23,
    goat: 26,
    horse: 28,
    ewe: 31,
    pig: 33,
    guinea: 36,
    mohairGoat: 39,
    pheasant: 41,
    donkey: 43,
    peacock: 45,
    buffalo: 48,
    ostrich: 52,
    yak: 54,
    alpaca: 57,
};
for (const a of anims) {
    if (old(a) <= KEEP_UNTIL) continue;
    let l = Math.max(old(a), ANIM_NEW[a.id] ?? old(a));
    if (ub['a:' + a.id] !== undefined && l > ub['a:' + a.id]) {
        console.log('bête bloquée par un chantier :', a.id, l, '>', ub['a:' + a.id]);
        l = Math.max(old(a), ub['a:' + a.id]);
    }
    NEW.animal[a.id] = l;
}

// ---------- 5. les recettes ----------
const recs = Object.values(RECIPES).sort((a, b) => oldRec(a) - oldRec(b));
const fixed = r => r.teacher || r.fete || r.holiday;
const lvOf = id => {
    if (RECIPES[id]) return NEW.rec[id] ?? 0;
    const it = ITEMS[id];
    return Math.max(NEW.item[id] ?? it?.reqLvl ?? 0, prodBy[id] ? NEW.animal[prodBy[id]] : 0, 0);
};
const order = [];
{
    const seen = new Set();
    const visit = r => {
        if (seen.has(r.id)) return;
        seen.add(r.id);
        for (const k of Object.keys(r.ing)) if (RECIPES[k]) visit(RECIPES[k]);
        order.push(r);
    };
    recs.forEach(visit);
}
const recCnt = {};
const opening = new Set();
for (const m of Object.values(MACHINES)) {
    const mine = recs.filter(r => r.machine === m.id && !fixed(r));
    const o = oldMach(m);
    let first = mine.filter(r => oldRec(r) <= o);
    if (!first.length) first = mine.slice(0, 2);
    first.slice(0, 3).forEach(r => opening.add(r.id));
    if (OPEN[m.id]) opening.add(OPEN[m.id]);
}
const lowerBound = r => {
    let lo = Math.max(NEW.mach[r.machine], ...Object.keys(r.ing).map(lvOf));
    const m = MACHINES[r.machine];
    if (m.needProject) lo = Math.max(lo, projLvl(m.needProject));
    return lo;
};
for (const r of order) {
    if (!opening.has(r.id)) continue;
    const l = Math.max(lowerBound(r), NEW.mach[r.machine]);
    NEW.rec[r.id] = l;
    recCnt[l] = (recCnt[l] || 0) + 1;
}
for (const r of order) {
    if (NEW.rec[r.id] !== undefined) continue;
    const o = oldRec(r);
    if (fixed(r) || o <= KEEP_UNTIL) {
        NEW.rec[r.id] = Math.max(o, lowerBound(r));
        recCnt[NEW.rec[r.id]] = (recCnt[NEW.rec[r.id]] || 0) + 1;
        continue;
    }
    NEW.rec[r.id] = place(recCnt, o, lowerBound(r), CAP_REC, ub['r:' + r.id]);
}

// ---------- 6. rapport ----------
const bins = vals => {
    const b = Array(6).fill(0);
    vals.forEach(l => b[Math.min(5, Math.floor((l - 1) / 10))]++);
    return b.join(' ');
};
const perLevel = vals => {
    const c = Array(MAXL + 2).fill(0);
    vals.forEach(l => c[l]++);
    return c;
};
console.log('recettes ', Object.keys(NEW.rec).length, bins(Object.values(NEW.rec)), ' plus de 60 :', Object.values(NEW.rec).filter(l => l > MAXL).length);
console.log('plantes  ', Object.keys(NEW.item).length, bins(Object.values(NEW.item)));
console.log('animaux  ', Object.keys(NEW.animal).length, bins(Object.values(NEW.animal)));
console.log('machines ', Object.keys(NEW.mach).length, bins(Object.values(NEW.mach)));
console.log(
    'recettes par niveau :',
    perLevel(Object.values(NEW.rec))
        .slice(1, MAXL + 1)
        .join(' '),
);
{
    const any = new Set([...Object.values(NEW.item), ...Object.values(NEW.animal), ...Object.values(NEW.mach), ...Object.values(NEW.rec)]);
    const empties = [];
    for (let l = 2; l <= MAXL; l++) if (!any.has(l)) empties.push(l);
    console.log('niveaux sans rien :', empties.join(' ') || 'aucun');
}
const dupMach = {};
for (const [id, l] of Object.entries(NEW.mach)) (dupMach[l] ??= []).push(id);
console.log(
    'machines au même niveau :',
    Object.entries(dupMach)
        .filter(([, v]) => v.length > 1)
        .map(([l, v]) => l + ':' + v.join('+'))
        .join(' ') || 'aucune',
);
const lst = o =>
    Object.entries(o)
        .sort((a, b) => a[1] - b[1])
        .map(([k, v]) => k + v)
        .join(' ');
console.log('machines :', lst(NEW.mach));
console.log('animaux :', lst(NEW.animal));

if (WRITE) {
    const dump = (name, o, changed) => {
        const rows = Object.entries(o)
            .filter(([id]) => changed(id))
            .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]));
        return `export const ${name} = {\n${rows.map(([k, v]) => `    ${k}: ${v},`).join('\n')}\n};\n`;
    };
    const head = `// Meuh 1.36 : 60 niveaux. Le niveau de chaque chose, calculé par tools/levels60.mjs (niveaux 1 à 20 inchangés).\n// Appliqué à la fin de chaque fichier de données ; le niveau d'avant reste dans lv135 (une ancienne partie garde ce qu'elle avait ouvert).\n`;
    fs.writeFileSync(
        new URL('../src/data/levels60.js', import.meta.url),
        head +
            dump('LV60_ITEM', NEW.item, id => NEW.item[id] !== old(ITEMS[id])) +
            dump('LV60_ANIMAL', NEW.animal, id => NEW.animal[id] !== old(ANIMALS[id])) +
            dump('LV60_MACH', NEW.mach, id => NEW.mach[id] !== oldMach(MACHINES[id])) +
            dump('LV60_REC', NEW.rec, id => NEW.rec[id] !== oldRec(RECIPES[id])),
    );
    console.log('src/data/levels60.js écrit');
}
