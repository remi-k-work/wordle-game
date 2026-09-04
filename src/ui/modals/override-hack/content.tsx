// services, features, and other libraries
import { Option } from "effect";
import { cn } from "@/lib/utils";
import { useAtomValue } from "@effect/atom-react";
import { overdriveHacksMachineAtom, overdriveHacksSanitizedOverrideAtom } from "@/features/overdrive-hacks/state";
import { useSpeakRiddle } from "@/hooks/use-speak-riddle";

// components
import { T } from "gt-next";
import { CloseModalButton } from "@/ui/modal-close-button";
import { SpeakButton } from "@/ui/speak-button";

// constants
import { DIALOG_FOOTER_CLASSES } from "@/ui/dialog-chrome";

export function Content() {
  const overdriveHacksMachineSnapshot = useAtomValue(overdriveHacksMachineAtom);
  const sanitizedOverride = Option.fromNullOr(useAtomValue(overdriveHacksSanitizedOverrideAtom));
  const speakRiddle = useSpeakRiddle();

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

      <footer className={DIALOG_FOOTER_CLASSES}>
        <SpeakButton
          className="button"
          disabled={!canSpeak}
          onClick={() => Option.match(sanitizedOverride, { onNone: () => {}, onSome: (text) => speakRiddle(text) })}
        >
          <T>Speak Override</T>
        </SpeakButton>

        <CloseModalButton />
      </footer>
    </article>
  );
}
