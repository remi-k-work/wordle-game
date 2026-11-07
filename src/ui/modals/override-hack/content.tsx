// services, features, and other libraries
import { Option } from "effect";
import { useAtomValue } from "@effect/atom-react";
import {
  overdriveHacksIsApplyingOverrideAtom,
  overdriveHacksIsIdleAtom,
  overdriveHacksTheOverrideAtom,
  overdriveHacksTheOverrideAudioAtom,
} from "@/features/overdrive-hacks/state/overdrive-hacks";
import { T } from "gt-react";

// components
import { CloseModalButton } from "@/ui/modal-close-button";
import { SpeakActions } from "@/ui/speak-actions";
import { PulsingStatusText } from "@/ui/pulsing-status-text";

// constants
import { DIALOG_FOOTER_CLASSES } from "@/ui/dialog-chrome";

export function Content() {
  const theOverride = useAtomValue(overdriveHacksTheOverrideAtom);
  const theOverrideAudio = useAtomValue(overdriveHacksTheOverrideAudioAtom);

  // Derived boolean atoms: re-render only when the flags actually flip
  const isAwaiting = useAtomValue(overdriveHacksIsIdleAtom);
  const isLoading = useAtomValue(overdriveHacksIsApplyingOverrideAtom);

  return (
    <article className="mx-auto max-w-prose space-y-9">
      {/* The same three-state cascade the riddle shows, on the shared
          `PulsingStatusText`: the override is generated on demand exactly like
          the riddle, so "waiting / thinking / unavailable" is stated once for
          both surfaces and this modal only resolves its own copy */}
      <PulsingStatusText
        isAwaiting={isAwaiting}
        isLoading={isLoading}
        awaiting={<T>Waiting for the override being requested...</T>}
        loading={<T>Thinking...</T>}
      >
        {Option.getOrElse(theOverride, () => (
          <T>Override unavailable. You are on your own! Please try again later.</T>
        ))}
      </PulsingStatusText>

      <footer className={DIALOG_FOOTER_CLASSES}>
        <SpeakActions sanitizedText={theOverride} audioBuffer={theOverrideAudio} label={<T>Speak Override</T>} />

        <CloseModalButton className="mt-0" />
      </footer>
    </article>
  );
}
