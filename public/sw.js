// Service Worker — Maleta App
// Versión: se actualiza automáticamente en cada deploy
const CACHE_VERSION = "maleta-v1";
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const IMG_CACHE = `${CACHE_VERSION}-images`;

// Recursos estáticos a cachear en la instalación
const PRECACHE_URLS = [
  "/",
  "/offline",
  "/manifest.webmanifest",
];

// ── Install: precachear recursos estáticos ──────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) =>
      cache.addAll(PRECACHE_URLS).catch(() => {
        // Si algún recurso falla, continuar igualmente
      })
    ).then(() => self.skipWaiting())
  );
});

// ── Activate: limpiar cachés antiguas ──────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k.startsWith("maleta-") && k !== STATIC_CACHE && k !== IMG_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ── Fetch: estrategias por tipo de recurso ─────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo peticiones same-origin
  if (url.origin !== self.location.origin) return;

  // Fotos de prendas: cache-first con revalidación en background
  if (url.pathname.startsWith("/api/photos/")) {
    event.respondWith(cacheFirstWithRefresh(request, IMG_CACHE));
    return;
  }

  // Recursos de Next.js (_next/static): cache-first (inmutables)
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // Páginas de navegación: network-first con fallback offline
  if (request.mode === "navigate") {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }

  // Resto: network-only (APIs, mutaciones)
});

async function cacheFirst(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(cacheName);
    cache.put(request, response.clone());
  }
  return response;
}

async function cacheFirstWithRefresh(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  }).catch(() => cached);
  return cached ?? fetchPromise;
}

async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Fallback offline
    const offline = await caches.match("/offline");
    return offline ?? new Response("Sin conexión", { status: 503 });
  }
}
