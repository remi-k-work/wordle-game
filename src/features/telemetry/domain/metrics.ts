// services, features, and other libraries
import { Metric } from "effect";

export const gameInvalidGuesses = Metric.counter("gameInvalidGuesses", { incremental: true }).pipe(Metric.withConstantInput(1));
export const gameValidGuesses = Metric.counter("gameValidGuesses", { incremental: true }).pipe(Metric.withConstantInput(1));
