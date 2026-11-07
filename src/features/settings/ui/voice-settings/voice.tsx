// react
import { useMemo } from "react";

// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { gameSettingsMachineAtom, gameSettingsSolutionsLanguageAtom, gameSettingsVoiceAtom } from "@/features/settings/state/game-settings";
import { useSpeechVoices } from "@/hooks/use-speech-voices";
import { matchLanguage } from "@/features/game/domain/helpers";
import { useGT } from "gt-react";

// components
import { Select } from "@base-ui/react/select";
import { VoiceLabel } from "./voice-label";
import { VoiceTrigger } from "./voice-trigger";
import { VoiceOptions } from "./voice-options";

// constants
// Fully static class string, hoisted out of the render path so no render of
// `Voice` re-runs it through twMerge (same pattern as VoiceLabel/VoiceTrigger)
const VOICE_POPUP_CLASSES = cn(
  "group border bg-surface-2 bg-clip-padding shadow-sm outline-hidden",
  "transition duration-300 ease-in-out",
  "min-w-(--anchor-width) origin-(--transform-origin)",
  "data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0",
  "data-[side=none]:min-w-[calc(var(--anchor-width)+1.75rem)] data-[side=none]:translate-y-px data-[side=none]:data-ending-style:transition-none data-[side=none]:data-starting-style:scale-100 data-[side=none]:data-starting-style:opacity-100 data-[side=none]:data-starting-style:transition-none"
);

export function Voice() {
  const solutionsLanguage = useAtomValue(gameSettingsSolutionsLanguageAtom);
  const selectedVoice = useAtomValue(gameSettingsVoiceAtom);
  const gameSettingsMachineEvent = useAtomSet(gameSettingsMachineAtom);
  const gt = useGT();
  const speechVoices = useSpeechVoices();

  const targetLangPrefix = matchLanguage(solutionsLanguage, "en", "pl");

  // Filter voices by current language and ALWAYS store the actual name, never null
  // Memoized because `Select.Root` receives `items` as a prop: a freshly
  // allocated array every render gives the select a changed input each time, so
  // it re-derives its list state from an identical value. This is the one memo
  // in the voice settings — every other value here is either a hoisted style
  // constant or a primitive the select already compares by value
  //
  // The "Default" marker is translated inside the memo rather than hoisted into
  // a render-time constant: it would then be a derived value the memo depends
  // on, so a translator that did not return a stable string would silently
  // invalidate the memo on every render. `gt` is itself memoized by gt-react
  // (bound to the active locale), so it is a sound dependency
  const voices = useMemo(() => {
    const defaultVoiceMarker = ` — ${gt("Default")}`;
    return speechVoices
      .filter((voice) => voice.lang.toLowerCase().startsWith(targetLangPrefix))
      .map(({ default: isDefault, name, lang }) => ({
        label: `${name} (${lang}) ${isDefault ? defaultVoiceMarker : ""}`,
        value: name,
      }));
  }, [speechVoices, targetLangPrefix, gt]);

  return (
    <section>
      <Select.Root
        name="voiceVoice"
        items={voices}
        value={selectedVoice}
        onValueChange={(value) => gameSettingsMachineEvent({ type: "voiceVoiceChanged", voiceVoice: value })}
      >
        <VoiceLabel />
        <VoiceTrigger />
        <Select.Portal>
          <Select.Positioner className="z-10 outline-hidden select-none" sideOffset={4}>
            <Select.Popup className={VOICE_POPUP_CLASSES}>
              <VoiceOptions voices={voices} />
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </section>
  );
}
