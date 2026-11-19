// Audit de rentabilité économique de Meuh : pièces/min, marges nettes, XP/min, goulots d'étranglement et anomalies.
// Usage : npm run econ  (options : --json, --top 15, --machine bakery, --strict)
import { ITEMS } from '../../src/data/items.js';
import { ANIMALS } from '../../src/data/animals.js';
import { MACHINES, RECIPES } from '../../src/data/machines.js';
import { applyLevels } from '../../src/data/levels.js';

applyLevels();

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const strict = args.includes('--strict');
const topIdx = args.indexOf('--top');
const TOP = topIdx >= 0 ? Math.max(1, parseInt(args[topIdx + 1], 10) || 15) : 15;
const machIdx = args.indexOf('--machine');
const ONLY_MACHINE = machIdx >= 0 ? args[machIdx + 1] : null;

const round1 = n => Math.round(n * 10) / 10;
const fmtN = n => (Number.isFinite(n) ? n.toLocaleString('fr-FR', { maximumFractionDigits: 1 }) : '—');
const pad = (s, w, right = false) => {
    const str = String(s);
    return right ? str.padStart(w) : str.padEnd(w);
};

// Coût récursif en matières premières (si tout est fabriqué depuis le brut)
const rawCostMemo = new Map();
function rawCostOf(id, seen = new Set()) {
    if (rawCostMemo.has(id)) return rawCostMemo.get(id);
    const r = RECIPES[id];
    if (!r || seen.has(id)) return (ITEMS[id] && ITEMS[id].sell) || 0;
    const next = new Set(seen);
    next.add(id);
    const total = Object.entries(r.ing || {}).reduce((acc, [k, q]) => acc + rawCostOf(k, next) * q, 0);
    const unit = total / (r.outQty || 1);
    rawCostMemo.set(id, unit);
    return unit;
}

// 1. Cultures & arbres
const crops = Object.values(ITEMS)
    .filter(it => (it.type === 'crop' || it.type === 'tree') && it.time > 0)
    .map(it => {
        const net = it.type === 'crop' ? it.sell - (it.cost || 0) : it.sell;
        const mins = it.time / 60;
        return {
            id: it.id,
            name: it.name,
            type: it.type,
            lvl: it.reqLvl || 1,
            cost: it.cost || 0,
            sell: it.sell || 0,
            net,
            time: it.time,
            goldPerMin: round1(net / mins),
            xpPerMin: round1((it.xp || 0) / mins),
        };
    });

// 2. Animaux
const animals = Object.values(ANIMALS)
    .filter(a => a.time > 0 && ITEMS[a.prodId])
    .map(a => {
        const prod = ITEMS[a.prodId];
        const mins = a.time / 60;
        return {
            id: a.id,
            name: a.name,
            prodId: a.prodId,
            prodName: prod.name,
            lvl: a.reqLvl || 1,
            sell: prod.sell || 0,
            time: a.time,
            goldPerMin: round1((prod.sell || 0) / mins),
            xpPerMin: round1((a.xp || 0) / mins),
        };
    });

// 3. Recettes (rentabilité directe & récursive)
const allRecipes = Object.values(RECIPES).filter(r => !ONLY_MACHINE || r.machine === ONLY_MACHINE);
const recipes = allRecipes.map(r => {
    const it = ITEMS[r.id];
    const outQty = r.outQty || 1;
    const revenue = ((it && it.sell) || 0) * outQty;
    const directCost = Object.entries(r.ing || {}).reduce((a, [k, q]) => a + ((ITEMS[k] && ITEMS[k].sell) || 0) * q, 0);
    const rawCost = Object.entries(r.ing || {}).reduce((a, [k, q]) => a + rawCostOf(k) * q, 0);
    const margin = revenue - directCost;
    const marginPct = directCost > 0 ? (margin / directCost) * 100 : 100;
    const mins = Math.max(1, r.time || 60) / 60;
    return {
        id: r.id,
        name: it ? it.name : r.id,
        machine: r.machine,
        machineName: (MACHINES[r.machine] && MACHINES[r.machine].name) || r.machine,
        lvl: r.lvl || 1,
        time: r.time || 60,
        outQty,
        revenue,
        directCost,
        rawCost: Math.round(rawCost),
        margin,
        marginPct: round1(marginPct),
        goldPerMin: round1(margin / mins),
        grossPerMin: round1(revenue / mins),
        xp: r.xp || 0,
        xpPerMin: round1((r.xp || 0) / mins),
    };
});

