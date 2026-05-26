// services, features, and other libraries
import { Effect, Schema } from "effect";
import { RuntimeServer } from "@/lib/RuntimeServer";
import { generateRiddle, RiddleRequestSchema } from "@/domain";

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

const decodeRequest = (request: Request) => Effect.promise(() => request.json()).pipe(Effect.flatMap(Schema.decodeUnknown(RiddleRequestSchema)));

const main = (request: Request) =>
  Effect.gen(function* () {
    const { theSecretWord, solutionsLanguage } = yield* decodeRequest(request);
    const riddle = yield* generateRiddle(theSecretWord, solutionsLanguage);
    return Response.json({ riddle });
  }).pipe(Effect.catchAll((error) => Effect.logError(`[RIDDLE] recovering from ${error._tag}`)));

export async function POST(request: Request) {
  return await RuntimeServer.runPromise(main(request));
}
