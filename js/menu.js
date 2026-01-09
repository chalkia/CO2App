// CO2App Drawer Menu (stable, bilingual, supports / and /pages/)
// Navigation mapping (EL/EN):
// - Υπολογιστής CO2 (Footprint) -> footprint.html
// - Τεκμηρίωση (Documentation)  -> CO2App_Model_v4.html (bilingual page)
// - Πληροφορίες (Info)          -> about.html (bilingual page)

function isPagesDir() {
  return location.pathname.includes("/pages/");
}

function isStandaloneMode() {
  try {
    return (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
           (window.navigator && window.navigator.standalone === true);
  } catch (e) {
    return false;
  }
}

// If common.js already defines these, keeping them here is harmless.
function getLang() { return localStorage.getItem("lang") || "el"; }
function setLang(l) { localStorage.setItem("lang", l); }

function openDrawer() {
  const d = document.getElementById("drawer");
  const b = document.getElementById("drawerBackdrop");
  if (!d || !b) return;
  d.classList.add("open");
  b.style.display = "block";
  d.setAttribute("aria-hidden", "false");
  b.setAttribute("aria-hidden", "false");
}

function closeDrawer() {
  const d = document.getElementById("drawer");
  const b = document.getElementById("drawerBackdrop");
  if (!d || !b) return;
  d.classList.remove("open");
  b.style.display = "none";
  d.setAttribute("aria-hidden", "true");
  b.setAttribute("aria-hidden", "true");
}

function pageName() {
  const p = location.pathname.split("/").pop();
  return p && p.length ? p : "index.html";
}

// Ensure drawer exists on pages that only provide a menu container
function ensureDrawerSkeleton() {
  if (document.getElementById("drawer") && document.getElementById("drawerBackdrop")) return;

  const backdrop = document.createElement("div");
  backdrop.className = "drawerBackdrop";
  backdrop.id = "drawerBackdrop";
  backdrop.setAttribute("aria-hidden", "true");
  backdrop.style.display = "none";

  const nav = document.createElement("nav");
  nav.className = "drawer";
  nav.id = "drawer";
  nav.setAttribute("aria-hidden", "true");

  // We keep nav FIRST and language LAST (as in your screenshot)
  nav.innerHTML = `
    <div class="drawerHeader">
      <div class="drawerTitle">CO2App</div>
      <button class="drawerClose" id="drawerClose" aria-label="close">×</button>
    </div>
    <div class="drawerNav" id="drawerNav"></div>
    <div class="drawerLang" id="drawerLang"></div>
  `;

  document.body.appendChild(backdrop);
  document.body.appendChild(nav);
}

function normalizeDrawerOrder() {
  const drawer = document.getElementById("drawer");
  const nav = document.getElementById("drawerNav");
  const lang = document.getElementById("drawerLang");
  if (!drawer || !nav || !lang) return;

  // Language toggle ALWAYS last
  drawer.appendChild(lang);
}

function docsHref(inPages) {
  return inPages ? "./CO2App_Model_v4.html" : "./pages/CO2App_Model_v4.html";
}

function aboutHref(inPages) {
  return inPages ? "./about.html" : "./pages/about.html";
}

function buildNav() {
  const nav = document.getElementById("drawerNav");
  if (!nav) return;

  const lang = getLang();
  const t = {
    el: {
      home: "Αρχική", quiz: "Quiz", foot: "Υπολογιστής CO₂",
      docs: "Τεκμηρίωση", about: "Πληροφορίες",
      install: "Εγκατάσταση σε κινητό", settings: "Ρυθμίσεις"
    },
    en: {
      home: "Home", quiz: "Quiz", foot: "Footprint",
      docs: "Documentation", about: "Info",
      install: "Install on phone", settings: "Settings"
    }
  }[lang];

  const here = pageName();
  const inPages = isPagesDir();
  const base = inPages ? "../" : "./";

  // YOUR required mapping:
  // footprint -> footprint.html
  const items = inPages ? [
    { label: t.home,     href: base + "index.html",        icon: "home" },
    { label: t.quiz,     href: "./quiz.html",              icon: "quiz" },
    { label: t.foot,     href: "./footprint.html",         icon: "co2"  },
    { label: t.docs,     href: docsHref(true),             icon: "docs" },
    { label: t.about,    href: aboutHref(true),            icon: "about"},
    { label: t.settings, href: "./settings.html",          icon: "settings" },
    { label: t.install,  href: "./install.html",           icon: "install" },
  ] : [
    { label: t.home,     href: "./index.html",             icon: "home" },
    { label: t.quiz,     href: "./pages/quiz.html",        icon: "quiz" },
    { label: t.foot,     href: "./pages/footprint.html",   icon: "co2"  },
    { label: t.docs,     href: docsHref(false),            icon: "docs" },
    { label: t.about,    href: aboutHref(false),           icon: "about"},
    { label: t.settings, href: "./pages/settings.html",    icon: "settings" },
    { label: t.install,  href: "./pages/install.html",     icon: "install" },
  ];

  nav.innerHTML = "";
  const standalone = isStandaloneMode();
  const visibleItems = standalone ? items.filter(x => x.icon !== "install") : items;

  visibleItems.forEach(it => {
    const div = document.createElement("div");
    div.className = "drawerItem";

    const target = it.href.split("/").pop();
    div.classList.toggle("active", here === target);

    const ic = document.createElement("span");
    ic.className = "drawerIcon";

    const iconBase = inPages ? "../assets/ui/" : "./assets/ui/";
    const img = document.createElement("img");
    img.alt = "";
    img.width = 26;
    img.height = 26;
    img.style.width = "26px";
    img.style.height = "26px";
    img.style.display = "block";
    img.style.objectFit = "contain";

    if (it.icon === "home") img.src = iconBase + "homeN.png";
    else if (it.icon === "co2") img.src = iconBase + "co2N.png";
    else if (it.icon === "quiz") img.src = iconBase + "quizN.png";
    else if (it.icon === "docs") img.src = iconBase + "bookN.png";
    else if (it.icon === "about") img.src = iconBase + "infoN.png";
    else if (it.icon === "settings") img.src = iconBase + "settingsN.png";
    else if (it.icon === "install") img.src = iconBase + "installN.png";
    else { img.remove(); ic.textContent = "•"; }

    if (img.parentNode !== ic) ic.appendChild(img);

    const tx = document.createElement("span");
    tx.className = "drawerText";
    tx.textContent = it.label;

    // quiz badge
    if (it.icon === "quiz") {
      try {
        const qs = localStorage.getItem("quizScore");
        const n = Number(qs);
        if (qs !== null && !Number.isNaN(n)) {
          const badge = document.createElement("span");
          badge.className = "quizBadge";
          badge.textContent = `${n}/100`;
          tx.appendChild(badge);
        }
      } catch (e) {}
    }

    div.appendChild(ic);
    div.appendChild(tx);

    div.addEventListener("click", () => {
      closeDrawer();
      location.href = it.href;
    });

    nav.appendChild(div);
  });
}

function buildLangToggle() {
  const wrap = document.getElementById("drawerLang");
  if (!wrap) return;

  const lang = getLang();
  const target = (lang === "el") ? "en" : "el";
  const label  = (lang === "el") ? "English" : "Ελληνικά";
  const icon   = (lang === "el") ? "lang_en.png" : "lang_el.png";

  wrap.innerHTML = "";

  const div = document.createElement("div");
  div.className = "drawerItem";
  div.setAttribute("data-lang-toggle", "1");

  const ic = document.createElement("span");
  ic.className = "drawerIcon";
  const img = document.createElement("img");
  img.src = (isPagesDir() ? "../assets/ui/" : "./assets/ui/") + icon;
  img.alt = "";
  img.width = 28;
  img.height = 28;
  img.style.width = "28px";
  img.style.height = "28px";
  img.style.display = "block";
  img.style.objectFit = "contain";
  ic.appendChild(img);

  const tx = document.createElement("span");
  tx.className = "drawerText";
  tx.textContent = label;

  div.appendChild(ic);
  div.appendChild(tx);

  div.addEventListener("click", () => {
    setLang(target);
    // If current page supports dynamic switching, apply without reload:
    try { if (typeof applyLang === "function") { applyLang(); return; } } catch(e) {}
    location.reload();
  });

  wrap.appendChild(div);
}

// Optional: for pages that use <div id="menuContainer"></div>
window.renderMenu = function(containerId){
  const host = document.getElementById(containerId);
  if (!host) return;

  if (!document.getElementById("menuBtn")){
    const btn = document.createElement("button");
    btn.className = "hamburger";
    btn.id = "menuBtn";
    btn.setAttribute("aria-label","menu");
    btn.textContent = "☰";
    host.appendChild(btn);
  }

  ensureDrawerSkeleton();
  normalizeDrawerOrder();
  buildNav();
  buildLangToggle();

  const menuBtn = document.getElementById("menuBtn") || document.getElementById("openDrawer");
  const closeBtn = document.getElementById("drawerClose") || document.getElementById("closeDrawer");
  const backdrop = document.getElementById("drawerBackdrop");

  if (menuBtn) menuBtn.addEventListener("click", openDrawer);
  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
  if (backdrop) backdrop.addEventListener("click", closeDrawer);
};

document.addEventListener("DOMContentLoaded", () => {
  ensureDrawerSkeleton();
  normalizeDrawerOrder();
  buildNav();
  buildLangToggle();

  const menuBtn = document.getElementById("menuBtn") || document.getElementById("openDrawer");
  const closeBtn = document.getElementById("drawerClose") || document.getElementById("closeDrawer");
  const backdrop = document.getElementById("drawerBackdrop");

  if (menuBtn) menuBtn.addEventListener("click", openDrawer);
  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
  if (backdrop) backdrop.addEventListener("click", closeDrawer);
});
