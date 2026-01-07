// CO2App - Drawer menu (bilingual) — v3.4 docs update
(function(){
  const isPages = location.pathname.includes('/pages/');
  const base = isPages ? './' : './pages/';

  // Menu items (Dashboard intentionally NOT in menu; Values/References reachable from Documentation page)
  const items = [
    { key:'home',  el:'Αρχική',        en:'Home',          href: isPages ? '../index.html' : './index.html', icon:'homeN.png' },
    { key:'quiz',  el:'Quiz',          en:'Quiz',          href: base + 'quiz.html',       icon:'quizN.png' },
    { key:'calc',  el:'Υπολογιστής',   en:'Calculator',    href: isPages ? '../index.html#calculator' : './index.html#calculator', icon:'co2N.png' },
    { key:'cfg',   el:'Ρυθμίσεις',     en:'Settings',      href: base + 'configuration.html', icon:'settingsN.png' },
    { key:'inst',  el:'Εγκατάσταση',   en:'Install',       href: base + 'install.html',    icon:'installN.png' },
    { key:'info',  el:'Σχετικά',       en:'About',         href: base + 'info.html',       icon:'infoN.png' },
    { key:'docs',  el:'Τεκμηρίωση',    en:'Documentation', href: base + 'model.html',      icon:'bookN.png' }
  ];

  const uiPath = isPages ? '../assets/ui/' : './assets/ui/';

  function buildNav(){
    const nav = document.getElementById('drawerNav');
    if(!nav) return;

    const lang = (typeof getLang === 'function') ? getLang() : (localStorage.getItem('lang') || 'el');

    nav.innerHTML = items.map(it => {
      const label = (lang === 'en') ? it.en : it.el;
      const iconSrc = uiPath + it.icon;
      const active = (location.pathname.endsWith(it.href.replace('./','').replace('../','')) || location.href.includes(it.href.replace('./','')));
      return `
        <a class="drawerItem ${active ? 'active' : ''}" href="${it.href}">
          <img class="drawerIcon" src="${iconSrc}" alt="" />
          <span>${label}</span>
        </a>
      `;
    }).join('');

    // Language toggle row (matches app-wide key "lang")
    const row = document.createElement('div');
    row.className = 'drawerLangRow';
    row.innerHTML = `
      <button class="langBtn ${lang==='el'?'active':''}" data-lang="el"><img src="${uiPath}lang_el.png" alt="ΕΛ"/></button>
      <button class="langBtn ${lang==='en'?'active':''}" data-lang="en"><img src="${uiPath}lang_en.png" alt="EN"/></button>
    `;
    nav.appendChild(row);

    row.querySelectorAll('button').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const v = btn.getAttribute('data-lang');
        localStorage.setItem('lang', v);
        if(typeof applyLang === 'function'){ applyLang(v); }
        else if(typeof setLang === 'function'){ setLang(v); }
        else if(typeof applyLanguage === 'function'){ applyLanguage(v); }
        buildNav();
      });
    });
  }

  function wireDrawer(){
    const btn = document.getElementById('menuBtn');
    const drawer = document.getElementById('drawer');
    const backdrop = document.getElementById('drawerBackdrop');
    const close = document.getElementById('drawerClose');
    if(!btn || !drawer || !backdrop || !close) return;

    function open(){
      drawer.setAttribute('aria-hidden','false');
      backdrop.setAttribute('aria-hidden','false');
      drawer.classList.add('open');
      backdrop.classList.add('open');
    }
    function shut(){
      drawer.setAttribute('aria-hidden','true');
      backdrop.setAttribute('aria-hidden','true');
      drawer.classList.remove('open');
      backdrop.classList.remove('open');
    }

    btn.addEventListener('click', open);
    close.addEventListener('click', shut);
    backdrop.addEventListener('click', shut);
    document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') shut(); });

    // Ensure taps work reliably on mobile
    btn.addEventListener('touchstart', (e)=>{ e.preventDefault(); open(); }, {passive:false});
    close.addEventListener('touchstart', (e)=>{ e.preventDefault(); shut(); }, {passive:false});
    backdrop.addEventListener('touchstart', (e)=>{ e.preventDefault(); shut(); }, {passive:false});

    buildNav();
  }

  document.addEventListener('DOMContentLoaded', wireDrawer);
})();