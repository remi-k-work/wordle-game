// services, features, and other libraries
import { useAtomValue } from "@effect/atom-react";
import { wordMetaIsAwaitingAtom, wordMetaIsLoadingAtom, wordMetaTheRiddleAtom, wordMetaTheRiddleAudioAtom } from "@/features/game/state/word-meta";

// components
import { T } from "gt-react";
import { GameFlowButton } from "@/features/game/ui/game-flow-button";
import { SpeakActions } from "@/ui/speak-actions";
import { RiddleText } from "./riddle-text";

// A discriminated union rather than a `mode` string plus an optional handler:
// only the popover variant has a game-flow button to notify, so the callback is
// required there and unavailable in `voiceTest`, where it has no meaning. Two
// independent switches (mode, plus optionality) would let a caller pass the
// handler to the variant that ignores it
type ContentProps = { mode: "popover"; onGameFlowClicked: () => void } | { mode: "voiceTest" };

// constants
import { DIALOG_FOOTER_CLASSES } from "@/ui/dialog-chrome";

export function Content(props: ContentProps) {
  const { mode } = props;

  const theRiddle = useAtomValue(wordMetaTheRiddleAtom);
  const theRiddleAudio = useAtomValue(wordMetaTheRiddleAudioAtom);

  const isAwaiting = useAtomValue(wordMetaIsAwaitingAtom);
  const isLoading = useAtomValue(wordMetaIsLoadingAtom);

  // Both speak buttons share one label; it is resolved before the JSX so the
  // footer reads as two identical actions over different engines
  const speakLabelEl = mode === "voiceTest" ? <T>Test Voice</T> : <T>Speak Riddle</T>;

  // Only the popover variant has a game-flow button to notify, so the handler is
  // resolved once here and the JSX below reads as one action rather than a
  // decision made inside a prop
  const onGameFlowClicked = props.mode === "popover" ? props.onGameFlowClicked : undefined;

  return (
    <>
      <RiddleText isAwaiting={isAwaiting} isLoading={isLoading} theRiddle={theRiddle} />

      <section className={DIALOG_FOOTER_CLASSES}>
        {/* Explicit ternary, never `&&`: a numeric condition would render "0" (rendering-conditional-render) */}
        {isAwaiting ? <GameFlowButton keepText onClicked={onGameFlowClicked} /> : null}
        <SpeakActions sanitizedText={theRiddle} audioBuffer={theRiddleAudio} label={speakLabelEl} />
      </section>
    </>
  );
}
