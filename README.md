# Wordle Overdrive

**Wordle Overdrive** is a high-energy, continuous arcade reimagining of the classic word puzzle game. Moving away from the static "one-word-a-day" loop, this project introduces an endless, high-stakes **Arcade Run** where performance decay, AI-generated cryptic assistance, and total wipeout risk collision-test your vocabulary and speed.

Play the live version here: [wordle-game.remiforge.dev](https://wordle-game.remiforge.dev)

## 🕹️ The Overdrive Loop (Game Mechanics)

Unlike traditional clones, Wordle Overdrive treats individual puzzles as stepping stones in a long-term endurance run.

* **The Continuous Run:** Points from solved words continuously accumulate into your active **Session Total** and build your **Winning Streak**.
* **Bleeding Potential (Dynamic Scoring):** Scoring is tied to a real-time matrix matching your turn count and elapsed time. Solving a word in under 30 seconds on Turn 1 crowns you a **Speed Demon** ($1.5\times$ multiplier), while stalling too long drops you to a **Slow Learner** ($0.8\times$ multiplier). Your potential reward bleeds away with every ticking second.
* **The Wipeout Risk:** There are no safety nets. Failing to solve a word in 6 turns triggers an immediate **Game Over** for the entire session. Your current score and streak are wiped back to zero, leaving only your historical **Best Run** personal record untouched.

## 🧠 Key Features

* **AI Riddle Engine:** Supported by a language-aware AI layer (Gemini Flash), every new word initializes with a bespoke, cryptic one-sentence riddle. This removes "blind first guesses" and replaces them with strategic, thematic deduction.
* **Survival Keypad:** The virtual keyboard dynamically deletes incorrect grey letters as you play. This prevents accidental wasted keystrokes and tightens the mechanical flow during high-pressure late turns.
* **Fully Bilingual:** Native localized prompts and independent 30,000+ word dictionaries for both **English** and **Polish** game modes.

## 🛠️ Architecture & Tech Stack

This repository serves as a showcase for production-grade functional programming in TypeScript and modern reactive state architecture.

* **Framework:** Next.js (App Router) for lightning-fast server rendering and robust asset optimization.
* **State & Logic Control:** Driven by **Effect & Atoms**. The entire game lifecycle avoids messy asynchronous side effects by utilizing explicit, type-safe functional generators (`yield*`) to coordinate game states, long-term session banking, and error boundaries.
* **AI Orchestration:** Seamless integration with Gemini models to handle high-speed, cost-efficient riddle compilation out of the box.
* **Styling:** Custom, highly scannable Dark and Light mode UI systems engineered entirely around fluid, modern `oklch` color gamuts.