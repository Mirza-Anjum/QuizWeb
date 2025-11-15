const BANK = {
  logic: [
    {
      q: "If all bloops are razzies and all razzies are fizzies, are all bloops fizzies?",
      opts: ["Yes", "No", "Only sometimes", "Cannot tell"],
      a: 0,
    },
    {
      q: "Find the next in series: 2, 3, 5, 8, 12, ?",
      opts: ["17", "16", "15", "14"],
      a: 1,
    },
    {
      q: "Which is a contradiction of 'All swans are white'?",
      opts: [
        "Some swans are white",
        "No swans are white",
        "Some swans are not white",
        "All swans are black",
      ],
      a: 2,
    },
    {
      q: "If today is Monday, what day will be 100 days later?",
      opts: ["Tuesday", "Thursday", "Sunday", "Wednesday"],
      a: 3,
    },
    {
      q: "Which is not a valid logical operator?",
      opts: ["AND", "OR", "BUT", "NOT"],
      a: 2,
    },
  ],
  javascript: [
    {
      q: "Which method converts JSON string to object?",
      opts: [
        "JSON.toObject()",
        "JSON.parse()",
        "JSON.stringify()",
        "JSON.object()",
      ],
      a: 1,
    },
    {
      q: "What is the result of: typeof NaN ?",
      opts: ["'number'", "'NaN'", "'object'", "'undefined'"],
      a: 0,
    },
    {
      q: "Which statement is used to handle exceptions?",
      opts: ["catch", "try", "throw", "try...catch"],
      a: 3,
    },
    {
      q: "Which keyword creates a block-scoped variable?",
      opts: ["var", "let", "const", "both let and const"],
      a: 3,
    },
    {
      q: "Which will NOT create a new array?",
      opts: ["[]", "new Array()", "Array.of()", "{}"],
      a: 3,
    },
  ],
  python: [
    {
      q: "How do you create a function in Python?",
      opts: ["function myFn():", "def my_fn():", "fn my_fn():", "create my_fn()"],
      a: 1,
    },
    {
      q: "What is the output of len('hello')?",
      opts: ["4", "5", "6", "Error"],
      a: 1,
    },
    {
      q: "Which is immutable in Python?",
      opts: ["List", "Dictionary", "Tuple", "Set"],
      a: 2,
    },
    {
      q: "What symbol starts a comment?",
      opts: ["//", "#", "/*", "<!--"],
      a: 1,
    },
    {
      q: "Which keyword creates a generator?",
      opts: ["yield", "return", "generate", "yieldfrom"],
      a: 0,
    },
  ],
  aptitude: [
    {
      q: "A train travels 60km in 1.5 hours. Speed = ?",
      opts: ["40 km/h", "30 km/h", "45 km/h", "35 km/h"],
      a: 0,
    },
    { q: "If x+y=10 and x-y=2, x =", opts: ["6", "4", "5", "8"], a: 0 },
    {
      q: "If probability of event is 0.2, odds in favor are?",
      opts: ["1:4", "1:5", "2:5", "2:3"],
      a: 0,
    },
    {
      q: "Find next: 3, 6, 18, 72, ?",
      opts: ["360", "288", "216", "144"],
      a: 0,
    },
    {
      q: "If 5 workers take 8 days, 10 workers take ?",
      opts: ["2 days", "4 days", "5 days", "6 days"],
      a: 1,
    },
  ],
};

BANK.aptitude[3].a = 0;

/* DOM refs */
const categorySel = document.getElementById("category");
const qcountSel = document.getElementById("qcount");
const timePerInput = document.getElementById("timePer");
const startBtn = document.getElementById("startBtn");
const soundToggle = document.getElementById("soundToggle");
const themeToggle = document.getElementById("themeToggle");

const timerEl = document.getElementById("timer");
const qIndexEl = document.getElementById("qIndex");
const qTotalEl = document.getElementById("qTotal");
const progressEl = document.getElementById("progress");
const questionEl = document.getElementById("question");
const optionsEl = document.getElementById("options");
const nextBtn = document.getElementById("nextBtn");
const liveScoreEl = document.getElementById("liveScore");
const sideCategory = document.getElementById("sideCategory");
const timeSettingEl = document.getElementById("timeSetting");
const leaderboardEl = document.getElementById("leaderboard");
const saveScoreBtn = document.getElementById("saveScore");
const clearScoresBtn = document.getElementById("clearScores");
const resultBox = document.getElementById("resultBox");

