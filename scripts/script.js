// ================== ELEMENTS ==================
const introPage = document.getElementById('intro-page');
const startQuizBtn = document.getElementById('start-quiz');

const p1Input = document.getElementById('player1-name');
const p2Input = document.getElementById('player2-name');
const difficultySelect = document.getElementById('difficulty');
const sectionSelect = document.getElementById('section');

const quizCard = document.getElementById('quiz-card');
const quizContainer = document.getElementById('quiz-container');
const questionEl = document.getElementById('question-container');
const optionsEl = document.getElementById('options-container');
const feedbackEl = document.getElementById('feedback');
const qcountEl = document.getElementById('qcount');
const progressFill = document.getElementById('progress-fill');
const countdownEl = document.getElementById('countdown');

const resultCard = document.getElementById('result-container');
const resultExtra = document.getElementById('result-extra');

const prevBtn = document.getElementById('prev-btn');
const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');
const playAgainBtn = document.getElementById('play-again');

const shareTwitterBtn = document.getElementById('share-twitter');
const shareWhatsAppBtn = document.getElementById('share-whatsapp');
const shareFacebookBtn = document.getElementById('share-facebook');

const confettiCanvas = document.getElementById('confetti-canvas');

// ================== AUDIO ==================
const soundCorrect = new Audio('sounds/correct.wav');
const soundWrong = new Audio('sounds/wrong.wav');
const soundClick = new Audio('sounds/click.wav');
const soundCongrats = new Audio('sounds/correct.wav'); // reuse

// ================== STATE ==================
let questionSet = [];     // [{question, options, correctAnswer, fact}]
let answers = [];         // selected answers or "__timeout__"
let players = [];         // [{name, score}]
let currentPlayer = 0;    // index
let currentQ = 0;         // question index
let timeLeft = 30;
let timerId = null;

const QUESTION_TIME = 30;

// high scores per section
function highScoreKey(section) {
  return `highScore_${section}`;
}
function getHighScore(section) {
  return Number(localStorage.getItem(highScoreKey(section))) || 0;
}
function setHighScore(section, value) {
  localStorage.setItem(highScoreKey(section), String(value));
}

