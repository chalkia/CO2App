document.addEventListener('DOMContentLoaded', () => {
  console.log("Menu script loaded."); // Επιβεβαίωση ότι τρέχει

  const menuBtn = document.getElementById('menuBtn');
  const closeBtn = document.getElementById('drawerClose');
  const drawer = document.getElementById('drawer');
  const backdrop = document.getElementById('drawerBackdrop');
  const navContainer = document.getElementById('drawerNav');
  const langContainer = document.getElementById('drawerLang');

  // Αν δεν βρει το drawer (π.χ. είμαστε στην Αρχική), σταματάει χωρίς λάθος
  if (!drawer) return;

  // 1. Υπολογισμός Διαδρομής (Root Path)
  const isPages = window.location.pathname.includes('/pages/');
  const rootPath = isPages ? '../' : './';
  
  // 2. Λίστα Επιλογών Μενού
  const menuItems = [
    { label: { el: 'Αρχική', en: 'Home' }, path: 'index.html', icon: 'homeN.png', isImg: true },
    { label: { el: 'Υπολογισμός', en: 'Calculator' }, path: 'pages/footprint.html', icon: 'co2N.png', isImg: true },
    { label: { el: 'Αποτελέσματα', en: 'Dashboard' }, path: 'pages/dashboard.html', icon: '📊', isImg: false },
    { label: { el: 'Quiz', en: 'Quiz' }, path: 'pages/quiz.html', icon: 'quizN.png', isImg: true },
    { label: { el: 'Τεκμηρίωση', en: 'Documentation' }, path: 'pages/model.html', icon: 'bookN.png', isImg: true },
    { label: { el: 'Σταθερές', en: 'Constants' }, path: 'pages/values.html', icon: '⚙️', isImg: false },
    { label: { el: 'Ρυθμίσεις', en: 'Settings' }, path: 'pages/settings.html', icon: '🔧', isImg: false },
    { label: { el: 'Εγκατάσταση', en: 'Install App' }, path: 'pages/install.html', icon: '📱', isImg: false },
    { label: { el: 'Πληροφορίες', en: 'About' }, path: 'pages/info.html', icon: 'infoN.png', isImg: true }
  ];

  // 3. Δημιουργία Μενού (Render)
  if (navContainer) {
    navContainer.innerHTML = '';
    const lang = (typeof getLang === 'function') ? getLang() : 'el';

    menuItems.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'drawerLink';
      
      let iconHtml = '';
      if(item.isImg) {
        const iconSrc = rootPath + 'assets/ui/' + item.icon;
        iconHtml = `<img src="${iconSrc}" alt="" style="width:24px; height:24px; margin-right:12px; object-fit:contain;">`;
      } else {
        iconHtml = `<span style="margin-right:12px; width:24px; text-align:center; font-size:1.2rem;">${item.icon}</span>`;
      }

      btn.innerHTML = iconHtml + item.label[lang];

      btn.onclick = () => {
        let target = rootPath + item.path;
        if (isPages && item.path.startsWith('pages/')) {
           target = item.path.replace('pages/', ''); 
        }
        window.location.href = target;
      };
      
      navContainer.appendChild(btn);
    });
  }

  // 4. Κουμπί Αλλαγής Γλώσσας
  if (langContainer) {
    langContainer.innerHTML = '';
    const elFlag = rootPath + 'assets/ui/lang_el.png';
    const enFlag = rootPath + 'assets/ui/lang_en.png';
    
    const langBtn = document.createElement('button');
    langBtn.className = 'drawerLink';
    langBtn.style.justifyContent = 'center';
    langBtn.style.marginTop = '10px';
    langBtn.style.borderTop = '1px solid #eee';
    
    langBtn.innerHTML = `
      <img src="${elFlag}" style="width:24px; margin-right:8px;" onerror="this.style.display='none'"> 
      / 
      <img src="${enFlag}" style="width:24px; margin-left:8px;" onerror="this.style.display='none'">
      <span style="margin-left:10px; font-size:0.9rem;">Change Language</span>
    `;

    langBtn.onclick = () => {
       if (typeof setLang === 'function' && typeof getLang === 'function') {
         const current = getLang();
         setLang(current === 'el' ? 'en' : 'el');
         window.location.reload();
       }
    };
    langContainer.appendChild(langBtn);
  }

  // 5. Open/Close Logic (Με console logs για έλεγχο)
  function openDrawer() {
    console.log("Opening drawer...");
    drawer.classList.add('open');
    if(backdrop) {
      backdrop.style.display = 'block'; // Force display block πρώτα
      setTimeout(() => backdrop.classList.add('open'), 10); // Μετά opacity
      backdrop.setAttribute('aria-hidden', 'false');
    }
    drawer.setAttribute('aria-hidden', 'false');
  }

  function closeDrawer() {
    console.log("Closing drawer...");
    drawer.classList.remove('open');
    if(backdrop) {
      backdrop.classList.remove('open');
      setTimeout(() => backdrop.style.display = 'none', 300); // Περιμένουμε το animation
      backdrop.setAttribute('aria-hidden', 'true');
    }
    drawer.setAttribute('aria-hidden', 'true');
  }

  // Σύνδεση Event Listeners
  if (menuBtn) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation(); // Σταματάμε τυχόν conflict
      openDrawer();
    });
  } else {
    console.log("Menu button not found on this page (ok for index).");
  }

  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);
});
