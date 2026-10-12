// Ce que l'interface montre en ce moment : certaines règles en dépendent
// (le corbeau attend que le champ soit visible, les œufs n'apparaissent que sous vos yeux…).
// Sans interface, le robot règle ces drapeaux lui-même.
export const view = {
    tab: 'farm', // onglet ouvert
    sub: '', // sous-onglet ouvert
    hidden: false, // application en arrière-plan
    modal: false, // une fenêtre recouvre le jeu
    started: false, // la partie est lancée (pas de messages pendant le chargement)
    wide: false, // grand écran : le champ reste toujours visible
};

export const farmShown = () => view.wide || (view.tab === 'farm' && view.sub !== 'nature');
export const viewShown = v => (v === 'farm' ? farmShown() : view.tab === v);
export const setView = patch => Object.assign(view, patch);
