// 1.70 : mieux connaître les villageois (goûts, anniversaires) et aller plus loin que 5 cœurs (talent, duos).
// Ce module ne lit que l'état et les données : market.js, workshop.js, cave.js, brewery.js, port.js et
// incidents.js l'importent pour le talent de l'ami, sans boucle d'imports.
import { state } from '../core/state.js';
import { VILLAGERS, STORIES } from '../data/village.js';
import { RECIPES } from '../data/machines.js';
import { LOVES, TALENT, TALENTS, DUOS, YEAR_DAYS, DUO_STORIES } from '../data/friends.js';
import { SEASONS, DAYS_PER_SEASON } from '../data/world.js';
import { FAMILY } from '../data/family.js';

export { LOVES, TALENTS, DUOS, DUO_STORIES };

const hearts = vid => (state.villagers && state.villagers[vid] && state.villagers[vid].hearts) || 0;
const storyDone = vid => !!(STORIES[vid] && state.stories && state.stories[vid] && state.stories[vid].step >= STORIES[vid].steps.length);

// ---------------- les anniversaires ----------------
const VIDS = Object.keys(VILLAGERS);
// le jour de l'année (1 à 48) : tous différents, bien répartis
export const birthdayOf = vid => ((VIDS.indexOf(vid) * 17) % YEAR_DAYS) + 1;
export const yearDay = (d = state.day) => ((d - 1) % YEAR_DAYS) + 1;
export const isBirthday = (vid, d = state.day) => birthdayOf(vid) === yearDay(d);
export const daysToBirthday = vid => (birthdayOf(vid) - yearDay() + YEAR_DAYS) % YEAR_DAYS;
// « 5 été »
export const birthdayText = vid => {
    const n = birthdayOf(vid) - 1;
    return `${(n % DAYS_PER_SEASON) + 1} ${SEASONS[Math.floor(n / DAYS_PER_SEASON)].name.toLowerCase()}`;
};
// les anniversaires des jours qui viennent, parmi les villageois présents
export const nextBirthdays = (ids, within = 6) =>
    ids
        .map(vid => [vid, daysToBirthday(vid)])
        .filter(([, d]) => d <= within)
        .sort((a, b) => a[1] - b[1]);

// ---------------- les goûts ----------------
export const loveOf = vid => LOVES[vid];
export const loveFound = vid => !!(state.villagers[vid] && state.villagers[vid].love);
// à partir de 2 cœurs, on devine d'où vient le produit adoré (sa machine)
export const loveMachine = vid => (RECIPES[LOVES[vid]] ? RECIPES[LOVES[vid]].machine : null);
// les cadeaux « bof » déjà essayés (pour ne pas les refaire)
export const triedOf = vid => (state.villagers[vid] && state.villagers[vid].tried) || [];

// ---------------- le talent de l'ami ----------------
// 0 : pas encore (moins de 5 cœurs) ; 1 : talent ; 2 : talent doublé (son histoire est finie)
// 1.123 : le conjoint heureux a son talent d'un cran au-dessus (même avant 5 cœurs)
const wedBonus = vid => (state.family && state.family.spouse === vid && (state.family.aff ?? 100) >= FAMILY.aff.keep ? 1 : 0);
export const talentLevel = vid => (hearts(vid) >= 5 ? (storyDone(vid) ? 2 : 1) : 0) + wedBonus(vid);
// les machines et leurs amis (rangé une fois)
let BYM = null;
const byMachine = () => {
    if (!BYM) {
        BYM = {};
        for (const [vid, t] of Object.entries(TALENTS)) for (const m of t.m || []) (BYM[m] = BYM[m] || []).push(vid);
    }
    return BYM;
};
const machineLvl = m => (byMachine()[m] || []).reduce((a, vid) => a + talentLevel(vid), 0);
// une machine va plus vite : diviseur du temps
export const talentSpeed = m => 1 + TALENT.speed * machineLvl(m);
// un produit fabriqué se vend plus cher
export const talentPrice = id => (RECIPES[id] ? 1 + TALENT.price * machineLvl(RECIPES[id].machine) : 1);
const fxLvl = fx => Object.entries(TALENTS).reduce((a, [vid, t]) => a + (t.fx === fx ? talentLevel(vid) : 0), 0);
export const talentFx = fx => TALENT.fx * fxLvl(fx);
// la phrase du talent
export function talentText(vid) {
    const t = TALENTS[vid];
    const k = Math.max(1, talentLevel(vid));
    const fx = t.fx ? `${t.text} (${Math.round(TALENT.fx * k * 100)} %)` : '';
    const m = t.m
        ? `${t.m.length > 1 ? 'ses machines' : 'sa machine'} : ${Math.round(TALENT.speed * k * 100)} % plus rapide${t.m.length > 1 ? 's' : ''}, produits ${Math.round(TALENT.price * k * 100)} % plus chers`
        : '';
    const s = [m, fx].filter(Boolean).join(' ; ');
    return s[0].toUpperCase() + s.slice(1);
}
export const talentsOn = () => Object.keys(TALENTS).filter(vid => talentLevel(vid) > 0).length;

// ---------------- les duos ----------------
export const duoOf = vid => DUOS.find(d => d.includes(vid)) || null;
export const partnerOf = vid => {
    const d = duoOf(vid);
    return d ? d.find(x => x !== vid) : null;
};
export const duoKey = d => d.join('-');
export const duoState = key => {
    state.duos = state.duos || {};
    return state.duos[key] || (state.duos[key] = { step: 0, given: {} });
};
export const duoOpen = d => d.every(v => hearts(v) >= 5) && duoState(duoKey(d)).step < DUO_STORIES[duoKey(d)].steps.length;
export const duoDone = d => duoState(duoKey(d)).step >= DUO_STORIES[duoKey(d)].steps.length;
