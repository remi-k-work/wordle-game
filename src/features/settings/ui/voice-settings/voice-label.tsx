// services, features, and other libraries
import { cn } from "@/lib/utils";
import { T } from "gt-react";

// components
import { Select } from "@base-ui/react/select";

// constants
// Fully static class string, hoisted so re-renders don't re-run it through
// twMerge (same pattern as dialog-chrome / chart-tab)
// Shared with the slider: `VoiceSlider` labels its track the same way, so the
// one form-label chrome is stated here and imported there rather than restated
export const VOICE_LABEL_CLASSES = cn("cursor-default font-sans text-sm font-semibold tracking-widest text-text-2 uppercase");

// The voice select's label: this body has no loading state of its own — the
// dialog opens synchronously and each section is either live or derives its
// state from the settings machine — so the label needs only the one variant
export function VoiceLabel() {
  return (
    <Select.Label className={VOICE_LABEL_CLASSES}>
      <T>Voice</T>
    </Select.Label>
  );
}
