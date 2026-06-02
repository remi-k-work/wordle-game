// components
import { Voice } from "./Voice";
import { Volume } from "./Volume";
import { Rate } from "./Rate";
import { Pitch } from "./Pitch";
import { Riddle } from "@/features/game/ui/Riddle";

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
