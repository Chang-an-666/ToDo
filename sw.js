/* ==========================================================
   小日子 Service Worker
   策略：网络优先（保证永远是新版），1.5 秒超时或断网时回落到缓存
   改了代码 → 这里 VERSION 变 → 浏览器装新 SW → 下次打开就是新版
   ========================================================== */
const VERSION = 'v3.0.1';
const CACHE = 'xiaorizi-' + VERSION;

const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './js/zip.js',
  './js/backup.js',
  './js/migrate.js',
  './manifest.webmanifest',
  './icons/icon-32.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(ASSETS).catch(() => { }))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

const timeout = (ms) => new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms));

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.endsWith('/sw.js')) return;

  e.respondWith((async () => {
    const net = fetch(req).then((res) => {
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => { });
      }
      return res;
    });

    try {
      return await Promise.race([net, timeout(1500)]);
    } catch (err) {
      const hit = await caches.match(req);
      if (hit) return hit;
      try { return await net; } catch (e2) { }
      if (req.mode === 'navigate') {
        const idx = await caches.match('./index.html');
        if (idx) return idx;
      }
      return new Response('离线了，先连上网再打开吧', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }
  })());
});
