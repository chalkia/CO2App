document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('menuBtn');
  const closeBtn = document.getElementById('drawerClose');
  const drawer = document.getElementById('drawer');
  const backdrop = document.getElementById('drawerBackdrop');
  const navContainer = document.getElementById('drawerNav');
  const langContainer = document.getElementById('drawerLang');

  // 1. Υπολογισμός Διαδρομής (Root Path)
  // Αν το URL περιέχει "/pages/", σημαίνει ότι είμαστε σε υποφάκελο.
  // Άρα για να βρούμε τα assets πρέπει να πάμε πίσω (../).
  // Αν είμαστε στο index.html, το path είναι τρέχον (./).
  const isPages = window.location.pathname.includes('/pages/');
  const rootPath = isPages ? '../' : './';
  
  // 2. Λίστα Επιλογών Μενού (Με τα δικά σου εικονίδια)
  // isImg: true -> Χρησιμοποιεί εικόνα από το assets/ui/
  // isImg: false -> Χρησιμοποιεί Emoji (για όσα δεν έχεις εικόνα)
  const menuItems = [
    { label: { el: 'Αρχική', en: 'Home' }, path: 'index.html', icon: 'homeN.png', isImg: true },
    { label: { el: 'Υπολογισμός', en: 'Calculator' }, path: 'pages/footprint.html', icon: 'co2N.png', isImg: true },
    { label: { el: 'Αποτελέσματα', en: 'Dashboard' }, path: 'pages/dashboard.html', icon: '📊', isImg: false }, // Δεν βρήκα dashboardN.png στη λίστα σου, άφησα emoji
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
      
      // Διαχείριση Εικόνας vs Emoji
      let iconHtml = '';
      if(item.isImg) {
        // Σχηματισμός σωστού path: ../assets/ui/onoma.png
        const iconSrc = rootPath + 'assets/ui/' + item.icon;
        
        // Προσθέτουμε class="menuIcon" για να τις στυλάρεις αν θες
        iconHtml = `<img src="${iconSrc}" alt="icon" style="width:24px; height:24px; margin-right:12px; object-fit:contain;">`;
      } else {
        // Emoji fallback
        iconHtml = `<span style="margin-right:12px; width:24px; text-align:center; font-size:1.2rem;">${item.icon}</span>`;
      }

      btn.innerHTML = iconHtml + item.label[lang];

      // Λογική Κλικ (Πλοήγηση)
      btn.onclick = () => {
        let target = rootPath + item.path;
        
        // Διόρθωση αν είμαστε ήδη στο pages/ και ο στόχος είναι επίσης στο pages/
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
    
    // Χρήση εικόνων σημαίας αν υπάρχουν
    const elFlag = rootPath + 'assets/ui/lang_el.png';
    const enFlag = rootPath + 'assets/ui/lang_en.png';
    
    const langBtn = document.createElement('button');
    langBtn.className = 'drawerLink';
    langBtn.style.justifyContent = 'center';
    langBtn.style.marginTop = '10px';
    langBtn.style.borderTop = '1px solid #eee';
    
    // Δοκιμάζουμε να δείξουμε σημαίες, αλλιώς κείμενο
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

  // 5. Open/Close Logic
  function openDrawer() {
    drawer.classList.add('open');
    backdrop.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    backdrop.setAttribute('aria-hidden', 'false');
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    backdrop.setAttribute('aria-hidden', 'true');
  }

  if (menuBtn) menuBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  if (backdrop) backdrop.addEventListener('click', closeDrawer);
});
});
