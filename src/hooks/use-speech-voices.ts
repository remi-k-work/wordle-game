// react
import { useEffect, useState } from "react";

export function useSpeechVoices() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const synth = window.speechSynthesis;

    const update = () => setVoices(synth.getVoices());

    update();

    synth.addEventListener("voiceschanged", update);

    return () => {
      synth.removeEventListener("voiceschanged", update);
    };
  }, []);

  return voices;
}