// ================== UTIL ==================
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
function formatTime(sec) {
  const m = Math.floor(sec / 60).toString().padStart(2, '0');
  const s = Math.floor(sec % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}
function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

// ================== QUESTION BANKS ==================
// Adults: European clubs + African national team players (all MCQ, 4 options)
const ADULT_BANK = [
  {
    question: "Which club has won the most UEFA Champions League titles?",
    options: ["Real Madrid", "AC Milan", "Liverpool", "Bayern Munich"],
    correctAnswer: "Real Madrid",
    fact: "Real Madrid have the record haul, with a double-digit tally and multiple modern-era wins."
  },
  {
    question: "Lionel Messi made his professional debut for which European club?",
    options: ["Barcelona", "PSG", "Newell's Old Boys", "Inter Milan"],
    correctAnswer: "Barcelona",
    fact: "Messi debuted for Barcelona’s first team in 2004 after joining La Masia at 13."
  },
  {
    question: "Cristiano Ronaldo first wore the number 7 at which European club?",
    options: ["Manchester United", "Real Madrid", "Sporting CP", "Juventus"],
    correctAnswer: "Manchester United",
    fact: "Sir Alex Ferguson handed Ronaldo the iconic No. 7 shirt at United."
  },
  {
    question: "Which African nation won AFCON 2019?",
    options: ["Algeria", "Senegal", "Egypt", "Nigeria"],
    correctAnswer: "Algeria",
    fact: "Algeria beat Senegal 1–0 in the final with an early goal from Baghdad Bounedjah."
  },
  {
    question: "Didier Drogba is most associated with which European club?",
    options: ["Chelsea", "Marseille", "Galatasaray", "Le Mans"],
    correctAnswer: "Chelsea",
    fact: "Drogba scored 164 goals for Chelsea and is a four-time Premier League champion."
  },
  {
    question: "Mohamed Salah represents which African national team?",
    options: ["Egypt", "Morocco", "Tunisia", "Algeria"],
    correctAnswer: "Egypt",
    fact: "Salah helped Egypt reach the 2018 World Cup; he’s among their all-time top scorers."
  },
  {
    question: "Which European club plays at the Allianz Arena?",
    options: ["Bayern Munich", "Juventus", "RB Leipzig", "Benfica"],
    correctAnswer: "Bayern Munich",
    fact: "The Allianz Arena’s exterior can glow in different colors for Bayern and Germany matches."
  },
  {
    question: "Which country won AFCON 2021 (played in 2022)?",
    options: ["Senegal", "Egypt", "Cameroon", "Ivory Coast"],
    correctAnswer: "Senegal",
    fact: "Senegal won their first AFCON title, beating Egypt on penalties."
  },
  {
    question: "Which club’s anthem is “You’ll Never Walk Alone”?",
    options: ["Liverpool", "Celtic", "Dortmund", "Ajax"],
    correctAnswer: "Liverpool",
    fact: "The song became iconic at Anfield in the 1960s and is sung before every home match."
  },
  {
    question: "Sadio Mané made his senior international debut for which African nation?",
    options: ["Senegal", "Mali", "Guinea", "Gambia"],
    correctAnswer: "Senegal",
    fact: "Mané has been pivotal for Senegal, winning AFCON and qualifying for World Cups."
  },
  {
    question: "Which Italian club is nicknamed “La Vecchia Signora” (The Old Lady)?",
    options: ["Juventus", "AC Milan", "Inter", "Roma"],
    correctAnswer: "Juventus",
    fact: "Juventus dominate Serie A history with numerous Scudetti."
  },
  {
    question: "Which African legend captained Cameroon and scored at the 1990 World Cup at age 38+?",
    options: ["Roger Milla", "Samuel Eto’o", "Rigobert Song", "Thomas N’Kono"],
    correctAnswer: "Roger Milla",
    fact: "Milla’s corner-flag dance became one of the World Cup’s most memorable celebrations."
  },
  {
    question: "Which club did Kylian Mbappé join after Monaco (first move)?",
    options: ["Paris Saint-Germain", "Real Madrid", "Liverpool", "Juventus"],
    correctAnswer: "Paris Saint-Germain",
    fact: "Mbappé initially joined PSG on loan from Monaco before a record-size permanent deal."
  },
  {
    question: "Which African national team is nicknamed the “Super Eagles”?",
    options: ["Nigeria", "Ghana", "Cameroon", "Senegal"],
    correctAnswer: "Nigeria",
    fact: "Nigeria won AFCON in 1980, 1994 and 2013 and are a World Cup regular."
  },
  {
    question: "Which club has the famous La Masia academy?",
    options: ["Barcelona", "Athletic Club", "Ajax", "Porto"],
    correctAnswer: "Barcelona",
    fact: "La Masia produced stars like Xavi, Iniesta and Messi."
  },
  {
    question: "Which African striker is Ivory Coast’s all-time top scorer?",
    options: ["Didier Drogba", "Wilfried Zaha", "Laurent Pokou", "Sébastien Haller"],
    correctAnswer: "Didier Drogba",
    fact: "Drogba scored 65 goals for the Elephants."
  }
];

// ================== KIDS BANK ==================
const KIDS_BANK = [
  // English
  {
    question: "Which word is a noun?",
    options: ["Apple", "Run", "Quickly", "Blue"],
    correctAnswer: "Apple",
    fact: "A noun is a person, place, or thing. 'Apple' is a thing."
  },
  {
    question: "Choose the correct spelling:",
    options: ["Bannana", "Banana", "Bananna", "Bananaa"],
    correctAnswer: "Banana",
    fact: "The correct spelling is 'Banana'."
  },
  {
    question: "Which is a verb?",
    options: ["Jump", "Happy", "Dog", "Blue"],
    correctAnswer: "Jump",
    fact: "A verb is an action word. 'Jump' is an action."
  },
  {
    question: "Select the adjective:",
    options: ["Quick", "Run", "Book", "Cat"],
    correctAnswer: "Quick",
    fact: "An adjective describes a noun. 'Quick' describes speed."
  },

  // Maths
  {
    question: "What is 8 + 5?",
    options: ["12", "13", "14", "15"],
    correctAnswer: "13",
    fact: "8 + 5 equals 13."
  },
  {
    question: "What is 9 × 3?",
    options: ["27", "26", "29", "30"],
    correctAnswer: "27",
    fact: "9 multiplied by 3 equals 27."
  },
  {
    question: "What is 15 - 7?",
    options: ["8", "7", "9", "6"],
    correctAnswer: "8",
    fact: "15 minus 7 equals 8."
  },
  {
    question: "What is 12 ÷ 4?",
    options: ["2", "3", "4", "6"],
    correctAnswer: "3",
    fact: "12 divided by 4 equals 3."
  },

  // Science
  {
    question: "Which of these is a mammal?",
    options: ["Shark", "Frog", "Elephant", "Crocodile"],
    correctAnswer: "Elephant",
    fact: "Mammals are warm-blooded and have hair or fur."
  },
  {
    question: "What do plants need to make food?",
    options: ["Sunlight", "Moonlight", "Sand", "Ice"],
    correctAnswer: "Sunlight",
    fact: "Plants use sunlight, water, and carbon dioxide in photosynthesis."
  },
  {
    question: "Which planet is known as the Red Planet?",
    options: ["Mars", "Earth", "Jupiter", "Venus"],
    correctAnswer: "Mars",
    fact: "Mars is called the Red Planet due to its reddish surface."
  },
  {
    question: "Which gas do we breathe in to live?",
    options: ["Oxygen", "Carbon dioxide", "Nitrogen", "Helium"],
    correctAnswer: "Oxygen",
    fact: "Humans need oxygen for respiration."
  },

  // Nigeria-themed
  {
    question: "What is the capital of Nigeria?",
    options: ["Lagos", "Abuja", "Kano", "Ibadan"],
    correctAnswer: "Abuja",
    fact: "Abuja became Nigeria’s capital in 1991."
  },
  {
    question: "Which river is the longest in Nigeria?",
    options: ["River Niger", "River Benue", "River Kaduna", "River Sokoto"],
    correctAnswer: "River Niger",
    fact: "The Niger River is the longest river in Nigeria."
  },
  {
    question: "What is Nigeria’s largest city by population?",
    options: ["Lagos", "Abuja", "Kano", "Port Harcourt"],
    correctAnswer: "Lagos",
    fact: "Lagos is the most populous city in Nigeria."
  },
  {
    question: "Which Nigerian festival is famous for colorful masks?",
    options: ["Eyo Festival", "Argungu Festival", "Calabar Carnival", "Osun-Osogbo"],
    correctAnswer: "Eyo Festival",
    fact: "The Eyo Festival is held in Lagos and features masquerades."
  }
];


// Filter by difficulty (lightweight scaler)
function filterByDifficulty(bank, difficulty) {
  if (difficulty === 'easy') return bank.slice(0);             // use as is
  if (difficulty === 'hard') {
    // nudge difficulty by swapping a couple of obvious distractors with closer ones
    return bank.map(q => {
      const opts = q.options.slice();
      // try to keep same correct, but shuffle and leave as “harder” by order mix
      return { ...q, options: shuffle(opts) };
    });
  }
  // medium
  return bank.map(q => ({ ...q, options: shuffle(q.options.slice()) }));
}

// ================== TIMER ==================
function startTimer() {
  stopTimer();
  timeLeft = QUESTION_TIME;
  countdownEl.textContent = formatTime(timeLeft);
  timerId = setInterval(() => {
    timeLeft--;
    countdownEl.textContent = formatTime(timeLeft);
    if (timeLeft <= 0) {
      stopTimer();
      answers[currentQ] = "__timeout__";
      feedbackEl.textContent = "Time's up! ⏳";
      // reveal correct answer
      [...optionsEl.children].forEach(b => {
        if (b.textContent === questionSet[currentQ].correctAnswer) b.classList.add("correct");
        b.disabled = true;
      });
      setTimeout(nextTurn, 600);
    }
  }, 1000);
}
function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

// ================== RENDER / FLOW ==================
function updateTopBar() {
  const total = questionSet.length;
  qcountEl.textContent = `Player: ${players[currentPlayer].name} | Question ${currentQ + 1} / ${total}`;
  const pct = Math.round((currentQ) / total * 100);
  progressFill.style.width = `${pct}%`;
}

function renderQuestion() {
  stopTimer();

  const q = questionSet[currentQ];
  questionEl.classList.remove('fade-in');
  void questionEl.offsetWidth;
  questionEl.classList.add('fade-in');
  questionEl.textContent = q.question;

  feedbackEl.textContent = "";
  optionsEl.innerHTML = "";

  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'option';
    btn.type = 'button';
    btn.textContent = opt;
    btn.addEventListener('click', () => handleAnswer(btn, opt));
    optionsEl.appendChild(btn);
  });

  updateTopBar();
  startTimer();
}

