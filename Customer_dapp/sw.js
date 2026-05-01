const CACHE='skoop-v3';
const ASSETS=[
  './',
  './index.html',
  './manifest.json',
  './KOKOS_SKOOP.png',
  './KOKOS.png',
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
  const url=e.request.url;
  if(url.includes('mainnet.base.org')||
     url.includes('walletconnect')||
     url.includes('coinbase.com')||
     url.includes('geckoterminal')||
     url.includes('walletlink')||
     url.includes('fonts.gstatic.com')||
     url.includes('fonts.googleapis.com')){
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached=>{
      if(cached)return cached;
      return fetch(e.request).then(res=>{
        if(e.request.method==='GET'&&res.status===200){
          const clone=res.clone();
          caches.open(CACHE).then(c=>c.put(e.request,clone));
        }
        return res;
      }).catch(()=>caches.match('./index.html'));
    })
  );
});
