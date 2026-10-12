// L'appli installable : service worker (hors-ligne, mise à jour), installation et rappels.
import { state } from '../core/state.js';
import { toast } from '../core/bus.js';
import * as G from '../systems/index.js';
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
        })
        .catch(() => {});
}

// ---------------- rappels quand le jeu est en arrière-plan ----------------
export const remindOn = () => !!state.settings.remind && typeof Notification !== 'undefined' && Notification.permission === 'granted';

export function toggleRemind(done) {
    if (typeof Notification === 'undefined') {
        toast('Votre navigateur ne permet pas les rappels', ['ui', 'clock']);
        return;
    }
    if (state.settings.remind) {
        state.settings.remind = false;
        return;
    }
    Notification.requestPermission().then(p => {
        state.settings.remind = p === 'granted';
        toast(
            p === 'granted' ? 'Rappels activés : Meuh vous prévient quand le jeu est en arrière-plan' : 'Rappels refusés par le navigateur : vous pouvez les autoriser dans ses réglages',
            ['ui', 'clock'],
        );
        done();
    });
}

let notified = {};
export function remindTick() {
    if (!document.hidden) {
        notified = {};
        return;
    }
    if (!remindOn()) return;
    for (const [key, text] of G.reminders()) {
        if (notified[key]) continue;
        notified[key] = true;
        const opts = { body: text, tag: 'meuh-' + key.split(':')[0], icon: 'icons/icon-192.png', badge: 'icons/icon-192.png' };
        // dans l'appli installée, c'est le service worker qui affiche le rappel (obligatoire sur Android)
        if (workerReg) workerReg.showNotification('Meuh', opts).catch(() => {});
        else
            try {
                new Notification('Meuh', { body: text, tag: opts.tag });
            } catch {
                // rappel impossible
            }
    }
}

export function setupPwa() {
    window.addEventListener('beforeinstallprompt', e => {
        e.preventDefault();
        installPrompt = e;
    });
    window.addEventListener('appinstalled', () => {
        installPrompt = null;
        toast('Meuh est installé sur votre appareil !', ['ui', 'check']);
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
