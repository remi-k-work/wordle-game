// components
import { Content } from "./content";

// The riddle has exactly two entry points, and they are different UI concepts
// rather than configurations of one component: the in-game toolbar opens the
// riddle in a popover, while the voice-settings modal reads and speaks it inline
// Naming each entry point at its call site keeps both consumers self-describing
// and avoids a `mode` switch that has to be duplicated in the live and skeleton
// versions
export function RiddleVoiceTest() {
  return <Content mode="voiceTest" />;
}
