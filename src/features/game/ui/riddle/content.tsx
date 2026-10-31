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
import { GameFlowButton } from "@/features/game/ui/game-flow-button";
import { SpeakButtonNatural, SpeakButtonNaturalSkeleton, SpeakButtonRegular, SpeakButtonRegularSkeleton } from "@/ui/speak-button";
import { RiddleText, RiddleTextSkeleton } from "./riddle-text";

// types
interface ContentProps {
  mode: "popover" | "voiceTest";
  onGameFlowClicked?: () => void;
}

// constants
import { DIALOG_FOOTER_CLASSES } from "@/ui/dialog-chrome";

// The speak button label depends only on the mode; defined once here and used by
// both `Content` and `ContentSkeleton` so the skeleton stays in sync if the
// label ever changes — one definition, two consumers
function speakLabel(mode: ContentProps["mode"]) {
  return mode === "voiceTest" ? <T>Test Voice</T> : <T>Speak Riddle</T>;
}

export function Content({ mode, onGameFlowClicked }: ContentProps) {
  const theRiddle = useAtomValue(wordMetaTheRiddleAtom);
  const theRiddleAudio = useAtomValue(wordMetaTheRiddleAudioAtom);

  const isAwaiting = useAtomValue(wordMetaIsAwaitingAtom);
  const isLoading = useAtomValue(wordMetaIsLoadingAtom);
  const isFetching = useAtomValue(wordMetaIsFetchingAudioAtom);

  const canSpeakRegular = Option.isSome(theRiddle) && !isAwaiting && !isLoading;
  const canSpeakNatural = canSpeakRegular && Option.isSome(theRiddleAudio) && !isFetching;

  const speakLabelEl = speakLabel(mode);

  return (
    <>
      <RiddleText isAwaiting={isAwaiting} isLoading={isLoading} theRiddle={theRiddle} />

      <section className={DIALOG_FOOTER_CLASSES}>
        {/* Explicit ternary, never `&&`: a numeric condition would render "0" (rendering-conditional-render) */}
        {isAwaiting ? <GameFlowButton keepText onClicked={onGameFlowClicked} /> : null}
        <SpeakButtonRegular sanitizedText={theRiddle} disabled={!canSpeakRegular}>
          {speakLabelEl}
        </SpeakButtonRegular>

        <SpeakButtonNatural audioBuffer={theRiddleAudio} disabled={!canSpeakNatural}>
          {speakLabelEl}
        </SpeakButtonNatural>
      </section>
    </>
  );
}

export function ContentSkeleton({ mode }: ContentProps) {
  const speakLabelEl = speakLabel(mode);

  return (
    <>
      <RiddleTextSkeleton />

      <section className={DIALOG_FOOTER_CLASSES}>
        <SpeakButtonRegularSkeleton>{speakLabelEl}</SpeakButtonRegularSkeleton>
        <SpeakButtonNaturalSkeleton>{speakLabelEl}</SpeakButtonNaturalSkeleton>
      </section>
    </>
  );
}
