// La retraite des champions et le livre généalogique (1.24.2) : les reproducteurs au pré, leurs saillies, les poulains
// qui héritent d'un peu de leur talent, le nom d'élevage et les lignées célèbres.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { fmt } from '../core/format.js';
import { emit, toast, sfx, buzz } from '../core/bus.js';
import { STUD, COAT, DISC } from '../data/haras.js';
import { earn, addXp } from './player.js';
import { placeAnimal } from './pastures.js';
import { ensureHaras, harasOpen, horses, horseByUid, rec, onRando, aptCap } from './haras.js';
import { coatOf } from './coat.js';

const dayNo = () => Math.floor((now() / 60000 - new Date(now()).getTimezoneOffset()) / 1440);
export function ensureStud() {
    const H = ensureHaras();
    const s = (H.stud ||= { name: STUD.defaultName, day: dayNo(), earned: 0, foals: 0, famous: 0, robes: {}, marks: {} });
    s.robes ||= {};
    s.marks ||= {};
    return s;
}
export const studName = () => ensureStud().name;
export function setStudName(n) {
    const t = String(n || '')
        .trim()
        .slice(0, 22);
    if (!t) return false;
    ensureStud().name = t;
    emit('changed', 'haras');
    return true;
}

// ---------------- les champions ----------------
export const bestDiv = uid => {
    const b = state.show && state.show.best;
    return b && b[uid] !== undefined ? b[uid] : -1;
};
export const isChampion = a => !!a && bestDiv(a.uid) >= STUD.champDiv;
export const isChampionUid = uid => bestDiv(uid) >= STUD.champDiv;
export const chainOf = a => (a && a.chain) || 0;
// une victoire en division : le cheval devient champion ; sa lignée compte une génération de plus. Rend les rubans gagnés.
export function champWon(uid, div) {
    const s = state.show;
    s.best ||= {};
    if (div > (s.best[uid] === undefined ? -1 : s.best[uid])) s.best[uid] = div;
    const a = horseByUid(uid);
    if (!a || div < STUD.champDiv || a.chain) return 0;
    // 1.24.3 : un parent devenu champion après la naissance compte aussi
    const sire = horseByUid(a.sire),
        dam = horseByUid(a.dam);
    a.chain = Math.max(a.pc || 0, isChampion(sire) ? chainOf(sire) : 0, isChampion(dam) ? chainOf(dam) : 0) + 1;
    if (a.chain === STUD.famous) {
        ensureStud().famous++;
        toast(`Lignée célèbre : ${a.name} est le ${STUD.famous}e champion de suite de sa famille !`, ['ui', 'hCouronne']);
        return STUD.famousRibbons;
    }
    return 0;
}

// ---------------- la retraite ----------------
export const retired = () => horses().filter(a => rec(a).retired);
export const isRetired = a => !!a && !!rec(a).retired;
export const retireSlots = () => STUD.max;
export function retireWhy(a) {
    if (!harasOpen()) return 'Écuries fermées';
    if (!a || a.adult === false) return 'Trop jeune';
    if (isRetired(a)) return 'Déjà à la retraite';
    if (!isChampion(a)) return 'Il faut un titre en division Élite';
    if (retired().length >= STUD.max) return `${STUD.max} reproducteurs au plus`;
    if (onRando(a)) return 'En randonnée';
    const s = state.show;
    if (s && ((s.entry && s.entry.uid === a.uid) || (s.gp && s.gp.uid === a.uid))) return 'Inscrit à un concours';
    return '';
}
export const canRetire = a => !retireWhy(a);
export function retire(uid) {
    const a = horseByUid(uid);
    if (!a || !canRetire(a)) return false;
    const r = rec(a);
    r.retired = now();
    r.eq = {};
    if (a.box) {
        a.box = false;
        if (placeAnimal(a) < 0) a.p = 0;
    }
    ensureStud().day = Math.max(ensureStud().day, dayNo());
    sfx('level');
    buzz(30);
    addXp(150, null);
    toast(`${a.name} prend sa retraite au pré : reproducteur de l’élevage « ${studName()} »`, ['ui', 'hRetraite']);
    emit('changed', 'haras');
    return true;
}

// ---------------- les saillies : un revenu chaque jour ----------------
// une saillie vaut plus quand le champion a beaucoup gagné
export const studIncome = a => {
    const wins = a && state.show && state.show.titles ? state.show.titles[a.uid] || 0 : 0;
    return Math.round((STUD.income * (1 + state.level / 50) * (1 + Math.min(STUD.incomeWinMax, wins * STUD.incomeWin))) / 10) * 10;
};
export function studTick() {
    if (!state.haras || !state.haras.stud) return false;
    const s = ensureStud();
    const d = dayNo();
    let ch = false;
    if (d > s.day) {
        const days = Math.min(STUD.incomeDays, d - s.day);
        const sum = days * retired().reduce((t, a) => t + studIncome(a), 0);
        s.day = d;
        if (sum) {
            earn(sum, null);
            s.earned += sum;
            toast(`Saillies de l’élevage « ${s.name} » : +${fmt(sum)} pièces`, ['ui', 'hSaillie']);
            ch = true;
        }
    }
    // la collection de robes et de marques
    horses().forEach(a => {
        const c = coatOf(a.g);
        if (!c) return;
        if (!s.robes[c.robe]) (s.robes[c.robe] = 1), (ch = true);
        c.marks.forEach(m => !s.marks[m] && ((s.marks[m] = 1), (ch = true)));
    });
    return ch;
}
export const robesSeen = () => Object.keys(ensureStud().robes).length;
export const marksSeen = () => Object.keys(ensureStud().marks).length;
export const robesAll = () => Object.keys(COAT.robes).length;
export const marksAll = () => Object.keys(COAT.marks).length;

// ---------------- la naissance d'un poulain ----------------
export function studBorn(baby, a, b) {
    baby.sire = a.uid;
    baby.dam = b.uid;
    // la lignée de champions : une génération de plus que le meilleur parent champion
    baby.pc = Math.max(isChampion(a) ? chainOf(a) : 0, isChampion(b) ? chainOf(b) : 0);
    const r = rec(baby);
    for (const p of [a, b]) {
        const pr = rec(p);
        if (pr.retired && pr.spec && DISC[pr.spec]) {
            r.pts[pr.spec] = Math.min(aptCap(baby, pr.spec), (r.pts[pr.spec] || 0) + STUD.foalPts);
            r.heir = r.heir || [];
            r.heir.push(p.name);
        }
    }
    ensureStud().foals++;
    const c = coatOf(baby.g);
    if (c) baby.coatName = COAT.robes[c.robe];
}
// l'arbre de famille d'un cheval : parents et grands-parents (les fiches gardées dans sa lignée)
export function familyOf(a) {
    if (!a) return null;
    return { me: { n: a.name, g: a.g, ch: isChampion(a), u: a.uid }, lin: a.lin || [null, null] };
}
