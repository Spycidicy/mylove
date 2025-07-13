// A name for the cache storage. Incrementing this version number will
// force the browser to install the new service worker.
const CACHE_NAME = 'my-love-lauren-cache-v2';

// List of files to cache when the service worker is installed.
const urlsToCache = [
  '/',
  '/index.html',
  '/favicon.svg',
];

// --- SERVICE WORKER EVENTS ---

// 1. Install Event: Fired when the service worker is first installed.
self.addEventListener('install', (event) => {
  // self.skipWaiting() forces the waiting service worker to become the
  // active service worker. This ensures the new worker is used immediately.
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        // Add all the specified files to the cache.
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. Fetch Event: Fired every time the app requests a resource.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        return response || fetch(event.request);
      })
  );
});

// 3. Activate Event: Fired when the service worker is activated.
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
    }).then(() => {
      // self.clients.claim() makes the new service worker take control of all
      // open pages immediately.
      return self.clients.claim();
    })
  );
});

// --- PUSH NOTIFICATION EVENT ---
// 4. Push Event: Fired when a push message is received.
self.addEventListener('push', (event) => {
  // Extract the notification data from the push message.
  const data = event.data.json();
  
  const title = data.title || "A new message";
  const options = {
    body: data.body,
    icon: data.icon, // The icon for the notification
    badge: data.icon, // The small icon that appears in the status bar (on Android)
  };

  // Show the notification.
  event.waitUntil(self.registration.showNotification(title, options));
});

// 5. Notification Click Event: Fired when the user clicks on the notification.
self.addEventListener('notificationclick', (event) => {
  // Close the notification.
  event.notification.close();

  // Open the website when the notification is clicked.
  event.waitUntil(
    clients.openWindow('/')
  );
});
