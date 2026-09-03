import "dotenv/config";

// services, features, and other libraries
import { Effect, Layer, Logger } from "effect";
import { NodeHttpClient, NodeRuntime, NodeServices } from "@effect/platform-node";
import { generateNvidiaSingleField, makeNvidiaClientLayer } from "@/domain";

// constants
const RIDDLE_INSTRUCTIONS_EN = `
You are a witty puzzle master for an arcade word game.
The secret word for this riddle is "MIRROR".

CRITICAL RULES:
1. Write a short, engaging riddle (1 to 3 sentences) that ends in a question (e.g., "What am I?").
2. Reference at least one concrete real-world domain, function, or associated object so a player can logically guess it.
3. NEVER reveal the secret word directly. Do not use its root, derivatives, or rhyming giveaways.
4. Keep it plain text, suitable for Text-To-Speech (no Markdown, emojis, or formatting).
5. Do not include any preamble or meta-talk. Output ONLY the riddle.
6. SELF-VERIFY: Ensure the word "MIRROR" is completely absent.

EXAMPLE TONE AND FORMAT:
Context: Secret word is "MIRROR"
Riddle: I can show you the world, but I have no eyes. I reflect your every move but have no mind of my own. What am I?
`;

const RIDDLE_INSTRUCTIONS_PL = `
Jesteś błyskotliwym mistrzem łamigłówek w zręcznościowej grze słownej.
Ukryte słowo dla tej zagadki to "LUSTRO".

ZASADY KRYTYCZNE:
1. Napisz krótką, wciągającą zagadkę (od 1 do 3 zdań), która kończy się pytaniem (np. "Czym jestem?").
2. Odnieś się do co najmniej jednej konkretnej dziedziny, funkcji lub przedmiotu z prawdziwego świata, aby gracz mógł logicznie odgadnąć słowo.
3. NIGDY nie ujawniaj wprost ukrytego słowa. Nie używaj jego form pokrewnych, rdzeni ani rymów. Zwróć szczególną uwagę na polską odmianę (przypadki, liczba mnoga).
4. Tekst musi być zwykły i przyjazny dla Text-To-Speech (bez Markdowna, emotikonów i formatowania).
5. Nie używaj wstępów ani metakomentarzy. Wypisz TYLKO zagadkę.
6. SAMOWERYFIKACJA: Upewnij się, że słowo "LUSTRO" (w żadnej formie) nie pojawia się w tekście.

PRZYKŁAD TONU I FORMATU:
Kontekst: Ukryte słowo to "LUSTRO"
Zagadka: Mogę ukazać ci świat, chociaż nie mam oczu. Powielam każdy twój ruch, lecz nie mam własnego umysłu. Czym jestem?
`;

const NvidiaClientWithHttp = Layer.provide(makeNvidiaClientLayer(), NodeHttpClient.layerUndici);
const MainLayer = Layer.mergeAll(Logger.layer([Logger.consolePretty()]), NodeServices.layer, NvidiaClientWithHttp);

const main = Effect.gen(function* () {
  yield* Effect.log("Proving Effect-v4 AI + NVIDIA NIM `ExecutionPlan` fallback end-to-end...\n");

  const riddleEn = yield* generateNvidiaSingleField({
    temperature: 1,
    instructions: RIDDLE_INSTRUCTIONS_EN,
    prompt: "Craft the riddle now.",
    fieldName: "riddle",
    description: "Plain prose, a short riddle (1-3 sentences) ending in a question, TTS-friendly. No Markdown or emojis.",
  }).pipe(Effect.tapError(Effect.logError));

  yield* Effect.log(`${riddleEn}\n`);
  yield* Effect.log("**********************\n");

  const riddlePl = yield* generateNvidiaSingleField({
    temperature: 1,
    instructions: RIDDLE_INSTRUCTIONS_PL,
    prompt: "Stwórz zagadkę teraz.",
    fieldName: "riddle",
    description: "Zwykły tekst, krótka zagadka (1-3 zdania) zakończona pytaniem, przyjazna dla TTS. Bez Markdownu i emotikonów.",
  }).pipe(Effect.tapError(Effect.logError));

  yield* Effect.log(`${riddlePl}\n`);
  yield* Effect.log("**********************\n");
}).pipe(Effect.provide(MainLayer));

// Use NodeRuntime.runMain for graceful teardown on CTRL+C
NodeRuntime.runMain(main);
