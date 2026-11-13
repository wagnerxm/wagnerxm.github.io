/* Service worker do AVISO (wagnerxm.github.io/kmcheck) — substitui o do app antigo.
   O PWA antigo procura atualização do sw.js sozinho e recebe este: ele guarda a página do aviso para abrir sem
   internet e apaga os caches do app antigo (rodovias, manual: só ocupavam espaço). NÃO mexe nas fotos: elas ficam no
   banco "kmcheck" do navegador, que a página do aviso lê para exportar.
   Só responde pelos arquivos do aviso; o resto deste endereço (ex.: /kmcheck/controlmed/) passa direto. */
const CACHE = 'kmcheck-aviso-v1';
const ARQ = ['./', 'index.html', 'logo-kmcheck.png', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png', 'fundo.webp', 'manifest.v143.webmanifest'];
const BASE = new URL('./', self.location).pathname;           // /kmcheck/
const MEUS = new Set(ARQ.map(a => new URL(a, self.location).pathname));

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQ.map(u => new Request(u, { cache: 'reload' })))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    /* caches do app antigo (kmcheck-vNNN, kmcheck-dl, kmcheck-manual); os de outros apps deste endereço ficam */
    for (const k of await caches.keys()) if (k.startsWith('kmcheck-') && k !== CACHE) await caches.delete(k);
    await self.clients.claim();
    /* quem estava com o app antigo aberto passa a ver o aviso */
    for (const c of await self.clients.matchAll({ type: 'window' })) {
      const p = new URL(c.url).pathname;
      if (p === BASE || p === BASE + 'index.html') c.navigate(c.url).catch(() => {});
    }
  })());
});
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== self.location.origin) return;
  const p = e.request.mode === 'navigate' && u.pathname === BASE ? BASE : u.pathname;
  if (!MEUS.has(p)) return;   // não é do aviso: deixa o navegador buscar normalmente
  /* rede primeiro (até 4 s), depois o guardado: sem internet o aviso e as fotos continuam acessíveis */
  e.respondWith((async () => {
    const c = await caches.open(CACHE), chave = p === BASE ? BASE : e.request;
    try {
      const r = await Promise.race([fetch(e.request), new Promise((_, rej) => setTimeout(() => rej(new Error('lento')), 4000))]);
      if (r && r.ok) c.put(chave, r.clone());
      return r;
    } catch (err) {
      return (await c.match(chave)) || (await c.match(BASE + 'index.html')) || Response.error();
    }
  })());
});
