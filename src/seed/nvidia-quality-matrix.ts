import "dotenv/config";

// services, features, and other libraries
import { Config, Effect, Layer, Logger, Redacted, Schedule, Schema } from "effect";
import { NodeHttpClient, NodeRuntime, NodeServices } from "@effect/platform-node";
import * as OpenAiClient from "@effect/ai-openai-compat/OpenAiClient";
import * as OpenAiLanguageModel from "@effect/ai-openai-compat/OpenAiLanguageModel";
import * as LanguageModel from "effect/unstable/ai/LanguageModel";
import * as Prompt from "effect/unstable/ai/Prompt";
import * as Fs from "node:fs/promises";

// =============================================================================
// Candidate models — 8 linguist + 2 nemotron with thinking disabled
// All are OpenAI-compatible via https://integrate.api.nvidia.com/v1
// Non-reasoning models omit chat_template_kwargs; nemotron pair explicitly disables it
// =============================================================================

type QualityModel = {
  readonly model: string;
  readonly label: string;
  readonly langHint: string;
  readonly disableThinking: boolean;
};

const QUALITY_MODELS: readonly QualityModel[] = [
  { model: "speakleash/bielik-11b-v2.6-instruct", label: "Bielik 11B v2.6", langHint: "PL-native (En test = failure mode)", disableThinking: false },
  { model: "utter-project/eurollm-9b-instruct", label: "EuroLLM 9B", langHint: "EU 24 langs", disableThinking: false },
  { model: "mistralai/mistral-small-24b-instruct-2501", label: "Mistral Small 24B", langHint: "Euro fast", disableThinking: false },
  { model: "meta/llama-3.3-70b-instruct", label: "Llama 3.3 70B", langHint: "Balanced baseline", disableThinking: false },
  { model: "meta/llama-3.1-8b-instruct", label: "Llama 3.1 8B", langHint: "Small baseline", disableThinking: false },
  { model: "google/gemma-2-9b-it", label: "Gemma 2 9B", langHint: "Google small", disableThinking: false },
  { model: "qwen/qwen3-next-80b-a3b-instruct", label: "Qwen3 Next 80B A3B", langHint: "MoE 80B/3B active", disableThinking: false },
  { model: "openai/gpt-oss-120b", label: "GPT-OSS 120B", langHint: "Control (previous fallback)", disableThinking: false },
  // Nemotron pair with thinking explicitly disabled — isolates reasoning cost
  { model: "nvidia/nemotron-3-super-120b-a12b", label: "Nemotron Super 120B (thinking OFF)", langHint: "Reasoning, thinking disabled", disableThinking: true },
  { model: "nvidia/nemotron-3-ultra-550b-a55b", label: "Nemotron Ultra 550B (thinking OFF)", langHint: "Reasoning, thinking disabled", disableThinking: true },
] as const;

// =============================================================================
// Prompt builders — mirrored from riddle2.ts / override2.ts (keep in sync)
// =============================================================================

// Riddle prompts
const SYSTEM_PROMPT_RIDDLE_EN = (word: string) => `
You are a witty puzzle master for an arcade word game.
The secret word for this riddle is "${word}".

CRITICAL RULES:
1. Write a short, engaging riddle (1 to 3 sentences) that ends in a question (e.g., "What am I?").
2. Reference at least one concrete real-world domain, function, or associated object so a player can logically guess it.
3. NEVER reveal the secret word directly. Do not use its root, derivatives, or rhyming giveaways.
4. Keep it plain text, suitable for Text-To-Speech (no Markdown, emojis, or formatting).
5. Do not include any preamble or meta-talk. Output ONLY the riddle.
6. SELF-VERIFY: Ensure the word "${word}" is completely absent.

EXAMPLE TONE AND FORMAT:
Context: Secret word is "MIRROR"
Riddle: I can show you the world, but I have no eyes. I reflect your every move but have no mind of my own. What am I?
`;
const SYSTEM_PROMPT_RIDDLE_PL = (word: string) => `
Jesteś błyskotliwym mistrzem łamigłówek w zręcznościowej grze słownej.
Ukryte słowo dla tej zagadki to "${word}".

ZASADY KRYTYCZNE:
1. Napisz krótką, wciągającą zagadkę (od 1 do 3 zdań), która kończy się pytaniem (np. "Czym jestem?").
2. Odnieś się do co najmniej jednej konkretnej dziedziny, funkcji lub przedmiotu z prawdziwego świata, aby gracz mógł logicznie odgadnąć słowo.
3. NIGDY nie ujawniaj wprost ukrytego słowa. Nie używaj jego form pokrewnych, rdzeni ani rymów. Zwróć szczególną uwagę na polską odmianę (przypadki, liczba mnoga).
4. Tekst musi być zwykły i przyjazny dla Text-To-Speech (bez Markdowna, emotikonów i formatowania).
5. Nie używaj wstępów ani metakomentarzy. Wypisz TYLKO zagadkę.
6. SAMOWERYFIKACJA: Upewnij się, że słowo "${word}" (w żadnej formie) nie pojawia się w tekście.

PRZYKŁAD TONU I FORMATU:
Kontekst: Ukryte słowo to "LUSTRO"
Zagadka: Mogę ukazać ci świat, chociaż nie mam oczu. Powielam każdy twój ruch, lecz nie mam własnego umysłu. Czym jestem?
`;
const RIDDLE_PROMPT_EN = "Craft the riddle now.";
const RIDDLE_PROMPT_PL = "Stwórz zagadkę teraz.";

