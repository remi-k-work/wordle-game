// services, features, and other libraries
import { Option } from "effect";
import { useAtomValue } from "@effect/atom-react";
import { wordMetaWordDefinitionAtom } from "@/features/game/state";
import { useSpeakRiddle } from "@/hooks/use-speak-riddle";

// components
import { T } from "gt-next";
import { SpeakButton } from "@/ui/speak-button";

export function Definition() {
  const wordDefinition = useAtomValue(wordMetaWordDefinitionAtom);
  const speakRiddle = useSpeakRiddle();

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
      <SpeakButton
        className="button mx-auto mt-4"
        disabled={!canSpeak}
        onClick={() => Option.match(wordDefinition, { onNone: () => {}, onSome: (wordDefinition) => speakRiddle(wordDefinition) })}
      >
        <T>Speak Definition</T>
      </SpeakButton>
    </>
  );
}
