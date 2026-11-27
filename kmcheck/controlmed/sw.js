/* O ControlCheck mudou para /controlcheck/ (26/11/2026). Este service worker substitui o antigo neste endereço:
   apaga o que ele guardou, se desinstala e leva as abas abertas para o endereço novo. */
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil((async () => {
  for (const k of await caches.keys()) await caches.delete(k);
  await self.registration.unregister();
  for (const c of await self.clients.matchAll({ type: 'window' })) c.navigate('/controlcheck/');
})()));
