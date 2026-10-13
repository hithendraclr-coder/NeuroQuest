# NeuroQuest — Brain Training Game 🧠

> **Train Your Mind. Challenge Your Limits.**  
> A premium, responsive, zero-dependency browser-based cognitive training suite built exclusively with **HTML5**, **Vanilla CSS3**, and **Vanilla JavaScript**.

---

## 🌟 Overview

**NeuroQuest** is an interactive mental fitness web application designed to challenge and benchmark six core cognitive faculties:
1. **Visual Memory** (*Memory Matrix*)
2. **Numerical Reasoning** (*Number Sequence*)
3. **Selective Concentration** (*Focus Master*)
4. **Deductive Logic** (*Logic Lab*)
5. **Mental Arithmetic** (*Quick Calculation*)
6. **Neuromuscular Reflexes** (*Reaction Challenge*)

Built with a gaming aesthetic featuring gradients of purple, magenta, coral, orange, golden yellow, and emerald green — with **strictly zero blue or cyan** across the entire UI.

---

## ✨ Key Features

- **🎮 6 Fully Playable Brain Training Games**:
  - **Memory Matrix**: Memorize and reproduce coordinate tile grids scaling from $3 \times 3$ to $6 \times 6$.
  - **Number Sequence**: Identify algorithmic progressions (arithmetic, geometric, alternating, Fibonacci variations, quadratic steps) with post-answer logic explanations.
  - **Focus Master**: Filter complex visual distractors to isolate specific geometric targets against a 30-second timer.
  - **Logic Lab**: Tackle deductive syllogisms, categorical puzzles, directional conundrums, and relational comparisons.
  - **Quick Calculation**: 45-second arithmetic speed trial with onscreen numpad and physical keyboard support (`Enter` key submission).
  - **Reaction Challenge**: Millisecond-accurate neuromuscular response testing with false-start detection and 5-trial benchmarking.

- **🎨 Aesthetic UI (Strictly No Blue/Cyan)**:
  - Curated color scheme: Deep Charcoal Plum (`#1C1428`), Elevated Violet (`#261A35`), Vivid Magenta (`#EC4899`), Primary Purple (`#8B5CF6`), Coral (`#FF6B6B`), Tangerine (`#F97316`), Golden Amber (`#FBBF24`), and Emerald Green (`#10B981`).
  - Seamless toggle between **Dark Plum** and **Warm Cream** visual themes.
  - Micro-animations, glowing badges, elevation states, and glassmorphic navigation.

- **🔊 Web Audio API Synthesizer**:
  - Harmonic chords, click responses, mistake alerts, timer ticks, and triumphant level-up fanfares synthesized mathematically without any external MP3/WAV files.
  - Integrated sound mute/unmute toggle.

- **📈 Performance Analytics & Radar Chart**:
  - Interactive HTML5 Canvas radar chart visualizing 6 cognitive skill dimensions.
  - Track total XP, player level, daily streak, overall accuracy, personal bests, and recent session logs.
  - Intelligent cognitive insights highlighting your strongest faculty and suggested practice targets.

- **⭐ Daily Quest & Streak Counter**:
  - Deterministically seeded daily protocol that changes every midnight.
  - Earn bonus XP and maintain consecutive calendar day streaks.

- **🏆 12 Unlockable Badges & Achievements**:
  - Automatic progress evaluation with animated achievement toasts and XP bonuses.

- **💾 Zero-Backend Persistence**:
  - Complete game history, settings, and player milestones persist reliably in browser `localStorage`.
  - Built-in progress reset with safety confirmation dialog.

---

## 🛠️ Technology Stack

- **Markup**: Semantic HTML5 (accessible ARIA tags, SVG brain logo, responsive layout)
- **Styling**: Vanilla CSS3 (Custom properties, CSS Grid, Flexbox, keyframe animations, Dark/Light modes)
- **Logic**: Vanilla JavaScript (ES6+, Web Audio API, Canvas 2D API, Web Storage API)
- **Dependencies**: **0** (No external frameworks, No npm packages, No APIs, No backend server required)

---

## 🚀 How to Run the Project

1. Clone or download this repository.
2. Open `index.html` directly in any modern web browser (Google Chrome, Firefox, Microsoft Edge, Safari, Brave).
   - Alternatively, serve locally using any static web server:
     ```bash
     # Optional: Python static server (if installed)
     python -m http.server 8080
     # Or Node.js
     npx serve .
     ```
3. Begin training your mind!

---

## 📁 File Structure

All files reside in the root directory:
```
neuroquest-brain-training/
├── index.html        # Main HTML structure, SVG branding, modals, and views
├── style.css         # Complete styling, design tokens, responsive rules, themes
├── script.js         # Core application engine, 6 game routines, audio, storage
├── README.md         # Documentation, feature highlights, and architecture
└── .gitignore        # Git ignore rules for system artifacts
```

---

## ⚖️ License & Disclaimer

NeuroQuest is designed as a game for practicing specific cognitive skills and mental alertness. It does not measure IQ or guarantee improvements in clinical cognitive faculties.

Released under the [MIT License](https://opensource.org/licenses/MIT).
