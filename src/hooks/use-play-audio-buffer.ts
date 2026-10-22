// oxlint-disable effecttsgo/global-console

// react
import { useCallback } from "react";

// services, features, and other libraries
import { sharedAtomRegistry } from "@/ui/atom-registry-provider";
import { gameSettingsVoiceVolumeAtom } from "@/features/settings/state/game-settings";

// Shared player: one element for the whole app (mirrors window.speechSynthesis)
let sharedAudio: HTMLAudioElement | null = null;

// Active Blob URL for the current playback (must be revoked manually)
let sharedUrl: string | null = null;

// Release the Blob URL without touching playback
function revokeSharedUrl() {
  if (sharedUrl !== null) {
    URL.revokeObjectURL(sharedUrl);
    sharedUrl = null;
  }
}

// Drop the media resource after playback ends (keeps the element reusable)
function releaseMedia(audio: HTMLAudioElement) {
  revokeSharedUrl();
  audio.removeAttribute("src");
  audio.load();
}

// Follow volume changes even mid-playback (never pauses or revokes). Like the
// `voiceschanged` listener in use-speech-voices, this is one module-scope
// subscription for the whole app, created on first playback — no component
// subscribes to the volume atom in render just to feed an effect
// (rerender-defer-reads)
let stopTrackingVolume: (() => void) | null = null;
function ensureVolumeTracking() {
  if (stopTrackingVolume !== null || typeof window === "undefined") return;
  stopTrackingVolume = sharedAtomRegistry.subscribe(
    gameSettingsVoiceVolumeAtom,
    (voiceVolume) => {
      if (sharedAudio !== null) sharedAudio.volume = voiceVolume;
    },
    { immediate: true }
  );
}

// Plays a generated MP3 buffer (e.g. from OpenRouter `generateSpeech`)
// Bytes live in `wordMetaTheRiddleAudioAtom`; playback outlives the caller on purpose
export function usePlayAudioBuffer() {
  return useCallback((audioBuffer: Uint8Array<ArrayBufferLike>) => {
    if (typeof window === "undefined" || typeof Audio === "undefined") {
      console.warn("HTMLAudio is not supported in this environment.");
      return;
    }

    // Guard empty TTS input
    if (audioBuffer.byteLength === 0) return;

    // Lazy-init the shared element
    const audio = (sharedAudio ??= new Audio());
    audio.preload = "auto";

    // Follow future volume changes mid-playback
    ensureVolumeTracking();

    // Cancel any current playback (parity with synth.cancel())
    audio.pause();
    revokeSharedUrl();

    // Copy defensively: keeps the atom's buffer replayable
    const copy = audioBuffer.slice(0);
    const blob = new Blob([copy as BlobPart], { type: "audio/mpeg" });
    const url = URL.createObjectURL(blob);
    sharedUrl = url;

    // Revoke on natural end (unmount-agnostic: fires after the caller is gone)
    audio.onended = () => releaseMedia(audio);
    audio.onerror = () => releaseMedia(audio);

    audio.src = url;

    // Volume is only needed at play time, so it is read imperatively from the
    // shared registry instead of being subscribed to in render — volume changes
    // no longer re-render every mounted speak button (rerender-defer-reads)
    audio.volume = sharedAtomRegistry.get(gameSettingsVoiceVolumeAtom);

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch((error: unknown) => {
        // Rejected play holds no audio: free the URL right away
        releaseMedia(audio);
        console.warn("Audio playback failed.", error);
      });
    }
  }, []);
}
