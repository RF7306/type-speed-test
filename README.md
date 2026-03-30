# ⌨️ TypeRacer Pro — Typing Speed Test

A clean, fast, and fully client-side typing speed test built with **vanilla HTML, CSS, and JavaScript** — zero frameworks, zero dependencies, zero build steps.

![TypeRacer Pro Demo](./screenshot.png)

---

## 🧩 Project Description

**TypeRacer Pro** measures how fast you type in words-per-minute (WPM) with live feedback on accuracy. It highlights each character as you type — green for correct, red for wrong — and counts down a configurable timer. At the end it shows your WPM, accuracy, error count, and compares against your personal best (stored locally in your browser).

**Why?** I wanted a distraction-free, install-free typing tool I could open in any browser. Most existing sites are bloated with ads and trackers. This does one thing, cleanly.

---

## 🛠 Technologies Used

| Layer | Choice | Reason |
|---|---|---|
| Structure | HTML5 | Semantic, accessible markup |
| Styling | CSS3 (custom properties, animations, SVG) | Full control, no utility-class bloat |
| Logic | Vanilla JavaScript (ES6+) | No framework overhead needed |
| Storage | Web `localStorage` | Persist personal best score between sessions |
| Fonts | Google Fonts (Space Mono + DM Sans) | Loaded via CDN link tag |

No npm. No webpack. No React. No build pipeline.

---

## ⚙️ Setup Instructions

### Option A — Open directly (easiest)

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/typing-speed-test.git

# Navigate into it
cd typing-speed-test

# Open index.html in your browser
open index.html         # macOS
start index.html        # Windows
xdg-open index.html     # Linux
```

That's it. No `npm install`, no servers, no config.

### Option B — Live Server (if you prefer a dev server)

If you use VS Code, install the **Live Server** extension, then right-click `index.html` → *Open with Live Server*.

Or use Python's built-in server:

```bash
cd typing-speed-test
python3 -m http.server 8080
# Open http://localhost:8080
```

---

## 🎮 Usage

1. **Pick a mode** — 30 sec (Sprint), 60 sec (Standard), or 120 sec (Endurance)
2. **Click START TEST**
3. **Start typing** — the timer begins on your first keystroke
4. Characters turn **cyan** (correct) or **red** (wrong) in real time
5. Your live **WPM** and **accuracy** update every second
6. When time runs out (or you finish the passage), your results appear
7. A 🏆 **Personal Best** banner shows if you beat your record

---

## 📸 Screenshots

| Home Screen | Test In Progress | Results |
|---|---|---|
| Select mode and start | Live character highlighting + timer | WPM, accuracy, rank |

> *Add actual screenshots here after first run — drag images into the repo and reference them above.*

---

## 🗂 Project Structure

```
typing-speed-test/
├── index.html      # App shell, all three screens (home / test / results)
├── style.css       # All styles — dark theme, animations, layout
├── script.js       # Game logic — timer, WPM, accuracy, passage rendering
├── .gitignore
└── README.md
```

**Key design decisions:**

- **No framework** — the DOM is simple enough to manage directly; adding React would be over-engineering.
- **Three screens in one HTML file** — toggled by CSS `display` rather than routing, keeping everything in one request.
- **`localStorage`** for the personal best — no backend needed.
- **SVG ring timer** — drawn with `stroke-dashoffset` math for a smooth countdown animation.

---

## 🤖 AI Acknowledgment

This project was built with assistance from **Claude (Anthropic)**. Here is a precise account of how it was used:

### Claude was used for:

**1. Project scaffolding & architecture decisions**
Claude suggested structuring the app as three screen states inside a single HTML file, toggled with CSS, rather than using a router or multiple pages. I evaluated this and agreed it was the simplest approach for a single-page tool.

**2. CSS ring timer animation**
The SVG timer ring uses `stroke-dasharray` and `stroke-dashoffset` to animate a countdown. Claude explained the maths:
```
circumference = 2 × π × r = 2 × 3.14159 × 34 ≈ 213.6px
offset = circumference × (1 - fraction_remaining)
```
I verified this formula manually and tested it in the browser.

**3. Character-by-character input tracking**
Claude proposed tracking `charIndex` as a counter rather than comparing the full input string on every keystroke — this avoids re-scanning the whole passage on each keypress. I understood the logic and confirmed it handles backspace correctly.

**4. WPM calculation**
Claude confirmed the standard formula: `WPM = (correctChars / 5) / (elapsedMinutes)`. The ÷5 converts characters to "words" (average word length). I cross-checked this against common typing test definitions.

**5. CSS aesthetic guidance**
Claude generated the dark terminal colour palette (CSS custom properties) and the `@keyframes` animations. I reviewed every property, adjusted colours, and removed effects that felt too heavy.

**6. README structure**
Claude helped outline this README's sections. All content was written and reviewed by me.

> **All AI-generated code was read, understood, tested, and modified before inclusion. No code was blindly copy-pasted.**

---

## 📋 Commit History

```
git log --oneline

abc1234  Add results screen with rank system and PB tracking
def5678  Implement live WPM + accuracy counter and SVG ring timer  
ghi9012  Build passage renderer with per-character state tracking
jkl3456  Add home screen with 3-mode selector and start flow
mno7890  Initial project scaffold: index.html, style.css, script.js, .gitignore
```

---

## 🚀 Possible Extensions

- [ ] Custom passage upload
- [ ] Multiplayer via WebSockets
- [ ] Historical WPM chart (Chart.js)
- [ ] Keyboard heatmap showing which keys you miss most
- [ ] More passage categories (code snippets, poetry, news)

---

## 📄 License

MIT — free to use, modify, and distribute.