function handleAnswer(btn, opt) {
  soundClick.play();

  const q = questionSet[currentQ];
  const correct = opt === q.correctAnswer;

  // mark all disabled, show right/wrong
  [...optionsEl.children].forEach(b => (b.disabled = true));
  if (correct) {
    btn.classList.add('correct');
    feedbackEl.textContent = `Nice! ✅ ${q.fact ? " " + q.fact : ""}`;
    soundCorrect.play();
    players[currentPlayer].score++;
  } else {
    btn.classList.add('wrong');
    feedbackEl.textContent = `Oops! ❌ Correct: ${q.correctAnswer}. ${q.fact ? q.fact : ""}`;
    soundWrong.play();
    [...optionsEl.children].forEach(b => {
      if (b.textContent === q.correctAnswer) b.classList.add('correct');
    });
  }

  setTimeout(nextTurn, 600);
}

function nextTurn() {
  // Alternate player each question if 2 players
  if (players.length === 2) {
    currentPlayer = currentPlayer ^ 1; // toggle 0 <-> 1
  }

  // Advance question
  if (currentQ < questionSet.length - 1) {
    currentQ++;
    renderQuestion();
  } else {
    // last question answered
    showResult();
  }
}

// ================== RESULTS ==================
function showResult() {
  stopTimer();
  quizContainer.style.display = 'none';
  resultCard.style.display = 'flex';

  const total = questionSet.length;
  const resultEl = document.querySelector('.player-results');
  resultEl.innerHTML = ''; // clear previous

  if (players.length === 1) {
    const score = players[0].score;
    const section = sectionSelect.value;
    const best = getHighScore(section);
    if (score > best) setHighScore(section, score);

    const card = document.createElement('div');
    card.className = 'player-card winner';
    card.innerHTML = `
      <div class="trophy">🏆</div>
      <h3>${players[0].name}</h3>
      <div class="score">${score} / ${total}</div>
    `;
    resultEl.appendChild(card);

    // Confetti for single-player
    const rect = card.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    setTimeout(() => {
      confetti({
        particleCount: 200,
        spread: 80,
        origin: { x, y }
      });
      soundCongrats.play();
    }, 300);

  } else {
    const [a, b] = players;
    const winnerIdx = (a.score === b.score) ? -1 : (a.score > b.score ? 0 : 1);
    const winnerText =
      winnerIdx === 0 ? `🏆 ${a.name} wins!` :
        winnerIdx === 1 ? `🏆 ${b.name} wins!` :
          "🤝 It's a tie!";

    [a, b].forEach((p, idx) => {
      const card = document.createElement('div');
      card.className = 'player-card';
      let html = '';

      const isWinner = (winnerIdx === idx) || (p.score === total);
      if (isWinner) {
        card.classList.add('winner');
        html += `<div class="trophy">🏆</div>`;
      }

      html += `
        <h3>${p.name}</h3>
        <div class="score">${p.score} / ${total}</div>
      `;
      card.innerHTML = html;
      resultEl.appendChild(card);

      // Confetti for winner on correct side
      if (isWinner && winnerIdx !== -1) {
        const rect = card.getBoundingClientRect();
        const x = (winnerIdx === 0)
          ? (rect.left + rect.width * 0.25) / window.innerWidth // Left side confetti
          : (rect.left + rect.width * 0.75) / window.innerWidth; // Right side confetti
        const y = (rect.top + rect.height / 2) / window.innerHeight;

        setTimeout(() => {
          confetti({
            particleCount: 200,
            spread: 80,
            origin: { x, y }
          });
          soundCongrats.play();
        }, 300);
      }
    });

    const winnerLine = document.createElement('p');
    winnerLine.textContent = winnerText;
    resultEl.appendChild(winnerLine);
  }

  // recap facts
  const learned = questionSet.slice(0, 4)
    .map(q => `• ${q.fact || `The correct answer was ${q.correctAnswer}.`}`)
    .join('<br>');
  resultExtra.innerHTML = `<div style="text-align:left; max-width:700px; margin-inline:auto">${learned}</div>`;
}





