// components
import { VoiceSettings } from "@/features/settings/ui/voice-settings";
import { CloseModalButton } from "@/ui/modal-close-button";

export function Content() {
  return (
    <article className="mx-auto max-w-prose space-y-9">
      <VoiceSettings />

      <CloseModalButton />
    </article>
  );
}
