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

interface SpeakButtonChromeProps extends ComponentPropsWithoutRef<typeof Button> {
  // `secondary` marks the generated-voice button apart from the synthesised one
  // (see the dialog chrome tokens); the two engines otherwise share this chrome
  secondary?: boolean;
}

// Both variants own their click: the payload they were handed decides what is spoken
type SpeakButtonChromeButtonProps = Omit<ComponentPropsWithoutRef<typeof Button>, "onClick">;

interface SpeakButtonRegularProps extends SpeakButtonChromeButtonProps {
  sanitizedText: Option.Option<string>;
  disabled: boolean;
  children: ReactNode;
}

interface SpeakButtonNaturalProps extends SpeakButtonChromeButtonProps {
  audioBuffer: Option.Option<Uint8Array<ArrayBufferLike>>;
  disabled: boolean;
  children: ReactNode;
}

// Shared speak-action chrome (riddle, definition, override)
function SpeakButtonChrome({ secondary = false, className, children, ...rest }: SpeakButtonChromeProps) {
  return (
    <Button className={cn("button", secondary && "bg-secondary", className)} {...rest}>
      <SpeakerWaveIcon className="size-11" />
      {children}
    </Button>
  );
}

export function SpeakButtonRegular({ sanitizedText, children, className, disabled, ...rest }: SpeakButtonRegularProps) {
  const speakText = useSpeakText();

  return (
    <SpeakButtonChrome className={className} disabled={disabled} {...rest} onClick={() => Option.map(sanitizedText, speakText)}>
      {children}
    </SpeakButtonChrome>
  );
}

export function SpeakButtonNatural({ audioBuffer, children, className, disabled, ...rest }: SpeakButtonNaturalProps) {
  const playAudioBuffer = usePlayAudioBuffer();

  return (
    <SpeakButtonChrome secondary className={className} disabled={disabled} {...rest} onClick={() => Option.map(audioBuffer, playAudioBuffer)}>
      {children}
    </SpeakButtonChrome>
  );
}
