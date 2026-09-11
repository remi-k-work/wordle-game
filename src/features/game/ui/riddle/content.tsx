// services, features, and other libraries
import { cn } from "@/lib/utils";
import { Option } from "effect";
import { useAtomValue } from "@effect/atom-react";
import { wordMetaMachineAtom, wordMetaTheRiddleAtom, wordMetaTheRiddleAudioBufferAtom } from "@/features/game/state";
import { usePlayAudioBuffer, useSpeakRiddle } from "@/hooks";

// components
import { Button } from "@base-ui/react";
import { T } from "gt-next";
import { GameFlowButton } from "@/features/game/ui/flow-button";
import { SpeakButton } from "@/ui/speak-button";
import { RiddleText, RiddleTextSkeleton } from "./riddle-text";

// assets
import { SpeakerWaveIcon } from "@heroicons/react/24/outline";

// types
interface ContentProps {
  mode: "popover" | "voiceTest";
  onGameFlowClicked?: () => void;
}

export function Content({ mode, onGameFlowClicked }: ContentProps) {
  const wordMetaMachineSnapshot = useAtomValue(wordMetaMachineAtom);
  const theRiddle = useAtomValue(wordMetaTheRiddleAtom);
  const theRiddleAudioBuffer = useAtomValue(wordMetaTheRiddleAudioBufferAtom);
  const speakRiddle = useSpeakRiddle();
  const playAudioBuffer = usePlayAudioBuffer();

  const isAwaiting = wordMetaMachineSnapshot.matches("awaitingTheSecretWord");
  const isLoading = wordMetaMachineSnapshot.matches("loading");
  const canSpeak = Option.isSome(theRiddle) && !isAwaiting && !isLoading;

  return (
    <>
      <RiddleText isAwaiting={isAwaiting} isLoading={isLoading} theRiddle={theRiddle} />

      {isAwaiting && <GameFlowButton className={cn("mx-auto", mode === "voiceTest" && "mt-4")} keepText onClicked={onGameFlowClicked} />}
      <SpeakButton
        className={cn("button mx-auto", mode === "voiceTest" && "mt-4")}
        disabled={!canSpeak}
        onClick={() => Option.match(theRiddle, { onNone: () => {}, onSome: (theRiddle) => speakRiddle(theRiddle) })}
      >
        {mode === "voiceTest" ? <T>Test Voice</T> : <T>Speak Riddle</T>}
      </SpeakButton>

      <SpeakButton
        className={cn("button mx-auto", mode === "voiceTest" && "mt-4")}
        disabled={!canSpeak}
        onClick={() =>
          Option.match(theRiddleAudioBuffer, { onNone: () => {}, onSome: (audioBuffer) => playAudioBuffer(audioBuffer as unknown as ArrayBuffer) })
        }
      >
        {mode === "voiceTest" ? <T>Test Voice</T> : <T>Speak Riddle</T>}
      </SpeakButton>
    </>
  );
}

export function ContentSkeleton({ mode }: ContentProps) {
  return (
    <>
      <RiddleTextSkeleton />

      <Button className={cn("button mx-auto", mode === "voiceTest" && "mt-4")} disabled>
        <SpeakerWaveIcon className="size-11" />
        {mode === "voiceTest" ? <T>Test Voice</T> : <T>Speak Riddle</T>}
      </Button>
    </>
  );
}
