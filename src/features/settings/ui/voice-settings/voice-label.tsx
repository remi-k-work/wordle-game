// services, features, and other libraries
import { cn } from "@/lib/utils";
import { T } from "gt-react";

// components
import { Select } from "@base-ui/react/select";

// constants
// Fully static class strings, hoisted so re-renders don't re-run them through
// twMerge and the live select + its skeleton cannot drift apart (same pattern
// as dialog-chrome / chart-tab)
const VOICE_LABEL_CLASSES = cn("cursor-default font-sans text-sm font-semibold tracking-widest text-text-2 uppercase");

// Shared select chrome: identical between the live select and its skeleton —
// the Select.Root's disabled state (live: settings machine, skeleton: always)
// is what differs, so it stays at the call site
export function VoiceLabel() {
  return (
    <Select.Label className={VOICE_LABEL_CLASSES}>
      <T>Voice</T>
    </Select.Label>
  );
}
