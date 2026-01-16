document.addEventListener('DOMContentLoaded', async () => {
  // 1. ΡΥΘΜΙΣΕΙΣ & ΜΕΤΑΒΛΗΤΕΣ
  // Βεβαιώσου ότι το αρχείο footprintModel.json είναι στον ίδιο φάκελο με το HTML
  const MODEL_URL = 'footprintModel.json'; 
  
  let modelData = null;
  
  // Κείμενα UI - Ορισμοί για Ελληνικά και Αγγλικά
  const UI_TEXTS = {
    el: {
      appTitle: "Εκτίμηση Αποτυπώματος CO₂",
      // Χρήση HTML tags για το link της τεκμηρίωσης
      appSubtitle: "Τα αποτελέσματα είναι προσεγγιστικά. Δες την <a href='model.html' style='text-decoration:underline; color:inherit;'>Τεκμηρίωση</a> για λεπτομέρειες.",
      catHousing: "Κατοικία",
      catTransport: "Μεταφορές",
      catLifestyle: "Τρόπος Ζωής - Διατροφή",
      
      lblHomeType: "Τύπος κατοικίας",
      lblHomeCond: "Μόνωση / κατάσταση",
      lblHeating: "Θέρμανση",
      lblOccupants: "Άτομα στο σπίτι",
      lblSolar: "Ηλιακός θερμοσίφωνας",
      lblElectricity: "Χρήση ηλεκτρικής ενέργειας (εκτός θέρμανσης)",
      
      lblWeeklyKm: "Διανυόμενα χιλιόμετρα (εβδομαδιαίως)",
      lblPublicUse: "Ποσοστό χρήσης δημόσιων μέσων",
      lblCarType: "Κύριο μέσο μετακίνησης",
      lblAlone: "Μετακινούμαι μόνος",
      lblPublicMode: "Είδος δημόσιας συγκοινωνίας",
      lblFlightDom: "Πτήσεις εντός Ελλάδας (ανά έτος)",
      lblFlightEu: "Πτήσεις εντός Ευρώπης (ανά έτος)",
      
      lblDiet: "Διατροφή",
      lblGoods: "Κατανάλωση προϊόντων (Ρούχα, ηλεκτρονικά, lifestyle)",
      lblDigital: "Ψηφιακή κατανάλωση (internet/cloud)",
      
      lblSocial: "Δημόσιες υποδομές",
      lblTotal: "ΣΥΝΟΛΟ",
      btnRecalc: "Υπολόγισε / Επαναφορά",
      btnDetails: "Διαγράμματα",
      unitYear: "tCO2e / έτος",
      
      condLabels: ["Χωρίς Μόνωση (Πριν το '80)", "Μέτρια (1980-2010)", "Σύγχρονη (ΚΕΝΑΚ)"],
      
      // ΑΝΑΛΥΤΙΚΕΣ ΠΕΡΙΓΡΑΦΕΣ ΓΙΑ ΤΑ SLIDERS (Δυναμικά labels)
      rangeLabels: {
        elec: {
            low: "Συντηρητική: Χωρίς σπατάλες, ελάχιστο A/C",
            avg: "Τυπική: Κανονική χρήση, λίγο A/C (μεσημέρι)",
            high: "Σπάταλη: Υπερβολική χρήση A/C & συσκευών"
        },
        goods: {
            low: "Επαναχρησιμοποίηση, επισκευή, ελάχιστα απορρίματα.",
            avg: "Τυπική του Δυτικού τρόπου ζωής, αλλά χωρίς ακρότητες.",
            high: "Υπερκατανάλωση, απόρριψη χωρίς ανακύκλωση, πολυτελής ζωή."
        },
        digital: {
            low: "Χαμηλή (Email, Web)",
            avg: "Μεσαία (Social, Cloud)",
            high: "Υψηλή (Streaming, AI)"
        }
      }
    },
    en: {
      appTitle: "Carbon Footprint Calculator",
      appSubtitle: "Results are approximate. See <a href='model.html' style='text-decoration:underline; color:inherit;'>Documentation</a> for details.",
      catHousing: "Home",
      catTransport: "Transport",
      catLifestyle: "Lifestyle & Diet",
      
      lblHomeType: "Home type",
      lblHomeCond: "Insulation / condition",
      lblHeating: "Heating",
      lblOccupants: "Occupants",
      lblSolar: "Solar water heater",
      lblElectricity: "Electricity use (excluding heating)",
      
      lblWeeklyKm: "Weekly distance (km)",
      lblPublicUse: "Share of public transport",
      lblCarType: "Main transport mode",
      lblAlone: "I travel alone",
      lblPublicMode: "Public transport type",
      lblFlightDom: "Domestic flights (year)",
      lblFlightEu: "Intl flights (year)",
      
      lblDiet: "Diet",
      lblGoods: "Goods consumption (Clothes, electronics, lifestyle)",
      lblDigital: "Digital consumption",
      
      lblSocial: "Public services",
      lblTotal: "TOTAL",
      btnRecalc: "Calculate / Reset",
      btnDetails: "Dashboard",
      unitYear: "tCO2e / year",
      
      condLabels: ["No Insulation (Pre-80s)", "Average (1980-2010)", "Modern (Energy Eff.)"],
      
      rangeLabels: {
        elec: {
            low: "Conservative: No waste, minimal cooling A/C",
            avg: "Typical: Standard use, some midday A/C",
            high: "Wasteful: Heavy A/C & unnecessary device use"
        },
        goods: {
            low: "Reuse, repair, minimal waste.",
            avg: "Typical Western lifestyle, without extremes.",
            high: "Overconsumption, no recycling, luxury lifestyle."
        },
        digital: {
            low: "Low (Email, Web)",
            avg: "Medium (Social, Cloud)",
            high: "High (Streaming, AI)"
        }
      }
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

  // 2. INIT FUNCTION
  async function init() {
    try {
      // Versioning για αποφυγή caching του JSON
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
    
    // Χρήση innerHTML για να λειτουργεί το Link
    const subEl = document.getElementById('subtitle');
    if(subEl) subEl.innerHTML = T.appSubtitle;
    
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
    
    // Social share (ανάγνωση από JSON)
    if(modelData && modelData.base) {
        const socShare = modelData.base.socialShareKgCO2PerYear.value;
        setText('lblSocialShare', T.lblSocial + ': ');
        setText('socialShareVal', (socShare / 1000).toFixed(2) + ' t');
    }

    setText('lblTotal', T.lblTotal);
    setText('btnCalc', T.btnRecalc);
    setText('btnDash', T.btnDetails);

    document.querySelectorAll('.unitYear').forEach(el => el.textContent = T.unitYear);

    // Γέμισμα Dropdowns από το JSON
    if (modelData && modelData.ui) {
      fillSelectFromUI('homeType', modelData.ui.homeType, lang);
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
    
    const hcVal = parseInt(document.getElementById('homeCond').value);
    let homeCondKey = 'pre1980';
    if(hcVal === 1) homeCondKey = 'post1980';
    if(hcVal === 2) homeCondKey = 'modern';

    const baseHeat = modelData.base.heatingDemandKWhApartment.value[homeCondKey] || 5000;
    const typeFactor = modelData.factors.homeType[homeType] ? modelData.factors.homeType[homeType].value : 1.0;
    const heatEF_tMWh = modelData.factors.heatingType[heatType] ? modelData.factors.heatingType[heatType].value : 0;
    
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
    const pubKmWeek = pubPct;
    document.getElementById('publicKmVal').textContent = pubKmWeek + ' km/week';
    
    const pubType = getVal('publicType');
    const pubEF = modelData.factors.publicTransport[pubType] ? modelData.factors.publicTransport[pubType].value : 0;
    const kg_public = pubKmWeek * 52 * pubEF;

    // Αεροπλάνα
    const flyDom = parseFloat(getVal('flightTripsDomestic')) || 0;
    const flyEu = parseFloat(getVal('flightTripsEurope')) || 0;
    
    const distDom = modelData.constants.flightTripDistanceKmDomestic.value;
    const distEu = modelData.constants.flightTripDistanceKmEurope.value;
    
    const efDom = modelData.constants.flightKgPerKmDomestic ? 
                  modelData.constants.flightKgPerKmDomestic.value : 0.2;
                  
    const efEu = modelData.constants.flightKgPerKmEurope ? 
                 modelData.constants.flightKgPerKmEurope.value : 0.13;
    
    const kg_fly = (flyDom * distDom * efDom) + (flyEu * distEu * efEu);
    const kg_transport_total = kg_car + kg_public + kg_fly;


    // --- Lifestyle ---
    const dietType = getVal('diet');
    const dietBase = modelData.base.dietKgCO2PerYear_unit.value;
    const dietFactor = modelData.factors.diet[dietType] ? modelData.factors.diet[dietType].value : 1.0;
    const kg_food = dietBase * dietFactor;

    // Αγαθά
    const goodsLvl = parseInt(document.getElementById('goodsLevel').value);
    const goodsBase = modelData.base.goodsKgCO2PerYear_unit.value;
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

  // --- ΕΝΗΜΕΡΩΜΕΝΗ ΣΥΝΑΡΤΗΣΗ ΜΕ ΠΟΛΛΑΠΛΕΣ ΚΑΤΗΓΟΡΙΕΣ ---
  function updateRangeLabels(hc, elec, goods, dig) {
    const lang = getLang();
    const T = UI_TEXTS[lang] || UI_TEXTS['el'];
    const L = T.rangeLabels;
    
    // 1. Home Condition Label
    const condLabel = document.getElementById('homeCondLabel');
    if(condLabel && T.condLabels[hc]) condLabel.textContent = T.condLabels[hc];

    // 2. Electricity Label (Home Use)
    const elElec = document.getElementById('homeUseLabel');
    if(elElec) {
       if(elec < 30) elElec.textContent = L.elec.low;
       else if(elec > 70) elElec.textContent = L.elec.high;
       else elElec.textContent = L.elec.avg;
    }

    // 3. Goods Label (Αναλυτικά κείμενα)
    const elGoods = document.getElementById('goodsLabel');
    if(elGoods) {
       if(goods < 30) elGoods.textContent = L.goods.low;
       else if(goods > 70) elGoods.textContent = L.goods.high;
       else elGoods.textContent = L.goods.avg;
    }

    // 4. Digital Label (digitalVal)
    const elDig = document.getElementById('digitalVal');
    if(elDig) {
       if(dig < 30) elDig.textContent = L.digital.low;
       else if(dig > 70) elDig.textContent = L.digital.high;
       else elDig.textContent = L.digital.avg;
    }
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
    if(stepTitle) stepTitle.textContent = titles[idx];
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
    const data = {};
    inputs.forEach(inp => {
      if(inp.type === 'checkbox') data[inp.id] = inp.checked;
      else data[inp.id] = inp.value;
    });
    localStorage.setItem('co2_inputs', JSON.stringify(data));

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
