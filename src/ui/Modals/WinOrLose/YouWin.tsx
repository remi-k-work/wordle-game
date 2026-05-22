// services, features, and other libraries
import { Duration, Option } from "effect";
import { useAtomValue, useAtomSet } from "@effect-atom/atom-react";
import { currentTurnAtom, theSecretWordAtom, wordScoreAtom, runScoreAtom, streakAtom, nextWordAction } from "@/atoms";
import { formatDuration, speedMultiplierToCategory } from "@/domain";

// components
import { Button } from "@base-ui/react";

// assets
import { ForwardIcon } from "@heroicons/react/24/outline";

export function YouWin() {
  const theSecretWord = useAtomValue(theSecretWordAtom);
  const currentTurn = useAtomValue(currentTurnAtom);
  const runScore = useAtomValue(runScoreAtom);
  const streak = useAtomValue(streakAtom);
  const wordScoreOption = useAtomValue(wordScoreAtom);
  const nextWord = useAtomSet(nextWordAction);

  if (Option.isNone(wordScoreOption)) return null;

  const { wordScore, basePointsPerTurn, speedMultiplier, timeSeconds } = wordScoreOption.value;

  return (
    <article className="max-w-prose space-y-4">
      <h2 className="text-4xl font-semibold text-destructive uppercase">{theSecretWord}</h2>
      <p>
        You found the solution in <b>{currentTurn - 1}</b> guesses 😄
      </p>

      <section className="grid grid-cols-2 gap-4 rounded-xl border bg-secondary p-4">
        <div>
          <h3 className="font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">Run Score</h3>
          <span className="text-3xl font-semibold text-accent">{runScore}</span>
        </div>
        <div>
          <h3 className="font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">Streak</h3>
          <span className="text-3xl font-semibold text-destructive">{streak}</span>
        </div>
      </section>

      <footer className="space-y-2 border-t pt-2 text-start">
        <div className="flex items-center justify-between gap-24">
          <h3 className="font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">Base Points</h3>
          <span className="text-end">{basePointsPerTurn}</span>
        </div>
        <div className="flex items-center justify-between gap-24">
          <h3 className="font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">Speed Multiplier</h3>
          <span className="text-end">
            x{speedMultiplier} ({speedMultiplierToCategory(speedMultiplier)})
          </span>
        </div>
        <div className="flex items-center justify-between gap-24">
          <h3 className="font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">Time</h3>
          <span className="text-end">{formatDuration(Duration.seconds(timeSeconds))}</span>
        </div>
        <div className="flex items-center justify-between gap-24 border-t pt-2">
          <h3 className="font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">Word Score</h3>
          <span className="text-end font-semibold text-accent">{wordScore}</span>
        </div>
      </footer>

      <Button className="button mx-auto" onClick={() => nextWord()}>
        <ForwardIcon className="size-11" />
        Next Word
      </Button>
    </article>
  );
}
