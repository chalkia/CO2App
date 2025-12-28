// CO2app Quiz (v2) — inline explanation + review navigation

let questions = [];
let idx = 0;
let score = 0;

const QUIZ_SCORE_KEY = "quizScore";
const POINTS_PER_QUESTION = 10; // 10 questions -> 100 max

// Feedback toggles
const ENABLE_VIBRATION = true;
const ENABLE_SOUND = true;

let answers = []; // [{choice:number, right:number, correct:boolean}]

let _audioCtx = null;
function beep(ok){
  if (!ENABLE_SOUND) return;
  try{
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!_audioCtx) _audioCtx = new AudioCtx();
    const ctx = _audioCtx;

    // iOS: must be resumed after user gesture, but we call beep only on click
    if (ctx.state === "suspended") ctx.resume();

    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = "sine";
    o.frequency.value = ok ? 880 : 220;
    g.gain.value = 0.06;
    o.connect(g); g.connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + 0.10);
  }catch(e){}
}

function vibe(ok){
  if (!ENABLE_VIBRATION) return;
  try{
    if (navigator.vibrate) navigator.vibrate(ok ? 35 : [30, 40, 30]);
  }catch(e){}
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
    restart: "Ξεκίνα ξανά",
    prev: "Προηγ.",
    next: "Επόμ.",
    finish: "Τέλος"
  },
  en: {
    q: "Question",
    score: "SCORE",
    hint: "Select the answer using the buttons below",
    correct: "Nice — that is correct!",
    wrong: "That is not correct.",
    explanation: "Explanation",
    source: "Source",
    finishedTitle: "Quiz complete",
    finalScore: (s)=>`SCORE: ${s}/100`,
    resultMsg: (s)=>{
      if (s >= 90) return "Excellent! You have a very strong understanding of CO₂ and carbon footprint concepts.";
      if (s >= 70) return "Very good! You already know many important things about CO₂ and its impacts.";
      if (s >= 50) return "You have some knowledge, but you can learn much more by following the links in the explanations.";
      return "Follow the links in the explanations to learn more, then try again!";
    },
    restart: "Restart",
    prev: "Prev",
    next: "Next",
    finish: "Finish"
  }
};

function clearAnswerMarks(){
  ["opt1","opt2","opt3"].forEach(id=>{
    const el = document.getElementById(id);
    if (!el) return;
    el.classList.remove("answerCorrect", "answerWrong", "answerChosen");
  });
}

function setStats(){
  const t = UI[getLang()];
  const qLabel = document.getElementById("qLabel");
  const scoreLabel = document.getElementById("scoreLabel");
  if (qLabel) qLabel.textContent = `${t.q}: ${Math.min(idx+1, questions.length)}/${questions.length}`;
  if (scoreLabel) scoreLabel.textContent = `${t.score}: ${score}/100`;

  const navMid = document.getElementById("navMid");
  if (navMid) navMid.textContent = `${Math.min(idx+1, questions.length)}/${questions.length}`;
}

function setNavButtons(){
  const t = UI[getLang()];
  const prev = document.getElementById("btnPrev");
  const next = document.getElementById("btnNext");
  if (prev) prev.disabled = (idx <= 0);
  if (!next) return;

  // Finished screen
  if (idx >= questions.length){
    next.style.display = "none";
    if (prev) prev.style.display = "";
    return;
  }

  next.style.display = "";

  // Disable Next until answered
  const a = answers[idx];
  next.disabled = !a;

  // Text/icon (we keep arrows on button, but we can set title)
  next.title = (idx === questions.length - 1) ? t.finish : t.next;
}

function showAnswerCard(q, isCorrect){
  const t = UI[getLang()];
  const k = langKey();
  const card = document.getElementById("answerCard");
  const titleEl = document.getElementById("answerTitle");
  const explainEl = document.getElementById("answerExplain");
  const sourceEl = document.getElementById("answerSource");

  if (!card || !titleEl || !explainEl) return;

  titleEl.textContent = isCorrect ? t.correct : t.wrong;
  explainEl.textContent = q.explanation ? (q.explanation[k] || "") : "";
  if (sourceEl){
    if (q.url){
      sourceEl.innerHTML = `${t.source}: <a href="${q.url}" target="_blank" rel="noopener">link</a>`;
    }else{
      sourceEl.textContent = "";
    }
  }

  card.style.display = "block";
  document.body.classList.add("answerOpen");
}

function hideAnswerCard(){
  const card = document.getElementById("answerCard");
  if (card) card.style.display = "none";
  document.body.classList.remove("answerOpen");
}

function markAnswers(q, choice){
  clearAnswerMarks();
  const right = Number(q.right);

  const correctEl = document.getElementById("opt" + right);
  if (correctEl) correctEl.classList.add("answerCorrect");

  const chosenEl = document.getElementById("opt" + choice);
  if (chosenEl){
    chosenEl.classList.add("answerChosen");
    if (choice !== right) chosenEl.classList.add("answerWrong");
  }
}

