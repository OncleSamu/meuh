// 1.120 : le concours de bière de la saison. Une bière par saison, notée sur 20 ; trois brasseries voisines en face.
import { state, scaleLvl } from '../core/state.js';
import { view } from '../core/view.js';
import { toast, sfx, emit } from '../core/bus.js';
import { RIVALS } from '../data/village.js';
import { NOTES } from '../data/abbey.js';
import { BREWFEST } from '../data/brewfest.js';
import { seasonKey } from './surprises.js';
import { brewOpen, ensureBrew, beerOf, beerNote, beerStock, beerQual, beerPutQuality, myBeers } from './brewery.js';
import { earn, addXp } from './player.js';
import { addRenom } from './renom.js';
import { addPhoto } from './style.js';

export const fest = () => {
    const B = ensureBrew();
    B.fest = B.fest && typeof B.fest === 'object' ? B.fest : null;
    return B.fest;
};
export const festTheme = (k = seasonKey()) => BREWFEST.themes[((k % 4) + 4) % 4];
export const festNoteName = () => NOTES[festTheme().note];

// la note d'une bière pour le thème de la saison : { total, stars, theme, rank }
export function festScore(bid) {
    const b = beerOf(bid);
    if (!b) return null;
    const W = BREWFEST.w;
    const stars = (b.stars || 0) * W.star;
    const theme = beerNote(b) === festTheme().note ? W.theme : 0;
    const rank = beerPutQuality(bid, 1) * W.rank;
    return { total: stars + theme + rank, stars, theme, rank };
}
export const festCandidates = () =>
    myBeers()
        .filter(b => beerStock(b.id) >= BREWFEST.bottles)
        .map(b => ({ id: b.id, name: b.name, score: festScore(b.id) }))
        .sort((a, b) => b.score.total - a.score.total);

function award(F) {
    F.paid = true;
    if (!F.entry) return;
    const r = festRank(F);
    const m = 1 + scaleLvl() * 0.05;
    const coins = Math.round((BREWFEST.prize[r] * m) / 10) * 10;
    if (coins) earn(coins, null);
    if (BREWFEST.xp[r]) addXp(Math.round(BREWFEST.xp[r] * m), null);
    if (BREWFEST.renom[r]) addRenom(BREWFEST.renom[r], 'concours de bière');
    state.stats.festPlays = (state.stats.festPlays || 0) + 1;
    if (r === 1) {
        state.stats.festWins = (state.stats.festWins || 0) + 1;
        addPhoto('ui', 'beer', `${F.entry.name}, première au concours`, festTheme(F.k).name);
    }
    F.result = { r, coins };
    emit('festResult', { rank: r, coins });
    if (view.started)
        toast(
            r === 1 ? `Concours de bière : ${F.entry.name} gagne ! ${coins} pièces` : `Concours de bière : ${F.entry.name} finit ${r}e (${coins} pièces)`,
            ['ui', 'trophy'],
        );
}

// une nouvelle saison : on remet les prix de la précédente, puis un nouveau thème et de nouvelles rivales
export function festTick() {
    if (!brewOpen()) return false;
    const k = seasonKey();
    const F = fest();
    if (F && F.k === k) return false;
    if (F && !F.paid) award(F);
    const boost = Math.min(3, Math.max(0, (state.level - 30) * 0.06));
    const rivals = RIVALS.slice(0, 3).map((r, j) => ({
        name: `${r.owner} · ${r.name}`,
        score: Math.round(8 + j * 2.5 + boost + Math.random() * 2),
    }));
    // le dernier résultat reste lisible pendant la saison suivante
    const last = F && F.entry ? { name: F.entry.name, r: festRank(F), theme: festTheme(F.k).name } : F && F.last ? F.last : null;
    state.brew.fest = { k, rivals, entry: null, paid: false, last };
    return true;
}
export const festRank = F => (F && F.entry ? 1 + F.rivals.filter(r => r.score > F.entry.score).length : 0);

// inscrire une bière : le jury en goûte deux bouteilles. On peut changer d'avis (les bouteilles goûtées sont perdues).
export function enterFest(bid) {
    festTick();
    const F = fest();
    if (!F || F.paid) return false;
    const b = beerOf(bid);
    if (!b || beerStock(bid) < BREWFEST.bottles) return false;
    const B = state.brew;
    B.stock[bid] -= BREWFEST.bottles;
    beerQual(bid);
    const s = festScore(bid);
    F.entry = { id: bid, name: b.name, score: s.total };
    sfx('pop');
    toast(`${b.name} est inscrite au concours (note ${s.total}/20)`, ['ui', 'trophy']);
    return true;
}
