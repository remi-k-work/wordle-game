// tanstack
import { Link, createFileRoute } from "@tanstack/react-router";

// services, features, and other libraries
import { T, msg, useGT, useMessages } from "gt-react";

// components
import { Button } from "@base-ui/react/button";
import { PageHeader } from "@/ui/page-header";
import { RevealOnScroll } from "@/ui/reveal-on-scroll";
import { FeatureSection } from "@/ui/feature-section";
import { FeatureText } from "@/ui/feature-text";
import { ScoringSimulator } from "@/features/high-score/ui/scoring-simulator";

// assets
import { ArrowRightCircleIcon } from "@heroicons/react/24/outline";
import hero from "@/assets/hero.webp";
import pillar1 from "@/assets/pillar1.webp";
import pillar2 from "@/assets/pillar2.webp";
import pillar3 from "@/assets/pillar3.webp";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const gt = useGT();
  const messages = useMessages();

  return (
    <article className="mx-auto w-full max-w-384">
      <PageHeader
        title={msg("Wordle, Unlocked. Welcome to Wordle Overdrive. Welcome to the Loop.")}
        description={msg(
          "The classic word game transformed into a continuous, high-stakes survival run. No daily limits. No safety nets. Decipher AI riddles and stack your streak. How long can you survive the wipeout risk?"
        )}
      />
      <RevealOnScroll>
        <img src={hero} loading="eager" fetchPriority="high" alt={gt("Wordle Overdrive")} className="h-auto w-full" />
      </RevealOnScroll>
      <RevealOnScroll>
        <Button
          className="button mx-auto mt-4 w-fit"
          nativeButton={false}
          render={
            <Link to="/game">
              <ArrowRightCircleIcon className="size-11" />
              <T>Enter the Loop</T>
            </Link>
          }
        />
      </RevealOnScroll>

      <FeatureSection
        title={messages(msg("The Continuous Arcade Run (Accumulation vs. Wipeout)"))}
        src={pillar1}
        alt={gt("The Continuous Arcade Run (Accumulation vs. Wipeout)")}
        staggerChildren
      >
        <FeatureText>
          Forget guessing a single word and walking away. In <b>Wordle Overdrive</b>, your points accumulate over a continuous stream of puzzles. Every victory
          Banks your hard-earned score into your <b>Total Run Score</b> and stacks your winning streak. The game loop maintains its fluidity—winning one word
          immediately launches you into the next challenge.
        </FeatureText>
        <br />
        <FeatureText>
          But beware: the stakes have never been higher. A single failed word (failing to guess in 6 turns) triggers a total <b>Wipeout</b>. Your active Run
          Score and Streak immediately reset to zero, leaving only your persistent <b>Best Run</b> high water mark as a ghost to chase.
        </FeatureText>
      </FeatureSection>

      <FeatureSection
        title={messages(msg("Bleeding Potential (Hunt Efficiently)"))}
        src={pillar2}
        alt={gt("Bleeding Potential (Hunt Efficiently)")}
        staggerChildren
      >
        <FeatureText>
          In <b>Wordle Overdrive</b>, finding the word is only half the battle. To survive the leaderboard, you must <b>Hunt Efficiently</b>.
        </FeatureText>
        <br />
        <FeatureText>
          The scoring matrix has been completely overhauled to favor speed and precision. Every second you stall, your potential reward decays. Solve the riddle
          fast with minimal guesses, and your score skyrockets. Hesitate, and your points bleed away.
        </FeatureText>
        <br />
        <FeatureText>Try the simulator below to see exactly how your speed and precision dictate your final payout</FeatureText>
        <br />
        <ScoringSimulator />
      </FeatureSection>

      <FeatureSection
        title={messages(msg("Survival Tools (AI Riddles & Smart Keypad)"))}
        src={pillar3}
        alt={gt("Survival Tools (AI Riddles & Smart Keypad)")}
        staggerChildren
      >
        <FeatureText>
          With an massive, uncapped vocabulary dictionary of over <b>30,000</b> words, you are not left shooting entirely in the dark. At the start of every
          puzzle, an enigmatic AI master crafts a bespoke, one-sentence riddle giving you a thematic compass. This crucial context lets you make strategic,
          informed choices from your very first guess.
        </FeatureText>
        <br />
        <FeatureText>
          Combined with our dedicated Survival Keypad that dynamically vanishes incorrect grey letters as you play, you have all the tools you need to forge a
          legendary, high-scoring run. You can never waste a keystroke by accident again.
        </FeatureText>
      </FeatureSection>
    </article>
  );
}
