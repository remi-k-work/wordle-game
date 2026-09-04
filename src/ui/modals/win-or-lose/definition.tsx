// services, features, and other libraries
import { Option } from "effect";
import { useAtomValue } from "@effect/atom-react";
import { wordMetaSanitizedDefinitionAtom } from "@/features/game/state";
import { useSpeakRiddle } from "@/hooks/use-speak-riddle";

// components
import { T } from "gt-next";
import { SpeakButton } from "@/ui/speak-button";

export function Definition() {
  const sanitizedDefinition = Option.fromNullOr(useAtomValue(wordMetaSanitizedDefinitionAtom));
  const speakRiddle = useSpeakRiddle();

  const canSpeak = Option.isSome(sanitizedDefinition);

  return (
    <>
      <p>
        📖{" "}
        {Option.getOrElse(sanitizedDefinition, () => (
          <T>The secret word definition is unavailable.</T>
        ))}{" "}
        📖
      </p>
      <SpeakButton
        className="button mx-auto mt-4"
        disabled={!canSpeak}
        onClick={() => Option.match(sanitizedDefinition, { onNone: () => {}, onSome: (text) => speakRiddle(text) })}
      >
        <T>Speak Definition</T>
      </SpeakButton>
    </>
  );
}
