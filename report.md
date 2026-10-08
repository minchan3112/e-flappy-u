# E Flappy U — Project Report

## 1. Overview

**E Flappy U** is a Flappy Bird-style web game developed as an internal PoC.

The project focuses not only on the game itself, but also on experimenting with an AI-assisted development workflow using **Cursor**.

### Main features

- User name and department registration
- Character selection
- Browser-based gameplay
- Keyboard and touch controls
- Score-based difficulty progression
- Best Score storage
- Shared ranking for multiple users
- Sound effects and mute function
- Responsive UI
- Simple Node.js backend for ranking management

### Project concept

> A simple web game that can be played casually and used to compete for scores with other users.

---

## 2. Background and Purpose

The original PoC idea was **Sport Fan Vote**, but the project was changed to a game-based PoC because the available preparation time was limited.

E Flappy U was selected because:

- The concept can be understood immediately by most users.
- A playable prototype can be created in a relatively short time.
- Changes to the UI and game behavior can be checked visually and iterated quickly.
- It provides a simple example for experimenting with AI-assisted development.

The main purpose of the PoC is therefore to explore how an idea can be turned into a working web application through iterative development with Cursor.

---

## 3. Development Approach

The project was developed through an iterative **Prompt → Implementation → Test → Improvement** cycle.

Instead of defining every detail before implementation, the development process was:

```
Idea
  ↓
Describe the idea to Cursor
  ↓
Initial implementation
  ↓
Run and check in the browser
  ↓
Identify issues or improvement points
  ↓
Give Cursor another Prompt
  ↓
Implementation update
  ↓
Repeat
```

This approach allowed the game to gradually evolve from a simple initial implementation into the current version.

The role of Cursor was not limited to generating code. It was also used to discuss UI ideas, identify possible improvements, and implement changes based on natural-language requirements.

---

## 4. Examples of Cursor Prompts

### 4.1 Initial Game Concept

> 「私はウェブアプリゲームを作りたい。Flappy Birdのようなゲームにしたい」

This Prompt was used to create the initial game concept and basic gameplay.

The initial requirement was intentionally simple. Detailed implementation decisions were left to Cursor so that the first playable version could be created quickly.

### 4.2 Background and Visual Design

> 「ピクセルの背景の風景をカスタマイズして、ユーザーが初めてWebに入ったときにゲームをプレイするWebサイトだと感じられるようにしたい」

This Prompt focused on the purpose of the visual change rather than specifying the exact implementation.

The objective was to make the website immediately recognizable as a game when users first opened it.

### 4.3 Branding and Layout Improvement

> 「ここでAURORAとは何かよく分かりません。EFUに変更できますか？ゲームの名前はSky HopではなくE Flappy Uです。ゲームキャンバスの左側が少し空いているように見えますが、何を追加すると合理的ですか？」

This Prompt addressed several issues at once:

1. Replace the unclear existing branding with EFU.
2. Change the game name to E Flappy U.
3. Ask for a reasonable way to use the empty space beside the game canvas.

The third point is an example of using Cursor not only for implementation, but also for design suggestions during development.

---

## 5. Game Design

### Basic gameplay

1. Select a character.
2. Start the game.
3. Control the character with Space, the Up Arrow, or touch input.
4. Avoid the pipes.
5. Gain 1 point for each pipe passed.
6. The game ends when the character collides with an obstacle or the ground.
7. Submit the score to the ranking.

### Difficulty progression

The difficulty increases as the score increases.

- Pipe movement speed increases.
- The gap between pipes becomes smaller.
- The interval between pipes becomes shorter.

This creates a progression from an easy initial state to a more challenging high-score stage.

---

## 6. Ranking System

A shared ranking was added so that the game can be used by multiple users.

If scores were stored only in the browser, the ranking would be limited to each user's own device/browser. E Flappy U therefore uses a simple Node.js server to manage shared ranking data.

```
Browser
   ↓
Score submission
   ↓
Node.js Server
   ↓
scores.json
   ↓
Shared Ranking
```

The server provides:

- Ranking retrieval API
- Score submission API
- Best-score update for existing users
- Ranking data persistence

---

## 7. System Architecture

```
┌──────────────────────────┐
│         Browser          │
│                          │
│   HTML / CSS / JavaScript│
│        Game UI           │
│        Game Logic        │
└────────────┬─────────────┘
             │
             │ Ranking API
             ↓
┌──────────────────────────┐
│        Node.js           │
│         Server           │
│                          │
│     Ranking Management   │
└────────────┬─────────────┘
             │
             ↓
        scores.json
```

### Frontend

The browser-side application is responsible for:

- Game rendering
- Character control
- Collision detection
- Score calculation
- Difficulty progression
- Character selection
- Sound control
- Ranking display

### Backend

The Node.js server is responsible for:

- Serving the web application
- Ranking API
- Score validation
- Score persistence
- Ranking retrieval

---

## 8. Repository Structure

| File | Purpose |
|---|---|
| `index.html` | Main page and game UI |
| `game.js` | Game logic, physics, collision, score and difficulty |
| `ranking.js` | Ranking API communication and display |
| `server.mjs` | Node.js server and ranking API |
| `audio.js` | Game sound effects |
| `brand.js` | Game/company branding and character configuration |
| `styles.css` | UI and responsive styling |
| `scene.svg` | Pixel-style visual assets |
| `data/scores.example.json` | Example ranking data |
| `README.md` | Setup and usage information |
| `report.md` | Project overview and development report |

---

## 9. Local Development

The project can be run locally with Node.js.

```bash
npm run dev
```

Then open:

```
http://localhost:5173
```

The local environment includes both the game frontend and the Node.js ranking server.

---

## 10. Current Status

The core PoC is implemented and can be run locally.

The current version includes the game, ranking functionality, visual customization, character selection, sound, and responsive UI.

Cloudflare deployment has not yet been completed. The deployment is planned as the next step.

---

## 11. Key Takeaway

E Flappy U demonstrates an AI-assisted development approach in which the developer continuously:

**Define an idea → Prompt Cursor → Run and check → Identify improvements → Prompt again → Implement**

Rather than relying on a single prompt to generate a complete application, the PoC uses short feedback cycles to gradually refine both the functionality and the user experience.