// Override prompts — simplified Turn-1 (no guesses) as in smoke-nvidia-migration.ts
const SYSTEM_PROMPT_OVERRIDE_EN = (word: string) => `
You are an elite analytical AI assistant in a high-stakes word puzzle game. The player has spent valuable resources to summon you for a premium lifeline.
The secret word is "${word}". 

CRITICAL RULES:
1. Provide a highly insightful, contextual clue about the secret word's meaning, category, or usage.
2. NEVER reveal the secret word directly. Do not use its root, derivatives, or rhyming giveaways.
3. Be highly descriptive and creative. Make it suitable for Text-To-Speech (plain text, no Markdown, no emojis).
4. Do not include any preamble, greetings, or meta-talk (e.g., "Here is a clue"). Output ONLY the clue.
5. SELF-VERIFY before outputting: Ensure the word "${word}" is completely absent from your response.

EXAMPLE OF EXPECTED OUTPUT TONE AND FORMAT:
Context: Secret word is "CLOCK". Player guessed "BRICK" (C yellow, K green).
Clue: You correctly identified the letter K at the end, and you know there is a C somewhere in the mix. While your guess is a building material, you need to shift your focus to everyday mechanisms. Think about devices usually mounted on a wall or worn on a wrist that help us measure the passage of time.
`;
const SYSTEM_PROMPT_OVERRIDE_PL = (word: string) => `
Jesteś elitarnym analitycznym asystentem AI w grze słownej o wysoką stawkę. Gracz wydał cenne zasoby, aby wezwać Cię jako koło ratunkowe premium.
Ukryte słowo to "${word}".

ZASADY KRYTYCZNE:
1. Podaj niezwykle wnikliwą, trafną wskazówkę dotyczącą znaczenia, kategorii lub użycia ukrytego słowa.
2. NIGDY nie ujawniaj wprost ukrytego słowa. Nie używaj jego form pokrewnych, rdzeni ani rymów. Pamiętaj o polskiej odmianie (przypadki, liczba mnoga).
3. Bądź bardzo opisowy i kreatywny. Tekst musi być przyjazny dla Text-To-Speech (zwykły tekst, bez Markdowna, bez emotikonów).
4. Nie używaj wstępów, powitań ani metakomentarzy (np. "Oto wskazówka"). Wypisz TYLKO wskazówkę.
5. SAMOWERYFIKACJA przed odpowiedzią: Upewnij się, że słowo "${word}" (w żadnej formie) nie pojawia się w Twojej odpowiedzi.

PRZYKŁAD OCZEKIWANEGO TONU I FORMATU ODPOWIEDZI:
Kontekst: Ukryte słowo to "ZEGAR". Gracz wpisał "PASEK" (E żółty, A żółty).
Wskazówka: Znalazłeś właściwe litery E oraz A, ale znajdują się one na złych pozycjach. Twój strzał dotyczy elementu garderoby, jednak musisz szukać w zupełnie innej kategorii. Zastanów się nad powszechnie używanymi urządzeniami, które często wiszą na ścianie i służą do odmierzania upływającego czasu.
`;

// Fixed secrets for deterministic comparison
const SECRET_EN = "MIRROR";
const SECRET_PL = "LUSTRO";

