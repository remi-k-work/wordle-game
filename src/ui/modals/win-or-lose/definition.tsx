// services, features, and other libraries
import { Option } from "effect";
import { useAtomValue } from "@effect/atom-react";
import { wordMetaSanitizedDefinitionAtom } from "@/features/game/state";
import { useSpeakRiddle } from "@/hooks/use-speak-riddle";

// components
import { Button } from "@base-ui/react";
import { T } from "gt-next";

// assets
import { SpeakerWaveIcon } from "@heroicons/react/24/outline";

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
      <Button
        className="button mx-auto mt-4"
        disabled={!canSpeak}
        onClick={() => Option.match(sanitizedDefinition, { onNone: () => {}, onSome: (text) => speakRiddle(text) })}
      >
        <SpeakerWaveIcon className="size-11" />
        <T>Speak Definition</T>
      </Button>
    </>
  );
}
