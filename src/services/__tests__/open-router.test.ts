// services, features, and other libraries
import { describe, expect, it } from "@effect/vitest";
import { Effect, Option } from "effect";
import { fetchSpeechAudio, OpenRouter, TEST_SPEECH_AUDIO } from "@/services/open-router.server";

// The test layer is the seam every speech-capable handler resolves `OpenRouter`
// through, so these tests pin its contract: fixed audio, no generation id, and
// that `fetchSpeechAudio` still turns the audio into an `Option.some`.
describe("OpenRouter.layerTest", () => {
  it.effect("returns the fixed audio and no generation id", () =>
    Effect.gen(function* () {
      const { generateSpeech } = yield* OpenRouter;
      const { audioData, generationId } = yield* generateSpeech({ input: "hello" });

      expect(audioData).toStrictEqual(TEST_SPEECH_AUDIO);
      expect(generationId).toStrictEqual(Option.none());
    }).pipe(Effect.provide(OpenRouter.layerTest))
  );

  it.effect("carries the fixed audio through fetchSpeechAudio", () =>
    Effect.gen(function* () {
      // The En path skips `Random.choice`, keeping the assertion deterministic
      const audio = yield* fetchSpeechAudio({ input: "hello", solutionsLanguage: "En" });

      expect(audio).toStrictEqual(Option.some(TEST_SPEECH_AUDIO));
    }).pipe(Effect.provide(OpenRouter.layerTest))
  );
});
