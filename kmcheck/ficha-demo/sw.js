/* O app deste endereço mudou de lugar. O PWA antigo procura atualização do sw.js e recebe este: ele se desliga e
   recarrega a página, que leva ao endereço novo. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  await self.registration.unregister();
  for (const c of await self.clients.matchAll({ type: 'window' })) c.navigate(c.url).catch(() => {});
})()));
