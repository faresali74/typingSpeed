// Global State
let currentIndex = 0;
let currentText = "";
let startTime = null;
let elapsedTime = 0;
let timerInterval = null;
let timeLeft = 60;
let correctChars = 0;
let totalChars = 0;
let accuracy = 100;
let inputArray = [];
let bestWpm = 0;
let isTimedMode = false;
let currentDifficulty = "medium";
let textData = null;
const inputLayer = document.querySelector(".input-layer");
const resultSection = document.querySelector(".result");
const typingArea = document.querySelector(".typing-area");
const statistics = document.querySelector(".statistics");

// setting local storage
localStorage.setItem("best wpm", bestWpm);
let x = localStorage.getItem("best wpm");
console.log(x);
console.log();

// Helpers
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Load New Text
function loadNewText(difficulty) {
  if (!textData) {
    fetch("./data.json")
      .then((res) => res.json())
      .then((data) => {
        textData = data;
        currentText = getRandomElement(data[difficulty]).text;
        renderText(currentText);
      });
  } else {
    currentText = getRandomElement(textData[difficulty]).text;
    renderText(currentText);
  }
}

// Render Text
function renderText(text) {
  const textLayer = document.querySelector(".text-layer");
  const inputLayer = document.querySelector(".input-layer");
  textLayer.innerHTML = "";
  currentText = text;
  // currentIndex = 0;
  inputLayer.value = "";
  inputLayer.selectionStart = 0;
  inputLayer.selectionEnd = 0;
  text.split("").forEach((char) => {
    const span = document.createElement("span");
    span.classList.add("char");
    span.innerText = char;
    textLayer.appendChild(span);
  });
  setActiveChar(currentIndex);
}

// Cursor Logic
function setActiveChar(index) {
  const chars = document.querySelectorAll(".char");
  chars.forEach((c) => c.classList.remove("active"));
  if (chars[index]) {
    chars[index].classList.add("active");
  }
}

// Start Test
function startTypingTest() {
  const typingContent = document.querySelector(".typing-content");
  const startOverlay = document.querySelector(".start-overlay");
  typingContent.classList.remove("blurred");
  startOverlay.style.display = "none";
  inputLayer.focus();
  inputLayer.value = "";
}

// App Init
function initializeApp() {
  const startButton = document.querySelector(".start-btn");
  const input = document.querySelector(".input-layer");

  input.readOnly = true;

  // Start button
  startButton.addEventListener("click", startTypingTest);

  // Handle all typing in keydown for full control
  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace") {
      if (currentIndex > 0) {
        currentIndex--;
        setActiveChar(currentIndex);
        input.value = input.value.substring(0, currentIndex);
        input.selectionStart = currentIndex;
        input.selectionEnd = currentIndex;

        // Reset classes for spans from currentIndex onwards
        const chars = document.querySelectorAll(".char");
        for (let i = currentIndex; i < chars.length; i++) {
          chars[i].classList.remove("correct", "incorrect");
        }
        updateStats();
      }
      e.preventDefault();
    } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      if (!startTime) {
        startTime = Date.now();
        startTimer();
      }
      elapsedTime = Math.floor((Date.now() - startTime) / 1000);

      if (currentIndex < currentText.length) {
        currentIndex++;
        input.value += e.key;
        setActiveChar(currentIndex);
        checkPassageCompletion();
        updateStats();
      }
      e.preventDefault();
    }
  });

  input.addEventListener("click", () => {
    if (input.value === "") {
      input.selectionStart = 0;
      input.selectionEnd = 0;
    }
  });

  // Load initial text
  loadNewText("medium");

  // Difficulty buttons
  const easyBtn = document.querySelector(".easy-btn");
  const mediumBtn = document.querySelector(".medium-btn");
  const hardBtn = document.querySelector(".hard-btn");

  easyBtn.addEventListener("click", () => {
    currentDifficulty = "easy";
    resetGameState();
    loadNewText("easy");
  });

  mediumBtn.addEventListener("click", () => {
    currentDifficulty = "medium";
    resetGameState();
    loadNewText("medium");
  });

  hardBtn.addEventListener("click", () => {
    currentDifficulty = "hard";
    resetGameState();
    loadNewText("hard");
  });
}

