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
import { T } from "gt-react";
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

  const speakLabel = mode === "voiceTest" ? <T>Test Voice</T> : <T>Speak Riddle</T>;

  return (
    <>
      <RiddleText isAwaiting={isAwaiting} isLoading={isLoading} theRiddle={theRiddle} />

      <section className={DIALOG_FOOTER_CLASSES}>
        {/* Explicit ternary, never `&&`: a numeric condition would render "0" (rendering-conditional-render) */}
        {isAwaiting ? <GameFlowButton keepText onClicked={onGameFlowClicked} /> : null}
        <SpeakButtonRegular sanitizedText={theRiddle} disabled={!canSpeakRegular}>
          {speakLabel}
        </SpeakButtonRegular>

        <SpeakButtonNatural audioBuffer={theRiddleAudio} disabled={!canSpeakNatural}>
          {speakLabel}
        </SpeakButtonNatural>
      </section>
    </>
  );
}

export function ContentSkeleton({ mode }: ContentProps) {
  // Mirrors the label computed in `Content` so the skeleton stays in sync
  // if the live label ever changes — one definition, two consumers
  const speakLabel = mode === "voiceTest" ? <T>Test Voice</T> : <T>Speak Riddle</T>;

  return (
    <>
      <RiddleTextSkeleton />

      <section className={DIALOG_FOOTER_CLASSES}>
        <SpeakButtonRegularSkeleton>{speakLabel}</SpeakButtonRegularSkeleton>
        <SpeakButtonNaturalSkeleton>{speakLabel}</SpeakButtonNaturalSkeleton>
      </section>
    </>
  );
}
