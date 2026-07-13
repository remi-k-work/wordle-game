// components
import { Voice, VoiceSkeleton } from "./voice";
import { Volume, VolumeSkeleton } from "./volume";
import { Rate, RateSkeleton } from "./rate";
import { Pitch, PitchSkeleton } from "./pitch";
import { Riddle, RiddleSkeleton } from "@/features/game/ui/riddle";

export default function VoiceSettings() {
  return (
    <article className="bg-surface-2 p-3 text-start">
      <Voice />
      <Volume />
      <Rate />
      <Pitch />
      <Riddle isVoiceTest />
    </article>
  );
}

export function VoiceSettingsSkeleton() {
  return (
    <article className="bg-surface-2 p-3 text-start">
      <VoiceSkeleton />
      <VolumeSkeleton />
      <RateSkeleton />
      <PitchSkeleton />
      <RiddleSkeleton isVoiceTest />
    </article>
  );
}
