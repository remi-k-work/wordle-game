// services, features, and other libraries
import { useAtomSet } from "@effect/atom-react";
import { modalMachineAtom } from "@/state";

// components
import { Button } from "@base-ui/react";
import { VoiceSettings } from "@/features/settings/ui/voice-settings";

// assets
import { XCircleIcon } from "@heroicons/react/24/outline";

export function Content() {
  const modalMachineEvent = useAtomSet(modalMachineAtom);

  return (
    <article className="mx-auto max-w-prose space-y-9">
      <VoiceSettings />

      <Button tabIndex={-1} className="button mx-auto mt-8" onClick={() => modalMachineEvent({ type: "closed" })}>
        <XCircleIcon className="size-11" />
        Close
      </Button>
    </article>
  );
}
