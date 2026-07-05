const CACHE_NAME = "smartquiz-shell-v2";
const RUNTIME_CACHE = "smartquiz-runtime-v2";
const APP_SHELL = ["/", "/index.html", "/manifest.webmanifest", "/favicon.svg"];
const MAX_RUNTIME_ITEMS = 80;

const trimRuntimeCache = async () => {
  const cache = await caches.open(RUNTIME_CACHE);
  const keys = await cache.keys();
  if (keys.length <= MAX_RUNTIME_ITEMS) return;
  await cache.delete(keys[0]);
  await trimRuntimeCache();
};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys
        .filter((key) => ![CACHE_NAME, RUNTIME_CACHE].includes(key))
        .map((key) => caches.delete(key))
    ))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(event.request, copy);
              trimRuntimeCache();
            });
          }
          return response;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});
