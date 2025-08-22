// Service Worker for Image Caching
const CACHE_NAME = 'briandouglas-images-v1';
const CLOUDINARY_ORIGIN = 'https://res.cloudinary.com';

// Preload critical images
const CRITICAL_IMAGES = [
  '/images/favicon.svg',
  '/images/favicon.png',
  '/images/apple-touch-icon.png'
];

// Install event - cache critical images
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching critical images');
      return cache.addAll(CRITICAL_IMAGES);
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
          if (cacheName !== CACHE_NAME && cacheName.includes('briandouglas-images')) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - handle image requests with caching strategy
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Only handle image requests
  if (!isImageRequest(request)) {
    return;
  }
  
  // Handle Cloudinary images with cache-first strategy
  if (url.origin === CLOUDINARY_ORIGIN) {
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        if (cachedResponse) {
          // Serve from cache and update in background
          fetchAndCache(request);
          return cachedResponse;
        }
        
        // Fetch and cache
        return fetchAndCache(request);
      })
    );
    return;
  }
  
  // Handle local images with cache-first strategy
  if (url.origin === self.location.origin && isImagePath(url.pathname)) {
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetchAndCache(request);
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

// Fetch and cache helper function
async function fetchAndCache(request) {
  try {
    const response = await fetch(request);
    
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
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