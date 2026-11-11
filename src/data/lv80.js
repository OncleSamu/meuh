// 1.109 : 80 niveaux. Les nouveautés des niveaux 30 à 64 sont étirées sur 30 à 80 : chaque ancien niveau devient un, deux
// ou trois niveaux (WIDTH), selon ce qu'il ouvrait. Rien ne change avant le niveau 30.
// lv80(ancien) : le nouveau niveau où s'ouvre ce qui s'ouvrait à « ancien » (une machine, un lieu, un chapitre).
// oldLvl(nouveau) : l'ancien niveau équivalent (avec décimales), pour garder l'économie telle qu'elle était réglée.
export const MAX_OLD = 64;
// Les largeurs suivent le nombre de recettes de chaque ancien niveau (environ 13 recettes par nouveau niveau).
export const WIDTH = {
    30: 1, 31: 1, 32: 1, 33: 2, 34: 1, 35: 1, 36: 2, 37: 1, 38: 1, 39: 2, 40: 1, 41: 1, 42: 2, 43: 1, 44: 1, 45: 1, 46: 2,
    47: 1, 48: 1, 49: 2, 50: 1, 51: 2, 52: 1, 53: 2, 54: 1, 55: 2, 56: 1, 57: 2, 58: 2, 59: 2, 60: 1, 61: 2, 62: 2, 63: 2, 64: 2,
}; // prettier-ignore
const LO = {};
{
    let lo = 30;
    for (let l = 30; l <= MAX_OLD; l++) {
        LO[l] = lo;
        lo += WIDTH[l];
    }
}
export const MAX_NEW = LO[MAX_OLD] + WIDTH[MAX_OLD] - 1; // 80
export const lv80 = l => (l <= 30 ? l : l > MAX_OLD ? MAX_NEW : LO[l]);
// le dernier nouveau niveau d'un ancien niveau
export const lv80Hi = l => (l < 30 ? l : l >= MAX_OLD ? MAX_NEW : LO[l] + WIDTH[l] - 1);
export function oldLvl(n) {
    if (n <= 30) return n;
    if (n >= MAX_NEW) return MAX_OLD;
    let l = 30;
    while (l < MAX_OLD && LO[l + 1] <= n) l++;
    return l + (n - LO[l]) / WIDTH[l];
}

// range les registres sur les 80 niveaux : machines, cultures, arbres et bêtes au début (ou le long) de leur tranche,
// recettes réparties sur toute la tranche, jamais avant leur machine, leurs ingrédients ou leur chantier
// pins : les produits qu'un chantier demande ([id, ...]) ; eux et leurs ingrédients s'ouvrent au début de leur tranche,
// pour rester ouverts avant le chapitre qui les demande
export function applyLevels80({ ITEMS, ANIMALS, MACHINES, RECIPES }, gateOf = () => 0, pins = []) {
    const spread = (list, key) => {
        const by = {};
        for (const d of list) if (d[key] > 30) (by[d[key]] = by[d[key]] || []).push(d);
        for (const [l, ds] of Object.entries(by))
            ds.forEach((d, k) => {
                d.lv108 = d[key];
                d[key] = LO[l] + Math.floor((k * WIDTH[l]) / ds.length);
            });
    };
    for (const m of Object.values(MACHINES))
        if (m.reqLvl > 30) {
            m.lv108 = m.reqLvl;
            m.reqLvl = lv80(m.reqLvl);
        }
    spread(Object.values(ITEMS), 'reqLvl');
    spread(Object.values(ANIMALS), 'reqLvl');
    const prodBy = {};
    for (const a of Object.values(ANIMALS)) for (const k of [a.prodId, a.extra]) if (k) prodBy[k] = Math.min(prodBy[k] ?? 999, a.reqLvl);
    // les recettes d'après le niveau 30 : réparties également sur les 50 niveaux, dans l'ordre d'avant, jamais avant le début de leur tranche
    const recs = Object.values(RECIPES)
        .filter(r => r.lvl > 30)
        .map((r, k) => [r, k])
        .sort((x, y) => x[0].lvl - y[0].lvl || x[1] - y[1])
        .map(x => x[0]);
    recs.forEach((r, k) => {
        r.lv108 = r.lvl;
        r.lvl = r.base = Math.max(lv80(r.lvl), 31 + Math.floor((k * (MAX_NEW - 30)) / recs.length));
    });
    const animalOf = {};
    for (const an of Object.values(ANIMALS)) for (const k of [an.prodId, an.extra]) if (k) (animalOf[k] = animalOf[k] || []).push(an);
    const pinned = new Set();
    const pin = id => {
        if (pinned.has(id)) return;
        pinned.add(id);
        const r = RECIPES[id];
        if (r) {
            if (r.lv108 !== undefined) r.lvl = r.base = lv80(r.lv108);
            Object.keys(r.ing).forEach(pin);
        } else {
            if (ITEMS[id] && ITEMS[id].lv108 !== undefined) ITEMS[id].reqLvl = lv80(ITEMS[id].lv108);
            for (const an of animalOf[id] || []) if (an.lv108 !== undefined && an.reqLvl === Math.min(...animalOf[id].map(x => x.reqLvl))) an.reqLvl = lv80(an.lv108);
        }
    };
    pins.forEach(pin);
    for (const an of Object.values(ANIMALS)) for (const k of [an.prodId, an.extra]) if (k) prodBy[k] = Math.min(prodBy[k] === undefined || pinned.has(k) ? 999 : prodBy[k], an.reqLvl);
    // jamais avant la machine, le chantier ou un ingrédient (plusieurs passes : un ingrédient peut lui-même monter)
    const lvOf = id => (RECIPES[id] ? RECIPES[id].lvl : ITEMS[id] ? Math.max(ITEMS[id].reqLvl || 0, prodBy[id] || 0, gateOf(ITEMS[id])) : 0);
    for (let pass = 0; pass < 6; pass++) {
        let moved = false;
        for (const r of recs) {
            const m = MACHINES[r.machine];
            const need = Math.min(MAX_NEW, Math.max(r.lvl, m ? m.reqLvl : 0, m ? gateOf(m) : 0, ...Object.keys(r.ing).map(lvOf)));
            if (need > r.lvl) {
                r.lvl = r.base = need;
                moved = true;
            }
        }
        if (!moved) break;
    }
    // une machine s'ouvre avec au moins deux recettes à son niveau, quand leurs ingrédients le permettent
    for (const m of Object.values(MACHINES).filter(x => x.reqLvl > 30)) {
        const mine = recs.filter(r => r.machine === m.id).sort((x, y) => x.lvl - y.lvl);
        const at = Math.max(m.reqLvl, gateOf(m));
        let have = mine.filter(r => r.lvl <= at).length;
        for (const r of mine) {
            if (have >= 2) break;
            if (r.lvl > at && Math.max(0, ...Object.keys(r.ing).map(lvOf)) <= at) {
                r.lvl = r.base = at;
                have++;
            }
        }
    }
}
