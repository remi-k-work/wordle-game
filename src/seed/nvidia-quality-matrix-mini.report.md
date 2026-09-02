# NVIDIA Quality Matrix MINI — 2026-09-02T13:41:26.153Z

Base URL: https://integrate.api.nvidia.com/v1
Models: 4 (isolated, no fallback, actually available on /v1/models)
Secrets: MIRROR (En) / LUSTRO (Pl) — 4 calls/model: riddle En/Pl (T=0.9, 256 tok) + clue En/Pl (T=0.5, 512 tok)

## Automated checks: leak (incl. lustr declension), TTS, sentences 1-3, ends with ?, char count

## Human rubric (1-5): Riddle wit, Grammar Pl/En, Clue delta vs riddle

| Model | Riddle En | Riddle Pl | Clue En | Clue Pl | Leak | TTS | Notes |
|---|---|---|---|---|---|---|---|
| Nemotron Super 120B (thinking OFF) | ❌ OpenAiClient.createResponse: Invalid request. HTTP 404 (POST | ✅ 3083ms — "Nie mam ust, a mogę powtórzyć każde twoje słowo. Stoję w miejscu, lecz podróżuję…" | ❌ OpenAiClient.createResponse: Invalid request. HTTP 404 (POST | ✅ 731ms — "Spotykane w łazienkach, sypialniach i garderobach – służy do sprawdzania wyglądu…" | ✅ | ✅ | Control — reasoning disabled |
| Mistral 7B v0.3 | ❌ OpenAiClient.createResponse: Invalid request. HTTP 404 (POST | ❌ OpenAiClient.createResponse: Invalid request. HTTP 404 (POST | ❌ OpenAiClient.createResponse: Invalid request. HTTP 404 (POST | ❌ OpenAiClient.createResponse: Invalid request. HTTP 404 (POST | ✅ | ✅ | Euro 7B — available |
| Gemma 3 12B IT | ❌ OpenAiClient.createResponse: Invalid request. HTTP 404 (POST | ❌ OpenAiClient.createResponse: Invalid request. HTTP 404 (POST | ❌ OpenAiClient.createResponse: Invalid request. HTTP 404 (POST | ❌ OpenAiClient.createResponse: Invalid request. HTTP 404 (POST | ✅ | ✅ | Google 12B — available |
| Llama Nemotron 70B | ❌ OpenAiClient.createResponse: Invalid request. HTTP 404 (POST | ❌ OpenAiClient.createResponse: Invalid request. HTTP 404 (POST | ❌ OpenAiClient.createResponse: Invalid request. HTTP 404 (POST | ❌ OpenAiClient.createResponse: Invalid request. HTTP 404 (POST | ✅ | ✅ | NVIDIA Llama 70B — available |

---

<details><summary>Nemotron Super 120B (thinking OFF) — nvidia/nemotron-3-super-120b-a12b</summary>

#### riddle En — FAILED 601ms

Error: OpenAiClient.createResponse: Invalid request. HTTP 404 (POST https://integrate.api.nvidia.com/v1/chat/completions)

#### riddle Pl — SUCCESS 3083ms

> Nie mam ust, a mogę powtórzyć każde twoje słowo. Stoję w miejscu, lecz podróżuję wzrokiem daleko poza siebie. Czym jestem?

Checks: leak ✅ tts ✅ sent 3 ?ends ✅ chars 122

#### clue En — FAILED 449ms

Error: OpenAiClient.createResponse: Invalid request. HTTP 404 (POST https://integrate.api.nvidia.com/v1/chat/completions)

#### clue Pl — SUCCESS 731ms

> Spotykane w łazienkach, sypialniach i garderobach – służy do sprawdzania wyglądu lub makijażu.

Checks: leak ✅ tts ✅ sent 1 ?ends ❌ chars 94

</details>

<details><summary>Mistral 7B v0.3 — mistralai/mistral-7b-instruct-v0.3</summary>

#### riddle En — FAILED 277ms

Error: OpenAiClient.createResponse: Invalid request. HTTP 404 (POST https://integrate.api.nvidia.com/v1/chat/completions) Response: {"status":404,"title":"Not Found","detail":"Function 'cd89bd68-13e3-47a9-861e-9a62e6e14b05': Not found for account 'eoqj8Ee4ZHl2FFUEulAUHSoh_ocXAndQ2LiOm8EoPzA'"}

#### riddle Pl — FAILED 196ms

Error: OpenAiClient.createResponse: Invalid request. HTTP 404 (POST https://integrate.api.nvidia.com/v1/chat/completions) Response: {"status":404,"title":"Not Found","detail":"Function 'cd89bd68-13e3-47a9-861e-9a62e6e14b05': Not found for account 'eoqj8Ee4ZHl2FFUEulAUHSoh_ocXAndQ2LiOm8EoPzA'"}

#### clue En — FAILED 178ms

Error: OpenAiClient.createResponse: Invalid request. HTTP 404 (POST https://integrate.api.nvidia.com/v1/chat/completions) Response: {"status":404,"title":"Not Found","detail":"Function 'cd89bd68-13e3-47a9-861e-9a62e6e14b05': Not found for account 'eoqj8Ee4ZHl2FFUEulAUHSoh_ocXAndQ2LiOm8EoPzA'"}

#### clue Pl — FAILED 153ms

Error: OpenAiClient.createResponse: Invalid request. HTTP 404 (POST https://integrate.api.nvidia.com/v1/chat/completions) Response: {"status":404,"title":"Not Found","detail":"Function 'cd89bd68-13e3-47a9-861e-9a62e6e14b05': Not found for account 'eoqj8Ee4ZHl2FFUEulAUHSoh_ocXAndQ2LiOm8EoPzA'"}

</details>

<details><summary>Gemma 3 12B IT — google/gemma-3-12b-it</summary>

#### riddle En — FAILED 248ms

Error: OpenAiClient.createResponse: Invalid request. HTTP 404 (POST https://integrate.api.nvidia.com/v1/chat/completions) Response: {"status":404,"title":"Not Found","detail":"Function 'ee47df99-c92b-4dc9-b3a7-f3fb0f087b73': Not found for account 'eoqj8Ee4ZHl2FFUEulAUHSoh_ocXAndQ2LiOm8EoPzA'"}

#### riddle Pl — FAILED 150ms

Error: OpenAiClient.createResponse: Invalid request. HTTP 404 (POST https://integrate.api.nvidia.com/v1/chat/completions) Response: {"status":404,"title":"Not Found","detail":"Function 'ee47df99-c92b-4dc9-b3a7-f3fb0f087b73': Not found for account 'eoqj8Ee4ZHl2FFUEulAUHSoh_ocXAndQ2LiOm8EoPzA'"}

#### clue En — FAILED 152ms

Error: OpenAiClient.createResponse: Invalid request. HTTP 404 (POST https://integrate.api.nvidia.com/v1/chat/completions) Response: {"status":404,"title":"Not Found","detail":"Function 'ee47df99-c92b-4dc9-b3a7-f3fb0f087b73': Not found for account 'eoqj8Ee4ZHl2FFUEulAUHSoh_ocXAndQ2LiOm8EoPzA'"}

#### clue Pl — FAILED 148ms

Error: OpenAiClient.createResponse: Invalid request. HTTP 404 (POST https://integrate.api.nvidia.com/v1/chat/completions) Response: {"status":404,"title":"Not Found","detail":"Function 'ee47df99-c92b-4dc9-b3a7-f3fb0f087b73': Not found for account 'eoqj8Ee4ZHl2FFUEulAUHSoh_ocXAndQ2LiOm8EoPzA'"}

</details>

<details><summary>Llama Nemotron 70B — nvidia/llama-3.1-nemotron-70b-instruct</summary>

#### riddle En — FAILED 242ms

Error: OpenAiClient.createResponse: Invalid request. HTTP 404 (POST https://integrate.api.nvidia.com/v1/chat/completions) Response: {"status":404,"title":"Not Found","detail":"Function '9b96341b-9791-4db9-a00d-4e43aa192a39': Not found for account 'eoqj8Ee4ZHl2FFUEulAUHSoh_ocXAndQ2LiOm8EoPzA'"}

#### riddle Pl — FAILED 146ms

Error: OpenAiClient.createResponse: Invalid request. HTTP 404 (POST https://integrate.api.nvidia.com/v1/chat/completions) Response: {"status":404,"title":"Not Found","detail":"Function '9b96341b-9791-4db9-a00d-4e43aa192a39': Not found for account 'eoqj8Ee4ZHl2FFUEulAUHSoh_ocXAndQ2LiOm8EoPzA'"}

#### clue En — FAILED 145ms

Error: OpenAiClient.createResponse: Invalid request. HTTP 404 (POST https://integrate.api.nvidia.com/v1/chat/completions) Response: {"status":404,"title":"Not Found","detail":"Function '9b96341b-9791-4db9-a00d-4e43aa192a39': Not found for account 'eoqj8Ee4ZHl2FFUEulAUHSoh_ocXAndQ2LiOm8EoPzA'"}

#### clue Pl — FAILED 148ms

Error: OpenAiClient.createResponse: Invalid request. HTTP 404 (POST https://integrate.api.nvidia.com/v1/chat/completions) Response: {"status":404,"title":"Not Found","detail":"Function '9b96341b-9791-4db9-a00d-4e43aa192a39': Not found for account 'eoqj8Ee4ZHl2FFUEulAUHSoh_ocXAndQ2LiOm8EoPzA'"}

</details>
