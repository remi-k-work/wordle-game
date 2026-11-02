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

// assets
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

// Shared chrome for the select scroll arrows: identical structure, only the
// vertical anchor (top/bottom) and the `data-[side=none]` before-position differ
const SCROLL_ARROW_COMMON = cn(
  "z-1 flex w-full cursor-default items-center justify-center bg-primary",
  "before:absolute before:left-0 before:h-full before:w-full before:content-['']"
);

function ScrollUpArrow() {
  return (
    <Select.ScrollUpArrow className={cn("top-0", SCROLL_ARROW_COMMON, "data-[side=none]:before:-top-full")}>
      <ChevronUpIcon className="size-11" />
    </Select.ScrollUpArrow>
  );
}

function ScrollDownArrow() {
  return (
    <Select.ScrollDownArrow className={cn("bottom-0", SCROLL_ARROW_COMMON, "data-[side=none]:before:-bottom-full")}>
      <ChevronDownIcon className="size-11" />
    </Select.ScrollDownArrow>
  );
}

export function Voice() {
  const solutionsLanguage = useAtomValue(gameSettingsSolutionsLanguageAtom);
  const voiceVoice = useAtomValue(gameSettingsVoiceAtom);
  const gameSettingsMachineEvent = useAtomSet(gameSettingsMachineAtom);
  const gt = useGT();

  const targetLangPrefix = matchLanguage(solutionsLanguage, "en", "pl");

  // Filter voices by current language and ALWAYS store the actual name, never null
  const voices = useSpeechVoices()
    .filter((voice) => voice.lang.toLowerCase().startsWith(targetLangPrefix))
    .map(({ default: isDefault, name, lang }) => ({
      label: `${name} (${lang}) ${isDefault ? ` — ${gt("Default")}` : ""}`,
      value: name,
    }));

  return (
    <section>
      <Select.Root
        name="voiceVoice"
        items={voices}
        value={voiceVoice}
        onValueChange={(value) => gameSettingsMachineEvent({ type: "voiceVoiceChanged", voiceVoice: value })}
      >
        <VoiceLabel />
        <VoiceTrigger />
        <Select.Portal>
          <Select.Positioner className="z-10 outline-hidden select-none" sideOffset={4}>
            <Select.Popup
              className={cn(
                "group border bg-surface-2 bg-clip-padding shadow-sm outline-hidden",
                "transition duration-300 ease-in-out",
                "min-w-(--anchor-width) origin-(--transform-origin)",
                "data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0",
                "data-[side=none]:min-w-[calc(var(--anchor-width)+1.75rem)] data-[side=none]:translate-y-px data-[side=none]:data-ending-style:transition-none data-[side=none]:data-starting-style:scale-100 data-[side=none]:data-starting-style:opacity-100 data-[side=none]:data-starting-style:transition-none"
              )}
            >
              <ScrollUpArrow />
              <Select.List className="relative max-h-(--available-height) scroll-py-6 overflow-y-auto py-1">
                {voices.map(({ label, value }) => (
                  <Select.Item
                    key={value}
                    value={value}
                    className={cn(
                      "grid cursor-default grid-cols-[2rem_1fr] items-center gap-2 py-1.5 pr-4 pl-2.5 outline-hidden select-none",
                      "data-highlighted:bg-accent data-selected:font-semibold data-selected:text-text-2"
                    )}
                  >
                    <Select.ItemIndicator className="col-start-1">
                      <CheckIcon className="size-9" />
                    </Select.ItemIndicator>
                    <Select.ItemText className="col-start-2 text-balance">{label}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.List>
              <ScrollDownArrow />
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </section>
  );
}

export function VoiceSkeleton() {
  return (
    <section>
      <Select.Root name="voiceVoice" items={[]} value={null} onValueChange={() => {}} disabled>
        <VoiceLabel />
        <VoiceTrigger />
      </Select.Root>
    </section>
  );
}
