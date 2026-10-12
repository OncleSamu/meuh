// La vie du champ : décorations, miel, corbeau, œufs de Pâques et chien.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { view, farmShown } from '../core/view.js';
import { emit, toast, sfx, buzz, burst, float, fly } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { COLS, DECOS, DOG, HONEY_MAX, HONEY_BASE, CROW_TIME, LIGHTNING_CHANCE } from '../data/farm.js';
import { endIncident } from './incidents.js';
import { earn, addXp, spend, speedMult } from './player.js';
import { eventActive, eventProgress } from './events.js';
import { collect } from './book.js';
import { selectTool } from './game.js';
import { formatDuration, pickRand } from '../core/format.js';
import { barnBlocked } from './barn.js';
import { butterflyGolden } from './surprises.js';

// ---------------- le corbeau ----------------
// Le corbeau est un imprévu (voir incidents) : ici, seulement son compte à rebours.
export function crowTick() {
    if (!state.crow) return false;
    // en pause hors du champ ou quand une fenêtre est ouverte
    if (!farmShown() || view.hidden || view.modal) {
        state.crow.until += 1000;
        return false;
    }
    if (now() >= state.crow.until) {
        crowEats();
        return true;
    }
    return false;
}

export function shooCrow(i, at) {
    state.crow = null;
    if (state.incident && state.incident.type === 'crow') endIncident(true);
    state.stats.crows++;
    sfx('caw');
    buzz(15);
    emit('crowAway', { i, plant: false });
    earn(5 + state.level * 4, at);
    addXp(10 + state.level * 2, at);
    float(at, ['Ouste !'], '', -40);
}

export function crowEats() {
    const i = state.crow.plot,
        p = state.grid[i];
    state.crow = null;
    if (state.incident && state.incident.type === 'crow') endIncident(true);
    if (p && p.itemId && !p.isReady && ITEMS[p.itemId].type === 'crop') {
        const name = ITEMS[p.itemId].name.toLowerCase();
        p.itemId = null;
        p.isWatered = false;
        p.growProgress = 0;
        toast(`Le corbeau a mangé votre ${name}. Un épouvantail aiderait !`, ['ui', 'crow']);
        sfx('error');
    }
    emit('crowAway', { i, plant: true });
}

// ---------------- les œufs de Pâques (fête du printemps) ----------------
export function eggTick() {
    const t = now();
    if (state.egg) {
        if (!farmShown()) {
            state.egg.until += 1000;
            return false;
        }
        if (t >= state.egg.until) {
            state.egg = null;
            return true;
        }
        return false;
    }
    if (!eventActive('printemps') || !farmShown() || view.hidden) return false;
    const g = state.event.goals.find(x => x.type === 'find');
    if (!g || g.prog >= g.target || Math.random() > 1 / 14) return false;
    const cands = state.grid.map((p, i) => [p, i]).filter(([p, i]) => p.isUnlocked && !p.deco && !(state.crow && state.crow.plot === i));
    if (!cands.length) return false;
    state.egg = { plot: cands[Math.floor(Math.random() * cands.length)][1], until: t + 12000 };
    sfx('pop');
    return true;
}

export const eggAt = i => !!(state.egg && state.egg.plot === i);

export function collectEgg(i, at) {
    state.egg = null;
    collect('t_paintedEgg');
    sfx('golden');
    buzz(15);
    burst(at, 'sparkle', 12, -10);
    float(at, ['+1', ['item', 'paintedEgg']], '', -30);
    eventProgress('find', null, 1);
}

// ---------------- voisinage et décorations ----------------
export function neighbors(i) {
    if (i >= 1000 || i < 0) return [];
    const r = Math.floor(i / COLS),
        c = i % COLS,
        out = [];
    for (let dr = -1; dr <= 1; dr++)
        for (let dc = -1; dc <= 1; dc++) {
            if (!dr && !dc) continue;
            const rr = r + dr,
                cc = c + dc;
            if (rr < 0 || cc < 0 || cc >= COLS) continue;
            const j = rr * COLS + cc;
            if (j < state.grid.length) out.push(j);
        }
    return out;
}

export const nearDeco = (i, id) => neighbors(i).some(j => state.grid[j].isUnlocked && state.grid[j].deco === id);
export const decoGrowth = i => (nearDeco(i, 'hive') ? 1.15 : 1) * (nearDeco(i, 'flowerArch') ? 1.1 : 1);
export const decoTool = t => (typeof t === 'string' && t.startsWith('deco:') ? t.slice(5) : null);
// une parcelle sous l'influence d'une décoration voisine
export const hasAura = i => state.grid[i].isUnlocked && !state.grid[i].deco && neighbors(i).some(j => state.grid[j].deco);
export const decoCount = id => state.grid.filter(p => p.deco === id).length + (state.decorInv[id] || 0);

