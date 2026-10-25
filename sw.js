// Garde l'application disponible sans Internet.
const CACHE = "cap-bts-cg-v2";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "icon-maskable-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  // Page : on essaie Internet d'abord (pour recevoir les mises à jour), sinon la copie gardée.
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(k => k.put("index.html", c)); return r; })
      .catch(() => caches.match("index.html")));
    return;
  }
  // Polices et fichiers : copie gardée d'abord, sinon Internet (et on garde une copie).
  e.respondWith(caches.match(e.request).then(hit => hit || fetch(e.request).then(r => {
    if (r.ok || r.type === "opaque") { const c = r.clone(); caches.open(CACHE).then(k => k.put(e.request, c)); }
    return r;
  })));
});
