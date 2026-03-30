const CACHE_NAME = 'padel-garage-v3';
const ASSETS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/js/app.js',
  '/js/api.js',
  '/js/garage.js',
  '/js/ranking.js',
  '/js/ui.js',
  '/data/rackets.json',
  '/data/ranking.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }));
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Stratégie "Network First, falling back to cache" pour le dev
      return fetch(event.request).then(netRes => {
          return caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, netRes.clone());
              return netRes;
          });
      }).catch(() => {
          return response;
      });
    })
  );
});
