// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { alertMachineAtom } from "@/state";
import { gameDataMachineAtom, gameFlowMachineAtom, wordChallengeMachineAtom } from "@/features/game/state";

// components
import { Button } from "@base-ui/react";

// assets
import { ForwardIcon, PowerIcon, PuzzlePieceIcon } from "@heroicons/react/24/outline";

// types
import type { ComponentPropsWithoutRef } from "react";

interface GameFlowButtonProps extends ComponentPropsWithoutRef<typeof Button> {
  keepText?: boolean;
  onClicked?: () => void;
}

export function GameFlowButton({ keepText = false, onClicked, className, ...rest }: GameFlowButtonProps) {
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
    return <GameFlowButtonSkeleton keepText={keepText} className={className} {...rest} />;
  if (gameFlowMachineSnapshot.matches("starting")) return <GameFlowButtonSkeleton keepText={keepText} className={className} {...rest} />;

  // "Next Word" button (won a word, OR returning to an active run with no current puzzle)
  if (gameFlowMachineSnapshot.matches("betweenWords"))
    return (
      <Button
        className={cn("button", !keepText && "max-sm:p-1", className)}
        title="Next Word"
        onClick={() => {
          gameFlowMachineEvent({ type: "word.nextRequested" });
          onClicked?.();
        }}
        {...rest}
      >
        <ForwardIcon className="size-11" />
        {keepText ? "Next Word" : <span className="hidden sm:block">Next Word</span>}
      </Button>
    );

  // "Start New Run" button (lost, forfeited, or idle with no active run)
  if (gameFlowMachineSnapshot.matches("ready"))
    return (
      <Button
        className={cn("button", !keepText && "max-sm:p-1", className)}
        title="Start New Run"
        onClick={() => {
          gameFlowMachineEvent({ type: "run.startRequested" });
          onClicked?.();
        }}
        {...rest}
      >
        <PuzzlePieceIcon className="size-11" />
        {keepText ? "Start New Run" : <span className="hidden sm:block">Start New Run</span>}
      </Button>
    );

  // "Forfeit Run" button (default — puzzle in progress)
  return (
    <Button
      className={cn("button bg-destructive", !keepText && "max-sm:p-1", className)}
      title="Forfeit Run"
      onClick={() => {
        alertMachineEvent({ type: "opened", alertType: "forfeit-run" });
        onClicked?.();
      }}
      {...rest}
    >
      <PowerIcon className="size-11" />
      {keepText ? "Forfeit Run" : <span className="hidden sm:block">Forfeit Run</span>}
    </Button>
  );
}

export function GameFlowButtonSkeleton({ keepText = false, className, ...rest }: GameFlowButtonProps) {
  return (
    <Button className={cn("button", !keepText && "max-sm:p-1", className)} disabled {...rest}>
      &nbsp;
    </Button>
  );
}
