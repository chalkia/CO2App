document.addEventListener('DOMContentLoaded', () => {
  console.log("Menu script loaded.");

  const menuBtn = document.getElementById('menuBtn');
  const closeBtn = document.getElementById('drawerClose');
  const drawer = document.getElementById('drawer');
  const backdrop = document.getElementById('drawerBackdrop');
  const navContainer = document.getElementById('drawerNav');
  const langContainer = document.getElementById('drawerLang');

  // Αν δεν υπάρχει drawer, σταματάμε.
  if (!drawer) return;

  // 1. Υπολογισμός Διαδρομής (Root Path)
  const isPages = window.location.pathname.includes('/pages/');
  const rootPath = isPages ? '../' : './';
  
  // 2. Λίστα Επιλογών Μενού (Ακριβώς όπως η εικόνα)
  const menuItems = [
    { 
      label: { el: 'Αρχική', en: 'Home' }, 
      path: 'index.html', 
      icon: 'homeN.png' 
    },
    { 
      label: { el: 'Quiz', en: 'Quiz' }, 
      path: 'pages/quiz.html', 
      icon: 'quizN.png' 
    },
    { 
      label: { el: 'Υπολογιστής CO₂', en: 'CO₂ Calculator' }, 
      path: 'pages/footprint.html', 
      icon: 'co2N.png' 
    },
    { 
      label: { el: 'Τεκμηρίωση', en: 'Documentation' }, 
      path: 'pages/model.html', 
      icon: 'bookN.png' 
    },
    { 
      label: { el: 'Πληροφορίες', en: 'About' }, 
      path: 'pages/info.html', 
      icon: 'infoN.png' 
    },
    { 
      label: { el: 'Ρυθμίσεις', en: 'Settings' }, 
      path: 'pages/settings.html', 
      icon: 'settingsN.png' 
    },
    { 
      label: { el: 'Εγκατάσταση', en: 'Install App' }, 
      path: 'pages/install.html', 
      icon: 'installN.png'
    }
  ];

  // 3. Δημιουργία Μενού
  if (navContainer) {
    navContainer.innerHTML = '';
    const lang = (typeof getLang === 'function') ? getLang() : 'el';
    const currentPath = window.location.pathname.split('/').pop();

    menuItems.forEach(item => {
      const btn = document.createElement('div');
      btn.className = 'drawerItem';
      
      if (item.path.endsWith(currentPath)) {
        btn.classList.add('active');
      }

      const iconSrc = rootPath + 'assets/ui/' + item.icon;
      
      btn.innerHTML = `
        <div class="drawerIcon">
          <img src="${iconSrc}" alt="" style="width:100%; height:100%; object-fit:contain;">
        </div>
        <div class="drawerText">${item.label[lang]}</div>
      `;

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
    const lang = (typeof getLang === 'function') ? getLang() : 'el';
    const targetLang = (lang === 'el') ? 'en' : 'el';
    
    // Εμφάνιση της τρέχουσας γλώσσας ή της γλώσσας στόχου;
    // Συνήθως στο μενού δείχνουμε την επιλογή που θα κάνουμε ή την τρέχουσα με σημαία.
    // Εδώ θα δείξουμε τη γλώσσα στην οποία θα ΑΛΛΑΞΕΙ (όπως το κουμπί toggle).
    const flagIcon = rootPath + 'assets/ui/' + (targetLang === 'en' ? 'lang_en.png' : 'lang_el.png');
    const labelText = (targetLang === 'en') ? 'English' : 'Ελληνικά';

    const langBtn = document.createElement('div');
    langBtn.className = 'drawerItem';
    langBtn.style.marginTop = '10px';

    langBtn.innerHTML = `
      <div class="drawerIcon">
        <img src="${flagIcon}" alt="Language" style="width:100%; height:100%; object-fit:contain;">
      </div>
      <div class="drawerText">${labelText}</div>
    `;

    langBtn.onclick = () => {
       if (typeof setLang === 'function') {
         setLang(targetLang);
         window.location.reload();
       }
    };
    langContainer.appendChild(langBtn);
  }

  // 5. Open/Close Logic
  function openDrawer() {
    drawer.classList.add('open');
    if(backdrop) {
      backdrop.style.display = 'block';
      setTimeout(() => backdrop.classList.add('open'), 10);
      backdrop.setAttribute('aria-hidden', 'false');
    }
    drawer.setAttribute('aria-hidden', 'false');
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    if(backdrop) {
      backdrop.classList.remove('open');
      setTimeout(() => backdrop.style.display = 'none', 300);
      backdrop.setAttribute('aria-hidden', 'true');
    }
    drawer.setAttribute('aria-hidden', 'true');
  }

  if (menuBtn) menuBtn.addEventListener('click', (e) => { e.stopPropagation(); openDrawer(); });
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);
});
