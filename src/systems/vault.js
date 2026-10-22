// Le coffre-fort de la grange (1.29) : on y range des produits (avec leur qualité) et des lots de la cave
// pour les garder, les collectionner ou les vendre plus tard. Tout ce qui est dedans est à l'abri :
// ni vendu, ni livré, ni utilisé par une recette, et ça ne prend pas de place dans la grange.
import { state } from '../core/state.js';
import { toast, sfx } from '../core/bus.js';
import { ITEMS } from '../data/items.js';
import { QX } from '../data/farm.js';
import { VAULT } from '../data/commerce.js';
import { spend } from './player.js';
import { tip } from './tips.js';
import { inBarn, barnSpace } from './barn.js';
import { qual, qCount, clampQuality } from './farm.js';
import { unitPrice } from './market.js';

export const vaultOpen = () => state.level >= VAULT.lvl;
export const vaultLvl = () => (state.vault && state.vault.lvl) || 0;
export const vaultSlots = () => VAULT.base + VAULT.per * vaultLvl();

export function ensureVault() {
    const v = state.vault;
    v.lvl = v.lvl || 0;
    v.slots = Array.isArray(v.slots) ? v.slots : [];
    while (v.slots.length < vaultSlots()) v.slots.push(null);
    return v;
}
export const vaultList = () => ensureVault().slots;
export const vaultUsed = () => vaultList().filter(Boolean).length;
export const vaultFree = () => vaultList().findIndex(s => !s);

// la valeur d'un emplacement, au prix du marché sans baisse de la demande (un lot : sa valeur de cave)
let lotUnitFn = null;
// la cave donne la valeur d'un lot ; elle s'enregistre ici pour éviter une boucle d'imports
export const setVaultLotUnit = fn => (lotUnitFn = fn);
const vaultLotUnit = lot => (lotUnitFn ? lotUnitFn(lot) : 0);
export const vaultSlotValue = s => (!s ? 0 : s.kind === 'lot' ? vaultLotUnit(s.lot) * s.lot.n : unitPrice(s.id, s.q || 0, 1) * s.n);
export const vaultTotal = () => vaultList().reduce((a, s) => a + vaultSlotValue(s), 0);

// ---------------- agrandir ----------------
export const vaultUpCost = () => VAULT.cost(vaultLvl());
export const canUpgradeVault = () => vaultLvl() < VAULT.max && state.money >= vaultUpCost();
export function upgradeVault() {
    if (!vaultOpen() || vaultLvl() >= VAULT.max) return false;
    if (state.money < vaultUpCost()) {
        toast('Pas assez de pièces pour agrandir le coffre', ['ui', 'coin']);
        sfx('error');
        return false;
    }
    spend(vaultUpCost());
    state.vault.lvl = vaultLvl() + 1;
    ensureVault();
    sfx('level');
    toast(`Coffre agrandi : ${vaultSlots()} emplacements`, ['ui', 'vault']);
    return true;
}

// ---------------- les produits ----------------
// ce qu'on peut mettre au coffre : les produits de la grange en stock
export const vaultCanPut = id => !!ITEMS[id] && inBarn(id) && (state.inventory[id] || 0) > 0;
// combien d'unités du stock sont de ce rang (0 : normal)
export function vaultStock(id, q) {
    clampQuality(id);
    const inv = state.inventory[id] || 0;
    if (!q) return Math.max(0, inv - qCount(qual(id)));
    return Math.min(inv, qual(id)[QX.keys[q]] || 0);
}
// le coffre peut-il encore prendre ce produit à ce rang ? (un emplacement existant avec de la place, ou un emplacement libre)
export function vaultRoom(id, q) {
    let room = vaultFree() >= 0 ? VAULT.stack : 0;
    for (const s of vaultList()) if (s && s.kind === 'item' && s.id === id && (s.q || 0) === q) room = Math.max(room, VAULT.stack - s.n);
    return room;
}
export function vaultPut(id, q, n) {
    ensureVault();
    q = q | 0;
    n = Math.floor(n);
    if (!vaultOpen() || !vaultCanPut(id) || n < 1 || n > vaultStock(id, q)) return false;
    const st = vaultList().find(s => s && s.kind === 'item' && s.id === id && (s.q || 0) === q && s.n < VAULT.stack);
    if (st) {
        n = Math.min(n, VAULT.stack - st.n);
        st.n += n;
    } else {
        const k = vaultFree();
        if (k < 0) {
            toast('Le coffre est plein : agrandissez-le ou reprenez quelque chose', ['ui', 'vault']);
            sfx('error');
            return false;
        }
        n = Math.min(n, VAULT.stack);
        state.vault.slots[k] = { kind: 'item', id, q, n };
    }
    state.inventory[id] -= n;
    if (q) qual(id)[QX.keys[q]] -= n;
    clampQuality(id);
    sfx('load');
    return n;
}

// ---------------- les lots de cave ----------------
export function vaultPutLot(uid) {
    ensureVault();
    const c = state.cave;
    const k = c.reserve.findIndex(l => l.uid === uid);
    if (!vaultOpen() || k < 0) return false;
    const f = vaultFree();
    if (f < 0) {
        toast('Le coffre est plein : agrandissez-le ou reprenez quelque chose', ['ui', 'vault']);
        sfx('error');
        return false;
    }
    state.vault.slots[f] = { kind: 'lot', lot: c.reserve.splice(k, 1)[0] };
    sfx('load');
    return true;
}
export const vaultLots = () => ((state.vault && state.vault.slots) || []).filter(s => s && s.kind === 'lot').map(s => s.lot);

// ---------------- reprendre ----------------
export function vaultTake(i, n) {
    const s = vaultList()[i];
    if (!s) return false;
    if (s.kind === 'lot') {
        state.cave.reserve.push(s.lot);
        state.vault.slots[i] = null;
        sfx('pop');
        return true;
    }
    n = Math.max(1, Math.min(Math.floor(n || s.n), s.n));
    if (inBarn(s.id) && barnSpace() < n) {
        toast('La grange est pleine : faites de la place avant de reprendre', ['ui', 'barn']);
        sfx('error');
        return false;
    }
    state.inventory[s.id] = (state.inventory[s.id] || 0) + n;
    if (s.q) {
        const o = qual(s.id);
        o[QX.keys[s.q]] += n;
    }
    s.n -= n;
    if (s.n <= 0) state.vault.slots[i] = null;
    sfx('pop');
    return n;
}

export const tipVault = () => tip('vault');
