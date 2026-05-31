// services, features, and other libraries
import { cn } from "@/lib/utils";
import { Result, useAtomValue } from "@effect-atom/atom-react";
import { riddleAtom, solutionsLanguageAtom } from "@/features/game/state";

// components
import { Button, Popover } from "@base-ui/react";

// assets
import { SpinnerIcon } from "@/assets/icons";
import { SparklesIcon, SpeakerWaveIcon } from "@heroicons/react/24/outline";

export function Riddle() {
  const riddle = useAtomValue(riddleAtom);
  const solutionsLanguage = useAtomValue(solutionsLanguageAtom);

  const speakRiddle = (riddle: string) => {
    // Guard for SSR in Next.js
    if (typeof window === "undefined" || !window.speechSynthesis) {
      console.warn("Speech Synthesis is not supported in this environment.");
      return;
    }

    // Cancel any ongoing speech so they do not overlap if clicked twice
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(riddle);

    // Set the language appropriately
    utterance.lang = solutionsLanguage === "En" ? "en-US" : "pl-PL";

    // Tweak these for a more "Mysterious Puzzle Master" vibe
    utterance.rate = 0.6;
    utterance.pitch = 0.3;

    window.speechSynthesis.speak(utterance);
  };

  return (
    <Popover.Root>
      <Popover.Trigger openOnHover title="Riddle" className="button flex-none p-1 data-popup-open:bg-accent">
        {riddle.waiting ? <SpinnerIcon className="size-11" /> : <SparklesIcon className="size-11" />}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner sideOffset={8}>
          <Popover.Popup
            className={cn(
              "grid max-w-[90dvw] gap-3 rounded-md bg-surface-2 p-3 text-center text-xl shadow-sm",
              "transition duration-300 ease-in-out",
              "origin-(--transform-origin)",
              "data-ending-style:scale-90 data-ending-style:opacity-0 data-starting-style:scale-90 data-starting-style:opacity-0"
            )}
          >
            {Result.builder(riddle)
              .onInitialOrWaiting(() => <p className="animate-pulse">Thinking...</p>)
              .onFailure(() => <p>Riddle unavailable. You are on your own!</p>)
              .onSuccess((riddle) => (
                <p>
                  {riddle}
                  <Button className="button mx-auto mt-4" onClick={() => speakRiddle(riddle)}>
                    <SpeakerWaveIcon className="size-11" />
                    Speak Riddle
                  </Button>
                </p>
              ))
              .render()}
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function RiddleSkeleton() {
  return (
    <Button className="button flex-none p-1" disabled>
      <SparklesIcon className="size-11" />
    </Button>
  );
}
