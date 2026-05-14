// next
import Image from "next/image";

export default function Page() {
  return (
    <>
      <Image src="/opengraph-image.jpg" width="1734" height="907" loading="eager" alt="Wordle Game Clone Logo" className="h-auto w-full rounded-lg shadow-md" />

      <p className="mx-auto my-12 max-w-prose text-center text-text-1">
        Immerse yourselves in the captivating world of word puzzles with my Wordle Game clone, the ultimate vocabulary challenge. Each day, a new mystery word
        awaits you for deciphering, offering a fresh challenge to flex your linguistic muscles. With each guess, you will receive clues to unravel the secret
        word, gradually narrowing down the possibilities. Utilize the vibrant color-coded feedback system to guide your journey, savoring the satisfaction of
        each correct letter placement. Whether you are a seasoned wordsmith or a budding linguist, this game offers an engaging and rewarding experience for
        all. Unleash your creativity, hone your vocabulary, and relish the thrill of solving each puzzle. Let the word-solving adventure begin! This game can be
        played with either English or Polish vocabulary sets.
      </p>
    </>
  );
}
