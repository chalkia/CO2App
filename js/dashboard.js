(function(){
  function renderCharts(){
    if(!window.echarts) return;
    
    // Retrieve data
    const homeVals = JSON.parse(localStorage.getItem("CO2_HOME_VALUES") || "[0,0,0]");
    const transVals = JSON.parse(localStorage.getItem("CO2_TRANSPORT_VALUES") || "[0,0,0,0]");
    const lifeVals = JSON.parse(localStorage.getItem("CO2_LIFE_VALUES") || "[0,0,0,0]");
    const userTotal = Number(localStorage.getItem("USER_TOTAL")) || 0;
    const euTarget = Number(localStorage.getItem("EU_TARGET")) || 2.5;

    // KPI
    document.getElementById("kpiUserVal").textContent = fmt(userTotal);
    document.getElementById("kpiTargetVal").textContent = fmt(euTarget);

    const lang = getLang();
    const labels = (lang==="el") ? {
      home: ["Θέρμανση", "ΖΝΧ", "Ηλεκτρισμός"],
      trans: ["ΙΧ", "Δημόσια", "Πτήσεις Εσ.", "Πτήσεις Εξ."],
      life: ["Διατροφή", "Αγαθά", "Digital", "Κοινόχρηστα"]
    } : {
      home: ["Heating", "DHW", "Electricity"],
      trans: ["Car", "Public", "Dom. Flights", "Intl. Flights"],
      life: ["Diet", "Goods", "Digital", "Public Services"]
    };

    const pieOpt = (data) => ({
      tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
      series: [{
        type: 'pie',
        radius: ['50%', '70%'],
        data: data,
        label: { show: false } // clean look
      }]
    });

    const initChart = (id, names, vals) => {
      const el = document.getElementById(id);
      if(!el) return;
      const ch = echarts.init(el);
      const data = names.map((n,i) => ({ value: Number((vals[i]||0).toFixed(2)), name: n }));
      ch.setOption(pieOpt(data));
      window.addEventListener("resize", ()=>ch.resize());
    };

    initChart("pieHome", labels.home, homeVals);
    initChart("pieTransport", labels.trans, transVals);
    initChart("pieLife", labels.life, lifeVals);
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    initLangButtons();
    applyUnitYearElements();
    renderCharts();
    
    const backBtn = document.getElementById("backBtn");
    if(backBtn) backBtn.addEventListener("click", ()=>history.back());
    
    const toFoot = document.getElementById("toFootprintBtn");
    if(toFoot){
      toFoot.textContent = (getLang()==="el") ? "Επιστροφή" : "Back";
      toFoot.addEventListener("click", ()=>go("./footprint.html"));
    }
  });
})();