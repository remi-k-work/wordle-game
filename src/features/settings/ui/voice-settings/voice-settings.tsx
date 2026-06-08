// components
import { Voice } from "./voice";
import { Volume } from "./volume";
import { Rate } from "./rate";
import { Pitch } from "./pitch";
import { Riddle } from "@/features/game/ui/riddle";

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
