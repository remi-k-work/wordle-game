// react
import { useMemo } from "react";

// services, features, and other libraries
import { Option } from "effect";
import { useAtomValue } from "@effect/atom-react";
import { wordMetaTheRiddleAtom } from "@/features/game/state";

export function useSanitizedRiddle() {
  const theRiddle = useAtomValue(wordMetaTheRiddleAtom);
  const riddleOutput = Option.getOrNull(theRiddle);

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

  return sanitizedRiddle;
}
