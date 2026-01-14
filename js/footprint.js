document.addEventListener('DOMContentLoaded', async () => {
  // 1. ΔΙΑΔΡΟΜΕΣ & ΜΕΤΑΒΛΗΤΕΣ
  // ΔΙΟΡΘΩΣΗ: Σωστό path για το vendor
  const MODEL_URL = '../assets/vendor/footprintModel_final_draft.json'; 
  
  let modelData = null;
  
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
      if (!resp.ok) throw new Error('Model not found in ' + MODEL_URL);
      
      modelData = await resp.json();
      
      populateUI();
      loadFromStorage();
      calculateAll();
      updateActiveCard(0);

    } catch (err) {
      console.error('Init Error:', err);
      const sub = document.getElementById('subtitle');
      if(sub) sub.textContent = 'Error: Data file not found. Check assets/vendor folder.';
    }
  }

  // 3. UI POPULATION
  function populateUI() {
    const lang = getLang();
    const T = modelData.translations[lang];

    document.getElementById('title').textContent = T.appTitle;
    document.getElementById('subtitle').textContent = T.appSubtitle;
    
    document.getElementById('homeTitle').textContent = T.catHousing;
    document.getElementById('trTitle').textContent = T.catTransport;
    document.getElementById('lifeTitle').textContent = T.catLifestyle;

    document.getElementById('navHome').textContent = T.catHousing;
    document.getElementById('navTransport').textContent = T.catTransport;
    document.getElementById('navLifestyle').textContent = T.catLifestyle;

    fillSelect('homeType', modelData.housing.types, lang);
    fillSelect('heatingType', modelData.housing.heating, lang);
    
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

    fillSelect('carType', modelData.transport.carTypes, lang);
    fillSelect('publicType', modelData.transport.publicTypes, lang);
    
    setLabel('lblWeeklyKm', T.lblWeeklyKm);
    setLabel('lblPublicPct', T.lblPublicUse);
    setLabel('lblCarType', T.lblCarType);
    document.getElementById('lblAlone').textContent = T.lblAlone;
    setLabel('lblPublicTransport', T.lblPublicMode);
    setLabel('lblFlightsDomestic', T.lblFlightDom);
    setLabel('lblFlightsEurope', T.lblFlightEu);

    fillSelect('diet', modelData.lifestyle.diets, lang);
    
    setLabel('lblDiet', T.lblDiet);
    setLabel('lblGoodsProfile', T.lblGoods);
    setLabel('lblDigitalLevel', T.lblDigital);
    document.getElementById('lblSocialShare').textContent = T.lblSocial + ': ';
    document.getElementById('socialShareVal').textContent = (modelData.constants.socialShare / 1000).toFixed(2) + ' t';

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

  // 4. ΥΠΟΛΟΓΙΣΜΟΙ
  function calculateAll() {
    if(!modelData) return;

    // --- Housing ---
    const ht = getVal('homeType'); 
    const hc = parseInt(document.getElementById('homeCond').value);
    const heatId = getVal('heatingType');
    const occ = parseInt(getVal('occupants'));
    const hasSolar = document.getElementById('solarDHW').checked;
    const elecLvl = parseInt(document.getElementById('homeUseLevel').value);

    const typeObj = modelData.housing.types.find(x => x.id === ht);
    const heatObj = modelData.housing.heating.find(x => x.id === heatId);
    
    let heatNeed = 0;
    if(hc === 0) heatNeed = modelData.constants.heat_none;
    else if(hc === 1) heatNeed = modelData.constants.heat_partial;
    else heatNeed = modelData.constants.heat_modern;

    const typeMult = typeObj ? typeObj.factor : 1;
    const fuelEF = heatObj ? heatObj.ef : 0; 

    // Επιμέρους τιμές (kg)
    let val_heat = (heatNeed * typeMult * fuelEF); 
    
    const eMin = modelData.constants.elec_min;
    const eMax = modelData.constants.elec_max;
    const eKwh = eMin + (eMax - eMin) * (elecLvl / 100);
    let val_elec = eKwh * modelData.constants.gridCI;

    let dhwKwh = hasSolar ? modelData.constants.dhw_solar : modelData.constants.dhw_elec;
    let val_dhw = (dhwKwh * occ) * modelData.constants.gridCI; // Συνολικό σπιτιού

    // Επιμερισμός ανά άτομο για τα KPI
    const co2_heat_per = val_heat / occ;
    const co2_elec_per = val_elec / occ;
    const co2_dhw_per  = val_dhw / occ; // Το ΖΝΧ ήταν ήδη *occ, οπότε τώρα το διαιρούμε για να βγει το προσωπικό μερίδιο αν χρειάζεται; 
    // ΣΗΜΕΙΩΣΗ: Στο model, το dhw_elec είναι kWh/person? Όχι συνήθως είναι ανά νοικοκυριό στο Tabula.
    // Ας υποθέσουμε ότι οι σταθερές είναι ανά άτομο όπως λέει το label "dhw_kwh_per_person" στο JSON? 
    // Στο JSON λέει "dhw_elec: 650". Αν αυτό είναι ανά άτομο, τότε το (650*occ) είναι όλο το σπίτι. 
    // Διαιρώντας με occ παίρνουμε πάλι το 650. Σωστά.
    
    const totalHousingKg = co2_heat_per + co2_elec_per + co2_dhw_per;

    // --- Transport ---
    const wkKm = parseFloat(getVal('weeklyKm')) || 0;
    const pubKm = parseInt(document.getElementById('publicPct').value);
    document.getElementById('publicKmVal').textContent = pubKm + ' km/week';

    const carId = getVal('carType');
    const alone = document.getElementById('alone').checked;
    const pubId = getVal('publicType');
    
    const flightDom = parseFloat(getVal('flightTripsDomestic')) || 0;
    const flightEu = parseFloat(getVal('flightTripsEurope')) || 0;

    const carObj = modelData.transport.carTypes.find(x => x.id === carId);
    const pubObj = modelData.transport.publicTypes.find(x => x.id === pubId);

    let carEf = carObj ? carObj.ef : 0;
    if (!alone) carEf = carEf * modelData.constants.carPool; 
    
    const val_car = wkKm * carEf * 52;
    const val_pub = pubKm * (pubObj ? pubObj.ef : 0) * 52;

    const distDom = modelData.constants.flight_dom_km;
    const distEu = modelData.constants.flight_eu_km;
    const efDom = modelData.constants.EF_flight_dom;
    const efEu = modelData.constants.EF_flight_eu;

    const val_flyDom = flightDom * distDom * efDom;
    const val_flyEu = flightEu * distEu * efEu;

    const totalTransportKg = val_car + val_pub + val_flyDom + val_flyEu;

    // --- Lifestyle ---
    const dietId = getVal('diet');
    const goodsLvl = parseInt(document.getElementById('goodsLevel').value);
    const digLvl = parseInt(document.getElementById('digitalLevel').value);

    const dietObj = modelData.lifestyle.diets.find(x => x.id === dietId);
    const dietFactor = dietObj ? dietObj.factor : 1;
    const val_food = modelData.constants.food_base * dietFactor;

    const goodsFactor = 0.5 + (goodsLvl / 100); 
    const val_goods = modelData.constants.goods_unit * goodsFactor;

    const digFactor = 0.5 + (digLvl / 100);
    const val_dig = modelData.constants.digital_unit * digFactor;

    const val_social = modelData.constants.social_share;

    const totalLifeKg = val_food + val_goods + val_dig + val_social;

    // --- Totals (Tons) ---
    const grandTotalKg = totalHousingKg + totalTransportKg + totalLifeKg;
    const grandTotalTons = grandTotalKg / 1000;

    // --- ΑΠΟΘΗΚΕΥΣΗ ΓΙΑ DASHBOARD (ΑΝΑΛΥΤΙΚΑ) ---
    // Μετατροπή σε τόνους (t) για τα γραφήματα
    const homeArr = [co2_heat_per/1000, co2_dhw_per/1000, co2_elec_per/1000];
    const transArr = [val_car/1000, val_pub/1000, val_flyDom/1000, val_flyEu/1000];
    const lifeArr = [val_food/1000, val_goods/1000, val_dig/1000, val_social/1000];

    localStorage.setItem("CO2_HOME_VALUES", JSON.stringify(homeArr));
    localStorage.setItem("CO2_TRANSPORT_VALUES", JSON.stringify(transArr));
    localStorage.setItem("CO2_LIFE_VALUES", JSON.stringify(lifeArr));
    localStorage.setItem("USER_TOTAL", grandTotalTons.toFixed(2));
    localStorage.setItem("EU_TARGET", modelData.constants.EU2030_TARGET);

    saveToStorage(); // Αποθήκευση επιλογών UI

    // --- UI Updates ---
    updateKpi('homeKpi', totalHousingKg);
    updateKpi('trKpi', totalTransportKg);
    updateKpi('lifeKpi', totalLifeKg);
    
    document.getElementById('totalVal').textContent = grandTotalTons.toFixed(2);
    updateRangeLabels(hc, elecLvl, goodsLvl, digLvl);
    updateStepKpi(grandTotalTons);

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
    const el = document.getElementById('stepKpi');
    if(el) el.textContent = total.toFixed(1) + ' t';
  }

  function updateRangeLabels(hc, elec, goods, dig) {
    const conds = ["Κακή Μόνωση", "Μέτρια Μόνωση", "Άριστη (ΚΕΝΑΚ)"];
    if(getLang() === 'en') {
       conds[0]="Bad Insulation"; conds[1]="Medium"; conds[2]="Excellent";
    }
    document.getElementById('homeCondLabel').textContent = conds[hc];
    document.getElementById('homeUseLabel').textContent = (elec > 70 ? "High" : (elec < 30 ? "Low" : "Average"));
    document.getElementById('goodsLabel').textContent = (goods > 70 ? "High Consumer" : (goods < 30 ? "Eco Conscious" : "Average"));
    document.getElementById('digitalVal').textContent = (dig > 70 ? "High" : (dig < 30 ? "Low" : "Avg"));
  }

  function getVal(id) {
    return document.getElementById(id).value;
  }

  // EVENTS
  navs.forEach((btn, idx) => {
    btn.addEventListener('click', () => updateActiveCard(idx));
  });

  stepPrev.addEventListener('click', () => {
    if(currentCardIndex > 0) updateActiveCard(currentCardIndex - 1);
  });
  
  stepNext.addEventListener('click', () => {
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
    if(confirm('Reset all values to default?')) {
      localStorage.removeItem('co2_inputs');
      location.reload();
    }
  });
  
  document.getElementById('btnDash').addEventListener('click', () => {
    window.location.href = 'dashboard.html';
  });

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

  init();
});
