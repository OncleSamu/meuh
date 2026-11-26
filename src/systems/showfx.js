// 1.180 : Fonctions pures (sans cycle d'import) pour les pouvoirs permanents des Concours hippiques 2.0.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { SHOW_TITLE_FX, SHOW_PALM_TIERS } from '../data/haras.js';

export function titlesOf(uid) {
    return (state.show && state.show.titles && state.show.titles[uid]) || 0;
}
export function isTitledHorse(a) {
    return !!a && titlesOf(a.uid) >= 1;
}
export function isGrandChampHorse(a) {
    return !!a && titlesOf(a.uid) >= SHOW_TITLE_FX.champWins;
}
export function showWinsTotal() {
    return (state.show && state.show.wins) || 0;
}
export function showGoldOatsLeftMs() {
    return Math.max(0, ((state.show && state.show.goldOatsUntil) || 0) - now());
}
export function showGoldOatsOn() {
    return showGoldOatsLeftMs() > 0;
}
export function showElixirCount() {
    return (state.show && state.show.elixirs) || 0;
}

export function showPalmTotals() {
    const w = showWinsTotal();
    let train = 0,
        purse = 0,
        form = 0,
        crin = 0,
        note = 0;
    for (const t of SHOW_PALM_TIERS) {
        if (w >= t.need) {
            train += t.train;
            purse += t.purse;
            form += t.form;
            crin += t.crin;
            note += t.note;
        }
    }
    return { train, purse, form, crin, note };
}

export function showStableAura(excludeUid = null) {
    if (!Array.isArray(state.animals)) return { count: 0, train: 0, form: 0 };
    let count = 0;
    for (const a of state.animals) {
        if (a && a.type === 'horse' && a.box && a.uid !== excludeUid && isGrandChampHorse(a)) count++;
    }
    count = Math.min(SHOW_TITLE_FX.auraMax, count);
    return {
        count,
        train: count * SHOW_TITLE_FX.auraTrain,
        form: count * SHOW_TITLE_FX.auraForm,
    };
}

// Multiplicateur sur le temps de régénération d'une pastille de forme (< 1 = plus rapide)
export function showFormMult(a) {
    if (!a) return 1;
    let m = 1;
    if (isTitledHorse(a)) m *= SHOW_TITLE_FX.formMult;
    const aura = showStableAura(a.uid);
    if (aura.form > 0) m *= 1 - aura.form;
    const palm = showPalmTotals();
    if (palm.form > 0) m *= 1 - palm.form;
    if (showGoldOatsOn()) m *= 0.5;
    return m === 1 ? 1 : Math.max(0.25, m);
}

// Multiplicateur sur les points gagnés à l'entraînement aux écuries
export function showTrainMult(a) {
    const aura = showStableAura(a ? a.uid : null);
    const palm = showPalmTotals();
    return (1 + aura.train + palm.train) * (showGoldOatsOn() ? 1.35 : 1);
}

// Bonus sur les randonnées d'un cheval titré
export function showRandoBonus(a) {
    if (!isTitledHorse(a)) return { extraDraws: 0, qtyMult: 1 };
    return { extraDraws: SHOW_TITLE_FX.randoExtra, qtyMult: SHOW_TITLE_FX.randoQtyMult };
}

// Bonus vitesse & qualité du crin pour les chevaux dans animals.js
export function showHorseAnimalMult(a) {
    if (!a || a.type !== 'horse') return 1;
    const self = isTitledHorse(a) ? SHOW_TITLE_FX.crinSpeed : 0;
    const palm = showPalmTotals().crin;
    return 1 + self + palm;
}
export function showHorseQualityBoost(a, q) {
    if (!a || a.type !== 'horse' || q >= 4 || !isTitledHorse(a)) return q;
    return Math.random() < SHOW_TITLE_FX.crinQual ? Math.min(4, q + 1) : q;
}

// Bonus sur les revenus quotidiens de saillies
export function showStudBonus() {
    return 1 + showPalmTotals().purse;
}
