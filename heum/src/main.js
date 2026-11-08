// Heum — le démarrage.
import { setStore } from './core/state.js';
import { loadGame } from './systems/index.js';
import { setupFx, toast } from './ui/fx.js';
import { setupSheet } from './ui/sheet.js';
import { setupApp } from './ui/app.js';
import { dur } from './core/format.js';

function start() {
    try {
        setStore(window.localStorage);
    } catch {}
    const { away } = loadGame();
    setupFx();
    setupSheet();
    setupApp();
    if (away > 60) toast(`Pendant votre absence (${dur(away)}), la ferme a tourné sans vous : rien n’est perdu.`);
}
start();
