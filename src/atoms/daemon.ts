// services, features, and other libraries
import { Effect, Stream, Match } from "effect";
import { Atom } from "@effect-atom/atom-react";
import { gameEventsPubSub, activeModalAtom, runSessionAtom, Runtime } from "@/atoms";

export const gameLifecycleAtom = Runtime.atom(
  Stream.fromPubSub(gameEventsPubSub).pipe(
    Stream.runForEach((event) =>
      Match.value(event).pipe(
        // Bank volatile points into the persistent run session
        Match.tag("WordWon", ({ wordScore: { wordScore } }) =>
          Effect.gen(function* () {
            const { runScore, streak, bestRunScore, ...session } = yield* Atom.get(runSessionAtom);
            yield* Atom.set(runSessionAtom, {
              ...session,
              runScore: runScore + wordScore,
              streak: streak + 1,
              bestRunScore: Math.max(bestRunScore, runScore + wordScore),
            });

            // Trigger modal visibility after a delay
            yield* Effect.sleep("1.5 seconds");
            yield* Atom.set(activeModalAtom, "status");
          })
        ),

        // End the entire arcade run: record results and reset progress to zero
        Match.tag("WordLost", () =>
          Effect.gen(function* () {
            const { runScore, streak, ...session } = yield* Atom.get(runSessionAtom);
            yield* Atom.set(runSessionAtom, { ...session, lastRunScore: runScore, lastRunStreak: streak, runScore: 0, streak: 0 });

            // Trigger modal visibility after a delay
            yield* Effect.sleep("1.5 seconds");
            yield* Atom.set(activeModalAtom, "status");
          })
        ),
        Match.exhaustive
      )
    )
  )
);
