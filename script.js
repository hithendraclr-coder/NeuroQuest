/**
 * NEUROQUEST — BRAIN TRAINING PLATFORM
 * Core Application Engine & Cognitive Game Suite
 * Strictly Vanilla JavaScript | LocalStorage Persistence | Web Audio API
 * Strict Rule: ABSOLUTELY NO BLUE OR CYAN ANYWHERE.
 */

(function () {
  'use strict';

  // =========================================================================
  // 1. CONFIGURATION & CONSTANTS
  // =========================================================================
  const STORAGE_KEY = 'neuroquest_user_state_v1';

  // Game Registry
  const GAMES = [
    {
      id: 'memoryMatrix',
      name: 'Memory Matrix',
      icon: '🧩',
      faculty: 'Visual Memory',
      category: 'memory',
      themeClass: 'card-theme-purple',
      desc: 'Memorize and reproduce spatial tile patterns under escalating grid dimensions.',
      difficultyLabel: 'Scales 3×3 to 6×6'
    },
    {
      id: 'numberSequence',
      name: 'Number Sequence',
      icon: '🔢',
      faculty: 'Pattern Reasoning',
      category: 'speed',
      themeClass: 'card-theme-magenta',
      desc: 'Identify underlying mathematical formulas and predict the next term.',
      difficultyLabel: 'Arithmetic & Geometric'
    },
    {
      id: 'focusMaster',
      name: 'Focus Master',
      icon: '🎯',
      faculty: 'Selective Attention',
      category: 'focus',
      themeClass: 'card-theme-coral',
      desc: 'Filter visual noise and distractors to capture targeted shapes and colors.',
      difficultyLabel: 'Timed Attention'
    },
    {
      id: 'logicLab',
      name: 'Logic Lab',
      icon: '💡',
      faculty: 'Logical Deduction',
      category: 'speed',
      themeClass: 'card-theme-yellow',
      desc: 'Solve categorical riddles, deductive syllogisms, and sequence problems.',
      difficultyLabel: 'Multiple Choice'
    },
    {
      id: 'quickCalc',
      name: 'Quick Calculation',
      icon: '⚡',
      faculty: 'Mental Arithmetic',
      category: 'speed',
      themeClass: 'card-theme-orange',
      desc: 'Rapid arithmetic operations under a high-pressure 45-second timer.',
      difficultyLabel: 'Arithmetic Blitz'
    },
    {
      id: 'reactionTime',
      name: 'Reaction Challenge',
      icon: '⏱️',
      faculty: 'Neural Reflexes',
      category: 'focus',
      themeClass: 'card-theme-emerald',
      desc: 'Measure millisecond neuromuscular response time to sudden color transitions.',
      difficultyLabel: '5 Trial Benchmark'
    }
  ];

  // Achievements Definition
  const ACHIEVEMENTS_DEF = [
    { id: 'first_step', title: 'First Step', desc: 'Complete your first brain training game.', icon: '🌱', xp: 50 },
    { id: 'memory_master', title: 'Memory Master', desc: 'Score 500+ points in Memory Matrix.', icon: '🧩', xp: 100 },
    { id: 'logic_explorer', title: 'Logic Explorer', desc: 'Complete a full session in Logic Lab.', icon: '💡', xp: 75 },
    { id: 'speed_thinker', title: 'Speed Thinker', desc: 'Score 600+ points in Quick Calculation.', icon: '⚡', xp: 120 },
    { id: 'focus_champion', title: 'Focus Champion', desc: 'Achieve 90%+ accuracy in Focus Master.', icon: '🎯', xp: 100 },
    { id: 'perfect_round', title: 'Perfect Round', desc: 'Finish any game with 100% accuracy.', icon: '💎', xp: 150 },
    { id: 'consistency_star', title: 'Consistency Star', desc: 'Train across 3 different calendar days.', icon: '⭐', xp: 150 },
    { id: 'brain_athlete', title: 'Brain Athlete', desc: 'Complete 25 total training sessions.', icon: '🏋️', xp: 250 },
    { id: 'daily_challenger', title: 'Daily Challenger', desc: 'Complete today’s designated Daily Quest.', icon: '👑', xp: 200 },
    { id: 'high_achiever', title: 'High Achiever', desc: 'Advance to Player Level 5 or higher.', icon: '🚀', xp: 300 },
    { id: 'lightning_reflexes', title: 'Lightning Reflexes', desc: 'Achieve reaction time under 250 ms.', icon: '⚡', xp: 150 },
    { id: 'century_club', title: 'Century Club', desc: 'Accumulate over 1,000 total Experience Points.', icon: '🏆', xp: 200 }
  ];

  // Default User State
  const DEFAULT_STATE = {
    playerName: 'Neuron Pioneer',
    totalXP: 0,
    playerLevel: 1,
    streak: 0,
    lastPlayedDate: '',
    datesTrained: [],
    soundEnabled: true,
    theme: 'dark',
    difficulty: 'medium', // 'easy' | 'medium' | 'hard' | 'adaptive'
    bestScores: {
      memoryMatrix: 0,
      numberSequence: 0,
      focusMaster: 0,
      logicLab: 0,
      quickCalc: 0,
      reactionTime: 0 // Best ms stored or score equivalent
    },
    gameStats: {
      memoryMatrix: { played: 0, totalScore: 0, totalAccuracy: 0 },
      numberSequence: { played: 0, totalScore: 0, totalAccuracy: 0 },
      focusMaster: { played: 0, totalScore: 0, totalAccuracy: 0 },
      logicLab: { played: 0, totalScore: 0, totalAccuracy: 0 },
      quickCalc: { played: 0, totalScore: 0, totalAccuracy: 0 },
      reactionTime: { played: 0, totalScore: 0, totalAccuracy: 0 }
    },
    history: [],
    achievements: {},
    dailyStatus: {
      date: '',
      completed: false
    }
  };

  // Active Global State
  let state = loadState();

  // Active Game Session Controller State
  let activeGame = null;
  let activeInterval = null;
  let activeTimeout = null;

  // =========================================================================
  // 2. AUDIO SYNTHESIS ENGINE (Web Audio API — No External Files)
  // =========================================================================
  let audioCtx = null;

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.1) {
    if (!state.soundEnabled) return;
    try {
      initAudioContext();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gainNode.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      // Audio autoplay policy fallback
    }
  }

  const Sound = {
    click: () => playTone(600, 'sine', 0.08, 0.08),
    correct: () => {
      if (!state.soundEnabled) return;
      try {
        initAudioContext();
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        [523.25, 659.25, 783.99].forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          gain.gain.setValueAtTime(0.08, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.2);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.2);
        });
      } catch (e) {}
    },
    wrong: () => {
      if (!state.soundEnabled) return;
      try {
        initAudioContext();
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(160, now + 0.25);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.25);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.25);
      } catch (e) {}
    },
    levelUp: () => {
      if (!state.soundEnabled) return;
      try {
        initAudioContext();
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          gain.gain.setValueAtTime(0.1, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.35);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.35);
        });
      } catch (e) {}
    },
    tick: () => playTone(880, 'sine', 0.04, 0.04)
  };

  // =========================================================================
  // 3. STORAGE & STATE HELPERS
  // =========================================================================
  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULT_STATE));
      const parsed = JSON.parse(raw);
      // Merge with defaults to guarantee all schema keys exist
      return Object.assign({}, JSON.parse(JSON.stringify(DEFAULT_STATE)), parsed);
    } catch (e) {
      console.warn('LocalStorage error, using defaults:', e);
      return JSON.parse(JSON.stringify(DEFAULT_STATE));
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  function getTodayString() {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function checkAndUpdateDailyStreak() {
    const today = getTodayString();
    if (!state.datesTrained.includes(today)) {
      state.datesTrained.push(today);
    }

    if (!state.lastPlayedDate) {
      state.streak = 1;
      state.lastPlayedDate = today;
    } else if (state.lastPlayedDate !== today) {
      const last = new Date(state.lastPlayedDate);
      const curr = new Date(today);
      const diffDays = Math.round((curr - last) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        state.streak += 1;
      } else if (diffDays > 1) {
        state.streak = 1;
      }
      state.lastPlayedDate = today;
    }

    // Daily reset check
    if (state.dailyStatus.date !== today) {
      state.dailyStatus = {
        date: today,
        completed: false
      };
    }

    saveState();
  }

  function calculateLevel(xp) {
    // Smooth level curve: each level requires level * 250 XP
    let level = 1;
    let threshold = 250;
    while (xp >= threshold) {
      level++;
      threshold += level * 250;
    }
    const prevThreshold = threshold - (level * 250);
    const xpIntoLevel = xp - prevThreshold;
    const xpNeededForLevel = level * 250;
    return {
      level,
      xpIntoLevel,
      xpNeededForLevel,
      pct: Math.min(100, Math.round((xpIntoLevel / xpNeededForLevel) * 100))
    };
  }

  // =========================================================================
  // 4. DAILY CHALLENGE DETERMINISTIC ENGINE
  // =========================================================================
  function getDailyChallengeConfig() {
    const today = getTodayString();
    // Deterministic hash based on date
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
      hash = (hash << 5) - hash + today.charCodeAt(i);
      hash |= 0;
    }
    const gameIdx = Math.abs(hash) % GAMES.length;
    const targetGame = GAMES[gameIdx];

    const targets = {
      memoryMatrix: { targetScore: 400, desc: 'Score at least 400 points in Memory Matrix without exhausting lives.' },
      numberSequence: { targetScore: 500, desc: 'Identify 5 correct number patterns with high precision.' },
      focusMaster: { targetScore: 600, desc: 'Capture targeted symbols with at least 80% accuracy.' },
      logicLab: { targetScore: 450, desc: 'Solve deductive logic puzzles with speed and accuracy.' },
      quickCalc: { targetScore: 550, desc: 'Surpass 550 points in Quick Calculation mental math.' },
      reactionTime: { targetScore: 320, desc: 'Achieve an average reaction time below 320 ms.' }
    };

    return {
      date: today,
      gameId: targetGame.id,
      gameName: targetGame.name,
      gameIcon: targetGame.icon,
      targetScore: targets[targetGame.id].targetScore,
      instructions: targets[targetGame.id].desc,
      rewardXP: 200
    };
  }

  // =========================================================================
  // 5. ACHIEVEMENTS SYSTEM
  // =========================================================================
  function evaluateAchievements() {
    const unlockedNow = [];
    const gamesCount = state.history.length;
    const datesCount = (state.datesTrained || []).length;
    const levelInfo = calculateLevel(state.totalXP);

    ACHIEVEMENTS_DEF.forEach(ach => {
      if (state.achievements[ach.id]) return; // Already unlocked

      let qualified = false;

      switch (ach.id) {
        case 'first_step':
          qualified = gamesCount >= 1;
          break;
        case 'memory_master':
          qualified = (state.bestScores.memoryMatrix || 0) >= 500;
          break;
        case 'logic_explorer':
          qualified = (state.gameStats.logicLab?.played || 0) >= 1;
          break;
        case 'speed_thinker':
          qualified = (state.bestScores.quickCalc || 0) >= 600;
          break;
        case 'focus_champion': {
          const focusRecent = state.history.find(h => h.gameId === 'focusMaster');
          qualified = focusRecent && focusRecent.accuracy >= 90;
          break;
        }
        case 'perfect_round':
          qualified = state.history.some(h => h.accuracy === 100);
          break;
        case 'consistency_star':
          qualified = datesCount >= 3;
          break;
        case 'brain_athlete':
          qualified = gamesCount >= 25;
          break;
        case 'daily_challenger':
          qualified = state.dailyStatus?.completed === true;
          break;
        case 'high_achiever':
          qualified = levelInfo.level >= 5;
          break;
        case 'lightning_reflexes': {
          // If reaction best is recorded and under 250ms
          qualified = state.bestScores.reactionTime > 0 && state.bestScores.reactionTime <= 250;
          break;
        }
        case 'century_club':
          qualified = state.totalXP >= 1000;
          break;
      }

      if (qualified) {
        state.achievements[ach.id] = {
          unlockedDate: getTodayString()
        };
        state.totalXP += ach.xp;
        unlockedNow.push(ach);
      }
    });

    if (unlockedNow.length > 0) {
      saveState();
      unlockedNow.forEach(ach => showAchievementToast(ach));
      renderHeaderStats();
    }
  }

  function showAchievementToast(ach) {
    Sound.levelUp();
    const toast = document.getElementById('achievement-toast');
    const icon = document.getElementById('toast-icon');
    const title = document.getElementById('toast-title');
    const desc = document.getElementById('toast-desc');

    if (!toast) return;
    icon.textContent = ach.icon;
    title.textContent = ach.title;
    desc.textContent = `${ach.desc} (+${ach.xp} XP)`;

    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4200);
  }

  // =========================================================================
  // 6. UI RENDER & CONTROLLER HOOKS
  // =========================================================================
  function renderHeaderStats() {
    const levelInfo = calculateLevel(state.totalXP);
    state.playerLevel = levelInfo.level;

    // Header Pills
    const headerStreak = document.getElementById('header-streak-count');
    const headerLevel = document.getElementById('header-level-count');
    const ribbonText = document.getElementById('ribbon-text');

    if (headerStreak) headerStreak.textContent = state.streak;
    if (headerLevel) headerLevel.textContent = levelInfo.level;
    if (ribbonText) {
      ribbonText.textContent = state.streak > 0
        ? `Daily Streak: ${state.streak} ${state.streak === 1 ? 'day' : 'days'} strong! Complete your session to maintain it.`
        : 'Begin your training journey today to ignite your daily cognitive streak!';
    }

    // Hero Stats
    const heroName = document.getElementById('hero-player-name');
    const heroLevelBadge = document.getElementById('player-level-badge');
    const heroCurrentXP = document.getElementById('hero-current-xp');
    const heroNextLevelXP = document.getElementById('hero-next-level-xp');
    const heroXPFill = document.getElementById('hero-xp-fill');
    const heroStreak = document.getElementById('hero-streak-display');
    const heroAccuracy = document.getElementById('hero-accuracy-display');
    const heroGames = document.getElementById('hero-games-played-display');
    const heroBadges = document.getElementById('hero-badges-display');

    if (heroName) heroName.textContent = state.playerName;
    if (heroLevelBadge) heroLevelBadge.textContent = `Level ${levelInfo.level}`;
    if (heroCurrentXP) heroCurrentXP.textContent = levelInfo.xpIntoLevel;
    if (heroNextLevelXP) heroNextLevelXP.textContent = levelInfo.xpNeededForLevel;
    if (heroXPFill) heroXPFill.style.width = `${levelInfo.pct}%`;
    if (heroStreak) heroStreak.textContent = state.streak;

    const totalGames = state.history.length;
    let avgAcc = 0;
    if (totalGames > 0) {
      const sumAcc = state.history.reduce((acc, h) => acc + (h.accuracy || 0), 0);
      avgAcc = Math.round(sumAcc / totalGames);
    }
    if (heroAccuracy) heroAccuracy.textContent = `${avgAcc}%`;
    if (heroGames) heroGames.textContent = totalGames;

    const unlockedCount = Object.keys(state.achievements).length;
    if (heroBadges) heroBadges.textContent = `${unlockedCount}/${ACHIEVEMENTS_DEF.length}`;
  }

  function renderDashboardHighlights() {
    const dailyConf = getDailyChallengeConfig();
    const isCompleted = state.dailyStatus?.completed && state.dailyStatus.date === dailyConf.date;

    const dTitle = document.getElementById('dash-daily-title');
    const dDate = document.getElementById('dash-daily-date');
    const dDesc = document.getElementById('dash-daily-desc');
    const dBtn = document.getElementById('dash-daily-play-btn');
    const dBtnText = document.getElementById('dash-daily-btn-text');

    if (dTitle) dTitle.textContent = `${dailyConf.gameName} Protocol`;
    if (dDate) dDate.textContent = `Daily Quest • ${dailyConf.date}`;
    if (dDesc) dDesc.textContent = dailyConf.instructions;
    if (dBtnText) dBtnText.textContent = isCompleted ? 'Completed ✓' : 'Accept Quest';
    if (dBtn) {
      dBtn.disabled = isCompleted;
      if (isCompleted) dBtn.classList.add('btn-outline');
    }

    // Recommended Game Calculation (picks least played or lowest score)
    let recGame = GAMES[0];
    let minPlayed = Infinity;
    GAMES.forEach(g => {
      const played = state.gameStats[g.id]?.played || 0;
      if (played < minPlayed) {
        minPlayed = played;
        recGame = g;
      }
    });

    const recTitle = document.getElementById('dash-rec-title');
    const recReason = document.getElementById('dash-rec-reason');
    const recDesc = document.getElementById('dash-rec-desc');
    const recIcon = document.getElementById('dash-rec-icon');
    const recPB = document.getElementById('dash-rec-pb');
    const recBtn = document.getElementById('dash-rec-play-btn');

    if (recTitle) recTitle.textContent = recGame.name;
    if (recReason) recReason.textContent = `Target: ${recGame.faculty}`;
    if (recDesc) recDesc.textContent = recGame.desc;
    if (recIcon) recIcon.textContent = recGame.icon;
    if (recPB) {
      const pb = state.bestScores[recGame.id] || 0;
      recPB.textContent = recGame.id === 'reactionTime' && pb > 0 ? `${pb} ms` : `${pb} pts`;
    }
    if (recBtn) {
      recBtn.onclick = () => openGame(recGame.id);
    }
  }

  function renderGameCards() {
    const dashGrid = document.getElementById('dashboard-games-grid');
    const fullGrid = document.getElementById('full-games-grid');

    function createCardHTML(game) {
      const pbVal = state.bestScores[game.id] || 0;
      const pbString = game.id === 'reactionTime' && pbVal > 0 ? `${pbVal} ms` : `${pbVal} pts`;

      return `
        <div class="game-module-card ${game.themeClass}" data-category="${game.category}" id="card-${game.id}">
          <div class="game-card-top">
            <div class="game-icon-box" aria-hidden="true">${game.icon}</div>
            <span class="faculty-badge">${game.faculty}</span>
          </div>
          <h3 class="game-title">${game.name}</h3>
          <p class="game-desc">${game.desc}</p>
          <div class="game-meta-row">
            <span class="diff-indicator"><span class="diff-dot"></span> ${game.difficultyLabel}</span>
            <span class="pb-score-text">Best: ${pbString}</span>
          </div>
          <button class="btn btn-primary game-card-btn" onclick="window.NeuroQuest.openGame('${game.id}')">
            <span>Play Now ⚡</span>
          </button>
        </div>
      `;
    }

    const cardsMarkup = GAMES.map(createCardHTML).join('');
    if (dashGrid) dashGrid.innerHTML = cardsMarkup;
    if (fullGrid) fullGrid.innerHTML = cardsMarkup;
  }

  function renderRecentHistoryList() {
    const dashList = document.getElementById('dash-recent-list');
    if (!dashList) return;

    if (!state.history || state.history.length === 0) {
      dashList.innerHTML = '<div class="empty-state-notice">No games completed yet. Start your first session above!</div>';
      return;
    }

    const recents = state.history.slice(0, 4);
    dashList.innerHTML = recents.map(item => `
      <div class="recent-item-pill">
        <span class="recent-game-name">
          <span>${item.gameIcon || '🧠'}</span>
          <strong>${item.gameTitle}</strong>
        </span>
        <span class="recent-score-val">${item.score} pts</span>
        <span class="badge-pill pill-success">${item.accuracy}% Acc</span>
        <span class="text-muted" style="font-size: 0.78rem;">${item.date}</span>
      </div>
    `).join('');
  }

  function renderDailySection() {
    const dailyConf = getDailyChallengeConfig();
    const isCompleted = state.dailyStatus?.completed && state.dailyStatus.date === dailyConf.date;

    const badge = document.getElementById('daily-status-badge');
    const icon = document.getElementById('daily-module-icon');
    const dateStamp = document.getElementById('daily-date-stamp');
    const missionTitle = document.getElementById('daily-mission-title');
    const instructions = document.getElementById('daily-mission-instructions');
    const targetText = document.getElementById('daily-target-text');
    const streakNum = document.getElementById('daily-streak-number');
    const startBtn = document.getElementById('daily-start-quest-btn');

    if (badge) {
      badge.textContent = isCompleted ? 'Completed Today ✓' : 'Pending Today';
      badge.className = isCompleted ? 'daily-hero-badge badge-completed' : 'daily-hero-badge';
    }
    if (icon) icon.textContent = dailyConf.gameIcon;
    if (dateStamp) dateStamp.textContent = `Today's Protocol • ${dailyConf.date}`;
    if (missionTitle) missionTitle.textContent = `${dailyConf.gameName} Master Challenge`;
    if (instructions) instructions.textContent = dailyConf.instructions;
    if (targetText) {
      targetText.textContent = dailyConf.gameId === 'reactionTime'
        ? `Reaction Time < ${dailyConf.targetScore} ms`
        : `Attain Score ≥ ${dailyConf.targetScore} pts`;
    }
    if (streakNum) streakNum.textContent = state.streak;

    if (startBtn) {
      startBtn.disabled = isCompleted;
      startBtn.onclick = () => openGame(dailyConf.gameId, state.difficulty, true);
    }
  }

  function renderAnalyticsSection() {
    const totalXP = document.getElementById('analytics-total-xp');
    const level = document.getElementById('analytics-level');
    const accuracy = document.getElementById('analytics-accuracy');
    const games = document.getElementById('analytics-total-games');
    const streak = document.getElementById('analytics-streak');

    const totalGames = state.history.length;
    let avgAcc = 0;
    if (totalGames > 0) {
      const sumAcc = state.history.reduce((a, b) => a + (b.accuracy || 0), 0);
      avgAcc = Math.round(sumAcc / totalGames);
    }

    if (totalXP) totalXP.textContent = `${state.totalXP} XP`;
    if (level) level.textContent = `Level ${calculateLevel(state.totalXP).level}`;
    if (accuracy) accuracy.textContent = `${avgAcc}%`;
    if (games) games.textContent = totalGames;
    if (streak) streak.textContent = `${state.streak} Days`;

    // Strongest & Growth game analysis
    const strongestEl = document.getElementById('insight-strongest');
    const practiceEl = document.getElementById('insight-practice');

    let maxScoreGame = null;
    let maxRatio = -1;
    let minScoreGame = null;
    let minRatio = Infinity;

    GAMES.forEach(g => {
      const pb = state.bestScores[g.id] || 0;
      const benchmark = g.id === 'reactionTime' ? (pb > 0 ? (500 - pb) / 300 : 0) : pb / 800;
      if (benchmark > maxRatio) {
        maxRatio = benchmark;
        maxScoreGame = g;
      }
      if (benchmark < minRatio) {
        minRatio = benchmark;
        minScoreGame = g;
      }
    });

    if (strongestEl) {
      strongestEl.innerHTML = maxScoreGame && maxRatio > 0
        ? `<strong>Primary Strength:</strong> Exceptional aptitude in <em>${maxScoreGame.name}</em> (${maxScoreGame.faculty}).`
        : `<strong>Primary Strength:</strong> Play more rounds to benchmark your cognitive peak.`;
    }

    if (practiceEl) {
      practiceEl.innerHTML = minScoreGame
        ? `<strong>Target for Growth:</strong> Focus on <em>${minScoreGame.name}</em> to enhance neuroplastic versatility.`
        : `<strong>Target for Growth:</strong> Daily multi-faculty training optimizes overall cognitive stamina.`;
    }

    // Personal Bests List
    const pbContainer = document.getElementById('personal-bests-container');
    if (pbContainer) {
      pbContainer.innerHTML = GAMES.map(g => {
        const val = state.bestScores[g.id] || 0;
        const displayVal = g.id === 'reactionTime' && val > 0 ? `${val} ms` : `${val} pts`;
        const pct = g.id === 'reactionTime'
          ? (val > 0 ? Math.min(100, Math.max(10, Math.round(((450 - val) / 250) * 100))) : 0)
          : Math.min(100, Math.round((val / 1000) * 100));

        return `
          <div class="pb-row">
            <div class="pb-info">
              <span>${g.icon} ${g.name}</span>
              <strong>${displayVal}</strong>
            </div>
            <div class="pb-bar-track">
              <div class="pb-bar-fill" style="width: ${pct}%;"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    // Session History Table
    const tableBody = document.getElementById('history-table-body');
    const countEl = document.getElementById('history-total-count');
    if (countEl) countEl.textContent = `${state.history.length} sessions recorded`;

    if (tableBody) {
      if (state.history.length === 0) {
        tableBody.innerHTML = `
          <tr>
            <td colspan="6" class="table-empty-cell">No training sessions recorded yet. Play a game to record your performance!</td>
          </tr>
        `;
      } else {
        tableBody.innerHTML = state.history.map(item => `
          <tr>
            <td>${item.date}</td>
            <td><strong>${item.gameIcon || '🧠'} ${item.gameTitle}</strong></td>
            <td><span style="text-transform: capitalize;">${item.difficulty || 'Normal'}</span></td>
            <td><strong class="text-amber">${item.score}</strong></td>
            <td>${item.accuracy}%</td>
            <td><span class="badge-pill pill-success">${item.outcome || 'Completed'}</span></td>
          </tr>
        `).join('');
      }
    }

    // Draw Radar Chart on Canvas
    drawCognitiveRadar();
  }

  function drawCognitiveRadar() {
    const canvas = document.getElementById('cognitive-radar-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 48;
    const numAxes = GAMES.length;
    const angleStep = (Math.PI * 2) / numAxes;

    // Draw Polygon Webs (Tiers: 0.25, 0.5, 0.75, 1.0)
    const tiers = [0.25, 0.5, 0.75, 1.0];
    tiers.forEach(tier => {
      ctx.beginPath();
      for (let i = 0; i < numAxes; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * (radius * tier);
        const y = centerY + Math.sin(angle) * (radius * tier);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = state.theme === 'dark' ? 'rgba(167, 139, 250, 0.2)' : 'rgba(139, 92, 246, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw Axes & Labels
    GAMES.forEach((game, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = state.theme === 'dark' ? 'rgba(167, 139, 250, 0.25)' : 'rgba(139, 92, 246, 0.25)';
      ctx.stroke();

      // Axis label
      const labelX = centerX + Math.cos(angle) * (radius + 24);
      const labelY = centerY + Math.sin(angle) * (radius + 24);

      ctx.font = '600 11px Outfit, sans-serif';
      ctx.fillStyle = state.theme === 'dark' ? '#D4C6E5' : '#625373';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(game.faculty, labelX, labelY);
    });

    // Calculate normalized values for each game (0.1 to 1.0)
    const values = GAMES.map(g => {
      const pb = state.bestScores[g.id] || 0;
      if (g.id === 'reactionTime') {
        if (!pb || pb === 0) return 0.2;
        return Math.max(0.2, Math.min(1.0, (450 - pb) / 250));
      }
      return Math.max(0.2, Math.min(1.0, pb / 800));
    });

    // Draw Data Polygon Fill
    ctx.beginPath();
    values.forEach((val, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * (radius * val);
      const y = centerY + Math.sin(angle) * (radius * val);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.closePath();

    ctx.fillStyle = 'rgba(236, 72, 153, 0.35)'; // Magenta translucent
    ctx.fill();
    ctx.strokeStyle = '#EC4899'; // Magenta outline
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Data points (dots)
    values.forEach((val, i) => {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * (radius * val);
      const y = centerY + Math.sin(angle) * (radius * val);

      ctx.beginPath();
      ctx.arc(x, y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = '#FBBF24'; // Golden Amber vertex
      ctx.fill();
      ctx.strokeStyle = '#8B5CF6'; // Purple ring
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }

  function renderAchievementsSection() {
    const container = document.getElementById('badges-container');
    const ratioEl = document.getElementById('badges-unlocked-ratio');
    const pctEl = document.getElementById('badges-unlocked-pct');
    const fillEl = document.getElementById('badges-progress-fill');

    const total = ACHIEVEMENTS_DEF.length;
    const unlocked = Object.keys(state.achievements).length;
    const pct = Math.round((unlocked / total) * 100);

    if (ratioEl) ratioEl.textContent = `${unlocked} / ${total}`;
    if (pctEl) pctEl.textContent = `${pct}% Completed`;
    if (fillEl) fillEl.style.width = `${pct}%`;

    if (!container) return;
    container.innerHTML = ACHIEVEMENTS_DEF.map(ach => {
      const isUnlocked = !!state.achievements[ach.id];
      const stamp = isUnlocked
        ? `Unlocked • ${state.achievements[ach.id].unlockedDate || 'Active'}`
        : 'Locked 🔒';

      return `
        <div class="badge-card ${isUnlocked ? 'unlocked' : 'locked'}" id="ach-${ach.id}">
          <div class="badge-icon-disc" aria-hidden="true">${ach.icon}</div>
          <h3 class="badge-title">${ach.title}</h3>
          <p class="badge-desc">${ach.desc}</p>
          <span class="badge-reward-tag">+${ach.xp} XP</span>
          <div class="badge-status-stamp">${stamp}</div>
        </div>
      `;
    }).join('');
  }

  function renderSettingsSection() {
    const nameInput = document.getElementById('player-name-input');
    if (nameInput) nameInput.value = state.playerName;

    const soundSwitch = document.getElementById('sound-toggle-switch');
    if (soundSwitch) soundSwitch.checked = state.soundEnabled;

    // Difficulty Segmented Control
    const diffBtns = document.querySelectorAll('#difficulty-control .segment-btn');
    diffBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.diff === state.difficulty);
    });

    // Theme Segmented Control
    const themeBtns = document.querySelectorAll('#theme-control .segment-btn');
    themeBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === state.theme);
    });
  }

  // =========================================================================
  // 7. NAVIGATION & SPA ROUTER
  // =========================================================================
  function navigateTo(sectionId) {
    Sound.click();
    const sections = document.querySelectorAll('.app-section');
    sections.forEach(sec => sec.classList.remove('active-section'));

    const targetSec = document.getElementById(sectionId);
    if (targetSec) {
      targetSec.classList.add('active-section');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Update nav links
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    navLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.target === sectionId);
    });

    // Close mobile drawer if open
    closeMobileDrawer();

    // Section specific renders
    if (sectionId === 'progress-section') renderAnalyticsSection();
    if (sectionId === 'achievements-section') renderAchievementsSection();
    if (sectionId === 'daily-section') renderDailySection();
    if (sectionId === 'dashboard-section') {
      renderHeaderStats();
      renderDashboardHighlights();
      renderRecentHistoryList();
    }
  }

  function openMobileDrawer() {
    Sound.click();
    document.getElementById('mobile-drawer')?.classList.add('active');
    document.getElementById('mobile-drawer-overlay')?.classList.add('active');
  }

  function closeMobileDrawer() {
    document.getElementById('mobile-drawer')?.classList.remove('active');
    document.getElementById('mobile-drawer-overlay')?.classList.remove('active');
  }

  function toggleTheme(forcedTheme) {
    Sound.click();
    state.theme = forcedTheme || (state.theme === 'dark' ? 'light' : 'dark');
    document.body.className = state.theme === 'dark' ? 'theme-dark' : 'theme-light';

    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) themeIcon.textContent = state.theme === 'dark' ? '🌙' : '☀️';

    renderSettingsSection();
    saveState();

    if (document.getElementById('progress-section')?.classList.contains('active-section')) {
      drawCognitiveRadar();
    }
  }

  function toggleSound() {
    state.soundEnabled = !state.soundEnabled;
    Sound.click();
    const soundIcon = document.getElementById('sound-icon');
    const arenaSound = document.getElementById('arena-sound-toggle-btn');
    const soundSwitch = document.getElementById('sound-toggle-switch');

    const iconTxt = state.soundEnabled ? '🔊' : '🔇';
    if (soundIcon) soundIcon.textContent = iconTxt;
    if (arenaSound) arenaSound.textContent = iconTxt;
    if (soundSwitch) soundSwitch.checked = state.soundEnabled;

    saveState();
  }

  // =========================================================================
  // 8. GAME ARENA COMMON LIFECYCLE
  // =========================================================================
  function openGame(gameId, customDifficulty, isDaily = false) {
    Sound.click();
    const game = GAMES.find(g => g.id === gameId);
    if (!game) return;

    // Reset previous timers
    cleanupGameTimers();

    const effDifficulty = customDifficulty || state.difficulty;

    activeGame = {
      id: game.id,
      title: game.name,
      icon: game.icon,
      faculty: game.faculty,
      difficulty: effDifficulty,
      isDaily: isDaily,
      score: 0,
      round: 1,
      maxRounds: 5,
      streak: 0,
      maxStreak: 0,
      hits: 0,
      misses: 0,
      timerSec: 0,
      startTime: Date.now(),
      finished: false
    };

    // Update Arena Header
    document.getElementById('arena-game-icon').textContent = game.icon;
    document.getElementById('arena-game-title').textContent = game.name;
    document.getElementById('arena-difficulty-tag').textContent = effDifficulty.toUpperCase();
    updateLiveMetrics(0, '--', '1/5', '0🔥');

    const overlay = document.getElementById('game-arena-overlay');
    if (overlay) overlay.classList.add('active');

    // Route to Game Start View
    renderGameIntro(game, effDifficulty);
  }

  function updateLiveMetrics(score, timer, round, streak) {
    const sEl = document.getElementById('arena-live-score');
    const tEl = document.getElementById('arena-live-timer');
    const rEl = document.getElementById('arena-live-round');
    const kEl = document.getElementById('arena-live-streak');

    if (sEl && score !== undefined) sEl.textContent = score;
    if (tEl && timer !== undefined) tEl.textContent = timer;
    if (rEl && round !== undefined) rEl.textContent = round;
    if (kEl && streak !== undefined) kEl.textContent = streak;
  }

  function closeGameArena() {
    Sound.click();
    cleanupGameTimers();
    activeGame = null;
    const overlay = document.getElementById('game-arena-overlay');
    if (overlay) overlay.classList.remove('active');
  }

  function cleanupGameTimers() {
    if (activeInterval) {
      clearInterval(activeInterval);
      activeInterval = null;
    }
    if (activeTimeout) {
      clearTimeout(activeTimeout);
      activeTimeout = null;
    }
  }

  function finishGame() {
    if (!activeGame || activeGame.finished) return;
    activeGame.finished = true;
    cleanupGameTimers();

    const totalAttempts = activeGame.hits + activeGame.misses;
    const accuracy = totalAttempts > 0 ? Math.round((activeGame.hits / totalAttempts) * 100) : 100;
    const finalScore = Math.max(0, activeGame.score);

    // Calculate XP
    let xpEarned = Math.round(finalScore * 0.25) + 30;
    if (accuracy >= 90) xpEarned += 25;
    if (accuracy === 100) xpEarned += 50;

    // Personal Best Check
    const prevPB = state.bestScores[activeGame.id] || 0;
    let isNewPB = false;
    if (activeGame.id === 'reactionTime') {
      if (prevPB === 0 || finalScore < prevPB) {
        state.bestScores[activeGame.id] = finalScore;
        isNewPB = true;
        xpEarned += 75;
      }
    } else {
      if (finalScore > prevPB) {
        state.bestScores[activeGame.id] = finalScore;
        isNewPB = true;
        xpEarned += 75;
      }
    }

    // Daily Challenge Evaluation
    const dailyConf = getDailyChallengeConfig();
    let completedDaily = false;
    if (activeGame.isDaily && !state.dailyStatus.completed) {
      const conditionMet = activeGame.id === 'reactionTime'
        ? finalScore <= dailyConf.targetScore
        : finalScore >= dailyConf.targetScore;

      if (conditionMet) {
        state.dailyStatus.completed = true;
        xpEarned += dailyConf.rewardXP;
        completedDaily = true;
      }
    }

    // Update Overall Stats
    state.totalXP += xpEarned;
    const gStats = state.gameStats[activeGame.id] || { played: 0, totalScore: 0, totalAccuracy: 0 };
    gStats.played += 1;
    gStats.totalScore += finalScore;
    gStats.totalAccuracy += accuracy;
    state.gameStats[activeGame.id] = gStats;

    // Daily Streak Update
    checkAndUpdateDailyStreak();

    // Log History Session
    const logItem = {
      id: Date.now(),
      gameId: activeGame.id,
      gameTitle: activeGame.title,
      gameIcon: activeGame.icon,
      score: finalScore,
      accuracy: accuracy,
      difficulty: activeGame.difficulty,
      date: getTodayString(),
      outcome: isNewPB ? 'New PB ⭐' : 'Completed'
    };
    state.history.unshift(logItem);
    if (state.history.length > 50) state.history.pop();

    saveState();
    evaluateAchievements();
    renderHeaderStats();

    // Render Game Over Screen
    renderGameResults({
      finalScore,
      xpEarned,
      accuracy,
      isNewPB,
      completedDaily,
      hits: activeGame.hits,
      misses: activeGame.misses,
      maxStreak: activeGame.maxStreak || activeGame.streak
    });
  }

  function renderGameResults(res) {
    Sound.fanfare = Sound.levelUp;
    Sound.fanfare();

    const stage = document.getElementById('arena-stage');
    if (!stage) return;

    stage.innerHTML = `
      <div class="game-results-card">
        <div class="results-trophy">${res.isNewPB ? '🌟' : '🏆'}</div>
        <h2 class="results-title">${res.isNewPB ? 'New Personal Record!' : 'Session Complete!'}</h2>
        <p class="results-subtitle">Precision performance logged in your cognitive cortex profile.</p>

        <div class="results-score-banner">
          <div class="score-big-label">${activeGame.id === 'reactionTime' ? 'Average Reaction Latency' : 'Final Session Score'}</div>
          <div class="score-big-val">${res.finalScore} ${activeGame.id === 'reactionTime' ? 'ms' : 'pts'}</div>
          <div>
            <span class="xp-awarded-pill">⚡ +${res.xpEarned} XP Earned</span>
            ${res.completedDaily ? '<span class="xp-awarded-pill text-amber" style="margin-left: 8px;">👑 Daily Quest Completed! (+200 XP)</span>' : ''}
          </div>
        </div>

        <div class="results-breakdown-grid">
          <div class="results-breakdown-tile">
            <div class="rb-label">ACCURACY</div>
            <div class="rb-val text-emerald">${res.accuracy}%</div>
          </div>
          <div class="results-breakdown-tile">
            <div class="rb-label">MAX STREAK</div>
            <div class="rb-val text-coral">${res.maxStreak} 🔥</div>
          </div>
          <div class="results-breakdown-tile">
            <div class="rb-label">TOTAL ACTIONS</div>
            <div class="rb-val text-magenta">${res.hits + res.misses}</div>
          </div>
        </div>

        <div class="results-actions">
          <button class="btn btn-primary" onclick="window.NeuroQuest.openGame('${activeGame.id}', '${activeGame.difficulty}', ${activeGame.isDaily})">
            <span>🔄 Train Again</span>
          </button>
          <button class="btn btn-outline" onclick="window.NeuroQuest.closeGameArena()">
            <span>Dashboard 📊</span>
          </button>
        </div>
      </div>
    `;
  }

  function renderGameIntro(game, difficulty) {
    const stage = document.getElementById('arena-stage');
    if (!stage) return;

    const instructionsMap = {
      memoryMatrix: {
        rules: [
          'A matrix of tiles will briefly illuminate in purple & magenta.',
          'Memorize their spatial coordinates before they flip back.',
          'Select the exact target tiles to complete each round.',
          'Each round increases grid dimensions and requires higher recall.'
        ]
      },
      numberSequence: {
        rules: [
          'Analyze the numerical sequence to discern the underlying progression rule.',
          'Select the correct missing term from 4 candidate solutions.',
          'A detailed mathematical breakdown is provided after each response.',
          'Earn bonus score multipliers for consecutive correct solutions.'
        ]
      },
      focusMaster: {
        rules: [
          'Read the designated mission target (color + geometric symbol).',
          'Scan the visual sensory field and click all matching targets.',
          'Avoid distractors that share partial characteristics.',
          'Complete all targets before the 30-second timer elapses.'
        ]
      },
      logicLab: {
        rules: [
          'Evaluate deductive arguments, syllogisms, and categorical oddities.',
          'Select the logical conclusion from four distinct possibilities.',
          'Receive instant logical reasoning explanations.',
          'Practice structured critical problem-solving.'
        ]
      },
      quickCalc: {
        rules: [
          'Solve rapid arithmetic problems within a 45-second blitz.',
          'Type your numerical answer using your keyboard (Enter) or screen numpad.',
          'Chain combos together to achieve 2×, 3×, and 4× streak multipliers.',
          'Division always yields clean, whole numbers.'
        ]
      },
      reactionTime: {
        rules: [
          'Wait patiently while the stimulus card remains deep violet.',
          'When the card suddenly flashes EMERALD GREEN, click immediately!',
          'Clicking before green triggers a false start penalty.',
          'Your final score is the average of 5 precision reflex trials.'
        ]
      }
    };

    const rules = instructionsMap[game.id]?.rules || ['Follow on-screen prompts.'];

    stage.innerHTML = `
      <div class="game-intro-card">
        <div class="intro-icon">${game.icon}</div>
        <h2 class="intro-title">${game.name}</h2>
        <p class="intro-instructions">${game.desc}</p>
        <ul class="intro-rules-list">
          ${rules.map(r => `<li><strong>•</strong> ${r}</li>`).join('')}
        </ul>
        <button class="btn btn-primary btn-lg" id="intro-start-btn">
          <span>🚀 Begin Exercise</span>
        </button>
      </div>
    `;

    document.getElementById('intro-start-btn').onclick = () => {
      Sound.click();
      startGameEngine(game.id);
    };
  }

  // =========================================================================
  // 9. GAME ENGINES IMPLEMENTATION
  // =========================================================================
  function startGameEngine(gameId) {
    switch (gameId) {
      case 'memoryMatrix':
        startMemoryMatrix();
        break;
      case 'numberSequence':
        startNumberSequence();
        break;
      case 'focusMaster':
        startFocusMaster();
        break;
      case 'logicLab':
        startLogicLab();
        break;
      case 'quickCalc':
        startQuickCalc();
        break;
      case 'reactionTime':
        startReactionTime();
        break;
    }
  }

  // -------------------------------------------------------------------------
  // GAME 1: MEMORY MATRIX
  // -------------------------------------------------------------------------
  function startMemoryMatrix() {
    activeGame.round = 1;
    activeGame.maxRounds = 5;
    activeGame.score = 0;
    activeGame.hits = 0;
    activeGame.misses = 0;
    activeGame.streak = 0;

    nextMemoryRound();
  }

  function nextMemoryRound() {
    cleanupGameTimers();
    if (activeGame.round > activeGame.maxRounds) {
      finishGame();
      return;
    }

    // Grid size determination based on difficulty & round
    let size = 3;
    let targetCount = 3;

    if (activeGame.difficulty === 'easy') {
      size = activeGame.round <= 2 ? 3 : 4;
      targetCount = activeGame.round + 2;
    } else if (activeGame.difficulty === 'hard') {
      size = activeGame.round <= 2 ? 4 : (activeGame.round <= 4 ? 5 : 6);
      targetCount = activeGame.round + 4;
    } else { // medium & adaptive
      size = activeGame.round === 1 ? 3 : (activeGame.round <= 3 ? 4 : 5);
      targetCount = activeGame.round + 3;
    }

    const totalTiles = size * size;
    targetCount = Math.min(targetCount, Math.floor(totalTiles * 0.45));

    // Pick unique targets
    const targets = new Set();
    while (targets.size < targetCount) {
      targets.add(Math.floor(Math.random() * totalTiles));
    }

    const stage = document.getElementById('arena-stage');
    if (!stage) return;

    updateLiveMetrics(activeGame.score, '--', `${activeGame.round}/${activeGame.maxRounds}`, `${activeGame.streak}🔥`);

    stage.innerHTML = `
      <div class="matrix-container">
        <div class="matrix-status-bar" id="matrix-status-text">Memorize illuminated tiles...</div>
        <div class="matrix-grid" id="matrix-grid" style="grid-template-columns: repeat(${size}, 1fr);">
          ${Array.from({ length: totalTiles }, (_, i) => `
            <div class="matrix-tile locked" data-index="${i}"></div>
          `).join('')}
        </div>
      </div>
    `;

    const tiles = document.querySelectorAll('.matrix-tile');
    const statusText = document.getElementById('matrix-status-text');

    // Illuminate target tiles
    targets.forEach(idx => {
      tiles[idx]?.classList.add('highlighted');
    });

    Sound.tick();

    // Hide highlights after 1.6s and enable player interaction
    activeTimeout = setTimeout(() => {
      tiles.forEach(tile => {
        tile.classList.remove('highlighted');
        tile.classList.remove('locked');
      });
      if (statusText) statusText.textContent = `Select the ${targetCount} highlighted tiles!`;

      let selectedCount = 0;
      let roundMistakes = 0;
      const clickedIndices = new Set();

      tiles.forEach(tile => {
        tile.onclick = () => {
          const idx = parseInt(tile.dataset.index, 10);
          if (clickedIndices.has(idx) || tile.classList.contains('locked')) return;
          clickedIndices.add(idx);

          if (targets.has(idx)) {
            tile.classList.add('correct');
            tile.textContent = '✓';
            Sound.correct();
            activeGame.hits++;
            activeGame.streak++;
            activeGame.maxStreak = Math.max(activeGame.maxStreak || 0, activeGame.streak);
            activeGame.score += 100 + (activeGame.streak * 15);
            selectedCount++;
          } else {
            tile.classList.add('wrong');
            tile.textContent = '✕';
            Sound.wrong();
            activeGame.misses++;
            activeGame.streak = 0;
            activeGame.score = Math.max(0, activeGame.score - 40);
            roundMistakes++;
          }

          updateLiveMetrics(activeGame.score, '--', `${activeGame.round}/${activeGame.maxRounds}`, `${activeGame.streak}🔥`);

          // Check if round complete
          if (selectedCount === targetCount || roundMistakes >= 3) {
            tiles.forEach(t => t.classList.add('locked'));
            if (statusText) {
              statusText.textContent = selectedCount === targetCount ? 'Pattern Matched! ⭐' : 'Too Many Mistakes! ⚠️';
            }
            activeTimeout = setTimeout(() => {
              activeGame.round++;
              nextMemoryRound();
            }, 1200);
          }
        };
      });
    }, 1600);
  }

  // -------------------------------------------------------------------------
  // GAME 2: NUMBER SEQUENCE
  // -------------------------------------------------------------------------
  function startNumberSequence() {
    activeGame.round = 1;
    activeGame.maxRounds = 6;
    activeGame.score = 0;
    activeGame.hits = 0;
    activeGame.misses = 0;
    activeGame.streak = 0;

    nextSequenceRound();
  }

  function generateNumberSequence(round, diff) {
    const patterns = [
      // 1. Addition
      () => {
        const step = Math.floor(Math.random() * 7) + 3;
        const start = Math.floor(Math.random() * 20) + 2;
        const seq = [start, start + step, start + step * 2, start + step * 3, start + step * 4];
        return {
          seq: [seq[0], seq[1], seq[2], seq[3]],
          target: seq[4],
          type: 'Arithmetic Progression',
          explanation: `Each number increases by +${step} (${seq[3]} + ${step} = ${seq[4]}).`
        };
      },
      // 2. Subtraction
      () => {
        const step = Math.floor(Math.random() * 6) + 3;
        const start = Math.floor(Math.random() * 30) + 40;
        const seq = [start, start - step, start - step * 2, start - step * 3, start - step * 4];
        return {
          seq: [seq[0], seq[1], seq[2], seq[3]],
          target: seq[4],
          type: 'Decelerating Sequence',
          explanation: `Each number decreases by -${step} (${seq[3]} - ${step} = ${seq[4]}).`
        };
      },
      // 3. Multiplication / Geometric
      () => {
        const factor = 2;
        const start = Math.floor(Math.random() * 5) + 2;
        const seq = [start, start * 2, start * 4, start * 8, start * 16];
        return {
          seq: [seq[0], seq[1], seq[2], seq[3]],
          target: seq[4],
          type: 'Geometric Ratio',
          explanation: `Each term is multiplied by ×${factor} (${seq[3]} × 2 = ${seq[4]}).`
        };
      },
      // 4. Alternating arithmetic
      () => {
        const add = Math.floor(Math.random() * 4) + 4;
        const sub = Math.floor(Math.random() * 2) + 2;
        const start = 10;
        const seq = [start, start + add, start + add - sub, start + add - sub + add, start + add - sub + add - sub];
        return {
          seq: [seq[0], seq[1], seq[2], seq[3]],
          target: seq[4],
          type: 'Alternating Operations',
          explanation: `The pattern alternates between +${add} and -${sub} (${seq[3]} - ${sub} = ${seq[4]}).`
        };
      },
      // 5. Quadratic / Squares
      () => {
        const offset = Math.floor(Math.random() * 3) + 1;
        const seq = [1 + offset, 4 + offset, 9 + offset, 16 + offset, 25 + offset];
        return {
          seq: [seq[0], seq[1], seq[2], seq[3]],
          target: seq[4],
          type: 'Exponential Step',
          explanation: `Terms follow n² + ${offset}: 1²+${offset}, 2²+${offset}, 3²+${offset}, 4²+${offset}, 5²+${offset} = ${seq[4]}.`
        };
      },
      // 6. Fibonacci Variation
      () => {
        const a = Math.floor(Math.random() * 3) + 1;
        const b = Math.floor(Math.random() * 3) + 2;
        const c = a + b;
        const d = b + c;
        const e = c + d;
        return {
          seq: [a, b, c, d],
          target: e,
          type: 'Additive Sum (Fibonacci)',
          explanation: `Each number is the sum of the previous two (${c} + ${d} = ${e}).`
        };
      }
    ];

    const picker = patterns[Math.floor(Math.random() * patterns.length)];
    const result = picker();

    // Create 4 believable candidate choices
    const choices = new Set([result.target]);
    const offsets = [-2, 2, -1, 1, -4, 4, -stepHelper(result.target), stepHelper(result.target)];
    offsets.forEach(off => {
      if (choices.size < 4 && result.target + off !== result.target && (result.target + off) > 0) {
        choices.add(result.target + off);
      }
    });
    while (choices.size < 4) {
      choices.add(result.target + choices.size * 3);
    }

    result.options = Array.from(choices).sort(() => Math.random() - 0.5);
    return result;
  }

  function stepHelper(n) {
    return Math.floor(Math.random() * 5) + 3;
  }

  function nextSequenceRound() {
    if (activeGame.round > activeGame.maxRounds) {
      finishGame();
      return;
    }

    const data = generateNumberSequence(activeGame.round, activeGame.difficulty);
    const stage = document.getElementById('arena-stage');
    if (!stage) return;

    updateLiveMetrics(activeGame.score, '--', `${activeGame.round}/${activeGame.maxRounds}`, `${activeGame.streak}🔥`);

    stage.innerHTML = `
      <div class="sequence-container">
        <span class="pattern-type-badge">${data.type}</span>
        <div class="sequence-strip">
          ${data.seq.map(n => `<div class="seq-item">${n}</div>`).join('')}
          <div class="seq-item target-slot" id="seq-target-slot">?</div>
        </div>

        <div class="seq-options-grid" id="seq-options-container">
          ${data.options.map(opt => `
            <button class="seq-opt-btn" data-val="${opt}">${opt}</button>
          `).join('')}
        </div>

        <div class="seq-explanation-box" id="seq-explanation" style="display: none;"></div>
      </div>
    `;

    const btns = document.querySelectorAll('.seq-opt-btn');
    const explBox = document.getElementById('seq-explanation');
    const targetSlot = document.getElementById('seq-target-slot');

    btns.forEach(btn => {
      btn.onclick = () => {
        btns.forEach(b => (b.disabled = true));
        const chosen = parseInt(btn.dataset.val, 10);

        if (chosen === data.target) {
          btn.classList.add('correct-choice');
          if (targetSlot) targetSlot.textContent = data.target;
          Sound.correct();
          activeGame.hits++;
          activeGame.streak++;
          activeGame.maxStreak = Math.max(activeGame.maxStreak || 0, activeGame.streak);
          activeGame.score += 150 + (activeGame.streak * 20);
        } else {
          btn.classList.add('wrong-choice');
          btns.forEach(b => {
            if (parseInt(b.dataset.val, 10) === data.target) b.classList.add('correct-choice');
          });
          if (targetSlot) targetSlot.textContent = data.target;
          Sound.wrong();
          activeGame.misses++;
          activeGame.streak = 0;
          activeGame.score = Math.max(0, activeGame.score - 40);
        }

        updateLiveMetrics(activeGame.score, '--', `${activeGame.round}/${activeGame.maxRounds}`, `${activeGame.streak}🔥`);

        if (explBox) {
          explBox.style.display = 'block';
          explBox.innerHTML = `<strong>Explanation:</strong> ${data.explanation}`;
        }

        activeTimeout = setTimeout(() => {
          activeGame.round++;
          nextSequenceRound();
        }, 1800);
      };
    });
  }

  // -------------------------------------------------------------------------
  // GAME 3: FOCUS MASTER (Strictly NO Blue / Cyan)
  // -------------------------------------------------------------------------
  function startFocusMaster() {
    activeGame.score = 0;
    activeGame.hits = 0;
    activeGame.misses = 0;
    activeGame.streak = 0;
    activeGame.timerSec = 30;

    const shapes = [
      { name: 'Stars', icon: '⭐' },
      { name: 'Circles', icon: '⭕' },
      { name: 'Triangles', icon: '🔺' },
      { name: 'Diamonds', icon: '💎' },
      { name: 'Squares', icon: '⬛' },
      { name: 'Hearts', icon: '💖' }
    ];

    function nextFocusWave() {
      if (activeGame.finished) return;

      const targetShape = shapes[Math.floor(Math.random() * shapes.length)];
      const totalCells = 24;
      const targetCount = Math.floor(Math.random() * 4) + 6; // 6 to 9 targets

      const items = [];
      for (let i = 0; i < targetCount; i++) {
        items.push({ shape: targetShape, isTarget: true });
      }
      while (items.length < totalCells) {
        const distractor = shapes[Math.floor(Math.random() * shapes.length)];
        if (distractor.name !== targetShape.name) {
          items.push({ shape: distractor, isTarget: false });
        }
      }

      // Shuffle
      items.sort(() => Math.random() - 0.5);

      const stage = document.getElementById('arena-stage');
      if (!stage) return;

      stage.innerHTML = `
        <div class="focus-container">
          <div class="focus-mission-banner">
            <div class="focus-target-preview">${targetShape.icon}</div>
            <div>
              <div class="focus-instruction-title">Find every ${targetShape.name} (${targetShape.icon})</div>
              <div class="focus-instruction-desc">Remaining Targets: <strong id="focus-remaining-count">${targetCount}</strong></div>
            </div>
          </div>

          <div class="focus-items-grid" id="focus-grid">
            ${items.map((item, idx) => `
              <div class="focus-cell" data-idx="${idx}" data-target="${item.isTarget}">${item.shape.icon}</div>
            `).join('')}
          </div>
        </div>
      `;

      let remaining = targetCount;
      const cells = document.querySelectorAll('.focus-cell');
      const remEl = document.getElementById('focus-remaining-count');

      cells.forEach(cell => {
        cell.onclick = () => {
          if (cell.classList.contains('found')) return;
          const isTarget = cell.dataset.target === 'true';

          if (isTarget) {
            cell.classList.add('found');
            Sound.correct();
            activeGame.hits++;
            activeGame.streak++;
            activeGame.maxStreak = Math.max(activeGame.maxStreak || 0, activeGame.streak);
            activeGame.score += 80 + (activeGame.streak * 10);
            remaining--;
            if (remEl) remEl.textContent = remaining;

            if (remaining === 0) {
              // Wave cleared! Bonus score and launch next wave
              activeGame.score += 200;
              updateLiveMetrics(activeGame.score, `${activeGame.timerSec}s`, 'Wave Clear', `${activeGame.streak}🔥`);
              activeTimeout = setTimeout(nextFocusWave, 500);
            }
          } else {
            cell.classList.add('clicked-wrong');
            Sound.wrong();
            activeGame.misses++;
            activeGame.streak = 0;
            activeGame.score = Math.max(0, activeGame.score - 40);
          }

          updateLiveMetrics(activeGame.score, `${activeGame.timerSec}s`, 'Active', `${activeGame.streak}🔥`);
        };
      });
    }

    // Timer Loop
    nextFocusWave();

    activeInterval = setInterval(() => {
      activeGame.timerSec--;
      if (activeGame.timerSec <= 5) Sound.tick();
      updateLiveMetrics(activeGame.score, `${activeGame.timerSec}s`, 'Active', `${activeGame.streak}🔥`);

      if (activeGame.timerSec <= 0) {
        cleanupGameTimers();
        finishGame();
      }
    }, 1000);
  }

  // -------------------------------------------------------------------------
  // GAME 4: LOGIC LAB
  // -------------------------------------------------------------------------
  const LOGIC_QUESTIONS = [
    {
      category: 'Deductive Syllogism',
      question: 'All squares are rectangles. Some rectangles are red. Which statement is logically certain?',
      options: ['All squares are red', 'Some squares are rectangles', 'No squares are red', 'All rectangles are squares'],
      correct: 1,
      explanation: 'Since ALL squares are rectangles, every individual square must be a rectangle.'
    },
    {
      category: 'Odd One Out',
      question: 'Which of the following does NOT belong to the group?',
      options: ['Prism', 'Cube', 'Triangle', 'Sphere'],
      correct: 2,
      explanation: 'Triangle is a two-dimensional polygon, whereas Prism, Cube, and Sphere are 3D geometric solids.'
    },
    {
      category: 'Directional Logic',
      question: 'If you face North, turn 90° clockwise, then 180° counter-clockwise, what direction are you facing?',
      options: ['East', 'West', 'South', 'North'],
      correct: 1,
      explanation: 'North + 90° clockwise points East. East - 180° counter-clockwise points West.'
    },
    {
      category: 'Comparative Logic',
      question: 'Maya is older than Leo. Ken is younger than Leo. Elena is older than Maya. Who is the youngest?',
      options: ['Maya', 'Leo', 'Ken', 'Elena'],
      correct: 2,
      explanation: 'Order from oldest to youngest: Elena > Maya > Leo > Ken. Ken is strictly the youngest.'
    },
    {
      category: 'Numerical Riddle',
      question: 'A bat and a ball cost $1.10 in total. The bat costs $1.00 more than the ball. How much does the ball cost?',
      options: ['$0.10', '$0.05', '$0.15', '$0.01'],
      correct: 1,
      explanation: 'Let ball = x. Bat = x + $1.00. 2x + 1.00 = 1.10 -> 2x = 0.10 -> x = $0.05 (Bat is $1.05).'
    },
    {
      category: 'Symbol Analogy',
      question: 'Clock is to Time as Thermometer is to:',
      options: ['Mercury', 'Weather', 'Temperature', 'Heat'],
      correct: 2,
      explanation: 'A clock measures time directly; a thermometer measures temperature directly.'
    },
    {
      category: 'Conditional Statement',
      question: 'If it rains, the grass is wet. The grass is dry. What must follow?',
      options: ['It rained recently', 'It did not rain', 'It will rain tomorrow', 'The lawnmower ran'],
      correct: 1,
      explanation: 'Modus Tollens: If P then Q. Not Q, therefore Not P (It did not rain).'
    },
    {
      category: 'Categorical Reasoning',
      question: 'Which word completes the relationship? OAK is to TREE as SALMON is to:',
      options: ['Ocean', 'River', 'Fish', 'Gills'],
      correct: 2,
      explanation: 'Oak is a specific species of Tree; Salmon is a specific species of Fish.'
    }
  ];

  function startLogicLab() {
    activeGame.round = 1;
    activeGame.maxRounds = 5;
    activeGame.score = 0;
    activeGame.hits = 0;
    activeGame.misses = 0;
    activeGame.streak = 0;

    // Pick 5 random questions
    const shuffled = [...LOGIC_QUESTIONS].sort(() => Math.random() - 0.5);
    activeGame.questions = shuffled.slice(0, 5);

    nextLogicRound();
  }

  function nextLogicRound() {
    if (activeGame.round > activeGame.maxRounds) {
      finishGame();
      return;
    }

    const currentQ = activeGame.questions[activeGame.round - 1];
    const stage = document.getElementById('arena-stage');
    if (!stage) return;

    updateLiveMetrics(activeGame.score, '--', `${activeGame.round}/${activeGame.maxRounds}`, `${activeGame.streak}🔥`);

    stage.innerHTML = `
      <div class="logic-container">
        <span class="logic-category-tag">${currentQ.category}</span>
        <div class="logic-question-text">${currentQ.question}</div>

        <div class="logic-options-list" id="logic-opts">
          ${currentQ.options.map((opt, idx) => `
            <button class="logic-opt-btn" data-idx="${idx}">
              <span class="logic-opt-letter">${String.fromCharCode(65 + idx)}</span>
              <span>${opt}</span>
            </button>
          `).join('')}
        </div>

        <div class="seq-explanation-box" id="logic-explanation" style="display: none;"></div>
      </div>
    `;

    const btns = document.querySelectorAll('.logic-opt-btn');
    const explBox = document.getElementById('logic-explanation');

    btns.forEach(btn => {
      btn.onclick = () => {
        btns.forEach(b => (b.disabled = true));
        const chosen = parseInt(btn.dataset.idx, 10);

        if (chosen === currentQ.correct) {
          btn.classList.add('correct-ans');
          Sound.correct();
          activeGame.hits++;
          activeGame.streak++;
          activeGame.maxStreak = Math.max(activeGame.maxStreak || 0, activeGame.streak);
          activeGame.score += 150 + (activeGame.streak * 25);
        } else {
          btn.classList.add('wrong-ans');
          btns[currentQ.correct]?.classList.add('correct-ans');
          Sound.wrong();
          activeGame.misses++;
          activeGame.streak = 0;
          activeGame.score = Math.max(0, activeGame.score - 40);
        }

        updateLiveMetrics(activeGame.score, '--', `${activeGame.round}/${activeGame.maxRounds}`, `${activeGame.streak}🔥`);

        if (explBox) {
          explBox.style.display = 'block';
          explBox.innerHTML = `<strong>Deductive Breakdown:</strong> ${currentQ.explanation}`;
        }

        activeTimeout = setTimeout(() => {
          activeGame.round++;
          nextLogicRound();
        }, 2200);
      };
    });
  }

  // -------------------------------------------------------------------------
  // GAME 5: QUICK CALCULATION
  // -------------------------------------------------------------------------
  function startQuickCalc() {
    activeGame.score = 0;
    activeGame.hits = 0;
    activeGame.misses = 0;
    activeGame.streak = 0;
    activeGame.timerSec = 45;

    const stage = document.getElementById('arena-stage');
    if (!stage) return;

    stage.innerHTML = `
      <div class="calc-container">
        <div class="calc-expression-display" id="calc-expr">--</div>

        <div class="calc-input-wrapper">
          <input type="number" id="calc-input" class="calc-input-field" placeholder="?" autocomplete="off" autofocus>
          <button class="btn btn-primary" id="calc-submit-btn">Enter ↵</button>
        </div>

        <div class="calc-numpad">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, '⌫'].map(k => `
            <button class="numpad-key ${typeof k === 'string' ? 'key-action' : ''}" data-key="${k}">${k}</button>
          `).join('')}
        </div>
      </div>
    `;

    const inputField = document.getElementById('calc-input');
    const submitBtn = document.getElementById('calc-submit-btn');
    const exprDisplay = document.getElementById('calc-expr');
    let currentAnswer = 0;

    function generateProblem() {
      const ops = ['+', '-', '×', '÷'];
      const op = ops[Math.floor(Math.random() * ops.length)];
      let a, b, ans;

      if (op === '+') {
        a = Math.floor(Math.random() * 45) + 12;
        b = Math.floor(Math.random() * 45) + 12;
        ans = a + b;
      } else if (op === '-') {
        a = Math.floor(Math.random() * 50) + 25;
        b = Math.floor(Math.random() * (a - 5)) + 5;
        ans = a - b;
      } else if (op === '×') {
        a = Math.floor(Math.random() * 11) + 3;
        b = Math.floor(Math.random() * 11) + 3;
        ans = a * b;
      } else {
        // Division: guarantee integer
        b = Math.floor(Math.random() * 9) + 2;
        ans = Math.floor(Math.random() * 12) + 2;
        a = b * ans;
      }

      currentAnswer = ans;
      if (exprDisplay) exprDisplay.textContent = `${a} ${op} ${b} =`;
      if (inputField) {
        inputField.value = '';
        inputField.focus();
      }
    }

    function checkAnswer() {
      if (!inputField || inputField.value.trim() === '') return;
      const userVal = parseInt(inputField.value.trim(), 10);
      if (isNaN(userVal)) return;

      if (userVal === currentAnswer) {
        Sound.correct();
        activeGame.hits++;
        activeGame.streak++;
        activeGame.maxStreak = Math.max(activeGame.maxStreak || 0, activeGame.streak);
        activeGame.score += 100 + (activeGame.streak * 15);
      } else {
        Sound.wrong();
        activeGame.misses++;
        activeGame.streak = 0;
        activeGame.score = Math.max(0, activeGame.score - 30);
      }

      updateLiveMetrics(activeGame.score, `${activeGame.timerSec}s`, 'Rapid', `${activeGame.streak}🔥`);
      generateProblem();
    }

    if (submitBtn) submitBtn.onclick = checkAnswer;
    if (inputField) {
      inputField.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          checkAnswer();
        }
      };
    }

    // Numpad Touch Support
    document.querySelectorAll('.numpad-key').forEach(btn => {
      btn.onclick = () => {
        const key = btn.dataset.key;
        if (key === 'C') {
          inputField.value = '';
        } else if (key === '⌫') {
          inputField.value = inputField.value.slice(0, -1);
        } else {
          inputField.value += key;
        }
        inputField.focus();
      };
    });

    generateProblem();

    // Timer
    activeInterval = setInterval(() => {
      activeGame.timerSec--;
      if (activeGame.timerSec <= 5) Sound.tick();
      updateLiveMetrics(activeGame.score, `${activeGame.timerSec}s`, 'Rapid', `${activeGame.streak}🔥`);

      if (activeGame.timerSec <= 0) {
        cleanupGameTimers();
        finishGame();
      }
    }, 1000);
  }

  // -------------------------------------------------------------------------
  // GAME 6: REACTION CHALLENGE
  // -------------------------------------------------------------------------
  function startReactionTime() {
    activeGame.trial = 1;
    activeGame.maxTrials = 5;
    activeGame.trialsData = [];
    activeGame.score = 0; // Will be set to average ms
    activeGame.hits = 0;
    activeGame.misses = 0;

    nextReactionTrial();
  }

  function nextReactionTrial() {
    cleanupGameTimers();
    if (activeGame.trial > activeGame.maxTrials) {
      // Calculate average
      const sum = activeGame.trialsData.reduce((a, b) => a + b, 0);
      activeGame.score = Math.round(sum / activeGame.trialsData.length);
      finishGame();
      return;
    }

    const stage = document.getElementById('arena-stage');
    if (!stage) return;

    updateLiveMetrics(activeGame.score, '--', `${activeGame.trial}/${activeGame.maxTrials}`, '--');

    stage.innerHTML = `
      <div class="reaction-container">
        <div class="reaction-target-card reaction-state-waiting" id="reaction-card">
          <div class="reaction-icon-lg" id="rx-icon">⏳</div>
          <div class="reaction-title-lg" id="rx-title">Wait for EMERALD GREEN...</div>
          <div class="reaction-subtitle-lg" id="rx-sub">Clicking early registers a penalty!</div>
        </div>

        <div class="reaction-trials-bar">
          ${Array.from({ length: activeGame.maxTrials }, (_, i) => `
            <div class="trial-dot ${i < activeGame.trial - 1 ? 'done' : ''}"></div>
          `).join('')}
        </div>
      </div>
    `;

    const card = document.getElementById('reaction-card');
    const icon = document.getElementById('rx-icon');
    const title = document.getElementById('rx-title');
    const sub = document.getElementById('rx-sub');

    let stateStage = 'waiting'; // 'waiting' | 'ready' | 'clicked'
    let triggerTime = 0;

    // Random delay between 1.5s and 4.2s
    const randomDelay = Math.floor(Math.random() * 2700) + 1500;

    activeTimeout = setTimeout(() => {
      if (stateStage !== 'waiting') return;
      stateStage = 'ready';
      triggerTime = performance.now();

      if (card) {
        card.className = 'reaction-target-card reaction-state-trigger';
        icon.textContent = '⚡';
        title.textContent = 'CLICK NOW!';
        sub.textContent = 'Tap or click as fast as possible!';
      }
    }, randomDelay);

    if (card) {
      card.onclick = () => {
        if (stateStage === 'waiting') {
          // Clicked too early!
          stateStage = 'clicked';
          clearTimeout(activeTimeout);
          Sound.wrong();
          activeGame.misses++;

          card.className = 'reaction-target-card reaction-state-early';
          icon.textContent = '⚠️';
          title.textContent = 'Too Early!';
          sub.textContent = 'Wait until the card turns vivid green.';

          setTimeout(() => {
            nextReactionTrial();
          }, 1200);
        } else if (stateStage === 'ready') {
          // Success reaction!
          stateStage = 'clicked';
          const latency = Math.round(performance.now() - triggerTime);
          activeGame.trialsData.push(latency);
          activeGame.hits++;
          Sound.correct();

          card.className = 'reaction-target-card reaction-state-result';
          icon.textContent = '🎯';
          title.textContent = `${latency} ms`;
          sub.textContent = latency < 250 ? 'Superhuman Reflexes! ⚡' : (latency < 320 ? 'Great Speed! 🚀' : 'Trial Recorded 👍');

          activeGame.trial++;
          setTimeout(() => {
            nextReactionTrial();
          }, 1400);
        }
      };
    }
  }

  // =========================================================================
  // 10. EVENT HANDLERS & INITIALIZATION
  // =========================================================================
  function setupEventListeners() {
    // Nav Click Handling
    document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.target;
        if (target) navigateTo(target);
      });
    });

    // Mobile Drawer
    document.getElementById('mobile-menu-btn')?.addEventListener('click', openMobileDrawer);
    document.getElementById('mobile-close-btn')?.addEventListener('click', closeMobileDrawer);
    document.getElementById('mobile-drawer-overlay')?.addEventListener('click', closeMobileDrawer);

    // Audio & Theme Toggles
    document.getElementById('sound-toggle-btn')?.addEventListener('click', toggleSound);
    document.getElementById('arena-sound-toggle-btn')?.addEventListener('click', toggleSound);
    document.getElementById('sound-toggle-switch')?.addEventListener('change', toggleSound);

    document.getElementById('theme-toggle-btn')?.addEventListener('click', () => toggleTheme());

    // Difficulty Selectors in Settings
    document.querySelectorAll('#difficulty-control .segment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        Sound.click();
        state.difficulty = btn.dataset.diff;
        renderSettingsSection();
        saveState();
      });
    });

    // Theme Selector in Settings
    document.querySelectorAll('#theme-control .segment-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        toggleTheme(btn.dataset.theme);
      });
    });

    // Player Name Save
    document.getElementById('save-name-btn')?.addEventListener('click', () => {
      Sound.click();
      const input = document.getElementById('player-name-input');
      if (input && input.value.trim()) {
        state.playerName = input.value.trim().slice(0, 20);
        saveState();
        renderHeaderStats();
        alert('Player name updated successfully!');
      }
    });

    // Reset Progress Modal
    document.getElementById('reset-data-btn')?.addEventListener('click', () => {
      Sound.click();
      document.getElementById('confirm-modal-backdrop')?.classList.add('active');
    });

    document.getElementById('confirm-modal-cancel')?.addEventListener('click', () => {
      Sound.click();
      document.getElementById('confirm-modal-backdrop')?.classList.remove('active');
    });

    document.getElementById('confirm-modal-proceed')?.addEventListener('click', () => {
      Sound.click();
      localStorage.removeItem(STORAGE_KEY);
      state = JSON.parse(JSON.stringify(DEFAULT_STATE));
      saveState();
      document.getElementById('confirm-modal-backdrop')?.classList.remove('active');
      renderHeaderStats();
      renderDashboardHighlights();
      renderGameCards();
      renderRecentHistoryList();
      renderDailySection();
      renderAnalyticsSection();
      renderAchievementsSection();
      renderSettingsSection();
      alert('All player data has been reset to defaults.');
    });

    // Hero Action Buttons
    document.getElementById('hero-start-btn')?.addEventListener('click', () => {
      navigateTo('games-section');
    });
    document.getElementById('hero-progress-btn')?.addEventListener('click', () => {
      navigateTo('progress-section');
    });
    document.getElementById('view-all-history-btn')?.addEventListener('click', () => {
      navigateTo('progress-section');
    });
    document.getElementById('dash-daily-play-btn')?.addEventListener('click', () => {
      const conf = getDailyChallengeConfig();
      openGame(conf.gameId, state.difficulty, true);
    });

    // Filter Pills on Dashboard
    document.querySelectorAll('#dashboard-game-filters .filter-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        Sound.click();
        document.querySelectorAll('#dashboard-game-filters .filter-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const filter = pill.dataset.filter;

        document.querySelectorAll('#dashboard-games-grid .game-module-card').forEach(card => {
          if (filter === 'all' || card.dataset.category === filter) {
            card.style.display = 'flex';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });

    // Arena Exit
    document.getElementById('arena-exit-btn')?.addEventListener('click', closeGameArena);

    // Escape Key Listener
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const arena = document.getElementById('game-arena-overlay');
        const modal = document.getElementById('confirm-modal-backdrop');
        if (modal?.classList.contains('active')) modal.classList.remove('active');
        else if (arena?.classList.contains('active')) closeGameArena();
      }
    });

    // Resize Event (Redraw Radar)
    window.addEventListener('resize', () => {
      if (document.getElementById('progress-section')?.classList.contains('active-section')) {
        drawCognitiveRadar();
      }
    });
  }

  // =========================================================================
  // 11. BOOTSTRAP APPLICATION
  // =========================================================================
  function initApp() {
    // Set Theme
    document.body.className = state.theme === 'dark' ? 'theme-dark' : 'theme-light';
    const themeIcon = document.getElementById('theme-icon');
    if (themeIcon) themeIcon.textContent = state.theme === 'dark' ? '🌙' : '☀️';

    // Update Streak logic on load
    checkAndUpdateDailyStreak();

    // Render Initial Components
    renderHeaderStats();
    renderDashboardHighlights();
    renderGameCards();
    renderRecentHistoryList();
    renderDailySection();
    renderAchievementsSection();
    renderSettingsSection();

    // Setup Listeners
    setupEventListeners();

    // Global Namespace API for inline DOM buttons
    window.NeuroQuest = {
      openGame,
      closeGameArena,
      navigateTo
    };

    console.log('%c🧠 NeuroQuest Cognitive Engine Initialized Successfully.', 'color: #EC4899; font-weight: bold; font-size: 14px;');
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }

})();
