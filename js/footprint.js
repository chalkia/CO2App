let model = null;

function val(x){
  if (x === null || x === undefined) return 0;
  if (typeof x === 'number') return x;
  if (typeof x === 'object' && 'value' in x) return Number(x.value);
  return Number(x) || 0;
}

function getUILabel(dim){
  const lang = getLang();
  if (model && model.ui && model.ui[dim]) return model.ui[dim].labels[lang];
  return (model && model.legacy && model.legacy.labels && model.legacy.labels[lang]) ? model.legacy.labels[lang][dim] : null;
}

function getUIOrder(dim){
  if (model && model.ui && model.ui[dim]) return model.ui[dim].order;
  const lang = getLang();
  const legacy = (model && model.legacy && model.legacy.labels && model.legacy.labels[lang]) ? model.legacy.labels[lang][dim] : [];
  return Array.isArray(legacy) ? legacy.map((_,i)=>String(i)) : [];
}

function T(){
  const lang = getLang();
  return {
    el: {
      title: "Υπολογισμός Αποτυπώματος CO₂",
      subtitle: "Τα αποτελέσματα είναι προσεγγιστικά, αναλυτικά στοιχεία για το μοντέλο δες στην Τεκμηρίωση".,
      home: "Κατοικία",
      transport: "Μεταφορές",
      lifestyle: "Διατροφή και Lifestyle",
      homeType: "Τύπος κατοικίας",
      homeCond: "Κατάσταση / μόνωση",
      heating: "Τύπος θέρμανσης",
      homeUse: "Πώς κρίνετε τη χρήση ηλεκτρικής ενέργειας που κάνετε στο σπίτι;",
      weeklyKm: "Απόσταση με μετακινήσεις (km/εβδομάδα)",
      carType: "Κύρια επιλογή μετακίνησης",
      publicType: "Δημόσια μέσα",
      publicPct: "Ποσοστό χρήσης δημόσιων μέσων",
      alone: "Ταξιδεύω μόνος/η",
      goods: "Κατανάλωση προϊόντων",
      goodsHint: "Αφορά καταναλωτικά προϊόντα (π.χ. ρούχα, ηλεκτρονικά, lifestyle).",
      foodLevel: "Σπατάλη τροφίμων",
      diet: "Τύπος διατροφής",
      flights: "Αεροπορικά ταξίδια",
      flightHint: "Ταξίδια μέσης απόστασης (εντός Ευρώπης).",
      total: "Σύνολο",
      calc: "Υπολόγισε",
      dash: "Διαγράμματα"
    },
    en: {
      title: "Carbon Footprint Calculator",
      subtitle: "Approximate results (relative model using multiplicative factors).",
      home: "Home",
      transport: "Transport",
      lifestyle: "Diet & Lifestyle",
      homeType: "Home type",
      homeCond: "Condition / insulation",
      heating: "Heating type",
      homeUse: "How would you rate your household electricity use?",
      weeklyKm: "Distance travelled (km/week)",
      carType: "Main travel mode",
      publicType: "Public transport",
      publicPct: "Share of public transport",
      alone: "I travel alone",
      goods: "Goods consumption",
      goodsHint: "Consumer goods (e.g., clothes, electronics, lifestyle items).",
      foodLevel: "Food waste",
      diet: "Diet type",
      flights: "Flights",
      flightHint: "Medium-distance trips (within Europe).",
      total: "Total",
      calc: "Calculate",
      dash: "Dashboard"
    }
  }[lang];
}

function populateSelect(sel, dim){
  sel.innerHTML = "";
  const order = getUIOrder(dim);
  const labels = getUILabel(dim);

  order.forEach((id, i)=>{
    const opt = document.createElement("option");
    opt.value = String(id);
    if (labels && typeof labels === 'object' && !Array.isArray(labels)){
      opt.textContent = labels[id] ?? String(id);
    } else if (Array.isArray(labels)){
      opt.textContent = labels[i] ?? String(id);
    } else {
      opt.textContent = String(id);
    }
    sel.appendChild(opt);
  });
}

function getNumber(id){
  const v = Number(document.getElementById(id).value);
  return Number.isFinite(v) ? v : 0;
}