// =============================================================================
// Test matrix — 4 calls per model
// =============================================================================

type CallSpec = {
  readonly kind: "riddle" | "clue";
  readonly lang: "En" | "Pl";
  readonly secret: string;
  readonly temperature: number;
  readonly max_tokens: number;
  readonly fieldName: string;
  readonly description: string;
  readonly instructions: string;
  readonly prompt: string;
};

const makeCallSpecs = (): readonly CallSpec[] => [
  {
    kind: "riddle",
    lang: "En",
    secret: SECRET_EN,
    temperature: 0.9,
    max_tokens: 256,
    fieldName: "riddle",
    instructions: SYSTEM_PROMPT_RIDDLE_EN(SECRET_EN),
    prompt: RIDDLE_PROMPT_EN,
    description: "Plain prose, a short riddle (1-3 sentences) ending in a question, TTS-friendly. No Markdown or emojis.",
  },
  {
    kind: "riddle",
    lang: "Pl",
    secret: SECRET_PL,
    temperature: 0.9,
    max_tokens: 256,
    fieldName: "riddle",
    instructions: SYSTEM_PROMPT_RIDDLE_PL(SECRET_PL),
    prompt: RIDDLE_PROMPT_PL,
    description: "Zwykły tekst, krótka zagadka (1-3 zdania) zakończona pytaniem, przyjazna dla TTS. Bez Markdownu i emotikonów.",
  },
  {
    kind: "clue",
    lang: "En",
    secret: SECRET_EN,
    temperature: 0.5,
    max_tokens: 512,
    fieldName: "clue",
    instructions: SYSTEM_PROMPT_OVERRIDE_EN(SECRET_EN),
    prompt:
      `Craft the override clue now based on the following context:\n\n` +
      `Official dictionary meaning for reference: "a reflective surface".\n-> Use this to understand the exact context, but DO NOT copy it verbatim.\n\n` +
      `The player has not made any guesses yet (Turn 1).\n-> Provide a concrete, descriptive real-world category, origin, or general domain where this word is encountered to give them a strong starting point.\n\n`,
    description: "The highly descriptive clue in plain text only. Detailed, insightful, TTS-friendly. No Markdown, emojis, or preamble.",
  },
  {
    kind: "clue",
    lang: "Pl",
    secret: SECRET_PL,
    temperature: 0.5,
    max_tokens: 512,
    fieldName: "clue",
    instructions: SYSTEM_PROMPT_OVERRIDE_PL(SECRET_PL),
    prompt:
      `Stwórz wskazówkę ratunkową teraz, w oparciu o poniższy kontekst:\n\n` +
      `Oficjalna definicja słownikowa do wglądu: "powierzchnia odbijająca światło".\n-> Użyj jej, aby zrozumieć dokładny kontekst, ale NIE kopiuj jej dosłownie.\n\n` +
      `Gracz nie wypróbował jeszcze żadnych słów (pierwsza tura).\n-> Podaj opisową, konkretną kategorię z prawdziwego świata, pochodzenie lub ogólną dziedzinę, w której występuje to słowo, aby dać mu mocny punkt wyjścia.\n\n`,
    description:
      "Niezwykle wnikliwa i opisowa wskazówka wyłącznie w postaci zwykłego tekstu. Szczegółowa, przyjazna dla TTS. Bez Markdownu, emotikonów i wstępów.",
  },
];

// =============================================================================
// NVIDIA client / model layers — isolated per model (no ExecutionPlan)
// =============================================================================

const NVIDIA_BASE_URL = "https://integrate.api.nvidia.com/v1";

const nvidiaConfig = Effect.gen(function* () {
  const apiKey = yield* Config.redacted("NVIDIA_API_KEY");
  return { apiKey };
});

const makeNvidiaClientLayer = (apiKey: Redacted.Redacted<string>) =>
  Layer.effect(
    OpenAiClient.OpenAiClient,
    OpenAiClient.make({
      apiUrl: NVIDIA_BASE_URL,
      apiKey,
    })
  );

const makeIsolatedLayer = (qm: QualityModel, apiKey: Redacted.Redacted<string>, cfg: { temperature: number; max_tokens: number }) => {
  const clientLayer = makeNvidiaClientLayer(apiKey);
  const config: Record<string, unknown> = {
    temperature: cfg.temperature,
    max_tokens: cfg.max_tokens,
    top_p: qm.disableThinking ? 0.95 : 1,
  };
  // Nemotron with thinking disabled must still send the flag explicitly to isolate reasoning cost
  if (qm.disableThinking) {
    config["chat_template_kwargs"] = { enable_thinking: false };
  }
  const modelLayer = OpenAiLanguageModel.layer({
    model: qm.model,
    config,
  });
  return Layer.provide(modelLayer, clientLayer);
};

