// services, features, and other libraries
import { Metric } from "effect";

// --- Histograms (Distributions) ---

const guessesToWin = Metric.histogram("guessesToWin", {
  boundaries: Metric.linearBoundaries({ start: 1, width: 1, count: 7 }), // 1, 2, 3, 4, 5, 6, null
  description: "Distribution of guesses needed to win a game.",
});

const timeToSolve = Metric.histogram("timeToSolve", {
  boundaries: Metric.boundariesFromIterable([30, 60, 180]), // <=30, <=60, <=180, and >180
  description: "Distribution of time taken to solve a word in seconds.",
});

const arcadeRunLength = Metric.histogram("arcadeRunLength", {
  boundaries: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, Infinity], // 0, 1, 2, ..., 13, null
  description: "Distribution of run lengths (streak) before a loss.",
});

// --- Frequencies (Categorical Tracking) ---

const openingGuesses = Metric.frequency("openingGuesses", {
  description: "Frequency of the first word guessed in a game.",
});

const failedWords = Metric.frequency("failedWords", {
  description: "Frequency of words that players failed to guess.",
});

const runDeathReason = Metric.frequency("runDeathReason", {
  description: "Reasons why an arcade run ended.",
});

// --- Counters (Cumulative Totals) ---

// Every counter records "one event happened", so the constant-input tail is shared instead of being repeated per metric
const unitCounter = (name: string, description: string) => Metric.counter(name, { description, incremental: true }).pipe(Metric.withConstantInput(1));

const gamesPlayed = unitCounter("gamesPlayed", "Total number of games played (both won and lost).");
const runsStarted = unitCounter("runsStarted", "Total number of arcade runs started.");
const perfectGames = unitCounter("perfectGames", "Total number of games won on the first try.");
const invalidGuesses = unitCounter("invalidGuesses", "Total number of invalid guesses (not in dictionary).");
const validGuesses = unitCounter("validGuesses", "Total number of valid guesses submitted.");

export const metrics = {
  guessesToWin,
  timeToSolve,
  arcadeRunLength,
  openingGuesses,
  failedWords,
  runDeathReason,
  gamesPlayed,
  runsStarted,
  perfectGames,
  invalidGuesses,
  validGuesses,
} as const;
