// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useAtomValue } from "@effect/atom-react";
import { wordMetaMachineAtom, wordMetaSanitizedRiddleAtom } from "@/features/game/state";
import { useSpeakRiddle } from "@/hooks/use-speak-riddle";

// components
import { Button } from "@base-ui/react";

// assets
import { SpeakerWaveIcon } from "@heroicons/react/24/outline";

// types
interface ContentProps {
  mode: "popover" | "voiceTest";
}

export function Content({ mode }: ContentProps) {
  const wordMetaMachineSnapshot = useAtomValue(wordMetaMachineAtom);
  const sanitizedRiddle = useAtomValue(wordMetaSanitizedRiddleAtom);
  const speakRiddle = useSpeakRiddle();

  const isAwaiting = wordMetaMachineSnapshot.matches("awaitingTheSecretWord");
  const isLoading = wordMetaMachineSnapshot.matches("loading");
  const canSpeak = sanitizedRiddle !== null && !isAwaiting && !isLoading;

  return (
    <>
      <p className={cn("mx-auto text-center text-lg leading-relaxed sm:text-xl lg:text-2xl", (isAwaiting || isLoading) && "animate-pulse")}>
        {isAwaiting ? "Waiting for the secret word..." : isLoading ? "Thinking..." : (sanitizedRiddle ?? "Riddle unavailable. You are on your own!")}
      </p>
      <Button className="button mx-auto mt-4" disabled={!canSpeak} onClick={() => canSpeak && speakRiddle(sanitizedRiddle)}>
        <SpeakerWaveIcon className="size-11" />
        {mode === "voiceTest" ? "Test Voice" : "Speak Riddle"}
      </Button>
    </>
  );
}

export function ContentSkeleton({ mode }: ContentProps) {
  return (
    <>
      <p className="mx-auto animate-pulse text-center text-lg leading-relaxed sm:text-xl lg:text-2xl">Thinking...</p>
      <Button className="button mx-auto mt-4" disabled>
        <SpeakerWaveIcon className="size-11" />
        {mode === "voiceTest" ? "Test Voice" : "Speak Riddle"}
      </Button>
    </>
  );
}