// ================== NAVIGATION ==================
prevBtn.addEventListener('click', () => {
  // Optional: allow stepping back for review (no scoring changes)
  soundClick.play();
  currentQ = clamp(currentQ - 1, 0, questionSet.length - 1);
  renderQuestion();
});
nextBtn.addEventListener('click', () => {
  soundClick.play();
  currentQ = clamp(currentQ + 1, 0, questionSet.length - 1);
  renderQuestion();
});
restartBtn.addEventListener('click', () => {
  soundClick.play();
  resetGame(true);
});
playAgainBtn.addEventListener('click', () => {
  soundClick.play();
  resetGame(false); // go back to intro page

  // Clear previous results
  const resultEl = document.querySelector('.player-results');
  if (resultEl) resultEl.innerHTML = '';

  if (resultExtra) resultExtra.innerHTML = '';
});


// ================== SHARE ==================
function shareText() {
  const total = questionSet.length;
  if (players.length === 1) {
    return `${players[0].name} scored ${players[0].score}/${total} in the Quiz! Can you beat it?`;
  } else {
    const [a, b] = players;
    const who = a.score === b.score ? "We tied!" :
      (a.score > b.score ? `${a.name} won!` : `${b.name} won!`);
    return `${a.name} ${a.score}/${total} vs ${b.name} ${b.score}/${total}. ${who} Try it!`;
  }
}
function openShareUrl(url) {
  window.open(url, '_blank', 'noopener,noreferrer');
}
shareTwitterBtn.addEventListener('click', () => {
  const text = encodeURIComponent(shareText());
  openShareUrl(`https://twitter.com/intent/tweet?text=${text}`);
});
shareWhatsAppBtn.addEventListener('click', () => {
  const text = encodeURIComponent(shareText());
  openShareUrl(`https://wa.me/?text=${text}`);
});
shareFacebookBtn.addEventListener('click', () => {
  const text = encodeURIComponent(shareText());
  openShareUrl(`https://www.facebook.com/sharer/sharer.php?u=&quote=${text}`);
});

