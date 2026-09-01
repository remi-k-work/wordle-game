// services, features, and other libraries
import { cn } from "@/lib/utils";
import { Option } from "effect";
import { useAtomValue } from "@effect/atom-react";
import { wordMetaMachineAtom, wordMetaSanitizedRiddleAtom } from "@/features/game/state";
import { useSpeakRiddle } from "@/hooks/use-speak-riddle";

// components
import { Button } from "@base-ui/react";
import { T } from "gt-next";
import { GameFlowButton } from "@/features/game/ui/flow-button";

// assets
import { SpeakerWaveIcon } from "@heroicons/react/24/outline";

// types
interface ContentProps {
  mode: "popover" | "voiceTest";
  onGameFlowClicked?: () => void;
}

export function Content({ mode, onGameFlowClicked }: ContentProps) {
  const wordMetaMachineSnapshot = useAtomValue(wordMetaMachineAtom);
  const sanitizedRiddle = Option.fromNullOr(useAtomValue(wordMetaSanitizedRiddleAtom));
  const speakRiddle = useSpeakRiddle();

  const isAwaiting = wordMetaMachineSnapshot.matches("awaitingTheSecretWord");
  const isLoading = wordMetaMachineSnapshot.matches("loading");
  const canSpeak = Option.isSome(sanitizedRiddle) && !isAwaiting && !isLoading;

  return (
    <>
      <p className={cn("mx-auto text-center text-lg leading-relaxed sm:text-xl lg:text-2xl", (isAwaiting || isLoading) && "animate-pulse")}>
        {isAwaiting ? (
          <T>Waiting for the secret word...</T>
        ) : isLoading ? (
          <T>Thinking...</T>
        ) : (
          Option.getOrElse(sanitizedRiddle, () => <T>Riddle unavailable. You are on your own!</T>)
        )}
      </p>

      {isAwaiting && <GameFlowButton className={cn("mx-auto", mode === "voiceTest" && "mt-4")} keepText onClicked={onGameFlowClicked} />}
      <Button
        className={cn("button mx-auto", mode === "voiceTest" && "mt-4")}
        disabled={!canSpeak}
        onClick={() => Option.match(sanitizedRiddle, { onNone: () => {}, onSome: (text) => speakRiddle(text) })}
      >
        <SpeakerWaveIcon className="size-11" />
        {mode === "voiceTest" ? <T>Test Voice</T> : <T>Speak Riddle</T>}
      </Button>
    </>
  );
}

export function ContentSkeleton({ mode }: ContentProps) {
  return (
    <>
      <p className="mx-auto animate-pulse text-center text-lg leading-relaxed sm:text-xl lg:text-2xl">
        <T>Thinking...</T>
      </p>

      <Button className={cn("button mx-auto", mode === "voiceTest" && "mt-4")} disabled>
        <SpeakerWaveIcon className="size-11" />
        {mode === "voiceTest" ? <T>Test Voice</T> : <T>Speak Riddle</T>}
      </Button>
    </>
  );
}
