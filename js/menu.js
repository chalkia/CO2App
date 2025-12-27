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

function currentPage(){
  const p = location.pathname.split("/").pop();
  // index.html may be empty on some hosts
  if (!p || p === "") return "index.html";
  return p;
}

function buildDrawerNav(){
  const nav = document.getElementById("drawerNav");
  if (!nav) return;

  const lang = getLang();
  const t = {
    el: { home:"Αρχική", quiz:"Quiz", foot:"Υπολογιστής CO₂", info:"Info", about:"About" },
    en: { home:"Home", quiz:"Quiz", foot:"Footprint", info:"Info", about:"About" }
  }[lang];

  const here = currentPage();

  const items = [
    {label:t.home, href: (location.pathname.includes("/pages/") ? "../index.html" : "./index.html"), icon:"home"},
    {label:t.quiz, href: (location.pathname.includes("/pages/") ? "./quiz.html" : "./pages/quiz.html"), icon:"quiz"},
    {label:t.foot, href: (location.pathname.includes("/pages/") ? "./footprint.html" : "./pages/footprint.html"), icon:"bus"},
    {label:t.info, href: (location.pathname.includes("/pages/") ? "./info.html" : "./pages/info.html"), icon:"info"},
    {label:t.about, href: (location.pathname.includes("/pages/") ? "./about.html" : "./pages/about.html"), icon:"about"},
  ];

  nav.innerHTML = "";

  items.forEach(it=>{
    const div = document.createElement("div");
    div.className = "drawerItem";
    const targetPage = it.href.split("/").pop();
    div.classList.toggle("active", here === targetPage);

    const ic = document.createElement("span");
    ic.className = "drawerIcon";

    if (it.icon === "home"){
      const img = document.createElement("img");
      img.src = (location.pathname.includes("/pages/") ? "../assets/ui/homeN.png" : "./assets/ui/homeN.png");
      img.alt = "";
      ic.appendChild(img);
    } else if (it.icon === "bus"){
      const img = document.createElement("img");
      img.src = (location.pathname.includes("/pages/") ? "../assets/ui/busN.png" : "./assets/ui/busN.png");
      img.alt = "";
      ic.appendChild(img);
    } else if (it.icon === "quiz"){
      ic.textContent = "?";
    } else if (it.icon === "about"){
      ic.textContent = "i";
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

  // Mark language buttons active
  document.querySelectorAll('.drawerItem[data-action="lang"]').forEach(el=>{
    const l = el.getAttribute("data-lang");
    el.classList.toggle("active", l === lang);
  });
}

document.addEventListener("DOMContentLoaded", ()=>{
  buildDrawerNav();

  const menuBtn = document.getElementById("menuBtn");
  const closeBtn = document.getElementById("drawerClose");
  const backdrop = document.getElementById("drawerBackdrop");

  if (menuBtn) menuBtn.addEventListener("click", openDrawer);
  if (closeBtn) closeBtn.addEventListener("click", closeDrawer);
  if (backdrop) backdrop.addEventListener("click", closeDrawer);

  document.querySelectorAll('.drawerItem[data-action="lang"]').forEach(el=>{
    el.addEventListener("click", ()=>{
      const l = el.getAttribute("data-lang");
      setLang(l);
      // reload current page
      location.reload();
    });
  });
});
