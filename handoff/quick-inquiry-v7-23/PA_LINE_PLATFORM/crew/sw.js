// PA LINE beta cache cleanup worker
// Caching is intentionally disabled so new builds cannot be hidden by an old cache.
self.addEventListener("install", event => {
  self.skipWaiting();
});
self.addEventListener("activate", event => {
  event.waitUntil(
    Promise.all([
      self.registration.unregister(),
      caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith("pa-line-crew")).map(k => caches.delete(k))))
    ]).then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", () => {});
