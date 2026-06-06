// services, features, and other libraries
import { Metric } from "effect";

export const gameGuessesTotal = Metric.counter("game_guesses_total").pipe(Metric.withConstantInput(1));
