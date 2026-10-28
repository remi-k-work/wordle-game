// services, features, and other libraries
import { cn } from "@/lib/utils";
import { Option } from "effect";
import { usePlayAudioBuffer } from "@/hooks/use-play-audio-buffer";
import { useSpeakText } from "@/hooks/use-speak-text";

// components
import { Button } from "@base-ui/react/button";

// assets
import { SpeakerWaveIcon } from "@heroicons/react/24/outline";

// types
import type { ComponentPropsWithoutRef, ReactNode } from "react";

interface SpeakButtonRegularProps extends ComponentPropsWithoutRef<typeof Button> {
  sanitizedText: Option.Option<string>;
  children: ReactNode;
}

interface SpeakButtonNaturalProps extends ComponentPropsWithoutRef<typeof Button> {
  audioBuffer: Option.Option<Uint8Array<ArrayBufferLike>>;
  children: ReactNode;
}

// Shared speak-action chrome (riddle, definition, override) — callers keep their own disabled logic so domain behavior stays local
export function SpeakButtonRegular({ sanitizedText, children, className, ...rest }: SpeakButtonRegularProps) {
  const speakText = useSpeakText();

  return (
    <Button
      className={cn("button", className)}
      {...rest}
      onClick={() => {
        Option.map(sanitizedText, speakText);
      }}
    >
      <SpeakerWaveIcon className="size-11" />
      {children}
    </Button>
  );
}

export function SpeakButtonNatural({ audioBuffer, children, className, ...rest }: SpeakButtonNaturalProps) {
  const playAudioBuffer = usePlayAudioBuffer();

  return (
    <Button
      className={cn("button bg-secondary", className)}
      {...rest}
      onClick={() => {
        Option.map(audioBuffer, playAudioBuffer);
      }}
    >
      <SpeakerWaveIcon className="size-11" />
      {children}
    </Button>
  );
}

export function SpeakButtonRegularSkeleton({ children, className, ...rest }: Omit<SpeakButtonRegularProps, "sanitizedText">) {
  return (
    <Button className={cn("button", className)} {...rest} disabled>
      <SpeakerWaveIcon className="size-11" />
      {children}
    </Button>
  );
}

export function SpeakButtonNaturalSkeleton({ children, className, ...rest }: Omit<SpeakButtonNaturalProps, "audioBuffer">) {
  return (
    <Button className={cn("button bg-secondary", className)} {...rest} disabled>
      <SpeakerWaveIcon className="size-11" />
      {children}
    </Button>
  );
}
