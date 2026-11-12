// services, features, and other libraries
import { makeRpcClient } from "@/domain/helpers";
import { RpcHighScore } from "./requests";

// constants
import { RPC_HIGH_SCORE_PATH } from "@/domain/constants";

export class RpcHighScoreClient extends makeRpcClient("RpcHighScoreClient", RpcHighScore, RPC_HIGH_SCORE_PATH) {}
