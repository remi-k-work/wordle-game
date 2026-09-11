// services, features, and other libraries
import { Option } from "effect";
import { useAtomValue } from "@effect/atom-react";
import { wordMetaWordDefinitionAtom } from "@/features/game/state";

// components
import { T } from "gt-next";
import { SpeakButtonRegular } from "@/ui/speak-button";

export function Definition() {
  const wordDefinition = useAtomValue(wordMetaWordDefinitionAtom);
  const canSpeak = Option.isSome(wordDefinition);

  return (
    <>
      <p>
        📖{" "}
        {Option.getOrElse(wordDefinition, () => (
          <T>The secret word definition is unavailable.</T>
        ))}{" "}
        📖
      </p>
      <SpeakButtonRegular className="mt-4" sanitizedText={wordDefinition} disabled={!canSpeak}>
        <T>Speak Definition</T>
      </SpeakButtonRegular>
    </>
  );
}
