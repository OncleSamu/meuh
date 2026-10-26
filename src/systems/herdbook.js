// 1.46 : le carnet de l'élevage. Le carnet des robes (chaque couleur et chaque motif vus sur une espèce, et les raretés :
// finitions et auréole) et les associations au pré (deux espèces dans un même pré s'entraident ou se gênent).
import { state, scaleLvl } from '../core/state.js';
import { now } from '../core/clock.js';
import { view } from '../core/view.js';
import { toast, sfx, changed } from '../core/bus.js';
import { ANIMALS, BIRTHS } from '../data/animals.js';
import { LOOKS } from '../data/genetics.js';
import { ROBEBOOK, ASSOC_LVL, PAIRS } from '../data/elevage.js';
import { looksOf } from './genetics.js';
import { earn, addXp } from './player.js';
import { addPhoto } from './style.js';
import { tip } from './tips.js';

export const robebookOpen = () => state.level >= ROBEBOOK.lvl;
export const assocOpen = () => state.level >= ASSOC_LVL;
// les espèces du carnet (pas les abeilles ; les chevaux ont leur collection au haras)
export const BOOK_TYPES = Object.keys(ANIMALS).filter(t => !BIRTHS.skip.includes(t));
export const ROBE_COLORS = LOOKS.color.map((_, i) => i).slice(1);
export const ROBE_PATTERNS = LOOKS.pattern.map((_, i) => i).slice(1);
export const RARE_LOOKS = [...LOOKS.finish.map((_, i) => 'f' + i).slice(1), 'halo'];
export const robeTotal = () => ROBE_COLORS.length + ROBE_PATTERNS.length;

export function ensureHerdbook() {
    if (!state.herdbook || typeof state.herdbook !== 'object') state.herdbook = {};
    const h = state.herdbook;
    h.robes = h.robes || {}; // { type: { c: [i…], p: [i…] } }
    h.rare = h.rare || []; // ['f1', 'halo'…]
    h.done = h.done || {}; // espèces complètes
    h.pairs = h.pairs || {}; // associations découvertes
    return h;
}
const robesOf = type => {
    const h = ensureHerdbook();
    return (h.robes[type] ||= { c: [], p: [] });
};
export const robeCount = type => {
    const r = state.herdbook && state.herdbook.robes && state.herdbook.robes[type];
    return r ? r.c.length + r.p.length : 0;
};
export const hasRobe = (type, kind, i) => {
    const r = state.herdbook && state.herdbook.robes && state.herdbook.robes[type];
    return !!(r && r[kind].includes(i));
};
export const hasRare = id => !!(state.herdbook && state.herdbook.rare && state.herdbook.rare.includes(id));

