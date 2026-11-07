// services, features, and other libraries
import { cn } from "@/lib/utils";
import { useAtomValue } from "@effect/atom-react";
import { motion } from "motion/react";
import { T } from "gt-react";
import { useLocale } from "gt-tanstack-start";
import { wordChallengePotentialScoreAtom } from "@/features/game/state/word-challenge";
import { potentialScoreAsPercentage } from "@/features/game/domain/helpers";
import { useAnimatedCounter } from "@/hooks/use-animated-counter";

// components
import { ScoreProgressBar } from "@/ui/score-progress-bar";

// types
import type { ReactNode, Ref } from "react";

// constants
import { MOTION_TOKENS, SPRINGS } from "@/lib/motion-tokens";

// The card chrome, hoisted so the live card and its skeleton cannot drift into
// different shapes while the word data is in flight — and so neither variant
// re-runs them through twMerge on every render
const CARD_CLASSES = cn("grid flex-1 place-items-center rounded-md border border-accent bg-surface-2 px-2 py-1");
const HEADING_CLASSES = cn("font-sans text-sm font-semibold tracking-widest text-accent uppercase");
const VALUE_CLASSES = cn("font-semibold tabular-nums sm:text-lg");

// What the counter's node holds until the score is known; the live variant
// renders the real number into that same node imperatively (see
// `useAnimatedCounter`), so the placeholder only has to reserve its height
const EMPTY_SCORE = "\u00a0";

// The heading, the animated score, and the progress bar; stated once because
// the live card and its skeleton differ only in the value the score shows, and
// that difference is carried by the two props rather than by a second copy of
// this markup
function PotentialScoreContent({ score, progressValue, counterRef }: { score: ReactNode; progressValue: number | null; counterRef?: Ref<HTMLElement> }) {
  return (
    <>
      <h2 className={HEADING_CLASSES}>
        <T>Potential</T>
      </h2>
      <span ref={counterRef} className={VALUE_CLASSES}>
        {score}
      </span>
      <ScoreProgressBar value={progressValue} />
    </>
  );
}

export function PotentialScore() {
  const potentialScore = useAtomValue(wordChallengePotentialScoreAtom);
  const locale = useLocale();
  const potentialScoreRef = useAnimatedCounter(potentialScore, locale);

  return (
    <motion.section initial={{ opacity: 0, y: MOTION_TOKENS.distance.sm }} animate={{ opacity: 1, y: 0 }} transition={SPRINGS.gentle} className={CARD_CLASSES}>
      <PotentialScoreContent
        score={potentialScore.toLocaleString(locale)}
        progressValue={potentialScoreAsPercentage(potentialScore)}
        counterRef={potentialScoreRef}
      />
    </motion.section>
  );
}

export function PotentialScoreSkeleton() {
  return (
    <section className={CARD_CLASSES}>
      {/* The indeterminate bar keeps the track in place without a fill, so the
          live card does not push the layout when its first number lands */}
      <PotentialScoreContent score={EMPTY_SCORE} progressValue={null} />
    </section>
  );
}
