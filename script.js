// ── PASSAGES ──────────────────────────────────────────────────────────────────
const PASSAGES = [
  "The quick brown fox jumps over the lazy dog near the riverbank on a crisp autumn morning.",
  "Programming is the art of telling another human what one wants the computer to do.",
  "In the beginning was the command line, and the command line was good, and efficient, and fast.",
  "Simplicity is the soul of efficiency. A clean codebase is worth more than any clever trick.",
  "The best code is no code at all. Every line you write is a liability you must maintain forever.",
  "JavaScript is the duct tape of the internet. It holds the web together, messily but reliably.",
  "A user interface is like a joke — if you have to explain it, it's not that good.",
  "Any sufficiently advanced technology is indistinguishable from magic, but magic takes practice.",
  "Software is eating the world, one abstraction layer at a time, growing faster than anyone planned.",
  "The internet is the world's largest library. It just happens to have all the books on the floor.",
  "Good software is invisible. You only notice it when something breaks and the silence disappears.",
  "The cloud is just someone else's computer, and that someone else is very good at keeping it running.",
  "Data is the new oil — valuable when refined, but messy and difficult to move in raw form.",
  "Every great developer you know got there by solving problems they were unqualified to solve.",
  "First, solve the problem. Then, write the code. Then, refactor. Then, document. Then, ship it.",
  "A fast program that gives wrong answers is worse than a slow program that gives the right ones.",
  "Open source software is a gift that keeps on giving, as long as someone maintains the wrapper.",
  "Version control is the time machine every developer wishes they had before they deleted production.",
  "There are only two hard things in computer science: cache invalidation and naming things clearly.",
  "If debugging is the process of removing bugs, then programming must be the process of putting them in.",
];

// ── STATE ──────────────────────────────────────────────────────────────────────
const state = {
  mode: 60,
  timeLeft: 60,
  timerInterval: null,
  started: false,
  finished: false,
  passage: '',
  charIndex: 0,
  errors: 0,
  correctChars: 0,
  totalTyped: 0,
  startTime: null,
  bestScore: 0,
};

// ── DOM REFS ───────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);

const homeScreen    = $('homeScreen');
const testScreen    = $('testScreen');
const resultsScreen = $('resultsScreen');
const startBtn      = $('startBtn');
const restartBtn    = $('restartBtn');
const retryBtn      = $('retryBtn');
const homeBtn       = $('homeBtn');
const typingInput   = $('typingInput');
const passageEl     = $('passage');
const timerDisplay  = $('timerDisplay');
const timerRing     = $('timerRing');
const liveWpm       = $('liveWpm');
const liveAcc       = $('liveAcc');
const bestScoreEl   = $('bestScore');

// ── INIT ───────────────────────────────────────────────────────────────────────
function init() {
  loadBestScore();
  bindModeButtons();
  startBtn.addEventListener('click', startTest);
  restartBtn.addEventListener('click', restartTest);
  retryBtn.addEventListener('click', retryTest);
  homeBtn.addEventListener('click', goHome);
  typingInput.addEventListener('input', handleInput);
  typingInput.addEventListener('keydown', handleKeydown);
}

// ── BEST SCORE ─────────────────────────────────────────────────────────────────
function loadBestScore() {
  try {
    state.bestScore = parseInt(localStorage.getItem('typeracer_best') || '0', 10);
    updateBestDisplay();
  } catch (_) {}
}

function saveBestScore(wpm) {
  try {
    if (wpm > state.bestScore) {
      state.bestScore = wpm;
      localStorage.setItem('typeracer_best', String(wpm));
      updateBestDisplay();
      return true;
    }
  } catch (_) {}
  return false;
}

function updateBestDisplay() {
  bestScoreEl.textContent = state.bestScore > 0 ? state.bestScore : '—';
}

// ── MODE SELECT ────────────────────────────────────────────────────────────────
function bindModeButtons() {
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.mode = parseInt(btn.dataset.mode, 10);
    });
  });
}

// ── SCREEN TRANSITIONS ─────────────────────────────────────────────────────────
function showScreen(screen) {
  [homeScreen, testScreen, resultsScreen].forEach(s => {
    s.classList.remove('active');
    s.style.display = 'none';
  });
  screen.style.display = 'flex';
  requestAnimationFrame(() => screen.classList.add('active'));
}

// ── PASSAGE RENDERING ──────────────────────────────────────────────────────────
function pickPassage() {
  const idx = Math.floor(Math.random() * PASSAGES.length);
  return PASSAGES[idx];
}

function renderPassage(text) {
  passageEl.innerHTML = text
    .split('')
    .map((ch, i) => `<span class="char" data-index="${i}">${ch === ' ' ? '&nbsp;' : ch}</span>`)
    .join('');
}

function getCharEl(index) {
  return passageEl.querySelector(`[data-index="${index}"]`);
}

function updateCursor() {
  // remove previous cursor
  const prev = passageEl.querySelector('.current');
  if (prev) prev.classList.remove('current');

  const cur = getCharEl(state.charIndex);
  if (cur) cur.classList.add('current');
}

// ── TIMER RING ─────────────────────────────────────────────────────────────────
const RING_CIRCUMFERENCE = 2 * Math.PI * 34; // 213.6

function updateRing(timeLeft, total) {
  const fraction = timeLeft / total;
  const offset = RING_CIRCUMFERENCE * (1 - fraction);
  timerRing.style.strokeDashoffset = offset;

  const isDanger = timeLeft <= 10;
  timerRing.classList.toggle('danger', isDanger);
  timerDisplay.classList.toggle('danger', isDanger);
}

