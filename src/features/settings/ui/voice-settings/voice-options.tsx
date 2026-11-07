// services, features, and other libraries
import { cn } from "@/lib/utils";

// components
import { Select } from "@base-ui/react/select";

// assets
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

// types
export interface VoiceOption {
  label: string;
  value: string;
}

// constants
// Fully static class strings, hoisted so no render of the option list re-runs them
// through twMerge (same pattern as VoiceLabel / VoiceTrigger)
const VOICE_OPTION_CLASSES = cn(
  "grid cursor-default grid-cols-[2rem_1fr] items-center gap-2 py-1.5 pr-4 pl-2.5 outline-hidden select-none",
  "data-highlighted:bg-accent data-selected:font-semibold data-selected:text-text-2"
);

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

// The popup body: the scroll arrows and one option row per available voice, the
// selected one marked with a check. Extracted from `Voice` so the select reads at
// a glance as label → trigger → popup, and so the option-row chrome is stated once
// instead of being rebuilt on each of the rows' renders
export function VoiceOptions({ voices }: { voices: ReadonlyArray<VoiceOption> }) {
  return (
    <>
      <ScrollUpArrow />
      <Select.List className="relative max-h-(--available-height) scroll-py-6 overflow-y-auto py-1">
        {voices.map(({ label, value }) => (
          <Select.Item key={value} value={value} className={VOICE_OPTION_CLASSES}>
            <Select.ItemIndicator className="col-start-1">
              <CheckIcon className="size-9" />
            </Select.ItemIndicator>
            <Select.ItemText className="col-start-2 text-balance">{label}</Select.ItemText>
          </Select.Item>
        ))}
      </Select.List>
      <ScrollDownArrow />
    </>
  );
}
