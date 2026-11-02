// services, features, and other libraries
import { msg } from "gt-react";

// types
import type { AnyAvgStatArgs, AnyCounterArgs } from "@/features/charts/domain/models";

export type TotalsSlideSpec =
  | { kind: "counter"; counterName: AnyCounterArgs["counterName"]; title: string; personalHeader: string }
  | {
      kind: "avg";
      statColumn: AnyAvgStatArgs["statColumn"];
      statTable: AnyAvgStatArgs["statTable"];
      title: string;
      personalHeader: string;
    };

// constants
// Single source of truth for the 10 slides — drives both the live slider
// (index.tsx) and its skeleton so titles/ordering cannot drift apart. The spec set
// deliberately lives in this recharts-free skeleton module: importing it from
// index.tsx instead would drag the embla carousel into the statically-bundled
// page shell
export const TOTALS_SLIDES = [
  { kind: "counter", counterName: "gamesPlayed", title: msg("Games played"), personalHeader: msg("Your Games") },
  { kind: "counter", counterName: "runsStarted", title: msg("Arcade runs started"), personalHeader: msg("Your Runs") },
  { kind: "counter", counterName: "perfectGames", title: msg("Games solved on the first guess"), personalHeader: msg("Your Perfect Games") },
  { kind: "counter", counterName: "invalidGuesses", title: msg("Invalid guesses (not in dictionary)"), personalHeader: msg("Your Invalid Guesses") },
  { kind: "counter", counterName: "validGuesses", title: msg("Valid guesses submitted"), personalHeader: msg("Your Valid Guesses") },
  { kind: "avg", statColumn: "guessedTurn", statTable: "runWordEvent", title: msg("Average guesses to win"), personalHeader: msg("Your Average Guesses") },
  { kind: "avg", statColumn: "timeSeconds", statTable: "runWordEvent", title: msg("Average time to solve a word"), personalHeader: msg("Your Average Time") },
  {
    kind: "avg",
    statColumn: "finalScore",
    statTable: "arcadeRunSummary",
    title: msg("Average score per arcade run"),
    personalHeader: msg("Your Average Score"),
  },
  {
    kind: "avg",
    statColumn: "finalStreak",
    statTable: "arcadeRunSummary",
    title: msg("Average streak per arcade run"),
    personalHeader: msg("Your Average Streak"),
  },
  {
    kind: "avg",
    statColumn: "durationSeconds",
    statTable: "arcadeRunSummary",
    title: msg("Average run duration"),
    personalHeader: msg("Your Average Duration"),
  },
] as const satisfies ReadonlyArray<TotalsSlideSpec>;
