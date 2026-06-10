// services, features, and other libraries
import { Metric } from "effect";

// --- Histograms (Distributions) ---

export const guessesToWin = Metric.histogram("guessesToWin", {
  boundaries: Metric.linearBoundaries({ start: 1, width: 1, count: 6 }),
  description: "Distribution of guesses needed to win a game.",
});

export const timeToSolve = Metric.histogram("timeToSolve", {
  boundaries: Metric.exponentialBoundaries({ start: 5, factor: 2, count: 8 }), // 5, 10, 20, 40, 80, 160, 320, 640
  description: "Distribution of time taken to solve a word in seconds.",
});

export const arcadeRunLength = Metric.histogram("arcadeRunLength", {
  boundaries: Metric.linearBoundaries({ start: 0, width: 2, count: 10 }), // 0, 2, 4, 6, 8, 10, 12, 14, 16, 18
  description: "Distribution of run lengths (streak) before a loss.",
});

// --- Frequencies (Categorical Tracking) ---

export const openingGuesses = Metric.frequency("openingGuesses", {
  description: "Frequency of the first word guessed in a game.",
});

export const failedWords = Metric.frequency("failedWords", {
  description: "Frequency of words that players failed to guess.",
});

export const runDeathReason = Metric.frequency("runDeathReason", {
  description: "Reasons why an arcade run ended.",
});

// --- Counters (Cumulative Totals) ---

export const gamesPlayed = Metric.counter("gamesPlayed", {
  description: "Total number of games played (both won and lost).",
  incremental: true,
}).pipe(Metric.withConstantInput(1));

export const runsStarted = Metric.counter("runsStarted", {
  description: "Total number of arcade runs started.",
  incremental: true,
}).pipe(Metric.withConstantInput(1));

export const perfectGames = Metric.counter("perfectGames", {
  description: "Total number of games won on the first try.",
  incremental: true,
}).pipe(Metric.withConstantInput(1));

export const invalidGuesses = Metric.counter("invalidGuesses", {
  description: "Total number of invalid guesses (not in dictionary).",
  incremental: true,
}).pipe(Metric.withConstantInput(1));

export const validGuesses = Metric.counter("validGuesses", {
  description: "Total number of valid guesses submitted.",
  incremental: true,
}).pipe(Metric.withConstantInput(1));
