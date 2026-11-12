// services, features, and other libraries
import { makeRpcClient } from "@/domain/rpc-client";
import { RpcHighScore } from "./requests";

// constants
import { RPC_HIGH_SCORE_PATH } from "./requests";

export class RpcHighScoreClient extends makeRpcClient("RpcHighScoreClient", RpcHighScore, RPC_HIGH_SCORE_PATH) {}
