// services, features, and other libraries
import { Schema } from "effect";

// A finite number constrained to an inclusive range (volume, rate, pitch)
export const Bounded = (minimum: number, maximum: number) => Schema.Finite.check(Schema.isBetween({ minimum, maximum }));
