// services, features, and other libraries
import { Effect } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeClient } from "@/lib/runtime-client";
import { useAtomValue } from "@effect/atom-react";
import { alertMachineAtom } from "@/state";
import { gameFlowMachineAtom, wordChallengeMachineAtom } from "@/features/game/state";

// components
import { Alert } from "@/ui/alert";
import { Content } from "./content";

export function ForfeitRunAlert() {
  const alertMachineSnapshot = useAtomValue(alertMachineAtom);

  return (
    <Alert
      isOpen={alertMachineSnapshot.matches("forfeit-run")}
      title="Forfeit Run"
      onOkayed={async () =>
        await RuntimeClient.runPromise(
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
