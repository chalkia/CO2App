let questions = [];
let idx = 0;
let score = 0;
const QUIZ_SCORE_KEY = "quizScore";

function loadQuestions(){
  return fetch("../assets/questions/quiz2.json").then(r=>r.json());
}

function renderQuiz(){
  const q = questions[idx];
  const lang = getLang() === "el" ? "gr" : "en";
  
  if(!q){
    // Finish
    document.querySelector(".quizCard").innerHTML = `<h3>${lang==="gr"?"Τέλος!":"Finished!"}</h3>`;
    document.querySelector(".statsBar").innerHTML = `<div class="statPill">Score: ${score}/100</div>`;
    document.getElementById("choicesRow").innerHTML = `<button class="choiceBtn choiceWide" onclick="location.reload()">${lang==="gr"?"Επανάληψη":"Restart"}</button>`;
    localStorage.setItem(QUIZ_SCORE_KEY, score);
    return;
  }

  // Update Stats
  document.getElementById("qLabel").textContent = `Q: ${idx+1}/${questions.length}`;
  document.getElementById("scoreLabel").textContent = `Score: ${score}`;

  // Update Text
  document.getElementById("question").textContent = q.question[lang];
  document.getElementById("opt1").textContent = q.a1[lang];
  document.getElementById("opt2").textContent = q.a2[lang];
  document.getElementById("opt3").textContent = q.a3[lang];
  document.getElementById("hint").textContent = (lang==="gr") ? "Επίλεξε τη σωστή απάντηση" : "Choose the correct answer";

  // Reset State
  document.querySelectorAll(".choiceBtn").forEach(b=>{
    b.disabled = false;
    b.classList.remove("locked");
  });
  document.getElementById("answerCard").style.display = "none";
  document.querySelectorAll(".optionText").forEach(o=>o.classList.remove("answerCorrect", "answerWrong", "answerChosen"));
}

function handleAnswer(choice){
  const q = questions[idx];
  const lang = getLang() === "el" ? "gr" : "en";
  const correct = Number(q.right);
  
  // Visuals
  document.getElementById("opt"+choice).classList.add("answerChosen");
  document.getElementById("opt"+correct).classList.add("answerCorrect");
  if(choice !== correct) document.getElementById("opt"+choice).classList.add("answerWrong");

  // Score
  if(choice === correct) score += 10;
  document.getElementById("scoreLabel").textContent = `Score: ${score}`;

  // Show Explanation
  const card = document.getElementById("answerCard");
  document.getElementById("answerTitle").textContent = (choice === correct) 
    ? (lang==="gr" ? "Σωστά!" : "Correct!") 
    : (lang==="gr" ? "Λάθος." : "Wrong.");
  document.getElementById("answerExplain").textContent = q.explanation[lang];
  if(q.url) {
    document.getElementById("answerSource").innerHTML = `<a href="${q.url}" target="_blank">Source</a>`;
  } else {
    document.getElementById("answerSource").textContent = "";
  }
  card.style.display = "block";

  // Lock buttons
  document.querySelectorAll(".choiceBtn").forEach(b=>b.disabled=true);
  
  // Enable Next
  document.getElementById("btnNext").disabled = false;
}

document.addEventListener("DOMContentLoaded", async ()=>{
  initLangButtons();
  try{
    questions = await loadQuestions();
    renderQuiz();

    document.querySelectorAll(".choiceBtn[data-choice]").forEach(b=>{
      b.addEventListener("click", ()=>handleAnswer(Number(b.dataset.choice)));
    });

    document.getElementById("btnNext").addEventListener("click", ()=>{
      idx++;
      renderQuiz();
    });
    document.getElementById("btnPrev").addEventListener("click", ()=>{
      if(idx>0) idx--;
      renderQuiz();
    });
    
    // Close explanation
    document.getElementById("btnAnswerClose").addEventListener("click", ()=>{
      document.getElementById("answerCard").style.display = "none";
    });

  }catch(e){ console.error(e); }
});