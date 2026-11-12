// services, features, and other libraries
import { Array, DateTime, Duration, Number, Option, Record } from "effect";

// types
import type { Color, SolutionsLanguage, WordChallenge, WordScore } from "./models";

// constants
import { BASE_POINTS_PER_TURN_MAP, COLOR_PRIORITY, POTENTIAL_SCORE_RANGE, SPEED_MULTIPLIER_RULES } from "./constants";

// Pick the color with the higher priority; `a` comes from HashMap.get (already
// an Option) so accepting Option directly avoids an intermediate getOrUndefined
export const pickStrongerColor = (a: Option.Option<Color>, b: Color) =>
  Option.map(a, (color) => (COLOR_PRIORITY[b] > COLOR_PRIORITY[color] ? b : color)).pipe(Option.getOrElse(() => b));

// Establish the speed multiplier based on the time it took
export const getSpeedMultiplier = (elapsedSeconds: number) =>
  Array.findFirst(SPEED_MULTIPLIER_RULES, ({ maxSeconds }) => elapsedSeconds < maxSeconds).pipe(
    Option.map(({ multiplier }) => multiplier),
    // Unreachable: the table's last rule is the catch-all (maxSeconds: Infinity),
    // so findFirst always matches. The default only keeps the total return type
    Option.getOrElse(() => 0.8)
  );

// Resolve the base score value per the turn in which the word is solved
export const getBasePointsPerTurn = (currentTurn: WordChallenge["currentTurn"]) => BASE_POINTS_PER_TURN_MAP[currentTurn] ?? 0;

// Calculate elapsed time in seconds, treating an unstarted timer as zero seconds
export const getElapsedSeconds = (startTime: WordChallenge["startTime"], endTime: DateTime.Utc) =>
  Option.map(startTime, (startTime) => DateTime.distance(startTime, endTime).pipe(Duration.toSeconds)).pipe(Option.getOrElse(() => 0));

// Represent the "live" potential word score as a percentage (normalize only against the maximum possible score)
export const potentialScoreAsPercentage = (potentialScore: WordScore["wordScore"]) =>
  Number.clamp({ minimum: 0, maximum: 100 })(Math.sqrt(potentialScore / POTENTIAL_SCORE_RANGE.max) * 100);

// Picks the presentation values for the active language. The record keyed by
// the language literals is exhaustive at compile time (a third language fails
// the `satisfies`), so there is no silent fall-through branch
export const matchLanguage = <T>(language: SolutionsLanguage, en: T, pl: T): T =>
  ({ En: en, Pl: pl } satisfies Record.ReadonlyRecord<SolutionsLanguage, T>)[language];

// The language to switch to when the setting is toggled. A lookup table (not a
// ternary) so adding a third language is a compile error in exactly one place
export const otherSolutionsLanguage = (language: SolutionsLanguage) =>
  ({ En: "Pl", Pl: "En" } satisfies Record.ReadonlyRecord<SolutionsLanguage, SolutionsLanguage>)[language];
