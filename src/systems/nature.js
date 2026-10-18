// La nature : forêt et mine (la pêche est dans fishing.js).
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { fmt } from '../core/format.js';
import { emit, toast, sfx, buzz, burst, float } from '../core/bus.js';
import { NATURE, TOOL_MAX } from '../data/nature.js';
import { spend, addXp, speedMult } from './player.js';
import { collect } from './book.js';

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
    toast(`${kind === 'forest' ? 'Hache' : 'Pioche'} améliorée : niveau ${toolLvl(kind) + 1}`, ['ui', kind === 'forest' ? 'axe' : 'pickaxe']);
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
            toast('Une jeune pousse de pommier était cachée sous l’arbre !', ['seed', 'apple']);
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
