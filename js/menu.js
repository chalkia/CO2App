(function(){
  function isPagesDir(){
    return window.location.pathname.indexOf("/pages/") !== -1;
  }

  function getLang(){
    var v = null;
    try{ v = localStorage.getItem("LANG"); }catch(e){}
    return (v === "en" || v === "el") ? v : "el";
  }

  function setLang(lang){
    try{ localStorage.setItem("LANG", lang); }catch(e){}
  }

  function openDrawer(){
    var d = document.getElementById("drawer");
    var b = document.getElementById("drawerBackdrop");
    if(!d || !b) return;
    d.classList.add("open");
    b.style.display = "block";
    d.setAttribute("aria-hidden","false");
  }

  function closeDrawer(){
    var d = document.getElementById("drawer");
    var b = document.getElementById("drawerBackdrop");
    if(!d || !b) return;
    d.classList.remove("open");
    b.style.display = "none";
    d.setAttribute("aria-hidden","true");
  }

  function pageName(){
    var parts = window.location.pathname.split("/");
    var p = parts[parts.length-1];
    return p && p.length ? p : "index.html";
  }

  function iconSrc(name){
    // icons live in assets/ui/
    var base = isPagesDir() ? "../assets/ui/" : "./assets/ui/";
    var map = {
      home:"homeN.png",
      quiz:"quizN.png",
      co2:"co2N.png",
      dash:"dashboardN.png",
      info:"infoN.png",
      book:"bookN.png",
      settings:"settingsN.png",
      install:"installN.png",
      about:"aboutN.png"
    };
    return base + (map[name] || "infoN.png");
  }

  function buildNav(){
    var nav = document.getElementById("drawerNav");
    if(!nav) return;

    var lang = getLang();
    var t = {
      el: {home:"Αρχική", quiz:"Quiz", foot:"Υπολογιστής", dash:"Dashboard", info:"Τεκμηρίωση", values:"Τιμές & Παραπομπές", settings:"Ρυθμίσεις", install:"Εγκατάσταση", about:"Σχετικά"},
      en: {home:"Home", quiz:"Quiz", foot:"Calculator", dash:"Dashboard", info:"Documentation", values:"Values & References", settings:"Settings", install:"Install", about:"About"}
    }[lang];

    var items;
    if(isPagesDir()){
      items = [
        {label:t.home, href:"../index.html", icon:"home"},
        {label:t.quiz, href:"./quiz.html", icon:"quiz"},
        {label:t.foot, href:"./footprint.html", icon:"co2"},
        {label:t.dash, href:"./dashboard.html", icon:"dash"},
        {label:t.info, href:"./info.html", icon:"info"},
        {label:t.values, href:"./values.html", icon:"book"},
        {label:t.settings, href:"./settings.html", icon:"settings"},
        {label:t.install, href:"./install.html", icon:"install"},
        {label:t.about, href:"./about.html", icon:"about"}
      ];
    }else{
      items = [
        {label:t.home, href:"./index.html", icon:"home"},
        {label:t.quiz, href:"./pages/quiz.html", icon:"quiz"},
        {label:t.foot, href:"./pages/footprint.html", icon:"co2"},
        {label:t.dash, href:"./pages/dashboard.html", icon:"dash"},
        {label:t.info, href:"./pages/info.html", icon:"info"},
        {label:t.values, href:"./pages/values.html", icon:"book"},
        {label:t.settings, href:"./pages/settings.html", icon:"settings"},
        {label:t.install, href:"./pages/install.html", icon:"install"},
        {label:t.about, href:"./pages/about.html", icon:"about"}
      ];
    }

    var current = pageName();
    nav.innerHTML = "";
    for(var i=0;i<items.length;i++){
      (function(it){
        var a = document.createElement("a");
        a.className = "drawerItem";
        a.href = it.href;

        var img = document.createElement("img");
        img.className = "drawerIcon";
        img.alt = "";
        img.src = iconSrc(it.icon);
        a.appendChild(img);

        var span = document.createElement("span");
        span.textContent = it.label;
        a.appendChild(span);

        var target = it.href.split("/").pop();
        if(target === current){
          a.className += " active";
        }

        a.addEventListener("click", function(){ closeDrawer(); });
        nav.appendChild(a);
      })(items[i]);
    }
  }

  function buildLang(){
    var holder = document.getElementById("drawerLang");
    if(!holder) return;

    var lang = getLang();
    holder.innerHTML = "";

    var wrap = document.createElement("div");
    wrap.className = "langRow";

    function mkBtn(code, label){
      var b = document.createElement("button");
      b.className = "chipBtn" + (lang===code ? " active" : "");
      b.type = "button";
      b.textContent = label;
      b.addEventListener("click", function(){
        setLang(code);
        // rebuild UI bits
        buildNav();
        buildLang();
        // optional: reload to update page text if page uses common.js translations
        try{ window.dispatchEvent(new Event("languagechange")); }catch(e){}
      });
      return b;
    }

    wrap.appendChild(mkBtn("el","ΕΛ"));
    wrap.appendChild(mkBtn("en","EN"));
    holder.appendChild(wrap);
  }

  function init(){
    // attach events if elements exist
    var menuBtn = document.getElementById("menuBtn");
    var closeBtn = document.getElementById("drawerClose");
    var backdrop = document.getElementById("drawerBackdrop");

    if(menuBtn){
      menuBtn.addEventListener("click", function(e){
        e.preventDefault();
        openDrawer();
      });
      // iOS sometimes needs touchstart too
      menuBtn.addEventListener("touchstart", function(e){
        e.preventDefault();
        openDrawer();
      }, {passive:false});
    }

    if(closeBtn){
      closeBtn.addEventListener("click", function(e){
        e.preventDefault();
        closeDrawer();
      });
      closeBtn.addEventListener("touchstart", function(e){
        e.preventDefault();
        closeDrawer();
      }, {passive:false});
    }

    if(backdrop){
      backdrop.addEventListener("click", function(){ closeDrawer(); });
      backdrop.addEventListener("touchstart", function(){ closeDrawer(); }, {passive:true});
    }

    buildNav();
    buildLang();
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", init);
  }else{
    init();
  }
})();