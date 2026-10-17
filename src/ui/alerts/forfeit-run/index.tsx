// services, features, and other libraries
import { Effect } from "effect";
import { Atom } from "effect/reactivity";
import { runClientCommand } from "@/lib/runtime-client";
import { useAtomValue } from "@effect/atom-react";
import { alertIsForfeitRunAtom } from "@/state/alert";
import { gameFlowMachineAtom } from "@/features/game/state/game-flow";
import { wordChallengeMachineAtom } from "@/features/game/state/word-challenge";

// components
import { Alert } from "@/ui/alert";
import { Content } from "./content";
import { useGT } from "gt-next";

export function ForfeitRunAlert() {
  // Derived boolean atom: re-renders only when visibility actually flips
  const isOpen = useAtomValue(alertIsForfeitRunAtom);
  const gt = useGT();

  return (
    <Alert
      isOpen={isOpen}
      title={gt("Forfeit Run")}
      onOkayed={() =>
        runClientCommand(
          Effect.gen(function* () {
            const wordChallenge = (yield* Atom.get(wordChallengeMachineAtom)).context;
            yield* Atom.set(gameFlowMachineAtom, { type: "run.forfeitConfirmed", wordChallenge });
          })
        )
      }
    >
      <Content />
    </Alert>
  );
}
