// services, features, and other libraries
import { Option } from "effect";
import { useAtomValue } from "@effect/atom-react";
import { wordMetaWordDefinitionAtom, wordMetaWordDefinitionAudioAtom } from "@/features/game/state";

// components
import { T } from "gt-next";
import { SpeakButtonNatural, SpeakButtonRegular } from "@/ui/speak-button";

// constants
import { DIALOG_FOOTER_CLASSES } from "@/ui/dialog-chrome";

export function Definition() {
  const wordDefinition = useAtomValue(wordMetaWordDefinitionAtom);
  const wordDefinitionAudio = useAtomValue(wordMetaWordDefinitionAudioAtom);

  const canSpeakRegular = Option.isSome(wordDefinition);
  const canSpeakNatural = canSpeakRegular && Option.isSome(wordDefinitionAudio);

  return (
    <>
      <p>
        📖{" "}
        {Option.getOrElse(wordDefinition, () => (
          <T>The secret word definition is unavailable.</T>
        ))}{" "}
        📖
      </p>

      <section className={DIALOG_FOOTER_CLASSES}>
        <SpeakButtonRegular sanitizedText={wordDefinition} disabled={!canSpeakRegular}>
          <T>Speak Definition</T>
        </SpeakButtonRegular>

        <SpeakButtonNatural audioBuffer={wordDefinitionAudio} disabled={!canSpeakNatural}>
          <T>Speak Definition</T>
        </SpeakButtonNatural>
      </section>
      <br />
    </>
  );
}
