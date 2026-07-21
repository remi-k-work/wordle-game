// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { gameSettingsMachineAtom, gameSettingsSolutionsLanguageAtom, gameSettingsVoiceVoiceAtom } from "@/features/settings/state";
import { useSpeechVoices } from "@/hooks";

// components
import { Select } from "@base-ui/react";

// assets
import { CheckIcon, ChevronDownIcon, ChevronUpDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

export function Voice() {
  const solutionsLanguage = useAtomValue(gameSettingsSolutionsLanguageAtom);
  const voiceVoice = useAtomValue(gameSettingsVoiceVoiceAtom);
  const gameSettingsMachineEvent = useAtomSet(gameSettingsMachineAtom);

  const targetLangPrefix = solutionsLanguage === "En" ? "en" : "pl";

  // Filter voices by current language and ALWAYS store the actual name, never null
  const voices = useSpeechVoices()
    .filter((voice) => voice.lang.toLowerCase().startsWith(targetLangPrefix))
    .map(({ default: isDefault, name, lang }) => ({
      label: `${name} (${lang}) ${isDefault ? " — DEFAULT" : ""}`,
      value: name,
    }));

  return (
    <section>
      <Select.Root items={voices} value={voiceVoice} onValueChange={(value) => gameSettingsMachineEvent({ type: "voiceVoiceChanged", voiceVoice: value })}>
        <Select.Label className="cursor-default font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">Voice</Select.Label>
        <Select.Trigger
          className={cn(
            "flex w-full items-center justify-between gap-3 border bg-surface-3 px-4 py-2 text-start leading-none font-semibold text-balance",
            "transition duration-300 ease-in-out",
            "active:scale-95",
            "focus-visible:outline-2 focus-visible:outline-offset-1",
            "data-disabled:pointer-events-none data-disabled:opacity-50",
            "hover:not-data-disabled:bg-accent data-popup-open:bg-accent"
          )}
        >
          <Select.Value className="data-placeholder:text-text-2/50" placeholder="Select Voice" />
          <Select.Icon>
            <ChevronUpDownIcon className="size-11" />
          </Select.Icon>
        </Select.Trigger>
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
              <Select.ScrollUpArrow
                className={cn(
                  "top-0 z-1 flex w-full cursor-default items-center justify-center bg-primary",
                  "before:absolute before:left-0 before:h-full before:w-full before:content-['']",
                  "data-[side=none]:before:-top-full"
                )}
              >
                <ChevronUpIcon className="size-11" />
              </Select.ScrollUpArrow>
              <Select.List className="relative max-h-(--available-height) scroll-py-6 overflow-y-auto py-1">
                {voices.map(({ label, value }) => (
                  <Select.Item
                    key={label}
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
              <Select.ScrollDownArrow
                className={cn(
                  "bottom-0 z-1 flex w-full cursor-default items-center justify-center bg-primary",
                  "before:absolute before:left-0 before:h-full before:w-full before:content-['']",
                  "data-[side=none]:before:-bottom-full"
                )}
              >
                <ChevronDownIcon className="size-11" />
              </Select.ScrollDownArrow>
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
      <Select.Root items={[]} value={null} onValueChange={() => {}} disabled>
        <Select.Label className="cursor-default font-sans text-sm font-semibold tracking-widest text-text-2 uppercase">Voice</Select.Label>
        <Select.Trigger
          className={cn(
            "flex w-full items-center justify-between gap-3 border bg-surface-3 px-4 py-2 text-start leading-none font-semibold text-balance",
            "transition duration-300 ease-in-out",
            "active:scale-95",
            "focus-visible:outline-2 focus-visible:outline-offset-1",
            "data-disabled:pointer-events-none data-disabled:opacity-50",
            "hover:not-data-disabled:bg-accent data-popup-open:bg-accent"
          )}
        >
          <Select.Value className="data-placeholder:text-text-2/50" placeholder="Select Voice" />
          <Select.Icon>
            <ChevronUpDownIcon className="size-11" />
          </Select.Icon>
        </Select.Trigger>
      </Select.Root>
    </section>
  );
}
