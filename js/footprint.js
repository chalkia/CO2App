document.addEventListener('DOMContentLoaded', async () => {
  // 1. ΡΥΘΜΙΣΕΙΣ & ΜΕΤΑΒΛΗΤΕΣ
const MODEL_URL = 'footprintModel.json';
  
  let modelData = null;
  
  // Κείμενα UI (Fallback καθώς λείπουν από το JSON)
  const UI_TEXTS = {
    el: {
      appTitle: "CO2 Footprint",
      appSubtitle: "Υπολογισμός ανθρακικού αποτυπώματος",
      catHousing: "Στέγαση",
      catTransport: "Μετακίνηση",
      catLifestyle: "Τρόπος Ζωής",
      lblHomeType: "Τύπος Κατοικίας",
      lblHomeCond: "Μόνωση / Κατάσταση",
      lblHeating: "Θέρμανση",
      lblOccupants: "Άτομα στο σπίτι",
      lblSolar: "Ηλιακός Θερμοσίφωνας",
      lblElectricity: "Χρήση Ηλεκτρισμού",
      lblWeeklyKm: "Χιλιόμετρα / εβδομάδα (ΙΧ)",
      lblPublicUse: "Χρήση Δημόσιας Συγκοινωνίας",
      lblCarType: "Τύπος Οχήματος",
      lblAlone: "Οδηγώ μόνος/η",
      lblPublicMode: "Μέσο Μαζικής Μεταφοράς",
      lblFlightDom: "Πτήσεις Εσωτερικού (ετησίως)",
      lblFlightEu: "Πτήσεις Εξωτερικού (ετησίως)",
      lblDiet: "Διατροφή",
      lblGoods: "Καταναλωτικές Συνήθειες",
      lblDigital: "Ψηφιακό Αποτύπωμα",
      lblSocial: "Κρατικές Υπηρεσίες (Μερίδιο)",
      lblTotal: "ΣΥΝΟΛΟ",
      btnRecalc: "Επαναφορά",
      btnDetails: "Αναλυτικά",
      unitYear: "tCO2e / έτος",
      condLabels: ["Χωρίς Μόνωση (Πριν το '80)", "Μέτρια (1980-2010)", "Σύγχρονη (ΚΕΝΑΚ)"]
    },
    en: {
      appTitle: "CO2 Footprint",
      appSubtitle: "Carbon footprint calculator",
      catHousing: "Housing",
      catTransport: "Transport",
      catLifestyle: "Lifestyle",
      lblHomeType: "Home Type",
      lblHomeCond: "Insulation / Condition",
      lblHeating: "Heating Source",
      lblOccupants: "Occupants",
      lblSolar: "Solar Water Heater",
      lblElectricity: "Electricity Usage",
      lblWeeklyKm: "Km / week (Car)",
      lblPublicUse: "Public Transport Usage",
      lblCarType: "Vehicle Type",
      lblAlone: "Driving alone",
      lblPublicMode: "Public Transport Mode",
      lblFlightDom: "Domestic Flights (per year)",
      lblFlightEu: "Intl. Flights (per year)",
      lblDiet: "Diet",
      lblGoods: "Consumption Habits",
      lblDigital: "Digital Footprint",
      lblSocial: "Public Services Share",
      lblTotal: "TOTAL",
      btnRecalc: "Reset",
      btnDetails: "Dashboard",
      unitYear: "tCO2e / year",
      condLabels: ["No Insulation (Pre-80s)", "Average (1980-2010)", "Modern (Energy Eff.)"]
    }
  };

  // DOM Elements
  const navHome = document.getElementById('navHome');
  const navTransport = document.getElementById('navTransport');
  const navLifestyle = document.getElementById('navLifestyle');
  
  const cardHome = document.getElementById('cardHome');
  const cardTransport = document.getElementById('cardTransport');
  const cardLifestyle = document.getElementById('cardLifestyle');
  const cardSummary = document.getElementById('cardSummary');
  
  const stepPrev = document.getElementById('stepPrev');
  const stepNext = document.getElementById('stepNext');
  const stepTitle = document.getElementById('stepTitle');
  
  const cards = [cardHome, cardTransport, cardLifestyle];
  const navs = [navHome, navTransport, navLifestyle];
  let currentCardIndex = 0;

  // 2. INIT
  async function init() {
    try {
      const v = (typeof APP_BUILD !== 'undefined') ? APP_BUILD : Date.now();
      const resp = await fetch(MODEL_URL + '?v=' + v);
      if (!resp.ok) throw new Error('Model not found at ' + MODEL_URL);
      
      modelData = await resp.json();
      
      // Έλεγχος συμβατότητας Schema
      if (modelData.meta && modelData.meta.schemaVersion !== 2) {
        console.warn("Warning: JSON schema version mismatch. Expected v2.");
      }

      populateUI();
      loadFromStorage();
      calculateAll();
      updateActiveCard(0);

    } catch (err) {
      console.error('Init Error:', err);
      const sub = document.getElementById('subtitle');
      if(sub) sub.textContent = 'Error: Data file load failed. ' + err.message;
    }
  }

  // 3. UI POPULATION
  function populateUI() {
    const lang = getLang();
    const T = UI_TEXTS[lang] || UI_TEXTS['el'];

    setText('title', T.appTitle);
    setText('subtitle', T.appSubtitle);
    
    setText('homeTitle', T.catHousing);
    setText('trTitle', T.catTransport);
    setText('lifeTitle', T.catLifestyle);

    setText('navHome', T.catHousing);
    setText('navTransport', T.catTransport);
    setText('navLifestyle', T.catLifestyle);

    setLabel('lblHomeType', T.lblHomeType);
    setLabel('lblHomeCond', T.lblHomeCond);
    setLabel('lblHeating', T.lblHeating);
    setLabel('lblOccupants', T.lblOccupants);
    setText('lblSolarDHW', T.lblSolar);
    setLabel('lblHomeUse', T.lblElectricity);

    setLabel('lblWeeklyKm', T.lblWeeklyKm);
    setLabel('lblPublicPct', T.lblPublicUse);
    setLabel('lblCarType', T.lblCarType);
    setText('lblAlone', T.lblAlone);
    setLabel('lblPublicTransport', T.lblPublicMode);
    setLabel('lblFlightsDomestic', T.lblFlightDom);
    setLabel('lblFlightsEurope', T.lblFlightEu);

    setLabel('lblDiet', T.lblDiet);
    setLabel('lblGoodsProfile', T.lblGoods);
    setLabel('lblDigitalLevel', T.lblDigital);
    
    // Social share (σταθερή τιμή)
    if(modelData && modelData.base) {
        const socShare = modelData.base.socialShareKgCO2PerYear.value;
        setText('lblSocialShare', T.lblSocial + ': ');
        setText('socialShareVal', (socShare / 1000).toFixed(2) + ' t');
    }

    setText('lblTotal', T.lblTotal);
    setText('btnCalc', T.btnRecalc);
    setText('btnDash', T.btnDetails);

    document.querySelectorAll('.unitYear').forEach(el => el.textContent = T.unitYear);

    // Γέμισμα Dropdowns από JSON (modelData.ui)
    if (modelData && modelData.ui) {
      fillSelectFromUI('homeType', modelData.ui.homeType, lang);
      // Το homeCondition είναι range στο HTML, αλλά τα labels έρχονται από εδώ αν θέλουμε
      // fillSelectFromUI('homeCondition', modelData.ui.homeCondition, lang, 'homeCond'); 
      fillSelectFromUI('heatingType', modelData.ui.heatingType, lang);
      fillSelectFromUI('occupants', modelData.ui.occupants, lang);
      fillSelectFromUI('carType', modelData.ui.carType, lang);
      fillSelectFromUI('publicType', modelData.ui.publicTransport, lang);
      fillSelectFromUI('diet', modelData.ui.diet, lang);
    }
  }

  function fillSelectFromUI(uiKey, uiObj, lang, domIdOverride) {
    const domId = domIdOverride || uiKey;
    const el = document.getElementById(domId);
    if (!el || !uiObj) return;

    el.innerHTML = '';
    const order = uiObj.order || [];
    const labels = uiObj.labels[lang] || uiObj.labels['en']; 

    order.forEach(key => {
      let opt = document.createElement('option');
      opt.value = key;
      opt.text = labels[key] || key;
      el.add(opt);
    });
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if(el) el.textContent = text;
  }

  function setLabel(id, text) {
    const el = document.getElementById(id);
    if(el) el.textContent = text;
  }

  // 4. ΥΠΟΛΟΓΙΣΜΟΙ
  function calculateAll() {
    if(!modelData) return;

    // --- Housing ---
    const heatType = getVal('heatingType');
    const homeType = getVal('homeType');
    
    // Mapping Range (0-2) to JSON Keys
    // 0=Bad(pre1980), 1=Med(post1980), 2=Good(modern)
    const hcVal = parseInt(document.getElementById('homeCond').value);
    let homeCondKey = 'pre1980';
    if(hcVal === 1) homeCondKey = 'post1980';
    if(hcVal === 2) homeCondKey = 'modern';

    const baseHeat = modelData.base.heatingDemandKWhApartment.value[homeCondKey] || 5000;
    const typeFactor = modelData.factors.homeType[homeType] ? modelData.factors.homeType[homeType].value : 1.0;
    const heatEF_tMWh = modelData.factors.heatingType[heatType] ? modelData.factors.heatingType[heatType].value : 0;
    
    // (kWh * typeFactor / 1000) * tCO2_per_MWh * 1000 => kgCO2
    let kg_heat = (baseHeat * typeFactor / 1000) * heatEF_tMWh * 1000;

    // Ηλεκτρισμός
    const elecLvl = parseInt(document.getElementById('homeUseLevel').value); // 0-100
    const eMin = modelData.base.homeOtherElectricityAnchorsKWhPerYear.value.min;
    const eTyp = modelData.base.homeOtherElectricityAnchorsKWhPerYear.value.typical;
    const eMax = modelData.base.homeOtherElectricityAnchorsKWhPerYear.value.max;
    
    let kwh_elec = 0;
    if (elecLvl <= 50) {
      kwh_elec = eMin + ( (elecLvl)/50 * (eTyp - eMin) );
    } else {
      kwh_elec = eTyp + ( (elecLvl-50)/50 * (eMax - eTyp) );
    }
    
    const gridCI = modelData.parameters.gridCI_kgCO2_per_kWh.value;
    let kg_elec = kwh_elec * gridCI;

    // ΖΝΧ
    const occ = parseInt(getVal('occupants'));
    const hasSolar = document.getElementById('solarDHW').checked;
    
    const dhwBase = modelData.base.dhwKWhPerPersonPerYear.value;
    const dhwBackup = modelData.base.dhwBackupKWhPerPersonPerYear.value;
    
    const kwh_dhw_per_person = hasSolar ? dhwBackup : dhwBase;
    const kg_dhw = (kwh_dhw_per_person * occ) * gridCI;

    // Σύνολο ανά άτομο
    const kg_housing_total = (kg_heat + kg_elec + kg_dhw) / occ;


    // --- Transport ---
    // Αυτοκίνητο
    const wkKm = parseFloat(getVal('weeklyKm')) || 0;
    const carType = getVal('carType');
    const alone = document.getElementById('alone').checked;
    
    let carEF = 0;
    const carFactorObj = modelData.factors.carType[carType];
    if (carFactorObj) {
        if (carFactorObj.type === 'derived') {
             carEF = gridCI * modelData.parameters.evConsumption_kWh_per_km.value;
        } else {
             carEF = carFactorObj.value;
        }
    }
    const carPoolFactor = alone ? 1.0 : 0.6; 
    const kg_car = wkKm * 52 * carEF * carPoolFactor;

    // Δημόσια Συγκοινωνία
    const pubPct = parseInt(document.getElementById('publicPct').value); 
    const pubKmWeek = pubPct; // Θεωρούμε το slider ως km/week
    document.getElementById('publicKmVal').textContent = pubKmWeek + ' km/week';
    
    const pubType = getVal('publicType');
    const pubEF = modelData.factors.publicTransport[pubType] ? modelData.factors.publicTransport[pubType].value : 0;
    const kg_public = pubKmWeek * 52 * pubEF;

    // Αεροπλάνα (ΔΙΟΡΘΩΜΕΝΗ ΛΟΓΙΚΗ)
    const flyDom = parseFloat(getVal('flightTripsDomestic')) || 0;
    const flyEu = parseFloat(getVal('flightTripsEurope')) || 0;
    
    const distDom = modelData.constants.flightTripDistanceKmDomestic.value;
    const distEu = modelData.constants.flightTripDistanceKmEurope.value;
    
    // Fallback σε περίπτωση που δεν έχει ενημερωθεί ακόμα το JSON
    const efDom = modelData.constants.flightKgPerKmDomestic ? 
                  modelData.constants.flightKgPerKmDomestic.value : 
                  (modelData.constants.flightKgPerKmPerPassenger ? modelData.constants.flightKgPerKmPerPassenger.value : 0.2);
                  
    const efEu = modelData.constants.flightKgPerKmEurope ? 
                 modelData.constants.flightKgPerKmEurope.value : 
                 (modelData.constants.flightKgPerKmPerPassenger ? modelData.constants.flightKgPerKmPerPassenger.value : 0.2);
    
    const kg_fly = (flyDom * distDom * efDom) + (flyEu * distEu * efEu);

    const kg_transport_total = kg_car + kg_public + kg_fly;


    // --- Lifestyle ---
    // Διατροφή
    const dietType = getVal('diet');
    const dietBase = modelData.base.dietKgCO2PerYear_unit.value;
    const dietFactor = modelData.factors.diet[dietType] ? modelData.factors.diet[dietType].value : 1.0;
    const kg_food = dietBase * dietFactor;

    // Αγαθά
    const goodsLvl = parseInt(document.getElementById('goodsLevel').value);
    const goodsBase = modelData.base.goodsKgCO2PerYear_unit.value;
    // Linear interp: 0->0.4, 100->2.2 (approx)
    const gFactor = 0.4 + (goodsLvl / 100) * 1.8; 
    const kg_goods = goodsBase * gFactor;

    // Ψηφιακά
    const digLvl = parseInt(document.getElementById('digitalLevel').value);
    const digBase = modelData.base.digitalKgCO2PerYear_unit.value;
    const dFactor = 0.4 + (digLvl / 100) * 1.4; 
    const kg_digital = digBase * dFactor;

    // Κοινωνικό
    const kg_social = modelData.base.socialShareKgCO2PerYear.value;

    const kg_lifestyle_total = kg_food + kg_goods + kg_digital + kg_social;


    // --- TOTALS ---
    const totalKg = kg_housing_total + kg_transport_total + kg_lifestyle_total;
    const totalTons = totalKg / 1000;


    // --- UI UPDATES ---
    updateKpi('homeKpi', kg_housing_total);
    updateKpi('trKpi', kg_transport_total);
    updateKpi('lifeKpi', kg_lifestyle_total);
    
    document.getElementById('totalVal').textContent = totalTons.toFixed(2);
    
    // Target Check
    const target = modelData.targets.euTargetTonsPerYear.value;
    const diff = totalTons - target;
    const elPct = document.getElementById('reducePct');
    
    if(diff > 0) {
      elPct.innerHTML = `Στόχος 2030: <b>${target}t</b>. Είσαι <b>+${diff.toFixed(1)}t</b> πάνω.`;
      elPct.style.color = "#d32f2f";
    } else {
      elPct.innerHTML = `Στόχος 2030: <b>${target}t</b>. Μπράβο! Είσαι εντός στόχου.`;
      elPct.style.color = "#388e3c";
    }

    updateStepKpi(totalTons);
    updateRangeLabels(hcVal, elecLvl, goodsLvl, digLvl);
    
    // Αποθήκευση για Dashboard
    saveToStorage(kg_housing_total, kg_transport_total, kg_lifestyle_total, totalTons);
  }

  function updateKpi(id, kg) {
    const t = kg / 1000;
    document.getElementById(id).textContent = t.toFixed(2);
  }

  function updateStepKpi(total) {
    const el = document.getElementById('stepKpi');
    if(el) el.textContent = total.toFixed(1) + ' t';
  }

  function updateRangeLabels(hc, elec, goods, dig) {
    const lang = getLang();
    const T = UI_TEXTS[lang] || UI_TEXTS['el'];
    
    // Home Cond Labels
    const condLabel = document.getElementById('homeCondLabel');
    if(condLabel && T.condLabels[hc]) condLabel.textContent = T.condLabels[hc];

    // Simple helpers for others
    document.getElementById('homeUseLabel').textContent = (elec > 70 ? "High" : (elec < 30 ? "Low" : "Avg"));
    document.getElementById('goodsLabel').textContent = (goods > 70 ? "High" : (goods < 30 ? "Eco" : "Avg"));
    document.getElementById('digitalVal').textContent = (dig > 70 ? "High" : (dig < 30 ? "Low" : "Avg"));
  }
  
  function getLang() {
      return localStorage.getItem('appLang') || 'el';
  }

  function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value : null;
  }

  // EVENTS
  navs.forEach((btn, idx) => {
    btn.addEventListener('click', () => updateActiveCard(idx));
  });

  if(stepPrev) stepPrev.addEventListener('click', () => {
    if(currentCardIndex > 0) updateActiveCard(currentCardIndex - 1);
  });
  
  if(stepNext) stepNext.addEventListener('click', () => {
    if(currentCardIndex < cards.length - 1) updateActiveCard(currentCardIndex + 1);
    else cardSummary.scrollIntoView({behavior: 'smooth'});
  });

  function updateActiveCard(idx) {
    currentCardIndex = idx;
    navs.forEach((n, i) => n.classList.toggle('active', i === idx));
    const w = document.getElementById('cardsCarousel').offsetWidth;
    document.getElementById('cardsCarousel').scrollTo({
      left: w * idx,
      behavior: 'smooth'
    });
    
    const titles = [
       document.getElementById('homeTitle').textContent,
       document.getElementById('trTitle').textContent,
       document.getElementById('lifeTitle').textContent
    ];
    stepTitle.textContent = titles[idx];
  }

  const inputs = document.querySelectorAll('select, input');
  inputs.forEach(inp => {
    inp.addEventListener('change', calculateAll);
    inp.addEventListener('input', calculateAll);
  });

  document.getElementById('btnCalc').addEventListener('click', () => {
    if(confirm('Reset?')) {
      localStorage.removeItem('co2_inputs');
      location.reload();
    }
  });

  document.getElementById('btnDash').addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });

  function saveToStorage(h, t, l, total) {
    // Αποθήκευση Input states
    const data = {};
    inputs.forEach(inp => {
      if(inp.type === 'checkbox') data[inp.id] = inp.checked;
      else data[inp.id] = inp.value;
    });
    localStorage.setItem('co2_inputs', JSON.stringify(data));

    // Αποθήκευση Results για Dashboard
    // Απλοποιημένη αποθήκευση συνόλων ανά κατηγορία
    localStorage.setItem("CO2_HOME_TOTAL", h.toFixed(2));
    localStorage.setItem("CO2_TRANS_TOTAL", t.toFixed(2));
    localStorage.setItem("CO2_LIFE_TOTAL", l.toFixed(2));
    localStorage.setItem("USER_TOTAL", total.toFixed(2));
  }

  function loadFromStorage() {
    const raw = localStorage.getItem('co2_inputs');
    if(!raw) return;
    try {
      const data = JSON.parse(raw);
      for (const [key, val] of Object.entries(data)) {
        const el = document.getElementById(key);
        if(el) {
          if(el.type === 'checkbox') el.checked = val;
          else el.value = val;
        }
      }
    } catch(e) { console.error('Load error', e); }
  }

  init();
});

