// oxlint-disable effecttsgo/global-console

// react
import { useCallback } from "react";

// services, features, and other libraries
import { Option } from "effect";
import { AtomRegistry } from "effect/reactivity";
import { sharedAtomRegistry } from "@/ui/atom-registry-provider";
import {
  gameSettingsSolutionsLanguageAtom,
  gameSettingsVoicePitchAtom,
  gameSettingsVoiceRateAtom,
  gameSettingsVoiceAtom,
  gameSettingsVoiceVolumeAtom,
} from "@/features/settings/state/game-settings";
import { matchLanguage } from "@/features/game/domain/helpers";

export function useSpeakText() {
  return useCallback((sanitizedText: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      console.warn("Speech Synthesis is not supported in this environment.");
      return;
    }

    // Guard empty TTS input
    const trimmed = sanitizedText.trim();
    if (!trimmed) return;

    // Cancel any current speech
    const synth = window.speechSynthesis;
    synth.cancel();

    // Voice settings are only needed at speak time, so they are read imperatively
    // from the shared registry here instead of being subscribed to in render —
    // settings changes no longer re-render every mounted speak button
    // (rerender-defer-reads)
    const registry: AtomRegistry.AtomRegistry = sharedAtomRegistry;
    const solutionsLanguage = registry.get(gameSettingsSolutionsLanguageAtom);
    const voiceVoice = registry.get(gameSettingsVoiceAtom);
    const voiceVolume = registry.get(gameSettingsVoiceVolumeAtom);
    const voiceRate = registry.get(gameSettingsVoiceRateAtom);
    const voicePitch = registry.get(gameSettingsVoicePitchAtom);

    // Available voices are read at speak time too; by the time the user can click,
    // speechSynthesis has populated its voice list (useSpeechVoices' `voiceschanged`
    // subscription is only needed by components that *render* the voice list)
    const voices = synth.getVoices();

    const utterance = new SpeechSynthesisUtterance(trimmed);

    // Find the specific voice object using Kimi's safer fallback chain
    const targetLangPrefix = matchLanguage(solutionsLanguage, "en", "pl");
    const matchingLangs = voices.filter((voice) => voice.lang.toLowerCase().startsWith(targetLangPrefix));

    // A previously stored voice name still wins
    const exactByName = voices.find((voice) => voice.name === voiceVoice);

    // A "default: true" voice within the active language
    const defaultInLang = matchingLangs.find((voice) => voice.default);

    // First voice whose lang starts with the active language prefix
    const anyInLang = matchingLangs[0];

    // Last-resort, any voice we can find
    const fallback = voices[0];

    const selectedVoice = Option.firstSomeOf([
      Option.fromNullishOr(exactByName),
      Option.fromNullishOr(defaultInLang),
      Option.fromNullishOr(anyInLang),
      Option.fromNullishOr(fallback),
    ]);

    // Set the voice and language appropriately
    Option.match(selectedVoice, {
      onSome: (voice) => {
        utterance.voice = voice;

        // CRITICAL FOR ANDROID: Sync lang directly from the voice object
        utterance.lang = voice.lang;
      },
      onNone: () => {
        utterance.lang = matchLanguage(solutionsLanguage, "en-US", "pl-PL");
      },
    });

    // Set volume, rate, and pitch according to our voice settings
    utterance.volume = voiceVolume;
    utterance.rate = voiceRate;
    utterance.pitch = voicePitch;

    synth.speak(utterance);
  }, []);
}
