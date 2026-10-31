const CACHE_NAME = 'rukun-kasir-v1';
const APP_SHELL = ['/', '/manifest.webmanifest', '/pwa-icon.svg'];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
    );
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches
            .keys()
            .then((keys) =>
                Promise.all(
                    keys
                        .filter((key) => key !== CACHE_NAME)
                        .map((key) => caches.delete(key)),
                ),
            ),
    );
    self.clients.claim();
});

self.addEventListener('fetch', (event) => {
    const request = event.request;
    const url = new URL(request.url);

    if (request.method !== 'GET' || url.origin !== self.location.origin) {
        return;
    }

    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    const copy = response.clone();
                    return caches
                        .open(CACHE_NAME)
                        .then((cache) => cache.put(request, copy))
                        .then(() => response);
                })
                .catch(
                    async () =>
                        (await caches.match(request)) || caches.match('/'),
                ),
        );
        return;
    }

    if (url.pathname.startsWith('/build/')) {
        event.respondWith(
            caches.match(request).then((cached) => {
                const update = fetch(request)
                    .then((response) => {
                        if (!response.ok) {
                            return response;
                        }
                        return caches
                            .open(CACHE_NAME)
                            .then((cache) =>
                                cache.put(request, response.clone()),
                            )
                            .then(() => response);
                    })
                    .catch((error) => {
                        if (cached) {
                            return cached;
                        }
                        throw error;
                    });
                return cached || update;
            }),
        );
    }
});
