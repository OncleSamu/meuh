// Service worker de Meuh : le jeu marche hors-ligne et affiche les rappels.
// La version change à chaque mise en ligne (remplacée par build.py --pwa).
const VERSION = '1.59-20261027165858';
const CACHE = 'meuh-' + VERSION;
const FILES = [
    './',
    './index.html',
    './manifest.webmanifest',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/maskable-512.png',
    './icons/badge-96.png',
    './icons/apple-touch-icon.png',
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches
            .open(CACHE)
            .then(c => c.addAll(FILES))
            .then(() => self.skipWaiting()),
    );
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches
            .keys()
            .then(keys => Promise.all(keys.filter(k => k.startsWith('meuh-') && k !== CACHE).map(k => caches.delete(k))))
            .then(() => self.clients.claim()),
    );
});

self.addEventListener('fetch', e => {
    const req = e.request;
    if (req.method !== 'GET') return;
    const url = new URL(req.url);
    // polices Google : du cache d'abord, mises à jour en fond
    if (url.host.endsWith('googleapis.com') || url.host.endsWith('gstatic.com')) {
        e.respondWith(
            caches.open('meuh-fonts').then(c =>
                c.match(req).then(hit => {
                    const net = fetch(req)
                        .then(r => {
                            if (r.ok || r.type === 'opaque') c.put(req, r.clone());
                            return r;
                        })
                        .catch(() => hit);
                    return hit || net;
                }),
            ),
        );
        return;
    }
    if (url.origin !== location.origin) return;
    // le jeu : la dernière version en ligne, la copie du cache sans réseau
    // 1.18.3 : en ligne, on prend d'abord la dernière version (et on la garde en cache) ; hors ligne, la copie du cache
    e.respondWith(
        fetch(req, { cache: 'no-cache' })
            .then(r => {
                if (r.ok) caches.open(CACHE).then(c => c.put(req, r.clone()));
                return r;
            })
            .catch(() => caches.match(req, { ignoreSearch: true })),
    );
});

// toucher un rappel ramène dans le jeu
self.addEventListener('notificationclick', e => {
    e.notification.close();
    e.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
            for (const c of list) if ('focus' in c) return c.focus();
            return self.clients.openWindow('./');
        }),
    );
});

// « installer la nouvelle version » depuis le jeu
self.addEventListener('message', e => {
    if (e.data === 'skip') self.skipWaiting();
});
