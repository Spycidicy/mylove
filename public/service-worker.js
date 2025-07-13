// A name for the cache storage
const CACHE_NAME = 'my-love-lauren-cache-v1';

// List of files to cache when the service worker is installed.
// This is the "app shell" - the minimal files needed for the app to run.
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.svg',
  // You may need to add paths to your main CSS and JS files once you build the project.
  // For example: '/css/app.css', '/js/app.js'
];

// --- SERVICE WORKER EVENTS ---

// 1. Install Event: Fired when the service worker is first installed.
self.addEventListener('install', (event) => {
  // waitUntil() ensures that the service worker will not install until the
  // code inside it has successfully completed.
  event.waitUntil(
    // Open a cache by name.
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Add all the specified files to the cache.
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. Fetch Event: Fired every time the app requests a resource (e.g., an image, a script).
self.addEventListener('fetch', (event) => {
  event.respondWith(
    // caches.match() looks for a matching request in the cache.
    caches.match(event.request)
      .then((response) => {
        // If a matching response is found in the cache, return it.
        if (response) {
          return response;
        }
        // If the request is not in the cache, fetch it from the network.
        return fetch(event.request);
      })
  );
});

// 3. Activate Event: Fired when the service worker is activated.
// This is a good place to clean up old caches.
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // If a cache is not in our whitelist, delete it.
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
