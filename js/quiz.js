let questions = [];
let idx = 0;
let score = 0;
const QUIZ_SCORE_KEY = "quizScore";
const POINTS_PER_QUESTION = 10; // 10 questions -> 100 max
// Feedback toggles (feel free to disable later)
const ENABLE_VIBRATION = true;
const ENABLE_SOUND = true;

let _audioCtx = null;
function beep(ok){
  if (!ENABLE_SOUND) return;
  try{
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!_audioCtx) _audioCtx = new AudioCtx();
    // ensure running (iOS requires a user gesture; this is called from click)
    if (_audioCtx.state === "suspended") _audioCtx.resume();
    const o = _audioCtx.createOscillator();
    const g = _audioCtx.createGain();
    o.type = "sine";
    o.frequency.value = ok ? 880 : 220;
    g.gain.value = 0.03; // subtle
    o.connect(g); g.connect(_audioCtx.destination);
    const now = _audioCtx.currentTime;
    o.start(now);
    o.stop(now + (ok ? 0.06 : 0.10));
  }catch(e){}
}

function vibrateWrong(){
  if (!ENABLE_VIBRATION) return;
  try{
    if (navigator.vibrate) navigator.vibrate([80, 40, 80]);
  }catch(e){}
}

function clearAnswerMarks(){
  ["opt1","opt2","opt3"].forEach(id=>{
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove("answerCorrect","answerWrong");
  });
}

function markAnswers(choice, right){
  clearAnswerMarks();
  const chosen = document.getElementById("opt"+choice);
  const correct = document.getElementById("opt"+right);
  if (correct) correct.classList.add("answerCorrect");
  if (chosen && choice !== right) chosen.classList.add("answerWrong");
}


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
    clearAnswerMarks();
    document.getElementById("opt1").textContent = t.finalScore(score);
    document.getElementById("opt2").textContent = "";
    document.getElementById("opt3").textContent = "";
    document.getElementById("hint").textContent = t.resultMsg(score);

    // persist last quiz score so it can appear in the menu
    try{
      localStorage.setItem(QUIZ_SCORE_KEY, String(score));
    }catch(e){}
    // refresh menu (if open on this page)
    try{ if (typeof buildMenu === "function") buildMenu(); }catch(e){}


    // show a single restart button
    setChoiceLabelsForRestart();

    document.getElementById("qLabel").textContent = "";
    document.getElementById("scoreLabel").textContent = "";

    return;
  }

  const q = questions[idx];
  setStats();
  clearAnswerMarks();

  document.getElementById("question").textContent = q.question[k] || "";
  document.getElementById("opt1").innerHTML = `<span class="optLetter">A</span><span class="optAns">${q.a1[k] || ""}</span>`;
  document.getElementById("opt2").innerHTML = `<span class="optLetter">B</span><span class="optAns">${q.a2[k] || ""}</span>`;
  document.getElementById("opt3").innerHTML = `<span class="optLetter">${k === "gr" ? "Γ" : "C"}</span><span class="optAns">${q.a3[k] || ""}</span>`;
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
      markAnswers(choice, Number(q.right));
      beep(ok);
      if (!ok) vibrateWrong();
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
