// components
import { Voice } from "./voice";
import { Volume } from "./volume";
import { Rate } from "./rate";
import { Pitch } from "./pitch";
import { RiddleVoiceTest } from "@/features/game/ui/riddle";

// This body never had a "whole modal is loading" state of its own — the dialog
// opens synchronously and each section is either live or derives its own state
// from the settings machine — so it deliberately ships only the live variant
export function VoiceSettings() {
  return (
    <article className="bg-surface-2 p-3 text-start">
      <Voice />
      <Volume />
      <Rate />
      <Pitch />
      <RiddleVoiceTest />
    </article>
  );
}
