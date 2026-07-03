// services, features, and other libraries
import { Effect } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { RuntimeClient } from "@/lib/runtime-client";
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { modalMachineAtom, runSessionMachineAtom } from "@/features/game/state";
import { changeSolutionsLanguageAction, solutionsLanguageAtom } from "@/features/settings/state";
import { trackRunForfeited } from "@/features/telemetry/state";

// components
import { Button } from "@base-ui/react";

// assets
import { PlFlagIcon, UsFlagIcon } from "@/assets/icons";

export function LangChanger() {
  const solutionsLanguage = useAtomValue(solutionsLanguageAtom);
  const changeSolutionsLanguage = useAtomSet(changeSolutionsLanguageAction);

  const handleLangToggled = async () => {
    await RuntimeClient.runPromise(
      Effect.gen(function* () {
        // Track metrics related to the action of forfeiting a run (stream 2 -> global_pulse)
        yield* trackRunForfeited;

        // Command the modal machine actor to close itself if open
        yield* Atom.set(modalMachineAtom, { type: "closed" });

        // Manually abandon the current arcade run and record its final progress
        yield* Atom.set(runSessionMachineAtom, { type: "finished" });
      })
    );

    changeSolutionsLanguage();
  };

  return (
    <Button className="button" onClick={handleLangToggled}>
      {solutionsLanguage === "En" ? <UsFlagIcon className="size-11" /> : <PlFlagIcon className="size-11" />}
      Language
    </Button>
  );
}

export function LangChangerSkeleton() {
  return (
    <Button className="button" disabled>
      <UsFlagIcon className="size-11" />
      Language
    </Button>
  );
}
