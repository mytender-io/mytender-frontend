// Service Worker for MyTender.io PWA
const CACHE_NAME = 'mytender-cache-v2';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/images/mytender.io_badge.png',
  '/images/mytender.io_badge_notification.png'
  // Note: Removed /index.html from here - we'll handle it specially
];

// Install the service worker and cache the static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Activate the service worker and clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Listen for skip waiting message
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Intercept fetch requests and serve from cache if available
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // For index.html or requests with cache-busting parameters, always fetch from network
  if (url.pathname === '/index.html' || 
      url.pathname === '/' || 
      url.search.includes('t=') || 
      request.cache === 'no-store' ||
      request.headers.get('cache-control') === 'no-cache') {
    event.respondWith(
      fetch(request).catch(() => {
        // If network fails, try to return cached version
        return caches.match(request);
      })
    );
    return;
  }
  
  // For other requests, use cache-first strategy
  event.respondWith(
    caches.match(request)
      .then((response) => {
        // Cache hit - return the response from cache
        if (response) {
          return response;
        }
        
        // Clone the request because it's a one-time use stream
        const fetchRequest = request.clone();
        
        return fetch(fetchRequest).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Don't cache responses that shouldn't be cached
          const shouldCache = !url.pathname.includes('/api/') && 
                            !url.pathname.includes('.json') &&
                            !url.hostname.includes('localhost');
          
          if (shouldCache) {
            // Clone the response because it's a one-time use stream
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(request, responseToCache);
              });
          }
          
          return response;
        });
      })
  );
}); 