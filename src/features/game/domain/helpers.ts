// services, features, and other libraries
import { Array, DateTime, Duration, Number, Option } from "effect";

// types
import type { Color, SolutionsLanguage, WordChallenge, WordScore } from "./models";

// constants
import { BASE_POINTS_PER_TURN_MAP, COLOR_PRIORITY, POTENTIAL_SCORE_RANGE, SPEED_MULTIPLIER_RULES } from "./constants";

// Pick the color with the higher priority; `a` comes from HashMap.get (already
// an Option) so accepting Option directly avoids an intermediate getOrUndefined
export const pickStrongerColor = (a: Option.Option<Color>, b: Color): Color =>
  Option.map(a, (a) => (COLOR_PRIORITY[b] > COLOR_PRIORITY[a] ? b : a)).pipe(Option.getOrElse(() => b));

// Establish the speed multiplier based on the time it took
export const getSpeedMultiplier = (elapsedSeconds: number) =>
  Array.findFirst(SPEED_MULTIPLIER_RULES, ({ maxSeconds }) => elapsedSeconds < maxSeconds).pipe(
    Option.map(({ multiplier }) => multiplier),
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

export const matchLanguage = <T>(language: SolutionsLanguage, en: T, pl: T): T => (language === "En" ? en : pl);