// === FIX: Updated compute function to handle String IDs correctly ===
function compute(){
  if (!model) return { totalTons:0, homeValues:[0,0], transportValues:[0,0], lifestyleValues:[0,0,0] };

  const f = (model.factors || {});
  const b = (model.base || {});
  const c = (model.constants || {});

  // --- HOME ---
  const homeTypeId = document.getElementById("homeType").value; // string key
  const homeCondId = document.getElementById("homeCond").value; // string key
  const heatingId = document.getElementById("heatingType").value; // string key
  const homeUseFactor = getNumber("homeUse");

  // Fetch factors using string keys
  const fHomeType = val(f.homeType?.[homeTypeId] ?? 1);
  const fHomeCond = val(f.homeCondition?.[homeCondId] ?? 1);
  const fHeating = val(f.heatingType?.[heatingId] ?? 0);

  const heatingKg = val(b.heatingKgPerYear) * fHomeType * fHomeCond * fHeating;
  const useKg = val(b.homeUseKgPerYear) * homeUseFactor;

  const homeValues = [heatingKg/1000, useKg/1000];
  const homeTons = homeValues[0] + homeValues[1];

  // --- TRANSPORT ---
  const weeklyKm = getNumber("weeklyKm");

  // Car Type is a string key now (e.g. 'petrol', 'diesel')
  const carId = document.getElementById("carType").value; 
  const fCar = val(f.carType?.[carId] ?? 0);

  // Public Transport Type
  const publicId = document.getElementById("publicType").value;
  const fPublic = val(f.publicTransport?.[publicId] ?? 0);

  const pPublic = getNumber("publicPct") / 100;

  // Fix Checkbox ID mismatch (travelsAlone vs alone)
  const aloneEl = document.getElementById("travelsAlone") || document.getElementById("alone");
  const travelsAlone = aloneEl ? aloneEl.checked : false;
  const carPoolFactor = travelsAlone ? 1.0 : val(c.carPoolFactor);

  const carTons =
    weeklyKm * val(c.weeklyToTonsFactor) *
    (1 - pPublic) *
    carPoolFactor *
    fCar;

  const publicTons =
    weeklyKm * val(c.weeklyToTonsFactor) *
    (pPublic) *
    fPublic;

  const transportValues = [carTons, publicTons];
  const transportTons = carTons + publicTons;

  // --- LIFESTYLE ---
  const goodsId = document.getElementById("goodsLevel").value;
  const fGoods = val(f.goodsLevel?.[goodsId] ?? 1);

  const foodId = document.getElementById("foodLevel").value;
  const fFood = val(f.foodLevel?.[foodId] ?? 1);

  const dietId = document.getElementById("diet").value;
  const fDiet = val(f.diet?.[dietId] ?? 1);

  const trips = getNumber("flightTrips");

  const goodsTons = (val(b.goodsKgPerYear) * fGoods) / 1000;
  const foodTons = (val(b.foodKgPerYear) * fFood * fDiet) / 1000;

  const kgPerTrip = val(c.flightKgPerKmPerPassenger) * val(c.flightTripDistanceKm);
  const flightsTons = (trips * kgPerTrip) / 1000; 

  const lifestyleValues = [foodTons, goodsTons, flightsTons]; // Order: Diet, Goods, Flights
  const lifestyleTons = foodTons + goodsTons + flightsTons;

  const totalTons = homeTons + transportTons + lifestyleTons;

  return {
    totalTons,
    homeValues,
    transportValues,
    lifestyleValues
  };
}

// === FIX: Save keys that match dashboard.js ===
function saveForDashboard(res){
  localStorage.setItem("CO2_HOME_VALUES", JSON.stringify(res.homeValues));
  localStorage.setItem("CO2_TRANSPORT_VALUES", JSON.stringify(res.transportValues));
  localStorage.setItem("CO2_LIFE_VALUES", JSON.stringify(res.lifestyleValues));

  localStorage.setItem("USER_TOTAL", String(res.totalTons));

  // Default target if missing
  const target = model && model.targets ? val(model.targets.euTargetTonsPerYear) : 2.3;
  localStorage.setItem("EU_TARGET", String(target));
}

