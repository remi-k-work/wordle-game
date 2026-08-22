// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { overdriveHacksMachineAtom, overdriveHacksSanitizedOverrideAtom } from "@/features/overdrive-hacks/state";
import { modalMachineAtom } from "@/state";
import { useSpeakRiddle } from "@/hooks/use-speak-riddle";

// components
import { Button } from "@base-ui/react";

// assets
import { SpeakerWaveIcon, XCircleIcon } from "@heroicons/react/24/outline";

export function Content() {
  const overdriveHacksMachineSnapshot = useAtomValue(overdriveHacksMachineAtom);
  const sanitizedOverride = useAtomValue(overdriveHacksSanitizedOverrideAtom);
  const speakRiddle = useSpeakRiddle();
  const modalMachineEvent = useAtomSet(modalMachineAtom);

  const isAwaiting = overdriveHacksMachineSnapshot.matches("idle");
  const isLoading = overdriveHacksMachineSnapshot.matches("applyingOverrideHack");
  const canSpeak = sanitizedOverride !== null && !isAwaiting && !isLoading;

  return (
    <article className="mx-auto max-w-prose space-y-9">
      <p className={cn("mx-auto text-center text-lg leading-relaxed sm:text-xl lg:text-2xl", (isAwaiting || isLoading) && "animate-pulse")}>
        {isAwaiting
          ? "Waiting for the override being requested..."
          : isLoading
            ? "Thinking..."
            : (sanitizedOverride ?? "Override unavailable. You are on your own! Please try again later.")}
      </p>

      <footer className="mx-auto mt-6 flex max-w-prose flex-wrap items-center justify-around gap-4">
        <Button className="button" disabled={!canSpeak} onClick={() => canSpeak && speakRiddle(sanitizedOverride)}>
          <SpeakerWaveIcon className="size-11" />
          Speak Override
        </Button>

        <Button tabIndex={-1} className="button bg-secondary" onClick={() => modalMachineEvent({ type: "closed" })}>
          <XCircleIcon className="size-11" />
          Close
        </Button>
      </footer>
    </article>
  );
}
