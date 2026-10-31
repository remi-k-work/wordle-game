// services, features, and other libraries
import { useGT } from "gt-react";
import { useLocale } from "gt-tanstack-start";
import { calculatePotentialScore } from "@/features/game/domain/game-logic";
import { getBasePointsPerTurn, getSpeedMultiplier } from "@/features/game/domain/helpers";

// Derives the score readings (plus `gt`/`locale`) shared by both simulator modes
// Keeping this in one hook means the turn/time → score derivation can't drift
// between the interactive and read-only report modes
export function useScoreReadings(guessedTurn: number, timeElapsed: number) {
  const gt = useGT();
  const locale = useLocale();

  const potentialScore = calculatePotentialScore(guessedTurn, timeElapsed);
  const basePointsPerTurn = getBasePointsPerTurn(guessedTurn);
  const speedMultiplier = getSpeedMultiplier(timeElapsed);

  return { potentialScore, basePointsPerTurn, speedMultiplier, gt, locale } as const;
}
