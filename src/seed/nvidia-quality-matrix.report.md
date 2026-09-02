# NVIDIA Quality Matrix — 2026-09-02T13:25:29.252Z

Base URL: https://integrate.api.nvidia.com/v1
Models: 10 (isolated, no fallback)
Secrets: MIRROR (En) / LUSTRO (Pl) — 4 calls/model: riddle En/Pl (T=0.9, 256 tok) + clue En/Pl (T=0.5, 512 tok)

## Automated checks: leak (incl. lustr declension), TTS plain-text, sentences 1-3, ends with ?, char count

## Human rubric (fill after run, 1-5): Riddle wit (1 generic →5 concrete), Grammar Pl/ En, Clue delta vs riddle

| Model | Riddle En | Riddle Pl | Clue En | Clue Pl | Leak | TTS | Notes |
|---|---|---|---|---|---|---|---|
| Bielik 11B v2.6 | ❌ OpenAiClient.createResponse: Invalid request. HTTP 404 (POST | ❌ OpenAiClient.createResponse: Invalid request. HTTP 404 (POST | ❌ OpenAiClient.createResponse: Invalid request. HTTP 404 (POST | ❌ OpenAiClient.createResponse: Invalid request. HTTP 404 (POST | ✅ | ✅ | PL-native (En test = failure mode) |
| EuroLLM 9B | ❌ OpenAiClient.createResponse: Invalid request. HTTP 404 (POST | ❌ OpenAiClient.createResponse: Invalid request. HTTP 404 (POST | ❌ OpenAiClient.createResponse: Invalid request. HTTP 404 (POST | ❌ OpenAiClient.createResponse: Invalid request. HTTP 404 (POST | ✅ | ✅ | EU 24 langs |
| Mistral Small 24B | ❌ OpenAiClient.createResponse: Invalid request. HTTP 404 (POST | ❌ OpenAiClient.createResponse: Invalid request. HTTP 404 (POST | ❌ OpenAiClient.createResponse: Invalid request. HTTP 404 (POST | ❌ OpenAiClient.createResponse: Invalid request. HTTP 404 (POST | ✅ | ✅ | Euro fast |
| Llama 3.3 70B | ❌ OpenAiClient.createResponse: Unknown error | ❌ OpenAiClient.createResponse: Unknown error | ❌ OpenAiClient.createResponse: Unknown error | ❌ OpenAiClient.createResponse: Unknown error | ✅ | ✅ | Balanced baseline |
| Llama 3.1 8B | ❌ OpenAiClient.createResponse: Unknown error | ❌ OpenAiClient.createResponse: Unknown error | ❌ OpenAiClient.createResponse: Unknown error | ❌ OpenAiClient.createResponse: Unknown error | ✅ | ✅ | Small baseline |
| Gemma 2 9B | ❌ OpenAiClient.createResponse: Invalid request. HTTP 404 (POST | ❌ OpenAiClient.createResponse: Invalid request. HTTP 404 (POST | ❌ OpenAiClient.createResponse: Invalid request. HTTP 404 (POST | ❌ OpenAiClient.createResponse: Invalid request. HTTP 404 (POST | ✅ | ✅ | Google small |
| Qwen3 Next 80B A3B | ❌ OpenAiClient.createResponse: Unknown error | ❌ OpenAiClient.createResponse: Unknown error | ❌ OpenAiClient.createResponse: Unknown error | ❌ OpenAiClient.createResponse: Unknown error | ✅ | ✅ | MoE 80B/3B active |
| GPT-OSS 120B | ❌ LanguageModel.generateObject: Structured output validation f | ❌ LanguageModel.generateObject: Structured output validation f | ❌  | ❌  | ✅ | ✅ | Control (previous fallback) |
| Nemotron Super 120B (thinking OFF) | ✅ 2591ms — "I stand still yet show you in motion, flipping left and right without moving a m…" | ✅ 1458ms — "Mogę pokazać twój uśmiech, zanim go wypowiesz, i złapać twój wzrok, choć sam nie…" | ✅ 3227ms — "Think of an object commonly found in bathrooms, bedrooms, or hallways that allow…" | ✅ 7345ms — "To przedmiot codziennego użytku, który znajduje się w łazienkach, sypialniach i …" | ✅ | ✅ | Reasoning, thinking disabled |
| Nemotron Ultra 550B (thinking OFF) | ✅ 43773ms — "I hang on the wall or stand on the floor, showing your face when you stand befor…" | ❌  | ✅ 27935ms — "This object belongs to the domain of optics and interior design. Historically cr…" | ✅ 49067ms — "Ten przedmiot to niezbędny element wyposażenia każdego domu, a także kluczowy ko…" | ✅ | ✅ | Reasoning, thinking disabled |

---

<details><summary>Bielik 11B v2.6 — speakleash/bielik-11b-v2.6-instruct</summary>

#### riddle En — FAILED 293ms

Error: OpenAiClient.createResponse: Invalid request. HTTP 404 (POST https://integrate.api.nvidia.com/v1/chat/completions) Response: 404 page not found


#### riddle Pl — FAILED 64ms

Error: OpenAiClient.createResponse: Invalid request. HTTP 404 (POST https://integrate.api.nvidia.com/v1/chat/completions) Response: 404 page not found


#### clue En — FAILED 63ms

Error: OpenAiClient.createResponse: Invalid request. HTTP 404 (POST https://integrate.api.nvidia.com/v1/chat/completions) Response: 404 page not found


#### clue Pl — FAILED 62ms

Error: OpenAiClient.createResponse: Invalid request. HTTP 404 (POST https://integrate.api.nvidia.com/v1/chat/completions) Response: 404 page not found


</details>

<details><summary>EuroLLM 9B — utter-project/eurollm-9b-instruct</summary>

#### riddle En — FAILED 157ms

Error: OpenAiClient.createResponse: Invalid request. HTTP 404 (POST https://integrate.api.nvidia.com/v1/chat/completions) Response: 404 page not found


#### riddle Pl — FAILED 61ms

Error: OpenAiClient.createResponse: Invalid request. HTTP 404 (POST https://integrate.api.nvidia.com/v1/chat/completions) Response: 404 page not found


#### clue En — FAILED 65ms

Error: OpenAiClient.createResponse: Invalid request. HTTP 404 (POST https://integrate.api.nvidia.com/v1/chat/completions) Response: 404 page not found


#### clue Pl — FAILED 64ms

Error: OpenAiClient.createResponse: Invalid request. HTTP 404 (POST https://integrate.api.nvidia.com/v1/chat/completions) Response: 404 page not found


</details>

<details><summary>Mistral Small 24B — mistralai/mistral-small-24b-instruct-2501</summary>

#### riddle En — FAILED 160ms

Error: OpenAiClient.createResponse: Invalid request. HTTP 404 (POST https://integrate.api.nvidia.com/v1/chat/completions) Response: 404 page not found


#### riddle Pl — FAILED 67ms

Error: OpenAiClient.createResponse: Invalid request. HTTP 404 (POST https://integrate.api.nvidia.com/v1/chat/completions) Response: 404 page not found


#### clue En — FAILED 66ms

Error: OpenAiClient.createResponse: Invalid request. HTTP 404 (POST https://integrate.api.nvidia.com/v1/chat/completions) Response: 404 page not found


#### clue Pl — FAILED 62ms

Error: OpenAiClient.createResponse: Invalid request. HTTP 404 (POST https://integrate.api.nvidia.com/v1/chat/completions) Response: 404 page not found


</details>

<details><summary>Llama 3.3 70B — meta/llama-3.3-70b-instruct</summary>

#### riddle En — FAILED 160ms

Error: OpenAiClient.createResponse: Unknown error

#### riddle Pl — FAILED 60ms

Error: OpenAiClient.createResponse: Unknown error

#### clue En — FAILED 61ms

Error: OpenAiClient.createResponse: Unknown error

#### clue Pl — FAILED 60ms

Error: OpenAiClient.createResponse: Unknown error

</details>

<details><summary>Llama 3.1 8B — meta/llama-3.1-8b-instruct</summary>

#### riddle En — FAILED 157ms

Error: OpenAiClient.createResponse: Unknown error

#### riddle Pl — FAILED 61ms

Error: OpenAiClient.createResponse: Unknown error

#### clue En — FAILED 63ms

Error: OpenAiClient.createResponse: Unknown error

#### clue Pl — FAILED 61ms

Error: OpenAiClient.createResponse: Unknown error

</details>

<details><summary>Gemma 2 9B — google/gemma-2-9b-it</summary>

#### riddle En — FAILED 159ms

Error: OpenAiClient.createResponse: Invalid request. HTTP 404 (POST https://integrate.api.nvidia.com/v1/chat/completions) Response: 404 page not found


#### riddle Pl — FAILED 63ms

Error: OpenAiClient.createResponse: Invalid request. HTTP 404 (POST https://integrate.api.nvidia.com/v1/chat/completions) Response: 404 page not found


#### clue En — FAILED 62ms

Error: OpenAiClient.createResponse: Invalid request. HTTP 404 (POST https://integrate.api.nvidia.com/v1/chat/completions) Response: 404 page not found


#### clue Pl — FAILED 62ms

Error: OpenAiClient.createResponse: Invalid request. HTTP 404 (POST https://integrate.api.nvidia.com/v1/chat/completions) Response: 404 page not found


</details>

<details><summary>Qwen3 Next 80B A3B — qwen/qwen3-next-80b-a3b-instruct</summary>

#### riddle En — FAILED 157ms

Error: OpenAiClient.createResponse: Unknown error

#### riddle Pl — FAILED 61ms

Error: OpenAiClient.createResponse: Unknown error

#### clue En — FAILED 63ms

Error: OpenAiClient.createResponse: Unknown error

#### clue Pl — FAILED 78ms

Error: OpenAiClient.createResponse: Unknown error

</details>

<details><summary>GPT-OSS 120B — openai/gpt-oss-120b</summary>

#### riddle En — FAILED 3047ms

Error: LanguageModel.generateObject: Structured output validation failed: No text content in response

#### riddle Pl — FAILED 3528ms

Error: LanguageModel.generateObject: Structured output validation failed: No text content in response

#### clue En — FAILED 60018ms

Error: undefined

#### clue Pl — FAILED 60018ms

Error: undefined

</details>

<details><summary>Nemotron Super 120B (thinking OFF) — nvidia/nemotron-3-super-120b-a12b</summary>

#### riddle En — SUCCESS 2591ms

> I stand still yet show you in motion, flipping left and right without moving a muscle. What am I?

Checks: leak ✅ tts ✅ sent 2 ?ends ✅ chars 97

#### riddle Pl — SUCCESS 1458ms

> Mogę pokazać twój uśmiech, zanim go wypowiesz, i złapać twój wzrok, choć sam nie widzę. Czym jestem?

Checks: leak ✅ tts ✅ sent 2 ?ends ✅ chars 100

#### clue En — SUCCESS 3227ms

> Think of an object commonly found in bathrooms, bedrooms, or hallways that allows you to see your own reflection. It is often made of glass with a metallic backing and is used for grooming, decoration, or checking one's appearance.

Checks: leak ✅ tts ✅ sent 2 ?ends ❌ chars 231

#### clue Pl — SUCCESS 7345ms

> To przedmiot codziennego użytku, który znajduje się w łazienkach, sypialniach i garderobach, służący do sprawdzania wyglądu oraz odbijania otoczenia. Należy do kategorii akcesoriów domowych i często wykonany jest ze szkła pokrytego warstwą metalu.

Checks: leak ✅ tts ✅ sent 2 ?ends ❌ chars 247

</details>

<details><summary>Nemotron Ultra 550B (thinking OFF) — nvidia/nemotron-3-ultra-550b-a55b</summary>

#### riddle En — SUCCESS 43773ms

> I hang on the wall or stand on the floor, showing your face when you stand before. I flip left to right but never make a sound, found in bathrooms and dressing rooms all around. What am I?

Checks: leak ✅ tts ✅ sent 3 ?ends ✅ chars 188

#### riddle Pl — FAILED 60011ms

Error: undefined

#### clue En — SUCCESS 27935ms

> This object belongs to the domain of optics and interior design. Historically crafted from polished metal like bronze or silver before the advent of glass coating techniques, it is now commonly manufactured by applying a thin metallic backing to a pane of glass. You will find it mounted above sinks, standing in bedrooms, or integrated into the doors of vehicles, serving the essential function of allowing a person to inspect their own appearance or view the space behind them.

Checks: leak ✅ tts ✅ sent 3 ?ends ❌ chars 479

#### clue Pl — SUCCESS 49067ms

> Ten przedmiot to niezbędny element wyposażenia każdego domu, a także kluczowy komponent w optyce i astronomii, gdzie służy do kierowania wiązek światła w teleskopach. W codziennym życiu znajduje się zazwyczaj w łazience, przedpokoju lub sypialni, często osadzony w ramie, pozwalając na sprawdzenie wyglądu przed wyjściem. Historycznie pierwsze egzemplarze powstawały z polerowanych metali, a dopiero rozwój hutnictwa szkła umożliwił masowe tworzenie wersji płaskich o idealnie gładkiej powierzchni.

Checks: leak ✅ tts ✅ sent 3 ?ends ❌ chars 498

</details>
