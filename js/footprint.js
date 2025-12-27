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
  // fallback legacy
  return (model && model.legacy && model.legacy.labels && model.legacy.labels[lang]) ? model.legacy.labels[lang][dim] : null;
}

function getUIOrder(dim){
  if (model && model.ui && model.ui[dim]) return model.ui[dim].order;
  // fallback legacy: indices 0..n-1
  const lang = getLang();
  const legacy = (model && model.legacy && model.legacy.labels && model.legacy.labels[lang]) ? model.legacy.labels[lang][dim] : [];
  return Array.isArray(legacy) ? legacy.map((_,i)=>String(i)) : [];
}

function T(){
  const lang = getLang();
  return {
    el: {
      title: "Υπολογισμός Αποτυπώματος CO₂",
      subtitle: "Τα αποτελέσματα είναι προσεγγιστικά (σχετικό μοντέλο με πολλαπλασιαστικούς συντελεστές).",
      home: "Κατοίκηση",
      transport: "Μεταφορές",
      lifestyle: "Διατροφή & Προϊόντα",
      homeType: "Τύπος κατοικίας",
      homeCond: "Κατάσταση / μόνωση",
      heating: "Τύπος θέρμανσης",
      homeUse: "Ηλεκτρική κατανάλωση (σε σχέση με τον μέσο όρο)",
      weeklyKm: "Απόσταση με μετακινήσεις (km/εβδομάδα)",
      carType: "Κύρια επιλογή μετακίνησης",
      publicType: "Δημόσια μέσα",
      publicPct: "Ποσοστό χρήσης δημόσιων μέσων",
      alone: "Ταξιδεύω μόνος/η",
      goods: "Κατανάλωση προϊόντων",
      foodLevel: "Ποσότητα / σπατάλη τροφίμων",
      diet: "Τύπος διατροφής",
      flights: "Αεροπορικά ταξίδια (500 km το καθένα)",
      flightHint: "Κάθε ταξίδι υπολογίζεται ως 0.1 t CO₂ (100 kg).",
      total: "Σύνολο",
      calc: "Υπολόγισε",
      dash: "Dashboard"
    },
    en: {
      title: "Carbon Footprint Calculator",
      subtitle: "Approximate results (relative model using multiplicative factors).",
      home: "Home",
      transport: "Transport",
      lifestyle: "Diet & Goods",
      homeType: "Home type",
      homeCond: "Condition / insulation",
      heating: "Heating type",
      homeUse: "Electricity use (vs average)",
      weeklyKm: "Distance travelled (km/week)",
      carType: "Main travel mode",
      publicType: "Public transport",
      publicPct: "Share of public transport",
      alone: "I travel alone",
      goods: "Goods consumption",
      foodLevel: "Food amount / waste",
      diet: "Diet type",
      flights: "Flights (each 500 km)",
      flightHint: "Each trip counts as 0.1 t CO₂ (100 kg).",
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

function compute(){
  const f = (model.factors || {});
  const b = (model.base || {});
  const c = (model.constants || {});
  const t = (model.targets || {});

  // Home
  const homeTypeId = String(document.getElementById("homeType").value);
  const homeCondId = String(document.getElementById("homeCond").value);
  const heatingId = String(document.getElementById("heatingType").value);
  const homeUseFactor = getNumber("homeUse");

  const heatingKg =
    val(b.heatingKgPerYear) *
    val(f.homeType?.[homeTypeId]) *
    val(f.homeCondition?.[homeCondId]) *
    val(f.heatingType?.[heatingId]);

  const useKg = b.homeUseKgPerYear * homeUseFactor;

  const homeValues = [heatingKg/1000, useKg/1000];
  const homeTons = homeValues[0] + homeValues[1];

  // Transport
  const weeklyKm = getNumber("weeklyKm");
  const carIdx = Number(document.getElementById("carType").value);
  const publicId = String(document.getElementById("publicType").value);
  const pPublic = getNumber("publicPct") / 100;
  const travelsAlone = document.getElementById("travelsAlone").checked;
  const carAloneFactor = travelsAlone ? 1 : c.carPoolFactor;

  const carTons =
    weeklyKm * c.weeklyToTonsFactor *
    (1 - pPublic) *
    carAloneFactor *
    f.carType[carIdx];

  const publicTons =
    weeklyKm * c.weeklyToTonsFactor *
    (pPublic) *
    f.publicTransport[publicIdx];

  const transportValues = [carTons, publicTons];
  const transportTons = carTons + publicTons;

  // Lifestyle: goods + food + flights
  const goodsId = String(document.getElementById("goodsLevel").value);
  const foodLevelIdx = Number(document.getElementById("foodLevel").value);
  const dietIdx = Number(document.getElementById("diet").value);
  const trips = getNumber("flightTrips");

  const goodsTons = (b.goodsKgPerYear * f.goodsLevel[goodsIdx]) / 1000;
  const foodTons = (b.foodKgPerYear * f.foodLevel[foodLevelIdx] * f.diet[dietIdx]) / 1000;

  const kgPerTrip = val(c.flightKgPerKmPerPassenger) * val(c.flightTripDistanceKm);
  const flightsTons = (trips * kgPerTrip) / 1000; // 0.1 t each

  const lifestyleValues = [goodsTons, foodTons, flightsTons];
  const lifestyleTons = goodsTons + foodTons + flightsTons;

  const totalTons = homeTons + transportTons + lifestyleTons;

  return {
    totalTons,
    homeValues,
    transportValues,
    lifestyleValues
  };
}

function saveForDashboard(res){
  localStorage.setItem("homeValues", JSON.stringify(res.homeValues));
  localStorage.setItem("transportValues", JSON.stringify(res.transportValues));
  localStorage.setItem("lifestyleValues", JSON.stringify(res.lifestyleValues));
  localStorage.setItem("userTotalTons", String(res.totalTons));
  localStorage.setItem("euTargetTons", String(val(model.targets?.euTargetTonsPerYear)));
}

document.addEventListener("DOMContentLoaded", async ()=>{
  initLangButtons();

    const resp = await fetch("../assets/footprintModel.json", {cache:"no-store"});
  model = await resp.json();

  const lang = getLang();
  const labels = model.labels[lang];
  const t = T();

  // Titles
  document.getElementById("title").textContent = t.title;
  document.getElementById("subtitle").textContent = t.subtitle;

  document.getElementById("homeTitle").textContent = t.home;
  document.getElementById("trTitle").textContent = t.transport;
  document.getElementById("lifeTitle").textContent = t.lifestyle;

  document.getElementById("lblHomeType").textContent = t.homeType;
  document.getElementById("lblHomeCond").textContent = t.homeCond;
  document.getElementById("lblHeating").textContent = t.heating;
  document.getElementById("lblHomeUse").textContent = t.homeUse;

  document.getElementById("lblWeeklyKm").textContent = t.weeklyKm;
  document.getElementById("lblCarType").textContent = t.carType;
  document.getElementById("lblPublicType").textContent = t.publicType;
  document.getElementById("lblPublicPct").textContent = t.publicPct;
  document.getElementById("lblAlone").textContent = t.alone;

  document.getElementById("lblGoods").textContent = t.goods;
  document.getElementById("lblFoodLevel").textContent = t.foodLevel;
  document.getElementById("lblDiet").textContent = t.diet;
  document.getElementById("lblFlights").textContent = t.flights;
  document.getElementById("flightHint").textContent = t.flightHint;

  document.getElementById("lblTotal").textContent = t.total;
  document.getElementById("btnCalc").textContent = t.calc;
  document.getElementById("btnDash").textContent = t.dash;

  // Populate selects
  populateSelect(document.getElementById("homeType"), "homeType");
  populateSelect(document.getElementById("homeCond"), "homeCondition");
  populateSelect(document.getElementById("heatingType"), "heatingType");

  populateSelect(document.getElementById("carType"), "carType");
  populateSelect(document.getElementById("publicType"), "publicTransport");

  populateSelect(document.getElementById("goodsLevel"), "goodsLevel");
  populateSelect(document.getElementById("foodLevel"), "foodLevel");
  populateSelect(document.getElementById("diet"), "diet");

  // Range display
  const homeUse = document.getElementById("homeUse");
  const publicPct = document.getElementById("publicPct");
  function updateRanges(){
    document.getElementById("homeUseVal").textContent = `${fmt(homeUse.value,2)}×`;
    document.getElementById("publicPctVal").textContent = `${publicPct.value}%`;
  }
  homeUse.addEventListener("input", updateRanges);
  publicPct.addEventListener("input", updateRanges);
  updateRanges();

  function updateTotal(){
    const res = compute();
    document.getElementById("totalVal").textContent = fmt(res.totalTons, 2);
  }

  // live update
  document.querySelectorAll("select,input").forEach(el=>{
    el.addEventListener("input", updateTotal);
    el.addEventListener("change", updateTotal);
  });
  updateTotal();

  document.getElementById("btnCalc").addEventListener("click", updateTotal);

  document.getElementById("btnDash").addEventListener("click", ()=>{
    const res = compute();
    saveForDashboard(res);
    go("./dashboard.html");
  });
});
