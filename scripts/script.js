// ====== ELEMENTS ======
const introPage = document.getElementById('intro-page');
const startQuizBtn = document.getElementById('start-quiz');
const quizCard = document.getElementById("quiz-card");
const quizContainer = document.getElementById("quiz-container");
const questionEl = document.getElementById("question-container");
const optionsEl = document.getElementById("options-container");
const feedbackEl = document.getElementById("feedback");
const qcountEl = document.getElementById("qcount");
const progressFill = document.getElementById("progress-fill");
const countdownEl = document.getElementById("countdown");
const resultCard = document.getElementById("result-container");
const scoreLine = document.getElementById("score-line");

const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const restartBtn = document.getElementById("restart-btn");
const playAgainBtn = document.getElementById("play-again");

// ====== AUDIO ======
const soundCorrect = new Audio("sounds/correct.wav");
const soundWrong = new Audio("sounds/wrong.wav");
const soundClick = new Audio("sounds/click.wav");

// ====== STATE ======
let quizData = []; // dynamically loaded questions
let current = 0;
let answers = [];
const QUESTION_TIME = 30;
let timeLeft = QUESTION_TIME;
let timerId = null;

// ====== QUIZ FUNCTIONS ======
function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function updateTopBar() {
  qcountEl.textContent = `Question ${current + 1} / ${quizData.length}`;
  const pct = Math.round((current) / quizData.length * 100);
  progressFill.style.width = `${pct}%`;
  countdownEl.textContent = formatTime(timeLeft);
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

function startTimer() {
  stopTimer();
  if (answers[current] !== null) {
    countdownEl.textContent = "— —";
    return;
  }
  timeLeft = QUESTION_TIME;
  countdownEl.textContent = formatTime(timeLeft);
  timerId = setInterval(() => {
    timeLeft--;
    countdownEl.textContent = formatTime(timeLeft);
    if (timeLeft <= 0) {
      stopTimer();
      answers[current] = "__timeout__";
      feedbackEl.textContent = "Time's up!";
      autoNext();
    }
  }, 1000);
}

function autoNext(delay = 450) {
  setTimeout(() => {
    if (current < quizData.length - 1) {
      current++;
      renderQuestion();
    } else showResult();
  }, delay);
}

function renderQuestion() {
  stopTimer();
  const q = quizData[current];

  questionEl.classList.remove("fade-in");
  void questionEl.offsetWidth;
  questionEl.classList.add("fade-in");
  questionEl.textContent = q.question;

  optionsEl.innerHTML = "";
  const userChoice = answers[current];

  q.options.forEach(opt => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.type = "button";
    btn.textContent = opt;

    if (userChoice !== null) {
      btn.disabled = true;
      if (opt === q.correctAnswer) btn.classList.add("correct");
      if (userChoice === opt && userChoice !== q.correctAnswer) btn.classList.add("wrong");
    } else {
      btn.addEventListener("click", () => {
        soundClick.play(); // play click sound
        answers[current] = opt;
        if (opt === q.correctAnswer) {
          btn.classList.add("correct");
          feedbackEl.textContent = "Nice! ✅";
          soundCorrect.play(); // correct answer sound
        } else {
          btn.classList.add("wrong");
          feedbackEl.textContent = "Oops! ❌";
          soundWrong.play(); // wrong answer sound
          [...optionsEl.children].forEach(b => {
            if (b.textContent === q.correctAnswer) b.classList.add("correct");
          });
        }
        [...optionsEl.querySelectorAll("button.option")].forEach(b => b.disabled = true);
        stopTimer();
        autoNext();
      });
    }

    optionsEl.appendChild(btn);
  });

  feedbackEl.textContent = (userChoice === "__timeout__") ? "You ran out of time ⏳" : "";
  prevBtn.disabled = current === 0;
  updateTopBar();
  startTimer();
}

// ====== NAVIGATION ======
prevBtn.addEventListener("click", () => {
  soundClick.play();
  if (current > 0) { current--; renderQuestion(); }
});
nextBtn.addEventListener("click", () => {
  soundClick.play();
  if (current < quizData.length - 1) { current++; renderQuestion(); }
  else showResult();
});
restartBtn.addEventListener("click", () => { soundClick.play(); resetQuiz(); });
playAgainBtn.addEventListener("click", () => { soundClick.play(); resetQuiz(); });

// ====== START QUIZ ======
startQuizBtn.addEventListener("click", async () => {
  soundClick.play();
  introPage.style.display = "none";
  quizContainer.style.display = "flex";
  await loadRandomSportsQuestions(12); // load 12+ sports questions
  renderQuestion();
});

// ====== FETCH RANDOM SPORTS QUESTIONS ======
async function loadRandomSportsQuestions(amount = 12) {
  try {
    const res = await fetch(`https://opentdb.com/api.php?amount=${amount}&category=21&type=multiple`);
    const data = await res.json();
    quizData = data.results.map(q => {
      const options = [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5);
      return {
        question: decodeHtml(q.question),
        options: options.map(opt => decodeHtml(opt)),
        correctAnswer: decodeHtml(q.correct_answer)
      };
    });
    answers = new Array(quizData.length).fill(null);
  } catch (err) {
    console.error("Failed to fetch sports questions:", err);
    alert("Could not load quiz questions. Please check your internet connection.");
  }
}

// ====== HELPER TO DECODE HTML ENTITIES ======
function decodeHtml(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

// ====== RESULT / RESET ======
function showResult() {
  stopTimer();
  const correctCount = quizData.reduce((acc, q, i) => acc + (answers[i] === q.correctAnswer ? 1 : 0), 0);
  quizContainer.style.display = "none";
  resultCard.style.display = "flex";
  scoreLine.textContent = `You scored ${correctCount} out of ${quizData.length}.`;
}

function resetQuiz() {
  answers = new Array(quizData.length).fill(null);
  current = 0;
  resultCard.style.display = "none";
  quizContainer.style.display = "flex";
  renderQuestion();
}
