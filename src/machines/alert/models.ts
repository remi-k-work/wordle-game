// services, features, and other libraries
import { Predicate, Schema } from "effect";

// types
import type { EventUnion } from "@/lib/machine-setup";

export type OkayedCallback = () => void | Promise<void>;

// The confirm callback rides along on the `okayed` event, so its type is the invoke actor's input
export const OkayedCallback = Schema.declare<OkayedCallback>((input): input is OkayedCallback => Predicate.isFunction(input), { title: "OkayedCallback" });

// Events are part of the machine's interface
export const Events = {
  opened: Schema.Struct({ alertType: Schema.Literal("forfeit-run") }),
  okayed: Schema.Struct({ onOkayed: OkayedCallback }),
  cancelled: Schema.Struct({}),
};

export type Events = EventUnion<typeof Events>;
