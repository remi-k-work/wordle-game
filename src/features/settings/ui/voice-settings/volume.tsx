// services, features, and other libraries
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { gameSettingsMachineAtom, gameSettingsVoiceVolumeAtom } from "@/features/settings/state/game-settings";

// components
import { T } from "gt-react";
import { VoiceSlider, VoiceSliderSkeleton } from "./voice-slider";

export function Volume() {
  const voiceVolume = useAtomValue(gameSettingsVoiceVolumeAtom);
  const gameSettingsMachineEvent = useAtomSet(gameSettingsMachineAtom);

  return (
    <VoiceSlider
      name="voiceVolume"
      label={<T>Volume</T>}
      min={0}
      max={1}
      step={0.1}
      value={voiceVolume}
      onValueChange={(value) => gameSettingsMachineEvent({ type: "voiceVolumeChanged", voiceVolume: value })}
    />
  );
}

export function VolumeSkeleton() {
  return <VoiceSliderSkeleton name="voiceVolume" label={<T>Volume</T>} min={0} max={1} step={0.1} skeletonValue={1} />;
}
