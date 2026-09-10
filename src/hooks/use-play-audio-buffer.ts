// oxlint-disable effecttsgo/global-console

// react
import { useCallback, useEffect, useRef } from "react";

// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { gameSettingsVoiceVolumeAtom } from "@/features/settings/state";

// Plays a generated MP3 ArrayBuffer (e.g. from OpenRouter `generateSpeech`)
export function usePlayAudioBuffer() {
  // We only need volume here; pitch and rate are baked into the generated audio
  const voiceVolume = useAtomValue(gameSettingsVoiceVolumeAtom);

  // Keep track of the active audio element and Object URL for cleanup
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const blobUrlRef = useRef<string | null>(null);

  // Cleanup on unmount: stop playback and release the Blob URL
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
      if (blobUrlRef.current !== null) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    };
  }, []);

  return useCallback(
    (audioBuffer: ArrayBuffer) => {
      if (typeof window === "undefined" || typeof Audio === "undefined") {
        console.warn("HTMLAudio is not supported in this environment.");
        return;
      }

      // Guard empty TTS input
      if (audioBuffer.byteLength === 0) return;

      // Lazy-init the persistent element
      const audio = (audioRef.current ??= new Audio());
      audio.preload = "auto";

      // Cancel any current playback (parity with synth.cancel())
      audio.pause();
      if (blobUrlRef.current !== null) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }

      // Copy defensively: constructing a Blob from the buffer can neuter it
      const copy = audioBuffer.slice(0);
      const blob = new Blob([copy], { type: "audio/mpeg" });
      const url = URL.createObjectURL(blob);
      blobUrlRef.current = url;

      audio.src = url;
      audio.volume = voiceVolume;

      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((error: unknown) => {
          console.warn("Audio playback failed.", error);
        });
      }
    },
    [voiceVolume]
  );
}
