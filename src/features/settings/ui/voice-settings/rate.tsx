// services, features, and other libraries
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { gameSettingsMachineAtom, gameSettingsVoiceRateAtom } from "@/features/settings/state/game-settings";

// components
import { T } from "gt-react";
import { VoiceSlider } from "./voice-slider";

// types
import type { VoiceControl } from "./voice-slider";

// constants
// The control's name, label, and range travel together as one value, so the
// slider reads them from a single place instead of the component restating
// name, label, min, max and step as five separate props
const RATE_CONTROL = { name: "voiceRate", label: <T>Rate</T>, min: 0.5, max: 2, step: 0.05 } as const satisfies VoiceControl;

export function Rate() {
  const voiceRate = useAtomValue(gameSettingsVoiceRateAtom);
  const gameSettingsMachineEvent = useAtomSet(gameSettingsMachineAtom);

  return (
    <VoiceSlider {...RATE_CONTROL} value={voiceRate} onValueChange={(value) => gameSettingsMachineEvent({ type: "voiceRateChanged", voiceRate: value })} />
  );
}
