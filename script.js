/**
 * AI Boards Quiz - Client Application Logic
 * Modular controller managing UI views, syllabus form, Gemini quiz execution,
 * countdown timer, question palette, score calculations, and localStorage history.
 */

(() => {
  'use strict';

  // ----------------------------------------------------
  // CONSTANTS & CONFIGURATION
  // ----------------------------------------------------
  const STORAGE_KEY_THEME = 'ai_boards_theme';
  const STORAGE_KEY_HISTORY = 'ai_boards_quiz_history_v1';

  const EDUCATIONAL_QUOTES = [
    '“Practice makes progression. Focus on understanding foundational concepts.”',
    '“Board exam MCQs test both accuracy and conceptual speed.”',
    '“Reviewing incorrect answers is where 90% of true learning happens.”',
    '“Consistent chapter-wise problem solving beats last-minute cramming every time.”',
    '“NCERT concepts and CISCE principles form the bedrock of top scores.”'
  ];

  // ----------------------------------------------------
  // GLOBAL STATE
  // ----------------------------------------------------
  const state = {
    syllabusData: null,
    apiConfigured: false,
    activeView: 'createView',
    currentQuiz: null, // { metadata, questions }
    userAnswers: {}, // { [questionIndex]: optionIndex }
    currentQuestionIndex: 0,
    timerSecondsLeft: 0,
    timerTotalSeconds: 0,
    timerInterval: null,
    isSubmitting: false,
    reviewFilter: 'all',
    lastReviewData: null
  };

  // ----------------------------------------------------
  // DOM ELEMENT REFERENCES
  // ----------------------------------------------------
  const dom = {
    appHeader: document.getElementById('appHeader'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    apiStatusBtn: document.getElementById('apiStatusBtn'),
    apiStatusLabel: document.getElementById('apiStatusLabel'),
    systemBanner: document.getElementById('systemBanner'),
    bannerText: document.getElementById('bannerText'),
    bannerActionBtn: document.getElementById('bannerActionBtn'),
    bannerCloseBtn: document.getElementById('bannerCloseBtn'),
    historyCountBadge: document.getElementById('historyCountBadge'),

    // Nav
    navCreateBtn: document.getElementById('navCreateBtn'),
    navHistoryBtn: document.getElementById('navHistoryBtn'),
    navGuideBtn: document.getElementById('navGuideBtn'),
    brandLogo: document.getElementById('brandLogo'),

    // Views
    createView: document.getElementById('createView'),
    loadingView: document.getElementById('loadingView'),
    quizView: document.getElementById('quizView'),
    resultsView: document.getElementById('resultsView'),
    historyView: document.getElementById('historyView'),
    guideView: document.getElementById('guideView'),

    // Form
    quizForm: document.getElementById('quizForm'),
    classSelectorGrid: document.getElementById('classSelectorGrid'),
    classLevelSelect: document.getElementById('classLevelSelect'),
    boardSelect: document.getElementById('boardSelect'),
    stateBoardGroup: document.getElementById('stateBoardGroup'),
    stateSelect: document.getElementById('stateSelect'),
    subjectSelect: document.getElementById('subjectSelect'),
    customSubjectInput: document.getElementById('customSubjectInput'),
    toggleCustomSubjectBtn: document.getElementById('toggleCustomSubjectBtn'),
    chapterSelect: document.getElementById('chapterSelect'),
    customChapterInput: document.getElementById('customChapterInput'),
    toggleCustomChapterBtn: document.getElementById('toggleCustomChapterBtn'),
    generateQuizBtn: document.getElementById('generateQuizBtn'),
    formErrorBox: document.getElementById('formErrorBox'),
    formErrorMsg: document.getElementById('formErrorMsg'),

    // Loading View
    loadingTitle: document.getElementById('loadingTitle'),
    loadingStatusText: document.getElementById('loadingStatusText'),
    quoteText: document.getElementById('quoteText'),

    // Quiz View
    quizMetaClass: document.getElementById('quizMetaClass'),
    quizMetaBoard: document.getElementById('quizMetaBoard'),
    quizMetaDifficulty: document.getElementById('quizMetaDifficulty'),
    quizMetaSubjectTopic: document.getElementById('quizMetaSubjectTopic'),
    timerDisplay: document.getElementById('timerDisplay'),
    timerValue: document.getElementById('timerValue'),
    quitQuizBtn: document.getElementById('quitQuizBtn'),
    progressCountLabel: document.getElementById('progressCountLabel'),
    answeredCountLabel: document.getElementById('answeredCountLabel'),
    quizProgressBar: document.getElementById('quizProgressBar'),
    questionNumberPill: document.getElementById('questionNumberPill'),
    questionTopicPill: document.getElementById('questionTopicPill'),
    questionText: document.getElementById('questionText'),
    optionsGrid: document.getElementById('optionsGrid'),
    prevQuestionBtn: document.getElementById('prevQuestionBtn'),
    nextQuestionBtn: document.getElementById('nextQuestionBtn'),
    submitQuizBtn: document.getElementById('submitQuizBtn'),
    togglePaletteBtn: document.getElementById('togglePaletteBtn'),
    paletteDrawer: document.getElementById('paletteDrawer'),
    paletteChipsGrid: document.getElementById('paletteChipsGrid'),

    // Results View
    scoreCircle: document.getElementById('scoreCircle'),
    scorePercentValue: document.getElementById('scorePercentValue'),
    scoreFractionValue: document.getElementById('scoreFractionValue'),
    verdictTag: document.getElementById('verdictTag'),
    verdictHeading: document.getElementById('verdictHeading'),
    verdictMessage: document.getElementById('verdictMessage'),
    resultMetaChips: document.getElementById('resultMetaChips'),
    metricTotal: document.getElementById('metricTotal'),
    metricCorrect: document.getElementById('metricCorrect'),
    metricIncorrect: document.getElementById('metricIncorrect'),
    metricUnanswered: document.getElementById('metricUnanswered'),
    metricTime: document.getElementById('metricTime'),
    retakeQuizBtn: document.getElementById('retakeQuizBtn'),
    newQuizBtn: document.getElementById('newQuizBtn'),
    saveHistoryBtn: document.getElementById('saveHistoryBtn'),
    reviewFilters: document.getElementById('reviewFilters'),
    filterAllCount: document.getElementById('filterAllCount'),
    filterCorrectCount: document.getElementById('filterCorrectCount'),
    filterIncorrectCount: document.getElementById('filterIncorrectCount'),
    filterUnansweredCount: document.getElementById('filterUnansweredCount'),
    reviewCardsList: document.getElementById('reviewCardsList'),

    // History View
    historyContentArea: document.getElementById('historyContentArea'),
    clearAllHistoryBtn: document.getElementById('clearAllHistoryBtn'),

    // Modals
    submitModal: document.getElementById('submitModal'),
    submitModalText: document.getElementById('submitModalText'),
    unansweredAlert: document.getElementById('unansweredAlert'),
    unansweredCountSpan: document.getElementById('unansweredCountSpan'),
    cancelSubmitBtn: document.getElementById('cancelSubmitBtn'),
    confirmSubmitBtn: document.getElementById('confirmSubmitBtn'),

    quitModal: document.getElementById('quitModal'),
    cancelQuitBtn: document.getElementById('cancelQuitBtn'),
    confirmQuitBtn: document.getElementById('confirmQuitBtn'),

    clearHistoryModal: document.getElementById('clearHistoryModal'),
    cancelClearHistoryBtn: document.getElementById('cancelClearHistoryBtn'),
    confirmClearHistoryBtn: document.getElementById('confirmClearHistoryBtn'),

    apiSetupModal: document.getElementById('apiSetupModal'),
    closeApiSetupBtn: document.getElementById('closeApiSetupBtn'),
    testApiConnectionBtn: document.getElementById('testApiConnectionBtn'),
    finishApiSetupBtn: document.getElementById('finishApiSetupBtn'),
    modalStatusIndicator: document.getElementById('modalStatusIndicator'),
    modalStatusText: document.getElementById('modalStatusText'),

    toastContainer: document.getElementById('toastContainer')
  };

  // ----------------------------------------------------
  // TOAST NOTIFICATIONS
  // ----------------------------------------------------
  function showToast(message, type = 'info', durationMs = 4000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    const iconMap = {
      success: '✓',
      error: '✕',
      warning: '⚠️',
      info: 'ℹ️'
    };
    toast.innerHTML = `<span>${iconMap[type] || '•'}</span><span>${escapeHTML(message)}</span>`;
    dom.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, durationMs);
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ----------------------------------------------------
  // THEME MANAGEMENT
  // ----------------------------------------------------
  function initTheme() {
    const savedTheme = localStorage.getItem(STORAGE_KEY_THEME);
    if (savedTheme) {
      document.documentElement.dataset.theme = savedTheme;
    } else {
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.dataset.theme = prefersDark ? 'dark' : 'light';
    }

    dom.themeToggleBtn.addEventListener('click', () => {
      const current = document.documentElement.dataset.theme;
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      localStorage.setItem(STORAGE_KEY_THEME, next);
    });
  }

  // ----------------------------------------------------
  // VIEW NAVIGATION
  // ----------------------------------------------------
  function switchView(viewId) {
    // Prevent switching views away during an active quiz without confirmation
    if (state.activeView === 'quizView' && viewId !== 'quizView' && viewId !== 'resultsView') {
      openModal(dom.quitModal);
      return;
    }

    const views = [
      dom.createView,
      dom.loadingView,
      dom.quizView,
      dom.resultsView,
      dom.historyView,
      dom.guideView
    ];

    views.forEach(v => {
      if (v) v.classList.remove('active');
    });

    const target = dom[viewId];
    if (target) {
      target.classList.add('active');
      state.activeView = viewId;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Update active state in nav buttons
    [dom.navCreateBtn, dom.navHistoryBtn, dom.navGuideBtn].forEach(btn => {
      if (!btn) return;
      if (btn.dataset.target === viewId) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    if (viewId === 'historyView') {
      renderHistoryView();
    }
  }

  function initNavEvents() {
    dom.navCreateBtn.addEventListener('click', () => switchView('createView'));
    dom.navHistoryBtn.addEventListener('click', () => switchView('historyView'));
    dom.navGuideBtn.addEventListener('click', () => switchView('guideView'));
    dom.brandLogo.addEventListener('click', () => switchView('createView'));

    dom.bannerActionBtn.addEventListener('click', () => openModal(dom.apiSetupModal));
    dom.bannerCloseBtn.addEventListener('click', () => dom.systemBanner.classList.add('hidden'));
    dom.apiStatusBtn.addEventListener('click', () => openModal(dom.apiSetupModal));
  }

  // ----------------------------------------------------
  // API CONFIGURATION STATUS
  // ----------------------------------------------------
  async function checkApiStatus() {
    try {
      dom.apiStatusBtn.className = 'api-status-pill checking';
      dom.apiStatusLabel.textContent = 'Checking API...';

      const res = await fetch('/api/config-status?t=' + Date.now(), {
        cache: 'no-store',
        headers: { 'Pragma': 'no-cache', 'Cache-Control': 'no-cache' }
      });
      if (!res.ok) throw new Error('Status endpoint unavailable');
      const data = await res.json();

      state.apiConfigured = !!data.configured;

      if (state.apiConfigured) {
        dom.apiStatusBtn.className = 'api-status-pill online';
        dom.apiStatusLabel.textContent = 'Gemini AI: Ready';
        dom.systemBanner.classList.add('hidden');
        if (dom.modalStatusIndicator) {
          dom.modalStatusIndicator.style.backgroundColor = 'var(--success-500)';
          dom.modalStatusText.textContent = 'Gemini API key detected in .env! Integration is active and ready.';
        }
      } else {
        dom.apiStatusBtn.className = 'api-status-pill offline';
        dom.apiStatusLabel.textContent = 'Gemini Key Missing';
        dom.bannerText.textContent = 'Gemini API key is not configured in .env. Setup required to generate quizzes.';
        dom.systemBanner.classList.remove('hidden');
        if (dom.modalStatusIndicator) {
          dom.modalStatusIndicator.style.backgroundColor = 'var(--warning-500)';
          dom.modalStatusText.textContent = 'No API key detected in .env yet. Follow instructions above and restart server.';
        }
      }
    } catch (err) {
      dom.apiStatusBtn.className = 'api-status-pill offline';
      dom.apiStatusLabel.textContent = 'Offline';
      if (dom.modalStatusIndicator) {
        dom.modalStatusIndicator.style.backgroundColor = 'var(--danger-500)';
        dom.modalStatusText.textContent = 'Unable to connect to backend server. Make sure server is running on http://localhost:3000.';
      }
    }
  }

  // ----------------------------------------------------
  // SYLLABUS & FORM CONTROLLER
  // ----------------------------------------------------
  async function loadSyllabusData() {
    try {
      const res = await fetch('/api/syllabus');
      if (!res.ok) throw new Error('Failed to load syllabus');
      state.syllabusData = await res.json();
      populateFormDropdowns();
    } catch (err) {
      console.warn('Could not load syllabus from backend:', err);
    }
  }

  function populateFormDropdowns() {
    if (!state.syllabusData) return;

    // Populate State Boards
    dom.stateSelect.innerHTML = '<option value="" disabled selected>Select Your State Board...</option>';
    state.syllabusData.stateBoards.forEach(sb => {
      const opt = document.createElement('option');
      opt.value = sb;
      opt.textContent = sb;
      dom.stateSelect.appendChild(opt);
    });

    updateSubjectAndChapters();
  }

  function updateSubjectAndChapters() {
    if (!state.syllabusData) return;
    const currentClass = dom.classLevelSelect.value;
    const classData = state.syllabusData.syllabus[currentClass];

    dom.subjectSelect.innerHTML = '';
    if (classData && Array.isArray(classData.subjects)) {
      classData.subjects.forEach(subj => {
        const opt = document.createElement('option');
        opt.value = subj.name;
        opt.textContent = subj.name;
        dom.subjectSelect.appendChild(opt);
      });
    }

    updateChaptersForSubject();
  }

  function updateChaptersForSubject() {
    if (!state.syllabusData) return;
    const currentClass = dom.classLevelSelect.value;
    const selectedSubjectName = dom.subjectSelect.value;
    const classData = state.syllabusData.syllabus[currentClass];

    dom.chapterSelect.innerHTML = '';
    if (!classData) return;

    const subjectObj = classData.subjects.find(s => s.name === selectedSubjectName);
    if (subjectObj && Array.isArray(subjectObj.chapters)) {
      subjectObj.chapters.forEach(chap => {
        const opt = document.createElement('option');
        opt.value = chap;
        opt.textContent = chap;
        dom.chapterSelect.appendChild(opt);
      });
    }
  }

  function initFormEvents() {
    // Class Chips Selection
    dom.classSelectorGrid.querySelectorAll('.class-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        dom.classSelectorGrid.querySelectorAll('.class-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        dom.classLevelSelect.value = chip.dataset.class;
        updateSubjectAndChapters();
      });
    });

    // Board Selection toggle
    dom.boardSelect.addEventListener('change', () => {
      if (dom.boardSelect.value === 'State Board') {
        dom.stateBoardGroup.classList.remove('hidden');
        dom.stateSelect.required = true;
      } else {
        dom.stateBoardGroup.classList.add('hidden');
        dom.stateSelect.required = false;
      }
    });

    // Subject Change
    dom.subjectSelect.addEventListener('change', () => {
      updateChaptersForSubject();
    });

    // Custom Subject Toggle
    dom.toggleCustomSubjectBtn.addEventListener('click', () => {
      const isHidden = dom.customSubjectInput.classList.contains('hidden');
      if (isHidden) {
        dom.customSubjectInput.classList.remove('hidden');
        dom.customSubjectInput.focus();
        dom.toggleCustomSubjectBtn.textContent = '− Select from syllabus list';
      } else {
        dom.customSubjectInput.classList.add('hidden');
        dom.customSubjectInput.value = '';
        dom.toggleCustomSubjectBtn.textContent = '+ Type custom subject';
      }
    });

    // Custom Chapter Toggle
    dom.toggleCustomChapterBtn.addEventListener('click', () => {
      const isHidden = dom.customChapterInput.classList.contains('hidden');
      if (isHidden) {
        dom.customChapterInput.classList.remove('hidden');
        dom.customChapterInput.focus();
        dom.toggleCustomChapterBtn.textContent = '− Select from syllabus list';
      } else {
        dom.customChapterInput.classList.add('hidden');
        dom.customChapterInput.value = '';
        dom.toggleCustomChapterBtn.textContent = '+ Type specific subtopic';
      }
    });

    // Form Submission
    dom.quizForm.addEventListener('submit', handleFormSubmit);
  }

  // ----------------------------------------------------
  // FORM SUBMISSION & GENERATION
  // ----------------------------------------------------
  async function handleFormSubmit(e) {
    e.preventDefault();
    hideFormError();

    const classLevel = dom.classLevelSelect.value;
    const board = dom.boardSelect.value;
    const stateBoard = board === 'State Board' ? dom.stateSelect.value : '';

    const customSubj = dom.customSubjectInput.value.trim();
    const subject = (!dom.customSubjectInput.classList.contains('hidden') && customSubj)
      ? customSubj
      : dom.subjectSelect.value;

    const customChap = dom.customChapterInput.value.trim();
    const chapter = (!dom.customChapterInput.classList.contains('hidden') && customChap)
      ? customChap
      : dom.chapterSelect.value;

    const difficultyInput = document.querySelector('input[name="difficulty"]:checked');
    const difficulty = difficultyInput ? difficultyInput.value : 'Medium';

    const countInput = document.querySelector('input[name="count"]:checked');
    const count = countInput ? parseInt(countInput.value, 10) : 10;

    // Frontend validation
    if (board === 'State Board' && !stateBoard) {
      showFormError('Please select a specific State Board from the list.');
      return;
    }

    if (!subject || subject.length < 2) {
      showFormError('Please select or specify a valid Subject.');
      return;
    }

    if (!chapter || chapter.length < 2) {
      showFormError('Please select or specify a valid Chapter or Topic.');
      return;
    }

    // Prepare Payload
    const payload = {
      classLevel,
      board,
      stateBoard,
      subject,
      chapter,
      difficulty,
      count
    };

    // Transition to Loading Screen
    startLoadingScreen(payload);

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        stopLoadingScreen();
        if (data.code === 'API_KEY_MISSING') {
          showToast('Gemini API key is not configured in .env', 'warning', 6000);
          openModal(dom.apiSetupModal);
        } else {
          showFormError(data.error || 'Failed to generate quiz. Please try again.');
          showToast(data.error || 'Quiz generation failed', 'error');
        }
        switchView('createView');
        return;
      }

      stopLoadingScreen();
      startQuizSession(data.questions, data.metadata);
      showToast(`Quiz generated successfully (${data.questions.length} questions)!`, 'success');
    } catch (err) {
      stopLoadingScreen();
      showFormError('Network error connecting to the quiz generator server.');
      showToast('Connection failed. Is the server running?', 'error');
      switchView('createView');
    }
  }

  function showFormError(msg) {
    dom.formErrorMsg.textContent = msg;
    dom.formErrorBox.classList.remove('hidden');
    dom.formErrorBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  function hideFormError() {
    dom.formErrorBox.classList.add('hidden');
  }

  let quoteInterval = null;

  function startLoadingScreen(payload) {
    switchView('loadingView');
    dom.loadingTitle.textContent = `Consulting Gemini AI for Class ${payload.classLevel}...`;
    dom.loadingStatusText.textContent = `Designing ${payload.count} board-standard MCQs on "${payload.chapter}"...`;

    let quoteIdx = 0;
    dom.quoteText.textContent = EDUCATIONAL_QUOTES[0];
    quoteInterval = setInterval(() => {
      quoteIdx = (quoteIdx + 1) % EDUCATIONAL_QUOTES.length;
      dom.quoteText.textContent = EDUCATIONAL_QUOTES[quoteIdx];
    }, 3500);
  }

  function stopLoadingScreen() {
    if (quoteInterval) clearInterval(quoteInterval);
  }

  // ----------------------------------------------------
  // ACTIVE QUIZ RUNNER
  // ----------------------------------------------------
  function startQuizSession(questions, metadata) {
    state.currentQuiz = { questions, metadata };
    state.userAnswers = {};
    state.currentQuestionIndex = 0;
    state.isSubmitting = false;

    // Timer calculation: 1.5 minutes per question
    const secondsPerQ = 90;
    state.timerTotalSeconds = questions.length * secondsPerQ;
    state.timerSecondsLeft = state.timerTotalSeconds;

    // Header Badges
    dom.quizMetaClass.textContent = `Class ${metadata.classLevel}`;
    dom.quizMetaBoard.textContent = metadata.stateBoard
      ? `${metadata.board} (${metadata.stateBoard.split(' ')[0]})`
      : metadata.board;
    dom.quizMetaDifficulty.textContent = metadata.difficulty;
    dom.quizMetaSubjectTopic.textContent = `${metadata.subject}: ${metadata.chapter}`;

    buildPaletteChips();
    startTimer();
    renderQuestion(0);
    switchView('quizView');
  }

  function renderQuestion(index) {
    const questions = state.currentQuiz.questions;
    if (index < 0 || index >= questions.length) return;

    state.currentQuestionIndex = index;
    const q = questions[index];

    // Update Header indicators
    dom.questionNumberPill.textContent = `Question ${index + 1} of ${questions.length}`;
    dom.questionTopicPill.textContent = q.topic || state.currentQuiz.metadata.chapter;
    dom.progressCountLabel.textContent = `Question ${index + 1} of ${questions.length}`;

    // Progress Bar
    const progressPercent = ((index + 1) / questions.length) * 100;
    dom.quizProgressBar.style.width = `${progressPercent}%`;

    // Answered Counter
    updateAnsweredCount();

    // Render Question Text (safe from HTML injection)
    dom.questionText.textContent = q.question;

    // Render Options
    dom.optionsGrid.innerHTML = '';
    const optionLetters = ['A', 'B', 'C', 'D'];
    const currentSelected = state.userAnswers[index];

    q.options.forEach((optText, optIdx) => {
      const card = document.createElement('div');
      card.className = 'option-card';
      if (currentSelected === optIdx) {
        card.classList.add('selected');
      }

      const badge = document.createElement('div');
      badge.className = 'option-badge';
      badge.textContent = optionLetters[optIdx];

      const text = document.createElement('div');
      text.className = 'option-text';
      text.textContent = optText;

      card.appendChild(badge);
      card.appendChild(text);

      card.addEventListener('click', () => {
        selectOption(index, optIdx);
      });

      dom.optionsGrid.appendChild(card);
    });

    // Navigation buttons state
    dom.prevQuestionBtn.disabled = index === 0;

    const isLast = index === questions.length - 1;
    if (isLast) {
      dom.nextQuestionBtn.classList.add('hidden');
      dom.submitQuizBtn.classList.remove('hidden');
    } else {
      dom.nextQuestionBtn.classList.remove('hidden');
      dom.submitQuizBtn.classList.add('hidden');
    }

    updatePaletteHighlight();
  }

  function selectOption(qIndex, optionIndex) {
    state.userAnswers[qIndex] = optionIndex;

    // Refresh option styling
    const optionCards = dom.optionsGrid.querySelectorAll('.option-card');
    optionCards.forEach((c, idx) => {
      if (idx === optionIndex) {
        c.classList.add('selected');
      } else {
        c.classList.remove('selected');
      }
    });

    updateAnsweredCount();
    updatePaletteHighlight();
  }

  function updateAnsweredCount() {
    const total = state.currentQuiz.questions.length;
    const answered = Object.keys(state.userAnswers).length;
    dom.answeredCountLabel.textContent = `${answered} of ${total} Answered`;
  }

  // ----------------------------------------------------
  // QUESTION PALETTE
  // ----------------------------------------------------
  function buildPaletteChips() {
    dom.paletteChipsGrid.innerHTML = '';
    const total = state.currentQuiz.questions.length;

    for (let i = 0; i < total; i++) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'palette-chip';
      chip.textContent = i + 1;
      chip.dataset.index = i;

      chip.addEventListener('click', () => {
        renderQuestion(i);
      });

      dom.paletteChipsGrid.appendChild(chip);
    }
  }

  function updatePaletteHighlight() {
    const chips = dom.paletteChipsGrid.querySelectorAll('.palette-chip');
    chips.forEach((chip, idx) => {
      chip.className = 'palette-chip';
      if (idx === state.currentQuestionIndex) {
        chip.classList.add('current');
      } else if (state.userAnswers[idx] !== undefined) {
        chip.classList.add('answered');
      }
    });
  }

  // ----------------------------------------------------
  // QUIZ TIMER
  // ----------------------------------------------------
  function startTimer() {
    if (state.timerInterval) clearInterval(state.timerInterval);

    updateTimerDisplay();

    state.timerInterval = setInterval(() => {
      state.timerSecondsLeft--;
      updateTimerDisplay();

      if (state.timerSecondsLeft <= 0) {
        clearInterval(state.timerInterval);
        showToast('Time has expired! Submitting your quiz...', 'warning', 4000);
        executeSubmitQuiz(true);
      }
    }, 1000);
  }

  function updateTimerDisplay() {
    const mins = Math.floor(state.timerSecondsLeft / 60);
    const secs = state.timerSecondsLeft % 60;
    dom.timerValue.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    dom.timerDisplay.className = 'timer-display';
    if (state.timerSecondsLeft < 60) {
      dom.timerDisplay.classList.add('danger');
    } else if (state.timerSecondsLeft < 180) {
      dom.timerDisplay.classList.add('warning');
    }
  }

  function stopTimer() {
    if (state.timerInterval) {
      clearInterval(state.timerInterval);
      state.timerInterval = null;
    }
  }

  // ----------------------------------------------------
  // QUIZ SUBMISSION & SCORING
  // ----------------------------------------------------
  function requestSubmitConfirmation() {
    const total = state.currentQuiz.questions.length;
    const answered = Object.keys(state.userAnswers).length;
    const unanswered = total - answered;

    dom.submitModalText.textContent = `You have completed ${answered} of ${total} questions.`;

    if (unanswered > 0) {
      dom.unansweredCountSpan.textContent = unanswered;
      dom.unansweredAlert.classList.remove('hidden');
    } else {
      dom.unansweredAlert.classList.add('hidden');
    }

    openModal(dom.submitModal);
  }

  async function executeSubmitQuiz(isAutoSubmit = false) {
    if (state.isSubmitting) return;
    state.isSubmitting = true;
    closeModal(dom.submitModal);
    stopTimer();

    const timeTaken = state.timerTotalSeconds - Math.max(0, state.timerSecondsLeft);
    const questions = state.currentQuiz.questions;

    // Calculate score locally and verify via server endpoint
    let scoreResult;
    try {
      const res = await fetch('/api/validate-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userAnswers: state.userAnswers,
          questions,
          timeTaken
        })
      });
      const data = await res.json();
      if (data.success && data.result) {
        scoreResult = data.result;
      }
    } catch {
      // Fallback local computation if endpoint unavailable
    }

    if (!scoreResult) {
      scoreResult = calculateScoreLocally(state.userAnswers, questions, timeTaken);
    }

    // Save to Quiz History
    saveQuizAttempt(state.currentQuiz.metadata, scoreResult, questions);

    // Render Results
    renderResultsView(scoreResult, state.currentQuiz.metadata);
    switchView('resultsView');

    if (!isAutoSubmit) {
      showToast('Quiz submitted successfully!', 'success');
    }
  }

  function calculateScoreLocally(userAnswers, questions, timeTaken) {
    const total = questions.length;
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;
    const details = [];

    questions.forEach((q, idx) => {
      const selected = userAnswers[idx];
      const hasAnswer = selected !== undefined && selected !== null && selected !== '';
      const selectedIndex = hasAnswer ? parseInt(selected, 10) : null;
      const isCorrect = selectedIndex === q.correctIndex;

      if (!hasAnswer) {
        unanswered++;
      } else if (isCorrect) {
        correct++;
      } else {
        incorrect++;
      }

      details.push({
        questionId: q.id || idx + 1,
        questionText: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        correctOption: q.options[q.correctIndex],
        selectedIndex: hasAnswer ? selectedIndex : null,
        selectedOption: hasAnswer ? q.options[selectedIndex] : null,
        isAnswered: hasAnswer,
        isCorrect,
        explanation: q.explanation,
        topic: q.topic,
        difficulty: q.difficulty
      });
    });

    const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

    return {
      totalQuestions: total,
      answeredCount: total - unanswered,
      unansweredCount: unanswered,
      correctCount: correct,
      incorrectCount: incorrect,
      score: correct,
      percentage,
      timeTaken,
      details
    };
  }

  // ----------------------------------------------------
  // RESULTS VIEW & REVIEW
  // ----------------------------------------------------
  function renderResultsView(scoreResult, metadata) {
    state.lastReviewData = { scoreResult, metadata };

    // Score Circle
    dom.scorePercentValue.textContent = `${scoreResult.percentage}%`;
    dom.scoreFractionValue.textContent = `${scoreResult.score} / ${scoreResult.totalQuestions}`;

    // Verdict
    if (scoreResult.percentage >= 90) {
      dom.verdictTag.textContent = '🌟 Outstanding Mastery';
      dom.verdictHeading.textContent = 'Exemplary Performance!';
      dom.verdictMessage.textContent = 'You have mastered this chapter with top board exam precision.';
    } else if (scoreResult.percentage >= 70) {
      dom.verdictTag.textContent = '👏 Great Achievement';
      dom.verdictHeading.textContent = 'Well Done!';
      dom.verdictMessage.textContent = 'Strong grasp of foundational principles. Review tricky concepts below.';
    } else if (scoreResult.percentage >= 40) {
      dom.verdictTag.textContent = '📚 Good Effort';
      dom.verdictHeading.textContent = 'Room for Growth';
      dom.verdictMessage.textContent = 'You understand the basics, but need practice on key formulas and edge cases.';
    } else {
      dom.verdictTag.textContent = '🌱 Keep Practicing';
      dom.verdictHeading.textContent = 'Revision Recommended';
      dom.verdictMessage.textContent = 'Read through the textbook chapter once more and review the detailed answer notes below.';
    }

    // Result Meta Chips
    dom.resultMetaChips.innerHTML = `
      <span class="meta-badge">Class ${metadata.classLevel}</span>
      <span class="meta-badge">${metadata.board}</span>
      <span class="meta-badge">${metadata.subject}</span>
      <span class="meta-badge">${metadata.chapter}</span>
      <span class="meta-badge">${metadata.difficulty}</span>
    `;

    // Metrics
    dom.metricTotal.textContent = scoreResult.totalQuestions;
    dom.metricCorrect.textContent = scoreResult.correctCount;
    dom.metricIncorrect.textContent = scoreResult.incorrectCount;
    dom.metricUnanswered.textContent = scoreResult.unansweredCount;

    const mins = Math.floor(scoreResult.timeTaken / 60);
    const secs = scoreResult.timeTaken % 60;
    dom.metricTime.textContent = `${mins}m ${secs}s`;

    // Filter counts
    dom.filterAllCount.textContent = scoreResult.totalQuestions;
    dom.filterCorrectCount.textContent = scoreResult.correctCount;
    dom.filterIncorrectCount.textContent = scoreResult.incorrectCount;
    dom.filterUnansweredCount.textContent = scoreResult.unansweredCount;

    state.reviewFilter = 'all';
    renderReviewCards();
  }

  function renderReviewCards() {
    if (!state.lastReviewData) return;
    const { scoreResult } = state.lastReviewData;
    const filter = state.reviewFilter;

    dom.reviewCardsList.innerHTML = '';

    const filtered = scoreResult.details.filter(item => {
      if (filter === 'correct') return item.isCorrect;
      if (filter === 'incorrect') return item.isAnswered && !item.isCorrect;
      if (filter === 'unanswered') return !item.isAnswered;
      return true;
    });

    if (filtered.length === 0) {
      dom.reviewCardsList.innerHTML = `
        <div class="empty-history-box">
          <p>No questions match the "${filter}" filter.</p>
        </div>
      `;
      return;
    }

    const optionLetters = ['A', 'B', 'C', 'D'];

    filtered.forEach(item => {
      const card = document.createElement('div');
      card.className = 'review-card';

      // Header with badge
      let badgeClass = 'unanswered';
      let badgeText = '⚪ Unanswered';
      if (item.isCorrect) {
        badgeClass = 'correct';
        badgeText = '✓ Correct (+1)';
      } else if (item.isAnswered) {
        badgeClass = 'incorrect';
        badgeText = '✕ Incorrect (0)';
      }

      card.innerHTML = `
        <div class="review-card-header">
          <span class="meta-badge">Question ${item.questionId} • ${escapeHTML(item.topic || 'General')}</span>
          <span class="review-status-badge ${badgeClass}">${badgeText}</span>
        </div>
        <div class="review-question-text">${escapeHTML(item.questionText)}</div>
        <div class="review-options-list"></div>
        <div class="review-explanation-card">
          <strong>💡 Conceptual Explanation:</strong> ${escapeHTML(item.explanation)}
        </div>
      `;

      const optionsContainer = card.querySelector('.review-options-list');

      item.options.forEach((optText, optIdx) => {
        const isThisCorrect = optIdx === item.correctIndex;
        const isUserChoice = optIdx === item.selectedIndex;

        const optDiv = document.createElement('div');
        optDiv.className = 'review-option-item';

        if (isThisCorrect) {
          optDiv.classList.add('correct-ans');
        } else if (isUserChoice && !isThisCorrect) {
          optDiv.classList.add('wrong-selected');
        }

        let tagHTML = '';
        if (isThisCorrect) {
          tagHTML = '<span class="review-opt-tag correct">Correct Answer</span>';
        } else if (isUserChoice) {
          tagHTML = '<span class="review-opt-tag wrong">Your Answer</span>';
        }

        optDiv.innerHTML = `
          <span class="option-badge">${optionLetters[optIdx]}</span>
          <span class="option-text">${escapeHTML(optText)}</span>
          ${tagHTML}
        `;

        optionsContainer.appendChild(optDiv);
      });

      dom.reviewCardsList.appendChild(card);
    });
  }

  // ----------------------------------------------------
  // QUIZ HISTORY (LOCALSTORAGE ENGINE)
  // ----------------------------------------------------
  function getHistoryRecords() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
      return [];
    } catch (e) {
      console.warn('Corrupted history reset safely:', e);
      return [];
    }
  }

  function saveQuizAttempt(metadata, scoreResult, questions) {
    try {
      const records = getHistoryRecords();
      const newEntry = {
        id: 'quiz_' + Date.now(),
        timestamp: new Date().toISOString(),
        metadata,
        score: scoreResult.score,
        totalQuestions: scoreResult.totalQuestions,
        percentage: scoreResult.percentage,
        timeTaken: scoreResult.timeTaken,
        questions,
        scoreResult
      };

      // Limit to 50 most recent quizzes
      records.unshift(newEntry);
      if (records.length > 50) records.pop();

      localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(records));
      updateHistoryBadge();
    } catch (err) {
      console.error('Failed to save to history:', err);
    }
  }

  function updateHistoryBadge() {
    const records = getHistoryRecords();
    dom.historyCountBadge.textContent = records.length;
  }

  function renderHistoryView() {
    const records = getHistoryRecords();
    dom.historyContentArea.innerHTML = '';

    if (records.length === 0) {
      dom.historyContentArea.innerHTML = `
        <div class="empty-history-box">
          <div class="empty-history-icon">📝</div>
          <h3>No Quizzes Taken Yet</h3>
          <p class="view-subtitle" style="margin-bottom: 1.5rem;">Generate your first board exam practice quiz to track your progress and score history.</p>
          <button class="primary-btn" id="emptyHistoryCreateBtn">Create Practice Quiz</button>
        </div>
      `;
      const btn = document.getElementById('emptyHistoryCreateBtn');
      if (btn) btn.addEventListener('click', () => switchView('createView'));
      return;
    }

    const grid = document.createElement('div');
    grid.className = 'history-grid';

    records.forEach(entry => {
      const card = document.createElement('div');
      card.className = 'history-card';

      const dateStr = new Date(entry.timestamp).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      card.innerHTML = `
        <div class="history-card-left">
          <div class="history-score-badge">
            <span>${entry.percentage}%</span>
            <span class="history-percent-label">${entry.score}/${entry.totalQuestions}</span>
          </div>
          <div>
            <div class="history-topic-name">${escapeHTML(entry.metadata.subject)}: ${escapeHTML(entry.metadata.chapter)}</div>
            <div class="history-meta-row">
              <span>Class ${entry.metadata.classLevel}</span>
              <span>•</span>
              <span>${entry.metadata.board}</span>
              <span>•</span>
              <span>${entry.metadata.difficulty}</span>
              <span>•</span>
              <span>${dateStr}</span>
            </div>
          </div>
        </div>
        <div class="history-card-actions">
          <button class="secondary-btn history-review-btn" data-id="${entry.id}">Review</button>
          <button class="primary-btn history-retake-btn" data-id="${entry.id}">Retake</button>
          <button class="icon-btn history-delete-btn" data-id="${entry.id}" title="Delete entry">🗑️</button>
        </div>
      `;

      grid.appendChild(card);
    });

    dom.historyContentArea.appendChild(grid);

    // Attach actions
    dom.historyContentArea.querySelectorAll('.history-review-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const entry = records.find(r => r.id === btn.dataset.id);
        if (entry) {
          renderResultsView(entry.scoreResult, entry.metadata);
          switchView('resultsView');
        }
      });
    });

    dom.historyContentArea.querySelectorAll('.history-retake-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const entry = records.find(r => r.id === btn.dataset.id);
        if (entry && entry.questions) {
          startQuizSession(entry.questions, entry.metadata);
          showToast('Retaking past quiz...', 'info');
        }
      });
    });

    dom.historyContentArea.querySelectorAll('.history-delete-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const updated = records.filter(r => r.id !== btn.dataset.id);
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(updated));
        updateHistoryBadge();
        renderHistoryView();
        showToast('Quiz entry deleted', 'info');
      });
    });
  }

  function clearAllHistory() {
    localStorage.removeItem(STORAGE_KEY_HISTORY);
    updateHistoryBadge();
    renderHistoryView();
    closeModal(dom.clearHistoryModal);
    showToast('All quiz history cleared', 'info');
  }

  // ----------------------------------------------------
  // MODAL CONTROLS
  // ----------------------------------------------------
  function openModal(modalEl) {
    if (modalEl) modalEl.classList.remove('hidden');
  }

  function closeModal(modalEl) {
    if (modalEl) modalEl.classList.add('hidden');
  }

  function initModalEvents() {
    // Submit Modal
    dom.cancelSubmitBtn.addEventListener('click', () => closeModal(dom.submitModal));
    dom.confirmSubmitBtn.addEventListener('click', () => executeSubmitQuiz(false));

    // Quit Modal
    dom.quitQuizBtn.addEventListener('click', () => openModal(dom.quitModal));
    dom.cancelQuitBtn.addEventListener('click', () => closeModal(dom.quitModal));
    dom.confirmQuitBtn.addEventListener('click', () => {
      stopTimer();
      closeModal(dom.quitModal);
      switchView('createView');
      showToast('Quiz exited', 'info');
    });

    // Clear History Modal
    dom.clearAllHistoryBtn.addEventListener('click', () => openModal(dom.clearHistoryModal));
    dom.cancelClearHistoryBtn.addEventListener('click', () => closeModal(dom.clearHistoryModal));
    dom.confirmClearHistoryBtn.addEventListener('click', clearAllHistory);

    // API Setup Modal
    dom.closeApiSetupBtn.addEventListener('click', () => closeModal(dom.apiSetupModal));
    dom.finishApiSetupBtn.addEventListener('click', () => closeModal(dom.apiSetupModal));
    dom.testApiConnectionBtn.addEventListener('click', async () => {
      dom.modalStatusText.textContent = 'Testing connection with Google Gemini...';
      if (dom.modalStatusIndicator) {
        dom.modalStatusIndicator.style.backgroundColor = 'var(--warning-500)';
      }
      try {
        const res = await fetch('/api/test-connection?t=' + Date.now(), { cache: 'no-store' });
        const data = await res.json();
        if (res.ok && data.success) {
          if (dom.modalStatusIndicator) dom.modalStatusIndicator.style.backgroundColor = 'var(--success-500)';
          dom.modalStatusText.textContent = 'Connection Verified: Gemini API is responding successfully!';
          showToast('Gemini API connection verified!', 'success');
          dom.apiStatusBtn.className = 'api-status-pill online';
          dom.apiStatusLabel.textContent = 'Gemini AI: Ready';
          dom.systemBanner.classList.add('hidden');
        } else {
          if (dom.modalStatusIndicator) dom.modalStatusIndicator.style.backgroundColor = 'var(--danger-500)';
          dom.modalStatusText.textContent = data.message || 'API connection failed.';
          showToast(data.message || 'Connection test failed', 'error', 6000);
        }
      } catch {
        if (dom.modalStatusIndicator) dom.modalStatusIndicator.style.backgroundColor = 'var(--danger-500)';
        dom.modalStatusText.textContent = 'Could not reach server. Verify server is running on http://localhost:3000.';
        showToast('Server unreachable', 'error');
      }
    });

    // Close on backdrop click
    [dom.submitModal, dom.quitModal, dom.clearHistoryModal, dom.apiSetupModal].forEach(modal => {
      modal.addEventListener('click', e => {
        if (e.target === modal) closeModal(modal);
      });
    });
  }

  // ----------------------------------------------------
  // EVENT ATTACHMENTS FOR BUTTONS & NAVIGATION
  // ----------------------------------------------------
  function initQuizNavControls() {
    dom.prevQuestionBtn.addEventListener('click', () => {
      if (state.currentQuestionIndex > 0) {
        renderQuestion(state.currentQuestionIndex - 1);
      }
    });

    dom.nextQuestionBtn.addEventListener('click', () => {
      if (state.currentQuestionIndex < state.currentQuiz.questions.length - 1) {
        renderQuestion(state.currentQuestionIndex + 1);
      }
    });

    dom.submitQuizBtn.addEventListener('click', requestSubmitConfirmation);

    dom.togglePaletteBtn.addEventListener('click', () => {
      dom.paletteDrawer.classList.toggle('open');
    });

    // Keyboard Shortcuts for Quiz
    window.addEventListener('keydown', e => {
      if (state.activeView !== 'quizView') return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;

      // 1, 2, 3, 4 or A, B, C, D to choose option
      const key = e.key.toUpperCase();
      const numKey = parseInt(e.key, 10);

      if (['1', '2', '3', '4'].includes(e.key)) {
        selectOption(state.currentQuestionIndex, numKey - 1);
      } else if (['A', 'B', 'C', 'D'].includes(key)) {
        const charMap = { A: 0, B: 1, C: 2, D: 3 };
        selectOption(state.currentQuestionIndex, charMap[key]);
      } else if (e.key === 'ArrowRight' && state.currentQuestionIndex < state.currentQuiz.questions.length - 1) {
        renderQuestion(state.currentQuestionIndex + 1);
      } else if (e.key === 'ArrowLeft' && state.currentQuestionIndex > 0) {
        renderQuestion(state.currentQuestionIndex - 1);
      }
    });

    // Results Actions
    dom.retakeQuizBtn.addEventListener('click', () => {
      if (state.currentQuiz && state.currentQuiz.questions) {
        startQuizSession(state.currentQuiz.questions, state.currentQuiz.metadata);
      }
    });

    dom.newQuizBtn.addEventListener('click', () => switchView('createView'));
    dom.saveHistoryBtn.addEventListener('click', () => switchView('historyView'));

    // Review Filters
    dom.reviewFilters.querySelectorAll('.filter-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        dom.reviewFilters.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.reviewFilter = btn.dataset.filter;
        renderReviewCards();
      });
    });
  }

  // ----------------------------------------------------
  // INITIALIZATION
  // ----------------------------------------------------
  async function init() {
    initTheme();
    initNavEvents();
    initFormEvents();
    initModalEvents();
    initQuizNavControls();
    updateHistoryBadge();

    // Check backend API key configuration
    await checkApiStatus();

    // Load curriculum metadata
    await loadSyllabusData();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
