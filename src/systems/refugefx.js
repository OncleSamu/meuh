// 1.181 : Helpers passifs sans cycle d'import pour le Refuge & Clinique Vétérinaire.
import { state } from '../core/state.js';
import { now } from '../core/clock.js';
import { REFUGE_LVL, WILD_BY_ID, WILD_SPECIES_SPEED_PER, REFUGE_PALM } from '../data/refuge.js';

export function refugeOpen() {
    return state.level >= REFUGE_LVL;
}
export function refugeSpeciesCount() {
    const seen = state.refuge && state.refuge.seen;
    return seen ? Object.keys(seen).filter(k => seen[k] > 0 && WILD_BY_ID[k]).length : 0;
}
export function refugeTotalHealed() {
    return (state.refuge && state.refuge.healed) || 0;
}
export function refugeVitalityLeftMs() {
    return Math.max(0, ((state.refuge && state.refuge.vitalityUntil) || 0) - now());
}
export function refugeVitalityOn() {
    return refugeVitalityLeftMs() > 0;
}
export function refugeBreedBalmCount() {
    return (state.refuge && state.refuge.breedBalms) || 0;
}

export function refugePalmTotals() {
    const n = refugeTotalHealed();
    let sickResist = 0,
        freeCure = false,
        speed = 0,
        qual = 0,
        doubleBasket = false;
    for (const t of REFUGE_PALM) {
        if (n >= t.need) {
            sickResist += t.sickResist;
            if (t.freeCure) freeCure = true;
            speed += t.speed;
            qual += t.qual;
            if (t.doubleBasket) doubleBasket = true;
        }
    }
    return { sickResist: Math.min(0.75, sickResist), freeCure, speed, qual, doubleBasket };
}

// Multiplicateur global Refuge sur la vitesse de production de tous les animaux
export function refugeAnimalMult() {
    const sp = refugeSpeciesCount() * WILD_SPECIES_SPEED_PER;
    const palm = refugePalmTotals();
    return (1 + sp + palm.speed) * (refugeVitalityOn() ? 1.3 : 1);
}

// Chance d'amélioration de qualité d'un produit animal grâce au Palmarès Vétérinaire
export function refugeQualityBoost(q) {
    const palm = refugePalmTotals();
    if (palm.qual <= 0 || q >= 4) return q;
    return Math.random() < palm.qual ? Math.min(4, q + 1) : q;
}

// Résistance aux maladies des animaux (1 = immunité totale sous Sérum de vitalité)
export function refugeSickResist() {
    if (refugeVitalityOn()) return 1;
    return refugePalmTotals().sickResist;
}

// Soin gratuit d'une bête malade au pré dès le Palier 2 ou sous Sérum de vitalité
export function refugeFreeCure() {
    return refugeVitalityOn() || refugePalmTotals().freeCure;
}

// Baume d'élevage rare consommé à la prochaine naissance au pré
export function applyRefugeBirthBonus(baby) {
    if (!baby || !baby.g || refugeBreedBalmCount() <= 0) return false;
    state.refuge.breedBalms = Math.max(0, state.refuge.breedBalms - 1);
    const keys = Object.keys(baby.g.t || {});
    for (let i = 0; i < 2 && keys.length; i++) {
        const k = keys[Math.floor(Math.random() * keys.length)];
        const pair = baby.g.t[k];
        if (Array.isArray(pair) && pair.length === 2 && Array.isArray(pair[0]) && Array.isArray(pair[1])) {
            pair[0] = [Math.min(8, pair[0][0] + 1), 1];
            pair[1] = [Math.min(8, pair[1][0] + 1), pair[1][1]];
        }
    }
    if (baby.g.l) {
        const col = 1 + Math.floor(Math.random() * 10);
        const fin = 1 + Math.floor(Math.random() * 3);
        if (baby.g.l.color) {
            baby.g.l.color = [
                [col, 1],
                [col, 0],
            ];
        }
        if (baby.g.l.finish) {
            baby.g.l.finish = [
                [fin, 1],
                [0, 0],
            ];
        }
    }
    return true;
}
