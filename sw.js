const CACHE_NAME = 'pbm-v2.0.0';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/manifest.json',
  '/favicon.png',
  '/favicon.ico',
  '/og-image.png',
  '/js/app.js',
  '/js/data/i18n.js',
  '/js/data/currencies.js',
  '/js/data/resources.js',
  '/js/data/search-index.js',
  '/js/utils/formatters.js',
  '/js/utils/storage.js',
  '/js/components/modal.js',
  '/js/components/drawer.js',
  '/js/components/embed.js',
  '/js/calculators/concrete.js',
  '/js/calculators/drywall.js',
  '/js/calculators/flooring.js',
  '/js/calculators/framing.js',
  '/js/calculators/paint.js',
  '/js/calculators/roofing.js',
  '/js/calculators/caprate.js',
  '/js/calculators/brrrr.js',
  '/js/calculators/fixflip.js',
  '/js/calculators/hardmoney.js',
  '/js/calculators/hvac.js',
  '/calculators/concrete/',
  '/calculators/drywall/',
  '/calculators/flooring/',
  '/calculators/framing/',
  '/calculators/paint/',
  '/calculators/roofing/',
  '/calculators/caprate/',
  '/calculators/brrrr/',
  '/calculators/fixflip/',
  '/calculators/hardmoney/',
  '/calculators/hvac/',
  '/guides/how-to-use/',
  '/standards/is-456/',
  '/privacy/',
  '/disclaimer/'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        return networkResponse;
      });
    }).catch(() => {
      return caches.match('/index.html');
    })
  );
});
