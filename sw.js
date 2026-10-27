/* ==========================================================
   小日子 Service Worker
   策略：网络优先 + 长超时（iOS 走 Cloudflare 首字节常 2-4 秒，
        原来的 1.5 秒会一直超时 → 永远吃旧缓存，更新不生效）
   改代码 → VERSION 变 → 浏览器装新 SW → 页面自动刷新一次
   ========================================================== */
const VERSION = 'v3.0.4';
const CACHE = 'xiaorizi-' + VERSION;

/* 断网/弱网兜底用的最小集合 */
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

/* 页面导航走完整网络（12 秒兜底）；其他资源 9 秒 */
const T_NAV = 12000;
const T_ASSET = 9000;

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const c = await caches.open(CACHE);
    /* 逐个装，单个失败不影响整体 */
    await Promise.all(ASSETS.map((u) => c.add(new Request(u, { cache: 'reload' })).catch(() => { })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', (e) => {
  const d = e.data || {};
  if (d.type === 'SKIP_WAITING') self.skipWaiting();
});

function timeout(ms) {
  return new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), ms));
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.endsWith('/sw.js')) return;

  const isNav = req.mode === 'navigate';

  e.respondWith((async () => {
    /* 网络优先：绕过 HTTP 缓存，内容一变立刻拿到 */
    const net = fetch(new Request(req, { cache: 'no-cache' })).then((res) => {
      if (res && res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => { });
      }
      return res;
    });

    try {
      return await Promise.race([net, timeout(isNav ? T_NAV : T_ASSET)]);
    } catch (err) {
      /* 超时或断网：能拿缓存就拿，没缓存就把网络请求的最终结果交给浏览器 */
      const hit = await caches.match(req, { ignoreSearch: true });
      if (hit && !isNav) return hit;
      try { return await net; } catch (e2) { }
      if (hit) return hit;
      if (isNav) {
        const idx = await caches.match('./index.html', { ignoreSearch: true });
        if (idx) return idx;
      }
      return new Response('离线了，先连上网再打开吧', {
        status: 503,
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      });
    }
  })());
});
