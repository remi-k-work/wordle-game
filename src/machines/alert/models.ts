// services, features, and other libraries
import { Predicate, Schema } from "effect";

// types
export type OkayedCallback = () => void | Promise<void>;

// The confirm callback rides along on the `okayed` event, so its type is the invoke actor's input
export const OkayedCallback = Schema.declare<OkayedCallback>((input): input is OkayedCallback => Predicate.isFunction(input), { title: "OkayedCallback" });
