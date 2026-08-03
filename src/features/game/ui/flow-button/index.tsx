// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { alertMachineAtom } from "@/state";
import { gameDataMachineAtom, gameFlowMachineAtom, wordChallengeMachineAtom } from "@/features/game/state";

// components
import { Button } from "@base-ui/react";

// assets
import { ArrowPathIcon, ForwardIcon, XCircleIcon } from "@heroicons/react/24/outline";

// types
import type { ComponentPropsWithoutRef } from "react";

type GameFlowButtonProps = ComponentPropsWithoutRef<typeof Button>;

export function GameFlowButton({ className, ...rest }: GameFlowButtonProps) {
  const wordChallengeMachineSnapshot = useAtomValue(wordChallengeMachineAtom);
  const gameDataMachineSnapshot = useAtomValue(gameDataMachineAtom);
  const gameFlowMachineSnapshot = useAtomValue(gameFlowMachineAtom);
  const gameFlowMachineEvent = useAtomSet(gameFlowMachineAtom);
  const alertMachineEvent = useAtomSet(alertMachineAtom);

  if (
    wordChallengeMachineSnapshot.matches("awaitingGameData") ||
    gameDataMachineSnapshot.matches("loading") ||
    gameDataMachineSnapshot.matches("selectingWord")
  )
    return <GameFlowButtonSkeleton {...rest} />;
  if (gameFlowMachineSnapshot.matches("starting")) return <GameFlowButtonSkeleton {...rest} />;

  // "Next Word" button (won a word, OR returning to an active run with no current puzzle)
  if (gameFlowMachineSnapshot.matches("betweenWords"))
    return (
      <Button className={cn("button max-sm:p-1", className)} title="Next Word" onClick={() => gameFlowMachineEvent({ type: "word.nextRequested" })} {...rest}>
        <ForwardIcon className="size-11" />
        <span className="hidden sm:block">Next Word</span>
      </Button>
    );

  // "Start New Run" button (lost, forfeited, or idle with no active run)
  if (gameFlowMachineSnapshot.matches("ready"))
    return (
      <Button
        className={cn("button max-sm:p-1", className)}
        title="Start New Run"
        onClick={() => gameFlowMachineEvent({ type: "run.startRequested" })}
        {...rest}
      >
        <ArrowPathIcon className="size-11" />
        <span className="hidden sm:block">Start New Run</span>
      </Button>
    );

  // "Forfeit Run" button (default — puzzle in progress)
  return (
    <Button
      className={cn("button bg-destructive max-sm:p-1", className)}
      title="Forfeit Run"
      onClick={() => alertMachineEvent({ type: "opened", alertType: "forfeit-run" })}
      {...rest}
    >
      <XCircleIcon className="size-11" />
      <span className="hidden sm:block">Forfeit Run</span>
    </Button>
  );
}

export function GameFlowButtonSkeleton({ className, ...rest }: GameFlowButtonProps) {
  return (
    <Button className={cn("button max-sm:p-1", className)} disabled {...rest}>
      <div className="size-full animate-pulse bg-accent" />
    </Button>
  );
}
