let questions = [];
let idx = 0;
let score = 0;

function langKey(){
  // quiz json uses 'gr' / 'en'
  return getLang() === "el" ? "gr" : "en";
}

const UI = {
  el: {
    q: "Ερώτηση",
    score: "ΣΚΟΡ",
    hint: "Επέλεξε την απάντηση χρησιμοποιώντας τα πλήκτρα που βρίσκονται παρακάτω",
    correct: "Μπράβο — η απάντηση είναι σωστή!",
    wrong: "Η απάντηση δεν είναι σωστή.",
    explanation: "Επεξήγηση",
    source: "Πηγή",
    finishedTitle: "Τέλος κουίζ",
    finishedBody: (s)=>`Τελικό σκορ: ${s}`,
    restart: "Ξεκίνα ξανά"
  },
  en: {
    q: "Question",
    score: "SCORE",
    hint: "Choose your answer using the buttons below",
    correct: "Correct!",
    wrong: "Not correct.",
    explanation: "Explanation",
    source: "Source",
    finishedTitle: "Quiz finished",
    finishedBody: (s)=>`Final score: ${s}`,
    restart: "Restart"
  }
};

function setStats(){
  const t = UI[getLang()];
  document.getElementById("qLabel").textContent = `${t.q}: ${idx+1}`;
  document.getElementById("scoreLabel").textContent = `${t.score}: ${score}`;
}

function render(){
  const t = UI[getLang()];
  const k = langKey();

  if (idx >= questions.length){
    // finished view
    document.getElementById("question").textContent = t.finishedTitle;
    document.getElementById("opt1").textContent = t.finishedBody(score);
    document.getElementById("opt2").textContent = "";
    document.getElementById("opt3").textContent = "";
    document.getElementById("hint").textContent = t.restart;

    document.querySelectorAll(".choiceBtn").forEach(b=>{
      b.disabled = true;
      b.style.opacity = 0.65;
    });

    document.getElementById("qLabel").textContent = "";
    document.getElementById("scoreLabel").textContent = "";

    return;
  }

  const q = questions[idx];
  setStats();

  document.getElementById("question").textContent = q.question[k] || "";
  document.getElementById("opt1").textContent = `A.  ${q.a1[k] || ""}`;
  document.getElementById("opt2").textContent = `B.  ${q.a2[k] || ""}`;
  document.getElementById("opt3").textContent = `${k === "gr" ? "Γ" : "C"}.  ${q.a3[k] || ""}`;
  document.getElementById("hint").textContent = t.hint;
}

function showModal(isCorrect, q){
  const t = UI[getLang()];
  const k = langKey();

  const backdrop = document.getElementById("modalBackdrop");
  backdrop.style.display = "flex";

  document.getElementById("modalTitle").textContent = isCorrect ? t.correct : t.wrong;

  const exp = (q.explanation && q.explanation[k]) ? q.explanation[k] : "";
  document.getElementById("modalExplain").textContent = `${t.explanation}:\n${exp}`;

  const src = (q.url) ? q.url : "";
  document.getElementById("modalSource").innerHTML = src ? `${t.source}: <a href="${src}" target="_blank" rel="noreferrer">${src}</a>` : "";
}

async function loadQuiz(){
  const resp = await fetch("../assets/questions/quiz2.json", {cache:"no-store"});
  questions = await resp.json();

  // reset
  idx = 0;
  score = 0;

  // enable buttons
  document.querySelectorAll(".choiceBtn").forEach(b=>{
    b.disabled = false;
    b.style.opacity = 1;
  });

  render();
}

document.addEventListener("DOMContentLoaded", async ()=>{
  initLangButtons();

  document.getElementById("homeBtn").addEventListener("click", ()=>go("../index.html"));

  document.querySelectorAll(".choiceBtn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      if (idx >= questions.length) {
        loadQuiz();
        return;
      }
      const choice = Number(btn.getAttribute("data-choice"));
      const q = questions[idx];
      const ok = (choice === Number(q.right));
      if (ok) score += 100;
      showModal(ok, q);
    });
  });

  document.getElementById("modalOk").addEventListener("click", ()=>{
    document.getElementById("modalBackdrop").style.display = "none";
    idx += 1;
    render();
  });

  // clicking outside closes too
  document.getElementById("modalBackdrop").addEventListener("click", (e)=>{
    if (e.target.id === "modalBackdrop"){
      document.getElementById("modalBackdrop").style.display = "none";
      idx += 1;
      render();
    }
  });

  await loadQuiz();
});
