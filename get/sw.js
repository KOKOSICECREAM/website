// Minimal service worker for the /get/ install page.
//
// It exists mainly so this page is service-worker-controlled, which is part of
// Chrome's installability criteria for firing `beforeinstallprompt` (the one-tap
// Android install). It deliberately does NOT touch /Customer_dapp/ — that app has
// its own service worker at /Customer_dapp/sw.js with its own cache and update
// policy, and its narrower scope wins for those URLs.
//
// Network-first: this page is print-linked from a QR, so a stale copy could outlive
// the sticker it came from. Cache is only a fallback for a dead connection.
const CACHE = 'kokos-get-v1';
const ASSETS = ['./', './index.html', './KOKOS_dapp_QR.svg'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.all(ASSETS.map(a => c.add(a).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  // Only ever answer for our own scope; let everything else go straight to the network.
  if (!req.url.startsWith(self.registration.scope)) return;

  e.respondWith(
    fetch(req)
      .then(res => {
        if (res && res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(req, clone));
        }
        return res;
      })
      .catch(() => caches.match(req).then(hit => hit || caches.match('./index.html')))
  );
});