// regarde le troupeau et note ce qui est nouveau ; renvoie les trouvailles
export function scanRobes() {
    if (!robebookOpen()) return [];
    const h = ensureHerdbook();
    const found = [];
    for (const a of state.animals) {
        if (!a.g || !a.g.l || !BOOK_TYPES.includes(a.type)) continue;
        const l = looksOf(a.g);
        const r = robesOf(a.type);
        if (l.color && !r.c.includes(l.color)) {
            r.c.push(l.color);
            found.push({ type: a.type, kind: 'c', i: l.color, a });
        }
        if (l.pattern && !r.p.includes(l.pattern)) {
            r.p.push(l.pattern);
            found.push({ type: a.type, kind: 'p', i: l.pattern, a });
        }
        const rares = [l.finish ? 'f' + l.finish : null, l.halo ? 'halo' : null].filter(Boolean);
        for (const x of rares)
            if (!h.rare.includes(x)) {
                h.rare.push(x);
                found.push({ type: a.type, kind: 'rare', i: x, a });
            }
    }
    if (!found.length) return found;
    // les récompenses : des pièces par robe, un ruban par espèce complète
    let coins = 0;
    for (const f of found) coins += Math.round((ANIMALS[f.type].cost * ROBEBOOK.coin) / 10) * 10;
    earn(coins, null);
    addXp((ROBEBOOK.xp + scaleLvl()) * found.length);
    const complete = [...new Set(found.map(f => f.type))].filter(t => !h.done[t] && robeCount(t) >= robeTotal());
    complete.forEach(t => {
        h.done[t] = now();
        state.prestige.rubans += ROBEBOOK.rubans;
        addPhoto('animal', t, `${ANIMALS[t].name} : toutes les robes`, 'Carnet des robes');
    });
    if (view.started) {
        const f = found[0];
        toast(
            found.length > 1
                ? `Carnet des robes : ${found.length} nouvelles robes (+${coins} pièces)`
                : `Carnet des robes : ${ANIMALS[f.type].name.toLowerCase()} ${robeName(f.kind, f.i)} (+${coins} pièces)`,
            ['ui', 'cpCarnet'],
        );
        if (complete.length) {
            toast(`Toutes les robes de l’espèce ${ANIMALS[complete[0]].name.toLowerCase()} : un ruban !`, ['ui', 'ribbon']);
            sfx('level');
        }
        tip('robebook');
    }
    changed('animals');
    return found;
}
const COL = ['', 'rouge', 'dorée', 'violette', 'blanche', 'sombre', 'bleutée', 'rose', 'orange vif', 'argentée', 'cuivrée', 'dégradée'];
const PAT = ['', 'à taches', 'à pois', 'à rayures', 'à reflets', 'en damier', 'zébrée', 'mouchetée fin', 'marbrée'];
const FIN = ['', 'givrée', 'moussue', 'étincelante', 'vernie', 'fleurie'];
export const robeName = (kind, i) => (kind === 'c' ? COL[i] : kind === 'p' ? PAT[i] : i === 'halo' ? 'auréolée' : FIN[+String(i).slice(1)]);

// ---------------- les associations au pré ----------------
// une table des multiplicateurs, recalculée au plus une fois par seconde : { pré: { espèce: [mult, [ids]] } }
let cache = { t: -1, map: {} };
function assocMap() {
    const t = Math.floor(now() / 1000);
    if (cache.t === t) return cache.map;
    const types = {};
    for (const a of state.animals) {
        if (a.box || a.adult === false) continue;
        const k = a.p || 0;
        (types[k] ||= new Set()).add(a.type);
    }
    const map = {};
    for (const k in types)
        for (const P of PAIRS)
            if (types[k].has(P.a) && types[k].has(P.b)) {
                const m = ((map[k] ||= {})[P.on] ||= [1, []]);
                m[0] *= 1 + P.f;
                m[1].push(P.id);
            }
    cache = { t, map };
    return map;
}
// le multiplicateur de vitesse d'une bête selon ses voisines de pré
export function assocMult(a) {
    if (!a || a.box || !assocOpen()) return 1;
    const m = assocMap()[a.p || 0];
    return m && m[a.type] ? m[a.type][0] : 1;
}
// les associations actives dans un pré
export function pastureAssocs(k) {
    if (!assocOpen()) return [];
    const m = assocMap()[k] || {};
    return PAIRS.filter(P => Object.values(m).some(([, ids]) => ids.includes(P.id)));
}
// une association vue pour la première fois : elle entre au carnet
export function scanAssocs() {
    if (!assocOpen()) return [];
    const h = ensureHerdbook();
    const map = assocMap();
    const fresh = [];
    for (const k in map)
        for (const [, ids] of Object.values(map[k]))
            for (const id of ids)
                if (!h.pairs[id]) {
                    h.pairs[id] = now();
                    fresh.push(PAIRS.find(P => P.id === id));
                }
    if (fresh.length && view.started) {
        const P = fresh[0];
        toast(`Carnet de l’élevage : « ${P.name} » (${P.f > 0 ? '+' : '−'}${Math.round(Math.abs(P.f) * 100)} %)`, ['ui', 'cpCarnet']);
        tip('assoc');
        changed('animals');
    }
    return fresh;
}

export function herdbookTick() {
    if (!robebookOpen()) return false;
    const a = scanRobes().length;
    const b = scanAssocs().length;
    return !!(a || b);
}
