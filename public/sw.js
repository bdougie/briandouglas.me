// Service Worker for Offline Support and Image Caching
const CACHE_NAME = 'briandouglas-a4049e1';
const IMAGE_CACHE_NAME = 'briandouglas-images-a4049e1';
const CLOUDINARY_ORIGIN = 'https://res.cloudinary.com';

// Cache start_url for PWA offline support (version auto-updates each deploy)
// Other HTML pages use network-first without pre-caching
const CRITICAL_RESOURCES = [
  '/',
  '/manifest.json',
  '/images/favicon.svg',
  '/images/favicon.png',
  '/images/apple-touch-icon.png',
  '/images/icon-192x192.png',
  '/images/icon-512x512.png'
];

// Install event - cache critical resources
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching critical resources');
      return cache.addAll(CRITICAL_RESOURCES);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE_NAME && cacheName.includes('briandouglas')) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - handle requests with caching strategy
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle navigation requests (pages) - Network First strategy
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).then(response => {
        // Don't cache HTML pages - always fetch fresh
        return response;
      }).catch(() => {
        // Fallback to cached version only when offline
        return caches.match(request).then(cachedResponse => {
          if (cachedResponse) {
            console.log('Serving cached page (offline):', request.url);
            return cachedResponse;
          }
          // Ultimate fallback to cached home page
          return caches.match('/');
        });
      })
    );
    return;
  }
  
  // Handle image requests
  if (isImageRequest(request)) {
    const cacheToUse = url.origin === CLOUDINARY_ORIGIN ? IMAGE_CACHE_NAME : IMAGE_CACHE_NAME;
    
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        if (cachedResponse) {
          // Serve from cache and update in background for external images
          if (url.origin === CLOUDINARY_ORIGIN) {
            fetchAndCacheImage(request);
          }
          return cachedResponse;
        }
        
        return fetchAndCacheImage(request);
      })
    );
    return;
  }
  
  // Handle other static resources (CSS, JS, etc.)
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        return cachedResponse || fetch(request).then(response => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(request, responseClone);
            });
          }
          return response;
        });
      })
    );
  }
});

// Helper function to check if request is for an image
function isImageRequest(request) {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif', '.svg'];
  const url = new URL(request.url);
  
  return (
    request.destination === 'image' ||
    imageExtensions.some(ext => url.pathname.toLowerCase().includes(ext)) ||
    url.origin === CLOUDINARY_ORIGIN
  );
}

// Helper function to check if path is an image path
function isImagePath(pathname) {
  return (
    pathname.startsWith('/images/') ||
    pathname.startsWith('/gifs/') ||
    pathname.includes('.jpg') ||
    pathname.includes('.jpeg') ||
    pathname.includes('.png') ||
    pathname.includes('.gif') ||
    pathname.includes('.webp') ||
    pathname.includes('.avif') ||
    pathname.includes('.svg')
  );
}

// Fetch and cache helper function for images
async function fetchAndCacheImage(request) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(IMAGE_CACHE_NAME);
      // Clone the response before caching
      cache.put(request, response.clone());
      console.log('Cached image:', request.url);
    }
    
    return response;
  } catch (error) {
    console.error('Failed to fetch and cache image:', request.url, error);
    
    // Try to serve from cache as fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline fallback or error response
    throw error;
  }
}