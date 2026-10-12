// Le village : amitié des villageois, cadeaux et présence au village.
import { state } from '../core/state.js';
import { fmt } from '../core/format.js';
import { emit, toast, sfx, buzz, burst, float } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { RECIPES } from '../data/machines.js';
import { VILLAGERS, HEART_POINTS, STORIES } from '../data/village.js';
import { earn } from './player.js';
import { tip } from './tips.js';
import { addPhoto } from './style.js';

export function ensureVillagers() {
    Object.keys(VILLAGERS).forEach(id => {
        state.villagers[id] = { pts: 0, hearts: 0, giftDay: 0, ...(state.villagers[id] || {}) };
    });
}

export const heartsOf = id => (state.villagers[id] && state.villagers[id].hearts) || 0;

export function heartReward(vid, h) {
    const v = VILLAGERS[vid];
    const recipe = Object.values(RECIPES).find(r => r.teacher === vid && r.hearts === h);
    const crop = v.likes.find(id => ITEMS[id].type === 'crop') || 'wheat';
    if (h === 1) return { coins: 200, seeds: [crop, 5], recipe: recipe && recipe.id };
    if (h === 2) return recipe ? { coins: 300, recipe: recipe.id } : { coins: 600, feed: 10 };
    if (h === 3) return { coins: 1200, feed: 20 };
    if (h === 4) return recipe ? { coins: 800, recipe: recipe.id } : { coins: 2500 };
    return { coins: 5000, best: true };
}

// les récompenses en lignes [icône, texte]
export function rewardLines(r) {
    const lines = [];
    if (r.recipe) lines.push([['item', r.recipe], `Recette apprise : ${ITEMS[r.recipe].name.toLowerCase()}`]);
    if (r.coins) lines.push([['ui', 'coin'], `${fmt(r.coins)} pièces`]);
    if (r.seeds) lines.push([['seed', r.seeds[0]], `${r.seeds[1]} ${ITEMS[r.seeds[0]].seedName.toLowerCase()}`]);
    if (r.feed) lines.push([['item', 'feed'], `${r.feed} sacs de nourriture`]);
    if (r.best) lines.push([['ui', 'heart'], 'Meilleurs amis : ses commandes rapportent 25 % de plus']);
    return lines;
}

export function nextRewardText(vid) {
    const h = heartsOf(vid);
    if (h >= 5) return 'Meilleurs amis pour la vie.';
    const r = heartReward(vid, h + 1);
    return (
        `Au cœur ${h + 1} : ` +
        rewardLines(r)
            .map(l => l[1].toLowerCase())
            .join(', ') +
        '.'
    );
}

// avancée vers le cœur suivant, de 0 à 1
export function heartProgress(vid) {
    const v = state.villagers[vid],
        h = v.hearts;
    if (h >= 5) return 1;
    const prev = h ? HEART_POINTS[h - 1] : 0,
        next = HEART_POINTS[Math.min(h, 4)];
    return Math.min(1, (v.pts - prev) / (next - prev));
}

export function addFriendship(vid, pts, at) {
    const v = state.villagers[vid];
    if (!v) return;
    v.pts += pts;
    if (at) float(at, [`+${pts}`, ['ui', 'heart']], '', -40);
    while (v.hearts < 5 && v.pts >= HEART_POINTS[v.hearts]) {
        v.hearts++;
        state.stats.hearts++;
        const r = heartReward(vid, v.hearts);
        if (r.coins) earn(r.coins, null);
        if (r.seeds) state.seeds[r.seeds[0]] += r.seeds[1];
        if (r.feed) state.inventory.feed += r.feed;
        emit('friend', { vid, h: v.hearts, r });
        if (v.hearts === 5 && STORIES[vid]) tip('story');
        if (v.hearts === 5) addPhoto('villager', vid, `${VILLAGERS[vid].name}, amis pour la vie`, 'Cinq cœurs');
    }
}

export const giftable = vid => VILLAGERS[vid].likes.filter(id => state.inventory[id] > 0);
export const giftedToday = vid => state.villagers[vid].giftDay === state.day;

export function giveGift(vid, id, at) {
    const v = state.villagers[vid];
    if (!v || v.giftDay === state.day || state.inventory[id] <= 0) return false;
    state.inventory[id]--;
    v.giftDay = state.day;
    const pts = ITEMS[id].type === 'artisan' ? 3 : 1;
    sfx('buy');
    buzz(15);
    burst(at, 'sparkle', 10);
    addFriendship(vid, pts, at);
    toast(`${VILLAGERS[vid].name} adore ce cadeau !`, ['ui', 'heart']);
    return true;
}
