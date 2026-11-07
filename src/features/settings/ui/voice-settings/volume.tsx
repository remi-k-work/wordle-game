// services, features, and other libraries
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { gameSettingsMachineAtom, gameSettingsVoiceVolumeAtom } from "@/features/settings/state/game-settings";

// components
import { T } from "gt-react";
import { VoiceSlider } from "./voice-slider";
import type { VoiceControl } from "./voice-slider";

// constants
// The control's name, label, and range travel together as one value, so the
// slider reads them from a single place instead of the component restating
// name, label, min, max and step as five separate props
const VOLUME_CONTROL = { name: "voiceVolume", label: <T>Volume</T>, min: 0, max: 1, step: 0.1 } as const satisfies VoiceControl;

export function Volume() {
  const voiceVolume = useAtomValue(gameSettingsVoiceVolumeAtom);
  const gameSettingsMachineEvent = useAtomSet(gameSettingsMachineAtom);

  return (
    <VoiceSlider
      {...VOLUME_CONTROL}
      value={voiceVolume}
      onValueChange={(value) => gameSettingsMachineEvent({ type: "voiceVolumeChanged", voiceVolume: value })}
    />
  );
}
