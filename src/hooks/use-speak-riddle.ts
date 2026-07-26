// react
import { useCallback } from "react";

// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import {
  gameSettingsSolutionsLanguageAtom,
  gameSettingsVoicePitchAtom,
  gameSettingsVoiceRateAtom,
  gameSettingsVoiceVoiceAtom,
  gameSettingsVoiceVolumeAtom,
} from "@/features/settings/state";
import { useSpeechVoices } from ".";

export function useSpeakRiddle() {
  const solutionsLanguage = useAtomValue(gameSettingsSolutionsLanguageAtom);
  const voiceVoice = useAtomValue(gameSettingsVoiceVoiceAtom);
  const voiceVolume = useAtomValue(gameSettingsVoiceVolumeAtom);
  const voiceRate = useAtomValue(gameSettingsVoiceRateAtom);
  const voicePitch = useAtomValue(gameSettingsVoicePitchAtom);

  // Fetch the available voices
  const voices = useSpeechVoices();

  return useCallback(
    (sanitizedRiddle: string) => {
      if (typeof window === "undefined" || !window.speechSynthesis) {
        console.warn("Speech Synthesis is not supported in this environment.");
        return;
      }

      // Guard empty TTS input
      const trimmed = sanitizedRiddle.trim();
      if (!trimmed) return;

      // Cancel any current speech
      const synth = window.speechSynthesis;
      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(trimmed);

      // Find the specific voice object using Kimi's safer fallback chain
      const targetLangPrefix = solutionsLanguage === "En" ? "en" : "pl";
      const matchingLangs = voices.filter((voice) => voice.lang.toLowerCase().startsWith(targetLangPrefix));

      // A previously stored voice name still wins
      const exactByName = voices.find((voice) => voice.name === voiceVoice);

      // A "default: true" voice within the active language
      const defaultInLang = matchingLangs.find((voice) => voice.default);

      // First voice whose lang starts with the active language prefix
      const anyInLang = matchingLangs[0];

      // Last-resort, any voice we can find
      const fallback = voices[0];

      const selectedVoice = exactByName ?? defaultInLang ?? anyInLang ?? fallback ?? null;

      // Set the voice and language appropriately
      if (selectedVoice) {
        utterance.voice = selectedVoice;

        // CRITICAL FOR ANDROID: Sync lang directly from the voice object
        utterance.lang = selectedVoice.lang;
      } else {
        utterance.lang = solutionsLanguage === "En" ? "en-US" : "pl-PL";
      }

      // Set volume, rate, and pitch according to our voice settings
      utterance.volume = voiceVolume;
      utterance.rate = voiceRate;
      utterance.pitch = voicePitch;

      synth.speak(utterance);
    },
    [solutionsLanguage, voiceVoice, voiceVolume, voiceRate, voicePitch, voices]
  );
}