// =============================================================================
// Single-field generation (raw, no fallback) + transient retry
// =============================================================================

const TRANSIENT_PATTERN = /(temporarily overloaded|rate limit|429|internal provider error|server error)/i;

const isTransientFailure = (error: unknown): boolean => {
  const message = error instanceof Error ? error.message : String(error);
  return TRANSIENT_PATTERN.test(message);
};

const withTransientRetry = <A, E, R>(effect: Effect.Effect<A, E, R>): Effect.Effect<A, E, R> =>
  effect.pipe(
    Effect.retry({
      times: 2,
      while: (error) => isTransientFailure(error),
      schedule: Schedule.exponential("2 seconds", 2),
    })
  );

type GenerateSingleFieldOptions = {
  readonly temperature: number;
  readonly max_tokens: number;
  readonly instructions: string;
  readonly prompt: string;
  readonly fieldName: string;
  readonly description: string;
};

const attemptSingleFieldRaw = Effect.fn("attemptSingleFieldRaw")(function* (
  options: GenerateSingleFieldOptions
): Effect.fn.Return<string, unknown, LanguageModel.LanguageModel> {
  const model = yield* LanguageModel.LanguageModel;
  const fieldSchema = Schema.Struct({
    [options.fieldName]: Schema.String.pipe(Schema.annotate({ description: options.description })),
  });
  const prompt = Prompt.fromMessages([
    Prompt.systemMessage({ content: options.instructions }),
    Prompt.userMessage({ content: [Prompt.textPart({ text: options.prompt })] }),
  ]);
  const response = yield* model.generateObject({ prompt, schema: fieldSchema });
  const value = response.value as Record<string, string>;
  return value[options.fieldName] as string;
}) as unknown as (options: GenerateSingleFieldOptions) => Effect.Effect<string, unknown, LanguageModel.LanguageModel>;

// =============================================================================
// Automated checks (leak, TTS, structure)
// =============================================================================

type CallCheck = {
  readonly noLeak: boolean;
  readonly ttsPass: boolean;
  readonly endsWithQuestion: boolean;
  readonly sentenceCount: number;
  readonly charCount: number;
};

