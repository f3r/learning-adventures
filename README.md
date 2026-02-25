```
 _  __     _ _       __  __       _   _
| |/ /    (_) |     |  \/  |     | | | |
| ' / __ _ _( )___  | \  / | __ _| |_| |__
|  < / _` | |/(_-<  | |\/| |/ _` | __| '_ \
| . \ (_| | | / /   | |  | | (_| | |_| | | |
|_|\_\__,_|_| \/    |_|  |_|\__,_|\__|_| |_|

     _       _                 _
    / \   __| |_   _____ _ __ | |_ _   _ _ __ ___
   / _ \ / _` \ \ / / _ \ '_ \| __| | | | '__/ _ \
  / ___ \ (_| |\ V /  __/ | | | |_| |_| | | |  __/
 /_/   \_\__,_| \_/ \___|_| |_|\__|\__,_|_|  \___|
```

# Kai's Math Adventure

> A fun, interactive math game to master multiplication and division tables (1-12).
> Built with love for Kai.

```
  +-----+     x-----x     /-----/
  | 7x8 | --> | = 56 | --> | +10 |
  +-----+     x-----x     /-----/
     ^                        |
     |    +--------------+    |
     +----| STREAK x3!!! |<---+
          +--------------+
```

---

## What is this?

Kai's Math Adventure is a gamified math practice app that makes learning
multiplication and division tables actually enjoyable. It adapts to your
weaknesses, rewards speed and accuracy, and tracks your progress across
all 144 number pairs.

### Features at a Glance

```
  +--------------------------------------------------+
  |                                                  |
  |  [*] Two game modes: Standard & Weakest Areas   |
  |  [*] Adaptive question weighting                |
  |  [*] 30-second timer per question               |
  |  [*] Streak bonuses & speed rewards             |
  |  [*] Star ratings (1-3 stars)                   |
  |  [*] 12x12 performance stats grid               |
  |  [*] Confetti celebrations                       |
  |  [*] High score tracking                        |
  |  [*] Fully offline - no account needed          |
  |                                                  |
  +--------------------------------------------------+
```

---

## Game Modes

### Standard Mode

Pick any tables (1-12) and practice them. Questions are a mix of
multiplication and division, weighted so weaker pairs show up more often.

### Weakest Mode

The game analyzes your history and automatically targets the number pairs
you struggle with most. The best way to improve.

---

## Scoring System

```
  CORRECT ANSWER              +10 points (base)
  STREAK BONUS                +5 x streak count
  SPEED BONUS (< 3 sec)      +5 points
  SPEED BONUS (< 5 sec)      +3 points

  +---------+---------+---------+
  |         |         |         |
  |   *     |  * *    | * * *   |
  |         |         |         |
  | < 50pts | < 100pts| 100pts+ |
  +---------+---------+---------+
     1 star   2 stars   3 stars
```

---

## Tech Stack

```
  +-----------+   +-------------+   +-----------+
  | React 19  |   | TypeScript  |   | Vite 7    |
  +-----------+   +-------------+   +-----------+
  | Tailwind  |   | Framer      |   | Vitest    |
  | CSS 4     |   | Motion      |   |           |
  +-----------+   +-------------+   +-----------+
```

- **React 19** - UI framework
- **TypeScript 5.9** - Type safety
- **Vite 7** - Build tooling with HMR
- **Tailwind CSS 4** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Canvas Confetti** - Celebration effects
- **Vitest** + **React Testing Library** - Testing
- **localStorage** - Data persistence (no backend needed)

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install & Run

```bash
# Clone the repo
git clone https://github.com/your-username/kai-math-game.git
cd kai-math-game

# Install dependencies
npm install

# Start development server
npm run dev
```

Open the URL shown in your terminal (usually `http://localhost:5173`).

### Build for Production

```bash
npm run build
npm run preview    # preview the build locally
```

---

## Testing

```bash
npm test              # run tests once
npm run test:watch    # watch mode
npm run test:coverage # generate coverage report
```

---

## Project Structure

```
src/
 |
 +-- components/
 |    +-- screens/          # Full-page views
 |    |    +-- WelcomeScreen       Home & mode selection
 |    |    +-- TableSelectScreen   Pick tables (1-12)
 |    |    +-- GameScreen          Main gameplay loop
 |    |    +-- ResultsScreen       Score & high score
 |    |    +-- StatsScreen         12x12 mastery grid
 |    |
 |    +-- game/             # Gameplay components
 |    |    +-- QuestionCard        Question display
 |    |    +-- AnswerInput         User input
 |    |    +-- Timer               Countdown timer
 |    |    +-- ProgressBar         Question progress
 |    |    +-- ScoreDisplay        Score & streak
 |    |    +-- Feedback            Correct/incorrect
 |    |
 |    +-- ui/               # Reusable UI
 |         +-- Button              Styled buttons
 |         +-- StarRating          Star display
 |         +-- Confetti            Celebration effect
 |
 +-- contexts/
 |    +-- GameContext        React Context for state
 |
 +-- hooks/
 |    +-- useGameState       State management (useReducer)
 |    +-- useTimer           Countdown logic
 |
 +-- utils/
 |    +-- questions          Question generation & weighting
 |    +-- scoring            Score calculation
 |    +-- storage            localStorage wrappers
 |
 +-- types/
 |    +-- game               TypeScript interfaces
 |
 +-- constants/
      +-- game               Game configuration
```

---

## How It Works

```
  +----------+    +---------+    +----------+    +---------+
  | Welcome  |--->| Select  |--->|   Game   |--->| Results |
  | Screen   |    | Tables  |    | Screen   |    | Screen  |
  +----------+    +---------+    +----------+    +---------+
       |                              |               |
       |    +--------+                v               |
       +--->| Stats  |         10 questions           |
            | Screen |         30s each               |
            +--------+         scored + timed         |
                                                      |
                        localStorage <----------------+
                        (performance, high scores,
                         session state)
```

1. **Choose a mode** - Standard (pick tables) or Weakest (auto-targeted)
2. **Answer 10 questions** - Mix of multiplication and division
3. **Beat the clock** - 30 seconds per question, speed bonuses for fast answers
4. **Build streaks** - Consecutive correct answers multiply your bonus
5. **Review results** - See your score, stars, and high score
6. **Track progress** - The stats grid shows mastery across all 144 pairs

---

## Data Storage

All data lives in your browser's `localStorage`. Nothing is sent anywhere.

| Key | What it stores |
|-----|---------------|
| `kai-math-high-score` | Your best score ever |
| `kai-math-performance` | Correct/incorrect counts per number pair |
| `kai-math-last-tables` | Last selected tables |
| `kai-math-session` | Current game session (for resume) |

---

## License

MIT

---

```
  _    _                           __  __       _   _     _
 | |  | |                         |  \/  |     | | | |   | |
 | |__| | __ _ _ __  _ __  _   _  | \  / | __ _| |_| |__ | |
 |  __  |/ _` | '_ \| '_ \| | | | | |\/| |/ _` | __| '_ \| |
 | |  | | (_| | |_) | |_) | |_| | | |  | | (_| | |_| | | |_|
 |_|  |_|\__,_| .__/| .__/ \__, | |_|  |_|\__,_|\__|_| |_(_)
               | |   | |     __/ |
               |_|   |_|    |___/
```
