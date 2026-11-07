// services, features, and other libraries
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { gameSettingsMachineAtom, gameSettingsVoicePitchAtom } from "@/features/settings/state/game-settings";

// components
import { T } from "gt-react";
import { VoiceSlider } from "./voice-slider";

// types
import type { VoiceControl } from "./voice-slider";

// constants
// The control's name, label, and range travel together as one value, so the
// slider reads them from a single place instead of the component restating
// name, label, min, max and step as five separate props
const PITCH_CONTROL = { name: "voicePitch", label: <T>Pitch</T>, min: 0.5, max: 1.5, step: 0.1 } as const satisfies VoiceControl;

export function Pitch() {
  const voicePitch = useAtomValue(gameSettingsVoicePitchAtom);
  const gameSettingsMachineEvent = useAtomSet(gameSettingsMachineAtom);

  return (
    <VoiceSlider {...PITCH_CONTROL} value={voicePitch} onValueChange={(value) => gameSettingsMachineEvent({ type: "voicePitchChanged", voicePitch: value })} />
  );
}
