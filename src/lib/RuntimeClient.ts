// services, features, and other libraries
import { Layer, Logger } from "effect";
import { Atom } from "@effect-atom/atom-react";
import { BrowserKeyValueStore } from "@effect/platform-browser";
import { GameData } from "@/services/gameData";
import { RpcHighScoreClient } from "@/rpc/highScore/client";

const MainLayer = Layer.mergeAll(Logger.pretty, BrowserKeyValueStore.layerLocalStorage, GameData.Default, RpcHighScoreClient.Default);

export const RuntimeAtom = Atom.runtime(MainLayer);
