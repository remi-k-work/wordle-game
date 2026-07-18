// services, features, and other libraries
import { Effect } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeClient } from "@/lib/runtime-client";
import { useAtomValue } from "@effect/atom-react";
import { alertMachineAtom, modalMachineAtom } from "@/state";
import { runSessionMachineAtom, wordChallengeMachineAtom } from "@/features/game/state";

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
            // Forfeit the active run
            const wordChallenge = (yield* Atom.get(wordChallengeMachineAtom)).context;
            yield* Atom.set(runSessionMachineAtom, { type: "forfeitedRun", wordChallenge });
            yield* Atom.set(wordChallengeMachineAtom, { type: "forfeitedRun" });

            // Command the modal machine actor to open up the status modal
            yield* Atom.set(modalMachineAtom, { type: "opened", modalType: "status" });
          })
        )
      }
    >
      <Content />
    </Alert>
  );
}
