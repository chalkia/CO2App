const LANG_KEY = "lang"; // 'el' | 'en'

function getLang(){
  const l = localStorage.getItem(LANG_KEY);
  return (l === "en" || l === "el") ? l : "el";
}

function setLang(lang){
  localStorage.setItem(LANG_KEY, lang);
}

function initLangButtons(){
  const lang = getLang();
  document.querySelectorAll("[data-lang]").forEach(btn=>{
    const bLang = btn.getAttribute("data-lang");
    if(bLang){
        btn.classList.toggle("active", bLang === lang);
        btn.addEventListener("click", ()=>{
        setLang(bLang);
        // reload to re-render strings
        location.reload();
        });
    }
  });
}

function go(path){
  location.href = path;
}

function fmt(num, digits=2){
  const n = Number(num);
  if (!Number.isFinite(n)) return "—";
  return n.toFixed(digits);
}

function applyUnitYearElements(){
  const lang = getLang();
  const unit = (lang === "en") ? " tCO₂/year" : " tCO₂/έτος";
  document.querySelectorAll(".unitYear").forEach(el=>{
    el.textContent = unit;
  });
}

// --- Landscape Mode Enforcement ---
function setupLandscapeEnforcement() {
  if (screen.orientation && typeof screen.orientation.lock === 'function') {
    screen.orientation.lock('landscape').catch(() => {});
  }

  if (!document.getElementById('rotateOverlay')) {
    const overlay = document.createElement('div');
    overlay.id = 'rotateOverlay';
    const lang = getLang();
    const isEn = (lang === 'en');
    const title = isEn ? 'Please Rotate Your Device' : 'Γυρίστε τη συσκευή σας';
    const desc = isEn 
      ? 'This app is designed to run in landscape mode for the best experience.' 
      : 'Η εφαρμογή είναι σχεδιασμένη να λειτουργεί αποκλειστικά σε οριζόντια προβολή (Landscape).';

    overlay.innerHTML = `
      <div class="rotateCard">
        <div class="rotateIconWrapper">
          <svg class="rotatePhoneSvg" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect class="phoneBody" x="19" y="8" width="26" height="48" rx="4" stroke="currentColor" stroke-width="3" fill="rgba(255,255,255,0.08)"/>
            <circle cx="32" cy="50" r="1.5" fill="currentColor"/>
            <line x1="28" y1="12" x2="36" y2="12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            <path class="arrowPath" d="M48 18 C57 27 55 43 43 51" stroke="#74a974" stroke-width="3" stroke-linecap="round"/>
            <polyline points="46,13 50,19 43,20" fill="none" stroke="#74a974" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h2 class="rotateTitle">${title}</h2>
        <p class="rotateDesc">${desc}</p>
      </div>
    `;
    document.body.appendChild(overlay);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupLandscapeEnforcement);
} else {
  setupLandscapeEnforcement();
}