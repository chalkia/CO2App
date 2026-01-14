// 1. Εισαγωγή της μεταβλητής έκδοσης (APP_BUILD)
importScripts('./js/version.js');

const CACHE_KEY = (typeof APP_BUILD !== 'undefined') ? APP_BUILD : 'v_init';
const CACHE_NAME = 'co2app-cache-' + CACHE_KEY;

// 2. Precache List
const PRECACHE = [
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.webmanifest",
  "./js/version.js",
  
  // Scripts
  "./js/common.js",
  "./js/menu.js",
  "./js/footprint.js",
  "./js/dashboard.js",
  "./js/quiz.js",
  "./js/settings.js",
  
  // Pages
  "./pages/footprint.html",
  "./pages/dashboard.html",
  "./pages/model.html",
  "./pages/info.html",
  "./pages/quiz.html",
  "./pages/install.html",
  "./pages/settings.html",
  "./pages/values.html",
  
  // Config & Data (ΔΙΟΡΘΩΜΕΝΟ PATH)
  "./config.json",
  "./assets/vendor/footprintModel_final_draft.json",

  // Images & Icons
  "./assets/logo.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/ui/homeN.png",
  "./assets/ui/co2N.png",
  "./assets/ui/quizN.png",
  "./assets/ui/bookN.png",
  "./assets/ui/infoN.png",
  "./assets/ui/settingsN.png", // Νέο εικονίδιο
  "./assets/ui/installN.png",  // Νέο εικονίδιο
  "./assets/ui/lang_en.png",
  "./assets/ui/lang_el.png",

  // Fonts
  "./assets/fonts/Comfortaa-SemiBold.ttf",
  "./assets/fonts/Comfortaa-Bold.ttf",

  // Βιβλιοθήκες
  "./assets/vendor/echarts.min.js",
  "./assets/vendor/html2canvas.min.js",
  "./assets/vendor/jspdf.umd.min.js"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE).catch(err => {
        console.error("CRITICAL: Failed to cache some files.", err);
      });
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        if (key.startsWith('co2app-cache-') && key !== CACHE_NAME) {
          return caches.delete(key);
        }
      })
    ))
  );
  self.clients.claim();
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== 'GET' || !req.url.startsWith('http')) return;

  if (req.url.includes('version.js') || req.url.includes('.json')) {
    event.respondWith(
      fetch(req).then(networkResp => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(req, networkResp.clone());
          return networkResp;
        });
      }).catch(() => caches.match(req))
    );
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((resp) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(req, resp.clone());
          return resp;
        });
      }).catch(() => {
        if (req.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
