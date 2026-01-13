(function(){
  // Μεταβλητές για τα instances των γραφημάτων
  let chartInstances = {};

  function renderCharts(){
    if(!window.echarts) return;
    
    // 1. Ανάκτηση Δεδομένων
    const homeVals = JSON.parse(localStorage.getItem("CO2_HOME_VALUES") || "[0,0,0]");
    const transVals = JSON.parse(localStorage.getItem("CO2_TRANSPORT_VALUES") || "[0,0,0,0]");
    const lifeVals = JSON.parse(localStorage.getItem("CO2_LIFE_VALUES") || "[0,0,0,0]");
    const userTotal = Number(localStorage.getItem("USER_TOTAL")) || 0;
    const euTarget = Number(localStorage.getItem("EU_TARGET")) || 2.5;

    // 2. Κείμενα UI
    const lang = getLang();
    const T = {
      el: {
        pageTitle: "Ετήσια Εκτίμηση",
        userLabel: "Εκτιμώμενη ποσότητα CO₂",
        targetLabel: "Στόχος ΕΕ για το 2030",
        homeTitle: "Κατοικία",
        transTitle: "Μεταφορές",
        lifeTitle: "Τρόπος Ζωής",
        back: "Επιστροφή",
        downloadPdf: "Λήψη PDF (Αναφορά)",
        generating: "Δημιουργία...",
        reportHeader: "Αναφορά Ανθρακικού Αποτυπώματος",
        reportDate: "Ημερομηνία: ",
        totalSection: "Συνολικά Αποτελέσματα",
        chartLabels: {
          home: ["Θέρμανση", "ΖΝΧ", "Συσκευές"], // Μίκρυνα λίγο τα κείμενα για να χωράνε
          trans: ["ΙΧ", "Δημόσια", "Πτήσεις Εσ.", "Πτήσεις Εξ."],
          life: ["Διατροφή", "Αγαθά", "Digital", "Υποδομές"]
        }
      },
      en: {
        pageTitle: "Annual Estimation",
        userLabel: "Estimated CO₂ amount",
        targetLabel: "EU Target 2030",
        homeTitle: "Housing",
        transTitle: "Transport",
        lifeTitle: "Lifestyle",
        back: "Back",
        downloadPdf: "Download PDF Report",
        generating: "Generating...",
        reportHeader: "Carbon Footprint Report",
        reportDate: "Date: ",
        totalSection: "Total Results",
        chartLabels: {
          home: ["Heating", "DHW", "Appliances"],
          trans: ["Car", "Public", "Dom. Flights", "Intl. Flights"],
          life: ["Diet", "Goods", "Digital", "Public Services"]
        }
      }
    }[lang];

    // Ενημέρωση UI σελίδας
    const setText = (id, txt) => { const el = document.getElementById(id); if(el) el.textContent = txt; };
    setText("dashTitle", T.pageTitle);
    setText("kpiUserLbl", T.userLabel);
    setText("kpiTargetLbl", T.targetLabel);
    setText("homeTitle", T.homeTitle);
    setText("transportTitle", T.transTitle);
    setText("lifeTitle", T.lifeTitle);
    setText("toFootprintBtn", T.back);
    
    const pdfBtn = document.getElementById("pdfBtn");
    if(pdfBtn) pdfBtn.textContent = T.downloadPdf;

    document.getElementById("kpiUserVal").textContent = fmt(userTotal);
    document.getElementById("kpiTargetVal").textContent = fmt(euTarget);

    // 3. Διαγράμματα με ΕΜΦΑΝΕΙΣ ΕΤΙΚΕΤΕΣ
    const pieOpt = (data, colorPalette) => ({
      tooltip: { trigger: 'item', formatter: '{b}: {c} t ({d}%)' },
      animation: false, 
      color: colorPalette,
      series: [{
        type: 'pie',
        // Μειωμένη ακτίνα (35%-55%) για να αφήσει χώρο στις ετικέτες γύρω-γύρω
        radius: ['35%', '55%'], 
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
        
        // Ρυθμίσεις Ετικετών (Labels)
        label: { 
          show: true,            // Εμφάνιση ετικέτας
          position: 'outside',   // Έξω από την πίτα
          formatter: '{b}\n{d}%', // Εμφάνιση: Όνομα (αλλαγή γραμμής) Ποσοστό
          color: '#333',         // Χρώμα κειμένου
          fontSize: 11           // Μέγεθος γραμματοσειράς
        },
        labelLine: {
          show: true,
          length: 10,
          length2: 10
        },
        
        data: data
      }]
    });

    const initChart = (id, names, vals, colors) => {
      const el = document.getElementById(id);
      if(!el) return;
      if(echarts.getInstanceByDom(el)) echarts.getInstanceByDom(el).dispose();
      
      const ch = echarts.init(el);
      chartInstances[id] = ch; 

      const data = names.map((n,i) => ({ value: Number((vals[i]||0).toFixed(2)), name: n }));
      ch.setOption(pieOpt(data, colors));
      window.addEventListener("resize", ()=>ch.resize());
    };

    // Χρώματα
    const cHome = ['#e6a23c', '#f56c6c', '#409eff'];
    const cTrans = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c'];
    const cLife = ['#67c23a', '#e6a23c', '#409eff', '#909399'];

    initChart("pieHome", T.chartLabels.home, homeVals, cHome);
    initChart("pieTransport", T.chartLabels.trans, transVals, cTrans);
    initChart("pieLife", T.chartLabels.life, lifeVals, cLife);

    // --- ΛΕΙΤΟΥΡΓΙΑ PDF ---
    if(pdfBtn) {
      pdfBtn.onclick = async () => {
        if(!window.html2canvas || !window.jspdf) {
          alert("Libraries loading... try again.");
          return;
        }

        const originalText = pdfBtn.textContent;
        pdfBtn.textContent = T.generating;
        pdfBtn.disabled = true;

        try {
          const reportDiv = document.createElement("div");
          reportDiv.style.position = "absolute";
          reportDiv.style.left = "-9999px";
          reportDiv.style.width = "700px";
          reportDiv.style.background = "#fff";
          reportDiv.style.color = "#000";
          reportDiv.style.padding = "40px";
          reportDiv.style.fontFamily = "sans-serif";
          
          const listIt = (label, val) => `<li style="margin-bottom:4px;"><strong>${label}:</strong> ${fmt(val)} t CO₂</li>`;
          
          // Λήψη εικόνων (τώρα θα έχουν και labels!)
          const imgHome = chartInstances["pieHome"] ? chartInstances["pieHome"].getDataURL({pixelRatio: 2, backgroundColor: '#fff'}) : "";
          const imgTrans = chartInstances["pieTransport"] ? chartInstances["pieTransport"].getDataURL({pixelRatio: 2, backgroundColor: '#fff'}) : "";
          const imgLife = chartInstances["pieLife"] ? chartInstances["pieLife"].getDataURL({pixelRatio: 2, backgroundColor: '#fff'}) : "";

          reportDiv.innerHTML = `
            <h1 style="color:#2e8b57; border-bottom:2px solid #2e8b57; padding-bottom:10px;">${T.reportHeader}</h1>
            <p style="color:#666; margin-bottom:30px;">${T.reportDate} ${new Date().toLocaleDateString()}</p>
            
            <div style="background:#f0f9eb; padding:15px; border-radius:8px; margin-bottom:30px;">
              <h2 style="margin-top:0;">${T.totalSection}</h2>
              <p style="font-size:1.2em;">
                User: <strong>${fmt(userTotal)}</strong> t CO₂/yr <br>
                EU Target (2030): <strong>${fmt(euTarget)}</strong> t CO₂/yr
              </p>
            </div>

            <h3 style="color:#4a6fa5; border-bottom:1px solid #ccc; margin-top:30px;">1. ${T.homeTitle}</h3>
            <div style="display:flex; align-items:center; justify-content:space-between;">
              <ul style="list-style:none; padding:0; line-height:1.6;">
                ${listIt(T.chartLabels.home[0], homeVals[0])}
                ${listIt(T.chartLabels.home[1], homeVals[1])}
                ${listIt(T.chartLabels.home[2], homeVals[2])}
                <br>
                <li><strong>Total: ${fmt(homeVals.reduce((a,b)=>a+b,0))} t</strong></li>
              </ul>
              <img src="${imgHome}" style="width:250px; height:auto;" />
            </div>

            <h3 style="color:#4a6fa5; border-bottom:1px solid #ccc; margin-top:20px;">2. ${T.transTitle}</h3>
            <div style="display:flex; align-items:center; justify-content:space-between;">
              <ul style="list-style:none; padding:0; line-height:1.6;">
                ${listIt(T.chartLabels.trans[0], transVals[0])}
                ${listIt(T.chartLabels.trans[1], transVals[1])}
                ${listIt(T.chartLabels.trans[2], transVals[2])}
                ${listIt(T.chartLabels.trans[3], transVals[3])}
                <br>
                <li><strong>Total: ${fmt(transVals.reduce((a,b)=>a+b,0))} t</strong></li>
              </ul>
              <img src="${imgTrans}" style="width:250px; height:auto;" />
            </div>

            <h3 style="color:#4a6fa5; border-bottom:1px solid #ccc; margin-top:20px;">3. ${T.lifeTitle}</h3>
            <div style="display:flex; align-items:center; justify-content:space-between;">
              <ul style="list-style:none; padding:0; line-height:1.6;">
                ${listIt(T.chartLabels.life[0], lifeVals[0])}
                ${listIt(T.chartLabels.life[1], lifeVals[1])}
                ${listIt(T.chartLabels.life[2], lifeVals[2])}
                ${listIt(T.chartLabels.life[3], lifeVals[3])}
                <br>
                <li><strong>Total: ${fmt(lifeVals.reduce((a,b)=>a+b,0))} t</strong></li>
              </ul>
              <img src="${imgLife}" style="width:250px; height:auto;" />
            </div>
            
            <div style="margin-top:40px; text-align:center; font-size:0.8em; color:#999;">
              Generated by CO2App
            </div>
          `;

          document.body.appendChild(reportDiv);

          const canvas = await html2canvas(reportDiv, { scale: 2 });
          document.body.removeChild(reportDiv); 

          const { jsPDF } = window.jspdf;
          const pdf = new jsPDF('p', 'mm', 'a4');
          
          const imgData = canvas.toDataURL('image/png');
          const pdfWidth = 210; 
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
          pdf.save('CO2_Report.pdf');

        } catch(err) {
          console.error(err);
          alert("Error creating PDF");
        }

        pdfBtn.textContent = originalText;
        pdfBtn.disabled = false;
      };
    }
  }

  document.addEventListener("DOMContentLoaded", ()=>{
    if(typeof initLangButtons === 'function') initLangButtons();
    if(typeof applyUnitYearElements === 'function') applyUnitYearElements();
    renderCharts();
    
    const backBtn = document.getElementById("backBtn");
    if(backBtn) backBtn.addEventListener("click", ()=>history.back());
    
    const toFoot = document.getElementById("toFootprintBtn");
    if(toFoot) toFoot.addEventListener("click", ()=>location.href="./footprint.html");
  });
})();