export function placeDeco(i, id, at) {
    const p = state.grid[i];
    if (!state.decorInv[id]) return;
    state.decorInv[id]--;
    p.deco = id;
    p.honey = 0;
    sfx('buy');
    buzz(15);
    burst(at, 'sparkle', 12);
    toast(`${DECOS[id].name} installé : ${DECOS[id].desc.toLowerCase()}`, ['ui', id]);
    if (!state.decorInv[id] && state.selectedTool === 'deco:' + id) selectTool('hand');
}

export function pickDeco(i, at) {
    const p = state.grid[i],
        id = p.deco;
    state.decorInv[id] = (state.decorInv[id] || 0) + 1;
    p.deco = null;
    sfx('plow');
    buzz(10);
    burst(at, 'dirt', 8);
    toast(`${DECOS[id].name} rangé dans la barre d’outils`, ['ui', id]);
}

export function wellTick() {
    let changed = false;
    state.grid.forEach((p, i) => {
        if (p.deco !== 'well' || !p.isUnlocked) return;
        neighbors(i).forEach(j => {
            const q = state.grid[j];
            if (q.isUnlocked && q.itemId && !q.isReady && !q.isWatered) {
                q.isWatered = true;
                changed = true;
            }
        });
    });
    return changed;
}

// ---------------- le chien ----------------
export function dogFinds() {
    const r = Math.random(),
        L = state.level;
    if (r < 0.38) return { kind: 'coins', n: 30 + L * 15 };
    if (r < 0.58 && L >= 4) return { kind: 'fertilizer', n: 2 + Math.floor(Math.random() * 2) };
    if (r < 0.76) return { kind: 'feed', n: 5 + Math.floor(Math.random() * 6) };
    if (r < 0.95) {
        const crops = Object.values(ITEMS).filter(i => i.type === 'crop' && L >= i.reqLvl);
        const c = crops[Math.floor(Math.random() * crops.length)];
        return { kind: 'seed', id: c.id, n: 3 + Math.floor(Math.random() * 4) };
    }
    return { kind: 'treasure', n: (30 + L * 15) * 10 };
}

// l'icône d'une trouvaille, [sorte, id]
export const findIcon = f =>
    f.kind === 'coins'
        ? ['ui', 'coin']
        : f.kind === 'treasure'
          ? ['ui', 'chest']
          : f.kind === 'seed'
            ? ['seed', f.id]
            : ['item', f.kind === 'feed' ? 'feed' : 'fertilizer'];

export function scheduleFind() {
    state.dog.nextFind = now() + (DOG.findMin + Math.random() * (DOG.findMax - DOG.findMin)) * 1000;
}

// le chien court vers le corbeau puis le chasse
let chase = null;
export const dogChasing = () => chase;

export function handleDog(at) {
    const d = state.dog;
    if (d.found) {
        const f = d.found;
        if (f.kind === 'coins' || f.kind === 'treasure') earn(f.n, at);
        else if (f.kind === 'feed') state.inventory.feed += f.n;
        else if (f.kind === 'fertilizer') state.inventory.fertilizer += f.n;
        else if (f.kind === 'seed') state.seeds[f.id] += f.n;
        if (f.kind !== 'coins' && f.kind !== 'treasure') float(at, [`+${f.n}`, findIcon(f)], '', -30);
        if (f.kind === 'treasure') {
            collect('t_dogTreasure');
            toast(`${d.name} a déterré un trésor !`, ['ui', 'chest']);
            sfx('golden');
            burst(at, 'sparkle', 18);
        } else sfx('harvest');
        state.stats.dogFinds++;
        d.found = null;
        scheduleFind();
        buzz(12);
        return 'found';
    }
    sfx('bark');
    buzz(8);
    emit('dogPet', at);
    if (d.petDay !== state.day) {
        d.petDay = state.day;
        addXp(10 + state.level * 3, at);
    }
    return 'pet';
}

export function dogTick() {
    const d = state.dog;
    if (!d.owned) return false;
    let changed = false;
    if (!d.found && now() >= d.nextFind) {
        d.found = dogFinds();
        changed = true;
        if (farmShown() && !view.hidden) {
            sfx('bark');
            toast(`${d.name} a trouvé quelque chose : touchez-le !`, ['ui', 'dog']);
        }
    }
    if (chase && now() >= chase.until) {
        const i = chase.plot;
        chase = null;
        if (state.crow && state.crow.plot === i) {
            state.crow = null;
            state.stats.crows++;
            sfx('bark');
            sfx('caw');
            emit('crowAway', { i, plant: false });
            emit('plotFloat', { i, parts: [`Wouf ! ${d.name} veille`], dy: -30 });
            changed = true;
        }
    } else if (!chase && state.crow && farmShown() && now() - (state.crow.until - CROW_TIME) > DOG.chaseDelay) {
        chase = { plot: state.crow.plot, until: now() + 1600 };
        emit('dogChase', chase.plot);
    }
    return changed;
}

