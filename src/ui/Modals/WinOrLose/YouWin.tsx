// services, features, and other libraries
import { Duration } from "effect";
import { useAtomValue } from "@effect-atom/atom-react";
import { currentTurnAtom, theSecretWordAtom, scoreAtom, sessionTotalScoreAtom, currentStreakAtom } from "@/atoms";
import { formatDuration, speedMultiplierToCategory } from "@/domain";

export function YouWin() {
  const theSecretWord = useAtomValue(theSecretWordAtom);
  const currentTurn = useAtomValue(currentTurnAtom);
  const score = useAtomValue(scoreAtom);
  const totalScore = useAtomValue(sessionTotalScoreAtom);
  const currentStreak = useAtomValue(currentStreakAtom);

  const formattedTime = score ? formatDuration(Duration.seconds(score.timeSeconds)) : "00:00";

  return (
    <article className="space-y-4">
      <div className="text-center">
        <p className="text-4xl font-black text-destructive uppercase">{theSecretWord}</p>
        <p>You found the solution in {currentTurn} guesses 😄</p>
      </div>

      <div className="grid grid-cols-2 gap-4 rounded-xl bg-secondary p-4 text-center">
        <div>
          <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">Total Run</p>
          <p className="text-3xl font-black text-accent">{totalScore}</p>
        </div>
        <div>
          <p className="text-muted-foreground text-xs font-bold tracking-widest uppercase">Streak</p>
          <p className="text-3xl font-black text-destructive">{currentStreak}</p>
        </div>
      </div>

      {score && (
        <div className="space-y-2 border-t pt-4 text-sm">
          <div className="flex justify-between">
            <span className="font-sans text-text-2">Base Points</span>
            <span>{score.basePointsPerTurn}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-sans text-text-2">Speed Multiplier</span>
            <span>
              x{score.speedMultiplier} ({speedMultiplierToCategory("En", score.speedMultiplier)})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="font-sans text-text-2">Time</span>
            <span>{formattedTime}</span>
          </div>
          <div className="flex justify-between border-t pt-2 font-semibold">
            <span className="font-sans text-text-2">Final Score</span>
            <span className="text-accent">{score.totalScore}</span>
          </div>
        </div>
      )}
    </article>
  );
}
