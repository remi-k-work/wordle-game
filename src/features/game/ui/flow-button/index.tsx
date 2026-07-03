// services, features, and other libraries
import { cn } from "@/lib/utils";
import { Effect } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeClient } from "@/lib/runtime-client";
import { useAtomValue } from "@effect/atom-react";
import { modalMachineAtom, runSessionMachineAtom, wordChallengeMachineAtom } from "@/features/game/state";
import { trackRunForfeited, trackNewRunStarted } from "@/features/telemetry/state";

// components
import { Button } from "@base-ui/react";

// assets
import { ArrowPathIcon, ForwardIcon, XCircleIcon } from "@heroicons/react/24/outline";

// types
import type { ComponentPropsWithoutRef } from "react";

type GameFlowButtonProps = ComponentPropsWithoutRef<typeof Button>;

export function GameFlowButton({ className, ...rest }: GameFlowButtonProps) {
  const wordChallengeMachineSnapshot = useAtomValue(wordChallengeMachineAtom);
  if (wordChallengeMachineSnapshot.matches("idle")) return <GameFlowButtonSkeleton {...rest} />;

  if (wordChallengeMachineSnapshot.matches("won"))
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

  if (wordChallengeMachineSnapshot.matches("lost"))
    return (
      <Button
        className={cn("button", className)}
        onClick={async () =>
          await RuntimeClient.runPromise(
            Effect.gen(function* () {
              // Track metrics related to the action of starting a new run (stream 2 -> global_pulse)
              yield* trackNewRunStarted;

              // Command the modal machine actor to close itself if open
              yield* Atom.set(modalMachineAtom, { type: "closed" });

              // Abandon the current run while preserving historical stats
              yield* Atom.set(runSessionMachineAtom, { type: "reset" });

              // Transition to the next word challenge while maintaining the current run streak
              yield* Atom.set(wordChallengeMachineAtom, { type: "nextWordRequested" });
            })
          )
        }
        {...rest}
      >
        <ArrowPathIcon className="size-11" />
        Start New Run
      </Button>
    );

  return (
    <Button
      className={cn("button", className)}
      onClick={async () =>
        await RuntimeClient.runPromise(
          Effect.gen(function* () {
            // Track metrics related to the action of forfeiting a run (stream 2 -> global_pulse)
            const runSessionMachineContext = (yield* Atom.get(runSessionMachineAtom)).context;
            const wordChallengeMachineContext = (yield* Atom.get(wordChallengeMachineAtom)).context;
            yield* trackRunForfeited(runSessionMachineContext, wordChallengeMachineContext);

            // Command the modal machine actor to close itself if open
            yield* Atom.set(modalMachineAtom, { type: "closed" });

            // Manually abandon the current arcade run and record its final progress
            yield* Atom.set(runSessionMachineAtom, { type: "finished" });
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
