/**
 * Service Worker for LLM UI PWA
 * Caches the app shell for offline use.
 * API calls are always forwarded to the network (never cached).
 */

const CACHE_NAME = 'llm-ui-v1';

const SHELL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
];

/* ── Install: pre-cache app shell ──────────────────────────── */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  );
  // Activate immediately instead of waiting for old tabs to close
  self.skipWaiting();
});

/* ── Activate: clean old caches ────────────────────────────── */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  // Start controlling all open clients immediately
  self.clients.claim();
});

/* ── Fetch: network-first with cache fallback ──────────────── */
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Never cache API calls or external requests
  if (
    request.method !== 'GET' ||
    request.url.includes('/v1/') ||
    request.url.includes('/api/') ||
    !request.url.startsWith(self.location.origin)
  ) {
    return; // let the browser handle it normally
  }

  // For fonts & external CDN assets, use cache-first
  if (request.url.includes('fonts.googleapis.com') || request.url.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(request).then((cached) =>
        cached || fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
      )
    );
    return;
  }

  // App shell: network-first, fallback to cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache a fresh copy
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      })
      .catch(() => caches.match(request))
  );
});
