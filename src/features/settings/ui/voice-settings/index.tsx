// The dialog body only ever mounts inside an open modal (client-side interaction),
// so there is no code-splitting to preserve: import it directly
import VoiceSettingsBody from "./voice-settings";

export function VoiceSettings() {
  return <VoiceSettingsBody />;
}
