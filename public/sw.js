// IGIFY WebUI — Service Worker (offline-first)
// Strategy:
//   • App shell (HTML, manifest) is precached at install.
//   • Navigations use network-first, falling back to the cached shell when offline.
//   • Same-origin assets (JS/CSS) use stale-while-revalidate.
//   • Cross-origin requests are left to the network, with cache fallback if seen before.

const CACHE_NAME = 'igify-webui-v1';
const SHELL = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Only handle GET requests; let the network deal with everything else.
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Navigation requests: try network first, fall back to the app shell.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html').then((r) => r || caches.match('/')))
    );
    return;
  }

  // Same-origin assets: stale-while-revalidate.
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        const network = fetch(request)
          .then((response) => {
            if (response && response.ok) cache.put(request, response.clone());
            return response;
          })
          .catch(() => null);
        return cached || (await network) || Response.error();
      })
    );
    return;
  }

  // Cross-origin: network first, then cache if we have seen it.
  event.respondWith(fetch(request).catch(() => caches.match(request)));
});
