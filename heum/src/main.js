// Heum — le démarrage.
import { setStore } from './core/state.js';
import { loadGame } from './systems/index.js';
import { setupFx, toast } from './ui/fx.js';
import { setupSheet } from './ui/sheet.js';
import { setupApp } from './ui/app.js';
import { dur } from './core/format.js';
import { showBad } from './ui/savebox.js';

function start() {
    try {
        setStore(window.localStorage);
    } catch {}
    const { status, away } = loadGame();
    setupFx();
    setupSheet();
    setupApp();
    if (status === 'bad') showBad();
    if (away > 60) toast(`Pendant votre absence (${dur(away)}), la ferme a tourné sans vous : rien n’est perdu.`);
}
start();
// hors ligne : le service worker garde une copie du jeu (pas en fichier local)
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
