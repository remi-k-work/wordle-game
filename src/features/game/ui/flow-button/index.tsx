// services, features, and other libraries
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { forfeitRunAction, gameStatusAtom, nextWordAction, startNewRunAction } from "@/features/game/state";

// components
import { Button } from "@base-ui/react";

// assets
import { ArrowPathIcon, ForwardIcon, XCircleIcon } from "@heroicons/react/24/outline";

export function GameFlowButton() {
  const gameStatus = useAtomValue(gameStatusAtom);
  const forfeitRun = useAtomSet(forfeitRunAction);
  const nextWord = useAtomSet(nextWordAction);
  const startNewRun = useAtomSet(startNewRunAction);

  return (
    <>
      {gameStatus._tag === "Playing" && (
        <Button className="button" onClick={() => forfeitRun()}>
          <XCircleIcon className="size-11" />
          Forfeit Run
        </Button>
      )}
      {gameStatus._tag === "Won" && (
        <Button className="button" onClick={() => nextWord()}>
          <ForwardIcon className="size-11" />
          Next Word
        </Button>
      )}
      {gameStatus._tag === "Lost" && (
        <Button className="button" onClick={() => startNewRun()}>
          <ArrowPathIcon className="size-11" />
          Start New Run
        </Button>
      )}
    </>
  );
}

export function GameFlowButtonSkeleton() {
  return (
    <Button className="button" disabled>
      &bnsp;
    </Button>
  );
}
