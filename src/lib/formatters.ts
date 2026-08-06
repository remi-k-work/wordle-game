// services, features, and other libraries
import { Duration } from "effect";

// Formats an Effect Duration into a human-readable HH:mm:ss string (also considers days)
export const formatDuration = (duration: Duration.Duration) => {
  const { days, hours, minutes, seconds } = Duration.parts(duration);
  const pad = (n: number) => n.toString().padStart(2, "0");

  if (days > 0) return `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  if (hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(minutes)}:${pad(seconds)}`;
};

// Returns the provided text with Markdown stripped and whitespace collapsed for TTS
export const formatTextForTTS = (text: string) => {
  return (
    text
      // Strip any stray inline markdown characters (asterisks, underscores, backticks)
      .replace(/[*_`]/g, "")
      // Collapse all whitespace
      .replace(/\s+/g, " ")
      // Fix spacing before punctuation (TTS improvement)
      .replace(/\s+([?.!,;:])/g, "$1")
      .trim()
  );
};
