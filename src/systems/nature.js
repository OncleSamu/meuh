// La nature : forêt, mine et pêche à l'étang.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { fmt } from '../core/format.js';
import { emit, toast, sfx, buzz, burst, float, fly } from '../core/bus.js';
import { NATURE, TOOL_MAX } from '../data/nature.js';
import { FISH } from '../data/meta.js';
import { spend, addXp, speedMult, rank } from './player.js';
import { collect } from './book.js';
import { season, isNight } from './world.js';
import { barnBlocked } from './barn.js';

export function ensureNature() {
    ['forest', 'mine'].forEach(k => {
        if (!Array.isArray(state[k])) state[k] = [];
        while (state[k].length < NATURE[k].slots) state[k].push({ hp: NATURE[k].hp, until: 0, gem: false });
    });
    state.tools = { axe: 0, pick: 0, ...(state.tools || {}) };
}

// ---------------- outils et ressources de tailles différentes ----------------
export const toolKey = kind => (kind === 'forest' ? 'axe' : 'pick');
export const toolLvl = kind => state.tools[toolKey(kind)] || 0;
// coups nécessaires : un gros arbre ou un filon demandent plus d'efforts, un bon outil moins
export const slotHp = (kind, sl) => Math.max(1, NATURE[kind].hp + (sl.big ? 2 : 0) - toolLvl(kind));
export const toolCost = kind => ({ tools: toolLvl(kind) + 1, coins: 400 * Math.pow(toolLvl(kind) + 1, 2) });
export const slotUp = sl => !sl.until || now() >= sl.until;
export const natureOpen = kind => state.level >= NATURE[kind].lvl;

export function upgradeTool(kind, at) {
    const lvl = toolLvl(kind),
        c = toolCost(kind);
    if (lvl >= TOOL_MAX) return false;
    if (state.inventory.tools < c.tools || state.money < c.coins) {
        toast(`Il faut ${c.tools} outil${c.tools > 1 ? 's' : ''} (forge) et ${fmt(c.coins)} pièces`, ['item', 'tools']);
        sfx('error');
        return false;
    }
    state.inventory.tools -= c.tools;
    spend(c.coins);
    state.tools[toolKey(kind)]++;
    sfx('level');
    buzz(20);
    burst(at, 'sparkle', 12);
    toast(`${kind === 'forest' ? 'Hache' : 'Pioche'} améliorée : niveau ${toolLvl(kind) + 1}`, ['ui', kind === 'forest' ? 'axe' : 'pickaxe']);
    return true;
}

// Un coup de hache ou de pioche ; renvoie 'down' (repousse), 'hit' ou 'done'
export function hitSlot(kind, k, at) {
    const sl = state[kind][k],
        N = NATURE[kind];
    if (state.level < N.lvl) return false;
    if (!slotUp(sl)) {
        float(at, [kind === 'forest' ? 'Ça repousse…' : 'Plus rien ici…'], '', -20);
        sfx('click');
        return 'down';
    }
    const max = slotHp(kind, sl);
    if (sl.hp > max) sl.hp = max;
    sl.hp--;
    emit('swing', { at, tool: kind === 'forest' ? 'axe' : 'pickaxe' });
    burst(at, kind === 'forest' ? 'chips' : 'pebbles', 6);
    sfx(kind === 'forest' ? 'chop' : 'rock');
    buzz(10);
    if (sl.hp > 0) return 'hit';
    // ressource obtenue
    const qty = 2 + Math.floor(Math.random() * 2) + (sl.big ? 3 : 0) + toolLvl(kind) + (Math.random() < state.upgrades.yield * 0.1 ? 2 : 0);
    const mat = kind === 'forest' ? 'wood' : 'stone';
    state.inventory[mat] += qty;
    state.stats[kind === 'forest' ? 'chopped' : 'mined']++;
    float(at, [`+${qty}`, ['item', mat]], '', -30);
    addXp(kind === 'forest' ? 4 : 6, at);
    if (kind === 'forest') {
        if (Math.random() < 0.05) {
            state.seeds.apple++;
            toast('Une jeune pousse de pommier était cachée sous l’arbre !', ['seed', 'apple']);
        }
    } else {
        const r = Math.random(),
            boost = sl.gem ? 1 : 0;
        let gem = null;
        if (boost || r < (sl.big ? 0.4 : 0.11)) gem = ['fossil', 'amethyst', 'nugget'][Math.floor(Math.random() * 3)];
        if (gem) {
            state.inventory[gem]++;
            collect('t_' + gem);
            emit('float', { at, parts: ['+1', ['item', gem]], cls: 'gold', dy: -56, delay: 250 });
            sfx('golden');
            burst(at, 'sparkle', 12);
        }
    }
    sl.until = now() + ((sl.big ? 1.6 : 1) * N.regrow * 1000) / speedMult();
    sl.big = Math.random() < 0.25;
    sl.gem = kind === 'mine' && Math.random() < 0.2;
    sl.hp = slotHp(kind, sl);
    return 'done';
}

