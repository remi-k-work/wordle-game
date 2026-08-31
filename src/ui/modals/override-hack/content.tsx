// services, features, and other libraries
import { Option } from "effect";
import { cn } from "@/lib/utils";
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { overdriveHacksMachineAtom, overdriveHacksSanitizedOverrideAtom } from "@/features/overdrive-hacks/state";
import { modalMachineAtom } from "@/state";
import { useSpeakRiddle } from "@/hooks/use-speak-riddle";

// components
import { Button } from "@base-ui/react";
import { T } from "gt-next";

// assets
import { SpeakerWaveIcon, XCircleIcon } from "@heroicons/react/24/outline";

export function Content() {
  const overdriveHacksMachineSnapshot = useAtomValue(overdriveHacksMachineAtom);
  const sanitizedOverride = Option.fromNullOr(useAtomValue(overdriveHacksSanitizedOverrideAtom));
  const speakRiddle = useSpeakRiddle();
  const modalMachineEvent = useAtomSet(modalMachineAtom);

  const isAwaiting = overdriveHacksMachineSnapshot.matches("idle");
  const isLoading = overdriveHacksMachineSnapshot.matches("applyingOverrideHack");
  const canSpeak = Option.isSome(sanitizedOverride) && !isAwaiting && !isLoading;

  return (
    <article className="mx-auto max-w-prose space-y-9">
      <p className={cn("mx-auto text-center text-lg leading-relaxed sm:text-xl lg:text-2xl", (isAwaiting || isLoading) && "animate-pulse")}>
        {isAwaiting ? (
          <T>Waiting for the override being requested...</T>
        ) : isLoading ? (
          <T>Thinking...</T>
        ) : (
          Option.getOrElse(sanitizedOverride, () => <T>Override unavailable. You are on your own! Please try again later.</T>)
        )}
      </p>

      <footer className="mx-auto mt-6 flex max-w-prose flex-wrap items-center justify-around gap-4">
        <Button
          className="button"
          disabled={!canSpeak}
          onClick={() => Option.match(sanitizedOverride, { onNone: () => {}, onSome: (text) => speakRiddle(text) })}
        >
          <SpeakerWaveIcon className="size-11" />
          <T>Speak Override</T>
        </Button>

        <Button tabIndex={-1} className="button bg-secondary" onClick={() => modalMachineEvent({ type: "closed" })}>
          <XCircleIcon className="size-11" />
          <T>Close</T>
        </Button>
      </footer>
    </article>
  );
}
