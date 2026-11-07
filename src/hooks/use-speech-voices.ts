// react
import { useSyncExternalStore } from "react";

// Shared module-level voice store: one `voiceschanged` listener and one
// cached `getVoices()` snapshot serve every hook instance, no matter how
// many speak buttons mount (client-event-listeners dedup + cached storage
// read). `getVoices()` is called once per store change instead of once per
// component mount
const EMPTY_VOICES: readonly SpeechSynthesisVoice[] = [];

let voices: readonly SpeechSynthesisVoice[] = EMPTY_VOICES;
const listeners = new Set<() => void>();
let isListening = false;

const isSameVoices = (a: readonly SpeechSynthesisVoice[], b: readonly SpeechSynthesisVoice[]) =>
  a.length === b.length && a.every((voice, index) => voice === b[index]);

// getSnapshot must return a cached reference until the data really changes,
// otherwise useSyncExternalStore would loop on every check
const updateVoices = () => {
  const next = window.speechSynthesis.getVoices();
  if (!isSameVoices(next, voices)) {
    voices = next;
    for (const listener of listeners) listener();
  }
};

const subscribe = (onStoreChange: () => void) => {
  listeners.add(onStoreChange);

  // The first subscriber attaches the single global listener and primes the
  // initial snapshot; the last one detaches it again, so the app does not keep
  // a `voiceschanged` listener alive once nothing renders the voice list anymore.
  // Re-attaching re-primes, so a voice list that loads after the last unmount
  // is picked up by the next subscriber instead of being silently dropped
  if (listeners.size === 1) {
    isListening = true;
    window.speechSynthesis.addEventListener("voiceschanged", updateVoices);
    updateVoices();
  }

  return () => {
    listeners.delete(onStoreChange);

    if (listeners.size === 0 && isListening) {
      isListening = false;
      window.speechSynthesis.removeEventListener("voiceschanged", updateVoices);
    }
  };
};

const getSnapshot = () => voices;

const getServerSnapshot = () => EMPTY_VOICES;

// Lists available SpeechSynthesis voices
export function useSpeechVoices() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