// Try native share
[shareTwitterBtn, shareWhatsAppBtn, shareFacebookBtn].forEach(btn => {
  btn.addEventListener('click', async (e) => {
    if (navigator.share) {
      e.preventDefault();
      try { await navigator.share({ text: shareText() }); } catch { }
    }
  });
});

// ================== CONFETTI ==================
// ================== CONFETTI ==================
function launchConfetti() {
  const duration = 3000; // 3 seconds
  const end = Date.now() + duration;

  // If you have a dedicated canvas, use it
  if (confettiCanvas && typeof confetti?.create === 'function') {
    confettiCanvas.style.display = 'block';
    const myConfetti = confetti.create(confettiCanvas, {
      resize: true,
      useWorker: true
    });

    (function frame() {
      myConfetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 } });
      myConfetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 } });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      } else {
        confettiCanvas.style.display = 'none';
      }
    })();

  } else if (typeof confetti === 'function') {
    // Fallback to global confetti (auto canvas)
    (function frame() {
      confetti({ particleCount: 5, angle: 60, spread: 55, origin: { x: 0 } });
      confetti({ particleCount: 5, angle: 120, spread: 55, origin: { x: 1 } });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  } else {
    console.warn('Confetti library not loaded.');
  }
}




// ================== LOAD & START ==================
startQuizBtn.addEventListener('click', async () => {
  soundClick.play();

  const p1 = (p1Input.value || '').trim() || 'Player 1';
  const p2 = (p2Input.value || '').trim();
  const difficulty = difficultySelect.value; // easy/medium/hard
  const section = sectionSelect.value;       // adult/kids

  players = [{ name: p1, score: 0 }];
  if (p2) players.push({ name: p2, score: 0 });

  // Prepare questions
  // Prepare questions
  const bank = section === 'adult' ? ADULT_BANK : KIDS_BANK;
  const filtered = filterByDifficulty(bank, difficulty);

  const pickCount = players.length === 1 ? 10 : 16;

  // If bank has fewer questions than needed, repeat/shuffle until enough
  questionSet = [];
  while (questionSet.length < pickCount) {
    const remaining = pickCount - questionSet.length;
    const copy = shuffle(filtered.slice());
    questionSet.push(...copy.slice(0, remaining));
  }

  // Trim exactly to pickCount
  questionSet = questionSet.slice(0, pickCount);



  // Init state
  currentPlayer = 0;
  currentQ = 0;
  answers = new Array(questionSet.length).fill(null);

  // Swap UI
  introPage.style.display = 'none';
  resultCard.style.display = 'none';
  quizContainer.style.display = 'flex';

  renderQuestion();
});

// ================== RESET / PLAY AGAIN ==================
function resetGame(stayInQuiz) {
  stopTimer();
  players.forEach(p => (p.score = 0));
  currentPlayer = 0;
  currentQ = 0;
  answers = new Array(questionSet.length).fill(null);

  // Clear UI
  feedbackEl.textContent = '';
  optionsEl.innerHTML = '';
  progressFill.style.width = '0%';
  countdownEl.textContent = formatTime(QUESTION_TIME);

  resultCard.style.display = 'none'; // hide results
  if (stayInQuiz) {
    quizContainer.style.display = 'flex';
    renderQuestion();
  } else {
    quizContainer.style.display = 'none';
    introPage.style.display = 'flex';
  }
}

function endQuiz() {
  // 1️⃣ Set winner details
  document.getElementById("winner-name").textContent = currentWinnerName;
  document.getElementById("winner-score").textContent = currentWinnerScore;

  // 2️⃣ Show results, hide quiz
  document.getElementById("results").classList.remove("hidden");
  document.getElementById("quiz").classList.add("hidden");

  // 3️⃣ Delay slightly so the results card is visible first
  setTimeout(() => {
    confetti({
      particleCount: 300,       // more confetti
      spread: 120,              // wider burst
      startVelocity: 50,        // faster initial speed
      gravity: 0.7,             // slower fall
      scalar: 1.4,              // bigger size
      origin: { y: 0.6 }
    });
  }, 500); // half a second after results appear
}










