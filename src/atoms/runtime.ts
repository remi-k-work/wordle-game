// services, features, and other libraries
import { Layer, Logger } from "effect";
import { Atom } from "@effect-atom/atom-react";
import { BrowserKeyValueStore } from "@effect/platform-browser";
import { GameData } from "@/services";

const MainLayer = Layer.mergeAll(Logger.pretty, GameData.Default, BrowserKeyValueStore.layerLocalStorage);

export const Runtime = Atom.runtime(MainLayer);
