// services, features, and other libraries
import { Option } from "effect";
import { useAtomValue } from "@effect/atom-react";
import { wordMetaWordDefinitionAtom, wordMetaWordDefinitionAudioAtom } from "@/features/game/state/word-meta";
import { T } from "gt-react";

// components
import { SpeakActions } from "@/ui/speak-actions";

// constants
import { DIALOG_FOOTER_CLASSES } from "@/ui/dialog-chrome";

export function Definition() {
  const wordDefinition = useAtomValue(wordMetaWordDefinitionAtom);
  const wordDefinitionAudio = useAtomValue(wordMetaWordDefinitionAudioAtom);

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
        {/* Each engine's availability is derived from the payload it needs, so the
            rule lives once in `SpeakActions` rather than being restated here */}
        <SpeakActions sanitizedText={wordDefinition} audioBuffer={wordDefinitionAudio} label={<T>Speak Definition</T>} />
      </section>
      <br />
    </>
  );
}
