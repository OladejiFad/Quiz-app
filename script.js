const quizData = [
  {
    question: "1. The first gen iPhone came with what DRAM?",
    options: ["125 MB", "128 MB", "50 MB", "250 MB"],
    correctAnswer: "128 MB",
  },
  {
    question: "2. The 2nd gen of the MacBook Pro was known as what?",
    options: ["Smart-Phone", "Ipad", "Multibody", "Unibody"],
    correctAnswer: "Unibody",
  },
  {
    question: "3. Which gen iPod Classic was the first to have video playback?",
    options: ["5th", "2nd", "3rd", "4th"],
    correctAnswer: "5th",
  },
  {
    question:
      "4. What was the last product launch Steve Jobs attended before his death?",
    options: ["iCloud", "GB", "Memory", "iPad"],
    correctAnswer: "iCloud",
  },
  {
    question: "5. Apple had how many founders?",
    options: ["4", "2", "3", "6"],
    correctAnswer: "3",
  },
  {
    question: "6. All iPad Minis have what kind of backlighting?",
    options: ["Focus", "Light", "LED", "Flash"],
    correctAnswer: "LED",
  },
];

let currentQuestionIndex = 0;
let score = 0;

const questionContainer = document.getElementById("question-container");
const optionsContainer = document.getElementById("options-container");
const previousButton = document.getElementById("next-btn1");
const nextButton = document.getElementById("next-btn2");
const resultContainer = document.getElementById("result-container");

function loadQuestion() {
  const currentQuestion = quizData[currentQuestionIndex];
  questionContainer.innerText = currentQuestion.question;

  optionsContainer.innerHTML = "";
  currentQuestion.options.forEach((option, index) => {
    const optionElement = document.createElement("button");
    optionElement.innerText = option;
    optionElement.addEventListener("click", () => selectOption(option));
    optionsContainer.appendChild(optionElement);
  });

  nextButton.disabled = true;
}

function selectOption(selectedOption) {
  const currentQuestion = quizData[currentQuestionIndex];
  const correctOption = currentQuestion.correctAnswer;

  const isCorrect = selectedOption === correctOption;

  optionsContainer.childNodes.forEach((optionElement) => {
    optionElement.disabled = false;
  });

  if (isCorrect) {
    score++;
  }

  nextButton.disabled = false;
}

function nextQuestion() {
  currentQuestionIndex++;

  if (currentQuestionIndex < quizData.length) {
    loadQuestion();
  } else {
    showResult();
  }
}

function previousQuestion() {
  currentQuestionIndex--;

  if (currentQuestionIndex < quizData.length) {
    loadQuestion();
  } else {
    showResult();
  }
}

function resetButton() {
  currentQuestionIndex = 0;

  if (currentQuestionIndex !== quizData.length) {
    loadQuestion();
  }
}



function showResult() {
  questionContainer.innerText = "Quiz completed!";
  optionsContainer.innerHTML = "";
  resultContainer.innerText =
    score === quizData.length

      ? `You are a ⭐! you scored ${score} out of ${score} `
      : `you scored ${score} out of 6`;
  nextButton.disabled = true;
}


loadQuestion();

let countdownTime = 30; // Initial countdown duration in seconds
let interval; // To hold the interval ID
const countdownElement = document.getElementById('countdown');
const nextButton2 = document.getElementById('next-btn2');
const messageElement = document.getElementById('countdown');

// Function to update the countdown display
function updateDisplay() {
  const minutes = Math.floor(countdownTime / 60);
  const seconds = countdownTime % 60;
  countdownElement.textContent =
    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Function to start the countdown
function startCountdown() {
  clearInterval(interval); // Clear any existing interval
  countdownTime = 30; // Reset to the initial countdown time
  updateDisplay(); // Update display immediately
  messageElement.textContent = ''; // Clear previous messages

  interval = setInterval(() => {
    countdownTime--;

    // Update the display
    updateDisplay();

    // Stop the countdown when it reaches 0
    if (countdownTime < 0) {
      clearInterval(interval);
      countdownElement.textContent = "00:00";
      messageElement.textContent = "Time's up!";
      nextButton.disabled = false; // Enable the button for the next round
    }
  }, 1000); // Update every second
}

// Function to handle button click
nextButton.addEventListener('click', () => {
  nextButton.disabled = true; // Disable the button to prevent multiple clicks
  startCountdown(); // Start the countdown
});

// Initialize the display
updateDisplay();