// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useGT } from "gt-react";

// components
import { Select } from "@base-ui/react/select";

// assets
import { ChevronUpDownIcon } from "@heroicons/react/24/outline";

// constants
// Fully static class strings, hoisted so re-renders don't re-run them through
// twMerge and the live select + its skeleton cannot drift apart (same pattern
// as dialog-chrome / chart-tab)
const VOICE_TRIGGER_CLASSES = cn(
  "flex w-full items-center justify-between gap-3 border bg-surface-3 px-4 py-2 text-start leading-none font-semibold text-balance",
  "transition duration-300 ease-in-out",
  "active:scale-95",
  "focus-visible:outline-2 focus-visible:outline-offset-1",
  "data-disabled:pointer-events-none data-disabled:opacity-50",
  "hover:not-data-disabled:bg-accent data-popup-open:bg-accent"
);

export function VoiceTrigger() {
  const gt = useGT();

  return (
    <Select.Trigger className={VOICE_TRIGGER_CLASSES}>
      <Select.Value className="data-placeholder:text-text-2/50" placeholder={gt("Select Voice")} />
      <Select.Icon>
        <ChevronUpDownIcon className="size-11" />
      </Select.Icon>
    </Select.Trigger>
  );
}
