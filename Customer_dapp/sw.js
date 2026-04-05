const CACHE='skoop-v1';
const ASSETS=[
  './',
  './index.html',
  './manifest.json',
  './KOKOS_SKOOP.png',
  './KOKOS.png',
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,opsz,wght@0,6..36,400;0,6..36,600;1,6..36,400;1,6..36,600&family=Instrument+Sans:wght@400;500;600&display=swap',
  'https://cdn.jsdelivr.net/npm/ethers@6.13.4/dist/ethers.umd.min.js',
  'https://cdn.jsdelivr.net/npm/html5-qrcode@2.3.8/html5-qrcode.min.js',
  'https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js',
  'https://cdn.jsdelivr.net/npm/@walletconnect/modal@2.6.2/dist/index.umd.js',
  'https://cdn.jsdelivr.net/npm/@walletconnect/ethereum-provider@2.10.0/dist/index.umd.js',
];

self.addEventListener('install',e=>{
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys().then(keys=>Promise.all(
      keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))
    )).then(()=>self.clients.claim())
  );
});

self.addEventListener('fetch',e=>{
  // Never intercept RPC calls, wallet connections, or price APIs — always live
  const url=e.request.url;
  if(url.includes('mainnet.base.org')||
     url.includes('walletconnect')||
     url.includes('coinbase.com')||
     url.includes('geckoterminal')||
     url.includes('walletlink')){
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached=>{
      if(cached)return cached;
      return fetch(e.request).then(res=>{
        // Cache successful GET responses for static assets
        if(e.request.method==='GET'&&res.status===200){
          const clone=res.clone();
          caches.open(CACHE).then(c=>c.put(e.request,clone));
        }
        return res;
      }).catch(()=>caches.match('./index.html'));
    })
  );
});
