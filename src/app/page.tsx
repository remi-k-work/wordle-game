// next
import Image from "next/image";
import Link from "next/link";

// components
import { Button } from "@base-ui/react";
import { PageHeader } from "@/ui/page-header";
import { SectionHeader } from "@/ui/section-header";
import { RevealOnScroll } from "@/ui/reveal-on-scroll";
import { ScoringSimulator } from "@/features/high-score/ui/scoring-simulator";

// assets
import hero from "@/assets/hero.webp";
import pillar1 from "@/assets/pillar1.webp";
import pillar2 from "@/assets/pillar2.webp";
import pillar3 from "@/assets/pillar3.webp";
import { ArrowRightCircleIcon } from "@heroicons/react/24/outline";
import { T, msg } from "gt-next";
import { getGT } from "gt-next/server";

export default async function Page() {
  const gt = await getGT();

  return (
    <article className="mx-auto w-full max-w-384">
      <PageHeader
        title={msg("Wordle, Unlocked. Welcome to Wordle Overdrive. Welcome to the Loop.")}
        description={msg(
          "The classic word game transformed into a continuous, high-stakes survival run. No daily limits. No safety nets. Decipher AI riddles and stack your streak. How long can you survive the wipeout risk?"
        )}
      />
      <RevealOnScroll>
        <Image src={hero} loading="eager" alt={gt("Wordle Overdrive")} className="h-auto w-full" />
      </RevealOnScroll>
      <RevealOnScroll>
        <Button
          className="button mx-auto mt-4 w-fit"
          nativeButton={false}
          render={
            <Link href="/game">
              <ArrowRightCircleIcon className="size-11" />
              <T>Enter the Loop</T>
            </Link>
          }
        />
      </RevealOnScroll>

      <RevealOnScroll staggerChildren>
        <SectionHeader title={msg("The Continuous Arcade Run (Accumulation vs. Wipeout)")} />
        <Image src={pillar1} loading="lazy" alt={gt("The Continuous Arcade Run (Accumulation vs. Wipeout)")} className="mx-auto h-auto w-full max-w-379" />
        <br />
        <T>
          <p className="mx-auto px-1 text-center sm:text-xl lg:text-2xl">
            Forget guessing a single word and walking away. In <b>Wordle Overdrive</b>, your points accumulate over a continuous stream of puzzles. Every
            victory Banks your hard-earned score into your <b>Total Run Score</b> and stacks your winning streak. The game loop maintains its fluidity—winning
            one word immediately launches you into the next challenge.
          </p>
        </T>
        <br />
        <T>
          <p className="mx-auto px-1 text-center sm:text-xl lg:text-2xl">
            But beware: the stakes have never been higher. A single failed word (failing to guess in 6 turns) triggers a total <b>Wipeout</b>. Your active Run
            Score and Streak immediately reset to zero, leaving only your persistent <b>Best Run</b> high water mark as a ghost to chase.
          </p>
        </T>
      </RevealOnScroll>

      <RevealOnScroll staggerChildren>
        <SectionHeader title={msg("Bleeding Potential (Hunt Efficiently)")} />
        <Image src={pillar2} loading="lazy" alt={gt("Bleeding Potential (Hunt Efficiently)")} className="mx-auto h-auto w-full max-w-379" />
        <br />
        <T>
          <p className="mx-auto px-1 text-center sm:text-xl lg:text-2xl">
            In <b>Wordle Overdrive</b>, finding the word is only half the battle. To survive the leaderboard, you must <b>Hunt Efficiently</b>.
          </p>
        </T>
        <br />
        <T>
          <p className="mx-auto px-1 text-center sm:text-xl lg:text-2xl">
            The scoring matrix has been completely overhauled to favor speed and precision. Every second you stall, your potential reward decays. Solve the
            riddle fast with minimal guesses, and your score skyrockets. Hesitate, and your points bleed away.
          </p>
        </T>
        <br />
        <T>
          <p className="mx-auto px-1 text-center sm:text-xl lg:text-2xl">
            Try the simulator below to see exactly how your speed and precision dictate your final payout
          </p>
        </T>
        <br />
        <ScoringSimulator />
      </RevealOnScroll>

      <RevealOnScroll staggerChildren>
        <SectionHeader title={msg("Survival Tools (AI Riddles & Smart Keypad)")} />
        <Image src={pillar3} loading="lazy" alt={gt("Survival Tools (AI Riddles & Smart Keypad)")} className="mx-auto h-auto w-full max-w-379" />
        <br />
        <T>
          <p className="mx-auto px-1 text-center sm:text-xl lg:text-2xl">
            With an massive, uncapped vocabulary dictionary of over <b>30,000</b> words, you are not left shooting entirely in the dark. At the start of every
            puzzle, an enigmatic AI master crafts a bespoke, one-sentence riddle giving you a thematic compass. This crucial context lets you make strategic,
            informed choices from your very first guess.
          </p>
        </T>
        <br />
        <T>
          <p className="mx-auto px-1 text-center sm:text-xl lg:text-2xl">
            Combined with our dedicated Survival Keypad that dynamically vanishes incorrect grey letters as you play, you have all the tools you need to forge a
            legendary, high-scoring run. You can never waste a keystroke by accident again.
          </p>
        </T>
      </RevealOnScroll>
    </article>
  );
}
