import { Atom } from "@effect-atom/atom";
import * as Layer from "effect/Layer";
import { SolutionsService } from "../services/SolutionsService";

export const appLayer = SolutionsService.Default;
export const appRuntime = Atom.runtime(appLayer);
