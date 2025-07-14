// Incrementing the cache version to v4 to force the browser to install the new service worker.
const CACHE_NAME = 'my-love-lauren-cache-v4';

const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.svg',
];

// --- SERVICE WORKER EVENTS ---

// Install Event: Cache the app shell.
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching app shell');
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate Event: Clean up old caches.
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Use a "Network falling back to cache" strategy.
self.addEventListener('fetch', (event) => {
  // We only want to apply this strategy to page navigations (e.g., loading the app).
  // Other assets like images and API calls will just pass through.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        // If the network request fails (e.g., user is offline),
        // serve the cached index.html page.
        return caches.match('/');
      })
    );
  }
});


// --- PUSH NOTIFICATION EVENTS ---

self.addEventListener('push', (event) => {
  console.log('Service Worker: Push event received!', event.data.text());
  const data = event.data.json();
  const title = data.title || "A new message";
  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.icon,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
