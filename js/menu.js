document.addEventListener('DOMContentLoaded', () => {
  console.log("Menu script loaded (v4 layout).");

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
      icon: 'settingsN.png' // Βεβαιώσου ότι υπάρχει αυτό το αρχείο
    },
    { 
      label: { el: 'Εγκατάσταση', en: 'Install App' }, 
      path: 'pages/install.html', 
      icon: 'installN.png'  // Βεβαιώσου ότι υπάρχει αυτό το αρχείο
    }
  ];

  // 3. Δημιουργία Μενού (Render)
  if (navContainer) {
    navContainer.innerHTML = '';
    const lang = (typeof getLang === 'function') ? getLang() : 'el';
    
    // Βρίσκουμε το τρέχον αρχείο για να βάλουμε το active class
    const currentPath = window.location.pathname.split('/').pop();

    menuItems.forEach(item => {
      // Δημιουργία κουμπιού με την κλάση drawerItem (για το στυλ του screenshot)
      const btn = document.createElement('div'); 
      btn.className = 'drawerItem';
      
      // Έλεγχος αν είναι η ενεργή σελίδα
      if (item.path.endsWith(currentPath)) {
        btn.classList.add('active');
      }

      // Εικονίδιο
      const iconSrc = rootPath + 'assets/ui/' + item.icon;
      
      btn.innerHTML = `
        <div class="drawerIcon">
          <img src="${iconSrc}" alt="" style="width:100%; height:100%; object-fit:contain;">
        </div>
        <div class="drawerText">${item.label[lang]}</div>
      `;

      // Event Click για πλοήγηση
      btn.onclick = () => {
        let target = rootPath + item.path;
        // Διόρθωση path αν είμαστε ήδη μέσα στο pages/
        if (isPages && item.path.startsWith('pages/')) {
           target = item.path.replace('pages/', ''); 
        }
        window.location.href = target;
      };
      
      navContainer.appendChild(btn);
    });
  }

  // 4. Κουμπί Αλλαγής Γλώσσας (Στο ίδιο στυλ)
  if (langContainer) {
    langContainer.innerHTML = '';
    const lang = (typeof getLang === 'function') ? getLang() : 'el';
    
    // Εικονίδιο Σημαίας ανάλογα με τη γλώσσα που θα πάμε
    // Αν είμαστε EL δείχνουμε EN (για να το πατήσει) και το αντίστροφο, 
    // ή δείχνουμε την τρέχουσα; Συνήθως δείχνουμε τι θα γίνει. 
    // Στο screenshot δείχνει "English", άρα είμαστε σε Greek mode.
    
    const targetLang = (lang === 'el') ? 'en' : 'el';
    const flagIcon = rootPath + 'assets/ui/' + (targetLang === 'en' ? 'lang_en.png' : 'lang_el.png');
    const labelText = (targetLang === 'en') ? 'English' : 'Ελληνικά';

    const langBtn = document.createElement('div');
    langBtn.className = 'drawerItem';
    langBtn.style.marginTop = '10px'; // Λίγο κενό από τα πάνω

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
