// services, features, and other libraries
import { cn } from "@/lib/utils";
import { Effect } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeClient } from "@/lib/runtime-client";
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { alertMachineAtom, modalMachineAtom } from "@/state";
import { gameDataMachineAtom, runSessionMachineAtom, wordChallengeMachineAtom } from "@/features/game/state";

// components
import { Button } from "@base-ui/react";

// assets
import { ArrowPathIcon, ForwardIcon, XCircleIcon } from "@heroicons/react/24/outline";

// types
import type { ComponentPropsWithoutRef } from "react";

type GameFlowButtonProps = ComponentPropsWithoutRef<typeof Button>;

export function GameFlowButton({ className, ...rest }: GameFlowButtonProps) {
  const wordChallengeMachineSnapshot = useAtomValue(wordChallengeMachineAtom);
  const runSessionMachineSnapshot = useAtomValue(runSessionMachineAtom);
  const alertMachineEvent = useAtomSet(alertMachineAtom);

  if (wordChallengeMachineSnapshot.matches("awaitingGameData")) return <GameFlowButtonSkeleton {...rest} />;
  const isRunActive = runSessionMachineSnapshot.matches("active");

  // "Next Word" button (won a word, OR returning to an active run with no current puzzle)
  if (wordChallengeMachineSnapshot.matches("wordWon") || (wordChallengeMachineSnapshot.matches("idle") && isRunActive))
    return (
      <Button
        className={cn("button", className)}
        onClick={async () =>
          await RuntimeClient.runPromise(
            Effect.gen(function* () {
              // Command the modal machine actor to close itself if open
              yield* Atom.set(modalMachineAtom, { type: "closed" });

              // Transition to the next word challenge while maintaining the current run streak
              yield* Atom.set(gameDataMachineAtom, { type: "nextWordRequested" });
            })
          )
        }
        {...rest}
      >
        <ForwardIcon className="size-11" />
        Next Word
      </Button>
    );

  // "Start New Run" button (lost, forfeited, or idle with no active run)
  if (wordChallengeMachineSnapshot.matches("idle") || wordChallengeMachineSnapshot.matches("wordLost") || wordChallengeMachineSnapshot.matches("runForfeited"))
    return (
      <Button
        className={cn("button", className)}
        onClick={async () =>
          await RuntimeClient.runPromise(
            Effect.gen(function* () {
              // Command the modal machine actor to close itself if open
              yield* Atom.set(modalMachineAtom, { type: "closed" });

              // Start a brand-new arcade run
              yield* Atom.set(runSessionMachineAtom, { type: "startedNewRun" });
              yield* Atom.set(gameDataMachineAtom, { type: "nextWordRequested" });
            })
          )
        }
        {...rest}
      >
        <ArrowPathIcon className="size-11" />
        Start New Run
      </Button>
    );

  // "Forfeit Run" button (default — puzzle in progress)
  return (
    <Button className={cn("button", className)} onClick={() => alertMachineEvent({ type: "opened", alertType: "forfeit-run" })} {...rest}>
      <XCircleIcon className="size-11" />
      Forfeit Run
    </Button>
  );
}

export function GameFlowButtonSkeleton({ className, ...rest }: GameFlowButtonProps) {
  return (
    <Button className={cn("button", className)} disabled {...rest}>
      &nbsp;
    </Button>
  );
}
