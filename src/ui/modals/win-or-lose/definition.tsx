// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { wordMetaSanitizedDefinitionAtom } from "@/features/game/state";
import { useSpeakRiddle } from "@/hooks/use-speak-riddle";

// components
import { Button } from "@base-ui/react";

// assets
import { SpeakerWaveIcon } from "@heroicons/react/24/outline";

export function Definition() {
  const sanitizedDefinition = useAtomValue(wordMetaSanitizedDefinitionAtom);
  const speakRiddle = useSpeakRiddle();

  const canSpeak = sanitizedDefinition !== null;

  return (
    <>
      <p>📖 {sanitizedDefinition ?? "The secret word definition is unavailable."} 📖</p>
      <Button className="button mx-auto mt-4" disabled={!canSpeak} onClick={() => canSpeak && speakRiddle(sanitizedDefinition)}>
        <SpeakerWaveIcon className="size-11" />
        Speak Definition
      </Button>
    </>
  );
}
