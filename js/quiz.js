let questions = [];
let idx = 0;
let score = 0;
const POINTS_PER_QUESTION = 10; // 10 questions -> 100 max

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
    finalScore: (s)=>`ΣΚΟΡ: ${s}/100`,
    resultMsg: (s)=>{
      if (s >= 90) return "Μπράβο! Γνωρίζεις άριστα βασικές έννοιες για τις εκπομπές CO₂ και το αποτύπωμα.";
      if (s >= 70) return "Πολύ καλά! Γνωρίζεις αρκετά πράγματα που αφορούν το CO₂ και τις επιπτώσεις του.";
      if (s >= 50) return "Βλέπω ότι έχεις κάποιες γνώσεις, αλλά μπορείς να μάθεις πολύ περισσότερα ακολουθώντας τα links στις απαντήσεις.";
      return "Ακολούθησε τα links στις απαντήσεις για να μάθεις περισσότερα και προσπάθησε ξανά!";
    },
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
    finalScore: (s)=>`SCORE: ${s}/100`,
    resultMsg: (s)=>{
      if (s >= 90) return "Excellent! You have a very strong understanding of CO₂ and carbon footprint concepts.";
      if (s >= 70) return "Very good! You already know many important things about CO₂ and its impacts.";
      if (s >= 50) return "You have some knowledge, but you can learn much more by following the links in the explanations.";
      return "Follow the links in the explanations to learn more, then try again!";
    },
    restart: "Restart"
  }
};

function setChoiceLabelsForQuestion(){
  const k = langKey();
  const buttons = Array.from(document.querySelectorAll(".choiceBtn"));
  if (buttons.length < 3) return;
  buttons[0].textContent = "A";
  buttons[1].textContent = "B";
  buttons[2].textContent = (k === "gr") ? "Γ" : "C";
  buttons.forEach(b=>{ b.style.display = ""; });
}

function setChoiceLabelsForRestart(){
  const t = UI[getLang()];
  const buttons = Array.from(document.querySelectorAll(".choiceBtn"));
  if (buttons.length < 1) return;
  buttons[0].textContent = t.restart;
  buttons[0].disabled = false;
  buttons[0].style.opacity = 1;
  if (buttons[1]) buttons[1].style.display = "none";
  if (buttons[2]) buttons[2].style.display = "none";
}

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
    document.getElementById("opt1").textContent = t.finalScore(score);
    document.getElementById("opt2").textContent = "";
    document.getElementById("opt3").textContent = "";
    document.getElementById("hint").textContent = t.resultMsg(score);

    // show a single restart button
    setChoiceLabelsForRestart();

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

  setChoiceLabelsForQuestion();
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

    document.querySelectorAll(".choiceBtn").forEach(btn=>{
    btn.addEventListener("click", ()=>{
      if (idx >= questions.length) {
        loadQuiz();
        return;
      }
      const choice = Number(btn.getAttribute("data-choice"));
      const q = questions[idx];
      const ok = (choice === Number(q.right));
      if (ok) score = Math.min(100, score + POINTS_PER_QUESTION);
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