const checkOutput = (text: string, secret: string, kind: "riddle" | "clue"): CallCheck => {
  const lower = text.toLowerCase();
  const secretLower = secret.toLowerCase();
  // Strict PL declension: /lustr/i captures lustro/lustra/lustrze/lustrem/luster/lustrami incl. lustrzany
  const noLeak =
    kind === "riddle" || kind === "clue" ? (secret === SECRET_PL ? !/lustr/i.test(text) : !lower.includes(secretLower)) : !lower.includes(secretLower);
  const hasMarkdown = /(\*\*|__|#{1,6}\s|```|`[^`]+`|<[^>]+>)/.test(text);
  const hasEmoji = /\p{Emoji}/u.test(text);
  const ttsPass = !hasMarkdown && !hasEmoji;
  const endsWithQuestion = text.trim().endsWith("?");
  const sentenceCount = text.split(/[.!?]+\s*/).filter((s) => s.trim().length > 0).length;
  const charCount = text.length;
  return { noLeak, ttsPass, endsWithQuestion, sentenceCount, charCount };
};

// =============================================================================
// Results
// =============================================================================

type CallResult = {
  readonly kind: "riddle" | "clue";
  readonly lang: "En" | "Pl";
  readonly success: boolean;
  readonly text?: string;
  readonly error?: string;
  readonly check?: CallCheck;
  readonly latencyMs?: number;
};

type ModelResult = {
  readonly model: string;
  readonly label: string;
  readonly langHint: string;
  readonly results: readonly CallResult[];
};

// =============================================================================
// Runner
// =============================================================================

const runOneCall = (qm: QualityModel, spec: CallSpec, apiKey: Redacted.Redacted<string>) =>
  Effect.gen(function* () {
    const label = `${spec.kind} ${spec.lang} (${spec.secret}) T=${spec.temperature}`;
    yield* Effect.log(`  → ${label} ...`);
    const start = Date.now();
    const options: GenerateSingleFieldOptions = {
      temperature: spec.temperature,
      max_tokens: spec.max_tokens,
      instructions: spec.instructions,
      prompt: spec.prompt,
      fieldName: spec.fieldName,
      description: spec.description,
    };
    const layer = makeIsolatedLayer(qm, apiKey, { temperature: spec.temperature, max_tokens: spec.max_tokens });
    const effect = attemptSingleFieldRaw(options).pipe(
      Effect.provide(layer),
      withTransientRetry,
      Effect.timeout("60 seconds"),
      Effect.tapError((e) => Effect.logError(`[${qm.label}] ${label} failed: ${String(e)}`))
    );
    const result = yield* effect.pipe(
      Effect.map((text) => ({ _tag: "Success" as const, text })),
      Effect.catch((error: unknown) => Effect.succeed({ _tag: "Error" as const, error }))
    );
    const latencyMs = Date.now() - start;
    if (result._tag === "Success") {
      const text = result.text;
      const check = checkOutput(text, spec.secret, spec.kind);
      const preview = text.length > 180 ? text.slice(0, 180) + "…" : text;
      yield* Effect.log(
        `    SUCCESS ${latencyMs}ms — ${check.noLeak ? "leak:✅" : "leak:❌"} ${check.ttsPass ? "tts:✅" : "tts:❌"} sent:${check.sentenceCount} ?ends:${check.endsWithQuestion ? "✅" : "❌"} — "${preview}"`
      );
      return { kind: spec.kind, lang: spec.lang, success: true, text, check, latencyMs } as const;
    } else {
      const error = result.error instanceof Error ? result.error.message : String(result.error);
      yield* Effect.log(`    FAILED ${latencyMs}ms — ${error}`);
      return { kind: spec.kind, lang: spec.lang, success: false, error, latencyMs } as const;
    }
  });

const runModel = (qm: QualityModel, apiKey: Redacted.Redacted<string>) =>
  Effect.gen(function* () {
    yield* Effect.log(`\n${"=".repeat(70)}`);
    yield* Effect.log(`Model: ${qm.label} (${qm.model}) — ${qm.langHint}`);
    yield* Effect.log(`${"=".repeat(70)}`);
    const specs = makeCallSpecs();
    const results: CallResult[] = [];
    for (const spec of specs) {
      const res = yield* runOneCall(qm, spec, apiKey);
      results.push(res);
      yield* Effect.sleep("2 seconds");
    }
    return { model: qm.model, label: qm.label, langHint: qm.langHint, results } as ModelResult;
  });

// =============================================================================
// Report — markdown + json
// =============================================================================

const buildReport = (all: readonly ModelResult[]): string => {
  const header = `# NVIDIA Quality Matrix — ${new Date().toISOString()}\n\nBase URL: ${NVIDIA_BASE_URL}\nModels: ${QUALITY_MODELS.length} (isolated, no fallback)\nSecrets: ${SECRET_EN} (En) / ${SECRET_PL} (Pl) — 4 calls/model: riddle En/Pl (T=0.9, 256 tok) + clue En/Pl (T=0.5, 512 tok)\n\n## Automated checks: leak (incl. lustr declension), TTS plain-text, sentences 1-3, ends with ?, char count\n\n## Human rubric (fill after run, 1-5): Riddle wit (1 generic →5 concrete), Grammar Pl/ En, Clue delta vs riddle\n\n| Model | Riddle En | Riddle Pl | Clue En | Clue Pl | Leak | TTS | Notes |\n|---|---|---|---|---|---|---|---|`;
  const rows = all.map((m) => {
    const by = (k: "riddle" | "clue", l: "En" | "Pl") => m.results.find((r) => r.kind === k && r.lang === l);
    const cell = (k: "riddle" | "clue", l: "En" | "Pl") => {
      const r = by(k, l);
      if (!r) return "—";
      if (!r.success) return `❌ ${(r.error ?? "").slice(0, 60)}`;
      const c = r.check!;
      const ok = c.noLeak && c.ttsPass && (k === "clue" || c.endsWithQuestion) ? "✅" : "⚠️";
      const preview = (r.text ?? "").slice(0, 80).replace(/\n/g, " ").replace(/\|/g, "/");
      return `${ok} ${r.latencyMs}ms — "${preview}…"`;
    };
    const leakOk = m.results.filter((r) => r.success).every((r) => r.check?.noLeak) ? "✅" : m.results.some((r) => r.success && !r.check?.noLeak) ? "❌" : "—";
    const ttsOk = m.results.filter((r) => r.success).every((r) => r.check?.ttsPass) ? "✅" : "⚠️";
    return `| ${m.label} | ${cell("riddle", "En")} | ${cell("riddle", "Pl")} | ${cell("clue", "En")} | ${cell("clue", "Pl")} | ${leakOk} | ${ttsOk} | ${m.langHint} |`;
  });
  const details = all
    .map((m) => {
      const blocks = m.results
        .map((r) => {
          const title = `#### ${r.kind} ${r.lang} — ${r.success ? `SUCCESS ${r.latencyMs}ms` : `FAILED ${r.latencyMs}ms`}`;
          const body = r.success
            ? `> ${r.text}\n\nChecks: leak ${r.check?.noLeak ? "✅" : "❌"} tts ${r.check?.ttsPass ? "✅" : "❌"} sent ${r.check?.sentenceCount} ?ends ${r.check?.endsWithQuestion ? "✅" : "❌"} chars ${r.check?.charCount}`
            : `Error: ${r.error}`;
          return `${title}\n\n${body}`;
        })
        .join("\n\n");
      return `<details><summary>${m.label} — ${m.model}</summary>\n\n${blocks}\n\n</details>`;
    })
    .join("\n\n");
  return `${header}\n${rows.join("\n")}\n\n---\n\n${details}\n`;
};

// =============================================================================
// Main — following src/seed/run-migrations.ts pattern
// =============================================================================

const MainLayer = Layer.mergeAll(Logger.layer([Logger.consolePretty()]), NodeServices.layer, NodeHttpClient.layerUndici);

const main = Effect.gen(function* () {
  const { apiKey } = yield* nvidiaConfig;

  yield* Effect.log("🔬 NVIDIA Quality Matrix — isolated per-model (no ExecutionPlan)");
  yield* Effect.log(`Models: ${QUALITY_MODELS.length} — 4 calls each (riddle En/Pl T=0.9/256, clue En/Pl T=0.5/512)`);
  yield* Effect.log(`Base URL: ${NVIDIA_BASE_URL}`);
  yield* Effect.log("Running sequentially to respect rate limits (2s between calls, 5s between models)...\n");

  const allResults: ModelResult[] = [];

  for (const qm of QUALITY_MODELS) {
    const res = yield* runModel(qm, apiKey);
    allResults.push(res);
    if (qm !== QUALITY_MODELS[QUALITY_MODELS.length - 1]) {
      yield* Effect.log("\nWaiting 5 seconds before next model...");
      yield* Effect.sleep("5 seconds");
    }
  }

  // Console summary
  yield* Effect.log(`\n${"=".repeat(70)}`);
  yield* Effect.log("FINAL SUMMARY");
  yield* Effect.log(`${"=".repeat(70)}`);
  for (const m of allResults) {
    const ok = m.results.filter((r) => r.success).length;
    const leakOk = m.results.filter((r) => r.success).every((r) => r.check?.noLeak);
    yield* Effect.log(`${ok}/4 ${leakOk ? "leak:✅" : "leak:❌"} | ${m.label} — ${m.langHint}`);
  }

  // Write reports — markdown + json sidecar (via node:fs)
  const md = buildReport(allResults);
  const json = JSON.stringify(allResults, null, 2);
  yield* Effect.tryPromise(() => Fs.writeFile("src/seed/nvidia-quality-matrix.report.md", md, "utf8")).pipe(
    Effect.catch((e: unknown) => Effect.logError(`Failed to write md report: ${String(e)}`))
  );
  yield* Effect.tryPromise(() => Fs.writeFile("src/seed/nvidia-quality-matrix.report.json", json, "utf8")).pipe(
    Effect.catch((e: unknown) => Effect.logError(`Failed to write json report: ${String(e)}`))
  );
  yield* Effect.log("\nReports written: src/seed/nvidia-quality-matrix.report.md + .json");
  yield* Effect.log("Human rubric: fill Riddle wit / Grammar / Clue delta 1-5 per cell to decide (A) Bielik-primary vs (B) Llama-primary.");
}).pipe(Effect.provide(MainLayer));

// Use NodeRuntime.runMain for graceful teardown on CTRL+C
NodeRuntime.runMain(main);
