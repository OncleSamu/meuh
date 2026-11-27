// L'île (bêta 3) : plantations tropicales et verger des îles, ouverts par le chantier « Le bac ».
import { lv80 } from './lv80.js';
export const ISLAND = {
    lvl: lv80(38),
    project: 'ferry',
    // parcelles : jamais d'arrosage (les pluies tropicales s'en chargent), toujours de saison
    plotsBase: 6,
    plotsMax: 18,
    plotCost: 15000, // 7e parcelle, puis ×plotMult
    plotMult: 1.25,
    rate: 1.15, // vitesse de pousse sous les tropiques (cultures et arbres)
    // verger des îles
    slotsBase: 4,
    slotsMax: 12,
    slotCost: 20000, // 5e place, puis ×slotMult
    slotMult: 1.3,
};

// 1.186 : Île 2.0 — Goélette des îles (transport dédié) et Lagon aux perles (cueillette côtière)
export const SCHOONER = {
    cap: 20,
    minLoad: 4,
    time: 3 * 3600, // 3 h de traversée
    mult: 2.3, // ×2,3 sur les produits de l'île et de la mer
    otherMult: 1.35,
    xpPerUnit: 12,
    rewards: ['vanilla', 'nutmeg', 'cinnamon', 'tiare', 'lobster', 'orchid'],
};

export const LAGOON = {
    cooldown: 2 * 3600, // 2 h entre deux plongées
    xp: 85,
    pool: ['coconut', 'shrimp', 'lime', 'tiare', 'vanilla', 'lobster'],
};
