// services, features, and other libraries
import { Option } from "effect";
import { useAtomValue } from "@effect/atom-react";
import {
  wordMetaIsAwaitingAtom,
  wordMetaIsFetchingAudioAtom,
  wordMetaIsLoadingAtom,
  wordMetaTheRiddleAtom,
  wordMetaTheRiddleAudioAtom,
} from "@/features/game/state/word-meta";

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

// constants
import { DIALOG_FOOTER_CLASSES } from "@/ui/dialog-chrome";

export function Content({ mode, onGameFlowClicked }: ContentProps) {
  const theRiddle = useAtomValue(wordMetaTheRiddleAtom);
  const theRiddleAudio = useAtomValue(wordMetaTheRiddleAudioAtom);

  const isAwaiting = useAtomValue(wordMetaIsAwaitingAtom);
  const isLoading = useAtomValue(wordMetaIsLoadingAtom);
  const isFetching = useAtomValue(wordMetaIsFetchingAudioAtom);

  const canSpeakRegular = Option.isSome(theRiddle) && !isAwaiting && !isLoading;
  const canSpeakNatural = canSpeakRegular && Option.isSome(theRiddleAudio) && !isFetching;

  return (
    <>
      <RiddleText isAwaiting={isAwaiting} isLoading={isLoading} theRiddle={theRiddle} />

      <section className={DIALOG_FOOTER_CLASSES}>
        {isAwaiting && <GameFlowButton keepText onClicked={onGameFlowClicked} />}
        <SpeakButtonRegular sanitizedText={theRiddle} disabled={!canSpeakRegular}>
          {mode === "voiceTest" ? <T>Test Voice</T> : <T>Speak Riddle</T>}
        </SpeakButtonRegular>

        <SpeakButtonNatural audioBuffer={theRiddleAudio} disabled={!canSpeakNatural}>
          {mode === "voiceTest" ? <T>Test Voice</T> : <T>Speak Riddle</T>}
        </SpeakButtonNatural>
      </section>
    </>
  );
}

export function ContentSkeleton({ mode }: ContentProps) {
  return (
    <>
      <RiddleTextSkeleton />

      <section className={DIALOG_FOOTER_CLASSES}>
        <SpeakButtonRegularSkeleton>{mode === "voiceTest" ? <T>Test Voice</T> : <T>Speak Riddle</T>}</SpeakButtonRegularSkeleton>

        <SpeakButtonNaturalSkeleton>{mode === "voiceTest" ? <T>Test Voice</T> : <T>Speak Riddle</T>}</SpeakButtonNaturalSkeleton>
      </section>
    </>
  );
}
