// CO2App Menu (robust) — works in / and /pages/ and on pages with or without drawer skeleton.
// Links (EL/EN):
// - Υπολογιστής CO2 / Footprint -> footprint.html
// - Τεκμηρίωση / Documentation -> CO2App_Model_v4.html
// - Πληροφορίες / Info -> about.html

(function(){
  const isPagesDir = () => location.pathname.includes("/pages/");
  const isStandaloneMode = () => {
    try{
      return (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) ||
             (window.navigator && window.navigator.standalone === true);
    }catch(e){ return false; }
  };

  const getLangSafe = () => (typeof window.getLang === "function") ? window.getLang() : (localStorage.getItem("lang") || "el");
  const setLangSafe = (l) => (typeof window.setLang === "function") ? window.setLang(l) : localStorage.setItem("lang", l);

  const openDrawer = () => {
    const d = document.getElementById("drawer");
    const b = document.getElementById("drawerBackdrop");
    if (!d || !b) return;
    d.classList.add("open");
    b.style.display = "block";
    d.setAttribute("aria-hidden","false");
    b.setAttribute("aria-hidden","false");
  };

  const closeDrawer = () => {
    const d = document.getElementById("drawer");
    const b = document.getElementById("drawerBackdrop");
    if (!d || !b) return;
    d.classList.remove("open");
    b.style.display = "none";
    d.setAttribute("aria-hidden","true");
    b.setAttribute("aria-hidden","true");
  };

  const pageName = () => {
    const p = location.pathname.split("/").pop();
    return p && p.length ? p : "index.html";
  };

  const ensureDrawerSkeleton = () => {
    if (document.getElementById("drawer") && document.getElementById("drawerBackdrop") &&
        document.getElementById("drawerNav") && document.getElementById("drawerLang") &&
        (document.getElementById("drawerClose") || document.querySelector("#drawer .drawerClose"))) {
      return;
    }

    // Backdrop
    let backdrop = document.getElementById("drawerBackdrop");
    if (!backdrop){
      backdrop = document.createElement("div");
      backdrop.className = "drawerBackdrop";
      backdrop.id = "drawerBackdrop";
      document.body.appendChild(backdrop);
    }
    backdrop.setAttribute("aria-hidden","true");
    backdrop.style.display = "none";

    // Drawer
    let drawer = document.getElementById("drawer");
    if (!drawer){
      drawer = document.createElement("nav");
      drawer.className = "drawer";
      drawer.id = "drawer";
      document.body.appendChild(drawer);
    }
    drawer.setAttribute("aria-hidden","true");

    // If drawer is empty or missing required structure, rebuild innerHTML safely
    if (!drawer.querySelector(".drawerHeader") || !drawer.querySelector("#drawerNav") || !drawer.querySelector("#drawerLang")){
      drawer.innerHTML = `
        <div class="drawerHeader">
          <div class="drawerTitle">CO2App</div>
          <button class="drawerClose" id="drawerClose" aria-label="close">×</button>
        </div>
        <div class="drawerNav" id="drawerNav"></div>
        <div class="drawerLang" id="drawerLang"></div>
      `;
    }else{
      // ensure close button id exists
      const closeBtn = drawer.querySelector("#drawerClose") || drawer.querySelector(".drawerClose");
      if (closeBtn && !closeBtn.id) closeBtn.id = "drawerClose";
      const nav = drawer.querySelector("#drawerNav");
      if (nav && !nav.id) nav.id = "drawerNav";
      const lang = drawer.querySelector("#drawerLang");
      if (lang && !lang.id) lang.id = "drawerLang";
    }

    // Ensure language toggle is last
    const lang = document.getElementById("drawerLang");
    if (lang) drawer.appendChild(lang);
  };

  const docsHref = (inPages) => inPages ? "./CO2App_Model_v4.html" : "./pages/CO2App_Model_v4.html";
  const aboutHref = (inPages) => inPages ? "./about.html" : "./pages/about.html";

  const buildNav = () => {
    const nav = document.getElementById("drawerNav");
    if (!nav) return;

    const lang = getLangSafe();
    const t = {
      el: {home:"Αρχική", quiz:"Quiz", foot:"Υπολογιστής CO₂", docs:"Τεκμηρίωση", about:"Πληροφορίες", install:"Εγκατάσταση σε κινητό", settings:"Ρυθμίσεις"},
      en: {home:"Home",   quiz:"Quiz", foot:"Footprint",       docs:"Documentation", about:"Info", install:"Install on phone", settings:"Settings"}
    }[lang] || {
      home:"Home", quiz:"Quiz", foot:"Footprint", docs:"Documentation", about:"Info", install:"Install on phone", settings:"Settings"
    };

    const here = pageName();
    const inPages = isPagesDir();
    const base = inPages ? "../" : "./";

    const items = inPages ? [
      {label:t.home,     href: base+"index.html",       icon:"home"},
      {label:t.quiz,     href: "./quiz.html",           icon:"quiz"},
      {label:t.foot,     href: "./footprint.html",      icon:"co2"},
      {label:t.docs,     href: docsHref(true),          icon:"docs"},
      {label:t.about,    href: aboutHref(true),         icon:"about"},
      {label:t.settings, href: "./settings.html",       icon:"settings"},
      {label:t.install,  href: "./install.html",        icon:"install"},
    ] : [
      {label:t.home,     href: "./index.html",            icon:"home"},
      {label:t.quiz,     href: "./pages/quiz.html",       icon:"quiz"},
      {label:t.foot,     href: "./pages/footprint.html",  icon:"co2"},
      {label:t.docs,     href: docsHref(false),           icon:"docs"},
      {label:t.about,    href: aboutHref(false),          icon:"about"},
      {label:t.settings, href: "./pages/settings.html",   icon:"settings"},
      {label:t.install,  href: "./pages/install.html",    icon:"install"},
    ];

    nav.innerHTML = "";
    const standalone = isStandaloneMode();
    const visibleItems = standalone ? items.filter(x => x.icon !== "install") : items;

    const iconBase = inPages ? "../assets/ui/" : "./assets/ui/";
    const iconMap = {
      home: "homeN.png",
      co2: "co2N.png",
      quiz: "quizN.png",
      docs: "bookN.png",
      about: "infoN.png",
      settings: "settingsN.png",
      install: "installN.png"
    };

    visibleItems.forEach(it => {
      const div = document.createElement("div");
      div.className = "drawerItem";

      const target = it.href.split("/").pop();
      div.classList.toggle("active", here === target);

      const ic = document.createElement("span");
      ic.className = "drawerIcon";
      const img = document.createElement("img");
      img.alt = "";
      img.width = 26; img.height = 26;
      img.style.width = "26px";
      img.style.height = "26px";
      img.style.display = "block";
      img.style.objectFit = "contain";
      img.src = iconBase + (iconMap[it.icon] || "homeN.png");
      ic.appendChild(img);

      const tx = document.createElement("span");
      tx.className = "drawerText";
      tx.textContent = it.label;

      // optional quiz badge
      if (it.icon === "quiz"){
        try{
          const qs = localStorage.getItem("quizScore");
          const n = Number(qs);
          if (qs !== null && !Number.isNaN(n)){
            const badge = document.createElement("span");
            badge.className = "quizBadge";
            badge.textContent = `${n}/100`;
            tx.appendChild(badge);
          }
        }catch(e){}
      }

      div.appendChild(ic);
      div.appendChild(tx);

      div.addEventListener("click", () => {
        closeDrawer();
        location.href = it.href;
      });

      nav.appendChild(div);
    });
  };

  const buildLangToggle = () => {
    const wrap = document.getElementById("drawerLang");
    if (!wrap) return;

    const lang = getLangSafe();
    const target = (lang === "el") ? "en" : "el";
    const label = (lang === "el") ? "English" : "Ελληνικά";
    const icon = (lang === "el") ? "lang_en.png" : "lang_el.png";

    wrap.innerHTML = "";

    const div = document.createElement("div");
    div.className = "drawerItem";

    const ic = document.createElement("span");
    ic.className = "drawerIcon";
    const img = document.createElement("img");
    img.src = (isPagesDir() ? "../assets/ui/" : "./assets/ui/") + icon;
    img.alt = "";
    img.width = 28; img.height = 28;
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
      setLangSafe(target);
      // if current page supports dynamic switch
      try{ if (typeof window.applyLang === "function") { window.applyLang(); return; } }catch(e){}
      location.reload();
    });

    wrap.appendChild(div);

    // keep last
    const drawer = document.getElementById("drawer");
    if (drawer) drawer.appendChild(wrap);
  };

  const wireDrawer = () => {
    const menuBtn = document.getElementById("menuBtn") || document.getElementById("openDrawer");
    const closeBtn = document.getElementById("drawerClose") || document.getElementById("closeDrawer") || document.querySelector("#drawer .drawerClose");
    const backdrop = document.getElementById("drawerBackdrop");
    if (menuBtn) menuBtn.addEventListener("click", openDrawer);
    if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
    if (backdrop) backdrop.addEventListener("click", closeDrawer);
  };

  // Optional API for pages with <div id="menuContainer"></div>
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
    buildNav();
    buildLangToggle();
    wireDrawer();
  };

  document.addEventListener("DOMContentLoaded", () => {
    ensureDrawerSkeleton();
    buildNav();
    buildLangToggle();
    wireDrawer();
  });
})();
