// 1.174 : 100 niveaux. Les niveaux 40 à 79 sont étirés sur 40 à 90, Les Terres d’Asie occupent 91 à 99,
// et le niveau 100 devient le sommet (Prestige, Renommée, Grands Défis et Ferme légendaire).
// Rien ne change avant le niveau 40. lv80.js reste intact pour la migration des anciennes sauvegardes 64 → 80.
export const MAX_80 = 80;
export const WIDTH100 = {
    40: 1, 41: 2, 42: 1, 43: 2, 44: 1, 45: 1, 46: 1, 47: 2, 48: 1, 49: 2,
    50: 1, 51: 1, 52: 1, 53: 1, 54: 2, 55: 1, 56: 2, 57: 1, 58: 1, 59: 1,
    60: 1, 61: 1, 62: 1, 63: 1, 64: 1, 65: 1, 66: 1, 67: 1, 68: 1, 69: 1,
    70: 2, 71: 1, 72: 1, 73: 2, 74: 1, 75: 2, 76: 1, 77: 2, 78: 1, 79: 2,
    80: 10,
}; // prettier-ignore

const LO = {};
{
    let lo = 40;
    for (let l = 40; l <= MAX_80; l++) {
        LO[l] = lo;
        lo += WIDTH100[l];
    }
}
export const MAX_100 = LO[MAX_80] + WIDTH100[MAX_80] - 1; // 100
export const lv100 = l => (l <= 40 ? l : l >= MAX_80 ? 91 : LO[l]);
export const lv100Hi = l => (l < 40 ? l : l >= MAX_80 ? MAX_100 : LO[l] + WIDTH100[l] - 1);

// Niveau équivalent sur l'ancienne échelle 1..80 (avec décimales) pour garder l'économie calibrée via oldLvl()
export function oldLvl80(n) {
    if (n <= 40) return n;
    if (n >= MAX_100) return MAX_80;
    let l = 40;
    while (l < MAX_80 && LO[l + 1] <= n) l++;
    return l + (n - LO[l]) / WIDTH100[l];
}
