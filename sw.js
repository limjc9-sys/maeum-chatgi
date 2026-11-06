/*
  인터넷 없이도 열리게 해 주는 파일 (service worker)
  - 인터넷이 될 때: 늘 새 파일을 받아 오고, 받은 파일을 휴대폰에 복사해 둬요.
    그래서 data 폴더의 문장을 고치면 다음에 열 때 바로 바뀐 문장이 보여요.
  - 인터넷이 안 될 때: 복사해 둔 파일로 열어요.
  새 파일을 추가했다면 아래 FILES 목록에도 적어 주세요.
*/
var CACHE = 'maeum-chatgi-v1';
var FILES = [
  './',
  './index.html',
  './css/style.css',
  './js/app.js',
  './data/emotions.js',
  './data/needs.js',
  './data/questions.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './icons/favicon-64.png'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) { return cache.addAll(FILES); }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(req, { cache: 'no-cache' }).then(function (res) {
      if (res && res.ok) {
        var copy = res.clone();
        caches.open(CACHE).then(function (cache) { cache.put(req, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(req, { ignoreSearch: true }).then(function (hit) {
        if (hit) return hit;
        if (req.mode === 'navigate') return caches.match('./index.html');
        return new Response('', { status: 504, statusText: 'offline' });
      });
    })
  );
});
