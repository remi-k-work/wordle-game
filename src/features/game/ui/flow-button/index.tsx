// services, features, and other libraries
import { cn } from "@/lib/utils";
import { Effect } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeClient } from "@/lib/runtime-client";
import { useAtomValue } from "@effect/atom-react";
import { runSessionMachineAtom, wordChallengeMachineAtom } from "@/features/game/state";
import { modalMachineAtom } from "@/state";

// components
import { Button } from "@base-ui/react";

// assets
import { ArrowPathIcon, ForwardIcon, XCircleIcon } from "@heroicons/react/24/outline";

// types
import type { ComponentPropsWithoutRef } from "react";

type GameFlowButtonProps = ComponentPropsWithoutRef<typeof Button>;

export function GameFlowButton({ className, ...rest }: GameFlowButtonProps) {
  const wordChallengeMachineSnapshot = useAtomValue(wordChallengeMachineAtom);
  if (wordChallengeMachineSnapshot.matches("awaitingGameData")) return <GameFlowButtonSkeleton {...rest} />;

  // "Next Word" button (when wordWon)
  if (wordChallengeMachineSnapshot.matches("wordWon"))
    return (
      <Button
        className={cn("button", className)}
        onClick={async () =>
          await RuntimeClient.runPromise(
            Effect.gen(function* () {
              // Command the modal machine actor to close itself if open
              yield* Atom.set(modalMachineAtom, { type: "closed" });

              // Transition to the next word challenge while maintaining the current run streak
              yield* Atom.set(wordChallengeMachineAtom, { type: "nextWordRequested" });
            })
          )
        }
        {...rest}
      >
        <ForwardIcon className="size-11" />
        Next Word
      </Button>
    );

  // "Start New Run" button (when wordLost or runForfeited)
  if (wordChallengeMachineSnapshot.matches("wordLost") || wordChallengeMachineSnapshot.matches("runForfeited"))
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
              yield* Atom.set(wordChallengeMachineAtom, { type: "startedNewRun" });
            })
          )
        }
        {...rest}
      >
        <ArrowPathIcon className="size-11" />
        Start New Run
      </Button>
    );

  // "Forfeit Run" button (default)
  return (
    <Button
      className={cn("button", className)}
      onClick={async () =>
        await RuntimeClient.runPromise(
          Effect.gen(function* () {
            // Forfeit the active run
            yield* Atom.set(runSessionMachineAtom, { type: "forfeitedRun" });
            yield* Atom.set(wordChallengeMachineAtom, { type: "forfeitedRun" });

            // Command the modal machine actor to open up the status modal
            yield* Atom.set(modalMachineAtom, { type: "opened", modalType: "status" });
          })
        )
      }
      {...rest}
    >
      <XCircleIcon className="size-11" />
      Forfeit Run
    </Button>
  );
}

export function GameFlowButtonSkeleton({ className, ...rest }: GameFlowButtonProps) {
  return (
    <Button className={cn("button", className)} disabled {...rest}>
      &bnsp;
    </Button>
  );
}
