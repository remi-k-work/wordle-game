// services, features, and other libraries
import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { gameSettingsMachineAtom, gameSettingsVoiceRateAtom } from "@/features/settings/state";

// components
import { Slider } from "@base-ui/react";
import { T } from "gt-next";

export function Rate() {
  const voiceRate = useAtomValue(gameSettingsVoiceRateAtom);
  const gameSettingsMachineEvent = useAtomSet(gameSettingsMachineAtom);

  return (
    <Slider.Root
      className="my-3 w-full"
      name="voiceRate"
      thumbAlignment="edge"
      min={0.5}
      max={2}
      step={0.05}
      value={voiceRate}
      onValueChange={(value) => gameSettingsMachineEvent({ type: "voiceRateChanged", voiceRate: value })}
    >
      <Slider.Label className="cursor-default font-sans text-sm font-semibold tracking-widest text-text-2 uppercase"><T>Rate</T></Slider.Label>
      <Slider.Control className="flex w-full touch-none items-center py-3 select-none">
        <Slider.Track className="h-6 w-full bg-linear-to-l from-destructive via-tile-yellow to-tile-green select-none">
          <Slider.Indicator className="bg-linear-to-b from-surface-1 via-surface-3 to-surface-1 opacity-75 select-none" />
          <Slider.Thumb className="size-11 bg-primary select-none has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent" />
        </Slider.Track>
      </Slider.Control>
    </Slider.Root>
  );
}

export function RateSkeleton() {
  return (
    <Slider.Root className="my-3 w-full" name="voiceRate" thumbAlignment="edge" min={0.5} max={2} step={0.05} value={1} onValueChange={() => {}} disabled>
      <Slider.Label className="cursor-default font-sans text-sm font-semibold tracking-widest text-text-2 uppercase"><T>Rate</T></Slider.Label>
      <Slider.Control className="flex w-full touch-none items-center py-3 select-none">
        <Slider.Track className="h-6 w-full bg-linear-to-l from-destructive via-tile-yellow to-tile-green select-none">
          <Slider.Indicator className="bg-linear-to-b from-surface-1 via-surface-3 to-surface-1 opacity-75 select-none" />
          <Slider.Thumb className="size-11 bg-primary select-none has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-accent" />
        </Slider.Track>
      </Slider.Control>
    </Slider.Root>
  );
}
