/* Dashboard: donut charts (no external libraries) */

(function(){
  const lang = getLang();

  const TEXT = {
    el: {
      title: "Ετήσιος Πίνακας Αποτυπώματος Άνθρακα",
      euLabel: "Ευρωπαϊκός στόχος 2030",
      userLabel: "Σύνολο χρήστη",
      unitYear: "τόνοι CO₂/έτος",
      home: "Κατοικία",
      transport: "Μεταφορές",
      life: "Διατροφή & Lifestyle",
      btnToFoot: "Υπολογισμός CO2",
    },
    en: {
      title: "Annual Carbon Footprint Summary",
      euLabel: "EU 2030 target",
      userLabel: "User total",
      unitYear: "t CO₂/year",
      home: "Home",
      transport: "Transport",
      life: "Diet & Lifestyle",
      btnToFoot: "CO2 Calculator",
    }
  }[lang];

  const numFmt1 = new Intl.NumberFormat(lang === "el" ? "el-GR" : "en-US", { maximumFractionDigits: 1, minimumFractionDigits: 1 });
  const numFmt2 = new Intl.NumberFormat(lang === "el" ? "el-GR" : "en-US", { maximumFractionDigits: 2, minimumFractionDigits: 2 });

  const toNum = (v, d=0) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : d;
  };

  function getJSON(key, fallback){
    try{
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      const v = JSON.parse(raw);
      return v ?? fallback;
    }catch{
      return fallback;
    }
  }

  function fmt1(v){ return numFmt1.format(v); }
  function fmt2(v){ return numFmt2.format(v); }

  function polar(cx, cy, r, a){
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }

  function donutSlicePath(cx, cy, rInner, rOuter, a0, a1){
    const p0o = polar(cx, cy, rOuter, a0);
    const p1o = polar(cx, cy, rOuter, a1);
    const p1i = polar(cx, cy, rInner, a1);
    const p0i = polar(cx, cy, rInner, a0);
    const large = (a1 - a0) > Math.PI ? 1 : 0;

    return [
      `M ${p0o.x.toFixed(2)} ${p0o.y.toFixed(2)}`,
      `A ${rOuter} ${rOuter} 0 ${large} 1 ${p1o.x.toFixed(2)} ${p1o.y.toFixed(2)}`,
      `L ${p1i.x.toFixed(2)} ${p1i.y.toFixed(2)}`,
      `A ${rInner} ${rInner} 0 ${large} 0 ${p0i.x.toFixed(2)} ${p0i.y.toFixed(2)}`,
      "Z"
    ].join(" ");
  }

  /**
   * Creates an SVG donut chart with outside labels.
   * @param {Array<{name:string, value:number, color:string}>} series
   */
  function createDonutSVG(series){
    const total = series.reduce((s, p) => s + (p.value > 0 ? p.value : 0), 0) || 1;

    const size = 260;
    const cx = size/2;
    const cy = size/2;
    const rOuter = 92;
    const rInner = 58;

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", String(size));
    svg.setAttribute("height", String(size));
    svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
    svg.setAttribute("role", "img");

    // background ring (subtle)
    const bg = document.createElementNS(svg.namespaceURI, "circle");
    bg.setAttribute("cx", cx);
    bg.setAttribute("cy", cy);
    bg.setAttribute("r", (rInner + rOuter)/2);
    bg.setAttribute("fill", "none");
    bg.setAttribute("stroke", "rgba(0,0,0,.06)");
    bg.setAttribute("stroke-width", String(rOuter - rInner));
    svg.appendChild(bg);

    let a = -Math.PI/2;
    const labelLayer = document.createElementNS(svg.namespaceURI, "g");
    const sliceLayer = document.createElementNS(svg.namespaceURI, "g");

    for (const p of series){
      const v = Math.max(0, p.value);
      const da = (v/total) * 2*Math.PI;
      const a0 = a;
      const a1 = a + da;
      a = a1;

      // slice
      const path = document.createElementNS(svg.namespaceURI, "path");
      path.setAttribute("d", donutSlicePath(cx, cy, rInner, rOuter, a0, a1));
      path.setAttribute("fill", p.color);
      path.setAttribute("stroke", "white");
      path.setAttribute("stroke-width", "2");

      const title = document.createElementNS(svg.namespaceURI, "title");
      title.textContent = `${p.name}: ${fmt2(v)} ${TEXT.unitYear}`;
      path.appendChild(title);

      sliceLayer.appendChild(path);

      // label (outside)
      const mid = (a0 + a1) / 2;
      const pEdge = polar(cx, cy, rOuter + 2, mid);
      const pLabel = polar(cx, cy, rOuter + 30, mid);

      const leader = document.createElementNS(svg.namespaceURI, "path");
      leader.setAttribute("class", "donutLeader");
      leader.setAttribute("d", `M ${pEdge.x.toFixed(2)} ${pEdge.y.toFixed(2)} L ${pLabel.x.toFixed(2)} ${pLabel.y.toFixed(2)}`);
      labelLayer.appendChild(leader);

      const text = document.createElementNS(svg.namespaceURI, "text");
      text.setAttribute("x", pLabel.x.toFixed(2));
      text.setAttribute("y", pLabel.y.toFixed(2));
      text.setAttribute("dominant-baseline", "middle");
      text.setAttribute("text-anchor", (pLabel.x < cx) ? "end" : "start");

      const t1 = document.createElementNS(svg.namespaceURI, "tspan");
      t1.setAttribute("class", "donutLabel");
      t1.textContent = p.name + ":";
      text.appendChild(t1);

      const t2 = document.createElementNS(svg.namespaceURI, "tspan");
      t2.setAttribute("class", "donutValue");
      t2.setAttribute("x", pLabel.x.toFixed(2));
      t2.setAttribute("dy", "18");
      t2.textContent = `${fmt1(v)} t CO₂`;
      text.appendChild(t2);

      labelLayer.appendChild(text);
    }

    svg.appendChild(sliceLayer);
    svg.appendChild(labelLayer);

    // center text: total
    const center = document.createElementNS(svg.namespaceURI, "text");
    center.setAttribute("x", cx);
    center.setAttribute("y", cy);
    center.setAttribute("text-anchor", "middle");
    center.setAttribute("dominant-baseline", "middle");
    center.setAttribute("style", "font-weight:900; fill:#2b2b2b; font-size:20px;");
    center.textContent = fmt1(series.reduce((s,p)=>s+p.value,0));
    svg.appendChild(center);

    const center2 = document.createElementNS(svg.namespaceURI, "text");
    center2.setAttribute("x", cx);
    center2.setAttribute("y", cy + 22);
    center2.setAttribute("text-anchor", "middle");
    center2.setAttribute("dominant-baseline", "middle");
    center2.setAttribute("style", "font-weight:800; fill:#666; font-size:12px;");
    center2.textContent = (lang === "el") ? "t CO₂/έτος" : "t CO₂/yr";
    svg.appendChild(center2);

    return svg;
  }

  function mount(id, svg){
    const el = document.getElementById(id);
    if (!el) return;
    el.innerHTML = "";
    el.appendChild(svg);
  }

  function setText(id, text){
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  // --- Load values from calculator ---
  const euTarget = toNum(localStorage.getItem("EU_TARGET"), 2.3);
  const userTotal = toNum(localStorage.getItem("USER_TOTAL"), 0);

  const homeValues = getJSON("CO2_HOME_VALUES", [0, 0]);           // [heating, other electricity/uses]
  const transportValues = getJSON("CO2_TRANSPORT_VALUES", [0, 0]); // [car, public]
  const lifeValues = getJSON("CO2_LIFE_VALUES", [0, 0, 0]);        // [food, goods, flights]

  // Titles / KPI
  setText("dashTitle", TEXT.title);
  setText("euLabel", TEXT.euLabel);
  setText("userLabel", TEXT.userLabel);
  setText("euValue", (lang === "el") ? fmt1(euTarget) : fmt1(euTarget));
  setText("userValue", fmt1(userTotal));
  setText("euUnit", TEXT.unitYear);
  setText("userUnit", TEXT.unitYear);

  setText("homeTitle", TEXT.home);
  setText("transportTitle", TEXT.transport);
  setText("lifeTitle", TEXT.life);

  // Charts
  const homeSeries = [
    { name: (lang==="el") ? "Θέρμανση" : "Heating", value: toNum(homeValues[0]), color: "#f39c12" },
    { name: (lang==="el") ? "Λοιπές χρήσεις" : "Other uses", value: toNum(homeValues[1]), color: "#f7dc6f" }
  ];

  const transportSeries = [
    { name: (lang==="el") ? "ΙΧ" : "Car", value: toNum(transportValues[0]), color: "#1f77b4" },
    { name: (lang==="el") ? "Δημόσια" : "Public", value: toNum(transportValues[1]), color: "#8fd3ff" }
  ];

  const lifeSeries = [
    { name: (lang==="el") ? "Διατροφή" : "Diet", value: toNum(lifeValues[0]), color: "#3ca34a" },
    { name: (lang==="el") ? "Καταναλωτικά" : "Goods", value: toNum(lifeValues[1]), color: "#a8d8ff" },
    { name: (lang==="el") ? "Αεροπορικά" : "Flights", value: toNum(lifeValues[2]), color: "#dcdcdc" }
  ];

  mount("pieHome", createDonutSVG(homeSeries));
  mount("pieTransport", createDonutSVG(transportSeries));
  mount("pieLife", createDonutSVG(lifeSeries));

  // Buttons
  const toFoot = document.getElementById("toFootprintBtn");
  if (toFoot) toFoot.textContent = TEXT.btnToFoot;

  const backBtn = document.getElementById("backBtn");
  if (backBtn) backBtn.addEventListener("click", () => history.back());

  if (toFoot) toFoot.addEventListener("click", () => go("footprint"));

  // Ensure topbar home button goes home (if present)
  const homeBtn = document.getElementById("homeBtn");
  if (homeBtn) homeBtn.addEventListener("click", () => go("home"));

})();
