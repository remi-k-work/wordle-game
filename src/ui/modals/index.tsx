"use client";

// components
import { HelpModal } from "./help";
import { HighScoreModal } from "./high-score";
import { VoiceSettingsModal } from "./voice-settings";
import { WinOrLoseModal } from "./win-or-lose";

export function Modals() {
  return (
    <>
      <HelpModal />
      <HighScoreModal />
      <VoiceSettingsModal />
      <WinOrLoseModal />
    </>
  );
}
