// services, features, and other libraries
import { cn } from "@/lib/utils";
import { Option } from "effect";
import { useAtomValue } from "@effect/atom-react";
import { overdriveHacksMachineAtom, overdriveHacksTheOverrideAtom, overdriveHacksTheOverrideAudioAtom } from "@/features/overdrive-hacks/state";

// components
import { T } from "gt-next";
import { CloseModalButton } from "@/ui/modal-close-button";
import { SpeakButtonNatural, SpeakButtonRegular } from "@/ui/speak-button";

// constants
import { DIALOG_FOOTER_CLASSES } from "@/ui/dialog-chrome";

export function Content() {
  const overdriveHacksMachineSnapshot = useAtomValue(overdriveHacksMachineAtom);
  const theOverride = useAtomValue(overdriveHacksTheOverrideAtom);
  const theOverrideAudio = useAtomValue(overdriveHacksTheOverrideAudioAtom);

  const isAwaiting = overdriveHacksMachineSnapshot.matches("idle");
  const isLoading = overdriveHacksMachineSnapshot.matches("applyingOverrideHack");
  const canSpeakRegular = Option.isSome(theOverride) && !isAwaiting && !isLoading;
  const canSpeakNatural = canSpeakRegular && Option.isSome(theOverrideAudio);

  return (
    <article className="mx-auto max-w-prose space-y-9">
      <p className={cn("mx-auto text-center text-lg leading-relaxed sm:text-xl lg:text-2xl", (isAwaiting || isLoading) && "animate-pulse")}>
        {isAwaiting ? (
          <T>Waiting for the override being requested...</T>
        ) : isLoading ? (
          <T>Thinking...</T>
        ) : (
          Option.getOrElse(theOverride, () => <T>Override unavailable. You are on your own! Please try again later.</T>)
        )}
      </p>

      <footer className={DIALOG_FOOTER_CLASSES}>
        <SpeakButtonRegular sanitizedText={theOverride} disabled={!canSpeakRegular}>
          <T>Speak Override</T>
        </SpeakButtonRegular>

        <SpeakButtonNatural audioBuffer={theOverrideAudio} disabled={!canSpeakNatural}>
          <T>Speak Override</T>
        </SpeakButtonNatural>

        <CloseModalButton className="mt-0" />
      </footer>
    </article>
  );
}
