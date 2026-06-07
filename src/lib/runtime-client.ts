// services, features, and other libraries
import { Layer, Logger } from "effect";
import { Atom } from "effect/unstable/reactivity";
import { BrowserKeyValueStore } from "@effect/platform-browser";
import { RpcGameClient } from "@/features/game/rpc/client";
import { RpcHighScoreClient } from "@/features/high-score/rpc/client";

const MainLayer = Layer.mergeAll(Logger.layer([Logger.consolePretty()]), BrowserKeyValueStore.layerLocalStorage, RpcGameClient.layer, RpcHighScoreClient.layer);

export const RuntimeAtom = Atom.runtime(MainLayer);
