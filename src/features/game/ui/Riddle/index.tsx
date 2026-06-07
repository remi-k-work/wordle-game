// react
import { useMemo } from "react";

// services, features, and other libraries
import { cn } from "@/lib/utils";
import { Option } from "effect";
import { useAtomValue } from "@effect/atom-react";
import { AsyncResult } from "effect/unstable/reactivity";
import { riddleAtom } from "@/features/game/state";
import { solutionsLanguageAtom, voicePitchAtom, voiceRateAtom, voiceVoiceAtom, voiceVolumeAtom } from "@/features/settings/state";
import { useSpeechVoices } from "@/hooks/use-speech-voices";

// components
import { Button, Popover } from "@base-ui/react";

// assets
import { SpinnerIcon } from "@/assets/icons";
import { SparklesIcon, SpeakerWaveIcon } from "@heroicons/react/24/outline";

// types
interface RiddleProps {
  isVoiceTest?: boolean;
}

export function Riddle({ isVoiceTest = false }: RiddleProps) {
  const riddle = useAtomValue(riddleAtom);
  const solutionsLanguage = useAtomValue(solutionsLanguageAtom);

  // Fetch the available voices
  const voices = useSpeechVoices();

  const voiceVoice = useAtomValue(voiceVoiceAtom);
  const voiceVolume = useAtomValue(voiceVolumeAtom);
  const voiceRate = useAtomValue(voiceRateAtom);
  const voicePitch = useAtomValue(voicePitchAtom);

  const riddleOutput = AsyncResult.value(riddle).pipe(Option.getOrNull);

  const sanitizedRiddle = useMemo(() => {
    if (!riddleOutput) return null;

    return (
      riddleOutput
        // Remove Markdown emphasis (bold/italic/underscore variants)
        .replace(/\*\*(.*?)\*\*/g, "$1")
        .replace(/\*(.*?)\*/g, "$1")
        .replace(/__(.*?)__/g, "$1")
        .replace(/_(.*?)_/g, "$1")

        // Inline code
        .replace(/`(.*?)`/g, "$1")

        // Headings
        .replace(/^#{1,6}\s*/gm, "")

        // Blockquotes
        .replace(/^>\s*/gm, "")

        // Remove common Markdown list markers (often sneaks in from models)
        .replace(/^[-*+]\s+/gm, "")

        // Fix spacing before punctuation (TTS improvement)
        .replace(/\s+([?.!,;:])/g, "$1")

        // Collapse all whitespace (including newlines/tabs)
        .replace(/\s+/g, " ")

        // Remove space before punctuation (edge cleanup after collapse)
        .replace(/\s+([?.!,;:])/g, "$1")

        .trim()
    );
  }, [riddleOutput]);

  const speakRiddle = () => {
    // Guard for SSR in Next.js
    if (typeof window === "undefined" || !window.speechSynthesis) {
      console.warn("Speech Synthesis is not supported in this environment.");
      return;
    }

    // Guard empty TTS input
    if (!sanitizedRiddle) return;

    // Cancel any ongoing speech so they do not overlap if clicked twice
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(sanitizedRiddle);

    // Set the language appropriately
    utterance.lang = solutionsLanguage === "En" ? "en-US" : "pl-PL";

    // Set voice, volume, rate, and pitch according to our voice settings
    utterance.voice = voices.find((voice) => voice.name === voiceVoice) ?? voices.find((voice) => voice.default) ?? null;
    utterance.volume = voiceVolume;
    utterance.rate = voiceRate;
    utterance.pitch = voicePitch;

    speechSynthesis.speak(utterance);
  };

  if (isVoiceTest) {
    return AsyncResult.builder(riddle)
      .onInitialOrWaiting(() => <p className="mx-auto animate-pulse text-center text-xl">Thinking...</p>)
      .onFailure(() => <p className="mx-auto text-center text-xl">Riddle unavailable. You are on your own!</p>)
      .onSuccess(() => (
        <div>
          <p className="mx-auto text-center text-xl">{sanitizedRiddle}</p>
          <Button className="button mx-auto mt-4 text-base" onClick={() => speakRiddle()}>
            <SpeakerWaveIcon className="size-11" />
            Speak Riddle
          </Button>
        </div>
      ))
      .render();
  }

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
            {AsyncResult.builder(riddle)
              .onInitialOrWaiting(() => <p className="animate-pulse">Thinking...</p>)
              .onFailure(() => <p>Riddle unavailable. You are on your own!</p>)
              .onSuccess(() => (
                <div>
                  <p>{sanitizedRiddle}</p>
                  <Button className="button mx-auto mt-4 text-base" onClick={() => speakRiddle()}>
                    <SpeakerWaveIcon className="size-11" />
                    Speak Riddle
                  </Button>
                </div>
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
