// services, features, and other libraries
import { Effect } from "effect";
import { sharedAtomRegistry } from "@/ui/atom-registry-provider";
import { gameSettingsVoiceVolumeAtom } from "@/features/settings/state/game-settings";
import { RuntimeClient } from "@/lib/runtime-client";

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

// Follow volume changes even mid-playback (never pauses or revokes). The
// subscription is scoped to a single playback and released with the rest of the
// playback resources, so the volume atom (and its registry entry) is not pinned
// for the page's lifetime after the first play
let stopTrackingVolume: (() => void) | null = null;
function trackVolume(audio: HTMLAudioElement) {
  if (typeof window === "undefined") return;
  stopTrackingVolume = sharedAtomRegistry.subscribe(
    gameSettingsVoiceVolumeAtom,
    (voiceVolume) => {
      audio.volume = voiceVolume;
    },
    { immediate: true }
  );
}

// Release the per-playback resources (Blob URL + volume subscription) without
// touching the element itself
function releasePlaybackResources() {
  stopTrackingVolume?.();
  stopTrackingVolume = null;
  revokeSharedUrl();
}

// Drop the media resource after playback ends (keeps the element reusable)
function releaseMedia(audio: HTMLAudioElement) {
  releasePlaybackResources();
  audio.removeAttribute("src");
  audio.load();
}

// Log through the shared client runtime instead of a bare console call, so
// browser warnings share the app's logging sink (fire-and-forget, mirroring the
// machine Effect actions: failures cannot reject into a media event callback).
// runFork (not `void runPromise`) — returns a Fiber, never a dangling Promise
const logWarning = (message: string, error?: unknown) => RuntimeClient.runFork(Effect.logWarning(message, error));

// Plays a generated MP3 buffer (e.g. from OpenRouter `generateSpeech`)
// Bytes live in `wordMetaTheRiddleAudioAtom`; playback outlives the caller on purpose
// A plain closure, not a `useCallback` (same reasoning as `useSpeakText`): the
// body reads no React state or props, and every call site wraps it in its own
// inline arrow
export function usePlayAudioBuffer() {
  return (audioBuffer: Uint8Array<ArrayBufferLike>) => {
    if (typeof window === "undefined" || typeof Audio === "undefined") {
      logWarning("HTMLAudio is not supported in this environment.");
      return;
    }

    // Guard empty TTS input
    if (audioBuffer.byteLength === 0) return;

    // Lazy-init the shared element
    const audio = (sharedAudio ??= new Audio());
    audio.preload = "auto";

    // Cancel any current playback (parity with synth.cancel()): pausing does
    // not fire onended, so the previous playback's resources are released here
    // instead of leaking until some later end. The handlers are cleared first
    // so a stale end/error event from the old media cannot release the new
    // playback below; the element is not `load()`ed without a src, since the
    // new src assigned below replaces it anyway
    audio.onended = null;
    audio.onerror = null;
    audio.pause();
    releasePlaybackResources();

    // Follow future volume changes mid-playback (immediate also sets the
    // starting volume, so no separate registry read is needed at play time)
    trackVolume(audio);

    // Copy defensively: keeps the atom's buffer replayable (a fresh copy is
    // also ArrayBuffer-backed, which is a valid BlobPart without a cast)
    const blob = new Blob([new Uint8Array(audioBuffer)], { type: "audio/mpeg" });
    const url = URL.createObjectURL(blob);
    sharedUrl = url;

    // Revoke on natural end (unmount-agnostic: fires after the caller is gone)
    audio.onended = () => releaseMedia(audio);
    audio.onerror = () => releaseMedia(audio);

    audio.src = url;

    audio.play().catch((error: unknown) => {
      // Rejected play holds no audio: free the URL right away
      releaseMedia(audio);
      logWarning("Audio playback failed.", error);
    });
  };
}
