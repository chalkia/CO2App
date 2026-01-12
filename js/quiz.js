Έλαβα το αρχείο `quiz2.json`.

Έχω ενσωματώσει τις ερωτήσεις μέσα στον κώδικα JavaScript, προσθέτοντας και ένα πεδίο `id` για να είναι πλήρης η δομή. Το μόνο που έχεις να κάνεις είναι να αντιγράψεις **ολόκληρο** τον παρακάτω κώδικα και να αντικαταστήσεις τα πάντα στο αρχείο `js/quiz.js`.

### Το αρχείο `js/quiz.js` (Έτοιμο για αντιγραφή)

```javascript
/* Αρχείο: js/quiz.js 
   Περιγραφή: Κώδικας Quiz με ενσωματωμένες ερωτήσεις
*/

// --- ΔΕΔΟΜΕΝΑ ΕΡΩΤΗΣΕΩΝ ---
const questionsData = [
  {
    "id": 1,
    "question": {
      "gr": "Το ανθρακικό αποτύπωμα εκφράζεται σε τόνους CO₂ και άλλες φορές σε τόνους CO₂e. Ποια είναι η διαφορά;",
      "en": "The carbon footprint is sometimes expressed in tons of CO₂ and other times in tons of CO₂e. What is the difference?"
    },
    "img": "../assets/questions/img/12.png",
    "a1": {
      "gr": "Δεν υπάρχει διαφορά, είναι απλώς δύο διαφορετικοί τρόποι γραφής του ίδιου πράγματος.",
      "en": "There is no difference, they are just two ways of writing the same thing."
    },
    "a2": {
      "gr": "Το CO₂e περιλαμβάνει και άλλα αέρια του θερμοκηπίου, μετατρέποντάς τα σε ισοδύναμη ποσότητα CO₂.",
      "en": "CO₂e includes other greenhouse gases by converting them into an equivalent amount of CO₂."
    },
    "a3": {
      "gr": "Το CO₂ αφορά μόνο φυσικές εκπομπές, ενώ το CO₂e χρησιμοποιείται μόνο για βιομηχανικές εκπομπές.",
      "en": "CO₂ refers only to natural emissions, while CO₂e is used only for industrial emissions."
    },
    "right": 2,
    "explanation": {
      "gr": "Το CO₂ (διοξείδιο του άνθρακα) είναι ένα μόνο από τα αέρια του θερμοκηπίου. Το CO₂e (ισοδύναμο διοξείδιο του άνθρακα) είναι μια μονάδα μέτρησης που χρησιμοποιείται για να συμπεριλάβει την επίδραση και άλλων αερίων (όπως μεθάνιο, υποξείδιο του αζώτου) εκφράζοντάς τα ως την ποσότητα CO₂ που θα προκαλούσε την ίδια θέρμανση.",
      "en": "CO₂ is just one greenhouse gas. CO₂e (Carbon Dioxide Equivalent) is a metric used to compare the emissions from various greenhouse gases on the basis of their global-warming potential (GWP), by converting amounts of other gases to the equivalent amount of carbon dioxide with the same global warming potential."
    }
  },
  {
    "id": 2,
    "question": {
      "gr": "Ποια είναι η επίδραση της αποψίλωσης των τροπικών δασών στο ισοζύγιο του CO₂ στην ατμόσφαιρα;",
      "en": "What is the effect of tropical deforestation on the balance of CO₂ in the atmosphere?"
    },
    "img": "../assets/questions/img/17.png",
    "a1": {
      "gr": "Μειώνεται, γιατί τα καλλιεργούμενα φυτά απορροφούν CO₂.",
      "en": "It decreases, because crops also absorb CO₂."
    },
    "a2": {
      "gr": "Αυξάνεται, γιατί απελευθερώνεται άνθρακας από το δάσος και μειώνεται η δυνατότητα απορρόφησης.",
      "en": "It increases, because carbon stored in the forest is released and the absorption capacity is reduced."
    },
    "a3": {
      "gr": "Μένει περίπου σταθερό, γιατί θεωρητικά τα δέντρα που χάνονται αντικαθίστανται από τις καλλιέργειες.",
      "en": "It stays roughly the same, since in theory the lost trees are replaced by crops."
    },
    "right": 2,
    "explanation": {
      "gr": "Τα τροπικά δάση είναι τεράστιες αποθήκες άνθρακα. Όταν αποψιλώνονται, ο άνθρακας που είναι αποθηκευμένος στο ξύλο και στο έδαφος απελευθερώνεται ως CO₂. Επιπλέον, χάνονται τα δέντρα που απορροφούσαν CO₂ από την ατμόσφαιρα. Η γεωργική γη αποθηκεύει πολύ λιγότερο άνθρακα.",
      "en": "Tropical forests are massive carbon sinks. When cleared, the carbon stored in the wood and soil is released as CO₂. Additionally, the capacity to absorb future CO₂ is lost. Agricultural land stores significantly less carbon than forests."
    }
  }
];

// --- ΛΕΙΤΟΥΡΓΙΑ QUIZ (Μην αλλάξεις τίποτα παρακάτω) ---
let idx = 0;
let score = 0;
let answers = []; // Αποθηκεύει: {choice, correct, right}
const QUIZ_SCORE_KEY = "quizScore";

function getQuizLang() {
  if (typeof getLang === 'function') {
    return getLang() === "el" ? "gr" : "en";
  }
  return "gr";
}

function renderQuiz(){
  const lang = getQuizLang();
  
  // 1. Έλεγχος Τερματισμού
  if (idx >= questionsData.length) {
    showFinishScreen(lang);
    return;
  }

  const q = questionsData[idx];
  // Έλεγχος αν υπάρχει αποθηκευμένη απάντηση
  const hasAnswered = answers[idx] !== null && answers[idx] !== undefined;

  // 2. UI Updates
  const qLabel = document.getElementById("qLabel");
  const sLabel = document.getElementById("scoreLabel");
  
  if(qLabel) qLabel.textContent = (lang==="gr" ? "Ερ: " : "Q: ") + (idx+1) + "/" + questionsData.length;
  if(sLabel) sLabel.textContent = (lang==="gr" ? "Σκορ: " : "Score: ") + score;

  const qText = document.getElementById("question");
  const o1 = document.getElementById("opt1");
  const o2 = document.getElementById("opt2");
  const o3 = document.getElementById("opt3");
  const hintEl = document.getElementById("hint");

  // Αμυντικός έλεγχος για να μην κρασάρει αν λείπουν HTML elements
  if(!qText || !o1 || !o2 || !o3) {
      console.error("Missing HTML elements for quiz");
      return;
  }

  qText.textContent = q.question[lang];
  o1.textContent = q.a1[lang];
  o2.textContent = q.a2[lang];
  o3.textContent = q.a3[lang];

  if (hasAnswered) {
      hintEl.textContent = "";
  } else {
      hintEl.textContent = (lang==="gr") ? "Επίλεξε τη σωστή απάντηση" : "Choose the correct answer";
  }

  // 3. Καθαρισμός Στυλ
  document.querySelectorAll(".optionText").forEach(o => 
    o.classList.remove("answerCorrect", "answerWrong", "answerChosen")
  );
  document.querySelectorAll(".choiceBtn").forEach(b => {
    b.classList.remove("locked");
    b.disabled = false;
  });

  // 4. Επαναφορά Κατάστασης (αν έχει απαντηθεί)
  if (hasAnswered) {
    const saved = answers[idx];
    showFeedback(saved.choice, saved.right, lang, false);
  } else {
    // Νέα ερώτηση
    const ansCard = document.getElementById("answerCard");
    if(ansCard) ansCard.style.display = "none";
    
    const nextBtn = document.getElementById("btnNext");
    if(nextBtn) nextBtn.disabled = true;
  }

  // Κουμπί Prev
  const prevBtn = document.getElementById("btnPrev");
  if(prevBtn) prevBtn.disabled = (idx === 0);
}

function showFeedback(choice, right, lang, updateScore) {
  // Χρωματισμός
  const elChoice = document.getElementById("opt" + choice);
  const elRight = document.getElementById("opt" + right);
  
  if(elChoice) elChoice.classList.add("answerChosen");
  if(elRight) elRight.classList.add("answerCorrect");
  
  if (choice !== right && elChoice) {
    elChoice.classList.add("answerWrong");
  }

  // Ενημέρωση Σκορ
  if (updateScore && choice === right) {
    score += 10;
    const sLabel = document.getElementById("scoreLabel");
    if(sLabel) sLabel.textContent = (lang==="gr" ? "Σκορ: " : "Score: ") + score;
  }

  // Κλείδωμα κουμπιών
  document.querySelectorAll(".choiceBtn").forEach(b => {
    b.disabled = true;
    b.classList.add("locked");
  });

  // Εμφάνιση Κάρτας
  const q = questionsData[idx];
  const card = document.getElementById("answerCard");
  const titleEl = document.getElementById("answerTitle");
  const explainEl = document.getElementById("answerExplain");
  const sourceEl = document.getElementById("answerSource");

  if(card && titleEl && explainEl) {
      titleEl.textContent = (choice === right) 
        ? (lang === "gr" ? "Σωστά!" : "Correct!") 
        : (lang === "gr" ? "Λάθος." : "Wrong.");
      
      explainEl.textContent = q.explanation[lang];
      
      if (sourceEl) {
          if (q.url) {
            sourceEl.innerHTML = `<a href="${q.url}" target="_blank">${lang==="gr"?"Πηγή":"Source"}</a>`;
          } else {
            sourceEl.textContent = "";
          }
      }
      card.style.display = "block";
  }

  // Ενεργοποίηση Next
  const nextBtn = document.getElementById("btnNext");
  if(nextBtn) nextBtn.disabled = false;
}

function handleAnswer(choice) {
  if (idx >= questionsData.length) return;
  if (answers[idx]) return; // Αν έχει ήδη απαντηθεί, αγνόησε

  const q = questionsData[idx];
  const right = Number(q.right); 
  const lang = getQuizLang();

  // Αποθήκευση
  answers[idx] = {
    choice: choice,
    right: right,
    correct: (choice === right)
  };

  showFeedback(choice, right, lang, true);
}

function showFinishScreen(lang) {
  const card = document.querySelector(".quizCard");
  const choicesRow = document.getElementById("choicesRow");
  const navTop = document.querySelector(".quizNavTop");
  const ansCard = document.getElementById("answerCard");

  // Υπολογισμός μηνύματος με βάση το ποσοστό επιτυχίας
  const totalScore = questionsData.length * 10;
  let msg = "";
  if (score >= (totalScore * 0.8)) msg = (lang==="gr") ? "Άριστα!" : "Excellent!";
  else if (score >= (totalScore * 0.5)) msg = (lang==="gr") ? "Καλά τα πήγες!" : "Good job!";
  else msg = (lang==="gr") ? "Μπορείς και καλύτερα!" : "Keep trying!";

  if(card) {
      card.innerHTML = `
        <div style="text-align:center; padding: 20px;">
          <h2>${lang==="gr" ? "Τέλος Κουίζ" : "Quiz Finished"}</h2>
          <div style="font-size: 2em; font-weight:bold; margin: 20px 0; color:var(--primary);">
            ${score} / ${totalScore}
          </div>
          <p>${msg}</p>
        </div>
      `;
  }
  
  if(choicesRow) {
      choicesRow.innerHTML = `
        <button class="choiceBtn choiceWide" id="restartBtn">${lang==="gr"?"Επανάληψη":"Restart"}</button>
      `;
      const rBtn = document.getElementById("restartBtn");
      if(rBtn) rBtn.addEventListener("click", () => location.reload());
  }

  if(ansCard) ansCard.style.display = "none";
  if(navTop) navTop.style.display = "none";

  localStorage.setItem(QUIZ_SCORE_KEY, score);
}

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  if (typeof initLangButtons === 'function') {
    initLangButtons();
  }

  // Αρχικοποίηση πίνακα απαντήσεων
  answers = new Array(questionsData.length).fill(null);

  renderQuiz();

  // Listeners για επιλογές
  document.querySelectorAll(".choiceBtn[data-choice]").forEach(b => {
    b.addEventListener("click", () => {
        handleAnswer(Number(b.dataset.choice));
    });
  });

  // Listeners για πλοήγηση
  const btnNext = document.getElementById("btnNext");
  const btnPrev = document.getElementById("btnPrev");
  const btnClose = document.getElementById("btnAnswerClose");

  if(btnNext) {
      btnNext.addEventListener("click", () => {
        if (idx < questionsData.length) {
            idx++;
            renderQuiz();
        }
      });
  }

  if(btnPrev) {
      btnPrev.addEventListener("click", () => {
        if (idx > 0) {
            idx--;
            renderQuiz();
        }
      });
  }

  if(btnClose) {
      btnClose.addEventListener("click", () => {
         const ac = document.getElementById("answerCard");
         if(ac) ac.style.display = "none";
      });
  }
});

```
