// services, features, and other libraries
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { gameSettingsMachineAtom, gameSettingsVoiceRateAtom } from "@/features/settings/state";

// components
import { T } from "gt-next";
import { VoiceSliderField, VoiceSliderSkeleton } from "./voice-slider";

export function Rate() {
  const voiceRate = useAtomValue(gameSettingsVoiceRateAtom);
  const gameSettingsMachineEvent = useAtomSet(gameSettingsMachineAtom);

  return (
    <VoiceSliderField
      name="voiceRate"
      label={<T>Rate</T>}
      min={0.5}
      max={2}
      step={0.05}
      value={voiceRate}
      onValueChange={(value) => gameSettingsMachineEvent({ type: "voiceRateChanged", voiceRate: value })}
    />
  );
}

export function RateSkeleton() {
  return <VoiceSliderSkeleton name="voiceRate" label={<T>Rate</T>} min={0.5} max={2} step={0.05} skeletonValue={1} />;
}
