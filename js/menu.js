// CO2App - Drawer menu (bilingual) — v3.5.0
(function(){
  const isPages = location.pathname.includes('/pages/');
  const base = isPages ? './' : './pages/';
  const uiPath = isPages ? '../assets/ui/' : './assets/ui/';

  function getLang(){
    return (localStorage.getItem('lang') || 'el');
  }

  const items = [
    { key:'home', el:'Αρχική',      en:'Home',          href: isPages ? '../index.html' : './index.html', icon:'homeN.png' },
    { key:'quiz', el:'Quiz',        en:'Quiz',          href: base + 'quiz.html',        icon:'quizN.png' },
    { key:'calc', el:'Υπολογιστής', en:'Calculator',    href: isPages ? '../index.html#calculator' : './index.html#calculator', icon:'co2N.png' },
    { key:'cfg',  el:'Ρυθμίσεις',   en:'Settings',      href: base + 'settings.html',    icon:'settingsN.png' },
    { key:'inst', el:'Εγκατάσταση', en:'Install',       href: base + 'install.html',     icon:'installN.png' },
    { key:'info', el:'Σχετικά',     en:'About',         href: base + 'info.html',        icon:'infoN.png' },
    // Dashboard intentionally NOT in menu; Values/References reachable from Documentation page
    { key:'docs', el:'Τεκμηρίωση',  en:'Documentation', href: base + 'CO2App_Model_v4.html', icon:'bookN.png' }
  ];

  function sameTarget(href){
    const clean = (u)=> u.replace(/^\.\//,'').replace(/^\.\.\//,'');
    const here = clean(location.pathname.split('/').slice(-2).join('/'));
    const target = clean(href);
    return here.endsWith(target.split('/').slice(-2).join('/'));
  }

  function buildNav(){
    const lang = getLang();
    const nav = document.getElementById('drawerNav');
    const langWrap = document.getElementById('drawerLang');
    if(!nav) return;

    nav.innerHTML = items.map(it=>{
      const label = (lang==='en') ? it.en : it.el;
      const iconSrc = uiPath + it.icon;
      const active = sameTarget(it.href) || location.href.includes(it.href.replace('./',''));
      return `
        <a class="drawerItem ${active ? 'active' : ''}" href="${it.href}">
          <img class="drawerIcon" src="${iconSrc}" alt="" />
          <span>${label}</span>
        </a>
      `;
    }).join('');

    if(langWrap){
      langWrap.innerHTML = `
        <button class="langBtn ${lang==='el'?'active':''}" data-lang="el" aria-label="Ελληνικά"><img src="${uiPath}lang_el.png" alt="EL"/></button>
        <button class="langBtn ${lang==='en'?'active':''}" data-lang="en" aria-label="English"><img src="${uiPath}lang_en.png" alt="EN"/></button>
      `;
      langWrap.querySelectorAll('button').forEach(btn=>{
        btn.addEventListener('click', ()=>{
          const v = btn.getAttribute('data-lang');
          localStorage.setItem('lang', v);
          // Try common language appliers
          if(typeof applyLang === 'function'){ applyLang(v); }
          else if(typeof setLang === 'function'){ setLang(v); }
          else if(typeof applyLanguage === 'function'){ applyLanguage(v); }
          buildNav();
        });
      });
    }
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

    // Better touch support
    btn.addEventListener('touchstart', (e)=>{ e.preventDefault(); open(); }, {passive:false});
    close.addEventListener('touchstart', (e)=>{ e.preventDefault(); shut(); }, {passive:false});
    backdrop.addEventListener('touchstart', (e)=>{ e.preventDefault(); shut(); }, {passive:false});

    buildNav();
  }

  document.addEventListener('DOMContentLoaded', wireDrawer);
})();
