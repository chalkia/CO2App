function pieSVG(values, labels, colors, title){
  const total = values.reduce((a,b)=>a+Math.max(0,b), 0);
  const size = 180;
  const r = 70;
  const cx = size/2;
  const cy = size/2;
  const stroke = 26;

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", `0 0 ${size} ${size}`);
  svg.style.width = "100%";
  svg.style.height = "180px";

  // base circle
  const base = document.createElementNS(svgNS, "circle");
  base.setAttribute("cx", cx);
  base.setAttribute("cy", cy);
  base.setAttribute("r", r);
  base.setAttribute("fill", "none");
  base.setAttribute("stroke", "rgba(0,0,0,.08)");
  base.setAttribute("stroke-width", stroke);
  svg.appendChild(base);

  if (total <= 0){
    const txt = document.createElementNS(svgNS, "text");
    txt.setAttribute("x", cx);
    txt.setAttribute("y", cy+5);
    txt.setAttribute("text-anchor", "middle");
    txt.setAttribute("font-size", "14");
    txt.setAttribute("fill", "rgba(0,0,0,.55)");
    txt.textContent = "0.00 t";
    svg.appendChild(txt);
    const wrap = document.createElement("div");
    wrap.appendChild(svg);
    return {wrap, legend: document.createElement("div")};
  }

  const circumference = 2 * Math.PI * r;
  let offset = 0;

  values.forEach((v, i)=>{
    const val = Math.max(0, v);
    const frac = val / total;
    const dash = circumference * frac;
    const gap = circumference - dash;

    const seg = document.createElementNS(svgNS, "circle");
    seg.setAttribute("cx", cx);
    seg.setAttribute("cy", cy);
    seg.setAttribute("r", r);
    seg.setAttribute("fill", "none");
    seg.setAttribute("stroke", colors[i % colors.length]);
    seg.setAttribute("stroke-width", stroke);
    seg.setAttribute("stroke-dasharray", `${dash} ${gap}`);
    seg.setAttribute("stroke-dashoffset", `${-offset}`);
    seg.setAttribute("transform", `rotate(-90 ${cx} ${cy})`);
    seg.setAttribute("stroke-linecap", "butt");
    svg.appendChild(seg);

    offset += dash;
  });

  // center label
  const center = document.createElementNS(svgNS, "text");
  center.setAttribute("x", cx);
  center.setAttribute("y", cy+6);
  center.setAttribute("text-anchor", "middle");
  center.setAttribute("font-size", "16");
  center.setAttribute("font-weight", "800");
  center.setAttribute("fill", "rgba(0,0,0,.75)");
  center.textContent = `${total.toFixed(2)} t`;
  svg.appendChild(center);

  const wrap = document.createElement("div");

  const h = document.createElement("div");
  h.style.fontWeight = "900";
  h.style.marginBottom = "8px";
  h.textContent = title;
  wrap.appendChild(h);
  wrap.appendChild(svg);

  const legend = document.createElement("div");
  legend.className = "legend";

  values.forEach((v,i)=>{
    const item = document.createElement("div");
    item.className = "legendItem";

    const sw = document.createElement("div");
    sw.className = "swatch";
    sw.style.background = colors[i % colors.length];

    const txt = document.createElement("div");
    txt.textContent = `${labels[i]} — ${Number(v).toFixed(2)} t`;

    item.appendChild(sw);
    item.appendChild(txt);
    legend.appendChild(item);
  });

  wrap.appendChild(legend);
  return {wrap};
}

document.addEventListener("DOMContentLoaded", async ()=>{
  initLangButtons();

  const t = {
    el: {
      title:"Dashboard Αποτυπώματος",
      eu:"ΕΕ στόχος (ενδεικτικά)",
      user:"Ο χρήστης",
      home:"Κατοίκηση",
      transport:"Μεταφορές",
      lifestyle:"Διατροφή & Προϊόντα",
      homeLabels:["Θέρμανση","Ηλεκτρική χρήση"],
      transportLabels:["ΙΧ/Ατομικά","Δημόσια μέσα"],
      lifeLabels:["Προϊόντα","Διατροφή","Πτήσεις"]
    },
    en: {
      title:"Footprint Dashboard",
      eu:"EU target (indicative)",
      user:"User",
      home:"Home",
      transport:"Transport",
      lifestyle:"Diet & Goods",
      homeLabels:["Heating","Home use"],
      transportLabels:["Car / personal","Public transport"],
      lifeLabels:["Goods","Diet","Flights"]
    }
  }[getLang()];

  document.getElementById("dashTitle").textContent = t.title;
  document.getElementById("euLabel").textContent = t.eu;
  document.getElementById("userLabel").textContent = t.user;


  const homeValues = JSON.parse(localStorage.getItem("homeValues") || "[]");
  const transportValues = JSON.parse(localStorage.getItem("transportValues") || "[]");
  const lifestyleValues = JSON.parse(localStorage.getItem("lifestyleValues") || "[]");

  const userTotal = Number(localStorage.getItem("userTotalTons") || "0");
  const euTarget = Number(localStorage.getItem("euTargetTons") || "2.3");

  document.getElementById("euVal").textContent = euTarget.toFixed(2);
  document.getElementById("userVal").textContent = userTotal.toFixed(2);

  const COLORS = {
    home: ["#2f4a31","#f59e0b"],
    transport: ["#3b82f6","#ef4444"],
    life: ["#f59e0b","#2f4a31","#3b82f6"]
  };

  const homePie = pieSVG(homeValues, t.homeLabels, COLORS.home, t.home);
  const trPie = pieSVG(transportValues, t.transportLabels, COLORS.transport, t.transport);
  const lifePie = pieSVG(lifestyleValues, t.lifeLabels, COLORS.life, t.lifestyle);

  const h = document.getElementById("pieHome");
  const tr = document.getElementById("pieTransport");
  const li = document.getElementById("pieLife");

  h.innerHTML = ""; tr.innerHTML=""; li.innerHTML="";
  h.appendChild(homePie.wrap);
  tr.appendChild(trPie.wrap);
  li.appendChild(lifePie.wrap);
});
