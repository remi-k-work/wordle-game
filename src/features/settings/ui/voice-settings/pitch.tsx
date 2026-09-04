// services, features, and other libraries
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { gameSettingsMachineAtom, gameSettingsVoicePitchAtom } from "@/features/settings/state";

// components
import { T } from "gt-next";
import { VoiceSliderField, VoiceSliderSkeleton } from "./voice-slider";

export function Pitch() {
  const voicePitch = useAtomValue(gameSettingsVoicePitchAtom);
  const gameSettingsMachineEvent = useAtomSet(gameSettingsMachineAtom);

  return (
    <VoiceSliderField
      name="voicePitch"
      label={<T>Pitch</T>}
      min={0.5}
      max={1.5}
      step={0.1}
      value={voicePitch}
      onValueChange={(value) => gameSettingsMachineEvent({ type: "voicePitchChanged", voicePitch: value })}
    />
  );
}

export function PitchSkeleton() {
  return <VoiceSliderSkeleton name="voicePitch" label={<T>Pitch</T>} min={0.5} max={1.5} step={0.1} skeletonValue={1} />;
}