// ── WPM / ACCURACY ────────────────────────────────────────────────────────────
function calcWpm(correctChars, elapsedSeconds) {
  if (elapsedSeconds < 1) return 0;
  return Math.round((correctChars / 5) / (elapsedSeconds / 60));
}

function calcAccuracy(correct, total) {
  if (total === 0) return 100;
  return Math.round((correct / total) * 100);
}

function updateLiveStats() {
  if (!state.startTime) return;
  const elapsed = (Date.now() - state.startTime) / 1000;
  const wpm = calcWpm(state.correctChars, elapsed);
  const acc = calcAccuracy(state.correctChars, state.totalTyped);
  liveWpm.textContent = wpm;
  liveAcc.textContent = acc + '%';
}

// ── RANK ───────────────────────────────────────────────────────────────────────
function getRank(wpm) {
  if (wpm >= 100) return { emoji: '🚀', label: 'Legendary Typist' };
  if (wpm >= 75)  return { emoji: '⚡', label: 'Speed Demon' };
  if (wpm >= 55)  return { emoji: '🔥', label: 'Above Average' };
  if (wpm >= 35)  return { emoji: '👍', label: 'Average Speed' };
  if (wpm >= 20)  return { emoji: '🐢', label: 'Keep Practicing' };
  return              { emoji: '🌱', label: 'Just Starting Out' };
}

// ── START / STOP ───────────────────────────────────────────────────────────────
function startTest() {
  // reset state
  state.timeLeft    = state.mode;
  state.started     = false;
  state.finished    = false;
  state.charIndex   = 0;
  state.errors      = 0;
  state.correctChars = 0;
  state.totalTyped  = 0;
  state.startTime   = null;

  state.passage = pickPassage();
  renderPassage(state.passage);
  updateCursor();

  timerDisplay.textContent = state.mode;
  timerRing.style.strokeDashoffset = 0;
  timerRing.classList.remove('danger');
  timerDisplay.classList.remove('danger');
  liveWpm.textContent = '0';
  liveAcc.textContent = '100%';
  typingInput.value = '';

  showScreen(testScreen);
  setTimeout(() => typingInput.focus(), 100);
}

function restartTest() {
  clearInterval(state.timerInterval);
  startTest();
}

function retryTest() {
  clearInterval(state.timerInterval);
  startTest();
}

function goHome() {
  clearInterval(state.timerInterval);
  showScreen(homeScreen);
}

// ── TIMER ──────────────────────────────────────────────────────────────────────
function startTimer() {
  state.timerInterval = setInterval(() => {
    state.timeLeft--;
    timerDisplay.textContent = state.timeLeft;
    updateRing(state.timeLeft, state.mode);
    updateLiveStats();

    if (state.timeLeft <= 0) {
      endTest();
    }
  }, 1000);
}

// ── INPUT HANDLING ─────────────────────────────────────────────────────────────
function handleKeydown(e) {
  // prevent backspace from going before 0
  if (e.key === 'Backspace' && state.charIndex === 0) {
    e.preventDefault();
  }
}

function handleInput(e) {
  if (state.finished) return;

  const val = typingInput.value;

  // start timer on first keystroke
  if (!state.started && val.length > 0) {
    state.started = true;
    state.startTime = Date.now();
    startTimer();
  }

  // handle backspace (input length shorter than charIndex means deletion)
  if (val.length < state.charIndex) {
    // move back
    const toRemove = getCharEl(state.charIndex - 1);
    if (toRemove) {
      const wasWrong = toRemove.classList.contains('wrong');
      toRemove.classList.remove('correct', 'wrong', 'current');
      if (wasWrong) state.errors = Math.max(0, state.errors - 1);
    }
    state.charIndex = val.length;
    updateCursor();
    return;
  }

  // new character typed
  const typedChar = val[val.length - 1];
  const expected  = state.passage[state.charIndex];

  const charEl = getCharEl(state.charIndex);
  if (!charEl) return;

  state.totalTyped++;

  if (typedChar === expected) {
    charEl.classList.add('correct');
    state.correctChars++;
  } else {
    charEl.classList.add('wrong');
    state.errors++;
  }

  state.charIndex++;

  // check passage complete
  if (state.charIndex >= state.passage.length) {
    endTest();
    return;
  }

  updateCursor();
  updateLiveStats();

  // clear input continuously to avoid browser quirks
  // keep the value as a running tally via charIndex
}

// ── END TEST ───────────────────────────────────────────────────────────────────
function endTest() {
  if (state.finished) return;
  state.finished = true;
  clearInterval(state.timerInterval);
  typingInput.blur();

  const elapsed = state.startTime ? (Date.now() - state.startTime) / 1000 : state.mode;
  const wpm = calcWpm(state.correctChars, Math.min(elapsed, state.mode));
  const acc = calcAccuracy(state.correctChars, state.totalTyped);

  const isNewPb = saveBestScore(wpm);
  showResults(wpm, acc, isNewPb);
}

// ── RESULTS ────────────────────────────────────────────────────────────────────
function showResults(wpm, acc, isNewPb) {
  $('finalWpm').textContent = wpm;
  $('finalAcc').textContent = acc + '%';
  $('finalCorrect').textContent = state.correctChars;
  $('finalErrors').textContent = state.errors;
  $('finalChars').textContent = state.totalTyped;

  const rank = getRank(wpm);
  $('resultsRank').textContent = `${rank.emoji} ${rank.label}`;

  const pbBanner = $('newPbBanner');
  pbBanner.style.display = isNewPb ? 'block' : 'none';

  showScreen(resultsScreen);
}

// ── BOOT ───────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
