// Finanças da Casa — service worker
// Ao publicar uma versão nova, troque o número abaixo: o app detecta e recarrega sozinho.
const VERSAO = 'financas-casa-v7';
const ARQUIVOS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './palavra.json'];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(VERSAO).then(c => c.addAll(ARQUIVOS)).catch(() => {}));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== VERSAO).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Network-first: sempre tenta a versão mais nova; o cache só entra quando está offline.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // a API da planilha nunca passa pelo cache
  if (url.hostname.includes('script.google') || url.hostname.includes('googleusercontent')) return;
  const cacheavel = url.origin === self.location.origin || url.hostname === 'cdnjs.cloudflare.com';
  if (!cacheavel) return;

  e.respondWith(
    fetch(req)
      .then(res => {
        if (res.ok) {
          const copia = res.clone();
          caches.open(VERSAO).then(c => c.put(req, copia));
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true })
        .then(r => r || (req.mode === 'navigate' ? caches.match('./index.html') : Response.error())))
  );
});
