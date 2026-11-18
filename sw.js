const CACHE = "ry-guide-50b724db04";
const PRECACHE = ["./", "index.html", "manifest.webmanifest", "apple-touch-icon.png", "icon-192.png", "data.json", "icon.png", "mon.png", "item.png", "trainer.png"];
self.addEventListener("install", e => {
  // cache: "reload" fetches each file from the network, so a stale copy in the browser's HTTP cache isn't stored.
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(PRECACHE.map(u => new Request(u, { cache: "reload" }))))
    .then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith("ry-guide-") && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  const font = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (url.origin !== location.origin && !font) return;
  e.respondWith(caches.match(e.request, { ignoreSearch: !font }).then(hit => hit || fetch(e.request).then(res => {
    if (res.ok || res.type === "opaque") { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
    return res;
  }).catch(err => {
    // Offline: a page load gets the guide's page; anything else fails as it would without the worker.
    if (e.request.mode === "navigate") return caches.match("index.html");
    throw err;
  })));
});
