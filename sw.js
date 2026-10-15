/* Sarah's To-do service worker: keeps the app working offline, and shows notifications if they're turned on. No tracking. (The shared list itself goes straight to the relay, not through here.) */
const VERSION = '1.9.1';
const CACHE = 'sarahs-todo-' + VERSION;
const SHELL = ['./', 'index.html', 'app.js', 'core.js', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/maskable-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-32.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('sarahs-todo-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Network first (so updates arrive), cached copy when offline.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(fetch(req).then(res => {
    if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return res;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || (req.mode === 'navigate' ? caches.match('index.html') : undefined))));
});

// Notifications (only if turned on in the app)
self.addEventListener('push', e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (err) { d = { body: e.data ? e.data.text() : '' }; }
  e.waitUntil(self.registration.showNotification(d.title || 'Sarah’s To-do', { body: d.body || '', tag: d.tag || 'note', icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', data: { url: d.url || './' } }));
});
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of all) if (c.url.startsWith(self.registration.scope)) return c.focus();
    return self.clients.openWindow(self.registration.scope);
  })());
});
// The phone occasionally renews its push address: pass the new one on quietly
const SUN_BASE = 'https://due-dates-calendar-relay.phoneapp12.workers.dev/sunshine/';
const SHARED_KEY = 'sArgfZGJrHxJN9I319FJeFLhFshrHsRU2xDFnnLL';
const VAPID_PUBLIC = 'BEsNn0TcOiNQqSE7AbDFgYGL_v45EEm-mma2_6DtecoG5c7ZvwZ7lKpAXOQry7cqfvWM0JTjtPPdK93arc0VXMU';
self.addEventListener('pushsubscriptionchange', e => {
  e.waitUntil((async () => {
    const key = Uint8Array.from(atob(VAPID_PUBLIC.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - VAPID_PUBLIC.length % 4) % 4)), c => c.charCodeAt(0));
    const sub = e.newSubscription || await self.registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
    await fetch(SUN_BASE + 'subscribe', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: SHARED_KEY, subscription: sub.toJSON(), quiet: true, previous: e.oldSubscription ? e.oldSubscription.endpoint : undefined }) });
  })().catch(() => { }));
});
