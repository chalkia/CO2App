async function loadConfig(){
  try{
    const r = await fetch(`../config.json?v=${Date.now()}`, {cache:"no-store"});
    if (!r.ok) return null;
    return await r.json();
  }catch(e){ return null; }
}

document.addEventListener("DOMContentLoaded", async ()=>{
  initLangButtons();
  
  // Bind UI text (Simulated)
  const lang = getLang();
  document.getElementById("saveBtn").textContent = (lang==="el") ? "Αποθήκευση" : "Save";
  document.getElementById("resetBtn").textContent = (lang==="el") ? "Επαναφορά" : "Reset";

  // Helpers
  const setVal = (id, v) => { const el = document.getElementById(id); if(el) el.value = v; };
  const getVal = (id) => { const el = document.getElementById(id); return el ? Number(el.value) : NaN; };
  const setChk = (id, v) => { const el = document.getElementById(id); if(el) el.checked = v; };
  const getChk = (id) => { const el = document.getElementById(id); return el ? el.checked : false; };

  // Load defaults
  const cfg = await loadConfig() || {};
  const defaults = {
    ci: cfg.gridCI_kgCO2_per_kWh || 0.25,
    social: cfg.socialShare_tCO2_per_year || 1.2,
    metro: cfg.metro_tram_kWh_per_pkm || 0.05
  };

  // Load current overrides
  const loadOv = (key, elVal, elChk, def) => {
    const enabled = localStorage.getItem(key+"_OVERRIDE_ENABLED") === "1";
    const val = Number(localStorage.getItem(key+"_OVERRIDE_VALUE"));
    setChk(elChk, enabled);
    setVal(elVal, enabled && Number.isFinite(val) ? val : def);
  };

  loadOv("gridCI_kgCO2_per_kWh", "ciValue", "ciEnable", defaults.ci);
  loadOv("socialShare_tCO2_per_year", "socialValue", "socialEnable", defaults.social);
  loadOv("metro_tram_kWh_per_pkm", "metroEnergyValue", "metroEnergyEnable", defaults.metro);

  // Save
  document.getElementById("saveBtn").addEventListener("click", ()=>{
    const saveOv = (key, elVal, elChk) => {
      const en = getChk(elChk);
      const v = getVal(elVal);
      localStorage.setItem(key+"_OVERRIDE_ENABLED", en ? "1" : "0");
      if(en) localStorage.setItem(key+"_OVERRIDE_VALUE", v);
    };
    
    saveOv("gridCI_kgCO2_per_kWh", "ciValue", "ciEnable");
    saveOv("socialShare_tCO2_per_year", "socialValue", "socialEnable");
    saveOv("metro_tram_kWh_per_pkm", "metroEnergyValue", "metroEnergyEnable");
    
    alert((lang==="el") ? "Αποθηκεύτηκαν" : "Saved");
  });

  // Reset
  document.getElementById("resetBtn").addEventListener("click", ()=>{
    ["gridCI_kgCO2_per_kWh", "socialShare_tCO2_per_year", "metro_tram_kWh_per_pkm"].forEach(k => {
        localStorage.removeItem(k+"_OVERRIDE_ENABLED");
        localStorage.removeItem(k+"_OVERRIDE_VALUE");
    });
    location.reload();
  });
  
  document.getElementById("backBtn").addEventListener("click", ()=>history.back());
});