document.addEventListener("DOMContentLoaded", async ()=>{
  initLangButtons();

  const resp = await fetch("../assets/footprintModel.json", {cache:"no-store"});
  model = await resp.json();

  const lang = getLang();
  const t = T();

  // Titles
  const titleEl = document.getElementById("title");
  if(titleEl) titleEl.textContent = t.title;
  const subEl = document.getElementById("subtitle");
  if(subEl) subEl.textContent = t.subtitle;

  const hTitle = document.getElementById("homeTitle"); if(hTitle) hTitle.textContent = t.home;
  const tTitle = document.getElementById("trTitle"); if(tTitle) tTitle.textContent = t.transport;
  const lTitle = document.getElementById("lifeTitle"); if(lTitle) lTitle.textContent = t.lifestyle;

  // Section navigation chips
  const navHome = document.getElementById("navHome");
  const navTransport = document.getElementById("navTransport");
  const navLifestyle = document.getElementById("navLifestyle");
  if (navHome) navHome.textContent = t.home;
  if (navTransport) navTransport.textContent = t.transport;
  if (navLifestyle) navLifestyle.textContent = t.lifestyle;

  function goTo(id){
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({behavior:"smooth", block:"start"});
  }
  if (navHome) navHome.addEventListener("click", ()=>goTo("cardHome"));
  if (navTransport) navTransport.addEventListener("click", ()=>goTo("cardTransport"));
  if (navLifestyle) navLifestyle.addEventListener("click", ()=>goTo("cardLifestyle"));

  // Labels
  const lblIds = {
    "lblHomeType": t.homeType, "lblHomeCond": t.homeCond, "lblHeating": t.heating, "lblHomeUse": t.homeUse,
    "lblWeeklyKm": t.weeklyKm, "lblCarType": t.carType, "lblPublicType": t.publicType, "lblPublicPct": t.publicPct,
    "lblAlone": t.alone, "lblGoods": t.goods, "lblFoodLevel": t.foodLevel, "lblDiet": t.diet, "lblFlights": t.flights,
    "lblTotal": t.total
  };

  for(const [id, txt] of Object.entries(lblIds)){
    const el = document.getElementById(id);
    if(el) el.textContent = txt;
  }

  const gh = document.getElementById("goodsHint"); if (gh) gh.textContent = t.goodsHint;
  const fh = document.getElementById("flightHint"); if (fh) fh.textContent = t.flightHint;

  const btnCalc = document.getElementById("btnCalc"); if(btnCalc) btnCalc.textContent = t.calc;
  const btnDash = document.getElementById("btnDash"); if(btnDash) btnDash.textContent = t.dash;

  // Populate selects
  populateSelect(document.getElementById("homeType"), "homeType");
  populateSelect(document.getElementById("homeCond"), "homeCondition");
  populateSelect(document.getElementById("heatingType"), "heatingType");
  populateSelect(document.getElementById("carType"), "carType");
  populateSelect(document.getElementById("publicType"), "publicTransport");
  populateSelect(document.getElementById("goodsLevel"), "goodsLevel");
  populateSelect(document.getElementById("foodLevel"), "foodLevel");
  populateSelect(document.getElementById("diet"), "diet");

  // Range display logic
  const homeUse = document.getElementById("homeUse");
  const publicPct = document.getElementById("publicPct");

  function homeUseQual(v){
    const lang = getLang();
    const x = Number(v);
    const el = ["Πολύ συνετή", "Συνετή", "Κανονική", "Υπερβολική", "Κατάχρηση"];
    const en = ["Very frugal", "Frugal", "Normal", "High", "Excessive"];
    const levels = (lang === "en") ? en : el;
    let idx = 2;
    if (x <= 0.70) idx = 0;
    else if (x <= 0.90) idx = 1;
    else if (x <= 1.10) idx = 2;
    else if (x <= 1.30) idx = 3;
    else idx = 4;
    return levels[idx];
  }

  function updateRanges(){
    const hv = document.getElementById("homeUseVal");
    if (hv) {
      hv.textContent = `${fmt(homeUse.value,2)}×`;
      hv.style.display = "block"; // Ensure it shows
    }
    const hl = document.getElementById("homeUseLabel");
    if (hl) hl.textContent = homeUseQual(homeUse.value);

    const pp = document.getElementById("publicPctVal");
    if(pp) pp.textContent = `${publicPct.value}%`;
  }

  homeUse.addEventListener("input", updateRanges);
  publicPct.addEventListener("input", updateRanges);
  updateRanges();

  function updateTotal(){
    try {
      const res = compute();
      const tv = document.getElementById("totalVal");
      if(tv) tv.textContent = fmt(res.totalTons, 2);
    } catch(e) {
      console.error("Calculation error:", e);
    }
  }

  // Live update events
  document.querySelectorAll("select,input").forEach(el=>{
    el.addEventListener("input", updateTotal);
    el.addEventListener("change", updateTotal);
  });

  // Initial calculation to prevent "—" on load
  setTimeout(updateTotal, 500);

  if(btnCalc) btnCalc.addEventListener("click", updateTotal);

  if(btnDash) {
    btnDash.addEventListener("click", ()=>{
      const res = compute();
      saveForDashboard(res);
      // Assuming footprint.html is in /pages/, dashboard is also in /pages/
      go("./dashboard.html");
    });
  }
});
