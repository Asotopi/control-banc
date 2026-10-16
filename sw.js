/* Modo sin conexiÃ³n: guarda los archivos de la app y los sirve aunque no haya Internet. */
const VERSION = 'controlbanc-v7';
const ARCHIVOS = ['./', 'index.html', 'logic.js', 'app.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png',
  'fonts/quicksand-latin-d8da43.woff2', 'fonts/quicksand-latin-ext-9d611e.woff2'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((claves) => Promise.all(claves.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Primero la copia guardada (rÃ¡pido y sin red); en segundo plano se actualiza para la prÃ³xima vez
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET' || new URL(e.request.url).origin !== location.origin) { return; }
  e.respondWith(
    caches.match(e.request).then((guardado) => {
      const red = fetch(e.request).then((resp) => {
        if (resp && resp.ok) { const copia = resp.clone(); caches.open(VERSION).then((c) => c.put(e.request, copia)); }
        return resp;
      }).catch(() => guardado);
      return guardado || red;
    })
  );
});
