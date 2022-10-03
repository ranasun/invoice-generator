// Cache files

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('invoice-generator').then((cache) => cache.addAll([
      './index.html',
      './pwa.js',
      './sw.js',
      './site.webmanifest',
      './images/android-chrome-192x192.png',
      './images/apple-touch-icon.png',
      './images/favicon-32x32.png',
      './images/android-chrome-512x512.png',
      './images/favicon-16x16.png',
      './images/favicon.ico'
    ])),
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request)),
  );
});