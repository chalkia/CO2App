(function(){
  // Μεταβλητές για τα instances των γραφημάτων
  let chartInstances = {};

  function renderCharts(){
    if(!window.echarts) return;
    
    // 1. Ανάκτηση Δεδομένων
    let homeVals = JSON.parse(localStorage.getItem("CO2_HOME_VALUES") || "null");
    let transVals = JSON.parse(localStorage.getItem("CO2_TRANSPORT_VALUES") || "null");
    let lifeVals = JSON.parse(localStorage.getItem("CO2_LIFE_VALUES") || "null");
    let userTotal = Number(localStorage.getItem("USER_TOTAL")) || 0;
    const euTarget = Number(localStorage.getItem("EU_TARGET")) || 2.5;

    // Fallback αν δεν υπάρχουν υπολογισμένα δεδομένα ώστε να μην είναι κενά τα γραφήματα
    const isZeroOrEmpty = (arr) => !arr || !Array.isArray(arr) || arr.length === 0 || arr.every(v => !v || Number(v) === 0);
    if (isZeroOrEmpty(homeVals) && isZeroOrEmpty(transVals) && isZeroOrEmpty(lifeVals) && userTotal === 0) {
      homeVals = [1.85, 0.35, 0.78];
      transVals = [2.20, 0.45, 0.25, 0.40];
      lifeVals = [1.40, 1.00, 0.12, 1.20];
      userTotal = 8.35;
    } else {
      homeVals = homeVals || [0, 0, 0];
      transVals = transVals || [0, 0, 0, 0];
      lifeVals = lifeVals || [0, 0, 0, 0];
    }

    // 2. Κείμενα UI & PDF (Πλήρως Μεταφρασμένα)
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
        downloadPdf: "Λήψη / Κοινοποίηση PDF",
        generating: "Δημιουργία...",
        reportHeader: "Αναφορά Ανθρακικού Αποτυπώματος",
        reportDate: "Ημερομηνία: ",
        totalSection: "Συνολικά Αποτελέσματα",
        pdfUser: "Χρήστης",      // Διορθωμένο
        pdfTarget: "Στόχος ΕΕ",  // Διορθωμένο
        totalKw: "Σύνολο",       // Διορθωμένο
        chartLabels: {
          home: ["Θέρμανση", "ΖΝΧ", "Συσκευές"],
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
        downloadPdf: "Download / Share PDF",
        generating: "Generating...",
        reportHeader: "Carbon Footprint Report",
        reportDate: "Date: ",
        totalSection: "Total Results",
        pdfUser: "User",
        pdfTarget: "EU Target",
        totalKw: "Total",
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

    // 3. Διαγράμματα
    const pieOpt = (data, colorPalette) => ({
      tooltip: { trigger: 'item', formatter: '{b}: {c} t ({d}%)' },
      animation: false, 
      color: colorPalette,
      series: [{
        type: 'pie',
        radius: ['35%', '55%'], 
        avoidLabelOverlap: true,
        itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
        label: { 
          show: true,
          position: 'outside',
          formatter: '{b}\n{d}%',
          color: '#333',
          fontSize: 11
        },
        labelLine: { show: true, length: 10, length2: 10 },
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

    const cHome = ['#e6a23c', '#f56c6c', '#409eff'];
    const cTrans = ['#409eff', '#67c23a', '#e6a23c', '#f56c6c'];
    const cLife = ['#67c23a', '#e6a23c', '#409eff', '#909399'];

    initChart("pieHome", T.chartLabels.home, homeVals, cHome);
    initChart("pieTransport", T.chartLabels.trans, transVals, cTrans);
    initChart("pieLife", T.chartLabels.life, lifeVals, cLife);

    // --- ΛΕΙΤΟΥΡΓΙΑ PDF ΜΕ SHARE & ΣΕΛΙΔΟΠΟΙΗΣΗ ---
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
          reportDiv.style.width = "750px"; 
          reportDiv.style.background = "#fff";
          reportDiv.style.color = "#244237";
          reportDiv.style.padding = "24px 32px";
          reportDiv.style.boxSizing = "border-box";
          reportDiv.style.fontFamily = "system-ui, -apple-system, sans-serif";
          
          const listIt = (label, val) => `<li style="margin-bottom:2px;"><strong>${label}:</strong> ${fmt(val)} t CO₂</li>`;
          
          const imgHome = chartInstances["pieHome"] ? chartInstances["pieHome"].getDataURL({pixelRatio: 2, backgroundColor: '#fff'}) : "";
          const imgTrans = chartInstances["pieTransport"] ? chartInstances["pieTransport"].getDataURL({pixelRatio: 2, backgroundColor: '#fff'}) : "";
          const imgLife = chartInstances["pieLife"] ? chartInstances["pieLife"].getDataURL({pixelRatio: 2, backgroundColor: '#fff'}) : "";

          // Δημιουργία HTML Αναφοράς
          reportDiv.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #2e8b57; padding-bottom:8px; margin-bottom:14px;">
              <h1 style="color:#2e8b57; margin:0; font-size:22px; font-weight:700;">${T.reportHeader}</h1>
              <span style="color:#666; font-size:12px;">${T.reportDate} ${new Date().toLocaleDateString()}</span>
            </div>
            
            <div style="background:#f0f9eb; padding:10px 16px; border-radius:10px; margin-bottom:14px; border:1px solid rgba(46,139,87,0.2);">
              <h2 style="margin:0 0 4px 0; font-size:15px; color:#2e8b57;">${T.totalSection}</h2>
              <div style="font-size:13.5px; line-height:1.4;">
                ${T.pdfUser}: <strong>${fmt(userTotal)}</strong> t CO₂/yr &nbsp;|&nbsp; 
                ${T.pdfTarget}: <strong>${fmt(euTarget)}</strong> t CO₂/yr
              </div>
            </div>

            <!-- Section 1: Home -->
            <div style="margin-bottom:12px; padding-bottom:8px; border-bottom:1px dashed #e2e8e4;">
              <h3 style="color:#2f4a31; margin:0 0 6px 0; font-size:15px;">1. ${T.homeTitle}</h3>
              <div style="display:flex; align-items:center; justify-content:space-between; gap:16px;">
                <ul style="list-style:none; padding:0; margin:0; line-height:1.4; font-size:12.5px; flex:1;">
                  ${listIt(T.chartLabels.home[0], homeVals[0])}
                  ${listIt(T.chartLabels.home[1], homeVals[1])}
                  ${listIt(T.chartLabels.home[2], homeVals[2])}
                  <li style="margin-top:4px;"><strong>${T.totalKw}: ${fmt(homeVals.reduce((a,b)=>a+b,0))} t</strong></li>
                </ul>
                <img src="${imgHome}" style="width:190px; height:115px; object-fit:contain;" />
              </div>
            </div>

            <!-- Section 2: Transport -->
            <div style="margin-bottom:12px; padding-bottom:8px; border-bottom:1px dashed #e2e8e4;">
              <h3 style="color:#2f4a31; margin:0 0 6px 0; font-size:15px;">2. ${T.transTitle}</h3>
              <div style="display:flex; align-items:center; justify-content:space-between; gap:16px;">
                <ul style="list-style:none; padding:0; margin:0; line-height:1.4; font-size:12.5px; flex:1;">
                  ${listIt(T.chartLabels.trans[0], transVals[0])}
                  ${listIt(T.chartLabels.trans[1], transVals[1])}
                  ${listIt(T.chartLabels.trans[2], transVals[2])}
                  ${listIt(T.chartLabels.trans[3], transVals[3])}
                  <li style="margin-top:4px;"><strong>${T.totalKw}: ${fmt(transVals.reduce((a,b)=>a+b,0))} t</strong></li>
                </ul>
                <img src="${imgTrans}" style="width:190px; height:115px; object-fit:contain;" />
              </div>
            </div>

            <!-- Section 3: Lifestyle -->
            <div style="margin-bottom:8px;">
              <h3 style="color:#2f4a31; margin:0 0 6px 0; font-size:15px;">3. ${T.lifeTitle}</h3>
              <div style="display:flex; align-items:center; justify-content:space-between; gap:16px;">
                <ul style="list-style:none; padding:0; margin:0; line-height:1.4; font-size:12.5px; flex:1;">
                  ${listIt(T.chartLabels.life[0], lifeVals[0])}
                  ${listIt(T.chartLabels.life[1], lifeVals[1])}
                  ${listIt(T.chartLabels.life[2], lifeVals[2])}
                  ${listIt(T.chartLabels.life[3], lifeVals[3])}
                  <li style="margin-top:4px;"><strong>${T.totalKw}: ${fmt(lifeVals.reduce((a,b)=>a+b,0))} t</strong></li>
                </ul>
                <img src="${imgLife}" style="width:190px; height:115px; object-fit:contain;" />
              </div>
            </div>
            
            <div style="margin-top:10px; text-align:center; font-size:11px; color:#888; border-top:1px solid #eee; padding-top:6px;">
              Generated by CO2App
            </div>
          `;

          document.body.appendChild(reportDiv);

          // 1. Δημιουργία Εικόνας
          const canvas = await html2canvas(reportDiv, { scale: 2 });
          document.body.removeChild(reportDiv); 

          // 2. Δημιουργία PDF A4
          const { jsPDF } = window.jspdf;
          const pdf = new jsPDF('p', 'mm', 'a4');
          
          const pageWidth = 210;
          const pageHeight = 297;
          const margin = 10; // 10mm margins
          const contentWidth = pageWidth - (margin * 2); // 190mm
          const contentHeight = pageHeight - (margin * 2); // 277mm

          const renderedHeight = (canvas.height * contentWidth) / canvas.width;
          const imgData = canvas.toDataURL('image/png');

          // Αν χωράει πλήρως στην 1η σελίδα
          if (renderedHeight <= contentHeight) {
            pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, renderedHeight);
          } else {
            // Κλιμάκωση για ασφαλή προσαρμογή σε 1 σελίδα χωρίς κόψιμο διαγραμμάτων
            const scale = contentHeight / renderedHeight;
            const scaledWidth = contentWidth * scale;
            const posX = margin + ((contentWidth - scaledWidth) / 2);
            pdf.addImage(imgData, 'PNG', posX, margin, scaledWidth, contentHeight);
          }

          // --- ΔΙΑΜΟΙΡΑΣΜΟΣ (SHARE) ---
          const pdfBlob = pdf.output('blob');
          const file = new File([pdfBlob], "CO2_Report.pdf", { type: "application/pdf" });

          // Έλεγχος αν η συσκευή υποστηρίζει Share
          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            try {
              await navigator.share({
                files: [file],
                title: T.reportHeader,
                text: "Here is my CO2 footprint report."
              });
            } catch (error) {
              // Αν αποτύχει ή ακυρωθεί, δοκιμάζουμε λήψη (fallback)
              if (error.name !== 'AbortError') pdf.save('CO2_Report.pdf');
            }
          } else {
            // Αν δεν υποστηρίζεται Share (π.χ. PC), κάνε λήψη
            pdf.save('CO2_Report.pdf');
          }

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
