// react
import { useEffect, useState } from "react";

// Lists available SpeechSynthesis voices
export function useSpeechVoices() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    const synth = window.speechSynthesis;

    const update = () => setVoices(synth.getVoices());
    update();

    synth.addEventListener("voiceschanged", update, { signal: controller.signal });

    return () => controller.abort();
  }, []);

  return voices;
}
