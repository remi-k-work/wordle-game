// services, features, and other libraries
import { Atom } from "effect/reactivity";

// No `window` (SSR) means the empty snapshot and no listener
const EMPTY_VOICES: readonly SpeechSynthesisVoice[] = [];

// Available SpeechSynthesis voices, in the same shape as the once-a-second
// `secondTickAtom` (features/game/state/word-challenge): the read primes the
// snapshot and attaches the single global `voiceschanged` listener, publishes
// new snapshots with `setSelf`, and detaches the listener through
// `addFinalizer` once the atom loses its last subscriber (so no listener
// survives an unmounted voice list). One listener serves every mounted voice
// list instead of one module-store subscription per component, and `setSelf`
// replaces the hand-rolled `isSameVoices` change detection
export const speechVoicesAtom = Atom.readable<readonly SpeechSynthesisVoice[]>((get) => {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return EMPTY_VOICES;

  const voices = window.speechSynthesis.getVoices();

  const update = () => get.setSelf(window.speechSynthesis.getVoices());
  window.speechSynthesis.addEventListener("voiceschanged", update);
  get.addFinalizer(() => window.speechSynthesis.removeEventListener("voiceschanged", update));

  return voices;
});
