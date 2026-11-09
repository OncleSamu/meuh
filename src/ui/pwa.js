// L'appli installable : service worker (hors-ligne, mise à jour), installation.
import { toast } from '../core/bus.js';
import { saveNow } from './app.js';
import { ico } from './icons.js';

let installPrompt = null,
    workerReg = null;
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;

export const installState = () => ({
    standalone: isStandalone(),
    hint: installPrompt ? 'En plein écran, sans barre du navigateur' : 'Le lancer depuis l’écran d’accueil comme une vraie appli',
});

// vrai si le navigateur s'en est chargé, faux s'il faut montrer les étapes
export async function installApp() {
    if (!installPrompt) return false;
    installPrompt.prompt();
    try {
        await installPrompt.userChoice;
    } catch {
        // refusé
    }
    installPrompt = null;
    return true;
}

function showUpdateBar() {
    const bar = document.createElement('button');
    bar.className = 'update-bar';
    bar.innerHTML = `${ico(['ui', 'star'])}<span>Une nouvelle version de Meuh est prête. Touchez pour l’installer.</span>`;
    bar.onclick = () => {
        saveNow();
        navigator.serviceWorker.addEventListener('controllerchange', () => location.reload());
        if (workerReg && workerReg.waiting) workerReg.waiting.postMessage('skip');
        else location.reload();
    };
    document.body.appendChild(bar);
}

function registerWorker() {
    if (!('serviceWorker' in navigator) || !location.protocol.startsWith('http')) return;
    navigator.serviceWorker
        .register('sw.js')
        .then(reg => {
            workerReg = reg;
            reg.addEventListener('updatefound', () => {
                const w = reg.installing;
                if (!w) return;
                w.addEventListener('statechange', () => {
                    if (w.state === 'installed' && navigator.serviceWorker.controller) showUpdateBar();
                });
            });
            // cherche une nouvelle version à chaque retour sur le jeu
            document.addEventListener('visibilitychange', () => !document.hidden && reg.update().catch(() => {}));
            // 1.105 : et toutes les 20 minutes quand le jeu reste ouvert (sinon il fallait fermer l'appli pour voir une mise à jour)
            setInterval(() => !document.hidden && reg.update().catch(() => {}), 20 * 60000);
        })
        .catch(() => {});
}

export function setupPwa() {
    window.addEventListener('beforeinstallprompt', e => {
        e.preventDefault();
        installPrompt = e;
    });
    window.addEventListener('appinstalled', () => {
        installPrompt = null;
        toast('Meuh est installé sur votre appareil !', ['ui', 'check']);
    });
    for (const [name, content] of [
        ['apple-mobile-web-app-capable', 'yes'],
        ['mobile-web-app-capable', 'yes'],
        ['apple-mobile-web-app-status-bar-style', 'default'],
        ['apple-mobile-web-app-title', 'Meuh'],
    ]) {
        const m = document.createElement('meta');
        m.name = name;
        m.content = content;
        document.head.appendChild(m);
    }
    registerWorker();
}