export function buyDog(at) {
    if (state.dog.owned || state.level < DOG.reqLvl || state.money < DOG.cost) return false;
    spend(DOG.cost);
    state.dog.owned = true;
    scheduleFind();
    sfx('bark');
    buzz(20);
    burst(at, 'sparkle', 14);
    toast(`${state.dog.name} rejoint la ferme ! Retrouvez-le dans le champ`, ['ui', 'dog']);
    return true;
}

export function renameDog(name) {
    const n = (name || '').trim().slice(0, 16);
    if (!n) return false;
    state.dog.name = n;
    return true;
}

// ---------------- la ruche ----------------
export function flowerScore(i) {
    return neighbors(i).reduce((a, j) => {
        const q = state.grid[j];
        if (!q.isUnlocked) return a;
        if (q.deco === 'flowers') return a + 3;
        if (q.itemId) return a + (ITEMS[q.itemId].type === 'tree' ? 2 : 1);
        return a;
    }, 0);
}

export const honeyRate = i => {
    const sc = flowerScore(i);
    return sc ? (0.5 + sc * 0.25) / HONEY_BASE : 0;
};

export function honeyTick(dt) {
    let changed = false;
    state.grid.forEach((p, i) => {
        if (p.deco !== 'hive' || !p.isUnlocked) return;
        const before = Math.floor(p.honey || 0);
        p.honey = Math.min(HONEY_MAX, (p.honey || 0) + honeyRate(i) * dt * speedMult());
        if (Math.floor(p.honey) !== before) changed = true;
    });
    return changed;
}

export function handleHive(i, at) {
    const p = state.grid[i];
    const jars = Math.floor(p.honey || 0);
    if (jars < 1) {
        const r = honeyRate(i);
        if (!r) toast('Les abeilles ont besoin de fleurs : plantez des cultures ou un parterre autour de la ruche', ['ui', 'hive']);
        else float(at, [['item', 'honey'], formatDuration((1 - (p.honey || 0)) / (r * speedMult()))], '', -24);
        sfx('click');
        return false;
    }
    if (barnBlocked()) return false;
    p.honey -= jars;
    state.inventory.honey += jars;
    state.stats.honey += jars;
    eventProgress('harvest', 'honey', jars);
    sfx('harvest');
    buzz(12);
    burst(at, 'sparkle', 8, -10);
    float(at, [`+${jars}`, ['item', 'honey']], '', -24);
    fly(at, 'honey', jars);
    addXp(jars * 15, at);
    return true;
}

// ---------------- la foudre et l'arc-en-ciel ----------------
export const hasRod = () => state.grid.some(p => p.isUnlocked && p.deco === 'lightningRod');
let rodToastDay = 0;

export function stormTick() {
    if (state.weather !== 'storm' || view.hidden || Math.random() >= LIGHTNING_CHANCE) return false;
    const spots = state.grid.map((p, i) => [p, i]).filter(([p]) => p.isUnlocked && p.itemId && ITEMS[p.itemId].type === 'crop');
    if (!spots.length) return false;
    emit('lightning');
    if (hasRod()) {
        state.stats.rodSaves = (state.stats.rodSaves || 0) + 1;
        if (state.day !== rodToastDay) toast('Le paratonnerre a détourné la foudre : vos cultures sont sauves', ['ui', 'lightningRod']);
        rodToastDay = state.day;
        return false;
    }
    const [p, i] = pickRand(spots);
    const name = ITEMS[p.itemId].name.toLowerCase();
    p.itemId = null;
    p.isReady = false;
    p.isWatered = false;
    p.growProgress = 0;
    p.fert = false;
    state.stats.struck = (state.stats.struck || 0) + 1;
    emit('struck', i);
    toast(`La foudre a brûlé une parcelle de ${name}. Un paratonnerre protège tout le champ.`, ['ui', 'w_storm']);
    return true;
}

// arc-en-ciel : plus de récoltes dorées et de qualité or
export const rainbowGolden = () => (state.weather === 'rainbow' ? 3 : 1) * butterflyGolden();
export const rainbowGold = () => (state.weather === 'rainbow' ? 2 : 1);
