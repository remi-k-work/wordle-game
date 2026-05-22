// next
import Image from "next/image";
import Link from "next/link";

// components
import { Button } from "@base-ui/react";
import { PageHeader } from "@/ui/PageHeader";
import { SectionHeader } from "@/ui/SectionHeader";

// assets
import hero from "@/assets/hero.webp";
import pillar1 from "@/assets/pillar1.webp";
import pillar2 from "@/assets/pillar2.webp";
import pillar3 from "@/assets/pillar3.webp";
import { ArrowRightCircleIcon } from "@heroicons/react/24/outline";

export default function Page() {
  return (
    <>
      <PageHeader
        title="Wordle, Unlocked. Welcome to Wordle Overdrive. Welcome to the Loop."
        description="The classic word game transformed into a continuous, high-stakes survival run. No daily limits. No safety nets. Decipher AI riddles and stack your streak. How long can you survive the wipeout risk?"
      />
      <Image src={hero} loading="eager" alt="Wordle Overdrive" className="mx-auto h-auto w-full max-w-384" />
      <Button
        className="button mx-auto mt-4"
        nativeButton={false}
        render={
          <Link href="/game">
            <ArrowRightCircleIcon className="size-11" />
            Enter the Loop
          </Link>
        }
      />

      <SectionHeader title="The Continuous Arcade Run (Accumulation vs. Wipeout)" />
      <Image src={pillar1} loading="lazy" alt="The Continuous Arcade Run (Accumulation vs. Wipeout)" className="mx-auto h-auto w-full max-w-379" />
      <br />
      <p className="mx-auto text-center sm:text-xl lg:text-2xl">
        Forget guessing a single word and walking away. In <b>Wordle Overdrive</b>, your points accumulate over a continuous stream of puzzles. Every victory
        Banks your hard-earned score into your <b>Total Run Score</b> and stacks your winning streak. The game loop maintains its fluidity—winning one word
        immediately launches you into the next challenge.
      </p>
      <br />
      <p className="mx-auto text-center sm:text-xl lg:text-2xl">
        But beware: the stakes have never been higher. A single failed word (failing to guess in 6 turns) triggers a total <b>Wipeout</b>. Your active Run Score
        and Streak immediately reset to zero, leaving only your persistent <b>Best Run</b> high water mark as a ghost to chase.
      </p>

      <SectionHeader title="Bleeding Potential (Hunt Efficiently)" />
      <Image src={pillar2} loading="lazy" alt="Bleeding Potential (Hunt Efficiently)" className="mx-auto h-auto w-full max-w-379" />
      <br />
      <p className="mx-auto text-center sm:text-xl lg:text-2xl">
        In <b>Wordle Overdrive</b>, finding the word is only half the battle. To maximize your run, you must <b>Hunt Efficiently</b>. The scoring matrix has
        been completely overhauled to favor speed and precision.
      </p>
      <br />
      <p className="mx-auto text-center sm:text-xl lg:text-2xl">
        Every second you stall, your reward decays. Your <b>Live Potential</b> score is calculated dynamically based on your current turn and the elapsed time:
      </p>
      <br />
      <p className="mx-auto text-center text-xl sm:text-2xl lg:text-3xl">Final Word Score = Base Points (by Turn) x Speed Multiplier</p>
      <br />
      <p className="mx-auto text-center sm:text-xl lg:text-2xl">
        Solve it on Turn 1 in under 30 seconds to score like a <b>Speed Demon</b> (x 1.5 multiplier). Delay too long, and you drop to a <b>Slow Learner</b> (x
        0.8 multiplier), significantly reducing the points you bank into your run. Every single guess carries massive weight.
      </p>

      <SectionHeader title="Survival Tools (AI Riddles & Smart Keypad)" />
      <Image src={pillar3} loading="lazy" alt="Survival Tools (AI Riddles & Smart Keypad)" className="mx-auto h-auto w-full max-w-379" />
      <br />
      <p className="mx-auto text-center sm:text-xl lg:text-2xl">
        With an massive, uncapped vocabulary dictionary of over <b>30,000</b> words, you are not left shooting entirely in the dark. At the start of every
        puzzle, an enigmatic AI master crafts a bespoke, one-sentence riddle giving you a thematic compass. This crucial context lets you make strategic,
        informed choices from your very first guess.
      </p>
      <br />
      <p className="mx-auto text-center sm:text-xl lg:text-2xl">
        Combined with our dedicated Survival Keypad that dynamically vanishes incorrect grey letters as you play, you have all the tools you need to forge a
        legendary, high-scoring run. You can never waste a keystroke by accident again.
      </p>
    </>
  );
}
