// services, features, and other libraries
import { Option } from "effect";

// components
import { SpeakButtonNatural, SpeakButtonRegular } from "./speak-button";

// types
import type { ReactNode } from "react";

interface SpeakActionsProps {
  // The generated text; it is `None` both while it is still being generated and when the generator failed,
  // and either way there is nothing to read aloud
  sanitizedText: Option.Option<string>;
  // The generated audio for that same text: `None` until it arrives, and permanently when the text has none
  audioBuffer: Option.Option<Uint8Array<ArrayBufferLike>>;
  // One label for both engines; each reads the same text aloud
  label: ReactNode;
}

// The two actions every generated-text surface offers: read the text with the browser's synthesiser, or play the audio generated for it
export function SpeakActions({ sanitizedText, audioBuffer, label }: SpeakActionsProps) {
  // The rule is stated once here now, and each engine is enabled by exactly what it needs
  // the synthesiser needs the text, the generated one needs the text and its audio
  const canSpeakRegular = Option.isSome(sanitizedText);
  const canSpeakNatural = canSpeakRegular && Option.isSome(audioBuffer);

  return (
    <>
      <SpeakButtonRegular sanitizedText={sanitizedText} disabled={!canSpeakRegular}>
        {label}
      </SpeakButtonRegular>
      <SpeakButtonNatural audioBuffer={audioBuffer} disabled={!canSpeakNatural}>
        {label}
      </SpeakButtonNatural>
    </>
  );
}
