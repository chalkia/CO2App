document.addEventListener('DOMContentLoaded', async () => {
  // 1. ΔΙΑΔΡΟΜΕΣ & ΜΕΤΑΒΛΗΤΕΣ
  // Επειδή είμαστε στο pages/footprint.html, πάμε ένα πίσω (..) για τα assets
  const MODEL_URL = '../assets/footprintModel_final_draft.json'; 
  
  let modelData = null;
  let userValues = {};
  
  // DOM Elements - Navigation
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
  
  // Καρτέλες (Tabs)
  const cards = [cardHome, cardTransport, cardLifestyle];
  const navs = [navHome, navTransport, navLifestyle];
  let currentCardIndex = 0;

  // 2. ΦΟΡΤΩΣΗ ΔΕΔΟΜΕΝΩΝ (Με Versioning για να μη κολλάει η cache)
  async function init() {
    try {
      // Παίρνουμε το version από το version.js ή βάζουμε τυχαίο αριθμό
      const v = (typeof APP_BUILD !== 'undefined') ? APP_BUILD : Date.now();
      
      const resp = await fetch(MODEL_URL + '?v=' + v);
      if (!resp.ok) throw new Error('Model not found');
      
      modelData = await resp.json();
      
      // Γέμισμα Selects και Labels από το JSON
      populateUI();
      
      // Φόρτωση αποθηκευμένων τιμών (αν υπάρχουν)
      loadFromStorage();
      
      // Αρχικός Υπολογισμός
      calculateAll();
      
      // Ενημέρωση UI
      updateActiveCard(0);

    } catch (err) {
      console.error('Init Error:', err);
      document.getElementById('subtitle').textContent = 'Error loading data. Check console.';
    }
  }

  // 3. UI POPULATION (Γέμισμα λιστών)
  function populateUI() {
    const lang = getLang(); // Από common.js
    const T = modelData.translations[lang];

    // Τίτλοι
    document.getElementById('title').textContent = T.appTitle;
    document.getElementById('subtitle').textContent = T.appSubtitle;
    
    document.getElementById('homeTitle').textContent = T.catHousing;
    document.getElementById('trTitle').textContent = T.catTransport;
    document.getElementById('lifeTitle').textContent = T.catLifestyle;

    document.getElementById('navHome').textContent = T.catHousing;
    document.getElementById('navTransport').textContent = T.catTransport;
    document.getElementById('navLifestyle').textContent = T.catLifestyle;

    // --- HOUSING ---
    fillSelect('homeType', modelData.housing.types, lang);
    fillSelect('heatingType', modelData.housing.heating, lang);
    
    // Occupants (1-10)
    const occSel = document.getElementById('occupants');
    occSel.innerHTML = '';
    for(let i=1; i<=6; i++) {
      let opt = document.createElement('option');
      opt.value = i;
      opt.text = i + (i===6 ? '+' : '');
      occSel.add(opt);
    }
    
    setLabel('lblHomeType', T.lblHomeType);
    setLabel('lblHomeCond', T.lblHomeCond);
    setLabel('lblHeating', T.lblHeating);
    setLabel('lblOccupants', T.lblOccupants);
    document.getElementById('lblSolarDHW').textContent = T.lblSolar;
    setLabel('lblHomeUse', T.lblElectricity);

    // --- TRANSPORT ---
    fillSelect('carType', modelData.transport.carTypes, lang);
    fillSelect('publicType', modelData.transport.publicTypes, lang);
    
    setLabel('lblWeeklyKm', T.lblWeeklyKm);
    setLabel('lblPublicPct', T.lblPublicUse);
    setLabel('lblCarType', T.lblCarType);
    document.getElementById('lblAlone').textContent = T.lblAlone;
    setLabel('lblPublicTransport', T.lblPublicMode);
    setLabel('lblFlightsDomestic', T.lblFlightDom);
    setLabel('lblFlightsEurope', T.lblFlightEu);

    // --- LIFESTYLE ---
    fillSelect('diet', modelData.lifestyle.diets, lang);
    
    setLabel('lblDiet', T.lblDiet);
    setLabel('lblGoodsProfile', T.lblGoods);
    setLabel('lblDigitalLevel', T.lblDigital);
    document.getElementById('lblSocialShare').textContent = T.lblSocial + ': ';
    document.getElementById('socialShareVal').textContent = (modelData.constants.socialShare / 1000).toFixed(2) + ' t';

    // Labels Κουμπιών
    document.getElementById('lblTotal').textContent = T.lblTotal || "TOTAL";
    document.getElementById('btnCalc').textContent = T.btnRecalc || "Reset";
    document.getElementById('btnDash').textContent = T.btnDetails || "Dashboard";
  }

  function fillSelect(id, items, lang) {
    const el = document.getElementById(id);
    el.innerHTML = '';
    items.forEach(item => {
      let opt = document.createElement('option');
      opt.value = item.id;
      opt.text = item.label[lang];
      el.add(opt);
    });
  }

  function setLabel(id, text) {
    const el = document.getElementById(id);
    if(el) el.textContent = text;
  }

  // 4. ΥΠΟΛΟΓΙΣΜΟΙ (CORE LOGIC)
  function calculateAll() {
    if(!modelData) return;

    // A. Housing
    const ht = getVal('homeType'); 
    const hc = parseInt(document.getElementById('homeCond').value); // 0=bad, 1=medium, 2=good
    const heatId = getVal('heatingType');
    const occ = parseInt(getVal('occupants'));
    const hasSolar = document.getElementById('solarDHW').checked;
    const elecLvl = parseInt(document.getElementById('homeUseLevel').value); // 0-100

    // Βρίσκουμε συντελεστές
    const typeObj = modelData.housing.types.find(x => x.id === ht);
    const heatObj = modelData.housing.heating.find(x => x.id === heatId);
    
    // Θέρμανση: Base needs * SizeFactor * InsulationFactor * FuelFactor
    // Απλοποιημένο μοντέλο βάσει JSON
    let heatNeed = 0;
    if(hc === 0) heatNeed = modelData.constants.heat_none;
    else if(hc === 1) heatNeed = modelData.constants.heat_partial;
    else heatNeed = modelData.constants.heat_modern;

    // Home Type Multiplier (π.χ. Μονοκατοικία vs Διαμέρισμα)
    const typeMult = typeObj ? typeObj.factor : 1;
    
    // Fuel Emission Factor
    const fuelEF = heatObj ? heatObj.ef : 0; 

    let co2_heat = (heatNeed * typeMult * fuelEF); // kgCO2

    // Ηλεκτρισμός (Lights/Appliances)
    // Map slider 0-100 to range [elec_min, elec_max]
    const eMin = modelData.constants.elec_min;
    const eMax = modelData.constants.elec_max;
    const eKwh = eMin + (eMax - eMin) * (elecLvl / 100);
    const co2_elec = eKwh * modelData.constants.gridCI;

    // ΖΝΧ (Hot Water)
    let dhwKwh = hasSolar ? modelData.constants.dhw_solar : modelData.constants.dhw_elec;
    // Ανά άτομο * άτομα
    const co2_dhw = (dhwKwh * occ) * modelData.constants.gridCI;

    // Σύνολο Κατοικίας (Διαιρούμενο δια κατοίκους για ατομικό)
    const totalHousingKg = (co2_heat + co2_elec + co2_dhw) / occ;


    // B. Transport
    const wkKm = parseFloat(getVal('weeklyKm')) || 0;
    const pubPct = parseInt(document.getElementById('publicPct').value); // 0-200% relative to car
    // Εδώ η λογική στο JSON μπορεί να είναι: pubPct% of weeklyKm is public? 
    // Ας υποθέσουμε απλά: wkKm είναι ΙΧ, και public είναι extra βάσει slider.
    // Ή πιο σωστά: Ο χρήστης βάζει "km με αυτοκίνητο" και "km με ΜΜΜ".
    
    // Για απλότητα UI: Slider Public Transport (km/week)
    const pubKm = parseInt(document.getElementById('publicPct').value); // Slider is actually absolute km here for simplicity in UI setup
    document.getElementById('publicKmVal').textContent = pubKm + ' km/week';

    const carId = getVal('carType');
    const alone = document.getElementById('alone').checked;
    const pubId = getVal('publicType');
    
    const flightDom = parseFloat(getVal('flightTripsDomestic')) || 0;
    const flightEu = parseFloat(getVal('flightTripsEurope')) || 0;

    const carObj = modelData.transport.carTypes.find(x => x.id === carId);
    const pubObj = modelData.transport.publicTypes.find(x => x.id === pubId);

    // Car calc
    let carEf = carObj ? carObj.ef : 0;
    // Αν ΔΕΝ είναι μόνος, διαιρούμε δια 2 (carpooling assumption)
    if (!alone) carEf = carEf * modelData.constants.carPool; 
    
    const co2_car = wkKm * carEf * 52; // ετήσια

    // Public calc
    const pubEf = pubObj ? pubObj.ef : 0;
    const co2_pub = pubKm * pubEf * 52;

    // Flights
    const distDom = modelData.constants.flight_dom_km;
    const distEu = modelData.constants.flight_eu_km;
    const efDom = modelData.constants.EF_flight_dom; // ανά km
    const efEu = modelData.constants.EF_flight_eu;

    const co2_fly = (flightDom * distDom * efDom) + (flightEu * distEu * efEu);

    const totalTransportKg = co2_car + co2_pub + co2_fly;


    // C. Lifestyle
    const dietId = getVal('diet');
    const goodsLvl = parseInt(document.getElementById('goodsLevel').value); // 0-100
    const digLvl = parseInt(document.getElementById('digitalLevel').value); // 0-100

    const dietObj = modelData.lifestyle.diets.find(x => x.id === dietId);
    const dietFactor = dietObj ? dietObj.factor : 1;
    const co2_food = modelData.constants.food_base * dietFactor;

    // Goods (Clothes, gadgets, waste)
    // Base * factor (0.5 to 1.5 based on slider)
    const goodsFactor = 0.5 + (goodsLvl / 100); 
    const co2_goods = modelData.constants.goods_unit * goodsFactor;

    // Digital
    const digFactor = 0.5 + (digLvl / 100);
    const co2_dig = modelData.constants.digital_unit * digFactor;

    const co2_social = modelData.constants.social_share;

    const totalLifeKg = co2_food + co2_goods + co2_dig + co2_social;

    // FINAL TOTAL
    const grandTotalKg = totalHousingKg + totalTransportKg + totalLifeKg;
    const grandTotalTons = grandTotalKg / 1000;

    // ΑΠΟΘΗΚΕΥΣΗ ΣΤΟ ΠΑΓΚΟΣΜΙΟ STATE (για το Dashboard)
    const results = {
      housing: totalHousingKg / 1000,
      transport: totalTransportKg / 1000,
      lifestyle: totalLifeKg / 1000,
      total: grandTotalTons,
      timestamp: Date.now()
    };
    localStorage.setItem('co2_results', JSON.stringify(results));
    saveToStorage(); // Αποθήκευση input values

    // UPDATE UI KPIs
    updateKpi('homeKpi', totalHousingKg);
    updateKpi('trKpi', totalTransportKg);
    updateKpi('lifeKpi', totalLifeKg);
    
    document.getElementById('totalVal').textContent = grandTotalTons.toFixed(2);
    
    // Update labels for sliders
    updateRangeLabels(hc, elecLvl, goodsLvl, digLvl);
    
    // Update current step KPI
    updateStepKpi(grandTotalTons);

    // Σύγκριση με στόχο 2030 (2.5t)
    const target = modelData.constants.EU2030_TARGET;
    const diff = grandTotalTons - target;
    const elPct = document.getElementById('reducePct');
    if(diff > 0) {
      elPct.innerHTML = `Στόχος 2030: <b>${target}t</b>. Είσαι <b>+${diff.toFixed(1)}t</b> πάνω.`;
      elPct.style.color = "#d32f2f";
    } else {
      elPct.innerHTML = `Στόχος 2030: <b>${target}t</b>. Μπράβο! Είσαι εντός στόχου.`;
      elPct.style.color = "#388e3c";
    }
  }

  function updateKpi(id, kg) {
    const t = kg / 1000;
    document.getElementById(id).textContent = t.toFixed(2);
  }

  function updateStepKpi(total) {
    // Εμφανίζει το τρέχον σύνολο στο step bar
    const el = document.getElementById('stepKpi');
    if(el) el.textContent = total.toFixed(1) + ' t';
  }

  function updateRangeLabels(hc, elec, goods, dig) {
    // Housing Condition
    const conds = ["Κακή Μόνωση", "Μέτρια Μόνωση", "Άριστη (ΚΕΝΑΚ)"];
    if(getLang() === 'en') {
       conds[0]="Bad Insulation"; conds[1]="Medium"; conds[2]="Excellent";
    }
    document.getElementById('homeCondLabel').textContent = conds[hc];
    
    // Electricity
    document.getElementById('homeUseLabel').textContent = (elec > 70 ? "High" : (elec < 30 ? "Low" : "Average"));

    // Goods
    document.getElementById('goodsLabel').textContent = (goods > 70 ? "High Consumer" : (goods < 30 ? "Eco Conscious" : "Average"));

    // Digital
    document.getElementById('digitalVal').textContent = (dig > 70 ? "High" : (dig < 30 ? "Low" : "Avg"));
  }

  function getVal(id) {
    return document.getElementById(id).value;
  }

  // 5. NAVIGATION & EVENTS
  navs.forEach((btn, idx) => {
    btn.addEventListener('click', () => updateActiveCard(idx));
  });

  stepPrev.addEventListener('click', () => {
    if(currentCardIndex > 0) updateActiveCard(currentCardIndex - 1);
  });
  
  stepNext.addEventListener('click', () => {
    if(currentCardIndex < cards.length - 1) updateActiveCard(currentCardIndex + 1);
    else {
      // Αν είναι στο τελευταίο βήμα, scroll στο summary
      cardSummary.scrollIntoView({behavior: 'smooth'});
    }
  });

  function updateActiveCard(idx) {
    currentCardIndex = idx;
    
    // Update Tabs
    navs.forEach((n, i) => n.classList.toggle('active', i === idx));
    
    // Scroll Carousel
    // Το πλάτος της κάρτας είναι περίπου το πλάτος του carousel
    const w = document.getElementById('cardsCarousel').offsetWidth;
    document.getElementById('cardsCarousel').scrollTo({
      left: w * idx,
      behavior: 'smooth'
    });

    // Update Mobile Stepper Text
    const titles = [
      document.getElementById('homeTitle').textContent,
      document.getElementById('trTitle').textContent,
      document.getElementById('lifeTitle').textContent
    ];
    stepTitle.textContent = titles[idx];
  }

  // Listeners για όλα τα Inputs -> Recalculate
  const inputs = document.querySelectorAll('select, input');
  inputs.forEach(inp => {
    inp.addEventListener('change', calculateAll);
    inp.addEventListener('input', calculateAll); // Για sliders σε real-time
  });

  // Κουμπιά στο Summary
  document.getElementById('btnCalc').addEventListener('click', () => {
    if(confirm('Reset all values to default?')) {
      localStorage.removeItem('co2_inputs');
      location.reload();
    }
  });
  
  document.getElementById('btnDash').addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });

  // 6. LOCAL STORAGE (Save inputs)
  function saveToStorage() {
    const data = {};
    inputs.forEach(inp => {
      if(inp.type === 'checkbox') data[inp.id] = inp.checked;
      else data[inp.id] = inp.value;
    });
    localStorage.setItem('co2_inputs', JSON.stringify(data));
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

  // Start
  init();
});
