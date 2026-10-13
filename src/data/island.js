// L'île (bêta 3) : plantations tropicales et verger des îles, ouverts par le chantier « Le bac ».
export const ISLAND = {
    lvl: 38,
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
