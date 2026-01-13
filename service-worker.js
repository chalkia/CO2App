// 1. Εισαγωγή της μεταβλητής έκδοσης (APP_BUILD)
importScripts('./js/version.js');

// Δημιουργία ονόματος Cache με βάση το Build Number από το version.js
const CACHE_KEY = (typeof APP_BUILD !== 'undefined') ? APP_BUILD : 'v_init';
const CACHE_NAME = 'co2app-cache-' + CACHE_KEY;

// 2. Λίστα αρχείων για άμεση αποθήκευση (Precache)
// ΠΡΟΣΟΧΗ: Όλα τα αρχεία πρέπει να υπάρχουν τοπικά!
const PRECACHE = [
  "./",
  "./index.html",
  "./styles.css",
  "./manifest.webmanifest",
  "./js/version.js",       // Απαραίτητο για το update system
  
  // Scripts
  "./js/common.js",
  "./js/menu.js",
  "./js/footprint.js",
  "./js/dashboard.js",
  "./js/quiz.js",          // Αν υπάρχει
  
  // Pages
  "./pages/footprint.html",
  "./pages/dashboard.html",
  "./pages/model.html",    // Η νέα τεκμηρίωση
  "./pages/info.html",     // Το νέο About
  "./pages/quiz.html",
  "./pages/install.html",
  
  // Config & Data
  "./config.json",
  "./assets/footprintModel_final_draft.json",
  "./assets/questions/quiz2.json", // Αν υπάρχει

  // Images & Icons
  "./assets/logo.png",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/ui/homeN.png",
  "./assets/ui/busN.png",
  "./assets/ui/bookN.png",
  "./assets/ui/FoodLifestyleN.png",
  "./assets/ui/co2N.png",
  "./assets/ui/quizN.png",
  "./assets/ui/infoN.png",
  "./assets/ui/lang_en.png",
  "./assets/ui/lang_el.png",

  // Fonts (Τοπικά)
  "./assets/fonts/Comfortaa-SemiBold.ttf",
  "./assets/fonts/Comfortaa-Bold.ttf",

  // Βιβλιοθήκες (ΟΛΕΣ ΤΟΠΙΚΑ - NO CDN)
  "./assets/vendor/echarts.min.js",
  "./assets/vendor/html2canvas.min.js",
  "./assets/vendor/jspdf.umd.min.js"
];

// 3. Εγκατάσταση (Install)
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Προσθήκη όλων των αρχείων. Αν λείπει έστω και ένα, το install αποτυγχάνει.
      // Χρησιμοποιούμε catch για να δούμε στο log ποιο αρχείο λείπει αν υπάρξει θέμα.
      return cache.addAll(PRECACHE).catch(err => {
        console.error("CRITICAL: Failed to cache some files. Check paths.", err);
      });
    })
  );
  // ΔΕΝ κάνουμε skipWaiting() αυτόματα. Περιμένουμε τον χρήστη να πατήσει "Ανανέωση".
});

// 4. Ενεργοποίηση (Activate) - Καθαρισμός παλιών Cache
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => {
        // Διαγράφουμε οποιαδήποτε cache ξεκινάει με 'co2app-cache-' αλλά δεν είναι η τρέχουσα
        if (key.startsWith('co2app-cache-') && key !== CACHE_NAME) {
          console.log('[SW] Deleting old cache:', key);
          return caches.delete(key);
        }
      })
    ))
  );
  self.clients.claim();
});

// 5. Διαχείριση Μηνυμάτων (Για το κουμπί "Ανανέωση" στο index.html)
self.addEventListener('message', (event) => {
  if (event.data && event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
});

// 6. Διαχείριση Αιτημάτων (Fetch Strategy)
self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Αγνοούμε αιτήματα που δεν είναι GET ή δεν είναι http (π.χ. chrome-extension)
  if (req.method !== 'GET' || !req.url.startsWith('http')) return;

  // Στρατηγική: Network First για JSON και version.js (για να βλέπουμε αλλαγές)
  // Αν αποτύχει το δίκτυο, πέφτουμε στη μνήμη.
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

  // Στρατηγική: Cache First για όλα τα υπόλοιπα (Εικόνες, CSS, JS, Fonts)
  // Αυτό είναι το πιο γρήγορο και ασφαλές για Offline apps.
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      
      // Αν δεν υπάρχει στη μνήμη, το ζητάμε από δίκτυο
      return fetch(req).then((resp) => {
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(req, resp.clone());
          return resp;
        });
      }).catch(() => {
        // Αν είμαστε offline και δεν υπάρχει στη μνήμη:
        // Αν ο χρήστης προσπαθεί να πάει σε νέα σελίδα, γύρνα τον στο index
        if (req.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