function lockChoiceButtons(lock){
  const buttons = Array.from(document.querySelectorAll(".choiceBtn"));
  buttons.forEach(b=>{
    b.disabled = !!lock;
    b.classList.toggle("locked", !!lock);
  });
}

function render(){
  const t = UI[getLang()];
  const k = langKey();

  setStats();

  const prev = document.getElementById("btnPrev");
  const next = document.getElementById("btnNext");

  // Finished view
  if (idx >= questions.length){
    hideAnswerCard();
    clearAnswerMarks();
    lockChoiceButtons(true);

    document.getElementById("question").textContent = t.finishedTitle;
    document.getElementById("opt1").textContent = t.finalScore(score);
    document.getElementById("opt2").textContent = "";
    document.getElementById("opt3").textContent = "";
    document.getElementById("hint").textContent = t.resultMsg(score);

    // persist last quiz score so it can appear in the menu
    try{
      localStorage.setItem(QUIZ_SCORE_KEY, String(score));
    }catch(e){}
    try{ if (typeof buildMenu === "function") buildMenu(); }catch(e){}

    // Replace letters with a restart button
    const row = document.getElementById("choicesRow");
    if (row){
      row.innerHTML = `<button class="choiceBtn choiceWide" id="restartBtn">${t.restart}</button>`;
      const rb = document.getElementById("restartBtn");
      if (rb){
        rb.addEventListener("click", ()=>{
          idx = 0;
          score = 0;
          answers = Array(questions.length).fill(null);
          // restore buttons
          row.innerHTML = `
            <button class="choiceBtn" data-choice="1">A</button>
            <button class="choiceBtn" data-choice="2">B</button>
            <button class="choiceBtn" data-choice="3">Γ</button>
          `;
          wireChoiceButtons();
          render();
        });
      }
    }

    setNavButtons();
    return;
  }

  // Normal question view
  const q = questions[idx];
  document.getElementById("question").textContent = q.question ? (q.question[k] || "") : "";
  document.getElementById("opt1").textContent = q.a1 ? (q.a1[k] || "") : "";
  document.getElementById("opt2").textContent = q.a2 ? (q.a2[k] || "") : "";
  document.getElementById("opt3").textContent = q.a3 ? (q.a3[k] || "") : "";
  document.getElementById("hint").textContent = t.hint;

  // Restore choice row if it was replaced by restart
  const row = document.getElementById("choicesRow");
  if (row && !row.querySelector('[data-choice="1"]')){
    row.innerHTML = `
      <button class="choiceBtn" data-choice="1">A</button>
      <button class="choiceBtn" data-choice="2">B</button>
      <button class="choiceBtn" data-choice="3">Γ</button>
    `;
    wireChoiceButtons();
  }

  const a = answers[idx];
  if (a){
    markAnswers(q, a.choice);
    showAnswerCard(q, a.correct);
    lockChoiceButtons(true);
  }else{
    hideAnswerCard();
    clearAnswerMarks();
    lockChoiceButtons(false);
  }

  setNavButtons();
}

function wireChoiceButtons(){
  const buttons = Array.from(document.querySelectorAll(".choiceBtn[data-choice]"));
  buttons.forEach(btn=>{
    btn.addEventListener("click", ()=>{
      if (idx >= questions.length) return;
      const q = questions[idx];
      if (answers[idx]) return; // locked

      const choice = Number(btn.dataset.choice);
      const right = Number(q.right);
      const correct = (choice === right);

      answers[idx] = { choice, right, correct };

      if (correct) score += POINTS_PER_QUESTION;

      markAnswers(q, choice);
      showAnswerCard(q, correct);

      vibe(correct);
      beep(correct);

      lockChoiceButtons(true);
      setStats();
      setNavButtons();
    });
  });
}

function wireNavButtons(){
  const prev = document.getElementById("btnPrev");
  const next = document.getElementById("btnNext");

  if (prev){
    prev.addEventListener("click", ()=>{
      if (idx <= 0) return;
      idx -= 1;
      render();
    });
  }

  if (next){
    next.addEventListener("click", ()=>{
      if (idx >= questions.length) return;

      // Require answered
      if (!answers[idx]) return;

      if (idx === questions.length - 1){
        // Finish
        idx = questions.length;
      }else{
        idx += 1;
      }
      render();
    });
  }
}

async function loadQuestions(){
  // Using relative path used in the app
  const resp = await fetch("../assets/questions/quiz2.json", { cache: "no-store" });
  if (!resp.ok) throw new Error("quiz json failed");
  return await resp.json();
}

document.addEventListener("DOMContentLoaded", async ()=>{
  initLangButtons();

  try{
    questions = await loadQuestions();
  }catch(e){
    console.error(e);
    document.getElementById("question").textContent = "Quiz failed to load.";
    return;
  }

  answers = Array(questions.length).fill(null);

  // Answer card close
  const closeBtn = document.getElementById("btnAnswerClose");
  if (closeBtn){
    closeBtn.addEventListener("click", hideAnswerCard);
  }

  wireNavButtons();
  wireChoiceButtons();

  render();
});

// Re-render on language change (common.js sets localStorage lang)
window.addEventListener("storage", (e)=>{
  if (e && e.key === "lang") render();
});