// ---------------- la pêche ----------------
export function fishNow(f) {
    const w = f.when;
    if (!w) return true;
    if (w.seasons) return w.seasons.includes(season().id);
    if (w.night) return isNight();
    if (w.weather) return w.weather.includes(state.weather);
    return true;
}
export const fishAvailable = () => Object.keys(FISH).filter(id => !FISH[id].junk && fishNow(FISH[id]));

export function pickFish() {
    const pool = Object.entries(FISH).filter(([, f]) => fishNow(f));
    let r = Math.random() * pool.reduce((a, [, f]) => a + f.odds, 0);
    for (const [id, f] of pool) {
        r -= f.odds;
        if (r <= 0) return id;
    }
    return 'roach';
}

// la partie de pêche en cours (jamais sauvegardée) : idle → wait → bite → reel
export const fishing = { phase: 'idle' };
const BITE_WINDOW = 1250;

// met la phase à jour selon l'heure : le poisson mord, puis se sauve si l'on tarde
export function fishPhase() {
    const f = fishing,
        t = now();
    if (f.phase === 'wait' && t >= f.biteAt) {
        f.phase = 'bite';
        f.id = pickFish();
        sfx('pop');
        buzz(25);
    }
    if (f.phase === 'bite' && t >= f.biteAt + BITE_WINDOW) {
        f.phase = 'idle';
        toast('Trop tard, il s’est sauvé !', ['ui', 'rod']);
        sfx('error');
    }
    return f.phase;
}

// position du curseur de moulinet, de 0 à 1
export const reelPos = (t = now()) => (Math.sin(((t - fishing.t0) / 1000) * fishing.speed * 2.6 - Math.PI / 2) + 1) / 2;

export function fishAction(at) {
    const f = fishing;
    if (state.level < NATURE.pond.lvl) return;
    const phase = fishPhase();
    if (phase === 'idle') {
        if (barnBlocked()) return;
        f.phase = 'wait';
        f.biteAt = now() + 1800 + Math.random() * 4200;
        sfx('splash');
        buzz(6);
    } else if (phase === 'wait') {
        f.phase = 'idle';
        toast('Rien n’a mordu. Attendez le « ! » avant de ferrer.', ['ui', 'rod']);
        sfx('click');
    } else if (phase === 'bite') startReel();
    else if (phase === 'reel') stopReel(at);
}

function startReel() {
    const f = fishing,
        F = FISH[f.id];
    f.phase = 'reel';
    f.width = Math.min(0.5, F.zone * (1 + rank('expert') * 0.1));
    f.center = f.width / 2 + Math.random() * (1 - f.width);
    f.t0 = now();
    f.speed = F.speed;
    sfx('reel');
}

function stopReel(at) {
    const f = fishing,
        F = FISH[f.id];
    const ok = Math.abs(reelPos() - f.center) <= f.width / 2;
    f.phase = 'idle';
    if (!ok) {
        toast(F.junk ? 'La botte est retombée à l’eau. Pas grave !' : `Le ${F.name.toLowerCase()} s’est échappé…`, ['item', f.id]);
        sfx('error');
        burst(at, 'water', 8);
        return false;
    }
    const [a, b] = F.w,
        w = Math.round((a + (b - a) * Math.pow(Math.random(), 1.8)) * 100) / 100;
    state.inventory[f.id]++;
    state.stats.fish++;
    collect('f_' + f.id, w);
    sfx(f.id === 'goldfish' ? 'golden' : 'harvest');
    buzz(20);
    burst(at, 'water', 12);
    burst(at, 'sparkle', f.id === 'goldfish' ? 20 : 6, -10);
    float(at, ['+1', ['item', f.id], F.junk ? '' : ' ' + w.toString().replace('.', ',') + ' kg'], f.id === 'goldfish' ? 'gold' : '', -30);
    fly(at, f.id, 1);
    addXp(F.junk ? 2 : 8 + Math.round(F.sell / 12), at);
    if (f.id === 'goldfish') {
        toast('Un poisson doré ! Une prise de légende', ['item', 'goldfish']);
        emit('confetti');
    }
    return true;
}
