// services, features, and other libraries
import { makeRpcClient } from "@/lib/rpc";
import { RpcHighScore } from "./requests";

export class RpcHighScoreClient extends makeRpcClient("RpcHighScoreClient", RpcHighScore, "/api/rpc/high-score") {}
