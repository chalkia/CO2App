/* Dashboard powered by ECharts (offline, self-hosted) */
(function(){
  const lang = getLang();

  const TEXT = {
    el: {
      title: "Ετήσιος Πίνακας Αποτυπώματος Άνθρακα",
      euLabel: "Ευρωπαϊκός στόχος 2030",
      userLabel: "Σύνολο χρήστη",
      unitYear: "t CO₂/έτος",
      home: "Κατοικία",
      transport: "Μεταφορές",
      life: "Διατροφή & Lifestyle",
      btnToFoot: "Πίσω στον υπολογισμό",
      labels: {
        heating: "Θέρμανση",
        electricity: "Ηλεκτρική ενέργεια",
        car: "ΙΧ",
        public: "Δημόσια μέσα",
        food: "Διατροφή",
        goods: "Λοιπές χρήσεις",
        flights: "Αεροπορικά"
      }
    },
    en: {
      title: "Annual Carbon Footprint Dashboard",
      euLabel: "EU target 2030",
      userLabel: "User total",
      unitYear: "t CO₂/year",
      home: "Home",
      transport: "Transport",
      life: "Diet & Lifestyle",
      btnToFoot: "Back to calculator",
      labels: {
        heating: "Heating",
        electricity: "Electricity",
        car: "Car",
        public: "Public transport",
        food: "Diet",
        goods: "Goods",
        flights: "Flights"
      }
    }
  }[lang];

  function setText(id, value){
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function readNumber(key, fallback=0){
    try{
      const v = Number(localStorage.getItem(key));
      return Number.isFinite(v) ? v : fallback;
    }catch(e){ return fallback; }
  }

  function readArray(key, len){
    try{
      const raw = localStorage.getItem(key);
      if (!raw) return Array(len).fill(0);
      const arr = JSON.parse(raw);
      if (!Array.isArray(arr)) return Array(len).fill(0);
      const out = arr.slice(0,len).map(x=>{
        const n = Number(x);
        return Number.isFinite(n) ? n : 0;
      });
      while (out.length < len) out.push(0);
      return out;
    }catch(e){
      return Array(len).fill(0);
    }
  }

  function sum(arr){ return arr.reduce((a,b)=>a + (Number.isFinite(b)?b:0), 0); }

  // Keep colors simple for now (we'll revisit palette later)
  const COLORS = [
    "#2f4a31", // deep green
    "#f59e0b", // orange
    "#3b82f6", // blue
    "#22c55e", // green
    "#ef4444", // red
    "#9ca3af"  // gray
  ];

  function donutOption(title, total, rows){
    const hasData = total > 0.0001;

    const data = hasData ? rows : [{ name: "—", value: 1, itemStyle: { color: COLORS[5] } }];

    return {
      animation: false,
      tooltip: {
        trigger: "item",
        formatter: (p)=>{
          if (!hasData) return "—";
          return `${p.name}: ${fmt(p.value, 1)} ${TEXT.unitYear.replace("t CO₂/έτος","t").replace("t CO₂/year","t")}`;
        }
      },
      series: [{
        type: "pie",
        radius: ["58%", "78%"],
        center: ["50%", "55%"],
        avoidLabelOverlap: true,
        padAngle: 0,
        itemStyle: { borderColor: "#fff", borderWidth: 2 },
        labelLine: { length: 16, length2: 10, lineStyle: { width: 1 } },
        label: {
          show: hasData,
          fontSize: 13,
          fontWeight: 800,
          formatter: (p)=> `${p.name}\n${fmt(p.value,1)} t`,
          overflow: "truncate"
        },
        data
      }],
      color: COLORS,
      graphic: [
        {
          type: "text",
          left: "center",
          top: "46%",
          style: {
            text: hasData ? fmt(total, 1) : "—",
            fontSize: 28,
            fontWeight: 900,
            fill: "#111"
          }
        },
        {
          type: "text",
          left: "center",
          top: "61%",
          style: {
            text: TEXT.unitYear,
            fontSize: 12,
            fontWeight: 800,
            fill: "#555"
          }
        }
      ]
    };
  }

  function makeChart(elId, total, rows){
    const el = document.getElementById(elId);
    if (!el || typeof echarts === "undefined") return null;

    const chart = echarts.init(el, null, { renderer: "svg" });
    chart.setOption(donutOption(elId, total, rows));
    return chart;
  }

  function init(){
    // Titles
    setText("dashTitle", TEXT.title);
    setText("euLabel", TEXT.euLabel);
    setText("userLabel", TEXT.userLabel);
    setText("homeTitle", TEXT.home);
    setText("transportTitle", TEXT.transport);
    setText("lifeTitle", TEXT.life);
    setText("toFootprintBtn", TEXT.btnToFoot);

    // Values
    const userTotal = readNumber("USER_TOTAL", 0);
    const euTarget = readNumber("EU_TARGET", 2.3);

    setText("userVal", fmt(userTotal, 1));
    setText("euVal", fmt(euTarget, 1));

    // Breakdown arrays
    const homeVals = readArray("CO2_HOME_VALUES", 2);       // [heating, electricity]
    const trVals   = readArray("CO2_TRANSPORT_VALUES", 2);  // [car, public]
    const lifeVals = readArray("CO2_LIFE_VALUES", 3);       // [food, goods, flights]

    const homeTotal = sum(homeVals);
    const trTotal = sum(trVals);
    const lifeTotal = sum(lifeVals);

    const charts = [];

    charts.push(makeChart("pieHome", homeTotal, [
      { name: TEXT.labels.heating, value: homeVals[0] },
      { name: TEXT.labels.electricity, value: homeVals[1] }
    ]));

    charts.push(makeChart("pieTransport", trTotal, [
      { name: TEXT.labels.car, value: trVals[0] },
      { name: TEXT.labels.public, value: trVals[1] }
    ]));

    charts.push(makeChart("pieLife", lifeTotal, [
      { name: TEXT.labels.food, value: lifeVals[0] },
      { name: TEXT.labels.goods, value: lifeVals[1] },
      { name: TEXT.labels.flights, value: lifeVals[2] }
    ]));

    // Resize handler
    function onResize(){
      charts.forEach(c => { try{ c && c.resize(); }catch(e){} });
    }
    window.addEventListener("resize", onResize);

    // Buttons
    const toFoot = document.getElementById("toFootprintBtn");
    if (toFoot) toFoot.addEventListener("click", ()=>go("./footprint.html"));

    const backBtn = document.getElementById("backBtn");
    if (backBtn) backBtn.addEventListener("click", ()=>history.back());
  }

  document.addEventListener("DOMContentLoaded", init);
})();
