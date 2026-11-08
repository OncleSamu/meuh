// Heum — le registre des dessins.
import { svg } from './kit.js';
import { ITEM_ART } from './items.js';
import { WORLD_ART } from './world.js';
import { V2_ART } from './v2.js';

const ALL = { ...ITEM_ART, ...WORLD_ART, ...V2_ART };
const cache = {};
export const has = id => !!ALL[id];
export function art(id) {
    if (!ALL[id]) return svg('');
    return (cache[id] = cache[id] || svg(ALL[id]()));
}
export const ART_IDS = Object.keys(ALL);
