// js/menu.js

document.addEventListener('DOMContentLoaded', () => {
  const menuBtn = document.getElementById('menuBtn');
  const closeBtn = document.getElementById('drawerClose');
  const drawer = document.getElementById('drawer');
  const backdrop = document.getElementById('drawerBackdrop');
  const navContainer = document.getElementById('drawerNav');
  const langContainer = document.getElementById('drawerLang');

  // Helper για να καταλαβαίνουμε αν είμαστε σε υποφάκελο (pages/) ή στο root
  // Αν το URL περιέχει "/pages/", τότε για να πάμε στο root θέλουμε "../"
  // Αλλιώς είμαστε ήδη στο root "./"
  const isPages = window.location.pathname.includes('/pages/');
  const rootPath = isPages ? '../' : './';
  
  // Ορισμός των Links του Μενού
  // Προσοχή: Βάζουμε τα paths σχετικά με το root (χωρίς ./ ή ../ στην αρχή)
  // και τα φτιάχνει η συνάρτηση createLink.
  const menuItems = [
    { label: { el: 'Αρχική', en: 'Home' }, path: 'index.html', icon: '🏠' },
    { label: { el: 'Υπολογισμός', en: 'Calculator' }, path: 'pages/footprint.html', icon: '👣' },
    { label: { el: 'Αποτελέσματα', en: 'Dashboard' }, path: 'pages/dashboard.html', icon: '📊' },
    { label: { el: 'Quiz', en: 'Quiz' }, path: 'pages/quiz.html', icon: '❓' },
    { label: { el: 'Τεκμηρίωση', en: 'Documentation' }, path: 'pages/model.html', icon: 'bookN.png', isImg: true }, // Διόρθωση Link
    { label: { el: 'Σταθερές', en: 'Constants' }, path: 'pages/values.html', icon: '⚙️' },
    { label: { el: 'Ρυθμίσεις', en: 'Settings' }, path: 'pages/settings.html', icon: '🔧' },
    { label: { el: 'Εγκατάσταση', en: 'Install App' }, path: 'pages/install.html', icon: '📱' },
    { label: { el: 'Πληροφορίες', en: 'About' }, path: 'pages/info.html', icon: 'ℹ️' } // Διόρθωση Link
  ];

  // Render Menu Items
  if (navContainer) {
    navContainer.innerHTML = '';
    const lang = (typeof getLang === 'function') ? getLang() : 'el';

    menuItems.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'drawerLink';
      
      // Icon
      let iconHtml = '';
      if(item.isImg) {
        // Ειδική περίπτωση για εικόνες (π.χ. bookN.png)
        // Φτιάχνουμε το path: rootPath + assets/ui/ + icon
        const iconSrc = rootPath + 'assets/ui/' + item.icon;
        iconHtml = `<img src="${iconSrc}" style="width:20px; height:20px; margin-right:12px; opacity:0.7;">`;
      } else {
        // Emoji
        iconHtml = `<span style="margin-right:12px; width:20px; text-align:center;">${item.icon}</span>`;
      }

      btn.innerHTML = iconHtml + item.label[lang];

      btn.onclick = () => {
        // Υπολογισμός τελικού path
        // Αν είμαστε στο pages/ και θέλουμε να πάμε στο index.html -> ../index.html
        // Αν είμαστε στο pages/ και θέλουμε pages/quiz.html -> ../pages/quiz.html (ή απλά quiz.html)
        // Ο πιο ασφαλής τρόπος:
        
        let target = rootPath + item.path;
        
        // Μικρή διόρθωση αν είμαστε ήδη στο pages και ο στόχος είναι στο pages
        // π.χ. είμαι στο footprint.html και θέλω dashboard.html
        if (isPages && item.path.startsWith('pages/')) {
           // Αφαιρούμε το 'pages/' από το target path γιατί είμαστε ήδη εκεί
           target = item.path.replace('pages/', ''); 
        }

        window.location.href = target;
      };
      
      navContainer.appendChild(btn);
    });
  }

  // Render Language Switcher
  if (langContainer) {
    langContainer.innerHTML = '';
    const langBtn = document.createElement('button');
    langBtn.className = 'drawerLink';
    langBtn.style.justifyContent = 'center';
    langBtn.style.marginTop = '10px';
    langBtn.style.border = '1px solid #ddd';
    langBtn.innerHTML = '🌐 Change Language / Αλλαγή Γλώσσας';
    langBtn.onclick = () => {
       if (typeof setLang === 'function' && typeof getLang === 'function') {
         const current = getLang();
         setLang(current === 'el' ? 'en' : 'el');
         window.location.reload();
       }
    };
    langContainer.appendChild(langBtn);
  }

  // Open/Close Logic
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