// set time limit
document.querySelector(".set-time").addEventListener("click", () => {
  isTimedMode = true;
  if (timerInterval) clearInterval(timerInterval);
  timeLeft = 60;
  document.querySelector(".secounds").textContent = timeLeft;
  startTimer();
});

function startTimer() {
  if (!isTimedMode) return;
  timerInterval = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      document.querySelector(".secounds").textContent = timeLeft;
    } else {
      clearInterval(timerInterval);
      showResults();
    }
  }, 1000);
}

function showResults() {
  const statWpm = document.querySelector(".wpm-box p");
  const statAccuracy = document.querySelector(".accuracy-box p");
  const statChars = document.querySelector(".chars-box p");

  const currentWpm = parseInt(document.querySelector(".wpm-value").textContent);
  statWpm.textContent = currentWpm;
  statAccuracy.textContent = accuracy + "%";
  statChars.textContent = correctChars + "/" + totalChars;

  const storedPb = localStorage.getItem("personalBestWPM");
  const pb = storedPb ? parseInt(storedPb) : 0;
  if (currentWpm > pb) {
    localStorage.setItem("personalBestWPM", currentWpm);
    document.querySelector(".navbar .fs-11 span").textContent =
      currentWpm + " WPM";
  }

  resultSection.classList.remove("d-none");
  typingArea.classList.add("d-none");
  statistics.classList.add("d-none");

  inputLayer.disabled = true;
}

// Check if passage is completed
function checkPassageCompletion() {
  if (currentIndex >= currentText.length) {
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    resultSection.classList.remove("d-none");
    typingArea.classList.add("d-none");
    statistics.classList.add("d-none");
    showResults();
  }
}
function updateStats() {
  const inputValue = inputLayer.value;
  const textArray = [...currentText];
  const inputArray = [...inputValue];

  correctChars = 0;
  totalChars = inputValue.length;

  textArray.forEach((char, index) => {
    const charSpan = document.querySelectorAll(".char")[index];
    if (inputArray[index] == null) {
      charSpan.classList.remove("correct", "incorrect");
    } else if (inputArray[index] === char) {
      charSpan.classList.add("correct");
      charSpan.classList.remove("incorrect");
      correctChars++;
    } else {
      charSpan.classList.add("incorrect");
      charSpan.classList.remove("correct");
    }
  });

  accuracy =
    totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
  document.querySelector(".acurrecy-value").textContent = accuracy + "%";

  const wpm = Math.round((correctChars / 5) * (60 / Math.max(elapsedTime, 1)));
  document.querySelector(".wpm-value").textContent = wpm;
}

function resetGameState() {
  currentIndex = 0;
  inputLayer.value = "";
  if (timerInterval) clearInterval(timerInterval);
  startTime = null;
  elapsedTime = 0;
  timeLeft = 60;
  correctChars = 0;
  totalChars = 0;
  accuracy = 100;
  isTimedMode = false;

  document.querySelector(".secounds").textContent = timeLeft;
  document.querySelector(".wpm-value").textContent = "0";
  document.querySelector(".acurrecy-value").textContent = "100%";
  document.querySelector(".result").classList.add("d-none");
  inputLayer.disabled = false;
}

function restartTest() {
  resetGameState();
  loadNewText(currentDifficulty);
  inputLayer.focus();
}
// go again button
document.querySelector(".goagain-btn").addEventListener("click", () => {
  resetGameState();
  resultSection.classList.add("d-none");
  typingArea.classList.remove("d-none");
  statistics.classList.remove("d-none");
  loadNewText(currentDifficulty);
  inputLayer.focus();
});

// restart Btn
document.querySelector(".restart-btn-custom").addEventListener("click", () => {
  restartTest();
});

// DOM Ready
document.addEventListener("DOMContentLoaded", () => {
  // Load personal best from localStorage
  const storedPb = localStorage.getItem("personalBestWPM");
  if (storedPb) {
    document.querySelector(".navbar .fs-11 span").textContent =
      storedPb + " WPM";
  }
  initializeApp();
});
