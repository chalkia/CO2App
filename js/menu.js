function isPagesDir(){
  return location.pathname.includes("/pages/");
}

function openDrawer(){
  const d = document.getElementById("drawer");
  const b = document.getElementById("drawerBackdrop");
  if (!d || !b) return;
  d.classList.add("open");
  b.style.display = "block";
  d.setAttribute("aria-hidden", "false");
  b.setAttribute("aria-hidden", "false");
}

function closeDrawer(){
  const d = document.getElementById("drawer");
  const b = document.getElementById("drawerBackdrop");
  if (!d || !b) return;
  d.classList.remove("open");
  b.style.display = "none";
  d.setAttribute("aria-hidden", "true");
  b.setAttribute("aria-hidden", "true");
}

function pageName(){
  const p = location.pathname.split("/").pop();
  return p && p.length ? p : "index.html";
}

function buildNav(){
  const nav = document.getElementById("drawerNav");
  if (!nav) return;

  const lang = getLang();
  const t = {
    el: { home:"Αρχική", quiz:"Quiz", foot:"Υπολογιστής CO₂", info:"Πληροφορίες", about:"About" },
    en: { home:"Home", quiz:"Quiz", foot:"Footprint", info:"Info", about:"About" }
  }[lang];

  const here = pageName();
  const inPages = isPagesDir();

  const base = inPages ? "../" : "./";
  const items = inPages ? [
    {label:t.home, href: base+"index.html", icon:"home"},
    {label:t.quiz, href: "./quiz.html", icon:"quiz"},
    {label:t.foot, href: "./footprint.html", icon:"co2"},
    {label:t.info, href: "./info.html", icon:"info"},
    {label:t.about, href: "./about.html", icon:"about"},
  ] : [
    {label:t.home, href: "./index.html", icon:"home"},
    {label:t.quiz, href: "./pages/quiz.html", icon:"quiz"},
    {label:t.foot, href: "./pages/footprint.html", icon:"co2"},
    {label:t.info, href: "./pages/info.html", icon:"info"},
    {label:t.about, href: "./pages/about.html", icon:"about"},
  ];

  nav.innerHTML = "";
  items.forEach(it=>{
    const div = document.createElement("div");
    div.className = "drawerItem";

    const target = it.href.split("/").pop();
    div.classList.toggle("active", here === target);

    const ic = document.createElement("span");
    ic.className = "drawerIcon";

    const iconBase = inPages ? "../assets/ui/" : "./assets/ui/";
    if (it.icon === "home"){
      const img = document.createElement("img");
      img.src = iconBase + "homeN.png";
      img.alt = "";
      ic.appendChild(img);
    } else if (it.icon === "co2"){
      ic.textContent = "CO₂";
      ic.style.fontSize = "0.8rem";
      ic.style.fontWeight = "900";
    } else if (it.icon === "quiz"){
      ic.textContent = "?";
    } else if (it.icon === "about"){
      ic.textContent = "👤";
    } else if (it.icon === "info"){
      ic.textContent = "ℹ";
    } else {
      ic.textContent = "•";
    }

    const tx = document.createElement("span");
    tx.className = "drawerText";
    tx.textContent = it.label;

    div.appendChild(ic);
    div.appendChild(tx);

    div.addEventListener("click", ()=>{
      closeDrawer();
      location.href = it.href;
    });

    nav.appendChild(div);
  });
}

function buildLangToggle(){
  const wrap = document.getElementById("drawerLang");
  if (!wrap) return;

  const lang = getLang();
  const target = (lang === "el") ? "en" : "el";
  const label = (lang === "el") ? "English" : "Ελληνικά";
  const icon = (lang === "el") ? "EN" : "ΕΛ";

  wrap.innerHTML = "";

  const div = document.createElement("div");
  div.className = "drawerItem";
  div.setAttribute("data-lang-toggle", "1");

  const ic = document.createElement("span");
  ic.className = "drawerIcon";
  ic.textContent = icon;

  const tx = document.createElement("span");
  tx.className = "drawerText";
  tx.textContent = label;

  div.appendChild(ic);
  div.appendChild(tx);

  div.addEventListener("click", ()=>{
    setLang(target);
    location.reload();
  });

  wrap.appendChild(div);
}

document.addEventListener("DOMContentLoaded", ()=>{
  buildNav();
  buildLangToggle();

  const menuBtn = document.getElementById("menuBtn");
  const closeBtn = document.getElementById("drawerClose");
  const backdrop = document.getElementById("drawerBackdrop");

  if (menuBtn) menuBtn.addEventListener("click", openDrawer);
  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
  if (backdrop) backdrop.addEventListener("click", closeDrawer);
});
