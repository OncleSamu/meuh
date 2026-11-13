// Le village : amitié des villageois, cadeaux et présence au village.
import { state, skill } from '../core/state.js';
import { fmt } from '../core/format.js';
import { emit, toast, sfx, buzz, burst, float } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { RECIPES } from '../data/machines.js';
import { VILLAGERS, HEART_POINTS, STORIES } from '../data/village.js';
import { earn } from './player.js';
import { tip } from './tips.js';
import { addPhoto } from './style.js';
import { LOVES, GIFT_PTS, MEH_LINES, WARM_LINE } from '../data/friends.js';
import { giftLove } from './family.js';
import { isBirthday, loveMachine, partnerOf, talentText } from './friends.js';

export function ensureVillagers() {
    Object.keys(VILLAGERS).forEach(id => {
        state.villagers[id] = { pts: 0, hearts: 0, giftDay: 0, ...(state.villagers[id] || {}) };
    });
}

export const heartsOf = id => (state.villagers[id] && state.villagers[id].hearts) || 0;

// 1.59 : la recette qu'apprend chaque villageois à chaque cœur, rangée une fois
let TEACH = null;
const teacherRecipe = (vid, h) => {
    if (!TEACH) {
        TEACH = new Map();
        for (const r of Object.values(RECIPES)) if (r.teacher && !TEACH.has(r.teacher + ':' + r.hearts)) TEACH.set(r.teacher + ':' + r.hearts, r);
    }
    return TEACH.get(vid + ':' + h);
};
export function heartReward(vid, h) {
    const v = VILLAGERS[vid];
    const recipe = teacherRecipe(vid, h);
    const crop = v.likes.find(id => ITEMS[id].type === 'crop') || 'wheat';
    if (h === 1) return { coins: 200, seeds: [crop, 5], recipe: recipe && recipe.id };
    if (h === 2) return recipe ? { coins: 300, recipe: recipe.id } : { coins: 600, feed: 10 };
    if (h === 3) return { coins: 1200, feed: 20 };
    if (h === 4) return recipe ? { coins: 800, recipe: recipe.id } : { coins: 2500 };
    return { coins: 5000, best: true, talent: vid };
}

// les récompenses en lignes [icône, texte]
export function rewardLines(r) {
    const lines = [];
    if (r.recipe) lines.push([['item', r.recipe], `Recette apprise : ${ITEMS[r.recipe].name.toLowerCase()}`]);
    if (r.coins) lines.push([['ui', 'coin'], `${fmt(r.coins)} pièces`]);
    if (r.seeds) lines.push([['seed', r.seeds[0]], `${r.seeds[1]} ${ITEMS[r.seeds[0]].seedName.toLowerCase()}`]);
    if (r.feed) lines.push([['item', 'feed'], `${r.feed} sacs de nourriture`]);
    if (r.best) lines.push([['ui', 'heart'], 'Meilleurs amis : ses commandes rapportent 25 % de plus']);
    // 1.70 : le talent de l'ami
    if (r.talent) lines.push([['ui', 'star'], `Son talent : ${talentText(r.talent).toLowerCase()}`]);
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
    // 1.61 : « Bon voisin » : l'amitié monte plus vite
    pts = Math.round(pts * (1 + 0.15 * skill('friendly')));
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
        if (v.hearts === 5) tip('talent');
        if (v.hearts === 5) addPhoto('villager', vid, `${VILLAGERS[vid].name}, amis pour la vie`, 'Cinq cœurs');
    }
}

// 1.70 : ce qu'il aime (et son produit adoré, même hors de la liste) qu'on a en stock
export const giftable = vid => [...new Set([LOVES[vid], ...VILLAGERS[vid].likes])].filter(id => id && state.inventory[id] > 0);
// ce que vaut un cadeau : 'love' (adoré), 'like' (aimé) ou 'meh' (bof)
export const giftKind = (vid, id) => (id === LOVES[vid] ? 'love' : VILLAGERS[vid].likes.includes(id) ? 'like' : 'meh');
export const giftedToday = vid => state.villagers[vid].giftDay === state.day;

// 1.70 : un cadeau par jour : adoré +5, aimé +1 (brut) ou +3 (fabriqué), bof rien (avec une réplique) ;
// le jour de son anniversaire, tout compte triple ; son duo en profite (+1)
export function giveGift(vid, id, at) {
    const v = state.villagers[vid];
    if (!v || v.giftDay === state.day || !ITEMS[id] || !(state.inventory[id] > 0)) return false;
    state.inventory[id]--;
    v.giftDay = state.day;
    const kind = giftKind(vid, id);
    const bday = isBirthday(vid);
    let pts = kind === 'love' ? GIFT_PTS.love : kind === 'like' ? (ITEMS[id].type === 'artisan' ? GIFT_PTS.likeCraft : GIFT_PTS.likeRaw) : GIFT_PTS.meh;
    if (bday) pts *= GIFT_PTS.birthday;
    sfx(kind === 'meh' ? 'click' : 'buy');
    buzz(15);
    if (kind !== 'meh' && at) burst(at, 'sparkle', bday ? 18 : 10);
    if (pts) addFriendship(vid, pts, at);
    const name = VILLAGERS[vid].name;
    if (kind === 'love') {
        if (!v.love) {
            v.love = true;
            tip('loves');
        }
        toast(`${name} adore ça ! C’est son cadeau préféré`, ['ui', 'heart']);
        // un cadeau adoré le jour de son anniversaire : un merci
        if (bday) {
            const coins = Math.round((300 + state.level * state.level * 4) / 10) * 10;
            earn(coins, at);
            toast(`Joyeux anniversaire ! ${name} vous remercie : +${fmt(coins)} pièces`, ['ui', 'cake']);
        }
    } else if (kind === 'like') toast(bday ? `${name} : un cadeau d’anniversaire, merci !` : `${name} aime ce cadeau !`, ['ui', bday ? 'cake' : 'heart']);
    else {
        v.tried = [...new Set([...(v.tried || []), id])].slice(-40);
        const warm = v.hearts >= 2 && RECIPES[id] && RECIPES[id].machine === loveMachine(vid);
        toast(`${name} : « ${warm ? WARM_LINE : MEH_LINES[Math.floor(Math.random() * MEH_LINES.length)]} »`, ['villager', vid]);
    }
    if (bday) tip('birthday');
    // 1.123 : un cadeau à qui l'on fait la cour compte aussi pour son cœur
    giftLove(vid, kind, at);
    // son duo est content aussi
    const p = partnerOf(vid);
    if (p && kind !== 'meh' && state.villagers[p]) addFriendship(p, 1, null);
    return true;
}
