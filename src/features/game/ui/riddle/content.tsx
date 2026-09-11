// services, features, and other libraries
import { cn } from "@/lib/utils";
import { Option } from "effect";
import { useAtomValue } from "@effect/atom-react";
import { wordMetaMachineAtom, wordMetaTheRiddleAtom, wordMetaTheRiddleAudioAtom } from "@/features/game/state";

// components
import { T } from "gt-next";
import { GameFlowButton } from "@/features/game/ui/flow-button";
import { SpeakButtonNatural, SpeakButtonNaturalSkeleton, SpeakButtonRegular, SpeakButtonRegularSkeleton } from "@/ui/speak-button";
import { RiddleText, RiddleTextSkeleton } from "./riddle-text";

// types
interface ContentProps {
  mode: "popover" | "voiceTest";
  onGameFlowClicked?: () => void;
}

export function Content({ mode, onGameFlowClicked }: ContentProps) {
  const wordMetaMachineSnapshot = useAtomValue(wordMetaMachineAtom);
  const theRiddle = useAtomValue(wordMetaTheRiddleAtom);
  const theRiddleAudio = useAtomValue(wordMetaTheRiddleAudioAtom);

  const isAwaiting = wordMetaMachineSnapshot.matches("awaitingTheSecretWord");
  const isLoading = wordMetaMachineSnapshot.matches("loading");
  const isFetching = wordMetaMachineSnapshot.matches("fetchingRiddleAudio");
  const canSpeakRegular = Option.isSome(theRiddle) && !isAwaiting && !isLoading;
  const canSpeakNatural = canSpeakRegular && Option.isSome(theRiddleAudio) && !isFetching;

  return (
    <>
      <RiddleText isAwaiting={isAwaiting} isLoading={isLoading} theRiddle={theRiddle} />

      {isAwaiting && <GameFlowButton className={cn(mode === "voiceTest" && "mt-4")} keepText onClicked={onGameFlowClicked} />}
      <SpeakButtonRegular className={cn(mode === "voiceTest" && "mt-4")} sanitizedText={theRiddle} disabled={!canSpeakRegular}>
        {mode === "voiceTest" ? <T>Test Voice</T> : <T>Speak Riddle</T>}
      </SpeakButtonRegular>

      <SpeakButtonNatural className={cn(mode === "voiceTest" && "mt-4")} audioBuffer={theRiddleAudio} disabled={!canSpeakNatural}>
        {mode === "voiceTest" ? <T>Test Voice</T> : <T>Speak Riddle</T>}
      </SpeakButtonNatural>
    </>
  );
}

export function ContentSkeleton({ mode }: ContentProps) {
  return (
    <>
      <RiddleTextSkeleton />

      <SpeakButtonRegularSkeleton className={cn(mode === "voiceTest" && "mt-4")}>
        {mode === "voiceTest" ? <T>Test Voice</T> : <T>Speak Riddle</T>}
      </SpeakButtonRegularSkeleton>

      <SpeakButtonNaturalSkeleton className={cn(mode === "voiceTest" && "mt-4")}>
        {mode === "voiceTest" ? <T>Test Voice</T> : <T>Speak Riddle</T>}
      </SpeakButtonNaturalSkeleton>
    </>
  );
}