/* AUDIO */
const sndCorrect = document.getElementById("sndCorrect");
const sndWrong = document.getElementById("sndWrong");

// NEW
const sndTick = document.getElementById("sndTick");
const sndFinish = document.getElementById("sndFinish");

let state = {
  questions: [],
  current: 0,
  score: 0,
  timeLeft: 18,
  timerInterval: null,
  timePerQ: 18,
  playingSound: true,
  theme:
    localStorage.getItem("cm_theme") ||
    (window.matchMedia &&
    window.matchMedia("(prefers-color-scheme:light)").matches
      ? "light"
      : ""),
};

if (state.theme)
  document.documentElement.setAttribute("data-theme", state.theme);
themeToggle.textContent = state.theme === "light" ? "Light" : "Dark";

state.playingSound = true;
soundToggle.textContent = "Sound: ON";

/* Helpers */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function formatTime(s) {
  return `⏱ ${s}s`;
}

function speakText(t) {
  if (!("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(t);
  u.rate = 1;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
}

/* Prepare Questions */
function prepareQuestions(category, count) {
  const bank = BANK[category] || [];
  let pool = shuffle(bank);
  while (pool.length < count) pool = pool.concat(shuffle(bank));
  pool = pool.slice(0, count);
  return pool.map((item) => {
    const opts = shuffle(item.opts);
    const correctValue = item.opts[item.a];
    return { q: item.q, opts, a: opts.indexOf(correctValue) };
  });
}

/* Start */
startBtn.addEventListener("click", () => {
  const cat = categorySel.value;
  const qcount = parseInt(qcountSel.value, 10) || 8;
  const t = Math.max(8, Math.min(60, parseInt(timePerInput.value, 10) || 18));
  state.timePerQ = t;
  state.timeLeft = t;
  state.questions = prepareQuestions(cat, qcount);
  state.current = 0;
  state.score = 0;
  sideCategory.textContent = cat.toUpperCase();
  timeSettingEl.textContent = `Time per question: ${t}s`;
  qTotalEl.textContent = state.questions.length;
  liveScoreEl.textContent = "0";
  resultBox.classList.add("hidden");
  renderQuestion();
});

/* Render */
function renderQuestion() {
  clearInterval(state.timerInterval);
  state.timeLeft = state.timePerQ;
  const cur = state.questions[state.current];
  qIndexEl.textContent = state.current + 1;
  questionEl.textContent = cur.q;

  optionsEl.innerHTML = "";
  cur.opts.forEach((opt, i) => {
    const div = document.createElement("div");
    div.className = "opt";
    div.dataset.index = i;
    div.innerHTML = `<div>${opt}</div>`;
    div.addEventListener("click", onSelect);
    optionsEl.appendChild(div);
  });

  nextBtn.classList.add("hidden");
  updateTimerDisplay();
  startTimer();
}

function disableOptions() {
  document.querySelectorAll(".opt").forEach((x) => {
    x.classList.add("disabled");
    x.style.pointerEvents = "none";
  });
}

/* Select */
function onSelect() {
  clearInterval(state.timerInterval);
  const idx = Number(this.dataset.index);
  const cur = state.questions[state.current];
  disableOptions();

  const all = document.querySelectorAll(".opt");
  if (idx === cur.a) {
    all[idx].classList.add("correct");
    state.score++;
    liveScoreEl.textContent = state.score;
    if (state.playingSound) sndCorrect.play();
  } else {
    all[idx].classList.add("wrong");
    all[cur.a].classList.add("correct");
    if (state.playingSound) sndWrong.play();
  }

  nextBtn.classList.remove("hidden");
}

/* Timer */
function startTimer() {
  updateTimerDisplay();
  state.timerInterval = setInterval(() => {
    state.timeLeft--;
    updateTimerDisplay();

    if (state.timeLeft <= 4 && state.timeLeft > 0) {
      if (state.playingSound) {
        sndTick.currentTime = 0;
        sndTick.play();
      }
    }

    if (state.timeLeft <= 0) {
      clearInterval(state.timerInterval);
      onTimeout();
    }
  }, 1000);
}

function updateTimerDisplay() {
  timerEl.textContent = formatTime(state.timeLeft);
}

function onTimeout() {
  const cur = state.questions[state.current];
  const all = document.querySelectorAll(".opt");
  all.forEach((el, i) => {
    el.classList.add("disabled");
    if (i === cur.a) el.classList.add("correct");
  });
  if (state.playingSound) sndWrong.play();
  nextBtn.classList.remove("hidden");
}

/* Next */
nextBtn.addEventListener("click", () => {
  clearInterval(state.timerInterval);
  state.current++;
  if (state.current < state.questions.length) {
    renderQuestion();
  } else {
    finishQuiz();
  }
});

/* Finish */
function finishQuiz() {
  clearInterval(state.timerInterval);
  if (state.playingSound) sndFinish.play();

  resultBox.innerHTML = `
    <div class="result">
      <div class="small">Quiz completed</div>
      <div class="big-score">${state.score} / ${state.questions.length}</div>
      <div class="muted">Accuracy: ${Math.round(
        (state.score / state.questions.length) * 100
      )}%</div>
      <div class="confetti"></div>
      <div style="margin-top:12px">
        <button id="replay" class="btn">Play Again</button>
        <button id="saveLocal" class="btn ghost">Save to local</button>
      </div>
    </div>
  `;
  resultBox.classList.remove("hidden");

  document.getElementById("replay").addEventListener("click", () => {
    state.current = 0;
    state.score = 0;
    liveScoreEl.textContent = "0";
    renderQuestion();
  });

  document.getElementById("saveLocal").addEventListener("click", () => {
    saveScoreLocal(
      state.score,
      state.questions.length,
      categorySel.value
    );
    renderLeaderboard();
    alert("Score saved locally!");
  });

  speakText(
    `Quiz finished. You scored ${state.score} out of ${state.questions.length}`
  );
}

/* Leaderboard */
function saveScoreLocal(score, total, category) {
  const key = "cm_leaderboard_v1";
  const arr = JSON.parse(localStorage.getItem(key) || "[]");
  arr.unshift({ when: new Date().toISOString(), score, total, category });
  localStorage.setItem(key, JSON.stringify(arr.slice(0, 30)));
}

function renderLeaderboard() {
  const arr = JSON.parse(localStorage.getItem("cm_leaderboard_v1") || "[]");
  leaderboardEl.innerHTML = "";
  if (arr.length === 0) {
    leaderboardEl.innerHTML =
      '<div class="muted small">No saved scores yet.</div>';
    return;
  }

  arr.slice(0, 10).forEach((item) => {
    const d = new Date(item.when);
    const div = document.createElement("div");
    div.className = "lead-item";
    div.innerHTML = `<div><strong>${item.score}/${item.total}</strong>
      <div class="small muted">${item.category}</div>
    </div>
    <div class="small">${d.toLocaleString()}</div>`;
    leaderboardEl.appendChild(div);
  });
}

clearScoresBtn.addEventListener("click", () => {
  if (confirm("Clear all saved scores?")) {
    localStorage.removeItem("cm_leaderboard_v1");
    renderLeaderboard();
  }
});

saveScoreBtn.addEventListener("click", () => {
  saveScoreLocal(state.score, state.questions.length, categorySel.value);
  renderLeaderboard();
  alert("Saved current score locally.");
});

/* Toggles */
soundToggle.addEventListener("click", () => {
  state.playingSound = !state.playingSound;
  soundToggle.textContent = state.playingSound ? "Sound: ON" : "Sound: OFF";
});

themeToggle.addEventListener("click", () => {
  if (document.documentElement.getAttribute("data-theme") === "light") {
    document.documentElement.removeAttribute("data-theme");
    localStorage.removeItem("cm_theme");
    themeToggle.textContent = "Dark";
  } else {
    document.documentElement.setAttribute("data-theme", "light");
    localStorage.setItem("cm_theme", "light");
    themeToggle.textContent = "Light";
  }
});

renderLeaderboard();
document.getElementById("qTotal").textContent = "0";