// Médianes par tranche de 10 niveaux pour repérer les outliers pièces/min (recettes vendables uniquement)
const sellable = recipes.filter(r => r.revenue > 0);
const nonSellable = recipes.filter(r => r.revenue <= 0);
const median = arr => {
    if (!arr.length) return 0;
    const s = [...arr].sort((a, b) => a - b);
    const m = Math.floor(s.length / 2);
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
const bracketMedians = new Map();
for (const r of sellable) {
    const br = Math.floor((r.lvl - 1) / 10);
    if (!bracketMedians.has(br)) bracketMedians.set(br, []);
    bracketMedians.get(br).push(r.goldPerMin);
}
for (const [br, vals] of bracketMedians) bracketMedians.set(br, median(vals));

const negativeMargin = sellable.filter(r => r.margin <= 0).sort((a, b) => a.margin - b.margin);
const lowMargin = sellable.filter(r => r.margin > 0 && r.directCost > 0 && r.marginPct < 15).sort((a, b) => a.marginPct - b.marginPct);
const highOutliers = sellable
    .map(r => {
        const med = bracketMedians.get(Math.floor((r.lvl - 1) / 10)) || 1;
        return { ...r, ratio: med > 0 ? round1(r.goldPerMin / med) : 0, bracketMed: round1(med) };
    })
    .filter(r => r.bracketMed > 0 && r.ratio >= 4)
    .sort((a, b) => b.ratio - a.ratio);

// 4. Agrégat par machine (sur recettes vendables)
const byMachine = Object.values(MACHINES)
    .filter(m => !ONLY_MACHINE || m.id === ONLY_MACHINE)
    .map(m => {
        const list = sellable.filter(r => r.machine === m.id);
        if (!list.length) return null;
        const avgGpm = round1(list.reduce((a, x) => a + x.goldPerMin, 0) / list.length);
        const avgMarginPct = round1(list.reduce((a, x) => a + x.marginPct, 0) / list.length);
        const best = [...list].sort((a, b) => b.goldPerMin - a.goldPerMin)[0];
        const worst = [...list].sort((a, b) => a.marginPct - b.marginPct)[0];
        return {
            id: m.id,
            name: m.name,
            lvl: m.reqLvl,
            count: list.length,
            avgGpm,
            avgMarginPct,
            best: { id: best.id, name: best.name, goldPerMin: best.goldPerMin },
            worst: { id: worst.id, name: worst.name, marginPct: worst.marginPct },
        };
    })
    .filter(Boolean)
    .sort((a, b) => a.lvl - b.lvl);

// 5. Fréquence d'utilisation des ingrédients
const usage = {};
for (const r of Object.values(RECIPES)) {
    for (const [k, q] of Object.entries(r.ing || {})) {
        if (!usage[k]) usage[k] = { id: k, name: (ITEMS[k] && ITEMS[k].name) || k, type: (ITEMS[k] && ITEMS[k].type) || '?', recipes: 0, totalUnits: 0 };
        usage[k].recipes++;
        usage[k].totalUnits += q;
    }
}
const topBottlenecks = Object.values(usage).sort((a, b) => b.recipes - a.recipes || b.totalUnits - a.totalUnits);
const underUsed = Object.values(ITEMS)
    .filter(it => ['crop', 'tree', 'product', 'fish', 'ore', 'gem'].includes(it.type))
    .map(it => ({ id: it.id, name: it.name, type: it.type, lvl: it.reqLvl || 1, recipes: usage[it.id]?.recipes || 0 }))
    .filter(x => x.recipes <= 1)
    .sort((a, b) => a.recipes - b.recipes || a.lvl - b.lvl);

const report = {
    summary: {
        items: Object.keys(ITEMS).length,
        cropsAndTrees: crops.length,
        animals: animals.length,
        recipes: recipes.length,
        sellableRecipes: sellable.length,
        nonSellableRecipes: nonSellable.length,
        machines: byMachine.length,
        negativeMarginCount: negativeMargin.length,
        lowMarginCount: lowMargin.length,
        highOutlierCount: highOutliers.length,
        underUsedRawCount: underUsed.length,
    },
    topRecipesGoldPerMin: [...sellable].sort((a, b) => b.goldPerMin - a.goldPerMin).slice(0, TOP),
    topRecipesXpPerMin: [...recipes].sort((a, b) => b.xpPerMin - a.xpPerMin).slice(0, TOP),
    topCropsGoldPerMin: [...crops].sort((a, b) => b.goldPerMin - a.goldPerMin).slice(0, TOP),
    byMachine,
    topBottlenecks: topBottlenecks.slice(0, TOP),
    underUsedRaw: underUsed,
    anomalies: {
        negativeMargin,
        lowMargin: lowMargin.slice(0, TOP),
        highOutliers: highOutliers.slice(0, TOP),
    },
};

if (asJson) {
    console.log(JSON.stringify(report, null, 2));
} else {
    const s = report.summary;
    console.log('══════════════════════════════════════════════════════════════════════════════');
    console.log(`  AUDIT ÉCONOMIQUE MEUH · ${s.recipes} recettes · ${s.cropsAndTrees} cultures/arbres · ${s.animals} animaux`);
    console.log('══════════════════════════════════════════════════════════════════════════════');
    console.log(
        `  Marges ≤ 0 : ${s.negativeMarginCount} | Marges < 15 % : ${s.lowMarginCount} | Outliers ≥ 4× médiane : ${s.highOutlierCount} | Bruts ≤ 1 recette : ${s.underUsedRawCount}`,
    );

    console.log(`\n── Top ${TOP} recettes (valeur ajoutée nette / minute) ──`);
    for (const r of report.topRecipesGoldPerMin) {
        console.log(
            `  ${pad(`niv.${r.lvl}`, 7)} ${pad(r.name, 28)} ${pad(r.machineName, 20)} ${pad(`${fmtN(r.goldPerMin)} p/min`, 14, true)}  (marge +${fmtN(r.margin)} · ${r.marginPct}%)`,
        );
    }

    console.log(`\n── Top ${Math.min(10, TOP)} recettes (XP / minute) ──`);
    for (const r of report.topRecipesXpPerMin.slice(0, 10)) {
        console.log(`  ${pad(`niv.${r.lvl}`, 7)} ${pad(r.name, 28)} ${pad(r.machineName, 20)} ${pad(`${fmtN(r.xpPerMin)} XP/min`, 14, true)}  (${r.xp} XP / ${r.time}s)`);
    }

    console.log('\n── Synthèse par machine ──');
    for (const m of byMachine) {
        console.log(
            `  ${pad(`niv.${m.lvl}`, 7)} ${pad(m.name, 22)} ${pad(`${m.count} rec.`, 9, true)}  moy. ${pad(`${fmtN(m.avgGpm)} p/min`, 13, true)}  marge ${pad(`${m.avgMarginPct}%`, 7, true)}  top: ${m.best.name}`,
        );
    }

    console.log(`\n── Top ${TOP} ingrédients goulots d'étranglement ──`);
    for (const u of report.topBottlenecks) {
        console.log(`  ${pad(u.name, 26)} ${pad(u.type, 10)} utilisé dans ${pad(u.recipes, 4, true)} recettes (${u.totalUnits} unités cumulées)`);
    }

    console.log(`\n── Anomalies : marges négatives ou nulles (${negativeMargin.length}) ──`);
    if (!negativeMargin.length) console.log('  ✓ Aucune recette à marge négative ou nulle.');
    for (const r of negativeMargin.slice(0, TOP)) {
        console.log(
            `  ✗ ${pad(`niv.${r.lvl}`, 7)} ${pad(r.name, 28)} vente ${r.revenue} vs ingr. ${r.directCost} (marge ${r.margin}, ${r.marginPct}%)`,
        );
    }

    console.log(`\n── Anomalies : marges faibles < 15 % (${lowMargin.length}) ──`);
    if (!lowMargin.length) console.log('  ✓ Aucune recette sous 15 % de marge directe.');
    for (const r of lowMargin.slice(0, TOP)) {
        console.log(
            `  ! ${pad(`niv.${r.lvl}`, 7)} ${pad(r.name, 28)} vente ${r.revenue} vs ingr. ${r.directCost} (marge +${r.margin}, ${r.marginPct}%)`,
        );
    }

    console.log(`\n── Outliers pièces/min (≥ 4× la médiane de leur tranche de niveau) (${highOutliers.length}) ──`);
    for (const r of highOutliers.slice(0, 12)) {
        console.log(
            `  ★ ${pad(`niv.${r.lvl}`, 7)} ${pad(r.name, 28)} ${pad(`${fmtN(r.goldPerMin)} p/min`, 14, true)}  (${r.ratio}× médiane ${fmtN(r.bracketMed)} p/min)`,
        );
    }

    console.log(`\n── Produits bruts peu utilisés (0 ou 1 recette : ${underUsed.length}) ──`);
    const zero = underUsed.filter(x => x.recipes === 0);
    const one = underUsed.filter(x => x.recipes === 1);
    console.log(`  0 recette (${zero.length}) : ${zero.slice(0, 20).map(x => `${x.name} (n.${x.lvl})`).join(', ')}${zero.length > 20 ? '…' : ''}`);
    console.log(`  1 recette (${one.length}) : ${one.slice(0, 20).map(x => `${x.name} (n.${x.lvl})`).join(', ')}${one.length > 20 ? '…' : ''}`);
}

if (strict && negativeMargin.length) process.exit(1);
